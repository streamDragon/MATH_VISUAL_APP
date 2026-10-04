import {test as base, expect} from '@playwright/test';

// The optional portable headless-shell executable is unreliable when reused
// across contexts in this sandbox. Isolate each test in a fresh process.
// Standard Playwright Chrome/WebKit retains its default fixture lifecycle.
export const test=process.env.PLAYWRIGHT_CHROMIUM_PATH ? base.extend({
  context:async({playwright},use,testInfo)=>{
    const settings=testInfo.project.use;
    const browser=await playwright.chromium.launch({headless:true,...settings.launchOptions});
    const options={};
    for(const key of ['baseURL','viewport','screen','userAgent','deviceScaleFactor','isMobile','hasTouch','locale','timezoneId','colorScheme','reducedMotion','permissions','storageState','ignoreHTTPSErrors'])
      if(settings[key]!==undefined)options[key]=settings[key];
    const context=await browser.newContext(options);
    try{await use(context);}finally{await browser.close();}
  },
}) : base;
export {expect};
