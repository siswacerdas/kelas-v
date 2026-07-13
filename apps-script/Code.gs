/**
 * Code.gs — Backend MPLS untuk Google Apps Script
 *
 * Cara pakai: lihat apps-script/README.md di repo ini.
 *
 * Ringkasan endpoint:
 * - doPost(e)  : { type: "mpls" (default) } -> upsert 1 baris nilai MPLS per siswa.
 *                { type: "siswa" }          -> upsert 1 baris profil siswa (+ opsional foto ke Drive).
 * - doGet(e)   : ?nama=...   -> 1 baris data MPLS siswa tsb (untuk input.html).
 *                ?all=1      -> SEMUA baris data MPLS (untuk rekap.html/laporan.html).
 *                ?siswa=1    -> SEMUA baris data profil siswa (untuk pages/kelas/).
 * - setupSheet() / setupSiswaSheet(): jalankan SEKALI secara manual dari editor
 *                Apps Script (pilih fungsi lalu Run) untuk membuat sheet + header.
 *
 * PENTING setelah mengubah file ini: deploy ulang sebagai "New version" dari
 * deployment yang SAMA (Deploy > Manage deployments > pensil > New version),
 * supaya APPS_SCRIPT_URL yang sudah dipakai di config.js tidak berubah.
 * Saat re-deploy, Apps Script akan minta otorisasi izin Drive tambahan — klik
 * Allow/Izinkan (dibutuhkan untuk fitur simpan foto siswa).
 */

const SPREADSHEET_ID = "1G-LWyOSyCKLP10RU234grIR_5-iWxLSG-6vZP3sKUkA";
const SHEET_NAME = "Data MPLS";
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

function jsonOut_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function findRowByColumn_(sheet, headers, colName, value) {
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return -1;
  const colIdx = headers.indexOf(colName) + 1;
  const values = sheet.getRange(2, colIdx, lastRow - 1, 1).getValues();
  for (let i = 0; i < values.length; i++) {
    if (String(values[i][0]).trim() === String(value).trim()) return i + 2;
  }
  return -1;
}

function findRowByName_(sheet, nama) {
  return findRowByColumn_(sheet, HEADERS, "Nama Siswa", nama);
}

/** Simpan gambar base64 ke folder Drive yang sudah ditentukan, kembalikan URL-nya. */
function simpanFotoKeDrive_(base64Data, mimeType, namaFile) {
  const folder = DriveApp.getFolderById(FOTO_FOLDER_ID);
  const bytes = Utilities.base64Decode(base64Data);
  const blob = Utilities.newBlob(bytes, mimeType || "image/jpeg", namaFile || "foto-siswa.jpg");
  const file = folder.createFile(blob);
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  return "https://drive.google.com/uc?id=" + file.getId();
}

function sheetToObjects_(sheet, headers) {
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return [];
  const rows = sheet.getRange(2, 1, lastRow - 1, headers.length).getValues();
  return rows
    .filter((row) => row.some((cell) => cell !== "" && cell !== null))
    .map((row) => {
      const obj = {};
      headers.forEach((h, i) => { obj[h] = row[i]; });
      return obj;
    });
}

function doGet(e) {
  const params = (e && e.parameter) || {};

  if (params.siswa) {
    const sheet = getSiswaSheet_();
    return jsonOut_({ data: sheetToObjects_(sheet, SISWA_HEADERS) });
  }

  if (params.all) {
    const sheet = getSheet_();
    return jsonOut_({ data: sheetToObjects_(sheet, HEADERS) });
  }

  if (!params.nama) {
    return jsonOut_({ status: "MPLS backend aktif", sheet: SHEET_NAME });
  }
  const sheet = getSheet_();
  const row = findRowByName_(sheet, params.nama);
  if (row === -1) {
    return jsonOut_({ found: false });
  }
  const values = sheet.getRange(row, 1, 1, HEADERS.length).getValues()[0];
  const data = {};
  HEADERS.forEach((h, i) => { data[h] = values[i]; });
  return jsonOut_({ found: true, data: data });
}

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);

    if (body.type === "siswa") {
      return doPostSiswa_(body);
    }

    // default: data penilaian MPLS (perilaku lama, tidak diubah)
    const sheet = getSheet_();
    body["Timestamp"] = new Date();
    const rowValues = HEADERS.map((h) => (body[h] !== undefined ? body[h] : ""));
    const existingRow = findRowByName_(sheet, body["Nama Siswa"]);
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

/** Simpan/perbarui profil siswa (nama, panggilan, TTL) + opsional foto baru ke Drive. */
function doPostSiswa_(body) {
  const sheet = getSiswaSheet_();
  const namaLengkap = String(body["Nama Lengkap"] || "").trim();
  if (!namaLengkap) {
    return jsonOut_({ status: "error", message: "Nama Lengkap wajib diisi" });
  }

  const existingRow = findRowByColumn_(sheet, SISWA_HEADERS, "Nama Lengkap", namaLengkap);

  let urlFoto = body["URL Foto"] || "";
  if (body.fotoBase64) {
    const namaFile = namaLengkap.replace(/[^a-zA-Z0-9]+/g, "_") + "_" + new Date().getTime();
    urlFoto = simpanFotoKeDrive_(body.fotoBase64, body.fotoMime, namaFile);
  } else if (existingRow !== -1 && !urlFoto) {
    // pertahankan foto lama kalau tidak upload foto baru
    const colIdx = SISWA_HEADERS.indexOf("URL Foto") + 1;
    urlFoto = sheet.getRange(existingRow, colIdx).getValue();
  }

  const record = {
    "Timestamp": new Date(),
    "Nama Lengkap": namaLengkap,
    "Nama Panggilan": body["Nama Panggilan"] || "",
    "Tempat Lahir": body["Tempat Lahir"] || "",
    "Tanggal Lahir": body["Tanggal Lahir"] || "",
    "URL Foto": urlFoto,
  };
  const rowValues = SISWA_HEADERS.map((h) => record[h] !== undefined ? record[h] : "");

  if (existingRow === -1) {
    sheet.appendRow(rowValues);
  } else {
    sheet.getRange(existingRow, 1, 1, rowValues.length).setValues([rowValues]);
  }
  return jsonOut_({ status: "ok", urlFoto: urlFoto });
}
