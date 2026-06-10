/* check-book-questions.mjs — validates public/book-questions.js
 * Checks: file parses, every anchor has a {{marker}} in the text and vice
 * versa, every skill key exists in VISUAL_SKILL_REGISTRY (index.html),
 * every startTemplateId exists in questions.js, and goal types are known
 * (existing engine goals or declared in BOOK_ENGINE_NEEDS).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => fs.readFileSync(path.join(root, p), "utf8");

const sandbox = {};
new Function(
  read("public/book-questions.js") +
    "; sandbox.BOOK_QUESTIONS = BOOK_QUESTIONS; sandbox.ENGINE_NEEDS = BOOK_ENGINE_NEEDS;"
).call(null, (globalThis.sandbox = sandbox));
const { BOOK_QUESTIONS, ENGINE_NEEDS } = sandbox;

const html = read("index.html");
const regBlock = html.match(/VISUAL_SKILL_REGISTRY = \{[\s\S]*?\n\s*\};/)[0];
const skillKeys = new Set(
  [...regBlock.matchAll(/^\s+(\w+): \{/gm)].map((m) => m[1])
);

const questionsSrc = read("public/questions.js");
const templateIds = new Set(
  [...questionsSrc.matchAll(/id: "([\w]+)"/g)].map((m) => m[1])
);

const EXISTING_GOALS = new Set([
  "choose_function_template", "slope_zero", "min_point", "slope_equals",
  "y_equals", "read_slope", "read_y", "hit_target", "hit_targets",
  "tangent_through_point", "free", "slope_at_x", "slope_at_x_equals",
]);
const NEEDED_GOALS = new Set([...ENGINE_NEEDS, "horizontal_line_solution_count"]);

const errors = [];
const warnings = [];

for (const q of BOOK_QUESTIONS) {
  const fullText = [q.stem, ...q.parts.map((p) => p.text)].join("\n");
  const markerIds = [...fullText.matchAll(/\{\{(\w+)\|/g)].map((m) => m[1]);

  for (const a of q.anchors) {
    if (!markerIds.includes(a.id))
      errors.push(`${q.id}: anchor "${a.id}" has no {{marker}} in text`);
    for (const s of a.skills)
      if (!skillKeys.has(s))
        errors.push(`${q.id}/${a.id}: unknown skill "${s}"`);
    const L = a.launch;
    if (!templateIds.has(L.startTemplateId))
      errors.push(`${q.id}/${a.id}: unknown template "${L.startTemplateId}"`);
    const goals = L.steps ? L.steps.map((s) => s.goal) : [L.goal];
    for (const g of goals) {
      if (EXISTING_GOALS.has(g)) continue;
      if (NEEDED_GOALS.has(g)) {
        if (!(a.engineNeeds || []).includes(g))
          warnings.push(`${q.id}/${a.id}: goal "${g}" needs engine work but anchor does not declare engineNeeds`);
      } else errors.push(`${q.id}/${a.id}: unknown goal "${g}"`);
    }
    if (!a.heExplain) errors.push(`${q.id}/${a.id}: missing heExplain`);
  }
  for (const id of markerIds)
    if (!q.anchors.some((a) => a.id === id))
      errors.push(`${q.id}: marker "${id}" has no anchor object`);
  if (!q.verified || Object.keys(q.verified).length < q.parts.length)
    warnings.push(`${q.id}: verified solutions incomplete (${Object.keys(q.verified || {}).length}/${q.parts.length} parts)`);
}

console.log(`book questions: ${BOOK_QUESTIONS.length}`);
console.log(`registry skills found: ${skillKeys.size}`);
for (const w of warnings) console.log(`WARN  ${w}`);
if (errors.length) {
  for (const e of errors) console.error(`ERROR ${e}`);
  process.exit(1);
}
console.log("OK: anchors, markers, skills, templates and goals all consistent");
