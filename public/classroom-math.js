/* Pure classroom math helpers; no separate runtime or legacy routing. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.VizyClassroomMath=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const sign=n=>n>0?'חיובי':n<0?'שלילי':'אפס';
function fraction(x,c){if(x===c)return {defined:false,value:null,sign:'לא מוגדר'};const value=x+c;return {defined:true,value,sign:sign(value)};}
function rational(x,a,b){if(x===b)return {defined:false,value:null,sign:'לא מוגדר'};const value=(x-a)/(x-b);return {defined:true,value,sign:sign(value)};}
function quadratic(x,c){return x*x-c;}
function arcCentralFromInscribed(angle){return 2*angle;}
function oppositeCyclic(angle){return 180-angle;}
return {fraction,rational,quadratic,arcCentralFromInscribed,oppositeCyclic,sign};
});
