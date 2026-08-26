/**
 * belajar-mandiri.js — logika pages/laporan-siswa/belajar-mandiri.html (Pintu 2 dari 3).
 * Bergantung pada: MPLS_CONFIG (config.js), window.MATERI_INDEX (materi-index.js — SUMBER
 * TUNGGAL yang sama dipakai Materi Ajar & Galeri Visual), window.getFreshLaporanIdToken()
 * (laporan-guard.js), window.LaporanPicker (laporan-picker.js), dan event
 * "laporan-context-ready" (detail: { role, nama, anak }).
 *
 * Cakupan HALAMAN INI (lihat ANTIREGRESI.md §28 §7):
 *  - Ketuntasan Materi Ajar: AKTIF — dihitung dari sheet "Data Progres Materi" (diisi
 *    materi-progress-tracker.js tiap kali siswa membuka 1 materi).
 *  - Progres Modul: MASIH "Segera Hadir" — modul contoh yang pernah diberikan belum punya
 *    jembatan pengiriman progres ke server sama sekali (lihat catatan di rancangan).
 */

let ctx = null;

function esc(str) {
  return String(str || "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

function materiSlugFromFile_(file) {
  return String(file || "").replace(/\.html$/i, "");
}

/* ── Kelompokkan materi (status "selesai" saja — yang belum ditulis tidak dihitung sebagai
 * "belum dibaca", supaya persentase tidak menyesatkan) per mapel → per TP, terurut sesuai
 * posisi asli di materi-index.js. Pola SAMA dengan buildTpGroupsForMapel() di
 * infografis-galeri.js, cuma di sini untuk SEMUA mapel sekaligus (bukan 1 mapel). ── */
function buildMapelGroups() {
  const mapelGroups = {};
  const mapelOrder = [];
  (window.MATERI_INDEX || []).forEach((m) => {
    if (m.status !== "selesai") return;
    if (!mapelGroups[m.mapelSlug]) {
      mapelGroups[m.mapelSlug] = { mapel: m.mapel, mapelSlug: m.mapelSlug, mapelIcon: m.mapelIcon, tpGroups: {}, tpOrder: [] };
      mapelOrder.push(m.mapelSlug);
    }
    const mg = mapelGroups[m.mapelSlug];
    const tpKey = (m.tp || "") + "|" + (m.tema || "");
    if (!mg.tpGroups[tpKey]) {
      mg.tpGroups[tpKey] = { tema: m.tema || m.judul, items: [] };
      mg.tpOrder.push(tpKey);
    }
    mg.tpGroups[tpKey].items.push(m);
  });
  return mapelOrder.map((slug) => {
    const mg = mapelGroups[slug];
    return {
      mapel: mg.mapel, mapelSlug: mg.mapelSlug, mapelIcon: mg.mapelIcon,
      tpList: mg.tpOrder.map((k) => mg.tpGroups[k]),
    };
  });
}

async function loadReport(nama) {
  const wrap = document.getElementById("lap-report");
  wrap.innerHTML = '<div class="ma-empty">Memuat laporan…</div>';
  document.getElementById("lap-subtitle").textContent = "Laporan untuk " + nama;
  try {
    const idToken = await window.getFreshLaporanIdToken();
    const url = MPLS_CONFIG.APPS_SCRIPT_URL + "?progresMateri=1&nama=" + encodeURIComponent(nama) +
      "&idToken=" + encodeURIComponent(idToken);
    const res = await fetch(url);
    const json = await res.json();
    if (json.status === "error") throw new Error(json.message || "Gagal memuat laporan");
    const sudahDibaca = new Set((json.data || []).map((r) => r["Materi Slug"]).filter(Boolean));
    renderReport(nama, sudahDibaca);
  } catch (err) {
    wrap.innerHTML = '<div class="ma-empty">Gagal memuat laporan: ' + esc(err.message) + "</div>";
  }
}

function renderReport(nama, sudahDibaca) {
  const wrap = document.getElementById("lap-report");
  const mapelGroups = buildMapelGroups();

  const ganti = ctx.role === "guru" || (ctx.role === "orangtua" && ctx.anak.length > 1)
    ? '<button type="button" class="lap-ganti" id="lap-ganti-btn">← Pilih siswa lain</button>'
    : "";

  let totalSemua = 0;
  let dibacaSemua = 0;

  const mapelHtml = mapelGroups.map((mg) => {
    const tpRows = mg.tpList.map((tp) => {
      const total = tp.items.length;
      const dibaca = tp.items.filter((m) => sudahDibaca.has(materiSlugFromFile_(m.file))).length;
      totalSemua += total;
      dibacaSemua += dibaca;
      const pct = total > 0 ? Math.round((dibaca / total) * 100) : 0;
      const selesai = dibaca === total && total > 0;
      return `
        <div class="lap-tp-row ${selesai ? "lap-tp-selesai" : ""}">
          <div class="lap-tp-row-top">
            <span class="lap-tp-nama">${selesai ? "✅ " : ""}${esc(tp.tema)}</span>
            <span class="lap-tp-angka">${dibaca}/${total} materi</span>
          </div>
          <div class="lap-tp-bar-track"><div class="lap-tp-bar-fill" style="width:${pct}%"></div></div>
        </div>`;
    }).join("");

    return `
      <div class="lap-section ma-mapel-${esc(mg.mapelSlug)}">
        <div class="lap-section-title" data-key="mapel-${esc(mg.mapelSlug)}">
          ${mg.mapelIcon || "📖"} ${esc(mg.mapel)}<span class="lap-chevron">▾</span>
        </div>
        <div class="lap-section-body">${tpRows}</div>
      </div>`;
  }).join("");

  const overallPct = totalSemua > 0 ? Math.round((dibacaSemua / totalSemua) * 100) : 0;

  wrap.innerHTML = ganti + `
    <div class="lap-progres-overall">
      <div class="lap-progres-overall-angka">${dibacaSemua} / ${totalSemua}</div>
      <div class="lap-progres-overall-label">materi ajar sudah dibaca (${overallPct}%)</div>
      <div class="lap-progres-bar-track"><div class="lap-progres-bar-fill" style="width:${overallPct}%"></div></div>
    </div>
    ${mapelHtml || '<div class="ma-empty">Belum ada Materi Ajar yang bisa dilacak.</div>'}
    <div class="lap-soon-box" style="margin-top:1rem">
      <div class="lap-soon-icon">🧩</div>
      <h2>Progres Modul menyusul</h2>
      <p>Bagian ini baru mencakup Materi Ajar. Progres Modul belajar mandiri akan
      ditambahkan begitu modul-modul mulai dipakai dan pelacakannya siap.</p>
    </div>`;

  // Buka/tutup tiap bagian mapel — dibuka semua secara default (beda dari galeri.html yang
  // default tertutup), karena di sini biasanya cuma 1-2 mapel yang sudah ada materinya.
  wrap.querySelectorAll(".lap-section-title").forEach((el) => {
    el.addEventListener("click", () => {
      el.classList.toggle("lap-collapsed-title");
      el.nextElementSibling.classList.toggle("lap-collapsed");
    });
  });

  const gantiBtn = document.getElementById("lap-ganti-btn");
  if (gantiBtn) gantiBtn.addEventListener("click", () => {
    wrap.innerHTML = "";
    document.getElementById("lap-subtitle").textContent = "Ketuntasan Materi Ajar & Modul yang sudah dipelajari siswa.";
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
