import {test,expect} from '@playwright/test';
for(const width of [320,390,412]){
 test('one next step and one menu on phone '+width,async({page})=>{
  await page.setViewportSize({width,height:780});
  const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('/learn.html');
  await expect(page.locator('#student-start-ability')).toBeVisible();
  await expect(page.locator('.student-next-step')).toBeVisible();
  await expect(page.locator('#vizy-unified-nav a')).toHaveCount(3);
  await expect(page.locator('.bottom-nav')).toBeHidden();
  await expect(page.locator('.unified-tools')).toBeHidden();
  await expect(page.locator('.problem-map-promo')).toBeHidden();
  await expect(page.locator('.challenge-library')).toBeHidden();
  const count=await page.locator('.student-next-step .vizy-single-cta:visible').count();
  expect(count).toBe(1);
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
  expect(overflow).toBeLessThanOrEqual(4);
  await page.screenshot({path:'test-results/vizy-unified-firstscreen-'+width+'.png',fullPage:false});
  await page.locator('#vizy-unified-nav [data-nav="tools"]').click();
  await expect(page.locator('#vizy-tools-drawer')).toHaveAttribute('open','');
  await expect(page.locator('#vizy-tools-drawer a')).toHaveCount(8);
  await page.screenshot({path:'test-results/vizy-unified-home-'+width+'.png',fullPage:true});
  expect(errors).toEqual([]);
 });
}
test('grades route to one meaning lesson, practice stays secondary',async({page})=>{
 await page.goto('/learn.html');
 await page.locator('[data-home-grade="9"]').click();
 await expect(page.locator('.student-next-step-content p')).toContainText('הפרש ריבועים');
 await expect(page.locator('#student-start-ability')).toHaveAttribute('href','problem-map.html?lesson=difference-squares');
 await page.locator('[data-home-grade="11"]').click();
 await expect(page.locator('#student-start-ability')).toHaveAttribute('href','problem-map.html?lesson=increasing');
 await page.locator('#student-start-ability').click();
 await expect(page).toHaveURL(/lesson=increasing/);
 await expect(page.locator('main>.summary')).toBeHidden();
 await expect(page.locator('#vizy-unified-nav a')).toHaveCount(3);
});
test('menu links preserve photo intake and secondary modules',async({page})=>{
 await page.goto('/classroom-practice.html');
 await expect(page.locator('#vizy-unified-nav a')).toHaveCount(3);
 await expect(page.locator('.vizy-mobile-dock')).toBeHidden();
 await page.locator('#vizy-unified-nav [data-nav="requests"]').click();
 await expect(page).toHaveURL(/learn.html#requests/);
 await expect(page.locator('#request-image')).toBeVisible();
 await page.locator('#vizy-unified-nav [data-nav="tools"]').click();
 await expect(page.locator('#vizy-tools-drawer')).toBeVisible();
 await expect(page.locator('#vizy-tools-drawer')).toHaveAttribute('open','');
});
test('single parameter activity and advanced extras behind an explicit toggle',async({page})=>{
 await page.goto('/problem-map.html?lesson=parameter');
 await expect(page.locator('#coreFlow')).toBeVisible();
 await expect(page.locator('main>.summary')).toBeHidden();
 await expect(page.locator('#flowErrors')).toBeHidden();
 await page.locator('#vizy-legacy-toggle').click();
 await expect(page.locator('main>.summary')).toBeVisible();
 await page.goto('/problem-map.html?lesson=parameter#flowErrors');
 await expect(page.locator('#flowErrors')).toBeVisible();
 await expect(page.locator('#flowInteraction')).toBeHidden();
});
