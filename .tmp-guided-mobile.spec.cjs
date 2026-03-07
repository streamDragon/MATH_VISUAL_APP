const { test, expect } = require('@playwright/test');

test.use({
    viewport: { width: 390, height: 844 }
});

test('mobile guided entry stays isolated until first action completes', async ({ page }) => {
    await page.goto('/?layout=mobile&splash=0&hard=1', { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle');

    await expect(page.locator('body')).toHaveClass(/app-mode-landing/);
    await expect(page.locator('#home-landing')).toBeVisible();
    await expect(page.locator('#top-strip')).toBeHidden();
    await expect(page.locator('#practice-question-bar')).toBeHidden();
    await expect(page.locator('#sidebar')).toBeHidden();
    await expect(page.locator('#btn-tools-menu')).toBeHidden();

    await page.getByRole('button', { name: 'תראה לי איך זה עובד' }).click();

    await expect(page.locator('#start-guide-modal')).toBeVisible();
    await expect(page.locator('#start-guide-title')).toHaveText('ברוך הבא — נבין קודם מה רואים כאן');
    await expect(page.locator('#btn-start-guide-primary')).toHaveText('המשך');
    await expect(page.locator('#btn-start-guide-voice')).toBeVisible();
    await expect(page.locator('#top-strip')).toBeHidden();
    await expect(page.locator('#sidebar')).toBeHidden();

    await page.locator('#btn-start-guide-primary').click();

    await page.waitForFunction(() =>
        document.body.classList.contains('app-mode-guided')
        && document.body.classList.contains('guided-step-tour')
    );
    await expect(page.locator('#quick-tour-modal')).toBeVisible();
    await expect(page.locator('#guided-start-shell')).toBeVisible();
    await expect(page.locator('#graph-area')).toBeVisible();
    await expect(page.locator('#top-strip')).toBeHidden();
    await expect(page.locator('#practice-question-bar')).toBeHidden();
    await expect(page.locator('#sidebar')).toBeHidden();
    await expect(page.locator('#btn-tools-menu')).toBeHidden();
    await expect(page.locator('#sound-toggle')).toBeHidden();

    await page.locator('#btn-quick-tour-next').click();
    await page.locator('#btn-quick-tour-next').click();
    await page.locator('#btn-quick-tour-next').click();
    await expect(page.locator('#quick-tour-title')).toHaveText('מה הרעיון?');
    await expect(page.locator('#btn-quick-tour-next')).toHaveText('תראה לי צעד ראשון');
    await page.locator('#btn-quick-tour-next').click();

    await page.waitForFunction(() =>
        document.body.classList.contains('app-mode-guided')
        && document.body.classList.contains('guided-step-action')
    );
    await expect(page.locator('#quick-tour-modal')).toBeHidden();
    await expect(page.locator('#guided-start-action-card')).toBeVisible();
    await expect(page.locator('#guided-shell-equations')).toBeHidden();
    await expect(page.locator('#top-strip')).toBeHidden();

    await page.evaluate(async () => {
        if (typeof findDemoTargetXForCurrentQuestion !== 'function') throw new Error('findDemoTargetXForCurrentQuestion is unavailable');
        let targetX = findDemoTargetXForCurrentQuestion();
        if (!Number.isFinite(targetX)) throw new Error('guided target x is not finite');
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
    );
    await expect(page.locator('#top-strip')).toBeVisible();
    await expect(page.locator('#practice-question-bar')).toBeVisible();
    await expect(page.locator('#guided-start-shell')).toBeHidden();
});
