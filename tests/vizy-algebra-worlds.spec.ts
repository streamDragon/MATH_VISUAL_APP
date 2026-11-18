import { test, expect } from "@playwright/test";

test("the large grade 9 exercise keeps its domain and restores an inspected expression", async ({ page }) => {
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
  for (const [i, tool] of ["monic", "monic", "nonmonic", "identity"].entries()) {
    await page.locator('[data-open="' + i + '"]').click();
    await expect(page.locator('[data-answer="nonmonic"] bdi')).toHaveText("ax²+bx+c");
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
    if (i === 2) await choose("monic");
    await choose(tool);
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
