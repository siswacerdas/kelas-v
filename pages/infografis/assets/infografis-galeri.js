/**
 * infografis-galeri.js — logika pages/infografis/galeri.html
 * Bergantung pada: window.INFOGRAFIS_MAPEL (infografis-data.js), MPLS_CONFIG (config.js),
 * extractDriveFileId() dari assets/js/foto-fallback.js, dan buildInfografisImgCandidates()/
 * igImgHtml()/igImgFallbackNext()/attachInfografisImgFallback() dari infografis-shared.js
 * (dimuat SEBELUM file ini di galeri.html).
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

function renderItem(row) {
  const isVideo = row["Jenis Media"] === "video";
  const judul = esc(row["Judul"]);
  const keterangan = esc(row["Keterangan"]);
  if (isVideo) {
    return `
      <a class="ig-item" href="${esc(row["URL Media"])}" target="_blank" rel="noopener">
        <div class="ig-thumb-video">▶️</div>
        <div class="ig-item-body">
          <div class="ig-item-title">${judul}</div>
          <span class="ig-item-badge">Video</span>
        </div>
      </a>`;
  }
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "ig-item";
  btn.innerHTML = `
    ${igImgHtml(row["URL Media"], judul, 'loading="lazy"')}
    <div class="ig-item-body">
      <div class="ig-item-title">${judul}</div>
      <span class="ig-item-badge">Gambar</span>
    </div>`;
  btn.addEventListener("click", () => openLightbox(row["URL Media"], row["Judul"], row["Keterangan"]));
  return btn;
}

function renderList(rows) {
  const wrap = document.getElementById("ig-list");
  if (!rows.length) {
    wrap.innerHTML = '<div class="ma-empty">Belum ada gambar, poster, infografis, atau video untuk mata pelajaran ini.</div>';
    return;
  }
  wrap.innerHTML = "";
  const grid = document.createElement("div");
  grid.className = "ig-grid";
  rows.forEach((row) => {
    const el = renderItem(row);
    if (el instanceof HTMLElement) grid.appendChild(el);
    else grid.insertAdjacentHTML("beforeend", el);
  });
  wrap.appendChild(grid);
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
    const rows = (json.data || []).slice().reverse(); // terbaru duluan
    renderList(rows);
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
