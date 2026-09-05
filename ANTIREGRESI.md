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
      *(⏳ belum bisa diuji — `pages/admin.html` belum dibuat, masih di daftar "Direncanakan"
      di CHANGELOG. Item ini baru relevan setelah halaman itu dibangun.)*

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
- [ ] **Sejak v0.6.2** (berlaku di ketiga modul — cek juga di `rekap-kognitif.html` dan
      `rekap-jurnal.html`, bukan cuma `rekap.html`): kalimat kesimpulan per kategori
      melampirkan cuplikan **catatan anekdot** guru kalau field catatannya diisi (bukan
      cuma template kategori+level polos) — coba isi catatan lalu cek kalimatnya berubah,
      bukan tetap generik
- [ ] **Sejak v0.6.2** (berlaku di ketiga modul): kategori yang belum terisi PENUH (mis.
      baru 3 dari 4 indikator) diberi penanda "(x/y indikator, sementara)" di
      kesimpulannya — bukan dianggap sudah final seolah semua indikator terisi

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

> **Insight teknis (kenapa toolbar sempat tetap tercetak walau sudah ada
> `display:none` di `@media print`)**: skrip men-set
> `document.getElementById("toolbar").style.display = "flex"` (inline style)
> untuk menampilkan toolbar di layar setelah data selesai dimuat. **Inline
> style SELALU menang atas selector CSS biasa apa pun spesifisitasnya —
> termasuk di dalam `@media print`.** Solusinya: tambahkan `!important` pada
> aturan print (`#toolbar { display: none !important; }`). Pola ini perlu
> diingat kalau nanti menambah elemen lain yang di-toggle via inline style
> tapi harus disembunyikan saat print.

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
- [ ] **7 kategori** tampil: Literasi, Penjumlahan, Pengurangan, Perkalian, Pembagian,
      Menyimak, Menulis (2 terakhir ditambahkan sejak v0.6.0 — BUKAN 5 kategori)
- [ ] Memilih siswa yang sama dua kali (isi ulang) meng-update baris yang sama di sheet
      "Data MPLS Kognitif", bukan menduplikasi baris

### 12. Asesmen Awal Kognitif — Rekap & Laporan (`rekap-kognitif.html`, `laporan-kognitif.html`)
- [ ] Kedua halaman menolak akses jika bukan guru (Firebase-gated, sama seperti versi non-kognitif)
- [ ] Rekap menampilkan **7 kategori** dengan badge level, "-" untuk kategori kosong (literasi,
      penjumlahan, pengurangan, perkalian, pembagian, menyimak, menulis — BUKAN 5, sudah
      bertambah 2 kategori "Menyimak" & "Menulis" sejak v0.6.0)
- [ ] Kesimpulan akhir "Kesiapan Akademik" tampil lengkap dengan saran guru & orang tua
- [ ] Tombol cetak dari rekap kognitif membuka `laporan-kognitif.html` dengan nama siswa yang benar
- [ ] Laporan cetak kognitif juga pas 1 halaman A4, ada foto, tulisan besar, dan blok tanda tangan
- [ ] **Sejak v0.6.2**: kartu kategori di laporan cetak terbagi jadi **2 bagian terpisah**, BUKAN
      lagi satu grid campur — "📖 Literasi (Membaca, Menyimak & Menulis)" grid 3 kolom
      (literasi, menyimak, menulis) dan "🔢 Numerasi (Berhitung)" grid 4 kolom (penjumlahan,
      pengurangan, perkalian, pembagian). Pastikan tidak ada kartu yang terpotong di kedua grid,
      dan urutan tidak lagi campur aduk seperti sebelum v0.6.2
- [ ] Tautan silang antar rekap non-kognitif ↔ kognitif berfungsi di kedua arah

> **Bukan bug**: cuplikan catatan anekdot di kesimpulan kognitif memang SENGAJA dibatasi
> lebih pendek (60 karakter) dibanding modul non-kognitif & jurnal (130 karakter) — karena
> grid kategorinya lebih rapat (7 kategori vs 4). Jangan "diperbaiki" jadi 130 tanpa
> mengecek dulu apakah laporan kognitif masih pas 1 halaman A4 kalau diubah.

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

### 15. Kunci Akses Server-side (`apps-script/Code.gs`, v0.7.0)
> **Kenapa ditambahkan**: sebelum v0.7.0, kode akses di `input.html` dan gerbang Firebase
> Auth di halaman guru (`rekap*.html`, `laporan*.html`, `pages/kelas/`) HANYA memproteksi
> tampilan. Endpoint Apps Script di baliknya sama sekali tidak mengecek apa pun — siapa saja
> yang tahu `APPS_SCRIPT_URL` (yang memang publik, ada di `pages/mpls/assets/config.js` yang
> ikut ter-deploy ke GitHub Pages) bisa memanggil `?all=1`/`?siswa=1`/dst. langsung dari
> browser/curl dan mendapatkan nama lengkap, foto, tempat & tanggal lahir SEMUA siswa. v0.7.0
> menambahkan 2 lapis pengecekan **di server** (`wajibKodeAkses_()` dan `wajibGuru_()` di
> `Code.gs`), bukan cuma di JS klien.
- [ ] **Deploy ulang** `Code.gs` sebagai **New version** sudah dilakukan (lihat
      `apps-script/README.md`) — kalau belum, SEMUA endpoint akan gagal total (bukan cuma
      soal keamanan), karena kode lama tidak mengenal parameter `idToken`/`kode`
- [ ] Saat deploy ulang, muncul permintaan izin **tambahan** untuk "menghubungkan ke layanan
      eksternal" (`UrlFetchApp`, dipakai `wajibGuru_()` untuk memverifikasi ke Identity Toolkit
      & Firestore) — klik Allow/Izinkan
- [ ] `input.html`/`input-kognitif.html`/`input-jurnal.html`: isi kode akses yang BENAR →
      pilih siswa → data lama (kalau ada) tetap termuat, simpan tetap berhasil seperti biasa
      (regresi: pastikan tidak ada perubahan perilaku dari sisi guru pengisi)
- [ ] Login sebagai **guru** → buka `pages/kelas/index.html`, `rekap.html`, `rekap-kognitif.html`,
      `rekap-jurnal.html` → semua tetap memuat data seperti biasa (regresi: pastikan idToken
      terkirim otomatis, guru tidak perlu memasukkan apa pun secara manual)
- [ ] Login sebagai guru → buka salah satu `laporan*.html` untuk siswa yang punya foto →
      foto tetap tampil (proxy `?foto=` kini juga minta idToken)
- [ ] **Uji negatif (penting)**: dari tab browser baru yang **belum login** (mode
      penyamaran/incognito), akses langsung `APPS_SCRIPT_URL?all=1` atau `?siswa=1` di address
      bar → **Harapan: balasan `{"status":"error","message":"..."}`, BUKAN data siswa**
- [ ] **Uji negatif**: akses `APPS_SCRIPT_URL?nama=<nama siswa>` tanpa parameter `&kode=` →
      **Harapan: balasan error, bukan data nilai siswa tsb**
- [ ] Kode akses di `Code.gs` (`ACCESS_CODE_MPLS`) dan di `pages/mpls/assets/config.js`
      (`ACCESS_CODE`) **sama persis** — kalau salah satu diganti, ganti juga yang satunya
- [ ] Rules Firestore yang AKTIF di Firebase Console → Firestore Database → Rules **sudah
      versi terbaru dari `README.md`** (3 blok match eksplisit: `pengumuman`/`modul`/
      `bank_soal`), BUKAN versi lama yang pakai wildcard `/{koleksi}/{id}` (ada bug tabrakan
      aturan — lihat CHANGELOG v0.7.0) dan BUKAN lagi "test mode" bawaan (yang otomatis
      terkunci total setelah 30 hari & sebelum itu terbuka untuk siapa saja)
- [ ] **Uji negatif Firestore**: login sebagai **siswa** (bukan guru) → coba baca dokumen
      `users/{uid milik guru atau siswa lain}` lewat Firebase Console "Rules Playground"
      atau lewat kode sementara di console browser → **Harapan: ditolak** (kalau berhasil
      dibaca, berarti rules masih versi lama yang bermasalah)

---

### 16. Panel Kelola Konten Guru (`pages/admin.html`, v0.8.0)
- [ ] Halaman menolak akses jika login sebagai **siswa** (Firebase-gated pakai
      `guru-guard.js`, sama seperti `rekap*.html`/`laporan*.html`/`pages/kelas/`)
- [ ] 3 tab (Pengumuman, Modul, Uji Kemampuan) bisa diklik bolak-balik, isi form tidak
      tercampur antar tab
- [ ] **Tab Pengumuman**: tambah baru → muncul di list & di beranda (`index.html`)
      dengan tanggal hari ini; klik Edit → form terisi ulang persis, judul jadi
      "Edit Pengumuman"; simpan perubahan → list ter-update, BUKAN duplikat baris
      baru; klik Hapus → muncul konfirmasi, kalau di-Oke baris hilang dari list
      DAN dari beranda
- [ ] **Tab Modul**: tambah baru dengan mapel yang belum pernah ada → muncul grup
      mapel baru; tambah modul kedua dengan mapel yang SAMA tapi urutan lebih
      kecil → tampil LEBIH ATAS dari yang pertama (urutan menentukan posisi,
      bukan waktu tambah); Edit & Hapus berfungsi sama seperti Pengumuman
- [ ] **Tab Uji Kemampuan** — ⚠️ *checklist di bawah ini ditulis ulang, versi
      sebelumnya cuma mendeskripsikan form pg_tunggal lama; sekarang form
      punya pilihan `jenisSoal` (5 jenis) + wajib pilih `tp`:*
  - [ ] Ganti dropdown jenis soal → field-field form ikut berubah sesuai
        jenis (mis. pindah dari pg_tunggal ke mengurutkan → field pilihan
        radio hilang, diganti field daftar item urutan)
  - [ ] Pilih TP dari dropdown (bukan ketik bebas) → tersimpan sebagai kode
        TP yang valid, konsisten dengan `tp-kko-index.js`
  - [ ] Validasi KKO: soal dengan KKO melebihi batas KKO maksimum TP yang
        dipilih → ditolak simpan dengan pesan error yang jelas (bukan
        gagal diam-diam)
  - [ ] Edit soal lama dari tiap jenis → seluruh field form terisi ulang
        sesuai jenis soal & isinya, bukan cuma sebagian
  - [ ] **Tab Impor Massal** (belum ada checklist sebelumnya — cek manual
        kalau menyentuh fitur ini): tempel/upload JSON array soal → SEMUA
        soal divalidasi dulu (TP valid, KKO tidak melebihi batas, field
        wajib tiap jenis lengkap); kalau ADA SATU yang bermasalah, TIDAK
        ADA yang tersimpan sampai diperbaiki (bukan sebagian tersimpan)
- [ ] Coba isi judul/pertanyaan dengan karakter aneh seperti `<script>` atau
      `<img onerror=...>` → HARUS tampil sebagai teks biasa di list (bukan
      dieksekusi/muncul kotak alert) — ini uji anti-XSS, bukan sekadar tampilan
- [ ] Tombol "+ Tambah Pengumuman" / "Upload Modul" / "Tambah Soal" di beranda
      membuka `admin.html` langsung ke tab yang sesuai (bukan lagi `alert("Fitur
      segera hadir")`)
- [ ] Tampilan tab Uji Kemampuan (paling padat: pertanyaan + 4 pilihan + radio) tetap
      rapi di layar HP (≤ 380px), tidak ada radio/label yang terpotong

---

### 17. Halaman Modul Pembelajaran (`pages/modul.html`, v0.8.0)
- [ ] Login sebagai **siswa** → halaman tetap bisa diakses (BUKAN guru-only,
      pakai `auth-guard.js` yang mengizinkan siapa saja yang login)
- [ ] Modul yang ditambahkan lewat `admin.html` langsung muncul di sini tanpa
      perlu deploy ulang apa pun (data dari Firestore, bukan hardcode)
- [ ] Modul dikelompokkan per mata pelajaran, dan di dalam satu mapel diurutkan
      sesuai field "Urutan Tampil" yang diisi guru — BUKAN urutan tambah/abjad
- [ ] Filter chip di atas (nama-nama mapel + "Semua") menyaring daftar dengan
      benar; pilih satu mapel → modul mapel lain hilang dari tampilan
- [ ] Tombol "Buka Modul" membuka link Drive/PDF di tab baru, TIDAK menavigasi
      keluar dari halaman ini
- [ ] Modul tanpa link file valid (kosong atau bukan `http`) tidak menampilkan
      tombol "Buka Modul" yang rusak — dicek dulu formatnya sebelum dibuatkan link
- [ ] Kalau belum ada modul sama sekali → pesan "Belum ada modul yang ditambahkan
      guru", bukan halaman kosong tanpa penjelasan

---

### 18. Materi Ajar (`pages/admin.html` tab Materi, `pages/materi.html`, v0.9.0)
- [ ] Tab Materi di `admin.html`: tambah/edit/hapus berfungsi sama seperti tab
      Modul, tapi field "Isi Materi" (textarea panjang) tersimpan & termuat ulang
      utuh saat Edit — tidak terpotong
- [ ] `materi.html` bisa dibuka akun **siswa** (bukan guru-only)
- [ ] Daftar materi dikelompokkan per mapel & diurutkan sesuai "Urutan Tampil",
      sama seperti Modul
- [ ] Klik judul materi → isi materi TERBUKA di tempat (tidak pindah halaman,
      tidak buka tab baru); klik lagi → tertutup kembali
- [ ] Materi dengan lampiran (`url_file` valid) menampilkan link "📎 Buka
      lampiran" di dalam isi yang terbuka; materi tanpa lampiran tidak
      menampilkan link rusak
- [ ] Filter chip per mapel berfungsi sama seperti `modul.html`

---

### 19. Uji Kemampuan — Latihan Interaktif (`pages/uji-kemampuan.html`, dulu bernama "Bank Soal"/`bank-soal.html` sebelum v0.10.x; redesain 3-tahap + 5 jenis soal + penyimpanan hasil, belum dirilis)

> **⚠️ Checklist ini ditulis ulang total** — versi sebelumnya mendeskripsikan
> UI LAMA (1 mapel = semua soal pg_tunggal tampil sekaligus, tanpa TP, tanpa
> penyimpanan hasil). Itu sudah tidak sesuai kode sejak redesain TP-based +
> 5 jenis soal (lihat `CHANGELOG.md` bagian "Ditambahkan" & entri riwayat di
> bawah).
>
> **Update**: label "Belum dijawab" dari fitur v0.9.1 sempat hilang total
> saat redesain 5-jenis-soal ini dibangun (bukan disederhanakan dengan
> sengaja — murni ketinggalan/regresi, tidak ada di manapun di kode maupun
> di `pages/bank-soal.html` versi lama). **Sudah dikembalikan** (lihat
> entri "Diperbaiki" di `CHANGELOG.md`) untuk pg_tunggal, pg_kompleks,
> pg_kategori, dan menjodohkan. Jenis **mengurutkan** SENGAJA dikecualikan
> — soal itu selalu menampilkan urutan default begitu kuis dibuka (tidak
> ada state "kosong" untuk item yang bisa disusun ulang), jadi tidak ada
> cara valid membedakan "belum disentuh" dari "urutan defaultnya kebetulan
> sudah cocok".

**Tahap 1 — Pilih mapel** (`view-pilih-mapel`)
- [ ] Bisa dibuka akun **siswa** DAN **guru**; akun **orang tua** ditolak
      (dilempar balik ke beranda, sesuai `guardRolePage(['siswa','guru'], ...)`)
- [ ] Grid mapel menampilkan tiap mapel dari `URUTAN_MAPEL` + jumlah TP-nya
      (mis. "9 TP"), BUKAN jumlah soal — jumlah soal baru muncul di Tahap 2

**Tahap 2 — Pilih TP** (`view-pilih-tp`)
- [ ] Klik 1 mapel → tampil daftar TP mapel itu dari `TP_KKO_INDEX`, tiap
      kartu menunjukkan jumlah soal tersedia (hasil `getCountFromServer`
      query `bank_soal` where `tp == <kode>` — query hitung, bukan unduh
      semua dokumen)
- [ ] TP dengan **< 5 soal** kartunya nonaktif (abu-abu, tidak bisa diklik)
- [ ] TP dengan **< 200 soal** (tapi ≥5) tetap bisa diklik, tapi label jumlah
      soalnya berwarna merah + teks "(pool belum lengkap)"
- [ ] Tombol "← Pilih mapel lain" kembali ke Tahap 1 tanpa nyangkut state lama

**Tahap 3 — Kuis** (`view-kuis`)
- [ ] Klik 1 TP yang aktif → maksimal **15 soal** diambil ACAK dari pool TP
      itu (kalau pool <15, semua soal yang ada dipakai); buka TP yang sama
      berkali-kali → soal yang muncul TIDAK selalu identik/urutan sama
      (dicek pakai field `randKey`)
- [ ] Kelima jenis soal tampil dan berfungsi benar:
  - [ ] **Pilihan ganda tunggal** (`pg_tunggal`) — radio button, 1 jawaban
  - [ ] **Pilihan ganda kompleks** (`pg_kompleks`) — checkbox, BISA >1
        jawaban dicentang; dinilai benar HANYA kalau himpunan yang
        dicentang PERSIS sama dengan `jawabanBenar` (tidak ada nilai
        parsial untuk jawaban sebagian benar)
  - [ ] **Kategorikan** (`pg_kategori`) — tiap item punya dropdown kategori;
        semua baris harus cocok kategorinya untuk soal itu dihitung benar
  - [ ] **Mengurutkan** — daftar item diacak posisinya saat tampil, siswa
        susun ulang pakai tombol ▲▼; benar hanya kalau urutan akhir PERSIS
        sama dengan urutan asli di `bank_soal`
  - [ ] **Menjodohkan** — sisi kanan (opsi jodoh) diacak urutannya, siswa
        pilih pasangan lewat dropdown per baris; semua baris harus cocok
- [ ] Klik "Periksa Jawaban" → skor **x/y (persen%)** muncul sesuai jumlah
      soal yang benar-benar cocok; opsi/baris/item yang benar ditandai
      **hijau**, yang dipilih siswa tapi salah ditandai **merah**
- [ ] Soal pg_tunggal/pg_kompleks/pg_kategori/menjodohkan yang **sama
      sekali tidak disentuh** → nomor soalnya diberi label merah "⚠ Belum
      dijawab", dan baris skor mencantumkan "· N soal belum dijawab"; soal
      itu tetap dihitung SALAH di skor (bukan dilewati dari perhitungan).
      Soal **mengurutkan** SENGAJA tidak pernah diberi label ini (lihat
      catatan di atas)
- [ ] Soal pg_kategori/menjodohkan yang **sebagian** baris diisi (tidak
      semua) → TIDAK diberi label "Belum dijawab" (dianggap sudah dicoba),
      baris yang kosong tetap ditandai merah seperti jawaban salah biasa
- [ ] Setelah dinilai: seluruh input soal (radio/checkbox/dropdown/tombol
      urut) terkunci, tombol berubah jadi "Sudah Dinilai" (nonaktif)
- [ ] Muncul label "Menyimpan hasil…" lalu berubah jadi "✓ Hasil tersimpan
      — bisa dilihat lagi lewat Riwayat Latihan" (hijau) dalam kondisi
      normal; kalau simpan gagal (mis. offline), label berubah jadi pesan
      error berwarna merah TAPI skor di layar tetap terlihat (tidak hilang)
- [ ] Cek isi dokumen baru di Firestore `hasil_latihan` setelah submit:
      `uid`, `namaSiswa`, `mapel`, `tp`, `tpJudul`, `jumlahBenar`,
      `jumlahSoal`, `skor`, `detailJawaban` (array per soal), `timestamp`
      — semua terisi benar, `namaSiswa` BUKAN nama akun lain
- [ ] Tombol "← Pilih TP lain" kembali ke Tahap 2, dan memilih TP lain/sama
      menampilkan kuis BARU (bukan hasil kuis sebelumnya yang masih nyangkut)
- [ ] **[Insiden nyata, lihat CHANGELOG.md]** Kalau `namaSiswa` kosong saat
      klik "Periksa Jawaban" (susah disimulasikan manual — kasus tepi sesi
      tab) → muncul `alert()` minta login ulang, skor TIDAK ditampilkan
      dan TIDAK ada dokumen `hasil_latihan` baru yang tersimpan dengan nama
      kosong. Kalau memungkinkan untuk disimulasikan (mis. lewat DevTools,
      set variabel `namaSiswa` jadi string kosong sebelum klik), verifikasi
      perilaku ini; kalau tidak, minimal pastikan Firestore Security Rules
      `hasil_latihan` di Firebase Console SUDAH dipublikasikan ulang dengan
      klausa `namaSiswa.size() > 0` (cek tab Rules di Firebase Console,
      bandingkan dengan `README.md` — bukan cuma cek repo)

**Rekap guru** (`pages/riwayat-latihan.html`)
- [ ] Akun **siswa** dan **orang tua** ditolak masuk halaman ini (guru-only
      sesuai `CHANGELOG.md` (v0.11.0) — cek dilempar balik ke beranda)
- [ ] Akun guru melihat riwayat SEMUA siswa, dikelompokkan per nama, hasil
      kuis yang baru saja disimpan di atas langsung muncul di sini (tanpa
      perlu tunggu proses tambahan)

---

### 20. Arsip Pengumuman (`pages/info.html`, v0.9.0)
- [ ] Bisa dibuka akun siswa maupun guru
- [ ] Menampilkan SEMUA pengumuman yang ada di Firestore, terbaru di paling atas
      — BUKAN cuma 5 seperti di beranda (`index.html`)
- [ ] Pengumuman yang ditambah/diedit/dihapus lewat `admin.html` langsung
      konsisten antara beranda dan halaman ini (sama-sama baca koleksi
      `pengumuman` yang sama, tidak ada data terpisah)

---

### 21. Halaman Statis — CP/TP/ATP & Jadwal (`pages/cp-tp-atp.html`, `pages/jadwal.html`, v0.9.0)
> Kedua halaman ini SENGAJA statis (bukan Firestore) dan SENGAJA masih kerangka
> kosong — checklist di bawah menguji bahwa kerangkanya jujur dan tidak rusak,
> BUKAN menguji konten (karena kontennya memang belum ada).
- [ ] Bisa dibuka akun siswa maupun guru (pakai `auth-guard.js`, sama seperti
      `modul.html`/`materi.html`/`uji-kemampuan.html`/`info.html`)
- [ ] Kotak catatan kuning "Halaman ini masih kerangka" tampil jelas, tidak
      disembunyikan atau ketutupan elemen lain
- [ ] `jadwal.html`: tabel jadwal tidak bikin halaman melebar ke samping di
      layar HP (tabelnya sendiri boleh di-scroll horizontal DI DALAM kotaknya,
      tapi halaman secara keseluruhan tidak ikut melebar)
- [ ] **Kalau nanti sudah diisi dokumen CP/TP/ATP atau jadwal resmi**: pastikan
      kotak catatan kuning ("masih kerangka") ikut DIHAPUS supaya tidak
      membingungkan — jangan cuma menambah isi tanpa menghapus catatannya

---

### 22. Penyempurnaan Form Konten (`admin.html`, v0.9.1)
- [ ] Tab Uji Kemampuan: coba simpan soal TANPA mengisi Mata Pelajaran → ditolak
      dengan pesan jelas, TIDAK ikut tersimpan ke list
- [ ] Tab Uji Kemampuan: isi 2 pilihan dengan teks yang PERSIS SAMA (mis. keduanya
      "20") → ditolak dengan pesan soal pilihan duplikat, TIDAK ikut tersimpan
- [ ] Ketik di kolom "Mata Pelajaran" (tab Modul/Materi/Uji Kemampuan manapun) →
      muncul saran nama mapel yang sudah pernah dipakai di ketiga tab (datalist
      browser bawaan, bukan dropdown custom)
- [ ] Isi "Link File"/"Lampiran" dengan teks yang BUKAN URL (mis. cuma
      "modul1.pdf" tanpa `http`) → pesan sukses tetap muncul tapi disertai
      peringatan format link; simpan dengan link yang benar (`https://...`) →
      tidak ada peringatan tambahan

---

### 23. PRINSIP WAJIB: Jangan Menutupi Pesan Error Asli (sejak v0.9.2)
> **Kronologi kenapa section ini ada**: setelah v0.7.0 menambahkan gerbang akses
> server-side (`wajibGuru_()`/`wajibKodeAkses_()` di `Code.gs`), pengguna
> melaporkan data hasil MPLS yang tadinya normal jadi tidak bisa dilihat, padahal
> sudah pakai kode terbaru dan sudah deploy ulang. Setelah ditelusuri, penyebabnya
> BUKAN masalah deploy — melainkan `rekap.html`/`laporan*.html`/`kelas.js` yang
> sudah diubah untuk MENGIRIM `idToken`/`kode` (v0.7.0), tapi lupa diubah untuk
> MEMBACA kalau server MENOLAKNYA. Respons error `{status:"error", message:"..."}`
> ikut memicu kondisi "field data tidak ada", sehingga tampil pesan lama yang
> keliru total ("kemungkinan belum deploy versi terbaru") padahal error
> sebenarnya soal otorisasi/sesi login. Guru jadi disuruh redeploy berulang kali
> tanpa pernah menyelesaikan masalah, karena pesan yang dilihatnya salah sasaran.

**Aturan wajib ke depan, berlaku untuk SEMUA endpoint baru maupun lama:**
- [ ] Setiap kali kode di `Code.gs` bisa membalas `{status:"error", message:...}`
      untuk sebuah endpoint, SEMUA pemanggil endpoint itu di sisi klien WAJIB
      mengecek `json.status === "error"` **PALING AWAL**, sebelum mengecek
      keberadaan field lain (`data`, `found`, dst.) — bukan cuma menambah
      pengiriman parameter baru (`idToken`/`kode`) tanpa mengubah cara membaca
      balasannya
- [ ] Kalau `json.status === "error"`, tampilkan `json.message` APA ADANYA ke
      pengguna (guru) — jangan diterjemahkan ulang jadi pesan generik, dan
      jangan ditelan diam-diam jadi "data kosong"/"belum ada"
- [ ] Setiap kali menambah gerbang akses BARU ke endpoint yang SUDAH ADA dan
      sudah dipakai fitur lain: telusuri ulang **SEMUA** file yang memanggil
      endpoint itu (`grep -rn` nama endpoennya di seluruh `pages/`), bukan cuma
      halaman yang sedang dikerjakan saat itu
- [ ] Sebelum menganggap sebuah perubahan gerbang akses selesai: uji SKENARIO
      GAGAL-nya juga (kirim idToken/kode yang salah/kosong sengaja), bukan cuma
      skenario berhasil — lihat §24 kalau butuh cara mengujinya tanpa Firestore
      sungguhan

---

### 24. Panduan Diagnostik: "Data MPLS/Kelas Tidak Bisa Dilihat Lagi"
> Dipakai kalau rekap/laporan/data kelas yang biasanya normal tiba-tiba tidak
> bisa dilihat. Sejak v0.9.2, pesan error yang tampil di halaman (atau di
> Console browser untuk kasus foto) SEHARUSNYA sudah menunjukkan penyebab
> asli — baca pesannya dulu sebelum menebak-nebak atau buru-buru redeploy.

**Langkah 1 — Baca pesan errornya persis, jangan dilewati**
- [ ] Buka halaman yang bermasalah (`rekap.html`, dsb.) → kalau ada kotak
      merah "Gagal memuat data dari server: ..." → itu pesan asli dari
      `Code.gs`, cocokkan dengan daftar di bawah
- [ ] Kalau yang bermasalah foto di `laporan*.html`/`pages/kelas/`: buka
      DevTools (F12) → tab Console → cari baris "Gagal memuat profil siswa"

**Langkah 2 — Cocokkan pesan dengan penyebabnya**
- [ ] **"Sesi login guru tidak ditemukan"** (KASUS NYATA PERNAH TERJADI, lihat
      §25 untuk kronologi lengkap): sejak v0.9.3, pastikan `guru-guard.js` yang
      dipakai TIDAK lagi mengandung `onIdTokenChanged` — itu sumber race
      condition yang bikin token diam-diam ke-reset jadi kosong walau guru
      sudah login benar. Kalau situs masih pakai `guru-guard.js` versi lama
      (ada `onIdTokenChanged`), update dulu ke versi v0.9.3. Kalau sudah
      versi v0.9.3 tapi tetap kosong, baru coba logout-login ulang.
- [ ] **"Sesi login tidak valid/kedaluwarsa"** → panggilan ke Identity Toolkit
      gagal. Kemungkinan: (a) idToken beneran kedaluwarsa — coba login ulang;
      (b) **Apps Script belum diberi izin akses layanan eksternal
      (`UrlFetchApp`)** — ini penyebab yang PALING SERING kelewat: buka Apps
      Script Editor → Deploy → Manage deployments → pastikan proses deploy
      SEMPAT menampilkan layar izin "Aplikasi ini meminta akses ke..." dan
      sudah diklik Allow/Izinkan (bukan ditutup/dibatalkan); (c) API key
      Firebase (`FIREBASE_WEB_API_KEY` di `Code.gs`) punya PEMBATASAN di
      Google Cloud Console (mis. dibatasi hanya untuk domain/referrer
      tertentu) yang membuat panggilan dari server Apps Script ditolak
      walau key-nya sendiri benar — cek di Google Cloud Console → APIs &
      Services → Credentials → klik API key tsb → lihat "Application
      restrictions"
- [ ] **"Profil pengguna tidak ditemukan/tidak terbaca — hubungi admin untuk
      cek data users/{uid}"** → dokumen `users/{uid}` guru tsb tidak ada di
      Firestore, ATAU Firestore Rules yang aktif tidak mengizinkan pemilik
      baca dokumennya sendiri (cek rules yang di-publish benar-benar yang
      terbaru dari `README.md`, lihat §15-16)
- [ ] **"Akun ini bukan akun guru"** → field `role` di dokumen `users/{uid}`
      bukan `"guru"` persis (cek typo/kapitalisasi di Firestore Console)
- [ ] **"Kode akses salah atau tidak disertakan"** → `ACCESS_CODE_MPLS` di
      `Code.gs` tidak sama persis dengan `ACCESS_CODE` di
      `pages/mpls/assets/config.js` — samakan manual keduanya
- [ ] **Kotak "Backend belum mengenali permintaan ini... field data tidak
      ada di respons, dan bukan respons error juga"** → ini baru benar-benar
      soal deployment: cek `APPS_SCRIPT_URL` di `config.js` PERSIS sama dengan
      URL deployment yang aktif sekarang (Deploy → Manage deployments), dan
      pastikan versi yang di-deploy memang yang terbaru (bukan "Test
      deployment" yang URL-nya beda dari Web App yang dipakai production)

**Langkah 3 — Kalau masih buntu**
- [ ] Coba panggil endpoint LANGSUNG dari address bar browser (contoh:
      `<APPS_SCRIPT_URL>?all=1&idToken=` — sengaja tanpa token, harus balas
      error yang jelas, BUKAN halaman kosong/HTML aneh) untuk memastikan Web
      App-nya sendiri hidup dan merespons JSON dengan benar, sebelum menuduh
      masalahnya ada di sisi klien

---

### 25. Kronologi Bug: "Data MPLS Tidak Bisa Dilihat Lagi" (v0.9.2 → v0.9.3)
> Dicatat lengkap atas permintaan pengguna, supaya kesalahan yang sama tidak
> terulang. Ini kasus NYATA yang dialami, bukan skenario hipotetis.

**Kronologi:**
1. v0.7.0 menambahkan gerbang akses server-side (`wajibGuru_()`) — endpoint
   guru butuh `idToken`. `guru-guard.js` diberi `window.guruIdToken` (diisi
   oleh `onAuthStateChanged`) DAN `onIdTokenChanged` (dimaksudkan menjaga
   token tetap segar tiap ~1 jam).
2. Pengguna melaporkan: data hasil MPLS yang biasanya normal tiba-tiba tidak
   bisa dilihat, padahal sudah pakai kode terbaru & sudah deploy ulang.
3. v0.9.2 memperbaiki bug BERBEDA yang ditemukan lebih dulu (pesan error
   server ditutupi pesan generik "belum deploy") — ini perbaikan yang BENAR
   dan PERLU, tapi belum menyelesaikan laporan pengguna karena bukan akar
   masalah sebenarnya, cuma menyingkap bahwa ada masalah lain di baliknya.
4. Setelah v0.9.2 ditempel, pesan error yang SEBENARNYA baru terlihat:
   **"Sesi login guru tidak ditemukan — silakan login ulang."** — muncul
   SEKETIKA (tanpa jeda "memuat"), tanpa jejak apa pun di Console browser.
5. Analisis: pesan itu berasal dari baris PALING AWAL `wajibGuru_()` di
   `Code.gs` (`if (!idToken) throw ...`), yang dilempar SEBELUM ada panggilan
   jaringan apa pun — cocok persis dengan gejala "seketika, tanpa jejak
   console" (karena memang tidak ada request Identity Toolkit/Firestore yang
   sempat terjadi). Ini membuktikan `window.guruIdToken` KOSONG di klien saat
   `fetch()` dipanggil, padahal guru sudah login dengan benar (halaman sudah
   lolos dari layar "Memeriksa akses").
6. Ditemukan: `onIdTokenChanged` dan `onAuthStateChanged` adalah DUA listener
   independen. Di Firebase SDK sungguhan, `onIdTokenChanged` bisa terpanggil
   dengan `user: null` sesaat (sebelum sesi tersimpan browser selesai
   dipulihkan) — kalau ini terjadi SETELAH `onAuthStateChanged` sempat mengisi
   token dengan benar, baris `window.guruIdToken = null` di `onIdTokenChanged`
   MENIMPA token yang baru saja benar, TANPA ERROR APAPUN (bukan exception,
   cuma penugasan variabel biasa — makanya tidak ada jejak di console).
7. v0.9.3 menghapus `onIdTokenChanged` sepenuhnya, mengganti dengan
   `window.getFreshGuruIdToken()` yang SELALU baca `auth.currentUser`
   LANGSUNG di saat dibutuhkan (satu sumber kebenaran, tidak ada listener
   kedua yang bisa berlomba).

**Pelajaran/prinsip untuk kode ke depan:**
- [ ] **Jangan simpan token/kredensial penting di variabel cache
      (`window.xxx`) yang di-maintain oleh LEBIH DARI SATU listener/callback
      independen.** Kalau perlu selalu segar, ambil LANGSUNG dari sumbernya
      (`auth.currentUser.getIdToken()`) di titik pemakaian, bukan dari cache
      yang di-refresh "di suatu tempat lain" oleh kode yang terpisah.
- [ ] **Bug berbasis race condition/timing async biasanya TIDAK muncul di
      pengujian dengan stub/mock** (stub Playwright saya memanggil listener
      secara sinkron & predictable, tidak mereplikasi timing SDK sungguhan).
      Ini bukan berarti pengujian otomatis tidak berguna — tapi perlu diingat
      "semua test lulus" tidak sama dengan "tidak ada bug", khususnya untuk
      apa pun yang melibatkan Firebase Auth, timing, atau lebih dari satu
      sumber kebenaran untuk data yang sama
- [ ] Kalau pengguna melaporkan sesuatu "tadinya jalan normal, sekarang
      tidak" setelah sebuah update: JANGAN asumsikan itu masalah
      deploy/environment pengguna sampai pesan error ASLI (bukan yang
      disimpulkan) benar-benar terlihat dan dibaca — lihat §23
- [ ] **Uji manual dengan Firestore/Firebase Auth SUNGGUHAN masih tertunda**
      sejak v0.8.0 (lihat catatan berulang di Log Ujicoba) — kasus ini contoh
      nyata kenapa itu penting: bug ini TIDAK mungkin ketemu lewat stub,
      hanya ketemu setelah dipakai pengguna sungguhan. Semakin lama uji nyata
      ditunda, semakin besar risiko bug sejenis menumpuk tanpa terdeteksi.

**Checklist regresi untuk perbaikan ini:**
- [ ] `assets/js/guru-guard.js` TIDAK mengandung `onIdTokenChanged` sama
      sekali (baik di `import` maupun pemanggilan)
- [ ] `window.getFreshGuruIdToken` tersedia dan mengembalikan token yang
      valid setelah event `guru-verified`
- [ ] Buka halaman guru (`rekap.html`, dst.), BIARKAN TERBUKA lebih dari 1
      jam (atau percepat dengan mengubah `30 * 60 * 1000` sementara jadi
      angka kecil saat menguji), pastikan token tetap ter-refresh otomatis
      dan endpoint tetap bisa diakses tanpa perlu login ulang
- [ ] Refresh halaman (F5) berkali-kali berturut-turut (mensimulasikan
      kondisi sesi tersimpan baru dipulihkan) — pastikan TIDAK PERNAH muncul
      "Sesi login guru tidak ditemukan" padahal sudah login

---

### 26. Galeri Visual & Kelola per TP (`pages/infografis/`, belum dirilis)
- [ ] Kartu "Galeri Visual" di beranda mengarah ke `pages/infografis.html`,
      posisinya di antara Materi Ajar dan Uji Kemampuan
- [ ] `pages/infografis.html`: menu 8 mata pelajaran tampil dengan warna &
      ikon yang SAMA dengan Materi Ajar; jumlah media per mapel tampil
      (atau "Belum ada media" kalau kosong) — kegagalan memuat jumlah TIDAK
      menghalangi navigasi ke tiap mapel
- [ ] `pages/infografis/galeri.html?mapel=<slug>`: grid gambar tampil;
      klik gambar membuka **lightbox** dengan gambar yang sama (BUKAN layar
      gelap kosong — ini pernah jadi bug, lihat §27); klik video membuka
      tab baru ke tautannya; mapel tidak dikenal menampilkan pesan jelas +
      link kembali, bukan halaman kosong
- [ ] `galeri.html`: infografis dikelompokkan per TP (judul grup memakai
      warna mapel, urutan ikut `materi-index.js` — BUKAN urutan upload),
      TP tanpa infografis tidak ditampilkan judulnya; infografis tanpa
      "Materi Slug"/materi yang sudah dihapus dari indeks tetap tampil di
      grup "Lainnya" (tidak boleh "hilang")
- [ ] `galeri.html`: klik judul grup TP membuka/menutup (collapse) grid di
      bawahnya, chevron ikut berputar; tombol "Buka Semua"/"Tutup Semua"
      muncul HANYA kalau ada >1 grup TP yang tampil, dan berfungsi
- [ ] `pages/infografis/kelola-tp.html` (khusus guru — kontainer di
      beranda hanya muncul untuk role `guru`):
  - [ ] Dropdown TP terisi otomatis dari `materi-index.js` (BUKAN daftar
        manual) — hanya materi berstatus `"selesai"` yang muncul
  - [ ] Pilih 1 TP → tiap materi tampil sebagai 1 kartu
  - [ ] Unggah gambar untuk materi yang BELUM punya infografis → kartu
        langsung menampilkan thumbnail + tombol berubah jadi "Ganti
        Infografis" + tombol "Hapus" muncul
  - [ ] **REFRESH HALAMAN (F5)** setelah upload — thumbnail & tombol Hapus
        HARUS TETAP ada (bukan kembali ke placeholder "belum ada infografis")
        — ini pernah jadi bug, WAJIB dicek ulang tiap kali sheet "Data
        Infografis" mengalami perubahan struktur (lihat §27)
  - [ ] Unggah gambar BARU untuk materi yang SUDAH punya infografis → baris
        di sheet "Data Infografis" **tertimpa** (cek jumlah baris di sheet
        TIDAK bertambah), dan file lama di folder Drive mapel tsb pindah ke
        **Trash** (bukan terhapus permanen, bukan juga masih ada 2 file aktif)
  - [ ] Klik "Hapus" pada kartu yang sudah ada infografisnya → baris hilang
        dari sheet, kartu kembali ke placeholder
- [ ] Sheet "Data Infografis" di spreadsheet: baris header punya SEMUA
      kolom di `INFOGRAFIS_HEADERS` di `Code.gs` (termasuk "Materi Slug") —
      kalau sheet ini pernah dipakai SEBELUM kode terbaru, kolom yang
      kurang harus otomatis bertambah sendiri di ujung kanan setelah 1x
      permintaan apa pun ke server (self-healing, lihat §27) — TIDAK BOLEH
      ada kolom yang hilang/kosong strukturnya
- [ ] Folder Drive per mapel (`INFOGRAFIS_FOLDER_IDS` di `Code.gs`) — upload
      ke mapel yang ID foldernya masih `"GANTI_..."` menampilkan pesan error
      yang jelas menyebut nama mapelnya, BUKAN error generik
- [ ] **Uji dengan Apps Script SUNGGUHAN yang sudah dideploy** (bukan cuma
      dites di editor) — buka `APPS_SCRIPT_URL?infografisFoto=<ID_DRIVE_ASLI>`
      langsung di tab **incognito** (bukan tab biasa yang sedang login
      Google sebagai pemilik file — lihat §27 kenapa ini penting) → harus
      tampil gambarnya, bukan pesan error

---

### 27. Kronologi Bug: "Infografis Tidak Dikenali Setelah Refresh" (Galeri Visual, belum dirilis)
> Dicatat lengkap atas permintaan pengguna, supaya kesalahan yang sama tidak
> terulang — sama seperti §25. Ini kasus NYATA yang dialami (bukan
> hipotetis), dan melibatkan BEBERAPA bug independen yang sempat tertumpuk
> jadi satu laporan gejala ("gambar hilang setelah refresh"), ditambah satu
> jalur diagnosis yang sempat salah arah. Dipisah di sini SATU per SATU
> supaya jelas mana penyebab mana.

**Bug #1 — `setSharing()` gagal membuat SELURUH upload dilaporkan gagal,
padahal file sudah tersimpan di Drive**
1. Guru melaporkan: upload gambar menampilkan pesan
   "Gagal mengunggah gambar ke Drive: Exception: Akses ditolak: DriveApp",
   TAPI file-nya ternyata SUDAH ADA di folder Drive tujuan.
2. Akar masalah: `simpanFotoKeDrive_()` melakukan 2 langkah berurutan
   dalam SATU blok try/catch di pemanggilnya — (a) `folder.createFile()`
   lalu (b) `file.setSharing(ANYONE_WITH_LINK, VIEW)`. Langkah (a) berhasil
   (makanya file benar-benar ada di Drive), tapi langkah (b) dilempar
   sebagai exception (kemungkinan besar kebijakan admin Google Workspace
   sekolah yang membatasi berbagi "siapa saja yang punya link") — exception
   itu merambat ke pemanggil dan SELURUH proses dianggap gagal, walau file
   aslinya sudah tersimpan sempurna.
3. Diperbaiki: `setSharing()` dibungkus try/catch TERPISAH di dalam
   `simpanFotoKeDrive_()` sendiri, kegagalannya diabaikan (cukup dicatat
   `Logger.log`, tidak dilempar lagi) — AMAN karena proxy `?foto=`/
   `?infografisFoto=` toh membaca file lewat akses milik skrip sendiri
   (`DriveApp.getFileById`), TIDAK butuh sharing publik sama sekali; sharing
   publik cuma cadangan untuk kandidat hotlink langsung (lihat Bug #3).

**Bug #2 — kolom "Materi Slug" diam-diam terbuang saat sheet sudah lebih
dulu dipakai (AKAR MASALAH UTAMA gejala "tidak dikenali setelah refresh")**
1. Fitur "1 materi = 1 infografis" di `kelola-tp.html` butuh kolom BARU
   "Materi Slug" di sheet "Data Infografis" untuk menandai infografis itu
   milik materi yang mana.
2. Sheet ini SUDAH DIPAKAI (ada baris data) SEBELUM kolom ini ditambahkan
   ke `INFOGRAFIS_HEADERS` di kode.
3. `buildRowByHeaders_()` (dipakai semua fungsi simpan di `Code.gs`) selalu
   mencocokkan nilai berdasarkan **nama kolom yang benar-benar ada di baris
   header SHEET**, BUKAN urutan array `INFOGRAFIS_HEADERS` di kode (desain
   ini SENGAJA sejak v0.4.1, lihat catatan di bagian Catatan Penting — supaya
   boleh menambah kolom kapan saja tanpa migrasi manual, TAPI konsekuensinya:
   kolom yang belum ada di header sheet akan diam-diam DIABAIKAN saat
   ditulis, bukan error).
4. Akibatnya: setiap upload lewat `kelola-tp.html` BERHASIL menyimpan Mapel/
   Judul/Keterangan/dst. (semua kolom itu SUDAH ada di header lama), TAPI
   nilai "Materi Slug" tidak pernah benar-benar tersimpan di mana pun.
5. `kelola-tp.html` langsung setelah upload masih tampak "berhasil" karena
   client menyimpan hasilnya sendiri di memori (`state.infografisBySlug`)
   tanpa perlu baca ulang dari server. Begitu di-REFRESH, client mengambil
   data dari server lagi (`?infografis=1`), mencocokkan `row["Materi Slug"]`
   — yang ternyata kosong — dengan slug materi yang diharapkan, TIDAK
   ketemu, dan materi itu kembali dianggap "belum punya infografis".
6. Diperbaiki: `getInfografisSheet_()` sekarang **self-healing** — setiap
   kali dipanggil, membandingkan `INFOGRAFIS_HEADERS` di kode dengan header
   yang benar-benar ada di sheet, dan MENAMBAHKAN kolom yang kurang di
   UJUNG KANAN (bukan menyisipkan di tengah — itu akan menggeser semua data
   yang sudah ada). Tidak perlu campur tangan manual lagi untuk kolom baru
   apa pun ke depannya.
7. `setupInfografisSheet()` yang SEBELUMNYA menimpa baris header secara
   mentah (`setValues` di posisi kolom tetap) juga diperbaiki — itu
   berbahaya kalau dijalankan pada sheet yang sudah ada isinya dengan
   urutan kolom berbeda; sekarang cukup memanggil `getInfografisSheet_()`.

**Bug #3 — lightbox `galeri.html` kadang tampil layar gelap kosong**
1. Thumbnail grid di `galeri.html` sejak awal punya 2 kandidat URL cadangan
   (proxy Apps Script + 2 format hotlink Drive langsung) dengan `onerror`
   berantai — kalau kandidat pertama gagal, otomatis coba kandidat berikut.
2. Lightbox (dibuka saat gambar di grid diklik) TIDAK diberi rantai
   fallback yang sama — cuma mencoba 1 kandidat (proxy), tanpa `onerror`
   sama sekali. Kalau kandidat itu gagal untuk file tertentu, lightbox
   tampil kosong (cuma latar gelap + keterangan) walau thumbnail-nya di
   grid berhasil tampil (karena sempat "ketolong" kandidat cadangan).
3. `kelola-tp.html` ternyata punya bug SERUPA (thumbnail kartu materi juga
   cuma 1 kandidat, tanpa fallback) — karena logikanya waktu itu ditulis
   terpisah/diduplikasi, bukan dipakai bersama dari 1 sumber.
4. Diperbaiki: logika kandidat+fallback dipindah ke SATU file bersama baru,
   `pages/infografis/assets/infografis-shared.js`, dipakai `galeri.html`
   (termasuk lightbox-nya) DAN `kelola-tp.html` — mencegah duplikasi yang
   jadi sumber bug ini muncul dua kali secara terpisah.

**Jalur diagnosis yang sempat salah arah (bukan bug kode, tapi pelajaran
penting soal cara menguji)**
1. Guru diminta menguji proxy langsung: `APPS_SCRIPT_URL?infografisFoto=<id>`.
2. ID yang dipakai untuk uji coba ternyata diambil dari kolom **"ID"** di
   sheet (mis. `ig1786237265777356` — pengenal baris internal, dipakai
   tombol Hapus), BUKAN dari kolom **"URL Media"** (isinya ID Drive
   sesungguhnya, mis. `1ktRAVdLya7UJIDVRbS3AEMgMhVGQlPvm`).
3. `DriveApp.getFileById()` dipanggil dengan ID yang tidak pernah ada di
   Drive, melempar pesan generik yang membingungkan: *"Unexpected error
   while getting the method or property getFileById on object DriveApp"* —
   pesan ini TIDAK menyebut "file not found" secara eksplisit, sehingga
   sempat disangka bug struktural (dugaan awal: folder ada di Shared Drive,
   yang punya keterbatasan dikenal di `DriveApp` dasar).
4. Setelah dicek ke sheet aslinya (lihat kolom "URL Media" vs kolom "ID"),
   ternyata itu murni salah ID uji, bukan bug DriveApp/Shared Drive sama
   sekali — folder ternyata memang di My Drive biasa.
5. **Pelajaran**: kalau menguji proxy `?infografisFoto=`/`?foto=` secara
   manual, ID yang dipakai HARUS diambil dari kolom **"URL Media"/"URL
   Foto"** (ekstrak bagian setelah `id=` di URL-nya), BUKAN dari kolom
   **"ID"** (itu pengenal baris, formatnya kebetulan mirip tapi artinya
   beda total). Kalau ada pesan error "Unexpected error while getting the
   method or property X on object Y" dari `DriveApp`, curigai DULU salah
   ID sebelum menyimpulkan ada bug di layanan Drive-nya.

**Checklist regresi untuk ketiga bug + 1 pelajaran diagnosis ini:**
- [ ] Ulangi semua item checklist §26 di atas
- [ ] `simpanFotoKeDrive_()` di `Code.gs`: `setSharing()` ada di dalam
      try/catch TERPISAH dari `createFile()`, kegagalannya TIDAK melempar
      ulang ke pemanggil
- [ ] `getInfografisSheet_()` di `Code.gs` mengandung logika self-healing
      (bandingkan `INFOGRAFIS_HEADERS` vs `readHeaderRow_(sheet)`, tambah
      yang kurang di ujung kanan) — coba HAPUS 1 kolom uji coba dari sheet
      sungguhan (mis. duplikat sheet-nya dulu), panggil endpoint apa saja,
      pastikan kolom itu otomatis kembali muncul
- [ ] `pages/infografis/assets/infografis-shared.js` ada dan dipakai
      (`<script src="assets/infografis-shared.js">`, dimuat SEBELUM
      `infografis-galeri.js`/`infografis-kelola-tp.js`) di KEDUA
      `galeri.html` dan `kelola-tp.html` — bukan lagi logika terpisah
      berduplikasi di masing-masing file
- [ ] Saat menguji proxy manual, PASTIKAN ID yang dipakai diambil dari
      kolom "URL Media"/"URL Foto" (bukan kolom "ID") — dokumentasikan ini
      di instruksi ke guru setiap kali meminta pengujian manual proxy

---

### 28. Laporan Siswa (3 pintu: `pages/laporan-siswa.html` = landing,
`pages/laporan-siswa/mpls.html` = Pintu 1 AKTIF, `belajar-mandiri.html` =
Pintu 2 AKTIF untuk Materi Ajar (Modul masih "segera menyusul"),
`latihan-mandiri.html` = Pintu 3 AKTIF sejak sesi ini, belum dirilis)

> **Perubahan struktur**: sejak restrukturisasi 3-menu, `pages/laporan-siswa.html`
> BUKAN LAGI halaman laporan itu sendiri — sekarang cuma landing (menu 3
> pintu). Laporan MPLS yang sebelumnya di sini SEKARANG di
> `pages/laporan-siswa/mpls.html`. Item checklist di bawah yang dulu
> menyebut `pages/laporan-siswa.html` sebagai halaman laporan sudah
> disesuaikan ke `pages/laporan-siswa/mpls.html`.
>
> **Pintu 3 BEDA ARSITEKTUR dari Pintu 1/2** — Pintu 1/2 baca data lewat
> endpoint Apps Script (`?laporanSiswa=1`/`?progresMateri=1`, digerbang
> `wajibAksesLaporan_()` di SERVER). Pintu 3 baca `hasil_latihan` LANGSUNG
> dari Firestore di SISI KLIEN — gerbangnya Firestore Security Rules
> (`README.md` match `/hasil_latihan/{id}`), BUKAN `wajibAksesLaporan_()`.
> Konsekuensinya: pengujian "batas akses orangtua lewat server langsung"
> yang dipakai Pintu 1/2 (poin di bawah, panggil `APPS_SCRIPT_URL?...`
> manual) TIDAK RELEVAN untuk Pintu 3 — pengujian setaranya untuk Pintu 3
> adalah coba baca Firestore langsung (mis. lewat Firebase Console/DevTools
> dengan sesi login orang tua) dengan `namaSiswa` yang BUKAN anaknya.

- [ ] **Akun siswa DITOLAK di SEMUA 4 halaman** (landing + 3 pintu) — coba
      buka tiap URL langsung (bukan lewat kartu menu, yang memang
      disembunyikan): `pages/laporan-siswa.html`,
      `pages/laporan-siswa/mpls.html`, `.../belajar-mandiri.html`,
      `.../latihan-mandiri.html` → pesan "khusus guru & orang tua" tampil di
      SEMUANYA, TIDAK ada data siswa apa pun yang bocor ke layar manapun
- [ ] **Kartu menu di beranda** (`#card-laporan-siswa`, mengarah ke landing
      `pages/laporan-siswa.html`) TIDAK tampil untuk akun siswa; tampil
      untuk akun guru DAN akun orangtua
- [ ] **Landing (`pages/laporan-siswa.html`)**: setelah lolos gerbang akses,
      3 kartu menu tampil dan SEMUANYA bisa diklik langsung (TIDAK ada
      badge "Segera Hadir" di ketiganya lagi)
- [ ] **Pintu 3 — Latihan Mandiri Siswa (`latihan-mandiri.html`), akun
      guru**: buka halaman → muncul kolom cari + daftar SEMUA siswa; klik 1
      nama yang SUDAH PERNAH mengerjakan Uji Kemampuan → tampil kartu
      ringkasan (rata-rata skor terbaik, "N dari M TP tersedia sudah
      dicoba", total sesi), dikelompokkan per mapel (bisa dibuka/tutup),
      tiap TP menampilkan skor terbaik + jumlah percobaan + skor & tanggal
      percobaan terakhir
- [ ] **Pintu 3, siswa yang BELUM PERNAH mengerjakan Uji Kemampuan sama
      sekali**: pilih nama itu → tampil pesan "belum pernah mengerjakan
      Uji Kemampuan sama sekali", BUKAN halaman kosong/error/kartu 0%
- [ ] **Pintu 3, akun orangtua**: sama seperti Pintu 1/2 — 1 anak langsung
      tampil, 2+ anak tampil chip pilihan; laporan yang tampil HARUS cuma
      hasil TP yang benar-benar dikerjakan anak itu, bukan tercampur data
      siswa lain
- [ ] **Pintu 3 — batas akses orangtua (Firestore langsung, BUKAN lewat
      `APPS_SCRIPT_URL`)**: login sebagai orangtua, lewat DevTools Console
      coba jalankan query Firestore `hasil_latihan` dengan `namaSiswa` yang
      BUKAN anaknya sendiri → HARUS ditolak oleh Security Rules (error
      `permission-denied`), TIDAK BOLEH mengembalikan data siswa lain itu
- [ ] Data 1 siswa yang mengerjakan TP yang SAMA berkali-kali → cuma
      muncul 1 baris untuk TP itu (bukan baris duplikat per percobaan),
      "jumlah percobaan" bertambah dan "skor terbaik" mengambil nilai
      TERTINGGI dari semua percobaan (bukan cuma percobaan terakhir)
- [ ] Segera setelah siswa menyelesaikan 1 sesi baru di `uji-kemampuan.html`
      → buka Pintu 3 (guru/orangtua) untuk siswa itu → hasil terbaru SUDAH
      ikut terhitung TANPA perlu tunggu proses tambahan (baca langsung dari
      Firestore, bukan cache/rekap berkala)
- [ ] Klik "← Pilih siswa lain" di Pintu 3 → kembali ke daftar pilih siswa
      (guru) atau reset pilihan chip (orangtua), BUKAN nyangkut di laporan
      siswa sebelumnya
- [ ] TP yang ADA di `bank_soal`/`TP_KKO_INDEX` tapi BELUM PERNAH dicoba
      siswa itu TIDAK ditampilkan sebagai baris kosong di laporan (sengaja
      — lihat catatan desain di `latihan-mandiri.js`); cakupan keseluruhan
      tetap terlihat lewat angka "N dari M TP tersedia" di kartu ringkasan
- [ ] **Pintu 1 — MPLS (`pages/laporan-siswa/mpls.html`), akun guru**: buka
      halaman → muncul kolom cari + daftar SEMUA siswa; ketik sebagian nama
      → daftar tersaring; klik 1 nama → laporan siswa itu tampil (Profil,
      MPLS, Kognitif, Jurnal — bagian yang datanya kosong menampilkan
      "Belum ada data", BUKAN error/halaman kosong)
- [ ] **Pintu 1, akun orangtua dengan 1 anak**: buka halaman → laporan anak
      itu LANGSUNG tampil tanpa perlu memilih apa pun
- [ ] **Pintu 1, akun orangtua dengan 2+ anak** (field `anak` di Firestore
      berisi >1 nama): buka halaman → tampil pilihan chip nama-nama anak,
      klik 1 → laporan anak itu yang tampil
- [ ] **Pintu 2 — Perkembangan Belajar Mandiri (`belajar-mandiri.html`)**:
      buka 1 halaman materi ajar apa saja SAMBIL LOGIN SEBAGAI SISWA
      (bukan guru — pelacak SENGAJA cuma mencatat role siswa), tunggu
      beberapa detik, lalu cek sheet "Data Progres Materi" di spreadsheet
      → harus muncul/terbarui 1 baris untuk siswa+materi itu (Timestamp
      ter-update, BUKAN baris baru kalau materi yang sama dibuka lagi)
- [ ] Buka `belajar-mandiri.html` (guru atau orang tua), pilih siswa yang
      barusan membuka materi tsb → kartu ringkasan (X/Y materi, persentase)
      dan baris TP yang sesuai HARUS mencerminkan materi yang baru dibuka
      (progress bar bertambah, bukan tetap di angka lama)
- [ ] Login sebagai GURU, buka 1 materi ajar → cek sheet "Data Progres
      Materi" → TIDAK BOLEH ada baris baru untuk akun guru itu (pelacak
      cuma untuk role siswa)
- [ ] **PALING PENTING — batas akses orangtua, uji dari server langsung**:
      ambil `idToken` akun orangtua (mis. dari DevTools saat login), coba
      panggil manual
      `APPS_SCRIPT_URL?laporanSiswa=1&nama=<NAMA SISWA LAIN, BUKAN ANAKNYA>&idToken=<token>`
      DAN
      `APPS_SCRIPT_URL?progresMateri=1&nama=<NAMA SISWA LAIN, BUKAN ANAKNYA>&idToken=<token>`
      → **KEDUANYA HARUS DITOLAK** dengan pesan jelas ("tidak punya akses ke data
      siswa..."), BUKAN mengembalikan data siswa lain itu. Ini pengujian
      keamanan paling kritis di fitur ini — kalau ini gagal, data pribadi
      siswa LAIN bisa bocor ke orang tua yang salah.
- [ ] Panggil `APPS_SCRIPT_URL?laporanSiswa=1&nama=<siapa saja>` TANPA
      `idToken` sama sekali → harus ditolak, bukan malah dianggap "guru"
- [ ] (Regresi) Ulangi Skenario A/E (login & endpoint guru lain, mis.
      `?siswa=1`, `?all=1`) — pastikan refactor `verifikasiUser_()` tidak
      mengubah perilaku `wajibGuru_()` sama sekali (pesan error, kapan
      menolak/menerima — harus identik dengan sebelum refactor)
- [ ] Buka/tutup (collapse) tiap bagian laporan (MPLS/Kognitif/Jurnal) —
      status buka/tutup tidak reset saat pindah siswa dalam 1 sesi (sesuai
      desain, bukan bug kalau memang begitu — cukup pastikan tidak error)
- [ ] **Tombol "← Semua Laporan"** di topbar Pintu 1/2/3 mengarah balik ke
      landing (`../laporan-siswa.html`), BUKAN ke beranda langsung
- [ ] `pages/laporan-siswa/assets/laporan-guard.js` dimuat dengan
      `<script type="module" src="...">` (BUKAN inline lagi seperti versi
      pertama fitur ini) di SEMUA 4 halaman (landing + 3 pintu) — kalau ada
      halaman yang lupa memuatnya, `#checking` akan macet selamanya (tidak
      pernah hilang) karena tidak ada yang memicu `onAuthStateChanged`
- [ ] `pages/laporan-siswa/assets/laporan-picker.js` dimuat SEBELUM
      `laporan.js`/`belajar-mandiri.js` di `mpls.html` DAN
      `belajar-mandiri.html` — kalau lupa, `window.LaporanPicker` undefined
      dan halaman error diam-diam (cek Console browser)
- [ ] `materi-progress-tracker.js` benar-benar ada di SEMUA 81 file materi
      (bukan cuma sebagian) — jalankan `grep -rL "materi-progress-tracker"
      pages/materi --include="*.html"` dari terminal, harus KOSONG
      (`-L` = tampilkan file yang TIDAK mengandung teks itu)
- [ ] `findRowByTwoColumns_()` di `Code.gs` — coba buka 1 materi 2x sebagai
      siswa yang sama, cek sheet "Data Progres Materi": harus TETAP 1 baris
      untuk kombinasi siswa+materi itu (Timestamp yang berubah, bukan
      baris baru menumpuk)

### 29. Migrasi "Data Siswa" ke Firestore (`pages/kelas/`, `Code.gs`,
    RANCANGAN-MIGRASI-FIRESTORE.md — koleksi `siswa/{nisn}`, NISN = ID dokumen)
- [ ] Script Properties `SERVICE_ACCOUNT_EMAIL` & `SERVICE_ACCOUNT_KEY` sudah
      diisi di project Apps Script yang SAMA dengan yang men-deploy `Code.gs`
      ini (bukan project Apps Script lain) — tanpa ini `getServiceAccountToken_()`
      melempar error jelas, bukan gagal diam-diam
- [ ] **Uji regresi kritis**: edit 1 siswa yang SUDAH punya profil (mis. ganti
      foto/tempat lahir saja, JANGAN sentuh field NISN) → simpan → buka lagi
      → semua field lain (termasuk NISN) harus tetap sama, TIDAK ada yang
      hilang. Ini pola bug yang sama seperti §25/§27 (data diam-diam hilang
      saat field lain diedit)
- [ ] Isi NISN 10 digit yang diawali "0" (mis. `0169932726`) → simpan → buka
      lagi (klik dari Daftar Siswa Tersimpan) → nol di depan harus tetap
      tampil utuh (Firestore menyimpan string apa adanya, TIDAK ada lagi
      risiko format kolom seperti versi Sheets)
- [ ] **Koreksi NISN salah ketik**: simpan 1 siswa dengan NISN sengaja salah,
      lalu edit siswa yang sama dengan NISN yang benar → simpan → cek Firebase
      Console koleksi "siswa": dokumen LAMA (NISN salah) harus SUDAH TERHAPUS,
      cuma ada 1 dokumen (NISN benar) untuk siswa itu — TIDAK boleh ada 2
      dokumen nyangkut untuk 1 siswa yang sama
- [ ] **Impor NISN Massal**: tempel beberapa baris valid (nama sesuai roster
      25 siswa) + 1 baris nama yang SENGAJA salah ketik/tidak ada di roster →
      submit → baris valid masuk "berhasil diperbarui", baris nama salah
      masuk "tidak ditemukan" dengan alasan "Nama tidak ada di daftar 25
      siswa..." — TIDAK ada dokumen baru dibuat untuk nama salah ketik itu
      (cek langsung di Firebase Console)
- [ ] `doPostSiswaNisnBulk_()` DAN `doPostSiswa_()` tetap digerbang
      `wajibGuru_()` — coba panggil endpoint `type: "siswa"` atau
      `type: "siswa_nisn_bulk"` tanpa idToken guru yang valid → harus ditolak
      dengan pesan error, bukan diam-diam berhasil. **PENTING**: koleksi
      Firestore "siswa" dibaca/ditulis pakai kredensial Service Account yang
      MELEWATI Firestore Security Rules sepenuhnya — jadi gerbang `wajibGuru_`
      di `doPost()`/`doGet()` adalah SATU-SATUNYA lapisan proteksi untuk
      koleksi ini. Kalau ada endpoint baru menyentuh koleksi "siswa" tanpa
      gerbang ini, SIAPA PUN yang tahu URL Apps Script bisa baca/tulis SEMUA
      data siswa tanpa login sama sekali
- [ ] `migrasiSiswaKeFirestore_()` (dijalankan manual dari Apps Script Editor,
      BUKAN dari web app) — jalankan 2x berturut-turut dengan data sheet yang
      sama → hasil di Firestore harus tetap 25 dokumen (bukan 50, tidak
      terduplikasi) karena kunci dokumennya NISN, jalan ulang = menimpa
      dengan data yang sama

### 30. Endpoint Login Siswa `siswa_login` (`Code.gs`, Fase 2 login — dipakai
    dari UI login siswa yang akan dibangun di Fase 3, belum ada UI-nya)
- [ ] Kirim `{type:"siswa_login", nama:"<nama benar>", nisn:"<nisn benar>"}` →
      harus balas `{status:"ok"}`
- [ ] Kirim nama benar + NISN salah (atau sebaliknya) → harus balas
      `{status:"error", message:"Nama atau NISN tidak cocok..."}` — DAN pesan
      error-nya HARUS SAMA PERSIS baik nama yang salah, NISN yang salah,
      maupun keduanya (jangan sampai ada kebocoran info lewat beda pesan)
- [ ] Kirim NISN bukan 10 digit (mis. "123") → balas error format, BUKAN ikut
      dicoba dibaca ke Firestore
- [ ] **Endpoint ini SENGAJA tidak digerbang `wajibGuru_`** — pastikan tidak
      ada yang "memperbaikinya" jadi ikut menggerbang, karena itu justru akan
      merusak alur login siswa (siswa belum punya idToken sama sekali di
      titik ini)
- [ ] Cek responsnya TIDAK PERNAH menyertakan field lain (Nama Panggilan,
      Tempat Lahir, dst.) — cuma `status`/`message`, walau login berhasil

### 31. UI Login Siswa (`index.html`, Fase 3 login)
- [ ] Tab "Siswa" aktif secara default saat halaman pertama dibuka; klik tab
      "Guru & Orang Tua" pindah tampilan, klik lagi "Siswa" balik — pesan
      error di kedua form ikut kekosongkan saat pindah tab
- [ ] Dropdown nama berisi 25 nama (dari `MPLS_STUDENTS`), TIDAK kosong
- [ ] Login siswa dengan nama+NISN BENAR → berhasil masuk, "Halo, ‹nama›"
      tampil di topbar, TIDAK ada Panel Guru/Kelas/kartu Laporan Siswa yang
      kelihatan (harus tetap tersembunyi persis seperti akun siswa biasa)
- [ ] Login siswa dengan NISN SALAH → pesan error tampil di form Siswa
      (bukan form Guru), TIDAK ikut membuka aplikasi
- [ ] Setelah login siswa berhasil, klik "Keluar" → kembali ke layar login,
      **coba login lagi** langsung tanpa refresh → harus tetap bisa (bukan
      nyangkut di kondisi aneh dari sesi anonim sebelumnya)
- [ ] Tutup tab browser (bukan cuma klik Keluar) lalu buka lagi situsnya di
      tab baru → HARUS kembali ke layar login (sessionStorage kehapus saat
      tab ditutup) — kalau malah otomatis "Halo, ‹nama lama›" tanpa nama
      diisi ulang, berarti proteksi "sesi anonim nyasar" di
      `onAuthStateChanged` tidak jalan, cek lagi bagian `!namaSiswa` di sana
- [ ] Login guru/orang tua (tab satunya) masih berjalan normal seperti
      sebelumnya — regresi paling penting untuk dicek di sini

### 33. Pendaftaran & Persetujuan Orang Tua (Fase 4 — `daftar-orangtua.html`,
    `pages/admin.html` tab Persetujuan Orang Tua, aturan Firestore `users`)
- [ ] **WAJIB dulu**: aturan Firestore di Firebase Console SUDAH ditempel versi
      terbaru dari `README.md` (§🔒 Keamanan) — kalau belum, SEMUA uji di bawah
      ini akan gagal dengan error izin ditolak
- [ ] Buka `daftar-orangtua.html` → isi semua field wajib (nama ortu, pilih
      anak, email, password) TANPA WhatsApp → submit → harus tampil layar
      "Pendaftaran Terkirim"
- [ ] Coba login pakai email+password yang baru saja didaftarkan → HARUS
      tampil layar "Menunggu Persetujuan" (⏳), BUKAN masuk ke aplikasi
- [ ] Buka `pages/admin.html` sebagai guru → tab "Persetujuan Orang Tua" →
      pendaftaran tadi harus muncul di bagian "Menunggu Persetujuan" dengan
      nama, nama anak, email benar, dan "WhatsApp: (tidak diisi)"
- [ ] Klik "✓ Setujui" → pendaftaran pindah dari daftar "Menunggu" ke daftar
      "Sudah Disetujui"
- [ ] Login ulang pakai akun yang baru disetujui tadi → HARUS berhasil masuk
      ke aplikasi seperti orang tua biasa (cuma lihat kartu Laporan Siswa &
      Pengumuman, sesuai §32) — cek juga Laporan Siswa-nya menampilkan anak
      yang benar (field `anak` di dokumen)
- [ ] Daftar akun BARU LAGI (email lain) → di admin, klik "✕ Tolak" →
      pendaftaran pindah ke daftar "Ditolak"
- [ ] Coba login pakai akun yang ditolak tadi → harus tampil layar "Pendaftaran
      Ditolak" (✕), BUKAN masuk aplikasi maupun layar "Menunggu"
- [ ] **Uji regresi kritis eskalasi privilese**: buka DevTools Console di
      halaman `daftar-orangtua.html` SEBELUM klik Daftar, coba modifikasi
      request secara manual (atau baca kode) untuk mencoba kirim
      `role: "guru"` atau `role: "orangtua"` langsung alih-alih
      `"pending_orangtua"` → HARUS ditolak Firestore Rules (error permission-
      denied), BUKAN berhasil membuat akun guru/orangtua langsung tanpa
      persetujuan
- [ ] **Uji regresi Laporan Siswa**: sebelum akun disetujui (masih
      `pending_orangtua`), coba buka `pages/laporan-siswa.html` langsung lewat
      URL (kalau ada cara login sebentar sebelum status-screen redirect
      sempurna) → harus tetap ditolak, TIDAK boleh ikut lolos seperti bug lama
      (lihat catatan perbaikan di `laporan-guard.js`)
- [ ] Cabut akses orang tua yang sudah disetujui (tombol "Cabut Akses" di
      daftar "Sudah Disetujui") → coba login lagi dengan akun itu → harus
      tertolak (layar "Pendaftaran Ditolak"), TIDAK bisa masuk lagi sampai
      disetujui ulang
- [ ] **Uji regresi kritis — akun nyangkut** (bug nyata yang pernah terjadi):
      matikan sementara aturan Firestore (atau uji di kondisi rules belum ter-
      publish) supaya `setDoc()` gagal SETELAH `createUserWithEmailAndPassword`
      berhasil → harus muncul pesan error yang jelas (bukan pesan mentah) → coba
      daftar LAGI dengan email yang SAMA PERSIS → HARUS BISA (bukan muncul
      "email sudah terdaftar"), karena `deleteUser(cred.user)` di blok rollback
      harus sudah membersihkan akun Auth yang nyangkut dari percobaan pertama.
      Kalau regresi ini muncul lagi (percobaan kedua selalu gagal "email sudah
      terdaftar" walau percobaan pertama gagal), cek lagi apakah blok
      `try/catch` rollback di `daftar-orangtua.html` masih ada

### 32. Pembatasan Akses per Role (`index.html`, `role-guard.js`, 9 halaman
    induk, lihat CHANGELOG.md v0.11.0 — siswa hanya Modul/Materi/Galeri/Uji
    Kemampuan, orang tua hanya Laporan Siswa/Pengumuman, guru semuanya)
- [ ] Login sebagai **siswa** → di beranda HANYA kelihatan 4 kartu: Modul
      Pembelajaran, Materi Ajar, Galeri Visual, Uji Kemampuan (+ tetap tidak
      ada Panel Guru/Kelas/Laporan Siswa seperti biasa). Kartu lain (MPLS,
      CP/TP/ATP, Riwayat Latihan, Pengumuman, Jadwal) **harus hilang**, dan
      bagian "Pengumuman Terbaru" di bawah kartu juga ikut hilang
- [ ] Login sebagai **orang tua** → HANYA kelihatan kartu Laporan Siswa &
      Pengumuman (+ bagian "Pengumuman Terbaru"). Kartu lain (MPLS, CP/TP/ATP,
      Modul, Materi, Galeri, Uji Kemampuan, Riwayat Latihan, Jadwal) hilang
- [ ] Login sebagai **guru** → SEMUA kartu tetap kelihatan seperti sebelumnya,
      tidak ada yang hilang (guru tidak pernah dibatasi `terapkanAksesMenu_`)
- [ ] **Uji regresi kritis — panel "nyangkut" antar akun** (bug nyata yang
      pernah dilaporkan): di TAB YANG SAMA (jangan reload/tutup tab), login
      sebagai guru → pastikan Panel Guru & Panel Kelas kelihatan → klik Keluar
      → login sebagai orang tua (akun berbeda) → Panel Guru & Panel Kelas
      **HARUS TIDAK kelihatan** untuk orang tua ini. Coba juga urutan
      sebaliknya (orang tua/siswa dulu → logout → login guru) → panel guru
      harus tetap muncul normal untuk guru. Kalau regresi ini muncul lagi,
      cek apakah `sembunyikanPanelKondisional_()` masih dipanggil di paling
      awal `onAuthStateChanged` (sebelum kedua percabangan siswa/guru-orangtua)

### 34. Lupa Kata Sandi (Fase 5 — `index.html`, `sendPasswordResetEmail`)
- [ ] Dari tab "Guru & Orang Tua", klik "Lupa kata sandi?" → tab & form login
      hilang, muncul form khusus kirim tautan reset — klik "← Kembali ke
      halaman masuk" → balik ke tampilan login normal (tab-tab muncul lagi)
- [ ] Isi email akun guru/orangtua yang BENAR-BENAR terdaftar → klik "Kirim
      Tautan Reset" → pesan sukses generik muncul → cek inbox email itu (&
      folder Spam) → HARUS ada email reset password dari Firebase
- [ ] Isi email yang **TIDAK terdaftar sama sekali** → klik kirim → pesan yang
      muncul **HARUS SAMA PERSIS** dengan skenario email benar di atas (jangan
      sampai ada beda pesan yang membocorkan mana email yang terdaftar/tidak)
- [ ] Isi format email yang jelas tidak valid (mis. "asdf" tanpa @) → boleh
      muncul pesan beda ("Format email tidak valid") — ini bukan kebocoran
      privasi, cuma validasi format
- [ ] Klik tautan reset dari email yang diterima → ikuti alur bawaan Firebase
      (halaman ganti kata sandi) → set kata sandi baru → coba login pakai
      kata sandi baru itu di `index.html` → harus berhasil masuk normal
- [ ] Login guru/orang tua biasa (tanpa lewat "Lupa kata sandi?") masih normal
      seperti sebelumnya — regresi paling penting untuk dicek di sini juga
- [ ] **Uji penegakan sungguhan (bukan cuma kartu disembunyikan)**: sebagai
      siswa, coba buka LANGSUNG lewat URL (ketik manual di address bar, bukan
      klik kartu) salah satu dari: `pages/jadwal.html`, `pages/cp-tp-atp.html`,
      `pages/mpls/index.html` (via `pages/mpls/input.html`), `pages/info.html`,
      `pages/riwayat-latihan.html` → harus otomatis dilempar balik ke beranda
      dengan pesan "Kamu tidak punya akses ke halaman ini." — TIDAK boleh
      halaman aslinya sempat kelihatan
- [ ] Sebagai **orang tua**, coba buka langsung `pages/materi.html`,
      `pages/modul.html`, `pages/infografis.html`, `pages/uji-kemampuan.html`
      lewat URL → sama, harus ditolak & dilempar balik
- [ ] **Uji regresi kritis Uji Kemampuan**: login sebagai siswa → kerjakan 1
      set soal Uji Kemampuan sampai selesai → cek hasilnya BENAR-BENAR
      tersimpan dengan nama siswa yang benar (bukan "undefined"/kosong) — ini
      sempat jadi bug nyata karena kode lama baca ulang Firestore
      `users/{uid}` yang tidak ada untuk akun anonim, sudah diperbaiki pakai
      `e.detail.nama` dari `role-guard.js`, tapi WAJIB diuji ulang tiap ada
      perubahan di `uji-kemampuan.html`
- [ ] **Uji regresi kritis pelacak progres Materi**: login sebagai siswa →
      buka 1 materi ajar sampai selesai (scroll ke bawah / accordion sesuai
      materinya) → cek di Laporan Siswa Pintu 2 (atau langsung sheet/Firestore
      progres materi) progres siswa itu **benar-benar tercatat**. Ini juga
      sempat jadi bug nyata (fungsi lama diam-diam TIDAK PERNAH mengirim
      progres untuk akun anonim), sudah diperbaiki di
      `materi-progress-tracker.js` (cabang `user.isAnonymous` baca
      sessionStorage duluan sebelum coba Firestore)
- [ ] **Uji sesi per-tab siswa**: login sebagai siswa di 1 tab → **tanpa
      logout**, buka situs yang sama di TAB BARU pada browser yang sama →
      tab baru itu harus tampil layar login kosong (BUKAN otomatis ikut
      login sebagai siswa tadi) — DAN tab pertama harus TETAP dalam keadaan
      login (tidak ikut ter-logout gara-gara tab kedua). Ini menguji
      `setPersistence(auth, browserSessionPersistence)` di `doLoginSiswa()`
      — kalau regresi ini muncul lagi (tab kedua "mewarisi" sesi / tab
      pertama ikut ter-logout), berarti persistence session ini hilang/rusak

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
4. Coba akses URL `pages/admin.html` langsung di browser *(⏳ belum bisa diuji — halaman
   ini belum dibuat, masih di daftar "Direncanakan"; lewati langkah 4-5 untuk saat ini)*
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
5. → **Harapan:** siswa yang baru diisi muncul dengan badge level **7 kategori**, kategori kosong "-"
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

### Skenario O — Verifikasi Kunci Akses Server-side (v0.7.0)
> Bagian 1-2 bisa diuji otomatis (Playwright + stub Firebase SDK, sudah dilakukan Claude —
> lihat Log Ujicoba). Bagian 3 (uji negatif ke Apps Script SUNGGUHAN) **wajib manual**,
> karena butuh deployment nyata yang sudah di-reauthorize untuk `UrlFetchApp`.

**1) Alur normal — jalur kode akses (input)**
1. Buka `input.html`, masukkan kode akses benar, pilih siswa, simpan
2. → **Harapan:** tersimpan seperti biasa, tidak ada pesan error baru yang muncul

**2) Alur normal — jalur guru (Firebase)**
1. Login sebagai guru → buka `pages/kelas/index.html` → daftar siswa termuat, foto tampil
2. Tambah/ubah 1 data siswa (boleh tanpa ganti foto) → simpan → **Harapan:** tersimpan normal
3. Buka `rekap.html`, `rekap-kognitif.html`, `rekap-jurnal.html` → semua termuat normal
4. Buka salah satu `laporan*.html` untuk siswa berfoto → foto tampil

**3) Uji negatif — WAJIB dengan Apps Script sungguhan yang sudah di-deploy ulang**
1. Salin `APPS_SCRIPT_URL` dari `pages/mpls/assets/config.js`
2. Di tab **incognito/belum login sama sekali**, buka `<APPS_SCRIPT_URL>?all=1` langsung
   di address bar → **Harapan: `{"status":"error","message":"Sesi login guru tidak
   ditemukan..."}`, TIDAK ada field "data" berisi nilai siswa**
3. Ulangi untuk `?siswa=1`, `?allKognitif=1`, `?allJurnal=1` → semua harus balas error yang
   sama, bukan data
4. Buka `<APPS_SCRIPT_URL>?nama=<nama siswa asli>` (tanpa `&kode=`) → **Harapan: error, bukan
   data penilaian siswa tsb**
5. Ulangi langkah 4 dengan `&kode=SALAH` di akhir URL → **Harapan: tetap error**
6. Ulangi langkah 4 dengan `&kode=mpls2026` (atau kode yang sedang dipakai) di akhir URL →
   **Harapan: BERHASIL** dapat data (ini expected — kode akses memang bukan keamanan
   sesungguhnya, cuma mencegah pemanggilan tidak sengaja, sesuai desain awal proyek)
7. (Regresi) Ulangi Skenario J (foto) dari awal — pastikan proxy `?foto=` masih bisa
   diakses dari halaman `laporan.html`/`pages/kelas/` yang sudah login guru

---

### Skenario P — Kelola per TP di Galeri Visual (v0.10.0)
1. Login sebagai guru → beranda → kontainer Kelas → "🖼️ Kelola Galeri Visual"
2. Pilih TP "Menyimak · Informasi Penting dari Teks Aural" dari dropdown
3. Klik "Unggah Infografis" pada kartu Materi 1 → pilih 1 gambar dari galeri HP
4. → **Harapan:** thumbnail langsung tampil di kartu, tombol berubah jadi "Ganti Infografis", tombol "Hapus" muncul
5. **Refresh halaman (F5)**, pilih TP yang sama lagi
6. → **Harapan:** kartu Materi 1 TETAP menampilkan thumbnail & tombol Hapus (BUKAN kembali ke placeholder — lihat §27 Bug #2 kalau ini gagal)
7. Buka `pages/infografis/galeri.html?mapel=bahasa-indonesia`, klik gambar Materi 1
8. → **Harapan:** lightbox terbuka menampilkan gambarnya (BUKAN layar gelap kosong — lihat §27 Bug #3 kalau ini gagal)
9. Kembali ke `kelola-tp.html`, klik "Ganti Infografis" pada Materi 1 lagi, unggah gambar berbeda
10. → **Harapan:** cek sheet "Data Infografis" — jumlah baris untuk Materi 1 TETAP 1 (tertimpa, bukan bertambah); cek folder Drive — file lama pindah ke Trash

### Skenario Q — Progres Materi Ajar di Perkembangan Belajar Mandiri (belum dirilis)
1. Login sebagai **siswa**, buka salah satu halaman Materi Ajar (mis. Menyimak TP1 Materi 1)
2. Tunggu beberapa detik (tracker fire-and-forget, tidak ada indikator visual apa pun — itu memang disengaja)
3. Login ulang sebagai **guru**, buka Google Sheets → tab "Data Progres Materi"
4. → **Harapan:** ada 1 baris baru dengan Nama Siswa yang sesuai & Materi Slug yang cocok dengan materi yang dibuka tadi
5. Kembali ke situs → beranda → "Laporan Siswa" → "Perkembangan Belajar Mandiri" → cari siswa yang sama
6. → **Harapan:** kartu ringkasan menunjukkan 1 materi terhitung "sudah dibaca"; baris TP "Menyimak · ..." menunjukkan progress bar & angka X/Y yang sesuai
7. Buka LAGI materi yang SAMA sebagai siswa itu (kunjungan ke-2)
8. → **Harapan:** di sheet "Data Progres Materi", jumlah baris untuk siswa+materi itu TETAP 1 (Timestamp yang berubah, bukan baris baru)
9. Login sebagai **guru**, buka 1 halaman materi ajar apa saja
10. → **Harapan:** TIDAK ada baris baru di "Data Progres Materi" untuk akun guru itu (tracker cuma mencatat siswa)

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
| 2026-07-17 | 0.6.2 | Claude (Playwright, data uji) | ⚠️ Lulus dengan catatan | 5 file modul Jurnal yang sempat hilang sejak v0.5.0 dibangun ulang (§14 baru bisa diuji sungguhan pertama kali); simpulan otomatis di 3 modul kini menyerap catatan anekdot & kelengkapan data — diuji cetak 1 halaman A4 dengan data terpanjang+tidak lengkap (headless, tanpa Apps Script sungguhan). WAJIB: guru cek simpan/muat data jurnal ke sheet "Data Jurnal Aktivitas" sungguhan sebelum dipakai massal (Skenario I langkah 3-4 belum diuji dengan backend nyata) |
| 2026-07-19 | 0.7.0 | Claude (Playwright + unit test, tanpa Apps Script sungguhan) | ⚠️ Lulus dengan catatan | Kunci akses server-side: `wajibKodeAkses_()` & `wajibGuru_()` baru di `Code.gs` — 8 unit test logika (kode benar/salah/kosong, token valid/invalid/kedaluwarsa, role guru/bukan guru, dokumen users/{uid} hilang) semua lulus; 17 skenario Playwright (semua halaman yang memanggil endpoint MPLS/Kelas/foto, dengan stub Firebase SDK offline) mengonfirmasi `idToken`/`kode` benar-benar terkirim di setiap panggilan — semua lulus. **BELUM diuji**: Skenario O bagian 3 (uji negatif ke Apps Script SUNGGUHAN setelah redeploy) — WAJIB dilakukan manual sebelum dianggap aman, karena verifikasi `wajibGuru_()` memanggil Identity Toolkit & Firestore REST API sungguhan yang tidak bisa disimulasikan penuh dari sandbox. Celah residual yang SENGAJA belum ditutup: 3 kandidat fallback foto (hotlink Drive langsung) masih tidak diproteksi karena folder Drive di-share "anyone with link" — lihat komentar di `assets/js/foto-fallback.js` |
| 2026-07-20 | 0.7.1 | Claude (audit dokumen, tanpa perubahan kode aplikasi) | ⚠️ Lulus dengan catatan | Audit lanjutan: (1) rules Firestore README diverifikasi ke dokumentasi resmi Firebase — dikonfirmasi bug tabrakan aturan (rules di-OR-kan, wildcard `/{koleksi}/{id}` melumpuhkan `/users/{uid}`), sudah diperbaiki di README, **BELUM diuji dengan Firestore Rules Playground sungguhan** (perlu dilakukan manual di Firebase Console, dicatat sebagai item checklist baru); (2) audit isi `ANTIREGRESI.md` sendiri terhadap kode sungguhan menemukan 2 tempat checklist keliru soal jumlah kategori kognitif (bilang 5, sebenarnya 7 sejak v0.6.0) dan 1 tempat penjelasan grid laporan yang sudah basi sejak v0.6.2 — semua dikonfirmasi lewat `grep` langsung ke `mpls-kognitif-data.js`/`laporan-kognitif.html`, bukan tebakan. |
| 2026-07-20 | 0.8.0 | Claude (Playwright + stub Firestore in-memory, tanpa Firestore sungguhan) | ⚠️ Lulus dengan catatan | `admin.html` (panel CRUD Pengumuman/Modul/Bank Soal) & `modul.html` (tampil siswa) baru. 18 skenario Playwright: tambah/edit/hapus untuk ketiga jenis konten (semua lulus), radio jawaban benar di Bank Soal tersimpan sesuai teks pilihan yang dicentang (lulus), anti-XSS pada judul/pertanyaan dengan tag HTML (lulus, di-escape bukan dieksekusi), penolakan akses akun bukan-guru di `admin.html` (lulus), pengelompokan+pengurutan+filter mapel di `modul.html` untuk akun siswa (lulus). Screenshot layar sempit (360-375px) untuk kedua halaman, termasuk tab Bank Soal yang paling padat — tidak ada elemen terpotong. **BELUM diuji**: dengan Firestore project sungguhan (`kelas-v-2026`) — stub in-memory tidak bisa memvalidasi apakah Firestore Rules produksi (v0.7.1) benar-benar mengizinkan guru menulis ke koleksi `modul`/`bank_soal` seperti diharapkan; WAJIB dicoba manual sebelum dipakai guru beneran (lihat §16-17 checklist baru). |
| 2026-07-20 | 0.9.0 | Claude (Playwright + stub Firestore in-memory, tanpa Firestore sungguhan) | ⚠️ Lulus dengan catatan | `materi.html`, `bank-soal.html`, `info.html`, `cp-tp-atp.html`, `jadwal.html` baru + tab Materi di `admin.html`. 20 skenario Playwright baru (semua lulus): CRUD tab Materi, baca/tutup+lampiran di `materi.html`, alur kuis penuh di `bank-soal.html` (skor dihitung tepat, penandaan hijau/merah tepat, tombol terkunci setelah dinilai, ganti mapel mereset kuis), arsip penuh di `info.html`, dan pemastian `cp-tp-atp.html`/`jadwal.html` jujur menampilkan penanda "kerangka" (bukan konten karangan). 18 skenario lama (v0.8.0) dijalankan ulang untuk cek regresi dari tab Materi baru — semua tetap lulus (38 total). Ditemukan+diperbaiki sekalian: celah XSS kecil di atribut `href` untuk `url_file` di `modul.html`/`materi.html` (belum di-escape) — sekarang sudah di-escape. Cek overflow horizontal terprogram di 360px untuk 6 halaman baru — nol piksel di semuanya. **BELUM diuji**: dengan Firestore project sungguhan — sama seperti v0.8.0, checklist manual ada di §18-21. Konten `cp-tp-atp.html`/`jadwal.html` SENGAJA masih placeholder (bukan bug) — menunggu dokumen resmi dari sekolah. |
| 2026-07-21 | 0.9.1 | Claude (Playwright, audit penyempurnaan atas fitur sendiri) | ⚠️ Lulus dengan catatan | Penyempurnaan (bukan fitur baru): mapel wajib di Bank Soal, validasi pilihan duplikat, datalist mapel lintas-tab, peringatan format link, pengacakan pilihan jawaban tiap kuis, penanda "Belum dijawab" di Bank Soal. 12 skenario Playwright baru (semua lulus, termasuk memastikan input yang gagal validasi TIDAK ikut tersimpan — bukan cuma pesan errornya yang dicek). 38 skenario lama dijalankan ulang — semua tetap lulus (total 50). **BELUM diuji**: dengan Firestore project sungguhan (masih stub in-memory di semua sesi sampai sekarang) — checklist manual §16-22 makin menumpuk dan sebaiknya segera dijalankan sekali secara menyeluruh sebelum dipakai guru/siswa beneran, daripada terus menunda di tiap sesi. |
| 2026-07-21 | 0.9.2 | Claude (Playwright, bugfix dilaporkan pengguna) | ⚠️ Lulus dengan catatan | **Bugfix kritis dilaporkan pengguna**: data hasil MPLS tidak bisa dilihat setelah v0.7.0, padahal sudah deploy ulang. Akar masalah: 7 file (`rekap*.html`, `laporan*.html`, `kelas.js`) belum diperbarui membaca `status:"error"` dari server sejak gerbang akses v0.7.0 ditambahkan — error apa pun ditampilkan sebagai pesan generik "kemungkinan belum deploy" yang salah sasaran, atau (di `kelas.js`) ditelan diam-diam jadi "Belum ada siswa". Diperbaiki di ke-7 file: cek `status==="error"` lebih dulu, tampilkan `message` asli. 15 skenario Playwright baru (memaksa server mock membalas error, pastikan pesan asli tampil DAN pesan lama tidak tampil, plus 1 skenario regresi memastikan kasus deploy-lama-sungguhan tetap dapat pesan yang sesuai) — semua lulus. 82 skenario dari sesi-sesi sebelumnya dijalankan ulang — tidak ada regresi (total 97). Ditambahkan §23 (prinsip wajib cek status error di setiap pemanggil endpoint) dan §24 (panduan diagnostik langkah-demi-langkah) supaya kelas bug ini tidak terulang. **Catatan penting**: fix ini membuat pesan error terlihat JELAS, TAPI tidak serta-merta memperbaiki akar masalah akses yang pengguna alami (kalau memang ada masalah otorisasi/rules) — pengguna perlu redeploy sisi klien (bukan Apps Script) lalu baca pesan error yang baru muncul dan cocokkan dengan §24. |
| 2026-07-24 | 0.9.3 | Claude (Playwright, root-cause dari laporan pengguna v0.9.2) | ⚠️ Lulus dengan catatan | **Lanjutan bugfix v0.9.2** — pesan error asli yang baru terlihat ("Sesi login guru tidak ditemukan") menunjukkan akar masalah sebenarnya: race condition antara 2 listener Firebase Auth independen (`onAuthStateChanged` vs `onIdTokenChanged`) di `guru-guard.js` sejak v0.7.0, di mana `onIdTokenChanged` bisa menimpa `window.guruIdToken` jadi `null` tanpa error apa pun. Diperbaiki: `onIdTokenChanged` dihapus, diganti `window.getFreshGuruIdToken()` yang selalu baca `auth.currentUser` langsung; 7 file pemanggil endpoint guru diubah memakainya. 5 skenario Playwright baru (token terdaftar & benar, token BARU terambil setelah simulasi refresh SDK, cek statis `onIdTokenChanged` sudah tidak dipakai) — semua lulus. 88 skenario sebelumnya dijalankan ulang — tidak ada regresi. **Keterbatasan jujur**: race condition asli ini terjadi di timing async Firebase SDK SUNGGUHAN yang tidak direplikasi stub Playwright (stub memanggil listener secara sinkron) — pengujian di atas memvalidasi desain barunya lebih kokoh (satu sumber kebenaran), TAPI kepastian penuh bug ini teratasi baru didapat dari konfirmasi pengguna setelah dipakai nyata. Ditambahkan §25: kronologi lengkap + prinsip "jangan cache kredensial lewat 2 listener independen" + checklist regresi khusus (termasuk uji refresh token & reload berulang). |
| 2026-08-09 | 0.10.0 (belum dirilis) | Claude (bugfix dilaporkan pengguna, diuji langsung oleh pengguna dengan Apps Script sungguhan) | ✅ Dikonfirmasi pengguna | **Galeri Visual & Kelola per TP** (`pages/infografis/`) baru, ditemukan+diperbaiki 3 bug berbeda dari 1 laporan gejala ("gambar hilang setelah refresh") — kronologi lengkap di §27: (1) `setSharing()` gagal membuat upload dilaporkan gagal padahal file sudah tersimpan (kebijakan Workspace sekolah membatasi share publik) — diperbaiki, sharing publik dibuat non-fatal; (2) **akar masalah utama**: kolom "Materi Slug" diam-diam terbuang saat disimpan karena sheet "Data Infografis" sudah dipakai sebelum kolom itu ada di kode (`buildRowByHeaders_` mencocokkan berdasar nama kolom SHEET, bukan kode) — diperbaiki, `getInfografisSheet_()` kini self-healing; (3) lightbox `galeri.html` & thumbnail `kelola-tp.html` sama-sama cuma punya 1 kandidat URL tanpa fallback (beda dari grid yang sejak awal punya 2 cadangan) — diperbaiki, logika disatukan ke `infografis-shared.js`. Sempat ada 1 jalur diagnosis salah arah (ID sheet internal keliru dipakai sebagai ID Drive saat uji manual, sempat disangka bug Shared Drive) — dicatat sebagai pelajaran di §27, bukan bug kode. Dikonfirmasi **berhasil oleh pengguna langsung** setelah ketiga perbaikan + pembersihan 2 baris data lama yang terlanjur rusak strukturnya. |

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
- **Sejak v0.7.0**: setiap endpoint di `Code.gs` sekarang wajib `kode` (untuk endpoint
  input per-siswa) atau `idToken` (untuk endpoint guru/bulk). Kalau menambah endpoint
  BARU di `doGet`/`doPost`, jangan lupa panggil `wajibKodeAkses_(...)` atau
  `wajibGuru_(...)` di awal cabangnya — endpoint baru yang lupa digerbang akan kembali
  membuka celah yang sama seperti sebelum v0.7.0. `ACCESS_CODE_MPLS` di `Code.gs` harus
  selalu disamakan manual dengan `ACCESS_CODE` di `pages/mpls/assets/config.js`.
- **Sejak v0.10.0 (belum dirilis)**: konsekuensi dari prinsip "pencocokan kolom
  berdasarkan nama header di SHEET" (catatan v0.4.1 di atas) sekarang ditangani secara
  OTOMATIS, bukan cuma diandalkan sebagai aturan manual. `getSiswaSheet_()`/
  `getInfografisSheet_()` (dan pola yang sama sebaiknya diikuti kalau menambah sheet
  BARU lagi ke depannya) memeriksa header sheet yang benar-benar ada, dan menambahkan
  kolom yang kurang di UJUNG KANAN secara otomatis. Kalau menambah kolom baru ke
  `SISWA_HEADERS`/`INFOGRAFIS_HEADERS`/header array manapun di `Code.gs`, TIDAK perlu
  lagi migrasi manual di Google Sheets — cukup pastikan fungsi `getXxxSheet_()` yang
  bersangkutan memanggil pola self-healing ini (lihat §27 untuk kronologi lengkap kenapa
  ini penting: sebelum ada ini, kolom baru yang lupa disinkronkan manual membuat nilainya
  DIAM-DIAM TERBUANG saat disimpan, tanpa error apa pun).
- **PENTING — file materi HTML baru TIDAK OTOMATIS muncul di situs**: menambah file
  `.html` baru ke folder `pages/materi/{mapel}/` (langsung, atau lewat Claude/co-guru)
  TIDAK CUKUP — file itu TIDAK akan terlihat di `materi.html`, Galeri Visual
  (`kelola-tp.html`/`galeri.html`), ATAU laporan "Perkembangan Belajar Mandiri`
  (`belajar-mandiri.html`) sampai entrinya juga ditambahkan ke `pages/materi/assets/
  materi-index.js` — SEMUA bagian itu murni baca dari array ini, bukan memindai folder.
  **Kejadian nyata**: 33 file IPAS (mapel baru) dan 5 file Matematika ditambahkan
  langsung ke repo tanpa entri index — akibatnya IPAS sama sekali tidak bisa diakses
  dari situs padahal filenya sudah ada, dan progres Matematika di laporan tidak lengkap.
  **Checklist wajib tiap kali ada materi baru ditambahkan (oleh siapa saja, termasuk co-guru
  di luar sesi kerja dengan Claude)**: (1) tambah entri ke `materi-index.js` — SEMUA field
  wajib diisi (`mapel`, `mapelSlug`, `mapelColor`, `mapelIcon`, `icon`, `elemen`, `tp`,
  `tema`, `urutan`, `judul`, `ringkasan`, `status`, `file`); (2) pastikan file HTML materinya
  sendiri sudah memuat `<script src=".../assets/materi-progress-tracker.js"></script>`
  (cek cepat: `grep -rL "materi-progress-tracker" pages/materi --include="*.html"` dari
  terminal, harus KOSONG — kalau ada hasil, itu file yang lolos tidak terpasang tracker-nya);
  (3) kalau mapelnya BARU (belum pernah ada sebelumnya, seperti kasus IPAS), pastikan juga
  warna `--m-{mapelSlug}` sudah didefinisikan di `pages/materi/assets/materi.css` DAN
  entri mapel itu ada di `pages/infografis/assets/infografis-data.js` (kalau ingin
  Galeri Visual-nya juga aktif untuk mapel itu).
- **PENTING — cek DUPLIKAT entri di `materi-index.js`, bukan cuma entri yang hilang**:
  kelas bug terpisah dari catatan di atas. Catatan sebelumnya soal IPAS menutup kasus
  "file ada di repo tapi TIDAK terdaftar" (UNREGISTERED) — tapi belum pernah ada
  pengecekan untuk arah sebaliknya: **satu entri yang sama tersalin DUA KALI** di array.
  **Kejadian nyata**: saat menggabungkan beberapa ZIP materi Pendidikan Pancasila (dikirim
  terpisah per-TP lewat beberapa sesi kerja) menjadi satu repo, satu entri
  (`pancasila/uud1945-tp2/04-...-inti.html`) tersalin persis identik dua kali secara
  manual — array sempat punya 182 entri padahal seharusnya 181, dan `urutan: 4` muncul
  dua kali dalam TP yang sama. Baru ketahuan lewat audit terprogram, bukan baca manual.
  **Checklist wajib setiap kali beberapa ZIP/potongan `materi-index.js` digabung manual
  ke satu repo** (baik oleh Arif langsung maupun co-guru): jalankan pengecekan duplikat
  berikut dari terminal (Node.js) sebelum push —
  ```js
  const fs=require('fs'); global.window={};
  eval(fs.readFileSync('pages/materi/assets/materi-index.js','utf8'));
  const idx=window.MATERI_INDEX;
  const fileMap={}; idx.forEach((e,i)=>{ (fileMap[e.file]=fileMap[e.file]||[]).push(i); });
  const dups=Object.entries(fileMap).filter(([f,ix])=>ix.length>1);
  console.log('Total entri:', idx.length, '| Duplikat file path:', dups.length);
  dups.forEach(([f,ix])=>console.log('  DUPLIKAT:', f, 'di index', ix));
  ```
  Harus menampilkan `Duplikat file path: 0` — kalau ada hasil, hapus salinan yang
  berlebih sebelum push ke GitHub. Pengecekan ini SEKARANG bagian resmi dari workflow
  validasi konten (lihat `SERAH_TERIMA_PROYEK.md` bagian internal Claude — dokumen
  terpisah, bukan bagian dari repo publik ini — §5 langkah 1b).

### 35. Sistem Level, EXP, Rank & Badge Uji Kemampuan (`apps-script/Code.gs`,
`pages/uji-kemampuan.html`, `pages/profil-siswa.html`, `pages/papan-peringkat.html`,
`pages/materi/assets/materi-progress-tracker.js`, `assets/img/badges/`, koleksi
Firestore `level_siswa` — Fase 1-5 SEMUA sudah dibangun, belum dirilis)

> **Cakupan sampai fase ini**: DUA sistem gamifikasi paralel yang jangan
> sampai tertukar saat menguji:
> 1. **Level Kemampuan** (dasar/menengah/atas/mahir) — indikator PENGUASAAN,
>    ketat, dari Fase 1. Field Firestore: `level`, `progress`, `butuhLulus`,
>    `mahirTercapai`.
> 2. **Level 1-99 & Rank** (Perintis→Maestro Kelas 5) — indikator
>    KEAKTIFAN, dari EXP, dari Fase 5. Field Firestore: `level99`, `rank`,
>    `level99Maksimal`, `expProgresLevelIni`, `expDibutuhkanLevelBerikutnya`.
>
> Keduanya SAMA-SAMA ada di 1 dokumen `level_siswa/{namaSiswa}`, ditampilkan
> sebagai 2 KARTU TERPISAH di `profil-siswa.html` (dengan judul jelas beda),
> dan Papan Peringkat SEKARANG dikelompokkan per **Rank** (bukan Level
> Kemampuan lagi) — Level Kemampuan cuma jadi tag kecil di tiap baris.
>
> **Perhatian khusus**: endpoint Apps Script berganti nama dari `hitung_level`
> jadi **`hitung_gamifikasi`** di Fase 3 (cakupannya sudah lebih luas dari
> sekadar level) — kalau pernah lihat referensi lama ke `hitung_level` di
> versi Code.gs yang ter-deploy, itu tandanya deploy-nya belum yang terbaru.
>
> **Keputusan desain kunci** (kalau lupa kenapa dibuat begini, baca CHANGELOG.md):
> level GLOBAL (bukan per-TP/per-mapel), dihitung ulang PENUH dari `hasil_latihan`
> tiap dipanggil (bukan counter tersimpan), gagal TIDAK mereset hitungan progres,
> dan — PALING PENTING — **dihitung di server (Apps Script), BUKAN di klien**,
> supaya siswa tidak bisa menaikkan levelnya sendiri lewat DevTools.

- [ ] **Setup Firebase Console WAJIB sebelum uji apa pun di sini**: Security Rules
      (`firestore.rules`) sudah dipublikasikan ulang dengan blok `match
      /level_siswa/{namaSiswa}` (`allow read: if request.auth != null; allow write:
      if false;`) — cek di Firebase Console → Firestore → Rules, BUKAN cuma di repo
- [ ] Login siswa, kerjakan 1 kuis Uji Kemampuan apa saja sampai selesai & skor
      tersimpan (label "✓ Hasil tersimpan" muncul) → **beberapa saat kemudian**
      (bukan instan, ada jeda panggilan ke Apps Script) muncul kotak ungu di
      bawah skor bertuliskan "Level saat ini: Dasar — progres N/3 menuju level
      berikutnya (perlu skor >90%)"
- [ ] Kerjakan kuis dengan skor **> 90%** sampai 3 KALI (boleh TP/mapel apa saja,
      boleh diselingi kuis dengan skor rendah di antaranya) → pada kuis ke-3 yang
      lulus, kotak berubah warna HIJAU: "🎉 Selamat! Level naik jadi Menengah."
- [ ] Setelah naik ke Menengah, kerjakan kuis skor RENDAH (mis. 40%) → kotak
      status TETAP menunjukkan progres Menengah yang belum berubah (mis. "0/3"
      kalau belum ada yang lulus di level baru) — BUKAN error, BUKAN turun level,
      BUKAN progres berkurang. Ini pengujian paling penting dari keputusan "gagal
      tidak mereset" — kalau ternyata malah reset atau turun level, ada bug
- [ ] Buka Firebase Console → Firestore → Data → koleksi `level_siswa` → cari
      dokumen dengan ID nama siswa yang tadi diuji → field `level`, `progress`,
      `totalKuisDikerjakan`, `skorTertinggi`, `rataRataSkor` HARUS sesuai dengan
      riwayat kuis yang sebenarnya dikerjakan siswa itu di `hasil_latihan`
- [ ] **Uji keamanan (paling penting)**: masih login sebagai siswa, buka
      DevTools → Console → coba jalankan langsung lewat Firebase JS SDK
      `setDoc(doc(db,"level_siswa","<nama saya>"), {level:"mahir", ...})` (atau
      cara lain menulis langsung ke koleksi ini) → HARUS ditolak Security Rules
      (`permission-denied`), TIDAK BOLEH berhasil menimpa levelnya sendiri
- [ ] Uji kegagalan jaringan (mis. matikan koneksi internet sesaat sebelum klik
      "Periksa Jawaban", nyalakan lagi setelah beberapa detik): skor kuis TETAP
      tersimpan & tampil normal, kotak status level BOLEH tidak muncul sama
      sekali (silent fail, sesuai desain) — TAPI TIDAK BOLEH ada pesan error
      yang terlihat siswa akibat gagalnya panggilan hitung level ini
- [ ] Siswa yang levelnya sudah Mahir + sudah tercapai (1x lulus >75% di level
      itu) → kotak status berubah jadi "🏆 Level Mahir — capaian tertinggi sudah
      diraih!" untuk SEMUA kuis berikutnya (bukan lagi progres N/M), berapa pun
      skor kuis selanjutnya (termasuk yang jelek)

**Halaman Profil Siswa** (`pages/profil-siswa.html`, kartu menu "Profil & Level")
- [ ] Akun **guru** dan **orang tua** TIDAK melihat kartu menu ini di beranda
      (data-akses="siswa" saja) — dan kalau buka URL-nya langsung, ditolak
      guard (dilempar balik ke beranda), BUKAN ditampilkan datanya
- [ ] Siswa yang BELUM PERNAH mengerjakan Uji Kemampuan sama sekali (dokumen
      `level_siswa` belum ada) → tampil pesan ramah "belum punya data level"
      dengan tautan ke Uji Kemampuan, BUKAN halaman kosong/error di konsol
- [ ] Siswa yang SUDAH pernah mengerjakan kuis → kartu level besar tampil
      dengan warna & ikon SESUAI level saat ini (Dasar abu-abu 🌱, Menengah
      biru 🌿, Atas emas 🌳, Mahir ungu 🏆), bar progres terisi sesuai
      `progress/butuhLulus`, dan 4 kartu statistik (kuis dikerjakan, total
      lulus, skor tertinggi, rata-rata) menampilkan angka yang MASUK AKAL
      dibanding riwayat kuis sungguhan siswa itu di `hasil_latihan`
- [ ] Siswa dengan level Mahir + `mahirTercapai: true` → kartu level
      menampilkan lencana "🏆 Capaian puncak sudah diraih — level tertinggi!"
      (BUKAN bar progres kosong/aneh)
- [ ] Daftar "Riwayat Kenaikan Level" menampilkan SEMUA momen naik level
      (bukan cuma yang terakhir), urut dari yang TERBARU di atas, masing-
      masing dengan tanggal & skor yang benar
- [ ] Segera setelah siswa naik level di `uji-kemampuan.html` (lihat kotak
      "🎉 Level naik!") → buka halaman Profil & Level → perubahan itu SUDAH
      tercermin (baca langsung dari Firestore, tidak ada cache/jeda berarti)

**EXP (Fase 3)**
- [ ] **Uji regresi bug yang sudah diperbaiki** — kerjakan 3 kuis skor >90%
      berturut-turut sampai naik level (kotak "🎉 Level naik!" muncul) →
      kerjakan 1 kuis LAGI setelahnya (skor berapa saja) → kotak HARUS
      kembali ke tampilan progres biasa ("Level saat ini: ..."), **BUKAN**
      menampilkan "🎉 Level naik!" lagi. Ini pengujian paling penting di
      bagian EXP — kalau muncul lagi, bug lama yang sudah diperbaiki kambuh.
- [ ] Baca 1 materi Bahasa Indonesia sampai tuntas (scroll ke bawah / apa
      pun pemicu `materi-progress-tracker.js` di materi itu) → buka Profil
      & Level → angka "Materi Dibaca" & "Total EXP" bertambah 10 dibanding
      sebelumnya (tanpa perlu mengerjakan kuis apa pun dulu)
- [ ] Baca materi YANG SAMA 2 kali (buka lagi materi yang sudah pernah
      dibaca) → EXP dari materi TIDAK bertambah lagi (tetap 1 materi = 10
      EXP, bukan dobel — karena progres materi upsert per Nama+Slug, bukan
      log tiap kunjungan)
- [ ] Kerjakan 1 kuis dengan skor **di bawah 70%** → EXP bertambah **+5**
      saja (bukan +15) — tidak dapat bonus kelulusan
- [ ] Kerjakan 1 kuis dengan skor **≥70%** → EXP bertambah **+15** (+5 dasar
      + 10 bonus lulus)
- [ ] Total EXP di kartu level & di kartu statistik "Total EXP" HARUS SAMA
      PERSIS (2 tempat, 1 sumber data) — kalau beda, ada bug tampilan

**Papan Peringkat** (`pages/papan-peringkat.html`, kartu menu "🏅 Papan Peringkat")
- [ ] Akun **siswa** dan **guru** SAMA-SAMA bisa buka halaman ini (beda dari
      Profil & Level yang siswa-only) — akun **orang tua** TETAP ditolak
- [ ] **SEMUA 25 nama siswa muncul**, termasuk yang belum pernah mengerjakan
      apa pun sama sekali (label "Belum mulai", BUKAN "0 EXP", BUKAN hilang
      dari daftar) — cek jumlah nama yang tampil = 25 kalau dijumlah semua
      tier, kalau kurang berarti ada nama yang tidak ke-mapping dengan benar
- [ ] Dikelompokkan per tier (Mahir → Atas → Menengah → Dasar dari atas ke
      bawah), di dalam 1 tier diurutkan EXP dari besar ke kecil
- [ ] Login sebagai **siswa** → baris nama SENDIRI disorot ungu + tulisan
      "← Ini kamu!" — baris siswa LAIN tidak disorot
- [ ] Login sebagai **guru** → TIDAK ADA baris yang disorot "Ini kamu!"
      (guru tidak punya level/EXP)
- [ ] Siswa yang baru saja naik level/dapat EXP baru (habis kerja kuis/baca
      materi) → buka Papan Peringkat → posisinya SUDAH pindah tier/urutan
      sesuai data terbaru (baca langsung dari Firestore, bukan cache basi)
- [ ] Ganti 1 nama di `MPLS_STUDENTS` (`pages/mpls/assets/mpls-data.js`,
      simulasikan mis. siswa pindah sekolah diganti nama baru) → Papan
      Peringkat ikut menampilkan nama yang sudah diperbarui (sumber
      namanya SATU tempat, tidak nyangkut versi lama)

**Level 1-99, Rank & Badge (Fase 5)**
- [ ] Buka `profil-siswa.html` → **2 kartu terpisah** tampil dengan judul
      jelas beda: "Rank & EXP — dari keaktifan belajar" (di atas) dan
      "Level Kemampuan — dari konsistensi lulus Uji Kemampuan" (di bawah)
      — pastikan TIDAK tertukar/ketampil cuma 1
- [ ] Kartu Rank menampilkan **gambar badge asli** (bukan ikon emoji) sesuai
      rank siswa saat ini, nama rank, "Level N dari 99", dan bar progres
      EXP menuju level berikutnya — gambar badge HARUS benar-benar muncul
      (bukan ikon gambar rusak/404 — cek path `assets/img/badges/*.webp`
      ada di server)
- [ ] Siswa dengan EXP pas di batas transisi rank (mis. tepat di Level 16,
      awal Penjelajah) → badge & nama rank yang tampil SESUAI Level 16
      (Penjelajah), bukan Level 15 (Perintis) — cek 1-2 titik transisi
      manual kalau memungkinkan (Level 15/16, 30/31, 50/51, 70/71, 90/91)
- [ ] Siswa dengan EXP ≥7.215 (Level 99 tercapai) → kartu Rank menampilkan
      "🎉 Level 99 tercapai — puncak rank tertinggi!" (BUKAN bar progres
      kosong/pembagian dengan nol/tampilan aneh)
- [ ] Buka `papan-peringkat.html` → pengelompokan SEKARANG per **Rank**
      (Maestro Kelas 5 di atas → Perintis di bawah), BUKAN lagi per Level
      Kemampuan — header tiap grup menampilkan gambar badge asli
- [ ] Tiap baris siswa (kecuali yang "Belum mulai") menampilkan **tag kecil
      Level Kemampuan** (mis. "🌿 Lv.18") di sebelah EXP — informasi ini
      TIDAK hilang, cuma bukan pengelompokan utama lagi
- [ ] Total siswa yang tampil di SEMUA grup Rank dijumlah = 25 (sama seperti
      pengecekan di Fase 4, cuma sekarang per Rank bukan per Level
      Kemampuan)

---

### 36. Uji Kemampuan: soal disesuaikan otomatis dengan Level Kemampuan
(`pages/uji-kemampuan.html`, belum dirilis — belum pernah diuji live)

Menyambungkan Level Kemampuan (§35 Fase 1) ke soal yang benar-benar diterima
siswa. Sebelum fitur ini, level dihitung tapi soal tetap acak dari SELURUH
pool TP tanpa peduli `kompleksitas`.

**Skema & pemetaan (JANGAN diubah tanpa alasan kuat, sudah diputuskan
eksplisit oleh pemilik proyek):**
- `kompleksitas` bank_soal TETAP 3 nilai: `dasar`/`menengah`/`menantang`.
  TIDAK ditambah jadi 4 walau Level Kemampuan punya 4 tingkat.
- Pemetaan: Level Dasar → soal `dasar`. Level Menengah → soal `menengah`.
  Level **Atas MAUPUN Mahir** → soal `menantang` (2 level kemampuan berbagi
  1 kompleksitas soal, disengaja).
- Rantai fallback kalau pool kurang dari 5 soal: `menantang → menengah →
  dasar`. Kalau bahkan `dasar` juga < 5, TP dinonaktifkan total.
- Level Kemampuan yang dipakai untuk memilih soal tetap GLOBAL (1 siswa = 1
  level utk semua mapel/TP), TIDAK dihitung per-TP/mapel — konsisten dengan
  desain sejak Fase 1.

**Uji manual yang WAJIB dilakukan sebelum fitur ini dianggap aman:**
- [ ] Login sebagai siswa BARU (belum pernah mengerjakan kuis apa pun,
      belum punya dokumen `level_siswa`) → buka Uji Kemampuan → pilih mapel
      apa saja → banner di atas daftar TP menampilkan "Level kemampuanmu
      saat ini: **Dasar**" (default aman untuk siswa baru)
- [ ] Siswa level Dasar mengerjakan TP yang pool-nya campuran dasar+menengah
      (seperti contoh 200 soal aljabar-tp1: 45 dasar + 155 menengah) → soal
      yang muncul HARUS semua bertanda `kompleksitas: "dasar"` (cek lewat
      `console.log` sementara atau field `kompleksitasSoal` di hasil
      tersimpan), BUKAN tercampur dengan soal menengah
- [ ] Siswa level Menengah mengerjakan TP yang sama → soal yang muncul HARUS
      semua `kompleksitas: "menengah"`
- [ ] Siswa level Mahir (atau Atas) mengerjakan TP yang BELUM punya soal
      `menantang` sama sekali (seperti contoh aljabar-tp1 di atas) → kartu TP
      menampilkan catatan fallback ("⚠ Soal tingkat Menantang untuk TP ini
      belum tersedia — kamu akan mendapat soal tingkat Menengah dulu"), soal
      yang muncul HARUS `kompleksitas: "menengah"` (bukan dasar, karena
      menengah cukup ≥5), dan catatan senada juga tampil di subjudul layar
      kuis
- [ ] TP dengan pool soal < 5 di SEMUA tingkat (termasuk dasar) → kartu TP
      tidak bisa diklik (disabled), pesan menyebutkan jumlah pool total
- [ ] Akun **guru** membuka Uji Kemampuan → muncul dropdown "Mode guru —
      tampilkan soal tingkat" di Tahap 1 yang TIDAK muncul untuk siswa
- [ ] Guru dengan pilihan default "Semua tingkat" → perilaku PERSIS seperti
      sebelum fitur ini ada (hitung pool pakai aggregation query, soal
      diambil pakai trik randKey lama, TIDAK difilter kompleksitas sama
      sekali) — termasuk soal LAMA yang belum ditandai `kompleksitas` tetap
      ikut muncul
- [ ] Guru ganti dropdown ke "Menantang" pada TP yang belum ada soal
      menantang-nya → kartu TP disabled dengan pesan pool kurang (BUKAN
      fallback turun tingkat — mode guru manual sengaja tanpa fallback)
- [ ] Guru ganti dropdown lalu KEMBALI ke "Semua tingkat" → grid TP di-refresh
      dan kembali ke perilaku lama dengan benar (cache `poolSoalTpCache`
      tidak nyangkut dari pilihan sebelumnya)
- [ ] Selesaikan 1 kuis sebagai siswa → dokumen baru di `hasil_latihan` (cek
      lewat Riwayat Latihan / Firestore Console) punya field
      `kompleksitasSoal` berisi tingkat yang benar-benar dipakai sesi itu
- [ ] Selesaikan 1 kuis lewat mode guru "Semua tingkat" → dokumen
      `hasil_latihan`-nya punya `kompleksitasSoal: null` (bukan error/hilang)
- [ ] Level naik di tengah sesi pemakaian (mis. siswa baru saja naik dari
      Dasar ke Menengah) → **buka ulang** halaman Uji Kemampuan (bukan cuma
      kembali ke Tahap 1 tanpa reload) → banner & soal yang ditawarkan sudah
      memakai level BARU (level dibaca sekali saat halaman dimuat via event
      `role-verified`, BUKAN reaktif live — ini perilaku yang diharapkan,
      bukan bug, tapi perlu dikonfirmasi tidak membingungkan di praktiknya)

**Catatan arsitektur penting untuk sesi lanjutan:**
- Query ke `bank_soal` di jalur baru SENGAJA cuma pakai 1 filter kesetaraan
  (`tp == X`), lalu kelompokkan per `kompleksitas` DI KLIEN — BUKAN
  `where("tp","==",X).where("kompleksitas","==",Y)` — supaya TIDAK butuh
  composite index Firestore baru (2 filter kesetaraan field berbeda WAJIB
  composite index, sudah diverifikasi lewat pencarian dokumentasi Firestore).
  Pola ini sama dengan pengelompokan modul per mapel di klien (§16). **Kalau
  ada sesi mendatang ingin "mengoptimalkan" jadi query gabungan di server,
  INGAT alasan ini dulu** — perlu composite index manual di Firebase Console
  kalau mau diubah.
- Konsekuensinya: setiap kali grid TP dirender (Tahap 2), SELURUH pool soal
  TP itu diunduh (bukan cuma dihitung) untuk role siswa/guru-manual. Untuk
  ukuran pool saat ini (puluhan-ratusan dokumen kecil per TP) ini tidak
  masalah, tapi kalau pool per TP membengkak sampai ribuan dokumen di masa
  depan, ini perlu ditinjau ulang (mis. kembali ke aggregation count + hanya
  unduh penuh saat kuis benar-benar dimulai, dengan query per-kompleksitas
  yang butuh composite index).
- Soal LAMA tanpa field `kompleksitas` (undefined) TIDAK match ke tingkat
  manapun di jalur baru — otomatis tersembunyi dari siswa, cuma kelihatan
  lewat mode guru "Semua tingkat". Kalau ada laporan "TP ini dulu bisa diuji
  siswa, sekarang kartunya disabled", cek dulu apakah soal-soal di TP itu
  sudah punya tag `kompleksitas` di `bank-soal.html`.

---

### 37. Panel Admin: filter tab Uji Kemampuan & penghapusan tab Materi Ajar
(`pages/admin.html`, belum dirilis — belum pernah diuji live)

**Bagian A — Filter & tampilan Cari/Edit Soal:**
- `allSoalItems` adalah variabel global hasil 1x `getDocs(collection(db,
  "bank_soal"))` di `loadSoal()`. Filter (`renderSoalList()`) MURNI menyaring
  array ini di klien — TIDAK ada query Firestore baru tiap dropdown filter
  berubah. Kalau ada penambahan/penghapusan soal, `loadSoal()` dipanggil ulang
  (lihat `simpanSoal()`, `hapusSoal()`) supaya `allSoalItems` ikut ter-refresh.
- Filter yang dipakai `renderSoalList()` (`#filter-soal-mapel`,
  `#filter-soal-tp`, `#filter-soal-kompleksitas`, `#filter-soal-jenis`,
  `#filter-soal-cari`) adalah SET DROPDOWN TERPISAH dari dropdown form tambah/
  edit (`#soal-mapel`, `#soal-tp`, dst.) — JANGAN disatukan, keduanya punya
  fungsi berbeda (menyaring tampilan vs. mengisi data soal yang disimpan).
- Ringkasan progres pool (`#soal-pool-summary`, target 200 soal/TP) SELALU
  dihitung dari `allSoalItems` LENGKAP, tidak terpengaruh filter — supaya guru
  tetap lihat gambaran keseluruhan pool walau sedang menyaring satu TP/tingkat.
- Form "Tambah Soal Baru" (`#soal-form-wrapper`) disembunyikan (`class="hidden"`)
  secara default. `editSoal()` membuka wrapper ini (`.classList.remove
  ("hidden")`) sebelum scroll — `batalEditSoal()` menutupnya lagi. Tombol
  toggle manual `#toggle-form-soal-btn` (`toggleFormSoal()`) label teksnya
  harus konsisten dgn state (➕ Tambah Soal Manual ↔ ▲ Sembunyikan Form).

**Uji manual yang WAJIB dilakukan:**
- [ ] Buka tab Uji Kemampuan → form tambah soal TERTUTUP default, daftar soal
      (dengan filter di atasnya) langsung terlihat
- [ ] Pilih Mapel di filter → dropdown TP filter otomatis terisi cuma TP mapel
      itu, daftar soal ikut menyempit ke mapel itu saja
- [ ] Pilih TP tertentu + Kompleksitas "Menengah" → hanya soal TP itu dengan
      kompleksitas menengah yang tampil, label "Menampilkan X dari Y soal"
      akurat
- [ ] Ketik teks di kotak pencarian (mis. sebagian kalimat soal) → daftar
      menyempit ke soal yang pertanyaannya mengandung teks itu (tidak case
      sensitive)
- [ ] Klik "↺ Reset Filter" → semua dropdown & kotak pencarian kembali ke
      default, daftar kembali menampilkan semua soal
- [ ] Klik "Edit" pada salah satu soal → form OTOMATIS terbuka (tidak perlu
      klik tombol toggle dulu), ter-scroll ke form, terisi data soal yang benar
- [ ] Setelah edit selesai & klik "Batal Edit" (atau berhasil "Update Soal") →
      form kembali tertutup otomatis, tombol toggle kembali ke label
      "➕ Tambah Soal Manual"
- [ ] Klik manual "➕ Tambah Soal Manual" tanpa mengedit apa pun → form terbuka
      kosong (mode tambah baru), toggle jadi "▲ Sembunyikan Form"
- [ ] Impor massal 200 soal contoh (`soal-aljabar-tp1-simbol-sama-dengan-200.json`)
      lewat tab Impor Massal → kembali ke tab Uji Kemampuan → filter Mapel
      Matematika + TP aljabar-tp1 → 200 soal (45 dasar + 155 menengah) semua
      kelihatan & bisa diedit satu per satu
- [ ] Soal LAMA yang belum ditandai `kompleksitas` (kalau ada) → badge
      kompleksitasnya menampilkan "⚠ belum ditandai", bukan "-" atau kosong

**Bagian B — Penghapusan tab Materi Ajar:**
- Koleksi Firestore `materi` (ditulis tab ini) dikonfirmasi TIDAK dibaca
  halaman manapun lain di repo (`grep -rn "collection(db, \"materi\""`)
  sebelum dihapus — materi ajar asli yang dibaca siswa 100% statis lewat
  `materi-index.js`, sistem berbeda total. **Ini keputusan final Arif**,
  bukan asumsi sepihak Claude.
- Tab "Modul" (mirip secara struktur/kegunaan) **SENGAJA DIPERTAHANKAN** —
  `modul.html` benar-benar membaca koleksi Firestore `modul` yang dikelola
  tab ini, JADI JANGAN dihapus juga tanpa konfirmasi eksplisit terpisah kalau
  ada permintaan serupa di masa depan.
- [ ] Buka panel admin → tab "📖 Materi Ajar" TIDAK ADA lagi di daftar tab
- [ ] Tab "📚 Modul" masih ada & masih berfungsi normal (tambah/edit/hapus
      modul, tersimpan & tampil balik ke `modul.html` siswa)
- [ ] Akses langsung `admin.html#materi` (hash lama) → TIDAK error, cukup
      tidak melakukan apa-apa (hash tidak dikenali lagi, tetap di tab default)

---

### 38. EXP dari Modul (`pages/modul/assets/modul-progress-tracker.js`,
`apps-script/Code.gs`, `pages/profil-siswa.html`, belum dirilis — belum
pernah diuji live)

Menutup gap yang sejak Fase 3 EXP tercatat eksplisit sebagai "MENYUSUL" —
progres Modul sekarang ikut menyumbang EXP, sama seperti Materi Ajar.

**Keputusan desain kunci (JANGAN diubah tanpa alasan kuat):**
- "Selesai" = MENCAPAI HALAMAN TERAKHIR modul (`goToPage` dipanggil dengan
  `n === TOTAL_PAGES - 1`), BUKAN sekadar membuka halaman modul. Ini SENGAJA
  beda dari Materi Ajar (yang cukup dibuka) — modul jauh lebih panjang (6-8
  halaman + kuis tertanam per bagian), jadi sekadar membuka halaman pertama
  tidak representatif sebagai bukti belajar.
- Deteksi ini bergantung pada pola `STORAGE_KEY`/`TOTAL_PAGES`/`goToPage`
  yang SUDAH DIVERIFIKASI KONSISTEN di SEMUA 41 file `modul.html` (per
  Agustus 2026). **Kalau ada modul BARU dibuat dengan struktur/nama variabel
  berbeda, `modul-progress-tracker.js` TIDAK AKAN mendeteksi modul itu**
  (`init()` diam-diam berhenti kalau `window.goToPage`/`window.TOTAL_PAGES`
  tidak ditemukan) — WAJIB pasang manual
  `<script src="../../assets/modul-progress-tracker.js"></script>` di modul
  baru DAN pertahankan pola nama variabel yang sama, atau modul itu tidak
  akan pernah tercatat selesai walau siswa benar-benar menuntaskannya.
- EXP per modul = **25** (konstanta `EXP_PER_MODUL_` di `Code.gs`),
  direkomendasikan Claude atas dasar 1 modul ≈ 2,5 materi dari segi
  cakupan/usaha — BUKAN angka yang diminta eksplisit oleh Arif, jadi kalau
  setelah dipakai beberapa waktu terasa kurang/lebih pas, ini yang pertama
  ditinjau ulang.
- Sama seperti Materi Ajar & Uji Kemampuan: `jumlahModulSelesai` DIHITUNG
  ULANG PENUH dari sheet "Data Progres Modul" setiap `hitung_gamifikasi`
  dipanggil, BUKAN counter yang di-increment.

**Uji manual yang WAJIB dilakukan sebelum fitur ini dianggap aman:**
- [ ] Login sebagai siswa → buka salah satu modul (mis.
      `pages/modul/matematika/kesetaraan-tp1/modul.html`) → klik "Lanjut →"
      cuma sampai halaman ke-3 dari 6 (BELUM sampai akhir) → cek sheet "Data
      Progres Modul" di Google Sheets → TIDAK ada baris baru untuk siswa ini
- [ ] Lanjutkan klik "Lanjut →" sampai halaman TERAKHIR (halaman "Selesai")
      → cek sheet "Data Progres Modul" → ADA 1 baris baru (Nama Siswa, Modul
      Slug cocok, Status "Selesai")
- [ ] Buka `profil-siswa.html` siswa yang sama → kartu "Modul Selesai"
      menampilkan angka 1, dan Total EXP naik 25 dibanding sebelum modul
      diselesaikan
- [ ] Selesaikan modul YANG SAMA sekali lagi (buka ulang, tunggu progres
      lokal dipulihkan otomatis ke halaman terakhir) → sheet "Data Progres
      Modul" TETAP 1 baris (bukan 2 — upsert, bukan log), Total EXP TIDAK
      bertambah lagi (masih 25 untuk modul itu, bukan 50)
- [ ] Selesaikan modul KEDUA yang berbeda → kartu "Modul Selesai" jadi 2,
      Total EXP dari modul jadi 50 (2×25)
- [ ] Login sebagai GURU, buka modul manapun sampai halaman terakhir → sheet
      "Data Progres Modul" TIDAK bertambah baris (guru sengaja tidak
      dilacak, sama seperti materi-progress-tracker.js)
- [ ] Uji di ≥3 modul dari mapel BERBEDA (mis. Matematika, Bahasa Indonesia,
      Pendidikan Pancasila — ketiganya punya `TOTAL_PAGES` berbeda: 6, 8, 6)
      untuk pastikan deteksi halaman terakhir bekerja generik, tidak
      hardcode ke satu nilai `TOTAL_PAGES` tertentu
- [ ] Buka DevTools Console saat mengerjakan modul → pastikan TIDAK ada
      error JavaScript yang muncul akibat `modul-progress-tracker.js`
      (terutama di modul yang polanya sedikit berbeda kalau ada)
- [ ] Redeploy Apps Script SELESAI dilakukan sebelum uji ini (endpoint
      `progres_modul` baru, sama seperti seluruh sistem gamifikasi lain,
      lihat §35 poin 2 kalau lupa langkah manual ini)

---

### 39. Perbaikan `modul-index.js` & Laporan "Perkembangan Belajar Mandiri"
(`pages/modul/assets/modul-index.js`, `pages/materi/assets/tp-kko-index.js`,
`pages/cp-tp-atp.html`, `pages/laporan-siswa/assets/belajar-mandiri.js`,
`apps-script/Code.gs`, belum dirilis — belum pernah diuji live)

**Bagian A — Perbaikan `modul-index.js` (temuan tidak terduga, Agustus 2026):**
- 16 dari 41 file `modul.html` yang SUDAH lengkap di repo TERNYATA TIDAK
  terdaftar (SELURUH 10 modul Pendidikan Pancasila + 3 modul Matematika
  elemen Pengukuran + 3 modul Bahasa Indonesia yang foldernya sudah diganti
  nama). Akibatnya modul-modul itu TIDAK PERNAH tampil di menu Modul siswa
  (`pages/modul.html`) — bukan cuma masalah laporan orang tua, ini bug nyata
  yang sudah lama tidak ketahuan.
- 1 entri lama (`menulis-gagasan-tp3`) DIHAPUS — file-nya tidak pernah ada.
- TP Bhinneka Tunggal Ika dipecah dari 1 kode (`BTI-C1`) jadi 3
  (`BTI-C1a`/`b`/`c`) di `tp-kko-index.js` DAN `cp-tp-atp.html` — dikonfirmasi
  eksplisit oleh pemilik proyek, BUKAN keputusan sepihak Claude.
- **Field baru `slug` ditambahkan ke SEMUA 42 entri `modul-index.js`** — ini
  adalah "Modul Slug" ASLI yang tersimpan di `STORAGE_KEY` tiap file
  modul.html, BUKAN diturunkan otomatis dari `file`/nama folder (terbukti
  TIDAK SELALU bisa ditebak mekanis — folder `kpk-fpb-tp4` punya slug
  `mtk-kpkfpb-tp4`, tanda hubung antara "kpk" dan "fpb" hilang). **Kalau
  menambah modul BARU ke `modul-index.js`, WAJIB isi field `slug` ini dengan
  nilai PERSIS dari `STORAGE_KEY` di file modul.html-nya (bagian setelah titik
  dua), JANGAN diasumsikan sama dengan nama folder.**
- [ ] Buka `pages/modul.html` sebagai siswa → SEMUA mapel termasuk
      **Pendidikan Pancasila** (sebelumnya tidak tampil sama sekali) muncul
      dengan modul-modulnya
- [ ] Klik salah satu modul Pendidikan Pancasila dari menu (bukan lewat URL
      langsung) → terbuka dengan benar, bukan 404
- [ ] Buka `pages/cp-tp-atp.html` → elemen Bhinneka Tunggal Ika menampilkan
      3 kartu TP terpisah (BTI-C1a/b/c), bukan 1 kartu lama

**Bagian B — Laporan "Perkembangan Belajar Mandiri" (Pintu 2):**
- Keputusan desain kunci: Materi & Modul SENGAJA ditampilkan sebagai 2
  subseksi terpisah dalam 1 mapel (bukan digabung per-TP) karena skema kode
  `tp` di `materi-index.js` vs `modul-index.js` tidak selalu cocok untuk
  elemen yang sama (mis. Bahasa Indonesia · Menulis: materi pakai
  `TL-Pengalaman`, modul pakai `menulis-pengalaman-tp1`). Kalau nanti kedua
  index ini diselaraskan skemanya, penggabungan per-TP bisa dipertimbangkan
  lagi — TAPI JANGAN dipaksakan sebelum skemanya benar-benar konsisten.
- "Aktivitas Terbaru" TIDAK bergantung pada kecocokan skema `tp` sama sekali
  (makanya aman dibangun duluan) — cuma butuh lookup slug→judul dari
  `MATERI_INDEX`/`MODUL_INDEX` masing-masing secara independen, lalu urutkan
  berdasarkan `Timestamp` dari server.
- Filter mapel (`mapelAktif`) di-reset ke mapel PERTAMA yang ada datanya
  SETIAP KALI ganti siswa (di `loadReport()`, bukan `renderReport()`) — kalau
  ini terbalik/hilang, orang tua yang ganti-ganti anak akan melihat filter
  "nyangkut" dari anak sebelumnya yang mapelnya beda.
- [ ] Buka Pintu 2 sebagai orang tua dengan anak yang sudah baca beberapa
      materi DAN selesaikan beberapa modul → kartu ringkasan atas menampilkan
      2 angka (Materi & Modul) yang benar, lintas semua mapel
- [ ] "Aktivitas Terbaru" menampilkan gabungan materi+modul terbaru,
      terurut dari yang PALING BARU, dengan label waktu yang masuk akal
      (uji minimal 1 aktivitas hari ini + 1 aktivitas beberapa hari lalu)
- [ ] Klik salah satu chip mapel → HANYA detail mapel itu yang muncul di
      bawah (mapel lain tidak ikut ter-render, halaman jadi jauh lebih
      pendek dibanding sebelum revisi ini)
- [ ] Klik chip mapel yang SAMA sekali lagi → detail tertutup kembali (toggle
      off), kembali ke pesan "Pilih salah satu mata pelajaran…"
- [ ] Mapel yang CUMA punya Modul (belum ada Materi Ajar) atau CUMA punya
      Materi (belum ada Modul) tetap muncul sebagai chip yang bisa dipilih,
      subseksi yang kosong menampilkan pesan "Belum ada … untuk mapel ini"
      (bukan kosong tanpa keterangan atau error)
- [ ] Guru buka laporan ini untuk >1 siswa berturut-turut (ganti siswa lewat
      "← Pilih siswa lain") → filter mapel ke-reset dengan benar tiap ganti
      siswa, tidak nyangkut dari siswa sebelumnya
- [ ] Materi/modul yang sudah dihapus dari index (kalau ada) tapi masih
      punya baris lama di sheet progres → TIDAK bikin error di "Aktivitas
      Terbaru" (dilewati diam-diam, lihat komentar `if (!info) return;` di
      `belajar-mandiri.js`)

---

### 40. Avatar Pilihan Siswa (`pages/profil-siswa.html`,
`pages/papan-peringkat.html`, `apps-script/Code.gs`, belum dirilis — kode
belum pernah diuji live, TAPI ke-16 gambar ilustrasi SUDAH ada di
`assets/img/avatars/`)

**Keputusan desain kunci (JANGAN diubah tanpa alasan kuat):**
- Foto asli SENGAJA tidak dibangun — cuma avatar dari daftar tertutup 16
  pilihan. Ini bukan keterbatasan teknis, ini keputusan produk soal
  keamanan anak (lihat CHANGELOG.md). Kalau ada permintaan fitur upload
  foto di masa depan, INGAT alasan ini dulu sebelum membangun.
- Avatar disimpan di `level_siswa/{namaSiswa}`, BUKAN `siswa/{nisn}` —
  dikonfirmasi eksplisit oleh pemilik proyek setelah saya jelaskan implikasi
  keamanannya (koleksi `siswa` sengaja terkunci total dari klien).
- **`AVATAR_LIST` di `profil-siswa.html`, `AVATAR_LIST` di
  `papan-peringkat.html`, dan `AVATAR_VALID_IDS_` di `apps-script/Code.gs`
  HARUS SAMA PERSIS (isi & urutan)** — ketiganya independen (tidak baca dari
  satu sumber bersama), kalau salah satu diedit tanpa mengubah yang lain:
  - `AVATAR_VALID_IDS_` (server) beda dari 2 lainnya → avatar baru muncul di
    UI tapi selalu gagal disimpan (ditolak validasi server)
  - Urutan `AVATAR_LIST` di `profil-siswa.html` beda dari
    `papan-peringkat.html` → avatar yang sama tampil BEDA gambar di 2
    halaman itu (nomor file diturunkan dari POSISI di array, bukan dari ID)
- Nama file gambar WAJIB format `avatar-NN-<id>.webp` (NN = nomor urut
  1-based dari posisi di `AVATAR_LIST`, 2 digit) di `assets/img/avatars/` —
  lihat `avatar-prompts-siswa-kelas-v.md` (dibagikan terpisah ke Arif) untuk
  daftar lengkap & prompt generatornya.
- Setiap `<img>` avatar SELALU punya `onerror` fallback ke emoji — supaya
  UI tetap berfungsi penuh SEBELUM gambar ilustrasi asli diupload (bukan
  nunggu semua 10 gambar siap baru fitur ini bisa dites).
- `setLevelSiswaFirestore_` MENIMPA SELURUH dokumen tiap dipanggil (tanpa
  updateMask) — SIAPA PUN yang menambah field baru ke `level_siswa` di masa
  depan WAJIB baca dulu lewat `ambilLevelSiswaLengkap_()` sebelum menimpa,
  atau field itu akan hilang tiap kali endpoint lain (`hitung_gamifikasi`)
  jalan. Pola ini sudah dipakai utk `avatar`, ikuti pola yang sama.

**Uji manual yang WAJIB dilakukan:**
- [ ] Upload minimal 1-2 gambar avatar asli (WebP) ke `assets/img/avatars/`
      dengan nama PERSIS sesuai konvensi di atas, SISANYA biarkan belum ada
      dulu → buka panel pemilih avatar → yang sudah ada gambar tampil
      ilustrasinya, yang belum ada tampil emoji fallback (BUKAN ikon
      gambar rusak/broken image)
- [ ] Siswa BARU (belum pernah kerja apa pun, belum punya dokumen
      `level_siswa`) buka Profil → header avatar tampil placeholder umum
      (bukan error), panel pemilih tetap bisa dipakai
- [ ] Pilih salah satu avatar → status "Menyimpan…" lalu "Tersimpan!" →
      avatar besar di header ikut berubah seketika (tanpa reload halaman)
- [ ] Reload halaman Profil → avatar yang dipilih tadi TETAP tampil (bukan
      balik ke placeholder — datanya benar tersimpan di Firestore, bukan
      cuma di memori klien)
- [ ] SETELAH pilih avatar, kerjakan 1 kuis di Uji Kemampuan sampai selesai
      (memicu `hitung_gamifikasi`) → BUKA ULANG Profil → avatar yang
      dipilih sebelumnya MASIH ADA (tidak hilang tertimpa perhitungan
      ulang level) — ini skenario BUG UTAMA yang harus dicegah
      `ambilLevelSiswaLengkap_()` di atas
- [ ] Buka Papan Peringkat → siswa yang sudah pilih avatar menampilkan
      ilustrasinya kecil di samping nama; siswa yang belum pernah pilih
      menampilkan emoji 🙂 fallback (bukan kosong/error)
- [ ] Coba kirim `type: "set_avatar"` dengan `avatar` string sembarangan
      (mis. lewat DevTools Network tab, ganti body request) → server
      menolak dengan pesan "Avatar tidak dikenali", TIDAK tersimpan
- [ ] Ganti avatar berkali-kali berturut-turut dengan cepat → tidak ada
      race condition yang bikin avatar "nyangkut" di pilihan yang salah
      (status akhir harus sesuai klik TERAKHIR)

---

### 41. Timer minimum & EXP baca/selesai ulang (`pages/materi/assets/materi-progress-tracker.js`,
`pages/modul/assets/modul-progress-tracker.js`, `apps-script/Code.gs`, belum dirilis —
belum pernah diuji live)

**Keputusan desain kunci (JANGAN diubah tanpa alasan kuat):**
- Ambang waktu: **Materi 1 menit, Modul 3 menit** (`AMBANG_WAKTU_MS`, konstanta terpisah
  di masing-masing file tracker — TIDAK dibagi dari 1 sumber, karena keduanya sudah punya
  "APPS_SCRIPT_URL sendiri-sendiri" sebagai pola yang sudah ada, konsisten dengan itu).
- Yang dihitung: **waktu TERLIHAT** (Page Visibility API), bukan wall-clock sejak dibuka.
  Ini PENTING — kalau nanti direfaktor jadi wall-clock biasa (mis. `setTimeout` sederhana),
  siswa bisa mengakali dengan membuka banyak tab sekaligus.
- Penanda progres HANYA terkirim selagi halaman MASIH TERBUKA (dicek berkala tiap 5 detik
  + tiap event relevan seperti `visibilitychange`/`goToPage`) — TIDAK PERNAH dijadwalkan via
  `setTimeout` yang tetap "menunggu" walau siswa sudah pergi/menutup halaman. Kalau ambang
  waktu belum tercapai saat halaman ditutup, progres itu HILANG SELAMANYA (bukan cuma
  tertunda) — ini SESUAI DESAIN ("hanya dibuka tanpa dibaca = tidak dapat eksperimen apa-
  apa"), bukan bug.
- Modul: syarat "mencapai halaman terakhir" DAN "ambang waktu" harus SAMA-SAMA terpenuhi,
  boleh dalam urutan APA PUN (waktu duluan baru capai halaman terakhir, atau sebaliknya).
- EXP baca/selesai ulang: kunjungan ke-1 = EXP penuh, kunjungan ke-2 dst KE MATERI/MODUL
  YANG SAMA = `EXP_ULANG_` (1). Materi/modul BERBEDA masing-masing tetap dapat EXP penuh di
  kunjungan pertamanya — jangan sampai salah paham jadi "EXP materi keseluruhan dibatasi",
  yang dibatasi cuma pengulangan ke ITEM YANG SAMA.
- **Perubahan skema BESAR**: "Data Progres Materi"/"Data Progres Modul" sekarang APPEND-ONLY
  (1 baris = 1 kunjungan), BUKAN lagi upsert (1 baris = 1 siswa+materi). Data LAMA yang masih
  berformat upsert (1 baris per siswa+materi dari sebelum fitur ini) TETAP KOMPATIBEL tanpa
  migrasi — setiap baris lama otomatis dihitung sebagai "kunjungan ke-1" untuk materi/modul
  itu, sistem baru cuma menambah baris BARU mulai sekarang, tidak perlu mengubah baris lama.

**Uji manual yang WAJIB dilakukan sebelum fitur ini dianggap aman:**
- [ ] Buka 1 materi, TUTUP dalam < 1 menit (jangan tunggu) → cek sheet "Data Progres
      Materi" → TIDAK ADA baris baru, EXP TIDAK bertambah
- [ ] Buka 1 materi, BIARKAN TERBUKA & TERLIHAT ≥ 1 menit tanpa pindah tab → cek sheet →
      ADA 1 baris baru, EXP bertambah 10
- [ ] Buka materi yang SAMA lagi di sesi lain, biarkan ≥ 1 menit lagi → cek sheet → ADA
      baris KEDUA (bukan menimpa baris pertama), EXP bertambah cuma 1 (bukan 10 lagi),
      statistik "Materi Dibaca" di Profil TETAP di angka yang sama (tidak ikut naik)
- [ ] Buka materi, tunggu 20 detik, PINDAH TAB lain selama 2 menit, BALIK LAGI ke tab
      materi, tunggu 40 detik lagi (total waktu TERLIHAT = 60 detik, tapi total waktu
      SEJAK DIBUKA jauh lebih dari itu) → EXP HARUS bertambah (karena akumulasi waktu
      terlihat sudah cukup), membuktikan timer benar-benar dijeda saat pindah tab, bukan
      cuma wall-clock
- [ ] Buka modul, klik "Lanjut →" cepat-cepat sampai halaman terakhir dalam < 3 menit,
      lalu TUTUP halaman → cek sheet "Data Progres Modul" → TIDAK ADA baris baru (syarat
      waktu belum terpenuhi walau sudah "selesai" secara halaman)
- [ ] Buka modul yang SAMA, kali ini BIARKAN TERBUKA di halaman terakhir sampai total
      waktu terlihat ≥ 3 menit → BARU SEKARANG baris tersimpan & EXP bertambah 25 (atau
      1 kalau ini bukan kunjungan pertama ke modul itu)
- [ ] Modul yang SUDAH pernah selesai dibuka ULANG (localStorage otomatis memulihkan ke
      halaman terakhir) → syarat "halaman terakhir" langsung terpenuhi di awal, TAPI tetap
      harus menunggu 3 menit lagi (tab terbuka & terlihat) sebelum EXP (1, bukan 25)
      tercatat — TIDAK instan
- [ ] Buka DevTools Console selama proses baca materi/modul → pastikan TIDAK ada error
      JavaScript yang muncul akibat perubahan ini
- [ ] Redeploy Apps Script SELESAI dilakukan sebelum uji ini (perubahan `Code.gs`:
      `doPostProgresMateri_`, `doPostProgresModul_`, `doPostHitungGamifikasi_`, fungsi baru
      `hitungExpDenganBacaUlang_`) — DAN pastikan URL Apps Script di SEMUA 5 file yang
      menyimpan salinannya sendiri-sendiri sudah konsisten: `pages/materi/assets/materi-
      progress-tracker.js`, `pages/modul/assets/modul-progress-tracker.js`,
      `pages/uji-kemampuan.html`, `pages/profil-siswa.html`, `pages/mpls/assets/config.js`
      (lihat insiden URL basi Agustus 2026 DAN insiden kedua Sept 2026 — kedua tracker
      sempat balik pakai URL lama lagi setelah deploy baru — di CHANGELOG.md. WAJIB dicek
      ulang tiap kali redeploy Apps Script, JANGAN cuma andalkan ingatan file mana saja
      yang perlu diubah — jalankan `grep -rn "script.google.com/macros" --include="*.html"
      --include="*.js" .` dari root repo dan pastikan SEMUA hasilnya satu URL yang sama)

### 42. Rename "Modul Pembelajaran"→"Ayo Belajar!" & "Materi Ajar"→"Ingat Lagi", dibuka
untuk orangtua (`index.html`, `pages/modul.html`, `pages/materi.html`,
`pages/infografis.html`, 43 file `pages/modul/**/modul.html`, 193 file
`pages/materi/**/*.html`, `pages/papan-peringkat.html`,
`pages/laporan-siswa/assets/belajar-mandiri.js` + `.html`, `pages/laporan-siswa.html`)

**Keputusan desain kunci (JANGAN diubah tanpa alasan kuat):**
- Ini PENGGANTIAN NAMA TAMPILAN SAJA. Nama file, folder, URL, `id`, dan kunci data di
  `materi-index.js`/`modul-index.js` (mis. field `judul`, `slug`, `mapel`) **TIDAK berubah**
  — kalau nanti mencari kode yang berhubungan dengan "Ayo Belajar!"/"Ingat Lagi" di file JS,
  cari `modul`/`materi` seperti biasa, JANGAN cari string baru itu di sana.
- Istilah "Materi Ajar"/"Modul" yang masih tersisa di `cp-tp-atp.html`, `admin.html`, dan
  komentar kode (`auth-guard.js`, `infografis-*.js`, kedua file tracker) **SENGAJA TIDAK
  diubah** — di situ istilahnya dipakai sebagai istilah kurikulum umum untuk guru (konten
  internal/dev), bukan nama fitur yang di-rebrand untuk siswa/orangtua.
- Tracker EXP (`materi-progress-tracker.js`, `modul-progress-tracker.js`) SUDAH memfilter
  `data.role !== "siswa"` SEBELUM perubahan ini — jadi membuka akses orangtua ke 3 hub page
  ini TIDAK butuh perubahan apa pun di kedua tracker itu. Kalau suatu saat menambah tracker
  BARU di halaman lain yang juga mau dibuka untuk orangtua, filter role ini WAJIB disalin.
- `infografis.html` memang tidak pernah punya tracker EXP sama sekali (Galeri Visual murni
  lihat-lihat gambar) — jangan bingung mencari tracker yang "hilang" di situ.

**Uji manual yang WAJIB dilakukan sebelum dianggap aman:**
- [ ] Login sebagai **siswa** → beranda menampilkan kartu "🚀 Ayo Belajar!" (badge "Langkah
      1"), "🔁 Ingat Lagi" (badge "Langkah 2"), "🖼️ Galeri Visual" (badge "Pelengkap"), "💪
      Uji Kemampuan" (badge "Langkah 3 · Latihan") — urutan dan nama sesuai
- [ ] Klik kartu "Ayo Belajar!" → hub terbuka, title tab browser & H1 juga sudah "Ayo
      Belajar!" (bukan lagi "Modul Pembelajaran")
- [ ] Buka salah satu modul dari hub itu → breadcrumb atas bertuliskan "Ayo Belajar!" (bukan
      "Modul"), progres & EXP tetap jalan seperti biasa
- [ ] Klik kartu "Ingat Lagi" → hub, title, H1 sudah "Ingat Lagi"; buka salah satu materi →
      breadcrumb, brand div, dan link "Kembali ke daftar Ingat Lagi" semua konsisten
- [ ] Login sebagai **orangtua** → SEKARANG kartu "Ayo Belajar!", "Ingat Lagi", "Galeri
      Visual" MUNCUL di beranda (sebelumnya tersembunyi) — kartu MPLS/CP-TP-ATP/Jadwal
      (guru-only) TETAP tersembunyi
- [ ] Sebagai orangtua, buka salah satu modul & materi apa saja sampai selesai dibaca lama →
      cek sheet "Data Progres Materi"/"Data Progres Modul" di Google Sheets → TIDAK ADA
      baris baru tercatat, EXP anak TIDAK berubah (buktikan filter role di tracker benar-
      benar menahan, bukan cuma asumsi dari baca kode)
- [ ] Login sebagai **guru** → semua kartu tetap terlihat semua seperti biasa (guru tidak
      pernah dibatasi `data-akses`)
- [ ] Buka "Perkembangan Belajar Mandiri" (Laporan Siswa Pintu 2) sebagai guru DAN sebagai
      orangtua → subtitle & subsection report sudah bilang "Ingat Lagi"/"Ayo Belajar!" (bukan
      "Materi Ajar"/"Modul" lagi), dan catatan usang "(Modul menyusul)" di deskripsi pintu
      pada `laporan-siswa.html` sudah hilang
- [ ] Buka Papan Peringkat sebagai siswa & guru → subtitle sudah bilang "Ingat Lagi" (bukan
      "Materi Ajar")

### 43. Tab "Rekap Lengkap" di Papan Peringkat untuk guru (`pages/papan-peringkat.html`)

**Keputusan desain kunci (JANGAN diubah tanpa alasan kuat):**
- Sumber data tab Rekap SAMA PERSIS dengan tab Papan Peringkat — satu kali
  `getDocs(collection(db, "level_siswa"))` disimpan di `rosterCache`, dipakai ulang oleh
  KEDUANYA. Jangan tambah fetch kedua untuk tab Rekap — kalau butuh data baru yang belum
  ada di `level_siswa`, tambahkan field itu ke `Code.gs` (bagian yang menulis dokumen
  `level_siswa`) dulu, baru field baru itu otomatis ikut kebawa ke `rosterCache`.
- Tab "Rekap Lengkap" HANYA muncul untuk `role === "guru"` — kondisinya ada DUA lapis:
  `tabsRow` (elemen HTML pembungkus 2 tombol tab) disembunyikan default lewat class
  `hidden` di HTML, baru dilepas via JS kalau role guru. Siswa/orangtua yang masuk halaman
  ini TIDAK PERNAH melihat tab sama sekali (bukan cuma tab Rekap-nya yang disembunyikan,
  seluruh baris tab-nya tidak ada).
- Siswa "belum mulai" (dari `gabungkanRoster()`, lihat §-nya di atas soal avatar) TETAP
  muncul di tabel Rekap dengan angka 0/— di semua kolom statistik — field
  `totalKuisDikerjakan` dkk memang tidak ada sama sekali di objek sintetis itu, jadi SEMUA
  akses field statistik di `renderRekap()` WAJIB pakai fallback `|| 0` (sudah diterapkan,
  jangan dihapus saat refactor).
- Sort & search murni client-side di atas `rosterCache` (25 siswa, sangat ringan) — TIDAK
  perlu paginasi atau query Firestore terpisah, JANGAN over-engineer ini kalau jumlah siswa
  masih sekelas.

**Uji manual yang WAJIB dilakukan sebelum dianggap aman:**
- [ ] Login sebagai **siswa** → buka Papan Peringkat → TIDAK ADA tab sama sekali (tampilan
      grouped-by-rank seperti biasa)
- [ ] Login sebagai **guru** → buka Papan Peringkat → tab "🏅 Papan Peringkat" (aktif
      default) dan "📊 Rekap Lengkap" MUNCUL di atas
- [ ] Klik tab "Rekap Lengkap" → tabel muncul berisi SEMUA ~25 siswa (termasuk yang belum
      pernah mengerjakan apa pun — tampil dengan 0/— bukan "undefined")
- [ ] Ketik nama sebagian di kotak cari → tabel otomatis tersaring cuma yang cocok
- [ ] Klik judul kolom "EXP" → tabel terurut EXP terbesar dulu; klik lagi → terbalik jadi
      terkecil dulu; klik kolom "Nama" → balik ke urutan alfabet
- [ ] Klik balik ke tab "🏅 Papan Peringkat" → tampilan lama tetap seperti semula, TIDAK
      ada fetch ulang ke Firestore (cek Network tab: cuma 1 request `level_siswa` sejak
      halaman dibuka, biar pindah tab bolak-balik berkali-kali)
- [ ] Buka DevTools Console selagi pindah-pindah tab & sortir → pastikan tidak ada error
      JavaScript

### 44. Linimasa Materi — kalender bulanan (`pages/linimasa.html`, tab "Linimasa" di
`pages/admin.html`, `Code.gs`: `LINIMASA_SHEET_NAME`, `getLinimasaSheet_()`,
`doPostLinimasa_()`, `doPostLinimasaHapus_()`)

**Keputusan desain kunci (JANGAN diubah tanpa alasan kuat):**
- **WAJIB redeploy Apps Script** setelah menambah fungsi baru di `Code.gs` — sheet "Data
  Linimasa" TIDAK akan pernah terbuat otomatis kalau deployment lama masih dipakai (sama
  kelas masalah dengan insiden URL basi di atas, tapi ini soal KODE-nya yang basi, bukan
  URL-nya). Uji `?linimasa=1` di browser dulu sebelum menuduh frontend-nya rusak.
- Field "Bulan" di sheet SELALU angka 1-12 (1=Januari), BUKAN nama bulan — kalau lihat
  angka aneh di sheet (mis. "07" ke-parse jadi string), pastikan `Number(body["Bulan"])` di
  `doPostLinimasa_()` benar-benar menghasilkan angka, bukan string "7".
- Semester (Semester 1/2) **TIDAK ADA kolom-nya di sheet sama sekali** — SELALU diturunkan
  dari Bulan di sisi klien (`pages/linimasa.html`: Bulan 7-12 = Semester 1, Bulan 1-6 =
  Semester 2). Kalau nanti ingin menambah kolom Semester manual di sheet, JANGAN — itu akan
  jadi dua sumber kebenaran yang bisa tidak sinkron kalau guru salah isi.
- Status (✅/🔵/⚪) juga **TIDAK ADA kolom-nya** — selalu dihitung ulang dari `Date()`
  sungguhan tiap kali halaman dibuka, bukan disimpan. Kalau tanggal di HP/laptop guru salah
  (jam sistem keliru), status yang tampil ikut salah — itu bukan bug kode.
- Topik/Keterangan TEKS BEBAS, sengaja TIDAK divalidasi terhadap `tp-kko-index.js` — jangan
  tambahkan validasi "harus cocok kode TP" di kemudian hari tanpa diskusi ulang dengan Arif
  (ini keputusan eksplisit, bukan keterbatasan yang lupa dikerjakan).
- Halaman `linimasa.html` READ-ONLY untuk SEMUA role termasuk guru — tombol tambah/edit/
  hapus HANYA ada di `admin.html`. Jangan taruh form input di `linimasa.html`.

**Uji manual yang WAJIB dilakukan sebelum dianggap aman:**
- [ ] Redeploy Apps Script dulu, lalu buka `<APPS_SCRIPT_URL>?linimasa=1` langsung di
      browser → harus balas `{"data": []}` (array kosong, sheet baru belum ada isi) — BUKAN
      error 500 atau halaman HTML error Google
- [ ] Login guru → admin.html → tab "🗓️ Linimasa" → isi 1 entri contoh (mis. Matematika,
      bulan sekarang, topik apa saja) → klik Simpan → entri muncul di daftar bawah form
      TANPA reload halaman
- [ ] Cek Google Sheets langsung → sheet "Data Linimasa" muncul otomatis dengan 1 baris
      data yang barusan diisi, header sesuai `LINIMASA_HEADERS`
- [ ] Klik "Edit" pada entri itu → form terisi ulang datanya, judul form berubah jadi "Edit
      Entri Linimasa" → ubah Topik → Simpan Perubahan → baris di Sheet TERTIMPA (bukan jadi
      baris baru/duplikat)
- [ ] Klik "Hapus" pada satu entri → konfirmasi → baris hilang dari daftar DAN dari Sheet
- [ ] Login sebagai **siswa** → kartu "🗓️ Linimasa Materi" muncul di beranda → buka →
      accordion bulan yang sedang berjalan SEKARANG otomatis terbuka, entri yang barusan
      diisi guru muncul dengan ikon status yang benar
- [ ] Login sebagai **orangtua** → kartu Linimasa Materi juga muncul & bisa dibuka (bukan
      cuma siswa/guru)
- [ ] Klik chip filter salah satu mapel → cuma entri mapel itu yang tampil di semua bulan;
      klik "Semua" lagi → kembali semua tampil
- [ ] Isi entri dengan Bulan bulan LALU (mis. kalau sekarang September, isi Juli) → buka
      linimasa.html → entri itu berstatus ✅ Selesai (hijau), BUKAN 🔵/⚪
- [ ] Isi entri dengan Bulan bulan DEPAN → berstatus ⚪ Akan datang (abu-abu)
