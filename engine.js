/* === מנוע גרפי ולוגיקה ויזואלית === */

let cvs, ctx, width, height, scale = 40, originX, originY;
let a=0, b=0, c=0, d=0, xVal=0;
let showNormal = false;
let currQIndex = 0;
let isWin = false;

// משתנים לגרירה
let isDragging = false;
let dragTarget = null;
let lastMouseY = 0;

window.onload = function() {
    cvs = document.getElementById('cvs');
    ctx = cvs.getContext('2d');
    
    // חיבור אירועי גרירה (Touch + Mouse)
    cvs.addEventListener('mousedown', startDrag);
    cvs.addEventListener('touchstart', (e) => startDrag(e.touches[0]));
    window.addEventListener('mousemove', doDrag);
    window.addEventListener('touchmove', (e) => doDrag(e.touches[0]));
    window.addEventListener('mouseup', endDrag);
    window.addEventListener('touchend', endDrag);

    // חיבור כפתורים וסליידרים
    setupControls();

    // בניית התפריט מקובץ השאלות
    const menu = document.getElementById('questionsMenu');
    if (typeof QUESTIONS !== 'undefined') {
        QUESTIONS.forEach((q, idx) => {
            let opt = document.createElement('option');
            opt.value = idx;
            opt.text = `${idx+1}. ${q.title}`;
            menu.appendChild(opt);
        });
        menu.onchange = (e) => loadQuestion(parseInt(e.target.value));
        
        // התחלה
        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();
        loadQuestion(0);
        requestAnimationFrame(loop);
    } else {
        alert("שגיאה: קובץ questions.js לא נטען!");
    }
};

function setupControls() {
    ['inpA','inpB','inpC','inpD','inpX','inpNormalSlope'].forEach(id => {
        document.getElementById(id).addEventListener('input', updateSystem);
    });

    document.getElementById('btnNormalToggle').onclick = toggleNormal;
}

/* === לוגיקת גרירה === */
function startDrag(e) {
    const rect = cvs.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    
    // חישוב מיקום נוכחי
    let curY = a*xVal**3 + b*xVal**2 + c*xVal + d;
    let px = originX + xVal * scale;
    let py = originY - curY * scale;

    let dist = Math.sqrt((mx - px)**2 + (my - py)**2);
    
    if (dist < 30 && !document.getElementById('inpX').disabled) {
        isDragging = true;
        dragTarget = 'point';
    } else if (!document.getElementById('inpD').disabled) {
        isDragging = true;
        dragTarget = 'bg';
    }
    lastMouseY = my;
}

function doDrag(e) {
    if (!isDragging) return;
    
    const rect = cvs.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    
    if (dragTarget === 'point') {
        let newX = (mx - originX) / scale;
        newX = Math.max(-5, Math.min(5, newX));
        document.getElementById('inpX').value = newX;
        xVal = newX;
    } else if (dragTarget === 'bg') {
        let deltaY = (my - lastMouseY) / scale; 
        let newD = d - deltaY; // גרירה למטה מורידה את הערך
        newD = Math.max(-5, Math.min(5, newD));
        document.getElementById('inpD').value = newD;
        d = newD;
    }
    
    lastMouseY = my;
    updateSystem();
}

function endDrag() { isDragging = false; dragTarget = null; }

function resizeCanvas() {
    const container = document.getElementById('graph-container');
    width = cvs.width = container.offsetWidth;
    height = cvs.height = container.offsetHeight;
    originX = width / 2;
    originY = height / 2;
    scale = (width < 500) ? 30 : 40; 
    updateSystem();
}

function loadQuestion(idx) {
    currQIndex = idx;
    isWin = false;
    document.getElementById('questionsMenu').value = idx;
    document.getElementById('success-area').style.display = 'none';

    const q = QUESTIONS[idx];
    document.getElementById('qTitle').innerText = q.title;
    document.getElementById('qDesc').innerText = q.desc;

    [a, b, c, d] = q.params;
    xVal = 0;

    // עדכון סליידרים
    document.getElementById('inpA').value = a;
    document.getElementById('inpB').value = b;
    document.getElementById('inpC').value = c;
    document.getElementById('inpD').value = d;
    document.getElementById('inpX').value = xVal;

    // איפוס נעילות
    const allInputs = ['inpA', 'inpB', 'inpC', 'inpD', 'inpX'];
    allInputs.forEach(id => {
        const el = document.getElementById(id);
        el.disabled = false;
        el.parentElement.style.opacity = "1";
    });

    if (q.locked) {
        q.locked.forEach(id => {
            const el = document.getElementById(id);
            el.disabled = true;
            el.parentElement.style.opacity = "0.5";
        });
    }
    updateSystem();
}

function toggleNormal() {
    showNormal = !showNormal;
    const btn = document.getElementById('btnNormalToggle');
    const panel = document.getElementById('normalControls');
    if (showNormal) {
        btn.classList.add('active');
        btn.innerText = "📐 מעבדת האנך (פתוח)";
        panel.style.display = 'block';
    } else {
        btn.classList.remove('active');
        btn.innerText = "📐 מעבדת האנך (לחץ לפתיחה)";
        panel.style.display = 'none';
    }
    updateSystem();
}

function updateSystem() {
    // קריאת ערכים
    a = parseFloat(document.getElementById('inpA').value);
    b = parseFloat(document.getElementById('inpB').value);
    c = parseFloat(document.getElementById('inpC').value);
    d = parseFloat(document.getElementById('inpD').value);
    xVal = parseFloat(document.getElementById('inpX').value);

    // עדכון תצוגה טקסטואלית
    document.getElementById('valA').innerText = a.toFixed(1);
    document.getElementById('valB').innerText = b.toFixed(1);
    document.getElementById('valC').innerText = c.toFixed(1);
    document.getElementById('valD').innerText = d.toFixed(1);
    document.getElementById('valX').innerText = xVal.toFixed(1);
    
    // בדיקת ניצחון
    const q = QUESTIONS[currQIndex];
    let m = 3*a*xVal**2 + 2*b*xVal + c;
    let nm = parseFloat(document.getElementById('inpNormalSlope').value);

    // קריאה לפונקציית הבדיקה מקובץ השאלות
    const currentState = { m, nm, a, b, c, d, showNormal };
    let win = checkWinCondition(q, currentState);

    const successArea = document.getElementById('success-area');
    if (win && !isWin) {
        isWin = true;
        successArea.style.display = 'block'; 
    } else if (!win) {
        isWin = false;
        successArea.style.display = 'none';
    }
}

function nextQuestion() {
    if (currQIndex < QUESTIONS.length - 1) loadQuestion(currQIndex + 1);
    else alert("סיימת את כל המשימות בהצלחה!");
}

/* === ציור === */
function loop() {
    draw();
    requestAnimationFrame(loop);
}

function draw() {
    ctx.clearRect(0, 0, width, height);
    drawGrid();

    // ציור מטרות
    const q = QUESTIONS[currQIndex];
    if (q.targets) {
        q.targets.forEach(t => {
            let tx = originX + t.x * scale;
            let ty = originY - t.y * scale;
            
            ctx.fillStyle = '#ef4444'; 
            ctx.beginPath(); ctx.arc(tx, ty, 6, 0, Math.PI*2); ctx.fill();
            
            ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
            ctx.fillRect(tx + 8, ty - 18, 50, 16);
            ctx.fillStyle = '#dc2626';
            ctx.font = 'bold 12px monospace';
            ctx.textAlign = 'left';
            ctx.fillText(`(${t.x},${t.y})`, tx + 10, ty - 6);

            let yAtT = a*t.x**3 + b*t.x**2 + c*t.x + d;
            if (Math.abs(yAtT - t.y) < 0.25) {
                ctx.strokeStyle = '#22c55e'; ctx.lineWidth = 3;
                ctx.beginPath(); ctx.arc(tx, ty, 10, 0, Math.PI*2); ctx.stroke();
            }
        });
    }

    // ציור פונקציה (קו עבה)
    ctx.lineWidth = 5;  
    ctx.strokeStyle = "#2563eb";
    ctx.beginPath();
    let started = false;
    for (let px = 0; px < width; px+=2) {
        let mx = (px - originX) / scale;
        let my = a*mx**3 + b*mx**2 + c*mx + d;
        let py = originY - my * scale;
        
        if (py > -height && py < height*2) {
            if (!started) { ctx.moveTo(px, py); started = true; }
            else { ctx.lineTo(px, py); }
        } else { started = false; }
    }
    ctx.stroke();

    // נתונים
    let curY = a*xVal**3 + b*xVal**2 + c*xVal + d;
    let px = originX + xVal * scale;
    let py = originY - curY * scale;
    let slope = 3*a*xVal**2 + 2*b*xVal + c;

    // משיק
    drawLinearFunc(px, py, slope, "#f97316", false);
    
    // אנך
    if (showNormal) {
        let normalSlope = parseFloat(document.getElementById('inpNormalSlope').value);
        document.getElementById('valNormal').innerText = normalSlope.toFixed(2);
        
        let prod = (slope * normalSlope).toFixed(2);
        const prodEl = document.getElementById('slopeProd');
        prodEl.innerText = `${slope.toFixed(2)} × ${normalSlope.toFixed(2)} = ${prod}`;
        
        let isPerp = Math.abs(slope * normalSlope + 1) < 0.15;
        prodEl.style.color = isPerp ? "#16a34a" : "#ef4444";

        drawLinearFunc(px, py, normalSlope, "#9333ea", true);
        if (isPerp) drawRightAngleSquare(px, py, Math.atan(slope));
    }

    // נקודה ראשית
    ctx.fillStyle = "#2563eb"; 
    ctx.beginPath(); ctx.arc(px, py, 7, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = "white"; 
    ctx.beginPath(); ctx.arc(px, py, 4, 0, Math.PI*2); ctx.fill();

    // השילוש הקדוש
    let infoText = `(${xVal.toFixed(1)}, ${curY.toFixed(1)}) m=${slope.toFixed(2)}`;
    ctx.font = "bold 13px sans-serif";
    let tw = ctx.measureText(infoText).width;
    
    ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
    ctx.strokeStyle = "#cbd5e1"; ctx.lineWidth = 1;
    let bx = px + 12, by = py - 28;
    if (bx + tw > width) bx = px - tw - 12;
    if (by < 10) by = py + 20;

    ctx.fillRect(bx, by, tw + 8, 20);
    ctx.strokeRect(bx, by, tw + 8, 20);
    ctx.fillStyle = "#0f172a"; ctx.textAlign = 'left';
    ctx.fillText(infoText, bx + 4, by + 14);
}

function drawLinearFunc(cx, cy, m, color, dashed) {
    ctx.save();
    ctx.strokeStyle = color; ctx.lineWidth = 2;
    if (dashed) ctx.setLineDash([5, 5]);

    let len = 1000;
    let angle = Math.atan(-m); 
    ctx.beginPath();
    ctx.moveTo(cx - Math.cos(angle)*len, cy - Math.sin(angle)*len);
    ctx.lineTo(cx + Math.cos(angle)*len, cy + Math.sin(angle)*len);
    ctx.stroke();
    ctx.restore();

    // חיתוך צירים
    let mathY0 = (originY - cy) / scale;
    let mathX0 = xVal;
    let yIntercept = m * (0 - mathX0) + mathY0;
    let pyInt = originY - yIntercept * scale;
    if (pyInt > 0 && pyInt < height) drawInterceptDot(originX, pyInt, color);

    if (Math.abs(m) > 0.01) {
        let xIntercept = mathX0 - (mathY0 / m);
        let pxXInt = originX + xIntercept * scale;
        if (pxXInt > 0 && pxXInt < width) drawInterceptDot(pxXInt, originY, color);
    }
}

function drawInterceptDot(x, y, borderColor) {
    ctx.fillStyle = "#64748b"; 
    ctx.beginPath(); ctx.arc(x, y, 4, 0, Math.PI*2); ctx.fill();
    ctx.strokeStyle = borderColor; ctx.lineWidth = 1; ctx.stroke();
}

function drawRightAngleSquare(x, y, angle) {
    const s = 14;
    ctx.save();
    ctx.translate(x, y); ctx.rotate(-angle);
    ctx.beginPath(); ctx.strokeStyle = "#22c55e"; ctx.lineWidth = 2;
    ctx.fillStyle = "rgba(34, 197, 94, 0.2)";
    ctx.moveTo(s, 0); ctx.lineTo(s, -s); ctx.lineTo(0, -s);
    ctx.stroke(); ctx.fill();
    ctx.restore();
}

function drawGrid() {
    ctx.strokeStyle = '#e2e8f0'; ctx.lineWidth = 1;
    ctx.beginPath();
    for(let x=originX%scale; x<width; x+=scale) { ctx.moveTo(x,0); ctx.lineTo(x,height); }
    for(let y=originY%scale; y<height; y+=scale) { ctx.moveTo(0,y); ctx.lineTo(width,y); }
    ctx.stroke();
    
    ctx.strokeStyle = '#334155'; ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, originY); ctx.lineTo(width, originY);
    ctx.moveTo(originX, 0); ctx.lineTo(originX, height);
    ctx.stroke();

    ctx.fillStyle = '#334155'; ctx.font = "14px Arial";
    ctx.fillText("x", width - 15, originY - 5);
    ctx.fillText("y", originX + 5, 15);
}
