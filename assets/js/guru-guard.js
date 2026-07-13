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
 *     document.addEventListener('guru-verified', (e) => {
 *       // e.detail.nama, e.detail.user tersedia di sini — mulai render halaman
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
  onAuthStateChanged(auth, async (user) => {
    if (!user) {
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
      document.dispatchEvent(new CustomEvent("guru-verified", {
        detail: { user, role: data.role, nama: data.nama || user.email },
      }));
    } catch (err) {
      alert("Gagal memverifikasi akun: " + err.message);
      window.location.href = redirectPath;
    }
  });
};
