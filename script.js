/* script.js - גרסת המעבדה המתקדמת: שלשה קדושה, משולשים ופרמטרים */

const bagrutData = [
    { t: "מינימום", d: "מצאו את נקודת המינימום של הפונקציה.", p: [0, 1, -4, 4], goal: 'm0_min' },
    { t: "חיתוך ציר Y", d: "מצאו את נקודת החיתוך עם ציר ה-Y.", p: [0, 1, -2, -3], goal: 'x0' },
    { t: "משיק לראשית", d: "מצאו נקודה שהמשיק דרכה עובר ב-(0,0).", p: [0, -1, 4, 0], goal: 'tan_pass', target: [0,0] },
    { t: "נורמל לראשית", d: "מצאו נקודה שהנורמל עובר ב-(0,0).", p: [0, 1, -4, 4], goal: 'norm_pass', target: [0,0] },

    
    // שאלות פרמטרים חדשות
    { 
        t: "פרמטר k - השקה", 
        d: "שנו את הפרמטר k (הזחלן d) כך שהפרבולה $f(x)=x^2+k$ תשיק לציר ה-X.", 
        p: [0, 1, 0, 5], goal: 'param_k', targetVal: 0, paramIdx: 3 
    },
    { 
        t: "פרמטר a - קודקוד", 
        d: "שנו את a כך שקודקוד הפרבולה $f(x)=ax^2-4x+1$ יהיה ב-y=-3.", 
        p: [1, 0, -4, 1], goal: 'param_a', targetVal: -3, paramIdx: 0 
    },
    { 
        t: "פרמטר k - שיפוע", 
        d: "מצאו k כך שהשיפוע של $f(x)=x^3+kx$ בנקודה x=1 יהיה בדיוק 0.", 
        p: [1, 0, 5, 0], goal: 'param_k_slope', targetVal: 0, paramIdx: 2 
    }
];

let cvs, ctx, W, H, mainArea;
let baseScale = 45, scale = 45;
let ox, oy, px = 0, cf = [0,1,0,0], goal = '';
let isDrag = false, audioCtx = null, isMuted = false;

window.onload = () => {
    cvs = document.getElementById('cvs');
    ctx = cvs.getContext('2d');
    mainArea = document.getElementById('mainArea');
    window.addEventListener('resize', resize);
    
    // מאזיני עכבר ומגע
    const startEv = (e) => { isDrag = true; initAudio(); moveEv(e); playTone(150, 0.05); };
    const moveEv = (e) => {
        if(!isDrag) return;
        let rect = cvs.getBoundingClientRect();
        let clientX = e.clientX || (e.touches ? e.touches[0].clientX : 0);
        px = (clientX - rect.left - ox) / scale;
        px = Math.max(-10, Math.min(10, px));
        if(Math.abs(px) < 0.08) px = 0;
        document.getElementById('mainX').value = px;
        update();
    };
    const endEv = () => { isDrag = false; };

    cvs.addEventListener('mousedown', startEv);
    window.addEventListener('mousemove', moveEv);
    window.addEventListener('mouseup', endEv);
    cvs.addEventListener('touchstart', (e) => { e.preventDefault(); startEv(e); }, {passive:false});
    cvs.addEventListener('touchmove', (e) => { e.preventDefault(); moveEv(e); }, {passive:false});
    cvs.addEventListener('touchend', endEv);

    initMenu();
    resize();
    loadQ(0);
};

function initMenu() {
    let sel = document.getElementById('qSelect');
    bagrutData.forEach((q, i) => {
        let opt = document.createElement('option');
        opt.value = i; opt.text = `${i+1}. ${q.t}`;
        sel.appendChild(opt);
    });
}

function loadQuestionFromSelect() { loadQ(parseInt(document.getElementById('qSelect').value)); }
function nextQuestion() {
    let next = parseInt(document.getElementById('qSelect').value) + 1;
    if(next < bagrutData.length) {
        document.getElementById('qSelect').value = next;
        loadQ(next);
    }
}

function loadQ(idx) {
    let q = bagrutData[idx];
    document.getElementById('qText').innerHTML = q.d;
    document.getElementById('qCounter').innerText = `שאלה ${idx+1} / ${bagrutData.length}`;
    document.getElementById('successBanner').classList.remove('show');
    cf = [...q.p];
    document.getElementById('mA').value = cf[0];
    document.getElementById('mB').value = cf[1];
    document.getElementById('mC').value = cf[2];
    document.getElementById('mD').value = cf[3];
    goal = q.goal;
    px = 2; 
    update();
}

function manual() {
    cf[0] = parseFloat(document.getElementById('mA').value);
    cf[1] = parseFloat(document.getElementById('mB').value);
    cf[2] = parseFloat(document.getElementById('mC').value);
    cf[3] = parseFloat(document.getElementById('mD').value);
    update();
}

function update() {
    // עדכון תצוגת מספרים
    document.getElementById('valA').innerText = cf[0];
    document.getElementById('valB').innerText = cf[1];
    document.getElementById('valC').innerText = cf[2];
    document.getElementById('valD').innerText = cf[3];
    
    let y = f(px), m = df(px);
    updateTrinityDisplay(px, y, m);
    
    let dist = calcDist(y, m);
    updateProximity(dist);
    checkWin(dist);
    draw();
}

function f(x) { return cf[0]*x**3 + cf[1]*x**2 + cf[2]*x + cf[3]; }
function df(x) { return 3*cf[0]*x**2 + 2*cf[1]*x + cf[2]; }

/* --- השלשה הקדושה והמשולש --- */
function updateTrinityDisplay(x, y, m) {
    const tooltip = document.getElementById('holyTrinity');
    const elX = document.getElementById('valX');
    const elY = document.getElementById('valY');
    const elM = document.getElementById('valM');
    const elLine = document.getElementById('lineEqn');

    tooltip.style.display = 'flex';
    elX.innerHTML = `x = ${x.toFixed(2)}`;
    elY.innerHTML = `y = ${y.toFixed(2)}`;
    elM.innerHTML = `m = ${m.toFixed(2)}`;
    
    let b = y - m * x;
    elLine.innerHTML = `משיק: y = ${m.toFixed(1)}x ${b>=0?'+':''}${b.toFixed(1)}`;

    let sx = ox + x * scale;
    let sy = oy - y * scale;
    tooltip.style.left = (sx + 20) + 'px';
    tooltip.style.top = (sy - 100) + 'px';
}

function drawTriangle(x, y, m) {
    if(Math.abs(m) < 0.05) return;
    let xInt = x - (y / m);
    let yInt = y - (m * x);

    ctx.beginPath();
    ctx.moveTo(ox, oy);
    ctx.lineTo(ox + xInt * scale, oy);
    ctx.lineTo(ox, oy - yInt * scale);
    ctx.closePath();
    ctx.fillStyle = "rgba(59, 130, 246, 0.15)";
    ctx.fill();
    ctx.strokeStyle = "rgba(37, 99, 235, 0.4)";
    ctx.stroke();
}

/* --- לוגיקת מרחק וניצחון --- */
function calcDist(y, m) {
    let q = bagrutData[document.getElementById('qSelect').value];
    if(goal === 'm0_min') return Math.abs(m) + ( (6*cf[0]*px+2*cf[1]) < 0 ? 5 : 0);
    if(goal === 'tan_pass') return Math.abs(y - m*px);
    if(goal === 'norm_pass') {
        let nm = -1/m; return Math.abs(y - nm*px);
    }
    // לוגיקת פרמטרים
    if(goal === 'param_k') return Math.abs(f(-cf[2]/(2*cf[1]||1))); // השקה לציר X
    if(goal === 'param_a') {
        let vx = -cf[2]/(2*cf[0]||1);
        return Math.abs(f(vx) - q.targetVal);
    }
    if(goal === 'param_k_slope') return Math.abs(df(1) - q.targetVal);
    
    return Math.abs(px); // ברירת מחדל חיתוך ציר Y
}

function checkWin(dist) {
    let win = dist < 0.1;
    let banner = document.getElementById('successBanner');
    if(win && !banner.classList.contains('show')) {
        banner.classList.add('show');
        playTone(600, 0.1); setTimeout(()=>playTone(800, 0.2), 100);
    } else if(!win) {
        banner.classList.remove('show');
    }
}

/* --- גרפיקה --- */
function draw() {
    ctx.clearRect(0,0,W,H);
    
    // גריד וצירים
    ctx.strokeStyle = "#e2e8f0"; ctx.beginPath();
    for(let x=ox%scale; x<W; x+=scale) { ctx.moveTo(x,0); ctx.lineTo(x,H); }
    for(let y=oy%scale; y<H; y+=scale) { ctx.moveTo(0,y); ctx.lineTo(W,y); }
    ctx.stroke();

    ctx.strokeStyle = "#94a3b8"; ctx.lineWidth = 2; ctx.beginPath();
    ctx.moveTo(0, oy); ctx.lineTo(W, oy); ctx.moveTo(ox, 0); ctx.lineTo(ox, H);
    ctx.stroke();

    let y = f(px), m = df(px);
    drawTriangle(px, y, m);

    // גרף הפונקציה
    ctx.strokeStyle = "#3b82f6"; ctx.lineWidth = 3; ctx.beginPath();
    for(let i=0; i<=W; i+=2) {
        let xx = (i - ox) / scale;
        let yy = oy - f(xx) * scale;
        if(i===0) ctx.moveTo(i, yy); else ctx.lineTo(i, yy);
    }
    ctx.stroke();

    // משיק
    let cx = ox + px * scale, cy = oy - y * scale;
    ctx.strokeStyle = "#f97316"; ctx.lineWidth = 2; ctx.beginPath();
    ctx.moveTo(cx - 500, cy + 500*m); ctx.lineTo(cx + 500, cy - 500*m);
    ctx.stroke();

    // הנקודה
    ctx.fillStyle = "#2563eb"; ctx.beginPath();
    ctx.arc(cx, cy, 7, 0, Math.PI*2); ctx.fill();
}

/* --- צלילים ומערכת --- */
function initAudio() { if(!audioCtx) audioCtx = new AudioContext(); }
function playTone(freq, dur) {
    if(isMuted || !audioCtx) return;
    let osc = audioCtx.createOscillator();
    let g = audioCtx.createGain();
    osc.connect(g); g.connect(audioCtx.destination);
    osc.frequency.value = freq;
    g.gain.setValueAtTime(0.1, audioCtx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + dur);
    osc.start(); osc.stop(audioCtx.currentTime + dur);
}

function updateProximity(dist) {
    let p = Math.max(0, Math.min(100, (1 - dist/5)*100));
    document.getElementById('proximityBar').style.width = p + "%";
}

function resize() {
    W = cvs.width = mainArea.clientWidth;
    H = cvs.height = mainArea.clientHeight;
    ox = W/2; oy = H/2 + 50;
    draw();
}

function toggleMute() {
    isMuted = !isMuted;
    document.getElementById('btnSound').innerText = isMuted ? "🔇" : "🔊";
}

function zoomIn() { scale *= 1.2; draw(); }
function zoomOut() { scale /= 1.2; draw(); }
function resetZoom() { scale = baseScale; draw(); }
