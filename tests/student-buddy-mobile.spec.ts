import {test,expect} from '@playwright/test';
// The purple talking "buddy" was retired on 19 Nov: the Vizy mascot never speaks and student
// screens carry no tips (agreed spec rule 2a.3). It must not come back on any student page.
for(const route of ['/learn.html','/skill-lab.html','/classroom-practice.html','/problem-map.html?lesson=increasing']){
 test('no talking buddy on '+route,async({page})=>{
  await page.setViewportSize({width:390,height:844});
  await page.goto(route);
  await page.waitForLoadState('networkidle');
  await expect(page.locator('.vizy-buddy')).toHaveCount(0);
  const size=await page.evaluate(()=>[innerWidth,document.documentElement.scrollWidth]);
  expect(size[1]).toBeLessThanOrEqual(size[0]+4);
 });
}
