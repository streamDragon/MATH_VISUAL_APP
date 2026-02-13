/* script.js - לוגיקה מלאה: גרף, נגזרת, יומן, מטרות, חם/קר, סאונד */

let cvs, ctx, W, H, mainArea;

// קואורדינטות
let baseScale = 40,
  scale = 40;
let ox,
  oy; // origin on canvas

// מצב
let px = 0; // x של הנקודה הנגררת (רק במצב move_x)
let cf = [0, 1, 0, 0]; // [a,b,c,d]  f(x) = ax^3 + bx^2 + cx + d
let currentQ = 0;
let isDrag = false;

// אודיו
let audioCtx = null;
let isMuted = false;

// מטרות שנפתרו
let solvedTargets = [];

// ----- helpers DOM (כדי לא לקרוס אם חסר אלמנט) -----
function $(id) {
  return document.getElementById(id);
}
function setText(id, txt) {
  const el = $(id);
  if (el) el.innerText = txt;
}
function setHTML(id, html) {
  const el = $(id);
  if (el) el.innerHTML = html;
}
function setStyle(id, prop, value) {
  const el = $(id);
  if (el) el.style[prop] = value;
}

// ----- מתמטיקה -----
function f(x) {
  return cf[0] * x ** 3 + cf[1] * x ** 2 + cf[2] * x + cf[3];
}
function df(x) {
  return 3 * cf[0] * x ** 2 + 2 * cf[1] * x + cf[2];
}

// פורמט פונקציה (כולל סימנים)
function formatPoly(a, b, c, d) {
  const parts = [];
  const pushTerm = (coef, term) => {
    if (Math.abs(coef) < 0.001) return;
    const n = Number(coef.toFixed(1));
    parts.push({ n, term });
  };

  pushTerm(a, "x³");
  pushTerm(b, "x²");
  pushTerm(c, "x");

  // קבוע
  if (Math.abs(d) > 0.001 || parts.length === 0) {
    parts.push({ n: Number(d.toFixed(1)), term: "" });
  }

  // בנייה עם +/-
  let out = "f(x) = ";
  parts.forEach((p, i) => {
    const sign = p.n >= 0 ? "+" : "-";
    const absN = Math.abs(p.n);

    if (i === 0) {
      out += `${p.n}${p.term}`;
    } else {
      out += ` ${sign} ${absN}${p.term}`;
    }
  });

  return out.replace(/\+ -/g, "- ");
}

function formatDeriv(a, b, c) {
  // f'(x) = 3ax^2 + 2bx + c
  const A = 3 * a;
  const B = 2 * b;
  const C = c;

  const parts = [];
  const pushTerm = (coef, term) => {
    if (Math.abs(coef) < 0.001) return;
    const n = Number(coef.toFixed(1));
    parts.push({ n, term });
  };

  pushTerm(A, "x²");
  pushTerm(B, "x");
  // קבוע
  if (Math.abs(C) > 0.001 || parts.length === 0) {
    parts.push({ n: Number(C.toFixed(1)), term: "" });
  }

  let out = "f'(x) = ";
  parts.forEach((p, i) => {
    const sign = p.n >= 0 ? "+" : "-";
    const absN = Math.abs(p.n);

    if (i === 0) {
      out += `${p.n}${p.term}`;
    } else {
      out += ` ${sign} ${absN}${p.term}`;
    }
  });

  return out.replace(/\+ -/g, "- ");
}

// ----- אתחול -----
window.onload = () => {
  cvs = $("cvs");
  if (!cvs) {
    console.error("Missing canvas #cvs");
    return;
  }

  ctx = cvs.getContext("2d");
  mainArea = $("mainArea") || cvs.parentElement;

  window.addEventListener("resize", resize);
  resize();

  setupEvents();
  initMenu();
  initSoundUI();
  loadQ(0);

  // אם תרצה אנימציה עתידית:
  // requestAnimationFrame(animate);
};

// ----- UI -----
function initSoundUI() {
  const btn = $("btnSound");
  if (!btn) return;
  btn.innerText = isMuted ? "🔇" : "🔊";
}

function resize() {
  W = cvs.width = mainArea.clientWidth;
  H = cvs.height = mainArea.clientHeight;
  ox = W / 2;
  oy = H / 2 + 50;
  draw();
}

function setupEvents() {
  const start = (e) => {
    isDrag = true;
    initAudio();
    handleInput(e);
  };
  const move = (e) => {
    if (isDrag) handleInput(e);
  };
  const end = () => {
    isDrag = false;
  };

  cvs.addEventListener("mousedown", start);
  window.addEventListener("mousemove", move);
  window.addEventListener("mouseup", end);

  cvs.addEventListener(
    "touchstart",
    (e) => {
      e.preventDefault();
      start(e);
    },
    { passive: false }
  );
  cvs.addEventListener(
    "touchmove",
    (e) => {
      e.preventDefault();
      move(e);
    },
    { passive: false }
  );
  cvs.addEventListener("touchend", end);
}

function handleInput(e) {
  const q = window.bagrutData[currentQ];
  if (!q) return;

  // רק במצב "move_x" גוררים נקודה
  if (q.type === "move_x") {
    const clientX = e.clientX || (e.touches ? e.touches[0].clientX : 0);
    const rect = cvs.getBoundingClientRect();
    px = (clientX - rect.left - ox) / scale;
    px = Math.max(-10, Math.min(10, px));

    const slider = $("mainX");
    if (slider) slider.value = px;

    updateGame();
  }
}

function updateFromSlider() {
  const slider = $("mainX");
  if (!slider) return;
  px = parseFloat(slider.value);
  updateGame();
}

function manual() {
  const q = window.bagrutData[currentQ];
  if (!q) return;

  // מי נעול? מי פתוח?
  if (!q.locked || !q.locked.includes("a")) cf[0] = parseFloat($("mA")?.value ?? cf[0]);
  if (!q.locked || !q.locked.includes("b")) cf[1] = parseFloat($("mB")?.value ?? cf[1]);
  if (!q.locked || !q.locked.includes("c")) cf[2] = parseFloat($("mC")?.value ?? cf[2]);
  if (!q.locked || !q.locked.includes("d")) cf[3] = parseFloat($("mD")?.value ?? cf[3]);

  // החזרת סליידרים נעולים למצבם (שלא “יברחו”)
  if (q.locked) {
    if (q.locked.includes("a") && $("mA")) $("mA").value = cf[0];
    if (q.locked.includes("b") && $("mB")) $("mB").value = cf[1];
    if (q.locked.includes("c") && $("mC")) $("mC").value = cf[2];
    if (q.locked.includes("d") && $("mD")) $("mD").value = cf[3];
  }

  updateGame();
}

// ----- עדכון מרכזי -----
function updateGame() {
  // טקסט ערכי פרמטרים
  setText("valA", cf[0].toFixed(1));
  setText("valB", cf[1].toFixed(1));
  setText("valC", cf[2].toFixed(1));
  setText("valD", cf[3].toFixed(1));

  // הצגת פונקציה + נגזרת
  setText("eqn", formatPoly(cf[0], cf[1], cf[2], cf[3]));
  setText("derivEqn", formatDeriv(cf[0], cf[1], cf[2])); // ✅ חדש: נגזרת ליד הפונקציה

  // בדיקת ניצחון + חם/קר
  checkWinCondition();

  // ציור
  draw();
}

// ----- חם/קר (ליד ה-bar) -----
function setHeatFeedback(pct) {
  // pct: 0..100
  // טקסט "קר/פושר/חם/רותח"
  let label = "קר ❄️";
  if (pct > 25) label = "מתחמם 🙂";
  if (pct > 50) label = "חם 🔥";
  if (pct > 75) label = "רותח 🚀";

  // אלמנט טקסט אופציונלי
  setText("proximityText", `${label}  (${Math.round(pct)}%)`);

  // אפשר גם לשנות שקיפות/Glow של הבר (לא חובה)
  const bar = $("proximityBar");
  if (bar) {
    bar.style.opacity = 0.6 + 0.4 * (pct / 100);
  }
}

// ----- תנאי ניצחון -----
function checkWinCondition() {
  const q = window.bagrutData[currentQ];
  if (!q) return;

  let dist = 100;

  if (q.goal === "hit_targets") {
    // מצב בנייה: כמה רחוקים מכל המטרות
    let totalError = 0;

    q.targets.forEach((t, i) => {
      const val = f(t.x);
      const diff = Math.abs(val - t.y);
      totalError += diff;

      // אם המטרה הושגה ועוד לא נרשמה
      if (diff < 0.2 && !solvedTargets.includes(i)) {
        solvedTargets.push(i);
        addJournalEntry(`f(${t.x}) = ${t.y}`);
        playTone(600 + i * 100, 0.12);
      }
    });

    dist = totalError * 10;

    // הצלחה מלאה
    if (solvedTargets.length === q.targets.length) {
      const last = $("journalList")?.lastChild?.innerText ?? "";
      if (q.solvedEq && last !== "✅ " + q.solvedEq) {
        addJournalEntry("✅ " + q.solvedEq);
      }
      triggerSuccess();
    }
  } else {
    // מצב חקירה: מזיזים X
    const m = df(px);

    if (q.goal === "min_point") {
      // מינימום: m≈0 וגם f''>0
      const d2 = 6 * cf[0] * px + 2 * cf[1];
      dist = Math.abs(m) + (d2 > 0 ? 0 : 5);
    } else if (q.goal === "slope_zero") {
      dist = Math.abs(m);
    }

    if (dist < 0.15) triggerSuccess();
  }

  // proximity 0..100
  const p = Math.max(0, Math.min(100, (1 - dist / 5) * 100));
  setStyle("proximityBar", "width", p + "%");
  setHeatFeedback(p);
}

// ----- הצלחה -----
function triggerSuccess() {
  const banner = $("successBanner");
  if (!banner) {
    // גם אם אין banner, לפחות צליל:
    playTone(800, 0.25);
    return;
  }

  if (!banner.classList.contains("show")) {
    banner.classList.add("show");
    playTone(800, 0.25);
  }
}

// ----- יומן -----
function addJournalEntry(text) {
  const list = $("journalList");
  if (!list) return;

  // מניעת כפילויות
  const exists = Array.from(list.children).some((c) => c.innerText === text);
  if (exists) return;

  const div = document.createElement("div");
  div.className = "journal-entry";
  div.innerText = text;
  list.appendChild(div);
  list.scrollTop = list.scrollHeight;
}

// ----- ציור -----
function draw() {
  if (!ctx) return;

  ctx.clearRect(0, 0, W, H);
  drawGrid();

  const q = window.bagrutData[currentQ];
  if (!q) return;

  // מטרות
  if (q.targets) {
    q.targets.forEach((t, i) => drawTarget(t.x, t.y, t.label, solvedTargets.includes(i)));
  }

  // גרף הפונקציה
  ctx.beginPath();
  ctx.strokeStyle = "#2563eb";
  ctx.lineWidth = 3;

  for (let i = 0; i <= W; i += 4) {
    const realX = (i - ox) / scale;
    const realY = f(realX);
    const screenY = oy - realY * scale;
    if (i === 0) ctx.moveTo(i, screenY);
    else ctx.lineTo(i, screenY);
  }
  ctx.stroke();

  // אם זה מצב move_x — מציירים נקודה, משיק, נורמל, זווית וכו'
  if (q.type !== "find_param") {
    const y = f(px);
    const m = df(px);

    drawTangent(px, y, m);
    drawNormal(px, y, m);
    drawRightAngleMarker(px, y, m);

    // נקודה
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
  }
}

function drawTarget(x, y, label, isHit) {
  const sx = ox + x * scale;
  const sy = oy - y * scale;

  ctx.beginPath();
  ctx.arc(sx, sy, 8, 0, Math.PI * 2);

  if (isHit) {
    ctx.fillStyle = "#22c55e";
    ctx.fill();
  } else {
    ctx.strokeStyle = "#ef4444";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.setLineDash([2, 2]);
    ctx.beginPath();
    ctx.arc(sx, sy, 12, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  ctx.fillStyle = "#64748b";
  ctx.font = "12px Rubik";
  ctx.fillText(label, sx + 10, sy - 10);
}

function drawGrid() {
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

  // צירים
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

  if (Math.abs(m) < 0.001) {
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
  const tooltip = $("holyTrinity");
  if (!tooltip) return;

  setText("valX", `x = ${x.toFixed(2)}`);
  setText("valY", `y = ${y.toFixed(2)}`);
  setText("valM", `m = ${m.toFixed(2)}`);

  const b = y - m * x;
  setText("lineEqn", `משיק: y=${m.toFixed(1)}x${b >= 0 ? "+" : ""}${b.toFixed(1)}`);

  const sx = ox + x * scale;
  const sy = oy - y * scale;
  tooltip.style.left = sx + "px";
  tooltip.style.top = sy + "px";
  tooltip.style.display = "flex";
}

// ----- תפריט / טעינת שאלה -----
function initMenu() {
  const sel = $("qSelect");
  if (!sel) return;

  sel.innerHTML = "";
  window.bagrutData.forEach((q, i) => {
    const opt = document.createElement("option");
    opt.value = i;
    opt.text = q.t;
    sel.appendChild(opt);
  });
}

function loadQ(idx) {
  currentQ = idx;
  const q = window.bagrutData[idx];
  if (!q) return;

  const sel = $("qSelect");
  if (sel) sel.value = idx;

  setText("qCounter", `שאלה ${idx + 1}`);
  setText("qText", q.d);

  // איפוס יומן + הצלחה
  if ($("journalList")) $("journalList").innerHTML = "";
  $("successBanner")?.classList.remove("show");
  solvedTargets = [];

  // איפוס פרמטרים
  cf = [...q.p];
  if ($("mA")) $("mA").value = cf[0];
  if ($("mB")) $("mB").value = cf[1];
  if ($("mC")) $("mC").value = cf[2];
  if ($("mD")) $("mD").value = cf[3];

  // enable all sliders
  ["mA", "mB", "mC", "mD"].forEach((id) => {
    if ($(id)) $(id).disabled = false;
  });

  // lock sliders
  if (q.locked) {
    if (q.locked.includes("a") && $("mA")) $("mA").disabled = true;
    if (q.locked.includes("b") && $("mB")) $("mB").disabled = true;
    if (q.locked.includes("c") && $("mC")) $("mC").disabled = true;
    if (q.locked.includes("d") && $("mD")) $("mD").disabled = true;
  }

  // מצב move_x: מציגים X וטריניטי
  if (q.type === "move_x") {
    px = -1;
    if ($("mainX")) $("mainX").value = px;
    setStyle("sliderXContainer", "display", "flex");
    setStyle("holyTrinity", "display", "flex");
  } else {
    // מצב פרמטרים: מסתירים X וטריניטי
    setStyle("sliderXContainer", "display", "none");
    setStyle("holyTrinity", "display", "none");
  }

  updateGame();
}

function loadQuestionFromSelect() {
  const sel = $("qSelect");
  if (!sel) return;
  loadQ(parseInt(sel.value, 10));
}

function nextQuestion() {
  if (currentQ < window.bagrutData.length - 1) loadQ(currentQ + 1);
}

// ----- אודיו -----
function initAudio() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
}

function toggleMute() {
  isMuted = !isMuted;
  const btn = $("btnSound");
  if (btn) btn.innerText = isMuted ? "🔇" : "🔊";
}

function playTone(freq, duration) {
  if (isMuted) return;
  if (!audioCtx) return;

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

// אם תרצה אנימציה בעתיד
function animate() {}

// זום
function zoomIn() {
  scale *= 1.1;
  draw();
}
function zoomOut() {
  scale /= 1.1;
  draw();
}
function resetZoom() {
  scale = baseScale;
  draw();
}
