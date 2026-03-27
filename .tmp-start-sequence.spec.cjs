const { test } = require('@playwright/test');

test('log startup sequence states', async ({ page }) => {
  const consoleMessages = [];
  page.on('console', (msg) => consoleMessages.push(`[${msg.type()}] ${msg.text()}`));

  await page.addInitScript(() => {
    window.__SEQ_LOG__ = [];
    const logState = (label) => {
      const splash = document.getElementById('opening-splash');
      const heroContent = document.getElementById('hero-content');
      const guide = document.getElementById('start-guide-modal');
      window.__SEQ_LOG__.push({
        t: Math.round(performance.now()),
        label,
        body: document.body ? document.body.className : '',
        splashHidden: !!(splash && splash.classList.contains('hidden')),
        splashVisible: !!(splash && splash.classList.contains('is-visible')),
        heroHidden: !!(heroContent && heroContent.classList.contains('hidden')),
        guideHidden: !!(guide && guide.classList.contains('hidden')),
      });
    };
    document.addEventListener('DOMContentLoaded', () => {
      logState('domcontentloaded');
      const observer = new MutationObserver(() => logState('mutation'));
      observer.observe(document.documentElement, {
        subtree: true,
        attributes: true,
        attributeFilter: ['class', 'hidden', 'style']
      });
      setTimeout(() => logState('after_1500'), 1500);
      setTimeout(() => logState('after_3000'), 3000);
      setTimeout(() => logState('after_5000'), 5000);
    });
  });

  await page.goto('http://127.0.0.1:4173/?hard=1', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(5500);

  const seq = await page.evaluate(() => window.__SEQ_LOG__);
  console.log(JSON.stringify({ seq, consoleMessages }, null, 2));
});
