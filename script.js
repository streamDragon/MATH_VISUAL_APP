/* script.js - גרסה סופית ומלאה */

// נתוני השאלות - כולל שלבים ופרמטרים
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
        p: [-1, 3, 0, -2], // -x^3 + 3x^2 ...
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
        p: [0, 1, 0, 2], // התחלה ב y=x^2+2
        goal: 'param_touch_x',
        paramIdx: 3, // שולט על d
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
    
    // התאמה לגודל מסך
    window.addEventListener('resize', resize);
    resize();

    // אירועי עכבר/מגע
    setupEvents();
    
    // טעינת רשימת שאלות
    initMenu();
    
    // התחלת שאלה ראשונה
    loadQ(0);
    
    // לולאת ציור ראשונית
    requestAnimationFrame(animate);
};

function resize() {
    W = cvs.width = mainArea.clientWidth;
    H = cvs.height = mainArea.clientHeight;
    ox = W / 2;
    oy = H / 2 + 50; // קצת למטה מהאמצע
    draw();
}

function setupEvents() {
    // גרירה בקנבס
    const start = (e) => { 
        isDrag = true; 
        initAudio(); 
        handleMove(e);
        playTone(200, 0.05); 
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
    
    // המרה מפיקסלים לקואורדינטות מתמטיות
    px = (clientX - rect.left - ox) / scale;
    
    // גבולות
    px = Math.max(-10, Math.min(10, px));
    
    // סנכרון סליידר תחתון
    document.getElementById('mainX').value = px;
    
    updateGame();
}

// עדכון מהסליידר התחתון
function updateFromSlider() {
    px = parseFloat(document.getElementById('mainX').value);
    updateGame();
}

// עדכון זחלנים ידני (פרמטרים)
function manual() {
    cf[0] = parseFloat(document.getElementById('mA').value);
    cf[1] = parseFloat(document.getElementById('mB').value);
    cf[2] = parseFloat(document.getElementById('mC').value);
    cf[3] = parseFloat(document.getElementById('mD').value);
    updateGame();
}

/* --- לוגיקת משחק --- */

function f(x) { return cf[0]*x**3 + cf[1]*x**2 + cf[2]*x + cf[3]; }
function df(x) { return 3*cf[0]*x**2 + 2*cf[1]*x + cf[2]; }

function updateGame() {
    // עדכון תצוגה מספרית של המקדמים
    document.getElementById('valA').innerText = cf[0];
    document.getElementById('valB').innerText = cf[1];
    document.getElementById('valC').innerText = cf[2];
    document.getElementById('valD').innerText = cf[3];

    // עדכון משוואות בכותרת
    let eqStr = "y = ";
    if(cf[0]) eqStr += `${cf[0]}x³ + `;
    if(cf[1]) eqStr += `${cf[1]}x² + `;
    if(cf[2]) eqStr += `${cf[2]}x + `;
    eqStr += cf[3];
    document.getElementById('eqn').innerText = eqStr.replace(/\+ -/g, '- ').replace(/\+ 0x.?/g, '');
    
    document.getElementById('derivEqn').innerText = `f'(x) = ${(3*cf[0]).toFixed(1)}x² + ${(2*cf[1]).toFixed(1)}x + ${cf[2]}`;

    // חישוב מרחק ליעד
    checkWinCondition();
    
    // ציור מחדש
    draw();
}

function checkWinCondition() {
    let q = bagrutData[currentQ];
    let dist = 100;
    let m = df(px);
    let y = f(px);
    
    if (q.goal === 'min_point') {
        // גם נגזרת 0 וגם נגזרת שנייה חיובית
        let d2 = 6*cf[0]*px + 2*cf[1];
        dist = Math.abs(m) + (d2 > 0 ? 0 : 5);
    } 
    else if (q.goal === 'y_intercept') {
        dist = Math.abs(px - 0);
    }
    else if (q.goal === 'slope_zero') {
        dist = Math.abs(m);
    }
    else if (q.goal === 'tan_pass_origin') {
        // משוואת משיק: Y - y1 = m(X - x1) -> עבור (0,0): -y1 = -m*x1
        dist = Math.abs(y - m*px);
    }
    else if (q.goal === 'param_touch_x') {
        // בדיקה אם ה-Y בנקודת הקיצון קרוב ל-0
        let vertexX = -cf[2]/(2*cf[1] || 1); 
        dist = Math.abs(f(vertexX));
    }
    
    // עדכון מד קרבה
    let p = Math.max(0, Math.min(100, (1 - dist/3) * 100));
    document.getElementById('proximityBar').style.width = p + "%";
    
    // ניצחון
    let banner = document.getElementById('successBanner');
    if (dist < 0.15) {
        if (!banner.classList.contains('show')) {
            banner.classList.add('show');
            playTone(600, 0.1);
            setTimeout(() => playTone(800, 0.3), 150);
        }
    } else {
        banner.classList.remove('show');
    }
}

/* --- ציור --- */

function draw() {
    ctx.clearRect(0, 0, W, H);
    
    drawGrid();
    
    let y = f(px);
    let m = df(px);
    
    // ציור המשולש שנוצר עם הצירים
    drawTriangle(px, y, m);

    // ציור הפונקציה
    ctx.beginPath();
    ctx.strokeStyle = "#2563eb";
    ctx.lineWidth = 3;
    for (let i = 0; i <= W; i += 5) {
        let realX = (i - ox) / scale;
        let realY = f(realX);
        let screenY = oy - realY * scale;
        if (i === 0) ctx.moveTo(i, screenY);
        else ctx.lineTo(i, screenY);
    }
    ctx.stroke();
    
    // ציור משיק
    drawTangent(px, y, m);
    
    // עדכון השלשה הקדושה
    updateTrinityDisplay(px, y, m);
}

function drawGrid() {
    ctx.strokeStyle = "#e2e8f0";
    ctx.lineWidth = 1;
    ctx.beginPath();
    // אנכיים
    for(let x=ox%scale; x<W; x+=scale) { ctx.moveTo(x,0); ctx.lineTo(x,H); }
    // אופקיים
    for(let y=oy%scale; y<H; y+=scale) { ctx.moveTo(0,y); ctx.lineTo(W,y); }
    ctx.stroke();
    
    // צירים ראשיים
    ctx.strokeStyle = "#94a3b8";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, oy); ctx.lineTo(W, oy);
    ctx.moveTo(ox, 0); ctx.lineTo(ox, H);
    ctx.stroke();
}

function drawTangent(x1, y1, m) {
    let screenX = ox + x1 * scale;
    let screenY = oy - y1 * scale;
    
    ctx.strokeStyle = "#f97316"; // כתום
    ctx.lineWidth = 2;
    ctx.beginPath();
    // מצייר קו באורך 1000 פיקסלים לכל כיוון לפי השיפוע
    // שיפוע במסך הוא שלילי כי Y הפוך
    ctx.moveTo(screenX - 1000, screenY + 1000 * m);
    ctx.lineTo(screenX + 1000, screenY - 1000 * m);
    ctx.stroke();
    
    // הנקודה עצמה
    ctx.fillStyle = "#2563eb";
    ctx.beginPath();
    ctx.arc(screenX, screenY, 6, 0, Math.PI*2);
    ctx.fill();
}

function drawTriangle(x1, y1, m) {
    // מגן מחלוקה ב-0
    if(Math.abs(m) < 0.01) return;
    
    // חיתוך עם ציר ה-X: y=0 => 0 = mx+b => x_int = x1 - y1/m
    let xInt = x1 - (y1 / m);
    // חיתוך עם ציר ה-Y: x=0 => y_int = y1 - m*x1
    let yInt = y1 - (m * x1);
    
    ctx.beginPath();
    ctx.moveTo(ox, oy); // ראשית
    ctx.lineTo(ox + xInt * scale, oy); // חיתוך X
    ctx.lineTo(ox, oy - yInt * scale); // חיתוך Y
    ctx.closePath();
    
    ctx.fillStyle = "rgba(37, 99, 235, 0.15)"; // כחול בהיר שקוף
    ctx.fill();
    ctx.strokeStyle = "rgba(37, 99, 235, 0.3)";
    ctx.setLineDash([5, 5]);
    ctx.stroke();
    ctx.setLineDash([]);
}

function updateTrinityDisplay(x, y, m) {
    const tooltip = document.getElementById('holyTrinity');
    const elX = document.getElementById('valX');
    const elY = document.getElementById('valY');
    const elM = document.getElementById('valM');
    const elLine = document.getElementById('lineEqn');

    // עדכון טקסט
    elX.innerText = `x = ${x.toFixed(2)}`;
    elY.innerText = `y = ${y.toFixed(2)}`;
    elM.innerText = `m = ${m.toFixed(2)}`;
    
    let b = y - m * x;
    let sign = b >= 0 ? "+" : "";
    elLine.innerText = `y = ${m.toFixed(2)}x ${sign} ${b.toFixed(2)}`;
    
    // עדכון מיקום
    // חשוב: המיקום הוא יחסי ל-mainArea בגלל position: relative ב-CSS
    let screenX = ox + x * scale;
    let screenY = oy - y * scale;
    
    tooltip.style.left = (screenX) + 'px';
    tooltip.style.top = (screenY - 15) + 'px';
    tooltip.style.display = 'flex';
}

/* --- ניהול שאלות --- */
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
    document.getElementById('qCounter').innerText = `שאלה ${idx+1} / ${bagrutData.length}`;
    document.getElementById('qText').innerText = q.d;
    
    // טעינת מקדמים
    cf = [...q.p];
    document.getElementById('mA').value = cf[0];
    document.getElementById('mB').value = cf[1];
    document.getElementById('mC').value = cf[2];
    document.getElementById('mD').value = cf[3];
    
    // איפוס מיקום שחקן
    px = -1;
    document.getElementById('mainX').value = px;
    
    updateGame();
}

function loadQuestionFromSelect() {
    loadQ(parseInt(document.getElementById('qSelect').value));
}

function nextQuestion() {
    if (currentQ < bagrutData.length - 1) {
        loadQ(currentQ + 1);
    }
}

/* --- מערכת סאונד פשוטה --- */
function initAudio() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
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
    
    osc.type = 'sine';
    osc.frequency.value = freq;
    
    gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
    
    osc.start();
    osc.stop(audioCtx.currentTime + duration);
}

function animate() {
    // כרגע הציור מבוסס אירועים, אבל אפשר להוסיף אנימציות רקע אם נרצה
    // requestAnimationFrame(animate);
}

/* --- זום --- */
function zoomIn() { scale *= 1.1; draw(); }
function zoomOut() { scale /= 1.1; draw(); }
function resetZoom() { scale = baseScale; draw(); }
