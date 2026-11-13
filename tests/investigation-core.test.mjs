import test from 'node:test';
import assert from 'node:assert/strict';
import core from '../public/vizy-inquiry-core.js';

test('both investigations use the same persistent engine with the intended routes',()=>{
 const graph=core.start('graph'),map=core.start('map');
 assert.equal(core.phase(graph),'choose');
 assert.equal(core.phase(map),'shape');
 assert.deepEqual(map.route,core.MAP_ROUTE);
 assert.ok(graph.route.includes('criterion'));
 assert.equal(core.restore('graph',{...graph,version:-1}).index,0);
 assert.equal(core.restore('map',JSON.parse(JSON.stringify(map))).kind,'map');
});
test('a reliable criterion takes the short route; an uncertain criterion goes to investigation',()=>{
 const fast=core.start('graph');
 fast.index=1;
 core.selectLane(fast,true);
 assert.deepEqual(fast.route.slice(2),core.GRAPH_FAST);
 assert.equal(core.summary(fast).lane,'fast');
 const explore=core.start('graph');explore.index=1;
 core.selectLane(explore,false);
 assert.deepEqual(explore.route.slice(2),core.GRAPH_EXPLORE);
 assert.equal(core.summary(explore).lane,'investigate');
 const mistaken=core.start('graph');mistaken.index=1;core.selectLane(mistaken,true);mistaken.index=2;
 core.fallBack(mistaken);assert.equal(mistaken.route[3],'shift-predict');
});
test('help is recorded separately from wrong answers, and assessment distinguishes mastery',()=>{
 const s=core.start('graph');
 core.help(s,'choose');
 assert.equal(s.records.choose.attempts,0);
 assert.equal(s.records.choose.helped,true);
 core.attempt(s,'choose',true);
 assert.equal(s.records.choose.firstTry,false);
 assert.equal(s.records.choose.assisted,true);
 core.attempt(s,'criterion',false);
 core.attempt(s,'criterion',true);
 assert.equal(s.records.criterion.firstTry,false);
 assert.equal(s.records.criterion.assisted,true);
 core.attempt(s,'temperature',true);
 core.attempt(s,'linear',true);
 const summary=core.summary(s);
 assert.equal(summary.helped,1);
 assert.equal(summary.transferIndependent,2);
 assert.equal(summary.transferTotal,2);
});
test('recorded discoveries are unique and advancement needs evidence',()=>{
 const s=core.start('map');
 assert.equal(core.advance(s),false);
 core.complete(s,'זיהוי מבנה','הפרש שני ריבועים');
 core.complete(s,'זיהוי אחר','שוב');
 assert.equal(s.trail.length,1);
 assert.equal(core.advance(s),true);
 assert.equal(core.phase(s),'reason');
 const restored=core.restore('map',JSON.parse(JSON.stringify(s)));
 assert.equal(restored.trail.length,1);
 assert.equal(core.phase(restored),'reason');
});
