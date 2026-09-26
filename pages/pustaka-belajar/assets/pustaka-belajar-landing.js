/* ============================================================
   pustaka-belajar-landing.js — logika halaman pages/pustaka-belajar.html
   Optimasi: chip di-render 1×, filter via class toggle + indeks mapel.
   ============================================================ */
window.PustakaBelajarLanding = (function () {
  let allRows = [];
  let activeSlug = "semua";
  let chipsReady = false;
  let sortedCache = null;       // hasil sort sekali setelah data berubah
  let rowsBySlug = null;        // { slug: row[] } — filter O(1) per kelompok
  const mapelByName = new Map(); // nama mapel → meta

  function rebuildMapelIndex_() {
    mapelByName.clear();
    (window.PUSTAKA_BELAJAR_MAPEL || []).forEach((m) => {
      mapelByName.set(m.mapel, m);
    });
  }

  function findMapel(nama) {
    return mapelByName.get(nama);
  }

  function slugClass(slug) {
    return slug ? "pb-m-" + slug : "";
  }

  function escapeHtml_(s) {
    const div = document.createElement("div");
    div.textContent = s == null ? "" : String(s);
    return div.innerHTML;
  }

  function formatTanggal(iso) {
    if (!iso) return "";
    const d = new Date(iso);
    if (isNaN(d.getTime())) return "";
    return d.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
  }

  /** Bangun chip sekali saja. Klik memakai event delegation. */
  function renderChips() {
    const wrap = document.getElementById("pb-filter-chips");
    if (!wrap) return;

    if (!chipsReady) {
      rebuildMapelIndex_();
      const chips = [{ mapel: "Semua", mapelSlug: "semua", mapelIcon: "📚" }].concat(
        window.PUSTAKA_BELAJAR_MAPEL || []
      );
      // DocumentFragment via string satu kali — hindari N× appendChild
      const html = chips
        .map((m) => {
          const active = m.mapelSlug === activeSlug ? " pb-chip-active" : "";
          return (
            '<button type="button" class="pb-chip' + active + '" data-slug="' + m.mapelSlug + '">' +
              '<span class="pb-chip-icon">' + m.mapelIcon + "</span>" + m.mapel +
            "</button>"
          );
        })
        .join("");
      wrap.innerHTML = html;
      // Delegation: 1 listener untuk semua chip
      wrap.addEventListener("click", onChipClick_);
      chipsReady = true;
      return;
    }

    // Update status aktif tanpa rebuild DOM
    const buttons = wrap.children;
    for (let i = 0; i < buttons.length; i++) {
      const btn = buttons[i];
      const on = btn.getAttribute("data-slug") === activeSlug;
      btn.classList.toggle("pb-chip-active", on);
    }
  }

  function onChipClick_(e) {
    const btn = e.target.closest(".pb-chip");
    if (!btn || !btn.getAttribute("data-slug")) return;
    const slug = btn.getAttribute("data-slug");
    if (slug === activeSlug) return; // tidak perlu render ulang
    activeSlug = slug;
    renderChips(); // hanya toggle class
    renderList();
  }

  /** Indeks + sort sekali saat data berubah (bukan tiap klik chip). */
  function indexRows_() {
    const rows = allRows || [];
    sortedCache = rows.slice().sort((a, b) => {
      const ta = a["Timestamp"] || a["Tanggal"] || "";
      const tb = b["Timestamp"] || b["Tanggal"] || "";
      return String(tb).localeCompare(String(ta));
    });
    rowsBySlug = Object.create(null);
    sortedCache.forEach((r) => {
      const m = findMapel(r["Mapel"]);
      const slug = (m && m.mapelSlug) || "_lain";
      (rowsBySlug[slug] || (rowsBySlug[slug] = [])).push(r);
    });
  }

  function rowsForActive_() {
    if (!sortedCache) indexRows_();
    if (!activeSlug || activeSlug === "semua") return sortedCache || [];
    return (rowsBySlug && rowsBySlug[activeSlug]) || [];
  }

  function renderList() {
    const listEl = document.getElementById("pb-list");
    if (!listEl) return;
    const rows = rowsForActive_();
    if (rows.length === 0) {
      listEl.innerHTML =
        '<div class="pb-empty">Belum ada file untuk kategori ini.<br>' +
        '<span style="font-size:12.5px;opacity:.8">Guru dapat mengunggah PDF dari menu Admin → Pustaka Belajar.</span></div>';
      return;
    }

    // Bangun HTML dalam satu string; 1× innerHTML = 1 reflow
    let html = '<div class="pb-grid">';
    for (let i = 0; i < rows.length; i++) {
      const r = rows[i];
      const m = findMapel(r["Mapel"]) || { mapelSlug: "", mapelIcon: "📄", mapel: r["Mapel"] || "" };
      const tgl = formatTanggal(r["Timestamp"] || r["Tanggal"] || "");
      const id = encodeURIComponent(r["ID"] || "");
      const judul = encodeURIComponent(r["Judul"] || "");
      const file = encodeURIComponent(r["Drive File ID"] || "");
      html +=
        '<a class="pb-card ' + slugClass(m.mapelSlug) + '" href="pustaka-belajar/baca.html?id=' + id +
        "&judul=" + judul + "&file=" + file + '">' +
          '<div class="pb-card-top">' +
            '<span class="pb-card-icon">' + m.mapelIcon + "</span>" +
            '<span class="pb-card-badge">' + escapeHtml_(r["Mapel"] || "") + "</span>" +
          "</div>" +
          '<div class="pb-card-title">' + escapeHtml_(r["Judul"] || "(Tanpa judul)") + "</div>" +
          (r["Deskripsi"]
            ? '<div class="pb-card-desc">' + escapeHtml_(r["Deskripsi"]) + "</div>"
            : "") +
          '<div class="pb-card-meta">' +
            "<span>" + (tgl || "PDF") + "</span>" +
            '<span class="pb-card-cta">Baca →</span>' +
          "</div>" +
        "</a>";
    }
    html += "</div>";
    listEl.innerHTML = html;
  }

  // ── Cache daftar (sessionStorage) ──
  const LIST_CACHE_KEY = "pb_list_v1";
  const LIST_CACHE_TTL_MS = 3 * 60 * 1000;

  function bacaListCache_() {
    try {
      const raw = sessionStorage.getItem(LIST_CACHE_KEY);
      if (!raw) return null;
      const obj = JSON.parse(raw);
      if (!obj || !Array.isArray(obj.data) || !obj.ts) return null;
      if (Date.now() - obj.ts > LIST_CACHE_TTL_MS) return null;
      return obj.data;
    } catch (e) {
      return null;
    }
  }

  function tulisListCache_(data) {
    try {
      sessionStorage.setItem(LIST_CACHE_KEY, JSON.stringify({ ts: Date.now(), data: data || [] }));
    } catch (e) {}
  }

  window.pbInvalidateListCache = function () {
    try { sessionStorage.removeItem(LIST_CACHE_KEY); } catch (e) {}
  };

  async function fetchListNetwork_() {
    let lastErr = null;
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const res = await fetch(MPLS_CONFIG.APPS_SCRIPT_URL + "?pustakaBelajar=1", { cache: "no-store" });
        if (!res.ok) throw new Error("kode " + res.status);
        const json = await res.json();
        if (json.status === "error") throw new Error(json.message || "Gagal memuat");
        return json.data || [];
      } catch (e) {
        lastErr = e;
        if (attempt === 0) await new Promise((r) => setTimeout(r, 400));
      }
    }
    throw lastErr || new Error("Gagal memuat");
  }

  function setData_(data) {
    allRows = data || [];
    sortedCache = null;
    rowsBySlug = null;
    indexRows_();
  }

  async function loadData(opts) {
    rebuildMapelIndex_();
    renderChips();
    if (typeof MPLS_CONFIG === "undefined" || !MPLS_CONFIG.APPS_SCRIPT_URL) {
      document.getElementById("pb-list").innerHTML =
        '<div class="pb-empty">Fitur ini belum siap dikonfigurasi.</div>';
      return;
    }
    const force = opts && opts.force;
    try {
      if (!force) {
        const cached = bacaListCache_();
        if (cached) {
          setData_(cached);
          renderList();
          fetchListNetwork_()
            .then((data) => {
              tulisListCache_(data);
              setData_(data);
              renderList();
            })
            .catch(() => {});
          return;
        }
      }
      const data = await fetchListNetwork_();
      tulisListCache_(data);
      setData_(data);
      renderList();
    } catch (err) {
      try {
        const raw = sessionStorage.getItem(LIST_CACHE_KEY);
        if (raw) {
          const obj = JSON.parse(raw);
          if (obj && Array.isArray(obj.data) && obj.data.length) {
            setData_(obj.data);
            renderList();
            return;
          }
        }
      } catch (e2) {}
      document.getElementById("pb-list").innerHTML =
        '<div class="pb-empty">Gagal memuat daftar. Coba muat ulang halaman.</div>';
    }
  }

  return { init: loadData, reload: () => loadData({ force: true }) };
})();
