/**
 * mpls-data.js
 * Sumber data tunggal untuk modul MPLS: daftar siswa, skala penilaian,
 * dan struktur kategori/indikator. Dipakai oleh input.html.
 *
 * Nama field (mis. "Adaptasi dengan aturan baru kelas 5") HARUS SAMA PERSIS
 * dengan header kolom di sheet "Data MPLS" pada Google Spreadsheet —
 * lihat apps-script/Code.gs → HEADERS.
 */

const MPLS_STUDENTS = [
  "Abdurrahman Ar Ribery",
  "Abyan Nandana Khalif",
  "Adskhan Ibran Elfatih",
  "Afiya Nur Ataya Sandi",
  "Aisyah Afqohunnisa",
  "Akhdan Ziyad",
  "Alam Rayyan Fiyanto",
  "Arsyila Almahyira Azgefa",
  "Athifa Nur Pelangi",
  "Fairel Atharizz Calief",
  "Fatih Pratama Basuki",
  "Flora Baby Queen",
  "Gilang Aditya Ramadhan",
  "Ilham Ibrahim",
  "Inara Huwaida Ardhani",
  "Kinara Adisti Salsabila",
  "Kirana Hafizah Iqra Nasution",
  "Latifa Rafanda",
  "Meshya Belliza Utama",
  "Muhammad Ali Alfarizi",
  "Nayla Latifa",
  "Quenzino Satria Hadika",
  "Reynand Pratama",
  "Shakila Qiyana Shadiqah",
  "Shanum Meyra Rosadi",
];

const MPLS_SCALE = [
  { v: 1, code: "BB", label: "Belum Berkembang" },
  { v: 2, code: "MB", label: "Mulai Berkembang" },
  { v: 3, code: "BSH", label: "Sesuai Harapan" },
  { v: 4, code: "BSB", label: "Sangat Baik" },
];

const MPLS_CATEGORIES = [
  {
    key: "emosi",
    title: "Emosi & Sosial",
    subtitle: "Adaptasi, resiliensi, percaya diri, relasi pertemanan",
    accent: "#2e6fbc",
    icon: "🧭",
    items: [
      "Adaptasi dengan aturan baru kelas 5",
      "Semangat mencoba lagi setelah kalah/gagal",
      "Percaya diri bicara di depan kelompok",
      "Keberanian berkenalan dengan teman baru",
      "Keterlibatan aktif dalam kegiatan kelompok",
      "Menerima teman yang berbeda karakter/kemampuan",
    ],
    noteField: "Catatan Emosi & Sosial",
    noteLabel: "Catatan Anekdot",
    notePlaceholder: 'Kejadian spesifik yang teramati, mis. "mencoba lagi setelah kalah lomba estafet"',
  },
  {
    key: "kemandirian",
    title: "Kemandirian & Karakter",
    subtitle: "Tanggung jawab, adab, kejujuran, empati, ibadah dasar",
    accent: "#2a9d6f",
    icon: "🌱",
    items: [
      "Kesiapan alat belajar tanpa diingatkan",
      "Inisiatif selesaikan instruksi sederhana",
      "Kerapian barang pribadi",
      "Kepatuhan pada aturan kelas/sekolah",
      "Adab menyapa guru/orang lebih tua",
      "Kejujuran dalam interaksi sehari-hari",
      "Kepedulian spontan saat teman kesulitan",
      "Adab & kelancaran ibadah dasar",
    ],
    noteField: "Catatan Kemandirian & Karakter",
    noteLabel: "Catatan Anekdot",
    notePlaceholder: "Kejadian spesifik yang teramati",
  },
  {
    key: "minat",
    title: "Minat & Gaya Belajar",
    subtitle: "Antusiasme, rasa ingin tahu, gaya belajar, preferensi kerja",
    accent: "#e8a020",
    icon: "💡",
    items: [
      "Antusiasme terhadap kegiatan/topik baru",
      "Rasa ingin tahu aktif",
      "Ketelitian mengerjakan aktivitas ringan",
      "Kemandirian mencoba sebelum minta bantuan",
    ],
    selects: [
      {
        field: "Gaya Belajar Dominan",
        label: "Gaya Belajar Dominan",
        options: ["Visual", "Auditori", "Kinestetik", "Campuran"],
      },
      {
        field: "Preferensi Cara Kerja",
        label: "Preferensi Cara Kerja",
        options: ["Individu", "Kelompok", "Seimbang"],
      },
    ],
    textField: {
      field: "Bakat/Potensi yang Menonjol",
      label: "Bakat/Potensi yang Menonjol",
      placeholder: "mis. aktif memimpin yel-yel kelompok",
    },
    noteField: "Catatan Minat & Gaya Belajar",
    noteLabel: "Catatan Anekdot",
    notePlaceholder: "Kejadian spesifik yang teramati",
  },
  {
    key: "fisik",
    title: "Kondisi Fisik",
    subtitle: "Stamina, kebersihan diri, catatan untuk orang tua/UKS",
    accent: "#1a7a8a",
    icon: "🩺",
    items: [
      "Stamina & energi selama kegiatan",
      "Kebiasaan menjaga kebersihan diri",
    ],
    noteField: "Catatan Kondisi Fisik",
    noteLabel: "Catatan/Gejala untuk Orang Tua atau UKS (bila ada)",
    notePlaceholder: "Hanya untuk hal yang perlu dikomunikasikan — bukan kesimpulan diagnosis",
  },
];
