'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const {load}=require('./helpers/td-runtime.cjs');

test('first chapter onboarding holds its preparation timer until the player is ready',()=>{
  const {ns}=load(),waves=new ns.systems.WaveSystem();
  waves.beginPreparation();const countdown=waves.countdown;waves.holdPreparation(true);waves.update(99,[]);
  assert.equal(waves.phase,'preparing');assert.equal(waves.countdown,countdown);assert.match(waves.label(),/等待指揮/);
  waves.holdPreparation(false);waves.update(countdown+.1,[]);assert.equal(waves.phase,'spawning');
});

test('chapter one opens with four light scouts that a correctly placed hunter can defeat',()=>{
  const {ns}=load(),catalog=new ns.systems.StoryCatalog.StoryWaves(ns.systems.StoryCatalog.mission),waves=new ns.systems.WaveSystem(catalog);
  waves.setModifiers({enemyCount:.85,spawnRate:1.15});const first=waves.definition(1);assert.equal(first.groups[0].type,'grunt');assert.equal(first.groups[0].count,3);assert.equal(first.spawnPace,4);
  waves.start();const monsters=[];waves.update(.15,monsters);assert.equal(monsters.length,1);const interval=waves.spawnInterval();assert.ok(interval>4);
  waves.update(interval*.99,monsters);assert.equal(monsters.length,1);waves.update(interval*.02,monsters);assert.equal(monsters.length,2);
});

test('the marked beginner site lets one hunter defeat a first-wave scout before it reaches the gate',()=>{
  const {ns,context}=load();vm.runInContext(fs.readFileSync('src/td/maps.js','utf8'),context);ns.maps.apply('beginner');
  const site=ns.systems.StoryCatalog.mission.tutorial.recommendedPositions[0],hunter=new ns.entities.CombatUnit('hunter',site.x,site.y),scout=new ns.entities.Monster('grunt',1,ns.config.path),projectiles=[];
  for(let time=0;time<30&&scout.active;time+=.05){scout.update(.05);hunter.update(.05,[scout],projectiles);projectiles.forEach(projectile=>projectile.update(.05,[scout]));}
  assert.equal(scout.active,false);assert.equal(scout.health,0);
});

test('onboarding grants practice funds and turns resources, skills, loot and equipment into guided actions',()=>{
  const {ns}=load(),data=new Map(),storage={getItem:key=>data.get(key)||null,setItem:(key,value)=>data.set(key,value),removeItem:key=>data.delete(key)};
  const hunter={kind:'unit',type:'hunter'},game={waves:new ns.systems.WaveSystem(),economy:{gold:240,addGold(amount){this.gold+=amount;return amount;}},build:{items:[hunter],selected:null},hero:{selected:true},showCommands(){},updateUi(){},flash(){},closeShop(){this.shopClosed=true;}};game.waves.beginPreparation();const tutorial=new ns.systems.TutorialSystem(game);
  assert.equal(tutorial.activate(ns.systems.StoryCatalog.mission,storage),true);assert.equal(game.economy.gold,400);assert.equal(tutorial.step,'route');tutorial.advance();assert.equal(tutorial.step,'resources');tutorial.advance();assert.equal(tutorial.step,'deploy');tutorial.onDeployQueued('hunter','unit');tutorial.onDeploy();assert.equal(tutorial.step,'shop');tutorial.onShopOpened();assert.equal(tutorial.step,'shopBuy');tutorial.onShopPurchase('spear');assert.equal(game.shopClosed,true);assert.equal(tutorial.step,'ready');assert.equal(tutorial.requestStart(),true);assert.equal(game.waves.preparationHeld,false);
  tutorial.onWaveClear(1);assert.equal(tutorial.step,'selectUnit');assert.equal(tutorial.lockRecycle,true);assert.equal(game.waves.preparationHeld,true);tutorial.onUnitSelected(hunter);assert.equal(tutorial.step,'upgrade');tutorial.onUpgrade();assert.equal(tutorial.step,'threat');assert.equal(game.waves.preparationHeld,true);tutorial.advance();assert.equal(game.waves.preparationHeld,false);tutorial.onWaveStart(2);assert.equal(tutorial.step,'skill');tutorial.onWaveClear(2);assert.equal(game.waves.preparationHeld,false);assert.equal(tutorial.requestStart(),true);assert.equal(tutorial.step,'skillDone');
  tutorial.onWaveClear(3);assert.equal(tutorial.step,'equip');assert.equal(tutorial.lockRecycle,true);assert.equal(game.build.selected,hunter);tutorial.onEquipmentPickerOpened();assert.equal(tutorial.step,'equipPick');tutorial.onEquipmentEquipped('lion-bow#2',hunter);assert.equal(tutorial.step,'recycle');assert.equal(tutorial.advance(),true);assert.equal(data.get(ns.systems.TutorialSystem.KEY),'completed');assert.equal(tutorial.active,false);
  assert.equal(tutorial.activate(ns.systems.StoryCatalog.mission,storage,{replay:true}),true);assert.equal(tutorial.complete('skipped'),true);assert.equal(tutorial.active,false);assert.equal(data.get(ns.systems.TutorialSystem.KEY),'skipped');
});

test('closing the tutorial always releases tutorial-owned modal pauses',()=>{
  const {ns}=load(),waves=new ns.systems.WaveSystem(),game={waves,paused:true,ui:{lootScreen:{hidden:false},pause:{textContent:'▶',setAttribute(){}}},build:{items:[]},flash(){}};
  const tutorial=new ns.systems.TutorialSystem(game);tutorial.dismissTutorialModal();assert.equal(game.ui.lootScreen.hidden,true);assert.equal(game.paused,false);assert.equal(game.ui.pause.textContent,'Ⅱ');
});
