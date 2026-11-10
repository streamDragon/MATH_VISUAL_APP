(()=>{'use strict';
const svg=document.getElementById('liveGraph');
if(!svg)return;
const ns='http://www.w3.org/2000/svg';
const host=document.getElementById('liveCurves');
const clip=document.createElementNS(ns,'clipPath');clip.setAttribute('id','curveClip');const clipRect=document.createElementNS(ns,'rect');clipRect.setAttribute('x','1');clipRect.setAttribute('y','1');clipRect.setAttribute('width','498');clipRect.setAttribute('height','308');clipRect.setAttribute('rx','12');clip.appendChild(clipRect);svg.insertBefore(clip,host);
const feedback=document.getElementById('visualFeedback');
const buttons=[...document.querySelectorAll('[data-visual-curve]')];
const items=[
 {id:'left',a:0,color:'#5386dd',label:'הכחולה',vertex:0},
 {id:'center',a:-4,color:'#058b8f',label:'הירוקה',vertex:2},
 {id:'right',a:-2,color:'#a47cde',label:'הסגולה',vertex:1}
];
let selected=null;
try{const stored=JSON.parse(localStorage.getItem('vizy_problem_map_v2')||'null');selected=stored?.problemId==='parameter-extremum'?stored?.visualCurve||null:null;}catch{}
function make(tag,attributes){
 const element=document.createElementNS(ns,tag);
 Object.entries(attributes||{}).forEach(([k,v])=>element.setAttribute(k,String(v)));
 return element;
}
function curvePath(a){
 const parts=[];
 // Exact members of y = x² + ax. Only the horizontal x=2 condition is labeled.
 for(let x=-2.2;x<=4.21;x+=.055){
  const px=185+x*75,py=165-(x*x+a*x)*20;
  parts.push((parts.length?'L':'M')+px.toFixed(2)+' '+py.toFixed(2));
 }
 return parts.join(' ');
}
function draw(){
 host.replaceChildren();
 for(const item of items){
  const g=make('g',{});
  const curve=make('path',{d:curvePath(item.a),stroke:item.color,class:'curve','data-chosen':selected===item.id?'true':'false','data-dim':selected&&selected!==item.id?'true':'false'});
  g.appendChild(curve);
  const vx=185+item.vertex*75;
  const vy=165+item.vertex*item.vertex*20;
  g.appendChild(make('circle',{cx:vx,cy:vy,r:selected===item.id?6:4.5,fill:item.color,class:'vertex','data-chosen':selected===item.id?'true':'false'}));
  host.appendChild(g);
 }
 buttons.forEach(btn=>btn.setAttribute('aria-pressed',String(btn.dataset.visualCurve===selected)));
 if(!selected){feedback.textContent='אין צורך לחשב. הסתכלו רק על מקום הקיצון.';feedback.dataset.state='';return;}
 const chosen=items.find(item=>item.id===selected);
 if(chosen.vertex===2){
   feedback.textContent='יפה! השפל של הירוקה נמצא על הקו x = 2. עכשיו צריך להסביר למה, בלי לחשב עדיין את a.';
   feedback.dataset.state='correct';
 }else{
   feedback.textContent='נסתכל שוב על הקו הכתום. השפל של '+chosen.label+' לא נמצא עליו. נסו קו אחר.';
   feedback.dataset.state='wrong';
 }
}
buttons.forEach(button=>button.addEventListener('click',()=>{
 selected=button.dataset.visualCurve;
 window.dispatchEvent(new CustomEvent('vizy:visual-choice',{detail:{id:selected}}));
 draw();
}));
const reset=document.getElementById('resetAll');
if(reset)reset.addEventListener('click',()=>{
 selected=null;
 window.dispatchEvent(new CustomEvent('vizy:visual-choice',{detail:{id:null}}));
 draw();
});
draw();
})();