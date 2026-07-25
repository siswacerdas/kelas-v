/**
 * guru-guard.js — Pelindung halaman khusus guru berbasis Firebase Auth.
 *
 * Dipakai di halaman-halaman sensitif (rekap MPLS, laporan cetak, data kelas)
 * supaya tidak bisa diakses langsung lewat URL oleh siapa pun yang belum
 * login sebagai guru. Beda dengan input.html (yang masih pakai kode akses
 * sederhana) — halaman-halaman ini dianggap lebih sensitif (data pribadi,
 * hasil penilaian, foto siswa) jadi memakai proteksi Firebase yang sebenarnya.
 *
 * Cara pakai di halaman lain:
 *   <script type="module" src="../../assets/js/guru-guard.js"></script>
 *   <script>
 *     document.addEventListener('guru-verified', async (e) => {
 *       // e.detail.nama, e.detail.user tersedia di sini — mulai render halaman.
 *       // Untuk memanggil endpoint Apps Script yang butuh idToken (?all=1,
 *       // ?siswa=1, ?allKognitif=1, ?allJurnal=1, ?foto=, POST type:"siswa"),
 *       // SELALU ambil token lewat: const idToken = await window.getFreshGuruIdToken();
 *       // — JANGAN baca window.guruIdToken langsung di kode baru (itu cuma cache
 *       // untuk kode lama yang tidak bisa async, mis. foto-fallback.js).
 *     });
 *     document.addEventListener('DOMContentLoaded', () => window.guardGuruPage('../../index.html'));
 *   </script>
 */
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey:            "AIzaSyBcpuD90Qk7z4Bdxkm5KhXrsKVzZWFc3_k",
  authDomain:        "kelas-v-2026.firebaseapp.com",
  projectId:         "kelas-v-2026",
  storageBucket:     "kelas-v-2026.firebasestorage.app",
  messagingSenderId: "918314271457",
  appId:             "1:918314271457:web:04df91f8cd856be49dada0"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

window.guardGuruPage = function (redirectPath) {
  let refreshTimer = null;

  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      window.guruIdToken = null;
      if (refreshTimer) clearInterval(refreshTimer);
      window.location.href = redirectPath;
      return;
    }
    try {
      const snap = await getDoc(doc(db, "users", user.uid));
      const data = snap.exists() ? snap.data() : {};
      if (data.role !== "guru") {
        alert("Halaman ini khusus untuk guru.");
        window.location.href = redirectPath;
        return;
      }
      window.guruIdToken = await user.getIdToken();
      document.dispatchEvent(new CustomEvent("guru-verified", {
        detail: { user, role: data.role, nama: data.nama || user.email },
      }));

      // v0.9.3: SEBELUMNYA di titik ini ada listener onIdTokenChanged() TERPISAH
      // yang tugasnya menjaga window.guruIdToken tetap segar. Itu ternyata BUG:
      // onIdTokenChanged dan onAuthStateChanged adalah dua listener independen —
      // di Firebase SDK sungguhan, onIdTokenChanged bisa saja terpanggil dengan
      // user:null sesaat (sebelum sesi tersimpan selesai dimuat ulang dari
      // penyimpanan lokal browser) SETELAH baris di atas sudah mengisi token
      // dengan benar, sehingga baris "window.guruIdToken = null" di listener itu
      // MENIMPA token yang baru saja benar — inilah yang menyebabkan endpoint
      // guru (?all=1 dkk.) mendadak menolak dengan pesan "Sesi login guru tidak
      // ditemukan" padahal guru sudah login dengan benar (dilaporkan pengguna,
      // dicatat lengkap di ANTIREGRESI.md §25).
      //
      // Perbaikannya: HAPUS listener kedua itu. Token cukup di-refresh berkala
      // lewat setInterval yang membaca auth.currentUser LANGSUNG (satu-satunya
      // sumber kebenaran dari SDK), bukan lewat listener kedua yang bisa
      // balapan dengan listener pertama.
      if (refreshTimer) clearInterval(refreshTimer);
      refreshTimer = setInterval(async () => {
        try {
          if (auth.currentUser) window.guruIdToken = await auth.currentUser.getIdToken();
        } catch (e) { /* diamkan, token lama masih dipakai sampai refresh berikutnya berhasil */ }
      }, 30 * 60 * 1000); // tiap 30 menit — token Firebase kedaluwarsa ~1 jam
    } catch (err) {
      alert("Gagal memverifikasi akun: " + err.message);
      window.location.href = redirectPath;
    }
  });
};

/**
 * v0.9.3: ambil ID Token TERBARU langsung dari SDK (auth.currentUser), BUKAN dari
 * cache window.guruIdToken. Dipakai di titik-titik kritis (memuat data dari Apps
 * Script) supaya tidak pernah bergantung pada cache yang mungkin belum/tidak
 * sempat ter-set — lebih andal daripada window.guruIdToken untuk kode BARU.
 * window.guruIdToken tetap dipertahankan (di-refresh fungsi ini juga) untuk
 * kode LAMA yang butuh akses sinkron (mis. foto-fallback.js yang membangun URL
 * <img src> tanpa bisa menunggu Promise).
 */
window.getFreshGuruIdToken = async function () {
  const user = auth.currentUser;
  if (!user) throw new Error("Sesi login guru tidak ditemukan — silakan login ulang.");
  const token = await user.getIdToken();
  window.guruIdToken = token;
  return token;
};
