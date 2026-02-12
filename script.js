/* --- נתונים --- */
const questions = [
    { cat: "⭐ התחלה", t: "מינימום", d: "הזיזו את הנקודה הכחולה לתחתית העמק.", p: [0, 1, -4, 4], goal: 'm0' },
    { cat: "⭐ התחלה", t: "חיתוך X", d: "מצאו איפה הקו הכחול חוצה את הקו האפור (גובה 0).", p: [0, 1, -2, -3], goal: 'y0' },
    { cat: "📈 שיפוע", t: "שיפוע 2", d: "חפשו עליה חדה בגרף (שיפוע = 2).", p: [0, 0.5, 0, -2], goal: 'm2' },
    { cat: "📈 שיפוע", t: "משיק שטוח", d: "מצאו נקודה שבה המשיק הכתום מאוזן לגמרי.", p: [0.3, 0, -3, 0], goal: 'm0' },
    { cat: "🧠 אתגר", t: "נורמל לראשית", d: "כוון שהקו הסגול (האנך) יעבור בנקודה 0,0.", p: [0, 1, 0, 2], goal: 'normal0' }
];

/* --- משתנים --- */
let cvs, ctx, W, H, wrapper;
let scale = 40; // זום ברירת מחדל
let ox, oy;
let px = 0;
let cf = [0, 1, 0, 0];
let curGoal = '';
let isDragging = false;
let audioCtx = new (window.AudioContext || window.webkitAudioContext)();

/* --- אתחול --- */
window.onload = function() {
    cvs = document.getElementById('cvs');
    ctx = cvs.getContext('2d');
    wrapper = document.getElementById('cWrap');

    initSelect();
    
    // ניהול גודל ורספונסיביות
    window.addEventListener('resize', resize);
    resize(); // קריאה ראשונית
    
    // אירועי מגע ועכבר
    cvs.addEventListener('mousedown', startDrag);
    window.addEventListener('mousemove', doDrag);
    window.addEventListener('mouseup', endDrag);
    
    cvs.addEventListener('touchstart', (e) => startDrag(e.touches[0]), {passive: false});
    cvs.addEventListener('touchmove', (e) => doDrag(e.touches[0]), {passive: false});
    cvs.addEventListener('touchend', endDrag);

    loadQuestion(0);
};

/* --- ליבה --- */
function resize() {
    // לוקח את הגודל האמיתי של הקונטיינר הגמיש
    W = cvs.width = wrapper.clientWidth;
    H = cvs.height = wrapper.clientHeight;
    
    ox = W / 2;
    oy = H / 2 + (H * 0.1); // קצת מתחת לאמצע
    draw();
}

function f(x) { return cf[0]*x**3 + cf[1]*x**2 + cf[2]*x + cf[3]; }
function df(x) { return 3*cf[0]*x**2 + 2*cf[1]*x + cf[2]; }

function updateFromSlider() {
    if(!isDragging) {
        px = parseFloat(document.getElementById('mainX').value);
        updateUI();
    }
}

function startDrag(e) { isDragging = true; doDrag(e); }
function endDrag() { isDragging = false; }
function doDrag(e) {
    if (!isDragging) return;
    if(e.preventDefault) e.preventDefault();
    
    let rect = cvs.getBoundingClientRect();
    // חישוב מיקום עכבר ביחס לקנבס
    let x = (e.clientX - rect.left - ox) / scale;
    px = x;
    
    // עדכון סליידר רק אם בטווח
    let sld = document.getElementById('mainX');
    if(px >= sld.min && px <= sld.max) sld.value = px;
    
    updateUI();
}

function changeZoom(factor) {
    scale *= factor;
    scale = Math.max(10, Math.min(200, scale)); // גבולות זום
    draw();
}

/* --- ממשק --- */
function initSelect() {
    let s = document.getElementById('qSelect');
    let cats = {};
    questions.forEach((q, i) => {
        if(!cats[q.cat]) cats[q.cat] = [];
        cats[q.cat].push({i, t: q.t});
    });
    
    for(let c in cats) {
        let g = document.createElement('optgroup'); g.label = c;
        cats[c].forEach(o => {
            let op = document.createElement('option');
            op.value = o.i; op.innerText = o.t;
            g.appendChild(op);
        });
        s.appendChild(g);
    }
}

function loadQuestionFromSelect() {
    loadQuestion(document.getElementById('qSelect').value);
}
function nextQuestion() {
    let s = document.getElementById('qSelect');
    let idx = parseInt(s.value) + 1;
    if(idx < questions.length) {
        s.value = idx;
        loadQuestion(idx);
    }
}

function loadQuestion(idx) {
    let q = questions[idx];
    cf = [...q.p];
    curGoal = q.goal;
    
    document.getElementById('qTitle').innerText = q.cat + ": " + q.t;
    document.getElementById('qDesc').innerText = q.d;
    document.getElementById('win').classList.remove('show');
    
    // איפוס סליידרים ידניים
    ['mA','mB','mC','mD'].forEach((id, i) => document.getElementById(id).value = cf[i] || 0);

    px = (curGoal === 'x0') ? -3 : 2; 
    document.getElementById('mainX').value = px;
    
    updateUI();
}

function manual() {
    cf = [
        parseFloat(document.getElementById('mA').value)||0,
        parseFloat(document.getElementById('mB').value)||0,
        parseFloat(document.getElementById('mC').value)||0,
        parseFloat(document.getElementById('mD').value)||0
    ];
    curGoal = '';
    document.getElementById('qTitle').innerText = "עריכה חופשית";
    renderEquation();
    draw();
}

function updateUI() {
    document.getElementById('hX').innerText = px.toFixed(2);
    document.getElementById('hY').innerText = f(px).toFixed(2);
    document.getElementById('hM').innerText = df(px).toFixed(2);
    
    checkWin();
    renderEquation();
    draw();
}

function renderEquation() {
    // בניית מחרוזת פונקציה יפה
    const term = (v, x) => v===0?"": (v>0?" + ":" - ") + (Math.abs(v)===1 && x?"":Math.abs(v)) + x;
    let s = (term(cf[0],"x³") + term(cf[1],"x²") + term(cf[2],"x") + term(cf[3],"")).trim();
    if(s.startsWith("+")) s = s.substring(1);
    document.getElementById('eqn').innerText = "y = " + (s || "0");
}

function checkWin() {
    if(!curGoal) return;
    let y = f(px), m = df(px), d = 99;
    
    if(curGoal === 'm0') d = Math.abs(m);
    else if(curGoal === 'm2') d = Math.abs(m-2);
    else if(curGoal === 'y0') d = Math.abs(y);
    else if(curGoal === 'normal0') d = Math.abs(px + m*y);
    
    let fb = document.getElementById('prox');
    if(d < 0.1) {
        document.getElementById('win').classList.add('show');
        fb.style.opacity = 0;
    } else {
        fb.style.opacity = (d<2)?1:0;
        fb.innerText = d<0.5 ? "קרוב מאוד! 🔥" : "מתקרב...";
    }
}

/* --- ציור --- */
function draw() {
    ctx.clearRect(0,0,W,H);
    
    // רשת
    ctx.strokeStyle = "#e2e8f0"; ctx.lineWidth = 1; ctx.beginPath();
    for(let x=ox%scale; x<W; x+=scale) { ctx.moveTo(x,0); ctx.lineTo(x,H); }
    for(let y=oy%scale; y<H; y+=scale) { ctx.moveTo(0,y); ctx.lineTo(W,y); }
    ctx.stroke();
    
    // צירים
    ctx.strokeStyle = "#94a3b8"; ctx.lineWidth = 2; ctx.beginPath();
    ctx.moveTo(0,oy); ctx.lineTo(W,oy);
    ctx.moveTo(ox,0); ctx.lineTo(ox,H);
    ctx.stroke();
    
    // פונקציה
    ctx.strokeStyle = "#3b82f6"; ctx.lineWidth = 3; ctx.beginPath();
    let startX = -ox/scale, endX = (W-ox)/scale;
    for(let x=startX; x<=endX; x+=0.05) {
        let cx = ox + x*scale, cy = oy - f(x)*scale;
        if(x===startX) ctx.moveTo(cx,cy); else ctx.lineTo(cx,cy);
    }
    ctx.stroke();
    
    // משיק ונקודה
    let cx = ox + px*scale, cy = oy - f(px)*scale;
    let m = df(px);
    ctx.strokeStyle = "#f97316"; ctx.lineWidth = 2; ctx.beginPath(); // משיק כתום
    ctx.moveTo(cx - 1000, cy + 1000*m); ctx.lineTo(cx + 1000, cy - 1000*m);
    ctx.stroke();
    
    // אנך (אם צריך)
    if(curGoal === 'normal0') {
        ctx.strokeStyle = "#a855f7"; ctx.setLineDash([5,5]); ctx.beginPath();
        let nm = -1/m;
        ctx.moveTo(cx - 1000, cy + 1000*nm); ctx.lineTo(cx + 1000, cy - 1000*nm);
        ctx.stroke();
        ctx.setLineDash([]);
    }

    // נקודה כחולה
    ctx.fillStyle = "#2563eb"; ctx.beginPath(); 
    ctx.arc(cx, cy, 8, 0, Math.PI*2); 
    ctx.fill(); ctx.stroke();
}

function toggleSound() {
    // פונקציית סאונד פשוטה
    let btn = document.getElementById('soundBtn');
    btn.innerText = btn.innerText === '🔊' ? '🔇' : '🔊';
}
