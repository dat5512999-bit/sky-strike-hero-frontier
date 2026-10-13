'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {load,game}=require('./helpers/td-runtime.cjs'),{strictCanvas}=require('./helpers/strict-canvas.cjs');
function setup(type='hunter'){const {ns}=load(),g=game(ns);g.hero.chooseClass(type);g.waves=new ns.systems.WaveSystem();g.waves.wave=20;g.waves.beginPreparation();g.status='playing';g.economy.emblems=20;g.shop=new ns.systems.ShopSystem(g.hero,g.armory);g.shop.context=g;return{ns,g,E:ns.systems.HeroEvolutionSystem};}
test('buying a stone summons exactly one live boss, charges once and does not grant evolution',()=>{
  const {g,E}=setup();const coins=g.economy.emblems;
  assert.equal(g.shop.buy('evolution-stone',g.economy).ok,true);assert.equal(g.monsters.length,1);assert.equal(g.hero.evolution.rank,0);assert.equal(g.hero.evolution.stones,1);
  assert.equal(g.economy.emblems,coins-3);assert.equal(g.waves.preparationHeld,true);assert.equal(E.startTrial(g).ok,false);
  assert.equal(g.shop.buy('evolution-stone',g.economy).ok,false);assert.equal(g.economy.emblems,coins-3);assert.equal(g.monsters.length,1);
});
test('purchase during a later wave waits for clearing; a downed hero pauses preparation until revival',()=>{
  const {g,E}=setup();g.waves.wave=21;g.waves.active=true;g.monsters=[{active:true}];assert.equal(g.shop.buy('evolution-stone',g.economy).ok,true);assert.equal(g.hero.evolution.autoTrial,true);assert.equal(g.hero.evolution.trialStage,0);
  E.processPending(g);assert.equal(g.monsters.length,1);g.waves.active=false;g.monsters=[];g.hero.active=false;
  assert.equal(E.processPending(g),false);assert.equal(g.waves.preparationHeld,true);g.hero.active=true;
  assert.equal(E.processPending(g),true);assert.equal(g.monsters.length,1);assert.equal(g.hero.evolution.autoTrial,false);
});
test('failed trial keeps the stone and a free retry; only a real boss victory consumes it',()=>{
  const {g,E}=setup();g.shop.buy('evolution-stone',g.economy);const paid=g.economy.emblems,boss=g.monsters[0];
  assert.equal(E.completeTrial(g,boss),false);g.hero.active=false;assert.equal(E.cancelTrial(g),true);assert.equal(g.hero.evolution.stones,1);assert.equal(g.hero.evolution.rank,0);
  g.hero.active=true;assert.equal(E.startTrial(g).ok,true);assert.equal(g.economy.emblems,paid);const retry=g.monsters.at(-1);
  assert.equal(E.completeTrial(g,boss),false);retry.takeDamage(1e6,{owner:g.hero});assert.equal(E.completeTrial(g,retry),true);assert.equal(E.completeTrial(g,retry),false);
  assert.equal(g.hero.level,0);assert.equal(g.hero.xp,0);assert.equal(g.hero.evolution.stones,0);assert.equal(g.evolutionNotice.kind,'success');
});
test('both evolution ranks are stronger at the same level and Lv0 earns XP normally for all heroes',()=>{
  const {ns}=load(),E=ns.systems.HeroEvolutionSystem;
  for(const type of Object.keys(ns.systems.HeroRoster.CLASSES))for(const rank of [1,2]){
    const base=new ns.entities.Hero(100,100),hero=new ns.entities.Hero(100,100);base.chooseClass(type);hero.chooseClass(type);hero.evolution.rank=rank;
    for(const level of [0,1,5,15]){base.level=hero.level=level;assert(hero.combatConfig().damage>base.combatConfig().damage,type);assert(hero.combatConfig().interval<base.combatConfig().interval,type);assert(hero.healthAtLevel()>base.healthAtLevel(),type);}
    hero.level=0;hero.xp=0;hero.maxHealth=hero.healthAtLevel();const damage=hero.skillPower(),hp=hero.maxHealth;assert.equal(hero.xpForNext(),40);hero.gainExperience(40);assert.equal(hero.level,1);assert.equal(hero.xp,0);assert(hero.skillPower()>damage);assert(hero.maxHealth>hp);assert(E.rank(hero)===rank);
  }
});
test('painted forms omit legacy regalia in every state without changing skins or gear',()=>{
  const {ns}=load(),P=ns.systems.HeroEvolutionPresentation;
  for(const type of Object.keys(ns.systems.HeroRoster.CLASSES))for(const state of ['idle','walk','attack','cast'])for(const facing of [0,Math.PI]){
    const h=new ns.entities.Hero(100,100);h.chooseClass(type);h.state=state;h.facing=facing;h.equipment.spear=3;h.gear={weapon:'test'};const gear=JSON.stringify(h.gear),equipment=JSON.stringify(h.equipment),signatures=[];
    for(const rank of [0,1,2]){const c=strictCanvas();h.evolution.rank=rank;P.drawRegalia(c.ctx,h,false);P.drawRegalia(c.ctx,h,true);assert.equal(c.depth,0);assert.equal(c.calls.length,0);signatures.push(JSON.stringify(c.calls));}
    assert.equal(new Set(signatures).size,1);assert.equal(JSON.stringify(h.gear),gear);assert.equal(JSON.stringify(h.equipment),equipment);
  }
});
test('new flow assets are shipped offline and purchase does not require another hidden UI action',()=>{
  const fs=require('node:fs'),html=fs.readFileSync('td.html','utf8'),worker=fs.readFileSync('sw.js','utf8');
  for(const file of ['td-evolution.css','src/td/systems/HeroEvolutionFlow.js']){assert(html.includes(file));assert(worker.includes(file));}
  assert(html.includes('id="td-evolution-notice"'));assert.equal((html.match(/id="td-evolution-notice"/g)||[]).length,1);
});
test('an equipment-layer Canvas failure is isolated and restores every nested transform',()=>{
  const {ns}=load(),hero=new ns.entities.Hero(100,100),c=strictCanvas();hero.chooseClass('arcanist');hero.evolution.rank=1;
  ns.systems.HeroEvolutionSpriteAtlas={}; // Isolate the retained legacy fallback fault boundary.
  c.ctx.createLinearGradient=()=>{throw Error('injected regalia failure');};
  assert.equal(ns.systems.HeroEvolutionPresentation.drawRegalia(c.ctx,hero),false);assert.equal(c.depth,0);assert.match(hero.evolutionFault,/injected regalia/);assert.equal(hero.evolutionVisualDisabledRank,1);
  hero.evolutionFault=null;assert.equal(ns.systems.HeroEvolutionPresentation.drawRegalia(c.ctx,hero),false);assert.equal(hero.evolutionFault,null);
});
