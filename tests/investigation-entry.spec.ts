import {test,expect} from '@playwright/test';

test('opening overlay is the first readable and focusable task, no competing page elements',async({page})=>{
 await page.goto('/problem-map.html?lesson=increasing');
 await page.evaluate(()=>localStorage.removeItem('vizy_inquiry_v1_graph'));
 await page.reload();
 await expect(page.locator('#iqEntryOverlay')).toBeVisible();
 await expect(page.locator('#iqEntryOverlay')).toHaveAttribute('aria-modal','true');
 await expect(page.locator('#vizyInquiry')).toHaveAttribute('inert','');
 await expect(page.locator('#iqEntryTitle')).toBeFocused();
 await expect(page.locator('#iqEntryOverlay .iq-entry-answer')).toHaveCount(3);
 await expect(page.locator('#iqEntryOverlay .iq-entry-answer').first()).toHaveCSS('font-size',/^(1[5-9]|2[0-9])\./);
 await page.locator('#iqEntryOverlay [data-iq-answer="A"]').click();
 await expect(page.locator('#iqEntryOverlay')).toHaveCount(0);
 await expect(page.locator('#vizyInquiry')).not.toHaveAttribute('inert','');
 await expect(page.locator('#iqGivenStrip')).toBeVisible();
 await page.locator('#iqGivenStrip').click();
 await expect(page.locator('#iqEntryOverlay[data-mode=recap]')).toBeVisible();
 await page.keyboard.press('Escape');
 await expect(page.locator('#iqEntryOverlay')).toHaveCount(0);
 await expect(page.locator('#iqGivenStrip')).toBeFocused();
});
test('help on initial question does not count as an answer, and overlay remains',async({page})=>{
 await page.goto('/problem-map.html?lesson=increasing');
 await page.evaluate(()=>localStorage.removeItem('vizy_inquiry_v1_graph'));
 await page.reload();
 await page.locator('#iqEntryOverlay [data-iq-entry-help=true]').click();
 await expect(page.locator('#iqEntryOverlay')).toBeVisible();
 const state=await page.evaluate(()=>window.VizyInvestigation?.getState());
 expect(state.index).toBe(0);
 expect(state.pending).toBe(false);
 expect(state.records.choose.helped).toBe(true);
 await expect(page.locator('#iqEntryOverlay .iq-entry-feedback')).not.toBeEmpty();
 await page.locator('#iqEntryOverlay [data-iq-answer="B"]').click();
 await expect(page.locator('#iqEntryOverlay')).toHaveCount(0);
});
test('map entry is large on desktop and turns into the same persistent given strip',async({page})=>{
 await page.setViewportSize({width:1366,height:768});
 await page.goto('/problem-map.html?lesson=difference-squares');
 await page.evaluate(()=>localStorage.removeItem('vizy_inquiry_v1_map'));
 await page.reload();
 await expect(page.locator('#iqEntryOverlay .iq-entry-expression')).toBeVisible();
 await expect(page.locator('#iqEntryOverlay [data-iq-answer]')).toHaveCount(3);
 const layout=await page.evaluate(()=>{
  const box=document.querySelector('#iqEntryTitle')!.getBoundingClientRect();
  const choice=document.querySelector('#iqEntryOverlay [data-iq-answer]')!.getBoundingClientRect();
  const font=parseFloat(getComputedStyle(document.querySelector('#iqEntryTitle')!).fontSize);
  return {titleFont:font,choiceTop:choice.top,choiceBottom:choice.bottom,overflow:document.documentElement.scrollWidth-innerWidth,headerTop:box.top};
 });
 expect(layout.titleFont).toBeGreaterThanOrEqual(34);
 expect(layout.choiceTop).toBeGreaterThan(layout.headerTop);
 expect(layout.choiceBottom).toBeLessThan(770);
 expect(layout.overflow).toBeLessThanOrEqual(4);
 await page.locator('#iqEntryOverlay [data-iq-answer=diff]').click();
 await expect(page.locator('#iqEntryOverlay')).toHaveCount(0);
 await expect(page.locator('#iqGivenStrip')).toContainText('(x+1)² − 9');
 const size=await page.locator('#iqQuestion').evaluate(el=>parseFloat(getComputedStyle(el).fontSize));
 expect(size).toBeGreaterThanOrEqual(21);
});
test('completed and resumed lessons do not replay the initial entry overlay',async({page})=>{
 await page.goto('/problem-map.html?lesson=increasing');
 await page.evaluate(()=>{
  localStorage.setItem('vizy_inquiry_v1_graph',JSON.stringify({
   version:1,kind:'graph',route:['choose','criterion','contrast','verdict','criterion-end','temperature','linear','done'],
   index:1,pending:false,feedback:'',records:{choose:{attempts:1,completed:true}},
   trail:[{code:'choose',label:'בחרתי',detail:'A'}],data:{initialChoice:'A'},startedAt:Date.now()
  }));
 });
 await page.reload();
 await expect(page.locator('#iqEntryOverlay')).toHaveCount(0);
 await expect(page.locator('#iqGivenStrip')).toBeVisible();
 await expect(page.locator('#iqPrompt')).toHaveAttribute('data-iq-phase','criterion');
});
