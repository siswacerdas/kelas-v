/**
 * mpls-kognitif-data.js
 * Sumber data untuk modul Asesmen Awal KOGNITIF (literasi & numerasi dasar).
 * Format persis sama seperti mpls-data.js (MPLS_CATEGORIES) supaya bisa
 * dipakai ulang oleh app-kognitif.js / mpls-scoring-kognitif.js yang mirip
 * app.js / mpls-scoring.js non-kognitif.
 *
 * Memakai ulang MPLS_STUDENTS, MPLS_GURU_LIST, MPLS_SCALE, MPLS_WALI_KELAS
 * dari mpls-data.js — pastikan mpls-data.js dimuat SEBELUM file ini.
 *
 * Nama field (item) HARUS SAMA PERSIS dengan header kolom di sheet
 * "Data MPLS Kognitif" — lihat apps-script/Code.gs → HEADERS_KOGNITIF.
 */

const MPLS_KOGNITIF_CATEGORIES = [
  {
    key: "literasi",
    title: "Literasi Dasar (Membaca)",
    subtitle: "Mengenal huruf, kelancaran membaca, dan pemahaman bacaan",
    accent: "#6a4fb0",
    icon: "📖",
    items: [
      "Mengenal dan melafalkan huruf dengan tepat",
      "Membaca kata sederhana dengan lancar",
      "Membaca kalimat pendek dengan lancar dan intonasi tepat",
      "Membaca paragraf pendek tanpa mengeja",
      "Memahami isi bacaan sederhana (dapat menjawab pertanyaan tentang bacaan)",
      "Mampu menceritakan kembali isi bacaan dengan kata-kata sendiri",
    ],
    noteField: "Catatan Literasi",
    noteLabel: "Catatan Anekdot",
    notePlaceholder: 'mis. "masih mengeja huruf demi huruf saat membaca kalimat baru"',
  },
  {
    key: "penjumlahan",
    title: "Numerasi — Penjumlahan",
    subtitle: "Kemampuan dasar berhitung penjumlahan",
    accent: "#2e6fbc",
    icon: "➕",
    items: [
      "Penjumlahan bilangan tanpa teknik menyimpan (mis. 23 + 15)",
      "Penjumlahan bilangan dengan teknik menyimpan (mis. 48 + 37)",
      "Penjumlahan bersusun bilangan 3 digit atau lebih",
      "Kecepatan & ketepatan fakta dasar penjumlahan (1-20)",
    ],
    noteField: "Catatan Penjumlahan",
    noteLabel: "Catatan Anekdot",
    notePlaceholder: "Kejadian spesifik yang teramati",
  },
  {
    key: "pengurangan",
    title: "Numerasi — Pengurangan",
    subtitle: "Kemampuan dasar berhitung pengurangan",
    accent: "#c9784a",
    icon: "➖",
    items: [
      "Pengurangan bilangan tanpa teknik meminjam (mis. 58 - 23)",
      "Pengurangan bilangan dengan teknik meminjam (mis. 52 - 27)",
      "Pengurangan bersusun bilangan 3 digit atau lebih",
      "Kecepatan & ketepatan fakta dasar pengurangan (1-20)",
    ],
    noteField: "Catatan Pengurangan",
    noteLabel: "Catatan Anekdot",
    notePlaceholder: "Kejadian spesifik yang teramati",
  },
  {
    key: "perkalian",
    title: "Numerasi — Perkalian",
    subtitle: "Kemampuan dasar berhitung perkalian",
    accent: "#2a9d6f",
    icon: "✖️",
    items: [
      "Hafal perkalian dasar 1-10 (tabel perkalian)",
      "Perkalian bilangan dengan satu angka (mis. 24 x 3)",
      "Perkalian bersusun (mis. 24 x 13)",
      "Memahami konsep perkalian sebagai penjumlahan berulang",
    ],
    noteField: "Catatan Perkalian",
    noteLabel: "Catatan Anekdot",
    notePlaceholder: "Kejadian spesifik yang teramati",
  },
  {
    key: "pembagian",
    title: "Numerasi — Pembagian",
    subtitle: "Kemampuan dasar berhitung pembagian",
    accent: "#b5539f",
    icon: "➗",
    items: [
      "Pembagian dasar tanpa sisa (mis. 20 ÷ 4)",
      "Pembagian dengan sisa (mis. 22 ÷ 4)",
      "Pembagian bersusun bilangan 2 digit atau lebih",
      "Memahami konsep pembagian sebagai pengurangan berulang/pembagian rata",
    ],
    noteField: "Catatan Pembagian",
    noteLabel: "Catatan Anekdot",
    notePlaceholder: "Kejadian spesifik yang teramati",
  },

  /* v0.6.0 — Ditambahkan di AKHIR array (BUKAN disisipkan di tengah) supaya urutan &
   * posisi header kategori-kategori LAMA di atas tidak pernah berubah — ini prinsip
   * yang sama dijaga sejak v0.4.1 (lihat komentar di apps-script/Code.gs → HEADERS_KOGNITIF):
   * data lama yang sudah tersimpan tetap aman selama header baru HANYA ditambah di ujung. */
  {
    key: "menyimak",
    title: "Menyimak & Mengikuti Instruksi",
    subtitle: "Memahami informasi lisan dan melaksanakan instruksi dengan tepat",
    accent: "#1f8a8a",
    icon: "👂",
    items: [
      "Memperhatikan guru berbicara tanpa perlu diingatkan berulang kali",
      "Memahami instruksi lisan sederhana (1 langkah) dan langsung melaksanakannya dengan benar",
      "Memahami dan mengikuti instruksi lisan bertahap (2-3 langkah berurutan) dengan benar",
      "Mampu mengulang/menjelaskan kembali inti instruksi yang baru didengar dengan kata-kata sendiri",
      "Mampu memilah informasi penting dari penjelasan lisan yang lebih panjang (mis. bisa menyebutkan poin-poin utamanya)",
      "Bertahan menyimak dengan fokus selama penjelasan/instruksi berlangsung (tidak mudah teralih)",
    ],
    noteField: "Catatan Menyimak",
    noteLabel: "Catatan Anekdot",
    notePlaceholder: 'mis. "perlu instruksi diulang 2-3 kali sebelum mulai mengerjakan"',
  },
  {
    key: "menulis",
    title: "Menulis & Meringkas",
    subtitle: "Mencatat, meringkas, dan memahami maksud instruksi/rubrik tugas tertulis",
    accent: "#b8860b",
    icon: "✍️",
    items: [
      "Menulis huruf/kata dengan bentuk yang terbaca jelas (kerapian bukan fokus utama, keterbacaan yang utama)",
      "Mencatat poin-poin penting dari penjelasan guru secara mandiri (tanpa didikte kata per kata)",
      "Menulis rangkuman singkat (1-3 kalimat) dari suatu penjelasan/bacaan dengan kata-kata sendiri",
      "Menyelesaikan catatan/tugas tulis dalam waktu yang wajar (tidak tertinggal jauh dari teman sekelas)",
      "Memahami maksud instruksi/kriteria tugas tertulis (mis. rubrik penilaian) dan tahu apa yang harus dilakukan untuk mendapat nilai baik",
      "Menuliskan jawaban/tugas sesuai dengan apa yang diminta instruksi (bukan asal menulis)",
    ],
    noteField: "Catatan Menulis",
    noteLabel: "Catatan Anekdot",
    notePlaceholder: 'mis. "rangkuman lisan sudah bagus, tapi menuliskannya sendiri masih lambat"',
  },
];
