# Script Admin — Buat Akun Siswa Massal

Script di folder ini **dijalankan di komputer sendiri** (bukan bagian dari
website yang di-deploy ke GitHub Pages) untuk membuat/memperbarui akun
Firebase Authentication + dokumen Firestore `users/{uid}` untuk seluruh siswa
sekaligus dari 1 file CSV — menggantikan cara manual per-siswa lewat Firebase
Console yang dulu dipakai (lihat `README.md` di root repo, bagian "Langkah 7
— Tambah Akun Siswa", sekarang ditandai sebagai cara lama/fallback).

Kenapa harus dijalankan lokal, bukan ditombol dari website: script ini
memakai kredensial **Service Account** yang punya akses PENUH ke seluruh
Authentication & Firestore proyek Firebase (bisa buat/hapus akun siapa saja,
baca/tulis data apa saja) — kredensial sekuat ini tidak boleh pernah ada di
kode yang jalan di browser siapa pun (siapa saja bisa buka DevTools dan
mencurinya), makanya harus tetap di komputer Anda sendiri.

---

## Langkah 1 — Siapkan file kredensial Service Account (sekali saja)

*(Kalau proyek ini sudah pernah bikin Service Account untuk keperluan lain,
mis. migrasi Firestore di `RANCANGAN-MIGRASI-FIRESTORE.md`, boleh pakai file
JSON yang sama — lewati langkah ini, langsung ke Langkah 2.)*

1. Buka [Google Cloud Console](https://console.cloud.google.com) → pilih
   project yang sama dengan project Firebase website ini (`kelas-v-2026`).
2. **IAM & Admin → Service Accounts → Create Service Account**.
   - Nama: bebas, misal `admin-akun-siswa`.
   - Beri role **Firebase Authentication Admin** (`roles/firebaseauth.admin`)
     DAN **Cloud Datastore User** (`roles/datastore.user`) — yang pertama
     untuk membuat akun login, yang kedua untuk menulis dokumen Firestore
     `users/{uid}`. Jangan beri role lebih luas dari itu.
3. Buka service account yang baru dibuat → tab **Keys** → **Add Key** →
   **Create new key** → pilih **JSON** → file otomatis terdownload.
4. Pindahkan file itu ke folder `scripts/` di repo ini, beri nama misalnya
   `serviceAccountKey.json`.
5. **JANGAN unggah/commit file ini ke GitHub** — `.gitignore` di root repo
   sudah diatur menolak file bernama `*serviceAccountKey*.json` di folder
   ini secara otomatis, tapi tetap periksa manual (`git status`) sebelum
   push kalau ragu.

## Langkah 2 — Install dependency (sekali saja per komputer)

```bash
cd scripts
npm install
```

## Langkah 3 — Coba dulu dengan `--dry-run`

**WAJIB dilakukan dulu**, terutama pemakaian pertama — ini cuma menampilkan
apa yang AKAN dilakukan, tidak mengubah apa pun di Firebase:

```bash
node bulk-buat-akun-siswa.js --csv=../../login_siswa.csv --key=./serviceAccountKey.json --dry-run
```

Baca ringkasannya baik-baik:
- Nama yang dikoreksi ejaannya (ditandai `ℹ️`) — pastikan hasil koreksinya
  benar.
- Baris yang dilewati (ditandai `⚠️`) — kalau ada siswa yang seharusnya ikut
  tapi malah dilewati, biasanya karena namanya belum ada di roster resmi
  (`ROSTER_RESMI_` di dalam script, harus sama persis dengan `MPLS_STUDENTS`
  di `pages/mpls/assets/mpls-data.js`) — perbaiki dulu sebelum lanjut.

## Langkah 4 — Jalankan sungguhan

Kalau hasil dry-run sudah sesuai harapan:

```bash
node bulk-buat-akun-siswa.js --csv=../../login_siswa.csv --key=./serviceAccountKey.json
```

Script ini **aman dijalankan berkali-kali** (idempoten) — akun yang sudah ada
tidak dibuat ulang/duplikat, dan kata sandinya TIDAK ikut diubah kecuali Anda
menambahkan `--update-password` secara sengaja.

## Langkah 5 — Verifikasi manual

1. Firebase Console → **Authentication → Users** → pastikan 25 akun siswa
   muncul dengan email yang benar.
2. Firebase Console → **Firestore Database → koleksi `users`** → buka
   beberapa dokumen contoh, pastikan field `nama`, `role: "siswa"`, `email`
   terisi benar.
3. Coba login sungguhan di website sebagai 1-2 siswa contoh (pilih nama +
   masukkan kata sandi dari CSV) — pastikan berhasil masuk dan namanya
   tampil benar di pojok kanan atas.
4. Lihat `ANTIREGRESI.md` §52 untuk checklist regresi lengkap sebelum
   mengumumkan ke seluruh kelas.

---

## Opsi command line

| Opsi | Kegunaan |
|---|---|
| `--dry-run` | Tampilkan rencana saja, tidak ada perubahan sungguhan. |
| `--update-password` | Timpa kata sandi akun yang SUDAH ada dengan isi CSV (default: tidak disentuh). |
| `--allow-unlisted` | Izinkan nama yang belum ada di `ROSTER_RESMI_` tetap diproses (untuk siswa baru pindahan — pastikan juga ditambahkan ke `mpls-data.js` & `assets/js/siswa-akun.js` dengan ejaan sama persis). |

## Menambah 1 siswa baru di tengah tahun

Tidak perlu menjalankan ulang untuk semua 25 siswa. Buat CSV baru berisi
cuma 1 baris siswa itu (header sama), lalu:

```bash
node bulk-buat-akun-siswa.js --csv=siswa-baru.csv --key=./serviceAccountKey.json --allow-unlisted
```

Jangan lupa: tambahkan juga namanya ke `MPLS_STUDENTS`
(`pages/mpls/assets/mpls-data.js`) dan ke `SISWA_EMAIL_MAP`
(`assets/js/siswa-akun.js`) dengan ejaan yang **sama persis**, supaya
dropdown login & pencocokan progres belajarnya ikut benar.

## Format CSV yang diharapkan

Header (nama kolom harus persis, urutan bebas):

```
No,Nama Panggilan,Nama Lengkap,Alamat Email,Password Login
1,arman,Abdurrahman Ar Ribery,arman@siswacerdas.id,3153742941
```

- **Nama Lengkap** — dicocokkan ke roster resmi (lihat di atas). Kalau CSV
  sumbernya berasal dari spreadsheet dengan format aneh (mis. ada superscript
  atau simbol tersembunyi), buka dulu di Google Sheets → **Data → Bersihkan
  data → Hapus spasi ekstra** sebelum export ulang ke CSV, untuk menghindari
  masalah spasi nyasar seperti yang pernah ditemukan di batch data Sept 2026
  (lihat `assets/js/siswa-akun.js`).
- **Password Login** — minimal 6 karakter (syarat Firebase Authentication).
