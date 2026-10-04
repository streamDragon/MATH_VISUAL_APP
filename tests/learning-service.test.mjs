import { test } from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
let Service;
try {
  Service = require("../public/learning-service.js").LearningService;
} catch {}
test("unsent submissions without a session are not reported successful", async () => {
  assert.equal(typeof Service, "function");
  const s = new Service({
    fetch: () => {
      throw Error("should not fetch");
    },
    storage: null,
  });
  await assert.rejects(
    () => s.submitRequest({ text: "test" }),
    /sign_in_required/,
  );
});
test("backend schema failure is explicit and propagates to caller", async () => {
  assert.equal(typeof Service, "function");
  const s = new Service({
    fetch: async () =>
      new Response(
        JSON.stringify({ code: "PGRST205", message: "table missing" }),
        { status: 404 },
      ),
    storage: null,
  });
  s.session = { access_token: "token", user: { id: "user" } };
  await assert.rejects(
    () => s.submitRequest({ text: "valid question", grade: 9, language: "he" }),
    /backend_setup_required/,
  );
});
test("auth errors never return protected content", async () => {
  assert.equal(typeof Service, "function");
  const s = new Service({
    fetch: async () =>
      new Response(JSON.stringify({ message: "expired" }), { status: 401 }),
    storage: null,
  });
  s.session = { access_token: "bad", user: { id: "user" } };
  await assert.rejects(() => s.activity("premium"), /session_expired/);
});
test("request limits and empty content are rejected before sending", async () => {
  assert.equal(typeof Service, "function");
  const s = new Service({ storage: null });
  s.session = { access_token: "token", user: { id: "user" } };
  await assert.rejects(
    () => s.submitRequest({ text: " " }),
    /question_required/,
  );
  await assert.rejects(
    () => s.submitRequest({ text: "a".repeat(5001) }),
    /question_too_long/,
  );
});
