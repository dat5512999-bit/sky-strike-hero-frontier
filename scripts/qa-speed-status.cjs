'use strict';
// Optional browser layout probe; Playwright and Edge are QA dependencies only.
const {chromium}=require('playwright'),{pathToFileURL}=require('node:url'),path=require('node:path'),fs=require('node:fs'),assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({channel:'msedge',headless:true});try{
  const page=await browser.newPage({viewport:{width:1280,height:720},serviceWorkers:'block'}),errors=[];page.on('pageerror',error=>errors.push(error.message));
  await page.goto(pathToFileURL(path.resolve(__dirname,'../td.html')).href);
  await page.waitForFunction(()=>globalThis.towerFrontierGame?.art.coreStatus('hunter').ready&&document.body.hasAttribute('data-app-ready'));
  const state=await page.evaluate(()=>{const g=towerFrontierGame;g.app.openFree({profession:'hunter',faction:'hunter',difficulty:'standard',map:'beginner'});g.setGameSpeed(3);const clock=new TowerFrontier.systems.FrameTimingSystem(0);for(let i=1;i<=20;i++)g.speedLoadGuard.observe(clock.next(i*100,3),3,true);g.updateSpeedStatus();const badge=document.getElementById('td-speed-status');return {hidden:badge.hidden,text:badge.textContent,pressed:document.querySelector('[data-game-speed="3"]').getAttribute('aria-pressed'),label:document.querySelector('[data-game-speed="3"]').getAttribute('aria-label')};});
  assert.equal(state.hidden,false);assert.match(state.text,/效能保護 ×2/);assert.equal(state.pressed,'true');assert.match(state.label,/二倍速/);assert.deepEqual(errors,[]);
  const dir=path.resolve(__dirname,'../artifacts/qa-long-session');fs.mkdirSync(dir,{recursive:true});await page.screenshot({path:path.join(dir,'speed-protection-desktop.png')});
  await page.setViewportSize({width:932,height:430});await page.screenshot({path:path.join(dir,'speed-protection-landscape.png')});
  await page.setViewportSize({width:390,height:844});const rect=await page.locator('#td-speed-status').boundingBox();assert.ok(rect&&rect.x>=0&&rect.x+rect.width<=390);await page.screenshot({path:path.join(dir,'speed-protection-portrait.png')});
  console.log(JSON.stringify(state));
}finally{await browser.close();}})().catch(error=>{console.error(error);process.exitCode=1;});
