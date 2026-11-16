/* All icon shapes are local, accessible, inline SVGs. */
(function(root){
 'use strict';
 const shapes={
  user:'<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  home:'<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z"/>',
  camera:'<path d="M4 7h4l2-3h4l2 3h4v13H4z"/><circle cx="12" cy="13" r="4"/>',
  tools:'<path d="M14 7a5 5 0 0 0-6 6l-6 6 3 3 6-6a5 5 0 0 0 6-6l-3 3-4-1-1-4z"/>',
  'speaker-on':'<path d="M4 9v6h4l5 4V5L8 9z"/><path d="M17 9a5 5 0 0 1 0 6M19 6a9 9 0 0 1 0 12"/>',
  'speaker-off':'<path d="M4 9v6h4l5 4V5L8 9z"/><path d="m17 9 5 6m0-6-5 6"/>',
  clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  star:'<path d="m12 2 3.1 6.5 7.1 1-5.1 5 1.2 7-6.3-3.3-6.3 3.3 1.2-7-5.1-5 7.1-1z"/>',
  back:'<path d="m15 18-6-6 6-6"/>'
 };
 function create(name,label){
  const ns='http://www.w3.org/2000/svg',svg=document.createElementNS(ns,'svg');
  svg.setAttribute('viewBox','0 0 24 24');svg.setAttribute('class','vizy-icon');svg.setAttribute('aria-hidden',label?'false':'true');
  if(label){svg.setAttribute('role','img');svg.setAttribute('aria-label',label);}
  svg.innerHTML=shapes[name]||shapes.star;
  return svg;
 }
 root.VizyIcons={create, names:Object.freeze(Object.keys(shapes))};
})(window);