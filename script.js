/* script.js - המנוע הגרפי והלוגי המלא
   מסתמך על נתונים מקובץ bagrutQuestions.js
*/

// --- משתנים גלובליים ---
let canvas, ctx;
let width, height;
let a = 1, b = 0, c = 0, d = 0; // מקדמי הפונקציה
let currentX = 0; // מיקום הנקודה הנוכחי
let scale = 40; // זום (פיקסלים ליחידה)
let currentQIndex = 0;
let isSolved = false; // למנוע הצפת הודעות הצלחה

// --- אתחול המערכת ---
window.onload = function() {
    // 1. בדיקה שהנתונים נטענו
    if (typeof bagrutData === 'undefined') {
        alert("שגיאה קריטית: קובץ השאלות (bagrutQuestions.js) לא נמצא או לא נטען.");
        return;
    }

    // 2. אתחול הקנבס
    canvas = document.getElementById('graphCanvas');
    ctx = canvas.getContext('2d');
    
    // התאמה ראשונית לגודל המסך
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // 3. חיבור הממשק (סליידרים)
    setupControls();

    // 4. טעינת השאלה הראשונה
    loadQuestion(0);
};

function setupControls() {
    // מאזינים לסליידרים של הפרמטרים (a, b, c, d)
    ['a', 'b', 'c', 'd'].forEach(p => {
        const slider = document.getElementById(`param${p.toUpperCase()}`);
        if (slider) {
            slider.addEventListener('input', (e) => {
                // עדכון המשתנה הגלובלי
                window[p] = parseFloat(e.target.value);
                // עדכון המספר המוצג ליד הסליידר
                const label = document.getElementById(`val${p.toUpperCase()}`);
                if (label) label.innerText = window[p];
                // ציור מחדש
                updateGraph();
            });
        }
    });

    // מאזין לסליידר ה-X (הנקודה הכחולה)
    const xSlider = document.getElementById('paramX');
    if (xSlider) {
        xSlider.addEventListener('input', (e) => {
            currentX = parseFloat(e.target.value);
            updateGraph();
        });
    }
}

function resizeCanvas() {
    const container = canvas.parentElement;
    if (container) {
        width = container.clientWidth;
        // גובה קבוע או יחסי - לבחירתך
        height = 500; 
    } else {
        width = 800;
        height = 500;
    }
    canvas.width = width;
    canvas.height = height;
    updateGraph();
}

// --- לוגיקת משחק (טעינת שאלה) ---
function loadQuestion(idx) {
    // בדיקה אם סיימנו את כל השאלות
    if (idx >= bagrutData.length) {
        alert("סיימת את כל המבחן! כל הכבוד!");
        return;
    }

    currentQIndex = idx;
    const q = bagrutData[idx];
    isSolved = false;
    
    // איפוס הודעת הצלחה
    const successMsg = document.getElementById('successMessage');
    if (successMsg) successMsg.style.display = 'none';

    // עדכון טקסטים
    document.getElementById('questionTitle').innerText = q.title;
    document.getElementById('questionText').innerHTML = q.instruction;

    // איפוס פרמטרים וסליידרים לפי השאלה
    ['a', 'b', 'c', 'd'].forEach(p => {
        const val = q.setup[p];
        window[p] = val; // עדכון במשתנים
        
        const slider = document.getElementById(`param${p.toUpperCase()}`);
        const label = document.getElementById(`val${p.toUpperCase()}`);
        
        if (slider) {
            slider.value = val;
            
            // מנגנון נעילה: אם הפרמטר ברשימת ה-locked, משביתים אותו
            const isLocked = q.locked.includes(p);
            slider.disabled = isLocked;
            slider.parentElement.style.opacity = isLocked ? "0.4" : "1";
            slider.parentElement.style.pointerEvents = isLocked ? "none" : "auto";
        }
        if (label) label.innerText = val;
    });

    // הגדרת מצב עבודה: הזזת X או מציאת פרמטרים?
    const xSlider = document.getElementById('paramX');
    if (xSlider) {
        if (q.type === 'find_param') {
            // אם המטרה היא למצוא פרמטר, אנחנו נועלים את X על נקודת המטרה
            // (למשל: הפונקציה צריכה לעבור בנקודה (2,5), אז ה-X תקוע על 2)
            currentX = q.targetPoint ? q.targetPoint.x : 0;
            xSlider.value = currentX;
            xSlider.disabled = true;
            xSlider.parentElement.style.opacity = "0.5";
        } else {
            // במצב חקירה (move_x), ה-X חופשי
            currentX = 0;
            xSlider.value = 0;
            xSlider.disabled = false;
            xSlider.parentElement.style.opacity = "1";
        }
    }

    updateGraph();
}

// --- מתמטיקה ---
// הפונקציה עצמה (תומך עד מעלה שלישית)
function f(x) {
    return a * x * x * x + b * x * x + c * x + d; 
}

// הנגזרת (לחישוב שיפוע המשיק)
function df(x) {
    return 3 * a * x * x + 2 * b * x + c;
}

// --- ציור הגרף ---
function updateGraph() {
    if (!ctx) return;
    
    // ניקוי הקנבס
    ctx.clearRect(0, 0, width, height);
    
    // ציור מערכת צירים
    drawAxes();

    // ציור הפונקציה (Pixel-by-pixel rendering)
    ctx.beginPath();
    ctx.strokeStyle = "#007bff"; // כחול יפה
    ctx.lineWidth = 3;
    
    for (let px = 0; px < width; px++) {
        // המרה מפיקסל לערך מתמטי
        let xMath = (px - width / 2) / scale;
        let yMath = f(xMath);
        
        // המרה מערך מתמטי לפיקסל
        // (שים לב: y במחשב הפוך, למטה זה חיובי, אז עושים מינוס)
        let py = height / 2 - yMath * scale;
        
        if (px === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
    }
    ctx.stroke();

    // ציור הנקודה הנוכחית והמשיק
    drawTangent(currentX);

    // ציור "נקודת מטרה" (רמז ויזואלי) - רק אם רלוונטי לשאלה
    const q = bagrutData[currentQIndex];
    if (q.type === 'find_param' && q.targetPoint) {
        drawTargetPoint(q.targetPoint);
    }

    // בדיקה האם המשתמש פתר את השאלה
    if (!isSolved) checkAnswer();
}

function drawAxes() {
    ctx.beginPath();
    ctx.strokeStyle = "#aaa";
    ctx.lineWidth = 1;
    
    // ציר X
    ctx.moveTo(0, height / 2);
    ctx.lineTo(width, height / 2);
    
    // ציר Y
    ctx.moveTo(width / 2, 0);
    ctx.lineTo(width / 2, height);
    ctx.stroke();
}

function drawTangent(x0) {
    let y0 = f(x0);
    let m = df(x0);

    // המרה לפיקסלים
    let px = width / 2 + x0 * scale;
    let py = height / 2 - y0 * scale;

    // 1. ציור הנקודה
    ctx.beginPath();
    ctx.arc(px, py, 6, 0, 2 * Math.PI);
    ctx.fillStyle = "#ff9800"; // כתום בולט
    ctx.fill();

    // 2. ציור קו המשיק (קצר, לא אינסופי)
    let lineLen = 2; // אורך מתמטי לכל כיוון
    let x1 = x0 - lineLen;
    let y1 = y0 - m * lineLen; // משוואת הישר: delta_y = m * delta_x
    let x2 = x0 + lineLen;
    let y2 = y0 + m * lineLen;

    ctx.beginPath();
    ctx.strokeStyle = "#ff9800"; // צבע המשיק
    ctx.lineWidth = 2;
    // ציור מ-(x1,y1) ל-(x2,y2) בפיקסלים
    ctx.moveTo(width / 2 + x1 * scale, height / 2 - y1 * scale);
    ctx.lineTo(width / 2 + x2 * scale, height / 2 - y2 * scale);
    ctx.stroke();
}

function drawTargetPoint(target) {
    if (target.y === undefined) return;

    let tx = target.x;
    let ty = target.y;
    
    let tPx = width / 2 + tx * scale;
    let tPy = height / 2 - ty * scale;
    
    // עיגול חיצוני (הילה)
    ctx.beginPath();
    ctx.arc(tPx, tPy, 10, 0, 2 * Math.PI);
    ctx.strokeStyle = "rgba(220, 53, 69, 0.5)"; // אדום שקוף
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // עיגול פנימי
    ctx.beginPath();
    ctx.arc(tPx, tPy, 3, 0, 2 * Math.PI);
    ctx.fillStyle = "#dc3545";
    ctx.fill();
}

// --- בדיקת תשובות (המוח של המערכת) ---
function checkAnswer() {
    const q = bagrutData[currentQIndex];
    
    // חישוב המצב הנוכחי
    let curY = f(currentX);
    let curM = df(currentX);
    
    let tolerance = 0.15; // טולרנס לדיוק (קצת גמישות למשתמש)
    let win = false;

    // בדיקה לפי סוג המטרה (Goal)
    switch (q.goal) {
        case 'm0': // חיפוש קיצון (שיפוע 0)
            if (Math.abs(curM) < 0.1) win = true;
            break;
            
        case 'y0': // חיפוש שורש (חיתוך X)
            if (Math.abs(curY) < 0.1) {
                // אם יש אזור ספציפי (למשל השורש הימני מבין שניים)
                if (q.targetRegion) {
                    if (currentX > q.targetRegion.min && currentX < q.targetRegion.max) win = true;
                } else {
                    win = true;
                }
            }
            break;
            
        case 'slope_val': // שיפוע ספציפי (למשל m=4)
            if (Math.abs(curM - q.targetVal) < 0.1) win = true;
            break;
            
        case 'hit_target': // הפונקציה חייבת לעבור בנקודה (x,y)
            // כאן ה-X נעול, אז בודקים רק אם ה-Y מתאים
            if (Math.abs(curY - q.targetPoint.y) < tolerance) win = true;
            break;
            
        case 'slope_at_x': // בנקודה X, השיפוע חייב להיות M
            if (Math.abs(curM - q.targetPoint.m) < tolerance) win = true;
            break;
            
        case 'complex': // תנאי משולב (גם גובה וגם שיפוע, או שני פרמטרים)
            // בודק גם y וגם m
            let yOk = Math.abs(curY - q.targetPoint.y) < tolerance;
            let mOk = true;
            if (q.targetPoint.m !== undefined) {
                mOk = Math.abs(curM - q.targetPoint.m) < tolerance;
            }
            if (yOk && mOk) win = true;
            break;
    }

    if (win) {
        isSolved = true;
        showSuccess();
    }
}

function showSuccess() {
    const msg = document.getElementById('successMessage');
    if (msg) {
        msg.style.display = 'block';
        msg.innerHTML = `<strong>כל הכבוד! 🎉</strong><br>הצלחת את המשימה.`;
    }
    
    // הוספה ליומן המתמטי בצד
    const q = bagrutData[currentQIndex];
    let entryText = "";
    
    // אם יש משוואה מוכנה בשאלה, נשתמש בה. אם לא, נייצר טקסט גנרי.
    if (q.journalEq) {
        entryText = `<span class="check">✔</span> ${q.journalEq}`;
    } else {
        entryText = `<span class="check">✔</span> שאלה ${q.id} פצוחה!`;
    }
    
    addJournalEntry(entryText);

    // מעבר לשאלה הבאה אחרי השהיה קצרה
    setTimeout(() => {
        if (currentQIndex < bagrutData.length - 1) {
            loadQuestion(currentQIndex + 1);
        } else {
            if (msg) msg.innerHTML = "<strong>סיימת את כל המשימות! 🏆</strong><br>אתה מוכן לבגרות.";
        }
    }, 2500); // 2.5 שניות
}

function addJournalEntry(htmlText) {
    const journalList = document.getElementById('journalList');
    if (!journalList) return; // הגנה אם אין יומן ב-HTML

    const li = document.createElement('li');
    li.innerHTML = htmlText;
    li.style.borderBottom = "1px solid #eee";
    li.style.padding = "8px 0";
    li.style.color = "#28a745"; // ירוק
    li.style.animation = "fadeIn 0.5s"; // אפקט הופעה (אם תרצה להוסיף ב-CSS)
    
    // הוספה לראש הרשימה
    journalList.insertBefore(li, journalList.firstChild);
}
