// Simulasi murni logika fetchDenganRetry_ — mock fetch() dikontrol per skenario.
/**
 * Test pure-logic untuk ANTIREGRESI.md §57 — logika `fetchDenganRetry_` di
 * belajar-mandiri.js (timeout 20 detik + 1x retry otomatis KHUSUS kegagalan teknis,
 * error valid dari server TIDAK diulang). Fungsi di sini adalah versi SEDERHANA yang
 * menerima fungsi percobaan sebagai parameter (bukan fetch() sungguhan) supaya bisa diuji
 * tanpa jaringan/DOM — logika inti (coba sekali, kalau exception baru retry SATU kali)
 * PERSIS sama dengan yang ada di belajar-mandiri.js.
 *
 * Jalankan: node scripts/test-retry-laporan-57.js
 */
async function fetchDenganRetry_(sekaliCobaFn) {
  async function sekaliCoba() {
    return await sekaliCobaFn();
  }
  try {
    return await sekaliCoba();
  } catch (err) {
    await new Promise((r) => setTimeout(r, 10)); // dipercepat untuk test (asli 800ms)
    return await sekaliCoba();
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
  // 1. Percobaan pertama gagal teknis (timeout), retry berhasil -> hasil dari retry
  let panggilanKe = 0;
  await assertEqual("Retry berhasil setelah 1x gagal teknis",
    fetchDenganRetry_(async () => {
      panggilanKe++;
      if (panggilanKe === 1) throw new Error("AbortError: timeout");
      return { status: "ok", data: [{ x: 1 }] };
    }),
    { status: "ok", data: [{ x: 1 }] });

  // 2. Percobaan pertama BERHASIL langsung (tanpa perlu retry) -> tidak boleh dipanggil 2x
  panggilanKe = 0;
  await assertEqual("Tidak retry kalau langsung berhasil",
    fetchDenganRetry_(async () => { panggilanKe++; return { status: "ok" }; }),
    { status: "ok" });
  await assertEqual("...dan cuma dipanggil 1x (bukti tidak retry sia-sia)", panggilanKe, 1);

  // 3. Error VALID dari server (status:"error") BUKAN kegagalan teknis -> fetchDenganRetry_
  //    tetap MENGEMBALIKAN objek itu apa adanya (bukan melempar), retry logic tidak
  //    dipicu SAMA SEKALI karena tidak ada exception yang dilempar sekaliCoba().
  panggilanKe = 0;
  await assertEqual("Error valid dari server dikembalikan apa adanya, TIDAK retry",
    fetchDenganRetry_(async () => { panggilanKe++; return { status: "error", message: "Akses ditolak" }; }),
    { status: "error", message: "Akses ditolak" });
  await assertEqual("...dan cuma dipanggil 1x (error valid tidak perlu diulang)", panggilanKe, 1);

  // 4. KEDUA percobaan gagal teknis -> akhirnya melempar error (retry sudah dipakai satu-satunya)
  panggilanKe = 0;
  await assertEqual("Kedua percobaan gagal teknis -> tetap gagal (sudah retry 1x)",
    fetchDenganRetry_(async () => { panggilanKe++; throw new Error("network error"); }),
    "THROW:network error");
  await assertEqual("...dan dipanggil TEPAT 2x (percobaan awal + 1x retry, tidak lebih)", panggilanKe, 2);

  console.log(pass + "/" + total + " lulus");
  process.exit(pass === total ? 0 : 1);
})();
