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
 function savedStep(grade){
  const kind=grade===11?'graph':'map';
  try{
   const state=JSON.parse(localStorage.getItem('vizy_inquiry_v1_'+kind)||'null');
   if(!state||!Array.isArray(state.route)||!Number.isInteger(state.index)||state.index<0)return null;
   const phase=state.route[state.index];
   if(phase==='done')return 'done';
   if(!phase||phase==='choose'||(state.index===0&&phase==='shape'))return null;
   const names={
    he:{criterion:'מזהים מה הנתונים קובעים',shape:'מזהים את המבנה',reason:'בודקים למה המבנה מתאים',partA:'בודקים את החלק הראשון',partB:'בודקים את החלק השני',rule:'מנסחים את הכלל',return:'מחברים לשאלה המקורית',tidy:'מסדרים את הביטוי',check:'בודקים את המבנה',transfer:'מעבירים את הרעיון לשאלה חדשה',done:'החקירה הושלמה'},
    en:{criterion:'identify what the given determines',shape:'recognize the structure',reason:'check why the structure fits',partA:'explore the first part',partB:'explore the second part',rule:'state the rule',return:'connect it to the original question',tidy:'tidy the expression',check:'check the structure',transfer:'apply the idea to a new question',done:'the investigation is complete'}
   };
   return names[english()?'en':'he'][phase]||(english()?'continue the current step':'ממשיכים לשלב הנוכחי');
  }catch{return null}
 }
 function link(href,he,en){const a=document.createElement('a');a.href=href;a.textContent=english()?en:he;return a;}
 function apply(){
  const card=document.querySelector('.student-next-step');
  if(!card)return;
  const grade=readGrade(),lang=english()?'en':'he',token=grade+'|'+lang;
  if(card.dataset.vizyUnified===token)return;
  card.dataset.vizyUnified=token;
  const content=card.querySelector('.student-next-step-content');
  if(!content)return;
  const action=content.querySelector('#student-start-ability');
  if(!action)return;
  const resume=savedStep(grade);
  const completed=resume==='done';
  action.textContent=completed?(english()?'Review the summary':'צופים בסיכום'):resume?(english()?'Continue: ':'ממשיכים: ')+resume:(english()?'Explore this idea':'בואו נבדוק');
  action.setAttribute('aria-label',completed?(english()?'Review the summary':'צופים בסיכום'):resume?(english()?'Continue: ':'ממשיכים: ')+resume:(english()?'Start: ':'מתחילים: ')+steps[grade][lang]);
  const library=document.querySelector('.challenge-library');
  if(library){library.hidden=true;library.setAttribute('aria-hidden','true');}
  let drawer=document.querySelector('#vizy-tools-drawer');
  if(!drawer){
   drawer=document.createElement('details');drawer.id='vizy-tools-drawer';drawer.className='vizy-tools-drawer';
   const summary=document.createElement('summary');summary.textContent=english()?'Tools and more':'כלים ועוד';
   drawer.append(summary);
   const links=document.createElement('div');links.className='vizy-tools-links';
   links.append(
    link('problem-map.html?lesson=concept-lenses','עדשות על אותו דבר','Concept lenses'),
    link('problem-map.html?lesson=algebra-worlds','מפרקים כדי לצמצם · כיתה י״א','Factor to simplify · grade 11'),
    link('problem-map.html?lesson=slope-minus-four','שיפוע ‎−4','Slope −4'),
    link('problem-map.html?lesson=parameter','מפת קיצון','Extremum meaning map'),
    link('problem-map.html?lesson=shared','שני גרפים ונקודה משותפת','Two functions and a shared point'),
    link('classroom-practice.html','תרגול מודרך','Guided practice'),
    link('skill-lab.html','מעבדת מיומנויות','Skill lab'),
    link('/?workspace=1&splash=0','מעבדת הגרפים','Graph lab'),
    link('privacy.html','פרטיות','Privacy')
   );
   // Teacher pages stay out of the student's drawer. Opening the home once with ?teacher=1
   // shows the teacher link on that device from then on.
   let teacher=false;
   try{
    if(new URLSearchParams(location.search).get('teacher')==='1')localStorage.setItem('vizy_teacher_v1','1');
    teacher=localStorage.getItem('vizy_teacher_v1')==='1';
   }catch{}
   if(teacher)links.append(link('review.html','תור המורה','Teacher review queue'));
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
 window.addEventListener('pageshow',()=>{
  const card=document.querySelector('.student-next-step');
  if(card)delete card.dataset.vizyUnified;
  apply();
 });
 apply();
})();
