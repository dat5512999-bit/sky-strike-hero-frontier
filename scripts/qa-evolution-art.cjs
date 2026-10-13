'use strict';
const {chromium}=require('playwright'),{pathToFileURL}=require('node:url'),path=require('node:path'),fs=require('node:fs'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),out=path.join(root,'artifacts/evolution-art');
(async()=>{fs.mkdirSync(out,{recursive:true});const browser=await chromium.launch({channel:'msedge',headless:true});try{
  const page=await browser.newPage({viewport:{width:1280,height:800},serviceWorkers:'block'}),errors=[],results=[];page.on('pageerror',error=>errors.push(error.message));
  await page.goto(pathToFileURL(path.join(root,'td.html')).href);
  await page.waitForFunction(()=>globalThis.towerFrontierGame?.art.coreStatus('bull').ready);
  await page.waitForFunction(()=>Object.values(TowerFrontier.systems.BullEvolutionAtlas).every(form=>towerFrontierGame.art.bullWargodImages[form.path]?.ready));
  for(const viewport of [{width:1280,height:800},{width:852,height:393}]){
    await page.setViewportSize(viewport);
    for(const rank of [0,1]){
      await page.evaluate(rank=>{
        const g=towerFrontierGame;g.app.openFree({profession:'bull',faction:'hunter',map:'beginner',difficulty:'standard'});g.paused=false;g.waves.reset();g.waves.wave=rank?50:20;g.waves.beginPreparation();g.waves.holdPreparation(true);g.monsters=[];g.report.current=null;g.economy.emblems=20;g.hero.evolution.rank=rank;g.hero.level=15;g.hero.health=g.hero.maxHealth=g.hero.healthAtLevel();g.hero.invulnerable=999;g.hero.selected=true;g.updateUi();
      },rank);
      await page.locator('#td-shop-open').click();await page.locator('[data-shop-item="evolution-stone"]').click();
      const before=await page.evaluate(()=>{const g=towerFrontierGame,m=g.monsters.find(m=>m.active&&m.evolutionTrial);return{boss:m.name,appearance:m.trialAppearance,rank:g.hero.evolution.rank,paused:g.paused};});assert.equal(before.appearance,'fire-demon');assert.equal(before.rank,rank);assert.equal(before.paused,false);
      await page.screenshot({path:path.join(out,`fire-demon-rank${rank+1}-${viewport.width}.png`)});
      const result=await page.evaluate(()=>{const g=towerFrontierGame,ns=TowerFrontier,m=g.monsters.find(m=>m.active&&m.evolutionTrial);new ns.entities.Projectile(g.hero,m,{damage:1e6,attackType:'chaos',canHitAir:true}).hit(g.monsters,(m,s)=>g.onKill(m,s),(m,d,c,s)=>g.onHit(m,d,c,s));g.hero.evolutionReveal=null;g.draw();return{rank:g.hero.evolution.rank,level:g.hero.level,xp:g.hero.xp,stone:g.hero.evolution.stones,saved:g.checkpoints.read()?.hero.level};});
      assert.equal(result.rank,rank+1);assert.equal(result.level,0);assert.equal(result.xp,0);assert.equal(result.stone,0);assert.equal(result.saved,0);await page.screenshot({path:path.join(out,`evolved-rank${rank+1}-${viewport.width}.png`)});
      assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));results.push({viewport,before,result});
    }
  }
  await page.setViewportSize({width:1280,height:800});
  // Screenshots of actual production rendering, not the generated concept board.
  await page.evaluate(()=>{
    const ns=TowerFrontier,g=towerFrontierGame;g.paused=true;
    const canvas=document.createElement('canvas');canvas.width=1000;canvas.height=390;const c=canvas.getContext('2d');c.fillStyle='#15272b';c.fillRect(0,0,1000,390);c.fillStyle='#f3d391';c.font='bold 24px sans-serif';c.fillText('戰牛：遊戲實際造型（放大 2 倍）',28,35);
    for(let rank=0;rank<3;rank++){
      c.fillStyle='#ecdba9';c.font='20px sans-serif';c.fillText(['初始','覺醒・毛皮鍛甲','超凡・戰神重甲'][rank],80+rank*320,78);
      const h=new ns.entities.Hero(0,0);h.chooseClass('bull');h.evolution.rank=rank;h.level=rank?0:1;
      c.save();c.translate(165+rank*320,292);c.scale(2,2);h.draw(c,g.art);c.restore();
    }
    canvas.id='qa-bull-evolution';canvas.style.cssText='position:absolute;top:0;left:0;z-index:100000;width:1000px;height:390px';document.body.append(canvas);
  });
  await page.locator('#qa-bull-evolution').screenshot({path:path.join(out,'bull-evolution-in-game.png')});
  for(const rank of [1,2]){
    await page.evaluate(rank=>{
      document.getElementById('qa-bull-evolution')?.remove();document.getElementById('qa-bull-motion')?.remove();const ns=TowerFrontier,g=towerFrontierGame,canvas=document.createElement('canvas');canvas.width=1000;canvas.height=1660;const c=canvas.getContext('2d');c.fillStyle='#15272b';c.fillRect(0,0,canvas.width,canvas.height);
      const states=['idle','walk','attack','cast','hit'];for(let row=0;row<10;row++)for(let frame=0;frame<4;frame++){
        const h=new ns.entities.Hero(0,0);h.chooseClass('bull');h.evolution.rank=rank;h.level=0;h.state=states[row%5];h.frame=frame;h.animationTime=frame/3;h.facing=row>=5?Math.PI:0;h.equipment.spear=3;h.equipment.core='fire';
        c.fillStyle='#dbc69b';c.font='14px sans-serif';c.fillText(`${h.state} ${frame} ${row>=5?'←':'→'}`,frame*250+30,row*166+20);c.save();c.translate(frame*250+120,row*166+137);c.scale(1.15,1.15);h.draw(c,g.art);c.restore();
      }
      canvas.id='qa-bull-motion';canvas.style.cssText='position:absolute;top:0;left:0;z-index:100000;width:1000px;height:1660px';document.body.append(canvas);
    },rank);
    await page.locator('#qa-bull-motion').screenshot({path:path.join(out,`bull-rank${rank}-motion.png`)});
  }
  assert.deepEqual(errors,[]);fs.writeFileSync(path.join(out,'report.json'),JSON.stringify({results,errors,scope:'Real shop buttons, fire-demon spawn, real kill callback, both bull ranks, Lv0 save; all motion poses and mirrors with max weapon/core. Accelerated wave fixture, not balance certification.'},null,2));console.log('PASS production bull evolution art / fire-demon trials / desktop and mobile / all motion poses');
}finally{await browser.close();}})().catch(error=>{console.error(error);process.exitCode=1;});
