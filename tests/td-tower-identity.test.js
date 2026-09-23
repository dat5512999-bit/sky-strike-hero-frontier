'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const files=['src/td/namespace.js','src/td/config.js','src/td/systems/TargetSelector.js','src/td/systems/ArmorySystem.js','src/td/systems/TowerEvolutionSystem.js','src/td/systems/TowerSkillSystem.js','src/td/entities/Summon.js','src/td/entities/Monster.js','src/td/entities/Projectile.js','src/td/entities/CombatUnit.js','src/td/entities/Building.js','src/td/systems/BuildSystem.js'];
function load(){const context=vm.createContext({console});context.globalThis=context;files.forEach(file=>vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),context,{filename:file}));return context.TowerFrontier;}
function enemy(ns,type,x,index){const monster=new ns.entities.Monster(type,1);monster.x=x;monster.y=100;monster.index=index;return monster;}

test('所有塔在建造卡上有不同的用途說明',()=>{const ns=load(),roles=Object.values(ns.config.buildings).map(tower=>tower.role);assert.equal(roles.length,35);assert.ok(roles.every(Boolean));assert.equal(new Set(roles).size,roles.length);});

test('戰鼓只支援範圍內守軍，兩座不疊加，移除後效果消失',()=>{const ns=load(),build=new ns.systems.BuildSystem(),near=new ns.entities.CombatUnit('hunter',100,100),far=new ns.entities.CombatUnit('hunter',500,500),first=new ns.entities.Building('barracks',110,100),second=new ns.entities.Building('barracks',105,105);build.items.push(near,far,first,second);const base=near.config().interval;build.applyTowerSupport();assert.equal(near.supportHaste,.08);assert.equal(far.supportHaste,0);assert.ok(near.config().interval<base);first.level=3;first.chooseBranch('command');build.applyTowerSupport();assert.equal(near.supportHaste,.15);assert.ok(near.config().interval<base*.9);first.retired=true;build.applyTowerSupport();assert.equal(near.supportHaste,.08);second.retired=true;build.applyTowerSupport();assert.equal(near.supportHaste,0);assert.equal(near.config().interval,base);});

test('選取戰鼓堡時可看見獨立於攻擊射程的守軍支援範圍',()=>{const ns=load(),tower=new ns.entities.Building('barracks',100,100),arcs=[],ctx=new Proxy({arc(x,y,radius){arcs.push(radius);}}, {get(target,key){return target[key]||(()=>{});},set(target,key,value){target[key]=value;return true;}});tower.draw(ctx,true,{drawBuilding(){return true;}});assert.ok(arcs.includes(tower.config().range));assert.ok(arcs.includes(tower.config().allyHasteRadius));});

test('暫停時新建與出售戰鼓會立即更新守軍攻速，不需等待下一 frame',()=>{const ns=load(),build=new ns.systems.BuildSystem(),economy={gold:500,lumber:10,merit:0};build.queue('barracks','building');assert.equal(build.placeQueued(480,250,economy),true);const tower=build.selected;build.queue('hunter','unit');assert.equal(build.placeQueued(390,250,economy),true);const soldier=build.selected;assert.equal(soldier.supportHaste,.08);build.selected=tower;assert.equal(build.sell(economy),true);assert.equal(soldier.supportHaste,0);});

test('獅翼弩砲優先清除祭司旗手，普通弩塔仍按行進進度射擊',()=>{const ns=load(),front=enemy(ns,'grunt',128,8),healer=enemy(ns,'healer',165,3),commander=enemy(ns,'commander',175,4),monsters=[front,healer,commander];const ballista=new ns.entities.Building('ballista',100,100),arrow=new ns.entities.Building('arrow',100,100),ballistaShots=[],arrowShots=[];ballista.update(.3,monsters,ballistaShots,[]);arrow.update(.3,monsters,arrowShots,[]);assert.equal(ballistaShots[0].target,healer);assert.equal(ballistaShots[1].target,commander);assert.equal(arrowShots[0].target,front);});

test('召喚殿保留基礎召喚，墓園改為通用召喚物支援',()=>{const ns=load(),crypt=ns.config.buildings.crypt,grave=ns.config.buildings.graveyard;assert.ok(crypt.summonInterval>0);assert.equal(grave.summonInterval,undefined);assert.equal(grave.summonAura,.25);const tower=new ns.entities.Building('graveyard',100,100);tower.level=3;tower.chooseBranch('legion');assert.equal(tower.config().summonAura,.4);});

test('月影四塔分別提供冰封、根脈纏繞、雷電輸出與魔法折射',()=>{const {frost,grove,storm,moonwell}=load().config.buildings;assert.ok(frost.slow<1);assert.equal(grove.rootPulse,true);assert.equal(grove.slow,undefined);assert.equal(storm.attackType,'magic');assert.equal(moonwell.supportOnly,true);assert.ok(moonwell.refractChance>0);assert.equal(moonwell.slow,undefined);});
