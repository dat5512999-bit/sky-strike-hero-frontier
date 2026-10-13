'use strict';
const {chromium}=require('playwright'),{pathToFileURL}=require('node:url'),path=require('node:path'),fs=require('node:fs'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),out=path.join(root,'artifacts/evolution-hunter-naga');
(async()=>{fs.mkdirSync(out,{recursive:true});const browser=await chromium.launch({channel:'msedge',headless:true});try{
  const page=await browser.newPage({viewport:{width:1280,height:800},serviceWorkers:'block'}),errors=[],results=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(pathToFileURL(path.join(root,'td.html')).href);
  await page.waitForFunction(()=>globalThis.towerFrontierGame&&['hunter','naga'].every(type=>towerFrontierGame.art.coreStatus(type).ready));
  await page.waitForFunction(()=>['hunter','naga'].every(type=>[1,2].every(rank=>towerFrontierGame.art.preloadHeroEvolution(type,rank)?.ready))&&Object.values(towerFrontierGame.art.heroEvolutionImages).every(image=>image.ready));
  for(const viewport of [{width:1280,height:800},{width:852,height:393}]){
    await page.setViewportSize(viewport);
    for(const type of ['hunter','naga'])for(const rank of [0,1]){
      await page.evaluate(({type,rank})=>{const g=towerFrontierGame;g.app.openFree({profession:type,faction:'hunter',map:'beginner',difficulty:'standard'});g.paused=false;g.waves.reset();g.waves.wave=rank?50:20;g.waves.beginPreparation();g.waves.holdPreparation(true);g.monsters=[];g.report.current=null;g.economy.emblems=20;g.hero.evolution.rank=rank;g.hero.level=15;g.hero.health=g.hero.maxHealth=g.hero.healthAtLevel();g.hero.invulnerable=999;g.hero.selected=true;g.updateUi();},{type,rank});
      await page.locator('#td-shop-open').click();await page.locator('[data-shop-item="evolution-stone"]').click();
      const before=await page.evaluate(()=>{const g=towerFrontierGame,m=g.monsters.find(m=>m.active&&m.evolutionTrial);return{boss:m?.name,appearance:m?.trialAppearance,rank:g.hero.evolution.rank};});assert.equal(before.appearance,'fire-demon');assert.equal(before.rank,rank);
      const result=await page.evaluate(()=>{const g=towerFrontierGame,ns=TowerFrontier,m=g.monsters.find(m=>m.active&&m.evolutionTrial);new ns.entities.Projectile(g.hero,m,{damage:1e6,attackType:'chaos',canHitAir:true}).hit(g.monsters,(m,s)=>g.onKill(m,s),(m,d,c,s)=>g.onHit(m,d,c,s));g.hero.evolutionReveal=null;g.draw();return{rank:g.hero.evolution.rank,level:g.hero.level,xp:g.hero.xp,stone:g.hero.evolution.stones,saved:g.checkpoints.read()?.hero.level};});
      assert.equal(result.rank,rank+1);assert.equal(result.level,0);assert.equal(result.xp,0);assert.equal(result.stone,0);assert.equal(result.saved,0);assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
      await page.screenshot({path:path.join(out,`${type}-rank${rank+1}-${viewport.width}.png`)});
      await page.locator('#td-evolution-notice button').click();
      await page.evaluate(()=>{const g=towerFrontierGame;g.paused=true;g.camera.follow=true;g.camera.overview=false;g.camera.focus(g.hero.x,g.hero.y);g.draw();});
      await page.screenshot({path:path.join(out,`${type}-rank${rank+1}-${viewport.width}-battle.png`)});
      const restored=await page.evaluate(()=>{const g=towerFrontierGame,saved=g.checkpoints.read();g.hero.evolution.rank=0;g.hero.level=9;const ok=g.checkpoints.restore(g,saved);return{ok,rank:g.hero.evolution.rank,level:g.hero.level};});assert.equal(restored.ok,true);assert.equal(restored.rank,rank+1);assert.equal(restored.level,0);results.push({type,viewport,before,result,restored});
    }
  }
  await page.setViewportSize({width:1280,height:800});
  await page.evaluate(()=>{
    const ns=TowerFrontier,g=towerFrontierGame;g.paused=true;g.art.cosmeticEquipped={};const canvas=document.createElement('canvas');canvas.width=1080;canvas.height=740;const c=canvas.getContext('2d');c.fillStyle='#15272b';c.fillRect(0,0,1080,740);c.fillStyle='#f3d391';c.font='bold 24px sans-serif';c.fillText('王國雷恩／娜迦賽洛：遊戲實際造型（2 倍）',28,36);
    ['hunter','naga'].forEach((type,row)=>{for(let rank=0;rank<3;rank++){
      c.fillStyle='#ecdba9';c.font='20px sans-serif';c.fillText((row?'娜迦':'王國')+' · '+['初始','覺醒','超凡'][rank],80+rank*350,80+row*350);
      const h=new ns.entities.Hero(0,0);h.chooseClass(type);h.evolution.rank=rank;h.level=rank?0:1;c.save();c.translate(160+rank*350,282+row*350);c.scale(2,2);h.draw(c,g.art);c.restore();
    }});canvas.id='qa-evolution';canvas.style.cssText='position:absolute;top:0;left:0;z-index:100000;width:1080px;height:740px';document.body.append(canvas);
  });
  await page.locator('#qa-evolution').screenshot({path:path.join(out,'hunter-naga-in-game.png')});
  for(const type of ['hunter','naga'])for(const rank of [1,2]){
    await page.evaluate(({type,rank})=>{
      document.getElementById('qa-evolution')?.remove();document.getElementById('qa-motion')?.remove();const ns=TowerFrontier,g=towerFrontierGame,canvas=document.createElement('canvas');canvas.width=1000;canvas.height=1328;const c=canvas.getContext('2d');c.fillStyle='#15272b';c.fillRect(0,0,1000,1328);
      for(let row=0;row<8;row++)for(let frame=0;frame<4;frame++){
        const h=new ns.entities.Hero(0,0);h.chooseClass(type);h.evolution.rank=rank;h.state=['idle','walk','attack','cast'][row%4];h.frame=frame;h.animationTime=frame/3;h.facing=row>=4?Math.PI:0;h.equipment.spear=3;h.equipment.core='fire';h.attackTimer=h.state==='attack'?.2:0;
        if(row>=4){const armory=new ns.systems.ArmorySystem();for(const item of armory.compatibleItems(h)){armory.obtain(item.id);if(!armory.equip(item.id,h).ok)throw Error('equipment QA failed');}}
        c.fillStyle='#dbc69b';c.font='14px sans-serif';c.fillText(`${type} ${h.state} ${frame} ${row>=4?'←':'→'}`,frame*250+20,row*166+20);c.save();c.translate(frame*250+120,row*166+125);h.draw(c,g.art);c.restore();
      }canvas.id='qa-motion';canvas.style.cssText='position:absolute;top:0;left:0;z-index:100000;width:1000px;height:1328px';document.body.append(canvas);
    },{type,rank});
    await page.locator('#qa-motion').screenshot({path:path.join(out,`${type}-rank${rank}-motion.png`)});
  }
  const fallbacks=await page.evaluate(async()=>{
    const ns=TowerFrontier,art=towerFrontierGame.art,c=document.createElement('canvas').getContext('2d'),draw=c.drawImage.bind(c),checks=[];let sources=[];c.drawImage=(image,...args)=>{sources.push(image.assetSrc||image.src);draw(image,...args);};
    for(const type of ['hunter','naga']){
      const h=new ns.entities.Hero(0,0);h.chooseClass(type);h.evolution.rank=2;const form=art.preloadHeroEvolution(type,2);form.ready=false;form.failed=true;sources=[];art.drawHero(c,h);checks.push({type,case:'failed',sources:sources.slice(),ok:sources.length>0&&sources.every(s=>!s.includes('/evolution/'))});form.ready=true;form.failed=false;
      art.cosmeticEquipped={['hero:'+type]:type==='hunter'?'tigerstripe-vanguard':'abyss-response'};art.drawHero(c,h);
      await Promise.all(Object.values(art.crossworldSkinImages||{}).map(image=>image.ready?Promise.resolve():new Promise((resolve,reject)=>{image.addEventListener('load',resolve,{once:true});image.addEventListener('error',reject,{once:true});})));
      sources=[];art.drawHero(c,h);checks.push({type,case:'paid skin',sources:sources.slice(),ok:sources.some(s=>s.includes('/shop/'))&&sources.every(s=>!s.includes('/evolution/'))});art.cosmeticEquipped={};
    }return checks;
  });assert(fallbacks.every(result=>result.ok));assert.deepEqual(errors,[]);
  fs.writeFileSync(path.join(out,'report.json'),JSON.stringify({results,fallbacks,errors,scope:'Real shop buttons and kill callbacks, two heroes x two ranks x two viewports, Lv0 checkpoint, 64 poses and mirrors with weapon Lv3, failed asset and paid-skin draw paths. Accelerated wave fixture, not balance or physical iPhone certification.'},null,2));
  console.log('PASS hunter/naga: 8 shop-to-evolution flows, desktop/mobile, real sprites, paid skins, missing assets and all motions');
}finally{await browser.close();}})().catch(error=>{console.error(error);process.exitCode=1;});
