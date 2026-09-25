/**
 * belajar-shell.js — Jalur Belajar: langkah 1–3, mapel, daftar materi (loncat)
 *
 * body.bl-has-shell data-belajar-step="1|2|3"
 * window.belajarShellRenderMapel(items, active, onSelect)
 * window.belajarShellRenderItems(items, onSelect, labelTitle)
 * window.belajarShellClearItems()
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
    '<div class="bl-sidebar-section" id="bl-mapel-section" hidden>' +
    '<div class="bl-sidebar-label">Mata pelajaran</div>' +
    '<nav class="bl-mapel-nav" id="bl-mapel-nav"></nav>' +
    '</div>' +
    '<div class="bl-sidebar-section" id="bl-item-section" hidden>' +
    '<div class="bl-sidebar-label" id="bl-item-label">Materi</div>' +
    '<nav class="bl-item-nav" id="bl-item-nav"></nav>' +
    '</div>' +
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
    nodes.forEach(function (n) { main.appendChild(n); });

    layout.insertAdjacentHTML("afterbegin", SIDEBAR_HTML);
    layout.appendChild(main);

    if (topbar) topbar.after(layout);
    else app.insertBefore(layout, app.firstChild);

    app.insertAdjacentHTML("beforeend", BOTTOM_HTML);

    var fr = app.querySelector("#filter-row");
    if (fr) fr.classList.add("bl-sticky-filters");
  }

  function run() {
    wrapLayout();
    mark(".bl-step-link");
    mark(".bl-bottom-link");
  }

  window.belajarShellRenderMapel = function (items, active, onSelect) {
    var nav = document.getElementById("bl-mapel-nav");
    var section = document.getElementById("bl-mapel-section");
    if (!nav || !section) return;
    if (!items || items.length === 0) {
      section.hidden = true;
      nav.innerHTML = "";
      return;
    }
    section.hidden = false;
    nav.innerHTML = "";
    items.forEach(function (it) {
      var name = typeof it === "string" ? it : it.name;
      var count = typeof it === "string" ? null : it.count;
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "bl-mapel-link" + (name === active ? " active" : "");
      btn.setAttribute("data-mapel", name);
      var label = document.createElement("span");
      label.textContent = name;
      btn.appendChild(label);
      if (count != null && name !== "Semua") {
        var c = document.createElement("span");
        c.className = "bm-count";
        c.textContent = String(count);
        btn.appendChild(c);
      }
      btn.addEventListener("click", function () {
        if (typeof onSelect === "function") onSelect(name);
      });
      nav.appendChild(btn);
    });
  };

  window.belajarShellClearItems = function () {
    var nav = document.getElementById("bl-item-nav");
    var section = document.getElementById("bl-item-section");
    if (nav) nav.innerHTML = "";
    if (section) section.hidden = true;
  };

  window.belajarShellRenderItems = function (items, onSelect, labelTitle) {
    var nav = document.getElementById("bl-item-nav");
    var section = document.getElementById("bl-item-section");
    var label = document.getElementById("bl-item-label");
    if (!nav || !section) return;
    if (label && labelTitle) label.textContent = labelTitle;
    if (!items || items.length === 0) {
      section.hidden = true;
      nav.innerHTML = "";
      return;
    }
    section.hidden = false;
    nav.innerHTML = "";
    items.forEach(function (it) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "bl-item-link";
      btn.setAttribute("data-item-id", it.id);
      btn.textContent = it.label;
      btn.title = it.label;
      btn.addEventListener("click", function () {
        var links = nav.querySelectorAll(".bl-item-link");
        for (var i = 0; i < links.length; i++) links[i].classList.remove("active");
        btn.classList.add("active");
        if (typeof onSelect === "function") onSelect(it.id);
      });
      nav.appendChild(btn);
    });
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run);
  } else {
    run();
  }
  document.addEventListener("role-verified", function () {
    setTimeout(run, 0);
  });
})();
