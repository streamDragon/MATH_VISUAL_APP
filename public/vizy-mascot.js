/* A quiet friend, not a teacher. Dimensions also used by Vizy Glide. */
(function(root){
 'use strict';
 function render(element,mood='idle'){
  if(!element)return;
  const m=['idle','think','happy','curious'].includes(mood)?mood:'idle';
  const eyes=m==='think'?[36,40]:m==='curious'?[40,42]:[42,42];
  const shut=m==='happy';
  const eye=(x,y)=>shut
   ? '<path d="M'+(x-5)+' '+y+' Q'+x+' '+(y+5)+' '+(x+5)+' '+y+'" fill="none" stroke="#173b43" stroke-width="3" stroke-linecap="round"/>'
   : '<ellipse class="vizy-eye" cx="'+x+'" cy="'+y+'" rx="3.5" ry="5" fill="#173b43"/>';
  element.classList.add('vizy-mascot');
  element.dataset.mood=m;
  element.setAttribute('role','img');
  element.setAttribute('aria-label','Vizy');
  element.innerHTML='<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="vizy-lime" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#e8ffae"/><stop offset="1" stop-color="#b9e85e"/></linearGradient></defs><rect x="5" y="5" width="90" height="90" rx="27" fill="url(#vizy-lime)" stroke="#f4ffcc" stroke-width="2"/><ellipse cx="36" cy="75" rx="9" ry="4" fill="#82c8a0" opacity=".48"/><ellipse cx="64" cy="75" rx="9" ry="4" fill="#82c8a0" opacity=".48"/>'+eye(38,eyes[0])+eye(62,eyes[1])+'<path d="M43 62 Q50 '+(m==='happy'?72:68)+' 57 62" fill="none" stroke="#173b43" stroke-width="3" stroke-linecap="round"/></svg>';
 }
 root.VizyMascot={render};
})(window);