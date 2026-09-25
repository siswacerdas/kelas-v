/**
 * kelas.js — Hub Data Siswa (pages/kelas/index.html)
 * Backend: MPLS_CONFIG.APPS_SCRIPT_URL (sama modul MPLS).
 * UI: roster kartu → panel samping untuk tambah/edit.
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
  fotoResized: null,
};

/* ── Panel form ─────────────────────────────────────────── */
function bukaPanelForm(mode) {
  const wrap = document.getElementById("panel-form-wrap");
  const title = document.getElementById("panel-form-title");
  wrap.classList.remove("hidden");
  wrap.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
  if (title) title.textContent = mode === "edit" ? "Edit Data Siswa" : "Tambah / Lengkapi Data";
}

function tutupPanelForm() {
  const wrap = document.getElementById("panel-form-wrap");
  if (!wrap) return;
  wrap.classList.add("hidden");
  wrap.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

document.getElementById("btn-buka-tambah").addEventListener("click", () => {
  resetForm();
  bukaPanelForm("tambah");
});
document.getElementById("btn-tutup-form").addEventListener("click", tutupPanelForm);
document.getElementById("panel-form-backdrop").addEventListener("click", tutupPanelForm);
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") tutupPanelForm();
});

/* ── Resize foto ────────────────────────────────────────── */
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

async function parseJsonAman_(res) {
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch (e) {
    if (/^\s*</.test(text)) {
      throw new Error(
        "Google Apps Script tidak merespons dengan benar (kemungkinan lambat/timeout). " +
        "Data mungkin sudah tersimpan — cek daftar siswa sebelum menyimpan ulang."
      );
    }
    throw new Error("Respons tidak dikenali dari server: " + text.slice(0, 150));
  }
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

document.getElementById("btn-ambil-foto").addEventListener("click", () => {
  document.getElementById("f-foto-kamera").click();
});
document.getElementById("f-foto-kamera").addEventListener("change", (e) => {
  handleFotoFile(e.target.files[0]);
});
document.getElementById("btn-pilih-galeri").addEventListener("click", () => {
  document.getElementById("f-foto-galeri").click();
});
document.getElementById("f-foto-galeri").addEventListener("change", (e) => {
  handleFotoFile(e.target.files[0]);
});

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
    "NISN": document.getElementById("f-nisn").value.trim(),
  };
  if (state.fotoResized) {
    payload.fotoBase64 = state.fotoResized.base64;
    payload.fotoMime = state.fotoResized.mime;
  }

  try {
    payload.idToken = await window.getFreshGuruIdToken();
    const res = await fetch(MPLS_CONFIG.APPS_SCRIPT_URL, { method: "POST", body: JSON.stringify(payload) });
    const json = await parseJsonAman_(res);
    if (json.status !== "ok") throw new Error(json.message || "Gagal menyimpan");
    if (json.fotoWarning) {
      showToast("⚠️ " + json.fotoWarning, true);
    } else {
      showToast("Tersimpan: " + nama);
    }
    resetForm();
    tutupPanelForm();
    loadSiswaList();
  } catch (err) {
    statusEl.textContent = "⚠️ Gagal menyimpan: " + err.message;
    statusEl.classList.add("err");
    loadSiswaList();
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

function fillFormFromSiswa(s) {
  document.getElementById("f-nama").value = s["Nama Lengkap"] || "";
  document.getElementById("f-panggilan").value = s["Nama Panggilan"] || "";
  document.getElementById("f-tempat").value = s["Tempat Lahir"] || "";
  document.getElementById("f-tanggal").value = s["Tanggal Lahir"] || "";
  document.getElementById("f-nisn").value = s["NISN"] || "";
  state.fotoResized = null;
  document.getElementById("foto-preview-wrap").classList.add("hidden");
  document.getElementById("f-foto-kamera").value = "";
  document.getElementById("f-foto-galeri").value = "";

  const currentWrap = document.getElementById("foto-current-wrap");
  const currentFrame = document.getElementById("foto-current-frame");
  currentFrame.innerHTML = s["URL Foto"]
    ? fotoImgHtml(s["URL Foto"], "Foto tersimpan " + (s["Nama Lengkap"] || ""), "", '<div class="ph-empty">Foto<br/>gagal dimuat</div>')
    : '<div class="ph-empty">Belum ada<br/>foto tersimpan</div>';
  currentWrap.classList.remove("hidden");

  bukaPanelForm("edit");
}

function escText(str) {
  return String(str || "").replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
  );
}

function renderSiswaList(filterText) {
  const wrap = document.getElementById("list-siswa");
  const countEl = document.getElementById("kelas-count");
  const filter = (filterText || "").trim().toLowerCase();
  const rows = state.siswaList.filter((s) => !filter || String(s["Nama Lengkap"]).toLowerCase().includes(filter));

  if (countEl) {
    countEl.textContent = rows.length
      ? rows.length + " siswa" + (filter ? " (terfilter)" : "")
      : "";
  }

  if (!rows.length) {
    wrap.innerHTML = '<div class="kelas-empty">' +
      (filter ? "Tidak ada nama yang cocok." : "Belum ada data siswa tersimpan. Ketuk “+ Tambah / Lengkapi”.") +
      "</div>";
    return;
  }

  wrap.innerHTML = rows.map((s, idx) => {
    const nama = escText(s["Nama Lengkap"] || "—");
    const panggilan = s["Nama Panggilan"] ? escText(s["Nama Panggilan"]) : "";
    const nisn = s["NISN"] ? escText(s["NISN"]) : "";
    const foto = s["URL Foto"]
      ? fotoImgHtml(s["URL Foto"], "Foto " + (s["Nama Lengkap"] || ""), 'loading="lazy" class="siswa-card-foto"', '<div class="siswa-noimg">🧒</div>')
      : '<div class="siswa-noimg">🧒</div>';
    return (
      '<button type="button" class="siswa-card" data-idx="' + idx + '">' +
        foto +
        '<div class="siswa-card-name">' + nama + "</div>" +
        (panggilan ? '<div class="siswa-card-meta">' + panggilan + "</div>" : "") +
        '<span class="siswa-card-nisn' + (nisn ? "" : " missing") + '">' +
          (nisn ? "NISN " + nisn : "NISN belum diisi") +
        "</span>" +
      "</button>"
    );
  }).join("");

  wrap.querySelectorAll(".siswa-card").forEach((el) => {
    el.addEventListener("click", () => fillFormFromSiswa(rows[Number(el.dataset.idx)]));
  });
}

/** Muat daftar dengan 1x retry otomatis jika gagal teknis (404 proxy Apps Script). */
async function fetchSiswaDenganRetry_() {
  const idToken = await window.getFreshGuruIdToken();
  const url = MPLS_CONFIG.APPS_SCRIPT_URL + "?siswa=1&idToken=" + encodeURIComponent(idToken);
  let lastErr;
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const res = await fetch(url);
      if (!res.ok && res.status === 404 && attempt < 2) {
        await new Promise((r) => setTimeout(r, 800));
        continue;
      }
      const json = await parseJsonAman_(res);
      if (json.status === "error") throw new Error(json.message || "(tidak ada pesan error dari server)");
      return json;
    } catch (err) {
      lastErr = err;
      const msg = String(err.message || err);
      const teknis = /404|Failed to fetch|NetworkError|tidak merespons|timeout/i.test(msg);
      if (teknis && attempt < 2) {
        await new Promise((r) => setTimeout(r, 800));
        continue;
      }
      throw err;
    }
  }
  throw lastErr;
}

async function loadSiswaList() {
  document.getElementById("list-siswa").innerHTML = '<div class="kelas-empty">Memuat data…</div>';
  try {
    const json = await fetchSiswaDenganRetry_();
    state.siswaList = (json.data || []).slice().sort((a, b) =>
      String(a["Nama Lengkap"] || "").localeCompare(String(b["Nama Lengkap"] || ""), "id", { sensitivity: "base" })
    );
    renderSiswaList(document.getElementById("search-siswa").value);
  } catch (err) {
    document.getElementById("list-siswa").innerHTML =
      '<div class="kelas-empty" style="border-color:var(--danger);color:var(--danger)">Gagal memuat data: ' +
      escText(err.message) +
      "<br><button type=\"button\" class=\"btn btn-secondary\" id=\"btn-retry-load\" style=\"margin-top:12px\">Coba lagi</button></div>";
    const btn = document.getElementById("btn-retry-load");
    if (btn) btn.addEventListener("click", loadSiswaList);
  }
}

document.getElementById("search-siswa").addEventListener("input", (e) => renderSiswaList(e.target.value));

document.getElementById("btn-impor-nisn").addEventListener("click", async () => {
  const raw = document.getElementById("f-impor-nisn").value;
  const hasilEl = document.getElementById("impor-nisn-hasil");
  const rows = raw.split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const idx = line.indexOf(",");
      if (idx === -1) return null;
      return { nama: line.slice(0, idx).trim(), nisn: line.slice(idx + 1).trim() };
    })
    .filter(Boolean);

  if (!rows.length) {
    hasilEl.innerHTML = '<p class="warn-line">Tidak ada baris valid — format "Nama, NISN" per baris.</p>';
    return;
  }

  const btn = document.getElementById("btn-impor-nisn");
  btn.disabled = true;
  hasilEl.textContent = "Mengimpor " + rows.length + " baris…";

  try {
    const idToken = await window.getFreshGuruIdToken();
    const res = await fetch(MPLS_CONFIG.APPS_SCRIPT_URL, {
      method: "POST",
      body: JSON.stringify({ type: "siswa_nisn_bulk", idToken: idToken, rows: rows }),
    });
    const json = await parseJsonAman_(res);
    if (json.status !== "ok") throw new Error(json.message || "Gagal mengimpor");

    let html = '<p class="ok-line">✓ ' + json.diperbarui.length + " dari " + rows.length + " baris berhasil diperbarui.</p>";
    if (json.diperbarui.length) {
      html += "<ul>" + json.diperbarui.map((n) => "<li>" + escText(n) + "</li>").join("") + "</ul>";
    }
    if (json.tidakDitemukan && json.tidakDitemukan.length) {
      html += '<p class="warn-line">⚠️ ' + json.tidakDitemukan.length + " baris TIDAK berhasil:</p>";
      html += "<ul>" + json.tidakDitemukan.map((r) =>
        "<li>" + escText(r.nama) + " (" + escText(r.nisn) + ") — " + escText(r.alasan) + "</li>"
      ).join("") + "</ul>";
    }
    hasilEl.innerHTML = html;
    loadSiswaList();
  } catch (err) {
    hasilEl.innerHTML = '<p class="warn-line">⚠️ Gagal mengimpor: ' + escText(err.message) + "</p>";
  } finally {
    btn.disabled = false;
  }
});

document.addEventListener("guru-verified", () => {
  const c = document.getElementById("checking");
  if (c) c.remove();
  loadSiswaList();
});
document.addEventListener("DOMContentLoaded", () => window.guardGuruPage("../../index.html"));
