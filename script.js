/* script.js - כולל יומן משוואות ומטרות ויזואליות
   עדכונים לפי הבקשות שלך:
   ✅ "כל הכבוד" לא באמצע: מציגים הודעה קטנה בפינה + לא חוסם נקודה
   ✅ בצד הגרף: מציגים f(x), f'(x), m=f'(x0), נקודה (x0,y0), ומשוואת המשיק
   ✅ לכל נקודת מטרה אדומה: מציגים גם (x,y) ליד התווית
   ✅ מעדכן תמיד את הנגזרת ליד הפונקציה
   ✅ בתרגיל "שתי נקודות": הצלחה רק אם *באותו רגע* הפונקציה פוגעת בשתיהן.
      אם זזים ומאבדים נקודה – היא מתבטלת (solvedTargets מתאפס/מתעדכן בזמן אמת)
*/

// --------- Globals ----------
let cvs, ctx, W, H, mainArea;
let baseScale = 40,
  scale = 40;
let ox,
  oy; // origin screen coords
let px = 0; // draggable x
let cf = [0, 1, 0, 0]; // [a,b,c,d]
let currentQ = 0;
let isDrag = false;

// audio
let audioCtx = null,
  isMuted = false;

// targets
let solvedTargets = []; // indices hit currently (dynamic)

// success UI
let successShown = false;

// ---------- Boot ----------
window.onload = () => {
  cvs = document.getElementById("cvs");
  ctx = cvs.getContext("2d");
  mainArea = document.getElementById("mainArea");

  window.addEventListener("resize", resize);
  resize();
  setupEvents();
  initMenu();
  loadQ(0);

  // אם יש כפתור סאונד קיים:
  const btn = document.getElementById("btnSound");
  if (btn) btn.innerText = isMuted ? "🔇" : "🔊";

  requestAnimationFrame(animate);
};

function resize() {
  W = cvs.width = mainArea.clientWidth;
  H = cvs.height = mainArea.clientHeight;
  ox = W / 2;
  oy = H / 2 + 50;
  draw();
}

// ---------- Input ----------
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
  const q = bagrutData[currentQ];

  if (q.type === "move_x") {
    const clientX = e.clientX || (e.touches ? e.touches[0].clientX : 0);
    const rect = cvs.getBoundingClientRect();
    px = (clientX - rect.left - ox) / scale;
    px = Math.max(-10, Math.min(10, px));
    const s = document.getElementById("mainX");
    if (s) s.value = px;
    updateGame();
  }
}

function updateFromSlider() {
  px = parseFloat(document.getElementById("mainX").value);
  updateGame();
}

function manual() {
  const q = bagrutData[currentQ];

  if (!q.locked || !q.locked.includes("a"))
    cf[0] = parseFloat(document.getElementById("mA").value);
  if (!q.locked || !q.locked.includes("b"))
    cf[1] = parseFloat(document.getElementById("mB").value);
  if (!q.locked || !q.locked.includes("c"))
    cf[2] = parseFloat(document.getElementById("mC").value);
  if (!q.locked || !q.locked.includes("d"))
    cf[3] = parseFloat(document.getElementById("mD").value);

  // אם נעול, נחזיר את הסליידר לערך האמיתי כדי שלא "ירוץ" ויזואלית
  if (q.locked) {
    if (q.locked.includes("a")) document.getElementById("mA").value = cf[0];
    if (q.locked.includes("b")) document.getElementById("mB").value = cf[1];
    if (q.locked.includes("c")) document.getElementById("mC").value = cf[2];
    if (q.locked.includes("d")) document.getElementById("mD").value = cf[3];
  }

  updateGame();
}

function toggleMute() {
  isMuted = !isMuted;
  const btn = document.getElementById("btnSound");
  if (btn) btn.innerText = isMuted ? "🔇" : "🔊";
}

// ---------- Math ----------
function f(x) {
  return cf[0] * x ** 3 + cf[1] * x ** 2 + cf[2] * x + cf[3];
}
function df(x) {
  return 3 * cf[0] * x ** 2 + 2 * cf[1] * x + cf[2];
}
function d2f(x) {
  return 6 * cf[0] * x + 2 * cf[1];
}



// ===============================
// Pretty formatting helpers
// ===============================

function fmtCoeff(n, isFirstTerm = false) {
  // מחזיר מחרוזת מקדם לתצוגה: בלי 1, בלי -1, עם +/-
  // דוגמאות:
  //  1   -> ""   (או "+" אם לא ראשון)
  // -1   -> "-"
  //  2   -> "2"
  // -2   -> "-2"
  if (Math.abs(n) < 1e-9) return "";

  const sign = n < 0 ? "-" : isFirstTerm ? "" : "+";
  const abs = Math.abs(n);

  // בלי "1" (וגם בלי "-1") לפני x
  const mag = Math.abs(abs - 1) < 1e-9 ? "" : String(Number(abs.toFixed(2)));

  return sign + mag;
}

function fmtConst(n, isFirstTerm = false) {
  // קבוע: אם לא ראשון -> מוסיף +/-
  if (Math.abs(n) < 1e-9) return isFirstTerm ? "0" : "";
  const sign = n < 0 ? "-" : isFirstTerm ? "" : "+";
  return sign + String(Number(Math.abs(n).toFixed(2)));
}

// ===============================
// f(x) formatter (cubic)
// ===============================

// ===============================
// Pretty formatting helpers
// ===============================
function formatPoly(a, b, c, d) {
  const isZero = (v) => Math.abs(v) < 1e-6;
  const r1 = (v) => Number(v.toFixed(1));

  function term(v, power) {
    if (isZero(v)) return null;

    // constant
    if (power === 0) return String(r1(v));

    // coefficient rules: 1 -> "", -1 -> "-"
    let coef = "";
    if (Math.abs(v - 1) < 1e-6) coef = "";
    else if (Math.abs(v + 1) < 1e-6) coef = "-";
    else coef = String(r1(v));

    const xPart = power === 1 ? "x" : (power === 2 ? "x²" : "x³");
    return `${coef}${xPart}`; // e.g. "-x²", "2.5x³", "x"
  }

  const parts = [
    term(a, 3),
    term(b, 2),
    term(c, 1),
    term(d, 0),
  ].filter(Boolean);

  if (parts.length === 0) return "y = 0";

  let out = parts[0];
  for (let i = 1; i < parts.length; i++) {
    const t = parts[i];
    if (t.startsWith("-")) out += " - " + t.slice(1);
    else out += " + " + t;
  }
  return "y = " + out;
}

function formatDeriv(a, b, c) {
  // f'(x) = 3ax^2 + 2bx + c
  const A = 3 * a, B = 2 * b, C = c;
  const isZero = (v) => Math.abs(v) < 1e-6;
  const r1 = (v) => Number(v.toFixed(1));

  function term(v, power) {
    if (isZero(v)) return null;

    if (power === 0) return String(r1(v));

    let coef = "";
    if (Math.abs(v - 1) < 1e-6) coef = "";
    else if (Math.abs(v + 1) < 1e-6) coef = "-";
    else coef = String(r1(v));

    const xPart = power === 1 ? "x" : "x²";
    return `${coef}${xPart}`;
  }

  const parts = [
    term(A, 2),
    term(B, 1),
    term(C, 0),
  ].filter(Boolean);

  if (parts.length === 0) return "f'(x) = 0";

  let out = parts[0];
  for (let i = 1; i < parts.length; i++) {
    const t = parts[i];
    if (t.startsWith("-")) out += " - " + t.slice(1);
    else out += " + " + t;
  }
  return "f'(x) = " + out;
}



// ---------- Game Update ----------
function updateGame() {
  // טקסטי מקדמים
  const va = document.getElementById("valA");
  const vb = document.getElementById("valB");
  const vc = document.getElementById("valC");
  const vd = document.getElementById("valD");
  if (va) va.innerText = cf[0].toFixed(1);
  if (vb) vb.innerText = cf[1].toFixed(1);
  if (vc) vc.innerText = cf[2].toFixed(1);
  if (vd) vd.innerText = cf[3].toFixed(1);

  // טקסט פונקציה + נגזרת (צד הגרף)
  const eqn = document.getElementById("eqn");
  const deq = document.getElementById("derivEqn");
  if (eqn) eqn.innerText = formatPoly(cf[0], cf[1], cf[2], cf[3]);
  if (deq) deq.innerText = formatDeriv(cf[0], cf[1], cf[2]);

  // עדכון תצוגת "מד חם-קר" + הצלחה
  checkWinCondition();

  // עדכון תצוגות צד (נקודה/שיפוע/משיק) בכל מצב
  updateSidePanel();

  draw();
}

function updateSidePanel() {
  // מציג:
  // point: (x0, y0)
  // m = f'(x0)
  // tangent: y = m x + b
  const x0 = px;
  const y0 = f(px);
  const m = df(px);
  const b = y0 - m * x0;

  const elPoint = document.getElementById("sidePoint");
  const elSlope = document.getElementById("sideSlope");
  const elTangent = document.getElementById("sideTangent");
  const elFx = document.getElementById("sideFx");
  const elDfx = document.getElementById("sideDfx");

  if (elFx) elFx.innerText = formatPoly(cf[0], cf[1], cf[2], cf[3]);
  if (elDfx) elDfx.innerText = formatDeriv(cf[0], cf[1], cf[2]);

  if (elPoint) elPoint.innerText = `נקודה: (x₀,y₀)=(${x0.toFixed(2)}, ${y0.toFixed(2)})`;
  if (elSlope) elSlope.innerText = `שיפוע: m=f'(x₀)=${m.toFixed(3)}`;
  if (elTangent)
    elTangent.innerText = `משיק: y=${m.toFixed(2)}x${b >= 0 ? "+" : ""}${b.toFixed(2)}`;
}

// ---------- Win / Hot-Cold ----------
function checkWinCondition() {
  const q = bagrutData[currentQ];
  let dist = 100;

  // כל פעם נחשב "חם/קר" וגם נסנכרן solvedTargets דינמית
  if (q.goal === "hit_targets") {
    // דינמי: לא "ננעלים" על נקודה שנפתרה.
    // בכל frame: מי בתוך סף -> נחשב כ-hit, מי לא -> מתבטל.
    const hitNow = [];

    let totalError = 0;

    q.targets.forEach((t, i) => {
      const val = f(t.x);
      const diff = Math.abs(val - t.y);
      totalError += diff;

      if (diff < 0.2) hitNow.push(i);
    });

    // זה הקטע החשוב לשאלה 5: הצלחה רק אם *כל* הנקודות hitNow בו זמנית
    solvedTargets = hitNow.slice();

    // journal: נרשום f(x)=y רק כשהגענו לראשונה לאותה נקודה (ועדיין לא קיים ביומן)
    solvedTargets.forEach((i) => {
      const t = q.targets[i];
      addJournalEntry(`f(${t.x}) = ${t.y}`);
      playTone(600 + i * 120, 0.07);
    });

    dist = totalError * 10;

    if (solvedTargets.length === q.targets.length) {
      if (q.solvedEq) addJournalEntry("✅ " + q.solvedEq);
      triggerSuccess();
    } else {
      // אם לא פגענו בכל הנקודות יחד — אין הצלחה
      hideSuccessIfNeeded();
    }
  } else {
    // move_x
    const m = df(px);
    const y = f(px);

    if (q.goal === "min_point") {
      const d2 = d2f(px);
      dist = Math.abs(m) + (d2 > 0 ? 0 : 5);
    } else if (q.goal === "slope_zero") {
      dist = Math.abs(m);
    }

    if (dist < 0.15) triggerSuccess();
    else hideSuccessIfNeeded();
  }

  // חם/קר מד קרבה
  const p = Math.max(0, Math.min(100, (1 - dist / 5) * 100));
  const bar = document.getElementById("proximityBar");
  if (bar) bar.style.width = p + "%";

  // "חם יותר" כשהקרוב — מוסיפים גם טקסט אם קיים
  const hot = document.getElementById("hotColdText");
  if (hot) {
    if (p > 85) hot.innerText = "🔥 חם מאוד!";
    else if (p > 60) hot.innerText = "🙂 מתחמם…";
    else if (p > 35) hot.innerText = "😐 פושר…";
    else hot.innerText = "❄️ קר…";
  }
}

function triggerSuccess() {
  // במקום באמצע: נציג בפינה (מומלץ: אלמנט #successToast)
  const toast = document.getElementById("successToast");
  if (toast) {
    if (!successShown) {
      toast.classList.add("show");
      toast.innerText = "כל הכבוד! ✅";
      playTone(820, 0.18);
      successShown = true;
    }
  } else {
    // fallback לישן אם קיים
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

// ---------- Journal ----------
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

// ---------- Drawing ----------
function draw() {
  ctx.clearRect(0, 0, W, H);
  drawGrid();

  // targets
  const q = bagrutData[currentQ];
  if (q.targets) {
    q.targets.forEach((t, i) => {
      drawTarget(t.x, t.y, t.label, solvedTargets.includes(i));
    });
  }

  // function curve
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

  // point and tangent tools
  const y = f(px);
  const m = df(px);

  // מצבי נקודה (move_x): מציגים משיק/נורמל/סימונים
  // מצבי פרמטר (find_param): ברירת מחדל לא מציג נקודה,
  // אבל אתה ביקשת שעדיין יופיעו נוסחאות בצד – זה כבר קורה ב-sidePanel
  if (q.type !== "find_param") {
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
    // במצב פרמטרים: מסתירים tooltip אם רוצים
    const tooltip = document.getElementById("holyTrinity");
    if (tooltip) tooltip.style.display = "none";
  }
}

 function drawTarget(x, y, label, isHit) {
    let sx = ox + x * scale;
    let sy = oy - y * scale;

    // עיגול מטרה
    ctx.beginPath();
    ctx.arc(sx, sy, 8, 0, Math.PI * 2);

    if (isHit) {
        ctx.fillStyle = "#22c55e"; // ירוק מלא
        ctx.fill();
    } else {
        ctx.strokeStyle = "#ef4444"; // אדום ריק
        ctx.lineWidth = 2;
        ctx.stroke();

        // עיגול מקווקו מסביב
        ctx.setLineDash([2, 2]);
        ctx.beginPath();
        ctx.arc(sx, sy, 12, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
    }

    // תווית (A / B / השקה וכו')
    ctx.fillStyle = "#64748b";
    ctx.font = "12px Rubik";
    ctx.fillText(label, sx + 10, sy - 10);

    // קואורדינטות מסביב לנקודה (4 צדדים)
    const xTxt = `x=${Number(x).toFixed(2)}`;
    const yTxt = `y=${Number(y).toFixed(2)}`;

    ctx.font = "11px Rubik";
    ctx.fillText(xTxt, sx - 14, sy - 18); // למעלה
    ctx.fillText(yTxt, sx - 14, sy + 30); // למטה
    ctx.fillText(xTxt, sx - 56, sy + 5);  // שמאל
    ctx.fillText(yTxt, sx + 18, sy + 5);  // ימין
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
  const tooltip = document.getElementById("holyTrinity");
  if (!tooltip) return;

  const vx = document.getElementById("valX");
  const vy = document.getElementById("valY");
  const vm = document.getElementById("valM");
  const le = document.getElementById("lineEqn");

  if (vx) vx.innerText = `x = ${x.toFixed(2)}`;
  if (vy) vy.innerText = `y = ${y.toFixed(2)}`;
  if (vm) vm.innerText = `m = ${m.toFixed(2)}`;

  const b = y - m * x;
  if (le) le.innerText = `משיק: y=${m.toFixed(1)}x${b >= 0 ? "+" : ""}${b.toFixed(1)}`;

  const sx = ox + x * scale;
  const sy = oy - y * scale;
  tooltip.style.left = sx + "px";
  tooltip.style.top = sy + "px";
  tooltip.style.display = "flex";
}

// ---------- Menu / Load Questions ----------
function initMenu() {
  const sel = document.getElementById("qSelect");
  if (!sel) return;
  sel.innerHTML = "";
  bagrutData.forEach((q, i) => {
    const opt = document.createElement("option");
    opt.value = i;
    opt.text = q.t;
    sel.appendChild(opt);
  });
}

function loadQ(idx) {
  currentQ = idx;
  const q = bagrutData[idx];

  const sel = document.getElementById("qSelect");
  if (sel) sel.value = idx;

  const counter = document.getElementById("qCounter");
  if (counter) counter.innerText = `שאלה ${idx + 1}`;

  const qt = document.getElementById("qText");
  if (qt) qt.innerText = q.d;

  const journal = document.getElementById("journalList");
  if (journal) journal.innerHTML = "";

  // איפוס solvedTargets + success
  solvedTargets = [];
  hideSuccessIfNeeded();

  // reset params
  cf = [...q.p];
  const mA = document.getElementById("mA");
  const mB = document.getElementById("mB");
  const mC = document.getElementById("mC");
  const mD = document.getElementById("mD");
  if (mA) mA.value = cf[0];
  if (mB) mB.value = cf[1];
  if (mC) mC.value = cf[2];
  if (mD) mD.value = cf[3];

  // unlock all then lock needed
  ["mA", "mB", "mC", "mD"].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.disabled = false;
  });

  if (q.locked) {
    if (q.locked.includes("a") && mA) mA.disabled = true;
    if (q.locked.includes("b") && mB) mB.disabled = true;
    if (q.locked.includes("c") && mC) mC.disabled = true;
    if (q.locked.includes("d") && mD) mD.disabled = true;
  }

  // X slider visibility
  const xCont = document.getElementById("sliderXContainer");
  const tri = document.getElementById("holyTrinity");

  if (q.type === "move_x") {
    px = -1;
    const sx = document.getElementById("mainX");
    if (sx) sx.value = px;
    if (xCont) xCont.style.display = "flex";
    if (tri) tri.style.display = "flex";
  } else {
    if (xCont) xCont.style.display = "none";
    if (tri) tri.style.display = "none";
  }

  updateGame();
}

function loadQuestionFromSelect() {
  loadQ(parseInt(document.getElementById("qSelect").value));
}
function nextQuestion() {
  if (currentQ < bagrutData.length - 1) loadQ(currentQ + 1);
}

// ---------- Audio ----------
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

// ---------- Animation / Zoom ----------
function animate() {
  /* requestAnimationFrame(animate); */
}
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
