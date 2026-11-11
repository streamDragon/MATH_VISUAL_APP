import test from 'node:test';import assert from 'node:assert/strict';import {createRequire} from 'node:module';import {readFileSync} from 'node:fs';import vm from 'node:vm';
const require=createRequire(import.meta.url);const core=require('../public/problem-map-core.js');
const env={window:{}};vm.runInNewContext(readFileSync(new URL('../public/problem-map-data.js',import.meta.url),'utf8'),env);
const problems=env.window.VizyProblemMaps;const p=problems[0];
test('only authored parameter question and every relation validates',()=>{assert.equal(problems.length,1);assert.deepEqual(core.validateProblem(p),[]);});
test('empty map and independent phrase sources',()=>{
 const x=core.fieldState(p,{});assert.equal(x.length,4);assert(x.every(f=>f.value==='?'));
 const onlyX=core.fieldState(p,{roles:{x:true}});assert.equal(onlyX[0].value,'x = 2');
 assert(onlyX.slice(1).every(f=>f.value==='?'));
});
test('correct inference fills derivative without revealing parameter',()=>{
 const s={answers:{c1:true}};const x=core.fieldState(p,s);assert.equal(x[2].value,'f′(2) = 0');assert.equal(x[3].value,'?');
 const determined=core.fieldState(p,{answers:{c4:true}});assert.equal(determined[3].value,'?');assert.equal(determined[3].label,'נקבע, לא חושב');
});
test('wrong role or claim gives no update',()=>{
 assert.equal(core.isRoleCorrect(p,'x','relation'),false);assert.equal(core.isRoleCorrect(p,'x','object'),true);
 assert.equal(core.isClaimCorrect(p,'c1',1),false);assert.equal(core.isClaimCorrect(p,'c1',0),true);
 assert.equal(core.inferredSummary(p,{answers:{c1:false}}).length,0);
});
test('inferred summary preserves claim order and does not solve for a',()=>{
 assert.deepEqual([...core.inferredSummary(p,{answers:{c4:true,c2:true}})],['מינימום','a נקבע אך לא חושב']);
 assert(!JSON.stringify(p).includes('a = -4'));assert(!JSON.stringify(p).includes('a=-4'));
});
test('rejects bad metadata and references',()=>{const broken={...p,fields:[{id:'x',from:{phrase:'missing'}}]};assert(core.validateProblem(broken).length>0);});

test('movable parabola functions',()=>{assert.equal(core.aFromLowPoint(2),-4);assert(core.isOnLine(2,2));assert(!core.isOnLine(1.8,2));});

test('bridge exercises distinguish derivative meaning, extrema condition and a shared point',()=>{
 const labels=p.bridgeChecks.map(c=>c.id);
 assert.deepEqual([...labels],['slope','necessary','same-point']);
 for(const c of p.bridgeChecks){
  assert.equal(c.options.length,3);
  for(let i=0;i<3;i++)assert.equal(core.isBridgeCorrect(p,c.id,i),c.options[i].right===true);
 }
 assert.equal(core.isBridgeCorrect(p,'same-point',0),false);
 assert.equal(core.isBridgeCorrect(p,'same-point',1),true);
 assert.equal(core.isBridgeCorrect(p,'missing',1),false);
});
test('equation lab preserves two zero conditions and does not disclose a',()=>{
 const lab=p.equationLab;
 assert.equal(lab.steps.length,5);
 assert.equal(lab.steps[1].earned.includes('(1) 2x − a = 0'),true);
 assert.equal(lab.steps[1].earned.includes('(2) −2x + 4 = 0'),true);
 assert.equal(core.isEquationCorrect(p,'preserve',0),false);
 assert.equal(core.isEquationCorrect(p,'preserve',1),true);
 assert.equal(core.isEquationCorrect(p,'isolate',0),true);
 assert.equal(core.isEquationCorrect(p,'substitute',0),true);
 assert.equal(JSON.stringify(lab).includes('a = 4'),false);
 const bad={...p,equationLab:{...lab,steps:[{...lab.steps[0],options:[{right:true},{right:true},{right:false}]}]}};
 assert.notEqual(core.validateProblem(bad).length,0);
});

test('foundation checks isolate negative signs and visible intermediate simplification',()=>{
 const byId=Object.fromEntries(p.foundations.map(s=>[s.id,s]));
 assert.equal(byId['negative-derivative'].rows[0].earned,'g′(x) = −2x + 4');
 assert.equal(byId['simplify-rows'].rows.length,2);
 assert.equal(byId['simplify-rows'].rows[0].earned,'4 + 0 − 2x');
 assert.equal(byId['simplify-rows'].rows[1].earned,'4 − 2x');
 assert.equal(core.isFoundationCorrect(p,'negative-derivative',0,0),false);
 assert.equal(core.isFoundationCorrect(p,'negative-derivative',0,1),true);
 assert.equal(core.isFoundationCorrect(p,'simplify-rows',1,0),true);
 assert.equal(core.isFoundationCorrect(p,'unknown',0,0),false);
 const malformed={...p,foundations:[{...byId['negative-derivative'],rows:[{...byId['negative-derivative'].rows[0],options:[{right:true},{right:true},{right:false}]}]}]};
 assert.ok(core.validateProblem(malformed).length>0);
});
