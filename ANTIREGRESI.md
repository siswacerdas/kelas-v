# Panduan Anti-Regresi

Dokumen ini berisi checklist ujicoba yang harus dijalankan **setiap kali ada perubahan** pada proyek, untuk memastikan fitur yang sudah berjalan tidak rusak (regresi).

> **Regresi** = fitur yang sebelumnya bekerja tiba-tiba rusak setelah ada perubahan baru.

---

## ✅ Checklist Sebelum Push ke GitHub

Sebelum meng-upload perubahan ke GitHub, pastikan semua poin berikut sudah dicek:

### 1. Tampilan & Layout
- [ ] Halaman terbuka tanpa error di browser (tidak ada layar putih kosong)
- [ ] Tampilan rapi di layar laptop (≥ 1024px)
- [ ] Tampilan rapi di layar HP (≤ 480px) — cek dengan F12 → mode perangkat seluler
- [ ] Tidak ada teks yang terpotong atau keluar dari kotaknya
- [ ] Gambar/ikon tampil dengan benar

### 2. Login & Autentikasi
- [ ] Login berhasil dengan email & kata sandi yang benar
- [ ] Muncul pesan error yang jelas jika email/kata sandi salah
- [ ] Login berhasil menampilkan nama pengguna di topbar
- [ ] Tombol **Keluar** berhasil logout dan kembali ke layar login
- [ ] Halaman utama tidak bisa diakses tanpa login (otomatis redirect ke login)
- [ ] Menekan Enter di kolom kata sandi berfungsi sama dengan klik tombol Masuk

### 3. Peran Pengguna (Role)
- [ ] Login sebagai **guru**: panel guru muncul
- [ ] Login sebagai **siswa**: panel guru **tidak** muncul
- [ ] Login sebagai **siswa**: tidak bisa mengakses `pages/admin.html` secara langsung

### 4. Pengumuman (Firestore)
- [ ] Pengumuman terbaru tampil di beranda setelah login
- [ ] Jika belum ada pengumuman, muncul teks "Belum ada pengumuman" (bukan error)
- [ ] Pengumuman baru yang ditambahkan guru langsung muncul tanpa perlu refresh manual
- [ ] Urutan pengumuman dari yang terbaru ke terlama

### 5. Navigasi
- [ ] Semua kartu menu di beranda bisa diklik
- [ ] Link halaman yang belum dibuat tidak menyebabkan error fatal (cukup tampil halaman kosong atau "segera hadir")

### 6. Modul MPLS (`pages/mpls/`)
- [ ] Kartu "MPLS" di beranda mengarah ke `pages/mpls/index.html`
- [ ] Kartu "Input Penilaian" mengarah ke `input.html`; kartu "Rekap Hasil" tidak bisa diklik (belum dibuat)
- [ ] Gerbang kode akses muncul di `input.html`; kode salah menampilkan pesan error, kode benar membuka form
- [ ] Setelah kode benar sekali, membuka ulang halaman di sesi browser yang sama **tidak** meminta kode lagi
- [ ] Tampilan rapi & tombol mudah disentuh di layar HP (≤ 480px) — ini prioritas utama modul ini
- [ ] Memilih nama siswa menampilkan 4 kategori (Emosi & Sosial, Kemandirian & Karakter, Minat & Gaya Belajar, Kondisi Fisik)
- [ ] Menekan kartu kategori membuka/menutup accordion-nya
- [ ] Menekan salah satu tombol skala (BB/MB/BSH/BSB) menandai pilihan dan memperbarui progress bar serta hitungan per kategori
- [ ] Tombol **Simpan** menyimpan data ke Google Spreadsheet (cek langsung di sheet "Data MPLS")
- [ ] Memilih ulang siswa yang sudah pernah diisi memuat kembali data sebelumnya (bukan kosong)
- [ ] Mengisi siswa yang sama dua kali **meng-update baris yang sama**, bukan membuat baris baru (cek jumlah baris di spreadsheet)
- [ ] Jika `APPS_SCRIPT_URL` di `config.js` belum diisi, muncul peringatan yang jelas (bukan error diam-diam)
- [ ] Kolom "Diisi Oleh" tersimpan dari sesi sebelumnya (localStorage) saat membuka form lagi

### 7. Dropdown Guru Pengamat (`input.html`)
- [ ] Field "Diisi Oleh" berupa dropdown, bukan lagi teks bebas
- [ ] Hanya ada 2 pilihan: "Arif Azwar Anas" dan "Azizah Zahro Ibrahim"
- [ ] Pilihan guru terakhir tetap diingat (localStorage) saat form dibuka lagi

### 8. Rekap & Kesimpulan Otomatis (`pages/mpls/rekap.html`)
- [ ] Halaman ini menolak akses (redirect ke beranda) jika belum login / bukan role `guru`
- [ ] Daftar semua siswa yang sudah punya data MPLS tampil dengan badge level per kategori
- [ ] Dropdown pilih nama siswa berfungsi: "— Tampilkan semua siswa —" menampilkan semua,
      pilih 1 nama menampilkan siswa itu saja (kalau belum ada datanya, tampil pesan jelas, bukan kosong)
- [ ] Detail tiap siswa **tampil langsung tanpa perlu klik** (kartu default terbuka)
- [ ] Kesimpulan akhir menampilkan: narasi, aspek kuat, aspek perlu perhatian,
      **saran untuk guru**, dan **saran untuk orang tua** — bukan cuma narasi saja
- [ ] Kategori yang belum ada nilainya sama sekali ditandai "-", bukan kalimat panjang
- [ ] Siswa yang datanya belum lengkap (sebagian kategori kosong) tetap tampil, tidak error
- [ ] Tombol "Cetak / Simpan PDF" membuka `laporan.html` dengan nama siswa yang benar
- [ ] Kalau field `data` tidak ada di respons backend, muncul pesan yang mengarahkan
      untuk cek ulang deployment Apps Script (lihat catatan di bawah)

> ⚠️ **Jebakan umum saat re-deploy Apps Script**: di dialog "Manage deployments" →
> pensil (edit) → pastikan dropdown **"Version"** diganti ke **"New version"**
> sebelum klik **Deploy**. Kalau dropdown itu dibiarkan di versi lama (mis. tetap
> "Version 1") dan hanya kolom **Description** yang diubah, kode BARU tidak akan
> ikut ter-deploy walau terlihat seperti sudah "Deploy" — inilah penyebab paling
> umum field `data` tidak muncul di respons meski `Code.gs` sudah benar.

### 9. Laporan Cetak PDF (`pages/mpls/laporan.html`)
- [ ] Halaman ini juga menolak akses jika bukan guru
- [ ] Logo sekolah tampil di kop laporan
- [ ] **Kotak foto siswa tampil di identitas** — foto asli kalau ada di modul Kelas, placeholder "Foto Siswa" kalau belum ada
- [ ] Tulisan cukup besar untuk dibaca orang tua (bukan lagi ukuran sangat kecil)
- [ ] "Guru Kelas" selalu tertera **Arif Azwar Anas**, terpisah dari "Guru Pengamat (pengisi form)" yang sesuai siapa yang mengisi
- [ ] Identitas siswa, semua nilai kategori, dan kesimpulan akhir tidak ada yang terpotong
- [ ] Kesimpulan akhir juga menampilkan "Aspek kuat" & "Perlu perhatian" secara ringkas
- [ ] **Blok tanda tangan di kanan bawah** muncul lengkap: tempat & tanggal ("Depok, ..."),
      ruang tanda tangan kosong, nama "Arif Azwar Anas, S.Pd", dan "NBM. 1167333"
- [ ] Saat print/print-preview, hasil pas **1 halaman A4** (cek di Chrome: Ctrl/Cmd+P → lihat pratinjau)
- [ ] Tombol "Cetak / Simpan sebagai PDF" tidak ikut tercetak (harus hilang di hasil print)

### 10. Data Kelas — Profil & Foto Siswa (`pages/kelas/`)
- [ ] Halaman ini menolak akses jika bukan guru; kontainer "Kelas" di beranda hanya muncul untuk role `guru`
- [ ] Dropdown "Nama Lengkap" berisi daftar siswa Kelas 5A yang sama persis dengan
      dropdown "Diisi Oleh"/nama siswa di modul MPLS (sumber sama: `MPLS_STUDENTS`)
- [ ] Form bisa menyimpan nama lengkap, panggilan, tempat & tanggal lahir tanpa foto
- [ ] Memilih foto dari kamera HP menampilkan pratinjau + perkiraan ukuran file setelah dikompres
- [ ] Setelah simpan, foto muncul di folder Google Drive yang sudah ditentukan
- [ ] **Setelah simpan, foto TAMPIL sebagai thumbnail di daftar siswa** (bukan ikon placeholder,
      kecuali memang belum ada foto) — ini yang sebelumnya bug, wajib dicek ulang
- [ ] **Tanggal lahir yang disimpan TAMPIL dengan benar** di daftar siswa (format yyyy-mm-dd),
      sesuai dengan yang diisi di form — ini juga bagian dari bug yang sama, wajib dicek ulang
- [ ] Daftar siswa di bawah form menampilkan thumbnail foto (atau ikon placeholder bila belum ada foto)
- [ ] Klik salah satu siswa di daftar mengisi ulang form (mode edit), simpan lagi meng-update baris yang sama (bukan duplikat — cek jumlah baris di sheet "Data Siswa")
- [ ] Coba simpan siswa BARU (belum pernah ada) dengan foto — pastikan baris baru muncul di
      sheet "Data Siswa" dengan SEMUA kolom terisi benar (bukan cuma sebagian)
- [ ] Kalau foto sengaja gagal diunggah (mis. tes dengan izin Drive dicabut sementara),
      pastikan data teks (nama/panggilan/TTL) tetap tersimpan dan muncul pesan peringatan
      yang jelas — bukan gagal total tanpa keterangan

### 11. Asesmen Awal Kognitif — Input (`pages/mpls/input-kognitif.html`)
- [ ] Halaman ini **terpisah total** dari `input.html` non-kognitif — mengisi salah satu
      TIDAK BOLEH mengubah/menimpa data di sheet yang lain (cek kedua sheet di spreadsheet)
- [ ] Kode akses (gate) berfungsi sama seperti `input.html`
- [ ] 5 kategori tampil: Literasi, Penjumlahan, Pengurangan, Perkalian, Pembagian
- [ ] Memilih siswa yang sama dua kali (isi ulang) meng-update baris yang sama di sheet
      "Data MPLS Kognitif", bukan menduplikasi baris

### 12. Asesmen Awal Kognitif — Rekap & Laporan (`rekap-kognitif.html`, `laporan-kognitif.html`)
- [ ] Kedua halaman menolak akses jika bukan guru (Firebase-gated, sama seperti versi non-kognitif)
- [ ] Rekap menampilkan 5 kategori dengan badge level, "-" untuk kategori kosong
- [ ] Kesimpulan akhir "Kesiapan Akademik" tampil lengkap dengan saran guru & orang tua
- [ ] Tombol cetak dari rekap kognitif membuka `laporan-kognitif.html` dengan nama siswa yang benar
- [ ] Laporan cetak kognitif juga pas 1 halaman A4, ada foto, tulisan besar, dan blok tanda tangan
      (grid kategori 3 kolom karena ada 5 kategori — pastikan tidak ada yang terpotong)
- [ ] Tautan silang antar rekap non-kognitif ↔ kognitif berfungsi di kedua arah

### 13. Nama Guru Kelas di Laporan Cetak
- [ ] `laporan.html` DAN `laporan-kognitif.html` sama-sama menampilkan "Guru Kelas: Arif Azwar Anas"
      apa pun isi kolom "Diisi Oleh" (walau yang mengisi form Bu Azizah)
- [ ] Blok tanda tangan tetap menampilkan nama & NBM Arif Azwar Anas di kedua jenis laporan

---

## 🔁 Skenario Ujicoba Lengkap

Jalankan skenario ini setelah perubahan besar:

### Skenario A — Login Guru
1. Buka website
2. Masukkan email guru yang terdaftar di Firebase
3. Masukkan kata sandi yang benar
4. → **Harapan:** beranda tampil, panel guru muncul, nama guru tampil di topbar
5. Klik tombol Keluar
6. → **Harapan:** kembali ke layar login

### Skenario B — Login Siswa
1. Masukkan email siswa yang terdaftar
2. Masukkan kata sandi yang benar
3. → **Harapan:** beranda tampil, panel guru **tidak** muncul
4. Coba akses URL `pages/admin.html` langsung di browser
5. → **Harapan:** diarahkan ke login atau muncul pesan tidak punya akses

### Skenario C — Login Gagal
1. Masukkan email yang tidak terdaftar
2. → **Harapan:** muncul pesan "Akun tidak ditemukan" (bukan error kode merah)
3. Masukkan email benar tapi kata sandi salah
4. → **Harapan:** muncul pesan "Email atau kata sandi salah"

### Skenario D — Pengumuman
1. Login sebagai guru
2. Tambah pengumuman baru melalui panel guru (setelah fitur selesai)
3. Logout, login sebagai siswa
4. → **Harapan:** pengumuman baru muncul di beranda

### Skenario F — Rekap, Cetak PDF, dan Data Kelas (guru)
1. Login sebagai guru di beranda
2. Klik kontainer "Kelas" → "Kelola Data Siswa & Foto"
3. Isi 1 data siswa lengkap dengan foto dari kamera → Simpan
4. → **Harapan:** muncul di daftar siswa dengan thumbnail foto, dan baris baru di sheet "Data Siswa" + file foto baru di folder Drive
5. Kembali ke beranda → klik "Rekap Hasil MPLS" (via kontainer Kelas atau menu MPLS)
6. → **Harapan:** daftar siswa dengan badge level muncul; klik salah satu nama menampilkan kesimpulan + rekomendasi
7. Klik "Cetak / Simpan PDF" pada salah satu siswa
8. → **Harapan:** halaman laporan A4 terbuka dengan logo, identitas, nilai, dan kesimpulan lengkap tidak terpotong; `Ctrl/Cmd+P` menghasilkan 1 halaman rapi

### Skenario G — Asesmen Kognitif (input, rekap, cetak)
1. Login sebagai guru → buka menu MPLS → bagian "Asesmen Awal Kognitif"
2. Klik "Input Asesmen Kognitif" → isi kode akses → pilih siswa → isi minimal 1-2 kategori
3. → **Harapan:** tersimpan ke sheet "Data MPLS Kognitif" (BUKAN ke sheet "Data MPLS" yang lama)
4. Kembali ke menu MPLS → klik "Rekap Asesmen Kognitif"
5. → **Harapan:** siswa yang baru diisi muncul dengan badge level 5 kategori, kategori kosong "-"
6. Klik "Cetak / Simpan PDF"
7. → **Harapan:** laporan 1 halaman A4 muncul dengan foto (atau placeholder), tulisan besar,
   dan blok tanda tangan Arif Azwar Anas di kanan bawah lengkap dengan NBM

### Skenario H — Verifikasi Perbaikan Bug Foto & Tanggal Lahir
1. Buka spreadsheet → sheet "Data Siswa" → cek baris header (baris 1) — pastikan
   urutannya: Timestamp, Nama Lengkap, Nama Panggilan, Tempat Lahir, Tanggal Lahir, URL Foto
2. Login sebagai guru → "Kelola Data Siswa & Foto" → pilih 1 siswa dari dropdown
3. Isi Tempat Lahir, Tanggal Lahir, dan ambil foto dari kamera → Simpan
4. → **Harapan:** toast "Tersimpan: [nama]" muncul (bukan pesan peringatan foto)
5. Cek baris siswa itu di sheet "Data Siswa" — kolom Tanggal Lahir dan URL Foto harus terisi
6. Refresh halaman `pages/kelas/index.html`
7. → **Harapan:** siswa tsb tampil di daftar dengan **thumbnail foto asli** (bukan ikon 🧒)
   dan **tanggal lahir yang benar** di bawah namanya
8. Klik siswa tsb di daftar → form terisi ulang termasuk tanggal lahirnya

### Skenario E — Input MPLS (dari HP)
1. Buka `pages/mpls/input.html` dari HP
2. Masukkan kode akses yang benar
3. Pilih salah satu siswa, isi seluruh indikator di keempat kategori, isi juga "Diisi Oleh"
4. Tekan **Simpan** → **Harapan:** muncul notifikasi "Tersimpan", status di bawah berubah
5. Buka spreadsheet → **Harapan:** ada 1 baris baru dengan nama siswa tersebut dan semua nilai sesuai yang diisi
6. Kembali ke form, pilih siswa yang sama lagi → **Harapan:** semua isian tadi termuat ulang otomatis
7. Ubah salah satu nilai, simpan lagi → **Harapan:** baris di spreadsheet **ter-update**, jumlah baris tidak bertambah
8. Pilih siswa lain yang belum pernah diisi → **Harapan:** form kosong, status menampilkan "Siswa baru"

---

## 🐛 Cara Melaporkan Bug

Jika menemukan masalah, catat informasi berikut:

```
Tanggal      : YYYY-MM-DD
Browser      : Chrome / Firefox / Safari / Edge (versi berapa)
Perangkat    : HP / Laptop / Tablet
Halaman      : index.html / pages/modul.html / dll
Langkah      : 1. ... 2. ... 3. ...
Yang terjadi : (jelaskan)
Yang seharusnya terjadi : (jelaskan)
Screenshot   : (lampirkan jika bisa)
```

Laporkan ke guru pengelola atau buka **Issue** baru di GitHub repo ini.

---

## 📋 Log Ujicoba

Catat setiap sesi ujicoba di sini:

| Tanggal | Versi | Oleh | Hasil | Catatan |
|---|---|---|---|---|
| 2026-06-07 | 0.1.0 | *(nama)* | ⏳ Belum diuji | Setup awal |
| 2026-07-13 | 0.3.0 | *(nama)* | ⏳ Belum diuji | Rekap otomatis, cetak PDF, data kelas & foto |
| 2026-07-14 | 0.3.1 | *(nama)* | ✅ Diuji sebagian | Dropdown nama siswa konsisten (Kelas ↔ MPLS) |
| 2026-07-14 | 0.3.2 | *(nama)* | ⏳ Belum diuji | Perbaikan tampilan & bug kesimpulan akhir di rekap |
| 2026-07-14 | 0.4.0 | *(nama)* | ⏳ Belum diuji | Modul Asesmen Kognitif baru + laporan cetak dirombak (foto, tanda tangan) |
| 2026-07-14 | 0.4.1 | *(nama)* | ⏳ Belum diuji | Perbaikan bug foto & tanggal lahir tidak muncul (Data Kelas) |

**Keterangan:**
- ✅ Lulus semua checklist
- ⚠️ Lulus dengan catatan (ada hal minor yang perlu diperbaiki)
- ❌ Gagal (ada regresi ditemukan)
- ⏳ Belum diuji

---

## 📌 Catatan Penting

- **Jangan push langsung ke `main`** jika belum melewati checklist di atas
- Jika ragu, buat **branch baru** dulu (misal: `dev` atau `fitur-bank-soal`), lalu merge ke `main` setelah lolos ujicoba
- Simpan salinan `firebaseConfig` di tempat yang aman — **jangan bagikan ke publik**
- Jika ada perubahan struktur Firestore, update juga bagian **Struktur Database** di `README.md`
- **Sejak v0.4.1**: `apps-script/Code.gs` membaca/menulis ketiga sheet (Data MPLS,
  Data Siswa, Data MPLS Kognitif) berdasarkan **nama kolom di baris header sesungguhnya**,
  bukan lagi asumsi urutan tetap. Boleh menambah kolom baru di paling kanan sheet kapan
  saja tanpa mengubah kode — TAPI jangan mengedit/mengetik ulang teks header kolom yang
  sudah ada (typo atau beda kapitalisasi akan membuat kolom itu "hilang" dari aplikasi).
