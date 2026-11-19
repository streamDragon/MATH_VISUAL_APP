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
 const api={num,point,isFormula,apply,span,MINUS};
 root.VizyLtr=api;
 if(typeof module==='object'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
