/**
 * Code.gs — Backend MPLS untuk Google Apps Script
 *
 * Cara pakai: lihat apps-script/README.md di repo ini.
 *
 * Ringkasan endpoint:
 * - doPost(e)  : { type: "mpls" (default) }   -> upsert 1 baris nilai MPLS non-kognitif per siswa.
 *                { type: "siswa" }            -> simpan/perbarui 1 profil siswa (+ opsional foto ke
 *                Drive) — SEJAK MIGRASI FIRESTORE (RANCANGAN-MIGRASI-FIRESTORE.md), disimpan di
 *                koleksi Firestore "siswa/{nisn}" (NISN = ID dokumen), BUKAN sheet lagi. NISN wajib
 *                diisi & 10 digit.
 *                { type: "siswa_nisn_bulk" }  -> isi/perbaiki NISN utk banyak siswa sekaligus (lihat
 *                doPostSiswaNisnBulk_()); nama divalidasi ke SISWA_NAMA_VALID_ (roster resmi).
 *                { type: "siswa_login" }      -> verifikasi nama+NISN utk login siswa (Fase 2 Login,
 *                doPostSiswaLogin_()). TANPA gerbang wajibGuru_ (dipanggil sebelum ada sesi Auth
 *                sama sekali) — respons cuma ok/gagal, tidak pernah membocorkan data profil.
 *                { type: "mpls_kognitif" }    -> upsert 1 baris nilai asesmen kognitif per siswa.
 *                { type: "jurnal" }           -> upsert 1 baris nilai asesmen menulis (jurnal aktivitas) per siswa.
 *                { type: "infografis" }       -> TAMBAH 1 baris baru media Galeri Visual (gambar ke Drive,
 *                atau tautan video) — lihat doPostInfografis_(). Beda dari "siswa" yang upsert (1 baris per
 *                nama), di sini SELALU menambah baris baru karena 1 mapel bisa punya banyak media.
 *                { type: "infografis_hapus" } -> hapus 1 baris Galeri Visual berdasarkan ID (lihat catatan
 *                di doPostInfografisHapus_() soal kenapa file Drive-nya SENGAJA tidak ikut dihapus).
 *                { type: "progres_materi" }   -> upsert 1 baris "sudah dibaca" (Nama Siswa + Materi Slug)
 *                di sheet "Data Progres Materi" — dikirim materi-progress-tracker.js, fire-and-forget,
 *                TANPA gerbang (siswa mengirim sendiri saat baca materi, bukan lewat guru/orang tua).
 * - doGet(e)   : ?nama=...        -> 1 baris data MPLS non-kognitif siswa tsb (untuk input.html).
 *                ?all=1           -> SEMUA baris data MPLS non-kognitif (untuk rekap.html/laporan.html).
 *                ?siswa=1         -> SEMUA profil siswa (untuk pages/kelas/) — dari Firestore
 *                koleksi "siswa" sejak migrasi (getAllSiswaFirestore_()), bukan sheet lagi.
 *                ?foto=<id atau URL Drive> -> PROXY: mengirim BYTE gambar foto siswa langsung
 *                (bukan JSON) — dipakai sebagai <img src> lewat assets/js/foto-fallback.js,
 *                supaya tidak bergantung pada hotlink Drive yang sering diblokir Google untuk
 *                pengunjung anonim. Lihat komentar di serveFotoBinary_() (baru sejak v0.5.3).
 *                ?namaKognitif=.. -> 1 baris data kognitif siswa tsb (untuk input-kognitif.html).
 *                ?allKognitif=1   -> SEMUA baris data kognitif (untuk rekap-kognitif.html/laporan-kognitif.html).
 *                ?namaJurnal=..   -> 1 baris data jurnal siswa tsb (untuk input-jurnal.html).
 *                ?allJurnal=1     -> SEMUA baris data jurnal (untuk rekap-jurnal.html/laporan-jurnal.html).
 *                ?infografis=1    -> SEMUA baris Galeri Visual (untuk pages/infografis.html & galeri.html).
 *                TIDAK digerbang wajibGuru_ (beda dari ?siswa=1) — kontennya materi belajar untuk
 *                dibaca siswa juga, sensitivitasnya setara Materi Ajar (pages/materi.html), yang juga
 *                cuma digerbang login-apa-saja di klien, bukan verifikasi server. Lihat juga catatan
 *                yang sama di serveInfografisBinary_().
 *                ?infografisFoto=<id atau URL Drive> -> PROXY byte gambar Galeri Visual, sama seperti
 *                ?foto= tapi TANPA gerbang wajibGuru_ (lihat serveInfografisBinary_()).
 *                ?laporanSiswa=1&nama=..&idToken=.. -> gabungan Profil+MPLS+Kognitif+Jurnal 1 siswa
 *                (untuk pages/laporan-siswa/mpls.html) — digerbang wajibAksesLaporan_() (BUKAN wajibGuru_),
 *                supaya guru boleh lihat siapa saja TAPI akun "orangtua" hanya bisa lihat anaknya
 *                sendiri (field "anak" di Firestore users/{uid}). Lihat RANCANGAN-LAPORAN-SISWA.md.
 *                ?progresMateri=1&nama=..&idToken=.. -> SEMUA baris "Data Progres Materi" milik 1 siswa
 *                (untuk pages/laporan-siswa/belajar-mandiri.html) — gerbang SAMA dengan ?laporanSiswa=1
 *                (wajibAksesLaporan_(), bukan endpoint terpisah dari sisi keamanan, cuma sheet beda).
 * - setupSheet() / setupSiswaSheet() / setupSheetKognitif() / setupSheetJurnal() / setupInfografisSheet():
 *                jalankan SEKALI secara manual dari editor Apps Script (pilih fungsi lalu Run) untuk
 *                membuat sheet + header.
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

const INFOGRAFIS_SHEET_NAME = "Data Infografis";
// ID folder Drive KHUSUS untuk gambar/poster/infografis — SATU FOLDER PER MATA PELAJARAN
// (bukan 1 folder untuk semuanya), supaya guru bisa menelusuri file langsung dari Drive per
// mapel kalau perlu. Nama key di sini HARUS PERSIS SAMA dengan field "mapel" pada
// pages/infografis/assets/infografis-data.js (window.INFOGRAFIS_MAPEL).
// Cara siapkan folder yang belum ada ID-nya (masih "GANTI_..."): buat folder baru di Google
// Drive, klik kanan > Share > Bagikan ke "siapa saja yang punya link" dengan akses "Editor",
// lalu salin ID-nya dari URL folder (bagian setelah "/folders/"). Lihat juga
// apps-script/README.md bagian "Folder Drive untuk Galeri Visual".
const INFOGRAFIS_FOLDER_IDS = {
  "Bahasa Indonesia": "1C01-Asd9Lp9ExtY7uN7PIm-CRcrgPg79",
  "Matematika": "1Gqt5NR85ABiPgMkdL8tCMYXN08NKjsUI",
  "IPAS": "19r-2ApSUxO-2A5H1KGNNKVdeYZHsVBY4",
  "Pendidikan Agama Islam": "GANTI_DENGAN_ID_FOLDER_DRIVE_PAI",
  "Pendidikan Pancasila": "1itEtnUcHnSAD2QOtUjvrTssKeP6Uuws4",
  "Seni Budaya": "1aAl3z9yt3PumyHRhSD87u9K4pOfskSaF",
  "PJOK": "GANTI_DENGAN_ID_FOLDER_DRIVE_PJOK",
  "Bahasa Inggris": "GANTI_DENGAN_ID_FOLDER_DRIVE_BAHASA_INGGRIS",
};

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
const FIRESTORE_BASE_URL_ = "https://firestore.googleapis.com/v1/projects/" + FIREBASE_PROJECT_ID + "/databases/(default)/documents/";

/* ══════════════════════════════════════════════════════════════════════
 * MIGRASI FIRESTORE — "Data Siswa" (RANCANGAN-MIGRASI-FIRESTORE.md)
 * Koleksi "siswa/{nisn}" DIBACA/DITULIS pakai kredensial Service Account
 * (BUKAN idToken pengguna seperti verifikasiUser_() di atas), supaya cek
 * NISN saat login siswa (SEBELUM ada sesi Firebase Auth sama sekali) tetap
 * bisa jalan tanpa NISN pernah terekspos ke klien lewat Firestore Rules.
 * Kredensialnya BUKAN di sini — diambil dari Script Properties
 * (SERVICE_ACCOUNT_EMAIL, SERVICE_ACCOUNT_KEY), diisi manual oleh guru lewat
 * Apps Script Editor > Project Settings, TIDAK PERNAH ikut ke GitHub.
 *
 * KARENA jalur ini melewati Firestore Security Rules sepenuhnya (diatur IAM,
 * bukan Rules), SEMUA endpoint yang menulis/menghapus koleksi "siswa" WAJIB
 * tetap digerbang wajibGuru_() di doPost() — kalau lupa dipasang di endpoint
 * baru, siapa pun yang tahu URL Apps Script bisa baca/tulis SEMUA data siswa
 * tanpa login sama sekali. Lihat ANTIREGRESI.md §30.
 * ══════════════════════════════════════════════════════════════════════ */

/** Ambil access token Service Account (di-cache 55 menit — token asli berlaku
 * 1 jam — supaya tidak menandatangani JWT baru & memanggil oauth2.googleapis.com
 * di SETIAP request, cukup sekali per ~55 menit per instance Apps Script). */
function getServiceAccountToken_() {
  const cache = CacheService.getScriptCache();
  const cached = cache.get("sa_access_token");
  if (cached) return cached;

  const props = PropertiesService.getScriptProperties();
  const email = props.getProperty("SERVICE_ACCOUNT_EMAIL");
  const rawKey = props.getProperty("SERVICE_ACCOUNT_KEY");
  if (!email || !rawKey) {
    throw new Error(
      'Script Properties "SERVICE_ACCOUNT_EMAIL"/"SERVICE_ACCOUNT_KEY" belum diisi — ' +
      "lihat RANCANGAN-MIGRASI-FIRESTORE.md §1."
    );
  }
  // \n literal (2 karakter) dari isian Script Properties -> baris baru sungguhan,
  // dibutuhkan Utilities.computeRsaSha256Signature() untuk membaca PEM key ini.
  const privateKey = rawKey.replace(/\\n/g, "\n");

  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "RS256", typ: "JWT" };
  const claimSet = {
    iss: email,
    scope: "https://www.googleapis.com/auth/datastore",
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600,
  };
  const base64url_ = (obj) => Utilities.base64EncodeWebSafe(JSON.stringify(obj)).replace(/=+$/, "");
  const toSign = base64url_(header) + "." + base64url_(claimSet);
  const signatureBytes = Utilities.computeRsaSha256Signature(toSign, privateKey);
  const signature = Utilities.base64EncodeWebSafe(signatureBytes).replace(/=+$/, "");
  const jwt = toSign + "." + signature;

  const res = UrlFetchApp.fetch("https://oauth2.googleapis.com/token", {
    method: "post",
    contentType: "application/x-www-form-urlencoded",
    payload: {
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    },
    muteHttpExceptions: true,
  });
  let json;
  try { json = JSON.parse(res.getContentText() || "{}"); } catch (e) { json = {}; }
  if (!json.access_token) {
    throw new Error("Gagal mendapat token Service Account: " + res.getContentText());
  }
  cache.put("sa_access_token", json.access_token, 55 * 60);
  return json.access_token;
}

/** Panggilan REST Firestore generik pakai token Service Account. `path`
 * relatif terhadap koleksi dokumen (mis. "siswa/0169932726" atau "siswa"). */
function firestoreFetch_(path, method, bodyObj) {
  const token = getServiceAccountToken_();
  const options = {
    method: method || "get",
    headers: { Authorization: "Bearer " + token },
    muteHttpExceptions: true,
  };
  if (bodyObj !== undefined) {
    options.contentType = "application/json";
    options.payload = JSON.stringify(bodyObj);
  }
  const res = UrlFetchApp.fetch(FIRESTORE_BASE_URL_ + path, options);
  const text = res.getContentText();
  let json = null;
  try { json = text ? JSON.parse(text) : null; } catch (e) { /* biarkan null, pemanggil cek code */ }
  return { code: res.getResponseCode(), json: json, text: text };
}

function firestoreValue_(v) {
  if (v instanceof Date) return { timestampValue: v.toISOString() };
  if (typeof v === "number") {
    return Number.isInteger(v) ? { integerValue: String(v) } : { doubleValue: v };
  }
  if (typeof v === "boolean") return { booleanValue: v };
  if (Array.isArray(v)) return { arrayValue: { values: v.map(firestoreValue_) } };
  return { stringValue: String(v === undefined || v === null ? "" : v) };
}
function firestoreFieldsFromObj_(obj) {
  const fields = {};
  Object.keys(obj).forEach((k) => { fields[k] = firestoreValue_(obj[k]); });
  return fields;
}
function objFromFirestoreFields_(fields) {
  const obj = {};
  if (!fields) return obj;
  Object.keys(fields).forEach((k) => {
    const v = fields[k];
    obj[k] = v.stringValue !== undefined ? v.stringValue
      : v.timestampValue !== undefined ? v.timestampValue
      : v.integerValue !== undefined ? Number(v.integerValue)
      : v.doubleValue !== undefined ? Number(v.doubleValue)
      : v.booleanValue !== undefined ? v.booleanValue
      : "";
  });
  return obj;
}

/** doc.name berbentuk ".../documents/siswa/{nisn}" -> ambil NISN dari situ
 * (bukan dari field, karena NISN memang dipakai sebagai ID dokumen). */
function nisnDariNamaDokumen_(docName) {
  const parts = String(docName).split("/");
  return parts[parts.length - 1];
}

function siswaObjDariDokumenFirestore_(doc) {
  const f = objFromFirestoreFields_(doc.fields);
  return {
    "Nama Lengkap": f.nama || "",
    "Nama Panggilan": f.namaPanggilan || "",
    "Tempat Lahir": f.tempatLahir || "",
    "Tanggal Lahir": f.tanggalLahir || "",
    "URL Foto": f.urlFoto || "",
    "NISN": nisnDariNamaDokumen_(doc.name),
  };
}

/** SEMUA profil siswa tersimpan di Firestore (dipakai ?siswa=1 & pencarian nama
 * saat login/pendaftaran — koleksi ini kecil, ~25-40 dokumen, jadi baca-semua-
 * lalu-filter di Apps Script lebih sederhana & cukup murah dibanding menyusun
 * structured query REST Firestore untuk tiap kebutuhan pencarian berbeda). */
function getAllSiswaFirestore_() {
  const hasil = [];
  let pageToken = "";
  do {
    const qs = "pageSize=300" + (pageToken ? "&pageToken=" + encodeURIComponent(pageToken) : "");
    const r = firestoreFetch_("siswa?" + qs, "get");
    if (r.code !== 200) throw new Error("Gagal membaca daftar siswa dari Firestore: " + r.text);
    (r.json.documents || []).forEach((doc) => hasil.push(siswaObjDariDokumenFirestore_(doc)));
    pageToken = (r.json && r.json.nextPageToken) || "";
  } while (pageToken);
  return hasil;
}

function getSiswaByNisnFirestore_(nisn) {
  const r = firestoreFetch_("siswa/" + encodeURIComponent(nisn), "get");
  if (r.code === 404) return null;
  if (r.code !== 200) throw new Error("Gagal membaca profil siswa dari Firestore: " + r.text);
  return siswaObjDariDokumenFirestore_(r.json);
}

/** Sama seperti getSiswaByNisnFirestore_ tapi cari berdasarkan field "nama"
 * (dipakai ?laporanSiswa=1 yang menerima nama, bukan NISN, dari klien). */
function getSiswaByNamaFirestore_(nama) {
  const doc = cariDokumenSiswaByNama_(nama);
  return doc ? siswaObjDariDokumenFirestore_(doc) : null;
}

/** Simpan/perbarui 1 dokumen siswa. PATCH tanpa updateMask MENIMPA SELURUH
 * dokumen (bukan merge sebagian) — sengaja begitu di sini karena pemanggil
 * (doPostSiswa_) selalu menyusun objek record LENGKAP sebelum memanggil ini,
 * persis prinsip yang sama dengan buildRowByHeaders_() di versi Sheets. */
function setSiswaFirestore_(nisn, record) {
  const r = firestoreFetch_("siswa/" + encodeURIComponent(nisn), "patch", {
    fields: firestoreFieldsFromObj_(record),
  });
  if (r.code !== 200) throw new Error("Gagal menyimpan profil siswa ke Firestore: " + r.text);
}

function deleteSiswaFirestore_(nisn) {
  const r = firestoreFetch_("siswa/" + encodeURIComponent(nisn), "delete");
  if (r.code !== 200 && r.code !== 404) throw new Error("Gagal menghapus dokumen siswa lama: " + r.text);
}

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
 * valid, DAN kembalikan profil akunnya dari Firestore (koleksi users/{uid}):
 * { uid, role, anak }. "anak" adalah array nama lengkap siswa (field khusus
 * akun role "orangtua" — lihat RANCANGAN-LAPORAN-SISWA.md §3), kosong untuk
 * role lain. TIDAK menolak berdasarkan role apa pun di sini — itu tanggung
 * jawab pemanggil (wajibGuru_, wajibAksesLaporan_, dst.), fungsi ini cuma
 * "siapa akun ini & apa datanya", supaya logika REST call ke Google (Identity
 * Toolkit + Firestore) tidak perlu ditulis ulang di tiap fungsi wajibXxx_.
 *
 * Dua langkah, keduanya lewat REST API Google (Apps Script tidak butuh
 * library/dependency tambahan untuk ini):
 *  1. Identity Toolkit `accounts:lookup` — pastikan idToken valid & belum
 *     kedaluwarsa/dipalsukan, dan dapatkan uid pemiliknya.
 *  2. Firestore REST `GET users/{uid}` — dipanggil dengan idToken sebagai
 *     Bearer token (BUKAN kredensial service account), memanfaatkan rule
 *     Firestore yang sudah ada di README ("pemilik boleh baca dokumennya
 *     sendiri"). Ambil field "role" (dan "anak" kalau ada) dari situ.
 * Melempar Error dengan pesan jelas kalau gagal di langkah manapun; pemanggil
 * yang menentukan bagaimana pesan itu ditampilkan.
 */
function verifikasiUser_(idToken) {
  if (!idToken) throw new Error("Sesi login tidak ditemukan — silakan login ulang.");

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
  const fields = docJson.fields || {};
  const role = fields.role && fields.role.stringValue;

  // Field "anak" disimpan Firestore sebagai arrayValue -> { values: [{stringValue: "..."}] }
  // — parsing manual karena ini REST API mentah, bukan SDK Firestore yang otomatis
  // menerjemahkan tipe data.
  const anak = [];
  if (fields.anak && fields.anak.arrayValue && fields.anak.arrayValue.values) {
    fields.anak.arrayValue.values.forEach((v) => {
      if (v && v.stringValue) anak.push(v.stringValue);
    });
  }

  return { uid: uid, role: role, anak: anak };
}

/** Sama seperti sebelumnya secara perilaku (pesan error & nilai kembalian
 * SENGAJA dijaga persis sama supaya tidak jadi regresi terhadap §25 di
 * ANTIREGRESI.md) — sekarang tinggal lapisan tipis di atas verifikasiUser_(). */
function wajibGuru_(idToken) {
  if (!idToken) throw new Error("Sesi login guru tidak ditemukan — silakan login ulang.");
  const info = verifikasiUser_(idToken);
  if (info.role !== "guru") {
    throw new Error("Akun ini bukan akun guru — akses ditolak.");
  }
  return info.uid;
}

/**
 * Gerbang KHUSUS untuk endpoint Laporan Siswa (lihat RANCANGAN-LAPORAN-SISWA.md).
 * BEDA PRINSIP dari wajibGuru_(): endpoint guru yang sudah ada sengaja TIDAK
 * dibatasi cakupannya (guru memang boleh lihat semua siswa). Endpoint laporan
 * untuk ORANG TUA WAJIB dibatasi HANYA ke anak yang terdaftar di field "anak"
 * milik akunnya sendiri — kalau tidak, orang tua bisa saja minta data siswa
 * LAIN dengan mengubah parameter "nama" di URL dan tetap dikabulkan. Ini celah
 * privasi serius (data anak-anak), jadi SENGAJA dibuat fungsi terpisah,
 * BUKAN reuse wajibGuru_ yang tidak punya konsep "cakupan".
 * Guru tetap boleh akses siapa saja (tidak berubah dari perilaku endpoint lain). */
function wajibAksesLaporan_(idToken, namaSiswa) {
  const info = verifikasiUser_(idToken);
  if (info.role === "guru") return;
  if (info.role === "orangtua" && info.anak.indexOf(namaSiswa) !== -1) return;
  throw new Error('Akun ini tidak punya akses ke data siswa "' + namaSiswa + '".');
}

const SISWA_HEADERS = [
  "Timestamp",
  "Nama Lengkap",
  "Nama Panggilan",
  "Tempat Lahir",
  "Tanggal Lahir",
  "URL Foto",
  // v1.0 (RANCANGAN-LOGIN-BARU.md): NISN dipakai sebagai "kata sandi" login siswa.
  // WAJIB diformat "Teks biasa" di Google Sheets (Format > Angka > Teks biasa) —
  // kalau dibiarkan format Angka, NISN yang diawali "0" akan kehilangan nol di
  // depannya (mis. "0169932726" jadi 169932726) dan siswa itu tidak akan pernah
  // bisa login karena tidak akan pernah cocok dengan yang dia ketik.
  "NISN",
];

// "ID" dipakai sebagai kunci hapus dari galeri.html/admin.html — TIDAK pakai "Judul" seperti
// SISWA_HEADERS pakai "Nama Lengkap", karena judul infografis boleh saja duplikat/mirip
// antar-unggahan, sedangkan tiap baris di sini harus bisa dirujuk secara pasti.
const INFOGRAFIS_HEADERS = [
  "Timestamp",
  "ID",
  "Mapel",
  "Materi Slug",   // opsional — diisi HANYA oleh pages/infografis/kelola-tp.html (1 infografis
                    // per materi, upload baru MENIMPA yang lama). Kosong untuk infografis umum
                    // yang diunggah lewat admin.html (tidak terikat 1 materi spesifik).
                    // Nilainya = field "file" di materi-index.js TANPA akhiran ".html" (unik
                    // per materi, sudah ada sebagai sumber tunggal, tidak perlu bikin skema ID
                    // baru).
  "Judul",
  "Keterangan",
  "Jenis Media",   // "gambar" (file diunggah ke Drive) atau "video" (tautan luar, mis. YouTube)
  "URL Media",
  "Diunggah Oleh",
];

const PROGRES_MATERI_SHEET_NAME = "Data Progres Materi";
// "Materi Slug" = field "file" di materi-index.js TANPA akhiran ".html" — sama persis pola
// yang dipakai INFOGRAFIS_HEADERS di atas, konsisten satu sumber kebenaran untuk identitas
// materi di seluruh sistem (bukan skema ID baru).
const PROGRES_MATERI_HEADERS = [
  "Timestamp",     // kapan TERAKHIR dibuka (upsert, lihat doPostProgresMateri_ — bukan log
                    // setiap kunjungan, supaya 1 siswa+1 materi = 1 baris saja)
  "Nama Siswa",
  "Materi Slug",
  "Status",         // saat ini SELALU "Dibaca" — field disediakan untuk kemungkinan status
                    // lebih rinci di masa depan (mis. "Sedang Dibaca"), belum dipakai sekarang
];

const PROGRES_MODUL_SHEET_NAME = "Data Progres Modul";
// "Modul Slug" = bagian setelah titik dua di STORAGE_KEY tiap file modul.html
// (format "modulProgress:<slug>", mis. "modulProgress:mtk-kesetaraan-tp1" -> slug
// "mtk-kesetaraan-tp1") — sudah diverifikasi konsisten di SEMUA 41 file modul.html
// (lihat ANTIREGRESI.md §38), sama pola dgn Materi Slug di atas: satu sumber
// kebenaran yang sudah ada, bukan skema ID baru.
const PROGRES_MODUL_HEADERS = [
  "Timestamp",     // kapan TERAKHIR mencapai halaman terakhir (upsert, sama pola dgn Progres
                    // Materi — 1 siswa+1 modul = 1 baris saja, bukan log tiap kunjungan)
  "Nama Siswa",
  "Modul Slug",
  "Status",         // saat ini SELALU "Selesai" (beda dari materi yang "Dibaca" — modul baru
                    // tercatat kalau BENAR mencapai halaman terakhir, lihat
                    // modul-progress-tracker.js, bukan sekadar dibuka)
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

/** ⚠️ LEGACY sejak migrasi Firestore (RANCANGAN-MIGRASI-FIRESTORE.md) — sheet
 * "Data Siswa" TIDAK LAGI dipakai endpoint `?siswa=1`/`type:"siswa"`/dst.
 * (semua sudah baca/tulis Firestore, lihat getAllSiswaFirestore_() dkk).
 * Fungsi & sheet ini SENGAJA DIPERTAHANKAN (tidak dihapus) HANYA sebagai
 * sumber data untuk migrasiSiswaKeFirestore_() dan cadangan manual sampai
 * Arif yakin semua data sudah cocok di Firestore — boleh dihapus belakangan. */
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

/** ⚠️ LEGACY — lihat catatan di getSiswaSheet_() di atas. */
function setupSiswaSheet() {
  const sheet = getSiswaSheet_();
  sheet.getRange(1, 1, 1, SISWA_HEADERS.length).setValues([SISWA_HEADERS]);
  sheet.setFrozenRows(1);
  Logger.log("Sheet siap: " + sheet.getName());
}

function getInfografisSheet_() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = ss.getSheetByName(INFOGRAFIS_SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(INFOGRAFIS_SHEET_NAME);
    sheet.getRange(1, 1, 1, INFOGRAFIS_HEADERS.length).setValues([INFOGRAFIS_HEADERS]);
    sheet.setFrozenRows(1);
    return sheet;
  }
  // SELF-HEALING — PENTING: sheet ini dipakai sejak sebelum kolom "Materi Slug" ada di
  // INFOGRAFIS_HEADERS. buildRowByHeaders_()/findRowByColumn_() SELALU mencocokkan berdasarkan
  // NAMA kolom yang BENAR-BENAR ADA di baris header sheet (lewat readHeaderRow_()), BUKAN
  // urutan di array INFOGRAFIS_HEADERS di kode. Akibatnya, kalau kode menambah kolom baru
  // (seperti "Materi Slug") tapi baris header di sheet yang SUDAH ADA tidak ikut diperbarui,
  // nilai kolom itu DIAM-DIAM TERBUANG setiap kali disimpan (bukan error, cuma hilang) — ini
  // BUKAN teori, ini akar masalah nyata yang dilaporkan (materi tidak "diingat" sudah punya
  // infografis setelah refresh, walau upload dilaporkan sukses). Supaya masalah SEJENIS tidak
  // terulang tiap kali ada kolom baru ke depannya, cek & tambahkan otomatis kolom yang belum
  // ada di UJUNG KANAN header yang sudah ada (BUKAN disisipkan di tengah — menyisipkan akan
  // menggeser posisi kolom yang sudah ada, butuh menulis ulang SEMUA data; menambah di ujung
  // aman karena kolom lama tidak bergeser sama sekali, dan pencocokan selalu berdasar nama,
  // jadi urutan kolom tidak penting).
  const currentHeaders = readHeaderRow_(sheet);
  const missing = INFOGRAFIS_HEADERS.filter((h) => currentHeaders.indexOf(h) === -1);
  if (missing.length > 0) {
    sheet.getRange(1, currentHeaders.length + 1, 1, missing.length).setValues([missing]);
    Logger.log('Kolom baru ditambahkan otomatis ke "Data Infografis": ' + missing.join(", "));
  }
  return sheet;
}

/** Jalankan SEKALI dari editor Apps Script untuk inisialisasi (atau perbaiki header) sheet
 * "Data Infografis". CATATAN: sejak getInfografisSheet_() jadi self-healing, memanggil fungsi
 * ini SEBENARNYA tidak wajib lagi — dipertahankan sebagai cara manual untuk memicu perbaikan
 * header + memicu dialog izin Drive kalau belum pernah, sama seperti setupSiswaSheet(). TIDAK
 * LAGI menimpa baris header secara mentah (bahaya kalau sheet sudah ada data dengan urutan
 * kolom berbeda) — perbaikan header sepenuhnya diserahkan ke getInfografisSheet_(). */
function setupInfografisSheet() {
  const sheet = getInfografisSheet_();
  sheet.setFrozenRows(1);
  Logger.log("Sheet siap: " + sheet.getName());
}

/** Sama pola self-healing dengan getInfografisSheet_() (lihat komentar panjang di sana untuk
 * alasannya) — dibuat sebagai sheet baru untuk fitur "Perkembangan Belajar Mandiri"
 * (RANCANGAN-LAPORAN-SISWA.md §7.1). Belum diekstrak jadi 1 helper generik dipakai bersama
 * getSiswaSheet_()/getInfografisSheet_() — bisa jadi perbaikan lanjutan kalau nanti nambah
 * sheet self-healing lagi ke-4 kalinya (baru 3 sekarang, belum terlalu mendesak diekstrak). */
function getProgresMateriSheet_() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = ss.getSheetByName(PROGRES_MATERI_SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(PROGRES_MATERI_SHEET_NAME);
    sheet.getRange(1, 1, 1, PROGRES_MATERI_HEADERS.length).setValues([PROGRES_MATERI_HEADERS]);
    sheet.setFrozenRows(1);
    return sheet;
  }
  const currentHeaders = readHeaderRow_(sheet);
  const missing = PROGRES_MATERI_HEADERS.filter((h) => currentHeaders.indexOf(h) === -1);
  if (missing.length > 0) {
    sheet.getRange(1, currentHeaders.length + 1, 1, missing.length).setValues([missing]);
    Logger.log('Kolom baru ditambahkan otomatis ke "Data Progres Materi": ' + missing.join(", "));
  }
  return sheet;
}

/** Sama pola persis dengan getProgresMateriSheet_() di atas, sheet terpisah untuk progres
 * Modul (lihat §38 ANTIREGRESI.md — dibuat belakangan, EXP dari Modul sebelumnya MENYUSUL). */
function getProgresModulSheet_() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = ss.getSheetByName(PROGRES_MODUL_SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(PROGRES_MODUL_SHEET_NAME);
    sheet.getRange(1, 1, 1, PROGRES_MODUL_HEADERS.length).setValues([PROGRES_MODUL_HEADERS]);
    sheet.setFrozenRows(1);
    return sheet;
  }
  const currentHeaders = readHeaderRow_(sheet);
  const missing = PROGRES_MODUL_HEADERS.filter((h) => currentHeaders.indexOf(h) === -1);
  if (missing.length > 0) {
    sheet.getRange(1, currentHeaders.length + 1, 1, missing.length).setValues([missing]);
    Logger.log('Kolom baru ditambahkan otomatis ke "Data Progres Modul": ' + missing.join(", "));
  }
  return sheet;
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

/** Sama seperti findRowByColumn_() tapi mencocokkan DUA kolom sekaligus (harus cocok
 * keduanya) — dibutuhkan untuk "Data Progres Materi" karena "Materi Slug" sendirian TIDAK
 * unik di situ (banyak siswa boleh membaca materi yang sama); kuncinya adalah kombinasi
 * "Nama Siswa" + "Materi Slug". */
function findRowByTwoColumns_(sheet, col1Name, val1, col2Name, val2) {
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return -1;
  const headerRow = readHeaderRow_(sheet);
  const col1Idx = headerRow.indexOf(col1Name) + 1;
  const col2Idx = headerRow.indexOf(col2Name) + 1;
  if (col1Idx < 1 || col2Idx < 1) return -1;
  const col1Values = sheet.getRange(2, col1Idx, lastRow - 1, 1).getValues();
  const col2Values = sheet.getRange(2, col2Idx, lastRow - 1, 1).getValues();
  for (let i = 0; i < col1Values.length; i++) {
    if (String(col1Values[i][0]).trim() === String(val1).trim() &&
        String(col2Values[i][0]).trim() === String(val2).trim()) {
      return i + 2;
    }
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
 * bagaimana menanganinya (supaya kegagalan foto tidak menggagalkan seluruh data siswa).
 *
 * folderId OPSIONAL, default FOTO_FOLDER_ID (perilaku lama, dipakai doPostSiswa_ untuk foto
 * siswa). doPostInfografis_ SELALU mengirim folderId eksplisit (folder per-mapel di
 * INFOGRAFIS_FOLDER_IDS) — PENTING: sebelum parameter ini ada, panggilan dari
 * doPostInfografis_ salah mengunggah ke FOTO_FOLDER_ID (folder foto siswa) karena
 * argumen ke-4 ini belum ada sama sekali. Jangan hilangkan default-nya kalau menambah
 * pemanggil baru — supaya lupa mengirim folderId tetap gagal aman ke folder foto siswa
 * yang sudah pasti valid, bukan folder kosong/undefined. */
function simpanFotoKeDrive_(base64Data, mimeType, namaFile, folderId) {
  const folder = DriveApp.getFolderById(folderId || FOTO_FOLDER_ID);
  const bytes = Utilities.base64Decode(base64Data);
  const blob = Utilities.newBlob(bytes, mimeType || "image/jpeg", namaFile || "foto-siswa.jpg");
  const file = folder.createFile(blob);
  // PENTING: setSharing() dibungkus try/catch SENDIRI, TERPISAH dari createFile() di atas.
  // Kenapa: di sebagian akun Google Workspace (mis. domain sekolah dengan kebijakan admin
  // yang membatasi "berbagi ke siapa saja yang punya link"), createFile() BERHASIL (file
  // benar-benar tersimpan di folder Drive) tapi setSharing() dilempar sebagai
  // "Exception: Akses ditolak: DriveApp" — SEBELUM perbaikan ini, exception itu merambat ke
  // pemanggil (doPostInfografis_ / doPostSiswa_) dan dilaporkan sebagai "gagal", padahal
  // filenya SUDAH ada di Drive (persis gejala yang dilaporkan: file terlihat di folder, tapi
  // situs bilang gagal). Ini AMAN untuk diabaikan (bukan cuma "diam-diam ditutupi") karena
  // proxy ?foto= / ?infografisFoto= (lihat serveFotoBinary_/serveInfografisBinary_) membaca
  // byte file lewat DriveApp sebagai SCRIPT OWNER, bukan lewat link publik — jadi TIDAK
  // butuh sharing "anyone with link" sama sekali untuk berfungsi di situs ini. Sharing publik
  // di sini cuma cadangan untuk kandidat hotlink langsung (lh3.googleusercontent.com dkk).
  try {
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  } catch (sharingErr) {
    Logger.log("setSharing gagal untuk file " + file.getId() + " (diabaikan, proxy tetap jalan): " + sharingErr);
  }
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

/**
 * Proxy byte gambar Galeri Visual — sama persis alasannya dengan serveFotoBinary_() (hindari
 * hotlink Drive anonim yang tidak konsisten diblokir Google), TAPI SENGAJA TANPA wajibGuru_():
 * gambar di sini adalah materi belajar untuk dibaca siswa juga (bukan foto pribadi), jadi levelnya
 * sama dengan Materi Ajar yang juga tidak digerbang verifikasi server. Lihat catatan panjang soal
 * ini di komentar header file (bagian doGet, ?infografis=1).
 */
function serveInfografisBinary_(fileIdOrUrl) {
  try {
    const id = ekstrakIdFotoDrive_(fileIdOrUrl);
    if (!id) throw new Error("ID media tidak valid: " + fileIdOrUrl);
    const file = DriveApp.getFileById(id);
    return file.getBlob();
  } catch (err) {
    return ContentService.createTextOutput("Media tidak ditemukan/gagal dibaca: " + String(err))
      .setMimeType(ContentService.MimeType.TEXT);
  }
}

/** Sama seperti otorisasiAksesDrive() tapi untuk folder-folder Galeri Visual (satu per mapel)
 * — jalankan SEKALI secara manual dari editor Apps Script (pilih fungsi ini, klik Run, klik
 * Allow/Izinkan) kalau muncul error "Access denied: DriveApp" saat mengunggah gambar dari
 * pages/infografis/admin.html. Folder yang ID-nya belum diisi (masih "GANTI_...") dilewati
 * saja (bukan error) — lengkapi INFOGRAFIS_FOLDER_IDS dulu lalu jalankan ulang fungsi ini. */
function otorisasiAksesDriveInfografis() {
  Object.keys(INFOGRAFIS_FOLDER_IDS).forEach((mapel) => {
    const folderId = INFOGRAFIS_FOLDER_IDS[mapel];
    if (!folderId || folderId.indexOf("GANTI_") === 0) {
      Logger.log("Dilewati (belum dikonfigurasi): " + mapel);
      return;
    }
    try {
      const folder = DriveApp.getFolderById(folderId);
      Logger.log("Berhasil! " + mapel + " -> " + folder.getName());
    } catch (err) {
      Logger.log("GAGAL untuk " + mapel + " (ID: " + folderId + "): " + err);
    }
  });
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

  // Proxy gambar Galeri Visual — SENGAJA TANPA wajibGuru_ (lihat serveInfografisBinary_()).
  if (params.infografisFoto) {
    return serveInfografisBinary_(params.infografisFoto);
  }

  try {
    if (params.infografis) {
      // SENGAJA TANPA wajibGuru_ — lihat catatan di komentar header file & serveInfografisBinary_().
      // Filter ?mapel= opsional di sisi server (kalau dikirim); klien (galeri.html) juga boleh
      // memfilter ulang di sisi client, dua-duanya aman karena datanya memang bukan data sensitif.
      const rows = sheetToObjects_(getInfografisSheet_());
      const data = params.mapel ? rows.filter((r) => r["Mapel"] === params.mapel) : rows;
      return jsonOut_({ data: data });
    }

    if (params.siswa) {
      wajibGuru_(params.idToken);
      // Sejak migrasi Firestore (RANCANGAN-MIGRASI-FIRESTORE.md): baca koleksi
      // "siswa" via Service Account, BUKAN sheet lagi. Bentuk respons ke klien
      // (array object dengan key "Nama Lengkap"/"NISN"/dst.) SENGAJA dijaga
      // persis sama seperti versi Sheets, supaya pages/kelas/assets/kelas.js
      // tidak perlu diubah.
      return jsonOut_({ data: getAllSiswaFirestore_() });
    }

    if (params.laporanSiswa) {
      // Lihat RANCANGAN-LAPORAN-SISWA.md untuk desain lengkap fitur ini (Fase 1).
      // "nama" di sini = "Nama Lengkap"/"Nama Siswa" siswa yang mau dilihat laporannya —
      // BUKAN nama akun yang sedang login (bisa guru lihat siapa saja, atau orang tua lihat
      // anaknya sendiri — makanya pakai wajibAksesLaporan_, BUKAN wajibGuru_, lihat catatan
      // panjang di fungsi itu).
      const namaLaporan = params.nama;
      if (!namaLaporan) return jsonOut_({ status: "error", message: 'Parameter "nama" wajib diisi' });
      wajibAksesLaporan_(params.idToken, namaLaporan);

      // Catatan kolom kunci TIDAK seragam antar-sheet (bukan hal baru, sudah begini sejak
      // awal proyek): "Data Siswa" pakai "Nama Lengkap", sheet lain pakai "Nama Siswa".
      // "Data Siswa" sendiri sejak migrasi Firestore sudah tidak lagi di sheet — baca
      // via getSiswaByNamaFirestore_ (helper baru, lihat definisinya).
      function ambilSatuBaris_(sheet, kolomKunci) {
        const row = findRowByColumn_(sheet, kolomKunci, namaLaporan);
        return row === -1 ? null : readRowAsObject_(sheet, row);
      }

      return jsonOut_({
        profil: getSiswaByNamaFirestore_(namaLaporan),
        mpls: ambilSatuBaris_(getSheet_(), "Nama Siswa"),
        mplsKognitif: ambilSatuBaris_(getSheetKognitif_(), "Nama Siswa"),
        jurnal: ambilSatuBaris_(getSheetJurnal_(), "Nama Siswa"),
      });
    }

    if (params.progresMateri) {
      // Untuk laporan "Perkembangan Belajar Mandiri" (Pintu 2) — daftar Materi Slug yang
      // SUDAH dibuka siswa ybs. Sama model akses dengan ?laporanSiswa=1 di atas (guru bebas,
      // orang tua cuma anaknya sendiri) — lihat wajibAksesLaporan_().
      const namaProgres = params.nama;
      if (!namaProgres) return jsonOut_({ status: "error", message: 'Parameter "nama" wajib diisi' });
      wajibAksesLaporan_(params.idToken, namaProgres);
      const rows = sheetToObjects_(getProgresMateriSheet_()).filter((r) => r["Nama Siswa"] === namaProgres);
      return jsonOut_({ data: rows });
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

    if (body.type === "siswa_nisn_bulk") {
      // LAPIS GURU — impor NISN massal (dipakai sekali di awal, dan tiap ada
      // siswa baru per tahun ajaran). Lihat doPostSiswaNisnBulk_() untuk detail.
      wajibGuru_(body.idToken);
      return doPostSiswaNisnBulk_(body);
    }

    if (body.type === "siswa_login") {
      // SENGAJA TANPA gerbang wajibGuru_ — dipanggil SISWA SENDIRI, SEBELUM
      // ada sesi Firebase Auth apa pun (justru fungsi endpoint ini untuk
      // MEMBUAT sesi itu, lewat signInAnonymously() di klien setelah dapat
      // status "ok"). Keamanannya bukan dari gerbang login, tapi dari bentuk
      // responsnya sendiri: lihat doPostSiswaLogin_() — cuma balas ok/gagal,
      // TIDAK PERNAH mengembalikan data profil siswa apa pun, dan membaca
      // Firestore langsung by NISN (bukan list/scan semua), jadi tidak bisa
      // dipakai untuk "menebak-nebak" siapa saja yang terdaftar.
      return doPostSiswaLogin_(body);
    }

    if (body.type === "infografis") {
      // LAPIS GURU — hanya guru yang boleh menambah materi ke Galeri Visual.
      wajibGuru_(body.idToken);
      return doPostInfografis_(body);
    }

    if (body.type === "infografis_hapus") {
      wajibGuru_(body.idToken);
      return doPostInfografisHapus_(body);
    }

    if (body.type === "progres_materi") {
      // SENGAJA TANPA gerbang wajibGuru_/wajibAksesLaporan_ — pengirimnya SISWA sendiri saat
      // membaca materi (lewat materi-progress-tracker.js), bukan guru/orang tua. Sama level
      // keamanannya dengan endpoint MPLS siswa yang sudah ada (mis. doPost type "mpls" biasa) —
      // cukup validasi field wajar, tidak perlu identitas login penuh (materi pages memakai
      // auth-guard.js, bukan role check, jadi tidak ada idToken bermakna untuk digerbang di sini).
      return doPostProgresMateri_(body);
    }

    if (body.type === "progres_modul") {
      // Sama level keamanan & alasan persis dengan "progres_materi" di atas — pengirimnya
      // SISWA sendiri lewat modul-progress-tracker.js saat mencapai halaman terakhir modul.
      return doPostProgresModul_(body);
    }

    if (body.type === "hitung_gamifikasi") {
      // SENGAJA TANPA gerbang — dipanggil siswa sendiri tepat setelah 1 hasil kuis
      // tersimpan ATAU 1 materi ditandai dibaca. TIDAK bisa disalahgunakan untuk
      // menaikkan level/EXP curang: fungsi ini TIDAK PERNAH mempercayai angka
      // level/progress/exp apa pun dari body permintaan, selalu hitung ulang dari
      // nol berdasar `hasil_latihan` + sheet "Data Progres Materi" yang sudah
      // tersimpan (lihat doPostHitungGamifikasi_). Paling buruk yang bisa
      // disalahgunakan: memanggil ini berkali-kali untuk nama siswa lain — tapi
      // hasilnya tetap SAMA PERSIS (fungsinya murni/deterministik dari data
      // sumber), jadi tidak ada manfaat curang dari memanggilnya berulang atau
      // atas nama siswa lain.
      return doPostHitungGamifikasi_(body);
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

/** Salinan daftar 25 nama siswa Kelas 5A — HARUS disinkronkan manual kalau
 * `pages/mpls/assets/mpls-data.js` (MPLS_STUDENTS, sumber aslinya) berubah
 * (mis. tahun ajaran baru). Dipakai di sini SEBAGAI VALIDASI SAJA (menolak
 * nama salah ketik supaya tidak nyangkut jadi dokumen Firestore baru saat
 * impor massal) — Code.gs (server) tidak bisa mengimpor file JS sisi klien
 * secara langsung, makanya disalin, bukan dirujuk. */
const SISWA_NAMA_VALID_ = [
  "Abdurrahman Ar Ribery", "Abyan Nandana Khalif", "Adskhan Ibran Elfatih",
  "Afiya Nur Ataya Sandi", "Aisyah Afqohunnisa", "Akhdan Ziyad",
  "Alam Rayyan Fiyanto", "Arsyila Almahyira Azgefa", "Athifa Nur Pelangi",
  "Fairel Atharizz Calief", "Fatih Pratama Basuki", "Flora Baby Queen",
  "Gilang Aditya Ramadhan", "Ilham Ibrahim", "Inara Huwaida Ardhani",
  "Kinara Adisti Salsabila", "Kirana Hafizah Iqra Nasution", "Latifa Rafanda",
  "Meshya Belliza Utama", "Muhammad Ali Alfarizi", "Nayla Latifa",
  "Quenzino Satria Hadika", "Reynand Pratama", "Shakila Qiyana Shadiqah",
  "Shanum Meyra Rosadi",
];

/** Cari 1 dokumen siswa berdasarkan field "nama" (bukan ID dokumen — ID
 * dokumen di koleksi "siswa" adalah NISN, lihat RANCANGAN-MIGRASI-FIRESTORE.md
 * §2). Baca-semua-lalu-filter (koleksi kecil, murah) — kembalikan dokumen
 * RAW Firestore (bukan bentuk sudah-diterjemahkan) supaya pemanggil bisa
 * ambil field apa pun yang perlu dipertahankan (mis. createdAt, urlFoto). */
function cariDokumenSiswaByNama_(nama) {
  const target = String(nama).trim().toLowerCase();
  let pageToken = "";
  do {
    const qs = "pageSize=300" + (pageToken ? "&pageToken=" + encodeURIComponent(pageToken) : "");
    const r = firestoreFetch_("siswa?" + qs, "get");
    if (r.code !== 200) throw new Error("Gagal mencari data siswa di Firestore: " + r.text);
    const docs = r.json.documents || [];
    for (let i = 0; i < docs.length; i++) {
      const f = objFromFirestoreFields_(docs[i].fields);
      if (String(f.nama || "").trim().toLowerCase() === target) return docs[i];
    }
    pageToken = (r.json && r.json.nextPageToken) || "";
  } while (pageToken);
  return null;
}

/** Simpan/perbarui profil siswa (nama, panggilan, TTL, NISN) + opsional foto baru
 * ke Drive. Sejak migrasi Firestore (RANCANGAN-MIGRASI-FIRESTORE.md), NISN
 * dipakai sebagai ID dokumen — jadi WAJIB diisi & valid 10 digit di sini
 * (beda dari versi Sheets sebelumnya yang membolehkan NISN kosong sementara).
 * PENTING: kalau upload foto gagal (mis. izin Drive belum di-otorisasi ulang
 * setelah deploy baru), data teks TETAP tersimpan — hanya foto yang gagal,
 * diberi tahu lewat field "fotoWarning" di respons. */
function doPostSiswa_(body) {
  const namaLengkap = String(body["Nama Lengkap"] || "").trim();
  if (!namaLengkap) {
    return jsonOut_({ status: "error", message: "Nama Lengkap wajib diisi" });
  }
  const nisn = String(body["NISN"] || "").trim();
  if (!/^\d{10}$/.test(nisn)) {
    return jsonOut_({ status: "error", message: "NISN wajib diisi, harus 10 digit angka." });
  }

  const existingDoc = cariDokumenSiswaByNama_(namaLengkap);
  const existingFields = existingDoc ? objFromFirestoreFields_(existingDoc.fields) : null;
  // Kalau guru mengoreksi NISN yang salah ketik sebelumnya (bukan pertama kali
  // isi), dokumen LAMA (di bawah NISN lama) harus dihapus setelah dokumen BARU
  // berhasil ditulis — supaya tidak ada 2 dokumen (1 salah, 1 benar) nyangkut
  // untuk siswa yang sama.
  const oldNisn = existingDoc ? nisnDariNamaDokumen_(existingDoc.name) : "";

  let urlFoto = body["URL Foto"] || "";
  let fotoWarning = "";
  if (body.fotoBase64) {
    try {
      const namaFile = namaLengkap.replace(/[^a-zA-Z0-9]+/g, "_") + "_" + new Date().getTime();
      urlFoto = simpanFotoKeDrive_(body.fotoBase64, body.fotoMime, namaFile);
    } catch (fotoErr) {
      fotoWarning = "Data siswa tersimpan, tapi foto GAGAL diunggah: " + String(fotoErr);
      urlFoto = existingFields ? (existingFields.urlFoto || "") : "";
    }
  } else if (!urlFoto) {
    urlFoto = existingFields ? (existingFields.urlFoto || "") : "";
  }

  const record = {
    nama: namaLengkap,
    namaPanggilan: body["Nama Panggilan"] || "",
    tempatLahir: body["Tempat Lahir"] || "",
    tanggalLahir: body["Tanggal Lahir"] || "",
    urlFoto: urlFoto,
    createdAt: existingFields && existingFields.createdAt ? new Date(existingFields.createdAt) : new Date(),
    updatedAt: new Date(),
  };
  setSiswaFirestore_(nisn, record);
  if (oldNisn && oldNisn !== nisn) {
    deleteSiswaFirestore_(oldNisn);
  }

  return jsonOut_({ status: "ok", urlFoto: urlFoto, fotoWarning: fotoWarning });
}

/**
 * Impor NISN untuk banyak siswa sekaligus (dipakai form "Impor NISN Massal" di
 * pages/kelas/index.html). body.rows = [{ nama, nisn }, ...].
 *
 * Sejak migrasi Firestore: kalau siswa itu SUDAH punya dokumen (dicari lewat
 * field nama), field lain (foto, TTL, dst.) dipertahankan apa adanya, cuma
 * ID dokumennya yang "pindah" ke NISN baru (dokumen lama dihapus). Kalau
 * BELUM punya dokumen sama sekali, dibuat dokumen baru minimal (nama + NISN
 * saja, field lain kosong, guru bisa lengkapi belakangan lewat form biasa).
 *
 * Nama WAJIB cocok PERSIS (di-trim) dengan salah satu di SISWA_NAMA_VALID_
 * (roster resmi 25 siswa) — mencegah salah ketik nyasar jadi dokumen baru.
 */
function doPostSiswaNisnBulk_(body) {
  const rows = Array.isArray(body.rows) ? body.rows : [];
  const diperbarui = [];
  const tidakDitemukan = [];
  const dilewati = [];

  rows.forEach((r) => {
    const nama = String((r && r.nama) || "").trim();
    const nisnBaru = String((r && r.nisn) || "").trim();
    if (!nama || !nisnBaru) { dilewati.push(r); return; }
    if (!/^\d{10}$/.test(nisnBaru)) {
      tidakDitemukan.push({ nama: nama, nisn: nisnBaru, alasan: "NISN bukan 10 digit angka" });
      return;
    }
    if (SISWA_NAMA_VALID_.indexOf(nama) === -1) {
      tidakDitemukan.push({ nama: nama, nisn: nisnBaru, alasan: "Nama tidak ada di daftar 25 siswa Kelas 5A (cek salah ketik)" });
      return;
    }
    try {
      const existingDoc = cariDokumenSiswaByNama_(nama);
      const existingFields = existingDoc ? objFromFirestoreFields_(existingDoc.fields) : null;
      const oldNisn = existingDoc ? nisnDariNamaDokumen_(existingDoc.name) : "";

      const record = {
        nama: nama,
        namaPanggilan: existingFields ? (existingFields.namaPanggilan || "") : "",
        tempatLahir: existingFields ? (existingFields.tempatLahir || "") : "",
        tanggalLahir: existingFields ? (existingFields.tanggalLahir || "") : "",
        urlFoto: existingFields ? (existingFields.urlFoto || "") : "",
        createdAt: existingFields && existingFields.createdAt ? new Date(existingFields.createdAt) : new Date(),
        updatedAt: new Date(),
      };
      setSiswaFirestore_(nisnBaru, record);
      if (oldNisn && oldNisn !== nisnBaru) deleteSiswaFirestore_(oldNisn);
      diperbarui.push(nama);
    } catch (err) {
      tidakDitemukan.push({ nama: nama, nisn: nisnBaru, alasan: String(err) });
    }
  });

  return jsonOut_({
    status: "ok",
    diperbarui: diperbarui,
    tidakDitemukan: tidakDitemukan,
    dilewati: dilewati.length,
  });
}

/**
 * Verifikasi nama + NISN untuk login siswa (Fase 2, RANCANGAN-LOGIN-BARU.md
 * §2.1). TIDAK menyertakan/mengembalikan data profil siswa apa pun di respons
 * — cuma { status: "ok" } atau { status: "error", message }. Nama tampilan di
 * sisi klien memang diambil dari input nama yang sudah dipilih siswa sendiri
 * dari dropdown (bukan dari respons endpoint ini), lalu disimpan di
 * sessionStorage — sesuai rancangan.
 *
 * SENGAJA baca `siswa/{nisn}` LANGSUNG by ID dokumen (getSiswaByNisnFirestore_),
 * BUKAN scan semua siswa lalu filter nama+nisn — supaya seseorang yang cuma
 * "coba-coba" banyak NISN acak tidak bisa dapat petunjuk apa pun dari pola
 * respons (selalu 1 pembacaan dokumen yang sama biayanya, ada atau tidak).
 */
function doPostSiswaLogin_(body) {
  const nama = String(body.nama || "").trim();
  const nisn = String(body.nisn || "").trim();
  if (!nama || !nisn) {
    return jsonOut_({ status: "error", message: "Nama dan NISN wajib diisi." });
  }
  if (!/^\d{10}$/.test(nisn)) {
    return jsonOut_({ status: "error", message: "NISN harus 10 digit angka." });
  }

  let profil;
  try {
    profil = getSiswaByNisnFirestore_(nisn);
  } catch (err) {
    return jsonOut_({ status: "error", message: "Gagal memverifikasi, coba beberapa saat lagi." });
  }

  const cocok = profil && String(profil["Nama Lengkap"]).trim().toLowerCase() === nama.toLowerCase();
  if (!cocok) {
    // Pesan generik SENGAJA sama baik nama salah, NISN salah, atau keduanya —
    // supaya tidak membocorkan mana yang benar/salah ke orang yang coba-coba.
    return jsonOut_({ status: "error", message: "Nama atau NISN tidak cocok. Periksa lagi ejaan nama & angka NISN." });
  }
  return jsonOut_({ status: "ok" });
}

/**
 * MIGRASI 1x-JALAN — pindahkan seluruh isi sheet "Data Siswa" (Sheets lama)
 * ke koleksi Firestore "siswa/{nisn}". Jalankan MANUAL dari Apps Script Editor
 * (pilih fungsi ini di dropdown → tombol Run) — BUKAN dipanggil dari web app.
 *
 * Baris yang NISN-nya kosong/bukan 10 digit DILEWATI (dilaporkan di Logger),
 * TIDAK menggagalkan baris lain — supaya migrasi bisa dijalankan ulang kapan
 * saja setelah NISN dilengkapi (mis. lewat panel "Impor NISN Massal" versi
 * Sheets yang lama), tanpa menduplikasi baris yang sudah berhasil pindah
 * (upsert berdasarkan NISN — jalan 2x untuk baris yang sama = aman, cuma
 * menimpa dengan data yang sama).
 *
 * Sheet "Data Siswa" TIDAK dihapus oleh fungsi ini — tetap ada sebagai
 * cadangan sampai Arif verifikasi manual semua data cocok di Firebase
 * Console, baru dihapus manual belakangan kalau sudah yakin.
 */
function migrasiSiswaKeFirestore_() {
  const sheet = getSiswaSheet_();
  const rows = sheetToObjects_(sheet);
  let sukses = 0;
  const dilewati = [];

  rows.forEach((row) => {
    const nama = String(row["Nama Lengkap"] || "").trim();
    const nisn = String(row["NISN"] || "").trim();
    if (!nama) return; // baris kosong, lewati diam-diam
    if (!/^\d{10}$/.test(nisn)) {
      dilewati.push(nama + " (NISN: \"" + nisn + "\")");
      return;
    }
    const record = {
      nama: nama,
      namaPanggilan: row["Nama Panggilan"] || "",
      tempatLahir: row["Tempat Lahir"] || "",
      tanggalLahir: row["Tanggal Lahir"] || "",
      urlFoto: row["URL Foto"] || "",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setSiswaFirestore_(nisn, record);
    sukses++;
  });

  Logger.log("Migrasi selesai: " + sukses + " siswa berhasil dipindah ke Firestore.");
  if (dilewati.length) {
    Logger.log(
      "DILEWATI (" + dilewati.length + ", NISN belum valid — jalankan migrasi ulang " +
      "nanti setelah NISN dilengkapi):\n" + dilewati.join("\n")
    );
  } else {
    Logger.log("Semua baris di sheet berhasil dipindah, tidak ada yang dilewati.");
  }
}



/** Simpan ke "Data Infografis". Ada DUA MODE tergantung ada-tidaknya body["Materi Slug"]:
 *
 * MODE A — body["Materi Slug"] KOSONG (dipakai admin.html, infografis umum per-mapel):
 * SELALU TAMBAH baris baru (perilaku lama) — karena 1 mapel wajar punya banyak media, tidak
 * ada "kunci" alami per mapel seperti "Nama Lengkap" di data siswa.
 *
 * MODE B — body["Materi Slug"] TERISI (dipakai pages/infografis/kelola-tp.html, 1 infografis
 * per materi): UPSERT seperti doPostSiswa_ — kalau materi itu SUDAH punya infografis
 * (baris lama ketemu lewat "Materi Slug"), baris lama DITIMPA (bukan ditambah baris baru),
 * dan file Drive lamanya (kalau jenisnya "gambar") DIPINDAH KE TRASH — beda dari
 * doPostInfografisHapus_() yang sengaja tidak menyentuh file Drive: di sini memang tujuannya
 * "1 materi = 1 infografis", jadi versi lama SEHARUSNYA diganti total, bukan ditumpuk. Trash
 * Drive (bukan hapus permanen) tetap dipilih supaya masih bisa dipulihkan manual dalam 30 hari
 * kalau ternyata guru salah unggah.
 *
 * jenisMedia "gambar": body.fotoBase64/fotoMime wajib ada, diunggah ke folder Drive milik
 * mapel tsb (lihat INFOGRAFIS_FOLDER_IDS[mapel]).
 * jenisMedia "video": body["URL Media"] wajib ada (tautan luar, mis. YouTube/Drive), TIDAK ada
 * upload — lihat catatan di pages/infografis/admin.html soal kenapa video tidak diunggah lewat
 * form ini (ukuran file video tidak praktis dikirim sebagai base64 lewat Apps Script). */
function doPostInfografis_(body) {
  const mapel = String(body["Mapel"] || "").trim();
  const judul = String(body["Judul"] || "").trim();
  const jenisMedia = String(body["Jenis Media"] || "").trim();
  const materiSlug = String(body["Materi Slug"] || "").trim();
  if (!mapel) return jsonOut_({ status: "error", message: "Mapel wajib diisi" });
  if (!judul) return jsonOut_({ status: "error", message: "Judul wajib diisi" });
  if (jenisMedia !== "gambar" && jenisMedia !== "video") {
    return jsonOut_({ status: "error", message: 'Jenis Media harus "gambar" atau "video"' });
  }

  const sheet = getInfografisSheet_();
  const existingRow = materiSlug ? findRowByColumn_(sheet, "Materi Slug", materiSlug) : -1;

  let urlMedia = String(body["URL Media"] || "").trim();
  if (jenisMedia === "gambar") {
    if (!body.fotoBase64) return jsonOut_({ status: "error", message: "File gambar wajib diunggah" });
    const folderId = INFOGRAFIS_FOLDER_IDS[mapel];
    if (!folderId || folderId.indexOf("GANTI_") === 0) {
      return jsonOut_({
        status: "error",
        message: 'Folder Drive untuk mapel "' + mapel + '" belum dikonfigurasi. Minta admin ' +
          "mengisi ID folder Drive-nya di INFOGRAFIS_FOLDER_IDS pada Code.gs terlebih dulu " +
          "(lihat apps-script/README.md).",
      });
    }
    try {
      const namaFile = (mapel + "_" + judul).replace(/[^a-zA-Z0-9]+/g, "_") + "_" + new Date().getTime();
      urlMedia = simpanFotoKeDrive_(body.fotoBase64, body.fotoMime, namaFile, folderId);
    } catch (err) {
      return jsonOut_({ status: "error", message: "Gagal mengunggah gambar ke Drive: " + String(err) });
    }
  } else if (!urlMedia) {
    return jsonOut_({ status: "error", message: "URL Media (tautan video) wajib diisi" });
  }

  // MODE B, dan sebuah baris lama untuk materi ini ditemukan: pindahkan file lamanya (kalau
  // gambar) ke Trash Drive SEBELUM menimpa barisnya — supaya "1 materi = 1 infografis" benar
  // terjaga di Drive juga, bukan cuma di sheet. Dibungkus try/catch supaya kegagalan
  // menghapus file lama TIDAK menggagalkan penyimpanan yang baru (baris baru tetap lebih
  // penting daripada rapi-rapi file lama).
  let id = "ig" + new Date().getTime() + Math.floor(Math.random() * 1000);
  if (existingRow !== -1) {
    try {
      const headerRow = readHeaderRow_(sheet);
      const rowValuesLama = sheet.getRange(existingRow, 1, 1, headerRow.length).getValues()[0];
      const idIdx = headerRow.indexOf("ID");
      const jenisIdx = headerRow.indexOf("Jenis Media");
      const urlIdx = headerRow.indexOf("URL Media");
      if (idIdx > -1 && rowValuesLama[idIdx]) id = rowValuesLama[idIdx]; // ID tetap sama, cuma isinya diganti
      if (jenisIdx > -1 && rowValuesLama[jenisIdx] === "gambar" && urlIdx > -1 && rowValuesLama[urlIdx]) {
        const oldFileId = ekstrakIdFotoDrive_(rowValuesLama[urlIdx]);
        if (oldFileId) DriveApp.getFileById(oldFileId).setTrashed(true);
      }
    } catch (cleanupErr) {
      Logger.log("Gagal membersihkan infografis lama untuk materi " + materiSlug + ": " + cleanupErr);
    }
  }

  const record = {
    "Timestamp": new Date(),
    "ID": id,
    "Mapel": mapel,
    "Materi Slug": materiSlug,
    "Judul": judul,
    "Keterangan": body["Keterangan"] || "",
    "Jenis Media": jenisMedia,
    "URL Media": urlMedia,
    "Diunggah Oleh": body["Diunggah Oleh"] || "",
  };
  const rowValues = buildRowByHeaders_(sheet, record);
  if (existingRow !== -1) {
    sheet.getRange(existingRow, 1, 1, rowValues.length).setValues([rowValues]);
  } else {
    sheet.appendRow(rowValues);
  }
  return jsonOut_({ status: "ok", id: id, urlMedia: urlMedia });
}

/** Hapus 1 baris "Data Infografis" berdasarkan ID.
 * SENGAJA TIDAK ikut menghapus file di Drive (DriveApp.getFileById(...).setTrashed(true)
 * bisa saja ditambah di sini) — alasannya supaya "Hapus" dari galeri.html/admin.html adalah
 * aksi yang AMAN untuk dicoba (kalau ternyata salah pilih, file aslinya masih ada di folder
 * Drive dan bisa dipulihkan manual), bukan aksi destruktif yang langsung menghapus file
 * permanen. Guru yang mau benar-benar membersihkan folder Drive bisa lakukan itu langsung
 * dari Drive, terpisah dari situs ini. */
function doPostInfografisHapus_(body) {
  const id = String(body["ID"] || "").trim();
  if (!id) return jsonOut_({ status: "error", message: "ID wajib diisi" });
  const sheet = getInfografisSheet_();
  const row = findRowByColumn_(sheet, "ID", id);
  if (row === -1) return jsonOut_({ status: "error", message: "Data tidak ditemukan (mungkin sudah dihapus)" });
  sheet.deleteRow(row);
  return jsonOut_({ status: "ok" });
}

/** Upsert (bukan selalu tambah baris) berdasarkan kombinasi "Nama Siswa" + "Materi Slug" —
 * 1 siswa + 1 materi = MAKSIMAL 1 baris, ditimpa (Timestamp diperbarui) tiap kali materi itu
 * dibuka lagi, BUKAN menumpuk baris baru setiap kunjungan (kalau tidak, sheet ini akan
 * membengkak sangat cepat — 1 siswa bisa buka 1 materi berkali-kali). Dipanggil dari
 * materi-progress-tracker.js, fire-and-forget — SELALU balas "ok" bahkan kalau field kurang
 * lengkap (siswa yang membuka materi tidak boleh melihat efek apa pun dari endpoint ini,
 * sukses atau gagal; kegagalan cukup diam-diam diabaikan, bukan mengganggu baca materi). */
function doPostProgresMateri_(body) {
  const nama = String(body["Nama Siswa"] || "").trim();
  const slug = String(body["Materi Slug"] || "").trim();
  if (!nama || !slug) return jsonOut_({ status: "ok" }); // diam-diam abaikan, lihat komentar di atas

  const sheet = getProgresMateriSheet_();
  const existingRow = findRowByTwoColumns_(sheet, "Nama Siswa", nama, "Materi Slug", slug);
  const record = {
    "Timestamp": new Date(),
    "Nama Siswa": nama,
    "Materi Slug": slug,
    "Status": "Dibaca",
  };
  const rowValues = buildRowByHeaders_(sheet, record);
  if (existingRow !== -1) {
    sheet.getRange(existingRow, 1, 1, rowValues.length).setValues([rowValues]);
  } else {
    sheet.appendRow(rowValues);
  }
  return jsonOut_({ status: "ok" });
}

/** Sama pola persis dengan doPostProgresMateri_() di atas — bedanya cuma dipanggil dari
 * modul-progress-tracker.js saat siswa MENCAPAI HALAMAN TERAKHIR modul (bukan sekadar
 * membuka), lihat komentar panjang di modul-progress-tracker.js untuk alasannya. */
function doPostProgresModul_(body) {
  const nama = String(body["Nama Siswa"] || "").trim();
  const slug = String(body["Modul Slug"] || "").trim();
  if (!nama || !slug) return jsonOut_({ status: "ok" }); // diam-diam abaikan, sama alasan dgn doPostProgresMateri_

  const sheet = getProgresModulSheet_();
  const existingRow = findRowByTwoColumns_(sheet, "Nama Siswa", nama, "Modul Slug", slug);
  const record = {
    "Timestamp": new Date(),
    "Nama Siswa": nama,
    "Modul Slug": slug,
    "Status": "Selesai",
  };
  const rowValues = buildRowByHeaders_(sheet, record);
  if (existingRow !== -1) {
    sheet.getRange(existingRow, 1, 1, rowValues.length).setValues([rowValues]);
  } else {
    sheet.appendRow(rowValues);
  }
  return jsonOut_({ status: "ok" });
}

/* ═══════════════════ SISTEM LEVEL UJI KEMAMPUAN (belum dirilis) ═══════════════════
 * Lihat CHANGELOG.md untuk latar belakang lengkap. Ringkasan keputusan desain:
 * - Level GLOBAL (gabungan seluruh mapel/TP), BUKAN per-TP — 1 siswa = 1 level.
 * - "Lulus" untuk kenaikan level = skor > ambang level SAAT INI (bukan ambang tetap).
 *   Gagal TIDAK mengurangi/mereset hitungan — cuma tidak menambah (lihat CHANGELOG.md).
 * - Level DIHITUNG ULANG PENUH dari riwayat `hasil_latihan` setiap dipanggil (bukan
 *   disimpan sebagai counter yang di-increment) — supaya levelnya SELALU bisa dibuktikan
 *   benar dari data sumber, tidak mungkin "nyasar" beda dari riwayat sungguhan.
 * - DIHITUNG & DITULIS DI SINI (server, pakai Service Account), BUKAN di klien —
 *   keputusan sadar demi keamanan: siswa login anonim tidak bisa dibuktikan identitasnya
 *   ke Firestore Security Rules, jadi kalau level ditulis langsung dari klien, siswa yang
 *   paham DevTools bisa menaikkan levelnya sendiri secara curang. Menghitung di server
 *   (yang baca `hasil_latihan` APA ADANYA, bukan percaya klaim klien) menutup celah itu.
 *   Firestore Security Rules koleksi `level_siswa` SENGAJA `allow write: if false` untuk
 *   SEMUA klien — cuma Service Account (lewat sini) yang bisa menulis. Lihat firestore.rules.
 */

const LEVEL_TAHAP_ = {
  dasar:    { ambang: 90, butuhLulus: 3, berikutnya: "menengah" },
  menengah: { ambang: 85, butuhLulus: 3, berikutnya: "atas" },
  atas:     { ambang: 80, butuhLulus: 2, berikutnya: "mahir" },
  mahir:    { ambang: 75, butuhLulus: 1, berikutnya: null }, // terminal — lihat catatan di hitungLevelDariRiwayat_
};
const LEVEL_AMBANG_LULUS_UMUM_ = 70; // ambang "lulus" generik untuk statistik total (independen dari level)

/* ── EXP (poin pengalaman) — lihat CHANGELOG.md untuk latar belakang keputusan.
 * Sengaja dari AKTIVITAS YANG SELESAI, BUKAN durasi/waktu dihabiskan — durasi gampang
 * dicurangi (buka tab lalu ditinggal), sedangkan "materi ini sudah dibaca", "modul ini sudah
 * dituntaskan", atau "kuis ini sudah dikerjakan" adalah sinyal yang jauh lebih sulit
 * dipalsukan tanpa benar-benar berinteraksi. Sumber EXP: Materi Ajar (10/materi dibaca),
 * Modul (25/modul dituntaskan sampai halaman terakhir — nilai lebih besar dari materi karena
 * 1 modul mencakup beberapa bagian + beberapa kuis tertanam, jauh lebih banyak usaha
 * dibanding 1 materi; angka ini direkomendasikan Claude, mudah diubah di sini kalau dirasa
 * kurang/lebih pas setelah dipakai beberapa waktu), dan Uji Kemampuan (5/kuis dikerjakan +
 * 10 bonus kalau lulus ≥70%). */
const EXP_PER_MATERI_ = 10;
const EXP_PER_MODUL_ = 25;
const EXP_PER_KUIS_DIKERJAKAN_ = 5;
const EXP_BONUS_KUIS_LULUS_ = 10;

/** Hitung jumlah materi yang sudah "Dibaca" 1 siswa dari sheet "Data Progres Materi".
 * 1 baris = 1 materi (upsert per Nama Siswa + Materi Slug, lihat doPostProgresMateri_),
 * jadi cukup hitung baris yang cocok namanya — tidak perlu deduplikasi lagi di sini. */
function hitungJumlahMateriDibaca_(nama) {
  const target = String(nama).trim().toLowerCase();
  const rows = sheetToObjects_(getProgresMateriSheet_());
  return rows.filter((r) => String(r["Nama Siswa"] || "").trim().toLowerCase() === target).length;
}

/** Sama pola persis dengan hitungJumlahMateriDibaca_() di atas, dari sheet "Data Progres
 * Modul" (1 baris = 1 modul yang sudah mencapai halaman terakhir, upsert per Nama Siswa +
 * Modul Slug, lihat doPostProgresModul_). */
function hitungJumlahModulDiselesaikan_(nama) {
  const target = String(nama).trim().toLowerCase();
  const rows = sheetToObjects_(getProgresModulSheet_());
  return rows.filter((r) => String(r["Nama Siswa"] || "").trim().toLowerCase() === target).length;
}

/* ── LEVEL 1-99 & RANK — lapisan gimmick TAMBAHAN di atas EXP, terpisah dari
 * "Level Kemampuan" (dasar/menengah/atas/mahir) di atas. Bedanya: Level Kemampuan
 * = indikator PENGUASAAN (ketat, cuma naik kalau lulus konsisten). Level 1-99 +
 * Rank = indikator KEAKTIFAN/USAHA (naik terus dari EXP, apa pun aktivitasnya) —
 * supaya siswa selalu punya progres kecil untuk dikejar tiap hari, walau
 * penguasaannya belum naik-naik. Murni FUNGSI dari `exp` yang sudah dihitung di
 * atas — TIDAK butuh sumber data baru, TIDAK butuh pertimbangan keamanan
 * tambahan (exp-nya sendiri sudah dihitung server, turunan dari situ otomatis
 * ikut terpercaya).
 *
 * Kurva EXP per level SENGAJA TIDAK LINEAR — naik cepat di level awal (bikin
 * nagih), makin lambat di level tinggi (bikin Level 99 terasa istimewa/langka):
 * Level 1-10: 15 EXP/level · Level 10-30: 30 EXP/level ·
 * Level 30-60: 60 EXP/level · Level 60-99: 120 EXP/level
 * (total EXP buat tembus Level 99 dari nol: ±7.215 EXP — target realistisnya
 * cuma segelintir siswa paling aktif sepanjang tahun ajaran, itu justru poinnya). */
const EXP_PER_LEVEL99_TAHAP_ = [
  { hinggaLevel: 10, expPerLevel: 15 },
  { hinggaLevel: 30, expPerLevel: 30 },
  { hinggaLevel: 60, expPerLevel: 60 },
  { hinggaLevel: 99, expPerLevel: 120 },
];

// Rentang level -> rank, lihat CHANGELOG.md untuk penamaan & alasan tiap rank.
const RANK_TAHAP_ = [
  { hinggaLevel: 15, rank: "perintis" },
  { hinggaLevel: 30, rank: "penjelajah" },
  { hinggaLevel: 50, rank: "pencari_ilmu" },
  { hinggaLevel: 70, rank: "cendekiawan_muda" },
  { hinggaLevel: 90, rank: "begawan_ilmu" },
  { hinggaLevel: 99, rank: "maestro_kelas_5" },
];

/** Tabel EXP KUMULATIF yang dibutuhkan buat MENCAPAI tiap level (index = level,
 * table[1] = 0 karena semua siswa mulai di Level 1). Dibangun sekali saat file
 * di-load (bukan dihitung ulang tiap panggilan) — 99 elemen, murah dihitung. */
function bangunTabelThresholdLevel99_() {
  const table = [0, 0]; // table[0] tidak dipakai, table[1] = 0
  let cum = 0;
  for (let lvl = 2; lvl <= 99; lvl++) {
    const tahap = EXP_PER_LEVEL99_TAHAP_.filter((t) => lvl <= t.hinggaLevel)[0];
    cum += tahap.expPerLevel;
    table[lvl] = cum;
  }
  return table;
}
const TABEL_THRESHOLD_LEVEL99_ = bangunTabelThresholdLevel99_();

/** Fungsi MURNI — cuma bergantung pada 1 angka `exp`, gampang diperiksa/diuji
 * terpisah. Dipanggil dari doPostHitungGamifikasi_ setelah exp final dihitung. */
function hitungLevel99DanRank_(exp) {
  let level99 = 1;
  for (let lvl = 99; lvl >= 1; lvl--) {
    if (exp >= TABEL_THRESHOLD_LEVEL99_[lvl]) { level99 = lvl; break; }
  }
  const rankTahap = RANK_TAHAP_.filter((t) => level99 <= t.hinggaLevel)[0];
  const expLevelIni = TABEL_THRESHOLD_LEVEL99_[level99];
  const sudahMaksimal = level99 >= 99;
  const expLevelBerikutnya = sudahMaksimal ? null : TABEL_THRESHOLD_LEVEL99_[level99 + 1];
  return {
    level99: level99,
    rank: rankTahap.rank,
    level99Maksimal: sudahMaksimal,
    expProgresLevelIni: exp - expLevelIni,
    expDibutuhkanLevelBerikutnya: sudahMaksimal ? 0 : (expLevelBerikutnya - expLevelIni),
  };
}

/** Ambil SEMUA dokumen hasil_latihan milik 1 nama siswa, urut kronologis (lama -> baru).
 * Pola paging SAMA seperti cariDokumenSiswaByNama_ (baca-semua-lalu-filter) — koleksi ini
 * jauh lebih besar dari `siswa` (bisa ratusan/ribuan dokumen dalam 1 tahun ajaran), TAPI
 * structured query REST Firestore (:runQuery) belum pernah dipakai di proyek ini dan perlu
 * composite index manual di Firebase Console kalau digabung dengan orderBy — paging biasa
 * dipilih supaya TIDAK ADA langkah setup manual tambahan yang diperlukan Arif di Firebase
 * Console selain publish Security Rules yang sudah ada. Kalau nanti data membengkak sangat
 * besar (ribuan siswa/tahun), pola ini perlu diganti structured query + composite index. */
function ambilRiwayatHasilLatihan_(nama) {
  const target = String(nama).trim().toLowerCase();
  const hasil = [];
  let pageToken = "";
  do {
    const qs = "pageSize=300" + (pageToken ? "&pageToken=" + encodeURIComponent(pageToken) : "");
    const r = firestoreFetch_("hasil_latihan?" + qs, "get");
    if (r.code !== 200) throw new Error("Gagal membaca riwayat hasil_latihan: " + r.text);
    (r.json.documents || []).forEach((doc) => {
      const f = objFromFirestoreFields_(doc.fields);
      if (String(f.namaSiswa || "").trim().toLowerCase() === target) {
        hasil.push({ skor: Number(f.skor) || 0, timestamp: f.timestamp || "" });
      }
    });
    pageToken = (r.json && r.json.nextPageToken) || "";
  } while (pageToken);
  hasil.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  return hasil;
}

/** Fungsi MURNI (tidak menyentuh Firestore) — supaya logikanya mudah diperiksa/diuji
 * terpisah dari urusan jaringan. Input: array {skor, timestamp} urut kronologis.
 * Mereplay SELURUH riwayat dari awal setiap dipanggil (lihat catatan arsitektur di atas). */
function hitungLevelDariRiwayat_(riwayat) {
  let level = "dasar";
  let progress = 0;
  let mahirTercapai = false;
  const riwayatLevelUp = []; // {level, padaSkor, waktu} — buat ditampilkan di profil siswa

  let totalLulusUmum = 0;
  let skorTertinggi = 0;
  let totalSkor = 0;
  let expDariKuis = 0;

  riwayat.forEach((r) => {
    totalSkor += r.skor;
    if (r.skor > skorTertinggi) skorTertinggi = r.skor;
    if (r.skor >= LEVEL_AMBANG_LULUS_UMUM_) totalLulusUmum++;
    expDariKuis += EXP_PER_KUIS_DIKERJAKAN_ + (r.skor >= LEVEL_AMBANG_LULUS_UMUM_ ? EXP_BONUS_KUIS_LULUS_ : 0);

    if (mahirTercapai) return; // sudah di puncak, sisa riwayat cuma pengaruhi statistik umum di atas

    const cfg = LEVEL_TAHAP_[level];
    if (r.skor > cfg.ambang) {
      progress++;
      if (progress >= cfg.butuhLulus) {
        if (cfg.berikutnya) {
          level = cfg.berikutnya;
          progress = 0;
        } else {
          mahirTercapai = true; // level tetap "mahir", cuma tandai capaian puncak tercapai
        }
        riwayatLevelUp.push({ level: cfg.berikutnya || "mahir_tercapai", padaSkor: r.skor, waktu: r.timestamp });
      }
    }
    // r.skor <= cfg.ambang: gagal, progress TIDAK berubah (keputusan desain, lihat CHANGELOG.md)
  });

  return {
    level: level,
    progress: progress,
    butuhLulus: LEVEL_TAHAP_[level].butuhLulus,
    ambangLevelIni: LEVEL_TAHAP_[level].ambang,
    mahirTercapai: mahirTercapai,
    totalKuisDikerjakan: riwayat.length,
    totalLulusUmum: totalLulusUmum,
    skorTertinggi: skorTertinggi,
    rataRataSkor: riwayat.length > 0 ? Math.round(totalSkor / riwayat.length) : 0,
    expDariKuis: expDariKuis,
    riwayatLevelUpJson: JSON.stringify(riwayatLevelUp),
  };
}

/** PATCH tanpa updateMask MENIMPA SELURUH dokumen — sengaja begitu (sama prinsip
 * dengan setSiswaFirestore_) karena hitungLevelDariRiwayat_ selalu menghasilkan
 * objek state LENGKAP dari nol, bukan pembaruan sebagian. */
function setLevelSiswaFirestore_(nama, levelData) {
  const record = Object.assign({ namaSiswa: nama, diperbaruiPada: new Date() }, levelData);
  const r = firestoreFetch_("level_siswa/" + encodeURIComponent(nama), "patch", {
    fields: firestoreFieldsFromObj_(record),
  });
  if (r.code !== 200) throw new Error("Gagal menyimpan level siswa ke Firestore: " + r.text);
}

/** Dipanggil klien SEGERA setelah: (a) 1 hasil kuis berhasil tersimpan
 * (uji-kemampuan.html), atau (b) 1 materi berhasil ditandai "Dibaca"
 * (materi-progress-tracker.js). Fire-and-forget dari sudut pandang siswa —
 * TAPI beda dari progres_materi murni, di sini responsnya DIPAKAI klien
 * (untuk animasi "naik level!" & tampilan EXP), jadi error di sini TETAP
 * dibalas apa adanya (bukan selalu "ok") supaya klien tahu kalau gagal dan
 * tidak salah menampilkan status yang keliru ke siswa. */
/** Baca level_siswa/{nama} yang TERSIMPAN SAAT INI (sebelum dihitung ulang) — dipakai
 * doPostHitungGamifikasi_ semata-mata untuk tahu "apakah baru saja naik level PERSIS di
 * panggilan ini", bukan "pernah naik level kapan saja di riwayat". Tanpa ini, karena
 * hitungLevelDariRiwayat_ selalu mereplay SELURUH riwayat dari nol, pesan "🎉 Level naik!"
 * akan MUNCUL SELAMANYA di setiap kuis berikutnya setelah naik level pertama kali (bug nyata
 * yang sempat lolos di Fase 1 — riwayatLevelUpJson tidak pernah "kosong lagi" setelah entri
 * pertama masuk, jadi cek "entri terakhir ada" akan selalu benar). */
function ambilLevelSiswaSaatIni_(nama) {
  const r = firestoreFetch_("level_siswa/" + encodeURIComponent(nama), "get");
  if (r.code !== 200) return { level: "dasar", mahirTercapai: false }; // belum pernah dihitung sama sekali
  const f = objFromFirestoreFields_(r.json.fields);
  return { level: f.level || "dasar", mahirTercapai: !!f.mahirTercapai };
}

function doPostHitungGamifikasi_(body) {
  const nama = String(body.nama || "").trim();
  if (!nama) return jsonOut_({ status: "error", message: "Nama wajib diisi" });
  try {
    const sebelum = ambilLevelSiswaSaatIni_(nama);
    const riwayat = ambilRiwayatHasilLatihan_(nama);
    const levelData = hitungLevelDariRiwayat_(riwayat);
    const jumlahMateriDibaca = hitungJumlahMateriDibaca_(nama);
    const jumlahModulSelesai = hitungJumlahModulDiselesaikan_(nama);
    const exp = jumlahMateriDibaca * EXP_PER_MATERI_ + jumlahModulSelesai * EXP_PER_MODUL_ + levelData.expDariKuis;
    const level99Data = hitungLevel99DanRank_(exp);
    const baruSajaNaikLevel = (levelData.level !== sebelum.level) ||
      (levelData.mahirTercapai && !sebelum.mahirTercapai);
    const dataLengkap = Object.assign({}, levelData, { jumlahMateriDibaca: jumlahMateriDibaca, jumlahModulSelesai: jumlahModulSelesai, exp: exp }, level99Data);
    setLevelSiswaFirestore_(nama, dataLengkap);
    return jsonOut_(Object.assign({ status: "ok", baruSajaNaikLevel: baruSajaNaikLevel }, dataLengkap));
  } catch (err) {
    return jsonOut_({ status: "error", message: String(err) });
  }
}

