// Simulasi murni logika ambilKandidat() — localStorage & MODUL_INDEX di-mock.
/**
 * Test pure-logic untuk ANTIREGRESI.md §58 — logika `ambilKandidat()` di
 * pages/modul/assets/cek-progres-tersimpan.js (fitur "🔍 Cek Modul yang Mungkin Belum
 * Tercatat"). Fungsi disalin persis dari file aslinya (di sini menerima MODUL_INDEX &
 * localStorage sebagai parameter/mock, bukan `window`, supaya bisa diuji tanpa DOM/browser).
 *
 * Jalankan: node scripts/test-cek-progres-tersimpan-58.js
 */
function ambilKandidat(modulIndex, localStorageMock) {
  var hasil = [];
  modulIndex.forEach(function (m) {
    if (typeof m.totalPages !== "number" || !m.slug) return;
    var key = "modulProgress:" + m.slug;
    var raw = localStorageMock[key];
    if (!raw) return;
    var state;
    try { state = JSON.parse(raw); } catch (e) { return; }
    if (typeof state.page === "number" && state.page === m.totalPages - 1) {
      hasil.push(m);
    }
  });
  return hasil;
}

const modulIndex = [
  { slug: "bi-menyimak-tp1", judul: "Menangkap Info Penting", mapel: "Bahasa Indonesia", totalPages: 7, file: "a.html" },
  { slug: "bi-berbicara-tp1", judul: "Presentasi Gagasan", mapel: "Bahasa Indonesia", totalPages: 7, file: "b.html" },
  { slug: "mtk-pecahan-tp6", judul: "Pecahan", mapel: "Matematika", totalPages: 5, file: "c.html" },
  { slug: "tanpa-totalpages", judul: "Entri lama", mapel: "IPAS" }, // sengaja tanpa totalPages
];

let pass = 0, total = 0;
function assertEqual(nama, actual, expected) {
  total++;
  const ok = JSON.stringify(actual) === JSON.stringify(expected);
  if (!ok) console.log("  actual:", JSON.stringify(actual), "expected:", JSON.stringify(expected));
  console.log((ok ? "PASS" : "FAIL") + " - " + nama);
  if (ok) pass++;
}

// Kasus 1: 1 modul sudah di halaman terakhir (page 6 dari 7, index 0-based), 1 belum
let ls = {
  "modulProgress:bi-menyimak-tp1": JSON.stringify({ page: 6 }),   // halaman terakhir (totalPages 7 -> index 6)
  "modulProgress:bi-berbicara-tp1": JSON.stringify({ page: 3 }),  // baru separuh
};
assertEqual("Hanya modul yang BENAR-BENAR di halaman terakhir masuk daftar",
  ambilKandidat(modulIndex, ls).map(m => m.slug), ["bi-menyimak-tp1"]);

// Kasus 2: tidak ada localStorage sama sekali -> kosong
assertEqual("localStorage kosong -> tidak ada kandidat", ambilKandidat(modulIndex, {}).map(m => m.slug), []);

// Kasus 3: localStorage rusak (bukan JSON) -> diabaikan, tidak boleh crash
ls = { "modulProgress:bi-menyimak-tp1": "{bukan json" };
assertEqual("localStorage corrupt -> diabaikan (tidak crash)", ambilKandidat(modulIndex, ls).map(m => m.slug), []);

// Kasus 4: entri tanpa totalPages (data lama) tidak boleh ikut diproses walau ada localStorage
ls = { "modulProgress:tanpa-totalpages": JSON.stringify({ page: 0 }) };
assertEqual("Entri tanpa totalPages dilewati (tidak error)", ambilKandidat(modulIndex, ls).map(m => m.slug), []);

// Kasus 5: beberapa modul sekaligus di halaman terakhir
ls = {
  "modulProgress:bi-menyimak-tp1": JSON.stringify({ page: 6 }),
  "modulProgress:mtk-pecahan-tp6": JSON.stringify({ page: 4 }), // totalPages 5 -> index 4 = terakhir
};
assertEqual("Multi modul terdeteksi sekaligus",
  ambilKandidat(modulIndex, ls).map(m => m.slug).sort(), ["bi-menyimak-tp1", "mtk-pecahan-tp6"].sort());

console.log(pass + "/" + total + " lulus");
process.exit(pass === total ? 0 : 1);
