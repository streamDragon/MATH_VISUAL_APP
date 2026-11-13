/* Shared, testable learning-state engine for the graph and general–particular investigations.
   This is about evidence, not awarding points for reaching a screen. */
(function(root){
 'use strict';
 const VERSION=1;
 const GRAPH_EXPLORE=[
  'shift-predict','shift-act','reflect-predict','reflect-act','point-predict','point-act',
  'compare','phrases','build','verdict','criterion-end','temperature','linear','done'
 ];
 const GRAPH_FAST=['contrast','verdict','criterion-end','temperature','linear','done'];
 const MAP_ROUTE=['shape','reason','partA','partB','rule','return','tidy','check','transfer','done'];
 function start(kind){
  if(kind!=='graph'&&kind!=='map')throw Error('Unknown investigation '+kind);
  return {version:VERSION,kind,route:kind==='graph'?['choose','criterion']:MAP_ROUTE.slice(),
   index:0,pending:false,feedback:'',records:{},trail:[],data:{},startedAt:Date.now()};
 }
 function restore(kind,raw){
  if(!raw||raw.version!==VERSION||raw.kind!==kind||!Array.isArray(raw.route)||
    !Number.isInteger(raw.index)||raw.index<0||raw.index>=raw.route.length)return start(kind);
  const clean=start(kind);
  clean.route=raw.route;clean.index=raw.index;clean.pending=Boolean(raw.pending);
  clean.feedback=typeof raw.feedback==='string'?raw.feedback:'';
  clean.records=raw.records&&typeof raw.records==='object'?raw.records:{};
  clean.trail=Array.isArray(raw.trail)?raw.trail.slice(-30):[];
  clean.data=raw.data&&typeof raw.data==='object'?raw.data:{};
  clean.startedAt=raw.startedAt||Date.now();
  return clean;
 }
 function phase(s){return s.route[s.index]||'done';}
 function selectLane(s,fast){
  if(s.kind!=='graph'||phase(s)!=='criterion')throw Error('Lane only after first criterion');
  s.data.lane=fast?'fast':'investigate';
  s.route=['choose','criterion',...(fast?GRAPH_FAST:GRAPH_EXPLORE)];
 }
 function fallBack(s){
  if(phase(s)!=='contrast')throw Error('Contrast fallback only');
  s.data.lane='investigate';
  s.route=['choose','criterion','contrast',...GRAPH_EXPLORE];
 }
 function attempt(s,key,correct){
  const r=s.records[key]||{attempts:0,helped:false,completed:false,firstTry:false};
  r.attempts++;
  if(correct&&!r.completed){
   r.completed=true;
   r.firstTry=r.attempts===1&&!r.helped;
   r.assisted=r.helped||r.attempts>1;
  }
  s.records[key]=r;
  return r;
 }
 function help(s,key=phase(s)){
  const r=s.records[key]||{attempts:0,helped:false,completed:false,firstTry:false};
  r.helped=true;s.records[key]=r;
 }
 function trail(s,code,label,detail){
  if(s.trail.some(entry=>entry.code===code))return;
  s.trail.push({code,label,detail});
  if(s.trail.length>30)s.trail.shift();
 }
 function complete(s,label,detail,feedback){
  if(s.pending)return;
  trail(s,phase(s),label,detail);
  s.pending=true;s.feedback=feedback||detail;
 }
 function advance(s){
  if(!s.pending||phase(s)==='done')return false;
  s.index=Math.min(s.index+1,s.route.length-1);
  s.pending=false;s.feedback='';
  return true;
 }
 function summary(s){
  const entries=Object.entries(s.records).filter(([,r])=>r.completed);
  const transfer=entries.filter(([name])=>name==='temperature'||name==='linear'||name==='transfer');
  return {
   independent:entries.filter(([,r])=>r.firstTry).length,
   assisted:entries.filter(([,r])=>r.assisted).length,
   helped:Object.values(s.records).filter(r=>r.helped).length,
   transferIndependent:transfer.filter(([,r])=>r.firstTry).length,
   transferTotal:transfer.length,
   lane:s.data.lane||'map',
   criterionBefore:s.data.criterionBefore||'',
   criterionAfter:s.data.criterionAfter||''
  };
 }
 const api={VERSION,GRAPH_EXPLORE,GRAPH_FAST,MAP_ROUTE,start,restore,phase,selectLane,fallBack,
   attempt,help,trail,complete,advance,summary};
 root.VizyInvestigationCore=api;
 if(typeof module==='object'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
