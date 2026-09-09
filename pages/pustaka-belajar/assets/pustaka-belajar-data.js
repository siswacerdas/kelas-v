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
   sama di Materi Ajar maupun di Pustaka Belajar — file ini TIDAK
   mendefinisikan warna baru, hanya memakai ulang var(--m-{slug}) yang
   sudah di-load dari materi.css.
   ============================================================ */

window.PUSTAKA_BELAJAR_MAPEL = [
  { mapel: "Bahasa Indonesia", mapelSlug: "bahasa-indonesia", mapelIcon: "📝" },
  { mapel: "Matematika", mapelSlug: "matematika", mapelIcon: "🔢" },
  { mapel: "IPAS", mapelSlug: "ipas", mapelIcon: "🔬" },
  { mapel: "Pendidikan Agama Islam", mapelSlug: "pai", mapelIcon: "🕌" },
  { mapel: "Pendidikan Pancasila", mapelSlug: "pancasila", mapelIcon: "🇮🇩" },
  { mapel: "Seni Budaya", mapelSlug: "seni-budaya", mapelIcon: "🎨" },
  { mapel: "PJOK", mapelSlug: "pjok", mapelIcon: "⚽" },
  { mapel: "Bahasa Inggris", mapelSlug: "bahasa-inggris", mapelIcon: "🔤" },
];
