
/*
PROMPT 0 MAP
- Graph updates: updateParams -> updateInfo -> evaluateCurrentStep
- Question lifecycle: loadQ(idx, options) + getCurrentQuestion()
- Main anchors: #top-actions #graph-area #acc-steps #builder-notebook-box
- Existing storage: progress/feedback/scan keys in localStorage
*/
(function () {
'use strict';
const K_EXT='math_visual_codex_ext_v1';
const K_MODE='math_visual_app_mode_v1';
const K_NOTE='math_visual_profile_notebooks_v1';
const MODES={P:'practice',L:'lab',T:'teacher'};
const DEF={
  v:1,mode:MODES.P,modeChosen:false,onboardDone:false,
  profile:{name:'אורח',color:'#1f7a8c'},
  mercedes:{},trinity:{},algebra:{},rough:{},hints:{},
  video:{students:'',howto:'',teachers:''},
  neuro:{xp:0,streak:0,last:0}
};
let S=merge(read(K_EXT,{}),DEF);
let NOTE=read(K_NOTE,{});
let neuro={on:false,frozen:null};
let roughTool='draw',roughDraft=null;
let tapTimes=[],longPressTimer=null,graphTap={t:0,x:0,y:0};
const oldOnload=window.onload;
window.onload=async function(e){if(typeof oldOnload==='function')await oldOnload.call(this,e);boot();};
function boot(){
  injectStyle();injectUi();wrapFns();bind();
  applyMode(safeMode(lsGet(K_MODE)||S.mode),true);
  syncProfileChip();syncSettings();renderPresets();renderMercedes();renderTrinity();renderVideoSlots();syncNotebookExtra();
  onQChange();setTimeout(()=>{applyShared();maybeLobby();},120);
}
function wrap(name,make){const f=window[name];if(typeof f!=='function'||f.__w)return;const w=make(f);w.__w=1;window[name]=w;}
function wrapFns(){
  wrap('loadQ',f=>function(){const r=f.apply(this,arguments);setTimeout(onQChange,40);return r;});
  wrap('syncSessionUiState',f=>function(){const r=f.apply(this,arguments);applyMode(mode(),true);return r;});
  wrap('openScanModal',f=>function(){if(mode()!==MODES.T){toast('סריקה זמינה רק ב-Teacher.');return;}return f.apply(this,arguments);});
  wrap('configureVideoButton',f=>function(){const r=f.apply(this,arguments);id('btn-video')?.classList.remove('hidden');return r;});
  wrap('openVideoForCurrentQuestion',()=>function(){openVideoSlots();});
  wrap('closeVideoModal',f=>function(){const r=f.apply(this,arguments);id('codex-video-list')&&(id('codex-video-list').innerHTML='');id('codex-video-wrap')?.classList.add('hidden');id('video-embed-wrap')?.classList.remove('hidden');id('video-open-link')?.classList.remove('hidden');return r;});
  wrap('generateNotebookFromCurrentState',f=>function(){const s=f.apply(this,arguments);if(s)saveProfileNote(s);return s;});
  patchNeuroEval();
}
function patchNeuroEval(){
  if(typeof window.evaluateFunctionAt!=='function'||typeof window.evaluateDerivativeAt!=='function')return;
  const f0=window.evaluateFunctionAt,d0=window.evaluateDerivativeAt;
  window.evaluateFunctionAt=function(x){if(!neuro.on||!neuro.frozen||hasParamSpec())return f0(x);return evalKind(neuro.frozen.kind,neuro.frozen.p,x);};
  window.evaluateDerivativeAt=function(x){if(!neuro.on||!neuro.frozen||hasParamSpec())return d0(x);return derKind(neuro.frozen.kind,neuro.frozen.p,x);};
}
function bind(){
  id('btn-back-lobby')?.addEventListener('click',()=>openM('codex-lobby'));
  id('btn-open-presets')?.addEventListener('click',()=>openM('codex-presets'));
  id('btn-open-profile')?.addEventListener('click',()=>{syncSettings();openM('codex-profile');});
  id('btn-open-settings')?.addEventListener('click',()=>{syncSettings();openM('codex-profile');});
  id('btn-share-state')?.addEventListener('click',share);
  id('btn-onboard-easy')?.addEventListener('click',()=>{S.onboardDone=true;save();closeM('codex-onboard');easyExample();});
  id('btn-onboard-tour')?.addEventListener('click',()=>{S.onboardDone=true;save();closeM('codex-onboard');typeof window.openQuickTour==='function'&&window.openQuickTour({force:true});});
  id('btn-onboard-know')?.addEventListener('click',()=>{S.onboardDone=true;save();closeM('codex-onboard');});
  id('btn-onboard-skip')?.addEventListener('click',()=>{S.onboardDone=true;save();closeM('codex-onboard');});
  qsa('[data-mode]').forEach(b=>b.addEventListener('click',()=>{applyMode(safeMode(b.dataset.mode));closeM('codex-lobby');if(mode()===MODES.P)maybeOnboard();}));
  id('toggle-rough')?.addEventListener('change',e=>setRough(!!e.target.checked));
  qsa('[data-rtool]').forEach(b=>b.addEventListener('click',()=>{roughTool=b.dataset.rtool;qsa('[data-rtool]').forEach(x=>x.classList.remove('on'));b.classList.add('on');}));
  id('btn-rough-clear')?.addEventListener('click',clearRough);
  id('btn-rough-token')?.addEventListener('click',roughToToken);
  id('btn-next-hint')?.addEventListener('click',()=>shiftHint(1));
  id('btn-ack-hint')?.addEventListener('click',()=>{toast('מעולה.');shiftHint(1);});
  id('btn-add-trinity')?.addEventListener('click',()=>addTrinity(curX(),true,false));
  id('btn-copy-trinity')?.addEventListener('click',copyTrinity);
  id('trinity-adv')?.addEventListener('change',renderTrinity);
  id('btn-save-profile')?.addEventListener('click',saveProfile);
  id('btn-save-video')?.addEventListener('click',saveVideoSettings);
  id('btn-replay-onboard')?.addEventListener('click',()=>{S.onboardDone=false;save();closeM('codex-profile');openM('codex-onboard');});
  id('btn-clear-pnote')?.addEventListener('click',()=>{NOTE[pKey()]=[];saveNotes();renderProfileNotes();toast('נוקה.');});
  id('btn-neuro-reveal')?.addEventListener('click',revealNeuro);
  id('btn-neuro-close')?.addEventListener('click',()=>{stopNeuro();id('neuro-panel')?.classList.add('hidden');});
  id('btn-reset-ext')?.addEventListener('click',()=>{if(confirm('לאפס נתוני הרחבה?')){localStorage.removeItem(K_EXT);localStorage.removeItem(K_MODE);localStorage.removeItem(K_NOTE);location.reload();}});
  id('btn-reset-all')?.addEventListener('click',()=>{if(confirm('לאפס הכל?')){['math_visual_progress_v1','math_visual_feedback_v1','math_visual_scan_config_v1','math_visual_scanned_questions_v1','math_visual_quick_tour_v1','math_visual_start_guide_onboarding_v1',K_EXT,K_MODE,K_NOTE].forEach(k=>localStorage.removeItem(k));location.reload();}});
  ['codex-lobby','codex-onboard','codex-presets','codex-profile','codex-debug'].forEach(mid=>id(mid)?.addEventListener('click',e=>{if(e.target.id===mid)closeM(mid);}));
  qsa('.btn-close-modal').forEach(b=>b.addEventListener('click',()=>closeM(b.dataset.close||'')));
  qsa('.btn-add-token').forEach(b=>b.addEventListener('click',()=>addTokPrompt(b.dataset.col)));
  qsa('#preset-grid .preset').forEach(b=>b.addEventListener('click',()=>applyPresetById(b.dataset.pid)));
  bindGraphInputs();bindNeuroTriggers();bindRoughCanvas();bindDebugUnlock();
  window.addEventListener('resize',()=>{resizeRough();drawRough();});
}
function injectUi(){
  let ta=id('top-actions');if(ta){btn(ta,'btn-open-presets','🎨 פריסטים');btn(ta,'btn-share-state','🔗 שתף מצב');btn(ta,'btn-open-profile','👤 פרופיל');btn(ta,'btn-open-settings','⚙ הגדרות');}
  if(!id('btn-back-lobby')){let b=el('button');b.id='btn-back-lobby';b.textContent='לובי';document.body.appendChild(b);}
  if(!id('control-banner')){
    let w=id('graph-area-wrapper'),g=id('graph-area');
    if(w&&g){
      let d=el('div');d.id='control-banner';d.className='hidden';
      d.innerHTML='<div id=\"control-head\"><span id=\"control-icon\">🟦</span><div><div id=\"control-title\">עכשיו שולטים על:</div><div id=\"control-target\">נקודה על הגרף</div></div></div><div id=\"control-warn\" class=\"hidden\"></div><div id=\"control-pref\" class=\"hidden\"></div><label id=\"rough-row\" class=\"hidden\"><input id=\"toggle-rough\" type=\"checkbox\"> מצב סקיצה פרועה (לא מדויק)</label><div id=\"rough-purpose\" class=\"hidden\">זה לא ציור נכון. זה דף עבודה שמחזיק מידע חלקי עד שנרגעים.</div>';
      w.insertBefore(d,g);
    }
  }
  if(!id('rough-layer')){
    let g=id('graph-area');
    if(g){
      let d=el('div');d.id='rough-layer';d.className='hidden';
      d.innerHTML='<div id=\"rough-tools\"><button data-rtool=\"draw\" class=\"on\">קו</button><button data-rtool=\"point\">נקודה</button><button data-rtool=\"arrow\">חץ</button><button id=\"btn-rough-token\">העבר לציור</button><button id=\"btn-rough-clear\">נקה</button></div><canvas id=\"rough-canvas\"></canvas><div id=\"rough-cap\">approx / rough</div>';
      g.appendChild(d);
    }
  }
  let mb=id('step-mission-box')?.parentElement;
  if(mb&&!id('codex-panels')){
    let d=el('div');d.id='codex-panels';
    d.innerHTML='<details id=\"mercedes\" open><summary>המרצדס: מילים | ציור | אלגברה</summary><div class=\"mc\">אנחנו מצמצמים אי־ודאות בשלושה רבדים: מילים → ציור → אלגברה.</div><div class=\"mc\">לא פותרים כאן את המשוואות — רק בונים אותן מתוך השאלה.</div><div id=\"hint-box\"><div id=\"hint-title\">שאלה אחת שמצמצמת אי־ודאות עכשיו:</div><div id=\"hint-text\">...</div><div><button id=\"btn-next-hint\">עוד רמז</button><button id=\"btn-ack-hint\">הבנתי</button></div></div><div class=\"mgrid\"><div><div class=\"mhead\">מילים</div><div class=\"meter\"><div id=\"m-words\" class=\"fill\"></div></div><div id=\"tok-words\"></div><button class=\"btn-add-token\" data-col=\"words\">+ עובדה</button></div><div><div class=\"mhead\">ציור</div><div class=\"meter\"><div id=\"m-sketch\" class=\"fill\"></div></div><div id=\"tok-sketch\"></div><button class=\"btn-add-token\" data-col=\"sketch\">+ סימון</button></div><div><div class=\"mhead\">אלגברה</div><div class=\"meter\"><div id=\"m-algebra\" class=\"fill\"></div></div><div id=\"tok-algebra\"></div><button class=\"btn-add-token\" data-col=\"algebra\">+ אילוץ</button></div></div></details><details id=\"trinity\" open><summary>שלשה קדושה</summary><div class=\"mc\">השלשה הקדושה היא הגשר: f(x0), f’(x0)=m, (ואפשר גם f’’).</div><div class=\"mc\">כל \"?\" זה מקום שבו עדיין מותר לא לדעת.</div><div><button id=\"btn-add-trinity\">+ שלשה מ-x נוכחי</button><label><input id=\"trinity-adv\" type=\"checkbox\"> מתקדם (f’’)</label></div><div id=\"trinity-list\"></div><button id=\"btn-copy-trinity\">העתק אילוצים</button></details>';
    mb.appendChild(d);
  }
  let bn=id('builder-notebook-box');
  if(bn&&!id('notebook-extra')){let d=el('div');d.id='notebook-extra';d.className='builder-notebook-block hidden';bn.appendChild(d);}
  if(!id('profile-chip')){let p=id('learner-progress-chip');if(p){let s=el('span');s.id='profile-chip';p.insertAdjacentElement('afterend',s);}}
  if(!id('codex-video-wrap')){
    let c=id('video-modal-card'),old=id('video-embed-wrap');
    if(c){let d=el('div');d.id='codex-video-wrap';d.className='hidden';d.innerHTML='<div id=\"codex-video-list\"></div>';old&&old.parentElement?old.parentElement.insertBefore(d,old):c.appendChild(d);}
  }
  injectModals();
}
function injectModals(){
  if(!id('codex-lobby'))document.body.insertAdjacentHTML('beforeend','<div id=\"codex-lobby\" class=\"hidden cmodal\"><div class=\"ccard\"><h3>בחרו מצב עבודה</h3><div class=\"lgrid\"><button data-mode=\"practice\">🎮<b>Practice</b><small>מסלול תלמידים נקי ומודרך</small></button><button data-mode=\"lab\">🧪<b>Lab</b><small>חקירה חופשית עם כל הכלים</small></button><button data-mode=\"teacher\">🧑‍🏫<b>Teacher / Advanced</b><small>סריקה, בנייה והגדרות API</small></button></div><div class=\"note\">אפשר לחזור תמיד עם כפתור לובי.</div></div></div>');
  if(!id('codex-onboard'))document.body.insertAdjacentHTML('beforeend','<div id=\"codex-onboard\" class=\"hidden cmodal\"><div class=\"ccard\"><div class=\"step\">Step 1/3</div><h3>ברוכים הבאים ל-Practice</h3><div class=\"banner\">הסקיצה לא חייבת להיות נכונה — היא רק תיק למידע.</div><div class=\"og\"><button id=\"btn-onboard-easy\">Start easy example (10s)</button><button id=\"btn-onboard-tour\">Quick tour (30s)</button><button id=\"btn-onboard-know\">I already know — start training</button></div><button id=\"btn-onboard-skip\" class=\"link\">Skip</button></div></div>');
  if(!id('codex-presets'))document.body.insertAdjacentHTML('beforeend','<div id=\"codex-presets\" class=\"hidden cmodal\"><div class=\"ccard\"><div class=\"mh\"><h3>Preset Gallery</h3><button class=\"btn-close-modal\" data-close=\"codex-presets\">סגור</button></div><div id=\"preset-grid\"></div></div></div>');
  if(!id('codex-profile'))document.body.insertAdjacentHTML('beforeend','<div id=\"codex-profile\" class=\"hidden cmodal\"><div class=\"ccard\"><div class=\"mh\"><h3>פרופיל והגדרות</h3><button class=\"btn-close-modal\" data-close=\"codex-profile\">סגור</button></div><div class=\"pgrid\"><label>Nickname<input id=\"p-name\" type=\"text\" maxlength=\"24\"></label><label>Avatar color<input id=\"p-color\" type=\"color\"></label><button id=\"btn-save-profile\">שמור פרופיל</button></div><div class=\"sec\"><h4>Video Slots</h4><label>לתלמידים — 60 שניות<input id=\"v-students\" type=\"url\" dir=\"ltr\" placeholder=\"https://youtu.be/...\"/></label><label>איך משתמשים — 2 דקות<input id=\"v-howto\" type=\"url\" dir=\"ltr\" placeholder=\"https://youtu.be/...\"/></label><label>למורים — 4 דקות<input id=\"v-teachers\" type=\"url\" dir=\"ltr\" placeholder=\"https://youtu.be/...\"/></label><button id=\"btn-save-video\">שמור וידאו</button></div><div class=\"sec\"><button id=\"btn-replay-onboard\">הפעל onboarding מחדש</button></div><div class=\"sec\"><h4>My notebook</h4><div id=\"profile-notes\"></div><button id=\"btn-clear-pnote\">נקה מחברת פרופיל</button></div></div></div>');
  if(!id('codex-debug'))document.body.insertAdjacentHTML('beforeend','<div id=\"codex-debug\" class=\"hidden cmodal\"><div class=\"ccard\"><div class=\"mh\"><h3>Debug Reset</h3><button class=\"btn-close-modal\" data-close=\"codex-debug\">סגור</button></div><button id=\"btn-reset-ext\">איפוס נתוני הרחבה בלבד</button><button id=\"btn-reset-all\">איפוס כל נתוני האפליקציה המקומיים</button></div></div>');
  if(!id('neuro-panel'))document.body.insertAdjacentHTML('beforeend','<div id=\"neuro-panel\" class=\"hidden\"><h4>Neural Imagination Mode</h4><label>סימן שיפוע ב-x0<select id=\"n-slope\"><option value=\"\"></option><option value=\"negative\">negative</option><option value=\"zero\">zero</option><option value=\"positive\">positive</option></select></label><label>יש קיצון קרוב?<select id=\"n-ext\"><option value=\"\"></option><option value=\"yes\">yes</option><option value=\"no\">no</option></select></label><label>y(x0) מעל/מתחת ל-0<select id=\"n-y\"><option value=\"\"></option><option value=\"above\">above</option><option value=\"below\">below</option></select></label><div><button id=\"btn-neuro-reveal\">Reveal</button><button id=\"btn-neuro-close\">סגור</button></div><div id=\"n-feed\"></div><div id=\"n-chip\"></div></div>');
}
function mode(){return safeMode(S.mode||MODES.P);}
function safeMode(m){return m===MODES.L||m===MODES.T?m:MODES.P;}
function applyMode(m,skip){
  m=safeMode(m);S.mode=m;S.modeChosen=true;
  if(!skip){save();lsSet(K_MODE,m);}
  document.body.classList.toggle('mode-p',m===MODES.P);
  document.body.classList.toggle('mode-l',m===MODES.L);
  document.body.classList.toggle('mode-t',m===MODES.T);
  setModeChip(m);syncModeButtons();syncByQuestion(q());
  if(m===MODES.P)maybeOnboard();
}
function setModeChip(m){
  let c=id('mode-chip');
  if(!c){let w=id('top-question-wrap');if(w){c=el('span');c.id='mode-chip';w.appendChild(c);}}
  if(c)c.textContent=m===MODES.P?'Mode: Practice':m===MODES.L?'Mode: Lab':'Mode: Teacher';
}
function syncModeButtons(){
  const t=mode()===MODES.T,pl=mode()===MODES.P||mode()===MODES.L;
  id('btn-scan-question')?.classList.toggle('hidden',!t);
  id('btn-side-scan')?.classList.toggle('hidden',!t);
  id('btn-open-presets')?.classList.toggle('hidden',!pl);
  id('btn-open-settings')?.classList.toggle('hidden',mode()===MODES.P);
}
function syncByQuestion(qq){
  const allowP=!!(qq&&(qq.mode==='find_param'||qq.goal==='hit_target'||qq.goal==='hit_targets'||qq.goal==='free'));
  if(mode()===MODES.P){
    hide('acc-item-formulas',1);hide('acc-item-tools',1);hide('acc-item-params',!allowP);hide('codex-panels',0);
    if(!allowP&&typeof window.openAccordion==='function')window.openAccordion('steps');
  }else{
    hide('acc-item-formulas',0);hide('acc-item-tools',0);hide('acc-item-params',0);hide('codex-panels',0);
  }
}
function onQChange(){
  const qq=q();syncByQuestion(qq);syncControl(qq);seedTok(qq);seedTrinity(qq);highlightPref(qq);renderMercedes();renderTrinity();syncNotebookExtra();syncRoughByQ(qq);
  if(mode()===MODES.P&&qq&&qq.mode==='find_param'&&typeof window.openBuilderFromTop==='function')setTimeout(()=>window.openBuilderFromTop(),80);
}
function syncControl(qq){
  let b=id('control-banner');if(!b)return;
  b.classList.toggle('hidden',!(mode()===MODES.P&&qq));
  if(!(mode()===MODES.P&&qq))return;
  const fp=qq.mode==='find_param'||qq.goal==='hit_target'||qq.goal==='hit_targets';
  id('control-icon').textContent=fp?'🎚️':'🟦';
  id('control-target').textContent=fp?'פרמטרים (a,b,c,...)':'נקודה על הגרף';
  let w=id('control-warn');
  if(w){if(fp){w.classList.remove('hidden');w.innerHTML='⚠️ סקיצה לא מדויקת: אנחנו מציירים כדי לשמור מידע — לא כדי להיות צודקים.<br>המטרה: לצמצם אי־ודאות.';}else w.classList.add('hidden');}
  const pref=(qq.data&&Array.isArray(qq.data.preferredEditableParams))?qq.data.preferredEditableParams:[];
  let p=id('control-pref');
  if(p){if(fp&&pref.length){p.classList.remove('hidden');p.textContent=pref.includes('e')?'Try this first: התחילו מ-e (הזזה למעלה/למטה)':'Try this first: התחילו מ-'+pref[0];}else p.classList.add('hidden');}
  id('rough-row')?.classList.toggle('hidden',!fp);
  if(!fp){if(id('toggle-rough'))id('toggle-rough').checked=false;setRough(false);}
}
function highlightPref(qq){
  ['A','B','C','D','E','F'].forEach(k=>id('inp'+k)?.closest('.slider-row')?.classList.remove('param-rec'));
  let pref=(qq&&qq.data&&Array.isArray(qq.data.preferredEditableParams))?qq.data.preferredEditableParams:[];
  pref.forEach(k=>id('inp'+String(k).toUpperCase())?.closest('.slider-row')?.classList.add('param-rec'));
}
function maybeLobby(){if(!S.modeChosen)openM('codex-lobby');else if(mode()===MODES.P)maybeOnboard();}
function maybeOnboard(){if(mode()!==MODES.P||S.onboardDone)return;openM('codex-onboard');}
function easyExample(){
  let L=typeof window.getQuestionsList==='function'?window.getQuestionsList():[];
  if(!Array.isArray(L)||!L.length||typeof window.loadQ!=='function')return;
  let i=L.findIndex(x=>x&&x.mode==='move_x'&&(x.goal==='read_y'||x.goal==='read_slope'||x.goal==='slope_zero'));if(i<0)i=0;
  window.loadQ(i,{autoOpenOverlay:false});
  toast('וואו: הסקיצה לא חייבת להיות נכונה — היא רק תיק למידע.');
}
function renderPresets(){
  let g=id('preset-grid');if(!g)return;
  let P=Array.isArray(window.PRESET_LIBRARY)?window.PRESET_LIBRARY:[];g.innerHTML='';
  P.forEach(p=>{let b=el('button');b.className='preset';b.dataset.pid=p.id;b.innerHTML='<b>'+esc(p.title)+'</b><small>'+esc(p.instruction||'')+'</small>'+(p.mission?'<small class=\"m\">'+esc(p.mission)+'</small>':'');b.addEventListener('click',()=>applyPresetById(p.id));g.appendChild(b);});
}
function applyPresetById(pid){
  let P=Array.isArray(window.PRESET_LIBRARY)?window.PRESET_LIBRARY:[];
  let p=P.find(x=>x.id===pid);if(!p)return;
  if(typeof window.applyTemplateById==='function'&&p.templateId)window.applyTemplateById(p.templateId,false);
  setInp('inpA',p.params?.a);setInp('inpB',p.params?.b);setInp('inpC',p.params?.c);setInp('inpD',p.params?.d);setInp('inpE',p.params?.e);setInp('inpF',p.params?.f);
  typeof window.updateParams==='function'&&window.updateParams();
  typeof window.fitBoardToCurrentFunction==='function'&&window.fitBoardToCurrentFunction();
  board()?.update();
  closeM('codex-presets');
  p.instruction&&toast(p.instruction);
  p.mission&&setTimeout(()=>toast(p.mission),380);
}
function syncProfileChip(){let c=id('profile-chip');if(!c)return;c.style.setProperty('--pc',S.profile?.color||'#1f7a8c');c.textContent='● '+(S.profile?.name||'אורח');}
function syncSettings(){if(id('p-name'))id('p-name').value=S.profile?.name||'אורח';if(id('p-color'))id('p-color').value=S.profile?.color||'#1f7a8c';if(id('v-students'))id('v-students').value=S.video?.students||'';if(id('v-howto'))id('v-howto').value=S.video?.howto||'';if(id('v-teachers'))id('v-teachers').value=S.video?.teachers||'';renderProfileNotes();}
function saveProfile(){let n=(id('p-name')?.value||'').trim()||'אורח';let c=(id('p-color')?.value||'').trim();if(!/^#[0-9a-f]{6}$/i.test(c))c='#1f7a8c';S.profile={name:n,color:c};save();syncProfileChip();toast('הפרופיל נשמר.');}
function saveVideoSettings(){S.video={students:(id('v-students')?.value||'').trim(),howto:(id('v-howto')?.value||'').trim(),teachers:(id('v-teachers')?.value||'').trim()};save();toast('וידאו נשמר.');}
function openVideoSlots(){renderVideoSlots();id('video-modal')?.classList.remove('hidden');}
function renderVideoSlots(){
  let w=id('codex-video-wrap'),l=id('codex-video-list');if(!w||!l)return;
  id('video-modal-title')&&(id('video-modal-title').textContent='וידאו הסבר - 3 מסלולים');
  id('video-embed-wrap')?.classList.add('hidden');id('video-open-link')?.classList.add('hidden');w.classList.remove('hidden');l.innerHTML='';
  let qq=q();let slots=[{k:'students',t:'לתלמידים — 60 שניות',u:(S.video?.students||qq?.videoUrl||'')},{k:'howto',t:'איך משתמשים — 2 דקות',u:(S.video?.howto||'')},{k:'teachers',t:'למורים — 4 דקות',u:(S.video?.teachers||'')}];
  slots.forEach(s=>{let e=yt(s.u),d=el('div');d.className='vcard';d.innerHTML='<div class=\"vt\">'+esc(s.t)+'</div>'+(e?'<iframe src=\"'+esc(e)+'\" allow=\"accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share\" allowfullscreen></iframe>':'<div class=\"vph\">עדיין אין URL לוידאו הזה.<br>Paste URL in settings</div><button class=\"btn-open-settings-inline\">פתח הגדרות</button>');l.appendChild(d);});
  qsa('.btn-open-settings-inline',l).forEach(b=>b.addEventListener('click',()=>{closeM('video-modal');syncSettings();openM('codex-profile');}));
}
function share(){
  let u=new URL(location.href),p=u.searchParams;p.set('appMode',mode());let qi=curQi();Number.isFinite(qi)&&p.set('q',String(qi));let tpl=id('template-select')?.value;tpl&&p.set('tpl',tpl);
  ['A','B','C','D','E','F'].forEach(k=>{let v=id('inp'+k)?.value;if(v!=null)p.set('p'+k.toLowerCase(),String(v));});
  let x=curX();Number.isFinite(x)&&p.set('x0',String(Number(x.toFixed(4))));
  u.search=p.toString();copy(u.toString(),'לינק השיתוף הועתק.');
}
function applyShared(){
  try{
    let p=new URL(location.href).searchParams;
    if(!(p.has('tpl')||p.has('q')||p.has('pa')||p.has('appMode')))return;
    p.has('appMode')&&applyMode(safeMode(p.get('appMode')));
    let qi=Number(p.get('q'));if(Number.isFinite(qi)&&typeof window.loadQ==='function')window.loadQ(qi,{autoOpenOverlay:false,preserveCurrentFunction:true});
    let tpl=(p.get('tpl')||'').trim();tpl&&typeof window.applyTemplateById==='function'&&window.applyTemplateById(tpl,false);
    ['a','b','c','d','e','f'].forEach(k=>{let v=p.get('p'+k);if(v!==null)setInp('inp'+k.toUpperCase(),Number(v));});
    typeof window.updateParams==='function'&&window.updateParams();typeof window.fitBoardToCurrentFunction==='function'&&window.fitBoardToCurrentFunction();
    let x0=Number(p.get('x0'));if(Number.isFinite(x0)&&typeof window.p!=='undefined'&&window.p&&typeof window.p.setCoords==='function')window.p.setCoords(x0,fx(x0));
    board()?.update();
  }catch(_){}
}
function pKey(){return ((S.profile?.name||'guest').trim().toLowerCase()||'guest');}
function saveProfileNote(s){
  let k=pKey();if(!Array.isArray(NOTE[k]))NOTE[k]=[];
  NOTE[k].unshift((s.timeLabel||'')+' | '+(s.questionLabel||'שאלה')+' | '+(s.equationCount||0)+' משוואות');
  NOTE[k]=NOTE[k].slice(0,40);saveNotes();renderProfileNotes();
}
function renderProfileNotes(){
  let w=id('profile-notes');if(!w)return;let arr=(Array.isArray(NOTE[pKey()])?NOTE[pKey()].slice():[]);
  let extra=alg(false)||[];if(extra.length)arr=arr.concat(extra.map(x=>'אילוץ: '+x));
  w.innerHTML=arr.length?'<ol>'+arr.map(x=>'<li>'+esc(x)+'</li>').join('')+'</ol>':'<div class=\"empty\">אין עדיין מחברת שמורה לפרופיל הזה.</div>';
}
function q(){return typeof window.getCurrentQuestion==='function'?window.getCurrentQuestion():null;}
function qKey(){let qq=q();if(qq&&(typeof qq.id==='number'||typeof qq.id==='string'))return String(qq.id);let t=(qq?.title||'').trim();if(t)return 'title:'+t;return 'idx:'+curQi();}
function mer(create){let k=qKey();if(!S.mercedes[k]&&create)S.mercedes[k]={words:[],sketch:[],algebra:[]};return S.mercedes[k]||{words:[],sketch:[],algebra:[]};}
function tri(create){let k=qKey();if(!Array.isArray(S.trinity[k])&&create)S.trinity[k]=[];return S.trinity[k]||[];}
function setTri(v){S.trinity[qKey()]=Array.isArray(v)?v:[];}
function alg(create){let k=qKey();if(!Array.isArray(S.algebra[k])&&create)S.algebra[k]=[];return S.algebra[k]||[];}
function rough(create){let k=qKey();if(!S.rough[k]&&create)S.rough[k]={strokes:[],points:[],arrows:[]};return S.rough[k]||null;}
function seedTok(qq){
  if(!qq||!(qq.mode==='find_param'||qq.goal==='hit_target'||qq.goal==='hit_targets'))return;
  let t=Array.isArray(qq?.data?.targets)?qq.data.targets[0]:null;if(!t||!Number.isFinite(t.x)||!Number.isFinite(t.y))return;
  let txt='הגרף עובר דרך ('+fmt(t.x)+','+fmt(t.y)+')',m=mer(true);if(!m.words.some(x=>x.text===txt)){m.words.push(tok(txt,'High'));save();}
}
function seedTrinity(qq){
  if(!qq||!Number.isFinite(qq?.data?.fixedX0))return;
  let x=Number(qq.data.fixedX0),a=tri(true);if(a.some(c=>Math.abs(Number(c.x0)-x)<0.001))return;
  addTrinity(x,true,true);
}
function tok(text,c){return {id:Date.now().toString(36)+Math.random().toString(36).slice(2,6),text:String(text||'').trim(),c:normC(c)};}
function normC(c){return c==='High'||c==='Guess'?c:'Medium';}
function addTokPrompt(col){let t=prompt('כתבו טוקן קצר:','');if(!t)return;let c=normC(prompt('רמת ודאות: High / Medium / Guess','Medium'));addTok(col,t,c);}
function addTok(col,text,c){let m=mer(true),arr=m[col];if(!Array.isArray(arr))return;arr.push(tok(text,c));save();renderMercedes();}
function delTok(col,idv){let m=mer(true),arr=Array.isArray(m[col])?m[col]:[];m[col]=arr.filter(x=>x.id!==idv);save();renderMercedes();}
function w2a(t){let p=ptInText(t);if(!p)return'';return 'f('+fmt(p.x)+')='+fmt(p.y);}
function ptInText(t){let m=String(t||'').match(/\\(\\s*(-?\\d+(?:\\.\\d+)?)\\s*,\\s*(-?\\d+(?:\\.\\d+)?)\\s*\\)/);if(!m)return null;let x=Number(m[1]),y=Number(m[2]);return Number.isFinite(x)&&Number.isFinite(y)?{x,y}:null;}
function renderMercedes(){let m=mer(true);rTok('words',m.words);rTok('sketch',m.sketch);rTok('algebra',m.algebra);meter('words',m.words);meter('sketch',m.sketch);meter('algebra',m.algebra);renderHint(m);}
function rTok(col,list){let w=id('tok-'+col);if(!w)return;w.innerHTML='';if(!list||!list.length){w.innerHTML='<div class=\"empty\">אין עדיין טוקנים</div>';return;}list.forEach(t=>{let d=el('div');d.className='ti';let h='<div class=\"tt\">'+esc(t.text)+'</div><div class=\"tm\"><select class=\"tc\"><option'+(t.c==='High'?' selected':'')+'>High</option><option'+(t.c==='Medium'?' selected':'')+'>Medium</option><option'+(t.c==='Guess'?' selected':'')+'>Guess</option></select>';if(col==='words'&&w2a(t.text))h+='<button class=\"ta\">הפוך לאלגברה</button>';h+='<button class=\"td\">מחק</button></div>';d.innerHTML=h;d.querySelector('.tc').addEventListener('change',e=>{t.c=normC(e.target.value);save();renderMercedes();});let a=d.querySelector('.ta');a&&a.addEventListener('click',()=>addTok('algebra',w2a(t.text),t.c));d.querySelector('.td').addEventListener('click',()=>delTok(col,t.id));w.appendChild(d);});}
function meter(col,list){let v=unc(list),f=id('m-'+col);if(f)f.style.width=(100-v)+'%';}
function unc(list){let s=90;(list||[]).forEach(t=>{s-=t.c==='High'?18:t.c==='Medium'?12:7;});return clamp(Math.round(s),8,95);}
function hints(qq,m){let h=[],w=m.words||[],a=m.algebra||[],s=m.sketch||[];let ww=w.find(t=>w2a(t.text));if(ww){let p=w2a(ww.text);if(!a.some(x=>nsp(x.text)===nsp(p)))h.push('תרגום מומלץ: נקודה על הגרף פירושה f(a)=b.');}if(a.some(t=>/f'\(/.test(t.text))&&!s.some(t=>/שיפוע|חץ|slope/i.test(t.text)))h.push('יש נגזרת באלגברה? סמנו גם חץ כיוון בציור.');if(qq&&(qq.mode==='find_param'||qq.goal==='hit_target'||qq.goal==='hit_targets')){let pref=Array.isArray(qq?.data?.preferredEditableParams)?qq.data.preferredEditableParams:[];if(pref.includes('e'))h.push('בשאלת פרמטרים כזאת, כדאי להתחיל מ-e כדי להתאים את החיתוך עם ציר y.');else if(pref.length)h.push('בשאלת פרמטרים כזאת, התחילו מ-'+pref[0]+'.');}if((tri(false)||[]).length===0)h.push('צרו שלשה קדושה אחת: f(x0), f’(x0), ואולי גם f’’.');if(!h.length)h.push('כמו 20 שאלות: כל צעד קטן מוריד אי־ודאות.');return h;}
function renderHint(m){let hs=hints(q(),m),k=qKey();if(!Number.isFinite(S.hints[k]))S.hints[k]=0;let i=S.hints[k]%hs.length;id('hint-text')&&(id('hint-text').textContent=hs[i]);}
function shiftHint(n){let k=qKey();if(!Number.isFinite(S.hints[k]))S.hints[k]=0;S.hints[k]+=n;save();renderMercedes();}
function addTrinity(x,capture,silent){
  if(!Number.isFinite(x))x=0;x=Number(x.toFixed(3));
  let a=tri(true);if(a.some(t=>Math.abs(Number(t.x0)-x)<0.001)){if(!silent)toast('כרטיס x0 הזה כבר קיים.');return;}
  let fxv='?',dfv='?',d2='?';if(capture){fxv=fmt(fx(x));dfv=fmt(df(x));d2=fmt(d2f(x));}
  a.push({id:'tri_'+Date.now().toString(36)+Math.random().toString(36).slice(2,6),x0:fmt(x),fx:fxv,df:dfv,d2:d2});save();renderTrinity();if(!silent)toast('נוסף כרטיס שלשה.');
}
function renderTrinity(){
  let w=id('trinity-list');if(!w)return;let a=tri(true);w.innerHTML='';if(!a.length){w.innerHTML='<div class=\"empty\">עדיין אין כרטיסי שלשה.</div>';return;}
  let adv=!!id('trinity-adv')?.checked;
  a.forEach(t=>{
    let d=el('div');d.className='tri';
    d.innerHTML=`<div class=\"th\">שלשה קדושה בנקודה x0 = <input class=\"tx0\" data-id=\"${t.id}\" value=\"${esc(String(t.x0))}\"></div>
<div class=\"tr\">f(x0)= <input class=\"tfx\" data-id=\"${t.id}\" value=\"${esc(String(t.fx))}\"></div>
<div class=\"tr\">f'(x0)= <input class=\"tdf\" data-id=\"${t.id}\" value=\"${esc(String(t.df))}\"></div>
<div class=\"tr t2 ${adv?'':'hidden'}\">f''(x0)= <input class=\"td2\" data-id=\"${t.id}\" value=\"${esc(String(t.d2))}\"></div>
<div class=\"ta\"><button class=\"tb\" data-id=\"${t.id}\">הפוך לאלגברה</button><button class=\"td\" data-id=\"${t.id}\">מחק</button></div>`;
    w.appendChild(d);
  });
  qsa('input',w).forEach(i=>i.addEventListener('change',uTri));
  qsa('.td',w).forEach(b=>b.addEventListener('click',()=>{setTri(tri(true).filter(x=>x.id!==b.dataset.id));save();renderTrinity();}));
  qsa('.tb',w).forEach(b=>b.addEventListener('click',()=>triToAlg(b.dataset.id)));
}
function uTri(){let a=tri(true);a.forEach(t=>{let idv=t.id;t.x0=sv(q1('.tx0[data-id=\"'+idv+'\"]')?.value);t.fx=sv(q1('.tfx[data-id=\"'+idv+'\"]')?.value);t.df=sv(q1('.tdf[data-id=\"'+idv+'\"]')?.value);t.d2=sv(q1('.td2[data-id=\"'+idv+'\"]')?.value);});save();}
function sv(v){let t=String(v==null?'':v).trim();return t||'?';}
function unk(v){let t=sv(v);return t==='?'||t.toLowerCase()==='unknown';}
function triLines(t){
  let x=sv(t.x0),L=[];
  if(!unk(t.fx))L.push(`f(${x})=${sv(t.fx)}`);
  if(!unk(t.df))L.push(`f'(${x})=${sv(t.df)}`);
  if(!unk(t.d2)){
    let d=sv(t.d2);
    L.push(/^[<>]=?|^=/.test(d)?`f''(${x})${d}`:`f''(${x})=${d}`);
  }
  return L;
}
function triToAlg(idv){let t=tri(true).find(x=>x.id===idv);if(!t)return;let L=triLines(t);if(!L.length){toast('אין מספיק מידע בכרטיס.');return;}let a=alg(true);L.forEach(x=>{if(x&&!a.includes(x))a.push(x);});save();syncNotebookExtra();renderProfileNotes();toast('האילוצים נוספו למחברת.');}
function copyTrinity(){let out=[];tri(true).forEach(t=>{out=out.concat(triLines(t));});if(!out.length){toast('אין אילוצים להעתקה.');return;}copy(out.join('\\n'),'הועתקו אילוצי שלשה.');}
function syncNotebookExtra(){let w=id('notebook-extra');if(!w)return;let a=alg(true);if(!a.length){w.classList.add('hidden');w.innerHTML='';return;}w.classList.remove('hidden');w.innerHTML='<div class=\"builder-notebook-block-title\">אילוצים מהשלשה הקדושה</div><ol class=\"builder-notebook-list\">'+a.map(x=>'<li>'+esc(x)+'</li>').join('')+'</ol><div class=\"builder-notebook-controls\"><button id=\"btn-copy-extra\">העתק מחברת</button></div>';id('btn-copy-extra')?.addEventListener('click',()=>copy(a.join('\\n'),'המחברת הועתקה.'));}
function bindGraphInputs(){
  let g=id('graph-area');if(!g)return;
  g.addEventListener('pointerdown',e=>{graphTap={t:Date.now(),x:e.clientX,y:e.clientY};});
  g.addEventListener('pointerup',e=>{let dt=Date.now()-graphTap.t,dist=Math.hypot(e.clientX-graphTap.x,e.clientY-graphTap.y);if(dt>350||dist>8||mode()!==MODES.P)return;let x=px2x(e);Number.isFinite(x)&&addTrinity(x,true,false);});
}
function bindRoughCanvas(){
  let c=id('rough-canvas');if(!c)return;
  c.addEventListener('pointerdown',rDown);c.addEventListener('pointermove',rMove);c.addEventListener('pointerup',rUp);c.addEventListener('pointerleave',rUp);c.addEventListener('pointercancel',rUp);
}
function syncRoughByQ(qq){
  let fp=!!(qq&&(qq.mode==='find_param'||qq.goal==='hit_target'||qq.goal==='hit_targets'));
  id('rough-row')?.classList.toggle('hidden',!(mode()===MODES.P&&fp));
  let en=!!id('toggle-rough')?.checked;if(!(mode()===MODES.P&&fp)){en=false;if(id('toggle-rough'))id('toggle-rough').checked=false;}
  setRough(en);
}
function setRough(on){id('rough-layer')?.classList.toggle('hidden',!on);id('rough-purpose')?.classList.toggle('hidden',!on);document.body.classList.toggle('rough-on',!!on);if(on){resizeRough();drawRough();}}
function clearRough(){let r=rough(true);r.strokes=[];r.points=[];r.arrows=[];save();drawRough();}
function roughToToken(){let r=rough(false);if(!r){toast('אין סקיצה להעביר.');return;}addTok('sketch','סקיצה rough: '+r.strokes.length+' קווים, '+r.points.length+' נקודות, '+r.arrows.length+' חיצים','Medium');toast('הסקיצה הועברה לעמודת ציור.');}
function rDown(e){if(!document.body.classList.contains('rough-on'))return;let c=id('rough-canvas');if(!c)return;let p=cPos(e,c),r=rough(true);if(roughTool==='point'){let L=r.points.length<26?String.fromCharCode(65+r.points.length):('P'+(r.points.length+1));r.points.push({x:p.rx,y:p.ry,label:L});save();drawRough();return;}roughDraft={id:e.pointerId,tool:roughTool,pts:[{x:p.rx,y:p.ry}],s:{x:p.rx,y:p.ry}};c.setPointerCapture(e.pointerId);}
function rMove(e){if(!roughDraft||e.pointerId!==roughDraft.id)return;let c=id('rough-canvas');if(!c)return;let p=cPos(e,c);if(roughDraft.tool==='draw'){roughDraft.pts.push({x:p.rx,y:p.ry});drawRough(roughDraft);}else if(roughDraft.tool==='arrow'){roughDraft.e={x:p.rx,y:p.ry};drawRough(roughDraft);}}
function rUp(e){if(!roughDraft||e.pointerId!==roughDraft.id)return;let r=rough(true);if(roughDraft.tool==='draw'&&roughDraft.pts.length>1)r.strokes.push({pts:roughDraft.pts.slice()});else if(roughDraft.tool==='arrow'){let ee=roughDraft.e||roughDraft.s;r.arrows.push({x1:roughDraft.s.x,y1:roughDraft.s.y,x2:ee.x,y2:ee.y});}roughDraft=null;save();drawRough();}
function resizeRough(){let c=id('rough-canvas'),g=id('graph-area');if(!c||!g)return;let r=g.getBoundingClientRect(),w=Math.max(220,Math.round(r.width)),h=Math.max(220,Math.round(r.height));if(c.width!==w||c.height!==h){c.width=w;c.height=h;}}
function drawRough(draft){
  let c=id('rough-canvas');if(!c)return;let x=c.getContext('2d');if(!x)return;x.clearRect(0,0,c.width,c.height);let r=rough(false)||{strokes:[],points:[],arrows:[]};x.lineCap='round';x.lineJoin='round';
  (r.strokes||[]).forEach(s=>{let p=s.pts||[];if(p.length<2)return;x.beginPath();x.strokeStyle='#0b4f6c';x.lineWidth=2.4;let a=rp(p[0],c);x.moveTo(a.x,a.y);for(let i=1;i<p.length;i++){let b=rp(p[i],c);x.lineTo(b.x,b.y);}x.stroke();});
  (r.points||[]).forEach(p=>{let a=rp(p,c);x.beginPath();x.fillStyle='#f97316';x.arc(a.x,a.y,5,0,Math.PI*2);x.fill();x.fillStyle='#111827';x.font='12px Assistant, sans-serif';x.fillText(p.label||'P',a.x+7,a.y-6);});
  (r.arrows||[]).forEach(a=>arr(x,rp({x:a.x1,y:a.y1},c),rp({x:a.x2,y:a.y2},c),'#7c3aed'));
  if(draft){if(draft.tool==='draw'&&draft.pts?.length>1){x.beginPath();x.strokeStyle='#1d4ed8';x.lineWidth=2;let a=rp(draft.pts[0],c);x.moveTo(a.x,a.y);for(let i=1;i<draft.pts.length;i++){let b=rp(draft.pts[i],c);x.lineTo(b.x,b.y);}x.stroke();}if(draft.tool==='arrow'&&draft.s&&draft.e)arr(x,rp(draft.s,c),rp(draft.e,c),'#4c1d95');}
}
function arr(x,a,b,col){x.beginPath();x.strokeStyle=col;x.lineWidth=2.2;x.moveTo(a.x,a.y);x.lineTo(b.x,b.y);x.stroke();let ang=Math.atan2(b.y-a.y,b.x-a.x),h=9;x.beginPath();x.fillStyle=col;x.moveTo(b.x,b.y);x.lineTo(b.x-h*Math.cos(ang-Math.PI/7),b.y-h*Math.sin(ang-Math.PI/7));x.lineTo(b.x-h*Math.cos(ang+Math.PI/7),b.y-h*Math.sin(ang+Math.PI/7));x.closePath();x.fill();}
function bindNeuroTriggers(){
  let g=id('graph-area');if(g)g.addEventListener('pointerup',()=>{tapTimes.push(Date.now());tapTimes=tapTimes.filter(t=>Date.now()-t<800);if(tapTimes.length>=3){tapTimes=[];startNeuro('triple');}});
  let t=id('top-formula-tag');if(t){t.addEventListener('pointerdown',()=>{clearTimeout(longPressTimer);longPressTimer=setTimeout(()=>startNeuro('long'),900);});['pointerup','pointerleave','pointercancel'].forEach(e=>t.addEventListener(e,()=>clearTimeout(longPressTimer)));}
  let w=id('builder-equation-write');if(w)w.addEventListener('input',()=>{if((w.value||'').trim().toLowerCase()==='neuro'){w.value='';startNeuro('kw');}});
}
function startNeuro(src){
  if(neuro.on)return;
  if(hasParamSpec()){toast('Neural mode פעיל כרגע רק בשאלות תבנית רגילות.');return;}
  neuro.on=true;neuro.frozen={src,kind:kind(),p:liveP(),x0:curX()};
  document.body.classList.add('neuro-on');id('neuro-panel')?.classList.remove('hidden');id('n-feed')&&(id('n-feed').textContent='שנו פרמטרים/מיקום, נבאו, ואז לחצו Reveal.');
  toast('Neural Imagination Mode הופעל.');typeof window.updateInfo==='function'&&window.updateInfo();board()?.update();
}
function stopNeuro(){neuro.on=false;document.body.classList.remove('neuro-on');typeof window.updateInfo==='function'&&window.updateInfo();board()?.update();}
function revealNeuro(){
  let x=curX(),p=liveP(),k=kind(),d=derKind(k,p,x),y=evalKind(k,p,x),dl=derKind(k,p,x-0.25),dr=derKind(k,p,x+0.25);
  let ss=d>0.05?'positive':d<-0.05?'negative':'zero',ex=(Math.abs(d)<0.12||dl*dr<0)?'yes':'no',ys=y>0?'above':'below';
  let ps=id('n-slope')?.value||'',pe=id('n-ext')?.value||'',py=id('n-y')?.value||'';let hit=0;if(ps===ss)hit++;if(pe===ex)hit++;if(py===ys)hit++;
  let acc=Math.round(hit/3*100),gain=hit*10;S.neuro.xp=Number(S.neuro?.xp||0)+gain;S.neuro.streak=hit>=2?Number(S.neuro?.streak||0)+1:0;S.neuro.last=acc;save();
  let map=[];if(neuro.frozen){let f=neuro.frozen.p||{};if(Math.abs((p.e||0)-(f.e||0))>0.15)map.push('You correctly linked e -> הזזה למעלה/למטה.');if(Math.abs((p.a||0)-(f.a||0))>0.15)map.push('You correctly linked a -> פתיחה/רוחב.');if(Math.abs((p.d||0)-(f.d||0))>0.15)map.push('You correctly linked d -> שיפוע מקומי.');}
  id('n-feed')&&(id('n-feed').textContent='Prediction accuracy: '+acc+'% ('+hit+'/3)\\nמציאות: slope='+ss+', extremum='+ex+', y='+ys+(map[0]?('\\n'+map[0]):''));renderNeuroChip();stopNeuro();toast('Reveal: דיוק '+acc+'%');
}
function renderNeuroChip(){id('n-chip')&&(id('n-chip').textContent='Neuro XP '+Number(S.neuro?.xp||0)+' | רצף '+Number(S.neuro?.streak||0)+' | דיוק אחרון '+Number(S.neuro?.last||0)+'%');}
function bindDebugUnlock(){let a=[id('top-version-badge'),id('build-badge')].filter(Boolean),t=[];a.forEach(e=>e.addEventListener('click',()=>{t.push(Date.now());t=t.filter(x=>Date.now()-x<2000);if(t.length>=5){t=[];openM('codex-debug');}}));}
function curQi(){let s=id('top-question-select');let n=Number(s?.value);return Number.isFinite(n)?n:0;}
function curX(){if(typeof window.p!=='undefined'&&window.p&&typeof window.p.X==='function'){let v=Number(window.p.X());if(Number.isFinite(v))return v;}let t=document.querySelector('.jxgbox')?.textContent||'',m=t.match(/x\\s*=\\s*(-?\\d+(?:\\.\\d+)?)/i);return m?Number(m[1]):0;}
function px2x(ev){let b=board(),g=id('graph-area');if(!b||!g)return NaN;let r=g.getBoundingClientRect();if(r.width<=0)return NaN;let q=clamp((ev.clientX-r.left)/r.width,0,1),bb=b.getBoundingBox();return Array.isArray(bb)&&bb.length>=4?bb[0]+q*(bb[2]-bb[0]):NaN;}
function board(){if(typeof window.board!=='undefined'&&window.board&&typeof window.board.update==='function')return window.board;let bs=window.JXG?.JSXGraph?.boards?Object.values(window.JXG.JSXGraph.boards):[];return bs.find(b=>b&&typeof b.update==='function')||null;}
function kind(){let idv=id('template-select')?.value||'',L=Array.isArray(window.FUNCTION_TEMPLATES)?window.FUNCTION_TEMPLATES:[],t=L.find(x=>x.id===idv)||L[0];return t?.kind||'poly3';}
function liveP(){return {a:num('inpA'),b:num('inpB'),c:num('inpC'),d:num('inpD'),e:num('inpE'),f:num('inpF')};}
function num(idv){let n=Number(id(idv)?.value);return Number.isFinite(n)?n:0;}
function fx(x){return typeof window.evaluateFunctionAt==='function'?window.evaluateFunctionAt(x):0;}
function df(x){if(typeof window.getSlope==='function')return window.getSlope(x);return typeof window.evaluateDerivativeAt==='function'?window.evaluateDerivativeAt(x):0;}
function d2f(x){if(typeof window.getSecondDerivativeAt==='function')return window.getSecondDerivativeAt(x);let h=0.001;return (df(x+h)-df(x-h))/(2*h);}
function hasParamSpec(){let qq=q();return !!(qq&&qq.parameter&&typeof qq.parameter==='object');}
function evalKind(k,p,x){if(!Number.isFinite(x))return 0;if(k==='poly2')return p.a*x*x+p.b*x+p.c;if(k==='poly5')return p.a*x**5+p.b*x**4+p.c*x**3+p.d*x**2+p.e*x+p.f;if(k==='poly4')return p.a*x**4+p.b*x**3+p.c*x**2+p.d*x+p.e;if(k==='line')return p.c*x+p.d;if(k==='quad_shift'){let kk=p.c;return (x-kk)*(x-kk)+p.d;}return p.a*x**3+p.b*x**2+p.c*x+p.d;}
function derKind(k,p,x){if(!Number.isFinite(x))return 0;if(k==='poly2')return 2*p.a*x+p.b;if(k==='poly5')return 5*p.a*x**4+4*p.b*x**3+3*p.c*x**2+2*p.d*x+p.e;if(k==='poly4')return 4*p.a*x**3+3*p.b*x**2+2*p.c*x+p.d;if(k==='line')return p.c;if(k==='quad_shift')return 2*(x-p.c);return 3*p.a*x**2+2*p.b*x+p.c;}
function cPos(e,c){let r=c.getBoundingClientRect(),x=clamp(e.clientX-r.left,0,r.width),y=clamp(e.clientY-r.top,0,r.height);return {rx:r.width?x/r.width:0,ry:r.height?y/r.height:0};}
function rp(p,c){return {x:(Number(p.x)||0)*c.width,y:(Number(p.y)||0)*c.height};}
function setInp(idv,v){if(!Number.isFinite(v))return;let i=id(idv);if(i)i.value=String(v);}
function yt(u){if(!u)return'';try{let x=new URL(u);if(x.hostname.includes('youtu.be')){let idv=x.pathname.split('/').filter(Boolean)[0];if(idv)return 'https://www.youtube.com/embed/'+idv;}if(x.hostname.includes('youtube.com')){if(x.pathname.startsWith('/embed/'))return u;let idv=x.searchParams.get('v');if(idv)return 'https://www.youtube.com/embed/'+idv;}}catch(_){}return'';}
function fmt(v){let n=Number(v);if(!Number.isFinite(n))return'?';return n.toFixed(2).replace(/\\.00$/,'').replace(/(\\.\\d)0$/,'$1');}
function nsp(t){return String(t||'').replace(/\\s+/g,' ').trim();}
function save(){lsSet(K_EXT,JSON.stringify(S));lsSet(K_MODE,S.mode||MODES.P);}
function saveNotes(){lsSet(K_NOTE,JSON.stringify(NOTE));}
function read(k,f){try{let r=localStorage.getItem(k);if(!r)return f;let j=JSON.parse(r);return j&&typeof j==='object'?j:f;}catch(_){return f;}}
function merge(v,d){if(!v||typeof v!=='object')return JSON.parse(JSON.stringify(d));let o=Array.isArray(d)?[]:{};Object.keys(d).forEach(k=>{let dd=d[k],vv=v[k];if(dd&&typeof dd==='object'&&!Array.isArray(dd))o[k]=merge(vv,dd);else if(Array.isArray(dd))o[k]=Array.isArray(vv)?vv.slice():dd.slice();else o[k]=typeof vv==='undefined'?dd:vv;});Object.keys(v).forEach(k=>{if(typeof o[k]==='undefined')o[k]=v[k];});return o;}
function lsSet(k,v){try{localStorage.setItem(k,v);}catch(_){}}
function lsGet(k){try{return localStorage.getItem(k)||'';}catch(_){return '';}}
function openM(idv){id(idv)?.classList.remove('hidden');}
function closeM(idv){id(idv)?.classList.add('hidden');}
function hide(idv,h){let x=id(idv);if(x)x.classList.toggle('hidden',!!h);}
function toast(t){if(typeof window.showStepToast==='function'){window.showStepToast(t);return;}console.log(t);}
function copy(t,ok){if(!t)return;navigator.clipboard.writeText(String(t)).then(()=>ok&&toast(ok)).catch(()=>prompt('העתקה ידנית:',t));}
function btn(parent,idv,t){if(id(idv))return;let b=el('button');b.id=idv;b.type='button';b.textContent=t;parent.appendChild(b);}
function id(x){return document.getElementById(x);}
function qsa(s,root){return Array.from((root||document).querySelectorAll(s));}
function q1(s){return document.querySelector(s);}
function el(t){return document.createElement(t);}
function esc(t){return String(t||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\"/g,'&quot;').replace(/'/g,'&#39;');}
function clamp(v,a,b){return Math.max(a,Math.min(b,v));}
function injectStyle(){
  if(id('codex-style'))return;
  let s=el('style');s.id='codex-style';s.textContent=`
#btn-back-lobby{position:fixed;left:12px;bottom:14px;z-index:3500;border:1px solid #334155;background:#0f172a;color:#fff;border-radius:999px;padding:7px 12px;font-weight:700}
#mode-chip{display:inline-flex;align-items:center;border-radius:999px;border:1px solid #cbd5e1;background:#f8fafc;color:#1e293b;font-size:.76rem;padding:3px 9px;margin-top:4px}
#profile-chip{display:inline-flex;align-items:center;gap:5px;margin-right:6px;padding:2px 8px;border:1px solid #cbd5e1;border-radius:999px;background:#fff;color:#0f172a;font-size:.74rem}
#profile-chip::before{content:'';width:9px;height:9px;border-radius:999px;background:var(--pc,#1f7a8c);display:inline-block}
#control-banner{margin:8px 12px 0;background:linear-gradient(135deg,#eefaf5 0,#fff 62%);border:1px solid #8fd3b8;border-radius:12px;padding:8px 10px;box-shadow:0 8px 18px rgba(15,23,42,.08)}
#control-head{display:flex;align-items:center;gap:10px}#control-icon{font-size:1.4rem}#control-title{font-weight:800;color:#14532d}#control-target{font-size:.92rem;color:#134e4a}
#control-warn{margin-top:6px;padding:6px 8px;border-radius:9px;background:#fff1f2;border:1px solid #fecdd3;color:#9f1239;font-size:.85rem;line-height:1.45}
#control-pref{margin-top:6px;color:#0f766e;font-size:.84rem;font-weight:700}#rough-row{margin-top:7px;font-size:.85rem;color:#1f2937;display:inline-flex;align-items:center;gap:6px}#rough-purpose{margin-top:6px;font-size:.8rem;color:#334155}
.param-rec{border:1px solid #22c55e!important;border-radius:10px;box-shadow:0 0 0 2px rgba(34,197,94,.18),0 0 22px rgba(34,197,94,.24);animation:pr 1.2s ease-in-out infinite}@keyframes pr{0%{box-shadow:0 0 0 0 rgba(34,197,94,.35)}70%{box-shadow:0 0 0 8px rgba(34,197,94,0)}100%{box-shadow:0 0 0 0 rgba(34,197,94,0)}}
#codex-panels{margin-top:12px;display:grid;gap:12px}#codex-panels details{border:1px solid #cbd5e1;border-radius:12px;background:#fff;padding:6px 8px 9px}#codex-panels summary{cursor:pointer;font-weight:800;color:#0f172a;margin-bottom:7px}.mc{font-size:.82rem;color:#334155;line-height:1.35;margin-bottom:4px}
#hint-box{margin:8px 0;padding:8px;border-radius:10px;background:#f8fafc;border:1px solid #cbd5e1}#hint-title{font-size:.79rem;color:#1e293b;font-weight:700}#hint-text{margin-top:4px;font-size:.87rem;color:#0f172a;line-height:1.35}
.mgrid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}.mgrid>div{border:1px solid #e2e8f0;border-radius:10px;padding:7px;background:#f8fafc}.mhead{font-size:.82rem;font-weight:800;color:#0f172a;margin-bottom:4px}.meter{height:7px;border-radius:999px;background:#fecaca;overflow:hidden}.fill{height:100%;width:0;background:linear-gradient(90deg,#ef4444 0,#f59e0b 48%,#22c55e 100%)}
.empty{font-size:.78rem;color:#64748b}.ti{border:1px solid #cbd5e1;background:#fff;border-radius:8px;padding:6px;display:grid;gap:5px}.tt{font-size:.8rem;color:#0f172a;line-height:1.32}.tm{display:flex;gap:5px;flex-wrap:wrap}.tm select,.tm button,.btn-add-token{border:1px solid #94a3b8;border-radius:7px;padding:3px 6px;font-size:.74rem;background:#fff;color:#1e293b}.tm .td{border-color:#ef4444;color:#991b1b}.btn-add-token{margin-top:5px;width:100%;font-weight:700}
.tri{border:1px solid #cbd5e1;background:#f8fafc;border-radius:10px;padding:7px}.th{font-size:.82rem;color:#0f172a;font-weight:800}.tr{margin-top:4px;font-size:.81rem;color:#1e293b;display:flex;align-items:center;gap:5px}.tr input,.th input{min-width:66px;border:1px solid #94a3b8;border-radius:6px;padding:3px 5px;font-size:.78rem}.ta{margin-top:7px;display:flex;gap:6px}.ta button,#trinity button{border:1px solid #94a3b8;background:#fff;border-radius:8px;padding:4px 8px;font-weight:700;color:#334155}
#rough-layer{position:absolute;inset:0;z-index:25;background:rgba(248,250,252,.12);backdrop-filter:blur(.6px)}#rough-tools{position:absolute;top:8px;right:8px;display:flex;flex-wrap:wrap;gap:6px;z-index:2;max-width:calc(100% - 16px)}#rough-tools button{border:1px solid #64748b;border-radius:8px;padding:4px 8px;background:#fff;color:#0f172a;font-size:.74rem;font-weight:700}#rough-tools .on{background:#0f172a;color:#f8fafc}#rough-canvas{width:100%;height:100%;touch-action:none}#rough-cap{position:absolute;left:8px;bottom:8px;font-size:.72rem;color:#0f172a;background:rgba(255,255,255,.85);border:1px solid #94a3b8;border-radius:999px;padding:3px 8px}
body.rough-on #graph-area .jxgbox,body.neuro-on #graph-area .jxgbox{opacity:.15!important}
.cmodal{position:fixed;inset:0;z-index:3400;background:rgba(15,23,42,.56);display:grid;place-items:center;padding:14px}.ccard{width:min(980px,96vw);max-height:92vh;overflow:auto;background:#fff;border-radius:14px;border:1px solid #cbd5e1;box-shadow:0 18px 32px rgba(2,6,23,.26);padding:14px}.mh{display:flex;justify-content:space-between;align-items:center;gap:10px}.mh button{border:1px solid #94a3b8;background:#fff;border-radius:8px;padding:5px 9px;font-weight:700}
.lgrid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;margin-top:10px}.lgrid button{border:1px solid #cbd5e1;border-radius:12px;background:linear-gradient(160deg,#f8fafc 0,#eef2ff 100%);padding:12px;text-align:right}.lgrid b{display:block;margin-top:8px}.lgrid small{display:block;margin-top:4px;color:#334155;line-height:1.35}
.step{font-size:.78rem;color:#0f766e;font-weight:800}.banner{margin-top:8px;padding:8px 10px;border-radius:10px;background:#fef3c7;border:1px solid #fcd34d;color:#92400e;font-weight:700;font-size:.86rem}.og{display:grid;gap:8px;margin-top:11px}.og button{border:1px solid #0f172a;background:#fff;border-radius:10px;padding:9px 10px;text-align:right;font-weight:800}.link{margin-top:9px;border:0;background:none;color:#2563eb;text-decoration:underline}
#preset-grid{margin-top:10px;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}.preset{text-align:right;border:1px solid #cbd5e1;border-radius:10px;background:linear-gradient(145deg,#fff 0,#f5faff 100%);padding:10px}.preset b{display:block}.preset small{display:block;margin-top:4px;font-size:.8rem;color:#334155;line-height:1.3}.preset small.m{color:#0f766e;font-weight:700}
.pgrid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin-top:8px}.pgrid label{display:grid;gap:4px;font-size:.8rem;color:#334155}.pgrid input,.sec input{border:1px solid #94a3b8;border-radius:8px;padding:7px}.sec{margin-top:12px;display:grid;gap:7px}.sec h4{margin:0;color:#0f172a}.sec button,.pgrid button{border:1px solid #94a3b8;border-radius:8px;padding:6px 9px;background:#fff;font-weight:700;color:#1e293b}
#profile-notes{border:1px solid #cbd5e1;border-radius:8px;background:#f8fafc;min-height:66px;max-height:180px;overflow:auto;padding:8px;font-size:.8rem;color:#334155}
#codex-video-list{display:grid;gap:8px}.vcard{border:1px solid #cbd5e1;border-radius:10px;padding:8px;background:#f8fafc}.vt{font-weight:800;color:#0f172a;margin-bottom:6px}.vcard iframe{width:100%;border:0;border-radius:10px;aspect-ratio:16/9}.vph{border:1px dashed #94a3b8;border-radius:8px;padding:10px;color:#334155;background:#fff;font-size:.84rem}
#neuro-panel{position:fixed;right:12px;bottom:72px;z-index:3200;width:min(330px,92vw);border:1px solid #4338ca;border-radius:12px;background:#eef2ff;box-shadow:0 14px 26px rgba(30,27,75,.24);padding:10px}#neuro-panel h4{margin:0;color:#312e81}#neuro-panel label{margin-top:6px;display:grid;gap:4px;font-size:.82rem;color:#1e1b4b}#neuro-panel select{border:1px solid #a5b4fc;border-radius:7px;padding:4px 6px;background:#fff}#neuro-panel button{border:1px solid #6366f1;border-radius:8px;background:#fff;color:#312e81;font-weight:700;padding:5px 9px;margin-top:8px}#n-feed{margin-top:8px;font-size:.81rem;color:#1e1b4b;white-space:pre-line}#n-chip{margin-top:6px;font-size:.77rem;color:#3730a3;font-weight:700}
@media (max-width:980px){.mgrid{grid-template-columns:1fr}.lgrid{grid-template-columns:1fr}#preset-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.pgrid{grid-template-columns:1fr}}@media (max-width:680px){#preset-grid{grid-template-columns:1fr}#btn-back-lobby{bottom:calc(12px + env(safe-area-inset-bottom,0px))}}
`;document.head.appendChild(s);
}
})();
