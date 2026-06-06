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
