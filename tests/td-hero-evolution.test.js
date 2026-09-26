'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {load,game,enemy}=require('./helpers/td-runtime.cjs');

test('seven heroes have complete awakened and transcendent replacement skill sets',()=>{
  const {ns}=load(),hero=new ns.entities.Hero(100,100),system=ns.systems.HeroEvolutionSystem;
  for(const type of Object.keys(ns.systems.HeroRoster.CLASSES)){
    hero.chooseClass(type);
    for(const rank of [1,2]){
      hero.evolution.rank=rank;
      const form=system.form(hero);
      assert.equal(form.skills.length,4,type+' rank '+rank);
      assert.equal(form.hints.length,4,type+' rank '+rank);
      assert.ok(form.skills.every(Boolean));
    }
  }
});

test('evolution uses a separate boss-emblem currency, preserves health floor, and creates a hero-only trial',()=>{
  const {ns}=load(),g=game(ns),system=ns.systems.HeroEvolutionSystem;
  g.waves=new ns.systems.WaveSystem();g.waves.wave=20;g.waves.active=false;g.hero.chooseClass('hunter');g.hero.level=13;g.hero.maxHealth=220;g.hero.health=220;g.shop=new ns.systems.ShopSystem(g.hero,new ns.systems.ArmorySystem());g.shop.context=g;
  g.economy.addEmblems(3);
  assert.equal(g.shop.buy('evolution-stone',g.economy).ok,true);
  assert.equal(g.economy.emblems,0);
  assert.equal(system.canStartTrial(g),true);
  const trial=system.startTrial(g);assert.equal(trial.ok,true);
  const boss=g.monsters[0],tower={};const before=boss.health;
  assert.equal(boss.takeDamage(999,{owner:tower}),false);assert.equal(boss.health,before);
  assert.equal(system.completeTrial(g,boss),false,'living trial boss cannot grant evolution');
  boss.takeDamage(100000,{owner:g.hero});
  assert.equal(system.completeTrial(g,boss),true);
  assert.equal(g.hero.evolution.rank,1);assert.equal(g.hero.level,1);assert.ok(g.hero.maxHealth>=220);
  assert.ok(g.hero.skillPower()>2,'Awakened Lv.1 remains stronger than its initial form');
});

test('each awakened hero can cast a replacement Q skill without requiring an army',()=>{
  const {ns}=load(),system=ns.systems.HeroEvolutionSystem;
  for(const type of Object.keys(ns.systems.HeroRoster.CLASSES)){
    const g=game(ns);g.hero.chooseClass(type);g.hero.evolution.rank=1;g.waves={active:true};
    const target=enemy(ns,140,100,'brute',10000);target.armor=0;g.monsters=[target];
    const before=target.health,ok=system.cast(g.hero,'q',{game:g,monsters:g.monsters,summons:g.summons,onKill:()=>{},onHit:()=>{}});
    assert.equal(ok,true,type);assert.ok(target.health<before,type);
  }
});
