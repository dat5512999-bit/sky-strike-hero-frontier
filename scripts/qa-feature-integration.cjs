'use strict';
const {chromium}=require('playwright'),fs=require('node:fs'),assert=require('node:assert/strict'),path=require('node:path'),{pathToFileURL}=require('node:url');
(async()=>{
 const browser=await chromium.launch({channel:'msedge',headless:true}),out='artifacts/qa-integration-v0835',checks=[];fs.mkdirSync(out,{recursive:true});
 try{
  for(const mode of ['desktop','mobile','file']){
   const touch=mode==='mobile',context=await browser.newContext({viewport:touch?{width:844,height:390}:{width:1440,height:900},isMobile:touch,hasTouch:touch,serviceWorkers:'block'}),page=await context.newPage(),errors=[],missing=[];
   page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400&&!r.url().includes('/assets/cinematics/prologue/'))missing.push(r.url());});
   const url=mode==='file'?pathToFileURL(path.resolve('td.html')).href:'http://127.0.0.1:4175/td.html';
   await page.goto(url);let view=page;
   if(touch){await page.waitForURL('**/td-mobile.html');view=await (await page.waitForSelector('iframe')).contentFrame();}
   await view.waitForFunction(()=>globalThis.frontierApp);
   await view.evaluate(()=>{frontierApp.store.newRound();frontierApp.home();});
   const before=await view.evaluate(()=>frontierApp.store.export());
   await view.locator('[data-action="shop"]').click();await view.locator('#frontier-shop').waitFor({state:'visible'});
   assert.match(await view.locator('.hf-status').innerText(),/展示模式/);
   await page.screenshot({path:out+'/'+mode+'-shop.png'});
   await view.locator('.hf-card[data-value="astral-oath"]').first().click();
   await view.locator('[data-shop-action="buy"]').click();await view.locator('[data-shop-action="cancel"]').click();
   assert.match(await view.locator('.hf-wallet').innerText(),/5,230/);
   await view.locator('[data-shop-action="buy"]').click();await view.locator('[data-shop-action="confirm"]').click();
   await view.locator('[data-shop-action="equip"]').waitFor();
   assert.equal(await view.evaluate(()=>frontierApp.store.export()),before);
   if(touch)await view.locator('[data-shop-action="close-detail"]').click();
   await view.locator('[data-shop-action="exit"]').click();assert.equal(await view.locator('#frontier-shop').count(),0);
   // Collect the prologue through the real Story UI.
   await view.locator('[data-action="story"]').first().click();await view.locator('[data-action="cinematic"]').first().click();
   await view.locator('.hf-cinematic').waitFor({state:'visible'});await view.locator('.hf-cinematic-skip').click();
   await view.locator('[data-action="chapter-battle"]').waitFor();
   await view.locator('.header-actions [data-action="home"]').click();
   await view.locator('[data-action="codex"]').click();await view.waitForFunction(()=>globalThis.HeroFrontierCodex);
   assert.equal(await view.evaluate(()=>HeroFrontierCodex.progression.save.profileStore.current().kind),'test');
   assert.equal(await view.locator('[data-category]').count(),8);
   await view.locator('[data-category="chronicle"]').click();
   await view.locator('.cinematic-inbox').click();
   assert.match(await view.locator('#modal-body').innerText(),/曾經的和平/);
   await view.getByRole('button',{name:'Replay Cinematic · 重播影片',exact:true}).click();
   await view.locator('.hf-cinematic').waitFor({state:'visible'});
   const replayBefore=await view.evaluate(()=>HeroFrontierCodex.progression.save.profileStore.export());
   await view.locator('.hf-cinematic-skip').click();
   assert.equal(await view.evaluate(()=>HeroFrontierCodex.progression.save.profileStore.export()),replayBefore);
   await page.screenshot({path:out+'/'+mode+'-codex.png'});
   const milestones=await view.evaluate(()=>HeroFrontierCodex.progression.save.snapshot().chronicle.milestones);
   assert.deepEqual(milestones,['prologue.experienced']);
   await view.locator('a[aria-label="返回遊戲"]').click();await view.waitForFunction(()=>globalThis.frontierApp);
   assert.equal(await view.evaluate(()=>frontierApp.store.current().round),1);
   assert.equal(await view.evaluate(()=>new TowerFrontier.cinematic.PrologueProgress(frontierApp.store).prologueSeen),true);
   assert.equal(await view.evaluate(()=>frontierApp.store.current().wallet.diamonds),0);
   assert.deepEqual(errors,[]);assert.deepEqual(missing,[]);
   checks.push({mode,errors,missing,checks:['shop entry and exit','mock purchase never changes profile wallet','profile-backed full Codex','Chronicle replay read-only','no secret milestones','return to lobby preserves round']});
   await context.close();
  }
  fs.writeFileSync(out+'/results.json',JSON.stringify(checks,null,2));console.log('Feature integration passed desktop, mobile and file URL flows.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
