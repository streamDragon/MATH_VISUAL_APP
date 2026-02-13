/* script.js - לוגיקה ראשית
   מסתמך על קובץ bagrutQuestions.js עבור הנתונים
*/

// --- משתנים גלובליים ---
let canvas, ctx;
let width, height;
let a = 1, b = 0, c = 0, d = 0; 
let currentX = 0; 
let scale = 40; 
let currentQIndex = 0;
let isSolved = false; 

// --- אתחול המערכת ---
window.onload = function() {
    // וידוא שהנתונים נטענו
    if (typeof bagrutData === 'undefined') {
        alert("שגיאה: קובץ השאלות לא נטען. בדוק את ה-HTML.");
        return;
    }

    canvas = document.getElementById('graphCanvas');
    ctx = canvas.getContext('2d');
    resizeCanvas();
    
    window.addEventListener('resize', resizeCanvas);

    // מאזינים לסליידרים של הפרמטרים
    ['a', 'b', 'c', 'd'].forEach(p => {
        const slider = document.getElementById(`param${p.toUpperCase()}`);
        if(slider) {
            slider.addEventListener('input', (e) => {
                window[p] = parseFloat(e.target.value);
                const label = document.getElementById(`val${p.toUpperCase()}`);
                if(label) label.innerText = window[p];
                updateGraph();
            });
        }
    });

    // מאזין לסליידר ה-X
    const xSlider = document.getElementById('paramX');
    if(xSlider) {
        xSlider.addEventListener('input', (e) => {
            currentX = parseFloat(e.target.value);
            updateGraph();
        });
    }

    loadQuestion(0);
};

function resizeCanvas() {
    const container = canvas.parentElement;
    if (container) {
        width = container.clientWidth;
        canvas.width = width;
    } else {
        width = 800; // ברירת מחדל
        canvas.width = width;
    }
    height = 500;
    canvas.height = height;
    updateGraph();
}

// --- טעינת שאלה ---
function loadQuestion(idx) {
    // כאן השינוי - משתמשים ב-bagrutData
    currentQIndex = idx;
    const q = bagrutData[idx]; 
    isSolved = false;
    
    const successMsg = document.getElementById('successMessage');
    if(successMsg) successMsg.style.display = 'none';

    const titleEl = document.getElementById('questionTitle');
    const textEl = document.getElementById('questionText');
    if(titleEl) titleEl.innerText = q.title;
    if(textEl) textEl.innerHTML = q.instruction;

    // איפוס פרמטרים
    ['a', 'b', 'c', 'd'].forEach(p => {
        const val = q.setup[p];
        window[p] = val;
        const slider = document.getElementById(`param${p.toUpperCase()}`);
        const label = document.getElementById(`val${p.toUpperCase()}`);
        
        if (slider) {
            slider.value = val;
            slider.disabled = q.locked.includes(p);
            slider.parentElement.style.opacity = q.locked.includes(p) ? "0.4" : "1";
            slider.parentElement.style.pointerEvents = q.locked.includes(p) ? "none" : "auto";
        }
        if (label) label.innerText = val;
    });

    // הגדרת מצב עבודה (הזזת X או פרמטרים)
    const xSlider = document.getElementById('paramX');
    if (xSlider) {
        if (q.type === 'find_param') {
            currentX = q.targetPoint.x;
            xSlider.value = currentX;
            xSlider.disabled = true;
            xSlider.parentElement.style.opacity = "0.5";
        } else {
            currentX = 0;
            xSlider.value = 0;
            xSlider.disabled = false;
            xSlider.parentElement.style.opacity = "1";
        }
    }

    updateGraph();
}

// --- מתמטיקה ---
function f(x) {
    return a * x * x * x + b * x * x + c * x + d; 
}

function df(x) {
    return 3 * a * x * x + 2 * b * x + c;
}

// --- ציור הגרף ---
function updateGraph() {
    if (!ctx) return;
    
    ctx.clearRect(0, 0, width, height);
    drawAxes();

    ctx.beginPath();
    ctx.strokeStyle = "#007bff";
    ctx.lineWidth = 3;
    
    for (let px = 0; px < width; px++) {
        let xMath = (px - width / 2) / scale;
        let yMath = f(xMath);
        let py = height / 2 - yMath * scale;
        
        if (px === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
    }
    ctx.stroke();

    drawTangent(currentX);

    // ציור מטרות
    const q = bagrutData[currentQIndex];
    if (q.type === 'find_param' && q.targetPoint) {
        let tx = q.targetPoint.x;
        let ty = q.targetPoint.y;
        
        if (ty !== undefined) {
            let tPx = width / 2 + tx * scale;
            let tPy = height / 2 - ty * scale;
            
            ctx.beginPath();
            ctx.arc(tPx, tPy, 8, 0, 2 * Math.PI);
            ctx.strokeStyle = "rgba(255, 0, 0, 0.5)";
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(tPx, tPy, 2, 0, 2 * Math.PI);
            ctx.fillStyle = "red";
            ctx.fill();
        }
    }

    if (!isSolved) checkAnswer();
}

function drawAxes() {
    ctx.beginPath();
    ctx.strokeStyle = "#aaa";
    ctx.lineWidth = 1;
    ctx.moveTo(0, height / 2);
    ctx.lineTo(width, height / 2);
    ctx.moveTo(width / 2, 0);
    ctx.lineTo(width / 2, height);
    ctx.stroke();
}

function drawTangent(x0) {
    let y0 = f(x0);
    let m = df(x0);
    let px = width / 2 + x0 * scale;
    let py = height / 2 - y0 * scale;

    ctx.beginPath();
    ctx.arc(px, py, 6, 0, 2 * Math.PI);
    ctx.fillStyle = "#ff9800";
    ctx.fill();

    let lineLength = 2;
    let x1 = x0 - lineLength;
    let y1 = y0 - m * lineLength;
    let x2 = x0 + lineLength;
    let y2 = y0 + m * lineLength;

    ctx.beginPath();
    ctx.strokeStyle = "#ff9800";
    ctx.lineWidth = 2;
    ctx.moveTo(width / 2 + x1 * scale, height / 2 - y1 * scale);
    ctx.lineTo(width / 2 + x2 * scale, height / 2 - y2 * scale);
    ctx.stroke();
}

// --- בדיקת תשובות ---
function checkAnswer() {
    const q = bagrutData[currentQIndex];
    
    let curY = f(currentX);
    let curM = df(currentX);
    let tolerance = 0.15;
    let win = false;

    switch (q.goal) {
        case 'm0': 
            if (Math.abs(curM) < 0.1) win = true;
            break;
        case 'y0': 
            if (Math.abs(curY) < 0.1) {
                if (q.targetRegion) {
                    if (currentX > q.targetRegion.min && currentX < q.targetRegion.max) win = true;
                } else { win = true; }
            }
            break;
        case 'slope_val': 
            if (Math.abs(curM - q.targetVal) < 0.1) win = true;
            break;
        case 'hit_target': 
            if (Math.abs(curY - q.targetPoint.y) < tolerance) win = true;
            break;
        case 'slope_at_x': 
            if (Math.abs(curM - q.targetPoint.m) < tolerance) win = true;
            break;
        case 'complex': 
            if (Math.abs(curY - q.targetPoint.y) < tolerance && 
                Math.abs(curM - q.targetPoint.m) < tolerance) win = true;
            break;
    }

    if (win) {
        isSolved = true;
        showSuccess();
    }
}

function showSuccess() {
    const msg = document.getElementById('successMessage');
    if(msg) {
        msg.style.display = 'block';
        msg.innerText = "כל הכבוד! 🎉";
    }
    
    const q = bagrutData[currentQIndex];
    let entryText = q.journalEq ? (q.journalEq + " ✅") : `שאלה ${q.id} נפתרה`;
    
    addJournalEntry(entryText);

    setTimeout(() => {
        if (currentQIndex < bagrutData.length - 1) {
            loadQuestion(currentQIndex + 1);
        } else {
            if(msg) msg.innerText = "סיימת את כל המשימות! אלופ/ה! 🏆";
        }
    }, 2500);
}

function addJournalEntry(text) {
    const journalList = document.getElementById('journalList');
    if (!journalList) return;

    const li = document.createElement('li');
    li.textContent = text;
    li.style.borderBottom = "1px solid #eee";
    li.style.padding = "5px 0";
    li.style.color = "#28a745";
    
    journalList.insertBefore(li, journalList.firstChild);
}
