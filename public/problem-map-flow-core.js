(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  else root.VizyLayerFlowCore=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
 'use strict';
 function validate(lesson){
  const errors=[],ids=new Set();
  if(!lesson||!lesson.id||!lesson.name||!lesson.prompt||!Array.isArray(lesson.steps)||!lesson.steps.length)errors.push('lesson header');
  for(const step of lesson?.steps||[]){
   if(!step.id||ids.has(step.id))errors.push('duplicate step id');ids.add(step.id);
   if(!step.question||!step.phase||!step.wrong||!step.correctNote||!step.layer?.value||!step.layer?.label||!step.layer?.kind)errors.push('incomplete step '+step.id);
   if(!Array.isArray(step.options)||step.options.length!==3||step.options.filter(x=>x.correct).length!==1)errors.push('invalid options '+step.id);
  }
  return errors;
 }
 function createState(lesson){
  return {lessonId:lesson.id,step:0,entries:[],attempts:{},help:{},feedback:'',lastCorrect:false};
 }
 function normalize(lesson,input){
  const blank=createState(lesson);
  if(!input||input.lessonId!==lesson.id)return blank;
  const expected=lesson.steps||[];
  const rows=Array.isArray(input.entries)?input.entries:[];
  const entries=[];
  for(let i=0;i<Math.min(rows.length,expected.length);i++){
   if(rows[i]?.id!==expected[i].id)break;
   const layer=expected[i].layer;
   entries.push({id:expected[i].id,kind:layer.kind,label:layer.label,value:layer.value,also:layer.also||null});
  }
  const completed=entries.length;
  return {
   ...blank,step:Math.min(Math.max(0,Number(input.step)||0),Math.min(completed,expected.length-1)),
   entries,attempts:{...(input.attempts||{})},help:{...(input.help||{})},
   feedback:typeof input.feedback==='string'?input.feedback:'',lastCorrect:Boolean(input.lastCorrect)
  };
 }
 function submit(lesson,input,index){
  const state=normalize(lesson,input),s=lesson.steps[state.step];
  if(!Number.isInteger(index)||index<0||index>=s.options.length)return {state,correct:false};
  if(state.entries.some(e=>e.id===s.id))return {state,correct:true,already:true};
  state.attempts[s.id]=(state.attempts[s.id]||0)+1;
  const correct=Boolean(s.options[index].correct);
  state.lastCorrect=correct;
  state.feedback=correct?s.correctNote:s.wrong;
  if(correct){
   state.entries.push({id:s.id,kind:s.layer.kind,label:s.layer.label,value:s.layer.value,also:s.layer.also||null});
  }
  return {state,correct};
 }
 function next(lesson,input){
  const state=normalize(lesson,input),s=lesson.steps[state.step];
  if(!state.entries.some(e=>e.id===s.id))return state;
  if(state.step<lesson.steps.length-1){state.step++;state.feedback='';state.lastCorrect=false;}
  return state;
 }
 function previous(lesson,input){
  const state=normalize(lesson,input);
  if(state.step>0){state.step--;state.feedback='';state.lastCorrect=true;}
  return state;
 }
 function help(lesson,input){
  const state=normalize(lesson,input),id=lesson.steps[state.step].id;
  state.help[id]=true;return state;
 }
 function needsSupport(lesson,input){
  const state=normalize(lesson,input);
  return lesson.steps.filter(s=>state.entries.some(e=>e.id===s.id)&&(state.attempts[s.id]>1||state.help[s.id])).map(s=>({id:s.id,phase:s.phase}));
 }
 return {validate,createState,normalize,submit,next,previous,help,needsSupport};
});
