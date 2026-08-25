# Rancangan Upgrade Login — Kelas 5

> Status: **✅ SELURUH PROYEK SELESAI (Fase 1–6 + Pembatasan Akses §7).**
> Sudah dicatat di `CHANGELOG.md` (v0.11.0). Dokumen ini tetap disimpan di
> repo sebagai riwayat desain & keputusan, untuk dirujuk kalau ada perubahan/
> perluasan sistem login di masa depan.
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
- [x] **Fase 1 — Data**: kolom NISN ditambahkan, lalu (mengikuti keputusan
  migrasi arsitektur di tengah jalan — lihat `RANCANGAN-MIGRASI-FIRESTORE.md`)
  seluruh "Data Siswa" dipindah ke Firestore (koleksi `siswa/{nisn}`). 25
  siswa sudah berhasil dimigrasi & diverifikasi Arif di Firebase Console.
- [x] **Fase 2 — Backend login siswa**: endpoint `siswa_login` (fungsi
  `doPostSiswaLogin_()`) sudah ditulis di `Code.gs` — cek nama+NISN ke
  Firestore `siswa/{nisn}` langsung by ID dokumen, balas cuma `status`/
  `message` generik (tidak pernah membocorkan data profil atau info mana
  yang salah), TANPA gerbang `wajibGuru_` (memang dipanggil sebelum siswa
  py sesi Auth). **✅ Diuji Arif lewat Console browser — status ok/error
  sesuai harapan, termasuk pesan error generik yang sama persis untuk nama
  salah maupun NISN salah.**
  Sumber daftar nama: `MPLS_STUDENTS`, sudah ada, tidak perlu endpoint baru
  untuk itu (lihat §0).
- [x] **Fase 3 — UI login siswa**: `index.html` sekarang punya 2 tab (Siswa /
  Guru & Orang Tua). Tab Siswa: dropdown nama (dari `MPLS_STUDENTS`) + input
  NISN → panggil `siswa_login` → kalau cocok, `signInAnonymously()` +
  simpan nama ke `sessionStorage`. `onAuthStateChanged` disesuaikan: akun
  anonim tanpa nama di sessionStorage otomatis di-signOut (jaga-jaga sesi
  "nyasar"). **✅ Diuji Arif di browser sungguhan — berhasil** (sempat perlu
  aktifkan provider "Anonymous" dulu di Firebase Console → Authentication →
  Sign-in method, baru bisa jalan).
- [ ] **Fase 4 — Pendaftaran & approval orang tua**: `daftar-orangtua.html`
  dibuat (form nama ortu + pilih anak + email/password + WhatsApp opsional →
  `createUserWithEmailAndPassword` + `setDoc` role `pending_orangtua` →
  signOut). `index.html`: layar status "Menunggu Persetujuan"/"Pendaftaran
  Ditolak" ditambahkan (`#status-screen`), ditampilkan mengganti `#app`
  sepenuhnya untuk role `pending_orangtua`/`rejected`. `pages/admin.html`:
  tab baru "Persetujuan Orang Tua" (3 daftar: menunggu/disetujui/ditolak,
  tombol Setujui/Tolak/Cabut Akses). Aturan Firestore `users` diperbarui
  di `README.md` (izinkan `create` role `pending_orangtua` oleh diri sendiri
  + izinkan guru **membaca** — bukan cuma menulis — dokumen siapa saja, yang
  ternyata belum ada sebelumnya dan akan membuat query daftar "menunggu"
  gagal total kalau tidak ditambahkan). Perbaikan tambahan: `laporan-guard.js`
  diperketat dari blacklist (`role !== "siswa"`) jadi whitelist eksplisit
  (`role === "guru" || role === "orangtua"`), supaya `pending_orangtua`/
  `rejected` tidak ikut lolos ke Laporan Siswa seperti sebelum diperbaiki.
  **Menunggu Arif: tempel aturan Firestore baru ke Firebase Console (WAJIB,
  tanpa ini fitur ini tidak akan berfungsi), lalu uji end-to-end.**
- [x] **Fase 5 — Lupa kata sandi**: tombol "Lupa kata sandi?" di tab Guru &
  Orang Tua sekarang menggantikan form login dengan form kirim tautan reset
  (`sendPasswordResetEmail`). Pesan hasil SENGAJA sama persis baik email
  terdaftar maupun tidak (privasi — tidak membocorkan siapa yang punya akun).
  **Langkah manual yang disarankan (opsional tapi bagus dilakukan) untuk
  Arif**: buka Firebase Console → Authentication → Templates → Password
  reset → kustomisasi ke Bahasa Indonesia + nama sekolah, supaya orang tua
  tidak curiga itu email asing/spam (defaultnya bahasa Inggris & branding
  generik Firebase). Ini konfigurasi Console, tidak ada kode yang perlu
  diubah untuk ini.
  **Menunggu Arif upload & uji end-to-end** (checklist di `ANTIREGRESI.md`
  §34) — termasuk benar-benar klik tautan di email & set kata sandi baru.
- [ ] **Fase 6 — Dokumentasi & uji**: lengkapi `ANTIREGRESI.md` (skenario login
  siswa/orangtua/lupa-password — §29 utk NISN sudah ada), `CHANGELOG.md`,
  `README.md` (aturan Firestore terbaru), uji end-to-end tiap alur.

## 7. Pembatasan Akses per Role (di luar 6 fase semula — permintaan tambahan)

> Ditambahkan setelah Fase 3 selesai & terverifikasi. Siswa: hanya Modul
> Pembelajaran, Materi Ajar, Galeri Visual, Uji Kemampuan. Orang tua: hanya
> Laporan Siswa & Pengumuman. Guru: tidak dibatasi sama sekali (semua menu).

**Lingkup yang dikerjakan:**
- Kartu menu di beranda (`index.html`) disembunyikan per role lewat atribut
  `data-akses` + fungsi `terapkanAksesMenu_()`.
- Penegakan SUNGGUHAN (bukan cuma kartu disembunyikan) di 9 halaman induk,
  lewat guard baru `assets/js/role-guard.js` (varian `auth-guard.js` yang
  ADA cek role, menangani akun siswa anonim & guru/orangtua Firestore
  dalam 1 fungsi): `materi.html`/`modul.html`/`infografis.html`/
  `uji-kemampuan.html` (siswa+guru), `riwayat-latihan.html`/`cp-tp-atp.html`/
  `jadwal.html`/`bank-soal.html` (guru saja), `info.html` (orangtua+guru).

**Lingkup yang SENGAJA TIDAK dikerjakan:**
- 150+ file konten individual (`pages/materi/.../*.html`,
  `pages/modul/.../*.html`) — TETAP cuma `auth-guard.js` (login apa saja),
  TIDAK ditambah cek role. Kalau tahu URL persisnya, siswa/orangtua/siapa pun
  yang login tetap bisa buka langsung — beda ancaman dengan "kelihatan di
  menu beranda". Bisa dikerjakan sebagai proyek terpisah kalau Arif mau
  penegakan sekeras itu juga.
- `pages/mpls/index.html` (halaman menu MPLS) — TIDAK ditambah guard sendiri
  (strukturnya beda dari 9 halaman lain, butuh restrukturisasi tampilan
  "tunggu-lalu-tampil" yang belum ada). Kartu beranda ke sana sudah
  disembunyikan dari siswa/orangtua, dan 2 sub-halamannya
  (`input.html`/`rekap.html`) sudah punya proteksinya sendiri (kode akses
  sederhana / kemungkinan `guru-guard.js`) — jadi datanya tetap aman, cuma
  halaman menu perantaranya sendiri belum ikut ditolak kalau URL-nya diketik
  langsung.

**2 bug regresi nyata yang ketemu & diperbaiki saat mengerjakan ini** (bukan
disengaja — ditemukan waktu memeriksa semua tempat yang baca Firestore
`users/{uid}` untuk siswa; SEMUA tempat itu ternyata rusak untuk akun anonim,
karena akun anonim tidak pernah punya dokumen itu):
1. `pages/uji-kemampuan.html` — nama siswa buat simpan hasil diambil ulang
   dari Firestore (`snap.data().nama || currentUser.email`), keduanya
   bakal kosong/undefined untuk akun anonim. Diperbaiki: pakai `e.detail.nama`
   dari `role-verified` (`role-guard.js`), sudah benar dari sananya.
2. `pages/materi/assets/materi-progress-tracker.js` — pelacak progres materi
   (dipakai fitur Laporan Siswa Pintu 2) BERHENTI TOTAL mengirim progres
   untuk siswa, karena syaratnya `data.role === "siswa"` dari Firestore yang
   tidak akan pernah cocok untuk akun anonim. Diperbaiki: cabang khusus
   `user.isAnonymous` baca `sessionStorage` duluan.

**1 perbaikan desain terkait, ditemukan saat menganalisis dampak akun
anonim** (bukan bug yang sudah terjadi, tapi celah yang baru muncul kalau
tidak diantisipasi): sesi Firebase secara default tersimpan LINTAS TAB
(`browserLocalPersistence`). Kalau siswa login di 1 tab lalu ada tab lain
situs ini kebuka di browser yang sama, tab kedua akan "mewarisi" sesi
anonim itu tanpa nama di `sessionStorage`-nya (sessionStorage tidak ikut
lintas tab) — proteksi "sesi nyasar" yang sudah ada di Fase 3 malah akan
ikut mengeluarkan sesi tab PERTAMA juga (satu sesi Firebase yang sama).
Diperbaiki: sesi siswa sekarang pakai `setPersistence(auth,
browserSessionPersistence)` sebelum `signInAnonymously()` — jadi
benar-benar per-tab, tidak lagi ikut lintas tab seperti guru/orangtua
(yang tetap `browserLocalPersistence` seperti semula).

## 8. Checklist Progres — Pembatasan Akses

- [x] `data-akses` + `terapkanAksesMenu_()` di `index.html`
- [x] `assets/js/role-guard.js` dibuat
- [x] Diterapkan ke 9 halaman induk (lihat daftar di §7)
- [x] Bug `uji-kemampuan.html` (nama siswa) diperbaiki
- [x] Bug `materi-progress-tracker.js` (progres berhenti total) diperbaiki
- [x] Perbaikan `setPersistence` per-tab untuk sesi siswa
- [ ] **Arif upload & uji end-to-end** (checklist lengkap di `ANTIREGRESI.md`
  §32) — termasuk uji penegakan URL langsung, uji hasil Uji Kemampuan &
  progres materi benar-benar tersimpan untuk siswa, dan uji sesi per-tab
  (buka tab baru saat masih login siswa di tab lain)
