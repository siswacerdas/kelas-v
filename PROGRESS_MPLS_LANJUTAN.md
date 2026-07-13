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
