(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.VizyProblemMapCore=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const ROLES=['object','relation','instruction'],SOURCES=['none','given','asked'],ANSWER_COUNT=3;
function validateProblem(p){
 const e=[],phrases=p?.phrases||{},claims=p?.claims||[];
 if(!p?.id||!Array.isArray(p.text)||p.text.length===0)e.push('missing problem id/text');
 for(const s of p.text||[])if(s.phrase&&!phrases[s.phrase])e.push('unknown phrase '+s.phrase);
 for(const [id,info]of Object.entries(phrases)){
  if(!ROLES.includes(info.role))e.push('invalid role '+id);
  if(!SOURCES.includes(info.source))e.push('invalid source '+id);
  if(!info.ok)e.push('missing feedback '+id);
 }
 for(const kind of ['pictures','algebra']){
  const arr=p.represent?.[kind];
  if(!Array.isArray(arr)||arr.length!==3||arr.filter(o=>o.right===true).length!==1)e.push('invalid '+kind);
 }
 const ids=new Set(claims.map(c=>c.id));
 if(ids.size!==claims.length)e.push('duplicate claims');
 for(const c of claims)if(!Number.isInteger(c.right)||c.right<0||c.right>=ANSWER_COUNT||!c.reason)e.push('invalid claim '+c.id);
 for(const field of p.fields||[]){
  if(!field.id||!field.from)e.push('invalid field');
  const valid=from=>!from?false:from.phrase?Boolean(phrases[from.phrase]):from.claim?ids.has(from.claim):false;
  if(!valid(field.from))e.push('invalid field source '+field.id);
  for(const item of field.overrides||[])if(!valid(item.from))e.push('invalid field override '+field.id);
 }
 if((p.fields||[]).length!==4)e.push('expected four fields');
 return e;
}
function isRoleCorrect(p,id,role){return p.phrases?.[id]?.role===role;}
function isClaimCorrect(p,id,answer){const c=p.claims?.find(x=>x.id===id);return c!=null && c.right===answer;}
function satisfied(from,state){return from.phrase?state?.roles?.[from.phrase]===true:from.claim?state?.answers?.[from.claim]===true:false;}
function fieldState(p,state={}){
 return (p.fields||[]).map(f=>{
  let value='?',label=f.id==='d'?'לא הוסק':'לא זוהה',source=null;
  if(satisfied(f.from,state)){value=f.value;label=f.label;source=f.from.phrase?'נתון':'מסקנה';}
  for(const other of f.overrides||[])if(satisfied(other.from,state)){value=other.value;label=other.label;source='מסקנה';}
  return {id:f.id,symbol:f.symbol,value,label,source};
 });
}
function inferredSummary(p,state={}){return (p.claims||[]).filter(c=>state?.answers?.[c.id]===true).map(c=>c.summary);}
return {validateProblem,isRoleCorrect,isClaimCorrect,fieldState,inferredSummary};
});