/**
 * materi-progress-tracker.js — dimuat di SEMUA halaman detail Materi Ajar, SETELAH
 * auth-guard.js + materi-index.js + materi-nav.js (butuh window.MateriNav.currentEntry()
 * dari materi-nav.js untuk tahu materi mana yang sedang dibuka).
 *
 * Tugasnya SATU saja: kalau yang membuka halaman ini adalah SISWA (bukan guru — guru sering
 * buka materi untuk mengecek isi, itu bukan "siswa sudah belajar"), kirim penanda "sudah
 * dibaca" ke server. Dirancang SEPENUHNYA diam-diam (fire-and-forget) — kalau gagal (offline,
 * dsb), TIDAK menampilkan apa pun ke siswa, TIDAK mengganggu pengalaman baca materi sama
 * sekali. Ini cuma pelacakan progres, bukan bagian inti dari materinya.
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
 * seperti pages/mpls/assets/config.js.
 */
(function () {
  var APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzF3Ln0L8rOkAl48YsJKeXCiV7CUS8mu37xAyIMQUdkFf1puCiOInHyA0ONyXwkYJlWdA/exec";

  function kirimProgres(namaSiswa, materiSlug) {
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
      }).catch(function () { /* diamkan */ });

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
    if (!entry) return; // halaman ini tidak dikenali materi-index.js, tidak ada yang dilacak

    try {
      var { initializeApp } = await import("https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js");
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
      var app  = initializeApp(firebaseConfig, "materi-progress-tracker"); // nama app terpisah,
        // supaya tidak bentrok kalau halaman ini SUATU SAAT juga memuat instance Firebase lain
        // (mis. auth-guard.js) — initializeApp() dengan config sama tapi tanpa nama unik akan
        // melempar error "duplicate app" pada instance kedua.
      var auth = getAuth(app);
      var db   = getFirestore(app);

      onAuthStateChanged(auth, async function (user) {
        if (!user) return; // auth-guard.js yang mengurus redirect kalau belum login, bukan tugas file ini

        // v1.1 (CHANGELOG.md (v0.11.0) Fase 3): siswa login pakai Firebase
        // Anonymous Auth, TIDAK PERNAH punya dokumen Firestore users/{uid} —
        // jadi cek Firestore role==="siswa" di bawah TIDAK PERNAH cocok untuk
        // mereka lagi (snap.exists() selalu false utk akun anonim). SEBELUM
        // baca Firestore sama sekali, cek dulu apakah ini akun anonim + ada
        // nama tersimpan di sessionStorage (diisi index.html saat login siswa)
        // — kalau iya, itu sudah cukup jadi bukti "ini siswa", langsung lacak.
        if (user.isAnonymous) {
          var namaSiswaAnon = sessionStorage.getItem("kelas5_siswa_nama");
          if (!namaSiswaAnon) return; // sesi anonim nyasar tanpa nama, jangan lacak apa pun
          var materiSlugAnon = entry.file.replace(/\.html$/i, "");
          kirimProgres(namaSiswaAnon, materiSlugAnon);
          return;
        }

        // Akun guru/orangtua (email+password) — jalur LAMA tetap dipakai persis
        // seperti sebelumnya, TIDAK diubah (guru kadang buka materi untuk cek isi,
        // itu sengaja TIDAK dilacak sebagai "sudah dibaca siswa").
        var snap = await getDoc(doc(db, "users", user.uid));
        var data = snap.exists() ? snap.data() : {};
        if (data.role !== "siswa" || !data.nama) return; // cuma lacak siswa, bukan guru yang sedang mengecek materi
        var materiSlug = entry.file.replace(/\.html$/i, "");
        kirimProgres(data.nama, materiSlug);
      });
    } catch (e) { /* diamkan — kegagalan memuat Firebase tidak boleh mengganggu tampilan materi */ }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
