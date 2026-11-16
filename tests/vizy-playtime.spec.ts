import {test,expect} from '@playwright/test';

test('earning is unique and survives reload',async({page})=>{
  await page.goto('/learn.html');
  await page.evaluate(()=>localStorage.removeItem('vizy_playtime_v1'));
  await page.reload();
  await page.evaluate(()=>window.dispatchEvent(new CustomEvent('vizy:progress',{detail:{type:'prompt',lesson:'increasing',id:'test-p1',helped:true}})));
  await expect(page.locator('.vizy-playtime-chip')).toContainText('0:20');
  await page.reload();
  await page.evaluate(()=>window.dispatchEvent(new CustomEvent('vizy:progress',{detail:{type:'prompt',lesson:'increasing',id:'test-p1',helped:false}})));
  await expect(page.locator('.vizy-playtime-chip')).toContainText('0:20');
});

test('game off hides chip and shows disabled panel',async({page})=>{
  await page.goto('/learn.html?game=off');
  await expect(page.locator('.vizy-playtime-chip')).toHaveCount(0);
  await page.goto('/play.html?game=off');
  await expect(page.locator('#message')).toHaveText('המשחק כבוי');
});

test('the frozen world restores the saved distance and stars',async({page})=>{
  await page.goto('/learn.html');
  await page.evaluate(()=>{
    localStorage.setItem('vizy_playtime_v1',JSON.stringify({seconds:0,earned:{}}));
    localStorage.setItem('vizy_glide_v1',JSON.stringify({...window.VizyGlideCore?.init?.(),seed:7351,x:245,y:200,speed:13,vy:0,stars:4,zone:0,airborne:false,lastStar:-1}));
  });
  await page.goto('/play.html');
  await expect(page.locator('#distance')).toHaveText('245 מטר');
  await expect(page.locator('#stars')).toContainText('4');
  await expect(page.locator('#message')).toContainText('עוד צעד אחד');
});

test('timer counts down and freezes game when it reaches zero',async({page})=>{
  await page.goto('/learn.html');
  await page.evaluate(()=>{
    localStorage.setItem('vizy_playtime_v1',JSON.stringify({seconds:1,earned:{}}));
    localStorage.removeItem('vizy_glide_v1');
  });
  await page.goto('/play.html');
  await expect(page.locator('#message')).toContainText('נגמר זמן המשחק',{timeout:10000});
  const frozen=await page.locator('#distance').textContent();
  await page.locator('#world').dispatchEvent('pointerdown',{pointerId:1,pointerType:'touch'});
  await page.waitForTimeout(400);
  await expect(page.locator('#distance')).toHaveText(frozen||'');
});
test('game canvas fits a narrow 320px phone',async({page})=>{
  await page.setViewportSize({width:320,height:568});
  await page.goto('/play.html');
  await expect(page.locator('canvas')).toBeVisible();
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth);
  expect(overflow).toBe(false);
});

test('leaving mid-second saves time already spent',async({page})=>{
  await page.goto('/learn.html');
  await page.evaluate(()=>{
    localStorage.setItem('vizy_playtime_v1',JSON.stringify({seconds:3,earned:{}}));
    localStorage.removeItem('vizy_glide_v1');
  });
  await page.goto('/play.html');
  await page.waitForTimeout(2800);
  await page.goto('/learn.html');
  const left=await page.evaluate(()=>JSON.parse(localStorage.getItem('vizy_playtime_v1')||'{}').seconds);
  expect(left).toBeLessThan(3);
  expect(left).toBeGreaterThanOrEqual(0);
});
