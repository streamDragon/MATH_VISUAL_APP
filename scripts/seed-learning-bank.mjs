// Outputs owner-run SQL, or publishes through an already authorized moderator JWT.
import fs from "node:fs";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url),
  core = require("../public/learning-core.js");
const bank = JSON.parse(fs.readFileSync("content/learning-bank.json", "utf8"));
for (const a of bank) {
  if (
    !core.checkAnswer(core.answerFor(a, a.params), a.answer, 1e-8) ||
    !core.checkAnswer(
      core.answerFor({ ...a, query: a.transfer.query }, a.transfer.params),
      a.transfer.answer,
      1e-8,
    )
  )
    throw Error("Invalid answers: " + a.id);
}
const sql =
  "begin;\n" +
  bank
    .map((a) => {
      const payload = JSON.stringify(a).replace(/'/g, "''");
      return `insert into public.learning_content(id,payload,tier,published) values('${a.id}','${payload}'::jsonb,'${a.tier}',true) on conflict(id) do update set payload=excluded.payload,tier=excluded.tier,published=true,updated_at=now();`;
    })
    .join("\n") +
  "\ncommit;\n";
fs.mkdirSync("supabase/seeds", { recursive: true });
fs.writeFileSync("supabase/seeds/learning-bank.sql", sql);
console.log(
  `Validated ${bank.length} activities; wrote supabase/seeds/learning-bank.sql`,
);
