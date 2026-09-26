/* ============================================================
   pustaka-belajar-landing.js — logika halaman pages/pustaka-belajar.html
   Lihat RANCANGAN-PUSTAKA-BELAJAR.md untuk konteks fitur ini.
   ============================================================ */
window.PustakaBelajarLanding = (function () {
  let allRows = [];
  let activeSlug = "semua";

  function findMapel(nama) {
    return window.PUSTAKA_BELAJAR_MAPEL.find((m) => m.mapel === nama);
  }

  function slugClass(slug) {
    return "ma-mapel-" + slug;
  }

  function renderChips() {
    const wrap = document.getElementById("pb-filter-chips");
    const chips = [{ mapel: "Semua", mapelSlug: "semua", mapelIcon: "📚" }].concat(
      window.PUSTAKA_BELAJAR_MAPEL
    );
    wrap.innerHTML = chips
      .map((m) => {
        const active = m.mapelSlug === activeSlug ? "pb-chip-active" : "";
        return `<button type="button" class="pb-chip ${active}" data-slug="${m.mapelSlug}">
          <span class="pb-chip-icon">${m.mapelIcon}</span>${m.mapel}
        </button>`;
      })
      .join("");
    wrap.querySelectorAll(".pb-chip").forEach((btn) => {
      btn.addEventListener("click", () => {
        activeSlug = btn.dataset.slug;
        renderChips();
        renderList();
      });
    });
  }

  function formatTanggal(iso) {
    if (!iso) return "";
    const d = new Date(iso);
    if (isNaN(d.getTime())) return "";
    return d.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
  }

  function renderList() {
    const listEl = document.getElementById("pb-list");
    if (!listEl) return;
    let rows = allRows || [];
    if (activeSlug && activeSlug !== "semua") {
      rows = rows.filter((r) => {
        const m = findMapel(r["Mapel"]);
        return m && m.mapelSlug === activeSlug;
      });
    }
    if (rows.length === 0) {
      listEl.innerHTML = `<div class="pb-empty">Belum ada file untuk kategori ini.<br><span style="font-size:12.5px;opacity:.8">Guru dapat mengunggah PDF dari menu Admin → Pustaka Belajar.</span></div>`;
      return;
    }
    const sorted = rows.slice().sort((a, b) => {
      const ta = a["Timestamp"] || a["Tanggal"] || "";
      const tb = b["Timestamp"] || b["Tanggal"] || "";
      return String(tb).localeCompare(String(ta));
    });
    listEl.innerHTML = `<div class="pb-grid">${sorted
      .map((r) => {
        const m = findMapel(r["Mapel"]) || { mapelSlug: "", mapelIcon: "📄", mapel: r["Mapel"] || "" };
        const tgl = formatTanggal(r["Timestamp"] || r["Tanggal"] || "");
        return `
        <a class="pb-card ${slugClass(m.mapelSlug)}" href="pustaka-belajar/baca.html?id=${encodeURIComponent(r["ID"] || "")}&judul=${encodeURIComponent(r["Judul"] || "")}&file=${encodeURIComponent(r["Drive File ID"] || "")}">
          <div class="pb-card-top">
            <span class="pb-card-icon">${m.mapelIcon}</span>
            <span class="pb-card-badge">${escapeHtml_(r["Mapel"] || "")}</span>
          </div>
          <div class="pb-card-title">${escapeHtml_(r["Judul"] || "(Tanpa judul)")}</div>
          ${r["Deskripsi"] ? `<div class="pb-card-desc">${escapeHtml_(r["Deskripsi"])}</div>` : ""}
          <div class="pb-card-meta">
            <span>${tgl || "PDF"}</span>
            <span class="pb-card-cta">Baca →</span>
          </div>
        </a>`;
      })
      .join("")}</div>`;
  }

  function escapeHtml_(s) {
    const div = document.createElement("div");
    div.textContent = String(s);
    return div.innerHTML;
  }

  // Cache daftar di sessionStorage (bukan HTTP cache browser).
  // Apps Script URL relay SEKALI PAKAI → fetch tetap { cache: "no-store" }.
  // sessionStorage hanya menyimpan JSON daftar agar kembali ke landing tidak
  // menunggu 1.5–2.5 dtk tiap kali. TTL pendek supaya unggahan guru muncul cepat.
  const LIST_CACHE_KEY = "pb_list_v1";
  const LIST_CACHE_TTL_MS = 3 * 60 * 1000; // 3 menit

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
    } catch (e) { /* quota / private mode — abaikan */ }
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

  async function loadData(opts) {
    renderChips();
    if (typeof MPLS_CONFIG === "undefined" || !MPLS_CONFIG.APPS_SCRIPT_URL) {
      document.getElementById("pb-list").innerHTML =
        `<div class="pb-empty">Fitur ini belum siap dikonfigurasi.</div>`;
      return;
    }
    const force = opts && opts.force;
    try {
      if (!force) {
        const cached = bacaListCache_();
        if (cached) {
          allRows = cached;
          renderList();
          // revalidasi diam-diam di latar — daftar tetap tampil dari cache
          fetchListNetwork_().then((data) => {
            tulisListCache_(data);
            allRows = data;
            renderList();
          }).catch(() => {});
          return;
        }
      }
      listEl = document.getElementById("pb-list");
      if (listEl && !(opts && opts.force)) {
        /* skeleton already in HTML on first paint */
      }
      allRows = await fetchListNetwork_();
      tulisListCache_(allRows);
      renderList();
    } catch (err) {
      // fallback: tampilkan cache kedaluwarsa jika ada
      try {
        const raw = sessionStorage.getItem(LIST_CACHE_KEY);
        if (raw) {
          const obj = JSON.parse(raw);
          if (obj && Array.isArray(obj.data) && obj.data.length) {
            allRows = obj.data;
            renderList();
            return;
          }
        }
      } catch (e2) {}
      document.getElementById("pb-list").innerHTML =
        `<div class="pb-empty">Gagal memuat daftar. Coba muat ulang halaman.</div>`;
    }
  }

  return { init: loadData, reload: () => loadData({ force: true }) };
})();
