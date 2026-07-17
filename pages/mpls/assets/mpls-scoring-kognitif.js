/**
 * mpls-scoring-kognitif.js
 * Engine skoring & kesimpulan otomatis untuk hasil Asesmen Awal KOGNITIF
 * (literasi & numerasi dasar). Struktur & ambang skor SAMA PERSIS dengan
 * mpls-scoring.js (non-kognitif) supaya konsisten — cuma teks & kategori
 * yang berbeda (akademik, bukan sosial-emosional).
 *
 * Bergantung pada MPLS_KOGNITIF_CATEGORIES (mpls-kognitif-data.js), dimuat
 * sebelum file ini.
 *
 * API: MplsScoringKognitif.computeStudentResult(dataRow) -> { categories, overall }
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
    literasi: {
      BB: {
        simpulan: "Anak masih memerlukan pendampingan intensif dalam mengenal huruf serta membaca kata/kalimat sederhana.",
        guru: [
          "Berikan program membaca terbimbing (guided reading) rutin dengan teks yang sangat sederhana.",
          "Gunakan kartu huruf/kata dan latihan mengeja bertahap sebelum masuk ke kalimat.",
          "Sediakan waktu khusus membaca satu-lawan-satu beberapa kali seminggu.",
        ],
        ortu: [
          "Luangkan waktu membaca bersama anak 10-15 menit setiap hari di rumah.",
          "Gunakan buku bergambar dengan kalimat pendek dan pengulangan kata.",
          "Fokus membangun rasa senang membaca dulu, hindari target/tekanan tinggi.",
        ],
      },
      MB: {
        simpulan: "Anak sudah bisa membaca kata/kalimat sederhana namun belum lancar, dan pemahaman bacaan masih terbatas.",
        guru: [
          "Latih membaca nyaring bergantian dengan bimbingan, naikkan kesulitan teks bertahap.",
          "Ajukan pertanyaan sederhana setelah membaca untuk melatih pemahaman isi bacaan.",
        ],
        ortu: [
          "Ajak anak menceritakan ulang buku yang baru dibaca dengan kata-kata sendiri.",
          "Sediakan bacaan ringan sesuai minat anak agar termotivasi membaca mandiri.",
        ],
      },
      BSH: {
        simpulan: "Anak membaca dengan cukup lancar dan memahami isi bacaan sederhana sesuai harapan usianya.",
        guru: [
          "Berikan bacaan dengan variasi genre untuk memperluas wawasan & kosakata.",
          "Latih menceritakan kembali isi bacaan yang lebih panjang/kompleks.",
        ],
        ortu: [
          "Dorong anak membaca mandiri secara rutin, bebas memilih buku yang disukai.",
          "Diskusikan isi buku bersama untuk melatih pemahaman lebih dalam.",
        ],
      },
      BSB: {
        simpulan: "Anak membaca sangat lancar dengan pemahaman baik dan mampu menceritakan kembali isi bacaan dengan baik.",
        guru: [
          "Beri bacaan yang lebih menantang (tingkat kesulitan lebih tinggi) sesuai levelnya.",
          "Libatkan sebagai 'tutor sebaya' membantu teman yang masih belajar membaca.",
        ],
        ortu: [
          "Perkaya akses bacaan (perpustakaan, buku baru) sesuai minatnya.",
          "Dukung anak menulis ringkasan/jurnal sederhana dari buku yang dibaca.",
        ],
      },
    },

    penjumlahan: {
      BB: {
        simpulan: "Anak masih kesulitan pada penjumlahan dasar, termasuk fakta dasar 1-20.",
        guru: [
          "Gunakan alat bantu konkret (jari, kelereng, garis bilangan) sebelum bentuk abstrak.",
          "Latih fakta dasar penjumlahan berulang lewat permainan sederhana.",
        ],
        ortu: [
          "Latih berhitung lewat aktivitas sehari-hari (mis. menghitung uang belanja).",
          "Gunakan permainan kartu/dadu untuk latihan penjumlahan yang santai di rumah.",
        ],
      },
      MB: {
        simpulan: "Anak mulai bisa penjumlahan sederhana namun belum lancar pada teknik menyimpan/bersusun.",
        guru: ["Latih bertahap dari penjumlahan tanpa menyimpan ke dengan menyimpan, pakai alat bantu nilai tempat."],
        ortu: ["Latih soal cerita ringan sehari-hari yang melibatkan penjumlahan."],
      },
      BSH: {
        simpulan: "Anak cukup mampu menyelesaikan penjumlahan termasuk teknik menyimpan sesuai harapan.",
        guru: ["Berikan variasi soal cerita untuk memperdalam penerapan konsep."],
        ortu: ["Ajak anak menghitung total belanja/uang saku sebagai latihan penerapan nyata."],
      },
      BSB: {
        simpulan: "Anak sangat mahir dalam penjumlahan termasuk bersusun dan soal bervariasi.",
        guru: ["Beri tantangan soal penjumlahan bilangan lebih besar/kompleks sebagai pengayaan."],
        ortu: ["Dukung eksplorasi permainan berhitung yang lebih menantang (kuis, aplikasi edukasi)."],
      },
    },

    pengurangan: {
      BB: {
        simpulan: "Anak masih kesulitan pada pengurangan dasar, termasuk fakta dasar 1-20.",
        guru: [
          "Gunakan alat bantu konkret (garis bilangan, benda) sebelum bentuk abstrak.",
          "Latih fakta dasar pengurangan berulang dengan cara yang menyenangkan.",
        ],
        ortu: ["Latih pengurangan lewat aktivitas sehari-hari (mis. menghitung sisa uang setelah belanja)."],
      },
      MB: {
        simpulan: "Anak mulai bisa pengurangan sederhana namun belum lancar pada teknik meminjam/bersusun.",
        guru: ["Latih bertahap dari pengurangan tanpa meminjam ke dengan meminjam, pakai alat bantu nilai tempat."],
        ortu: ["Latih soal cerita ringan sehari-hari yang melibatkan pengurangan."],
      },
      BSH: {
        simpulan: "Anak cukup mampu menyelesaikan pengurangan termasuk teknik meminjam sesuai harapan.",
        guru: ["Berikan variasi soal cerita untuk memperdalam penerapan konsep."],
        ortu: ["Ajak anak menghitung sisa/uang kembalian sebagai latihan penerapan nyata."],
      },
      BSB: {
        simpulan: "Anak sangat mahir dalam pengurangan termasuk bersusun dan soal bervariasi.",
        guru: ["Beri tantangan soal pengurangan bilangan lebih besar/kompleks sebagai pengayaan."],
        ortu: ["Dukung eksplorasi permainan berhitung yang lebih menantang."],
      },
    },

    perkalian: {
      BB: {
        simpulan: "Anak belum hafal perkalian dasar dan masih kesulitan dengan konsep perkalian.",
        guru: [
          "Perkenalkan konsep perkalian sebagai penjumlahan berulang dengan benda konkret dulu.",
          "Latih hafalan perkalian dasar bertahap (mulai dari perkalian 1, 2, 5, 10).",
        ],
        ortu: [
          "Bantu anak menghafal perkalian dasar lewat lagu/permainan santai di rumah.",
          "Hindari drilling berlebihan yang membuat anak stres — buat menyenangkan.",
        ],
      },
      MB: {
        simpulan: "Anak mulai hafal sebagian perkalian dasar namun belum lancar, terutama perkalian bersusun.",
        guru: ["Latih tabel perkalian yang belum lancar secara rutin dan singkat setiap hari."],
        ortu: ["Ulang hafalan perkalian bersama secara rutin dengan cara santai (games, flashcard)."],
      },
      BSH: {
        simpulan: "Anak cukup hafal perkalian dasar dan mampu menyelesaikan perkalian sesuai harapan.",
        guru: ["Berikan variasi soal perkalian bersusun & soal cerita untuk memperdalam."],
        ortu: ["Ajak anak menerapkan perkalian dalam situasi nyata (mis. menghitung total barang)."],
      },
      BSB: {
        simpulan: "Anak sangat mahir perkalian dasar dan bersusun, serta memahami konsepnya dengan baik.",
        guru: ["Beri tantangan perkalian bilangan lebih besar sebagai pengayaan."],
        ortu: ["Dukung eksplorasi soal perkalian yang lebih menantang."],
      },
    },

    pembagian: {
      BB: {
        simpulan: "Anak belum memahami konsep pembagian dan masih kesulitan pembagian dasar.",
        guru: [
          "Perkenalkan konsep pembagian sebagai berbagi rata dengan benda konkret dulu.",
          "Kaitkan pembagian dengan tabel perkalian dasar yang sudah dikenal anak.",
        ],
        ortu: ["Latih konsep berbagi rata lewat aktivitas sehari-hari (mis. membagi kue sama rata)."],
      },
      MB: {
        simpulan: "Anak mulai memahami pembagian dasar namun belum lancar pada pembagian dengan sisa/bersusun.",
        guru: ["Latih bertahap dari pembagian tanpa sisa ke dengan sisa, kaitkan dengan tabel perkalian."],
        ortu: ["Latih soal cerita ringan sehari-hari yang melibatkan pembagian."],
      },
      BSH: {
        simpulan: "Anak cukup mampu menyelesaikan pembagian termasuk dengan sisa sesuai harapan.",
        guru: ["Berikan variasi soal pembagian bersusun & soal cerita untuk memperdalam."],
        ortu: ["Ajak anak menerapkan pembagian dalam situasi nyata (mis. membagi barang ke beberapa orang)."],
      },
      BSB: {
        simpulan: "Anak sangat mahir pembagian termasuk bersusun dan memahami konsepnya dengan baik.",
        guru: ["Beri tantangan soal pembagian bilangan lebih besar sebagai pengayaan."],
        ortu: ["Dukung eksplorasi soal pembagian yang lebih menantang."],
      },
    },

    /* v0.6.0 — Menyimak & Menulis (lihat mpls-kognitif-data.js untuk daftar item lengkapnya) */
    menyimak: {
      BB: {
        simpulan: "Anak masih kesulitan memahami dan mengikuti instruksi lisan, bahkan untuk instruksi satu langkah, sehingga sering tertinggal saat pembelajaran berlangsung.",
        guru: [
          "Berikan instruksi satu langkah pada satu waktu, gunakan kalimat pendek dan konkret.",
          "Pastikan perhatian anak tertuju sebelum memberi instruksi, ulangi dengan sabar bila perlu.",
          "Gunakan bantuan visual (gambar/tulisan poin) untuk mendukung instruksi lisan.",
        ],
        ortu: [
          "Latih mengikuti instruksi sederhana di rumah (mis. \"tolong ambilkan sendok\") secara rutin.",
          "Kurangi gangguan (gawai, TV) saat berbicara/memberi instruksi ke anak.",
        ],
      },
      MB: {
        simpulan: "Anak mulai bisa mengikuti instruksi lisan sederhana, namun masih kesulitan pada instruksi bertahap atau penjelasan yang lebih panjang.",
        guru: [
          "Pecah instruksi panjang jadi beberapa langkah kecil, cek pemahaman di setiap langkah.",
          "Minta anak mengulang instruksi dengan kata-kata sendiri sebelum mulai mengerjakan.",
        ],
        ortu: [
          "Latih instruksi 2 langkah berurutan di rumah (mis. \"ambil piring, lalu taruh di meja\").",
          "Ajak anak menceritakan ulang apa yang baru didengar (dari cerita/tontonan) secara santai.",
        ],
      },
      BSH: {
        simpulan: "Anak cukup mampu memahami dan mengikuti instruksi lisan bertahap, serta cukup mampu memilah informasi penting dari penjelasan guru.",
        guru: [
          "Berikan instruksi dengan langkah yang lebih kompleks/jumlahnya lebih banyak secara bertahap.",
          "Libatkan dalam diskusi kelas yang butuh menyimak & menanggapi pendapat teman.",
        ],
        ortu: ["Ajak diskusi ringan yang butuh menyimak & menanggapi (mis. cerita tentang kegiatan hari ini)."],
      },
      BSB: {
        simpulan: "Anak sangat mampu menyimak, memahami instruksi kompleks, dan mampu memilah/meringkas informasi penting yang didengar dengan baik.",
        guru: ["Libatkan sebagai 'penerjemah instruksi' bagi teman yang masih kesulitan memahami (peer support)."],
        ortu: ["Dukung kegiatan yang melatih menyimak lebih lanjut (mis. mendengarkan cerita audio sesuai usia lalu didiskusikan)."],
      },
    },

    menulis: {
      BB: {
        simpulan: "Anak masih kesulitan menulis dan mencatat secara mandiri, termasuk memahami apa yang diminta dari sebuah tugas/rubrik penilaian.",
        guru: [
          "Sediakan kerangka catatan sederhana (isian titik-titik) sebagai langkah awal sebelum menulis bebas.",
          "Jelaskan rubrik/kriteria tugas dengan bahasa sangat sederhana dan contoh konkret sebelum anak mulai mengerjakan.",
          "Beri waktu ekstra dan pendampingan langsung saat menulis, jangan disamakan kecepatannya dengan teman lain.",
        ],
        ortu: [
          "Latih menulis santai di rumah (mis. menulis daftar belanja, catatan singkat) tanpa tekanan.",
          "Bacakan/jelaskan instruksi tugas bersama anak sebelum ia mulai mengerjakan sendiri.",
        ],
      },
      MB: {
        simpulan: "Anak mulai bisa mencatat poin-poin sederhana, namun belum lancar meringkas sendiri dan masih perlu bantuan memahami kriteria tugas.",
        guru: [
          "Latih meringkas bertahap: mulai dari melengkapi kerangka, menuju menulis bebas 1-2 kalimat.",
          "Jelaskan ulang rubrik/kriteria tugas dengan contoh hasil kerja \"baik\" dan \"kurang\" secara konkret.",
        ],
        ortu: ["Ajak anak menuliskan ulang cerita singkat dari apa yang ia ceritakan secara lisan."],
      },
      BSH: {
        simpulan: "Anak cukup mampu mencatat & meringkas secara mandiri dengan waktu yang wajar, serta cukup memahami maksud instruksi/kriteria tugas tertulis.",
        guru: [
          "Berikan tugas menulis dengan kriteria yang sedikit lebih kompleks untuk memperdalam pemahaman rubrik.",
          "Beri umpan balik spesifik yang mengaitkan hasil kerja anak dengan kriteria di rubrik, agar makin paham polanya.",
        ],
        ortu: ["Dukung kebiasaan menulis jurnal harian singkat di rumah sebagai latihan rutin."],
      },
      BSB: {
        simpulan: "Anak sangat mampu menulis/mencatat secara mandiri, cepat, dan memahami dengan baik apa yang dituntut oleh kriteria/rubrik tugas.",
        guru: ["Libatkan sebagai contoh/model saat menjelaskan rubrik ke teman sekelas."],
        ortu: ["Dukung eksplorasi menulis kreatif (cerita pendek, jurnal) sesuai minatnya."],
      },
    },
  };

  function categoryMeta(cat) {
    return { title: cat.title, icon: cat.icon, accent: cat.accent };
  }

  /** Potong catatan guru supaya tidak membengkakkan laporan cetak (tetap 1 halaman A4). */
  function ringkasCatatan(catatan, maxLen) {
    const bersih = String(catatan).trim();
    if (bersih.length <= maxLen) return bersih;
    return bersih.slice(0, maxLen).trim() + "…";
  }

  /* 2026-07-17: simpulan sekarang menyerap catatan anekdot guru (cat.noteField)
   * dan kelengkapan data — supaya kesimpulan tercetak tidak murni template
   * kategori-level yang identik untuk semua anak di level yang sama. */
  function computeCategory(cat, data) {
    const values = cat.items
      .map((item) => Number(data[item]))
      .filter((v) => v >= 1 && v <= 4);
    const filled = values.length;
    const total = cat.items.length;
    const avg = filled ? values.reduce((a, b) => a + b, 0) / filled : null;
    const level = avg !== null ? levelFromAvg(avg) : null;
    const text = level ? CATEGORY_TEXT[cat.key][level] : null;
    const meta = categoryMeta(cat);
    const kelengkapan = total ? Math.round((filled / total) * 100) : 0;
    const catatan = cat.noteField ? (data[cat.noteField] || "").toString().trim() : "";

    // Cap lebih pendek dari mpls-scoring.js/mpls-scoring-jurnal.js SENGAJA —
    // laporan-kognitif.html menampilkan 7 kategori dalam grid rapat (vs 4/2
    // di modul lain), diuji lewat Playwright supaya tetap 1 halaman A4.
    let simpulan = text ? text.simpulan : "Belum ada nilai untuk kategori ini.";
    if (level && kelengkapan < 100) {
      simpulan += ` (${filled}/${total} indikator, sementara.)`;
    }
    if (catatan) {
      simpulan += ` Catatan: "${ringkasCatatan(catatan, 60)}"`;
    }

    return {
      key: cat.key,
      title: meta.title,
      icon: meta.icon,
      accent: meta.accent,
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

  function computeOverall(categoryResults) {
    const withLevel = categoryResults.filter((c) => c.level);
    if (withLevel.length === 0) {
      return {
        level: null,
        label: "Belum Ada Data",
        narasi: "Belum ada indikator yang diisi sama sekali, kesimpulan kesiapan akademik belum bisa dirumuskan.",
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
      BB: "Perlu Pendampingan Akademik Intensif",
      MB: "Siap dengan Pendampingan Akademik",
      BSH: "Cukup Siap Secara Akademik",
      BSB: "Sangat Siap Secara Akademik",
    };
    const OVERALL_NARASI = {
      BB: "Anak memerlukan pendampingan dasar literasi dan/atau numerasi yang intensif dan konsisten sebelum mengikuti pembelajaran akademik Kelas 5 secara mandiri.",
      MB: "Anak memiliki modal literasi/numerasi dasar yang cukup, namun masih memerlukan pendampingan terarah pada aspek tertentu.",
      BSH: "Anak menunjukkan kemampuan literasi dan numerasi dasar yang baik, dengan sedikit ruang penguatan pada aspek tertentu.",
      BSB: "Anak menunjukkan kemampuan literasi dan numerasi dasar yang sangat baik dan siap mengikuti pembelajaran akademik Kelas 5 secara mandiri.",
    };

    const kekuatan = categoryResults.filter((c) => c.level === "BSH" || c.level === "BSB").map((c) => c.title);
    const perhatian = categoryResults.filter((c) => c.level === "BB" || c.level === "MB").map((c) => c.title);

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

  function computeStudentResult(dataRow) {
    const data = dataRow || {};
    const categories = MPLS_KOGNITIF_CATEGORIES.map((cat) => computeCategory(cat, data));
    const overall = computeOverall(categories);
    return { categories, overall };
  }

  global.MplsScoringKognitif = { levelFromAvg, computeStudentResult };

})(window);
