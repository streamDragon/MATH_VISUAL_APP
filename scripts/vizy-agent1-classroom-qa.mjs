import { chromium } from '@playwright/test';
import { spawn } from 'node:child_process';
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
const root=path.resolve(import.meta.dirname,'..');
const port=4327, base='http://127.0.0.1:'+port;
const output=path.join(root,'qa','vizy-agent1-classroom');
await mkdir(output,{recursive:true});
const server=spawn(process.execPath,['./node_modules/vite/bin/vite.js','--host','127.0.0.1','--port',String(port),'--strictPort'],{cwd:root,windowsHide:true,stdio:'ignore'});
async function ready(){for(let i=0;i<80;i++){try{if((await fetch(base+'/classroom-practice.html')).ok)return;}catch{}await new Promise(r=>setTimeout(r,180));}throw Error('Vite QA server unavailable');}
let browser;
const report=[];
try{
 await ready();
 browser=await chromium.launch({headless:true,executablePath:'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',args:['--disable-gpu']});
 for(const viewport of [{width:320,height:568},{width:390,height:844},{width:412,height:915},{width:1366,height:768}]){
  const page=await browser.newPage({viewport,deviceScaleFactor:1,isMobile:viewport.width<600,hasTouch:viewport.width<600});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(base+'/classroom-practice.html',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(500);
  const baseMetrics=await page.evaluate(()=>{
   const cards=[...document.querySelectorAll('.course-card')];
   return {h1:document.querySelector('.hero h1')?.textContent,
    cardCount:cards.length,previewCount:document.querySelectorAll('.course-card-art svg').length,
    courseIds:cards.map(c=>c.dataset.course),overflow:document.documentElement.scrollWidth-innerWidth,
    cards:cards.map(c=>{let x=c.getBoundingClientRect(),a=c.querySelector('.course-card-art').getBoundingClientRect();return {width:x.width,artWithin:x.left<=a.left&&x.right>=a.right,artHeight:a.height}})};
  });
  assert.equal(baseMetrics.cardCount,2,'one grade initially shows 2 lesson cards');
  assert.equal(baseMetrics.previewCount,2,'two visible topic illustrations');
  assert(baseMetrics.cards.every(x=>x.artWithin),'illustrations fit inside cards');
  assert(baseMetrics.overflow<=4,'no horizontal overflow on classroom home');
  assert(baseMetrics.h1.includes('נחקור'),'focused hero prompt');
  await page.screenshot({path:path.join(output,'classroom-after-'+viewport.width+'x'+viewport.height+'.png')});
  await page.locator('#gradeTabs [data-grade="11"]').click();
  assert.equal(await page.locator('.course-card[data-course="g11-fractions"] svg').count(),1,'fraction preview');
  assert.equal(await page.locator('.course-card[data-course="g11-inequality"] svg').count(),1,'inequality preview');
  await page.locator('#gradeTabs [data-grade="9"]').click();
  await page.locator('.course-card').first().locator('button.primary').click();
  assert.equal(await page.locator('#workspace').isVisible(),true,'activity opens');
  assert.equal(await page.locator('#questionHeading').isVisible(),true,'question visible');
  assert.equal(await page.locator('.exact-classroom-graph').getAttribute('data-function'),'x^2-4','existing math illustration preserved');
  const stageOverflow=await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
  assert(stageOverflow<=4,'no horizontal overflow in active lesson');
  await page.screenshot({path:path.join(output,'classroom-lesson-'+viewport.width+'x'+viewport.height+'.png')});
  assert.deepEqual(errors,[],'no browser exceptions');
  report.push({viewport,...baseMetrics,stageOverflow,errors});
  await page.close();
 }
}finally{
 if(browser)await browser.close();
 server.kill();
 await writeFile(path.join(output,'report.json'),JSON.stringify(report,null,2),'utf8');
}
console.log('PASS 4 viewport sizes; 2 illustrated cards; both grades; lesson opens; exact graph retained; zero horizontal overflow; zero page errors.');
console.log('Evidence: '+path.join(output,'report.json'));
