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
| Galeri Visual | Gambar, poster, infografis & video singkat pendukung belajar per mata pelajaran, khusus untuk gaya belajar visual |
| Uji Kemampuan | Latihan soal mandiri per mata pelajaran |
| Laporan Siswa | Ringkasan profil, hasil asesmen MPLS, dan jurnal aktivitas per siswa — guru (siapa saja) & orang tua (anaknya sendiri saja), tidak untuk siswa |
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

### Langkah 7b — Tambah Akun Orang Tua (untuk fitur Laporan Siswa)
Sama seperti Langkah 6/7, tapi field-nya:
```
nama  : "Nama Orang Tua"
role  : "orangtua"
email : "email@orangtua.com"
anak  : ["Nama Lengkap Siswa 1", "Nama Lengkap Siswa 2"]
```
`anak` adalah **array** (bukan teks tunggal) — isinya harus **PERSIS SAMA**
ejaannya dengan kolom "Nama Lengkap" di sheet "Data Siswa" (lihat
`apps-script/README.md`), karena itu yang dipakai sistem untuk mencocokkan
data laporan yang boleh dilihat akun ini. Boleh diisi lebih dari 1 nama
kalau orang tua punya lebih dari 1 anak di kelas ini.

Cara menambah field array di Firestore Console: klik **+ Add field**, pilih
tipe **array**, lalu tambahkan tiap nama sebagai item array bertipe string.

Akun `orangtua` HANYA bisa melihat laporan anak yang namanya ada di field
ini (dibatasi di server, lihat `apps-script/Code.gs` fungsi
`wajibAksesLaporan_`) — bukan sekadar disembunyikan di tampilan. Detail
rancangan lengkap fitur ini ada di `RANCANGAN-LAPORAN-SISWA.md`.

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
│   ├── img/
│   │   └── logo-sekolah.jpg ← Logo untuk laporan cetak MPLS
│   └── js/
│       ├── guru-guard.js   ← Pelindung Firebase Auth khusus halaman guru
│       └── auth-guard.js   ← Pelindung Firebase Auth untuk siapa saja yang login (guru & siswa)
├── apps-script/
│   ├── Code.gs           ← Backend Google Apps Script untuk modul MPLS + Data Siswa
│   └── README.md         ← Cara deploy Apps Script sebagai Web App
└── pages/
    ├── cp-tp-atp.html     ← Kerangka statis, isi CP/TP/ATP menunggu dokumen resmi
    ├── modul.html         ← Daftar modul, bisa diakses guru & siswa yang login
    ├── materi.html        ← Materi Ajar (dibaca langsung), guru & siswa
    ├── infografis.html    ← Landing Galeri Visual, menu per mata pelajaran
    ├── uji-kemampuan.html ← Latihan soal interaktif dengan skor, guru & siswa (dulu "bank-soal.html")
    ├── info.html          ← Arsip lengkap pengumuman, guru & siswa
    ├── jadwal.html        ← Kerangka statis, isi jadwal menunggu jadwal resmi
    ├── admin.html         ← Panel kelola konten (Pengumuman/Modul/Materi/Uji Kemampuan), hanya guru
    ├── laporan-siswa.html ← Landing 3 pintu laporan (MPLS/Perkembangan Belajar Mandiri/
    │                         Latihan Mandiri Siswa), guru (siapa saja) & orangtua (anaknya
    │                         sendiri saja) — TIDAK untuk siswa
    ├── kelas/             ← Data profil & foto siswa (khusus guru, Firebase-gated)
    │   ├── index.html
    │   └── assets/
    │       ├── kelas.css
    │       └── kelas.js
    ├── infografis/        ← Galeri Visual: gambar/poster/infografis/video, guru & siswa
    │   ├── galeri.html    ← Daftar media per mata pelajaran (?mapel=slug)
    │   ├── kelola-tp.html ← Unggah/ganti infografis per materi (1 materi = 1 infografis),
    │   │                     khusus guru (Firebase-gated) — pilih TP dari dropdown otomatis
    │   │                     dari materi-index.js, tiap materi jadi 1 kartu
    │   └── assets/
    │       ├── infografis-data.js   ← Daftar mata pelajaran (sumber tunggal, sama slug/warna dgn materi)
    │       ├── infografis.css
    │       ├── infografis-galeri.js
    │       └── infografis-kelola-tp.js
    ├── laporan-siswa/
    │   ├── mpls.html            ← Pintu 1: kesiapan belajar+akademik+jurnal (AKTIF)
    │   ├── belajar-mandiri.html ← Pintu 2: ketuntasan Materi Ajar & Modul (Segera Hadir)
    │   ├── latihan-mandiri.html ← Pintu 3: hasil Uji Kemampuan per TP (Segera Hadir)
    │   └── assets/
    │       ├── laporan-guard.js ← Gerbang akses bersama (role guru/orangtua, blokir siswa)
    │       │                       untuk landing + ketiga pintu di atas
    │       ├── laporan.css
    │       └── laporan.js       ← Logika Pintu 1 (MPLS) saja
    └── mpls/
        ├── index.html     ← Landing MPLS (daftar sub-halaman)
        ├── input.html     ← Form input penilaian (mobile-first)
        ├── rekap.html     ← Rekap & kesimpulan otomatis semua siswa (khusus guru)
        ├── laporan.html   ← Cetak/PDF hasil MPLS per siswa, A4 satu halaman (khusus guru)
        └── assets/
            ├── mpls.css        ← Gaya bersama halaman MPLS
            ├── mpls-data.js    ← Daftar siswa, skala, kategori indikator, daftar guru
            ├── mpls-scoring.js ← Engine skoring & kesimpulan otomatis
            ├── config.js       ← URL Apps Script & kode akses (GANTI sebelum pakai)
            └── app.js          ← Logika form: render, load, simpan
```

---

## 🔐 Struktur Database Firestore

```
users/
  {uid}/
    nama    : string
    role    : "guru" | "siswa" | "orangtua"
    email   : string
    anak    : array of string   (HANYA untuk role "orangtua" — lihat Langkah 7b)

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

materi/
  {id}/
    judul    : string
    mapel    : string
    tema     : string
    isi      : string (teks materi, dibaca langsung di halaman — bukan link)
    url_file : string (opsional, lampiran tambahan kalau ada)
    urutan   : number

bank_soal/
  {id}/
    // ── Field umum, wajib ada di semua jenis soal ──
    pertanyaan   : string
    mapel        : string   (harus SAMA PERSIS dengan salah satu window.URUTAN_MAPEL)
    tp           : string   (kode TP — harus SAMA PERSIS dengan tp di tp-kko-index.js)
    jenisSoal    : "pg_tunggal" | "pg_kompleks" | "pg_kategori" | "mengurutkan" | "menjodohkan"
    kko          : "C1".."C6"  (harus ≤ kkoMax milik TP tsb, divalidasi di admin.html)
    kompleksitas : "dasar" | "menengah" | "menantang"
    randKey      : number 0–1  (dibuat otomatis, dipakai buat ambil soal acak dari pool)

    // ── Field tambahan, tergantung jenisSoal ──
    // pg_tunggal:  pilihan (array string), jawaban (string, 1 teks benar)
    // pg_kompleks: pilihan (array string), jawabanBenar (array string, ≥2 jawaban benar)
    // pg_kategori: kategori (array string), item (array {teks, kategoriBenar})
    // mengurutkan: item (array string, urutan array = urutan yang benar)
    // menjodohkan: pasangan (array {kiri, kanan})

hasil_latihan/
  {id}/
    uid            : string (uid siswa dari Firebase Auth — dipakai buat batasan akses)
    namaSiswa      : string (dipakai orang tua buat mencocokkan field `anak` miliknya)
    mapel          : string
    tp             : string
    tpJudul        : string (disalin biar riwayat tetap terbaca walau tp-kko-index berubah)
    jumlahBenar    : number
    jumlahSoal     : number
    skor           : number (persen, 0–100)
    detailJawaban  : array {soalId, jenisSoal, benar}
    timestamp      : server timestamp

    // Dibuat sendiri oleh siswa saat submit kuis (pages/uji-kemampuan.html).
    // TIDAK BISA diubah/dihapus oleh siswa maupun orang tua — lihat rules di bawah.
```

> **Catatan migrasi:** Soal lama dengan skema bebas (`mapel` teks bebas, `tingkat`, tanpa `tp`/`jenisSoal`) TIDAK otomatis tergabung ke pool TP manapun — field `tp` kosong berarti soal itu tidak akan pernah terambil oleh Uji Kemampuan versi baru. Soal-soal lama itu perlu di-edit ulang lewat Panel Guru (isi TP & jenis soalnya) atau dihapus, tergantung apakah kontennya masih relevan.

### Impor Soal Massal

Karena target minimal 200 soal/TP × puluhan TP tidak realistis diisi satu-satu lewat form,
Panel Guru punya tab **📥 Impor Massal** (`pages/admin.html#impor`): tempel array JSON berisi
banyak soal sekaligus (skema sama seperti `bank_soal` di atas, tanpa `randKey` — dibuat otomatis),
klik **Validasi** dulu (mengecek TP valid, KKO tidak melebihi batas TP, field wajib tiap jenis
soal lengkap — kalau ada yang bermasalah, TIDAK ADA yang disimpan), baru klik **Impor ke
Firestore** kalau sudah lolos validasi. Ditulis pakai `writeBatch` per 400 soal.


---

## 📊 Struktur Data MPLS (Google Sheets, terpisah dari Firestore)

Spreadsheet: `1G-LWyOSyCKLP10RU234grIR_5-iWxLSG-6vZP3sKUkA` (lihat `apps-script/README.md`)

```
Sheet "Data MPLS"   → 1 baris per siswa: nilai 4 kategori observasi MPLS
Sheet "Data Siswa"  → 1 baris per siswa: Nama Lengkap, Nama Panggilan,
                       Tempat Lahir, Tanggal Lahir, URL Foto (link Google Drive)
```

Foto siswa disimpan sebagai file di folder Google Drive terpisah (ID folder
ada di `apps-script/Code.gs` → `FOTO_FOLDER_ID`), bukan di spreadsheet.

---

## 🔒 Keamanan (Firestore Rules — Produksi)

Setelah selesai ujicoba, ganti rules Firestore dengan:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Data user: hanya bisa dibaca/ditulis oleh pemilik atau guru
    match /users/{uid} {
      // v1.0 (Fase 4 — Persetujuan Orang Tua di admin.html): guru BUTUH baca
      // (query) dokumen SIAPA SAJA di koleksi ini (bukan cuma dokumen sendiri)
      // untuk menampilkan daftar pendaftaran yang menunggu persetujuan.
      // SEBELUM baris "|| get(...).data.role == 'guru'" ini ditambahkan, guru
      // TIDAK BISA melihat daftar itu sama sekali — Firestore menolak query
      // "list" kalau aturan read tidak bisa dipastikan berlaku utk SEMUA hasil
      // yang mungkin cocok, dan "request.auth.uid == uid" saja cuma pernah
      // benar untuk 1 dokumen (milik sendiri), sehingga query manapun ke
      // koleksi ini oleh siapa pun kembali kosong sebelum perbaikan ini.
      allow read: if request.auth != null && (
        request.auth.uid == uid ||
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'guru'
      );

      // v1.0 (Fase 4 login — pendaftaran mandiri orang tua): pendaftar HANYA
      // boleh membuat dokumennya SENDIRI dengan role PERSIS "pending_orangtua"
      // — tidak bisa langsung set role "guru"/"orangtua" sendiri (mencegah
      // eskalasi privilese dari sisi klien). Field lain (nama/anak/email/wa)
      // boleh apa saja, hanya "role" yang dikunci.
      allow create: if request.auth != null && request.auth.uid == uid &&
        request.resource.data.role == "pending_orangtua";

      // Guru tetap bisa tulis/ubah dokumen SIAPA SAJA (approve/reject
      // pendaftaran orang tua, atau buat akun guru/orangtua manual).
      allow write: if request.auth != null &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'guru';
    }

    // Koleksi "siswa/{nisn}" (profil siswa + NISN, sejak migrasi Firestore —
    // lihat RANCANGAN-MIGRASI-FIRESTORE.md) SENGAJA TIDAK PUNYA blok match di
    // sini sama sekali. Koleksi ini HANYA pernah dibaca/ditulis lewat Apps
    // Script pakai kredensial Service Account (IAM), yang MELEWATI Firestore
    // Rules sepenuhnya (diatur oleh izin IAM, bukan Rules) — jadi Rules di
    // file ini tidak relevan untuknya. TIDAK menambahkan blok match untuk
    // "siswa" adalah PILIHAN YANG BENAR di sini (bukan lupa) — default
    // Firestore Rules adalah TOLAK SEMUA untuk path tanpa match block, yang
    // artinya TIDAK ADA client (browser siapa pun, termasuk yang sudah login)
    // yang bisa baca koleksi ini langsung. Ini justru pelindung utama supaya
    // NISN 25 siswa tidak pernah bisa dibaca borongan dari luar. JANGAN
    // menambahkan blok match /siswa/{nisn} di sini kecuali benar-benar paham
    // konsekuensinya — itu akan MEMBUKA celah baca borongan NISN semua siswa.

    // Pengumuman, modul, soal: semua login bisa baca; hanya guru yang bisa tulis.
    // PENTING: ditulis per-koleksi secara EKSPLISIT (bukan wildcard /{koleksi}/{id})
    // karena Firestore meng-OR-kan semua match block yang cocok dengan sebuah path —
    // wildcard generik di sini akan "menabrak" & melumpuhkan pembatasan yang sudah
    // dibuat di /users/{uid} di atas (siapa saja yang login jadi bisa baca dokumen
    // users/{uid} SIAPA PUN lewat blok wildcard ini, bukan cuma dokumennya sendiri).
    // Kalau menambah koleksi baru (mis. `jadwal`), tambahkan blok match baru di sini,
    // JANGAN pakai wildcard generik lagi.
    match /pengumuman/{id} {
      allow read: if request.auth != null;
      allow write: if request.auth != null &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'guru';
    }

    match /modul/{id} {
      allow read: if request.auth != null;
      allow write: if request.auth != null &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'guru';
    }

    match /materi/{id} {
      allow read: if request.auth != null;
      allow write: if request.auth != null &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'guru';
    }

    match /bank_soal/{id} {
      allow read: if request.auth != null;
      allow write: if request.auth != null &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'guru';
    }

    // Hasil Uji Kemampuan: siswa HANYA bisa membuat dokumen miliknya sendiri
    // (uid harus sama dengan uid pembuat) dan TIDAK PERNAH bisa mengubah/menghapusnya
    // — update & delete cuma diberikan ke role "guru". Orang tua bisa membaca hasil
    // anaknya (dicocokkan lewat field `anak` di users/{uid}), tapi juga tidak
    // diberi izin write sama sekali.
    match /hasil_latihan/{id} {
      allow create: if request.auth != null &&
        request.resource.data.uid == request.auth.uid;
      allow read: if request.auth != null && (
        resource.data.uid == request.auth.uid ||
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'guru' ||
        (get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'orangtua' &&
         resource.data.namaSiswa in get(/databases/$(database)/documents/users/$(request.auth.uid)).data.anak)
      );
      allow update, delete: if request.auth != null &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'guru';
    }
  }
}
```

**Index komposit yang wajib dibuat di Firebase Console → Firestore → Indexes** (query di kode akan gagal tanpa ini — Firebase biasanya menyediakan link "Create Index" langsung di pesan error konsol browser saat pertama kali dicoba):
- Koleksi `bank_soal`: `tp` (Ascending) + `randKey` (Ascending) — dipakai untuk mengambil soal acak per TP di `pages/uji-kemampuan.html`.

---

## 🤝 Kontribusi

Proyek ini dikelola oleh wali kelas. Untuk pertanyaan atau saran perbaikan, hubungi melalui:
- Email guru: *(isi email guru)*
- Grup kelas: *(isi link WhatsApp grup)*

---

*Dibuat dengan semangat belajar bersama 🌱*
