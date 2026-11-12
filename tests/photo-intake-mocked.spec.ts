import {test,expect} from '@playwright/test';

const project='https://qaxuqliefevglwtntmmw.supabase.co/';
const userId='00000000-0000-4000-8000-000000000111';
const receipt='00000000-0000-4000-8000-000000000222';
const image={name:'question.png',mimeType:'image/png',buffer:Buffer.from('mock picture for request tests')};

async function prepare(page:any,failUpload=false){
 const calls:string[]=[];
 await page.addInitScript(({userId})=>{
  localStorage.setItem('vizy_learning_session',JSON.stringify({
   access_token:'synthetic-test-only',refresh_token:'synthetic-test-only',
   expires_at:Math.floor(Date.now()/1000)+5000,user:{id:userId,email:'student@example.test'}
  }));
 },{userId});
 await page.route(project+'**',async(route:any)=>{
  const url=new URL(route.request().url());
  calls.push(url.pathname);
  const reply=async(status:number,body:any)=>route.fulfill({status,contentType:'application/json',body:JSON.stringify(body)});
  if(url.pathname==='/auth/v1/user')return reply(200,{id:userId,email:'student@example.test'});
  if(url.pathname.startsWith('/storage/v1/object/learning-requests/'))return reply(failUpload?500:200,failUpload?{message:'storage unavailable'}:{Key:'photo'});
  if(url.pathname==='/rest/v1/rpc/learning_submit_request'){
   const data=route.request().postDataJSON();
   expect(data.image_path).toMatch(new RegExp('^'+userId+'/'));
   return reply(200,{id:receipt,status:'pending'});
  }
  if(url.pathname==='/rest/v1/learning_requests')return reply(200,[]);
  if(url.pathname==='/rest/v1/learning_entitlements')return reply(200,[]);
  return reply(200,[]);
 });
 return calls;
}
test('photo submits only after storage upload and shows genuine receipt id',async({page})=>{
 const calls=await prepare(page);
 await page.goto('/learn.html#requests');
 await expect(page.locator('#request-camera')).toBeVisible();
 await page.locator('#request-image').setInputFiles(image);
 await page.locator('#request-text').fill('מה משמעות העלייה?');
 await page.locator('#send-request').click();
 await expect(page.locator('#request-status')).toContainText(receipt);
 const upload=calls.findIndex(x=>x.startsWith('/storage/v1/object/learning-requests/'));
 const submit=calls.indexOf('/rest/v1/rpc/learning_submit_request');
 expect(upload).toBeGreaterThanOrEqual(0);
 expect(submit).toBeGreaterThan(upload);
});
test('failed storage upload never claims delivery and skips submit RPC',async({page})=>{
 const calls=await prepare(page,true);
 await page.goto('/learn.html#requests');
 await page.locator('#request-image').setInputFiles(image);
 await page.locator('#send-request').click();
 await expect(page.locator('#request-status')).toContainText('לא נשלחה');
 expect(calls).not.toContain('/rest/v1/rpc/learning_submit_request');
});
