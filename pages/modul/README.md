# 📚 Struktur Folder `pages/modul/`

Folder ini menyimpan **Modul Ajar Mandiri interaktif** (hasil Buku Saku Modul v5) —
beda dari `pages/materi/` yang isinya bacaan per-pertemuan.

Satu file modul = satu unit UTUH untuk satu TP (semua subunit/tangga digabung
dalam satu halaman HTML dengan navigasi scroll), bukan dipecah per pertemuan
seperti di `pages/materi/`.

## Struktur

```
pages/modul/
  {mapel-slug}/
    {tp-slug}/
      modul.html
```

- **`{mapel-slug}`** — SAMA dengan `mapelSlug` yang dipakai di
  `pages/materi/assets/materi-index.js`, supaya konsisten lintas bagian situs
  (mis. `bahasa-indonesia`, `matematika`, `ipas`, `pendidikan-pancasila`,
  `seni-budaya`).
- **`{tp-slug}`** — format `{elemen}-tp{N}`, memakai **kode TP resmi yang sama**
  dengan yang dipakai di `materi-index.js` (field `tp`, mis. `M1`, `M2`, `M3`
  untuk elemen Menyimak). Kalau TP ini belum pernah muncul di materi, cek dulu
  kode TP berikutnya yang belum dipakai untuk elemen tersebut sebelum
  menamai folder, supaya penomoran menyimak-tp1/tp2/tp3/dst. tidak bentrok
  atau melompat.
- **Nama file selalu `modul.html`** (bukan judul deskriptif) — supaya path bisa
  ditebak secara terprogram: `pages/modul/{mapel}/{tp}/modul.html`. Judul
  deskriptif cukup ada di `<title>` dan tampilan dalam file itu sendiri.

## Setiap kali menambah modul baru

1. Pastikan TP sudah lolos pipeline: Buku Saku CP–ATP–TP → Scaffolding
   (atau RPM bila ada) — lihat Peta Pipeline & Panduan Awal.
2. Cek `materi-index.js` untuk elemen yang sama — pakai kode TP (`tp`) dan
   slug yang KONSISTEN kalau TP ini juga/akan ada versi materinya. Kalau TP
   ini baru (belum ada di manapun), lanjutkan penomoran berikutnya untuk
   elemen tersebut.
3. Buat folder `pages/modul/{mapel-slug}/{tp-slug}/`.
4. Taruh file modul sebagai `modul.html` di folder itu.
5. Modul WAJIB dibungkus pola auth-guard yang sama dengan halaman lain
   (lihat isi `modul.html` yang sudah ada sebagai contoh): div `#checking`,
   div `#app-detail.hidden`, lalu:
   ```html
   <script type="module" src="../../../../assets/js/auth-guard.js"></script>
   <script>
     document.addEventListener("user-verified", () => {
       document.getElementById("checking").remove();
       document.getElementById("app-detail").classList.remove("hidden");
     });
     document.addEventListener("DOMContentLoaded", () => window.guardLoggedInPage("../../../../index.html"));
   </script>
   ```
   (Path `../../../../` benar untuk kedalaman `pages/modul/{mapel}/{tp}/modul.html`
   — 4 tingkat ke atas menuju akar repo.)
6. (Opsional, langkah lanjutan yang BELUM dilakukan otomatis) Daftarkan link
   modul ini di tab **Modul** pada `pages/admin.html` (field "Link File Modul")
   supaya muncul di `pages/modul.html` — sistem itu saat ini masih mengasumsikan
   link eksternal (Drive/PDF); isi dengan path relatif ke file ini kalau mau
   modul lokal ikut muncul di daftar tersebut.

## Status isi saat ini

| Mapel | TP Terisi |
| --- | --- |
| Bahasa Indonesia | `menyimak-tp2` (M2 — Menyimak Nonsastra: Hubungan Sebab-Akibat & Urutan) |
| Matematika | — (folder disiapkan, belum ada modul) |
| IPAS | — (folder disiapkan, belum ada modul) |
| Pendidikan Pancasila | — (folder disiapkan, belum ada modul) |
| Seni Budaya | — (folder disiapkan, belum ada modul) |

## Catatan koreksi (riwayat)

Percobaan pertama sempat membuat folder `menyimak-tp3` untuk TP Menyimak Sastra
hasil bedah CP mentah — ini KELIRU, karena TP tersebut belum melalui
kesepakatan resmi dan tidak sejalan dengan TP yang sudah berjalan di
`pages/materi/bahasa-indonesia/` (yang baru mencakup M1 dan M2, keduanya
nonsastra). File itu dipindah ke `bahasa-indonesia/_referensi/` sebagai
contoh gaya/pola interaktif untuk dipakai nanti — BUKAN modul resmi yang
tertaut ke TP manapun. Jangan anggap `_referensi/` sebagai TP terdaftar.

**Pelajaran untuk sesi berikutnya:** sebelum membuat folder TP baru di
`pages/modul/`, SELALU cek dulu `pages/materi/assets/materi-index.js` untuk
elemen yang sama — pakai TP yang SUDAH ada dan sudah punya materi (seperti M1,
M2) sebagai dasar, alih-alih membedah CP dari nol. Modul baru untuk TP yang
benar-benar belum pernah ada di manapun perlu dikonfirmasi dulu ke guru,
karena berarti TP itu belum resmi melalui pipeline CP–ATP–TP sekolah.
