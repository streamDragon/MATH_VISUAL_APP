import {test,expect} from '@playwright/test';
const pageSizes=[320,390,412];
for(const width of pageSizes){
 test('meaning weave mobile width '+width,async({page})=>{
  await page.setViewportSize({width,height:844});
  await page.goto('/problem-map.html?lesson=increasing');
  await expect(page.locator('#flowQuestion')).toContainText('שקולים');
  await expect(page.locator('#weaveCheck')).toBeVisible();
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
  expect(overflow).toBeLessThanOrEqual(4);
  await page.locator('[data-weave-answer="0"]').click();
  await page.locator('#weaveCheck').click();
  await expect(page.locator('#flowNext')).toBeDisabled();
  await page.locator('[data-weave-answer="1"]').click();
  await page.locator('#weaveCheck').click();
  await expect(page.locator('#flowRows .flow-layer')).toHaveCount(1);
  await page.reload();
  await expect(page.locator('#flowRows .flow-layer')).toHaveCount(1);
  await page.locator('#flowNext').click();
  await expect(page.locator('#flowOptions svg')).toHaveCount(5);
  await page.screenshot({path:'test-results/meaning-weave-'+width+'.png',fullPage:true});
 });
}
test('relation sorting and transfer do not credit guesses',async({page})=>{
 await page.goto('/problem-map.html?lesson=increasing');
 await page.evaluate(()=>localStorage.removeItem('vizy_weave_v1_increasing'));
 await page.reload();
 const choose=async(indexes:number[])=>{
  for(const i of indexes)await page.locator('[data-weave-answer="'+i+'"]').click();
  await page.locator('#weaveCheck').click();
  if(await page.locator('#flowNext').count())await expect(page.locator('#flowNext')).toBeEnabled();
 };
 await choose([0,1]);await page.locator('#flowNext').click();
 await choose([0,1,2]);await page.locator('#flowNext').click();
 const answers=['equivalent','sufficient','necessary','compatible','contradiction'];
 for(const [i,answer] of answers.entries())await page.locator('[data-weave-sort="'+i+'"]').selectOption(answer);
 await page.locator('#weaveCheck').click();
 await expect(page.locator('#flowNext')).toBeEnabled();
 await page.locator('#flowNext').click();
 await choose([0,1]);
 await expect(page.locator('#flowFinish')).toContainText('העברה חדשה');
});
test('grade nine meaning route is not derivatives and original map remains',async({page})=>{
 await page.goto('/learn.html');
 await page.locator('[data-home-grade="9"]').click();
 await page.locator('#student-start-ability').click();
 await expect(page).toHaveURL(/lesson=difference-squares/);
 await expect(page.locator('#flowQuestion')).toContainText('A²−B²');
 await expect(page.locator('main>.summary')).toBeHidden();
 await expect(page.locator('[data-flow-lesson="parameter"]')).toHaveCount(0);
 await page.goto('/problem-map.html?lesson=parameter');
 await expect(page.locator('#flowPlot svg')).toBeVisible();
});
test('grade eleven homepage offers increase and slope meaning',async({page})=>{
 await page.goto('/learn.html');
 await page.locator('[data-home-grade="11"]').click();
 await expect(page.locator('#student-start-ability')).toHaveAttribute('href',/lesson=increasing/);
 await page.locator('#student-start-ability').click();
 await expect(page).toHaveURL(/lesson=increasing/);
 await expect(page.locator('#flowQuestion')).toContainText('שקולים');
});
test('photo form never claims receipt on local draft',async({page})=>{
 await page.goto('/learn.html#requests');
 await expect(page.locator('#request-image')).toHaveAttribute('type','file');
 await expect(page.locator('#request-camera')).toHaveAttribute('capture','environment');
 await page.locator('#request-text').fill('מה משמעות השאלה?');
 await page.locator('#save-draft').click();
 await expect(page.locator('#request-status')).toContainText('לא נשלחה');
 await expect(page.locator('body')).not.toContainText('24 שעות');
});

test('meaning routes load with no JavaScript exceptions',async({page})=>{
 const exceptions:string[]=[];
 page.on('pageerror',error=>exceptions.push(error.message));
 for(const lesson of ['increasing','slope-minus-four','difference-squares']){
  await page.goto('/problem-map.html?lesson='+lesson);
  await expect(page.locator('#flowQuestion')).toBeVisible();
 }
 expect(exceptions).toEqual([]);
});
