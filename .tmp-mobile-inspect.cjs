const fs = require('fs');
const path = require('path');
const { chromium, devices } = require('playwright');

const baseURL = 'http://127.0.0.1:4173/?splash=0';
const outDir = path.join(process.cwd(), 'test-results', 'mobile-audit');

function rectInfo(element) {
  if (!element) return null;
  const rect = element.getBoundingClientRect();
  const style = window.getComputedStyle(element);
  return {
    x: Math.round(rect.x),
    y: Math.round(rect.y),
    width: Math.round(rect.width),
    height: Math.round(rect.height),
    right: Math.round(rect.right),
    bottom: Math.round(rect.bottom),
    display: style.display,
    visibility: style.visibility,
    opacity: style.opacity,
    classes: element.className || ''
  };
}

(async () => {
  fs.mkdirSync(outDir, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    ...devices['iPhone 12'],
    locale: 'he-IL',
    timezoneId: 'Asia/Jerusalem'
  });
  const page = await context.newPage();
  const consoleMessages = [];

  page.on('console', (msg) => {
    consoleMessages.push(`[${msg.type()}] ${msg.text()}`);
  });

  await page.addInitScript(() => {
    try {
      localStorage.setItem('math_visual_age_gate_v1', '13_plus');
    } catch (err) {
      // Ignore storage restrictions during audit.
    }
  });

  await page.goto(baseURL, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => typeof window.markSessionStarted === 'function' && typeof window.loadQ === 'function');

  await page.evaluate(() => {
    try {
      localStorage.setItem('math_visual_age_gate_v1', '13_plus');
    } catch (err) {
      // Ignore storage restrictions during audit.
    }
    if (typeof window.showApp === 'function') window.showApp();
    if (!window.sessionStarted && typeof window.markSessionStarted === 'function') {
      window.markSessionStarted({ preserveCurrentFunction: true });
    }
    const nextIdx = typeof window.getFirstPracticeQuestionIndex === 'function'
      ? window.getFirstPracticeQuestionIndex()
      : 0;
    if (typeof window.loadQ === 'function') {
      window.loadQ(nextIdx >= 0 ? nextIdx : 0, { autoOpenOverlay: false });
    }
    if (typeof window.closeQuestionOverlay === 'function') window.closeQuestionOverlay();
    if (typeof window.closeQuickTour === 'function') window.closeQuickTour(false);
    if (typeof window.closeStartGuideModal === 'function') {
      window.closeStartGuideModal({ skipOverlay: true, preserveMode: true });
    }
    if (typeof window.setDrawerOpen === 'function') window.setDrawerOpen(false);
    window.scrollTo(0, 0);
  });

  await page.waitForTimeout(1200);

  const closedShot = path.join(outDir, 'mobile-workspace-closed.png');
  const openShot = path.join(outDir, 'mobile-workspace-open.png');
  await page.screenshot({ path: closedShot, fullPage: true });

  const closedMetrics = await page.evaluate(() => ({
    viewport: {
      width: window.innerWidth,
      height: window.innerHeight
    },
    bodyClass: document.body.className,
    questionNav: rectInfo(document.getElementById('question-nav-bar')),
    topStrip: rectInfo(document.getElementById('top-strip')),
    sidebar: rectInfo(document.getElementById('sidebar')),
    drawerHandle: rectInfo(document.getElementById('drawer-handle')),
    streakBadge: rectInfo(document.getElementById('gam-streak')),
    pointsBadge: rectInfo(document.getElementById('gam-points')),
    topQuestionWrap: rectInfo(document.getElementById('top-question-wrap')),
    topActions: rectInfo(document.getElementById('top-actions'))
  }));

  await page.locator('#drawer-handle').click();
  await page.waitForTimeout(500);
  await page.screenshot({ path: openShot, fullPage: true });

  const openMetrics = await page.evaluate(() => ({
    bodyClass: document.body.className,
    sidebar: rectInfo(document.getElementById('sidebar')),
    drawerHandle: rectInfo(document.getElementById('drawer-handle')),
    mobileScrim: rectInfo(document.getElementById('mobile-panel-scrim')),
    activeElement: document.activeElement ? document.activeElement.id || document.activeElement.tagName : ''
  }));

  await browser.close();

  console.log(JSON.stringify({
    screenshots: {
      closed: closedShot,
      open: openShot
    },
    closedMetrics,
    openMetrics,
    consoleMessages
  }, null, 2));
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
