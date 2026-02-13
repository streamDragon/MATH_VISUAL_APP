// ==========================================
//  המנוע (Engine) - לוגיקה וציור
// ==========================================

let cvs, ctx, width, height, scale = 40, originX, originY;
let a=0, b=0, c=0, d=0, xVal=0;
let showNormal = false;
let currQIndex = 0;
let isWin = false;
let isDragging = false, dragTarget = null, lastMouseY = 0;

// פונקציית אתחול - רצה כשהדף נטען
window.onload = function() {
    cvs = document.getElementById('cvs');
    ctx = cvs.getContext('2d');
    
    // מאזינים לאירועי עכבר ומגע
    cvs.addEventListener('mousedown', startDrag);
    cvs.addEventListener('mousemove', doDrag);
    cvs.addEventListener('mouseup', endDrag);
    cvs.addEventListener('touchstart', (e) => startDrag(e.touches[0]));
    cvs.addEventListener('touchmove', (e) => { e.preventDefault(); doDrag(e.touches[0]); }, {passive: false});
    cvs.addEventListener('touchend', endDrag);

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    // חיבור כפתורים וסליידרים
    document.getElementById('inpX').oninput = (e) => updateParam('x', e.target.value);
    document.getElementById('inpA').oninput = (e) => updateParam('a', e.target.value);
    document.getElementById('inpB').oninput = (e) => updateParam('b', e.target.value);
    document.getElementById('inpC').oninput = (e) => updateParam('c', e.target.value);
    document.getElementById('inpD').oninput = (e) => updateParam('d', e.target.value);
    document.getElementById('inpNormalSlope').oninput = (e) => { draw(); checkWin(); };
    
    document.getElementById('questionsMenu').onchange = (e) => loadQuestion(e.target.value);
    document.getElementById('btnNormalToggle').onclick = toggleNormalLab;

    initQuestionsMenu();
    loadQuestion(0);
    loop();
};

function resizeCanvas() {
    width = cvs.width = document.getElementById('graph-container').offsetWidth;
    height = cvs.height = document.getElementById('graph-container').offsetHeight;
    originX = width / 2;
    originY = height / 2;
    draw();
}

function updateParam(param, val) {
    val = parseFloat(val);
    if (param === 'x') xVal = val;
    if (param === 'a') a = val;
    if (param === 'b') b = val;
    if (param === 'c') c = val;
    if (param === 'd') d = val;
    
    // עדכון התצוגה המספרית
    if(param === 'x') document.getElementById('valX').innerText = val.toFixed(1);
    else document.getElementById('val' + param.toUpperCase()).innerText = val.toFixed(1);
    
    draw();
    checkWin();
}

function initQuestionsMenu() {
    const sel = document.getElementById('questionsMenu');
    sel.innerHTML = "";
    QUESTIONS.forEach((q, i) => {
        let opt = document.createElement('option');
        opt.value = i;
        opt.innerText = q.title;
        sel.appendChild(opt);
    });
}

function loadQuestion(index) {
    currQIndex = parseInt(index);
    let q = QUESTIONS[currQIndex];
    
    // איפוס סליידרים וערכים
    a = q.params[0]; document.getElementById('inpA').value = a; document.getElementById('valA').innerText = a;
    b = q.params[1]; document.getElementById('inpB').value = b; document.getElementById('valB').innerText = b;
    c = q.params[2]; document.getElementById('inpC').value = c; document.getElementById('valC').innerText = c;
    d = q.params[3]; document.getElementById('inpD').value = d; document.getElementById('valD').innerText = d;
    
    xVal = 0; 
    document.getElementById('inpX').value = 0;
    document.getElementById('valX').innerText = "0";

    // עדכון טקסטים
    document.getElementById('qTitle').innerText = q.title;
    document.getElementById('qDesc').innerText = q.desc;
    document.getElementById('success-area').style.display = 'none';
    isWin = false;

    // פתיחת/נעילת סליידרים
    ['inpA','inpB','inpC','inpD','inpX'].forEach(id => document.getElementById(id).disabled = false);
    if (q.locked) {
        q.locked.forEach(id => document.getElementById(id).disabled = true);
    }
    
    draw();
}

function nextQuestion() {
    if (currQIndex < QUESTIONS.length - 1) {
        document.getElementById('questionsMenu').value = currQIndex + 1;
        loadQuestion(currQIndex + 1);
    } else {
        alert("סיימת את כל המשימות! כל הכבוד!");
    }
}

function toggleNormalLab() {
    showNormal = !showNormal;
    const div = document.getElementById('normalControls');
    const btn = document.getElementById('btnNormalToggle');
    if (showNormal) {
        div.style.display = 'block';
        btn.classList.add('active');
        btn.innerText = "📐 סגור מעבדת אנך";
    } else {
        div.style.display = 'none';
        btn.classList.remove('active');
        btn.innerText = "📐 מעבדת האנך (לחץ לפתיחה)";
    }
    draw();
    checkWin();
}

// לוגיקת הציור
function draw() {
    // נקה מסך
    ctx.clearRect(0, 0, width, height);
    
    // רשת
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for(let i = 0; i <= width/2; i+=scale) { ctx.moveTo(originX+i,0); ctx.lineTo(originX+i,height); ctx.moveTo(originX-i,0); ctx.lineTo(originX-i,height); }
    for(let i = 0; i <= height/2; i+=scale) { ctx.moveTo(0,originY+i); ctx.lineTo(width,originY+i); ctx.moveTo(0,originY-i); ctx.lineTo(width,originY-i); }
    ctx.stroke();

    // צירים
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, originY); ctx.lineTo(width, originY);
    ctx.moveTo(originX, 0); ctx.lineTo(originX, height);
    ctx.stroke();

    // פונקציה ראשית (כחול)
    ctx.strokeStyle = '#2563eb';
    ctx.lineWidth = 3;
    ctx.beginPath();
    for (let px = 0; px < width; px+=2) {
        let x = (px - originX) / scale;
        let y = a*x*x*x + b*x*x + c*x + d;
        let py = originY - y * scale;
        if (px===0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.stroke();

    // חישוב נקודה ושיפוע
    let yVal = a*Math.pow(xVal,3) + b*Math.pow(xVal,2) + c*xVal + d;
    let slope = 3*a*Math.pow(xVal,2) + 2*b*xVal + c;
    
    let px = originX + xVal * scale;
    let py = originY - yVal * scale;

    // משיק (כתום)
    let tLength = 1000;
    ctx.strokeStyle = '#f97316';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(px - tLength, py + tLength * slope);
    ctx.lineTo(px + tLength, py - tLength * slope);
    ctx.stroke();

    // אנך (סגול) - אם פעיל
    let normalSlopeVal = parseFloat(document.getElementById('inpNormalSlope').value);
    if (showNormal) {
        ctx.strokeStyle = '#9333ea'; // סגול
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        // ציור קו לפי השיפוע שבסליידר m2
        ctx.moveTo(px - tLength, py + tLength * normalSlopeVal);
        ctx.lineTo(px + tLength, py - tLength * normalSlopeVal);
        ctx.stroke();
        ctx.setLineDash([]);
        
        // הצגת מכפלת השיפועים
        let prod = slope * normalSlopeVal;
        document.getElementById('slopeProd').innerText = prod.toFixed(2);
        document.getElementById('valNormal').innerText = normalSlopeVal.toFixed(2);
        
        // סימון זווית אם זה קרוב ל-90 מעלות (מכפלה -1)
        if (Math.abs(prod + 1) < 0.1) {
            ctx.fillStyle = 'rgba(147, 51, 234, 0.2)';
            ctx.fillRect(px, py, 20, -20 * Math.sign(slope)); // סימון סכמטי
        }
    }

    // נקודה נוכחית
    ctx.fillStyle = '#2563eb';
    ctx.beginPath(); ctx.arc(px, py, 6, 0, Math.PI*2); ctx.fill();

    // מטרות (אם יש)
    let q = QUESTIONS[currQIndex];
    if (q.targets) {
        q.targets.forEach(t => {
            let tx = originX + t.x * scale;
            let ty = originY - t.y * scale;
            ctx.fillStyle = '#ef4444'; // אדום
            ctx.beginPath(); ctx.arc(tx, ty, 5, 0, Math.PI*2); ctx.fill();
        });
    }
}

// בדיקת ניצחון
function checkWin() {
    if (isWin) return;
    
    let q = QUESTIONS[currQIndex];
    let win = false;
    
    // נתונים נוכחיים
    let slope = 3*a*Math.pow(xVal,2) + 2*b*xVal + c;
    let m2 = parseFloat(document.getElementById('inpNormalSlope').value);
    let yVal = a*Math.pow(xVal,3) + b*Math.pow(xVal,2) + c*xVal + d;

    // לוגיקה לפי סוג משימה
    if (q.goal === 'slope_zero') {
        if (Math.abs(slope) < 0.1) win = true;
    }
    else if (q.goal === 'slope_match') {
        if (Math.abs(slope - q.targetSlope) < 0.15) win = true;
    }
    else if (q.goal === 'normal_match') {
        if (showNormal && Math.abs(slope * m2 + 1) < 0.15) win = true;
    }
    else if (q.goal === 'hit_target') {
        let allHit = true;
        q.targets.forEach(t => {
            let yAtTarget = a * Math.pow(t.x, 3) + b * Math.pow(t.x, 2) + c * t.x + d;
            if (Math.abs(yAtTarget - t.y) > 0.3) allHit = false;
        });
        if (allHit) win = true;
    }

    if (win) {
        isWin = true;
        document.getElementById('success-area').style.display = 'block';
        confettiEffect();
    }
}

function loop() {
    requestAnimationFrame(loop);
}

// גרירה
function startDrag(e) {
    let mx = e.clientX || e.pageX;
    let my = e.clientY || e.pageY;
    let rect = cvs.getBoundingClientRect();
    mx -= rect.left; my -= rect.top;

    let px = originX + xVal * scale;
    let py = originY - (a*Math.pow(xVal,3) + b*Math.pow(xVal,2) + c*xVal + d) * scale;

    if (Math.hypot(mx-px, my-py) < 20) {
        isDragging = true;
        dragTarget = 'point';
    } else {
        isDragging = true;
        dragTarget = 'bg';
        lastMouseY = my;
    }
}

function doDrag(e) {
    if (!isDragging) return;
    let mx = e.clientX || e.pageX;
    let my = e.clientY || e.pageY;
    let rect = cvs.getBoundingClientRect();
    mx -= rect.left; my -= rect.top;

    if (dragTarget === 'point') {
        // אם סליידר X נעול, לא נותנים לגרור את הנקודה
        if (document.getElementById('inpX').disabled) return;
        
        let newX = (mx - originX) / scale;
        // מגבלות המסך
        newX = Math.max(-10, Math.min(10, newX));
        updateParam('x', newX);
        document.getElementById('inpX').value = newX;
    } 
    else if (dragTarget === 'bg') {
        // גרירת רקע משנה את d (גובה)
        if (document.getElementById('inpD').disabled) return;

        let deltaY = (my - lastMouseY) / scale;
        let newD = d + deltaY; // הפוך כי Y יורד למטה
        newD = Math.max(-5, Math.min(5, newD)); // גבולות
        updateParam('d', newD);
        document.getElementById('inpD').value = newD;
        lastMouseY = my;
    }
}

function endDrag() {
    isDragging = false;
    dragTarget = null;
}

// אפקט קונפטי פשוט
function confettiEffect() {
    let colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff'];
    for(let i=0; i<30; i++) {
        let div = document.createElement('div');
        div.style.position = 'absolute';
        div.style.left = (50 + Math.random()*20) + '%';
        div.style.top = '20%';
        div.style.width = '10px'; div.style.height = '10px';
        div.style.backgroundColor = colors[Math.floor(Math.random()*colors.length)];
        div.style.transition = 'all 1s ease-out';
        document.body.appendChild(div);
        setTimeout(() => {
            div.style.top = (20 + Math.random()*50) + '%';
            div.style.left = (40 + Math.random()*40) + '%';
            div.style.opacity = 0;
        }, 10);
        setTimeout(() => div.remove(), 1000);
    }
}
