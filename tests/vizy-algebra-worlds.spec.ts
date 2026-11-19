import { test, expect } from "@playwright/test";

test("the large grade 11 exercise keeps its domain and restores an inspected expression", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 568 });
  await page.goto("/learn.html#tools");
  await page.locator('#vizy-tools-drawer a[href*="lesson=algebra-worlds"]').click();
  const choose = (answer: string) => page.locator('[data-answer="' + answer + '"]').click();
  await choose("omit-divisor");
  await expect(page.locator(".aw-feedback")).not.toBeEmpty();
  await page.locator("[data-insight]").click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.getByRole("dialog").locator("button").click();
  await choose("domain");
  // Each part: open it, recognise the structure, narrow it down, pick the general rule, then the product.
  for (const [i, kind] of ["monic", "monic", "nonmonic", "identity"].entries()) {
    await page.locator('[data-open="' + i + '"]').click();
    await expect(page.locator('[data-answer="trinomial"]')).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
    if (kind === "identity") {
      await choose("identity");
      await choose("square-nine");
    } else {
      await choose("trinomial");
      await expect(page.locator('[data-answer="nonmonic"] bdi').first()).toHaveText("ax²+bx+c");
      if (kind === "nonmonic") {
        await choose("monic");
        await expect(page.locator(".aw-feedback")).not.toBeEmpty();
      }
      await choose(kind);
    }
    await choose("formula");
    if (i === 2) {
      await page.reload();
      await expect(page.locator('[data-answer="factor"]')).toBeVisible();
    }
    await choose("factor");
  }
  await choose("flip");
  await expect(page.locator(".aw-op")).toHaveText("·");
  await choose("term");
  await expect(page.locator(".aw-feedback")).not.toBeEmpty();
  await choose("cancel");
  await expect(page.locator(".aw-expression")).toContainText("(x−2)²(x+4)");
  await expect(page.locator(".aw-domain")).toContainText("−4, −2, −3/2, 2");
  await page.reload();
  await expect(page.locator(".aw-steps")).toHaveAttribute("aria-valuenow", "7");
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
});

// Relative luminance contrast of two "rgb(r, g, b)" colours.
const contrast=(a:string,b:string)=>{
 const lum=(c:string)=>{const [r,g,bl]=c.match(/\d+(\.\d+)?/g)!.slice(0,3).map(Number).map(v=>{v/=255;return v<=0.03928?v/12.92:((v+0.055)/1.055)**2.4;});return 0.2126*r+0.7152*g+0.0722*bl;};
 const [x,y]=[lum(a),lum(b)].sort((p,q)=>q-p);return (x+0.05)/(y+0.05);
};

test("the exercise and the question are readable on the dark panels", async ({ page }) => {
  await page.goto("/problem-map.html?lesson=algebra-worlds");
  await page.evaluate(() => localStorage.removeItem("vizy_algebra_worlds_v1"));
  await page.reload();
  await expect(page.locator(".aw-prompt h2")).toBeVisible();
  const pairs = await page.evaluate(() => {
    const colour = (s: string) => getComputedStyle(document.querySelector(s)!).color;
    return {
      expression: [colour(".aw-expression .aw-math"), getComputedStyle(document.querySelector(".aw-stage")!).backgroundColor],
      question: [colour(".aw-prompt h2"), getComputedStyle(document.querySelector(".aw-prompt")!).backgroundColor],
      title: [colour(".aw-head h1"), "rgb(16, 26, 57)"],
    };
  });
  for (const [text, ground] of Object.values(pairs)) expect(contrast(text, ground)).toBeGreaterThanOrEqual(4.5);
});

test("play time sits in the lesson header, one home link, grade 11 label", async ({ page }) => {
  await page.goto("/problem-map.html?lesson=algebra-worlds");
  await expect(page.locator(".aw-head-tools .vizy-playtime-chip")).toHaveCount(1);
  await expect(page.locator(".vizy-playtime-floating")).toHaveCount(0);
  await page.locator('[data-answer="domain"]').click();
  await expect(page.locator(".aw-head-tools .vizy-playtime-chip")).toHaveCount(1);
  await expect(page.locator(".vizy-playtime-floating")).toHaveCount(0);
  await expect(page.locator("body > header a:visible", { hasText: "בית" })).toHaveCount(0);
  await expect(page.locator(".aw-kicker")).toHaveText("VIZY · כיתה י״א");
});
