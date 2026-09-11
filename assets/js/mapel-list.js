/* ============================================================
   mapel-list.js — Sumber tunggal daftar mata pelajaran Kelas 5.
   ============================================================
   Diekstrak dari pages/infografis/assets/infografis-data.js saat
   Galeri Visual dihapus (lihat CHANGELOG.md) — file itu sendiri
   ikut terhapus, tapi Linimasa Materi (pages/linimasa.html & tab
   "Linimasa" di admin.html) juga memakai daftar mapel yang sama,
   jadi dipindah ke sini (lokasi netral, tidak terikat 1 fitur)
   supaya kedua fitur itu tidak ikut rusak.

   Pustaka Belajar SENGAJA TIDAK memakai file ini — ia punya salinan
   sendiri di pages/pustaka-belajar/assets/pustaka-belajar-data.js
   (independen, lihat catatan di file itu) supaya tidak ada 1 fitur
   pun yang rusak kalau file lain berubah/dihapus.

   mapelSlug SENGAJA disamakan persis dengan materi-index.js /
   materi.css (variabel --m-{slug}). Kalau menambah mapel baru di
   sini, tambahkan juga variabel --m-{slug} yang sesuai di
   pages/materi/assets/materi.css.
   ============================================================ */

window.DAFTAR_MAPEL = [
  { mapel: "Bahasa Indonesia", mapelSlug: "bahasa-indonesia", mapelIcon: "📝" },
  { mapel: "Matematika", mapelSlug: "matematika", mapelIcon: "🔢" },
  { mapel: "IPAS", mapelSlug: "ipas", mapelIcon: "🔬" },
  { mapel: "Pendidikan Agama Islam", mapelSlug: "pai", mapelIcon: "🕌" },
  { mapel: "Pendidikan Pancasila", mapelSlug: "pancasila", mapelIcon: "🇮🇩" },
  { mapel: "Seni Budaya", mapelSlug: "seni-budaya", mapelIcon: "🎨" },
  { mapel: "PJOK", mapelSlug: "pjok", mapelIcon: "⚽" },
  { mapel: "Bahasa Inggris", mapelSlug: "bahasa-inggris", mapelIcon: "🔤" },
];
