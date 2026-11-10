(function () {
  "use strict";
  const $ = id => document.getElementById(id);
  const MAX = 10;
  const COLORS = {f:"#75d8ff",g:"#ffbf84",h:"#aaf4be"};
  const format = n => Number.isInteger(n) ? String(n) : String(Number(n.toFixed(2)));
  const signed = n => n < 0 ? "−" + format(-n) : "+" + format(n);
  const statement = (a,b,op,c,d) => format(a) + "x" + signed(b) + " " + op + " " + (c===0?format(d):format(c)+"x"+signed(d));
  const templates = [
    {level:1, a:2,b:3,c:0,d:7,op:">"},
    {level:2, a:-2,b:5,c:0,d:11,op:">"},
    {level:3, a:3,b:-4,c:-1,d:8,op:"<"},
    {level:4, a:-3,b:7,c:2,d:-8,op:"≥"}
  ];
  let host, lessonId=null, difficulty=1, questionNumber=0, current=null, visualCount=0, timer=null, revealed=false, transformed=false, selectedValue=null;
  function makeQuestion() {
    const template=templates[difficulty-1], n=Math.floor(questionNumber/4);
    const offset=n===0?0:(n%5)-2;
    let {a,b,c,d,op}=template;
    b+=offset; d-=offset;
    const m=a-c, k=d-b, boundary=k/m, inclusive=op.includes("=")||op==="≥"||op==="≤";
    const greater=op.includes(">")||op==="≥";
    const less=op.includes("<")||op==="≤";
    const right=(greater&&m>0)||(less&&m<0);
    const correct=(right?"x"+(inclusive?"≥":">"):"x"+(inclusive?"≤":"<"))+format(boundary);
    const wrong=[(right?"x<":"x>")+format(boundary),"x"+(right?">":"<")+format(boundary+2),
      (right?"x>":"x<")+format(-boundary)];
    const alternatives=[correct,...wrong].filter((v,i,a)=>a.indexOf(v)===i).slice(0,4);
    return {a,b,c,d,m,k,op,boundary,inclusive,right,correct,alternatives,text:statement(a,b,op,c,d)};
  }
  function clearTimer(){if(timer){clearTimeout(timer);timer=null;}}
  function graph() {
    const q=current; if(!q)return "";
    const range=Math.max(4,Math.ceil(Math.abs(q.boundary))+3),width=344,height=230;
    const min=-range,max=range,px=x=>32+(x-min)/(max-min)*284;
    const fy=x=>q.a*x+q.b,gy=x=>q.c*x+q.d;
    const minY=Math.min(...[min,max].flatMap(x=>[fy(x),gy(x)]),0),maxY=Math.max(...[min,max].flatMap(x=>[fy(x),gy(x)]),0);
    const yRange=Math.max(5,maxY-minY),bottom=minY-yRange*.14,top=maxY+yRange*.14,py=y=>205-(y-bottom)/(top-bottom)*178;
    const points=fn=>Array.from({length:61},(_,i)=>{let x=min+(max-min)*i/60;return px(x).toFixed(2)+","+py(fn(x)).toFixed(2)}).join(" ");
    const yAxis=px(0),zero=py(0),bx=px(q.boundary);
    const shadeFrom=q.right?bx:px(min),shadeTo=q.right?px(max):bx;
    const ticks=Array.from({length:5},(_,i)=>min+(max-min)*i/4).map(x=>`<text x="${px(x).toFixed(1)}" y="225" text-anchor="middle" fill="#a9c6e5" font-size="10">${format(x)}</text>`).join("");
    const xMarker=Math.min(px(max)-4,Math.max(px(min)+4,bx));
    const fPath=transformed?(x=>q.m*x+q.b-q.d):fy;
    const gPath=transformed?(x=>0):gy;
    const algebra=(a,b)=>format(a)+"x"+signed(b);
    const fLabel=transformed?"y = f(x) − g(x) = "+algebra(q.m,q.b-q.d):"y = f(x) = "+algebra(q.a,q.b);
    const gLabel=transformed?"y = 0":"y = g(x) = "+(q.c===0?format(q.d):algebra(q.c,q.d));
    const yAxisPixels=transformed?py(0):zero;
    return `<div class="discovery-equations"><span style="color:${COLORS.f}">${fLabel}</span><span style="color:${COLORS.g}">${gLabel}</span></div>
      <svg viewBox="0 0 ${width} ${height}" role="img" aria-label="מערכת צירים x ו-y עם שני גרפים ותחום האמת המסומן בציר x">
      <rect x="31" y="10" width="284" height="196" rx="8" fill="#0f1d35"/>
      <g stroke="#324763" stroke-width=".6">${Array.from({length:5},(_,i)=>`<path d="M${32+i*71} 10V206 M32 ${10+i*49}H316"/>`).join("")}</g>
      <rect x="${Math.min(shadeFrom,shadeTo)}" y="${zero-5}" width="${Math.abs(shadeTo-shadeFrom)}" height="10" fill="#71e3ae" opacity=".6"/>
      <path d="M32 ${zero}H316 M${yAxis} 10V206" stroke="#b0bfd5" stroke-width="1.4"/>
      <polyline points="${points(fPath)}" stroke="${COLORS.f}" stroke-width="2.8" fill="none"/>
      <polyline points="${points(gPath)}" stroke="${COLORS.g}" stroke-width="2.8" fill="none"/>
      <path d="M${xMarker} 10V206" stroke="#aaf4be" stroke-dasharray="4 3" opacity=".75"/>
      <circle cx="${xMarker}" cy="${zero}" r="5.5" fill="${q.inclusive?'#aaf4be':'#0f1d35'}" stroke="#aaf4be" stroke-width="2.5"/>
      <text x="319" y="${Math.max(24,zero-7)}" fill="#edf5ff" font-size="14">x</text><text x="${yAxis+7}" y="18" fill="#edf5ff" font-size="14">y</text>
      ${ticks}
      </svg>
      <div class="discovery-function-readout" dir="ltr"><span id="discoveryX">x = 0</span><span id="discoveryF">f(x)=...</span><span id="discoveryG">g(x)=...</span></div>
      <label class="discovery-slider-label">בדקו נקודת x <input id="discoverySlider" type="range" min="${min}" max="${max}" step="0.25" value="${Math.max(min,Math.min(max,Math.round(q.boundary-1)))}"></label>
      <div class="discovery-graph-actions"><button type="button" id="discoveryTransform">${transformed?'חזרה לשני הגרפים':'העברת אגפים'}</button><span>${transformed?'שני הייצוגים מתארים אותו תחום אמת':'שתי פונקציות, השוואת ערכי y באותו x'}</span></div>`;
  }
  function liveGraph() {
    if(!revealed)return;
    const h=$("discoveryGraph");h.innerHTML=graph();
    const slider=$("discoverySlider");
    function update(){
      const x=Number(slider.value),f=current.a*x+current.b,g=current.c*x+current.d;
      $("discoveryX").textContent="x="+format(x);
      $("discoveryF").textContent=(transformed?"f−g":"f")+" = "+format(transformed?f-g:f);
      $("discoveryG").textContent=(transformed?"0":"g")+" = "+format(transformed?0:g);
    }
    slider.addEventListener("input",update);update();
    $("discoveryTransform").onclick=()=>{transformed=!transformed;liveGraph();};
  }
  function closeVisual(){
    clearTimer();revealed=false;transformed=false;
    $("discoveryOverlay").classList.add("hidden");
    $("discoveryVisual").setAttribute("aria-expanded","false");
  }
  function openVisual(){
    clearTimer();
    if(visualCount<MAX)visualCount++;
    revealed=true;
    $("discoveryOverlay").classList.remove("hidden");
    $("discoveryVisual").setAttribute("aria-expanded","true");
    $("discoveryVisual").textContent="לדמיין "+visualCount;
    $("discoveryDuration").textContent=visualCount===MAX?"נשאר פתוח":visualCount+" שניות";
    $("discoveryMore").textContent="לדמיין "+Math.min(MAX,visualCount+1);
    liveGraph();
    if(visualCount<MAX)timer=setTimeout(closeVisual,visualCount*1000);
  }
  function renderQuestion(){
    closeVisual();visualCount=0;transformed=false;
    current=makeQuestion();
    $("discoveryLevel").textContent=["קל","בינוני","מאתגר","מאתגר מאוד"][difficulty-1];
    $("discoveryExpression").textContent=current.text;
    $("discoveryVisual").textContent="לדמיין 1";
    selectedValue=null;
    $("discoveryFeedback").textContent="";
    $("discoveryFeedback").className="discovery-feedback";
    $("discoveryChoices").replaceChildren();
    const options=current.alternatives;
    options.forEach((v,i)=>{const btn=document.createElement("button");btn.type="button";btn.textContent=v;btn.dir="ltr";btn.onclick=()=>{selectedValue=v;[...$("discoveryChoices").children].forEach(x=>x.setAttribute("aria-pressed",String(x===btn)));};btn.setAttribute("aria-pressed","false");$("discoveryChoices").append(btn);});
  }
  function cycleQuestion(){
    questionNumber++;
    difficulty=difficulty%4+1;
    renderQuestion();
  }
  function check(){
    let entered=(selectedValue||"").trim().replace(/\s/g,"").replace(/≥/g,">=").replace(/≤/g,"<=").replace(/−/g,"-");
    let expected=current.correct.replace(/≥/g,">=").replace(/≤/g,"<=").replace(/−/g,"-");
    let ok=entered===expected;
    $("discoveryFeedback").textContent=ok?"✓ נכון. באילו ערכי x הגרף הראשון גבוה מהשני?":entered?"עדיין לא. אפשר לבדוק ערכי x או ללחוץ על לדמיין.":"בחרו תחום אמת מהאפשרויות.";
    $("discoveryFeedback").className="discovery-feedback "+(ok?"correct":"wrong");
  }
  function buildHost(){
    host=document.createElement("section");host.id="inequalityDiscovery";host.className="inequality-discovery";host.setAttribute("aria-label","חקירת אי שוויון");
    host.innerHTML=`<div class="discovery-head"><span class="discovery-eyebrow">איזה תחום מקיים?</span><button type="button" id="discoveryNext">שאלה אחרת ↻ <span id="discoveryLevel">קל</span></button></div>
      <div class="discovery-problem" dir="ltr" id="discoveryExpression"></div>
      <div class="discovery-question">באילו ערכי x האי־שוויון נכון?</div>
      <div id="discoveryChoices" class="discovery-choices" role="group" aria-label="תחומי פתרון"></div>
      <div class="discovery-answer-row"><button type="button" id="discoveryCheck">בדיקה</button></div>
      <div id="discoveryFeedback" class="discovery-feedback" role="status"></div>
      <div class="discovery-bottom"><button type="button" id="discoveryVisual" class="discovery-imagine" aria-expanded="false">לדמיין 1</button><button type="button" id="discoveryGuided">תרגול מדורג</button></div>
      <div class="discovery-overlay hidden" id="discoveryOverlay" role="region" aria-label="המחשה זמנית"><div class="discovery-overlay-top"><span id="discoveryDuration">שנייה אחת</span><button type="button" id="discoveryClose" aria-label="סגירת ההמחשה">✕</button></div><div id="discoveryGraph"></div><button type="button" id="discoveryMore" class="discovery-imagine">לדמיין 2</button></div>`;
    const challenge=document.querySelector(".challenge");challenge.prepend(host);
    $("discoveryNext").onclick=cycleQuestion;
    $("discoveryCheck").onclick=check;

    $("discoveryVisual").onclick=openVisual;
    $("discoveryClose").onclick=closeVisual;
    $("discoveryMore").onclick=openVisual;
    $("discoveryGuided").onclick=()=>{closeVisual();document.querySelector(".challenge").classList.remove("discovery-mode");};
    const guidedBtn=document.createElement("button");guidedBtn.id="returnDiscovery";guidedBtn.type="button";guidedBtn.className="subtle";guidedBtn.textContent="חזרה לשאלה";
    guidedBtn.onclick=()=>{document.querySelector(".challenge").classList.add("discovery-mode");};
    document.querySelector(".step-actions").prepend(guidedBtn);
  }
  window.VizyInequalityDiscovery={
    sync(lesson){
      const challenge=document.querySelector(".challenge");
      if(!challenge)return;
      if(lesson.id!=="g11-inequality"){challenge.classList.remove("discovery-mode");if(host)host.classList.add("hidden");lessonId=null;return;}
      if(!host)buildHost();
      host.classList.remove("hidden");
      if(lessonId!==lesson.id){
        lessonId=lesson.id;difficulty=1;questionNumber=0;renderQuestion();
        challenge.classList.add("discovery-mode");
      }
    }
  };
})();
