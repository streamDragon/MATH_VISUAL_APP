import {test,expect} from '@playwright/test';
test('mobile challenges shortcut scrolls without re-creating the home screen',async({page})=>{
 await page.setViewportSize({width:375,height:812});
 await page.goto('/learn.html');
 const before=await page.locator('#bank-cards').count();
 expect(before).toBe(1);
 await page.locator('[data-scroll-challenges]').click();
 await expect(page.locator('#challenges')).toBeVisible();
 await expect.poll(()=>page.evaluate(()=>window.scrollY)).toBeGreaterThan(20);
 await expect(page.locator('.unified-tool')).toHaveCount(4);
 await expect(page.locator('#bank-cards')).toHaveCount(1);
});
test('mobile skill and guided pages share a usable bottom dock',async({page})=>{
 await page.setViewportSize({width:360,height:740});
 await page.goto('/skill-lab.html');
 const dock=page.locator('.vizy-mobile-dock');
 await expect(dock).toBeVisible();
 await expect(dock.locator('a')).toHaveCount(4);
 await dock.getByRole('link',{name:'תרגול'}).click();
 await expect(page).toHaveURL(/classroom-practice.html/);
 await expect(page.locator('.vizy-mobile-dock')).toBeVisible();
 await page.locator('.vizy-mobile-dock').getByRole('link',{name:'בית'}).click();
 await expect(page).toHaveURL(/learn.html/);
});
test('graph and skill routes are reached from a common mobile hub',async({page})=>{
 await page.setViewportSize({width:390,height:844});
 await page.goto('/learn.html');
 await page.locator('.unified-tool[href="/skill-lab.html"]').click();
 await expect(page).toHaveURL(/skill-lab.html/);
 await page.locator('.brand').click();
 await expect(page).toHaveURL(/learn.html/);
 await page.locator('.unified-tool[href*="workspace=1"]').click();
 await expect(page).toHaveURL(/workspace=1/);
 await expect(page.locator('#graph-area-wrapper')).toBeAttached();
});
