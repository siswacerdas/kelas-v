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
let paneAktif = "ringkasan"; // ringkasan | aktivitas | mapel:<slug>
let _bmView = null;         // cache tampilan: hindari rebuild penuh saat ganti pane

const BM_PROGRES_CACHE_PREFIX = "lap_bm_progres_v1:";
const BM_PROGRES_CACHE_TTL = 3 * 60 * 1000; // 3 menit
const BM_PUSTAKA_LIST_KEY = "lap_pustaka_list_v1";
const BM_PUSTAKA_LIST_TTL = 5 * 60 * 1000;

function bacaCacheProgresBm_(nama) {
  try {
    const raw = sessionStorage.getItem(BM_PROGRES_CACHE_PREFIX + nama);
    if (!raw) return null;
    const obj = JSON.parse(raw);
    if (!obj || !obj.ts || !obj.data) return null;
    if (Date.now() - obj.ts > BM_PROGRES_CACHE_TTL) return null;
    return obj.data;
  } catch (e) { return null; }
}
function tulisCacheProgresBm_(nama, data) {
  try {
    sessionStorage.setItem(BM_PROGRES_CACHE_PREFIX + nama, JSON.stringify({ ts: Date.now(), data: data }));
  } catch (e) {}
}
function bacaCachePustakaList_() {
  try {
    const raw = sessionStorage.getItem(BM_PUSTAKA_LIST_KEY);
    if (!raw) return null;
    const obj = JSON.parse(raw);
    if (!obj || !obj.ts || !Array.isArray(obj.data)) return null;
    if (Date.now() - obj.ts > BM_PUSTAKA_LIST_TTL) return null;
    return obj.data;
  } catch (e) { return null; }
}
function tulisCachePustakaList_(data) {
  try {
    sessionStorage.setItem(BM_PUSTAKA_LIST_KEY, JSON.stringify({ ts: Date.now(), data: data || [] }));
  } catch (e) {}
}


let dataMateriRows = [];     // hasil ?progresMateri=1 apa adanya (dengan Timestamp)
let dataModulRows = [];      // hasil ?progresModul=1 apa adanya (dengan Timestamp)
let dataPustakaRows = [];    // hasil ?progresPustaka=1 apa adanya (dengan Timestamp)
let pustakaListAll = null;   // cache daftar SEMUA file Pustaka Belajar (?pustakaBelajar=1) —
                              // TIDAK bergantung siswa, jadi cukup diambil SEKALI per kunjungan
                              // halaman (bukan diulang tiap ganti siswa/reload laporan)

function esc(str) {
  return String(str || "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}
function lapInitial_(nama) {
  const p = String(nama || "?").trim().split(/\s+/);
  if (!p.length) return "?";
  if (p.length === 1) return p[0].slice(0, 1).toUpperCase();
  return (p[0].slice(0, 1) + p[p.length - 1].slice(0, 1)).toUpperCase();
}
function lapHidePicker_(hide) {
  const el = document.getElementById("lap-picker");
  if (el) el.style.display = hide ? "none" : "";
  const wel = document.getElementById("lap-welcome-main");
  if (wel) wel.style.display = hide ? "none" : "";
}
function lapSiswaHeader_(nama, metaHtml) {
  const ganti = ctx && (ctx.role === "guru" || (ctx.role === "orangtua" && ctx.anak && ctx.anak.length > 1))
    ? '<button type="button" class="lap-ganti" id="lap-ganti-btn">Ganti siswa</button>'
    : "";
  return '<div class="lap-siswa-header">' +
    '<span class="lap-avatar">' + esc(lapInitial_(nama)) + '</span>' +
    '<div class="lap-siswa-header-info">' +
      '<div class="lap-siswa-header-nama">' + esc(nama) + '</div>' +
      (metaHtml ? '<div class="lap-siswa-header-meta">' + metaHtml + '</div>' : '') +
    '</div>' + ganti + '</div>';
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
  document.getElementById("lap-subtitle").textContent = "Laporan untuk " + nama;

  // 1) Cache hit → tampilkan segera, revalidasi di latar
  const cached = bacaCacheProgresBm_(nama);
  if (cached) {
    dataMateriRows = cached.materi || [];
    dataModulRows = cached.modul || [];
    dataPustakaRows = cached.pustaka || [];
    window.__lapPartialErrors = cached.partialErrors || [];
    if (pustakaListAll === null) {
      const pl = bacaCachePustakaList_();
      if (pl) pustakaListAll = pl;
    }
    const daftarMapel = daftarMapelGabungan_(
      buildMapelGroupsMateri(), buildMapelGroupsModul(), buildMapelGroupsPustaka(pustakaListAll || [])
    );
    if (!mapelAktif && daftarMapel.length) mapelAktif = daftarMapel[0].mapelSlug;
    renderReport(nama);
    // revalidate diam-diam
    revalidateProgresBm_(nama).catch(function () {});
    return;
  }

  wrap.innerHTML = '<div class="lap-loading-panel" id="lap-loading-panel">'
      + '<div class="lap-loading-title">Memuat laporan…</div>'
      + '<div class="lap-loading-steps" id="lap-loading-steps">'
      + '<div class="lap-load-step" data-src="materi">📖 Materi Ajar <span>…</span></div>'
      + '<div class="lap-load-step" data-src="modul">📚 Modul <span>…</span></div>'
      + '<div class="lap-load-step" data-src="pustaka">📄 Pustaka Belajar <span>…</span></div>'
      + '</div>'
      + '<div class="lap-load-bar"><i></i></div>'
      + '</div>';

  try {
    await fetchProgresBmNetwork_(nama);
    const daftarMapel = daftarMapelGabungan_(
      buildMapelGroupsMateri(), buildMapelGroupsModul(), buildMapelGroupsPustaka(pustakaListAll || [])
    );
    mapelAktif = daftarMapel.length > 0 ? daftarMapel[0].mapelSlug : null;
    renderReport(nama);
  } catch (err) {
    wrap.innerHTML = '<div class="ma-empty">Gagal memuat laporan: ' + esc(err.message) + "</div>";
  }
}

async function revalidateProgresBm_(nama) {
  await fetchProgresBmNetwork_(nama);
  // Hanya re-render jika masih melihat siswa yang sama
  const title = document.querySelector(".lap-aside-nama");
  if (title && title.textContent === nama) {
    renderReport(nama);
  }
}

async function fetchProgresBmNetwork_(nama) {
  const idToken = await window.getFreshLaporanIdToken();
  const base = MPLS_CONFIG.APPS_SCRIPT_URL;

  function setStep_(src, state, detail) {
    const el = document.querySelector('.lap-load-step[data-src="' + src + '"]');
    if (!el) return;
    el.classList.remove("is-ok", "is-err", "is-loading");
    el.classList.add(state === "ok" ? "is-ok" : state === "err" ? "is-err" : "is-loading");
    const sp = el.querySelector("span");
    if (sp) sp.textContent = detail || (state === "ok" ? "✓" : state === "err" ? "gagal" : "…");
  }

  async function ambilSumber_(type, src) {
    setStep_(src, "loading", "mengunduh…");
    try {
      const json = await fetchDenganRetry_(base, { type: type, nama: nama, idToken: idToken });
      if (json && json.status === "error") {
        setStep_(src, "err", "error");
        return { ok: false, data: [], message: json.message || "Error server" };
      }
      setStep_(src, "ok", "✓");
      return { ok: true, data: (json && json.data) || [] };
    } catch (err) {
      setStep_(src, "err", "gagal");
      return { ok: false, data: [], message: (err && err.message) || "Gagal jaringan" };
    }
  }

  // Prefetch daftar pustaka paralel dengan 3 progres
  const listPromise = (async function () {
    if (pustakaListAll !== null) return pustakaListAll;
    const cachedList = bacaCachePustakaList_();
    if (cachedList) {
      pustakaListAll = cachedList;
      // refresh diam-diam
      try {
        const resList = await fetch(base + "?pustakaBelajar=1", { cache: "no-store" });
        const jsonList = await resList.json();
        if (jsonList && jsonList.status !== "error") {
          pustakaListAll = jsonList.data || [];
          tulisCachePustakaList_(pustakaListAll);
        }
      } catch (e) {}
      return pustakaListAll;
    }
    try {
      const resList = await fetch(base + "?pustakaBelajar=1", { cache: "no-store" });
      const jsonList = await resList.json();
      pustakaListAll = (jsonList && jsonList.status === "error") ? [] : ((jsonList && jsonList.data) || []);
      tulisCachePustakaList_(pustakaListAll);
    } catch (e) {
      pustakaListAll = [];
    }
    return pustakaListAll;
  })();

  const [resMateri, resModul, resPustaka] = await Promise.all([
    ambilSumber_("get_progres_materi", "materi"),
    ambilSumber_("get_progres_modul", "modul"),
    ambilSumber_("get_progres_pustaka", "pustaka"),
  ]);
  await listPromise;

  dataMateriRows = resMateri.data;
  dataModulRows = resModul.data;
  dataPustakaRows = resPustaka.data;

  const gagalSemua = !resMateri.ok && !resModul.ok && !resPustaka.ok;
  if (gagalSemua) {
    throw new Error("Semua sumber laporan gagal dimuat. Periksa koneksi lalu coba lagi.");
  }

  window.__lapPartialErrors = [];
  if (!resMateri.ok) window.__lapPartialErrors.push("Materi Ajar: " + (resMateri.message || "gagal"));
  if (!resModul.ok) window.__lapPartialErrors.push("Modul: " + (resModul.message || "gagal"));
  if (!resPustaka.ok) window.__lapPartialErrors.push("Pustaka Belajar: " + (resPustaka.message || "gagal"));

  tulisCacheProgresBm_(nama, {
    materi: dataMateriRows,
    modul: dataModulRows,
    pustaka: dataPustakaRows,
    partialErrors: window.__lapPartialErrors.slice(),
  });
}

async function fetchDenganRetry_(url, payload) {
  // Timeout 15 dtk, max 3 percobaan (1 + 2 retry), jeda 600ms / 1200ms.
  // Hanya untuk kegagalan TEKNIS; JSON status:"error" tidak di-retry.
  async function sekaliCoba() {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);
    try {
      const res = await fetch(url, {
        method: "POST",
        body: JSON.stringify(payload),
        signal: controller.signal,
        cache: "no-store",
      });
      if (!res.ok) throw new Error("HTTP " + res.status);
      return await res.json();
    } finally {
      clearTimeout(timeoutId);
    }
  }
  let lastErr = null;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      return await sekaliCoba();
    } catch (err) {
      lastErr = err;
      if (attempt < 2) await new Promise((r) => setTimeout(r, 600 * (attempt + 1)));
    }
  }
  throw lastErr || new Error("Gagal menghubungi server laporan");
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

  const partialErrs = window.__lapPartialErrors || [];
  const partialBanner = partialErrs.length
    ? '<div class="lap-partial-warn">Sebagian data tidak termuat: ' + partialErrs.map(esc).join(" · ") +
      '. <button type="button" class="lap-retry-btn" id="lap-retry-partial">Coba muat ulang</button></div>'
    : "";

  lapHidePicker_(true);

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

  // ── Detail 1 mapel ──
  function buildDetailMapel_(slug) {
    const mg = materiGroups.find((g) => g.mapelSlug === slug);
    const mdg = modulGroups.find((g) => g.mapelSlug === slug);
    const pbg = pustakaGroups.find((g) => g.mapelSlug === slug);
    if (!mg && !mdg && !pbg) return '<div class="lap-kosong">Tidak ada data untuk mapel ini.</div>';

    let html = "";
    if (mg) {
      html += '<div class="lap-block"><div class="lap-block-title">📖 Materi Ajar (Ingat Lagi)</div>';
      html += mg.tpList.map((tp) => {
        const total = tp.items.length;
        const dibaca = tp.items.filter((m) => sudahDibacaMateri.has(materiSlugFromFile_(m.file))).length;
        const pct = total ? Math.round((dibaca / total) * 100) : 0;
        const items = tp.items.map((m) => {
          const done = sudahDibacaMateri.has(materiSlugFromFile_(m.file));
          return '<div class="lap-check-item' + (done ? ' is-done' : '') + '">' +
            '<span class="lap-check-mark" aria-hidden="true"></span>' +
            '<span class="lap-check-text">' + esc(m.judul || m.file || "") + '</span></div>';
        }).join("");
        return '<div class="lap-subblock">' +
          '<div class="lap-subblock-title">' + esc(tp.tema || tp.tpNama || tp.tp || "Tujuan Pembelajaran") +
            '<span class="lap-pct">' + dibaca + '/' + total + ' · ' + pct + '%</span></div>' +
          '<div class="lap-metric-bar" style="margin:0 0 10px"><i style="width:' + pct + '%"></i></div>' +
          '<div class="lap-check-list">' + items + '</div></div>';
      }).join("");
      html += "</div>";
    }
    if (mdg) {
      html += '<div class="lap-block"><div class="lap-block-title">🧩 Modul (Ayo Belajar)</div>';
      html += mdg.items.map((it) => {
        const done = sudahSelesaiModul.has(it.slug);
        const doneCls = done ? ' is-done' : '';
        const manualBtn = (!done && ctx && ctx.role === "guru")
          ? `<button type="button" class="lap-tandai-manual-btn" data-slug="${esc(it.slug)}" data-judul="${esc(it.judul)}">Tandai selesai</button>`
          : "";
        return `<div class="lap-check-item ${done ? "is-done" : ""}">
          <span class="lap-check-mark" aria-hidden="true"></span>
          <span class="lap-check-text">${esc(it.judul)}${manualBtn}</span>
        </div>`;
      }).join("");
      html += "</div>";
    }
    if (pbg) {
      html += '<div class="lap-block"><div class="lap-block-title">📚 Pustaka Belajar</div><div class="lap-check-list">';
      html += pbg.items.map((it) => {
        const done = sudahDibacaPustaka.has(it.id);
        return `<div class="lap-check-item ${done ? "is-done" : ""}">
          <span class="lap-check-mark" aria-hidden="true"></span>
          <span class="lap-check-text">${esc(it.judul)}</span>
        </div>`;
      }).join("");
      html += "</div></div>";
    }
    return html;
  }

  // Pastikan pane valid
  if (paneAktif && paneAktif.startsWith("mapel:")) {
    const s = paneAktif.slice(6);
    if (!daftarMapel.some((m) => m.mapelSlug === s)) paneAktif = "ringkasan";
  }
  if (!paneAktif) paneAktif = "ringkasan";

  const pctM = totalMateriSemua ? Math.round((dibacaMateriSemua / totalMateriSemua) * 100) : 0;
  const pctO = totalModulSemua ? Math.round((selesaiModulSemua / totalModulSemua) * 100) : 0;
  const pctP = totalPustakaSemua ? Math.round((dibacaPustakaSemua / totalPustakaSemua) * 100) : 0;

  const ringkasanBody =
      '<div class="lap-metrics">' +
        '<div class="lap-metric">' +
          '<div class="lap-metric-value">' + dibacaMateriSemua + '<span style="font-size:0.85rem;font-weight:600;color:var(--ink-3)">/' + totalMateriSemua + '</span></div>' +
          '<div class="lap-metric-label">📖 Materi dibaca</div>' +
          '<div class="lap-metric-bar"><i style="width:' + pctM + '%"></i></div>' +
        '</div>' +
        '<div class="lap-metric">' +
          '<div class="lap-metric-value">' + selesaiModulSemua + '<span style="font-size:0.85rem;font-weight:600;color:var(--ink-3)">/' + totalModulSemua + '</span></div>' +
          '<div class="lap-metric-label">🧩 Modul selesai</div>' +
          '<div class="lap-metric-bar"><i style="width:' + pctO + '%"></i></div>' +
        '</div>' +
        '<div class="lap-metric">' +
          '<div class="lap-metric-value">' + dibacaPustakaSemua + '<span style="font-size:0.85rem;font-weight:600;color:var(--ink-3)">/' + totalPustakaSemua + '</span></div>' +
          '<div class="lap-metric-label">📚 Pustaka dibaca</div>' +
          '<div class="lap-metric-bar"><i style="width:' + pctP + '%"></i></div>' +
        '</div>' +
      '</div>' +
      '<div class="lap-block"><div class="lap-block-title">Aktivitas terbaru</div>' + aktivitasHtml + '</div>';

  _bmView = {
    nama: nama,
    daftarMapel: daftarMapel,
    aktivitasHtml: aktivitasHtml,
    ringkasanBody: ringkasanBody,
    buildDetailMapel_: buildDetailMapel_,
  };

  let navHtml =
    '<button type="button" class="lap-nav-item' + (paneAktif === "ringkasan" ? " is-active" : "") + '" data-pane="ringkasan">' +
      '<span class="nav-ico">📊</span> Ringkasan</button>' +
    '<button type="button" class="lap-nav-item' + (paneAktif === "aktivitas" ? " is-active" : "") + '" data-pane="aktivitas">' +
      '<span class="nav-ico">🕐</span> Aktivitas<span class="nav-badge">' + aktivitasTerbaru.length + '</span></button>' +
    '<div class="lap-nav-label">Mata pelajaran</div>';
  for (let mi = 0; mi < daftarMapel.length; mi++) {
    const m = daftarMapel[mi];
    const key = "mapel:" + m.mapelSlug;
    navHtml +=
      '<button type="button" class="lap-nav-item' + (paneAktif === key ? " is-active" : "") + '" data-pane="' + esc(key) + '">' +
      '<span class="nav-ico">' + (m.mapelIcon || "📚") + '</span> ' + esc(m.mapel) + '</button>';
  }
  if (!daftarMapel.length) {
    navHtml += '<div class="lap-kosong" style="padding:0.5rem 10px;font-size:12px">Belum ada mapel</div>';
  }

  const gantiBtn = (ctx && (ctx.role === "guru" || (ctx.role === "orangtua" && ctx.anak && ctx.anak.length > 1)))
    ? '<button type="button" class="lap-ganti" id="lap-ganti-btn">Ganti siswa</button>'
    : "";

  wrap.innerHTML = partialBanner +
    '<div class="lap-dash">' +
      '<aside class="lap-aside">' +
        '<div class="lap-aside-student">' +
          '<div class="lap-aside-student-row">' +
            '<span class="lap-avatar">' + esc(lapInitial_(nama)) + '</span>' +
            '<div><div class="lap-aside-nama">' + esc(nama) + '</div>' +
            '<div class="lap-aside-meta">Belajar mandiri</div></div>' +
          '</div>' +
          '<div class="lap-aside-actions">' + gantiBtn + '</div>' +
        '</div>' +
        '<nav class="lap-aside-nav" id="lap-aside-nav">' + navHtml + '</nav>' +
      '</aside>' +
      '<div class="lap-main" id="lap-main-pane"></div>' +
    '</div>';

  const nav = document.getElementById("lap-aside-nav");
  if (nav) {
    nav.onclick = function (e) {
      const btn = e.target.closest(".lap-nav-item");
      if (!btn) return;
      const pane = btn.getAttribute("data-pane") || "ringkasan";
      if (pane === paneAktif) return;
      paneAktif = pane;
      if (paneAktif.startsWith("mapel:")) mapelAktif = paneAktif.slice(6);
      switchPaneBm_();
    };
  }

  const gantiEl = document.getElementById("lap-ganti-btn");
  if (gantiEl) gantiEl.onclick = function () {
    wrap.innerHTML = "";
    _bmView = null;
    paneAktif = "ringkasan";
    lapHidePicker_(false);
    document.getElementById("lap-subtitle").textContent = "Progres materi ajar, modul, dan pustaka belajar per mapel.";
    if (ctx.role === "orangtua") {
      document.querySelectorAll(".lap-anak-chip").forEach((b) => b.classList.remove("lap-active"));
    } else {
      window.LaporanPicker.render(ctx, loadReport);
    }
  };

  const retryPartial = document.getElementById("lap-retry-partial");
  if (retryPartial) retryPartial.onclick = function () { loadReport(nama); };

  switchPaneBm_();
}

function switchPaneBm_() {
  if (!_bmView) return;
  const main = document.getElementById("lap-main-pane");
  const nav = document.getElementById("lap-aside-nav");
  if (!main) return;

  if (nav) {
    const items = nav.querySelectorAll(".lap-nav-item");
    for (let i = 0; i < items.length; i++) {
      items[i].classList.toggle("is-active", items[i].getAttribute("data-pane") === paneAktif);
    }
  }

  let mainTitle = "Ringkasan";
  let mainSub = "Gambaran keseluruhan progres belajar mandiri.";
  let mainBody = "";
  if (paneAktif === "ringkasan") {
    mainBody = _bmView.ringkasanBody;
  } else if (paneAktif === "aktivitas") {
    mainTitle = "Aktivitas Terbaru";
    mainSub = "Urutan waktu — materi, modul, dan pustaka yang baru dikerjakan.";
    mainBody = _bmView.aktivitasHtml;
  } else if (paneAktif.startsWith("mapel:")) {
    const slug = paneAktif.slice(6);
    const info = _bmView.daftarMapel.find((m) => m.mapelSlug === slug);
    mainTitle = info ? ((info.mapelIcon || "") + " " + info.mapel) : "Mapel";
    mainSub = "Rincian materi, modul, dan pustaka untuk mapel ini.";
    mainBody = _bmView.buildDetailMapel_(slug);
  }

  main.innerHTML =
    '<h2 class="lap-main-title">' + esc(mainTitle) + '</h2>' +
    '<p class="lap-main-sub">' + esc(mainSub) + '</p>' +
    mainBody;

  const tandai = main.querySelectorAll(".lap-tandai-manual-btn");
  for (let i = 0; i < tandai.length; i++) {
    tandai[i].onclick = (function (btn) {
      return function () {
        tandaiModulManual_(_bmView.nama, btn.dataset.slug, btn.dataset.judul, btn);
      };
    })(tandai[i]);
  }
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
