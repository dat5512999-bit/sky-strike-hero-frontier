'use strict';
const {chromium}=require('playwright'),{pathToFileURL}=require('node:url'),path=require('node:path'),fs=require('node:fs'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),out=path.join(root,'artifacts/evolution-stone');
(async()=>{fs.mkdirSync(out,{recursive:true});const browser=await chromium.launch({channel:'msedge',headless:true});try{
  const page=await browser.newPage({viewport:{width:1280,height:800},serviceWorkers:'block'}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(pathToFileURL(path.join(root,'td.html')).href);await page.waitForFunction(()=>globalThis.towerFrontierGame?.art.coreStatus('hunter').ready);
  const results=[];
  for(const viewport of [{width:1280,height:800},{width:852,height:393}]){
    await page.setViewportSize(viewport);
    await page.evaluate(()=>{
      const g=towerFrontierGame;g.app.openFree({profession:'hunter',faction:'hunter',map:'beginner',difficulty:'standard'});g.waves.reset();g.waves.wave=20;g.waves.beginPreparation();g.waves.holdPreparation(true);g.monsters=[];g.report.current=null;g.economy.emblems=8;g.hero.level=15;g.hero.maxHealth=g.hero.healthAtLevel();g.hero.health=g.hero.maxHealth;g.hero.invulnerable=999;g.updateUi();
    });
    await page.locator('#td-shop-open').click();await page.locator('[data-shop-item="evolution-stone"]').click();
    assert(await page.locator('#td-shop-screen').isHidden());
    const trial=await page.evaluate(()=>{const g=towerFrontierGame,b=g.monsters.find(m=>m.evolutionTrial);return{boss:!!b,rank:g.hero.evolution.rank,stones:g.hero.evolution.stones,emblems:g.economy.emblems,held:g.waves.preparationHeld,paused:g.paused};});
    assert(trial.boss&&trial.held&&!trial.paused);assert.equal(trial.rank,0);assert.equal(trial.stones,1);assert.equal(trial.emblems,5);
    assert(await page.locator('#td-evolution-notice').isVisible());await page.screenshot({path:path.join(out,'trial-'+viewport.width+'.png')});
    await page.evaluate(()=>{const g=towerFrontierGame;g.hero.active=false;TowerFrontier.systems.HeroEvolutionSystem.cancelTrial(g);g.hero.active=true;g.updateUi();});
    await page.getByRole('button',{name:'免費挑戰 BOSS',exact:true}).click();
    const result=await page.evaluate(()=>{
      const ns=TowerFrontier,g=towerFrontierGame,b=g.monsters.find(m=>m.active&&m.evolutionTrial);
      new ns.entities.Projectile(g.hero,b,{damage:100000,attackType:'chaos',canHitAir:true}).hit(g.monsters,(m,s)=>g.onKill(m,s),(m,d,c,s)=>g.onHit(m,d,c,s));g.draw();
      return{rank:g.hero.evolution.rank,level:g.hero.level,xp:g.hero.xp,stones:g.hero.evolution.stones,emblems:g.economy.emblems,save:g.checkpoints.read()?.hero.level,report:g.hero.evolution.lastResult};
    });
    assert.equal(result.rank,1);assert.equal(result.level,0);assert.equal(result.xp,0);assert.equal(result.save,0);assert.equal(result.stones,0);assert.equal(result.emblems,5);assert(result.report.after.damage>=result.report.before.damage);
    assert.match(await page.locator('#td-evolution-notice').innerText(),/進化完成 · Lv.0/);await page.screenshot({path:path.join(out,'success-'+viewport.width+'.png')});
    assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));results.push({viewport,trial,result});await page.getByRole('button',{name:'知道了',exact:true}).click();
  }
  await page.setViewportSize({width:1280,height:800});
  // Render actual production heroes at all three ranks, using their real skins and animation renderers.
  await page.evaluate(()=>{const g=towerFrontierGame;g.paused=true;Object.keys(TowerFrontier.systems.HeroRoster.CLASSES).forEach(type=>g.art.coreStatus(type));});
  await page.waitForFunction(()=>Object.keys(TowerFrontier.systems.HeroRoster.CLASSES).every(type=>towerFrontierGame.art.coreStatus(type).ready));
  await page.evaluate(()=>{
    const ns=TowerFrontier,g=towerFrontierGame,types=Object.keys(ns.systems.HeroRoster.CLASSES),canvas=document.createElement('canvas');canvas.width=1000;canvas.height=types.length*150+55;const ctx=canvas.getContext('2d');ctx.fillStyle='#142a30';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.fillStyle='#f2d898';ctx.font='bold 22px sans-serif';['初始','覺醒 · Lv.0','超凡 · Lv.0'].forEach((label,i)=>ctx.fillText(label,290+i*270,33));
    types.forEach((type,row)=>{ctx.fillStyle='#e5e8d9';ctx.font='16px sans-serif';ctx.fillText(ns.systems.HeroRoster.get(type).name,14,row*150+123);for(let rank=0;rank<3;rank++){const hero=new ns.entities.Hero(335+rank*270,row*150+128);hero.chooseClass(type);hero.evolution.rank=rank;hero.level=rank?0:1;hero.frame=0;hero.draw(ctx,g.art);}});canvas.id='qa-evolution-sheet';canvas.style.cssText='position:absolute;left:0;top:0;z-index:100000;width:1000px;height:'+canvas.height+'px';document.body.append(canvas);
  });
  await page.locator('#qa-evolution-sheet').screenshot({path:path.join(out,'hero-evolution-comparison.png')});
  assert.deepEqual(errors,[]);fs.writeFileSync(path.join(out,'report.json'),JSON.stringify({results,errors,scope:'Real shop clicks, fail/retry, real kill callback, Lv0 save, desktop/mobile viewport; accelerated wave fixture, not balance certification'},null,2));console.log('PASS evolution stone UI flow / failure-retry / Lv0 checkpoint / 11-hero comparison');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
