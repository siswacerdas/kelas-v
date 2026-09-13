/**
 * modul-progress-tracker.js — dimuat di SEMUA halaman detail Modul, SETELAH skrip inline
 * modul (butuh `window.goToPage` + `window.TOTAL_PAGES` + `window.STORAGE_KEY` sudah
 * didefinisikan — SEMUA 41 file modul.html sudah diverifikasi konsisten memakai pola ini,
 * lihat ANTIREGRESI.md §38) dan SETELAH auth-guard.js (urutan taruh sebenarnya tidak wajib
 * berdampingan, cuma untuk konsistensi visual dengan pola materi).
 *
 * Tugasnya: kalau yang membuka adalah SISWA (bukan guru) DAN mencapai HALAMAN TERAKHIR
 * modul DAN sudah menghabiskan MINIMAL `AMBANG_WAKTU_MS` di halaman ini (lihat "TIMER
 * MINIMUM" di bawah — KEDUA syarat ini harus sama-sama terpenuhi, bukan salah satu saja),
 * kirim penanda "modul selesai" ke server lalu picu hitung ulang EXP. Dirancang SEPENUHNYA
 * diam-diam (fire-and-forget) — kalau gagal (offline, dsb), TIDAK menampilkan apa pun ke
 * siswa, TIDAK mengganggu pengalaman belajar modul sama sekali. Ini cuma pelacakan progres,
 * bukan bagian inti dari modulnya.
 *
 * KENAPA "selesai" (SALAH SATU syaratnya) = MENCAPAI HALAMAN TERAKHIR (BEDA dari materi yang
 * cukup "dibuka" saja): materi itu bacaan singkat 1 halaman, jadi membuka ≈ membaca sudah
 * representatif. Modul jauh lebih panjang (6-8 halaman + beberapa kuis tertanam di tiap
 * bagian) — sekadar membuka halaman pertama modul TIDAK cukup jadi bukti "sudah dipelajari".
 * Deteksinya dengan membungkus (monkey-patch) `window.goToPage` bawaan tiap file modul:
 * begitu dipanggil dengan n === TOTAL_PAGES - 1 (halaman terakhir, biasanya berjudul
 * "Selesai" di stepper), syarat ini dianggap terpenuhi.
 *
 * ═══ TIMER MINIMUM (fitur baru, CHANGELOG.md — permintaan eksplisit Arif) ═══
 * Sebelumnya "mencapai halaman terakhir" SAJA sudah cukup — siswa bisa klik "Lanjut →"
 * cepat-cepat tanpa membaca apa pun sampai halaman terakhir dan tetap dapat EXP penuh.
 * Sekarang HARUS JUGA menghabiskan waktu MINIMAL `AMBANG_WAKTU_MS` (default 3 menit — lebih
 * lama dari materi karena modul jauh lebih panjang/mendalam) di halaman ini, dihitung dari
 * WAKTU HALAMAN BENAR-BENAR TERLIHAT (Page Visibility API, DIJEDA kalau pindah tab/aplikasi
 * lain) — bukan sekadar wall-clock sejak dibuka. Sama alasan & mekanisme persis dengan
 * materi-progress-tracker.js, lihat komentar panjang di file itu untuk detail lengkapnya.
 * KEDUA syarat (halaman terakhir + waktu minimum) bisa terpenuhi dalam urutan APA PUN —
 * fungsi `cobaKirim()` dicek ulang dari kedua sisi (tiap kali `goToPage` dipanggil, DAN tiap
 * kali cek berkala waktu) supaya tidak masalah mana yang terpenuhi duluan.
 *
 * ═══ BUKA ULANG MODUL YANG SUDAH SELESAI = EXP KECIL, BUKAN EXP PENUH LAGI ═══
 * Server (Code.gs) sekarang membedakan penyelesaian PERTAMA suatu modul (EXP penuh) dari
 * penyelesaian BERIKUTNYA ke MODUL YANG SAMA (EXP kecil, cuma `EXP_ULANG_`) — TIDAK ada
 * perubahan yang perlu dilakukan di file ini untuk itu, kirim penanda apa adanya, server yang
 * menentukan besaran EXP dari riwayat. CATATAN: kalau siswa membuka ulang modul yang SUDAH
 * pernah selesai, progres tersimpan di localStorage otomatis memulihkan ke halaman terakhir
 * saat dibuka lagi — artinya syarat "halaman terakhir" langsung terpenuhi di awal, TAPI tetap
 * harus menunggu `AMBANG_WAKTU_MS` (tab tetap terbuka & terlihat) sebelum penanda terkirim —
 * jadi tidak bisa didapat instan hanya dengan membuka-tutup cepat.
 *
 * KENAPA PUNYA Firebase init SENDIRI (bukan pakai ulang auth-guard.js): sama alasan persis
 * dengan materi-progress-tracker.js — auth-guard.js SENGAJA tidak membaca Firestore
 * users/{uid} (supaya halaman yang tidak butuh role/nama tidak kena round-trip tambahan).
 *
 * KENAPA APPS_SCRIPT_URL DITULIS ULANG DI SINI: sama alasan persis dengan
 * materi-progress-tracker.js — kalau URL Apps Script pernah GANTI (bukan sekadar redeploy
 * versi baru), nilai di bawah ini WAJIB ikut diperbarui manual di KEDUA file. **INSIDEN NYATA
 * Agustus 2026**: URL ini sempat basi berhari-hari tanpa disadari — lihat CHANGELOG.md.
 */
(function () {
  var APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxdbmKVxG1EaD5jkRbRTg9p-PTDJtx-TR4H5iE8vJf_JMcIsMjMwB8J8WmDvC1LKho5mA/exec";
  var AMBANG_WAKTU_MS = 3 * 60 * 1000; // 3 menit — lebih lama dari materi (1 menit), ubah di sini kalau dirasa kurang/lebih pas

  function slugDariStorageKey() {
    // STORAGE_KEY selalu berformat 'modulProgress:<slug>' di semua 41 file modul.html
    // (sudah diverifikasi konsisten, lihat ANTIREGRESI.md §38).
    if (typeof window.STORAGE_KEY !== "string") return null;
    var idx = window.STORAGE_KEY.indexOf(":");
    return idx >= 0 ? window.STORAGE_KEY.slice(idx + 1) : null;
  }

  function kirimProgres(namaSiswa, modulSlug) {
    try {
      // Sama pola dengan materi-progress-tracker.js: KEDUA panggilan ditembak BERSAMAAN
      // (bukan dirangkai .then()) dengan keepalive masing-masing, lihat komentar panjang
      // di materi-progress-tracker.js untuk alasan lengkapnya.
      fetch(APPS_SCRIPT_URL, {
        method: "POST",
        keepalive: true,
        body: JSON.stringify({
          type: "progres_modul",
          "Nama Siswa": namaSiswa,
          "Modul Slug": modulSlug,
        }),
      }).catch(function () { /* diamkan */ });

      fetch(APPS_SCRIPT_URL, {
        method: "POST",
        keepalive: true,
        body: JSON.stringify({ type: "hitung_gamifikasi", nama: namaSiswa }),
      }).catch(function () { /* diamkan */ });
    } catch (e) { /* diamkan */ }
  }

  async function deteksiSiswaLaluKirim(slug) {
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
      // v1.2 (bug ditemukan Sept 2026, lihat CHANGELOG.md & materi-progress-tracker.js untuk
      // kronologi lengkap): SEBELUMNYA selalu initializeApp(firebaseConfig, "modul-progress-
      // tracker") — instance TERPISAH yang TERNYATA TIDAK BISA melihat sesi Anonymous Auth
      // siswa (onAuthStateChanged selalu resolve ke user=null). Diperbaiki dengan PAKAI ULANG
      // instance yang sudah diinisialisasi auth-guard.js (getApps()[0]) — pola yang sama
      // dengan perbaikan materi-progress-tracker.js.
      var app  = getApps().length > 0 ? getApps()[0] : initializeApp(firebaseConfig, "modul-progress-tracker");
      var auth = getAuth(app);
      var db   = getFirestore(app);

      onAuthStateChanged(auth, async function (user) {
        if (!user) return; // auth-guard.js yang mengurus redirect kalau belum login, bukan tugas file ini

        // Sama persis pola materi-progress-tracker.js — siswa login Anonymous Auth TIDAK
        // PERNAH punya dokumen Firestore users/{uid}, jadi cek nama dari sessionStorage dulu.
        if (user.isAnonymous) {
          var namaSiswaAnon = sessionStorage.getItem("kelas5_siswa_nama");
          if (!namaSiswaAnon) return; // sesi anonim nyasar tanpa nama, jangan lacak apa pun
          kirimProgres(namaSiswaAnon, slug);
          return;
        }

        // Akun guru/orangtua (email+password) — guru kadang buka modul untuk cek isi, itu
        // sengaja TIDAK dilacak sebagai "sudah diselesaikan siswa".
        var snap = await getDoc(doc(db, "users", user.uid));
        var data = snap.exists() ? snap.data() : {};
        if (data.role !== "siswa" || !data.nama) return;
        kirimProgres(data.nama, slug);
      });
    } catch (e) { /* diamkan — kegagalan memuat Firebase tidak boleh mengganggu tampilan modul */ }
  }

  function init() {
    if (typeof window.goToPage !== "function" || typeof window.TOTAL_PAGES !== "number") return; // pola modul tidak dikenali, jangan lanjut
    var slug = slugDariStorageKey();
    if (!slug) return;

    // ── Akumulasi waktu TERLIHAT + status "sudah mencapai halaman terakhir" — dua syarat
    // INDEPENDEN, penanda cuma terkirim kalau KEDUANYA true, terlepas urutan mana duluan. ──
    var akumulasiMs = 0;
    var mulaiTerlihat = (document.visibilityState === "visible") ? Date.now() : null;
    var sudahMencapaiAkhir = false;
    var sudahDikirim = false;

    // v1.3 (BUG NYATA ditemukan Sept 2026, lihat ANTIREGRESI.md §55 & CHANGELOG.md):
    // PEMULIHAN HALAMAN TERAKHIR SAAT MODUL DIBUKA ULANG TIDAK PERNAH TERDETEKSI DI SINI.
    // Kronologi: hampir semua file modul.html memulihkan posisi baca (goToPage(halaman
    // tersimpan)) SECARA SINKRON saat skrip inline modul dieksekusi — pada SEBAGIAN file,
    // ini terjadi SEBELUM tag <script src=".../modul-progress-tracker.js"> di bawahnya
    // sempat jalan sama sekali; pada sebagian file LAIN, restore itu ditunda ke event
    // "user-verified" yang (biasanya) baru terpicu SETELAH file ini sempat menempel monkey-
    // patch-nya ke window.goToPage lewat DOMContentLoaded — jadi urutannya TIDAK KONSISTEN
    // antar file, dan pada pola PERTAMA, monkey-patch belum terpasang saat restore terjadi.
    // Akibatnya: siswa yang sudah mencapai halaman terakhir modul di sesi SEBELUMNYA (tapi
    // sesi itu berakhir sebelum genap AMBANG_WAKTU_MS di halaman itu — sangat wajar terjadi,
    // mis. tab/HP tertutup) lalu MEMBUKA ULANG modul yang sama untuk menghabiskan sisa
    // waktunya, TIDAK PERNAH tercatat selesai — karena `sudahMencapaiAkhir` di sesi baru ini
    // tetap `false` selamanya (goToPage(halaman-terakhir) yang terpanggil saat restore adalah
    // versi ASLI yang BELUM di-patch, bukan versi yang di-monkey-patch di bawah, jadi flag
    // ini tidak pernah ke-set walau siswa sudah TERLIHAT diam di halaman terakhir menunggu).
    // Inilah laporan Arif: siswa merasa "sudah selesai baca modul" tapi laporan orang tua/
    // guru tidak pernah menunjukkan modul itu selesai.
    // PERBAIKAN: baca localStorage (`STORAGE_KEY`) LANGSUNG di sini saat init, sebelum
    // bergantung sepenuhnya pada intersepsi goToPage — kalau halaman TERSIMPAN sudah
    // halaman terakhir, langsung anggap syarat ini terpenuhi, TIDAK PEDULI pola restore
    // modul yang mana atau urutan skripnya. Syarat waktu minimum (AMBANG_WAKTU_MS) TETAP
    // dihitung dari waktu TERLIHAT di SESI INI seperti biasa (tidak berubah) — jadi siswa
    // tetap tidak bisa dapat EXP instan hanya dengan buka-tutup cepat, cuma syarat "sampai
    // halaman terakhir"-nya sekarang benar-benar akurat sejak awal sesi.
    try {
      var stateTersimpan = JSON.parse(localStorage.getItem(window.STORAGE_KEY) || "{}");
      if (typeof stateTersimpan.page === "number" && stateTersimpan.page === window.TOTAL_PAGES - 1) {
        sudahMencapaiAkhir = true;
      }
    } catch (e) { /* localStorage rusak/nonaktif/bukan JSON — abaikan, anggap belum sampai akhir */ }
    if (sudahMencapaiAkhir) mulaiBanner_(); // tampilkan banner SEGERA kalau restore langsung ke halaman terakhir
    function totalWaktuTerlihatMs() {
      var total = akumulasiMs;
      if (mulaiTerlihat !== null) total += (Date.now() - mulaiTerlihat);
      return total;
    }

    // v1.4 (BUG NYATA ditemukan Sept 2026, lihat ANTIREGRESI.md §57 & CHANGELOG.md): §55 DI
    // ATAS TERNYATA TIDAK CUKUP — Arif melaporkan siswa MASIH kehilangan penyelesaian modul
    // SETELAH §55 di-deploy. Akar masalah SEBENARNYA jauh lebih mendasar dan lebih sering
    // terjadi daripada skenario buka-ulang di §55: SELURUH mekanisme timer 3 menit di atas
    // 100% DIAM-DIAM — TIDAK ADA petunjuk visual apa pun ke siswa bahwa mereka harus tetap
    // di halaman ini. Sementara itu, badge "100% selesai" di header tiap modul.html dihitung
    // dari HAL YANG SAMA SEKALI BERBEDA (`updateProgress()` di tiap modul.html, dari jumlah
    // kuis/checklist yang sudah dijawab benar) — TIDAK ADA hubungannya dengan
    // `sudahMencapaiAkhir`/timer di file ini. Akibatnya: siswa menjawab semua kuis dengan
    // benar, melihat "100% selesai" di header, MENGIRA sudah tuntas, lalu WAJAR SAJA
    // menutup tab/pindah pelajaran — padahal timer 3 menit ini belum genap sama sekali,
    // jadi penanda "modul selesai" TIDAK PERNAH terkirim. Ini pola kegagalan yang JAUH lebih
    // umum daripada skenario buka-ulang §55 (tidak perlu menutup-buka ulang sama sekali,
    // cukup 1 sesi normal yang berakhir sebelum genap 3 menit di halaman terakhir).
    // PERBAIKAN: tambahkan banner mengambang di bawah layar begitu halaman terakhir
    // tercapai, menunjukkan hitung mundur waktu tersisa secara terus terang — supaya siswa
    // TAHU harus menunggu, alih-alih mengira sudah selesai dari badge "100%" yang menyesatkan
    // itu. Banner ini PELENGKAP (tidak mengubah aturan pengiriman sama sekali) — cuma
    // membuat proses yang SEBELUMNYA sepenuhnya diam-diam menjadi terlihat.
    var bannerEl = null;
    var bannerTickId = null;

    function formatSisaWaktu_(ms) {
      var detik = Math.max(0, Math.ceil(ms / 1000));
      var menit = Math.floor(detik / 60);
      var sisaDetik = detik % 60;
      return menit + ":" + (sisaDetik < 10 ? "0" : "") + sisaDetik;
    }

    function pastikanBanner_() {
      if (bannerEl) return bannerEl;
      bannerEl = document.createElement("div");
      bannerEl.id = "_modulSelesaiBanner";
      // Gaya ditulis INLINE (bukan class CSS) SENGAJA — supaya banner ini konsisten
      // tampil di SEMUA 43 file modul.html tanpa bergantung pada CSS masing-masing file
      // (yang bisa beda-beda/tidak lengkap), dan tidak berisiko bentrok nama class.
      bannerEl.setAttribute("style",
        "position:fixed;left:50%;bottom:18px;transform:translateX(-50%);z-index:99999;" +
        "background:#b45309;color:#fff;padding:10px 18px;border-radius:999px;" +
        "font-family:system-ui,-apple-system,sans-serif;font-size:13.5px;font-weight:600;" +
        "box-shadow:0 4px 16px rgba(0,0,0,.25);text-align:center;max-width:92vw;" +
        "line-height:1.4;transition:opacity .3s ease;pointer-events:none;");
      document.body.appendChild(bannerEl);
      return bannerEl;
    }

    function hapusBanner_() {
      if (!bannerEl) return;
      var el = bannerEl;
      bannerEl = null;
      el.style.opacity = "0";
      setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 350);
    }

    function updateBannerTeks_() {
      if (sudahDikirim) {
        if (bannerTickId) { clearInterval(bannerTickId); bannerTickId = null; }
        var elSukses = pastikanBanner_();
        elSukses.style.background = "#166534";
        elSukses.textContent = "✅ Modul selesai tercatat! Kerja bagus.";
        setTimeout(hapusBanner_, 4000);
        return;
      }
      var sisa = AMBANG_WAKTU_MS - totalWaktuTerlihatMs();
      var el = pastikanBanner_();
      el.style.background = "#b45309";
      el.textContent = sisa > 0
        ? "🎉 Halaman terakhir! Tetap di sini " + formatSisaWaktu_(sisa) + " lagi untuk menandai modul ini selesai."
        : "⏳ Menandai selesai…";
    }

    function mulaiBanner_() {
      updateBannerTeks_();
      if (!bannerTickId) bannerTickId = setInterval(updateBannerTeks_, 1000);
    }

    function cobaKirim() {
      if (sudahDikirim) return;
      if (!sudahMencapaiAkhir) return;
      if (totalWaktuTerlihatMs() < AMBANG_WAKTU_MS) return;
      sudahDikirim = true;
      updateBannerTeks_(); // ganti banner jadi pesan sukses sebelum menghilang otomatis
      deteksiSiswaLaluKirim(slug);
    }

    document.addEventListener("visibilitychange", function () {
      if (document.visibilityState === "hidden") {
        if (mulaiTerlihat !== null) {
          akumulasiMs += Date.now() - mulaiTerlihat;
          mulaiTerlihat = null;
        }
      } else {
        mulaiTerlihat = Date.now();
        cobaKirim(); // jaga-jaga kalau ambang sudah lewat pas baru kembali terlihat
      }
    });

    // Cek berkala selagi halaman terbuka — jaring pengaman kalau syarat waktu baru terpenuhi
    // BELAKANGAN setelah goToPage(terakhir) sempat dipanggil (skenario: sampai halaman
    // terakhir cepat, lalu diam saja menunggu di situ sampai ambang waktu terlewati).
    var intervalId = setInterval(function () {
      cobaKirim();
      if (sudahDikirim) clearInterval(intervalId);
    }, 5000);

    var _origGoToPage = window.goToPage;
    window.goToPage = function (n) {
      var hasil = _origGoToPage.apply(this, arguments);
      var halamanTerakhir = Math.max(0, Math.min(window.TOTAL_PAGES - 1, n)) === window.TOTAL_PAGES - 1;
      if (halamanTerakhir) {
        sudahMencapaiAkhir = true;
        mulaiBanner_();
        cobaKirim();
      } else if (bannerEl) {
        // Siswa mundur/pindah dari halaman terakhir SEBELUM ambang waktu terlewati (mis.
        // ingin lihat ulang halaman sebelumnya) — sembunyikan banner supaya tidak
        // menampilkan hitung mundur untuk halaman yang sudah tidak sedang dilihat. Kalau
        // siswa balik lagi ke halaman terakhir, banner akan muncul lagi dari cabang di atas.
        hapusBanner_();
      }
      return hasil;
    };
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
