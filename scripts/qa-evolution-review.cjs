'use strict';
const {chromium}=require('playwright'),fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const url=process.env.EVOLUTION_QA_URL||'http://127.0.0.1:4173/td.html';
(async()=>{const browser=await chromium.launch({channel:'msedge',headless:true});try{
  const page=await browser.newPage({viewport:{width:852,height:393},serviceWorkers:'block'}),errors=[],evolutionRequests=[];
  let releaseOptional;const optionalHeld=new Promise(resolve=>{releaseOptional=resolve;});
  await page.route('**/assets/td/bear-actions-v2.png',async route=>{await optionalHeld;await route.continue();});
  page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(r.url().includes('/evolution/'))evolutionRequests.push(r.url());});
  await page.goto(url,{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>globalThis.frontierApp);
  await page.waitForFunction(()=>Object.keys(TowerFrontier.systems.HeroRoster.CLASSES).every(t=>towerFrontierGame.art.coreStatus(t).ready));
  assert.equal(evolutionRequests.length,0,'entry readiness must not download optional evolution forms');
  const readiness=await page.evaluate(()=>({appReady:document.body.dataset.appReady,playReadyMs:Math.round(performance.now()),loadEventMs:performance.getEntriesByType('navigation')[0].loadEventEnd}));
  assert.equal(readiness.loadEventMs,0,'essential hero art and runtime can be ready while an optional image is pending');releaseOptional();
  const purchased=await page.evaluate(async()=>{
    const app=frontierApp,S=FrontierShop;app.store.switchTo('admin');const shop=await new S.SkinStore(S.catalog,new S.ProfileSkinAdapter(app.store)).init();await shop.buy('tigerstripe-vanguard');await shop.equip('tigerstripe-vanguard');app.applyCosmetics();return app.store.current().data['shop:state'];
  });
  await page.evaluate(()=>{
    const g=towerFrontierGame,E=TowerFrontier.systems.HeroEvolutionSystem;g.app.openFree({profession:'hunter',faction:'hunter',map:'beginner',difficulty:'standard'});g.waves.wave=20;g.waves.active=false;g.waves.beginPreparation();g.waves.holdPreparation(true);g.economy.emblems=10;g.hero.level=15;g.hero.maxHealth=g.hero.health=g.hero.healthAtLevel();g.hero.equipment.spear=3;E.purchase(g,g.economy);const m=g.monsters.find(m=>m.evolutionTrial);m.takeDamage(1e6,{owner:g.hero});g.onKill(m,g.hero);g.updateUi();
  });
  await page.waitForFunction(()=>towerFrontierGame.art.preloadHeroEvolution('hunter',1).ready);
  assert(await page.locator('.evolution-skin-note').textContent().then(t=>t.includes('商城造型')));
  const frozen=await page.evaluate(()=>{const g=towerFrontierGame,before=g.waves.preparationTimer;g.update(20);return {before,after:g.waves.preparationTimer,start:g.startWave(),paused:g.paused};});assert.equal(frozen.before,frozen.after);assert.equal(frozen.start,false);assert.equal(frozen.paused,false);
  await page.locator('.evolution-appearance-toggle').click();
  assert.equal(await page.evaluate(()=>TowerFrontier.systems.HeroAppearanceSystem.mode(towerFrontierGame)),'evolution');
  assert.equal(await page.evaluate(()=>frontierApp.store.current().data['shop:state']),purchased);
  const out=path.resolve(__dirname,'../artifacts/evolution-review');fs.mkdirSync(out,{recursive:true});
  for(const viewport of [{width:852,height:393},{width:393,height:852},{width:320,height:568},{width:1280,height:800}]){
    await page.setViewportSize(viewport);await page.screenshot({path:path.join(out,`review-${viewport.width}.png`)});
    const bounds=await page.locator('#td-evolution-notice').boundingBox();assert(bounds&&bounds.x>=0&&bounds.y>=0&&bounds.x+bounds.width<=viewport.width+1&&bounds.y+bounds.height<=viewport.height+1,'review stays in viewport');
    assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  }
  await page.locator('#td-evolution-notice > button').click();
  await page.locator('#td-menu-open').click();await page.locator('#td-menu-settings').click();await page.locator('#td-hero-appearance-settings').click();
  assert.equal(await page.evaluate(()=>TowerFrontier.systems.HeroAppearanceSystem.mode(towerFrontierGame)),'skin');
  await page.locator('#td-hero-appearance-settings').click();
  await page.reload({waitUntil:'domcontentloaded'});await page.waitForFunction(()=>globalThis.frontierApp);
  assert.equal(await page.evaluate(()=>towerFrontierGame.art.heroAppearance.hunter),'evolution');
  assert.equal(await page.evaluate(()=>frontierApp.store.current().data['shop:state']),purchased);
  // Force the next form to fail. The result must remain dismissible and report
  // its fallback rather than displaying a blank image or blocking entry.
  await page.route('**/evolution/*transcendent*',r=>r.abort());
  await page.waitForFunction(()=>towerFrontierGame.art.coreStatus('hunter').ready);
  await page.evaluate(()=>{const g=towerFrontierGame;g.app.openFree({profession:'hunter',faction:'hunter',map:'beginner',difficulty:'standard'});g.waves.holdPreparation(true);g.hero.evolution.rank=2;g.evolutionNotice={kind:'success'};g.updateUi();});
  await page.waitForFunction(()=>towerFrontierGame.art.preloadHeroEvolution('hunter',2).failed);
  assert((await page.locator('.evolution-portraits figcaption').last().textContent()).includes('暫用原貌'));
  await page.screenshot({path:path.join(out,'missing-art.png')});await page.locator('#td-evolution-notice > button').click();assert(await page.locator('#td-evolution-notice').isHidden());
  assert.deepEqual(errors,[]);fs.writeFileSync(path.join(out,'report.json'),JSON.stringify({readiness,initialEvolutionRequests:0,skinPurchaseUnchanged:true,reloadPreference:true,viewports:4,missingArtFallback:true,errors},null,2));console.log('PASS review: 4 viewports, real purchase, both toggles, profile reload, lazy entry, missing-art fallback');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
