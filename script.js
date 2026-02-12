/* script.js - גרסה סופית הכוללת נורמל וזווית 90 */

// נתוני השאלות
const bagrutData = [
    { 
        t: "שלב 1: מינימום", 
        d: "הזיזו את הנקודה הכחולה לנקודת המינימום של הפונקציה.", 
        p: [0, 1, -4, 4], // x^2 - 4x + 4
        goal: 'min_point' 
    },
    { 
        t: "שלב 2: חיתוך Y", 
        d: "מצאו את נקודת החיתוך של הפונקציה עם ציר ה-Y.", 
        p: [0, 1, -2, -3], 
        goal: 'y_intercept' 
    },
    { 
        t: "שלב 3: שיפוע אפס", 
        d: "מצאו נקודה שבה המשיק מקביל לציר ה-X (שיפוע 0).", 
        p: [-1, 3, 0, -2], 
        goal: 'slope_zero' 
    },
    { 
        t: "שלב 4: משיק לראשית", 
        d: "מצאו נקודה שהמשיק העובר דרכה חותך את ראשית הצירים (0,0).", 
        p: [0, -0.5, 2, 1], 
        goal: 'tan_pass_origin' 
    },
    { 
        t: "אתגר פרמטר K", 
        d: "השתמשו בזחלן d (למטה) כדי להזיז את הפונקציה כך שתשיק לציר ה-X.", 
        p: [0, 1, 0, 2],
        goal: 'param_touch_x',
        paramIdx: 3, 
        targetVal: 0
    },
    { 
        t: "משולש הזהב", 
        d: "מצאו נקודה שבה המשיק יוצר משולש עם הצירים בשטח של בערך 2.", 
        p: [0, 0.5, -2, 4], 
        goal: 'triangle_area',
        targetVal: 2
    }
];

// משתנים גלובליים
let cvs, ctx, W, H, mainArea;
let baseScale = 40, scale = 40;
let ox, oy; // ראשית הצירים
let px = 0; // מיקום ה-x הנוכחי של השחקן
let cf = [0, 1, 0, 0]; // מקדמי הפונקציה a,b,c,d
let currentQ = 0;
let isDrag = false;
let audioCtx = null, isMuted = false;

// אתחול
window.onload = () => {
    cvs = document.getElementById('cvs');
    ctx = cvs.getContext('2d');
    mainArea = document.getElementById('mainArea');
    
    window.addEventListener('resize', resize);
    resize();
    setupEvents();
    initMenu();
    loadQ(0);
    requestAnimationFrame(animate);
};

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
        handleMove(e);
    };
    const move = (e) => { if(isDrag) handleMove(e); };
    const end = () => { isDrag = false; };

    cvs.addEventListener('mousedown', start);
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', end);
    
    cvs.addEventListener('touchstart', (e) => { e.preventDefault(); start(e); }, {passive: false});
    cvs.addEventListener('touchmove', (e) => { e.preventDefault(); move(e); }, {passive: false});
    cvs.addEventListener('touchend', end);
}

function handleMove(e) {
    let clientX = e.clientX || (e.touches ? e.touches[0].clientX : 0);
    let rect = cvs.getBoundingClientRect();
    px = (clientX - rect.left - ox) / scale;
    px = Math.max(-10, Math.min(10, px));
    document.getElementById('mainX').value = px;
    updateGame();
}

function updateFromSlider() {
    px = parseFloat(document.getElementById('mainX').value);
    updateGame();
}

function manual() {
    cf[0] = parseFloat(document.getElementById('mA').value);
    cf[1] = parseFloat(document.getElementById('mB').value);
    cf[2] = parseFloat(document.getElementById('mC').value);
    cf[3] = parseFloat(document.getElementById('mD').value);
    updateGame();
}

/* --- לוגיקה מתמטית --- */
function f(x) { return cf[0]*x**3 + cf[1]*x**2 + cf[2]*x + cf[3]; }
function df(x) { return 3*cf[0]*x**2 + 2*cf[1]*x + cf[2]; }

function formatPoly(a, b, c, d) {
    // בונה מחרוזת פונקציה יפה
    let terms = [];
    if (Math.abs(a) > 0.001) terms.push(`${Number(a.toFixed(2))}x³`);
    if (Math.abs(b) > 0.001) terms.push(`${Number(b.toFixed(2))}x²`);
    if (Math.abs(c) > 0.001) terms.push(`${Number(c.toFixed(2))}x`);
    if (Math.abs(d) > 0.001 || terms.length === 0) terms.push(`${Number(d.toFixed(2))}`);
    
    let str = terms.join(" + ").replace(/\+ -/g, "- ");
    return "y = " + str;
}

function formatDeriv(a, b, c) {
    let terms = [];
    let da = 3*a, db = 2*b, dc = c;
    if (Math.abs(da) > 0.001) terms.push(`${Number(da.toFixed(2))}x²`);
    if (Math.abs(db) > 0.001) terms.push(`${Number(db.toFixed(2))}x`);
    if (Math.abs(dc) > 0.001 || terms.length === 0) terms.push(`${Number(dc.toFixed(2))}`);
    
    let str = terms.join(" + ").replace(/\+ -/g, "- ");
    return "f'(x) = " + str;
}

function updateGame() {
    // עדכון סליידרים
    document.getElementById('valA').innerText = cf[0];
    document.getElementById('valB').innerText = cf[1];
    document.getElementById('valC').innerText = cf[2];
    document.getElementById('valD').innerText = cf[3];

    // עדכון משוואות למעלה
    document.getElementById('eqn').innerText = formatPoly(cf[0], cf[1], cf[2], cf[3]);
    document.getElementById('derivEqn').innerText = formatDeriv(cf[0], cf[1], cf[2]);

    checkWinCondition();
    draw();
}

function checkWinCondition() {
    let q = bagrutData[currentQ];
    let dist = 100;
    let m = df(px);
    let y = f(px);
    
    if (q.goal === 'min_point') {
        let d2 = 6*cf[0]*px + 2*cf[1];
        dist = Math.abs(m) + (d2 > 0 ? 0 : 5);
    } 
    else if (q.goal === 'y_intercept') dist = Math.abs(px);
    else if (q.goal === 'slope_zero') dist = Math.abs(m);
    else if (q.goal === 'tan_pass_origin') dist = Math.abs(y - m*px);
    else if (q.goal === 'param_touch_x') {
        let vertexX = -cf[2]/(2*cf[1] || 1); 
        dist = Math.abs(f(vertexX));
    }
    else if (q.goal === 'triangle_area') {
        let xInt = px - y/m;
        let yInt = y - m*px;
        let area = 0.5 * Math.abs(xInt * yInt);
        dist = Math.abs(area - q.targetVal);
    }
    
    let p = Math.max(0, Math.min(100, (1 - dist/3) * 100));
    document.getElementById('proximityBar').style.width = p + "%";
    
    if (dist < 0.15) {
        let banner = document.getElementById('successBanner');
        if (!banner.classList.contains('show')) {
            banner.classList.add('show');
            playTone(600, 0.1);
            setTimeout(() => playTone(800, 0.3), 150);
        }
    } else {
        document.getElementById('successBanner').classList.remove('show');
    }
}

/* --- ציור וגרפיקה --- */

function draw() {
    ctx.clearRect(0, 0, W, H);
    drawGrid();
    
    let y = f(px);
    let m = df(px);
    
    drawTriangle(px, y, m); // משולש עם הצירים

    // ציור הפונקציה
    ctx.beginPath();
    ctx.strokeStyle = "#2563eb";
    ctx.lineWidth = 3;
    for (let i = 0; i <= W; i += 4) {
        let realX = (i - ox) / scale;
        let realY = f(realX);
        let screenY = oy - realY * scale;
        if (i === 0) ctx.moveTo(i, screenY);
        else ctx.lineTo(i, screenY);
    }
    ctx.stroke();
    
    drawTangent(px, y, m);
    drawNormal(px, y, m); // הוספנו את הנורמל
    drawRightAngleMarker(px, y, m); // הוספנו את הזווית
    
    // הנקודה עצמה
    let sx = ox + px * scale;
    let sy = oy - y * scale;
    ctx.fillStyle = "#2563eb";
    ctx.beginPath();
    ctx.arc(sx, sy, 6, 0, Math.PI*2);
    ctx.fill();
    ctx.strokeStyle = "white";
    ctx.lineWidth = 2;
    ctx.stroke();

    updateTrinityDisplay(px, y, m);
}

function drawGrid() {
    ctx.strokeStyle = "#e2e8f0";
    ctx.lineWidth = 1;
    ctx.beginPath();
    for(let x=ox%scale; x<W; x+=scale) { ctx.moveTo(x,0); ctx.lineTo(x,H); }
    for(let y=oy%scale; y<H; y+=scale) { ctx.moveTo(0,y); ctx.lineTo(W,y); }
    ctx.stroke();
    
    ctx.strokeStyle = "#94a3b8";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, oy); ctx.lineTo(W, oy);
    ctx.moveTo(ox, 0); ctx.lineTo(ox, H);
    ctx.stroke();
}

function drawTangent(x1, y1, m) {
    let sx = ox + x1 * scale;
    let sy = oy - y1 * scale;
    
    ctx.strokeStyle = "#f97316"; // כתום
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(sx - 1000, sy + 1000 * m); // שיפוע הפוך במסך
    ctx.lineTo(sx + 1000, sy - 1000 * m);
    ctx.stroke();
}

// פונקציה חדשה: ציור נורמל (אנך)
function drawNormal(x1, y1, m) {
    let sx = ox + x1 * scale;
    let sy = oy - y1 * scale;
    
    // שיפוע הנורמל הוא -1 חלקי m
    // אם m אפס (מקביל ל-X), הנורמל אנכי (שיפוע אינסוף)
    
    ctx.strokeStyle = "#d946ef"; // סגול
    ctx.setLineDash([5, 5]); // קו מקווקו
    ctx.lineWidth = 2;
    ctx.beginPath();

    if (Math.abs(m) < 0.001) {
        // משיק אופקי -> נורמל אנכי
        ctx.moveTo(sx, 0);
        ctx.lineTo(sx, H);
    } else {
        let mNorm = -1 / m;
        ctx.moveTo(sx - 1000, sy + 1000 * mNorm);
        ctx.lineTo(sx + 1000, sy - 1000 * mNorm);
    }
    
    ctx.stroke();
    ctx.setLineDash([]); // איפוס הקווקו
}

// פונקציה חדשה: סימון 90 מעלות
function drawRightAngleMarker(x1, y1, m) {
    let sx = ox + x1 * scale;
    let sy = oy - y1 * scale;
    let size = 12; // גודל הריבוע
    
    // זווית המשיק ברדיאנים (חשוב: Y הפוך בקנבס, אז הופכים סימן)
    let angle = Math.atan(-m);
    
    ctx.beginPath();
    ctx.strokeStyle = "#64748b";
    ctx.lineWidth = 1.5;
    
    // חישוב 3 נקודות ליצירת הריבוע "באוויר"
    // זזים לאורך המשיק
    let p1x = sx + size * Math.cos(angle);
    let p1y = sy + size * Math.sin(angle);
    
    // זזים לאורך הנורמל (90 מעלות = pi/2)
    let p2x = sx + size * Math.cos(angle - Math.PI/2);
    let p2y = sy + size * Math.sin(angle - Math.PI/2);
    
    // הנקודה הרחוקה שסוגרת את הריבוע
    let p3x = p1x + (p2x - sx);
    let p3y = p1y + (p2y - sy);
    
    ctx.moveTo(p1x, p1y);
    ctx.lineTo(p3x, p3y);
    ctx.lineTo(p2x, p2y);
    ctx.stroke();
}

function drawTriangle(x1, y1, m) {
    if(Math.abs(m) < 0.01) return;
    
    let xInt = x1 - (y1 / m);
    let yInt = y1 - (m * x1);
    
    ctx.beginPath();
    ctx.moveTo(ox, oy);
    ctx.lineTo(ox + xInt * scale, oy);
    ctx.lineTo(ox, oy - yInt * scale);
    ctx.closePath();
    
    ctx.fillStyle = "rgba(37, 99, 235, 0.1)";
    ctx.fill();
}

function updateTrinityDisplay(x, y, m) {
    const tooltip = document.getElementById('holyTrinity');
    
    // עדכון טקסטים
    document.getElementById('valX').innerText = `x = ${x.toFixed(2)}`;
    document.getElementById('valY').innerText = `y = ${y.toFixed(2)}`;
    document.getElementById('valM').innerText = `m = ${m.toFixed(2)}`;
    
    let b = y - m * x;
    let sign = b >= 0 ? "+" : "";
    document.getElementById('lineEqn').innerText = `משיק: y = ${m.toFixed(2)}x ${sign} ${b.toFixed(2)}`;
    
    // מיקום
    let sx = ox + x * scale;
    let sy = oy - y * scale;
    
    tooltip.style.left = sx + 'px';
    tooltip.style.top = sy + 'px';
    tooltip.style.display = 'flex';
}

/* --- ניהול --- */
function initMenu() {
    let sel = document.getElementById('qSelect');
    sel.innerHTML = "";
    bagrutData.forEach((q, i) => {
        let opt = document.createElement('option');
        opt.value = i;
        opt.text = q.t;
        sel.appendChild(opt);
    });
}

function loadQ(idx) {
    currentQ = idx;
    let q = bagrutData[idx];
    document.getElementById('qSelect').value = idx;
    document.getElementById('qCounter').innerText = `שאלה ${idx+1}`;
    document.getElementById('qText').innerText = q.d;
    
    cf = [...q.p];
    document.getElementById('mA').value = cf[0];
    document.getElementById('mB').value = cf[1];
    document.getElementById('mC').value = cf[2];
    document.getElementById('mD').value = cf[3];
    
    px = -1;
    document.getElementById('mainX').value = px;
    updateGame();
}

function loadQuestionFromSelect() {
    loadQ(parseInt(document.getElementById('qSelect').value));
}

function nextQuestion() {
    if (currentQ < bagrutData.length - 1) loadQ(currentQ + 1);
}

/* --- אודיו --- */
function initAudio() {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
}

function toggleMute() {
    isMuted = !isMuted;
    document.getElementById('btnSound').innerText = isMuted ? "🔇" : "🔊";
}

function playTone(freq, duration) {
    if (isMuted || !audioCtx) return;
    let osc = audioCtx.createOscillator();
    let gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
    osc.start();
    osc.stop(audioCtx.currentTime + duration);
}

function animate() {
    // requestAnimationFrame(animate); 
}

function zoomIn() { scale *= 1.1; draw(); }
function zoomOut() { scale /= 1.1; draw(); }
function resetZoom() { scale = baseScale; draw(); }
