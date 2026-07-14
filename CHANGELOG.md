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

## [0.4.2] — 2026-07-14

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
