const {chromium,devices}=require('playwright');
const assert=require('node:assert/strict');
const path=require('node:path');
const {pathToFileURL}=require('node:url');
const fs=require('node:fs');
const base=pathToFileURL(path.resolve(__dirname,'../public/classroom-practice.html')).href;
function url(topic){return base+'?topic='+encodeURIComponent(topic);}
async function checkOverflow(page,where){
  const m=await page.evaluate(()=>({viewport:window.innerWidth,scroll:Math.max(document.documentElement.scrollWidth,document.body.scrollWidth)}));
  assert(m.scroll<=m.viewport+4,where+' overflows '+JSON.stringify(m));
}
async function start(browser,device,topic){
  const context=await browser.newContext(device||{viewport:{width:1280,height:800}});
  const page=await context.newPage();const errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  page.on('response',r=>{if(r.status()>=400 && r.url().includes('classroom-'))errors.push('HTTP '+r.status()+': '+r.url());});
  await page.goto(topic?url(topic):base);
  await page.waitForSelector('#courseCards .course-card, #questionHeading');
  await checkOverflow(page,'initial');
  return {context,page,errors};
}
async function solve(page,answer,index,total){
  assert.equal(await page.locator('#stageNumber').innerText(),String(index+1));
  if(index===total-1)assert(await page.locator('#visualArea').evaluate(el=>el.classList.contains('hidden')),'transfer must start with hidden diagram');
  if(typeof answer==='string' && answer.startsWith('CHOICE:')){
    await page.locator('#choiceArea button').filter({hasText:answer.slice(7)}).first().click();
  }else await page.locator('#answerInput').fill(answer);
  await page.locator('#checkAnswer').click();
  assert.match(await page.locator('#feedback').innerText(),/נכון/, 'answer not accepted at step '+index);
  await checkOverflow(page,'step '+index);
  await page.locator('#nextStep').click();
}
async function complete(browser,device,topic,answers){
 const {context,page,errors}=await start(browser,device,topic);
 assert.equal(await page.locator('#stageNumber').innerText(),'1');
 for(let i=0;i<answers.length;i++)await solve(page,answers[i],i,answers.length);
 assert(await page.locator('#completion').isVisible(),'completion must display');
 assert.match(await page.locator('#completionText').innerText(),/שאלת העברה/);
 await checkOverflow(page,'complete '+topic);
 assert.deepEqual(errors,[]);
 await context.close();
 console.log('PASS: '+topic+' '+answers.length+' steps on '+(device?'iPhone 13':'desktop'));
}
(async()=>{
 const browser=await chromium.launch({headless:true,...(fs.existsSync(chromium.executablePath())?{}:{channel:'chrome'})});
 try{
  let session=await start(browser,devices['iPhone 13']);
  let {page,context,errors}=session;
  assert.equal(await page.locator('#courseCards .course-card').count(),2);
  await page.locator('#gradeTabs button[data-grade="11"]').click();
  assert.equal(await page.locator('#courseCards .course-card').count(),2);
  await page.locator('#gradeTabs button[data-grade="all"]').click();
  assert.equal(await page.locator('#courseCards .course-card').count(),4);
  await checkOverflow(page,'filters');
  assert.deepEqual(errors,[]);
  await context.close();
  session=await start(browser,devices['iPhone 13'],'g9-functions');
  ({page,context,errors}=session);
  await page.locator('#answerInput').fill('wrong');
  await page.locator('#checkAnswer').click();
  await page.locator('#checkAnswer').click();
  assert(await page.locator('#hintBox').isVisible(),'progressive remediation hint');
  await page.locator('#answerInput').fill('-4');
  await page.locator('#checkAnswer').click();
  await page.locator('#nextStep').click();
  await page.reload();
  assert.equal(await page.locator('#stageNumber').innerText(),'2','progress persists after reload');
  await page.locator('#previousStep').click();
  assert.equal(await page.locator('#stageNumber').innerText(),'1');
  await page.locator('#nextStep').click();
  assert.equal(await page.locator('#stageNumber').innerText(),'2');
  assert.deepEqual(errors,[]);
  await context.close();
  await complete(browser,devices['iPhone 13'],'g9-functions',['-4','-4','2','כן','3']);
  await complete(browser,devices['iPhone 13'],'g9-circles',['10','90','50','110','70']);
  await complete(browser,devices['iPhone 13'],'g11-fractions',['3','3','8','7','אין פתרון','5']);
  await complete(browser,devices['iPhone 13'],'g11-inequality',['2','-3','-1','כן','CHOICE:x<-1 או x>2','CHOICE:x<-2 או x>3']);
  await complete(browser,null,'g11-inequality',['2','-3','-1','כן','CHOICE:x<-1 או x>2','CHOICE:x<-2 או x>3']);
  console.log('PASS: grade selector, local persistence, error/hints, previous step, full student journeys, transfer hidden, responsive layouts');
 } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
