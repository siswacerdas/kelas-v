/**
 * foto-fallback.js
 * Helper bersama untuk menampilkan foto siswa yang disimpan di Google Drive.
 *
 * SEJARAH SINGKAT (lihat CHANGELOG untuk detail lengkap):
 * - v0.5.2: dicoba 3 format URL hotlink Drive langsung (lh3.googleusercontent.com,
 *   thumbnail?id=, uc?export=view), coba satu-satu lewat onerror. Diuji dengan
 *   Playwright network mocking (bukan Drive sungguhan) dan LULUS — tapi di Drive
 *   sungguhan tetap GAGAL semua, karena akar masalahnya bukan salah format URL,
 *   tapi ketiganya sama-sama mengandalkan HOTLINK ANONIM ke domain Google, yang
 *   Google batasi/blokir secara tidak konsisten untuk pengunjung tanpa sesi login,
 *   terlepas dari file sudah "Anyone with the link" atau belum.
 * - v0.5.3 (SEKARANG): kandidat #1 diganti jadi proxy lewat Apps Script sendiri
 *   (endpoint `?foto=<id>`, lihat serveFotoBinary_() di apps-script/Code.gs) —
 *   Apps Script membaca & mengirim byte file sebagai PEMILIK yang sah, bukan
 *   sebagai pengunjung anonim, jadi tidak kena pembatasan hotlink itu sama sekali.
 *   3 format lama TETAP disimpan sebagai kandidat cadangan (kalau proxy Apps
 *   Script sedang error/timeout), baru placeholder kalau SEMUA kandidat gagal.
 *
 * Dipakai oleh: pages/kelas/assets/kelas.js, pages/mpls/laporan.html,
 * pages/mpls/laporan-kognitif.html, pages/mpls/laporan-jurnal.html.
 *
 * SYARAT kandidat #1 (proxy): variabel global `MPLS_CONFIG.APPS_SCRIPT_URL` harus
 * sudah didefinisikan SEBELUM fotoImgHtml()/buildFotoCandidates() dipanggil (bukan
 * sebelum file ini di-load — pemanggilan fotoImgHtml selalu terjadi belakangan,
 * setelah data di-fetch, jadi urutan <script> tetap aman meski config.js dimuat
 * SESUDAH foto-fallback.js). Kalau MPLS_CONFIG tidak ada/URL kosong (mis. dipakai
 * di halaman yang tidak memuat config.js), kandidat proxy dilewati otomatis —
 * TIDAK menyebabkan error.
 */

/** Ambil ID file Google Drive dari URL apa pun yang mengandung "id=..." atau dari ID mentah. */
function extractDriveFileId(urlOrId) {
  if (!urlOrId) return null;
  const str = String(urlOrId).trim();
  const m = str.match(/[?&]id=([a-zA-Z0-9_-]{10,})/);
  if (m) return m[1];
  // Kalau yang disimpan cuma ID mentah (bukan URL lengkap)
  if (/^[a-zA-Z0-9_-]{10,}$/.test(str)) return str;
  return null;
}

/** Susun beberapa kandidat URL untuk 1 file ID, urut dari yang paling reliable. */
function buildFotoCandidates(urlOrId) {
  const id = extractDriveFileId(urlOrId);
  if (!id) return urlOrId ? [urlOrId] : [];

  const candidates = [];

  // Kandidat #1 (PALING ANDAL, sejak v0.5.3): proxy byte gambar lewat Apps Script
  // sendiri — lihat penjelasan lengkap di komentar atas file ini & di CHANGELOG.
  if (typeof MPLS_CONFIG !== "undefined" && MPLS_CONFIG && MPLS_CONFIG.APPS_SCRIPT_URL) {
    candidates.push(MPLS_CONFIG.APPS_SCRIPT_URL + "?foto=" + encodeURIComponent(id));
  }

  // Kandidat cadangan (peninggalan v0.5.2) — hotlink langsung ke domain Google.
  // Dipertahankan sebagai jaring pengaman kalau Web App Apps Script sedang
  // berhenti/timeout/kuota habis, BUKAN sebagai andalan utama lagi.
  candidates.push(
    "https://lh3.googleusercontent.com/d/" + id + "=w1000",
    "https://drive.google.com/thumbnail?id=" + id + "&sz=w1000",
    "https://drive.google.com/uc?export=view&id=" + id
  );

  return candidates;
}

/**
 * Bangun HTML <img> lengkap dengan fallback berantai. Kalau semua kandidat
 * gagal dimuat, elemen otomatis diganti dengan placeholderHtml.
 */
function fotoImgHtml(urlOrId, altText, extraAttrs, placeholderHtml) {
  const candidates = buildFotoCandidates(urlOrId);
  const placeholder = placeholderHtml || '<div class="ph-empty">Foto<br/>Siswa</div>';
  if (!candidates.length) return placeholder;
  const candidatesJson = JSON.stringify(candidates).replace(/"/g, "&quot;");
  const placeholderAttr = placeholder.replace(/"/g, "&quot;");
  return (
    '<img src="' + candidates[0] + '" alt="' + (altText || "Foto") + '" ' +
    (extraAttrs || "") + ' ' +
    "data-candidates=\"" + candidatesJson + "\" data-idx=\"0\" " +
    "data-placeholder=\"" + placeholderAttr + "\" " +
    'onerror="fotoFallbackNext(this)" />'
  );
}

/** Dipanggil dari atribut onerror inline pada <img> yang dihasilkan fotoImgHtml(). */
function fotoFallbackNext(img) {
  try {
    const candidates = JSON.parse(img.getAttribute("data-candidates") || "[]");
    const idx = parseInt(img.getAttribute("data-idx") || "0", 10) + 1;
    if (idx < candidates.length) {
      img.setAttribute("data-idx", String(idx));
      img.src = candidates[idx];
    } else {
      const placeholder = img.getAttribute("data-placeholder") || '<div class="ph-empty">Foto<br/>Siswa</div>';
      if (img.parentElement) img.parentElement.innerHTML = placeholder;
    }
  } catch (e) {
    if (img.parentElement) img.parentElement.innerHTML = '<div class="ph-empty">Foto<br/>Siswa</div>';
  }
}
