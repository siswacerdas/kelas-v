/**
 * modul-progress-tracker.js — dimuat di SEMUA halaman detail Modul, SETELAH skrip inline
 * modul (butuh `window.goToPage` + `window.TOTAL_PAGES` + `window.STORAGE_KEY` sudah
 * didefinisikan — SEMUA 41 file modul.html sudah diverifikasi konsisten memakai pola ini,
 * lihat ANTIREGRESI.md §38) dan SETELAH auth-guard.js (urutan taruh sebenarnya tidak wajib
 * berdampingan, cuma untuk konsistensi visual dengan pola materi).
 *
 * Tugasnya SATU saja, mirip materi-progress-tracker.js: kalau yang membuka adalah SISWA
 * (bukan guru) dan MENCAPAI HALAMAN TERAKHIR modul, kirim penanda "modul selesai" ke server
 * lalu picu hitung ulang EXP. Dirancang SEPENUHNYA diam-diam (fire-and-forget) — kalau gagal
 * (offline, dsb), TIDAK menampilkan apa pun ke siswa, TIDAK mengganggu pengalaman belajar
 * modul sama sekali. Ini cuma pelacakan progres, bukan bagian inti dari modulnya.
 *
 * KENAPA "selesai" = MENCAPAI HALAMAN TERAKHIR (BEDA dari materi yang cukup "dibuka" saja):
 * materi itu bacaan singkat 1 halaman, jadi membuka ≈ membaca sudah representatif. Modul jauh
 * lebih panjang (6-8 halaman + beberapa kuis tertanam di tiap bagian) — sekadar membuka
 * halaman pertama modul TIDAK cukup jadi bukti "sudah dipelajari". Deteksinya dengan
 * membungkus (monkey-patch) `window.goToPage` bawaan tiap file modul: begitu dipanggil dengan
 * n === TOTAL_PAGES - 1 (halaman terakhir, biasanya berjudul "Selesai" di stepper), dianggap
 * selesai.
 *
 * AMAN DIPANGGIL BERULANG KALI: kalau siswa membuka ulang modul yang sudah pernah selesai
 * (progres tersimpan di localStorage per modul, dipulihkan otomatis ke halaman terakhir saat
 * dibuka lagi), `goToPage(TOTAL_PAGES-1)` akan terpanggil lagi setiap kali reload — TIDAK APA-
 * APA, server melakukan UPSERT per (Nama Siswa, Modul Slug) sama seperti progres materi,
 * BUKAN increment, jadi tidak menggandakan EXP.
 *
 * KENAPA PUNYA Firebase init SENDIRI (bukan pakai ulang auth-guard.js): sama alasan persis
 * dengan materi-progress-tracker.js — auth-guard.js SENGAJA tidak membaca Firestore
 * users/{uid} (supaya halaman yang tidak butuh role/nama tidak kena round-trip tambahan).
 *
 * KENAPA APPS_SCRIPT_URL DITULIS ULANG DI SINI: sama alasan persis dengan
 * materi-progress-tracker.js — kalau URL Apps Script pernah GANTI (bukan sekadar redeploy
 * versi baru), nilai di bawah ini WAJIB ikut diperbarui manual di KEDUA file.
 */
(function () {
  var APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzM8gGleSPv-zBpjEQyDTOmia9h9ackGbJsKOexl7WPf8c0RHAx5LWEYeCvL4W-6RgLvg/exec";

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
      // Nama app instance TERPISAH dari materi-progress-tracker.js ("modul-progress-tracker"
      // vs "materi-progress-tracker") — initializeApp() dengan config sama tapi nama sama akan
      // melempar error "duplicate app" kalau suatu saat 2 tracker ini pernah dimuat bersamaan
      // di 1 halaman (tidak terjadi sekarang, tapi jaga-jaga).
      var app  = initializeApp(firebaseConfig, "modul-progress-tracker");
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

    var sudahDikirimSesiIni = false; // cukup 1x deteksi per pemuatan halaman, walau goToPage bisa terpanggil berkali-kali (mis. saat pemulihan progres dari localStorage)
    var _origGoToPage = window.goToPage;
    window.goToPage = function (n) {
      var hasil = _origGoToPage.apply(this, arguments);
      var halamanTerakhir = Math.max(0, Math.min(window.TOTAL_PAGES - 1, n)) === window.TOTAL_PAGES - 1;
      if (halamanTerakhir && !sudahDikirimSesiIni) {
        sudahDikirimSesiIni = true;
        deteksiSiswaLaluKirim(slug);
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
