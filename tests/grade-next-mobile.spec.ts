import {test,expect} from '@playwright/test';

// The approved unified home shows the named meaning activity, not a separate
// grade-number description or an automatic shortcut into the legacy bank.
for (const [grade,lesson,title] of [
  ['9','difference-squares','הפרש ריבועים'],
  ['11','increasing','עולה']
] as const) {
 test('grade '+grade+' resumes its actual inquiry and keeps one next action',async({page})=>{
  await page.setViewportSize({width:390,height:844});
  await page.route('**/rest/v1/rpc/learning_catalog',route=>route.fulfill({status:200,contentType:'application/json',body:'[]'}));
  await page.goto('/learn.html');
  await page.locator('[data-home-grade="'+grade+'"]').click();
  await expect(page.locator('[data-home-grade="'+grade+'"]')).toHaveAttribute('aria-pressed','true');
  await expect(page.locator('.student-next-step-content > p')).toContainText(title);
  await expect(page.locator('#student-start-ability')).toHaveAttribute('href','problem-map.html?lesson='+lesson);
  await expect(page.locator('.student-next-step .vizy-single-cta:visible')).toHaveCount(1);
  await page.reload();
  await expect(page.locator('[data-home-grade="'+grade+'"]')).toHaveAttribute('aria-pressed','true');
  await expect(page.locator('.student-next-step-content > p')).toContainText(title);
  await page.locator('#student-start-ability').click();
  await expect(page).toHaveURL(new RegExp('lesson='+lesson));
  await expect(page.locator('#vizyInquiry')).toBeVisible();
 });
}
