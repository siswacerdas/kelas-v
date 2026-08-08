/* ============================================================
   INFOGRAFIS-DATA.JS — Sumber tunggal daftar mata pelajaran
   untuk Galeri Visual (gambar/poster/infografis/video singkat).
   ============================================================
   mapelSlug & mapelColor SENGAJA disamakan persis dengan
   materi-index.js / materi.css (variabel --m-{slug}) supaya satu
   mata pelajaran selalu punya warna yang sama di Materi Ajar
   maupun di Galeri Visual — file ini TIDAK mendefinisikan warna
   baru, hanya memakai ulang var(--m-{slug}) yang sudah di-load
   dari materi.css.

   Kalau menambah mapel baru di sini, tambahkan juga variabel
   --m-{slug} yang sesuai di pages/materi/assets/materi.css.
   ============================================================ */

window.INFOGRAFIS_MAPEL = [
  { mapel: "Bahasa Indonesia", mapelSlug: "bahasa-indonesia", mapelIcon: "📝" },
  { mapel: "Matematika", mapelSlug: "matematika", mapelIcon: "🔢" },
  { mapel: "IPAS", mapelSlug: "ipas", mapelIcon: "🔬" },
  { mapel: "Pendidikan Agama Islam", mapelSlug: "pai", mapelIcon: "🕌" },
  { mapel: "Pendidikan Pancasila", mapelSlug: "pancasila", mapelIcon: "🇮🇩" },
  { mapel: "Seni Budaya", mapelSlug: "seni-budaya", mapelIcon: "🎨" },
  { mapel: "PJOK", mapelSlug: "pjok", mapelIcon: "⚽" },
  { mapel: "Bahasa Inggris", mapelSlug: "bahasa-inggris", mapelIcon: "🔤" },
];
