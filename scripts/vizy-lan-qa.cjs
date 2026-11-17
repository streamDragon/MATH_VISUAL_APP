const {webkit}=require('playwright');
const base=process.env.VIZY_LAN_URL||'http://192.168.1.104:4197';
(async()=>{
 const browser=await webkit.launch({headless:true});
 const results=[];
 for(const width of [320,390]){
  const page=await browser.newPage({viewport:{width,height:width===320?568:844},locale:'he-IL'});
  const fails=[];
  page.on('response',r=>{if(r.url().startsWith(base)&&r.status()>=400)fails.push(r.status()+' '+r.url())});
  page.on('requestfailed',r=>{if(r.url().startsWith(base))fails.push('FETCH '+r.url()+' '+r.failure()?.errorText)});
  const entry=await page.goto(base+'/learn.html',{waitUntil:'networkidle',timeout:20000});
  await page.evaluate(()=>document.fonts.ready);
  const home=await page.evaluate(()=>({
   title:document.title,
   visibleMainCTA:!!document.querySelector('.vizy-single-cta')?.getBoundingClientRect().height,
   hasMascot:!!document.querySelector('.vizy-home-avatar svg'),
   journey:document.querySelectorAll('#vizy-journey-stops .vizy-journey-stop').length,
   nav:document.querySelectorAll('#vizy-unified-nav a').length,
   overflow:document.documentElement.scrollWidth>innerWidth,
   rubik:document.fonts.check('700 16px Rubik'),
   bodyHasNetworkAddress:location.hostname==='192.168.1.104'
  }));
  await page.locator('#vizy-unified-nav [data-nav="tools"]').click();
  const drawer=await page.locator('#vizy-tools-drawer').evaluate(el=>el.open);
  await page.locator('#vizy-open-bank').click();
  const library=await page.locator('#challenges').isVisible();
  const focused=await page.evaluate(()=>document.activeElement?.id);
  const lesson=await page.goto(base+'/problem-map.html?lesson=increasing',{waitUntil:'networkidle',timeout:20000});
  const inquiry=await page.evaluate(()=>({entryOverlay:!!document.querySelector('#iqEntryOverlay'),options:document.querySelectorAll('.iq-entry-answer').length,overflow:document.documentElement.scrollWidth>innerWidth}));
  const ok=entry.status()===200&&lesson.status()===200&&home.visibleMainCTA&&home.hasMascot&&home.journey>0&&home.nav===3&&!home.overflow&&home.rubik&&home.bodyHasNetworkAddress&&drawer&&library&&focused==='library-toggle'&&inquiry.entryOverlay&&inquiry.options===3&&!inquiry.overflow&&!fails.length;
  const result={width,ok,http:[entry.status(),lesson.status()],home,drawer,library,focused,inquiry,fails};results.push(result);console.log(JSON.stringify(result));
  await page.close();
 }
 await browser.close();
 if(results.some(x=>!x.ok))process.exitCode=1;
})().catch(e=>{console.error(e);process.exitCode=1});
