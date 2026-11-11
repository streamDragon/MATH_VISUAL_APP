import {test,expect} from '@playwright/test';
for(const width of [320,390,1280]){
 test('focused home keeps one action and optional library '+width,async({page})=>{
  await page.setViewportSize({width,height:850});
  await page.goto('/learn.html');
  await expect(page.locator('#student-start-ability')).toBeVisible();
  await expect(page.locator('.home-legacy-actions')).toBeHidden();
  await expect(page.locator('#library-content')).toBeHidden();
  await expect(page.locator('.library-toggle')).toHaveAttribute('aria-expanded','false');
  await page.locator('.library-toggle').click();
  await expect(page.locator('#library-content')).toBeVisible();
  await expect(page.locator('.library-toggle')).toHaveAttribute('aria-expanded','true');
  await expect(page.locator('#bank-cards .activity-card').first()).toBeVisible();
  await page.locator('.library-toggle').click();
  await expect(page.locator('#library-content')).toBeHidden();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)).toBeLessThanOrEqual(4);
 });
}
