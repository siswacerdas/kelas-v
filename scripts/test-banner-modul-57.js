// Simulasi murni logika banner (tanpa DOM sungguhan) — fokus pada format waktu & alur status
/**
 * Test pure-logic untuk ANTIREGRESI.md §57 — format hitung mundur banner "Halaman
 * terakhir! Tetap di sini X:XX lagi..." di modul-progress-tracker.js. Fungsi disalin
 * persis dari Code.gs/modul-progress-tracker.js (bukan di-require, file itu bukan modul
 * Node) — kalau logikanya diubah di sana, salinan di sini wajib disinkronkan juga.
 *
 * Jalankan: node scripts/test-banner-modul-57.js
 */
function formatSisaWaktu_(ms) {
  var detik = Math.max(0, Math.ceil(ms / 1000));
  var menit = Math.floor(detik / 60);
  var sisaDetik = detik % 60;
  return menit + ":" + (sisaDetik < 10 ? "0" : "") + sisaDetik;
}

let pass = 0, total = 0;
function assertEqual(nama, actual, expected) {
  total++;
  const ok = actual === expected;
  if (!ok) console.log("  actual:", actual, "expected:", expected);
  console.log((ok ? "PASS" : "FAIL") + " - " + nama);
  if (ok) pass++;
}

assertEqual("3 menit penuh (180000ms) -> 3:00", formatSisaWaktu_(180000), "3:00");
assertEqual("2 menit 5 detik -> 2:05 (padding nol)", formatSisaWaktu_(125000), "2:05");
assertEqual("59 detik -> 0:59", formatSisaWaktu_(59000), "0:59");
assertEqual("0 ms -> 0:00", formatSisaWaktu_(0), "0:00");
assertEqual("Negatif (sudah lewat ambang) -> tidak boleh minus, 0:00", formatSisaWaktu_(-5000), "0:00");
assertEqual("1500ms (pembulatan ke atas) -> 0:02", formatSisaWaktu_(1500), "0:02");

console.log(pass + "/" + total + " lulus");
process.exit(pass === total ? 0 : 1);
