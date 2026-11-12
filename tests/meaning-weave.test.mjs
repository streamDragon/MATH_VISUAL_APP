import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const core=require('../public/meaning-weave-core.js');
const ctx={window:{}};
vm.runInNewContext(readFileSync(new URL('../public/meaning-weave-data.js',import.meta.url),'utf8'),ctx);
const lessons=ctx.window.VizyWeaveLessons;
test('three meaning-first lessons validate and separate grades',()=>{
 assert.equal(lessons.length,3);
 assert.deepEqual(Array.from(lessons,x=>x.gradeNumber),[11,11,9]);
 for(const lesson of lessons)assert.deepEqual(core.validate(lesson),[]);
});
test('multiple valid representations must ALL be selected',()=>{
 const lesson=lessons[0],step=lesson.steps[0];
 assert.equal(core.evaluate(step,[0,1]),true);
 assert.equal(core.evaluate(step,[0]),false);
 assert.equal(core.evaluate(step,[0,1,2]),false);
 let s=core.initial(lesson);
 const wrong=core.submit(lesson,s,[0]);
 assert.equal(wrong.correct,false);
 assert.equal(wrong.state.entries.length,0);
 assert.equal(core.next(lesson,wrong.state).step,0);
 s=core.submit(lesson,wrong.state,[0,1]).state;
 assert.equal(s.entries.length,1);
 assert.equal(core.result(lesson,s).assisted,1);
});
test('sufficient not equivalent: x cubed increases with derivative zero at origin',()=>{
 const inc=lessons[0];
 const sort=inc.steps.find(x=>x.mode==='sort');
 const answers=Object.fromEntries(sort.options.map((o,i)=>[i,o.relation]));
 assert.equal(core.evaluate(sort,answers),true);
 assert.equal(sort.options[1].relation,'sufficient');
 assert.equal(sort.options[2].relation,'necessary');
 assert.equal(inc.steps.at(-1).options.filter(o=>o.correct).length,2);
 const f=x=>x*x*x;
 assert.ok(f(-2)<f(-1)&&f(-1)<f(0)&&f(0)<f(2));
 assert.equal(3*0*0,0);
});
test('negative slope is tangent slope rather than value',()=>{
 const slope=lessons[1];
 assert.match(slope.prompt,/−4/);
 assert.equal(slope.steps[0].options.filter(o=>o.correct).length,3);
 assert.equal(slope.steps[1].options.filter(o=>o.correct).length,2);
 const tangent=(x)=>-4*x+7;
 assert.equal(tangent(0),7);
 assert.equal(tangent(1)-tangent(0),-4);
});
test('grade nine recognizes whole expression in difference of squares',()=>{
 const lesson=lessons[2];
 assert.equal(lesson.gradeNumber,9);
 for(const x of [-6,-2,0,2,4]){
  assert.equal((x+1)**2-9,(x-2)*(x+4));
  assert.equal((x-2)**2-25,(x-7)*(x+3));
 }
});
test('grade nine can construct the factorization from two selected parts',()=>{
 const lesson=lessons[2],step=lesson.steps.find(x=>x.mode==='build');
 assert.equal(core.evaluate(step,[0,1]),true);
 assert.equal(core.evaluate(step,[0]),false);
 assert.equal(core.evaluate(step,[0,2]),false);
});
test('saved layers preserve independent, assisted and transfer evidence',()=>{
 const lesson=lessons[2];
 let s=core.initial(lesson);
 for(const [i,step] of lesson.steps.entries()){
  const ans=['multi','build'].includes(step.mode)?step.options.flatMap((o,i)=>o.correct?[i]:[]):Object.fromEntries(step.options.map((o,i)=>[i,o.relation]));
  s=core.submit(lesson,s,ans).state;
  if(i<lesson.steps.length-1)s=core.next(lesson,s);
 }
 const result=core.result(lesson,s);
 assert.equal(result.complete,true);
 assert.equal(result.independent,5);
 assert.equal(result.transferIndependent,true);
 s=core.previous(lesson,s);
 assert.equal(core.normalize(lesson,JSON.parse(JSON.stringify(s))).entries.length,5);
});
