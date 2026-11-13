import {test,expect,Page} from '@playwright/test';

const live=(process.env.VIZY_LIVE_URL||'').replace(/\/$/,'');
const address=(path:string)=>live+path;
const lesson=(name:string)=>address('/problem-map.html?lesson='+name);
async function answer(page:Page,id:string){
  const overlay=page.locator('#iqEntryOverlay[data-mode="decision"] [data-iq-answer="'+id+'"]');
  if(await overlay.isVisible())await overlay.click();
  else await page.locator('#vizyInquiry [data-iq-answer="'+id+'"]').last().click();
}
async function next(page:Page){
  await expect(page.locator('#iqNext')).toBeVisible();
  await page.locator('#iqNext').click();
}
async function setSlider(page:Page,value:number){
  await page.locator('#iqGraphSlider').evaluate((el:HTMLInputElement,val:number)=>{
    el.value=String(val);el.dispatchEvent(new Event('input',{bubbles:true}));
    el.dispatchEvent(new Event('change',{bubbles:true}));
  },value);
}
async function newLesson(page:Page,id:string){
  const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
  const res=await page.goto(lesson(id),{waitUntil:'networkidle',timeout:35000});
  expect(res?.status()).toBe(200);
  const key=id==='increasing'?'graph':'map';
  await page.evaluate(k=>{localStorage.removeItem('vizy_inquiry_v1_'+k)},key);
  await page.reload({waitUntil:'networkidle'});
  await expect(page.locator('#iqEntryOverlay')).toBeVisible();
  return errors;
}
test('wrong criterion is investigated in the actual graph stage, never marked right by slider alone',async({page})=>{
  const errors=await newLesson(page,'increasing');
  await answer(page,'B');await next(page);
  await answer(page,'height');await next(page);
  await expect(page.locator('#iqPrompt')).toHaveAttribute('data-iq-phase','shift-predict');
  await answer(page,'yes');await next(page);
  await expect(page.locator('#iqGraphSlider')).toBeVisible();
  await answer(page,'act');
  await expect(page.locator('#iqFeedback')).toContainText('להוריד');
  await expect(page.locator('#iqNext')).toHaveCount(0);
  await setSlider(page,-1.2);await answer(page,'act');await next(page);
  await expect(page.locator('#iqPrompt')).toHaveAttribute('data-iq-phase','reflect-predict');
  await answer(page,'yes');await next(page);
  await expect(page.locator('#iqReflect')).toBeVisible();
  const before=await page.locator('.iq-graph path[stroke="#cd8146"]').getAttribute('d');
  await page.locator('#iqReflect').click();
  const after=await page.locator('.iq-graph path[stroke="#cd8146"]').getAttribute('d');
  expect(after).not.toEqual(before);
  await expect(page.locator('#iqNext')).toBeVisible();
  await next(page);
  await expect(page.locator('#iqPrompt')).toHaveAttribute('data-iq-phase','point-predict');
  expect(errors).toEqual([]);
});
test('fast route reopens investigation on a false criterion',async({page})=>{
  await newLesson(page,'increasing');
  await answer(page,'A');await next(page);
  await answer(page,'direction');await next(page);
  await expect(page.locator('#iqPrompt')).toHaveAttribute('data-iq-phase','contrast');
  await answer(page,'yes');await next(page);
  await expect(page.locator('#iqPrompt')).toHaveAttribute('data-iq-phase','shift-predict');
  const snapshot=await page.evaluate(()=>window.VizyInvestigation?.getState());
  expect(snapshot.data.lane).toBe('investigate');
});
test('map opening permits a fast-path evidence choice before the first station',async({page})=>{
  await newLesson(page,'difference-squares');
  await expect(page.locator('#iqEntryTitle')).toContainText('איזה מבנה');
  await expect(page.locator('#iqEntryOverlay [data-iq-shortcut]')).toBeVisible();
  await page.locator('#iqEntryOverlay [data-iq-shortcut]').click();
  await expect(page.locator('#iqEntryOverlay')).toHaveCount(0);
  await next(page);
  await expect(page.locator('#iqPrompt')).toHaveAttribute('data-iq-phase','partA');
});
test('full map refuses incorrect B, then accepts negative root, requires real substitutions and persists',async({page})=>{
  await newLesson(page,'difference-squares');
  await answer(page,'sum');
  await expect(page.locator('#iqEntryOverlay .iq-entry-feedback')).not.toBeEmpty();
  await answer(page,'diff');await next(page);
  await answer(page,'two');await next(page);
  await answer(page,'x'); // incorrect option code may differ, should not advance
  await expect(page.locator('#iqNext')).toHaveCount(0);
  await answer(page,'whole');await next(page);
  await answer(page,'9');
  await expect(page.locator('#iqNext')).toHaveCount(0);
  await answer(page,'-3');await next(page);
  await answer(page,'identity');await next(page);
  await answer(page,'return');
  await expect(page.locator('#iqFeedback')).toContainText('אותו');
  await page.locator('[data-iq-chip=A]').click();
  await page.locator('[data-iq-chip=B]').click();
  await answer(page,'return');await next(page);
  await expect(page.locator('#iqPrompt')).toHaveAttribute('data-iq-phase','tidy');
  await page.reload({waitUntil:'networkidle'});
  await expect(page.locator('#iqPrompt')).toHaveAttribute('data-iq-phase','tidy');
  await expect(page.locator('#iqEntryOverlay')).toHaveCount(0);
});
test('opening controls remain in view on a small phone and landscape',async({page})=>{
 for(const size of [{width:320,height:568},{width:390,height:844},{width:904,height:407},{width:1366,height:768}]){
   await page.setViewportSize(size);
   const response=await page.goto(lesson('increasing'),{waitUntil:'networkidle',timeout:30000});
   expect(response?.status()).toBe(200);
   await page.evaluate(()=>localStorage.removeItem('vizy_inquiry_v1_graph'));
   await page.reload({waitUntil:'networkidle'});
   const metrics=await page.evaluate(()=>{
      const overlay=document.querySelector('#iqEntryOverlay');
      const buttons=[...document.querySelectorAll('#iqEntryOverlay [data-iq-answer]')];
      const first=buttons[0]?.getBoundingClientRect();
      return {overflow:document.documentElement.scrollWidth-innerWidth,visible:!!overlay,
        buttonY:first?.top,buttonBottom:first?.bottom,
        viewHeight:innerHeight,scrollHeight:overlay?.scrollHeight,
        clientHeight:overlay?.clientHeight,
        bodyScroll:getComputedStyle(document.body).overflow};
   });
   expect(metrics.visible).toBe(true);
   expect(metrics.overflow).toBeLessThanOrEqual(4);
   expect(metrics.buttonY).toBeGreaterThanOrEqual(0);
   expect(metrics.buttonBottom).toBeLessThanOrEqual(size.height+2);
   await page.screenshot({path:'test-results/vizy-live-audit-'+size.width+'x'+size.height+'.png'});
 }
});
