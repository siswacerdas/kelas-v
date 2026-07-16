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

### 9. Laporan Cetak PDF (`pages/mpls/laporan.html`, `laporan-kognitif.html`, `laporan-jurnal.html`)
- [ ] Halaman ini juga menolak akses jika bukan guru
- [ ] Logo sekolah tampil di kop laporan
- [ ] **Kotak foto siswa tampil di identitas** — foto asli kalau ada di modul Kelas, placeholder "Foto Siswa" kalau belum ada
- [ ] **Foto siswa yang sudah diupload benar-benar TAMPIL sebagai gambar asli** (bukan
      cuma placeholder terus) — ini sempat jadi bug 2x (v0.5.2 belum tuntas, baru benar-benar
      teratasi di v0.5.3 lewat proxy `?foto=` di Apps Script), wajib dicek dengan siswa yang
      fotonya sudah pernah diupload lewat modul Kelas, DENGAN APPS SCRIPT SUNGGUHAN
      (bukan cuma network-mocking) — lihat Skenario J
- [ ] Foto mengisi penuh kotak framenya (tidak gepeng/terdistorsi) — coba dengan foto potret & lanskap
- [ ] Kalau URL foto benar-benar rusak/file terhapus, otomatis tampil placeholder "Foto Siswa"
      SETELAH mencoba semua format URL alternatif, BUKAN ikon gambar rusak
- [ ] Tulisan cukup besar untuk dibaca orang tua (bukan lagi ukuran sangat kecil)
- [ ] **Jarak antar blok terasa lega** (Kesimpulan Akhir vs kartu kategori, dsb) — bukan lagi berdesakan
- [ ] "Guru Kelas" selalu tertera **Arif Azwar Anas**, terpisah dari "Guru Pengamat (pengisi form)" yang sesuai siapa yang mengisi
- [ ] Identitas siswa, semua nilai kategori, dan kesimpulan akhir tidak ada yang terpotong
- [ ] Kesimpulan akhir juga menampilkan "Aspek kuat" & "Perlu perhatian" secara ringkas
- [ ] **Blok tanda tangan di kanan bawah**: tempat & tanggal ("Depok, ..."), ruang tanda tangan kosong,
      nama "Arif Azwar Anas, S.Pd", dan "NBM. 1167333" — dan **ukuran tulisannya SEPADAN**
      dengan teks penilaian di atasnya (tidak lagi terlihat lebih besar/mencolok)
- [ ] Saat print/print-preview, hasil pas **1 halaman A4** (cek di Chrome: Ctrl/Cmd+P → lihat pratinjau)
- [ ] **Tombol "← Kembali ke Rekap" dan "🖨️ Cetak / Simpan sebagai PDF" TIDAK ikut tercetak** —
      cek betul-betul di hasil PDF final (bukan cuma print preview), ini sempat jadi bug

### 10. Data Kelas — Profil & Foto Siswa (`pages/kelas/`)
- [ ] Halaman ini menolak akses jika bukan guru; kontainer "Kelas" di beranda hanya muncul untuk role `guru`
- [ ] Dropdown "Nama Lengkap" berisi daftar siswa Kelas 5A yang sama persis dengan
      dropdown "Diisi Oleh"/nama siswa di modul MPLS (sumber sama: `MPLS_STUDENTS`)
- [ ] Form bisa menyimpan nama lengkap, panggilan, tempat & tanggal lahir tanpa foto
- [ ] Memilih foto dari kamera HP menampilkan pratinjau + perkiraan ukuran file setelah dikompres
- [ ] **Tombol "Pilih dari Galeri" membuka album/galeri foto** (bukan kamera) dan foto yang
      dipilih dari galeri juga berhasil diproses (pratinjau + ukuran) sama seperti dari kamera
- [ ] Kedua jalur foto (kamera & galeri) sama-sama berhasil tersimpan ke Drive & tampil di daftar
- [ ] Setelah simpan, foto muncul di folder Google Drive yang sudah ditentukan
- [ ] **Setelah simpan, foto TAMPIL sebagai thumbnail di daftar siswa** (bukan ikon placeholder,
      kecuali memang belum ada foto) — bug ini sempat "kelihatan" selesai di v0.5.2 tapi
      ternyata belum tuntas di Drive sungguhan, baru benar-benar diperbaiki di v0.5.3
      (proxy `?foto=`) — WAJIB dicek ulang dengan Apps Script sungguhan yang sudah di-deploy
      sebagai "New version", bukan cuma percaya hasil test otomatis (lihat Skenario J)
- [ ] **Tanggal lahir yang disimpan TAMPIL dengan benar** di daftar siswa (format yyyy-mm-dd),
      sesuai dengan yang diisi di form — ini juga bagian dari bug yang sama, wajib dicek ulang
- [ ] Daftar siswa di bawah form menampilkan thumbnail foto (atau ikon placeholder bila belum ada foto)
- [ ] **(Baru v0.5.5) Daftar siswa terurut ABJAD berdasarkan Nama Lengkap** (A→Z), bukan
      urutan baris/input di sheet — cek juga tetap terurut setelah kolom pencarian dipakai
      lalu dikosongkan lagi, dan siswa baru muncul di posisi abjad yang benar (bukan ditempel
      di akhir daftar)
- [ ] Klik salah satu siswa di daftar mengisi ulang form (mode edit), simpan lagi meng-update baris yang sama (bukan duplikat — cek jumlah baris di sheet "Data Siswa")
- [ ] **(Baru v0.5.4) Blok "Foto tersimpan saat ini" muncul saat mode edit** — menampilkan foto
      asli siswa yang dipilih (atau "Belum ada foto tersimpan" bila memang belum ada), dan
      hilang lagi saat form dikosongkan/tambah siswa baru
- [ ] Coba simpan siswa BARU (belum pernah ada) dengan foto — pastikan baris baru muncul di
      sheet "Data Siswa" dengan SEMUA kolom terisi benar (bukan cuma sebagian)
- [ ] Kalau foto sengaja gagal diunggah (mis. tes dengan izin Drive dicabut sementara),
      pastikan data teks (nama/panggilan/TTL) tetap tersimpan dan muncul pesan peringatan
      yang jelas — bukan gagal total tanpa keterangan
- [ ] **Kalau muncul error "Access denied: DriveApp"**: jalankan `otorisasiAksesDrive()`
      dari editor Apps Script sekali (lihat `apps-script/README.md` bagian Troubleshooting),
      lalu coba upload foto lagi TANPA perlu deploy ulang — pastikan berhasil setelahnya

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
- [ ] `laporan.html`, `laporan-kognitif.html`, DAN `laporan-jurnal.html` sama-sama menampilkan
      "Guru Kelas: Arif Azwar Anas" apa pun isi kolom "Diisi Oleh" (walau yang mengisi form Bu Azizah)
- [ ] Blok tanda tangan tetap menampilkan nama & NBM Arif Azwar Anas di ketiga jenis laporan

### 14. Asesmen Menulis — Jurnal Aktivitas (`input-jurnal.html`, `rekap-jurnal.html`, `laporan-jurnal.html`)
- [ ] Ketiga halaman ini **terpisah total** dari MPLS non-kognitif maupun kognitif — mengisi
      salah satu tidak boleh mengubah/menimpa data di sheet lain (cek 3 sheet MPLS di spreadsheet)
- [ ] Kode akses di `input-jurnal.html` berfungsi sama seperti `input.html`/`input-kognitif.html`
- [ ] 2 kategori tampil: "Struktur & Isi Tulisan" (4 indikator) dan "Kemandirian & Regulasi Diri" (3 indikator)
- [ ] Field "Cuplikan Tulisan Siswa" (opsional) tersimpan dan tampil di rekap & laporan cetak
- [ ] Memilih siswa yang sama dua kali (isi ulang) meng-update baris yang sama di sheet
      "Data Jurnal Aktivitas", bukan menduplikasi baris
- [ ] Rekap & laporan cetak jurnal mengikuti standar yang sama dengan 2 modul lain: badge
      level, kesimpulan otomatis dibedakan per skala, foto+tanda tangan di laporan cetak, 1 halaman A4

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

### Skenario I — Asesmen Menulis (Jurnal) + Verifikasi Perbaikan Cetak PDF
1. Login sebagai guru → menu MPLS → bagian "Asesmen Menulis — Jurnal Aktivitas"
2. "Input Asesmen Menulis" → kode akses → pilih siswa → isi kedua kategori + cuplikan tulisan
3. → **Harapan:** tersimpan ke sheet "Data Jurnal Aktivitas" (BUKAN ke sheet MPLS/Kognitif)
4. "Rekap Asesmen Menulis" → siswa muncul dengan cuplikan tulisan tampil di detail
5. Klik "Cetak / Simpan PDF" pada salah satu siswa (bisa dari laporan MPLS, Kognitif, atau Jurnal)
6. → **Harapan** (cek SEMUA poin ini di hasil PDF, bukan cuma print preview):
   - Tidak ada tulisan "Kembali ke Rekap" atau "Cetak / Simpan sebagai PDF" di PDF
   - Jarak antar blok terasa lega, enak dibaca
   - Font tanda tangan (tempat/tanggal, nama, NBM) sepadan ukurannya dengan teks penilaian
   - Foto siswa (kalau ada) mengisi penuh frame-nya, tidak gepeng
   - Tetap 1 halaman A4

### Skenario N — Verifikasi Pengelompokan Print Out Kognitif (v0.6.1)
1. Isi asesmen kognitif LENGKAP (semua 7 kategori, termasuk Menyimak & Menulis) untuk
   1 siswa uji coba di `input-kognitif.html`
2. Buka `pages/mpls/laporan-kognitif.html?nama=<siswa uji coba>`, cetak/pratinjau (Ctrl+P
   atau tombol "Cetak / Simpan sebagai PDF")
3. → **Harapan:** muncul label "📖 LITERASI (MEMBACA, MENYIMAK & MENULIS)" dengan 3 kartu
   (Literasi Dasar, Menyimak, Menulis) berdampingan, BARU DI BAWAHNYA label
   "🔢 NUMERASI (BERHITUNG)" dengan 4 kartu (Penjumlahan, Pengurangan, Perkalian,
   Pembagian) — bukan lagi 7 kartu campur dalam satu grid
4. → **Harapan:** laporan tetap **1 halaman** di pratinjau cetak/PDF (cek jumlah halaman
   di dialog print browser)
5. Ulangi untuk siswa yang BEBERAPA kategorinya belum diisi sama sekali (mis. baru isi
   Literasi & Numerasi, belum isi Menyimak/Menulis)
6. → **Harapan:** kategori yang belum diisi tetap tampil di kelompoknya masing-masing
   dengan keterangan "Belum ada nilai untuk kategori ini" (bukan hilang dari laporan)
7. (Regresi) Kartu ringkasan "Kesimpulan Akhir Kesiapan Akademik" di bagian atas laporan
   (aspek kuat/perlu perhatian, langkah guru & ortu gabungan) tetap tampil normal dan
   tidak berubah isinya dibanding sebelum v0.6.1

---

### Skenario M — Verifikasi Instrumen Baru "Menyimak & Menulis" (v0.6.0)
1. **Deploy ulang** Apps Script sebagai **New version**
2. Kalau sheet "Data MPLS Kognitif" sudah ada isinya: tambahkan manual 14 kolom header
   baru sesuai daftar di `apps-script/README.md` (bagian "Menambahkan kategori 'Menyimak &
   Menulis'"), di kolom kosong setelah kolom terakhir yang ada
3. Buka `pages/mpls/input-kognitif.html` → pilih 1 siswa uji coba
4. → **Harapan:** muncul 2 kartu kategori baru "Menyimak & Mengikuti Instruksi" (ikon 👂)
   dan "Menulis & Meringkas" (ikon ✍️) di bawah kategori Literasi/Numerasi yang sudah ada,
   masing-masing dengan 6 indikator + 1 kolom catatan anekdot
5. Isi semua indikator di kedua kategori baru untuk siswa itu, klik simpan
6. → **Harapan:** toast "Tersimpan", tanpa error
7. Cek sheet "Data MPLS Kognitif" → 14 kolom baru terisi nilai yang benar untuk baris
   siswa tsb, DAN kolom-kolom lama (Literasi/Numerasi/Diisi Oleh) untuk siswa LAIN yang
   sudah ada sebelumnya **tidak berubah/tidak bergeser** (regresi kritis — cek beberapa
   baris lama untuk memastikan)
8. Buka `pages/mpls/rekap-kognitif.html` → cari siswa uji coba tsb
9. → **Harapan:** kartu ringkas menampilkan level (BB/MB/BSH/BSB) untuk kategori Menyimak
   & Menulis juga, bukan cuma Literasi/Numerasi
10. Buka `pages/mpls/laporan-kognitif.html` untuk siswa yang sama → cetak/pratinjau
11. → **Harapan:** laporan cetak menampilkan kartu kategori Menyimak & Menulis lengkap
    dengan rata-rata, level, simpulan, dan rekomendasi guru/ortu — konsisten gaya dengan
    kategori Literasi/Numerasi yang sudah ada
12. Buka `pages/mpls/rubrik/rubrik-menyimak-menulis-mpls.html` langsung di browser
13. → **Harapan:** rubrik tampil rapi (2 bagian: Menyimak & Menulis, masing-masing tabel
    6 baris x 4 level), tanpa perlu koneksi internet/Apps Script apa pun

---

### Skenario L — Verifikasi Perbaikan v0.5.5 (error JSON saat simpan + urutan abjad)
1. Login sebagai guru → "Kelola Data Siswa & Foto" → cek daftar siswa yang sudah ada
2. → **Harapan (BARU):** daftar tersusun berdasarkan ABJAD nama lengkap (A→Z), bukan urutan
   input/baris di sheet
3. Ketik sesuatu di "Cari nama siswa" lalu kosongkan lagi
4. → **Harapan:** urutan abjad tetap konsisten setelah filter dikosongkan (regresi pencarian)
5. Tambah 1 siswa baru dengan nama yang urutannya di tengah abjad (bukan di awal/akhir daftar)
   → simpan
6. → **Harapan:** setelah "Tersimpan", siswa baru itu muncul di POSISI ABJAD yang benar,
   bukan cuma ditempel di akhir daftar
7. (Simulasi bug asli — kalau memungkinkan lewat DevTools Network throttling/route
   interception) buat respons simpan mengembalikan teks HTML alih-alih JSON
8. → **Harapan:** pesan error yang tampil masuk akal dalam Bahasa Indonesia (bukan
   `Unexpected token '<'...`), DAN daftar siswa di bawah ikut otomatis dimuat ulang setelah
   error tsb muncul

---

### Skenario K — Verifikasi Perbaikan v0.5.4 (nama hilang, link manual, header URL Foto)
1. **Deploy ulang** Apps Script sebagai **New version**
2. Cek baris 1 sheet "Data Siswa" → pastikan header kolom foto PERSIS `URL Foto`
   (tanpa spasi tambahan, huruf besar/kecil sama)
3. Login sebagai guru → "Kelola Data Siswa & Foto" → pilih 1 siswa dari daftar untuk diedit
4. → **Harapan (BARU):** muncul blok "Foto tersimpan saat ini" di atas tombol Ambil/Pilih
   Foto — menampilkan foto asli kalau sudah ada, atau "Belum ada foto tersimpan" bila belum
5. Simpan siswa BARU dengan foto dari kamera/galeri → cek toast: **Harapan:** "Tersimpan:
   [nama]" TANPA peringatan (bukan lagi "Access denied" atau peringatan header)
6. Cek sheet "Data Siswa" → kolom "URL Foto" utuk siswa itu **HARUS terisi** (bukan kosong)
7. Refresh `pages/kelas/index.html` → foto tampil sebagai gambar asli di daftar (regresi
   Skenario J tetap berlaku)
8. (Regresi khusus bug nama hilang) Di spreadsheet, tempel MANUAL sebuah link Google Drive
   format "Bagikan" standar (`.../file/d/ID/view?usp=...`, BUKAN format `?id=...`) ke kolom
   "URL Foto" siswa lain yang fotonya sengaja rusak/tidak publik
9. → **Harapan:** placeholder foto muncul untuk siswa itu, TAPI **nama & keterangan siswa
   tetap tampil utuh** di kartunya (tidak boleh ikut hilang — ini bug yang baru diperbaiki)
10. Tempel link "Bagikan" standar yang BENAR (foto asli, publik) ke kolom "URL Foto" siswa lain
11. → **Harapan:** foto asli tampil (ID berhasil diekstrak dari format link ini, bukan cuma
    format `?id=...` lama)

---

### Skenario J — Verifikasi Perbaikan Foto Tidak Tampil (v0.5.3, WAJIB pakai Apps Script sungguhan)
> ⚠️ Skenario ini TIDAK bisa dianggap lulus hanya dari hasil test Playwright/otomatis —
> harus dicoba langsung dengan deployment Apps Script & folder Drive sekolah yang sungguhan,
> karena akar masalah v0.5.2 justru baru muncul di lingkungan Drive sungguhan.

1. **Deploy ulang** Apps Script sebagai **New version** (lihat `apps-script/README.md`
   bagian "Setiap kali kode Code.gs diubah") — pastikan tidak lupa langkah ini
2. Login sebagai guru → "Kelola Data Siswa & Foto" → pilih/isi 1 siswa dengan foto baru
   dari kamera atau galeri → Simpan
3. → **Harapan:** toast "Tersimpan" (bukan pesan peringatan foto gagal)
4. Buka tab browser baru, akses langsung `APPS_SCRIPT_URL?foto=<ID file dari kolom
   "URL Foto" di sheet "Data Siswa">`
5. → **Harapan:** gambar foto asli langsung tampil di tab tsb (bukan JSON, bukan halaman error)
6. Refresh `pages/kelas/index.html`
7. → **Harapan:** foto siswa tsb tampil sebagai **gambar asli** di daftar siswa (bukan
   ikon 🧒 placeholder)
8. Buka `pages/mpls/laporan.html` (atau laporan-kognitif/jurnal) untuk siswa yang sama
9. → **Harapan:** foto asli tampil di kotak identitas laporan cetak, mengisi penuh
   frame tanpa gepeng
10. (Regresi) Untuk siswa yang BELUM pernah punya foto sama sekali → tetap tampil
    placeholder "Foto Siswa" yang rapi di semua tempat, bukan ikon gambar rusak

---

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
| 2026-07-14 | 0.4.2 | *(nama)* | ⏳ Belum diuji | Tombol pilih foto dari galeri (selain kamera) |
| 2026-07-15 | 0.5.0 | *(nama)* | ⏳ Belum diuji | Modul Asesmen Menulis (Jurnal) baru + perbaikan besar laporan cetak (toolbar, spasi, font ttd, fallback foto) |
| 2026-07-15 | 0.5.1 | *(nama)* | ⏳ Belum diuji | Fungsi bantu otorisasi Drive untuk atasi "Access denied: DriveApp" |
| 2026-07-15 | 0.5.2 | *(nama)* | ❌ Gagal | Fallback 3 format URL lulus test otomatis, tapi foto TETAP tidak tampil di Drive sungguhan (akar masalah: hotlink anonim diblokir Google, bukan soal format URL) |
| 2026-07-15 | 0.5.3 | *(nama)* | ⏳ Belum diuji | Foto akhirnya diproxy lewat Apps Script sendiri (`?foto=`) — WAJIB uji Skenario J dengan Apps Script sungguhan sebelum ditandai ✅ |
| 2026-07-15 | 0.5.4 | *(nama)* | ⏳ Belum diuji | Nama siswa ikut hilang saat foto gagal (diperbaiki), link Drive format "Bagikan" kini dikenali, peringatan header "URL Foto" mismatch, preview foto tersimpan di form edit — WAJIB uji Skenario K |
| 2026-07-15 | 0.5.5 | *(nama)* | ⏳ Belum diuji | Error JSON mentah saat simpan lambat kini bermakna (bukan `Unexpected token`), daftar siswa auto-refresh saat gagal simpan, daftar terurut abjad — WAJIB uji Skenario L |
| 2026-07-16 | 0.6.0 | *(nama)* | ⏳ Belum diuji | Instrumen baru "Menyimak & Menulis" (2 kategori kognitif + rubrik cetak pendamping) — WAJIB uji Skenario M, termasuk cek kolom lama TIDAK bergeser di sheet |
| 2026-07-16 | 0.6.1 | Claude (Playwright, data uji) | ✅ Lulus (otomatis) | Print out kognitif dikelompokkan Literasi vs Numerasi, dikonfirmasi tetap 1 halaman PDF dengan 7 kategori terisi penuh — guru tetap disarankan cek visual manual (Skenario N) sebelum dipakai massal |

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
