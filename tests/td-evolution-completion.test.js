'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {load,game,enemy}=require('./helpers/td-runtime.cjs');
const {strictCanvas}=require('./helpers/strict-canvas.cjs');
function setup(type='naga',rank=1){const {ns}=load(),g=game(ns);g.hero.chooseClass(type);g.hero.evolution.rank=rank;g.hero.synergy=g.synergy;g.waves=new ns.systems.WaveSystem();g.status='playing';g.profession.selected=type;g.updateUi=()=>{};g.onHit=()=>{};g.onKill=()=>{};g.monsters=Array.from({length:18},(_,i)=>{const m=enemy(ns,140+i%6*4,100+Math.floor(i/6)*4,'brute',100000);m.setRouteDistance(m.x);return m;});return{ns,g,E:ns.systems.HeroEvolutionSystem,C:ns.systems.HeroEvolutionCombat};}
function cast(ns,g,slot){return ns.systems.HeroEvolutionSystem.cast(g.hero,slot,{game:g,monsters:g.monsters,summons:g.summons,onHit:g.onHit,onKill:g.onKill});}
for(const type of ['hunter','arcanist','rogue','chief','goblin','frostland','naga'])for(const rank of [1,2]){
  test(type+' rank '+rank+' Q/W/E/F execute, render birth-to-expiry, and clean transient state',()=>{
    for(const slot of ['q','w','e','f']){
      const {ns,g,E}=setup(type,rank),canvas=strictCanvas(),before=g.monsters.reduce((sum,m)=>sum+m.health,0);
      assert.equal(cast(ns,g,slot),true,slot);
      assert.equal(cast(ns,g,slot),false,'cooldown prevents recast');
      const art={load:()=>({ready:true,width:1254,height:1254}),drawCombatUnit(){}};
      for(let frame=0;frame<=120;frame++){
        if(g.hero.evolutionCast)g.hero.evolutionCast.time=g.hero.evolutionCast.max*(1-frame/120);
        ns.systems.HeroEvolutionPresentation.draw(canvas.ctx,art,g.hero);
        ns.systems.HeroRoster.drawFields(canvas.ctx,g.hero);
        for(const s of g.summons)s.draw(canvas.ctx,art);
        assert.equal(g.hero.evolutionFault,undefined,slot+' frame '+frame);
        assert.equal(canvas.depth,0);
      }
      for(let i=0;i<160;i++){
        E.update(g.hero,.1);ns.systems.HeroRoster.updateFields(g.hero,.1,g.monsters,g.onKill,g.onHit);
        for(const s of g.summons)s.update(.1,g.monsters,g.projectiles);
        for(const p of g.projectiles)p.update(.1,g.monsters,g.onKill,g.onHit);
        g.projectiles=g.projectiles.filter(p=>p.active);
      }
      if(!(type==='chief'&&slot==='w'))assert.ok(g.monsters.reduce((sum,m)=>sum+m.health,0)<before,slot+' must produce real damage');
      assert.equal(g.hero.fields.length,0);assert.ok(!g.hero.evolutionPending?.length);assert.ok(g.summons.every(s=>!s.active));
      assert.equal(g.hero.evolutionFault,undefined);
    }
  });
  test(type+' rank '+rank+' real trial kill preserves Lv15 power, speed, health and equipment',()=>{
    const {ns,g,E}=setup(type,rank-1);g.monsters=[];g.waves.wave=rank===1?20:50;g.waves.beginPreparation();g.hero.evolution.stones=1;g.hero.level=15;g.hero.maxHealth=320;g.hero.equipment.spear=3;
    const power=g.hero.skillPower(),interval=g.hero.combatConfig().interval,health=g.hero.maxHealth;
    assert.equal(E.startTrial(g).ok,true);const boss=g.monsters[0];assert.equal(E.completeTrial(g,boss),false);
    for(const source of [undefined,{}, {owner:{}}, {owner:new ns.entities.Hero(0,0)}]){const hp=boss.health;boss.takeDamage(999999,source);assert.equal(boss.health,hp);}
    g.waves.update(90,g.monsters);assert.equal(g.waves.wave,rank===1?20:50);
    assert.equal(g.startWave(),false,'manual next wave blocked');
    boss.health=10;new ns.systems.EnemyCombatSystem().phase(boss,g.monsters,{});assert.equal(g.monsters.length,1,'no normal boss adds');
    boss.update(10,g.hero,[]);assert.equal(boss.active,true,'stationary boss cannot leak');
    boss.takeDamage(99999,{owner:g.hero});assert.equal(E.completeTrial(g,boss),true);
    assert.equal(g.hero.level,1);assert.equal(g.hero.evolution.rank,rank);assert.equal(g.hero.evolution.stones,0);assert.equal(g.hero.equipment.spear,3);
    assert.ok(g.hero.skillPower()>=power);assert.ok(g.hero.combatConfig().interval<=interval);assert.ok(g.hero.maxHealth>=health);assert.equal(g.waves.preparationHeld,false);
    assert.equal(E.completeTrial(g,boss),false,'completion idempotent');
  });
}
test('marks apply owner-specific damage, expire, and spread only on eligible deaths',()=>{
  for(const type of ['hunter','naga','rogue']){
    const {g,C}=setup(type,2),[a,b]=g.monsters;C.mark(a,g.hero,2);
    assert.ok(C.damageRate(a,{owner:g.hero,evolutionSkill:true})>1);assert.equal(C.damageRate(a,{owner:{}}),1);
    a.active=false;C.onDeath(g.hero,a,g.monsters);assert.ok(C.marked(b,g.hero));
    b.update(7,null,[]);assert.equal(b.evolutionMark,0);assert.equal(b.evolutionMarkOwner,null);
  }
});
test('chief gains solo damage/haste, stronger low-health aura and temporary boss damage',()=>{
  const {ns,g,E,C}=setup('chief',2),before=g.hero.combatConfig();assert.equal(cast(ns,g,'w'),true);
  const after=g.hero.combatConfig();assert.ok(after.damage>before.damage);assert.ok(after.interval<before.interval);
  g.hero.health=g.hero.maxHealth*.25;assert.ok(g.hero.combatConfig().damage>after.damage);
  cast(ns,g,'e');assert.equal(C.damageRate({combatRole:'boss'},{owner:g.hero}),1.65);
  E.update(g.hero,11);assert.equal(g.hero.combatConfig().damage,before.damage);assert.equal(C.damageRate({combatRole:'boss'},{owner:g.hero}),1);
});
test('arcanist controlled targets take more damage and rank2 echoes resolve later',()=>{
  const {ns,g,E,C}=setup('arcanist',2),m=g.monsters[0];assert.equal(C.damageRate(m,{owner:g.hero}),1);m.applySlow(.5,3);assert.equal(C.damageRate(m,{owner:g.hero}),1.35);
  cast(ns,g,'w');const hp=m.health;assert.ok(g.hero.evolutionPending.length);E.update(g.hero,.25);assert.ok(m.health<hp);assert.equal(g.hero.evolutionPending.length,0);
});
test('goblin energy caps at100 and discharges once; empty cast keeps energy/cooldown',()=>{
  const {ns,g}=setup('goblin',2);cast(ns,g,'q');cast(ns,g,'w');assert.equal(g.hero.evolution.energy,100);
  const before=g.monsters[0].health;cast(ns,g,'e');assert.equal(g.hero.evolution.energy,0);assert.ok(before-g.monsters[0].health>500);
  g.hero.evolution.energy=60;g.hero.skillCooldowns.summon=0;g.monsters=[];assert.equal(cast(ns,g,'e'),false);assert.equal(g.hero.evolution.energy,60);assert.equal(g.hero.skillCooldowns.summon,0);
});
test('frost marked shatter has bonus and frozen death spreads bounded cold',()=>{
  const {ns,g,C}=setup('frostland',2),[a,b]=g.monsters;C.mark(a,g.hero);ns.systems.FrostStatusSystem.apply(a,500);
  assert.equal(C.damageRate(a,{owner:g.hero,shatter:1}),1.3);a.active=false;C.onDeath(g.hero,a,g.monsters);assert.ok(b.frostStatus.amount>0);assert.ok(g.monsters.filter(m=>m.frostStatus?.amount>0).length<=7);
});
test('evolved fields bound background catchup and isolate a broken pulse',()=>{
  for(const type of ['hunter','naga']){const {ns,g}=setup(type,2);cast(ns,g,'w');let hits=0;ns.systems.HeroRoster.updateFields(g.hero,60,g.monsters,()=>{},()=>hits++);assert.ok(hits>0&&hits<=12);assert.equal(g.hero.fields.length,0);
    g.hero.skillCooldowns.thunder=0;cast(ns,g,'w');ns.systems.HeroEvolutionCombat.pulse=()=>{throw Error('injected pulse');};assert.doesNotThrow(()=>ns.systems.HeroRoster.updateFields(g.hero,.5,g.monsters));assert.equal(g.hero.fields.length,0);assert.match(g.hero.evolutionFault,/injected/);
  }
});
test('naga dedicated trident crest and isolated Canvas fault keep state balanced',()=>{
  const {ns,g}=setup('naga',2),c=strictCanvas();assert.equal(ns.systems.HeroEvolutionPresentation.draw(c.ctx,null,g.hero),true);assert.ok(c.calls.some(x=>x[0]==='lineTo'));assert.equal(c.calls.some(x=>x[0]==='drawImage'),false);
  c.ctx.arc=()=>{throw Error('injected Canvas');};assert.doesNotThrow(()=>ns.systems.HeroEvolutionPresentation.draw(c.ctx,null,g.hero));assert.equal(c.depth,0);assert.match(g.hero.evolutionFault,/injected/);
  g.hero.evolutionFault=null;assert.equal(ns.systems.HeroEvolutionPresentation.draw(c.ctx,null,g.hero),false);assert.equal(g.hero.evolutionFault,null,'a failed renderer must not throw and notify every frame');
});
test('failed trial retains stone and restores preexisting preparation hold',()=>{
  const {g,E}=setup('naga',0);g.monsters=[];g.waves.wave=20;g.waves.beginPreparation();g.waves.holdPreparation(true);g.hero.evolution.stones=1;
  E.startTrial(g);g.hero.active=false;assert.equal(E.cancelTrial(g),true);assert.equal(g.hero.evolution.stones,1);assert.equal(g.hero.evolution.trialStage,0);assert.equal(g.waves.preparationHeld,true);assert.ok(g.monsters.every(m=>!m.active));g.hero.active=true;assert.equal(E.startTrial(g).ok,true);
});
test('cleared wave gates cannot unlock during the gate wave; summons cannot accumulate',()=>{
  const {ns,g,E}=setup('naga',0);g.waves.wave=20;g.waves.active=true;g.economy.emblems=99;g.shop=new ns.systems.ShopSystem(g.hero);g.shop.context=g;assert.equal(g.shop.buy('evolution-stone',g.economy).ok,false);
  g.hero.evolution.rank=2;for(let i=0;i<20;i++){g.hero.skillCooldowns.summon=0;cast(ns,g,'e');}assert.equal(g.summons.filter(s=>s.active).length,3);
});
test('training has no rewards and camp finish remains an explicit player action',()=>{
  const {ns,g,E}=setup('naga',2);g.monsters=[];g.evolutionCamp=true;assert.equal(E.training(g),true);assert.equal(E.training(g),false);const m=g.monsters[0],gold=g.economy.gold,xp=g.hero.xp;m.health=0;m.active=false;ns.TDGame.prototype.onKill.call(g,m,{owner:g.hero});assert.equal(g.economy.gold,gold);assert.equal(g.hero.xp,xp);
  let won=false;g.end=v=>won=v;g.startWave();assert.equal(won,true);
});
