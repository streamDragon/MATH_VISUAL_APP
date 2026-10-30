import {test,expect} from '@playwright/test';
for(const width of [320,390]) {
 test('grade 9 function uses shared Vizy graph in-place at '+width,async({page})=>{
  await page.setViewportSize({width,height:760});
  await page.goto('/classroom-practice.html?topic=g9-functions');
  await expect(page.locator('#visualArea .embedded-vizy-model svg')).toBeVisible();
  await expect(page.locator('#visualArea #model-range')).toBeVisible();
  await page.locator('#model-range').fill('2');
  await expect(page.locator('#visualArea .visual-caption')).toContainText('(2, -4)');
  await page.locator('.reset-model').click();
  await expect(page.locator('#visualArea .visual-caption')).toContainText('(0, -4)');
  await page.locator('#answerInput').fill('-4');
  await page.locator('#checkAnswer').click();
  await expect(page.locator('#feedback')).toContainText('נכון');
  const metrics=await page.evaluate(()=>({screen:innerWidth,body:document.documentElement.scrollWidth}));
  expect(metrics.body).toBeLessThanOrEqual(metrics.screen+4);
 });
}
test('transfer question starts with graph hidden even when shared engine is loaded',async({page})=>{
 await page.goto('/classroom-practice.html?topic=g9-functions');
 const answers=['-4','-4','2','כן'];
 for(const value of answers){
  await page.locator('#answerInput').fill(value);
  await page.locator('#checkAnswer').click();
  await page.locator('#nextStep').click();
 }
 await expect(page.locator('#visualArea')).toBeHidden();
 await expect(page.locator('#visualToggle')).toHaveAttribute('aria-expanded','false');
});
