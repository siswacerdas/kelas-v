/* ============================================================
   MATERI-NAV.JS — dipakai oleh semua halaman detail materi
   Butuh materi-index.js sudah dimuat lebih dulu.
   Otomatis mengisi:
     - <div id="ma-prevnext"></div>  → kartu "sebelumnya/berikutnya"
       berdasarkan urutan di mapel yang sama
     - tombol .ma-fsbtn[data-level]  → ukuran huruf (normal/besar/ekstra)
   Tidak perlu diedit setiap ada materi baru — cukup pastikan
   materi-index.js sudah berisi entri halaman ini.
   ============================================================ */
(function () {
  function getRelFile() {
    var parts = window.location.pathname.split("/").filter(Boolean);
    return parts.slice(-2).join("/"); // "{mapelSlug}/{file}.html"
  }

  function esc(str) {
    return String(str).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function renderPrevNext() {
    var el = document.getElementById("ma-prevnext");
    if (!el || !window.MATERI_INDEX) return;

    var current = getRelFile();
    var entry = window.MATERI_INDEX.find(function (e) { return e.file === current; });
    if (!entry) return;

    var siblings = window.MATERI_INDEX
      .filter(function (e) { return e.mapelSlug === entry.mapelSlug; })
      .sort(function (a, b) { return a.urutan - b.urutan; });
    var idx = siblings.findIndex(function (e) { return e.file === current; });
    var prev = idx > 0 ? siblings[idx - 1] : null;
    var next = idx < siblings.length - 1 ? siblings[idx + 1] : null;

    var html = "";
    if (prev) {
      html += '<a class="ma-navcard ma-prev" href="../' + prev.file + '">' +
        '<div class="ma-nav-dir">‹ Sebelumnya</div>' +
        '<div class="ma-nav-title">' + esc(prev.judul) + "</div></a>";
    }
    if (next) {
      html += '<a class="ma-navcard ma-next" href="../' + next.file + '">' +
        '<div class="ma-nav-dir">Berikutnya ›</div>' +
        '<div class="ma-nav-title">' + esc(next.judul) + "</div></a>";
    }
    el.innerHTML = html;
  }

  function setupFontSize() {
    var root = document.querySelector(".ma-root");
    var btns = document.querySelectorAll(".ma-fsbtn");
    if (!root || !btns.length) return;

    function applyLevel(level) {
      root.classList.remove("ma-fs-besar", "ma-fs-ekstra");
      if (level === "besar") root.classList.add("ma-fs-besar");
      if (level === "ekstra") root.classList.add("ma-fs-ekstra");
      btns.forEach(function (b) {
        b.classList.toggle("ma-active", b.dataset.level === level);
      });
    }
    btns.forEach(function (b) {
      b.addEventListener("click", function () { applyLevel(b.dataset.level); });
    });
    applyLevel("normal");
  }

  document.addEventListener("DOMContentLoaded", function () {
    renderPrevNext();
    setupFontSize();
  });
})();
