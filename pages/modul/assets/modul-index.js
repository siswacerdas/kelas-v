/* ============================================================
   MODUL-INDEX.JS — Sumber tunggal daftar Modul Ajar Mandiri (lokal)
   ============================================================
   Beda dari materi-index.js: satu TP = SATU entri (satu file modul.html
   utuh berisi seluruh subunit/tangga), bukan banyak file per pertemuan.

   Setiap kali menambah modul baru:
     1. Cek pages/materi/assets/materi-index.js untuk elemen yang sama —
        pakai kode TP (field "tp") dan "tema" yang SUDAH ada di sana kalau
        TP ini juga (atau akan) punya materi. Kalau TP benar-benar baru
        (belum ada di manapun), konfirmasi dulu ke guru sebelum menambah —
        lihat catatan koreksi di pages/modul/README.md.
     2. Buat folder pages/modul/{mapelSlug}/{tp-slug}/ lalu taruh filenya
        sebagai "modul.html" di situ.
     3. Tambahkan SATU objek baru di array MODUL_INDEX di bawah.
     4. Unggah file modul baru + file ini ke GitHub.
   pages/modul.html otomatis mengikuti isi array ini — tidak perlu
   mengubah file lain.

   Field:
     mapel      — nama tampilan (mis. "Bahasa Indonesia")
     mapelSlug  — HARUS SAMA dengan nama folder mapel di pages/modul/
     mapelColor — var(--m-{slug}), warnanya didefinisikan di pages/modul.html
                  (disalin dari pages/materi/assets/materi.css supaya satu
                  mapel selalu satu warna di seluruh situs)
     mapelIcon  — satu emoji ciri khas mapel
     icon       — (opsional) emoji lebih spesifik per elemen, menimpa mapelIcon
     elemen     — nama elemen CP (mis. "Menyimak")
     tp         — kode TP resmi (mis. "M2"), SAMA dengan yang dipakai di
                  materi-index.js kalau TP ini juga punya materi
     tema       — label elemen+TP, SAMA dengan "tema" di materi-index.js
                  kalau TP ini juga punya materi (supaya terlihat berpasangan)
     urutan     — urutan tampil dalam satu tema (biasanya 1, karena 1 TP = 1 modul)
     judul      — judul unit yang tampil ke siswa
     ringkasan  — 1 kalimat pendek, tampil sebagai deskripsi kartu
     status     — "selesai" atau "segera"
     file       — path relatif dari pages/modul/, mis. "bahasa-indonesia/menyimak-tp2/modul.html"
   ============================================================ */

window.MODUL_INDEX = [
  {
    mapel: "Bahasa Indonesia",
    mapelSlug: "bahasa-indonesia",
    mapelColor: "var(--m-bahasa-indonesia)",
    mapelIcon: "📝",
    icon: "🎧",
    elemen: "Menyimak",
    tp: "M1",
    tema: "Menyimak · Informasi Penting dari Teks Aural",
    urutan: 1,
    judul: "Menangkap Informasi Penting",
    ringkasan: "Berlatih menunjukkan paham lewat respons non-verbal, memilah informasi Siapa-Di mana-Apa-Kapan, dan mencatat dengan gaya sendiri — ditutup dengan menyimak mandiri.",
    status: "selesai",
    file: "bahasa-indonesia/menyimak-tp1/modul.html"
  },
  {
    mapel: "Bahasa Indonesia",
    mapelSlug: "bahasa-indonesia",
    mapelColor: "var(--m-bahasa-indonesia)",
    mapelIcon: "📝",
    icon: "🎧",
    elemen: "Menyimak",
    tp: "M2",
    tema: "Menyimak · Hubungan Sebab-Akibat & Urutan",
    urutan: 1,
    judul: "Menemukan Sebab dan Akibat",
    ringkasan: "Berlatih mendengarkan dan menemukan hubungan sebab-akibat serta urutan kejadian dalam teks nonsastra — dilengkapi Panggung Dengar, aktivitas interaktif, dan Buku Mini Sebab-Akibat.",
    status: "selesai",
    file: "bahasa-indonesia/menyimak-tp2/modul.html"
  }
];
