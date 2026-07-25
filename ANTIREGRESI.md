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
- [ ] 3 tab (Pengumuman, Modul, Bank Soal) bisa diklik bolak-balik, isi form tidak
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
- [ ] **Tab Bank Soal**: isi 2-4 pilihan, centang radio "Benar" di salah satu →
      field jawaban yang tersimpan **sesuai teks pilihan yang dicentang**, bukan
      urutan/huruf (A/B/C/D); ubah radio ke pilihan lain sebelum simpan → jawaban
      ikut berubah; Edit soal lama → radio "Benar" otomatis tercentang ulang di
      pilihan yang sesuai
- [ ] Coba isi judul/pertanyaan dengan karakter aneh seperti `<script>` atau
      `<img onerror=...>` → HARUS tampil sebagai teks biasa di list (bukan
      dieksekusi/muncul kotak alert) — ini uji anti-XSS, bukan sekadar tampilan
- [ ] Tombol "+ Tambah Pengumuman" / "Upload Modul" / "Tambah Soal" di beranda
      membuka `admin.html` langsung ke tab yang sesuai (bukan lagi `alert("Fitur
      segera hadir")`)
- [ ] Tampilan tab Bank Soal (paling padat: pertanyaan + 4 pilihan + radio) tetap
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

### 19. Bank Soal — Latihan Interaktif (`pages/bank-soal.html`, v0.9.0 + v0.9.1)
- [ ] Bisa dibuka akun **siswa** (bukan guru-only)
- [ ] Kotak pilihan mapel menampilkan jumlah soal yang benar per mapel (mis.
      "5 soal") sesuai isi `bank_soal` yang sudah ditambahkan guru
- [ ] Klik salah satu mapel → masuk mode kuis, menampilkan SEMUA soal mapel itu
      sekaligus (bukan satu-satu)
- [ ] Pilih jawaban untuk sebagian atau semua soal → klik "Periksa Jawaban" →
      skor (x/y) muncul dan SESUAI dengan jumlah jawaban yang benar-benar cocok
- [ ] Pilihan yang benar ditandai **hijau** untuk SEMUA soal (termasuk yang
      dijawab benar maupun salah); pilihan yang dipilih siswa tapi SALAH ditandai
      **merah**
- [ ] **Sejak v0.9.1**: soal yang TIDAK dijawab sama sekali diberi label merah
      "Belum dijawab" di nomor soal (bukan dibiarkan tanpa tanda apa pun), dan
      label skor mencantumkan "· N soal belum dijawab"; soal itu tetap dihitung
      SALAH di skor (bukan benar, bukan dilewati dari perhitungan)
- [ ] **Sejak v0.9.1**: urutan tampil pilihan diacak tiap kali kuis dibuka —
      buka mapel yang sama beberapa kali, urutan pilihan seharusnya TIDAK selalu
      persis sama; penilaian tetap benar walau urutan berubah (dicocokkan lewat
      teks, bukan posisi)
- [ ] Setelah dinilai: semua radio button terkunci (tidak bisa diubah lagi) dan
      tombol berubah jadi "Sudah Dinilai" (nonaktif)
- [ ] Tombol "← Pilih mapel lain" mengembalikan ke daftar mapel, dan memilih
      mapel lain/sama menampilkan kuis BARU (bukan hasil kuis sebelumnya yang
      masih nyangkut)
- [ ] Soal dengan hanya 2 pilihan maupun 4 pilihan sama-sama tampil rapi
      (jumlah pilihan tidak seragam antar soal — cek tidak ada yang janggal)

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
      `modul.html`/`materi.html`/`bank-soal.html`/`info.html`)
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
- [ ] Tab Bank Soal: coba simpan soal TANPA mengisi Mata Pelajaran → ditolak
      dengan pesan jelas, TIDAK ikut tersimpan ke list
- [ ] Tab Bank Soal: isi 2 pilihan dengan teks yang PERSIS SAMA (mis. keduanya
      "20") → ditolak dengan pesan soal pilihan duplikat, TIDAK ikut tersimpan
- [ ] Ketik di kolom "Mata Pelajaran" (tab Modul/Materi/Bank Soal manapun) →
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
