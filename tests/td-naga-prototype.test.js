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
  assert.equal(first.allows('heroes','naga'),true);assert.equal(first.allows('factions','naga'),true);assert.equal(first.allows('maps','westernsignal'),true);assert.equal(first.allows('maps','emberroad'),true);
  const legacy=JSON.parse(first.export());for(const profile of Object.values(legacy.profiles).concat(legacy.archives)){profile.unlocks.heroes=profile.unlocks.heroes.filter(id=>id!=='naga');profile.unlocks.factions=profile.unlocks.factions.filter(id=>id!=='naga');profile.unlocks.maps=profile.unlocks.maps.filter(id=>!['westernsignal','emberroad'].includes(id));}
  storage.setItem(ns.systems.ProfileStore.KEY,JSON.stringify(legacy));const migrated=new ns.systems.ProfileStore(storage);
  assert.equal(migrated.allows('heroes','naga'),true);assert.equal(migrated.allows('factions','naga'),true);assert.equal(migrated.allows('maps','westernsignal'),true);assert.equal(migrated.allows('maps','emberroad'),true);
});

test('娜迦選角使用正式單人與軍團立繪，三次鍛造有可辨識的三叉戟戰場表現',()=>{
  const {ns}=load(),hero=ns.systems.HeroRoster.get('naga'),faction=ns.systems.FactionSystem.FACTIONS.naga,cache=fs.readFileSync('sw.js','utf8');
  assert.equal(hero.selectionArt,'assets/td/naga/tidebreaker-selection-v1.png');assert.equal(faction.selectionArt,'assets/td/naga/faction-selection-v1.png');
  for(const asset of [hero.selectionArt,faction.selectionArt]){assert.ok(fs.existsSync(asset),asset);assert.ok(fs.statSync(asset).size>400000,asset+' should be a painted selection asset');assert.ok(cache.includes('./'+asset),asset+' should be cached');}
  assert.equal(new ns.systems.ProfessionSystem().choose('naga'),true);
  assert.ok(ns.systems.EquipmentSystem.WEAPONS.naga.every(item=>item.visual==='trident'));
  assert.equal(hero.skillArt,'assets/td/naga/tidebreaker-skill-icons-v1.png');assert.ok(fs.existsSync(hero.skillArt));assert.ok(cache.includes('./'+hero.skillArt));
});

test('四座娜迦建築可部署、具不同實際戰術並有兩條進階分支',()=>{
  const {ns}=load(),faction=new ns.systems.FactionSystem();faction.choose('naga');
  for(const type of faction.available('building')){const tower=new ns.entities.Building(type,100,100);assert.ok(tower.config().role);assert.equal(ns.systems.TowerEvolutionSystem.branches(type).length,2,type);}
  const shrine=new ns.entities.Building('nagaAbyssShrine',100,100),guard=new ns.entities.CombatUnit('nagaTideguard',105,100),hero=new ns.entities.Hero(106,100);hero.chooseClass('naga');
  const game={hero,build:{items:[shrine,guard]},monsters:[],summons:[],projectiles:[],feedback:null,report:null};const synergy=new ns.systems.BattleSynergySystem(game);synergy.update(.1);
  assert.equal(guard.supportHaste,.18);assert.equal(hero.supportHaste,.18);assert.equal(guard.supportHasteSource,shrine);assert.equal(hero.supportHasteSource,shrine);
  shrine.level=3;assert.equal(shrine.chooseBranch('covenant'),true);assert.equal(shrine.config().nagaHaste,.28);
});

test('娜迦的投射與連鎖使用潮汐視覺語彙，不回退成通用雷電',()=>{
  const {ns}=load(),buildings=ns.config.buildings;
  assert.equal(buildings.nagaTidegate.style,'tidebolt');
  assert.equal(buildings.nagaShellBastion.style,'tide-spear');
  assert.equal(buildings.nagaMantaAerie.style,'tide-chain');
  const hero=new ns.entities.Hero(100,100),target=new ns.entities.Monster('grunt',1);hero.chooseClass('naga');target.x=135;target.y=100;
  const shots=[];hero.update(.01,[target],shots);hero.update(.2,[target],shots);
  assert.equal(shots[0].style,'tidebolt');
  hero.equipment.spear=2;
  assert.equal(ns.systems.EquipmentSystem.projectileOptions(hero,{style:'tidebolt'},()=>0).style,'tide-chain');
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

test('賽洛技能是娜迦專屬實作：突刺、旋潮、潮衛號令與萬潮裁決不會套用人族邏輯',()=>{
  const {ns}=load(),hero=new ns.entities.Hero(180,220),enemy=new ns.entities.Monster('grunt',1,[{x:0,y:0},{x:720,y:0}]);hero.chooseClass('naga');enemy.x=260;enemy.y=220;enemy.active=true;
  const start=enemy.health;assert.equal(hero.castNova([enemy],()=>{},()=>{}),true);assert.ok(enemy.health<start);assert.equal(hero.skillVfx.at(-1).type,'naga-tidegate');
  hero.skillCooldowns.thunder=0;assert.equal(hero.castThunder([enemy],()=>{},[],()=>{}),true);assert.equal(hero.fields.at(-1).type,'naga');
  const guard=new ns.entities.CombatUnit('nagaTideguard',hero.x+40,hero.y),game={build:{combatUnits:()=>[guard]}};hero.synergy={game};hero.skillCooldowns.summon=0;assert.equal(hero.castSummon([]),true);assert.ok(guard.nagaCommand>4.9);assert.ok(guard.config().damage>ns.config.units.nagaTideguard.damage);
  hero.skillCooldowns.ultimate=0;enemy.active=true;enemy.health=enemy.maxHealth;enemy.x=hero.x+90;enemy.y=hero.y;const result=ns.systems.HeroUltimateSystem.cast(hero,[enemy],()=>{},()=>{});assert.equal(result.name,'萬潮裁決');assert.equal(hero.skillVfx.at(-1).type,'ultimate-naga');
});

test('娜迦十六格動作均走跨格邊界資料，長兵器與翼膜不會被格線截掉',()=>{
  const {ns}=load(),bounds=ns.systems.SpriteFrameBounds,art=fs.readFileSync('src/td/systems/ArtSystem.js','utf8');
  for(const file of ['assets/td/naga/tidebreaker-hero-actions-v1.png','assets/td/naga/tideguard-actions-v1.png','assets/td/naga/brine-shellbreaker-actions-v1.png','assets/td/naga/deep-tide-wargod-actions-v1.png','assets/td/naga/manta-wing-raider-actions-v1.png','assets/td/naga/venom-marsh-stalker-actions-v1.png']){
    const atlas=bounds[file];assert.ok(atlas&&atlas.frames.length===16,file+' needs measured frame bounds');assert.ok(atlas.frames.some((frame,index)=>frame[0]<index%4*atlas.width/4||frame[0]+frame[2]>(index%4+1)*atlas.width/4||frame[1]<Math.floor(index/4)*atlas.height/4||frame[1]+frame[3]>(Math.floor(index/4)+1)*atlas.height/4),file+' should preserve at least one intentional overflow pose');
  }
  assert.match(art,/SpriteFrameBounds/);assert.match(art,/allow the source and destination to cross cell edges/);
});

test('賽洛待機與施法不會輪播到倒地收勢格，避免英雄在戰鬥中卡格跳位',()=>{
 const {ns}=load(),hero=new ns.entities.Hero(180,220);hero.chooseClass('naga');
 hero.beginCast();hero.update(.5,[],[]);assert.equal(hero.state,'cast');assert.ok(hero.frame<=2);
 hero.castTimer=0;hero.targetX=hero.x;hero.targetY=hero.y;hero.update(.9,[],[]);assert.equal(hero.state,'idle');assert.ok(hero.frame<=1);
});

test('旋潮領域在掉幀或回到前景時只結算一個目前脈衝，且單次目標數有上限',()=>{
  const {ns}=load(),hero=new ns.entities.Hero(180,220);hero.chooseClass('naga');
  const monsters=Array.from({length:54},(_,index)=>{const monster=new ns.entities.Monster('grunt',1,[{x:0,y:220},{x:2000,y:220}]);monster.x=190+(index%9)*4;monster.y=205+Math.floor(index/9)*5;monster.health=monster.maxHealth=5000;return monster;});
  assert.equal(hero.castThunder(monsters,()=>{},[],()=>{}),true);let hits=0;
  assert.doesNotThrow(()=>ns.systems.HeroRoster.updateFields(hero,20,monsters,()=>{},()=>{hits++;}));
  assert.equal(hero.fields.length,0,'領域在長時間背景後應正常到期');assert.ok(hits<=12,'娜迦旋潮單次最多處理 12 名附近敵軍');
});

test('英雄選取肖像直接使用英雄正式立繪，支援攻速會顯示來源而非只改隱藏數值',()=>{
  const game=fs.readFileSync('src/td/TDGame.js','utf8'),synergy=fs.readFileSync('src/td/systems/BattleSynergySystem.js','utf8');
  assert.match(game,/heroClass\.selectionArt/);assert.match(game,/supportHasteSource\?\.config/);assert.match(game,/潮衛共鳴：/);
  const build=fs.readFileSync('src/td/systems/BuildSystem.js','utf8');
  assert.match(synergy,/applyHaste\(target,rate,source\)/);assert.match(synergy,/game\.hero\.supportHasteSource=null/);assert.match(build,/towerSupportHasteSource/);
});

test('賽洛英雄渲染有獨立接地陰影與尾部水痕，不再走帶軍階標籤的通用士兵繪製器',()=>{
  const {ns}=load(),art=Object.create(ns.systems.ArtSystem.prototype),calls=[];
  art.load=src=>({assetSrc:src,ready:true,width:1254,height:1254});
  const ctx=new Proxy({}, {get:(_,key)=>key==='drawImage'?(...args)=>calls.push(['drawImage',...args]):(...args)=>calls.push([key,...args])});
  const hero={classType:'naga',state:'attack',frame:2,animationTime:.18,castTimer:.2,x:160,y:210,facing:0,equipment:{spear:0,rune:0,charm:0},gear:{}};
  assert.equal(art.drawHero(ctx,hero),true);assert.ok(calls.some(call=>call[0]==='ellipse'),'娜迦必須有接地陰影與水痕');assert.ok(calls.some(call=>call[0]==='drawImage'&&call[1].assetSrc==='assets/td/naga/tidebreaker-hero-actions-v1.png'));
  assert.equal(calls.some(call=>call[0]==='fillText'),false,'英雄不得由通用軍團階級標籤蓋住');
});
