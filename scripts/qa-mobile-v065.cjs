'use strict';
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
(async()=>{
 const browser=await chromium.launch({channel:'msedge',headless:true});
 const errors=[];fs.mkdirSync('artifacts/qa-v065',{recursive:true});
 try{
  const context=await browser.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true,serviceWorkers:'block'});
  const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:4173/td.html');
  await page.waitForURL('**/td-mobile.html');
  const frame=await (await page.locator('iframe').elementHandle()).contentFrame();
  await frame.waitForFunction(()=>globalThis.towerFrontierGame?.art.coreStatus('hunter').ready,null,{timeout:120000});
  assert.deepEqual(await frame.evaluate(()=>[innerWidth,innerHeight]),[844,390]);
  assert.equal(await frame.locator('#td-orientation-gate').isVisible(),false);
  assert.ok(await frame.locator('.profession-dialog').evaluate(e=>e.getBoundingClientRect().top)<12);
  await page.screenshot({path:'artifacts/qa-v065/portrait-opening.png'});
  await frame.locator('[data-profession="hunter"]').tap();
  await frame.locator('[data-faction="hunter"]').tap();
  await frame.locator('#td-start-expedition').tap();
  await frame.waitForFunction(()=>towerFrontierGame.profession.selected==='hunter');
  await frame.evaluate(()=>{towerFrontierGame.waves.countdown=999;globalThis.runMarker=123;});
  assert.equal(await frame.locator('#td-hero-select').getAttribute('aria-expanded'),'false');
  assert.ok(await frame.locator('.hero-profile').evaluate(e=>e.getBoundingClientRect().width)<=56);
  await frame.locator('#td-hero-select').tap();
  assert.equal(await frame.locator('#td-hero-select').getAttribute('aria-expanded'),'true');await page.screenshot({path:'artifacts/qa-v065/hero-expanded.png'});
  await frame.locator('#td-hero-select').tap();
  await page.screenshot({path:'artifacts/qa-v065/portrait-battle.png'});
  await page.setViewportSize({width:844,height:390});
  assert.equal(await frame.evaluate(()=>runMarker),123);
  const points=await frame.evaluate(()=>{
    const g=towerFrontierGame;g.economy.gold=10000;g.economy.lumber=100;g.queueDeploy('arrow','building');
    const found=[];
    for(let y=180;y<g.camera.worldHeight-80;y+=40)for(let x=120;x<g.camera.worldWidth-80;x+=40){
      const p=g.camera.worldToScreen(x,y);
      if(p.x>230&&p.x<570&&p.y>100&&p.y<240&&g.build.canPlaceAt(x,y,'building'))found.push({x,y,sx:p.x,sy:p.y});
    }
    return [found[0],found.find(p=>Math.hypot(p.x-found[0].x,p.y-found[0].y)>50)];
  });
  assert.ok(points.every(Boolean),'two visible valid build locations');
  const cdp=await context.newCDPSession(page);
  const touch=(type,p)=>cdp.send('Input.dispatchTouchEvent',{type,touchPoints:p?[{x:p.sx,y:p.sy,id:1}]:[]});
  await touch('touchStart',points[0]);await touch('touchMove',points[1]);await touch('touchEnd');await page.waitForTimeout(500);
  let staged=await frame.evaluate(()=>({p:towerFrontierGame.build.placement,n:towerFrontierGame.build.items.length}));
  assert.equal(staged.n,0);assert.ok(Math.abs(staged.p.x-points[1].x)<2);assert.ok(Math.abs(staged.p.y-points[1].y)<2);
  await page.screenshot({path:'artifacts/qa-v065/placement.png'});await frame.locator('#td-placement-confirm').tap();
  await frame.waitForFunction(()=>towerFrontierGame.build.items.length===1);
  await touch('touchStart',points[1]);await touch('touchEnd');
  await frame.locator('#td-upgrade').tap();
  await frame.waitForFunction(()=>towerFrontierGame.build.selected?.level===2);await page.waitForTimeout(400);assert.equal(await frame.evaluate(()=>towerFrontierGame.build.selected.level),2);
  assert.equal(await frame.locator('#td-selection-actions').isVisible(),true);
  await touch('touchStart',{sx:600,sy:230});await touch('touchEnd');
  assert.equal(await frame.evaluate(()=>towerFrontierGame.build.selected),null);
  assert.equal(await frame.locator('#td-selection-actions').isVisible(),false);
  for(const viewport of [{width:568,height:320},{width:932,height:430},{width:390,height:844}]){
    await page.setViewportSize(viewport);await page.waitForTimeout(100);
    assert.equal(await frame.evaluate(()=>runMarker),123);
    await page.screenshot({path:`artifacts/qa-v065/battle-${viewport.width}.png`});
  }
  assert.deepEqual(errors,[]);
  console.log('PASS: portrait landscape viewport, menu top, hero collapse, rotation preserves game, touch drag preview/confirm, upgrade/outside dismiss, three viewport sizes, no JS errors');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
