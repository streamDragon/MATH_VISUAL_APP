import {test,expect} from '@playwright/test';
for(const [route,container] of [['/learn.html','.unified-tools'],['/skill-lab.html','#intro'],['/classroom-practice.html','#courses']]){
 test('child-friendly buddy appears unobtrusively '+route,async({page})=>{
 await page.setViewportSize({width:390,height:844});await page.goto(route);
 const buddy=page.locator('.vizy-buddy');await expect(buddy).toHaveCount(1);
 await expect(buddy).toBeVisible();await expect(page.locator(container)).toBeVisible();
 const size=await page.evaluate(()=>[innerWidth,document.documentElement.scrollWidth]);expect(size[1]).toBeLessThanOrEqual(size[0]+4);
 await buddy.getByRole('button',{name:'הסתרת ויזי'}).click();await expect(buddy).toHaveCount(0);
 await page.reload();await expect(page.locator('.vizy-buddy')).toHaveCount(0);
 });
}
test('buddy does not block practice answer and changes message',async({page})=>{
 await page.goto('/classroom-practice.html?topic=g9-functions');
 await expect(page.locator('.vizy-buddy')).toHaveCount(1);
 await page.locator('#answerInput').fill('-4');await page.locator('#checkAnswer').click();
 await expect(page.locator('#feedback')).toContainText('נכון');
 await expect(page.locator('.vizy-buddy-text')).toContainText('יפה');
});