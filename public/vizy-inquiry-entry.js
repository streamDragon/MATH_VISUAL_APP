/* One first-decision overlay for both inquiry stage adapters.
   It reads the existing prompt buttons, never creates a second lesson engine. */
(function(root){
 'use strict';
 function create({kind,host,core}){
  const firstPhase=kind==='graph'?'choose':'shape';
  const openingQuestion=kind==='graph'?'איזו פונקציה עולה?':'לפני שפותחים סוגריים: איזה מבנה יש כאן?';
  const caseLabel=kind==='graph'?'גרפים A ו־B':'(x+1)² − 9';
  let overlay=null,mode='',closing=false,lastStrip=null;
  const h=(tag,cls,text)=>{
   const node=document.createElement(tag);
   if(cls)node.className=cls;
   if(text!==undefined)node.textContent=text;
   return node;
  };
  function given(state){
   const phase=core.phase(state);
   if(kind==='map'){
    return phase==='transfer'?'המקרה החדש: (x−2)² − 25':'המקרה שלנו: (x+1)² − 9';
   }
   if(['verdict','criterion-end'].includes(phase))return 'נתון: f עולה ממש בכל הישר';
   if(phase==='temperature')return 'טמפרטורה: מ־8− ל־3−';
   if(phase==='linear')return 'נתון: f(x) = x − 10, בתחום 0 ≤ x ≤ 5';
   return 'איזו פונקציה עולה? · A או B';
  }
  function lockScreen(locked){
   document.body.classList.toggle('iq-entry-visible',locked);
   host.inert=locked;
   for(const selector of ['#vizy-unified-nav','body>header']){
    const element=document.querySelector(selector);
    if(element)element.inert=locked;
   }
  }
  function removeOverlay(focusTarget){
   const old=overlay;
   overlay=null;mode='';closing=false;
   old?.remove();
   lockScreen(false);
   if(focusTarget?.isConnected)focusTarget.focus({preventScroll:true});
  }
  function animateToStrip(strip){
   if(!overlay||closing)return;
   closing=true;
   const current=overlay;
   const panel=current.querySelector('.iq-entry-sheet');
   const start=panel.getBoundingClientRect(),end=strip.getBoundingClientRect();
   const endFocus=()=>removeOverlay(document.getElementById('iqNext')||strip);
   const reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
   if(reduce||!panel.animate||start.width===0||end.width===0){endFocus();return;}
   current.classList.add('iq-entry-closing');
   const x=end.left+end.width/2-start.left-start.width/2;
   const y=end.top+end.height/2-start.top-start.height/2;
   const sx=Math.max(.1,end.width/start.width),sy=Math.max(.05,end.height/start.height);
   panel.animate([
    {transform:'translate(0px, 0px) scale(1, 1)',opacity:1},
    {transform:'translate('+x+'px, '+y+'px) scale('+sx+', '+sy+')',opacity:.15}
   ],{duration:480,easing:'cubic-bezier(.32,.02,.18,1)',fill:'forwards'}).finished.then(endFocus).catch(endFocus);
  }
  function cloneGraph(stage){
   const svg=stage.querySelector('.iq-graph');
   if(!svg)return null;
   const clone=svg.cloneNode(true);
   const clip=clone.querySelector('#iqGraphClip');
   if(clip)clip.id='iqEntryGraphClip';
   for(const node of clone.querySelectorAll('[clip-path]')){
    node.setAttribute('clip-path',node.getAttribute('clip-path').replace('#iqGraphClip','#iqEntryGraphClip'));
   }
   clone.removeAttribute('id');
   clone.classList.add('iq-entry-graph');
   return clone;
  }
  function buildOverlay({state,stage,prompt,decision,strip}){
   if(overlay||closing)return;
   mode=decision?'decision':'recap';
   const phase=core.phase(state);
   const title=decision?openingQuestion:given(state);
   const backdrop=h('div','iq-entry-overlay');
   backdrop.id='iqEntryOverlay';backdrop.dataset.mode=mode;
   backdrop.setAttribute('role','dialog');
   backdrop.setAttribute('aria-modal','true');
   backdrop.setAttribute('aria-labelledby','iqEntryTitle');
   const panel=h('div','iq-entry-sheet');
   const top=h('div','iq-entry-top');
   top.append(h('span','iq-entry-kicker','VIZY · '+(kind==='graph'?'כיתה י״א':'כיתה ט׳')));
   if(!decision){
    const close=h('button','iq-entry-close','חזרה לחקירה');
    close.type='button';close.onclick=()=>removeOverlay(strip);
    top.append(close);
   }
   const heading=h('h1','iq-entry-title',title);
   heading.id='iqEntryTitle';heading.tabIndex=-1;
   const content=h('div','iq-entry-content');
   if(kind==='graph'&&phase!=='temperature'&&phase!=='linear'){
    const visual=h('div','iq-entry-visual');
    const picture=cloneGraph(stage);
    if(picture)visual.append(picture);
    content.append(visual);
   }else if(kind==='map'){
    const math=h('div','iq-entry-expression',
     phase==='transfer'?'(x−2)² − 25':'(x+1)² − 9');
    math.dir='ltr';
    content.append(math);
   }
   const choices=h('div','iq-entry-choices');
   if(decision){
    const buttons=[...prompt.querySelectorAll('.iq-choices [data-iq-answer]')];
    for(const original of buttons){
     const option=h('button','iq-entry-answer',original.textContent.trim());
     option.type='button';option.dataset.iqAnswer=original.dataset.iqAnswer;
     const onSelect=original.onclick;
     option.onclick=()=>{if(!closing&&typeof onSelect==='function')onSelect();};
     choices.append(option);
    }
    const helpSource=prompt.querySelector('#iqHelp');
    if(helpSource){
     const help=h('button','iq-entry-help',helpSource.textContent);
     help.type='button';help.dataset.iqEntryHelp='true';
     const onHelp=helpSource.onclick;
     help.onclick=()=>{if(!closing&&typeof onHelp==='function')onHelp();};
     choices.append(help);
    }
    choices.append(h('p','iq-entry-feedback',state.feedback||''));
    const home=h('a','iq-entry-home','חזרה לבית');
    home.href='learn.html';choices.append(home);
   }
   panel.append(top,heading,content,choices);
   backdrop.append(panel);
   backdrop.addEventListener('keydown',event=>{
    if(event.key==='Escape'&&!decision){
     event.preventDefault();removeOverlay(strip);return;
    }
    if(event.key!=='Tab')return;
    const controls=[...backdrop.querySelectorAll('a[href],button:not([disabled])')];
    if(!controls.length){event.preventDefault();return;}
    const first=controls[0],last=controls[controls.length-1];
    if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}
    if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
   });
   document.body.append(backdrop);
   overlay=backdrop;
   lockScreen(true);
   requestAnimationFrame(()=>{if(overlay===backdrop)heading.focus({preventScroll:true});});
  }
  function update({state,stage,prompt}){
   const oldHead=stage.querySelector('.iq-stage-head');
   oldHead?.remove();
   const strip=h('button','iq-given-strip',given(state));
   strip.id='iqGivenStrip';strip.type='button';
   strip.setAttribute('aria-label','פתחו שוב את הנתון: '+given(state));
   strip.setAttribute('aria-expanded',String(mode==='recap'));
   strip.onclick=()=>{if(!closing)buildOverlay({state,stage,prompt,decision:false,strip});};
   stage.prepend(strip);
   lastStrip=strip;
   const starting=core.phase(state)===firstPhase&&!state.pending;
   if(overlay&&mode==='decision'&&!starting){animateToStrip(strip);return;}
   if(overlay&&mode==='decision'){
    const feedback=overlay.querySelector('.iq-entry-feedback');
    if(feedback)feedback.textContent=state.feedback||'';
    return;
   }
   if(!overlay&&starting&&!closing)buildOverlay({state,stage,prompt,decision:true,strip});
  }
  return {update};
 }
 root.VizyInquiryEntry={create};
})(window);
