/* Reuses the existing #coreFlow surface, lesson switch, and retained-layer philosophy. */
(function(root){
 'use strict';
 const core=root.VizyWeaveCore;
 const storePrefix='vizy_weave_v1_';
 const names={equivalent:'שקול',sufficient:'תנאי מספיק',necessary:'תנאי הכרחי / מסקנה',compatible:'אפשרי בלבד',contradiction:'סותר את הנתון'};
 const desc={equivalent:'מביע בדיוק את אותו מידע',sufficient:'מבטיח את הנתון, אך עשוי להיות חזק ממנו',necessary:'נובע בהכרח מן הנתון, אך אינו בהכרח מספיק',compatible:'יכול להיות נכון, אבל אינו נובע מהנתון',contradiction:'לא יכול להתקיים יחד עם הנתון'};
 const el=(tag,cls,content)=>{
  const node=document.createElement(tag);
  if(cls)node.className=cls;
  if(content!==undefined)node.textContent=content;
  return node;
 };
 function chart(type){
  const paths={
   'rise-negative':'M12 104 L166 65',
   'cubic':'M12 101 C53 99 69 63 90 55 S132 10 166 8',
   'rise-positive':'M12 52 C59 51 104 44 130 29 S156 10 166 5',
   'positive-parabola':'M12 7 Q90 82 166 7',
   'fall-positive':'M12 8 L166 43',
   'slope-steep':'M72 5 L100 89',
   'slope-shift':'M94 10 L120 88',
   'slope-gentle':'M25 25 L166 51',
   'slope-up':'M72 90 L100 6'
  };
  const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');
  svg.setAttribute('viewBox','0 0 180 112');
  svg.setAttribute('role','img');
  svg.setAttribute('aria-label','המחשה סכמטית; בציורי השיפוע היחידות מכוילות במרווחי 24 אופקית ו־18 אנכית');
  const s='<rect x="0" y="0" width="180" height="112" rx="12" fill="#f7fbff"/>'+
   '<path d="M0 55H180 M90 0V112" stroke="#a5b7cb" stroke-width="1.4"/>'+
   (type.startsWith('slope-')?'<path d="M0 18H180 M0 36H180 M0 73H180 M0 91H180 M24 0V112 M48 0V112 M72 0V112 M114 0V112 M138 0V112 M162 0V112" stroke="#dce9f4" fill="none"/>':'')+
   '<path d="'+paths[type]+'" fill="none" stroke="#236ec0" stroke-width="4" stroke-linecap="round"/>';
  svg.innerHTML=s;
  return svg;
 }
 function load(lesson){try{return core.normalize(lesson,JSON.parse(localStorage.getItem(storePrefix+lesson.id)||'null'));}catch{return core.initial(lesson);}}
 function save(lesson,s){try{localStorage.setItem(storePrefix+lesson.id,JSON.stringify(s));localStorage.setItem('vizy_layered_flow_selected',lesson.id);}catch{}}
 function render(host,lesson,lessons){
  let state=load(lesson);
  let selection=new Set();
  let sortValues={};
  function go(to){
   const u=new URL(window.location.href);u.searchParams.set('lesson',to);u.hash='';window.location.assign(u.toString());
  }
  function paint(){
   const step=lesson.steps[state.step];
   const done=state.entries.some(x=>x.id===step.id);
   const last=state.entries.length===lesson.steps.length;
   host.replaceChildren();
   const head=el('div','flow-heading');
   const headText=el('div');
   headText.append(el('span','flow-kicker','VIZY · מה זה אומר?'));
   headText.append(el('h2','',lesson.name));
   headText.append(el('p','flow-intro','משמעות לפני פעולה. אפשר לבחור כמה תשובות נכונות.'));
   head.append(headText,el('span','flow-stamp',lesson.grade));
   host.append(head);
   const nav=el('div','flow-switch');
   nav.id='flowSwitch';
   for(const entry of lessons.filter(x=>x.grade===lesson.grade)){
    const b=el('button','flow-lesson',entry.name);b.type='button';b.dataset.flowLesson=entry.id;b.setAttribute('aria-pressed',String(entry.id===lesson.id));b.onclick=()=>go(entry.id);nav.append(b);
   }
   host.append(nav);
   const prompt=el('p','flow-problem',lesson.prompt);
   host.append(prompt);
   const story=el('button','story-corner-trigger story-context-trigger',lesson.id==='difference-squares'?'☕ איך מתחברים לדרך שכבר מכירים?':'☕ פינת הסיפור · איך מתמטיקאים חושבים?');
   story.type='button';story.dataset.story='kettle';host.append(story);
   const current=el('section','weave-task');
   current.id='flowInteraction';
   const phase=el('div','flow-phase');
   phase.append(el('span','',step.phase),el('span','',String(state.step+1)+' מתוך '+lesson.steps.length));
   current.append(phase);
   const title=el('h3','',step.question);title.id='flowQuestion';current.append(title);
   const options=el('div','weave-options');options.id='flowOptions';
   if(step.mode==='multi'||step.mode==='build'){
    if(!done)selection=new Set(Array.isArray(state.answers[step.id])?state.answers[step.id]:[]);
    for(const [i,opt] of step.options.entries()){
     const btn=el('button','flow-choice weave-option');btn.type='button';btn.dataset.weaveAnswer=String(i);btn.disabled=done;
     if(opt.visual)btn.append(chart(opt.visual));
     const lab=el('span',opt.math?'weave-math':'',opt.label);
     if(opt.math)lab.dir='ltr';
     btn.append(lab);
     btn.setAttribute('aria-pressed',String(done?opt.correct:selection.has(i)));
     btn.onclick=()=>{
      if(selection.has(i))selection.delete(i);else selection.add(i);
      options.querySelectorAll('[data-weave-answer]').forEach(b=>b.setAttribute('aria-pressed',String(selection.has(Number(b.dataset.weaveAnswer)))));
     };
     options.append(btn);
    }
   }else{
    if(!done)sortValues=state.answers[step.id]&&typeof state.answers[step.id]==='object'?{...state.answers[step.id]}:{};
    for(const [i,opt] of step.options.entries()){
     const row=el('div','weave-sort-row');
     const txt=el('p','weave-sort-statement',opt.label);row.append(txt);
     if(done){
      row.append(el('strong','weave-relation-answer',names[opt.relation]));
     }else{
      const select=el('select','weave-relation-select');select.dataset.weaveSort=String(i);
      const placeholder=el('option','', 'בחרו את סוג הקשר');placeholder.value='';select.append(placeholder);
      for(const [value,label] of Object.entries(names)){const item=el('option','',label);item.value=value;select.append(item);}
      select.value=sortValues[i]||'';
      select.onchange=()=>{sortValues[i]=select.value;};
      row.append(select);
     }
     options.append(row);
    }
   }
   current.append(options);
   const feedback=el('p','flow-feedback',done?step.correctNote:state.feedback||'בחרו מה מתאים למידע, ובדקו את הקשר.');
   feedback.id='flowFeedback';feedback.setAttribute('role','status');feedback.setAttribute('aria-live','polite');
   feedback.dataset.status=done?'correct':state.status==='retry'?'retry':'neutral';
   current.append(feedback);
   const actions=el('div','flow-actions weave-actions');
   if(!done){
    const check=el('button','',step.mode==='multi'?'בדיקת הבחירות':step.mode==='build'?'בדיקת הביטוי שבניתם':'בדיקת המיון');
    check.type='button';check.id='weaveCheck';
    check.onclick=()=>{
     const ans=step.mode==='multi'||step.mode==='build'?[...selection].sort((a,b)=>a-b):{...sortValues};
     const r=core.submit(lesson,state,ans);state=r.state;save(lesson,state);paint();
    };
    actions.append(check);
    const hint=el('button','flow-secondary','רמז קטן');hint.id='flowHint';hint.type='button';
    hint.disabled=Boolean(state.help[step.id]);
    hint.onclick=()=>{state=core.help(lesson,state);state.feedback=step.wrong;save(lesson,state);paint();};
    actions.append(hint);
   }
   if(state.step>0){
    const back=el('button','flow-secondary','הקשר הקודם');back.id='flowBack';back.type='button';
    back.onclick=()=>{state=core.previous(lesson,state);save(lesson,state);paint();};
    actions.append(back);
   }
   const next=el('button','',last?'סיכום':'ממשיכים');next.id='flowNext';next.type='button';
   next.disabled=!done||last;
   next.onclick=()=>{state=core.next(lesson,state);save(lesson,state);paint();document.getElementById('flowInteraction')?.scrollIntoView({block:'start'});};
   if(!last)actions.append(next);
   current.append(actions);host.append(current);
   const history=el('details','flow-history');history.id='flowHistory';
   const summary=el('summary');summary.append(el('strong','','המארג שנבנה'),el('span','','הקשרים הקודמים נשמרים'));history.append(summary);
   const rows=el('div','flow-rows');rows.id='flowRows';
   if(!state.entries.length)rows.append(el('p','flow-placeholder','עוד לא נקבעו קשרים. אחרי בדיקה נכונה נשמור כאן את מה שהבנתם.'));
   for(const entry of state.entries){
    const row=el('div','flow-layer');row.dataset.flowLayer=entry.id;row.dataset.layerKind=entry.kind;
    row.append(el('strong','',entry.label),el('span','flow-layer-value',entry.value));rows.append(row);
   }
   history.append(rows);host.append(history);
   if(last){
    const stats=core.result(lesson,state),finish=el('section','flow-finish');
    finish.id='flowFinish';
    finish.append(el('h3','','מה הצלחתם להראות?'));
    finish.append(el('p','','קשרים עצמאיים: '+stats.independent+' · קשרים לאחר רמז או תיקון: '+stats.assisted));
    finish.append(el('p','',stats.transferIndependent?'שאלת העברה חדשה נפתרה באופן עצמאי.':'לשאלת ההעברה נדרשה עזרה או בדיקה חוזרת. כדאי לתרגל שוב עם מקרה נוסף.'));
    finish.append(el('p','','לא כל דוגמה מתאימה היא אותה פונקציה, ולא כל מסקנה נכונה שקולה לנתון.'));
    const reset=el('button','flow-secondary','להתחיל מחדש');reset.type='button';reset.id='flowReset';reset.onclick=()=>{state=core.initial(lesson);save(lesson,state);paint();};finish.append(reset);
    host.append(finish);
   }else{
    const reset=el('button','flow-secondary weave-reset','התחילו משימה זו מחדש');reset.type='button';reset.id='flowReset';reset.onclick=()=>{state=core.initial(lesson);save(lesson,state);paint();};host.append(reset);
   }
   const support=el('p','weave-more');
   const a=el('a','', 'בחזרה למפת הקיצון ולתרגול טעויות');a.href='problem-map.html?lesson=parameter#flowErrors';support.append(a);host.append(support);
  }
  paint();
 }
 root.VizyWeave={render,relationLabels:names,relationDescriptions:desc};
})(window);
