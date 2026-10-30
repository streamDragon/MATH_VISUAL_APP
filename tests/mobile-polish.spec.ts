import { test, expect } from '@playwright/test';
for (const width of [320, 375, 390, 430]) {
 test('mobile home is reachable and usable at '+width+'px', async ({ page }) => {
  await page.setViewportSize({width,height:740});
  await page.goto('/learn.html');
  await expect(page.locator('.unified-tool')).toHaveCount(4);
  await expect(page.locator('.unified-tool[href*="workspace=1"]')).toBeVisible();
  await expect(page.locator('.bottom-nav')).toBeVisible();
  const metrics=await page.evaluate(()=>({width:innerWidth, scroll:document.documentElement.scrollWidth, css:!!document.querySelector('link[href="mobile-polish.css"]')}));
  expect(metrics.css).toBeTruthy();
  expect(metrics.scroll).toBeLessThanOrEqual(metrics.width+4);
  const links=page.locator('.unified-tool');
  for(let i=0;i<4;i++){const r=await links.nth(i).boundingBox();expect(r).not.toBeNull();expect(r!.width).toBeGreaterThan(90);}
 });
}
