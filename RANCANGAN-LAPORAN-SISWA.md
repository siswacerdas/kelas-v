# Rancangan Fitur: Laporan Siswa (Guru & Orang Tua)

> **Status: FASE 1 SUDAH DIIMPLEMENTASIKAN** (kode ditulis, belum dites
> dengan Firebase/Apps Script sungguhan oleh pemilik proyek). Keputusan di
> §8 sudah dikonfirmasi: akun terpisah (Opsi A), prioritas Fase 1 dulu,
> fokus tampilan web (belum ada cetak/PDF). Fase 2 (Hasil Latihan Bank
> Soal) & Fase 3 (Progres Materi) BELUM dikerjakan — menyusul terpisah.

---

## 1. Tujuan

Halaman ringkasan perkembangan belajar per siswa — bisa diakses **guru**
(lihat siapa saja) dan **orang tua** (lihat **hanya anaknya sendiri**, lewat
akun Firebase terpisah, BUKAN akun siswa yang sama).

---

## 2. Data yang ditampilkan

| Bagian | Sumber data | Status |
|---|---|---|
| Profil (nama, foto, dll) | Sheet "Data Siswa" | ✅ Sudah ada |
| Ringkasan MPLS non-kognitif | Sheet "Data MPLS" | ✅ Sudah ada |
| Ringkasan MPLS kognitif | Sheet "Data MPLS Kognitif" | ✅ Sudah ada |
| Jurnal Aktivitas | Sheet "Data Jurnal Aktivitas" | ✅ Sudah ada |
| Hasil latihan Bank Soal | Sheet BARU "Data Hasil Latihan" | ❌ Belum ada — Fase 2 |
| Progres membaca Materi Ajar | Sheet BARU "Data Progres Materi" | ❌ Belum ada — Fase 3 (opsional) |

Galeri Visual **tidak** dimasukkan — bukan indikator progres akademik
individual, dan memang ditujukan terbuka untuk semua siswa (bukan data per
anak).

---

## 3. Model akun orang tua

Mengikuti persis pola akun guru/siswa yang **sudah ada** (README.md bagian
"Langkah 6–7"): dibuat **manual** oleh guru lewat Firebase Console (Add
user) + dokumen Firestore `users/{uid}`. **Tidak ada halaman pendaftaran
mandiri** — guru tetap yang mengontrol siapa yang bisa akses, konsisten
dengan filosofi kontrol penuh guru yang sudah berlaku di proyek ini.

**Skema dokumen `users/{uid}` (field baru bercetak tebal):**
```
nama    : string                    (mis. "Ibu Siti", nama orang tua)
role    : "guru" | "siswa" | "orangtua"   ← "orangtua" BARU
email   : string
**anak**  : array of string          ← BARU, khusus role "orangtua"
                                        Isinya "Nama Lengkap" PERSIS sama
                                        ejaannya dengan kolom "Nama Lengkap"
                                        di sheet "Data Siswa" — dipakai
                                        ulang sebagai kunci, BUKAN bikin ID
                                        baru (konsisten dengan pola "Nama
                                        Lengkap" sebagai kunci upsert yang
                                        sudah dipakai di seluruh Code.gs
                                        sejak awal).
                                        Array, BUKAN string tunggal — supaya
                                        1 akun orang tua bisa terhubung ke
                                        LEBIH DARI 1 anak (kakak-adik satu
                                        kelas).
```

**Langkah baru di README.md** (disisipkan setelah "Langkah 7 — Tambah Akun
Siswa"): "Langkah 7b — Tambah Akun Orang Tua", isinya sama seperti Langkah
6/7 tapi `role: "orangtua"` + isi `anak: [...]`.

### Firestore Rules — TIDAK PERLU DIUBAH
Rule `users/{uid}` yang sudah ada (`allow read: if request.auth.uid == uid`)
sudah otomatis mencakup orang tua membaca dokumennya sendiri — tidak perlu
rule baru. Data laporan sesungguhnya (MPLS/Jurnal/dll) **tidak disimpan di
Firestore sama sekali** (semua di Google Sheets lewat Apps Script), jadi
tidak ada rule Firestore lain yang perlu disentuh untuk fitur ini.

---

## 4. Kontrol akses di halaman (frontend)

**Keputusan desain: TIDAK bikin file guard baru terpisah** (mis.
`orangtua-guard.js`). Alasan: `guru-guard.js` dipakai BANYAK halaman
(`kelas/`, `mpls/rekap.html`, dst.) makanya wajar jadi modul sendiri.
Laporan Siswa cuma 1 halaman yang dipakai 2 role sekaligus (guru & orang
tua) dengan tampilan berbeda — pola yang sudah ada persis untuk ini adalah
**index.html sendiri**, yang sudah baca `role` dari Firestore secara inline
lalu menampilkan/menyembunyikan panel berdasarkan nilainya. `laporan-siswa.
html` akan memakai pola yang sama:

1. Gerbang login pakai `auth-guard.js` (login apa saja, sama seperti
   `materi.html`) — BUKAN `guru-guard.js` (itu akan memblokir orang tua).
2. Setelah `user-verified`, baca dokumen `users/{uid}` sendiri (persis pola
   di `index.html`) untuk dapat `role` + `anak`.
3. **role === "siswa" → tolak akses**, redirect balik ke beranda dengan
   pesan jelas (ini yang memastikan syarat "tidak untuk siswa" terpenuhi
   di sisi klien — penegakan SESUNGGUHNYA tetap di server, lihat §5).
4. **role === "guru"** → tampilkan dropdown/pencarian SEMUA siswa (dari
   endpoint yang sudah ada, `?siswa=1`).
5. **role === "orangtua"** → tampilkan HANYA nama-nama di `anak` (kalau
   cuma 1 anak, langsung tampilkan laporannya tanpa perlu memilih).

---

## 5. Backend (Apps Script) — perubahan & endpoint baru

### 5.1 Refactor kecil: `verifikasiUser_(idToken)`
`wajibGuru_(idToken)` saat ini melakukan 2 pemanggilan REST (Identity
Toolkit lookup → dapat `uid`, lalu baca Firestore `users/{uid}` → dapat
`role`) lalu langsung menolak kalau bukan "guru". Logika pengambilan
`uid`+dokumen user ini akan **diekstrak** jadi fungsi bersama:

```js
function verifikasiUser_(idToken) {
  // ... (logika REST call yang SUDAH ADA di wajibGuru_, dipindah ke sini)
  // mengembalikan { uid, role, anak } — "anak" array kosong kalau field-nya
  // tidak ada (guru/siswa tidak punya field ini)
}
```
`wajibGuru_` lalu jadi tinggal: `if (verifikasiUser_(idToken).role !== "guru") throw ...`
— perilaku SAMA PERSIS seperti sekarang, cuma logikanya dipakai ulang.

### 5.2 Fungsi baru: `wajibAksesLaporan_(idToken, namaSiswa)`
**Prinsip keamanan paling penting di fitur ini:** endpoint guru yang sudah
ada (`?siswa=1`, `?all=1`, dst.) sengaja TIDAK dibatasi cakupannya — cocok
untuk guru yang memang perlu lihat semua siswa. Endpoint laporan untuk
orang tua **HARUS** dibatasi cuma ke anak mereka sendiri, kalau tidak:
orang tua bisa saja minta data siswa LAIN dan tetap dikabulkan. Ini beda
prinsip dari semua endpoint guru yang sudah ada, jadi butuh fungsi
verifikasi baru, bukan reuse `wajibGuru_`:

```js
function wajibAksesLaporan_(idToken, namaSiswa) {
  const info = verifikasiUser_(idToken);
  if (info.role === "guru") return; // guru boleh akses siapa saja
  if (info.role === "orangtua" && info.anak.indexOf(namaSiswa) !== -1) return;
  throw new Error('Akun ini tidak punya akses ke data siswa "' + namaSiswa + '".');
}
```

### 5.3 Endpoint baru: `?laporanSiswa=1&nama=<nama>&idToken=...`
Menggabungkan data dari BEBERAPA sheet jadi 1 respons JSON (supaya halaman
laporan cukup 1 request, bukan 4-5 request terpisah):
```js
if (params.laporanSiswa) {
  wajibAksesLaporan_(params.idToken, params.nama);
  return jsonOut_({
    profil: findRowByColumn_(getSiswaSheet_(), "Nama Lengkap", params.nama) ...,
    mpls: ... (dari sheet "Data MPLS", kolom "Nama Siswa"),
    mplsKognitif: ... (dari sheet "Data MPLS Kognitif", kolom "Nama Siswa"),
    jurnal: ... (dari sheet "Data Jurnal Aktivitas", kolom "Nama Siswa"),
    // Fase 2/3 nanti nambah: hasilLatihan: [...], progresMateri: [...]
  });
}
```
> Catatan kecil yang perlu diperhatikan saat implementasi: sheet "Data
> Siswa" pakai nama kolom **"Nama Lengkap"**, sedangkan sheet MPLS
> Kognitif/Jurnal pakai **"Nama Siswa"** — inkonsistensi penamaan kolom
> yang SUDAH ADA dari awal proyek (bukan yang baru dibuat fitur ini), jadi
> endpoint ini perlu tahu keduanya, bukan mengasumsikan sama.

### 5.4 Endpoint tambahan untuk guru: daftar nama untuk dropdown
Guru sudah punya `?siswa=1` (semua kolom) — bisa dipakai langsung untuk
mengisi dropdown, tidak perlu endpoint baru untuk ini.

---

## 6. Fase 2 (nanti, setelah Fase 1 disetujui jalan): Hasil Latihan Bank Soal

- Sheet baru **"Data Hasil Latihan"**: Timestamp, Nama Siswa, Mapel, Judul
  Bank Soal, Skor, Jumlah Benar, Jumlah Soal.
- **Yang perlu dicek dulu sebelum desain endpoint-nya**: apakah
  `bank-soal.html` saat ini meminta siswa memilih/mengetik namanya sebelum
  mulai mengerjakan? Kalau belum, perlu ditambah (mirip pola pilih nama di
  `input.html` MPLS) — supaya hasil bisa dikaitkan ke siswa yang benar.
- Endpoint baru `doPost type: "hasil_latihan"` — TIDAK perlu digerbang
  `wajibGuru_`/`wajibAksesLaporan_` (yang mengirim ini adalah SISWA saat
  submit kuis, bukan guru/orang tua) — cukup validasi field wajar seperti
  endpoint MPLS siswa yang sudah ada.
- Tambah `hasilLatihan: [...]` ke respons `?laporanSiswa=1`.

## 7. Fase 3 (opsional, paling rumit): Progres Membaca Materi Ajar

- Sheet baru **"Data Progres Materi"**: Timestamp, Nama Siswa, Materi Slug
  (pakai field `file` yang SAMA dengan yang dipakai Galeri Visual —
  konsisten, bukan skema baru), Status.
- Perlu skrip pelacak yang dimuat di SEMUA halaman materi (~43 file) — opsi
  paling praktis: 1 file JS bersama (`materi-progress-tracker.js`) yang
  otomatis membaca path halamannya sendiri (`window.location.pathname`)
  jadi tidak perlu edit manual tiap file materi, cukup tambah 1 baris
  `<script src="...">` di tiap file (atau, kalau mau nol-sentuh sama
  sekali ke 43 file, dipertimbangkan lain waktu apakah `materi-nav.js` yang
  SUDAH di-include semua halaman materi bisa dipakai sebagai tempat
  menambahkan ini, supaya benar-benar tidak perlu sentuh file individual).
- **Ini bagian paling rumit & paling gampang ditunda** — disarankan
  didiskusikan lagi terpisah setelah Fase 1 & 2 selesai dan benar-benar
  dipakai, baru diputuskan apakah datanya senyata itu dibutuhkan.

---

## 8. Yang perlu dikonfirmasi sebelum Fase 1 mulai dikerjakan

- [x] Setuju dengan skema `anak: array` di dokumen Firestore `users/{uid}`? — **Ya, dipakai persis seperti rancangan.**
- [x] Setuju halaman `laporan-siswa.html` pakai pola inline role-check
      (seperti `index.html`) daripada bikin file guard terpisah? — **Ya.**
- [x] Prioritas Fase 1 dulu (data yang SUDAH ada: Profil, MPLS, Jurnal) —
      Hasil Latihan & Progres Materi menyusul di Fase 2/3 terpisah? — **Ya.**
- [x] Ada preferensi tampilan (mis. perlu opsi cetak/PDF dari awal, atau
      cukup tampilan web dulu)? — **Fokus tampilan web dulu, fitur tambahan menyusul.**

## 9. Yang BELUM dikerjakan di Fase 1 (disengaja, sesuai lingkup yang disepakati)

- **Foto profil siswa** tidak ditampilkan di laporan. Proxy `?foto=` yang
  sudah ada masih hard-gated `wajibGuru_()` saja (lihat `Code.gs`) — kalau
  ORANG TUA mencoba memakainya, akan ditolak. Menampilkan foto untuk orang
  tua butuh perubahan tersendiri ke `serveFotoBinary_()` (bukan sekadar
  ganti gerbang — proxy itu cuma menerima ID file, tidak tahu itu foto
  siswa yang mana, jadi butuh cara mencocokkan file ke `namaSiswa` dulu
  sebelum bisa dibatasi cakupannya seperti `wajibAksesLaporan_()`).
  Disengaja ditunda supaya tidak menyentuh model keamanan proxy foto siswa
  yang sudah berjalan tanpa perhatian desain khusus.
- **Opsi cetak/PDF** — belum ada tombol cetak. Browser sudah punya
  Ctrl+P/Cmd+P bawaan yang bisa dipakai sementara (tampilan belum
  dioptimalkan khusus untuk itu).
- Fase 2 (Hasil Latihan Bank Soal) & Fase 3 (Progres Materi) — lihat §6–7,
  belum dikerjakan sama sekali.

