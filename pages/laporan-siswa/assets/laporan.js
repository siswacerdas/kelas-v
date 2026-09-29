/**
 * laporan.js — logika pages/laporan-siswa/mpls.html (satu dari 3 "pintu" laporan; lihat
 * pages/laporan-siswa.html untuk landing-nya, dan ANTIREGRESI.md §28 untuk peta
 * lengkap ketiganya: MPLS [halaman ini] / Perkembangan Belajar Mandiri / Latihan Mandiri Siswa).
 * Bergantung pada: MPLS_CONFIG (config.js), window.getFreshLaporanIdToken() (dari
 * assets/laporan-guard.js), window.LaporanPicker (dari assets/laporan-picker.js), dan event
 * "laporan-context-ready" (detail: { role, nama, anak }).
 *
 * Ini implementasi Fase 1 (Profil, MPLS non-kognitif, MPLS Kognitif, Jurnal Aktivitas — SEMUA
 * data yang SUDAH ada di sistem). Hasil Latihan (Uji Kemampuan) & Progres Materi/Modul kini
 * masing-masing jadi laporan TERPISAH (lihat belajar-mandiri.html & latihan-mandiri.html),
 * bukan digabung ke laporan ini lagi.
 */

let ctx = null; // { role, nama, anak } dari event laporan-context-ready
const collapsedSections = new Set(); // label section yang sedang ditutup, sama pola dengan galeri.html

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
  const p = document.getElementById("lap-picker");
  if (p) p.style.display = hide ? "none" : "";
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

/* ── Render kesimpulan naratif 1 aspek (MPLS/Kognitif/Jurnal), pakai mesin skoring yang
 * SUDAH ADA (MplsScoring/MplsScoringKognitif/MplsScoringJurnal — sama persis yang dipakai
 * laporan cetak guru di pages/mpls/laporan*.html) — BUKAN dump semua field mentah seperti
 * sebelumnya. Alasan revisi ini: daftar 20-30 baris angka skala 1-4 tanpa konteks sama sekali
 * tidak bermakna buat orang tua (apa arti "2"?) — mesin skoring ini sudah menerjemahkannya
 * jadi level (BB/MB/BSH/BSB) + kalimat kesimpulan + rekomendasi konkret per kategori. */
const LEVEL_CLASS = { BB: "lap-lvl-BB", MB: "lap-lvl-MB", BSH: "lap-lvl-BSH", BSB: "lap-lvl-BSB" };

function renderNarasi(engine, row) {
  if (!row) return '<div class="lap-kosong">Belum ada data untuk aspek ini.</div>';
  const result = engine.computeStudentResult(row);
  const ov = result.overall;

  if (!ov.level) {
    return '<div class="lap-kosong">' + esc(ov.narasi) + "</div>";
  }

  const kekuatanHtml = ov.kekuatan.length
    ? `<div class="lap-overall-line">💪 <b>Aspek kuat:</b> ${esc(ov.kekuatan.join(", "))}</div>` : "";
  const perhatianHtml = ov.perhatian.length
    ? `<div class="lap-overall-line">🔎 <b>Perlu perhatian:</b> ${esc(ov.perhatian.join(", "))}</div>` : "";

  // Rekomendasi "di rumah" relevan untuk guru MAUPUN orang tua (guru pun perlu tahu apa yang
  // disarankan ke orang tua supaya bisa saling menguatkan). Rekomendasi "di sekolah" hanya
  // ditampilkan untuk akun guru — kurang relevan buat orang tua baca rencana kerja guru sendiri.
  const rekomHtml = `
    <div class="lap-rekom-grid">
      ${ctx.role === "guru" ? `
        <div class="lap-rekom-col">
          <div class="lap-rekom-title">🏫 Di Sekolah</div>
          <ul>${(ov.guru.length ? ov.guru : ["Pertahankan pendampingan rutin yang sudah berjalan baik."]).map((g) => `<li>${esc(g)}</li>`).join("")}</ul>
        </div>` : ""}
      <div class="lap-rekom-col">
        <div class="lap-rekom-title">🏠 Di Rumah</div>
        <ul>${(ov.ortu.length ? ov.ortu : ["Pertahankan dukungan rutin yang sudah berjalan baik di rumah."]).map((o) => `<li>${esc(o)}</li>`).join("")}</ul>
      </div>
    </div>`;

  const catCards = result.categories
    .filter((c) => c.level) // sembunyikan kategori yang sama sekali belum diisi
    .map((c) => `
      <div class="lap-cat-card" style="--cat-accent:${esc(c.accent)}">
        <div class="lap-cat-title">${c.icon} ${esc(c.title)}</div>
        <div class="lap-cat-level ${LEVEL_CLASS[c.level] || ""}">${esc(c.levelLabel)}</div>
        <p class="lap-cat-simpulan">${esc(c.simpulan)}</p>
      </div>`).join("");

  return `
    <div class="lap-overall ${LEVEL_CLASS[ov.level] || ""}">
      <div class="lap-overall-badge">${esc(ov.label)}</div>
      <p class="lap-overall-narasi">${esc(ov.narasi)}</p>
      ${kekuatanHtml}${perhatianHtml}
      ${rekomHtml}
    </div>
    ${catCards ? `<div class="lap-cat-grid">${catCards}</div>` : ""}`;
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
  lapHidePicker_(true);

  if (!window.__lapMplsPane) window.__lapMplsPane = "mpls";
  const pane = window.__lapMplsPane;

  const meta = profil
    ? ((profil["Nama Panggilan"] ? "Dipanggil " + esc(profil["Nama Panggilan"]) + " · " : "") +
       esc(profil["Tempat Lahir"] || "") +
       (profil["Tempat Lahir"] && profil["Tanggal Lahir"] ? ", " : "") +
       esc(profil["Tanggal Lahir"] || "")) || "Profil MPLS"
    : "Profil belum terdaftar di Data Siswa";

  // Precompute bodies sekali — ganti pane hanya tukar panel
  const panes = [
    { key: "mpls", ico: "🧭", label: "Kesiapan Belajar",
      sub: "Emosi, kemandirian, minat, dan fisik.",
      body: renderNarasi(MplsScoring, data.mpls) },
    { key: "kognitif", ico: "📚", label: "Kesiapan Akademik",
      sub: "Literasi dan numerasi.",
      body: renderNarasi(MplsScoringKognitif, data.mplsKognitif) },
    { key: "jurnal", ico: "📝", label: "Jurnal Menulis",
      sub: "Aktivitas menulis selama MPLS.",
      body: renderNarasi(MplsScoringJurnal, data.jurnal) },
  ];
  window.__lapMplsView = { nama: nama, panes: panes };

  const gantiBtn = (ctx && (ctx.role === "guru" || (ctx.role === "orangtua" && ctx.anak && ctx.anak.length > 1)))
    ? '<button type="button" class="lap-ganti" id="lap-ganti-btn">Ganti siswa</button>'
    : "";

  let navHtml = '<div class="lap-nav-label">Aspek MPLS</div>';
  for (let i = 0; i < panes.length; i++) {
    const p = panes[i];
    navHtml +=
      '<button type="button" class="lap-nav-item' + (p.key === pane ? " is-active" : "") + '" data-pane="' + p.key + '">' +
      '<span class="nav-ico">' + p.ico + '</span> ' + p.label + '</button>';
  }

  wrap.innerHTML =
    '<div class="lap-dash">' +
      '<aside class="lap-aside">' +
        '<div class="lap-aside-student">' +
          '<div class="lap-aside-student-row">' +
            '<span class="lap-avatar">' + esc(lapInitial_(nama)) + '</span>' +
            '<div><div class="lap-aside-nama">' + esc(nama) + '</div>' +
            '<div class="lap-aside-meta">' + meta + '</div></div>' +
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
      const key = btn.getAttribute("data-pane");
      if (key === window.__lapMplsPane) return;
      window.__lapMplsPane = key;
      switchPaneMpls_();
    };
  }

  const gantiEl = document.getElementById("lap-ganti-btn");
  if (gantiEl) gantiEl.onclick = function () {
    wrap.innerHTML = "";
    window.__lapMplsView = null;
    window.__lapMplsPane = "mpls";
    lapHidePicker_(false);
    document.getElementById("lap-subtitle").textContent = "Ringkasan kesiapan belajar, kesiapan akademik, dan jurnal aktivitas.";
    if (ctx.role === "orangtua") {
      document.querySelectorAll(".lap-anak-chip").forEach((b) => b.classList.remove("lap-active"));
    } else {
      window.LaporanPicker.render(ctx, loadReport);
    }
  };

  switchPaneMpls_();
}

function switchPaneMpls_() {
  const view = window.__lapMplsView;
  if (!view) return;
  const pane = window.__lapMplsPane || "mpls";
  const active = view.panes.find((p) => p.key === pane) || view.panes[0];
  const main = document.getElementById("lap-main-pane");
  const nav = document.getElementById("lap-aside-nav");
  if (!main) return;
  if (nav) {
    const items = nav.querySelectorAll(".lap-nav-item");
    for (let i = 0; i < items.length; i++) {
      items[i].classList.toggle("is-active", items[i].getAttribute("data-pane") === active.key);
    }
  }
  main.innerHTML =
    '<h2 class="lap-main-title">' + active.ico + " " + esc(active.label) + '</h2>' +
    '<p class="lap-main-sub">' + esc(active.sub) + '</p>' +
    active.body;
}

document.addEventListener("laporan-context-ready", (e) => {
  ctx = e.detail;
  window.LaporanPicker.render(ctx, loadReport);
});
