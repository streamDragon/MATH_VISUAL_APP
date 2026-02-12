/* --- מאגר השאלות החכמות --- */
const questions = [
    // שלב 1: חימום
    { cat: "חימום", t: "פסגת ההר", d: "מצאו את נקודת המקסימום (הפסגה).", p: [-1, 0, 0, 4], goal: 'm0' },
    
    // שלב 2: שאלות משיק לנקודה חיצונית
    { cat: "משיקים", t: "המגדלור", d: "כוונו את המשיק (הקרן) לנקודה האדומה למעלה (0,5).", 
      p: [-0.5, 0, 0, 3], goal: 'tan_pass', target: [0, 5] },

    { cat: "משיקים", t: "קליעה למטרה", d: "מצאו משיק שעובר דרך הנקודה (4,0) שעל ציר ה-X.", 
      p: [-0.25, 0, 0, 4], goal: 'tan_pass', target: [4, 0] },

    // שלב 3: נורמלים (אנכים)
    { cat: "אנכים", t: "האנך הקצר", d: "כוונו את האנך הסגול (נורמל) שיעבור דרך הנקודה (0,2).", 
      p: [0.5, 0, 0, 0], goal: 'norm_pass', target: [0, 2] },

    { cat: "אנכים", t: "נורמל לראשית", d: "מצאו נקודה בה האנך עובר בראשית הצירים (0,0).", 
      p: [0, 0.2, -1, 2], goal: 'norm_pass', target: [0, 0] },

    // שלב 4: שיפועים מיוחדים
    { cat: "מתקדם", t: "התנגשות ב-90°", d: "מצאו נקודה שבה המשיק מאונך לישר y=x (כלומר, m=-1).", 
      p: [0, 0.25, 0, -2], goal: 'slope_val', targetVal: -1 }
];

let cvs, ctx, W, H, mainArea;
let scale = 45, ox, oy;
let px = 0, cf = [0,1,0,0], goal = '';
let isDrag = false;

window.onload = () => {
    cvs = document.getElementById('cvs');
    ctx = cvs.getContext('2d');
    mainArea = document.getElementById('mainArea');
    
    // ניהול אירועים
    window.addEventListener('resize', resize);
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
    W = cvs.width = mainArea.clientWidth;
    H = cvs.height = mainArea.clientHeight;
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
    if(px < -10) px = -10; if(px > 10) px = 10;
    
    document.getElementById('mainX').value = px;
    update();
}

function update() {
    let y = f(px), m = df(px);
    checkWin(y, m);
    draw();
}

function checkWin(y, m) {
    if(!goal) return;
    let win = false;
    let q = questions[document.getElementById('qSelect').value];

    // בדיקות ניצחון
    if(goal === 'm0') win = Math.abs(m) < 0.2;
    else if(goal === 'slope_val') win = Math.abs(m - q.targetVal) < 0.2;
    
    // משיק עובר בנקודה
    else if(goal === 'tan_pass') {
        let t = q.target; 
        let predictedY = m * (t[0] - px) + y;
        win = Math.abs(predictedY - t[1]) < 0.5;
    }
    
    // נורמל עובר בנקודה
    else if(goal === 'norm_pass') {
        let t = q.target;
        // נוסחה למניעת חלוקה ב-0: (dy)*m + dx = 0
        let val = (t[1] - y) * m + (t[0] - px);
        win = Math.abs(val) < 0.6;
    }

    let badge = document.getElementById('successBanner');
    if(win) badge.classList.add('show');
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
    ctx.moveTo(0,oy); ctx.lineTo(W,oy); ctx.moveTo(ox,0); ctx.lineTo(ox,H); ctx.stroke();
    
    // --- ציור נקודת מטרה (Target) ---
    let q = questions[document.getElementById('qSelect').value];
    if(q && q.target) {
        let tx = ox + q.target[0] * scale;
        let ty = oy - q.target[1] * scale;
        
        // הילה
        ctx.beginPath(); ctx.fillStyle = "rgba(239, 68, 68, 0.2)";
        ctx.arc(tx, ty, 15, 0, Math.PI*2); ctx.fill();
        // נקודה
        ctx.beginPath(); ctx.fillStyle = "#ef4444";
        ctx.arc(tx, ty, 5, 0, Math.PI*2); ctx.fill();
        // טקסט
        ctx.fillStyle = "#ef4444"; ctx.font = "bold 12px sans-serif";
        ctx.fillText("מטרה", tx + 10, ty);
    }

    // פונקציה
    ctx.strokeStyle = "#2563eb"; ctx.lineWidth = 4; ctx.beginPath();
    let sx = -ox/scale, ex = (W-ox)/scale;
    for(let x=sx; x<=ex; x+=0.05) {
        let cx=ox+x*scale, cy=oy-f(x)*scale;
        if(x===sx) ctx.moveTo(cx,cy); else ctx.lineTo(cx,cy);
    }
    ctx.stroke();
    
    // משיק (כתום)
    let cx=ox+px*scale, cy=oy-f(px)*scale, m=df(px);
    ctx.strokeStyle="#f97316"; ctx.lineWidth=2; ctx.beginPath();
    ctx.moveTo(cx-1000, cy+1000*m); ctx.lineTo(cx+1000, cy-1000*m);
    ctx.stroke();

    // נורמל (סגול) - מצויר רק בשאלות רלוונטיות או אם המשיק אופקי
    if(q && q.goal === 'norm_pass') { 
        ctx.strokeStyle="#a855f7"; ctx.setLineDash([5,5]); ctx.beginPath();
        let nm = -1/m;
        // אם m=0 הנורמל הוא אנכי לחלוטין
        if(Math.abs(m)<0.01) { ctx.moveTo(cx, cy-1000); ctx.lineTo(cx, cy+1000); }
        else { ctx.moveTo(cx-1000, cy+1000*nm); ctx.lineTo(cx+1000, cy-1000*nm); }
        ctx.stroke(); ctx.setLineDash([]);
    }
    
    // נקודה כחולה
    ctx.fillStyle="#2563eb"; ctx.beginPath(); ctx.arc(cx,cy,9,0,6.28); ctx.fill();
    ctx.strokeStyle="white"; ctx.lineWidth=2; ctx.stroke();
}

/* ניהול ממשק */
function changeZoom(v) { scale *= v; scale=Math.max(15, Math.min(120, scale)); draw(); }
function resetView() { scale=45; ox=W/2; oy=H/2+H*0.1; draw(); }

function initMenu() {
    let s = document.getElementById('qSelect');
    s.innerHTML = "";
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
    document.getElementById('qText').innerText = q.d;
    ['mA','mB','mC','mD'].forEach((id,k)=>document.getElementById(id).value=cf[k]);
    
    px = -3;
    document.getElementById('mainX').value=px;
    document.getElementById('successBanner').classList.remove('show');
    
    let txt = `y = ${cf[0]?cf[0]+"x³ ":""}${cf[1]?cf[1]+"x² ":""}${cf[2]?cf[2]+"x ":""}${cf[3]||""}`;
    txt = txt.replace(/\+ -/g, "- ").replace(/ 1x/g," x").replace(/ 0x./g,"");
    if(txt === "y = ") txt = "y = 0";
    document.getElementById('eqn').innerText = txt;
    
    update();
}
function manual() {
    cf = ['mA','mB','mC','mD'].map(id=>parseFloat(document.getElementById(id).value)||0);
    goal=''; 
    document.getElementById('qText').innerText="מצב חופשי";
    update();
}
