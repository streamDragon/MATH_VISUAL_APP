/* Exact, fixed graph for the stated classroom question. A moving point changes x,
   never the function. Shared with the existing classroom flow. */
(function(){
 'use strict';
 function mount(host,step){
  if(!host || !step || typeof step.problem!=='string')return false;
  const source=step.problem.replace(/−/g,'-').replace(/\s+/g,'');
  const match=source.match(/(?:f\(x\)=)?x(?:²|\^2)([+-]\d+)?/);
  if(!match)return false;
  const c=Number(match[1]||0);
  if(!Number.isFinite(c))return false;
  const f=x=>x*x+c;
  const xpx=x=>180+x*34;
  const ypx=y=>120-y*12;
  const path=[];
  for(let i=-4;i<=4.001;i+=.08)path.push((path.length?'L':'M')+xpx(i).toFixed(2)+','+ypx(f(i)).toFixed(2));
  host.replaceChildren();
  const wrapper=document.createElement('div');
  wrapper.className='exact-classroom-graph';
  wrapper.dataset.function='x^2'+(c<0?'':'+')+c;
  wrapper.dataset.vertex='0,'+c;
  wrapper.innerHTML='<p class="visual-caption">הגרף של השאלה: <b dir="ltr">f(x) = x² '+(c<0?'− ':'+ ')+Math.abs(c)+'</b>. מזיזים רק את הנקודה, לא את הפונקציה.</p>'+
   '<svg viewBox="0 0 360 245" role="img" aria-label="הפונקציה שבשאלה, פרבולה שקודקודה ב x=0 ו y='+c+'; הנקודה זזה על הגרף">'+
   '<defs><clipPath id="exactGraphClip"><rect x="20" y="15" width="320" height="212"/></clipPath></defs>'+
   '<rect x="20" y="15" width="320" height="212" rx="9" fill="#152b46"/>'+
   '<path d="M24 120H336 M180 18V225" stroke="#a4bdd3" stroke-width="1.5" fill="none"/>'+
   '<g clip-path="url(#exactGraphClip)"><path d="'+path.join(' ')+'" stroke="#5fe0cc" stroke-width="3.5" fill="none"/>'+
   '<circle id="exactMovingPoint" cx="180" cy="'+ypx(c)+'" r="6.5" fill="#ffda83" stroke="#152b46" stroke-width="2"/></g>'+
   '<circle cx="180" cy="'+ypx(c)+'" r="4" fill="#ff9d60"/>'+
   '<text x="190" y="'+(ypx(c)-10)+'" font-size="12" fill="#ffe5bd">(0, '+c+')</text>'+
   '<text x="329" y="112" fill="white" font-size="12">x</text>'+
   '<text x="188" y="29" fill="white" font-size="12">y</text></svg>'+
   '<div class="visual-controls"><label for="exactGraphX">זיזו את הנקודה על הגרף</label>'+
   '<input id="exactGraphX" type="range" min="-3" max="3" value="0" step=".5" />'+
   '<output id="exactGraphValue" dir="ltr"></output></div>';
  const slider=wrapper.querySelector('#exactGraphX');
  const dot=wrapper.querySelector('#exactMovingPoint');
  const output=wrapper.querySelector('#exactGraphValue');
  const update=()=>{
   const x=Number(slider.value),y=f(x);
   dot.setAttribute('cx',String(xpx(x)));dot.setAttribute('cy',String(ypx(y)));
   output.textContent='x = '+x+'  |  f(x) = '+y;
  };
  slider.addEventListener('input',update);update();
  host.append(wrapper);
  return true;
 }
 window.VizySharedGraph={mount};
})();
