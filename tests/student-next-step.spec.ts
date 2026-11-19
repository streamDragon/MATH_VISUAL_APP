import {test,expect} from '@playwright/test';
// The home has one clear next step and the Vizy mascot beside it (the older "buddy" figure was
// replaced on 16 Nov). Optional work lives in one tools drawer.
for(const width of [320,390]) test('mobile one clear next step '+width,async({page})=>{
 await page.setViewportSize({width,height:760});
 await page.goto('/learn.html');
 await expect(page.locator('#student-start-ability')).toBeVisible();
 await expect(page.locator('.vizy-single-cta')).toHaveCount(1);
 await expect(page.locator('.vizy-home-avatar')).toHaveCount(1);
 await page.locator('#vizy-tools-drawer summary').click();
 await expect(page.locator('#vizy-tools-drawer')).toHaveAttribute('open','');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)).toBeLessThanOrEqual(4);
});
