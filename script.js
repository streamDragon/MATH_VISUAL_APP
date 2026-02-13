/* script.js - גרפים/משיקים/מטרות/יומן - גרסה נקייה ומתוקנת */

"use strict";

// -------------------- Globals --------------------
let cvs, ctx, mainArea;
let W = 0, H = 0;

let baseScale = 40;
let scale = 40;

let ox = 0, oy = 0;     // origin (screen)
let px = -1;            // draggable x

let cf = [0, 1, 0, 0];  // [a,b,c,d]
let currentQ = 0;
let isDrag = false;

// audio
let audioCtx = null;
let isMuted = false;

// targets
let solvedTargets = [];     // indices hit NOW (dynamic)
let successShown = false;

// -------------------- Boot --------------------
window.addEventListener("load", () => {
  cvs = document.getElementById("cvs");
  if (!cvs) return console.error("Missing canvas #cvs");
  ctx = cvs.getContext("2d");

  mainArea = document.getElementById("mainArea") || cvs.parentElement;

  window.addEventListener("resize", resize);
  resize();

  setupEvents();
  initMenu();
  loadQ(0);

  const btn = document.getElementById("btnSound");
  if (btn) btn.innerText = isMuted ? "🔇" : "🔊";

  // אם אין אנימציה רציפה - לא צריך requestAnimationFrame
  // draw() נקרא בכל שינוי
});

// -------------------- Resize --------------------
function resize() {
  const w = mainArea ? mainArea.clientWidth : window.innerWidth;
  const h = mainArea ? mainArea.clientHeight : window.innerHeight;

  W = cvs.width = Math.max(200, w);
  H = cvs.height = Math.max(200, h);

  ox = W / 2;
  oy = H / 2 + 50;

  draw();
}

// -------------------- Events (mouse/touch) --------------------
function setupEvents() {
  const start = (e) => {
    isDrag = true;
    initAudio();
    handleInput(e);
  };
  const move = (e) => {
    if (!isDrag) return;
    handleInput(e);
  };
  const end = () => {
    isDrag = false;
  };

  cvs.addEventListener("mousedown", start);
  window.addEventListener("mousemove", move);
  window.addEventListener("mouseup", end);

  cvs.addEventListener("touchstart", (e) => { e.preventDefault(); start(e); }, { passive: false });
  cvs.addEventListener("touchmove",  (e) => { e.preventDefault(); move(e);  }, { passive: false });
  window.addEventListener("touchend", end);
}

function handleInput(e) {
  const q = bagrutData?.[currentQ];
  if (!q) return;

  if (q.type === "move_x") {
    const rect = cvs.getBoundingClientRect();
    const clientX = e.clientX ?? (e.touches ? e.touches[0].clientX : 0);

    px = (clientX - rect.left - ox) / scale;
    px = clamp(px, -10, 10);

    const s = document.getElementById("mainX");
    if (s) s.value = px;

    updateGame();
  }
}

function updateFromSlider() {
  const s = document.getElementById("mainX");
  if (!s) return;
  px = parseFloat(s.value);
  updateGame();
}

function manual() {
  const q = bagrutData?.[currentQ];
  if (!q) return;

  const getVal = (id) => parseFloat(document.getElementById(id)?.value ?? "0");

  if (!q.locked || !q.locked.includes("a")) cf[0] = getVal("mA");
  if (!q.locked || !q.locked.includes("b")) cf[1] = getVal("mB");
  if (!q.locked || !q.locked.includes("c")) cf[2] = getVal("mC");
  if (!q.locked || !q.locked.includes("d")) cf[3] = getVal("mD");

  // אם נעול – נחזיר סליידר לערך האמיתי
  if (q.locked) {
    if (q.locked.includes("a")) setElValue("mA", cf[0]);
    if (q.locked.includes("b")) setElValue("mB", cf[1]);
    if (q.locked.includes("c")) setElValue("mC", cf[2]);
    if (q.locked.includes("d")) setElValue("mD", cf[3]);
  }

  updateGame();
}

function toggleMute() {
  isMuted = !isMuted;
  const btn = document.getElementById("btnSound");
  if (btn) btn.innerText = isMuted ? "🔇" : "🔊";
}

// -------------------- Math --------------------
function f(x) {
  return cf[0] * x ** 3 + cf[1] * x ** 2 + cf[2] * x + cf[3];
}
function df(x) {
  return 3 * cf[0] * x ** 2 + 2 * cf[1] * x + cf[2];
}
function d2f(x) {
  return 6 * cf[0] * x + 2 * cf[1];
}

// -------------------- Formatting (no 1x / -1x) --------------------
function formatPoly(a, b, c, d) {
  const isZero = (v) => Math.abs(v) < 1e-6;
  const r1 = (v) => Number(v.toFixed(1));

  const term = (v, power) => {
    if (isZero(v)) return null;

    if (power === 0) return String(r1(v));

    let coef = "";
    if (Math.abs(v - 1) < 1e-6) coef = "";
    else if (Math.abs(v + 1) < 1e-6) coef = "-";
    else coef = String(r1(v));

    const xPart = power === 1 ? "x" : (power === 2 ? "x²" : "x³");
    return `${coef}${xPart}`;
  };

  const parts = [term(a, 3), term(b, 2), term(c, 1), term(d, 0)].filter(Boolean);

  if (parts.length === 0) return "y = 0";

  let out = parts[0];
  for (let i = 1; i < parts.length; i++) {
    const t = parts[i];
    out += t.startsWith("-") ? ` - ${t.slice(1)}` : ` + ${t}`;
  }
  return "y = " + out;
}

function formatDeriv(a, b, c) {
  const A = 3 * a, B = 2 * b, C = c;
  const isZero = (v) => Math.abs(v) < 1e-6;
  const r1 = (v) => Number(v.toFixed(1));

  const term = (v, power) => {
    if (isZero(v)) return null;

    if (power === 0) return String(r1(v));

    let coef = "";
    if (Math.abs(v - 1) < 1e-6) coef = "";
    else if (Math.abs(v + 1) < 1e-6) coef = "-";
    else coef = String(r1(v));

    const xPart = power === 1 ? "x" : "x²";
    return `${coef}${xPart}`;
  };

  const parts = [term(A, 2), term(B, 1), term(C, 0)].filter(Boolean);

  if (parts.length === 0) return "f'(x) = 0";

  let out = parts[0];
  for (let i = 1; i < parts.length; i++) {
    const t = parts[i];
    out += t.startsWith("-") ? ` - ${t.slice(1)}` : ` + ${t}`;
  }
  return "f'(x) = " + out;
}

// -------------------- Game Update --------------------
function updateGame() {
  // update coefficient readouts
  setElText("valA", cf[0].toFixed(1));
  setElText("valB", cf[1].toFixed(1));
  setElText("valC", cf[2].toFixed(1));
  setElText("valD", cf[3].toFixed(1));

  // function + derivative text
  setElText("eqn", formatPoly(cf[0], cf[1], cf[2], cf[3]));
  setElText("derivEqn", formatDeriv(cf[0], cf[1], cf[2]));

  // win / hot-cold
  checkWinCondition();

  // side panel
  updateSidePanel();

  draw();
}

function updateSidePanel() {
  const x0 = px;
  const y0 = f(px);
  const m = df(px);
  const b = y0 - m * x0;

  setElText("sideFx", formatPoly(cf[0], cf[1], cf[2], cf[3]));
  setElText("sideDfx", formatDeriv(cf[0], cf[1], cf[2]));

  setElText("sidePoint", `נקודה: (x₀,y₀)=(${x0.toFixed(2)}, ${y0.toFixed(2)})`);
  setElText("sideSlope", `שיפוע: m=f'(x₀)=${m.toFixed(3)}`);
  setElText("sideTangent", `משיק: y=${m.toFixed(2)}x${b >= 0 ? "+" : ""}${b.toFixed(2)}`);
}

// -------------------- Win / Hot-Cold --------------------
function checkWinCondition() {
  const q = bagrutData?.[currentQ];
  if (!q) return;

  let dist = 100;

  if (q.goal === "hit_targets") {
    const hitNow = [];
    let totalError = 0;

    for (let i = 0; i < (q.targets?.length ?? 0); i++) {
      const t = q.targets[i];
      const val = f(t.x);
      const diff = Math.abs(val - t.y);
      totalError += diff;
      if (diff < 0.2) hitNow.push(i);
    }

    // dynamic: must hit all simultaneously
    solvedTargets = hitNow;

    // journal: only when the entry doesn't already exist
    solvedTargets.forEach((i) => {
      const t = q.targets[i];
      addJournalEntry(`f(${t.x}) = ${t.y}`);
      playTone(600 + i * 120, 0.07);
    });

    dist = totalError * 10;

    if ((q.targets?.length ?? 0) > 0 && solvedTargets.length === q.targets.length) {
      if (q.solvedEq) addJournalEntry("✅ " + q.solvedEq);
      triggerSuccess();
    } else {
      hideSuccessIfNeeded();
    }

  } else {
    const m = df(px);

    if (q.goal === "min_point") {
      const d2 = d2f(px);
      dist = Math.abs(m) + (d2 > 0 ? 0 : 5);
    } else if (q.goal === "slope_zero") {
      dist = Math.abs(m);
    }

    if (dist < 0.15) triggerSuccess();
    else hideSuccessIfNeeded();
  }

  // hot/cold bar
  const p = clamp((1 - dist / 5) * 100, 0, 100);
  const bar = document.getElementById("proximityBar");
  if (bar) bar.style.width = p + "%";

  const hot = document.getElementById("hotColdText");
  if (hot) {
    if (p > 85) hot.innerText = "🔥 חם מאוד!";
    else if (p > 60) hot.innerText = "🙂 מתחמם…";
    else if (p > 35) hot.innerText = "😐 פושר…";
    else hot.innerText = "❄️ קר…";
  }
}

function triggerSuccess() {
  const toast = document.getElementById("successToast");
  if (toast) {
    if (!successShown) {
      toast.classList.add("show");
      toast.innerText = "כל הכבוד! ✅";
      playTone(820, 0.18);
      successShown = true;
    }
  } else {
    const banner = document.getElementById("successBanner");
    if (banner && !banner.classList.contains("show")) {
      banner.classList.add("show");
      playTone(820, 0.18);
      successShown = true;
    }
  }
}

function hideSuccessIfNeeded() {
  if (!successShown) return;

  const toast = document.getElementById("successToast");
  if (toast) toast.classList.remove("show");

  const banner = document.getElementById("successBanner");
  if (banner) banner.classList.remove("show");

  successShown = false;
}

// -------------------- Journal --------------------
function addJournalEntry(text) {
  const list = document.getElementById("journalList");
  if (!list) return;

  const exists = Array.from(list.children).some((c) => c.innerText === text);
  if (exists) return;

  const div = document.createElement("div");
  div.className = "journal-entry";
  div.innerText = text;
  list.appendChild(div);
  list.scrollTop = list.scrollHeight;
}

// -------------------- Drawing --------------------
function draw() {
  ctx.clearRect(0, 0, W, H);
  drawGrid();

  const q = bagrutData?.[currentQ];

  // targets
  if (q?.targets) {
    q.targets.forEach((t, i) => {
      drawTarget(t.x, t.y, t.label ?? "", solvedTargets.includes(i));
    });
  }

  // function curve
  drawFunctionCurve();

  // point/tangent tools only if not find_param
  if (q?.type !== "find_param") {
    const y = f(px);
    const m = df(px);

    drawTangent(px, y, m);
    drawNormal(px, y, m);
    drawRightAngleMarker(px, y, m);

    // player point
    const sx = ox + px * scale;
    const sy = oy - y * scale;

    ctx.fillStyle = "#2563eb";
    ctx.beginPath();
    ctx.arc(sx, sy, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "white";
    ctx.lineWidth = 2;
    ctx.stroke();

    updateTrinityDisplay(px, y, m);
  } else {
    const tooltip = document.getElementById("holyTrinity");
    if (tooltip) tooltip.style.display = "none";
  }
}

function drawFunctionCurve() {
  ctx.beginPath();
  ctx.strokeStyle = "#2563eb";
  ctx.lineWidth = 3;

  let started = false;
  for (let i = 0; i <= W; i += 3) {
    const realX = (i - ox) / scale;
    const realY = f(realX);

    // clipping to avoid crazy spikes
    if (!Number.isFinite(realY) || Math.abs(realY) > 1e4) {
      started = false;
      continue;
    }

    const screenY = oy - realY * scale;
    if (!started) {
      ctx.moveTo(i, screenY);
      started = true;
    } else {
      ctx.lineTo(i, screenY);
    }
  }

  ctx.stroke();
}

function drawTarget(x, y, label, isHit) {
  const sx = ox + x * scale;
  const sy = oy - y * scale;

  // main circle
  ctx.beginPath();
  ctx.arc(sx, sy, 8, 0, Math.PI * 2);

  if (isHit) {
    ctx.fillStyle = "#22c55e";
    ctx.fill();
  } else {
    ctx.strokeStyle = "#ef4444";
    ctx.lineWidth = 2;
    ctx.stroke();

    // dashed outer ring
    ctx.setLineDash([2, 2]);
    ctx.beginPath();
    ctx.arc(sx, sy, 12, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  // label
  ctx.fillStyle = "#64748b";
  ctx.font = "12px Rubik, Arial";
  if (label) ctx.fillText(label, sx + 10, sy - 10);

  // coordinates around (4 sides)
  const xTxt = `x=${Number(x).toFixed(2)}`;
  const yTxt = `y=${Number(y).toFixed(2)}`;

  ctx.font = "11px Rubik, Arial";
  ctx.fillText(xTxt, sx - 14, sy - 18); // top
  ctx.fillText(yTxt, sx - 14, sy + 30); // bottom
  ctx.fillText(xTxt, sx - 56, sy + 5);  // left
  ctx.fillText(yTxt, sx + 18, sy + 5);  // right
}

function drawGrid() {
  // thin grid
  ctx.strokeStyle = "#e2e8f0";
  ctx.lineWidth = 1;
  ctx.beginPath();

  for (let x = ox % scale; x < W; x += scale) {
    ctx.moveTo(x, 0);
    ctx.lineTo(x, H);
  }
  for (let y = oy % scale; y < H; y += scale) {
    ctx.moveTo(0, y);
    ctx.lineTo(W, y);
  }
  ctx.stroke();

  // axes
  ctx.strokeStyle = "#94a3b8";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, oy);
  ctx.lineTo(W, oy);
  ctx.moveTo(ox, 0);
  ctx.lineTo(ox, H);
  ctx.stroke();
}

function drawTangent(x1, y1, m) {
  const sx = ox + x1 * scale;
  const sy = oy - y1 * scale;

  ctx.strokeStyle = "#f97316";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(sx - 1000, sy + 1000 * m);
  ctx.lineTo(sx + 1000, sy - 1000 * m);
  ctx.stroke();
}

function drawNormal(x1, y1, m) {
  const sx = ox + x1 * scale;
  const sy = oy - y1 * scale;

  ctx.strokeStyle = "#d946ef";
  ctx.setLineDash([5, 5]);
  ctx.lineWidth = 2;
  ctx.beginPath();

  if (Math.abs(m) < 1e-3) {
    ctx.moveTo(sx, 0);
    ctx.lineTo(sx, H);
  } else {
    const mNorm = -1 / m;
    ctx.moveTo(sx - 1000, sy + 1000 * mNorm);
    ctx.lineTo(sx + 1000, sy - 1000 * mNorm);
  }

  ctx.stroke();
  ctx.setLineDash([]);
}

function drawRightAngleMarker(x1, y1, m) {
  const sx = ox + x1 * scale;
  const sy = oy - y1 * scale;
  const size = 12;

  const angle = Math.atan(-m);
  const p1x = sx + size * Math.cos(angle);
  const p1y = sy + size * Math.sin(angle);
  const p2x = sx + size * Math.cos(angle - Math.PI / 2);
  const p2y = sy + size * Math.sin(angle - Math.PI / 2);
  const p3x = p1x + (p2x - sx);
  const p3y = p1y + (p2y - sy);

  ctx.beginPath();
  ctx.strokeStyle = "#64748b";
  ctx.lineWidth = 1.5;
  ctx.moveTo(p1x, p1y);
  ctx.lineTo(p3x, p3y);
  ctx.lineTo(p2x, p2y);
  ctx.stroke();
}

function updateTrinityDisplay(x, y, m) {
  const tooltip = document.getElementById("holyTrinity");
  if (!tooltip) return;

  setElText("valX", `x = ${x.toFixed(2)}`);
  setElText("valY", `y = ${y.toFixed(2)}`);
  setElText("valM", `m = ${m.toFixed(2)}`);

  const b = y - m * x;
  setElText("lineEqn", `משיק: y=${m.toFixed(1)}x${b >= 0 ? "+" : ""}${b.toFixed(1)}`);

  const sx = ox + x * scale;
  const sy = oy - y * scale;

  tooltip.style.left = sx + "px";
  tooltip.style.top = sy + "px";
  tooltip.style.display = "flex";
}

// -------------------- Menu / Questions --------------------
function initMenu() {
  const sel = document.getElementById("qSelect");
  if (!sel || !Array.isArray(bagrutData)) return;

  sel.innerHTML = "";
  bagrutData.forEach((q, i) => {
    const opt = document.createElement("option");
    opt.value = i;
    opt.text = q.t ?? `שאלה ${i + 1}`;
    sel.appendChild(opt);
  });
}

function loadQ(idx) {
  if (!Array.isArray(bagrutData) || !bagrutData[idx]) return;

  currentQ = idx;
  const q = bagrutData[idx];

  setElValue("qSelect", idx);
  setElText("qCounter", `שאלה ${idx + 1}`);
  setElText("qText", q.d ?? "");

  // clear journal
  const journal = document.getElementById("journalList");
  if (journal) journal.innerHTML = "";

  // reset solved + success
  solvedTargets = [];
  hideSuccessIfNeeded();

  // reset params
  cf = [...(q.p ?? [0, 1, 0, 0])];

  setElValue("mA", cf[0]);
  setElValue("mB", cf[1]);
  setElValue("mC", cf[2]);
  setElValue("mD", cf[3]);

  // unlock all then lock needed
  ["mA", "mB", "mC", "mD"].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.disabled = false;
  });

  if (q.locked) {
    if (q.locked.includes("a")) { const el = document.getElementById("mA"); if (el) el.disabled = true; }
    if (q.locked.includes("b")) { const el = document.getElementById("mB"); if (el) el.disabled = true; }
    if (q.locked.includes("c")) { const el = document.getElementById("mC"); if (el) el.disabled = true; }
    if (q.locked.includes("d")) { const el = document.getElementById("mD"); if (el) el.disabled = true; }
  }

  // X slider visibility
  const xCont = document.getElementById("sliderXContainer");
  const tri = document.getElementById("holyTrinity");

  if (q.type === "move_x") {
    px = -1;
    setElValue("mainX", px);
    if (xCont) xCont.style.display = "flex";
    if (tri) tri.style.display = "flex";
  } else {
    if (xCont) xCont.style.display = "none";
    if (tri) tri.style.display = "none";
  }

  updateGame();
}

function loadQuestionFromSelect() {
  const sel = document.getElementById("qSelect");
  if (!sel) return;
  loadQ(parseInt(sel.value, 10));
}

function nextQuestion() {
  if (!Array.isArray(bagrutData)) return;
  if (currentQ < bagrutData.length - 1) loadQ(currentQ + 1);
}

// -------------------- Audio --------------------
function initAudio() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
}

function playTone(freq, duration) {
  if (isMuted || !audioCtx) return;

  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();

  osc.connect(gain);
  gain.connect(audioCtx.destination);

  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);

  osc.start();
  osc.stop(audioCtx.currentTime + duration);
}

// -------------------- Zoom --------------------
function zoomIn() { scale *= 1.1; draw(); }
function zoomOut() { scale /= 1.1; draw(); }
function resetZoom() { scale = baseScale; draw(); }

// -------------------- Helpers --------------------
function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

function setElText(id, text) {
  const el = document.getElementById(id);
  if (el) el.innerText = text;
}

function setElValue(id, value) {
  const el = document.getElementById(id);
  if (el) el.value = value;
}
