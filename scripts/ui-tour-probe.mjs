/* ui-tour-probe.mjs — measure what inflates the quick-tour card */
import { chromium, devices } from '@playwright/test';
const phone = devices['Pixel 7'];
const browser = await chromium.launch();
const ctx = await browser.newContext({ ...phone, locale: 'he-IL', viewport: { width: 412, height: 915 } });
const page = await ctx.newPage();
await page.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(2200);
await page.evaluate(() => { confirmAgeGateEligible?.(); });
await page.waitForTimeout(400);
await page.evaluate(() => { skipToApp?.(); });
await page.waitForTimeout(1500);
await page.locator('#home-paths button').first().click();
await page.waitForTimeout(1800);

const probe = await page.evaluate(() => {
  const modal = document.getElementById('quick-tour-modal');
  const card = document.getElementById('quick-tour-card');
  if (!modal || !card) return { modal: !!modal, visible: false };
  const out = {
    modalClass: modal.className,
    cardRect: JSON.stringify(card.getBoundingClientRect()),
    cardStyleHeight: getComputedStyle(card).height,
    children: [],
  };
  for (const ch of card.children) {
    const r = ch.getBoundingClientRect();
    out.children.push(`${ch.id || ch.className}: top=${Math.round(r.top)} h=${Math.round(r.height)} display=${getComputedStyle(ch).display}`);
  }
  return out;
});
console.log(JSON.stringify(probe, null, 1));
await browser.close();
