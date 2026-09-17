'use strict';
const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('fs');
(async()=>{const out='artifacts/qa-autumn';fs.mkdirSync(out,{recursive:true});const browser=await chromium.launch({channel:'msedge',headless:true}),errors=[],results=[];
try{
 const page=await browser.newPage({viewport:{width:1440,height:900},serviceWorkers:'block'});page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:4173/td.html');await page.locator('#td-map-choice').selectOption('autumn');await page.waitForFunction(()=>towerFrontierGame.art.coreStatus('hunter').ready);
 assert.match(await page.locator('#td-map-note').textContent(),/雙 U/);await page.screenshot({path:out+'/selection.png'});
 await page.locator('[data-profession="hunter"]').click();await page.locator('[data-faction="hunter"]').click();await page.locator('#td-start-expedition').click();
 results.push(await page.evaluate(()=>{
  const g=towerFrontierGame,ns=TowerFrontier;g.paused=true;g.waves.start();for(let i=0;i<30&&g.waves.queue.length;i++)g.waves.update(1,g.monsters);
  const branches=Array.from(new Set(g.monsters.map(m=>ns.config.routes.indexOf(m.path))));
  g.monsters.forEach((m,i)=>m.setRouteDistance(200+Math.floor(i/2)*105));
  g.build.items=[new ns.entities.Building('arrow',630,380),new ns.entities.Building('cannon',700,590),new ns.entities.CombatUnit('knight',700,820)];
  g.camera.focus(768,490);g.updateUi();g.draw();return {branches,map:ns.config.mapId,asset:g.art.mapAssets.autumn.src,legal:g.build.canPlaceAt(820,820,'building')};
 }));assert.deepEqual(results[0].branches,[0]);assert.equal(results[0].legal,true);
 await page.screenshot({path:out+'/battle-desktop.png'});
 await page.evaluate(()=>{const g=towerFrontierGame,ns=TowerFrontier;g.monsters=[];ns.config.routes.forEach((route,n)=>{const total=ns.maps.length(route),end=n?total-ns.config.sharedLength:total-150;for(let d=150;d<end;d+=110){const m=new ns.entities.Monster('grunt',1,route);m.setRouteDistance(d);m.frame=Math.floor(d/110)%8;g.monsters.push(m);}});g.draw();});
 await page.screenshot({path:out+'/full-route-battle.png'});
 await page.evaluate(()=>{const c=document.createElement('canvas');c.id='qa-map';c.width=1536;c.height=1024;Object.assign(c.style,{position:'fixed',inset:0,zIndex:99999,width:'100vw',height:'100vh',objectFit:'contain',background:'#111'});document.body.append(c);const ctx=c.getContext('2d'),map=TowerFrontier.maps.definitions.autumn;ctx.drawImage(towerFrontierGame.art.mapAssets.autumn,0,0);(map.routes||[map.path]).forEach((r,n)=>{ctx.strokeStyle=n?'#ff3baa':'#19caff';ctx.lineWidth=3;ctx.beginPath();r.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.stroke();});for(const area of map.buildAreas){ctx.strokeStyle='#4cff90';ctx.fillStyle='#4cff9015';ctx.beginPath();area.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.closePath();ctx.fill();ctx.stroke();}for(const area of map.blockedAreas){ctx.strokeStyle='#ff0000';ctx.beginPath();area.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.closePath();ctx.stroke();}});
 await page.screenshot({path:out+'/alignment.png'});await page.evaluate(()=>document.getElementById('qa-map').remove());
 results.push(await page.evaluate(()=>{const g=towerFrontierGame;g.retrySameSetup();const retry=TowerFrontier.config.mapId;g.reset();g.chooseMap('beginner');const first=TowerFrontier.config.routes.length;g.chooseMap('autumn');return {retry,first,second:TowerFrontier.config.routes.length};}));
 assert.equal(results[1].retry,'autumn');assert.equal(results[1].first,1);assert.equal(results[1].second,1);
 const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,serviceWorkers:'block'}),phone=await context.newPage();phone.on('pageerror',e=>errors.push(e.message));
 await phone.goto('http://127.0.0.1:4173/td.html');await phone.waitForURL('**/td-mobile.html');const frame=await(await phone.locator('iframe').elementHandle()).contentFrame();await frame.locator('#td-map-choice').selectOption('autumn');await frame.waitForFunction(()=>towerFrontierGame.art.coreStatus('hunter').ready);
 await frame.locator('[data-profession="hunter"]').tap();await frame.locator('[data-faction="hunter"]').tap();await frame.locator('#td-start-expedition').tap();assert.equal(await frame.evaluate(()=>TowerFrontier.config.mapId),'autumn');
 await phone.screenshot({path:out+'/phone-portrait.png'});await phone.setViewportSize({width:844,height:390});await phone.screenshot({path:out+'/phone-landscape.png'});
 results.push(await page.evaluate(()=>{const g=towerFrontierGame,ns=TowerFrontier;g.paused=true;g.monsters=Array.from({length:180},(_,i)=>{const m=new ns.entities.Monster(i%5?'grunt':'brute',10,ns.config.routes[0]);m.setRouteDistance((i>>1)*12);return m;});const samples=[];for(let i=0;i<120;i++){const start=performance.now();g.updateMonsterConvoy(1/60);g.draw();samples.push(performance.now()-start);}samples.sort((a,b)=>a-b);return {stressEnemies:180,convoyAndDrawP95Ms:samples[114]};}));
 assert.deepEqual(errors,[]);fs.writeFileSync(out+'/results.json',JSON.stringify({results,errors},null,2));console.log(JSON.stringify({results,errors}));
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});


