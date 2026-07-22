# Apps Script — Backend MPLS

Menghubungkan halaman `pages/mpls/input.html` ke Google Spreadsheet
(`1G-LWyOSyCKLP10RU234grIR_5-iWxLSG-6vZP3sKUkA`) tanpa perlu server sendiri.

---

## Langkah Setup (sekali saja)

### 1. Buka Spreadsheet, buka editor Apps Script
1. Buka spreadsheet tujuan (pastikan Anda **Editor/pemilik**nya)
2. Menu **Extensions → Apps Script** (Ekstensi → Apps Script)
3. Hapus isi default `Code.gs`, lalu salin-tempel seluruh isi file
   [`Code.gs`](./Code.gs) dari repo ini ke sana
4. Klik ikon 💾 **Save**

### 2. Inisialisasi sheet
1. Di dropdown fungsi (toolbar atas editor), pilih **setupSheet**
2. Klik **Run** (▶️)
3. Saat diminta izin, klik **Review permissions** → pilih akun Google Anda →
   **Advanced/Lanjutan** → **Buka (nama proyek) (tidak aman)** → **Allow/Izinkan**
   *(ini normal untuk script buatan sendiri yang belum diverifikasi Google)*
4. Cek spreadsheet — sheet baru bernama **"Data MPLS"** dengan header kolom
   akan otomatis muncul
5. Ulangi untuk fungsi **setupSiswaSheet** (pilih di dropdown → Run) — ini
   membuat sheet baru **"Data Siswa"** (dipakai fitur "Kelas" untuk profil +
   foto siswa). Saat run ini, akan muncul permintaan izin **tambahan** untuk
   akses Google Drive (dibutuhkan supaya foto siswa bisa disimpan ke folder
   Drive) — klik **Allow/Izinkan** lagi.

### 3. Deploy sebagai Web App
1. Klik **Deploy → New deployment** (Deploy → Deployment baru)
2. Klik ikon ⚙️ di samping "Select type" → pilih **Web app**
3. Isi:
   - **Execute as**: `Me` (akun Anda)
   - **Who has access**: `Anyone` (Siapa saja) — *wajib*, agar halaman web bisa
     mengirim data tanpa login Google
4. Klik **Deploy**
5. Salin **Web app URL** yang muncul (formatnya
   `https://script.google.com/macros/s/xxxxx/exec`)

### 4. Tempel URL ke config
1. Buka `pages/mpls/assets/config.js` di repo ini
2. Ganti `APPS_SCRIPT_URL: "GANTI_DENGAN_URL_WEB_APP_APPS_SCRIPT"` dengan URL
   yang baru disalin
3. Simpan, commit, push ke GitHub

### 5. Uji coba
1. Buka `pages/mpls/input.html` di HP
2. Masukkan kode akses (default: `mpls2026`, bisa diganti di `config.js`)
3. Pilih satu siswa, isi beberapa indikator, klik **Simpan**
4. Cek sheet **"Data MPLS"** — baris baru harus muncul
5. Pilih siswa yang sama lagi → data yang tadi diisi harus otomatis termuat
   ulang (bukan kosong)

---

## Setiap kali kode Code.gs diubah

Apps Script **tidak otomatis update** deployment yang sudah aktif. Setelah
mengedit `Code.gs`:
1. **Deploy → Manage deployments**
2. Klik ikon ✏️ pada deployment aktif
3. Ubah **Version** ke **New version**
4. Klik **Deploy**

URL Web App tetap sama — tidak perlu ganti `config.js` lagi.

---

## Cara kerja singkat

> **Sejak v0.7.0**: hampir semua endpoint di bawah butuh parameter tambahan `kode` atau
> `idToken` (lihat bagian "Keamanan" di bawah untuk detail lengkapnya) — ringkasan di
> bawah ini fokus ke fungsi datanya, bukan gerbang aksesnya.

- **Satu baris per siswa.** Mengisi ulang siswa yang sama akan meng-update
  baris yang sudah ada (dicocokkan lewat kolom "Nama Siswa"), bukan menambah
  baris baru — supaya bisa diisi bertahap selama minggu MPLS.
- **GET** `?nama=Nama%20Siswa` → mengembalikan data MPLS siswa itu bila sudah ada
  (dipakai `input.html` untuk memuat isian sebelumnya).
- **GET** `?all=1` → mengembalikan SEMUA baris data MPLS (dipakai `rekap.html`
  dan `laporan.html` untuk menghitung kesimpulan otomatis semua siswa).
- **GET** `?siswa=1` → mengembalikan SEMUA baris profil siswa dari sheet
  "Data Siswa" (dipakai `pages/kelas/index.html` dan `laporan.html`).
- **GET** `?foto=<id atau URL Drive>` → **(baru sejak v0.5.3)** bukan JSON,
  tapi PROXY yang mengirim langsung byte gambar foto siswa, dipakai sebagai
  `<img src>` oleh `assets/js/foto-fallback.js`. Lihat bagian
  "Troubleshooting: foto tersimpan tapi tidak tampil" di bawah untuk alasannya.
- **POST** tanpa `type` (body JSON, key = nama kolom persis seperti di
  `HEADERS`) → simpan/update baris nilai MPLS (perilaku lama, tidak berubah).
- **POST** dengan `type: "siswa"` → simpan/update profil siswa (dicocokkan
  lewat "Nama Lengkap"). Kalau body menyertakan `fotoBase64` + `fotoMime`,
  foto akan disimpan sebagai file baru ke folder Google Drive dengan ID
  di konstanta `FOTO_FOLDER_ID`, lalu URL-nya disimpan ke kolom "URL Foto".
- Header kolom didefinisikan satu tempat di `HEADERS` / `SISWA_HEADERS` /
  `HEADERS_KOGNITIF` (atas file `Code.gs`) — dipakai HANYA untuk membuat
  sheet baru pertama kali (`setupSheet`/`setupSiswaSheet`/`setupSheetKognitif`).
  Untuk **membaca/menulis data**, kode selalu membaca ulang baris header
  yang SESUNGGUHNYA ada di baris 1 tiap sheet (`readHeaderRow_`), bukan
  mengasumsikan urutan kolom tetap — jadi tetap aman walau kolom di
  spreadsheet fisik pernah diubah urutannya secara manual.

## Troubleshooting: foto/tanggal lahir tidak muncul

Kalau setelah simpan data siswa, foto atau tanggal lahir tidak muncul di
daftar `pages/kelas/index.html`:

1. **Cek dulu apakah datanya benar-benar tersimpan** — buka spreadsheet →
   sheet "Data Siswa" → cek baris siswa tsb. Kalau kolom "URL Foto" kosong,
   berarti upload foto ke Drive-nya yang gagal (lihat poin 2). Kalau kolom
   "Tanggal Lahir" kosong, cek apakah field itu memang diisi saat submit form.
2. **Foto gagal terupload dengan pesan `Exception: Access denied: DriveApp`** —
   ini paling sering terjadi karena izin **Spreadsheet** dan izin **Drive**
   adalah 2 hal TERPISAH di Google, walau sama-sama dipakai 1 script. Ciri
   khasnya: data teks (nama/panggilan/TTL) berhasil tersimpan, tapi foto
   gagal — itu artinya izin Spreadsheet sudah oke, cuma izin Drive yang
   belum. **Deploy ulang saja TIDAK cukup** untuk memicu izin baru. Caranya:
   1. Buka Apps Script editor (dari spreadsheet: Extensions/Ekstensi → Apps Script)
   2. Di dropdown fungsi (toolbar atas), pilih **`otorisasiAksesDrive`**
   3. Klik **Run** (▶️)
   4. Muncul dialog "Authorization required" → **Review permissions** → pilih
      akun Google Anda → **Advanced/Lanjutan** → "Buka (nama proyek) (tidak
      aman)" → **Allow/Izinkan**
   5. Cek log (menu **View → Logs**, atau Ctrl+Enter) — kalau muncul nama
      folder foto, berarti berhasil
   6. **Tidak perlu deploy ulang** — izin ini melekat ke akun Google Anda,
      bukan ke versi deployment. Langsung coba lagi upload foto dari web.
   - Kalau langkah di atas TIDAK memunculkan dialog izin sama sekali (langsung
     jalan tanpa dialog tapi tetap error), kemungkinan project Apps Script
     Anda punya file `appsscript.json` dengan `oauthScopes` yang didefinisikan
     manual dan belum menyertakan scope Drive. Buka file itu (menu ⚙️ Project
     Settings → centang "Show appsscript.json") dan pastikan ada
     `"https://www.googleapis.com/auth/drive"` di daftar `oauthScopes`.
3. **Header sheet jangan diedit manual** (nama kolom di baris 1) — kode
   sekarang membaca nama kolom apa adanya dari baris 1, jadi kalau nama
   kolom diketik ulang dengan typo/beda kapitalisasi, field itu tidak akan
   ketemu. Aman menambah kolom BARU di paling kanan, tapi jangan mengubah
   teks header kolom yang sudah ada.

## Folder Drive untuk foto siswa

Foto disimpan ke folder yang linknya sudah dishare "siapa saja yang punya
link bisa mengedit" (ID folder ada di konstanta `FOTO_FOLDER_ID` pada
`Code.gs`). Ini pengaturan sementara sesuai permintaan pemilik proyek —
bila ingin diperketat nanti, folder bisa diubah ke akses lebih terbatas
(mis. hanya akun tertentu), tanpa perlu mengubah kode `Code.gs`.

URL foto yang disimpan (kolom "URL Foto" di sheet) tetap memakai format lama
`https://drive.google.com/thumbnail?id=FILE_ID&sz=w1000` — ini TIDAK perlu
diubah, karena `assets/js/foto-fallback.js` hanya menggunakan URL ini untuk
**mengekstrak ID file**, lalu membangun ulang kandidat-kandidat tampilannya
sendiri (termasuk proxy `?foto=` yang baru, lihat bawah). Foto lama yang
sudah pernah tersimpan otomatis ikut kebagian perbaikan tanpa perlu diedit.

## Troubleshooting: foto TERSIMPAN di Drive tapi TIDAK TAMPIL di web/cetak

Kalau data siswa berhasil disimpan (termasuk kolom "URL Foto" terisi), file
foto juga terlihat ada di folder Drive — tapi foto tetap tidak tampil di
`pages/kelas/index.html` maupun laporan cetak (selalu jatuh ke placeholder
"Foto Siswa"):

- **Ini BUKAN soal format URL** (sudah dicoba 3 format berbeda sejak v0.5.2,
  tetap gagal semua). Akar masalahnya: ketiga format itu sama-sama meng-
  **hotlink** file Drive langsung dari domain Google sebagai pengunjung
  ANONIM (browser yang membuka halaman tidak login ke akun Google manapun).
  Google membatasi/memblokir pola ini secara tidak konsisten, terlepas dari
  file sudah di-set "Anyone with the link" atau belum.
- **Solusi sejak v0.5.3**: `Code.gs` sekarang punya endpoint `?foto=<id>`
  yang membaca & mengirim byte file itu sendiri lewat Apps Script (berjalan
  sebagai akun pemilik yang punya akses sah, bukan pengunjung anonim) —
  `foto-fallback.js` otomatis memakai ini sebagai kandidat pertama.
- **WAJIB deploy ulang** (`Deploy → Manage deployments` → ✏️ → ubah dropdown
  **Version** ke **New version** → **Deploy**) setelah menarik update
  `Code.gs` ini, kalau tidak endpoint `?foto=` baru tidak akan aktif meski
  kode di editor sudah benar (kesalahan paling umum, lihat bagian "Setiap
  kali kode Code.gs diubah" di atas).
- Kalau setelah deploy ulang foto TETAP tidak tampil, buka langsung URL
  `APPS_SCRIPT_URL_ANDA?foto=ID_FILE_DARI_KOLOM_URL_FOTO` di tab browser
  baru — kalau muncul pesan teks "Foto tidak ditemukan/gagal dibaca: ...",
  itu artinya ID filenya salah/file sudah terhapus dari Drive (cek folder
  `FOTO_FOLDER_ID`), bukan lagi masalah hotlink.

## Troubleshooting: foto berhasil ke Drive tapi kolom "URL Foto" tetap KOSONG di sheet

Kalau folder Drive (`FOTO_FOLDER_ID`) sudah punya file foto barunya, TIDAK ada pesan
peringatan foto gagal yang muncul di aplikasi, tapi kolom "URL Foto" di sheet
"Data Siswa" tetap kosong untuk siswa itu (v0.5.4):

1. Buka sheet "Data Siswa" → **cek PERSIS teks header di baris 1, kolom URL Foto**.
   Kode menulis nilai berdasarkan kecocokan nama header PERSIS (case-sensitive, termasuk
   spasi) — kalau header tertulis mis. `"Url Foto"`, `" URL Foto"` (ada spasi di depan),
   atau `"URL Foto "` (spasi di belakang), kolom itu TIDAK akan pernah terisi otomatis oleh
   aplikasi, walau foto sendiri sudah 100% berhasil terupload ke Drive. Perbaiki teks header
   itu jadi PERSIS `URL Foto`, lalu coba simpan ulang data siswa yang sama.
2. Setelah update `Code.gs` v0.5.4, kondisi #1 di atas akan otomatis terdeteksi dan muncul
   sebagai pesan peringatan jelas di toast aplikasi (bukan lagi senyap) — asalkan sudah
   di-deploy ulang sebagai "New version".
3. Kalau header sudah PERSIS benar dan tetap kosong, cek juga apakah nilai yang ditulis ke
   `body["URL Foto"]`/hasil `simpanFotoKeDrive_()` memang bukan string kosong — buka
   **View → Logs** (atau **Executions** di menu kiri editor Apps Script) setelah mencoba
   simpan data untuk melihat error yang mungkin tertahan.

## Troubleshooting: link foto yang ditempel manual tidak tampil (atau nama siswa ikut hilang)

Kalau Anda menempel link Google Drive secara manual ke kolom "URL Foto" di spreadsheet
(untuk uji coba), pastikan formatnya link "Bagikan"/"Get link" standar, contoh:
`https://drive.google.com/file/d/ID_FILE/view?usp=drive_link` — format ini sudah dikenali
sejak v0.5.4. Kalau nama siswa yang bersangkutan malah ikut hilang dari daftar (bukan cuma
placeholder foto yang muncul), pastikan Anda menarik update v0.5.4 (`foto-fallback.js`) —
versi sebelum itu punya bug terpisah yang membuat seluruh baris siswa ikut terhapus dari
tampilan saat foto gagal dimuat.

## Menambahkan kategori "Menyimak & Menulis" (v0.6.0) ke sheet yang sudah berjalan

Kategori baru ini ditambahkan di `Code.gs` (`HEADERS_KOGNITIF`) SETELAH kolom "Diisi
Oleh" — sengaja di ujung paling akhir, BUKAN disisipkan di tengah, supaya kolom-kolom
lama tidak pernah bergeser posisi (lihat komentar di `HEADERS_KOGNITIF` untuk alasan
lengkapnya). Konsekuensinya:

- **Sheet "Data MPLS Kognitif" yang BARU dibuat** (lewat `setupSheetKognitif()`) otomatis
  mendapat ke-14 kolom baru ini — tidak perlu langkah tambahan apa pun.
- **Sheet yang SUDAH ADA isinya**: kolom baru TIDAK muncul otomatis. Tambahkan manual
  14 kolom berikut di baris 1, dimulai dari kolom kosong pertama setelah kolom terakhir
  yang sudah ada sekarang (teksnya harus PERSIS sama, termasuk tanda baca):
  1. `Memperhatikan guru berbicara tanpa perlu diingatkan berulang kali`
  2. `Memahami instruksi lisan sederhana (1 langkah) dan langsung melaksanakannya dengan benar`
  3. `Memahami dan mengikuti instruksi lisan bertahap (2-3 langkah berurutan) dengan benar`
  4. `Mampu mengulang/menjelaskan kembali inti instruksi yang baru didengar dengan kata-kata sendiri`
  5. `Mampu memilah informasi penting dari penjelasan lisan yang lebih panjang (mis. bisa menyebutkan poin-poin utamanya)`
  6. `Bertahan menyimak dengan fokus selama penjelasan/instruksi berlangsung (tidak mudah teralih)`
  7. `Catatan Menyimak`
  8. `Menulis huruf/kata dengan bentuk yang terbaca jelas (kerapian bukan fokus utama, keterbacaan yang utama)`
  9. `Mencatat poin-poin penting dari penjelasan guru secara mandiri (tanpa didikte kata per kata)`
  10. `Menulis rangkuman singkat (1-3 kalimat) dari suatu penjelasan/bacaan dengan kata-kata sendiri`
  11. `Menyelesaikan catatan/tugas tulis dalam waktu yang wajar (tidak tertinggal jauh dari teman sekelas)`
  12. `Memahami maksud instruksi/kriteria tugas tertulis (mis. rubrik penilaian) dan tahu apa yang harus dilakukan untuk mendapat nilai baik`
  13. `Menuliskan jawaban/tugas sesuai dengan apa yang diminta instruksi (bukan asal menulis)`
  14. `Catatan Menulis`
- **Deploy ulang Apps Script sebagai "New version"** setelah menarik update `Code.gs` ini
  (seperti biasa setiap `Code.gs` berubah).
- Rubrik referensi cetak untuk kategori ini ada di
  `pages/mpls/rubrik/rubrik-menyimak-menulis-mpls.html` — dokumen mandiri (tidak
  memerlukan Apps Script/konfigurasi apa pun) berisi deskripsi lengkap tiap level
  (BB/MB/BSH/BSB) per indikator, untuk membantu kalibrasi skor saat mengisi di aplikasi.

## Keamanan

- Web App di-deploy dengan akses **Anyone**, artinya siapa pun yang tahu URL-nya
  bisa mengirim permintaan. Ini standar untuk pola "situs statis + Apps Script"
  tanpa server sendiri — yang membedakan aman/tidaknya adalah pengecekan **di dalam**
  `doGet`/`doPost`, bukan siapa yang boleh mengakses URL-nya.
- **Sejak v0.7.0**, setiap endpoint mengecek salah satu dari dua hal sebelum membalas data:
  1. **Kode akses sederhana** (`wajibKodeAkses_()`, konstanta `ACCESS_CODE_MPLS`) — untuk
     endpoint per-siswa yang dipakai halaman input (`?nama=`, `?namaKognitif=`,
     `?namaJurnal=`, `POST` jenis `mpls`/`mpls_kognitif`/`jurnal`). Ini **level proteksi
     yang sama** dengan `ACCESS_CODE` di `config.js` — cukup untuk mencegah pemanggilan
     tidak sengaja/asal, **bukan** keamanan sesungguhnya (kodenya ada di source file publik).
     `ACCESS_CODE_MPLS` di `Code.gs` dan `ACCESS_CODE` di `config.js` harus selalu disamakan
     manual kalau salah satunya diganti — dua file ini tidak saling membaca.
  2. **Verifikasi Firebase Auth sungguhan** (`wajibGuru_()`) — untuk endpoint yang
     mengembalikan/menulis data SEMUA siswa sekaligus (`?all=1`, `?siswa=1`,
     `?allKognitif=1`, `?allJurnal=1`, `?foto=`, `POST` jenis `siswa`), karena ini yang
     paling sensitif (nama lengkap, foto, tempat & tanggal lahir semua siswa). Klien
     mengirim `idToken` dari sesi Firebase Auth yang sedang login (diambil `guru-guard.js`
     lewat `window.guruIdToken`); server memverifikasi token itu ke Identity Toolkit REST
     API, lalu mengecek field `role` di Firestore (`users/{uid}`) lewat Firestore REST API.
     Ini **keamanan sungguhan** — bukan cuma kode rahasia yang bisa dibaca di source.
- **Redeploy WAJIB setelah menarik update ke v0.7.0**: kode lama (`Code.gs` versi lama yang
  masih ter-deploy) tidak mengenal parameter `idToken`/`kode` sama sekali, jadi endpoint
  akan tetap berjalan seperti sebelumnya sampai deployment aktif diganti ke versi baru
  (lihat "Setiap kali kode Code.gs diubah" di atas). Saat redeploy, Apps Script akan
  meminta izin tambahan untuk **menghubungkan ke layanan eksternal** (dipakai
  `UrlFetchApp` di `wajibGuru_()` untuk memanggil Identity Toolkit & Firestore) — klik
  Allow/Izinkan saat diminta, seperti otorisasi Drive yang sudah pernah diminta sebelumnya.
- **Celah yang masih tersisa (belum ditutup, sengaja)**: 3 kandidat fallback foto di
  `assets/js/foto-fallback.js` (hotlink langsung ke domain Google, peninggalan v0.5.2)
  tidak melalui `wajibGuru_()` — file-nya sendiri di folder Drive masih di-share "siapa
  saja yang punya link boleh melihat" (lihat `simpanFotoKeDrive_()`). Menutup ini berarti
  mengubah setting share folder jadi privat + melepas 3 kandidat fallback tsb, yang akan
  menghilangkan jaring pengaman kalau proxy Apps Script sedang down/timeout/kuota habis —
  perlu didiskusikan dan diputuskan terpisah, bukan sekadar tempelan kecil.
