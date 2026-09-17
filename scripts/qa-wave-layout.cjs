'use strict';
const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs');
const cases=[{name:'touch-landscape',width:958,height:454,touch:true,dpr:2},{name:'small-touch',width:667,height:375,touch:true,dpr:2},{name:'touch-portrait',width:390,height:844,touch:true,dpr:2},{name:'desktop',width:1440,height:900,touch:false,dpr:1},{name:'desktop-1920-class',width:1908,height:902,touch:false,dpr:1},{name:'zoom-equivalent',width:960,height:540,touch:false,dpr:2}];
(async()=>{const browser=await chromium.launch({channel:'msedge',headless:true}),out='artifacts/qa-wave-layout',results=[];fs.mkdirSync(out,{recursive:true});try{
 for(const c of cases){const context=await browser.newContext({viewport:{width:c.width,height:c.height},hasTouch:c.touch,isMobile:c.touch,deviceScaleFactor:c.dpr,serviceWorkers:'block'}),page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('http://127.0.0.1:4173/td.html');await page.waitForTimeout(300);const frame=page.frames().find(f=>f.url().includes('/td.html'))||page.mainFrame();
 await frame.waitForFunction(()=>globalThis.towerFrontierGame?.art.coreStatus('arcanist').ready);await frame.locator('[data-profession="arcanist"]').click();await frame.locator('[data-faction="arcanist"]').click();await frame.locator('#td-start-expedition').click();
 // Freeze simulation, not UI: capture a real countdown instead of a paused label.
 await frame.evaluate(()=>{const g=towerFrontierGame;g.update=()=>{};g.effects=[];g.waves.countdown=11;g.waveHUD.update();});
 const inspect=()=>frame.evaluate(()=>{const selectors=['#td-wave-hud','#td-wave-number','#td-wave-status','#td-wave-button','.hud-controls','.speed-picker button[data-game-speed="1"]','.speed-picker button[data-game-speed="2"]','.speed-picker button[data-game-speed="3"]','.td-command'];return {layout:document.body.dataset.layout,orientation:document.body.dataset.combatOrientation,width:innerWidth,height:innerHeight,skillsWidth:getComputedStyle(document.body).getPropertyValue('--skills-width').trim(),boxes:selectors.map(selector=>{const e=document.querySelector(selector),r=e.getBoundingClientRect();return {selector,x:r.x,y:r.y,right:r.right,bottom:r.bottom,width:r.width,height:r.height,scroll:e.scrollWidth,client:e.clientWidth};})};});
 let state=await inspect();results.push({name:c.name,...state,errors});await page.screenshot({path:out+'/'+c.name+'.png'});
 if(!process.argv.includes('--record-only')){
  assert.deepEqual(errors,[]);if(c.touch)assert.equal(state.layout,'mobile',c.name+' must actually test touch layout');
  for(const b of state.boxes)assert.ok(b.x>=0&&b.y>=0&&b.right<=state.width+1&&b.bottom<=state.height+1,c.name+' clipped '+JSON.stringify(b));
  if(c.name==='desktop-1920-class'){assert.ok(parseFloat(state.skillsWidth)<=360,'standard desktop must retain the compact command width');assert.ok(state.boxes.at(-1).width<=360,'standard desktop command panel is oversized');}
  const [,number,status,button]=state.boxes;assert.ok(number.right+6<=status.x,c.name+' wave/countdown overlap');assert.ok(status.right+6<=button.x,c.name+' countdown/button overlap');assert.ok(state.boxes[0].height<=100,c.name+' panel too tall');
  for(const speed of ['1','2','3'])await frame.locator('[data-game-speed="'+speed+'"]').click();
  await frame.locator('#td-wave-toggle').click();await frame.locator('.wave-enemy').first().click();assert.ok(await frame.locator('.wave-intel').evaluate(e=>e.open));await frame.locator('.wave-intel summary').click();
  await frame.locator('#td-wave-button').click();await page.waitForTimeout(180);assert.equal(await frame.locator('#td-wave-toast').isVisible(),true);assert.equal(await frame.locator('.wave-forecast').isVisible(),false);
  state=await inspect();assert.ok(state.boxes[0].x<=20&&state.boxes[0].height<=30,c.name+' combat panel must be docked and slim');assert.equal(await frame.locator('#td-wave-hud').evaluate(e=>{const r=e.getBoundingClientRect();return e.contains(document.elementFromPoint(r.x+r.width/2,r.y+r.height/2));}),false,c.name+' combat HUD must allow clicks through');
 }
 await context.close();
 }
 fs.writeFileSync(out+'/results.json',JSON.stringify(results,null,2));console.log('Wave layout checks finished: '+results.length+' viewports.');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
