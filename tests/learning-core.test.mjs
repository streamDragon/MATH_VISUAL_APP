import { test } from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import fs from "node:fs";
const require = createRequire(import.meta.url);
let core;
try {
  core = require("../public/learning-core.js");
} catch {
  core = {};
}

test("linear model represents a slope triangle and value", () => {
  assert.equal(typeof core.evaluateModel, "function");
  const m = core.evaluateModel("linear", { m: -2, b: 3, x: 4 });
  assert.equal(m.value, -5);
  assert.equal(m.slope, -2);
  assert.equal(m.yIntercept, 3);
});
test("quadratic translation derives vertex and real intercepts", () => {
  assert.equal(typeof core.evaluateModel, "function");
  const m = core.evaluateModel("quadratic", { a: 2, h: -1, k: -8, x: 1 });
  assert.deepEqual(m.vertex, [-1, -8]);
  assert.equal(m.value, 0);
  assert.deepEqual(m.roots, [-3, 1]);
});
test("parallel/coincident lines distinguish no solution from infinitely many", () => {
  assert.equal(typeof core.evaluateModel, "function");
  assert.equal(
    core.evaluateModel("intersection", { m: 2, b: 1, n: 2, c: 3 })
      .solutionCount,
    0,
  );
  assert.equal(
    core.evaluateModel("intersection", { m: 2, b: 1, n: 2, c: 1 })
      .solutionCount,
    Infinity,
  );
  assert.equal(
    core.evaluateModel("intersection", { m: 2, b: 1, n: -1, c: 7 })
      .intersection[0],
    2,
  );
});
test("right triangle and probability are mathematically exact at edges", () => {
  assert.equal(typeof core.evaluateModel, "function");
  assert.equal(core.evaluateModel("triangle", { a: 3, b: 4 }).hypotenuse, 5);
  assert.equal(
    core.evaluateModel("probability", { red: 0, blue: 5 }).probability,
    0,
  );
  assert.throws(() => core.evaluateModel("probability", { red: 0, blue: 0 }));
  assert.throws(() => core.evaluateModel("triangle", { a: -3, b: 4 }));
});
test("quadratic derivative includes nonzero linear coefficient", () => {
  assert.equal(typeof core.evaluateModel, "function");
  assert.equal(
    core.evaluateModel("derivative", { a: 2, b: -3, c: 1, x: 2 }).slope,
    5,
  );
});
test("answers accept decimal comma fractions and Unicode minus, reject blanks and expressions", () => {
  assert.equal(typeof core.checkAnswer, "function");
  for (const [want, input] of [
    [0.5, "1/2"],
    [1.5, "1,5"],
    [-2, "−2"],
  ])
    assert.equal(core.checkAnswer(want, input, 0.01), true);
  for (const v of ["", " ", "1/0", "1+1", "Infinity", "0x10"])
    assert.equal(core.checkAnswer(0, v, 0.01), false);
  assert.equal(core.checkAnswer(2, "2.3", 0.05), false);
});
test("mastery grants once and preserves earlier earned points", () => {
  assert.equal(typeof core.awardMastery, "function");
  let p = core.awardMastery({ xp: 0, mastered: [] }, "line-01");
  assert.equal(p.xp, 40);
  assert.deepEqual(p.mastered, ["line-01"]);
  p = core.awardMastery(p, "line-01");
  assert.equal(p.xp, 40);
  p = core.awardMastery(p, "quad-01");
  assert.equal(p.xp, 80);
});
test("grade and topic search restrict the shown bank", () => {
  assert.equal(typeof core.filterBank, "function");
  const bank = [
    { id: "a", grade: 9, topic: "linear", title: "שיפוע" },
    { id: "b", grade: 11, topic: "derivative", title: "נגזרת" },
  ];
  assert.deepEqual(
    core
      .filterBank(bank, { grade: 9, topic: "linear", search: "שיפוע" })
      .map((x) => x.id),
    ["a"],
  );
});
test("every published activity has correct authored answers and a separate transfer", () => {
  const bank = JSON.parse(
    fs.readFileSync(
      new URL("../content/learning-bank.json", import.meta.url),
      "utf8",
    ),
  );
  assert.ok(bank.length >= 24);
  assert.equal(new Set(bank.map((a) => a.id)).size, bank.length);
  for (const a of bank) {
    assert.ok(a.source?.method === "original_authored");
    assert.ok(a.prediction?.options.length === 3);
    assert.equal(core.answerFor(a, a.params), a.answer);
    assert.equal(
      core.answerFor({ ...a, query: a.transfer.query }, a.transfer.params),
      a.transfer.answer,
    );
    assert.notDeepEqual(a.transfer.params, a.params);
    assert.ok(a.mediation.length >= 3);
  }
});

test("English search matches the visible activity title", () => {
  const bank = JSON.parse(
    fs.readFileSync("content/learning-bank.json", "utf8"),
  );
  assert.ok(core.filterBank(bank, { search: "Build a route" }).length > 0);
});
test("Hebrew parabola mediation identifies a turning point for either sign", () => {
  const bank = JSON.parse(
    fs.readFileSync("content/learning-bank.json", "utf8"),
  );
  for (const a of bank.filter((a) => a.kind === "quadratic" && a.params.a < 0))
    assert.ok(!a.mediation.some((s) => s.includes("נמוכה")));
});
