'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),{load}=require('./helpers/td-runtime.cjs');

test('荒野部族以五名原生士兵和四座功能不同的塔組成戰團',()=>{
  const {ns}=load(),factions=new ns.systems.FactionSystem();
  assert.equal(factions.choose('wild'),true);
  assert.deepEqual(Array.from(factions.available('unit')),['orc','centaur','boarRider','minotaur','shaman']);
  assert.deepEqual(Array.from(factions.available('building')),['warDrum','boulder','thunderTotem','totem']);
  assert.equal(ns.config.units.minotaur.cost,Math.max(...factions.available('unit').map(id=>ns.config.units[id].cost)));
  assert.ok(ns.config.units.minotaur.cost>=Math.min(ns.config.units.royalCommander.cost,ns.config.units.dragon.cost,ns.config.units.soulsteel.cost)*.9);
  assert.equal(ns.config.units.minotaur.wood,5);
  assert.ok(ns.config.units.centaur.range>ns.config.units.orc.range*2);
  assert.ok(ns.config.buildings.boulder.splash>ns.config.buildings.cannon.splash);
  assert.equal(ns.config.buildings.thunderTotem.chain,4);
});

test('大酋長使用專用技能圖集與四組荒野特效',()=>{
  const roster=fs.readFileSync('src/td/systems/HeroRoster.js','utf8'),vfx=fs.readFileSync('src/td/systems/HeroSkillVFX.js','utf8');
  assert.match(roster,/chief-skill-icons-v1\.png/);
  for(const effect of ['chief-warcry','chief-shockwave-cast','ultimate-chief'])assert.match(vfx,new RegExp(effect));
  assert.match(vfx,/field\.type==='chief'/);
  const data=fs.readFileSync('assets/td/opening/chief-skill-icons-v1.png');
  assert.equal(data.readUInt32BE(16),data.readUInt32BE(20));assert.ok(data.readUInt32BE(16)>=1024);assert.ok(data.length>100000);
});

test('舊赤牙獎勵安全退役且不再佔用第五波選項',()=>{
  const {ns}=load(),loot=new ns.systems.LootSystem(()=>0),offers=loot.createOffers(5,'wild');
  assert.equal(offers.some(item=>item.id==='orc-contract'),false);
  assert.equal(ns.systems.LootSystem.ITEMS['orc-contract'].legacy,true);
  assert.equal(loot.milestone(5,{}),null);
});

test('軍械推薦依攻速、多目標與空裝備產生排序和可解釋比較',()=>{
  const {ns}=load(),armory=new ns.systems.ArmorySystem(),centaur=new ns.entities.CombatUnit('centaur',0,0),orc=new ns.entities.CombatUnit('orc',0,0);
  armory.obtain('lion-bow');
  const list=armory.recommend('lion-bow',[orc,centaur]);
  assert.equal(list.length,1);assert.equal(list[0].target,centaur);assert.match(list[0].reason,/多目標|射程|未裝備/);
  const comparison=armory.compare('lion-bow',centaur);assert.ok(comparison.rows.some(row=>row.label==='攻擊'&&row.delta>0));assert.ok(comparison.rows.some(row=>row.label==='射程'&&row.delta>0));
});

test('荒野英雄與四名新士兵皆有透明四乘四戰鬥圖集',()=>{
  for(const file of ['wild-chief-actions-v1.png','wild-centaur-actions-v1.png','wild-boar-rider-actions-v1.png','wild-minotaur-actions-v1.png','wild-shaman-actions-v1.png']){const data=fs.readFileSync('assets/td/'+file),w=data.readUInt32BE(16),h=data.readUInt32BE(20);assert.ok(w>1100&&h>1100,file);assert.equal(data[25],6,file);assert.ok(data.length>100000,file);}
});
