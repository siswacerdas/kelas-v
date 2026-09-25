/**
 * belajar-shell.js — Navigasi Jalur Belajar (Langkah 1–3)
 *
 * Usage:
 *   <body class="bl-has-shell" data-belajar-step="1">
 *   <link rel="stylesheet" href="../assets/css/belajar-shell.css" />
 *   <script src="../assets/js/belajar-shell.js"></script>
 *
 * Injects sidebar (desktop) + bottom bar (mobile) and highlights active step.
 */
(function () {
  var step = document.body.getAttribute("data-belajar-step") || "1";

  var SIDEBAR_HTML =
    '<aside class="bl-sidebar" aria-label="Navigasi jalur belajar">' +
    '<div class="bl-sidebar-inner">' +
    '<div class="bl-sidebar-label">Jalur Belajar</div>' +
    '<nav class="bl-steps">' +
    '<a class="bl-step-link" data-step="1" href="modul.html">' +
    '<span class="bl-step-num">1</span>' +
    '<span class="bl-step-text"><span class="bl-step-name">Ayo Belajar!</span>' +
    '<span class="bl-step-desc">Modul interaktif</span></span></a>' +
    '<a class="bl-step-link" data-step="2" href="materi.html">' +
    '<span class="bl-step-num">2</span>' +
    '<span class="bl-step-text"><span class="bl-step-name">Ingat Lagi</span>' +
    '<span class="bl-step-desc">Baca ulang materi</span></span></a>' +
    '<a class="bl-step-link" data-step="3" href="uji-kemampuan.html">' +
    '<span class="bl-step-num">3</span>' +
    '<span class="bl-step-text"><span class="bl-step-name">Uji Kemampuan</span>' +
    '<span class="bl-step-desc">Latihan soal</span></span></a>' +
    '</nav>' +
    '<div class="bl-sidebar-foot"><a href="../index.html">← Beranda</a></div>' +
    '</div></aside>';

  var BOTTOM_HTML =
    '<nav class="bl-bottom" aria-label="Navigasi jalur belajar">' +
    '<a class="bl-bottom-link" data-step="1" href="modul.html">' +
    '<span class="bl-b-icon">🚀</span><span class="bl-b-label">Belajar</span></a>' +
    '<a class="bl-bottom-link" data-step="2" href="materi.html">' +
    '<span class="bl-b-icon">🔁</span><span class="bl-b-label">Ingat</span></a>' +
    '<a class="bl-bottom-link" data-step="3" href="uji-kemampuan.html">' +
    '<span class="bl-b-icon">💪</span><span class="bl-b-label">Uji</span></a>' +
    '</nav>';

  function mark(selector) {
    var nodes = document.querySelectorAll(selector);
    for (var i = 0; i < nodes.length; i++) {
      var el = nodes[i];
      if (el.getAttribute("data-step") === step) {
        el.classList.add("active");
        el.setAttribute("aria-current", "page");
      } else {
        el.classList.remove("active");
        el.removeAttribute("aria-current");
      }
    }
  }

  function findAppRoot() {
    return (
      document.getElementById("app-modul") ||
      document.getElementById("app-materi") ||
      document.getElementById("app-soal") ||
      document.querySelector("[id^='app-']")
    );
  }

  function wrapLayout() {
    var app = findAppRoot();
    if (!app || app.querySelector(".bl-layout")) return;

    var topbar = app.querySelector("#topbar");
    var nodes = [];
    var child = topbar ? topbar.nextElementSibling : app.firstElementChild;
    while (child) {
      var next = child.nextElementSibling;
      nodes.push(child);
      child = next;
    }

    if (nodes.length === 0) return;

    var layout = document.createElement("div");
    layout.className = "bl-layout";

    var main = document.createElement("main");
    main.className = "bl-main";

    nodes.forEach(function (n) {
      main.appendChild(n);
    });

    layout.insertAdjacentHTML("afterbegin", SIDEBAR_HTML);
    layout.appendChild(main);

    if (topbar) {
      topbar.after(layout);
    } else {
      app.insertBefore(layout, app.firstChild);
    }

    app.insertAdjacentHTML("beforeend", BOTTOM_HTML);
  }

  function run() {
    wrapLayout();
    mark(".bl-step-link");
    mark(".bl-bottom-link");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run);
  } else {
    run();
  }

  document.addEventListener("role-verified", function () {
    setTimeout(run, 0);
  });
})();
