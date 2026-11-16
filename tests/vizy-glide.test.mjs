import test from 'node:test';import assert from 'node:assert/strict';import {createRequire} from 'node:module';const require=createRequire(import.meta.url);const C=require('../public/vizy-glide-core.js');test('terrain and game physics are deterministic',()=>{assert.equal(C.terrain(1234,50),C.terrain(1234,50));let a=C.init(1),b=C.init(1);for(let i=0;i<400;i++){a=C.step(a,{hold:i%2===0},1/60);b=C.step(b,{hold:i%2===0},1/60);}assert.deepEqual(a,b);});test('holding on down-slope builds speed',()=>{let x=1;while(C.terrain(1,x+0.1)<=C.terrain(1,x-0.1)&&x<700)x++;let a={...C.init(1),x,y:C.terrain(1,x)},b={...a};for(let i=0;i<20;i++){a=C.step(a,{hold:true},1/60);b=C.step(b,{hold:false},1/60);}assert.ok(a.speed>b.speed);});test('10,000 steps stay finite and do not sink through ground',()=>{let s=C.init(43);for(let i=0;i<10000;i++){s=C.step(s,{hold:i%73<35},1/60);for(const k of ['x','y','speed','vy'])assert.ok(Number.isFinite(s[k]),k+' '+i);assert.ok(s.y<=C.terrain(s.seed,s.x)+0.001);}});
// Graph segments must meet smoothly; a zone transition cannot teleport the blob.
test('the terrain is continuous across all zone boundaries',()=>{
  for(const seed of [1,43,7351])for(let zone=1;zone<=12;zone++){
    const x=zone*600;
    assert.ok(Math.abs(C.terrain(seed,x-0.001)-C.terrain(seed,x+0.001))<0.05,'jump at '+x);
    for(const offset of [-48,48]){
      const start=x+offset;
      assert.ok(Math.abs(C.terrain(seed,start-0.001)-C.terrain(seed,start+0.001))<0.05,'join at '+start);
    }
  }
});
test('zones change appearance while keeping a fixed graph for the same seed',()=>{
  assert.notEqual(C.terrain(7351,725),C.terrain(7351,1325));
  for(let x=0;x<4000;x+=7)assert.equal(C.terrain(7351,x),C.terrain(7351,x));
});

test('allocation-free advance agrees with the pure step but preserves state identity',()=>{
  let mutable=C.init(1234),immutable=C.init(1234);
  for(let i=0;i<700;i++){
    const input={hold:i%3===0};
    const previous=immutable;
    immutable=C.step(immutable,input,1/60);
    assert.notStrictEqual(immutable,previous);
    const previousMutable=mutable;
    mutable=C.advance(mutable,input,1/60);
    assert.strictEqual(mutable,previousMutable);
    assert.deepEqual(mutable,immutable);
  }
});
