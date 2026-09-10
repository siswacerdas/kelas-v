/* ============================================================
   PUSTAKA-BELAJAR-DATA.JS — Sumber tunggal daftar mata pelajaran
   untuk fitur Pustaka Belajar (file PDF materi presentasi dari
   guru pendamping — lihat RANCANGAN-PUSTAKA-BELAJAR.md).
   ============================================================
   SENGAJA DIDUPLIKASI dari pages/infografis/assets/infografis-data.js
   (bukan di-reuse langsung) — supaya Pustaka Belajar TIDAK ikut rusak
   saat Galeri Visual dihapus di sesi terpisah nanti (§0 poin 2 rancangan).
   Kalau ke depannya Galeri Visual benar-benar sudah dihapus dan tidak ada
   fitur lain yang butuh daftar mapel terpisah ini, boleh disatukan lagi
   jadi 1 sumber, tapi untuk sekarang independensi lebih penting.

   mapelSlug & warnanya SENGAJA disamakan persis dengan materi-index.js /
   materi.css (variabel --m-{slug}) supaya 1 mapel selalu punya warna yang
   sama di Materi Ajar maupun di Pustaka Belajar. Landing (pustaka-belajar.html)
   memakai var(--m-{slug}) dari materi.css langsung (sudah di-load di halaman
   itu); field "warna" (hex) di bawah ini disediakan untuk dipakai tempat yang
   TIDAK memuat materi.css, misalnya tab "Pustaka Belajar" di admin.html.
   ============================================================ */

window.PUSTAKA_BELAJAR_MAPEL = [
  { mapel: "Bahasa Indonesia", mapelSlug: "bahasa-indonesia", mapelIcon: "📝", warna: "#8c3d5f" },
  { mapel: "Matematika", mapelSlug: "matematika", mapelIcon: "🔢", warna: "#1f6f78" },
  { mapel: "IPAS", mapelSlug: "ipas", mapelIcon: "🔬", warna: "#3f7d4a" },
  { mapel: "Pendidikan Agama Islam", mapelSlug: "pai", mapelIcon: "🕌", warna: "#0f6b52" },
  { mapel: "Pendidikan Pancasila", mapelSlug: "pancasila", mapelIcon: "🇮🇩", warna: "#a13d3d" },
  { mapel: "Seni Budaya", mapelSlug: "seni-budaya", mapelIcon: "🎨", warna: "#c9861f" },
  { mapel: "PJOK", mapelSlug: "pjok", mapelIcon: "⚽", warna: "#d9541c" },
  { mapel: "Bahasa Inggris", mapelSlug: "bahasa-inggris", mapelIcon: "🔤", warna: "#4a5d8c" },
];
