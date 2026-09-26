'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),{load}=require('./helpers/td-runtime.cjs');

test('後段四種戰術威脅在指定波次出現，且提示說明對應反制',()=>{
  const {ns}=load(),catalog=new ns.systems.WaveCatalog();
  [[32,'goblinVeilrunner','隱形魔石'],[37,'frostSkyraider','可對空'],[42,'nagaPhasewarden','免疫穿刺'],[46,'orcMirrorGuard','暈厥']].forEach(([wave,type,word])=>{
    const definition=catalog.get(wave);assert.ok(definition.groups.some(group=>group.type===type),wave+' '+type);assert.match(definition.hint,new RegExp(word));
  });
});

test('隱形魔石只揭露英雄附近的隱幕地精，並遵循既有三階商店成長',()=>{
  const {ns}=load(),hero=new ns.entities.Hero(100,100),near=new ns.entities.Monster('goblinVeilrunner',32),far=new ns.entities.Monster('goblinVeilrunner',32),traits=new ns.systems.EnemyTraitSystem(),shop=new ns.systems.ShopSystem(hero);
  near.x=225;near.y=100;far.x=231;far.y=100;hero.equipment.sightstone=1;
  traits.update(.1,[near,far],{hero});assert.equal(near.revealed,true);assert.equal(far.revealed,false);assert.equal(shop.offer('sightstone').max,3);assert.equal(shop.offer('sightstone').price,152);
});

test('飛行敵軍拒絕近戰、接受對空攻擊，娜迦相位潮衛只免疫穿刺',()=>{
  const {ns}=load(),air=new ns.entities.Monster('frostSkyraider',37),phase=new ns.entities.Monster('nagaPhasewarden',42),melee={canHitAir:false},ranged={canHitAir:true};
  assert.equal(air.isTargetableBy(melee),false);assert.equal(air.isTargetableBy(ranged),true);
  const before=phase.health;phase.takeDamage(50,{attackType:'pierce'});assert.equal(phase.health,before);phase.takeDamage(50,{attackType:'magic'});assert.ok(phase.health<before);
});

test('鏡甲反震僅暈厥士兵、具冷卻且不傷害英雄',()=>{
  const {ns,context}=load(),guard=new ns.entities.Monster('orcMirrorGuard',46),soldier=new ns.entities.CombatUnit('hunter',100,100),hero=new ns.entities.Hero(100,100),shot=new ns.entities.Projectile(soldier,guard,{damage:30,attackType:'magic',canHitAir:true}),heroShot=new ns.entities.Projectile(hero,guard,{damage:30,attackType:'magic',canHitAir:true});
  context.Math.random=()=>0;shot.hit([guard]);assert.ok(soldier.staggerTimer>0);const lockout=soldier.staggerCooldown;shot.hit([guard]);assert.equal(soldier.staggerCooldown,lockout);heroShot.hit([guard]);assert.equal(hero.staggerTimer,undefined);
});

test('三個半章首領有獨立二階援軍與潮幕／霜骨抗控效果',()=>{
  const {ns}=load(),combat=new ns.systems.EnemyCombatSystem();
  [['tide',['nagaSiltImp','nagaShellbreaker','healer','commander']],['siege',['goblinSapper','goblinVeilrunner','orcBanner','warder']],['frost',['frostRimeStalker','frostRimePriest','frostSkyraider','warder']]].forEach(([aspect,expected])=>{
    const wave={tide:35,siege:40,frost:45}[aspect],boss=new ns.entities.Monster('boss',wave),ally=new ns.entities.Monster('grunt',wave),monsters=[boss,ally];boss.health=boss.maxHealth*.6;combat.update(.01,monsters,null,[],{});assert.equal(boss.bossAspect,aspect);assert.deepEqual(monsters.slice(2).map(unit=>unit.type),expected);if(aspect==='tide')assert.ok(ally.barrier>0);if(aspect==='frost')assert.ok(ally.bossWardTime>0);
  });
});
