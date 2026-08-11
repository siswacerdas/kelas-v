/**
 * laporan-guard.js — gerbang akses bersama untuk SEMUA halaman keluarga Laporan Siswa
 * (landing pages/laporan-siswa.html + 3 pintu di pages/laporan-siswa/*.html).
 *
 * Kenapa modul terpisah, bukan auth-guard.js/guru-guard.js yang sudah ada: halaman ini butuh
 * baca role+anak dari Firestore (auth-guard.js sengaja TIDAK melakukan itu — lihat komentar di
 * file itu), TAPI dipakai lebih dari 1 halaman (landing + mpls.html + 2 pintu lain) jadi wajar
 * diekstrak jadi modul sendiri (beda dari versi pertama fitur ini yang inline 1 file, waktu itu
 * cuma dipakai 1 halaman sehingga inline masih masuk akal).
 *
 * Kontrak dengan halaman pemanggil (lihat pages/laporan-siswa.html untuk contoh lengkap):
 *  - HARUS ada elemen #checking dan #app-laporan (class "ma-hidden" dibuka begitu siap)
 *  - BOLEH ada elemen #lap-blocked (ditampilkan kalau role === "siswa"; kalau elemen ini tidak
 *    ada di halaman, siswa tetap diarahkan otomatis balik ke beranda sebagai fallback aman)
 *  - Setelah lolos, event "laporan-context-ready" dikirim ke document dengan
 *    detail: { role, nama, anak } — role "guru" | "orangtua" (siswa sudah diblokir sebelum ini)
 *  - window.getFreshLaporanIdToken() tersedia untuk dipanggil endpoint Apps Script
 *
 * HARUS dimuat sebagai <script type="module" src="..."> (pakai import ES module).
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

const app  = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db   = getFirestore(app);

window.getFreshLaporanIdToken = async () => {
  if (!auth.currentUser) throw new Error("Sesi login tidak ditemukan — silakan login ulang.");
  return auth.currentUser.getIdToken();
};

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "../index.html";
    return;
  }
  const snap = await getDoc(doc(db, "users", user.uid));
  const data = snap.exists() ? snap.data() : {};
  const role = data.role || "siswa";

  document.getElementById("checking").remove();
  document.getElementById("app-laporan").classList.remove("ma-hidden");

  if (role === "siswa") {
    const blocked = document.getElementById("lap-blocked");
    if (blocked) {
      blocked.classList.remove("ma-hidden");
    } else {
      // Fallback aman kalau halaman lupa menyediakan elemen #lap-blocked — jangan biarkan
      // siswa tetap berdiri di halaman ini tanpa pesan apa pun.
      window.location.href = "../index.html";
    }
    return;
  }

  document.dispatchEvent(new CustomEvent("laporan-context-ready", {
    detail: { role, nama: data.nama || user.email, anak: data.anak || [] },
  }));
});
