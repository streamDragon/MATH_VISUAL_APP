/* script.js - המנוע המלא הכולל ניווט ותיקון באגים */

// --- משתנים גלובליים ---
let canvas, ctx;
let width, height;

// פרמטרים (a*x^3 + b*x^2 + c*x + d)
let a = 0, b = 1, c = 0, d = 0;
let currentX = 0;
let scale = 40; // זום (פיקסלים ליחידה)
let currentQIndex = 0;
let isSolved = false;
let isDragging = false;

// --- אתחול המערכת ---
window.onload = function() {
    if (typeof bagrutData === 'undefined') {
        alert("שגיאה: קובץ השאלות חסר. וודא ש-bagrut_questions.js נטען."); return;
    }

    canvas = document.getElementById('graphCanvas');
    ctx = canvas.getContext('2d');
    
    // התאמה לגודל חלון
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // אירועי עכבר וגרירה (כולל מובייל)
    canvas.addEventListener('mousedown', startDrag);
    window.addEventListener('mousemove', doDrag);
    window.addEventListener('mouseup', endDrag);
    canvas.addEventListener('touchstart', startDrag, {passive: false});
    window.addEventListener('touchmove', doDrag, {passive: false});
    window.addEventListener('touchend', endDrag);

    setupControls();
    setupNavigation();
    loadQuestion(0);
};

function resizeCanvas() {
    const container = canvas.parentElement;
    width = container.clientWidth;
    height = container.clientHeight;
    canvas.width = width;
    canvas.height = height;
    updateGraph();
}

// --- הגדרת כפתורים וסליידרים ---
function setupControls() {
    ['a', 'b', 'c', 'd'].forEach(p => {
        const slider = document.getElementById('param' + p.toUpperCase());
        slider.addEventListener('input', (e) => {
            window[p] = parseFloat(e.target.value);
            document.getElementById('val' + p.toUpperCase()).innerText = window[p];
            updateGraph();
        });
    });

    const xSlider = document.getElementById('paramX');
    xSlider.addEventListener('input', (e) => {
        currentX = parseFloat(e.target.value);
        document.getElementById('valX').innerText = currentX;
        updateGraph();
    });
}

// --- הגדרת מערכת הניווט ---
function setupNavigation() {
    const btnPrev = document.getElementById('btnPrev');
    const btnNext = document.getElementById('btnNext');
    const select = document.getElementById('selectQuestion');

    // מילוי הרשימה הנפתחת בשאלות
    bagrutData.forEach((q, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.text = `שאלה ${q.id}: ${q.title.split(':')[1] ? q.title.split(':')[1].trim() : q.title}`;
        select.appendChild(option);
    });

    // מאזינים לכפתורים
    btnPrev.addEventListener('click', () => {
        if (currentQIndex > 0) loadQuestion(currentQIndex - 1);
    });

    btnNext.addEventListener('click', () => {
        if (currentQIndex < bagrutData.length - 1) loadQuestion(currentQIndex + 1);
    });

    select.addEventListener('change', (e) => {
        loadQuestion(parseInt(e.target.value));
    });
}

// --- טעינת שאלה ---
function loadQuestion(idx) {
    currentQIndex = idx;
    const q = bagrutData[idx];
    isSolved = false;

    // עדכון כפתורי ניווט
    document.getElementById('selectQuestion').value = idx;
    document.getElementById('btnPrev').disabled = (idx === 0);
    document.getElementById('btnNext').disabled = (idx === bagrutData.length - 1);

    // עדכון טקסט
    document.getElementById('successMessage').style.display = 'none';
    document.getElementById('questionTitle').innerText = q.title;
    document.getElementById('questionText').innerHTML = q.instruction;

    // איפוס פרמטרים ונעילות
    ['a', 'b', 'c', 'd'].forEach(p => {
        const val = q.setup[p];
        window[p] = val;
        const slider = document.getElementById('param' + p.toUpperCase());
        slider.value = val;
        document.getElementById('val' + p.toUpperCase()).innerText = val;

        const isLocked = q.locked.includes(p);
        slider.disabled = isLocked;
        slider.parentElement.style.opacity = isLocked ? "0.6" : "1";
    });

    // *** תיקון מיקום התחלתי ל-X ***
    // משתמשים ב-startX מהשאלה, או ברירת מחדל רחוקה מ-0
    const startPos = (q.startX !== undefined) ? q.startX : -4;
    currentX = startPos;
    
    const xSlider = document.getElementById('paramX');
    if (q.type === 'find_param') {
        currentX = q.targetPoint ? q.targetPoint.x : 0;
        xSlider.disabled = true; // נועלים את ה-X אם המטרה היא למצוא פרמטר
    } else {
        xSlider.disabled = false;
        xSlider.value = currentX;
    }
    document.getElementById('valX').innerText = currentX;

    updateGraph();
}

// --- פונקציות מתמטיות ---
function f(x) {
    return a * Math.pow(x, 3) + b * Math.pow(x, 2) + c * x + d; 
}

function df(x) {
    return 3 * a * Math.pow(x, 2) + 2 * b * x + c;
}

// יצירת מחרוזת לתצוגה יפה: f(x) = ...
function getMathString(isDeriv) {
    let parts = [];
    
    if (isDeriv) {
        // נגזרת: 3ax^2 + 2bx + c
        let A = 3*a, B = 2*b, C = c;
        if (Math.abs(A) > 0.001) parts.push(`${round(A)}x²`);
        if (Math.abs(B) > 0.001) parts.push(`${B > 0 && parts.length > 0 ? '+' : ''}${round(B)}x`);
        if (Math.abs(C) > 0.001 || parts.length === 0) parts.push(`${C > 0 && parts.length > 0 ? '+' : ''}${round(C)}`);
    } else {
        // פונקציה: ax^3 + bx^2 + cx + d
        if (Math.abs(a) > 0.001) parts.push(`${a==-1?'-':(a==1?'':a)}x³`);
        if (Math.abs(b) > 0.001) parts.push(`${b > 0 && parts.length > 0 ? '+' : ''}${b}x²`);
        if (Math.abs(c) > 0.001) parts.push(`${c > 0 && parts.length > 0 ? '+' : ''}${c}x`);
        if (Math.abs(d) > 0.001 || parts.length === 0) parts.push(`${d > 0 && parts.length > 0 ? '+' : ''}${d}`);
    }
    return parts.join(' ');
}

function round(num) { return Math.round(num * 100) / 100; }

// --- הלולאה הראשית: חישוב וציור ---
function updateGraph() {
    if (!ctx) return;
    
    // חישוב ערכים נוכחיים
    let yVal = f(currentX);
    let mVal = df(currentX);
    
    // עדכון פאנל השלשה הקדושה
    document.getElementById('dispX').innerText = currentX.toFixed(1);
    document.getElementById('dispY').innerText = yVal.toFixed(2);
    document.getElementById('dispM').innerText = mVal.toFixed(2);
    
    // עדכון משוואות טקסט
    document.getElementById('funcEqn').innerText = getMathString(false);
    document.getElementById('derivEqn').innerText = getMathString(true);
    document.getElementById('tangentEqn').innerText = 
        `y - ${yVal.toFixed(1)} = ${mVal.toFixed(2)}(x - ${currentX.toFixed(1)})`;

    // ניקוי וציור מחדש
    ctx.clearRect(0, 0, width, height);
    drawGrid();
    drawFunction();
    drawTangent(currentX, yVal, mVal);

    // ציור מטרות אם יש
    const q = bagrutData[currentQIndex];
    if (q.targetPoint) drawTargetPoint(q.targetPoint);

    // בדיקת ניצחון
    if (!isSolved) checkAnswer(yVal, mVal);
}

function drawGrid() {
    const cx = width / 2;
    const cy = height / 2;

    ctx.lineWidth = 1;
    ctx.strokeStyle = "#e2e8f0";
    
    // גריד משני
    ctx.beginPath();
    for (let x = 0; x <= width; x += scale) { ctx.moveTo(x + (cx%scale), 0); ctx.lineTo(x + (cx%scale), height); }
    for (let y = 0; y <= height; y += scale) { ctx.moveTo(0, y + (cy%scale)); ctx.lineTo(width, y + (cy%scale)); }
    ctx.stroke();

    // צירים ראשיים
    ctx.lineWidth = 2;
    ctx.strokeStyle = "#475569";
    ctx.beginPath();
    ctx.moveTo(0, cy); ctx.lineTo(width, cy); // X
    ctx.moveTo(cx, 0); ctx.lineTo(cx, height); // Y
    ctx.stroke();

    // מספרים
    ctx.font = "12px sans-serif";
    ctx.fillStyle = "#64748b";
    ctx.textAlign = "center";
    for (let i = -10; i <= 10; i++) {
        if (i === 0) continue;
        ctx.fillText(i, cx + i * scale, cy + 20);
        if (Math.abs(i) <= 6) ctx.fillText(i, cx - 15, cy - i * scale + 5); // מספרים לציר Y
    }
}

function drawFunction() {
    ctx.beginPath();
    ctx.strokeStyle = "#2563eb"; // כחול
    ctx.lineWidth = 3;
    
    const cx = width / 2;
    const cy = height / 2;

    let started = false;
    // רצים על כל פיקסל לרוחב המסך
    for (let px = 0; px <= width; px+=2) {
        let xMath = (px - cx) / scale;
        let yMath = f(xMath);
        let py = cy - yMath * scale;
        
        // מניעת באגים גרפיים במספרים ענקיים
        if (py < -1000 || py > height + 1000) {
           started = false; continue; 
        }

        if (!started) { ctx.moveTo(px, py); started = true; }
        else ctx.lineTo(px, py);
    }
    ctx.stroke();
}

function drawTangent(x0, y0, m) {
    const cx = width / 2;
    const cy = height / 2;
    const px = cx + x0 * scale;
    const py = cy - y0 * scale;

    // קו משיק
    const length = 10; // אורך הקו לכל כיוון
    const x1 = x0 - length;
    const y1 = y0 - m * length;
    const x2 = x0 + length;
    const y2 = y0 + m * length;

    ctx.beginPath();
    ctx.strokeStyle = "#f59e0b"; // כתום
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]); // מקווקו
    ctx.moveTo(cx + x1 * scale, cy - y1 * scale);
    ctx.lineTo(cx + x2 * scale, cy - y2 * scale);
    ctx.stroke();
    ctx.setLineDash([]); // איפוס

    // נקודת ההשקה
    ctx.beginPath();
    ctx.arc(px, py, 6, 0, 2 * Math.PI);
    ctx.fillStyle = "#f59e0b";
    ctx.fill();
    ctx.strokeStyle = "white";
    ctx.lineWidth = 2;
    ctx.stroke();

    // תווית צפה
    const label = document.getElementById('floatingLabel');
    label.style.display = 'block';
    label.style.left = (px + 15) + 'px';
    label.style.top = (py - 15) + 'px';
    label.innerHTML = `(${x0.toFixed(1)}, ${y0.toFixed(1)})`;
}

function drawTargetPoint(pt) {
    const cx = width / 2;
    const cy = height / 2;
    const px = cx + pt.x * scale;
    const py = cy - pt.y * scale;

    ctx.beginPath();
    ctx.arc(px, py, 5, 0, 2 * Math.PI);
    ctx.fillStyle = "#ef4444"; // אדום
    ctx.fill();
    
    // אנימציית גל
    ctx.beginPath();
    ctx.arc(px, py, 10 + Math.sin(Date.now()/200)*3, 0, 2 * Math.PI);
    ctx.strokeStyle = "rgba(239, 68, 68, 0.5)";
    ctx.stroke();
}

// --- אינטראקציה (גרירה) ---
function startDrag(evt) {
    const rect = canvas.getBoundingClientRect();
    const clientX = evt.touches ? evt.touches[0].clientX : evt.clientX;
    const x = clientX - rect.left;
    const cx = width / 2;
    const mouseMathX = (x - cx) / scale;

    // בודקים אם לחצו קרוב לנקודה הנוכחית
    if (Math.abs(mouseMathX - currentX) < 1) { 
        isDragging = true;
    }
}

function doDrag(evt) {
    if (!isDragging) return;
    evt.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const clientX = evt.touches ? evt.touches[0].clientX : evt.clientX;
    
    let newX = (clientX - rect.left - width/2) / scale;
    
    // Snap: מגנט לערכים "יפים" (0.5, 1.0)
    if (Math.abs(newX - Math.round(newX*2)/2) < 0.15) {
        newX = Math.round(newX*2)/2;
    }

    // גבולות הקנבס
    if (newX < -6) newX = -6; if (newX > 6) newX = 6;

    currentX = newX;
    document.getElementById('paramX').value = currentX;
    document.getElementById('valX').innerText = currentX;
    updateGraph();
}

function endDrag() { isDragging = false; }

// --- בדיקת תשובה ---
function checkAnswer(curY, curM) {
    const q = bagrutData[currentQIndex];
    let win = false;
    let tolerance = 0.1; // כמה מותר לפספס ועדיין לצדוק

    if (q.goal === 'm0' && Math.abs(curM) < tolerance) win = true;
    else if (q.goal === 'slope_val' && Math.abs(curM - q.targetVal) < tolerance) win = true;
    else if (q.goal === 'hit_target' && Math.abs(curY - q.targetPoint.y) < tolerance) {
        // אם המטרה היא לפגוע בנקודה, מוודאים שגם ה-X נכון
        if (Math.abs(currentX - q.targetPoint.x) < tolerance) win = true;
    }
    else if (q.goal === 'y0' && Math.abs(curY) < tolerance) {
        // אם יש דרישת תחום (למשל x חיובי)
        if (!q.targetRegion || (currentX > q.targetRegion.min && currentX < q.targetRegion.max)) {
            win = true;
        }
    }

    if (win) {
        isSolved = true;
        const msg = document.getElementById('successMessage');
        msg.style.display = 'block';
        msg.innerHTML = "🎉 כל הכבוד! תשובה נכונה.";
        
        // הוספה ליומן
        const list = document.getElementById('journalList');
        const li = document.createElement('li');
        li.innerHTML = `<span>שאלה ${q.id}</span> <span>(x=${currentX}, m=${curM.toFixed(1)})</span>`;
        list.prepend(li);
    }
}

// לולאת אנימציה קטנה עבור האפקט של המטרה האדומה
setInterval(() => {
    if (bagrutData[currentQIndex].targetPoint) updateGraph();
}, 100);
