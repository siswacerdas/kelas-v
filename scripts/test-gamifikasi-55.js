/**
 * Test pure-logic untuk ANTIREGRESI.md §55 (XP Pustaka Belajar masuk gamifikasi).
 * Fungsi yang diuji di sini SENGAJA disalin persis dari apps-script/Code.gs (bukan
 * di-require, karena Code.gs bukan modul Node — pola yang sama dipakai
 * scripts/test-gamifikasi-53.js). Kalau logikanya diubah di Code.gs, salinan di sini
 * WAJIB disinkronkan juga.
 *
 * Jalankan: node scripts/test-gamifikasi-55.js
 */

// ── Disalin dari Code.gs (hitungExpDenganBacaUlang_, dipakai bersama Materi/Modul/Pustaka) ──
const EXP_ULANG_ = 1;
function hitungExpDenganBacaUlang_(rows, namaKolomSlug, nama, expPenuh) {
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

// ── Konstanta EXP (Code.gs) ──────────────────────────────────────────────────────
const EXP_PER_MATERI_ = 10;
const EXP_PER_MODUL_ = 25;
const EXP_PER_PUSTAKA_ = 15;

// ── Harness minimal (sama seperti test-gamifikasi-53.js) ─────────────────────────
let lulus = 0, gagal = 0;
function assertSama(nama, aktual, harapan) {
  const a = JSON.stringify(aktual), h = JSON.stringify(harapan);
  if (a === h) { lulus++; console.log("✓ " + nama); }
  else { gagal++; console.log("✗ " + nama + "\n    harapan: " + h + "\n    aktual : " + a); }
}

console.log("=== EXP Pustaka Belajar (§55) — kunjungan pertama vs baca ulang ===");

assertSama(
  "1 file dibaca 1x -> EXP penuh (15), jumlahDistinct 1",
  hitungExpDenganBacaUlang_(
    [{ "Nama Siswa": "Siti", "Pustaka ID": "pb-1", "Timestamp": "2026-09-01" }],
    "Pustaka ID", "Siti", EXP_PER_PUSTAKA_
  ),
  { jumlahDistinct: 1, totalExp: 15, tanggalAktifList: ["2026-09-01"] }
);

assertSama(
  "1 file yang SAMA dibaca 3x -> kunjungan pertama 15, ke-2 & ke-3 cuma +1 tiap kali (bukan 45)",
  hitungExpDenganBacaUlang_(
    [
      { "Nama Siswa": "Siti", "Pustaka ID": "pb-1", "Timestamp": "2026-09-01" },
      { "Nama Siswa": "Siti", "Pustaka ID": "pb-1", "Timestamp": "2026-09-02" },
      { "Nama Siswa": "Siti", "Pustaka ID": "pb-1", "Timestamp": "2026-09-03" },
    ],
    "Pustaka ID", "Siti", EXP_PER_PUSTAKA_
  ),
  { jumlahDistinct: 1, totalExp: 15 + 1 + 1, tanggalAktifList: ["2026-09-01", "2026-09-02", "2026-09-03"] }
);

assertSama(
  "2 file BERBEDA masing-masing 1x -> tetap EXP penuh utk keduanya (2x15 = 30)",
  hitungExpDenganBacaUlang_(
    [
      { "Nama Siswa": "Siti", "Pustaka ID": "pb-1", "Timestamp": "2026-09-01" },
      { "Nama Siswa": "Siti", "Pustaka ID": "pb-2", "Timestamp": "2026-09-02" },
    ],
    "Pustaka ID", "Siti", EXP_PER_PUSTAKA_
  ).totalExp,
  30
);

assertSama(
  "siswa lain (Budi) TIDAK ikut terhitung di baris milik Siti",
  hitungExpDenganBacaUlang_(
    [
      { "Nama Siswa": "Siti", "Pustaka ID": "pb-1", "Timestamp": "2026-09-01" },
      { "Nama Siswa": "Budi", "Pustaka ID": "pb-1", "Timestamp": "2026-09-01" },
    ],
    "Pustaka ID", "Siti", EXP_PER_PUSTAKA_
  ).jumlahDistinct,
  1
);

console.log("\n=== Perbandingan besaran EXP: Materi < Pustaka Belajar < Modul (sesuai permintaan) ===");
assertSama("EXP_PER_MATERI_ < EXP_PER_PUSTAKA_", EXP_PER_MATERI_ < EXP_PER_PUSTAKA_, true);
assertSama("EXP_PER_PUSTAKA_ < EXP_PER_MODUL_", EXP_PER_PUSTAKA_ < EXP_PER_MODUL_, true);

console.log("\n=== Total EXP gabungan Materi + Modul + Pustaka Belajar (mensimulasikan exp di hitungDanSimpanGamifikasiSatuSiswa_) ===");
{
  const materiData = hitungExpDenganBacaUlang_(
    [{ "Nama Siswa": "Siti", "Materi Slug": "m1", "Timestamp": "2026-09-01" }],
    "Materi Slug", "Siti", EXP_PER_MATERI_
  );
  const modulData = hitungExpDenganBacaUlang_(
    [{ "Nama Siswa": "Siti", "Modul Slug": "md1", "Timestamp": "2026-09-01" }],
    "Modul Slug", "Siti", EXP_PER_MODUL_
  );
  const pustakaData = hitungExpDenganBacaUlang_(
    [{ "Nama Siswa": "Siti", "Pustaka ID": "pb-1", "Timestamp": "2026-09-01" }],
    "Pustaka ID", "Siti", EXP_PER_PUSTAKA_
  );
  assertSama(
    "1 materi + 1 modul + 1 pustaka dibaca -> total EXP 10+25+15 = 50",
    materiData.totalExp + modulData.totalExp + pustakaData.totalExp,
    50
  );
}

console.log("\n" + lulus + " lulus, " + gagal + " gagal");
process.exit(gagal > 0 ? 1 : 0);
