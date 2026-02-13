<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
    <title>מערכת חקר פונקציות</title>
    
    <link href="https://fonts.googleapis.com/css2?family=Rubik:wght@400;500;700&display=swap" rel="stylesheet">
    <script id="MathJax-script" async src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"></script>

    <style>
        :root {
            --primary: #2563eb;
            --accent: #16a34a;
            --bg-sidebar: #ffffff;
            --bg-app: #f8fafc;
            --header-h: 0px; /* אין הדר עליון כרגע */
        }

        * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }

        body { 
            margin: 0; padding: 0; 
            font-family: 'Rubik', sans-serif; 
            background: var(--bg-app); 
            /* שימוש ב-dvh פותר בעיות גובה במובייל */
            height: 100dvh; 
            width: 100vw;
            overflow: hidden; 
            display: flex; 
            flex-direction: column;
            /* מינימום גודל כדי שהעיצוב לא ישבר */
            min-width: 320px;
            min-height: 500px;
        }

        /* מיכל ראשי */
        #app { 
            display: flex; 
            flex: 1; 
            height: 100%; 
            overflow: hidden; 
        }
        
        /* === צד ימין (תפריט) === */
        aside {
            width: 340px; 
            background: var(--bg-sidebar); 
            border-left: 1px solid #cbd5e1;
            display: flex; 
            flex-direction: column; 
            padding: 15px; 
            gap: 12px;
            overflow-y: auto; /* מאפשר גלילה אם התפריט ארוך מדי */
            z-index: 20; 
            box-shadow: 2px 0 10px rgba(0,0,0,0.05);
            flex-shrink: 0; /* מונע כיווץ יתר */
        }

        /* === צד שמאל (גרף) === */
        main { 
            flex: 1; 
            position: relative; 
            background: #fff; 
            cursor: crosshair; 
            overflow: hidden;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        canvas { 
            display: block; 
            width: 100%; 
            height: 100%; 
            touch-action: none; /* מונע גלילה של הדף כשנוגעים בגרף */
        }

        /* === אלמנטים UI === */
        .card { 
            background: #f8fafc; 
            border: 1px solid #e2e8f0; 
            border-radius: 10px; 
            padding: 12px; 
            box-shadow: 0 1px 3px rgba(0,0,0,0.05);
        }
        
        h2 { font-size: 1.2rem; margin: 0 0 10px 0; color: #0f172a; }
        h3 { margin: 0 0 8px 0; font-size: 1rem; color: #334155; }
        p { margin: 0; font-size: 0.9rem; color: #475569; line-height: 1.4; }

        /* סליידרים משופרים למגע */
        .control-row { 
            display: flex; 
            align-items: center; 
            justify-content: space-between; 
            margin-bottom: 12px; 
            height: 30px;
        }
        .control-row label { 
            font-size: 0.95rem; 
            font-weight: 500; 
            width: 75px; 
            flex-shrink: 0;
        }
        input[type=range] { 
            flex: 1; 
            cursor: pointer; 
            accent-color: var(--primary); 
            height: 20px; /* אזור מגע גדול יותר */
            margin: 0 10px;
        }
        .val-display { 
            font-family: monospace; 
            width: 45px; 
            text-align: left; 
            color: var(--primary); 
            font-weight: bold; 
            font-size: 1rem;
        }

        /* כפתור */
        .btn-next {
            margin-top: auto; 
            padding: 12px; 
            background: var(--primary); 
            color: white; 
            border: none; 
            border-radius: 8px; 
            font-size: 1rem; 
            font-weight: bold;
            cursor: pointer;
            transition: transform 0.1s;
            width: 100%;
        }
        .btn-next:active { transform: scale(0.98); }

        /* === דף נוסחאות צף === */
        #paper-hud {
            position: absolute; 
            top: 20px; 
            right: 20px; /* בצד ימין למעלה */
            width: auto;
            max-width: 260px;
            background: rgba(255, 255, 255, 0.95);
            padding: 15px; 
            border-radius: 12px;
            border: 1px solid #cbd5e1;
            box-shadow: 0 4px 15px rgba(0,0,0,0.08);
            pointer-events: none; 
            direction: ltr; /* נוסחאות משמאל לימין */
            text-align: left;
            transition: opacity 0.3s;
        }
        .formula-line { font-family: 'Times New Roman', serif; font-size: 1.2rem; margin-bottom: 6px; color: #0f172a; }
        .formula-label { font-size: 0.8rem; color: #64748b; font-weight: bold; margin-bottom: 2px; display: block; font-family: 'Rubik'; text-align: right; }

        /* הודעת ניצחון */
        #toast { 
            position: absolute; top: 30px; left: 50%; transform: translate(-50%, -200%);
            background: var(--accent); color: white; padding: 12px 24px; border-radius: 50px;
            transition: 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); 
            z-index: 100; font-weight: bold; box-shadow: 0 10px 25px rgba(0,0,0,0.2);
            font-size: 1.1rem; width: max-content;
        }
        #toast.show { transform: translate(-50%, 0); }

        /* ========================================= */
        /* MEDIA QUERIES - התאמה למובייל */
        /* ========================================= */
        @media (max-width: 768px) {
            #app { 
                flex-direction: column-reverse; /* גרף למעלה, פקדים למטה */
            }

            /* הגרף מקבל לפחות 45% גובה, אבל גדל אם יש מקום */
            main { 
                flex: 1;
                min-height: 40%;
                border-bottom: 1px solid #cbd5e1;
            }

            /* אזור השליטה - למטה */
            aside {
                width: 100%;
                height: auto;
                max-height: 55%; /* לא יותר מ-55% מהמסך */
                border-left: none;
                border-top: 1px solid #cbd5e1;
                padding: 12px;
                gap: 10px;
            }

            /* הקטנת כרטיסים במובייל לחסכון במקום */
            .card { padding: 10px; margin-bottom: 5px; }
            h2 { font-size: 1.1rem; display: none; /* מסתירים את הכותרת הראשית במובייל לחסכון במקום */ }
            
            /* דף הנוסחאות קטן יותר וזז לפינה */
            #paper-hud {
                top: 10px;
                right: 10px;
                padding: 10px;
                transform: scale(0.85);
                transform-origin: top right;
                max-width: 200px;
                background: rgba(255,255,255,0.85); /* יותר שקוף במובייל */
            }
        }
    </style>
</head>
<body>

<div id="toast">🎉 כל הכבוד! הצלחת</div>

<div id="app">
    <aside>
        <h2 id="mainTitle">מעבדת חקירה</h2>
        
        <div class="card" style="border-right: 4px solid var(--primary);">
            <div style="display:flex; justify-content:space-between; align-items:center;">
                <h3>שאלה:</h3>
                <span id="qIndexBadge" style="background:#e2e8f0; padding:2px 8px; border-radius:12px; font-size:0.8rem; font-weight:bold;">1/5</span>
            </div>
            <select id="qSelect" onchange="gameLoadQuestion(this.value)" style="width:100%; margin: 6px 0; padding: 6px; border-radius:6px; border:1px solid #ccc; font-size:1rem;"></select>
            <p id="qDesc" style="font-size:0.85rem; margin-top:4px;">טוען...</p>
        </div>

        <div class="card">
            <h3>פרמטרים</h3>
            <div class="control-row"><label>a (x³)</label><input type="range" id="inpA" min="-2" max="2" step="0.1" oninput="sysUpdate()"><div class="val-display" id="valA">0</div></div>
            <div class="control-row"><label>b (x²)</label><input type="range" id="inpB" min="-4" max="4" step="0.1" oninput="sysUpdate()"><div class="val-display" id="valB">0</div></div>
            <div class="control-row"><label>c (x)</label><input type="range" id="inpC" min="-5" max="5" step="0.1" oninput="sysUpdate()"><div class="val-display" id="valC">0</div></div>
            <div class="control-row"><label>d (מספר)</label><input type="range" id="inpD" min="-5" max="5" step="0.1" oninput="sysUpdate()"><div class="val-display" id="valD">0</div></div>
        </div>

        <div class="card" style="border-right: 4px solid #f97316;">
            <h3 style="display:flex; justify-content:space-between;">
                <span>נקודת השקה (X)</span>
                <span id="valSlope" style="color:black; font-weight:bold;">m=0.00</span>
            </h3>
            <div class="control-row" style="margin-bottom:0;">
                <input type="range" id="inpX" min="-5" max="5" step="0.1" oninput="sysUpdate()">
                <div class="val-display" id="valX" style="color:#f97316;">0</div>
            </div>
        </div>
        
        <button class="btn-next" onclick="gameNext()">השאלה הבאה &larr;</button>
    </aside>

    <main id="graphContainer">
        <canvas id="cvs"></canvas>
        
        <div id="paper-hud">
            <span class="formula-label">פונקציה:</span>
            <div class="formula-line" id="mathFunc" style="color:var(--primary);">f(x) = ...</div>
            
            <div style="margin-top:8px; border-top:1px dashed #cbd5e1; padding-top:8px;">
                <span class="formula-label">נגזרת:</span>
                <div class="formula-line" id="mathDerivText" style="font-size:1rem;">f'(x) = ...</div>
                
                <span class="formula-label">שיפוע בנקודה:</span>
                <div class="formula-line" id="mathCalc" style="color:#ef4444; margin-bottom:0;">f'(...) = ...</div>
            </div>
        </div>
    </main>
</div>

<script src="questions.js"></script>

<script>
/**
 * ============================================================
 * SECTION 1: SYSTEM & INIT
 * ============================================================
 */
const cvs = document.getElementById('cvs');
const ctx = cvs.getContext('2d');
let width, height, scale = 40, originX, originY;

// משתני הפונקציה
let a=0, b=0, c=0, d=0, xVal=0;

// מצב משחק
let currQIndex = 0;
let isSolved = false;

window.onload = function() {
    // בדיקה שהקובץ שאלות נטען
    if (typeof QUESTIONS === 'undefined') {
        document.getElementById('qDesc').innerText = "שגיאה: קובץ השאלות לא נמצא.";
        return;
    }

    initResize();
    initUI();
    gameLoadQuestion(0);
    animate();
};

function initResize() {
    const container = document.getElementById('graphContainer');
    const resize = () => {
        // שימוש בגודל המיכל ולא החלון כולו
        width = cvs.width = container.clientWidth;
        height = cvs.height = container.clientHeight;
        
        // המרכז תמיד באמצע הקנבס
        originX = width / 2;
        originY = height / 2;
        
        // התאמת קנה מידה למובייל
        if (width < 500) scale = 30; 
        else scale = 40;
        
        sysUpdate();
    };
    
    // האזנה לשינויי גודל וגם לשינוי אוריינטציה (סיבוב מסך)
    window.addEventListener('resize', resize);
    window.addEventListener('orientationchange', () => setTimeout(resize, 100));
    resize();
}

function initUI() {
    const sel = document.getElementById('qSelect');
    QUESTIONS.forEach((q, i) => {
        let opt = document.createElement('option');
        opt.value = i;
        opt.innerText = q.title;
        sel.appendChild(opt);
    });
}

/**
 * ============================================================
 * SECTION 2: LOGIC
 * ============================================================
 */
function gameLoadQuestion(idx) {
    currQIndex = parseInt(idx);
    const q = QUESTIONS[currQIndex];
    isSolved = false;
    
    // עדכון טקסטים
    document.getElementById('qSelect').value = currQIndex;
    document.getElementById('qIndexBadge').innerText = `${currQIndex + 1}/${QUESTIONS.length}`;
    document.getElementById('qDesc').innerText = q.desc;
    document.getElementById('toast').classList.remove('show');

    // טעינת פרמטרים
    [a, b, c, d] = q.params;
    document.getElementById('inpA').value = a;
    document.getElementById('inpB').value = b;
    document.getElementById('inpC').value = c;
    document.getElementById('inpD').value = d;
    
    // איפוס X
    xVal = 0;
    document.getElementById('inpX').value = 0;

    // נעילות
    const allInputs = ['inpA', 'inpB', 'inpC', 'inpD', 'inpX'];
    allInputs.forEach(id => {
        const el = document.getElementById(id);
        el.disabled = false;
        el.parentElement.style.opacity = "1";
    });
    
    if (q.locked) {
        q.locked.forEach(id => {
            const el = document.getElementById(id);
            if(el) {
                el.disabled = true;
                el.parentElement.style.opacity = "0.5";
            }
        });
    }

    sysUpdate();
}

function gameNext() {
    if (currQIndex < QUESTIONS.length - 1) {
        gameLoadQuestion(currQIndex + 1);
    } else {
        alert("סיימת את כל השאלות! כל הכבוד.");
    }
}

function sysUpdate() {
    // קריאת ערכים
    a = parseFloat(document.getElementById('inpA').value);
    b = parseFloat(document.getElementById('inpB').value);
    c = parseFloat(document.getElementById('inpC').value);
    d = parseFloat(document.getElementById('inpD').value);
    xVal = parseFloat(document.getElementById('inpX').value);

    // עדכון תצוגה מספרית
    document.getElementById('valA').innerText = a;
    document.getElementById('valB').innerText = b;
    document.getElementById('valC').innerText = c;
    document.getElementById('valD').innerText = d;
    document.getElementById('valX').innerText = xVal.toFixed(1);

    // חישובים
    let slope = 3*a*xVal*xVal + 2*b*xVal + c;
    
    // עדכון צבע שיפוע
    const elSlope = document.getElementById('valSlope');
    elSlope.innerText = "m=" + slope.toFixed(2);
    if(Math.abs(slope) < 0.1) {
        elSlope.style.color = '#16a34a'; // ירוק
        elSlope.style.background = '#dcfce7';
        elSlope.style.padding = '0 4px';
        elSlope.style.borderRadius = '4px';
    } else {
        elSlope.style.color = 'black';
        elSlope.style.background = 'transparent';
    }

    updateHudText(slope);
    checkWinCondition(slope);
}

function updateHudText(slope) {
    // בניית מחרוזת פונקציה
    let txt = "f(x) = ";
    let terms = [];
    if (a !== 0) terms.push(`${a}x³`);
    if (b !== 0) terms.push(`${b}x²`);
    if (c !== 0) terms.push(`${c}x`);
    if (d !== 0) terms.push(`${d}`);
    if (terms.length === 0) txt += "0";
    else txt += terms.join(" + ").replace(/\+ -/g, "- ");
    
    document.getElementById('mathFunc').innerText = txt;
    
    // בניית מחרוזת נגזרת כללית
    let dTerms = [];
    if (a !== 0) dTerms.push(`${(3*a).toFixed(1)}x²`); // מעגל כדי לחסוך מקום
    if (b !== 0) dTerms.push(`${(2*b).toFixed(1)}x`);
    if (c !== 0) dTerms.push(`${c}`);
    let dTxt = dTerms.length > 0 ? dTerms.join(" + ").replace(/\+ -/g, "- ") : "0";
    
    document.getElementById('mathDerivText').innerText = "f'(x) = " + dTxt;
    document.getElementById('mathCalc').innerText = `f'(${xVal}) = ${slope.toFixed(2)}`;
}

function checkWinCondition(slope) {
    if (isSolved) return;
    const q = QUESTIONS[currQIndex];
    if (q.goal === 'free') return;

    let solved = false;
    
    // בדיקת מינימום/מקסימום (שיפוע 0)
    if (q.goal === 'slope_zero') {
        let dist = Math.abs(slope);
        if (q.targetX !== undefined) dist += Math.abs(xVal - q.targetX);
        if (dist < 0.2) solved = true; // סף קל יותר למובייל
    }
    
    // בדיקת פגיעה במטרה
    if (q.goal === 'hit_target') {
        let totalErr = 0;
        q.targets.forEach(t => {
            let y = a*t.x**3 + b*t.x**2 + c*t.x + d;
            totalErr += Math.abs(y - t.y);
        });
        if (totalErr < 0.2) solved = true;
    }

    if (solved) {
        isSolved = true;
        document.getElementById('toast').classList.add('show');
        setTimeout(() => document.getElementById('toast').classList.remove('show'), 3000);
    }
}

/**
 * ============================================================
 * SECTION 3: GRAPHICS
 * ============================================================
 */
function animate() {
    draw();
    requestAnimationFrame(animate);
}

function draw() {
    ctx.clearRect(0, 0, width, height);
    drawGrid();

    // ציור מטרות
    const q = QUESTIONS[currQIndex];
    if (q.targets) {
        q.targets.forEach(t => drawTargetPoint(t.x, t.y));
    }

    // ציור הפונקציה
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#2563eb';
    ctx.beginPath();
    let started = false;
    for (let px = 0; px < width; px+=3) { // קפיצות של 3 פיקסלים לביצועים טובים יותר במובייל
        let x = (px - originX) / scale;
        let y = a*x**3 + b*x**2 + c*x + d;
        let py = originY - y * scale;
        
        // הגנה מפני מספרים אינסופיים
        if (py < -1000 || py > height + 1000) {
            started = false;
            continue;
        }

        if (!started) { ctx.moveTo(px, py); started = true; }
        else ctx.lineTo(px, py);
    }
    ctx.stroke();

    // משיק
    let y0 = a*xVal**3 + b*xVal**2 + c*xVal + d;
    let m = 3*a*xVal**2 + 2*b*xVal + c;
    
    // ציור קו משיק
    let tanLen = 3; // אורך המשיק
    let x1 = xVal - tanLen;
    let y1 = m*(x1-xVal) + y0;
    let x2 = xVal + tanLen;
    let y2 = m*(x2-xVal) + y0;
    
    ctx.beginPath();
    ctx.strokeStyle = '#f97316'; // כתום
    ctx.lineWidth = 2;
    ctx.moveTo(originX + x1*scale, originY - y1*scale);
    ctx.lineTo(originX + x2*scale, originY - y2*scale);
    ctx.stroke();

    // נקודה כחולה על הגרף
    ctx.fillStyle = '#2563eb';
    ctx.beginPath(); 
    ctx.arc(originX + xVal*scale, originY - y0*scale, 6, 0, Math.PI*2); 
    ctx.fill();
}

function drawGrid() {
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    ctx.beginPath();
    
    // קווים אנכיים
    for (let x = originX % scale; x < width; x += scale) {
        ctx.moveTo(x, 0); ctx.lineTo(x, height);
    }
    // קווים אופקיים
    for (let y = originY % scale; y < height; y += scale) {
        ctx.moveTo(0, y); ctx.lineTo(width, y);
    }
    ctx.stroke();

    // צירים ראשיים
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, originY); ctx.lineTo(width, originY);
    ctx.moveTo(originX, 0); ctx.lineTo(originX, height);
    ctx.stroke();
    
    // מספרים (רק כל 2 יחידות כדי לא להעמיס במובייל)
    ctx.fillStyle = '#64748b';
    ctx.font = '12px sans-serif';
    ctx.fillText('0', originX + 4, originY + 16);
}

function drawTargetPoint(x, y) {
    let px = originX + x * scale;
    let py = originY - y * scale;
    
    // הילה
    ctx.fillStyle = 'rgba(22, 163, 74, 0.2)'; 
    ctx.beginPath(); ctx.arc(px, py, 15, 0, Math.PI*2); ctx.fill();
    
    // נקודה
    ctx.fillStyle = '#16a34a';
    ctx.beginPath(); ctx.arc(px, py, 6, 0, Math.PI*2); ctx.fill();
}
</script>
</body>
</html>
