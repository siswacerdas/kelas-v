# Rancangan Fitur: Laporan Siswa (Guru & Orang Tua)

> **Status: FASE 1 (MPLS) + separuh Pintu 2 (Materi Ajar) SUDAH DIIMPLEMENTASIKAN.**
> Sesuai arahan terbaru, laporan bukan lagi 1 halaman tunggal — sekarang
> `pages/laporan-siswa.html` jadi LANDING (menu 3 pintu), dan:
> 1. **MPLS** (`pages/laporan-siswa/mpls.html`) — ✅ AKTIF, ini Fase 1 yang
>    sudah dikerjakan (§1-5 di bawah), sekarang juga sudah naratif (BB/MB/
>    BSH/BSB + kesimpulan) bukan dump angka mentah.
> 2. **Perkembangan Belajar Mandiri** (`belajar-mandiri.html`) — ✅ AKTIF
>    untuk separuh **Materi Ajar** (lihat §7.1 — sheet "Data Progres
>    Materi" + `materi-progress-tracker.js` dipasang di 81 halaman materi).
>    Separuh **Modul** masih 🚧 belum ada (§7.2 — modul contoh belum punya
>    jembatan pengiriman progres ke server sama sekali).
> 3. **Latihan Mandiri Siswa** (`latihan-mandiri.html`) — 🚧 halaman "Segera
>    Hadir", rancangannya di §6 (diperluas signifikan — lihat catatan besar
>    di bagian itu soal redesain "Uji Kemampuan"/dulu "Bank Soal").

---

## 1. Tujuan

Halaman ringkasan perkembangan belajar per siswa — bisa diakses **guru**
(lihat siapa saja) dan **orang tua** (lihat **hanya anaknya sendiri**, lewat
akun Firebase terpisah, BUKAN akun siswa yang sama).

---

## 2. Data yang ditampilkan

| Bagian | Sumber data | Status |
|---|---|---|
| Profil (nama, foto, dll) | Sheet "Data Siswa" | ✅ Sudah ada |
| Ringkasan MPLS non-kognitif | Sheet "Data MPLS" | ✅ Sudah ada |
| Ringkasan MPLS kognitif | Sheet "Data MPLS Kognitif" | ✅ Sudah ada |
| Jurnal Aktivitas | Sheet "Data Jurnal Aktivitas" | ✅ Sudah ada |
| Hasil latihan Bank Soal | Sheet BARU "Data Hasil Latihan" | ❌ Belum ada — Fase 2 |
| Progres membaca Materi Ajar | Sheet BARU "Data Progres Materi" | ❌ Belum ada — Fase 3 (opsional) |

Galeri Visual **tidak** dimasukkan — bukan indikator progres akademik
individual, dan memang ditujukan terbuka untuk semua siswa (bukan data per
anak).

---

## 3. Model akun orang tua

Mengikuti persis pola akun guru/siswa yang **sudah ada** (README.md bagian
"Langkah 6–7"): dibuat **manual** oleh guru lewat Firebase Console (Add
user) + dokumen Firestore `users/{uid}`. **Tidak ada halaman pendaftaran
mandiri** — guru tetap yang mengontrol siapa yang bisa akses, konsisten
dengan filosofi kontrol penuh guru yang sudah berlaku di proyek ini.

**Skema dokumen `users/{uid}` (field baru bercetak tebal):**
```
nama    : string                    (mis. "Ibu Siti", nama orang tua)
role    : "guru" | "siswa" | "orangtua"   ← "orangtua" BARU
email   : string
**anak**  : array of string          ← BARU, khusus role "orangtua"
                                        Isinya "Nama Lengkap" PERSIS sama
                                        ejaannya dengan kolom "Nama Lengkap"
                                        di sheet "Data Siswa" — dipakai
                                        ulang sebagai kunci, BUKAN bikin ID
                                        baru (konsisten dengan pola "Nama
                                        Lengkap" sebagai kunci upsert yang
                                        sudah dipakai di seluruh Code.gs
                                        sejak awal).
                                        Array, BUKAN string tunggal — supaya
                                        1 akun orang tua bisa terhubung ke
                                        LEBIH DARI 1 anak (kakak-adik satu
                                        kelas).
```

**Langkah baru di README.md** (disisipkan setelah "Langkah 7 — Tambah Akun
Siswa"): "Langkah 7b — Tambah Akun Orang Tua", isinya sama seperti Langkah
6/7 tapi `role: "orangtua"` + isi `anak: [...]`.

### Firestore Rules — TIDAK PERLU DIUBAH
Rule `users/{uid}` yang sudah ada (`allow read: if request.auth.uid == uid`)
sudah otomatis mencakup orang tua membaca dokumennya sendiri — tidak perlu
rule baru. Data laporan sesungguhnya (MPLS/Jurnal/dll) **tidak disimpan di
Firestore sama sekali** (semua di Google Sheets lewat Apps Script), jadi
tidak ada rule Firestore lain yang perlu disentuh untuk fitur ini.

---

## 4. Kontrol akses di halaman (frontend)

> **Catatan sejarah keputusan**: rancangan AWAL (saat fitur ini masih 1
> halaman tunggal) sengaja TIDAK membuat file guard terpisah, karena
> logikanya cuma dipakai 1 halaman — polanya diambil dari **index.html**
> sendiri (baca `role` dari Firestore inline, tampilkan/sembunyikan sesuai
> nilainya). **Sejak restrukturisasi 3-pintu, logika ini SUDAH diekstrak**
> jadi `pages/laporan-siswa/assets/laporan-guard.js` — karena sekarang
> dipakai 4 halaman sekaligus (landing + 3 pintu), jadi wajar diekstrak,
> sama seperti alasan `guru-guard.js` dulu jadi modul sendiri. Bagian di
> bawah ini menjelaskan ALUR-nya (tetap berlaku), bukan lagi soal "inline
> vs modul terpisah" (sudah diputuskan: modul terpisah).

1. Gerbang login pakai pola `auth-guard.js` (login apa saja, sama seperti
   `materi.html`) — BUKAN `guru-guard.js` (itu akan memblokir orang tua).
2. Setelah login, baca dokumen `users/{uid}` sendiri (lewat
   `laporan-guard.js`) untuk dapat `role` + `anak`.
3. **role === "siswa" → tolak akses**, redirect balik ke beranda dengan
   pesan jelas (ini yang memastikan syarat "tidak untuk siswa" terpenuhi
   di sisi klien — penegakan SESUNGGUHNYA tetap di server, lihat §5).
4. **role === "guru"** → di landing, semua 3 pintu tampil; di Pintu 1
   (MPLS), tampilkan dropdown/pencarian SEMUA siswa (dari endpoint yang
   sudah ada, `?siswa=1`).
5. **role === "orangtua"** → di Pintu 1 (MPLS), tampilkan HANYA nama-nama
   di `anak` (kalau cuma 1 anak, langsung tampilkan laporannya tanpa perlu
   memilih).

---

## 5. Backend (Apps Script) — perubahan & endpoint baru

### 5.1 Refactor kecil: `verifikasiUser_(idToken)`
`wajibGuru_(idToken)` saat ini melakukan 2 pemanggilan REST (Identity
Toolkit lookup → dapat `uid`, lalu baca Firestore `users/{uid}` → dapat
`role`) lalu langsung menolak kalau bukan "guru". Logika pengambilan
`uid`+dokumen user ini akan **diekstrak** jadi fungsi bersama:

```js
function verifikasiUser_(idToken) {
  // ... (logika REST call yang SUDAH ADA di wajibGuru_, dipindah ke sini)
  // mengembalikan { uid, role, anak } — "anak" array kosong kalau field-nya
  // tidak ada (guru/siswa tidak punya field ini)
}
```
`wajibGuru_` lalu jadi tinggal: `if (verifikasiUser_(idToken).role !== "guru") throw ...`
— perilaku SAMA PERSIS seperti sekarang, cuma logikanya dipakai ulang.

### 5.2 Fungsi baru: `wajibAksesLaporan_(idToken, namaSiswa)`
**Prinsip keamanan paling penting di fitur ini:** endpoint guru yang sudah
ada (`?siswa=1`, `?all=1`, dst.) sengaja TIDAK dibatasi cakupannya — cocok
untuk guru yang memang perlu lihat semua siswa. Endpoint laporan untuk
orang tua **HARUS** dibatasi cuma ke anak mereka sendiri, kalau tidak:
orang tua bisa saja minta data siswa LAIN dan tetap dikabulkan. Ini beda
prinsip dari semua endpoint guru yang sudah ada, jadi butuh fungsi
verifikasi baru, bukan reuse `wajibGuru_`:

```js
function wajibAksesLaporan_(idToken, namaSiswa) {
  const info = verifikasiUser_(idToken);
  if (info.role === "guru") return; // guru boleh akses siapa saja
  if (info.role === "orangtua" && info.anak.indexOf(namaSiswa) !== -1) return;
  throw new Error('Akun ini tidak punya akses ke data siswa "' + namaSiswa + '".');
}
```

### 5.3 Endpoint baru: `?laporanSiswa=1&nama=<nama>&idToken=...`
Menggabungkan data dari BEBERAPA sheet jadi 1 respons JSON (supaya halaman
laporan cukup 1 request, bukan 4-5 request terpisah):
```js
if (params.laporanSiswa) {
  wajibAksesLaporan_(params.idToken, params.nama);
  return jsonOut_({
    profil: findRowByColumn_(getSiswaSheet_(), "Nama Lengkap", params.nama) ...,
    mpls: ... (dari sheet "Data MPLS", kolom "Nama Siswa"),
    mplsKognitif: ... (dari sheet "Data MPLS Kognitif", kolom "Nama Siswa"),
    jurnal: ... (dari sheet "Data Jurnal Aktivitas", kolom "Nama Siswa"),
    // Fase 2/3 nanti nambah: hasilLatihan: [...], progresMateri: [...]
  });
}
```
> Catatan kecil yang perlu diperhatikan saat implementasi: sheet "Data
> Siswa" pakai nama kolom **"Nama Lengkap"**, sedangkan sheet MPLS
> Kognitif/Jurnal pakai **"Nama Siswa"** — inkonsistensi penamaan kolom
> yang SUDAH ADA dari awal proyek (bukan yang baru dibuat fitur ini), jadi
> endpoint ini perlu tahu keduanya, bukan mengasumsikan sama.

### 5.4 Endpoint tambahan untuk guru: daftar nama untuk dropdown
Guru sudah punya `?siswa=1` (semua kolom) — bisa dipakai langsung untuk
mengisi dropdown, tidak perlu endpoint baru untuk ini.

---

## 6. Latihan Mandiri Siswa (Pintu 3, `pages/laporan-siswa/latihan-mandiri.html`) — laporannya, dan redesain besar "Uji Kemampuan" di baliknya

> **Ini bukan lagi "Fase 2" kecil seperti rancangan awal** — setelah
> didiskusikan lebih lanjut, ternyata "Uji Kemampuan" (dulu "Bank Soal")
> perlu dirombak jauh lebih besar dari sekadar "tambah penyimpanan skor".
> Bagian ini mendokumentasikan kebutuhannya; **mekanisme detailnya
> SENGAJA belum didesain penuh** (kata pemilik proyek: "mekanismenya akan
> kita atur nanti") — jadi anggap ini catatan kebutuhan, bukan spesifikasi
> siap-kode.

### 6.1 Kondisi sekarang vs yang diinginkan

| Aspek | Sekarang (`uji-kemampuan.html`) | Yang diinginkan |
|---|---|---|
| Pengelompokan | Per **mapel** saja | Per **Tujuan Pembelajaran (TP)** — siswa pilih 1 atau beberapa TP untuk diuji |
| Jenis soal | Cuma **1**: pilihan ganda tunggal | **6 jenis**: pilihan ganda tunggal, pilihan ganda kompleks (jawaban >1), pilihan ganda kriteria, benar-salah, mengurutkan, isian singkat (SATU kata) |
| Ukuran pool | Beberapa soal per mapel (sedikit) | **200-300 soal per TP** |
| Penyimpanan skor | ❌ Tidak ada sama sekali | Perlu tersimpan agar bisa direkap di laporan "Latihan Mandiri Siswa" |
| Jenis soal yang DIHINDARI | — | Isian kalimat & uraian — sengaja tidak dipakai karena sulit dinilai otomatis |

### 6.2 Implikasi desain yang perlu dipikirkan (belum diputuskan)

- **Skema data per jenis soal berbeda-beda** — pilihan ganda butuh daftar
  opsi + 1 jawaban benar; pilihan ganda kompleks butuh daftar opsi + BEBERAPA
  jawaban benar; mengurutkan butuh daftar item + urutan benar; isian singkat
  butuh 1 kata kunci jawaban (mungkin perlu toleransi huruf besar/kecil,
  spasi). Kemungkinan besar perlu 1 skema data umum dengan field
  `jenisSoal` + field tambahan yang berbeda-beda tergantung jenisnya
  (bukan 1 tabel kaku untuk semua jenis).
- **Field TP belum ada sama sekali** di skema `bank_soal` Firestore saat
  ini (cuma ada `mapel`) — perlu ditambah, idealnya memakai kode TP yang
  sama dengan `materi-index.js` (field `tp`, mis. "M1") supaya konsisten
  dengan sistem penomoran TP yang sudah ada di Materi Ajar & Galeri Visual.
- **Mekanisme pemilihan soal saat kuis dimulai** — kalau pool-nya 200-300
  per TP, TIDAK mungkin semua ditampilkan sekaligus; perlu logika acak
  ambil sejumlah N soal dari pool (N-nya berapa, apakah bisa diulang
  dengan soal berbeda tiap kali — ini bagian "mekanisme" yang belum
  diputuskan pemilik proyek).
- **Penilaian otomatis per jenis soal** beda logika: pilihan ganda tunggal
  (cocok 1:1), pilihan ganda kompleks (himpunan jawaban harus PERSIS
  cocok — atau ada nilai parsial untuk jawaban sebagian benar?), pilihan
  ganda kriteria (bentuknya seperti apa — perlu klarifikasi format ini
  saat desain lanjut), benar-salah (cocok boolean), mengurutkan (urutan
  array harus cocok), isian singkat (cocok teks, kemungkinan perlu
  normalisasi kapitalisasi/spasi/tanda baca).
- **Skala pembuatan konten**: 200-300 soal × 6 jenis (tidak harus rata,
  tapi total besar) × ±9 TP Bahasa Indonesia (dan TP mapel lain menyusul)
  = ribuan soal. Ini PEKERJAAN KONTEN BESAR, terpisah dari pekerjaan kode
  — mirip skalanya dengan proyek prompt infografis yang sudah jalan.
  Kemungkinan perlu pendekatan serupa (Claude bantu susun/generate draf
  soal per TP, guru mengoreksi) sebagai sesi kerja TERPISAH nanti.
- **Penyimpanan**: tetap di Firestore (koleksi `bank_soal` yang sudah ada,
  cukup diperluas skemanya) LEBIH MASUK AKAL daripada pindah ke Google
  Sheets — pool sebesar ini + kebutuhan filter per TP/jenis soal lebih
  cocok dengan query Firestore daripada memindai ribuan baris sheet tiap
  request.
- Skor hasil pengerjaan: sheet BARU **"Data Hasil Latihan"** di Google
  Sheets (Timestamp, Nama Siswa, TP, Skor, Jumlah Benar, Jumlah Soal) —
  ini bagian yang lebih sederhana & tidak berubah dari rancangan awal,
  dipakai untuk mengisi laporan "Latihan Mandiri Siswa".

### 6.3 Yang TIDAK berubah dari rancangan awal
- Endpoint baru `doPost type: "hasil_latihan"` — TIDAK digerbang
  `wajibGuru_`/`wajibAksesLaporan_` (pengirimnya siswa saat submit, bukan
  guru/orang tua).
- Field `hasilLatihan: [...]` ditambahkan ke respons `?laporanSiswa=1`
  KHUSUS untuk endpoint laporan "Latihan Mandiri Siswa" (endpoint terpisah
  dari `?laporanSiswa=1` yang dipakai Pintu 1/MPLS — perlu endpoint baru
  sendiri, bukan menumpuk ke endpoint MPLS yang sudah ada).

## 7. Perkembangan Belajar Mandiri (Pintu 2, `pages/laporan-siswa/belajar-mandiri.html`)

Mencakup **DUA** sumber data (diperluas dari rancangan awal yang cuma
menyebut Materi Ajar):

### 7.1 Ketuntasan Materi Ajar — ✅ SUDAH DIIMPLEMENTASIKAN
- Sheet **"Data Progres Materi"** (Timestamp, Nama Siswa, Materi Slug,
  Status) — self-healing seperti sheet lain (lihat `getProgresMateriSheet_()`).
  Field `file` di `materi-index.js` dipakai ulang sebagai Materi Slug
  (konsisten dengan yang sudah dipakai Galeri Visual).
- **Upsert per (Nama Siswa + Materi Slug)** — dipilih ini, BUKAN log setiap
  kunjungan, supaya sheet tidak membengkak (1 siswa boleh buka 1 materi
  berkali-kali, tetap 1 baris). Butuh helper baru `findRowByTwoColumns_()`
  di `Code.gs` (pencocokan 2 kolom sekaligus — `findRowByColumn_()` yang
  sudah ada cuma 1 kolom).
- **Pelacak**: `pages/materi/assets/materi-progress-tracker.js` — dimuat di
  SEMUA 81 halaman materi (script tag disisipkan otomatis lewat skrip
  Python 1x jalan, bukan diedit manual satu-satu), fire-and-forget, HANYA
  mengirim kalau `role === "siswa"` (guru yang buka materi untuk mengecek
  isi TIDAK ikut tercatat sebagai "sudah belajar"). Firebase init SENDIRI
  di file ini (bukan pakai auth-guard.js — lihat komentar panjang di file
  itu soal alasannya), dan `APPS_SCRIPT_URL` DITULIS ULANG di file ini
  (bukan `MPLS_CONFIG` dari config.js) supaya 81 halaman materi tidak perlu
  tambah baris `<script>` lagi cuma untuk itu — konsekuensinya: kalau URL
  Apps Script PERNAH ganti beneran (bukan sekadar redeploy versi baru),
  nilai di file ini wajib ikut diperbarui manual.
- **Endpoint baca**: `?progresMateri=1&nama=..&idToken=..`, gerbang SAMA
  dengan `?laporanSiswa=1` (`wajibAksesLaporan_()`).
- **Tampilan**: `pages/laporan-siswa/belajar-mandiri.html` +
  `assets/belajar-mandiri.js` — kartu ringkasan keseluruhan (X/Y materi,
  persentase) + rincian per mapel → per TP (progress bar per TP), dikelompokkan
  memakai `materi-index.js` yang sama (pola sama dengan `infografis-galeri.js`).
- Pemilih siswa (guru cari siapa saja / orang tua pilih anaknya) DIEKSTRAK
  jadi komponen bersama `pages/laporan-siswa/assets/laporan-picker.js` —
  awalnya cuma dipakai `mpls.html`, sekarang dipakai `belajar-mandiri.html`
  juga (dan `laporan.js`/Pintu 1 direfactor memakainya juga, bukan lagi
  duplikat logika pemilih siswa sendiri).

### 7.2 Progres Modul — 🚧 BELUM dikerjakan, temuan dari contoh modul yang diberikan
- Materi Ajar mengajak siswa belajar lewat **kesimpulan** (ringkas,
  langsung ke inti). Modul mengajak siswa belajar **mandiri** lewat
  penjelasan + latihan mandiri (BUKAN latihan soal — beda dari "Uji
  Kemampuan" di §6) — formatnya kaya-interaksi: dengar cerita (Web Speech
  API), cocokkan kartu, urutkan kejadian, sebab-akibat, refleksi, sampai
  bagian "kerjakan sendiri" di akhir sebagai uji mandiri.
- **Temuan penting dari contoh modul yang diberikan**: indikator
  "X% selesai" yang terlihat di modul itu **murni dihitung & disimpan di
  variabel JavaScript browser** — hilang total begitu halaman ditutup/
  refresh. TIDAK ada satu byte pun yang terkirim ke server. Supaya
  progres ini bisa muncul di laporan, modul-modul berikutnya perlu
  "jembatan" baru: sebuah fungsi kecil yang mengirim progres (persentase,
  atau minimal status "selesai/belum") ke Apps Script setiap kali berubah
  atau saat modul ditutup.
- Sheet baru (bisa digabung dengan progres materi, atau terpisah — belum
  diputuskan) **"Data Progres Modul"**: Timestamp, Nama Siswa, Modul Slug,
  Persentase/Status.
- **Ini bagian PALING RUMIT** dari fitur Perkembangan Belajar Mandiri —
  bukan cuma butuh endpoint baru, tapi juga mengubah CARA modul-modul
  masa depan ditulis (perlu pola/template baku supaya "jembatan" progres
  ini konsisten di semua modul, bukan ditambal manual tiap modul beda-beda
  caranya). Modul yang sudah dicontohkan Bapak BELUM punya jembatan ini —
  kalau modul itu langsung dipakai apa adanya, progresnya tidak akan
  pernah sampai ke laporan.
- **Disarankan didiskusikan terpisah** — mencakup: format standar modul ke
  depan (supaya "jembatan" progres bisa dipasang sekali sebagai template,
  bukan disesuaikan tiap modul), dan apakah pelacakan granular (per bagian
  modul) diperlukan atau cukup status selesai/belum secara keseluruhan.

---

## 8. Yang perlu dikonfirmasi sebelum Fase 1 mulai dikerjakan

- [x] Setuju dengan skema `anak: array` di dokumen Firestore `users/{uid}`? — **Ya, dipakai persis seperti rancangan.**
- [x] Setuju halaman `laporan-siswa.html` pakai pola inline role-check
      (seperti `index.html`) daripada bikin file guard terpisah? — **Ya
      pada awalnya; sejak restrukturisasi 3-pintu, logika ini SUDAH
      diekstrak jadi `laporan-guard.js` (dipakai 4 halaman sekarang, jadi
      wajar diekstrak — lihat §3).**
- [x] Prioritas Fase 1 dulu (data yang SUDAH ada: Profil, MPLS, Jurnal) —
      Hasil Latihan & Progres Materi menyusul di Fase 2/3 terpisah? — **Ya.**
- [x] Ada preferensi tampilan (mis. perlu opsi cetak/PDF dari awal, atau
      cukup tampilan web dulu)? — **Fokus tampilan web dulu, fitur tambahan menyusul.**
- [x] Restrukturisasi jadi 3 menu terpisah (MPLS / Perkembangan Belajar
      Mandiri / Latihan Mandiri Siswa)? — **Ya, landing + 3 pintu sudah
      dibangun (Pintu 2 & 3 masih "Segera Hadir").**
- [x] Nama halaman pengganti "Bank Soal"? — **"Uji Kemampuan"** (nama
      laporannya sendiri, "Latihan Mandiri Siswa", tidak berubah).

## 9. Yang BELUM dikerjakan (disengaja, sesuai lingkup yang disepakati sejauh ini)

- **Foto profil siswa** tidak ditampilkan di laporan MPLS. Proxy `?foto=`
  yang sudah ada masih hard-gated `wajibGuru_()` saja (lihat `Code.gs`) —
  kalau ORANG TUA mencoba memakainya, akan ditolak. Menampilkan foto untuk
  orang tua butuh perubahan tersendiri ke `serveFotoBinary_()` (bukan
  sekadar ganti gerbang — proxy itu cuma menerima ID file, tidak tahu itu
  foto siswa yang mana, jadi butuh cara mencocokkan file ke `namaSiswa`
  dulu sebelum bisa dibatasi cakupannya seperti `wajibAksesLaporan_()`).
  Disengaja ditunda supaya tidak menyentuh model keamanan proxy foto siswa
  yang sudah berjalan tanpa perhatian desain khusus.
- **Opsi cetak/PDF** — belum ada tombol cetak di Pintu 1 (MPLS). Browser
  sudah punya Ctrl+P/Cmd+P bawaan yang bisa dipakai sementara (tampilan
  belum dioptimalkan khusus untuk itu).
- **Pintu 2 (Perkembangan Belajar Mandiri)** — masih "Segera Hadir".
  Rancangan kebutuhannya di §7, TERMASUK temuan penting bahwa progres
  Modul contoh yang diberikan murni tersimpan di browser (belum ada
  jembatan ke server sama sekali).
- **Pintu 3 (Latihan Mandiri Siswa)** — masih "Segera Hadir". Rancangan
  kebutuhannya di §6, mencakup redesain besar "Uji Kemampuan" (6 jenis
  soal, pool 200-300/TP, seleksi per-TP) — mekanisme detailnya SENGAJA
  belum didesain penuh, menunggu diskusi lanjutan.
