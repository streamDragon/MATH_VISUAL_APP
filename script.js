/* script.js - גרסה סופית עם 'המשולש הקדוש', מד התקדמות ושאלות מורחבות */

/* --- מאגר שאלות מורחב --- */
const bagrutData = [
    { cat: "חקירה", t: "מינימום", d: "מצאו את נקודת המינימום של הפונקציה.", p: [0, 1, -4, 4], goal: 'm0' },
    { cat: "חקירה", t: "חיתוך ציר Y", d: "מצאו את נקודת החיתוך עם ציר ה-Y.", p: [0, 1, -2, -3], goal: 'x0' },
    { cat: "נקודות קיצון", t: "מקסימום מקומי", d: "הביאו את הנקודה הכחולה לנקודת המקסימום.", p: [-1, 0, 12, 0], goal: 'm0' },
    { cat: "נקודות קיצון", t: "קודקוד פרבולה", d: "מצאו את קודקוד הפרבולה (נקודת המינימום).", p: [0, 1, -6, 5], goal: 'm0' },
    { cat: "צירים", t: "חיתוך ציר X", d: "מצאו נקודה בה הפונקציה חוצה את ציר ה-X.", p: [0, 1, 0, -9], goal: 'y0' },
    { cat: "משיקים", t: "שיפוע ספציפי", d: "הזיזו את הנקודה עד ששיפוע המשיק יהיה בדיוק 4.", p: [0, 1, 0, 0], goal: 'slope_val', targetVal: 4 },
    { cat: "משיקים", t: "משיק לראשית", d: "מצאו נקודה שהמשיק דרכה עובר ב-(0,0).", p: [0, -1, 4, 0], goal: 'tan_pass', target: [0,0] },
    { cat: "נורמל", t: "נורמל לראשית", d: "מצאו נקודה שהנורמל (המקווקו) עובר בראשית (0,0).", p: [0, 1, -4, 4], goal: 'norm_pass', target: [0,0] }
];

let questions = bagrutData;

/* --- משתנים גלובליים --- */
let cvs, ctx, W, H, mainArea;
let baseScale = 45, scale = 45;
let ox, oy, px = 0, cf = [0,1,0,0], goal = '';
let isDrag = false, audioCtx = null, isMuted = true;

window.onload = () => {
    cvs = document.getElementById('cvs');
    ctx = cvs.getContext('2d');
    mainArea = document.getElementById('mainArea');
    window.addEventListener('resize', resize);
    
    cvs.addEventListener('touchstart', e => start(e.touches[0]), {passive: false});
    cvs.addEventListener('touchmove', e => move(e.touches[0]), {passive: false});
    cvs.addEventListener('touchend', end);
    cvs.addEventListener('mousedown', start);
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', end);

    initMenu();
    resize();
    loadQ(0);
};

/* --- זום ומיקום --- */
function zoomIn() { scale = Math.min(scale * 1.2, 150); draw(); }
function zoomOut() { scale = Math.max(scale / 1.2, 10); draw(); }
function resetZoom() { scale = baseScale; ox = W/2; oy = H/2 + H*0.1; draw(); }

function resize() { 
    W = cvs.width = mainArea.clientWidth; 
    H = cvs.height = mainArea.clientHeight; 
    ox = W/2; oy = H/2 + H*0.1; 
    draw(); 
}

/* --- פונקציות מתמטיות --- */
function f(x) { return cf[0]*x**3 + cf[1]*x**2 + cf[2]*x + cf[3]; }
function df(x) { return 3*cf[0]*x**2 + 2*cf[1]*x + cf[2]; }

/* --- אינטראקציה --- */
function start(e) { isDrag = true; initAudio(); move(e); }
function end() { isDrag = false; }
function move(e) {
    if(!isDrag) return;
    let rect = cvs.getBoundingClientRect();
    px = (e.clientX - rect.left - ox) / scale;
    px = Math.max(-10, Math.min(10, px));
    if(Math.abs(px) < 0.05) px = 0;
    document.getElementById('mainX').value = px;
    update();
}

function updateFromSlider() { if(!isDrag) { px = parseFloat(document.getElementById('mainX').value); update(); } }

function update() {
    let y = f(px), m = df(px);
    let dist = calculateDistance(y, m);
    updateProximityBar(dist); // עדכון מד חם/קר
    checkWin(dist);
    draw();
}

/* חישוב מרחק והתקדמות */
function calculateDistance(y, m) {
    if(!goal) return 100;
    let q = questions[document.getElementById('qSelect').value];
    
    if(goal === 'm0') return Math.abs(m); 
    if(goal === 'y0') return Math.abs(y); 
    if(goal === 'x0') return Math.abs(px); 
    if(goal === 'slope_val') return Math.abs(m - q.targetVal);
    if(goal === 'tan_pass') {
        let predictedY = m * (q.target[0] - px) + y;
        return Math.abs(predictedY - q.target[1]);
    }
    if(goal === 'norm_pass') {
        let nm = (Math.abs(m) < 0.01) ? 1000 : -1/m;
        let val = (q.target[1] - y) - nm * (q.target[0] - px);
        return Math.abs(val);
    }
    return 100;
}

function updateProximityBar(dist) {
    let bar = document.getElementById('proximityBar');
    // המרת המרחק לאחוזים (0 עד 100). ככל שהמרחק קטן (קרוב ל-0), האחוז גבוה.
    let percentage = Math.max(0, Math.min(100, (1 - dist / 5) * 100));
    
    if (dist < 0.15) percentage = 100; // ניצחון = מלא
    
    bar.style.width = percentage + "%";
}

function checkWin(dist) {
    let win = dist < 0.15;
    let badge = document.getElementById('successBanner');
    if(win) {
        if(!badge.classList.contains('show')) playWinSound();
        badge.classList.add('show');
    } else {
        badge.classList.remove('show');
    }
}

/* --- ציור --- */
function draw() {
    ctx.clearRect(0,0,W,H);
    
    // רשת צירים
    ctx.strokeStyle = "#e2e8f0"; ctx.lineWidth = 1; ctx.beginPath();
    for(let x=ox%scale; x<W; x+=scale) { ctx.moveTo(x,0); ctx.lineTo(x,H); }
    for(let x=ox%scale; x>0; x-=scale) { ctx.moveTo(x,0); ctx.lineTo(x,H); }
    for(let y=oy%scale; y<H; y+=scale) { ctx.moveTo(0,y); ctx.lineTo(W,y); }
    for(let y=oy%scale; y>0; y-=scale) { ctx.moveTo(0,y); ctx.lineTo(W,y); }
    ctx.stroke();
    
    ctx.strokeStyle = "#94a3b8"; ctx.lineWidth = 2; ctx.beginPath();
    ctx.moveTo(0,oy); ctx.lineTo(W,oy); ctx.moveTo(ox,0); ctx.lineTo(ox,H); ctx.stroke();
    
    // ציור פונקציה
    ctx.strokeStyle = "#2563eb"; ctx.lineWidth = 4; ctx.beginPath();
    for(let x=( -ox/scale ); x<=( (W-ox)/scale ); x+=0.02) {
        let cx=ox+x*scale, cy=oy-f(x)*scale;
        if(x === -ox/scale) ctx.moveTo(cx,cy); else ctx.lineTo(cx,cy);
    }
    ctx.stroke();
    
    let cx=ox+px*scale, cy=oy-f(px)*scale, m=df(px);
    
    // משיק / נורמל
    ctx.lineWidth = 2;
    if(goal === 'norm_pass') {
        ctx.strokeStyle="#a855f7"; ctx.setLineDash([5,5]);
        let nm = (Math.abs(m) < 0.01) ? 1000 : -1/m;
        ctx.beginPath(); ctx.moveTo(cx-1000, cy+1000*nm); ctx.lineTo(cx+1000, cy-1000*nm); ctx.stroke();
        ctx.setLineDash([]);
    } else {
        ctx.strokeStyle="#f97316"; ctx.beginPath();
        ctx.moveTo(cx-1000, cy+1000*m); ctx.lineTo(cx+1000, cy-1000*m); ctx.stroke();
    }
    
    // הנקודה
    ctx.fillStyle="#2563eb"; ctx.beginPath(); ctx.arc(cx,cy,8,0,7); ctx.fill();
    ctx.strokeStyle="white"; ctx.stroke();

    drawDataBox(cx, cy, px, f(px), m);
}

/* ציור 'המשולש הקדוש' עם כותרת */
function drawDataBox(cx, cy, x, y, m) {
    let boxW = 200, boxH = 140; // הוגדל קצת בשביל הכותרת
    let bx = cx + 20, by = cy - 150;
    if (bx + boxW > W) bx = cx - boxW - 20;
    if (by < 10) by = cy + 20;

    ctx.save();
    ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
    ctx.shadowBlur = 10; ctx.shadowColor = "rgba(0,0,0,0.1)";
    ctx.beginPath(); ctx.roundRect(bx, by, boxW, boxH, 12); ctx.fill();
    ctx.strokeStyle = "#94a3b8"; ctx.lineWidth = 1; ctx.stroke();
    ctx.restore();

    // כותרת המשולש הקדוש
    ctx.font = "bold 14px 'Rubik', sans-serif"; ctx.textAlign = "center";
    ctx.fillStyle = "#64748b";
    ctx.fillText("✨ המשולש הקדוש ✨", bx + boxW/2, by + 20);
    
    // קו הפרדה
    ctx.beginPath(); ctx.moveTo(bx+10, by+28); ctx.lineTo(bx+boxW-10, by+28);
    ctx.strokeStyle = "#e2e8f0"; ctx.stroke();

    // נתונים
    ctx.font = "bold 15px Consolas, monospace"; ctx.textAlign = "left";
    let pad = bx + 20, ty = by + 50;
    
    ctx.fillStyle = "#334155";
    ctx.fillText(`x     = ${x.toFixed(2)}`, pad, ty);
    ctx.fillStyle = "#2563eb";
    ctx.fillText(`f(x)  = ${y.toFixed(2)}`, pad, ty+25);
    ctx.fillStyle = "#ea580c";
    ctx.fillText(`f'(x) = ${m.toFixed(2)}`, pad, ty+50);
    
    // משוואת משיק למטה
    ctx.font = "12px sans-serif"; ctx.fillStyle = "#94a3b8";
    let b = y - m*x;
    let eqStr = `y = ${m.toFixed(1)}x ${b>=0?'+':''}${b.toFixed(1)}`;
    if(Math.abs(m) < 0.01) eqStr = `y = ${y.toFixed(1)}`; // ישר אופקי
    ctx.fillText(eqStr, pad, ty+75);
}

/* --- ניהול --- */
function initMenu() {
    let s = document.getElementById('qSelect');
    questions.forEach((q, i) => {
        let opt = document.createElement('option');
        opt.value = i; opt.innerText = `${q.cat}: ${q.t}`;
        s.appendChild(opt);
    });
}

function loadQ(i) {
    let q = questions[i];
    cf = [...q.p]; goal = q.goal;
    document.getElementById('qText').innerText = q.d;
    document.getElementById('qCounter').innerText = `שאלה ${parseInt(i)+1} / ${questions.length}`;
    
    ['mA','mB','mC','mD'].forEach((id,k)=> {
        document.getElementById(id).value = cf[k];
        document.getElementById(id.replace('m','val')).innerText = cf[k];
    });
    px = -2; update();
    updateEqText();
}

function loadQuestionFromSelect() { loadQ(document.getElementById('qSelect').value); }
function nextQuestion() { 
    let s = document.getElementById('qSelect');
    if(s.selectedIndex < questions.length - 1) {
        s.selectedIndex++;
        loadQ(s.selectedIndex);
    }
}

function manual() {
    cf = ['mA','mB','mC','mD'].map(id => {
        let v = parseFloat(document.getElementById(id).value);
        document.getElementById(id.replace('m','val')).innerText = v;
        return v;
    });
    goal = ''; document.getElementById('qText').innerText = "מצב חקירה חופשית";
    updateEqText(); update();
}

function updateEqText() {
    let txt = `y = ${cf[0]?cf[0]+"x³ ":""}${cf[1]?cf[1]+"x² ":""}${cf[2]?cf[2]+"x ":""}${cf[3]||"0"}`;
    document.getElementById('eqn').innerText = txt.replace(/\+ -/g, "- ");
    
    let da=3*cf[0], db=2*cf[1], dc=cf[2];
    let dTxt = `f'(x) = ${da?da+"x² ":""}${db?db+"x ":""}${dc||"0"}`;
    document.getElementById('derivEqn').innerText = dTxt.replace(/\+ -/g, "- ");
}

/* --- סאונד --- */
function initAudio() { if(!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)(); }
function playWinSound() {
    if(isMuted || !audioCtx) return;
    let n = [523, 659, 783, 1046];
    n.forEach((f, i) => {
        let o = audioCtx.createOscillator(), g = audioCtx.createGain();
        o.connect(g); g.connect(audioCtx.destination);
        o.frequency.value = f; g.gain.setValueAtTime(0.1, audioCtx.currentTime + i*0.1);
        o.start(audioCtx.currentTime + i*0.1); o.stop(audioCtx.currentTime + i*0.1 + 0.3);
    });
}
function toggleMute() { isMuted = !isMuted; document.getElementById('btnSound').innerText = isMuted ? "🔇" : "🔊"; }
