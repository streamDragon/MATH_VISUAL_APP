(()=>{'use strict';
const host=document.getElementById('coreFlow');
const lessons=window.VizyLayeredLessons,core=window.VizyLayerFlowCore;
if(!host||!lessons||!core)return;
lessons.push(...(window.VizyWeaveLessons||[]));
const $=id=>host.querySelector('#'+id);
const item=(tag,cls,value)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(value!=null)e.textContent=value;return e};
const KEY='vizy_layered_flow_v1_',SELECTOR='vizy_layered_flow_selected';
const qp=new URLSearchParams(location.search).get('lesson');
let selected=lessons.find(x=>x.id===qp)||(function(){try{return lessons.find(x=>x.id===localStorage.getItem(SELECTOR));}catch{return null;}})()||lessons[0];
let current=load(selected);
function load(lesson){
 try{return core.normalize(lesson,JSON.parse(localStorage.getItem(KEY+lesson.id)||'null'));}
 catch{return core.createState(lesson);}
}
function save(){
 try{localStorage.setItem(KEY+selected.id,JSON.stringify(current));localStorage.setItem(SELECTOR,selected.id);}catch{}
}
function graph(lesson,s){
 const keys=new Set(s.entries.map(x=>x.id));
 const pair=lesson.id==='shared',xKnown=pair?keys.has('isolate'):true;
 const tangent=pair?keys.has('slopes'):keys.has('extremum-rule');
 const common=pair?keys.has('same-point'):keys.has('point');
 const xLabel=pair?(xKnown?'x = 2':'x₀'):'x = 2';
 const yLabel=pair?'y₀':'f(2)';
 const graphics=pair
  ? '<path d="M36 24 Q160 202 284 24" fill="none" stroke="#5d75cf" stroke-width="3.5"/><path d="M36 202 Q160 24 284 202" fill="none" stroke="#1e9a90" stroke-width="3.5"/><text x="42" y="21" fill="#5269b3" font-size="11">f</text><text x="285" y="180" fill="#1c887f" font-size="11">g</text>'
  : '<path d="M38 32 Q164 194 287 32" fill="none" stroke="#287fbb" stroke-width="3.5"/>';
 const line=tangent?'<path d="M112 113H215" stroke="#d58836" stroke-width="3.1" stroke-linecap="round"/>':'';
 const point=common?'<circle cx="161" cy="113" r="5.5" stroke="#fff" stroke-width="2" fill="#b16eae"/>':'<circle cx="161" cy="113" r="5" stroke="#fff" stroke-width="2" fill="#638aaa"/>';
 return '<svg viewBox="0 0 320 216" aria-label="'+(pair?'איור סכמטי של שני משיקים אופקיים בנקודה משותפת; אין קנה מידה':'איור נקודת קיצון מעל x שווה שתיים; הגובה אינו ידוע')+'" role="img" xmlns="http://www.w3.org/2000/svg">'+
  '<rect width="320" height="216" rx="15" fill="#f7fbff"/>'+
  '<path d="M17 171H301 M71 10V203" stroke="#aabbd2" stroke-width="1.5" fill="none"/>'+
  '<path d="M161 13V201" stroke="#c89454" stroke-dasharray="5 5" stroke-width="2"/>'+
  graphics+line+point+
  '<rect x="128" y="181" width="66" height="23" rx="9" fill="#fff0df"/>'+
  '<text x="161" y="197" font-weight="700" font-size="13" fill="#8c5c28" text-anchor="middle">'+xLabel+'</text>'+
  (common?'<text x="175" y="103" font-size="12" font-weight="700" fill="#704c86">'+yLabel+' ?</text>':'')+
  '</svg>';
}
host.innerHTML='<div class="flow-heading"><div><span class="flow-kicker">VIZY · יכולת מתמטית</span><h2 id="flowTitle">מגלים, לא מנחשים</h2><p class="flow-intro">משימה אחת בכל פעם. כל שכבה נשמרת, גם אחרי שמתקדמים.</p></div><span class="flow-stamp">הציור נשאר</span></div>'+
 '<div class="flow-switch" id="flowSwitch" role="group" aria-label="בחירת סוג השאלה"></div>'+
 '<p class="flow-problem" id="flowProblem"></p>'+
 '<div class="flow-graph-shell"><div class="flow-graph-head"><strong>מה אנחנו יודעים על הציור?</strong><small id="flowGraphDescription"></small></div><div id="flowPlot"></div></div>'+
 '<div class="flow-interaction" id="flowInteraction"><div class="flow-phase"><span id="flowPhase"></span><span id="flowProgress"></span></div>'+
 '<h3 id="flowQuestion"></h3><div id="flowOptions" class="flow-options" role="group" aria-label="בחרו מה נכון כעת"></div>'+
 '<p class="flow-feedback" id="flowFeedback" role="status" aria-live="polite"></p>'+
 '<div class="flow-actions"><button id="flowHint" type="button" class="flow-secondary">רמז קטן</button><button id="flowBack" type="button" class="flow-secondary">הקשר הקודם</button><button id="flowNext" type="button">ממשיכים</button></div></div>'+
 '<details open class="flow-history" id="flowHistory"><summary><strong>השכבות ששמרנו</strong><span>לא מוחקים את הדרך</span></summary><div class="flow-rows" id="flowRows"></div></details>'+
 '<div id="flowFinish" class="flow-finish" hidden></div><div class="flow-footer"><button type="button" id="flowReset" class="flow-secondary">התחילו משימה זו מחדש</button></div>'+
 '<section class="flow-errors" id="flowErrors" aria-labelledby="errorTitle"><div class="error-head"><span class="flow-kicker">יכולת חדשה · זיהוי טעויות</span><h2 id="errorTitle">מה הטעות שאתה רואה?</h2><p>קטעי פתרון מומצאים. בודקים אם הטענה נכונה, מסבירים ומתקנים, ואז מנסים דוגמה חדשה.</p></div><div id="errorCardChooser" class="error-card-chooser" role="group" aria-label="בחירת טעות לתרגול"></div><div class="error-sheet" id="errorSheet"><strong id="errorContext"></strong><div id="errorLines"></div></div><div class="error-task"><div class="flow-phase"><span id="errorStage"></span><span id="errorProgress"></span></div><h3 id="errorQuestion"></h3><div id="errorChoices" class="flow-options" role="group" aria-label="בחירת אבחון"></div><p id="errorFeedback" class="flow-feedback" role="status" aria-live="polite"></p><div class="flow-actions"><button id="errorHint" type="button" class="flow-secondary">רמז</button><button id="errorReset" type="button" class="flow-secondary">התחל מחדש</button><button id="errorNext" type="button">לשלב הבא</button></div></div><div id="errorCompare" class="error-compare" hidden></div></section>';
function repaint(){
 document.body.classList.toggle('lesson-weave',selected.type==='weave');
 if(selected.type==='weave'){
  document.body.classList.remove('lesson-shared');
  window.VizyWeave.render(host,selected,lessons);
  return;
 }
 document.body.classList.toggle('lesson-shared',selected.id==='shared');
 const currentStep=selected.steps[current.step],done=current.entries.some(e=>e.id===currentStep.id);
 const allDone=current.entries.length===selected.steps.length;
 $('flowSwitch').replaceChildren();
 for(const lesson of lessons){
  const b=item('button','flow-lesson',lesson.name);b.type='button';b.dataset.flowLesson=lesson.id;
  b.setAttribute('aria-pressed',String(lesson.id===selected.id));
  b.onclick=()=>{selected=lesson;current=load(selected);save();repaint();};
  $('flowSwitch').append(b);
 }
 $('flowTitle').textContent=selected.id==='shared'?'משני גרפים למערכת משוואות':'מהנקודה למשוואה';
 $('flowProblem').textContent=selected.prompt+' '+(selected.id==='shared'?selected.math:'');
 $('flowPlot').innerHTML=graph(selected,current);
 $('flowGraphDescription').textContent=selected.graphLabel;
 $('flowPhase').textContent=currentStep.phase;
 $('flowProgress').textContent='חוליה '+(current.step+1)+' מתוך '+selected.steps.length;
 $('flowQuestion').textContent=currentStep.question;
 $('flowOptions').replaceChildren();
 for(const [index,option] of currentStep.options.entries()){
  const b=item('button','flow-choice',option.label);b.type='button';b.dataset.flowAnswer=String(index);
  b.disabled=done;b.setAttribute('aria-pressed',String(done&&option.correct));
  b.onclick=()=>{
   const result=core.submit(selected,current,index);
   current=result.state;save();repaint();
   if(result.correct)$('flowNext').focus();
  };
  $('flowOptions').append(b);
 }
 $('flowFeedback').textContent=done?currentStep.correctNote:current.feedback||'בחרו תשובה. אפשר להיעזר בציור, אבל חייבים לבחור.';
 $('flowFeedback').dataset.status=done?'correct':current.feedback?'retry':'neutral';
 $('flowBack').disabled=current.step===0;
 $('flowNext').disabled=!done;
 $('flowNext').textContent=allDone?'סיימנו את המסלול':'עוד חוליה';
 $('flowHint').disabled=done;
 $('flowHint').textContent=current.help[currentStep.id]?'כבר ראינו רמז':'רמז קטן';
 $('flowRows').replaceChildren();
 if(!current.entries.length){
  $('flowRows').append(item('p','flow-placeholder','עוד לא חילצנו מידע. אחרי כל בחירה נכונה תתווסף כאן שכבה.'));
 }
 for(const layer of current.entries){
  const row=item('div','flow-layer');row.dataset.layerKind=layer.kind;row.dataset.flowLayer=layer.id;
  const heading=item('strong','',layer.label);
  const math=item('span','flow-layer-value',layer.value);math.dir='ltr';
  row.append(heading,math);
  if(layer.also){const and=item('span','flow-layer-value',layer.also);and.dir='ltr';row.append(and);}
  $('flowRows').append(row);
 }
 const finish=$('flowFinish');finish.replaceChildren();finish.hidden=!allDone;
 if(allDone){
  finish.append(item('strong','', 'הדרך נשמרה. אין צורך למחוק שלבים.'));
  const difficulties=core.needsSupport(selected,current);
  finish.append(item('p','',difficulties.length
   ?'כדאי לחזור לחוליות שבהן נזקקתם לרמז או לניסיון נוסף: '+difficulties.map(x=>x.phase).join(' · ')+'.'
   :'אתם מצליחים להסביר את המעברים בלי עזרה. אפשר להמשיך בחישוב במחברת.'));
  finish.append(item('p','', 'מציאת a הסופית נשארת לעבודה שלכם. המקום x, הגובה והפרמטר אינם אותו דבר.'));
  const hints=[
   {ids:['differentiate','derivatives'],skill:'negative-derivative',label:'לחזק חישוב נגזרת'},
   {ids:['simplify'],skill:'simplify-rows',label:'לתרגל פישוט בשורות'},
   {ids:['two-equations','isolate','where-substitute','substitution'],skill:'equations',label:'לתרגל שתי משוואות'}
  ];
  const helpNeeded=new Set(difficulties.map(x=>x.id));
  for(const hint of hints.filter(h=>h.ids.some(id=>helpNeeded.has(id))).slice(0,2)){
   const btn=item('button','flow-support-button',hint.label);btn.type='button';
   btn.dataset.flowSupport=hint.skill;
   btn.onclick=()=>window.dispatchEvent(new CustomEvent('vizy:open-skill',{detail:{skillId:hint.skill}}));
   finish.append(btn);
  }
 }
}
$('flowHint').onclick=()=>{
 const s=selected.steps[current.step];current=core.help(selected,current);
 current.feedback=s.wrong;save();repaint();
};
$('flowNext').onclick=()=>{
 const prev=current.step;current=core.next(selected,current);save();repaint();
 if(current.step!==prev)$('flowInteraction').scrollIntoView({behavior:'smooth',block:'start'});
};
$('flowBack').onclick=()=>{current=core.previous(selected,current);save();repaint();};
$('flowReset').onclick=()=>{
 current=core.createState(selected);save();repaint();
 $('flowInteraction').scrollIntoView({behavior:'smooth',block:'start'});
};
repaint();

const errorCards=window.VizyErrorCards||[];
const ERROR_KEY='vizy_error_card_v1_';
let errorCard=errorCards[0];
function loadError(card){try{return core.normalizeErrorState(card,JSON.parse(localStorage.getItem(ERROR_KEY+card.id)||'null'));}catch{return core.createErrorState(card);}}
let errorState=errorCard?loadError(errorCard):null;
function saveError(){try{localStorage.setItem(ERROR_KEY+errorCard.id,JSON.stringify(errorState));}catch{}}
function errorHintMessage(card,stage){
 if(stage==='verdict')return 'בדקו אם השורות עצמן שגויות, נכונות אך לא מספיקות, או תקינות.';
 if(stage==='locate')return 'געו בשורה שממנה מתחילה הבעיה, ולא בהכרח בשורה הראשונה.';
 if(stage==='transfer')return 'זה מקרה אחר. האם אותו עיקרון עדיין נכון?';
 if(stage==='repair')return 'חפשו שורה שמתקנת רק את הטעות שזיהיתם.';
 return 'מה המשמעות של הסימן או של התנאי?';
}
function renderError(){
 if(selected.type==='weave')return;
 if(!errorCard){$('flowErrors').hidden=true;return;}
 const card=errorCard,s=errorState,stage=s.stage,finished=stage==='done';
 const stages=['verdict','locate','diagnose','repair','transfer'];
 const index=stages.indexOf(stage);
 $('errorCardChooser').replaceChildren();
 for(const c of errorCards){
  const b=item('button','error-card-picker',c.title);b.type='button';b.dataset.errorCard=c.id;
  b.setAttribute('aria-pressed',String(c.id===card.id));
  try{const t=core.normalizeErrorState(c,JSON.parse(localStorage.getItem(ERROR_KEY+c.id)||'null'));if(t.stage==='done')b.textContent+=' ✓';}catch{}
  b.onclick=()=>{errorCard=c;errorState=loadError(c);renderError();};
  $('errorCardChooser').append(b);
 }
 $('errorContext').textContent=card.context;
 $('errorLines').replaceChildren();
 card.lines.forEach((text,index)=>{
  const line=item('div','error-line',text);line.dir='ltr';line.dataset.errorLine=String(index);
  if(stage==='locate')line.classList.add('error-line-clickable');
  if(s.completed.locate&&index===card.targetLine)line.dataset.errorLocated='true';
  $('errorLines').append(line);
 });
 $('errorStage').textContent=finished?'סיום':'שלב '+(index+1)+' · '+({verdict:'בדיקה',locate:'איתור',diagnose:'הסבר',repair:'תיקון',transfer:'מקרה חדש'}[stage]||'');
 $('errorProgress').textContent=finished?'הושלם':(index+1)+' מתוך 5';
 const prompts={verdict:'מה מצב הפתרון הזה?',locate:'על איזו שורה כדאי להצביע?',diagnose:'מה ההסבר המתמטי?',repair:'איך מתקנים או ממשיכים?',transfer:card.transfer.question,done:'הצלחתם גם במקרה חדש'};
 $('errorQuestion').textContent=prompts[stage];
 const choices=[];
 if(stage==='verdict')choices.push(...[
   {text:'יש כאן טעות',value:'wrong'},
   {text:'נכון, אבל חסר תנאי או שלב',value:'incomplete'},
   {text:'נכון כפי שנכתב',value:'correct'}
 ]);
 if(stage==='locate')card.lines.forEach((t,i)=>choices.push({text:'שורה '+(i+1),value:i}));
 if(stage==='diagnose')card.diagnoses.forEach((o,i)=>choices.push({text:o.text,value:i}));
 if(stage==='repair')card.repairs.forEach((o,i)=>choices.push({text:o.text,value:i}));
 if(stage==='transfer')card.transfer.options.forEach((o,i)=>choices.push({text:o.text,value:i}));
 $('errorChoices').replaceChildren();
 choices.forEach(({text,value})=>{
   const b=item('button','flow-choice',text);b.type='button';b.dataset.errorAnswer=String(value);b.disabled=Boolean(s.completed[stage]);
   b.onclick=()=>{
    const out=core.submitError(card,errorState,value);errorState=out.state;saveError();renderError();
    if(out.correct)$('errorNext').focus();
   };
   $('errorChoices').append(b);
 });
 $('errorFeedback').textContent=finished
  ?'השלמתם אבחון, תיקון והעברה. זו ראיה חזקה יותר מהיכולת לנחש את השורה הנכונה.'
  :s.completed[stage]?(stage==='diagnose'||stage==='repair'||stage==='transfer'?card.why:'נכון. ממשיכים להוכיח את ההבנה.'):s.feedback||'בחרו אפשרות אחת. לא כל קטע מכיל טעות.';
 $('errorFeedback').dataset.status=finished||s.completed[stage]?'correct':s.feedback?'retry':'neutral';
 $('errorHint').disabled=finished||Boolean(s.completed[stage]);
 $('errorNext').disabled=finished||!s.completed[stage];
 $('errorNext').textContent=stage==='transfer'?'סיום':'המשך';
 const compare=$('errorCompare');compare.replaceChildren();compare.hidden=!finished&&!s.completed.repair;
 if(!compare.hidden){
  compare.append(item('strong','', 'שומרים את השורה המקורית לצד התיקון'));
  for(const line of card.lines)compare.append(item('div','error-before',line));
  compare.append(item('div','error-after',card.repairs.find(x=>x.correct).text));
  compare.append(item('p','',card.why));
  if(finished){
   const help=core.errorSupport(card,s);
   compare.append(item('p','',help.length?'נדרשה עזרה ב־'+help.map(x=>x.stage).join(', ')+'. מומלץ עוד ניסיון בהמשך.':'זיהוי ותיקון עצמאיים. כדאי לחזור בהמשך כדי לבדוק שהידע נשמר.'));
  }
 }
}
if(selected.type!=='weave'){
 $('errorHint').onclick=()=>{
  errorState=core.hintError(errorCard,errorState);
  errorState.feedback=errorHintMessage(errorCard,errorState.stage);
  saveError();renderError();
 };
 $('errorNext').onclick=()=>{errorState=core.nextError(errorCard,errorState);saveError();renderError();};
 $('errorReset').onclick=()=>{errorState=core.createErrorState(errorCard);saveError();renderError();};
 renderError();
 if(location.hash==='#flowErrors')requestAnimationFrame(()=>$('flowErrors').scrollIntoView({block:'start'}));
}
})();
