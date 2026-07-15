# Progress Kerja: Fitur Lanjutan MPLS + Data Kelas

> File ini melacak progress pengerjaan task besar (diminta 2026-07-13).
> Kalau percakapan terputus, baca file ini dulu untuk tahu sudah sampai mana.

## Daftar Permintaan (dari user)
1. [x] Dropdown nama guru pengamat dibatasi 2 pilihan: "Arif Azwar Anas", "Azizah Zahro Ibrahim"
2. [x] Rekap otomatis per 4 kategori + kesimpulan akhir kesiapan belajar, dengan skema
       aturan untuk berbagai skenario nilai, plus rekomendasi tindak lanjut guru & ortu
3. [x] Upload foto siswa dari kamera HP, auto-resize/kompres di sisi klien
4. [x] Menu/kontainer baru "Kelas" di beranda (khusus guru) → data siswa (nama lengkap,
       panggilan, tempat & tanggal lahir, foto) → teks disimpan ke sheet baru di
       spreadsheet MPLS, foto disimpan ke folder Google Drive yang sudah dishare
5. [x] Update CHANGELOG.md & ANTIREGRESI.md setiap ada perubahan
6. [x] Cetak/PDF hasil MPLS per siswa — A4 satu halaman, pakai logo sekolah,
       identitas + nilai + kesimpulan harus lengkap terbaca, tidak terpotong

**Status keseluruhan: SEMUA POIN SUDAH DIKERJAKAN (kode selesai).**
Yang tersisa hanyalah langkah **manual dari user**: paste ulang `Code.gs` ke
Apps Script Editor + deploy ulang ("New version"), lalu upload file-file baru/
berubah ke GitHub. Lihat pesan chat untuk daftar lengkap & instruksinya.

## Rencana File

| File | Status | Keterangan |
|---|---|---|
| `PROGRESS_MPLS_LANJUTAN.md` | ✅ dibuat | file ini |
| `pages/mpls/assets/mpls-data.js` | ✅ diubah | tambah `MPLS_GURU_LIST` |
| `pages/mpls/assets/mpls-scoring.js` | ✅ dibuat | engine skoring & kesimpulan otomatis |
| `pages/mpls/input.html` | ✅ diubah | guru jadi dropdown, load mpls-scoring.js |
| `pages/mpls/assets/app.js` | ✅ diubah | dropdown guru, bukan free text |
| `pages/mpls/rekap.html` | ✅ dibuat | daftar rekap semua siswa (guru only, Firebase-gated) |
| `pages/mpls/laporan.html` | ✅ dibuat | cetak/PDF A4 per siswa (guru only, Firebase-gated) |
| `pages/mpls/index.html` | ✅ diubah | aktifkan kartu "Rekap Hasil" |
| `pages/kelas/index.html` | ✅ dibuat | form + daftar data siswa, foto kamera (guru only) |
| `pages/kelas/assets/kelas.js` | ✅ dibuat | resize foto di klien, kirim ke Apps Script |
| `pages/kelas/assets/kelas.css` | ✅ dibuat | gaya halaman kelas |
| `index.html` (root) | ✅ diubah | kontainer baru "Kelas" khusus guru |
| `apps-script/Code.gs` | ✅ diubah | sheet baru "Data Siswa", simpan foto ke Drive, endpoint `all`/`siswa` |
| `apps-script/README.md` | ✅ diubah | instruksi deploy ulang + izin Drive |
| `assets/img/logo-sekolah.jpg` | ✅ ditambah | logo untuk laporan cetak |
| `CHANGELOG.md` | ✅ diubah | catat semua di atas |
| `ANTIREGRESI.md` | ✅ diubah | checklist uji baru |

## Keputusan Desain Penting (supaya konsisten kalau lanjut nanti)
- **Skala nilai** tetap 1-4 (BB/MB/BSH/BSB) sesuai `mpls-data.js`.
- **Ambang rata-rata kategori**: <1.75 BB · 1.75-2.49 MB · 2.5-3.24 BSH · ≥3.25 BSB.
- **Kesimpulan akhir** = rata-rata dari skor 4 kategori, dengan aturan tambahan:
  ada kategori BB → maksimal level keseluruhan "Perlu Pendampingan"/"Siap dgn Pendampingan".
- **Akses halaman baru** (`rekap.html`, `laporan.html`, `pages/kelas/`) memakai
  **Firebase Auth (role guru)**, BUKAN kode akses sederhana — karena Firebase sudah aktif
  situs-wide sekarang (beda dari `input.html` yang tetap pakai kode akses lama, tidak diubah,
  supaya tidak regresi ke fitur yang sudah jalan).
- **Keamanan folder Drive foto**: folder di-set "siapa saja yang punya link bisa mengedit"
  atas permintaan user sendiri — user sudah bilang ini akan diperketat di lain kesempatan,
  jadi TIDAK perlu ditambah pengaman ekstra sekarang.
- **PDF**: pakai `window.print()` + CSS `@page { size: A4 }`, bukan library seperti jsPDF,
  supaya hasil 1 halaman lebih presisi dan tidak butuh dependency tambahan.

## Cara Lanjut Kalau Terputus
Baca tabel status di atas → kerjakan baris yang belum ✅ → setelah semua ✅,
update CHANGELOG.md & ANTIREGRESI.md → kasih file-file final ke user beserta
instruksi upload ke GitHub + langkah re-deploy Apps Script.

---

## Ronde 2 (2026-07-14): Modul Kognitif + Laporan Cetak Dirombak

### Permintaan
1. [x] Nama Arif Azwar Anas selalu tertera sebagai "Guru Kelas" di laporan cetak
2. [x] Modul baru Asesmen Awal Kognitif (literasi + numerasi: tambah/kurang/kali/bagi),
       terpisah total dari MPLS non-kognitif, dengan struktur kategori→indikator yang sama
3. [x] Laporan cetak MPLS: ruang foto, tulisan diperbesar, blok tanda tangan
       (tempat+tanggal, ruang ttd 34pt, nama+gelar, NBM), tetap 1 halaman A4

### File baru
- `pages/mpls/assets/mpls-kognitif-data.js` — 5 kategori & indikator kognitif
- `pages/mpls/assets/mpls-scoring-kognitif.js` — engine skoring versi akademik
- `pages/mpls/input-kognitif.html` + `pages/mpls/assets/app-kognitif.js`
- `pages/mpls/rekap-kognitif.html`
- `pages/mpls/laporan-kognitif.html`

### File diubah
- `pages/mpls/assets/mpls-data.js` — tambah `MPLS_WALI_KELAS`, `MPLS_WALI_KELAS_TTD`,
  `MPLS_WALI_KELAS_NBM`, `MPLS_KOTA_TTD`
- `pages/mpls/laporan.html` — foto, font besar, blok tanda tangan, "Guru Kelas" tetap
- `pages/mpls/index.html` — kartu navigasi ke modul kognitif
- `pages/mpls/rekap.html` — tautan silang ke rekap kognitif
- `apps-script/Code.gs` — sheet "Data MPLS Kognitif" + endpoint terpisah
  (`namaKognitif`, `allKognitif`, `type:"mpls_kognitif"`) — endpoint lama TIDAK diubah perilakunya

### Validasi teknis yang sudah dilakukan
- Semua file JS baru lolos `node --check` (sintaks valid)
- Semua `<script>` di HTML baru seimbang buka/tutup
- `laporan.html` dan `laporan-kognitif.html` **diuji render sungguhan** pakai Playwright
  (bukan cuma estimasi): di-render dengan data mock (skenario lengkap, dengan & tanpa foto),
  di-print ke PDF A4, dicek jumlah halaman = 1 lewat `pypdf`. Kedua kasus PASS 1 halaman.
- Endpoint backend baru mengikuti pola yang sudah ada (branch by `type`/query param),
  endpoint & sheet lama tidak disentuh sama sekali — risiko regresi ke fitur lama minim.

### Keputusan desain
- Tanggal di blok tanda tangan **otomatis mengikuti tanggal cetak** (bukan tanggal tetap
  "18 Juli 2025" seperti contoh user — diasumsikan itu cuma contoh format, bukan tanggal
  yang harus di-hardcode selamanya). Kalau user maunya benar-benar tanggal tetap, tinggal
  ganti logika di bagian `.rep-signature` masing-masing file laporan.
- `laporan-kognitif.html` pakai grid 3 kolom (bukan 2 seperti non-kognitif) karena
  5 kategori vs 4, supaya tetap ringkas dan muat 1 halaman.

---

## Ronde 3 (2026-07-15): Modul Asesmen Menulis (Jurnal) + Perbaikan Besar Laporan Cetak

### Permintaan
1. [x] Modul baru: Asesmen Menulis (Jurnal Aktivitas) — rubrik ringkas (2 kategori,
       7 indikator), menilai kemampuan menulis terstruktur + kemandirian/regulasi diri,
       konteks aktivitas jalan sehat ke Taman Kukusan
2. [x] Perbaikan laporan cetak (berdasarkan review PDF yang diupload user):
       - Tombol toolbar ikut tercetak → diperbaiki (`!important` di `@media print`)
       - Foto siswa perlu dicek kesesuaian ukuran frame → `object-fit:cover` dikonfirmasi
         benar + ditambah fallback `onerror`
       - Jarak antar blok terlalu rapat → diperlonggar
       - Font blok tanda tangan terlalu besar → ternyata bug unit (pt vs px), diperbaiki
       - Semua perbaikan di atas diterapkan ke ketiga laporan (non-kognitif, kognitif, menulis)

### File baru
- `pages/mpls/assets/mpls-jurnal-data.js`, `mpls-scoring-jurnal.js`, `app-jurnal.js`
- `pages/mpls/input-jurnal.html`, `rekap-jurnal.html`, `laporan-jurnal.html`

### File diubah
- `pages/mpls/laporan.html`, `laporan-kognitif.html` — CSS toolbar/spasi/font diperbaiki,
  fallback foto ditambah
- `pages/mpls/index.html` — kartu navigasi ke modul jurnal
- `apps-script/Code.gs` — sheet "Data Jurnal Aktivitas" + endpoint terpisah
  (`namaJurnal`, `allJurnal`, `type:"jurnal"`) — endpoint lama TIDAK diubah perilakunya

### Validasi teknis
- Semua file JS baru lolos `node --check`; semua `<script>` di HTML seimbang
- Ketiga laporan (non-kognitif, kognitif, menulis) diuji ulang dengan Playwright SETELAH
  perbaikan: di-render dengan data mock, di-print ke PDF A4, dicek (a) jumlah halaman = 1,
  DAN (b) teks toolbar ("Kembali ke Rekap"/"Cetak / Simpan") TIDAK ADA di teks PDF hasil
  ekstraksi `pypdf` — bukti konkret bug toolbar benar-benar sudah teratasi, bukan asumsi.

### Insight penting: kenapa toolbar tetap tercetak walau sudah ada `display:none`
Skrip men-set `document.getElementById("toolbar").style.display = "flex"` (inline style)
untuk menampilkan toolbar di layar setelah data selesai dimuat. Inline style SELALU
menang atas selector CSS biasa apa pun spesifisitasnya — termasuk di dalam `@media print`.
Solusinya: tambahkan `!important` pada aturan print (`#toolbar { display: none !important; }`).
Ini pola yang perlu diingat kalau nanti menambah elemen lain yang di-toggle via inline style
tapi harus disembunyikan saat print.
