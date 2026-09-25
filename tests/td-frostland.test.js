'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const {load,game,enemy,tick}=require('./helpers/td-runtime.cjs');
function setup(){const {ns,context}=load(),g=game(ns);g.waves={active:true};g.factions.choose('frostland');g.profession.choose('frostland');g.hero.chooseClass('frostland');g.armory=new ns.systems.ArmorySystem();g.shop=new ns.systems.ShopSystem(g.hero,g.armory);return {ns,context,g,F:ns.systems.FrostStatusSystem};}
function shot(ns,g,owner,target,options){const p=new ns.entities.Projectile(owner,target,Object.assign({damage:20,attackType:'chaos'},options));p.hit(g.monsters,(m,s)=>g.onKill(m,s),(m,d,c,s)=>g.onHit(m,d,c,s));return p;}

test('Frostland opening can afford control and damage without losing its faction identity',()=>{
 const {ns}=load(),opening=(ids)=>{
   const g=game(ns);g.hero.active=false;g.waves={active:true};
   const configs=ids.map(id=>ns.config.units[id]||ns.config.buildings[id]);
   assert.ok(configs.reduce((sum,cfg)=>sum+cfg.cost,0)<=ns.config.startGold);
   assert.ok(configs.reduce((sum,cfg)=>sum+(cfg.wood||0),0)<=ns.config.startLumber);
   g.monsters=Array.from({length:6},(_,i)=>enemy(ns,140+i*5,100,'brute',1000000));
   g.build.items=ids.map((id,i)=>new ns.entities[ns.config.units[id]?'CombatUnit':'Building'](id,100,100+i*4));
   let firstWindow=null;
   for(let i=0;i<240;i++){
     tick(g,.05);
     if(firstWindow===null&&g.monsters.some(m=>ns.systems.FrostStatusSystem.isWindow(m)))firstWindow=i*.05;
   }
   return {damage:g.monsters.reduce((sum,m)=>sum+1000000-m.health,0),firstWindow};
 };
 const frost=opening(['frostWolf','frostBlizzard']),kingdom=opening(['hunter','cannon']);
 assert.ok(frost.damage>=kingdom.damage*.8,`Frost opening ${frost.damage} should be viable beside Kingdom ${kingdom.damage}`);
 assert.ok(frost.firstWindow!==null&&frost.firstWindow<3);
 const hero=game(ns).hero;hero.chooseClass('frostland');assert.ok(hero.combatConfig().damage>=20);
 const target=enemy(ns,140,100,'brute');target.armor=0;
 assert.equal(hero.castNova([target],()=>{},()=>{}),true);
 assert.ok(1000-target.health>20);
 assert.ok(target.frostStatus.amount>=45);
});

test('Both Frostland opening routes can hold a moving first-wave lane',()=>{
 const {ns}=load();
 for(const ids of [['frostWolf','frostHunter'],['frostWolf','frostBlizzard']]){
   const g=game(ns);g.hero.active=false;g.waves={active:true};
   const configs=ids.map(id=>ns.config.units[id]||ns.config.buildings[id]);
   assert.ok(configs.reduce((sum,cfg)=>sum+cfg.cost,0)<=ns.config.startGold);
   assert.ok(configs.reduce((sum,cfg)=>sum+(cfg.wood||0),0)<=ns.config.startLumber);
   g.build.items=ids.map((id,i)=>new ns.entities[ns.config.units[id]?'CombatUnit':'Building'](id,180+i*50,175));
   let spawned=0;
   for(let i=0;i<1800;i++){
     if(i%19===0&&spawned<10){g.monsters.push(new ns.entities.Monster('grunt',1,ns.config.path));spawned++;}
     for(const monster of g.monsters)if(monster.active)monster.update(.05,null,null);
     tick(g,.05);
   }
   assert.equal(spawned,10);
   assert.equal(g.monsters.filter(monster=>monster.leaked).length,0,ids.join('+'));
   assert.equal(g.monsters.filter(monster=>!monster.active&&!monster.leaked).length,10,ids.join('+'));
 }
});

test('Frostland has six stationary, invulnerable soldiers and seven independently usable towers',()=>{
 const {ns}=setup(),f=ns.systems.FactionSystem.FACTIONS.frostland;assert.equal(f.status,'TESTABLE');assert.equal(f.storyStatus,'CONCEPT');assert.equal(f.units.length,6);assert.equal(f.buildings.length,7);
 for(const id of f.units){const u=new ns.entities.CombatUnit(id,100,100);u.takeDamage(99999);u.issueCommand('move',200,200);assert.equal(u.health,100);assert.equal(u.x,100);assert.equal(u.isMoving(),false);assert.ok(Object.values(ns.systems.ArmorySystem.ITEMS).some(i=>i.types.includes(id)));}
 for(const id of f.buildings){const b=new ns.entities.Building(id,100,100);assert.ok(Number.isFinite(b.config().damage));for(let i=0;i<4;i++)assert.ok(b.upgrade());assert.equal(b.upgrade(),null);}
});
test('Frost accumulates, slows through existing status API, decays and never leaks into Silverleaf ice',()=>{
 const {ns,g,F}=setup(),m=enemy(ns);g.monsters=[m];F.apply(m,25);F.update(m,.1);assert.equal(m.slowFactor,1);F.apply(m,40);F.update(m,.1);assert.ok(m.slowFactor<1);assert.ok(m.slowFactor>.6);F.update(m,3);assert.ok(m.frostStatus.amount<65);
 const silver=new ns.entities.Building('frost',100,100),fresh=enemy(ns);g.monsters=[fresh];silver.cooldown=0;silver.update(.1,g.monsters,g.projectiles,[]);g.projectiles[0].hit(g.monsters,()=>{},()=>{});assert.equal(fresh.frostStatus,undefined);assert.ok(fresh.slowTimer>0);
 for(const bad of [NaN,Infinity,-1,0])F.apply(fresh,bad);assert.equal(fresh.frostStatus,undefined);
});
test('Frozen stops movement and attacks, expires, and has an enforced recovery interval',()=>{
 const {ns,g,F}=setup(),m=enemy(ns,140,100,'brute');g.monsters=[m];F.apply(m,100);const x=m.x;m.update(.1,g.hero,[]);assert.equal(m.x,x);
 const combat=new ns.systems.EnemyCombatSystem();m.attackCooldown=0;combat.update(.1,[m],g.hero,[]);assert.equal(m.attackWindup,0);
 for(let i=0;i<18;i++){g.synergy.update(.1);m.update(.1,g.hero,[]);}assert.equal(F.isWindow(m),false);assert.ok(m.x>x);assert.equal(F.apply(m,1000),false);
 for(let i=0;i<35;i++)g.synergy.update(.1);assert.equal(F.apply(m,100),true);
});
test('Elite resists accumulation and duration; Boss Deep Chill moves, amplifies damage and cannot be permanently rooted',()=>{
 const {ns,g,F}=setup(),boss=enemy(ns,200,100,'boss',10000),elite=enemy(ns);elite.elite=true;F.apply(elite,100);assert.equal(elite.frostStatus.amount,65);F.apply(elite,100);assert.ok(elite.frostStatus.window<=.8);
 g.monsters=[boss];F.apply(boss,100);assert.equal(boss.frostStatus.amount,40);F.apply(boss,200);assert.equal(boss.frostStatus.deep,true);assert.equal(boss.rootTime||0,0);F.update(boss,.1);const x=boss.x;boss.update(.1,null,[]);assert.ok(boss.x>x);
 boss.armor=0;const before=boss.health;boss.takeDamage(100);assert.ok(Math.abs(before-boss.health-112)<.001);
 for(let i=0;i<500;i++){F.apply(boss,500);g.synergy.update(.05);boss.update(.05,null,[]);assert.equal(boss.rootTime||0,0);}assert.ok(boss.x>x+100);
});
test('Shatter adds burst and AoE once per window, keeps damage/kill ownership and never recursively shatters',()=>{
 const {ns,g,F}=setup(),bear=new ns.entities.CombatUnit('frostBear',100,100),a=enemy(ns,140,100,'grunt'),b=enemy(ns,150,100,'grunt');bear.synergy=g.synergy;a.armor=b.armor=0;g.monsters=[a,b];F.apply(a,100);F.apply(b,100);
 const opts={damage:30,shatter:2,shatterRadius:65};shot(ns,g,bear,a,opts);assert.equal(1000-a.health,90);assert.equal(1000-b.health,30);assert.equal(b.frostStatus.shattered,false);
 shot(ns,g,bear,a,opts);assert.equal(1000-a.health,120);assert.equal(1000-b.health,30);
 a.health=1;shot(ns,g,bear,a,opts);assert.equal(bear.kills,1);assert.equal(a.rewardHandled,true);
});
test('Frost support uses highest nearby value, updates when sold, and extension has a total cap',()=>{
 const {ns,g,F}=setup(),wolf=new ns.entities.CombatUnit('frostWolf',100,100),a=new ns.entities.Building('frostTotem',110,100),b=new ns.entities.Building('frostTotem',115,100),shaman=new ns.entities.CombatUnit('frostShaman',105,100);g.build.items=[wolf,a,b,shaman];g.synergy.update(.1);assert.equal(wolf.frostEfficiency,.3);assert.equal(g.hero.frostEfficiency,.3);a.retired=b.retired=true;g.synergy.update(.1);assert.equal(wolf.frostEfficiency,.15);shaman.active=false;g.synergy.update(.1);assert.equal(g.hero.frostEfficiency,0);
 const m=enemy(ns);F.apply(m,100);for(let i=0;i<100;i++)F.extend(m,.25);assert.ok(m.frostStatus.window<=2.2+1e-9);assert.equal(m.frostStatus.extended,.6);
});
test('Each attacking soldier/tower creates real Frost or Shatter projectiles through the shared combat path',()=>{
 const {ns,g}=setup();g.monsters=[enemy(ns,140,100,'brute',10000)];
 for(const [kind,catalog] of [['unit',ns.config.units],['building',ns.config.buildings]])for(const [id,cfg] of Object.entries(catalog).filter(([,c])=>c.frostland&&!c.supportOnly)){
   const u=new ns.entities[kind==='unit'?'CombatUnit':'Building'](id,100,100);u.synergy=g.synergy;u.cooldown=0;const shots=[];u.update(.1,g.monsters,shots,[]);if(kind==='unit')u.update(.5,g.monsters,shots,[]);assert.ok(shots.length,id);assert.ok(shots[0].frost>0||shots[0].shatter>0,id);shots[0].hit(g.monsters,()=>{},()=>{});
 }
 assert.ok(g.monsters[0].health<10000);
});
test('Every Hero x Faction pairing is selectable; Frost hero remains useful with non-Frost armies',()=>{
 const {ns,g,F}=setup();for(const hero of Object.keys(ns.systems.HeroRoster.CLASSES))for(const faction of Object.keys(ns.systems.FactionSystem.FACTIONS)){assert.equal(g.hero.chooseClass(hero),true);assert.equal(g.factions.choose(faction),true);}
 g.hero.chooseClass('frostland');g.factions.choose('rogue');const m=enemy(ns);g.monsters=[m];assert.equal(g.hero.castNova(g.monsters,(m,s)=>g.onKill(m,s),(m,d,c,s)=>g.onHit(m,d,c,s)),true);assert.ok(m.frostStatus.amount>=45);assert.equal(g.hero.castNova(g.monsters,()=>{},()=>{}),false);
 F.apply(m,100);const before=m.health;assert.equal(g.hero.castThunder(g.monsters,()=>{},[],()=>{}),true);assert.ok(before-m.health>100);assert.equal(g.hero.castSummon([]),true);assert.ok(g.hero.huntTime>0);assert.equal(g.hero.castSummon([]),false);
});
test('Ultimate works across factions, requires an active wave, applies global Frost and clears after six seconds',()=>{
 const {ns,g,F}=setup();g.factions.choose('goblin');g.monsters=[enemy(ns,700,600,'grunt',10000)];g.waves.active=false;assert.equal(ns.systems.HeroUltimateSystem.cast(g.hero,g.monsters),null);g.waves.active=true;
 assert.ok(ns.systems.HeroUltimateSystem.cast(g.hero,g.monsters));assert.equal(ns.systems.HeroUltimateSystem.cast(g.hero,g.monsters),null);
 for(let i=0;i<50;i++)g.synergy.update(.1);assert.ok(F.isWindow(g.monsters[0]));assert.ok(g.hero.huntTime>0);for(let i=0;i<15;i++)g.synergy.update(.1);assert.equal(g.synergy.winter,null);
 g.synergy.reset();assert.equal(g.synergy.winter,null);
});
test('Winter chain death uses depth/budget bounds and rewards each enemy exactly once',()=>{
 const {ns,g,F}=setup();g.monsters=Array.from({length:40},(_,i)=>enemy(ns,130+i*.1,100,'grunt',15));for(const m of g.monsters)F.apply(m,100);ns.systems.HeroUltimateSystem.cast(g.hero,g.monsters);shot(ns,g,g.hero,g.monsters[0],{damage:1000});
 assert.equal(g.monsters.filter(m=>m.rewardHandled).length,40);assert.ok(g.synergy.frostChainBudget>=0);const earned=g.economy.totalEarned;for(const m of g.monsters)g.onKill(m);assert.equal(g.economy.totalEarned,earned);
});
test('Three weapon upgrades use original prices/power, fail without gold and stop at maximum',()=>{
 const {ns,g}=setup();g.economy.gold=0;assert.equal(g.shop.buy('spear',g.economy).ok,false);g.economy.gold=1000;const base=g.hero.combatConfig().damage,names=[];
 for(let i=0;i<3;i++){assert.equal(g.shop.offer('spear').price,[100,160,220][i]);names.push(g.shop.offer('spear').name);assert.ok(g.shop.buy('spear',g.economy).ok);assert.ok(Math.abs(g.hero.combatConfig().damage/base-(1+(i+1)*.2))<.001);}
 assert.equal(new Set(names).size,3);assert.equal(g.shop.buy('spear',g.economy).ok,false);assert.ok(fs.existsSync('assets/td/items/'+ns.systems.EquipmentSystem.weapon(g.hero).atlas));
});
test('Frost equipment uses one slot, transfers cleanly, alters attacks; shop/rewards reject unusable gear',()=>{
 const {ns,g}=setup(),a=new ns.entities.CombatUnit('frostBird',100,100),b=new ns.entities.CombatUnit('frostShaman',100,100);g.armory.obtain('moon-staff');g.armory.obtain('vine-crown');const chain=a.config().chain;assert.ok(g.armory.equip('moon-staff',a).ok);assert.ok(a.config().chain>chain);assert.ok(g.armory.equip('moon-staff',b).ok);assert.equal(Object.keys(a.gear).length,0);g.armory.equip('vine-crown',b);assert.equal(Object.keys(b.gear).length,1);assert.equal(g.armory.wearer('moon-staff'),null);
 g.loot.context=g;g.shop.context=g;for(let i=0;i<40;i++){const offers=g.loot.createOffers(6,'frostland','frostland');for(const o of offers)assert.ok(g.loot.usable(o.id,'frostland','frostland'));const drop=g.loot.rollDrop({type:'boss'},'frostland','frostland',0);assert.ok(g.loot.usable(drop.id,'frostland','frostland'));}
 assert.equal(g.shop.usable('gear-soul-lantern'),false);g.economy.gold=1000;assert.equal(g.shop.buy('gear-soul-lantern',g.economy).ok,false);g.factions.unlock('unit','rogue');assert.equal(g.shop.usable('gear-soul-lantern'),true);assert.equal(g.loot.usable('gear-soul-lantern','frostland','frostland'),true);
});
test('Old profiles roundtrip unchanged, new rounds remain story-locked, unlocks are independent',()=>{
 const {ns}=setup(),values=new Map(),storage={getItem:k=>values.get(k)||null,setItem:(k,v)=>values.set(k,v)};const p=new ns.systems.ProfileStore(storage);p.switchTo('admin');assert.ok(p.allows('heroes','frostland'));p.switchTo('test');const old=p.export();const restored=new ns.systems.ProfileStore(storage);assert.equal(restored.export(),old);assert.equal(restored.allows('factions','frostland'),false);assert.equal(restored.allows('heroes','frostland'),false);restored.complete({id:'future-approved-milestone',rewards:{heroes:['frostland']}});assert.equal(restored.allows('heroes','frostland'),true);assert.equal(restored.allows('factions','frostland'),false);
});
test('Codex exposes actual Frost gameplay and UNKNOWN lore without adding Chronicle or Story milestones',()=>{
 const {ns,context}=setup();vm.runInContext(fs.readFileSync('src/td/maps.js','utf8'),context);for(const p of ['CodexCatalog','GameplayIdentity'])vm.runInContext(fs.readFileSync('src/td/codex/'+p+'.js','utf8'),context);
 const entries=new ns.codex.CodexCatalog().all(),frost=entries.filter(e=>e.key==='frostland'||e.source.frostland);assert.equal(frost.length,15);for(const e of frost){assert.ok(e.lore.every(l=>l.sourceType==='UNKNOWN'));assert.equal(e.hiddenUntilEncountered,'hidden');assert.ok(e.gameplayInfo.length);assert.ok(fs.existsSync(e.thumbnail));}
 assert.ok(!ns.systems.StoryCatalog.missions.some(m=>Object.values(m.rewards||{}).flat().includes('frostland')));
});
test('Placeholder slots, all silhouettes, weapon stages and offline modules resolve locally',()=>{
 const slots=JSON.parse(fs.readFileSync('assets/td/frostland/slots.json'));for(const s of Object.values(slots.slots))assert.ok(fs.existsSync(s.path));for(const key of ['frost_wolf','frost_bear','frost_bird','frost_hunter','frost_shaman'])assert.ok(fs.existsSync('assets/td/frostland/'+key+'.svg'));
 const bodies=Object.values(slots.slots).slice(2).map(s=>fs.readFileSync(s.path,'utf8'));assert.equal(new Set(bodies).size,13);const sw=fs.readFileSync('sw.js','utf8');for(const path of ['FrostStatusSystem','FrostlandHero','FrostlandArt'])assert.ok(sw.includes('/'+path+'.js'));
});

test('Every sprite frame is distinct, transparent, bounded and uses complete-body source rectangles',()=>{
 const {ns}=setup();const {rgba}=require('./png-pixels.cjs');
 for(const [key,count] of [['hero',16],['soldiers',24],['weapons',4]]){const a=ns.systems.FrostlandAtlas[key],png=rgba(a.path);assert.equal(a.frames.length,count);assert.equal(new Set(a.frames.map(f=>f.hash)).size,count);assert.equal(png.width,a.width);assert.equal(png.height,a.height);let zero=0;for(let i=3;i<png.pixels.length;i+=4)if(png.pixels[i]===0)zero++;assert.ok(zero/(png.width*png.height)>.4);for(const f of a.frames){assert.ok(f.rect[2]>60&&f.rect[3]>120);assert.ok(f.rect[0]>=0&&f.rect[1]>=0&&f.rect[0]+f.rect[2]<=a.width&&f.rect[1]+f.rect[3]<=a.height);}}
 assert.ok(ns.systems.FrostlandAtlas.hero.frames[14].rect[1]<940,'raised casting hands must not be clipped to their nominal cell');
});

test('Soldiers wind up before firing, release exactly once, cancel retired/dead targets, and keep their anchor',()=>{
 const {ns,g}=setup(),u=new ns.entities.CombatUnit('frostBear',100,100),m=enemy(ns);u.synergy=g.synergy;u.cooldown=0;const shots=[];
 u.update(.01,[m],shots,[]);assert.equal(shots.length,0);assert.equal(ns.systems.FrostlandAnimation.pose(u).frame,0);u.update(.2,[m],shots,[]);assert.equal(shots.length,0);assert.equal(ns.systems.FrostlandAnimation.pose(u).frame,1);u.update(.14,[m],shots,[]);assert.equal(shots.length,1);u.update(.2,[m],shots,[]);assert.equal(shots.length,1);assert.equal(u.x,100);assert.equal(u.y,100);
 ns.systems.FrostlandAnimation.queue(u,[m],{damage:1});u.retired=true;ns.systems.FrostlandAnimation.update(u,1,[m],shots);assert.equal(u.frostAction,null);assert.equal(shots.length,1);u.retired=false;m.active=false;ns.systems.FrostlandAnimation.queue(u,[m],{damage:1});ns.systems.FrostlandAnimation.update(u,1,[m],shots);assert.equal(shots.length,1);
});

test('Hero rendering switches body frames and all four weapon atlas rectangles',()=>{
 const {ns,g}=setup(),calls=[],ctx=new Proxy({drawImage:(...args)=>calls.push(args)},{get:(obj,key)=>obj[key]||(()=>{})}),art=Object.create(ns.systems.ArtSystem.prototype);
 art.frostAtlases=Object.fromEntries(['hero','soldiers','weapons'].map(k=>[k,{ready:true,key:k}]));const rects=[];
 for(let level=0;level<4;level++){g.hero.equipment.spear=level;g.hero.state='attack';g.hero.frame=level;art.drawHero(ctx,g.hero);rects.push(calls.at(-1).slice(1,5).join(','));assert.equal(calls.at(-1)[0].key,'weapons');assert.equal(calls.at(-2)[0].key,'hero');}
 assert.equal(new Set(rects).size,4);assert.equal(new Set(calls.filter(a=>a[0].key==='hero').map(a=>a.slice(1,5).join(','))).size,4);
});

test('Shatter specialists prioritize a current window; manual soldier target strategies still work',()=>{
 const {ns,g,F}=setup(),front=enemy(ns,150,100),frozen=enemy(ns,130,100),u=new ns.entities.CombatUnit('frostBear',100,100);F.apply(frozen,100);assert.equal(u.acquireTarget([front,frozen],u.config()),frozen);const tower=new ns.entities.Building('frostBallista',100,100);tower.cooldown=0;tower.update(.1,[front,frozen],g.projectiles,[]);assert.equal(g.projectiles[0].target,frozen);
});

test('VFX have mobile/desktop budgets, expire, pause with zero delta, reset and audio defaults to opt-in',()=>{
 const {ns,g}=setup(),v=ns.systems.FrostlandVFX;for(let i=0;i<100;i++)v.emit(g.synergy,'shatter',{x:0,y:0});assert.equal(g.synergy.frostVisuals.length,72);g.feedback.mobile=true;v.emit(g.synergy,'freeze',{x:0,y:0});assert.equal(g.synergy.frostVisuals.length,36);v.update(g.synergy,0);assert.equal(g.synergy.frostVisuals[0].age,0);v.update(g.synergy,2);assert.equal(g.synergy.frostVisuals.length,0);assert.equal(ns.systems.FrostlandAudio.enabled,false);assert.equal(ns.systems.FrostlandAudio.play('freeze'),false);v.emit(g.synergy,'winter',{x:0,y:0});g.synergy.reset();assert.equal(g.synergy.frostVisuals.length,0);
});
