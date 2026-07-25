/**
 * auth-guard.js — Pelindung halaman untuk siapa saja yang sudah login
 * (admin, guru, maupun siswa), berbasis Firebase Auth.
 *
 * Beda dengan guru-guard.js (khusus role "guru"), file ini TIDAK
 * mengecek role sama sekali — cukup login dengan akun yang valid,
 * apapun rolenya, halaman akan terbuka. Dipakai di halaman konten
 * bersama seperti Materi Ajar, Modul, Bank Soal, CP/TP/ATP, Jadwal,
 * dan Pengumuman.
 *
 * Konfigurasi Firebase disalin dari guru-guard.js / index.html supaya
 * memakai proyek Firebase yang sama persis (bukan bikin app baru).
 *
 * Cara pakai di halaman lain:
 *   <script type="module" src="../assets/js/auth-guard.js"></script>
 *   <script>
 *     document.addEventListener('user-verified', (e) => {
 *       // e.detail.nama, e.detail.role, e.detail.user tersedia di sini
 *     });
 *     document.addEventListener('DOMContentLoaded', () => window.guardLoggedInPage('../index.html'));
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

window.guardLoggedInPage = function (redirectPath) {
  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      window.location.href = redirectPath;
      return;
    }
    try {
      const snap = await getDoc(doc(db, "users", user.uid));
      const data = snap.exists() ? snap.data() : {};
      document.dispatchEvent(new CustomEvent("user-verified", {
        detail: { user, role: data.role || "siswa", nama: data.nama || user.email },
      }));
    } catch (err) {
      alert("Gagal memverifikasi akun: " + err.message);
      window.location.href = redirectPath;
    }
  });
};
