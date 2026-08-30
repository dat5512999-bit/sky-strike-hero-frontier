'use strict';
const test=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');const path=require('node:path');const vm=require('node:vm');
const root=path.resolve(__dirname,'..');const files=['src/td/namespace.js','src/td/config.js','src/td/systems/PathSystem.js','src/td/entities/Monster.js','src/td/entities/Projectile.js','src/td/entities/Tower.js','src/td/entities/Hero.js','src/td/systems/WaveSystem.js','src/td/systems/BuildSystem.js'];
function load(){const context=vm.createContext({console});context.globalThis=context;files.forEach((file)=>vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),context,{filename:file}));return context.TowerFrontier;}

test('怪物依道路節點移動並在終點標記漏怪',()=>{const ns=load();const monster=new ns.entities.Monster('runner',1,[{x:0,y:0},{x:10,y:0}]);monster.update(1);assert.equal(monster.active,false);assert.equal(monster.leaked,true);});

test('每波輪換敵人且每五波出現首領',()=>{const ns=load();const waves=new ns.systems.WaveSystem();assert.equal(waves.composition(1)[0].type,'grunt');assert.equal(waves.composition(2)[0].type,'runner');assert.equal(waves.composition(5)[0].type,'boss');assert.equal(waves.composition(5)[0].count,1);});

test('選擇塔座後可建造、升級並出售防禦塔',()=>{const ns=load();const build=new ns.systems.BuildSystem();const economy={gold:300};build.selectAt(ns.config.pads[0].x,ns.config.pads[0].y);assert.equal(build.build('arrow',economy),true);assert.equal(economy.gold,240);assert.equal(build.upgrade(economy),true);assert.equal(build.selected.tower.level,2);const before=economy.gold;assert.equal(build.sell(economy),true);assert.ok(economy.gold>before);assert.equal(build.selected.tower,null);});

test('防禦塔優先攻擊路徑進度較前的射程內怪物',()=>{const ns=load();const tower=new ns.entities.Tower('arrow',100,100);tower.cooldown=0;const back=new ns.entities.Monster('grunt',1);const front=new ns.entities.Monster('grunt',1);back.x=110;back.y=100;back.index=2;front.x=120;front.y=100;front.index=4;const projectiles=[];tower.update(.1,[back,front],projectiles);assert.equal(projectiles.length,1);assert.equal(projectiles[0].target,front);});

test('霜語投射物命中後造成傷害與緩速',()=>{const ns=load();const monster=new ns.entities.Monster('grunt',1);monster.x=100;monster.y=100;const projectile=new ns.entities.Projectile({x:100,y:100},monster,{damage:8,slow:.55,slowTime:1.6,color:'#fff'});const health=monster.health;projectile.update(.1,[monster]);assert.ok(monster.health<health);assert.equal(monster.slowFactor,.55);assert.equal(projectile.active,false);});

test('英雄可移動、自動攻擊並用霜環干擾範圍怪物',()=>{const ns=load();const hero=new ns.entities.Hero(100,100);const monster=new ns.entities.Monster('grunt',1);monster.x=130;monster.y=100;hero.setTarget(200,100);const projectiles=[];hero.update(.1,[monster],projectiles);assert.ok(hero.x>100);assert.equal(projectiles.length,1);const health=monster.health;assert.equal(hero.castNova([monster]),true);assert.ok(monster.health<health);assert.equal(monster.slowFactor,.38);assert.equal(hero.castNova([monster]),false);});
