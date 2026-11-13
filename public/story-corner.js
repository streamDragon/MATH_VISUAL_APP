/* Reusable, non-navigating story overlay for Vizy. Never alters a lesson's progress. */
(function(root){
 'use strict';
 const library=Array.isArray(root.VizyStoryLibrary)?root.VizyStoryLibrary:[];
 if(!library.length)return;
 let dialog=null,opener=null,selected=null,choice=null;
 const $=(tag,cls,content)=>{
  const el=document.createElement(tag);
  if(cls)el.className=cls;
  if(content!==undefined)el.textContent=content;
  return el;
 };
 const isEnglish=()=>document.documentElement.lang==='en';
 // Math inside Hebrew text must read left to right: isolate each math run with LRI…PDI.
 const MATH_RUN=/[\w()²³…]+(?:\s*[+\-−=×;]\s*[\w()²³…]+)*/g;
 const isolate=t=>/[֐-׿]/.test(t)?t.replace(MATH_RUN,m=>/[0-9²³()=+\-−×]/.test(m)?'⁦'+m+'⁩':m):t;
 const say=item=>isolate(typeof item==='string'?item:(item?.[isEnglish()?'en':'he']||item?.he||''));
 function close(){if(dialog?.open)dialog.close();}
 function makeButton(cls,label,handler){
  const btn=$('button',cls,label);btn.type='button';btn.addEventListener('click',handler);return btn;
 }
 function makeLink(href,label,external){
  const a=$('a','story-link',label);a.href=href;
  if(external){a.target='_blank';a.rel='noopener noreferrer';}
  return a;
 }
 function init(){
  if(dialog)return;
  dialog=$('dialog','vizy-story-dialog');
  dialog.id='vizy-story-dialog';
  dialog.setAttribute('aria-labelledby','story-dialog-title');
  dialog.addEventListener('close',()=>{if(opener?.isConnected)opener.focus({preventScroll:true});});
  dialog.addEventListener('click',e=>{if(e.target===dialog)close();});
  document.body.append(dialog);
 }
 function display(id){
  selected=library.find(s=>s.id===id)||library[0];choice=null;
  const story=selected;
  dialog.dir=isEnglish()?'ltr':'rtl';
  dialog.lang=isEnglish()?'en':'he';
  dialog.replaceChildren();
  const panel=$('div','story-panel');
  const head=$('header','story-head');
  const titleGroup=$('div','story-head-title');
  const kicker=$('span','story-kicker',isEnglish()?'VIZY · Story corner':'VIZY · פינת הסיפור');
  const heading=$('h2','',isEnglish()?'Stories behind the ideas':'סיפורים שמאחורי הרעיונות');heading.id='story-dialog-title';
  titleGroup.append(kicker,heading);
  const x=makeButton('story-close',isEnglish()?'Close ×':'סגירה ×',close);
  x.id='story-close';
  x.setAttribute('aria-label',isEnglish()?'Close story overlay':'סגירת פינת הסיפור');
  head.append(titleGroup,x);panel.append(head);
  const shelf=$('div','story-shelf');shelf.setAttribute('role','group');shelf.setAttribute('aria-label',isEnglish()?'Choose a story':'בחירת סיפור');
  for(const entry of library){
   const tab=makeButton('story-tab',entry.icon+' '+say(entry.title),()=>display(entry.id));
   tab.dataset.storyId=entry.id;tab.setAttribute('aria-pressed',String(entry.id===story.id));
   shelf.append(tab);
  }
  panel.append(shelf);
  const body=$('section','story-body');
  const storyTitle=$('h3','story-title',story.icon+' '+say(story.title));
  body.append(storyTitle);
  const scenes=$('div','story-scenes');
  for(const scene of story.scenes.slice(0,3))scenes.append($('p','story-scene',say(scene)));
  body.append(scenes);
  // One connecting question (spec rule 2a.4). No method text, no solved path.
  const question=$('section','story-question');
  question.append($('h4','',say(story.question)));
  const buttons=$('div','story-choices');
  const feedback=$('div','story-feedback');
  feedback.id='story-feedback';feedback.setAttribute('role','status');feedback.setAttribute('aria-live','polite');
  feedback.hidden=true;
  const next=$('div','story-next');next.id='story-next';next.hidden=true;
  next.append(makeLink(story.link.href,say(story.link.text)+(isEnglish()?' →':' ←'),false));
  let tries=0;
  function select(option,btn){
   choice=option.id;tries+=1;
   buttons.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(b===btn)));
   btn.dataset.verdict=option.verdict;
   feedback.hidden=false;feedback.dataset.verdict=option.verdict;
   feedback.textContent=say(option.feedback);
   if(option.verdict==='best'||tries>=2)next.hidden=false;
  }
  for(const option of story.options){
   let btn;
   btn=makeButton('story-choice',say(option.label),()=>select(option,btn));
   btn.dataset.storyChoice=option.id;btn.setAttribute('aria-pressed','false');
   buttons.append(btn);
  }
  question.append(buttons,feedback,next);body.append(question);
  const info=$('details','story-sources');
  info.append($('summary','',isEnglish()?'Origin and attribution':'מקור ודיוק היסטורי'));
  info.append($('p','',say(story.attribution)));
  info.append(makeLink(story.source.href,say(story.source.label),true));
  body.append(info);
  panel.append(body);dialog.append(panel);
 }
 function open(id='kettle',trigger=null){
  init();opener=trigger||document.activeElement;display(id);
  if(!dialog.open)dialog.showModal();
  dialog.querySelector('#story-close')?.focus({preventScroll:true});
 }
 document.addEventListener('click',e=>{
  if(!(e.target instanceof Element))return;
  const button=e.target.closest('.story-corner-trigger');
  if(!button)return;
  e.preventDefault();
  open(button.dataset.story||'kettle',button);
 });
 root.VizyStoryCorner={open,close,stories:library};
})(window);
