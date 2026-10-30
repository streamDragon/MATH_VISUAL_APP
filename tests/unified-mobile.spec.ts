import {test,expect} from '@playwright/test';
test('one mobile home exposes all four learning experiences',async({page})=>{
 await page.goto('/');
 await expect(page).toHaveURL(/learn\.html/);
 await expect(page.locator('.unified-tool')).toHaveCount(4);
 await expect(page.locator('.unified-tool[href*="workspace=1"]')).toBeVisible();
 await expect(page.locator('.unified-tool[href="/skill-lab.html"]')).toBeVisible();
 await expect(page.locator('.unified-tool[href="/classroom-practice.html"]')).toBeVisible();
 await expect(page.locator('.unified-tool[href="#challenges"]')).toBeVisible();
 const width=await page.evaluate(()=>({doc:document.documentElement.scrollWidth,viewport:innerWidth}));
 expect(width.doc).toBeLessThanOrEqual(width.viewport+4);
});
test('graph workspace still exists and avoids redirect loops',async({page})=>{
 await page.goto('/?workspace=1&splash=0');
 await expect(page).not.toHaveURL(/learn\.html/);
 await expect(page.locator('#graph-area-wrapper')).toBeAttached();
});
