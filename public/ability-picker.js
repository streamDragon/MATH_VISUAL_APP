/* One next meaning step per grade. Other modules are secondary, not competing CTAs. */
(function(){
 'use strict';
 const host=document.getElementById('app');
 if(!host)return;
 const steps={
  9:{he:'מזהים מבנה: הפרש ריבועים',en:'Recognize structure: difference of squares',url:'problem-map.html?lesson=difference-squares'},
  11:{he:'פונקציה עולה או חיובית?',en:'Increasing or positive?',url:'problem-map.html?lesson=increasing'}
 };
 function readGrade(){
  try{const v=JSON.parse(localStorage.getItem('vizy_home_grade')||'"9"');return String(v)==='11'?11:9;}catch{return 9;}
 }
 function english(){return document.documentElement.lang==='en'}
 function link(href,he,en){const a=document.createElement('a');a.href=href;a.textContent=english()?en:he;return a;}
 function apply(){
  const card=document.querySelector('.student-next-step');
  if(!card)return;
  const grade=readGrade(),lang=english()?'en':'he',token=grade+'|'+lang;
  if(card.dataset.vizyUnified===token)return;
  card.dataset.vizyUnified=token;
  const content=card.querySelector('.student-next-step-content');
  if(!content)return;
  const heading=content.querySelector('h2');
  if(heading)heading.textContent=english()?'One idea to explore':'רעיון אחד שמגלים';
  const description=content.querySelector('p');
  if(description)description.textContent=steps[grade][lang];
  const extra=content.querySelector('.ability-picker');
  extra?.remove();
  content.querySelector('.ability-extra')?.remove();
  const old=content.querySelector('#student-start-next');
  if(old)old.hidden=true;
  let action=content.querySelector('#student-start-ability');
  if(!action){
   action=document.createElement('a');
   action.id='student-start-ability';action.className='primary vizy-single-cta';
   content.append(action);
  }
  action.href=steps[grade].url;
  action.textContent=english()?'Explore this idea':'בואו נבדוק';
  action.setAttribute('aria-label',(english()?'Start: ':'מתחילים: ')+steps[grade][lang]);
  const all=content.querySelector('[data-home-grade="all"]');
  if(all)all.hidden=true;
  content.querySelectorAll('[data-home-grade]').forEach(button=>{if(!button.hidden)button.setAttribute('aria-pressed',String(button.dataset.homeGrade===String(grade)));});
  for(const section of document.querySelectorAll('.problem-map-promo,.unified-tools,.challenge-library,.home-legacy-actions')){
   section.hidden=true;section.setAttribute('aria-hidden','true');
  }
  let drawer=document.querySelector('#vizy-tools-drawer');
  if(!drawer){
   drawer=document.createElement('details');drawer.id='vizy-tools-drawer';drawer.className='vizy-tools-drawer';
   const summary=document.createElement('summary');summary.textContent=english()?'Tools and more':'כלים ועוד';
   drawer.append(summary);
   const links=document.createElement('div');links.className='vizy-tools-links';
   links.append(
    link('problem-map.html?lesson=slope-minus-four','שיפוע ‎−4','Slope −4'),
    link('problem-map.html?lesson=parameter','מפת קיצון','Extremum meaning map'),
    link('problem-map.html?lesson=shared','שני גרפים ונקודה משותפת','Two functions and a shared point'),
    link('classroom-practice.html','תרגול מודרך','Guided practice'),
    link('skill-lab.html','מעבדת מיומנויות','Skill lab'),
    link('/?workspace=1&splash=0','מעבדת הגרפים','Graph lab'),
    link('privacy.html','פרטיות','Privacy'),
    link('review.html','תור המורה','Teacher review queue')
   );
   const stories=document.createElement('button');stories.type='button';stories.className='story-corner-trigger';
   stories.dataset.story='kettle';stories.textContent=english()?'☕ Story corner':'☕ פינת הסיפורים';
   links.append(stories);
   const bank=document.createElement('button');bank.type='button';bank.className='vizy-secondary-button';
   bank.id='vizy-open-bank';
   bank.textContent=english()?'Show challenge bank':'הצגת כל האתגרים';
   bank.addEventListener('click',()=>{
    const library=document.querySelector('#challenges');if(!library)return;
    library.hidden=false;library.removeAttribute('aria-hidden');
    const toggle=library.querySelector('#library-toggle');
    if(toggle?.getAttribute('aria-expanded')==='false')toggle.click();
    library.scrollIntoView({block:'start'});
   });
   links.append(bank);
   drawer.append(links);
   card.insertAdjacentElement('afterend',drawer);
  }else{
   drawer.querySelector('summary').textContent=english()?'Tools and more':'כלים ועוד';
  }
  if(location.hash==='#tools')drawer.open=true;
 }
 const observer=new MutationObserver(()=>apply());
 observer.observe(host,{childList:true,subtree:true});
 window.addEventListener('hashchange',()=>{
  if(location.hash==='#tools'){
   const drawer=document.getElementById('vizy-tools-drawer');
   if(drawer){drawer.open=true;drawer.scrollIntoView({block:'nearest'});}
  }
 });
 apply();
})();
