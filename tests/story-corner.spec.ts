import {test,expect} from '@playwright/test';
// Spec rule 2a.4: three short lines, one connecting question, then into the activity.
// A story never shows the solved path of the activity's own problem.
const sizes=[320,390,412];
for(const width of sizes){
 test('story corner is a short mobile overlay at '+width,async({page})=>{
  await page.setViewportSize({width,height:720});
  const exceptions:string[]=[];
  page.on('pageerror',err=>exceptions.push(err.message));
  await page.goto('/learn.html');
  await page.locator('#vizy-tools-drawer summary').click();
  await page.locator('#vizy-tools-drawer .story-corner-trigger').click();
  const dialog=page.locator('#vizy-story-dialog');
  await expect(dialog).toBeVisible();
  await expect(dialog.locator('.story-title')).toContainText('הקומקום');
  await expect(dialog.locator('.story-scene')).toHaveCount(3);
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
  expect(overflow).toBeLessThanOrEqual(4);
  const dialogOverflow=await dialog.evaluate(e=>e.scrollWidth-e.clientWidth);
  expect(dialogOverflow).toBeLessThanOrEqual(4);
  // The activity's own problem and result are never shown in the story.
  await expect(dialog).not.toContainText('(x+1)');
  await expect(dialog).not.toContainText('(x−2)(x+4)');
  await expect(dialog.locator('#story-next')).toBeHidden();
  await dialog.locator('[data-story-choice="reduce"]').click();
  await expect(dialog.locator('#story-feedback')).toBeVisible();
  await expect(dialog.locator('#story-next a')).toHaveAttribute('href',/lesson=difference-squares/);
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  expect(exceptions).toEqual([]);
 });
}
test('a non-best answer gives feedback and opens the way on, after two tries',async({page})=>{
 await page.goto('/learn.html');
 await page.locator('#vizy-tools-drawer summary').click();
 await page.locator('#vizy-tools-drawer .story-corner-trigger').click();
 const dialog=page.locator('#vizy-story-dialog');
 await dialog.locator('[data-story-choice="expand"]').click();
 await expect(dialog.locator('#story-feedback')).toContainText('הפיזיקאי');
 await expect(dialog.locator('#story-next')).toBeHidden();
 await dialog.locator('[data-story-choice="plug"]').click();
 await expect(dialog.locator('#story-next')).toBeVisible();
});
test('home story corner does not replace app or navigate away',async({page})=>{
 await page.goto('/learn.html');
 await page.locator('#vizy-tools-drawer summary').click();
 await page.locator('#vizy-tools-drawer .story-corner-trigger').click();
 await expect(page.locator('#vizy-story-dialog')).toBeVisible();
 await expect(page).toHaveURL(/learn\.html/);
 await page.locator('#story-close').click();
 await expect(page.locator('#vizy-story-dialog')).toBeHidden();
 await expect(page.locator('.app-header')).toBeVisible();
});
test('four stories, each with three lines and one question, no account needed',async({page})=>{
 await page.goto('/learn.html');
 await page.locator('#vizy-tools-drawer summary').click();
 await page.locator('#vizy-tools-drawer .story-corner-trigger').click();
 const dialog=page.locator('#vizy-story-dialog');
 await expect(dialog.locator('.story-tab')).toHaveCount(4);
 for(const [id,best,title] of [['gauss','pairs','גאוס'],['germain','putback','ז׳רמן'],['wiles','bridge','ויילס']]){
  await dialog.locator(`[data-story-id="${id}"]`).click();
  await expect(dialog.locator('.story-title')).toContainText(title);
  await expect(dialog.locator('.story-scene')).toHaveCount(3);
  await expect(dialog.locator('.story-question h4')).toHaveCount(1);
  await dialog.locator(`[data-story-choice="${best}"]`).click();
  await expect(dialog.locator('#story-next')).toBeVisible();
 }
 await dialog.locator('.story-sources summary').click();
 await expect(dialog.locator('.story-sources a')).toHaveAttribute('target','_blank');
});
test('story overlay follows English setting',async({page})=>{
 await page.addInitScript(()=>localStorage.setItem('vizy_language',JSON.stringify('en')));
 await page.goto('/learn.html');
 await page.locator('#vizy-tools-drawer summary').click();
 await page.locator('#vizy-tools-drawer .story-corner-trigger').click();
 const dialog=page.locator('#vizy-story-dialog');
 await expect(dialog).toHaveAttribute('lang','en');
 await expect(dialog.locator('.story-title')).toContainText('kettle');
 await dialog.locator('[data-story-choice="reduce"]').click();
 await expect(dialog.locator('#story-next')).toContainText('Now in your exercise');
});
