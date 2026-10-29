import {test,expect} from '@playwright/test';

const paths=[
  {id:'g9-functions',answers:['-4','-4','2','כן','3']},
  {id:'g9-circles',answers:['10','90','50','110','70']},
  {id:'g11-fractions',answers:['3','3','8','7','אין פתרון','5']},
  {id:'g11-inequality',answers:['2','-3','-1','כן','x<-1 או x>2','x<-2 או x>3']}
];
async function noHorizontalOverflow(page:any){
  const sizes=await page.evaluate(()=>({window:window.innerWidth,scroll:document.documentElement.scrollWidth}));
  expect(sizes.scroll).toBeLessThanOrEqual(sizes.window+4);
}
for(const path of paths){
  test('classroom full flow: '+path.id,async({page})=>{
    await page.goto('/classroom-practice.html?topic='+path.id);
    await expect(page.locator('#questionHeading')).toBeVisible();
    for(let i=0;i<path.answers.length;i++){
      await expect(page.locator('#stageNumber')).toHaveText(String(i+1));
      if(i===path.answers.length-1)await expect(page.locator('#visualArea')).toBeHidden();
      if(path.answers[i].includes(' או '))await page.locator('#choiceArea button').filter({hasText:path.answers[i]}).first().click();
      else await page.locator('#answerInput').fill(path.answers[i]);
      await page.locator('#checkAnswer').click();
      await expect(page.locator('#feedback')).toContainText('נכון');
      await noHorizontalOverflow(page);
      await page.locator('#nextStep').click();
    }
    await expect(page.locator('#completion')).toBeVisible();
    await noHorizontalOverflow(page);
    await page.reload();
    await expect(page.locator('#completion')).toBeVisible();
  });
}
test('classroom resumes and exposes hints after a wrong answer',async({page})=>{
  await page.goto('/classroom-practice.html?topic=g11-fractions');
  await page.locator('#answerInput').fill('8');
  await page.locator('#checkAnswer').click();
  await page.locator('#checkAnswer').click();
  await expect(page.locator('#hintBox')).toBeVisible();
  await page.locator('#answerInput').fill('3');
  await page.locator('#checkAnswer').click();
  await page.locator('#nextStep').click();
  await page.reload();
  await expect(page.locator('#stageNumber')).toHaveText('2');
  await noHorizontalOverflow(page);
});
