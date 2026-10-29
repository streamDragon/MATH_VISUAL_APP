import {test,expect} from '@playwright/test';
for(const grade of [9,11]){
 test('one transferable capability, complete skill flow in grade '+grade,async({page})=>{
  await page.goto('/skill-lab.html');
  await page.getByRole('button',{name:grade===9?'כיתה ט׳':'כיתה י״א'}).click();
  await page.locator('#start').click();
  for(let item=0;item<8;item++){
   const expression=await page.locator('#expression').innerText();
   const correct=await page.evaluate((exp)=>{
    const found=(window as any).VizySkillLabData.find((row:any)=>row.examples.includes(exp));
    return found&&[found.type,found.tool];
   },expression);
   expect(correct).not.toBeNull();
   await page.locator('#answers button').filter({hasText:correct[0]}).click();
   await expect(page.locator('#feedback')).toContainText('ניסיון הראשון');
   await page.locator('#next').click();
   await page.locator('#answers button').filter({hasText:correct[1]}).click();
   await expect(page.locator('#bridge')).toBeVisible();
   await page.locator('#next').click();
  }
  await expect(page.locator('#done')).toBeVisible();
  await expect(page.locator('#scores')).toContainText('4/4');
  await page.locator('#chooseGrade').click();
  await expect(page.locator('#lastResult')).toContainText('4 מתוך 4');
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(4);
 });
}
test('wrong answer and hints do not count as independent success',async({page})=>{
 await page.goto('/skill-lab.html');
 await page.locator('#start').click();
 const expression=await page.locator('#expression').innerText();
 const first=await page.evaluate(exp=>(window as any).VizySkillLabData.find((r:any)=>r.examples.includes(exp)).type,expression);
 await page.locator('#hint').click();
 await expect(page.locator('#help')).toBeVisible();
 const bad=page.locator('#answers button').filter({hasNotText:first}).first();
 await bad.click();
 await expect(page.locator('#feedback')).toContainText('עדיין לא');
 await page.locator('#answers button').filter({hasText:first}).click();
 await expect(page.locator('#feedback')).toContainText('לא נספר');
});
