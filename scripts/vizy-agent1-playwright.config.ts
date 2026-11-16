import { defineConfig, devices } from '@playwright/test';
const port=4331;
export default defineConfig({
 testDir:'../tests',
 testMatch:['**/classroom-flow.spec.ts','**/classroom-exact-graph.spec.ts'],
 timeout:60_000,expect:{timeout:10_000},
 workers:1,retries:0,reporter:'list',
 outputDir:'../qa/vizy-agent1-classroom/e2e',
 use:{
  baseURL:'http://127.0.0.1:'+port,
  headless:true,screenshot:'only-on-failure',
  browserName:'chromium',
  launchOptions:{executablePath:'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',args:['--disable-gpu','--no-sandbox']},
  ...devices['iPhone 13']
 },
 webServer:{
  command:'node ./node_modules/vite/bin/vite.js --host 127.0.0.1 --port '+port+' --strictPort',
  cwd:'..',
  url:'http://127.0.0.1:'+port,timeout:120_000,reuseExistingServer:false
 }
});
