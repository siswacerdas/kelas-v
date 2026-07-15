/**
 * foto-fallback.js
 * Helper bersama untuk menampilkan foto siswa yang disimpan di Google Drive.
 *
 * KENAPA PERLU INI: tidak ada satu pun format URL publik Google Drive yang
 * 100% konsisten bisa dipakai langsung sebagai <img src> dari luar domain
 * Drive — perilakunya bisa beda-beda tergantung kondisi (kadang kena
 * halaman interstitial, kadang endpoint thumbnail dibatasi, dll). Solusinya:
 * siapkan beberapa format URL untuk 1 file yang sama, coba satu-satu secara
 * berurutan (pakai event onerror), dan baru tampilkan placeholder kalau
 * SEMUA format gagal.
 *
 * Dipakai oleh: pages/kelas/assets/kelas.js, pages/mpls/laporan.html,
 * pages/mpls/laporan-kognitif.html, pages/mpls/laporan-jurnal.html.
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
  return [
    "https://lh3.googleusercontent.com/d/" + id + "=w1000",
    "https://drive.google.com/thumbnail?id=" + id + "&sz=w1000",
    "https://drive.google.com/uc?export=view&id=" + id,
  ];
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
