# Changelog

Semua perubahan penting pada proyek ini dicatat di sini.  
Format mengacu pada [Keep a Changelog](https://keepachangelog.com/id/1.0.0/).

---

## [Unreleased]
> Fitur dan perbaikan yang sedang dikerjakan, belum masuk ke versi rilis.

### Direncanakan
- Halaman `cp-tp-atp.html` — tampilan CP, TP, dan ATP per mata pelajaran
- Halaman `modul.html` — daftar modul scaffolding
- Halaman `materi.html` — buku belajar mandiri
- Halaman `bank-soal.html` — kumpulan soal dengan filter mapel
- Halaman `admin.html` — panel kelola konten untuk guru
- Halaman `jadwal.html` — jadwal pelajaran mingguan
- Integrasi upload modul & soal ke Firestore dari panel guru
- Gerbang akses `input.html` masih pakai kode akses sederhana (belum dipindah ke
  Firebase) — sengaja tidak diubah dulu di update ini supaya tidak regresi

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
- `PROGRESS_MPLS_LANJUTAN.md` — pelacak progres pengerjaan fitur ini

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
