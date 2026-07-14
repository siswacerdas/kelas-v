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
];
