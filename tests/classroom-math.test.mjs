import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const m=require('../public/classroom-math.js');
test('rational sign intervals respect zeros and forbidden poles',()=>{
 assert.equal(m.rational(-2,2,-1).sign,'חיובי');
 assert.equal(m.rational(0,2,-1).sign,'שלילי');
 assert.equal(m.rational(2,2,-1).sign,'אפס');
 assert.equal(m.rational(-1,2,-1).defined,false);
 assert.equal(m.rational(-3,3,-2).sign,'חיובי');
 assert.equal(m.rational(0,3,-2).sign,'שלילי');
});
test('cancelled fractions preserve holes in their domain',()=>{
 assert.equal(m.fraction(3,3).defined,false);
 assert.equal(m.fraction(5,3).value,8);
 assert.equal(m.fraction(4,4).defined,false);
});
test('function samples and cyclic angle relationships',()=>{
 assert.equal(m.quadratic(3,4),5);
 assert.equal(m.quadratic(0,9),-9);
 assert.equal(m.arcCentralFromInscribed(35),70);
 assert.equal(m.oppositeCyclic(70),110);
});
