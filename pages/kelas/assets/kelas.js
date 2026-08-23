/**
 * kelas.js — logika halaman pages/kelas/index.html
 * Bergantung pada MPLS_CONFIG dari ../mpls/assets/config.js (dimuat sebelum file ini),
 * karena backend Apps Script yang dipakai sama dengan modul MPLS (1 spreadsheet).
 */

/* ── ISI DROPDOWN NAMA DARI DAFTAR SISWA KELAS 5A ───────────────────
 * Memakai MPLS_STUDENTS yang sama dengan modul MPLS (mpls-data.js),
 * supaya nama di "Data Siswa" selalu konsisten dengan nama di penilaian MPLS.
 */
function isiDropdownNama() {
  const select = document.getElementById("f-nama");
  MPLS_STUDENTS.forEach((nama) => {
    const opt = document.createElement("option");
    opt.value = nama;
    opt.textContent = nama;
    select.appendChild(opt);
  });
}
isiDropdownNama();

const state = {
  siswaList: [],
  fotoResized: null, // { base64, mime } hasil resize, null kalau tidak ganti foto
};

/* ── RESIZE FOTO DI KLIEN ────────────────────────────────────────────
 * Supaya ukuran file relevan & optimal untuk dilihat di smartphone:
 * perkecil sisi terpanjang maksimal 1280px, kompres JPEG kualitas 0.75.
 */
function resizeImageFile(file, maxDim, quality) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();
    reader.onload = () => { img.src = reader.result; };
    reader.onerror = reject;
    img.onload = () => {
      let { width, height } = img;
      if (width > height && width > maxDim) {
        height = Math.round((height * maxDim) / width);
        width = maxDim;
      } else if (height > maxDim) {
        width = Math.round((width * maxDim) / height);
        height = maxDim;
      }
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      canvas.getContext("2d").drawImage(img, 0, 0, width, height);
      const dataUrl = canvas.toDataURL("image/jpeg", quality);
      resolve({ dataUrl, base64: dataUrl.split(",")[1], mime: "image/jpeg" });
    };
    img.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * v0.5.5 — Ambil response fetch dan urai sebagai JSON dengan aman.
 *
 * KENAPA PERLU INI: dilaporkan pengguna muncul error
 * `Unexpected token '<', "<!DOCTYPE "... is not valid JSON` setelah proses simpan terasa
 * lama. Ini terjadi karena Apps Script Web App (URL `?exec`) kadang mengembalikan HALAMAN
 * HTML generik dari infrastruktur Google — BUKAN JSON dari `Code.gs` — kalau eksekusi di
 * baliknya lambat (upload + set-sharing foto ke Drive bisa memakan beberapa detik lebih,
 * dan URL `/exec` diketahui kadang memotong/mengganti respons dengan halaman error kalau
 * dianggap terlalu lama, di luar kendali kode aplikasi ini). Kalau HTML ini langsung
 * dilempar ke `res.json()`, pesan errornya jadi membingungkan bagi pengguna awam. Fungsi ini
 * mendeteksi kondisi itu dan memberi pesan yang jelas & actionable sebagai gantinya.
 */
async function parseJsonAman_(res) {
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch (e) {
    if (/^\s*</.test(text)) {
      throw new Error(
        "Google Apps Script tidak merespons dengan benar (kemungkinan lambat/timeout saat " +
        "memproses, sering terjadi kalau upload foto). Data KEMUNGKINAN SUDAH tersimpan di " +
        "baliknya walau muncul error ini — cek dulu daftar siswa di bawah (akan otomatis " +
        "dimuat ulang) sebelum menyimpan ulang, supaya foto tidak ter-upload dobel ke Drive."
      );
    }
    throw new Error("Respons tidak dikenali dari server: " + text.slice(0, 150));
  }
}

function humanFileSize(base64) {
  const bytes = Math.round((base64.length * 3) / 4);
  if (bytes < 1024) return bytes + " B";
  return (bytes / 1024).toFixed(0) + " KB";
}

async function handleFotoFile(file) {
  if (!file) return;
  document.getElementById("form-status").textContent = "Memproses foto…";
  try {
    const resized = await resizeImageFile(file, 1280, 0.75);
    state.fotoResized = resized;
    document.getElementById("foto-preview").src = resized.dataUrl;
    document.getElementById("foto-preview-wrap").classList.remove("hidden");
    document.getElementById("foto-size-info").textContent = "≈ " + humanFileSize(resized.base64) + " setelah dikompres";
    document.getElementById("form-status").textContent = "";
  } catch (err) {
    document.getElementById("form-status").textContent = "Gagal memproses foto: " + err.message;
    document.getElementById("form-status").classList.add("err");
  }
}

// Tombol "Ambil Foto" -> buka kamera langsung (capture="environment")
document.getElementById("btn-ambil-foto").addEventListener("click", () => {
  document.getElementById("f-foto-kamera").click();
});
document.getElementById("f-foto-kamera").addEventListener("change", (e) => {
  handleFotoFile(e.target.files[0]);
});

// Tombol "Pilih dari Galeri" -> buka galeri/album foto (tanpa capture, jadi tidak memaksa kamera)
document.getElementById("btn-pilih-galeri").addEventListener("click", () => {
  document.getElementById("f-foto-galeri").click();
});
document.getElementById("f-foto-galeri").addEventListener("change", (e) => {
  handleFotoFile(e.target.files[0]);
});

/* ── FORM SIMPAN ─────────────────────────────────────────────────── */
function resetForm() {
  document.getElementById("form-siswa").reset();
  state.fotoResized = null;
  document.getElementById("foto-preview-wrap").classList.add("hidden");
  document.getElementById("foto-current-wrap").classList.add("hidden");
  document.getElementById("foto-current-frame").innerHTML = "";
  document.getElementById("form-status").textContent = "";
  document.getElementById("form-status").classList.remove("err");
}
document.getElementById("btn-reset-form").addEventListener("click", resetForm);

document.getElementById("form-siswa").addEventListener("submit", async (e) => {
  e.preventDefault();
  const nama = document.getElementById("f-nama").value.trim();
  if (!nama) return;

  const btn = document.getElementById("btn-simpan-siswa");
  btn.disabled = true;
  const statusEl = document.getElementById("form-status");
  statusEl.classList.remove("err");
  statusEl.textContent = state.fotoResized ? "Mengunggah foto & menyimpan…" : "Menyimpan…";

  const payload = {
    type: "siswa",
    "Nama Lengkap": nama,
    "Nama Panggilan": document.getElementById("f-panggilan").value.trim(),
    "Tempat Lahir": document.getElementById("f-tempat").value.trim(),
    "Tanggal Lahir": document.getElementById("f-tanggal").value,
    // v1.1 (migrasi Firestore): NISN sekarang WAJIB diisi (jadi ID dokumen
    // Firestore) — field ini "required" di HTML, jadi browser sudah menolak
    // submit kalau kosong sebelum sampai sini.
    "NISN": document.getElementById("f-nisn").value.trim(),
  };
  if (state.fotoResized) {
    payload.fotoBase64 = state.fotoResized.base64;
    payload.fotoMime = state.fotoResized.mime;
  }

  try {
    // v0.9.3: ambil token TERBARU langsung dari SDK (bukan cache window.guruIdToken
    // yang pernah kena race condition — lihat ANTIREGRESI.md §25), sekaligus di
    // dalam try supaya kalau gagal (sesi habis di tengah pengisian form), pesannya
    // tetap muncul rapi di statusEl, bukan error JS mentah yang tidak tertangani.
    payload.idToken = await window.getFreshGuruIdToken();
    const res = await fetch(MPLS_CONFIG.APPS_SCRIPT_URL, { method: "POST", body: JSON.stringify(payload) });
    const json = await parseJsonAman_(res);
    if (json.status !== "ok") throw new Error(json.message || "Gagal menyimpan");
    if (json.fotoWarning) {
      showToast("⚠️ " + json.fotoWarning, true);
    } else {
      showToast("Tersimpan: " + nama);
    }
    resetForm();
    loadSiswaList();
  } catch (err) {
    statusEl.textContent = "⚠️ Gagal menyimpan: " + err.message;
    statusEl.classList.add("err");
    // v0.5.5: muat ulang daftar siswa juga saat GAGAL (bukan cuma saat berhasil) — respons
    // error ini bisa saja muncul PADAHAL Apps Script sudah selesai menulis datanya di balik
    // layar (lihat penjelasan di parseJsonAman_). Refresh di sini membantu guru memastikan
    // status sebenarnya sebelum memutuskan menyimpan ulang.
    loadSiswaList();
  } finally {
    btn.disabled = false;
  }
});

function showToast(msg, isErr) {
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.classList.toggle("err", !!isErr);
  t.classList.add("show");
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => t.classList.remove("show"), isErr ? 6000 : 2600);
}

/* ── DAFTAR SISWA ────────────────────────────────────────────────── */
function fillFormFromSiswa(s) {
  document.getElementById("f-nama").value = s["Nama Lengkap"] || "";
  document.getElementById("f-panggilan").value = s["Nama Panggilan"] || "";
  document.getElementById("f-tempat").value = s["Tempat Lahir"] || "";
  document.getElementById("f-tanggal").value = s["Tanggal Lahir"] || "";
  document.getElementById("f-nisn").value = s["NISN"] || "";
  state.fotoResized = null;
  document.getElementById("foto-preview-wrap").classList.add("hidden");
  document.getElementById("f-foto-kamera").value = "";
  document.getElementById("f-foto-galeri").value = "";

  // v0.5.4: tampilkan status foto yang SUDAH tersimpan untuk siswa ini, supaya guru
  // tahu apakah perlu mengambil foto baru atau tidak — sebelumnya form tidak menunjukkan
  // apa-apa soal foto lama, jadi tidak kelihatan apakah upload sebelumnya benar berhasil.
  const currentWrap = document.getElementById("foto-current-wrap");
  const currentFrame = document.getElementById("foto-current-frame");
  currentFrame.innerHTML = s["URL Foto"]
    ? fotoImgHtml(s["URL Foto"], "Foto tersimpan " + (s["Nama Lengkap"] || ""), "", '<div class="ph-empty">Foto<br/>gagal dimuat</div>')
    : '<div class="ph-empty">Belum ada<br/>foto tersimpan</div>';
  currentWrap.classList.remove("hidden");

  window.scrollTo({ top: 0, behavior: "smooth" });
}

function renderSiswaList(filterText) {
  const wrap = document.getElementById("list-siswa");
  const filter = (filterText || "").trim().toLowerCase();
  const rows = state.siswaList.filter((s) => !filter || String(s["Nama Lengkap"]).toLowerCase().includes(filter));

  if (!rows.length) {
    wrap.innerHTML = '<div class="info-box">Belum ada data siswa tersimpan.</div>';
    return;
  }

  wrap.innerHTML = rows.map((s, idx) => `
    <div class="siswa-item" data-idx="${idx}">
      ${s["URL Foto"]
        ? fotoImgHtml(s["URL Foto"], "Foto " + (s["Nama Lengkap"] || ""), 'loading="lazy"', '<div class="siswa-noimg">🧒</div>')
        : `<div class="siswa-noimg">🧒</div>`}
      <div class="siswa-item-info">
        <div class="siswa-item-name">${s["Nama Lengkap"] || "—"}</div>
        <div class="siswa-item-meta">${s["Nama Panggilan"] ? "Panggilan: " + s["Nama Panggilan"] + " · " : ""}${s["Tempat Lahir"] || "-"}, ${s["Tanggal Lahir"] || "-"}</div>
        <div class="siswa-item-meta">${s["NISN"] ? "NISN: " + s["NISN"] : "—"}</div>
      </div>
    </div>`
  ).join("");

  wrap.querySelectorAll(".siswa-item").forEach((el) => {
    el.addEventListener("click", () => fillFormFromSiswa(rows[Number(el.dataset.idx)]));
  });
}

async function loadSiswaList() {
  document.getElementById("list-siswa").innerHTML = '<div class="info-box">Memuat data…</div>';
  try {
    // v0.7.0: endpoint ?siswa=1 kini digerbang server-side, wajib idToken guru.
    // v0.9.3: ambil token TERBARU langsung dari SDK (lihat ANTIREGRESI.md §25).
    const idToken = await window.getFreshGuruIdToken();
    const res = await fetch(MPLS_CONFIG.APPS_SCRIPT_URL + "?siswa=1&idToken=" + encodeURIComponent(idToken));
    const json = await parseJsonAman_(res);
    // PENTING (celah v0.7.0-v0.9.1, diperbaiki v0.9.2): sebelum ini, `json.data || []`
    // membuat SEMUA jenis error (idToken kedaluwarsa, bukan akun guru, dll.) diam-diam
    // jadi daftar kosong — guru melihat "Belum ada siswa" padahal datanya ADA, cuma
    // gagal diverifikasi aksesnya. Sekarang errornya ditampilkan apa adanya.
    if (json.status === "error") {
      throw new Error(json.message || "(tidak ada pesan error dari server)");
    }
    state.siswaList = (json.data || []).slice().sort((a, b) =>
      String(a["Nama Lengkap"] || "").localeCompare(String(b["Nama Lengkap"] || ""), "id", { sensitivity: "base" })
    );
    renderSiswaList("");
  } catch (err) {
    document.getElementById("list-siswa").innerHTML = '<div class="info-box" style="border-color:var(--danger)">Gagal memuat data: ' + err.message + '</div>';
  }
}

document.getElementById("search-siswa").addEventListener("input", (e) => renderSiswaList(e.target.value));

/* ── IMPOR NISN MASSAL ──────────────────────────────────────────────
 * Parsing baris demi baris, format "Nama Lengkap, NISN". Baris kosong/rusak
 * dilewati di klien tanpa menghentikan yang lain; validasi format NISN (10
 * digit) & pencocokan nama tetap dilakukan lagi di server (doPostSiswaNisnBulk_)
 * sebagai sumber kebenaran, hasil di sini cuma pratinjau cepat sebelum kirim.
 */
document.getElementById("btn-impor-nisn").addEventListener("click", async () => {
  const raw = document.getElementById("f-impor-nisn").value;
  const hasilEl = document.getElementById("impor-nisn-hasil");
  const rows = raw.split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const idx = line.indexOf(",");
      if (idx === -1) return null;
      return { nama: line.slice(0, idx).trim(), nisn: line.slice(idx + 1).trim() };
    })
    .filter(Boolean);

  if (!rows.length) {
    hasilEl.innerHTML = '<p class="warn-line">Tidak ada baris valid untuk diimpor — pastikan formatnya "Nama, NISN" per baris.</p>';
    return;
  }

  const btn = document.getElementById("btn-impor-nisn");
  btn.disabled = true;
  hasilEl.textContent = "Mengimpor " + rows.length + " baris…";

  try {
    const idToken = await window.getFreshGuruIdToken();
    const res = await fetch(MPLS_CONFIG.APPS_SCRIPT_URL, {
      method: "POST",
      body: JSON.stringify({ type: "siswa_nisn_bulk", idToken: idToken, rows: rows }),
    });
    const json = await parseJsonAman_(res);
    if (json.status !== "ok") throw new Error(json.message || "Gagal mengimpor");

    let html = '<p class="ok-line">✓ ' + json.diperbarui.length + ' dari ' + rows.length + ' baris berhasil diperbarui.</p>';
    if (json.diperbarui.length) {
      html += "<ul>" + json.diperbarui.map((n) => "<li>" + n + "</li>").join("") + "</ul>";
    }
    if (json.tidakDitemukan && json.tidakDitemukan.length) {
      html += '<p class="warn-line">⚠️ ' + json.tidakDitemukan.length + ' baris TIDAK berhasil (periksa manual):</p>';
      html += "<ul>" + json.tidakDitemukan.map((r) =>
        "<li>" + r.nama + " (" + r.nisn + ") — " + r.alasan + "</li>"
      ).join("") + "</ul>";
    }
    hasilEl.innerHTML = html;
    loadSiswaList();
  } catch (err) {
    hasilEl.innerHTML = '<p class="warn-line">⚠️ Gagal mengimpor: ' + err.message + "</p>";
  } finally {
    btn.disabled = false;
  }
});

/* ── INIT (setelah lolos guard guru) ────────────────────────────── */
document.addEventListener("guru-verified", () => {
  document.getElementById("checking").remove();
  loadSiswaList();
});
document.addEventListener("DOMContentLoaded", () => window.guardGuruPage("../../index.html"));
