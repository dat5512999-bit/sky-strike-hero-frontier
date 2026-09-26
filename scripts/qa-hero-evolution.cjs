'use strict';
// Production browser flow with accelerated wave fixtures; not a balance simulation.
const {chromium}=require('playwright'),{pathToFileURL}=require('node:url'),fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),out=path.join(root,'artifacts/evolution-completion');
(async()=>{console.log('Evolution QA PID '+process.pid);const browser=await chromium.launch({channel:'msedge',headless:true});try{
  const page=await browser.newPage({viewport:{width:1280,height:800},serviceWorkers:'block'}),errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.text().startsWith('EVOLUTION_QA'))console.log(m.text());});
  await page.goto(pathToFileURL(path.join(root,'td.html')).href);await page.waitForFunction(()=>globalThis.towerFrontierGame?.art.coreStatus('naga').ready);
  const flows=await page.evaluate(()=>{
    const ns=TowerFrontier,g=towerFrontierGame,results=[];g.app.openFree({profession:'naga',faction:'naga',map:'beginner',difficulty:'standard'});g.paused=false;
    const check=(ok,msg)=>{if(!ok)throw Error(msg);};
    function clearWave(wave){g.monsters=[];g.waves.wave=wave;g.waves.queue=[];g.waves.phase='clearing';g.waves.active=true;g.report.startWave(wave,{baseHealth:g.baseHealth,gold:g.economy.gold,lumber:g.economy.lumber,merit:g.economy.merit,army:g.build.towers()});g.update(.016);}
    g.hero.level=15;g.hero.invulnerable=999;g.economy.emblems=8;clearWave(20);
    for(const rank of [1,2]){console.log('EVOLUTION_QA trial '+rank);
      if(rank===2){clearWave(50);check(g.evolutionCamp&&g.status==='playing','50 wave must retain playable camp');check(g.ui.wave.textContent==='完成遠征','finish action missing');}
      check(g.shop.buy('evolution-stone',g.economy).ok,'stone purchase');check(g.checkpoints.read().hero.evolution.stones===1,'stone checkpoint');g.updateUi();g.ui.heroEvolve.click();
      const boss=g.monsters.find(m=>m.evolutionTrial&&m.active);check(boss,'trial button did not start');const wave=g.waves.wave,countdown=g.waves.countdown;
      for(let i=0;i<30;i++)g.update(1/30,false);check(g.waves.wave===wave&&g.waves.countdown===countdown,'trial advanced wave');
      check(g.ui.wave.disabled,'manual wave during trial');
      new ns.entities.Projectile(g.hero,boss,{damage:100000,attackType:'chaos',canHitAir:true}).hit(g.monsters,(m,s)=>g.onKill(m,s),(m,d,c,s)=>g.onHit(m,d,c,s));
      check(g.hero.evolution.rank===rank,'real death callback must complete trial');check(g.checkpoints.read().hero.evolution.rank===rank,'rank checkpoint');g.draw();
      results.push({rank,wave,checkpointRank:g.checkpoints.read().hero.evolution.rank});console.log('EVOLUTION_QA rank '+rank+' complete');
    }
    const snapshot=g.checkpoints.read();g.hero.evolution.rank=0;check(g.checkpoints.restore(g,snapshot),'checkpoint restore');g.updateUi();check(g.evolutionCamp&&g.status==='playing'&&g.hero.evolution.rank===2,'resume final camp');g.ui.heroEvolve.click();check(g.monsters.some(m=>m.evolutionTraining),'training button');g.draw();console.log('EVOLUTION_QA flow complete');return results;
  });
  await page.screenshot({path:path.join(out,'transcendent-camp.png')});
  const casts=[];
  for(const viewport of [{width:1280,height:800},{width:852,height:393}])for(const heroType of ['hunter','arcanist','rogue','chief','goblin','frostland','naga']){
    await page.setViewportSize(viewport);
    // A new battle page per hero matches real hero selection and bounds the
    // browser's queued Canvas work during accelerated synchronous frame replay.
    await page.goto(pathToFileURL(path.join(root,'td.html')).href);await page.waitForFunction(()=>globalThis.towerFrontierGame?.art.coreStatus('naga').ready);
    casts.push(await page.evaluate(type=>{
      const ns=TowerFrontier,g=towerFrontierGame,results=[];g.app.openFree({profession:'naga',faction:'naga',map:'beginner',difficulty:'standard'});g.evolutionCamp=false;g.waves.reset();g.waves.wave=20;g.waves.beginPreparation();g.waves.holdPreparation(true);g.status='playing';g.paused=false;
      for(const rank of [1,2])for(const slot of ['q','w','e','f']){
        console.log('EVOLUTION_QA cast '+innerWidth+' '+type+rank+slot);
        g.hero=new ns.entities.Hero(350,305);g.hero.chooseClass(type);g.hero.evolution.rank=rank;g.hero.synergy=g.synergy;g.hero.invulnerable=999;g.shop.hero=g.hero;g.summons=[];g.projectiles=[];g.effects=[];
        g.monsters=Array.from({length:20},(_,i)=>{const m=new ns.entities.Monster('brute',1,[{x:350,y:305},{x:800,y:305}]);m.setRouteDistance(30+i*2);m.speed=0;m.health=m.maxHealth=100000;return m;});
        g.updateUi();const button={q:g.ui.skill,w:g.ui.thunder,e:g.ui.summon,f:g.ui.ultimate}[slot];button.click();if(!g.hero.evolutionCast)throw Error('button failed '+type+rank+slot);
        g.draw();for(let frame=0;frame<24;frame++){g.update(1/30,false);g.draw();}
        if(g.hero.evolutionFault||g.hero.nagaFieldFault)throw Error('normal flow used failsafe '+type+rank+slot);results.push(type+rank+slot);
      }
      return{hero:type,viewport:[innerWidth,innerHeight],casts:results.length};
    },heroType));
  }
  const before=await page.evaluate(()=>towerFrontierGame.lastTime);await page.waitForTimeout(400);const after=await page.evaluate(()=>towerFrontierGame.lastTime);assert.ok(after>before,'RAF must continue');
  await page.evaluate(()=>{const g=towerFrontierGame;g.evolutionCamp=true;g.waves.complete=true;g.hero.evolution.trialStage=0;g.updateUi();});
  await page.locator('#td-wave-button').click();
  const final=await page.evaluate(()=>({status:towerFrontierGame.status,checkpoint:towerFrontierGame.checkpoints.read()}));assert.equal(final.status,'victory');assert.equal(final.checkpoint,null);assert.deepEqual(errors,[]);
  const report={scope:'accelerated wave20/50 fixtures, real UI/callback/Canvas/RAF, desktop and mobile viewport; not real-device or balance certification',flows,casts,rafAdvanced:after>before,final,errors};fs.writeFileSync(path.join(out,'browser-results.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
