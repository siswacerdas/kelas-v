# Panduan Update Manual — Migrasi Login Siswa ke Firebase Auth

Panduan ini untuk menerapkan perubahan secara **manual** (tanpa git), karena
paket yang diberikan hanya berisi file yang berubah/baru, bukan seluruh repo.

Isi paket ini (struktur foldernya SAMA dengan struktur repo Anda):
```
.gitignore                            [BARU]
ANTIREGRESI.md                        [DIUBAH]
CHANGELOG.md                          [DIUBAH]
RANCANGAN-MIGRASI-FIRESTORE.md        [DIUBAH]
README.md                             [DIUBAH]
index.html                            [DIUBAH]
assets/js/siswa-akun.js               [BARU]
scripts/README.md                     [BARU]
scripts/bulk-buat-akun-siswa.js       [BARU]
scripts/package.json                  [BARU]
```

Tidak ada file lain di repo Anda yang perlu disentuh — semua halaman lain
(`role-guard.js`, `materi-progress-tracker.js`, `modul-progress-tracker.js`,
`firestore.rules`, `Code.gs`, dll.) sudah kompatibel tanpa perubahan (lihat
penjelasan lengkap kenapa di `CHANGELOG.md`).

---

## Bagian A — Terapkan perubahan file ke repo

1. **Salin ke-4 file yang DIUBAH** (`index.html`, `README.md`, `CHANGELOG.md`,
   `ANTIREGRESI.md`, `RANCANGAN-MIGRASI-FIRESTORE.md`) ke lokasi yang sama
   persis di repo Anda, **timpa (replace)** file lamanya. File-file ini sudah
   berisi keseluruhan isi baru (bukan potongan diff), jadi tinggal timpa.
2. **Tambahkan file BARU** ke lokasi berikut (buat foldernya kalau belum ada):
   - `.gitignore` → taruh di **root repo** (folder paling luar, sejajar
     dengan `index.html`)
   - `assets/js/siswa-akun.js` → taruh di **dalam folder `assets/js/`** yang
     sudah ada (sejajar dengan `role-guard.js`, `auth-guard.js`)
   - `scripts/README.md`, `scripts/bulk-buat-akun-siswa.js`,
     `scripts/package.json` → buat **folder baru bernama `scripts/`** di
     root repo, taruh ketiga file ini di dalamnya
3. **Upload ulang ke hosting Anda** (GitHub Pages/dsb.) — cukup file yang
   ditimpa/ditambah di atas, TIDAK perlu upload ulang seluruh repo. Folder
   `scripts/` **tidak perlu ikut di-deploy ke GitHub Pages** (tidak dipakai
   browser sama sekali, murni dijalankan di komputer Anda) — tapi tidak masalah
   juga kalau ikut ter-upload, tidak akan terpanggil/tereksekusi oleh website.
4. Setelah ter-upload, **login siswa BELUM langsung berfungsi** — masih perlu
   Bagian B di bawah (akun Firebase-nya belum dibuat).

---

## Bagian B — Membuat akun 25 siswa (bulk, sekali jalan)

Ini bagian yang menjawab "cara input yang lebih mudah, tidak satu-per-satu".
Dikerjakan lewat **terminal/command prompt di komputer Anda**, bukan lewat
website.

### B.1 — Persiapan (sekali saja)

1. Pastikan **Node.js** sudah terpasang di komputer Anda (cek dengan
   `node -v` di terminal — kalau belum ada, download dari
   [nodejs.org](https://nodejs.org), pilih versi LTS).
2. Siapkan file **kredensial Service Account** dari Firebase — ini file JSON
   rahasia yang memberi akses penuh ke Authentication & Firestore proyek
   Anda. Caranya:
   - Buka **Firebase Console** → project Anda → ikon ⚙️ **Project settings**
     → tab **Service accounts** → klik **Generate new private key** → **Generate
     key** → file JSON otomatis terdownload.
   - Pindahkan file itu ke dalam folder `scripts/` yang baru Anda buat di
     repo, beri nama `serviceAccountKey.json`.
   - ⚠️ **File ini SANGAT rahasia** — jangan pernah diunggah ke GitHub/dibagikan
     ke siapa pun. `.gitignore` yang sudah ditambahkan di Bagian A akan
     mencegahnya ikut ter-commit secara otomatis kalau Anda pakai git, tapi
     tetap hati-hati kalau upload manual — pastikan file ini TIDAK ikut
     ter-upload ke GitHub Pages/hosting publik.

### B.2 — Install & jalankan

Buka terminal, masuk ke folder `scripts/` di repo Anda:

```bash
cd scripts
npm install
```

Tunggu sampai selesai (mengunduh 1 library bernama `firebase-admin`).

**Coba dulu (WAJIB, tidak mengubah apa pun)**:

```bash
node bulk-buat-akun-siswa.js --csv=../../login_siswa.csv --key=./serviceAccountKey.json --dry-run
```

> Sesuaikan path `--csv=` kalau `login_siswa.csv` Anda taruh di lokasi lain.

Baca hasilnya — script ini akan **otomatis mendeteksi & mengoreksi** 4 nama
yang sempat bermasalah di CSV Anda (ada spasi nyasar di tengah kata:
*"Nay la Latifa"*, *"Re y nand Pratama"*, *"Shakila Q i y ana Shadi q ah"*,
*"Shanum Me y ra Rosadi"*), ditandai dengan `ℹ️`. Ini **normal dan sudah
benar** — sudah diuji dan hasilnya sudah dikonfirmasi cocok dengan daftar
siswa resmi.

**Kalau hasil dry-run sudah sesuai**, jalankan sungguhan (hilangkan
`--dry-run`):

```bash
node bulk-buat-akun-siswa.js --csv=../../login_siswa.csv --key=./serviceAccountKey.json
```

Ini akan membuat **25 akun Firebase Authentication** + **25 dokumen
Firestore** (`users/{uid}`) sekaligus, dalam hitungan detik.

### B.3 — Verifikasi

1. **Firebase Console → Authentication → Users** — pastikan 25 email siswa
   muncul.
2. **Firebase Console → Firestore Database → koleksi `users`** — buka
   beberapa dokumen contoh, pastikan ada field `nama`, `role: "siswa"`,
   `email`.
3. **Coba login sungguhan** di website sebagai 2–3 siswa contoh (pilih nama
   dari dropdown + masukkan kata sandi dari kolom "Password Login" di CSV) —
   pastikan berhasil masuk dan nama yang tampil di pojok kanan atas benar.
4. Jalankan checklist lengkap di `ANTIREGRESI.md` **§52** sebelum diumumkan
   ke seluruh kelas.

---

## Menambah siswa baru di tengah tahun (nanti-nanti)

Tidak perlu mengulang seluruh proses di atas. Ringkasnya (detail lengkap di
`scripts/README.md`):
1. Tambahkan nama siswa baru ke `MPLS_STUDENTS` di
   `pages/mpls/assets/mpls-data.js` **dan** ke `SISWA_EMAIL_MAP` di
   `assets/js/siswa-akun.js` — ejaan nama harus **sama persis** di kedua
   tempat.
2. Buat 1 baris CSV baru berisi cuma siswa itu, lalu jalankan:
   ```bash
   node bulk-buat-akun-siswa.js --csv=siswa-baru.csv --key=./serviceAccountKey.json --allow-unlisted
   ```

---

## Kalau ada yang tidak sesuai harapan

Semua perubahan sudah diuji secara statis (pengecekan sintaks JavaScript,
uji coba `--dry-run` dengan CSV Anda yang sesungguhnya, dan pembacaan
menyeluruh terhadap kode yang sudah ada untuk memastikan tidak ada bagian
lain yang bergantung pada mekanisme login lama) — **tapi belum pernah dicoba
login sungguhan ke project Firebase Anda**, karena lingkungan pengerjaan ini
tidak punya akses ke Firebase Anda. Mohon ikuti checklist verifikasi di
`ANTIREGRESI.md` §52 dengan 2–3 akun siswa contoh dulu sebelum diumumkan ke
satu kelas penuh.
