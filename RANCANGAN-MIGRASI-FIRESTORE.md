# Rancangan Migrasi "Data Siswa" ke Firestore

> Status: **RENCANA — menunggu Arif menyiapkan Service Account di Google Cloud
> Console (§1) sebelum kode bisa mulai ditulis.**
> Dokumen ini pelacak progres migrasi Data Siswa saja. `CHANGELOG.md`
> (v0.11.0) tetap jadi riwayat utama seluruh upgrade login; dokumen ini
> dirujuk dari situ (Fase 1 login).
>
> **Keputusan lingkup (dikonfirmasi Arif):** HANYA koleksi "Data Siswa" (profil +
> NISN) yang pindah ke Firestore sekarang, sebagai bagian pekerjaan login. Data
> MPLS, Asesmen Kognitif, Jurnal Aktivitas, dan metadata Galeri Visual (Data
> Infografis) TETAP di Google Sheets — jadi proyek migrasi terpisah nanti,
> setelah login selesai & stabil. File gambar Galeri tetap di Google Drive baik
> sekarang maupun nanti (yang pindah nanti cuma metadatanya, bukan filenya).

## 1. Setup Google Cloud Console (WAJIB dilakukan Arif sendiri — di luar akses saya)

1. Buka [Google Cloud Console](https://console.cloud.google.com) → pilih
   project yang sama dengan project Firebase yang sudah dipakai situs ini.
2. **IAM & Admin → Service Accounts → Create Service Account**.
   - Nama: `apps-script-backend` (bebas, asal jelas).
   - Role: **Cloud Datastore User** (`roles/datastore.user`) — ini cukup untuk
     baca & tulis Firestore, TIDAK memberi akses lebih luas dari itu (mis. tidak
     bisa hapus project, tidak bisa akses layanan lain).
3. Buka service account yang baru dibuat → tab **Keys** → **Add Key** → **Create
   new key** → pilih **JSON** → file akan otomatis terdownload.
4. **JANGAN unggah/commit file JSON ini ke GitHub** (repo `kelas-v-main` publik).
   Simpan hanya di komputer Arif, akan dipakai 1x untuk isi Script Properties.
5. Buka Apps Script Editor (dari Google Sheets: Extensions → Apps Script) →
   klik ikon ⚙️ **Project Settings** → scroll ke **Script Properties** → tambah:
   - `SERVICE_ACCOUNT_EMAIL` = nilai `client_email` dari file JSON
   - `SERVICE_ACCOUNT_KEY` = nilai `private_key` dari file JSON (termasuk
     `-----BEGIN PRIVATE KEY-----` s.d. `-----END PRIVATE KEY-----\n`)
6. Aktifkan **Firestore API** untuk project itu kalau belum (biasanya sudah
   aktif otomatis karena Firebase Auth sudah dipakai) — Console akan kasih
   tombol "Enable" kalau belum, di halaman Firestore.

Setelah 6 langkah ini selesai, kabari saya (atau upload zip repo terbaru) —
saya lanjut ke §3 (kode `Code.gs`).

## 2. Skema Data Firestore

Koleksi baru: **`siswa/{nisn}`** — NISN dipakai LANGSUNG sebagai ID dokumen
(bukan auto-ID), supaya pencarian saat login cukup 1 kali `GET` by path (murah,
cepat, tidak perlu query/index) — beda dengan pendekatan "cari nama dulu" yang
dipakai di Sheets sekarang.

```
siswa/{nisn}
  nama: string          // "Nama Lengkap", dipakai juga utk cocokkan input nama saat login
  namaPanggilan: string
  tempatLahir: string
  tanggalLahir: string  // "yyyy-MM-dd"
  urlFoto: string
  createdAt: timestamp
  updatedAt: timestamp
```

**Kenapa NISN sebagai document ID aman:** ID dokumen Firestore tidak pernah
"terbaca" oleh siapa pun kecuali mereka sudah tahu NISN itu sendiri (untuk
menyusun path `siswa/{nisn}`) ATAU mereka boleh me-list seluruh koleksi — dan
listing koleksi ini nanti HANYA boleh lewat Apps Script pakai service account
(§3), bukan langsung dari browser client, jadi tidak akan pernah bocor lewat
Firestore Rules client-side.

**Kalau NISN 1 siswa perlu dikoreksi** (salah ketik pas isi data): karena ID
dokumen tidak bisa diubah di Firestore, cara paling bersih adalah tulis dokumen
baru di `siswa/{nisn_baru}` lalu hapus `siswa/{nisn_lama}` — Apps Script akan
saya buatkan 1 fungsi kecil `pindahkanNisnSiswa_()` khusus utk skenario ini
(bukan operasi rutin, cuma dipakai kalau ada typo).

## 3. Perubahan Cara Apps Script Otentikasi ke Firestore

Sekarang `Code.gs` baca/tulis Firestore koleksi `users/{uid}` pakai **idToken
milik pengguna yang login** (lihat `wajibGuru_()`, `wajibAksesLaporan_()`) —
ini TETAP DIPAKAI APA ADANYA, tidak diubah, karena memang cocok untuk kasus
"baca/tulis dokumen milik diri sendiri".

Untuk koleksi **`siswa/{nisn}`**, ditambahkan JALUR OTENTIKASI BARU:
Apps Script menandatangani JWT pakai `SERVICE_ACCOUNT_KEY` (fungsi
`getServiceAccountToken_()`, pola baku Google — tandatangani header+payload
JWT dengan `Utilities.computeRsaSha256Signature()`, tukar ke access token lewat
`https://oauth2.googleapis.com/token`), lalu pakai access token itu sebagai
Bearer saat panggil Firestore REST. Token ini **BUKAN identitas pengguna** —
dia identitas "mesin" (Apps Script sendiri) dengan izin Cloud Datastore User,
jadi **melewati Firestore Security Rules sepenuhnya** (diatur oleh IAM, bukan
Rules) — ini yang bikin cek NISN saat login (sebelum ada Firebase Auth sama
sekali) tetap bisa jalan aman, tanpa NISN pernah terekspos ke client.

**Konsekuensi keamanan yang harus diingat:** karena jalur ini melewati Firestore
Rules, SEMUA kontrol akses untuk koleksi `siswa` jadi tanggung jawab kode
`Code.gs` sendiri (gerbang `wajibGuru_()` dsb.), BUKAN Firestore Rules. Endpoint
yang menulis/menghapus data siswa (`type: "siswa"`, `"siswa_nisn_bulk"`) WAJIB
tetap digerbang `wajibGuru_()` seperti sekarang — kalau gerbang ini lupa
dipasang di endpoint baru mana pun yang menyentuh koleksi `siswa`, siapa pun
yang tahu URL Apps Script akan bisa baca/tulis SEMUA data siswa tanpa login
sama sekali. Ini saya catat sebagai item wajib di `ANTIREGRESI.md` (§30, akan
ditambahkan bareng implementasi).

## 4. Rencana Migrasi Data (25 siswa yang sudah ada)

1. Fungsi migrasi 1x-jalan (`migrasiSiswaKeFirestore_()`) dijalankan manual dari
   Apps Script Editor: baca semua baris sheet "Data Siswa" yang ADA SEKARANG →
   tulis ke `siswa/{nisn}` di Firestore.
2. Sheet "Data Siswa" yang lama **TIDAK dihapus dulu** setelah migrasi — dibiarkan
   sebagai cadangan sampai Arif verifikasi semua 25 data cocok di Firestore
   (bisa dicek langsung di Firebase Console → Firestore Database). Baru dihapus
   manual belakangan kalau sudah yakin.
3. Endpoint `?siswa=1` (baca daftar), `type:"siswa"` (simpan/perbarui), dan
   `type:"siswa_nisn_bulk"` di `Code.gs` ditulis ulang isinya supaya baca/tulis
   ke Firestore — TAPI bentuk request/response ke client **tidak berubah**,
   jadi `pages/kelas/index.html` & `kelas.js` yang baru saja saya buat TIDAK
   PERLU diubah lagi.

## 5. Checklist Progres

- [ ] Arif selesaikan §1 (Service Account + Script Properties) — **SUDAH
  DIISI sampai Script Properties per pesan terakhir Arif; Firestore API
  dipastikan sudah aktif (project sudah pakai Firestore untuk koleksi
  `users`), jadi tidak perlu aktivasi manual lagi.**
- [x] Tulis `getServiceAccountToken_()` + helper Firestore REST baru di `Code.gs`
- [x] Tulis ulang `doPostSiswa_`, `doPostSiswaNisnBulk_`, `?siswa=1`,
  `?laporanSiswa=1` (bagian profil) supaya baca/tulis `siswa/{nisn}` di
  Firestore — bentuk request/response ke client TIDAK berubah, jadi
  `pages/kelas/index.html`/`kelas.js` cuma disentuh untuk menjadikan NISN
  field wajib (bukan opsional lagi, karena sekarang jadi ID dokumen)
- [x] Fungsi migrasi 1x-jalan `migrasiSiswaKeFirestore_()` — melewati baris
  yang NISN-nya belum valid (bisa dijalankan ulang kapan saja, aman/idempoten
  karena kunci dokumennya NISN)
- [x] Validasi nama terhadap roster resmi (`SISWA_NAMA_VALID_`, salinan
  `MPLS_STUDENTS`) ditambahkan ke `doPostSiswaNisnBulk_` — mencegah salah
  ketik nyangkut jadi dokumen baru
- [ ] **Arif jalankan migrasi**: buka Apps Script Editor (project yang sama),
  pilih fungsi `migrasiSiswaKeFirestore_` dari dropdown → Run → cek Logger
  (View > Logs) untuk lihat berapa berhasil/dilewati → verifikasi manual di
  Firebase Console (Firestore Database → koleksi "siswa")
  **✅ SELESAI — 25 siswa berhasil masuk ke Firestore.**
- [x] Update `ANTIREGRESI.md` §29 (gerbang wajib utk koleksi `siswa`, uji
  baca/tulis Firestore, uji koreksi NISN salah ketik, uji migrasi idempoten)
- [ ] Tandai Fase 1 migrasi ini final di `CHANGELOG.md`, lanjut Fase 2
  dengan asumsi backend siswa sudah Firestore — **belum dikerjakan, lakukan
  di sesi berikutnya sebelum mulai Fase 2**
- [ ] (Nanti, proyek terpisah) Migrasi MPLS/Kognitif/Jurnal/Galeri

## 6. Langkah yang Perlu Arif Lakukan Sekarang (urutan)

1. **Deploy ulang Apps Script** sebagai versi baru dari deployment yang sama
   (buka project Apps Script yang sama → tempel isi `Code.gs` terbaru dari
   paket yang dikirim → Deploy → Manage deployments → ikon pensil →
   pilih "New version" → Deploy). Saat deploy, mungkin diminta otorisasi
   ulang izin (Drive, external requests ke `oauth2.googleapis.com` &
   `firestore.googleapis.com`) — klik Izinkan.
2. Di Apps Script Editor yang sama, pilih fungsi **`migrasiSiswaKeFirestore_`**
   dari dropdown fungsi di toolbar → klik **Run** (▶️).
3. Buka **View → Logs** (atau `Ctrl+Enter`) → baca ringkasan: berapa siswa
   berhasil dipindah, dan daftar nama yang dilewati (kalau ada, karena NISN-nya
   belum terisi di sheet lama — bisa dilengkapi lalu jalankan
   `migrasiSiswaKeFirestore_` lagi, aman diulang).
4. Buka **Firebase Console → Firestore Database** → cek koleksi `siswa` →
   pastikan jumlah dokumen & isinya (nama, NISN, dst.) sesuai harapan.
5. Buka `pages/kelas/index.html` di browser (siapkan HTML/JS terbaru dari
   paket ini) → cek "Daftar Siswa Tersimpan" tampil benar, coba edit 1 siswa,
   cek tidak ada data yang hilang.
6. Kabari saya hasilnya — kalau semua lancar, saya lanjut ke **Fase 2**
   (endpoint `siswaLogin`, sekarang tinggal baca `siswa/{nisn}` via
   `getSiswaByNisnFirestore_()` yang sudah ada, jadi jauh lebih ringkas).
