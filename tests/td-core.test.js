'use strict';
const test=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');const path=require('node:path');const vm=require('node:vm');
const root=path.resolve(__dirname,'..');const files=['src/td/namespace.js','src/td/config.js','src/td/systems/ProfessionSystem.js','src/td/systems/PathSystem.js','src/td/systems/NavigationSystem.js','src/td/systems/CommandSystem.js','src/td/entities/Monster.js','src/td/entities/Projectile.js','src/td/entities/CombatUnit.js','src/td/entities/Building.js','src/td/entities/Hero.js','src/td/systems/WaveSystem.js','src/td/systems/BuildSystem.js'];
function load(){const context=vm.createContext({console});context.globalThis=context;files.forEach((file)=>vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),context,{filename:file}));return context.TowerFrontier;}

test('怪物依道路節點移動並在終點標記漏怪',()=>{const ns=load();const monster=new ns.entities.Monster('runner',1,[{x:0,y:0},{x:10,y:0}]);monster.update(1);assert.equal(monster.active,false);assert.equal(monster.leaked,true);});

test('每波輪換敵人且每五波出現首領',()=>{const ns=load();const waves=new ns.systems.WaveSystem();assert.equal(waves.composition(1)[0].type,'grunt');assert.equal(waves.composition(2)[0].type,'runner');assert.equal(waves.composition(5)[0].type,'boss');assert.equal(waves.composition(5)[0].count,1);});

test('建築不可堵路，但作戰單位可以部署到道路攔截',()=>{const ns=load();const build=new ns.systems.BuildSystem(),point=ns.config.path[4];assert.equal(build.canPlaceAt(point.x,point.y,'building'),false);assert.equal(build.canPlaceAt(point.x,point.y,'unit'),true);});

test('作戰單位與防禦建築使用不同實體及經濟',()=>{const ns=load();const build=new ns.systems.BuildSystem();const economy={gold:500,lumber:10,merit:0};assert.equal(build.queue('hunter','unit'),true);assert.equal(build.placeQueued(330,250,economy),true);assert.equal(build.selected.kind,'unit');assert.equal(build.queue('arrow','building'),true);assert.equal(build.placeQueued(480,250,economy),true);assert.equal(build.selected.kind,'building');assert.equal(build.combatUnits().length,1);assert.equal(build.buildings().length,1);});

test('作戰單位接受移動命令並切換行走與待機動畫',()=>{const ns=load();const unit=new ns.entities.CombatUnit('hunter',100,100);unit.setTarget(200,100);unit.update(.25,[],[]);assert.ok(unit.x>100);assert.equal(unit.state,'walk');assert.equal(unit.facing,0);unit.update(2,[],[]);assert.equal(unit.state,'idle');});

test('導航系統讓單位繞過防禦建築',()=>{const ns=load();const navigation=new ns.systems.NavigationSystem(),building={kind:'building',x:210,y:210};const path=navigation.findPath({x:100,y:210},{x:330,y:210},[building]);assert.ok(path.length>=2);assert.ok(path.some((point)=>Math.abs(point.y-210)>20));assert.equal(navigation.segmentClear({x:100,y:210},{x:330,y:210},[building]),false);});

test('指令系統可下達攻擊移動、固守與停止',()=>{const ns=load();const navigation=new ns.systems.NavigationSystem(),commands=new ns.systems.CommandSystem(),unit=new ns.entities.CombatUnit('hunter',100,100);commands.arm('attackMove');assert.equal(commands.issue(unit,250,100,navigation,[]),true);assert.equal(unit.order,'attackMove');assert.equal(commands.mode,'move');assert.equal(commands.hold(unit),true);assert.equal(unit.order,'hold');assert.equal(commands.stop(unit),true);assert.equal(unit.order,'idle');});

test('攻擊移動會停火接戰，一般移動則持續前進',()=>{const ns=load();const enemy=new ns.entities.Monster('grunt',1);enemy.x=120;enemy.y=100;const attackUnit=new ns.entities.CombatUnit('hunter',100,100),moveUnit=new ns.entities.CombatUnit('hunter',100,100),shots=[];attackUnit.cooldown=0;attackUnit.issueCommand('attackMove',{x:300,y:100},[{x:300,y:100}]);attackUnit.update(.1,[enemy],shots);assert.equal(shots.length,1);assert.equal(attackUnit.x,100);moveUnit.issueCommand('move',{x:300,y:100},[{x:300,y:100}]);moveUnit.update(.1,[enemy],[]);assert.ok(moveUnit.x>100);});

test('點擊空地不會在下達移動命令前遺失目前選取',()=>{const ns=load();const build=new ns.systems.BuildSystem(),economy={gold:300,lumber:5,merit:0};build.queue('hunter','unit');build.placeQueued(330,250,economy);const selected=build.selected;assert.equal(build.selectAt(600,600),null);assert.equal(build.selected,selected);});

test('職業單位可升至五級且高階升級消耗功勳',()=>{const ns=load();const build=new ns.systems.BuildSystem();const economy={gold:1000,lumber:5,merit:6};build.queue('arcanist','unit');build.placeQueued(330,250,economy);assert.equal(build.upgrade(economy),true);assert.equal(build.selected.level,2);assert.equal(build.upgrade(economy),true);assert.equal(build.selected.level,3);const merit=economy.merit;assert.equal(build.upgrade(economy),true);assert.equal(build.selected.level,4);assert.ok(economy.merit<merit);while(build.upgrade(economy));assert.equal(build.selected.level,5);assert.equal(build.selected.upgradeCost(),null);});

test('作戰單位停止移動後優先攻擊進度較前的目標',()=>{const ns=load();const unit=new ns.entities.CombatUnit('hunter',100,100);unit.cooldown=0;const back=new ns.entities.Monster('grunt',1),front=new ns.entities.Monster('grunt',1);back.x=110;back.y=100;back.index=2;front.x=120;front.y=100;front.index=4;const projectiles=[];unit.update(.1,[back,front],projectiles);assert.equal(projectiles.length,1);assert.equal(projectiles[0].target,front);assert.equal(unit.state,'attack');});

test('三種不同外形防禦塔具有穿刺、緩速與範圍戰術',()=>{const ns=load();assert.deepEqual(Object.keys(ns.config.buildings),['arrow','frost','cannon']);assert.equal(ns.config.buildings.arrow.attackType,'pierce');assert.ok(ns.config.buildings.frost.slow<1);assert.ok(ns.config.buildings.cannon.splash>0);});

test('穿刺攻擊對輕甲的傷害高於重甲',()=>{const ns=load();const light=new ns.entities.Monster('grunt',1),heavy=new ns.entities.Monster('brute',1);light.x=heavy.x=100;light.y=heavy.y=100;const lightBefore=light.health,heavyBefore=heavy.health;new ns.entities.Projectile({x:100,y:100},light,{damage:20,attackType:'pierce',color:'#fff'}).update(.1,[light]);new ns.entities.Projectile({x:100,y:100},heavy,{damage:20,attackType:'pierce',color:'#fff'}).update(.1,[heavy]);assert.ok(lightBefore-light.health>heavyBefore-heavy.health);});

test('三種職業可選擇且無效職業不會覆蓋選擇',()=>{const ns=load();const professions=new ns.systems.ProfessionSystem();assert.equal(professions.choose('rogue'),true);assert.equal(professions.current().name,'暗影行會');assert.equal(professions.choose('invalid'),false);assert.equal(professions.selected,'rogue');});

test('英雄可移動、自動攻擊並用霜環干擾範圍怪物',()=>{const ns=load();const hero=new ns.entities.Hero(100,100),monster=new ns.entities.Monster('grunt',1);monster.x=130;monster.y=100;hero.setTarget(200,100);const projectiles=[];hero.update(.1,[monster],projectiles);assert.ok(hero.x>100);assert.equal(projectiles.length,1);const health=monster.health;assert.equal(hero.castNova([monster]),true);assert.ok(monster.health<health);assert.equal(monster.slowFactor,.38);assert.equal(hero.castNova([monster]),false);});

test('道路上的作戰單位會降低附近怪物推進速度',()=>{const ns=load();const path=[{x:0,y:100},{x:500,y:100}],normal=new ns.entities.Monster('grunt',1,path),blocked=new ns.entities.Monster('grunt',1,path);normal.update(1,null,[]);blocked.update(1,null,[{x:10,y:100}]);assert.ok(blocked.x<normal.x);});
