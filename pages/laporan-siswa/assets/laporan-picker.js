/**
 * laporan-picker.js — pemilih siswa bersama (Fase L-2)
 * Kontrak: #lap-picker di DOM; MPLS_CONFIG + getFreshLaporanIdToken siap.
 *   LaporanPicker.render(ctx, onSelect)
 */
window.LaporanPicker = (function () {
  const SISWA_CACHE_KEY = "lap_siswa_list_v1";
  const SISWA_CACHE_TTL = 5 * 60 * 1000; // 5 menit

  function esc(str) {
    return String(str || "").replace(/[&<>"']/g, (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
    );
  }

  function initial(nama) {
    const p = String(nama || "?").trim().split(/\s+/);
    if (!p.length) return "?";
    if (p.length === 1) return p[0].slice(0, 1).toUpperCase();
    return (p[0].slice(0, 1) + p[p.length - 1].slice(0, 1)).toUpperCase();
  }

  function bacaCacheSiswa_() {
    try {
      const raw = sessionStorage.getItem(SISWA_CACHE_KEY);
      if (!raw) return null;
      const obj = JSON.parse(raw);
      if (!obj || !Array.isArray(obj.data) || !obj.ts) return null;
      if (Date.now() - obj.ts > SISWA_CACHE_TTL) return null;
      return obj.data;
    } catch (e) {
      return null;
    }
  }

  function tulisCacheSiswa_(data) {
    try {
      sessionStorage.setItem(SISWA_CACHE_KEY, JSON.stringify({ ts: Date.now(), data: data || [] }));
    } catch (e) {}
  }

  async function fetchDaftarSiswa_() {
    const idToken = await window.getFreshLaporanIdToken();
    const base = MPLS_CONFIG.APPS_SCRIPT_URL;
    let lastErr = null;
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        // GET lama (idToken di query) — endpoint ?siswa=1 masih GET.
        // cache no-store + retry untuk proxy 404 sesaat.
        const res = await fetch(
          base + "?siswa=1&idToken=" + encodeURIComponent(idToken),
          { cache: "no-store" }
        );
        if (!res.ok) throw new Error("HTTP " + res.status);
        const json = await res.json();
        if (json.status === "error") throw new Error(json.message || "Gagal memuat daftar siswa");
        const names = (json.data || []).map((r) => r["Nama Lengkap"]).filter(Boolean).sort();
        tulisCacheSiswa_(names);
        return names;
      } catch (err) {
        lastErr = err;
        if (attempt < 2) await new Promise((r) => setTimeout(r, 500 * (attempt + 1)));
      }
    }
    // fallback cache kedaluwarsa
    try {
      const raw = sessionStorage.getItem(SISWA_CACHE_KEY);
      if (raw) {
        const obj = JSON.parse(raw);
        if (obj && Array.isArray(obj.data) && obj.data.length) return obj.data;
      }
    } catch (e) {}
    throw lastErr || new Error("Gagal memuat daftar siswa");
  }

  async function render(ctx, onSelect) {
    const wrap = document.getElementById("lap-picker");
    if (!wrap) return;
    wrap.innerHTML = "";

    if (ctx.role === "orangtua") {
      if (!ctx.anak.length) {
        wrap.innerHTML =
          '<div class="lap-picker-panel"><div class="lap-kosong">' +
          "Akun ini belum terhubung ke data siswa. Hubungi wali kelas.</div></div>";
        return;
      }
      if (ctx.anak.length === 1) {
        onSelect(ctx.anak[0]);
        return;
      }
      wrap.innerHTML =
        '<div class="lap-picker-panel">' +
          '<div class="lap-picker-label">Pilih anak</div>' +
          '<div class="lap-anak-chips">' +
          ctx.anak
            .map(
              (n) =>
                '<button type="button" class="lap-anak-chip" data-nama="' +
                esc(n) +
                '"><span class="lap-avatar">' +
                esc(initial(n)) +
                "</span>" +
                esc(n) +
                "</button>"
            )
            .join("") +
          "</div></div>";
      wrap.querySelectorAll(".lap-anak-chip").forEach((btn) => {
        btn.addEventListener("click", () => {
          wrap.querySelectorAll(".lap-anak-chip").forEach((b) => b.classList.remove("lap-active"));
          btn.classList.add("lap-active");
          onSelect(btn.dataset.nama);
        });
      });
      return;
    }

    // Guru
    wrap.innerHTML =
      '<div class="lap-picker-panel"><div class="lap-picker-label">Pilih siswa</div>' +
      '<div class="lap-kosong">Memuat daftar siswa…</div></div>';

    try {
      let semuaSiswa = bacaCacheSiswa_();
      if (semuaSiswa && semuaSiswa.length) {
        renderGuruPicker(wrap, semuaSiswa, onSelect);
        // revalidasi diam-diam
        fetchDaftarSiswa_()
          .then((names) => {
            if (names && names.length) renderGuruPicker(wrap, names, onSelect, true);
          })
          .catch(() => {});
        return;
      }
      semuaSiswa = await fetchDaftarSiswa_();
      renderGuruPicker(wrap, semuaSiswa, onSelect);
    } catch (err) {
      wrap.innerHTML =
        '<div class="lap-picker-panel"><div class="lap-kosong">Gagal memuat daftar siswa: ' +
        esc(err.message) +
        ' <button type="button" class="lap-retry-btn" id="lap-picker-retry">Coba lagi</button></div></div>';
      const rb = document.getElementById("lap-picker-retry");
      if (rb) rb.onclick = () => render(ctx, onSelect);
    }
  }

  function renderGuruPicker(wrap, semuaSiswa, onSelect, keepFilter) {
    const prev = keepFilter ? (document.getElementById("lap-cari") || {}).value || "" : "";
    wrap.innerHTML =
      '<div class="lap-picker-panel">' +
        '<div class="lap-picker-label">Pilih siswa</div>' +
        '<div class="lap-picker-meta" id="lap-picker-meta">' +
        semuaSiswa.length +
        " siswa terdaftar</div>" +
        '<div class="lap-search-wrap">' +
          '<span class="lap-search-ico" aria-hidden="true">🔍</span>' +
          '<input type="search" class="lap-search" id="lap-cari" placeholder="Cari nama siswa…" autocomplete="off" />' +
        "</div>" +
        '<div class="lap-list" id="lap-list" role="listbox"></div>' +
      "</div>";

    const listEl = document.getElementById("lap-list");
    const meta = document.getElementById("lap-picker-meta");
    let activeNama = null;

    function renderRows(filter) {
      const f = (filter || "").toLowerCase().trim();
      const filtered = f
        ? semuaSiswa.filter((n) => n.toLowerCase().includes(f))
        : semuaSiswa;
      if (meta) {
        meta.textContent = f
          ? filtered.length + " hasil untuk \u201c" + filter.trim() + "\u201d"
          : semuaSiswa.length + " siswa terdaftar";
      }
      if (!filtered.length) {
        listEl.innerHTML = '<div class="lap-kosong">Tidak ada siswa yang cocok.</div>';
        return;
      }
      let html = "";
      for (let i = 0; i < filtered.length; i++) {
        const n = filtered[i];
        const on = n === activeNama ? " lap-active" : "";
        html +=
          '<button type="button" class="lap-list-item' +
          on +
          '" data-nama="' +
          esc(n) +
          '" role="option">' +
          '<span class="lap-avatar">' +
          esc(initial(n)) +
          "</span><span>" +
          esc(n) +
          "</span></button>";
      }
      listEl.innerHTML = html;
    }

    listEl.addEventListener("click", (e) => {
      const btn = e.target.closest(".lap-list-item");
      if (!btn) return;
      activeNama = btn.getAttribute("data-nama");
      listEl.querySelectorAll(".lap-list-item").forEach((b) => {
        b.classList.toggle("lap-active", b.getAttribute("data-nama") === activeNama);
      });
      onSelect(activeNama);
    });

    const input = document.getElementById("lap-cari");
    input.addEventListener("input", (e) => renderRows(e.target.value));
    if (prev) {
      input.value = prev;
      renderRows(prev);
    } else {
      renderRows("");
    }
    // Fokus search di desktop agar cepat ketik
    if (window.matchMedia && window.matchMedia("(min-width: 700px)").matches) {
      try { input.focus({ preventScroll: true }); } catch (e) { input.focus(); }
    }
  }

  return { render: render };
})();
