'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const {rgba}=require('./png-pixels.cjs');
const {load}=require('./helpers/td-runtime.cjs');

const actions=[
  'assets/td/naga/siltwater-demonlord-actions-v1.png',
  'assets/td/naga/silt-imp-actions-v1.png',
  'assets/td/naga/brine-shellbreaker-actions-v1.png',
  'assets/td/naga/tidebreaker-hero-actions-v1.png',
  'assets/td/naga/tideguard-actions-v1.png',
  'assets/td/naga/deep-tide-wargod-actions-v1.png',
  'assets/td/naga/manta-wing-raider-actions-v1.png',
  'assets/td/naga/venom-marsh-stalker-actions-v1.png'
];

test('娜迦可直接作為自由遠征軍團，並保留指定英雄、軍團與敵軍資料',()=>{
  const {ns}=load(),faction=ns.systems.FactionSystem.FACTIONS.naga,hero=ns.systems.HeroRoster.get('naga');
  assert.equal(faction.status,'AVAILABLE');assert.equal(faction.storyStatus,'FREE_EXPEDITION');
  assert.deepEqual(Array.from(faction.units),['nagaTideguard','nagaShellbreaker','nagaDeepWargod','nagaMantaRaider','nagaVenomStalker']);
  assert.equal(hero.name,'破潮者・賽洛');
  assert.deepEqual(Array.from(faction.buildings),['nagaTidegate','nagaShellBastion','nagaAbyssShrine','nagaMantaAerie']);
  for(const id of faction.units)assert.equal(ns.config.units[id].naga,true);
  for(const id of ['nagaSiltImp','nagaShellbreaker','nagaSiltwaterDemonlord'])assert.equal(ns.entities.Monster.TYPES[id].storyStatus,'CONCEPT');
});

test('新玩家與既有存檔都直接取得娜迦自由遠征資格',()=>{
  const {ns}=load(),data=new Map(),storage={getItem:key=>data.get(key)??null,setItem:(key,value)=>data.set(key,value),removeItem:key=>data.delete(key)},first=new ns.systems.ProfileStore(storage);
  assert.equal(first.allows('heroes','naga'),true);assert.equal(first.allows('factions','naga'),true);
  const legacy=JSON.parse(first.export());for(const profile of Object.values(legacy.profiles).concat(legacy.archives)){profile.unlocks.heroes=profile.unlocks.heroes.filter(id=>id!=='naga');profile.unlocks.factions=profile.unlocks.factions.filter(id=>id!=='naga');}
  storage.setItem(ns.systems.ProfileStore.KEY,JSON.stringify(legacy));const migrated=new ns.systems.ProfileStore(storage);
  assert.equal(migrated.allows('heroes','naga'),true);assert.equal(migrated.allows('factions','naga'),true);
});

test('四座娜迦建築可部署、具不同實際戰術並有兩條進階分支',()=>{
  const {ns}=load(),faction=new ns.systems.FactionSystem();faction.choose('naga');
  for(const type of faction.available('building')){const tower=new ns.entities.Building(type,100,100);assert.ok(tower.config().role);assert.equal(ns.systems.TowerEvolutionSystem.branches(type).length,2,type);}
  const shrine=new ns.entities.Building('nagaAbyssShrine',100,100),guard=new ns.entities.CombatUnit('nagaTideguard',105,100),hero=new ns.entities.Hero(106,100);hero.chooseClass('naga');
  const game={hero,build:{items:[shrine,guard]},monsters:[],summons:[],projectiles:[],feedback:null,report:null};const synergy=new ns.systems.BattleSynergySystem(game);synergy.update(.1);
  assert.equal(guard.supportHaste,.18);assert.equal(hero.supportHaste,.18);
  shrine.level=3;assert.equal(shrine.chooseBranch('covenant'),true);assert.equal(shrine.config().nagaHaste,.28);
});

test('破潮者武器有初始版與三階連續鍛造，娜迦兵種皆有可用軍械',()=>{
  const {ns}=load(),hero={classType:'naga',equipment:{spear:0}},weapons=ns.systems.EquipmentSystem.WEAPONS.naga;
  assert.equal(weapons.length,4);assert.equal(ns.systems.EquipmentSystem.weapon(hero).id,'tidebreaker-spear-0');
  assert.equal(ns.systems.EquipmentSystem.nextWeapon(hero).id,'tidebreaker-spear-1');
  const armory=ns.systems.ArmorySystem.ITEMS;
  for(const id of ['nagaTideguard','nagaShellbreaker','nagaDeepWargod','nagaMantaRaider','nagaVenomStalker'])assert.ok(Object.values(armory).some(item=>(item.types||[]).includes(id)),id+' needs compatible armory gear');
  assert.ok(Object.values(armory).some(item=>(item.heroes||[]).includes('naga')),'naga hero needs compatible armory gear');
});

test('濁潮小魔王以首領職能運作，而不是只換成首領外觀',()=>{
  const {ns}=load(),boss=new ns.entities.Monster('nagaSiltwaterDemonlord',50);
  assert.equal(boss.combatRole,'boss');assert.equal(boss.abilityCooldown,5);assert.equal(boss.showsHealthBar(),true);
});

test('娜迦動作圖集都是透明 PNG，且每張都有四乘四的可用內容',()=>{
  const cache=fs.readFileSync('sw.js','utf8');
  for(const file of actions){
    assert.ok(cache.includes('./'+file),file+' is cacheable');
    const {width,height,pixels}=rgba(file);assert.ok(width>=1000&&height>=1000,file+' needs enough resolution for a 4×4 atlas');
    assert.equal(pixels[3],0,file+' needs transparent outer canvas');
    const cellW=width/4,cellH=height/4;
    for(let row=0;row<4;row++)for(let column=0;column<4;column++){
      let filled=0;
      for(let y=Math.floor(row*cellH+cellH*.18);y<Math.floor(row*cellH+cellH*.82);y+=4)for(let x=Math.floor(column*cellW+cellW*.18);x<Math.floor(column*cellW+cellW*.82);x+=4)if(pixels[(y*width+x)*4+3]>80)filled++;
      assert.ok(filled>20,file+' cell '+column+','+row+' is empty');
    }
  }
});

test('娜迦建築圖集可離線使用，四個建築格均有透明背景與獨立內容',()=>{
  const file='assets/td/naga/naga-buildings-v1.png',cache=fs.readFileSync('sw.js','utf8'),{width,height,pixels}=rgba(file);
  assert.ok(cache.includes('./'+file));assert.equal(pixels[3],0);assert.ok(width>1000&&height>1000);
  for(let row=0;row<2;row++)for(let column=0;column<2;column++){
    let filled=0;const cellW=width/2,cellH=height/2;
    for(let y=Math.floor(row*cellH+cellH*.2);y<Math.floor(row*cellH+cellH*.8);y+=4)for(let x=Math.floor(column*cellW+cellW*.2);x<Math.floor(column*cellW+cellW*.8);x+=4)if(pixels[(y*width+x)*4+3]>80)filled++;
    assert.ok(filled>80,'building cell '+column+','+row+' must have visible art');
  }
});
