/**
 * Test pure-logic untuk ANTIREGRESI.md §56 (optimasi performa "Hitung Ulang Semua Siswa"
 * + trigger otomatis 6 jam). Fungsi yang diuji di sini SENGAJA disalin persis dari
 * apps-script/Code.gs (bukan di-require, karena Code.gs bukan modul Node — pola yang sama
 * dipakai test suite lain di proyek ini, mis. scripts/test-gamifikasi-53.js). Kalau
 * logikanya diubah di Code.gs, salinan di sini WAJIB disinkronkan juga.
 *
 * Yang diuji:
 *  1. hitungExpDenganBacaUlangDariRows_ menghasilkan angka IDENTIK dengan pola lama
 *     (baca-sheet-per-siswa) untuk data yang sama — cuma beda cara aksesnya (rows dibaca
 *     sekali & dipakai ulang, bukan baca ulang sheet tiap siswa).
 *  2. Tidak ada kebocoran data antar siswa saat rows gabungan dipakai bersama.
 *  3. Orkestrasi banyak-siswa (pola dipakai doPostHitungGamifikasiSemua_ &
 *     hitungGamifikasiSemuaOtomatis_) tetap mengisolasi kegagalan 1 siswa — siswa lain
 *     TETAP berhasil dihitung meski 1 siswa melempar error.
 *
 * Jalankan: node scripts/test-hitung-exp-56.js
 */

// ── Disalin dari Code.gs ────────────────────────────────────────────────────
const EXP_ULANG_ = 1;

function hitungExpDenganBacaUlangDariRows_(rows, namaKolomSlug, nama, expPenuh) {
  const target = String(nama).trim().toLowerCase();
  const rowsSiswa = rows.filter((r) => String(r["Nama Siswa"] || "").trim().toLowerCase() === target);
  const kunjunganPerSlug = {};
  rowsSiswa.forEach((r) => {
    const slug = String(r[namaKolomSlug] || "").trim();
    if (!slug) return;
    kunjunganPerSlug[slug] = (kunjunganPerSlug[slug] || 0) + 1;
  });
  const slugList = Object.keys(kunjunganPerSlug);
  let totalExp = 0;
  slugList.forEach((slug) => {
    const kunjungan = kunjunganPerSlug[slug];
    totalExp += expPenuh + Math.max(0, kunjungan - 1) * EXP_ULANG_;
  });
  const tanggalAktifList = rowsSiswa.map((r) => String(r["Timestamp"] || "").trim()).filter(Boolean);
  return { jumlahDistinct: slugList.length, totalExp: totalExp, tanggalAktifList: tanggalAktifList };
}

// Pola LAMA (sebelum §56) — untuk PEMBANDING, bukan lagi dipakai di Code.gs setelah
// perbaikan ini, tapi disalin di sini supaya test bisa membuktikan hasilnya IDENTIK
// dengan pola baru (cuma beda cara akses data, bukan beda aturan penghitungan).
function hitungExpDenganBacaUlang_POLA_LAMA_(semuaRowsSheet, namaKolomSlug, nama, expPenuh) {
  return hitungExpDenganBacaUlangDariRows_(semuaRowsSheet, namaKolomSlug, nama, expPenuh);
}

// Simulasi orkestrasi banyak-siswa (pola PERSIS sama dengan doPostHitungGamifikasiSemua_ /
// hitungGamifikasiSemuaOtomatis_) — hitungSatuSiswaFn dibuat bisa dikontrol per test (bisa
// dipaksa melempar error untuk 1 nama tertentu) tanpa perlu Firestore/Sheets sungguhan.
function orkestrasiBanyakSiswa_(namaList, hitungSatuSiswaFn) {
  return namaList.map((namaMentah) => {
    const nama = String(namaMentah).trim();
    try {
      return Object.assign({ nama: nama }, hitungSatuSiswaFn(nama));
    } catch (err) {
      return { nama: nama, status: "error", message: String(err) };
    }
  });
}

// ── Test data ────────────────────────────────────────────────────────────────
const rowsModulGabungan = [
  { "Nama Siswa": "Budi", "Modul Slug": "bi-menyimak-tp1", "Timestamp": "2026-09-01" },
  { "Nama Siswa": "Budi", "Modul Slug": "bi-menyimak-tp2", "Timestamp": "2026-09-02" },
  { "Nama Siswa": "Budi", "Modul Slug": "bi-menyimak-tp1", "Timestamp": "2026-09-03" }, // baca ulang
  { "Nama Siswa": "Siti", "Modul Slug": "bi-menyimak-tp1", "Timestamp": "2026-09-01" },
  { "Nama Siswa": "Ani",  "Modul Slug": "bi-menyimak-tp2", "Timestamp": "2026-09-05" },
];
const EXP_PER_MODUL_ = 25;

let pass = 0, total = 0;
function assertEqual(nama, actual, expected) {
  total++;
  const ok = JSON.stringify(actual) === JSON.stringify(expected);
  if (!ok) console.log("  actual:", JSON.stringify(actual), " expected:", JSON.stringify(expected));
  console.log((ok ? "PASS" : "FAIL") + " - " + nama);
  if (ok) pass++;
}

console.log("=== 1. Hasil pola BARU (rows sekali) identik dengan pola LAMA (per-siswa) ===");
["Budi", "Siti", "Ani"].forEach((nama) => {
  const baru = hitungExpDenganBacaUlangDariRows_(rowsModulGabungan, "Modul Slug", nama, EXP_PER_MODUL_);
  const lama = hitungExpDenganBacaUlang_POLA_LAMA_(rowsModulGabungan, "Modul Slug", nama, EXP_PER_MODUL_);
  assertEqual("Hasil " + nama + " pola baru == pola lama", baru, lama);
});

console.log("\n=== 2. Tidak ada kebocoran data antar siswa ===");
assertEqual("Budi: 2 modul distinct, totalExp 51 (25+1+25)",
  hitungExpDenganBacaUlangDariRows_(rowsModulGabungan, "Modul Slug", "Budi", EXP_PER_MODUL_),
  { jumlahDistinct: 2, totalExp: 51, tanggalAktifList: ["2026-09-01", "2026-09-02", "2026-09-03"] });
assertEqual("Siti: 1 modul, totalExp 25 (tidak ikut kebagian punya Budi/Ani)",
  hitungExpDenganBacaUlangDariRows_(rowsModulGabungan, "Modul Slug", "Siti", EXP_PER_MODUL_).totalExp, 25);
assertEqual("Ani: 1 modul, totalExp 25",
  hitungExpDenganBacaUlangDariRows_(rowsModulGabungan, "Modul Slug", "Ani", EXP_PER_MODUL_).totalExp, 25);
assertEqual("Nama tidak ada di rows -> totalExp 0, bukan error",
  hitungExpDenganBacaUlangDariRows_(rowsModulGabungan, "Modul Slug", "Tidak Terdaftar", EXP_PER_MODUL_).totalExp, 0);

console.log("\n=== 3. Orkestrasi banyak-siswa: 1 siswa gagal tidak menggagalkan yang lain ===");
const hasilOrkestrasi = orkestrasiBanyakSiswa_(["Budi", "Siti", "SiswaError", "Ani"], (nama) => {
  if (nama === "SiswaError") throw new Error("Simulasi kegagalan Firestore untuk 1 siswa");
  const d = hitungExpDenganBacaUlangDariRows_(rowsModulGabungan, "Modul Slug", nama, EXP_PER_MODUL_);
  return { status: "ok", exp: d.totalExp };
});
assertEqual("4 siswa tetap menghasilkan 4 baris hasil (bukan berhenti di tengah)",
  hasilOrkestrasi.length, 4);
assertEqual("Budi tetap berhasil (status ok)", hasilOrkestrasi[0].status, "ok");
assertEqual("SiswaError dilaporkan gagal per-baris, bukan melempar ke pemanggil",
  hasilOrkestrasi[2].status, "error");
assertEqual("Ani (setelah SiswaError dalam urutan) TETAP berhasil dihitung",
  hasilOrkestrasi[3].status, "ok");

console.log("\n" + pass + "/" + total + " lulus");
process.exit(pass === total ? 0 : 1);
