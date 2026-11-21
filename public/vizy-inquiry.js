/* One investigation environment, one reusable progress/evidence engine, two stage adapters.
   Existing Vizy pages and older lessons remain available when explicitly requested via ?legacy=1. */
(function(root){
 'use strict';
 const params=new URLSearchParams(location.search);
 const lesson=params.get('lesson');
 if(params.get('legacy')==='1'||!['increasing','difference-squares'].includes(lesson))return;
 const C=root.VizyInvestigationCore;
 const kind=lesson==='increasing'?'graph':'map';
 const adapter=kind==='graph'?root.VizyGraphInquiry:root.VizyMapInquiry;
 const container=document.querySelector('main');
 if(!C||!adapter||!container)return;
 const storageKey='vizy_inquiry_v1_'+kind;
 let state, saved;
 try{saved=JSON.parse(localStorage.getItem(storageKey)||'null');state=C.restore(kind,saved);}
 catch{state=C.start(kind);}
 const progressIds=kind==='graph'
  ?new Set(['contrast','shift-act','reflect-act','point-act','compare','phrases','build',
    'verdict:0','verdict:1','verdict:2','criterion-end','temperature','linear'])
  :new Set(['reason','partA','partB','rule','return','tidy','check','transfer:result']);
 const announced=saved?.progressAnnounced&&typeof saved.progressAnnounced==='object'
  ?saved.progressAnnounced:{};
 // Existing snapshots already represent work from earlier visits. Mark it so
 // upgrading the producer never replays historical rewards.
 for(const id of progressIds)if(state.records?.[id]?.completed)announced['prompt:'+id]=true;
 if(state.route?.[state.index]==='done')announced['activity:done']=true;
 function persist(){
  // This allowlist intentionally excludes predictions, guesses and opening help.
  for(const id of progressIds){
   const record=state.records?.[id];
   if(!record?.completed||announced['prompt:'+id])continue;
   if(kind==='graph'&&id==='verdict:0'&&
      !(state.data?.examples?.positive&&state.data?.examples?.negative))continue;
   announced['prompt:'+id]=true;
   root.dispatchEvent(new CustomEvent('vizy:progress',{detail:{
    type:'prompt',lesson,id,helped:Boolean(record.helped||record.assisted||
      (id.startsWith('transfer:')&&state.records.transfer?.helped)),
    firstTry:Boolean(record.firstTry)
   }}));
  }
  const completed=kind==='graph'
   ?state.records?.temperature?.completed&&state.records?.linear?.completed
   :state.records?.['transfer:parts']?.completed&&state.records?.['transfer:result']?.completed;
  if(state.route?.[state.index]==='done'&&completed&&!announced['activity:done']){
   announced['activity:done']=true;
   root.dispatchEvent(new CustomEvent('vizy:progress',{detail:{type:'activity',lesson,id:'done',helped:false}}));
  }
  try{localStorage.setItem(storageKey,JSON.stringify({...state,progressAnnounced:announced}));}catch{}
 }
 const host=document.createElement('section');
 host.id='vizyInquiry';host.className='vizy-inquiry';host.setAttribute('aria-label','סביבת חקירה מתמטית');
 container.prepend(host);
 const entry=root.VizyInquiryEntry?.create({kind,host,core:C});
 document.body.classList.add('vizy-investigation-active');
 document.title='Vizy | '+adapter.title;
 const h=(tag,cls,txt)=>{
  const n=document.createElement(tag);if(cls)n.className=cls;if(txt!=null)n.textContent=txt;return n;
 };
 function stageContext(){
  const phase=C.phase(state);
  return {
   state,phase,
   save:persist,render:paint,
   message(text){state.feedback=text;persist();paint();},
   complete(label,detail,feedback){
    if(!state.records[phase])C.attempt(state,phase,true);
    C.complete(state,label,detail,feedback);
    persist();paint();
   },
   submit({key,correct,wrong,label,detail,onCorrect}){
    if(state.pending)return;
    C.attempt(state,key||phase,Boolean(correct));
    if(!correct){
     state.feedback=wrong||'בדקו שוב את הקשר.';
     persist();paint();return;
    }
    if(typeof onCorrect==='function')onCorrect();
    C.complete(state,label||'מסקנה',detail||'',detail);
    persist();paint();
   },
   help(){
    C.help(state,phase);
    state.feedback=adapter.hint[phase]||'נסו לבדוק מה ידוע ומה רק אפשרי.';
    persist();paint();
   },
   finish,
   next(){
    if(C.advance(state)){
     adapter.onEnter?.(state,C.phase(state));persist();paint();
    }
   }
  };
 }
 function finish(target){
  const summary=C.summary(state);
  const title=h('h2','','מה הבנתי?');
  target.append(title);
  const box=h('div','iq-results');
  const entries=[
   ['הצלחות בניסיון ראשון',String(summary.independent)],
   ['הצלחות לאחר בדיקה / עזרה',String(summary.assisted)],
   ['העברות עצמאיות למקרה חדש',summary.transferIndependent+' מתוך '+summary.transferTotal]
  ];
  for(const [label,value] of entries){
   const row=h('div','iq-result-row');
   row.append(h('span','',label),h('strong','',value));box.append(row);
  }
  target.append(box);
  if(kind==='graph'){
   const mapping={height:'גובה מעל הציר',direction:'כיוון השינוי כש־x גדל',
    appearance:'רושם מהצורה',unsure:'לא הייתי בטוח/ה'};
   const initial=mapping[summary.criterionBefore]||'לא נבחר';
   const after=mapping[summary.criterionAfter]||'טרם נבדק';
   target.append(h('p','iq-end-criterion','בהתחלה החלטתי לפי: '+initial+'. בסיום: '+after+'.'));
  }
  target.append(h('p','iq-help-line','זו עדות לניסיונות ולדרך החשיבה על המכשיר הזה, לא ציון של תלמיד.'));
  const again=h('button','iq-primary','עוד ניסיון באותה פעילות');again.type='button';
  again.id='iqReset';
  again.onclick=()=>{state=C.start(kind);adapter.onEnter?.(state,C.phase(state));persist();paint();};
  target.append(again);
 }
 // On phones the picture is not pinned, so each new step must bring its work into view:
 // the whole prompt (or, after an answer, the feedback and "continue") above the bottom bar,
 // never pushing the question itself off the top. Runs after the shell re-decorates the lesson.
 let lastStepKey=null;
 const shortPhone=()=>root.matchMedia?.('(max-width:700px)').matches;
 function revealWork(tries=0){
  if(!shortPhone())return;
  // The first answer is given on the entry overlay; wait until it has folded into the strip.
  if(document.getElementById('iqEntryOverlay')){if(tries<6)setTimeout(()=>revealWork(tries+1),350);return;}
  const prompt=document.getElementById('iqPrompt');if(!prompt)return;
  const next=document.getElementById('iqNext'),feedback=document.getElementById('iqFeedback');
  const top=(state.pending&&feedback?.textContent?feedback:prompt).getBoundingClientRect().top;
  const bottom=(state.pending&&next?next:prompt).getBoundingClientRect().bottom;
  const nav=document.querySelector('#vizy-unified-nav,.bottom-nav');
  const navH=nav&&getComputedStyle(nav).position==='fixed'?nav.getBoundingClientRect().height:0;
  let delta=bottom-(innerHeight-navH-10);
  if(top-delta<10)delta=top-10;
  if(Math.abs(delta)<6)return;
  const reduce=root.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  root.scrollBy({top:delta,behavior:reduce?'auto':'smooth'});
 }
 function paint(){
  const phase=C.phase(state);
  const stepKey=phase+'|'+state.index+'|'+Boolean(state.pending);
  if(lastStepKey!==null&&stepKey!==lastStepKey)
   requestAnimationFrame(()=>requestAnimationFrame(()=>revealWork()));
  lastStepKey=stepKey;
  host.replaceChildren();
  const top=h('div','iq-header');
  const heading=h('div','');
  heading.append(h('small','iq-kicker','VIZY · '+adapter.grade+' · חקירת משמעות'),
    h('h1','',adapter.title));
  const track=h('div','iq-progress');
  const stepCount=kind==='graph'&&!state.data.lane?14:state.route.length;
  const progress=kind==='graph'&&!state.data.lane?state.index+1:Math.min(state.index+1,stepCount);
  track.append(h('span','',phase==='done'?'סיימנו':String(progress)+' / '+String(stepCount)));
  top.append(heading,track);host.append(top);
  const stage=h('section','iq-stage');
  stage.dataset.iqStage=kind;
  const title=h('div','iq-stage-head','מה רואים?');
  stage.append(title);
  const stageBody=h('div','iq-stage-body');
  stage.append(stageBody);
  host.append(stage);
  const prompt=h('section','iq-prompt');prompt.id='iqPrompt';
  prompt.dataset.iqPhase=phase;
  if(kind==='graph'&&phase==='verdict')prompt.append(h('p','iq-given','נתון קבוע: f עולה ממש בכל הישר'));
  host.append(prompt);
  const ctx=stageContext();
  try{
   adapter.stage(stageBody,ctx);
   adapter.prompt(prompt,ctx);
  }catch(err){
   console.error('Vizy investigation failed',err);
   const error=h('p','iq-error','לא הצלחנו להציג את המשימה. אפשר לחזור לבית ולנסות שוב.');
   host.append(error);return;
  }
  if(state.feedback){
   const response=h('p','iq-feedback',state.feedback);
   response.id='iqFeedback';response.setAttribute('role','status');
   response.setAttribute('aria-live','polite');
   prompt.append(response);
  }else{
   const live=h('p','iq-feedback','');live.id='iqFeedback';live.setAttribute('role','status');
   live.setAttribute('aria-live','polite');prompt.append(live);
  }
  if(phase!=='done'){
   const footer=h('div','iq-prompt-footer');
   if(state.pending){
    for(const b of prompt.querySelectorAll('.iq-choice'))b.disabled=true;
    const btn=h('button','iq-primary','ממשיכים');
    btn.type='button';btn.id='iqNext';btn.onclick=ctx.next;footer.append(btn);
   }else{
    const help=h('button','iq-help-link','עוד לא יודע/ת — בוא נבדוק');
    help.id='iqHelp';help.type='button';help.onclick=ctx.help;footer.append(help);
   }
   prompt.append(footer);
  }
  const trail=h('details','iq-trail');
  const sum=h('summary','','מה גילינו עד עכשיו?');
  sum.append(h('span','iq-trail-count',String(state.trail.length)));
  trail.append(sum);
  const items=h('ol','');
  if(!state.trail.length)items.append(h('li','','הגילויים יישמרו כאן, בלי למחוק את השאלה.'));
  else for(const item of state.trail){
   const li=h('li','');li.append(h('strong','',item.label),h('p','',item.detail));items.append(li);
  }
  trail.append(items);host.append(trail);
  if(phase!=='done'){
   const restart=h('button','iq-restart','התחילו את החקירה מחדש');
   restart.type='button';restart.id='iqRestart';restart.onclick=()=>{
    state=C.start(kind);adapter.onEnter?.(state,C.phase(state));persist();paint();
   };
   host.append(restart);
  }
  // Formulas inside Hebrew sentences (feedback, givens, the trail) keep their left-to-right order.
  root.VizyLtr?.mixed?.(host);
  entry?.update({state,stage,prompt});
 }
 persist();paint();
 root.VizyInvestigation={getState:()=>JSON.parse(JSON.stringify(state)),kind};
})(window);
