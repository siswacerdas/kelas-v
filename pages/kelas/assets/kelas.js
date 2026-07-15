/**
 * kelas.js — logika halaman pages/kelas/index.html
 * Bergantung pada MPLS_CONFIG dari ../mpls/assets/config.js (dimuat sebelum file ini),
 * karena backend Apps Script yang dipakai sama dengan modul MPLS (1 spreadsheet).
 */

/* ── ISI DROPDOWN NAMA DARI DAFTAR SISWA KELAS 5A ───────────────────
 * Memakai MPLS_STUDENTS yang sama dengan modul MPLS (mpls-data.js),
 * supaya nama di "Data Siswa" selalu konsisten dengan nama di penilaian MPLS.
 */
function isiDropdownNama() {
  const select = document.getElementById("f-nama");
  MPLS_STUDENTS.forEach((nama) => {
    const opt = document.createElement("option");
    opt.value = nama;
    opt.textContent = nama;
    select.appendChild(opt);
  });
}
isiDropdownNama();

const state = {
  siswaList: [],
  fotoResized: null, // { base64, mime } hasil resize, null kalau tidak ganti foto
};

/* ── RESIZE FOTO DI KLIEN ────────────────────────────────────────────
 * Supaya ukuran file relevan & optimal untuk dilihat di smartphone:
 * perkecil sisi terpanjang maksimal 1280px, kompres JPEG kualitas 0.75.
 */
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
  document.getElementById("form-status").textContent = "Memproses foto…";
  try {
    const resized = await resizeImageFile(file, 1280, 0.75);
    state.fotoResized = resized;
    document.getElementById("foto-preview").src = resized.dataUrl;
    document.getElementById("foto-preview-wrap").classList.remove("hidden");
    document.getElementById("foto-size-info").textContent = "≈ " + humanFileSize(resized.base64) + " setelah dikompres";
    document.getElementById("form-status").textContent = "";
  } catch (err) {
    document.getElementById("form-status").textContent = "Gagal memproses foto: " + err.message;
    document.getElementById("form-status").classList.add("err");
  }
}

// Tombol "Ambil Foto" -> buka kamera langsung (capture="environment")
document.getElementById("btn-ambil-foto").addEventListener("click", () => {
  document.getElementById("f-foto-kamera").click();
});
document.getElementById("f-foto-kamera").addEventListener("change", (e) => {
  handleFotoFile(e.target.files[0]);
});

// Tombol "Pilih dari Galeri" -> buka galeri/album foto (tanpa capture, jadi tidak memaksa kamera)
document.getElementById("btn-pilih-galeri").addEventListener("click", () => {
  document.getElementById("f-foto-galeri").click();
});
document.getElementById("f-foto-galeri").addEventListener("change", (e) => {
  handleFotoFile(e.target.files[0]);
});

/* ── FORM SIMPAN ─────────────────────────────────────────────────── */
function resetForm() {
  document.getElementById("form-siswa").reset();
  state.fotoResized = null;
  document.getElementById("foto-preview-wrap").classList.add("hidden");
  document.getElementById("foto-current-wrap").classList.add("hidden");
  document.getElementById("foto-current-frame").innerHTML = "";
  document.getElementById("form-status").textContent = "";
  document.getElementById("form-status").classList.remove("err");
}
document.getElementById("btn-reset-form").addEventListener("click", resetForm);

document.getElementById("form-siswa").addEventListener("submit", async (e) => {
  e.preventDefault();
  const nama = document.getElementById("f-nama").value.trim();
  if (!nama) return;

  const btn = document.getElementById("btn-simpan-siswa");
  btn.disabled = true;
  const statusEl = document.getElementById("form-status");
  statusEl.classList.remove("err");
  statusEl.textContent = state.fotoResized ? "Mengunggah foto & menyimpan…" : "Menyimpan…";

  const payload = {
    type: "siswa",
    "Nama Lengkap": nama,
    "Nama Panggilan": document.getElementById("f-panggilan").value.trim(),
    "Tempat Lahir": document.getElementById("f-tempat").value.trim(),
    "Tanggal Lahir": document.getElementById("f-tanggal").value,
  };
  if (state.fotoResized) {
    payload.fotoBase64 = state.fotoResized.base64;
    payload.fotoMime = state.fotoResized.mime;
  }

  try {
    const res = await fetch(MPLS_CONFIG.APPS_SCRIPT_URL, { method: "POST", body: JSON.stringify(payload) });
    const json = await res.json();
    if (json.status !== "ok") throw new Error(json.message || "Gagal menyimpan");
    if (json.fotoWarning) {
      showToast("⚠️ " + json.fotoWarning, true);
    } else {
      showToast("Tersimpan: " + nama);
    }
    resetForm();
    loadSiswaList();
  } catch (err) {
    statusEl.textContent = "⚠️ Gagal menyimpan: " + err.message;
    statusEl.classList.add("err");
  } finally {
    btn.disabled = false;
  }
});

function showToast(msg, isErr) {
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.classList.toggle("err", !!isErr);
  t.classList.add("show");
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => t.classList.remove("show"), isErr ? 6000 : 2600);
}

/* ── DAFTAR SISWA ────────────────────────────────────────────────── */
function fillFormFromSiswa(s) {
  document.getElementById("f-nama").value = s["Nama Lengkap"] || "";
  document.getElementById("f-panggilan").value = s["Nama Panggilan"] || "";
  document.getElementById("f-tempat").value = s["Tempat Lahir"] || "";
  document.getElementById("f-tanggal").value = s["Tanggal Lahir"] || "";
  state.fotoResized = null;
  document.getElementById("foto-preview-wrap").classList.add("hidden");
  document.getElementById("f-foto-kamera").value = "";
  document.getElementById("f-foto-galeri").value = "";

  // v0.5.4: tampilkan status foto yang SUDAH tersimpan untuk siswa ini, supaya guru
  // tahu apakah perlu mengambil foto baru atau tidak — sebelumnya form tidak menunjukkan
  // apa-apa soal foto lama, jadi tidak kelihatan apakah upload sebelumnya benar berhasil.
  const currentWrap = document.getElementById("foto-current-wrap");
  const currentFrame = document.getElementById("foto-current-frame");
  currentFrame.innerHTML = s["URL Foto"]
    ? fotoImgHtml(s["URL Foto"], "Foto tersimpan " + (s["Nama Lengkap"] || ""), "", '<div class="ph-empty">Foto<br/>gagal dimuat</div>')
    : '<div class="ph-empty">Belum ada<br/>foto tersimpan</div>';
  currentWrap.classList.remove("hidden");

  window.scrollTo({ top: 0, behavior: "smooth" });
}

function renderSiswaList(filterText) {
  const wrap = document.getElementById("list-siswa");
  const filter = (filterText || "").trim().toLowerCase();
  const rows = state.siswaList.filter((s) => !filter || String(s["Nama Lengkap"]).toLowerCase().includes(filter));

  if (!rows.length) {
    wrap.innerHTML = '<div class="info-box">Belum ada data siswa tersimpan.</div>';
    return;
  }

  wrap.innerHTML = rows.map((s, idx) => `
    <div class="siswa-item" data-idx="${idx}">
      ${s["URL Foto"]
        ? fotoImgHtml(s["URL Foto"], "Foto " + (s["Nama Lengkap"] || ""), 'loading="lazy"', '<div class="siswa-noimg">🧒</div>')
        : `<div class="siswa-noimg">🧒</div>`}
      <div class="siswa-item-info">
        <div class="siswa-item-name">${s["Nama Lengkap"] || "—"}</div>
        <div class="siswa-item-meta">${s["Nama Panggilan"] ? "Panggilan: " + s["Nama Panggilan"] + " · " : ""}${s["Tempat Lahir"] || "-"}, ${s["Tanggal Lahir"] || "-"}</div>
      </div>
    </div>`
  ).join("");

  wrap.querySelectorAll(".siswa-item").forEach((el) => {
    el.addEventListener("click", () => fillFormFromSiswa(rows[Number(el.dataset.idx)]));
  });
}

async function loadSiswaList() {
  document.getElementById("list-siswa").innerHTML = '<div class="info-box">Memuat data…</div>';
  try {
    const res = await fetch(MPLS_CONFIG.APPS_SCRIPT_URL + "?siswa=1");
    const json = await res.json();
    state.siswaList = json.data || [];
    renderSiswaList("");
  } catch (err) {
    document.getElementById("list-siswa").innerHTML = '<div class="info-box" style="border-color:var(--danger)">Gagal memuat data: ' + err.message + '</div>';
  }
}

document.getElementById("search-siswa").addEventListener("input", (e) => renderSiswaList(e.target.value));

/* ── INIT (setelah lolos guard guru) ────────────────────────────── */
document.addEventListener("guru-verified", () => {
  document.getElementById("checking").remove();
  loadSiswaList();
});
document.addEventListener("DOMContentLoaded", () => window.guardGuruPage("../../index.html"));
