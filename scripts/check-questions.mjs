import { promises as fs } from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const questionsPath = path.join(rootDir, 'public', 'questions.js');

const GOALS = new Set([
  'choose_function_template',
  'slope_zero',
  'min_point',
  'slope_equals',
  'y_equals',
  'read_slope',
  'read_y',
  'hit_target',
  'hit_targets',
  'tangent_through_point',
  'free'
]);

const PARAM_KEYS = ['a', 'b', 'c', 'd', 'e'];
const PARAM_TO_INPUT_ID = {
  a: 'inpA',
  b: 'inpB',
  c: 'inpC',
  d: 'inpD',
  e: 'inpE'
};
const INPUT_IDS = new Set(Object.values(PARAM_TO_INPUT_ID));
const RANGE_VALUES = Array.from({ length: 101 }, (_, i) => -5 + i * 0.1);

function fail(message) {
  console.error(`ERROR: ${message}`);
  process.exit(1);
}

function loadQuestionConfig(source) {
  const context = { console };
  vm.createContext(context);
  const script = new vm.Script(
    `${source}\n;globalThis.__QUESTION_EXPORTS__ = { FUNCTION_TEMPLATES, QUESTIONS };`,
    { filename: 'public/questions.js' }
  );
  script.runInContext(context);
  return context.__QUESTION_EXPORTS__ || {};
}

function toNumber(value) {
  return Number.isFinite(value) ? value : null;
}

function normalizeParams(template, q) {
  const params = { a: 0, b: 0, c: 0, d: 0, e: 0 };
  if (template && template.defaults && typeof template.defaults === 'object') {
    for (const key of PARAM_KEYS) {
      if (Number.isFinite(template.defaults[key])) params[key] = template.defaults[key];
    }
  }
  if (q && q.defaults && typeof q.defaults === 'object') {
    for (const key of PARAM_KEYS) {
      if (Number.isFinite(q.defaults[key])) params[key] = q.defaults[key];
    }
  }
  if (Array.isArray(q?.params)) {
    PARAM_KEYS.forEach((key, idx) => {
      if (Number.isFinite(q.params[idx])) params[key] = q.params[idx];
    });
  }
  return params;
}

function getActiveParams(template) {
  if (!template) return [];
  if (template.kind === 'poly4') return ['a', 'b', 'c', 'd', 'e'];
  if (Array.isArray(template.params)) {
    return template.params.filter((key) => PARAM_KEYS.includes(key));
  }
  return [];
}

function getEditableParams(q, template) {
  const active = getActiveParams(template);
  const locked = new Set(Array.isArray(q?.locked) ? q.locked : []);
  return active.filter((key) => !locked.has(PARAM_TO_INPUT_ID[key]));
}

function evaluateFunction(kind, params, x) {
  if (kind === 'poly2') return params.a * x * x + params.b * x + params.c;
  if (kind === 'poly4') return params.a * x ** 4 + params.b * x ** 3 + params.c * x * x + params.d * x + params.e;
  if (kind === 'line') return params.c * x + params.d;
  if (kind === 'quad_shift') return (x - params.c) * (x - params.c) + params.d;
  return params.a * x ** 3 + params.b * x * x + params.c * x + params.d;
}

function evaluateDerivative(kind, params, x) {
  if (kind === 'poly2') return 2 * params.a * x + params.b;
  if (kind === 'poly4') return 4 * params.a * x ** 3 + 3 * params.b * x * x + 2 * params.c * x + params.d;
  if (kind === 'line') return params.c;
  if (kind === 'quad_shift') return 2 * (x - params.c);
  return 3 * params.a * x * x + 2 * params.b * x + params.c;
}

function evaluateSecondDerivative(kind, params, x) {
  if (kind === 'poly2') return 2 * params.a;
  if (kind === 'poly4') return 12 * params.a * x * x + 6 * params.b * x + 2 * params.c;
  if (kind === 'line') return 0;
  if (kind === 'quad_shift') return 2;
  return 6 * params.a * x + 2 * params.b;
}

function getDomain(template) {
  const xMin = Number.isFinite(template?.domain?.xMin) ? template.domain.xMin : -10;
  const xMax = Number.isFinite(template?.domain?.xMax) ? template.domain.xMax : 10;
  return {
    xMin: Math.min(xMin, xMax),
    xMax: Math.max(xMin, xMax)
  };
}

function existsX(domain, predicate) {
  const span = Math.max(0.0001, domain.xMax - domain.xMin);
  const steps = Math.max(1200, Math.floor(span / 0.01));
  for (let i = 0; i <= steps; i += 1) {
    const x = domain.xMin + (span * i) / steps;
    if (predicate(x)) return true;
  }
  return false;
}

function getTargets(q) {
  const fromData = Array.isArray(q?.data?.targets) ? q.data.targets : [];
  const fromQuestion = Array.isArray(q?.targets) ? q.targets : [];
  return (fromData.length > 0 ? fromData : fromQuestion)
    .filter((t) => Number.isFinite(t?.x) && Number.isFinite(t?.y))
    .map((t) => ({ x: t.x, y: t.y }));
}

function maxTargetError(kind, params, targets) {
  let worst = 0;
  for (const t of targets) {
    const err = Math.abs(evaluateFunction(kind, params, t.x) - t.y);
    if (err > worst) worst = err;
  }
  return worst;
}

function mulberry32(seed) {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let z = Math.imul(t ^ (t >>> 15), 1 | t);
    z ^= z + Math.imul(z ^ (z >>> 7), 61 | z);
    return ((z ^ (z >>> 14)) >>> 0) / 4294967296;
  };
}

function hasHitTargetSolution(q, template, baseParams) {
  const data = q?.data || {};
  const targets = getTargets(q);
  if (targets.length === 0) return { ok: false, reason: 'missing targets' };

  const tolerance = Number.isFinite(data.toleranceY)
    ? data.toleranceY
    : (Number.isFinite(data.tolerance) ? data.tolerance : 0.25);

  const editable = getEditableParams(q, template);
  const preferred = Array.isArray(data.preferredEditableParams)
    ? data.preferredEditableParams.filter((key) => editable.includes(key))
    : [];
  const vars = preferred.length > 0 ? preferred : editable;

  const evaluate = (candidate) => maxTargetError(template.kind, candidate, targets);

  let best = evaluate(baseParams);
  if (best <= tolerance) return { ok: true, best };
  if (vars.length === 0) return { ok: false, best, reason: 'no editable params' };

  if (vars.length <= 2) {
    const c0 = { ...baseParams };
    if (vars.length === 1) {
      for (const v0 of RANGE_VALUES) {
        c0[vars[0]] = v0;
        const err = evaluate(c0);
        if (err < best) best = err;
        if (err <= tolerance) return { ok: true, best: err };
      }
      return { ok: false, best, reason: `best error ${best.toFixed(4)}` };
    }

    const c1 = { ...baseParams };
    for (const v0 of RANGE_VALUES) {
      c1[vars[0]] = v0;
      for (const v1 of RANGE_VALUES) {
        c1[vars[1]] = v1;
        const err = evaluate(c1);
        if (err < best) best = err;
        if (err <= tolerance) return { ok: true, best: err };
      }
    }
    return { ok: false, best, reason: `best error ${best.toFixed(4)}` };
  }

  const random = mulberry32((q?.id ?? 0) + 12345);
  const tries = 50000;
  for (let i = 0; i < tries; i += 1) {
    const candidate = { ...baseParams };
    for (const key of vars) {
      const raw = -5 + random() * 10;
      candidate[key] = Math.round(raw * 10) / 10;
    }
    const err = evaluate(candidate);
    if (err < best) best = err;
    if (err <= tolerance) return { ok: true, best: err };
  }
  return { ok: false, best, reason: `best error ${best.toFixed(4)}` };
}

function hasMoveXSolution(q, template, params) {
  const goal = q.goal;
  const data = q?.data || {};
  const domain = getDomain(template);
  const kind = template.kind;

  if (goal === 'read_slope' || goal === 'read_y') {
    const x0 = toNumber(data.fixedX0);
    if (x0 === null) return { ok: false, reason: 'fixedX0 missing' };
    const inDomain = x0 >= domain.xMin - 1e-9 && x0 <= domain.xMax + 1e-9;
    if (!inDomain) return { ok: false, reason: `x0=${x0} out of domain` };
    const y = evaluateFunction(kind, params, x0);
    const m = evaluateDerivative(kind, params, x0);
    const finite = Number.isFinite(y) && Number.isFinite(m);
    return { ok: finite, reason: finite ? '' : 'non-finite value at x0' };
  }

  if (goal === 'slope_zero') {
    const tol = Number.isFinite(data.toleranceM) ? data.toleranceM : 0.1;
    const ok = existsX(domain, (x) => Math.abs(evaluateDerivative(kind, params, x)) <= tol);
    return { ok, reason: ok ? '' : 'no x with slope close to 0' };
  }

  if (goal === 'min_point') {
    const tol = Number.isFinite(data.toleranceM) ? data.toleranceM : 0.1;
    const ok = existsX(domain, (x) => {
      const m = evaluateDerivative(kind, params, x);
      const dd = evaluateSecondDerivative(kind, params, x);
      return Math.abs(m) <= tol && dd > 0;
    });
    return { ok, reason: ok ? '' : 'no minimum point matching tolerance' };
  }

  if (goal === 'slope_equals') {
    const tol = Number.isFinite(data.toleranceM) ? data.toleranceM : 0.1;
    const target = Number.isFinite(data.targetM) ? data.targetM : null;
    if (target === null) return { ok: false, reason: 'targetM missing' };
    const ok = existsX(domain, (x) => Math.abs(evaluateDerivative(kind, params, x) - target) <= tol);
    return { ok, reason: ok ? '' : `no x with slope ${target}` };
  }

  if (goal === 'y_equals') {
    const tol = Number.isFinite(data.toleranceY) ? data.toleranceY : 0.2;
    const target = Number.isFinite(data.targetY) ? data.targetY : null;
    if (target === null) return { ok: false, reason: 'targetY missing' };
    const ok = existsX(domain, (x) => Math.abs(evaluateFunction(kind, params, x) - target) <= tol);
    return { ok, reason: ok ? '' : `no x with y=${target}` };
  }

  if (goal === 'tangent_through_point') {
    const point = data?.point;
    if (!Number.isFinite(point?.x) || !Number.isFinite(point?.y)) {
      return { ok: false, reason: 'point missing for tangent_through_point' };
    }
    const tol = Number.isFinite(data.tolerance) ? data.tolerance : 0.25;
    const ok = existsX(domain, (x) => {
      const y = evaluateFunction(kind, params, x);
      const m = evaluateDerivative(kind, params, x);
      const yOnTangent = m * (point.x - x) + y;
      return Math.abs(yOnTangent - point.y) <= tol;
    });
    return { ok, reason: ok ? '' : 'no tangent passing through external point' };
  }

  return { ok: true };
}

function validateQuestionShape(q, templateById) {
  const errors = [];
  const warnings = [];
  const template = templateById.get(q.startTemplateId);

  if (!template) {
    errors.push(`startTemplateId לא קיים: ${q.startTemplateId}`);
    return { errors, warnings };
  }
  if (!GOALS.has(q.goal)) {
    errors.push(`goal לא נתמך: ${q.goal}`);
  }
  if (typeof q.title !== 'string' || !q.title.trim()) {
    errors.push('title חסר או ריק');
  }
  if (typeof q.desc !== 'string' || !q.desc.trim()) {
    errors.push('desc חסר או ריק');
  } else {
    const lines = q.desc.split('\n').map((s) => s.trim()).filter(Boolean);
    if (lines.length < 2 && q.goal !== 'free') {
      warnings.push('מומלץ desc עם שתי שורות לפחות (מה עושים + איך בודקים הצלחה)');
    }
  }

  if (Array.isArray(q.locks)) {
    warnings.push('נמצא המפתח "locks" שאינו נתמך. צריך להשתמש ב-"locked".');
  }

  if (Array.isArray(q.locked)) {
    for (const id of q.locked) {
      if (!INPUT_IDS.has(id)) errors.push(`locked מכיל מזהה לא חוקי: ${id}`);
    }
  }

  const data = q.data || {};
  if ((q.goal === 'read_slope' || q.goal === 'read_y') && !Number.isFinite(data.fixedX0)) {
    errors.push('לשאלת read_* חייב להיות data.fixedX0 מספרי');
  }
  if (q.goal === 'slope_equals' && !Number.isFinite(data.targetM)) {
    errors.push('לשאלת slope_equals חייב להיות data.targetM מספרי');
  }
  if (q.goal === 'y_equals' && !Number.isFinite(data.targetY)) {
    errors.push('לשאלת y_equals חייב להיות data.targetY מספרי');
  }
  if ((q.goal === 'hit_target' || q.goal === 'hit_targets') && getTargets(q).length === 0) {
    errors.push('לשאלת hit_target(s) חייבות להיות נקודות יעד data.targets');
  }
  if (q.goal === 'tangent_through_point') {
    if (!Number.isFinite(data?.point?.x) || !Number.isFinite(data?.point?.y)) {
      errors.push('לשאלת tangent_through_point חייבת להיות data.point עם x,y מספריים');
    }
  }

  return { errors, warnings };
}

function solvabilityCheck(q, templateById) {
  const template = templateById.get(q.startTemplateId);
  if (!template) return { ok: false, reason: 'missing template' };

  if (q.goal === 'free' || q.goal === 'choose_function_template') {
    return { ok: true };
  }

  const params = normalizeParams(template, q);
  if (q.goal === 'hit_target' || q.goal === 'hit_targets') {
    return hasHitTargetSolution(q, template, params);
  }
  return hasMoveXSolution(q, template, params);
}

async function main() {
  let source;
  try {
    source = await fs.readFile(questionsPath, 'utf8');
  } catch (err) {
    fail(`לא ניתן לקרוא את ${questionsPath}: ${err.message}`);
    return;
  }

  const { FUNCTION_TEMPLATES, QUESTIONS } = loadQuestionConfig(source);
  if (!Array.isArray(FUNCTION_TEMPLATES) || !Array.isArray(QUESTIONS)) {
    fail('questions.js לא מגדיר FUNCTION_TEMPLATES ו-QUESTIONS תקינים.');
    return;
  }

  const templateById = new Map(FUNCTION_TEMPLATES.map((t) => [t.id, t]));
  const seenIds = new Set();
  const errors = [];
  const warnings = [];

  QUESTIONS.forEach((q, idx) => {
    const prefix = `Q${idx} (id=${q?.id ?? 'NA'}):`;
    if (!Number.isInteger(q?.id)) {
      errors.push(`${prefix} id לא מספר שלם.`);
    } else if (seenIds.has(q.id)) {
      errors.push(`${prefix} id כפול.`);
    } else {
      seenIds.add(q.id);
    }

    const shape = validateQuestionShape(q, templateById);
    shape.errors.forEach((msg) => errors.push(`${prefix} ${msg}`));
    shape.warnings.forEach((msg) => warnings.push(`${prefix} ${msg}`));

    const solvability = solvabilityCheck(q, templateById);
    if (!solvability.ok) {
      errors.push(`${prefix} בדיקת פתרון נכשלה: ${solvability.reason || 'לא נמצא פתרון בתחום הנתמך'}`);
    }
  });

  if (warnings.length > 0) {
    console.log('Warnings:');
    warnings.forEach((w) => console.log(`- ${w}`));
  }

  if (errors.length > 0) {
    console.log('Errors:');
    errors.forEach((e) => console.log(`- ${e}`));
    process.exit(1);
    return;
  }

  console.log(`OK: ${QUESTIONS.length} questions validated successfully.`);
}

main().catch((err) => fail(err?.message || String(err)));
