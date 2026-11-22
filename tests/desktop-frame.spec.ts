import { test, expect } from '@playwright/test';

// On a computer the app is one centred frame: the header's content lines up with the page column,
// and the navigation is a centred bar instead of a strip across the whole screen.
for (const width of [1440, 2560]) {
  test(`home is one centred frame at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/learn.html');
    const box = (selector: string) => page.locator(selector).first().evaluate(el => {
      const r = el.getBoundingClientRect();
      return { left: r.left, right: r.right, width: r.width };
    });
    const hero = await box('.student-next-step');
    const nav = await box('#vizy-unified-nav');
    const brand = await box('header.app-header .brand');
    expect(hero.width).toBeLessThanOrEqual(880);
    expect(Math.abs((hero.left + hero.right) / 2 - width / 2)).toBeLessThan(2);
    expect(nav.width).toBeLessThanOrEqual(520);
    expect(Math.abs((nav.left + nav.right) / 2 - width / 2)).toBeLessThan(2);
    // RTL: the logo sits at the right edge of the page column, not at the far edge of the screen.
    expect(Math.abs(brand.right - hero.right)).toBeLessThan(4);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
  });
}
