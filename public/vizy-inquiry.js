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
 let state;
 try{state=C.restore(kind,JSON.parse(localStorage.getItem(storageKey)||'null'));}
 catch{state=C.start(kind);}
 function persist(){
  try{localStorage.setItem(storageKey,JSON.stringify(state));}catch{}
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
  const title=h('h3','','מה הבנתי?');
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
 function paint(){
  const phase=C.phase(state);
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
  entry?.update({state,stage,prompt});
 }
 persist();paint();
 root.VizyInvestigation={getState:()=>JSON.parse(JSON.stringify(state)),kind};
})(window);
