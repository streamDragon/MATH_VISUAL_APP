/* script.js - גרסה מתוקנת (נגזרות, נורמל, ציר Y) */

/* --- שאלות ברירת מחדל --- */
const defaultQuestions = [
    { cat: "חקירה", t: "מינימום", d: "מצאו את נקודת המינימום.", p: [0, 1, -4, 4], goal: 'm0' },
    { cat: "חקירה", t: "חיתוך ציר Y", d: "מצאו את נקודת החיתוך עם ציר ה-Y.", p: [0, 1, -2, -3], goal: 'x0' } // הוספתי דוגמה לחיתוך Y
];

let questions = [];
if (typeof bagrutData !== 'undefined') questions = defaultQuestions.concat(bagrutData);
else questions = defaultQuestions;

/* --- משתנים --- */
let cvs, ctx, W, H, mainArea;
let scale = 45, ox, oy;
let px = 0, cf = [0,1,0,0], goal = '';
let isDrag = false;
let audioCtx = null, isMuted = true, lastClickTime = 0;

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

/* --- סאונד (ללא שינוי) --- */
function initAudio() { if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)(); if (audioCtx.state === 'suspended') audioCtx.resume(); }
function toggleMute() { initAudio(); isMuted = !isMuted; document.getElementById('btnSound').innerText = isMuted ? "🔇" : "🔊"; if(!isMuted) playUiClick(); }
function playUiClick() { if(isMuted || !audioCtx) return; let o=audioCtx.createOscillator(),g=audioCtx.createGain(); o.connect(g); g.connect(audioCtx.destination); o.type='sine'; o.frequency.setValueAtTime(800, audioCtx.currentTime); g.gain.setValueAtTime(0.1, audioCtx.currentTime); g.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime+0.1); o.start(); o.stop(audioCtx.currentTime+0.1); }
function playWinSound() { if(isMuted || !audioCtx) return; let now=audioCtx.currentTime, notes=[523.25, 659.25, 783.99, 1046.50]; notes.forEach((f,i)=>{ let o=audioCtx.createOscillator(),g=audioCtx.createGain(); o.connect(g); g.connect(audioCtx.destination); o.type='triangle'; o.frequency.value=f; g.gain.setValueAtTime(0, now+i*0.1); g.gain.linearRampToValueAtTime(0.1, now+i*0.1+0.05); g.gain.exponentialRampToValueAtTime(0.001, now+i*0.1+0.4); o.start(now+i*0.1); o.stop(now+i*0.1+0.5); }); }
function updateHotColdSound(dist) { if(isMuted || !audioCtx || !isDrag || dist>8) return; let interval=Math.max(60, dist*120); let now=Date.now(); if(now-lastClickTime>interval) { let o=audioCtx.createOscillator(),g=audioCtx.createGain(); o.connect(g); g.connect(audioCtx.destination); let p=600-(dist*50); o.type='square'; o.frequency.value=p; g.gain.setValueAtTime(0.03, audioCtx.currentTime); g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime+0.04); o.start(); o.stop(audioCtx.currentTime+0.04); lastClickTime=now; } }

/* --- לוגיקה --- */
function resize() { W=cvs.width=mainArea.clientWidth; H=cvs.height=mainArea.clientHeight; ox=W/2; oy=H/2+H*0.1; draw(); }
function f(x) { return cf[0]*x**3 + cf[1]*x**2 + cf[2]*x + cf[3]; }
function df(x) { return 3*cf[0]*x**2 + 2*cf[1]*x + cf[2]; }

function start(e) { isDrag=true; initAudio(); move(e); }
function end() { isDrag=false; }
function move(e) {
    if(!isDrag) return;
    if(e.preventDefault) e.preventDefault();
    let rect = cvs.getBoundingClientRect();
    px = (e.clientX - rect.left - ox) / scale;
    if(px < -10) px = -10; if(px > 10) px = 10;
    // מגנט לאפס אם קרוב (עוזר לחיתוך ציר Y)
    if(Math.abs(px) < 0.1) px = 0;
    
    document.getElementById('mainX').value = px;
    update();
}

function updateFromSlider() { if(!isDrag) { px = parseFloat(document.getElementById('mainX').value); update(); } }

function update() {
    let y = f(px), m = df(px);
    let dist = calculateDistance(y, m);
    updateHotColdSound(dist);
    checkWin(dist);
    draw();
}

function calculateDistance(y, m) {
    if(!goal) return 100;
    let q = questions[document.getElementById('qSelect').value];
    
    if(goal === 'm0') return Math.abs(m); // קיצון
    if(goal === 'y0') return Math.abs(y); // חיתוך ציר X (שורש)
    if(goal === 'x0') return Math.abs(px); // חיתוך ציר Y (חדש!)
    if(goal === 'm1') return Math.abs(m - 1);
    if(goal === 'slope_val') return Math.abs(m - q.targetVal);
    
    // משיק עובר דרך נקודה
    if(goal === 'tan_pass') {
        let t = q.target; 
        let predictedY = m * (t[0] - px) + y;
        return Math.abs(predictedY - t[1]) / 5;
    }
    // נורמל עובר דרך נקודה
    if(goal === 'norm_pass') {
        let t = q.target;
        // חישוב מרחק הנורמל מהנקודה
        // משוואת נורמל: Y - y0 = (-1/m)(X - x0)
        let nm = (Math.abs(m) < 0.001) ? 1000 : -1/m; // מניעת חלוקה באפס
        let val = (t[1] - y) - nm * (t[0] - px);
        // אם השיפוע 0, הנורמל הוא אנך (x=const)
        if(Math.abs(m) < 0.001) return Math.abs(px - t[0]);
        return Math.abs(val) / 10;
    }
    return 100;
}

function checkWin(dist) {
    let win = dist < 0.15;
    if(goal === 'x0' && Math.abs(px) < 0.05) win = true; // רגישות מיוחדת לציר Y
    
    let badge = document.getElementById('successBanner');
    if(win && !badge.classList.contains('show')) {
        playWinSound();
        badge.classList.add('show');
    } else if (!win) {
        badge.classList.remove('show');
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
    
    ctx.strokeStyle = "#94a3b8"; ctx.lineWidth = 2; ctx.beginPath();
    ctx.moveTo(0,oy); ctx.lineTo(W,oy); ctx.moveTo(ox,0); ctx.lineTo(ox,H); ctx.stroke();
    
    // ציור נקודת מטרה חיצונית
    let q = questions[document.getElementById('qSelect').value];
    if(q && q.target) {
        let tx = ox + q.target[0] * scale;
        let ty = oy - q.target[1] * scale;
        
        ctx.beginPath(); ctx.fillStyle = "rgba(239, 68, 68, 0.2)";
        ctx.arc(tx, ty, 15, 0, Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.fillStyle = "#ef4444";
        ctx.arc(tx, ty, 5, 0, Math.PI*2); ctx.fill();
        
        // כיתוב ברור וגדול לנקודה החיצונית
        ctx.fillStyle = "#b91c1c"; 
        ctx.font = "bold 16px Consolas, monospace";
        ctx.fillText(`(${q.target[0]}, ${q.target[1]})`, tx + 12, ty - 12);
    }

    // גרף הפונקציה
    ctx.strokeStyle = "#2563eb"; ctx.lineWidth = 4; ctx.beginPath();
    let sx = -ox/scale, ex = (W-ox)/scale;
    for(let x=sx; x<=ex; x+=0.05) {
        let cx=ox+x*scale, cy=oy-f(x)*scale;
        if(x===sx) ctx.moveTo(cx,cy); else ctx.lineTo(cx,cy);
    }
    ctx.stroke();
    
    // חישובים לנקודה הנוכחית
    let cx=ox+px*scale, cy=oy-f(px)*scale, m=df(px);
    let yVal = f(px);
    
    // ציור משיק / נורמל
    if(goal === 'norm_pass') {
        // מצב נורמל - קו סגול
        ctx.strokeStyle="#a855f7"; ctx.lineWidth=2; ctx.setLineDash([5,5]); ctx.beginPath();
        let nm = (Math.abs(m) < 0.001) ? 1000 : -1/m;
        if(Math.abs(nm) > 500) { // קו אנכי
             ctx.moveTo(cx, 0); ctx.lineTo(cx, H);
        } else {
             ctx.moveTo(cx-1000, cy+1000*nm); ctx.lineTo(cx+1000, cy-1000*nm);
        }
        ctx.stroke(); ctx.setLineDash([]);
    } else {
        // מצב משיק רגיל - קו כתום
        ctx.strokeStyle="#f97316"; ctx.lineWidth=2; ctx.beginPath();
        ctx.moveTo(cx-1000, cy+1000*m); ctx.lineTo(cx+1000, cy-1000*m);
        ctx.stroke();
    }
    
    // נקודה על הגרף
    ctx.fillStyle="#2563eb"; ctx.beginPath(); ctx.arc(cx,cy,8,0,6.28); ctx.fill();
    ctx.strokeStyle="white"; ctx.lineWidth=2; ctx.stroke();

    drawDataBox(cx, cy, px, yVal, m);
}

function drawDataBox(cx, cy, x, y, m) {
    let boxW = 180, boxH = 110;
    let bx = cx + 20, by = cy - 120;
    if (bx + boxW > W) bx = cx - boxW - 20;
    if (by < 10) by = cy + 20;

    // רקע לקופסה
    ctx.save();
    ctx.shadowColor = "rgba(0,0,0,0.15)"; ctx.shadowBlur = 10;
    ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
    ctx.strokeStyle = "#cbd5e1"; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.rect(bx, by, boxW, boxH);
    ctx.fill(); ctx.stroke(); ctx.restore();

    // טקסטים בקופסה
    ctx.font = "14px Consolas, monospace"; ctx.textAlign = "left"; 
    let pad = bx + 15, ty = by + 25;
    
    ctx.fillStyle = "#334155"; ctx.fillText(`x    : ${x.toFixed(2)}`, pad, ty);
    ctx.fillStyle = "#2563eb"; ctx.fillText(`f(x) : ${y.toFixed(2)}`, pad, ty+20);
    ctx.fillStyle = "#ea580c"; ctx.fillText(`f'(x): ${m.toFixed(2)}`, pad, ty+40);

    // קו הפרדה
    ctx.beginPath(); ctx.moveTo(pad, ty+50); ctx.lineTo(bx+boxW-15, ty+50);
    ctx.strokeStyle="#e2e8f0"; ctx.stroke();

    // משוואת הישר (משיק או נורמל)
    let displayM = m;
    let title = "Tangent";
    let color = "#334155";

    if (goal === 'norm_pass') {
        title = "Normal";
        color = "#a855f7"; // סגול לנורמל
        if (Math.abs(m) < 0.001) displayM = null; // אנכי
        else displayM = -1/m;
    }

    let eqStr = "";
    if (displayM === null) {
        eqStr = `x = ${x.toFixed(2)}`;
    } else {
        let b = y - (displayM * x);
        let sign = b >= 0 ? "+" : "-";
        eqStr = `y = ${displayM.toFixed(2)}x ${sign} ${Math.abs(b).toFixed(2)}`;
    }

    ctx.font = "bold 13px sans-serif"; ctx.fillStyle = color;
    ctx.fillText(eqStr, pad, ty+70);
}

/* --- ניהול תפריט ועדכון טקסטים --- */
function initMenu() {
    let s = document.getElementById('qSelect'); s.innerHTML = "";
    let cats = {};
    questions.forEach((q,i) => { if(!cats[q.cat]) cats[q.cat]=[]; cats[q.cat].push({i, t:q.t}); });
    for(let c in cats) { let g=document.createElement('optgroup'); g.label=c; cats[c].forEach(o=>{ let op=document.createElement('option'); op.value=o.i; op.innerText=o.t; g.appendChild(op); }); s.appendChild(g); }
}

function loadQuestionFromSelect() { playUiClick(); loadQ(document.getElementById('qSelect').value); }
function nextQuestion() { playUiClick(); let s=document.getElementById('qSelect'), i=parseInt(s.value)+1; if(i<questions.length) { s.value=i; loadQ(i); } }

function loadQ(i) {
    let q = questions[i];
    cf = [...q.p]; goal = q.goal;
    document.getElementById('qText').innerText = q.d;
    
    ['mA','mB','mC','mD'].forEach((id,k)=> { 
        let el = document.getElementById(id);
        let valSpan = document.getElementById(id.replace('m', 'val'));
        if(el) { el.value = cf[k]; if(valSpan) valSpan.innerText = cf[k]; }
    });
    
    px = -2; document.getElementById('mainX').value=px;
    document.getElementById('successBanner').classList.remove('show');
    updateEqText();
    update();
}

function manual() {
    cf = ['mA','mB','mC','mD'].map(id => {
        let el = document.getElementById(id);
        let val = parseFloat(el.value) || 0;
        document.getElementById(id.replace('m', 'val')).innerText = val;
        return val;
    });
    goal=''; document.getElementById('qText').innerText="מצב חופשי";
    updateEqText();
    update();
}

// עדכון טקסט הפונקציה והנגזרת למעלה
function updateEqText() {
    // 1. הפונקציה
    let txt = `y = ${cf[0]?cf[0]+"x³ ":""}${cf[1]?cf[1]+"x² ":""}${cf[2]?cf[2]+"x ":""}${cf[3]||""}`;
    txt = txt.replace(/\+ -/g, "- ").replace(/ 1x/g," x").replace(/ 0x./g,"");
    if(txt.endsWith("= ")) txt += "0";
    if(txt === "y = ") txt = "y = 0";
    document.getElementById('eqn').innerText = txt;

    // 2. הנגזרת (חישוב המקדמים לנגזרת)
    let da = 3 * cf[0];
    let db = 2 * cf[1];
    let dc = cf[2];

    let dTxt = `f'(x) = ${da?da+"x² ":""}${db?db+"x ":""}${dc||""}`;
    dTxt = dTxt.replace(/\+ -/g, "- ").replace(/ 1x/g," x").replace(/ 0x./g,"");
    if (dTxt.endsWith("= ")) dTxt += "0";
    
    // ניקוי מקרים של נגזרת ריקה
    if (da===0 && db===0 && dc===0) dTxt = "f'(x) = 0";
    
    document.getElementById('derivEqn').innerText = dTxt;
}
