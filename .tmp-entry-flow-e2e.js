const { spawn } = require('child_process');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function resolvePlaywrightChromium() {
    try {
        let mod = require('playwright');
        if (mod && mod.chromium) return mod.chromium;
    } catch (err) {
        // Try npx cache fallback.
    }

    let npxRoot = path.join(process.env.LOCALAPPDATA || '', 'npm-cache', '_npx');
    if (!fs.existsSync(npxRoot)) throw new Error('Playwright module not found (no npx cache path).');
    let dirs = fs.readdirSync(npxRoot, { withFileTypes: true })
        .filter((ent) => ent.isDirectory())
        .map((ent) => path.join(npxRoot, ent.name))
        .sort((a, b) => {
            try {
                return fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs;
            } catch (err) {
                return 0;
            }
        });
    for (let dir of dirs) {
        let candidate = path.join(dir, 'node_modules', 'playwright');
        if (!fs.existsSync(path.join(candidate, 'package.json'))) continue;
        let mod = require(candidate);
        if (mod && mod.chromium) return mod.chromium;
    }
    throw new Error('Playwright module not found in npx cache.');
}

const chromium = resolvePlaywrightChromium();

const ROOT = process.cwd();
const LOG = path.join(ROOT, '.tmp-dev.log');
const TRACE = path.join(ROOT, '.tmp-e2e-trace.log');
const BASE = 'http://127.0.0.1:4173/';
const START_GUIDE_KEY = 'math_visual_start_guide_onboarding_v1';
const QUICK_TOUR_KEY = 'math_visual_quick_tour_v1';

function assert(condition, message) {
    if (!condition) throw new Error(message);
}

async function waitForServer(url, timeoutMs) {
    let start = Date.now();
    while ((Date.now() - start) < timeoutMs) {
        try {
            let res = await fetch(url, { redirect: 'manual' });
            if (res.status >= 200 && res.status < 500) return;
        } catch (err) {}
        await new Promise((r) => setTimeout(r, 250));
    }
    throw new Error('Dev server did not start in time.');
}

(async () => {
    fs.writeFileSync(TRACE, '');
    function trace(msg) {
        fs.appendFileSync(TRACE, `${new Date().toISOString()} ${msg}\n`);
    }
    const hardTimeout = setTimeout(() => {
        trace('GLOBAL_TIMEOUT');
        process.exit(2);
    }, 180000);

    if (fs.existsSync(LOG)) fs.unlinkSync(LOG);
    const out = fs.openSync(LOG, 'a');
    const dev = spawn('npm', ['run', 'dev', '--', '--host', '127.0.0.1', '--port', '4173', '--strictPort'], {
        cwd: ROOT,
        shell: true,
        stdio: ['ignore', out, out]
    });

    let failed = false;
    async function killDevProcess() {
        if (!dev || dev.killed) return;
        try {
            dev.kill();
        } catch (err) {}
        try {
            spawn('taskkill', ['/PID', String(dev.pid), '/T', '/F'], { shell: true, stdio: 'ignore' });
        } catch (err) {}
    }

    try {
        trace('WAIT_SERVER');
        await waitForServer(BASE, 25000);
        trace('SERVER_READY');

        const browser = await chromium.launch({ headless: true });
        trace('BROWSER_LAUNCHED');
        const context = await browser.newContext();
        const page = await context.newPage();
        trace('PAGE_CREATED');

        const consoleErrors = [];
        const pageErrors = [];
        page.on('console', (msg) => {
            if (msg.type() === 'error') consoleErrors.push(msg.text());
        });
        page.on('pageerror', (err) => pageErrors.push(String(err)));

        const results = [];

        trace('STEP_A_START');
        await page.goto(BASE, { waitUntil: 'domcontentloaded' });
        await page.waitForSelector('#opening-splash.is-visible', { timeout: 15000 });
        await page.waitForSelector('#start-guide-modal:not(.hidden)', { timeout: 45000 });
        results.push('A ok');
        trace('STEP_A_OK');

        trace('STEP_B_START');
        await page.locator('#start-guide-modal button', { hasText: 'כניסה לאפליקציה' }).first().click();
        await page.waitForFunction(() => {
            const modal = document.getElementById('start-guide-modal');
            return !!modal && modal.classList.contains('hidden') && document.body.classList.contains('session-started');
        }, null, { timeout: 15000 });
        const bPrestartRemoved = await page.evaluate(() => !document.body.classList.contains('prestart-only'));
        assert(bPrestartRemoved, 'B failed: prestart-only was not removed');
        results.push('B ok');
        trace('STEP_B_OK');

        trace('STEP_C_START');
        await page.reload({ waitUntil: 'domcontentloaded' });
        await page.waitForFunction(() => document.body.classList.contains('session-started'), null, { timeout: 20000 });
        const cLobbyOpen = await page.evaluate(() => !document.getElementById('start-guide-modal').classList.contains('hidden'));
        assert(!cLobbyOpen, 'C failed: lobby opened again after refresh');
        results.push('C ok');
        trace('STEP_C_OK');

        trace('STEP_D_START');
        await page.goto(`${BASE}?lobby=1&splash=0`, { waitUntil: 'domcontentloaded' });
        await page.waitForSelector('#start-guide-modal:not(.hidden)', { timeout: 15000 });
        results.push('D ok');
        trace('STEP_D_OK');

        trace('STEP_E_START');
        await page.evaluate((keys) => {
            localStorage.setItem(keys.startGuide, 'done');
            localStorage.setItem(keys.quickTour, 'done');
        }, { startGuide: START_GUIDE_KEY, quickTour: QUICK_TOUR_KEY });

        await page.goto(`${BASE}?hard=1&splash=0`, { waitUntil: 'domcontentloaded' });
        await page.waitForSelector('#start-guide-modal:not(.hidden)', { timeout: 15000 });
        const quickTourAfterHard = await page.evaluate((key) => localStorage.getItem(key), QUICK_TOUR_KEY);
        assert(quickTourAfterHard === null, `E failed: ${QUICK_TOUR_KEY} was not reset`);
        results.push('E ok');
        trace('STEP_E_OK');

        trace('STEP_DEBUG_START');
        await page.goto(`${BASE}?debug_build=1&splash=0&lobby=1`, { waitUntil: 'domcontentloaded' });
        await page.waitForSelector('#start-guide-modal:not(.hidden)', { timeout: 15000 });
        const debugInfo = await page.evaluate(() => {
            const btn = document.getElementById('opening-splash-copy-build-btn');
            const splash = (document.getElementById('opening-splash-version') || {}).innerText || '';
            const top = (document.getElementById('top-version-badge') || {}).innerText || '';
            return {
                copyVisible: !!btn && !btn.classList.contains('hidden'),
                splash,
                top,
                topParts: top.split('|').map((v) => v.trim()).filter(Boolean).length
            };
        });
        assert(debugInfo.copyVisible, 'Debug failed: copy build button is hidden while debug_build=1');
        assert(debugInfo.splash === debugInfo.top, `Debug failed: splash/top stamp mismatch (${debugInfo.splash} vs ${debugInfo.top})`);
        assert(debugInfo.topParts >= 4, `Debug failed: stamp does not include 4 parts (${debugInfo.top})`);
        results.push('Debug ok');
        trace('STEP_DEBUG_OK');

        trace('BROWSER_CLOSE_START');
        await browser.close();
        trace('BROWSER_CLOSE_DONE');

        if (consoleErrors.length || pageErrors.length) {
            console.log('--- Console Errors ---');
            for (let err of consoleErrors) console.log(err);
            console.log('--- Page Errors ---');
            let uniquePageErrors = Array.from(new Set(pageErrors));
            for (let err of uniquePageErrors.slice(0, 12)) console.log(err);
            throw new Error(`Runtime errors detected: console=${consoleErrors.length}, page=${pageErrors.length}`);
        }

        console.log(results.join('\n'));
        trace('DONE_OK');
    } catch (err) {
        failed = true;
        trace(`FAILED ${err && err.message ? err.message : String(err)}`);
        console.error(err && err.stack ? err.stack : String(err));
        if (fs.existsSync(LOG)) {
            console.error('--- Dev Log ---');
            console.error(fs.readFileSync(LOG, 'utf8'));
        }
        process.exitCode = 1;
    } finally {
        clearTimeout(hardTimeout);
        await killDevProcess();
        try {
            execSync('taskkill /F /IM chrome-headless-shell.exe /T >NUL 2>&1');
        } catch (err) {}
        try {
            execSync('taskkill /F /IM chrome.exe /T >NUL 2>&1');
        } catch (err) {}
        fs.closeSync(out);
        if (!failed && fs.existsSync(LOG)) fs.unlinkSync(LOG);
        trace('FINALLY_DONE');
    }
})();
