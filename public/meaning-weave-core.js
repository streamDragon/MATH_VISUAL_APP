(function(root,factory){
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 else root.VizyWeaveCore=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
 'use strict';
 const relations=['equivalent','sufficient','necessary','compatible','contradiction'];
 function validate(lesson){
  const errors=[];
  if(!lesson||lesson.type!=='weave'||!lesson.id||!lesson.prompt||!Array.isArray(lesson.steps))errors.push('lesson header');
  const ids=new Set();
  for(const step of lesson?.steps||[]){
   if(!step.id||ids.has(step.id))errors.push('duplicate step');ids.add(step.id);
   if(!step.question||!step.layer?.value||!step.wrong||!step.correctNote)errors.push('missing content: '+step.id);
   if(!Array.isArray(step.options)||step.options.length<3)errors.push('not enough options: '+step.id);
   if(['multi','build'].includes(step.mode)&&step.options.filter(x=>x.correct).length<1)errors.push('no correct options: '+step.id);
   if(step.mode==='sort'&&step.options.some(x=>!relations.includes(x.relation)))errors.push('invalid relation: '+step.id);
   if(!['multi','build','sort'].includes(step.mode))errors.push('invalid mode: '+step.id);
  }
  return errors;
 }
 function initial(lesson){return {lessonId:lesson.id,step:0,entries:[],answers:{},attempts:{},help:{},feedback:'',status:'idle'};}
 function normalize(lesson,input){
  const s=initial(lesson);
  if(!input||input.lessonId!==lesson.id)return s;
  const entries=[];
  for(let i=0;i<(lesson.steps||[]).length;i++){
   const id=lesson.steps[i].id;
   if(!input.entries?.some(x=>x.id===id))break;
   const {kind,label,value}=lesson.steps[i].layer;
   entries.push({id,kind,label,value});
  }
  s.entries=entries;
  s.step=Math.max(0,Math.min(Number.isInteger(input.step)?input.step:0,Math.min(entries.length,lesson.steps.length-1)));
  s.attempts={...(input.attempts||{})};
  s.help={...(input.help||{})};
  s.answers={...(input.answers||{})};
  s.feedback=typeof input.feedback==='string'?input.feedback:'';
  s.status=typeof input.status==='string'?input.status:'idle';
  return s;
 }
 function evaluate(step,answer){
  if(step.mode==='multi'||step.mode==='build'){
   if(!Array.isArray(answer)||!answer.length||answer.some(i=>!Number.isInteger(i)||i<0||i>=step.options.length))return false;
   const selected=new Set(answer);
   return selected.size===answer.length&&step.options.every((o,i)=>selected.has(i)===Boolean(o.correct));
  }
  if(step.mode==='sort')return Boolean(answer&&typeof answer==='object'&&step.options.every((o,i)=>answer[i]===o.relation));
  return false;
 }
 function submit(lesson,input,answer){
  const s=normalize(lesson,input),step=lesson.steps[s.step];
  if(s.entries.some(e=>e.id===step.id))return {state:s,correct:true,already:true};
  const correct=evaluate(step,answer);
  s.attempts[step.id]=(s.attempts[step.id]||0)+1;
  s.answers[step.id]=answer;
  s.feedback=correct?step.correctNote:step.wrong;
  s.status=correct?'correct':'retry';
  if(correct)s.entries.push({id:step.id,...step.layer});
  return {state:s,correct};
 }
 function next(lesson,input){
  const s=normalize(lesson,input);
  if(!s.entries.some(e=>e.id===lesson.steps[s.step].id))return s;
  if(s.step<lesson.steps.length-1){s.step++;s.status='idle';s.feedback='';}
  return s;
 }
 function previous(lesson,input){
  const s=normalize(lesson,input);
  if(s.step>0){s.step--;s.status='correct';s.feedback='';}
  return s;
 }
 function help(lesson,input){
  const s=normalize(lesson,input);s.help[lesson.steps[s.step].id]=true;return s;
 }
 function result(lesson,input){
  const s=normalize(lesson,input);
  const transfer=lesson.steps.filter(x=>x.transfer);
  return {
   complete:s.entries.length===lesson.steps.length,
   independent:lesson.steps.filter(x=>s.entries.some(e=>e.id===x.id)&&s.attempts[x.id]===1&&!s.help[x.id]).length,
   assisted:lesson.steps.filter(x=>s.entries.some(e=>e.id===x.id)&&(s.attempts[x.id]>1||s.help[x.id])).length,
   transferIndependent:transfer.length>0&&transfer.every(x=>s.entries.some(e=>e.id===x.id)&&s.attempts[x.id]===1&&!s.help[x.id]),
   transferAttempted:transfer.some(x=>(s.attempts[x.id]||0)>0)
  };
 }
 return {relations,validate,initial,normalize,evaluate,submit,next,previous,help,result};
});
