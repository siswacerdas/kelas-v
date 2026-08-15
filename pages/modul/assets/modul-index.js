/* ============================================================
   MODUL-INDEX.JS — Sumber tunggal daftar Modul Ajar Mandiri (lokal)
   ============================================================
   Beda dari materi-index.js: satu TP = SATU entri (satu file modul.html
   utuh berisi seluruh subunit/tangga), bukan banyak file per pertemuan.

   Setiap kali menambah modul baru:
     1. Cek pages/materi/assets/materi-index.js untuk elemen yang sama —
        pakai kode TP (field "tp") dan "tema" yang SUDAH ada di sana kalau
        TP ini juga (atau akan) punya materi. Kalau TP benar-benar baru
        (belum ada di manapun), konfirmasi dulu ke guru sebelum menambah —
        lihat catatan koreksi di pages/modul/README.md.
     2. Buat folder pages/modul/{mapelSlug}/{tp-slug}/ lalu taruh filenya
        sebagai "modul.html" di situ.
     3. Tambahkan SATU objek baru di array MODUL_INDEX di bawah.
     4. Unggah file modul baru + file ini ke GitHub.
   pages/modul.html otomatis mengikuti isi array ini — tidak perlu
   mengubah file lain.

   Field:
     mapel      — nama tampilan (mis. "Bahasa Indonesia")
     mapelSlug  — HARUS SAMA dengan nama folder mapel di pages/modul/
     mapelColor — var(--m-{slug}), warnanya didefinisikan di pages/modul.html
                  (disalin dari pages/materi/assets/materi.css supaya satu
                  mapel selalu satu warna di seluruh situs)
     mapelIcon  — satu emoji ciri khas mapel
     icon       — (opsional) emoji lebih spesifik per elemen, menimpa mapelIcon
     elemen     — nama elemen CP (mis. "Menyimak")
     tp         — kode TP resmi (mis. "M2"), SAMA dengan yang dipakai di
                  materi-index.js kalau TP ini juga punya materi
     tema       — label elemen+TP, SAMA dengan "tema" di materi-index.js
                  kalau TP ini juga punya materi (supaya terlihat berpasangan)
     urutan     — urutan tampil dalam satu tema (biasanya 1, karena 1 TP = 1 modul)
     judul      — judul unit yang tampil ke siswa
     ringkasan  — 1 kalimat pendek, tampil sebagai deskripsi kartu
     status     — "selesai" atau "segera"
     file       — path relatif dari pages/modul/, mis. "bahasa-indonesia/menyimak-tp2/modul.html"
   ============================================================ */

window.MODUL_INDEX = [
  {
    mapel: "Bahasa Indonesia",
    mapelSlug: "bahasa-indonesia",
    mapelColor: "var(--m-bahasa-indonesia)",
    mapelIcon: "📝",
    icon: "🎬",
    elemen: "Membaca dan Memirsa",
    tp: "MB2",
    tema: "Membaca dan Memirsa · Menganalisis Tayangan (Video/Infografis)",
    urutan: 1,
    judul: "Menganalisis Tayangan",
    ringkasan: "Menangkap informasi eksplisit dari tayangan, menemukan pesan tersirat, membandingkan nilai dari dua tayangan berbeda, lalu menggabungkan semua langkah jadi satu analisis lengkap dengan contoh model dan latihan mandiri.",
    status: "selesai",
    file: "bahasa-indonesia/membaca-memirsa-tp2/modul.html"
  },
  {
    mapel: "Bahasa Indonesia",
    mapelSlug: "bahasa-indonesia",
    mapelColor: "var(--m-bahasa-indonesia)",
    mapelIcon: "📝",
    icon: "🎭",
    elemen: "Berbicara dan Mempresentasikan",
    tp: "B2",
    tema: "Berbicara dan Mempresentasikan · Membacakan Karya Sastra (Siklus Berkelanjutan)",
    urutan: 2,
    judul: "Membacakan Karya Sastra",
    ringkasan: "Enam siklus sepanjang tahun: dari menyesuaikan suara dengan satu rasa yang jelas, menemukan titik pergeseran rasa, membacakan karya sendiri, rasa tersembunyi, tampil ke kelompok besar, sampai memilih karya terbaik untuk tampil di kelas.",
    status: "selesai",
    file: "bahasa-indonesia/berbicara-tp2/modul.html"
  },
  {
    mapel: "Bahasa Indonesia",
    mapelSlug: "bahasa-indonesia",
    mapelColor: "var(--m-bahasa-indonesia)",
    mapelIcon: "📝",
    icon: "🎤",
    elemen: "Berbicara dan Mempresentasikan",
    tp: "B1",
    tema: "Berbicara dan Mempresentasikan · Presentasi Gagasan",
    urutan: 1,
    judul: "Presentasi Gagasan",
    ringkasan: "Berlatih menyampaikan pendapat secara bertahap — dari bicara ke satu teman, menyusun Awal-Isi-Akhir, memakai alat bantu visual, sampai tampil di depan kelas. Dilengkapi Penyusun Poin Gagasan dan Kartu Presentasi.",
    status: "selesai",
    file: "bahasa-indonesia/berbicara-tp1/modul.html"
  },
  {
    mapel: "Bahasa Indonesia",
    mapelSlug: "bahasa-indonesia",
    mapelColor: "var(--m-bahasa-indonesia)",
    mapelIcon: "📝",
    icon: "🎧",
    elemen: "Menyimak",
    tp: "M1",
    tema: "Menyimak · Informasi Penting dari Teks Aural",
    urutan: 1,
    judul: "Menangkap Informasi Penting",
    ringkasan: "Berlatih menunjukkan paham lewat respons non-verbal, memilah informasi Siapa-Di mana-Apa-Kapan, dan mencatat dengan gaya sendiri — ditutup dengan menyimak mandiri.",
    status: "selesai",
    file: "bahasa-indonesia/menyimak-tp1/modul.html"
  },
  {
    mapel: "Bahasa Indonesia",
    mapelSlug: "bahasa-indonesia",
    mapelColor: "var(--m-bahasa-indonesia)",
    mapelIcon: "📝",
    icon: "🎧",
    elemen: "Menyimak",
    tp: "M2",
    tema: "Menyimak · Hubungan Sebab-Akibat & Urutan",
    urutan: 1,
    judul: "Menemukan Sebab dan Akibat",
    ringkasan: "Berlatih mendengarkan dan menemukan hubungan sebab-akibat serta urutan kejadian dalam teks nonsastra — dilengkapi Panggung Dengar, aktivitas interaktif, dan Buku Mini Sebab-Akibat.",
    status: "selesai",
    file: "bahasa-indonesia/menyimak-tp2/modul.html"
  }
];
