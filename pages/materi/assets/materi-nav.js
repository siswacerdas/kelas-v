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
  function esc(str) {
    return String(str).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function currentEntry() {
    if (!window.MATERI_INDEX) return null;
    var path = window.location.pathname;
    // Dicocokkan dengan "berakhiran .../{file}" -- BUKAN cuma 2 segmen
    // terakhir, karena kedalaman folder berbeda-beda per mapel (mis.
    // Matematika 1 folder: "matematika/x.html", Bahasa Indonesia 2
    // folder: "bahasa-indonesia/menulis-pengalaman/x.html").
    return window.MATERI_INDEX.find(function (e) {
      return path === e.file || path.endsWith("/" + e.file);
    }) || null;
  }

  // Jumlah folder di dalam "pages/materi/" untuk entry ini -- dipakai
  // untuk menghitung berapa kali "../" dibutuhkan agar link ke entry LAIN
  // (yang juga relatif terhadap pages/materi/) resolve dengan benar,
  // berapa pun kedalaman foldernya.
  function upPrefix(entry) {
    var depth = entry.file.split("/").length - 1; // -1 karena segmen terakhir adalah nama file
    var up = "";
    for (var i = 0; i < depth; i++) up += "../";
    return up;
  }

  function renderPrevNext(entry) {
    var el = document.getElementById("ma-prevnext");
    if (!el) return;

    // Dibatasi mapel + tema (tema = label TP untuk mapel yang punya banyak
    // TP seperti Bahasa Indonesia) supaya navigasi tidak melompat ke TP lain
    var siblings = window.MATERI_INDEX
      .filter(function (e) { return e.mapelSlug === entry.mapelSlug && e.tema === entry.tema; })
      .sort(function (a, b) { return a.urutan - b.urutan; });
    var idx = siblings.findIndex(function (e) { return e.file === entry.file; });
    var prev = idx > 0 ? siblings[idx - 1] : null;
    var next = idx < siblings.length - 1 ? siblings[idx + 1] : null;
    var up = upPrefix(entry);

    el.innerHTML =
      (prev
        ? '<a class="ma-navcard ma-prev" href="' + up + prev.file + '">' +
          '<div class="ma-nav-dir">‹ Sebelumnya</div>' +
          '<div class="ma-nav-title">' + esc(prev.judul) + "</div></a>"
        : '<div class="ma-navempty">Ini materi pertama di ' + esc(entry.tema) + "</div>") +
      (next
        ? '<a class="ma-navcard ma-next" href="' + up + next.file + '">' +
          '<div class="ma-nav-dir">Berikutnya ›</div>' +
          '<div class="ma-nav-title">' + esc(next.judul) + "</div></a>"
        : '<div class="ma-navempty">Materi berikutnya menyusul</div>');
  }

  function renderRelated(entry) {
    var el = document.getElementById("ma-related");
    if (!el) return;

    var related, title;
    if (entry.elemen) {
      // Mapel dengan banyak TP (mis. Bahasa Indonesia): tampilkan TP LAIN
      // dalam elemen yang sama (navigasi dalam-TP sudah ditangani prevnext)
      related = window.MATERI_INDEX.filter(function (e) {
        return e.mapelSlug === entry.mapelSlug && e.elemen === entry.elemen && e.tema !== entry.tema;
      });
      title = 'Tujuan Pembelajaran lain dalam elemen "' + esc(entry.elemen) + '"';
      if (related.length === 0) {
        related = window.MATERI_INDEX.filter(function (e) {
          return e.mapelSlug === entry.mapelSlug && e.tema === entry.tema && e.file !== entry.file;
        });
        title = 'Materi lain dalam "' + esc(entry.tema) + '"';
      }
    } else {
      // Mapel sederhana (belum berbasis TP): pola lama, kelompok per tema
      related = window.MATERI_INDEX.filter(function (e) {
        return e.mapelSlug === entry.mapelSlug && e.tema === entry.tema && e.file !== entry.file;
      });
      title = 'Materi lain dalam tema "' + esc(entry.tema) + '"';
    }
    related = related.filter(function (e, i, arr) {
      // ambil 1 wakil per tema-berbeda supaya daftar tidak terlalu panjang
      return arr.findIndex(function (x) { return x.tema === e.tema; }) === i;
    }).sort(function (a, b) { return (a.tp || "").localeCompare(b.tp || ""); });

    if (related.length === 0) {
      el.innerHTML = '<div class="ma-related-title">' + title + '</div>' +
        '<div class="ma-navempty">Belum ada materi lain di sini.</div>';
      return;
    }

    var up = upPrefix(entry);
    var cards = related.map(function (r) {
      var icon = r.icon || r.mapelIcon || "📖";
      return '<a class="ma-list-card" style="--m-color:' + entry.mapelColor + '" href="' + up + r.file + '">' +
        '<div class="ma-list-icon">' + icon + '</div>' +
        '<div><div class="ma-list-title">' + esc(r.judul) + '</div>' +
        '<div class="ma-list-tema">' + esc(r.tema) + '</div></div>' +
        '<div class="ma-list-arrow">→</div></a>';
    }).join("");

    el.innerHTML = '<div class="ma-related-title">' + title + '</div>' + cards;
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

  // Diekspos supaya materi-progress-tracker.js (dimuat SETELAH file ini) bisa mengenali
  // materi mana yang sedang dibuka TANPA menduplikasi logika pencocokan path di atas.
  window.MateriNav = { currentEntry: currentEntry };
})();
