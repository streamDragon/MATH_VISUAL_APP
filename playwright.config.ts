import { defineConfig, devices } from '@playwright/test';

const HOST = '127.0.0.1';
const PORT = 4173;
const baseURL = `http://${HOST}:${PORT}`;

export default defineConfig({
  testDir: './tests',
  timeout: 60_000,
  expect: {
    timeout: 10_000
  },
  use: {
    baseURL,
    headless: true,
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
    video: 'retain-on-failure'
  },
  webServer: {
    command: `npm run dev -- --host ${HOST} --port ${PORT} --strictPort`,
    url: baseURL,
    timeout: 120_000,
    reuseExistingServer: true
  },
  projects: [
    {
      name: 'desktop-chromium',
      use: {
        browserName: 'chromium',
        ...devices['Desktop Chrome']
      }
    },
    {
      name: 'mobile-iphone13',
      use: {
        browserName: 'webkit',
        ...devices['iPhone 13']
      }
    }
  ]
});
