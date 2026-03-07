const { spawn, execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function resolvePlaywrightChromium() {
    try {
        let mod = require('playwright');
        if (mod && mod.chromium) return mod.chromium;
    } catch (err) {}

    let npxRoot = path.join(process.env.LOCALAPPDATA || '', 'npm-cache', '_npx');
    let dirs = fs.readdirSync(npxRoot, { withFileTypes: true })
        .filter((ent) => ent.isDirectory())
        .map((ent) => path.join(npxRoot, ent.name))
        .sort((a, b) => fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs);

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
const LOG = path.join(ROOT, '.tmp-guided-mobile-dev.log');
const BASE = 'http://127.0.0.1:4173/';

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

async function elementVisible(page, selector) {
    try {
        return await page.locator(selector).isVisible();
    } catch (err) {
        return false;
    }
}

(async () => {
    if (fs.existsSync(LOG)) fs.unlinkSync(LOG);
    const out = fs.openSync(LOG, 'a');
    const dev = spawn('npm', ['run', 'dev', '--', '--host', '127.0.0.1', '--port', '4173', '--strictPort'], {
        cwd: ROOT,
        shell: true,
        stdio: ['ignore', out, out]
    });

    async function killDevProcess() {
        if (!dev || dev.killed) return;
        try { dev.kill(); } catch (err) {}
        try { spawn('taskkill', ['/PID', String(dev.pid), '/T', '/F'], { shell: true, stdio: 'ignore' }); } catch (err) {}
    }

    try {
        await waitForServer(BASE, 25000);
        const browser = await chromium.launch({ headless: true });
        const context = await browser.newContext({
            viewport: { width: 390, height: 844 },
            isMobile: true
        });
        const page = await context.newPage();

        await page.goto(`${BASE}?layout=mobile&splash=0&hard=1`, { waitUntil: 'domcontentloaded' });
        await page.waitForLoadState('networkidle');

        let bodyClass = await page.evaluate(() => document.body.className);
        assert(bodyClass.includes('app-mode-landing') || bodyClass.includes('prestart-only'), `landing mode class missing (${bodyClass})`);
        assert(await elementVisible(page, '#home-landing'), 'landing hero not visible');
        assert(!(await elementVisible(page, '#top-strip')), 'top strip leaked into landing');
        assert(!(await elementVisible(page, '#practice-question-bar')), 'practice bar leaked into landing');
        assert(!(await elementVisible(page, '#sidebar')), 'sidebar leaked into landing');
        assert(!(await elementVisible(page, '#btn-tools-menu')), 'tools button leaked into landing');

        await page.getByRole('button', { name: 'תראה לי איך זה עובד' }).click();
        await page.locator('#start-guide-modal').waitFor({ state: 'visible', timeout: 15000 });
        assert((await page.locator('#start-guide-title').innerText()) === 'ברוך הבא — נבין קודם מה רואים כאן', 'intro title mismatch');
        assert((await page.locator('#btn-start-guide-primary').innerText()) === 'המשך', 'intro CTA mismatch');
        assert(await elementVisible(page, '#btn-start-guide-voice'), 'audio help button missing from intro');
        assert(!(await elementVisible(page, '#top-strip')), 'workspace chrome visible under intro');

        await page.locator('#btn-start-guide-primary').click();
        await page.waitForFunction(() =>
            document.body.classList.contains('app-mode-guided')
            && document.body.classList.contains('guided-step-tour')
        );
        assert(await elementVisible(page, '#quick-tour-modal'), 'guided tour did not open');
        assert(await elementVisible(page, '#guided-start-shell'), 'guided shell missing');
        assert(await elementVisible(page, '#graph-area'), 'graph not visible during guided tour');
        assert(!(await elementVisible(page, '#top-strip')), 'top strip leaked into guided mode');
        assert(!(await elementVisible(page, '#practice-question-bar')), 'practice bar leaked into guided mode');
        assert(!(await elementVisible(page, '#sidebar')), 'sidebar leaked into guided mode');
        assert(!(await elementVisible(page, '#btn-tools-menu')), 'tools menu leaked into guided mode');
        assert(!(await elementVisible(page, '#sound-toggle')), 'sound bubble leaked into guided mode');

        await page.locator('#btn-quick-tour-next').click();
        await page.locator('#btn-quick-tour-next').click();
        await page.locator('#btn-quick-tour-next').click();
        assert((await page.locator('#quick-tour-title').innerText()) === 'מה הרעיון?', 'guided idea step missing');
        assert((await page.locator('#btn-quick-tour-next').innerText()) === 'תראה לי צעד ראשון', 'guided idea CTA mismatch');
        await page.locator('#btn-quick-tour-next').click();

        await page.waitForFunction(() =>
            document.body.classList.contains('app-mode-guided')
            && document.body.classList.contains('guided-step-action')
        );
        assert(await elementVisible(page, '#guided-start-action-card'), 'guided action card missing');
        assert(!(await elementVisible(page, '#guided-shell-equations')), 'equation shell still visible during first action');

        await page.evaluate(async () => {
            let targetX = findDemoTargetXForCurrentQuestion();
            if (!Number.isFinite(targetX)) throw new Error('guided target x not found');
            noteQuestionInteraction();
            p.setPosition(JXG.COORDS_BY_USER, [targetX, evaluateFunctionAt(targetX)]);
            board.update();
            updateInfo();
            await new Promise((resolve) => setTimeout(resolve, 1400));
            updateInfo();
        });

        await page.waitForFunction(() =>
            document.body.classList.contains('app-mode-workspace')
            && !document.body.classList.contains('app-mode-guided')
        , null, { timeout: 15000 });
        assert(await elementVisible(page, '#top-strip'), 'workspace top strip not visible after guided action');
        assert(await elementVisible(page, '#practice-question-bar'), 'workspace practice bar not visible after guided action');
        assert(!(await elementVisible(page, '#guided-start-shell')), 'guided shell still visible in workspace');

        await browser.close();
        console.log('guided-mobile-check: ok');
    } catch (err) {
        console.error(err && err.stack ? err.stack : String(err));
        if (fs.existsSync(LOG)) {
            console.error('--- Dev Log ---');
            console.error(fs.readFileSync(LOG, 'utf8'));
        }
        process.exitCode = 1;
    } finally {
        await killDevProcess();
        try { execSync('taskkill /F /IM chrome-headless-shell.exe /T >NUL 2>&1'); } catch (err) {}
        try { execSync('taskkill /F /IM chrome.exe /T >NUL 2>&1'); } catch (err) {}
        fs.closeSync(out);
    }
})();
