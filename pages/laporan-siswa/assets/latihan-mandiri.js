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

async function loadReport(nama) {
  const wrap = document.getElementById("lap-report");
  wrap.innerHTML = '<div class="ma-empty">Memuat laporan…</div>';
  document.getElementById("lap-subtitle").textContent = "Laporan untuk " + nama;
  try {
    const snap = await getDocs(query(collection(db, "hasil_latihan"), where("namaSiswa", "==", nama)));
    const hasilList = [];
    snap.forEach((d) => hasilList.push({ id: d.id, ...d.data() }));
    renderReport(nama, hasilList);
  } catch (err) {
    wrap.innerHTML = '<div class="ma-empty">Gagal memuat laporan: ' + esc(err.message) + "</div>";
  }
}

function renderReport(nama, hasilList) {
  const wrap = document.getElementById("lap-report");
  const mapelGroups = kelompokkanPerMapel(hasilList);

  const ganti = ctx.role === "guru" || (ctx.role === "orangtua" && ctx.anak.length > 1)
    ? '<button type="button" class="lap-ganti" id="lap-ganti-btn">← Pilih siswa lain</button>'
    : "";

  if (hasilList.length === 0) {
    wrap.innerHTML = ganti + `
      <div class="ma-empty">${esc(nama)} belum pernah mengerjakan Uji Kemampuan sama sekali.</div>`;
    attachGantiHandler(wrap);
    return;
  }

  const tpUnikDicoba = mapelGroups.reduce((n, mg) => n + mg.tpList.length, 0);
  const totalTpTersedia = (window.TP_KKO_INDEX || []).length;
  const totalSesi = hasilList.length;
  const rataRataSkorTerbaik = Math.round(
    mapelGroups.reduce((s, mg) => s + mg.tpList.reduce((s2, tp) => s2 + tp.skorTerbaik, 0), 0) / (tpUnikDicoba || 1)
  );

  const mapelHtml = mapelGroups.map((mg) => {
    const tpRows = mg.tpList.map((tp) => `
      <div class="lap-tp-row">
        <div class="lap-tp-row-top">
          <span class="lap-tp-nama">${esc(tp.judul)}</span>
          <span class="lap-tp-angka">${tp.skorTerbaik}% terbaik · ${tp.jumlahPercobaan}× dicoba</span>
        </div>
        <div class="lap-tp-bar-track"><div class="lap-tp-bar-fill" style="width:${tp.skorTerbaik}%; --m-color:${warnaSkor(tp.skorTerbaik)}"></div></div>
        <div class="lm-tp-meta">Percobaan terakhir: ${tp.skorTerakhir}% · ${fmtTanggal(tp.tanggalTerakhir)}</div>
      </div>`).join("");

    return `
      <div class="lap-section">
        <div class="lap-section-title" data-key="mapel-${esc(mg.mapel)}">
          ${mg.icon} ${esc(mg.mapel)}<span class="lap-chevron">▾</span>
        </div>
        <div class="lap-section-body">${tpRows}</div>
      </div>`;
  }).join("");

  wrap.innerHTML = ganti + `
    <div class="lap-progres-overall">
      <div class="lap-progres-overall-angka" style="color:${warnaSkor(rataRataSkorTerbaik)}">${rataRataSkorTerbaik}%</div>
      <div class="lap-progres-overall-label">rata-rata skor terbaik · ${tpUnikDicoba} dari ${totalTpTersedia} TP tersedia sudah dicoba (${totalSesi} sesi latihan total)</div>
    </div>
    ${mapelHtml}`;

  wrap.querySelectorAll(".lap-section-title").forEach((el) => {
    el.addEventListener("click", () => {
      el.classList.toggle("lap-collapsed-title");
      el.nextElementSibling.classList.toggle("lap-collapsed");
    });
  });

  attachGantiHandler(wrap);
}

function attachGantiHandler(wrap) {
  const gantiBtn = document.getElementById("lap-ganti-btn");
  if (gantiBtn) gantiBtn.addEventListener("click", () => {
    wrap.innerHTML = "";
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
