import {test, expect} from '@playwright/test';

test('the learner enters an expression, recognizes a model, chooses its formula and returns',async({page})=>{
  await page.setViewportSize({width:390,height:844});
  await page.goto('/problem-map.html?lesson=algebra-worlds');
  await page.evaluate(()=>localStorage.removeItem('vizy_algebra_worlds_v1'));
  await page.reload();
  await page.locator('[data-answer="omit-divisor"]').click();
  await expect(page.locator('.aw-feedback')).not.toBeEmpty();
  await page.locator('[data-insight]').click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.getByRole('dialog').locator('button').click();
  await page.locator('[data-answer="domain"]').click();
  for(const [index, subtype] of ['monic','monic','nonmonic','identity'].entries()){
    await page.locator('[data-open="'+index+'"]').click();
    await expect(page.locator('.aw-prompt h2')).toHaveText('לאיזה מבנה זה דומה?');
    await expect(page.locator('.aw-tools button')).toHaveCount(4);
    await expect(page.locator('.aw-prompt')).not.toContainText('מחפשים שני מספרים');
    await page.locator('[data-answer="'+(subtype==='identity'?'identity':'trinomial')+'"]').click();
    if(subtype!=='identity'){
      await expect(page.locator('.aw-prompt h2')).toHaveText('איזה טרינום?');
      if(index===2){
        await page.locator('[data-answer="monic"]').click();
        await expect(page.locator('.aw-feedback')).not.toBeEmpty();
      }
      await page.locator('[data-answer="'+subtype+'"]').click();
    }else{
      await expect(page.locator('.aw-magic-number')).toHaveText('9');
      await page.locator('.aw-magic-number').click();
      await expect(page.locator('.aw-transformed')).toContainText('3²');
    }
    await expect(page.locator('.aw-cloud')).toBeVisible();
    await page.locator('[data-answer="formula"]').click();
    await expect(page.locator('[data-answer="factor"]')).toBeVisible();
    if(index===0){
      await page.reload();
      await expect(page.locator('[data-answer="factor"]')).toBeVisible();
    }
    await page.locator('[data-answer="factor"]').click();
  }
  await page.locator('[data-answer="flip-first"]').click();
  await expect(page.locator('.aw-feedback')).not.toBeEmpty();
  await page.locator('[data-answer="flip"]').click();
  await expect(page.locator('.aw-steps')).toHaveAttribute('aria-valuenow','6');
  await page.locator('[data-answer="term"]').click();
  await expect(page.locator('.aw-feedback')).not.toBeEmpty();
  await page.locator('[data-answer="cancel"]').click();
  await expect(page.locator('.aw-steps')).toHaveAttribute('aria-valuenow','7');
  await expect(page.locator('.aw-domain')).toContainText('−3/2');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)).toBeLessThanOrEqual(4);
});

test('a reopened expression remains open after refreshing the phone browser',async({page})=>{
  await page.setViewportSize({width:320,height:568});
  await page.goto('/problem-map.html?lesson=algebra-worlds');
  await page.evaluate(()=>localStorage.removeItem('vizy_algebra_worlds_v1'));
  await page.reload();
  await page.locator('[data-answer="domain"]').click();
  await page.locator('[data-open="0"]').click();
  await page.reload();
  await expect(page.locator('.aw-tools button')).toHaveCount(4);
  await expect(page.locator('[data-open="0"]')).toHaveCount(0);
});

test('the student does not see internal evidence jargon or the retired lesson tools',async({page})=>{
  await page.setViewportSize({width:390,height:844});
  await page.goto('/problem-map.html?lesson=difference-squares');
  await page.evaluate(()=>localStorage.removeItem('vizy_inquiry_v1_map'));
  await page.reload();
  await expect(page.locator('#iqPrompt [data-iq-shortcut]')).toHaveText('כבר זיהיתי, ממשיכים');
  await expect(page.locator('#iqPrompt [data-iq-shortcut]')).not.toContainText('ראיה');
  await expect(page.locator('#vizy-legacy-toggle')).toHaveCount(0);
  await expect(page.locator('body>header>span:not([data-vizy-slot])').first()).toBeHidden();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)).toBeLessThanOrEqual(4);
});
