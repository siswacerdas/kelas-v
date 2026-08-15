/**
 * laporan.js — logika pages/laporan-siswa/mpls.html (satu dari 3 "pintu" laporan; lihat
 * pages/laporan-siswa.html untuk landing-nya, dan RANCANGAN-LAPORAN-SISWA.md untuk peta
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
    renderSection("mpls", "🧭 Kesiapan Belajar (Emosi, Kemandirian, Minat, Fisik)", renderNarasi(MplsScoring, data.mpls)) +
    renderSection("kognitif", "📚 Kesiapan Akademik (Literasi & Numerasi)", renderNarasi(MplsScoringKognitif, data.mplsKognitif)) +
    renderSection("jurnal", "📝 Jurnal Aktivitas Menulis", renderNarasi(MplsScoringJurnal, data.jurnal));

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
      window.LaporanPicker.render(ctx, loadReport);
    }
  });
}

document.addEventListener("laporan-context-ready", (e) => {
  ctx = e.detail;
  window.LaporanPicker.render(ctx, loadReport);
});
