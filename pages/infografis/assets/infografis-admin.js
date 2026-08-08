/**
 * infografis-admin.js — logika pages/infografis/admin.html
 * Bergantung pada MPLS_CONFIG (../mpls/assets/config.js) dan window.INFOGRAFIS_MAPEL
 * (infografis-data.js), dimuat sebelum file ini. Backend Apps Script yang dipakai SAMA
 * dengan modul MPLS/Data Siswa (1 spreadsheet, sheet "Data Infografis" — lihat Code.gs).
 */

function isiDropdownMapel() {
  const select = document.getElementById("f-mapel");
  const filter = document.getElementById("filter-mapel");
  window.INFOGRAFIS_MAPEL.forEach((m) => {
    const opt1 = document.createElement("option");
    opt1.value = m.mapel;
    opt1.textContent = m.mapelIcon + " " + m.mapel;
    select.appendChild(opt1);

    const opt2 = document.createElement("option");
    opt2.value = m.mapel;
    opt2.textContent = m.mapelIcon + " " + m.mapel;
    filter.appendChild(opt2);
  });
}
isiDropdownMapel();

const state = {
  jenis: "gambar",
  fotoResized: null,
  allItems: [],
  guruNama: "",
};

/* ── Toggle jenis media ──────────────────────────────────────────── */
document.querySelectorAll(".ig-jenis-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    state.jenis = btn.dataset.jenis;
    document.querySelectorAll(".ig-jenis-btn").forEach((b) => b.classList.toggle("ig-active", b === btn));
    document.getElementById("wrap-gambar").classList.toggle("hidden", state.jenis !== "gambar");
    document.getElementById("wrap-video").classList.toggle("hidden", state.jenis !== "video");
  });
});

/* ── Resize gambar di klien (identik dengan pola pages/kelas/assets/kelas.js) ──────── */
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
      resolve({ dataUrl, base64: dataUrl.split(",")[1], mime: "image/jpeg" });
    };
    img.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function humanFileSize(base64) {
  const bytes = Math.round((base64.length * 3) / 4);
  if (bytes < 1024) return bytes + " B";
  return (bytes / 1024).toFixed(0) + " KB";
}

async function handleFotoFile(file) {
  if (!file) return;
  const statusEl = document.getElementById("form-status");
  statusEl.textContent = "Memproses gambar…";
  try {
    // Batas 1600px & kualitas 0.8 (sedikit lebih tinggi dari foto siswa di kelas.js) karena
    // gambar di sini akan dibuka lewat lightbox layar penuh, bukan cuma thumbnail kecil.
    const resized = await resizeImageFile(file, 1600, 0.8);
    state.fotoResized = resized;
    document.getElementById("foto-preview").src = resized.dataUrl;
    document.getElementById("foto-preview-wrap").classList.remove("hidden");
    document.getElementById("foto-size-info").textContent = "≈ " + humanFileSize(resized.base64) + " setelah dikompres";
    statusEl.textContent = "";
  } catch (err) {
    statusEl.textContent = "⚠️ Gagal memproses gambar: " + err.message;
    statusEl.classList.add("err");
  }
}

document.getElementById("btn-ambil-foto").addEventListener("click", () => document.getElementById("f-foto-kamera").click());
document.getElementById("f-foto-kamera").addEventListener("change", (e) => handleFotoFile(e.target.files[0]));
document.getElementById("btn-pilih-galeri").addEventListener("click", () => document.getElementById("f-foto-galeri").click());
document.getElementById("f-foto-galeri").addEventListener("change", (e) => handleFotoFile(e.target.files[0]));

/* ── parseJsonAman_: duplikat sengaja dari kelas.js (lihat komentar di sana) ────────── */
async function parseJsonAman_(res) {
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch (e) {
    if (/^\s*</.test(text)) {
      throw new Error("Google Apps Script tidak merespons dengan benar (kemungkinan lambat/timeout). Cek dulu daftar di bawah (akan dimuat ulang) sebelum mencoba lagi.");
    }
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

function resetForm() {
  document.getElementById("form-infografis").reset();
  state.fotoResized = null;
  document.getElementById("foto-preview-wrap").classList.add("hidden");
  document.getElementById("form-status").textContent = "";
  document.getElementById("form-status").classList.remove("err");
}

document.getElementById("form-infografis").addEventListener("submit", async (e) => {
  e.preventDefault();
  const mapel = document.getElementById("f-mapel").value;
  const judul = document.getElementById("f-judul").value.trim();
  if (!mapel || !judul) return;
  if (state.jenis === "gambar" && !state.fotoResized) {
    showToast("Pilih/ambil gambar dulu.", true);
    return;
  }
  const videoUrl = document.getElementById("f-video-url").value.trim();
  if (state.jenis === "video" && !videoUrl) {
    showToast("Isi tautan video dulu.", true);
    return;
  }

  const btn = document.getElementById("btn-simpan");
  btn.disabled = true;
  const statusEl = document.getElementById("form-status");
  statusEl.classList.remove("err");
  statusEl.textContent = state.jenis === "gambar" ? "Mengunggah gambar & menyimpan…" : "Menyimpan…";

  const payload = {
    type: "infografis",
    "Mapel": mapel,
    "Judul": judul,
    "Keterangan": document.getElementById("f-keterangan").value.trim(),
    "Jenis Media": state.jenis,
    "Diunggah Oleh": state.guruNama,
  };
  if (state.jenis === "gambar") {
    payload.fotoBase64 = state.fotoResized.base64;
    payload.fotoMime = state.fotoResized.mime;
  } else {
    payload["URL Media"] = videoUrl;
  }

  try {
    payload.idToken = await window.getFreshGuruIdToken();
    const res = await fetch(MPLS_CONFIG.APPS_SCRIPT_URL, { method: "POST", body: JSON.stringify(payload) });
    const json = await parseJsonAman_(res);
    if (json.status !== "ok") throw new Error(json.message || "Gagal menyimpan");
    showToast("Tersimpan: " + judul);
    resetForm();
    loadList();
  } catch (err) {
    statusEl.textContent = "⚠️ Gagal menyimpan: " + err.message;
    statusEl.classList.add("err");
    loadList();
  } finally {
    btn.disabled = false;
  }
});

/* ── Thumbnail gambar lewat proxy ?infografisFoto= (BUKAN fotoImgHtml/?foto= milik
 * foto-fallback.js — endpoint itu khusus foto siswa dan digerbang wajibGuru_ TANPA idToken
 * disertakan di URL gambar, jadi tidak cocok dipakai di sini). extractDriveFileId() sendiri
 * tetap dipakai ulang dari foto-fallback.js (sudah dimuat sebelum file ini di admin.html). */
function igThumbHtml(urlOrId, altText) {
  const id = extractDriveFileId(urlOrId);
  if (!id || typeof MPLS_CONFIG === "undefined" || !MPLS_CONFIG.APPS_SCRIPT_URL) {
    return '<div class="ig-list-thumb-video">🖼️</div>';
  }
  const src = MPLS_CONFIG.APPS_SCRIPT_URL + "?infografisFoto=" + encodeURIComponent(id);
  return '<img class="ig-list-thumb" src="' + src + '" alt="' + (altText || "") + '" onerror="igAdminThumbFallback(this)" />';
}

function igAdminThumbFallback(img) {
  const div = document.createElement("div");
  div.className = "ig-list-thumb-video";
  div.textContent = "🖼️";
  img.replaceWith(div);
}

/* ── Daftar media tersimpan + hapus ──────────────────────────────── */
function esc(str) {
  return String(str || "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

function renderList() {
  const wrap = document.getElementById("list-infografis");
  const filterMapel = document.getElementById("filter-mapel").value;
  const rows = state.allItems
    .filter((r) => !filterMapel || r["Mapel"] === filterMapel)
    .slice()
    .reverse();

  if (!rows.length) {
    wrap.innerHTML = '<div class="info-box">Belum ada media tersimpan.</div>';
    return;
  }

  wrap.innerHTML = rows.map((r) => {
    const isVideo = r["Jenis Media"] === "video";
    const thumb = isVideo
      ? '<div class="ig-list-thumb-video">▶️</div>'
      : igThumbHtml(r["URL Media"], esc(r["Judul"]));
    return `
      <div class="ig-list-item" data-id="${esc(r["ID"])}">
        ${thumb}
        <div class="ig-list-item-info">
          <div class="ig-list-item-title">${esc(r["Judul"])}</div>
          <div class="ig-list-item-meta">${esc(r["Mapel"])} · ${isVideo ? "Video" : "Gambar"}</div>
        </div>
        <button type="button" class="ig-btn-hapus" data-id="${esc(r["ID"])}">Hapus</button>
      </div>`;
  }).join("");

  wrap.querySelectorAll(".ig-btn-hapus").forEach((b) => {
    b.addEventListener("click", () => hapusItem(b.dataset.id));
  });
}

async function hapusItem(id) {
  if (!confirm("Hapus media ini dari Galeri Visual? (File aslinya tetap ada di folder Drive, hanya hilang dari tampilan situs.)")) return;
  try {
    const idToken = await window.getFreshGuruIdToken();
    const res = await fetch(MPLS_CONFIG.APPS_SCRIPT_URL, {
      method: "POST",
      body: JSON.stringify({ type: "infografis_hapus", "ID": id, idToken }),
    });
    const json = await parseJsonAman_(res);
    if (json.status !== "ok") throw new Error(json.message || "Gagal menghapus");
    showToast("Dihapus dari galeri.");
    loadList();
  } catch (err) {
    showToast("⚠️ Gagal menghapus: " + err.message, true);
  }
}

document.getElementById("filter-mapel").addEventListener("change", renderList);

async function loadList() {
  document.getElementById("list-infografis").innerHTML = '<div class="info-box">Memuat data…</div>';
  try {
    const res = await fetch(MPLS_CONFIG.APPS_SCRIPT_URL + "?infografis=1");
    const json = await parseJsonAman_(res);
    if (json.status === "error") throw new Error(json.message || "(tidak ada pesan error dari server)");
    state.allItems = json.data || [];
    renderList();
  } catch (err) {
    document.getElementById("list-infografis").innerHTML =
      '<div class="info-box" style="border-color:var(--danger)">Gagal memuat data: ' + esc(err.message) + "</div>";
  }
}

/* ── INIT (setelah lolos guard guru) ────────────────────────────── */
document.addEventListener("guru-verified", (e) => {
  document.getElementById("checking").remove();
  state.guruNama = (e.detail && e.detail.nama) || "";
  loadList();
});
document.addEventListener("DOMContentLoaded", () => window.guardGuruPage("../../index.html"));
