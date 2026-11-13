/* One site-level menu and one visual shell, without disturbing the legacy engines. */
(function(){
 'use strict';
 function activePage(){
  const path=location.pathname.toLowerCase();
  if(path.endsWith('/learn.html')&&location.hash==='#requests')return 'requests';
  if(path.endsWith('/learn.html')&&location.hash==='#tools')return 'tools';
  return path.endsWith('/learn.html')||path==='/'?'home':'tools';
 }
 function render(){
  document.body.classList.add('vizy-consolidated');
  if(location.pathname.endsWith('/problem-map.html')){
   document.body.classList.toggle('show-error-practice',location.hash==='#flowErrors');
   const params=new URLSearchParams(location.search);
   document.body.classList.toggle('show-legacy-tools',params.get('tools')==='1');
   const main=document.querySelector('main');
   if(main&&!document.getElementById('vizy-legacy-toggle')){
    const control=document.createElement('button');
    control.type='button';control.id='vizy-legacy-toggle';control.className='vizy-legacy-toggle';
    control.textContent='כלים מתקדמים של המפה';
    control.setAttribute('aria-expanded',String(document.body.classList.contains('show-legacy-tools')));
    control.onclick=()=>{
     const expanded=document.body.classList.toggle('show-legacy-tools');
     control.setAttribute('aria-expanded',String(expanded));
     control.textContent=expanded?'הסתרת כלים מתקדמים':'כלים מתקדמים של המפה';
    };
    main.append(control);
   }
  }
  let nav=document.getElementById('vizy-unified-nav');
  if(!nav){
   nav=document.createElement('nav');
   nav.id='vizy-unified-nav';
   nav.className='vizy-unified-nav';
   nav.setAttribute('aria-label','ניווט Vizy');
   document.body.append(nav);
  }
  const active=activePage();
  const choices=[
   {id:'home',url:'/learn.html',he:'בית',en:'Home',icon:'⌂'},
   {id:'requests',url:'/learn.html#requests',he:'צילום שאלה',en:'Ask a question',icon:'+'},
   {id:'tools',url:'/learn.html#tools',he:'כלים ועוד',en:'Tools',icon:'☰'}
  ];
  const english=document.documentElement.lang==='en';
  nav.replaceChildren(...choices.map(choice=>{
   const anchor=document.createElement('a');
   anchor.href=choice.url;
   anchor.dataset.nav=choice.id;
   anchor.textContent=choice.icon+' '+(english?choice.en:choice.he);
   if(choice.id===active)anchor.setAttribute('aria-current','page');
   if(choice.id==='tools'&&location.pathname.endsWith('/learn.html')){
    anchor.addEventListener('click',event=>{
     const drawer=document.getElementById('vizy-tools-drawer');
     if(!drawer)return;
     event.preventDefault();
     drawer.open=!drawer.open;
     if(drawer.open)drawer.scrollIntoView({block:'nearest',behavior:'smooth'});
    });
   }
   return anchor;
  }));
 }
 window.addEventListener('hashchange',render);
 window.addEventListener('DOMContentLoaded',()=>{
  render();
  const app=document.getElementById('app');
  if(app){
   const observer=new MutationObserver(()=>{
    const english=document.documentElement.lang==='en';
    const label=document.querySelector('#vizy-unified-nav [data-nav="home"]');
    if(label&&label.textContent.includes(english?'בית':'Home'))render();
   });
   observer.observe(app,{childList:true,subtree:false});
  }
 });
 if(document.readyState!=='loading')render();
})();
