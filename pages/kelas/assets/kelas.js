/**
 * kelas.js — Hub Data Siswa (Tahap 1: roster → detail profil)
 * Backend: MPLS_CONFIG.APPS_SCRIPT_URL
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
  currentSiswa: null, // objek siswa yang sedang dibuka di detail
  ringkasanCache: {}, // nama -> { html, at } — hindari fetch ulang saat bolak-balik tab
};

/* ── Navigasi roster ↔ detail ───────────────────────────── */
function tampilkanRoster() {
  document.getElementById("view-roster").classList.remove("hidden");
  document.getElementById("view-detail").classList.add("hidden");
  state.currentSiswa = null;
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function tampilkanDetail() {
  document.getElementById("view-roster").classList.add("hidden");
  document.getElementById("view-detail").classList.remove("hidden");
  pilihTabDetail("identitas");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function pilihTabDetail(nama) {
  document.querySelectorAll(".kelas-tab").forEach((btn) => {
    const on = btn.getAttribute("data-tab") === nama;
    btn.classList.toggle("active", on);
    btn.setAttribute("aria-selected", on ? "true" : "false");
  });
  document.getElementById("tab-identitas").classList.toggle("hidden", nama !== "identitas");
  document.getElementById("tab-ringkasan").classList.toggle("hidden", nama !== "ringkasan");
  if (nama === "ringkasan") {
    muatRingkasanJikaPerlu_();
  }
}

document.getElementById("btn-kembali-roster").addEventListener("click", tampilkanRoster);
document.querySelectorAll(".kelas-tab").forEach((btn) => {
  btn.addEventListener("click", () => pilihTabDetail(btn.getAttribute("data-tab")));
});

function updateDetailHero(s) {
  const fotoEl = document.getElementById("detail-foto");
  const namaEl = document.getElementById("detail-nama");
  const panggilEl = document.getElementById("detail-panggilan");
  const nisnEl = document.getElementById("detail-nisn");
  const titleForm = document.getElementById("panel-form-title");

  if (!s) {
    fotoEl.innerHTML = '<div class="siswa-noimg">🧒</div>';
    namaEl.textContent = "Tambah / Lengkapi Data";
    panggilEl.textContent = "Pilih nama resmi dari daftar kelas, lalu isi NISN.";
    nisnEl.textContent = "";
    if (titleForm) titleForm.textContent = "Data identitas baru";
    return;
  }

  namaEl.textContent = s["Nama Lengkap"] || "—";
  panggilEl.textContent = s["Nama Panggilan"]
    ? "Panggilan: " + s["Nama Panggilan"]
    : "Belum ada nama panggilan";
  nisnEl.textContent = s["NISN"] ? "NISN " + s["NISN"] : "NISN belum diisi";
  if (titleForm) titleForm.textContent = "Data identitas";

  if (s["URL Foto"]) {
    fotoEl.innerHTML = fotoImgHtml(
      s["URL Foto"],
      "Foto " + (s["Nama Lengkap"] || ""),
      'class="siswa-card-foto"',
      '<div class="siswa-noimg">🧒</div>'
    );
  } else {
    fotoEl.innerHTML = '<div class="siswa-noimg">🧒</div>';
  }
}

document.getElementById("btn-buka-tambah").addEventListener("click", () => {
  resetForm();
  state.currentSiswa = null;
  updateDetailHero(null);
  tampilkanDetail();
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
    document.getElementById("foto-size-info").textContent =
      "≈ " + humanFileSize(resized.base64) + " setelah dikompres";
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
    const res = await fetch(MPLS_CONFIG.APPS_SCRIPT_URL, {
      method: "POST",
      body: JSON.stringify(payload),
    });
    const json = await parseJsonAman_(res);
    if (json.status !== "ok") throw new Error(json.message || "Gagal menyimpan");
    if (json.fotoWarning) {
      showToast("⚠️ " + json.fotoWarning, true);
    } else {
      showToast("Tersimpan: " + nama);
    }
    await loadSiswaList();
    delete state.ringkasanCache[nama];
    // Tetap di detail siswa yang baru disimpan jika ada di daftar
    const updated = state.siswaList.find((s) => s["Nama Lengkap"] === nama);
    if (updated) {
      fillFormFromSiswa(updated);
    } else {
      tampilkanRoster();
    }
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
  state.currentSiswa = s;
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
    ? fotoImgHtml(
        s["URL Foto"],
        "Foto tersimpan " + (s["Nama Lengkap"] || ""),
        "",
        '<div class="ph-empty">Foto<br/>gagal dimuat</div>'
      )
    : '<div class="ph-empty">Belum ada<br/>foto tersimpan</div>';
  currentWrap.classList.remove("hidden");

  updateDetailHero(s);
  tampilkanDetail();
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
  const rows = state.siswaList.filter(
    (s) => !filter || String(s["Nama Lengkap"]).toLowerCase().includes(filter)
  );

  if (countEl) {
    countEl.textContent = rows.length
      ? rows.length + " siswa" + (filter ? " (terfilter)" : "")
      : "";
  }

  if (!rows.length) {
    wrap.innerHTML =
      '<div class="kelas-empty">' +
      (filter
        ? "Tidak ada nama yang cocok."
        : "Belum ada data siswa tersimpan. Ketuk “+ Tambah / Lengkapi”.") +
      "</div>";
    return;
  }

  wrap.innerHTML = rows
    .map((s, idx) => {
      const nama = escText(s["Nama Lengkap"] || "—");
      const panggilan = s["Nama Panggilan"] ? escText(s["Nama Panggilan"]) : "";
      const nisn = s["NISN"] ? escText(s["NISN"]) : "";
      const foto = s["URL Foto"]
        ? fotoImgHtml(
            s["URL Foto"],
            "Foto " + (s["Nama Lengkap"] || ""),
            'loading="lazy" class="siswa-card-foto"',
            '<div class="siswa-noimg">🧒</div>'
          )
        : '<div class="siswa-noimg">🧒</div>';
      return (
        '<button type="button" class="siswa-card" data-idx="' +
        idx +
        '">' +
        foto +
        '<div class="siswa-card-name">' +
        nama +
        "</div>" +
        (panggilan ? '<div class="siswa-card-meta">' + panggilan + "</div>" : "") +
        '<span class="siswa-card-nisn' +
        (nisn ? "" : " missing") +
        '">' +
        (nisn ? "NISN " + nisn : "NISN belum diisi") +
        "</span>" +
        "</button>"
      );
    })
    .join("");

  wrap.querySelectorAll(".siswa-card").forEach((el) => {
    el.addEventListener("click", () => fillFormFromSiswa(rows[Number(el.dataset.idx)]));
  });
}

async function fetchSiswaDenganRetry_() {
  const idToken = await window.getFreshGuruIdToken();
  const url =
    MPLS_CONFIG.APPS_SCRIPT_URL + "?siswa=1&idToken=" + encodeURIComponent(idToken);
  let lastErr;
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const res = await fetch(url);
      if (!res.ok && res.status === 404 && attempt < 2) {
        await new Promise((r) => setTimeout(r, 800));
        continue;
      }
      const json = await parseJsonAman_(res);
      if (json.status === "error") {
        throw new Error(json.message || "(tidak ada pesan error dari server)");
      }
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
  document.getElementById("list-siswa").innerHTML =
    '<div class="kelas-empty">Memuat data…</div>';
  try {
    const json = await fetchSiswaDenganRetry_();
    state.siswaList = (json.data || []).slice().sort((a, b) =>
      String(a["Nama Lengkap"] || "").localeCompare(String(b["Nama Lengkap"] || ""), "id", {
        sensitivity: "base",
      })
    );
    renderSiswaList(document.getElementById("search-siswa").value);
  } catch (err) {
    document.getElementById("list-siswa").innerHTML =
      '<div class="kelas-empty" style="border-color:var(--danger);color:var(--danger)">Gagal memuat data: ' +
      escText(err.message) +
      '<br><button type="button" class="btn btn-secondary" id="btn-retry-load" style="margin-top:12px">Coba lagi</button></div>';
    const btn = document.getElementById("btn-retry-load");
    if (btn) btn.addEventListener("click", loadSiswaList);
  }
}

document.getElementById("search-siswa").addEventListener("input", (e) =>
  renderSiswaList(e.target.value)
);

document.getElementById("btn-impor-nisn").addEventListener("click", async () => {
  const raw = document.getElementById("f-impor-nisn").value;
  const hasilEl = document.getElementById("impor-nisn-hasil");
  const rows = raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const idx = line.indexOf(",");
      if (idx === -1) return null;
      return { nama: line.slice(0, idx).trim(), nisn: line.slice(idx + 1).trim() };
    })
    .filter(Boolean);

  if (!rows.length) {
    hasilEl.innerHTML =
      '<p class="warn-line">Tidak ada baris valid — format "Nama, NISN" per baris.</p>';
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

    let html =
      '<p class="ok-line">✓ ' +
      json.diperbarui.length +
      " dari " +
      rows.length +
      " baris berhasil diperbarui.</p>";
    if (json.diperbarui.length) {
      html +=
        "<ul>" +
        json.diperbarui.map((n) => "<li>" + escText(n) + "</li>").join("") +
        "</ul>";
    }
    if (json.tidakDitemukan && json.tidakDitemukan.length) {
      html +=
        '<p class="warn-line">⚠️ ' +
        json.tidakDitemukan.length +
        " baris TIDAK berhasil:</p>";
      html +=
        "<ul>" +
        json.tidakDitemukan
          .map(
            (r) =>
              "<li>" +
              escText(r.nama) +
              " (" +
              escText(r.nisn) +
              ") — " +
              escText(r.alasan) +
              "</li>"
          )
          .join("") +
        "</ul>";
    }
    hasilEl.innerHTML = html;
    loadSiswaList();
  } catch (err) {
    hasilEl.innerHTML =
      '<p class="warn-line">⚠️ Gagal mengimpor: ' + escText(err.message) + "</p>";
  } finally {
    btn.disabled = false;
  }
});


/* ── Tahap 2: Ringkasan belajar (progres materi/modul/pustaka) ── */
async function fetchProgresDenganRetry_(payload) {
  const url = MPLS_CONFIG.APPS_SCRIPT_URL;
  async function sekali() {
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), 20000);
    try {
      const res = await fetch(url, {
        method: "POST",
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
      const text = await res.text();
      try {
        return JSON.parse(text);
      } catch (e) {
        if (/^\s*</.test(text)) throw new Error("Proxy Apps Script mengembalikan HTML (sering 404 sementara)");
        throw new Error("Respons bukan JSON");
      }
    } finally {
      clearTimeout(t);
    }
  }
  try {
    return await sekali();
  } catch (err) {
    await new Promise((r) => setTimeout(r, 800));
    return await sekali();
  }
}

function formatWaktuRingkas_(timestampStr) {
  if (!timestampStr) return "";
  const d = new Date(timestampStr);
  if (isNaN(d.getTime())) return "";
  const now = new Date();
  const start = (x) => new Date(x.getFullYear(), x.getMonth(), x.getDate());
  const diff = Math.round((start(now) - start(d)) / 86400000);
  const jam = d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
  if (diff === 0) return "Hari ini, " + jam;
  if (diff === 1) return "Kemarin, " + jam;
  if (diff > 1 && diff <= 6) return diff + " hari lalu";
  return d.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
}

function muatRingkasanJikaPerlu_() {
  const s = state.currentSiswa;
  const wrap = document.getElementById("ringkasan-content");
  if (!wrap) return;
  if (!s || !s["Nama Lengkap"]) {
    wrap.innerHTML =
      '<div class="kelas-empty">Buka profil siswa dari daftar, atau lengkapi data lewat “+ Tambah / Lengkapi”, untuk melihat ringkasan belajar.</div>';
    return;
  }
  const nama = s["Nama Lengkap"];
  const cached = state.ringkasanCache[nama];
  if (cached && Date.now() - cached.at < 60 * 1000) {
    wrap.innerHTML = cached.html;
    return;
  }
  loadRingkasanBelajar_(nama);
}

async function loadRingkasanBelajar_(nama) {
  const wrap = document.getElementById("ringkasan-content");
  if (!wrap) return;
  wrap.innerHTML = '<div class="kelas-empty">Memuat ringkasan belajar…</div>';

  try {
    const idToken = await window.getFreshGuruIdToken();
    const [jsonMateri, jsonModul, jsonPustaka] = await Promise.all([
      fetchProgresDenganRetry_({ type: "get_progres_materi", nama: nama, idToken: idToken }),
      fetchProgresDenganRetry_({ type: "get_progres_modul", nama: nama, idToken: idToken }),
      fetchProgresDenganRetry_({ type: "get_progres_pustaka", nama: nama, idToken: idToken }),
    ]);

    if (jsonMateri.status === "error") throw new Error(jsonMateri.message || "Gagal memuat materi");
    if (jsonModul.status === "error") throw new Error(jsonModul.message || "Gagal memuat modul");
    if (jsonPustaka.status === "error") throw new Error(jsonPustaka.message || "Gagal memuat pustaka");

    const materiRows = jsonMateri.data || [];
    const modulRows = jsonModul.data || [];
    const pustakaRows = jsonPustaka.data || [];

    // Aktivitas terbaru (gabungan, max 5)
    const aktivitas = [];
    materiRows.forEach((r) => {
      if (r["Timestamp"]) aktivitas.push({ ts: r["Timestamp"], label: "Ingat Lagi", slug: r["Materi Slug"] || "" });
    });
    modulRows.forEach((r) => {
      if (r["Timestamp"]) {
        aktivitas.push({
          ts: r["Timestamp"],
          label: r["Sumber"] === "Manual (Guru)" ? "Modul (ditandai guru)" : "Ayo Belajar",
          slug: r["Modul Slug"] || "",
        });
      }
    });
    pustakaRows.forEach((r) => {
      if (r["Timestamp"]) aktivitas.push({ ts: r["Timestamp"], label: "Pustaka", slug: r["Pustaka ID"] || "" });
    });
    aktivitas.sort((a, b) => new Date(b.ts) - new Date(a.ts));
    const topAkt = aktivitas.slice(0, 5);

    const q = encodeURIComponent(nama);
    let html = '<div class="kelas-stat-grid">';
    html +=
      '<div class="kelas-stat"><div class="kelas-stat-num">' +
      materiRows.length +
      '</div><div class="kelas-stat-label">Materi tercatat<br><span>(Ingat Lagi)</span></div></div>';
    html +=
      '<div class="kelas-stat"><div class="kelas-stat-num">' +
      modulRows.length +
      '</div><div class="kelas-stat-label">Modul selesai<br><span>(Ayo Belajar)</span></div></div>';
    html +=
      '<div class="kelas-stat"><div class="kelas-stat-num">' +
      pustakaRows.length +
      '</div><div class="kelas-stat-label">Pustaka dibaca<br><span>(PDF)</span></div></div>';
    html += "</div>";

    if (topAkt.length) {
      html += '<p class="kelas-ring-section-title">Aktivitas terbaru</p><ul class="kelas-akt-list">';
      topAkt.forEach((a) => {
        html +=
          "<li><span class=\"kelas-akt-label\">" +
          escText(a.label) +
          '</span><span class="kelas-akt-time">' +
          escText(formatWaktuRingkas_(a.ts)) +
          "</span></li>";
      });
      html += "</ul>";
    } else {
      html +=
        '<p class="kelas-ring-empty-note">Belum ada aktivitas belajar mandiri yang tercatat untuk siswa ini.</p>';
    }

    html += '<p class="kelas-ring-section-title">Laporan lengkap</p>';
    html += '<div class="kelas-ring-links">';
    html +=
      '<a class="kelas-ring-link" href="../laporan-siswa/belajar-mandiri.html">📖 Perkembangan Belajar Mandiri</a>';
    html +=
      '<a class="kelas-ring-link" href="../laporan-siswa/latihan-mandiri.html">💪 Latihan / Uji Kemampuan</a>';
    html +=
      '<a class="kelas-ring-link" href="../laporan-siswa/mpls.html">🧭 Laporan MPLS</a>';
    html +=
      '<a class="kelas-ring-link" href="../laporan-siswa.html">📊 Semua jenis laporan</a>';
    html += "</div>";
    html +=
      '<p class="kelas-placeholder-note">Angka di atas dihitung dari catatan server (bukan total kurikulum). Buka laporan lengkap untuk rincian per mapel. Pilih nama <strong>' +
      escText(nama) +
      "</strong> di halaman laporan jika diminta.</p>";

    wrap.innerHTML = html;
    state.ringkasanCache[nama] = { html: html, at: Date.now() };
  } catch (err) {
    wrap.innerHTML =
      '<div class="kelas-empty" style="border-color:var(--danger)">Gagal memuat ringkasan: ' +
      escText(err.message) +
      '<br><button type="button" class="btn btn-secondary" id="btn-retry-ringkasan" style="margin-top:12px">Coba lagi</button></div>';
    const b = document.getElementById("btn-retry-ringkasan");
    if (b) {
      b.addEventListener("click", () => {
        delete state.ringkasanCache[nama];
        loadRingkasanBelajar_(nama);
      });
    }
  }
}

document.addEventListener("guru-verified", () => {
  const c = document.getElementById("checking");
  if (c) c.remove();
  loadSiswaList();
});
document.addEventListener("DOMContentLoaded", () =>
  window.guardGuruPage("../../index.html")
);
