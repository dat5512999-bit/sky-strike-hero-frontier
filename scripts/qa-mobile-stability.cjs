'use strict';
// Real mobile-shell entry and native Canvas in an isolated Edge profile.
// Desktop emulation is not physical iPhone/WebKit certification.
const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const out=path.resolve('artifacts/mobile-stability-v'+require('../package.json').version.replaceAll('.',''));
(async()=>{fs.mkdirSync(out,{recursive:true});const browser=await chromium.launch({channel:'msedge',headless:true});
const report={version:require('../package.json').version,scope:'Mobile shell, native Canvas, isolated Edge, DPR3/touch; not iPhone/WebKit or OS memory measurement.',errors:[],samples:[],rosters:[]};
try{
 const context=await browser.newContext({viewport:{width:852,height:393},deviceScaleFactor:3,isMobile:true,hasTouch:true,serviceWorkers:'block'}),host=await context.newPage();host.on('pageerror',e=>report.errors.push(e.message));
 await context.addInitScript(()=>{const Native=Image;globalThis.qaImages=[];globalThis.Image=function(...args){const image=new Native(...args);qaImages.push(new WeakRef(image));return image;};Image.prototype=Native.prototype;});
 await host.goto(process.env.MOBILE_STABILITY_QA_URL||'http://127.0.0.1:4173/td-mobile.html',{waitUntil:'load'});
 const frame=host.frames().find(f=>/td\.html/.test(f.url()));assert(frame,'real mobile shell must contain the game');
 await frame.waitForFunction(()=>globalThis.towerFrontierGame?.art.coreStatus('chief').ready);
 async function sample(label){const row=await frame.evaluate(label=>{const g=towerFrontierGame,loaded=qaImages.map(r=>r.deref()).filter(i=>i?.naturalWidth),unique=[...new Map(loaded.map(i=>[i.assetSrc||i.src,i])).values()];return {label,loadedImages:unique.length,fullRgbaEstimate:unique.reduce((s,i)=>s+i.naturalWidth*i.naturalHeight*4,0),previewCache:g.art.previewCache?.size||0,previewBytes:[...(g.art.previewCache?.values()||[])].reduce((s,p)=>s+p.source.width*p.source.height*4,0),store:g.art.assetStore.stats(),fault:g.runtimeFault,lastTime:g.lastTime};},label);report.samples.push(row);assert.ok(!row.fault);assert(row.previewCache<=32);assert(row.previewBytes<=2097152);console.log(label,JSON.stringify(row));}
 await sample('lobby');assert(report.samples[0].loadedImages<30);assert.equal(report.samples[0].previewCache,0);
 await frame.evaluate(()=>towerFrontierGame.app.store.switchTo('admin'));
 async function launch(type='chief',faction='wild',map='beginner'){
  await frame.evaluate(({type,faction,map})=>towerFrontierGame.app.openFree({profession:type,faction,map,difficulty:'standard'}),{type,faction,map});
  await frame.waitForFunction(type=>{const g=towerFrontierGame;return g.hero.classType===type&&g.profession.selected===type&&!g.pendingProfession&&g.ui.professionScreen.hidden;},type);
  await frame.evaluate(()=>{const g=towerFrontierGame;g.paused=true;g.waves.countdown=999;g.monsters=[];});
 }
 await launch();await host.waitForTimeout(300);await sample('first-battle');assert(report.samples.at(-1).loadedImages<40);
 const roster=await frame.evaluate(()=>({heroes:Object.keys(TowerFrontier.systems.HeroRoster.CLASSES),factions:Object.keys(TowerFrontier.systems.FactionSystem.FACTIONS),maps:Object.keys(TowerFrontier.maps.definitions)}));
 for(let i=0;i<roster.heroes.length;i++){
  const type=roster.heroes[i],faction=roster.factions[i%roster.factions.length];await launch(type,faction,roster.maps[i%roster.maps.length]);
  await frame.evaluate(()=>{const g=towerFrontierGame,ns=TowerFrontier,f=g.factions.current();g.build.items=[...f.units.map((type,i)=>new ns.entities.CombatUnit(type,100+i*45,320)),...f.buildings.map((type,i)=>new ns.entities.Building(type,100+i*55,220))];for(const item of g.build.items)g.art.preloadDeploy(item.kind,item.type);for(const rank of [1,2])g.hero.classType==='bull'?g.art.preloadBullEvolution(rank):g.art.preloadHeroEvolution(g.hero.classType,rank);g.draw();});
  await frame.waitForFunction(()=>{const s=towerFrontierGame.art.assetStore.stats();return s.active===0&&s.queued===0;});
  const row=await frame.evaluate(()=>{const g=towerFrontierGame,ns=TowerFrontier,c=document.createElement('canvas');c.width=720;c.height=720;const ctx=c.getContext('2d');let draws=0;for(const rank of [0,1,2])for(const state of ['idle','walk','attack','cast'])for(let frame=0;frame<4;frame++){g.hero.evolution.rank=rank;g.hero.state=state;g.hero.frame=frame;g.hero.animationTime=frame/4;g.hero.draw(ctx,g.art);draws++;}for(const item of g.build.items){for(const state of ['idle','attack']){item.state=state;item.draw(ctx,false,g.art);draws++;}}c.width=c.height=0;g.showCommands('build');g.updateUi();return {hero:g.hero.classType,faction:g.factions.selected,actors:g.build.items.length,draws,fault:g.runtimeFault};});
  assert.ok(!row.fault);report.rosters.push(row);
 }
 await sample('all-rosters');
 // A selected image can be discarded without replacing its reference and then
 // becomes ready again through the same public renderer/coreStatus contract.
 report.reload=await frame.evaluate(()=>{const g=towerFrontierGame,image=g.art.enemyActions.grunt,store=g.art.assetStore,record=store.records.get(image.assetSrc);store.release(record);return {same:store.image(image.assetSrc)===image,ready:image.ready};});assert.equal(report.reload.same,true);assert.equal(report.reload.ready,false);
 await frame.waitForFunction(()=>towerFrontierGame.art.enemyActions.grunt.ready);
 // An actual visible card, not a hidden fixture, receives one null context.
 await launch('chief','wild');await frame.evaluate(()=>{const g=towerFrontierGame;g.showCommands('build');g.updateUi();});await host.waitForTimeout(200);
 report.previewFailure=await frame.evaluate(()=>{const g=towerFrontierGame,b=g.ui.buildButtons.find(b=>!b.hidden&&b.getClientRects().length),key=b.dataset.buildKind+':'+b.dataset.buildType,create=document.createElement;delete b.dataset.previewReady;g.art.previewCache.delete(key);let injected=false;document.createElement=function(...args){const e=create.apply(this,args),get=e.getContext;if(args[0]==='canvas')e.getContext=function(...args){if(this.width===384&&!injected){injected=true;return null;}return get.apply(this,args);};return e;};try{g.art.preview(b,b.dataset.buildKind,b.dataset.buildType);}finally{document.createElement=create;}return {injected,fault:g.art.previewFault,gameFault:g.runtimeFault,lastTime:g.lastTime};});assert(report.previewFailure.injected);assert.ok(!report.previewFailure.gameFault);
 await host.waitForTimeout(250);assert(await frame.evaluate(t=>towerFrontierGame.lastTime>t,report.previewFailure.lastTime));
 await frame.evaluate(()=>{const g=towerFrontierGame;g.showCommands('orders');g.paused=false;g.baseHealth=g.maxBaseHealth=1e6;g.waves.countdown=999;g.gameSpeed=3;g.hero.invulnerable=999;g.monsters=Array.from({length:70},()=>{const m=new TowerFrontier.entities.Monster('brute',1);m.health=m.maxHealth=1e8;return m;});g.build.items=Array.from({length:24},(_,i)=>new TowerFrontier.entities.CombatUnit(['orc','centaur','shaman'][i%3],130+i%8*45,260+Math.floor(i/8)*50));});
 const cdp=await context.newCDPSession(host);await cdp.send('Emulation.setCPUThrottlingRate',{rate:4});
 for(let i=0;i<6;i++){await host.waitForTimeout(5000);await sample('stress-'+i);}
 assert(await frame.evaluate(()=>towerFrontierGame.status==='playing'));await host.screenshot({path:path.join(out,'mobile-battle.png')});
 // Idle eviction is deterministic at the policy boundary, not an iOS RAM claim.
 report.eviction=await frame.evaluate(()=>{const store=towerFrontierGame.art.assetStore,before=store.stats();for(const record of store.records.values())record.used-=40000;store.trim(true);return {before,after:store.stats()};});assert.equal(report.eviction.after.ready,0);
 await frame.waitForFunction(()=>towerFrontierGame.art.coreStatus('chief').ready);await frame.waitForFunction(()=>towerFrontierGame.art.assetStore.active===0);
 // Unexpected presentation errors retain RAF and require explicit recovery.
 await frame.evaluate(()=>{const g=towerFrontierGame,draw=g.draw;let once=true;g.draw=function(){if(once){once=false;throw Error('QA_RENDER_FAILURE');}return draw.apply(this,arguments);};});
 await frame.waitForFunction(()=>towerFrontierGame.runtimeFault?.code==='HF-RENDER');const first=await frame.evaluate(()=>towerFrontierGame.lastTime);await host.waitForTimeout(250);assert(await frame.evaluate(t=>towerFrontierGame.lastTime>t,first));
 await frame.locator('[data-runtime-retry]').click();await frame.waitForFunction(()=>!towerFrontierGame.runtimeFault);assert(await frame.locator('#td-runtime-recovery').isHidden());
 await frame.evaluate(()=>{const g=towerFrontierGame,update=g.update;let once=true;g.paused=false;g.update=function(...args){if(once){once=false;throw Error('QA_SIM_FAILURE');}return update.apply(this,args);};});
 await frame.waitForFunction(()=>towerFrontierGame.runtimeFault?.code==='HF-SIM');assert(await frame.locator('[data-runtime-retry]').isHidden());await frame.locator('[data-runtime-home]').click();await frame.waitForFunction(()=>!towerFrontierGame.runtimeFault&&!towerFrontierGame.app.root.hidden);
 assert.deepEqual(report.errors,[]);report.passed=true;console.log('PASS mobile stability: lazy assets, all rosters/evolution motions, bounded previews, null Canvas, eviction/reload, render recovery and simulation safe pause');
 await context.close();
}finally{await browser.close();fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(report,null,2));}
})().catch(e=>{console.error(e);process.exitCode=1;});
