(function () {
  "use strict";
  const lessons = window.VizyClassroomLessons || [];
  const visuals = window.VizyClassroomVisuals;
  const $ = id => document.getElementById(id);
  const STORE = 'vizy_classroom_flow_v2';
  const LEGACY = 'vizy_classroom_20261029';
  const MAX_GRADE = new Set(['9', '11', 'all']);
  const emptyRecord = () => ({index:0, solved:[], failures:{}, hints:{}, completed:false, everCompleted:false});
  function load() {
    let s;
    try { s=JSON.parse(localStorage.getItem(STORE)); } catch {}
    if (s && s.version === 2 && s.courses && typeof s.courses === 'object') return s;
    s = {version:2, grade:'9', courses:{}, activeId:null};
    try {
      const prior=JSON.parse(localStorage.getItem(LEGACY));
      if (lessons.some(l=>l.id===prior?.id)) {
        s.grade=String(lessons.find(l=>l.id===prior.id).grade);
        const index=Math.max(0,Math.min(Number(prior.index)||0,lessons.find(l=>l.id===prior.id).steps.length-1));
        s.courses[prior.id]={...emptyRecord(),index,solved:Array.from({length:index},(_,i)=>i)};
      }
    } catch {}
    return s;
  }
  const state=load();
  let grade=MAX_GRADE.has(String(state.grade))?String(state.grade):'9';
  let activeId=null;
  let visualShown=false;
  const getLesson=id=>lessons.find(l=>l.id===id);
  function record(id) {
    if (!state.courses[id] || typeof state.courses[id]!=='object') state.courses[id]=emptyRecord();
    const r=state.courses[id];
    if (!Array.isArray(r.solved)) r.solved=[];
    if (!r.failures || typeof r.failures!=='object') r.failures={};
    if (!r.hints || typeof r.hints!=='object') r.hints={};
    r.index=Math.max(0,Math.min(Number(r.index)||0,(getLesson(id)?.steps.length||1)-1));
    return r;
  }
  function persist(){state.grade=grade;state.activeId=activeId;try{localStorage.setItem(STORE,JSON.stringify(state));}catch{}}
  function countDone(r){const max=lessons.find(l=>state.courses[l.id]===r)?.steps.length||0;return [...new Set(r.solved)].filter(i=>Number.isInteger(i)&&i>=0&&i<max).length}
  function percent(l,r){return Math.round(100*countDone(r)/l.steps.length)}
  function updateRoute(id){
    if(!window.history?.replaceState)return;
    try {
      const u=new URL(window.location.href);
      if(id){u.searchParams.set('topic',id);u.searchParams.delete('grade');}
      else {u.searchParams.delete('topic');u.searchParams.set('grade',grade);}
      history.replaceState({},'',u.toString());
    }catch{}
  }
  function renderCourses(){
    activeId=null;persist();
    $('courses').classList.remove('hidden');$('workspace').classList.add('hidden');$('completion').classList.add('hidden');
    const visible=lessons.filter(l=>grade==='all'||String(l.grade)===grade);
    const done=visible.filter(l=>record(l.id).completed).length;
    $('summary').textContent=done+' מתוך '+visible.length+' מסלולים שהושלמו';
    [...$('gradeTabs').querySelectorAll('[data-grade]')].forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.grade===grade)));
    $('courseCards').replaceChildren();
    visible.forEach(l=>{
      const r=record(l.id),num=countDone(r),el=document.createElement('article');
      el.className='course-card';
      const meta=document.createElement('div');meta.className='course-meta';
      const label=document.createElement('span');label.textContent='כיתה '+(l.grade===9?'ט׳':'י״א');
      const status=document.createElement('span');status.textContent=r.completed?'הושלם ✓':num?'שלב '+(r.index+1)+' מתוך '+l.steps.length:r.everCompleted?'חזרה על החומר':'מסלול חדש';
      meta.append(label,status);
      const head=document.createElement('h3');head.textContent=l.name.replace(/^.*? · /,'');
      const info=document.createElement('p');info.textContent=l.description;
      const track=document.createElement('div');track.className='mini-progress';track.setAttribute('aria-label','התקדמות '+percent(l,r)+' אחוז');
      const fill=document.createElement('span');fill.style.width=percent(l,r)+'%';track.append(fill);
      const launch=document.createElement('button');launch.type='button';launch.className='primary';
      launch.textContent=r.completed?'צפייה בסיכום':num?'להמשיך מאיפה שהפסקתי':'מתחילים ללמוד';
      launch.addEventListener('click',()=>openCourse(l.id));
      el.append(meta,head,info,track,launch);$('courseCards').append(el);
    });
  }
  function showCourses() {renderCourses();updateRoute(null);$('courses').scrollIntoView({block:'start'});}
  function openCourse(id) {
    const l=getLesson(id);if(!l)return;
    activeId=id;grade=String(l.grade);persist();updateRoute(id);
    if(record(id).completed) {showCompletion();return;}
    $('courses').classList.add('hidden');$('completion').classList.add('hidden');$('workspace').classList.remove('hidden');
    $('courseLabel').textContent='כיתה '+(l.grade===9?'ט׳':'י״א')+' · תרגול מודרך';
    $('courseHeading').textContent=l.name.replace(/^.*? · /,'');
    renderStep();
    $('workspace').focus({preventScroll:true});$('workspace').scrollIntoView({block:'start'});
  }
  function clean(v) {
    let s=String(v||'').trim().toLowerCase().replace(/[\u2212\u2013\u2014]/g,'-').replace(/\s+/g,'').replace(/,/g,'.').replace(/[°º]/g,'');
    s=s.replace(/<\s*=/g,'≤').replace(/>\s*=/g,'≥');
    return s;
  }
  function matches(input,answers){
    const v=clean(input);if(!v)return false;
    return answers.some(a=>{const expected=clean(a);
      if(v===expected)return true;
      if(/^[-+]?\d+(\.\d+)?$/.test(v)&&/^[-+]?\d+(\.\d+)?$/.test(expected))
        return Math.abs(Number(v)-Number(expected))<1e-9;
      return false;
    });
  }
  function visibleHint(s,r,index){
    const count=Math.max(0,Math.min(Number(r.hints[index])||0,s.hints.length));
    $('hintBox').classList.toggle('hidden',!count);
    $('hintBox').textContent=count?s.hints.slice(0,count).map((txt,i)=>(i+1)+'. '+txt).join('\n'):'';
    $('hintButton').disabled=count>=s.hints.length;
    $('hintButton').textContent=count===0?'רמז ראשון':count<s.hints.length?'עוד רמז':'כל הרמזים פתוחים';
  }
  function revealVisual(show){
    const l=getLesson(activeId),r=record(activeId),s=l.steps[r.index];
    visualShown=Boolean(show);
    $('visualArea').classList.toggle('hidden',!visualShown);
    $('visualToggle').setAttribute('aria-expanded',String(visualShown));
    $('visualToggle').textContent=visualShown?'הסתרת המחשה':'הצגת המחשה';
    if(visualShown && visuals?.mount) visuals.mount($('visualArea'),l,s);
    else $('visualArea').replaceChildren();
  }
  function updateProgress(){
    const l=getLesson(activeId),r=record(activeId),pct=percent(l,r);
    $('progressText').textContent='הצלחתי ב־'+countDone(r)+' מתוך '+l.steps.length+' שלבים';
    $('progressPercent').textContent=pct+'%';
    $('progressBar').style.width=pct+'%';
    $('progressTrack').setAttribute('aria-valuenow',String(pct));
  }
  function renderTrail(){
    const l=getLesson(activeId),r=record(activeId);$('stepTrail').replaceChildren();
    l.steps.forEach((step,i)=>{
      const item=document.createElement('li'),btn=document.createElement('button'),badge=document.createElement('span'),txt=document.createElement('span');
      const solved=r.solved.includes(i);
      btn.type='button';badge.className='trail-icon'+(solved?' trail-done':'');
      badge.textContent=solved?'✓':i+1;badge.setAttribute('aria-hidden','true');
      txt.textContent=step.heading;btn.append(badge,txt);
      btn.setAttribute('aria-current',i===r.index?'step':'false');
      btn.disabled=i>r.index && !solved;
      btn.addEventListener('click',()=>{r.index=i;persist();renderStep();});
      item.append(btn);$('stepTrail').append(item);
    });
  }
  function setFeedback(text,success){
    $('feedback').textContent=text;
    $('feedback').className='feedback'+(text?(success?' success':' error'):'');
  }
  function renderChoices(s,solved){
    const choices=Array.isArray(s.options)?s.options:
      s.answers.some(a=>clean(a)==='כן'||clean(a)==='לא')?['כן','לא']:null;
    $('choiceArea').replaceChildren();
    if(!choices)return;
    choices.forEach(choice=>{
      const btn=document.createElement('button');btn.type='button';btn.textContent=choice;btn.disabled=solved;
      btn.setAttribute('aria-pressed',String(clean($('answerInput').value)===clean(choice)));
      btn.addEventListener('click',()=>{
        $('answerInput').value=choice;
        [...$('choiceArea').querySelectorAll('button')].forEach(x=>x.setAttribute('aria-pressed',String(x===btn)));
      });
      $('choiceArea').append(btn);
    });
  }
  function renderStep(){
    if(!activeId)return;
    const l=getLesson(activeId),r=record(activeId),i=r.index,s=l.steps[i],solved=r.solved.includes(i);
    $('stageNumber').textContent=i+1;
    $('stageName').textContent=i===0?'מזהים מה יודעים':i===l.steps.length-1?'שאלת העברה: בלי הציור':'מתקדמים בהדרגה';
    $('questionHeading').textContent=s.heading;
    $('problem').textContent=s.problem;
    $('questionPrompt').textContent=s.prompt;
    $('answerInput').value='';
    $('answerInput').disabled=solved;$('checkAnswer').disabled=solved;
    $('previousStep').disabled=i===0;
    $('nextStep').classList.toggle('hidden',!solved);
    $('nextStep').textContent=i===l.steps.length-1?'סיום והערכת ההתקדמות':'לשלב הבא';
    visibleHint(s,r,i);renderChoices(s,solved);
    setFeedback(solved?'כבר פתרתם את השלב הזה. '+s.why:'',solved);
    revealVisual(i!==l.steps.length-1);
    updateProgress();renderTrail();
  }
  function checkAnswer(){
    if(!activeId)return;
    const l=getLesson(activeId),r=record(activeId),i=r.index,s=l.steps[i];
    if(r.solved.includes(i))return;
    const input=$('answerInput').value;
    if(!clean(input)){setFeedback('כתבו ניסיון או בחרו אפשרות. גם זיהוי חלק קטן הוא התקדמות.',false);$('answerInput').focus();return;}
    if(matches(input,s.answers)){
      r.solved=[...new Set([...r.solved,i])].sort((a,b)=>a-b);
      $('answerInput').disabled=true;$('checkAnswer').disabled=true;
      [...$('choiceArea').querySelectorAll('button')].forEach(b=>b.disabled=true);
      $('nextStep').classList.remove('hidden');
      setFeedback('נכון! '+s.why,true);updateProgress();renderTrail();persist();
      $('nextStep').focus({preventScroll:true});
    }else{
      r.failures[i]=(Number(r.failures[i])||0)+1;
      if(r.failures[i]>=2 && !r.hints[i])r.hints[i]=1;
      persist();visibleHint(s,r,i);
      setFeedback(r.failures[i]>=2?'עוד לא. פתחתי רמז ראשון. נסו ממנו צעד אחד.':'עדיין לא. נסו לזהות מה כבר מוכר, או פתחו רמז.',false);
    }
  }
  function nextStep(){
    if(!activeId)return;
    const l=getLesson(activeId),r=record(activeId);
    if(!r.solved.includes(r.index))return;
    if(r.index===l.steps.length-1){
      r.completed=true;r.everCompleted=true;persist();showCompletion();return;
    }
    r.index++;persist();renderStep();
    $('questionHeading').scrollIntoView({block:'nearest'});
  }
  function showCompletion(){
    const l=getLesson(activeId),r=record(activeId);
    $('courses').classList.add('hidden');$('workspace').classList.add('hidden');$('completion').classList.remove('hidden');
    $('completionHeading').textContent='הצלחתם להשלים: '+l.name.replace(/^.*? · /,'');
    const errors=Object.values(r.failures).reduce((sum,n)=>sum+(Number(n)||0),0);
    $('completionText').textContent='פתרתם '+l.steps.length+' שלבים, כולל שאלת העברה לנתונים חדשים. '+
      (errors?'גם ניסיונות שלא הצליחו היו חלק מתהליך הלמידה. ':'')+
      'אפשר לחזור לתרגילים או לבחור נושא נוסף. ההתקדמות שלכם נשמרה במכשיר זה.';
    $('completion').focus({preventScroll:true});$('completion').scrollIntoView({block:'start'});
  }
  function repeatCourse(){
    const r=record(activeId);r.completed=false;r.everCompleted=true;r.solved=[];r.index=0;r.failures={};r.hints={};persist();openCourse(activeId);
  }
  function anotherCourse(){
    const current=getLesson(activeId),others=lessons.filter(l=>String(l.grade)===String(current.grade)&&l.id!==activeId&&!record(l.id).completed);
    if(others.length)openCourse(others[0].id);else showCourses();
  }
  async function share(){
    const url=new URL('https://math-visual-app-pi.vercel.app/classroom-practice.html');
    if(activeId)url.searchParams.set('topic',activeId);else if(grade!=='all')url.searchParams.set('grade',grade);
    try{
      if(navigator.share)await navigator.share({title:'Vizy · תרגול מתמטיקה',url:url.toString()});
      else if(navigator.clipboard?.writeText)await navigator.clipboard.writeText(url.toString());
      else throw Error('no clipboard');
      const btn=$('shareTop');btn.textContent='הקישור הועבר לשיתוף';
      btn.setAttribute('aria-label','הקישור הועבר לשיתוף');
    }catch(e){if(e.name!=='AbortError')window.prompt('העתיקו את הקישור:',url.toString());}
  }
  $('gradeTabs').addEventListener('click',e=>{const b=e.target.closest('[data-grade]');if(!b)return;grade=b.dataset.grade;persist();renderCourses();updateRoute(null);});
  $('backToCourses').addEventListener('click',showCourses);
  $('checkAnswer').addEventListener('click',checkAnswer);
  $('answerInput').addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();checkAnswer();}});
  $('previousStep').addEventListener('click',()=>{const r=record(activeId);if(r.index>0){r.index--;persist();renderStep();}});
  $('nextStep').addEventListener('click',nextStep);
  $('hintButton').addEventListener('click',()=>{
    const r=record(activeId),s=getLesson(activeId).steps[r.index];
    r.hints[r.index]=Math.min(s.hints.length,(Number(r.hints[r.index])||0)+1);
    visibleHint(s,r,r.index);persist();
  });
  $('visualToggle').addEventListener('click',()=>revealVisual(!visualShown));
  $('repeatCourse').addEventListener('click',repeatCourse);
  $('anotherCourse').addEventListener('click',anotherCourse);
  $('shareTop').addEventListener('click',share);
  if('serviceWorker' in navigator && /^https?:$/.test(location.protocol)){
    window.addEventListener('load',()=>navigator.serviceWorker.register('service-worker.js').catch(()=>{}));
  }
  if(!lessons.length){$('courseCards').textContent='לא הצלחנו לטעון את התרגילים. נסו לרענן את העמוד.';}
  else{
    const params=new URLSearchParams(location.search),topic=params.get('topic'),requestedGrade=params.get('grade');
    if(MAX_GRADE.has(requestedGrade))grade=requestedGrade;
    if(getLesson(topic)){openCourse(topic);}else{renderCourses();}
  }
})();
