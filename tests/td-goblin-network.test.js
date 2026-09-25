'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {load}=require('./helpers/td-runtime.cjs');
test('地精自由軍團資料與五兵七塔具備既有固定部署資料',()=>{
  const {ns}=load(),faction=ns.systems.FactionSystem.FACTIONS.goblin;
  assert.equal(faction.status,'TESTABLE');
  assert.equal(faction.storyStatus,'STORY_LOCKED');
  assert.equal(faction.units.length,5);
  assert.equal(faction.buildings.length,7);
  for(const id of faction.units)assert.ok(ns.config.units[id]);
  for(const id of faction.buildings)assert.ok(ns.config.buildings[id]);
});
test('動力機座降低前期網路門檻，但不改變供電容量或供電增幅',()=>{
  const {ns}=load(),generator=ns.config.buildings.goblinGenerator,gunner=ns.config.units.goblinGunner;
  assert.equal(generator.cost,95);assert.equal(generator.wood,1);
  assert.ok(generator.cost+gunner.cost<=ns.config.startGold);
  assert.ok(generator.wood+gunner.wood<=ns.config.startLumber);
  assert.equal(ns.systems.GoblinNetworkSystem.RULES.capacity,3);
  assert.equal(ns.systems.GoblinNetworkSystem.RULES.boost,.22);
});
test('機械網路容量、離網與超載冷卻均由現有部署物決定',()=>{
  const {ns}=load(),network=new ns.systems.GoblinNetworkSystem();
  const core=new ns.entities.Building('goblinGenerator',100,100);
  const near=new ns.entities.Building('goblinTurret',130,100);
  const siege=new ns.entities.Building('goblinSiege',145,100);
  const far=new ns.entities.Building('goblinTurret',500,500);
  const items=[core,near,siege,far],economy={gold:0};
  network.update(.05,items,economy,false);
  assert.equal(near.networkPowered,true);assert.equal(siege.networkPowered,true);assert.equal(far.networkPowered,false);
  assert.equal(network.links.length,2);
  assert.equal(network.activate(items),true);
  network.update(.05,items,economy,true);
  assert.equal(near.networkOverloaded,true);assert.ok(near.networkHaste>0);
  for(let i=0;i<100;i++)network.update(.05,items,economy,true);
  assert.ok(network.cooling>0);assert.equal(network.activate(items),false);
  assert.equal(near.networkCooling,true);
});
test('供電預覽沿用實際距離與容量規則，不把缺電部署標成可供電',()=>{
  const {ns}=load(),network=new ns.systems.GoblinNetworkSystem(),core=new ns.entities.Building('goblinGenerator',100,100),turret=new ns.entities.Building('goblinTurret',125,100);
  const candidate={x:150,y:100,config:()=>ns.config.buildings.goblinMortar};
  let preview=network.preview([core,turret],candidate);
  assert.equal(preview.powered,true);assert.equal(preview.used,3);assert.equal(preview.capacity,3);
  preview=network.preview([core,turret],{x:500,y:100,config:()=>ns.config.buildings.goblinTurret});
  assert.equal(preview.powered,false);
});
test('供電狀態直接說明戰鬥結果，而非只顯示抽象的有電或沒電',()=>{
  const {ns}=load(),network=new ns.systems.GoblinNetworkSystem(),core=new ns.entities.Building('goblinGenerator',100,100),turret=new ns.entities.Building('goblinTurret',130,100),siege=new ns.entities.Building('goblinSiege',500,100),calls=[];
  network.update(.05,[core,turret,siege],{gold:0},false);
  assert.equal(network.stateLabel(turret),'供電 +22%傷害');
  assert.equal(network.stateLabel(siege),'缺電＝停機');
  const ctx=new Proxy({roundRect(){},save(){},restore(){}},{get(target,key){return key in target?target[key]:(...args)=>calls.push([key,...args]);},set(target,key,value){target[key]=value;return true;}});
  network.draw(ctx);
  assert.ok(calls.some(call=>call[0]==='fillText'&&call[1]==='供電 +22%傷害'));
  assert.ok(calls.some(call=>call[0]==='fillText'&&call[1]==='缺電＝停機'));
  assert.ok(calls.some(call=>call[0]==='fillText'&&call[1]==='供能 1/3'));
});
test('回收站僅在有效戰鬥供電時賺錢，每波有上限且恢復快照',()=>{
  const {ns}=load(),network=new ns.systems.GoblinNetworkSystem(),core=new ns.entities.Building('goblinGenerator',100,100),recycler=new ns.entities.Building('goblinRecycler',130,100),economy={gold:0},items=[core,recycler];
  for(let i=0;i<50;i++)network.update(.05,items,economy,false);
  assert.equal(economy.gold,0);
  for(let i=0;i<400;i++)network.update(.05,items,economy,true);
  assert.equal(economy.gold,72);
  const saved=network.snapshot(),restored=new ns.systems.GoblinNetworkSystem();
  restored.restore(saved);
  for(let i=0;i<100;i++)restored.update(.05,items,economy,true);
  assert.equal(economy.gold,72);
  restored.startWave();for(let i=0;i<40;i++)restored.update(.05,items,economy,true);
  assert.equal(economy.gold,84);
});
test('回收技師不會兼領回收站收益，重型機偶缺電或過熱時停火',()=>{
  const {ns}=load(),network=new ns.systems.GoblinNetworkSystem(),core=new ns.entities.Building('goblinGenerator',100,100),technician=new ns.entities.CombatUnit('goblinRecycler',120,100),mech=new ns.entities.CombatUnit('goblinMech',135,100),economy={gold:0};
  for(let i=0;i<50;i++)network.update(.05,[core,technician,mech],economy,true);
  assert.equal(economy.gold,0);
  const target={x:140,y:100,active:true,health:100,progress:()=>.5},shots=[];
  mech.cooldown=0;mech.networkPowered=false;mech.update(.05,[target],shots,{});assert.equal(shots.length,0);
  mech.networkPowered=true;mech.networkCooling=true;mech.update(.05,[target],shots,{});assert.equal(shots.length,0);
});
test('測試檔與正式檔的軍團故事鎖互不混淆，英雄與軍團獨立',()=>{
  const {ns}=load(),data=new Map(),storage={getItem:key=>data.get(key)||null,setItem:(key,value)=>data.set(key,value)};
  const profiles=new ns.systems.ProfileStore(storage),factions=new ns.systems.FactionSystem(),hero=new ns.entities.Hero(100,100);
  profiles.switchTo('admin');assert.equal(profiles.allows('factions','goblin'),true);
  assert.equal(factions.choose('goblin'),true);assert.equal(hero.chooseClass('hunter'),true);
  assert.equal(factions.available('building').includes('goblinGenerator'),true);
  profiles.newRound();assert.equal(profiles.allows('factions','goblin'),false);
  assert.equal(profiles.allows('heroes','goblin'),false);
  assert.equal(hero.chooseClass('goblin'),true);assert.equal(factions.choose('rogue'),true);
});
test('地精英雄可以在聯網裝置上施放改裝及大絕，技能使用既有冷卻和符文',()=>{
  const {ns}=load(),hero=new ns.entities.Hero(100,100),core=new ns.entities.Building('goblinGenerator',100,100),support=new ns.entities.Building('goblinRecycler',112,100),tower=new ns.entities.Building('goblinTurret',130,100),network=new ns.systems.GoblinNetworkSystem(),items=[core,support,tower];
  hero.chooseClass('goblin');network.update(.05,items,{gold:0},true);
  hero.synergy={game:{goblinNetwork:network,build:{items},waves:{active:true}}};
  assert.equal(ns.systems.HeroRoster.cast(hero,0,[],()=>{},()=>{}),true);
  assert.ok(tower.engineerBoost>0);
  assert.equal(tower.engineerHaste,.2);assert.equal(support.engineerBoost,0);
  assert.ok(tower.config().interval<ns.config.buildings.goblinTurret.interval);
  const result=ns.systems.HeroUltimateSystem.cast(hero,[],()=>{},()=>{});
  assert.equal(result.name,'全網超載');
  assert.ok(hero.skillCooldowns.ultimate>0);
  assert.equal(network.activate(items),false);
});
test('鉚釘重射手的重甲加成會隨投射物結算，而非只停在卡片資料',()=>{
  const {ns}=load(),unit=new ns.entities.CombatUnit('goblinRiveter',100,100),heavy=new ns.entities.Monster('brute',1,[{x:0,y:100},{x:1000,y:100}]),shots=[];
  heavy.x=140;heavy.y=100;heavy.armor=0;heavy.health=heavy.maxHealth=1000;unit.cooldown=0;
  unit.attack(heavy,unit.config(),shots,[heavy]);
  assert.equal(unit.goblinAction.options.bonusVsHeavy,1.25);
  ns.systems.GoblinAnimation.update(unit,.3,[heavy],shots);
  const before=heavy.health;shots[0].hit([heavy]);
  assert.equal(before-heavy.health,43*.75*1.25);
});
test('地精彈丸採專屬視覺而保留原有命中與結算',()=>{
  const {ns}=load(),source=new ns.entities.Building('goblinTurret',100,100);
  const target={x:105,y:100,radius:8,active:true,health:50,maxHealth:50,armorType:'light',takeDamage(amount){this.health-=amount;return false;}};
  const projectile=new ns.entities.Projectile(source,target,{damage:10,style:'bullet',attackType:'pierce'});
  assert.equal(projectile.style,'goblin-shot');projectile.update(.05,[target],()=>{},()=>{});
  assert.equal(projectile.hitResolved,true);assert.equal(projectile.active,true);assert.ok(target.health<50);
});
