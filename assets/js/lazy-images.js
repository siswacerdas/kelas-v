/* ============================================================
   lazy-images.js — strategi lazy loading gambar (kelas-v)
   ------------------------------------------------------------
   Pakai native loading="lazy" + decoding="async" sebagai default.
   IntersectionObserver hanya untuk:
     - <img> tanpa loading=lazy (konten lama)
     - background-image via data-bg
   Tidak memuat ulang gambar yang sudah ada di cache browser.
   ============================================================ */
(function (global) {
  const SELECTOR_IMG = "img:not([loading]):not([data-lazy-done])";
  const SELECTOR_BG = "[data-bg]:not([data-lazy-done])";

  function applyNative(img) {
    if (!img.getAttribute("loading")) img.setAttribute("loading", "lazy");
    if (!img.getAttribute("decoding")) img.setAttribute("decoding", "async");
    // fetchpriority low untuk non-LCP; biarkan hero set high sendiri
    if (!img.getAttribute("fetchpriority") && !img.closest("[data-lcp]")) {
      img.setAttribute("fetchpriority", "low");
    }
  }

  function loadBg(el) {
    const url = el.getAttribute("data-bg");
    if (!url) return;
    el.style.backgroundImage = 'url("' + url.replace(/"/g, '\\"') + '")';
    el.setAttribute("data-lazy-done", "1");
  }

  function enhanceExisting() {
    document.querySelectorAll("img").forEach(applyNative);
  }

  function observe() {
    const imgs = document.querySelectorAll(SELECTOR_IMG);
    const bgs = document.querySelectorAll(SELECTOR_BG);
    if (!imgs.length && !bgs.length) return;

    if (!("IntersectionObserver" in window)) {
      imgs.forEach((img) => {
        applyNative(img);
        img.setAttribute("data-lazy-done", "1");
      });
      bgs.forEach(loadBg);
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (!en.isIntersecting) return;
          const el = en.target;
          if (el.tagName === "IMG") {
            applyNative(el);
            // jika data-src dipakai (pola legacy)
            const ds = el.getAttribute("data-src");
            if (ds && !el.getAttribute("src")) el.setAttribute("src", ds);
            el.setAttribute("data-lazy-done", "1");
          } else {
            loadBg(el);
          }
          io.unobserve(el);
        });
      },
      { rootMargin: "200px 0px", threshold: 0.01 }
    );

    imgs.forEach((img) => io.observe(img));
    bgs.forEach((el) => io.observe(el));
  }

  function init() {
    enhanceExisting();
    observe();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  // Untuk konten yang di-inject belakangan (innerHTML kartu, dll.)
  global.LazyImages = { init: init, scan: observe, enhance: enhanceExisting };
})(window);
