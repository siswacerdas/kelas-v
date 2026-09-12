#!/usr/bin/env node
/**
 * bulk-buat-akun-siswa.js
 *
 * Membuat/memperbarui SEMUA akun Firebase Authentication (email + kata sandi)
 * untuk siswa sekaligus dari 1 file CSV, plus dokumen Firestore users/{uid}
 * yang dibutuhkan (nama, role:"siswa", email) — menggantikan cara manual
 * "Firebase Console -> Add user -> salin UID -> Firestore -> buat dokumen"
 * yang sebelumnya harus diulang 1-per-1 untuk tiap siswa (lihat README.md
 * langkah 7 versi lama).
 *
 * DIJALANKAN DI KOMPUTER SENDIRI (bukan di GitHub Pages, bukan di browser) —
 * script ini memakai kredensial Service Account yang punya akses PENUH ke
 * Authentication & Firestore proyek Firebase, JANGAN PERNAH diunggah/dikirim
 * ke mana pun selain dipakai lokal 1x untuk keperluan ini. Lihat README.md
 * di folder ini untuk cara mendapatkan file kredensial itu.
 *
 * ═══════════════════════════ CARA PAKAI ═══════════════════════════
 *   cd scripts
 *   npm install
 *   node bulk-buat-akun-siswa.js --csv=../../login_siswa.csv --key=./serviceAccountKey.json
 *
 * Opsi tambahan:
 *   --dry-run           Cuma tampilkan apa yang AKAN dilakukan, tidak mengubah
 *                        apa pun di Firebase. WAJIB dicoba dulu sebelum
 *                        menjalankan sungguhan, terutama pemakaian PERTAMA.
 *   --update-password   Kalau akun emailnya SUDAH ada di Firebase Auth,
 *                        paksa timpa kata sandinya dengan yang ada di CSV.
 *                        TANPA opsi ini, akun yang sudah ada TIDAK disentuh
 *                        kata sandinya (aman dijalankan ulang kapan saja
 *                        kalau cuma menambah siswa baru, tidak mengganti
 *                        kata sandi siswa lama yang mungkin sudah diganti
 *                        manual).
 *   --allow-unlisted    Izinkan baris CSV dengan "Nama Lengkap" yang TIDAK
 *                        ada di daftar roster resmi (lihat ROSTER_RESMI_ di
 *                        bawah) tetap diproses apa adanya. TANPA opsi ini,
 *                        baris seperti itu DILEWATI + diperingatkan (bukan
 *                        error fatal) — supaya salah ketik nama di CSV tidak
 *                        diam-diam membuat akun dengan nama yang nanti tidak
 *                        pernah cocok dengan progres belajar siswa itu di
 *                        tempat lain (lihat catatan panjang di
 *                        assets/js/siswa-akun.js kenapa ini penting sekali).
 *
 * ═══════════════════════ FORMAT CSV YANG DIHARAPKAN ═══════════════════════
 * Header (urutan kolom bebas, asal NAMA kolom persis sama):
 *   No, Nama Panggilan, Nama Lengkap, Alamat Email, Password Login
 *
 * ═══════════════════════════ AMAN DIJALANKAN ULANG ═══════════════════════
 * Script ini IDEMPOTEN: menjalankannya berkali-kali dengan CSV yang sama
 * tidak membuat akun duplikat (dicek lewat email) dan tidak mengubah kata
 * sandi akun yang sudah ada (kecuali --update-password disebutkan). Aman
 * dipakai juga untuk MENAMBAH 1-2 siswa baru di tengah tahun — cukup taruh
 * baris barunya di CSV yang sama (atau CSV baru berisi cuma siswa itu) lalu
 * jalankan lagi, siswa lama tidak akan ikut berubah.
 */

const fs = require("fs");
const path = require("path");

function parseArgs(argv) {
  const out = { dryRun: false, updatePassword: false, allowUnlisted: false };
  for (const a of argv.slice(2)) {
    if (a === "--dry-run") out.dryRun = true;
    else if (a === "--update-password") out.updatePassword = true;
    else if (a === "--allow-unlisted") out.allowUnlisted = true;
    else if (a.startsWith("--csv=")) out.csv = a.slice("--csv=".length);
    else if (a.startsWith("--key=")) out.key = a.slice("--key=".length);
    else {
      console.error(`Argumen tidak dikenali: ${a}`);
      process.exit(1);
    }
  }
  return out;
}

/**
 * ⚠️ SUMBER KEBENARAN NAMA — WAJIB SAMA PERSIS dengan MPLS_STUDENTS di
 * pages/mpls/assets/mpls-data.js (root repo). Kalau roster kelas berubah
 * (siswa baru/pindah), PERBARUI KEDUA TEMPAT itu bersamaan — kalau tidak,
 * script ini akan (secara aman, lihat --allow-unlisted di atas) MELEWATI
 * baris siswa yang belum ada di sini alih-alih membuat akun dengan nama
 * yang nanti tidak akan pernah cocok ke progres belajarnya di tempat lain.
 */
const ROSTER_RESMI_ = [
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

function normalisasiNama_(s) {
  return String(s || "").replace(/\s+/g, "").toLowerCase();
}

const ROSTER_BY_NORM_ = new Map(ROSTER_RESMI_.map((n) => [normalisasiNama_(n), n]));

/** Parser CSV sangat sederhana (tanpa dependency) — cukup untuk file rapi
 * seperti export Google Sheets/Excel standar. TIDAK menangani koma di dalam
 * field bertanda kutip yang rumit — kalau CSV sumbernya punya itu, buka dulu
 * di Google Sheets -> File -> Download -> CSV untuk memastikan formatnya
 * bersih sebelum dipakai di sini. */
function parseCsv_(text) {
  // Buang BOM UTF-8 kalau ada (umum dari export Excel).
  text = text.replace(/^\uFEFF/, "");
  const lines = text.split(/\r\n|\n|\r/).filter((l) => l.trim().length > 0);
  if (lines.length === 0) return [];
  const headers = lines[0].split(",").map((h) => h.trim());
  return lines.slice(1).map((line) => {
    const cells = line.split(",");
    const row = {};
    headers.forEach((h, i) => { row[h] = (cells[i] || "").trim(); });
    return row;
  });
}

async function main() {
  const args = parseArgs(process.argv);
  if (!args.csv || !args.key) {
    console.error(
      "Pemakaian: node bulk-buat-akun-siswa.js --csv=<path.csv> --key=<serviceAccountKey.json> " +
      "[--dry-run] [--update-password] [--allow-unlisted]"
    );
    process.exit(1);
  }

  const csvPath = path.resolve(args.csv);
  const keyPath = path.resolve(args.key);
  if (!fs.existsSync(csvPath)) { console.error(`File CSV tidak ditemukan: ${csvPath}`); process.exit(1); }
  if (!fs.existsSync(keyPath)) { console.error(`File kredensial tidak ditemukan: ${keyPath}`); process.exit(1); }

  const rows = parseCsv_(fs.readFileSync(csvPath, "utf8"));
  if (rows.length === 0) { console.error("CSV kosong atau tidak terbaca."); process.exit(1); }

  const kolomWajib = ["Nama Lengkap", "Alamat Email", "Password Login"];
  for (const k of kolomWajib) {
    if (!(k in rows[0])) {
      console.error(`Kolom wajib "${k}" tidak ditemukan di header CSV. Header yang terbaca: ${Object.keys(rows[0]).join(", ")}`);
      process.exit(1);
    }
  }

  console.log(`Membaca ${rows.length} baris dari ${csvPath}${args.dryRun ? "  [MODE DRY-RUN — tidak ada perubahan sungguhan]" : ""}\n`);

  // ── Validasi & kanonisasi nama SEBELUM menyentuh Firebase sama sekali ──
  const rencana = [];
  const dilewati = [];
  const seenEmail = new Set();
  for (const r of rows) {
    const namaCsv = (r["Nama Lengkap"] || "").trim();
    const email = (r["Alamat Email"] || "").trim().toLowerCase();
    const password = (r["Password Login"] || "").trim();
    const no = r["No"] || "?";

    if (!namaCsv || !email || !password) {
      dilewati.push({ no, namaCsv, alasan: "Ada kolom wajib yang kosong (nama/email/password)." });
      continue;
    }
    if (password.length < 6) {
      // Syarat minimum Firebase Auth: kata sandi minimal 6 karakter.
      dilewati.push({ no, namaCsv, alasan: `Kata sandi cuma ${password.length} karakter (minimal 6 disyaratkan Firebase Auth).` });
      continue;
    }
    if (seenEmail.has(email)) {
      dilewati.push({ no, namaCsv, alasan: `Email "${email}" duplikat di CSV ini (baris lain sudah memakainya).` });
      continue;
    }
    seenEmail.add(email);

    const canon = ROSTER_BY_NORM_.get(normalisasiNama_(namaCsv));
    let namaFinal;
    if (canon) {
      namaFinal = canon;
      if (canon !== namaCsv) {
        console.log(`ℹ️  Baris ${no}: nama CSV "${namaCsv}" dikoreksi ke ejaan roster resmi "${canon}".`);
      }
    } else if (args.allowUnlisted) {
      namaFinal = namaCsv;
      console.log(`⚠️  Baris ${no}: nama "${namaCsv}" TIDAK ada di ROSTER_RESMI_ — tetap diproses apa adanya karena --allow-unlisted dipakai. Pastikan ejaan ini SUDAH ditambahkan juga ke MPLS_STUDENTS (mpls-data.js) dan assets/js/siswa-akun.js dengan ejaan yang SAMA PERSIS.`);
    } else {
      dilewati.push({ no, namaCsv, alasan: "Nama tidak ditemukan di ROSTER_RESMI_ (kemungkinan salah ketik). Pakai --allow-unlisted kalau ini memang siswa baru yang belum ditambahkan ke roster." });
      continue;
    }

    rencana.push({ no, nama: namaFinal, email, password });
  }

  if (dilewati.length > 0) {
    console.log(`\n⚠️  ${dilewati.length} baris DILEWATI (tidak diproses):`);
    dilewati.forEach((d) => console.log(`   - Baris ${d.no} ("${d.namaCsv}"): ${d.alasan}`));
    console.log("");
  }

  if (rencana.length === 0) {
    console.log("Tidak ada baris valid untuk diproses. Berhenti.");
    process.exit(dilewati.length > 0 ? 1 : 0);
  }

  console.log(`${rencana.length} akun akan diproses:`);
  rencana.forEach((p) => console.log(`   - ${p.nama} <${p.email}>`));
  console.log("");

  if (args.dryRun) {
    console.log("Dry-run selesai — tidak ada perubahan yang dikirim ke Firebase. Jalankan tanpa --dry-run untuk memprosesnya sungguhan.");
    return;
  }

  // ── Baru sentuh Firebase dari sini ──
  const admin = require("firebase-admin");
  admin.initializeApp({ credential: admin.credential.cert(require(keyPath)) });
  const auth = admin.auth();
  const db = admin.firestore();

  const hasil = { dibuat: [], sudahAda: [], passwordDiperbarui: [], gagal: [], firestoreDilewati: [] };

  for (const p of rencana) {
    let userRecord;
    try {
      userRecord = await auth.getUserByEmail(p.email);
      hasil.sudahAda.push(p.nama);
      if (args.updatePassword) {
        await auth.updateUser(userRecord.uid, { password: p.password, displayName: p.nama });
        hasil.passwordDiperbarui.push(p.nama);
      }
    } catch (err) {
      if (err.code !== "auth/user-not-found") {
        console.error(`❌ Gagal memproses ${p.nama} <${p.email}>: ${err.message}`);
        hasil.gagal.push({ nama: p.nama, tahap: "cek akun", error: err.message });
        continue;
      }
      try {
        userRecord = await auth.createUser({
          email: p.email,
          password: p.password,
          displayName: p.nama,
        });
        hasil.dibuat.push(p.nama);
      } catch (createErr) {
        console.error(`❌ Gagal membuat akun ${p.nama} <${p.email}>: ${createErr.message}`);
        hasil.gagal.push({ nama: p.nama, tahap: "buat akun", error: createErr.message });
        continue;
      }
    }

    // Dokumen Firestore users/{uid} — pakai Admin SDK, jadi MELEWATI
    // firestore.rules sepenuhnya (sama seperti Apps Script via Service
    // Account), aman untuk menulis field "role" di sini.
    try {
      const ref = db.collection("users").doc(userRecord.uid);
      const existing = await ref.get();
      if (existing.exists && existing.data().role && existing.data().role !== "siswa") {
        // Pengaman: JANGAN timpa dokumen yang ternyata sudah dipakai untuk
        // role lain (mis. email ini kebetulan sudah jadi akun guru/orangtua)
        // — seharusnya tidak pernah terjadi karena email siswa beda domain,
        // tapi lebih aman berhenti & lapor daripada diam-diam menimpa role.
        console.error(`❌ users/${userRecord.uid} (${p.email}) sudah punya role "${existing.data().role}" yang BUKAN "siswa" — TIDAK ditimpa. Cek manual di Firestore Console.`);
        hasil.firestoreDilewati.push(p.nama);
        continue;
      }
      await ref.set({ nama: p.nama, role: "siswa", email: p.email }, { merge: true });
    } catch (err) {
      console.error(`❌ Gagal menulis dokumen Firestore untuk ${p.nama}: ${err.message}`);
      hasil.gagal.push({ nama: p.nama, tahap: "tulis Firestore", error: err.message });
    }
  }

  console.log("\n═══════════════════════ RINGKASAN ═══════════════════════");
  console.log(`Akun baru dibuat        : ${hasil.dibuat.length}${hasil.dibuat.length ? " — " + hasil.dibuat.join(", ") : ""}`);
  console.log(`Akun sudah ada sebelumnya: ${hasil.sudahAda.length}${hasil.sudahAda.length ? " — " + hasil.sudahAda.join(", ") : ""}`);
  if (args.updatePassword) {
    console.log(`Kata sandi diperbarui    : ${hasil.passwordDiperbarui.length}${hasil.passwordDiperbarui.length ? " — " + hasil.passwordDiperbarui.join(", ") : ""}`);
  }
  if (hasil.firestoreDilewati.length) {
    console.log(`⚠️  Dokumen Firestore DILEWATI (role bentrok): ${hasil.firestoreDilewati.join(", ")}`);
  }
  if (hasil.gagal.length) {
    console.log(`❌ Gagal (${hasil.gagal.length}):`);
    hasil.gagal.forEach((g) => console.log(`   - ${g.nama} (${g.tahap}): ${g.error}`));
  }
  console.log("\nSelesai. Cek Firebase Console -> Authentication & Firestore -> koleksi \"users\" untuk verifikasi manual sebelum dipakai siswa beneran.");

  if (hasil.gagal.length > 0) process.exit(1);
}

main().catch((err) => {
  console.error("Terjadi kesalahan tak terduga:", err);
  process.exit(1);
});
