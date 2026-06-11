/* ui-splash-check.mjs — verify the splash enter button is actually tappable */
import { chromium, devices } from '@playwright/test';
import fs from 'node:fs';

const OUT = 'test-results/ui-walkthrough';
fs.mkdirSync(OUT, { recursive: true });
const phone = devices['Pixel 7'];
const browser = await chromium.launch();
const ctx = await browser.newContext({ ...phone, locale: 'he-IL', viewport: { width: 412, height: 915 } });
const page = await ctx.newPage();

await page.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(2200);
await page.evaluate(() => { if (typeof confirmAgeGateEligible === 'function') confirmAgeGateEligible(); });
await page.waitForTimeout(1000);
await page.screenshot({ path: `${OUT}/20-splash-real.png` });

const hit = await page.evaluate(() => {
  const btn = document.getElementById('btn-splash-enter-app');
  if (!btn) return { missing: true };
  const r = btn.getBoundingClientRect();
  const cx = r.left + r.width / 2;
  const cy = r.top + r.height / 2;
  const el = document.elementFromPoint(cx, cy);
  return {
    btnRect: `${Math.round(r.left)},${Math.round(r.top)} ${Math.round(r.width)}x${Math.round(r.height)}`,
    inViewport: r.top >= 0 && r.bottom <= 915,
    hitElement: el ? `${el.tagName}#${el.id || ''}.${el.className || ''}` : null,
    hitsButton: el === btn || (el && btn.contains(el)),
  };
});
console.log('SPLASH HIT TEST:', JSON.stringify(hit, null, 1));

// scroll splash to bottom to see full layout
await page.evaluate(() => {
  const splash = document.getElementById('opening-splash');
  if (splash) splash.scrollTop = splash.scrollHeight;
  window.scrollTo(0, document.body.scrollHeight);
});
await page.waitForTimeout(500);
await page.screenshot({ path: `${OUT}/21-splash-bottom.png` });

// try a real tap on the button like a student
const btn = page.locator('#btn-splash-enter-app');
try {
  await btn.click({ timeout: 5000 });
  console.log('CLICK OK');
} catch (e) {
  console.log('CLICK FAILED:', e.message.split('\n')[0]);
}
await page.waitForTimeout(1000);
await page.screenshot({ path: `${OUT}/22-after-enter-click.png` });
await browser.close();
console.log('DONE');
