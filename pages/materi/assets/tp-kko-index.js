/* ============================================================
   TP-KKO-INDEX.JS — Sumber tunggal batas level kognitif (KKO) per TP
   ============================================================
   Dipakai oleh Uji Kemampuan (pages/uji-kemampuan.html) dan Panel Guru
   (pages/admin.html, tab "Uji Kemampuan") untuk memastikan soal di pool
   suatu TP TIDAK melebihi level kognitif (Taksonomi Bloom, C1-C6) dari
   rumusan TP resminya (lihat pages/cp-tp-atp.html).

   PENTING - INI DRAF, BUKAN KEPUTUSAN FINAL:
   Klasifikasi kkoMax di bawah diturunkan dari kata kerja utama pada
   rumusan TP secara otomatis-dibantu-AI (bukan hasil telaah ahli
   kurikulum). Tinjau ulang oleh guru/koordinator kurikulum sebelum
   dipakai sebagai batas nyata pembuatan soal, terutama TP yang punya
   field `catatan` di bawah.

   Field:
     tp         - kode TP. Untuk mapel yang materinya sudah ditulis
                  (Bahasa Indonesia, Matematika, IPAS), nilai ini SAMA
                  PERSIS dengan field `tp` di materi-index.js.
                  Untuk mapel yang materinya belum ditulis (Pendidikan
                  Pancasila, Seni Budaya), nilai ini mengikuti tp-kode
                  di cp-tp-atp.html apa adanya.
     kodeAsli   - kode tp-kode asli di cp-tp-atp.html (buat ketertelusuran,
                  diisi kalau beda dari `tp`).
     mapel      - nama mapel
     elemen     - nama elemen/topik CP
     judul      - nama singkat TP (buat label dropdown/daftar)
     rumusan    - kutipan rumusan TP resmi (konteks saat menyusun soal)
     kkoMax     - "C1".."C6", batas atas level kognitif soal utk TP ini
                  C1 Mengingat . C2 Memahami . C3 Menerapkan .
                  C4 Menganalisis . C5 Mengevaluasi . C6 Mencipta
     verbaAcuan - kata kerja utama dalam rumusan, dasar klasifikasi
     catatan    - (opsional) alasan/keraguan klasifikasi yang perlu ditinjau
   ============================================================ */

window.TP_KKO_INDEX = [
  { tp: "M1", mapel: "Bahasa Indonesia", elemen: "Menyimak", judul: "Informasi Penting dari Teks Aural", rumusan: "Menganalisis informasi penting dari teks nonsastra aural (dibacakan/didengarkan) tentang lingkungan sekitar.", kkoMax: "C4", verbaAcuan: "menganalisis" },
  { tp: "M2", mapel: "Bahasa Indonesia", elemen: "Menyimak", judul: "Hubungan Sebab-Akibat & Urutan Kejadian", rumusan: "Menganalisis hubungan sebab-akibat dan urutan kejadian dalam teks sastra aural.", kkoMax: "C4", verbaAcuan: "menganalisis" },
  { tp: "MB2", mapel: "Bahasa Indonesia", elemen: "Membaca dan Memirsa", judul: "Menganalisis Informasi & Nilai dalam Tayangan", rumusan: "Menganalisis informasi dan nilai-nilai dalam teks visual/audiovisual (tayangan) tentang topik sehari-hari.", kkoMax: "C4", verbaAcuan: "menganalisis" },
  { tp: "B1", mapel: "Bahasa Indonesia", elemen: "Berbicara dan Mempresentasikan", judul: "Presentasi Gagasan", rumusan: "Mempresentasikan gagasan dari berbagai tipe teks secara efektif dan santun.", kkoMax: "C3", verbaAcuan: "mempresentasikan", catatan: "Presentasi lisan diklasifikasi C3 (penerapan) — soal tertulis auto-grade akan menguji unsur pendukungnya (struktur gagasan, kesantunan berbahasa), bukan performa presentasi itu sendiri." },
  { tp: "B2", mapel: "Bahasa Indonesia", elemen: "Berbicara dan Mempresentasikan", judul: "Membacakan Karya Sastra (Siklus Berkelanjutan)", rumusan: "Menyampaikan perasaan berdasarkan fakta atau imajinasi secara indah dan menarik melalui pembacaan karya sastra.", kkoMax: "C3", verbaAcuan: "menyampaikan (membacakan)", catatan: "Sama seperti B1 — inti TP berupa unjuk kerja lisan; soal auto-grade menguji pemahaman unsur karya sastra yang mendukungnya." },
  { tp: "TL-Pengalaman", mapel: "Bahasa Indonesia", elemen: "Menulis", judul: "Menulis dari Pengalaman Pribadi", rumusan: "Menulis teks sederhana berdasarkan pengalaman pribadi dengan kerangka naratif dan rangkaian kalimat kompleks.", kkoMax: "C6", verbaAcuan: "menulis (mencipta teks)", catatan: "Menulis teks orisinal = C6. Karena esai bebas tidak bisa diperiksa otomatis, soal untuk TP ini difokuskan menguji komponen pembangunnya (kerangka naratif, struktur kalimat kompleks) lewat PG/mengurutkan/menjodohkan — bukan menulis teks utuh." },
  { tp: "TL-Pengamatan", mapel: "Bahasa Indonesia", elemen: "Menulis", judul: "Menulis Laporan Pengamatan", rumusan: "Menulis teks laporan hasil pengamatan sederhana terhadap objek/peristiwa nyata di sekitar dengan urutan sistematis.", kkoMax: "C6", verbaAcuan: "menulis (mencipta teks)", catatan: "Sama seperti TL-Pengalaman — soal menguji struktur & urutan sistematis laporan, bukan menulis laporan utuh." },
  { tp: "TL-Gagasan", mapel: "Bahasa Indonesia", elemen: "Menulis", judul: "Menulis Pendapat / Gagasan", rumusan: "Menulis teks berisi gagasan atau pendapat dengan kerangka argumentasi dan kalimat majemuk dasar.", kkoMax: "C6", verbaAcuan: "menulis (mencipta teks)", catatan: "Sama seperti TL-Pengalaman — soal menguji kerangka argumentasi & kalimat majemuk, bukan menulis esai utuh." },
  { tp: "TL-Imajinasi", mapel: "Bahasa Indonesia", elemen: "Menulis", judul: "Menulis Cerita Imajinatif", rumusan: "Menulis teks cerita imajinatif dengan kerangka fiksi (tokoh, latar, alur) secara kreatif memakai kosakata denotatif dan konotatif.", kkoMax: "C6", verbaAcuan: "menulis (mencipta teks)", catatan: "Sama seperti TL-Pengalaman — soal menguji unsur fiksi (tokoh/latar/alur) & kosakata denotatif-konotatif, bukan menulis cerita utuh." },
  { tp: "bilangan-tp1", kodeAsli: "BIL-TP1", mapel: "Matematika", elemen: "Bilangan", judul: "Nilai Tempat dan Perbandingan Bilangan Cacah (sampai 100.000)", rumusan: "Menunjukkan pemahaman nilai tempat serta membandingkan dan mengurutkan bilangan cacah sampai 100.000.", kkoMax: "C2", verbaAcuan: "menunjukkan pemahaman" },
  { tp: "bilangan-tp2", kodeAsli: "BIL-TP2", mapel: "Matematika", elemen: "Bilangan", judul: "Pengurangan Bersusun dengan Peminjaman Berganda", rumusan: "Melakukan operasi pengurangan bersusun dengan peminjaman berganda, termasuk menembus angka nol.", kkoMax: "C3", verbaAcuan: "melakukan operasi" },
  { tp: "bilangan-tp3", kodeAsli: "BIL-TP3", mapel: "Matematika", elemen: "Bilangan", judul: "Pembagian Bersusun dengan Pembagi Multi-Digit", rumusan: "Melakukan operasi pembagian bersusun dengan pembagi dua digit sembarang.", kkoMax: "C3", verbaAcuan: "melakukan operasi" },
  { tp: "bilangan-tp4", kodeAsli: "BIL-TP4", mapel: "Matematika", elemen: "Bilangan", judul: "KPK dan FPB melalui Soal Cerita Kontekstual", rumusan: "Menyelesaikan masalah sehari-hari yang berkaitan dengan KPK dan FPB.", kkoMax: "C3", verbaAcuan: "menyelesaikan masalah" },
  { tp: "bilangan-tp5", kodeAsli: "BIL-TP5", mapel: "Matematika", elemen: "Bilangan", judul: "Masalah Sehari-hari Berkaitan dengan Uang", rumusan: "Menyelesaikan masalah sehari-hari yang berkaitan dengan uang.", kkoMax: "C3", verbaAcuan: "menyelesaikan masalah" },
  { tp: "bilangan-tp6", kodeAsli: "BIL-TP6", mapel: "Matematika", elemen: "Bilangan", judul: "Pecahan: Representasi, Perbandingan, Penjumlahan-Pengurangan", rumusan: "Membandingkan, mengurutkan, menjumlahkan, dan mengurangkan berbagai pecahan termasuk pecahan campuran.", kkoMax: "C3", verbaAcuan: "menjumlahkan/mengurangkan" },
  { tp: "bilangan-tp7", kodeAsli: "BIL-TP7", mapel: "Matematika", elemen: "Bilangan", judul: "Perkalian-Pembagian Pecahan dengan Bilangan Asli", rumusan: "Melakukan operasi perkalian dan pembagian pecahan dengan bilangan asli serta mengubah bentuk pecahan.", kkoMax: "C3", verbaAcuan: "melakukan operasi" },
  { tp: "aljabar-tp1", kodeAsli: "ALJ-TP1", mapel: "Matematika", elemen: "Aljabar", judul: "Simbol \"=\" sebagai Relasi Kesetaraan — Remediasi Wajib", rumusan: "Menunjukkan pemahaman makna simbol \"=\" sebagai relasi kesetaraan dalam kalimat matematika.", kkoMax: "C2", verbaAcuan: "menunjukkan pemahaman" },
  { tp: "aljabar-tp2", kodeAsli: "ALJ-TP2", mapel: "Matematika", elemen: "Aljabar", judul: "Menemukan Nilai Belum Diketahui — Notasi Simbolik 4 Operasi", rumusan: "Menemukan nilai belum diketahui dalam kalimat matematika yang melibatkan empat operasi hitung pada bilangan cacah sampai 1.000.", kkoMax: "C3", verbaAcuan: "menemukan (menyelesaikan persamaan)" },
  { tp: "aljabar-tp3", kodeAsli: "ALJ-TP3", mapel: "Matematika", elemen: "Aljabar", judul: "Pola Bilangan Membesar/Mengecil (Perkalian-Pembagian)", rumusan: "Mengidentifikasi dan mengembangkan pola bilangan membesar/mengecil yang melibatkan perkalian dan pembagian.", kkoMax: "C3", verbaAcuan: "mengembangkan pola" },
  { tp: "aljabar-tp4", kodeAsli: "ALJ-TP4", mapel: "Matematika", elemen: "Aljabar", judul: "Bernalar Proporsional dengan Rasio Satuan", rumusan: "Bernalar secara proporsional untuk menyelesaikan masalah sehari-hari dengan rasio satuan.", kkoMax: "C4", verbaAcuan: "bernalar (proporsional)" },
  { tp: "geometri-tp3", kodeAsli: "GEOM-TP3", mapel: "Matematika", elemen: "Geometri", judul: "Menentukan Lokasi pada Sistem Berpetak (Koordinat Sederhana)", rumusan: "Menentukan lokasi pada peta yang menggunakan sistem berpetak.", kkoMax: "C3", verbaAcuan: "menentukan" },
  { tp: "geometri-tp1", kodeAsli: "GEOM-TP1", mapel: "Matematika", elemen: "Geometri", judul: "Mengonstruksi & Mengurai Bangun Ruang, Visualisasi Spasial", rumusan: "Mengonstruksi dan mengurai bangun ruang (kubus, balok, dan gabungannya) serta mengenali visualisasi spasial.", kkoMax: "C3", verbaAcuan: "mengonstruksi" },
  { tp: "geometri-tp2", kodeAsli: "GEOM-TP2", mapel: "Matematika", elemen: "Geometri", judul: "Membandingkan Karakteristik Bangun Datar & Bangun Ruang", rumusan: "Membandingkan karakteristik antar bangun datar dan antar bangun ruang.", kkoMax: "C4", verbaAcuan: "membandingkan karakteristik" },
  { tp: "pengukuran-tp1", kodeAsli: "UKUR-TP1", mapel: "Matematika", elemen: "Pengukuran", judul: "Keliling & Luas Persegi, Persegi Panjang, Segitiga (Potong-Susun Fisik)", rumusan: "Menentukan keliling dan luas bangun datar (persegi, persegi panjang, segitiga) serta gabungannya.", kkoMax: "C3", verbaAcuan: "menentukan" },
  { tp: "pengukuran-tp2", kodeAsli: "UKUR-TP2", mapel: "Matematika", elemen: "Pengukuran", judul: "Keliling & Luas Segi Banyak Beraturan dan Bangun Gabungan", rumusan: "Menentukan keliling dan luas segi banyak beraturan serta bangun gabungan.", kkoMax: "C3", verbaAcuan: "menentukan" },
  { tp: "pengukuran-tp3", kodeAsli: "UKUR-TP3", mapel: "Matematika", elemen: "Pengukuran", judul: "Durasi Waktu (Konversi Antarsatuan, Lintas Tengah Malam)", rumusan: "Menghitung durasi waktu, termasuk yang melintasi tengah malam.", kkoMax: "C3", verbaAcuan: "menghitung" },
  { tp: "pengukuran-tp4", kodeAsli: "UKUR-TP4", mapel: "Matematika", elemen: "Pengukuran", judul: "Mengukur Besar Sudut dengan Protractor", rumusan: "Mengukur besar sudut pada bangun datar atau yang dibentuk dari dua garis berpotongan.", kkoMax: "C3", verbaAcuan: "mengukur" },
  { tp: "data-peluang-tp1", kodeAsli: "DP-TP1", mapel: "Matematika", elemen: "Analisis Data dan Peluang", judul: "Mengurutkan, Membandingkan, Menyajikan Data", rumusan: "Mengurutkan, membandingkan, dan menyajikan data dalam bentuk piktogram, diagram batang, dan tabel frekuensi.", kkoMax: "C3", verbaAcuan: "menyajikan data" },
  { tp: "data-peluang-tp2", kodeAsli: "DP-TP2", mapel: "Matematika", elemen: "Analisis Data dan Peluang", judul: "Mean, Median, Modus (Pengayaan Informal)", rumusan: "Menghitung mean, median, dan modus dari kumpulan data sederhana.", kkoMax: "C3", verbaAcuan: "menghitung" },
  { tp: "data-peluang-tp3", kodeAsli: "DP-TP3", mapel: "Matematika", elemen: "Analisis Data dan Peluang", judul: "Peluang — Pengenalan Awal dari Eksplorasi Konkret", rumusan: "Menentukan kejadian dengan kemungkinan yang lebih besar atau lebih kecil dalam suatu percobaan acak.", kkoMax: "C3", verbaAcuan: "menentukan" },
  { tp: "organ-tp2", kodeAsli: "OT-TP2", mapel: "IPAS", elemen: "Sistem Organ Tubuh", judul: "Struktur dan Fungsi Organ", rumusan: "Menjelaskan struktur dan fungsi organ utama tubuh manusia dikaitkan dengan cara menjaga kesehatan.", kkoMax: "C2", verbaAcuan: "menjelaskan" },
  { tp: "organ-tp1", kodeAsli: "OT-TP1", mapel: "IPAS", elemen: "Sistem Organ Tubuh", judul: "Respons Tubuh dan Kesehatan (Detak Jantung)", rumusan: "Merefleksikan respons tubuh (detak jantung) terhadap aktivitas fisik dikaitkan dengan cara menjaga kesehatan tubuh.", kkoMax: "C5", verbaAcuan: "merefleksikan", catatan: "Refleksi diri = C5. Perlu ditinjau: untuk soal auto-grade, TP ini kemungkinan besar diuji pada level C2–C3 (menjelaskan hubungan sebab-akibat aktivitas fisik & detak jantung), bagian reflektifnya sulit diuji lewat PG/menjodohkan." },
  { tp: "bunyi-cahaya-tp1", kodeAsli: "BC-TP1", mapel: "IPAS", elemen: "Gelombang Bunyi dan Cahaya", judul: "Gelombang Bunyi dan Cahaya", rumusan: "Menjelaskan fenomena gelombang bunyi dan cahaya dalam kehidupan sehari-hari.", kkoMax: "C2", verbaAcuan: "menjelaskan" },
  { tp: "ekosistem-tp1", kodeAsli: "EKOS-TP1", mapel: "IPAS", elemen: "Ekosistem", judul: "Observasi Biotik-Abiotik", rumusan: "Menganalisis hubungan antar komponen biotik dan abiotik di lingkungan sekitar sekolah.", kkoMax: "C4", verbaAcuan: "menganalisis" },
  { tp: "ekosistem-tp2", kodeAsli: "EKOS-TP2", mapel: "IPAS", elemen: "Ekosistem", judul: "Percobaan Pertumbuhan Tanaman", rumusan: "Menganalisis pengaruh komponen biotik-abiotik terhadap ekosistem melalui percobaan pertumbuhan tanaman.", kkoMax: "C4", verbaAcuan: "menganalisis" },
  { tp: "ekonomi-tp1", kodeAsli: "EKON-TP1", mapel: "IPAS", elemen: "Kegiatan Ekonomi", judul: "Kegiatan Ekonomi Masyarakat", rumusan: "Menerapkan pemahaman tentang kegiatan ekonomi masyarakat di lingkungan sekitar.", kkoMax: "C3", verbaAcuan: "menerapkan" },
  { tp: "geografis-tp1", kodeAsli: "GEO-TP1", mapel: "IPAS", elemen: "Letak Geografis", judul: "Letak Geografis Indonesia", rumusan: "Menjelaskan letak dan kondisi geografis negara Indonesia menggunakan peta konvensional/digital.", kkoMax: "C2", verbaAcuan: "menjelaskan" },
  { tp: "budaya-tp1", kodeAsli: "BUDAYA-TP1", mapel: "IPAS", elemen: "Sejarah dan Keragaman Budaya", judul: "Sejarah dan Keragaman Budaya Sekitar", rumusan: "Menemukan keragaman budaya nasional dalam konteks kebhinekaan berdasarkan nilai-nilai kearifan lokal.", kkoMax: "C4", verbaAcuan: "menemukan" },
  { tp: "PANC-C1a", mapel: "Pendidikan Pancasila", elemen: "Pancasila", judul: "Kronologi Sejarah Kelahiran Pancasila", rumusan: "Memahami kronologi sejarah kelahiran Pancasila.", kkoMax: "C2", verbaAcuan: "memahami" },
  { tp: "PANC-C1b", mapel: "Pendidikan Pancasila", elemen: "Pancasila", judul: "Meneladani Sikap Perumus Pancasila dalam Kehidupan Sehari-hari", rumusan: "Meneladani sikap para perumus Pancasila dan menerapkannya di lingkungan sekitar.", kkoMax: "C3", verbaAcuan: "menerapkan" },
  { tp: "PANC-C1c", mapel: "Pendidikan Pancasila", elemen: "Pancasila", judul: "Menghubungkan Sila-Sila sebagai Satu Kesatuan Nilai", rumusan: "Menghubungkan sila-sila dalam Pancasila sebagai satu kesatuan yang utuh serta menguraikan maknanya sebagai dasar negara dan pandangan hidup bangsa.", kkoMax: "C4", verbaAcuan: "menghubungkan/menguraikan" },
  { tp: "UUD-C1", mapel: "Pendidikan Pancasila", elemen: "UUD 1945", judul: "Norma, Hak, dan Kewajiban sebagai Warga Negara", rumusan: "Mengimplementasikan bentuk-bentuk norma, hak, dan kewajiban dalam kedudukannya sebagai warga negara.", kkoMax: "C3", verbaAcuan: "mengimplementasikan" },
  { tp: "UUD-C2", mapel: "Pendidikan Pancasila", elemen: "UUD 1945", judul: "Mengenal Pembukaan UUD 1945", rumusan: "Mengenal Pembukaan Undang-Undang Dasar Negara Republik Indonesia Tahun 1945.", kkoMax: "C1", verbaAcuan: "mengenal" },
  { tp: "UUD-C3", mapel: "Pendidikan Pancasila", elemen: "UUD 1945", judul: "Musyawarah Mufakat dalam Keluarga dan Sekolah", rumusan: "Mempraktikkan musyawarah untuk membuat kesepakatan dan aturan bersama serta menerapkannya di lingkungan keluarga dan sekolah.", kkoMax: "C3", verbaAcuan: "mempraktikkan" },
  { tp: "BTI-C1a", mapel: "Pendidikan Pancasila", elemen: "Bhinneka Tunggal Ika", judul: "Menyajikan Hasil Identifikasi Keberagaman Asal Keluarga di Kelas", rumusan: "Menyajikan hasil identifikasi sikap menghormati, menjaga, dan melestarikan keberagaman budaya sesuai semboyan Bhinneka Tunggal Ika di lingkungan sekitar.", kkoMax: "C3", verbaAcuan: "menyajikan" },
  { tp: "BTI-C1b", mapel: "Pendidikan Pancasila", elemen: "Bhinneka Tunggal Ika", judul: "Menunjukkan Sikap Menghormati dan Menjaga Keberagaman Teman Sekelas", rumusan: "Menunjukkan sikap menghormati (tidak merendahkan) dan menjaga (membela) keberagaman latar belakang teman sekelas secara berkelanjutan.", kkoMax: "C3", verbaAcuan: "menunjukkan (pembiasaan)", catatan: "TP ini dipantau berkelanjutan lewat jurnal mingguan (modul mengharuskan siswa kembali tiap minggu), bukan aktivitas satu kali seperti TP lain — sulit diuji lewat soal PG sekali jalan." },
  { tp: "BTI-C1c", mapel: "Pendidikan Pancasila", elemen: "Bhinneka Tunggal Ika", judul: "Menunjukkan Rasa Ingin Tahu terhadap Sejarah Lokal Tempat Tinggal", rumusan: "Menunjukkan rasa ingin tahu terhadap sejarah lokal tempat tinggal sebagai bagian dari keberagaman daerah asal.", kkoMax: "C2", verbaAcuan: "menunjukkan (rasa ingin tahu)", catatan: "TP afektif/reflektif — modul sengaja dirancang TANPA nilai/tes (\"boleh dijawab, boleh dilewati\"), jadi kemungkinan besar tidak cocok diuji lewat soal auto-grade seperti TP lain." },
  { tp: "NKRI-C1", mapel: "Pendidikan Pancasila", elemen: "Negara Kesatuan Republik Indonesia", judul: "Mengenal Wilayah Kabupaten/Kota dan Provinsi sebagai Bagian NKRI", rumusan: "Mengenal wilayahnya dalam konteks kabupaten/kota dan provinsi sebagai bagian dari wilayah NKRI.", kkoMax: "C1", verbaAcuan: "mengenal" },
  { tp: "NKRI-C2", mapel: "Pendidikan Pancasila", elemen: "Negara Kesatuan Republik Indonesia", judul: "Gotong Royong Menjaga Persatuan (Wujud Bela Negara)", rumusan: "Menunjukkan perilaku gotong royong untuk menjaga persatuan di lingkungan sekolah dan sekitar sebagai wujud bela negara.", kkoMax: "C3", verbaAcuan: "menunjukkan perilaku" },
  { tp: "MUS-C1", mapel: "Seni Budaya", elemen: "🎵 Seni Musik", judul: "Mengenali & Menerapkan Unsur Musik (Nada, Irama, Melodi)", rumusan: "Mengenali dan menerapkan unsur-unsur musik (nada, irama, melodi) menggunakan alat musik ritmis dan melodis.", kkoMax: "C3", verbaAcuan: "menerapkan" },
  { tp: "MUS-C2", mapel: "Seni Budaya", elemen: "🎵 Seni Musik", judul: "Menciptakan Pola Irama Berdasarkan Kearifan Lokal", rumusan: "Membuat dan mengembangkan pola irama berdasarkan nilai kearifan lokal daerahnya menggunakan alat musik ritmis.", kkoMax: "C6", verbaAcuan: "membuat", catatan: "Karya musik = C6, tidak bisa diuji langsung lewat soal auto-grade. Soal untuk TP ini difokuskan pada pemahaman unsur & struktur pola irama, bukan menilai unjuk karya." },
  { tp: "RUPA-C1", mapel: "Seni Budaya", elemen: "🎨 Seni Rupa", judul: "Eksplorasi Unsur Rupa & Prinsip Desain melalui Pengamatan Benda Sekitar", rumusan: "Menjelaskan unsur rupa dan prinsip desain dalam benda-benda di sekitar/karya seni rupa.", kkoMax: "C2", verbaAcuan: "menjelaskan" },
  { tp: "RUPA-C2", mapel: "Seni Budaya", elemen: "🎨 Seni Rupa", judul: "Menguji Coba Teknik & Alat/Bahan dalam Berkarya", rumusan: "Mengenali dan menguji coba variasi teknik penggunaan alat dan/atau bahan seni rupa.", kkoMax: "C3", verbaAcuan: "menguji coba" },
  { tp: "RUPA-C3", mapel: "Seni Budaya", elemen: "🎨 Seni Rupa", judul: "Menciptakan Karya Seni Rupa dari Pengamatan & Imajinasi (Proyek Karya)", rumusan: "Membuat karya seni rupa berdasarkan pengalaman dan/atau hasil pengamatan melalui pengembangan imajinasi yang mewakili minatnya.", kkoMax: "C6", verbaAcuan: "membuat", catatan: "Karya rupa = C6, tidak bisa diuji lewat soal auto-grade. Soal difokuskan pada pemahaman proses/unsur berkarya." },
  { tp: "RUPA-C4", mapel: "Seni Budaya", elemen: "🎨 Seni Rupa", judul: "Merefleksikan & Mengapresiasi Karya Sendiri dan Teman", rumusan: "Merefleksikan dan mengapresiasi karya diri sendiri dan teman sekelas menggunakan kosakata seni rupa yang sesuai.", kkoMax: "C5", verbaAcuan: "merefleksikan/mengapresiasi", catatan: "Sama seperti organ-tp1 — bagian reflektifnya sulit diuji otomatis; soal auto-grade realistisnya menguji kosakata & kriteria apresiasi (C2–C3)." },
  { tp: "TEATER-C1", mapel: "Seni Budaya", elemen: "🎭 Seni Teater", judul: "Bermain Peran Berkelompok: Improvisasi & Pengenalan Karakter", rumusan: "Melakukan permainan peran berkelompok (improvisasi) untuk melatih aksi-reaksi dan mengenali karakter tokoh.", kkoMax: "C3", verbaAcuan: "melakukan (praktik)" },
  { tp: "TEATER-C2", mapel: "Seni Budaya", elemen: "🎭 Seni Teater", judul: "Mengidentifikasi Properti Sederhana Sesuai Cerita", rumusan: "Mengidentifikasi properti sederhana berdasarkan cerita yang akan dimainkan.", kkoMax: "C1", verbaAcuan: "mengidentifikasi" },
  { tp: "TEATER-C3", mapel: "Seni Budaya", elemen: "🎭 Seni Teater", judul: "Memainkan Ragam Peran dari Cerita Sederhana (Pementasan)", rumusan: "Mengenal dan memainkan ragam peran dari cerita sederhana serta memerankan lakon berdasarkan minat, pengamatan, dan pengalaman.", kkoMax: "C3", verbaAcuan: "memerankan (praktik)" },
  { tp: "TEATER-C4", mapel: "Seni Budaya", elemen: "🎭 Seni Teater", judul: "Merefleksikan Cerita: Penokohan dan Perwatakan", rumusan: "Menceritakan pendapatnya tentang sebuah cerita sederhana (penokohan, perwatakan).", kkoMax: "C5", verbaAcuan: "menceritakan pendapat (menilai)", catatan: "Memberi pendapat/penilaian atas penokohan = C5. Perlu ditinjau apakah maksudnya lebih ke C2 (menjelaskan pemahaman cerita) untuk usia SD." }
];

/* ------------------------------------------------------------
   Helper: ambil entri TP_KKO_INDEX lengkap untuk satu kode TP.
   Dipakai saat memvalidasi soal baru di admin.html / uji-kemampuan.html.
------------------------------------------------------------ */
window.getTpKko = function (tpKode) {
  return window.TP_KKO_INDEX.find(function (e) { return e.tp === tpKode; }) || null;
};

/* Urutan tingkat kognitif, buat perbandingan "soal.kko <= tp.kkoMax" */
window.KKO_URUTAN = { C1: 1, C2: 2, C3: 3, C4: 4, C5: 5, C6: 6 };

window.kkoDalamBatas = function (kkoSoal, kkoMaxTp) {
  return (window.KKO_URUTAN[kkoSoal] || 0) <= (window.KKO_URUTAN[kkoMaxTp] || 0);
};

/* Daftar mapel dalam urutan tampil yang konsisten di seluruh halaman */
window.URUTAN_MAPEL = ["Bahasa Indonesia", "Matematika", "IPAS", "Pendidikan Pancasila", "Seni Budaya"];
