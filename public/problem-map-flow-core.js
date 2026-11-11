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
 function validateErrorCard(card){
  const errors=[];
  if(!card?.id||!card?.skill||!card?.context||!Array.isArray(card.lines)||card.lines.length<1||card.lines.length>4)errors.push('invalid card');
  if(!['wrong','incomplete','correct'].includes(card?.kind))errors.push('invalid verdict');
  if(card?.kind==='correct'&&card.targetLine!==null)errors.push('correct card must have no target line');
  if(card?.kind!=='correct'&&(!Number.isInteger(card.targetLine)||card.targetLine<0||card.targetLine>=card.lines.length))errors.push('invalid target line');
  for(const choices of [card?.diagnoses,card?.repairs,card?.transfer?.options]){
   if(!Array.isArray(choices)||choices.length!==3||choices.filter(x=>x.correct).length!==1)errors.push('invalid options');
  }
  return errors;
 }
 function createErrorState(card){
  return {id:card.id,stage:'verdict',attempts:{},hints:{},completed:{},feedback:'',selectedLine:null};
 }
 const stages=['verdict','locate','diagnose','repair','transfer','done'];
 function normalizeErrorState(card,input){
  const state=createErrorState(card);
  if(!input||input.id!==card.id)return state;
  const stage=stages.includes(input.stage)?input.stage:'verdict';
  const completed={};
  for(const s of stages.slice(0,-1)){
   if(input.completed?.[s]===true)completed[s]=true; else break;
  }
  const stageIndex=stages.indexOf(stage);
  const firstIncomplete=stages.findIndex(s=>s!=='done'&&!completed[s]);
  state.stage=stageIndex>firstIncomplete&&firstIncomplete!==-1?stages[firstIncomplete]:stage;
  if(firstIncomplete===-1)state.stage='done';
  state.completed=completed;
  state.attempts={...(input.attempts||{})};
  state.hints={...(input.hints||{})};
  state.selectedLine=Number.isInteger(input.selectedLine)?input.selectedLine:null;
  state.feedback=typeof input.feedback==='string'?input.feedback:'';
  return state;
 }
 function submitError(card,input,value){
  const state=normalizeErrorState(card,input);
  const stage=state.stage;
  if(stage==='done'||state.completed[stage])return {state,correct:false};
  state.attempts[stage]=(state.attempts[stage]||0)+1;
  let correct=false;
  if(stage==='verdict')correct=value===card.kind;
  if(stage==='locate')correct=value===card.targetLine;
  if(stage==='diagnose'||stage==='repair'){
   const item=(stage==='diagnose'?card.diagnoses:card.repairs)?.[value];
   correct=Number.isInteger(value)&&Boolean(item?.correct);
  }
  if(stage==='transfer')correct=Number.isInteger(value)&&Boolean(card.transfer?.options?.[value]?.correct);
  if(correct)state.completed[stage]=true;
  if(stage==='locate'&&Number.isInteger(value))state.selectedLine=value;
  state.feedback=correct?'נכון. אפשר להמשיך לשלב הבא.':stage==='verdict'?'בדקו שוב: האם זו שגיאה, שלב נכון אך לא שקול, או פתרון תקין?':stage==='locate'?'נסו לזהות איזו שורה מחייבת בדיקה.':'נסו שוב. כדאי להשוות בין המשמעות המתמטית לבין השורה שנכתבה.';
  return {state,correct};
 }
 function nextError(card,input){
  const state=normalizeErrorState(card,input);
  if(!state.completed[state.stage])return state;
  const idx=stages.indexOf(state.stage);
  state.stage=stages[Math.min(idx+1,stages.length-1)];
  if(state.stage==='locate'&&card.kind==='correct'){
   state.completed.locate=true;state.stage='diagnose';
  }
  state.feedback='';
  return state;
 }
 function hintError(card,input){
  const state=normalizeErrorState(card,input);
  if(state.stage!=='done')state.hints[state.stage]=true;
  return state;
 }
 function errorSupport(card,input){
  const s=normalizeErrorState(card,input);
  return Object.keys(s.attempts).filter(stage=>s.attempts[stage]>1||s.hints[stage]).map(stage=>({stage,skill:card.skill}));
 }
 return {validate,createState,normalize,submit,next,previous,help,needsSupport,validateErrorCard,createErrorState,normalizeErrorState,submitError,nextError,hintError,errorSupport};
});
