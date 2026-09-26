'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const {load,game,enemy}=require('./helpers/td-runtime.cjs'),{strictCanvas}=require('./helpers/strict-canvas.cjs'),{rgba}=require('./png-pixels.cjs');
function fixture(){const {ns}=load(),g=game(ns);g.art={soldierAtlas:{ready:true,width:1254,height:1254},towerPaintedAtlas:{ready:true,width:1254,height:1254},towerMagicAtlas:{ready:true,width:1254,height:1254}};return {ns,g};}
function shoot(ns,g,type,level=1){const u=new ns.entities.CombatUnit(type,100,100);u.level=level;u.synergy=g.synergy;u.cooldown=0;u.networkPowered=true;const targets=[enemy(ns,140),enemy(ns,165),enemy(ns,180)],shots=[];u.attack(targets[0],u.config(),shots,targets);ns.systems.FrostlandAnimation.update(u,1,targets,shots);ns.systems.GoblinAnimation.update(u,1,targets,shots);return {u,p:shots[0],targets};}
test('every configured attacking soldier uses an explicit presentation; support, heroes, summons and towers are isolated',()=>{
 const {ns,g}=fixture();let covered=0;
 for(const [type,cfg]of Object.entries(ns.config.units)){
  if(cfg.supportOnly){assert.equal(ns.systems.UnitVFX.key(new ns.entities.CombatUnit(type,0,0)),null);continue;}
  const {u,p,targets}=shoot(ns,g,type);assert.ok(p,type);assert.ok(ns.systems.UnitVFX.PROFILES[p.unitVfx],type);assert.equal(p.damage,u.config().damage,type);covered++;
  const flight=strictCanvas();ns.entities.Projectile.beginFrame(96);p.draw(flight.ctx);assert.ok(flight.calls.some(c=>c[0]==='drawImage'),type+' flight');assert.equal(flight.depth,0);
  p.update(1,targets);assert.ok(p.hitResolved);assert.ok(p.active);
  const health=targets.map(t=>t.health);
  for(const t of [0,.08,.2,.319]){p.trail=.32-t;ns.entities.Projectile.beginFrame(96);const c=strictCanvas();p.draw(c.ctx);assert.ok(c.calls.some(a=>a[0]==='drawImage'),type+' hit');assert.equal(c.depth,0);assert.equal(c.ctx.globalAlpha,1);for(const call of c.calls.filter(a=>a[0]==='drawImage')){const [,image,x,y,w,h]=call;assert.ok(Number.isInteger(x)&&Number.isInteger(y)&&x>=0&&y>=0&&x+w<=image.width&&y+h<=image.height);}}
  assert.deepEqual(targets.map(t=>t.health),health);p.update(.5,targets);assert.equal(p.active,false);
 }
 assert.equal(covered,43);
 for(const kind of ['hero','summon','building'])assert.equal(ns.systems.UnitVFX.key({kind,type:'dragon'}),null);
});
test('presentation does not alter targeting, damage, statuses or original style',()=>{
 for(const type of ['royalCommander','dragon','centaur','nagaVenomStalker','frostWolf','goblinMech','soulsteel']){
  const {ns,g}=fixture(),on=shoot(ns,g,type),off=shoot(ns,g,type);off.p.unitVfx=null;
  on.p.update(1,on.targets);off.p.update(1,off.targets);
  assert.equal(on.p.style,off.p.style,type);assert.equal(on.p.damage,off.p.damage,type);assert.deepEqual(on.targets.map(t=>[t.health,t.slowTimer,t.frost]),off.targets.map(t=>[t.health,t.slowTimer,t.frost]),type);
 }
});
test('melee has no travelling orb; breath has a material cone; impacts use frozen contact points',()=>{
 const {ns,g}=fixture(),{p,targets}=shoot(ns,g,'orc');p.flightAge=.2;const c=strictCanvas();p.draw(c.ctx);assert.equal(c.calls.filter(a=>a[0]==='drawImage').length,0);
 p.update(1,targets);const point={...p.chainPoints[1]};targets[0].x+=300;ns.entities.Projectile.beginFrame(96);const hit=strictCanvas();p.draw(hit.ctx);assert.ok(hit.calls.some(a=>a[0]==='translate'&&a[1]===point.x&&a[2]===point.y));
 const breath=shoot(ns,g,'dragon').p;breath.x=125;const b=strictCanvas();breath.draw(b.ctx);assert.ok(b.calls.some(a=>a[0]==='drawImage'&&a[1]===g.art.soldierAtlas));
});
test('budgets, reduced mode, missing images and draw exceptions remain safe',()=>{
 const {ns,g}=fixture(),{p,targets}=shoot(ns,g,'hunter');p.update(1,targets);
 ns.entities.Projectile.beginFrame(0);const empty=strictCanvas();p.draw(empty.ctx);assert.equal(empty.calls.length,0);assert.equal(empty.depth,0);
 ns.entities.Projectile.beginFrame(96);g.feedback.reducedFx=true;const reduced=strictCanvas();p.draw(reduced.ctx);assert.equal(reduced.calls.filter(a=>a[0]==='drawImage').length,1);
 const fault=strictCanvas();fault.ctx.drawImage=()=>{throw Error('draw fault');};assert.throws(()=>p.draw(fault.ctx),/draw fault/);assert.equal(fault.depth,0);
 g.art.soldierAtlas.ready=false;const fallback=shoot(ns,g,'hunter').p,c=strictCanvas();fallback.draw(c.ctx);assert.ok(c.calls.some(a=>a[0]==='lineTo'));assert.equal(c.depth,0);
});
test('support shows actual beneficiaries, not idle or expired aura coverage',()=>{
 const {ns,g}=fixture(),u=new ns.entities.CombatUnit('timeMage',100,100),t=new ns.entities.CombatUnit('hunter',130,100);u.synergy=g.synergy;g.build.items=[u,t];
 ns.entities.Projectile.beginFrame(96);const idle=strictCanvas();ns.systems.UnitVFX.support(idle.ctx,u);assert.equal(idle.calls.length,0);
 g.synergy.clock=1;t.supportHasteSource=u;t.supportHaste=.3;const active=strictCanvas();ns.systems.UnitVFX.support(active.ctx,u);assert.ok(active.calls.some(a=>a[0]==='drawImage'));assert.equal(active.depth,0);
 t.supportHasteSource=null;const expired=strictCanvas();ns.systems.UnitVFX.support(expired.ctx,u);assert.equal(expired.calls.length,0);
});
test('new atlas has real alpha, four nonempty padded cells, and is included in offline delivery',()=>{
 const {ns}=load(),p=rgba(ns.systems.UnitVFX.PATH);
 for(let k=0;k<4;k++){let body=0,clear=0,edge=0;const x0=Math.round(k%2*p.width/2),x1=Math.round((k%2+1)*p.width/2),y0=Math.round(Math.floor(k/2)*p.height/2),y1=Math.round((Math.floor(k/2)+1)*p.height/2);
  for(let y=y0;y<y1;y++)for(let x=x0;x<x1;x++){const a=p.pixels[(y*p.width+x)*4+3];if(!a)clear++;if(a>50){body++;if(x-x0<4||x1-x<5||y-y0<4||y1-y<5)edge++;}}
  assert.ok(body>1000);assert.ok(clear>10000);assert.equal(edge,0,'cell '+k);
 }
 const sw=fs.readFileSync('sw.js','utf8');assert.ok(sw.includes(ns.systems.UnitVFX.PATH));assert.ok(sw.includes('src/td/systems/UnitVFX.js'));
});
test('levels 1 to 5, charged attacks and dead targets keep bounded rendering lifetimes',()=>{
 const {ns,g}=fixture();
 for(const [type,cfg]of Object.entries(ns.config.units))if(!cfg.supportOnly)for(let level=1;level<=5;level++){
  const {p,targets}=shoot(ns,g,type,level);p.soulCharged=true;p.drumBurst=true;p.hit(targets);p.trail=.12;ns.entities.Projectile.beginFrame(3);const c=strictCanvas();p.draw(c.ctx);assert.equal(c.depth,0);assert.ok(ns.entities.Projectile.effectBudget>=0);
 }
 const {p,targets}=shoot(ns,g,'dragon');targets[0].active=false;p.update(.01,targets);assert.equal(p.active,false);const c=strictCanvas();p.draw(c.ctx);assert.equal(c.calls.length,0);
});
test('new atlas participates in load, failure reporting and retry; old artillery splash is not doubled',()=>{
 const vm=require('node:vm'),requests=[];class Art{load(path){return{assetSrc:path,ready:false,failed:false};}preloadFaction(){}coreStatus(){return{loaded:0,total:0,ready:true,failed:false};}failedAssets(){return [];}retryFailed(){}request(i){requests.push(i);}}
 const context=vm.createContext({Image:function(){},TowerFrontier:{systems:{ArtSystem:Art}}});vm.runInContext(fs.readFileSync('src/td/systems/UnitVFX.js','utf8'),context);
 const a=new Art();a.preloadFaction();assert.equal(a.coreStatus().ready,false);a.soldierAtlas.failed=true;assert.equal(a.coreStatus().failed,true);assert.equal(a.failedAssets().length,1);a.retryFailed();assert.equal(requests.length,1);a.soldierAtlas.ready=true;assert.equal(a.coreStatus().ready,true);
 const {ns,g}=fixture(),{p,targets}=shoot(ns,g,'pirate');let explosions=0;g.feedback.explosion=()=>{explosions++;};g.synergy.hit(targets[0],10,p);assert.equal(explosions,0);
 g.art.soldierAtlas.ready=false;g.art.towerPaintedAtlas.ready=false;const fallback=shoot(ns,g,'pirate').p;g.synergy.hit(targets[0],10,fallback);assert.equal(explosions,1);
});
