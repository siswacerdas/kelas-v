/**
 * infografis-galeri.js — logika pages/infografis/galeri.html
 * Bergantung pada: window.INFOGRAFIS_MAPEL (infografis-data.js), window.MATERI_INDEX
 * (../materi/assets/materi-index.js — dipakai untuk mengelompokkan & mengurutkan tampilan
 * per TP/materi, SUMBER TUNGGAL yang sama dipakai kelola-tp.html & Materi Ajar), MPLS_CONFIG
 * (config.js), extractDriveFileId() dari assets/js/foto-fallback.js, dan
 * buildInfografisImgCandidates()/igImgHtml()/igImgFallbackNext()/attachInfografisImgFallback()
 * dari infografis-shared.js (dimuat SEBELUM file ini di galeri.html).
 */

const params = new URLSearchParams(window.location.search);
const slug = params.get("mapel") || "";
const mapelInfo = window.INFOGRAFIS_MAPEL.find((m) => m.mapelSlug === slug);

function esc(str) {
  return String(str || "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

function setupCover() {
  const cover = document.getElementById("ig-cover");
  document.getElementById("ig-cover-icon").textContent = mapelInfo ? mapelInfo.mapelIcon : "🖼️";
  document.getElementById("ig-cover-title").textContent = mapelInfo ? mapelInfo.mapel : "Mata pelajaran tidak dikenali";
  if (mapelInfo) cover.classList.add("ma-mapel-" + mapelInfo.mapelSlug);
  document.querySelector(".ma-topbar").classList.toggle("ma-mapel-" + (mapelInfo ? mapelInfo.mapelSlug : ""), !!mapelInfo);
}

/* ── Lightbox (khusus gambar; video dibuka di tab baru, lihat renderItem) ──
 * PENTING: dulu cuma pakai src=kandidat pertama TANPA fallback sama sekali — kalau kandidat
 * itu (proxy Apps Script) gagal untuk file tertentu, lightbox tampil kosong (cuma latar gelap
 * + keterangan) walau thumbnail grid di sebelahnya berhasil tampil (karena grid PUNYA rantai
 * fallback, lightbox dulu tidak). Sekarang pakai attachInfografisImgFallback() yang sama
 * persis dengan yang dipakai thumbnail grid. */
const lightbox = document.getElementById("ig-lightbox");
function openLightbox(urlOrId, title, desc) {
  const imgEl = document.getElementById("ig-lightbox-img");
  attachInfografisImgFallback(imgEl, urlOrId, () => {
    document.getElementById("ig-lightbox-desc").textContent =
      (desc ? desc + " " : "") + "(Gambar gagal dimuat — coba lagi beberapa saat lagi.)";
  });
  document.getElementById("ig-lightbox-title").textContent = title || "";
  document.getElementById("ig-lightbox-desc").textContent = desc || "";
  lightbox.classList.add("ig-open");
}
function closeLightbox() { lightbox.classList.remove("ig-open"); }
document.getElementById("ig-lightbox-close").addEventListener("click", closeLightbox);
lightbox.addEventListener("click", (e) => { if (e.target === lightbox) closeLightbox(); });
document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeLightbox(); });

function materiSlugFromFile_(file) {
  return String(file || "").replace(/\.html$/i, "");
}

// Set berisi label TP (atau "Lainnya") yang sedang DITUTUP (collapsed) — pola sama persis
// dengan `collapsedMapel` di pages/materi.html, cuma level-nya di TP, bukan mapel.
const collapsedTp = new Set();
let cachedRows = null; // hasil fetch terakhir, dipakai ulang saat toggle buka/tutup (tanpa fetch ulang)

/* ── Kelompokkan materi (bukan infografis) per TP untuk mapel ini, terurut sesuai posisi
 * asli di materi-index.js (yang memang sudah berurutan per TP → per materi). Dipakai untuk
 * menentukan JUDUL GRUP dan URUTAN BACA, baru dicocokkan ke infografis yang benar-benar ada
 * lewat "Materi Slug" — bukan sebaliknya (supaya urutannya ikut urutan materi resmi, bukan
 * urutan upload). */
function buildTpGroupsForMapel(mapelSlug) {
  const groups = {};
  const order = [];
  (window.MATERI_INDEX || []).forEach((m) => {
    if (m.mapelSlug !== mapelSlug || m.status !== "selesai") return;
    const tpKey = (m.tp || "") + "|" + (m.tema || "");
    if (!groups[tpKey]) {
      groups[tpKey] = { tema: m.tema || m.judul, items: [] };
      order.push(tpKey);
    }
    groups[tpKey].items.push(m);
  });
  order.forEach((k) => groups[k].items.sort((a, b) => (a.urutan || 0) - (b.urutan || 0)));
  return order.map((k) => groups[k]);
}

function renderItem(row) {
  const isVideo = row["Jenis Media"] === "video";
  const judul = esc(row["Judul"]);
  if (isVideo) {
    return `
      <a class="ig-item" href="${esc(row["URL Media"])}" target="_blank" rel="noopener">
        <div class="ig-thumb-video">▶️</div>
        <div class="ig-item-body"><div class="ig-item-title">${judul}</div></div>
      </a>`;
  }
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "ig-item";
  btn.innerHTML = `
    ${igImgHtml(row["URL Media"], judul, 'loading="lazy"')}
    <div class="ig-item-body"><div class="ig-item-title">${judul}</div></div>`;
  btn.addEventListener("click", () => openLightbox(row["URL Media"], row["Judul"], row["Keterangan"]));
  return btn;
}

function buildGrid(rowList) {
  const grid = document.createElement("div");
  grid.className = "ig-grid";
  rowList.forEach((row) => {
    const el = renderItem(row);
    if (el instanceof HTMLElement) grid.appendChild(el);
    else grid.insertAdjacentHTML("beforeend", el);
  });
  return grid;
}

function renderList(rows) {
  cachedRows = rows;
  const wrap = document.getElementById("ig-list");
  if (!rows.length) {
    wrap.innerHTML = '<div class="ma-empty">Belum ada gambar, poster, infografis, atau video untuk mata pelajaran ini.</div>';
    return;
  }

  const bySlug = {};
  rows.forEach((row) => { if (row["Materi Slug"]) bySlug[row["Materi Slug"]] = row; });

  const tpGroups = buildTpGroupsForMapel(mapelInfo.mapelSlug);
  const usedSlugs = new Set();
  wrap.innerHTML = "";
  let anyGroupRendered = false;
  const renderedLabels = [];

  function renderGroup(label, groupRows) {
    anyGroupRendered = true;
    renderedLabels.push(label);
    const isCollapsed = collapsedTp.has(label);
    const heading = document.createElement("div");
    heading.className = "ig-subgroup-title" + (isCollapsed ? " ig-collapsed-title" : "");
    heading.innerHTML = esc(label) + ' <span class="ig-subgroup-count">(' + groupRows.length + ')</span><span class="ig-chevron">▾</span>';
    heading.addEventListener("click", () => {
      if (collapsedTp.has(label)) collapsedTp.delete(label); else collapsedTp.add(label);
      renderList(cachedRows);
    });
    wrap.appendChild(heading);
    const grid = buildGrid(groupRows);
    if (isCollapsed) grid.classList.add("ig-collapsed");
    wrap.appendChild(grid);
  }

  tpGroups.forEach((group) => {
    const groupRows = [];
    group.items.forEach((m) => {
      const itemSlug = materiSlugFromFile_(m.file);
      const row = bySlug[itemSlug];
      if (row) { groupRows.push(row); usedSlugs.add(itemSlug); }
    });
    if (!groupRows.length) return; // TP ini belum punya infografis sama sekali — jangan tampilkan judulnya
    renderGroup(group.tema, groupRows);
  });

  // Sisa: infografis TANPA "Materi Slug" (upload umum/generik, tidak terikat 1 materi) ATAU
  // slug-nya tidak cocok materi manapun (mis. materi sudah dihapus dari materi-index.js) —
  // tetap ditampilkan (supaya tidak "hilang" dari galeri), dikelompokkan sebagai "Lainnya",
  // terbaru duluan (perilaku lama sebelum pengelompokan per TP ada).
  const leftover = rows
    .filter((row) => !row["Materi Slug"] || !usedSlugs.has(row["Materi Slug"]))
    .slice()
    .reverse();

  if (leftover.length) renderGroup("Lainnya", leftover);

  if (!anyGroupRendered) {
    wrap.innerHTML = '<div class="ma-empty">Belum ada gambar, poster, infografis, atau video untuk mata pelajaran ini.</div>';
    return;
  }

  // Tombol "Buka Semua / Tutup Semua" — cuma berguna kalau ada lebih dari 1 grup TP yang
  // tampil, jadi disembunyikan kalau cuma 1 (tidak ada gunanya toggle 1 grup lewat sini).
  if (renderedLabels.length > 1) {
    const toggleBar = document.createElement("div");
    toggleBar.className = "ig-toggle-all";
    toggleBar.innerHTML = '<button type="button" data-act="buka">Buka Semua</button><button type="button" data-act="tutup">Tutup Semua</button>';
    toggleBar.querySelector('[data-act="buka"]').addEventListener("click", () => {
      renderedLabels.forEach((label) => collapsedTp.delete(label));
      renderList(cachedRows);
    });
    toggleBar.querySelector('[data-act="tutup"]').addEventListener("click", () => {
      renderedLabels.forEach((label) => collapsedTp.add(label));
      renderList(cachedRows);
    });
    wrap.insertBefore(toggleBar, wrap.firstChild);
  }
}

async function loadItems() {
  if (!mapelInfo) {
    document.getElementById("ig-list").innerHTML =
      '<div class="ma-empty">Mata pelajaran tidak dikenali. <a href="../infografis.html">Kembali ke daftar mapel</a>.</div>';
    return;
  }
  if (typeof MPLS_CONFIG === "undefined" || !MPLS_CONFIG.APPS_SCRIPT_URL) {
    document.getElementById("ig-list").innerHTML = '<div class="ma-empty">Galeri Visual belum dikonfigurasi.</div>';
    return;
  }
  try {
    const url = MPLS_CONFIG.APPS_SCRIPT_URL + "?infografis=1&mapel=" + encodeURIComponent(mapelInfo.mapel);
    const res = await fetch(url);
    const json = await res.json();
    if (json.status === "error") throw new Error(json.message || "Gagal memuat");
    renderList(json.data || []);
  } catch (err) {
    document.getElementById("ig-list").innerHTML =
      '<div class="ma-empty">Gagal memuat galeri: ' + esc(err.message) + '</div>';
  }
}

document.addEventListener("user-verified", () => {
  document.getElementById("checking").remove();
  document.getElementById("app-galeri").classList.remove("ma-hidden");
  setupCover();
  loadItems();
});
document.addEventListener("DOMContentLoaded", () => window.guardLoggedInPage("../../index.html"));
