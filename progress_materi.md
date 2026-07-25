# Progress Materi Ajar (Kelas 5A)

Catatan kerja untuk sistem Materi Ajar berbasis halaman HTML statis
(bukan lagi Firestore + panel admin). Dibuat karena tampilan materi
ajar perlu konsisten antar-mapel dan kaya secara visual (warna, ikon,
gambar, ukuran huruf) — sesuatu yang sulit dicapai lewat kotak teks
polos di admin.html. Keputusan & alasannya ada di riwayat chat, ini
cuma rangkuman kerja + status.

Pemilik & pengelola satu-satunya: guru wali kelas (tidak melibatkan
guru lain langsung — guru pendamping memberi bahan mentah, penempatan
di website tetap didiskusikan lewat chat ini dulu).

---

## 1. Struktur folder

```
pages/materi.html                        ← daftar/indeks semua materi (statis)
pages/materi/
  assets/
    materi.css                           ← gaya bersama (token warna, tipografi baca, komponen)
    materi-index.js                      ← SUMBER TUNGGAL daftar semua materi
    materi-nav.js                        ← navigasi sebelumnya/berikutnya otomatis + tombol ukuran huruf
  bahasa-indonesia/   NN-judul.html
  matematika/          NN-judul.html
  ipas/                 NN-judul.html
  pai/                   NN-judul.html
  pancasila/              NN-judul.html
  seni-budaya/             NN-judul.html
  pjok/                     NN-judul.html
  bahasa-inggris/            NN-judul.html
```

**Slug folder mapel (baku, jangan diubah):**
`bahasa-indonesia`, `matematika`, `ipas`, `pai`, `pancasila`, `seni-budaya`, `pjok`, `bahasa-inggris`

## 2. Konvensi penamaan file

```
{urutan-2-digit}-{judul-singkat-kebab-case}.html
```
- `urutan` = nomor urut baca **di dalam mapel itu saja**, mulai dari `01`
- `judul-singkat-kebab-case` = 3–6 kata dari judul, huruf kecil, spasi jadi tanda hubung
- Contoh: `01-bilangan-cacah-dan-nilai-tempat.html`, `02-operasi-hitung-campuran.html`

## 3. Warna & ikon per mapel

| Mapel | Slug | Warna | Ikon |
|---|---|---|---|
| Bahasa Indonesia | `bahasa-indonesia` | `#8c3d5f` | 📝 |
| Matematika | `matematika` | `#1f6f78` | 🔢 |
| IPAS | `ipas` | `#3f7d4a` | 🌏 |
| Pendidikan Agama Islam & Budi Pekerti | `pai` | `#0f6b52` | 🕌 |
| Pendidikan Pancasila | `pancasila` | `#a13d3d` | 🇮🇩 |
| Seni Budaya | `seni-budaya` | `#c9861f` | 🎨 |
| PJOK | `pjok` | `#d9541c` | 🤸 |
| Bahasa Inggris | `bahasa-inggris` | `#4a5d8c` | 🔤 |

Warna ini didefinisikan di `materi.css` (`--m-{slug}`) — kalau mau
diubah, cukup ubah satu tempat itu, semua halaman ikut berubah.

## 4. Alur kerja setiap menambah 1 materi baru

1. Aku (Claude) tulis file HTML materi barunya sesuai konvensi di atas.
2. Aku tambahkan satu entri baru di `materi-index.js`.
3. Aku update tabel status di bagian bawah file ini.
4. Kamu unggah **3 file itu** (materi baru + `materi-index.js` + file ini) ke GitHub, ke folder yang sesuai.
5. Setelah GitHub Pages selesai build (±1 menit), materi baru otomatis muncul di `materi.html` dan navigasi sebelumnya/berikutnya di materi tetangganya — tidak ada file lain yang perlu disentuh.

## 5. Catatan desain (supaya konsisten ke depan)

- Tipografi: Playfair Display (judul) + Plus Jakarta Sans (isi), sama seperti seluruh situs.
- Ukuran huruf isi materi bisa diperbesar siswa sendiri (tombol A / A+ / A++) — berguna karena materi ditulis untuk siswa yang butuh penguatan.
- Isi materi memakai HTML asli (bukan lagi teks polos), jadi boleh pakai **tebal**, tabel, kotak "callout" (`.ma-callout`) untuk soal latihan/catatan penting.
- Belum memakai gambar/foto asli — sementara mengandalkan warna, ikon, dan tipografi supaya tetap ringan & tidak tergantung hosting gambar eksternal. Bisa didiskusikan lagi kalau suatu materi benar-benar butuh gambar.
- `pages/materi.html.bak` sempat dibuat sebagai cadangan versi Firestore lama lalu dihapus — kalau sewaktu-waktu perlu rollback, versi lama masih ada di riwayat Git repo aslinya (bukan di sini).

## 6. Isu lama — SUDAH SELESAI

~~`assets/js/auth-guard.js` belum ditemukan~~ → sudah dibuat ulang
(2026-07-25), pola disalin dari `guru-guard.js` tapi tanpa cek role.
Sudah dicoba di sisi guru dan bisa diakses.

## 6a. Perbaikan berdasarkan masukan (2026-07-25, sesudah tes pertama)

- **Loading "Memeriksa akses…" lambat (5–10 detik):** `auth-guard.js`
  disederhanakan — tidak lagi mengambil dokumen Firestore
  `users/{uid}` (field role/nama), karena tidak ada satu pun halaman
  yang memakainya dari event ini. Ini menghapus satu round-trip
  jaringan dari setiap perpindahan halaman. Juga ditambahkan
  `<link rel="preconnect">` ke domain Firebase di halaman materi,
  supaya koneksinya sudah "dihangatkan" sebelum dibutuhkan.
  Catatan jujur: karena situs ini banyak halaman terpisah (bukan
  satu aplikasi/SPA), tiap pindah halaman tetap akan memuat ulang
  Firebase dari awal — jeda "memeriksa akses" tidak akan hilang
  100%, tapi seharusnya terasa jauh lebih cepat dari sebelumnya.
  Kalau setelah ini masih terasa lambat, kemungkinan besar
  penyebabnya koneksi internet saat itu, bukan kodenya lagi.
- **Jarak antar paragraf terlalu lebar:** ternyata `.ma-content`
  masih memakai `white-space: pre-wrap` peninggalan dari versi teks
  polos lama — ini bikin baris kosong di kode sumber (yang sengaja
  ditulis supaya kode rapi dibaca) ikut dirender jadi jarak kosong
  sungguhan. Sudah dihapus; sekarang jarak antar paragraf normal
  (murni dari `margin-bottom` saja).
- **Navigasi sebelumnya/berikutnya "tidak ada":** sebenarnya sudah
  ada di kode sejak awal, tapi baru muncul kalau ada ≥2 materi dalam
  satu mapel — dengan 1 materi pilot, otomatis kosong. Supaya tidak
  terlihat seperti fitur yang hilang, sekarang ditampilkan
  placeholder ("Ini materi pertama di Matematika" / "Materi
  berikutnya menyusul") alih-alih kosong melompong.
- **Belum ada daftar materi dalam TP/CP yang sama:** ditambahkan
  blok baru "Materi lain dalam tema ini" di tiap halaman detail,
  dan daftar `materi.html` sekarang dikelompokkan dua tingkat
  (mapel → tema), bukan cuma per mapel. Ini masih memakai field
  `tema` sebagai pengganti sementara — begitu dokumen CP/TP/ATP
  resmi kamu kirim, tinggal isi field `tp` di setiap entri
  `materi-index.js` dan ganti pengelompokan dari `tema` ke `tp`
  (satu baris kode di `materi-nav.js` & `materi.html`, sudah diberi
  komentar penanda di kedua file).

---

## 7. Status & log progres

| # | Mapel | Tema | Judul | File | Status | Tanggal |
|---|---|---|---|---|---|---|
| 1 | Matematika | Bilangan | Bilangan Cacah dan Nilai Tempat | `matematika/01-bilangan-cacah-dan-nilai-tempat.html` | ✅ Selesai (pilot pertama) | 2026-07-25 |

**Legenda status:** 🕓 Menunggu bahan · ✍️ Sedang ditulis · ✅ Selesai, siap diunggah · 📤 Sudah diunggah ke GitHub
