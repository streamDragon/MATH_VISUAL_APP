import {defineConfig,devices} from '@playwright/test';
// Isolated QA runner for parallel agents: never share Vite port or test artifacts.
const HOST='127.0.0.1';
const PORT=4187;
const baseURL='http://'+HOST+':'+PORT;
export default defineConfig({
 testDir:'./tests',
 testMatch:'**/*.spec.ts',
 timeout:60_000,
 expect:{timeout:10_000},
 workers:2,
 outputDir:'./test-results-agent2',
 use:{
  baseURL,
  headless:true,
  screenshot:'only-on-failure',
  trace:'retain-on-failure',
  video:'off'
 },
 webServer:{
  command:'npm run dev -- --host '+HOST+' --port '+PORT+' --strictPort',
  url:baseURL,
  reuseExistingServer:false,
  timeout:120_000
 },
 projects:[{
  name:'mobile-iphone13',
  use:{
   browserName:process.env.PLAYWRIGHT_CHROMIUM_PATH?'chromium':'webkit',
   launchOptions:process.env.PLAYWRIGHT_CHROMIUM_PATH?{
    executablePath:process.env.PLAYWRIGHT_CHROMIUM_PATH,
    args:['--no-sandbox','--disable-gpu']
   }:{},
   ...devices['iPhone 13']
  }
 }]
});
