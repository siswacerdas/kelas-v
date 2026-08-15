/**
 * laporan-picker.js — komponen pemilih siswa BERSAMA untuk semua pintu Laporan Siswa.
 * Diekstrak dari laporan.js (awalnya cuma dipakai Pintu 1/MPLS) karena Pintu 2 (Perkembangan
 * Belajar Mandiri) butuh UI pemilih yang SAMA PERSIS — daripada duplikasi ~50 baris,
 * sekarang 1 sumber dipakai bersama (dan nanti Pintu 3/Latihan Mandiri Siswa tinggal pakai
 * ulang juga begitu aktif).
 *
 * Kontrak pemakaian (lihat pages/laporan-siswa/mpls.html atau belajar-mandiri.html sebagai
 * contoh): halaman HARUS punya elemen `#lap-picker` di DOM, dan MEMUAT file ini SETELAH
 * MPLS_CONFIG (config.js) & window.getFreshLaporanIdToken() (laporan-guard.js) tersedia.
 *
 *   window.LaporanPicker.render(ctx, onSelect)
 *   - ctx: { role, nama, anak } dari event "laporan-context-ready"
 *   - onSelect(namaSiswaTerpilih): dipanggil begitu guru/orang tua memilih 1 nama
 *
 * TIDAK menyimpan state pilihan (mis. "sedang aktif" chip) — itu tanggung jawab halaman
 * pemanggil lewat callback onSelect, supaya komponen ini tetap sederhana & bisa dipakai
 * ulang untuk kebutuhan berbeda-beda di tiap pintu.
 */
window.LaporanPicker = (function () {
  function esc(str) {
    return String(str || "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }

  async function render(ctx, onSelect) {
    const wrap = document.getElementById("lap-picker");
    wrap.innerHTML = "";

    if (ctx.role === "orangtua") {
      if (!ctx.anak.length) {
        wrap.innerHTML = '<div class="ma-empty">Akun ini belum terhubung ke data siswa mana pun. Hubungi wali kelas untuk melengkapi data ini.</div>';
        return;
      }
      if (ctx.anak.length === 1) {
        onSelect(ctx.anak[0]);
        return;
      }
      wrap.innerHTML = '<div class="lap-anak-chips">' +
        ctx.anak.map((n) => `<button type="button" class="lap-anak-chip" data-nama="${esc(n)}">${esc(n)}</button>`).join("") +
        "</div>";
      wrap.querySelectorAll(".lap-anak-chip").forEach((btn) => {
        btn.addEventListener("click", () => {
          wrap.querySelectorAll(".lap-anak-chip").forEach((b) => b.classList.remove("lap-active"));
          btn.classList.add("lap-active");
          onSelect(btn.dataset.nama);
        });
      });
      return;
    }

    // role === "guru" — cari/pilih siapa saja dari daftar siswa
    wrap.innerHTML = '<div class="ma-empty">Memuat daftar siswa…</div>';
    try {
      const idToken = await window.getFreshLaporanIdToken();
      const res = await fetch(MPLS_CONFIG.APPS_SCRIPT_URL + "?siswa=1&idToken=" + encodeURIComponent(idToken));
      const json = await res.json();
      if (json.status === "error") throw new Error(json.message || "Gagal memuat daftar siswa");
      const semuaSiswa = (json.data || []).map((r) => r["Nama Lengkap"]).filter(Boolean).sort();
      renderGuruPicker(wrap, semuaSiswa, onSelect);
    } catch (err) {
      wrap.innerHTML = '<div class="ma-empty">Gagal memuat daftar siswa: ' + esc(err.message) + "</div>";
    }
  }

  function renderGuruPicker(wrap, semuaSiswa, onSelect) {
    wrap.innerHTML = `
      <input type="text" class="lap-search" id="lap-cari" placeholder="Cari nama siswa…" />
      <div class="lap-list" id="lap-list"></div>`;
    const listEl = document.getElementById("lap-list");
    function renderRows(filter) {
      const f = (filter || "").toLowerCase();
      const filtered = semuaSiswa.filter((n) => n.toLowerCase().includes(f));
      if (!filtered.length) {
        listEl.innerHTML = '<div class="lap-kosong">Tidak ada siswa yang cocok.</div>';
        return;
      }
      listEl.innerHTML = filtered.map((n) => `<button type="button" class="lap-list-item" data-nama="${esc(n)}">${esc(n)}</button>`).join("");
      listEl.querySelectorAll(".lap-list-item").forEach((btn) => {
        btn.addEventListener("click", () => onSelect(btn.dataset.nama));
      });
    }
    renderRows("");
    document.getElementById("lap-cari").addEventListener("input", (e) => renderRows(e.target.value));
  }

  return { render: render };
})();
