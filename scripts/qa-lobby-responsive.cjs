'use strict';
const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs');
(async()=>{
 const browser=await chromium.launch({channel:'msedge',headless:true}),out='artifacts/qa-lobby-v0834',results=[];
 fs.mkdirSync(out,{recursive:true});
 try{
  for(const [name,width,height,touch] of [['desktop',1440,900,false],['desktop-zoomed',960,450,false],['mobile-landscape',844,390,true],['mobile-portrait',390,844,true],['mobile-small',667,375,true]]){
   const context=await browser.newContext({viewport:{width,height},isMobile:touch,hasTouch:touch,deviceScaleFactor:1,serviceWorkers:'block'}),page=await context.newPage(),errors=[];
   page.on('pageerror',e=>errors.push(e.message));
   await page.goto('http://127.0.0.1:4175/td.html');
   let view=page;if(touch){await page.waitForURL('**/td-mobile.html');view=await (await page.waitForSelector('iframe')).contentFrame();}
   await view.waitForFunction(()=>globalThis.frontierApp);
   await view.evaluate(()=>document.fonts.ready);await page.screenshot({path:out+'/'+name+'.png'});
   const measured=await view.evaluate(()=>{
    const rect=s=>{const r=document.querySelector(s).getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height,right:r.right,bottom:r.bottom};};
    return {nav:rect('.lobby-nav'),content:rect('.lobby-content'),preview:rect('.hero-feature'),modes:rect('.mode-cards'),wallet:rect('.wallet-bar'),direction:getComputedStyle(document.querySelector('.lobby-nav nav')).flexDirection,labels:document.querySelector('.wallet-bar').innerText,overflow:document.querySelector('#frontier-app').scrollWidth>innerWidth};
   });
   assert.equal(measured.direction,touch?'row':'column',name);
   assert.equal(measured.overflow,false,name+' horizontal page overflow');
   assert.doesNotMatch(measured.labels,/帳戶金幣|鑽石/);
   if(touch){assert.ok(measured.preview.height>=210,name+' readable preview');assert.ok(measured.preview.width>=230,name+' preview width');}
   else {assert.ok(measured.nav.x<measured.content.x);assert.ok(measured.nav.height>height*.7);}
   await view.locator('.hero-feature button').click();
   await view.locator('.cosmetic-preview').waitFor({state:'visible'});
   await view.locator('.cosmetic-preview [data-action="home"]').click();
   await view.locator('.wallet-gold').click();
   await view.locator('.confirm-card').waitFor({state:'visible'});
   assert.match(await view.locator('.confirm-card').innerText(),/造型帳戶/);
   await view.locator('.confirm-card [data-action="home"]').click();
   if(touch){
    await view.locator('.home-bottom').evaluate(e=>{e.scrollLeft=e.clientWidth+10;});
    await view.locator('.profile-feature button').click();
    assert.match(await view.locator('.cosmetic-preview').innerText(),/赤燼戰酋/);
   }
   assert.deepEqual(errors,[]);results.push({name,width,height,touch,measured,errors});await context.close();
  }
  fs.writeFileSync(out+'/results.json',JSON.stringify(results,null,2));console.log('Passed '+results.length+' viewport/input configurations, previews and wallet actions.');
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
