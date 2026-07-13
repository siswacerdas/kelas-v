# 📚 Kelas 5 — Pusat Belajar Digital
### Tahun Pelajaran 2026–2027

Website pembelajaran terpadu untuk guru dan siswa Kelas 5. Dibangun di atas GitHub Pages (hosting gratis) dan Firebase (database + autentikasi).

---

## 🗂️ Isi Website

| Halaman | Deskripsi |
|---|---|
| Beranda | Pengumuman terbaru, navigasi utama |
| MPLS — Penilaian Non-Kognitif | Input observasi emosi, kemandirian, minat & kondisi fisik siswa selama MPLS, dioptimalkan untuk HP, tersimpan ke Google Spreadsheet |
| CP / TP / ATP | Capaian Pembelajaran, Tujuan Pembelajaran, Alur Tujuan Pembelajaran |
| Modul Pembelajaran | Modul scaffolding per tema & mata pelajaran |
| Materi Ajar | Buku Belajar Mandiri siswa |
| Bank Soal | Soal latihan & ujian per mapel |
| Pengumuman | Informasi penting dari guru |
| Jadwal | Jadwal pelajaran & kalender akademik |

---

## ⚙️ Teknologi yang Digunakan

- **GitHub Pages** — hosting website statis, gratis, otomatis deploy dari branch `main`
- **Firebase Authentication** — login/logout berbasis email & kata sandi
- **Cloud Firestore** — database untuk pengumuman, modul, dan soal yang bisa diupdate guru
- **HTML + CSS + JavaScript (Vanilla)** — tidak perlu framework besar, ringan di semua perangkat
- **Google Apps Script + Google Sheets** — backend khusus modul MPLS (lihat `apps-script/README.md`), dipakai karena datanya perlu langsung terbaca/diolah lewat spreadsheet oleh wali kelas

---

## 🚀 Cara Setup (Untuk Pemula)

### Langkah 1 — Aktifkan GitHub Pages
1. Buka repo ini di GitHub
2. Klik tab **Settings** → pilih **Pages** di menu kiri
3. Di bagian *Source*, pilih branch `main` dan folder `/ (root)`
4. Klik **Save** — website akan aktif di `https://siswacerdas.github.io/kelas-v/`

### Langkah 2 — Buat Proyek Firebase
1. Buka [console.firebase.google.com](https://console.firebase.google.com)
2. Klik **Add project** → beri nama, misal: `kelas-v-2026`
3. Nonaktifkan Google Analytics (tidak perlu untuk proyek ini) → klik **Create project**

### Langkah 3 — Aktifkan Firestore
1. Di Firebase Console, klik **Build → Firestore Database**
2. Klik **Create database**
3. Pilih **Start in test mode** (untuk pemula — batas 30 hari, nanti perlu diperketat)
4. Pilih lokasi server: `asia-southeast2` (Jakarta)
5. Klik **Done**

### Langkah 4 — Aktifkan Authentication
1. Klik **Build → Authentication**
2. Klik **Get started**
3. Pilih tab **Sign-in method** → klik **Email/Password**
4. Aktifkan toggle pertama → klik **Save**

### Langkah 5 — Ambil Firebase Config
1. Klik ikon ⚙️ (gear) → **Project settings**
2. Scroll ke bawah ke bagian **Your apps** → klik ikon `</>`  (Web)
3. Daftarkan app → salin objek `firebaseConfig`
4. Buka file `index.html` di repo ini
5. Ganti bagian `GANTI_...` dengan nilai yang kamu salin

### Langkah 6 — Tambah Pengguna Pertama (Guru)
1. Di Firebase Console → **Authentication → Users** → **Add user**
2. Masukkan email dan kata sandi guru
3. Salin **User UID** yang muncul
4. Di **Firestore** → buat koleksi `users` → buat dokumen dengan ID = UID tersebut
5. Isi field:
   ```
   nama  : "Nama Guru"
   role  : "guru"
   email : "email@guru.com"
   ```

### Langkah 7 — Tambah Akun Siswa
Ulangi Langkah 6 untuk setiap siswa, dengan `role: "siswa"`

### Langkah 8 — Aktifkan Modul MPLS (opsional, terpisah dari Firebase)
Modul MPLS (`pages/mpls/`) memakai Google Sheets sebagai penyimpanan, bukan
Firestore, supaya wali kelas bisa langsung baca/olah datanya di spreadsheet.
Setup-nya independen dari Langkah 1–7 di atas — lihat panduan lengkap di
[`apps-script/README.md`](./apps-script/README.md).

---

## 📁 Struktur Folder

```
kelas-v/
├── index.html           ← Halaman utama (beranda)
├── README.md            ← Dokumentasi ini
├── CHANGELOG.md         ← Riwayat perubahan
├── ANTIREGRESI.md       ← Panduan ujicoba & anti-regresi
├── assets/
│   ├── css/
│   │   └── style.css    ← Stylesheet global (opsional, sudah inline di index)
│   └── img/
│       └── logo.png     ← Logo sekolah
├── apps-script/
│   ├── Code.gs           ← Backend Google Apps Script untuk modul MPLS
│   └── README.md         ← Cara deploy Apps Script sebagai Web App
└── pages/
    ├── cp-tp-atp.html
    ├── modul.html
    ├── materi.html
    ├── bank-soal.html
    ├── info.html
    ├── jadwal.html
    ├── admin.html        ← Hanya bisa diakses guru
    └── mpls/
        ├── index.html     ← Landing MPLS (daftar sub-halaman)
        ├── input.html      ← Form input penilaian (mobile-first)
        └── assets/
            ├── mpls.css     ← Gaya bersama halaman MPLS
            ├── mpls-data.js ← Daftar siswa, skala, kategori indikator
            ├── config.js    ← URL Apps Script & kode akses (GANTI sebelum pakai)
            └── app.js       ← Logika form: render, load, simpan
```

---

## 🔐 Struktur Database Firestore

```
users/
  {uid}/
    nama    : string
    role    : "guru" | "siswa"
    email   : string

pengumuman/
  {id}/
    judul   : string
    isi     : string
    tanggal : timestamp
    oleh    : string (nama guru)

modul/
  {id}/
    judul    : string
    mapel    : string
    tema     : string
    url_file : string (link Google Drive / PDF)
    urutan   : number

bank_soal/
  {id}/
    pertanyaan : string
    pilihan    : array
    jawaban    : string
    mapel      : string
    tingkat    : string
```

---

## 🔒 Keamanan (Firestore Rules — Produksi)

Setelah selesai ujicoba, ganti rules Firestore dengan:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Data user: hanya bisa dibaca/ditulis oleh pemilik atau guru
    match /users/{uid} {
      allow read: if request.auth != null && request.auth.uid == uid;
      allow write: if request.auth != null &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'guru';
    }

    // Pengumuman, modul, soal: semua login bisa baca; hanya guru yang bisa tulis
    match /{koleksi}/{id} {
      allow read: if request.auth != null;
      allow write: if request.auth != null &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'guru';
    }
  }
}
```

---

## 🤝 Kontribusi

Proyek ini dikelola oleh wali kelas. Untuk pertanyaan atau saran perbaikan, hubungi melalui:
- Email guru: *(isi email guru)*
- Grup kelas: *(isi link WhatsApp grup)*

---

*Dibuat dengan semangat belajar bersama 🌱*
