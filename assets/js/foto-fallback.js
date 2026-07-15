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
  // Format 1: ...?id=XXXX / ...&id=XXXX — dipakai URL yang dibangun aplikasi ini sendiri.
  let m = str.match(/[?&]id=([a-zA-Z0-9_-]{10,})/);
  if (m) return m[1];
  // Format 2 (BARU sejak v0.5.4): .../file/d/XXXX/view?... — format link "Bagikan"/"Get link"
  // STANDAR Google Drive yang paling umum disalin manual oleh pengguna (mis. dari menu
  // klik-kanan "Get link" atau tombol "Bagikan"). Sebelumnya TIDAK dikenali sama sekali,
  // sehingga link seperti ini dipakai apa adanya sebagai <img src> (bukan gambar, gagal total).
  m = str.match(/\/d\/([a-zA-Z0-9_-]{10,})/);
  if (m) return m[1];
  // Format 3: kalau yang disimpan cuma ID mentah (bukan URL lengkap)
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

/** Dipanggil dari atribut onerror inline pada <img> yang dihasilkan fotoImgHtml().
 * PENTING (perbaikan v0.5.4): hanya mengganti elemen <img> itu sendiri, BUKAN
 * `img.parentElement.innerHTML` seperti sebelumnya. Versi lama diam-diam mengasumsikan
 * <img> selalu satu-satunya isi induknya (benar untuk kotak foto laporan cetak yang
 * memang dedicated, tapi SALAH untuk daftar siswa di kelas.js — di sana <img> adalah
 * sibling dari blok nama & keterangan siswa dalam kartu yang sama, sehingga
 * `parentElement.innerHTML = placeholder` ikut menghapus nama siswa itu juga begitu
 * SEMUA kandidat foto gagal dimuat). Mengganti hanya node <img> aman untuk kedua kasus. */
function fotoFallbackNext(img) {
  try {
    const candidates = JSON.parse(img.getAttribute("data-candidates") || "[]");
    const idx = parseInt(img.getAttribute("data-idx") || "0", 10) + 1;
    if (idx < candidates.length) {
      img.setAttribute("data-idx", String(idx));
      img.src = candidates[idx];
    } else {
      const placeholder = img.getAttribute("data-placeholder") || '<div class="ph-empty">Foto<br/>Siswa</div>';
      const temp = document.createElement("div");
      temp.innerHTML = placeholder;
      const replacement = temp.firstElementChild || temp;
      if (img.parentNode) img.parentNode.replaceChild(replacement, img);
    }
  } catch (e) {
    const temp = document.createElement("div");
    temp.innerHTML = '<div class="ph-empty">Foto<br/>Siswa</div>';
    if (img.parentNode) img.parentNode.replaceChild(temp.firstElementChild, img);
  }
}
