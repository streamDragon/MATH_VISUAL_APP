import { test, expect } from "./browser-fixtures";
import fs from "node:fs";

test("a newly published free assignment opens without a startup catalog entry", async ({
  page,
}) => {
  const a = {
    ...JSON.parse(fs.readFileSync("content/learning-bank.json", "utf8"))[0],
    id: "new-free-question",
  };
  await page.route("**/rest/v1/learning_content?**", (route) =>
    route.fulfill({ json: [{ payload: a }] }),
  );
  await page.route("**/rest/v1/rpc/learning_catalog", (route) =>
    route.fulfill({ json: [] }),
  );
  await page.goto("/learn.html?activity=" + a.id);
  await expect(page.locator("#prediction-question")).toBeVisible();
});
test("signed-in learners see assigned tasks and durable verified bonus points", async ({
  page,
}) => {
  await page.addInitScript(() => {
    localStorage.setItem(
      "vizy_learning_session",
      JSON.stringify({
        access_token: "test-token",
        user: { id: "test-user" },
        expires_at: Date.now() / 1000 + 3600,
      }),
    );
    localStorage.setItem(
      "vizy_cohort",
      JSON.stringify({ id: "test-group", mode: "class" }),
    );
  });
  await page.route("**/auth/v1/user", (route) =>
    route.fulfill({ json: { id: "test-user" } }),
  );
  await page.route("**/rest/v1/learning_entitlements?**", (route) =>
    route.fulfill({ json: [] }),
  );
  await page.route("**/rest/v1/rpc/learning_catalog", (route) =>
    route.fulfill({ json: [] }),
  );
  await page.route("**/rest/v1/rpc/learning_progress", (route) =>
    route.fulfill({ json: { xp: 60, mastered: ["linear-01"] } }),
  );
  await page.route("**/rest/v1/rpc/learning_race_board", (route) =>
    route.fulfill({
      json: {
        goal: 2,
        activity_ids: ["linear-01", "linear-02"],
        completed_ids: ["linear-01"],
        peers: [
          { nickname: "Comet", avatar: "bot", is_self: true, completed: 1 },
        ],
      },
    }),
  );
  await page.goto("/learn.html#race");
  await expect(page.locator("#server-xp")).toHaveText("60");
  await expect(page.locator("#group-tasks button")).toHaveCount(2);
  await page.locator("#group-tasks button").last().click();
  await expect(page.locator("#prediction-question")).toBeVisible();
  await page.reload();
  await expect(page.locator("#server-xp")).toHaveText("60");
});

test("mute stops a playing prerecorded voice", async ({ page }) => {
  await page.route("**/learning-voices.json", (route) =>
    route.fulfill({
      json: { clips: { he_explore: "audio/learning/he/explore.mp3" } },
    }),
  );
  await page.addInitScript(() => {
    (window as any).voiceEvents = [];
    (window as any).Audio = class {
      volume = 1;
      play() {
        (window as any).voiceEvents.push("play");
        return Promise.resolve();
      }
      pause() {
        (window as any).voiceEvents.push("pause");
      }
    };
  });
  await page.goto("/learn.html?activity=linear-01");
  await page.locator("[data-choice]").first().click();
  await page.locator("#show-model").click();
  await expect
    .poll(() => page.evaluate(() => (window as any).voiceEvents))
    .toContain("play");
  await page.locator("#mute").click();
  expect(await page.evaluate(() => (window as any).voiceEvents)).toContain(
    "pause",
  );
});
async function noOverflow(page) {
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth - innerWidth,
    ),
  ).toBeLessThanOrEqual(2);
}

test("teacher can choose assignments for the selected grade", async ({
  page,
}) => {
  await page.goto("/learn.html#race");
  await page.getByText("יצירת כיתה", { exact: true }).click();
  await expect(page.locator("#class-activities input")).toHaveCount(8);
  await expect(page.locator("#class-activities input:checked")).toHaveCount(4);
  await page.locator("#race-grade").selectOption("11");
  await expect(page.locator("#class-activities input")).toHaveCount(4);
  await expect(page.locator("#class-activities input:checked")).toHaveCount(2);
});
test("phone enters a useful bank directly and filters grade", async ({
  page,
}) => {
  await page.goto("/learn.html");
  await expect(
    page.getByRole("heading", { name: "רואים. מבינים. מצליחים." }),
  ).toBeVisible();
  await expect(page.locator("#continue-challenge")).toBeInViewport();
  await noOverflow(page);
  await page.getByRole("button", { name: "י״א", exact: true }).click();
  await expect(page.locator(".activity-card")).toHaveCount(4);
  await expect(page.locator(".activity-card").first()).toContainText(
    "קוראים את הכיוון",
  );
});
test("prediction then manipulation and transfer grants mastery once without AI", async ({
  page,
}) => {
  const ai = [];
  page.on("request", (r) => {
    if (
      /\/api\/(tutor|scan-question)|generativelanguage|anthropic|openai\.com/.test(
        r.url(),
      )
    )
      ai.push(r.url());
  });
  await page.goto("/learn.html?activity=linear-01");
  await page.getByRole("button", { name: "עולה ב־2", exact: true }).click();
  await page.getByRole("button", { name: "נבדוק בציור" }).click();
  await expect(page.locator("#model-svg")).toBeVisible();
  await page.locator("#answer").fill("5");
  await page.getByRole("button", { name: "בדיקת תשובה", exact: true }).click();
  await page.getByRole("button", { name: "מוכנים לדמיין לבד" }).click();
  await expect(page.locator("#model-svg")).toHaveCount(0);
  await page.locator("#transfer-answer").fill("7");
  await page.getByRole("button", { name: "בדיקת האתגר החדש" }).click();
  await expect(page.locator("#mastery-title")).toHaveText(
    "הרעיון הזה כבר שלכם",
  );
  await expect(page.locator("#xp-value")).toHaveText("40");
  await page.reload();
  await page.getByRole("button", { name: "עולה ב־2", exact: true }).click();
  await page.getByRole("button", { name: "נבדוק בציור" }).click();
  await page.locator("#answer").fill("5");
  await page.getByRole("button", { name: "בדיקת תשובה", exact: true }).click();
  await page.getByRole("button", { name: "מוכנים לדמיין לבד" }).click();
  await page.locator("#transfer-answer").fill("7");
  await page.getByRole("button", { name: "בדיקת האתגר החדש" }).click();
  await expect(page.locator("#xp-value")).toHaveText("40");
  expect(ai).toEqual([]);
  await noOverflow(page);
});
test("premium card cannot be unlocked by a local plan flag", async ({
  page,
}) => {
  await page.addInitScript(() =>
    localStorage.setItem("math_visual_premium_access_v1", '{"plan":"premium"}'),
  );
  await page.goto("/learn.html?activity=linear-03");
  await expect(page.locator("#plans-title")).toBeVisible();
  await expect(page.locator("#model-svg")).toHaveCount(0);
});
test("request failure preserves an unsent draft and never claims receipt", async ({
  page,
}) => {
  await page.goto("/learn.html#requests");
  await page
    .locator("#request-text")
    .fill("<script>alert(1)</script> מהו שטח משולש?");
  await page.getByRole("button", { name: "שמירת טיוטה" }).click();
  await expect(page.locator("#request-status")).toContainText("לא נשלחה");
  await page.reload();
  await expect(page.locator("#request-text")).toHaveValue(
    "<script>alert(1)</script> מהו שטח משולש?",
  );
  await expect(page.locator("#request-status")).not.toContainText(
    "הבקשה התקבלה",
  );
});
test("competition has own avatar and no invented peers", async ({ page }) => {
  await page.goto("/learn.html#race");
  await expect(page.locator("#race-map")).toBeVisible();
  await expect(page.locator("#race-map [data-self]")).toHaveCount(1);
  await expect(page.locator("#race-state")).toContainText("לומדים");
  await noOverflow(page);
});
test("English switches both interface and activity content", async ({
  page,
}) => {
  await page.goto("/learn.html");
  await page.getByRole("button", { name: "English", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "See it. Get it. Solve it." }),
  ).toBeVisible();
  await page.locator("#continue-challenge").click();
  await expect(page.locator("#prediction-question")).toContainText("one step");
  await expect(page.locator("html")).toHaveAttribute("dir", "ltr");
});
test("moving the control twice updates the diagram each time", async ({
  page,
}) => {
  await page.goto("/learn.html?activity=linear-01");
  await page.getByRole("button", { name: "עולה ב־2", exact: true }).click();
  await page.getByRole("button", { name: "נבדוק בציור" }).click();
  const range = page.locator("#model-range");
  await range.fill("1");
  const first = await page
    .locator("#model-svg circle")
    .last()
    .getAttribute("cx");
  await range.fill("3");
  const second = await page
    .locator("#model-svg circle")
    .last()
    .getAttribute("cx");
  expect(first).toBe("230");
  expect(second).toBe("270");
});

test("all six models keep their focus visible and usable on a phone", async ({
  page,
}) => {
  for (const id of [
    "linear-02",
    "quadratic-02",
    "intersection-02",
    "triangle-02",
    "probability-02",
    "derivative-02",
  ]) {
    await page.goto("/learn.html?activity=" + id);
    await page.locator("[data-choice]").first().click();
    await page.locator("#show-model").click();
    await expect(page.locator("#question-stem")).toBeInViewport();
    await noOverflow(page);
    for (const cy of await page
      .locator("#model-svg circle")
      .evaluateAll((nodes) => nodes.map((n) => Number(n.getAttribute("cy"))))) {
      expect(cy).toBeGreaterThanOrEqual(0);
      expect(cy).toBeLessThanOrEqual(300);
    }
  }
});
test("cached free challenges work without a connection", async ({
  page,
  context,
}) => {
  await page.goto("/learn.html");
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
    await new Promise((resolve) => {
      if (navigator.serviceWorker.controller) return resolve(null);
      navigator.serviceWorker.addEventListener(
        "controllerchange",
        () => resolve(null),
        { once: true },
      );
    });
  });
  await context.setOffline(true);
  await page.goto("/learn.html?activity=linear-01");
  await expect(page.locator("#prediction-question")).toBeVisible();
  await page.locator("[data-choice]").first().click();
  await page.locator("#show-model").click();
  await expect(page.locator("#model-svg")).toBeVisible();
});

test("tangent focus remains in the graph at slider extremes", async ({
  page,
}) => {
  await page.goto("/learn.html?activity=derivative-02");
  await page.locator("[data-choice]").first().click();
  await page.locator("#show-model").click();
  for (const x of ["-4", "4"]) {
    await page.locator("#model-range").fill(x);
    const cy = Number(
      await page.locator("#model-svg circle").last().getAttribute("cy"),
    );
    expect(cy).toBeGreaterThanOrEqual(20);
    expect(cy).toBeLessThanOrEqual(290);
  }
});
