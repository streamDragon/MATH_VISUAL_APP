import { test, expect, type Page } from '@playwright/test';

async function answer(page: Page, id: string) {
  const opening = page.locator('#iqEntryOverlay[data-mode="decision"] [data-iq-answer="' + id + '"]');
  if (await opening.isVisible()) await opening.click();
  else await page.locator('#vizyInquiry [data-iq-answer="' + id + '"]').last().click();
}
async function next(page: Page) {
  await expect(page.locator('#iqNext')).toBeVisible();
  await page.locator('#iqNext').click();
}

test('the real inquiry awards play time only after evidence, then returns to the same prompt', async ({page}) => {
  await page.goto('/problem-map.html?lesson=increasing');
  await page.evaluate(() => {
    localStorage.removeItem('vizy_inquiry_v1_graph');
    localStorage.removeItem('vizy_playtime_v1');
    localStorage.removeItem('vizy_game_off_v1');
  });
  await page.reload();
  await expect(page.locator('#iqEntryOverlay')).toBeVisible();
  await answer(page, 'A');
  await next(page);
  await answer(page, 'direction');
  await next(page);
  await expect(page.locator('#iqPrompt')).toHaveAttribute('data-iq-phase','contrast');
  await expect(page.locator('.vizy-playtime-chip')).toContainText('0:00');
  await answer(page, 'no');
  await expect(page.locator('#vizyInquiry .vizy-given-tools .vizy-playtime-chip')).toContainText('0:20');
  await expect(page.locator('.vizy-playtime-floating')).toHaveCount(0);
  await page.screenshot({path:'qa/vizy-main-integration/increasing-earned-390.png'});
  await page.reload();
  await expect(page.locator('.vizy-playtime-chip')).toContainText('0:20');
  await expect(page.locator('#iqNext')).toBeVisible();
  await page.locator('.vizy-playtime-chip a').click();
  await expect(page).toHaveURL(/play\.html/);
  await expect(page.locator('#exit-game')).toBeVisible();
  await expect(page.locator('#exit-game')).toHaveAttribute('href', /problem-map\.html\?lesson=increasing/);
  await page.screenshot({path:'qa/vizy-main-integration/glide-return-390.png'});
  await page.locator('#exit-game').click();
  await expect(page).toHaveURL(/problem-map\.html\?lesson=increasing/);
  await expect(page.locator('#iqPrompt')).toHaveAttribute('data-iq-phase','contrast');
  await expect(page.locator('#iqNext')).toBeVisible();
});

test('one home leads to the other modules through tools and keeps the photo route', async ({page}) => {
  await page.setViewportSize({width:390,height:844});
  await page.goto('/learn.html');
  await expect(page.locator('#student-start-ability')).toBeVisible();
  await expect(page.locator('#vizy-unified-nav a')).toHaveCount(3);
  await page.locator('[data-home-grade="9"]').click();
  await expect(page.locator('#student-start-ability')).toHaveAttribute('href','problem-map.html?lesson=difference-squares');
  await page.locator('#vizy-unified-nav [data-nav="tools"]').click();
  await expect(page.locator('#vizy-tools-drawer')).toHaveAttribute('open','');
  await page.screenshot({path:'qa/vizy-main-integration/home-tools-390.png'});
  await page.locator('#vizy-open-bank').click();
  await expect(page.locator('#challenges')).toBeVisible();
  await expect(page.locator('#bank-cards .activity-card').first()).toBeVisible();
  await page.locator('#vizy-unified-nav [data-nav="requests"]').click();
  await expect(page).toHaveURL(/learn\.html#requests/);
  await expect(page.locator('#request-image')).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth-innerWidth)).toBeLessThanOrEqual(4);
});

test('a manipulated game return cannot redirect outside Vizy', async ({page}) => {
  await page.goto('/play.html?return=https%3A%2F%2Fexample.com%2F');
  await expect(page.locator('#exit-game')).toBeVisible();
  await expect(page.locator('#exit-game')).toHaveAttribute('href','learn.html');
});

test('difference of squares earns for a justified step and returns with progress intact', async ({page}) => {
  await page.goto('/problem-map.html?lesson=difference-squares');
  await page.evaluate(() => {
    localStorage.removeItem('vizy_inquiry_v1_map');
    localStorage.removeItem('vizy_playtime_v1');
  });
  await page.reload();
  await expect(page.locator('#iqEntryOverlay')).toBeVisible();
  await answer(page, 'sum');
  // The first-decision overlay intentionally hides the playtime chip.
  expect(await page.evaluate(() => window.VizyPlaytime?.getSeconds())).toBe(0);
  await answer(page, 'diff');
  await next(page);
  await answer(page, 'two');
  await expect(page.locator('.vizy-playtime-chip')).toContainText('0:20');
  await page.screenshot({path:'qa/vizy-main-integration/difference-earned-390.png'});
  await next(page);
  await expect(page.locator('#iqPrompt')).toHaveAttribute('data-iq-phase', 'partA');
  await page.reload();
  await expect(page.locator('.vizy-playtime-chip')).toContainText('0:20');
  await expect(page.locator('#iqPrompt')).toHaveAttribute('data-iq-phase', 'partA');
  await page.locator('.vizy-playtime-chip a').click();
  await expect(page.locator('#exit-game')).toHaveAttribute('href', /lesson=difference-squares/);
  await page.locator('#exit-game').click();
  await expect(page.locator('#iqPrompt')).toHaveAttribute('data-iq-phase', 'partA');
});

test('finishing the map transfers evidence and grants the one-time activity reward', async ({page}) => {
  await page.goto('/problem-map.html?lesson=difference-squares');
  await page.evaluate(() => {
    localStorage.removeItem('vizy_inquiry_v1_map');
    localStorage.removeItem('vizy_playtime_v1');
  });
  await page.reload();
  await answer(page,'diff'); await next(page);
  await answer(page,'two'); await next(page);
  await answer(page,'whole'); await next(page);
  await answer(page,'-3'); await next(page);
  await answer(page,'identity'); await next(page);
  await page.locator('[data-iq-chip=A]').click();
  await page.locator('[data-iq-chip=B]').click();
  await answer(page,'return'); await next(page);
  await page.locator('[data-iq-factor="left-x+4"]').click();
  await page.locator('[data-iq-factor="right-x−2"]').click();
  await answer(page,'tidy'); await next(page);
  await answer(page,'check'); await next(page);
  await answer(page,'a');
  await answer(page,'correct'); await next(page);
  await expect(page.locator('#iqPrompt')).toHaveAttribute('data-iq-phase','done');
  const bank=await page.evaluate(()=>JSON.parse(localStorage.getItem('vizy_playtime_v1')||'{}'));
  expect(bank.earned['activity:difference-squares:complete']).toBe(true);
  expect(bank.seconds).toBe(180);
  await page.reload();
  await expect(page.locator('#iqPrompt')).toHaveAttribute('data-iq-phase','done');
  const again=await page.evaluate(()=>JSON.parse(localStorage.getItem('vizy_playtime_v1')||'{}'));
  expect(again.seconds).toBe(180);
  expect(again.earned['activity:difference-squares:complete']).toBe(true);
});
