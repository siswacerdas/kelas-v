/**
 * mpls-scoring.js
 * Engine skoring & kesimpulan otomatis untuk hasil observasi MPLS.
 * Bergantung pada MPLS_CATEGORIES dan MPLS_SCALE dari mpls-data.js (dimuat sebelum file ini).
 *
 * Fungsi utama yang dipakai halaman lain (rekap.html, laporan.html):
 *   MplsScoring.computeStudentResult(dataRow) -> {
 *     categories: [{ key, title, icon, accent, avg, level, pct, kelengkapan, simpulan, guru, ortu }, ...],
 *     overall: { level, label, narasi, kekuatan: [...], perhatian: [...], guru: [...], ortu: [...] }
 *   }
 *
 * Ambang rata-rata kategori (skala 1-4):
 *   < 1.75        -> BB  (Belum Berkembang)
 *   1.75 - 2.49   -> MB  (Mulai Berkembang)
 *   2.5  - 3.24   -> BSH (Sesuai Harapan)
 *   >= 3.25       -> BSB (Sangat Baik)
 */
(function (global) {

  const LEVELS = ["BB", "MB", "BSH", "BSB"];
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

  /* ── TEKS KESIMPULAN + REKOMENDASI PER KATEGORI PER LEVEL ──────────────
   * Ditulis agar: (1) menjelaskan makna nilai, (2) memberi langkah konkret
   * untuk guru di sekolah, (3) memberi langkah konkret untuk orang tua di
   * rumah yang SELARAS dengan langkah guru.
   */
  const CATEGORY_TEXT = {
    emosi: {
      BB: {
        simpulan: "Anak masih memerlukan pendampingan aktif untuk beradaptasi, mengelola rasa gagal, dan berinteraksi dengan teman baru.",
        guru: [
          "Dampingi secara personal saat kegiatan kelompok, jangan langsung melepas mandiri.",
          "Berikan tugas sosial berskala kecil dulu (mis. berpasangan) sebelum kelompok besar.",
          "Beri apresiasi spesifik setiap kali anak mencoba, sekecil apa pun usahanya.",
        ],
        ortu: [
          "Ajak anak cerita ringan tiap pulang sekolah tentang siapa yang diajak bicara hari itu.",
          "Latih di rumah lewat permainan peran (mis. berkenalan, menyapa) tanpa tekanan.",
          "Hindari membandingkan dengan anak lain; fokus pada progres kecil anak sendiri.",
        ],
      },
      MB: {
        simpulan: "Anak mulai menunjukkan keberanian dan adaptasi, namun belum konsisten di semua situasi.",
        guru: [
          "Beri kesempatan tampil di depan kelompok kecil secara bertahap dan terjadwal.",
          "Pasangkan dengan teman yang suportif untuk memperkuat rasa aman sosial.",
          "Catat situasi spesifik yang memicu ragu-ragu untuk jadi bahan pendampingan lanjutan.",
        ],
        ortu: [
          "Dorong anak bercerita/presentasi ringan di depan keluarga di rumah.",
          "Beri kesempatan mengambil keputusan kecil sendiri untuk melatih rasa percaya diri.",
          "Rayakan momen anak berani mencoba, bukan hanya saat berhasil.",
        ],
      },
      BSH: {
        simpulan: "Anak cukup adaptif, cukup percaya diri, dan mampu bekerja sama dengan teman sesuai harapan usianya.",
        guru: [
          "Berikan peran tanggung jawab kecil dalam kelompok (mis. ketua kelompok bergilir).",
          "Perluas variasi teman kerja kelompok agar relasi sosial makin luas.",
        ],
        ortu: [
          "Dukung kegiatan sosial di luar rumah (ekstrakurikuler, komunitas) untuk memperkaya relasi.",
          "Tetap jadi tempat cerita yang nyaman kalau ada gesekan pertemanan.",
        ],
      },
      BSB: {
        simpulan: "Anak sangat adaptif, percaya diri, dan menjadi contoh positif dalam interaksi sosial di kelas.",
        guru: [
          "Libatkan sebagai 'peer buddy' untuk membantu teman yang masih perlu penyesuaian.",
          "Beri tantangan kepemimpinan yang lebih besar agar potensinya terus berkembang.",
        ],
        ortu: [
          "Beri ruang tanggung jawab lebih di rumah (mis. membantu adik/anggota keluarga lain).",
          "Ingatkan tetap rendah hati dan peka terhadap teman yang belum seberani dirinya.",
        ],
      },
    },

    kemandirian: {
      BB: {
        simpulan: "Anak masih sangat bergantung pada arahan/pengingat orang dewasa untuk kesiapan belajar, kerapian, dan kepatuhan aturan.",
        guru: [
          "Gunakan checklist visual harian (alat belajar, tugas) yang bisa dicentang sendiri oleh anak.",
          "Tegakkan aturan kelas secara konsisten dengan pengingat yang sabar, bukan hukuman.",
          "Berikan instruksi satu-dua langkah saja dulu, tingkatkan bertahap.",
        ],
        ortu: [
          "Siapkan checklist yang sama di rumah untuk perlengkapan sekolah esok hari.",
          "Latih rutinitas tetap (jam belajar, jam rapikan barang) di rumah setiap hari.",
          "Beri pujian spesifik saat anak melakukan sesuatu tanpa diingatkan, walau kecil.",
        ],
      },
      MB: {
        simpulan: "Anak mulai menunjukkan inisiatif dan kepatuhan, tapi masih perlu pengingat sesekali.",
        guru: [
          "Kurangi bertahap frekuensi pengingat verbal, ganti dengan isyarat non-verbal.",
          "Berikan tanggung jawab piket/tugas kecil yang rutin untuk melatih konsistensi.",
        ],
        ortu: [
          "Beri tanggung jawab rumah tangga kecil dan tetap (mis. merapikan tempat tidur sendiri).",
          "Gunakan pengingat berupa pertanyaan ('sudah cek apa belum?') dibanding perintah langsung.",
        ],
      },
      BSH: {
        simpulan: "Anak cukup mandiri, rapi, jujur, dan mematuhi aturan sesuai harapan.",
        guru: [
          "Percayakan tugas dengan instruksi lebih kompleks dan berjangka waktu lebih panjang.",
          "Jadikan contoh teman sebaya secara halus tanpa membuat anak lain minder.",
        ],
        ortu: [
          "Lanjutkan rutinitas yang sudah berjalan baik, tambah variasi tanggung jawab baru.",
          "Ajak diskusi nilai (kejujuran, empati) lewat cerita/kejadian sehari-hari.",
        ],
      },
      BSB: {
        simpulan: "Anak sangat mandiri, bertanggung jawab, jujur, dan menunjukkan adab yang sangat baik.",
        guru: [
          "Beri peran teladan/pengurus kelas untuk mengasah kepemimpinan dan tanggung jawab.",
        ],
        ortu: [
          "Beri kepercayaan lebih besar (uang saku, jadwal mandiri) sambil tetap dipantau ringan.",
        ],
      },
    },

    minat: {
      BB: {
        simpulan: "Rasa ingin tahu dan inisiatif belajar anak masih perlu dipicu secara aktif oleh orang dewasa.",
        guru: [
          "Gunakan metode belajar yang lebih konkret/bergerak (permainan, alat peraga) untuk memancing minat.",
          "Berikan pertanyaan pemantik terbuka daripada instruksi tertutup.",
          "Amati gaya belajar dominan anak (visual/auditori/kinestetik) untuk pendekatan lebih tepat.",
        ],
        ortu: [
          "Sediakan aktivitas eksploratif ringan di rumah (mis. eksperimen sederhana, membaca bersama).",
          "Ikuti minat spontan anak sehari-hari, jadikan bahan obrolan/belajar informal.",
        ],
      },
      MB: {
        simpulan: "Minat dan rasa ingin tahu anak mulai tumbuh namun belum konsisten pada semua aktivitas.",
        guru: [
          "Variasikan metode sesuai gaya belajar dominan yang mulai teramati.",
          "Berikan pilihan topik/cara mengerjakan tugas agar anak merasa punya kendali.",
        ],
        ortu: [
          "Dukung hobi/ketertarikan spesifik yang mulai terlihat dengan menyediakan sarana sederhana.",
          "Ajak anak memilih sendiri kegiatan belajar tambahan yang diminati.",
        ],
      },
      BSH: {
        simpulan: "Anak cukup antusias, teliti, dan cukup mandiri mencoba sebelum minta bantuan.",
        guru: [
          "Berikan tantangan belajar yang sedikit di atas level saat ini (pengayaan ringan).",
          "Fasilitasi sesuai gaya belajar & preferensi kerja yang sudah teridentifikasi.",
        ],
        ortu: [
          "Dukung eksplorasi bakat yang menonjol lewat kegiatan/lomba yang relevan.",
        ],
      },
      BSB: {
        simpulan: "Anak sangat antusias, memiliki rasa ingin tahu tinggi, dan menunjukkan potensi/bakat yang menonjol.",
        guru: [
          "Beri proyek/pengayaan mandiri sesuai bakat menonjolnya agar potensinya tersalurkan.",
        ],
        ortu: [
          "Pertimbangkan wadah pengembangan bakat di luar sekolah (klub/kursus/komunitas) sesuai minatnya.",
        ],
      },
    },

    fisik: {
      BB: {
        simpulan: "Stamina dan/atau kebersihan diri anak selama kegiatan masih perlu perhatian khusus.",
        guru: [
          "Pantau energi anak selama kegiatan panjang, beri jeda istirahat bila perlu.",
          "Ingatkan & bantu praktikkan kebiasaan kebersihan diri secara rutin dan sabar.",
          "Koordinasikan dengan UKS/orang tua bila ada indikasi kondisi kesehatan tertentu.",
        ],
        ortu: [
          "Pastikan waktu tidur & sarapan anak cukup sebelum berangkat sekolah.",
          "Bangun kebiasaan kebersihan diri (cuci tangan, mandi, potong kuku) secara konsisten di rumah.",
        ],
      },
      MB: {
        simpulan: "Stamina dan kebersihan diri anak mulai baik namun belum stabil.",
        guru: [
          "Perhatikan pola energi anak di jam-jam tertentu, sesuaikan intensitas kegiatan.",
        ],
        ortu: [
          "Jaga konsistensi jam tidur dan pola makan bergizi di rumah.",
        ],
      },
      BSH: {
        simpulan: "Stamina dan kebiasaan kebersihan diri anak sesuai harapan untuk kegiatan sehari-hari.",
        guru: ["Pertahankan pemantauan ringan, tidak perlu intervensi khusus."],
        ortu: ["Pertahankan pola hidup sehat yang sudah berjalan baik."],
      },
      BSB: {
        simpulan: "Stamina dan kebersihan diri anak sangat baik dan konsisten.",
        guru: ["Bisa jadi contoh kebiasaan baik bagi teman sekelas."],
        ortu: ["Pertahankan pola hidup sehat yang sudah sangat baik ini."],
      },
    },
  };

  const CATEGORY_META = {
    emosi: { title: "Emosi & Sosial", icon: "🧭", accent: "#2e6fbc" },
    kemandirian: { title: "Kemandirian & Karakter", icon: "🌱", accent: "#2a9d6f" },
    minat: { title: "Minat & Gaya Belajar", icon: "💡", accent: "#e8a020" },
    fisik: { title: "Kondisi Fisik", icon: "🩺", accent: "#1a7a8a" },
  };

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
    return {
      key: cat.key,
      title: CATEGORY_META[cat.key].title,
      icon: CATEGORY_META[cat.key].icon,
      accent: CATEGORY_META[cat.key].accent,
      avg,
      level,
      levelLabel: level ? LEVEL_LABEL[level] : "Belum ada data",
      filled,
      total,
      kelengkapan: total ? Math.round((filled / total) * 100) : 0,
      simpulan: text ? text.simpulan : "Indikator kategori ini belum diisi, kesimpulan belum bisa dibuat.",
      guru: text ? text.guru : [],
      ortu: text ? text.ortu : [],
    };
  }

  /** Skema kesimpulan akhir kesiapan belajar dari 4 hasil kategori. */
  function computeOverall(categoryResults) {
    const withLevel = categoryResults.filter((c) => c.level);
    if (withLevel.length === 0) {
      return {
        level: null,
        label: "Belum Ada Data",
        narasi: "Belum ada indikator yang diisi sama sekali, kesimpulan kesiapan belajar belum bisa dirumuskan.",
        kekuatan: [],
        perhatian: [],
        guru: [],
        ortu: [],
      };
    }

    const scores = withLevel.map((c) => LEVEL_SCORE[c.level]);
    const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
    const jumlahBB = withLevel.filter((c) => c.level === "BB").length;
    const jumlahMB = withLevel.filter((c) => c.level === "MB").length;

    // Skema/skenario penentuan level keseluruhan:
    // - Ada >=2 kategori BB, ATAU rata-rata < 1.75  -> perlu pendampingan intensif
    // - Ada 1 kategori BB, ATAU rata-rata < 2.5, ATAU >=2 kategori MB -> siap dgn pendampingan
    // - Rata-rata 2.5-3.24 dan tidak ada BB -> cukup siap
    // - Rata-rata >= 3.25 dan tidak ada BB/MB -> sangat siap
    let level;
    if (jumlahBB >= 2 || avgScore < 1.75) {
      level = "BB";
    } else if (jumlahBB >= 1 || avgScore < 2.5 || jumlahMB >= 2) {
      level = "MB";
    } else if (avgScore < 3.25) {
      level = "BSH";
    } else {
      level = "BSB";
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
      BB: "Anak memerlukan pendampingan intensif dan konsisten dari guru maupun orang tua pada beberapa aspek dasar sebelum benar-benar siap mengikuti ritme belajar Kelas 5 secara mandiri.",
      MB: "Anak menunjukkan modal awal yang cukup, namun masih memerlukan pendampingan terarah pada aspek tertentu agar makin siap mengikuti pembelajaran Kelas 5.",
      BSH: "Anak menunjukkan kesiapan belajar yang baik pada sebagian besar aspek, dengan sedikit ruang penguatan yang bisa dilakukan sambil berjalan.",
      BSB: "Anak menunjukkan kesiapan belajar yang sangat baik di semua aspek yang diamati dan siap mengikuti pembelajaran Kelas 5 secara mandiri.",
    };

    // Rekomendasi gabungan: ambil rekomendasi dari kategori-kategori yang paling lemah
    // (BB dulu, baru MB) supaya guru & ortu tahu prioritas, bukan daftar panjang semua kategori.
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
    const categories = MPLS_CATEGORIES.map((cat) => computeCategory(cat, data));
    const overall = computeOverall(categories);
    return { categories, overall };
  }

  global.MplsScoring = {
    LEVELS,
    LEVEL_LABEL,
    levelFromAvg,
    computeStudentResult,
  };

})(window);
