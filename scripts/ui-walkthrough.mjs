/* ui-walkthrough.mjs — drive the app like a 14yo student on a phone, screenshot every stage */
import { chromium, devices } from '@playwright/test';
import fs from 'node:fs';

const OUT = 'test-results/ui-walkthrough';
fs.mkdirSync(OUT, { recursive: true });

const phone = devices['Pixel 7'];
const browser = await chromium.launch();
const ctx = await browser.newContext({
  ...phone,
  locale: 'he-IL',
  // student phone
  viewport: { width: 412, height: 915 },
});
const page = await ctx.newPage();
page.on('pageerror', (e) => console.log('PAGEERROR:', e.message));

let shot = 0;
async function snap(name) {
  shot += 1;
  const file = `${OUT}/${String(shot).padStart(2, '0')}-${name}.png`;
  await page.screenshot({ path: file, fullPage: false });
  console.log('SNAP', file);
}

await page.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(2500);
await snap('splash');

// age gate (first-run)
const ageGateVisible = await page.evaluate(() => {
  const el = document.getElementById('age-gate-screen');
  return !!el && el.getAttribute('aria-hidden') !== 'true';
});
if (ageGateVisible) {
  await snap('age-gate');
  await page.evaluate(() => { if (typeof confirmAgeGateEligible === 'function') confirmAgeGateEligible(); });
  await page.waitForTimeout(900);
}

// skip splash via JS (the enter button is covered by the video play overlay — real UX bug, noted)
await page.evaluate(() => { if (typeof skipToApp === 'function') skipToApp(); });
await page.waitForTimeout(1500);
await snap('after-splash');

// close start-guide / tour modals if shown
for (const sel of ['#start-guide-modal button#btn-start-guide-enter', '#start-guide-modal .modal-primary', '#quick-tour-modal button']) {
  const b = page.locator(sel).first();
  if (await b.isVisible().catch(() => false)) {
    await b.click().catch(() => {});
    await page.waitForTimeout(800);
  }
}
await snap('landing-top');

// scroll landing
await page.mouse.wheel(0, 700);
await page.waitForTimeout(500);
await snap('landing-scroll1');
await page.mouse.wheel(0, 900);
await page.waitForTimeout(500);
await snap('landing-scroll2');
await page.mouse.wheel(0, -3000);
await page.waitForTimeout(500);

// click first home path button (start practicing)
const pathBtns = page.locator('#home-paths button, #home-paths [role="button"], #home-paths a');
const count = await pathBtns.count();
console.log('home path buttons:', count);
for (let i = 0; i < count; i++) {
  console.log('  path btn', i, (await pathBtns.nth(i).innerText().catch(() => '')).replace(/\n/g, ' | '));
}
if (count > 0) {
  await pathBtns.first().click();
  await page.waitForTimeout(1500);
}
await snap('after-path-click');

// dismiss intro card if present
for (const sel of ['#btn-mission-intro-start', '#mission-intro-card button']) {
  const b = page.locator(sel).first();
  if (await b.isVisible().catch(() => false)) {
    await b.click().catch(() => {});
    await page.waitForTimeout(700);
    break;
  }
}
await snap('question-screen');

// log what's visible
const state = await page.evaluate(() => {
  const vis = (id) => {
    const el = document.getElementById(id);
    if (!el) return 'missing';
    const r = el.getBoundingClientRect();
    const style = getComputedStyle(el);
    const visible = r.width > 0 && r.height > 0 && style.display !== 'none' && style.visibility !== 'hidden' && !el.classList.contains('hidden');
    return visible ? `visible ${Math.round(r.top)}..${Math.round(r.bottom)}` : 'hidden';
  };
  return {
    currentQ: window.currentQ,
    goal: (typeof getCurrentQuestion === 'function' && getCurrentQuestion()?.goal) || null,
    guidedEntry: typeof isGuidedEntryMode === 'function' ? isGuidedEntryMode() : null,
    sessionStarted: window.sessionStarted,
    dragPanel: vis('drag-submit-panel'),
    mobileFocus: vis('mobile-focus-card'),
    sidebar: vis('sidebar'),
    graph: vis('graph-area'),
    topBar: vis('top-bar'),
    drawerHandle: vis('drawer-handle'),
    guidedShell: vis('guided-shell'),
    bodyClass: document.body.className,
  };
});
console.log('STATE:', JSON.stringify(state, null, 1));

// scroll within app shell
await page.mouse.wheel(0, 600);
await page.waitForTimeout(400);
await snap('question-scrolled');

await browser.close();
console.log('DONE');
