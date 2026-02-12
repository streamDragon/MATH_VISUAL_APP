/* --- נתונים ושאלות --- */
const questions = [
    // קטגוריה: בסיס
    { cat: "התחלה", t: "קודקוד הפרבולה", d: "הזיזו את X עד שתגיעו לנקודת המינימום (העמק).", p: [0, 1, -4, 4], goal: 'm0' },
    { cat: "התחלה", t: "חיתוך ציר X", d: "מצאו נקודה שבה הגרף נוגע בציר ה-X (גובה 0).", p: [0, 1, -2, -3], goal: 'y0' },
    
    // קטגוריה: שיפועים
    { cat: "שיפועים", t: "שיפוע חיובי", d: "מצאו נקודה שבה השיפוע הוא בדיוק 2.", p: [0, 0.5, 0, -2], goal: 'm2' },
    { cat: "שיפועים", t: "זווית 45 מעלות", d: "מצאו נקודה שבה השיפוע הוא 1.", p: [0, 0.25, 0, -1], goal: 'm1' },
    { cat: "שיפועים", t: "משיק בראשית", d: "גרמו לקו הכתום (המשיק) לעבור דרך נקודת האפס (0,0).", p: [0, 0.5, 0, 2], goal: 'tangent0' },

    // קטגוריה: מתקדם
    { cat: "מתקדם", t: "נקודת פיתול", d: "מצאו את הנקודה שבה הגרף משנה קעירות (במעלה שלישית).", p: [0.5, 0, 0, 0], goal: 'x0' },
    { cat: "מתקדם", t: "נורמל (אנך)", d: "הזיזו עד שהקו הסגול (האנך) יעבור בראשית הצירים.", p: [0, 1, 0, 2], goal: 'normal0' },
    { cat: "מתקדם", t: "ערך פונקציה", d: "מצאו נקודה שבה Y שווה בדיוק ל-3.", p: [0, 0.2, 0, 0], goal: 'y3' }
];

/* --- משתנים גלובליים --- */
let cvs, ctx, W, H;
let scale = 50; // זום התחלתי
let ox, oy; // מרכז צירים
let px = 0; // ערך ה-X הנוכחי
let cf = [0, 1, 0, 0]; // מקדמי הפונקציה
let curGoal = '';
let won = false;
let soundEnabled = true;
let isDragging = false;
let audioCtx = new (window.AudioContext || window.webkitAudioContext)();

/* --- אתחול --- */
window.onload = function() {
    cvs = document.getElementById('cvs');
    ctx = cvs.getContext('2d');
    
    initSelectMenu(); // בניית התפריט עם קטגוריות
    
    window.addEventListener('resize', resize);
    
    // אירועי עכבר ומגע
    cvs.addEventListener('mousedown', startDrag);
    window.addEventListener('mousemove', doDrag);
    window.addEventListener('mouseup', endDrag);
    cvs.addEventListener('touchstart', (e) => startDrag(e.touches[0]), {passive: false});
    cvs.addEventListener('touchmove', (e) => doDrag(e.touches[0]), {passive: false});
    cvs.addEventListener('touchend', endDrag);

    resize();
    loadQuestion(0);
};

/* --- לוגיקה ראשית --- */
function resize() {
    let p = cvs.parentElement.getBoundingClientRect();
    W = cvs.width = p.width;
    H = cvs.height = p.height;
    ox = W / 2;
    oy = H / 2 + 50;
    draw();
}

function f(x) { return cf[0]*x**3 + cf[1]*x**2 + cf[2]*x + cf[3]; }
function df(x) { return 3*cf[0]*x**2 + 2*cf[1]*x + cf[2]; }

function updateFromSlider() {
    if(!isDragging) {
        px = parseFloat(document.getElementById('mainX').value);
        updateAll();
    }
}

function startDrag(e) { isDragging = true; doDrag(e); }
function endDrag() { isDragging = false; }
function doDrag(e) {
    if (!isDragging) return;
    if(e.preventDefault) e.preventDefault(); // מניעת גלילה במובייל
    
    let rect = cvs.getBoundingClientRect();
    let x = (e.clientX - rect.left - ox) / scale;
    px = x;
    
    // עדכון הסליידר רק אם זה בטווח
    let sld = document.getElementById('mainX');
    if(px >= sld.min && px <= sld.max) sld.value = px;
    
    updateAll();
}

function updateAll() {
    // עדכון טקסטים
    document.getElementById('hX').innerText = px.toFixed(2);
    document.getElementById('hY').innerText = f(px).toFixed(2);
    document.getElementById('hM').innerText = df(px).toFixed(2);
    
    checkWinCondition();
    draw();
}

/* --- זום --- */
function changeZoom(factor) {
    scale *= factor;
    // הגבלת הזום שלא יהיה גדול מדי או קטן מדי
    scale = Math.max(20, Math.min(150, scale)); 
    draw();
}

/* --- שאלות וקטגוריות --- */
function initSelectMenu() {
    let select = document.getElementById('qSelect');
    let categories = {};
    
    // מיון לפי קטגוריות
    questions.forEach((q, index) => {
        if (!categories[q.cat]) categories[q.cat] = [];
        categories[q.cat].push({ ...q, index });
    });

    // יצירת ה-HTML של התפריט
    for (let cat in categories) {
        let group = document.createElement('optgroup');
        group.label = cat;
        categories[cat].forEach(q => {
            let opt = document.createElement('option');
            opt.value = q.index;
            opt.innerText = q.t;
            group.appendChild(opt);
        });
        select.appendChild(group);
    }
}

function loadQuestionFromSelect() {
    let idx = document.getElementById('qSelect').value;
    loadQuestion(idx);
}

function nextQuestion() {
    let select = document.getElementById('qSelect');
    let current = parseInt(select.value);
    if (current < questions.length - 1) {
        select.value = current + 1;
        loadQuestion(current + 1);
    }
}

function loadQuestion(idx) {
    let q = questions[idx];
    cf = [...q.p];
    curGoal = q.goal;
    won = false;
    
    // עדכון UI
    document.getElementById('qTitle').innerText = q.cat + ": " + q.t;
    document.getElementById('qDesc').innerText = q.d;
    document.getElementById('win').classList.remove('show');
    
    // איפוס סליידרים ידניים
    document.getElementById('mA').value = cf[0];
    document.getElementById('mB').value = cf[1];
    document.getElementById('mC').value = cf[2];
    document.getElementById('mD').value = cf[3];
    
    // מיקום התחלתי נוח
    px = (curGoal === 'x0') ? -3 : 2;
    document.getElementById('mainX').value = px;
    
    renderEquation();
    updateAll();
}

function manual() {
    cf = [
        parseFloat(document.getElementById('mA').value) || 0,
        parseFloat(document.getElementById('mB').value) || 0,
        parseFloat(document.getElementById('mC').value) || 0,
        parseFloat(document.getElementById('mD').value) || 0
    ];
    curGoal = ''; 
    document.getElementById('qTitle').innerText = "חקירה חופשית";
    document.getElementById('qDesc').innerText = "שנו את המקדמים וראו כיצד הגרף משתנה.";
    renderEquation();
    updateAll();
}

/* --- בדיקת ניצחון וסאונד --- */
function checkWinCondition() {
    if (!curGoal || won) return;
    
    let y = f(px), m = df(px), d = 10;
    
    switch(curGoal) {
        case 'm0': d = Math.abs(m); break;
        case 'm1': d = Math.abs(m - 1); break;
        case 'm2': d = Math.abs(m - 2); break;
        case 'y0': d = Math.abs(y); break;
        case 'y3': d = Math.abs(y - 3); break;
        case 'tangent0': d = Math.abs(y - m*px); break;
        case 'normal0': d = Math.abs(px + m*y); break;
        case 'x0': d = Math.abs(px); break;
    }
    
    let prox = document.getElementById('prox');
    if (d < 0.05) {
        won = true;
        document.getElementById('win').classList.add('show');
        playWinSound();
        prox.style.opacity = 0;
    } else {
        prox.style.opacity = (d < 2) ? 1 : 0;
        prox.innerText = d < 0.5 ? "לוהט! 🔥" : (d < 1.5 ? "מתחמם.. ☀️" : "");
    }
}

function renderEquation() {
    const fmt = (v, s) => v===0?"": (v===1 && s!==""?"": (v===-1 && s!==""?"-":v)) + s;
    let txt = [fmt(cf[0],"x³"), fmt(cf[1],"x²"), fmt(cf[2],"x"), cf[3]].filter(x=>x!=="").join(" + ").replace(/\+ -/g,"- ");
    document.getElementById('eqn').innerText = "y = " + (txt || "0");
}

/* --- ציור (Canvas) --- */
function draw() {
    ctx.clearRect(0,0,W,H);
    
    // גריד דינמי לפי זום
    ctx.strokeStyle = "#e2e8f0"; ctx.lineWidth = 1; ctx.beginPath();
    let startX = Math.floor(-ox/scale), endX = Math.ceil((W-ox)/scale);
    let startY = Math.floor((oy-H)/scale), endY = Math.ceil(oy/scale);
    
    for(let i=startX; i<=endX; i++) { ctx.moveTo(ox+i*scale, 0); ctx.lineTo(ox+i*scale, H); }
    for(let i=startY; i<=endY; i++) { ctx.moveTo(0, oy-i*scale); ctx.lineTo(W, oy-i*scale); }
    ctx.stroke();

    // צירים
    ctx.strokeStyle = "#94a3b8"; ctx.lineWidth = 2; ctx.beginPath();
    ctx.moveTo(0, oy); ctx.lineTo(W, oy); 
    ctx.moveTo(ox, 0); ctx.lineTo(ox, H); 
    ctx.stroke();

    // פונקציה
    ctx.strokeStyle = "#2563eb"; ctx.lineWidth = 3; ctx.beginPath();
    for (let x = startX - 1; x <= endX + 1; x += 0.05) {
        let gx = ox + x*scale, gy = oy - f(x)*scale;
        if(x === startX - 1) ctx.moveTo(gx, gy); else ctx.lineTo(gx, gy);
    }
    ctx.stroke();

    // משיק ונקודה
    let cx = ox + px*scale, cy = oy - f(px)*scale;
    let m = df(px);
    
    // משיק (כתום) - ארוך מאוד
    ctx.strokeStyle = "#f59e0b"; ctx.lineWidth = 2; ctx.beginPath();
    let L = Math.max(W,H);
    ctx.moveTo(cx - L, cy + L*m); ctx.lineTo(cx + L, cy - L*m);
    ctx.stroke();
    
    // נקודה
    ctx.fillStyle = "#2563eb"; ctx.beginPath(); ctx.arc(cx, cy, 6, 0, Math.PI*2); ctx.fill();
    ctx.strokeStyle = "white"; ctx.lineWidth = 2; ctx.stroke();
}

/* --- סאונד --- */
function toggleSound() {
    soundEnabled = !soundEnabled;
    document.getElementById('soundBtn').innerText = soundEnabled ? "🔊" : "🔈";
}
function playWinSound() {
    if(!soundEnabled) return;
    if(audioCtx.state === 'suspended') audioCtx.resume();
    [523, 659, 783, 1046].forEach((f, i) => {
        setTimeout(() => {
            let o = audioCtx.createOscillator(), g = audioCtx.createGain();
            o.connect(g); g.connect(audioCtx.destination);
            o.frequency.value = f; g.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
            o.start(); o.stop(audioCtx.currentTime + 0.3);
        }, i*100);
    });
}
