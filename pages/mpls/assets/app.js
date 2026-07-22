/**
 * app.js — logika halaman input.html
 * Bergantung pada mpls-data.js dan config.js (dimuat sebelum file ini).
 */

const state = {
  student: null,
  data: {}, // fieldName -> value
};

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  }[c]));
}
const escapeAttr = escapeHtml;

/* ── ACCESS GATE ─────────────────────────────────────────── */
function initGate() {
  const gate = document.getElementById("gate");
  if (!MPLS_CONFIG.ACCESS_CODE) {
    gate.classList.add("hidden");
    return;
  }
  if (sessionStorage.getItem("mpls_gate_ok") === "1") {
    gate.classList.add("hidden");
    return;
  }
  document.getElementById("btn-gate").addEventListener("click", checkGate);
  document.getElementById("inp-gate").addEventListener("keydown", (e) => {
    if (e.key === "Enter") checkGate();
  });
}
function checkGate() {
  const val = document.getElementById("inp-gate").value.trim();
  if (val && val === MPLS_CONFIG.ACCESS_CODE) {
    sessionStorage.setItem("mpls_gate_ok", "1");
    document.getElementById("gate").classList.add("hidden");
  } else {
    document.getElementById("gate-error").textContent = "Kode salah, coba lagi.";
  }
}

/* ── RENDER KATEGORI ─────────────────────────────────────── */
function indicatorRowHtml(item) {
  const pills = MPLS_SCALE.map(
    (s) => `<div class="pill" data-v="${s.v}"><span class="code">${s.code}</span><span class="num">${s.v}</span></div>`
  ).join("");
  return `
    <div class="indicator-row" data-field="${escapeAttr(item)}">
      <div class="indicator-label">${escapeHtml(item)}</div>
      <div class="scale-pills">${pills}</div>
    </div>`;
}
function selectFieldHtml(s) {
  const opts = s.options.map((o) => `<option value="${escapeAttr(o)}">${escapeHtml(o)}</option>`).join("");
  return `
    <div class="sub-field">
      <label>${escapeHtml(s.label)}</label>
      <select data-field="${escapeAttr(s.field)}"><option value="">— pilih —</option>${opts}</select>
    </div>`;
}
function textFieldHtml(t) {
  return `
    <div class="sub-field">
      <label>${escapeHtml(t.label)}</label>
      <input type="text" data-field="${escapeAttr(t.field)}" placeholder="${escapeAttr(t.placeholder || "")}" />
    </div>`;
}

function initCategories() {
  const wrap = document.getElementById("categories");
  MPLS_CATEGORIES.forEach((cat, idx) => {
    const card = document.createElement("div");
    card.className = "cat-card" + (idx === 0 ? " open" : "");
    card.style.setProperty("--cat-accent", cat.accent);
    card.dataset.key = cat.key;
    card.innerHTML = `
      <div class="cat-head" data-toggle>
        <div class="cat-icon">${cat.icon}</div>
        <div class="cat-titles">
          <div class="cat-title">${escapeHtml(cat.title)}</div>
          <div class="cat-subtitle">${escapeHtml(cat.subtitle)}</div>
        </div>
        <div class="cat-count" data-count>0/${cat.items.length}</div>
        <div class="chevron">▾</div>
      </div>
      <div class="cat-body">
        ${cat.items.map(indicatorRowHtml).join("")}
        ${(cat.selects || []).map(selectFieldHtml).join("")}
        ${cat.textField ? textFieldHtml(cat.textField) : ""}
        <div class="sub-field">
          <label>${escapeHtml(cat.noteLabel)}</label>
          <textarea data-field="${escapeAttr(cat.noteField)}" placeholder="${escapeAttr(cat.notePlaceholder || "")}"></textarea>
          ${cat.noteHint ? `<div class="note-hint">${escapeHtml(cat.noteHint)}</div>` : ""}
        </div>
      </div>`;
    wrap.appendChild(card);
  });

  wrap.querySelectorAll("[data-toggle]").forEach((head) => {
    head.addEventListener("click", () => head.closest(".cat-card").classList.toggle("open"));
  });

  wrap.querySelectorAll(".pill").forEach((pill) => {
    pill.addEventListener("click", () => {
      const row = pill.closest(".indicator-row");
      row.querySelectorAll(".pill").forEach((p) => p.classList.remove("sel"));
      pill.classList.add("sel");
      state.data[row.dataset.field] = Number(pill.dataset.v);
      updateProgress();
      updateCategoryCounts();
    });
  });

  wrap.querySelectorAll("select[data-field], input[data-field]").forEach((el) => {
    el.addEventListener("change", () => { state.data[el.dataset.field] = el.value; });
  });
  wrap.querySelectorAll("textarea[data-field]").forEach((el) => {
    el.addEventListener("input", () => { state.data[el.dataset.field] = el.value; });
  });
}

/* ── PROGRESS ────────────────────────────────────────────── */
function totalScaleFields() {
  return MPLS_CATEGORIES.reduce((s, c) => s + c.items.length, 0);
}
function updateProgress() {
  const total = totalScaleFields();
  let filled = 0;
  MPLS_CATEGORIES.forEach((cat) =>
    cat.items.forEach((item) => {
      if (state.data[item] !== undefined && state.data[item] !== "") filled++;
    })
  );
  document.getElementById("progress-fill").style.width = (total ? (filled / total) * 100 : 0) + "%";
  document.getElementById("progress-count").textContent = filled + "/" + total + " indikator terisi";
}
function updateCategoryCounts() {
  document.querySelectorAll(".cat-card").forEach((card) => {
    const cat = MPLS_CATEGORIES.find((c) => c.key === card.dataset.key);
    const filled = cat.items.filter((item) => state.data[item] !== undefined && state.data[item] !== "").length;
    card.querySelector("[data-count]").textContent = filled + "/" + cat.items.length;
  });
}

/* ── STUDENT PICKER ──────────────────────────────────────── */
function initStudentPicker() {
  const sel = document.getElementById("student-select");
  MPLS_STUDENTS.forEach((name, i) => {
    const opt = document.createElement("option");
    opt.value = name;
    opt.textContent = i + 1 + ". " + name;
    sel.appendChild(opt);
  });
  sel.addEventListener("change", onStudentChange);

  const guru = document.getElementById("inp-guru");
  MPLS_GURU_LIST.forEach((nama) => {
    const opt = document.createElement("option");
    opt.value = nama;
    opt.textContent = nama;
    guru.appendChild(opt);
  });
  guru.value = localStorage.getItem("mpls_guru_name") || "";
  guru.addEventListener("change", () => localStorage.setItem("mpls_guru_name", guru.value));
}

function resetForm() {
  state.data = {};
  document.querySelectorAll(".pill.sel").forEach((p) => p.classList.remove("sel"));
  document.querySelectorAll("select[data-field]").forEach((el) => (el.value = ""));
  document.querySelectorAll("input[data-field]").forEach((el) => (el.value = ""));
  document.querySelectorAll("textarea[data-field]").forEach((el) => (el.value = ""));
  updateProgress();
  updateCategoryCounts();
}

function applyExistingData(data) {
  Object.keys(data || {}).forEach((field) => {
    if (data[field] === "" || data[field] === undefined || data[field] === null) return;
    state.data[field] = data[field];
  });
  document.querySelectorAll(".indicator-row").forEach((row) => {
    const field = row.dataset.field;
    if (state.data[field] !== undefined && state.data[field] !== "") {
      const v = Number(state.data[field]);
      row.querySelectorAll(".pill").forEach((p) => p.classList.toggle("sel", Number(p.dataset.v) === v));
    }
  });
  document.querySelectorAll("select[data-field]").forEach((el) => {
    if (state.data[el.dataset.field] !== undefined) el.value = state.data[el.dataset.field];
  });
  document.querySelectorAll("input[data-field]").forEach((el) => {
    if (state.data[el.dataset.field] !== undefined) el.value = state.data[el.dataset.field];
  });
  document.querySelectorAll("textarea[data-field]").forEach((el) => {
    if (state.data[el.dataset.field] !== undefined) el.value = state.data[el.dataset.field];
  });
  updateProgress();
  updateCategoryCounts();
}

function isConfigured() {
  return MPLS_CONFIG.APPS_SCRIPT_URL && !MPLS_CONFIG.APPS_SCRIPT_URL.startsWith("GANTI_");
}

async function onStudentChange() {
  const name = document.getElementById("student-select").value;
  resetForm();
  if (!name) {
    document.getElementById("form-area").classList.add("hidden");
    document.getElementById("progress-wrap").classList.remove("show");
    return;
  }
  state.student = name;
  document.getElementById("form-area").classList.remove("hidden");
  document.getElementById("progress-wrap").classList.add("show");

  if (!isConfigured()) {
    setSaveStatus("⚠️ URL Apps Script belum diisi di assets/config.js — lihat apps-script/README.md");
    return;
  }

  setSaveStatus("Memuat data sebelumnya…");
  try {
    // v0.7.0: endpoint ?nama= kini digerbang server-side (kode akses MPLS).
    const res = await fetch(MPLS_CONFIG.APPS_SCRIPT_URL + "?nama=" + encodeURIComponent(name) + "&kode=" + encodeURIComponent(MPLS_CONFIG.ACCESS_CODE || ""));
    const json = await res.json();
    if (json && json.found) {
      applyExistingData(json.data);
      setSaveStatus("Data sebelumnya dimuat — silakan lanjutkan/perbarui.");
    } else {
      setSaveStatus("Siswa baru — belum ada data tersimpan untuk MPLS ini.");
    }
  } catch (err) {
    setSaveStatus("Gagal memuat data sebelumnya (koneksi?). Anda tetap bisa mengisi dari awal.");
  }
}

/* ── SAVE ────────────────────────────────────────────────── */
function setSaveStatus(msg) {
  document.getElementById("save-status").textContent = msg;
}
function showToast(msg, isErr) {
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.classList.toggle("err", !!isErr);
  t.classList.add("show");
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => t.classList.remove("show"), 2600);
}

async function saveData() {
  if (!state.student) return;
  if (!isConfigured()) {
    showToast("URL Apps Script belum dikonfigurasi", true);
    return;
  }
  const btn = document.getElementById("btn-save");
  btn.disabled = true;
  setSaveStatus("Menyimpan…");
  const payload = Object.assign({}, state.data, {
    // v0.7.0: endpoint ini kini digerbang server-side (kode akses MPLS).
    kode: MPLS_CONFIG.ACCESS_CODE || "",
    "Nama Siswa": state.student,
    "No": MPLS_STUDENTS.indexOf(state.student) + 1,
    "Diisi Oleh": document.getElementById("inp-guru").value || "",
  });
  try {
    const res = await fetch(MPLS_CONFIG.APPS_SCRIPT_URL, {
      method: "POST",
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (json && json.status === "ok") {
      showToast("Tersimpan: " + state.student);
      setSaveStatus("Tersimpan terakhir: " + new Date().toLocaleTimeString("id-ID"));
    } else {
      throw new Error((json && json.message) || "Gagal menyimpan");
    }
  } catch (err) {
    showToast("Gagal menyimpan — periksa koneksi", true);
    setSaveStatus("⚠️ Gagal menyimpan. Coba lagi.");
  } finally {
    btn.disabled = false;
  }
}

/* ── INIT ────────────────────────────────────────────────── */
document.addEventListener("DOMContentLoaded", () => {
  initGate();
  initCategories();
  initStudentPicker();
  updateProgress();
  document.getElementById("btn-save").addEventListener("click", saveData);
  if (!isConfigured()) {
    document.getElementById("config-warning").classList.remove("hidden");
  }
});
