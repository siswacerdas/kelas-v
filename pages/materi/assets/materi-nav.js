/* ============================================================
   MATERI-NAV.JS — dipakai oleh semua halaman detail materi
   Butuh materi-index.js sudah dimuat lebih dulu.
   Otomatis mengisi:
     - <div id="ma-prevnext"></div>  → kartu "sebelumnya/berikutnya"
       berdasarkan urutan di mapel yang sama (kalau cuma ada 1 materi
       di mapel itu, tampil placeholder, bukan kosong melompong)
     - <div id="ma-related"></div>   → daftar "materi lain dalam tema
       ini" (pengganti sementara pengelompokan TP/CP, sampai dokumen
       resminya ada — lihat catatan field "tp" di materi-index.js)
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

  function currentEntry() {
    if (!window.MATERI_INDEX) return null;
    var current = getRelFile();
    return window.MATERI_INDEX.find(function (e) { return e.file === current; }) || null;
  }

  function renderPrevNext(entry) {
    var el = document.getElementById("ma-prevnext");
    if (!el) return;

    var siblings = window.MATERI_INDEX
      .filter(function (e) { return e.mapelSlug === entry.mapelSlug; })
      .sort(function (a, b) { return a.urutan - b.urutan; });
    var idx = siblings.findIndex(function (e) { return e.file === entry.file; });
    var prev = idx > 0 ? siblings[idx - 1] : null;
    var next = idx < siblings.length - 1 ? siblings[idx + 1] : null;

    el.innerHTML =
      (prev
        ? '<a class="ma-navcard ma-prev" href="../' + prev.file + '">' +
          '<div class="ma-nav-dir">‹ Sebelumnya</div>' +
          '<div class="ma-nav-title">' + esc(prev.judul) + "</div></a>"
        : '<div class="ma-navempty">Ini materi pertama di ' + esc(entry.mapel) + "</div>") +
      (next
        ? '<a class="ma-navcard ma-next" href="../' + next.file + '">' +
          '<div class="ma-nav-dir">Berikutnya ›</div>' +
          '<div class="ma-nav-title">' + esc(next.judul) + "</div></a>"
        : '<div class="ma-navempty">Materi berikutnya menyusul</div>');
  }

  function renderRelated(entry) {
    var el = document.getElementById("ma-related");
    if (!el) return;

    // Sementara dikelompokkan berdasarkan "tema" (proksi TP/CP).
    // Begitu field "tp" terisi dari dokumen resmi, ganti baris di
    // bawah ini jadi: e.tp && e.tp === entry.tp
    var related = window.MATERI_INDEX.filter(function (e) {
      return e.tema === entry.tema && e.mapelSlug === entry.mapelSlug && e.file !== entry.file;
    }).sort(function (a, b) { return a.urutan - b.urutan; });

    if (related.length === 0) {
      el.innerHTML =
        '<div class="ma-related-title">Materi lain dalam tema "' + esc(entry.tema) + '"</div>' +
        '<div class="ma-navempty">Belum ada materi lain dalam tema ini.</div>';
      return;
    }

    var cards = related.map(function (r) {
      return '<a class="ma-list-card" style="--m-color:' + entry.mapelColor + '" href="../' + r.file + '">' +
        '<div class="ma-list-icon">' + entry.mapelIcon + '</div>' +
        '<div><div class="ma-list-title">' + esc(r.judul) + '</div></div>' +
        '<div class="ma-list-arrow">→</div></a>';
    }).join("");

    el.innerHTML = '<div class="ma-related-title">Materi lain dalam tema "' + esc(entry.tema) + '"</div>' + cards;
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
    var entry = currentEntry();
    if (entry) {
      renderPrevNext(entry);
      renderRelated(entry);
    }
    setupFontSize();
  });
})();
