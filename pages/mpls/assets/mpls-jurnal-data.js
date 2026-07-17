/**
 * mpls-jurnal-data.js
 * Sumber data untuk modul Asesmen Menulis (Jurnal Aktivitas).
 * Format persis sama seperti mpls-data.js/mpls-kognitif-data.js supaya bisa
 * dipakai ulang oleh app-jurnal.js / mpls-scoring-jurnal.js yang mirip
 * app.js / mpls-scoring.js non-kognitif.
 *
 * Memakai ulang MPLS_STUDENTS, MPLS_GURU_LIST, MPLS_SCALE, MPLS_WALI_KELAS, dst.
 * dari mpls-data.js — pastikan mpls-data.js dimuat SEBELUM file ini.
 *
 * Rubrik SENGAJA ringkas (2 kategori, 7 indikator total) — bukan penilaian
 * tata bahasa/ejaan yang detail. Konteks: aktivitas jalan sehat ke Taman
 * Kukusan, siswa mengisi jurnal mandiri di 3 momen (perjalanan, di taman,
 * setelah kembali).
 *
 * Nama field (item) HARUS SAMA PERSIS dengan header kolom di sheet
 * "Data Jurnal Aktivitas" — lihat apps-script/Code.gs → HEADERS_JURNAL.
 */

const MPLS_JURNAL_AKTIVITAS = "Jalan Sehat ke Taman Kukusan";

const MPLS_JURNAL_CATEGORIES = [
  {
    key: "tulisan",
    title: "Struktur & Isi Tulisan",
    subtitle: "Kejelasan urutan cerita dan kesesuaian isi dengan momen yang diminta",
    accent: "#2e6fbc",
    icon: "📝",
    items: [
      "Menuliskan pokok pikiran dengan urutan yang jelas (awal - tengah - akhir)",
      "Isi tulisan sesuai momen yang diminta (saat perjalanan / di taman / saat kembali)",
      "Kalimat cukup runtut dan mudah dipahami",
      "Menuliskan detail konkret, bukan hanya satu-dua kata",
    ],
    noteField: "Catatan Tulisan",
    noteLabel: "Catatan Anekdot",
    notePlaceholder: 'mis. "ceritanya urut tapi detailnya masih minim, banyak kalimat 1-2 kata"',
  },
  {
    key: "kemandirian",
    title: "Kemandirian & Regulasi Diri",
    subtitle: "Inisiatif mengisi jurnal di ketiga momen tanpa terus diingatkan",
    accent: "#2a9d6f",
    icon: "🎒",
    items: [
      "Mengisi jurnal di ketiga momen (perjalanan, di taman, kembali) tanpa terus diingatkan",
      "Mengatur sendiri waktu menulis di sela aktivitas",
      "Menyelesaikan seluruh isian tanpa bantuan penuh dari guru/teman",
    ],
    noteField: "Catatan Kemandirian",
    noteLabel: "Catatan Anekdot",
    notePlaceholder: 'mis. "perlu diingatkan menulis di momen kedua, momen lain inisiatif sendiri"',
  },
];
