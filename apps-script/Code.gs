/**
 * Code.gs — Backend MPLS untuk Google Apps Script
 *
 * Cara pakai: lihat apps-script/README.md di repo ini.
 *
 * Ringkasan endpoint:
 * - doPost(e)  : { type: "mpls" (default) }   -> upsert 1 baris nilai MPLS non-kognitif per siswa.
 *                { type: "siswa" }            -> upsert 1 baris profil siswa (+ opsional foto ke Drive).
 *                { type: "mpls_kognitif" }    -> upsert 1 baris nilai asesmen kognitif per siswa.
 *                { type: "jurnal" }           -> upsert 1 baris nilai asesmen menulis (jurnal aktivitas) per siswa.
 * - doGet(e)   : ?nama=...        -> 1 baris data MPLS non-kognitif siswa tsb (untuk input.html).
 *                ?all=1           -> SEMUA baris data MPLS non-kognitif (untuk rekap.html/laporan.html).
 *                ?siswa=1         -> SEMUA baris data profil siswa (untuk pages/kelas/).
 *                ?foto=<id atau URL Drive> -> PROXY: mengirim BYTE gambar foto siswa langsung
 *                (bukan JSON) — dipakai sebagai <img src> lewat assets/js/foto-fallback.js,
 *                supaya tidak bergantung pada hotlink Drive yang sering diblokir Google untuk
 *                pengunjung anonim. Lihat komentar di serveFotoBinary_() (baru sejak v0.5.3).
 *                ?namaKognitif=.. -> 1 baris data kognitif siswa tsb (untuk input-kognitif.html).
 *                ?allKognitif=1   -> SEMUA baris data kognitif (untuk rekap-kognitif.html/laporan-kognitif.html).
 *                ?namaJurnal=..   -> 1 baris data jurnal siswa tsb (untuk input-jurnal.html).
 *                ?allJurnal=1     -> SEMUA baris data jurnal (untuk rekap-jurnal.html/laporan-jurnal.html).
 * - setupSheet() / setupSiswaSheet() / setupSheetKognitif() / setupSheetJurnal(): jalankan SEKALI
 *                secara manual dari editor Apps Script (pilih fungsi lalu Run) untuk membuat sheet + header.
 *
 * PENTING setelah mengubah file ini: deploy ulang sebagai "New version" dari
 * deployment yang SAMA (Deploy > Manage deployments > pensil > New version),
 * supaya APPS_SCRIPT_URL yang sudah dipakai di config.js tidak berubah.
 * Saat re-deploy, Apps Script akan minta otorisasi izin Drive tambahan — klik
 * Allow/Izinkan (dibutuhkan untuk fitur simpan foto siswa).
 */

const SPREADSHEET_ID = "1G-LWyOSyCKLP10RU234grIR_5-iWxLSG-6vZP3sKUkA";
const SHEET_NAME = "Data MPLS";
const SHEET_NAME_KOGNITIF = "Data MPLS Kognitif";
const SHEET_NAME_JURNAL = "Data Jurnal Aktivitas";
const SISWA_SHEET_NAME = "Data Siswa";
// ID folder Drive tempat foto siswa disimpan (dari link yang sudah dishare "siapa saja bisa mengedit")
const FOTO_FOLDER_ID = "1b-ENsEQJeUFoVKKA6htZbVAxf7zr1IzG";

// ── KUNCI AKSES (v0.7.0) ─────────────────────────────────────────────────
// Sebelum ini, SEMUA endpoint di bawah bisa diakses siapa pun yang tahu URL Web
// App (URL itu sendiri publik — ada di pages/mpls/assets/config.js yang ikut
// ter-deploy ke GitHub Pages). Kode akses di input.html dan Firebase Auth di
// rekap/laporan/pages/kelas HANYA gerbang tampilan (client-side) — endpoint di
// balik layar sama sekali tidak mengecek apa pun. Siapa saja bisa memanggil
// ?all=1 / ?siswa=1 / dst. langsung lewat browser/curl dan mendapat nama
// lengkap, foto, tempat & tanggal lahir SEMUA siswa. Dua lapis di bawah ini
// menutup celah itu di level server, bukan cuma di tampilan.
//
// LAPIS 1 — ACCESS_CODE_MPLS: kode akses SEDERHANA (sama persis levelnya
// dengan ACCESS_CODE di pages/mpls/assets/config.js — BUKAN keamanan
// sesungguhnya, cuma mencegah pemanggilan asal/tidak sengaja). Dipakai untuk
// endpoint "1 siswa" yang dipanggil dari halaman input (nama/namaKognitif/
// namaJurnal, dan penyimpanan nilai MPLS/kognitif/jurnal). HARUS diubah
// bersamaan dengan ACCESS_CODE di config.js kalau mau diganti — dua file ini
// tidak saling membaca, jadi disalin manual di masing-masing.
const ACCESS_CODE_MPLS = "mpls2026";

// LAPIS 2 — verifikasi GURU sungguhan lewat Firebase Auth ID Token (lihat
// wajibGuru_() di bawah). Dipakai untuk endpoint yang mengembalikan/menulis
// data SEMUA siswa sekaligus (nama, TTL, foto, seluruh hasil penilaian) —
// data yang paling sensitif. Nilai di bawah sama dengan firebaseConfig di
// index.html (apiKey & projectId Firebase memang didesain publik/terlihat di
// klien; yang menjaga keamanan adalah verifikasi ID Token-nya, bukan
// kerahasiaan apiKey ini).
const FIREBASE_WEB_API_KEY = "AIzaSyBcpuD90Qk7z4Bdxkm5KhXrsKVzZWFc3_k";
const FIREBASE_PROJECT_ID = "kelas-v-2026";

/** Lempar Error kalau kode akses MPLS salah/tidak disertakan. Kalau
 * ACCESS_CODE_MPLS di-set jadi "" (kosong), gerbang ini otomatis nonaktif —
 * konsisten dengan perilaku ACCESS_CODE kosong di config.js sisi klien. */
function wajibKodeAkses_(kode) {
  if (!ACCESS_CODE_MPLS) return;
  if (String(kode || "") !== ACCESS_CODE_MPLS) {
    throw new Error("Kode akses salah atau tidak disertakan.");
  }
}

/**
 * Verifikasi bahwa idToken yang dikirim klien adalah sesi Firebase Auth yang
 * valid DAN akun tsb berperan "guru" di Firestore (koleksi users/{uid}, field
 * role) — pengecekan yang SAMA seperti yang dilakukan guru-guard.js di klien,
 * tapi dijalankan ulang di server supaya tidak bisa dilewati begitu saja
 * dengan langsung memanggil endpoint tanpa lewat halaman.
 *
 * Dua langkah, keduanya lewat REST API Google (Apps Script tidak butuh
 * library/dependency tambahan untuk ini):
 *  1. Identity Toolkit `accounts:lookup` — pastikan idToken valid & belum
 *     kedaluwarsa/dipalsukan, dan dapatkan uid pemiliknya.
 *  2. Firestore REST `GET users/{uid}` — dipanggil dengan idToken sebagai
 *     Bearer token (BUKAN kredensial service account), memanfaatkan rule
 *     Firestore yang sudah ada di README ("pemilik boleh baca dokumennya
 *     sendiri"). Ambil field "role" dari situ.
 * Melempar Error dengan pesan jelas kalau gagal di langkah manapun; pemanggil
 * (doGet/doPost) yang menentukan bagaimana pesan itu ditampilkan.
 */
function wajibGuru_(idToken) {
  if (!idToken) throw new Error("Sesi login guru tidak ditemukan — silakan login ulang.");

  const lookupRes = UrlFetchApp.fetch(
    "https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=" + FIREBASE_WEB_API_KEY,
    {
      method: "post",
      contentType: "application/json",
      payload: JSON.stringify({ idToken: idToken }),
      muteHttpExceptions: true,
    }
  );
  let lookupJson;
  try { lookupJson = JSON.parse(lookupRes.getContentText() || "{}"); } catch (e) { lookupJson = {}; }
  if (lookupRes.getResponseCode() !== 200 || !lookupJson.users || !lookupJson.users[0]) {
    throw new Error("Sesi login tidak valid/kedaluwarsa — silakan login ulang di halaman utama.");
  }
  const uid = lookupJson.users[0].localId;

  const docRes = UrlFetchApp.fetch(
    "https://firestore.googleapis.com/v1/projects/" + FIREBASE_PROJECT_ID +
      "/databases/(default)/documents/users/" + uid,
    {
      method: "get",
      headers: { Authorization: "Bearer " + idToken },
      muteHttpExceptions: true,
    }
  );
  if (docRes.getResponseCode() !== 200) {
    throw new Error("Profil pengguna tidak ditemukan/tidak terbaca — hubungi admin untuk cek data users/" + uid + ".");
  }
  let docJson;
  try { docJson = JSON.parse(docRes.getContentText() || "{}"); } catch (e) { docJson = {}; }
  const role = docJson.fields && docJson.fields.role && docJson.fields.role.stringValue;
  if (role !== "guru") {
    throw new Error("Akun ini bukan akun guru — akses ditolak.");
  }
  return uid;
}

const SISWA_HEADERS = [
  "Timestamp",
  "Nama Lengkap",
  "Nama Panggilan",
  "Tempat Lahir",
  "Tanggal Lahir",
  "URL Foto",
];

const HEADERS = [
  "Timestamp",
  "No",
  "Nama Siswa",
  // Emosi & Sosial
  "Adaptasi dengan aturan baru kelas 5",
  "Semangat mencoba lagi setelah kalah/gagal",
  "Percaya diri bicara di depan kelompok",
  "Keberanian berkenalan dengan teman baru",
  "Keterlibatan aktif dalam kegiatan kelompok",
  "Menerima teman yang berbeda karakter/kemampuan",
  "Catatan Emosi & Sosial",
  // Kemandirian & Karakter
  "Kesiapan alat belajar tanpa diingatkan",
  "Inisiatif selesaikan instruksi sederhana",
  "Kerapian barang pribadi",
  "Kepatuhan pada aturan kelas/sekolah",
  "Adab menyapa guru/orang lebih tua",
  "Kejujuran dalam interaksi sehari-hari",
  "Kepedulian spontan saat teman kesulitan",
  "Adab & kelancaran ibadah dasar",
  "Catatan Kemandirian & Karakter",
  // Minat & Gaya Belajar
  "Antusiasme terhadap kegiatan/topik baru",
  "Rasa ingin tahu aktif",
  "Ketelitian mengerjakan aktivitas ringan",
  "Kemandirian mencoba sebelum minta bantuan",
  "Gaya Belajar Dominan",
  "Preferensi Cara Kerja",
  "Bakat/Potensi yang Menonjol",
  "Catatan Minat & Gaya Belajar",
  // Kondisi Fisik
  "Stamina & energi selama kegiatan",
  "Kebiasaan menjaga kebersihan diri",
  "Catatan Kondisi Fisik",
  // Meta
  "Diisi Oleh",
];

const HEADERS_KOGNITIF = [
  "Timestamp",
  "No",
  "Nama Siswa",
  // Literasi Dasar (Membaca)
  "Mengenal dan melafalkan huruf dengan tepat",
  "Membaca kata sederhana dengan lancar",
  "Membaca kalimat pendek dengan lancar dan intonasi tepat",
  "Membaca paragraf pendek tanpa mengeja",
  "Memahami isi bacaan sederhana (dapat menjawab pertanyaan tentang bacaan)",
  "Mampu menceritakan kembali isi bacaan dengan kata-kata sendiri",
  "Catatan Literasi",
  // Numerasi — Penjumlahan
  "Penjumlahan bilangan tanpa teknik menyimpan (mis. 23 + 15)",
  "Penjumlahan bilangan dengan teknik menyimpan (mis. 48 + 37)",
  "Penjumlahan bersusun bilangan 3 digit atau lebih",
  "Kecepatan & ketepatan fakta dasar penjumlahan (1-20)",
  "Catatan Penjumlahan",
  // Numerasi — Pengurangan
  "Pengurangan bilangan tanpa teknik meminjam (mis. 58 - 23)",
  "Pengurangan bilangan dengan teknik meminjam (mis. 52 - 27)",
  "Pengurangan bersusun bilangan 3 digit atau lebih",
  "Kecepatan & ketepatan fakta dasar pengurangan (1-20)",
  "Catatan Pengurangan",
  // Numerasi — Perkalian
  "Hafal perkalian dasar 1-10 (tabel perkalian)",
  "Perkalian bilangan dengan satu angka (mis. 24 x 3)",
  "Perkalian bersusun (mis. 24 x 13)",
  "Memahami konsep perkalian sebagai penjumlahan berulang",
  "Catatan Perkalian",
  // Numerasi — Pembagian
  "Pembagian dasar tanpa sisa (mis. 20 ÷ 4)",
  "Pembagian dengan sisa (mis. 22 ÷ 4)",
  "Pembagian bersusun bilangan 2 digit atau lebih",
  "Memahami konsep pembagian sebagai pengurangan berulang/pembagian rata",
  "Catatan Pembagian",
  // Meta
  "Diisi Oleh",
  // v0.6.0 — Menyimak & Menulis. SENGAJA ditambahkan SETELAH "Diisi Oleh" (di ujung
  // paling akhir array), BUKAN disisipkan di antara kategori-kategori lama di atas —
  // supaya posisi kolom header LAMA di sheet "Data MPLS Kognitif" yang sudah berjalan
  // tidak pernah bergeser. Kalau header baru disisipkan di tengah, label kolom akan
  // pindah posisi tapi data yang SUDAH tersimpan di baris-baris lama tidak ikut pindah
  // — nilai lama jadi salah tempat. Menambah di ujung = 100% aman untuk sheet lama
  // maupun baru (lihat CHANGELOG v0.6.0 untuk detail lengkap).
  //
  // PENTING: kalau sheet "Data MPLS Kognitif" SUDAH ada isinya (bukan sheet baru),
  // header baru ini TIDAK otomatis muncul — tambahkan manual 14 kolom baru berikut
  // (teksnya harus PERSIS sama) di sheet yang sudah berjalan, di kolom paling kanan
  // setelah kolom terakhir yang ada sekarang. Lihat apps-script/README.md.
  //
  // Menyimak & Mengikuti Instruksi
  "Memperhatikan guru berbicara tanpa perlu diingatkan berulang kali",
  "Memahami instruksi lisan sederhana (1 langkah) dan langsung melaksanakannya dengan benar",
  "Memahami dan mengikuti instruksi lisan bertahap (2-3 langkah berurutan) dengan benar",
  "Mampu mengulang/menjelaskan kembali inti instruksi yang baru didengar dengan kata-kata sendiri",
  "Mampu memilah informasi penting dari penjelasan lisan yang lebih panjang (mis. bisa menyebutkan poin-poin utamanya)",
  "Bertahan menyimak dengan fokus selama penjelasan/instruksi berlangsung (tidak mudah teralih)",
  "Catatan Menyimak",
  // Menulis & Meringkas
  "Menulis huruf/kata dengan bentuk yang terbaca jelas (kerapian bukan fokus utama, keterbacaan yang utama)",
  "Mencatat poin-poin penting dari penjelasan guru secara mandiri (tanpa didikte kata per kata)",
  "Menulis rangkuman singkat (1-3 kalimat) dari suatu penjelasan/bacaan dengan kata-kata sendiri",
  "Menyelesaikan catatan/tugas tulis dalam waktu yang wajar (tidak tertinggal jauh dari teman sekelas)",
  "Memahami maksud instruksi/kriteria tugas tertulis (mis. rubrik penilaian) dan tahu apa yang harus dilakukan untuk mendapat nilai baik",
  "Menuliskan jawaban/tugas sesuai dengan apa yang diminta instruksi (bukan asal menulis)",
  "Catatan Menulis",
];

const HEADERS_JURNAL = [
  "Timestamp",
  "No",
  "Nama Siswa",
  "Aktivitas",
  // Struktur & Isi Tulisan
  "Menuliskan pokok pikiran dengan urutan yang jelas (awal - tengah - akhir)",
  "Isi tulisan sesuai momen yang diminta (saat perjalanan / di taman / saat kembali)",
  "Kalimat cukup runtut dan mudah dipahami",
  "Menuliskan detail konkret, bukan hanya satu-dua kata",
  "Catatan Tulisan",
  // Kemandirian & Regulasi Diri
  "Mengisi jurnal di ketiga momen (perjalanan, di taman, kembali) tanpa terus diingatkan",
  "Mengatur sendiri waktu menulis di sela aktivitas",
  "Menyelesaikan seluruh isian tanpa bantuan penuh dari guru/teman",
  "Catatan Kemandirian",
  // Bukti/contoh tulisan asli siswa
  "Cuplikan Tulisan Siswa",
  // Meta
  "Diisi Oleh",
];

function getSheet_() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

/** Jalankan SEKALI dari editor Apps Script (pilih fungsi ini → Run) untuk inisialisasi sheet + header. */
function setupSheet() {
  const sheet = getSheet_();
  sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
  sheet.setFrozenRows(1);
  Logger.log("Sheet siap: " + sheet.getName());
}

function getSheetKognitif_() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = ss.getSheetByName(SHEET_NAME_KOGNITIF);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME_KOGNITIF);
    sheet.getRange(1, 1, 1, HEADERS_KOGNITIF.length).setValues([HEADERS_KOGNITIF]);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

/** Jalankan SEKALI dari editor Apps Script untuk inisialisasi sheet "Data MPLS Kognitif" + header. */
function setupSheetKognitif() {
  const sheet = getSheetKognitif_();
  sheet.getRange(1, 1, 1, HEADERS_KOGNITIF.length).setValues([HEADERS_KOGNITIF]);
  sheet.setFrozenRows(1);
  Logger.log("Sheet siap: " + sheet.getName());
}

function getSheetJurnal_() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = ss.getSheetByName(SHEET_NAME_JURNAL);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME_JURNAL);
    sheet.getRange(1, 1, 1, HEADERS_JURNAL.length).setValues([HEADERS_JURNAL]);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

/** Jalankan SEKALI dari editor Apps Script untuk inisialisasi sheet "Data Jurnal Aktivitas" + header. */
function setupSheetJurnal() {
  const sheet = getSheetJurnal_();
  sheet.getRange(1, 1, 1, HEADERS_JURNAL.length).setValues([HEADERS_JURNAL]);
  sheet.setFrozenRows(1);
  Logger.log("Sheet siap: " + sheet.getName());
}

function getSiswaSheet_() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = ss.getSheetByName(SISWA_SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SISWA_SHEET_NAME);
    sheet.getRange(1, 1, 1, SISWA_HEADERS.length).setValues([SISWA_HEADERS]);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

/** Jalankan SEKALI dari editor Apps Script untuk inisialisasi sheet "Data Siswa" + header. */
function setupSiswaSheet() {
  const sheet = getSiswaSheet_();
  sheet.getRange(1, 1, 1, SISWA_HEADERS.length).setValues([SISWA_HEADERS]);
  sheet.setFrozenRows(1);
  Logger.log("Sheet siap: " + sheet.getName());
}

/** Baca baris header (baris 1) apa adanya dari sheet — SUMBER KEBENARAN untuk urutan kolom,
 * bukan konstanta HEADERS/SISWA_HEADERS/HEADERS_KOGNITIF. Ini supaya baca/tulis tetap benar
 * walau urutan kolom di spreadsheet fisik berbeda dari urutan di kode (mis. karena sheet
 * dibuat/diedit manual sebelum kode ini ada). */
function readHeaderRow_(sheet) {
  const lastCol = sheet.getLastColumn();
  if (lastCol < 1) return [];
  return sheet.getRange(1, 1, 1, lastCol).getValues()[0];
}

/** Kalau Google Sheets otomatis mendeteksi sebuah sel sebagai tanggal (jadi objek Date saat
 * dibaca), ubah jadi teks "yyyy-MM-dd" yang konsisten supaya selalu bisa ditampilkan di web. */
function normalizeCell_(value) {
  if (Object.prototype.toString.call(value) === "[object Date]" && !isNaN(value)) {
    return Utilities.formatDate(value, Session.getScriptTimeZone() || "GMT+7", "yyyy-MM-dd");
  }
  return value;
}

function jsonOut_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

/** Cari baris berdasarkan NAMA KOLOM (dibaca dari header asli sheet), bukan indeks tetap. */
function findRowByColumn_(sheet, colName, value) {
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return -1;
  const headerRow = readHeaderRow_(sheet);
  const colIdx = headerRow.indexOf(colName) + 1;
  if (colIdx < 1) return -1;
  const values = sheet.getRange(2, colIdx, lastRow - 1, 1).getValues();
  for (let i = 0; i < values.length; i++) {
    if (String(values[i][0]).trim() === String(value).trim()) return i + 2;
  }
  return -1;
}

function findRowByName_(sheet, nama) {
  // Dipertahankan sebagai alias untuk kompatibilitas kalau ada kode lama yang memanggilnya.
  return findRowByColumn_(sheet, "Nama Siswa", nama);
}

/** Baca 1 baris jadi object {namaKolom: nilai}, mengikuti header ASLI sheet (bukan konstanta). */
function readRowAsObject_(sheet, row) {
  const headerRow = readHeaderRow_(sheet);
  const values = sheet.getRange(row, 1, 1, headerRow.length).getValues()[0];
  const obj = {};
  headerRow.forEach((h, i) => { if (h) obj[h] = normalizeCell_(values[i]); });
  return obj;
}

/** Susun array nilai 1 baris SESUAI URUTAN KOLOM ASLI di sheet, dari sebuah object
 * {namaKolom: nilai} — supaya tulis selalu ke kolom yang benar walau urutan berbeda
 * dari konstanta HEADERS di kode. */
function buildRowByHeaders_(sheet, recordObj) {
  const headerRow = readHeaderRow_(sheet);
  return headerRow.map((h) => (recordObj[h] !== undefined ? recordObj[h] : ""));
}

/** Simpan gambar base64 ke folder Drive yang sudah ditentukan, kembalikan URL-nya.
 * Melempar error apa adanya kalau gagal — biar pemanggil (doPostSiswa_) yang memutuskan
 * bagaimana menanganinya (supaya kegagalan foto tidak menggagalkan seluruh data siswa). */
function simpanFotoKeDrive_(base64Data, mimeType, namaFile) {
  const folder = DriveApp.getFolderById(FOTO_FOLDER_ID);
  const bytes = Utilities.base64Decode(base64Data);
  const blob = Utilities.newBlob(bytes, mimeType || "image/jpeg", namaFile || "foto-siswa.jpg");
  const file = folder.createFile(blob);
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  // "thumbnail?id=...&sz=..." jauh lebih reliable dipakai langsung sebagai <img src>
  // dibanding "uc?id=..." yang kadang menampilkan halaman interstitial Drive, bukan gambarnya.
  return "https://drive.google.com/thumbnail?id=" + file.getId() + "&sz=w1000";
}

/**
 * v0.5.3 — PERBAIKAN AKAR MASALAH foto tidak tampil (lihat CHANGELOG untuk detail lengkap).
 *
 * Kenapa 3-format fallback di v0.5.2 (lh3.googleusercontent.com, thumbnail?id=, uc?export=view)
 * TETAP gagal semua walau file sudah "Anyone with the link": ketiganya adalah cara meng-HOTLINK
 * file Drive langsung dari domain Google sebagai pengunjung ANONIM (tanpa sesi login Google).
 * Google membatasi/memblokir pola hotlink anonim semacam ini secara tidak konsisten (kadang
 * jalan, kadang muncul halaman "Sepertinya Anda tidak berwenang..." alih-alih gambar) — ini di
 * luar kendali kode aplikasi, terlepas dari izin sharing file sudah benar sekalipun.
 *
 * Solusi sesungguhnya: JANGAN andalkan hotlink Drive sama sekali. Sebagai gantinya, Apps Script
 * Web App ini sendiri yang membaca byte file (berjalan sebagai akun PEMILIK script yang punya
 * akses penuh & sah ke file, bukan sebagai pengunjung anonim) lalu mengirim byte gambarnya
 * langsung sebagai respons HTTP — persis seperti server gambar biasa. Endpoint: `?foto=<id>`.
 * <img src> di browser tidak butuh CORS untuk ini (beda dengan fetch/XHR), jadi aman dipakai
 * langsung sebagai src.
 */
function serveFotoBinary_(fileIdOrUrl) {
  try {
    const id = ekstrakIdFotoDrive_(fileIdOrUrl);
    if (!id) throw new Error("ID foto tidak valid: " + fileIdOrUrl);
    const file = DriveApp.getFileById(id);
    return file.getBlob();
  } catch (err) {
    // Sengaja TIDAK melempar exception mentah (yang akan tampil sebagai halaman error Apps
    // Script dengan status 200 + HTML) — dikembalikan sebagai teks biasa supaya jelas saat
    // di-debug manual, dan tetap memicu `onerror` di <img> milik browser (bukan gambar valid)
    // sehingga foto-fallback.js otomatis lanjut ke kandidat URL berikutnya.
    return ContentService.createTextOutput("Foto tidak ditemukan/gagal dibaca: " + String(err))
      .setMimeType(ContentService.MimeType.TEXT);
  }
}

/** Duplikat sengaja dari extractDriveFileId() di assets/js/foto-fallback.js (sisi klien) —
 * Code.gs tidak boleh bergantung pada file JS front-end, jadi logika ekstraksi ID yang sama
 * ditulis ulang di sini. Kalau salah satu diubah, ubah juga yang satunya. */
function ekstrakIdFotoDrive_(urlOrId) {
  if (!urlOrId) return null;
  const str = String(urlOrId).trim();
  let m = str.match(/[?&]id=([a-zA-Z0-9_-]{10,})/);
  if (m) return m[1];
  // Format link "Bagikan"/"Get link" standar Google Drive (.../file/d/ID/view?...) — v0.5.4.
  m = str.match(/\/d\/([a-zA-Z0-9_-]{10,})/);
  if (m) return m[1];
  if (/^[a-zA-Z0-9_-]{10,}$/.test(str)) return str;
  return null;
}

/**
 * JALANKAN FUNGSI INI SECARA MANUAL (sekali saja) dari editor Apps Script kalau
 * muncul error "Exception: Access denied: DriveApp" saat upload foto dari web.
 *
 * Kenapa perlu: izin Spreadsheet dan izin Drive adalah 2 hal TERPISAH di Google.
 * Web App selalu berjalan sebagai akun pemilik script ("Execute as: Me"), tapi
 * akun itu baru benar-benar "menyetujui" pemakaian sebuah layanan (mis. Drive)
 * kalau pernah menjalankan kode yang memakai layanan itu LANGSUNG dari editor
 * dan mengklik "Allow/Izinkan" di dialog yang muncul. Deploy ulang saja TIDAK
 * cukup untuk memicu dialog izin baru.
 *
 * Cara pakai:
 * 1. Di dropdown fungsi (toolbar atas editor Apps Script), pilih "otorisasiAksesDrive"
 * 2. Klik Run (▶️)
 * 3. Akan muncul dialog "Authorization required" → Review permissions
 * 4. Pilih akun Google Anda → Advanced/Lanjutan → "Buka (nama proyek) (tidak aman)" → Allow/Izinkan
 * 5. Cek log (View > Logs / Ctrl+Enter) — kalau muncul nama folder, berarti berhasil
 * 6. Coba lagi upload foto dari web — seharusnya sudah tidak error lagi
 *    (tidak perlu deploy ulang untuk ini, izin ini melekat ke akun, bukan ke deployment)
 */
function otorisasiAksesDrive() {
  const folder = DriveApp.getFolderById(FOTO_FOLDER_ID);
  Logger.log("Berhasil! Nama folder foto siswa: " + folder.getName());
}

function sheetToObjects_(sheet) {
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return [];
  const headerRow = readHeaderRow_(sheet);
  const rows = sheet.getRange(2, 1, lastRow - 1, headerRow.length).getValues();
  return rows
    .filter((row) => row.some((cell) => cell !== "" && cell !== null))
    .map((row) => {
      const obj = {};
      headerRow.forEach((h, i) => { if (h) obj[h] = normalizeCell_(row[i]); });
      return obj;
    });
}

function doGet(e) {
  const params = (e && e.parameter) || {};

  // Proxy foto siswa — LAPIS GURU (bukan JSON, lihat serveFotoBinary_()).
  // Sengaja TIDAK melempar/mengembalikan JSON kalau verifikasi gagal — dikembalikan
  // sebagai teks biasa (status 200) supaya <img onerror> tetap jalan sebagaimana
  // mestinya dan lanjut ke kandidat berikutnya, bukan patah karena respons aneh.
  if (params.foto) {
    try {
      wajibGuru_(params.idToken);
    } catch (err) {
      return ContentService.createTextOutput("Akses ditolak: " + err.message)
        .setMimeType(ContentService.MimeType.TEXT);
    }
    return serveFotoBinary_(params.foto);
  }

  try {
    if (params.siswa) {
      wajibGuru_(params.idToken);
      return jsonOut_({ data: sheetToObjects_(getSiswaSheet_()) });
    }

    if (params.allKognitif) {
      wajibGuru_(params.idToken);
      return jsonOut_({ data: sheetToObjects_(getSheetKognitif_()) });
    }

    if (params.namaKognitif) {
      wajibKodeAkses_(params.kode);
      const sheet = getSheetKognitif_();
      const row = findRowByColumn_(sheet, "Nama Siswa", params.namaKognitif);
      if (row === -1) return jsonOut_({ found: false });
      return jsonOut_({ found: true, data: readRowAsObject_(sheet, row) });
    }

    if (params.allJurnal) {
      wajibGuru_(params.idToken);
      return jsonOut_({ data: sheetToObjects_(getSheetJurnal_()) });
    }

    if (params.namaJurnal) {
      wajibKodeAkses_(params.kode);
      const sheet = getSheetJurnal_();
      const row = findRowByColumn_(sheet, "Nama Siswa", params.namaJurnal);
      if (row === -1) return jsonOut_({ found: false });
      return jsonOut_({ found: true, data: readRowAsObject_(sheet, row) });
    }

    if (params.all) {
      wajibGuru_(params.idToken);
      return jsonOut_({ data: sheetToObjects_(getSheet_()) });
    }

    // Health-check tanpa parameter apa pun — tidak mengandung data siswa, jadi
    // sengaja tidak digerbang supaya tetap gampang dites dari browser.
    if (!params.nama) {
      return jsonOut_({ status: "MPLS backend aktif", sheet: SHEET_NAME });
    }

    wajibKodeAkses_(params.kode);
    const sheet = getSheet_();
    const row = findRowByColumn_(sheet, "Nama Siswa", params.nama);
    if (row === -1) return jsonOut_({ found: false });
    return jsonOut_({ found: true, data: readRowAsObject_(sheet, row) });
  } catch (err) {
    return jsonOut_({ status: "error", message: String(err.message || err) });
  }
}

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);

    if (body.type === "siswa") {
      // LAPIS GURU — profil siswa (nama, TTL, foto) hanya boleh ditulis akun guru.
      wajibGuru_(body.idToken);
      return doPostSiswa_(body);
    }

    if (body.type === "mpls_kognitif") {
      wajibKodeAkses_(body.kode);
      const sheet = getSheetKognitif_();
      body["Timestamp"] = new Date();
      const existingRow = findRowByColumn_(sheet, "Nama Siswa", body["Nama Siswa"]);
      const rowValues = buildRowByHeaders_(sheet, body);
      if (existingRow === -1) {
        sheet.appendRow(rowValues);
      } else {
        sheet.getRange(existingRow, 1, 1, rowValues.length).setValues([rowValues]);
      }
      return jsonOut_({ status: "ok" });
    }

    if (body.type === "jurnal") {
      wajibKodeAkses_(body.kode);
      const sheet = getSheetJurnal_();
      body["Timestamp"] = new Date();
      const existingRow = findRowByColumn_(sheet, "Nama Siswa", body["Nama Siswa"]);
      const rowValues = buildRowByHeaders_(sheet, body);
      if (existingRow === -1) {
        sheet.appendRow(rowValues);
      } else {
        sheet.getRange(existingRow, 1, 1, rowValues.length).setValues([rowValues]);
      }
      return jsonOut_({ status: "ok" });
    }

    // default: data penilaian MPLS non-kognitif (perilaku lama tidak diubah, hanya
    // ditambah gerbang kode akses)
    wajibKodeAkses_(body.kode);
    const sheet = getSheet_();
    body["Timestamp"] = new Date();
    const existingRow = findRowByColumn_(sheet, "Nama Siswa", body["Nama Siswa"]);
    const rowValues = buildRowByHeaders_(sheet, body);
    if (existingRow === -1) {
      sheet.appendRow(rowValues);
    } else {
      sheet.getRange(existingRow, 1, 1, rowValues.length).setValues([rowValues]);
    }
    return jsonOut_({ status: "ok" });
  } catch (err) {
    return jsonOut_({ status: "error", message: String(err) });
  }
}

/** Simpan/perbarui profil siswa (nama, panggilan, TTL) + opsional foto baru ke Drive.
 * PENTING: kalau upload foto gagal (mis. izin Drive belum di-otorisasi ulang setelah
 * deploy baru), data teks (nama/panggilan/TTL) TETAP tersimpan — hanya foto yang gagal,
 * dan itu diberi tahu lewat field "fotoWarning" di respons (bukan bikin seluruh
 * penyimpanan gagal seperti sebelumnya). */
function doPostSiswa_(body) {
  const sheet = getSiswaSheet_();
  const namaLengkap = String(body["Nama Lengkap"] || "").trim();
  if (!namaLengkap) {
    return jsonOut_({ status: "error", message: "Nama Lengkap wajib diisi" });
  }

  const existingRow = findRowByColumn_(sheet, "Nama Lengkap", namaLengkap);
  const headerRow = readHeaderRow_(sheet);
  const fotoColIdx = headerRow.indexOf("URL Foto") + 1;

  // v0.5.4: deteksi dini kalau header "URL Foto" tidak ketemu PERSIS di baris 1 sheet
  // "Data Siswa" (mis. ada spasi tambahan atau beda huruf besar/kecil karena pernah diedit
  // manual). TANPA pengecekan ini, foto tetap berhasil terupload ke Drive (jadi tampak
  // "berhasil"), tapi URL-nya diam-diam TIDAK PERNAH tersimpan ke kolom manapun — karena
  // buildRowByHeaders_() hanya menulis nilai ke kolom yang namanya cocok PERSIS dengan
  // "URL Foto". Ini gejala tepat yang dilaporkan: foto ada di folder Drive, tidak ada pesan
  // error, tapi kolom "URL Foto" tetap kosong di spreadsheet.
  const headerUrlFotoBermasalah = fotoColIdx <= 0;

  function fotoLamaJikaAda() {
    if (existingRow !== -1 && fotoColIdx > 0) {
      return sheet.getRange(existingRow, fotoColIdx).getValue();
    }
    return "";
  }

  let urlFoto = body["URL Foto"] || "";
  let fotoWarning = "";
  if (body.fotoBase64) {
    try {
      const namaFile = namaLengkap.replace(/[^a-zA-Z0-9]+/g, "_") + "_" + new Date().getTime();
      urlFoto = simpanFotoKeDrive_(body.fotoBase64, body.fotoMime, namaFile);
    } catch (fotoErr) {
      fotoWarning = "Data siswa tersimpan, tapi foto GAGAL diunggah: " + String(fotoErr);
      urlFoto = fotoLamaJikaAda();
    }
  } else if (!urlFoto) {
    urlFoto = fotoLamaJikaAda();
  }

  if (headerUrlFotoBermasalah && (body.fotoBase64 || urlFoto)) {
    fotoWarning = (fotoWarning ? fotoWarning + " " : "") +
      'PERINGATAN: header kolom "URL Foto" tidak ditemukan PERSIS di baris 1 sheet "Data ' +
      'Siswa" (cek kemungkinan beda spasi/huruf besar-kecil). Foto mungkin sudah diproses, ' +
      "tapi URL-nya TIDAK akan tersimpan ke kolom manapun sampai nama header diperbaiki " +
      'jadi persis "URL Foto".';
  }

  const record = {
    "Timestamp": new Date(),
    "Nama Lengkap": namaLengkap,
    "Nama Panggilan": body["Nama Panggilan"] || "",
    "Tempat Lahir": body["Tempat Lahir"] || "",
    "Tanggal Lahir": body["Tanggal Lahir"] || "",
    "URL Foto": urlFoto,
  };
  const rowValues = buildRowByHeaders_(sheet, record);

  if (existingRow === -1) {
    sheet.appendRow(rowValues);
  } else {
    sheet.getRange(existingRow, 1, 1, rowValues.length).setValues([rowValues]);
  }
  return jsonOut_({ status: "ok", urlFoto: urlFoto, fotoWarning: fotoWarning });
}
