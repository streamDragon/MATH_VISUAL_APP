import {test,expect} from '@playwright/test';

test('opening, help, wrong criteria and reload do not mint playtime',async({page})=>{
  await page.goto('/problem-map.html?lesson=increasing');
  await page.evaluate(()=>{
    localStorage.removeItem('vizy_inquiry_v1_graph');
    localStorage.removeItem('vizy_playtime_v1');
    localStorage.removeItem('vizy_game_off_v1');
  });
  await page.reload();
  await expect(page.locator('#iqEntryOverlay')).toBeVisible();
  expect(await page.evaluate(()=>window.VizyPlaytime?.getSeconds())).toBe(0);
  await page.locator('#iqEntryOverlay [data-iq-entry-help="true"]').click();
  expect(await page.evaluate(()=>window.VizyPlaytime?.getSeconds())).toBe(0);
  await page.locator('#iqEntryOverlay [data-iq-answer="B"]').click();
  expect(await page.evaluate(()=>window.VizyPlaytime?.getSeconds())).toBe(0);
  await page.reload();
  await expect(page.locator('.vizy-playtime-chip')).toContainText('0:00');
});

test('correct evidence grants once, not again after a restored pending step',async({page})=>{
  await page.goto('/problem-map.html?lesson=increasing');
  await page.evaluate(()=>{
    localStorage.removeItem('vizy_inquiry_v1_graph');
    localStorage.removeItem('vizy_playtime_v1');
    localStorage.removeItem('vizy_game_off_v1');
  });
  await page.reload();
  await page.locator('#iqEntryOverlay [data-iq-answer="A"]').click();
  await page.locator('#iqNext').click();
  await page.locator('#vizyInquiry [data-iq-answer="direction"]').last().click();
  await page.locator('#iqNext').click();
  await expect(page.locator('.vizy-playtime-chip')).toContainText('0:00');
  await page.locator('#vizyInquiry [data-iq-answer="no"]').last().click();
  await expect(page.locator('.vizy-playtime-chip')).toContainText('0:20');
  await page.reload();
  await expect(page.locator('.vizy-playtime-chip')).toContainText('0:20');
  await page.locator('#iqNext').click();
  await expect(page.locator('.vizy-playtime-chip')).toContainText('0:20');
});
