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
    const filtered =
      activeSlug === "semua"
        ? allRows
        : allRows.filter((r) => {
            const m = findMapel(r["Mapel"]);
            return m && m.mapelSlug === activeSlug;
          });

    if (filtered.length === 0) {
      listEl.innerHTML = `<div class="pb-empty">Belum ada file untuk kategori ini.</div>`;
      return;
    }

    // Terbaru di atas — Timestamp ditulis server saat baris ditambahkan (lihat doPostPustakaBelajar_).
    const sorted = filtered.slice().sort((a, b) => {
      return new Date(b["Timestamp"] || 0) - new Date(a["Timestamp"] || 0);
    });

    listEl.innerHTML = `<div class="pb-grid">${sorted
      .map((r) => {
        const m = findMapel(r["Mapel"]) || { mapelSlug: "", mapelIcon: "📄" };
        const halaman = r["Jumlah Halaman"] ? `${r["Jumlah Halaman"]} halaman` : "";
        const tanggal = formatTanggal(r["Timestamp"]);
        return `
        <a class="pb-card ${slugClass(m.mapelSlug)}" href="pustaka-belajar/baca.html?id=${encodeURIComponent(r["ID"])}">
          <div class="pb-card-top">
            <span class="pb-card-icon">${m.mapelIcon}</span>
            <span class="pb-card-badge">${r["Mapel"] || ""}</span>
          </div>
          <div class="pb-card-title">${escapeHtml_(r["Judul"] || "(Tanpa judul)")}</div>
          ${r["Deskripsi"] ? `<div class="pb-card-desc">${escapeHtml_(r["Deskripsi"])}</div>` : ""}
          <div class="pb-card-meta">
            ${halaman ? `<span>${halaman}</span>` : ""}
            ${tanggal ? `<span>${tanggal}</span>` : ""}
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

  async function loadData() {
    renderChips();
    if (typeof MPLS_CONFIG === "undefined" || !MPLS_CONFIG.APPS_SCRIPT_URL) {
      document.getElementById("pb-list").innerHTML =
        `<div class="pb-empty">Fitur ini belum siap dikonfigurasi.</div>`;
      return;
    }
    try {
      const res = await fetch(MPLS_CONFIG.APPS_SCRIPT_URL + "?pustakaBelajar=1", { cache: "no-store" });
      const json = await res.json();
      if (json.status === "error") throw new Error(json.message || "Gagal memuat");
      allRows = json.data || [];
      renderList();
    } catch (err) {
      document.getElementById("pb-list").innerHTML =
        `<div class="pb-empty">Gagal memuat daftar. Coba muat ulang halaman.</div>`;
    }
  }

  return { init: loadData };
})();
