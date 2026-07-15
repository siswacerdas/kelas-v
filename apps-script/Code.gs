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
  const m = str.match(/[?&]id=([a-zA-Z0-9_-]{10,})/);
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

  // Proxy foto siswa — lihat komentar lengkap di serveFotoBinary_() untuk alasannya.
  if (params.foto) {
    return serveFotoBinary_(params.foto);
  }

  if (params.siswa) {
    const sheet = getSiswaSheet_();
    return jsonOut_({ data: sheetToObjects_(sheet) });
  }

  if (params.allKognitif) {
    const sheet = getSheetKognitif_();
    return jsonOut_({ data: sheetToObjects_(sheet) });
  }

  if (params.namaKognitif) {
    const sheet = getSheetKognitif_();
    const row = findRowByColumn_(sheet, "Nama Siswa", params.namaKognitif);
    if (row === -1) {
      return jsonOut_({ found: false });
    }
    return jsonOut_({ found: true, data: readRowAsObject_(sheet, row) });
  }

  if (params.allJurnal) {
    const sheet = getSheetJurnal_();
    return jsonOut_({ data: sheetToObjects_(sheet) });
  }

  if (params.namaJurnal) {
    const sheet = getSheetJurnal_();
    const row = findRowByColumn_(sheet, "Nama Siswa", params.namaJurnal);
    if (row === -1) {
      return jsonOut_({ found: false });
    }
    return jsonOut_({ found: true, data: readRowAsObject_(sheet, row) });
  }

  if (params.all) {
    const sheet = getSheet_();
    return jsonOut_({ data: sheetToObjects_(sheet) });
  }

  if (!params.nama) {
    return jsonOut_({ status: "MPLS backend aktif", sheet: SHEET_NAME });
  }
  const sheet = getSheet_();
  const row = findRowByColumn_(sheet, "Nama Siswa", params.nama);
  if (row === -1) {
    return jsonOut_({ found: false });
  }
  return jsonOut_({ found: true, data: readRowAsObject_(sheet, row) });
}

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);

    if (body.type === "siswa") {
      return doPostSiswa_(body);
    }

    if (body.type === "mpls_kognitif") {
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

    // default: data penilaian MPLS non-kognitif (perilaku lama, tidak diubah)
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
