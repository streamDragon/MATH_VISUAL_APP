/* script.js - גרסה מלאה עם ויזואליזציה מתקדמת (שילוש קדוש + משוואת משיק) */

/* --- ניהול מאגר שאלות --- */
// שאלות ברירת מחדל (למקרה שקובץ הבגרות לא נטען)
const defaultQuestions = [
    { cat: "תרגול בסיסי", t: "חימום: מינימום", d: "מצאו את תחתית העמק (מינימום).", p: [0, 1, -4, 4], goal: 'm0' },
    { cat: "תרגול בסיסי", t: "חיתוך צירים", d: "מצאו את נקודת החיתוך עם ציר ה-X הימני.", p: [0, 0.5, 0, -2], goal: 'y0' }
];

// מיזוג שאלות: חיבור מאגר חיצוני אם קיים
let questions = [];
if (typeof bagrutData !== 'undefined') {
    questions = defaultQuestions.concat(bagrutData);
} else {
    questions = defaultQuestions;
}

/* --- משתנים גלובליים --- */
let cvs, ctx, W, H, mainArea;
let scale = 45, ox, oy; // קנה מידה ונקודת האפס
let px = 0; // ערך ה-X הנוכחי
let cf = [0,1,0,0]; // מקדמי הפונקציה a,b,c,d
let goal = ''; // מטרת השלב הנוכחי
let isDrag = false;

/* --- איתחול --- */
window.onload = () => {
    cvs = document.getElementById('cvs');
    ctx = cvs.getContext('2d');
    mainArea = document.getElementById('mainArea');
    
    // מאזינים לשינוי גודל מסך
    window.addEventListener('resize', resize);
    
    // מאזינים למגע ועכבר (Drag & Drop)
    cvs.addEventListener('touchstart', e => start(e.touches[0]), {passive: false});
    cvs.addEventListener('touchmove', e => move(e.touches[0]), {passive: false});
    cvs.addEventListener('touchend', end);
    cvs.addEventListener('mousedown', start);
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', end);

    initMenu(); // בניית התפריט
    resize();   // חישוב גדלים
    loadQ(0);   // טעינת שאלה ראשונה
};

function resize() {
    W = cvs.width = mainArea.clientWidth;
    H = cvs.height = mainArea.clientHeight;
    // מרכוז מערכת הצירים
    ox = W/2; 
    oy = H/2 + H*0.1;
    draw();
}

/* --- לוגיקה מתמטית --- */
// חישוב ערך הפונקציה y
function f(x) { return cf[0]*x**3 + cf[1]*x**2 + cf[2]*x + cf[3]; }
// חישוב הנגזרת (שיפוע) m
function df(x) { return 3*cf[0]*x**2 + 2*cf[1]*x + cf[2]; }

// עדכון מהסליידר התחתון
function updateFromSlider() {
    if(!isDrag) {
        px = parseFloat(document.getElementById('mainX').value);
        update();
    }
}

/* --- אירועי גרירה --- */
function start(e) { isDrag = true; move(e); }
function end() { isDrag = false; }

function move(e) {
    if(!isDrag) return;
    if(e.preventDefault) e.preventDefault();
    
    let rect = cvs.getBoundingClientRect();
    // המרת פיקסלים לקואורדינטות מתמטיות
    px = (e.clientX - rect.left - ox) / scale;
    
    // גבולות גזרה
    if(px < -10) px = -10; if(px > 10) px = 10;
    
    // עדכון הסליידר והגרף
    document.getElementById('mainX').value = px;
    update();
}

function update() {
    let y = f(px), m = df(px);
    checkWin(y, m);
    draw();
}

/* --- בדיקת ניצחון --- */
function checkWin(y, m) {
    if(!goal) return;
    let win = false;
    let q = questions[document.getElementById('qSelect').value];

    // מציאת קיצון (שיפוע 0)
    if(goal === 'm0') win = Math.abs(m) < 0.2;
    // חיתוך ציר איקס (Y=0)
    else if(goal === 'y0') win = Math.abs(y) < 0.2;
    // שיפוע ספציפי
    else if(goal === 'slope_val') win = Math.abs(m - q.targetVal) < 0.2;
    // שיפוע 1
    else if(goal === 'm1') win = Math.abs(m - 1) < 0.2;
    
    // משיק עובר בנקודה
    else if(goal === 'tan_pass') {
        let t = q.target; 
        // משוואת משיק: Y - y1 = m(X - x1)
        // נבדוק אם הנקודה t מקיימת את המשוואה בקירוב
        let predictedY = m * (t[0] - px) + y;
        win = Math.abs(predictedY - t[1]) < 0.5;
    }
    
    // נורמל עובר בנקודה
    else if(goal === 'norm_pass') {
        let t = q.target;
        // תנאי ניצבות: מכפלת שיפועים = -1
        // או בדיקה גיאומטרית
        let val = (t[1] - y) * m + (t[0] - px);
        win = Math.abs(val) < 0.6;
    }

    let badge = document.getElementById('successBanner');
    if(win) badge.classList.add('show');
    else badge.classList.remove('show');
}

/* --- ציור (החלק הויזואלי המרכזי) --- */
function draw() {
    ctx.clearRect(0,0,W,H);
    
    // 1. רשת משבצות
    ctx.strokeStyle = "#e2e8f0"; ctx.lineWidth = 1; ctx.beginPath();
    for(let x=ox%scale; x<W; x+=scale) { ctx.moveTo(x,0); ctx.lineTo(x,H); }
    for(let y=oy%scale; y<H; y+=scale) { ctx.moveTo(0,y); ctx.lineTo(W,y); }
    ctx.stroke();
    
    // 2. צירים ראשיים
    ctx.strokeStyle = "#94a3b8"; ctx.lineWidth = 2; ctx.beginPath();
    ctx.moveTo(0,oy); ctx.lineTo(W,oy); ctx.moveTo(ox,0); ctx.lineTo(ox,H); ctx.stroke();
    
    // 3. ציור נקודת מטרה (Target) אם יש בשאלה
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

    // 4. ציור הפונקציה (הקו הכחול)
    ctx.strokeStyle = "#2563eb"; ctx.lineWidth = 4; ctx.beginPath();
    let sx = -ox/scale, ex = (W-ox)/scale;
    // רזולוציה גבוהה לציור חלק
    for(let x=sx; x<=ex; x+=0.05) {
        let cx=ox+x*scale, cy=oy-f(x)*scale;
        if(x===sx) ctx.moveTo(cx,cy); else ctx.lineTo(cx,cy);
    }
    ctx.stroke();
    
    // חישוב נתונים לנקודה הנוכחית
    let cx=ox+px*scale;
    let yVal = f(px);
    let cy=oy-yVal*scale;
    let m=df(px);
    
    // 5. ציור המשיק (הקו הכתום)
    ctx.strokeStyle="#f97316"; ctx.lineWidth=2; ctx.beginPath();
    // מצייר קו ארוך מאוד לשני הצדדים
    ctx.moveTo(cx-1000, cy+1000*m); ctx.lineTo(cx+1000, cy-1000*m);
    ctx.stroke();

    // 6. ציור נורמל (קו סגול מרוסק) - רק אם רלוונטי
    if(q && q.goal === 'norm_pass') { 
        ctx.strokeStyle="#a855f7"; ctx.setLineDash([5,5]); ctx.beginPath();
        let nm = -1/m;
        if(Math.abs(m)<0.01) { ctx.moveTo(cx, cy-1000); ctx.lineTo(cx, cy+1000); }
        else { ctx.moveTo(cx-1000, cy+1000*nm); ctx.lineTo(cx+1000, cy-1000*nm); }
        ctx.stroke(); ctx.setLineDash([]);
    }
    
    // 7. הנקודה עצמה
    ctx.fillStyle="#2563eb"; ctx.beginPath(); ctx.arc(cx,cy,8,0,6.28); ctx.fill();
    ctx.strokeStyle="white"; ctx.lineWidth=2; ctx.stroke();

    // 8. ויזואליזציה מתקדמת: נתונים + משוואת משיק
    drawDataBox(cx, cy, px, yVal, m);
}

/* --- פונקציית העזר לציור המידע (השילוש הקדוש) --- */
function drawDataBox(cx, cy, x, y, m) {
    // חישוב משוואת הישר: y = mx + b
    // b = y - mx
    let b = y - (m * x);
    
    // הגדרות עיצוב לקופסה
    const boxWidth = 140;
    const boxHeight = 90;
    let bx = cx + 20; // מיקום X של הקופסה
    let by = cy - 100; // מיקום Y של הקופסה
    
    // מניעת יציאה מהמסך (אם הנקודה בקצה ימין או למעלה)
    if (bx + boxWidth > W) bx = cx - boxWidth - 20;
    if (by < 10) by = cy + 20;

    // ציור הרקע של הקופסה (מעין כרטיסייה)
    ctx.save();
    ctx.shadowColor = "rgba(0,0,0,0.15)";
    ctx.shadowBlur = 10;
    ctx.shadowOffsetY = 4;
    ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
    ctx.strokeStyle = "#e2e8f0";
    ctx.lineWidth = 1;
    
    // שימוש ב-roundRect (נתמך בדפדפנים חדשים) או rect רגיל
    if(ctx.roundRect) ctx.beginPath(), ctx.roundRect(bx, by, boxWidth, boxHeight, 12);
    else ctx.beginPath(), ctx.rect(bx, by, boxWidth, boxHeight);
    
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    // --- כתיבת הטקסטים בתוך הקופסה ---
    ctx.font = "14px Consolas, monospace"; // פונט מונוספייס למספרים
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    
    let lineH = 20; // גובה שורה
    let startY = by + 20;
    let pad = bx + 15;

    // שורה 1: X (אפור כהה)
    ctx.fillStyle = "#475569"; 
    ctx.fillText(`x : ${x.toFixed(2)}`, pad, startY);

    // שורה 2: Y (כחול - צבע הפונקציה)
    ctx.fillStyle = "#2563eb"; 
    ctx.fillText(`y : ${y.toFixed(2)}`, pad, startY + lineH);

    // שורה 3: M (כתום מודגש - צבע המשיק)
    ctx.font = "bold 14px Consolas, monospace";
    ctx.fillStyle = "#ea580c"; 
    ctx.fillText(`m : ${m.toFixed(2)}`, pad, startY + lineH * 2);

    // שורה 4: משוואת המשיק (קו הפרדה ומשוואה)
    // קו הפרדה קטן
    ctx.beginPath();
    ctx.moveTo(pad, startY + lineH * 2.8);
    ctx.lineTo(bx + boxWidth - 15, startY + lineH * 2.8);
    ctx.strokeStyle = "#cbd5e1"; ctx.lineWidth = 1; ctx.stroke();

    // בניית המחרוזת של המשוואה: y = mx + b
    let sign = b >= 0 ? "+" : "-"; // סימן פלוס או מינוס
    let bAbs = Math.abs(b).toFixed(2);
    let eqStr = `y = ${m.toFixed(2)}x ${sign} ${bAbs}`;

    ctx.font = "bold 13px sans-serif";
    ctx.fillStyle = "#334155";
    ctx.fillText(eqStr, pad, startY + lineH * 3.8);
}

/* --- ניהול ממשק משתמש ותפריטים --- */
function initMenu() {
    let s = document.getElementById('qSelect');
    s.innerHTML = "";
    let cats = {};
    // מיון שאלות לפי קטגוריות
    questions.forEach((q,i) => {
        if(!cats[q.cat]) cats[q.cat]=[];
        cats[q.cat].push({i, t:q.t});
    });
    // בניית ה-Select
    for(let c in cats) {
        let g = document.createElement('optgroup'); g.label=c;
        cats[c].forEach(o=>{
            let op=document.createElement('option');
            op.value=o.i; op.innerText=o.t;
            g.appendChild(op);
        });
        s.appendChild(g);
    }
}

function loadQuestionFromSelect() { loadQ(document.getElementById('qSelect').value); }

function nextQuestion() {
    let s = document.getElementById('qSelect');
    let i = parseInt(s.value) + 1;
    if(i < questions.length) { s.value = i; loadQ(i); }
}

function loadQ(i) {
    let q = questions[i];
    cf = [...q.p]; goal = q.goal;
    document.getElementById('qText').innerText = q.d;
    
    // עדכון שדות העריכה הידנית (אם יש)
    ['mA','mB','mC','mD'].forEach((id,k)=> {
        let el = document.getElementById(id);
        if(el) el.value=cf[k];
    });
    
    // איפוס מיקום לנקודת התחלה נוחה
    px = -2; 
    document.getElementById('mainX').value=px;
    document.getElementById('successBanner').classList.remove('show');
    
    // כתיבת הפונקציה בטקסט למעלה
    let txt = `y = ${cf[0]?cf[0]+"x³ ":""}${cf[1]?cf[1]+"x² ":""}${cf[2]?cf[2]+"x ":""}${cf[3]||""}`;
    txt = txt.replace(/\+ -/g, "- ").replace(/ 1x/g," x").replace(/ 0x./g,"");
    if(txt.endsWith("= ")) txt += "0";
    document.getElementById('eqn').innerText = txt;
    
    update();
}

// פונקציה למצב עריכה חופשי (כשהמשתמש משנה את המקדמים למטה)
function manual() {
    cf = ['mA','mB','mC','mD'].map(id=>parseFloat(document.getElementById(id).value)||0);
    goal=''; 
    document.getElementById('qText').innerText="מצב חופשי";
    update();
}
