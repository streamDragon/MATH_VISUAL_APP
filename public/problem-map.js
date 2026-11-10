(function(){
'use strict';
const $=id=>document.getElementById(id);
const core=window.VizyProblemMapCore;
const problems=window.VizyProblemMaps;
let problem=problems[0],found={},chosenClue=null,chosenOption=null,tries={},firstTry={},certainty={},checkpoint=null;
let tangent=null,before=null,after=null,localChecked=false;
const placeholders={d:'מה השיפוע?',x:'איפה?',y:'כמה גבוה?',kind:'איזה סוג?'};
function save(){}
function updateMeter(){
  const {now,max,reachable}=core.clarity(problem,found);
  $('clarityText').textContent=now+' מתוך '+max;
  $('clarityTrack').setAttribute('aria-valuemax',String(max));
  $('clarityTrack').setAttribute('aria-valuenow',String(now));
  $('clarityFill').style.width=(100*now/max)+'%';
  $('clarityLimit').classList.toggle('hidden',now!==reachable);
  $('clarityLimit').textContent='זה כל מה שאפשר לדעת לפני החישוב. השאר באלגברה, בכיתה.';
}
function node(id){const computed=core.nodeState(problem,found);return computed[id]||{level:0,value:'',from:null};}
function updateNodes(){
  const nodes=core.nodeState(problem,found);
  const map={d:'D',x:'X',y:'Y'};
  for(const [id,suffix] of Object.entries(map)){
    const s=nodes[id],button=document.querySelector('[data-node="'+id+'"]');
    button.classList.toggle('filled',s.level>0);
    $('node'+suffix).textContent=s.value||placeholders[id];
    $('level'+suffix).textContent=core.levels[s.level];
  }
  $('extraNode').classList.toggle('hidden',!problem.extra);
  if(problem.extra){
    const e=nodes[problem.extra.id];$('extraLabel').textContent=problem.extra.label;
    $('extraValue').textContent=e.value||placeholders.kind;$('extraLevel').textContent=core.levels[e.level];
  }
  for(const id of ['D','X','Y'])$('edge'+id).classList.toggle('linked',id==='D'?nodes.d.level>0:id==='X'?nodes.x.level>0:nodes.y.level>0);
  const links=(problem.links||[]).filter(link=>link.needs.every(id=>found[id]));
  $('mapLinks').replaceChildren();
  for(const link of links){
    const line=document.createElement('p');line.textContent=link.text+' · '+link.note;
    line.setAttribute('dir','auto');$('mapLinks').append(line);
  }
  updateMeter();
}
function describeNode(id){
  const s=node(id);
  if(!s.level){$('conceptNote').textContent=placeholders[id]+' חפשו בשאלה חלק שמדבר על זה.';return;}
  const clue=problem.clues[s.from];
  $('conceptNote').textContent=s.value+' · '+core.levels[s.level]+' · '+(clue?.why||'');
}
function renderQuestion(){
  $('questionTitle').textContent='מה אפשר ללמוד מתוך השאלה?';
  $('problemText').replaceChildren();
  for(const part of problem.text){
    if(!part.clue){const span=document.createElement('span');span.textContent=part.t;if(part.ltr)span.dir='ltr';$('problemText').append(span);continue;}
    const b=document.createElement('button');
    b.type='button';b.className='phrase'+(found[part.clue]?' found':'');
    b.dataset.phrase=part.clue;b.textContent=part.t;
    b.setAttribute('aria-expanded',String(chosenClue===part.clue));
    if(part.ltr)b.dir='ltr';
    b.addEventListener('click',()=>openClue(part.clue));
    $('problemText').append(b);
  }
}
function optionsFor(clueId){
  const values=problem.clues[clueId].options.slice();
  const shift=Object.keys(problem.clues).indexOf(clueId)%values.length;
  return values.slice(shift).concat(values.slice(0,shift));
}
function openClue(id){
  chosenClue=id;chosenOption=null;
  renderQuestion();
  $('cluePanel').classList.remove('hidden');
  $('clueQuestion').textContent=problem.clues[id].question;
  $('clueOptions').replaceChildren();
  $('clueCertainty').classList.add('hidden');
  if(found[id]){
    $('clueFeedback').textContent=problem.clues[id].why;
    $('clueFeedback').className='feedback success';return;
  }
  $('clueFeedback').textContent='';
  for(const option of optionsFor(id)){
    const button=document.createElement('button');button.type='button';button.textContent=option.label;
    if(/[=′²³]/.test(option.label))button.dir='auto';
    button.addEventListener('click',()=>evaluateOption(option));
    $('clueOptions').append(button);
  }
  const unknown=document.createElement('button');unknown.type='button';unknown.textContent='עוד לא יודעים';
  unknown.addEventListener('click',()=>{
    $('clueFeedback').textContent='חפשו במפה: לאיזה מושג המילים האלה קשורות?';
  });$('clueOptions').append(unknown);
}
const calibrationText={
  'sure-right':'בטוחים, וצדקתם.',
  'maybe-right':'צדקתם גם בלי ביטחון.',
  'sure-wrong':'הייתם בטוחים, אבל זה לא נכון. בואו נבדוק עוד פעם.',
  'maybe-wrong':'טוב שלא הייתם בטוחים. זה חלק מלמידה.'
};
function evaluateOption(option){
  if(!chosenClue||found[chosenClue])return;
  chosenOption=option;
  const section=$('clueCertainty');section.replaceChildren();section.classList.remove('hidden');
  const label=document.createElement('p');label.textContent='כמה בטוחים?';section.append(label);
  for(const [value,title] of [['maybe','חושבים שכן'],['sure','בטוחים']]){
    const btn=document.createElement('button');btn.type='button';btn.textContent=title;
    btn.dataset.certaintyChoice=value;btn.addEventListener('click',()=>finishAttempt(value));section.append(btn);
  }
  $('clueFeedback').textContent='';
}
function finishAttempt(confidence){
  if(!chosenOption||!chosenClue)return;
  const id=chosenClue,option=chosenOption,ok=Boolean(option.right);
  tries[id]=(tries[id]||0)+1;
  if(!(id in firstTry)){firstTry[id]=ok;certainty[id]=confidence;}
  const compare=core.calibration(confidence,ok);
  const result=ok?problem.clues[id].why:(option.feedback||'עוד ניסיון. חפשו מה המילים נותנות.');
  $('clueFeedback').textContent=result+'\n'+calibrationText[compare];
  $('clueFeedback').className='feedback '+(ok?'success':'error');
  $('clueCertainty').classList.add('hidden');chosenOption=null;
  if(ok){
    found[id]=true;$('clueOptions').replaceChildren();renderQuestion();updateNodes();
  }
  save();
}
function draw(){
  const t=tangent,b=before,a=after;let curve='',line='',label='';
  const ready=Boolean(t&&(t!=='flat'||(b&&a)));
  if(t==='up'){curve='M35 185 C85 156 126 127 170 111 S266 64 310 24';line='M90 147 L250 75';label='המשיק עולה. אין כאן קיצון עם משיק אופקי.';}
  else if(t==='down'){curve='M35 25 C85 52 126 87 170 111 S266 156 310 185';line='M90 75 L250 147';label='המשיק יורד. אין כאן קיצון עם משיק אופקי.';}
  else if(t==='flat'){
    line='M90 111 L250 111';
    if(b&&a){
      const left=b==='up'?195:25,right=a==='up'?25:195;
      curve=b===a?(b==='up'?'M35 194 C90 158 140 111 170 111 C200 111 250 66 310 28':'M35 28 C90 66 140 111 170 111 C200 111 250 158 310 194'):'M35 '+left+' Q108 111 170 111 Q232 111 310 '+right;
      label=b==='up'&&a==='down'?'מקסימום מקומי: קודם עולה ואחר כך יורדת.':b==='down'&&a==='up'?'מינימום מקומי: קודם יורדת ואחר כך עולה.':'משיק אופקי אינו מבטיח קיצון: הכיוון לא התחלף.';
    }
  }
  $('curve').setAttribute('d',curve);$('tangent').setAttribute('d',line);
  $('localVerdict').textContent=ready?label:t==='flat'?'בחרו מה קורה לפני הנקודה ואחריה.':'בחרו קודם את כיוון המשיק.';
  $('checkLocal').disabled=!ready;
  $('beforeControls').classList.toggle('hidden',t!=='flat');$('afterControls').classList.toggle('hidden',t!=='flat');
  for(const [group,value] of [['tangent',t],['before',b],['after',a]]){
    document.querySelectorAll('[data-'+group+']').forEach(el=>el.setAttribute('aria-pressed',String(el.dataset[group]===value)));
  }
}
function localChoice(group,value){if(group==='tangent')tangent=value;if(group==='before')before=value;if(group==='after')after=value;draw();save();}
function updateCheckpoint(){
  document.querySelectorAll('[data-checkpoint]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.checkpoint===checkpoint)));
  const labels={tangent:'המשיק נותן לנו מידע מקומי, לא את כל הגרף.',graph:'חלק קטן יכול להספיק כדי להבין התנהגות ליד נקודה.',algebra:'המפה מבהירה מה רוצים לחשב; הפתרון המלא ממשיך בכיתה.',unsure:'זה בסדר לא לדעת עדיין. בחרו קשר אחד שאפשר לבדוק.'};
  $('checkpointSummary').textContent=labels[checkpoint]||'בחרו נקודת עצירה. אפשר לשמור אותה לתרגול הבא.';
}
function summary(){
  const states=core.nodeState(problem,found);
  const bits=Object.entries(states).map(([id,s])=>id+': '+(s.value||'עוד לא')+' ('+core.levels[s.level]+')');
  return 'Vizy | מפת השאלה\n'+problem.text.map(part=>part.t).join('')+'\n'+bits.join('\n')+'\nמה נשאר לכיתה: '+problem.openForClass;
}
async function share(){const text=summary();if(navigator.share){try{await navigator.share({title:'Vizy | מפת השאלה',text});return;}catch(e){if(e.name==='AbortError')return;}}
 try{await navigator.clipboard.writeText(text);$('checkpointSummary').textContent='הכרטיס הועתק. אפשר להדביק אותו למורה.';}catch{$('checkpointSummary').textContent=text;}}
function renderAll(){
  renderQuestion();updateNodes();draw();updateCheckpoint();$('localCard').classList.toggle('hidden',problem.local!=='extremum');
}
function init(){
  document.querySelectorAll('[data-node]').forEach(b=>b.addEventListener('click',()=>describeNode(b.dataset.node)));
  document.querySelectorAll('[data-tangent]').forEach(b=>b.addEventListener('click',()=>localChoice('tangent',b.dataset.tangent)));
  document.querySelectorAll('[data-before]').forEach(b=>b.addEventListener('click',()=>localChoice('before',b.dataset.before)));
  document.querySelectorAll('[data-after]').forEach(b=>b.addEventListener('click',()=>localChoice('after',b.dataset.after)));
  document.querySelectorAll('[data-checkpoint]').forEach(b=>b.addEventListener('click',()=>{checkpoint=b.dataset.checkpoint;updateCheckpoint();save();}));
  $('checkLocal').addEventListener('click',()=>{
    localChecked=true;
    $('localCheck').textContent=tangent!=='flat'?'כדי לזהות קיצון גזיר בחרו משיק אופקי, ואז בדקו את שני הצדדים.':before===after?'המשיק אופקי, אבל אין החלפת כיוון. ייתכן שזו נקודת פיתול.':'נכון כסוג של התנהגות מקומית. כדי לדעת איזו נקודה זו בפונקציה הנתונה נצטרך לחשב ולבדוק סימנים.';
    save();
  });
  $('shareCard').addEventListener('click',share);
  $('resetAll').addEventListener('click',()=>location.reload());
  renderAll();
}
document.addEventListener('DOMContentLoaded',init);
})();