'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {load}=require('./helpers/td-runtime.cjs');

test('difficulty tiers expose a strictly increasing pressure curve',()=>{
  const {ns}=load(),difficulty=new ns.systems.TDDifficultySystem(),ids=['story','standard','veteran','calamity'];
  let health=0,count=0,speed=Infinity,reward=Infinity;
  ids.forEach(id=>{difficulty.choose(id);const mode=difficulty.current();assert.ok(mode.enemyHealth>health);assert.ok(mode.enemyCount>count);assert.ok(mode.spawnRate<speed);assert.ok(mode.reward<reward);health=mode.enemyHealth;count=mode.enemyCount;speed=mode.spawnRate;reward=mode.reward;});
});

test('story and standard permanently lock stronger content while veteran opens all',()=>{
  const {ns}=load(),difficulty=new ns.systems.TDDifficultySystem();
  difficulty.choose('story');for(const type of ['royalCommander','dragon','soulsteel'])assert.equal(difficulty.allows('unit',type),false);for(const type of ['armoryForge','ballista','moonwell','graveyard'])assert.equal(difficulty.allows('building',type),false);assert.equal(difficulty.allows('building','arrow'),true);
  difficulty.choose('standard');for(const type of ['royalCommander','dragon','soulsteel'])assert.equal(difficulty.allows('unit',type),false);assert.equal(difficulty.allows('building','ballista'),true);
  for(const id of ['veteran','calamity']){difficulty.choose(id);for(const type of ['royalCommander','dragon','soulsteel'])assert.equal(difficulty.allows('unit',type),true);for(const type of ['armoryForge','ballista','moonwell','graveyard'])assert.equal(difficulty.allows('building',type),true);}
});

test('story reduces formations while every higher tier adds progressively more enemies',()=>{
  const {ns}=load(),difficulty=new ns.systems.TDDifficultySystem(),counts=[];
  for(const id of ['story','standard','veteran','calamity']){difficulty.choose(id);const waves=new ns.systems.WaveSystem();waves.setModifiers(difficulty.modifiers());counts.push(waves.definition(20).groups.reduce((sum,group)=>sum+group.count,0));}
  assert.ok(counts[0]<counts[1]&&counts[1]<counts[2]&&counts[2]<counts[3],counts.join(','));
});

test('difficulty gate also prevents ultimate soldiers from bypassing through mercenary shop',()=>{
  const {ns}=load(),difficulty=new ns.systems.TDDifficultySystem(),factions=new ns.systems.FactionSystem();
  factions.choose('hunter');factions.contentGate=(kind,id)=>difficulty.allows(kind,id);
  difficulty.choose('standard');assert.equal(factions.canHire('dragon','unit'),false);
  difficulty.choose('veteran');assert.equal(factions.canHire('dragon','unit'),true);
});

test('standard cumulative income through wave 14 stays below the previous runaway economy',()=>{
  const {ns}=load(),difficulty=new ns.systems.TDDifficultySystem();difficulty.choose('standard');
  const waves=new ns.systems.WaveSystem(),economy=new ns.systems.EconomySystem();waves.setModifiers(difficulty.modifiers());economy.setRewardRate(difficulty.current().reward);
  for(let wave=1;wave<=14;wave++){
    const definition=waves.definition(wave);
    definition.groups.forEach(group=>{for(let i=0;i<group.count;i++)economy.addKill(new ns.entities.Monster(group.type,wave,undefined,{bountyScale:group.type==='boss'?1:definition.bountyScale}),0);});
    economy.completeWave(waves.catalog.get(wave).reward);
  }
  assert.ok(economy.gold>=4300&&economy.gold<=4700,'wave 14 total '+economy.gold);
});
