/**
 * config.js — Konfigurasi modul MPLS
 *
 * 1. APPS_SCRIPT_URL
 *    Ganti dengan URL Web App setelah deploy Apps Script.
 *    Cara deploy: lihat apps-script/README.md di root repo ini.
 *
 * 2. ACCESS_CODE
 *    Kode akses SEDERHANA (bukan keamanan sesungguhnya — kode ini terlihat
 *    di source file, siapa pun yang tahu bisa membacanya). Fungsinya cuma
 *    mencegah orang random yang tidak sengaja membuka link ikut mengisi.
 *    Ganti sesuka Anda, atau set ke "" (string kosong) untuk menonaktifkan
 *    gerbang kode akses sepenuhnya.
 *    Untuk keamanan sesungguhnya, integrasikan ke Firebase Auth yang
 *    sudah dipakai di halaman utama begitu sudah aktif.
 */
const MPLS_CONFIG = {
  APPS_SCRIPT_URL: "https://script.google.com/macros/s/AKfycbzvKHgy0FMLafxhCGnT9xXLuHTVskgFXQ5jDc_Q4jHZB2czaF4uGpIivjv946agqVVCcQ/exec",
  ACCESS_CODE: "mpls2026",
};
