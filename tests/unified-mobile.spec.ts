import {test,expect} from '@playwright/test';
test('one mobile home exposes all four learning experiences',async({page})=>{
 await page.goto('/');
 await expect(page).toHaveURL(/learn\.html/);
 // The four learning experiences are reached from one tools drawer (since 16 Nov), not four cards.
 await page.locator('#vizy-tools-drawer summary').click();
 const drawer=page.locator('#vizy-tools-drawer');
 await expect(drawer.locator('a[href*="workspace=1"]')).toBeVisible();
 await expect(drawer.locator('a[href="skill-lab.html"]')).toBeVisible();
 await expect(drawer.locator('a[href="classroom-practice.html"]')).toBeVisible();
 await expect(drawer.locator('#vizy-open-bank')).toBeVisible();
 const width=await page.evaluate(()=>({doc:document.documentElement.scrollWidth,viewport:innerWidth}));
 expect(width.doc).toBeLessThanOrEqual(width.viewport+4);
});
test('graph workspace still exists and avoids redirect loops',async({page})=>{
 await page.goto('/?workspace=1&splash=0');
 await expect(page).not.toHaveURL(/learn\.html/);
 await expect(page.locator('#graph-area-wrapper')).toBeAttached();
});
