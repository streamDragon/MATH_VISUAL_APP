/* Left-to-right rendering for numbers, coordinates and formulas inside a right-to-left page.
   Without it the bidi algorithm moves signs and exponents to the wrong side: "(A−B)²" shows as "²(A−B)". */
(function(root){
 'use strict';
 const HEBREW=/[֐-׿]/;
 const MINUS='−';
 function num(value){
  const v=Number(value);
  if(!Number.isFinite(v))return String(value);
  const abs=Math.abs(v);
  const text=Number.isInteger(abs)?String(abs):String(Number(abs.toFixed(2)));
  return (v<0?MINUS:'')+text;
 }
 function point(x,y){return '('+num(x)+', '+num(y)+')';}
 /* A formula here means: no Hebrew letters, and at least one Latin letter or digit. */
 function isFormula(text){
  const t=String(text==null?'':text).trim();
  return t.length>0&&!HEBREW.test(t)&&/[A-Za-z0-9]/.test(t);
 }
 function apply(element){
  if(element&&isFormula(element.textContent)){
   element.setAttribute('dir','ltr');
   element.style.unicodeBidi='isolate';
   element.classList.add('vizy-math');
  }
  return element;
 }
 function span(text){
  const node=document.createElement('span');
  node.setAttribute('dir','ltr');node.style.unicodeBidi='isolate';node.className='vizy-math';
  node.textContent=String(text);
  return node;
 }
 /* Hebrew sentences that carry formulas ("קיבלנו (x−2)(x+4).") need each formula isolated,
    or "(x−2)(x+4)" shows as "(x+4)(x−2)" and "(x−2)²" as "²(x−2)". Wraps each formula run in place. */
 const RUN=/[A-Za-z0-9(−][A-Za-z0-9()+\-−=²³·×;,. ]*[A-Za-z0-9)²³]|[A-Za-z0-9]/g;
 function mixed(rootElement){
  if(!rootElement||typeof document==='undefined')return rootElement;
  const walker=document.createTreeWalker(rootElement,NodeFilter.SHOW_TEXT);
  const nodes=[];
  for(let n=walker.nextNode();n;n=walker.nextNode()){
   if(n.parentElement?.closest('[dir=ltr],.vizy-math,svg,script,style'))continue;
   if(HEBREW.test(n.nodeValue)||isFormula(n.nodeValue))nodes.push(n);
  }
  for(const n of nodes){
   if(!HEBREW.test(n.nodeValue)){n.replaceWith(span(n.nodeValue));continue;}
   const text=n.nodeValue,frag=document.createDocumentFragment();let last=0;
   for(const m of text.matchAll(RUN)){
    if(!/[A-Za-z0-9]/.test(m[0])||!/[A-Za-z()=+−²]|\d.*\D\d/.test(m[0]))continue;
    frag.append(text.slice(last,m.index),span(m[0]));last=m.index+m[0].length;
   }
   if(last===0)continue;
   frag.append(text.slice(last));n.replaceWith(frag);
  }
  return rootElement;
 }
 const api={num,point,isFormula,apply,span,mixed,MINUS};
 root.VizyLtr=api;
 if(typeof module==='object'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
