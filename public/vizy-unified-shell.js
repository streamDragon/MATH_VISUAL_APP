/* One navigation and a quiet visual layer over the existing Vizy lessons. */
(function(root){
 'use strict';
 const ns='http://www.w3.org/2000/svg';
 const icon=(name)=>root.VizyIcons?.create(name)||document.createTextNode('');
 const isHome=()=>location.pathname.endsWith('/learn.html')||location.pathname==='/';
 const lang=()=>document.documentElement.lang==='en'?'en':'he';
 const txt=(he,en)=>lang()==='he'?he:en;
 const els=(tag,cls)=>{const e=document.createElement(tag);if(cls)e.className=cls;return e;};
 function activePage(){
  if(isHome()&&location.hash==='#requests')return 'requests';
  if(isHome()&&location.hash==='#tools')return 'tools';
  return isHome()?'home':'tools';
 }
 function renderNav(){
  document.body.classList.add('vizy-consolidated');
  const nav=document.getElementById('vizy-unified-nav')||els('nav','vizy-unified-nav');
  nav.id='vizy-unified-nav';nav.setAttribute('aria-label',txt('ניווט Vizy','Vizy navigation'));
  if(!nav.isConnected)document.body.append(nav);
  const choices=[
   {id:'home',href:'/learn.html',name:'home',he:'בית',en:'Home'},
   {id:'requests',href:'/learn.html#requests',name:'camera',he:'שאלה',en:'Question'},
   {id:'tools',href:'/learn.html#tools',name:'tools',he:'כלים',en:'Tools'}
  ];
  nav.replaceChildren(...choices.map(choice=>{
   const a=els('a');a.href=choice.href;a.dataset.nav=choice.id;
   a.append(icon(choice.name),document.createTextNode(' '+txt(choice.he,choice.en)));
   if(choice.id===activePage())a.setAttribute('aria-current','page');
   if(choice.id==='tools'&&isHome()){
    a.setAttribute('aria-controls','vizy-tools-drawer');
    a.setAttribute('aria-expanded',String(Boolean(document.getElementById('vizy-tools-drawer')?.open)));
   }
   if(choice.id==='tools'&&isHome())a.addEventListener('click',event=>{
    const drawer=document.getElementById('vizy-tools-drawer');
    if(!drawer)return;
    event.preventDefault();
    drawer.open=!drawer.open;
    // Keep the URL and selected dock item in sync with the only tools drawer.
    // This is a view state, not a second home or a navigation to another page.
    const current=new URL(location.href);
    current.hash=drawer.open?'tools':'';
    history.replaceState(history.state,'',current.pathname+current.search+current.hash);
    renderNav();
    if(drawer.open)drawer.scrollIntoView({block:'nearest',behavior:'smooth'});
   });
   return a;
  }));
 }
 function refreshHeader(){
  const header=document.querySelector('.app-header');
  if(!header)return;
  const actions=header.querySelector('.header-actions');if(!actions)return;
  let sound=actions.querySelector('[data-vizy-slot="sound"]');
  if(!sound){sound=els('span','vizy-sound-slot');sound.dataset.vizySlot='sound';actions.prepend(sound);}
  const account=header.querySelector('#account-button');
  if(account&&!account.querySelector('svg')){account.replaceChildren(icon('user'));account.setAttribute('aria-label',txt('חשבון','Account'));}
 }
 function decorateHome(){
  if(!isHome())return;
  const card=document.querySelector('.student-next-step-content');
  if(!card)return;
  if(!card.querySelector('.vizy-home-avatar')){
   const holder=els('div','vizy-home-avatar');holder.setAttribute('aria-hidden','true');
   card.prepend(holder);root.VizyMascot?.render(holder,'idle');
  }
  const start=card.querySelector('#student-start-next');
  if(start&&!start.dataset.vizyDecorated){
   start.dataset.vizyDecorated='1';
   const text=start.textContent.replace(/[?►➜→]+\s*$/,'').trim();
   start.replaceChildren(document.createTextNode(text+' '),icon('back'));
  }
  let journey=document.getElementById('vizy-journey');
  if(!journey){
   journey=els('section','vizy-journey');journey.id='vizy-journey';
   journey.setAttribute('aria-label',txt('המסע שלי','My journey'));
   const heading=els('h3');heading.textContent=txt('המסע שלי','My journey');
   const stops=els('div','vizy-journey-stops');stops.id='vizy-journey-stops';
   journey.append(heading,stops);
   const section=document.querySelector('.student-next-step');
   if(section)section.insertAdjacentElement('afterend',journey);
  }
  const drawer=document.getElementById('vizy-tools-drawer');
  if(drawer&&journey.parentElement===drawer.parentElement&&
     (journey.compareDocumentPosition(drawer)&Node.DOCUMENT_POSITION_PRECEDING)){
    drawer.before(journey);
  }
  const bankButton=document.getElementById('vizy-open-bank');
  if(bankButton&&!bankButton.dataset.vizyFocusReady){
   bankButton.dataset.vizyFocusReady='1';
   bankButton.addEventListener('click',()=>{
    requestAnimationFrame(()=>{
     const toggle=document.getElementById('library-toggle');
     if(toggle&&toggle.getBoundingClientRect().height>0)toggle.focus({preventScroll:true});
    });
   });
  }
  const cards=Array.from(document.querySelectorAll('#bank-cards .activity-card:not(.locked)'));
  const stops=journey.querySelector('.vizy-journey-stops');
  const selection=cards;
  const firstOpen=selection.findIndex(c=>!c.classList.contains('mastered'));
  const next=firstOpen===-1?selection.length:firstOpen;
  const signature=selection.map(c=>c.classList.contains('mastered')?'1':'0').join('')+'/'+selection.map(c=>c.querySelector('h3')?.textContent).join('|')+'/'+lang();
  if(stops.dataset.signature!==signature){
   stops.dataset.signature=signature;
   stops.replaceChildren(...selection.map((card,i)=>{
    const done=card.classList.contains('mastered');
    const marker=els(done?'button':'span','vizy-journey-stop');
    marker.classList.toggle('is-done',done);marker.classList.toggle('is-next',i===next);
    marker.setAttribute('aria-label',txt('שלב','Step')+' '+(i+1)+': '+(card.querySelector('h3')?.textContent||''));
    if(done){marker.type='button';marker.title=card.querySelector('h3')?.textContent||'';marker.addEventListener('click',()=>card.querySelector('button')?.click());}
    else marker.setAttribute('aria-hidden','true');
    marker.append(done?icon('star'):document.createTextNode(String(i+1)));
    return marker;
   }));
  }
  if(!journey.querySelector('[data-vizy-slot="playtime"]')){
   const slot=els('div','vizy-journey-playtime');slot.dataset.vizySlot='playtime';
   journey.append(slot);
   root.VizyPlaytime?.render?.();
  }
 }
 function decorateInquiry(){
  if(!location.pathname.endsWith('/problem-map.html'))return;
  document.body.classList.toggle('show-error-practice',location.hash==='#flowErrors');
  document.body.classList.toggle('show-legacy-tools',new URLSearchParams(location.search).get('tools')==='1');
  const main=document.querySelector('main');
  if(main&&!document.getElementById('vizy-legacy-toggle')){
   const toggle=els('button','vizy-legacy-toggle');toggle.type='button';toggle.id='vizy-legacy-toggle';
   toggle.setAttribute('aria-expanded',String(document.body.classList.contains('show-legacy-tools')));
   function update(){toggle.textContent=document.body.classList.contains('show-legacy-tools')?txt('סגירת כלים מתקדמים','Close advanced tools'):txt('פתיחת כלים מתקדמים','Advanced tools');}
   toggle.addEventListener('click',()=>{document.body.classList.toggle('show-legacy-tools');toggle.setAttribute('aria-expanded',String(document.body.classList.contains('show-legacy-tools')));update();});
   update();main.append(toggle);
  }
  const inquiry=document.getElementById('vizyInquiry');
  const anchor=inquiry?.querySelector('#iqGivenStrip')||inquiry?.querySelector('.iq-header');
  // Keep playtime inside the lesson, never floating above the answer buttons.
  // The given strip does not exist at the initial decision; the header does.
  if(anchor&&!inquiry.querySelector('.vizy-given-tools')){
   const slot=els('div','vizy-given-tools');slot.dataset.vizySlot='playtime';
   anchor.insertAdjacentElement('afterend',slot);
   root.VizyPlaytime?.render?.();
  }
  const finished=document.querySelector('.iq-prompt #iqReset');
  if(finished&&!finished.closest('.iq-prompt').querySelector('.vizy-finish-mascot')){
   const figure=els('span','vizy-finish-mascot');figure.setAttribute('aria-hidden','true');
   finished.parentNode.insertBefore(figure,finished);
   root.VizyMascot?.render(figure,'happy');
   const next=els('a','vizy-next-activity');next.href='problem-map.html?lesson='+(new URLSearchParams(location.search).get('lesson')==='increasing'?'difference-squares':'increasing');
   next.textContent=txt('לפעילות הבאה','Next activity');
   finished.parentNode.insertBefore(next,finished);
  }
 }
 function refresh(){
  renderNav();refreshHeader();decorateHome();decorateInquiry();
 }
 root.addEventListener('hashchange',refresh);
 root.addEventListener('vizy:progress',event=>{
  if(event.detail?.type!=='activity')return;
  const mascot=document.querySelector('.vizy-home-avatar,.vizy-finish-mascot');
  if(!mascot)return;
  root.VizyMascot?.render(mascot,'happy');
  root.setTimeout(()=>{if(mascot.isConnected)root.VizyMascot?.render(mascot,'idle');},1000);
 });
 function start(){
  refresh();
  const app=document.getElementById('app');
  let observedMain=null, mainObserver=null;
  function watchMain(){
   const main=document.querySelector('#app main');
   if(main===observedMain)return;
   mainObserver?.disconnect();
   observedMain=main;
   if(main){
    mainObserver=new MutationObserver(refresh);
    mainObserver.observe(main,{childList:true,subtree:false});
   }
  }
  watchMain();
  if(app)new MutationObserver(()=>{refresh();watchMain();}).observe(app,{childList:true,subtree:false});
  const inquiry=document.getElementById('vizyInquiry');
  if(inquiry){
   let queued=false;
   new MutationObserver(()=>{if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;decorateInquiry();});}).observe(inquiry,{childList:true,subtree:false});
  }
 }
 // Deferred scripts run while readyState is 'interactive'. Wait for every
 // deferred lesson script before looking for its stage and wiring observers.
 if(document.readyState==='complete')start();
 else document.addEventListener('DOMContentLoaded',start,{once:true});
})(window);
