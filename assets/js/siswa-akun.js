/**
 * siswa-akun.js — Peta "Nama Lengkap" → email akun Firebase siswa.
 *
 * Dipakai HANYA oleh layar login (index.html), fungsi doLoginSiswa(), untuk
 * menerjemahkan nama yang dipilih siswa dari dropdown ("Pilih namamu") menjadi
 * email akun Firebase-nya, supaya siswa TETAP cukup pilih nama + ketik kode
 * (kolom "NISN", isinya sekarang dipakai LANGSUNG sebagai kata sandi Firebase
 * Auth, lihat catatan di doLoginSiswa()) — tanpa perlu tahu/ketik alamat email
 * sama sekali. Ini SENGAJA dipisah dari mpls-data.js (MPLS_STUDENTS) karena
 * email BUKAN bagian dari data MPLS, walau daftar namanya harus selalu identik
 * (lihat catatan "PENTING" di bawah).
 *
 * ⚠️ PENTING — SUMBER KEBENARAN NAMA: key di objek ini WAJIB sama PERSIS
 * (spasi, ejaan, kapitalisasi) dengan MPLS_STUDENTS di mpls-data.js DAN dengan
 * field `nama` di dokumen Firestore users/{uid} siswa terkait — karena field
 * itulah yang dipakai di SELURUH sistem (progres Materi/Modul, hasil Uji
 * Kemampuan, Papan Peringkat, rekap MPLS, dst.) untuk mencocokkan data milik
 * siswa yang sama. Kalau nama di sini beda walau cuma 1 spasi dari yang
 * dipakai tempat lain, progres siswa itu akan terlihat "kosong"/nyasar di
 * halaman lain walau sebenarnya sudah mengerjakan banyak hal.
 *
 * Sumber data: login_siswa.csv yang diserahkan Arif (Sept 2026), diproses
 * lewat script bantu (lihat scripts/README.md) yang MENCOCOKKAN setiap baris
 * ke MPLS_STUDENTS secara terprogram (bukan ditulis tangan) — supaya kalau ada
 * salah ketik di sumbernya, ketahuan otomatis alih-alih ikut ter-copy ke sini.
 * 4 nama dari CSV asli SEMPAT tidak cocok persis karena ada spasi nyasar di
 * tengah kata (kemungkinan artefak ekspor spreadsheet — cek ulang sumber
 * datanya kalau ini terjadi lagi ke siswa lain di masa depan):
 *   - "Nay la Latifa"                  → "Nayla Latifa"
 *   - "Re y nand Pratama"              → "Reynand Pratama"
 *   - "Shakila Q i y ana Shadi q ah"   → "Shakila Qiyana Shadiqah"
 *   - "Shanum Me y ra Rosadi"          → "Shanum Meyra Rosadi"
 * Keempatnya sudah dikoreksi ke ejaan MPLS_STUDENTS di bawah (dikonfirmasi
 * 1-per-1 by row order dengan kolom "No" di CSV, bukan tebakan).
 *
 * Kalau ada siswa baru pindahan di tengah tahun: tambahkan 1 baris di sini
 * DENGAN EJAAN NAMA YANG SAMA PERSIS dengan yang ditambahkan ke MPLS_STUDENTS,
 * lalu buat akunnya (lihat scripts/README.md — bisa 1 akun saja tanpa perlu
 * menjalankan ulang seluruh CSV).
 */
const SISWA_EMAIL_MAP = {
  "Abdurrahman Ar Ribery": "arman@siswacerdas.id",
  "Abyan Nandana Khalif": "abyan@siswacerdas.id",
  "Adskhan Ibran Elfatih": "ibran@siswacerdas.id",
  "Afiya Nur Ataya Sandi": "afiya@siswacerdas.id",
  "Aisyah Afqohunnisa": "aisyah@siswacerdas.id",
  "Akhdan Ziyad": "akhdan@siswacerdas.id",
  "Alam Rayyan Fiyanto": "alam@siswacerdas.id",
  "Arsyila Almahyira Azgefa": "cila@siswacerdas.id",
  "Athifa Nur Pelangi": "pelangi@siswacerdas.id",
  "Fairel Atharizz Calief": "fairel@siswacerdas.id",
  "Fatih Pratama Basuki": "fatih@siswacerdas.id",
  "Flora Baby Queen": "flora@siswacerdas.id",
  "Gilang Aditya Ramadhan": "gilang@siswacerdas.id",
  "Ilham Ibrahim": "ilham@siswacerdas.id",
  "Inara Huwaida Ardhani": "inara@siswacerdas.id",
  "Kinara Adisti Salsabila": "kinara@siswacerdas.id",
  "Kirana Hafizah Iqra Nasution": "kirana@siswacerdas.id",
  "Latifa Rafanda": "latifa@siswacerdas.id",
  "Meshya Belliza Utama": "meshya@siswacerdas.id",
  "Muhammad Ali Alfarizi": "ali@siswacerdas.id",
  "Nayla Latifa": "nayla@siswacerdas.id",
  "Quenzino Satria Hadika": "qenzi@siswacerdas.id",
  "Reynand Pratama": "reynand@siswacerdas.id",
  "Shakila Qiyana Shadiqah": "shakila@siswacerdas.id",
  "Shanum Meyra Rosadi": "shanum@siswacerdas.id",
};
