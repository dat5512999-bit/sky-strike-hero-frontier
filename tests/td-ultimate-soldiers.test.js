'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const {load,game,enemy,tick}=require('./helpers/td-runtime.cjs');
test('ultimate soldiers belong to their factions and require saving; upgrade/refund use actual spending',()=>{
 const {ns}=load();for(const [faction,type] of [['hunter','royalCommander'],['arcanist','dragon'],['rogue','soulsteel']]){
  const f=new ns.systems.FactionSystem();f.choose(faction);assert.ok(f.allows('unit',type));assert.ok(!f.canHire(type));assert.ok(ns.config.units[type].cost>=750);
  const build=new ns.systems.BuildSystem(),e=new ns.systems.EconomySystem();build.queue(type,'unit');assert.equal(build.placeQueued(330,250,e),false);assert.equal(build.items.length,0);
  e.gold=5000;e.lumber=50;assert.equal(build.placeQueued(330,250,e),true);const u=build.selected,initial=u.totalSpent,cost=build.upgradeCost();assert.equal(cost.gold,ns.config.units[type].cost);assert.ok(build.upgrade(e));assert.equal(u.totalSpent,initial+cost.gold);assert.equal(u.sellValue(),Math.floor(u.totalSpent*.7));
 }
});
test('commander speeds only nearby other soldiers, complements damage flag and expires on removal',()=>{
 const {ns}=load(),g=game(ns),c=new ns.entities.CombatUnit('royalCommander',100,100),ally=new ns.entities.CombatUnit('hunter',140,100),far=new ns.entities.CombatUnit('hunter',600,100),tower=new ns.entities.Building('arrow',140,100);
 const flag=new ns.entities.Building('battleflag',120,100);g.build.items=[c,ally,far,tower,flag];g.synergy.update(.1);assert.equal(ally.supportHaste,.18);assert.equal(c.supportHaste,0);assert.equal(far.supportHaste,0);assert.equal(tower.supportHaste,0);assert.equal(g.hero.supportHaste||0,0);assert.equal(g.synergy.flagRate(ally),.12);
 const c2=new ns.entities.CombatUnit('royalCommander',110,100);g.build.items.push(c2);g.synergy.update(.1);assert.equal(ally.supportHaste,.18);c.retired=c2.retired=true;g.synergy.update(.1);assert.equal(ally.supportHaste,0);
});
test('soulsteel consumes exactly three souls per empowered attack, no debt, ordinary attacks still work',()=>{
 const {ns}=load(),g=game(ns),u=new ns.entities.CombatUnit('soulsteel',100,100);g.build.items=[u];g.monsters=[enemy(ns)];g.synergy.update(.01);
 for(const souls of [0,2,3,9]){g.synergy.souls=souls;u.cooldown=0;const p=[];u.update(.01,g.monsters,p);assert.equal(p.length,1);assert.equal(g.synergy.souls,souls>=3?souls-3:souls);assert.equal(p[0].damage,u.config().damage*(souls>=3?1.5:1));assert.equal(p[0].splash,u.config().splash+(souls>=3?20:0));assert.equal(u.x,100);assert.equal(u.y,100);}
});
test('ancient dragon deals splash and retains nature combo; high-price soldiers enter normal combat pipeline',()=>{
 const {ns}=load();for(const type of ['dragon','royalCommander','soulsteel']){const g=game(ns),u=new ns.entities.CombatUnit(type,100,100);g.build.items=[u];g.monsters=[enemy(ns,140),enemy(ns,155)];g.synergy.souls=3;for(let i=0;i<15;i++)tick(g,.1);assert.ok(g.monsters.every(m=>m.health<1000),type);assert.equal(u.x,100);assert.equal(u.y,100);}
 const g=game(ns),u=new ns.entities.CombatUnit('dragon',100,100),m=enemy(ns,140);g.monsters=[m,enemy(ns,170)];m.natureMark={time:6,hits:0,damage:19,owner:g.hero};const before=g.monsters[1].health;g.synergy.hit(m,50,{owner:u,damage:110,natureExplosion:true});assert.ok(g.monsters[1].health<before);
});
test('old dragon is an enemy on waves 12 and 23, uses original art and cannot be hired',()=>{
 const {ns}=load(),f=new ns.systems.FactionSystem();f.choose('hunter');assert.equal(f.canHire('wildDragon'),false);const m=new ns.entities.Monster('wildDragon',12);assert.equal(m.name,'荒野翡翠龍');assert.equal(m.armorType,'arcane');const catalog=new ns.systems.WaveCatalog();for(const wave of [12,23])assert.ok(catalog.get(wave).groups.some(g=>g.type==='wildDragon'));
 const art=fs.readFileSync('src/td/systems/ArtSystem.js','utf8');assert.match(art,/enemyActions\.wildDragon=this\.load\('assets\/td\/faction-dragon-v1.png'\)/);
});
test('all ultimate atlas frames are transparent, populated and render within source image bounds',()=>{
 const {rgba}=require('./png-pixels.cjs'),{ns}=load(),A=ns.systems.ArtSystem;
 for(const [type,name] of [['dragon','dragon'],['royalCommander','commander'],['soulsteel','soulsteel']]){
  const file='assets/td/ultimate-'+name+'-v1.png',{width,height,pixels}=rgba(file),cw=width/2,ch=height/2;assert.equal(width%2,0);assert.equal(height%2,0);
  for(let row=0;row<2;row++)for(let col=0;col<2;col++){let clear=0,solid=0;for(let y=0;y<ch;y++)for(let x=0;x<cw;x++){const alpha=pixels[((row*ch+y)*width+col*cw+x)*4+3];if(alpha===0)clear++;if(alpha>220)solid++;}assert.ok(clear/(cw*ch)>.25,file);assert.ok(solid/(cw*ch)>.08,file);}
  const art=Object.create(A.prototype);art.combatUnits={[type]:{ready:true,width,height,assetSrc:file}};art.drawGearPieces=()=>{};art.drawRank=()=>{};const calls=[],ctx=new Proxy({drawImage(...a){calls.push(a);}},{get:(o,k)=>o[k]||(()=>{})}),u=new ns.entities.CombatUnit(type,100,100);
  for(const state of ['idle','attack'])for(let frame=0;frame<4;frame++){Object.assign(u,{state,frame});assert.ok(art.drawCombatUnit(ctx,u));}for(const c of calls){assert.ok(c[1]>=0&&c[2]>=0&&c[1]+c[3]<=width&&c[2]+c[4]<=height);}const scales=calls.map(c=>c[8]/c[4]);assert.ok(scales.every(v=>Math.abs(v-scales[0])<1e-9));assert.ok(calls.every(c=>Math.abs(c[6]+c[8]-12)<1e-9));
 }
});
