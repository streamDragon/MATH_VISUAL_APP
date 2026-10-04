import { test as base, expect } from "@playwright/test";

// Chromium 145 can crash while opening a new context after earlier contexts
// close on the Linux runner. Keep test isolation at the browser-process level.
// Playwright's instrumentation still applies each test's context options and
// records traces/screenshots, including serviceWorkers overrides for API mocks.
export const test = base.extend({
  context: async (
    { playwright, browserName, launchOptions, channel, headless },
    use,
  ) => {
    const browser = await playwright[browserName].launch({
      ...launchOptions,
      channel,
      headless,
    });
    try {
      const context = await browser.newContext();
      await use(context);
      await context.close();
    } finally {
      await browser.close();
    }
  },
});
export { expect };
