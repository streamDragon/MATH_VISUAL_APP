/* script.js - הגרסה המלאה עם סאונד, נגזרות וחם/קר */

const canvas = document.getElementById('cvs');
const ctx = canvas.getContext('2d');

// משתנים גלובליים
let width, height;
let scale = 40; // פיקסלים ליחידה
let offsetX = 0, offsetY = 0;

// פרמטרים לפונקציה
let a = 1, b = 0, c = 0, d = 0;
let currentX = 0;

// שאלות ומשחקים
let currentQIndex = 0;
let targetSlope = null; // למשחק מציאת שיפוע
let isSoundOn = true;

// --- אתחול ---
window.onload = function() {
    handleResize();
    window.addEventListener('resize', handleResize);
    
    // טעינת שאלות אם קיימות
    if (typeof questions !== 'undefined') {
        initQuestions();
    } else {
        // שאלה ברירת מחדל אם הקובץ לא נטען
        document.getElementById('qText').innerText = "חקור את הפונקציה בעזרת הסליידרים";
    }
    
    updateEngine();
};

function handleResize() {
    const container = document.getElementById('graph-panel');
    width = canvas.width = container.clientWidth;
    height = canvas.height = container.clientHeight;
    offsetX = width / 2;
    offsetY = height / 2;
    draw();
}

// --- המנוע הגרפי ---
function draw() {
    // ניקוי מסך
    ctx.clearRect(0, 0, width, height);
    
    // ציור רשת צירים
    drawGrid();
    
    // 1. ציור הפונקציה הראשית (כחול)
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#2563eb'; // כחול
    drawFunction(x => a*x*x*x + b*x*x + c*x + d);
    
    // 2. ציור הנגזרת (אדום מקווקו) - רק אם רלוונטי
    // הנגזרת של ax^3 + bx^2 + cx + d היא: 3ax^2 + 2bx + c
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#ef4444'; // אדום
    ctx.setLineDash([5, 5]); // קו מקווקו
    drawFunction(x => 3*a*x*x + 2*b*x + c);
    ctx.setLineDash([]); // איפוס הקו
    
    // 3. ציור הנקודה והמשיק
    drawPointAndTangent(currentX);
}

function drawGrid() {
    ctx.beginPath();
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;
    
    // קווים אנכיים
    for(let x = offsetX % scale; x < width; x += scale) {
        ctx.moveTo(x, 0); ctx.lineTo(x, height);
    }
    // קווים אופקיים
    for(let y = offsetY % scale; y < height; y += scale) {
        ctx.moveTo(0, y); ctx.lineTo(width, y);
    }
    ctx.stroke();
    
    // צירים ראשיים
    ctx.beginPath();
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.moveTo(0, offsetY); ctx.lineTo(width, offsetY); // X axis
    ctx.moveTo(offsetX, 0); ctx.lineTo(offsetX, height); // Y axis
    ctx.stroke();
}

function drawFunction(f) {
    ctx.beginPath();
    for (let px = 0; px < width; px += 2) {
        let x = (px - offsetX) / scale;
        let y = f(x);
        let py = offsetY - y * scale;
        if (px === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
    }
    ctx.stroke();
}

function drawPointAndTangent(x0) {
    // חישוב ערכים
    let y0 = a*x0*x0*x0 + b*x0*x0 + c*x0 + d;
    let m = 3*a*x0*x0 + 2*b*x0 + c; // השיפוע (הנגזרת)
    
    let px = offsetX + x0 * scale;
    let py = offsetY - y0 * scale;
    
    // ציור נקודה
    ctx.fillStyle = '#2563eb';
    ctx.beginPath(); ctx.arc(px, py, 6, 0, Math.PI*2); ctx.fill();
    
    // ציור משיק (קו ישר: y - y0 = m(x - x0) => y = m(x-x0) + y0)
    ctx.strokeStyle = 'orange';
    ctx.lineWidth = 2;
    ctx.beginPath();
    // לוקחים נקודה קצת שמאלה וקצת ימינה כדי לצייר קו
    let xStart = x0 - 2;
    let yStart = m * (xStart - x0) + y0;
    let xEnd = x0 + 2;
    let yEnd = m * (xEnd - x0) + y0;
    
    ctx.moveTo(offsetX + xStart*scale, offsetY - yStart*scale);
    ctx.lineTo(offsetX + xEnd*scale, offsetY - yEnd*scale);
    ctx.stroke();
    
    // עדכון טקסטים
    updateHUD(x0, y0, m);
    
    // בדיקת משחק (חם/קר)
    checkGame(m);
}

// --- לוגיקה וממשק ---

function updateEngine() {
    // מעדכן את המשתנים מהסליידרים
    currentX = parseFloat(document.getElementById('mainX').value);
    // עדכון פרמטרים רק אם אנחנו במצב ידני (לא בתוך שאלה שנועלת אותם)
    // כרגע נאפשר תמיד:
    manual(); 
    
    draw();
}

function updateFromSlider() {
    currentX = parseFloat(document.getElementById('mainX').value);
    document.getElementById('valX_slider').innerText = currentX.toFixed(1);
    draw();
}

function manual() {
    a = parseFloat(document.getElementById('mA').value);
    b = parseFloat(document.getElementById('mB').value);
    c = parseFloat(document.getElementById('mC').value);
    d = parseFloat(document.getElementById('mD').value);
    
    document.getElementById('valA').innerText = a;
    document.getElementById('valB').innerText = b;
    document.getElementById('valC').innerText = c;
    document.getElementById('valD').innerText = d;
    
    updateMathJax();
}

function updateHUD(x, y, m) {
    // עדכון תצוגת פונקציה
    let text = `f(x) = `;
    if (a!==0) text += `${a}x^3 `;
    if (b!==0) text += `${b>0?'+':''}${b}x^2 `;
    if (c!==0) text += `${c>0?'+':''}${c}x `;
    if (d!==0) text += `${d>0?'+':''}${d}`;
    document.getElementById('eqn').innerText = text;
    
    // עדכון תצוגת נגזרת
    document.getElementById('derivEqn').innerText = `f'(x) = ${m.toFixed(2)}`;
    
    // עדכון ה-Tooltip (השלשה הקדושה)
    const tt = document.getElementById('holyTrinity');
    // מיקום ה-Tooltip ליד הנקודה
    let px = offsetX + x * scale;
    let py = offsetY - y * scale;
    tt.style.display = 'block';
    tt.style.left = (px + 15) + 'px';
    tt.style.top = (py - 15) + 'px';
    tt.innerHTML = `x: ${x.toFixed(1)}<br>y: ${y.toFixed(1)}<br>m: ${m.toFixed(2)}`;
}

// --- משחוק וסאונד ---

// יצירת סאונד (AudioContext)
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
function playSound(type) {
    if (!isSoundOn) return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    
    if (type === 'success') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(500, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1000, audioCtx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.5);
    } else if (type === 'click') {
        osc.frequency.value = 300;
        gain.gain.value = 0.1;
        osc.start();
        osc.stop(audioCtx.currentTime + 0.05);
    }
}

function toggleSound() {
    isSoundOn = !isSoundOn;
    document.getElementById('btnSound').innerText = isSoundOn ? '🔊' : '🔇';
}

function checkGame(currentM) {
    // אם הוגדר שיפוע מטרה בשאלה
    if (targetSlope !== null) {
        document.getElementById('game-panel').style.display = 'block';
        
        // חישוב מרחק
        let diff = Math.abs(currentM - targetSlope);
        let bar = document.getElementById('proximityBar');
        
        // מקסימום מרחק לצורך התצוגה (נגיד 5 יחידות)
        let percent = Math.max(0, 100 - (diff * 20)); 
        bar.style.width = percent + "%";
        
        // טקסט חם/קר
        let txt = document.getElementById('hotColdText');
        if (diff < 0.1) {
            txt.innerText = "🔥🔥 בול בפוני! 🔥🔥";
            if (!document.getElementById('successToast').classList.contains('show')) {
                showSuccess();
            }
        } else if (diff < 1) {
            txt.innerText = "🔥 מתחמם מאוד...";
        } else if (diff < 3) {
            txt.innerText = "❄️ מתקרר...";
        } else {
            txt.innerText = "🧊 קפוא";
        }
    } else {
        document.getElementById('game-panel').style.display = 'none';
    }
}

function showSuccess() {
    playSound('success');
    const toast = document.getElementById('successToast');
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
}

// --- ניהול נוסחאות ושאלות ---
function updateMathJax() {
    // אם תרצה לרענן את MathJax (לא חובה בקוד פשוט)
    if (window.MathJax) {
       // MathJax.typesetPromise();
    }
}

function openFormulas() { document.getElementById('formulaModal').style.display = 'block'; }
function closeFormulas() { document.getElementById('formulaModal').style.display = 'none'; }
function resetView() {
    a=1; b=0; c=0; d=0;
    document.getElementById('mA').value = 1;
    document.getElementById('mB').value = 0;
    document.getElementById('mC').value = 0;
    document.getElementById('mD').value = 0;
    manual();
}
