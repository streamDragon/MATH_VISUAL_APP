import {test,expect} from '@playwright/test';
for(const grade of ['9','11']){
 test('one next meaning activity for grade '+grade,async({page})=>{
  await page.setViewportSize({width:390,height:844});
  await page.goto('/learn.html');
  await page.locator('[data-home-grade="'+grade+'"]').click();
  await expect(page.locator('.student-next-step .vizy-single-cta:visible')).toHaveCount(1);
  const href=grade==='9'?'lesson=difference-squares':'lesson=increasing';
  await expect(page.locator('#student-start-ability')).toHaveAttribute('href',new RegExp(href));
  await page.reload();
  await expect(page.locator('#student-start-ability')).toHaveAttribute('href',new RegExp(href));
  await page.locator('#student-start-ability').click();
  await expect(page).toHaveURL(new RegExp(href));
 });
}
