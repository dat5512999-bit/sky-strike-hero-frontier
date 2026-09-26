'use strict';
// Real browser Canvas and production update/draw/RAF regression gate.
// Requires Playwright + Edge. Baseline mode replays the saved pre-fix renderer.
const {chromium}=require('playwright'),{pathToFileURL}=require('node:url');
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),out=path.join(root,'artifacts/naga-8d-v08554');
const baseline=process.argv.includes('--baseline');
(async()=>{
  fs.mkdirSync(out,{recursive:true});const browser=await chromium.launch({channel:'msedge',headless:true});
  try{
    const page=await browser.newPage({viewport:{width:1280,height:800},serviceWorkers:'block'}),errors=[];
    page.on('pageerror',e=>errors.push({name:e.name,message:e.message,stack:e.stack}));
    await page.goto(pathToFileURL(path.join(root,'td.html')).href);
    await page.waitForFunction(()=>globalThis.towerFrontierGame?.art.coreStatus('naga').ready);
    if(baseline)await page.addScriptTag({content:fs.readFileSync(path.join(out,'before/src/td/systems/HeroSkillVFX.js'),'utf8')});
    const frames=await page.evaluate(()=>{
      const ns=TowerFrontier,results=[],ctx=document.createElement('canvas').getContext('2d');
      for(const skill of ['Q','W','E','F']){
        const hero=new ns.entities.Hero(180,220);hero.chooseClass('naga');
        const guard=new ns.entities.CombatUnit('nagaTideguard',190,230);hero.synergy={game:{build:{combatUnits:()=>[guard]}}};
        const enemy=new ns.entities.Monster('brute',1);enemy.x=210;enemy.y=220;enemy.health=enemy.maxHealth=10000;
        if(skill==='Q')hero.castNova([enemy]);if(skill==='W')hero.castThunder([enemy]);if(skill==='E')hero.castSummon([]);if(skill==='F')ns.systems.HeroUltimateSystem.cast(hero,[enemy]);
        const v=hero.skillVfx.at(-1);let error=null,checked=0;
        for(let frame=0;frame<=120;frame++){
          v.age=v.duration*frame/120;
          try{ns.systems.HeroSkillVFX.draw(ctx,hero);ns.systems.HeroRoster.drawFields(ctx,hero);checked++;}
          catch(e){error={name:e.name,message:e.message,stack:e.stack,age:v.age};break;}
        }
        results.push({skill,checked,error,fault:hero.nagaVfxFault||hero.nagaFieldFault||null});
      }
      return results;
    });
    // Cast W through the actual HTML button, then verify the game's RAF timestamp.
    await page.evaluate(()=>{
      const g=towerFrontierGame;g.app.openFree({profession:'naga',faction:'naga',map:'beginner',difficulty:'standard'});g.paused=false;g.waves.countdown=999;
      g.ui.thunder.disabled=false;g.ui.thunder.click();
    });
    await page.waitForTimeout(200); // Let the first post-click RAF run (or fail).
    const first=await page.evaluate(()=>towerFrontierGame.lastTime);
    await page.waitForTimeout(350);
    const next=await page.evaluate(()=>({timestamp:towerFrontierGame.lastTime,fields:towerFrontierGame.hero.fields.length,fault:towerFrontierGame.hero.nagaVfxFault||null}));
    const runs=[];
    if(!baseline){
      for(const viewport of [{width:1280,height:800},{width:852,height:393}]){
        await page.setViewportSize(viewport);
        runs.push(await page.evaluate(()=>{
          const g=towerFrontierGame,ns=TowerFrontier;let casts=0,steps=0;
          g.paused=false;g.waves.countdown=999;g.hero.health=g.hero.maxHealth=100000;
          for(let i=0;i<210;i++)g.update(1/30,false); // Expire the initial button probe.
          for(const speed of [1,2,3])for(let round=0;round<5;round++){
            g.gameSpeed=speed;g.hero.novaCooldown=0;Object.assign(g.hero.skillCooldowns,{thunder:0,summon:0,ultimate:0});
            g.build.items=[new ns.entities.CombatUnit('nagaTideguard',g.hero.x+15,g.hero.y+10)];
            g.monsters=Array.from({length:54},(_,i)=>{const m=new ns.entities.Monster('brute',1);m.x=g.hero.x+20+i%9*2;m.y=g.hero.y+Math.floor(i/9)*2;m.health=m.maxHealth=100000;return m;});
            g.draw();g.updateUi();g.ui.skill.click();g.ui.thunder.click();g.ui.summon.click();g.ui.ultimate.click();
            for(const type of ['naga-tidegate','naga-maelstrom','naga-command','ultimate-naga'])if(!g.hero.skillVfx.some(v=>v.type===type))throw Error('Button did not cast '+type);
            if(!(g.hero.novaCooldown>0&&g.hero.skillCooldowns.thunder>0&&g.hero.skillCooldowns.summon>0&&g.hero.skillCooldowns.ultimate>0))throw Error('Cooldown missing after cast');
            casts+=4;
            // Same-frame drawing matters: low FPS alone can skip the faulty birth window.
            g.draw();
            for(let i=0;i<240;i++){g.update(1/30,false);g.draw();steps++;}
            if(g.hero.nagaVfxFault||g.hero.nagaFieldFault)throw Error('Failsafe used during normal play');
            if(g.hero.fields.length||g.hero.skillVfx.length)throw Error('Expired effects retained');
          }
          return {width:innerWidth,height:innerHeight,casts,steps,heroActive:g.hero.active,status:g.status};
        }));
      }
      await page.screenshot({path:path.join(out,'fixed-battle.png')});
    }
    const result={mode:baseline?'baseline':'fixed',browser:await browser.version(),frames,rafAdvanced:next.timestamp>first,first,next,runs,errors};
    fs.writeFileSync(path.join(out,baseline?'browser-before.json':'browser-after.json'),JSON.stringify(result,null,2)+'\n');
    console.log(JSON.stringify(result,null,2));
    if(baseline){assert.equal(frames.find(r=>r.skill==='W').error?.name,'IndexSizeError');assert.equal(result.rafAdvanced,false);assert.ok(errors.some(e=>e.name==='IndexSizeError'));}
    else{assert.deepEqual(errors,[]);assert.ok(result.rafAdvanced);assert.ok(frames.every(r=>r.checked===121&&!r.error&&!r.fault));assert.ok(runs.every(r=>r.heroActive&&r.status==='playing'));}
  }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
