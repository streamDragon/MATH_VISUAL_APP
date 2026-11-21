import {test,expect,Page} from '@playwright/test';

// On short phones the pinned stage used to cover the question and its answers, and the capped
// stage hid the slot work inside its own scroller. Every step must arrive with its work in view.

async function openFresh(page:Page,lesson:string){
 await page.goto('/problem-map.html?lesson='+lesson);
 await page.evaluate(()=>localStorage.clear());
 await page.reload();
 await expect(page.locator('#vizyInquiry')).toBeVisible();
}
async function tap(page:Page,selector:string){
 await page.locator(selector).last().click();
 await page.waitForTimeout(250);
}
async function next(page:Page){
 await expect(page.locator('#iqNext')).toBeVisible();
 await page.locator('#iqNext').click();
}
// The whole prompt (or, after an answer, the continue button) is on screen, above the bottom bar,
// and nothing is drawn over the question or its buttons.
async function expectWorkInView(page:Page,label:string){
 await expect(page.locator('#iqEntryOverlay')).toHaveCount(0);
 await page.waitForTimeout(900);
 const report=await page.evaluate(()=>{
  const nav=document.querySelector('#vizy-unified-nav,.bottom-nav');
  const limit=innerHeight-(nav&&getComputedStyle(nav).position==='fixed'?nav.getBoundingClientRect().height:0);
  const items=[document.querySelector('#iqQuestion'),...document.querySelectorAll('#iqPrompt button')]
   .filter((el):el is HTMLElement=>Boolean(el&&(el as HTMLElement).offsetParent));
  const bad:string[]=[];
  for(const el of items){
   const r=el.getBoundingClientRect();
   const name=(el.textContent||el.id).trim().slice(0,24);
   if(r.top<0||r.bottom>limit+1){bad.push(name+' off-screen');continue;}
   const hit=document.elementFromPoint(r.left+r.width/2,r.top+Math.min(r.height/2,12));
   if(!hit||!(hit===el||el.contains(hit)))bad.push(name+' covered by '+(hit?hit.tagName+'#'+hit.id+'.'+hit.className:'nothing'));
  }
  const stage=document.querySelector('.iq-stage') as HTMLElement;
  return {bad,stageClips:stage.scrollHeight>stage.clientHeight+2};
 });
 expect(report.bad,label).toEqual([]);
 expect(report.stageClips,label+': stage hides content in its own scroller').toBe(false);
}

for(const size of [{width:390,height:664},{width:360,height:640}]){
 test(`difference of squares keeps each step in view at ${size.width}x${size.height}`,async({page})=>{
  const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
  await page.setViewportSize(size);
  await openFresh(page,'difference-squares');
  await page.locator('#iqEntryOverlay [data-iq-answer="diff"]').click();
  await expectWorkInView(page,'after entry');
  await next(page);
  for(const answer of ['two','whole','3','identity']){
   await expectWorkInView(page,'before '+answer);
   await tap(page,'#vizyInquiry [data-iq-answer="'+answer+'"]');
   await expectWorkInView(page,'after '+answer);
   await next(page);
  }
  await expectWorkInView(page,'slot step');
  await expect(page.locator('.iq-slot-row .iq-slot-sign')).toHaveCount(5);
  await expect(page.locator('.iq-slot-row .iq-slot-empty')).toHaveText(['A','B','A','B']);
  await tap(page,'[data-iq-chip=A]');
  await tap(page,'[data-iq-chip=B]');
  await tap(page,'#vizyInquiry [data-iq-answer="return"]');
  await expectWorkInView(page,'after slots');
  await expect(page.locator('#iqFeedback')).toContainText('((x+1)−3)((x+1)+3)');
  await expect(page.locator('#iqFeedback')).not.toContainText('(((');
  await next(page);
  await expectWorkInView(page,'tidy step');
  expect(errors).toEqual([]);
 });
}

test('a negative B keeps its own brackets in the substitution',async({page})=>{
 await page.setViewportSize({width:390,height:664});
 await openFresh(page,'difference-squares');
 await page.locator('#iqEntryOverlay [data-iq-answer="diff"]').click();
 await next(page);
 for(const answer of ['two','whole','-3','identity']){
  await tap(page,'#vizyInquiry [data-iq-answer="'+answer+'"]');await next(page);
 }
 await tap(page,'[data-iq-chip=A]');await tap(page,'[data-iq-chip=B]');
 await tap(page,'#vizyInquiry [data-iq-answer="return"]');
 await expect(page.locator('#iqFeedback')).toContainText('((x+1)−(−3))((x+1)+(−3))');
 await next(page);
 // A wrong simplification gets a question back, not the simplified brackets.
 await tap(page,'[data-iq-factor="left-x−2"]');await tap(page,'[data-iq-factor="right-x+4"]');
 await tap(page,'#vizyInquiry [data-iq-answer="tidy"]');
 await expect(page.locator('#iqFeedback')).toContainText('(x+1)−(−3)?');
 await expect(page.locator('#iqFeedback')).not.toContainText('x+4');
});

test('increasing: the first answer leaves its continue button in view on a short phone',async({page})=>{
 await page.setViewportSize({width:390,height:664});
 await openFresh(page,'increasing');
 await page.locator('#iqEntryOverlay [data-iq-answer="A"]').click();
 await expect(page.locator('#iqEntryOverlay')).toHaveCount(0);
 await expectWorkInView(page,'after entry');
 await next(page);
 await expectWorkInView(page,'criterion');
 await tap(page,'#vizyInquiry [data-iq-answer="direction"]');
 await expectWorkInView(page,'criterion answered');
});
