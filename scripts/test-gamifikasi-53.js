/**
 * Test pure-logic untuk ANTIREGRESI.md §53 (Streak Harian + perbaikan dedup EXP kuis).
 * Fungsi-fungsi yang diuji di sini SENGAJA disalin persis dari apps-script/Code.gs
 * (bukan di-require, karena Code.gs bukan modul Node — pola yang sama dipakai test
 * suite lain di proyek ini). Kalau logikanya diubah di Code.gs, salinan di sini WAJIB
 * disinkronkan juga.
 *
 * Jalankan: node scripts/test-gamifikasi-53.js
 */

// ── Disalin dari Code.gs (blok STREAK HARIAN) ──────────────────────────────
function formatTanggalUtc_(d) {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return y + "-" + m + "-" + day;
}
function tanggalWib_(nilaiTanggal) {
  if (!nilaiTanggal) return "";
  const s = String(nilaiTanggal);
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  const d = new Date(s);
  if (isNaN(d.getTime())) return "";
  const wib = new Date(d.getTime() + 7 * 60 * 60 * 1000);
  return formatTanggalUtc_(wib);
}
function geserTanggal_(yyyyMmDd, offsetHari) {
  const p = yyyyMmDd.split("-").map(Number);
  const d = new Date(Date.UTC(p[0], p[1] - 1, p[2]));
  d.setUTCDate(d.getUTCDate() + offsetHari);
  return formatTanggalUtc_(d);
}
function selisihHariKalender_(tglAwal, tglAkhir) {
  const p = (s) => s.split("-").map(Number);
  const a = p(tglAwal), b = p(tglAkhir);
  const ua = Date.UTC(a[0], a[1] - 1, a[2]);
  const ub = Date.UTC(b[0], b[1] - 1, b[2]);
  return Math.round((ub - ua) / 86400000);
}
function hitungStreakDariTanggal_(daftarTanggalWib, hariIniWib) {
  const unik = Array.from(new Set((daftarTanggalWib || []).filter(Boolean))).sort();
  if (unik.length === 0) {
    return { streakSaatIni: 0, streakTerpanjang: 0, hariAktifTerakhir: null, jumlahHariAktifUnik: 0 };
  }
  let streakTerpanjang = 1;
  let streakBerjalan = 1;
  for (let i = 1; i < unik.length; i++) {
    streakBerjalan = selisihHariKalender_(unik[i - 1], unik[i]) === 1 ? streakBerjalan + 1 : 1;
    if (streakBerjalan > streakTerpanjang) streakTerpanjang = streakBerjalan;
  }
  const hariAktifTerakhir = unik[unik.length - 1];
  const kemarinWib = geserTanggal_(hariIniWib, -1);
  let streakSaatIni = 0;
  if (hariAktifTerakhir === hariIniWib || hariAktifTerakhir === kemarinWib) {
    streakSaatIni = 1;
    for (let i = unik.length - 1; i > 0; i--) {
      if (selisihHariKalender_(unik[i - 1], unik[i]) === 1) streakSaatIni++;
      else break;
    }
  }
  return { streakSaatIni: streakSaatIni, streakTerpanjang: streakTerpanjang, hariAktifTerakhir: hariAktifTerakhir, jumlahHariAktifUnik: unik.length };
}
const MILESTONE_STREAK_ = [
  { hari: 3, bonus: 10 }, { hari: 7, bonus: 25 }, { hari: 14, bonus: 50 }, { hari: 30, bonus: 100 },
];
const EXP_PER_HARI_AKTIF_ = 2;
function hitungBonusExpStreak_(streakTerpanjang, jumlahHariAktifUnik) {
  let bonusMilestone = 0;
  MILESTONE_STREAK_.forEach((m) => { if (streakTerpanjang >= m.hari) bonusMilestone += m.bonus; });
  return bonusMilestone + jumlahHariAktifUnik * EXP_PER_HARI_AKTIF_;
}

// ── Disalin dari Code.gs (perbaikan dedup EXP kuis di hitungLevelDariRiwayat_) ─────
const EXP_PER_KUIS_DIKERJAKAN_ = 5;
const EXP_BONUS_KUIS_LULUS_ = 10;
const EXP_ULANG_ = 1;
const LEVEL_AMBANG_LULUS_UMUM_ = 70;
function hitungExpDariKuis_(riwayat) {
  let expDariKuis = 0;
  const tpSudahDikerjakan_ = {};
  const tpSudahLulus_ = {};
  riwayat.forEach((r) => {
    const lulus = r.skor >= LEVEL_AMBANG_LULUS_UMUM_;
    const tp = r.tp;
    const sudahDikerjakanSebelumnya = tp && tpSudahDikerjakan_[tp];
    const sudahLulusSebelumnya = tp && tpSudahLulus_[tp];
    const expDikerjakan = (tp && sudahDikerjakanSebelumnya) ? EXP_ULANG_ : EXP_PER_KUIS_DIKERJAKAN_;
    const expBonusLulus = lulus && !(tp && sudahLulusSebelumnya) ? EXP_BONUS_KUIS_LULUS_ : 0;
    expDariKuis += expDikerjakan + expBonusLulus;
    if (tp) {
      tpSudahDikerjakan_[tp] = true;
      if (lulus) tpSudahLulus_[tp] = true;
    }
  });
  return expDariKuis;
}

// ── Harness minimal ─────────────────────────────────────────────────────
let lulus = 0, gagal = 0;
function assertSama(nama, aktual, harapan) {
  const a = JSON.stringify(aktual), h = JSON.stringify(harapan);
  if (a === h) { lulus++; console.log("✓ " + nama); }
  else { gagal++; console.log("✗ " + nama + "\n    harapan: " + h + "\n    aktual : " + a); }
}

console.log("=== Dedup EXP kuis per-TP (menutup celah retake tak terbatas) ===");

// Kasus 1: retake TP yang SAMA 5x berturut-turut, semua lulus — TIDAK BOLEH lagi
// memberi 15 EXP x 5 (75 EXP). Harusnya: percobaan 1 = 15 (5+10), percobaan 2-5 = 1 tiap kali.
assertSama(
  "retake 1 TP sama 5x semua lulus -> bukan lagi 75 EXP",
  hitungExpDariKuis_([
    { skor: 90, tp: "tp-a" }, { skor: 90, tp: "tp-a" }, { skor: 90, tp: "tp-a" },
    { skor: 90, tp: "tp-a" }, { skor: 90, tp: "tp-a" },
  ]),
  15 + 1 + 1 + 1 + 1 // = 19, BUKAN 75 seperti perilaku lama
);

// Kasus 2: 5 TP BERBEDA, masing-masing 1x lulus — TETAP dapat EXP penuh tiap TP
// (memastikan perbaikan ini TIDAK menghukum siswa yang genuinely mengerjakan TP berbeda-beda).
assertSama(
  "5 TP berbeda, masing-masing 1x lulus -> tetap 75 EXP penuh",
  hitungExpDariKuis_([
    { skor: 90, tp: "tp-a" }, { skor: 90, tp: "tp-b" }, { skor: 90, tp: "tp-c" },
    { skor: 90, tp: "tp-d" }, { skor: 90, tp: "tp-e" },
  ]),
  15 * 5 // = 75
);

// Kasus 3: gagal dulu di TP itu, baru lulus di percobaan ke-2 -> bonus lulus tetap penuh
// SEKALI di percobaan sukses pertama (tidak dihukum karena belum lulus di percobaan 1).
assertSama(
  "gagal lalu lulus di TP sama -> bonus lulus tetap penuh 1x",
  hitungExpDariKuis_([
    { skor: 40, tp: "tp-a" }, // dikerjakan (5), belum lulus (0 bonus)
    { skor: 90, tp: "tp-a" }, // dikerjakan ulang (1, bukan 5 lagi), lulus PERTAMA (10 bonus penuh)
  ]),
  5 + (1 + 10) // = 16
);

// Kasus 4: lulus, lalu retake TP sama dan lulus LAGI -> bonus lulus TIDAK diulang lagi.
assertSama(
  "lulus lalu retake+lulus lagi di TP sama -> bonus lulus tidak dobel",
  hitungExpDariKuis_([
    { skor: 90, tp: "tp-a" }, // 5 + 10 = 15
    { skor: 95, tp: "tp-a" }, // cuma 1 (EXP_ULANG_), TANPA bonus lulus lagi
  ]),
  15 + 1 // = 16, BUKAN 15 + 15 = 30
);

// Kasus 5: dokumen LAMA tanpa field tp (tp === "") -> fallback ke perilaku lama (EXP penuh
// tiap kali), supaya EXP historis yang sudah pernah dihitung tidak berubah akibat migrasi ini.
assertSama(
  "dokumen lama tanpa tp -> fallback tanpa dedup (EXP penuh tiap kali)",
  hitungExpDariKuis_([
    { skor: 90, tp: "" }, { skor: 90, tp: "" }, { skor: 90, tp: "" },
  ]),
  15 * 3 // = 45, perilaku lama dipertahankan untuk data lama
);

console.log("\n=== Streak Harian ===");

assertSama(
  "belum pernah aktif sama sekali -> semua 0",
  hitungStreakDariTanggal_([], "2026-09-13"),
  { streakSaatIni: 0, streakTerpanjang: 0, hariAktifTerakhir: null, jumlahHariAktifUnik: 0 }
);

assertSama(
  "3 hari berturut-turut, aktif lagi hari ini -> streak saat ini = 3",
  hitungStreakDariTanggal_(["2026-09-11", "2026-09-12", "2026-09-13"], "2026-09-13"),
  { streakSaatIni: 3, streakTerpanjang: 3, hariAktifTerakhir: "2026-09-13", jumlahHariAktifUnik: 3 }
);

assertSama(
  "aktif terakhir KEMARIN (belum buka hari ini) -> streak tetap 'hidup'",
  hitungStreakDariTanggal_(["2026-09-11", "2026-09-12"], "2026-09-13"),
  { streakSaatIni: 2, streakTerpanjang: 2, hariAktifTerakhir: "2026-09-12", jumlahHariAktifUnik: 2 }
);

assertSama(
  "bolong 1 hari sekolah (BUKAN weekend) -> streak putus jadi 0, rekor lama tetap tercatat",
  hitungStreakDariTanggal_(["2026-09-08", "2026-09-09", "2026-09-11"], "2026-09-13"), // 8,9 aktif, 10 bolong, 11 aktif, lalu 12-13 absen
  { streakSaatIni: 0, streakTerpanjang: 2, hariAktifTerakhir: "2026-09-11", jumlahHariAktifUnik: 3 }
);

assertSama(
  "weekend TANPA aktivitas MEMUTUS streak (keputusan sadar Arif, ketat)",
  // Jumat 2026-09-11 aktif, Sabtu 12 & Minggu 13 TIDAK aktif, Senin 14 aktif lagi
  hitungStreakDariTanggal_(["2026-09-11", "2026-09-14"], "2026-09-14"),
  { streakSaatIni: 1, streakTerpanjang: 1, hariAktifTerakhir: "2026-09-14", jumlahHariAktifUnik: 2 }
);

assertSama(
  "duplikat tanggal (retake materi/kuis di hari sama) -> tidak dihitung 2x sbg hari aktif",
  hitungStreakDariTanggal_(["2026-09-13", "2026-09-13", "2026-09-13"], "2026-09-13"),
  { streakSaatIni: 1, streakTerpanjang: 1, hariAktifTerakhir: "2026-09-13", jumlahHariAktifUnik: 1 }
);

assertSama(
  "sudah 2+ hari absen -> streak saat ini 0, TAPI streakTerpanjang (rekor) tidak hilang",
  hitungStreakDariTanggal_(["2026-09-01", "2026-09-02", "2026-09-03", "2026-09-04", "2026-09-05"], "2026-09-13"),
  { streakSaatIni: 0, streakTerpanjang: 5, hariAktifTerakhir: "2026-09-05", jumlahHariAktifUnik: 5 }
);

console.log("\n=== Konversi tanggal WIB (Firestore ISO UTC -> tanggal kalender WIB) ===");

assertSama(
  "23:30 UTC (jam 06:30 WIB HARI BERIKUTNYA) -> tanggal WIB harus maju 1 hari",
  tanggalWib_("2026-09-12T23:30:00.000Z"),
  "2026-09-13"
);

assertSama(
  "10:00 UTC (17:00 WIB, hari yang sama) -> tanggal WIB tidak berubah",
  tanggalWib_("2026-09-13T10:00:00.000Z"),
  "2026-09-13"
);

assertSama(
  "sudah berformat yyyy-MM-dd (dari sheet Progres Materi/Modul) -> dipakai apa adanya",
  tanggalWib_("2026-09-13"),
  "2026-09-13"
);

console.log("\n=== Bonus EXP streak (milestone + harian, deterministik/idempoten) ===");

assertSama("streak 2 hari, belum sentuh milestone apa pun", hitungBonusExpStreak_(2, 2), 0 + 2 * 2);
assertSama("streak tepat 3 hari -> dapat milestone 3-hari (+10)", hitungBonusExpStreak_(3, 3), 10 + 3 * 2);
assertSama("streak 10 hari -> dapat milestone 3 DAN 7 (+10+25)", hitungBonusExpStreak_(10, 10), 35 + 10 * 2);
assertSama("streak 30 hari -> dapat SEMUA milestone (+10+25+50+100)", hitungBonusExpStreak_(30, 25), 185 + 25 * 2);
assertSama(
  "dihitung ulang 2x dengan input SAMA -> hasil SAMA (idempoten, tidak dobel)",
  hitungBonusExpStreak_(7, 7),
  hitungBonusExpStreak_(7, 7)
);

console.log("\n" + lulus + " lulus, " + gagal + " gagal");
process.exit(gagal > 0 ? 1 : 0);
