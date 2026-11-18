import { test, expect } from "@playwright/test";

test("the student home starts locally even with a saved account", async ({ page }) => {
  const serviceCalls: string[] = [];
  await page.route("**/*.supabase.co/**", async (route) => {
    serviceCalls.push(new URL(route.request().url()).pathname);
    await route.fulfill({ json: [] });
  });
  await page.addInitScript(() => {
    localStorage.setItem("vizy_learning_session", JSON.stringify({
      access_token: "test-session",
      expires_at: Date.now() / 1000 + 3600,
      user: { id: "test-user" },
    }));
  });
  await page.goto("/learn.html", { waitUntil: "networkidle" });
  await expect(page.locator("#student-start-ability")).toBeVisible();
  await expect(page.locator("#account-button")).toBeHidden();
  expect(serviceCalls).toEqual([]);
});
test("one sound control carries the preference into an inquiry", async ({ page }) => {
  await page.goto("/learn.html");
  const sound = page.locator("[data-vizy-sound-toggle]");
  await expect(sound).toHaveCount(1);
  await expect(sound).toHaveAttribute("aria-pressed", "true");
  await sound.click();
  await expect(sound).toHaveAttribute("aria-pressed", "false");
  await page.locator("#student-start-ability").click();
  await expect(sound).toHaveCount(1);
  await expect(sound).toHaveAttribute("aria-pressed", "false");
  await page.goto("/problem-map.html?lesson=increasing&sound=off");
  await expect(sound).toBeDisabled();
  await expect(sound).toHaveAttribute("aria-pressed", "false");
});

test("home returns to the exact saved inquiry step", async ({ page }) => {
  await page.goto("/learn.html");
  await page.locator('[data-home-grade="11"]').click();
  const start = page.locator("#student-start-ability");
  await start.click();
  await page.locator('#iqEntryOverlay [data-iq-answer="A"]').click();
  await page.locator("#iqNext").click();
  await expect(page.locator("#iqPrompt")).toHaveAttribute("data-iq-phase", "criterion");
  await page.locator('#vizy-unified-nav [data-nav="home"]').click();
  await expect(start).toContainText("ממשיכים");
  await expect(page.locator(".student-next-step .vizy-single-cta")).toHaveCount(1);
  await start.click();
  await expect(page.locator("#iqPrompt")).toHaveAttribute("data-iq-phase", "criterion");
});
