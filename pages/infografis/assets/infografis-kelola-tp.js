/**
 * infografis-kelola-tp.js — logika pages/infografis/kelola-tp.html
 * Bergantung pada window.MATERI_INDEX (../materi/assets/materi-index.js — SUMBER TUNGGAL
 * daftar materi, sudah dipakai juga oleh materi.html), MPLS_CONFIG, dan extractDriveFileId()
 * dari foto-fallback.js. "Materi Slug" = field "file" di MATERI_INDEX TANPA akhiran ".html" —
 * sudah unik per materi secara alami, tidak perlu skema ID baru.
 */

function materiSlugFromFile_(file) {
  return String(file || "").replace(/\.html$/i, "");
}

/* ── Susun daftar grup TP dari MATERI_INDEX (hanya materi status "selesai") ─────────── */
function buildTpGroups() {
  const groups = {}; // key: mapelSlug + "|" + tp
  const order = [];
  (window.MATERI_INDEX || []).forEach((m) => {
    if (m.status !== "selesai") return; // materi placeholder belum ada isinya, lewati dulu
    const tpKey = m.mapelSlug + "|" + (m.tp || m.tema);
    if (!groups[tpKey]) {
      groups[tpKey] = {
        key: tpKey, mapel: m.mapel, mapelSlug: m.mapelSlug, mapelIcon: m.mapelIcon,
        tp: m.tp || "", tema: m.tema || m.judul, items: [],
      };
      order.push(tpKey);
    }
    groups[tpKey].items.push(m);
  });
  order.forEach((k) => groups[k].items.sort((a, b) => (a.urutan || 0) - (b.urutan || 0)));
  return order.map((k) => groups[k]);
}

const tpGroups = buildTpGroups();
const selectEl = document.getElementById("pilih-tp");
tpGroups.forEach((g) => {
  const opt = document.createElement("option");
  opt.value = g.key;
  opt.textContent = (g.mapelIcon || "📚") + " " + g.mapel + " — " + g.tema;
  selectEl.appendChild(opt);
});

const state = { guruNama: "", currentGroup: null, infografisBySlug: {} };

function esc(str) {
  return String(str || "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

/* ── Thumbnail gambar lewat rantai fallback bersama (infografis-shared.js) — SEBELUMNYA
 * fungsi ini cuma pakai 1 kandidat (proxy ?infografisFoto=) tanpa fallback sama sekali, beda
 * dari grid galeri.html yang sejak awal punya 2 kandidat cadangan. Kalau proxy gagal untuk
 * file tertentu (lihat catatan panjang di infografis-shared.js), kartu di sini langsung jatuh
 * ke placeholder walau sebenarnya masih ada kandidat lain yang mungkin berhasil. Sekarang
 * pakai igImgHtml() yang sama persis dengan galeri.html. */
function igMateriThumbHtml(urlOrId) {
  if (!extractDriveFileId(urlOrId) || typeof MPLS_CONFIG === "undefined" || !MPLS_CONFIG.APPS_SCRIPT_URL) {
    return '<div class="ig-materi-placeholder">🖼️</div>';
  }
  return igImgHtml(urlOrId, "", "", "ig-materi-thumb", "ig-materi-placeholder", "🖼️");
}

/* ── Ambil semua infografis untuk 1 mapel, petakan per Materi Slug ─────────────────── */
async function loadInfografisForMapel(mapel) {
  const url = MPLS_CONFIG.APPS_SCRIPT_URL + "?infografis=1&mapel=" + encodeURIComponent(mapel);
  const res = await fetch(url);
  const json = await res.json();
  if (json.status === "error") throw new Error(json.message || "Gagal memuat");
  const bySlug = {};
  (json.data || []).forEach((row) => {
    if (row["Materi Slug"]) bySlug[row["Materi Slug"]] = row;
  });
  return bySlug;
}

/* ── Render kartu untuk 1 grup TP ───────────────────────────────────────────────────── */
async function renderGroup(group) {
  state.currentGroup = group;
  document.getElementById("tp-header").classList.remove("hidden");
  document.getElementById("tp-title").textContent = group.tema;
  document.getElementById("tp-subtitle").textContent = group.mapel + (group.tp ? " · " + group.tp : "");

  const grid = document.getElementById("materi-grid");
  grid.innerHTML = '<div class="info-box">Memuat data infografis…</div>';
  try {
    state.infografisBySlug = await loadInfografisForMapel(group.mapel);
  } catch (err) {
    grid.innerHTML = '<div class="info-box" style="border-color:var(--danger)">Gagal memuat: ' + esc(err.message) + "</div>";
    return;
  }

  grid.innerHTML = '<div class="ig-materi-grid" id="ig-materi-grid"></div>';
  const wrap = document.getElementById("ig-materi-grid");
  group.items.forEach((m) => {
    const slug = materiSlugFromFile_(m.file);
    const card = document.createElement("div");
    card.className = "ig-materi-card ma-mapel-" + m.mapelSlug;
    card.dataset.slug = slug;
    renderCardBody(card, m, slug);
    wrap.appendChild(card);
  });
}

function renderCardBody(card, m, slug) {
  const existing = state.infografisBySlug[slug];
  card.innerHTML = `
    <div class="ig-materi-thumb-wrap">${existing ? igMateriThumbHtml(existing["URL Media"]) : '<div class="ig-materi-placeholder">🖼️</div>'}</div>
    <div class="ig-materi-info">
      <div class="ig-materi-urutan">Materi ${m.urutan}</div>
      <div class="ig-materi-judul">${esc(m.judul)}</div>
      <div class="ig-materi-actions">
        <button type="button" class="ig-materi-btn ig-materi-btn-primary" data-action="unggah">${existing ? "Ganti Infografis" : "Unggah Infografis"}</button>
        ${existing ? '<button type="button" class="ig-materi-btn ig-materi-btn-danger" data-action="hapus">Hapus</button>' : ""}
      </div>
      <div class="ig-materi-status"></div>
      <input type="file" accept="image/*" class="hidden" data-role="file-input" />
    </div>`;

  card.querySelector('[data-action="unggah"]').addEventListener("click", () => {
    card.querySelector('[data-role="file-input"]').click();
  });
  card.querySelector('[data-role="file-input"]').addEventListener("change", (e) => {
    if (e.target.files[0]) handleUpload(card, m, slug, e.target.files[0]);
  });
  const hapusBtn = card.querySelector('[data-action="hapus"]');
  if (hapusBtn) hapusBtn.addEventListener("click", () => handleHapus(card, m, slug));
}

function setStatus(card, msg, isErr) {
  const el = card.querySelector(".ig-materi-status");
  el.textContent = msg;
  el.classList.toggle("ig-err", !!isErr);
}

/* ── Resize gambar di klien (identik dengan pola kelas.js) ─────── */
function resizeImageFile(file, maxDim, quality) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();
    reader.onload = () => { img.src = reader.result; };
    reader.onerror = reject;
    img.onload = () => {
      let { width, height } = img;
      if (width > height && width > maxDim) {
        height = Math.round((height * maxDim) / width);
        width = maxDim;
      } else if (height > maxDim) {
        width = Math.round((width * maxDim) / height);
        height = maxDim;
      }
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      canvas.getContext("2d").drawImage(img, 0, 0, width, height);
      const dataUrl = canvas.toDataURL("image/jpeg", quality);
      resolve({ base64: dataUrl.split(",")[1], mime: "image/jpeg" });
    };
    img.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function parseJsonAman_(res) {
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch (e) {
    throw new Error("Respons tidak dikenali dari server: " + text.slice(0, 150));
  }
}

function showToast(msg, isErr) {
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.classList.toggle("err", !!isErr);
  t.classList.add("show");
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => t.classList.remove("show"), isErr ? 6000 : 2600);
}

async function handleUpload(card, m, slug, file) {
  setStatus(card, "Memproses gambar…");
  try {
    // 1600px & kualitas 0.8 (bukan thumbnail kecil, dibuka
    // penuh lewat lightbox).
    const resized = await resizeImageFile(file, 1600, 0.8);
    setStatus(card, "Mengunggah…");
    const idToken = await window.getFreshGuruIdToken();
    const payload = {
      type: "infografis",
      "Mapel": m.mapel,
      "Materi Slug": slug,
      "Judul": m.judul,
      "Keterangan": m.ringkasan || "",
      "Jenis Media": "gambar",
      "Diunggah Oleh": state.guruNama,
      fotoBase64: resized.base64,
      fotoMime: resized.mime,
      idToken,
    };
    const res = await fetch(MPLS_CONFIG.APPS_SCRIPT_URL, { method: "POST", body: JSON.stringify(payload) });
    const json = await parseJsonAman_(res);
    if (json.status !== "ok") throw new Error(json.message || "Gagal menyimpan");
    state.infografisBySlug[slug] = {
      "ID": json.id, "Mapel": m.mapel, "Materi Slug": slug, "Judul": m.judul,
      "Keterangan": m.ringkasan || "", "Jenis Media": "gambar", "URL Media": json.urlMedia,
    };
    renderCardBody(card, m, slug);
    showToast("Infografis " + m.judul + " tersimpan.");
  } catch (err) {
    setStatus(card, "⚠️ Gagal: " + err.message, true);
  }
}

async function handleHapus(card, m, slug) {
  if (!confirm('Hapus infografis untuk materi "' + m.judul + '"? File di Drive juga akan dipindah ke Trash.')) return;
  const existing = state.infografisBySlug[slug];
  if (!existing) return;
  setStatus(card, "Menghapus…");
  try {
    const idToken = await window.getFreshGuruIdToken();
    const res = await fetch(MPLS_CONFIG.APPS_SCRIPT_URL, {
      method: "POST",
      body: JSON.stringify({ type: "infografis_hapus", "ID": existing["ID"], idToken }),
    });
    const json = await parseJsonAman_(res);
    if (json.status !== "ok") throw new Error(json.message || "Gagal menghapus");
    delete state.infografisBySlug[slug];
    renderCardBody(card, m, slug);
    showToast("Infografis " + m.judul + " dihapus.");
  } catch (err) {
    setStatus(card, "⚠️ Gagal: " + err.message, true);
  }
}

/* ── Pemilihan TP (dropdown manual atau deep-link ?mapel=&tp=) ─────────────────────── */
selectEl.addEventListener("change", () => {
  const group = tpGroups.find((g) => g.key === selectEl.value);
  if (group) renderGroup(group);
});

function tryDeepLink() {
  const params = new URLSearchParams(window.location.search);
  const mapelSlug = params.get("mapel");
  const tp = params.get("tp");
  if (!mapelSlug || !tp) return;
  const group = tpGroups.find((g) => g.mapelSlug === mapelSlug && g.tp === tp);
  if (group) {
    selectEl.value = group.key;
    renderGroup(group);
  }
}

document.addEventListener("guru-verified", (e) => {
  document.getElementById("checking").remove();
  state.guruNama = (e.detail && e.detail.nama) || "";
  tryDeepLink();
});
document.addEventListener("DOMContentLoaded", () => window.guardGuruPage("../../index.html"));
