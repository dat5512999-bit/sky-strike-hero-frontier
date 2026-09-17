'use strict';
const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs');
(async()=>{const browser=await chromium.launch({channel:'msedge',headless:true}),errors=[],out='artifacts/qa-wave-hud';fs.mkdirSync(out,{recursive:true});try{
 const page=await browser.newPage({viewport:{width:1440,height:900},serviceWorkers:'block'});page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:4173/td.html');await page.waitForFunction(()=>globalThis.towerFrontierGame?.art.coreStatus('hunter').ready);
 await page.locator('[data-profession="hunter"]').click();await page.locator('[data-faction="hunter"]').click();await page.locator('#td-start-expedition').click();
 await page.evaluate(()=>{const g=towerFrontierGame;g.waves.wave=1;g.waves.beginPreparation();g.waves.countdown=11;g.paused=true;g.waveHUD.update();});
 await page.screenshot({path:out+'/desktop.png'});
 await page.locator('#td-wave-toggle').click();await page.locator('.wave-enemy').first().click();assert.ok(await page.locator('.wave-intel').evaluate(e=>e.open));await page.keyboard.press('Escape');
 assert.equal(await page.locator('#td-wave-button').isDisabled(),true);
 await page.evaluate(()=>{towerFrontierGame.paused=false;towerFrontierGame.waveHUD.update();});
 await page.locator('#td-wave-button').click();await page.waitForTimeout(150);assert.equal(await page.locator('#td-wave-toast').isVisible(),true);assert.equal(await page.locator('.wave-forecast').isVisible(),false);
 await page.screenshot({path:out+'/started.png'});await page.waitForTimeout(1750);assert.equal(await page.locator('#td-wave-toast').isVisible(),false);
 await page.evaluate(()=>{const g=towerFrontierGame;g.monsters=[];g.waves.queue=[];g.waves.active=false;g.waves.wave=4;g.waves.beginPreparation();g.paused=true;g.waveHUD.update();});
 assert.match(await page.locator('#td-wave-tags').textContent(),/首領/);
 await page.setViewportSize({width:844,height:390});await page.waitForTimeout(300);await page.screenshot({path:out+'/mobile.png'});
 const boxes=await page.evaluate(()=>['td-wave-hud','td-wave-button'].map(id=>{const r=document.getElementById(id).getBoundingClientRect();return {id,x:r.x,y:r.y,right:r.right,bottom:r.bottom};}));for(const b of boxes){assert.ok(b.x>=0&&b.right<=844&&b.y>=0&&b.bottom<=390,JSON.stringify(b));}
 assert.deepEqual(errors,[]);fs.writeFileSync(out+'/results.json',JSON.stringify({errors,boxes,checks:['preparation portraits','details keyboard close','pause guard','manual start toast','toast timeout','combat collapsed','boss tags','landscape bounds']},null,2));console.log('Wave HUD browser checks passed.');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
