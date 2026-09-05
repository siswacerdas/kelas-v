/**
 * materi-progress-tracker.js — dimuat di SEMUA halaman detail Materi Ajar, SETELAH
 * auth-guard.js + materi-index.js + materi-nav.js (butuh window.MateriNav.currentEntry()
 * dari materi-nav.js untuk tahu materi mana yang sedang dibuka).
 *
 * Tugasnya: kalau yang membuka halaman ini adalah SISWA (bukan guru — guru sering buka
 * materi untuk mengecek isi, itu bukan "siswa sudah belajar") DAN sudah menghabiskan
 * MINIMAL AMBANG_WAKTU_MS di halaman ini (lihat "TIMER MINIMUM" di bawah), kirim penanda
 * "sudah dibaca" ke server. Dirancang SEPENUHNYA diam-diam (fire-and-forget) — kalau gagal
 * (offline, dsb), TIDAK menampilkan apa pun ke siswa, TIDAK mengganggu pengalaman baca
 * materi sama sekali. Ini cuma pelacakan progres, bukan bagian inti dari materinya.
 *
 * ═══ TIMER MINIMUM (fitur baru, CHANGELOG.md — permintaan eksplisit Arif) ═══
 * Sebelumnya EXP diberikan SEKETIKA halaman dibuka — siswa bisa membuka lalu langsung
 * menutup materi (tanpa membaca sama sekali) dan tetap dapat EXP penuh. Sekarang perlu
 * menghabiskan waktu MINIMAL `AMBANG_WAKTU_MS` (default 1 menit) sebelum penanda "sudah
 * dibaca" terkirim.
 *
 * Yang dihitung adalah WAKTU HALAMAN BENAR-BENAR TERLIHAT (Page Visibility API),
 * BUKAN sekadar "sudah berapa lama sejak dibuka" — kalau siswa pindah tab/aplikasi lain,
 * hitungan waktu DIJEDA, baru lanjut lagi begitu kembali ke tab ini. Ini SENGAJA supaya
 * siswa tidak bisa "mengakali" ambang waktu dengan membuka banyak tab materi sekaligus
 * lalu menunggu 1 menit total sambil tidak benar-benar membaca satu pun.
 *
 * Kalau siswa MENUTUP/PERGI dari halaman SEBELUM ambang waktu tercapai: TIDAK ADA APA PUN
 * yang terkirim (penanda cuma dikirim SAAT ambang tercapai, selagi halaman masih terbuka —
 * bukan dijadwalkan lewat setTimeout yang tetap jalan walau halaman ditinggal/ditutup).
 *
 * ═══ BACA ULANG = EXP KECIL, BUKAN EXP PENUH LAGI (fitur baru, CHANGELOG.md) ═══
 * Server (Code.gs) sekarang membedakan kunjungan PERTAMA ke suatu materi (EXP penuh) dari
 * kunjungan BERIKUTNYA ke MATERI YANG SAMA (EXP kecil, cuma `EXP_ULANG_`) — TIDAK ada
 * perubahan apa pun yang perlu dilakukan di file ini untuk itu; file ini tetap kirim
 * penanda apa adanya tiap kali ambang waktu tercapai (termasuk saat materi yang SAMA dibuka
 * lagi di kunjungan berikutnya), logika bedanya penuh/kecil sepenuhnya ditentukan di server
 * dari riwayat kunjungan, bukan di sini.
 *
 * KENAPA PUNYA Firebase init SENDIRI (bukan pakai ulang auth-guard.js): auth-guard.js SENGAJA
 * tidak membaca Firestore users/{uid} (lihat komentar di file itu — supaya halaman yang tidak
 * butuh role/nama tidak kena round-trip tambahan). Halaman materi TIDAK butuh role/nama untuk
 * dirinya sendiri (auth-guard.js saja sudah cukup untuk gerbang login), tapi skrip INI yang
 * butuh, jadi ambil sendiri di sini — pola yang sama dipakai laporan-guard.js.
 *
 * KENAPA APPS_SCRIPT_URL DITULIS ULANG DI SINI (bukan pakai MPLS_CONFIG dari config.js):
 * supaya halaman materi TIDAK perlu tambah 1 baris <script> lagi untuk config.js (sudah
 * lumayan banyak menyentuh 81 file materi cuma untuk memuat file INI saja). Konsekuensinya:
 * kalau URL Apps Script pernah GANTI (bukan sekadar redeploy versi baru — itu TIDAK mengubah
 * URL, lihat apps-script/README.md), nilai di bawah ini WAJIB ikut diperbarui manual, sama
 * seperti pages/mpls/assets/config.js. **INSIDEN NYATA Agustus 2026**: URL ini sempat basi
 * berhari-hari tanpa disadari (fitur ini "diam-diam" by design, jadi kegagalannya juga diam-
 * diam — tidak ada error yang terlihat siswa/guru) — lihat CHANGELOG.md untuk kronologinya.
 * Kalau EXP materi tidak pernah bertambah padahal siswa sudah baca lama, INI yang PERTAMA
 * dicek: cocokkan URL di sini dengan Manage Deployments di Apps Script.
 */
(function () {
  var APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxdbmKVxG1EaD5jkRbRTg9p-PTDJtx-TR4H5iE8vJf_JMcIsMjMwB8J8WmDvC1LKho5mA/exec";
  var AMBANG_WAKTU_MS = 5 * 1000; // SEMENTARA 5 DETIK UNTUK DEBUG - JANGAN DIPAKAI PRODUKSI

  function kirimProgres(namaSiswa, materiSlug) {
    console.log("[DEBUG tracker] kirimProgres() DIPANGGIL ->", { namaSiswa: namaSiswa, materiSlug: materiSlug });
    try {
      // KEDUA panggilan di bawah SENGAJA ditembak BERSAMAAN (bukan dirangkai .then()),
      // masing-masing dengan keepalive sendiri — supaya KEDUANYA sempat terkirim
      // sebelum browser tutup koneksi kalau siswa langsung pindah halaman (klik
      // "Berikutnya ›" dari materi-nav.js secepatnya, skenario yang MEMANG
      // diantisipasi lewat keepalive). Merangkai .then() pernah dicoba tapi
      // DIBATALKAN — panggilan kedua dalam rangkaian .then() BISA TIDAK PERNAH
      // terkirim kalau halaman keburu dimatikan sebelum promise pertama selesai
      // (keepalive cuma menjaga request yang SUDAH diinisiasi, tidak menjaga sisa
      // kode JS yang belum sempat jalan). Konsekuensinya: sesekali panggilan
      // hitung_gamifikasi bisa membaca sheet SEBELUM baris progres_materi ini
      // selesai tertulis, EXP jadi telat 1 hitungan — TIDAK APA-APA, sembuh sendiri
      // di panggilan berikutnya karena EXP dihitung ulang PENUH tiap kali, bukan
      // di-increment. Ini pertukaran yang jauh lebih aman daripada risiko EXP
      // gagal ter-update sama sekali akibat rangkaian .then() yang terputus.
      fetch(APPS_SCRIPT_URL, {
        method: "POST",
        keepalive: true,
        body: JSON.stringify({
          type: "progres_materi",
          "Nama Siswa": namaSiswa,
          "Materi Slug": materiSlug,
        }),
      }).then(function (r) { return r.text(); }).then(function (txt) {
        console.log("[DEBUG tracker] Respons progres_materi:", txt);
      }).catch(function (err) {
        console.log("[DEBUG tracker] GAGAL fetch progres_materi:", err);
      });

      fetch(APPS_SCRIPT_URL, {
        method: "POST",
        keepalive: true,
        body: JSON.stringify({ type: "hitung_gamifikasi", nama: namaSiswa }),
      }).catch(function () { /* diamkan */ });
    } catch (e) { /* diamkan */ }
  }

  async function init() {
    if (!window.MateriNav) return; // materi-nav.js belum dimuat/gagal — jangan lanjut
    var entry = window.MateriNav.currentEntry();
    if (!entry) { console.log("[DEBUG tracker] currentEntry() TIDAK KETEMU"); return; }
    console.log("[DEBUG tracker] Materi terdeteksi:", entry.judul, "| file:", entry.file);
    var materiSlug = entry.file.replace(/\.html$/i, "");

    // ── Akumulasi waktu TERLIHAT (bukan wall-clock sejak dibuka) — lihat komentar
    // panjang "TIMER MINIMUM" di atas file untuk alasan lengkapnya. ──
    var akumulasiMs = 0;
    var mulaiTerlihat = (document.visibilityState === "visible") ? Date.now() : null;
    var namaSiswaTerdeteksi = null; // null = belum tahu siapa / bukan siswa yang perlu dilacak
    var sudahDikirim = false;

    function totalWaktuTerlihatMs() {
      var total = akumulasiMs;
      if (mulaiTerlihat !== null) total += (Date.now() - mulaiTerlihat);
      return total;
    }

    function cobaKirim() {
      if (sudahDikirim) return;
      if (!namaSiswaTerdeteksi) { console.log("[DEBUG tracker] cobaKirim(): namaSiswaTerdeteksi masih kosong"); return; }
      var sisaMs = AMBANG_WAKTU_MS - totalWaktuTerlihatMs();
      if (sisaMs > 0) { console.log("[DEBUG tracker] cobaKirim(): masih kurang " + Math.ceil(sisaMs/1000) + " detik"); return; }
      sudahDikirim = true;
      console.log("[DEBUG tracker] Ambang waktu TERCAPAI & nama siswa terdeteksi -> mengirim sekarang");
      kirimProgres(namaSiswaTerdeteksi, materiSlug);
    }

    document.addEventListener("visibilitychange", function () {
      if (document.visibilityState === "hidden") {
        if (mulaiTerlihat !== null) {
          akumulasiMs += Date.now() - mulaiTerlihat;
          mulaiTerlihat = null;
        }
      } else {
        mulaiTerlihat = Date.now();
        cobaKirim(); // jaga-jaga kalau ambang sudah lewat pas baru kembali terlihat (jarang, tapi aman)
      }
    });

    // Cek berkala selagi halaman terbuka — SATU-SATUNYA cara penanda ini bisa terkirim
    // (BUKAN dijadwalkan via setTimeout yang tetap jalan walau halaman ditinggal/ditutup).
    // 5 detik dipilih supaya cukup responsif tapi tidak boros — toleransi meleset beberapa
    // detik dari AMBANG_WAKTU_MS tidak masalah untuk kebutuhan ini.
    var intervalId = setInterval(function () {
      cobaKirim();
      if (sudahDikirim) clearInterval(intervalId);
    }, 5000);

    try {
      var { initializeApp, getApps } = await import("https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js");
      var { getAuth, onAuthStateChanged } = await import("https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js");
      var { getFirestore, doc, getDoc } = await import("https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js");

      var firebaseConfig = {
        apiKey:            "AIzaSyBcpuD90Qk7z4Bdxkm5KhXrsKVzZWFc3_k",
        authDomain:        "kelas-v-2026.firebaseapp.com",
        projectId:         "kelas-v-2026",
        storageBucket:     "kelas-v-2026.firebasestorage.app",
        messagingSenderId: "918314271457",
        appId:             "1:918314271457:web:04df91f8cd856be49dada0"
      };
      // v1.2 (bug ditemukan Sept 2026, lihat CHANGELOG.md): SEBELUMNYA selalu
      // initializeApp(firebaseConfig, "materi-progress-tracker") — instance TERPISAH dari
      // yang dipakai auth-guard.js. TERNYATA instance terpisah itu TIDAK BISA melihat sesi
      // Anonymous Auth siswa (kemungkinan beda persistence: browserSessionPersistence yang
      // dipakai saat login vs default browserLocalPersistence pada instance baru) —
      // onAuthStateChanged pada instance terpisah SELALU resolve ke user=null, membuat
      // TIDAK ADA satu pun progres materi yang pernah tercatat sejak fitur ini dibuat,
      // sekalipun URL Apps Script sudah benar. Diperbaiki dengan PAKAI ULANG instance yang
      // SUDAH diinisialisasi auth-guard.js (lewat getApps()[0]) — auth-guard.js dimuat LEBIH
      // DULU di setiap halaman materi dan sudah pasti melihat sesi login dengan benar (pola
      // yang sama persis dengan profil-siswa.html/papan-peringkat.html, yang TERBUKTI jalan).
      // initializeApp() dengan nama unik cuma dipakai sebagai FALLBACK kalau karena suatu
      // sebab belum ada app terinisialisasi sama sekali (seharusnya tidak pernah terjadi
      // kalau auth-guard.js dimuat lebih dulu, tapi jaga-jaga).
      var app  = getApps().length > 0 ? getApps()[0] : initializeApp(firebaseConfig, "materi-progress-tracker");
      var auth = getAuth(app);
      var db   = getFirestore(app);

      console.log("[DEBUG tracker] Firebase app dipakai:", app.name, "| jumlah app aktif:", getApps().length);
      onAuthStateChanged(auth, async function (user) {
        console.log("[DEBUG tracker] onAuthStateChanged terpanggil, user:", user ? (user.uid + (user.isAnonymous ? " (anonim)" : " (email/password)")) : "null (tidak ada yang login)");
        if (!user) return; // auth-guard.js yang mengurus redirect kalau belum login, bukan tugas file ini

        // v1.1 (CHANGELOG.md (v0.11.0) Fase 3): siswa login pakai Firebase
        // Anonymous Auth, TIDAK PERNAH punya dokumen Firestore users/{uid} —
        // jadi cek Firestore role==="siswa" di bawah TIDAK PERNAH cocok untuk
        // mereka lagi (snap.exists() selalu false utk akun anonim). SEBELUM
        // baca Firestore sama sekali, cek dulu apakah ini akun anonim + ada
        // nama tersimpan di sessionStorage (diisi index.html saat login siswa)
        // — kalau iya, itu sudah cukup jadi bukti "ini siswa", langsung lacak.
        console.log("[DEBUG tracker] onAuthStateChanged -> user login terdeteksi, isAnonymous:", user.isAnonymous);
        if (user.isAnonymous) {
          var namaSiswaAnon = sessionStorage.getItem("kelas5_siswa_nama");
          console.log("[DEBUG tracker] Akun anonim, sessionStorage kelas5_siswa_nama =", JSON.stringify(namaSiswaAnon));
          if (!namaSiswaAnon) { console.log("[DEBUG tracker] BERHENTI: sessionStorage nama kosong"); return; }
          namaSiswaTerdeteksi = namaSiswaAnon;
          cobaKirim();
          return;
        }

        // Akun guru/orangtua (email+password) — jalur LAMA tetap dipakai persis
        // seperti sebelumnya, TIDAK diubah (guru kadang buka materi untuk cek isi,
        // itu sengaja TIDAK dilacak sebagai "sudah dibaca siswa").
        var snap = await getDoc(doc(db, "users", user.uid));
        var data = snap.exists() ? snap.data() : {};
        if (data.role !== "siswa" || !data.nama) return; // cuma lacak siswa, bukan guru yang sedang mengecek materi
        namaSiswaTerdeteksi = data.nama;
        cobaKirim();
      });
    } catch (e) { console.log("[DEBUG tracker] GAGAL total memuat Firebase / auth:", e); }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
