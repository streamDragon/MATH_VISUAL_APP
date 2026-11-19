import test from 'node:test';
import assert from 'node:assert/strict';
import ltr from '../public/vizy-ltr.js';

test('numbers and points are written left to right with a real minus sign',()=>{
 assert.equal(ltr.num(-4),'−4');
 assert.equal(ltr.num(3),'3');
 assert.equal(ltr.num(-0.5),'−0.5');
 assert.equal(ltr.point(0,-4),'(0, −4)');
});

test('a formula is text with no Hebrew letters; Hebrew labels are left alone',()=>{
 assert.equal(ltr.isFormula('(A−B)²'),true);
 assert.equal(ltr.isFormula('A = x+1'),true);
 assert.equal(ltr.isFormula('גרף A'),false);
 assert.equal(ltr.isFormula('  '),false);
 assert.equal(ltr.isFormula('⋯'),false);
});
