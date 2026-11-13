import {test,expect,Page} from '@playwright/test';

async function openFresh(page:Page,lesson:string){
 await page.goto('/problem-map.html?lesson='+lesson);
 await page.evaluate(()=>localStorage.removeItem('vizy_inquiry_v1_'+(location.search.includes('difference-squares')?'map':'graph')));
 await page.reload();
 await expect(page.locator('#vizyInquiry')).toBeVisible();
}
async function choose(page:Page,id:string){
 await page.locator('#vizyInquiry [data-iq-answer="'+id+'"]').last().click();
}
async function next(page:Page){
 await expect(page.locator('#iqNext')).toBeVisible();
 await page.locator('#iqNext').click();
}
async function slide(page:Page,value:number){
 await page.locator('#iqGraphSlider').evaluate((el:HTMLInputElement,v)=>{
  el.value=String(v);el.dispatchEvent(new Event('input',{bubbles:true}));
 },value);
}
test('diagnosis asks without leading cues and works on phone sizes',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 await openFresh(page,'increasing');
 await expect(page.locator('#iqQuestion')).toHaveText('איזו פונקציה עולה?');
 await expect(page.locator('#vizyInquiry .iq-graph')).toBeVisible();
 await expect(page.locator('[data-iq-answer]')).toHaveCount(3);
 await expect(page.locator('#iqGraphSlider')).toHaveCount(0);
 for(const width of [320,390,412]){
  await page.setViewportSize({width,height:790});
  await expect(page.locator('#iqQuestion')).toBeVisible();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)).toBeLessThanOrEqual(4);
  await page.screenshot({path:'test-results/vizy-investigation-first-'+width+'.png',fullPage:false});
 }
 await choose(page,'B');await next(page);
 await expect(page.locator('#iqQuestion')).toHaveText('מה גרם לך לבחור?');
 await choose(page,'height');await next(page);
 await expect(page.locator('#iqPrompt')).toHaveAttribute('data-iq-phase','shift-predict');
 await expect(page.locator('#iqGraphSlider')).toHaveCount(0);
 await choose(page,'no');await next(page);
 await expect(page.locator('#iqGraphSlider')).toBeVisible();
 await slide(page,-1.2);
 await choose(page,'act');await next(page);
 await expect(page.locator('#iqPrompt')).toHaveAttribute('data-iq-phase','reflect-predict');
 expect(errors).toEqual([]);
});
test('fast path demands two counterexamples and reaches picture-free transfer',async({page})=>{
 await openFresh(page,'increasing');
 await choose(page,'A');await next(page);
 await choose(page,'direction');await next(page);
 await expect(page.locator('#iqPrompt')).toHaveAttribute('data-iq-phase','contrast');
 await choose(page,'no');await next(page);
 await expect(page.locator('.iq-given')).toContainText('f עולה ממש');
 await choose(page,'depends');
 await expect(page.locator('[data-iq-example=negative]')).toBeVisible();
 await page.locator('[data-iq-example=negative]').click();
 await slide(page,1.2);
 await page.locator('[data-iq-example=positive]').click();
 await choose(page,'evidence-complete');
 await choose(page,'must');await choose(page,'impossible');await next(page);
 await expect(page.locator('#iqPrompt')).toHaveAttribute('data-iq-phase','criterion-end');
 await choose(page,'direction');await next(page);
 await expect(page.locator('.iq-no-picture')).toBeVisible();
 await choose(page,'rise-not-positive');await next(page);
 await choose(page,'rise-negative');await next(page);
 await expect(page.locator('#iqPrompt')).toHaveAttribute('data-iq-phase','done');
 await expect(page.locator('.iq-results')).toBeVisible();
 await page.reload();
 await expect(page.locator('#iqPrompt')).toHaveAttribute('data-iq-phase','done');
});
test('general-to-particular U map keeps the case on stage and accepts B = -3',async({page})=>{
 await openFresh(page,'difference-squares');
 await expect(page.locator('.iq-map-path')).toBeVisible();
 await choose(page,'diff');await next(page);
 await choose(page,'two');await next(page);
 await choose(page,'whole');await next(page);
 await choose(page,'-3');await next(page);
 await expect(page.locator('.iq-stage-note')).toContainText('−3');
 await choose(page,'identity');await next(page);
 await expect(page.locator('.iq-slot-work')).toBeVisible();
 await page.locator('[data-iq-chip=A]').click();
 await page.locator('[data-iq-chip=B]').click();
 await choose(page,'return');await next(page);
 await expect(page.locator('#iqPrompt')).toHaveAttribute('data-iq-phase','tidy');
 await page.locator('[data-iq-factor="left-x+4"]').click();
 await page.locator('[data-iq-factor="right-x−2"]').click();
 await choose(page,'tidy');await next(page);
 await expect(page.locator('.iq-check-strip')).toContainText('בדיקה אינה הוכחה');
 await choose(page,'check');await next(page);
 await expect(page.locator('#iqPrompt')).toHaveAttribute('data-iq-phase','transfer');
 await choose(page,'a');
 await choose(page,'correct');await next(page);
 await expect(page.locator('#iqPrompt')).toHaveAttribute('data-iq-phase','done');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)).toBeLessThanOrEqual(4);
});
test('unified navigation and old optional lesson both remain available',async({page})=>{
 await openFresh(page,'increasing');
 await expect(page.locator('#vizy-unified-nav a')).toHaveCount(3);
 await expect(page.locator('main>.summary')).toBeHidden();
 await expect(page.locator('#coreFlow .flow-switch')).toHaveCount(0);
 await page.goto('/problem-map.html?lesson=increasing&legacy=1');
 await expect(page.locator('#coreFlow')).toBeVisible();
 await expect(page.locator('#vizyInquiry')).toHaveCount(0);
 await expect(page.locator('#coreFlow')).toContainText('עולה');
});
