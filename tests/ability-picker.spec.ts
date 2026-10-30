import { test, expect } from '@playwright/test';
for (const grade of ['9', '11']) {
  test('ability choice saves and routes '+grade, async ({page}) => {
    await page.setViewportSize({width:390,height:844});
    await page.goto('/learn.html');
    await page.locator('[data-home-grade="'+grade+'"]').click();
    await expect(page.locator('.ability-button')).toHaveCount(3);
    const id=grade==='9'?'circles':'fractions';
    const choice=page.locator('[data-ability="'+id+'"]');
    await choice.click();
    await expect(choice).toHaveAttribute('aria-pressed','true');
    await page.reload();
    await expect(page.locator('[data-ability="'+id+'"]')).toHaveAttribute('aria-pressed','true');
    await page.locator('#student-start-ability').click();
    await expect(page).toHaveURL(grade==='9'?/topic=g9-circles/:/topic=g11-fractions/);
  });
}
