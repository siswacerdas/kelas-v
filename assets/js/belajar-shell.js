/**
 * belajar-shell.js — Navigasi Jalur Belajar (Langkah 1–3)
 *
 * Usage on each page:
 *   <body class="bl-has-shell" data-belajar-step="1">  // 1 | 2 | 3
 *   ...
 *   <script src="../assets/js/belajar-shell.js"></script>
 *
 * Script highlights the active step in sidebar + bottom bar.
 * Does not depend on Firebase / role-guard.
 */
(function () {
  var step = document.body.getAttribute("data-belajar-step") || "1";

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

  function run() {
    mark(".bl-step-link");
    mark(".bl-bottom-link");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run);
  } else {
    run();
  }
})();
