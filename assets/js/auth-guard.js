/**
 * auth-guard.js — Pelindung halaman untuk siapa saja yang sudah login
 * (admin, guru, maupun siswa), berbasis Firebase Auth.
 *
 * Beda dengan guru-guard.js (khusus role "guru"), file ini TIDAK
 * mengecek role sama sekali — cukup login dengan akun yang valid,
 * apapun rolenya, halaman akan terbuka. Dipakai di halaman konten
 * bersama seperti Materi Ajar, Modul, Uji Kemampuan, CP/TP/ATP, Jadwal,
 * dan Pengumuman.
 *
 * Sengaja TIDAK membaca dokumen Firestore "users/{uid}" (beda dengan
 * guru-guard.js yang butuh field role). Tidak ada halaman yang
 * memakai data itu dari event ini, jadi round-trip Firestore itu
 * cuma menambah waktu tunggu "Memeriksa akses…" tanpa manfaat.
 * Kalau nanti ADA halaman yang butuh nama/role, ambil sendiri di
 * halaman itu setelah event user-verified, bukan di sini — supaya
 * guard ini tetap ringan untuk semua halaman lain.
 *
 * Cara pakai di halaman lain:
 *   <script type="module" src="../assets/js/auth-guard.js"></script>
 *   <script>
 *     document.addEventListener('user-verified', (e) => {
 *       // e.detail.user tersedia di sini — mulai render halaman
 *     });
 *     document.addEventListener('DOMContentLoaded', () => window.guardLoggedInPage('../index.html'));
 *   </script>
 */
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

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

window.guardLoggedInPage = function (redirectPath) {
  onAuthStateChanged(auth, (user) => {
    if (!user) {
      window.location.href = redirectPath;
      return;
    }
    document.dispatchEvent(new CustomEvent("user-verified", { detail: { user } }));
  });
};
