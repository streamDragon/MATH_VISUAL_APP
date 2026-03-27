import { expect, test, type Locator, type Page } from '@playwright/test';

const ENTRY_PATH = '/?splash=0';
const FIRST_SCREEN_SELECTORS = [
  '#btn-age-gate-eligible',
  '#btn-splash-enter-app',
  '#btn-hero-start',
  '#home-paths-section',
  '#home-landing'
];
const POST_GATE_SELECTORS = [
  '#btn-splash-enter-app',
  '#btn-hero-start',
  '#home-paths-section',
  '#home-landing'
];

async function findVisibleLocator(page: Page, selectors: string[]): Promise<Locator | null> {
  for (const selector of selectors) {
    const locator = page.locator(selector).first();
    if (await locator.isVisible().catch(() => false)) {
      return locator;
    }
  }
  return null;
}

async function expectNoHorizontalOverflow(page: Page): Promise<void> {
  const metrics = await page.evaluate(() => {
    const doc = document.documentElement;
    const body = document.body;
    return {
      viewportWidth: window.innerWidth,
      scrollWidth: Math.max(
        doc.scrollWidth,
        body?.scrollWidth || 0,
        doc.offsetWidth,
        body?.offsetWidth || 0
      )
    };
  });

  expect(metrics.scrollWidth, `horizontal overflow detected: ${metrics.scrollWidth}px > ${metrics.viewportWidth}px`).toBeLessThanOrEqual(metrics.viewportWidth + 4);
}

test('mobile entry page renders, stays usable, and has no obvious horizontal overflow', async ({ page }) => {
  await page.goto(ENTRY_PATH, { waitUntil: 'domcontentloaded' });
  await expect(page.locator('body')).toBeVisible();
  await page.waitForLoadState('networkidle').catch(() => {});

  await expectNoHorizontalOverflow(page);

  const firstScreenTarget = await findVisibleLocator(page, FIRST_SCREEN_SELECTORS);
  expect(firstScreenTarget, 'expected a visible first-screen CTA or main interactive area').not.toBeNull();
  await expect(firstScreenTarget!).toBeVisible();

  const ageGateButton = page.locator('#btn-age-gate-eligible');
  if (await ageGateButton.isVisible().catch(() => false)) {
    await ageGateButton.click();

    await page.waitForFunction((selectors) => {
      return selectors.some((selector) => {
        const element = document.querySelector(selector) as HTMLElement | null;
        if (!element) return false;
        const style = window.getComputedStyle(element);
        const rect = element.getBoundingClientRect();
        return style.display !== 'none'
          && style.visibility !== 'hidden'
          && rect.width > 0
          && rect.height > 0;
      });
    }, POST_GATE_SELECTORS);

    await expectNoHorizontalOverflow(page);

    const postGateTarget = await findVisibleLocator(page, POST_GATE_SELECTORS);
    expect(postGateTarget, 'expected a visible post-gate CTA or main interactive area').not.toBeNull();
    await expect(postGateTarget!).toBeVisible();
  }
});
