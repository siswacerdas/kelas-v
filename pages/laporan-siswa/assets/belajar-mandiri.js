/**
 * belajar-mandiri.js — logika pages/laporan-siswa/belajar-mandiri.html (Pintu 2 dari 3).
 * Bergantung pada: MPLS_CONFIG (config.js), window.MATERI_INDEX (materi-index.js),
 * window.MODUL_INDEX (modul-index.js), window.getFreshLaporanIdToken() (laporan-guard.js),
 * window.LaporanPicker (laporan-picker.js), dan event "laporan-context-ready"
 * (detail: { role, nama, anak }).
 *
 * ROMBAKAN BESAR Agustus 2026 (lihat ANTIREGRESI.md §39 untuk detail & uji manual):
 *  - Progres MODUL ditambahkan (sebelumnya "Segera Hadir") — dari sheet "Data Progres
 *    Modul", diisi modul-progress-tracker.js (§38) saat siswa mencapai halaman terakhir
 *    modul. Butuh field `slug` di MODUL_INDEX (BARU) karena "Modul Slug" yang tersimpan di
 *    server TIDAK bisa ditebak otomatis dari nama folder (ada pengecualian tidak beraturan).
 *  - FILTER PER MAPEL (chip) ditambahkan — sebelumnya SEMUA mapel dirender terbuka
 *    sekaligus, jadi sangat panjang begitu kontennya bertambah. Sekarang detail per-mapel
 *    (Materi + Modul) HANYA dirender untuk 1 mapel yang dipilih.
 *  - "AKTIVITAS TERBARU" ditambahkan — daftar ringkas 8 aktivitas (materi dibaca / modul
 *    diselesaikan) TERBARU lintas SEMUA mapel, diurutkan dari Timestamp server, supaya
 *    orang tua langsung tahu KAPAN & APA yang terakhir dipelajari anaknya di rumah TANPA
 *    perlu memilih mapel/scroll apa pun dulu — ini yang menjawab kebutuhan "kapan anak
 *    belajar" yang diminta eksplisit. SENGAJA tidak coba menggabungkan Materi+Modul per-TP
 *    (join berdasarkan `tp`) karena skema kode TP di MATERI_INDEX & MODUL_INDEX untuk
 *    beberapa elemen (mis. Bahasa Indonesia · Menulis) TIDAK cocok satu sama lain — join
 *    yang dipaksakan lebih rapuh daripada 2 subseksi terpisah per mapel.
 */

let ctx = null;
let mapelAktif = null;       // slug mapel yang sedang dipilih untuk detail, null = belum pilih
let dataMateriRows = [];     // hasil ?progresMateri=1 apa adanya (dengan Timestamp)
let dataModulRows = [];      // hasil ?progresModul=1 apa adanya (dengan Timestamp)

function esc(str) {
  return String(str || "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

function materiSlugFromFile_(file) {
  return String(file || "").replace(/\.html$/i, "");
}

/** Label waktu ramah untuk orang tua — "Hari ini, 14:32" / "Kemarin, 09:10" / "3 hari lalu" /
 * tanggal biasa kalau lebih dari 6 hari. Timestamp dari server berupa string ISO (Date
 * di-JSON.stringify otomatis jadi ISO oleh Apps Script). */
function formatWaktuRamah_(timestampStr) {
  if (!timestampStr) return "";
  const d = new Date(timestampStr);
  if (isNaN(d.getTime())) return "";
  const now = new Date();
  const startOfDay = (x) => new Date(x.getFullYear(), x.getMonth(), x.getDate());
  const diffHari = Math.round((startOfDay(now) - startOfDay(d)) / 86400000);
  const jam = d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
  if (diffHari === 0) return "Hari ini, " + jam;
  if (diffHari === 1) return "Kemarin, " + jam;
  if (diffHari > 1 && diffHari <= 6) return diffHari + " hari lalu";
  return d.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
}

/* ── Kelompokkan MATERI (status "selesai" saja) per mapel → per TP, terurut sesuai posisi
 * asli di materi-index.js. TIDAK diubah dari versi sebelumnya. ── */
function buildMapelGroupsMateri() {
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

/* ── Kelompokkan MODUL (status "selesai" saja, artinya "sudah dirilis ke siswa" — BUKAN
 * berarti "sudah dikerjakan siswa", itu ditentukan `sudahSelesaiModul` terpisah) per mapel.
 * BEDA dari materi: 1 modul biasanya = 1 TP utuh (bukan beberapa item per TP), jadi tidak
 * perlu pengelompokan tpList/tpGroups, cukup daftar datar `items` per mapel. ── */
function buildMapelGroupsModul() {
  const mapelGroups = {};
  const mapelOrder = [];
  (window.MODUL_INDEX || []).forEach((m) => {
    if (m.status !== "selesai") return;
    if (!mapelGroups[m.mapelSlug]) {
      mapelGroups[m.mapelSlug] = { mapel: m.mapel, mapelSlug: m.mapelSlug, mapelIcon: m.mapelIcon, items: [] };
      mapelOrder.push(m.mapelSlug);
    }
    mapelGroups[m.mapelSlug].items.push(m);
  });
  return mapelOrder.map((slug) => mapelGroups[slug]);
}

/** Gabungkan daftar mapel dari Materi & Modul (union, urutan Materi dulu baru Modul yang
 * belum ada) — dipakai buat chip filter supaya mapel yang CUMA punya Modul (atau CUMA
 * Materi) tetap muncul sebagai pilihan. */
function daftarMapelGabungan_(materiGroups, modulGroups) {
  const map = {};
  const order = [];
  materiGroups.forEach((g) => { if (!map[g.mapelSlug]) { map[g.mapelSlug] = g; order.push(g.mapelSlug); } });
  modulGroups.forEach((g) => { if (!map[g.mapelSlug]) { map[g.mapelSlug] = g; order.push(g.mapelSlug); } });
  return order.map((s) => map[s]);
}

async function loadReport(nama) {
  const wrap = document.getElementById("lap-report");
  wrap.innerHTML = '<div class="ma-empty">Memuat laporan…</div>';
  document.getElementById("lap-subtitle").textContent = "Laporan untuk " + nama;
  try {
    const idToken = await window.getFreshLaporanIdToken();
    const base = MPLS_CONFIG.APPS_SCRIPT_URL;
    const [resMateri, resModul] = await Promise.all([
      fetch(base + "?progresMateri=1&nama=" + encodeURIComponent(nama) + "&idToken=" + encodeURIComponent(idToken)),
      fetch(base + "?progresModul=1&nama=" + encodeURIComponent(nama) + "&idToken=" + encodeURIComponent(idToken)),
    ]);
    const jsonMateri = await resMateri.json();
    const jsonModul = await resModul.json();
    if (jsonMateri.status === "error") throw new Error(jsonMateri.message || "Gagal memuat laporan materi");
    if (jsonModul.status === "error") throw new Error(jsonModul.message || "Gagal memuat laporan modul");
    dataMateriRows = jsonMateri.data || [];
    dataModulRows = jsonModul.data || [];

    // Default: pilih mapel PERTAMA yang punya data supaya orang tua langsung lihat sesuatu
    // tanpa perlu tap dulu (tapi tetap ringkas — cuma 1 mapel yang detailnya terbuka).
    const daftarMapel = daftarMapelGabungan_(buildMapelGroupsMateri(), buildMapelGroupsModul());
    mapelAktif = daftarMapel.length > 0 ? daftarMapel[0].mapelSlug : null;

    renderReport(nama);
  } catch (err) {
    wrap.innerHTML = '<div class="ma-empty">Gagal memuat laporan: ' + esc(err.message) + "</div>";
  }
}

function renderReport(nama) {
  const wrap = document.getElementById("lap-report");
  const sudahDibacaMateri = new Set(dataMateriRows.map((r) => r["Materi Slug"]).filter(Boolean));
  const sudahSelesaiModul = new Set(dataModulRows.map((r) => r["Modul Slug"]).filter(Boolean));

  const materiGroups = buildMapelGroupsMateri();
  const modulGroups = buildMapelGroupsModul();
  const daftarMapel = daftarMapelGabungan_(materiGroups, modulGroups);

  const ganti = ctx.role === "guru" || (ctx.role === "orangtua" && ctx.anak.length > 1)
    ? '<button type="button" class="lap-ganti" id="lap-ganti-btn">← Pilih siswa lain</button>'
    : "";

  // ── Ringkasan keseluruhan — lintas SEMUA mapel, TIDAK terpengaruh filter mapel di bawah,
  // supaya orang tua tetap dapat gambaran total meski sedang fokus lihat 1 mapel. ──
  let totalMateriSemua = 0, dibacaMateriSemua = 0;
  materiGroups.forEach((mg) => mg.tpList.forEach((tp) => {
    totalMateriSemua += tp.items.length;
    dibacaMateriSemua += tp.items.filter((m) => sudahDibacaMateri.has(materiSlugFromFile_(m.file))).length;
  }));
  let totalModulSemua = 0, selesaiModulSemua = 0;
  modulGroups.forEach((mg) => mg.items.forEach((it) => {
    totalModulSemua += 1;
    if (sudahSelesaiModul.has(it.slug)) selesaiModulSemua += 1;
  }));

  // ── Aktivitas Terbaru — gabungan Materi+Modul, 8 teratas berdasar Timestamp. Ini yang
  // menjawab "kapan anak terakhir belajar mandiri" tanpa perlu memilih mapel/scroll. ──
  const materiBySlug = {};
  (window.MATERI_INDEX || []).forEach((m) => { materiBySlug[materiSlugFromFile_(m.file)] = m; });
  const modulBySlug = {};
  (window.MODUL_INDEX || []).forEach((m) => { modulBySlug[m.slug] = m; });

  const aktivitas = [];
  dataMateriRows.forEach((r) => {
    const info = materiBySlug[r["Materi Slug"]];
    if (!info) return; // slug tidak dikenal di index saat ini (mis. materi lama dihapus) -> lewati diam-diam
    aktivitas.push({ ts: r["Timestamp"], jenis: "materi", judul: info.judul, mapel: info.mapel });
  });
  dataModulRows.forEach((r) => {
    const info = modulBySlug[r["Modul Slug"]];
    if (!info) return;
    aktivitas.push({ ts: r["Timestamp"], jenis: "modul", judul: info.judul, mapel: info.mapel });
  });
  aktivitas.sort((a, b) => new Date(b.ts) - new Date(a.ts));
  const aktivitasTerbaru = aktivitas.slice(0, 8);

  const aktivitasHtml = aktivitasTerbaru.length > 0
    ? '<div class="lap-aktivitas-list">' + aktivitasTerbaru.map((a) => `
        <div class="lap-aktivitas-row">
          <span class="lap-aktivitas-icon">${a.jenis === "modul" ? "🧩" : "📖"}</span>
          <div class="lap-aktivitas-body">
            <div class="lap-aktivitas-judul">${esc(a.judul)}</div>
            <div class="lap-aktivitas-meta">${esc(a.mapel)} · ${a.jenis === "modul" ? "Modul diselesaikan" : "Materi dibaca"}</div>
          </div>
          <span class="lap-aktivitas-waktu">${esc(formatWaktuRamah_(a.ts))}</span>
        </div>`).join("") + "</div>"
    : '<div class="lap-kosong">Belum ada aktivitas belajar mandiri tercatat.</div>';

  // ── Chip filter mapel ──
  const chipHtml = daftarMapel.map((m) => `
    <button type="button" class="lap-mapel-chip ${mapelAktif === m.mapelSlug ? "lap-active" : ""}" data-mapel="${esc(m.mapelSlug)}">
      ${m.mapelIcon || "📚"} ${esc(m.mapel)}
    </button>`).join("");

  // ── Detail 1 mapel terpilih (Materi + Modul) ──
  let detailHtml = '<div class="lap-kosong">Pilih salah satu mata pelajaran di atas untuk melihat rinciannya.</div>';
  if (mapelAktif) {
    const mg = materiGroups.find((g) => g.mapelSlug === mapelAktif);
    const mdg = modulGroups.find((g) => g.mapelSlug === mapelAktif);

    const materiSectionHtml = mg ? mg.tpList.map((tp) => {
      const total = tp.items.length;
      const dibaca = tp.items.filter((m) => sudahDibacaMateri.has(materiSlugFromFile_(m.file))).length;
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
    }).join("") : '<div class="lap-kosong">Belum ada Ingat Lagi untuk mapel ini.</div>';

    const modulSectionHtml = mdg ? mdg.items.map((it) => {
      const selesai = sudahSelesaiModul.has(it.slug);
      return `
        <div class="lap-modul-row ${selesai ? "lap-modul-selesai" : ""}">
          <span class="lap-modul-check">${selesai ? "✅" : "⬜"}</span>
          <span class="lap-modul-judul">${esc(it.judul)}</span>
        </div>`;
    }).join("") : '<div class="lap-kosong">Belum ada Ayo Belajar! untuk mapel ini.</div>';

    detailHtml = `
      <div class="lap-detail-mapel">
        <div class="lap-subsection-title">🔁 Ingat Lagi</div>
        ${materiSectionHtml}
        <div class="lap-subsection-title" style="margin-top:1rem;">🚀 Ayo Belajar!</div>
        ${modulSectionHtml}
      </div>`;
  }

  wrap.innerHTML = ganti + `
    <div class="lap-progres-overall">
      <div class="lap-ringkasan-grid">
        <div class="lap-ringkasan-item">
          <div class="lap-progres-overall-angka">${dibacaMateriSemua}/${totalMateriSemua}</div>
          <div class="lap-progres-overall-label">📖 Materi dibaca</div>
        </div>
        <div class="lap-ringkasan-item">
          <div class="lap-progres-overall-angka">${selesaiModulSemua}/${totalModulSemua}</div>
          <div class="lap-progres-overall-label">🧩 Modul selesai</div>
        </div>
      </div>
    </div>

    <div class="lap-section-title-plain">🕐 Aktivitas Terbaru</div>
    ${aktivitasHtml}

    <div class="lap-section-title-plain" style="margin-top:1.25rem;">Rincian per Mata Pelajaran</div>
    <div class="lap-mapel-chips">${chipHtml || '<div class="lap-kosong">Belum ada data untuk ditampilkan.</div>'}</div>
    ${detailHtml}
  `;

  wrap.querySelectorAll(".lap-mapel-chip").forEach((btn) => {
    btn.addEventListener("click", () => {
      mapelAktif = mapelAktif === btn.dataset.mapel ? null : btn.dataset.mapel;
      renderReport(nama);
    });
  });

  const gantiBtn = document.getElementById("lap-ganti-btn");
  if (gantiBtn) gantiBtn.addEventListener("click", () => {
    wrap.innerHTML = "";
    document.getElementById("lap-subtitle").textContent = "Ketuntasan Ingat Lagi & Ayo Belajar! yang sudah dipelajari siswa.";
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
