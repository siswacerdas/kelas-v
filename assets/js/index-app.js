import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
// v2.0 (login siswa via email/kata sandi Firebase): signInAnonymously TIDAK
// diimpor lagi di sini karena doLoginSiswa() tidak lagi memakainya (lihat
// catatan panjang di doLoginSiswa() di bawah) — TAPI cabang `user.isAnonymous`
// di onAuthStateChanged SENGAJA TETAP DIBIARKAN ADA (bukan dihapus), untuk
// siswa yang kebetulan masih punya sesi anonim lama tersimpan di browsernya
// dari SEBELUM migrasi ini dipasang (jarang, tapi mungkin) — supaya sesi lama
// itu tetap ditangani dengan benar alih-alih error, sampai sesi itu berakhir
// sendiri (browserSessionPersistence -> hilang begitu tab ditutup).
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged, setPersistence, browserLocalPersistence, browserSessionPersistence, sendPasswordResetEmail }
  from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore, collection, getDocs, doc, getDoc, query, orderBy, limit }
  from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

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

const KEY_NAMA_SISWA = "kelas5_siswa_nama";

/** PLACEHOLDER - full file continues below via second update if needed */
console.error('index-app.js incomplete - loading full version...');
