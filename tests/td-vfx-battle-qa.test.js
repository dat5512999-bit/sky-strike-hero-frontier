'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {load,game,enemy}=require('./helpers/td-runtime.cjs'),{strictCanvas}=require('./helpers/strict-canvas.cjs');
function fixture(){const {ns}=load(),g=game(ns);g.art={soldierAtlas:{ready:true,width:1254,height:1254},towerPaintedAtlas:{ready:true,width:1254,height:1254},towerMagicAtlas:{ready:true,width:1254,height:1254}};return {ns,g};}
test('frost soldiers are in release pose on the exact projectile-release tick at 30/60 FPS',()=>{
 const {ns}=fixture();for(const fps of [30,60])for(const type of Object.keys(ns.systems.FrostlandAnimation.DURATIONS)){
  const u=new ns.entities.CombatUnit(type,100,100),m=enemy(ns,145),shots=[];ns.systems.FrostlandAnimation.queue(u,[m],{damage:1});
  for(let i=0;i<fps;i++){ns.systems.FrostlandAnimation.update(u,1/fps,[m],shots);if(shots.length){assert.ok(ns.systems.FrostlandAnimation.pose(u).frame>=2,type+' '+fps+' FPS released in windup frame');break;}}
  assert.equal(shots.length,1);
 }
});
test('charge body reaches the target on the damage tick without changing its deployment anchor',()=>{
 for(const fps of [30,60])for(const type of ['knight','boarRider']){
  const {ns,g}=fixture(),u=new ns.entities.CombatUnit(type,100,100),m=enemy(ns,190),shots=[];u.synergy=g.synergy;u.cooldown=0;u.attack(m,u.config(),shots,[m]);const p=shots[0];
  for(let i=0;i<fps;i++){u.excursion.time=Math.max(0,u.excursion.time-1/fps);p.update(1/fps,[m]);if(p.hitResolved)break;}
  let actor;const c=strictCanvas();u.draw(c.ctx,false,{drawCombatUnit(ctx,v){actor={x:v.x,y:v.y};return true;}});assert.ok(Math.abs(actor.x-m.x)<1,type+' visual '+actor.x+' target '+m.x);assert.equal(u.x,100);assert.equal(u.y,100);
 }
});
test('mobile flight decorations cannot consume the budget reserved for actual impacts',()=>{
 const {ns,g}=fixture(),u=new ns.entities.CombatUnit('hunter',100,100),m=enemy(ns,180);u.synergy=g.synergy;const flights=Array.from({length:60},()=>new ns.entities.Projectile(u,m,{damage:1})),hit=new ns.entities.Projectile(u,m,{damage:1});hit.hit([m]);
 ns.entities.Projectile.beginFrame(48);for(const p of flights)p.draw(strictCanvas().ctx);const c=strictCanvas();hit.draw(c.ctx);assert.ok(c.calls.some(a=>a[0]==='drawImage'),'contact disappeared behind flight decorations');
});
test('enemy hit displacement restores Canvas state for following actors and health bars',()=>{
 const {ns}=fixture(),m=enemy(ns,180);for(const state of ['walk','attack','death']){m.state=state;m.hitKickTime=.08;m.hitKickDuration=.12;m.hitKickX=4;m.hitKickY=2;m.deathTime=.4;const c=strictCanvas();m.draw(c.ctx,{drawMonster:()=>true});assert.equal(c.depth,0,state);assert.equal(c.ctx.globalAlpha,1);}
});
test('charge cancellation and return stay visual and expire, while decoration plus impact allocations remain bounded',()=>{
 const {ns,g}=fixture(),u=new ns.entities.CombatUnit('knight',100,100),m=enemy(ns,250),shots=[];u.synergy=g.synergy;u.cooldown=0;u.attack(m,u.config(),shots,[m]);const p=shots[0];p.update(.03,[m]);m.active=false;p.update(.01,[m]);assert.equal(p.active,false);assert.ok(u.excursion.vfxReturning);assert.ok(u.excursion.vfxPeak<1);u.excursion.time=0;let x;u.draw(strictCanvas().ctx,false,{drawCombatUnit(c,a){x=a.x;return true;}});assert.equal(x,100);
 ns.entities.Projectile.beginFrame(48);let decoration=0,impact=0;while(ns.entities.Projectile.claimEffect())decoration++;while(ns.entities.Projectile.claimImpact())impact++;assert.equal(decoration,24);assert.equal(impact,24);assert.equal(ns.entities.Projectile.effectBudget,0);
});
test('mobile crowded effects keep contact cores but remove decoration without touching health or persistent preferences',()=>{
 const {ns,g}=fixture(),u=new ns.entities.CombatUnit('orc',100,100),m=enemy(ns,180);u.synergy=g.synergy;const p=new ns.entities.Projectile(u,m,{damage:10});p.hit([m]);g.feedback.mobile=true;g.projectiles=Array(49).fill(p);const health=m.health;
 ns.entities.Projectile.beginFrame(48);const crowded=strictCanvas();p.draw(crowded.ctx);assert.equal(crowded.calls.filter(a=>a[0]==='drawImage').length,1);assert.equal(m.health,health);assert.equal(!!g.feedback.reducedFx,false);
 g.projectiles=[];ns.entities.Projectile.beginFrame(48);const clear=strictCanvas();p.draw(clear.ctx);assert.ok(clear.calls.filter(a=>a[0]==='drawImage').length>1);assert.equal(m.health,health);
});
