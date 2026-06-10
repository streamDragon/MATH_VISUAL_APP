/* Temporary verification driver for the book question bank feature. */
import { chromium } from '@playwright/test';
import fs from 'node:fs';

const BASE = process.env.VERIFY_URL || 'http://localhost:5173/';
const SHOTS = 'verify-shots';
fs.mkdirSync(SHOTS, { recursive: true });

const log = (...a) => console.log('[verify]', ...a);

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1380, height: 900 } });
page.on('pageerror', (err) => console.log('[pageerror]', String(err).slice(0, 300)));
const consoleErrors = [];
page.on('console', (msg) => {
  if (msg.type() === 'error') consoleErrors.push(msg.text().slice(0, 200));
});

await page.goto(BASE, { waitUntil: 'domcontentloaded' });
await page.waitForFunction(() => Array.isArray(window.QUESTIONS) || typeof QUESTIONS !== 'undefined', null, { timeout: 30000 });
const bookLoaded = await page.waitForFunction(
  () => typeof BOOK_QUESTIONS !== 'undefined' && BOOK_QUESTIONS.length > 0,
  null, { timeout: 30000 }
).then(() => true).catch(() => false);
log('BOOK_QUESTIONS loaded:', bookLoaded);
if (!bookLoaded) { console.log('FAIL: book-questions.js not loaded'); process.exit(1); }

// Give splash/onboarding a moment, capture initial state.
await page.waitForTimeout(6000);
// Answer the age gate like a real 13+ user.
const ageGateBtn = page.locator('#btn-age-gate-eligible');
if (await ageGateBtn.isVisible().catch(() => false)) {
  log('answering age gate: 13+');
  await ageGateBtn.click();
  await page.waitForTimeout(800);
}
// Enter the app from the splash ("כניסה לאפליקציה עכשיו").
try {
  await page.waitForSelector('#btn-splash-enter-app', { state: 'visible', timeout: 15000 });
  log('entering app from splash');
  await page.locator('#btn-splash-enter-app').click();
  await page.waitForFunction(
    () => !document.getElementById('opening-splash')?.classList.contains('is-visible'),
    null, { timeout: 10000 }
  );
  await page.waitForTimeout(1500);
} catch (err) {
  log('splash not dismissed:', String(err).slice(0, 120));
}
await page.screenshot({ path: `${SHOTS}/01-initial.png` });

// Entry-point visibility at first load (pre-start).
const topBtnVisible = await page.locator('#btn-book-bank').isVisible().catch(() => false);
const sideBtnVisible = await page.locator('#btn-side-book').isVisible().catch(() => false);
log('entry buttons visible pre-start: top=', topBtnVisible, 'side=', sideBtnVisible);

// Open via real click: prefer the home path card, then top/side buttons.
let openedVia = '';
const homeCard = page.locator('.home-path-card', { hasText: 'שאלות מהספר' });
if (await homeCard.isVisible().catch(() => false)) {
  await homeCard.click();
  openedVia = 'home path card click';
} else if (topBtnVisible) {
  await page.locator('#btn-book-bank').click();
  openedVia = 'top button click';
} else if (sideBtnVisible) {
  await page.locator('#btn-side-book').click();
  openedVia = 'side button click';
} else {
  await page.evaluate(() => openBookModal());
  openedVia = 'openBookModal() call (no visible button pre-start)';
}
log('opened via:', openedVia);
await page.waitForSelector('#book-modal:not(.hidden)', { timeout: 10000 });
const cardCount = await page.locator('.book-q-card').count();
log('book question cards:', cardCount);
await page.screenshot({ path: `${SHOTS}/02-book-list.png` });

// Open first question reader.
await page.locator('.book-q-card').first().click();
await page.waitForSelector('#book-reader-view:not(.hidden)', { timeout: 5000 });
const anchorCount = await page.locator('.book-anchor').count();
const readerTitle = await page.locator('#book-reader-title').innerText();
log('reader title:', readerTitle, '| anchors rendered:', anchorCount);
await page.screenshot({ path: `${SHOTS}/03-reader.png` });

// Tap the "extremum at x=2" anchor (find_param + slope_at_x_equals goal).
await page.locator('.book-anchor[data-anchor-id="q1_extremum"]').click();
await page.waitForSelector('#book-anchor-panel:not(.hidden)', { timeout: 5000 });
const explain = await page.locator('#book-anchor-panel-explain').innerText();
log('anchor explain:', explain.slice(0, 60), '...');
await page.screenshot({ path: `${SHOTS}/04-anchor-panel.png` });

// Launch the micro-interaction.
await page.locator('#btn-book-anchor-launch').click();
await page.waitForFunction(() => document.getElementById('book-modal').classList.contains('hidden'), null, { timeout: 5000 });
await page.waitForTimeout(1500);
const state1 = await page.evaluate(() => ({
  questionsLen: QUESTIONS.length,
  currentTitle: document.getElementById('q-title')?.innerText || '',
  fabVisible: !document.getElementById('book-return-fab')?.classList.contains('hidden'),
  params: { a: params.a, b: params.b, c: params.c, d: params.d },
  inpBDisabled: document.getElementById('inpB')?.disabled,
  inpADisabled: document.getElementById('inpA')?.disabled,
}));
log('after launch:', JSON.stringify(state1));
await page.screenshot({ path: `${SHOTS}/05-micro-interaction.png` });

// Solve it: set b (coefficient of x^2) to 3 => extremum lands at x=2.
await page.evaluate(() => {
  let inp = document.getElementById('inpB');
  inp.value = '3';
  inp.dispatchEvent(new Event('input', { bubbles: true }));
  inp.dispatchEvent(new Event('change', { bubbles: true }));
});
await page.waitForTimeout(2500);
// If a step-result confirm button is visible, click it.
for (const id of ['btn-apply-solution', 'btn-next-step']) {
  const el = page.locator(`#${id}`);
  if (await el.isVisible().catch(() => false)) {
    log('clicking', id);
    await el.click();
    await page.waitForTimeout(800);
  }
}
const state2 = await page.evaluate(() => ({
  questionSolved: typeof questionSolved !== 'undefined' ? questionSolved : null,
  stepCompleted: typeof stepCompleted !== 'undefined' ? stepCompleted : null,
  fabDone: document.getElementById('book-return-fab')?.classList.contains('book-return-fab-done'),
  fabText: document.getElementById('book-return-fab')?.innerText,
  progress: localStorage.getItem('book_anchor_progress_v1'),
}));
log('after solving:', JSON.stringify(state2));
await page.screenshot({ path: `${SHOTS}/06-solved.png` });

// Return to the book question.
await page.locator('#book-return-fab').click();
await page.waitForSelector('#book-modal:not(.hidden)', { timeout: 5000 });
await page.waitForTimeout(500);
const state3 = await page.evaluate(() => ({
  questionsLen: QUESTIONS.length,
  readerVisible: !document.getElementById('book-reader-view')?.classList.contains('hidden'),
  anchorDone: !!document.querySelector('.book-anchor[data-anchor-id="q1_extremum"].book-anchor-done'),
  progressText: document.getElementById('book-reader-progress')?.innerText,
  fabHidden: document.getElementById('book-return-fab')?.classList.contains('hidden'),
}));
log('after return:', JSON.stringify(state3));
await page.screenshot({ path: `${SHOTS}/07-returned-with-check.png` });

// PROBE 1: backdrop click closes the modal; reopening restores reader state.
await page.mouse.click(20, 450);
await page.waitForTimeout(300);
const closedByBackdrop = await page.evaluate(() => document.getElementById('book-modal').classList.contains('hidden'));
await page.evaluate(() => openBookModal());
await page.waitForTimeout(300);
const reopenedInReader = await page.evaluate(() => !document.getElementById('book-reader-view').classList.contains('hidden'));
log('probe backdrop-close:', closedByBackdrop, '| reopen lands in reader:', reopenedInReader);

// PROBE 2: launch a second anchor while progress exists; ensure no duplicate synthetic questions pile up.
await page.locator('.book-anchor[data-anchor-id="q1_axes"]').click();
await page.waitForSelector('#book-anchor-panel:not(.hidden)', { timeout: 5000 });
await page.locator('#btn-book-anchor-launch').click();
await page.waitForTimeout(1200);
const state4 = await page.evaluate(() => ({
  questionsLen: QUESTIONS.length,
  syntheticCount: QUESTIONS.filter((q) => q.isBookAnchorMission).length,
  title: document.getElementById('q-title')?.innerText || '',
  stepsCount: typeof activeSteps !== 'undefined' ? activeSteps.length : null,
}));
log('probe second-launch:', JSON.stringify(state4));
await page.screenshot({ path: `${SHOTS}/08-second-anchor-steps.png` });

// PROBE 3: return without solving — anchor must NOT be marked done.
await page.locator('#book-return-fab').click();
await page.waitForTimeout(500);
const state5 = await page.evaluate(() => ({
  axesAnchorDone: !!document.querySelector('.book-anchor[data-anchor-id="q1_axes"].book-anchor-done'),
  questionsLen: QUESTIONS.length,
}));
log('probe return-unsolved:', JSON.stringify(state5));

log('console errors during run:', consoleErrors.length ? consoleErrors : 'none');
await browser.close();
log('DONE');
