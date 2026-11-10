(()=>{'use strict';
const $=id=>document.getElementById(id),core=window.VizyProblemMapCore,p=window.VizyProblemMaps[0],KEY='vizy_problem_map_v2';
const roles={object:'עצם',relation:'יחס',instruction:'הוראה'},state={tab:'identify',roles:{},picture:null,algebra:null,visualCurve:null,answers:{},checkpoint:null};
try{const stored=JSON.parse(localStorage.getItem(KEY)||'null');if(stored&&stored.problemId===p.id){Object.assign(state,{tab:stored.tab||'identify',roles:stored.roles||{},picture:stored.picture??null,algebra:stored.algebra??null,visualCurve:stored.visualCurve??null,answers:stored.answers||{},checkpoint:stored.checkpoint||null});}}catch{}
let currentPhrase=null;
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify({problemId:p.id,...state}))}catch{}};
const el=(tag,cls,text)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(text!=null)n.textContent=text;return n};
function paint(){
 const fields=core.fieldState(p,state);
 fields.forEach(f=>{const target=document.querySelector('[data-field="'+f.id+'"]');$('value-'+f.id).textContent=f.value;$('label-'+f.id).textContent=f.label;target.dataset.source=f.source||'unknown';});
 const statements=core.inferredSummary(p,state);
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
 currentPhrase=id;$('rolePanel').classList.remove('hidden');
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
  if(part.ltr)b.dir='ltr';b.onclick=()=>openPhrase(part.phrase);host.append(b);
 }
}
function sketchSvg(id){
 const ns='http://www.w3.org/2000/svg';
 const svg=document.createElementNS(ns,'svg');svg.setAttribute('viewBox','0 0 180 126');
 svg.setAttribute('role','img');svg.setAttribute('aria-label',p.represent.pictures.find(x=>x.id===id).aria);
 const make=(tag,attrs,value)=>{const n=document.createElementNS(ns,tag);for(const [k,v]of Object.entries(attrs))n.setAttribute(k,String(v));if(value!=null)n.textContent=value;svg.append(n);return n};
 make('path',{d:'M13 100 H166 M35 10 V111',stroke:'#aebacf','stroke-width':1.4,fill:'none'});
 make('path',{d:'M106 99 V104',stroke:'#33476d','stroke-width':2});
 make('text',{x:106,y:118,'font-size':12,'text-anchor':'middle',fill:'#32466b'},'2');
 if(id==='flat'){
  make('path',{d:'M57 83 Q106 22 156 83',stroke:'#8b77c6','stroke-width':3,fill:'none','stroke-dasharray':'5 4'});
  make('path',{d:'M57 31 Q106 94 156 31',stroke:'#377fba','stroke-width':3,fill:'none','stroke-dasharray':'5 4'});
  make('path',{d:'M69 62.5 H145',stroke:'#d48c56','stroke-width':2.8,fill:'none'});
  make('circle',{cx:106,cy:62.5,r:4,fill:'#317cbd'});
 }else if(id==='rising'){
  make('path',{d:'M53 91 Q97 72 157 18',stroke:'#317cbd','stroke-width':3,fill:'none'});
  make('path',{d:'M73 77 L143 36',stroke:'#d48c56','stroke-width':2.8});
 }else{
  make('path',{d:'M53 91 Q106 58 158 30',stroke:'#317cbd','stroke-width':3,fill:'none'});
  make('circle',{cx:106,cy:60,r:4,fill:'#317cbd'});
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
  b.onclick=()=>{if(option.right){state.algebra=option.text;$('algebraFeedback').textContent=p.represent.algebraRight;}else{$('algebraFeedback').textContent=p.represent.algebraWrong;}save();renderRepresentation();};
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
    if(correct)state.answers[claim.id]=true;
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
function shareText(){
 const fields=core.fieldState(p,state),done=core.inferredSummary(p,state);
 return 'Vizy | מפת השאלה\n'+p.text.map(x=>x.t).join('')+
 '\n'+fields.map(f=>f.symbol+': '+f.value+' ('+f.label+')').join('\n')+
 '\nהסקנו עד כה: '+(done.join(' · ')||'עדיין לא')+'\n'+p.inferenceClosing;
}
function setup(){
 $('determined').textContent=p.summaryDetermined;drawText();
 $('roleHint').onclick=()=>roleFeedback('רמז: זו מילה מסוג '+roles[p.phrases[currentPhrase]?.role||'object']+'.');
 window.addEventListener('vizy:visual-choice',e=>{state.visualCurve=e.detail?.id||null;save();});
 document.querySelectorAll('[data-tab]').forEach(b=>b.onclick=()=>{state.tab=b.dataset.tab;save();paint()});
 document.querySelectorAll('[data-checkpoint]').forEach(b=>b.onclick=()=>{state.checkpoint=b.dataset.checkpoint;save();paint()});
 $('shareCard').onclick=async()=>{const text=shareText();try{if(navigator.share){await navigator.share({title:'Vizy | מפת השאלה',text});return;}}catch(e){if(e.name==='AbortError')return;}
 try{await navigator.clipboard.writeText(text);$('checkpointSummary').textContent='כרטיס המפה הועתק.';}catch{$('checkpointSummary').textContent=text;}};
 $('resetAll').onclick=()=>{state.roles={};state.picture=null;state.algebra=null;state.visualCurve=null;state.answers={};state.checkpoint=null;state.tab='identify';save();$('rolePanel').classList.add('hidden');$('pictureFeedback').textContent='';$('algebraFeedback').textContent='';paint();renderRepresentation();renderInference()};
 renderRepresentation();renderInference();paint();
}
document.addEventListener('DOMContentLoaded',setup);
})();