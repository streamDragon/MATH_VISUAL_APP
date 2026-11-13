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
 const say=item=>typeof item==='string'?item:(item?.[isEnglish()?'en':'he']||item?.he||'');
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
  body.append($('span','story-eyebrow',say(story.eyebrow)));
  const storyTitle=$('h3','story-title',story.icon+' '+say(story.title));
  body.append(storyTitle);
  const scenes=$('div','story-scenes');
  for(const [i,scene] of story.scenes.entries()){
   const row=$('div','story-scene');
   row.append($('span','story-scene-index',String(i+1)), $('p','',say(scene)));
   scenes.append(row);
  }
  body.append(scenes);
  const question=$('section','story-question');
  question.append($('h4','',say(story.dilemma)));
  const buttons=$('div','story-choices');
  const feedback=$('div','story-feedback');
  feedback.id='story-feedback';feedback.setAttribute('role','status');feedback.setAttribute('aria-live','polite');
  feedback.hidden=true;
  const bridge=$('section','story-bridge');
  bridge.id='story-bridge';bridge.hidden=true;
  function select(option,btn){
   choice=option.id;
   buttons.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(b===btn)));
   feedback.hidden=false;
   feedback.textContent=say(option.feedback);
   bridge.hidden=false;
  }
  for(const option of story.options){
   let btn;
   btn=makeButton('story-choice',say(option.label),()=>select(option,btn));
   btn.dataset.storyChoice=option.id;btn.setAttribute('aria-pressed','false');
   buttons.append(btn);
  }
  question.append(buttons,feedback);body.append(question);
  bridge.append($('h4','',say(story.bridgeTitle)));
  if(story.id==='kettle'){
   const familiar=$('div','story-familiar-path');
   familiar.append($('strong','',isEnglish()?'First: the familiar route':'קודם כול: השביל שכבר מכירים'));
   familiar.append($('p','',isEnglish()?'Expand parentheses, then collect like terms. The shortcut is built on this understanding.':'פותחים סוגריים ומכנסים איברים דומים. רק אחרי שמבינים את הדרך הזאת, לומדים לזהות קיצור.'));
   familiar.append($('span','story-expression','x² + 2x + 1 − 9 = x² + 2x − 8'));
   bridge.append(familiar);
   const path=$('div','story-math-path');
   const specific=$('div','story-path-node');
   specific.append($('strong','',isEnglish()?'The new problem':'הבעיה החדשה'));
   specific.append($('span','story-expression','(x+1)² − 9'));
   const up=$('div','story-path-arrow',isEnglish()?'↑ Recognize the structure':'↑ מזהים את המבנה');
   const general=$('div','story-path-node');
   general.append($('strong','',isEnglish()?'The familiar general case':'המקרה הכללי שכבר הכרנו'));
   general.append($('span','story-expression','A² − B²'));
   general.append($('small','',isEnglish()?'A = x+1 ; B = 3':'A = x+1 ; B = 3'));
   const across=$('div','story-path-arrow',isEnglish()?'⇢ Apply the known identity':'⇢ משתמשים בזהות המוכרת');
   const rule=$('div','story-path-node');
   rule.append($('span','story-expression','A² − B² = (A−B)(A+B)'));
   const down=$('div','story-path-arrow',isEnglish()?'↓ Substitute and simplify':'↓ מציבים ומפשטים');
   const result=$('div','story-path-node story-path-result');
   result.append($('span','story-expression','(x−2)(x+4)'));
   path.append(specific,up,general,across,rule,down,result);
   bridge.append(path);
   const proof=$('details','story-proof');
   proof.append($('summary','',isEnglish()?'The path we already know: expand and collect like terms':'השביל שכבר הכרנו: פותחים סוגריים ומכנסים איברים דומים'));
   const walk=$('p','story-proof-label',isEnglish()?'Without a shortcut, we can start with the same example:':'בלי קיצור דרך, מתחילים מאותו ביטוי:');
   const proofText=$('p','story-expression','(x+1)² − 9 = (x+1)(x+1) − 9');
   const expand=$('p','story-expression','= x² + 2x + 1 − 9');
   const collect=$('p','story-expression','= x² + 2x − 8');
   const generalProof=$('p','story-expression',say(story.known));
   proof.append(walk,proofText,expand,collect,$('p','story-proof-label',isEnglish()?'The same idea proves the general identity:':'ובאותו רעיון מוכיחים את הזהות הכללית:'),generalProof);
   bridge.append(proof);
  }else{
   const steps=$('div','story-mini-path');
   for(const [label,formula] of [
    [story.knownLabel,story.known],
    [story.bridgeLabel,story.shortcut],
    [story.applicationLabel,story.example]
   ]){
    const node=$('div','story-mini-node');
    node.append($('strong','',say(label)), $('span','story-expression',say(formula)));
    steps.append(node);
    if(steps.children.length<5)steps.append($('span','story-down-arrow','↓'));
   }
   bridge.append(steps);
  }
  bridge.append($('p','story-takeaway',say(story.takeaway)));
  bridge.append(makeLink(story.link.href,say(story.link.text),false));
  body.append(bridge);
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
