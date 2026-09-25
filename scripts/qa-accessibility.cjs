'use strict';
const {chromium}=require('playwright'),{pathToFileURL}=require('node:url'),path=require('node:path'),fs=require('node:fs'),assert=require('node:assert/strict');
(async()=>{
  const browser=await chromium.launch({channel:'msedge',headless:true});
  try{
    const context=await browser.newContext({viewport:{width:1280,height:720},serviceWorkers:'block'}),page=await context.newPage(),errors=[];
    page.on('pageerror',error=>errors.push(error.message));
    await page.goto(pathToFileURL(path.resolve(__dirname,'../td.html')).href);
    await page.waitForFunction(()=>globalThis.towerFrontierGame&&document.body.hasAttribute('data-app-ready'));
    await page.locator('#frontier-app [data-action="settings"]').first().click();
    await page.locator('[data-access-option="contrast"]').check();await page.locator('[data-access-option="text"]').check();await page.locator('[data-access-option="effects"]').check();
    const out=path.resolve(__dirname,'../artifacts/qa-accessibility');fs.mkdirSync(out,{recursive:true});await page.screenshot({path:path.join(out,'settings-desktop.png')});
    assert.deepEqual(await page.evaluate(()=>({contrast:document.body.dataset.accessContrast,text:document.body.dataset.accessText,effects:document.body.dataset.accessEffects,reduced:towerFrontierGame.feedback.reducedFx})),{contrast:'on',text:'on',effects:'reduced',reduced:true});
    await page.reload();await page.waitForFunction(()=>globalThis.towerFrontierGame&&document.body.hasAttribute('data-app-ready'));
    assert.deepEqual(await page.evaluate(()=>({contrast:document.body.dataset.accessContrast,text:document.body.dataset.accessText,effects:document.body.dataset.accessEffects})),{contrast:'on',text:'on',effects:'reduced'});
    await page.setViewportSize({width:932,height:430});await page.locator('#frontier-app [data-action="settings"]').first().click();
    await page.locator('[data-access-option="effects"]').scrollIntoViewIfNeeded();
    assert.ok(await page.locator('[data-access-option="effects"]').isVisible());await page.screenshot({path:path.join(out,'settings-landscape.png')});
    assert.deepEqual(errors,[]);await context.close();console.log('Browser accessibility controls: passed');
  }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
