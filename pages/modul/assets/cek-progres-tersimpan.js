/**
 * cek-progres-tersimpan.js — dimuat di pages/modul.html (daftar "Ayo Belajar!"), SETELAH
 * modul-index.js. Fitur BARU (Sept 2026 — lihat ANTIREGRESI.md §58 & CHANGELOG.md).
 *
 * LATAR BELAKANG: ANTIREGRESI.md §57 memperbaiki modul-progress-tracker.js supaya BANNER
 * hitung mundur muncul untuk modul yang dibaca MULAI SEKARANG. Tapi Arif bertanya: bagaimana
 * dengan siswa yang SUDAH TERLANJUR membaca modul SEBELUM perbaikan itu, dan progresnya
 * tidak pernah tercatat di server? Menyuruh mereka mengulang SELURUH modul dari awal
 * (menjawab ulang semua kuis) jelas berlebihan kalau mereka sebenarnya sudah pernah sampai
 * ke halaman terakhir.
 *
 * KABAR BAIKNYA: berkat §55 (baca localStorage saat init) + §57 (banner), modul-progress-
 * tracker.js SUDAH BISA mendeteksi "sudah sampai halaman terakhir" LANGSUNG dari localStorage
 * begitu modul dibuka lagi — TANPA perlu mengklik ulang lewat semua halaman/kuis. Siswa
 * CUKUP membuka lagi modul yang sama (di PERANGKAT/PERAMBAN YANG SAMA dipakai belajar
 * sebelumnya — localStorage tidak ikut pindah ke perangkat lain) dan menunggu beberapa
 * menit di halaman terakhir; banner akan langsung menghitung mundur dari sana.
 *
 * MASALAHNYA: siswa (apalagi anak kelas 5) tidak akan ingat modul MANA SAJA dari puluhan
 * yang tersedia yang sudah mereka baca sampai akhir tapi belum tercatat. Fitur ini
 * menjawab itu — memindai localStorage PERANGKAT INI untuk SEMUA modul yang dikenal
 * (dari MODUL_INDEX), dan menunjukkan mana yang statusnya "sudah sampai halaman terakhir
 * tersimpan di perangkat ini" — supaya siswa tinggal klik untuk membuka & menunggu, TANPA
 * perlu mengulang kuis dari awal SAMA SEKALI.
 *
 * KENAPA TIDAK DIBANDINGKAN LANGSUNG DENGAN DATA SERVER (supaya daftar lebih akurat, tidak
 * menyertakan modul yang SEBENARNYA sudah tercatat): endpoint `get_progres_modul` di
 * Code.gs SENGAJA dibatasi hanya untuk guru/orangtua (`wajibAksesLaporan_`) — siswa TIDAK
 * py akses untuk menanyakan progresnya SENDIRI lewat endpoint itu (keputusan keamanan
 * yang sudah ada, bukan dibuat baru di sesi ini). Menambah akses baru untuk siswa
 * menanyakan data dirinya sendiri adalah perubahan arsitektur keamanan tersendiri yang
 * SENGAJA TIDAK dilakukan di sini — solusi di file ini SEPENUHNYA client-side (localStorage
 * saja), jadi cukup aman untuk menampilkan "kemungkinan belum tercatat" TANPA butuh akses
 * baru apa pun. Konsekuensinya: daftar ini BISA SAJA menyertakan modul yang SEBENARNYA
 * sudah tercatat (localStorage tidak tahu itu) — TIDAK MASALAH, karena membuka ulang modul
 * yang sudah tercatat cuma memicu alur "baca ulang" yang SUDAH ADA (EXP_ULANG_ kecil, lihat
 * komentar modul-progress-tracker.js) — sama sekali tidak merusak apa pun, cuma sedikit
 * EXP tambahan yang wajar untuk siswa yang memang membuka ulang materinya.
 */
(function () {
  function ambilKandidat() {
    var index = window.MODUL_INDEX || [];
    var hasil = [];
    index.forEach(function (m) {
      if (typeof m.totalPages !== "number" || !m.slug) return; // entri lama/tidak lengkap, lewati
      var key = "modulProgress:" + m.slug;
      var raw;
      try {
        raw = localStorage.getItem(key);
      } catch (e) {
        return; // localStorage nonaktif/tidak bisa diakses — jangan gagal seluruh fitur karena ini
      }
      if (!raw) return;
      var state;
      try {
        state = JSON.parse(raw);
      } catch (e) {
        return; // tersimpan tapi rusak/bukan JSON — abaikan diam-diam
      }
      if (typeof state.page === "number" && state.page === m.totalPages - 1) {
        hasil.push(m);
      }
    });
    return hasil;
  }

  function esc(str) {
    return String(str || "").replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function renderPanel(kandidat) {
    var isi = kandidat.length > 0
      ? kandidat.map(function (m) {
          return '<div class="cekprog-item">' +
            '<div>' +
              '<div class="ci-judul">' + esc(m.judul) + '</div>' +
              '<div class="ci-mapel">' + esc(m.mapel) + '</div>' +
            '</div>' +
            '<a class="ci-buka" href="modul/' + m.file + '">Buka →</a>' +
          '</div>';
        }).join("")
        : '<div class="cekprog-kosong">Tidak ditemukan modul dengan progres "halaman terakhir" tersimpan di perangkat ini.</div>';

    return '<div class="cekprog-panel">' +
      '<div class="cekprog-catatan">' +
        'Ini memindai penyimpanan PERANGKAT/PERAMBAN INI saja — kalau kamu biasa belajar ' +
        'di HP lain, cek juga dari HP itu. Membuka modul yang SEBENARNYA sudah tercatat ' +
        'TIDAK masalah (tidak merusak apa pun, paling cuma dapat sedikit EXP tambahan).' +
      '</div>' +
      isi +
    '</div>';
  }

  function pasangTombol() {
    var wrap = document.getElementById("cek-progres-wrap");
    if (!wrap) return;
    var terbuka = false;

    var tombol = document.createElement("button");
    tombol.type = "button";
    tombol.className = "cekprog-tombol";
    tombol.textContent = "🔍 Cek Modul yang Mungkin Belum Tercatat";

    var panelWrap = document.createElement("div");

    tombol.addEventListener("click", function () {
      terbuka = !terbuka;
      if (terbuka) {
        var kandidat = ambilKandidat();
        panelWrap.innerHTML = renderPanel(kandidat);
        tombol.textContent = "🔍 Sembunyikan Hasil Pengecekan";
      } else {
        panelWrap.innerHTML = "";
        tombol.textContent = "🔍 Cek Modul yang Mungkin Belum Tercatat";
      }
    });

    wrap.appendChild(tombol);
    wrap.appendChild(panelWrap);
  }

  // Tunggu "role-verified" (event yang sama dipakai skrip utama pages/modul.html) supaya
  // tombol ini muncul BERSAMAAN dengan konten lain, bukan sebelum akses terverifikasi.
  document.addEventListener("role-verified", pasangTombol);
})();
