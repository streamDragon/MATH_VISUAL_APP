/* script.js - המנוע המלא והמתוקן */

const canvas = document.getElementById('cvs');
const ctx = canvas.getContext('2d');

// --- משתנים גלובליים ---
let width, height;
let scale = 40; // זום
let offsetX = 0, offsetY = 0;

// פרמטרים של הפונקציה
let a = 0, b = 0, c = 0, d = 0;
let currentX = 0;

// ניהול שאלות
let currentQ = null; 
let isSolved = false;
let isSoundOn = true;

// --- אתחול (טעינת הדף) ---
window.onload = function() {
    // 1. התאמה למסך
    handleResize();
    window.addEventListener('resize', handleResize);

    // 2. טעינת רשימת השאלות לתוך ה-Select
    initQuestionSelect();

    // 3. טעינת השאלה הראשונה
    loadQuestion(0);

    // 4. הפעלת לולאת הציור הראשונה
    updateEngine();
};

function handleResize() {
    const container = document.getElementById('graph-panel');
    if(container) {
        width = canvas.width = container.clientWidth;
        height = canvas.height = container.clientHeight;
        offsetX = width / 2;
        offsetY = height / 2;
        draw();
    }
}

// --- מנוע השאלות ---
function initQuestionSelect() {
    const select = document.getElementById('qSelect');
    if (!window.bagrutData) return;

    select.innerHTML = "";
    window.bagrutData.forEach((q, index) => {
        let opt = document.createElement('option');
        opt.value = index;
        opt.innerText = q.t;
        select.appendChild(opt);
    });
}

function loadQuestionFromSelect() {
    const index = document.getElementById('qSelect').value;
    loadQuestion(index);
}

function loadQuestion(index) {
    if (!window.bagrutData || !window.bagrutData[index]) return;
    
    currentQ = window.bagrutData[index];
    isSolved = false;
    document.getElementById('successToast').classList.remove('show');

    // 1. עדכון טקסטים
    document.getElementById('qCounter').innerText = "שאלה " + (parseInt(index) + 1);
    document.getElementById('qText').innerText = currentQ.d;

    // 2. איפוס פרמטרים לפי השאלה
    // המערך p הוא: [a, b, c, d]
    a = currentQ.p[0];
    b = currentQ.p[1];
    c = currentQ.p[2];
    d = currentQ.p[3];

    // עדכון הסליידרים שיתאימו למספרים
    document.getElementById('mA').value = a;
    document.getElementById('mB').value = b;
    document.getElementById('mC').value = c;
    document.getElementById('mD').value = d;

    // 3. נעילת סליידרים שאסור לגעת בהם
    unlockAllSliders();
    if (currentQ.locked) {
        currentQ.locked.forEach(id => {
            document.getElementById(id).disabled = true;
        });
    }

    // 4. איפוס X לאמצע
    currentX = 0;
    document.getElementById('mainX').value = 0;

    updateEngine();
}

function unlockAllSliders() {
    ['mA', 'mB', 'mC', 'mD'].forEach(id => document.getElementById(id).disabled = false);
}

function nextQuestion() {
    const select = document.getElementById('qSelect');
    if (select.selectedIndex < select.options.length - 1) {
        select.selectedIndex++;
        loadQuestionFromSelect();
    }
}

// --- לוגיקה וחישובים ---

// נקרא כל פעם שמזיזים סליידר
function updateFromSlider() {
    currentX = parseFloat(document.getElementById('mainX').value);
    document.getElementById('valX_slider').innerText = currentX.toFixed(1);
    draw();
    checkSuccess(); // בדיקה אם פתרנו
}

// נקרא כל פעם שמזיזים פרמטר a,b,c,d
function manual() {
    a = parseFloat(document.getElementById('mA').value);
    b = parseFloat(document.getElementById('mB').value);
    c = parseFloat(document.getElementById('mC').value);
    d = parseFloat(document.getElementById('mD').value);
    
    // עדכון המספרים ליד הסליידר
    document.getElementById('valA').innerText = a;
    document.getElementById('valB').innerText = b;
    document.getElementById('valC').innerText = c;
    document.getElementById('valD').innerText = d;

    draw();
    checkSuccess(); // בדיקה אם פתרנו
}

function updateEngine() {
    // עדכון ראשוני של כל הערכים
    manual();
    updateFromSlider();
}

// --- ציור הגרף (החלק הוויזואלי) ---
function draw() {
    ctx.clearRect(0, 0, width, height);
    drawGrid();

    // 1. אם יש מטרות (נקודות שצריך לפגוע בהן) - נצייר אותן
    if (currentQ && currentQ.targets) {
        currentQ.targets.forEach(t => {
            drawTargetPoint(t.x, t.y);
        });
    }

    // 2. הפונקציה (כחול)
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#2563eb';
    drawFunction(x => a*x*x*x + b*x*x + c*x + d);

    // 3. הנגזרת (אדום מקווקו) - ליד הפונקציה
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#ef4444';
    ctx.setLineDash([5, 5]);
    drawFunction(x => 3*a*x*x + 2*b*x + c);
    ctx.setLineDash([]); 

    // 4. המשיק והנקודה
    drawPointAndTangent(currentX);
}

function drawGrid() {
    ctx.beginPath();
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;
    // רשת
    for(let x = offsetX % scale; x < width; x += scale) {
        ctx.moveTo(x, 0); ctx.lineTo(x, height);
    }
    for(let y = offsetY % scale; y < height; y += scale) {
        ctx.moveTo(0, y); ctx.lineTo(width, y);
    }
    ctx.stroke();
    // צירים
    ctx.beginPath();
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.moveTo(0, offsetY); ctx.lineTo(width, offsetY);
    ctx.moveTo(offsetX, 0); ctx.lineTo(offsetX, height);
    ctx.stroke();
}

function drawFunction(f) {
    ctx.beginPath();
    for (let px = 0; px < width; px += 2) {
        let x = (px - offsetX) / scale;
        let y = f(x);
        let py = offsetY - y * scale;
        if (px===0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
    }
    ctx.stroke();
}

function drawTargetPoint(tx, ty) {
    let px = offsetX + tx * scale;
    let py = offsetY - ty * scale;
    ctx.fillStyle = 'rgba(0, 200, 0, 0.3)'; // ירוק שקוף
    ctx.beginPath(); ctx.arc(px, py, 10, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = 'green';
    ctx.beginPath(); ctx.arc(px, py, 3, 0, Math.PI*2); ctx.fill();
}

function drawPointAndTangent(x0) {
    let y0 = a*x0*x0*x0 + b*x0*x0 + c*x0 + d;
    let m = 3*a*x0*x0 + 2*b*x0 + c; // נגזרת

    let px = offsetX + x0 * scale;
    let py = offsetY - y0 * scale;

    // נקודה כחולה
    ctx.fillStyle = '#2563eb';
    ctx.beginPath(); ctx.arc(px, py, 6, 0, Math.PI*2); ctx.fill();

    // משיק
    ctx.strokeStyle = 'orange';
    ctx.lineWidth = 2;
    ctx.beginPath();
    let xS = x0 - 2, xE = x0 + 2;
    let yS = m*(xS - x0) + y0;
    let yE = m*(xE - x0) + y0;
    ctx.moveTo(offsetX + xS*scale, offsetY - yS*scale);
    ctx.lineTo(offsetX + xE*scale, offsetY - yE*scale);
    ctx.stroke();

    // עדכון טקסט משוואות
    updateHUD(x0, y0, m);
}

function updateHUD(x, y, m) {
    document.getElementById('eqn').innerText = `f(x) = ${formatPoly(a,b,c,d)}`;
    document.getElementById('derivEqn').innerText = `f'(x) = ${m.toFixed(2)}`;
    
    // טולטיפ
    const tt = document.getElementById('holyTrinity');
    tt.style.display = 'block';
    tt.style.left = (offsetX + x*scale + 15) + 'px';
    tt.style.top = (offsetY - y*scale - 15) + 'px';
    tt.innerHTML = `x: ${x.toFixed(1)}<br>y: ${y.toFixed(1)}<br>m: ${m.toFixed(2)}`;
}

function formatPoly(a,b,c,d) {
    let s = "";
    if(a!==0) s+= `${a}x^3 `;
    if(b!==0) s+= `${b>=0?'+':''}${b}x^2 `;
    if(c!==0) s+= `${c>=0?'+':''}${c}x `;
    if(d!==0) s+= `${d>=0?'+':''}${d}`;
    return s || "0";
}

// --- מנגנון חם/קר ובדיקת ניצחון ---
function checkSuccess() {
    if (!currentQ || isSolved) return;

    let won = false;
    let distance = 100; // מרחק התחלתי גדול

    // סוג 1: חקירה (צריך להביא את השיפוע ל-0)
    if (currentQ.goal === "slope_zero") {
        let m = 3*a*currentX*currentX + 2*b*currentX + c;
        distance = Math.abs(m); // המרחק הוא גודל השיפוע (אנחנו רוצים 0)
        
        // בונוס: אם זו נקודת קיצון ספציפית
        if (currentQ.targetX !== undefined) {
             distance += Math.abs(currentX - currentQ.targetX);
        }

        if (distance < 0.1) won = true;
    }

    // סוג 2: פגיעה במטרות (שינוי פרמטרים)
    else if (currentQ.goal === "hit_targets") {
        let totalError = 0;
        currentQ.targets.forEach(t => {
            let y_calc = a*t.x*t.x*t.x + b*t.x*t.x + c*t.x + d;
            totalError += Math.abs(y_calc - t.y);
        });
        distance = totalError;
        if (totalError < 0.1) won = true;
    }

    // עדכון גרפי של חם/קר
    updateHotColdBar(distance);

    if (won) {
        isSolved = true;
        playSound('success');
        document.getElementById('successToast').classList.add('show');
        document.getElementById('hotColdText').innerText = "🏆 כל הכבוד! עבור לשאלה הבאה";
    }
}

function updateHotColdBar(dist) {
    const bar = document.getElementById('proximityBar');
    const txt = document.getElementById('hotColdText');
    const panel = document.getElementById('game-panel');
    
    panel.style.display = 'block';

    // חישוב אחוזים (ככל שהמרחק קטן, האחוז גדל)
    // נניח שמרחק 5 ומעלה זה 0%, ומרחק 0 זה 100%
    let percent = Math.max(0, 100 - (dist * 20));
    
    bar.style.width = percent + "%";
    
    if (dist < 0.2) txt.innerText = "🔥🔥 רותח! זה שם!";
    else if (dist < 1) txt.innerText = "🔥 מתחמם...";
    else if (dist < 3) txt.innerText = "❄️ מתקרר...";
    else txt.innerText = "🧊 קפוא";
}

// --- סאונד ---
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
function playSound(type) {
    if (!isSoundOn) return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    
    if (type === 'success') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(400, audioCtx.currentTime);
        osc.frequency.linearRampToValueAtTime(800, audioCtx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
        gain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.5);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.5);
    }
}
function toggleSound() {
    isSoundOn = !isSoundOn;
    document.getElementById('btnSound').innerText = isSoundOn ? '🔊' : '🔇';
}
// עטיפות לפונקציות נוספות מה-HTML
function openFormulas() { document.getElementById('formulaModal').style.display = 'block'; }
function closeFormulas() { document.getElementById('formulaModal').style.display = 'none'; }
function resetView() { loadQuestionFromSelect(); }
