import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
function response() {
  return {
    headers: {},
    setHeader(k, v) {
      this.headers[k] = v;
    },
    status(n) {
      this.code = n;
      return this;
    },
    json(v) {
      this.body = v;
      return this;
    },
  };
}
for (const path of ["api/tutor.js", "api/scan-question.js"])
  test(path + " refuses AI even with configured credentials", async () => {
    process.env.GEMINI_API_KEY = "test-key";
    let calls = 0;
    const old = globalThis.fetch;
    globalThis.fetch = async () => {
      calls++;
      throw Error("provider must not be called");
    };
    try {
      let source = fs.readFileSync(path, "utf8");
      let handler;
      if (source.includes("import ")) {
        handler = (await import(new URL("../" + path, import.meta.url)))
          .default;
      } else
        handler = (
          await import(
            "data:text/javascript;base64," +
              Buffer.from(source).toString("base64")
          )
        ).default;
      const res = response();
      await handler(
        {
          method: "POST",
          headers: {},
          body: { messages: [{ role: "user", content: "test" }] },
        },
        res,
      );
      assert.equal(res.code, 410);
      assert.equal(calls, 0);
    } finally {
      globalThis.fetch = old;
      delete process.env.GEMINI_API_KEY;
    }
  });
