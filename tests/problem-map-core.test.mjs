import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const require=createRequire(import.meta.url);
const core=require('../public/problem-map-core.js');
const sandbox={window:{}};
vm.runInNewContext(readFileSync(new URL('../public/problem-map-data.js',import.meta.url),'utf8'),sandbox);
const problems=sandbox.window.VizyProblemMaps;
test('three authored problems validate',()=>{assert.equal(problems.length,3);for(const p of problems)assert.deepEqual(core.validateProblem(p),[]);});
test('clarity bounds and reachable values',()=>{
 assert.deepEqual(JSON.parse(JSON.stringify(problems.map(p=>{const c=core.clarity(p,{});return [c.now,c.reachable,c.max]}))),[[0,5,8],[0,4,6],[0,5,6]]);
});
test('node clarity only increases',()=>{
 for(const p of problems){const found={};let prior=core.nodeState(p,found);for(const id of Object.keys(p.clues)){found[id]=true;const next=core.nodeState(p,found);for(const n of Object.keys(next))assert(next[n].level>=prior[n].level);prior=next;}}
});
test('certainty calibration reflects correctness',()=>{
 for(const v of ['sure','maybe'])for(const right of [true,false])assert.equal(core.calibration(v,right),v+'-'+(right?'right':'wrong'));
});
test('invalid links, options and unknown effects rejected',()=>{
 const broken={...problems[0],clues:{...problems[0].clues,fn:{...problems[0].clues.fn,options:[{label:'bad',right:true}],effects:[{node:'wat',level:2,value:'x'}]}},links:[{needs:['missing'],between:['not-a-node'],text:'bad'}]};
 assert(core.validateProblem(broken).length>=4);
});