/** @type {import('@playwright/test').PlaywrightTestConfig} */
module.exports = {
    testDir: '.',
    timeout: 120000,
    expect: {
        timeout: 20000
    },
    use: {
        baseURL: 'http://127.0.0.1:4173',
        headless: true
    },
    webServer: {
        command: 'npm run dev -- --host 127.0.0.1 --port 4173 --strictPort',
        url: 'http://127.0.0.1:4173',
        timeout: 120000,
        reuseExistingServer: false
    }
};
