(()=>{'use strict';
const svg=document.getElementById('liveGraph');
if(!svg)return;
const ns='http://www.w3.org/2000/svg';
const host=document.getElementById('liveCurves');
const tangent=document.getElementById('liveTangent');
const feedback=document.getElementById('visualFeedback');
const languageButtons=[...document.querySelectorAll('[data-representation]')];
const movementButtons=[...document.querySelectorAll('[data-move]')];
const representationNote=document.getElementById('representationNote');
const key='vizy_problem_map_v2',target=2,tolerance=0.08;
const min=-2,max=4,scaleX=50,scaleY=20,originX=250,originY=200;
let lowPoint=0,focusMode=null,frame=0,drag=null;
try{const stored=JSON.parse(localStorage.getItem(key)||'null');if(stored?.problemId==='parameter-extremum'&&Number.isFinite(stored.lowPoint))lowPoint=Math.max(min,Math.min(max,stored.lowPoint));}catch{}
const make=(tag,attrs={})=>{const e=document.createElementNS(ns,tag);for(const [k,v]of Object.entries(attrs))e.setAttribute(k,String(v));return e;};
const clip=make('clipPath',{id:'curveClip'});
clip.append(make('rect',{x:1,y:1,width:498,height:308,rx:12}));
const defs=make('defs');defs.append(clip);svg.insertBefore(defs,host);
host.setAttribute('clip-path','url(#curveClip)');
const clamp=v=>Math.max(min,Math.min(max,v));
const onLine=v=>Math.abs(v-target)<=tolerance;
const aFromLow=x=>-2*x;
function curvePath(low){
 const a=aFromLow(low),parts=[];
 for(let x=-4.65;x<=4.7;x+=0.04){
  const px=originX+x*scaleX,py=originY-(x*x+a*x)*scaleY;
  parts.push((parts.length?'L':'M')+px.toFixed(2)+' '+py.toFixed(2));
 }
 return parts.join(' ');
}
function render(){
 host.replaceChildren();tangent.replaceChildren();
 for(const x of [-1.55,0.8,3.45])host.append(make('path',{d:curvePath(x),class:'ghost-curve'}));
 host.append(make('path',{d:curvePath(lowPoint),class:'curve','data-chosen':'true'}));
 const vx=originX+lowPoint*scaleX,vy=originY+lowPoint*lowPoint*scaleY;
 host.append(make('circle',{cx:vx,cy:vy,r:6,class:'vertex','data-chosen':'true'}));
 if(focusMode==='picture'||focusMode==='algebra')tangent.append(make('path',{d:'M'+(vx-42)+' '+vy+'H'+(vx+42),class:'tangent'}));
 if(onLine(lowPoint)){
  feedback.textContent='נקודת השפל על הקו x = 2. מכל המשפחה נשארה פרבולה אחת. כמה שווה a? את זה מחשבים בכיתה.';
  feedback.dataset.state='correct';
 }else{
  feedback.textContent='גררו את הפרבולה. איפה צריכה להיות נקודת השפל?';
  feedback.dataset.state='';
 }
 languageButtons.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.representation===focusMode)));
 const phrase=document.querySelector('[data-phrase="x"]');
 if(phrase)phrase.classList.toggle('is-linked',focusMode==='words');
 if(representationNote)representationNote.textContent=focusMode==='words'?'המילים נותנות את המקום x = 2. הקו הכתום מראה אותו בגרף.':focusMode==='picture'?'נקודת השפל היא הקיצון, והמשיק שם אופקי.':focusMode==='algebra'?'משיק אופקי פירושו שיפוע אפס. את הקשר המתאים אפשר לבחור בלשונית ייצוג.':'לחצו על אחת משלוש השפות כדי לראות את הקשר.';
}
function setLow(v,notify=true){
 if(!Number.isFinite(v))return;
 v=clamp(v);if(onLine(v))v=target;
 if(Math.abs(lowPoint-v)<0.000001)return;
 lowPoint=v;
 if(frame)cancelAnimationFrame(frame);
 frame=requestAnimationFrame(()=>{frame=0;render();});
 if(notify)window.dispatchEvent(new CustomEvent('vizy:visual-position',{detail:{x:lowPoint}}));
}
const svgX=e=>{const ctm=svg.getScreenCTM();if(!ctm)return null;return new DOMPoint(e.clientX,e.clientY).matrixTransform(ctm.inverse()).x;};
svg.addEventListener('pointerdown',e=>{
 if(e.button!==0&&e.pointerType==='mouse')return;
 const x=svgX(e);if(x===null)return;
 drag={id:e.pointerId,startX:x,startLow:lowPoint};
 svg.setPointerCapture(e.pointerId);
});
svg.addEventListener('pointermove',e=>{
 if(!drag||e.pointerId!==drag.id)return;
 const x=svgX(e);if(x===null)return;
 setLow(drag.startLow+(x-drag.startX)/scaleX);
});
const end=e=>{
 if(!drag||drag.id!==e.pointerId)return;
 if(svg.hasPointerCapture(e.pointerId))svg.releasePointerCapture(e.pointerId);
 drag=null;
 window.dispatchEvent(new CustomEvent('vizy:visual-position',{detail:{x:lowPoint}}));
};
svg.addEventListener('pointerup',end);svg.addEventListener('pointercancel',end);
movementButtons.forEach(b=>b.addEventListener('click',()=>{
 const direction=b.dataset.move==='right'?1:-1;
 setLow(lowPoint+direction*0.25);
}));
languageButtons.forEach(b=>b.addEventListener('click',()=>{focusMode=b.dataset.representation;render();}));
window.addEventListener('vizy:focus',e=>{focusMode=e.detail?.id==='derivative'?'algebra':'words';render();});
const reset=document.getElementById('resetAll');
if(reset)reset.addEventListener('click',()=>{lowPoint=0;focusMode=null;drag=null;render();window.dispatchEvent(new CustomEvent('vizy:visual-position',{detail:{x:0}}));});
render();
})();