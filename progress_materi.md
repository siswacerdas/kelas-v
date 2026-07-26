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

---

## 6f. IPAS — Roadmap TP dari Dokumen Resmi (2026-07-26)

Delapan dokumen sudah diterima dan dipelajari penuh: **Dokumen 1** (Analisis
CP Fase C IPAS), **Dokumen 2** (TP Kelas 5, total 58 JP), **6 dokumen
Scaffolding** (satu per topik), dan **PetaAktivitas_IPAS_Kelas5.docx**
(urutan eksekusi + peringatan ketergantungan lintas mapel). Struktur folder
mengikuti pola Bahasa Indonesia (banyak TP per mapel):

```
pages/materi/ipas/{topik-slug}/NN-judul.html
```

Slug topik yang dipakai: `organ-tubuh-tp2`, `organ-tubuh-tp1`,
`bunyi-cahaya`, `ekosistem-tp1`, `ekosistem-tp2`, `ekonomi-masyarakat`,
`letak-geografis`, `sejarah-budaya`. Semua 8 unit / 27 halaman materi
sudah didaftarkan di `materi-index.js` dengan link aktif (pola sama
seperti 42 titik Bahasa Indonesia) — supaya gambaran keseluruhan
kurikulum IPAS bisa langsung dilihat siswa walau isinya menyusul.

**Urutan mengajar TIDAK sama dengan urutan penomoran resmi Dokumen 2** —
mengikuti PetaAktivitas, yang menyusun urutan berdasarkan kesiapan
pedagogis dan ketergantungan antar-topik, bukan urutan TP1→TP2 di
dokumen sumber:

1. Organ Tubuh **TP2** (Struktur & Fungsi Organ) — didahulukan karena
   scaffolding sumbernya sendiri menyebut dirinya "bekal" untuk TP1.
2. Organ Tubuh **TP1** (Respons Tubuh & Refleksi Kesehatan)
3. Bunyi & Cahaya (pemanasan Keterampilan Proses skala kecil) — **ditulis
   duluan atas permintaan eksplisit, lihat 6g di bawah**
4. Ekosistem TP1 (Observasi Biotik-Abiotik)
5. Ekosistem TP2 ⭐ (Percobaan Pertumbuhan Tanaman — proyek andalan,
   berjalan 1–2 minggu kalender, bukan satu slot JP)
6. Ekonomi Masyarakat
7. Letak Geografis — **⚠ butuh Geometri Matematika TP3 (sistem
   berpetak/koordinat) sudah tuntas duluan; Geometri belum ada di web
   saat ini (baru materi Bilangan yang selesai).**
8. Sejarah & Budaya — **⚠ paling akhir, karena butuh 3 hal sudah
   selesai: proyek "Peta Asal Keluarga Kelas Kami" di Pendidikan
   Pancasila (BTI TP1), TP Letak Geografis, dan TP Ekonomi Masyarakat
   IPAS. Mapel Pancasila belum ada sama sekali di web saat ini.**

Topik Kelompok C (tata surya-rotasi-revolusi bumi; energi & mitigasi
iklim) **tidak dibuatkan materi** — didorong penuh ke Kelas 6 sesuai
keputusan Dokumen 1, sama seperti disepakati untuk kurikulum kelasnya.

Field `elemen` diisi untuk topik yang punya >1 TP (Organ Tubuh,
Ekosistem) supaya blok "materi lain" menghubungkan TP1↔TP2 dalam topik
yang sama; topik dengan 1 TP saja (Bunyi-Cahaya, Ekonomi, Letak
Geografis, Sejarah-Budaya) tidak diberi `elemen` (pola sama seperti
Matematika pilot).

Setiap TP memakai **Alternatif 1** dari dokumen Scaffolding sebagai
jalur default (mengikuti pola Bahasa Indonesia) — kalau ternyata di
kelas dipakai Alternatif 2 atau kombinasi, kabari saja, materinya masih
bisa disesuaikan tanpa mengubah struktur navigasi.

**Catatan kejujuran soal JP:** dokumen sumber sendiri (PetaAktivitas,
"Catatan Penutup") mengakui total JP per topik tidak selalu genap
2×jumlah pertemuan (mis. Organ Tubuh TP1 tertulis "6 pertemuan, 8 JP" di
scaffolding sumber tapi "12 JP" dengan standar 2 JP/pertemuan) —
dibiarkan apa adanya sesuai dokumen sumber, tidak memengaruhi struktur
halaman/jumlah materi yang ditulis.

## 6g. Bunyi & Cahaya — SELESAI 5/5 (2026-07-26)

Ditulis lebih dulu dari 8 unit TP IPAS atas permintaan eksplisit
(bukan mengikuti urutan pedagogis PetaAktivitas yang menempatkan Organ
Tubuh duluan). Alternatif 1 ("Bunyi Dulu, Cahaya Kemudian") dipakai
sebagai jalur utama. Kelima materi mengikuti siklus Keterampilan Proses
penuh: mengamati → memprediksi → eksperimen (telepon kaleng +
pemantulan cahaya senter) → menganalisis data (tabel perbandingan) →
menjelaskan kaitan dengan fenomena sehari-hari (⭐ inti). Tidak menuntut
produk akhir formal, sesuai catatan dokumen sumber. `materi-index.js`
untuk kelima entri ini sudah diubah ke `"selesai"` (aturan batching di
Bagian 4 sudah dipenuhi karena seluruh TP ini rampung sekaligus). 22
materi IPAS lainnya (7 unit TP tersisa) terdaftar dengan status
`"segera"`, halaman placeholder aktif, siap dilanjutkan topik demi
topik sesuai arahan berikutnya.

## 6h. Standar Baru: "Kalau Masih Bingung" + "Contoh Soal & Pembahasan" (2026-07-26)

Setelah dicek, versi awal 5 materi Bunyi & Cahaya dinilai kurang: minim
contoh kontekstual yang panjang, dan **tidak ada soal cek pemahaman yang
disertai jawaban+penjelasan** — padahal materi ajar ini harus bisa
dipakai belajar mandiri oleh siswa dengan kemampuan dasar berbeda-beda,
bukan cuma siswa yang sudah kuat secara kognitif.

Ditetapkan sebagai **standar wajib untuk SEMUA halaman materi IPAS
(dan idealnya mapel lain) mulai sekarang**, dua komponen baru:

- **🧩 Kalau Masih Bingung** — kotak penjelasan ulang pakai analogi
  yang lebih sederhana/konkret (bukan pengulangan kalimat yang sama),
  untuk siswa yang belum nyantol di penjelasan utama. Ditaruh setelah
  penjelasan konsep inti halaman.
- **📝 Contoh Soal & Pembahasan** — 2–3 soal cek pemahaman per halaman,
  tiap soal WAJIB disertai jawaban DAN alasan/penjelasan lengkap (bukan
  kunci jawaban telanjang), supaya siswa bisa menilai sendiri
  pemahamannya tanpa didampingi guru. Soal sebaiknya naik tingkat
  kesulitannya (soal 1-2 aplikasi langsung, soal terakhir menuntut
  penalaran/transfer ke konteks baru).

**Diputuskan TIDAK menambahkan** kotak tantangan/pengayaan untuk siswa
yang sudah lancar — fokus dulu ke memastikan siswa dengan kemampuan
dasar lemah bisa terbantu, baru dipertimbangkan lagi nanti kalau
diminta.

Kelas CSS baru yang dipakai (didefinisikan inline per halaman untuk
saat ini, belum dipindah ke `materi.css` global): `.bingung-box`,
`.bingung-label`, `.soal-box`, `.soal-head`, `.soal-item`, `.soal-q`,
`.soal-a`. Kelima file Bunyi & Cahaya sudah direvisi mengikuti standar
ini. **22 materi IPAS lain yang masih placeholder "segera hadir" WAJIB
ditulis mengikuti standar ini sejak awal**, bukan ditulis dulu baru
direvisi belakangan.

---

## 7. Status & log progres

| Elemen | TP | Judul | Status |
|---|---|---|---|
| Matematika | – | Bilangan Cacah dan Nilai Tempat | ✅ Selesai (pilot) |
| Menyimak | M1 | Mendengarkan dan Menunjukkan Paham | ✅ Selesai |
| Menyimak | M1 | Memilah Mana yang Penting | ✅ Selesai |
| Menyimak | M1 | Mencatat dengan Caraku Sendiri | ✅ Selesai |
| Menyimak | M1 ⭐ | Menyimak Mandiri: Menangkap Info Penting | ✅ Selesai |
| Menyimak | M2 | Mengenali Kata Penghubung Sebab-Akibat | 🕓 Segera hadir (placeholder aktif) |
| Menyimak | M2 | Memetakan Sebab dan Akibat | 🕓 Segera hadir (placeholder aktif) |
| Menyimak | M2 | Merangkai Beberapa Kejadian Berurutan | 🕓 Segera hadir (placeholder aktif) |
| Menyimak | M2 | Dua Hubungan dalam Satu Cerita | 🕓 Segera hadir (placeholder aktif) |
| Menyimak | M2 ⭐ | Menjelaskan Hubungan Antarkejadian | 🕓 Segera hadir (placeholder aktif) |
| Membaca dan Memirsa | MB2 | Menangkap Informasi dari Tayangan | 🕓 Segera hadir (placeholder aktif) |
| Membaca dan Memirsa | MB2 | Menemukan Pesan Tersembunyi | 🕓 Segera hadir (placeholder aktif) |
| Membaca dan Memirsa | MB2 | Membandingkan Dua Tayangan | 🕓 Segera hadir (placeholder aktif) |
| Membaca dan Memirsa | MB2 ⭐ | Menganalisis Informasi dan Nilai dalam Tayangan | 🕓 Segera hadir (placeholder aktif) |
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
| Sistem Organ Tubuh | OT-TP2 | Mengamati Diagram Organ Utama Tubuh | 🕓 Segera hadir (placeholder aktif) |
| Sistem Organ Tubuh | OT-TP2 ⭐ | Fungsi Organ dan Menjaga Kesehatan Tubuh | 🕓 Segera hadir (placeholder aktif) |
| Sistem Organ Tubuh | OT-TP1 | Meraba Detak Jantung Sendiri | 🕓 Segera hadir (placeholder aktif) |
| Sistem Organ Tubuh | OT-TP1 | Menebak Detak Jantung Setelah Bergerak | 🕓 Segera hadir (placeholder aktif) |
| Sistem Organ Tubuh | OT-TP1 | Mengukur Detak Jantung Sebelum dan Sesudah Aktivitas | 🕓 Segera hadir (placeholder aktif) |
| Sistem Organ Tubuh | OT-TP1 | Membandingkan Detak Jantung Antarteman | 🕓 Segera hadir (placeholder aktif) |
| Sistem Organ Tubuh | OT-TP1 | Prediksi vs Kenyataan: Detak Jantung dan Kebiasaanku | 🕓 Segera hadir (placeholder aktif) |
| Sistem Organ Tubuh | OT-TP1 ⭐ | Refleksiku tentang Aktivitas Fisik dan Kesehatan Jantung | 🕓 Segera hadir (placeholder aktif) |
| Bunyi dan Cahaya | BC-TP1 | Mengamati Bunyi dan Cahaya di Sekitar | ✅ Selesai |
| Bunyi dan Cahaya | BC-TP1 | Memprediksi Bunyi dan Cahaya | ✅ Selesai |
| Bunyi dan Cahaya | BC-TP1 | Eksperimen Telepon Kaleng dan Pemantulan Cahaya | ✅ Selesai |
| Bunyi dan Cahaya | BC-TP1 | Membandingkan Hasil Antarbahan | ✅ Selesai |
| Bunyi dan Cahaya | BC-TP1 ⭐ | Bunyi dan Cahaya dalam Kehidupan Sehari-hari | ✅ Selesai |
| Ekosistem | EKOS-TP1 | Mengenali Ciri Benda Hidup dan Tak Hidup | 🕓 Segera hadir (placeholder aktif) |
| Ekosistem | EKOS-TP1 | Mencatat Komponen Ekosistem di Sekitar Sekolah | 🕓 Segera hadir (placeholder aktif) |
| Ekosistem | EKOS-TP1 ⭐ | Menduga Hubungan Antarkomponen Ekosistem | 🕓 Segera hadir (placeholder aktif) |
| Ekosistem | EKOS-TP2 | Variabel yang Diubah dan yang Dijaga Tetap | 🕓 Segera hadir (placeholder aktif) |
| Ekosistem | EKOS-TP2 | Merancang Percobaan Pertumbuhan Tanaman | 🕓 Segera hadir (placeholder aktif) |
| Ekosistem | EKOS-TP2 | Mencatat Pertumbuhan Tanaman Secara Berkala | 🕓 Segera hadir (placeholder aktif) |
| Ekosistem | EKOS-TP2 | Mengevaluasi Hasil Percobaan Tanaman | 🕓 Segera hadir (placeholder aktif) |
| Ekosistem | EKOS-TP2 ⭐ | Menyajikan Hasil Percobaan dengan Data (Proyek Andalan) | 🕓 Segera hadir (placeholder aktif) |
| Kegiatan Ekonomi Masyarakat | EKON-TP1 | Mencatat Jenis Usaha di Sekitarku | 🕓 Segera hadir (placeholder aktif) |
| Kegiatan Ekonomi Masyarakat | EKON-TP1 ⭐ | Mengklasifikasikan Kegiatan Ekonomi | 🕓 Segera hadir (placeholder aktif) |
| Letak Geografis Indonesia | GEO-TP1 | Menandai Posisi Geografis Indonesia | 🕓 Segera hadir (placeholder aktif) |
| Letak Geografis Indonesia | GEO-TP1 ⭐ | Membaca Letak Indonesia dengan Sistem Berpetak | 🕓 Segera hadir (placeholder aktif) |
| Sejarah dan Budaya | BUDAYA-TP1 | Mengingat Kembali Peta Asal Keluarga Kelas Kami | 🕓 Segera hadir (placeholder aktif) |
| Sejarah dan Budaya | BUDAYA-TP1 ⭐ | Menghubungkan Geografis, Ekonomi, dan Budaya Keluarga | 🕓 Segera hadir (placeholder aktif) |

**Legenda:** ⭐ = Pertemuan Inti/puncak TP tersebut · ✅ Selesai · 🕓 Segera hadir (halaman & link sudah aktif, isi menyusul)

