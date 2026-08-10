/**
 * laporan.js — logika pages/laporan-siswa.html
 * Bergantung pada: MPLS_CONFIG (config.js), window.getFreshLaporanIdToken() (inline script di
 * laporan-siswa.html), dan event "laporan-context-ready" (detail: { role, nama, anak }).
 *
 * Rancangan lengkap: lihat RANCANGAN-LAPORAN-SISWA.md — ini implementasi Fase 1 (Profil, MPLS
 * non-kognitif, MPLS Kognitif, Jurnal Aktivitas — SEMUA data yang SUDAH ada di sistem; Hasil
 * Latihan Bank Soal & Progres Materi menyusul di Fase 2/3 terpisah, belum ada di sini).
 */

let ctx = null; // { role, nama, anak } dari event laporan-context-ready
const collapsedSections = new Set(); // label section yang sedang ditutup, sama pola dengan galeri.html

function esc(str) {
  return String(str || "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

/* ── Langkah 1: pemilih siswa ───────────────────────────────────────────── */
async function renderPicker() {
  const wrap = document.getElementById("lap-picker");
  document.getElementById("lap-report").innerHTML = "";

  if (ctx.role === "orangtua") {
    if (!ctx.anak.length) {
      wrap.innerHTML = '<div class="ma-empty">Akun ini belum terhubung ke data siswa mana pun. Hubungi wali kelas untuk melengkapi data ini.</div>';
      return;
    }
    if (ctx.anak.length === 1) {
      wrap.innerHTML = "";
      loadReport(ctx.anak[0]);
      return;
    }
    wrap.innerHTML = '<div class="lap-anak-chips">' +
      ctx.anak.map((n) => `<button type="button" class="lap-anak-chip" data-nama="${esc(n)}">${esc(n)}</button>`).join("") +
      "</div>";
    wrap.querySelectorAll(".lap-anak-chip").forEach((btn) => {
      btn.addEventListener("click", () => {
        wrap.querySelectorAll(".lap-anak-chip").forEach((b) => b.classList.remove("lap-active"));
        btn.classList.add("lap-active");
        loadReport(btn.dataset.nama);
      });
    });
    return;
  }

  // role === "guru" — cari/pilih siapa saja dari daftar siswa
  wrap.innerHTML = '<div class="ma-empty">Memuat daftar siswa…</div>';
  try {
    const idToken = await window.getFreshLaporanIdToken();
    const res = await fetch(MPLS_CONFIG.APPS_SCRIPT_URL + "?siswa=1&idToken=" + encodeURIComponent(idToken));
    const json = await res.json();
    if (json.status === "error") throw new Error(json.message || "Gagal memuat daftar siswa");
    const semuaSiswa = (json.data || []).map((r) => r["Nama Lengkap"]).filter(Boolean).sort();
    renderGuruPicker(semuaSiswa);
  } catch (err) {
    wrap.innerHTML = '<div class="ma-empty">Gagal memuat daftar siswa: ' + esc(err.message) + "</div>";
  }
}

function renderGuruPicker(semuaSiswa) {
  const wrap = document.getElementById("lap-picker");
  wrap.innerHTML = `
    <input type="text" class="lap-search" id="lap-cari" placeholder="Cari nama siswa…" />
    <div class="lap-list" id="lap-list"></div>`;
  const listEl = document.getElementById("lap-list");
  function renderRows(filter) {
    const f = (filter || "").toLowerCase();
    const filtered = semuaSiswa.filter((n) => n.toLowerCase().includes(f));
    if (!filtered.length) {
      listEl.innerHTML = '<div class="lap-kosong">Tidak ada siswa yang cocok.</div>';
      return;
    }
    listEl.innerHTML = filtered.map((n) => `<button type="button" class="lap-list-item" data-nama="${esc(n)}">${esc(n)}</button>`).join("");
    listEl.querySelectorAll(".lap-list-item").forEach((btn) => {
      btn.addEventListener("click", () => loadReport(btn.dataset.nama));
    });
  }
  renderRows("");
  document.getElementById("lap-cari").addEventListener("input", (e) => renderRows(e.target.value));
}

/* ── Langkah 2: muat & render laporan 1 siswa ───────────────────────────── */
async function loadReport(nama) {
  const wrap = document.getElementById("lap-report");
  wrap.innerHTML = '<div class="ma-empty">Memuat laporan…</div>';
  document.getElementById("lap-subtitle").textContent = "Laporan untuk " + nama;
  try {
    const idToken = await window.getFreshLaporanIdToken();
    const url = MPLS_CONFIG.APPS_SCRIPT_URL + "?laporanSiswa=1&nama=" + encodeURIComponent(nama) +
      "&idToken=" + encodeURIComponent(idToken);
    const res = await fetch(url);
    const json = await res.json();
    if (json.status === "error") throw new Error(json.message || "Gagal memuat laporan");
    renderReport(nama, json);
  } catch (err) {
    wrap.innerHTML = '<div class="ma-empty">Gagal memuat laporan: ' + esc(err.message) + "</div>";
  }
}

/* ── Render 1 baris field, sembunyikan field kosong & field meta (Timestamp/No/Nama Siswa) ── */
const FIELD_META_DIABAIKAN = new Set(["Timestamp", "No", "Nama Siswa", "Nama Lengkap"]);

function renderFieldRows(row) {
  if (!row) return '<div class="lap-kosong">Belum ada data.</div>';
  let html = "";
  Object.keys(row).forEach((label) => {
    if (FIELD_META_DIABAIKAN.has(label)) return;
    const value = row[label];
    if (value === "" || value === null || value === undefined) return;
    if (label.indexOf("Catatan") === 0) {
      html += `<div class="lap-catatan"><span class="lap-catatan-label">${esc(label)}</span>${esc(value)}</div>`;
    } else {
      html += `<div class="lap-field-row"><span class="lap-field-label">${esc(label)}</span><span class="lap-field-value">${esc(value)}</span></div>`;
    }
  });
  return html || '<div class="lap-kosong">Belum ada data yang diisi.</div>';
}

function renderSection(key, title, bodyHtml) {
  const isCollapsed = collapsedSections.has(key);
  return `
    <div class="lap-section">
      <div class="lap-section-title${isCollapsed ? " lap-collapsed-title" : ""}" data-key="${esc(key)}">
        ${esc(title)}<span class="lap-chevron">▾</span>
      </div>
      <div class="lap-section-body${isCollapsed ? " lap-collapsed" : ""}">${bodyHtml}</div>
    </div>`;
}

function renderReport(nama, data) {
  const wrap = document.getElementById("lap-report");
  const profil = data.profil;

  const ganti = ctx.role === "guru" || (ctx.role === "orangtua" && ctx.anak.length > 1)
    ? '<button type="button" class="lap-ganti" id="lap-ganti-btn">← Pilih siswa lain</button>'
    : "";

  const profilCard = profil
    ? `<div class="lap-profil-card">
        <div class="lap-profil-nama">${esc(profil["Nama Lengkap"] || nama)}</div>
        <div class="lap-profil-meta">
          ${profil["Nama Panggilan"] ? "Dipanggil " + esc(profil["Nama Panggilan"]) + " · " : ""}
          ${esc(profil["Tempat Lahir"] || "")}${profil["Tempat Lahir"] && profil["Tanggal Lahir"] ? ", " : ""}${esc(profil["Tanggal Lahir"] || "")}
        </div>
      </div>`
    : `<div class="lap-profil-card"><div class="lap-profil-nama">${esc(nama)}</div>
        <div class="lap-profil-meta">Profil belum terdaftar di Data Siswa.</div></div>`;

  wrap.innerHTML = ganti + profilCard +
    renderSection("mpls", "🧭 Asesmen MPLS (Emosi, Kemandirian, Minat, Fisik)", renderFieldRows(data.mpls)) +
    renderSection("kognitif", "📚 Asesmen Kognitif (Literasi & Numerasi)", renderFieldRows(data.mplsKognitif)) +
    renderSection("jurnal", "📝 Jurnal Aktivitas", renderFieldRows(data.jurnal));

  wrap.querySelectorAll(".lap-section-title").forEach((el) => {
    el.addEventListener("click", () => {
      const key = el.dataset.key;
      if (collapsedSections.has(key)) collapsedSections.delete(key); else collapsedSections.add(key);
      renderReport(nama, data);
    });
  });

  const gantiBtn = document.getElementById("lap-ganti-btn");
  if (gantiBtn) gantiBtn.addEventListener("click", () => {
    wrap.innerHTML = "";
    document.getElementById("lap-subtitle").textContent = "Ringkasan profil, hasil asesmen MPLS, dan jurnal aktivitas.";
    if (ctx.role === "orangtua") {
      document.querySelectorAll(".lap-anak-chip").forEach((b) => b.classList.remove("lap-active"));
    } else {
      renderPicker();
    }
  });
}

document.addEventListener("laporan-context-ready", (e) => {
  ctx = e.detail;
  renderPicker();
});
