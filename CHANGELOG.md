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
- `pages/mpls/rekap.html` — ringkasan hasil observasi MPLS seluruh siswa (kartu "Rekap Hasil" sudah disiapkan di `pages/mpls/index.html`, ditandai "Segera hadir")
- Gerbang akses modul MPLS dipindah dari kode akses sederhana ke Firebase Authentication, begitu Firebase aktif secara sitewide

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
