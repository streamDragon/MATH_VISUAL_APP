import {test,expect} from '@playwright/test';

// Legacy direct shortcuts and four-button dock were intentionally consolidated
// into one three-action navigation under the approved 13-Nov specification.
test('mobile tools drawer opens the bank without a second home screen',async({page})=>{
 await page.setViewportSize({width:375,height:812});
 await page.route('**/rest/v1/rpc/learning_catalog',route=>route.fulfill({status:200,contentType:'application/json',body:'[]'}));
 await page.goto('/learn.html');
 await expect(page.locator('#bank-cards')).toHaveCount(1);
 await expect(page.locator('.unified-tools')).toBeHidden();
 await page.locator('#vizy-unified-nav [data-nav="tools"]').click();
 await expect(page.locator('#vizy-tools-drawer')).toHaveAttribute('open','');
 await page.locator('#vizy-open-bank').click();
 await expect(page.locator('#challenges')).toBeVisible();
 await expect(page.locator('#bank-cards .activity-card').first()).toBeVisible();
 await expect(page.locator('#bank-cards')).toHaveCount(1);
});

test('mobile skill and guided pages use the same three-action dock',async({page})=>{
 await page.setViewportSize({width:360,height:740});
 await page.goto('/skill-lab.html');
 await expect(page.locator('#vizy-unified-nav a')).toHaveCount(3);
 await expect(page.locator('.vizy-mobile-dock')).toBeHidden();
 await page.locator('#vizy-unified-nav [data-nav="home"]').click();
 await expect(page).toHaveURL(/learn\.html/);
 await page.locator('#vizy-unified-nav [data-nav="tools"]').click();
 await page.locator('#vizy-tools-drawer').getByRole('link',{name:'תרגול מודרך'}).click();
 await expect(page).toHaveURL(/classroom-practice\.html/);
 await expect(page.locator('#vizy-unified-nav a')).toHaveCount(3);
 await page.locator('#vizy-unified-nav [data-nav="home"]').click();
 await expect(page).toHaveURL(/learn\.html/);
});

test('graph and skill routes are reached from one optional tools drawer',async({page})=>{
 await page.setViewportSize({width:390,height:844});
 await page.goto('/learn.html');
 await page.locator('#vizy-unified-nav [data-nav="tools"]').click();
 await page.locator('#vizy-tools-drawer').getByRole('link',{name:'מעבדת מיומנויות'}).click();
 await expect(page).toHaveURL(/skill-lab\.html/);
 await page.locator('#vizy-unified-nav [data-nav="home"]').click();
 await page.locator('#vizy-unified-nav [data-nav="tools"]').click();
 await page.locator('#vizy-tools-drawer').getByRole('link',{name:'מעבדת הגרפים'}).click();
 await expect(page).toHaveURL(/workspace=1/);
 await expect(page.locator('#graph-area-wrapper')).toBeAttached({timeout:30000});
});
