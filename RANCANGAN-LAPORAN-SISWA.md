# Rancangan Fitur: Laporan Siswa (Guru & Orang Tua)

> **Status: SEMUA 3 PINTU SUDAH DIIMPLEMENTASIKAN** (Pintu 2 sebagian —
> lihat poin 2 di bawah). Sesuai arahan terbaru, laporan bukan lagi 1
> halaman tunggal — sekarang `pages/laporan-siswa.html` jadi LANDING (menu
> 3 pintu), dan:
> 1. **MPLS** (`pages/laporan-siswa/mpls.html`) — ✅ AKTIF, ini Fase 1 yang
>    sudah dikerjakan (§1-5 di bawah), sekarang juga sudah naratif (BB/MB/
>    BSH/BSB + kesimpulan) bukan dump angka mentah.
> 2. **Perkembangan Belajar Mandiri** (`belajar-mandiri.html`) — ✅ AKTIF
>    untuk separuh **Materi Ajar** (lihat §7.1 — sheet "Data Progres
>    Materi" + `materi-progress-tracker.js` dipasang di 81 halaman materi).
>    Separuh **Modul** masih 🚧 belum ada (§7.2 — modul contoh belum punya
>    jembatan pengiriman progres ke server sama sekali).
> 3. **Latihan Mandiri Siswa** (`latihan-mandiri.html`) — ✅ AKTIF
>    (§6.4), dibangun di atas redesain besar "Uji Kemampuan"/dulu "Bank
>    Soal" (§6.1-6.3). **Belum diuji sungguhan** di browser/Firebase asli
>    sejak dibangun — lihat checklist di `ANTIREGRESI.md` §28.

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
| Hasil latihan Uji Kemampuan | Firestore `hasil_latihan` (BUKAN Sheet — lihat §6.3) | ✅ Sudah ada, termasuk tampilan laporannya (Pintu 3, lihat §6.4) |
| Progres membaca Materi Ajar | Sheet BARU "Data Progres Materi" | ✅ Sudah ada (lihat §7.1) |

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

> **✅ STATUS TERBARU**: redesain "Uji Kemampuan" (§6.1–§6.3) SUDAH SELESAI
> DIKERJAKAN, termasuk penyimpanan skor — arsitekturnya TERNYATA BEDA dari
> yang direncanakan semula di bagian ini (lihat §6.3). **Pintu 3 sendiri
> (`latihan-mandiri.html`) SUDAH AKTIF juga** (lihat §6.4) — bukan lagi
> kerangka "Segera Hadir". Bagian §6.1/§6.2 di bawah dibiarkan sebagai
> catatan kebutuhan/diskusi ASLI (untuk sejarah), ditandai per baris mana
> yang jadi kenyataan dan mana yang berubah keputusannya.

### 6.1 Kondisi lama vs yang diinginkan vs yang jadi kenyataan

| Aspek | Lama (`bank-soal.html`) | Direncanakan | ✅ Kenyataan sekarang |
|---|---|---|---|
| Pengelompokan | Per **mapel** saja | Per **Tujuan Pembelajaran (TP)** | Sesuai rencana — siswa pilih mapel → pilih TP → kuis |
| Jenis soal | Cuma **1**: pilihan ganda tunggal | 6 jenis (lihat versi lama dokumen ini) | **5 jenis** dipakai: pilihan ganda tunggal, pilihan ganda kompleks, **kategorikan** (`pg_kategori`), mengurutkan, **menjodohkan** — "benar-salah" & "isian singkat" TIDAK jadi dipakai, diganti "kategorikan"/"menjodohkan" saat desain lanjut |
| Ukuran pool | Beberapa soal per mapel | 200-300 soal per TP | Ambang minimal untuk BISA diuji cuma **5 soal**/TP (supaya sesi tidak kosong), tapi UI tetap menandai "pool belum lengkap" kalau <200 — target 200-300 tetap jadi acuan pengisian konten ke depan, cuma bukan syarat wajib teknis |
| Penyimpanan skor | ❌ Tidak ada | Perlu tersimpan | ✅ Tersimpan ke Firestore `hasil_latihan` tiap kuis dinilai |
| Rekap untuk guru | ❌ Tidak ada | (belum dibahas eksplisit di draf awal) | ✅ `pages/riwayat-latihan.html` (guru-only) |
| Isian kalimat & uraian | — | Sengaja dihindari | Tetap dihindari (konsisten dengan rencana) |

### 6.2 Implikasi desain — sudah diputuskan, dicatat di sini untuk sejarah

- **Skema data per jenis soal** — ✅ diputuskan: field `jenisSoal` umum +
  field tambahan berbeda tergantung jenis (`pilihan`/`jawaban` untuk
  pg_tunggal, `pilihan`/`jawabanBenar` untuk pg_kompleks, `kategori`/`item`
  untuk pg_kategori, `item` untuk mengurutkan, `pasangan` untuk
  menjodohkan) — skema lengkapnya didokumentasikan di `README.md` bagian
  struktur `bank_soal/`.
- **Field TP** — ✅ ditambahkan ke `bank_soal` (field `tp`, kode sama
  dengan `tp-kko-index.js`, konsisten dengan Materi Ajar & Galeri Visual).
- **Mekanisme pemilihan soal saat kuis dimulai** — ✅ diputuskan: **15 soal**
  (`N_SOAL_PER_SESI` di `uji-kemampuan.html`) diambil ACAK dari pool tiap
  sesi, pakai field `randKey` (angka acak 0–1 dibuat otomatis saat soal
  disimpan) + query dua arah (`>= threshold` lalu `< threshold`) supaya
  hasil acaknya tersebar merata, bukan selalu soal yang sama di awal pool.
- **Penilaian otomatis per jenis soal** — ✅ diimplementasikan per jenis
  (lihat `nilaiKuis()` di `uji-kemampuan.html`): pg_tunggal cocok 1:1,
  pg_kompleks himpunan jawaban harus PERSIS cocok (tidak ada nilai
  parsial), pg_kategori & menjodohkan tiap baris harus cocok semua,
  mengurutkan urutan array harus persis sama.
- **Skala pembuatan konten**: masih PEKERJAAN KONTEN BESAR yang terpisah
  dari pekerjaan kode, dan jumlah soal aktual per TP saat ini BELUM
  diverifikasi ulang di dokumen ini — cek langsung tab "Uji Kemampuan" di
  `admin.html` atau koleksi `bank_soal` untuk angka terkini sebelum
  merencanakan sesi pengisian konten berikutnya.

### 6.3 Arsitektur — ⚠️ BERBEDA dari rencana awal di draf ini

Rencana awal dokumen ini mengusulkan skor disimpan lewat **Apps Script +
Google Sheets** (endpoint `doPost type: "hasil_latihan"`, sheet baru "Data
Hasil Latihan"). **Ini TIDAK jadi yang dipakai.** Keputusan aktualnya:

- Skor ditulis **langsung dari klien ke Firestore** (`addDoc(collection(db,
  "hasil_latihan"), ...)` di `uji-kemampuan.html`) — konsisten dengan
  `bank_soal` yang sudah Firestore-native, BUKAN lewat Apps Script/Sheets
  sama sekali.
- Dibaca juga langsung dari Firestore oleh guru di `riwayat-latihan.html`
  (query `collection(db, "hasil_latihan")`), bukan lewat endpoint
  `?laporanSiswa=1` seperti Pintu 1 (MPLS)/Pintu 2 (Materi Ajar).
- Keamanan diatur lewat **Firestore Security Rules** langsung (lihat
  `README.md` §🔒), bukan gerbang Apps Script: siswa cuma boleh `create`
  dokumen dengan `uid` miliknya sendiri, tidak pernah boleh `update`/
  `delete`; guru boleh baca semua; orang tua boleh baca hasil anaknya
  (dicocokkan lewat field `namaSiswa` ada di `anak` milik akun orang tua).
- **Implikasi**: field `hasilLatihan: [...]` di respons `?laporanSiswa=1`
  yang direncanakan di §6.3 versi lama dokumen ini TIDAK relevan lagi —
  Pintu 3 (§6.4 di bawah) akan baca `hasil_latihan` langsung dari
  Firestore di sisi klien, sama seperti `riwayat-latihan.html`, BUKAN lewat
  endpoint Apps Script yang direncanakan semula.

### 6.4 Pintu 3 sesungguhnya — ✅ SUDAH DIIMPLEMENTASIKAN

- `pages/laporan-siswa/latihan-mandiri.html` sudah dibangun jadi laporan
  sungguhan (untuk guru & orang tua, konsisten dengan Pintu 1/2 — TETAP
  tidak untuk siswa), memakai data `hasil_latihan` yang sudah ada.
  Ringkasan keseluruhan (rata-rata skor terbaik + "N dari M TP tersedia
  sudah dicoba") di atas, lalu rincian per mapel → per TP (skor terbaik,
  jumlah percobaan, skor & tanggal percobaan terakhir).
- **Beda dari Pintu 1/2**: dibaca **langsung dari Firestore di sisi
  klien** (file baru `pages/laporan-siswa/assets/latihan-mandiri.js`),
  BUKAN lewat endpoint Apps Script — konsisten dengan keputusan arsitektur
  di §6.3. Tetap pakai komponen pemilih siswa yang sama
  (`laporan-picker.js`) seperti Pintu 1/2.
- **Keputusan desain**: TP yang belum pernah dicoba siswa TIDAK
  ditampilkan sebagai baris kosong (beda dari Pintu 2 yang menampilkan
  semua materi termasuk yang belum dibaca) — karena soal Uji Kemampuan
  baru mencakup sebagian TP/mapel (Bahasa Indonesia + 1 pilot Matematika,
  lihat `progress_materi.md`), menampilkan semua TP dari semua mapel
  sebagai "belum dicoba" dinilai lebih membingungkan daripada membantu di
  tahap sekarang. Cakupan keseluruhan tetap terlihat lewat angka ringkasan.
- ✅ **[Selesai]** Bug UID anonim sudah dibereskan — ternyata bukan
  blocker sungguhan, cuma kode mati di `riwayat-latihan.html` (cabang
  `role === "siswa"` yang tidak pernah bisa terpicu karena halaman itu
  guru-only DAN kebijakan proyek memang mengecualikan siswa dari semua
  laporan). Kode matinya sudah dihapus. Pintu 3 memakai pola query yang
  sama (guru baca semua, orang tua dicocokkan lewat `namaSiswa`) — tidak
  ada bug UID yang perlu dibereskan untuk pintu ini.
- **Belum diuji sungguhan** di browser/Firebase asli sejak dibangun —
  baru divalidasi sintaks JS-nya (`node --check`), belum diverifikasi
  query Firestore-nya mengembalikan data yang benar atau batas akses
  orang tuanya bekerja sesuai desain saat dites langsung. Lihat checklist
  regresi terkait di `ANTIREGRESI.md` §28.

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
      dibangun DAN SEMUANYA sudah aktif: Pintu 1 (MPLS), Pintu 2
      (`belajar-mandiri.html`, bagian Materi Ajar — bagian Modul masih
      menyusul, lihat §7.2), dan Pintu 3 (`latihan-mandiri.html`, lihat
      §6.4). Belum ada satu pun yang diuji sungguhan di browser/Firebase
      asli sejak Pintu 3 selesai dibangun.**
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
- **Pintu 2 (Perkembangan Belajar Mandiri)** — bagian Materi Ajar SUDAH
  aktif (lihat §7.1). Bagian Modul masih belum — progres Modul contoh yang
  diberikan murni tersimpan di browser (belum ada jembatan ke server sama
  sekali), lihat temuan & rencana di §7.2.
- **Pintu 3 (Latihan Mandiri Siswa)** — SUDAH aktif (lihat §6.4), termasuk
  redesain besar "Uji Kemampuan" di baliknya (§6.1–§6.3).
