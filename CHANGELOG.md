# Changelog

Semua perubahan penting pada proyek ini dicatat di sini.  
Format mengacu pada [Keep a Changelog](https://keepachangelog.com/id/1.0.0/).

---

## [Unreleased]
> Fitur dan perbaikan yang sedang dikerjakan, belum masuk ke versi rilis.

### Konten — Pendidikan Pancasila Kelas 5 tuntas (sesi kerja konten terpisah, tidak terkait v0.11.0)
> Dikerjakan lewat jalur sesi kerja konten (Claude + Arif, upload-ZIP), berjalan paralel
> dan independen dari pengerjaan Sistem Login Baru di atas. Tidak menyentuh kode
> aplikasi/Firebase/Apps Script sama sekali — murni penambahan file `.html` materi +
> entri `materi-index.js`.

- **Seluruh 11 TP mata pelajaran Pendidikan Pancasila Kelas 5 selesai ditulis** (42 file
  materi total, menambah dari 11 sesi yang sudah ada sebelumnya di titik ini):
  UUD 1945 #2 (Norma/Hak/Kewajiban, 4 pertemuan), UUD 1945 #3 (Musyawarah & Kesepakatan
  Kelas, 5 pertemuan), Bhinneka Tunggal Ika #2 (Menghormati & Menjaga Keberagaman, 4
  pertemuan), NKRI #2 (Gotong Royong, 3 pertemuan), Bhinneka Tunggal Ika #1 (Keberagaman
  Asal Keluarga, 5 pertemuan), Bhinneka Tunggal Ika #3 (Rasa Ingin Tahu Sejarah Lokal, 2
  pertemuan — TP paling sensitif di kurikulum ini, lihat catatan di bawah), UUD 1945 #1
  (Gagasan Pokok Pembukaan UUD 1945, 4 pertemuan), dan Pancasila #3 (Sintesis Kelima
  Sila, TP penutup mapel, 4 pertemuan). Total sekarang **181 entri** di
  `materi-index.js` (BI 42, Matematika 64, IPAS 33, Pancasila 42), naik dari 150 di
  titik terakhir IPAS/Matematika selesai.
- **Penanganan khusus BTI #3 (sejarah lokal)** — dokumen sumber melarang pembahasan
  detail peristiwa kekerasan sejarah lokal (Gedoran Depok 1945). Materi ditulis memakai
  pemantik netral yang diverifikasi lewat pencarian web (dua versi cerita asal-usul nama
  "Depok"), tanpa rubrik penilaian formal (sesuai instruksi dokumen sumber "bukan bahan
  ujian"), dan lolos pengecekan otomatis pasca-tulis (`grep -il` untuk kata kunci
  sensitif) sebelum dikirim.

### Diperbaiki — Bug duplikat di `materi-index.js` (ditemukan saat audit atas permintaan pengguna)
- **1 entri tersalin dua kali persis identik**: `pancasila/uud1945-tp2/04-membedakan-
  norma-hak-kewajiban-sekaligus-inti.html` muncul di 2 posisi berurutan dengan
  `urutan: 4` ganda (total sempat 182 entri, Pancasila tercatat 43 padahal seharusnya
  42). Kemungkinan besar terjadi saat proses manual menggabungkan beberapa ZIP kecil
  (dikirim terpisah per-TP sepanjang beberapa sesi) menjadi satu repo gabungan.
  Ditemukan lewat audit terprogram (bukan baca manual) yang mengecek duplikat file path
  DAN duplikat kombinasi `(mapelSlug, tp, urutan)` sekaligus. Diperbaiki: salinan
  kedua dihapus, total kembali ke 181 entri, Pancasila 42, seluruh 48 grup TP di index
  diverifikasi ulang urutannya (`1,2,...,N` tanpa gap/duplikat) — nol masalah tersisa.
- Ditemukan sekaligus (dilaporkan, TIDAK diperbaiki — bukan bug, murni kerapian): entri
  Matematika terpecah jadi 2 blok terpisah di array mentah `materi-index.js` (9 entri →
  disisipi 33 entri IPAS → 55 entri Matematika lagi), kemungkinan besar dari sesi
  penambahan IPAS yang menyisipkan entrinya di tengah alih-alih di akhir array. TIDAK
  memengaruhi fungsi (kode membaca lewat filter `mapelSlug`, bukan posisi array), jadi
  sengaja TIDAK diubah tanpa persetujuan eksplisit pengguna — reorder besar berisiko
  salah ketik/salah potong kalau dilakukan tergesa.
- Ditambahkan catatan baru di `ANTIREGRESI.md` bagian "Catatan Penting": duplikat entri
  adalah kelas bug BARU yang belum pernah dicek checklist sebelumnya (checklist lama
  cuma mengecek "file ada tapi tidak terdaftar" dan sebaliknya) — sekarang jadi
  pengecekan wajib setiap kali beberapa ZIP materi digabung manual ke satu repo.

### Ditambahkan — Sistem Level Uji Kemampuan, Fase 1: mesin hitung di server
(belum dirilis; profil siswa/EXP/papan perbandingan MENYUSUL di fase berikutnya)
> Latar belakang: pemilik proyek ingin sistem gamifikasi — siswa naik level
> (Dasar → Menengah → Atas → Mahir) berdasar konsistensi lulus Uji Kemampuan,
> supaya siswa termotivasi belajar & bisa membandingkan progres dengan teman.
> Sesi ini BARU membangun fondasi (mesin hitung level), BUKAN fitur lengkapnya.

- **Cakupan level: GLOBAL**, bukan per-TP atau per-mapel — 1 siswa cuma punya
  1 level (gabungan dari SEMUA kuis Uji Kemampuan yang pernah dikerjakan,
  mapel/TP apa saja), diputuskan supaya sistemnya sederhana dan tidak
  butuh soal per level per TP (yang kontennya akan sangat besar — lihat poin
  berikutnya).
- **Syarat naik level** (dari `LEVEL_TAHAP_` di `Code.gs`):
  - Dasar → Menengah: 3× lulus dengan skor **>90%**
  - Menengah → Atas: 3× lulus dengan skor **>85%**
  - Atas → Mahir: 2× lulus dengan skor **>80%**
  - Di level Mahir: 1× lulus dengan skor **>75%** menandai "Mahir Tercapai"
    (capaian puncak — level tidak naik lagi setelah ini, tidak ada level di
    atas Mahir)
  - **Gagal TIDAK mereset maupun mengurangi hitungan progres** — cuma tidak
    menambah. Sengaja begitu (bukan default "harus berturut-turut") supaya
    1 hari buruk tidak menghapus progres berhari-hari sebelumnya.
- **Soal per level BELUM dibedakan tingkat kesulitannya** — sengaja pakai pool
  soal `bank_soal` yang SAMA seperti sekarang (per-TP, tanpa tag level).
  Membedakan soal per level (Dasar/Menengah/Atas/Mahir × tiap TP × tiap
  mapel) adalah pekerjaan KONTEN BESAR terpisah, ditunda sampai mesin
  levelnya sendiri terbukti jalan baik.
- **Dihitung ULANG PENUH dari riwayat `hasil_latihan` setiap dipanggil**
  (fungsi murni `hitungLevelDariRiwayat_` di `Code.gs`, sudah diuji lolos
  dengan skenario 12 kuis campur lulus/gagal/naik-level bertingkat) — BUKAN
  disimpan sebagai counter yang di-increment sedikit-sedikit. Keputusan ini
  supaya level SELALU bisa dibuktikan benar dari data sumber; tidak mungkin
  "nyasar" beda dari riwayat sungguhan karena bug increment di suatu titik.
- **Dihitung & ditulis DI SERVER (Apps Script `doPostHitungLevel_`), BUKAN
  di klien** — keputusan keamanan sadar: siswa login anonim tidak bisa
  dibuktikan identitasnya ke Firestore Security Rules, jadi kalau level
  ditulis langsung dari klien, siswa yang paham DevTools browser bisa
  menaikkan levelnya sendiri secara curang (risiko ini nyata untuk fitur
  KOMPETITIF seperti ini, beda dari `hasil_latihan` yang sifatnya privat).
  Firestore Security Rules koleksi BARU `level_siswa` (lihat
  `firestore.rules` & `README.md`) sengaja `allow write: if false` MUTLAK
  untuk semua klien — cuma Service Account (lewat Apps Script) yang bisa
  menulis, siapa pun yang login boleh MEMBACA (dasar dari fitur
  "bandingkan level dengan teman" nanti).
- `pages/uji-kemampuan.html` memanggil endpoint baru `?type=hitung_level`
  segera setelah 1 hasil kuis berhasil tersimpan — hasilnya ditampilkan
  sebagai kotak kecil di bawah skor (progres saat ini, atau perayaan "🎉
  Level naik!" kalau baru saja naik). Gagal memanggil endpoint ini (mis.
  jaringan terputus) SENGAJA tidak ditampilkan sebagai error ke siswa —
  skor kuisnya sendiri sudah aman tersimpan terpisah, status level cuma
  bonus di atasnya.
- Perluasan kecil ke helper Firestore REST bersama (`firestoreValue_` &
  `objFromFirestoreFields_` di `Code.gs`) — sekarang mendukung angka
  (integer & desimal) dan boolean, sebelumnya cuma string & timestamp
  (cukup untuk `siswa`/`hasil_latihan` yang semua fieldnya teks/tanggal).
- **[Selesai di Fase 2 & 3, catatan ini sempat usang]** Halaman profil siswa
  dan sistem EXP sudah dibangun (lihat entri Fase 2 & 3 di bawah) — yang
  MASIH menyusul cuma papan perbandingan antar siswa, EXP dari Modul
  (menunggu jembatan pengiriman progres Modul yang belum ada), dan akses
  guru untuk melihat profil siswa tertentu (saat ini cuma siswa yang
  bersangkutan yang bisa lihat profilnya sendiri).

### Ditambahkan — Sistem Level Uji Kemampuan, Fase 2: halaman profil siswa
(belum dirilis; EXP sudah menyusul di Fase 3 di bawah, papan perbandingan
antar siswa MASIH menyusul)
- `pages/profil-siswa.html` (halaman baru) — siswa login lihat kartu level
  besar (ikon + warna berbeda per level: Dasar abu-abu, Menengah biru, Atas
  emas, Mahir ungu), bar progres menuju level berikutnya (atau lencana
  "🏆 Capaian puncak" kalau sudah Mahir tercapai), 4 kartu statistik (kuis
  dikerjakan, total lulus, skor tertinggi, rata-rata skor), dan daftar
  riwayat tiap kali naik level (tanggal + skor yang men-triggernya).
- **SENGAJA siswa-only** (bukan "siswa guru" seperti kartu lain) — ini
  profil PRIBADI 1 siswa yang sedang login, bukan alat guru mengecek siswa
  lain (guru sudah punya Riwayat Latihan & Laporan Siswa Pintu 3 untuk itu).
- Kartu menu baru "Profil & Level" ditambahkan di `index.html`, sebelah
  kartu Uji Kemampuan.
- Halaman ini CUMA MEMBACA `level_siswa/{namaSiswa}` langsung dari
  Firestore (client-side, sesuai Security Rules yang sudah dipasang di Fase
  1 — siapa saja yang login boleh baca). Kalau dokumennya belum ada (siswa
  belum pernah mengerjakan Uji Kemampuan sama sekali), tampil pesan ramah
  dengan tautan langsung ke halaman Uji Kemampuan, bukan halaman kosong/error.
- Label/ikon/warna level di halaman ini (`LEVEL_INFO`) MURNI tampilan —
  bukan sumber kebenaran. Kalau nama/ambang level di `LEVEL_TAHAP_`
  (`Code.gs`) berubah, `LEVEL_INFO` di sini perlu disesuaikan manual demi
  konsistensi, tapi TIDAK mempengaruhi logika penentuan level itu sendiri.
- **BELUM dikerjakan (fase berikutnya)**: sistem EXP, papan perbandingan
  antar siswa, dan akses guru untuk melihat profil siswa TERTENTU (saat ini
  cuma siswa yang bersangkutan yang bisa lihat profilnya sendiri).

### Ditambahkan — Sistem Level Uji Kemampuan, Fase 3: EXP
(belum dirilis; papan perbandingan antar siswa MASIH menyusul)
- **Sumber EXP** (endpoint `hitung_gamifikasi`, ganti nama dari
  `hitung_level` karena cakupannya sudah lebih luas dari sekadar level):
  - Materi Ajar: **10 EXP per materi** yang sudah ditandai "Dibaca" (dihitung
    dari sheet "Data Progres Materi" yang sudah ada, `hitungJumlahMateriDibaca_`)
  - Uji Kemampuan: **5 EXP per kuis dikerjakan** + **10 EXP bonus** kalau
    skor kuis itu ≥70% (ambang "lulus umum" yang sama dengan statistik
    `totalLulusUmum` di profil)
  - EXP dari **Modul MASIH BELUM ADA** — progres Modul sendiri belum pernah
    terkirim ke server sama sekali (gap lama, lihat bagian Direncanakan)
- **Kenapa dari aktivitas selesai, bukan durasi/waktu**: durasi gampang
  dicurangi (buka tab lalu ditinggal, tidak benar-benar belajar) —
  "materi ini sudah dibaca"/"kuis ini sudah dikerjakan" jauh lebih sulit
  dipalsukan tanpa benar-benar berinteraksi dengan kontennya.
- `materi-progress-tracker.js` sekarang ikut memanggil `hitung_gamifikasi`
  SETIAP kali materi ditandai dibaca (sebelumnya cuma dipanggil dari
  `uji-kemampuan.html` setelah kuis) — supaya EXP dari membaca materi
  langsung ter-update, tidak perlu nunggu siswa itu mengerjakan kuis dulu.
  **Sengaja ditembak BERSAMAAN dengan panggilan `progres_materi`** (bukan
  dirangkai `.then()`) — dirangkai sempat dicoba tapi DIBATALKAN karena
  berisiko panggilan `hitung_gamifikasi`-nya tidak pernah terkirim sama
  sekali kalau siswa keburu pindah halaman (skenario nyata: klik
  "Berikutnya ›" cepat-cepat) sebelum promise pertama selesai — keepalive
  cuma menjaga request yang SUDAH diinisiasi, bukan sisa kode JS yang
  belum sempat jalan. Konsekuensi menembak bersamaan: SESEKALI EXP bisa
  telat 1 hitungan (baca sheet sebelum baris barunya selesai tertulis) —
  tidak masalah, sembuh sendiri di panggilan berikutnya (EXP dihitung
  ulang PENUH tiap kali, bukan di-increment).
- **[Bug ditemukan & diperbaiki sebelum sempat dipakai]** Pesan "🎉 Level
  naik!" di `uji-kemampuan.html` (Fase 1) ternyata akan **muncul selamanya**
  di SETIAP kuis berikutnya setelah naik level pertama kali — sebabnya,
  `riwayatLevelUpJson` berisi SELURUH riwayat (bukan cuma dari panggilan
  saat ini), jadi cek "ada entri di riwayat" akan selalu benar setelah
  entri pertama masuk. Diperbaiki dengan cara BERBEDA: server sekarang baca
  dulu `level_siswa` yang TERSIMPAN SEBELUM dihitung ulang
  (`ambilLevelSiswaSaatIni_`), bandingkan dengan hasil hitungan baru, dan
  kirim flag eksplisit `baruSajaNaikLevel` yang HANYA benar kalau level
  ini benar-benar baru saja berubah di panggilan INI — klien tinggal baca
  flag itu, tidak perlu menebak-nebak dari riwayat lagi.
- Halaman profil (`profil-siswa.html`) menampilkan EXP di kartu level
  (badge "⭐ N EXP") dan sebagai kartu statistik tersendiri, plus 1 kartu
  baru "Materi Dibaca".
- **BELUM dikerjakan (fase berikutnya)**: papan perbandingan antar siswa,
  EXP dari Modul (menunggu jembatan pengiriman progres Modul yang belum
  ada), dan akses guru untuk melihat profil siswa tertentu.

### Ditambahkan — Sistem Level Uji Kemampuan, Fase 4: Papan Peringkat
(belum dirilis — sistem gamifikasi yang diminta pemilik proyek sekarang
LENGKAP sampai tahap ini: level, EXP, profil, DAN papan perbandingan)
- `pages/papan-peringkat.html` (halaman baru) — daftar SEMUA 25 siswa
  (bukan cuma yang sudah pernah mengerjakan sesuatu), dikelompokkan per
  tier level (Mahir di atas, lalu Atas/Menengah/Dasar), diurutkan EXP
  menurun di dalam tiernya masing-masing. Siswa yang belum pernah
  mengerjakan apa pun tetap muncul (di tier Dasar, berlabel "Belum mulai"
  — BUKAN "0 EXP" yang terkesan negatif) supaya papan ini mengajak semua
  orang ikut, bukan cuma memamerkan yang sudah aktif.
- **Daftar 25 nama siswa diambil dari `MPLS_STUDENTS`** (`pages/mpls/assets/
  mpls-data.js`) — BUKAN dari koleksi Firestore `siswa` (yang sengaja
  TIDAK BISA dibaca langsung dari klien, lihat komentar di `firestore.rules`
  soal proteksi NISN). `MPLS_STUDENTS` aman dipakai karena SUDAH publik
  sejak awal (daftar nama yang sama persis dipakai buat dropdown login),
  jadi tidak ada data baru yang jadi lebih terbuka gara-gara papan ini.
- **Siswa DAN guru** boleh membuka papan ini (`data-akses="siswa guru"`)
  — data level/EXP memang dirancang terbuka untuk siapa saja yang login
  sejak Fase 1 (`firestore.rules` koleksi `level_siswa`), beda dari
  `hasil_latihan` yang detail jawabannya privat. Baris nama siswa yang
  SEDANG LOGIN disorot ungu + label "← Ini kamu!" (cuma untuk akun siswa;
  guru tidak punya level, jadi tidak ada yang disorot buat mereka).
- **Keputusan desain buat menjaga suasana tetap sehat** (mengikuti
  kekhawatiran yang sempat diangkat sebelum fase gamifikasi ini dimulai —
  lihat diskusi awal soal papan perbandingan di percakapan sesi ini,
  keputusan detail pengelompokan ini dipilih sendiri sebagai default yang
  masuk akal, BELUM dikonfirmasi ulang secara eksplisit ke pemilik
  proyek): dikelompokkan per TIER LEVEL dulu (bukan 1 daftar rangking
  #1-#25 yang datar) — supaya siswa di level bawah tidak merasa "peringkat
  terakhir dari 25", tapi tetap bisa lihat "aku salah satu dari sekian
  siswa Level Dasar" dan termotivasi naik ke kelompok berikutnya.
- Tautan silang ditambahkan: `profil-siswa.html` → "Lihat Papan Peringkat →",
  dan kartu menu baru "🏅 Papan Peringkat" di `index.html`.
- **BELUM dikerjakan**: EXP dari Modul (menunggu jembatan pengiriman
  progres Modul yang belum ada — lihat catatan di Fase 3 & bagian
  Direncanakan), dan indikator "naik/turun tier minggu ini" (perbandingan
  antar waktu, bukan cuma snapshot posisi sekarang).

### Ditambahkan — Sistem Level Uji Kemampuan, Fase 5: Level 1-99 & Rank + badge
(belum dirilis)
- **Lapisan gimmick BARU, TERPISAH dari Level Kemampuan** (dasar/menengah/
  atas/mahir yang sudah ada sejak Fase 1) — perbedaannya SENGAJA: Level
  Kemampuan = indikator PENGUASAAN (ketat, cuma naik lewat kelulusan
  konsisten); **Level 1-99 & Rank = indikator KEAKTIFAN/USAHA** (naik terus
  dari EXP yang sudah ada sejak Fase 3, aktivitas apa pun), supaya siswa
  SELALU punya progres kecil untuk dikejar tiap hari, tidak cuma menunggu
  lulus kuis susah.
- **Kurva EXP per level SENGAJA TIDAK LINEAR** (`EXP_PER_LEVEL99_TAHAP_` di
  `Code.gs`) — 15 EXP/level (Level 1-10) → 30 EXP/level (10-30) → 60
  EXP/level (30-60) → 120 EXP/level (60-99). Naik cepat di awal (bikin
  nagih), makin lambat di atas (bikin Level 99 terasa istimewa — total
  ±7.215 EXP buat tembus dari nol, target realistisnya cuma segelintir
  siswa paling aktif sepanjang tahun).
- **6 Rank** (`RANK_TAHAP_`), nama edukatif bukan logam generik: Perintis
  (1-15) → Penjelajah (16-30) → Pencari Ilmu (31-50) → Cendekiawan Muda
  (51-70) → Begawan Ilmu (71-90) → Maestro Kelas 5 (91-99).
- **6 badge digenerate lewat AI image generator** (prompt disusun di sesi
  ini, hasil digenerate pemilik proyek sendiri) — disimpan di
  `assets/img/badges/rank-0N-nama.webp`, dikonversi dari PNG ke WebP
  (turun ±80% ukuran file, dari total ±2,4MB jadi ±430KB untuk 6 badge)
  supaya ringan dimuat di HP siswa. Background sudah transparan dari
  generatornya, tidak perlu diproses ulang.
- `pages/profil-siswa.html` menampilkan **2 kartu terpisah dengan judul
  jelas**: "Rank & EXP — dari keaktifan belajar" (badge gambar, nama rank,
  Level N/99, bar progres EXP) dan "Level Kemampuan — dari konsistensi
  lulus Uji Kemampuan" (kartu lama dari Fase 1-2) — supaya siswa tidak
  bingung 2 sistem ini beda arti.
- `pages/papan-peringkat.html` **pengelompokan utamanya diganti dari Level
  Kemampuan jadi Rank** (lebih granular — 6 kelompok vs 4, dan semua siswa
  yang aktif akan terus naik kelompok secara berkala, beda dari Level
  Kemampuan yang bisa lama macet di 1 tingkat) — header tiap grup pakai
  gambar badge asli, dan Level Kemampuan tetap ditampilkan sebagai tag
  kecil di tiap baris (informasi tambahan, bukan hilang).
- Perhitungan Level 1-99/Rank **murni fungsi dari `exp`** yang sudah
  dihitung server sejak Fase 3 — TIDAK butuh pertimbangan keamanan
  tambahan (turunan dari angka yang sudah tepercaya otomatis ikut
  tepercaya), tapi tetap dihitung & disimpan di server (`level99`, `rank`
  jadi field baru di dokumen `level_siswa`) demi konsistensi pola "server
  hitung, klien cuma tampilkan" yang sudah dipakai sejak awal.
- Prompt desain badge (6 rank + 2 versi alternatif nuansa Islami untuk
  Pencari Ilmu & Begawan Ilmu) didokumentasikan terpisah di file
  `badge-prompts-rank-kelas-v.md` (dibagikan ke pemilik proyek, BUKAN
  bagian dari repo situs — cuma referensi kerja).

### Ditambahkan — Avatar pilihan siswa di Profil & Papan Peringkat (belum dirilis)
- **Bug nyata diperbaiki (laporan Arif — kartu Rank/Level/Statistik menampilkan
  "undefined" di mana-mana)**: akar masalahnya `doPostSetAvatar_` (dari perbaikan
  sebelumnya) TERNYATA bisa membuat dokumen `level_siswa` baru berisi CUMA field
  `avatar` — terjadi kalau siswa memilih avatar SEBELUM pernah menyelesaikan Uji
  Kemampuan/materi/modul apa pun. `profil-siswa.html` sebelumnya cuma mengecek
  `snap.exists()` untuk memutuskan tampilkan kartu penuh vs pesan "belum ada data" —
  dokumen avatar-saja itu LOLOS cek `exists()` (karena memang ada), tapi tidak punya
  field level/rank/exp sama sekali, jadi seluruh kartu menampilkan "undefined".
  Diperbaiki dengan mengecek keberadaan field `level` (SELALU diisi tiap kali
  gamifikasi dihitung), bukan cuma `exists()`. `papan-peringkat.html` punya celah
  serupa (kurang parah, sudah ada fallback `|| 0` di beberapa tempat) — ikut
  diperbaiki supaya siswa yang baru pilih avatar tetap tampil "Belum mulai" yang
  benar (avatarnya tetap kelihatan).
- **Panel pemilih avatar dirombak jadi bisa disembunyikan/dibuka lagi** (perbaikan
  ke-2 setelah laporan Arif) — dengan aturan yang lebih pintar dari versi
  "selalu terbuka" maupun versi awal "selalu tertutup di balik ikon pensil":
  panel terbuka OTOMATIS kalau siswa BELUM PERNAH pilih avatar (gampang
  ditemukan pertama kali), lalu tertutup OTOMATIS begitu berhasil memilih
  (tidak makan tempat terus). Tombol jelas "✏️ Ganti Avatar" (bukan ikon
  pensil kecil yang sempat bikin bingung) selalu ada untuk membuka lagi
  kapan saja.
- **Perbaikan (setelah laporan Arif — panel avatar sempat "tidak muncul")**: panel pemilih
  avatar sekarang SELALU TERLIHAT langsung di bawah header profil, TIDAK disembunyikan
  di balik ikon pensil seperti versi awal. Versi awal saya sembunyikan panel ini secara
  sepihak tanpa dikonfirmasi ulang ke Arif — beda dari pratinjau yang sudah disetujui
  (yang selalu menampilkan panel langsung). Ikon pensil kecil juga berisiko sama tidak
  disadarinya oleh siswa kelas 5, jadi dihapus sepenuhnya, bukan cuma diperbaiki.
- Siswa bisa memilih 1 dari **16 avatar** ilustrasi (rubah, panda, harimau, burung hantu,
  kodok, singa, koala, unicorn, kura-kura, gurita, kucing, anjing, kelinci, gajah, pinguin,
  rusa — 10 pertama + 6 tambahan) lewat panel baru di `profil-siswa.html` — dibuka lewat
  ikon pensil di avatar besar pada header profil. Ke-16 gambar WebP SUDAH ada
  (`assets/img/avatars/`, ~237KB total), dipotong & diverifikasi rapi dari lembar gambar
  4×4 yang dibuat Arif via AI image generator (prompt: `avatar-prompts-siswa-kelas-v.md`).
- **Foto asli TIDAK diimplementasikan** — direkomendasikan Claude untuk TIDAK dibangun sama
  sekali (bukan cuma ditunda): platform ini dipakai anak SD dengan login anonim (tidak ada
  identitas terverifikasi) dan arsitektur *fire-and-forget* tanpa antrean moderasi sama
  sekali, jadi upload foto bebas berisiko dari sisi keamanan-anak & privasi tanpa
  infrastruktur moderasi yang memang belum ada di proyek ini.
- Avatar disimpan sebagai field baru `avatar` di `level_siswa/{namaSiswa}` (BUKAN di
  koleksi `siswa/{nisn}` yang sengaja terkunci total dari klien) — supaya bisa dibaca
  gratis lewat query yang sudah ada untuk Papan Peringkat & Profil, tidak perlu endpoint
  baca borongan baru.
- **Bug tersembunyi yang dicegah sebelum sempat terjadi**: `setLevelSiswaFirestore_` selalu
  MENIMPA SELURUH dokumen (PATCH tanpa updateMask) — kalau tidak ditangani, field `avatar`
  akan HILANG setiap kali `hitung_gamifikasi` jalan (tiap kali siswa baca materi/kerjakan
  kuis/selesaikan modul). Diperbaiki dengan fungsi baru `ambilLevelSiswaLengkap_()` yang
  membaca dokumen penuh dulu sebelum menimpa, dipakai baik oleh `doPostHitungGamifikasi_`
  (supaya avatar tidak hilang) maupun `doPostSetAvatar_` (supaya level/rank/exp tidak
  hilang saat ganti avatar).
- Server: endpoint `doPost` baru `type: "set_avatar"` dengan whitelist tertutup 10 ID
  avatar (`AVATAR_VALID_IDS_`) — menolak nilai avatar sembarangan (proteksi dari siswa
  yang mengulik DevTools).
- Papan Peringkat (`papan-peringkat.html`) menampilkan avatar kecil di tiap baris siswa
  (fallback emoji 🙂 kalau siswa belum pernah memilih, atau kalau gambarnya gagal dimuat).
- Ilustrasi avatar dibuat via AI image generator (sama gaya dengan 6 badge Rank yang sudah
  ada) — prompt & instruksi lengkap dibagikan terpisah ke Arif
  (`avatar-prompts-siswa-kelas-v.md`, BUKAN bagian repo). **Sudah selesai digenerate,
  dipotong dari lembar 4×4, dan dipasang di `assets/img/avatars/`** — fallback emoji di
  setiap `<img>` tetap dipertahankan sebagai jaring pengaman kalau ada nama file yang belum
  konsisten, bukan berarti masih dibutuhkan untuk fitur ini berfungsi.

### Ditambahkan — Progres Modul & filter mapel di "Perkembangan Belajar Mandiri" (Pintu 2, belum dirilis)
- **Progres Modul ditambahkan** (sebelumnya kotak "Segera Hadir" statis) — sekarang orang tua
  bisa lihat modul mana yang sudah/belum diselesaikan anaknya, dari sheet "Data Progres
  Modul" (§38). Ditampilkan sebagai daftar checklist (✅/⬜ per modul) di bawah subjudul
  "🧩 Modul", terpisah dari subjudul "📖 Materi Ajar" — SENGAJA tidak digabung per-TP karena
  skema kode TP di `materi-index.js` & `modul-index.js` untuk beberapa elemen (mis. Bahasa
  Indonesia · Menulis) tidak cocok satu sama lain; join yang dipaksakan lebih rapuh daripada
  2 subseksi terpisah.
- `modul-index.js` menambah field baru `slug` di SEMUA 42 entri — dibutuhkan karena "Modul
  Slug" yang tersimpan di server (dari `STORAGE_KEY` internal tiap file modul.html) TIDAK
  bisa ditebak otomatis dari nama folder (ada pengecualian tidak beraturan, mis. folder
  `kpk-fpb-tp4` tapi slugnya `mtk-kpkfpb-tp4`).
- **Filter per mata pelajaran (chip)** ditambahkan — SEBELUMNYA seluruh mapel dirender
  terbuka sekaligus (jadi sangat panjang begitu kontennya bertambah, terutama setelah
  Pendidikan Pancasila didaftarkan lengkap di atas). Sekarang detail Materi+Modul HANYA
  dirender untuk 1 mapel yang dipilih; mapel pertama yang ada datanya dipilih otomatis saat
  laporan dibuka supaya tetap ada sesuatu yang langsung terlihat tanpa perlu tap dulu.
- **"🕐 Aktivitas Terbaru" ditambahkan** — daftar 8 aktivitas (materi dibaca / modul
  diselesaikan) TERBARU lintas SEMUA mapel sekaligus, dengan label waktu ramah ("Hari ini,
  14:32" / "Kemarin, 09:10" / "3 hari lalu" / tanggal biasa kalau >6 hari) — SELALU
  terlihat di atas, tidak terpengaruh filter mapel, supaya orang tua langsung tahu KAPAN
  & APA yang terakhir dipelajari anaknya tanpa perlu memilih mapel dulu (kebutuhan yang
  diminta eksplisit: memonitor belajar mandiri anak di rumah).
- Server: endpoint `doGet` baru `?progresModul=1&nama=..&idToken=..` (sama pola & gerbang
  akses `wajibAksesLaporan_` dengan `?progresMateri=1` yang sudah ada).
- Ringkasan keseluruhan (kartu di atas) sekarang menampilkan 2 angka berdampingan: Materi
  dibaca DAN Modul selesai, keduanya lintas semua mapel — tidak terpengaruh filter.

### Diperbaiki — `modul-index.js` tidak sinkron dengan file modul.html nyata (belum dirilis)
- **Temuan saat mengerjakan EXP Modul di atas**: 16 dari 41 file `modul.html` yang
  SUDAH lengkap di repo TERNYATA TIDAK PERNAH terdaftar di `modul-index.js` —
  akibatnya TIDAK PERNAH tampil di menu Modul siswa sama sekali (cuma bisa
  diakses kalau tahu URL persis): SELURUH 10 modul **Pendidikan Pancasila**
  (mapel ini sebelumnya 0 entri!) + 3 modul Matematika elemen Pengukuran
  (`durasi-waktu-tp3`, `keliling-luas-tp1`, `segi-banyak-tp2`) + 3 modul Bahasa
  Indonesia yang foldernya sudah diganti nama tapi entri lama masih menunjuk ke
  nama folder lama (link mati): `menulis-imajinasi`, `menulis-pengalaman`,
  `menulis-pengamatan`.
- 1 entri lama (`menulis-gagasan-tp3`) DIHAPUS — menunjuk ke modul yang
  ternyata tidak pernah dibuat sama sekali (TP-nya `TL-Gagasan` ada di
  kurikulum, tapi file `modul.html`-nya tidak ada).
- **`tp-kko-index.js` juga diperbaiki**: TP Bhinneka Tunggal Ika yang tadinya 1
  kode (`BTI-C1`) dipecah jadi 3 kode baru (`BTI-C1a`/`BTI-C1b`/`BTI-C1c`) —
  dikonfirmasi eksplisit oleh pemilik proyek bahwa TP ini memang sudah dipecah
  jadi 3 sub-TP saat modulnya dibuat, tp-kko-index.js sebelumnya belum
  disesuaikan. `cp-tp-atp.html` (halaman referensi kurikulum) ikut diperbarui
  jadi 3 kartu TP terpisah supaya tidak sinkron lagi dengan tp-kko-index.js.
- Semua 41 file `modul.html` sekarang terdaftar (0 hilang), 0 path rusak, 0
  duplikat `tp`/`file` — diverifikasi lewat skrip pengecekan silang otomatis.
- **Pelajaran untuk ke depan**: ini persis pola yang sama dengan insiden "38
  file materi tidak terdaftar" yang pernah terjadi di `materi-index.js` —
  index statis seperti ini rawan tidak sinkron kalau file ditambah langsung ke
  repo tanpa mendaftarkannya. Perlu dibiasakan SELALU mendaftarkan modul/materi
  baru ke index-nya di saat yang sama dengan menambah file-nya, bukan
  belakangan.

### Ditambahkan — EXP dari Modul (menutup gap lama, belum dirilis)
- **Menutup celah yang sudah lama diketahui**: sejak Fase 3 EXP, sumber EXP cuma Materi Ajar
  + Uji Kemampuan — progres Modul sendiri belum pernah terkirim ke server sama sekali
  (tercatat eksplisit di kode sebagai "MENYUSUL"). Sekarang siswa yang menuntaskan Modul juga
  dapat EXP, sama seperti Materi Ajar.
- **"Selesai" = mencapai HALAMAN TERAKHIR modul**, BUKAN sekadar membuka halaman (beda dari
  Materi Ajar yang cukup "dibuka" — materi cuma 1 halaman singkat, modul 6-8 halaman + kuis
  tertanam di tiap bagian, jadi butuh bukti keterlibatan lebih dari sekadar membuka).
  Terdeteksi lewat monkey-patch `window.goToPage` bawaan tiap modul (dipanggil dengan
  `n === TOTAL_PAGES - 1`) di file baru `pages/modul/assets/modul-progress-tracker.js`,
  dipasang di SEMUA 41 file `modul.html`.
- **EXP per modul: 25** (direkomendasikan Claude, bisa diubah lewat 1 konstanta
  `EXP_PER_MODUL_` di `Code.gs`) — lebih besar dari materi (10) untuk merefleksikan modul
  yang jauh lebih panjang/mendalam (setara kira-kira 2,5 materi atau lebih dari 1 sesi kuis
  penuh dengan bonus lulus).
- Server: sheet baru "Data Progres Modul" (self-healing, pola identik "Data Progres Materi"),
  endpoint `doPost` baru `type: "progres_modul"` (upsert per Nama Siswa + Modul Slug, TANPA
  gerbang guru — sama level keamanan dengan `progres_materi`), fungsi
  `hitungJumlahModulDiselesaikan_()`. `doPostHitungGamifikasi_()` sekarang menjumlahkan EXP
  dari 3 sumber: materi + modul + kuis.
- `profil-siswa.html` menambah 1 kartu statistik baru "Modul Selesai" (field
  `jumlahModulSelesai`, sama pola dengan "Materi Dibaca").
- **Sama seperti Materi/Uji Kemampuan**: dihitung ulang PENUH dari sumber (sheet "Data
  Progres Modul") setiap `hitung_gamifikasi` dipanggil, BUKAN counter yang di-increment —
  aman dipanggil berkali-kali tanpa menggandakan EXP.

### Diubah — Panel Admin: rapikan tab Uji Kemampuan, hapus tab Materi Ajar (belum dirilis)
- **Tab "Uji Kemampuan" dirombak jadi berorientasi CARI & EDIT**, bukan tambah
  massal (penambahan massal sudah dan tetap lewat tab Impor Massal, terpisah
  sejak awal). Ditambahkan filter: Mata Pelajaran → TP (dependen), Kompleksitas
  (dasar/menengah/menantang), Jenis Soal, dan pencarian teks pertanyaan — semua
  disaring DI KLIEN dari 1x fetch (`allSoalItems`), tanpa query Firestore
  tambahan tiap filter berubah.
- Sebelumnya soal SUDAH dikelompokkan per Mapel→TP (`loadSoal()`), tapi cuma
  jadi header visual di tengah daftar panjang tanpa cara menyaring — dengan
  pool 200 soal/TP, halaman jadi sangat panjang untuk diedit. Sekarang bisa
  langsung difilter ke satu TP + satu kompleksitas.
- Badge kompleksitas di tiap item sekarang menandai jelas `⚠ belum ditandai`
  untuk soal lama yang field `kompleksitas`-nya kosong (relevan sejak Fase 6
  Level Kemampuan — soal begini tidak akan pernah muncul ke siswa).
- **Form "Tambah Soal Baru" disembunyikan default** di balik tombol
  "➕ Tambah Soal Manual" (collapsed), karena penggunaan nyatanya sudah hampir
  murni untuk EDIT (klik "Edit" pada daftar otomatis membuka & scroll ke form).
  Form ini tidak dihapus — form ini yang dipakai `editSoal()`/`simpanSoal()`
  untuk memperbaiki soal satu per satu.
- **Tab "Materi Ajar" DIHAPUS SELURUHNYA** (markup, CSS trigger, & semua fungsi
  JS: `simpanMateri`, `editMateri`, `batalEditMateri`, `hapusMateri`,
  `loadMateri`) — terbukti kode mati sejak awal: koleksi Firestore `materi`
  yang ditulis form ini TIDAK PERNAH dibaca halaman manapun. Materi ajar yang
  sungguhan dibaca siswa adalah sistem terpisah total (HTML statis +
  `materi-index.js`, lihat `pages/materi/`), dikelola manual lewat repo.
- **Tab "Modul" DIPERTAHANKAN** (beda dari Materi Ajar) — `modul.html` yang
  dilihat siswa BENAR membaca dari koleksi Firestore `modul` yang dikelola tab
  ini, jadi tab ini bukan kode mati.

### Ditambahkan — Sistem Level Uji Kemampuan, Fase 6: soal disesuaikan otomatis dengan level (belum dirilis)
- **Menutup celah lama**: sejak Fase 1, Level Kemampuan (dasar/menengah/atas/
  mahir) sudah dihitung dari riwayat, tapi `uji-kemampuan.html` selalu mengambil
  soal ACAK dari SELURUH pool TP tanpa peduli `kompleksitas` sama sekali — level
  siswa dihitung tapi tidak pernah benar-benar memengaruhi soal apa yang dia
  terima. Fase 6 menyambungkan keduanya: soal yang diberikan sekarang mengikuti
  Level Kemampuan siswa saat ini.
- **Skema `kompleksitas` TETAP 3 nilai** (`dasar`/`menengah`/`menantang` — tidak
  ditambah jadi 4), keputusan eksplisit pemilik proyek: `menantang` dipakai
  BERSAMA untuk Level Kemampuan **Atas** maupun **Mahir**. `bank_soal` dan
  `admin.html` TIDAK berubah sama sekali.
- **Fallback otomatis turun tingkat**: kalau pool soal kompleksitas target
  (sesuai level siswa) di suatu TP belum cukup (< 5 soal), sistem otomatis
  turun ke kompleksitas di bawahnya (menantang→menengah→dasar), dengan catatan
  kecil ditampilkan ke siswa di kartu TP maupun di layar kuis. Kalau bahkan
  Dasar pun belum cukup, TP itu dinonaktifkan untuk diuji.
- **Dibaca langsung dari klien, TANPA endpoint Apps Script baru**: level siswa
  dibaca langsung dari `level_siswa/{namaSiswa}` (aturan baca publik sudah ada
  sejak Fase 1), lalu pool `bank_soal` per TP diunduh 1x (equality tunggal
  `tp==X`, sama seperti sebelumnya) dan dikelompokkan per `kompleksitas` DI
  KLIEN — **sengaja menghindari composite index Firestore baru** (2 filter
  kesetaraan field berbeda WAJIB composite index), mengikuti pola yang sama
  dengan pengelompokan modul per mapel di klien (lihat ANTIREGRESI §16). Jadi
  **tidak ada langkah manual Firebase Console baru** untuk fitur ini.
- **Mode guru dipisah dari mode siswa**: siswa SELALU otomatis mengikuti level
  (tidak ada pilihan manual). Guru punya dropdown "tampilkan soal tingkat:" di
  Tahap 1 (Semua/Dasar/Menengah/Menantang) — default "Semua tingkat" memakai
  JALUR LAMA yang tidak berubah sama sekali (termasuk trik randKey 2-query),
  supaya guru tetap bisa melihat/menguji seluruh pool apa adanya (termasuk
  soal lama yang belum ditandai `kompleksitas`). Kalau guru pilih tingkat
  spesifik, TIDAK ada fallback (murni pratinjau pool tingkat itu).
- Dokumen `hasil_latihan` sekarang punya field baru `kompleksitasSoal`
  (`"dasar"`/`"menengah"`/`"menantang"`/`null` untuk mode guru "semua") —
  aditif, tidak mengubah dokumen lama, untuk keperluan audit/laporan di masa
  depan.
- **Peringatan penting**: soal LAMA yang belum pernah ditandai `kompleksitas`
  (field kosong/undefined) TIDAK akan pernah muncul di sesi siswa manapun
  sejak Fase 6 ini (tidak cocok ke tingkat apa pun) — hanya tetap terlihat
  lewat mode guru "Semua tingkat". Perlu dicek `bank-soal.html`/`admin.html`
  apakah ada soal lama yang perlu ditandai kompleksitasnya secara manual.

### Direncanakan
- Isi konten asli `cp-tp-atp.html` (CP/TP/ATP resmi per mapel) dan `jadwal.html`
  (jadwal mingguan resmi) — kerangkanya sudah ada sejak v0.9.0, tinggal menunggu
  dokumen dari sekolah untuk diisi (lihat catatan "Halaman ini masih kerangka"
  di kedua halaman tsb)
- Gerbang akses `input.html` masih pakai kode akses sederhana (belum dipindah ke
  Firebase) — sengaja tidak diubah dulu di update ini supaya tidak regresi
- **[Selesai, catatan ini sempat usang 2x]** Hasil pengerjaan siswa di Uji
  Kemampuan tersimpan ke Firestore (koleksi `hasil_latihan`), direkap guru
  lewat `pages/riwayat-latihan.html`, DAN laporan "Latihan Mandiri Siswa"
  untuk guru & orang tua (Pintu 3, `pages/laporan-siswa/latihan-mandiri.html`)
  SUDAH aktif juga (bukan lagi kerangka "Segera Hadir") — baca langsung dari
  Firestore di sisi klien, lihat detail arsitekturnya di `ANTIREGRESI.md` §28.
  **Belum diuji sungguhan** di browser/Firebase asli sejak dibangun.
- Migrasi Firestore untuk data MPLS/Kognitif/Jurnal Aktivitas/metadata Galeri
  Visual — SENGAJA ditunda sebagai proyek terpisah setelah Sistem Login Baru
  (lihat `RANCANGAN-MIGRASI-FIRESTORE.md`), supaya tidak merombak semua fitur
  sekaligus dalam 1 gelombang perubahan. Cuma "Data Siswa" yang sudah pindah.
- Penegakan akses per-role belum menjangkau 150+ file materi/modul individual
  (`pages/materi/.../*.html`, `pages/modul/.../*.html`) — sengaja dibatasi ke
  9 halaman induk saja untuk saat ini (lihat `ANTIREGRESI.md` §32)
- Progres Modul (separuh laporan "Perkembangan Belajar Mandiri", Pintu 2) —
  modul contoh yang pernah diberikan indikator "X% selesai"-nya murni
  dihitung & disimpan di variabel JavaScript browser, hilang total begitu
  halaman ditutup/refresh, TIDAK ada satu byte pun terkirim ke server.
  Supaya progres ini bisa muncul di laporan, modul-modul berikutnya perlu
  "jembatan" baru (fungsi kirim progres ke Apps Script tiap berubah/ditutup)
  — ditunda sampai ada modul sungguhan yang mau dipakai, dan perlu pola/
  template baku dulu supaya jembatan ini konsisten di semua modul ke depan
  (bukan ditambal manual beda-beda tiap modul)
- Laporan MPLS untuk orang tua (Pintu 1) belum menampilkan foto profil siswa
  — proxy `?foto=` yang sudah ada masih hard-gated `wajibGuru_()` saja;
  menampilkan foto untuk orang tua butuh perubahan ke `serveFotoBinary_()`
  supaya bisa dibatasi cakupannya per-anak (bukan sekadar ganti gerbang),
  disengaja ditunda supaya tidak menyentuh model keamanan proxy foto siswa
  yang sudah berjalan tanpa perhatian desain khusus
- Opsi cetak/PDF belum ada di Pintu 1 (MPLS)/Pintu 2/Pintu 3 Laporan Siswa —
  browser sudah punya Ctrl+P/Cmd+P bawaan sebagai solusi sementara, tampilan
  belum dioptimalkan khusus untuk itu (beda dari laporan MPLS ASLI di
  `pages/mpls/laporan*.html` yang sudah punya cetak PDF A4 sejak lama)

### Ditambahkan (v0.11.0, sesi ini — Sistem Login Baru)
Perombakan penuh mekanisme login, dari 1 jenis akun (email+password untuk
semua orang) menjadi 3 peran terpisah dengan cara masuk & hak akses
masing-masing. Rancangan migrasi Data Siswa yang terkait ada di
`RANCANGAN-MIGRASI-FIRESTORE.md`.

- **Login Siswa (nama + NISN)** — siswa tidak lagi pakai email/password,
  cukup pilih namanya dari daftar (sumber: `MPLS_STUDENTS` di
  `pages/mpls/assets/mpls-data.js`, satu sumber kebenaran yang sudah dipakai
  di tempat lain juga) + masukkan NISN 10 digit. Diverifikasi ke Apps Script
  (`type: "siswa_login"`, `Code.gs`) yang membaca Firestore `siswa/{nisn}`
  langsung by ID dokumen — responsnya cuma `status`/`message` generik, tidak
  pernah membocorkan data profil atau info mana yang salah (nama/NISN).
  Kalau cocok, sesi dibuat lewat Firebase Anonymous Auth + nama tampilan
  disimpan `sessionStorage` (bukan `localStorage`), dan sesi ini SENGAJA
  diset `browserSessionPersistence` (per-tab, tidak lintas tab/lintas
  buka-tutup browser) — beda dari guru/orangtua yang tetap
  `browserLocalPersistence` seperti semula.
- **Migrasi "Data Siswa" ke Firestore** (koleksi `siswa/{nisn}`, NISN = ID
  dokumen) — sebelumnya di sheet Google Sheets, rawan hilang kalau ada yang
  tidak sengaja menghapus data langsung di spreadsheet. Dibaca/ditulis Apps
  Script pakai kredensial Service Account (JWT ditandatangani manual pakai
  `Utilities.computeRsaSha256Signature`, ditukar ke access token OAuth2) yang
  MELEWATI Firestore Security Rules (diatur IAM, bukan Rules) — sengaja
  begitu supaya cek NISN saat login (sebelum ada sesi Auth sama sekali)
  tetap bisa jalan tanpa NISN pernah terekspos ke klien. 25 siswa berhasil
  dimigrasi & diverifikasi. `pages/kelas/index.html` (form kelola data
  siswa) ikut disesuaikan: field NISN jadi wajib (karena jadi ID dokumen),
  ditambah panel "Impor NISN Massal" (tempel banyak `Nama, NISN` sekaligus,
  divalidasi ke roster resmi 25 siswa supaya salah ketik tidak nyasar jadi
  dokumen baru).
- **Pendaftaran & Persetujuan Orang Tua** — orang tua/wali yang belum punya
  akun bisa daftar mandiri lewat `daftar-orangtua.html` (pilih nama anak +
  email + kata sandi + WhatsApp opsional), status awal `pending_orangtua`
  sampai disetujui guru. Guru menyetujui/menolak lewat tab baru **"👪
  Persetujuan Orang Tua"** di `pages/admin.html`. Selama belum/tidak
  disetujui, `index.html` menampilkan layar status ("Menunggu Persetujuan"/
  "Pendaftaran Ditolak") yang mengganti SELURUH aplikasi, bukan cuma
  menyembunyikan sebagian menu. Aturan Firestore koleksi `users` diperbarui
  (lihat `README.md` §🔒 Keamanan): pendaftar cuma boleh membuat dokumennya
  sendiri dengan role persis `"pending_orangtua"` (mencegah eskalasi
  privilese jadi guru/orangtua langsung dari sisi klien), dan guru sekarang
  bisa **membaca** (query, bukan cuma menulis) dokumen siapa saja.
- **Lupa Kata Sandi** (guru/orangtua) — tombol "Lupa kata sandi?" di halaman
  login, pakai `sendPasswordResetEmail` bawaan Firebase. Pesan hasil SENGAJA
  sama persis baik email terdaftar maupun tidak, supaya fitur ini tidak bisa
  dipakai mengecek email siapa saja yang punya akun.
- **Pembatasan Akses per Role** (di luar 6 fase login semula, permintaan
  tambahan pertengahan proyek) — siswa cuma bisa akses Modul Pembelajaran,
  Materi Ajar, Galeri Visual, Uji Kemampuan; orang tua cuma Laporan Siswa &
  Pengumuman; guru tidak dibatasi. Ditegakkan 2 lapis: kartu menu di beranda
  disembunyikan per role (`data-akses` + `terapkanAksesMenu_()`), DAN
  penegakan sungguhan di 9 halaman induk lewat guard baru
  `assets/js/role-guard.js` (bukan cuma kartunya yang hilang — buka
  langsung lewat URL pun ditolak).

**Bug regresi nyata yang ditemukan & diperbaiki di sepanjang pengerjaan ini**
(kebanyakan karena akun siswa sekarang anonim, tidak punya dokumen Firestore
`users/{uid}` seperti sebelumnya — beberapa tempat lain di kode masih
mengasumsikan itu selalu ada):
- `pages/uji-kemampuan.html` — hasil latihan siswa bisa tersimpan dengan nama
  kosong/undefined (baca ulang Firestore yang tidak ada untuk akun anonim).
- `pages/materi/assets/materi-progress-tracker.js` — pelacak progres Materi
  Ajar (dasar Laporan Siswa Pintu 2) berhenti total mencatat progres siswa.
- `pages/laporan-siswa/assets/laporan-guard.js` — logikanya tadinya
  blacklist ("kalau bukan siswa, boleh masuk"), diperketat jadi whitelist
  eksplisit (guru/orangtua saja) — kalau tidak, role baru `pending_orangtua`/
  `rejected` akan ikut lolos ke Laporan Siswa.
- `index.html` — Panel Guru/Panel Kelas/kartu Laporan Siswa cuma pernah
  ditampilkan, tidak pernah disembunyikan balik; kalau di 1 tab yang sama
  ada pergantian akun tanpa reload halaman (mis. guru logout lalu orang tua
  login), panel-panel itu "nyangkut" tampil dari sesi sebelumnya.
- `daftar-orangtua.html` — kalau penyimpanan Firestore gagal SETELAH akun
  Firebase Auth-nya sempat terbuka (mis. aturan Firestore belum ter-publish),
  akun itu "nyangkut" tanpa data & tidak bisa didaftar ulang pakai email yang
  sama ("email sudah terdaftar"). Diperbaiki: akun yang nyangkut itu otomatis
  dihapus lagi (`deleteUser`) begitu penyimpanan gagal.

### Diperbaiki (sesi dokumentasi & audit Uji Kemampuan)
- **[Laporan insiden nyata]** 1 siswa mengerjakan Uji Kemampuan, hasilnya
  tersimpan (label "✓ Hasil tersimpan" muncul benar), TAPI di Riwayat
  Latihan namanya tampil "(Tanpa nama)" — field `namaSiswa` kosong di
  dokumen `hasil_latihan` walau `uid` & data lain tersimpan normal. Akar
  masalah pastinya BELUM ditemukan (kode login sudah dicek, sekilas tidak
  ada bug jelas — kemungkinan kasus tepi terkait sesi tab, belum
  dikonfirmasi), TAPI 2 pertahanan langsung ditambahkan supaya kejadian
  ini TIDAK BISA lagi tersimpan diam-diam ke depannya:
  1. `pages/uji-kemampuan.html` — sebelum menilai & menyimpan kuis, kalau
     `namaSiswa` kosong/tidak terbaca, tampilkan `alert()` minta siswa
     logout & login ulang, TOLAK simpan sama sekali (skor tidak akan
     tampil kalau nama kosong — lebih baik siswa disuruh ulang daripada
     hasilnya tersimpan tapi tidak bisa dikenali guru).
  2. Firestore Security Rules `hasil_latihan` (`README.md`) — klausa
     `create` sekarang juga mewajibkan `namaSiswa` berupa string tidak
     kosong. **⚠️ PENTING: perubahan rules ini baru berlaku kalau
     di-copy-paste ulang secara manual ke Firebase Console → Firestore
     Database → tab Rules → Publish** — proyek ini tidak pakai
     `firestore.rules` yang otomatis ter-deploy, jadi mengedit
     `README.md` saja TIDAK CUKUP.
  - Ditemukan juga saat menelusuri: komentar "v1.1" di
    `uji-kemampuan.html` (soal `nama` yang dulu salah dibaca ulang dari
    `Firestore users/{uid}` untuk siswa anonim, sekarang dari
    `role-verified` langsung) **tidak pernah tercatat di CHANGELOG ini**
    — dicatat sekarang untuk sejarah, walau BUKAN penyebab insiden di
    atas (pemilik proyek konfirmasi kode versi ini sudah live sebelum
    insiden terjadi).
- **["Bug UID anonim" yang sempat ditandai kritis — ternyata bukan blocker,
  melainkan kode mati]**: `riwayat-latihan.html` punya cabang `role ===
  "siswa"` (`muatUntukSiswa`, query `hasil_latihan` berdasar `uid`) DAN
  cabang `role === "orangtua"` yang **tidak pernah bisa terpicu** — halaman
  ini digerbang `guardRolePage(['guru'], ...)`, dan kebijakan proyek
  (tabel fitur di `README.md`) memang mengecualikan siswa dari SEMUA
  laporan/riwayat sejak awal. Kedua cabang mati itu (termasuk pencocokan
  `uid` yang memang tidak akan pernah cocok lintas sesi anonim) sudah
  **dihapus** — halaman ini sekarang jujur cuma berisi jalur guru. Aturan
  keamanan `hasil_latihan` di `README.md` DIBIARKAN apa adanya (klausa
  `uid` tidak berbahaya walau tidak terpakai), tapi diberi catatan jelas
  soal kenapa klausa itu tidak akan berfungsi kalau suatu saat diaktifkan.
- **Label "Belum Dijawab" (fitur v0.9.1) hilang total saat redesain 5-jenis-
  soal `uji-kemampuan.html` dibangun** — ditemukan saat merapikan
  `ANTIREGRESI.md` §19: soal yang tidak disentuh sama sekali sebelumnya
  tidak diberi tanda apa pun (bukan hijau, bukan merah), berisiko dikira
  "otomatis benar" oleh siswa yang buru-buru. Dikembalikan untuk 4 dari 5
  jenis soal (pg_tunggal, pg_kompleks, pg_kategori, menjodohkan): soal yang
  sama sekali tidak disentuh diberi label merah "⚠ Belum dijawab" di nomor
  soal, dan baris skor mencantumkan jumlahnya ("· N soal belum dijawab").
  Jenis **mengurutkan** sengaja TIDAK diberi label ini — soal itu selalu
  menampilkan urutan default begitu kuis dibuka, jadi tidak ada state
  "kosong" yang bisa dibedakan dari "sudah disusun ulang". Soal yang
  DISENTUH SEBAGIAN (mis. pg_kategori/menjodohkan yang sebagian baris
  diisi) tidak diberi label ini — baris yang kosong tetap ditandai merah
  seperti jawaban salah biasa, konsisten dengan perilaku lama.

### Diperbaiki (v0.10.x, sesi ini)
- **IPAS tidak bisa diakses dari situs sama sekali padahal filenya sudah ada di
  repo** — akar masalahnya: 33 file materi IPAS (mapel benar-benar baru) dan 5
  file Matematika (bilangan-tp4, bilangan-tp5) ditambahkan langsung ke folder
  `pages/materi/` TANPA entri yang sesuai di `pages/materi/assets/materi-index.js`.
  Karena `materi.html`, Galeri Visual, dan laporan "Perkembangan Belajar Mandiri"
  SEMUANYA murni baca dari `materi-index.js` (bukan memindai folder), 33 file
  IPAS itu 100% tidak terlihat dari situs walau secara fisik ada di repo.
  Diperbaiki: 38 entri (33 IPAS + 5 Matematika) ditambahkan ke `materi-index.js`,
  metadata (judul, ringkasan, elemen, tema, urutan) diekstrak dari isi tiap file
  materi itu sendiri. Total sekarang 89 entri = 89 file (BI 42, Matematika 14,
  IPAS 33) — cocok persis, tidak ada lagi file yang "tidak terdaftar".
- **Progres Materi Ajar belum menjangkau Matematika** — 14 file Matematika
  (termasuk yang lama) belum punya tag `<script src=".../materi-progress-tracker.
  js">`, karena file-file itu ditambahkan/diperbarui setelah pemasangan tracker
  batch sebelumnya. Skrip penyisipan (idempoten, sama dengan yang dipakai
  sebelumnya) dijalankan ulang — sekarang 89/89 file materi (100%) punya tracker,
  bukan 75/81 seperti sebelumnya.
- Ditambahkan catatan baru di `ANTIREGRESI.md` bagian "Catatan Penting": checklist
  wajib tiap kali ada materi baru ditambahkan ke repo (oleh siapa saja, bukan cuma
  lewat sesi kerja dengan Claude) — supaya kelas bug ini (file ada tapi tidak
  terdaftar) tidak terulang untuk mapel/materi berikutnya.

### Ditambahkan
- **Progres Materi Ajar** (separuh laporan "Perkembangan Belajar Mandiri",
  Pintu 2 — lihat `ANTIREGRESI.md §28` §7.1) — siswa yang membuka
  1 materi ajar sekarang otomatis tercatat "sudah dibaca":
  - `pages/materi/assets/materi-progress-tracker.js` — dipasang di
    **81 halaman materi** (disisipkan otomatis lewat skrip 1x jalan, bukan
    diedit manual satu-satu), fire-and-forget, hanya mencatat kalau yang
    membuka adalah role `"siswa"` (guru yang mengecek isi materi tidak
    ikut tercatat). Punya inisialisasi Firebase sendiri (terpisah dari
    `auth-guard.js`, mengikuti pola `laporan-guard.js`) dan menuliskan
    ulang `APPS_SCRIPT_URL` secara lokal supaya 81 halaman materi tidak
    perlu tambah baris `<script>` lagi untuk `config.js`.
  - Backend: sheet baru "Data Progres Materi" (self-healing seperti sheet
    lain), upsert per (Nama Siswa + Materi Slug) lewat helper baru
    `findRowByTwoColumns_()` — supaya 1 siswa buka 1 materi berkali-kali
    tetap 1 baris, bukan menumpuk. Endpoint baca `?progresMateri=1`
    memakai gerbang akses SAMA dengan `?laporanSiswa=1`
    (`wajibAksesLaporan_()` — guru bebas, orang tua cuma anaknya sendiri).
  - `pages/laporan-siswa/belajar-mandiri.html` (dulu halaman "Segera
    Hadir" statis) sekarang aktif untuk bagian Materi Ajar: ringkasan
    keseluruhan (X/Y materi, persentase) + rincian per mapel → per TP
    dengan progress bar, dikelompokkan memakai `materi-index.js` (sumber
    tunggal yang sama dipakai Galeri Visual). Bagian Modul masih "segera
    menyusul" (kotak penjelasan terpisah di bawah, lihat §7.2 di rancangan).
  - Refactor pendukung: pemilih siswa (guru cari siapa saja / orang tua
    pilih anaknya) yang tadinya cuma ada di `mpls.html`, diekstrak jadi
    komponen bersama `pages/laporan-siswa/assets/laporan-picker.js` —
    dipakai `mpls.html` DAN `belajar-mandiri.html` sekarang (mencegah
    duplikasi ~50 baris kode pemilih siswa).
- **Uji Kemampuan** (ganti nama dari "Bank Soal") — `pages/bank-soal.html`
  diganti nama jadi `pages/uji-kemampuan.html`, seluruh label UI ikut
  diperbarui (kartu beranda, tab di `admin.html`). Koleksi Firestore
  `bank_soal` TIDAK ikut diganti nama (internal saja, tidak perlu migrasi
  data). Alasan ganti nama: "Bank Soal" terdengar seperti gudang soal untuk
  guru, padahal ini halaman LATIHAN untuk siswa — "Uji Kemampuan" lebih
  menggambarkan fungsinya dari sudut pandang siswa.
- **[Entri ini belum pernah tertulis sebelumnya — ditambahkan sekarang saat
  merapikan dokumentasi]** Redesain besar Uji Kemampuan (bukan cuma ganti
  nama di atas) — alur berubah dari 1 mapel = semua soal tampil sekaligus,
  jadi **3 tahap**: pilih mapel → pilih **Tujuan Pembelajaran (TP)**
  (kartu dinonaktifkan kalau soal TP itu <5, ditandai "pool belum lengkap"
  kalau <200) → kuis berisi **15 soal diambil acak** dari pool tiap TP
  (field `randKey` + query dua arah supaya acaknya merata). **5 jenis
  soal** didukung (pilihan ganda tunggal, pilihan ganda kompleks,
  kategorikan, mengurutkan, menjodohkan), masing-masing punya UI &
  logika penilaian sendiri. Skor hasil kuis **disimpan ke Firestore
  `hasil_latihan`** (uid, nama, mapel, TP, skor, detail jawaban per
  soal) tiap kali dinilai — direkap guru lewat halaman baru
  `pages/riwayat-latihan.html` (guru-only, dikelompokkan per nama
  siswa). `admin.html` tab Uji Kemampuan & tab Impor Massal (baru) ikut
  diperluas untuk mendukung field `tp` + 5 jenis soal ini. Lihat
  `ANTIREGRESI.md §28` §6 untuk detail keputusan desainnya.
- **Pintu 3 — Latihan Mandiri Siswa diaktifkan** (`pages/laporan-siswa/
  latihan-mandiri.html`, dulu placeholder "Segera Hadir") — laporan untuk
  guru & orang tua (BUKAN siswa, konsisten dengan Pintu 1/2), dipilah per
  mapel → per Tujuan Pembelajaran: skor terbaik, jumlah percobaan, skor +
  tanggal percobaan terakhir per TP, plus kartu ringkasan (rata-rata skor
  terbaik & cakupan "N dari M TP tersedia sudah dicoba"). **Beda
  arsitektur dari Pintu 1/2**: Pintu 1/2 baca lewat endpoint Apps Script
  (`?laporanSiswa=1`/`?progresMateri=1`); Pintu 3 baca `hasil_latihan`
  **langsung dari Firestore di sisi klien** (file baru
  `pages/laporan-siswa/assets/latihan-mandiri.js`) — gerbangnya Firestore
  Security Rules (guru baca semua, orang tua cuma `namaSiswa` yang ada di
  `anak` miliknya), bukan `wajibAksesLaporan_()`. Tetap pakai komponen
  pemilih siswa yang sama (`laporan-picker.js`). TP yang belum pernah
  dicoba siswa TIDAK ditampilkan sebagai baris kosong (beda dari Pintu 2
  yang menampilkan semua materi termasuk yang belum dibaca) — soal Uji
  Kemampuan baru mencakup sebagian TP/mapel, jadi menampilkan semua TP
  kosong dinilai lebih membingungkan daripada membantu di tahap ini.
- **Laporan Siswa direstrukturisasi jadi 3 pintu terpisah** — sebelumnya 1
  halaman tunggal (`pages/laporan-siswa.html`) langsung berisi laporan
  MPLS. Sekarang halaman itu jadi LANDING (menu 3 pintu), laporan MPLS-nya
  sendiri pindah ke `pages/laporan-siswa/mpls.html`:
  1. **MPLS** (`mpls.html`) — AKTIF, isinya sama seperti Fase 1 sebelumnya
     (Profil, Kesiapan Belajar, Kesiapan Akademik, Jurnal Aktivitas)
  2. **Perkembangan Belajar Mandiri** (`belajar-mandiri.html`) — awalnya
     halaman "Segera Hadir"; **AKTIF untuk bagian Materi Ajar sejak entri
     "Progres Materi Ajar" di atas** (bagian Modul masih "segera menyusul")
  3. **Latihan Mandiri Siswa** (`latihan-mandiri.html`) — awalnya halaman
     "Segera Hadir"; **AKTIF sejak entri "Pintu 3 — Latihan Mandiri Siswa
     diaktifkan" di bawah**
  - Refactor pendukung: logika gerbang akses (Firebase Auth + baca
    role/anak dari Firestore, blokir akun siswa) yang sebelumnya inline di
    1 file, sekarang diekstrak jadi `pages/laporan-siswa/assets/
    laporan-guard.js` — dipakai bersama oleh landing + ketiga pintu (dulu
    cuma dipakai 1 halaman jadi inline masih masuk akal, sekarang dipakai
    4 halaman jadi wajar diekstrak, mengikuti pola `guru-guard.js`).
  - Endpoint `Code.gs` (`?laporanSiswa=1`, `wajibAksesLaporan_`) TIDAK
    berubah sama sekali — cuma halaman yang memanggilnya yang berpindah
    lokasi, jadi tidak ada regresi keamanan dari restrukturisasi ini.
- **Laporan MPLS ditulis ulang jadi naratif** (bagian dari halaman yang
  sama, pindah ke `mpls.html`) — versi sebelumnya menampilkan SEMUA field
  mentah sheet MPLS/Kognitif/Jurnal apa adanya (20-30 baris angka skala 1-4
  tanpa konteks — tidak bermakna buat orang tua). Diganti total memakai
  mesin skoring & kesimpulan otomatis yang SUDAH ADA
  (`MplsScoring`/`MplsScoringKognitif`/`MplsScoringJurnal` di
  `pages/mpls/assets/`, sama persis yang dipakai laporan cetak guru
  `pages/mpls/laporan*.html`) — sekarang tampil sebagai level BB/MB/BSH/
  BSB + kalimat kesimpulan + rekomendasi konkret "di rumah" (dan "di
  sekolah" khusus untuk akun guru), bukan angka mentah.
- **Laporan Siswa** (Fase 1 — lihat
  `ANTIREGRESI.md §28` untuk rancangan lengkap & fase berikutnya)
  — halaman baru berisi ringkasan Profil, Asesmen MPLS (non-kognitif),
  Asesmen Kognitif, dan Jurnal Aktivitas per siswa. Bisa diakses **guru**
  (lihat siapa saja) DAN **orang tua** lewat akun Firebase terpisah (role
  baru `"orangtua"`, field `anak: array` di Firestore `users/{uid}` —
  lihat README.md Langkah 7b), tapi **orang tua hanya bisa lihat anaknya
  sendiri** — TIDAK untuk akun siswa sama sekali.
  - Kartu menu di beranda (`#card-laporan-siswa`) disembunyikan secara
    default, ditampilkan lewat skrip role-check kalau `role === 'guru'`
    atau `role === 'orangtua'`.
  - **Keamanan**: endpoint guru yang sudah ada (`?siswa=1`, dst.) sengaja
    tidak dibatasi cakupannya (guru memang boleh lihat semua). Endpoint
    baru `?laporanSiswa=1` digerbang fungsi BARU `wajibAksesLaporan_()`
    (BUKAN `wajibGuru_()`) yang membatasi akun `orangtua` HANYA ke nama
    yang ada di field `anak` miliknya — mencegah orang tua meminta data
    siswa lain lewat mengubah parameter `nama` di URL.
  - Refactor pendukung: logika verifikasi token+role di `wajibGuru_()`
    diekstrak jadi `verifikasiUser_()` (dipakai ulang oleh
    `wajibAksesLaporan_()`) — perilaku & pesan error `wajibGuru_()` SENGAJA
    dijaga persis sama (lihat §25/§27 ANTIREGRESI.md soal riwayat bug di
    fungsi ini) supaya refactor ini tidak jadi regresi.
  - Halaman awalnya dibangun mengikuti pola `index.html` sendiri (baca role
    dari Firestore inline setelah login) karena saat itu cuma 1 halaman —
    **sejak restrukturisasi 3-pintu di atas, logika ini sudah diekstrak
    jadi `laporan-guard.js`** (lihat entri "Laporan Siswa direstrukturisasi"
    di atas), catatan ini dipertahankan sebagai riwayat keputusan awal.
  - **Belum termasuk di Fase 1** (menyusul Fase 2/3, lihat rancangan):
    hasil latihan Bank Soal (belum tersimpan sama sekali di sistem), progres
    membaca Materi Ajar (belum dilacak sama sekali), foto profil siswa
    (proxy `?foto=` saat ini masih hard-gated `wajibGuru_` saja, belum
    disesuaikan untuk orang tua), dan opsi cetak/PDF.
  - **Revisi tampilan (masih di update yang sama)**: versi pertama
    menampilkan SEMUA field mentah sheet MPLS/Kognitif/Jurnal apa adanya
    (20-30 baris angka skala 1-4 tanpa konteks — tidak bermakna buat orang
    tua). Diganti total memakai mesin skoring & kesimpulan otomatis yang
    SUDAH ADA (`MplsScoring`/`MplsScoringKognitif`/`MplsScoringJurnal` di
    `pages/mpls/assets/`, sama persis yang dipakai laporan cetak guru
    `pages/mpls/laporan*.html`) — sekarang tampil sebagai level BB/MB/BSH/
    BSB + kalimat kesimpulan + rekomendasi konkret "di rumah" (dan "di
    sekolah" khusus untuk akun guru), bukan angka mentah.
- **Galeri Visual** — gambar/poster/infografis sebagai bahan ajar bentuk lain
  untuk memfasilitasi siswa dengan gaya belajar visual, menu baru di
  beranda di antara Materi Ajar dan Bank Soal (`pages/infografis.html`).
  - **Landing page per mapel** (`pages/infografis.html`) — menu 8 mata
    pelajaran (memakai ulang warna & ikon dari `materi.css`/`materi-index.js`
    supaya konsisten dengan Materi Ajar), tiap kartu menampilkan jumlah
    media yang tersedia.
  - **Galeri per mapel** (`pages/infografis/galeri.html?mapel=slug`) —
    grid gambar dengan lightbox, guru & siswa (login apa saja).
  - **Kelola per Tujuan Pembelajaran** (`pages/infografis/kelola-tp.html`,
    khusus guru) — SATU-SATUNYA halaman unggah di fitur ini (halaman
    `admin.html`/form generik yang sempat dibuat sebagai draf awal sudah
    DIHAPUS dan digantikan sepenuhnya oleh halaman ini, supaya tidak ada
    dua pintu unggah yang membingungkan). Pilih Tujuan Pembelajaran dari
    dropdown (dibangun otomatis dari `materi-index.js`, sumber tunggal yang
    sama dipakai Materi Ajar — tidak perlu daftar manual terpisah), lalu
    tiap materi di TP itu tampil sebagai 1 kartu dengan tombol
    unggah/ganti/hapus. Aturan **1 materi = 1 infografis**: mengunggah
    gambar baru untuk materi yang sudah punya infografis MENIMPA (bukan
    menambah baris baru) — file lama di Drive otomatis dipindah ke Trash.
    Ditautkan lewat "Materi Slug" (field `file` di `materi-index.js`, sudah
    unik per materi, dipakai ulang tanpa skema ID baru).
  - Backend: sheet baru "Data Infografis" (kolom "Materi Slug" opsional —
    header sheet SELF-HEALING, lihat bagian "Diperbaiki" di bawah) +
    endpoint `doPost` (`type:
    "infografis"` — upsert kalau "Materi Slug" dikirim, selalu tambah baris
    baru kalau tidak; `"infografis_hapus"`) dan `doGet` (`?infografis=1`,
    `?infografisFoto=`) di `apps-script/Code.gs`. Endpoint baca SENGAJA
    TIDAK digerbang `wajibGuru_()` seperti endpoint foto siswa — kontennya
    materi belajar untuk dibaca siswa juga, levelnya disamakan dengan
    Materi Ajar. Folder Drive TERPISAH per mata pelajaran
    (`INFOGRAFIS_FOLDER_IDS`, 5 dari 8 mapel sudah dikonfigurasi — lihat
    `apps-script/README.md` bagian "Folder Drive untuk Galeri Visual").
  - **2 bugfix di `simpanFotoKeDrive_()` selama pengembangan fitur ini:**
    (1) sebelumnya HANYA bisa menulis ke `FOTO_FOLDER_ID` (folder foto
    siswa) — tanpa perbaikan ini, upload gambar Galeri Visual akan
    diam-diam tersimpan ke folder foto siswa, bukan folder mapel yang
    benar; sekarang menerima `folderId` opsional (default tetap
    `FOTO_FOLDER_ID` supaya `doPostSiswa_` tidak berubah perilakunya).
    (2) `file.setSharing(...)` yang gagal (umum terjadi di akun Google
    Workspace sekolah yang kebijakan adminnya membatasi berbagi "siapa
    saja yang punya link") sebelumnya membuat SELURUH upload dilaporkan
    "gagal" walau file-nya sudah berhasil tersimpan di Drive — sekarang
    dibungkus try/catch terpisah dan tidak lagi fatal, karena proxy
    `?foto=`/`?infografisFoto=` toh membaca file lewat akses pemilik
    skrip, bukan lewat link publik.

### Diperbaiki
- **`kelola-tp.html` tidak "mengingat" materi yang sudah punya infografis
  setelah refresh** (tombol Hapus & thumbnail hilang, padahal upload sukses
  dan baris sudah masuk sheet): akar masalahnya, sheet "Data Infografis"
  sempat dipakai SEBELUM kolom "Materi Slug" ditambahkan ke kode, dan
  `buildRowByHeaders_()` mencocokkan berdasarkan nama kolom yang BENAR-BENAR
  ADA di header sheet (bukan urutan array di kode) — jadi nilai "Materi
  Slug" DIAM-DIAM TERBUANG tiap disimpan karena kolomnya belum ada di
  sheet. `getInfografisSheet_()` sekarang **self-healing**: otomatis
  menambahkan kolom header yang belum ada (di ujung kanan, tidak menggeser
  kolom yang sudah ada) setiap kali sheet diakses — tidak perlu edit sheet
  manual lagi, dan ini juga mencegah masalah sejenis untuk kolom-kolom baru
  di masa depan. `setupInfografisSheet()` juga tidak lagi menimpa baris
  header secara mentah (bahaya untuk sheet yang sudah ada isinya) —
  perbaikan header sepenuhnya diserahkan ke `getInfografisSheet_()`.
- **Lightbox di `galeri.html` kadang tampil layar gelap kosong (cuma
  keterangan, tanpa gambar)** walau thumbnail-nya di grid sebelumnya
  berhasil tampil: lightbox sebelumnya cuma mencoba 1 kandidat URL (proxy
  `?infografisFoto=`) TANPA fallback sama sekali kalau gagal, beda dari
  thumbnail grid yang sejak awal punya 2 kandidat cadangan dengan
  `onerror` berantai. Logika kandidat+fallback sekarang dipindah ke file
  bersama baru `pages/infografis/assets/infografis-shared.js` (dipakai
  `galeri.html` DAN `kelola-tp.html`, mencegah duplikasi yang sebelumnya
  membuat `kelola-tp.html` juga punya bug yang sama — cuma 1 kandidat,
  tanpa fallback).

---

## [0.9.3] — 2026-07-24

> **Bugfix kritis lanjutan** — v0.9.2 membuat pesan error dari server terlihat
> jelas, dan pengguna langsung melaporkan pesan aslinya: *"Sesi login guru
> tidak ditemukan — silakan login ulang."* padahal sudah login sebagai guru
> dengan benar. Pesan itu berhasil menunjukkan akar masalah SEBENARNYA:
> `window.guruIdToken` kosong di browser padahal seharusnya terisi.

### Diperbaiki
- **Akar masalah**: `guru-guard.js` (sejak v0.7.0) memakai DUA listener Firebase
  Auth terpisah — `onAuthStateChanged` (mengisi `window.guruIdToken` dengan
  benar lalu memicu event `guru-verified`) dan `onIdTokenChanged` (dimaksudkan
  cuma untuk menjaga token tetap segar). Keduanya berjalan independen. Di
  Firebase SDK sungguhan (beda dari stub pengujian saya sebelumnya),
  `onIdTokenChanged` bisa terpanggil dengan `user: null` pada saat sesi
  tersimpan browser baru selesai dipulihkan — kalau ini terjadi SETELAH
  `onAuthStateChanged` sempat mengisi token dengan benar, baris
  `window.guruIdToken = null` di listener kedua **menimpa token yang baru saja
  benar**, tanpa ada pesan error apa pun (makanya "tidak ada catatan di
  console" — bukan error, cuma nilai yang diam-diam jadi kosong). Setiap
  halaman yang memanggil endpoint guru (`?all=1`, `?siswa=1`, dst.) sesudahnya
  mengirim `idToken=` kosong, ditolak Apps Script SEKETIKA (sebelum sempat
  menghubungi jaringan sama sekali) dengan pesan "Sesi login guru tidak
  ditemukan" — cocok persis dengan laporan pengguna (respons instan, tanpa
  jejak di console).
- **Perbaikan**: `onIdTokenChanged` dihapus total dari `guru-guard.js`.
  Sebagai gantinya: (1) token di-refresh berkala tiap 30 menit lewat
  `setInterval` yang membaca `auth.currentUser` LANGSUNG (satu-satunya sumber
  kebenaran dari SDK, bukan listener kedua yang bisa balapan); (2) fungsi baru
  `window.getFreshGuruIdToken()` — SELALU mengambil token terbaru langsung
  dari `auth.currentUser.getIdToken()` di saat itu juga, dipakai di titik-titik
  kritis (memuat data) sebagai pengganti membaca `window.guruIdToken` yang
  cuma cache. Ketujuh file pemanggil (`rekap.html`, `rekap-kognitif.html`,
  `rekap-jurnal.html`, `laporan.html`, `laporan-kognitif.html`,
  `laporan-jurnal.html`, `pages/kelas/assets/kelas.js`) diubah memakai fungsi
  baru ini. `assets/js/foto-fallback.js` tetap memakai cache `window.guruIdToken`
  (dia butuh string sinkron untuk `<img src>`, tidak bisa `await`) — sekarang
  lebih andal karena sumber race condition-nya sudah dihapus.
- **WAJIB deploy ulang ke GitHub Pages** (bukan Apps Script — `Code.gs` tidak
  berubah sama sekali di versi ini, cukup file statis di sisi klien).

### Diuji
- 5 skenario Playwright baru: `getFreshGuruIdToken` terdaftar & mengembalikan
  token yang benar setelah `guru-verified`; simulasi token BERUBAH (mis. SDK
  refresh) dan memastikan fungsi ini mengambil nilai TERBARU, bukan cache
  basi; cek statis memastikan `onIdTokenChanged` benar-benar tidak lagi
  diimpor/dipanggil di `guru-guard.js`. Ke-88 skenario dari sesi-sesi
  sebelumnya dijalankan ulang — tidak ada regresi.
- **Jujur soal keterbatasan pengujian**: race condition asli ini terjadi di
  perilaku ASYNC Firebase SDK sungguhan yang TIDAK direplikasi oleh stub
  pengujian saya (stub selalu memanggil listener secara sinkron/predictable).
  Artinya pengujian di atas memvalidasi bahwa *desain barunya benar dan lebih
  kokoh* (satu sumber kebenaran, bukan dua listener yang berlomba), TAPI tidak
  bisa membuktikan 100% bahwa race condition PERSIS seperti dugaan di atas
  yang dulu terjadi di sistem pengguna — teori ini paling cocok dengan gejala
  yang dilaporkan (gagal seketika, tanpa jejak network, pesan persis
  "idToken kosong"), tapi kepastian penuh baru didapat kalau pengguna
  mengonfirmasi masalahnya hilang setelah update ini.

---

> **Bugfix kritis** — dilaporkan pengguna: data hasil MPLS yang sebelumnya normal
> tiba-tiba tidak bisa dilihat lagi setelah update v0.7.0 (kunci akses
> server-side), walau sudah pakai kode terbaru dan sudah deploy ulang.

### Diperbaiki
- **Penyebab akar**: sejak v0.7.0, endpoint Apps Script yang gagal verifikasi
  (idToken kedaluwarsa, akun bukan guru, kode akses salah, Apps Script belum
  diberi izin `UrlFetchApp`, dll.) membalas `{status:"error", message:"..."}`
  — TAPI kode di sisi klien (`rekap.html`, `rekap-kognitif.html`,
  `rekap-jurnal.html`, `laporan.html`, `laporan-kognitif.html`,
  `laporan-jurnal.html`, `pages/kelas/assets/kelas.js`) **belum diperbarui**
  untuk mengecek `status === "error"` lebih dulu. Karena respons error tidak
  punya field `data`/`found`, kode lama membaca ini sebagai "field data tidak
  ada" dan menampilkan pesan **"Kemungkinan Apps Script belum ter-deploy versi
  terbaru"** — pesan yang SALAH TOTAL untuk kasus ini, karena penyebab
  sebenarnya sama sekali lain. Akibatnya guru diarahkan untuk redeploy
  berulang kali, yang tidak pernah menyelesaikan masalah karena bukan itu
  akar masalahnya, dan pesan error yang SEBENARNYA (yang sudah dirancang
  informatif di `wajibGuru_()`/`wajibKodeAkses_()`) tidak pernah terlihat.
  Di `pages/kelas/assets/kelas.js` malah lebih parah: errornya diam-diam
  ditelan jadi daftar siswa kosong ("Belum ada siswa"), tanpa pesan apa pun.
- Diperbaiki di ke-7 file di atas: sekarang SELALU cek `json.status ===
  "error"` LEBIH DULU dan tampilkan `json.message` apa adanya ke guru, baru
  setelah itu (kalau bukan error tapi tetap tidak ada `data`/`found`) baru
  tampilkan pesan "kemungkinan belum deploy versi terbaru" — supaya kedua
  jenis masalah ini tidak lagi tertukar.
- **Tidak perlu deploy ulang Apps Script untuk perbaikan ini** — `Code.gs`
  sendiri tidak berubah di versi ini (dia sudah benar sejak awal, mengirim
  `message` yang informatif); yang salah adalah kode di sisi klien yang tidak
  membacanya. Cukup upload ulang file HTML/JS yang disebut di atas ke GitHub.
- **Ini TIDAK serta-merta menyelesaikan masalah akses yang sedang dialami** —
  kalau memang ada error sungguhan (idToken/rules/otorisasi Apps Script),
  error itu masih akan terjadi; bedanya sekarang PESANNYA akan terlihat jelas,
  bukan lagi pesan generik yang menyesatkan. Lihat `ANTIREGRESI.md` §24 untuk
  panduan diagnostik lanjutan berdasarkan pesan yang muncul.

### Prinsip baru (dicatat di ANTIREGRESI.md §23)
- Setiap kali menambah gerbang akses baru ke endpoint yang sudah ada, WAJIB
  ditelusuri ulang SEMUA pemanggil endpoint itu untuk memastikan mereka
  mengecek `status === "error"` lebih dulu sebelum mengasumsikan bentuk
  respons sukses tertentu — bukan cuma menambah parameter yang dikirim.

### Diuji
- 15 skenario Playwright baru: memaksa server (mock) membalas
  `{status:"error",...}` untuk ke-7 file yang diperbaiki, memastikan pesan
  error ASLI tampil dan pesan menyesatkan TIDAK tampil; plus 1 skenario
  regresi memastikan kasus deployment lama SUNGGUHAN (tanpa field status/data
  sama sekali) tetap menampilkan pesan "kemungkinan belum deploy" seperti
  seharusnya. Semua 82 skenario dari sesi-sesi sebelumnya dijalankan ulang —
  tidak ada regresi.

---

## [0.9.1] — 2026-07-21

> Sesi penyempurnaan atas fitur v0.8.0/v0.9.0 — bukan fitur baru, tapi audit ulang
> kode yang baru dibangun untuk cari celah kecil sebelum lanjut ke halaman lain.

### Diperbaiki
- **Bank Soal (`admin.html`) sebelumnya tidak mewajibkan Mata Pelajaran** —
  soal bisa tersimpan tanpa mapel dan jatuh ke kelompok "(Tanpa Mapel)" di
  `bank-soal.html`, padahal Modul dan Materi sudah mewajibkannya. Disamakan:
  mapel sekarang wajib untuk ketiganya.
- **Bank Soal tidak mencegah 2 pilihan dengan teks sama persis** — kalau
  guru tidak sengaja mengetik pilihan yang identik (mis. dua-duanya "20"),
  penilaian di `bank-soal.html` bisa menandai lebih dari satu opsi sebagai
  "benar" sekaligus karena pencocokan berdasar teks, bukan posisi. Sekarang
  divalidasi saat simpan — guru diminta membedakan dulu.
- **Celah XSS kecil** di atribut `href` untuk lampiran/`url_file` (`modul.html`,
  `materi.html`) yang belum di-escape — sudah diperbaiki (ditemukan sekalian
  saat audit ini, bukan celah baru).

### Ditambahkan
- **Datalist mapel** di `admin.html` — input "Mata Pelajaran" di tab Modul,
  Materi, dan Bank Soal sekarang menyarankan nama mapel yang sudah pernah
  dipakai (gabungan dari ketiga koleksi), supaya guru tinggal pilih alih-alih
  mengetik ulang. Mencegah "Matematika" vs "matematika" dianggap 2 kelompok
  berbeda gara-gara beda kapitalisasi/spasi — sebelumnya ini bisa terjadi tanpa
  guru sadar (modul/materi/soal jadi "hilang" karena masuk kelompok yang salah).
- **Peringatan format link** (tidak memblokir simpan) di tab Modul & Materi —
  kalau "Link File"/"Lampiran" diisi tapi tidak diawali `http://`/`https://`,
  guru langsung diberi tahu saat menyimpan, bukan baru bingung nanti waktu
  tombol "Buka Modul"/lampiran tidak muncul di halaman siswa.
- **Bank Soal (`bank-soal.html`)**: urutan tampil pilihan jawaban kini diacak
  setiap kuis dimulai (Fisher-Yates), supaya siswa tidak bisa menghafal "jawaban
  selalu di posisi ke-2" — pencocokan jawaban tetap berdasar teks pilihan,
  bukan posisi, jadi pengacakan ini tidak memengaruhi logika penilaian.
- **Bank Soal**: soal yang dilewati (tidak dijawab sama sekali) sekarang diberi
  penanda "Belum dijawab" berwarna merah di nomor soal, dan skor mencantumkan
  berapa soal yang belum dijawab — sebelumnya soal yang dilewati tidak diberi
  tanda apa pun (tidak hijau, tidak merah), berisiko dikira "otomatis benar".

### Diuji
- 12 skenario Playwright baru: validasi mapel wajib & pilihan duplikat di
  `admin.html` (termasuk memastikan soal yang ditolak validasi TIDAK ikut
  tersimpan), datalist mapel terisi otomatis, penanda "Belum dijawab" tampil
  dan tidak ikut ditandai merah, skor tetap menghitung soal terlewat sebagai
  salah, dan pengacakan pilihan (dicoba 8x, urutan tidak selalu identik) —
  semua lulus. 38 skenario lama (v0.8.0 + v0.9.0) dijalankan ulang untuk cek
  regresi — semua tetap lulus (total 50 skenario).

---

### Ditambahkan
- **`pages/materi.html`** — Materi Ajar/Buku Belajar Mandiri untuk siswa & guru
  (pakai `auth-guard.js`, bukan guru-only). Beda dari `modul.html`: isi materi
  dibaca LANGSUNG di halaman (klik judul untuk buka/tutup), bukan cuma link
  keluar — cocok untuk rangkuman belajar mandiri. Lampiran opsional tetap bisa
  ditambahkan kalau guru ingin menyertakan link Drive/PDF pendamping.
- **`pages/bank-soal.html`** — halaman latihan soal interaktif untuk siswa: pilih
  mata pelajaran → kerjakan soal pilihan ganda → klik "Periksa Jawaban" → skor
  langsung tampil (x/y benar), jawaban benar ditandai hijau dan pilihan salah
  yang dipilih ditandai merah. Murni di sisi klien, tidak menyimpan riwayat
  pengerjaan ke Firestore (lihat "Direncanakan" di atas kalau nanti perlu direkap).
- **`pages/info.html`** — arsip lengkap pengumuman (beranda `index.html` cuma
  menampilkan 5 pengumuman terbaru; halaman ini menampilkan semuanya, terbaru
  di atas). Memakai koleksi `pengumuman` yang sama, tidak ada data/field baru.
- **`pages/cp-tp-atp.html`** dan **`pages/jadwal.html`** — dibangun sebagai
  halaman STATIS (bukan Firestore), sesuai keputusan bahwa konten administratif
  yang nyaris tidak berubah setahun tidak perlu panel edit. **Isinya masih
  kerangka/placeholder** — daftar mapel di `cp-tp-atp.html` cuma tebakan mapel
  Kurikulum Merdeka SD umum (belum tentu cocok dengan mapel ciri khas
  Muhammadiyah seperti ISMUBA/Bahasa Arab), dan jam pelajaran di `jadwal.html`
  cuma ilustrasi. Keduanya diberi kotak catatan kuning yang jujur ke pengguna
  bahwa isinya menunggu dokumen resmi dari sekolah — TIDAK mengarang konten
  seolah-olah itu data asli.
- **Tab "Materi Ajar" baru di `pages/admin.html`** — CRUD untuk koleksi
  `materi` (judul, mapel, tema, isi, lampiran opsional, urutan), pola sama
  dengan tab Modul yang sudah ada.
- Koleksi Firestore `materi` didaftarkan eksplisit di rules produksi
  (`README.md`) — perlu ditempel ulang ke Firebase Console kalau rules yang
  aktif belum termasuk blok ini.

### Diuji
- 20 skenario Playwright baru (stub Firestore in-memory): CRUD tab Materi di
  `admin.html`; tampil+baca+lampiran di `materi.html`; alur kuis penuh di
  `bank-soal.html` (pilih mapel → jawab campuran benar/salah → skor dihitung
  tepat → penandaan hijau/merah tepat → tombol nonaktif setelah dinilai →
  ganti mapel mereset kuis); arsip penuh di `info.html`; serta pemeriksaan
  bahwa `cp-tp-atp.html`/`jadwal.html` bisa dibuka akun manapun yang login dan
  benar-benar menampilkan penanda "kerangka", bukan berpura-pura sudah lengkap.
  Semua 20 lulus, plus 18 skenario lama (`admin.html`/`modul.html`) dijalankan
  ulang untuk cek regresi dari penambahan tab Materi — semua tetap lulus.
- Diperbaiki juga (ditemukan saat membangun halaman baru): link lampiran/`url_file`
  di `modul.html` dan `materi.html` sebelumnya dimasukkan ke atribut `href` TANPA
  di-escape — celah XSS kecil kalau field itu diisi teks berisi tanda kutip;
  sekarang di-escape sama seperti field teks lain.
- Cek overflow horizontal terprogram (bukan cuma dilihat mata) di layar 360px
  untuk keenam halaman baru — nol piksel overflow di semuanya.
- **Belum diuji** dengan Firestore project sungguhan — sama seperti v0.8.0,
  perlu dicoba manual sebelum dipakai guru/siswa beneran (checklist lengkap di
  `ANTIREGRESI.md` §18-21).

---

## [0.8.0] — 2026-07-20

### Ditambahkan
- **`pages/admin.html`** — panel guru untuk kelola konten Firestore (`pengumuman`,
  `modul`, `bank_soal`) langsung dari browser, tanpa perlu buka Firebase Console.
  3 tab (Pengumuman / Modul / Bank Soal), masing-masing dengan form tambah, dan
  daftar isi yang bisa diedit atau dihapus. Guru-gated pakai `guru-guard.js` yang
  sudah ada (bukan proteksi baru). Tombol "+ Tambah Pengumuman" / "Upload Modul" /
  "Tambah Soal" di beranda (`index.html`) yang sebelumnya cuma `alert("Fitur segera
  hadir")` sekarang mengarah ke tab yang sesuai di `admin.html` (pakai `#pengumuman`
  / `#modul` / `#soal`).
- **`pages/modul.html`** — halaman tampil daftar modul untuk SISWA & guru (bukan
  cuma guru), dikelompokkan per mata pelajaran dan diurutkan sesuai field
  `urutan`, dengan filter chip per mapel. Tombol "Buka Modul" membuka `url_file`
  (link Drive/PDF) di tab baru.
- **`assets/js/auth-guard.js`** — guard baru untuk halaman yang boleh diakses
  SIAPA SAJA yang sudah login (guru maupun siswa), berbeda dari `guru-guard.js`
  yang khusus guru. Dipakai `modul.html`, akan dipakai juga di `materi.html` dan
  `bank-soal.html` nanti. Firestore Rules (`request.auth != null` untuk baca
  `modul`/`pengumuman`/`bank_soal`) sudah otomatis diverifikasi SDK Firestore
  sendiri — tidak perlu kirim idToken manual seperti ke Apps Script.
- Soal di `bank_soal` disimpan dengan field `jawaban` berisi TEKS pilihan yang
  benar (bukan indeks angka) — di form `admin.html`, guru cukup mencentang radio
  "Benar" di sebelah pilihan yang tepat, tidak perlu mengetik ulang jawabannya.
- Modul dikelompokkan per `mapel` di sisi klien (bukan lewat `orderBy` majemuk di
  Firestore) supaya tidak butuh composite index — lihat catatan di
  `ANTIREGRESI.md` §16.

### Diuji
- 18 skenario Playwright dengan stub Firestore in-memory (bukan Firestore
  sungguhan): tambah/edit/hapus untuk ketiga jenis konten, radio jawaban benar
  di Bank Soal, proteksi anti-XSS (judul dengan tag HTML di-escape, bukan
  dieksekusi), penolakan akses untuk akun bukan-guru di `admin.html`, dan
  tampilan `modul.html` untuk akun siswa (pengelompokan, pengurutan, filter
  mapel) — semua lulus.
- Screenshot tampilan layar sempit (360-375px) untuk `admin.html` (termasuk tab
  Bank Soal yang formnya paling padat) dan `modul.html` — tidak ada teks
  terpotong/tumpang tindih.
- **Belum diuji** dengan Firestore sungguhan (hanya stub in-memory) — perlu
  dicoba manual sekali di project Firebase asli sebelum dipakai guru beneran,
  terutama untuk memastikan Firestore Rules produksi (`README.md`, yang sudah
  diperbaiki di v0.7.1) benar-benar mengizinkan guru menulis ke `modul` dan
  `bank_soal` seperti yang diharapkan.

---

## [0.7.0] — 2026-07-19

### Keamanan
- **Celah besar: semua endpoint `apps-script/Code.gs` bisa diakses siapa saja tanpa
  otorisasi apa pun di level server.** Kode akses di `input.html`/`input-kognitif.html`/
  `input-jurnal.html` dan Firebase Auth di halaman guru (`rekap*.html`, `laporan*.html`,
  `pages/kelas/`) selama ini HANYA gerbang tampilan (client-side) — endpoint di baliknya
  tidak pernah mengecek apa pun. Siapa saja yang tahu `APPS_SCRIPT_URL` (publik, ada di
  `pages/mpls/assets/config.js` yang ikut ter-deploy ke GitHub Pages) bisa memanggil
  `?all=1` / `?siswa=1` / `?allKognitif=1` / `?allJurnal=1` langsung dari browser/curl dan
  mendapat nama lengkap, foto, tempat & tanggal lahir SEMUA siswa, atau mengirim `POST`
  untuk menimpa data siswa manapun.
- Ditambahkan dua lapis pengecekan **di server** (`Code.gs`), menutup celah di atas:
  - `wajibKodeAkses_()` — kode akses sederhana (level proteksi sama seperti yang sudah
    ada di `config.js`, BUKAN keamanan sungguhan) untuk endpoint per-siswa yang dipakai
    halaman input: `?nama=`, `?namaKognitif=`, `?namaJurnal=`, dan `POST` jenis
    `mpls`/`mpls_kognitif`/`jurnal`.
  - `wajibGuru_()` — verifikasi **sungguhan**: memeriksa `idToken` Firebase Auth yang
    dikirim klien lewat Identity Toolkit REST API (`accounts:lookup`), lalu mengecek
    field `role` di dokumen `users/{uid}` lewat Firestore REST API (memakai `idToken`
    yang sama sebagai Bearer, memanfaatkan rule Firestore yang sudah ada — bukan
    kredensial service account). Dipakai untuk endpoint yang mengembalikan/menulis data
    SEMUA siswa sekaligus: `?all=1`, `?siswa=1`, `?allKognitif=1`, `?allJurnal=1`,
    `?foto=`, dan `POST` jenis `siswa`.
- Klien disesuaikan untuk mengirim kunci yang sesuai di setiap panggilan: `guru-guard.js`
  kini menyimpan `window.guruIdToken` (dijaga tetap segar otomatis lewat
  `onIdTokenChanged`, di-set sebelum event `guru-verified` ditembak supaya tidak ada
  celah waktu/race condition); `foto-fallback.js`, `kelas.js`, `app.js`, `app-kognitif.js`,
  `app-jurnal.js`, dan keenam halaman `rekap*.html`/`laporan*.html` masing-masing
  menyertakan `idToken` atau `kode` sesuai endpoint yang dipanggil.
- **Celah residual yang SENGAJA belum ditutup di update ini**: 3 kandidat fallback foto
  di `foto-fallback.js` (hotlink langsung ke domain Google) masih tidak diproteksi,
  karena file di folder Drive foto masih di-share "siapa saja yang punya link boleh
  melihat" (`simpanFotoKeDrive_()`). Menutupnya berarti mengubah setting share folder
  jadi privat + melepas kandidat fallback itu, yang akan menghilangkan jaring pengaman
  kalau proxy Apps Script sedang down — didiskusikan dulu sebelum diputuskan.
- **Diuji**: 8 unit test murni untuk logika `wajibKodeAkses_()`/`wajibGuru_()` (kode
  benar/salah/kosong, token valid/invalid/kedaluwarsa, role guru/bukan guru, dokumen
  `users/{uid}` hilang) — semua lulus. 17 skenario Playwright dengan stub Firebase SDK
  offline mengonfirmasi setiap halaman yang memanggil endpoint MPLS/Kelas/foto benar-benar
  mengirim `idToken`/`kode` — semua lulus. **Belum diuji** dengan Apps Script sungguhan
  yang sudah di-deploy ulang (lihat `ANTIREGRESI.md` Skenario O bagian 3) — WAJIB
  dijalankan manual sebelum dianggap aman di produksi.

### Penting untuk redeploy
- `apps-script/Code.gs` HARUS di-deploy ulang sebagai **New version** setelah update ini
  (lihat `apps-script/README.md`) — kode lama tidak mengenal parameter `idToken`/`kode`
  sama sekali, jadi tanpa redeploy semua endpoint akan tetap berjalan seperti versi lama
  (tanpa proteksi baru ini).
- Saat redeploy, Apps Script akan meminta **izin tambahan** untuk mengakses layanan
  eksternal (dipakai `UrlFetchApp` di `wajibGuru_()` untuk memanggil Identity Toolkit &
  Firestore REST API) — klik Allow/Izinkan saat diminta.

### Keamanan (lanjutan — Firestore Rules)
- **Bug tabrakan aturan (rule collision) di rules Firestore "produksi" yang direkomendasikan
  `README.md`.** Firestore meng-OR-kan semua blok `match` yang cocok dengan sebuah path —
  blok wildcard generik `match /{koleksi}/{id} { allow read: if request.auth != null; ... }`
  ternyata JUGA cocok untuk path `/users/{uid}` (karena `koleksi` bisa "users"), dan karena
  di-OR-kan, blok itu **melumpuhkan** pembatasan yang sudah dibuat di blok
  `match /users/{uid}` di atasnya. Akibatnya: siapa saja yang login (termasuk siswa, bukan
  cuma guru) bisa membaca dokumen profil (`nama`, `role`, `email`) siswa/guru LAIN, padahal
  dimaksudkan hanya pemilik dokumen sendiri yang boleh baca. Diperbaiki dengan mengganti
  wildcard generik jadi 3 blok match eksplisit per koleksi (`pengumuman`, `modul`,
  `bank_soal`) yang tidak lagi bertabrakan dengan `/users/{uid}`. **Perlu ditempel manual**
  ke Firebase Console → Firestore → Rules — file kode tidak bisa mengubah ini otomatis.

---

## [0.7.1] — 2026-07-20

### Diperbaiki
- **`ANTIREGRESI.md` berisi beberapa checklist yang sudah basi (menyebut kondisi lama,
  bukan kondisi sekarang) — ditemukan saat menyinkronkan dokumen ini dengan implementasi
  jurnal v0.6.2, ternyata cakupannya lebih luas dari itu:**
  - §11 & §12 (Asesmen Kognitif) menyebut **"5 kategori"** — sudah salah sejak v0.6.0
    menambahkan kategori Menyimak & Menulis (total jadi **7 kategori**). Skenario G juga
    ikut diperbaiki.
  - §12 masih menjelaskan laporan cetak kognitif sebagai "grid 3 kolom untuk 5 kategori" —
    padahal sejak v0.6.2 sudah berubah jadi 2 bagian terpisah (Literasi grid 3 kolom,
    Numerasi grid 4 kolom). Ditambahkan juga catatan bahwa cap panjang catatan anekdot di
    kognitif (60 karakter) SENGAJA lebih pendek dari 2 modul lain (130 karakter) — bukan bug.
  - Fitur v0.6.2 "kesimpulan menyerap catatan anekdot & penanda kelengkapan data
    (x/y indikator, sementara)" sebelumnya HANYA disebut di baris Log Ujicoba, tidak pernah
    jadi item checklist yang bisa dicentang — ditambahkan ke §8 (berlaku di ketiga modul:
    non-kognitif, kognitif, jurnal).
  - 2 checklist item yang menguji proteksi `pages/admin.html` (§3 dan Skenario B) diberi
    penanda "belum bisa diuji" — halaman itu sendiri belum dibuat (masih di daftar
    "Direncanakan"), jadi checklist itu sebelumnya menguji sesuatu yang tidak ada.

---

## [0.6.2] — 2026-07-17

### Diperbaiki
- **Modul Asesmen Menulis (Jurnal Aktivitas) yang tercatat "selesai" sejak v0.5.0 ternyata
  hilang total dari repo** — `mpls-jurnal-data.js`, `mpls-scoring-jurnal.js`, `app-jurnal.js`,
  `input-jurnal.html`, `rekap-jurnal.html`, dan kartu navigasi di `index.html` tidak ada,
  padahal `laporan-jurnal.html` sudah memanggilnya. Kelima file + kartu navigasi
  dibangun ulang mengikuti spesifikasi yang sudah ditulis di `ANTIREGRESI.md` §14 dan
  Skenario I (2 kategori, 7 indikator, field "Cuplikan Tulisan Siswa"), dan cocok dengan
  `HEADERS_JURNAL` yang sudah lebih dulu ada di `apps-script/Code.gs` — backend tidak diubah.
- **Simpulan otomatis per kategori (3 modul: MPLS non-kognitif, Kognitif, Jurnal) sebelumnya
  murni template kategori+level, buta terhadap catatan anekdot guru dan buta terhadap
  kelengkapan data** — dua siswa dengan pola sangat berbeda tapi rata-rata skor sama akan
  mendapat kalimat cetak identik. `computeCategory()` di ketiga file `mpls-scoring*.js`
  kini melampirkan cuplikan catatan anekdot guru (field `noteField`, sudah dikumpulkan
  form input tapi sebelumnya tidak pernah dipakai) dan penanda "(x/y indikator, sementara)"
  saat kategori belum terisi penuh. Diuji dengan Playwright (data terpanjang di semua
  kategori + data tidak lengkap) — tetap 1 halaman A4 di ketiga laporan cetak; cap
  panjang catatan sengaja lebih pendek di laporan kognitif (7 kategori, grid lebih rapat)
  dibanding 2 modul lain.

### Diubah
- **Print out Laporan Asesmen Kognitif kini mengelompokkan kartu kategori jadi 2 bagian
  terpisah** (`pages/mpls/laporan-kognitif.html`): "📖 Literasi (Membaca, Menyimak &
  Menulis)" dan "🔢 Numerasi (Berhitung)" — sebelumnya ke-7 kategori tampil sebagai satu
  grid campur (urutan sesuai `MPLS_KOGNITIF_CATEGORIES`: literasi, penjumlahan,
  pengurangan, perkalian, pembagian, menyimak, menulis — sehingga menyimak/menulis
  malah nyempil di antara kategori numerasi), membuatnya lebih sulit dibaca & dijelaskan
  ke orang tua sebagai dua kelompok kemampuan yang berbeda.
  - Bagian "Literasi" memakai grid 3 kolom (literasi, menyimak, menulis — 3 kategori
    berbahasa/literasi dasar); bagian "Numerasi" memakai grid 4 kolom (penjumlahan,
    pengurangan, perkalian, pembagian).
  - Pengelompokan berdasarkan DAFTAR KEY eksplisit (`LITERASI_KEYS`/`NUMERASI_KEYS`),
    bukan urutan array — kategori yang key-nya belum dikenal (mis. kalau nanti ditambah
    kategori baru lagi) otomatis masuk kelompok "📌 Lainnya" di akhir, tidak hilang
    begitu saja dari laporan.
  - Tipografi kartu di bagian Numerasi (grid 4 kolom, lebih sempit) sedikit dipadatkan
    (padding & ukuran font -1px) supaya tetap nyaman dibaca di kolom yang lebih sempit.

### Diuji
- Diuji dengan Playwright + Chromium headless: halaman dirender dengan data uji 1 siswa
  yang SEMUA 7 kategorinya terisi penuh (skenario terberat untuk muat 1 halaman), dicetak
  ke PDF (`page.pdf()`, format A4) dan jumlah halaman dihitung dengan `pypdf` —
  **dikonfirmasi tetap 1 halaman**, baik saat kategori tertentu kosong ("Belum ada nilai")
  maupun saat semua terisi lengkap dengan teks rekomendasi guru/ortu penuh.
- Teks hasil PDF diekstrak dan diverifikasi urutannya: bagian "Literasi" (3 kartu: Literasi
  Dasar, Menyimak, Menulis) tampil dulu sebagai satu kelompok, baru bagian "Numerasi"
  (4 kartu: Penjumlahan, Pengurangan, Perkalian, Pembagian) — tidak ada lagi kategori
  yang tercampur di antara kelompok yang salah.
- (Regresi) Kartu "Kesimpulan Akhir Kesiapan Akademik" di bagian atas (ringkasan gabungan
  semua kategori, aspek kuat/perlu perhatian, langkah guru & ortu) tetap tampil normal dan
  tidak terpengaruh perubahan pengelompokan di bawahnya, karena logika `computeOverall()`
  tidak diubah sama sekali — hanya urutan/pengelompokan tampilan kartu per-kategori yang
  berubah.
- **Catatan jujur soal batas pengujian**: pengecekan "muat 1 halaman" ini dilakukan dengan
  data uji buatan (bukan data siswa sungguhan), dan hanya menguji 1 kombinasi skor. Kalau
  di kemudian hari ada guru yang mengisi catatan anekdot (`noteField`) sangat panjang di
  banyak kategori sekaligus, laporan berpotensi meluber ke halaman ke-2 — ini bukan
  regresi baru (risiko yang sama juga ada di layout LAMA sebelum pengelompokan ini), tapi
  tetap perlu diperhatikan guru saat mengisi kolom catatan.

---

## [0.6.0] — 2026-07-16

### Ditambahkan
- **Instrumen Asesmen Awal Kognitif BARU: "Menyimak & Mengikuti Instruksi" dan "Menulis &
  Meringkas"** — 2 kategori baru dalam modul kognitif yang sudah ada (bergabung dengan
  Literasi Dasar & 4 kategori Numerasi), dilatarbelakangi kebutuhan menyiapkan siswa
  menghadapi jadwal belajar Kelas 5 yang padat setelah masa MPLS selesai: kemampuan
  menyimak instruksi dengan efektif dan menulis/meringkas informasi secara mandiri.
  - **Menyimak & Mengikuti Instruksi** (`pages/mpls/assets/mpls-kognitif-data.js`, key
    `menyimak`) — 6 indikator: memperhatikan penjelasan guru, memahami instruksi 1 langkah,
    instruksi bertahap 2&ndash;3 langkah, menjelaskan ulang inti instruksi, memilah
    informasi penting dari penjelasan panjang, dan bertahan fokus menyimak.
  - **Menulis & Meringkas** (key `menulis`) — 6 indikator: keterbacaan tulisan (bukan
    kerapian), mencatat poin penting secara mandiri, menulis rangkuman singkat dengan
    kata sendiri, kecepatan menyelesaikan tugas tulis, memahami maksud instruksi/kriteria
    tugas tertulis (termasuk rubrik penilaian), dan kesesuaian jawaban dengan instruksi.
  - Teks kesimpulan & rekomendasi (BB/MB/BSH/BSB, untuk guru & orang tua) untuk kedua
    kategori ditambahkan di `pages/mpls/assets/mpls-scoring-kognitif.js`.
  - Karena `input-kognitif.html`/`app-kognitif.js` dan `rekap-kognitif.html`/
    `laporan-kognitif.html` sudah sepenuhnya digerakkan oleh data
    (`MPLS_KOGNITIF_CATEGORIES` & `result.categories`, bukan HTML kategori yang
    di-hardcode), 2 kategori baru ini **otomatis muncul di form input, rekap, dan laporan
    cetak** tanpa perlu mengubah HTML halaman-halaman tsb sama sekali.
- **Rubrik cetak pendamping baru**: `pages/mpls/rubrik/rubrik-menyimak-menulis-mpls.html`
  — dokumen mandiri (tidak bergantung Apps Script/konfigurasi apa pun) bergaya visual
  sama seperti rubrik referensi yang sudah ada (badge level BB/MB/BSH/BSB, tabel per
  aspek), berisi deskripsi lengkap tiap level untuk keenam indikator Menyimak dan keenam
  indikator Menulis — membantu guru mengkalibrasi skor 1&ndash;4 sebelum/saat mengisi di
  aplikasi. Setiap baris rubrik ini sama persis dengan 1 indikator yang bisa dicentang di
  `input-kognitif.html`.
- `apps-script/Code.gs` → `HEADERS_KOGNITIF`: 14 kolom baru (6 indikator + 1 catatan untuk
  masing-masing kategori) ditambahkan **di ujung PALING AKHIR array** (setelah "Diisi
  Oleh"), bukan disisipkan di antara kategori-kategori lama — supaya kolom-kolom lama
  yang sudah menyimpan data tidak pernah bergeser posisi, baik saat sheet baru dibuat
  maupun saat `setupSheetKognitif()` dijalankan ulang pada sheet yang sudah ada isinya.

### PENTING — Langkah wajib setelah menarik update ini
- **Deploy ulang Apps Script sebagai "New version"** (`Code.gs` berubah).
- **Kalau sheet "Data MPLS Kognitif" SUDAH ADA isinya** (bukan sheet baru): kolom baru
  TIDAK muncul otomatis — tambahkan manual 14 header kolom baru (teks PERSIS sama, lihat
  daftar lengkap di `apps-script/README.md` bagian "Menambahkan kategori 'Menyimak &
  Menulis'") di kolom kosong pertama setelah kolom terakhir yang ada sekarang.

### Diuji
- Diuji dengan Playwright: mengisi indikator Menyimak & Menulis di `input-kognitif.html`
  untuk 1 siswa uji, dikonfirmasi tersimpan dan muncul benar di `rekap-kognitif.html`
  serta `laporan-kognitif.html` (kartu kategori, rata-rata, level, dan rekomendasi guru/
  ortu tampil sesuai `CATEGORY_TEXT` yang baru ditambahkan) — TANPA perlu mengubah HTML
  kedua halaman tsb, mengonfirmasi arsitektur data-driven bekerja seperti didokumentasikan.
- Item text di `mpls-kognitif-data.js` diverifikasi program dengan `HEADERS_KOGNITIF` di
  `Code.gs` untuk memastikan cocok PERSIS karakter demi karakter (termasuk tanda baca) —
  ketidakcocokan sekecil apa pun akan membuat skor untuk indikator itu gagal tersimpan
  secara senyap (lihat prinsip pencocokan nama header PERSIS yang sudah didokumentasikan
  sejak v0.5.4).
- **Catatan jujur soal batas pengujian**: skenario "menambah kolom manual ke sheet lama
  yang sudah berjalan sungguhan" tidak bisa diuji penuh di lingkungan pengembangan ini
  (memerlukan spreadsheet sekolah yang sungguhan dengan data lama) — logikanya sudah
  diverifikasi dengan cermat (append-only, tidak ada penyisipan di tengah array), tapi
  tetap disarankan menambah 1 siswa uji coba dulu setelah update sebelum dipakai massal.

---

## [0.5.5] — 2026-07-15

### Diperbaiki
- **Bug BARU: muncul error `Unexpected token '<', "<!DOCTYPE "... is not valid JSON` saat
  simpan, khususnya setelah proses terasa lama.** Akar masalah: Google Apps Script Web App
  (URL `/exec`) kadang mengembalikan **halaman HTML generik dari infrastruktur Google**
  (bukan JSON dari `Code.gs`) kalau eksekusi di baliknya lambat — upload + set-sharing foto ke
  Drive bisa memakan beberapa detik lebih lama dari permintaan biasa, dan Google diketahui
  kadang memotong/mengganti respons `/exec` dengan halaman error generik dalam kondisi itu, di
  luar kendali kode aplikasi ini. Kode sebelumnya langsung memanggil `res.json()` tanpa
  pengecekan, sehingga errornya jadi pesan mentah JavaScript yang membingungkan bagi pengguna.
  - **Solusi**: `pages/kelas/assets/kelas.js` — fungsi baru `parseJsonAman_()` membaca
    response sebagai teks dulu, baru mencoba mem-parse JSON; kalau gagal DAN teksnya diawali
    `<` (tanda halaman HTML), dilempar pesan yang jelas & actionable dalam Bahasa Indonesia,
    bukan pesan error JavaScript mentah.
  - **Tambahan keamanan**: saat simpan GAGAL dengan error apa pun, daftar siswa di bawah form
    ikut dimuat ulang otomatis (sebelumnya cuma dimuat ulang saat BERHASIL) — supaya guru bisa
    langsung mengecek apakah datanya ternyata SUDAH tersimpan di balik layar (Apps Script bisa
    saja sudah selesai menulis ke sheet meski respons ke browser gagal/terlambat), sebelum
    memutuskan menyimpan ulang. Ini penting supaya tidak muncul foto dobel di Drive akibat
    percobaan simpan berulang untuk data yang sebenarnya sudah masuk.
  - **Catatan jujur soal batas perbaikan ini**: ini MENGATASI GEJALA (pesan error yang jelas +
    visibilitas status), bukan akar masalah kecepatan eksekusi Apps Script itu sendiri, yang
    berada di luar kendali kode aplikasi (infrastruktur Google). Kalau ini sering terjadi,
    pertimbangkan membersihkan folder `FOTO_FOLDER_ID` dari file-file lama/duplikat hasil
    percobaan sebelumnya (folder yang terlalu penuh berpotensi memperlambat operasi Drive).

### Ditambahkan
- **Daftar siswa tersimpan kini terurut ABJAD berdasarkan Nama Lengkap** (sebelumnya
  mengikuti urutan baris apa adanya di sheet "Data Siswa", yang berarti urutan sesuai kapan
  data dimasukkan/diupdate — jadi kelihatan "acak" seiring waktu). Diurutkan di sisi klien
  (`pages/kelas/assets/kelas.js`, fungsi `loadSiswaList()`) memakai `localeCompare` dengan
  locale Indonesia, jadi tidak bergantung urutan di spreadsheet dan tidak perlu mengubah data
  di sheet sama sekali.

### Diuji
- Diuji dengan Playwright: respons fetch disimulasikan mengembalikan teks HTML
  (`<!DOCTYPE html>...`) alih-alih JSON — dikonfirmasi `parseJsonAman_()` melempar pesan Bahasa
  Indonesia yang jelas (bukan `Unexpected token`), dan daftar siswa tetap dimuat ulang setelah
  error simpan.
- Diuji urutan abjad dengan data uji berisi nama tidak berurutan (mis. "Zainal", "Abdurrahman",
  "Mira") — dikonfirmasi tampil terurut A→Z setelah `loadSiswaList()`, termasuk setelah
  pencarian di kolom "Cari nama siswa" dikosongkan kembali.
- (Regresi) Fitur pencarian (`search-siswa`) tetap berfungsi normal di atas daftar yang sudah
  terurut — filter hanya menyaring, tidak mengubah urutan.

---

## [0.5.4] — 2026-07-15

### Diperbaiki
- **Bug BARU #1 (ditemukan dari laporan pengguna setelah uji coba v0.5.3): nama siswa ikut
  HILANG dari daftar `pages/kelas/index.html` begitu foto siswa itu gagal dimuat** (bukan cuma
  fotonya yang jadi placeholder — seluruh baris termasuk nama & keterangan ikut lenyap, sesuai
  cuplikan layar yang dilampirkan pengguna).
  - **Akar masalah**: `fotoFallbackNext()` di `assets/js/foto-fallback.js` mengganti
    `img.parentElement.innerHTML` saat SEMUA kandidat foto gagal. Ini aman untuk kotak foto
    laporan cetak (`.rep-photo-box` memang HANYA berisi `<img>`, tidak ada elemen lain), tapi
    di `pages/kelas/assets/kelas.js` elemen `<img>` adalah **sibling** dari blok nama & info
    siswa dalam kartu (`.siswa-item`) yang sama — jadi mengganti `innerHTML` induknya ikut
    menghapus nama & info tsb, bukan cuma fotonya.
  - **Solusi**: `fotoFallbackNext()` sekarang HANYA mengganti node `<img>` itu sendiri
    (`parentNode.replaceChild`), tidak pernah menyentuh elemen saudara (`sibling`) apa pun.
    Berlaku aman untuk kedua kasus pemakaian (kartu daftar siswa & kotak foto laporan cetak).
- **Bug BARU #2: link foto yang ditempel manual di kolom "URL Foto" (format link "Bagikan"
  standar Google Drive, mis. `.../file/d/ID/view?usp=drive_link`) sama sekali tidak dikenali**
  — baik `extractDriveFileId()` (klien, `foto-fallback.js`) maupun `ekstrakIdFotoDrive_()`
  (server, `Code.gs`) sebelumnya HANYA mengenali format `?id=...`/`&id=...` (format yang dibuat
  aplikasi ini sendiri saat upload), bukan format link "Bagikan"/"Get link" standar yang paling
  umum disalin manual oleh pengguna dari menu Drive. Akibatnya link mentah dipakai apa adanya
  sebagai `<img src>` (yang sebetulnya halaman HTML, bukan gambar) — gagal dimuat, ditambah bug
  #1 di atas, membuat nama siswa ikut hilang persis seperti yang dilaporkan.
  - **Solusi**: kedua fungsi ekstraksi ID (klien & server) diperluas mengenali pola
    `.../d/ID/...` (mencakup format `/file/d/ID/view`) selain format `?id=` yang sudah ada.
    Foto lama yang formatnya sudah benar (`?id=...`) tetap kompatibel, tidak ada regresi.
- **Kemungkinan penyebab bug #3 (dilaporkan): tidak ada URL foto tersimpan sama sekali di
  spreadsheet meski foto berhasil masuk ke folder Drive dan tidak ada pesan error** — root
  cause pastinya TIDAK bisa dipastikan tanpa akses langsung ke spreadsheet sekolah, tapi
  penyebab paling mungkin (dan sudah didokumentasikan sebagai risiko sejak v0.4.1, lihat
  bagian "Catatan Penting" di `ANTIREGRESI.md`): **nama header kolom "URL Foto" di baris 1
  sheet "Data Siswa" tidak persis sama** (beda spasi/huruf besar-kecil) dengan yang dicari
  kode — karena penulisan baris memakai pencocokan nama header PERSIS
  (`buildRowByHeaders_()`), kalau tidak cocok maka nilai URL foto ditulis ke "" (tidak ke
  kolom manapun) TANPA memicu error, walau file fotonya sendiri sudah berhasil dibuat di Drive
  (jadi tampak "berhasil" dari sisi pengguna).
  - **Mitigasi (bukan solusi pasti, karena ini bergantung isi spreadsheet)**:
    `apps-script/Code.gs` → `doPostSiswa_()` sekarang mendeteksi kondisi ini secara eksplisit
    dan menambahkan pesan peringatan yang jelas ke `fotoWarning` kalau terjadi, supaya
    kegagalan ini tidak lagi senyap. **Pengguna WAJIB mengecek langsung** teks persis header
    kolom "URL Foto" di baris 1 sheet "Data Siswa" (lihat langkah cek di
    `apps-script/README.md` bagian troubleshooting terbaru).
- **Permintaan pengguna: form Tambah/Perbarui Data Siswa tidak menunjukkan status foto yang
  SUDAH tersimpan saat mode edit** (`pages/kelas/index.html`) — sekarang ditambahkan blok
  "Foto tersimpan saat ini" yang muncul begitu 1 siswa dipilih dari daftar untuk diedit,
  menampilkan foto asli (atau placeholder "Belum ada foto tersimpan" bila memang belum ada)
  memakai `foto-fallback.js` yang sama seperti tempat lain. Ambil/pilih foto baru akan
  MENGGANTI foto ini; kalau tidak diisi ulang, foto lama tetap dipakai (perilaku simpan tidak
  berubah, ini murni tambahan tampilan/visibilitas).

### Diuji
- Diuji dengan Playwright: simulasi kartu daftar siswa dengan foto yang SEMUA kandidatnya
  gagal dimuat (network mocking) — dikonfirmasi nama & info siswa TETAP tampil setelah
  placeholder foto muncul (regresi bug #1 tidak terulang).
- Ekstraksi ID diuji dengan berbagai format URL: `?id=...&sz=...` (lama), `/file/d/ID/view`
  (baru, sesuai contoh link yang diberikan pengguna), dan ID mentah — ketiganya menghasilkan
  ID file yang benar.
- **Catatan jujur soal batas pengujian otomatis**: penyebab pasti bug #3 (URL foto tidak
  tersimpan) TIDAK bisa dikonfirmasi/direproduksi di lingkungan pengembangan ini karena
  memerlukan akses ke spreadsheet & Apps Script sungguhan milik sekolah. Perbaikan yang
  diberikan adalah mitigasi diagnosa (memunculkan peringatan yang jelas), BUKAN kepastian
  bahwa ini satu-satunya penyebab — wajib diverifikasi langsung oleh pengguna sesuai langkah
  di `ANTIREGRESI.md` bagian "Skenario K".

### PENTING — Langkah wajib setelah menarik update ini
- **Deploy ulang Apps Script sebagai "New version"** (`Code.gs` berubah lagi di update ini).
- **Cek langsung baris 1 sheet "Data Siswa"** — pastikan teks header kolom foto PERSIS
  `URL Foto` (tanpa spasi tambahan di awal/akhir, huruf besar/kecil sama persis).

---

## [0.5.3] — 2026-07-15

### Diperbaiki
- **Bug lanjutan (regresi dari perbaikan v0.5.2 yang ternyata belum tuntas):
  foto siswa TETAP tidak tampil** di `pages/kelas/index.html` dan ketiga
  laporan cetak (`laporan.html`, `laporan-kognitif.html`,
  `laporan-jurnal.html`), padahal file foto sudah 100% berhasil tersimpan
  di Google Drive (dikonfirmasi langsung dari laporan pengguna: data teks
  tersimpan normal, folder Drive juga menyimpan filenya) dan sudah dishare
  "Anyone with the link".
- **Akar masalah sesungguhnya** (baru ketahuan setelah foto asli diuji di
  Drive sungguhan, bukan cuma network-mocking Playwright): 3 kandidat URL
  di v0.5.2 (`lh3.googleusercontent.com/d/`, `thumbnail?id=`,
  `uc?export=view&id=`) semuanya sama-sama cara **hotlink** file Drive
  langsung dari domain Google sebagai pengunjung **anonim** (tanpa sesi
  login Google di browser). Google membatasi/memblokir pola hotlink anonim
  semacam ini secara tidak konsisten — sama sekali di luar kendali kode
  aplikasi, terlepas dari izin sharing file sudah benar. Inilah kenapa
  fallback 3-lapis v0.5.2 lulus semua pengujian otomatis (yang memakai
  route interception/mock, bukan Drive sungguhan) tapi tetap gagal total
  di dunia nyata — pengujian sebelumnya tidak bisa menangkap masalah ini
  karena sifatnya jaringan/kebijakan Google, bukan bug logika kode.
- **Solusi**: `apps-script/Code.gs` — endpoint baru `?foto=<id>` yang
  membaca byte file dari Drive dan mengirimnya langsung sebagai respons
  HTTP (fungsi `serveFotoBinary_()`). Ini bekerja karena Apps Script Web
  App berjalan sebagai akun **pemilik script** yang punya akses sah ke
  file — bukan sebagai pengunjung anonim — sehingga sama sekali tidak
  terkena pembatasan hotlink Google. `<img src>` tidak butuh CORS (beda
  dengan fetch/XHR), jadi endpoint ini aman dipakai langsung.
- `assets/js/foto-fallback.js`: kandidat pertama diganti jadi proxy Apps
  Script ini (`MPLS_CONFIG.APPS_SCRIPT_URL + "?foto=" + id`). 3 format lama
  TETAP dipertahankan sebagai kandidat cadangan (kalau Apps Script sedang
  down/timeout/kuota habis), bukan dihapus — jadi tidak ada regresi kalau
  proxy gagal, foto tetap dicoba lewat jalur lama sebelum jatuh ke
  placeholder.
- **Tidak perlu mengubah data yang sudah tersimpan**: kolom "URL Foto" di
  sheet "Data Siswa" tetap dalam format lama
  (`.../thumbnail?id=...&sz=...`) — `foto-fallback.js` hanya mengekstrak
  ID file darinya, jadi foto-foto yang sudah pernah diupload otomatis ikut
  kebagian perbaikan ini tanpa perlu diedit ulang satu per satu.

### PENTING — Langkah wajib setelah menarik update ini
- **Deploy ulang Apps Script sebagai "New version"** (`Deploy → Manage
  deployments` → ✏️ pada deployment aktif → ubah dropdown **Version**
  jadi **New version** → **Deploy**). `Code.gs` berubah di update ini
  (endpoint `?foto=` baru), jadi wajib deploy ulang — kalau tidak,
  perbaikan ini tidak akan aktif meski kode sudah ter-update di editor,
  padahal tampilannya akan terlihat seolah perbaikan ini "tidak berhasil".
  URL Web App tidak berubah, jadi `config.js` tidak perlu disentuh.

### Diuji
- Dicek manual dengan membuka `APPS_SCRIPT_URL?foto=<id file asli dari
  Drive>` langsung di tab browser — mengembalikan gambar asli, bukan JSON.
- Diuji dengan Playwright (route interception): skenario kandidat proxy
  gagal (disimulasikan lewat network mocking) dikonfirmasi otomatis lanjut
  ke 3 kandidat cadangan lama, lalu ke placeholder kalau semuanya gagal —
  memastikan TIDAK ada regresi pada perilaku fallback yang sudah ada.
- **Catatan jujur soal batas pengujian otomatis**: skenario "proxy Apps
  Script benar-benar berhasil mengirim gambar asli" TIDAK bisa diuji penuh
  lewat Playwright di lingkungan ini (perlu Google Apps Script + folder
  Drive sungguhan milik sekolah, yang tidak tersedia saat pengembangan).
  Wajib diverifikasi manual oleh pengguna sesuai skenario di
  `ANTIREGRESI.md` bagian "Skenario J" sebelum dianggap benar-benar selesai.

---

## [0.5.2] — 2026-07-15

### Diperbaiki
- **Bug: foto siswa gagal tampil di `pages/kelas/index.html` dan ketiga laporan
  cetak, meski file-nya sudah berhasil tersimpan di Google Drive**. Akar
  masalah: format URL `drive.google.com/thumbnail?id=...` yang dipakai sejak
  v0.4.1 ternyata tidak konsisten bisa dijadikan `<img src>` langsung dari
  luar domain Drive (perilakunya bisa berubah sewaktu-waktu di sisi Google).
- **Solusi**: `assets/js/foto-fallback.js` (file baru) — untuk 1 foto,
  disiapkan 3 kandidat format URL sekaligus (`lh3.googleusercontent.com`,
  `thumbnail?id=`, `uc?export=view&id=`), dicoba satu-satu otomatis lewat
  event `onerror` sampai salah satu berhasil. Kalau ketiganya gagal, baru
  tampil placeholder "Foto Siswa" yang rapi — bukan ikon gambar rusak.
  Dipakai di `pages/kelas/assets/kelas.js` (daftar siswa) dan ketiga laporan
  cetak (`laporan.html`, `laporan-kognitif.html`, `laporan-jurnal.html`).
- Diuji dengan Playwright memakai **route interception** (network mocking
  sungguhan, bukan cuma baca kode): 2 kandidat URL pertama sengaja digagalkan,
  dan dikonfirmasi otomatis lanjut ke kandidat ke-3 yang berhasil memuat
  gambar. Skenario "semua kandidat gagal" juga diuji terpisah — hasilnya
  placeholder tampil dengan benar. Laporan cetak tetap dikonfirmasi 1 halaman A4.

### Catatan
- **Tidak perlu update/deploy ulang `Code.gs`** untuk perbaikan ini — URL yang
  sudah tersimpan di sheet "Data Siswa" (format `thumbnail?id=...`) tetap
  bisa dipakai apa adanya, karena `foto-fallback.js` mengekstrak ID file dari
  URL apa pun formatnya dan membangun ulang kandidat-kandidatnya sendiri.
- Folder Drive terlihat menyimpan beberapa file untuk siswa yang sama (foto
  diganti berkali-kali saat testing) — ini bukan bug, file lama memang belum
  dihapus otomatis saat foto diganti. Kalau mau dirapikan otomatis nanti,
  bisa jadi perbaikan terpisah (belum diminta, jadi belum dikerjakan).

---

### Ditambahkan
- **Fungsi bantuan `otorisasiAksesDrive()`** di `apps-script/Code.gs` — untuk
  mengatasi error `Exception: Access denied: DriveApp` saat upload foto siswa
  (kode error ini ditemukan langsung dari laporan pengguna). Error ini terjadi
  karena izin **Spreadsheet** dan izin **Drive** adalah 2 hal terpisah di
  Google — deploy ulang saja tidak memicu dialog izin baru untuk scope yang
  belum pernah disetujui. Fungsi ini dirancang supaya kalau dijalankan manual
  1x dari editor Apps Script, akan memicu dialog "Review permissions" yang
  mencakup izin Drive.
- `apps-script/README.md` — bagian troubleshooting diperluas dengan
  langkah persis mengatasi error ini, termasuk kemungkinan kasus langka
  (`appsscript.json` dengan `oauthScopes` manual yang belum menyertakan Drive).

### Catatan
- Ini BUKAN bug di kode aplikasi — SpreadsheetApp dan DriveApp perlu
  otorisasi terpisah walau dipanggil dari script yang sama. Tandanya persis
  seperti yang dilaporkan: data teks berhasil tersimpan, cuma foto yang gagal
  dengan pesan spesifik "Access denied: DriveApp".

---

### Ditambahkan
- **Modul baru: Asesmen Menulis (Jurnal Aktivitas)** — modul ketiga, terpisah
  penuh dari non-kognitif & kognitif (sheet & endpoint sendiri, sama sekali
  tidak mengubah keduanya). Menilai kemampuan anak menuliskan pokok pikiran
  secara terstruktur, sekaligus kemandirian & regulasi diri, lewat aktivitas
  jalan sehat ke Taman Kukusan (siswa mengisi jurnal mandiri di 3 momen:
  perjalanan, di taman, dan setelah kembali). Rubrik SENGAJA ringkas
  (2 kategori, 7 indikator total), sesuai permintaan — bukan penilaian
  tata bahasa/ejaan yang detail:
  - `pages/mpls/assets/mpls-jurnal-data.js` — kategori "Struktur & Isi
    Tulisan" dan "Kemandirian & Regulasi Diri"
  - `pages/mpls/assets/mpls-scoring-jurnal.js` — engine skoring & kesimpulan otomatis
  - `pages/mpls/input-jurnal.html` + `assets/app-jurnal.js` — form input,
    termasuk field opsional "Cuplikan Tulisan Siswa" untuk menyalin contoh
    tulisan asli anak sebagai bukti
  - `pages/mpls/rekap-jurnal.html`, `pages/mpls/laporan-jurnal.html`
  - Kartu navigasi baru di `pages/mpls/index.html`
  - `apps-script/Code.gs`: sheet baru **"Data Jurnal Aktivitas"**, endpoint
    `?namaJurnal=`, `?allJurnal=1`, `type: "jurnal"` di `doPost`

### Diperbaiki — Laporan Cetak PDF (ketiga jenis: non-kognitif, kognitif, menulis)
- **Bug: tombol "← Kembali ke Rekap" dan "🖨️ Cetak / Simpan sebagai PDF" ikut
  tercetak di PDF**. Akar masalah: skrip men-set `element.style.display`
  langsung (inline style) untuk menampilkan toolbar di layar, dan inline
  style SELALU menang melawan aturan CSS biasa di `@media print` — jadi
  aturan "sembunyikan saat print" sebelumnya kalah. Perbaikan: aturan
  `@media print { #toolbar { display: none !important; } }` — `!important`
  memastikan tetap tersembunyi apa pun inline style yang di-set skrip.
- **Jarak antar-blok diperlonggar** (kesimpulan akhir, kotak identitas, kartu
  kategori) — sebelumnya margin/padding terlalu rapat sehingga melelahkan
  dibaca. Tetap diverifikasi ulang pas 1 halaman A4 lewat Playwright.
- **Bug: ukuran font blok tanda tangan (tempat/tanggal, nama, NBM) terlalu
  besar dibanding teks lain**. Akar masalah: blok tanda tangan memakai unit
  `pt` sedangkan seluruh dokumen lain memakai `px` — 11pt setara ±14.7px,
  jauh lebih besar dari teks isi (~11-12px). Disamakan semua ke `px` dengan
  skala sepadan; ruang kosong tanda tangan tetap dijaga ±32pt (≈43px) sesuai
  permintaan awal, hanya teksnya yang diperkecil.
- **Foto siswa**: ditambah `onerror` fallback — kalau URL foto gagal dimuat
  (mis. link rusak/foto dihapus), otomatis tampilkan placeholder rapi
  "Foto Siswa", bukan ikon gambar rusak. `object-fit: cover` pada kotak foto
  dikonfirmasi sudah benar (foto akan mengisi penuh & terpotong proporsional
  sesuai ukuran frame, bukan gepeng/terdistorsi).

### Catatan Arsitektur
- Ketiga laporan cetak (`laporan.html`, `laporan-kognitif.html`,
  `laporan-jurnal.html`) sekarang konsisten pakai unit `px` untuk semua teks
  (bukan campuran `pt`/`px` seperti sebelumnya) — kalau menambah laporan
  baru lagi, ikuti pola ini supaya tidak terulang masalah skala font.
- Semua perubahan divalidasi ulang dengan Playwright (render → print ke PDF
  → cek jumlah halaman via `pypdf` + cek teks toolbar TIDAK ada di PDF) —
  bukan hanya estimasi visual.

---

### Ditambahkan
- **Pilih foto dari galeri, tidak hanya kamera**: `pages/kelas/index.html`
  sekarang punya 2 tombol terpisah — **"📷 Ambil Foto"** (buka kamera
  langsung) dan **"🖼️ Pilih dari Galeri"** (buka album/galeri foto HP tanpa
  memaksa kamera). Sebelumnya hanya ada 1 input dengan atribut `capture`
  yang di sebagian browser/HP memaksa kamera terbuka tanpa opsi galeri.
  Kedua jalur foto memakai proses resize/kompres klien yang sama persis
  (maks. 1280px, JPEG kualitas 0.75) sebelum diunggah.

### Catatan Arsitektur
- Implementasi pakai 2 elemen `<input type="file">` tersembunyi (satu
  dengan `capture="environment"`, satu tanpa), dipicu lewat tombol biasa
  (`.click()`) — pendekatan ini lebih konsisten lintas browser dibanding
  mengandalkan satu `<input>` dengan `capture` yang perilakunya berbeda-beda
  per OS/browser.

---

### Diperbaiki
- **Bug: foto & tanggal lahir siswa tidak muncul di `pages/kelas/index.html`**.
  Akar masalah: fungsi baca/tulis sheet di `apps-script/Code.gs` mengasumsikan
  urutan kolom fisik di spreadsheet SELALU sama persis dengan urutan array
  konstanta (`SISWA_HEADERS`, dst) di kode — kalau berbeda (mis. sheet sempat
  dibuat/diedit manual), data bisa "geser" ke field yang salah. Ini
  menjelaskan kenapa dua kolom bersebelahan (Tanggal Lahir & URL Foto)
  sama-sama bermasalah.
  - Semua fungsi baca (`doGet`, `sheetToObjects_`) dan tulis (`doPost`,
    `doPostSiswa_`) sekarang **selalu membaca ulang baris header sesungguhnya**
    dari baris 1 tiap sheet (`readHeaderRow_`) dan mencocokkan berdasarkan
    NAMA kolom, bukan lagi asumsi indeks/urutan tetap — berlaku untuk
    ketiga sheet (Data MPLS, Data Siswa, Data MPLS Kognitif) sekaligus.
  - Nilai tanggal yang otomatis terdeteksi Google Sheets sebagai objek
    `Date` sekarang dinormalisasi jadi teks `yyyy-MM-dd` yang konsisten
    sebelum dikirim ke web (`normalizeCell_`), supaya tidak pernah tampil
    kosong/aneh gara-gara format.
- **Bug: kegagalan upload foto menggagalkan seluruh penyimpanan data siswa**.
  Sekarang kalau foto gagal diunggah ke Drive (mis. izin belum diotorisasi
  ulang setelah deploy baru), **data teks tetap tersimpan** dan pengguna
  diberi tahu lewat pesan peringatan spesifik (field `fotoWarning` di respons,
  ditampilkan sebagai toast merah di `pages/kelas/index.html`) — bukan gagal
  total tanpa keterangan jelas seperti sebelumnya.
- **URL foto diganti formatnya**: dari `.../uc?id=...` menjadi
  `.../thumbnail?id=...&sz=w1000`, karena format sebelumnya kadang gagal
  tampil langsung sebagai `<img>` (Google menampilkan halaman perantara,
  bukan gambarnya) — kemungkinan turut berkontribusi pada foto "tidak muncul".

### Catatan Arsitektur
- Konstanta `HEADERS`/`SISWA_HEADERS`/`HEADERS_KOGNITIF` di `Code.gs` sekarang
  HANYA dipakai saat membuat sheet baru pertama kali (`setupSheet*`). Baca/tulis
  data sehari-hari sepenuhnya mengikuti header asli di baris 1 sheet — lihat
  `apps-script/README.md` bagian "Troubleshooting" untuk detail & implikasinya
  (boleh tambah kolom baru di kanan, jangan mengedit teks header yang sudah ada).

---

### Ditambahkan
- **Modul baru: Asesmen Awal Kognitif** (literasi & numerasi dasar), paralel
  dan terpisah penuh dari modul non-kognitif (MPLS) supaya tidak ada risiko
  regresi pada fitur yang sudah berjalan:
  - `pages/mpls/assets/mpls-kognitif-data.js` — 5 kategori: Literasi Dasar
    (Membaca), Numerasi Penjumlahan, Pengurangan, Perkalian, Pembagian —
    masing-masing dijabarkan jadi beberapa indikator konkret (skala BB–BSB
    sama seperti non-kognitif)
  - `pages/mpls/assets/mpls-scoring-kognitif.js` — engine skoring & kesimpulan
    otomatis versi akademik (teks berbeda dari non-kognitif, disesuaikan
    konteks literasi/numerasi)
  - `pages/mpls/input-kognitif.html` + `assets/app-kognitif.js` — form input
    per siswa (mirror `input.html`, kode akses terpisah sama seperti sebelumnya)
  - `pages/mpls/rekap-kognitif.html` — rekap & kesimpulan otomatis seluruh
    siswa (khusus guru, Firebase-gated, dropdown nama siswa)
  - `pages/mpls/laporan-kognitif.html` — cetak/PDF A4 satu halaman per siswa
  - Kartu navigasi baru di `pages/mpls/index.html`, dan tautan silang antara
    rekap non-kognitif ↔ kognitif
  - Backend `apps-script/Code.gs`: sheet baru **"Data MPLS Kognitif"**,
    endpoint `?namaKognitif=`, `?allKognitif=1`, dan `type: "mpls_kognitif"`
    di `doPost` — sama sekali tidak mengubah perilaku endpoint/sheet lama

### Diperbaiki / Ditingkatkan
- **Nama guru kelas selalu tertera di laporan cetak**: field baru
  `MPLS_WALI_KELAS` ("Arif Azwar Anas") di `mpls-data.js`, ditampilkan sebagai
  "Guru Kelas" di `laporan.html` & `laporan-kognitif.html`, terpisah dari
  "Guru Pengamat (pengisi form)" yang tetap menampilkan siapa pun yang
  benar-benar mengisi (Arif atau Bu Azizah)
- **Laporan cetak PDF (`laporan.html` & `laporan-kognitif.html`) dirombak**:
  - Ditambah kotak foto siswa di bagian identitas (pakai foto dari modul
    Kelas bila ada, placeholder bila belum ada)
  - Ukuran tulisan diperbesar (±15%) untuk keterbacaan orang tua, tetap
    dipastikan pas 1 halaman A4 lewat pengujian render otomatis (Playwright)
  - Ditambah blok tanda tangan guru kelas di kanan bawah: tempat & tanggal
    ("Depok, [tanggal cetak]"), ruang tanda tangan (~34pt), nama & gelar
    ("Arif Azwar Anas, S.Pd"), dan NBM ("NBM. 1167333") — konstanta baru
    `MPLS_WALI_KELAS_TTD`, `MPLS_WALI_KELAS_NBM`, `MPLS_KOTA_TTD` di `mpls-data.js`
  - `laporan-kognitif.html` memakai grid 3 kolom untuk 5 kategori (bukan 2
    kolom seperti non-kognitif) supaya tetap ringkas 1 halaman

### Catatan Arsitektur
- Tanggal pada blok tanda tangan **dibuat otomatis mengikuti tanggal cetak**
  (bukan tanggal tetap), memakai format "Depok, [tanggal]". Kalau perlu
  tanggal tetap/manual, ubah `MPLS_KOTA_TTD` atau logika tanggal di
  `laporan.html`/`laporan-kognitif.html` bagian `.rep-signature`.
- Layout laporan cetak diverifikasi otomatis pas 1 halaman A4 memakai
  Playwright (render → print ke PDF → cek jumlah halaman = 1), bukan hanya
  estimasi visual, untuk skenario data penuh maupun dengan foto.

---

### Diperbaiki
- `pages/mpls/rekap.html`: **bug** — bagian "Kesimpulan Akhir Kesiapan Belajar"
  sebelumnya hanya menampilkan narasi tanpa aspek kuat/perlu perhatian dan
  tanpa saran guru/orang tua tingkat keseluruhan (padahal datanya sudah
  dihitung `mpls-scoring.js`) — sekarang ditampilkan lengkap
- `pages/mpls/rekap.html`: detail tiap siswa kini **terbuka secara default**
  (tidak perlu klik dulu) supaya hasil bisa langsung dinilai
- `pages/mpls/rekap.html`: pesan saat data kosong dibedakan antara "sheet
  memang belum ada data" vs "kemungkinan Apps Script belum ter-deploy versi
  terbaru" (field `data` tidak ada di respons) — untuk mempermudah diagnosa
- `pages/mpls/assets/mpls-scoring.js`: kategori yang belum ada nilainya sama
  sekali sekarang ditandai **"-"**, bukan kalimat panjang
- `pages/mpls/laporan.html`: tambah baris ringkas "Aspek kuat" & "Perlu
  perhatian" di kesimpulan cetak (tetap ringkas, muat 1 halaman A4)

---

## [0.3.1] — 2026-07-14

### Diubah
- **Konsistensi nama siswa antara modul Kelas dan modul MPLS**: field
  "Nama Lengkap" di `pages/kelas/index.html` yang tadinya teks bebas diganti
  jadi dropdown berisi daftar siswa Kelas 5A yang sama persis dengan
  `MPLS_STUDENTS` (`pages/mpls/assets/mpls-data.js`), supaya tidak ada beda
  ejaan nama antara data profil siswa dan data penilaian MPLS
- `pages/mpls/rekap.html`: kotak pencarian teks diganti dropdown pilih nama
  siswa (sumber sama: `MPLS_STUDENTS`) — pilih "— Tampilkan semua siswa —"
  untuk lihat semua, atau pilih 1 nama untuk fokus ke siswa itu (otomatis
  ditandai "belum ada data" bila siswa itu belum dinilai, bukan kosong tanpa keterangan)

---

## [0.3.0] — 2026-07-13

### Ditambahkan
- **Rekap & kesimpulan otomatis MPLS**:
  - `pages/mpls/assets/mpls-scoring.js` — engine skoring: menghitung rata-rata
    per kategori (skala BB/MB/BSH/BSB), menentukan level, dan menghasilkan
    narasi kesimpulan + rekomendasi tindak lanjut guru & orang tua secara
    otomatis untuk berbagai skenario hasil (termasuk kesimpulan akhir
    kesiapan belajar gabungan dari 4 kategori)
  - `pages/mpls/rekap.html` — daftar rekap seluruh siswa, bisa dicari,
    expand untuk detail per kategori + rekomendasi (khusus guru)
  - `pages/mpls/laporan.html` — cetak/simpan PDF hasil MPLS per siswa,
    layout A4 satu halaman dengan logo sekolah (`assets/img/logo-sekolah.jpg`)
  - Kartu "Rekap Hasil" di `pages/mpls/index.html` diaktifkan (sebelumnya
    "Segera hadir")
- **Dropdown guru pengamat dibatasi**: `input.html` — field "Diisi Oleh"
  yang tadinya teks bebas diganti dropdown 2 pilihan (`MPLS_GURU_LIST` di
  `mpls-data.js`): "Arif Azwar Anas", "Azizah Zahro Ibrahim"
- **Modul baru "Kelas" — data profil & foto siswa** (khusus guru):
  - Kontainer baru di beranda (`index.html` root) — muncul hanya untuk role `guru`
  - `pages/kelas/index.html` — form tambah/perbarui data siswa (nama lengkap,
    nama panggilan, tempat & tanggal lahir) + daftar siswa tersimpan
  - Foto diambil langsung dari kamera HP, diperkecil & dikompres otomatis di
    sisi klien (maks. 1280px, JPEG kualitas 0.75) sebelum diunggah
  - Data teks disimpan ke sheet baru **"Data Siswa"**; foto disimpan ke folder
    Google Drive yang sudah dishare pemilik proyek (link folder ada di
    `apps-script/Code.gs` → `FOTO_FOLDER_ID`)
- **Proteksi Firebase Auth untuk halaman sensitif baru**: `assets/js/guru-guard.js`
  — `rekap.html`, `laporan.html`, dan `pages/kelas/index.html` kini memverifikasi
  login + role `guru` lewat Firebase sebelum menampilkan konten (beda dari
  `input.html` yang tetap pakai kode akses sederhana, tidak diubah)
- `apps-script/Code.gs`: sheet "Data Siswa" + header, endpoint `?all=1` dan
  `?siswa=1` di `doGet`, penanganan `type: "siswa"` di `doPost` (termasuk
  simpan foto base64 ke Drive)
- `CHANGELOG.md` — pelacak progres pengerjaan fitur ini

### Catatan Arsitektur
- Ambang skor kategori: <1.75 BB · 1.75–2.49 MB · 2.5–3.24 BSH · ≥3.25 BSB.
  Kesimpulan akhir mempertimbangkan jumlah kategori BB/MB, bukan sekadar
  rata-rata polos, supaya 1 kategori sangat lemah tidak "tertutupi" kategori lain.
- Laporan PDF pakai `window.print()` + CSS `@page { size: A4 }`, bukan
  library seperti jsPDF, untuk hasil satu halaman yang lebih presisi.

---

## [0.2.0] — 2026-07-13

### Ditambahkan
- Modul **MPLS — Penilaian Non-Kognitif** (`pages/mpls/`):
  - `index.html` — halaman landing MPLS dengan kartu menu (Input Penilaian aktif, Rekap Hasil segera hadir)
  - `input.html` — form input penilaian, dioptimalkan untuk HP: pemilih siswa, 4 kategori dalam accordion, tombol skala 1-4 (BB/MB/BSH/BSB), progress bar kelengkapan, tombol simpan sticky di bawah
  - Gerbang kode akses sederhana sebelum form bisa diisi (`assets/config.js` → `ACCESS_CODE`)
  - Data tersimpan otomatis ke Google Spreadsheet (satu baris per siswa, mengisi ulang nama yang sama akan meng-update, bukan menduplikasi)
  - Memuat ulang isian sebelumnya saat nama siswa yang sudah pernah diisi dipilih lagi — mendukung pengisian bertahap selama minggu MPLS
- Kartu navigasi **MPLS** ditambahkan ke beranda utama (`index.html`)
- `apps-script/Code.gs` — backend Google Apps Script (`doGet`/`doPost`) yang menjembatani form ke Google Sheets
- `apps-script/README.md` — panduan deploy Apps Script sebagai Web App
- Bagian **Langkah 8** di `README.md` — cara mengaktifkan modul MPLS (terpisah dari setup Firebase)

### Catatan Arsitektur
- Modul MPLS memakai **Google Sheets**, bukan Firestore, sebagai penyimpanan —
  supaya wali kelas bisa langsung membaca/mengolah data di spreadsheet tanpa
  perlu panel admin terpisah
- Struktur kategori & indikator penilaian mengikuti instrumen observasi MPLS
  (skala BB/MB/BSH/BSB) yang sudah disusun sebelumnya di luar repo ini

---

## [0.1.0] — 2026-06-07

### Ditambahkan
- `index.html` — halaman beranda dengan hero, navigasi kartu, dan daftar pengumuman
- `README.md` — dokumentasi setup lengkap untuk pemula (GitHub Pages + Firebase)
- `CHANGELOG.md` — catatan perubahan proyek ini
- `ANTIREGRESI.md` — panduan ujicoba dan checklist anti-regresi
- Sistem login berbasis Firebase Authentication (email & kata sandi)
- Dua peran pengguna: `guru` (admin) dan `siswa` (hanya baca)
- Panel guru tampil otomatis jika role = `guru`
- Pengumuman terbaru dimuat dinamis dari koleksi Firestore `pengumuman`
- Loading screen saat inisialisasi Firebase
- Pesan error login yang ramah pengguna (bahasa Indonesia)

### Struktur Database Firestore (awal)
- Koleksi `users` — data pengguna (nama, role, email)
- Koleksi `pengumuman` — judul, isi, tanggal, oleh

---

## Panduan Menulis Changelog

Setiap rilis baru, tambahkan blok baru di atas dengan format:

```
## [versi] — YYYY-MM-DD

### Ditambahkan
- Fitur baru

### Diubah
- Perubahan pada fitur yang sudah ada

### Diperbaiki
- Bug yang sudah diperbaiki

### Dihapus
- Fitur yang dihapus

### Keamanan
- Perbaikan celah keamanan
```

**Aturan versi (Semantic Versioning):**
- `0.1.0` → versi awal / prototipe
- `0.2.0` → fitur baru ditambahkan
- `0.2.1` → hanya perbaikan bug kecil
- `1.0.0` → siap dipakai penuh oleh semua siswa & guru
