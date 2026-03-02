const { test, expect } = require('playwright/test');

const START_GUIDE_KEY = 'math_visual_start_guide_onboarding_v1';
const QUICK_TOUR_KEY = 'math_visual_quick_tour_v1';

test('entry flow acceptance A-E + debug stamp', async ({ page }) => {
    const consoleErrors = [];
    const pageErrors = [];
    page.on('console', (msg) => {
        if (msg.type() === 'error') consoleErrors.push(msg.text());
    });
    page.on('pageerror', (err) => {
        pageErrors.push(String(err));
    });

    // A) Incognito-like fresh run: splash then auto lobby.
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('#opening-splash.is-visible', { timeout: 15000 });
    await page.waitForSelector('#start-guide-modal:not(.hidden)', { timeout: 25000 });

    // B) App entry closes lobby and starts a session.
    await page.locator('#start-guide-modal button', { hasText: 'כניסה לאפליקציה' }).first().click();
    await page.waitForFunction(() => {
        const modal = document.getElementById('start-guide-modal');
        return !!modal && modal.classList.contains('hidden') && document.body.classList.contains('session-started');
    }, null, { timeout: 15000 });
    await expect.poll(async () => page.evaluate(() => document.body.classList.contains('prestart-only'))).toBe(false);

    // C) Refresh should not auto-open lobby again.
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => document.body.classList.contains('session-started'), null, { timeout: 20000 });
    const lobbyOpenAfterRefresh = await page.evaluate(() => !document.getElementById('start-guide-modal').classList.contains('hidden'));
    expect(lobbyOpenAfterRefresh).toBe(false);

    // D) lobby=1 should always show lobby.
    await page.goto('/?lobby=1&splash=0', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('#start-guide-modal:not(.hidden)', { timeout: 15000 });

    // E) hard=1 resets flags and behaves as new user (shows lobby).
    await page.evaluate(({ startKey, quickKey }) => {
        localStorage.setItem(startKey, 'done');
        localStorage.setItem(quickKey, 'done');
    }, { startKey: START_GUIDE_KEY, quickKey: QUICK_TOUR_KEY });
    await page.goto('/?hard=1&splash=0', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('#start-guide-modal:not(.hidden)', { timeout: 15000 });
    const quickTourAfterHard = await page.evaluate((key) => localStorage.getItem(key), QUICK_TOUR_KEY);
    expect(quickTourAfterHard).toBeNull();

    // Debug stamp + copy button.
    await page.goto('/?debug_build=1&splash=0&lobby=1', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('#start-guide-modal:not(.hidden)', { timeout: 15000 });
    const debugInfo = await page.evaluate(() => {
        const btn = document.getElementById('opening-splash-copy-build-btn');
        const splash = (document.getElementById('opening-splash-version') || {}).innerText || '';
        const top = (document.getElementById('top-version-badge') || {}).innerText || '';
        return {
            copyVisible: !!btn && !btn.classList.contains('hidden'),
            splash,
            top,
            topParts: top.split('|').map((part) => part.trim()).filter(Boolean).length
        };
    });
    expect(debugInfo.copyVisible).toBe(true);
    expect(debugInfo.splash).toBe(debugInfo.top);
    expect(debugInfo.topParts).toBeGreaterThanOrEqual(4);

    expect(consoleErrors).toEqual([]);
    expect(pageErrors).toEqual([]);
});
