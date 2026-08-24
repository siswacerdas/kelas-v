/**
 * role-guard.js — Pelindung halaman berbasis ROLE ("siswa"/"orangtua"/"guru"),
 * bukan sekadar "sudah login apa saja" (beda dari auth-guard.js).
 *
 * Dipakai di halaman-halaman INDUK (mis. materi.html, modul.html, jadwal.html)
 * yang aksesnya dibatasi per role sejak Fase "Pembatasan Akses" (lihat
 * RANCANGAN-LOGIN-BARU.md §7) — SENGAJA belum diterapkan ke ratusan file
 * konten individual di dalamnya (pages/materi/.../*.html,
 * pages/modul/.../*.html) supaya tidak menyentuh sistem konten yang sudah
 * stabil sekaligus dalam 1 sesi (lihat catatan di RANCANGAN-LOGIN-BARU.md §7
 * soal cakupan yang sengaja dibatasi ini).
 *
 * Menangani akun siswa (Firebase Anonymous Auth, TIDAK punya dokumen
 * Firestore users/{uid}) DAN akun guru/orangtua (email+password, role dari
 * Firestore) dalam 1 fungsi yang sama.
 *
 * Cara pakai di halaman lain:
 *   <script type="module" src="../assets/js/role-guard.js"></script>
 *   <script>
 *     document.addEventListener('role-verified', (e) => {
 *       // e.detail.user, e.detail.role, e.detail.nama tersedia di sini
 *     });
 *     document.addEventListener('DOMContentLoaded', () =>
 *       window.guardRolePage(['siswa', 'guru'], '../index.html'));
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

const KEY_NAMA_SISWA = "kelas5_siswa_nama";

/**
 * @param {string[]} rolesDiizinkan - role yang boleh membuka halaman ini,
 *   mis. ['siswa','guru'] atau ['guru'] saja.
 * @param {string} redirectPath - path relatif ke index.html untuk halaman
 *   ini kalau ditolak/belum login (sama seperti guardLoggedInPage/guardGuruPage).
 */
window.guardRolePage = function (rolesDiizinkan, redirectPath) {
  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      window.location.href = redirectPath;
      return;
    }

    if (user.isAnonymous) {
      // Akun siswa — tidak ada dokumen Firestore users/{uid} sama sekali,
      // nama tampilan datang dari sessionStorage (diisi index.html saat login).
      const namaSiswa = sessionStorage.getItem(KEY_NAMA_SISWA);
      if (!namaSiswa) {
        // Sesi anonim "nyasar" tanpa nama tersimpan — paksa keluar,
        // konsisten dengan penanganan yang sama di index.html.
        window.location.href = redirectPath;
        return;
      }
      if (rolesDiizinkan.indexOf("siswa") === -1) {
        alert("Halaman ini tidak tersedia untuk akun siswa.");
        window.location.href = redirectPath;
        return;
      }
      document.dispatchEvent(new CustomEvent("role-verified", {
        detail: { user, role: "siswa", nama: namaSiswa },
      }));
      return;
    }

    try {
      const snap = await getDoc(doc(db, "users", user.uid));
      const data = snap.exists() ? snap.data() : {};
      const role = data.role || "siswa";
      if (rolesDiizinkan.indexOf(role) === -1) {
        alert("Kamu tidak punya akses ke halaman ini.");
        window.location.href = redirectPath;
        return;
      }
      document.dispatchEvent(new CustomEvent("role-verified", {
        detail: { user, role, nama: data.nama || user.email },
      }));
    } catch (err) {
      alert("Gagal memverifikasi akun: " + err.message);
      window.location.href = redirectPath;
    }
  });
};
