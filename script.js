/* script.js - גרסה סופית: ויזואליזציה + סאונד חם/קר + סינתיסייזר */

/* --- הגדרות שאלות (ברירת מחדל + מיזוג) --- */
const defaultQuestions = [
    { cat: "תרגול בסיסי", t: "חימום: מינימום", d: "מצאו את תחתית העמק (מינימום).", p: [0, 1, -4, 4], goal: 'm0' },
    { cat: "תרגול בסיסי", t: "חיתוך צירים", d: "מצאו את נקודת החיתוך עם ציר ה-X הימני.", p: [0, 0.5, 0, -2], goal: 'y0' }
];

let questions = [];
if (typeof bagrutData !== 'undefined') questions = defaultQuestions.concat(bagrutData);
else questions = defaultQuestions;

/* --- משתנים גלובליים --- */
let cvs, ctx, W, H, mainArea;
let scale = 45, ox, oy;
let px = 0, cf = [0,1,0,0], goal = '';
let isDrag = false;

/* --- מערכת סאונד (Audio Context) --- */
let audioCtx = null;
let isMuted = true;
let osc = null; // אוסילטור לצליל רציף
let lastClickTime = 0; // תזמון קליקים של חם/קר

window.onload = () => {
    cvs = document.getElementById('cvs');
    ctx = cvs.getContext('2d');
    mainArea = document.getElementById('mainArea');
    
    window.addEventListener('resize', resize);
    
    // אירועי מגע/עכבר
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

/* --- ניהול סאונד --- */
function initAudio() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
}

function toggleMute() {
    isMuted = !isMuted;
    let btn = document.getElementById('btnSound');
    btn.innerText = isMuted ? "🔇" : "🔊";
    
    if (!isMuted) {
        initAudio();
        playUiClick();
    }
}

// צליל "קליק" לממשק
function playUiClick() {
    if(isMuted || !audioCtx) return;
    let o = audioCtx.createOscillator();
    let g = audioCtx.createGain();
    o.connect(g); g.connect(audioCtx.destination);
    o.type = 'sine';
    o.frequency.setValueAtTime(800, audioCtx.currentTime);
    o.frequency.exponentialRampToValueAtTime(300, audioCtx.currentTime + 0.1);
    g.gain.setValueAtTime(0.1, audioCtx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
    o.start(); o.stop(audioCtx.currentTime + 0.1);
}

// צליל ניצחון (ארפג'יו עולה)
function playWinSound() {
    if(isMuted || !audioCtx) return;
    let now = audioCtx.currentTime;
    let notes = [523.25, 659.25, 783.99, 1046.50]; // C Major
    
    notes.forEach((freq, i) => {
        let o = audioCtx.createOscillator();
        let g = audioCtx.createGain();
        o.connect(g); g.connect(audioCtx.destination);
        o.type = 'triangle';
        o.frequency.value = freq;
        g.gain.setValueAtTime(0, now + i*0.1);
        g.gain.linearRampToValueAtTime(0.1, now + i*0.1 + 0.05);
        g.gain.exponentialRampToValueAtTime(0.001, now + i*0.1 + 0.4);
        o.start(now + i*0.1);
        o.stop(now + i*0.1 + 0.5);
    });
}

// מנגנון חם/קר (Geiger Counter Effect)
function updateHotColdSound(distance) {
    if(isMuted || !audioCtx || !isDrag) return;
    
    // אם רחוק מדי - שקט
    if(distance > 8) return;

    // ככל שהמרחק קטן, המרווח בין הקליקים קטן
    // מיפוי: מרחק 5 -> 500ms, מרחק 0.1 -> 50ms
    let interval = Math.max(50, distance * 100); 
    
    let now = Date.now();
    if(now - lastClickTime > interval) {
        // יצירת קליק קצר
        let o = audioCtx.createOscillator();
        let g = audioCtx.createGain();
        o.connect(g); g.connect(audioCtx.destination);
        
        // ככל שקרובים יותר, הצליל גם נהיה גבוה יותר טיפה
        let pitch = 600 - (distance * 50); 
        o.type = 'square';
        o.frequency.value = pitch;
        
        g.gain.setValueAtTime(0.05, audioCtx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.05);
        
        o.start();
        o.stop(audioCtx.currentTime + 0.05);
        
        lastClickTime = now;
    }
}

/* --- לוגיקה גרפית ומתמטית --- */
function resize() {
    W = cvs.width = mainArea.clientWidth;
    H = cvs.height = mainArea.clientHeight;
    ox = W/2; oy = H/2 + H*0.1;
    draw();
}

function f(x) { return cf[0]*x**3 + cf[1]*x**2 + cf[2]*x + cf[3]; }
function df(x) { return 3*cf[0]*x**2 + 2*cf[1]*x + cf[2]; }

function start(e) { 
    isDrag = true; 
    initAudio(); // הפעלת סאונד באינטראקציה ראשונה
    move(e); 
}
function end() { isDrag = false; }

function move(e) {
    if(!isDrag) return;
    if(e.preventDefault) e.preventDefault();
    let rect = cvs.getBoundingClientRect();
    px = (e.clientX - rect.left - ox) / scale;
    if(px < -10) px = -10; if(px > 10) px = 10;
    document.getElementById('mainX').value = px;
    update();
}

function updateFromSlider() {
    if(!isDrag) {
        px = parseFloat(document.getElementById('mainX').value);
        update();
    }
}

function update() {
    let y = f(px), m = df(px);
    let dist = calculateDistance(y, m);
    
    // הפעלת סאונד חם/קר
    updateHotColdSound(dist);
    
    checkWin(dist);
    draw();
}

// פונקציית עזר לחישוב המרחק מהפתרון (עבור הסאונד)
function calculateDistance(y, m) {
    if(!goal) return 100;
    let q = questions[document.getElementById('qSelect').value];
    
    if(goal === 'm0') return Math.abs(m);
    if(goal === 'y0') return Math.abs(y);
    if(goal === 'm1') return Math.abs(m - 1);
    if(goal === 'slope_val') return Math.abs(m - q.targetVal);
    
    if(goal === 'tan_pass') {
        let t = q.target; 
        let predictedY = m * (t[0] - px) + y;
        return Math.abs(predictedY - t[1]) / 5; // נרמול כדי שהסאונד יהיה הגיוני
    }
    if(goal === 'norm_pass') {
        let t = q.target;
        let val = (t[1] - y) * m + (t[0] - px);
        return Math.abs(val) / 5;
    }
    return 100;
}

function checkWin(dist) {
    // סף הניצחון הוא מרחק קטן מ-0.2
    // שיפרתי כאן את הלוגיקה שתהיה אחידה לכל הסוגים
    let win = dist < 0.2; 
    
    // תיקון מיוחד למשיק ונורמל שדורשים דיוק אחר
    if(goal.includes('pass')) win = dist < 0.15;

    let badge = document.getElementById('successBanner');
    
    // זיהוי רגע הזכייה כדי לנגן סאונד פעם אחת
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
    
    // רשת וצירים
    ctx.strokeStyle = "#e2e8f0"; ctx.lineWidth = 1; ctx.beginPath();
    for(let x=ox%scale; x<W; x+=scale) { ctx.moveTo(x,0); ctx.lineTo(x,H); }
    for(let y=oy%scale; y<H; y+=scale) { ctx.moveTo(0,y); ctx.lineTo(W,y); }
    ctx.stroke();
    
    ctx.strokeStyle = "#94a3b8"; ctx.lineWidth = 2; ctx.beginPath();
    ctx.moveTo(0,oy); ctx.lineTo(W,oy); ctx.moveTo(ox,0); ctx.lineTo(ox,H); ctx.stroke();
    
    // נקודת מטרה
    let q = questions[document.getElementById('qSelect').value];
    if(q && q.target) {
        let tx = ox + q.target[0] * scale;
        let ty = oy - q.target[1] * scale;
        ctx.beginPath(); ctx.fillStyle = "rgba(239, 68, 68, 0.2)";
        ctx.arc(tx, ty, 15, 0, Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.fillStyle = "#ef4444";
        ctx.arc(tx, ty, 5, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = "#ef4444"; ctx.font = "bold 12px sans-serif";
        ctx.fillText("מטרה", tx + 10, ty);
    }

    // הפונקציה
    ctx.strokeStyle = "#2563eb"; ctx.lineWidth = 4; ctx.beginPath();
    let sx = -ox/scale, ex = (W-ox)/scale;
    for(let x=sx; x<=ex; x+=0.05) {
        let cx=ox+x*scale, cy=oy-f(x)*scale;
        if(x===sx) ctx.moveTo(cx,cy); else ctx.lineTo(cx,cy);
    }
    ctx.stroke();
    
    // משיק ונקודה
    let cx=ox+px*scale, cy=oy-f(px)*scale, m=df(px);
    let yVal = f(px);
    
    ctx.strokeStyle="#f97316"; ctx.lineWidth=2; ctx.beginPath();
    ctx.moveTo(cx-1000, cy+1000*m); ctx.lineTo(cx+1000, cy-1000*m);
    ctx.stroke();

    if(q && q.goal === 'norm_pass') { 
        ctx.strokeStyle="#a855f7"; ctx.setLineDash([5,5]); ctx.beginPath();
        let nm = -1/m;
        if(Math.abs(m)<0.01) { ctx.moveTo(cx, cy-1000); ctx.lineTo(cx, cy+1000); }
        else { ctx.moveTo(cx-1000, cy+1000*nm); ctx.lineTo(cx+1000, cy-1000*nm); }
        ctx.stroke(); ctx.setLineDash([]);
    }
    
    ctx.fillStyle="#2563eb"; ctx.beginPath(); ctx.arc(cx,cy,8,0,6.28); ctx.fill();
    ctx.strokeStyle="white"; ctx.lineWidth=2; ctx.stroke();

    drawDataBox(cx, cy, px, yVal, m);
}

function drawDataBox(cx, cy, x, y, m) {
    let b = y - (m * x);
    let boxWidth = 140, boxHeight = 90;
    let bx = cx + 20, by = cy - 100;
    
    if (bx + boxWidth > W) bx = cx - boxWidth - 20;
    if (by < 10) by = cy + 20;

    ctx.save();
    ctx.shadowColor = "rgba(0,0,0,0.15)"; ctx.shadowBlur = 10; ctx.shadowOffsetY = 4;
    ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
    ctx.strokeStyle = "#e2e8f0"; ctx.lineWidth = 1;
    if(ctx.roundRect) ctx.beginPath(), ctx.roundRect(bx, by, boxWidth, boxHeight, 12);
    else ctx.beginPath(), ctx.rect(bx, by, boxWidth, boxHeight);
    ctx.fill(); ctx.stroke(); ctx.restore();

    ctx.font = "14px Consolas, monospace"; ctx.textAlign = "left"; ctx.textBaseline = "middle";
    let startY = by + 20, pad = bx + 15;

    ctx.fillStyle = "#475569"; ctx.fillText(`x : ${x.toFixed(2)}`, pad, startY);
    ctx.fillStyle = "#2563eb"; ctx.fillText(`y : ${y.toFixed(2)}`, pad, startY + 20);
    ctx.font = "bold 14px Consolas, monospace";
    ctx.fillStyle = "#ea580c"; ctx.fillText(`m : ${m.toFixed(2)}`, pad, startY + 40);

    ctx.beginPath(); ctx.moveTo(pad, startY + 56); ctx.lineTo(bx + boxWidth - 15, startY + 56);
    ctx.strokeStyle = "#cbd5e1"; ctx.lineWidth = 1; ctx.stroke();

    let sign = b >= 0 ? "+" : "-";
    let eqStr = `y = ${m.toFixed(2)}x ${sign} ${Math.abs(b).toFixed(2)}`;
    ctx.font = "bold 13px sans-serif"; ctx.fillStyle = "#334155";
    ctx.fillText(eqStr, pad, startY + 76);
}

/* --- ממשק --- */
function initMenu() {
    let s = document.getElementById('qSelect');
    s.innerHTML = "";
    let cats = {};
    questions.forEach((q,i) => {
        if(!cats[q.cat]) cats[q.cat]=[];
        cats[q.cat].push({i, t:q.t});
    });
    for(let c in cats) {
        let g = document.createElement('optgroup'); g.label=c;
        cats[c].forEach(o=>{
            let op=document.createElement('option'); op.value=o.i; op.innerText=o.t; g.appendChild(op);
        });
        s.appendChild(g);
    }
}
function loadQuestionFromSelect() { 
    playUiClick(); 
    loadQ(document.getElementById('qSelect').value); 
}
function nextQuestion() {
    playUiClick();
    let s = document.getElementById('qSelect');
    let i = parseInt(s.value) + 1;
    if(i < questions.length) { s.value = i; loadQ(i); }
}
function loadQ(i) {
    let q = questions[i];
    cf = [...q.p]; goal = q.goal;
    document.getElementById('qText').innerText = q.d;
    ['mA','mB','mC','mD'].forEach((id,k)=> { let el=document.getElementById(id); if(el) el.value=cf[k]; });
    
    px = -3; 
    document.getElementById('mainX').value=px;
    document.getElementById('successBanner').classList.remove('show');
    
    let txt = `y = ${cf[0]?cf[0]+"x³ ":""}${cf[1]?cf[1]+"x² ":""}${cf[2]?cf[2]+"x ":""}${cf[3]||""}`;
    txt = txt.replace(/\+ -/g, "- ").replace(/ 1x/g," x").replace(/ 0x./g,"");
    if(txt.endsWith("= ")) txt += "0";
    document.getElementById('eqn').innerText = txt;
    
    update();
}
function manual() {
    cf = ['mA','mB','mC','mD'].map(id=>parseFloat(document.getElementById(id).value)||0);
    goal=''; document.getElementById('qText').innerText="מצב חופשי";
    update();
}
