  import { getFirestore, collection, doc, getDoc, getDocs, getCountFromServer, addDoc, query, where, orderBy, limit, serverTimestamp }
    from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
  import { getApps } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";

  const app = getApps()[0];
  const db = getFirestore(app);

  const N_SOAL_PER_SESI = 15;
  const MIN_SOAL_BISA_DIUJI = 5;

  const LEVEL_TO_KOMPLEKSITAS = { dasar: "dasar", menengah: "menengah", atas: "menantang", mahir: "menantang" };
  const KOMPLEKSITAS_LABEL = { dasar: "Dasar", menengah: "Menengah", menantang: "Menantang" };
  const RANTAI_FALLBACK = {
    dasar: ["dasar"],
    menengah: ["menengah", "dasar"],
    menantang: ["menantang", "menengah", "dasar"],
  };

  let currentUser = null;
  let currentRole = "";
  let namaSiswa = "";
  let currentMapel = "";
  let currentTp = null;
  let currentSoal = [];
  let currentSoalKompleksitas = null;
  let levelSiswaInfo = null;
  let guruKompleksitasPilihan = "semua";
  let poolSoalTpCache = {};

  function escHtml(str) {
    return String(str).replace(/[&<>"']/g, (c) => ({ "&": "&", "<": "<", ">": ">", '"': """, "'": "&#39;" }[c]));
  }
  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function renderMapelGrid() {
    const wrap = document.getElementById("mapel-grid");
    const mapelList = window.URUTAN_MAPEL || [];
    wrap.innerHTML = "";
    mapelList.forEach((mapel) => {
      const jumlahTp = (window.TP_KKO_INDEX || []).filter((e) => e.mapel === mapel).length;
      const btn = document.createElement("button");
      btn.className = "mapel-btn";
      btn.innerHTML = `<div class="mb-title">${escHtml(mapel)}</div><div class="mb-count">${jumlahTp} TP</div>`;
      btn.onclick = () => pilihMapel(mapel);
      wrap.appendChild(btn);
    });
  }

  window.pilihMapel = async function (mapel) {
    currentMapel = mapel;
    document.getElementById("view-pilih-mapel").classList.add("hidden");
    const ws = document.getElementById("welcome-strip");
    if (ws) ws.classList.add("hidden");
    document.getElementById("view-pilih-tp").classList.remove("hidden");
    document.getElementById("tp-mapel-judul").textContent = mapel;
    renderLevelBanner();
    await renderTpGrid(mapel);
  };

  window.kembaliKePilihMapel = function () {
    document.getElementById("view-pilih-tp").classList.add("hidden");
    document.getElementById("view-pilih-mapel").classList.remove("hidden");
    const ws = document.getElementById("welcome-strip");
    if (ws) ws.classList.remove("hidden");
  };

  async function ambilLevelSiswa(nama) {
    try {
      const snap = await getDoc(doc(db, "level_siswa", nama));
      const level = snap.exists() && snap.data().level ? snap.data().level : "dasar";
      const target = LEVEL_TO_KOMPLEKSITAS[level] || "dasar";
      return { level, targetKompleksitas: target, chain: RANTAI_FALLBACK[target] };
    } catch (e) {
      return { level: "dasar", targetKompleksitas: "dasar", chain: RANTAI_FALLBACK.dasar };
    }
  }

  window.__setGuruKompleksitas = function (val) {
    guruKompleksitasPilihan = val;
    poolSoalTpCache = {};
    if (currentMapel && !document.getElementById("view-pilih-tp").classList.contains("hidden")) {
      renderLevelBanner();
      renderTpGrid(currentMapel);
    }
  };

  const LEVEL_LABEL = { dasar: "Dasar", menengah: "Menengah", atas: "Atas", mahir: "Mahir" };

  function renderLevelBanner() {
    const banner = document.getElementById("level-info-banner");
    const subtitle = document.getElementById("tp-subtitle");
    if (currentRole === "siswa" && levelSiswaInfo) {
      const labelLevel = LEVEL_LABEL[levelSiswaInfo.level] || levelSiswaInfo.level;
      banner.classList.remove("hidden");
      banner.innerHTML = `Level kemampuanmu saat ini: <strong>${labelLevel}</strong> — soal yang diujikan otomatis menyesuaikan levelmu.`;
      subtitle.textContent = "Pilih TP yang ingin kamu uji.";
    } else if (currentRole === "guru" && guruKompleksitasPilihan !== "semua") {
      banner.classList.remove("hidden");
      banner.innerHTML = `Mode guru — menampilkan soal tingkat <strong>${KOMPLEKSITAS_LABEL[guruKompleksitasPilihan]}</strong> untuk semua TP.`;
      subtitle.textContent = "Pilih TP yang ingin dicoba.";
    } else {
      banner.classList.add("hidden");
      banner.innerHTML = "";
      subtitle.textContent = "Pilih TP yang ingin kamu uji. Soal diambil acak dari pool setiap TP.";
    }
  }

  document.addEventListener("role-verified", async (e) => {
    currentUser = e.detail.user;
    document.getElementById("checking").remove();
    document.getElementById("app-soal").classList.remove("hidden");
    namaSiswa = e.detail.nama;
    currentRole = e.detail.role;
    if (currentRole === "siswa") {
      levelSiswaInfo = await ambilLevelSiswa(namaSiswa);
    } else if (currentRole === "guru") {
      document.getElementById("guru-filter-kompleksitas").classList.remove("hidden");
    }
    renderMapelGrid();
  });
  document.addEventListener("DOMContentLoaded", () => window.guardRolePage(['siswa','guru'], '../index.html'));
