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
2. Kamu unggah file itu ke folder yang sesuai di GitHub.
3. **Bookkeeping (`materi-index.js` status + tabel di Bagian 7) HANYA
   di-update sekali setelah SEMUA materi dalam 1 TP selesai ditulis —
   bukan per materi.** Sebelum satu TP selesai penuh, entri di
   `materi-index.js` tetap berstatus `"segera"` walau file aslinya
   sudah lengkap (jadi "🕓 segera hadir" di listing bisa saja sudah
   berisi konten sungguhan — sedikit tidak sinkron secara kosmetik,
   tapi sengaja begini biar prosesnya ringan). Setelah TP-nya
   lengkap, baru semua entrinya diubah ke `"selesai"` sekaligus dan
   tabel Bagian 7 di-refresh dalam satu langkah.
4. Setelah GitHub Pages selesai build (±1 menit), materi baru otomatis
   muncul di `materi.html` dan navigasi sebelumnya/berikutnya di
   materi tetangganya — tidak ada file lain yang perlu disentuh
   kecuali saat batch update di atas.

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

## 6b. Bahasa Indonesia — Roadmap TP dari Dokumen Resmi (2026-07-26)

Tiga dokumen sudah diterima dan dipelajari penuh: **Dokumen 1** (Analisis
CP Fase C), **Scaffolding_BahasaIndonesia_Kelas5.docx** (10 TP + tangga
scaffolding), **PetaAktivitas_BahasaIndonesia_Kelas5.docx** (kalender
mingguan Mg 1–24). Roadmap lengkap di bawah disusun mengikuti struktur
resmi ini — bukan lagi perkiraan tema seperti pilot Matematika.

**Konvensi tambahan khusus mapel dengan banyak TP** (baru berlaku untuk
Bahasa Indonesia, karena Matematika/mapel lain kemungkinan cukup 1
tingkat folder):
```
pages/materi/bahasa-indonesia/{tp-slug}/NN-judul.html
```
Slug TP yang dipakai: `menyimak-tp1`, `menyimak-tp2`,
`membaca-memirsa-tp2`, `berbicara-tp1`, `berbicara-tp2`,
`menulis-pengalaman`, `menulis-pengamatan`, `menulis-gagasan`,
`menulis-imajinasi`. Karena ini SATU folder lebih dalam dari mapel
lain, path ke `index.html`/`materi.html`/`auth-guard.js` di file-file
ini butuh satu `../` ekstra dibanding pola Matematika — sudah
diperhitungkan di template.

Field baru di `materi-index.js`: `elemen` (Menyimak/Membaca dan
Memirsa/Berbicara dan Mempresentasikan/Menulis), `tp` (kode resmi,
mis. "M1"), `status` ("selesai"/"segera"). Field `tema` sekarang berisi
label gabungan "Elemen · Nama TP" yang siap tampil apa adanya.
Navigasi "sebelumnya/berikutnya" dibatasi per TP (tidak melompat ke TP
lain); blok "materi lain" di tiap halaman menampilkan TP lain dalam
elemen yang sama.

**Semua 42 titik dalam roadmap sudah aktif linknya** (halaman "segera
hadir" otomatis dibuat untuk yang belum ditulis) — sesuai permintaan,
supaya navigasi dan gambaran keseluruhan bisa langsung dilihat siswa
walau isinya menyusul.

**Keputusan yang perlu dikonfirmasi:** untuk elemen **Menyimak** dan
**Berbicara TP2** (pembacaan sastra), materi ajar TIDAK akan
menerbitkan teks/audio latihan yang sama dengan yang dipakai guru untuk
menilai di kelas — karena keduanya menguji kemampuan mendengar/tampil
saat itu juga tanpa persiapan baca duluan; menerbitkannya online
duluan berisiko membuat asesmennya tidak lagi mengukur yang seharusnya
diukur. Materi ajar untuk kedua elemen ini akan berisi penjelasan
konsep + contoh LAIN (bukan teks ujian) + tips berlatih di rumah.
Elemen Membaca&Memirsa, Berbicara TP1, dan semua genre Menulis tidak
punya masalah ini, karena produk akhirnya justru yang ditulis/tampilkan
siswa sendiri.

Setiap TP memakai **Alternatif 1** dari dokumen Scaffolding sebagai
jalur default (karena paling umum diterapkan) — kalau ternyata di kelas
dipakai Alternatif 2, atau kombinasi, kabari saja, materinya masih bisa
disesuaikan tanpa mengubah struktur navigasi.

---

## 6c. TP Menulis dari Pengalaman Pribadi — SELESAI 4/4 (2026-07-26)

Semua 4 materi (Tangga 1–3 + Inti) sudah ditulis penuh. `materi-index.js`
dan tabel di Bagian 7 sudah di-update sekaligus sesuai aturan batching
di Bagian 4 (bukan per materi).

## 6d. Perbaikan (2026-07-26) — Bug navigasi & fitur baru

- **Bug kritis navigasi sebelumnya/berikutnya kosong di semua halaman
  Bahasa Indonesia:** `materi-nav.js` sebelumnya mengambil "2 segmen
  terakhir URL" untuk mencocokkan halaman saat ini dengan
  `materi-index.js` — ini cukup untuk Matematika (`matematika/x.html`,
  1 folder), tapi GAGAL untuk Bahasa Indonesia yang punya 1 folder
  ekstra per TP (`bahasa-indonesia/menulis-pengalaman/x.html`, 2
  folder). Akibatnya blok navigasi & "materi lain" selalu kosong di
  semua halaman BI. Diperbaiki: sekarang dicocokkan dengan "URL
  berakhiran .../{file}" (bukan hitung segmen), jadi otomatis benar
  berapa pun kedalaman foldernya. Jumlah `../` pada link juga dihitung
  otomatis dari kedalaman folder tujuan (`upPrefix()`), tidak lagi
  di-hardcode `"../"`. **Perbaikan ini ada di file bersama
  `materi-nav.js` — otomatis berlaku untuk SEMUA halaman materi
  (termasuk 41 halaman "segera hadir") tanpa perlu mengedit satu per
  satu file HTML-nya.**
- **Fitur baru: daftar materi per mapel bisa dibuka/ditutup** di
  `materi.html` — klik nama mapel untuk collapse/expand isinya
  (berguna karena Bahasa Indonesia sendiri sudah 42 entri). Status
  buka/tutup tidak disimpan permanen (reset tiap buka halaman lagi) —
  cukup untuk sekarang, bisa ditingkatkan nanti kalau perlu diingat
  antar-kunjungan.

## 6e. TP Menyimak TP1 (Informasi Penting dari Teks Aural) — SELESAI 4/4 (2026-07-26)

Semua 4 materi ditulis dengan pendekatan "konsep + latihan di rumah",
BUKAN transkrip teks yang dipakai guru menilai di kelas (lihat 6b).
Tiap materi punya latihan berbeda yang bisa dilakukan bersama keluarga
di rumah (respons non-verbal, mendengarkan dengan kriteria, mencatat
dengan gaya sendiri), dan catatan singkat di tiap halaman menjelaskan
kenapa teks latihannya sengaja tidak sama dengan yang dipakai menilai.

## 6f. TP Menyimak TP2 (Hubungan Sebab-Akibat & Urutan) — SELESAI 5/5 (2026-07-26)

Sama seperti M1: pendekatan "konsep + latihan berbeda di rumah", bukan
teks yang dipakai menilai di kelas. Progresi materinya: kata penghubung
→ diagram 2 kotak → rantai kejadian → dua hubungan terpisah → mandiri.

## 6g. TP Membaca dan Memirsa TP2 (Menganalisis Tayangan) — SELESAI 4/4 (2026-07-26)

**Standar kualitas dinaikkan mulai TP ini**, sesuai masukan: penjelasan
lebih detail, tiap konsep dijelaskan dengan 3 contoh berjenjang
kerumitannya (bukan 1-2 seperti TP-TP sebelumnya), dan langkah analisis
ditunjukkan eksplisit, bukan cuma hasil akhirnya. Materi Inti-nya
memuat satu model analisis LENGKAP (gabungan info eksplisit + pesan
tersirat) sebagai contoh sebelum siswa mengerjakan sendiri. TP-TP
berikutnya akan mengikuti standar kedalaman ini — TP-TP lama
(TL-Pengalaman, M1, M2) TIDAK diperbarui ulang, sesuai arahan (fokus
ke depan, bukan revisi ke belakang).

Karena elemen ini bukan oral seperti Menyimak, tidak ada risiko
"bocor" ke penilaian kelas — semua contoh tayangan di sini boleh
sekaya dan sedetail apa pun tanpa masalah.

---

## 7. Status & log progres

| Elemen | TP | Judul | Status |
|---|---|---|---|
| Matematika | – | Bilangan Cacah dan Nilai Tempat | ✅ Selesai (pilot) |
| Menyimak | M1 | Mendengarkan dan Menunjukkan Paham | ✅ Selesai |
| Menyimak | M1 | Memilah Mana yang Penting | ✅ Selesai |
| Menyimak | M1 | Mencatat dengan Caraku Sendiri | ✅ Selesai |
| Menyimak | M1 ⭐ | Menyimak Mandiri: Menangkap Info Penting | ✅ Selesai |
| Menyimak | M2 | Mengenali Kata Penghubung Sebab-Akibat | ✅ Selesai |
| Menyimak | M2 | Memetakan Sebab dan Akibat | ✅ Selesai |
| Menyimak | M2 | Merangkai Beberapa Kejadian Berurutan | ✅ Selesai |
| Menyimak | M2 | Dua Hubungan dalam Satu Cerita | ✅ Selesai |
| Menyimak | M2 ⭐ | Menjelaskan Hubungan Antarkejadian | ✅ Selesai |
| Membaca dan Memirsa | MB2 | Menangkap Informasi dari Tayangan | ✅ Selesai |
| Membaca dan Memirsa | MB2 | Menemukan Pesan Tersembunyi | ✅ Selesai |
| Membaca dan Memirsa | MB2 | Membandingkan Dua Tayangan | ✅ Selesai |
| Membaca dan Memirsa | MB2 ⭐ | Menganalisis Informasi dan Nilai dalam Tayangan | ✅ Selesai |
| Berbicara dan Mempresentasikan | B1 | Bicara ke Satu Teman Dulu | 🕓 Segera hadir (placeholder aktif) |
| Berbicara dan Mempresentasikan | B1 | Menyusun Awal-Isi-Akhir | 🕓 Segera hadir (placeholder aktif) |
| Berbicara dan Mempresentasikan | B1 | Presentasi dengan Alat Bantu | 🕓 Segera hadir (placeholder aktif) |
| Berbicara dan Mempresentasikan | B1 ⭐ | Presentasi Gagasan di Depan Kelas | 🕓 Segera hadir (placeholder aktif) |
| Berbicara dan Mempresentasikan | B2 | Suara yang Mengikuti Rasa (Siklus 1) | 🕓 Segera hadir (placeholder aktif) |
| Berbicara dan Mempresentasikan | B2 | Rasa yang Berubah dalam Satu Cerita (Siklus 2) | 🕓 Segera hadir (placeholder aktif) |
| Berbicara dan Mempresentasikan | B2 ⭐ | Membacakan Karyaku Sendiri (Siklus 3 – Puncak Semester 1) | 🕓 Segera hadir (placeholder aktif) |
| Berbicara dan Mempresentasikan | B2 | Rasa yang Tersembunyi (Siklus 4) | 🕓 Segera hadir (placeholder aktif) |
| Berbicara dan Mempresentasikan | B2 | Tampil di Kelompok Besar (Siklus 5) | 🕓 Segera hadir (placeholder aktif) |
| Berbicara dan Mempresentasikan | B2 ⭐ | Puncak Tahun: Karya Pilihanku (Siklus 6) | 🕓 Segera hadir (placeholder aktif) |
| Menulis | TL-Pengalaman | Mencari Pengalaman yang "Berbahan Cerita" | ✅ Selesai |
| Menulis | TL-Pengalaman | Menyusun Kerangka Ceritaku | ✅ Selesai |
| Menulis | TL-Pengalaman | Menulis Draf Pertama | ✅ Selesai |
| Menulis | TL-Pengalaman ⭐ | Cerita Pengalamanku yang Hidup | ✅ Selesai |
| Menulis | TL-Pengamatan | Mencatat dari Hasil Mengamati | 🕓 Segera hadir (placeholder aktif) |
| Menulis | TL-Pengamatan | Dari Kata Menjadi Kalimat | 🕓 Segera hadir (placeholder aktif) |
| Menulis | TL-Pengamatan | Menyusun Urutan yang Sistematis | 🕓 Segera hadir (placeholder aktif) |
| Menulis | TL-Pengamatan | Melaporkan Kejadian Nyata | 🕓 Segera hadir (placeholder aktif) |
| Menulis | TL-Pengamatan ⭐ | Laporan Pengamatanku Sendiri | 🕓 Segera hadir (placeholder aktif) |
| Menulis | TL-Gagasan | Fakta atau Pendapat? | 🕓 Segera hadir (placeholder aktif) |
| Menulis | TL-Gagasan | Berani Berpendapat | 🕓 Segera hadir (placeholder aktif) |
| Menulis | TL-Gagasan | Pendapat Butuh Alasan | 🕓 Segera hadir (placeholder aktif) |
| Menulis | TL-Gagasan | Alasan yang Lebih Kuat | 🕓 Segera hadir (placeholder aktif) |
| Menulis | TL-Gagasan ⭐ | Menulis Pendapat dan Alasanku | 🕓 Segera hadir (placeholder aktif) |
| Menulis | TL-Imajinasi | Melontarkan Ide-Ide Liar | 🕓 Segera hadir (placeholder aktif) |
| Menulis | TL-Imajinasi | Tokoh dan Latar yang Tak Biasa | 🕓 Segera hadir (placeholder aktif) |
| Menulis | TL-Imajinasi | Menyusun Alur Cerita | 🕓 Segera hadir (placeholder aktif) |
| Menulis | TL-Imajinasi | Kata-Kata yang Punya Rasa | 🕓 Segera hadir (placeholder aktif) |
| Menulis | TL-Imajinasi ⭐ | Ceritaku, Imajinasiku Sendiri | 🕓 Segera hadir (placeholder aktif) |

**Legenda:** ⭐ = Pertemuan Inti/puncak TP tersebut · ✅ Selesai · 🕓 Segera hadir (halaman & link sudah aktif, isi menyusul)

