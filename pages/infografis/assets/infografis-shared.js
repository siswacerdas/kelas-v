/**
 * infografis-shared.js — helper gambar bersama untuk SEMUA halaman Galeri Visual
 * (galeri.html, kelola-tp.html). Dipakai ulang, BUKAN diduplikasi per halaman — sebelum file
 * ini ada, galeri.html dan kelola-tp.html masing-masing punya versi sendiri, dan versi
 * kelola-tp.html-nya TIDAK punya rantai fallback (cuma 1 kandidat: proxy Apps Script),
 * beda dari galeri.html yang punya 3 kandidat dengan onerror berantai. Itu sebabnya kalau
 * proxy gagal untuk 1 file tertentu, thumbnail di kelola-tp.html langsung jadi placeholder
 * (tanpa coba kandidat lain), sedangkan grid di galeri.html masih sempat "ketolong" oleh
 * kandidat cadangan. Sekarang SATU logika dipakai di semua tempat, termasuk LIGHTBOX (lihat
 * makeFallbackImg() — sebelumnya lightbox cuma pakai src=kandidat[0] TANPA onerror sama
 * sekali, jadi begitu proxy gagal, lightbox-nya kosong walau thumbnail grid di sebelahnya
 * berhasil tampil lewat kandidat cadangan).
 *
 * Bergantung pada extractDriveFileId() dari assets/js/foto-fallback.js (harus dimuat SEBELUM
 * file ini) dan window.MPLS_CONFIG (config.js, boleh dimuat sebelum ATAU sesudah file ini —
 * baru dipakai saat fungsi di bawah benar-benar dipanggil).
 */

/** Susun kandidat URL gambar, urut dari paling andal: (1) proxy Apps Script sendiri — lihat
 * serveInfografisBinary_() di apps-script/Code.gs, tidak butuh sharing publik sama sekali;
 * (2)-(3) hotlink Drive langsung sebagai cadangan kalau proxy sedang bermasalah (butuh file
 * di-share "siapa saja yang punya link", atau si pengunjung sedang login sebagai pemilik
 * file itu sendiri di Google — makanya kandidat ini TIDAK bisa diandalkan sendirian untuk
 * pengunjung anonim, cuma cadangan). */
function buildInfografisImgCandidates(urlOrId) {
  const id = extractDriveFileId(urlOrId);
  if (!id) return urlOrId ? [urlOrId] : [];
  const candidates = [];
  if (typeof MPLS_CONFIG !== "undefined" && MPLS_CONFIG && MPLS_CONFIG.APPS_SCRIPT_URL) {
    candidates.push(MPLS_CONFIG.APPS_SCRIPT_URL + "?infografisFoto=" + encodeURIComponent(id));
  }
  candidates.push(
    "https://lh3.googleusercontent.com/d/" + id + "=w1000",
    "https://drive.google.com/thumbnail?id=" + id + "&sz=w1000"
  );
  return candidates;
}

/** Pasang rantai fallback ke SEBUAH elemen <img> yang SUDAH ADA di DOM (dipakai untuk
 * lightbox — elemen tetap, dipakai ulang tiap kali dibuka, beda dari thumbnail grid yang
 * dibuat lewat innerHTML). placeholderFn dipanggil kalau SEMUA kandidat gagal (opsional). */
function attachInfografisImgFallback(imgEl, urlOrId, placeholderFn) {
  const candidates = buildInfografisImgCandidates(urlOrId);
  let idx = 0;
  imgEl.onerror = function () {
    idx += 1;
    if (idx < candidates.length) {
      imgEl.src = candidates[idx];
    } else {
      imgEl.onerror = null; // hentikan, jangan infinite loop kalau kandidat terakhir juga gagal
      if (typeof placeholderFn === "function") placeholderFn();
    }
  };
  imgEl.src = candidates[0] || "";
}

/** Versi HTML-string dari rantai fallback yang sama, dipakai untuk elemen yang dibuat lewat
 * innerHTML (thumbnail grid & kartu materi). placeholderHtml dipakai kalau elemen <img> perlu
 * diganti total (bukan cuma ganti src) saat SEMUA kandidat gagal. */
function igImgHtml(urlOrId, altText, extraAttrs, className, placeholderClass, placeholderEmoji) {
  const candidates = buildInfografisImgCandidates(urlOrId);
  if (!candidates.length) return "";
  const candidatesJson = JSON.stringify(candidates).replace(/"/g, "&quot;");
  const cls = className || "ig-thumb";
  const pClass = placeholderClass || "ig-thumb-video";
  const pEmoji = placeholderEmoji || "🖼️";
  return (
    '<img class="' + cls + '" src="' + candidates[0] + '" alt="' + (altText || "") + '" ' +
    (extraAttrs || "") + ' data-candidates="' + candidatesJson + '" data-idx="0" ' +
    'data-placeholder-class="' + pClass + '" data-placeholder-emoji="' + pEmoji + '" ' +
    'onerror="igImgFallbackNext(this)" />'
  );
}

function igImgFallbackNext(img) {
  try {
    const candidates = JSON.parse(img.getAttribute("data-candidates") || "[]");
    const idx = parseInt(img.getAttribute("data-idx") || "0", 10) + 1;
    if (idx < candidates.length) {
      img.setAttribute("data-idx", String(idx));
      img.src = candidates[idx];
    } else {
      img.replaceWith(Object.assign(document.createElement("div"), {
        className: img.getAttribute("data-placeholder-class") || "ig-thumb-video",
        textContent: img.getAttribute("data-placeholder-emoji") || "🖼️",
      }));
    }
  } catch (e) { /* diamkan — thumbnail tetap tampil apa adanya kalau gagal parse */ }
}
