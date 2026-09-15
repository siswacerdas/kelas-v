/**
 * Test pure-logic untuk ANTIREGRESI.md §60 — `postGamifikasiDenganRetry_` di admin.html
 * (retry 1x KHUSUS kegagalan teknis, pola SAMA PERSIS dengan `fetchDenganRetry_` di
 * belajar-mandiri.js §57, tapi dipakai SENGAJA HANYA untuk endpoint gamifikasi yang
 * idempoten — bukan untuk operasi upload yang tidak aman diulang otomatis).
 *
 * Jalankan: node scripts/test-retry-gamifikasi-admin-60.js
 */
async function postGamifikasiDenganRetry_(sekaliCobaFn) {
  async function sekaliCoba() {
    return await sekaliCobaFn();
  }
  try {
    return await sekaliCoba();
  } catch (err) {
    await new Promise((r) => setTimeout(r, 10)); // dipercepat untuk test (asli 800ms)
    try {
      return await sekaliCoba();
    } catch (err2) {
      throw new Error(
        "Gagal memuat/mengirim (sudah dicoba 2x) — ini pola ketidakstabilan proxy Google " +
        "yang dikenal, BUKAN berarti perhitungannya salah. Coba klik tombolnya sekali lagi " +
        "beberapa saat lagi."
      );
    }
  }
}

let pass = 0, total = 0;
async function assertEqual(nama, actualPromise, expected) {
  total++;
  let actual, errored = false, errMsg = "";
  try { actual = await actualPromise; } catch (e) { errored = true; errMsg = e.message; }
  const ok = errored ? (expected === "THROW:" + errMsg) : (JSON.stringify(actual) === JSON.stringify(expected));
  if (!ok) console.log("  actual:", errored ? "THROW:" + errMsg : JSON.stringify(actual), "expected:", JSON.stringify(expected));
  console.log((ok ? "PASS" : "FAIL") + " - " + nama);
  if (ok) pass++;
}

(async () => {
  // 1. Gagal teknis sekali (mis. pola 404 proxy), retry berhasil -> hasil dari retry
  let panggilanKe = 0;
  await assertEqual("Retry berhasil setelah 1x gagal teknis",
    postGamifikasiDenganRetry_(async () => {
      panggilanKe++;
      if (panggilanKe === 1) throw new SyntaxError("Unexpected token < in JSON"); // pola respons HTML 404, bukan JSON
      return { status: "ok", hasil: [{ nama: "Ani", status: "ok", exp: 120 }] };
    }),
    { status: "ok", hasil: [{ nama: "Ani", status: "ok", exp: 120 }] });

  // 2. Langsung berhasil -> tidak boleh dipanggil 2x (retry tidak dipakai sia-sia)
  panggilanKe = 0;
  await assertEqual("Tidak retry kalau langsung berhasil", 
    postGamifikasiDenganRetry_(async () => { panggilanKe++; return { status: "ok" }; }),
    { status: "ok" });
  await assertEqual("...dan cuma dipanggil 1x", panggilanKe, 1);

  // 3. Error VALID dari server (status:"error", mis. "namaList wajib diisi") BUKAN
  //    kegagalan teknis -> dikembalikan apa adanya, TIDAK diulang.
  panggilanKe = 0;
  await assertEqual("Error valid dari server dikembalikan apa adanya, TIDAK retry",
    postGamifikasiDenganRetry_(async () => { panggilanKe++; return { status: "error", message: "namaList wajib diisi" }; }),
    { status: "error", message: "namaList wajib diisi" });
  await assertEqual("...dan cuma dipanggil 1x", panggilanKe, 1);

  // 4. KEDUA percobaan gagal teknis -> pesan akhir yang JELAS (bukan pesan teknis mentah),
  //    supaya guru paham ini bukan berarti hitungannya salah.
  panggilanKe = 0;
  await assertEqual("Kedua percobaan gagal teknis -> pesan akhir jelas & tidak menyalahkan hitungan",
    postGamifikasiDenganRetry_(async () => { panggilanKe++; throw new Error("network error"); }),
    "THROW:Gagal memuat/mengirim (sudah dicoba 2x) — ini pola ketidakstabilan proxy Google yang dikenal, BUKAN berarti perhitungannya salah. Coba klik tombolnya sekali lagi beberapa saat lagi.");
  await assertEqual("...dan dipanggil TEPAT 2x (percobaan awal + 1x retry, tidak lebih)", panggilanKe, 2);

  console.log(pass + "/" + total + " lulus");
  process.exit(pass === total ? 0 : 1);
})();
