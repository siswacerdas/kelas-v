/**
 * mpls-scoring-jurnal.js
 * Engine skoring & kesimpulan otomatis untuk hasil Asesmen Menulis (Jurnal Aktivitas).
 * Struktur & ambang skor SAMA PERSIS dengan mpls-scoring.js / mpls-scoring-kognitif.js —
 * cuma teks & kategori yang berbeda (menulis, bukan sosial-emosional/akademik).
 *
 * Bergantung pada MPLS_JURNAL_CATEGORIES (mpls-jurnal-data.js), dimuat sebelum file ini.
 *
 * API: MplsScoringJurnal.computeStudentResult(dataRow) -> { categories, overall }
 *
 * Catatan desain (2026-07-17): computeCategory() di sini SENGAJA menyerap 2 hal yang
 * di modul non-kognitif/kognitif masih hilang — supaya kesimpulan tercetak benar-benar
 * mencerminkan anak yang diamati, bukan cuma template kategori-level:
 *   1. Catatan anekdot guru (field noteField) — dilampirkan ringkas ke simpulan.
 *   2. Kelengkapan data — kalau kategori belum terisi penuh, simpulan diberi keterangan
 *      "masih sementara" supaya tidak dibaca seolah-olah sudah pasti.
 */
(function (global) {

  const LEVEL_SCORE = { BB: 1, MB: 2, BSH: 3, BSB: 4 };
  const LEVEL_LABEL = {
    BB: "Belum Berkembang",
    MB: "Mulai Berkembang",
    BSH: "Berkembang Sesuai Harapan",
    BSB: "Berkembang Sangat Baik",
  };

  function levelFromAvg(avg) {
    if (avg < 1.75) return "BB";
    if (avg < 2.5) return "MB";
    if (avg < 3.25) return "BSH";
    return "BSB";
  }

  const CATEGORY_TEXT = {
    tulisan: {
      BB: {
        simpulan: "Anak masih kesulitan menuliskan pokok pikiran secara runtut dan isi tulisannya belum sesuai momen yang diminta.",
        guru: [
          "Berikan contoh kerangka sederhana (awal-tengah-akhir) sebelum anak mulai menulis.",
          "Ajukan pertanyaan pemantik lisan per momen ('tadi lihat apa? merasa apa?') sebelum anak menulis.",
        ],
        ortu: [
          "Ajak anak bercerita lisan dulu tentang kegiatannya sebelum diminta menulis di rumah.",
        ],
      },
      MB: {
        simpulan: "Urutan cerita mulai terlihat namun detail dan kesesuaian isi dengan momen belum konsisten.",
        guru: [
          "Ingatkan anak menuliskan 1 detail konkret di tiap momen, bukan hanya kesan umum.",
        ],
        ortu: [
          "Latih anak menulis jurnal singkat kegiatan sehari-hari di rumah untuk membiasakan detail.",
        ],
      },
      BSH: {
        simpulan: "Anak menulis dengan urutan jelas dan isi sesuai momen, sesuai harapan usianya.",
        guru: [
          "Dorong anak menambah kalimat perasaan/pendapat pribadi, bukan hanya kejadian.",
        ],
        ortu: [
          "Apresiasi tulisan anak dan ajak diskusi ringan tentang isinya.",
        ],
      },
      BSB: {
        simpulan: "Anak menulis sangat runtut dengan detail konkret yang kaya di setiap momen.",
        guru: [
          "Jadikan contoh/bacakan (dengan izin anak) sebagai referensi teman sekelas.",
        ],
        ortu: [
          "Dukung kebiasaan menulis jurnal ini terus berlanjut di luar kegiatan sekolah.",
        ],
      },
    },
    kemandirian: {
      BB: {
        simpulan: "Anak masih sangat bergantung pada pengingat guru untuk mengisi jurnal dan mengatur waktu menulisnya.",
        guru: [
          "Dampingi langsung di tiap momen dengan pengingat singkat kapan waktunya menulis.",
          "Berikan waktu khusus terjadwal untuk menulis, jangan diselipkan bebas.",
        ],
        ortu: [
          "Latih rutinitas menulis singkat terjadwal di rumah (mis. jurnal harian 2-3 kalimat).",
        ],
      },
      MB: {
        simpulan: "Anak mulai berinisiatif mengisi jurnal namun masih perlu pengingat di sebagian momen.",
        guru: [
          "Kurangi bertahap pengingat verbal, ganti dengan isyarat non-verbal.",
        ],
        ortu: [
          "Beri tanggung jawab kecil dan tetap di rumah untuk melatih inisiatif serupa.",
        ],
      },
      BSH: {
        simpulan: "Anak cukup mandiri mengisi jurnal di tiap momen tanpa banyak diingatkan.",
        guru: [
          "Percayakan pengaturan waktu menulis sepenuhnya pada anak, pantau ringan saja.",
        ],
        ortu: [
          "Lanjutkan kebiasaan baik ini, beri pujian spesifik saat anak berinisiatif sendiri.",
        ],
      },
      BSB: {
        simpulan: "Anak sangat mandiri mengatur waktu dan menyelesaikan seluruh isian tanpa bantuan.",
        guru: [
          "Beri peran membantu teman yang masih perlu pengingat untuk mengisi jurnalnya.",
        ],
        ortu: [
          "Beri kepercayaan lebih besar untuk mengatur sendiri tugas-tugas serupa di rumah.",
        ],
      },
    },
  };

  const CATEGORY_META = {
    tulisan: { title: "Struktur & Isi Tulisan", icon: "📝", accent: "#2e6fbc" },
    kemandirian: { title: "Kemandirian & Regulasi Diri", icon: "🎒", accent: "#2a9d6f" },
  };

  /** Potong catatan guru supaya tidak membengkakkan laporan cetak (tetap 1 halaman A4). */
  function ringkasCatatan(catatan, maxLen) {
    const bersih = String(catatan).trim();
    if (bersih.length <= maxLen) return bersih;
    return bersih.slice(0, maxLen).trim() + "…";
  }

  /** Hitung rata-rata + level untuk satu kategori dari 1 baris data siswa. */
  function computeCategory(cat, data) {
    const values = cat.items
      .map((item) => Number(data[item]))
      .filter((v) => v >= 1 && v <= 4);
    const filled = values.length;
    const total = cat.items.length;
    const avg = filled ? values.reduce((a, b) => a + b, 0) / filled : null;
    const level = avg !== null ? levelFromAvg(avg) : null;
    const text = level ? CATEGORY_TEXT[cat.key][level] : null;
    const kelengkapan = total ? Math.round((filled / total) * 100) : 0;
    const catatan = (data[cat.noteField] || "").toString().trim();

    let simpulan = text ? text.simpulan : "Belum ada nilai untuk kategori ini.";
    if (level && kelengkapan < 100) {
      simpulan += ` (Baru ${filled} dari ${total} indikator kategori ini yang dinilai — simpulan masih sementara.)`;
    }
    if (catatan) {
      simpulan += ` Catatan guru: "${ringkasCatatan(catatan, 130)}"`;
    }

    return {
      key: cat.key,
      title: CATEGORY_META[cat.key].title,
      icon: CATEGORY_META[cat.key].icon,
      accent: CATEGORY_META[cat.key].accent,
      avg,
      level,
      levelLabel: level ? LEVEL_LABEL[level] : "-",
      filled,
      total,
      kelengkapan,
      catatan,
      simpulan,
      guru: text ? text.guru : [],
      ortu: text ? text.ortu : [],
    };
  }

  /** Skema kesimpulan akhir dari 2 hasil kategori. */
  function computeOverall(categoryResults) {
    const withLevel = categoryResults.filter((c) => c.level);
    if (withLevel.length === 0) {
      return {
        level: null,
        label: "Belum Ada Data",
        narasi: "Belum ada indikator yang diisi sama sekali, kesimpulan asesmen menulis belum bisa dirumuskan.",
        kekuatan: [],
        perhatian: [],
        guru: [],
        ortu: [],
      };
    }

    const scores = withLevel.map((c) => LEVEL_SCORE[c.level]);
    const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
    const jumlahBB = withLevel.filter((c) => c.level === "BB").length;

    // Hanya 2 kategori di modul ini, jadi skema diambil dari rata-rata skor
    // langsung (levelFromAvg), dengan satu pengaman: kalau ada kategori BB,
    // level akhir tidak boleh melompat ke BSH/BSB walau kategori lain BSB.
    let level = levelFromAvg(avgScore);
    if (jumlahBB >= 1 && (level === "BSH" || level === "BSB")) {
      level = "MB";
    }

    const OVERALL_LABEL = {
      BB: "Perlu Pendampingan Intensif",
      MB: "Siap dengan Pendampingan",
      BSH: "Cukup Siap Belajar",
      BSB: "Sangat Siap Belajar",
    };

    const kekuatan = categoryResults.filter((c) => c.level === "BSH" || c.level === "BSB").map((c) => c.title);
    const perhatian = categoryResults.filter((c) => c.level === "BB" || c.level === "MB").map((c) => c.title);

    const OVERALL_NARASI = {
      BB: "Anak memerlukan pendampingan intensif dalam menuliskan pokok pikiran maupun kemandirian mengisi jurnal secara mandiri.",
      MB: "Anak menunjukkan modal awal menulis yang cukup, namun masih memerlukan pendampingan terarah agar makin mandiri.",
      BSH: "Anak menunjukkan kemampuan menulis terstruktur dan kemandirian yang baik, dengan sedikit ruang penguatan.",
      BSB: "Anak menunjukkan kemampuan menulis terstruktur dan kemandirian yang sangat baik selama aktivitas berlangsung.",
    };

    const prioritas = categoryResults
      .filter((c) => c.level === "BB" || c.level === "MB")
      .sort((a, b) => (LEVEL_SCORE[a.level] || 0) - (LEVEL_SCORE[b.level] || 0));
    const sumberRekomendasi = prioritas.length ? prioritas : categoryResults.filter((c) => c.level);

    const guruRekom = [];
    const ortuRekom = [];
    sumberRekomendasi.slice(0, 2).forEach((c) => {
      if (c.guru[0]) guruRekom.push(`[${c.title}] ${c.guru[0]}`);
      if (c.ortu[0]) ortuRekom.push(`[${c.title}] ${c.ortu[0]}`);
    });

    return {
      level,
      label: OVERALL_LABEL[level],
      narasi: OVERALL_NARASI[level],
      kekuatan,
      perhatian,
      guru: guruRekom,
      ortu: ortuRekom,
    };
  }

  /** API utama: hitung hasil lengkap 1 siswa dari 1 baris data (object field->value). */
  function computeStudentResult(dataRow) {
    const data = dataRow || {};
    const categories = MPLS_JURNAL_CATEGORIES.map((cat) => computeCategory(cat, data));
    const overall = computeOverall(categories);
    return { categories, overall };
  }

  global.MplsScoringJurnal = {
    levelFromAvg,
    computeStudentResult,
  };

})(window);
