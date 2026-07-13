/**
 * Code.gs — Backend MPLS untuk Google Apps Script
 *
 * Cara pakai: lihat apps-script/README.md di repo ini.
 *
 * Ringkasan:
 * - doPost(e)  : menerima data dari input.html, menyimpan 1 baris per siswa
 *                (upsert: kalau nama sudah ada, baris itu di-update, bukan dobel).
 * - doGet(e)   : ?nama=... mengembalikan data siswa yang sudah tersimpan
 *                (dipakai form untuk memuat ulang isian saat nama dipilih).
 * - setupSheet(): jalankan SEKALI secara manual dari editor Apps Script
 *                untuk membuat sheet "Data MPLS" beserta header kolomnya.
 */

const SPREADSHEET_ID = "1G-LWyOSyCKLP10RU234grIR_5-iWxLSG-6vZP3sKUkA";
const SHEET_NAME = "Data MPLS";

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

function jsonOut_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function findRowByName_(sheet, nama) {
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return -1;
  const nameColIdx = HEADERS.indexOf("Nama Siswa") + 1;
  const names = sheet.getRange(2, nameColIdx, lastRow - 1, 1).getValues();
  for (let i = 0; i < names.length; i++) {
    if (String(names[i][0]).trim() === String(nama).trim()) return i + 2;
  }
  return -1;
}

function doGet(e) {
  const params = (e && e.parameter) || {};
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
