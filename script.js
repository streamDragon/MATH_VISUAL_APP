/* נתונים */
const questions = [
    { cat: "התחלה", t: "מינימום", d: "מצאו את הנקודה הכי נמוכה בעמק.", p: [0, 1, -4, 0], goal: 'm0' },
    { cat: "התחלה", t: "חיתוך X", d: "איפה הגרף חותך את ציר ה-X?", p: [0, 0.5, -2, -2], goal: 'y0' },
    { cat: "שיפוע", t: "שיפוע 1", d: "מצאו שיפוע של 45 מעלות (m=1).", p: [0, 0.2, 0, 0], goal: 'm1' },
    { cat: "שיפוע", t: "שיפוע 0", d: "מצאו נקודה שבה המשיק אופקי.", p: [0.3, 0, -3, 0], goal: 'm0' },
    { cat: "מתקדם", t: "נורמל לראשית", d: "כוון שהאנך (סגול) יעבור ב-0,0.", p: [0, 1, 0, 1], goal: 'normal0' }
];

let cvs, ctx, W, H, wrapper;
let scale = 40, ox, oy;
let px = 0, cf = [0,1,0,0], goal = '';
let isDrag = false;

window.onload = () => {
    cvs = document.getElementById('cvs');
    ctx = cvs.getContext('2d');
    wrapper = document.getElementById('cWrap');
    
    // ניהול גודל
    window.addEventListener('resize', resize);
    
    // אירועי מגע
    cvs.addEventListener('touchstart', e => start(e.touches[0]), {passive: false});
    cvs.addEventListener('touchmove', e => move(e.touches[0]), {passive: false});
    cvs.addEventListener('touchend', end);
    cvs.addEventListener('mousedown', start);
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', end);

    initMenu();
    resize();
    loadQ(0);
};

function resize() {
    // לוקח גודל מדויק מהאלמנט העוטף
    W = cvs.width = wrapper.clientWidth;
    H = cvs.height = wrapper.clientHeight;
    ox = W/2; 
    oy = H/2 + H*0.1;
    draw();
}

/* לוגיקה מתמטית */
function f(x) { return cf[0]*x**3 + cf[1]*x**2 + cf[2]*x + cf[3]; }
function df(x) { return 3*cf[0]*x**2 + 2*cf[1]*x + cf[2]; }

function updateFromSlider() {
    if(!isDrag) {
        px = parseFloat(document.getElementById('mainX').value);
        update();
    }
}

function start(e) { isDrag = true; move(e); }
function end() { isDrag = false; }
function move(e) {
    if(!isDrag) return;
    if(e.preventDefault) e.preventDefault();
    let rect = cvs.getBoundingClientRect();
    px = (e.clientX - rect.left - ox) / scale;
    
    // עדכון סליידר
    let sld = document.getElementById('mainX');
    if(px >= sld.min && px <= sld.max) sld.value = px;
    
    update();
}

function update() {
    let y = f(px), m = df(px);
    document.getElementById('hX').innerText = px.toFixed(1);
    document.getElementById('hY').innerText = y.toFixed(1);
    document.getElementById('hM').innerText = m.toFixed(1);
    
    checkWin(y, m);
    draw();
}

function checkWin(y, m) {
    if(!goal) return;
    let d = 99;
    if(goal==='m0') d=Math.abs(m);
    else if(goal==='m1') d=Math.abs(m-1);
    else if(goal==='y0') d=Math.abs(y);
    else if(goal==='normal0') d=Math.abs(px + m*y);
    
    let badge = document.getElementById('successBanner');
    if(d < 0.1) badge.classList.add('show');
    else badge.classList.remove('show');
}

/* ציור */
function draw() {
    ctx.clearRect(0,0,W,H);
    
    // רשת
    ctx.strokeStyle = "#e2e8f0"; ctx.lineWidth = 1; ctx.beginPath();
    for(let x=ox%scale; x<W; x+=scale) { ctx.moveTo(x,0); ctx.lineTo(x,H); }
    for(let y=oy%scale; y<H; y+=scale) { ctx.moveTo(0,y); ctx.lineTo(W,y); }
    ctx.stroke();
    
    // צירים
    ctx.strokeStyle = "#94a3b8"; ctx.lineWidth = 2; ctx.beginPath();
    ctx.moveTo(0,oy); ctx.lineTo(W,oy);
    ctx.moveTo(ox,0); ctx.lineTo(ox,H);
    ctx.stroke();
    
    // פונקציה
    ctx.strokeStyle = "#2563eb"; ctx.lineWidth = 3; ctx.beginPath();
    let sx = -ox/scale, ex = (W-ox)/scale;
    for(let x=sx; x<=ex; x+=0.05) {
        let cx=ox+x*scale, cy=oy-f(x)*scale;
        if(x===sx) ctx.moveTo(cx,cy); else ctx.lineTo(cx,cy);
    }
    ctx.stroke();
    
    // משיק
    let cx=ox+px*scale, cy=oy-f(px)*scale, m=df(px);
    ctx.strokeStyle="#f97316"; ctx.lineWidth=2; ctx.beginPath();
    ctx.moveTo(cx-1000, cy+1000*m); ctx.lineTo(cx+1000, cy-1000*m);
    ctx.stroke();

    if(goal==='normal0') { // אנך
        ctx.strokeStyle="#a855f7"; ctx.setLineDash([5,5]); ctx.beginPath();
        let nm = -1/m;
        ctx.moveTo(cx-1000, cy+1000*nm); ctx.lineTo(cx+1000, cy-1000*nm);
        ctx.stroke(); ctx.setLineDash([]);
    }
    
    // נקודה
    ctx.fillStyle="#2563eb"; ctx.beginPath(); ctx.arc(cx,cy,8,0,6.28); ctx.fill();
    ctx.fillStyle="white"; ctx.beginPath(); ctx.arc(cx,cy,3,0,6.28); ctx.fill();
}

/* ניהול */
function changeZoom(v) { scale *= v; scale=Math.max(10, Math.min(150, scale)); draw(); }
function resetView() { scale=40; ox=W/2; oy=H/2+H*0.1; draw(); }

function initMenu() {
    let s = document.getElementById('qSelect');
    let cats = {};
    questions.forEach((q,i) => {
        if(!cats[q.cat]) cats[q.cat]=[];
        cats[q.cat].push({i, t:q.t});
    });
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
    document.getElementById('qText').innerText = q.t + " - " + q.d;
    ['mA','mB','mC','mD'].forEach((id,k)=>document.getElementById(id).value=cf[k]);
    px = (goal==='x0')?-3:2;
    document.getElementById('mainX').value=px;
    
    // רענון משוואה
    let txt = `y = ${cf[0]?cf[0]+"x³ ":""}${cf[1]?cf[1]+"x² ":""}${cf[2]?cf[2]+"x ":""}${cf[3]||""}`;
    document.getElementById('eqn').innerText = txt.replace(/ 0/g,"").replace(/ 1x/g," x");
    
    update();
}
function manual() {
    cf = ['mA','mB','mC','mD'].map(id=>parseFloat(document.getElementById(id).value)||0);
    goal=''; document.getElementById('qText').innerText="חופשי";
    update();
}
