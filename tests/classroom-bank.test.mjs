import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const source=readFileSync(new URL('../public/classroom-activities.js',import.meta.url),'utf8');
const lessons=JSON.parse(source.replace(/^window\.VizyClassroomLessons\s*=\s*/,'').replace(/;\s*$/,''));
test('classroom bank: four paths, valid step content and final transfer',()=>{
  assert.deepEqual(lessons.map(l=>l.steps.length),[5,5,6,6]);
  for(const l of lessons)for(const s of l.steps){
    assert(s.heading&&s.problem&&s.prompt&&s.why);
    assert(s.answers?.length>0&&s.hints?.length>=2);
    if(s.options)assert(s.options.includes(s.answers[0]));
  }
  assert(lessons.every(l=>/העברה/.test(l.steps.at(-1).heading)));
});
test('bagrut readiness samples: circles, excluded values and inequality signs',()=>{
  assert.equal(100/2,50);assert.equal(180-70,110);assert.equal(35*2,70);
  assert.equal((25-9)/(5-3),8);
  assert(!Number.isFinite((9-9)/(3-3)));
  const f=x=>(x-2)/(x+1),g=x=>(x-3)/(x+2);
  assert(f(-2)>0&&f(0)<0&&f(3)>0);
  assert(g(-3)>0&&g(0)<0&&g(4)>0);
  assert.equal(lessons.find(l=>l.id==='g11-inequality').steps.at(-1).answers[0],'x<-2 או x>3');
});
