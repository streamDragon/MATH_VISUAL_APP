import { test, expect } from '@playwright/test';
// Since 16 Nov the home has one main action and one tools drawer instead of four tool cards.
for (const width of [320, 375, 390, 430]) {
 test('mobile home is reachable and usable at '+width+'px', async ({ page }) => {
  await page.setViewportSize({width,height:740});
  await page.goto('/learn.html');
  await expect(page.locator('#student-start-ability')).toBeVisible();
  await expect(page.locator('#vizy-unified-nav')).toBeVisible();
  const metrics=await page.evaluate(()=>({width:innerWidth, scroll:document.documentElement.scrollWidth}));
  expect(metrics.scroll).toBeLessThanOrEqual(metrics.width+4);
  await page.locator('#vizy-tools-drawer summary').click();
  const links=page.locator('#vizy-tools-drawer .vizy-tools-links > a');
  expect(await links.count()).toBeGreaterThanOrEqual(6);
  await expect(page.locator('#vizy-tools-drawer a[href*="workspace=1"]')).toBeVisible();
  for(const link of await links.all()){
   const r=await link.boundingBox();expect(r).not.toBeNull();expect(r!.height).toBeGreaterThanOrEqual(44);
  }
 });
}
