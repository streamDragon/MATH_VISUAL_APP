import {test,expect} from '@playwright/test';

// The optional bank now lives in the single "Tools and more" drawer.
// The previous .library-toggle is intentionally hidden after consolidation.
for (const width of [320,390,1280]) {
  test('focused home keeps one action and optional library '+width, async ({page})=>{
    await page.setViewportSize({width,height:850});
    await page.goto('/learn.html');
    await expect(page.locator('#student-start-ability')).toBeVisible();
    await expect(page.locator('.home-legacy-actions')).toBeHidden();
    await expect(page.locator('#library-content')).toBeHidden();
    await expect(page.locator('.library-toggle')).toBeHidden();

    const tools=page.locator('#vizy-unified-nav [data-nav="tools"]');
    await expect(tools).toBeVisible();
    await tools.click();
    await expect(page.locator('#vizy-tools-drawer')).toHaveAttribute('open','');
    await expect(page.locator('#vizy-open-bank')).toBeVisible();
    await page.locator('#vizy-open-bank').click();
    await expect(page.locator('#challenges')).toBeVisible();
    await expect(page.locator('#bank-cards .activity-card').first()).toBeVisible();

    await tools.click();
    await expect(page.locator('#vizy-tools-drawer')).not.toHaveAttribute('open','');
    expect(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)).toBeLessThanOrEqual(4);
  });
}
