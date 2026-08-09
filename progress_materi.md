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
3. **Bookkeeping (`materi-index.js` status + tabel di Bagian 9) HANYA
   di-update sekali setelah SEMUA materi dalam 1 TP selesai ditulis —
   bukan per materi.** Sebelum satu TP selesai penuh, entri di
   `materi-index.js` tetap berstatus `"segera"` walau file aslinya
   sudah lengkap (jadi "🕓 segera hadir" di listing bisa saja sudah
   berisi konten sungguhan — sedikit tidak sinkron secara kosmetik,
   tapi sengaja begini biar prosesnya ringan). Setelah TP-nya
   lengkap, baru semua entrinya diubah ke `"selesai"` sekaligus dan
   tabel Bagian 9 di-refresh dalam satu langkah.
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
- **Standar kualitas (berlaku sejak TP Membaca-Memirsa TP2):** tiap konsep dijelaskan dengan minimal 3 contoh berjenjang kerumitannya, langkah analisis ditunjukkan eksplisit (bukan cuma hasil akhir), dan materi Inti tiap TP memuat satu model analisis/pengerjaan lengkap sebelum instruksi tugas mandiri.
- **Standar baru (berlaku sejak Berbicara TP1 materi ke-2, 2026-07-26): setiap materi WAJIB memuat bagian "✅ Cek Pemahamanmu"** — 2-3 pertanyaan pemahaman konsep, format `<details>/<summary>` (klik untuk lihat jawaban, TANPA sistem skor/kuis — itu tetap di luar cakupan proyek ini), tiap jawaban disertai penjelasan singkat kenapa itu benar. Tujuannya: siswa bisa memverifikasi & membenarkan sendiri pemahamannya, terlepas dari kemampuan dasar yang dibawa, tanpa perlu menunggu guru. Ditempatkan setelah contoh-contoh, sebelum bagian "Yuk Coba Sendiri". Materi yang dibuat SEBELUM aturan ini (TL-Pengalaman, Menyimak M1/M2, Membaca-Memirsa MB2, Berbicara TP1 materi 1) TIDAK diubah ulang, sesuai arahan.

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
dan tabel di Bagian 9 sudah di-update sekaligus sesuai aturan batching
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

## 6h. TP Berbicara TP1 (Presentasi Gagasan) — SELESAI 4/4 (2026-07-26)

Progresi: poin bebas ke 1 pendengar → struktur Awal-Isi-Akhir ke
kelompok kecil → alat bantu visual ke kelompok gabungan → mandiri di
depan kelas. **Fitur "✅ Cek Pemahamanmu" (accordion tanya-jawab)
diperkenalkan mulai materi ke-2 TP ini** — lihat Bagian 5 untuk
standarnya. Materi 1 TP ini dibuat sebelum standar itu ada, jadi
belum punya bagian tersebut (sengaja tidak diubah, sesuai arahan).

## 6i. TP Berbicara TP2 (Membacakan Karya Sastra, siklus berkelanjutan) — SELESAI 6/6 (2026-07-26)

Karena diminta lanjut tanpa memilih opsi (siklus asli vs sekaligus),
dipilih pendekatan konsisten dengan TP-TP lain: keenam siklus ditulis
sekaligus sekarang, sesuai jadwal asli (Siklus 1-2 & 3 semester ini,
Siklus 4-6 semester depan) TAPI kontennya semua sudah siap sekarang —
bisa dipakai persis sesuai jadwalnya nanti. Progresi: 1 rasa tetap →
rasa berubah → karya sendiri (puncak semester 1) → rasa tersembunyi →
kelompok besar → karya pilihan terbaik (puncak tahun). Siklus 3 & 6
sengaja terhubung ke materi Menulis (siswa membacakan karya tulisan
sendiri) sebagai penghubung lintas-elemen.

**Koreksi penting: BUKAN seluruh Bahasa Indonesia selesai.** Yang
sudah selesai: Menyimak TP1 & TP2, Membaca-Memirsa TP2, Berbicara TP1
& TP2 (6 dari 9 TP, 27 dari 42 materi). **Masih tersisa 3 TP Menulis**
yang belum ditulis sama sekali: Menulis-Pengamatan (5), Menulis-Gagasan
(5), Menulis-Imajinasi (5) — total 15 materi lagi untuk menuntaskan
seluruh Bahasa Indonesia.

## 6j. TP Menulis-Pengamatan — SELESAI 5/5 (2026-07-26)

Progresi: catat kata/frasa dari benda diam → kembangkan jadi kalimat
→ susun urutan sistematis (umum-khusus/posisi/indra) → laporan
peristiwa dengan kalimat majemuk (kata hubung waktu: lalu, kemudian,
sambil, saat) → mandiri pada objek baru. Materi Inti (5) sempat
kelewatan bagian "Cek Pemahamanmu" saat pertama ditulis, sudah
ditambahkan sebelum dianggap selesai.

**Sisa: Menulis-Gagasan (5) dan Menulis-Imajinasi (5) — 10 materi
lagi untuk menuntaskan seluruh Bahasa Indonesia.**

## 6k. TP Menulis-Gagasan — SELESAI 5/5 (2026-07-26)

Progresi: bedakan fakta vs pendapat → nyatakan pendapat tegas tanpa
alasan → tambah alasan dengan "karena" → variasi kata sambung
("sehingga", "meskipun" untuk mengakui sisi lain) → mandiri pada
topik baru. Teknik "meskipun" sengaja dihubungkan dengan teknik
serupa yang sudah dipelajari di Berbicara TP1 (mengakui kekhawatiran
sebelum menjelaskan solusi) sebagai penghubung lintas-elemen.

**Sisa: Menulis-Imajinasi (5) — TP TERAKHIR untuk menuntaskan seluruh
Bahasa Indonesia.**

## 6l. TP Menulis-Imajinasi — SELESAI 5/5 (2026-07-26)

Progresi: lontarkan ide liar bebas → kembangkan jadi tokoh & latar
detail → susun alur Awal-Tengah-Akhir (dihubungkan balik ke struktur
Menulis-Pengalaman) → kata konotatif untuk menambah kesan → cerita
utuh mandiri. Materi Inti memakai contoh baru ("Do", sepatu yang
bernyanyi lagu sedih) sebagai model, dan sekaligus jadi banner
penutup untuk SELURUH mata pelajaran Bahasa Indonesia.

---

## ✅ SELURUH BAHASA INDONESIA SELESAI: 9 TP, 42 materi (2026-07-26)

Semua elemen (Menyimak, Membaca dan Memirsa, Berbicara, Menulis)
sudah lengkap ditulis dengan standar kualitas dari Bagian 5. Tidak
ada lagi materi Bahasa Indonesia yang berstatus "segera hadir".

**Fase berikutnya (per 2026-07-27):** IPAS sudah tuntas 27/27 materi
(lihat Bagian 7), dan Matematika sedang berjalan — 5/64 pertemuan
selesai (lihat Bagian 8). Lima mapel lain masih placeholder kosong:
Pendidikan Agama Islam dan Budi Pekerti, Pendidikan Pancasila, Seni
Budaya, PJOK, Bahasa Inggris. Menunggu dokumen CP/TP/ATP resmi untuk
mapel tersebut kalau tersedia.

---

## 7. IPAS — Roadmap TP dari Dokumen Resmi (2026-07-26)

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
   duluan atas permintaan eksplisit, lihat 7a di bawah**
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

## 7a. Bunyi & Cahaya — SELESAI 5/5 (2026-07-26)

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

## 7b. Standar Baru: "Kalau Masih Bingung" + "Contoh Soal & Pembahasan" (2026-07-26)

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

## 7c. Sistem Organ Tubuh TP2 — SELESAI 2/2 (2026-07-26)

Unit kedua yang ditulis, menyusul urutan PetaAktivitas (organ tubuh
didahulukan setelah Bunyi & Cahaya). Alternatif 1 ("Diagram Digital via
Proyektor") dipakai sebagai jalur utama — organ dalam tidak diamati
langsung (tidak mungkin bagi anak SD), jadi materi 1 murni pengenalan
letak/bentuk lewat diagram, dan materi 2 (⭐ inti) fokus fungsi tiap
organ dikaitkan kebiasaan sehat. Mengikuti standar 7b penuh: kotak
"Kalau Masih Bingung" (analogi rumah — jantung=pompa air, paru-paru=
balon kembar, pencernaan=selang panjang, dipakai konsisten di kedua
halaman) dan "Contoh Soal & Pembahasan" (3 soal per halaman). `status`
kedua entri di `materi-index.js` sudah diubah ke `"selesai"`.

## 7d. Sistem Organ Tubuh TP1 — SELESAI 6/6 (2026-07-26)

Unit ketiga IPAS yang ditulis. Alternatif 1 ("Lompat Tali") dipakai
sebagai jalur utama. Siklus Keterampilan Proses lengkap: meraba nadi →
memprediksi (analogi mesin motor) → mengukur sebelum-sesudah lompat
tali (analogi lomba lari adil dari 7b, dipakai ulang untuk konsep
"pengukuran yang adil") → menyusun tabel kelas (nomor urut/inisial,
bukan nama — sesuai catatan privasi di dokumen sumber) → membandingkan
prediksi vs kenyataan sambil dikaitkan kebiasaan pribadi → refleksi
personal (⭐ inti). Mengikuti standar 7b penuh di keenam halaman. Status
6 entri di `materi-index.js` sudah diubah ke `"selesai"`.

**Progres IPAS sejauh ini: 13/27 materi selesai** (Bunyi & Cahaya 5/5,
Organ Tubuh TP2 2/2, Organ Tubuh TP1 6/6). Sisa 14 materi di 5 unit TP:
Ekosistem TP1 (3), Ekosistem TP2 (5), Ekonomi Masyarakat (2), Letak
Geografis (2, masih menunggu kepastian Geometri Matematika), Sejarah &
Budaya (2, masih menunggu kepastian Pancasila BTI TP1).

## 7e. Ekosistem TP1 + TP2 (Proyek Andalan) — SELESAI 8/8 (2026-07-26)

Unit keempat dan kelima IPAS. Alternatif 1 dipakai di kedua TP ("Kebun
Pot Bawaan Siswa" untuk TP1, "Kacang Hijau di Kelas" untuk TP2).

TP1 (3 halaman): ciri makhluk hidup vs benda tak hidup (sengaja
membongkar miskonsepsi "gerak = hidup" lewat analogi robot mainan vs
kaktus diam) → checklist observasi kebun mini (analogi absensi kelas)
→ menduga hubungan antarkomponen (analogi domino, ⭐ inti).

TP2 / Proyek Andalan (5 halaman): variabel diubah vs dijaga tetap lewat
latihan pesawat kertas (analogi resep kue) → merancang percobaan kacang
hijau dengan kerangka diberi tapi detail teknis diputuskan kelompok →
mencatat pertumbuhan berkala 1-2 minggu (analogi papan tinggi badan di
dinding rumah) → mengevaluasi hasil vs prediksi dengan penekanan
kejujuran ilmiah (analogi koki mengevaluasi resep gagal) → menyajikan
hasil dengan argumen berbasis data (analogi reporter berita/pengacara
di sidang, ⭐ inti, memakai kembali pola "kesimpulan lemah vs kuat" dari
materi Bunyi & Cahaya).

Standar 7b (Kalau Masih Bingung + Contoh Soal & Pembahasan) diterapkan
penuh di kedelapan halaman. Status kedelapan entri di `materi-index.js`
sudah diubah ke `"selesai"`.

**Progres IPAS sejauh ini: 21/27 materi selesai.** Sisa 6 materi di 3
unit TP: Ekonomi Masyarakat (2), Letak Geografis (2, masih menunggu
kepastian Geometri Matematika), Sejarah & Budaya (2, masih menunggu
kepastian Pancasila BTI TP1).

## 7f. Kegiatan Ekonomi Masyarakat — SELESAI 2/2 (2026-07-26)

Unit keenam IPAS, satu-satunya di antara sisa 3 unit yang tidak punya
ketergantungan lintas mapel sehingga dikerjakan lebih dulu. Alternatif
1 ("Observasi Mandiri Sekitar Rumah") dipakai. Materi 1: observasi
jenis usaha nyata di sekitar rumah — sengaja ditekankan bahwa semua
skala usaha (pedagang keliling sampai toko besar) sama berharganya
untuk diamati, mengikuti catatan sensitivitas di dokumen sumber
("hindari menilai latar ekonomi keluarga siswa") tanpa menyebutnya
eksplisit ke siswa, cukup lewat framing non-menghakimi. Materi 2 (⭐
inti): klasifikasi produksi/distribusi/konsumsi lewat analogi alur air
PDAM dan alur nasi (petani→pedagang→keluarga), termasuk soal yang
menunjukkan satu orang bisa berperan di kategori berbeda tergantung
kegiatannya. Standar 7b diterapkan penuh. Status kedua entri di
`materi-index.js` sudah diubah ke `"selesai"`.

**Progres IPAS sejauh ini: 23/27 materi selesai.** Sisa 4 materi di 2
unit, keduanya masih menunggu kepastian mapel lain: Letak Geografis (2,
menunggu Geometri Matematika) dan Sejarah & Budaya (2, menunggu
Pancasila BTI TP1).

## 7g. Letak Geografis + Sejarah & Budaya — SELESAI 4/4, IPAS TUNTAS 27/27 (2026-07-26)

Dua unit terakhir ditulis TANPA menunggu kepastian status Geometri
Matematika/Pancasila BTI TP1 — atas instruksi untuk lanjut, keduanya
dibuat **mandiri (self-contained)** supaya tidak mengasumsikan
pengalaman lintas mapel yang mungkin belum dialami siswa:

- **Letak Geografis** (2 halaman): materi 1 letak Indonesia
  antara 2 benua/2 samudra (analogi rumah di antara dua tetangga & dua
  kolam renang). Materi 2 (⭐ inti) memuat catatan pengantar eksplisit
  di awal ("kalau sudah belajar sistem berpetak di Matematika... kalau
  belum, kita bahas dasarnya di sini") lalu mengajarkan konsep grid
  baris-kolom dari nol dengan diagram visual + analogi nomor kursi
  bioskop — supaya berfungsi baik dipakai sebelum maupun sesudah
  Geometri Matematika digarap.
- **Sejarah & Budaya** (2 halaman): materi 1 TIDAK mengasumsikan proyek
  "Peta Asal Keluarga Kelas Kami" sudah ada — dibuka dengan catatan
  bersyarat ("kalau kelasmu sudah pernah membuat... kalau belum, kita
  mulai dari pertanyaan sederhana") lalu tetap mencapai tujuan yang
  sama (menumbuhkan rasa ingin tahu asal-usul keluarga) lewat jalur
  mandiri. Materi 2 (⭐ inti) menghubungkan letak geografis-ekonomi-
  budaya lewat analogi 3 potongan puzzle. Sensitivitas konteks lokal
  (sejarah lokal sensitif, keragaman latar keluarga) dijaga sesuai
  catatan dokumen sumber — tidak membahas peristiwa sejarah lokal
  secara mendalam, hanya sebagai pemantik rasa ingin tahu.

Standar 7b diterapkan penuh di keempat halaman. Status keempat entri di
`materi-index.js` sudah diubah ke `"selesai"`.

**🎉 SELURUH 27 MATERI IPAS KELAS 5 SUDAH SELESAI DITULIS.** Delapan
unit TP, dari Bunyi & Cahaya sampai Sejarah & Budaya, semuanya
mengikuti standar konten 6h (Kalau Masih Bingung + Contoh Soal &
Pembahasan). Kalau nanti dipastikan Geometri Matematika/Pancasila BTI
sudah diajarkan lebih dulu di kelas nyata, kedua unit terakhir ini bisa
disunting ulang untuk merujuk langsung ke pengalaman itu (opsional,
tidak wajib — versi mandiri saat ini sudah berfungsi baik apa adanya).

---

---

## 7h. Letak Geografis + Sejarah & Budaya — DITULIS ULANG jadi 5 Sub-Materi (2026-08-01)

Atas permintaan eksplisit, kedua unit ini **ditulis ulang dari nol**
dengan interpretasi bebas (tidak terikat literal pada dokumen
Scaffolding aslinya, yang dinilai belum cukup mendalam) — dari
masing-masing 2 halaman menjadi **5 sub-materi** (4 tangga + 1 inti),
tetap berpegang pada teks CP resmi sebagai acuan, dan tetap menjaga
kehati-hatian yang sama soal sejarah lokal sensitif dan keragaman latar
ekonomi keluarga.

**Letak Geografis Indonesia (5 halaman):**
1. Mengenal Peta dan Bentuk Wilayah Indonesia — negara kepulauan
   terbesar di dunia, ±17.000 pulau, lima pulau besar
2. Posisi Indonesia di Antara Dua Benua dan Dua Samudra — posisi
   silang dunia, kaitan historis jalur rempah-rempah
3. Garis Khatulistiwa dan Iklim Tropis Indonesia — **materi baru**,
   memperdalam cakupan CP dengan konsep iklim tropis/dua musim,
   dihubungkan balik ke unit Kegiatan Ekonomi Masyarakat
4. Membaca Letak dengan Sistem Berpetak — tetap mandiri
   (self-contained), tidak mengasumsikan Geometri Matematika TP3 sudah
   diajarkan
5. ⭐ Menjelaskan Letak Geografis Indonesia — sintesis keempat materi
   sebelumnya jadi satu penjelasan utuh dengan alur sebab-akibat

**Sejarah dan Keragaman Budaya Sekitar (5 halaman):**
1. Mengenal Keragaman Budaya di Sekitar Kita — **materi baru**,
   Bhinneka Tunggal Ika, rumah/pakaian/bahasa/makanan adat
2. Sejarah Asal-Usul Keluargaku — tetap mandiri, tidak mengasumsikan
   proyek Pancasila "Peta Asal Keluarga" sudah ada
3. Menghargai Perbedaan sebagai Kekayaan Bersama — **materi baru**,
   sikap non-menghakimi terhadap perbedaan, memakai ulang prinsip dari
   unit Ekonomi Masyarakat (jangan menilai latar keluarga)
4. Mengenal Pahlawan di Lingkungan Sekitar — **materi baru**, "pahlawan"
   didefinisikan luas (bukan cuma pahlawan nasional), sengaja TIDAK
   menyinggung peristiwa sejarah lokal spesifik/sensitif apa pun,
   eksplisit mengarahkan siswa untuk tidak mendalami cerita sensitif
   yang mungkin muncul saat bertanya ke keluarga
5. ⭐ Menghubungkan Geografis, Ekonomi, Sejarah, dan Budaya Keluargaku —
   sintesis 4 unsur (bertambah satu dari versi lama yang cuma 3),
   dengan Sejarah Keluarga sebagai unsur baru yang eksplisit dirangkai

Standar 7b (Kalau Masih Bingung + Contoh Soal & Pembahasan) diterapkan
penuh di seluruh 10 halaman baru. 4 entri lama di `materi-index.js`
dihapus, digantikan 10 entri baru, semuanya `"selesai"`.

**IPAS sekarang: 33/33 materi selesai** (bertambah dari 27, karena
kedua unit ini masing-masing mendapat 3 halaman tambahan).

---

## 8. MATEMATIKA — Roadmap dari Dokumen Resmi (2026-07-27)

Delapan dokumen diterima dan dipelajari penuh: **Dokumen 1** (Analisis
CP Fase C Matematika), **Dokumen 2** (TP Kelas 5, 156 JP), **5 dokumen
Scaffolding** (satu per elemen: Bilangan, Aljabar, Pengukuran, Geometri,
Analisis Data & Peluang), dan **PetaAktivitas_Matematika_Kelas5.docx**
(urutan eksekusi definitif). Struktur folder mengikuti pola IPAS:

```
pages/materi/matematika/{elemen-tpN}/NN-judul.html
```

**Total: 21 TP, 64 pertemuan** (PetaAktivitas mengoreksi total Bilangan
dari 21 menjadi 24 pertemuan — penjumlahan eksplisit per-TP lebih
akurat daripada ringkasan di dokumen Bilangan sendiri).

**Beda penting dari IPAS/Bahasa Indonesia/Pancasila:** Matematika
**tidak** memakai Alternatif 1/2 — jalur tunggal per TP, karena dokumen
sumbernya sudah sangat preskriptif tanpa percabangan pedagogis.

**Urutan mengajar TIDAK berurutan per elemen** — mengikuti PetaAktivitas
persis, termasuk satu penyisipan sengaja:

Bilangan TP1–TP7 (24) → Aljabar TP1–TP2 (7) → **Geometri TP3 disisipkan
di sini (2)** → Aljabar TP3–TP4 (5) → Pengukuran TP1–TP4 (11) →
Geometri TP1–TP2 (6) → Data & Peluang TP1–TP3 (9)

Geometri TP3 (sistem berpetak/koordinat) sengaja "dicabut" dari
rangkaian Geometri dan diajarkan berdekatan dengan Aljabar TP2, karena
secara konseptual itu kompetensi berpikir aljabaris (posisi = pasangan
terurut), bukan geometri bentuk-ruang — field `elemen` tetap diisi
"Geometri" untuk ketiga TP Geometri (termasuk TP3) supaya blok "materi
lain" tetap menghubungkan ketiganya, walau posisi mengajarnya terpisah.

**Ini juga mengonfirmasi ketergantungan lintas mapel IPAS Letak
Geografis** — Geometri TP3 inilah persis yang dimaksud "Geometri
Matematika TP3" pada catatan progress IPAS sebelumnya (lihat Bagian
6f). Dokumen sumber Matematika sendiri mencatat keterkaitan ini sebagai
catatan kontekstual, keputusan integrasi diserahkan ke guru.

**Dua status khusus yang wajib diingat saat menulis kontennya nanti:**
- **Aljabar TP1** (simbol "=" sebagai relasi, pakai timbangan fisik) —
  **remediasi wajib**, bukan pengayaan. Jangan dilewati meski terlihat
  mudah/kekanak-kanakan — akar masalahnya adalah miskonsepsi guru yang
  diwariskan turun-temurun (simbol "=" diajarkan sebagai "hasil",
  bukan kesetaraan dua arah).
- **Data & Peluang TP2** (mean-median-modus) — **pengayaan** di luar
  tuntutan minimum CP (CP Fase C berhenti di penyajian data, tidak
  menyentuh ukuran pemusatan). Boleh disesuaikan/dipercepat kalau
  kalender kelas ketat.

Icon per elemen: Bilangan 🔢, Aljabar ⚖️, Pengukuran 📏, Geometri 📐,
Analisis Data dan Peluang 📊. Field `elemen` diisi untuk semua TP
(semua elemen Matematika multi-TP) supaya blok "materi lain"
menghubungkan antar-TP dalam elemen yang sama.

Seluruh 64 slot sudah didaftarkan di `materi-index.js` dengan status
`"segera"` (link aktif, placeholder), kecuali Bilangan TP1 yang sudah
ditulis penuh — pola yang sama seperti IPAS: gambaran keseluruhan
kurikulum langsung terlihat walau isinya menyusul.

## 8a. Bilangan TP1 — SELESAI 1/1, Revisi Pilot (2026-07-27)

Pilot lama "Bilangan Cacah dan Nilai Tempat" (di `matematika/01-....html`,
flat file tanpa folder TP) **dihapus dan ditulis ulang** di
`matematika/bilangan-tp1/01-nilai-tempat-dan-perbandingan-bilangan-cacah.html`.

**Masalah pilot lama:** mengajarkan nilai tempat sampai **jutaan** (7
digit, contoh 3.482.951) — melebihi cakupan resmi Dokumen 2 TP1 yang
membatasi sampai **100.000** (ratus ribuan, 6 digit). Versi baru
dibatasi ketat sampai 100.000, sesuai dokumen sumber.

Konten baru mengikuti standar 7b penuh: nilai tempat lewat contoh angka
nyata (40.508) dengan penekanan pada angka nol di tengah (titik rawan
menurut rubrik Dokumen 2), analogi pecahan uang rupiah untuk nilai
tempat, aturan 2 langkah membandingkan bilangan (jumlah digit dulu,
baru digit terkiri) untuk membongkar miskonsepsi umum "membandingkan
dari digit pertama yang terlihat tanpa cek jumlah digit dulu" (soal
9.876 vs 10.234), kotak "Kalau Masih Bingung" (analogi rumah
bertingkat), dan 3 Contoh Soal & Pembahasan.

Status entri Bilangan TP1 di `materi-index.js` sudah `"selesai"`.

**Progres Matematika sejauh ini: 1/64 pertemuan selesai.**

## 8b. Bilangan TP2 — SELESAI 4/4 (2026-07-27)

Unit kedua Matematika: pengurangan bersusun dengan peminjaman berganda,
tepat mengikuti progresi Titik Berangkat → Garis Finis dari dokumen
sumber (satu kali peminjaman → dua peminjaman berurutan → peminjaman
menembus angka nol → soal cerita). Analogi tunggal dipakai konsisten
lintas keempat halaman dan dibangun bertahap: tukar kelereng per-10 →
tukar uang Rp10.000 jadi Rp1.000 → tukar berantai dari Rp50.000 saat
tidak ada uang kecil sama sekali (untuk kasus angka nol berantai).
Materi 3 secara eksplisit memakai contoh 50.004 − 28.756 langsung dari
dokumen sumber (kasus rawan kesalahan yang disebut Dokumen 1). Materi 4
(⭐ inti) memuat soal cerita dua-langkah (sisa saldo berturut-turut)
sesuai instruksi dokumen, plus soal yang menuntut penjumlahan DAN
pengurangan sekaligus untuk melatih membaca soal cerita secara utuh,
bukan langsung mengurangi tanpa berpikir.

Perhatian khusus pada miskonsepsi "mencongak sebagian" yang diperingatkan
Dokumen 1 dan catatan rubrik dokumen sumber — dua soal & pembahasan
secara eksplisit menyoal PROSES peminjaman (bukan cuma jawaban akhir),
konsisten dengan instruksi "asesmen dinilai per langkah, bukan hanya
hasil akhir".

Standar 7b diterapkan penuh. Status keempat entri di `materi-index.js`
sudah diubah ke `"selesai"`.

**Progres Matematika sejauh ini: 5/64 pertemuan selesai** (Bilangan TP1
1/1, Bilangan TP2 4/4).

---

## 8c. Bilangan TP3 — SELESAI 4/4 (2026-08-01)

Unit ketiga Matematika: pembagian bersusun dengan pembagi multi-digit,
mengikuti progresi Titik Berangkat → Garis Finis dokumen sumber
(penyegaran pembagi 1 digit → pembagi kelipatan 10 → pembagi 2 digit
sembarang → soal cerita). Komponen visual baru `.bagi-wrap`/`.bagi-bracket`
dipakai konsisten di keempat halaman untuk menampilkan pembagian
bersusun bergaya kurung siku standar.

Materi 3 secara eksplisit menampilkan tebakan awal yang KELIRU lalu
dikoreksi (78÷17: coba 5 dulu → gagal → koreksi ke 4) — bukan
disembunyikan/dihapus, konsisten dengan penekanan dokumen sumber bahwa
estimasi-coba-koreksi adalah proses sah, bukan tanda kesalahan. Materi
4 (⭐ inti) memuat 3 skenario sisa pembagian yang perlu ditafsirkan
berbeda sesuai konteks (hasil rapi tanpa sisa, sisa disimpan apa
adanya, sisa yang menuntut pembulatan ke atas) — keterampilan
interpretasi kontekstual yang tidak ada di soal angka polos biasa.

Perhatian khusus pada peringatan dokumen sumber soal siswa yang
"menghindari pembagi sembarang dengan membulatkan ke kelipatan 10
tanpa sadar" — dijadikan soal & pembahasan eksplisit di materi 3 (soal
nomor 3, kasus Dimas).

Standar 7b diterapkan penuh. Status keempat entri di `materi-index.js`
sudah diubah ke `"selesai"`.

**Progres Matematika sejauh ini: 9/64 pertemuan selesai** (Bilangan
TP1 1/1, TP2 4/4, TP3 4/4).

## 8d. Bilangan TP4 — SELESAI 4/4 (2026-08-08)

Unit keempat Matematika: KPK dan FPB lewat soal cerita kontekstual
sejak awal (sesuai penekanan keras Dokumen 1 — KPK-FPB lahir dari
konteks nyata, bukan angka polos). Progresi: menyusun daftar
kelipatan/faktor sistematis (jembatan tambahan di luar Dokumen 2,
ditandai eksplisit di dokumen sumber sebagai gap yang perlu diisi) →
soal cerita KPK/FPB terpisah jelas (bus berangkat bersamaan / bagi
rata pensil-buku) → identifikasi mandiri tanpa label dengan angka lebih
besar → soal cerita campuran (jadwal lomba + pembagian perlengkapan).

Materi 3 secara eksplisit membongkar miskonsepsi "tebak dari kata kunci"
('bersamaan'=KPK, 'dibagi'=FPB) yang diperingatkan dokumen sumber —
memakai soal drama-konser yang sengaja TIDAK memakai kata "bersamaan"
sama sekali, tapi tetap soal KPK, plus soal & pembahasan yang secara
eksplisit menyoal kenapa jalan pintas kata kunci itu keliru (kasus
Doni). Materi 4 (⭐ inti) memuat satu narasi panjang berisi KEDUA
konsep sekaligus dalam konteks berbeda (jadwal lomba sekolah untuk KPK,
pembagian perlengkapan untuk FPB) — melatih memecah soal jadi
bagian-bagian kecil.

Standar 7b diterapkan penuh. Status keempat entri di `materi-index.js`
sudah diubah ke `"selesai"`.

**Progres Matematika sejauh ini: 13/64 pertemuan selesai** (Bilangan
TP1 1/1, TP2 4/4, TP3 4/4, TP4 4/4 — seluruh Bilangan bagian bilangan
cacah [TP1-TP5] tinggal TP5/uang, lalu lanjut ke pecahan [TP6-TP7]).

---

## 9. Status & log progres

| Elemen | TP | Judul | Status |
|---|---|---|---|
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
| Berbicara dan Mempresentasikan | B1 | Bicara ke Satu Teman Dulu | ✅ Selesai |
| Berbicara dan Mempresentasikan | B1 | Menyusun Awal-Isi-Akhir | ✅ Selesai |
| Berbicara dan Mempresentasikan | B1 | Presentasi dengan Alat Bantu | ✅ Selesai |
| Berbicara dan Mempresentasikan | B1 ⭐ | Presentasi Gagasan di Depan Kelas | ✅ Selesai |
| Berbicara dan Mempresentasikan | B2 | Suara yang Mengikuti Rasa (Siklus 1) | ✅ Selesai |
| Berbicara dan Mempresentasikan | B2 | Rasa yang Berubah dalam Satu Cerita (Siklus 2) | ✅ Selesai |
| Berbicara dan Mempresentasikan | B2 ⭐ | Membacakan Karyaku Sendiri (Siklus 3 – Puncak Semester 1) | ✅ Selesai |
| Berbicara dan Mempresentasikan | B2 | Rasa yang Tersembunyi (Siklus 4) | ✅ Selesai |
| Berbicara dan Mempresentasikan | B2 | Tampil di Kelompok Besar (Siklus 5) | ✅ Selesai |
| Berbicara dan Mempresentasikan | B2 ⭐ | Puncak Tahun: Karya Pilihanku (Siklus 6) | ✅ Selesai |
| Menulis | TL-Pengalaman | Mencari Pengalaman yang "Berbahan Cerita" | ✅ Selesai |
| Menulis | TL-Pengalaman | Menyusun Kerangka Ceritaku | ✅ Selesai |
| Menulis | TL-Pengalaman | Menulis Draf Pertama | ✅ Selesai |
| Menulis | TL-Pengalaman ⭐ | Cerita Pengalamanku yang Hidup | ✅ Selesai |
| Menulis | TL-Pengamatan | Mencatat dari Hasil Mengamati | ✅ Selesai |
| Menulis | TL-Pengamatan | Dari Kata Menjadi Kalimat | ✅ Selesai |
| Menulis | TL-Pengamatan | Menyusun Urutan yang Sistematis | ✅ Selesai |
| Menulis | TL-Pengamatan | Melaporkan Kejadian Nyata | ✅ Selesai |
| Menulis | TL-Pengamatan ⭐ | Laporan Pengamatanku Sendiri | ✅ Selesai |
| Menulis | TL-Gagasan | Fakta atau Pendapat? | ✅ Selesai |
| Menulis | TL-Gagasan | Berani Berpendapat | ✅ Selesai |
| Menulis | TL-Gagasan | Pendapat Butuh Alasan | ✅ Selesai |
| Menulis | TL-Gagasan | Alasan yang Lebih Kuat | ✅ Selesai |
| Menulis | TL-Gagasan ⭐ | Menulis Pendapat dan Alasanku | ✅ Selesai |
| Menulis | TL-Imajinasi | Melontarkan Ide-Ide Liar | ✅ Selesai |
| Menulis | TL-Imajinasi | Tokoh dan Latar yang Tak Biasa | ✅ Selesai |
| Menulis | TL-Imajinasi | Menyusun Alur Cerita | ✅ Selesai |
| Menulis | TL-Imajinasi | Kata-Kata yang Punya Rasa | ✅ Selesai |
| Menulis | TL-Imajinasi ⭐ | Ceritaku, Imajinasiku Sendiri | ✅ Selesai |
| Sistem Organ Tubuh | OT-TP2 | Mengamati Diagram Organ Utama Tubuh | ✅ Selesai |
| Sistem Organ Tubuh | OT-TP2 ⭐ | Fungsi Organ dan Menjaga Kesehatan Tubuh | ✅ Selesai |
| Sistem Organ Tubuh | OT-TP1 | Meraba Detak Jantung Sendiri | ✅ Selesai |
| Sistem Organ Tubuh | OT-TP1 | Menebak Detak Jantung Setelah Bergerak | ✅ Selesai |
| Sistem Organ Tubuh | OT-TP1 | Mengukur Detak Jantung Sebelum dan Sesudah Aktivitas | ✅ Selesai |
| Sistem Organ Tubuh | OT-TP1 | Membandingkan Detak Jantung Antarteman | ✅ Selesai |
| Sistem Organ Tubuh | OT-TP1 | Prediksi vs Kenyataan: Detak Jantung dan Kebiasaanku | ✅ Selesai |
| Sistem Organ Tubuh | OT-TP1 ⭐ | Refleksiku tentang Aktivitas Fisik dan Kesehatan Jantung | ✅ Selesai |
| Gelombang Bunyi dan Cahaya | BC-TP1 | Mengamati Bunyi dan Cahaya di Sekitar | ✅ Selesai |
| Gelombang Bunyi dan Cahaya | BC-TP1 | Memprediksi Bunyi dan Cahaya | ✅ Selesai |
| Gelombang Bunyi dan Cahaya | BC-TP1 | Eksperimen Telepon Kaleng dan Pemantulan Cahaya | ✅ Selesai |
| Gelombang Bunyi dan Cahaya | BC-TP1 | Membandingkan Hasil Antarbahan | ✅ Selesai |
| Gelombang Bunyi dan Cahaya | BC-TP1 ⭐ | Bunyi dan Cahaya dalam Kehidupan Sehari-hari | ✅ Selesai |
| Ekosistem | EKOS-TP1 | Mengenali Ciri Benda Hidup dan Tak Hidup | ✅ Selesai |
| Ekosistem | EKOS-TP1 | Mencatat Komponen Ekosistem di Sekitar Sekolah | ✅ Selesai |
| Ekosistem | EKOS-TP1 ⭐ | Menduga Hubungan Antarkomponen Ekosistem | ✅ Selesai |
| Ekosistem | EKOS-TP2 | Variabel yang Diubah dan yang Dijaga Tetap | ✅ Selesai |
| Ekosistem | EKOS-TP2 | Merancang Percobaan Pertumbuhan Tanaman | ✅ Selesai |
| Ekosistem | EKOS-TP2 | Mencatat Pertumbuhan Tanaman Secara Berkala | ✅ Selesai |
| Ekosistem | EKOS-TP2 | Mengevaluasi Hasil Percobaan Tanaman | ✅ Selesai |
| Ekosistem | EKOS-TP2 ⭐ | Menyajikan Hasil Percobaan dengan Data | ✅ Selesai |
| Kegiatan Ekonomi Masyarakat | EKON-TP1 | Mencatat Jenis Usaha di Sekitarku | ✅ Selesai |
| Kegiatan Ekonomi Masyarakat | EKON-TP1 ⭐ | Mengklasifikasikan Kegiatan Ekonomi | ✅ Selesai |
| Letak Geografis Indonesia | GEO-TP1 | Mengenal Peta dan Bentuk Wilayah Indonesia | ✅ Selesai |
| Letak Geografis Indonesia | GEO-TP1 | Posisi Indonesia di Antara Dua Benua dan Dua Samudra | ✅ Selesai |
| Letak Geografis Indonesia | GEO-TP1 | Garis Khatulistiwa dan Iklim Tropis Indonesia | ✅ Selesai |
| Letak Geografis Indonesia | GEO-TP1 | Membaca Letak dengan Sistem Berpetak | ✅ Selesai |
| Letak Geografis Indonesia | GEO-TP1 ⭐ | Menjelaskan Letak Geografis Indonesia | ✅ Selesai |
| Sejarah dan Keragaman Budaya Sekitar | BUDAYA-TP1 | Mengenal Keragaman Budaya di Sekitar Kita | ✅ Selesai |
| Sejarah dan Keragaman Budaya Sekitar | BUDAYA-TP1 | Sejarah Asal-Usul Keluargaku | ✅ Selesai |
| Sejarah dan Keragaman Budaya Sekitar | BUDAYA-TP1 | Menghargai Perbedaan sebagai Kekayaan Bersama | ✅ Selesai |
| Sejarah dan Keragaman Budaya Sekitar | BUDAYA-TP1 | Mengenal Pahlawan di Lingkungan Sekitar | ✅ Selesai |
| Sejarah dan Keragaman Budaya Sekitar | BUDAYA-TP1 ⭐ | Menghubungkan Geografis, Ekonomi, Sejarah, dan Budaya Keluargaku | ✅ Selesai |
| Bilangan | BIL-TP1 | Nilai Tempat dan Perbandingan Bilangan Cacah | ✅ Selesai |
| Bilangan | BIL-TP2 | Pengurangan dengan Satu Kali Peminjaman | ✅ Selesai |
| Bilangan | BIL-TP2 | Pengurangan dengan Dua Peminjaman Berurutan | ✅ Selesai |
| Bilangan | BIL-TP2 | Pengurangan Peminjaman Berganda dan Angka Nol di Tengah | ✅ Selesai |
| Bilangan | BIL-TP2 ⭐ | Pengurangan Bersusun dalam Soal Cerita | ✅ Selesai |
| Bilangan | BIL-TP3 | Penyegaran Pembagian Pembagi Satu Digit | ✅ Selesai |
| Bilangan | BIL-TP3 | Pembagian dengan Pembagi Kelipatan Sepuluh | ✅ Selesai |
| Bilangan | BIL-TP3 | Pembagian dengan Pembagi Dua Digit Sembarang | ✅ Selesai |
| Bilangan | BIL-TP3 ⭐ | Pembagian Bersusun dalam Soal Cerita | ✅ Selesai |
| Bilangan | BIL-TP4 | Menyusun Daftar Kelipatan dan Faktor | ✅ Selesai |
| Bilangan | BIL-TP4 | Soal Cerita KPK atau FPB Tunggal | ✅ Selesai |
| Bilangan | BIL-TP4 | Mengidentifikasi KPK atau FPB dari Soal Cerita | ✅ Selesai |
| Bilangan | BIL-TP4 ⭐ | Soal Cerita Campuran KPK dan FPB | ✅ Selesai |
| Bilangan | BIL-TP5 | Masalah Sehari-hari tentang Uang | 🕓 Segera hadir (placeholder aktif) |
| Bilangan | BIL-TP6 | Memahami Pecahan sebagai Bagian dari Keseluruhan | 🕓 Segera hadir (placeholder aktif) |
| Bilangan | BIL-TP6 | Merepresentasikan Pecahan dan Pecahan Senilai | 🕓 Segera hadir (placeholder aktif) |
| Bilangan | BIL-TP6 | Membandingkan Pecahan Berpenyebut Sama | 🕓 Segera hadir (placeholder aktif) |
| Bilangan | BIL-TP6 | Membandingkan Pecahan Berpenyebut Berbeda | 🕓 Segera hadir (placeholder aktif) |
| Bilangan | BIL-TP6 | Menjumlahkan dan Mengurangkan Pecahan Sepenyebut | 🕓 Segera hadir (placeholder aktif) |
| Bilangan | BIL-TP6 | Menjumlahkan dan Mengurangkan Pecahan Beda Penyebut | 🕓 Segera hadir (placeholder aktif) |
| Bilangan | BIL-TP6 ⭐ | Pecahan Campuran dalam Soal Cerita | 🕓 Segera hadir (placeholder aktif) |
| Bilangan | BIL-TP7 | Mengalikan Pecahan dengan Bilangan Asli | 🕓 Segera hadir (placeholder aktif) |
| Bilangan | BIL-TP7 | Membagi Pecahan dengan Bilangan Asli | 🕓 Segera hadir (placeholder aktif) |
| Bilangan | BIL-TP7 ⭐ | Mengubah Bentuk Pecahan dan Soal Cerita Gabungan | 🕓 Segera hadir (placeholder aktif) |
| Aljabar | ALJ-TP1 | Menyeimbangkan Timbangan dengan Angka Nyata | 🕓 Segera hadir (placeholder aktif) |
| Aljabar | ALJ-TP1 | Menerjemahkan Situasi Seimbang ke Kalimat Matematika | 🕓 Segera hadir (placeholder aktif) |
| Aljabar | ALJ-TP1 ⭐ | Kalimat Matematika dengan Satu Kotak Kosong | 🕓 Segera hadir (placeholder aktif) |
| Aljabar | ALJ-TP2 | Kalimat Satu Operasi dengan Angka sampai 1.000 | 🕓 Segera hadir (placeholder aktif) |
| Aljabar | ALJ-TP2 | Kalimat Gabungan Dua Operasi | 🕓 Segera hadir (placeholder aktif) |
| Aljabar | ALJ-TP2 | Kalimat Campuran Empat Operasi | 🕓 Segera hadir (placeholder aktif) |
| Aljabar | ALJ-TP2 ⭐ | Soal Cerita dengan Nilai Belum Diketahui | 🕓 Segera hadir (placeholder aktif) |
| Aljabar | ALJ-TP3 | Membedakan Pola Aditif dan Multiplikatif | 🕓 Segera hadir (placeholder aktif) |
| Aljabar | ALJ-TP3 | Mengidentifikasi dan Meniru Pola Multiplikatif | 🕓 Segera hadir (placeholder aktif) |
| Aljabar | ALJ-TP3 ⭐ | Mengembangkan Pola dalam Soal Cerita | 🕓 Segera hadir (placeholder aktif) |
| Aljabar | ALJ-TP4 | Memahami Rasio Satuan lewat Harga dan Kecepatan | 🕓 Segera hadir (placeholder aktif) |
| Aljabar | ALJ-TP4 ⭐ | Soal Cerita Proporsional dengan Rasio Satuan | 🕓 Segera hadir (placeholder aktif) |
| Geometri | GEOM-TP3 | Membaca Posisi pada Bidang Berpetak | 🕓 Segera hadir (placeholder aktif) |
| Geometri | GEOM-TP3 ⭐ | Tebak Koordinat dan Soal Cerita Peta | 🕓 Segera hadir (placeholder aktif) |
| Pengukuran | UKUR-TP1 | Menghitung Keliling Bangun Datar | 🕓 Segera hadir (placeholder aktif) |
| Pengukuran | UKUR-TP1 | Menentukan Luas dengan Menghitung Petak Satuan | 🕓 Segera hadir (placeholder aktif) |
| Pengukuran | UKUR-TP1 | Menurunkan Rumus Luas Jajar Genjang | 🕓 Segera hadir (placeholder aktif) |
| Pengukuran | UKUR-TP1 | Menurunkan Rumus Luas Segitiga | 🕓 Segera hadir (placeholder aktif) |
| Pengukuran | UKUR-TP1 ⭐ | Keliling dan Luas Gabungan dalam Soal Cerita | 🕓 Segera hadir (placeholder aktif) |
| Pengukuran | UKUR-TP2 | Memecah Bangun Gabungan Menjadi Bangun Dasar | 🕓 Segera hadir (placeholder aktif) |
| Pengukuran | UKUR-TP2 ⭐ | Keliling dan Luas Segi Lima-Enam dan Bangun Gabungan | 🕓 Segera hadir (placeholder aktif) |
| Pengukuran | UKUR-TP3 | Konversi Dasar Jam-Menit-Detik | 🕓 Segera hadir (placeholder aktif) |
| Pengukuran | UKUR-TP3 ⭐ | Durasi Perjalanan Termasuk Lintas Tengah Malam | 🕓 Segera hadir (placeholder aktif) |
| Pengukuran | UKUR-TP4 | Mengklasifikasikan Jenis Sudut secara Visual | 🕓 Segera hadir (placeholder aktif) |
| Pengukuran | UKUR-TP4 ⭐ | Mengukur Sudut dengan Protractor | 🕓 Segera hadir (placeholder aktif) |
| Geometri | GEOM-TP1 | Memprediksi Jaring-Jaring Kubus yang Valid | 🕓 Segera hadir (placeholder aktif) |
| Geometri | GEOM-TP1 | Melipat Jaring-Jaring Kubus | 🕓 Segera hadir (placeholder aktif) |
| Geometri | GEOM-TP1 | Melipat dan Mengurai Jaring-Jaring Balok | 🕓 Segera hadir (placeholder aktif) |
| Geometri | GEOM-TP1 ⭐ | Menggambar Tampak Depan, Atas, dan Samping | 🕓 Segera hadir (placeholder aktif) |
| Geometri | GEOM-TP2 | Mengenal Istilah Sisi, Rusuk, dan Titik Sudut | 🕓 Segera hadir (placeholder aktif) |
| Geometri | GEOM-TP2 ⭐ | Menyusun Tabel Perbandingan Bangun Datar dan Bangun Ruang | 🕓 Segera hadir (placeholder aktif) |
| Analisis Data dan Peluang | DP-TP1 | Menyusun Tabel Frekuensi dari Data Kelas | 🕓 Segera hadir (placeholder aktif) |
| Analisis Data dan Peluang | DP-TP1 | Menyajikan Data dalam Piktogram | 🕓 Segera hadir (placeholder aktif) |
| Analisis Data dan Peluang | DP-TP1 | Menyajikan Data dalam Diagram Batang | 🕓 Segera hadir (placeholder aktif) |
| Analisis Data dan Peluang | DP-TP1 ⭐ | Memilih Bentuk Penyajian Data yang Sesuai | 🕓 Segera hadir (placeholder aktif) |
| Analisis Data dan Peluang | DP-TP2 | Menemukan Rata-Rata lewat Aktivitas Meratakan | 🕓 Segera hadir (placeholder aktif) |
| Analisis Data dan Peluang | DP-TP2 ⭐ | Mean, Median, Modus, dan Kerentanan Rata-Rata | 🕓 Segera hadir (placeholder aktif) |
| Analisis Data dan Peluang | DP-TP3 | Eksperimen Melempar Koin dan Dadu | 🕓 Segera hadir (placeholder aktif) |
| Analisis Data dan Peluang | DP-TP3 | Membandingkan Kemungkinan Kejadian | 🕓 Segera hadir (placeholder aktif) |
| Analisis Data dan Peluang | DP-TP3 ⭐ | Memprediksi dan Membuktikan Peluang pada Situasi Baru | 🕓 Segera hadir (placeholder aktif) |

**Legenda:** ⭐ = Pertemuan Inti/puncak TP tersebut · ✅ Selesai · 🕓 Segera hadir (halaman & link sudah aktif, isi menyusul)

