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
 if(p.foundations){
  const used=new Set();
  for(const skill of p.foundations){
   if(!skill.id||used.has(skill.id))e.push('duplicate foundation skill');
   used.add(skill.id);
   if(!skill.title||!skill.initial||!skill.rows?.length)e.push('incomplete foundation skill');
   for(const row of skill.rows||[]){
    if(!row.prompt||!row.right||!row.wrong||!row.earned)e.push('incomplete foundation row');
    if(!Array.isArray(row.options)||row.options.length!==3||row.options.filter(o=>o.right===true).length!==1)e.push('foundation row needs exactly one answer');
   }
  }
 }
 if(p.equationLab){
  const lab=p.equationLab;
  if(!Array.isArray(lab.definitions)||lab.definitions.length!==2||!Array.isArray(lab.steps)||lab.steps.length<3)e.push('invalid equation lab');
  const ids=new Set();
  for(const step of lab.steps||[]){
   if(!step.id||ids.has(step.id))e.push('duplicate equation lab step');
   ids.add(step.id);
   if(!step.title||!step.right||!step.wrong||!step.earned)e.push('incomplete equation lab step');
   if(!Array.isArray(step.options)||step.options.length!==3||step.options.filter(o=>o.right===true).length!==1)e.push('equation lab needs one right answer');
  }
 }
 if((p.bridgeChecks||[]).length){
  if(p.bridgeChecks.length!==3)e.push('bridge must have three links');
  const used=new Set();
  for(const check of p.bridgeChecks){
   if(!check.id||used.has(check.id))e.push('duplicate bridge check');
   used.add(check.id);
   if(!check.title||!check.right||!check.wrong)e.push('missing bridge feedback');
   if(!Array.isArray(check.options)||check.options.length!==3||check.options.filter(o=>o.right===true).length!==1)e.push('bridge check requires exactly one true answer');
  }
 }
 return e;
}
function isRoleCorrect(p,id,role){return p.phrases?.[id]?.role===role;}
function isClaimCorrect(p,id,answer){const c=p.claims?.find(x=>x.id===id);return c!=null && c.right===answer;}
function satisfied(from,state){return from.phrase?state?.roles?.[from.phrase]===true:from.claim?state?.answers?.[from.claim]===true:false;}
function fieldState(p,state={}){
 return (p.fields||[]).map(f=>{
  let value='?',label=f.id==='d'?'לא הוסק':'לא זוהה',source=null;
  if(satisfied(f.from,state)){
   value=f.value;label=f.label;
   const phraseSource=f.from.phrase&&p.phrases?.[f.from.phrase]?.source;
   source=f.from.claim?'מסקנה':phraseSource==='asked'?'מבוקש':phraseSource==='given'?'נתון':null;
  }
  for(const other of f.overrides||[])if(satisfied(other.from,state)){value=other.value;label=other.label;source='מסקנה';}
  return {id:f.id,symbol:f.symbol,value,label,source};
 });
}
function inferredSummary(p,state={}){return (p.claims||[]).filter(c=>state?.answers?.[c.id]===true).map(c=>c.summary);}
function isBridgeCorrect(p,id,optionIndex){const check=p.bridgeChecks?.find(c=>c.id===id);return Number.isInteger(optionIndex)&&Boolean(check?.options?.[optionIndex]?.right);}
function isEquationCorrect(p,id,index){const s=p.equationLab?.steps?.find(x=>x.id===id);return Number.isInteger(index)&&Boolean(s?.options?.[index]?.right);}
function isFoundationCorrect(p,skillId,rowIndex,optionIndex){const row=p.foundations?.find(s=>s.id===skillId)?.rows?.[rowIndex];return Number.isInteger(optionIndex)&&Boolean(row?.options?.[optionIndex]?.right);}
return {validateProblem,isRoleCorrect,isClaimCorrect,isBridgeCorrect,isEquationCorrect,isFoundationCorrect,fieldState,inferredSummary,aFromLowPoint:x=>-2*x,isOnLine:(x,target,tolerance=0.08)=>Number.isFinite(x)&&Math.abs(x-target)<=tolerance};
});