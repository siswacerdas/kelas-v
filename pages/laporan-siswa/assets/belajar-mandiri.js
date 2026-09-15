/**
 * belajar-mandiri.js — logika pages/laporan-siswa/belajar-mandiri.html (Pintu 2 dari 3).
 * Bergantung pada: MPLS_CONFIG (config.js), window.MATERI_INDEX (materi-index.js),
 * window.MODUL_INDEX (modul-index.js), window.PUSTAKA_BELAJAR_MAPEL (pustaka-belajar-data.js),
 * window.getFreshLaporanIdToken() (laporan-guard.js), window.LaporanPicker
 * (laporan-picker.js), dan event "laporan-context-ready" (detail: { role, nama, anak }).
 *
 * ROMBAKAN BESAR Agustus 2026 (lihat ANTIREGRESI.md §39 untuk detail & uji manual):
 *  - Progres MODUL ditambahkan (sebelumnya "Segera Hadir") — dari sheet "Data Progres
 *    Modul", diisi modul-progress-tracker.js (§38) saat siswa mencapai halaman terakhir
 *    modul. Butuh field `slug` di MODUL_INDEX (BARU) karena "Modul Slug" yang tersimpan di
 *    server TIDAK bisa ditebak otomatis dari nama folder (ada pengecualian tidak beraturan).
 *  - FILTER PER MAPEL (chip) ditambahkan — sebelumnya SEMUA mapel dirender terbuka
 *    sekaligus, jadi sangat panjang begitu kontennya bertambah. Sekarang detail per-mapel
 *    (Materi + Modul) HANYA dirender untuk 1 mapel yang dipilih.
 *  - "AKTIVITAS TERBARU" ditambahkan — daftar ringkas 8 aktivitas (materi dibaca / modul
 *    diselesaikan) TERBARU lintas SEMUA mapel, diurutkan dari Timestamp server, supaya
 *    orang tua langsung tahu KAPAN & APA yang terakhir dipelajari anaknya di rumah TANPA
 *    perlu memilih mapel/scroll apa pun dulu — ini yang menjawab kebutuhan "kapan anak
 *    belajar" yang diminta eksplisit. SENGAJA tidak coba menggabungkan Materi+Modul per-TP
 *    (join berdasarkan `tp`) karena skema kode TP di MATERI_INDEX & MODUL_INDEX untuk
 *    beberapa elemen (mis. Bahasa Indonesia · Menulis) TIDAK cocok satu sama lain — join
 *    yang dipaksakan lebih rapuh daripada 2 subseksi terpisah per mapel.
 *
 * ROMBAKAN Sept 2026 (permintaan Arif — laporan ini masih dianggap "kurang lengkap"
 * walau sudah 3 kali dibenahi, lihat ANTIREGRESI.md untuk nomor bagian terbaru):
 *  - PUSTAKA BELAJAR ditambahkan sebagai subseksi ke-3 (selain Ingat Lagi & Ayo Belajar!) —
 *    sebelumnya SENGAJA belum dimasukkan (lihat catatan lama di Code.gs cabang
 *    "progres_pustaka"). Bedanya dari Materi/Modul: daftar isinya TIDAK statis di kode
 *    (bukan file -index.js), tapi dikelola guru lewat admin.html dan disimpan di sheet "Data
 *    Pustaka Belajar" — jadi diambil lewat endpoint publik ?pustakaBelajar=1 (SAMA yang
 *    dipakai pustaka-belajar-landing.js), di-cache di `pustakaListAll` supaya tidak diulang
 *    tiap ganti siswa/mapel (daftarnya sama untuk semua siswa, tidak seperti data progres
 *    per-siswa). Pengambilan daftar ini SENGAJA fail-soft (dibungkus try/catch sendiri,
 *    bukan lewat fetchDenganRetry_) — kalau gagal, laporan TETAP tampil dengan Materi &
 *    Modul seperti biasa, cuma subseksi Pustaka jadi kosong, BUKAN seluruh laporan gagal.
 *  - TOMBOL "Tandai selesai (manual)" ditambahkan untuk MODUL, KHUSUS akun guru
 *    (ctx.role === "guru", disembunyikan total untuk orang tua). Ini menjawab kasus modul
 *    yang siswa SUDAH benar-benar selesaikan (guru tahu dari pengamatan langsung / laporan
 *    siswa) tapi TIDAK PERNAH tercatat otomatis karena syarat pencatatan (mencapai halaman
 *    terakhir + diam 3 menit di sana) tidak pernah terpenuhi, dan localStorage di perangkat
 *    siswa tidak lagi menyimpan bukti apa pun (device beda/cache dibersihkan/dst.) sehingga
 *    tombol "🔍 Cek Modul yang Mungkin Belum Tercatat" di pages/modul.html juga tidak bisa
 *    menemukannya. Menulis via endpoint baru "progres_modul_manual" (LAPIS GURU WAJIB di
 *    server, lihat Code.gs) — baris yang ditulis ditandai "Sumber": "Manual (Guru)" supaya
 *    tetap bisa dibedakan/ditelusuri dari penyelesaian otomatis asli siswa.
 */

let ctx = null;
let mapelAktif = null;       // slug mapel yang sedang dipilih untuk detail, null = belum pilih
let dataMateriRows = [];     // hasil ?progresMateri=1 apa adanya (dengan Timestamp)
let dataModulRows = [];      // hasil ?progresModul=1 apa adanya (dengan Timestamp)
let dataPustakaRows = [];    // hasil ?progresPustaka=1 apa adanya (dengan Timestamp)
let pustakaListAll = null;   // cache daftar SEMUA file Pustaka Belajar (?pustakaBelajar=1) —
                              // TIDAK bergantung siswa, jadi cukup diambil SEKALI per kunjungan
                              // halaman (bukan diulang tiap ganti siswa/reload laporan)

function esc(str) {
  return String(str || "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

function materiSlugFromFile_(file) {
  return String(file || "").replace(/\.html$/i, "");
}

/** Label waktu ramah untuk orang tua — "Hari ini, 14:32" / "Kemarin, 09:10" / "3 hari lalu" /
 * tanggal biasa kalau lebih dari 6 hari. Timestamp dari server berupa string ISO (Date
 * di-JSON.stringify otomatis jadi ISO oleh Apps Script). */
function formatWaktuRamah_(timestampStr) {
  if (!timestampStr) return "";
  const d = new Date(timestampStr);
  if (isNaN(d.getTime())) return "";
  const now = new Date();
  const startOfDay = (x) => new Date(x.getFullYear(), x.getMonth(), x.getDate());
  const diffHari = Math.round((startOfDay(now) - startOfDay(d)) / 86400000);
  const jam = d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
  if (diffHari === 0) return "Hari ini, " + jam;
  if (diffHari === 1) return "Kemarin, " + jam;
  if (diffHari > 1 && diffHari <= 6) return diffHari + " hari lalu";
  return d.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
}

/* ── Kelompokkan MATERI (status "selesai" saja) per mapel → per TP, terurut sesuai posisi
 * asli di materi-index.js. TIDAK diubah dari versi sebelumnya. ── */
function buildMapelGroupsMateri() {
  const mapelGroups = {};
  const mapelOrder = [];
  (window.MATERI_INDEX || []).forEach((m) => {
    if (m.status !== "selesai") return;
    if (!mapelGroups[m.mapelSlug]) {
      mapelGroups[m.mapelSlug] = { mapel: m.mapel, mapelSlug: m.mapelSlug, mapelIcon: m.mapelIcon, tpGroups: {}, tpOrder: [] };
      mapelOrder.push(m.mapelSlug);
    }
    const mg = mapelGroups[m.mapelSlug];
    const tpKey = (m.tp || "") + "|" + (m.tema || "");
    if (!mg.tpGroups[tpKey]) {
      mg.tpGroups[tpKey] = { tema: m.tema || m.judul, items: [] };
      mg.tpOrder.push(tpKey);
    }
    mg.tpGroups[tpKey].items.push(m);
  });
  return mapelOrder.map((slug) => {
    const mg = mapelGroups[slug];
    return {
      mapel: mg.mapel, mapelSlug: mg.mapelSlug, mapelIcon: mg.mapelIcon,
      tpList: mg.tpOrder.map((k) => mg.tpGroups[k]),
    };
  });
}

/* ── Kelompokkan MODUL (status "selesai" saja, artinya "sudah dirilis ke siswa" — BUKAN
 * berarti "sudah dikerjakan siswa", itu ditentukan `sudahSelesaiModul` terpisah) per mapel.
 * BEDA dari materi: 1 modul biasanya = 1 TP utuh (bukan beberapa item per TP), jadi tidak
 * perlu pengelompokan tpList/tpGroups, cukup daftar datar `items` per mapel. ── */
function buildMapelGroupsModul() {
  const mapelGroups = {};
  const mapelOrder = [];
  (window.MODUL_INDEX || []).forEach((m) => {
    if (m.status !== "selesai") return;
    if (!mapelGroups[m.mapelSlug]) {
      mapelGroups[m.mapelSlug] = { mapel: m.mapel, mapelSlug: m.mapelSlug, mapelIcon: m.mapelIcon, items: [] };
      mapelOrder.push(m.mapelSlug);
    }
    mapelGroups[m.mapelSlug].items.push(m);
  });
  return mapelOrder.map((slug) => mapelGroups[slug]);
}

/* ── Kelompokkan PUSTAKA BELAJAR per mapel dari `pustakaListAll` (BARU). BEDA dari
 * Materi/Modul: sumbernya bukan file -index.js statis, tapi baris sheet "Data Pustaka
 * Belajar" (dikelola guru lewat admin.html) — field "Mapel" di situ berupa NAMA mapel
 * (mis. "Matematika"), BUKAN slug, jadi perlu dicocokkan ke window.PUSTAKA_BELAJAR_MAPEL
 * dulu (SAMA PERSIS pola `findMapel` di pustaka-belajar-landing.js) untuk dapat mapelSlug/
 * ikon. Mapel yang tidak dikenali (mis. field "Mapel" kosong/typo) TETAP ditampilkan di
 * bawah slug "lainnya" alih-alih hilang diam-diam — supaya guru tetap sadar ada entri yang
 * perlu dirapikan datanya, bukan kehilangan data begitu saja dari laporan. */
function buildMapelGroupsPustaka(daftarPustaka) {
  const mapelGroups = {};
  const mapelOrder = [];
  (daftarPustaka || []).forEach((r) => {
    const info = (window.PUSTAKA_BELAJAR_MAPEL || []).find((m) => m.mapel === r["Mapel"]);
    const mapelSlug = info ? info.mapelSlug : "lainnya";
    const mapel = r["Mapel"] || "Lainnya";
    const mapelIcon = info ? info.mapelIcon : "📄";
    if (!mapelGroups[mapelSlug]) {
      mapelGroups[mapelSlug] = { mapel, mapelSlug, mapelIcon, items: [] };
      mapelOrder.push(mapelSlug);
    }
    mapelGroups[mapelSlug].items.push({ id: r["ID"], judul: r["Judul"] || "(Tanpa judul)", mapel, mapelSlug, mapelIcon });
  });
  return mapelOrder.map((slug) => mapelGroups[slug]);
}

/** Gabungkan daftar mapel dari Materi, Modul & Pustaka Belajar (union, urutan Materi dulu,
 * lalu Modul, lalu Pustaka yang belum ada) — dipakai buat chip filter supaya mapel yang
 * CUMA punya salah satu dari ketiganya tetap muncul sebagai pilihan. */
function daftarMapelGabungan_(materiGroups, modulGroups, pustakaGroups) {
  const map = {};
  const order = [];
  materiGroups.forEach((g) => { if (!map[g.mapelSlug]) { map[g.mapelSlug] = g; order.push(g.mapelSlug); } });
  modulGroups.forEach((g) => { if (!map[g.mapelSlug]) { map[g.mapelSlug] = g; order.push(g.mapelSlug); } });
  (pustakaGroups || []).forEach((g) => { if (!map[g.mapelSlug]) { map[g.mapelSlug] = g; order.push(g.mapelSlug); } });
  return order.map((s) => map[s]);
}

async function loadReport(nama) {
  const wrap = document.getElementById("lap-report");
  wrap.innerHTML = '<div class="ma-empty">Memuat laporan…</div>';
  document.getElementById("lap-subtitle").textContent = "Laporan untuk " + nama;
  try {
    const idToken = await window.getFreshLaporanIdToken();
    const base = MPLS_CONFIG.APPS_SCRIPT_URL;
    // DIUBAH — sebelumnya GET dengan idToken ditempel di query string (?progresMateri=1&
    // idToken=...). idToken JWT Firebase bisa 1000+ karakter, dan request GET sepanjang itu
    // ke Apps Script Web App bisa gagal dengan gejala 404 di proxy redirect
    // "script.googleusercontent.com/macros/echo" (lihat catatan di Code.gs doPost, cabang
    // "get_progres_materi"/"get_progres_modul"). POST dengan body JSON tidak kena batasan
    // panjang URL, jadi idToken dipindah ke body, bukan lagi ke URL.
    //
    // v2 (BUG lanjutan ditemukan Sept 2026, lihat ANTIREGRESI.md §57): Arif melaporkan
    // error 404 "script.googleusercontent.com/macros/echo" MASIH SESEKALI muncul WALAU
    // idToken sudah di body (POST), dan laporan "kadang gagal kadang tidak" — bukan gagal
    // permanen/konsisten. Ini pola KLASIK ketidakstabilan proxy redirect Apps Script Web
    // App sendiri (bukan soal ukuran payload lagi) — dokumentasi & keluhan publik soal ini
    // sudah dikenal luas, dan proyek ini SUDAH PERNAH menangani pola serupa dengan cara yang
    // SAMA di tempat lain (lihat riwayat lama "siswa_login" sebelum migrasi ke Firebase Auth
    // langsung, CHANGELOG.md) — bukan dengan menghilangkan Apps Script (laporan ini memang
    // harus baca sheet lewat Apps Script), tapi dengan TIMEOUT + SATU KALI RETRY OTOMATIS
    // untuk kegagalan TEKNIS (timeout/network/bukan JSON) — BUKAN untuk error valid dari
    // server (mis. `status:"error"` dengan pesan yang jelas, itu tidak diulang, langsung
    // ditampilkan apa adanya). Diterapkan lewat `fetchDenganRetry_` di bawah, dipakai KEDUA
    // panggilan (materi & modul) — laporan baru dianggap gagal kalau retry-nya JUGA gagal.
    const [jsonMateri, jsonModul, jsonPustaka] = await Promise.all([
      fetchDenganRetry_(base, { type: "get_progres_materi", nama: nama, idToken: idToken }),
      fetchDenganRetry_(base, { type: "get_progres_modul", nama: nama, idToken: idToken }),
      fetchDenganRetry_(base, { type: "get_progres_pustaka", nama: nama, idToken: idToken }),
    ]);
    if (jsonMateri.status === "error") throw new Error(jsonMateri.message || "Gagal memuat laporan materi");
    if (jsonModul.status === "error") throw new Error(jsonModul.message || "Gagal memuat laporan modul");
    if (jsonPustaka.status === "error") throw new Error(jsonPustaka.message || "Gagal memuat laporan Pustaka Belajar");
    dataMateriRows = jsonMateri.data || [];
    dataModulRows = jsonModul.data || [];
    dataPustakaRows = jsonPustaka.data || [];

    // Daftar SEMUA file Pustaka Belajar (bukan data per-siswa) — sama untuk semua siswa,
    // cukup diambil sekali per kunjungan halaman (lihat komentar `pustakaListAll` di atas).
    // SENGAJA fail-soft: kegagalan di sini TIDAK melempar/menggagalkan seluruh laporan.
    if (pustakaListAll === null) {
      try {
        const resList = await fetch(base + "?pustakaBelajar=1", { cache: "no-store" });
        const jsonList = await resList.json();
        pustakaListAll = jsonList.status === "error" ? [] : (jsonList.data || []);
      } catch (e) {
        pustakaListAll = []; // gagal ambil daftar Pustaka Belajar -> subseksi itu kosong, bukan seluruh laporan gagal
      }
    }

    // Default: pilih mapel PERTAMA yang punya data supaya orang tua langsung lihat sesuatu
    // tanpa perlu tap dulu (tapi tetap ringkas — cuma 1 mapel yang detailnya terbuka).
    const daftarMapel = daftarMapelGabungan_(buildMapelGroupsMateri(), buildMapelGroupsModul(), buildMapelGroupsPustaka(pustakaListAll));
    mapelAktif = daftarMapel.length > 0 ? daftarMapel[0].mapelSlug : null;

    renderReport(nama);
  } catch (err) {
    wrap.innerHTML = '<div class="ma-empty">Gagal memuat laporan: ' + esc(err.message) + "</div>";
  }
}

/** Timeout 20 detik + SATU kali retry otomatis, KHUSUS untuk kegagalan TEKNIS (timeout,
 * network error/offline, atau respons yang bukan JSON sama sekali — termasuk pola 404
 * "script.googleusercontent.com/macros/echo" yang terbukti sesekali terjadi begitu saja
 * dari sisi proxy Apps Script, lihat komentar panjang di `loadReport` di atas). Error VALID
 * dari server (respons JSON yang berhasil di-parse, apa pun isinya termasuk
 * `status:"error"`) TIDAK diulang — itu bukan kegagalan teknis, server SUDAH menjawab
 * dengan jelas, mengulang tidak akan mengubah jawabannya. */
async function fetchDenganRetry_(url, payload) {
  async function sekaliCoba() {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000);
    try {
      const res = await fetch(url, { method: "POST", body: JSON.stringify(payload), signal: controller.signal });
      return await res.json(); // melempar SyntaxError kalau respons bukan JSON — ditangkap di bawah
    } finally {
      clearTimeout(timeoutId);
    }
  }
  try {
    return await sekaliCoba();
  } catch (err) {
    // Kegagalan teknis (AbortError / TypeError jaringan / SyntaxError bukan-JSON) — coba
    // SATU kali lagi sebelum benar-benar menyerah, jeda sebentar dulu (bukan langsung
    // beruntun) supaya tidak menabrak masalah proxy yang sama persis kalau itu sesaat.
    await new Promise((r) => setTimeout(r, 800));
    return await sekaliCoba();
  }
}

function renderReport(nama) {
  const wrap = document.getElementById("lap-report");
  const sudahDibacaMateri = new Set(dataMateriRows.map((r) => r["Materi Slug"]).filter(Boolean));
  const sudahSelesaiModul = new Set(dataModulRows.map((r) => r["Modul Slug"]).filter(Boolean));
  const sudahDibacaPustaka = new Set(dataPustakaRows.map((r) => r["Pustaka ID"]).filter(Boolean));

  const materiGroups = buildMapelGroupsMateri();
  const modulGroups = buildMapelGroupsModul();
  const pustakaGroups = buildMapelGroupsPustaka(pustakaListAll);
  const daftarMapel = daftarMapelGabungan_(materiGroups, modulGroups, pustakaGroups);

  const ganti = ctx.role === "guru" || (ctx.role === "orangtua" && ctx.anak.length > 1)
    ? '<button type="button" class="lap-ganti" id="lap-ganti-btn">← Pilih siswa lain</button>'
    : "";

  // ── Ringkasan keseluruhan — lintas SEMUA mapel, TIDAK terpengaruh filter mapel di bawah,
  // supaya orang tua tetap dapat gambaran total meski sedang fokus lihat 1 mapel. ──
  let totalMateriSemua = 0, dibacaMateriSemua = 0;
  materiGroups.forEach((mg) => mg.tpList.forEach((tp) => {
    totalMateriSemua += tp.items.length;
    dibacaMateriSemua += tp.items.filter((m) => sudahDibacaMateri.has(materiSlugFromFile_(m.file))).length;
  }));
  let totalModulSemua = 0, selesaiModulSemua = 0;
  modulGroups.forEach((mg) => mg.items.forEach((it) => {
    totalModulSemua += 1;
    if (sudahSelesaiModul.has(it.slug)) selesaiModulSemua += 1;
  }));
  let totalPustakaSemua = 0, dibacaPustakaSemua = 0;
  pustakaGroups.forEach((mg) => mg.items.forEach((it) => {
    totalPustakaSemua += 1;
    if (sudahDibacaPustaka.has(it.id)) dibacaPustakaSemua += 1;
  }));

  // ── Aktivitas Terbaru — gabungan Materi+Modul, 8 teratas berdasar Timestamp. Ini yang
  // menjawab "kapan anak terakhir belajar mandiri" tanpa perlu memilih mapel/scroll. ──
  const materiBySlug = {};
  (window.MATERI_INDEX || []).forEach((m) => { materiBySlug[materiSlugFromFile_(m.file)] = m; });
  const modulBySlug = {};
  (window.MODUL_INDEX || []).forEach((m) => { modulBySlug[m.slug] = m; });
  const pustakaById = {};
  (pustakaListAll || []).forEach((r) => { pustakaById[r["ID"]] = r; });

  const aktivitas = [];
  dataMateriRows.forEach((r) => {
    const info = materiBySlug[r["Materi Slug"]];
    if (!info) return; // slug tidak dikenal di index saat ini (mis. materi lama dihapus) -> lewati diam-diam
    aktivitas.push({ ts: r["Timestamp"], jenis: "materi", judul: info.judul, mapel: info.mapel });
  });
  dataModulRows.forEach((r) => {
    const info = modulBySlug[r["Modul Slug"]];
    if (!info) return;
    const manual = r["Sumber"] === "Manual (Guru)";
    aktivitas.push({ ts: r["Timestamp"], jenis: "modul", judul: info.judul, mapel: info.mapel, manual: manual });
  });
  dataPustakaRows.forEach((r) => {
    const info = pustakaById[r["Pustaka ID"]];
    if (!info) return; // ID tidak dikenal di daftar saat ini (mis. sudah dihapus guru) -> lewati diam-diam
    aktivitas.push({ ts: r["Timestamp"], jenis: "pustaka", judul: info["Judul"] || "(Tanpa judul)", mapel: info["Mapel"] || "" });
  });
  aktivitas.sort((a, b) => new Date(b.ts) - new Date(a.ts));
  const aktivitasTerbaru = aktivitas.slice(0, 8);

  const ikonAktivitas_ = (jenis) => jenis === "modul" ? "🧩" : jenis === "pustaka" ? "📚" : "📖";
  const labelAktivitas_ = (a) => {
    if (a.jenis === "modul") return "Modul diselesaikan" + (a.manual ? " · ditandai guru" : "");
    if (a.jenis === "pustaka") return "Pustaka Belajar dibaca";
    return "Materi dibaca";
  };

  const aktivitasHtml = aktivitasTerbaru.length > 0
    ? '<div class="lap-aktivitas-list">' + aktivitasTerbaru.map((a) => `
        <div class="lap-aktivitas-row">
          <span class="lap-aktivitas-icon">${ikonAktivitas_(a.jenis)}</span>
          <div class="lap-aktivitas-body">
            <div class="lap-aktivitas-judul">${esc(a.judul)}</div>
            <div class="lap-aktivitas-meta">${esc(a.mapel)} · ${labelAktivitas_(a)}</div>
          </div>
          <span class="lap-aktivitas-waktu">${esc(formatWaktuRamah_(a.ts))}</span>
        </div>`).join("") + "</div>"
    : '<div class="lap-kosong">Belum ada aktivitas belajar mandiri tercatat.</div>';

  // ── Chip filter mapel ──
  const chipHtml = daftarMapel.map((m) => `
    <button type="button" class="lap-mapel-chip ${mapelAktif === m.mapelSlug ? "lap-active" : ""}" data-mapel="${esc(m.mapelSlug)}">
      ${m.mapelIcon || "📚"} ${esc(m.mapel)}
    </button>`).join("");

  // ── Detail 1 mapel terpilih (Materi + Modul) ──
  let detailHtml = '<div class="lap-kosong">Pilih salah satu mata pelajaran di atas untuk melihat rinciannya.</div>';
  if (mapelAktif) {
    const mg = materiGroups.find((g) => g.mapelSlug === mapelAktif);
    const mdg = modulGroups.find((g) => g.mapelSlug === mapelAktif);
    const pbg = pustakaGroups.find((g) => g.mapelSlug === mapelAktif);

    const materiSectionHtml = mg ? mg.tpList.map((tp) => {
      const total = tp.items.length;
      const dibaca = tp.items.filter((m) => sudahDibacaMateri.has(materiSlugFromFile_(m.file))).length;
      const pct = total > 0 ? Math.round((dibaca / total) * 100) : 0;
      const selesai = dibaca === total && total > 0;
      return `
        <div class="lap-tp-row ${selesai ? "lap-tp-selesai" : ""}">
          <div class="lap-tp-row-top">
            <span class="lap-tp-nama">${selesai ? "✅ " : ""}${esc(tp.tema)}</span>
            <span class="lap-tp-angka">${dibaca}/${total} materi</span>
          </div>
          <div class="lap-tp-bar-track"><div class="lap-tp-bar-fill" style="width:${pct}%"></div></div>
        </div>`;
    }).join("") : '<div class="lap-kosong">Belum ada Ingat Lagi untuk mapel ini.</div>';

    // Tombol "Tandai selesai (manual)" HANYA untuk guru (ctx.role === "guru") & HANYA pada
    // modul yang BELUM tercatat selesai — lihat catatan panjang di header file untuk latar
    // belakang. Orang tua tidak pernah melihat tombol ini sama sekali (bukan cuma
    // disembunyikan tampilannya — endpoint server juga menolak kalau bukan akun guru).
    const modulSectionHtml = mdg ? mdg.items.map((it) => {
      const selesai = sudahSelesaiModul.has(it.slug);
      const tandaiBtn = (!selesai && ctx.role === "guru")
        ? `<button type="button" class="lap-tandai-manual-btn" data-slug="${esc(it.slug)}" data-judul="${esc(it.judul)}">✏️ Tandai selesai</button>`
        : "";
      return `
        <div class="lap-modul-row ${selesai ? "lap-modul-selesai" : ""}">
          <span class="lap-modul-check">${selesai ? "✅" : "⬜"}</span>
          <span class="lap-modul-judul">${esc(it.judul)}</span>
          ${tandaiBtn}
        </div>`;
    }).join("") : '<div class="lap-kosong">Belum ada Ayo Belajar! untuk mapel ini.</div>';

    const pustakaSectionHtml = pbg ? pbg.items.map((it) => {
      const dibaca = sudahDibacaPustaka.has(it.id);
      return `
        <div class="lap-modul-row ${dibaca ? "lap-modul-selesai" : ""}">
          <span class="lap-modul-check">${dibaca ? "✅" : "⬜"}</span>
          <span class="lap-modul-judul">${esc(it.judul)}</span>
        </div>`;
    }).join("") : '<div class="lap-kosong">Belum ada Pustaka Belajar untuk mapel ini.</div>';

    detailHtml = `
      <div class="lap-detail-mapel">
        <div class="lap-subsection-title">🔁 Ingat Lagi</div>
        ${materiSectionHtml}
        <div class="lap-subsection-title" style="margin-top:1rem;">🚀 Ayo Belajar!</div>
        ${modulSectionHtml}
        <div class="lap-subsection-title" style="margin-top:1rem;">📚 Pustaka Belajar</div>
        ${pustakaSectionHtml}
      </div>`;
  }

  wrap.innerHTML = ganti + `
    <div class="lap-progres-overall">
      <div class="lap-ringkasan-grid">
        <div class="lap-ringkasan-item">
          <div class="lap-progres-overall-angka">${dibacaMateriSemua}/${totalMateriSemua}</div>
          <div class="lap-progres-overall-label">📖 Materi dibaca</div>
        </div>
        <div class="lap-ringkasan-item">
          <div class="lap-progres-overall-angka">${selesaiModulSemua}/${totalModulSemua}</div>
          <div class="lap-progres-overall-label">🧩 Modul selesai</div>
        </div>
        <div class="lap-ringkasan-item">
          <div class="lap-progres-overall-angka">${dibacaPustakaSemua}/${totalPustakaSemua}</div>
          <div class="lap-progres-overall-label">📚 Pustaka dibaca</div>
        </div>
      </div>
    </div>

    <div class="lap-section-title-plain">🕐 Aktivitas Terbaru</div>
    ${aktivitasHtml}

    <div class="lap-section-title-plain" style="margin-top:1.25rem;">Rincian per Mata Pelajaran</div>
    <div class="lap-mapel-chips">${chipHtml || '<div class="lap-kosong">Belum ada data untuk ditampilkan.</div>'}</div>
    ${detailHtml}
  `;

  wrap.querySelectorAll(".lap-mapel-chip").forEach((btn) => {
    btn.addEventListener("click", () => {
      mapelAktif = mapelAktif === btn.dataset.mapel ? null : btn.dataset.mapel;
      renderReport(nama);
    });
  });

  wrap.querySelectorAll(".lap-tandai-manual-btn").forEach((btn) => {
    btn.addEventListener("click", () => tandaiModulManual_(nama, btn.dataset.slug, btn.dataset.judul, btn));
  });

  const gantiBtn = document.getElementById("lap-ganti-btn");
  if (gantiBtn) gantiBtn.addEventListener("click", () => {
    wrap.innerHTML = "";
    document.getElementById("lap-subtitle").textContent = "Ketuntasan Ingat Lagi & Ayo Belajar! yang sudah dipelajari siswa.";
    if (ctx.role === "orangtua") {
      document.querySelectorAll(".lap-anak-chip").forEach((b) => b.classList.remove("lap-active"));
    } else {
      window.LaporanPicker.render(ctx, loadReport);
    }
  });
}

/** Dipanggil saat guru klik "✏️ Tandai selesai" pada 1 baris modul yang belum tercatat.
 * Konfirmasi dulu (window.confirm) supaya tidak ke-klik tidak sengaja — ini menulis
 * permanen ke sheet, append-only, TIDAK bisa dibatalkan dari UI (kalau salah tandai,
 * perbaikannya lewat spreadsheet langsung, sama seperti koreksi data lain di proyek ini).
 * Setelah berhasil, laporan dimuat ulang penuh (loadReport) supaya angka ringkasan,
 * Aktivitas Terbaru, dan baris modul ini semuanya konsisten dengan data server terbaru —
 * BUKAN cuma mengganti tampilan baris ini secara lokal, yang berisiko tidak sinkron kalau
 * ada perubahan lain. */
async function tandaiModulManual_(nama, slug, judul, btnEl) {
  const ok = window.confirm(
    'Tandai modul "' + judul + '" sebagai SELESAI untuk ' + nama + ' secara manual?\n\n' +
    "Gunakan ini HANYA kalau Bapak/Ibu Guru yakin siswa sudah benar-benar menyelesaikan " +
    "modul ini (mis. dari pengamatan langsung), tapi sistem belum mencatatnya otomatis. " +
    "Tindakan ini tercatat sebagai ditandai manual oleh guru."
  );
  if (!ok) return;
  const labelAsli = btnEl.textContent;
  btnEl.disabled = true;
  btnEl.textContent = "Menyimpan…";
  try {
    const idToken = await window.getFreshLaporanIdToken();
    const base = MPLS_CONFIG.APPS_SCRIPT_URL;
    const json = await fetchDenganRetry_(base, {
      type: "progres_modul_manual",
      "Nama Siswa": nama,
      "Modul Slug": slug,
      idToken: idToken,
    });
    if (json.status === "error") throw new Error(json.message || "Gagal menandai modul selesai");
    await loadReport(nama);
  } catch (err) {
    window.alert("Gagal menandai modul selesai: " + err.message);
    btnEl.disabled = false;
    btnEl.textContent = labelAsli;
  }
}

document.addEventListener("laporan-context-ready", (e) => {
  ctx = e.detail;
  window.LaporanPicker.render(ctx, loadReport);
});
