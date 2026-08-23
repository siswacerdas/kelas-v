# Rancangan Upgrade Login — Kelas 5

> Status: **Fase 1 (Data) SELESAI dikerjakan, menunggu Arif deploy & verifikasi
> di sheet sungguhan sebelum lanjut Fase 2.**
> Dokumen ini adalah pelacak progres. Setiap sesi kerja berikutnya, lanjutkan dari
> checklist "Rencana Tahapan Kerja" di bagian bawah — tandai `[x]` yang sudah selesai
> sebelum mengakhiri sesi, supaya sesi berikutnya tahu persis harus mulai dari mana.

## 0. Keputusan Terkonfirmasi Arif (sesi ini)

1. 25 siswa di sheet "Data Siswa" sudah sama persis dengan file excel NISN,
   tinggal kolom NISN-nya yang belum ada → jadi **cukup tambah kolom + isi**,
   bukan import 25 baris baru.
2. Field nomor WhatsApp (opsional) di form pendaftaran orang tua — **disetujui**,
   akan dikerjakan di Fase 4.
3. Rekomendasi lupa password (`sendPasswordResetEmail` bawaan Firebase + prosedur
   manual Console untuk kasus ekstrem, tanpa fitur hapus akun di admin.html) —
   **disetujui**, akan dikerjakan di Fase 5.

**Temuan tambahan penting** (ditemukan saat mulai Fase 1, mengubah rencana Fase 2):
daftar nama 25 siswa TERNYATA sudah punya satu sumber kebenaran yang dipakai
bersama oleh modul MPLS & Data Kelas: `pages/mpls/assets/mpls-data.js`
(`MPLS_STUDENTS`). Jadi endpoint `?daftarSiswaPublik=1` yang direncanakan semula
di §4.3 **TIDAK JADI dibuat** — dropdown pilih nama untuk login siswa & form
daftar orang tua akan langsung memakai array `MPLS_STUDENTS` ini (di-include
sebagai `<script>` biasa), konsisten dengan prinsip "satu sumber kebenaran" yang
sudah dipakai proyek ini di tempat lain. §4.3 & §4.4 di bawah sudah disesuaikan.

## 1. Kondisi Saat Ini (hasil pelajari repo `kelas-v-main`)

Semua akun — guru, siswa, orang tua — saat ini login dengan **email & kata sandi**
lewat Firebase Auth (`signInWithEmailAndPassword` di `index.html`). Tidak ada:
- Login khusus siswa pakai NISN
- Pendaftaran mandiri orang tua
- Kolom NISN di sheet "Data Siswa" maupun di form `pages/kelas/index.html`
- Mekanisme lupa kata sandi

Akun dibuat manual oleh guru langsung di Firebase Console + isi dokumen
`users/{uid}` di Firestore manual juga. Aturan Firestore saat ini (`README.md`):

```
match /users/{uid} {
  allow read:  if request.auth != null && request.auth.uid == uid;
  allow write: if request.auth != null &&
    get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'guru';
}
```

**Penting:** aturan ini TIDAK mengizinkan orang yang baru daftar menulis dokumennya
sendiri (karena saat itu dokumen `users/{uid_baru}` miliknya sendiri belum ada, jadi
`get()` gagal → ditolak). Ini harus diubah supaya pendaftaran mandiri orang tua bisa
jalan (lihat §4.3).

## 2. Desain yang Disepakati

### 2.1 Siswa — pilih nama + NISN
- Siswa buka halaman login → pilih namanya dari daftar (dropdown/pencarian, diambil
  dari sheet "Data Siswa" lewat endpoint publik yang **hanya** mengembalikan nama,
  tanpa data lain).
- Masukkan NISN (10 digit).
- Dicek ke Apps Script: nama + NISN harus cocok 1 baris di sheet "Data Siswa".
- Kalau cocok: client memanggil `signInAnonymously()` (Firebase Anonymous Auth),
  lalu simpan `sessionStorage.kelas5_siswa_nama = "<nama>"`. Ini dipakai `index.html`
  dkk. untuk menampilkan nama & mengirim ke endpoint materi/progres — BUKAN dokumen
  Firestore (akun anonim tidak akan punya dokumen `users/{uid}`).
- `auth-guard.js` (dipakai di Materi Ajar, Modul, dsb.) tidak perlu berubah — dia
  memang tidak pernah mengecek role, cukup "sudah login apa saja". Anonymous auth
  otomatis lolos di situ.
- **Kenapa sessionStorage, bukan localStorage:** supaya kalau HP dipakai bergantian
  antar siswa (kadang terjadi di kelas), sesi "nama siswa" tidak nyangkut ke sesi
  browser berikutnya begitu tab ditutup. UID anonim Firebase sendiri boleh saja
  persist (tidak berbahaya, tidak melekat ke identitas), tapi nama tampilan harus
  ikut sesi tab.

### 2.2 Guru & Orang Tua — email + kata sandi (tidak berubah)
- Tetap `signInWithEmailAndPassword` + `browserLocalPersistence` seperti sekarang.
- Guru: tidak ada perbedaan hak antar 2 akun guru (sesuai permintaan) — keduanya
  `role: "guru"`, bertindak sebagai admin penuh.

### 2.3 Pendaftaran Orang Tua (mandiri, lalu disetujui guru)
- Halaman baru `daftar-orangtua.html`:
  1. Pilih nama anak dari daftar siswa (endpoint publik yang sama seperti §2.1,
     nama saja — **tanpa** perlu NISN di form ini, karena verifikasi identitas
     sesungguhnya ada di langkah persetujuan guru, bukan di form).
  2. Isi email + kata sandi (+ opsional nomor WhatsApp — lihat catatan keamanan
     di §3.2 kenapa ini saya sarankan).
  3. Client memanggil `createUserWithEmailAndPassword()` (akun Firebase Auth
     langsung jadi), lalu menulis `users/{uid}`: `{ role: "pending_orangtua",
     anak: [namaAnak], nama, email, wa, createdAt }`, lalu **langsung signOut**.
  4. Layar sukses: "Pendaftaran terkirim, menunggu persetujuan guru."
- Kalau orang tua yang statusnya masih `pending_orangtua` (atau sudah `rejected`)
  mencoba login lagi (mis. sesi lama browserLocalPersistence otomatis login), 
  `index.html` harus mendeteksi role tsb dan menampilkan layar "menunggu
  persetujuan" / "pendaftaran ditolak — hubungi guru", BUKAN membuka aplikasi.
- Guru menyetujui/menolak di panel baru (tab baru di `admin.html`, atau halaman
  approval terpisah): daftar semua `users` dengan `role == "pending_orangtua"`,
  tombol **Setujui** (→ `role: "orangtua"`) / **Tolak** (→ `role: "rejected"`).

### 2.4 Lupa Kata Sandi — rekomendasi saya

**Pakai `sendPasswordResetEmail()` bawaan Firebase Auth**, bukan bikin mekanisme
sendiri. Alasannya:

- Nol infrastruktur tambahan — Firebase yang generate link sekali-pakai, kirim
  email, dan sediakan halaman ganti password-nya. Kita cuma perlu 1 tombol
  "Lupa kata sandi?" + input email di halaman login yang memanggil fungsi ini.
- Aman secara default (token kedaluwarsa otomatis, tidak lewat server kita sendiri
  jadi tidak menambah celah baru).
- Untuk privasi, tampilkan pesan generik yang sama baik email terdaftar maupun
  tidak ("Kalau email terdaftar, tautan reset sudah dikirim") — supaya orang tak
  bisa dipakai mengecek email siapa saja yang punya akun.
- **Satu langkah yang saya sarankan dilakukan sekali di Firebase Console:**
  kustomisasi template email (Authentication → Templates → Password reset) ke
  Bahasa Indonesia + nama sekolah/kelas, supaya orang tua tidak curiga itu email
  asing/spam. Ini konfigurasi Console, bukan kode.

**Kasus ekstrem — orang tua sudah tidak punya akses ke email yang didaftarkan
sama sekali** (jarang, tapi mungkin, apalagi kalau typo saat daftar): jalur reset
email tidak akan pernah sampai. Untuk kasus ini saya **tidak** menyarankan bikin
fitur "hapus akun paksa" di `admin.html`, karena menghapus akun Firebase Auth milik
orang lain butuh Admin SDK/service account — nambah kompleksitas & permukaan
risiko keamanan untuk kasus yang harusnya jarang terjadi di kelas 25 anak. Cukup:
guru (yang jelas sudah punya akses Firebase Console sebagai admin proyek) hapus
manual akun itu dari Console kalau kejadian, lalu orang tua daftar ulang dengan
email yang benar. Saya catat ini sebagai prosedur manual di `ANTIREGRESI.md`,
bukan fitur di aplikasi.

## 3. Catatan Keamanan

### 3.1 NISN sebagai "kata sandi" siswa
NISN bukan rahasia yang kuat (biasanya tercetak di rapor/kartu pelajar, dan formatnya
bisa ditebak-tebak). Untuk anak kelas 5, ini level keamanan yang wajar — bukan untuk
melindungi data sangat sensitif, hanya supaya bukan "siapa saja bisa klik nama
siapa saja". Materi & progres belajar bukan data berisiko tinggi kalau tertukar antar
siswa. Kalau suatu saat mau dinaikkan, opsi paling murah adalah tambah tanggal lahir
sebagai faktor kedua — tapi saya tidak menambahkan ini sekarang karena Arif sudah
memutuskan NISN saja, dan menambah friksi input di HP untuk anak 10-11 tahun ada
biayanya juga.

### 3.2 Verifikasi identitas orang tua saat approval
Karena form pendaftaran cuma minta *pilih nama anak* (bukan NISN), secara teknis
siapa pun bisa memilih nama anak orang lain saat mendaftar. Gerbang sesungguhnya
ada di kepercayaan guru saat approve — dengan 25 keluarga di 1 kelas, guru biasanya
kenal semua orang tua. Supaya keputusan approve lebih mudah diverifikasi, saya
sarankan form pendaftaran minta juga **nomor WhatsApp pendaftar** (opsional tapi
dianjurkan) supaya guru bisa mencocokkan dengan nomor yang sudah dikenal di grup
kelas sebelum menekan "Setujui". Ini bukan pengaman teknis, cuma bantu keputusan
manusia — saya jelaskan supaya Arif bisa putuskan mau dipakai atau tidak.

### 3.3 Perubahan aturan Firestore yang dibutuhkan
```
match /users/{uid} {
  allow read: if request.auth != null && request.auth.uid == uid;

  // Pendaftaran mandiri orang tua: HANYA boleh membuat dokumen milik diri
  // sendiri dengan role "pending_orangtua" — tidak bisa langsung set role
  // "guru"/"orangtua" sendiri (mencegah eskalasi privilese).
  allow create: if request.auth != null && request.auth.uid == uid &&
    request.resource.data.role == "pending_orangtua";

  // Guru tetap bisa tulis/ubah dokumen siapa saja (approve/reject, atau
  // buat akun guru/orangtua manual seperti sekarang).
  allow write: if request.auth != null &&
    get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'guru';
}
```
(Akun siswa anonim tidak pernah baca/tulis koleksi `users` sama sekali, jadi tidak
perlu aturan tambahan untuk mereka.)

## 4. Perubahan Data & Backend

### 4.1 Sheet "Data Siswa" — tambah kolom NISN
Header baru: `Timestamp, Nama Lengkap, Nama Panggilan, Tempat Lahir, Tanggal Lahir,
URL Foto, NISN`. **Kolom NISN wajib diformat sebagai Plain Text di Google Sheets**
(Format → Angka → Teks biasa) — kalau tidak, angka 0 di depan (mis. `0169932726`)
akan hilang jadi `169932726`. Apps Script juga akan membandingkan NISN sebagai
string yang di-trim, bukan angka.

### 4.2 Hasil pengecekan file `student-export-2026-08-15.xlsx`
Sudah saya periksa: 25 siswa Kelas 5A, semua NISN 10 digit, semua unik, dan di file
excel-nya sendiri NISN **sudah tersimpan sebagai teks** (bukan angka) sehingga 2 NISN
yang diawali "0" masih utuh:
- Arsyila Almahyira Azgefa → `0169932726`
- Inara Huwaida Ardhani → `0137469444`

Ini akan jadi data sumber untuk mengisi kolom NISN di sheet "Data Siswa" (lewat form
`pages/kelas/index.html` yang akan ditambah field NISN, atau lewat import sekali-jalan
kalau 25 baris siswa belum lengkap semua di sheet saat ini — perlu saya cek dulu
sheet-nya, atau Arif konfirmasi apakah 25 nama ini semua sudah ada di "Data Siswa").

### 4.3 Endpoint Apps Script baru di `Code.gs`
- ~~`?daftarSiswaPublik=1`~~ — **TIDAK JADI**, dropdown nama pakai `MPLS_STUDENTS`
  dari `pages/mpls/assets/mpls-data.js` langsung (lihat §0).
- `siswaLogin` (POST, body `{nama, nisn}`) → cocokkan ke sheet "Data Siswa",
  balas `{status:"ok"}` atau `{status:"error", message:"Nama atau NISN salah."}`.
  Pakai POST (bukan GET dengan query string) supaya NISN tidak nyangkut di log
  URL Apps Script. **Belum dibuat — bagian Fase 2.**
- `siswa_nisn_bulk` (POST, gerbang guru) → **SUDAH DIBUAT (Fase 1)**, lihat §4.5.

### 4.4 Halaman/file yang akan disentuh
- `index.html` — ganti layar login jadi 2 tab (Siswa / Guru & Orang Tua), tambah
  penanganan status `pending_orangtua`/`rejected`, tambah link "Daftar sebagai
  orang tua" & "Lupa kata sandi?". **Fase 3 & 5, belum disentuh.**
- `daftar-orangtua.html` — baru. **Fase 4, belum dibuat.**
- `pages/admin.html` — tab baru "Persetujuan Orang Tua". **Fase 4, belum disentuh.**
- `pages/kelas/index.html` + `assets/kelas.js` + `assets/kelas.css` — tambah
  field NISN di form kelola data siswa + panel "Impor NISN Massal".
  **✅ SELESAI (Fase 1).**
- `apps-script/Code.gs` — kolom NISN di `SISWA_HEADERS`, `doPostSiswa_()`
  dipertahankan-jika-kosong, endpoint `siswa_nisn_bulk` baru.
  **✅ SELESAI (Fase 1)**, endpoint `siswaLogin` masih Fase 2.
- Firestore rules (di Firebase Console, didokumentasikan di `README.md`) — §3.3.
  **Fase 4, belum diterapkan.**
- `ANTIREGRESI.md` — **§29 sudah ditambahkan (Fase 1)**: skenario kolom NISN +
  impor massal. Skenario login siswa/pendaftaran orang tua/lupa password akan
  menyusul di fase masing-masing.

### 4.5 Detail teknis Fase 1 (sudah dikerjakan sesi ini)
- `SISWA_HEADERS` di `Code.gs` bertambah kolom `"NISN"` di akhir.
- `doPostSiswa_()` diperbaiki supaya **tidak menghapus NISN yang sudah ada**
  kalau body request tidak menyertakan field NISN (bug pola sama seperti yang
  sudah pernah terjadi ke kolom "URL Foto" — lihat komentar `nisnLamaJikaAda()`
  di kode). Form `pages/kelas/index.html` sekarang SELALU mengirim field NISN
  (termasuk string kosong kalau guru sengaja mengosongkannya), jadi proteksi ini
  jadi lapisan pengaman tambahan untuk pemanggil lain, bukan jalur utama.
- Endpoint baru `type: "siswa_nisn_bulk"` (fungsi `doPostSiswaNisnBulk_()`) —
  terima `rows: [{nama, nisn}]`, cocokkan ke "Nama Lengkap" PERSIS SAMA, **hanya
  menulis 1 sel (kolom NISN)** per baris yang cocok (tidak menyentuh kolom lain
  sama sekali). Baris yang nama-nya tidak ketemu atau NISN-nya bukan 10 digit
  dikembalikan di daftar terpisah, tidak menggagalkan baris lain.
- UI baru di `pages/kelas/index.html`: field "NISN" di form edit siswa (dengan
  hint 10 digit), panel "Impor NISN Massal" (textarea format `Nama, NISN` per
  baris) yang memanggil endpoint di atas, dan peringatan di "Daftar Siswa
  Tersimpan" untuk siswa yang NISN-nya masih kosong.

**Langkah manual yang HARUS Arif lakukan di Google Sheets sebelum Fase 2 jalan:**
1. Buka sheet "Data Siswa" → tambah kolom header `NISN` (persis, tanpa spasi
   ekstra) di kolom setelah "URL Foto".
2. **Format kolom NISN sebagai Teks biasa** (blok kolom → Format → Angka →
   Teks biasa) — SEBELUM mengisi data apa pun ke situ.
3. Deploy ulang Apps Script sebagai versi baru dari deployment yang sama
   (Deploy > Manage deployments > pensil > New version) supaya endpoint baru
   aktif.
4. Buka `pages/kelas/index.html` di browser → pakai panel "Impor NISN Massal"
   → tempel 25 baris `Nama Lengkap, NISN` dari file excel yang sudah dikirim
   → jalankan → verifikasi semua 25 masuk ke "berhasil diperbarui", cek juga
   kolom lain (foto, dsb.) di sheet tidak berubah.

## 6. Rencana Tahapan Kerja (checklist progres)

- [x] **Fase 0 — Konfirmasi desain**: Arif konfirmasi 3 poin (lihat §0).
- [x] **Fase 1 — Data**: kolom NISN ditambahkan di `SISWA_HEADERS`, `doPostSiswa_`
  diperbaiki (tidak menghapus NISN saat field tak dikirim), endpoint
  `siswa_nisn_bulk` + UI impor massal di `pages/kelas/index.html` sudah dibuat.
  ⚠️ **Arif masih perlu jalankan 4 langkah manual di §4.5** (tambah kolom di
  sheet + format Teks biasa + deploy ulang Apps Script + jalankan impor) sebelum
  Fase 2 bisa diuji end-to-end.
- [ ] **Fase 2 — Backend login siswa**: endpoint `siswaLogin` di `Code.gs`,
  deploy versi baru. (Sumber daftar nama: `MPLS_STUDENTS`, sudah ada, tidak perlu
  endpoint baru untuk itu — lihat §0.)
- [ ] **Fase 3 — UI login siswa**: ubah `index.html` (tab Siswa, anonymous auth,
  sessionStorage nama), sesuaikan bagian yang baca `display-name`/role supaya jalan
  untuk akun anonim.
- [ ] **Fase 4 — Pendaftaran & approval orang tua**: `daftar-orangtua.html`
  (dengan field WhatsApp opsional — disetujui §0), aturan Firestore baru (§3.3),
  tab approval di `admin.html`, penanganan status `pending_orangtua`/`rejected`
  di `index.html`.
- [ ] **Fase 5 — Lupa kata sandi**: tombol + alur `sendPasswordResetEmail` di
  `index.html` (disetujui §0), kustomisasi template email di Firebase Console
  (manual, didokumentasi).
- [ ] **Fase 6 — Dokumentasi & uji**: lengkapi `ANTIREGRESI.md` (skenario login
  siswa/orangtua/lupa-password — §29 utk NISN sudah ada), `CHANGELOG.md`,
  `README.md` (aturan Firestore terbaru), uji end-to-end tiap alur.
