/* script.js - גרסה מתוקנת ונקייה */

// --- משתנים גלובליים ---
let canvas, ctx;
let width, height;

// פרמטרים (a,b,c,d)
let a = 1, b = 0, c = 0, d = 0;
let currentX = 0;
let scale = 40; // זום
let currentQIndex = 0;
let isSolved = false;
let isDragging = false;

// --- אתחול המערכת ---
window.onload = function() {
    console.log("מערכת אותחלה...");

    // 1. בדיקת נתונים
    if (typeof bagrutData === 'undefined') {
        alert("שגיאה: קובץ השאלות bagrut_questions.js חסר.");
        return;
    }

    // 2. אתחול קנבס
    canvas = document.getElementById('graphCanvas');
    if (!canvas) {
        console.error("לא נמצא קנבס!");
        return;
    }
    ctx = canvas.getContext('2d');

    // התאמה לגודל
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // 3. אירועי עכבר/טאץ'
    canvas.addEventListener('mousedown', startDrag);
    canvas.addEventListener('mousemove', doDrag);
    window.addEventListener('mouseup', endDrag); // עדיף על window כדי למנוע "בריחה"
    
    canvas.addEventListener('touchstart', startDrag, {passive: false});
    canvas.addEventListener('touchmove', doDrag, {passive: false});
    window.addEventListener('touchend', endDrag);

    // 4. ממשק
    setupControls();

    // 5. טעינת שאלה ראשונה
    loadQuestion(0);
};

function setupControls() {
    // פרמטרים a,b,c,d
    ['a', 'b', 'c', 'd'].forEach(p => {
        const slider = document.getElementById('param' + p.toUpperCase());
        if (slider) {
            slider.addEventListener('input', (e) => {
                // עדכון המשתנה הגלובלי (למשל a = ערך)
                window[p] = parseFloat(e.target.value);
                // עדכון התצוגה המספרית
                document.getElementById('val' + p.toUpperCase()).innerText = window[p];
                updateGraph();
            });
        }
    });

    // סליידר X
    const xSlider = document.getElementById('paramX');
    if (xSlider) {
        xSlider.addEventListener('input', (e) => {
            currentX = parseFloat(e.target.value);
            document.getElementById('valX').innerText = currentX;
            updateGraph();
        });
    }
}

function resizeCanvas() {
    const container = canvas.parentElement;
    if (container) {
        width = container.clientWidth;
        height = container.clientHeight || 500;
    } else {
        width = 800; height = 500;
    }
    canvas.width = width;
    canvas.height = height;
    updateGraph();
}

// --- ניהול שאלות ---
function loadQuestion(idx) {
    if (idx >= bagrutData.length) {
        document.getElementById('questionTitle').innerText = "סיימת את המבחן! 🏆";
        document.getElementById('questionText').innerHTML = "כל הכבוד, השלמת את כל המשימות.";
        document.getElementById('successMessage').style.display = 'none';
        return;
    }

    currentQIndex = idx;
    const q = bagrutData[idx];
    isSolved = false;

    // UI Updates
    document.getElementById('successMessage').style.display = 'none';
    document.getElementById('questionTitle').innerText = q.title;
    document.getElementById('questionText').innerHTML = q.instruction;

    // הגדרת פרמטרים ונעילות
    ['a', 'b', 'c', 'd'].forEach(p => {
        const val = q.setup[p];
        window[p] = val; // עדכון לוגי
        
        const slider = document.getElementById('param' + p.toUpperCase());
        const label = document.getElementById('val' + p.toUpperCase());
        
        if (slider) {
            slider.value = val;
            if (label) label.innerText = val;

            const isLocked = q.locked.includes(p);
            slider.disabled = isLocked;
            slider.parentElement.style.opacity = isLocked ? "0.5" : "1";
        }
    });

    // טיפול ב-X
    const xSlider = document.getElementById('paramX');
    if (q.type === 'find_param') {
        // נועלים את X, המשתמש צריך לשחק עם הפרמטרים
        currentX = q.targetPoint ? q.targetPoint.x : 0;
        xSlider.value = currentX;
        xSlider.disabled = true;
        xSlider.parentElement.style.opacity = "0.5";
    } else {
        // חקירה רגילה
        currentX = 0;
        xSlider.value = 0;
        xSlider.disabled = false;
        xSlider.parentElement.style.opacity = "1";
    }
    document.getElementById('valX').innerText = currentX;

    updateGraph();
}

// --- מתמטיקה ---
function f(x) {
    return a * Math.pow(x, 3) + b * Math.pow(x, 2) + c * x + d; 
}

function df(x) {
    return 3 * a * Math.pow(x, 2) + 2 * b * x + c;
}

// --- ציור ---
function updateGraph() {
    if (!ctx) return;
    
    // ניקוי
    ctx.clearRect(0, 0, width, height);
    
    drawGrid();
    drawAxes();

    // ציור הפונקציה
    ctx.beginPath();
    ctx.strokeStyle = "#007bff";
    ctx.lineWidth = 3;

    // ציור מפוטר לאמצע הקנבס
    const centerX = width / 2;
    const centerY = height / 2;

    for (let px = 0; px <= width; px++) {
        let xMath = (px - centerX) / scale;
        let yMath = f(xMath);
        let py = centerY - yMath * scale;
        
        if (px === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
    }
    ctx.stroke();

    drawTangent(currentX);

    // נקודת מטרה
    const q = bagrutData[currentQIndex];
    if (q && q.type === 'find_param' && q.targetPoint) {
        drawTargetPoint(q.targetPoint);
    }

    if (!isSolved) checkAnswer();
}

function drawGrid() {
    ctx.beginPath();
    ctx.strokeStyle = "#eee";
    ctx.lineWidth = 1;
    
    const cx = width / 2;
    const cy = height / 2;

    for (let x = cx; x < width; x += scale) { ctx.moveTo(x, 0); ctx.lineTo(x, height); }
    for (let x = cx; x > 0; x -= scale) { ctx.moveTo(x, 0); ctx.lineTo(x, height); }
    
    for (let y = cy; y < height; y += scale) { ctx.moveTo(0, y); ctx.lineTo(width, y); }
    for (let y = cy; y > 0; y -= scale) { ctx.moveTo(0, y); ctx.lineTo(width, y); }
    
    ctx.stroke();
}

function drawAxes() {
    ctx.beginPath();
    ctx.strokeStyle = "#333";
    ctx.lineWidth = 2;
    
    const cx = width / 2;
    const cy = height / 2;

    // X axis
    ctx.moveTo(0, cy); ctx.lineTo(width, cy);
    // Y axis
    ctx.moveTo(cx, 0); ctx.lineTo(cx, height);
    ctx.stroke();
    
    // מספרים
    ctx.font = "12px Arial";
    ctx.fillStyle = "#666";
    ctx.textAlign = "center";
    
    for (let i = -10; i <= 10; i++) {
        if (i === 0) continue;
        let px = cx + i * scale;
        if (px > 0 && px < width) ctx.fillText(i, px, cy + 20);
    }
}

function drawTangent(x0) {
    let y0 = f(x0);
    let m = df(x0);
    
    let px = width / 2 + x0 * scale;
    let py = height / 2 - y0 * scale;

    // קו משיק
    let len = 3; 
    let x1 = x0 - len;
    let y1 = y0 - m * len;
    let x2 = x0 + len;
    let y2 = y0 + m * len;
    
    ctx.beginPath();
    ctx.strokeStyle = "#ff9800";
    ctx.lineWidth = 2;
    ctx.moveTo(width / 2 + x1 * scale, height / 2 - y1 * scale);
    ctx.lineTo(width / 2 + x2 * scale, height / 2 - y2 * scale);
    ctx.stroke();

    // נקודה
    ctx.beginPath();
    ctx.arc(px, py, 6, 0, 2 * Math.PI);
    ctx.fillStyle = "#ff9800";
    ctx.fill();
    ctx.stroke();
}

function drawTargetPoint(pt) {
    let px = width / 2 + pt.x * scale;
    let py = height / 2 - pt.y * scale;
    
    ctx.beginPath();
    ctx.arc(px, py, 5, 0, 2 * Math.PI);
    ctx.fillStyle = "red";
    ctx.fill();
    ctx.fillText(`(${pt.x},${pt.y})`, px + 10, py - 10);
}

// --- גרירה ---
function getMousePos(evt) {
    const rect = canvas.getBoundingClientRect();
    const cX = evt.touches ? evt.touches[0].clientX : evt.clientX;
    const cY = evt.touches ? evt.touches[0].clientY : evt.clientY;
    return { x: cX - rect.left, y: cY - rect.top };
}

function startDrag(evt) {
    const q = bagrutData[currentQIndex];
    if (q.type === 'find_param') return; 

    const pos = getMousePos(evt);
    let px = width / 2 + currentX * scale;
    if (Math.abs(pos.x - px) < 40) { // מרחב תפיסה נוח
        isDragging = true;
        evt.preventDefault();
    }
}

function doDrag(evt) {
    if (!isDragging) return;
    evt.preventDefault();
    
    const pos = getMousePos(evt);
    let newX = (pos.x - width / 2) / scale;
    
    if (newX < -10) newX = -10;
    if (newX > 10) newX = 10;
    
    // Snap (מגנט) לחצאי שלמים
    let rounded = Math.round(newX * 2) / 2;
    if (Math.abs(newX - rounded) < 0.2) newX = rounded;
    else newX = Math.round(newX * 10) / 10;

    currentX = newX;
    
    const xSlider = document.getElementById('paramX');
    if (xSlider) xSlider.value = currentX;
    document.getElementById('valX').innerText = currentX;
    
    updateGraph();
}

function endDrag() {
    isDragging = false;
}

// --- בדיקה ---
function checkAnswer() {
    const q = bagrutData[currentQIndex];
    // אנחנו בודקים את הפונקציה לפי הפרמטרים הנוכחיים וה-X הנוכחי
    let curY = f(currentX);
    let curM = df(currentX);
    let win = false;
    let tolerance = 0.15;

    if (q.goal === 'm0' && Math.abs(curM) < tolerance) win = true; // מינימום/מקסימום
    else if (q.goal === 'slope_val' && Math.abs(curM - q.targetVal) < tolerance) win = true;
    else if (q.goal === 'hit_target' && Math.abs(curY - q.targetPoint.y) < tolerance) win = true;
    else if (q.goal === 'y0' && Math.abs(curY) < tolerance) {
        if (!q.targetRegion || (currentX > q.targetRegion.min && currentX < q.targetRegion.max)) {
            win = true;
        }
    }

    if (win) {
        isSolved = true;
        const msg = document.getElementById('successMessage');
        msg.style.display = 'block';
        msg.innerHTML = "<strong>כל הכבוד! 🎉 תשובה נכונה.</strong>";
        
        addToJournal(q.id);
        
        setTimeout(() => {
            if (currentQIndex < bagrutData.length - 1) {
                loadQuestion(currentQIndex + 1);
            } else {
                msg.innerHTML = "סיימת את כל השאלות!";
            }
        }, 2000);
    }
}

function addToJournal(qId) {
    const list = document.getElementById('journalList');
    const li = document.createElement('li');
    li.innerHTML = `✅ שאלה ${qId} נפתרה <br> <small>x=${currentX}, m=${df(currentX).toFixed(1)}</small>`;
    list.prepend(li);
}
