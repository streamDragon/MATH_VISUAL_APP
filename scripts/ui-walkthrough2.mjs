/* ui-walkthrough2.mjs — journey B: practice path, drag, wrong/right submit, strikes, win */
import { chromium, devices } from '@playwright/test';
import fs from 'node:fs';

const OUT = 'test-results/ui-walkthrough';
fs.mkdirSync(OUT, { recursive: true });

const phone = devices['Pixel 7'];
const browser = await chromium.launch();
const ctx = await browser.newContext({ ...phone, locale: 'he-IL', viewport: { width: 412, height: 915 } });
const page = await ctx.newPage();
page.on('pageerror', (e) => console.log('PAGEERROR:', e.message));

let shot = 9;
async function snap(name) {
  shot += 1;
  const file = `${OUT}/${String(shot).padStart(2, '0')}-${name}.png`;
  await page.screenshot({ path: file, fullPage: false });
  console.log('SNAP', file);
}

await page.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(2200);
await page.evaluate(() => { if (typeof confirmAgeGateEligible === 'function') confirmAgeGateEligible(); });
await page.waitForTimeout(400);
await page.evaluate(() => { if (typeof skipToApp === 'function') skipToApp(); });
await page.waitForTimeout(1500);

// path 02: "תן לי תרגיל קל להתחלה"
const pathBtns = page.locator('#home-paths button, #home-paths [role="button"], #home-paths a');
await pathBtns.nth(1).click();
await page.waitForTimeout(1800);
await snap('practice-entry');

// dismiss any intro modal
for (const sel of ['#btn-mission-intro-start', '#mission-intro-card button', '#initial-builder-modal button']) {
  const b = page.locator(sel).first();
  if (await b.isVisible().catch(() => false)) {
    await b.click().catch(() => {});
    await page.waitForTimeout(700);
  }
}
await snap('practice-question');

const state1 = await page.evaluate(() => {
  const vis = (id) => {
    const el = document.getElementById(id);
    if (!el) return 'missing';
    const r = el.getBoundingClientRect();
    const s = getComputedStyle(el);
    const v = r.width > 0 && r.height > 0 && s.display !== 'none' && s.visibility !== 'hidden' && !el.classList.contains('hidden');
    return v ? `visible ${Math.round(r.top)}..${Math.round(r.bottom)}` : 'hidden';
  };
  return {
    q: window.currentQ,
    goal: getCurrentQuestion()?.goal,
    guided: isGuidedEntryMode(),
    predictPhase: window.predictionGateState?.phase || null,
    dragPanel: vis('drag-submit-panel'),
    predictOverlay: vis('graph-predict-overlay'),
    mobileFocus: vis('mobile-focus-card'),
    graph: vis('graph-area'),
    drawer: vis('drawer-handle'),
    stepsPanel: vis('acc-item-steps'),
  };
});
console.log('STATE practice:', JSON.stringify(state1, null, 1));

// scroll graph into view
await page.evaluate(() => document.getElementById('graph-area')?.scrollIntoView({ block: 'center' }));
await page.waitForTimeout(600);
await snap('graph-view');

// first touch on graph = prediction (tap somewhere wrong-ish)
const graphBox = await page.locator('#graph-area').boundingBox();
if (graphBox) {
  await page.mouse.click(graphBox.x + graphBox.width * 0.25, graphBox.y + graphBox.height * 0.4);
  await page.waitForTimeout(900);
  await snap('after-graph-tap');
}

// move the glider to a WRONG spot via engine, then look for the submit button as a student would
await page.evaluate(() => {
  noteQuestionInteraction();
  if (window.p && window.JXG) {
    p.setPosition(JXG.COORDS_BY_USER, [2.0, evaluateFunctionAt(2.0)]);
    board.update();
    updateInfo();
  }
  if (window.predictionGateState?.phase === 'graph_predict') {
    predictionGateState = { phase: 'graph_solve', value: 2.0 };
    syncGraphPredictOverlay();
    syncDragSubmitPanel();
  }
});
await page.waitForTimeout(600);

const state2 = await page.evaluate(() => {
  const el = document.getElementById('drag-submit-panel');
  const r = el?.getBoundingClientRect();
  return {
    panelHidden: el?.classList.contains('hidden'),
    rect: r ? `${Math.round(r.top)}..${Math.round(r.bottom)} h=${Math.round(r.height)}` : null,
    drawerOpen: window.drawerOpen,
    inViewport: r ? r.top >= 0 && r.bottom <= 915 && r.height > 0 : false,
  };
});
console.log('STATE drag panel after move:', JSON.stringify(state2));
await snap('point-on-wrong-spot');

// click "זו תשובתי" (wrong) — strikes
const submitBtn = page.locator('#btn-drag-answer-submit');
if (await submitBtn.isVisible().catch(() => false)) {
  await submitBtn.scrollIntoViewIfNeeded().catch(() => {});
  await submitBtn.click();
  await page.waitForTimeout(900);
  await snap('wrong-1');
  await submitBtn.click();
  await page.waitForTimeout(900);
  await snap('wrong-2');
  await submitBtn.click();
  await page.waitForTimeout(900);
  await snap('wrong-3-hint');
} else {
  console.log('SUBMIT BUTTON NOT VISIBLE TO STUDENT');
  await snap('no-submit-btn');
}

// now move to the right spot and submit
await page.evaluate(() => {
  // slope_zero on the easy question: find x where f'(x)=0 by scanning
  let bestX = 0, bestAbs = 1e9;
  for (let x = -6; x <= 6; x += 0.01) {
    const m = Math.abs(getSlope(x));
    if (m < bestAbs) { bestAbs = m; bestX = x; }
  }
  p.setPosition(JXG.COORDS_BY_USER, [bestX, evaluateFunctionAt(bestX)]);
  board.update();
  updateInfo();
});
await page.waitForTimeout(500);
await snap('point-on-right-spot');
if (await submitBtn.isVisible().catch(() => false)) {
  await submitBtn.click();
  await page.waitForTimeout(1400);
  await snap('correct-win');
}

await browser.close();
console.log('DONE');
