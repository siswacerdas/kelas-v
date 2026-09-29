/**
 * latihan-mandiri.js — logika pages/laporan-siswa/latihan-mandiri.html (Pintu 3 dari 3).
 * Bergantung pada: window.TP_KKO_INDEX + window.URUTAN_MAPEL (tp-kko-index.js — SUMBER
 * TUNGGAL yang sama dipakai pages/uji-kemampuan.html & pages/admin.html tab Uji Kemampuan),
 * window.LaporanPicker (laporan-picker.js), dan event "laporan-context-ready" (detail:
 * { role, nama, anak }) dari laporan-guard.js.
 *
 * BEDA dari Pintu 1 (mpls.html) & Pintu 2 (belajar-mandiri.html): kedua pintu itu baca data
 * lewat endpoint Apps Script (?laporanSiswa=1 / ?progresMateri=1, digerbang wajibAksesLaporan_()
 * di server). Pintu ini baca LANGSUNG dari Firestore koleksi `hasil_latihan` di sisi klien —
 * karena kuis Uji Kemampuan memang disimpan Firestore-native (lihat ANTIREGRESI.md §28
 * §6.3), bukan lewat Apps Script/Sheets. Gerbangnya BUKAN wajibAksesLaporan_(), tapi Firestore
 * Security Rules (lihat README.md match /hasil_latihan/{id}): guru boleh baca semua dokumen,
 * orang tua cuma dokumen yang `namaSiswa`-nya ada di field `anak` miliknya — makanya modul ini
 * SELALU query `where("namaSiswa", "==", nama)` (nama datang dari LaporanPicker, yang untuk
 * orang tua sudah dijamin cuma anaknya sendiri), tidak pernah query berdasar `uid` (lihat
 * catatan panjang soal kenapa `uid` TIDAK BISA dipakai untuk ini di README.md & CHANGELOG.md).
 */
import { getFirestore, collection, query, where, getDocs }
  from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { getApps } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";

const db = getFirestore(getApps()[0]);

let ctx = null;

// Emoji per mapel — sekadar aksen visual, sumber warna resmi tetap materi.css (--m-*).
// Tidak krusial secara fungsional kalau ada mapel baru belum masuk daftar ini (fallback 📚).
const MAPEL_ICON = {
  "Bahasa Indonesia": "📝", "Matematika": "🔢", "IPAS": "🔬",
  "Pendidikan Pancasila": "🇮🇩", "Seni Budaya": "🎨", "PAI": "🕌",
  "PJOK": "🏃", "Bahasa Inggris": "🔤",
};

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
  const el = document.getElementById("lap-picker");
  if (el) el.style.display = hide ? "none" : "";
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
function fmtTanggal(ts) {
  // Firestore Timestamp (SDK) punya .toDate(); tapi hasil serverTimestamp() yang baru saja
  // ditulis lokal bisa null sesaat — dijaga sama seperti riwayat-latihan.html.
  if (!ts || !ts.toDate) return "-";
  return ts.toDate().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
}
function kelasSkor(skor) {
  if (skor >= 80) return "tinggi";
  if (skor >= 60) return "sedang";
  return "rendah";
}
function warnaSkor(skor) {
  if (skor >= 80) return "#2a9d6f";
  if (skor >= 60) return "#2e6fbc";
  return "#c94040";
}

/* ── Kelompokkan HASIL (bukan TP kosong) per mapel, ikut urutan URUTAN_MAPEL — TP yang
 * belum pernah dicoba sama sekali TIDAK ditampilkan sebagai baris kosong (beda dari
 * buildMapelGroups() di belajar-mandiri.js yang menampilkan semua materi termasuk yang
 * belum dibaca) — soal Uji Kemampuan baru mencakup sebagian TP/mapel (lihat progress_materi.md),
 * menampilkan semua TP dari SEMUA mapel sebagai "belum dicoba" akan lebih membingungkan
 * daripada membantu di tahap ini. Cakupan keseluruhan tetap ditunjukkan lewat kartu ringkasan
 * ("N dari M TP tersedia sudah dicoba"), bukan lewat daftar baris kosong. ── */
function kelompokkanPerMapel(hasilList) {
  const tpIndex = {};
  (window.TP_KKO_INDEX || []).forEach((t) => { tpIndex[t.tp] = t; });

  const perTp = {};
  hasilList.forEach((h) => {
    if (!perTp[h.tp]) perTp[h.tp] = [];
    perTp[h.tp].push(h);
  });

  const mapelGroups = {};
  const urutan = window.URUTAN_MAPEL || [];
  Object.keys(perTp).forEach((tpKode) => {
    const percobaan = perTp[tpKode].slice().sort((a, b) => {
      const ta = a.timestamp && a.timestamp.toMillis ? a.timestamp.toMillis() : 0;
      const tb = b.timestamp && b.timestamp.toMillis ? b.timestamp.toMillis() : 0;
      return tb - ta; // terbaru dulu
    });
    const tpMeta = tpIndex[tpKode];
    const mapelNama = tpMeta ? tpMeta.mapel : (percobaan[0].mapel || "Lainnya");
    const judul = tpMeta ? tpMeta.judul : (percobaan[0].tpJudul || tpKode);
    const skorTerbaik = Math.max(...percobaan.map((p) => p.skor || 0));
    const terakhir = percobaan[0];
    if (!mapelGroups[mapelNama]) mapelGroups[mapelNama] = [];
    mapelGroups[mapelNama].push({
      tp: tpKode, judul, jumlahPercobaan: percobaan.length,
      skorTerbaik, skorTerakhir: terakhir.skor || 0, tanggalTerakhir: terakhir.timestamp,
    });
  });

  const namaMapelTerpakai = Object.keys(mapelGroups);
  const terurut = urutan.filter((m) => namaMapelTerpakai.indexOf(m) !== -1)
    .concat(namaMapelTerpakai.filter((m) => urutan.indexOf(m) === -1).sort());

  return terurut.map((mapel) => ({
    mapel, icon: MAPEL_ICON[mapel] || "📚",
    tpList: mapelGroups[mapel].sort((a, b) => a.judul.localeCompare(b.judul, "id")),
  }));
}

const LATIHAN_CACHE_PREFIX = "lap_latihan_v1:";
const LATIHAN_CACHE_TTL = 2 * 60 * 1000; // 2 menit (Firestore relatif cepat)

function bacaCacheLatihan_(nama) {
  try {
    const raw = sessionStorage.getItem(LATIHAN_CACHE_PREFIX + nama);
    if (!raw) return null;
    const obj = JSON.parse(raw);
    if (!obj || !obj.ts || !Array.isArray(obj.data)) return null;
    if (Date.now() - obj.ts > LATIHAN_CACHE_TTL) return null;
    return obj.data;
  } catch (e) { return null; }
}
function tulisCacheLatihan_(nama, list) {
  try {
    // Timestamp Firestore → millis agar JSON-safe
    const data = (list || []).map(function (row) {
      const o = Object.assign({}, row);
      if (o.selesaiPada && typeof o.selesaiPada.toDate === "function") {
        o.selesaiPada = o.selesaiPada.toDate().toISOString();
      } else if (o.selesaiPada && o.selesaiPada.seconds) {
        o.selesaiPada = new Date(o.selesaiPada.seconds * 1000).toISOString();
      }
      if (o.dikerjakanPada && typeof o.dikerjakanPada.toDate === "function") {
        o.dikerjakanPada = o.dikerjakanPada.toDate().toISOString();
      }
      return o;
    });
    sessionStorage.setItem(LATIHAN_CACHE_PREFIX + nama, JSON.stringify({ ts: Date.now(), data: data }));
  } catch (e) {}
}

async function loadReport(nama) {
  const wrap = document.getElementById("lap-report");
  document.getElementById("lap-subtitle").textContent = "Laporan untuk " + nama;

  const cached = bacaCacheLatihan_(nama);
  if (cached) {
    renderReport(nama, cached);
    fetchLatihanNetwork_(nama)
      .then(function (list) {
        tulisCacheLatihan_(nama, list);
        const title = document.querySelector(".lap-aside-nama");
        if (title && title.textContent === nama) renderReport(nama, list);
      })
      .catch(function () {});
    return;
  }

  wrap.innerHTML = '<div class="ma-empty">Memuat laporan…</div>';
  try {
    const hasilList = await fetchLatihanNetwork_(nama);
    tulisCacheLatihan_(nama, hasilList);
    renderReport(nama, hasilList);
  } catch (err) {
    wrap.innerHTML = '<div class="ma-empty">Gagal memuat laporan: ' + esc(err.message) + "</div>";
  }
}

async function fetchLatihanNetwork_(nama) {
  const snap = await getDocs(query(collection(db, "hasil_latihan"), where("namaSiswa", "==", nama)));
  const hasilList = [];
  snap.forEach((d) => hasilList.push(Object.assign({ id: d.id }, d.data())));
  return hasilList;
}

function renderReport(nama, hasilList) {
  const wrap = document.getElementById("lap-report");
  lapHidePicker_(true);

  if (!window.__lapLatihanPane) window.__lapLatihanPane = "ringkasan";
  let pane = window.__lapLatihanPane;

  const gantiBtn = (ctx && (ctx.role === "guru" || (ctx.role === "orangtua" && ctx.anak && ctx.anak.length > 1)))
    ? '<button type="button" class="lap-ganti" id="lap-ganti-btn">Ganti siswa</button>'
    : "";

  if (!hasilList.length) {
    window.__lapLatihanView = null;
    wrap.innerHTML =
      '<div class="lap-dash">' +
        '<aside class="lap-aside">' +
          '<div class="lap-aside-student">' +
            '<div class="lap-aside-student-row">' +
              '<span class="lap-avatar">' + esc(lapInitial_(nama)) + '</span>' +
              '<div><div class="lap-aside-nama">' + esc(nama) + '</div>' +
              '<div class="lap-aside-meta">Belum ada data latihan</div></div>' +
            '</div>' +
            '<div class="lap-aside-actions">' + gantiBtn + '</div>' +
          '</div>' +
        '</aside>' +
        '<div class="lap-main">' +
          '<h2 class="lap-main-title">Belum ada latihan</h2>' +
          '<p class="lap-main-sub">Hasil akan muncul setelah siswa mengerjakan Uji Kemampuan.</p>' +
          '<div class="lap-kosong">Siswa ini belum mengerjakan Uji Kemampuan.</div>' +
        '</div>' +
      '</div>';
    attachGantiHandler(wrap);
    return;
  }

  const mapelGroups = kelompokkanPerMapel(hasilList);
  const tpUnikDicoba = mapelGroups.reduce((s, mg) => s + mg.tpList.length, 0);
  const totalTpTersedia = (window.TP_KKO_INDEX || []).length;
  const totalSesi = hasilList.length;
  const rataRataSkorTerbaik = Math.round(
    mapelGroups.reduce((s, mg) => s + mg.tpList.reduce((s2, tp) => s2 + tp.skorTerbaik, 0), 0) / (tpUnikDicoba || 1)
  );
  const pctCakupan = totalTpTersedia ? Math.round((tpUnikDicoba / totalTpTersedia) * 100) : 0;

  if (pane.startsWith("mapel:")) {
    const mname = pane.slice(6);
    if (!mapelGroups.some((mg) => mg.mapel === mname)) {
      pane = "ringkasan";
      window.__lapLatihanPane = "ringkasan";
    }
  }

  // Prebuild bodies
  const ringkasanBody =
    '<div class="lap-hero-score">' +
      '<div class="lap-hero-score-value" style="color:' + warnaSkor(rataRataSkorTerbaik) + '">' + rataRataSkorTerbaik + '%</div>' +
      '<div class="lap-hero-score-label">Rata-rata skor terbaik</div>' +
    '</div>' +
    '<div class="lap-metrics">' +
      '<div class="lap-metric">' +
        '<div class="lap-metric-value">' + tpUnikDicoba + '<span style="font-size:0.85rem;font-weight:600;color:var(--ink-3)">/' + totalTpTersedia + '</span></div>' +
        '<div class="lap-metric-label">TP sudah dicoba</div>' +
        '<div class="lap-metric-bar"><i style="width:' + pctCakupan + '%"></i></div>' +
      '</div>' +
      '<div class="lap-metric"><div class="lap-metric-value">' + totalSesi + '</div><div class="lap-metric-label">Total sesi latihan</div></div>' +
      '<div class="lap-metric"><div class="lap-metric-value">' + mapelGroups.length + '</div><div class="lap-metric-label">Mapel dilatih</div></div>' +
    '</div>' +
    '<p class="lap-main-sub" style="margin:0">Pilih mapel di menu untuk melihat rincian skor per TP.</p>';

  const mapelBodies = {};
  mapelGroups.forEach((mg) => {
    mapelBodies[mg.mapel] = mg.tpList.map((tp) =>
      '<div class="lap-tp-row">' +
        '<div class="lap-tp-row-top">' +
          '<span class="lap-tp-nama">' + esc(tp.judul) + '</span>' +
          '<span class="lap-tp-angka">' + tp.skorTerbaik + '% · ' + tp.jumlahPercobaan + '×</span>' +
        '</div>' +
        '<div class="lap-tp-bar-track"><div class="lap-tp-bar-fill" style="width:' + tp.skorTerbaik + '%; --m-color:' + warnaSkor(tp.skorTerbaik) + '"></div></div>' +
        '<div class="lm-tp-meta">Terakhir: ' + tp.skorTerakhir + '% · ' + fmtTanggal(tp.tanggalTerakhir) + '</div>' +
      '</div>'
    ).join("");
  });

  window.__lapLatihanView = {
    nama: nama,
    mapelGroups: mapelGroups,
    ringkasanBody: ringkasanBody,
    mapelBodies: mapelBodies,
  };

  let navHtml =
    '<button type="button" class="lap-nav-item' + (pane === "ringkasan" ? " is-active" : "") + '" data-pane="ringkasan">' +
      '<span class="nav-ico">📊</span> Ringkasan</button>' +
    '<div class="lap-nav-label">Per mapel</div>';
  mapelGroups.forEach((mg) => {
    const key = "mapel:" + mg.mapel;
    navHtml +=
      '<button type="button" class="lap-nav-item' + (pane === key ? " is-active" : "") + '" data-pane="' + esc(key) + '">' +
      '<span class="nav-ico">' + (mg.icon || "📚") + '</span> ' + esc(mg.mapel) +
      '<span class="nav-badge">' + mg.tpList.length + '</span></button>';
  });

  wrap.innerHTML =
    '<div class="lap-dash">' +
      '<aside class="lap-aside">' +
        '<div class="lap-aside-student">' +
          '<div class="lap-aside-student-row">' +
            '<span class="lap-avatar">' + esc(lapInitial_(nama)) + '</span>' +
            '<div><div class="lap-aside-nama">' + esc(nama) + '</div>' +
            '<div class="lap-aside-meta">' + totalSesi + ' sesi latihan</div></div>' +
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
      const key = btn.getAttribute("data-pane") || "ringkasan";
      if (key === window.__lapLatihanPane) return;
      window.__lapLatihanPane = key;
      switchPaneLatihan_();
    };
  }

  attachGantiHandler(wrap);
  switchPaneLatihan_();
}

function switchPaneLatihan_() {
  const view = window.__lapLatihanView;
  if (!view) return;
  const pane = window.__lapLatihanPane || "ringkasan";
  const main = document.getElementById("lap-main-pane");
  const nav = document.getElementById("lap-aside-nav");
  if (!main) return;

  if (nav) {
    const items = nav.querySelectorAll(".lap-nav-item");
    for (let i = 0; i < items.length; i++) {
      items[i].classList.toggle("is-active", items[i].getAttribute("data-pane") === pane);
    }
  }

  let mainTitle = "Ringkasan";
  let mainSub = "Gambaran hasil Uji Kemampuan.";
  let mainBody = "";
  if (pane === "ringkasan") {
    mainBody = view.ringkasanBody;
  } else if (pane.startsWith("mapel:")) {
    const mname = pane.slice(6);
    const mg = view.mapelGroups.find((g) => g.mapel === mname);
    mainTitle = mg ? ((mg.icon || "") + " " + mg.mapel) : mname;
    mainSub = "Skor terbaik dan riwayat percobaan per TP.";
    mainBody = view.mapelBodies[mname] || '<div class="lap-kosong">Tidak ada data.</div>';
  }

  main.innerHTML =
    '<h2 class="lap-main-title">' + esc(mainTitle) + '</h2>' +
    '<p class="lap-main-sub">' + esc(mainSub) + '</p>' +
    mainBody;
}

function attachGantiHandler(wrap) {
  const gantiBtn = document.getElementById("lap-ganti-btn");
  if (gantiBtn) gantiBtn.addEventListener("click", () => {
    wrap.innerHTML = "";
    window.__lapLatihanPane = "ringkasan";
    lapHidePicker_(false);
    document.getElementById("lap-subtitle").textContent = "Hasil latihan dari Uji Kemampuan per Tujuan Pembelajaran.";
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
