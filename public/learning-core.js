/* Deterministic math and progress; shared by browser, bank validator and tests. */
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.LearningCore = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";
  function finite(v) {
    const n = Number(v);
    if (v === null || v === "" || !Number.isFinite(n))
      throw new Error("מספר לא תקין");
    return n;
  }
  function evaluateModel(kind, p) {
    const x = finite(p.x ?? 0);
    if (kind === "linear") {
      const m = finite(p.m),
        b = finite(p.b);
      return { value: m * x + b, slope: m, yIntercept: b };
    }
    if (kind === "quadratic") {
      const a = finite(p.a),
        h = finite(p.h),
        k = finite(p.k);
      if (!a) throw new Error("מקדם הפרבולה אינו יכול להיות אפס");
      const r = -k / a;
      return {
        value: a * (x - h) ** 2 + k,
        vertex: [h, k],
        roots:
          r < 0 ? [] : r === 0 ? [h] : [h - Math.sqrt(r), h + Math.sqrt(r)],
      };
    }
    if (kind === "intersection") {
      const m = finite(p.m),
        b = finite(p.b),
        n = finite(p.n),
        c = finite(p.c);
      if (m === n)
        return { solutionCount: b === c ? Infinity : 0, intersection: null };
      const t = (c - b) / (m - n);
      return { solutionCount: 1, intersection: [t, m * t + b] };
    }
    if (kind === "triangle") {
      const a = finite(p.a),
        b = finite(p.b);
      if (a <= 0 || b <= 0) throw new Error("אורך חייב להיות חיובי");
      return {
        hypotenuse: Math.hypot(a, b),
        area: (a * b) / 2,
        angle: (Math.atan2(a, b) * 180) / Math.PI,
      };
    }
    if (kind === "probability") {
      const red = finite(p.red),
        blue = finite(p.blue);
      if (
        red < 0 ||
        blue < 0 ||
        !Number.isInteger(red) ||
        !Number.isInteger(blue) ||
        red + blue === 0
      )
        throw new Error("צריך לפחות כדור אחד ומספרים שלמים");
      return { probability: red / (red + blue), total: red + blue };
    }
    if (kind === "derivative") {
      const a = finite(p.a),
        b = finite(p.b),
        c = finite(p.c);
      return { value: a * x * x + b * x + c, slope: 2 * a * x + b };
    }
    throw new Error("סוג המחשה לא מוכר");
  }
  function parseNumber(raw) {
    const s = String(raw ?? "")
      .trim()
      .replace(/[−–]/g, "-")
      .replace(",", ".");
    const part = "[+-]?(?:\\d+(?:\\.\\d*)?|\\.\\d+)";
    if (new RegExp("^" + part + "$").test(s)) return Number(s);
    if (new RegExp("^" + part + "\\s*/\\s*" + part + "$").test(s)) {
      const [a, b] = s.split("/").map(Number);
      return b !== 0 ? a / b : NaN;
    }
    return NaN;
  }
  function checkAnswer(expected, input, tolerance = 0.05) {
    const n = parseNumber(input);
    return (
      Number.isFinite(n) &&
      Number.isFinite(expected) &&
      Math.abs(n - expected) <= tolerance
    );
  }
  function answerFor(a, p) {
    const m = evaluateModel(a.kind, p);
    if (a.query === "rootCount") return m.roots.length;
    if (a.query === "vertexX") return m.vertex[0];
    if (a.query === "vertexY") return m.vertex[1];
    if (a.query === "intersectionX") return m.intersection?.[0] ?? NaN;
    return m[a.query];
  }
  function awardMastery(raw, id) {
    const mastered = [
      ...new Set(
        Array.isArray(raw?.mastered)
          ? raw.mastered.filter((x) => typeof x === "string")
          : [],
      ),
    ];
    const xp = Number.isFinite(raw?.xp) ? Math.max(0, raw.xp) : 0;
    if (!mastered.includes(id)) {
      mastered.push(id);
      return { ...raw, xp: xp + 40, mastered };
    }
    return { ...raw, xp, mastered };
  }
  function filterBank(bank, f = {}) {
    const search = String(f.search || "")
      .trim()
      .toLowerCase();
    return bank.filter(
      (a) =>
        (!f.grade || f.grade === "all" || Number(f.grade) === a.grade) &&
        (!f.topic || f.topic === "all" || f.topic === a.topic) &&
        (!search ||
          [
            a.title,
            a.summary,
            a.topicLabel,
            a.en?.title,
            a.en?.summary,
            a.en?.topicLabel,
          ]
            .join(" ")
            .toLowerCase()
            .includes(search)),
    );
  }
  return {
    evaluateModel,
    parseNumber,
    checkAnswer,
    answerFor,
    awardMastery,
    filterBank,
  };
});
