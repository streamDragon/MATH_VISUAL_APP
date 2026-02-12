/* script.js - לוגיקה, מתמטיקה וגרפיקה */

/* מאגר שאלות מורחב */
const bagrutData = [
    { cat: "חקירה", t: "מינימום", d: "מצאו את נקודת המינימום של הפונקציה.", p: [0, 1, -4, 4], goal: 'm0_min' },
    { cat: "חקירה", t: "חיתוך ציר Y", d: "מצאו את נקודת החיתוך עם ציר ה-Y.", p: [0, 1, -2, -3], goal: 'x0' },
    { cat: "נקודות קיצון", t: "מקסימום מקומי", d: "הביאו את הנקודה הכחולה לנקודת המקסימום.", p: [-1, 0, 12, 0], goal: 'm0_max' },
    { cat: "נקודות קיצון", t: "קודקוד פרבולה", d: "מצאו את קודקוד הפרבולה (נקודת המינימום).", p: [0, 1, -6, 5], goal: 'm0_min' },
    { cat: "צירים", t: "חיתוך ציר X", d: "מצאו נקודה בה הפונקציה חוצה את ציר ה-X.", p: [0, 1, 0, -9], goal: 'y0' },
    { cat: "משיקים", t: "שיפוע ספציפי", d: "הזיזו את הנקודה עד ששיפוע המשיק יהיה בדיוק 4.", p: [0, 1, 0, 0], goal: 'slope_val', targetVal: 4 },
    { cat: "משיקים", t: "משיק לראשית", d: "מצאו נקודה שהמשיק דרכה עובר ב-(0,0).", p: [0, -1, 4, 0], goal: 'tan_pass', target: [0,0] },
    { cat: "נורמל", t: "נורמל לראשית", d: "מצאו נקודה שהנורמל (המקווקו) עובר בראשית (0,0).", p: [0, 1, -4, 4], goal: 'norm_pass', target: [0,0] }
];

/* משתנים גלובליים */
let cvs, ctx, W, H, mainArea;
let baseScale = 45, scale = 45;
let ox, oy, px = 0, cf = [0,1,0,0], goal = '';
let isDrag = false, audioCtx = null, isMuted = true;
let currentQIndex = 0;

window.onload = () => {
    cvs = document.getElementById('cvs');
    ctx = cvs.getContext('2d');
    mainArea = document.getElementById('mainArea');
    
    window.addEventListener('resize', resize);
    
    // מאזינים לאירועי מגע ועכבר
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

/* ניהול השאלות */
function initMenu() {
    let sel = document.getElementById('qSelect');
    sel.innerHTML = "";
    bagrutData.forEach((q, i) => {
        let opt = document.createElement('option');
        opt.value = i;
        opt.text = `${i+1}. ${q.t}`;
        sel.appendChild(opt);
    });
}

function loadQuestionFromSelect() {
    let idx = parseInt(document.getElementById('qSelect').value);
    loadQ(idx);
}

function nextQuestion() {
    let idx = parseInt(document.getElementById('qSelect').value);
    if(idx < bagrutData.length - 1) {
        document.getElementById('qSelect').value = idx + 1;
        loadQ(idx + 1);
    }
}

function loadQ(idx) {
    currentQIndex = idx;
    let q = bagrutData[idx];
    document.getElementById('qText').innerHTML = q.d;
    document.getElementById('qCounter').innerText = `שאלה ${idx+1} מתוך ${bagrutData.length}`;
    
    // איפוס באנר הצלחה
    document.getElementById('successBanner').classList.remove('show');

    // טעינת המקדמים
    cf = [...q.p];
    document.getElementById('mA').value = cf[0];
    document.getElementById('mB').value = cf[1];
    document.getElementById('mC').value = cf[2];
    document.getElementById('mD').value = cf[3];
    
    goal = q.goal;
    px = 0.5; // התחלה במקום ניטרלי
    document.getElementById('mainX').value = px;
    
    manual(); // עדכון התצוגה
}

/* עדכון מקדמים ידני */
function manual() {
    cf[0] = parseFloat(document.getElementById('mA').value);
    cf[1] = parseFloat(document.getElementById('mB').value);
    cf[2] = parseFloat(document.getElementById('mC').value);
    cf[3] = parseFloat(document.getElementById('mD').value);
    
    document.getElementById('valA').innerText = cf[0];
    document.getElementById('valB').innerText = cf[1];
    document.getElementById('valC').innerText = cf[2];
    document.getElementById('valD').innerText = cf[3];
    
    updateEquationString();
    update();
}

function updateEquationString() {
    // יצירת מחרוזת יפה של הפונקציה
    let s = "y = ";
    if(cf[0] !== 0) s += `${cf[0]}x³ `;
    if(cf[1] !== 0) s += `${cf[1]>0?'+':''}${cf[1]}x² `;
    if(cf[2] !== 0) s += `${cf[2]>0?'+':''}${cf[2]}x `;
    if(cf[3] !== 0) s += `${cf[3]>0?'+':''}${cf[3]}`;
    if(s === "y = ") s += "0";
    document.getElementById('eqn').innerText = s;

    // יצירת מחרוזת נגזרת
    let d0 = 3*cf[0], d1 = 2*cf[1], d2 = cf[2];
    let sd = "f'(x) = ";
    if(d0 !== 0) sd += `${d0.toFixed(1)}x² `;
    if(d1 !== 0) sd += `${d1>0?'+':''}${d1.toFixed(1)}x `;
    if(d2 !== 0) sd += `${d2>0?'+':''}${d2}`;
    if(sd === "f'(x) = ") sd += "0";
    document.getElementById('derivEqn').innerText = sd;
}

/* זום ומיקום */
function zoomIn() { scale = Math.min(scale * 1.2, 150); draw(); }
function zoomOut() { scale = Math.max(scale / 1.2, 10); draw(); }
function resetZoom() { scale = baseScale; ox = W/2; oy = H/2 + H*0.1; draw(); }

function resize() { 
    if(!mainArea) return;
    W = cvs.width = mainArea.clientWidth; 
    H = cvs.height = mainArea.clientHeight; 
    ox = W/2; oy = H/2 + H*0.1; 
    draw(); 
}

/* פונקציות מתמטיות */
function f(x) { return cf[0]*x**3 + cf[1]*x**2 + cf[2]*x + cf[3]; }
function df(x) { return 3*cf[0]*x**2 + 2*cf[1]*x + cf[2]; }

/* אינטראקציה */
function start(e) { 
    isDrag = true; 
    initAudio(); 
    move(e); 
}
function end() { isDrag = false; }
function move(e) {
    if(!isDrag) return;
    let rect = cvs.getBoundingClientRect();
    let clientX = e.clientX || e.touches[0].clientX;
    
    px = (clientX - rect.left - ox) / scale;
    px = Math.max(-10, Math.min(10, px));
    
    // מגנט לאפס
    if(Math.abs(px) < 0.05) px = 0;
    
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
    updateProximityBar(dist); // עדכון מד חם/קר
    checkWin(dist);
    draw();
}

/* חישוב מרחק והתקדמות */
function calculateDistance(y, m) {
    if(!goal) return 100;
    let q = bagrutData[document.getElementById('qSelect').value];
    
    if(goal === 'm0_min') {
        // בודק אם שיפוע 0 וגם אם הנגזרת השנייה חיובית (מינימום)
        let f2 = 6*cf[0]*px + 2*cf[1];
        if (Math.abs(m) < 0.1 && f2 > 0) return 0; // בינגו
        return Math.abs(m) + (f2 < 0 ? 5 : 0); // עונש אם זה מקסימום
    }

    if(goal === 'm0_max') {
        let f2 = 6*cf[0]*px + 2*cf[1];
        if (Math.abs(m) < 0.1 && f2 < 0) return 0;
        return Math.abs(m) + (f2 > 0 ? 5 : 0);
    }
    
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
    // לוגיקה פשוטה לאחוזים - ככל שהמרחק קטן מ-5, האחוז עולה
    let percentage = Math.max(0, Math.min(100, (1 - dist / 5) * 100));
    
    if (dist < 0.15) percentage = 100;
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

/* ציור */
function draw() {
    ctx.clearRect(0,0,W,H);
    
    // רשת צירים
    ctx.strokeStyle = "#e2e8f0"; ctx.lineWidth = 1; ctx.beginPath();
    for(let x=ox%scale; x<W; x+=scale) { ctx.moveTo(x,0); ctx.lineTo(x,H); }
    for(let x=ox%scale; x>0; x-=scale) { ctx.moveTo(x,0); ctx.lineTo(x,H); }
    for(let y=oy%scale; y<H; y+=scale) { ctx.moveTo(0,y); ctx.lineTo(W,y); }
    for(let y=oy%scale; y>0; y-=scale) { ctx.moveTo(0,y); ctx.lineTo(W,y); }
    ctx.stroke();
    
    // צירים ראשיים
    ctx.strokeStyle = "#94a3b8"; ctx.lineWidth = 2; ctx.beginPath();
    ctx.moveTo(0, oy); ctx.lineTo(W, oy); // X axis
    ctx.moveTo(ox, 0); ctx.lineTo(ox, H); // Y axis
    ctx.stroke();

    // ציור הפונקציה
    ctx.strokeStyle = "#3b82f6"; ctx.lineWidth = 3; ctx.beginPath();
    for(let i=0; i<=W; i+=2) {
        let xx = (i - ox) / scale;
        let yy = oy - f(xx) * scale;
        if(i===0) ctx.moveTo(i, yy); else ctx.lineTo(i, yy);
    }
    ctx.stroke();

    // הנקודה הנוכחית
    let cx = ox + px * scale;
    let cy = oy - f(px) * scale;
    let m = df(px);

    // משיק (כתום)
    ctx.strokeStyle = "#f97316"; ctx.lineWidth = 2; ctx.beginPath();
    let tLen = W; 
    ctx.moveTo(cx - tLen, cy + tLen*m);
    ctx.lineTo(cx + tLen, cy - tLen*m);
    ctx.stroke();

    // נורמל (סגול מקווקו)
    if(Math.abs(m) > 0.01) {
        ctx.strokeStyle = "#8b5cf6"; ctx.lineWidth = 1; ctx.setLineDash([5, 5]); ctx.beginPath();
        let nm = -1/m;
        ctx.moveTo(cx - tLen, cy + tLen*nm);
        ctx.lineTo(cx + tLen, cy - tLen*nm);
        ctx.stroke();
        ctx.setLineDash([]);
    }

    // הנקודה עצמה
    ctx.fillStyle = "#2563eb"; ctx.beginPath();
    ctx.arc(cx, cy, 6, 0, Math.PI*2);
    ctx.fill(); ctx.stroke();

    // טקסטים על גבי הקנבס
    ctx.font = "14px Rubik"; ctx.fillStyle = "#475569"; ctx.textAlign = "left";
    ctx.fillText(`x: ${px.toFixed(2)}`, 10, H-50);
    ctx.fillText(`y: ${f(px).toFixed(2)}`, 10, H-30);
    ctx.fillText(`m: ${m.toFixed(2)}`, 10, H-10);
}

/* סאונד פשוט */
function initAudio() {
    if(!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
}
function toggleMute() {
    isMuted = !isMuted;
    document.getElementById('btnSound').innerText = isMuted ? "🔇" : "🔊";
}
function playWinSound() {
    if(isMuted || !audioCtx) return;
    let o = audioCtx.createOscillator();
    let g = audioCtx.createGain();
    o.connect(g); g.connect(audioCtx.destination);
    o.type = 'sine';
    o.frequency.setValueAtTime(440, audioCtx.currentTime);
    o.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.1);
    g.gain.setValueAtTime(0.1, audioCtx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
    o.start(); o.stop(audioCtx.currentTime + 0.3);
}
