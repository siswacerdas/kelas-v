/* ============================================================
   pustaka-belajar-baca.js — logika pages/pustaka-belajar/baca.html
   Render tiap halaman PDF ke <canvas> lewat pdf.js (BUKAN <iframe>/
   <embed> file mentah) supaya tidak ada link/file PDF utuh yang bisa
   langsung "Save As". Ini best-effort deterrent (sama level dengan
   Google Slides "view only"), BUKAN proteksi mutlak — lihat
   RANCANGAN-PUSTAKA-BELAJAR.md §0 poin 5.
   ============================================================ */
window.PustakaBelajarBaca = (function () {
  const WATERMARK_TEXT = "SD Muhammadiyah 01 Kukusan";

  let pdfDoc = null;
  let currentPage = 1;
  let totalPages = 0;
  let rendering = false;
  let judul = "";

  function qs(name) {
    return new URLSearchParams(window.location.search).get(name);
  }

  function setFooter() {
    document.getElementById("pb-footer").textContent =
      totalPages > 0 ? `Halaman ${currentPage} / ${totalPages}` : "";
  }

  function setTitle(text) {
    judul = text;
    document.getElementById("pb-title").textContent = text;
  }

  function updateArrows() {
    document.getElementById("pb-prev").disabled = currentPage <= 1;
    document.getElementById("pb-next").disabled = currentPage >= totalPages;
  }

  /** Gambar watermark 1 baris kecil di POJOK KANAN BAWAH canvas — SENGAJA bukan
   * diagonal/tile menutupi seluruh halaman (dikoreksi Arif dari draft awal karena
   * mengganggu kenyamanan baca). Digambar LANGSUNG di atas canvas hasil render
   * pdf.js, jadi menyatu jadi 1 gambar (tidak bisa dihilangkan lewat DevTools),
   * dan otomatis ikut kalau halaman di-screenshot. */
  function gambarWatermark_(ctx, canvasWidth, canvasHeight) {
    const fontSize = Math.max(10, Math.round(canvasWidth * 0.018));
    ctx.save();
    ctx.font = `${fontSize}px 'Plus Jakarta Sans', system-ui, sans-serif`;
    ctx.fillStyle = "rgba(80,80,90,0.5)";
    ctx.textBaseline = "bottom";
    ctx.textAlign = "right";

    const marginX = Math.round(canvasWidth * 0.03);
    const marginY = Math.round(canvasWidth * 0.025);
    let x = canvasWidth - marginX;
    let y = canvasHeight - marginY;

    // Pengaman: kalau teks watermark akan menabrak margin kiri (halaman sangat
    // sempit), turunkan ukuran font sedikit alih-alih dipotong.
    const textWidth = ctx.measureText(WATERMARK_TEXT).width;
    if (textWidth > canvasWidth - marginX * 2) {
      const scale = (canvasWidth - marginX * 2) / textWidth;
      ctx.font = `${Math.max(8, Math.floor(fontSize * scale))}px 'Plus Jakarta Sans', system-ui, sans-serif`;
    }

    ctx.fillText(WATERMARK_TEXT, x, y);
    ctx.restore();
  }

  async function renderPage(num) {
    if (rendering || !pdfDoc) return;
    rendering = true;
    const wrap = document.getElementById("pb-canvas-wrap");
    wrap.innerHTML = `<div class="pb-viewer-loading" id="pb-loading">Memuat halaman…</div>`;

    try {
      const page = await pdfDoc.getPage(num);
      const stage = document.getElementById("pb-stage");
      const dpr = window.devicePixelRatio || 1;
      const targetWidth = Math.min(stage.clientWidth - 24, 900);
      const unscaledViewport = page.getViewport({ scale: 1 });
      const scale = (targetWidth / unscaledViewport.width) * dpr;
      const viewport = page.getViewport({ scale });

      const canvas = document.createElement("canvas");
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      canvas.style.width = viewport.width / dpr + "px";
      canvas.style.height = viewport.height / dpr + "px";
      const ctx = canvas.getContext("2d");

      await page.render({ canvasContext: ctx, viewport: viewport }).promise;
      gambarWatermark_(ctx, canvas.width, canvas.height);

      wrap.innerHTML = "";
      wrap.appendChild(canvas);
      currentPage = num;
      setFooter();
      updateArrows();
    } catch (err) {
      wrap.innerHTML = `<div class="pb-viewer-loading">Gagal memuat halaman ini.</div>`;
    } finally {
      rendering = false;
    }
  }

  function goTo(num) {
    if (num < 1 || num > totalPages || num === currentPage) return;
    renderPage(num);
  }

  function pasangNavigasi() {
    document.getElementById("pb-prev").addEventListener("click", () => goTo(currentPage - 1));
    document.getElementById("pb-next").addEventListener("click", () => goTo(currentPage + 1));

    document.addEventListener("keydown", (e) => {
      if (e.key === "ArrowLeft") goTo(currentPage - 1);
      if (e.key === "ArrowRight") goTo(currentPage + 1);
    });

    // Swipe kiri/kanan untuk HP — threshold 40px, sengaja tidak terlalu kecil supaya
    // tidak salah terpicu oleh scroll pinch-zoom tidak sengaja.
    const stage = document.getElementById("pb-stage");
    let startX = null;
    let startY = null;
    stage.addEventListener("touchstart", (e) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    }, { passive: true });
    stage.addEventListener("touchend", (e) => {
      if (startX === null) return;
      const dx = e.changedTouches[0].clientX - startX;
      const dy = e.changedTouches[0].clientY - startY;
      if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.5) {
        if (dx < 0) goTo(currentPage + 1);
        else goTo(currentPage - 1);
      }
      startX = null;
      startY = null;
    }, { passive: true });
  }

  async function ambilMetadataDanFile_() {
    const id = qs("id");
    if (!id) throw new Error("ID materi tidak ditemukan di tautan.");
    if (typeof MPLS_CONFIG === "undefined" || !MPLS_CONFIG.APPS_SCRIPT_URL) {
      throw new Error("Fitur ini belum siap dikonfigurasi.");
    }

    const resMeta = await fetch(MPLS_CONFIG.APPS_SCRIPT_URL + "?pustakaBelajar=1");
    const jsonMeta = await resMeta.json();
    if (jsonMeta.status === "error") throw new Error(jsonMeta.message || "Gagal memuat data");
    const row = (jsonMeta.data || []).find((r) => r["ID"] === id);
    if (!row) throw new Error("Materi tidak ditemukan (mungkin sudah dihapus guru).");

    setTitle(row["Judul"] || "Pustaka Belajar");

    const resBin = await fetch(
      MPLS_CONFIG.APPS_SCRIPT_URL + "?pustakaBinary=" + encodeURIComponent(row["Drive File ID"])
    );
    const buffer = await resBin.arrayBuffer();
    return buffer;
  }

  async function init() {
    pasangNavigasi();
    try {
      pdfjsLib.GlobalWorkerOptions.workerSrc =
        "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
      const buffer = await ambilMetadataDanFile_();
      pdfDoc = await pdfjsLib.getDocument({ data: buffer }).promise;
      totalPages = pdfDoc.numPages;
      await renderPage(1);
    } catch (err) {
      document.getElementById("pb-canvas-wrap").innerHTML =
        `<div class="pb-viewer-loading">${(err && err.message) || "Gagal memuat dokumen."}</div>`;
    }
  }

  return { init };
})();
