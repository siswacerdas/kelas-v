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
    mapel: "IPAS",
    mapelSlug: "ipas",
    mapelColor: "var(--m-ipas)",
    mapelIcon: "🔬",
    icon: "🧩",
    elemen: "Pemahaman IPAS · Kelompok B · Rujukan Lintas Mapel",
    tp: "budaya-tp1",
    tema: "Sejarah dan Keragaman Budaya · Sintesis Lintas Topik",
    urutan: 1,
    judul: "Sejarah dan Keragaman Budaya Sekitar",
    ringkasan: "Bagian penutup Kelompok B! Menyatukan Peta Asal Keluarga Kelas Kami (Pendidikan Pancasila) dengan Letak Geografis dan Ekonomi Masyarakat (IPAS) menjadi satu pemahaman utuh, sambil menumbuhkan rasa ingin tahu tentang sejarah dan budaya sekitar.",
    status: "selesai",
    file: "ipas/budaya-tp1/modul.html"
  },
  {
    mapel: "IPAS",
    mapelSlug: "ipas",
    mapelColor: "var(--m-ipas)",
    mapelIcon: "🔬",
    icon: "🗺️",
    elemen: "Pemahaman IPAS · Kelompok B (Sosial-Informasional)",
    tp: "geografis-tp1",
    tema: "Letak Geografis Indonesia",
    urutan: 1,
    judul: "Letak dan Kondisi Geografis Indonesia",
    ringkasan: "Menandai posisi Indonesia di antara dua benua dan dua samudra, lalu memakai kemampuan membaca sistem berpetak (koordinat) dari Matematika untuk menentukan lokasi pulau-pulau besar Indonesia.",
    status: "selesai",
    file: "ipas/geografis-tp1/modul.html"
  },
  {
    mapel: "IPAS",
    mapelSlug: "ipas",
    mapelColor: "var(--m-ipas)",
    mapelIcon: "🔬",
    icon: "🏪",
    elemen: "Pemahaman IPAS · Kelompok B (Sosial-Informasional)",
    tp: "ekonomi-tp1",
    tema: "Kegiatan Ekonomi Masyarakat",
    urutan: 1,
    judul: "Kegiatan Ekonomi Masyarakat",
    ringkasan: "Mengamati usaha-usaha di sekitar rumah/sekolah, lalu mengklasifikasikannya ke kategori produksi, distribusi, dan konsumsi berdasarkan pengamatan nyata — bukan daftar umum dari buku.",
    status: "selesai",
    file: "ipas/ekonomi-tp1/modul.html"
  },
  {
    mapel: "IPAS",
    mapelSlug: "ipas",
    mapelColor: "var(--m-ipas)",
    mapelIcon: "🔬",
    icon: "🫀",
    elemen: "Pemahaman IPAS · Kelompok A (Sains-Eksperimental)",
    tp: "organ-tubuh-tp1",
    tema: "Sistem Organ Tubuh dan Kesehatan · Respons Tubuh terhadap Aktivitas Fisik",
    urutan: 2,
    judul: "Respons Tubuh terhadap Aktivitas Fisik",
    ringkasan: "Mengukur detak jantung sendiri sebelum dan sesudah beraktivitas fisik (lompat tali/lari di tempat), membandingkan hasil dengan teman sekelas, sampai merefleksikan kaitannya dengan kebiasaan menjaga kesehatan pribadi.",
    status: "selesai",
    file: "ipas/organ-tubuh-tp1/modul.html"
  },
  {
    mapel: "IPAS",
    mapelSlug: "ipas",
    mapelColor: "var(--m-ipas)",
    mapelIcon: "🔬",
    icon: "🫁",
    elemen: "Pemahaman IPAS · Kelompok A · Pengetahuan Pendukung",
    tp: "organ-tubuh-tp2",
    tema: "Sistem Organ Tubuh dan Kesehatan · Struktur dan Fungsi Dasar Organ",
    urutan: 1,
    judul: "Struktur dan Fungsi Dasar Organ Tubuh",
    ringkasan: "Mengenal letak dan fungsi dasar jantung, paru-paru, dan organ pencernaan lewat diagram/model — bekal pengetahuan sebelum mengukur detak jantung sendiri di modul berikutnya.",
    status: "selesai",
    file: "ipas/organ-tubuh-tp2/modul.html"
  },
  {
    mapel: "IPAS",
    mapelSlug: "ipas",
    mapelColor: "var(--m-ipas)",
    mapelIcon: "🔬",
    icon: "🌱",
    elemen: "Pemahaman IPAS · Kelompok A · Proyek Andalan (Bagian 2)",
    tp: "ekosistem-tp2",
    tema: "Hubungan Biotik-Abiotik dan Ekosistem · Percobaan Pertumbuhan Tanaman",
    urutan: 2,
    judul: "Percobaan Pertumbuhan Tanaman",
    ringkasan: "Proyek andalan IPAS Kelas 5A! Merancang percobaan sendiri, menjaga tanaman selama 1-2 minggu lewat Jurnal Pengamatan Berkala, mengevaluasi hasil, sampai menyajikan kesimpulan yang didukung data nyata.",
    status: "selesai",
    file: "ipas/ekosistem-tp2/modul.html"
  },
  {
    mapel: "IPAS",
    mapelSlug: "ipas",
    mapelColor: "var(--m-ipas)",
    mapelIcon: "🔬",
    icon: "🔍",
    elemen: "Pemahaman IPAS · Kelompok A · Proyek Andalan (Bagian 1)",
    tp: "ekosistem-tp1",
    tema: "Hubungan Biotik-Abiotik dan Ekosistem · Observasi dan Prediksi Hubungan",
    urutan: 1,
    judul: "Observasi Biotik-Abiotik dan Prediksi Hubungan",
    ringkasan: "Bagian pembuka proyek andalan Ekosistem: membedakan komponen biotik dan abiotik lewat ciri hidup (bukan sekadar bergerak/diam), mencatat hasil observasi area sekolah, lalu menyusun pertanyaan dan dugaan ilmiah.",
    status: "selesai",
    file: "ipas/ekosistem-tp1/modul.html"
  },
  {
    mapel: "IPAS",
    mapelSlug: "ipas",
    mapelColor: "var(--m-ipas)",
    mapelIcon: "🔬",
    icon: "🔊",
    elemen: "Pemahaman IPAS · Kelompok A (Sains-Eksperimental)",
    tp: "bunyi-cahaya-tp1",
    tema: "Gelombang Bunyi dan Cahaya",
    urutan: 1,
    judul: "Eksperimen Bunyi dan Cahaya",
    ringkasan: "Berpikir seperti ilmuwan: mengamati sumber bunyi dan pantulan cahaya, memprediksi dengan alasan, mencoba telepon kaleng dan senter, membandingkan hasil, sampai menjelaskan kaitannya dengan kehidupan sehari-hari.",
    status: "selesai",
    file: "ipas/bunyi-cahaya-tp1/modul.html"
  },
  {
    mapel: "Bahasa Indonesia",
    mapelSlug: "bahasa-indonesia",
    mapelColor: "var(--m-bahasa-indonesia)",
    mapelIcon: "📝",
    icon: "🎨",
    elemen: "Menulis",
    tp: "TL-Imajinasi",
    tema: "Menulis · Menulis Cerita Imajinatif",
    urutan: 4,
    judul: "Menulis Cerita Imajinatif",
    ringkasan: "TP terakhir Bahasa Indonesia Kelas 5! Proyek menulis berkelanjutan: melontarkan ide liar, menciptakan tokoh & latar, menyusun alur, memperkaya dengan kata konotatif, sampai cerita imajinatif mandiri — ditutup rangkuman perjalanan setahun.",
    status: "selesai",
    file: "bahasa-indonesia/menulis-imajinasi/modul.html"
  },
  {
    mapel: "Bahasa Indonesia",
    mapelSlug: "bahasa-indonesia",
    mapelColor: "var(--m-bahasa-indonesia)",
    mapelIcon: "📝",
    icon: "💭",
    elemen: "Menulis",
    tp: "TL-Gagasan",
    tema: "Menulis · Menulis Pendapat (Gagasan)",
    urutan: 3,
    judul: "Menulis Pendapat (Gagasan)",
    ringkasan: "Proyek menulis berkelanjutan: membedakan fakta dan pendapat, berani berpendapat dengan tegas, menambahkan alasan, memperkuatnya dengan karena/sehingga/meskipun, sampai gagasan lengkap mandiri sebagai penilaian akhir.",
    status: "selesai",
    file: "bahasa-indonesia/menulis-gagasan/modul.html"
  },
  {
    mapel: "Bahasa Indonesia",
    mapelSlug: "bahasa-indonesia",
    mapelColor: "var(--m-bahasa-indonesia)",
    mapelIcon: "📝",
    icon: "🔍",
    elemen: "Menulis",
    tp: "TL-Pengamatan",
    tema: "Menulis · Menulis Laporan Pengamatan",
    urutan: 2,
    judul: "Menulis Laporan Pengamatan",
    ringkasan: "Proyek menulis berkelanjutan: mencatat hasil pengamatan panca indra, mengubahnya jadi kalimat, menyusun urutan sistematis, melaporkan peristiwa dengan kalimat majemuk waktu, sampai laporan pengamatan mandiri sebagai penilaian akhir.",
    status: "selesai",
    file: "bahasa-indonesia/menulis-pengamatan/modul.html"
  },
  {
    mapel: "Bahasa Indonesia",
    mapelSlug: "bahasa-indonesia",
    mapelColor: "var(--m-bahasa-indonesia)",
    mapelIcon: "📝",
    icon: "✍️",
    elemen: "Menulis",
    tp: "TL-Pengalaman",
    tema: "Menulis · Menulis dari Pengalaman Pribadi",
    urutan: 1,
    judul: "Menulis dari Pengalaman Pribadi",
    ringkasan: "Proyek menulis berkelanjutan: memilih pengalaman yang 'berbahan cerita', menyusun kerangka Awal-Tengah-Akhir, menulis draf pertama, lalu merevisinya dengan detail indrawi jadi cerita yang hidup — sekaligus penilaian akhir TP.",
    status: "selesai",
    file: "bahasa-indonesia/menulis-pengalaman/modul.html"
  },
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
  },
  {
    mapel: "Matematika",
    mapelSlug: "matematika",
    mapelColor: "var(--m-matematika)",
    mapelIcon: "🔢",
    icon: "🔟",
    elemen: "Bilangan",
    tp: "bilangan-tp1",
    tema: "Bilangan · Nilai Tempat",
    urutan: 1,
    judul: "Nilai Tempat dan Perbandingan Bilangan Cacah",
    ringkasan: "Membaca, menulis, menentukan nilai tempat, membandingkan dan mengurutkan bilangan cacah sampai 100.000.",
    status: "selesai",
    file: "matematika/nilai-tempat-tp1/modul.html"
  },
  {
    mapel: "Matematika",
    mapelSlug: "matematika",
    mapelColor: "var(--m-matematika)",
    mapelIcon: "🔢",
    icon: "➖",
    elemen: "Bilangan",
    tp: "bilangan-tp2",
    tema: "Bilangan · Pengurangan Bersusun",
    urutan: 2,
    judul: "Pengurangan Bersusun dengan Peminjaman Berganda",
    ringkasan: "Melatih pengurangan bersusun dengan peminjaman berganda, termasuk kasus angka nol di tengah.",
    status: "selesai",
    file: "matematika/pengurangan-tp2/modul.html"
  },
  {
    mapel: "Matematika",
    mapelSlug: "matematika",
    mapelColor: "var(--m-matematika)",
    mapelIcon: "🔢",
    icon: "➗",
    elemen: "Bilangan",
    tp: "bilangan-tp3",
    tema: "Bilangan · Pembagian Bersusun",
    urutan: 3,
    judul: "Pembagian Bersusun dengan Pembagi Multi-Digit",
    ringkasan: "Pembagian bersusun pembagi lebih dari satu digit dengan estimasi-coba-koreksi.",
    status: "selesai",
    file: "matematika/pembagian-tp3/modul.html"
  },
  {
    mapel: "Matematika",
    mapelSlug: "matematika",
    mapelColor: "var(--m-matematika)",
    mapelIcon: "🔢",
    icon: "🔁",
    elemen: "Bilangan",
    tp: "bilangan-tp4",
    tema: "Bilangan · KPK dan FPB",
    urutan: 4,
    judul: "KPK dan FPB melalui Soal Cerita Kontekstual",
    ringkasan: "Menyelesaikan soal cerita KPK dan FPB, mengidentifikasi sendiri konsep yang relevan.",
    status: "selesai",
    file: "matematika/kpk-fpb-tp4/modul.html"
  },
  {
    mapel: "Matematika",
    mapelSlug: "matematika",
    mapelColor: "var(--m-matematika)",
    mapelIcon: "🔢",
    icon: "💰",
    elemen: "Bilangan",
    tp: "bilangan-tp5",
    tema: "Bilangan · Uang",
    urutan: 5,
    judul: "Masalah Sehari-hari Berkaitan dengan Uang",
    ringkasan: "Transaksi, kembalian, dan perbandingan harga menggunakan operasi hitung bilangan cacah.",
    status: "selesai",
    file: "matematika/uang-tp5/modul.html"
  },
  {
    mapel: "Matematika",
    mapelSlug: "matematika",
    mapelColor: "var(--m-matematika)",
    mapelIcon: "🔢",
    icon: "🍕",
    elemen: "Bilangan",
    tp: "bilangan-tp6",
    tema: "Bilangan · Pecahan",
    urutan: 6,
    judul: "Pecahan: Representasi, Perbandingan, dan Operasi",
    ringkasan: "Pecahan sebagai bagian-dari-keseluruhan, perbandingan, dan operasi penjumlahan-pengurangan.",
    status: "selesai",
    file: "matematika/pecahan-tp6/modul.html"
  },
  {
    mapel: "Matematika",
    mapelSlug: "matematika",
    mapelColor: "var(--m-matematika)",
    mapelIcon: "🔢",
    icon: "🥣",
    elemen: "Bilangan",
    tp: "bilangan-tp7",
    tema: "Bilangan · Perkalian-Pembagian Pecahan",
    urutan: 7,
    judul: "Perkalian, Pembagian Pecahan, dan Bentuk Pecahan",
    ringkasan: "Perkalian/pembagian pecahan dengan bilangan asli dan konversi bentuk pecahan.",
    status: "selesai",
    file: "matematika/pecahan-lanjutan-tp7/modul.html"
  }
];
