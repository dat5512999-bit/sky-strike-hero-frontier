'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),crypto=require('node:crypto');
const {load,game,enemy}=require('./helpers/td-runtime.cjs'),{rgba}=require('./png-pixels.cjs'),{strictCanvas}=require('./helpers/strict-canvas.cjs');
const ids=['bountyHunter','powderThrower','fireDemon','frostWyrm'];
test('neutral contracts are distinct, all factions can hire, boss gates follow difficulty',()=>{
 const {ns}=load(),f=new ns.systems.FactionSystem(),d=new ns.systems.TDDifficultySystem();f.contentGate=(kind,id)=>d.allows(kind,id);
 for(const faction of Object.keys(ns.systems.FactionSystem.FACTIONS))for(const mode of ['story','standard','veteran','calamity']){
  f.choose(faction);d.choose(mode);for(const id of ids){assert.equal(f.allows('unit',id),false);assert.equal(f.canHire(id),!ns.config.units[id].ultimate||['veteran','calamity'].includes(mode),faction+' '+mode+' '+id);}
 }
 const html=fs.readFileSync('td.html','utf8');for(const id of ids)assert.equal((html.match(new RegExp('data-mercenary="'+id+'"','g'))||[]).length,1);
 assert.ok(!html.includes('data-mercenary="pikeGuard"'));
});
test('placement, no funds, cancellation, five upgrades and refund use existing economy',()=>{
 const {ns}=load();for(const id of ids){const b=new ns.systems.BuildSystem(),e=new ns.systems.EconomySystem();b.terrainIssue=()=>null;e.gold=0;e.lumber=0;e.merit=100;
  b.queueMercenary(id);assert.equal(b.placeQueued(200,200,e),false);assert.equal(e.gold,0);e.gold=30000;
  b.cancel();assert.equal(b.placeQueued(200,200,e),false);assert.equal(e.gold,30000);b.queueMercenary(id);
  assert.equal(b.placeQueued(200,200,e),true);const u=b.selected,cost=Math.ceil(ns.config.units[id].cost*1.5);assert.equal(e.gold,30000-cost);assert.equal(e.lumber,0);assert.equal(u.mercenary,true);
  const names=new Set([u.evolutionName()]);while(u.level<5){assert.equal(b.upgrade(e),true);names.add(u.evolutionName());}assert.equal(names.size,5);assert.equal(b.upgrade(e),false);
  const before=e.gold,refund=Math.floor(u.totalSpent*.7);assert.equal(b.sell(e),true);assert.equal(e.gold,before+refund);assert.equal(b.combatUnits().length,0);
 }
});
test('every contract has usable shop gear, transfer/release and deployed-only loot eligibility',()=>{
 const {ns}=load(),g=game(ns);g.factions.choose('rogue');g.armory=new ns.systems.ArmorySystem();g.shop=new ns.systems.ShopSystem(g.hero,g.armory);g.shop.context=g;g.loot.context=g;
 assert.equal(g.loot.usable('gear-dragon-heart','hunter','rogue'),false);
 const gears={bountyHunter:'lion-bow',powderThrower:'war-drum',fireDemon:'war-drum',frostWyrm:'vine-crown'};
 for(const id of ids){const u=new ns.entities.CombatUnit(id,100,100),other=new ns.entities.CombatUnit(id,130,100),gear=gears[id];g.build.items=[u];
  assert.equal(g.shop.usable('gear-'+gear),true);assert.equal(g.loot.usable('gear-'+gear,'hunter','rogue'),true);g.economy.gold=10000;assert.equal(g.shop.buy('gear-'+gear,g.economy).ok,true);
  assert.equal(g.armory.equip(gear,u).ok,true);assert.equal(Object.keys(u.gear).length,1);assert.equal(g.armory.equip(gear,other).ok,true);assert.equal(Object.keys(u.gear).length,0);g.armory.releaseTarget(other);assert.equal(g.armory.wearer(gear),null);
 }
 assert.equal(g.loot.usable('gear-dragon-heart','hunter','rogue'),true);g.build.items=[];assert.equal(g.loot.usable('gear-dragon-heart','hunter','rogue'),false);
});
test('actual projectiles deal splash, wyrm slows without freezing, and boss DPS has tradeoffs',()=>{
 const {ns}=load(),g=game(ns);
 for(const id of ids)for(const level of [1,5]){
  const u=new ns.entities.CombatUnit(id,100,100);u.level=level;u.synergy=g.synergy;u.cooldown=0;u.canHitAir=u.config().canHitAir??true;
  const targets=[enemy(ns,140),enemy(ns,155),enemy(ns,450)],shots=[];u.attack(targets[0],u.config(),shots,targets);assert.equal(shots.length,1);assert.ok(shots[0].unitVfx,id);shots[0].update(1,targets);
  assert.ok(targets[0].health<1000);if(id!=='bountyHunter')assert.ok(targets[1].health<1000);assert.equal(targets[2].health,1000);
  if(id==='frostWyrm'){assert.equal(targets[0].slowFactor,.78);assert.ok(targets[0].slowTimer>0);assert.ok(!(targets[0].rootTime>0));assert.ok(!(targets[0].frostStatus?.window>0));targets[0].update(1.21,null);assert.equal(targets[0].slowTimer,0);assert.equal(targets[0].slowFactor,1);}
  shots[0].update(1,targets);assert.equal(shots[0].active,false);
 }
 for(const id of ['fireDemon','frostWyrm']){const c=ns.config.units[id],dragon=ns.config.units.dragon;assert.ok(c.damage>=100);assert.ok(c.damage/c.interval<dragon.damage/dragon.interval);assert.ok(c.slowTime===undefined||c.slowTime<c.interval*Math.pow(.92,4)*.82);}
});
test('ground-only blast does not damage air; dead targets safely cancel',()=>{
 const {ns}=load();for(const id of ids){const u=new ns.entities.CombatUnit(id,100,100),cfg=u.config();u.cooldown=0;u.canHitAir=cfg.canHitAir??true;const t=enemy(ns,140),air=enemy(ns,150);air.canBeDamagedBy=(_source,p)=>p.canHitAir!==false;const shots=[];u.attack(t,cfg,shots,[t,air]);shots[0].update(1,[t,air]);if(cfg.canHitAir===false)assert.equal(air.health,1000);
  u.cooldown=0;const cancelled=[];u.attack(t,cfg,cancelled,[t]);t.active=false;cancelled[0].update(.1,[t]);assert.equal(cancelled[0].active,false);
 }
});
test('all 64 frames have nonempty unique bodies and visible transparent gutters',()=>{
 const {ns}=load(),sw=fs.readFileSync('sw.js','utf8');for(const id of ids){const path=ns.systems.ArtSystem.ACTION_PATHS[id],p=rgba(path),hashes=new Set();assert.ok(sw.includes(path));assert.equal(p.width,1254);assert.equal(p.height,1254);
  for(let k=0;k<16;k++){const x0=Math.floor(k%4*p.width/4),x1=Math.floor((k%4+1)*p.width/4),y0=Math.floor(Math.floor(k/4)*p.height/4),y1=Math.floor((Math.floor(k/4)+1)*p.height/4);let body=0,clear=0;const hash=crypto.createHash('sha256');
   for(let y=y0;y<y1;y++){hash.update(p.pixels.subarray((y*p.width+x0)*4,(y*p.width+x1)*4));for(let x=x0;x<x1;x++){const a=p.pixels[(y*p.width+x)*4+3];if(a===0)clear++;if(a>50)body++;if(x-x0<4||x1-x<=4||y-y0<4||y1-y<=4)assert.ok(a<=1,id+' '+k+' seam has visible pixels');}}
   assert.ok(body>4000,id+' '+k);assert.ok(clear>40000,id+' '+k);hashes.add(hash.digest('hex'));
  }assert.equal(hashes.size,16);
 }
});
test('all rows, both facings, level 1/5 and equipped rendering stay inside source cells',()=>{
 const {ns}=load(),art=Object.create(ns.systems.ArtSystem.prototype);art.drawRank=()=>{};art.drawGearPieces=()=>{};
 for(const id of ids)for(const level of [1,5])for(const facing of [0,Math.PI])for(const [row,state]of ['idle','walk','attack','hit'].entries())for(let frame=0;frame<4;frame++){
  const u=new ns.entities.CombatUnit(id,100,100);Object.assign(u,{level,facing,state,frame,gear:{relic:'war-drum'}});const image={ready:true,width:1254,height:1254,assetSrc:ns.systems.ArtSystem.ACTION_PATHS[id]},c=strictCanvas();assert.equal(art.drawActionUnit(c.ctx,u,image),true);assert.equal(c.depth,0);
  const call=c.calls.find(a=>a[0]==='drawImage'),[,img,sx,sy,sw,sh]=call;assert.equal(sx,Math.floor(frame*1254/4)+4);assert.equal(sy,Math.floor(row*1254/4)+4);assert.ok(sx+sw<=img.width&&sy+sh<=img.height);
  assert.equal(c.calls.some(a=>a[0]==='scale'&&a[1]===-1),facing===Math.PI);
 }
 for(const id of ids){const u=new ns.entities.CombatUnit(id,100,100);u.strikes=1;u.cooldown=u.config().interval-.5;assert.ok(ns.systems.NeutralMercenaryArt.pose(u,u.config())>=12);assert.equal(art.drawActionUnit(strictCanvas().ctx,u,{ready:false}),false);}
});
test('long firing runs keep projectile count and lifetimes bounded',()=>{
 const {ns}=load(),g=game(ns),targets=[enemy(ns,140,100,'brute',1e9),enemy(ns,155,100,'brute',1e9)];let shots=[],peak=0;
 const units=ids.map(id=>{const u=new ns.entities.CombatUnit(id,100,100);u.level=5;u.synergy=g.synergy;return u;});
 for(let i=0;i<3600;i++){for(const u of units)u.update(1/30,targets,shots,[]);for(const p of shots)p.update(1/30,targets);shots=shots.filter(p=>p.active);peak=Math.max(peak,shots.length);}
 assert.ok(peak<20,'unbounded shots '+peak);assert.ok(targets.every(t=>Number.isFinite(t.health)));
});
test('painted effects, reduced budgets and missing-image fallback are safe for each contract',()=>{
 const {ns}=load(),g=game(ns);g.art={soldierAtlas:{ready:true,width:1254,height:1254},towerPaintedAtlas:{ready:true,width:1254,height:1254},towerMagicAtlas:{ready:true,width:1254,height:1254}};
 for(const id of ids)for(const level of [1,5]){const u=new ns.entities.CombatUnit(id,100,100);u.level=level;u.synergy=g.synergy;u.cooldown=0;const target=enemy(ns,140),shots=[];u.attack(target,u.config(),shots,[target]);const p=shots[0];
  ns.entities.Projectile.beginFrame(96);const flight=strictCanvas();p.draw(flight.ctx);assert.ok(flight.calls.some(c=>c[0]==='drawImage'),id);assert.equal(flight.depth,0);
  p.update(1,[target]);ns.entities.Projectile.beginFrame(96);const impact=strictCanvas();p.draw(impact.ctx);assert.ok(impact.calls.some(c=>c[0]==='drawImage'));assert.equal(impact.depth,0);
  ns.entities.Projectile.beginFrame(0);const empty=strictCanvas();p.draw(empty.ctx);assert.equal(empty.calls.length,0);
  g.art.towerPaintedAtlas.ready=false;g.art.soldierAtlas.ready=false;ns.entities.Projectile.beginFrame(96);const fallback=strictCanvas();p.draw(fallback.ctx);assert.equal(fallback.depth,0);g.art.towerPaintedAtlas.ready=true;g.art.soldierAtlas.ready=true;
 }
});
