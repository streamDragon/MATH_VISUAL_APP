import { test } from '@playwright/test';
import path from 'node:path';
import fs from 'node:fs';

test('capture homepage in mobile iPhone 13 project', async ({ page }) => {
  const outDir = path.join(process.cwd(), 'test-results', 'homepage-audit');
  fs.mkdirSync(outDir, { recursive: true });

  await page.goto('/?splash=0', { waitUntil: 'domcontentloaded' });
  await page.waitForLoadState('networkidle').catch(() => {});

  const ageGate = page.locator('#btn-age-gate-eligible');
  if (await ageGate.isVisible().catch(() => false)) {
    await ageGate.click();
    await page.waitForLoadState('networkidle').catch(() => {});
    await page.waitForTimeout(1200);
  }

  await page.screenshot({
    path: path.join(outDir, 'homepage-iphone13-viewport.png'),
    fullPage: false
  });

  await page.screenshot({
    path: path.join(outDir, 'homepage-iphone13-full.png'),
    fullPage: true
  });

  const metrics = await page.evaluate(() => {
    const ids = [
      'home-landing',
      'home-hero',
      'home-hero-title',
      'btn-home-back-to-hero',
      'home-paths-section',
      'question-nav-bar',
      'top-strip',
      'drawer-handle',
      'gam-streak',
      'gam-points'
    ];

    const visible = (el: Element | null) => {
      if (!el) return false;
      const style = window.getComputedStyle(el as HTMLElement);
      const rect = (el as HTMLElement).getBoundingClientRect();
      return style.display !== 'none'
        && style.visibility !== 'hidden'
        && rect.width > 0
        && rect.height > 0;
    };

    const rect = (el: Element | null) => {
      if (!el) return null;
      const r = (el as HTMLElement).getBoundingClientRect();
      return {
        x: Math.round(r.x),
        y: Math.round(r.y),
        width: Math.round(r.width),
        height: Math.round(r.height),
        right: Math.round(r.right),
        bottom: Math.round(r.bottom)
      };
    };

    return {
      viewport: { width: window.innerWidth, height: window.innerHeight },
      bodyClass: document.body.className,
      scrollWidth: document.documentElement.scrollWidth,
      scrollHeight: document.documentElement.scrollHeight,
      elements: Object.fromEntries(ids.map((id) => {
        const el = document.getElementById(id);
        return [id, {
          visible: visible(el),
          rect: rect(el),
          text: String((el as HTMLElement | null)?.innerText || '').trim().slice(0, 200)
        }];
      }))
    };
  });

  console.log(JSON.stringify(metrics, null, 2));
});
