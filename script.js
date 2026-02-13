/* script.js - הגרסה המלאה והמתקדמת (כולל גרירה, רשת ויומן) */

// --- משתנים גלובליים ---
let canvas, ctx;
let width, height;
// פרמטרים ברירת מחדל
let a = 1, b = 0, c = 0, d = 0; 
let currentX = 0; 
let scale = 40; // זום (פיקסלים ליחידה)
let currentQIndex = 0;
let isSolved = false; 

// משתנים לאינטראקציה (גרירה עם העכבר)
let isDragging = false;

// --- אתחול המערכת ---
window.onload = function() {
    console.log("מערכת אותחלה...");

    // 1. בדיקה שהשאלות נטענו
    if (typeof bagrutData === 'undefined') {
        alert("שגיאה קריטית: קובץ השאלות (bagrut_questions.js) לא נטען.");
        return;
    }

    // 2. אתחול הקנבס
    canvas = document.getElementById('graphCanvas');
    if (!canvas) {
        console.error("לא נמצא אלמנט קנבס!");
        return;
    }
    ctx = canvas.getContext('2d');
    
    // התאמה ראשונית לגודל המסך
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // 3. חיבור אירועי עכבר (גרירה על הקנבס)
    canvas.addEventListener('mousedown', startDrag);
    canvas.addEventListener('mousemove', doDrag);
    canvas.addEventListener('mouseup', endDrag);
    canvas.addEventListener('mouseleave', endDrag);
    
    // תמיכה במובייל (טאץ')
    canvas.addEventListener('touchstart', startDrag, {passive: false});
    canvas.addEventListener('touchmove', doDrag, {passive: false});
    canvas.addEventListener('touchend', endDrag);

    // 4. חיבור הממשק (סליידרים וכפתורים)
    setupControls();

    // 5. טעינת השאלה הראשונה
    loadQuestion(0);
};

// --- הגדרות ממשק ---
function setupControls() {
    // לולאה שמחברת את הסליידרים A,B,C,D
    ['a', 'b', 'c', 'd'].forEach(p => {
        const idName = 'param' + p.toUpperCase(); // paramA
        const labelName = 'val' + p.toUpperCase(); // valA

        const slider = document.getElementById(idName);
        if (slider) {
            slider.addEventListener('input', (e) => {
                window[p] = parseFloat(e.target.value);
                const label = document.getElementById(labelName);
                if (label) label.innerText = window[p];
                updateGraph();
            });
        }
    });

    // חיבור סליידר X (הזזת הנקודה)
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
        height = 500; // גובה קבוע
    } else {
        width = 800;
        height = 500;
    }
    canvas.width = width;
    canvas.height = height;
    updateGraph();
}

// --- ניהול שאלות ---
function loadQuestion(idx) {
    if (idx >= bagrutData.length) {
        document.getElementById('questionTitle').innerText = "סיימת את המבחן! 🏆";
        document.getElementById('questionText').innerHTML = "כל הכבוד, השלמת את כל המשימות בהצלחה.";
        document.getElementById('successMessage').style.display = 'none';
        return;
    }

    currentQIndex = idx;
    const q = bagrutData[idx];
    isSolved = false;
    
    // איפוס תצוגה
    document.getElementById('successMessage').style.display = 'none';
    document.getElementById('questionTitle').innerText = q.title;
    document.getElementById('questionText').innerHTML = q.instruction;

    // עדכון פרמטרים ונעילות
    ['a', 'b', 'c', 'd'].forEach(p => {
        const val = q.setup[p];
        window[p] = val; // עדכון במשתנים
        
        const slider = document.getElementById('param' + p.toUpperCase());
        const label = document.getElementById('val' + p.toUpperCase());
        
        if (slider) {
            slider.value = val;
            if (label) label.innerText = val;
            
            // בדיקת נעילה
            const isLocked = q.locked.includes(p);
            slider.disabled = isLocked;
            slider.parentElement.style.opacity = isLocked ? "0.5" : "1";
            slider.parentElement.style.pointerEvents = isLocked ? "none" : "auto";
        }
    });

    // טיפול ב-X (הזזה או חיפוש פרמטר)
    const xSlider = document.getElementById('paramX');
    if (xSlider) {
        if (q.type === 'find_param') {
            // אם צריך למצוא פרמטר, נועלים את X במקום מסוים
            currentX = q.targetPoint ? q.targetPoint.x : 0;
            xSlider.value = currentX;
            xSlider.disabled = true;
            xSlider.parentElement.style.opacity = "0.5";
            document.getElementById('valX').innerText = currentX;
        } else {
            // אם זו חקירה רגילה, מאפסים את X ומאפשרים הזזה
            currentX = 0;
            xSlider.value = 0;
            xSlider.disabled = false;
            xSlider.parentElement.style.opacity = "1";
            document.getElementById('valX').innerText = "0";
        }
    }

    updateGraph();
}

// --- לוגיקה מתמטית ---
function f(x) {
    return a * Math.pow(x, 3) + b * Math.pow(x, 2) + c * x + d; 
}

function df(x) {
    return 3 * a * Math.pow(x, 2) + 2 * b * x + c;
}

// --- מנוע גרפי (ציור) ---
function updateGraph() {
    if (!ctx) return;
    
    // ניקוי
    ctx.clearRect(0, 0, width, height);
    
    // 1. ציור רשת (Grid)
    drawGrid();

    // 2. ציור צירים ראשיים
    drawAxes();

    // 3. ציור הפונקציה
    ctx.beginPath();
    ctx.strokeStyle = "#007bff";
    ctx.lineWidth = 3;
    
    // אופטימיזציה: ציור בצעדים קטנים
    let startX = -width / 2 / scale; // גבול שמאלי מתמטי
    let endX = width / 2 / scale;    // גבול ימני מתמטי
    
    // מעבר פיקסל-פיקסל לדיוק מקסימלי
    for (let px = 0; px <= width; px++) {
        let xMath = (px - width / 2) / scale;
        let yMath = f(xMath);
        let py = height / 2 - yMath * scale;
        
        if (px === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
    }
    ctx.stroke();

    // 4. אלמנטים נוספים (משיק, נקודה)
    drawTangent(currentX);

    // 5. נקודת מטרה (אם יש)
    const q = bagrutData[currentQIndex];
    if (q && q.type === 'find_param' && q.targetPoint) {
        drawTargetPoint(q.targetPoint);
    }

    // 6. בדיקת תשובה בזמן אמת
    if (!isSolved) checkAnswer();
}

function drawGrid() {
    ctx.beginPath();
    ctx.strokeStyle = "#eee"; // צבע חלש
    ctx.lineWidth = 1;

    // קווים אנכיים
    let centerX = width / 2;
    // ימינה מהמרכז
    for (let x = centerX; x < width; x += scale) {
        ctx.moveTo(x, 0); ctx.lineTo(x, height);
    }
    // שמאלה מהמרכז
    for (let x = centerX; x > 0; x -= scale) {
        ctx.moveTo(x, 0); ctx.lineTo(x, height);
    }

    // קווים אופקיים
    let centerY = height / 2;
    // למטה מהמרכז
    for (let y = centerY; y < height; y += scale) {
        ctx.moveTo(0, y); ctx.lineTo(width, y);
    }
    // למעלה מהמרכז
    for (let y = centerY; y > 0; y -= scale) {
        ctx.moveTo(0, y); ctx.lineTo(width, y);
    }
    ctx.stroke();
}

function drawAxes() {
    ctx.beginPath();
    ctx.strokeStyle = "#333";
    ctx.lineWidth = 2;
    
    // ציר X
    ctx.moveTo(0, height / 2); ctx.lineTo(width, height / 2);
    // ציר Y
    ctx.moveTo(width / 2, 0); ctx.lineTo(width / 2, height);
    ctx.stroke();

    // מספרים על הצירים
    ctx.font = "12px Arial";
    ctx.fillStyle = "#666";
    ctx.textAlign = "center";
    
    // מספרים על ציר X
    for (let i = -10; i <= 10; i++) {
        if (i === 0) continue;
        let px = width / 2 + i * scale;
        if (px > 0 && px < width) {
            ctx.fillText(i, px, height / 2 + 20);
            // שנתות קטנות
            ctx.beginPath();
            ctx.moveTo(px, height/2 - 5);
            ctx.lineTo(px, height/2 + 5);
            ctx.stroke();
        }
    }
    
    // מספרים על ציר Y
    ctx.textAlign = "right";
    for (let i = -10; i <= 10; i++) {
        if (i === 0) continue;
        let py = height / 2 - i * scale;
        if (py > 0 && py < height) {
            ctx.fillText(i, width / 2 - 10, py + 5);
            // שנתות קטנות
            ctx.beginPath();
            ctx.moveTo(width/2 - 5, py);
            ctx.lineTo(width/2 + 5, py);
            ctx.stroke();
        }
    }
}

function drawTangent(x0) {
    let y0 = f(x0);
    let m = df(x0);

    let px = width / 2 + x0 * scale;
    let py = height / 2 - y0 * scale;

    // ציור המשיק (קו קצר)
    let len = 2.5; // אורך המשיק לכל כיוון
    let x1 = x0 - len;
    let y1 = y0 - m * len;
    let x2 = x0 + len;
    let y2 = y0 + m * len;
    
    ctx.beginPath();
    ctx.strokeStyle = "#ff9800"; // כתום
    ctx.lineWidth = 2;
    ctx.moveTo(width / 2 + x1 * scale, height / 2 - y1 * scale);
    ctx.lineTo(width / 2 + x2 * scale, height / 2 - y2 * scale);
    ctx.stroke();

    // ציור הנקודה
    ctx.beginPath();
    ctx.arc(px, py, 7, 0, 2 * Math.PI);
    ctx.fillStyle = "#ff9800";
    ctx.fill();
    ctx.strokeStyle = "white";
    ctx.lineWidth = 2;
    ctx.stroke();

    // טקסט ליד הנקודה (קואורדינטות ושיפוע)
    ctx.fillStyle = "#333";
    ctx.font = "bold 14px Arial";
    ctx.textAlign = "left";
    let infoText = `(${x0.toFixed(1)}, ${y0.toFixed(1)}) m=${m.toFixed(1)}`;
    ctx.fillText(infoText, px + 15, py - 15);
}

function drawTargetPoint(target) {
    let px = width / 2 + target.x * scale;
    let py = height / 2 - target.y * scale;

    // הילה מהבהבת (אופציונלי, כאן זה סטטי)
    ctx.beginPath();
    ctx.arc(px, py, 15, 0, 2 * Math.PI);
    ctx.fillStyle = "rgba(220, 53, 69, 0.2)";
    ctx.fill();

    ctx.beginPath();
    ctx.arc(px, py, 4, 0, 2 * Math.PI);
    ctx.fillStyle = "#dc3545"; // אדום
    ctx.fill();
}

// --- אינטראקציה: גרירה עם העכבר ---
function getMousePos(evt) {
    const rect = canvas.getBoundingClientRect();
    const clientX = evt.touches ? evt.touches[0].clientX : evt.clientX;
    const clientY = evt.touches ? evt.touches[0].clientY : evt.clientY;
    return {
        x: clientX - rect.left,
        y: clientY - rect.top
    };
}

function startDrag(evt) {
    const q = bagrutData[currentQIndex];
    if (q.type === 'find_param') return; // לא נותנים לגרור אם המטרה היא פרמטרים

    const pos = getMousePos(evt);
    // בדיקה אם העכבר קרוב לנקודה הנוכחית
    let px = width / 2 + currentX * scale;
    // אנחנו בודקים רק את ציר X כי המשתמש גורר ימינה/שמאלה
    if (Math.abs(pos.x - px) < 30) { 
        isDragging = true;
        evt.preventDefault();
    }
}

function doDrag(evt) {
    if (!isDragging) return;
    evt.preventDefault();
    
    const pos = getMousePos(evt);
    // המרה מפיקסל לערך מתמטי
    let newX = (pos.x - width / 2) / scale;
    
    // הגבלה לתחום הגיוני
    if (newX < -10) newX = -10;
    if (newX > 10) newX = 10;
    
    // הצמדה לשנתות (Snap) כדי שיהיה קל לדייק
    if (Math.abs(newX - Math.round(newX)) < 0.1) {
        newX = Math.round(newX);
    } else {
        newX = Math.round(newX * 10) / 10; // דיוק של ספרה אחת
    }

    currentX = newX;
    
    // עדכון הסליידר במקביל
    const xSlider = document.getElementById('paramX');
    if (xSlider) xSlider.value = currentX;
    
    // עדכון טקסט
    document.getElementById('valX').innerText = currentX;
    
    updateGraph();
}

function endDrag(evt) {
    isDragging = false;
}

// --- בדיקת תשובות ויומן ---
function checkAnswer() {
    const q = bagrutData[currentQIndex];
    let curY = f(currentX);
    let curM = df(currentX);
    let win = false;
    let tolerance = 0.15; // גמישות בבדיקה

    if (q.goal === 'm0' && Math.abs(curM) < tolerance) win = true;
    else if (q.goal === 'slope_val' && Math.abs(curM - q.targetVal) < tolerance) win = true;
    else if (q.goal === 'hit_target' && Math.abs(curY - q.targetPoint.y) < tolerance) win = true;
    else if (q.goal === 'y0' && Math.abs(curY) < tolerance) {
        if (!q.targetRegion || (currentX > q.targetRegion.min && currentX < q.targetRegion.max)) {
            win = true;
        }
    }

    if (win) {
        isSolved = true;
        showSuccessMessage(q.id);
    }
}

function showSuccessMessage(qId) {
    const msg = document.getElementById('successMessage');
    msg.style.display = 'block';
    msg.innerHTML = "<strong>כל הכבוד! 🎉 תשובה נכונה.</strong>";
    msg.className = "success-anim"; // אפשר להוסיף אנימציה ב-CSS

    // הוספה ליומן
    addToJournal(qId);

    // מעבר אוטומטי
    setTimeout(() => {
        if (currentQIndex < bagrutData.length - 1) {
            loadQuestion(currentQIndex + 1);
        } else {
            msg.innerHTML = "<strong>סיימת את כל השאלות! אלופ/ה! 🏆</strong>";
        }
    }, 2000);
}

function addToJournal(qId) {
    const list = document.getElementById('journalList');
    if (!list) return;

    const li = document.createElement('li');
    // עיצוב דינמי לרשימה
    li.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center;">
            <span>✅ שאלה ${qId}</span>
            <span style="font-size:0.8em; color:#888;">${new Date().toLocaleTimeString()}</span>
        </div>
        <div style="font-size:0.9em; color:#555; margin-top:2px;">
            נפתרה בהצלחה (x=${currentX}, m=${df(currentX).toFixed(1)})
        </div>
    `;
    li.style.borderBottom = "1px solid #eee";
    li.style.padding = "10px 0";
    li.style.animation = "popIn 0.5s ease";
    
    // הוספה לראש הרשימה
    list.insertBefore(li, list.firstChild);
}
