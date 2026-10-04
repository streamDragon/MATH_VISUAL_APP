import { chromium, devices } from "@playwright/test";
import { spawn } from "node:child_process";
import fs from "node:fs";
const server = spawn(
  process.execPath,
  ["node_modules/vite/bin/vite.js", "--host", "127.0.0.1", "--port", "4173"],
  { stdio: "ignore" },
);
await new Promise((r) => setTimeout(r, 800));
const browser = await chromium.launch({
  ...(process.env.PLAYWRIGHT_CHROMIUM_PATH
    ? {
        executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH,
        args: ["--no-sandbox", "--disable-gpu"],
      }
    : {}),
});
const keeper = await browser.newContext();
await keeper.newPage();
fs.mkdirSync(".tmp-ui", { recursive: true });
try {
  for (const [name, opts] of [
    ["iphone13", { ...devices["iPhone 13"], deviceScaleFactor: 1 }],
    ["desktop", { viewport: { width: 1440, height: 1000 } }],
  ]) {
    const ctx = await browser.newContext({ ...opts, locale: "he-IL" }),
      page = await ctx.newPage();
    page.on("pageerror", (e) => console.log("PAGEERROR", e.message));
    await page.goto("http://127.0.0.1:4173/learn.html");
    await page.locator("#continue-challenge").waitFor();
    await page.screenshot({
      path: ".tmp-ui/" + name + "-home.png",
      fullPage: false,
    });
    await page.goto("http://127.0.0.1:4173/learn.html#race");
    await page.locator("#race-map").waitFor();
    await page.screenshot({
      path: ".tmp-ui/" + name + "-race.png",
      fullPage: false,
    });
    await page.goto("http://127.0.0.1:4173/learn.html?activity=linear-01");
    await page.getByRole("button", { name: "עולה ב־2", exact: true }).click();
    await page.getByRole("button", { name: "נבדוק בציור" }).click();
    await page.screenshot({
      path: ".tmp-ui/" + name + "-lesson.png",
      fullPage: false,
    });
    await page.locator("#answer").fill("5");
    await page
      .getByRole("button", { name: "בדיקת תשובה", exact: true })
      .click();
    await page.getByRole("button", { name: "מוכנים לדמיין לבד" }).click();
    await page.locator("#transfer-answer").fill("7");
    await page.getByRole("button", { name: "בדיקת האתגר החדש" }).click();
    await page.screenshot({
      path: ".tmp-ui/" + name + "-win.png",
      fullPage: false,
    });
    await ctx.close();
  }
} finally {
  await browser.close();
  server.kill();
}
