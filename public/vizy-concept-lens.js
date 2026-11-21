/* Vizy inquiry stage: generator-driven concept lenses. No standalone shell. */
(function(root){
'use strict';
const f=x=>x*x*x/3-x, df=x=>x*x-1;
const near=(a,b,eps=1e-7)=>Math.abs(a-b)<eps;
const fmt=n=>near(n,2/3)?'⅔':near(n,-2/3)?'−⅔':(Math.round(n*100)/100).toString().replace('-','−');
const roots=[[-1.4,-1.1],[.5,.9]].map(([lo0,hi0])=>{
 let lo=lo0,hi=hi0;for(let i=0;i<65;i++){const m=(lo+hi)/2; if((f(lo)-df(lo))*(f(m)-df(m))<=0)hi=m;else lo=m;}return (lo+hi)/2;
});
const svgNS='http://www.w3.org/2000/svg';
const h=(tag,cls,content)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(content!==undefined)e.textContent=content;return e;};
const btn=(text,fn,cls='cl-option')=>{const b=h('button',cls,text);b.type='button';b.addEventListener('click',fn);return b;};
const math=text=>{const e=h('bdi','cl-math',text);e.dir='ltr';return e;};
const tri=()=>({x:0,mode:'perp',lens:'segment',discovered:{},history:[],pending:null,
 phase:'discover',predictions:[],predictionSubmitted:false,dragged:false,reflected:false,
 modePrediction:false,feedback:'',assisted:false});
const func=()=>({a:2,lens:'f',discovered:{},history:[],pending:null,
 phase:'discover',predictions:[],predictionSubmitted:false,dragged:false,reflected:false,
 sawEqual:false,sawDifferent:true,feedback:'',assisted:false});
const angle=(P,V,Q)=>{const u={x:P.x-V.x,y:P.y-V.y},v={x:Q.x-V.x,y:Q.y-V.y};
 return Math.acos(Math.max(-1,Math.min(1,(u.x*v.x+u.y*v.y)/(Math.hypot(u.x,u.y)*Math.hypot(v.x,v.y)))));};
const geom=s=>{const A={x:s.x,y:6},B={x:-5,y:0},C={x:5,y:0},D={x:s.mode==='perp'?s.x:0,y:0};
 return {A,B,C,D,bd:D.x+5,dc:5-D.x,foot:angle(A,D,C),left:angle(B,A,D),right:angle(D,A,C)};};
const register={};
function define(scene){register[scene.id]=scene;}
define({id:'triangle',title:'מה אפשר לומר על הקטע האדום?',initial:tri, lenses:[['segment','קטע AD'],['line','ישר AD']],
 claims:[
  {id:'height',label:()=> 'גובה',holds:s=>near(geom(s).foot,Math.PI/2),evidence:['right'],
   why:()=> 'הזווית ליד D היא זווית ישרה.',whyNot:s=>'הזווית ליד D היא '+fmt(geom(s).foot*180/Math.PI)+'°, לא 90°.'},
  {id:'median',label:()=> 'תיכון',holds:s=>near(geom(s).bd,geom(s).dc),evidence:['bd','dc'],
   why:()=> 'שני חלקי הבסיס שווים.',whyNot:s=>'BD = '+fmt(geom(s).bd)+', DC = '+fmt(geom(s).dc)+'. הם אינם שווים.'},
  {id:'bisector',label:()=> 'חוצה זווית',holds:s=>near(geom(s).left,geom(s).right),evidence:['angle-left','angle-right'],
   why:()=> 'שתי הזוויות ליד A שוות.',whyNot:s=>'ליד A הזוויות הן '+fmt(geom(s).left*180/Math.PI)+'° ו־'+fmt(geom(s).right*180/Math.PI)+'°.'},
  {id:'side',label:()=> 'צלע',holds:()=>false,evidence:[],why:()=>'',whyNot:()=> 'AD עובר בתוך המשולש; צלע נמצאת על גבול המשולש.'}
 ]});
define({id:'function',title:'אותו מספר, שתי עדשות',initial:func,lenses:[['f','גרף הפונקציה'],['derivative','גרף הנגזרת']],
 claims:[
  {id:'slope',label:s=>'שיפוע המשיק: '+fmt(df(s.a)),holds:()=>true,evidence:['run','rise'],
   why:s=>'יחס השינוי במשיק נותן '+fmt(df(s.a))+'.',whyNot:()=>''},
  {id:'algebra',label:s=>'f′('+fmt(s.a)+') = '+fmt(df(s.a)),holds:()=>true,evidence:['run','rise'],
   why:s=>'זהו ערך הנגזרת באותו x.',whyNot:()=>''},
  {id:'point',label:s=>'('+fmt(s.a)+', '+fmt(df(s.a))+') על f′',holds:()=>true,evidence:['derivative'],
   why:s=>'גובה הנקודה בגרף הנגזרת הוא '+fmt(df(s.a))+'.',whyNot:()=>''},
  {id:'equal',label:s=>'f('+fmt(s.a)+') = f′('+fmt(s.a)+')',holds:s=>Math.abs(f(s.a)-df(s.a))<1e-9,
   evidence:['function','derivative'],why:()=> 'שני הגבהים שווים בנקודה שבדקתם.',
   whyNot:s=>'גובה f הוא '+fmt(f(s.a))+' וגובה f′ הוא '+fmt(df(s.a))+'. אלה ערכים שונים.'}
 ]});
function mount(container){
 let scene='triangle',current={triangle:tri(),function:func()},overlay=true,resetOpen=false;
 try{
  const saved=JSON.parse(localStorage.getItem('vizy_concept_lens_v1')||'null');
  if(saved&&saved.current&&saved.current.triangle&&saved.current.function){
   const valid=new Set(['discover','ready','predict','manipulate','mode-predict','reflect','done']);
   for(const id of ['triangle','function']){
    const input=saved.current[id];
    if(!valid.has(input.phase)||!Array.isArray(input.history)||!input.discovered||typeof input.discovered!=='object')continue;
    const defaults=id==='triangle'?tri():func();
    current[id]={...defaults,...input,pending:null,feedback:'',history:input.history.slice(-30)};
   }
   if(saved.scene==='triangle'||saved.scene==='function')scene=saved.scene;
  }
 }catch{}
 const host=h('section','vizy-inquiry cl-host');host.id='vizyInquiry';host.dataset.iqStage='lens';host.dir='rtl';
 container.prepend(host);document.body.classList.add('vizy-investigation-active','vizy-concept-lens-active');
 document.title='Vizy | עדשות על אותו דבר';
 // Hide old legacy content only for this new inquiry route.
 let drawn=false,dragging=false,svg=null,trail=null,stage=null,options=null,footer=null,live=null;
 const data=()=>register[scene],s=()=>current[scene],claim=id=>data().claims.find(c=>c.id===id);
 const count=()=>Object.keys(s().discovered).length;
 const feedback=(msg)=>{s().feedback=msg;if(live)live.textContent=msg;};
 const store=()=>{try{localStorage.setItem('vizy_concept_lens_v1',JSON.stringify({scene,current}));}catch{}};
 function switchScene(id){scene=id;s().pending=null;overlay=true;render();window.scrollTo(0,0);}
 function addDiscovery(c,assisted){
  const o=s(),name=c.label(o),snapshot={id:c.id,label:name,assisted,x:o.x??o.a,mode:o.mode||o.lens,at:Date.now()};
  o.discovered[c.id]=snapshot;o.history.push(snapshot);o.pending=null;
  feedback((assisted?'גילינו יחד: ':'גיליתם: ')+c.why(o));
  if(count()>=2&&o.phase==='discover')o.phase='ready';
  store();render();
 }
 function choose(id){
  const o=s(),c=claim(id);if(o.phase==='predict'||o.phase==='mode-predict'){o.predictions=o.predictions.includes(id)?o.predictions.filter(v=>v!==id):[...o.predictions,id];renderChoices();return;}
  if(o.pending)return;
  if(!c.holds(o)){feedback(c.whyNot(o));return;}
  if(o.discovered[id]){feedback(c.why(o));return;}
  o.pending={id,hits:[],misses:0};feedback('סמנו בציור מה מצדיק את זה');render();
 }
 function tapEvidence(id){
  const o=s(),p=o.pending;if(!p)return;
  const c=claim(p.id);
  if(!c.evidence.includes(id)){
   p.misses++;if(p.misses>=2){addDiscovery(c,true);return;}
   feedback(scene==='triangle'?'בדקו את הקטע או הזוויות שקשורים לשם שבחרתם.':'חפשו את שני החלקים שמגדירים את הערך.');return;
  }
  if(!p.hits.includes(id))p.hits.push(id);
  if(p.hits.length===c.evidence.length){addDiscovery(c,false);return;}
  feedback('נמצאה ראיה אחת. צריך לסמן גם את השנייה.');
  drawPicture();
  const next=c.evidence.find(key=>!p.hits.includes(key));
  if(next)requestAnimationFrame(()=>svg?.querySelector('[data-evidence="'+next+'"]')?.focus({preventScroll:true}));
 }
 function lens(id){
  if(s().lens===id)return;s().lens=id;drawPicture();drawn=true;
  const panel=host.querySelector('.cl-figure');panel?.classList.remove('cl-turn');void panel?.offsetWidth;panel?.classList.add('cl-turn');
  renderLenses();renderChoices();
 }
 function renderLenses(){
  const target=host.querySelector('#clLenses');if(!target)return;target.replaceChildren(...data().lenses.map(([id,text])=>{
   const b=btn(text,()=>lens(id),'cl-lens');b.setAttribute('aria-pressed',String(s().lens===id));return b;
  }));
 }
 function currentTruth(){
  const o=s();return data().claims.filter(c=>c.holds(o)).map(c=>c.id);
 }
 function drawPicture(){
  if(!svg)return;
  svg.replaceChildren();
  const e=(name,attrs={},txt)=>{const n=document.createElementNS(svgNS,name);for(const [k,v] of Object.entries(attrs))n.setAttribute(k,String(v));if(txt!==undefined)n.textContent=txt;svg.append(n);return n;};
  const line=(x1,y1,x2,y2,cl='cl-stroke')=>e('line',{x1,y1,x2,y2,class:cl});
  const circle=(x,y,r,cl='cl-dot')=>e('circle',{cx:x,cy:y,r,class:cl});
  const txt=(x,y,t,cl='cl-label')=>e('text',{x,y,class:cl,'text-anchor':'middle'},t);
  const hit=(id,x,y,r=24)=>{const c=e('circle',{cx:x,cy:y,r,fill:'transparent',class:'cl-hotspot',role:'button',tabindex:0,'aria-label':'סימון ראיה '+id,'data-evidence':id});
   c.addEventListener('click',()=>tapEvidence(id));c.addEventListener('keydown',ev=>{if(ev.key==='Enter'||ev.key===' '){ev.preventDefault();tapEvidence(id);}});return c;};
  const isHit=id=>s().pending?.hits.includes(id);
  data().draw({e,line,circle,txt,hit,isHit});
  if(s().pending){const p=s().pending;svg.setAttribute('aria-label','סמנו בציור את הראיות הנדרשות');}
 }
 const esc=str=>String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');

 function drawTriangle({e,line,circle,txt,hit,isHit}){
   const o=s(),g=geom(o),X=x=>180+x*25,Y=y=>240-y*29;
   e('polygon',{points:[[g.A.x,g.A.y],[g.B.x,g.B.y],[g.C.x,g.C.y]].map(p=>X(p[0])+','+Y(p[1])).join(' '),class:'cl-shape'});
   if(o.lens==='line')line(X(g.A.x+(g.A.x-g.D.x)*.45),Y(8.7),X(g.D.x-(g.A.x-g.D.x)/6),Y(-1),'cl-support');
   line(X(g.A.x),Y(g.A.y),X(g.D.x),Y(0),'cl-selected');
   for(const [p,k,dx,dy] of [[g.A,'A',0,-11],[g.B,'B',-8,16],[g.C,'C',8,16],[g.D,'D',0,17]])txt(X(p.x)+dx,Y(p.y)+dy,k);
   circle(X(g.A.x),Y(g.A.y),8,'cl-draggable');
   const footX=X(g.D.x),footY=Y(0);
   if(isHit('right'))e('path',{d:'M'+footX+' '+(footY-16)+' h16 v16',class:'cl-proof'});
   if(isHit('bd'))line(X(-5),Y(0)-8,footX,Y(0)-8,'cl-proof');
   if(isHit('dc'))line(footX,Y(0)-8,X(5),Y(0)-8,'cl-proof');
   if(isHit('angle-left')||isHit('angle-right')){
    const a=X(g.A.x),ay=Y(g.A.y);
    if(isHit('angle-left'))e('path',{d:'M'+(a-23)+' '+(ay+18)+' Q'+(a-13)+' '+(ay+22)+' '+(a-8)+' '+(ay+29),class:'cl-proof'});
    if(isHit('angle-right'))e('path',{d:'M'+(a+8)+' '+(ay+29)+' Q'+(a+13)+' '+(ay+22)+' '+(a+23)+' '+(ay+18),class:'cl-proof'});
   }
   hit('right',footX+8,footY-8,22);hit('bd',(X(-5)+footX)/2,footY,25);hit('dc',(X(5)+footX)/2,footY,25);
   hit('angle-left',X(g.A.x)-17,Y(g.A.y)+26,19);hit('angle-right',X(g.A.x)+17,Y(g.A.y)+26,19);
   if(o.phase==='manipulate'){const drag=hit('drag',X(g.A.x),Y(g.A.y),23);drag.setAttribute('aria-label','גררו את הקודקוד A');drag.classList.add('cl-drag-hit');}

 }
 function drawFunction({e,line,circle,txt,hit,isHit}){
   const o=s(),X=x=>180+x*62,Y=y=>169-y*27;
   line(25,Y(0),335,Y(0),'cl-axis');line(X(0),17,X(0),282,'cl-axis');
   for(const v of [-2,-1,1,2]){line(X(v),Y(0)-3,X(v),Y(0)+3,'cl-tick');txt(X(v),Y(0)+17,v,'cl-small');}
   const fn=o.lens==='f'?f:df;
   let path='';for(let i=0;i<=130;i++){const x=-2.3+i*4.6/130;path+=(i?' L':'M')+X(x).toFixed(2)+' '+Y(fn(x)).toFixed(2);}
   e('path',{d:path,class:'cl-curve'});
   const v=fn(o.a),px=X(o.a),py=Y(v);
   line(px,Y(0),px,py,'cl-guide');circle(px,py,7,'cl-selected-point');
   txt(Math.min(326,Math.max(34,px)),Math.min(273,Math.max(21,py-13)), '('+fmt(o.a)+', '+fmt(v)+')','cl-small');
   if(o.lens==='f'){
    const m=df(o.a),start=o.a>1.1?o.a-1:o.a,end=start+1;
    const yStart=f(o.a)+m*(start-o.a),yEnd=f(o.a)+m*(end-o.a);
    e('path',{d:'M'+X(start)+' '+Y(yStart)+' L'+X(end)+' '+Y(yEnd),class:'cl-tangent'});
    line(X(start),Y(yStart),X(end),Y(yStart),'cl-run');
    line(X(end),Y(yStart),X(end),Y(yEnd),'cl-rise');
    if(near(m,0)){txt(X(end)-22,Y(yStart)-14,'Δy=0','cl-zero');}
    if(isHit('run'))line(X(start),Y(yStart),X(end),Y(yStart),'cl-proof');
    if(isHit('rise'))line(X(end),Y(yStart),X(end),Y(yEnd),'cl-proof');
    hit('run',(X(start)+X(end))/2,Y(yStart),21);hit('rise',X(end), (Y(yStart)+Y(yEnd))/2,22);
    if(near(m,0))hit('rise',X(end),Y(yStart)-12,24);
    hit('function',(X(o.a)+X(0))/2,(Y(v)+Y(0))/2,20);
   }else{
    if(isHit('derivative'))line(px,Y(0),px,py,'cl-proof');
    hit('derivative',px,(Y(0)+py)/2,24);
   }
   if(o.phase==='manipulate'){const dr=hit('drag',px,py,22);dr.classList.add('cl-drag-hit');dr.setAttribute('aria-label','גררו את הנקודה');}

 }
 register.triangle.draw=drawTriangle;register.function.draw=drawFunction;
 function renderChoices(){
  if(!options)return;const o=s();options.replaceChildren();
  for(const c of data().claims){
   const selected=o.predictions.includes(c.id),found=Boolean(o.discovered[c.id]);
   const b=btn('',()=>choose(c.id),'cl-choice');b.dataset.claim=c.id;
   const name=h('span','cl-choice-name');
   if(scene==='function'&&c.id==='point'){
    name.append(math('('+fmt(o.a)+', '+fmt(df(o.a))+')'),document.createTextNode(' על גרף '),math('f′'));
   }else{ name.textContent=c.label(o);root.VizyLtr?.apply(name); }
   b.append(name);
   if(o.phase==='predict'||o.phase==='mode-predict')b.setAttribute('aria-pressed',String(selected));
   if(found&&o.phase!=='predict')b.append(h('small','',c.holds(o)?'✓ גילינו':'היה נכון לפני ההזזה'));
   if(o.pending)b.disabled=true;
   options.append(b);
  }
 }
 function renderTrail(){
  const list=host.querySelector('#clTrailList');if(!list)return;list.replaceChildren();
  for(const record of s().history){
   const li=h('li','',record.label+' · '+(record.assisted?'גילינו יחד':'גילינו בעצמנו')+' · '+(scene==='triangle'?'A='+fmt(record.x):'x='+fmt(record.x)));
   list.append(li);
  }
  host.querySelector('#clTrailCount').textContent=String(s().history.length);
 }
 function renderFacts(){
  const el=host.querySelector('#clFacts');if(!el)return;el.replaceChildren();
  for(const c of data().claims.filter(c=>s().discovered[c.id])){
   const truth=c.holds(s()),b=h('span','cl-found'+(truth?'':' cl-dim'));
   b.append(document.createTextNode(truth?'✓ ':'◌ '));
   if(scene==='function'&&c.id==='point'){
    b.append(math('('+fmt(s().a)+', '+fmt(df(s().a))+')'),document.createTextNode(' על גרף '),math('f′'));
   }else b.append(document.createTextNode(c.label(s())));
   if(!truth)b.append(document.createTextNode(' · היה נכון לפני ההזזה'));
   el.append(b);
  }
 }
 function updateLive(){
  const o=s();if(scene==='function'){if(roots.some(r=>Math.abs(o.a-r)<1e-9))o.sawEqual=true;else o.sawDifferent=true;}
  drawPicture();renderFacts();
  const value=host.querySelector('#clValue');if(value)value.textContent=scene==='triangle'?'A = '+fmt(o.x):'x = '+fmt(o.a)+' · f = '+fmt(f(o.a))+' · f′ = '+fmt(df(o.a));
  store();
 }
 function submitPrediction(){
  if(s().predictions.length===0){feedback('בחרו לפחות תיאור אחד לפני השינוי.');return;}
  s().predictionSubmitted=true;s().phase='manipulate';feedback('השערתכם נשמרה. עכשיו שנו את המקרה ובדקו.');render();
 }
 function changeInput(x){
  const o=s();if(o.phase!=='manipulate')return;
  if(scene==='triangle'){o.x=Math.max(-3.5,Math.min(3.5,x));o.dragged=o.dragged||Math.abs(o.x)>.06;}
  else{
   let n=Math.max(-2.3,Math.min(2.3,x));
   // Snap with input resolution. Leaving the band moves away immediately.
   for(const root of roots)if(Math.abs(n-root)<.028)n=root;
   o.a=n;o.dragged=o.dragged||Math.abs(n-2)>.035;
  }
  updateLive();
 }
 function manipulateUI(){
  const o=s(),wrap=h('div','cl-manipulate');
  if(scene==='triangle'){
   wrap.append(h('p','cl-instruction','גררו את A. מה נשאר נכון?'));
   const modes=h('div','cl-mode');
   for(const [id,t] of [['perp','שמרו על הזווית הישרה'],['midpoint','שמרו על אמצע הבסיס']]){
    const b=btn(t,()=>{if(o.mode===id)return;o.mode=id;o.x=0;o.modePrediction=id==='perp';o.predictions=[];o.phase=id==='perp'?'manipulate':'mode-predict';feedback(id==='midpoint'?'D עבר לאמצע. לפני הזזה נוספת: מה יישאר נכון?':'D שוב מתחת ל־A.');render();},'cl-lens');
    b.setAttribute('aria-pressed',String(o.mode===id));modes.append(b);
   }
   wrap.append(modes);
  }else wrap.append(h('p','cl-instruction','גררו את הנקודה, או הזיזו את המחוון. חפשו שוויון וגם אי־שוויון.'));
  const slider=h('input','cl-slider');slider.id='clSlider';slider.type='range';slider.min=scene==='triangle'?'-3.5':'-2.3';
  slider.max=scene==='triangle'?'3.5':'2.3';slider.step=scene==='triangle'?'.05':'.01';slider.value=String(scene==='triangle'?o.x:o.a);
  slider.setAttribute('aria-label',scene==='triangle'?'מיקום A':'מיקום x');slider.addEventListener('input',()=>changeInput(Number(slider.value)));
  slider.addEventListener('change',()=>{render();});wrap.append(slider);
  wrap.append(h('output','cl-value',''));const done=btn('בדקתי · מה נשאר נכון?',()=>{if(!o.dragged){feedback('נסו להזיז את הנקודה ולבדוק.');return;}o.phase='reflect';feedback('מה הצדיק כל שם? בחרו את הראיה.');render();},'cl-primary');
  wrap.append(done);return wrap;
 }
 function renderActions(){
  const wrap=host.querySelector('#clActions');wrap.replaceChildren();
  const o=s();
  if(o.pending){
   wrap.append(btn('לבחירת תיאור אחר',()=>{o.pending=null;feedback('בחרו תיאור.');render();},'cl-secondary'));
  }else if(o.phase==='discover'||o.phase==='ready'){
   if(count()>=2){
    wrap.append(btn('ומה עוד? · לפני שינוי',()=>{o.phase='predict';feedback('מה לדעתכם יישאר נכון אחרי ההזזה? אפשר לבחור כמה תשובות.');render();},'cl-primary'));
   }else if(count()>0){wrap.append(h('p','cl-instruction','ומה עוד אפשר לומר על אותו הדבר?'));}
  }else if(o.phase==='predict'){
   wrap.append(btn('שמרו את ההשערה ובדקו',submitPrediction,'cl-primary'));
  }else if(o.phase==='mode-predict'){
   wrap.append(h('p','cl-instruction','D נשאר באמצע. מה ישרוד כשהקודקוד יזוז?'));
   wrap.append(btn('בחרתי · עכשיו נבדוק',()=>{if(!o.predictions.length){feedback('בחרו תיאור קודם.');return;}o.modePrediction=true;o.phase='manipulate';render();},'cl-primary'));
  }else if(o.phase==='manipulate')wrap.append(manipulateUI());
  else if(o.phase==='reflect'){
    const truth=data().claims.filter(c=>c.holds(o));
    if(!o.reflectClaim){
     wrap.append(h('p','cl-instruction','איזה תיאור נכון עכשיו?'));
     for(const c of truth){
      wrap.append(btn(c.label(o),()=>{o.reflectClaim=c.id;feedback('איזו ראיה מוכיחה את התיאור שבחרתם?');render();},'cl-choice'));
     }
    }else{
     const selected=claim(o.reflectClaim);
     wrap.append(h('p','cl-instruction','מה בציור מצדיק: '+selected.label(o)+'?'));
     const evidenceOptions=scene==='triangle'?
      [['זווית ישרה ב־D','height'],['שני חלקי בסיס שווים','median'],['שתי זוויות שוות בקודקוד','bisector']]:
      [['היחס בין השינוי בגובה לשינוי ב־x','slope'],['הגובה בנקודה על גרף הנגזרת','point'],['שני הגבהים במקרה הזה','equal']];
     for(const [label,id] of evidenceOptions){
      wrap.append(btn(label,()=>{
       if(id!==selected.id&&(selected.id!=='algebra'||id!=='slope')){
        feedback('זו ראיה לקשר אחר. בחרו את מה שמצדיק את התיאור שלכם.');return;
       }
       if(scene==='function'&&!(o.sawEqual&&o.sawDifferent)){
        feedback('חסרות שתי דוגמאות: גבהים שווים וגבהים שונים. בדקו שוב.');
        o.phase='manipulate';o.reflectClaim=null;render();return;
       }
       o.reflected=true;o.phase='done';
       feedback('מצאתם את התיאור ואת הנתון שמצדיק אותו.');render();
      },'cl-choice'));
     }
     wrap.append(btn('לבחור תיאור אחר',()=>{o.reflectClaim=null;render();},'cl-secondary'));
    }
  }else if(o.phase==='done'){
   wrap.append(h('p','cl-instruction','מה גילינו? אותו דבר יכול לקבל כמה שמות, וכל שם דורש ראיה.'));
   if(scene==='triangle')wrap.append(btn('לסצנה 2 · השיפוע כגובה',()=>switchScene('function'),'cl-primary'));
   else wrap.append(h('p','cl-complete','סיימתם את שתי הסצנות ✓'));
  }
 }
 function render(){
  const o=s();host.replaceChildren();
  const head=h('div','cl-head');head.append(h('strong','', 'VIZY · עדשות על אותו דבר'),h('span','',scene==='triangle'?'1 / 2':'2 / 2'));host.append(head);
  const given=h('button','cl-given');
  if(scene==='triangle')given.textContent='הנתון: המשולש ABC והקטע AD';
  else{given.append(document.createTextNode('הנתון: '));given.append(root.VizyLtr?.span('f(x)=x³/3−x, f′(x)=x²−1')||math('f(x)=x³/3−x, f′(x)=x²−1'));}
  given.type='button';given.id='clGivenStrip';given.onclick=()=>{overlay=true;render();};host.append(given);
  const prompt=h('h2','cl-prompt',o.pending?'סמנו בציור מה מצדיק את זה':o.phase==='predict'||o.phase==='mode-predict'?'מה יישאר נכון?':o.phase==='manipulate'?'מה השתנה ומה נשאר?':data().title);
  host.append(prompt);
  const figure=h('div','cl-figure');stage=figure;svg=document.createElementNS(svgNS,'svg');svg.setAttribute('viewBox','0 0 360 290');svg.setAttribute('role','img');svg.setAttribute('aria-label',scene==='triangle'?'משולש עם קטע אדום AD':'גרף עם נקודה נבחרת');svg.id='clPicture';figure.append(svg);host.append(figure);
  let startX=null;
  svg.addEventListener('pointerdown',ev=>{if(o.phase!=='manipulate')return;if(!ev.target.closest('.cl-drag-hit'))return;dragging=true;svg.setPointerCapture(ev.pointerId);startX=ev.pointerId;});
  svg.addEventListener('pointermove',ev=>{if(!dragging||startX!==ev.pointerId)return;const rect=svg.getBoundingClientRect();const local=(ev.clientX-rect.left)/rect.width*360;
   changeInput(scene==='triangle'?(local-180)/25:(local-180)/62);
   const slider=host.querySelector('#clSlider');if(slider)slider.value=String(scene==='triangle'?o.x:o.a);
  });
  svg.addEventListener('pointerup',ev=>{if(dragging){dragging=false;startX=null;render();}});
  svg.addEventListener('pointercancel',()=>{dragging=false;startX=null;render();});
  const lensWrap=h('div','cl-lenses');lensWrap.id='clLenses';host.append(lensWrap);
  const facts=h('div','cl-facts');facts.id='clFacts';host.append(facts);
  options=h('div','cl-choices');options.id='clChoices';host.append(options);
  live=h('p','cl-feedback',o.feedback);live.setAttribute('role','status');live.setAttribute('aria-live','polite');live.id='clFeedback';host.append(live);
  footer=h('div','cl-actions');footer.id='clActions';host.append(footer);
  const history=h('details','cl-trail');history.id='clTrail';const sum=h('summary','','מה גילינו (');const counter=h('span','',String(o.history.length));counter.id='clTrailCount';sum.append(counter,document.createTextNode(')'));history.append(sum);const li=h('ul','');li.id='clTrailList';history.append(li);host.append(history);
  host.append(btn('להתחיל מחדש',()=>{resetOpen=true;renderReset();},'cl-reset'));
  renderLenses();renderChoices();renderActions();renderFacts();renderTrail();drawPicture();updateLive();
  // Prediction must remain ungraded: no verdict before manipulation.
  if(o.phase==='predict'||o.phase==='mode-predict')live.textContent=o.feedback;
  if(overlay)renderEntry();
  if(resetOpen)renderReset();
 }
 function renderEntry(){
  const curtain=h('div','iq-entry-overlay cl-entry');curtain.id='clEntryOverlay';curtain.setAttribute('role','dialog');curtain.setAttribute('aria-modal','true');
  const card=h('div','iq-entry-sheet cl-entry-sheet');card.append(h('small','',scene==='triangle'?'סצנה 1 מתוך 2':'סצנה 2 מתוך 2'));
  card.append(h('h2','',data().title));
  const preview=svg.cloneNode(true);preview.removeAttribute('id');preview.setAttribute('aria-hidden','true');preview.querySelectorAll('[tabindex]').forEach(e=>e.removeAttribute('tabindex'));
  const image=h('div','cl-entry-preview');image.append(preview);card.append(image);
  card.append(btn('בואו נבדוק',()=>{overlay=false;curtain.classList.add('cl-entry-leave');root.setTimeout(()=>{curtain.remove();host.querySelector('.cl-prompt')?.focus?.();},260);},'cl-primary'));
  curtain.append(card);document.body.append(curtain);
 }
 function renderReset(){
  host.querySelector('#clResetDialog')?.remove();
  const curtain=h('div','cl-reset-overlay');curtain.id='clResetDialog';curtain.setAttribute('role','dialog');curtain.setAttribute('aria-modal','true');
  const card=h('div','cl-reset-card');card.append(h('h2','','להתחיל מחדש?'),h('p','','הפעילות תתחיל שוב. ההיסטוריה המקומית של שתי הסצנות תתאפס.'));
  card.append(btn('ביטול',()=>{resetOpen=false;curtain.remove();},'cl-secondary'),
   btn('כן, להתחיל מחדש',()=>{current={triangle:tri(),function:func()};scene='triangle';resetOpen=false;overlay=true;store();render();},'cl-primary'));
  curtain.append(card);document.body.append(curtain);
 }
 render();
 root.VizyConceptLensQA={get:()=>JSON.parse(JSON.stringify({scene,current})),roots,truth:currentTruth,choose,hit:tapEvidence,changeInput,lens};
}
root.VizyConceptLens={mount,register:define,scenes:register,roots};
})(window);