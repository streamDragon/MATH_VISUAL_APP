import { test, expect } from '@playwright/test';

function contrast(bg: string, fg: string) {
 const rgb = (hex: string) => {
  const n=parseInt(hex.slice(1),16);
  return [n>>16 & 255,n>>8 & 255,n & 255].map(x=> {
   const v=x/255;
   return v<=0.04045?v/12.92:Math.pow((v+0.055)/1.055,2.4);
  });
 };
 const lum=(v:number[])=>0.2126*v[0]+0.7152*v[1]+0.0722*v[2];
 const a=lum(rgb(bg)),b=lum(rgb(fg));
 return (Math.max(a,b)+0.05)/(Math.min(a,b)+0.05);
}

test('core Vizy palette remains readable at 4.5 to 1',()=>{
 for(const [bg,fg] of [
  ['#10182e','#f2f7ff'],['#192b45','#c6d5e9'],
  ['#243953','#f2f7ff'],['#d9fa78','#172c20'],
  ['#152541','#dceaf7'],['#f2f6fc','#183955'],
 ]) expect(contrast(bg,fg),bg+' '+fg).toBeGreaterThanOrEqual(4.5);
});

for(const width of [320,390]){
 test('Vizy visual home fits '+width+' with one CTA and journey',async({page})=>{
  await page.setViewportSize({width,height:width===320?568:844});
  const externalFonts:string[]=[];
  page.on('request',request=>{
   if(/\.(?:woff2?|ttf)/.test(request.url())&&!request.url().startsWith('http://127.0.0.1:'))
    externalFonts.push(request.url());
  });
  await page.goto('/learn.html');
  await expect(page.locator('.vizy-home-avatar svg')).toBeVisible();
  await expect(page.locator('#vizy-journey')).toBeVisible();
  await expect(page.locator('.vizy-journey-stop').first()).toBeVisible();
  await expect(page.locator('[data-vizy-slot=playtime]')).toHaveCount(1);
  await expect(page.locator('[data-vizy-slot=sound]')).toHaveCount(1);
  await expect(page.locator('#vizy-unified-nav .vizy-icon')).toHaveCount(3);
  const check=await page.evaluate(()=>{
   const rect=(s:string)=>document.querySelector(s)?.getBoundingClientRect();
   const cta=rect('.vizy-single-cta'),journey=rect('#vizy-journey'),drawer=rect('.vizy-tools-drawer'),nav=rect('#vizy-unified-nav');
   const body=document.querySelector('.student-next-step h2');
   return {
    overflow:document.documentElement.scrollWidth>innerWidth,
    ctaTop:cta?.top,ctaBottom:cta?.bottom,
    journeyBottom:journey?.bottom,drawerBottom:drawer?.bottom,
    navTop:nav?.top,
    correctOrder:(journey?.top||0)<(drawer?.top||0),
    font:body?getComputedStyle(body).fontFamily:'',
    downloaded:document.fonts.check('700 16px Rubik')
   };
  });
  expect(check.overflow).toBe(false);
  expect(check.correctOrder).toBe(true);
  expect(check.ctaTop).toBeGreaterThanOrEqual(0);
  expect(check.ctaBottom).toBeLessThan(check.navTop||0);
  expect(check.drawerBottom).toBeLessThan(check.navTop||0);
  expect(check.font).toContain('Rubik');
  expect(check.downloaded).toBe(true);
  expect(externalFonts).toEqual([]);
 });
}
for(const lesson of ['increasing','difference-squares']){
 test('inquiry '+lesson+' shares Rubik and keeps first decision primary',async({page})=>{
  await page.setViewportSize({width:390,height:844});
  await page.goto('/problem-map.html?lesson='+lesson);
  await expect(page.locator('#iqEntryOverlay')).toBeVisible();
  await expect(page.locator('#vizy-unified-nav .vizy-icon')).toHaveCount(3);
  await expect(page.locator('.iq-entry-answer').first()).toBeVisible();
  const data=await page.evaluate(()=>({
   overflow:document.documentElement.scrollWidth>innerWidth,
   font:getComputedStyle(document.querySelector('.iq-entry-answer')!).fontFamily
  }));
  expect(data.overflow).toBe(false);
  expect(data.font).toContain('Rubik');
 });
}

for(const width of [320,390]){
 test('tools announce expanded state and challenge bank takes focus at '+width,async({page})=>{
  await page.setViewportSize({width,height:width===320?568:844});
  await page.goto('/learn.html');
  const tools=page.locator('#vizy-unified-nav [data-nav="tools"]');
  await expect(tools).toHaveAttribute('aria-controls','vizy-tools-drawer');
  await expect(tools).toHaveAttribute('aria-expanded','false');
  await tools.click();
  await expect(tools).toHaveAttribute('aria-expanded','true');
  await expect(page.locator('#vizy-tools-drawer')).toHaveAttribute('open','');
  await page.locator('#vizy-open-bank').click();
  await expect(page.locator('#challenges')).toBeVisible();
  await expect(page.locator('#library-toggle')).toBeFocused();
  await tools.click();
  await expect(tools).toHaveAttribute('aria-expanded','false');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)).toBe(false);
 });
}


for(const [grade,kind,lesson] of [
 ['9','map','difference-squares'],['11','graph','increasing']
] as const){
 test('journey starts with the actual home lesson for grade '+grade,async({page})=>{
  await page.setViewportSize({width:390,height:844});
  await page.goto('/learn.html');
  await page.locator('[data-home-grade="'+grade+'"]').click();
  const primary=page.locator('#vizy-journey-stops .vizy-journey-stop').first();
  const actual=await page.locator('.student-next-step-content>p').textContent();
  await expect(primary).toHaveAttribute('data-vizy-lesson','primary');
  expect(await primary.getAttribute('aria-label')).toContain(actual!.trim());
  await expect(primary).toHaveClass(/is-next/);
  await expect(page.locator('#student-start-ability')).toHaveAttribute('href','problem-map.html?lesson='+lesson);
  const remaining=page.locator('#vizy-journey-stops .vizy-journey-stop:not([data-vizy-lesson=primary])');
  expect(await remaining.count()).toBeGreaterThan(0);
  for(const marker of await remaining.all())await expect(marker).not.toHaveClass(/is-next/);
 });
 test('saved completed inquiry marks real primary lesson finished for grade '+grade,async({page})=>{
  await page.addInitScript(({grade,kind})=>{
   localStorage.setItem('vizy_home_grade',JSON.stringify(grade));
   localStorage.setItem('vizy_inquiry_v1_'+kind,JSON.stringify({kind,route:['choose','done'],index:1}));
  },{grade,kind});
  await page.goto('/learn.html');
  const stop=page.locator('#vizy-journey-stops .vizy-journey-stop').first();
  await expect(stop).toHaveClass(/is-done/);
  await expect(stop).toHaveAttribute('data-vizy-lesson','primary');
  await expect(stop).toHaveAttribute('title',/.+/);
  await expect(stop).not.toHaveClass(/is-next/);
  await expect(page.locator('#vizy-journey-stops .vizy-journey-stop.is-done')).toHaveCount(1);
 });
}
