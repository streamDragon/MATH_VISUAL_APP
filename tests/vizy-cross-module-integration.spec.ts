import { test, expect } from '@playwright/test';

// One home and navigation link every already-authored module. These tests
// deliberately use the visible UI, not direct JS calls or duplicate engines.
test('main Vizy home reaches skill, classroom, and graph lab and returns', async ({ page }) => {
  await page.setViewportSize({ width:390, height:844 });
  await page.route('**/rest/v1/rpc/learning_catalog', route =>
    route.fulfill({ status:200, contentType:'application/json', body:'[]' }));
  await page.goto('/learn.html');
  await expect(page.locator('#student-start-ability')).toBeVisible();
  await page.locator('#vizy-unified-nav [data-nav="tools"]').click();
  const drawer=page.locator('#vizy-tools-drawer');
  await expect(drawer).toHaveAttribute('open','');
  await drawer.getByRole('link',{name:'מעבדת מיומנויות'}).click();
  await expect(page).toHaveURL(/skill-lab\.html/);
  await expect(page.locator('#start')).toBeVisible();
  await expect(page.locator('#vizy-unified-nav a')).toHaveCount(3);
  await page.locator('#vizy-unified-nav [data-nav="home"]').click();
  await expect(page).toHaveURL(/learn\.html/);
  await page.locator('#vizy-unified-nav [data-nav="tools"]').click();
  await page.locator('#vizy-tools-drawer').getByRole('link',{name:'תרגול מודרך'}).click();
  await expect(page).toHaveURL(/classroom-practice\.html/);
  await expect(page.locator('#courseCards')).toBeVisible();
  await page.locator('#vizy-unified-nav [data-nav="home"]').click();
  await page.locator('#vizy-unified-nav [data-nav="tools"]').click();
  await page.locator('#vizy-tools-drawer').getByRole('link',{name:'מעבדת הגרפים'}).click();
  await expect(page).toHaveURL(/workspace=1/);
  await expect(page.locator('#graph-area-wrapper')).toBeAttached();
});

test('main Vizy presents one inquiry for each grade and preserves the photo route', async ({ page }) => {
  await page.setViewportSize({ width:320, height:740 });
  await page.route('**/rest/v1/rpc/learning_catalog', route =>
    route.fulfill({ status:200, contentType:'application/json', body:'[]' }));
  await page.goto('/learn.html');
  for (const [grade,lesson] of [['9','difference-squares'],['11','increasing']]) {
    await page.locator('[data-home-grade="'+grade+'"]').click();
    await expect(page.locator('#student-start-ability')).toHaveAttribute('href','problem-map.html?lesson='+lesson);
    await page.locator('#student-start-ability').click();
    await expect(page).toHaveURL(new RegExp('lesson='+lesson));
    await expect(page.locator('#vizyInquiry')).toBeVisible();
    await expect(page.locator('#vizy-unified-nav a')).toHaveCount(3);
    // During the initial decision the dialog owns focus. It deliberately
    // provides an explicit home link instead of exposing the dock underneath.
    await expect(page.locator('#iqEntryOverlay')).toBeVisible();
    await page.locator('#iqEntryOverlay').getByRole('link',{name:'חזרה לבית'}).click();
    await expect(page).toHaveURL(/learn\.html/);
  }
  await page.locator('#vizy-unified-nav [data-nav="requests"]').click();
  await expect(page).toHaveURL(/learn\.html#requests/);
  await expect(page.locator('#request-camera')).toBeVisible();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)).toBeLessThanOrEqual(4);
});
