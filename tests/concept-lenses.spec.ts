import {test,expect,Page} from '@playwright/test';
async function start(page:Page){
 await page.goto('/problem-map.html?lesson=concept-lenses');
 await expect(page.locator('#clEntryOverlay')).toBeVisible();
 await page.locator('#clEntryOverlay .cl-primary').click();
 await expect(page.locator('#clEntryOverlay')).toHaveCount(0);
}
async function discover(page:Page,claim:string,...targets:string[]){
 await page.locator('.cl-choice[data-claim="'+claim+'"]').click();
 await expect(page.locator('#clFeedback')).toContainText('סמנו');
 for(const target of targets){
  await page.locator('#clPicture [data-evidence="'+target+'"]').first().click({force:true});
 }
 await expect(page.locator('.cl-found').filter({hasText:claim==='height'?'גובה':claim==='median'?'תיכון':claim==='bisector'?'חוצה זווית':claim==='slope'?'שיפוע':claim==='point'?'על גרף':'f′'}).first()).toBeVisible();
}
test('first screen focuses one action and loads the triangle at 320, 390, 430',async({page})=>{
 for(const width of [320,390,430]){
  await page.setViewportSize({width,height:width===320?568:844});
  await page.goto('/problem-map.html?lesson=concept-lenses');
  const sheet=page.locator('#clEntryOverlay .cl-entry-sheet');
  await expect(sheet).toBeVisible();
  expect((await sheet.innerText()).trim().split(/\s+/).length).toBeLessThan(40);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)).toBe(false);
  await expect(page.locator('#clEntryOverlay .cl-primary')).toBeVisible();
  await page.screenshot({path:'qa/concept-lens/inquiry-'+width+'.png'});
 }
});
test('first miss adds a cue, second miss reveals assisted evidence',async({page})=>{
 await start(page);
 await page.locator('.cl-choice[data-claim="height"]').click();
 await expect(page.locator('#clFeedback')).not.toContainText('בדקו את');
 await page.locator('#clPicture [data-evidence="bd"]').first().click({force:true});
 await expect(page.locator('#clFeedback')).toContainText('בדקו');
 await page.locator('#clPicture [data-evidence="dc"]').first().click({force:true});
 await expect(page.locator('#clFeedback')).toContainText('גילינו יחד');
 await expect(page.locator('#clFacts')).toContainText('גובה');
 await expect(page.locator('#clActions .cl-primary')).toHaveCount(0);
});
test('paired evidence needs two targets and second discovery unlocks prediction',async({page})=>{
 await start(page);
 await page.locator('.cl-choice[data-claim="median"]').click();
 await page.locator('#clPicture [data-evidence="bd"]').first().click({force:true});
 await expect(page.locator('#clFeedback')).toContainText('ראיה אחת');
 await expect(page.locator('#clFacts')).not.toContainText('תיכון');
 await page.locator('#clPicture [data-evidence="dc"]').first().click({force:true});
 await expect(page.locator('#clFacts')).toContainText('תיכון');
 await expect(page.locator('#clActions .cl-primary')).toHaveCount(0);
 await page.locator('.cl-choice[data-claim="height"]').click();
 await page.locator('#clPicture [data-evidence="right"]').first().click({force:true});
 await expect(page.locator('#clActions .cl-primary')).toContainText('ומה עוד');
});
test('three valid descriptions, multi prediction, drag modes and lens preserve geometry',async({page})=>{
 await start(page);
 await discover(page,'height','right');
 await discover(page,'median','bd','dc');
 await discover(page,'bisector','angle-left','angle-right');
 await page.locator('#clActions .cl-primary').click();
 for(const id of ['height','median','bisector'])await page.locator('.cl-choice[data-claim="'+id+'"]').click();
 await expect(page.locator('.cl-choice[aria-pressed=true]')).toHaveCount(3);
 await expect(page.locator('#clActions')).not.toContainText('מה גילינו?');
 await page.locator('#clActions .cl-primary').click();
 await expect(page.locator('#clSlider')).toBeVisible();
 await page.locator('#clSlider').fill('1');
 await expect(page.locator('#clFacts')).toContainText('היה נכון לפני ההזזה');
 await expect(page.locator('#clFacts .cl-dim')).toHaveCount(2);
 const before=await page.evaluate(()=>window['VizyConceptLensQA'].get().current.triangle.x);
 await page.locator('#clLenses .cl-lens').last().click();
 expect(await page.evaluate(()=>window['VizyConceptLensQA'].get().current.triangle.x)).toBe(before);
 await page.locator('#clActions .cl-mode .cl-lens').last().click();
 await expect(page.locator('#clSlider')).toHaveCount(0);
 await page.locator('.cl-choice[data-claim="median"]').click();
 await page.locator('#clActions .cl-primary').click();
 await page.locator('#clSlider').fill('1');
 await expect(page.locator('#clFacts .cl-dim')).toHaveCount(2);
 await page.locator('#clSlider').fill('0');
 await expect(page.locator('#clFacts .cl-dim')).toHaveCount(0);
});
test('derivative input preserves x across lenses and equality is reachable without jump',async({page})=>{
 await start(page);
 // Reach scene 2 through student controls.
 await discover(page,'height','right');await discover(page,'median','bd','dc');
 await page.locator('#clActions .cl-primary').click();
 await page.locator('.cl-choice[data-claim="height"]').click();await page.locator('#clActions .cl-primary').click();
 await page.locator('#clSlider').fill('1');
 await page.locator('#clActions .cl-primary').click();
 await page.locator('#clActions .cl-choice').first().click();
 await page.locator('#clActions .cl-choice').first().click();
 await page.locator('#clActions .cl-primary').click();
 await expect(page.locator('#clEntryOverlay')).toBeVisible();
 await page.locator('#clEntryOverlay .cl-primary').click();
 for(const width of [320,390,430]){
  await page.setViewportSize({width,height:width===320?568:844});
  await expect(page.locator('#clPicture')).toBeVisible();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)).toBe(false);
  await page.screenshot({path:'qa/concept-lens/function-'+width+'.png'});
 }
 expect(await page.evaluate(()=>window['VizyConceptLensQA'].get().current.function.a)).toBe(2);
 expect(await page.evaluate(()=>window['VizyConceptLensQA'].truth())).not.toContain('equal');
 await discover(page,'slope','run','rise');
 await page.locator('#clLenses .cl-lens').last().click();
 await discover(page,'point','derivative');
 await page.locator('#clActions .cl-primary').click();
 await page.locator('.cl-choice[data-claim="slope"]').click();
 await page.locator('.cl-choice[data-claim="equal"]').click();
 await page.locator('#clActions .cl-primary').click();
 await expect(page.getByRole('button',{name:'מצאו מקום שבו הגבהים שווים'})).toHaveCount(0);
 const slider=page.locator('#clSlider');
 await slider.fill('0.66');
 await expect.poll(()=>page.evaluate(()=>window['VizyConceptLensQA'].truth().includes('equal'))).toBe(true);
 await slider.fill('-1.26');
 await expect.poll(()=>page.evaluate(()=>window['VizyConceptLensQA'].truth().includes('equal'))).toBe(true);
 await slider.fill('1');
 await expect.poll(()=>page.evaluate(()=>window['VizyConceptLensQA'].truth().includes('equal'))).toBe(false);
 await page.locator('#clLenses .cl-lens').first().click();
 await expect(page.locator('#clSlider')).toHaveValue('1');
 await expect(page.locator('#clPicture .cl-zero')).toHaveCount(1);
});
test('reset is an in-page confirmation with cancel',async({page})=>{
 await start(page);
 page.on('dialog',()=>{throw Error('Native JS dialogs forbidden');});
 await page.locator('.cl-reset').click();
 await expect(page.locator('#clResetDialog')).toBeVisible();
 await page.locator('#clResetDialog .cl-secondary').click();
 await expect(page.locator('#clResetDialog')).toHaveCount(0);
 await page.locator('.cl-reset').click();
 await page.locator('#clResetDialog .cl-primary').click();
 await expect(page.locator('#clEntryOverlay')).toBeVisible();
});
test('discoveries and original labels persist after reload',async({page})=>{
 await start(page);
 await discover(page,'median','bd','dc');
 const original=await page.locator('#clTrailList li').first().textContent();
 await page.reload();
 await expect(page.locator('#clEntryOverlay')).toBeVisible();
 await page.locator('#clEntryOverlay .cl-primary').click();
 await expect(page.locator('#clEntryOverlay')).toHaveCount(0);
 await expect(page.locator('#clTrailList li')).toHaveCount(1);
 await expect(page.locator('#clTrailList li').first()).toHaveText(original||'');
 await expect(page.locator('#clFacts')).toContainText('תיכון');
});
test('lens stage is registered inside the shared inquiry core',async({page})=>{
 await page.goto('/problem-map.html?lesson=concept-lenses');
 const route=await page.evaluate(()=>window['VizyInvestigationCore'].start('lens').route);
 expect(route).toEqual(['discover','predict','manipulate','reflect','done']);
 await expect(page.locator('#vizyInquiry')).toHaveAttribute('data-iq-stage','lens');
});
