import {test,expect} from '@playwright/test';
test('f(x)=x²-4 renders the same fixed parabola and moves only a point',async({page})=>{
 await page.setViewportSize({width:390,height:844});
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('/classroom-practice.html?topic=g9-functions');
 await expect(page.locator('#workspace')).toBeVisible();
 const graph=page.locator('.exact-classroom-graph');
 await expect(graph).toBeVisible();
 await expect(graph).toHaveAttribute('data-function','x^2-4');
 await expect(graph).toHaveAttribute('data-vertex','0,-4');
 await expect(graph.locator('#exactGraphValue')).toContainText('f(x) = -4');
 const oldPath=await graph.locator('svg path[stroke="#5fe0cc"]').getAttribute('d');
 await graph.locator('#exactGraphX').fill('2');
 await graph.locator('#exactGraphX').dispatchEvent('input');
 await expect(graph.locator('#exactGraphValue')).toContainText('f(x) = 0');
 expect(await graph.locator('svg path[stroke="#5fe0cc"]').getAttribute('d')).toBe(oldPath);
 await expect(graph.locator('.reset-model')).toHaveCount(0);
 expect(errors).toEqual([]);
});
