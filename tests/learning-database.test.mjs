import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { PGlite } from "@electric-sql/pglite";
let db;
const u = "11111111-1111-4111-8111-111111111111",
  v = "22222222-2222-4222-8222-222222222222",
  admin = "33333333-3333-4333-8333-333333333333";
before(async () => {
  db = new PGlite();
  await db.exec(
    `create role anon;create role authenticated;create schema auth;create schema storage;create table auth.users(id uuid primary key);create function auth.uid() returns uuid language sql as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;create table storage.buckets(id text primary key,name text,public bool,file_size_limit bigint,allowed_mime_types text[]);create table storage.objects(id uuid default gen_random_uuid(),bucket_id text,name text);alter table storage.objects enable row level security;grant usage on schema auth,storage to anon,authenticated;grant select,insert on storage.objects to authenticated;create function storage.foldername(name text)returns text[]language sql as $$select string_to_array(name,'/')$$;insert into auth.users values('${u}'),('${v}'),('${admin}');`,
  );
  await db.exec(
    fs.readFileSync("supabase/migrations/202610040001_learning.sql", "utf8"),
  );
  await db.exec(fs.readFileSync("supabase/seeds/learning-bank.sql", "utf8"));
  await db.exec(`insert into public.learning_moderators values('${admin}');`);
});
after(async () => {
  await db?.close();
});
async function asUser(id, sql) {
  await db.exec(
    `reset role;select set_config('request.jwt.claim.sub','${id}',false);set role authenticated;`,
  );
  try {
    return await db.query(sql);
  } finally {
    await db.exec("reset role");
  }
}
test("free learners cannot fetch premium payload or grant their own plan", async () => {
  const data = await asUser(
    u,
    "select id from public.learning_content where tier='premium'",
  );
  assert.equal(data.rows.length, 0);
  await assert.rejects(() =>
    asUser(
      u,
      `insert into public.learning_entitlements(user_id,plan) values('${u}','premium')`,
    ),
  );
});
test("request receipt is durable and another learner cannot read it", async () => {
  const data = await asUser(
    u,
    "select public.learning_submit_request('Original question',9,'en',null,null,'44444444-4444-4444-8444-444444444444') as result",
  );
  assert.ok(data.rows[0].result.id);
  const duplicate = await asUser(
    u,
    "select public.learning_submit_request('Original question',9,'en',null,null,'44444444-4444-4444-8444-444444444444') as result",
  );
  assert.equal(duplicate.rows[0].result.id, data.rows[0].result.id);
  assert.equal(
    (await asUser(v, "select * from public.learning_requests")).rows.length,
    0,
  );
});
test("server rejects wrong mastery and duplicate completion cannot farm points", async () => {
  await assert.rejects(
    () => asUser(u, "select public.learning_submit_mastery('linear-01',99,7)"),
    /wrong_answer/,
  );
  const first = await asUser(
    u,
    "select public.learning_submit_mastery('linear-01',5,7) as result",
  );
  const again = await asUser(
    u,
    "select public.learning_submit_mastery('linear-01',5,7) as result",
  );
  assert.equal(first.rows[0].result.xp, 40);
  assert.equal(again.rows[0].result.xp, 40);
});
test("cohort board shows aliases only and rejects outsiders", async () => {
  await asUser(
    u,
    `insert into public.learning_profiles values('${u}','Blue comet','bot',9)`,
  );
  const row = await asUser(
    u,
    "select public.learning_join_cohort('solo',9,null) as result",
  );
  const cid = row.rows[0].result.id;
  const board = await asUser(
    u,
    `select public.learning_race_board('${cid}') as result`,
  );
  assert.equal(board.rows[0].result.peers.length, 1);
  assert.ok(board.rows[0].result.activity_ids.includes("linear-01"));
  assert.deepEqual(board.rows[0].result.completed_ids, ["linear-01"]);
  assert.deepEqual(Object.keys(board.rows[0].result.peers[0]).sort(), [
    "avatar",
    "completed",
    "is_self",
    "nickname",
  ]);
  await assert.rejects(
    () => asUser(v, `select public.learning_race_board('${cid}')`),
    /cohort_access/,
  );
});
test("moderation is server authorized and a free member cannot create a class", async () => {
  await assert.rejects(
    () =>
      asUser(
        u,
        "select public.learning_review_request('44444444-4444-4444-8444-444444444444','reviewing',null,'')",
      ),
    /moderator_required/,
  );
  await assert.rejects(
    () =>
      asUser(
        u,
        "select public.learning_create_class('My class',9,array['linear-01'])",
      ),
    /class_access/,
  );
});

test("only the first finisher receives the summit bonus", async () => {
  await db.exec(
    `insert into public.learning_profiles values('${v}','Pink orbit','fox',9);insert into public.learning_entitlements(user_id,plan) values('${admin}','class');insert into public.learning_profiles values('${admin}','Teacher','orbit',9)`,
  );
  const created = await asUser(
    admin,
    "select public.learning_create_class('Sprint',9,array['linear-02']) as result",
  );
  const code = created.rows[0].result.code;
  await asUser(u, `select public.learning_join_cohort('class',9,'${code}')`);
  await asUser(v, `select public.learning_join_cohort('class',9,'${code}')`);
  const a = JSON.parse(fs.readFileSync("content/learning-bank.json")).find(
    (a) => a.id === "linear-02",
  );
  const win = await asUser(
    u,
    `select public.learning_submit_mastery('${a.id}',${a.answer},${a.transfer.answer}) as result`,
  );
  const second = await asUser(
    v,
    `select public.learning_submit_mastery('${a.id}',${a.answer},${a.transfer.answer}) as result`,
  );
  assert.equal(win.rows[0].result.summit_bonus, true);
  assert.equal(second.rows[0].result.summit_bonus, false);
  const persisted = await asUser(
    u,
    "select public.learning_progress() as result",
  );
  assert.equal(persisted.rows[0].result.xp, 100);
});
test("solo groups never exceed eleven real learners", async () => {
  const ids = [];
  for (let i = 1; i <= 12; i++) {
    const id = `77777777-7777-4777-8777-${String(i).padStart(12, "0")}`;
    await db.exec(
      `insert into auth.users values('${id}');insert into public.learning_profiles values('${id}','Comet ${i}','orbit',11)`,
    );
    const r = await asUser(
      id,
      "select public.learning_join_cohort('solo',11,null) as result",
    );
    ids.push(r.rows[0].result.id);
  }
  assert.equal(new Set(ids.slice(0, 11)).size, 1);
  assert.notEqual(ids[11], ids[0]);
  const r = await db.query(
    `select count(*) as n from public.learning_members where cohort_id='${ids[0]}'`,
  );
  assert.equal(r.rows[0].n, 11);
});
