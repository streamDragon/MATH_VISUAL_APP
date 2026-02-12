/* script.js - כולל יומן משוואות ומטרות ויזואליות */

const bagrutData = [
    // --- שלב 1: הזזת X ---
    { 
        id: 1,
        type: "move_x",
        t: "חקירה: נקודת מינימום", 
        d: "הזיזו את הנקודה הכחולה לנקודת המינימום.", 
        p: [0, 1, -4, 4], // y = x^2 - 4x + 4
        goal: 'min_point' 
    },
    { 
        id: 2,
        type: "move_x",
        t: "חקירה: משיק אופקי", 
        d: "מצאו נקודה שבה המשיק מקביל לציר ה-X.", 
        p: [-1, 0, 9, 0], // y = -x^3 + 9x
        goal: 'slope_zero' 
    },
    
    // --- שלב 2: מציאת פרמטרים (בניית הפונקציה) ---
    // כאן המשתמש משחק עם הפרמטרים כדי לפגוע במטרות
    {
        id: 3,
        type: "find_param",
        t: "בנייה: הזזה אנכית",
        d: "הזיזו את המקדם d כדי שהפרבולה תעבור בראשית (0,0).",
        p: [0, 1, 0, 5], // מתחילים עם d=5 לא נכון
        locked: ['a','b','c'], // רק d פתוח
        targets: [
            { x: 0, y: 0, label: "A" }
        ],
        goal: 'hit_targets',
        solvedEq: "f(0) = 0"
    },
    {
        id: 4,
        type: "find_param",
        t: "בנייה: פרמטר K",
        d: "נתונה y = x² - 4x + k. מצאו את k כך שהפונקציה תשיק לציר X.",
        p: [0, 1, -4, -2], 
        locked: ['a','b','c'],
        targets: [
            { x: 2, y: 0, label: "השקה" } // קודקוד ב-2
        ],
        goal: 'hit_targets',
        solvedEq: "f(2) = 0"
    },
    {
        id: 5,
        type: "find_param",
        t: "בנייה: שתי נקודות",
        d: "כוונו את c ו-d כך שהישר y = cx + d יעבור בנקודות המסומנות.",
        p: [0, 0, 1, 0], // פונקציה ליניארית
        locked: ['a','b'], 
        targets: [
            { x: 0, y: 2, label: "A" },
            { x: 2, y: 0, label: "B" }
        ],
        goal: 'hit_targets',
        solvedEq: "y = -x + 2"
    }
];

let cvs, ctx, W, H, mainArea;
let baseScale = 40, scale = 40;
let ox, oy; 
let px = 0; 
let cf = [0, 1, 0, 0]; 
let currentQ = 0;
let isDrag = false;
let audioCtx = null, isMuted = false;
let solvedTargets = []; // רשימת מטרות שכבר פגענו בהן בשלב הנוכחי

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
        handleInput(e);
    };
    const move = (e) => { if(isDrag) handleInput(e); };
    const end = () => { isDrag = false; };

    cvs.addEventListener('mousedown', start);
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', end);
    
    cvs.addEventListener('touchstart', (e) => { e.preventDefault(); start(e); }, {passive: false});
    cvs.addEventListener('touchmove', (e) => { e.preventDefault(); move(e); }, {passive: false});
    cvs.addEventListener('touchend', end);
}

function handleInput(e) {
    let q = bagrutData[currentQ];
    
    // אם המטרה היא להזיז את X (חקירה)
    if (q.type === 'move_x') {
        let clientX = e.clientX || (e.touches ? e.touches[0].clientX : 0);
        let rect = cvs.getBoundingClientRect();
        px = (clientX - rect.left - ox) / scale;
        px = Math.max(-10, Math.min(10, px));
        document.getElementById('mainX').value = px;
        updateGame();
    }
}

function updateFromSlider() {
    px = parseFloat(document.getElementById('mainX').value);
    updateGame();
}

function manual() {
    let q = bagrutData[currentQ];
    // בדיקה מי נעול ומי לא
    if (!q.locked || !q.locked.includes('a')) cf[0] = parseFloat(document.getElementById('mA').value);
    if (!q.locked || !q.locked.includes('b')) cf[1] = parseFloat(document.getElementById('mB').value);
    if (!q.locked || !q.locked.includes('c')) cf[2] = parseFloat(document.getElementById('mC').value);
    if (!q.locked || !q.locked.includes('d')) cf[3] = parseFloat(document.getElementById('mD').value);
    
    // החזרת הסליידרים למצבם אם הם נעולים (כדי למנוע תזוזה ויזואלית)
    if (q.locked) {
        if (q.locked.includes('a')) document.getElementById('mA').value = cf[0];
        if (q.locked.includes('b')) document.getElementById('mB').value = cf[1];
        if (q.locked.includes('c')) document.getElementById('mC').value = cf[2];
        if (q.locked.includes('d')) document.getElementById('mD').value = cf[3];
    }
    
    updateGame();
}

function toggleMode() {
    // פונקציה עתידית למעבר בין מצבי משחק שונים
    alert("מצב עריכה יתווסף בקרוב!");
}

/* --- לוגיקה מתמטית --- */
function f(x) { return cf[0]*x**3 + cf[1]*x**2 + cf[2]*x + cf[3]; }
function df(x) { return 3*cf[0]*x**2 + 2*cf[1]*x + cf[2]; }

function formatPoly(a, b, c, d) {
    let terms = [];
    if (Math.abs(a) > 0.001) terms.push(`${Number(a.toFixed(1))}x³`);
    if (Math.abs(b) > 0.001) terms.push(`${Number(b.toFixed(1))}x²`);
    if (Math.abs(c) > 0.001) terms.push(`${Number(c.toFixed(1))}x`);
    if (Math.abs(d) > 0.001 || terms.length === 0) terms.push(`${Number(d.toFixed(1))}`);
    return "y = " + terms.join(" + ").replace(/\+ -/g, "- ");
}

function updateGame() {
    // עדכון טקסטים
    document.getElementById('valA').innerText = cf[0].toFixed(1);
    document.getElementById('valB').innerText = cf[1].toFixed(1);
    document.getElementById('valC').innerText = cf[2].toFixed(1);
    document.getElementById('valD').innerText = cf[3].toFixed(1);

    document.getElementById('eqn').innerText = formatPoly(cf[0], cf[1], cf[2], cf[3]);
    let derivText = ""; // נגזרת פחות רלוונטית בשלבי בנייה, אבל אפשר להציג
    document.getElementById('derivEqn').innerText = derivText;

    checkWinCondition();
    draw();
}

function checkWinCondition() {
    let q = bagrutData[currentQ];
    let dist = 100;
    
    if (q.goal === 'hit_targets') {
        // מצב בנייה: בודקים אם הפונקציה עוברת דרך כל המטרות
        let totalError = 0;
        let newSolve = false;
        
        q.targets.forEach((t, i) => {
            let val = f(t.x);
            let diff = Math.abs(val - t.y);
            totalError += diff;
            
            // אם המטרה הושגה ועוד לא רשמנו אותה
            if (diff < 0.2 && !solvedTargets.includes(i)) {
                solvedTargets.push(i);
                addJournalEntry(`f(${t.x}) = ${t.y}`);
                playTone(600 + i*100, 0.1); // צליל הצלחה קטן
                newSolve = true;
            }
        });
        
        dist = totalError * 10; // סילום למד הקרבה
        
        // הצלחה מלאה אם כל המטרות הושגו
        if (solvedTargets.length === q.targets.length) {
             if(q.solvedEq && document.getElementById('journalList').lastChild?.innerText !== q.solvedEq) {
                 addJournalEntry("✅ " + q.solvedEq);
             }
             triggerSuccess();
        }
        
    } else {
        // מצב חקירה רגיל (הזזת X)
        let m = df(px);
        let y = f(px);
        
        if (q.goal === 'min_point') {
            let d2 = 6*cf[0]*px + 2*cf[1];
            dist = Math.abs(m) + (d2 > 0 ? 0 : 5);
        } 
        else if (q.goal === 'slope_zero') dist = Math.abs(m);
        
        if (dist < 0.15) triggerSuccess();
    }
    
    let p = Math.max(0, Math.min(100, (1 - dist/5) * 100));
    document.getElementById('proximityBar').style.width = p + "%";
}

function triggerSuccess() {
    let banner = document.getElementById('successBanner');
    if (!banner.classList.contains('show')) {
        banner.classList.add('show');
        playTone(800, 0.3);
    }
}

function addJournalEntry(text) {
    let list = document.getElementById('journalList');
    // בדיקה למניעת כפילויות
    let exists = Array.from(list.children).some(c => c.innerText === text);
    if(!exists) {
        let div = document.createElement('div');
        div.className = 'journal-entry';
        div.innerText = text;
        list.appendChild(div);
        list.scrollTop = list.scrollHeight;
    }
}

/* --- ציור וגרפיקה --- */
function draw() {
    ctx.clearRect(0, 0, W, H);
    drawGrid();
    
    // ציור מטרות אם יש
    let q = bagrutData[currentQ];
    if (q.targets) {
        q.targets.forEach((t, i) => {
            drawTarget(t.x, t.y, t.label, solvedTargets.includes(i));
        });
    }

    // פונקציה
    ctx.beginPath();
    ctx.strokeStyle = "#2563eb";
    ctx.lineWidth = 3;
    for (let i = 0; i <= W; i += 4) {
        let realX = (i - ox) / scale;
        let realY = f(realX);
        let screenY = oy - realY * scale;
        if (i === 0) ctx.moveTo(i, screenY); else ctx.lineTo(i, screenY);
    }
    ctx.stroke();
    
    let y = f(px);
    let m = df(px);

    // אלמנטים נוספים רק אם זה לא מצב מציאת פרמטרים נקי (שבו ה-X פחות חשוב)
    if (q.type !== 'find_param') {
        drawTangent(px, y, m);
        drawNormal(px, y, m);
        drawRightAngleMarker(px, y, m);
        
        // הנקודה של השחקן
        let sx = ox + px * scale;
        let sy = oy - y * scale;
        ctx.fillStyle = "#2563eb";
        ctx.beginPath(); ctx.arc(sx, sy, 6, 0, Math.PI*2); ctx.fill();
        ctx.strokeStyle = "white"; ctx.lineWidth = 2; ctx.stroke();
        
        updateTrinityDisplay(px, y, m);
    }
}

function drawTarget(x, y, label, isHit) {
    let sx = ox + x * scale;
    let sy = oy - y * scale;
    
    ctx.beginPath();
    ctx.arc(sx, sy, 8, 0, Math.PI*2);
    if (isHit) {
        ctx.fillStyle = "#22c55e"; // ירוק מלא
        ctx.fill();
    } else {
        ctx.strokeStyle = "#ef4444"; // אדום ריק
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.setLineDash([2, 2]); // עיגול מקווקו מסביב לאפקט "מטרה"
        ctx.beginPath(); ctx.arc(sx, sy, 12, 0, Math.PI*2); ctx.stroke();
        ctx.setLineDash([]);
    }
    
    ctx.fillStyle = "#64748b";
    ctx.font = "12px Rubik";
    ctx.fillText(label, sx + 10, sy - 10);
}

function drawGrid() {
    ctx.strokeStyle = "#e2e8f0";
    ctx.lineWidth = 1;
    ctx.beginPath();
    for(let x=ox%scale; x<W; x+=scale) { ctx.moveTo(x,0); ctx.lineTo(x,H); }
    for(let y=oy%scale; y<H; y+=scale) { ctx.moveTo(0,y); ctx.lineTo(W,y); }
    ctx.stroke();
    ctx.strokeStyle = "#94a3b8"; ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, oy); ctx.lineTo(W, oy);
    ctx.moveTo(ox, 0); ctx.lineTo(ox, H);
    ctx.stroke();
}

function drawTangent(x1, y1, m) {
    let sx = ox + x1 * scale;
    let sy = oy - y1 * scale;
    ctx.strokeStyle = "#f97316"; ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(sx - 1000, sy + 1000 * m); ctx.lineTo(sx + 1000, sy - 1000 * m);
    ctx.stroke();
}

function drawNormal(x1, y1, m) {
    let sx = ox + x1 * scale;
    let sy = oy - y1 * scale;
    ctx.strokeStyle = "#d946ef"; ctx.setLineDash([5, 5]); ctx.lineWidth = 2;
    ctx.beginPath();
    if (Math.abs(m) < 0.001) { ctx.moveTo(sx, 0); ctx.lineTo(sx, H); }
    else { let mNorm = -1 / m; ctx.moveTo(sx - 1000, sy + 1000 * mNorm); ctx.lineTo(sx + 1000, sy - 1000 * mNorm); }
    ctx.stroke(); ctx.setLineDash([]);
}

function drawRightAngleMarker(x1, y1, m) {
    let sx = ox + x1 * scale; let sy = oy - y1 * scale; let size = 12;
    let angle = Math.atan(-m);
    let p1x = sx + size * Math.cos(angle); let p1y = sy + size * Math.sin(angle);
    let p2x = sx + size * Math.cos(angle - Math.PI/2); let p2y = sy + size * Math.sin(angle - Math.PI/2);
    let p3x = p1x + (p2x - sx); let p3y = p1y + (p2y - sy);
    ctx.beginPath(); ctx.strokeStyle = "#64748b"; ctx.lineWidth = 1.5;
    ctx.moveTo(p1x, p1y); ctx.lineTo(p3x, p3y); ctx.lineTo(p2x, p2y); ctx.stroke();
}

function updateTrinityDisplay(x, y, m) {
    const tooltip = document.getElementById('holyTrinity');
    document.getElementById('valX').innerText = `x = ${x.toFixed(2)}`;
    document.getElementById('valY').innerText = `y = ${y.toFixed(2)}`;
    document.getElementById('valM').innerText = `m = ${m.toFixed(2)}`;
    let b = y - m * x;
    document.getElementById('lineEqn').innerText = `משיק: y=${m.toFixed(1)}x${b>=0?'+':''}${b.toFixed(1)}`;
    let sx = ox + x * scale; let sy = oy - y * scale;
    tooltip.style.left = sx + 'px'; tooltip.style.top = sy + 'px';
    tooltip.style.display = 'flex';
}

function initMenu() {
    let sel = document.getElementById('qSelect');
    sel.innerHTML = "";
    bagrutData.forEach((q, i) => {
        let opt = document.createElement('option');
        opt.value = i; opt.text = q.t; sel.appendChild(opt);
    });
}

function loadQ(idx) {
    currentQ = idx;
    let q = bagrutData[idx];
    document.getElementById('qSelect').value = idx;
    document.getElementById('qCounter').innerText = `שאלה ${idx+1}`;
    document.getElementById('qText').innerText = q.d;
    document.getElementById('journalList').innerHTML = ""; // ניקוי יומן
    document.getElementById('successBanner').classList.remove('show');
    solvedTargets = [];
    
    // איפוס פרמטרים
    cf = [...q.p];
    document.getElementById('mA').value = cf[0];
    document.getElementById('mB').value = cf[1];
    document.getElementById('mC').value = cf[2];
    document.getElementById('mD').value = cf[3];
    
    // השבתת סליידרים נעולים
    let allSliders = ['mA','mB','mC','mD'];
    allSliders.forEach(id => document.getElementById(id).disabled = false);
    
    if(q.locked) {
        if(q.locked.includes('a')) document.getElementById('mA').disabled = true;
        if(q.locked.includes('b')) document.getElementById('mB').disabled = true;
        if(q.locked.includes('c')) document.getElementById('mC').disabled = true;
        if(q.locked.includes('d')) document.getElementById('mD').disabled = true;
    }

    if (q.type === 'move_x') {
        px = -1;
        document.getElementById('mainX').value = px;
        document.getElementById('sliderXContainer').style.display = 'flex';
        document.getElementById('holyTrinity').style.display = 'flex';
    } else {
        // מצב פרמטרים
        document.getElementById('sliderXContainer').style.display = 'none';
        document.getElementById('holyTrinity').style.display = 'none';
    }
    
    updateGame();
}

function loadQuestionFromSelect() { loadQ(parseInt(document.getElementById('qSelect').value)); }
function nextQuestion() { if (currentQ < bagrutData.length - 1) loadQ(currentQ + 1); }

/* --- אודיו --- */
function initAudio() { if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)(); }
function toggleMute() { isMuted = !isMuted; document.getElementById('btnSound').innerText = isMuted ? "🔇" : "🔊"; }
function playTone(freq, duration) {
    if (isMuted || !audioCtx) return;
    let osc = audioCtx.createOscillator(); let gain = audioCtx.createGain();
    osc.connect(gain); gain.connect(audioCtx.destination);
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
    osc.start(); osc.stop(audioCtx.currentTime + duration);
}
function animate() { /* requestAnimationFrame(animate); */ }
function zoomIn() { scale *= 1.1; draw(); }
function zoomOut() { scale /= 1.1; draw(); }
function resetZoom() { scale = baseScale; draw(); }
