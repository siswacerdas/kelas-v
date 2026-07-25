/* ============================================================
   MATERI-INDEX.JS — Sumber tunggal daftar Materi Ajar
   ============================================================
   Setiap kali menambah materi baru:
     1. Buat file HTML-nya di pages/materi/{mapelSlug}/NN-judul.html
     2. Tambahkan SATU objek baru di array MATERI_INDEX di bawah
     3. Unggah dua file itu (file materi baru + file ini) ke GitHub
   materi.html dan navigasi "sebelumnya/berikutnya" di tiap halaman
   detail otomatis mengikuti isi array ini — tidak perlu mengubah
   file lain.

   Field:
     mapel      — nama tampilan (mis. "Matematika")
     mapelSlug  — HARUS SAMA dengan nama folder (lihat daftar slug
                  baku di PROGRESS_MATERI.md)
     mapelColor — variabel warna CSS, format "var(--m-{slug})"
     mapelIcon  — satu emoji ciri khas mapel
     tema       — nama tema/bab besar
     urutan     — nomor urut BACA di dalam mapel itu saja (1, 2, 3, ...)
     judul      — judul materi
     ringkasan  — 1 kalimat pendek, tampil di daftar
     file       — path relatif dari folder pages/materi/, format
                  "{mapelSlug}/NN-judul-kebab-case.html"
   ============================================================ */

window.MATERI_INDEX = [
  {
    mapel: "Matematika",
    mapelSlug: "matematika",
    mapelColor: "var(--m-matematika)",
    mapelIcon: "🔢",
    tema: "Bilangan",
    urutan: 1,
    judul: "Bilangan Cacah dan Nilai Tempat",
    ringkasan: "Belajar membaca dan menulis bilangan besar lewat nilai tempat.",
    file: "matematika/01-bilangan-cacah-dan-nilai-tempat.html"
  }
];
