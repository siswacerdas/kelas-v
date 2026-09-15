/**
 * pustaka-belajar-progress-tracker.js — dimuat di pages/pustaka-belajar/baca.html, SETELAH
 * role-guard.js + pustaka-belajar-baca.js.
 *
 * Tugasnya: SAMA PERSIS dengan materi-progress-tracker.js (lihat file itu untuk latar
 * belakang lengkap "TIMER MINIMUM" & "BACA ULANG = EXP KECIL") — kalau yang membuka
 * halaman ini SISWA (bukan guru/orang tua yang sedang mengecek isi) DAN sudah menghabiskan
 * MINIMAL AMBANG_WAKTU_MS waktu BENAR-BENAR TERLIHAT (Page Visibility API, dijeda saat
 * pindah tab) membaca file ini, kirim penanda "sudah dibaca" ke server. Fire-and-forget
 * sepenuhnya diam-diam — gagal (offline, dsb) TIDAK menampilkan apa pun ke siswa. Lihat
 * ANTIREGRESI.md §55.
 *
 * BEDA dari materi-progress-tracker.js (kenapa file ini LEBIH SEDERHANA, bukan disalin
 * mentah-mentah — lihat pelajaran §54 soal salin-tempel yang lupa disinkronkan, jadi
 * sengaja ditulis ulang minimal, bukan diwarisi apa adanya):
 * 1. TIDAK perlu init Firebase sendiri. materi-progress-tracker.js terpaksa begitu karena
 *    auth-guard.js (dipakai halaman materi) SENGAJA tidak membaca Firestore users/{uid}.
 *    Halaman ini (baca.html) sudah memakai role-guard.js yang SUDAH membaca users/{uid}
 *    (kalau perlu) dan langsung memancarkan event "role-verified" berisi {role, nama} —
 *    jadi tinggal DENGARKAN event yang sudah ada, tidak perlu round-trip Firestore kedua.
 * 2. TIDAK menulis ulang APPS_SCRIPT_URL sendiri (beda dari materi-progress-tracker.js yang
 *    sengaja menulis ulang supaya tidak perlu tambah <script> config.js di 81 file materi
 *    sekaligus — trade-off itu TIDAK berlaku di sini karena baca.html cuma 1 file, dan
 *    SUDAH memuat pages/mpls/assets/config.js lebih dulu untuk pustaka-belajar-baca.js
 *    sendiri). Dipakai ulang lewat MPLS_CONFIG.APPS_SCRIPT_URL — kalau URL Apps Script
 *    pernah berubah, cukup diperbarui 1 tempat (config.js), TIDAK ada risiko basi terpisah
 *    seperti insiden Agustus 2026 di materi-progress-tracker.js.
 * 3. Timer BARU MULAI setelah event "pb-dokumen-siap" (dipancarkan pustaka-belajar-baca.js
 *    SETELAH halaman pertama PDF benar-benar dirender) — BUKAN sejak skrip ini dimuat.
 *    Materi Ajar adalah HTML statis yang sudah tampil penuh begitu DOMContentLoaded, tapi
 *    di sini dokumennya diambil ASYNC (relay Google + parsing PDF, bisa beberapa detik) —
 *    kalau timer dimulai dari DOMContentLoaded seperti materi, waktu fetch/loading ikut
 *    "dihitung sebagai membaca" padahal siswa belum melihat apa pun.
 */
(function () {
  var AMBANG_WAKTU_MS = 60 * 1000; // 1 menit — sama dgn nilai PRODUKSI yang dimaksud materi-progress-tracker.js

  function kirimProgres(namaSiswa, pustakaId) {
    if (typeof MPLS_CONFIG === "undefined" || !MPLS_CONFIG.APPS_SCRIPT_URL) return; // diam-diam, lihat komentar di atas file
    try {
      // KEDUA panggilan SENGAJA ditembak BERSAMAAN (bukan dirangkai .then()) — alasan
      // PERSIS sama dengan materi-progress-tracker.js: supaya keduanya sempat terkirim
      // (lewat keepalive) walau siswa langsung pindah halaman (klik "← Pustaka Belajar")
      // secepatnya setelah ambang waktu tercapai.
      fetch(MPLS_CONFIG.APPS_SCRIPT_URL, {
        method: "POST",
        keepalive: true,
        body: JSON.stringify({
          type: "progres_pustaka",
          "Nama Siswa": namaSiswa,
          "Pustaka ID": pustakaId,
        }),
      }).catch(function () { /* diamkan — lihat komentar file di atas */ });

      fetch(MPLS_CONFIG.APPS_SCRIPT_URL, {
        method: "POST",
        keepalive: true,
        body: JSON.stringify({ type: "hitung_gamifikasi", nama: namaSiswa }),
      }).catch(function () { /* diamkan */ });
    } catch (e) { /* diamkan */ }
  }

  function init() {
    var akumulasiMs = 0;
    var mulaiTerlihat = null; // baru diisi setelah "pb-dokumen-siap" (lihat catatan di atas)
    var namaSiswaTerdeteksi = null; // null = belum tahu siapa / bukan siswa yang perlu dilacak
    var pustakaId = null;
    var dokumenSiap = false;
    var sudahDikirim = false;
    var intervalId = null;

    function totalWaktuTerlihatMs() {
      var total = akumulasiMs;
      if (mulaiTerlihat !== null) total += (Date.now() - mulaiTerlihat);
      return total;
    }

    function cobaKirim() {
      if (sudahDikirim || !dokumenSiap) return;
      if (!namaSiswaTerdeteksi || !pustakaId) return;
      if (totalWaktuTerlihatMs() < AMBANG_WAKTU_MS) return;
      sudahDikirim = true;
      if (intervalId) clearInterval(intervalId);
      kirimProgres(namaSiswaTerdeteksi, pustakaId);
    }

    document.addEventListener("visibilitychange", function () {
      if (!dokumenSiap) return; // belum mulai menghitung sama sekali, lihat catatan di atas file
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

    // "role-verified" (dipancarkan role-guard.js) BISA terpanggil lebih dari sekali untuk
    // sesi yang sama (lihat catatan v1.5 di role-guard.js) — aman dipanggil ulang di sini,
    // cobaKirim() sendiri sudah dijaga idempoten lewat flag sudahDikirim.
    document.addEventListener("role-verified", function (e) {
      var detail = e.detail || {};
      if (detail.role !== "siswa" || !detail.nama) return; // cuma lacak siswa, sama seperti materi-progress-tracker.js
      namaSiswaTerdeteksi = detail.nama;
      cobaKirim();
    });

    // "pb-dokumen-siap" (dipancarkan pustaka-belajar-baca.js setelah halaman pertama PDF
    // benar-benar dirender) — momen timer MULAI berjalan, lihat catatan panjang di atas file.
    document.addEventListener("pb-dokumen-siap", function (e) {
      if (dokumenSiap) return; // cuma dipancarkan sekali per pemuatan halaman, jaga-jaga saja
      dokumenSiap = true;
      pustakaId = (e.detail && e.detail.id) || null;
      mulaiTerlihat = (document.visibilityState === "visible") ? Date.now() : null;
      cobaKirim(); // jaga-jaga kalau siswa ternyata sudah terverifikasi lebih dulu

      // Cek berkala selagi halaman terbuka — SATU-SATUNYA cara penanda ini bisa terkirim,
      // sama alasan persis dengan materi-progress-tracker.js (bukan setTimeout yang tetap
      // jalan walau halaman ditinggal/ditutup).
      intervalId = setInterval(cobaKirim, 5000);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
