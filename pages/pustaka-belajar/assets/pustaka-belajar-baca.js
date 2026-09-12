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
      // Dibatasi maks 2 (bukan dpr asli perangkat) — banyak HP Android kelas menengah
      // punya devicePixelRatio 3-4, yang kalau dipakai penuh menghasilkan canvas raster
      // sampai ~4200px lebar (targetWidth 1400 × dpr) — berat untuk di-render justru di
      // perangkat paling umum dipakai siswa. dpr 2 sudah lebih dari cukup tajam untuk
      // teks/gambar presentasi dibaca di layar HP. Lihat ANTIREGRESI.md §52.
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const targetWidth = Math.min(stage.clientWidth - 24, 1400);
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

  /** Layar penuh — 2 lapis SENGAJA dipakai bersamaan:
   * (1) Fullscreen API asli (requestFullscreen) kalau didukung browser — bekerja
   *     baik di Chrome/Edge Android & desktop.
   * (2) Mode CSS ".pb-focus-mode" yang menyembunyikan topbar/footer — ini yang
   *     jadi ANDALAN UTAMA di Safari iOS/iPhone, karena Fullscreen API TIDAK
   *     didukung Safari untuk elemen sembarang (cuma untuk <video>). Tanpa lapis
   *     kedua ini, tombol layar penuh akan terasa tidak berfungsi sama sekali
   *     di iPhone — padahal banyak siswa/orang tua kemungkinan besar pakai iPhone.
   * Kedua lapis SELALU dicoba bersamaan tanpa mengecek dukungan browser dulu —
   * kalau lapis (1) gagal/tidak didukung, browser mengabaikannya diam-diam
   * (di-catch), dan lapis (2) tetap jalan sebagai fallback yang selalu berhasil. */
  function mintaLayarPenuh_(el) {
    const fn = el.requestFullscreen || el.webkitRequestFullscreen || el.msRequestFullscreen;
    if (fn) { try { fn.call(el).catch(() => {}); } catch (e) { /* diamkan — lapis CSS tetap jalan */ } }
  }

  function keluarLayarPenuh_() {
    const fn = document.exitFullscreen || document.webkitExitFullscreen || document.msExitFullscreen;
    const sedangFullscreen = document.fullscreenElement || document.webkitFullscreenElement || document.msFullscreenElement;
    if (fn && sedangFullscreen) { try { fn.call(document).catch(() => {}); } catch (e) {} }
  }

  function setModeFokus_(aktif) {
    const root = document.getElementById("app-baca");
    const btn = document.getElementById("pb-fullscreen-btn");
    root.classList.toggle("pb-focus-mode", aktif);
    btn.textContent = aktif ? "⤡" : "⛶";
    btn.setAttribute("aria-label", aktif ? "Keluar layar penuh" : "Layar penuh");
  }

  function toggleLayarPenuh_() {
    const root = document.getElementById("app-baca");
    const aktifSekarang = root.classList.contains("pb-focus-mode");
    setModeFokus_(!aktifSekarang);
    if (!aktifSekarang) mintaLayarPenuh_(root);
    else keluarLayarPenuh_();
  }

  function pasangLayarPenuh_() {
    document.getElementById("pb-fullscreen-btn").addEventListener("click", toggleLayarPenuh_);

    // Sinkronkan tombol kalau pengguna keluar fullscreen lewat tombol Esc/gestur
    // bawaan browser (bukan lewat tombol kita) — supaya ikonnya tidak "nyangkut".
    ["fullscreenchange", "webkitfullscreenchange", "MSFullscreenChange"].forEach((evt) => {
      document.addEventListener(evt, () => {
        const sedangFullscreen = document.fullscreenElement || document.webkitFullscreenElement || document.msFullscreenElement;
        if (!sedangFullscreen) setModeFokus_(false);
      });
    });

    // Render ulang halaman saat ini setiap kali ukuran layar berubah (masuk/keluar
    // layar penuh, atau HP diputar ke landscape) — canvas SEBELUMNYA dirender pada
    // resolusi lama, kalau cuma diperbesar lewat CSS hasilnya jadi buram. Di-debounce
    // 200ms supaya tidak render berkali-kali selama animasi transisi berlangsung.
    let timerResize = null;
    const jadwalkanRenderUlang = () => {
      clearTimeout(timerResize);
      timerResize = setTimeout(() => { if (pdfDoc) renderPage(currentPage); }, 200);
    };
    window.addEventListener("resize", jadwalkanRenderUlang);
    ["fullscreenchange", "webkitfullscreenchange", "MSFullscreenChange"].forEach((evt) => {
      document.addEventListener(evt, jadwalkanRenderUlang);
    });
  }

  /* ── Cache PDF di klien (IndexedDB) ──────────────────────────────────────
     Tujuan: kunjungan ULANG ke materi yang SAMA (pola umum belajar mandiri —
     siswa buka-ulang materi yang sama berkali-kali, bukan sekali baca lalu
     tidak pernah lagi) jadi INSTAN, nol permintaan jaringan sama sekali.

     Aman di-cache TANPA batas waktu/kedaluwarsa karena Drive File ID bersifat
     permanen per file: Code.gs (lihat doPostPustakaBelajar_/doPostPustakaBelajarHapus_)
     TIDAK punya fitur "ganti isi file untuk ID yang sama" — upload baru selalu
     bikin baris + Drive File ID baru. Kalau suatu saat fitur "ganti file" itu
     ditambahkan, cache ini WAJIB diberi invalidasi (mis. sertakan Timestamp
     baris) — jangan lupa cek ANTIREGRESI.md §52 kalau itu terjadi.

     Kegagalan apa pun di cache ini (IndexedDB tidak didukung, mode penyamaran
     Safari yang membatasinya, kuota penuh, dll.) SENGAJA diredam total (try/catch
     mengembalikan null / diam-diam) — cache murni optimisasi, bukan sumber
     kebenaran, dan tidak boleh membuat pembaca gagal memuat dokumen. Lihat
     ANTIREGRESI.md §52 untuk rincian & checklist uji. */
  const CACHE_DB_NAMA = "pustakaBelajarCache";
  const CACHE_STORE_NAMA = "pdf";
  const CACHE_MAKS_ENTRI = 20; // batas jumlah file tersimpan sekaligus per HP — cegah storage device tergerus tanpa batas

  function bukaDbCache_() {
    return new Promise((resolve, reject) => {
      if (!window.indexedDB) { reject(new Error("IndexedDB tidak didukung")); return; }
      const req = indexedDB.open(CACHE_DB_NAMA, 1);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(CACHE_STORE_NAMA)) {
          db.createObjectStore(CACHE_STORE_NAMA, { keyPath: "fileId" });
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  async function ambilDariCache_(fileId) {
    try {
      const db = await bukaDbCache_();
      return await new Promise((resolve) => {
        const tx = db.transaction(CACHE_STORE_NAMA, "readonly");
        const req = tx.objectStore(CACHE_STORE_NAMA).get(fileId);
        req.onsuccess = () => resolve(req.result || null);
        req.onerror = () => resolve(null);
      });
    } catch (e) {
      return null; // anggap cache kosong, lanjut ke jalur network seperti biasa
    }
  }

  async function bersihkanCacheLama_(db) {
    return new Promise((resolve) => {
      const tx = db.transaction(CACHE_STORE_NAMA, "readwrite");
      const store = tx.objectStore(CACHE_STORE_NAMA);
      const req = store.getAll();
      req.onsuccess = () => {
        const semua = req.result || [];
        if (semua.length > CACHE_MAKS_ENTRI) {
          // LRU sederhana berdasar kapan TERAKHIR disimpan/dipakai — buang yang paling lama
          semua.sort((a, b) => a.disimpanPada - b.disimpanPada);
          semua.slice(0, semua.length - CACHE_MAKS_ENTRI).forEach((item) => store.delete(item.fileId));
        }
      };
      tx.oncomplete = resolve;
      tx.onerror = resolve;
    });
  }

  async function simpanKeCache_(fileId, buffer) {
    try {
      const db = await bukaDbCache_();
      await new Promise((resolve) => {
        const tx = db.transaction(CACHE_STORE_NAMA, "readwrite");
        tx.objectStore(CACHE_STORE_NAMA).put({ fileId, bytes: buffer, disimpanPada: Date.now() });
        tx.oncomplete = resolve;
        tx.onerror = resolve; // gagal simpan cache BUKAN error fatal — dokumen sudah tampil dari network
      });
      await bersihkanCacheLama_(db);
    } catch (e) {
      // diamkan — lihat catatan panjang di atas kenapa cache boleh diam-diam gagal
    }
  }

  async function ambilMetadataDanFile_() {
    const id = qs("id");
    if (!id) throw new Error("ID materi tidak ditemukan di tautan.");
    if (typeof MPLS_CONFIG === "undefined" || !MPLS_CONFIG.APPS_SCRIPT_URL) {
      throw new Error("Fitur ini belum siap dikonfigurasi.");
    }

    // JALUR CEPAT (dipakai kalau dibuka dari pustaka-belajar.html, kasus normal): judul &
    // Drive File ID sudah disisipkan landing.js langsung di URL, jadi TIDAK PERLU fetch
    // ?pustakaBelajar=1 lagi cuma untuk mencari 1 baris yang datanya sudah kita punya —
    // menghilangkan 1 round-trip penuh ke Apps Script (yang sudah pelan per-permintaan,
    // ~1.5-2.5 detik) di jalur kritis pembukaan PDF. Lihat catatan lengkap di
    // pustaka-belajar-landing.js dekat pembuatan URL ini.
    let driveFileId = qs("file");
    const judulDariUrl = qs("judul");
    if (driveFileId && judulDariUrl) {
      setTitle(judulDariUrl);
    } else {
      // JALUR CADANGAN (tautan lama tanpa parameter file/judul, mis. hasil bookmark
      // sebelum perbaikan ini, atau dibuka manual) — fetch daftar seperti sebelumnya.
      const resMeta = await fetch(MPLS_CONFIG.APPS_SCRIPT_URL + "?pustakaBelajar=1", { cache: "no-store" });
      if (!resMeta.ok) throw new Error("Server tidak merespons (kode " + resMeta.status + "). Coba muat ulang halaman.");
      const jsonMeta = await resMeta.json();
      if (jsonMeta.status === "error") throw new Error(jsonMeta.message || "Gagal memuat data");
      const row = (jsonMeta.data || []).find((r) => r["ID"] === id);
      if (!row) throw new Error("Materi tidak ditemukan (mungkin sudah dihapus guru).");
      setTitle(row["Judul"] || "Pustaka Belajar");
      driveFileId = row["Drive File ID"];
    }

    // Cek cache lokal (IndexedDB) DULU sebelum ke jaringan — lihat catatan panjang
    // di modul cache PDF di atas soal kenapa ini aman dilakukan tanpa kedaluwarsa.
    const tersimpan = await ambilDariCache_(driveFileId);
    if (tersimpan && tersimpan.bytes) {
      return tersimpan.bytes;
    }

    // cache: "no-store" WAJIB di sini — URL relay yang dipakai Apps Script untuk
    // mengirim isi file (script.googleusercontent.com/macros/echo?user_content_key=...)
    // SEKALI PAKAI dan berubah setiap request. Kalau browser sempat meng-cache
    // respons ini, permintaan berikutnya akan terarah ke URL relay basi yang
    // sudah tidak berlaku (404) — persis pola yang bikin daftar file sempat tidak
    // muncul sebelumnya, cuma kali ini kena di file biner-nya, bukan daftarnya.
    const resBin = await fetch(
      MPLS_CONFIG.APPS_SCRIPT_URL + "?pustakaBinary=" + encodeURIComponent(driveFileId),
      { cache: "no-store" }
    );
    if (!resBin.ok) throw new Error("Gagal mengambil file PDF (kode " + resBin.status + "). Coba muat ulang halaman.");
    let jsonBin;
    try {
      jsonBin = await resBin.json();
    } catch (e) {
      throw new Error("Respons server tidak dikenali. Coba muat ulang halaman.");
    }
    if (jsonBin.status === "error") throw new Error(jsonBin.message || "Gagal membaca file PDF");

    // Dibungkus base64 di JSON (BUKAN Blob mentah) — lihat catatan panjang di
    // servePustakaBinary_() (Code.gs) soal kenapa: Apps Script tidak konsisten
    // menambahkan header CORS saat doGet mengembalikan Blob langsung, sedangkan
    // ContentService JSON SELALU dapat header itu. Decode di sini sebelum
    // diserahkan ke pdf.js.
    const buffer = Uint8Array.from(atob(jsonBin.base64), (c) => c.charCodeAt(0));

    // Pengaman tambahan: PDF asli SELALU diawali tanda "%PDF-" (magic bytes).
    // Kalau tidak ada, berarti yang kebaca bukan PDF asli (mis. sisa cache/relay
    // basi yang lolos dari pengecekan di atas) — hentikan di sini dengan pesan
    // jelas, jangan lanjut ke pdf.js supaya tidak keluar warning membingungkan.
    const header = String.fromCharCode.apply(null, buffer.slice(0, 5));
    if (header !== "%PDF-") {
      throw new Error("File yang diterima bukan PDF yang valid. Coba muat ulang halaman (Ctrl+Shift+R).");
    }

    // Fire-and-forget: simpan ke cache untuk kunjungan berikutnya. SENGAJA tidak
    // di-await — menulis ke IndexedDB tidak boleh menunda halaman pertama tampil.
    simpanKeCache_(driveFileId, buffer);

    return buffer;
  }

  async function init() {
    pasangNavigasi();
    pasangLayarPenuh_();
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
