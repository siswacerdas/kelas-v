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

## 6. Isu lama yang masih terbuka (bukan dari perubahan ini)

`assets/js/auth-guard.js` masih belum ditemukan di file yang kamu berikan — semua halaman materi (lama & baru) bergantung pada file ini untuk gerbang login. Mohon dipastikan file ini memang ada di GitHub sebelum materi baru diunggah, supaya halamannya tidak macet di "Memeriksa akses…".

---

## 7. Status & log progres

| # | Mapel | Tema | Judul | File | Status | Tanggal |
|---|---|---|---|---|---|---|
| 1 | Matematika | Bilangan | Bilangan Cacah dan Nilai Tempat | `matematika/01-bilangan-cacah-dan-nilai-tempat.html` | ✅ Selesai (pilot pertama) | 2026-07-25 |

**Legenda status:** 🕓 Menunggu bahan · ✍️ Sedang ditulis · ✅ Selesai, siap diunggah · 📤 Sudah diunggah ke GitHub
