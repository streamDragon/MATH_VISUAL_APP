(function(root, factory){
  const api=factory();
  if(typeof module==='object' && module.exports) module.exports=api;
  else root.VizyProblemMapCore=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  const levels=['עוד לא','באופן כללי','בדיוק'];
  function allNodes(p){return [...(p.nodes||[]),...(p.extra?[p.extra.id]:[])];}
  function validateProblem(p){
    const errors=[],nodes=new Set(allNodes(p)),clues=p.clues||{};
    if(!p.id||!Array.isArray(p.text)||!Array.isArray(p.nodes))errors.push('Missing id, text or nodes');
    if(nodes.size!==allNodes(p).length)errors.push('Duplicate nodes');
    for(const part of p.text||[])if(part.clue&&!clues[part.clue])errors.push('Unknown tappable clue: '+part.clue);
    for(const [id,clue] of Object.entries(clues)){
      if(!clue.question)errors.push('Missing question: '+id);
      if(!Array.isArray(clue.options)||clue.options.length!==3||clue.options.filter(o=>o.right===true).length!==1)
        errors.push('Clue '+id+' must have exactly three options and one correct');
      for(const effect of clue.effects||[]){
        if(!nodes.has(effect.node))errors.push('Invalid effect node '+effect.node+' in '+id);
        if(![1,2].includes(effect.level)||!String(effect.value||'').trim())errors.push('Invalid effect level/value in '+id);
      }
    }
    for(const link of p.links||[]){
      for(const id of link.needs||[])if(!clues[id])errors.push('Unknown link clue '+id);
      for(const id of link.between||[])if(!nodes.has(id))errors.push('Unknown link node '+id);
    }
    return errors;
  }
  function nodeState(p,found){
    const nodes=Object.fromEntries(allNodes(p).map(id=>[id,{level:0,value:'',from:null}]));
    for(const [id,clue] of Object.entries(p.clues||{})){
      if(!found?.[id])continue;
      for(const effect of clue.effects||[]){
        if(nodes[effect.node] && effect.level>nodes[effect.node].level){
          nodes[effect.node]={level:effect.level,value:effect.value,from:id};
        }
      }
    }
    return nodes;
  }
  function clarity(p,found){
    const sum=s=>Object.values(nodeState(p,s)).reduce((n,e)=>n+e.level,0);
    return {now:sum(found||{}),max:2*allNodes(p).length,reachable:sum(Object.fromEntries(Object.keys(p.clues||{}).map(id=>[id,true])))};
  }
  function calibration(certainty,correct){
    return (certainty==='sure'?'sure':'maybe')+'-'+(correct?'right':'wrong');
  }
  return {levels,validateProblem,nodeState,clarity,calibration};
});