'use strict';
// Controlled combat audit, not a balance patch or human playtest. No damage,
// boss-health or invulnerability overrides. Each trial ends at first death.
const {chromium}=require('playwright'),fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const base=process.env.EVOLUTION_QA_URL||'http://127.0.0.1:4173/td.html';
(async()=>{const browser=await chromium.launch({channel:'msedge',headless:true});try{
  const page=await browser.newPage({serviceWorkers:'block'}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(base,{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>globalThis.frontierApp);
  await page.evaluate(()=>frontierApp.store.switchTo('admin'));
  await page.waitForFunction(()=>Object.keys(TowerFrontier.systems.HeroRoster.CLASSES).every(t=>towerFrontierGame.art.coreStatus(t).ready));
  const results=await page.evaluate(()=>{
    const g=towerFrontierGame,ns=TowerFrontier,E=ns.systems.HeroEvolutionSystem,results=[],random=Math.random;
    try{for(const difficulty of ['standard','calamity'])for(const type of Object.keys(ns.systems.HeroRoster.CLASSES))for(const rank of [0,1])for(const policy of ['auto-only','skills-and-dodge']){
      let seed=20261013;Math.random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
      g.app.openFree({profession:type,faction:'hunter',map:'beginner',difficulty});
      if(g.hero.classType!==type||g.profession.selected!==type)throw Error('wrong hero fixture '+type);
      g.waves.reset();g.waves.wave=rank?50:20;g.waves.beginPreparation();g.waves.holdPreparation(true);g.paused=false;g.monsters=[];
      const h=g.hero;h.level=15;h.equipment.spear=3;h.evolution.rank=rank;h.health=h.maxHealth=h.displayHealth=h.healthAtLevel();h.x=350;h.y=305;h.setTarget(h.x,h.y);g.synergy.update(0);
      g.economy.emblems=20;if(!E.purchase(g,g.economy).ok)throw Error('purchase failed');
      const boss=g.monsters.find(m=>m.evolutionTrial),initialHealth=boss.maxHealth,heroHealth=h.health,heroDamage=h.combatConfig().damage;
      const counterattacks=g.heroDamageEnabled();if(difficulty==='calamity'&&!counterattacks)throw Error('calamity audit must allow counterattacks');
      let seconds=0,casts=0,moves=0,warnings=0,warningAge=0,wasWarning=false,hits=0,minHealth=h.health;
      const onHit=g.onAllyHit;g.onAllyHit=function(...args){hits++;return onHit.apply(this,args);};
      try{for(let tick=0;tick<4800&&boss.active&&h.active;tick++){
        const windup=boss.abilityWindup>0;if(windup&&!wasWarning){warnings++;warningAge=0;}if(windup)warningAge+=.05;wasWarning=windup;
        if(policy==='skills-and-dodge'&&tick%5===0){
          const evade=windup&&warningAge>=.3,distance=evade?boss.abilityRadius+35:Math.min(76,h.combatConfig().range*.75),x=boss.x-distance,y=boss.y;
          if(Math.hypot(h.targetX-x,h.targetY-y)>8){h.setTarget(x,y);moves++;}
          // One skill input per 250 ms, with cast recovery respected; failed
          // ally-dependent skills are skipped, not counted as successful casts.
          if(!windup&&!h.moveOrder&&h.castTimer<=0){
            const slots=[['q',()=>h.novaCooldown,()=>g.castNova()],['w',()=>h.skillCooldowns.thunder,()=>g.castHeroSkill('thunder')],['e',()=>h.skillCooldowns.summon,()=>g.castHeroSkill('summon')],['f',()=>h.skillCooldowns.ultimate,()=>g.castUltimate()]];
            for(const [,cooldown,cast] of slots)if(cooldown()<=0){cast();if(cooldown()>0){casts++;break;}}
          }
        }
        g.update(.05,false);seconds+=.05;minHealth=Math.min(minHealth,h.health);
      }}finally{g.onAllyHit=onHit;}
      results.push({type,difficulty,counterattacks,trial:rank+1,policy,result:E.rank(h)>rank?'victory':!h.active?'defeat':'timeout',seconds:+seconds.toFixed(2),deaths:h.active?0:1,casts,moves,warnings,hits,minHealth,heroHealth,heroDamage:+heroDamage.toFixed(2),bossHealth:initialHealth,bossRemaining:Math.max(0,Math.round(boss.health)),invulnerability:h.invulnerable});
      g.paused=true;
    }}finally{Math.random=random;g.paused=true;}return results;
  });
  assert.equal(results.length,88);assert.deepEqual(errors,[]);assert(results.every(r=>r.bossHealth>0&&r.seconds>0));
  const report={version:require('../package.json').version,fixture:'11 heroes × 2 trials × 2 policies × standard/calamity; Lv15, weapon Lv3, no army/armory; beginner map; seed 20261013; rank1 uses base awakened growth (no prior-level powerFloor); dt50ms, cap240s, first-death stop. AI 300ms warning reaction and at most one skill per250ms; not human/mobile certification. Standard retains map hero immunity; calamity enables real counterattacks. No balance overrides.',results,errors};
  const out=path.resolve(__dirname,'../artifacts/evolution-balance');fs.mkdirSync(out,{recursive:true});fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(report,null,2));
  console.table(results.map(({type,difficulty,trial,policy,result,seconds,casts,moves,hits})=>({type,difficulty,trial,policy,result,seconds,casts,moves,hits})));
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
