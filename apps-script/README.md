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

- **Satu baris per siswa.** Mengisi ulang siswa yang sama akan meng-update
  baris yang sudah ada (dicocokkan lewat kolom "Nama Siswa"), bukan menambah
  baris baru — supaya bisa diisi bertahap selama minggu MPLS.
- **GET** `?nama=Nama%20Siswa` → mengembalikan data MPLS siswa itu bila sudah ada
  (dipakai `input.html` untuk memuat isian sebelumnya).
- **GET** `?all=1` → mengembalikan SEMUA baris data MPLS (dipakai `rekap.html`
  dan `laporan.html` untuk menghitung kesimpulan otomatis semua siswa).
- **GET** `?siswa=1` → mengembalikan SEMUA baris profil siswa dari sheet
  "Data Siswa" (dipakai `pages/kelas/index.html` dan `laporan.html`).
- **POST** tanpa `type` (body JSON, key = nama kolom persis seperti di
  `HEADERS`) → simpan/update baris nilai MPLS (perilaku lama, tidak berubah).
- **POST** dengan `type: "siswa"` → simpan/update profil siswa (dicocokkan
  lewat "Nama Lengkap"). Kalau body menyertakan `fotoBase64` + `fotoMime`,
  foto akan disimpan sebagai file baru ke folder Google Drive dengan ID
  di konstanta `FOTO_FOLDER_ID`, lalu URL-nya disimpan ke kolom "URL Foto".
- Header kolom didefinisikan satu tempat di `HEADERS` / `SISWA_HEADERS` (atas
  file `Code.gs`) — kalau menambah/mengubah indikator di
  `pages/mpls/assets/mpls-data.js`, pastikan nama field-nya sama persis.

## Folder Drive untuk foto siswa

Foto disimpan ke folder yang linknya sudah dishare "siapa saja yang punya
link bisa mengedit" (ID folder ada di konstanta `FOTO_FOLDER_ID` pada
`Code.gs`). Ini pengaturan sementara sesuai permintaan pemilik proyek —
bila ingin diperketat nanti, folder bisa diubah ke akses lebih terbatas
(mis. hanya akun tertentu), tanpa perlu mengubah kode `Code.gs`.

## Keamanan

- Web App di-deploy dengan akses **Anyone**, artinya siapa pun yang tahu URL-nya
  bisa mengirim data. Ini standar untuk pola "situs statis + Apps Script"
  tanpa server sendiri.
- Mitigasi saat ini: kode akses sederhana di halaman input (`config.js` →
  `ACCESS_CODE`) — cukup untuk mencegah orang random, **bukan** keamanan
  sesungguhnya (kode terlihat di source file).
- Kalau butuh keamanan lebih serius, opsi ke depan: pindahkan gerbang akses
  ke Firebase Authentication yang sudah dipakai halaman utama (`index.html`
  root repo), lalu kirim token login itu ke Apps Script untuk diverifikasi.
