/* script.js - תיקון תצוגת שאלות, תוויות ושלשה קדושה */

let canvas, ctx, width, height;
let a = 0, b = 1, c = 0, d = 0; 
let currentX = 0;
let scale = 40;
let currentQIndex = 0;
let isSolved = false;

window.onload = function() {
    canvas = document.getElementById('graphCanvas');
    ctx = canvas.getContext('2d');
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

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
    ['A', 'B', 'C', 'D'].forEach(p => {
        document.getElementById('param' + p).addEventListener('input', (e) => {
            window[p.toLowerCase()] = parseFloat(e.target.value);
            document.getElementById('val' + p).innerText = window[p.toLowerCase()];
            updateGraph();
        });
    });

    document.getElementById('paramX').addEventListener('input', (e) => {
        currentX = parseFloat(e.target.value);
        document.getElementById('valX').innerText = currentX;
        updateGraph();
    });
}

function setupNavigation() {
    const select = document.getElementById('selectQuestion');
    bagrutData.forEach((q, i) => {
        let opt = document.createElement('option');
        opt.value = i;
        opt.text = q.title;
        select.appendChild(opt);
    });

    document.getElementById('btnPrev').onclick = () => loadQuestion(currentQIndex - 1);
    document.getElementById('btnNext').onclick = () => loadQuestion(currentQIndex + 1);
    select.onchange = (e) => loadQuestion(parseInt(e.target.value));
}

function loadQuestion(idx) {
    if (idx < 0 || idx >= bagrutData.length) return;
    currentQIndex = idx;
    const q = bagrutData[idx];
    isSolved = false;

    // עדכון טקסטים
    document.getElementById('questionTitle').innerText = q.title;
    document.getElementById('questionText').innerHTML = q.instruction;
    document.getElementById('successMessage').style.display = 'none';
    document.getElementById('selectQuestion').value = idx;

    // איפוס פרמטרים
    ['a', 'b', 'c', 'd'].forEach(p => {
        window[p] = q.setup[p];
        document.getElementById('param' + p.toUpperCase()).value = window[p];
        document.getElementById('val' + p.toUpperCase()).innerText = window[p];
    });

    currentX = q.startX || 0;
    document.getElementById('paramX').value = currentX;
    document.getElementById('valX').innerText = currentX;

    updateGraph();
}

function f(x) { return a*x*x*x + b*x*x + c*x + d; }
function df(x) { return 3*a*x*x + 2*b*x + c; }

function updateGraph() {
    if (!ctx) return;
    let yVal = f(currentX);
    let mVal = df(currentX);

    // עדכון השלשה הקדושה
    document.getElementById('dispX').innerText = currentX.toFixed(1);
    document.getElementById('dispY').innerText = yVal.toFixed(2);
    document.getElementById('dispM').innerText = mVal.toFixed(2);

    // עדכון משוואת משיק
    document.getElementById('tangentEqn').innerText = 
        `y - ${yVal.toFixed(1)} = ${mVal.toFixed(2)}(x - ${currentX.toFixed(1)})`;

    ctx.clearRect(0, 0, width, height);
    drawGrid();
    drawFunction();
    
    // ציור נקודת המשתמש (כתומה)
    drawPoint(currentX, yVal, "#f59e0b", `(${currentX.toFixed(1)}, ${yVal.toFixed(1)})`);
    
    // ציור נקודת יעד (אדומה)
    const q = bagrutData[currentQIndex];
    if (q.targetPoint) {
        drawPoint(q.targetPoint.x, q.targetPoint.y, "#ef4444", `יעד: (${q.targetPoint.x}, ${q.targetPoint.y})`);
    }

    checkWin(yVal, mVal);
}

function drawGrid() {
    const cx = width / 2, cy = height / 2;
    ctx.strokeStyle = "#e2e8f0";
    ctx.beginPath();
    for(let i=-10; i<=10; i++) {
        ctx.moveTo(cx + i*scale, 0); ctx.lineTo(cx + i*scale, height);
        ctx.moveTo(0, cy + i*scale); ctx.lineTo(width, cy + i*scale);
    }
    ctx.stroke();
    ctx.strokeStyle = "#475569"; ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx, 0); ctx.lineTo(cx, height);
    ctx.moveTo(0, cy); ctx.lineTo(width, cy);
    ctx.stroke();
}

function drawFunction() {
    ctx.beginPath(); ctx.strokeStyle = "#2563eb"; ctx.lineWidth = 3;
    const cx = width / 2, cy = height / 2;
    for (let px = 0; px <= width; px += 2) {
        let xMath = (px - cx) / scale;
        let py = cy - f(xMath) * scale;
        if (px === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.stroke();
}

function drawPoint(x, y, color, label) {
    const px = width/2 + x*scale;
    const py = height/2 - y*scale;
    ctx.fillStyle = color;
    ctx.beginPath(); ctx.arc(px, py, 6, 0, Math.PI*2); ctx.fill();
    
    // כיתוב ליד הנקודה
    ctx.font = "bold 12px Assistant";
    ctx.shadowBlur = 4; ctx.shadowColor = "white";
    ctx.fillText(label, px + 10, py - 10);
    ctx.shadowBlur = 0;
}

function checkWin(y, m) {
    const q = bagrutData[currentQIndex];
    let isCorrect = false;
    if (q.goal === 'hit_target' && Math.abs(y - q.targetPoint.y) < 0.1) isCorrect = true;
    if (q.goal === 'm0' && Math.abs(m) < 0.1) isCorrect = true;

    if (isCorrect && !isSolved) {
        isSolved = true;
        document.getElementById('successMessage').style.display = 'block';
        document.getElementById('successMessage').innerText = "✅ הצלחת במשימה!";
    }
}
