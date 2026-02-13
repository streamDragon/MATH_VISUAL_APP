/* script.js - ניהול משחק, גרפיקה ויומן משוואות */

let canvas, ctx, width, height;
let a = 0, b = 1, c = 0, d = 0; // מקדמים
let currentX = 0;
let scale = 40;
let currentQIndex = 0;
let isSolved = false;
let isDragging = false;

window.onload = function() {
    if (typeof bagrutData === 'undefined') { alert("שגיאה: קובץ השאלות חסר."); return; }

    canvas = document.getElementById('graphCanvas');
    ctx = canvas.getContext('2d');
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // אירועי מגע ועכבר
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

function setupControls() {
    // סליידרים של הפונקציה (A, B, C, D)
    ['a', 'b', 'c', 'd'].forEach(p => {
        const slider = document.getElementById('param' + p.toUpperCase());
        
        // אירוע 'input': מתעדכן בזמן אמת לגרירה חלקה
        slider.addEventListener('input', (e) => {
            window[p] = parseFloat(e.target.value);
            document.getElementById('val' + p.toUpperCase()).innerText = window[p];
            updateGraph();
        });

        // אירוע 'change': קורה כשהמשתמש עוזב את הסליידר - לרישום ביומן
        slider.addEventListener('change', (e) => {
            logEquationToJournal();
        });
    });

    // סליידר ה-X
    const xSlider = document.getElementById('paramX');
    xSlider.addEventListener('input', (e) => {
        currentX = parseFloat(e.target.value);
        document.getElementById('valX').innerText = currentX;
        updateGraph();
    });
}

function setupNavigation() {
    const btnPrev = document.getElementById('btnPrev');
    const btnNext = document.getElementById('btnNext');
    const select = document.getElementById('selectQuestion');

    bagrutData.forEach((q, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.text = `שאלה ${q.id}: ${q.title.split(':')[1] ? q.title.split(':')[1].trim() : q.title}`;
        select.appendChild(option);
    });

    btnPrev.addEventListener('click', () => { if (currentQIndex > 0) loadQuestion(currentQIndex - 1); });
    btnNext.addEventListener('click', () => { if (currentQIndex < bagrutData.length - 1) loadQuestion(currentQIndex + 1); });
    select.addEventListener('change', (e) => { loadQuestion(parseInt(e.target.value)); });
}

function loadQuestion(idx) {
    currentQIndex = idx;
    const q = bagrutData[idx];
    isSolved = false;

    // UI Updates
    document.getElementById('selectQuestion').value = idx;
    document.getElementById('btnPrev').disabled = (idx === 0);
    document.getElementById('btnNext').disabled = (idx === bagrutData.length - 1);
    document.getElementById('successMessage').style.display = 'none';
    document.getElementById('questionTitle').innerText = q.title;
    document.getElementById('questionText').innerHTML = q.instruction;
    
    // ניקוי יומן להתחלה חדשה של שאלה
    document.getElementById('journalList').innerHTML = ''; 

    // הגדרת פרמטרים ונעילות
    ['a', 'b', 'c', 'd'].forEach(p => {
        const val = q.setup[p];
        window[p] = val;
        const slider = document.getElementById('param' + p.toUpperCase());
        slider.value = val;
        document.getElementById('val' + p.toUpperCase()).innerText = val;

        const isLocked = q.locked.includes(p);
        slider.disabled = isLocked;
        slider.parentElement.style.opacity = isLocked ? "0.5" : "1";
    });

    // מיקום התחלתי
    currentX = (q.startX !== undefined) ? q.startX : -4;
    
    // אם המטרה היא למצוא פרמטר, נועלים את ה-X כדי שהתלמיד יתמקד בבניית הפונקציה
    const xSlider = document.getElementById('paramX');
    if (q.type === 'find_param') {
        currentX = q.targetPoint ? q.targetPoint.x : 0;
        xSlider.disabled = true;
        xSlider.parentElement.style.opacity = "0.5";
    } else {
        xSlider.disabled = false;
        xSlider.parentElement.style.opacity = "1";
        xSlider.value = currentX;
    }
    
    document.getElementById('valX').innerText = currentX;
    updateGraph();
    logEquationToJournal(); // רישום מצב התחלתי
}

// --- מתמטיקה ---
function f(x) { return a * Math.pow(x, 3) + b * Math.pow(x, 2) + c * x + d; }
function df(x) { return 3 * a * Math.pow(x, 2) + 2 * b * x + c; }

function getMathString(isDeriv) {
    let parts = [];
    if (isDeriv) {
        let A = 3*a, B = 2*b, C = c;
        if (Math.abs(A) > 0.001) parts.push(`${round(A)}x²`);
        if (Math.abs(B) > 0.001) parts.push(`${B>0&&parts.length>0?'+':''}${round(B)}x`);
        if (Math.abs(C) > 0.001 || parts.length===0) parts.push(`${C>0&&parts.length>0?'+':''}${round(C)}`);
    } else {
        if (Math.abs(a) > 0.001) parts.push(`${a==-1?'-':(a==1?'':a)}x³`);
        if (Math.abs(b) > 0.001) parts.push(`${b>0&&parts.length>0?'+':''}${b}x²`);
        if (Math.abs(c) > 0.001) parts.push(`${c>0&&parts.length>0?'+':''}${c}x`);
        if (Math.abs(d) > 0.001 || parts.length===0) parts.push(`${d>0&&parts.length>0?'+':''}${d}`);
    }
    return parts.join(' ');
}
function round(num) { return Math.round(num * 100) / 100; }

// --- יומן משוואות ---
function logEquationToJournal() {
    const list = document.getElementById('journalList');
    const funcStr = "f(x) = " + getMathString(false);
    
    // בדיקה שלא רושמים כפילויות
    if (list.firstChild && list.firstChild.innerText.includes(funcStr)) return;

    const li = document.createElement('li');
    li.className = 'log-entry';
    li.innerHTML = `<span>${funcStr}</span> <span class="time">✏️ שינוי</span>`;
    list.prepend(li);
}

// --- גרפיקה ---
function updateGraph() {
    if (!ctx) return;
    
    let yVal = f(currentX);
    let mVal = df(currentX);
    
    // עדכון טקסטים
    document.getElementById('dispX').innerText = currentX.toFixed(1);
    document.getElementById('dispY').innerText = yVal.toFixed(2);
    document.getElementById('dispM').innerText = mVal.toFixed(2);
    document.getElementById('funcEqn').innerText = getMathString(false);
    document.getElementById('derivEqn').innerText = getMathString(true);
    document.getElementById('tangentEqn').innerText = `y - ${yVal.toFixed(1)} = ${mVal.toFixed(2)}(x - ${currentX.toFixed(1)})`;

    // ציור
    ctx.clearRect(0, 0, width, height);
    drawGrid();
    drawFunction();
    drawTangent(currentX, yVal, mVal);

    const q = bagrutData[currentQIndex];
    if (q.targetPoint) drawTargetPoint(q.targetPoint);

    if (!isSolved) checkAnswer(yVal, mVal);
}

function drawGrid() {
    const cx = width / 2;
    const cy = height / 2;
    ctx.lineWidth = 1;
    ctx.strokeStyle = "#e2e8f0";
    ctx.beginPath();
    for (let x = 0; x <= width; x += scale) { ctx.moveTo(x + (cx%scale), 0); ctx.lineTo(x + (cx%scale), height); }
    for (let y = 0; y <= height; y += scale) { ctx.moveTo(0, y + (cy%scale)); ctx.lineTo(width, y + (cy%scale)); }
    ctx.stroke();

    ctx.lineWidth = 2;
    ctx.strokeStyle = "#475569";
    ctx.beginPath();
    ctx.moveTo(0, cy); ctx.lineTo(width, cy);
    ctx.moveTo(cx, 0); ctx.lineTo(cx, height);
    ctx.stroke();
    
    // מספרים על הצירים
    ctx.font = "12px Assistant";
    ctx.fillStyle = "#64748b";
    ctx.textAlign = "center";
    for (let i = -10; i <= 10; i++) {
        if (i === 0) continue;
        ctx.fillText(i, cx + i * scale, cy + 20); // ציר X
        if (Math.abs(i) <= 6) ctx.fillText(i, cx - 15, cy - i * scale + 5); // ציר Y
    }
}

function drawFunction() {
    ctx.beginPath();
    ctx.strokeStyle = "#2563eb";
    ctx.lineWidth = 3;
    const cx = width / 2;
    const cy = height / 2;
    let started = false;
    for (let px = 0; px <= width; px+=2) {
        let xMath = (px - cx) / scale;
        let yMath = f(xMath);
        let py = cy - yMath * scale;
        if (py < -500 || py > height + 500) { started = false; continue; }
        if (!started) { ctx.moveTo(px, py); started = true; } else ctx.lineTo(px, py);
    }
    ctx.stroke();
}

function drawTangent(x0, y0, m) {
    const cx = width / 2;
    const cy = height / 2;
    const px = cx + x0 * scale;
    const py = cy - y0 * scale;

    // הקו המקווקו
    ctx.beginPath();
    ctx.strokeStyle = "#f59e0b";
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    const len = 10;
    ctx.moveTo(cx + (x0-len)*scale, cy - (y0 - m*len)*scale);
    ctx.lineTo(cx + (x0+len)*scale, cy - (y0 + m*len)*scale);
    ctx.stroke();
    ctx.setLineDash([]);

    // הנקודה עצמה
    ctx.beginPath();
    ctx.arc(px, py, 6, 0, 2 * Math.PI);
    ctx.fillStyle = "#f59e0b";
    ctx.fill();
    ctx.strokeStyle = "white";
    ctx.lineWidth = 2;
    ctx.stroke();

    // *** תווית צפה על הגרף (מתוקן) ***
    ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
    ctx.fillRect(px + 10, py - 35, 80, 25);
    ctx.strokeStyle = "#f59e0b";
    ctx.lineWidth = 1;
    ctx.strokeRect(px + 10, py - 35, 80, 25);
    
    ctx.fillStyle = "#1e293b";
    ctx.font = "bold 14px monospace";
    ctx.textAlign = "left";
    ctx.fillText(`(${x0.toFixed(1)}, ${y0.toFixed(1)})`, px + 15, py - 18);
}

function drawTargetPoint(pt) {
    const cx = width / 2;
    const cy = height / 2;
    const px = cx + pt.x * scale;
    const py = cy - pt.y * scale;

    // נקודה אדומה
    ctx.beginPath();
    ctx.arc(px, py, 5, 0, 2 * Math.PI);
    ctx.fillStyle = "#ef4444";
    ctx.fill();
    
    // גל
    ctx.beginPath();
    ctx.arc(px, py, 10 + Math.sin(Date.now()/200)*3, 0, 2 * Math.PI);
    ctx.strokeStyle = "rgba(239, 68, 68, 0.5)";
    ctx.stroke();

    // *** תווית יעד קבועה (מתוקן) ***
    ctx.fillStyle = "rgba(239, 68, 68, 0.1)"; // רקע אדמדם בהיר
    ctx.fillRect(px + 10, py + 10, 60, 20);
    
    ctx.fillStyle = "#ef4444";
    ctx.font = "bold 12px monospace";
    ctx.textAlign = "left";
    ctx.fillText(`Target (${pt.x}, ${pt.y})`, px + 12, py + 24);
}

// --- אינטראקציה ---
function startDrag(evt) {
    const rect = canvas.getBoundingClientRect();
    const clientX = evt.touches ? evt.touches[0].clientX : evt.clientX;
    const x = clientX - rect.left;
    const cx = width / 2;
    if (Math.abs((x - cx) / scale - currentX) < 1) isDragging = true;
}

function doDrag(evt) {
    if (!isDragging) return;
    evt.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const clientX = evt.touches ? evt.touches[0].clientX : evt.clientX;
    let newX = (clientX - rect.left - width/2) / scale;
    if (Math.abs(newX - Math.round(newX*2)/2) < 0.2) newX = Math.round(newX*2)/2;
    if (newX < -6) newX = -6; if (newX > 6) newX = 6;
    
    // אם השאלה נועלת את X, אנחנו לא מאפשרים גרירה
    if (document.getElementById('paramX').disabled) return;

    currentX = newX;
    document.getElementById('paramX').value = currentX;
    document.getElementById('valX').innerText = currentX;
    updateGraph();
}

function endDrag() { isDragging = false; }

function checkAnswer(curY, curM) {
    const q = bagrutData[currentQIndex];
    let win = false;
    let tolerance = 0.15;

    if (q.goal === 'hit_target' && Math.abs(curY - q.targetPoint.y) < tolerance) {
        // בודקים אם הפונקציה באמת עוברת דרך הנקודה (עבור ה-X של הנקודה)
        let targetY_at_TargetX = f(q.targetPoint.x);
        if (Math.abs(targetY_at_TargetX - q.targetPoint.y) < tolerance) win = true;
    }
    else if (q.goal === 'm0' && Math.abs(curM) < tolerance) win = true;
    else if (q.goal === 'slope_val' && Math.abs(curM - q.targetVal) < tolerance) win = true;
    else if (q.goal === 'y0' && Math.abs(curY) < tolerance) {
        if (!q.targetRegion || (currentX > q.targetRegion.min && currentX < q.targetRegion.max)) win = true;
    }

    if (win) {
        isSolved = true;
        const msg = document.getElementById('successMessage');
        msg.style.display = 'block';
        msg.innerHTML = "🎉 הצלחה! פיצחת את הנוסחה.";
        
        const list = document.getElementById('journalList');
        const li = document.createElement('li');
        li.className = 'success-entry';
        li.innerHTML = `<span>🏆 פתרון שאלה ${q.id}</span>`;
        list.prepend(li);
    }
}

setInterval(() => { if (bagrutData[currentQIndex].targetPoint) updateGraph(); }, 100);
