import { chromium } from '@playwright/test';
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
const root=path.resolve(import.meta.dirname,'..');
const port=Number(process.env.VIZY_QA_PORT||4319);
const base='http://127.0.0.1:'+port;
const out=path.join(root,'qa','vizy-agent1-layout');
const chrome=process.env.PLAYWRIGHT_CHROMIUM_PATH||'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
await mkdir(out,{recursive:true});
if(!existsSync(chrome))throw new Error('Chrome executable not found: '+chrome);
const server=spawn(process.execPath,['./node_modules/vite/bin/vite.js','--host','127.0.0.1','--port',String(port),'--strictPort'],{cwd:root,windowsHide:true,stdio:['ignore','pipe','pipe']});
let serverLog='';server.stdout.on('data',b=>serverLog+=b.toString());server.stderr.on('data',b=>serverLog+=b.toString());
async function ready(){for(let i=0;i<80;i++){try{const res=await fetch(base+'/learn.html');if(res.ok)return;}catch{}await new Promise(r=>setTimeout(r,200));}throw new Error('QA Vite did not start: '+serverLog);}
const report={at:new Date().toISOString(),commit:'',screens:[]};
let browser;
async function scan(page,kind,size){
 const metrics=await page.evaluate(()=>{
  const vis=(el)=>{let s=getComputedStyle(el);return s.display!=='none'&&s.visibility!=='hidden'&&el.getClientRects().length>0};
  const hit=(el)=>{let r=el.getBoundingClientRect(),x=Math.max(0,Math.min(innerWidth-1,r.left+r.width/2)),y=Math.max(0,Math.min(innerHeight-1,r.top+r.height/2));let h=document.elementFromPoint(x,y);return h===el||el.contains(h)};
  const selectors=['#student-start-ability','#vizy-unified-nav','#vizy-tools-drawer','.vizy-journey-stops','#iqEntryOverlay','.iq-entry-answer','#request-image','.student-grade-picker'];
  const elements=Object.fromEntries(selectors.map(sel=>{let el=document.querySelector(sel);if(!el)return[sel,null];let r=el.getBoundingClientRect();return[sel,{visible:vis(el),x:Math.round(r.x),y:Math.round(r.y),width:Math.round(r.width),height:Math.round(r.height),inView:r.bottom>0&&r.top<innerHeight&&r.right>0&&r.left<innerWidth,clickable:vis(el)&&r.top>=0&&r.bottom<=innerHeight&&hit(el)}];}));
  const candidates=[...document.querySelectorAll('button,a,summary,input')].filter(el=>vis(el)).map(el=>{let r=el.getBoundingClientRect();return {tag:el.tagName,text:(el.textContent||el.getAttribute('aria-label')||'').trim().slice(0,55),x:Math.round(r.x),y:Math.round(r.y),w:Math.round(r.width),h:Math.round(r.height)};}).filter(b=>b.y>=0&&b.y<innerHeight&&b.h<40);
  return {title:document.title,bodyClasses:document.body.className,viewport:{width:innerWidth,height:innerHeight},documentWidth:document.documentElement.scrollWidth,documentHeight:document.documentElement.scrollHeight,horizontalOverflow:Math.max(0,document.documentElement.scrollWidth-innerWidth),elements,smallTouchTargets:candidates.slice(0,20),mainText:document.querySelector('main')?.innerText?.slice(0,240)||''};
 });
 const filename=kind+'-'+size.width+'x'+size.height+'.png';
 await page.screenshot({path:path.join(out,filename),animations:'disabled'});
 report.screens.push({kind,size,file:filename,...metrics});
}
try{
 await ready();
 browser=await chromium.launch({headless:true,executablePath:chrome,args:['--disable-gpu']});
 const sizes=[{width:320,height:568},{width:390,height:844},{width:412,height:915},{width:1366,height:768}];
 for(const size of sizes){
  const context=await browser.newContext({viewport:size,deviceScaleFactor:1,isMobile:size.width<600,hasTouch:size.width<600});
  const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(base+'/learn.html',{waitUntil:'domcontentloaded'});await page.waitForTimeout(900);
  await scan(page,'home',size);
  const tools=page.locator('#vizy-unified-nav [data-nav="tools"]');
  if(await tools.count()){await tools.click();await page.waitForTimeout(250);await scan(page,'tools',size);}
  await page.goto(base+'/classroom-practice.html',{waitUntil:'domcontentloaded'});await page.waitForTimeout(750);await scan(page,'classroom',size);
  await page.goto(base+'/problem-map.html?lesson=increasing',{waitUntil:'domcontentloaded'});await page.waitForTimeout(750);await scan(page,'increasing-overlay',size);
  await page.goto(base+'/problem-map.html?lesson=difference-squares',{waitUntil:'domcontentloaded'});await page.waitForTimeout(650);await scan(page,'difference-overlay',size);
  report.screens[report.screens.length-1].pageErrors=errors;
  await context.close();
 }
}finally{
 if(browser)await browser.close();
 server.kill();
 await writeFile(path.join(out,'report.json'),JSON.stringify(report,null,2),'utf8');
}
console.log('QA report: '+path.join(out,'report.json'));
for(const r of report.screens){const e=r.elements['#iqEntryOverlay'];const nav=r.elements['#vizy-unified-nav'];const cta=r.elements['#student-start-ability'];console.log(r.kind+' '+r.size.width+'x'+r.size.height+' overflow='+r.horizontalOverflow+' docHeight='+r.documentHeight+' cta='+JSON.stringify(cta)+' overlay='+JSON.stringify(e)+' nav='+JSON.stringify(nav)+' smallTargets='+r.smallTouchTargets.length);}
