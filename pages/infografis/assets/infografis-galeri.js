/**
 * infografis-galeri.js — logika pages/infografis/galeri.html
 * Bergantung pada: window.INFOGRAFIS_MAPEL (infografis-data.js), MPLS_CONFIG (config.js),
 * dan extractDriveFileId() dari assets/js/foto-fallback.js (dipakai ulang, BUKAN ditulis lagi,
 * supaya logika ekstraksi ID Drive tetap satu sumber di sisi klien).
 */

const params = new URLSearchParams(window.location.search);
const slug = params.get("mapel") || "";
const mapelInfo = window.INFOGRAFIS_MAPEL.find((m) => m.mapelSlug === slug);

/* ── Susun kandidat URL gambar lewat proxy Apps Script (?infografisFoto=), sama polanya
 * dengan buildFotoCandidates() di foto-fallback.js tapi param & tanpa gerbang guru — lihat
 * serveInfografisBinary_() di apps-script/Code.gs untuk alasan lengkapnya. */
function buildInfografisImgCandidates(urlOrId) {
  const id = extractDriveFileId(urlOrId);
  if (!id) return urlOrId ? [urlOrId] : [];
  const candidates = [];
  if (typeof MPLS_CONFIG !== "undefined" && MPLS_CONFIG && MPLS_CONFIG.APPS_SCRIPT_URL) {
    candidates.push(MPLS_CONFIG.APPS_SCRIPT_URL + "?infografisFoto=" + encodeURIComponent(id));
  }
  candidates.push(
    "https://lh3.googleusercontent.com/d/" + id + "=w1000",
    "https://drive.google.com/thumbnail?id=" + id + "&sz=w1000"
  );
  return candidates;
}

function igImgHtml(urlOrId, altText, extraAttrs) {
  const candidates = buildInfografisImgCandidates(urlOrId);
  if (!candidates.length) return "";
  const candidatesJson = JSON.stringify(candidates).replace(/"/g, "&quot;");
  return (
    '<img class="ig-thumb" src="' + candidates[0] + '" alt="' + (altText || "") + '" ' +
    (extraAttrs || "") + ' data-candidates="' + candidatesJson + '" data-idx="0" ' +
    'onerror="igImgFallbackNext(this)" />'
  );
}

function igImgFallbackNext(img) {
  try {
    const candidates = JSON.parse(img.getAttribute("data-candidates") || "[]");
    const idx = parseInt(img.getAttribute("data-idx") || "0", 10) + 1;
    if (idx < candidates.length) {
      img.setAttribute("data-idx", String(idx));
      img.src = candidates[idx];
    } else {
      img.replaceWith(Object.assign(document.createElement("div"), {
        className: "ig-thumb-video", textContent: "🖼️",
      }));
    }
  } catch (e) { /* diamkan — thumbnail tetap tampil apa adanya kalau gagal parse */ }
}

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

/* ── Lightbox (khusus gambar; video dibuka di tab baru, lihat renderItem) ── */
const lightbox = document.getElementById("ig-lightbox");
function openLightbox(urlOrId, title, desc) {
  const candidates = buildInfografisImgCandidates(urlOrId);
  document.getElementById("ig-lightbox-img").src = candidates[0] || "";
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
