(()=>{'use strict';
const $=id=>document.getElementById(id),core=window.VizyProblemMapCore,p=window.VizyProblemMaps[0],KEY='vizy_problem_map_v2';
const roles={object:'עצם',relation:'יחס',instruction:'הוראה'};
const blankBridge=()=>({step:0,complete:{},firstTry:{},attempts:{},sawSketch:false,sketchOpen:false,feedback:''});
const blankEquation=()=>({step:0,complete:{},attempts:{},feedback:'',hintOpen:false});
const blankFoundation=()=>({selected:'negative-derivative',complete:{},attempts:{},feedback:''});
const state={tab:'identify',roles:{},picture:null,algebra:null,visualCurve:null,lowPoint:0,answers:{},checkpoint:null,bridge:blankBridge(),equation:blankEquation(),foundation:blankFoundation()};
try{const stored=JSON.parse(localStorage.getItem(KEY)||'null');if(stored&&stored.problemId===p.id){Object.assign(state,{tab:stored.tab||'identify',roles:stored.roles||{},picture:stored.picture??null,algebra:stored.algebra??null,visualCurve:stored.visualCurve??null,lowPoint:Number.isFinite(stored.lowPoint)?stored.lowPoint:0,answers:stored.answers||{},checkpoint:stored.checkpoint||null,bridge:{...blankBridge(),...(stored.bridge||{})},equation:{...blankEquation(),...(stored.equation||{})},foundation:{...blankFoundation(),...(stored.foundation||{})}});}}catch{}
let currentPhrase=null;
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify({problemId:p.id,...state}))}catch{}};
const el=(tag,cls,text)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(text!=null)n.textContent=text;return n};
function paint(){
 const fields=core.fieldState(p,state);
 fields.forEach(f=>{const target=document.querySelector('[data-field="'+f.id+'"]');$('value-'+f.id).textContent=f.value;$('label-'+f.id).textContent=f.label;target.dataset.source=f.source||'unknown';});
 const statements=core.inferredSummary(p,state);
 if(core.isOnLine(state.lowPoint,2,0.08))statements.unshift('בציור: נשארה פרבולה אחת');
 $('inferredSummary').textContent=statements.length?statements.join(' · '):'עוד כלום.';
 document.querySelectorAll('[data-phrase]').forEach(b=>{
  const id=b.dataset.phrase,done=state.roles[id]===true,source=p.phrases[id].source;
  b.classList.toggle('done',done);b.dataset.source=done?source:'unknown';b.dataset.role=done?p.phrases[id].role:'unknown';
  b.setAttribute('aria-pressed',String(done));
  b.dataset.marker=done&&p.phrases[id].role==='object'?(source==='given'?'●':source==='asked'?'○':''):'';
 });
 document.querySelectorAll('[data-tab]').forEach(b=>{const active=b.dataset.tab===state.tab;b.setAttribute('aria-selected',String(active));});
 for(const [tab,id] of [['identify','identifyView'],['represent','representView'],['infer','inferView']]){$(id).classList.toggle('hidden',state.tab!==tab);}
 document.querySelectorAll('[data-checkpoint]').forEach(b=>b.setAttribute('aria-pressed',String(state.checkpoint===b.dataset.checkpoint)));
 $('checkpointSummary').textContent=state.checkpoint?'נשמרה נקודת העצירה. ממשיכים מהמצב הזה גם לאחר רענון.':'בחרו איפה כדאי לעצור.';
}
function roleFeedback(text){$('roleFeedback').textContent=text}
function openPhrase(id){
 currentPhrase=id;window.dispatchEvent(new CustomEvent('vizy:focus',{detail:{id}}));$('rolePanel').classList.remove('hidden');
 $('roleQuestion').textContent='מה התפקיד של "'+(p.text.find(x=>x.phrase===id)?.t||id)+'"?';
 $('roleOptions').replaceChildren();
 for(const [role,label] of Object.entries(roles)){
  const btn=el('button','role-choice',label);btn.type='button';btn.dataset.roleChoice=role;
  btn.onclick=()=>{
   if(core.isRoleCorrect(p,id,role)){state.roles[id]=true;roleFeedback(p.phrases[id].ok);save();paint();}
   else roleFeedback(p.roleError);
  };
  $('roleOptions').append(btn);
 }
 roleFeedback(state.roles[id]?'כבר זיהיתם את התפקיד.': '');
}
function drawText(){
 const host=$('problemText');host.replaceChildren();
 for(const part of p.text){if(!part.phrase){const s=el('span','',part.t);host.append(s);continue;}
  const b=el('button','phrase',part.t);b.type='button';b.dataset.phrase=part.phrase;
  if(part.phrase==='fn'){b.dir='rtl';b.classList.add('mixed-phrase');const h=el('span','hebrew-term','הפונקציה');const math=el('span','math-term','f(x) = x² + ax');math.dir='ltr';b.replaceChildren(h,math);}else if(part.ltr)b.dir='ltr';b.onclick=()=>openPhrase(part.phrase);host.append(b);
 }
}
function sketchSvg(id){
 const ns='http://www.w3.org/2000/svg';
 const svg=document.createElementNS(ns,'svg');svg.setAttribute('viewBox','0 0 180 126');
 svg.setAttribute('role','img');svg.setAttribute('aria-label',p.represent.pictures.find(x=>x.id===id).aria);
 const make=(tag,attrs,text)=>{const node=document.createElementNS(ns,tag);for(const [k,v]of Object.entries(attrs))node.setAttribute(k,String(v));if(text!=null)node.textContent=text;svg.append(node);return node;};
 make('path',{d:'M12 93H168 M36 12V115',stroke:'#9ab2c6','stroke-width':1.5,fill:'none'});
 make('path',{d:'M108 13V106',stroke:'#e49e43','stroke-dasharray':'4 4','stroke-width':1.5});
 make('text',{x:108,y:118,'font-size':12,'text-anchor':'middle',fill:'#9c601b'},'2');
 if(id==='flat'){
  make('path',{d:'M48 18 Q108 123 167 18',stroke:'#178c9b','stroke-width':3.4,fill:'none'});
  make('path',{d:'M72 70H145',stroke:'#e49e43','stroke-width':2.7});
  make('circle',{cx:108,cy:70.5,r:4.5,fill:'#178c9b',stroke:'#fff','stroke-width':1.5});
 }else if(id==='rising'){
  make('path',{d:'M47 113 Q74 69 167 15',stroke:'#5386dd','stroke-width':3.4,fill:'none'});
  make('path',{d:'M84 65L137 35',stroke:'#e49e43','stroke-width':2.7});
 }else{
  make('path',{d:'M17 15 Q66 123 115 15',stroke:'#a47cde','stroke-width':3.4,fill:'none'});
  make('circle',{cx:66,cy:69,r:4,fill:'#a47cde'});
 }
 return svg;
}
function renderFamily(){
 const host=$('familyGraph');host.replaceChildren();
 const ns='http://www.w3.org/2000/svg';
 const svg=document.createElementNS(ns,'svg');
 svg.setAttribute('viewBox','0 0 320 170');
 svg.setAttribute('aria-hidden','true');
 const node=(tag,attrs)=>{const element=document.createElementNS(ns,tag);Object.entries(attrs).forEach(([key,value])=>element.setAttribute(key,String(value)));svg.append(element);return element;};
 node('path',{d:'M12 113H308 M160 12V156',fill:'none',stroke:'#a6b8cb','stroke-width':1.5,'stroke-dasharray':'5 5'});
 const xToPx=x=>160+x*32,yToPx=y=>134-y*6.6;
 for(const [a,color] of [[-2,'#5f9cde'],[0,'#32ab91'],[2,'#8d8aca']]){
  const parts=[];
  for(let x=-4;x<=4.001;x+=.1){const y=x*x+a*x;parts.push((parts.length?'L':'M')+xToPx(x).toFixed(1)+' '+yToPx(y).toFixed(1));}
  node('path',{d:parts.join(' '),stroke:color,'stroke-width':3.2,'stroke-linecap':'round',fill:'none'});
 }
 host.append(svg);
}
function renderRepresentation(){
 renderFamily();
 $('representIntro').textContent=p.represent.intro;
 $('pictureChoices').replaceChildren();
 for(const option of p.represent.pictures){
  const b=el('button','picture-option');b.type='button';b.dataset.picture=option.id;b.append(sketchSvg(option.id));const s=el('span','',option.aria);b.append(s);
  b.setAttribute('aria-pressed',String(state.picture===option.id));
  b.onclick=()=>{if(option.right){state.picture=option.id;$('pictureFeedback').textContent=p.represent.pictureRight;}else{$('pictureFeedback').textContent=p.represent.pictureWrong;}save();renderRepresentation();};
  $('pictureChoices').append(b);
 }
 $('algebraChoices').replaceChildren();
 for(const option of p.represent.algebra){
  const b=el('button','algebra-option',option.text);b.type='button';b.dir='ltr';b.setAttribute('aria-pressed',String(state.algebra===option.text));
  b.onclick=()=>{if(option.right){window.dispatchEvent(new CustomEvent('vizy:focus',{detail:{id:'derivative'}}));state.algebra=option.text;$('algebraFeedback').textContent=p.represent.algebraRight;}else{$('algebraFeedback').textContent=p.represent.algebraWrong;}save();renderRepresentation();};
  $('algebraChoices').append(b);
 }
 if(state.picture)$('pictureFeedback').textContent=p.represent.pictureRight;
 if(state.algebra)$('algebraFeedback').textContent=p.represent.algebraRight;
}
function renderInference(){
 $('principle').textContent=p.principle;
 $('claims').replaceChildren();
 for(const claim of p.claims){
  const box=el('div','claim');box.dataset.claim=claim.id;box.append(el('h3','',claim.text));
  const choices=el('div','claim-choices');
  p.answerLabels.forEach((label,index)=>{
   const b=el('button','claim-answer',label);b.type='button';b.dataset.answerIndex=String(index);b.setAttribute('aria-pressed',String(state.answers[claim.id]===true&&claim.right===index));
   b.onclick=()=>{
    const correct=core.isClaimCorrect(p,claim.id,index);
    if(correct){state.answers[claim.id]=true;if(claim.id==='c1')window.dispatchEvent(new CustomEvent('vizy:focus',{detail:{id:'derivative'}}));}
    save();paint();renderInference();
    const note=$('claims').querySelector('[data-claim="'+claim.id+'"] .claim-result');
    note.textContent=correct?claim.reason:p.inferenceWrong;
    note.dataset.correct=String(correct);
   };choices.append(b);
  });box.append(choices);
  const note=el('p','claim-result',state.answers[claim.id]?claim.reason:'');box.append(note);$('claims').append(box);
 }
 $('inferEnding').textContent=p.claims.every(c=>state.answers[c.id]===true)?p.inferenceClosing:'אפשר לפתוח את זיהוי או ייצוג בכל רגע.';
}
function bridgeSketch(id){
 const examples={
  slope:'<svg viewBox="0 0 240 110" aria-label="עקומה ומשיק משופע בנקודה"><path d="M15 93H225 M30 12V100" stroke="#99acc2" fill="none"/><path d="M30 86 Q115 73 212 20" stroke="#3979b5" stroke-width="3" fill="none"/><path d="M65 87L180 37" stroke="#dc964c" stroke-width="2.5"/><circle cx="120" cy="64" r="4" fill="#285f9e"/></svg><span>הנגזרת מספרת על שיפוע המשיק, לא על הגובה.</span>',
  necessary:'<svg viewBox="0 0 240 110" aria-label="עקומת x בחזקת שלוש ומשיק אופקי באפס"><path d="M12 55H228 M119 9V102" stroke="#9aadc4" fill="none"/><path d="M30 102C65 99 90 55 119 55S178 11 211 8" fill="none" stroke="#3878b1" stroke-width="3"/><path d="M76 55H162" stroke="#df9a4e" stroke-width="2.5"/><circle cx="119" cy="55" r="4" fill="#1f6689"/></svg><span>ב־x³ השיפוע ב־0 הוא אפס, אבל אין קיצון.</span>',
  'same-point':'<svg viewBox="0 0 240 110" aria-label="שתי פרבולות בעלות קודקוד באותו x ובגבהים שונים"><path d="M15 96H226 M119 8V102" stroke="#a5b4c6" fill="none"/><path d="M54 87Q119 23 184 87" fill="none" stroke="#ab76b3" stroke-width="3"/><path d="M54 57Q119 112 184 57" fill="none" stroke="#2c8eae" stroke-width="3"/><circle cx="119" cy="55" r="3.7" fill="#ab76b3"/><circle cx="119" cy="84" r="3.7" fill="#2c8eae"/></svg><span>אותו x ושיפועים אפס יכולים להיות בגבהים שונים. ״אותה נקודה״ דורשת גם אותו y.</span>'
 };
 return examples[id]||'';
}
function renderBridge(){
 const steps=p.bridgeChecks||[],s=state.bridge;
 if(!steps.length){$('bridgeDrill').classList.add('hidden');return;}
 const i=Math.min(Math.max(0,Number(s.step)||0),steps.length-1);s.step=i;
 const current=steps[i],done=Boolean(s.complete[current.id]);
 $('bridgeProgress').textContent=(i+1)+' מתוך '+steps.length;
 $('bridgeQuestion').textContent=current.title;
 $('bridgeOptions').replaceChildren();
 current.options.forEach((option,index)=>{
  const b=el('button','micro-choice',option.text);b.type='button';
  b.dataset.bridgeAnswer=String(index);
  b.setAttribute('aria-pressed',String(done&&option.right));
  b.disabled=done;
  b.onclick=()=>{
   if(!s.complete[current.id]){
    s.attempts[current.id]=(s.attempts[current.id]||0)+1;
    if(core.isBridgeCorrect(p,current.id,index)){
     s.complete[current.id]=true;
     s.firstTry[current.id]=s.attempts[current.id]===1&&!s.sawSketch;
     s.feedback=current.right;
    }else{s.feedback=current.wrong;}
    save();renderBridge();
   }
  };
  $('bridgeOptions').append(b);
 });
 $('bridgeFeedback').textContent=done?current.right:s.feedback||'';
 $('bridgeFeedback').dataset.status=done?'correct':s.feedback?'retry':'neutral';
 const next=$('bridgeNext');
 next.classList.toggle('hidden',!done);
 next.textContent=i===steps.length-1?'למסלול המשוואות (רשות)':'הקשר הבא';
 $('bridgeSketch').innerHTML=s.sketchOpen?bridgeSketch(current.id):'';
 $('bridgeSketch').classList.toggle('hidden',!s.sketchOpen);
 $('bridgeShowSketch').textContent=s.sketchOpen?'להסתיר ציור':'עזרה בציור (רשות)';
}
function renderEquationLab(){
 const lab=p.equationLab,s=state.equation;
 if(!lab){$('equationLab').classList.add('hidden');return;}
 $('equationDefinitions').replaceChildren();
 lab.definitions.forEach(t=>{const b=el('div','function-definition',t);b.dir='ltr';$('equationDefinitions').append(b);});
 const steps=lab.steps,i=Math.max(0,Math.min(steps.length-1,Number(s.step)||0));s.step=i;
 const step=steps[i],completed=Boolean(s.complete[step.id]);
 $('equationProgress').textContent='שלב '+(i+1)+' מתוך '+steps.length;
 $('equationQuestion').textContent=step.title;
 $('equationOptions').replaceChildren();
 step.options.forEach((option,index)=>{
  const b=el('button','micro-choice',option.text);b.type='button';b.dataset.equationAnswer=String(index);
  b.disabled=completed;b.setAttribute('aria-pressed',String(completed&&option.right));
  b.onclick=()=>{
   if(!s.complete[step.id]){
    s.attempts[step.id]=(s.attempts[step.id]||0)+1;
    if(core.isEquationCorrect(p,step.id,index)){s.complete[step.id]=true;s.feedback=step.right;}
    else{s.feedback=step.wrong;}
    save();renderEquationLab();
   }
  };
  $('equationOptions').append(b);
 });
 const scratch=$('equationScratch');scratch.replaceChildren();
 const earned=steps.filter(x=>s.complete[x.id]);
 if(earned.length){
  const heading=el('strong','', 'התנאים שחילצנו עד עכשיו:');scratch.append(heading);
  for(const s of earned){const line=el('div','earned-equation',s.earned);line.dir='ltr';scratch.append(line);}
 }else scratch.append(el('p','micro-note','בשלב הזה אנחנו רק בוחרים מה מהנתונים הופך לתנאי מתמטי.'));
 $('equationFeedback').textContent=completed?step.right:s.feedback||'';
 $('equationFeedback').dataset.status=completed?'correct':s.feedback?'retry':'neutral';
 $('equationNext').classList.toggle('hidden',!completed);
 $('equationNext').textContent=i===steps.length-1?'סיימנו להכין משוואות':'השלב הבא';
 $('equationWhyText').textContent=lab.height;
 $('equationWhyText').classList.toggle('hidden',!s.hintOpen);
 if(earned.length===steps.length){$('equationFeedback').textContent=lab.final+' '+step.right;}
}

function renderFoundation(){
 const skills=p.foundations||[],s=state.foundation;
 if(!skills.length){$('foundationLab').classList.add('hidden');return;}
 const selected=skills.find(x=>x.id===s.selected)||skills[0];s.selected=selected.id;
 $('foundationPickers').replaceChildren();
 for(const skill of skills){
  const b=el('button','foundation-picker',skill.title);b.type='button';b.dataset.foundation=skill.id;
  b.setAttribute('aria-pressed',String(skill.id===selected.id));
  const count=skill.rows.filter((row,i)=>s.complete[skill.id+':'+i]).length;
  if(count===skill.rows.length)b.textContent+=' ✓';
  b.onclick=()=>{s.selected=skill.id;s.feedback='';save();renderFoundation();};
  $('foundationPickers').append(b);
 }
 $('foundationIntro').textContent=selected.intro;
 const rowIndex=Math.max(0,Math.min(selected.rows.length-1,Number(s[selected.id+':step'])||0));
 s[selected.id+':step']=rowIndex;
 const row=selected.rows[rowIndex],key=selected.id+':'+rowIndex,done=Boolean(s.complete[key]);
 $('foundationRows').replaceChildren();
 const prior=[selected.initial,...selected.rows.filter((r,i)=>s.complete[selected.id+':'+i]).map(r=>r.earned)];
 for(const [i,line] of prior.entries()){
  const e=el('div','foundation-line',line);e.dir='ltr';
  e.dataset.row=String(i);$('foundationRows').append(e);
 }
 $('foundationQuestion').textContent=row.prompt;
 $('foundationOptions').replaceChildren();
 row.options.forEach((opt,index)=>{
  const b=el('button','micro-choice',opt.text);
  b.type='button';b.dataset.foundationAnswer=String(index);b.disabled=done;
  b.setAttribute('aria-pressed',String(done&&opt.right));
  b.onclick=()=>{
   if(s.complete[key])return;
   s.attempts[key]=(s.attempts[key]||0)+1;
   if(core.isFoundationCorrect(p,selected.id,rowIndex,index)){
    s.complete[key]=true;s.feedback=row.right;
   }else s.feedback=row.wrong;
   save();renderFoundation();
  };$('foundationOptions').append(b);
 });
 $('foundationFeedback').textContent=done?row.right:s.feedback||'';
 $('foundationFeedback').dataset.status=done?'correct':s.feedback?'retry':'neutral';
 const hasNext=rowIndex<selected.rows.length-1;
 $('foundationNext').classList.toggle('hidden',!done||!hasNext);
 $('foundationNext').textContent='עוד שורה, בלי למחוק את הקודמת';
 const finished=selected.rows.every((r,i)=>s.complete[selected.id+':'+i]);
 $('foundationFinish').classList.toggle('hidden',!finished);
 $('foundationFinish').textContent=finished?'השלמתם את המיומנות הזאת. אפשר לעבור למיומנות אחרת; אין חובה לצייר או לפתור את השאלה המלאה.':'';
}

function shareText(){
 const fields=core.fieldState(p,state),done=core.inferredSummary(p,state);
 if(core.isOnLine(state.lowPoint,2,0.08))done.unshift('בציור: נשארה פרבולה אחת');
 return 'Vizy | מפת השאלה\n'+p.text.map(x=>x.t).join('')+
 '\n'+fields.map(f=>f.symbol+': '+f.value+' ('+f.label+')').join('\n')+
 '\nהסקנו עד כה: '+(done.join(' · ')||'עדיין לא')+'\n'+p.inferenceClosing;
}
function setup(){
 $('determined').textContent=p.summaryDetermined;drawText();
 $('roleHint').onclick=()=>roleFeedback('רמז: זו מילה מסוג '+roles[p.phrases[currentPhrase]?.role||'object']+'.');
 $('bridgeShowSketch').onclick=()=>{
  state.bridge.sketchOpen=!state.bridge.sketchOpen;
  if(state.bridge.sketchOpen)state.bridge.sawSketch=true;
  save();renderBridge();
 };
 $('bridgeNext').onclick=()=>{
  const steps=p.bridgeChecks||[],s=state.bridge,current=steps[s.step];
  if(!current||!s.complete[current.id])return;
  if(s.step===steps.length-1){
   const lab=$('equationLab');lab.open=true;lab.scrollIntoView({behavior:'smooth',block:'start'});
  }else{
   s.step++;s.feedback='';s.sketchOpen=false;save();renderBridge();
  }
 };
 $('equationNext').onclick=()=>{
  const lab=p.equationLab,s=state.equation,current=lab.steps[s.step];
  if(!s.complete[current.id])return;
  if(s.step<lab.steps.length-1){s.step++;s.feedback='';save();renderEquationLab();}
  else{state.checkpoint='algebra';save();paint();$('equationFeedback').textContent=lab.final;}
 };
 $('equationWhy').onclick=()=>{
  state.equation.hintOpen=!state.equation.hintOpen;save();renderEquationLab();
 };
 window.addEventListener('vizy:open-skill',e=>{
  const skill=e.detail?.skillId||'negative-derivative';
  state.tab='infer';save();paint();
  if(skill==='equations'){
   const el=$('equationLab');el.open=true;el.scrollIntoView({behavior:'smooth',block:'start'});
   return;
  }
  if(!(p.foundations||[]).some(s=>s.id===skill))return;
  state.foundation.selected=skill;save();renderFoundation();
  const el=$('foundationLab');el.open=true;el.scrollIntoView({behavior:'smooth',block:'start'});
 });
 $('foundationNext').onclick=()=>{
  const s=state.foundation,skill=p.foundations.find(x=>x.id===s.selected);
  if(!skill)return;
  const index=Number(s[skill.id+':step'])||0;
  if(!s.complete[skill.id+':'+index]||index>=skill.rows.length-1)return;
  s[skill.id+':step']=index+1;s.feedback='';save();renderFoundation();
 };

 window.addEventListener('vizy:visual-position',e=>{state.lowPoint=Number.isFinite(e.detail?.x)?e.detail.x:0;save();paint();});
 document.querySelectorAll('[data-tab]').forEach(b=>b.onclick=()=>{state.tab=b.dataset.tab;save();paint()});
 document.querySelectorAll('[data-checkpoint]').forEach(b=>b.onclick=()=>{state.checkpoint=b.dataset.checkpoint;save();paint()});
 $('shareCard').onclick=async()=>{const text=shareText();try{if(navigator.share){await navigator.share({title:'Vizy | מפת השאלה',text});return;}}catch(e){if(e.name==='AbortError')return;}
 try{await navigator.clipboard.writeText(text);$('checkpointSummary').textContent='כרטיס המפה הועתק.';}catch{$('checkpointSummary').textContent=text;}};
 $('resetAll').onclick=()=>{state.roles={};state.picture=null;state.algebra=null;state.visualCurve=null;state.lowPoint=0;state.answers={};state.checkpoint=null;state.bridge=blankBridge();state.equation=blankEquation();state.foundation=blankFoundation();state.tab='identify';save();$('rolePanel').classList.add('hidden');$('pictureFeedback').textContent='';$('algebraFeedback').textContent='';paint();renderRepresentation();renderInference();renderBridge();renderEquationLab();renderFoundation()};
 renderRepresentation();renderInference();renderBridge();renderEquationLab();renderFoundation();paint();
}
document.addEventListener('DOMContentLoaded',setup);
})();