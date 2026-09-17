'use strict';
// Production rendering and coordinate overlay; no generated units or mock UI.
const {chromium}=require('playwright');
const fs=require('node:fs'),assert=require('node:assert/strict');
(async()=>{
 const out='artifacts/qa-map-v0661';fs.mkdirSync(out,{recursive:true});
 const browser=await chromium.launch({channel:'msedge',headless:true});
 const errors=[],results=[];
 try {
  const page=await browser.newPage({viewport:{width:1440,height:900},serviceWorkers:'block'});
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:4173/td.html?mapQA=0661');
  await page.waitForFunction(()=>globalThis.towerFrontierGame?.art.coreStatus('hunter').ready);
  await page.locator('[data-profession="hunter"]').click();
  await page.locator('[data-faction="hunter"]').click();
  await page.locator('#td-start-expedition').click();
  results.push(await page.evaluate(()=>{
   const g=towerFrontierGame,ns=TowerFrontier,img=g.art.mapAssets.beginner;
   g.paused=true;g.waves.countdown=999;
   g.build.items=[new ns.entities.CombatUnit('knight',570,360),new ns.entities.CombatUnit('dryad',670,420),new ns.entities.Building('cannon',630,510),new ns.entities.Building('crypt',470,500)];
   g.monsters=[];for(let i=0;i<18;i++){const m=new ns.entities.Monster(['grunt','runner','brute'][i%3],3);m.setRouteDistance(200+i*85);g.monsters.push(m);}
   g.camera.focus(768,490);g.updateUi();g.draw();
   return {src:img.src,width:img.naturalWidth,height:img.naturalHeight,legal:g.build.canPlaceAt(180,520,'building'),road:g.build.canPlaceAt(120,370,'building')};
  }));
  assert.match(results[0].src,/beginner-valley-v2.png$/);assert.equal(results[0].width,1536);assert.equal(results[0].height,1024);assert.equal(results[0].legal,true);assert.equal(results[0].road,false);
  await page.screenshot({path:out+'/battle-desktop.png'});
  await page.evaluate(()=>{
   const canvas=document.createElement('canvas');canvas.id='map-alignment';canvas.width=1536;canvas.height=1024;Object.assign(canvas.style,{position:'fixed',inset:0,zIndex:99999,width:'100vw',height:'100vh',objectFit:'contain',background:'#111'});document.body.append(canvas);
   const c=canvas.getContext('2d'),map=TowerFrontier.maps.definitions.beginner;c.drawImage(towerFrontierGame.art.mapAssets.beginner,0,0);
   c.strokeStyle='#ff00c8';c.lineWidth=3;c.beginPath();map.path.forEach((p,i)=>i?c.lineTo(p.x,p.y):c.moveTo(p.x,p.y));c.stroke();
   c.strokeStyle='#00ffff';c.fillStyle='#00ffff18';map.buildAreas.forEach(area=>{c.beginPath();area.forEach((p,i)=>i?c.lineTo(p.x,p.y):c.moveTo(p.x,p.y));c.closePath();c.fill();c.stroke();});
  });
  await page.screenshot({path:out+'/alignment.png'});
  await page.evaluate(()=>document.getElementById('map-alignment').remove());
  await page.setViewportSize({width:844,height:390});
  await page.evaluate(()=>{const el=document.getElementById('td-menu-layout-mode');el.value='mobile';el.dispatchEvent(new Event('change'));towerFrontierGame.updateUi();});
  await page.screenshot({path:out+'/battle-mobile.png'});
  const mobile=await browser.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true,serviceWorkers:'block'});
  const phone=await mobile.newPage();phone.on('pageerror',e=>errors.push(e.message));
  await phone.goto('http://127.0.0.1:4173/td.html');await phone.waitForURL('**/td-mobile.html');
  const frame=await (await phone.locator('iframe').elementHandle()).contentFrame();
  await frame.waitForFunction(()=>globalThis.towerFrontierGame?.art.coreStatus('hunter').ready);
  await frame.locator('[data-profession="hunter"]').tap();await frame.locator('[data-faction="hunter"]').tap();await frame.locator('#td-start-expedition').tap();
  assert.match(await frame.evaluate(()=>towerFrontierGame.art.mapAssets.beginner.src),/beginner-valley-v2.png$/);
  await phone.screenshot({path:out+'/phone-portrait.png'});await phone.setViewportSize({width:844,height:390});await phone.screenshot({path:out+'/phone-landscape.png'});
  results.push(await page.evaluate(async()=>{
   const g=towerFrontierGame,img=g.art.mapAssets.beginner,old=new Image();old.src='assets/td/beginner-valley-v1.png';await old.decode();
   const run=source=>{g.art.mapAssets.beginner=source;source.ready=true;for(let i=0;i<10;i++)g.draw();const start=performance.now();for(let i=0;i<100;i++)g.draw();return (performance.now()-start)/100;};
   const oldDrawMs=run(old),newDrawMs=run(img);return {oldDrawMs,newDrawMs};
  }));
  await mobile.close();
  assert.deepEqual(errors,[]);fs.writeFileSync(out+'/results.json',JSON.stringify({results,errors},null,2));console.log(JSON.stringify({results,errors}));
 } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
