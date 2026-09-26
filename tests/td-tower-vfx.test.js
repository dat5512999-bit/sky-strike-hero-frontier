'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {load,game,enemy}=require('./helpers/td-runtime.cjs');
const {strictCanvas}=require('./helpers/strict-canvas.cjs');
function shot(ns,type,branch,empowered=false){
  const tower=new ns.entities.Building(type,100,100);tower.level=branch?3:1;if(branch)tower.chooseBranch(branch);
  tower.networkPowered=true;tower.shotsFired=empowered?3:0;tower.cooldown=0;
  const monsters=[enemy(ns,180,100),enemy(ns,200,115),enemy(ns,220,100)],projectiles=[];
  tower.update(.01,monsters,projectiles,[]);return {tower,monsters,projectiles};
}
test('every tower of the five audited factions reaches a dedicated renderer, including all upgrade branches',()=>{
  const {ns}=load();let count=0;
  for(const faction of ['hunter','arcanist','rogue','wild','goblin'])for(const type of ns.systems.FactionSystem.FACTIONS[faction].buildings){
    count++;const branches=[null,...ns.systems.TowerEvolutionSystem.branches(type).map(b=>b.id)];
    for(const branch of branches){const {tower,monsters,projectiles}=shot(ns,type,branch,true),cfg=tower.config();
      if(cfg.supportOnly){assert.equal(projectiles.length,0);assert.ok(ns.systems.TowerVFX.SUPPORTS[type]);continue;}
      assert.ok(projectiles.length,type+'/'+branch);const p=projectiles[0];assert.ok(p.towerVfx,type+'/'+branch);
      for(let i=0;i<12;i++){p.flightAge=i/60;p.x=110+i*3;const c=strictCanvas();p.draw(c.ctx);assert.equal(c.depth,0);assert.equal(c.ctx.globalAlpha,1);assert.ok(c.calls.length>0);}
      p.update(1,monsters);assert.equal(p.hitResolved,true);const health=monsters.map(m=>m.health),hits=tower.shotsFired;
      for(let i=0;i<24;i++){ns.entities.Projectile.beginFrame(48);const c=strictCanvas();p.draw(c.ctx);assert.equal(c.depth,0);assert.equal(c.ctx.globalAlpha,1);p.update(1/60,monsters);}
      assert.equal(p.active,false);assert.deepEqual(monsters.map(m=>m.health),health,'impact must never hit again');assert.equal(tower.shotsFired,hits);
    }
  }
  assert.equal(count,27);
});
test('rocket, snare, stone, quake, ray and soul branches never collapse into generic projectile artwork',()=>{
  const {ns}=load(),cases=[['goblinSiege','rocket','rocket'],['goblinSnare',null,'snare'],['goblinSnare','tesla','electric-snare'],['boulder',null,'boulder'],['totem',null,'earth-shock'],['storm','surge','thunder-lance'],['crypt','reaper','wraith-chain'],['soul',null,'soul-scythe']];
  const shapes=[];for(const [type,branch,key]of cases){const p=shot(ns,type,branch).projectiles[0];assert.equal(p.towerVfx,key);const c=strictCanvas();p.draw(c.ctx);shapes.push(JSON.stringify(c.calls));}assert.equal(new Set(shapes).size,cases.length);
});
test('visual dispatch preserves combat outcomes with or without decoration budget and restores Canvas on faults',()=>{
  const {ns}=load();for(const type of Object.keys(ns.systems.TowerVFX.ATTACKS)){
    const decorated=shot(ns,type),plain=shot(ns,type);delete plain.projectiles[0].towerVfx;
    decorated.projectiles[0].update(1,decorated.monsters);plain.projectiles[0].update(1,plain.monsters);
    assert.deepEqual(decorated.monsters.map(m=>[m.health,m.slowTimer]),plain.monsters.map(m=>[m.health,m.slowTimer]),type);
    ns.entities.Projectile.beginFrame(0);const c=strictCanvas();decorated.projectiles[0].draw(c.ctx);assert.equal(c.calls.length,0);
  }
  ns.entities.Projectile.beginFrame(48);const p=shot(ns,'boulder').projectiles[0],c=strictCanvas();c.ctx.fill=()=>{throw Error('paint fault');};assert.throws(()=>p.draw(c.ctx),/paint fault/);assert.equal(c.depth,0);assert.equal(c.ctx.globalAlpha,1);
});
test('support decorations use real recipients, respect reduced effects and expire without gameplay mutation',()=>{
  const {ns}=load(),g=game(ns),tower=new ns.entities.Building('armoryForge',100,100),recipient=new ns.entities.Building('arrow',160,100);g.build.items=[tower,recipient];g.synergy.update(.1);
  assert.equal(recipient.supportDamageSource,tower);ns.entities.Projectile.beginFrame(48);const c=strictCanvas();ns.systems.TowerVFX.building(c.ctx,tower);assert.ok(c.calls.some(a=>a[0]==='quadraticCurveTo'));assert.equal(c.depth,0);
  const damage=recipient.config().damage;g.feedback.reducedFx=true;const quiet=strictCanvas();ns.systems.TowerVFX.building(quiet.ctx,tower);assert.equal(quiet.calls.length,0);assert.equal(recipient.config().damage,damage);
  g.feedback.reducedFx=false;g.build.items=[tower];g.synergy.update(.1);const empty=strictCanvas();ns.systems.TowerVFX.building(empty.ctx,tower);assert.ok(!empty.calls.some(a=>a[0]==='quadraticCurveTo'));
  for(const type of Object.keys(ns.systems.TowerVFX.SUPPORTS)){const t=new ns.entities.Building(type,100,100);t.synergy=g.synergy;t.networkPowered=true;ns.systems.TowerVFX.signal(t,12);for(const age of [0,.2,.74,.8,2]){t.visualAge=age;ns.entities.Projectile.beginFrame(48);const c=strictCanvas();ns.systems.TowerVFX.building(c.ctx,t);assert.equal(c.depth,0);assert.equal(c.ctx.globalAlpha,1);if(age>.75)assert.ok(!c.calls.some(a=>a[0]==='fillText'));}}
});
test('recycler income and successful discounts alone trigger money feedback',()=>{
  const {ns}=load(),network=new ns.systems.GoblinNetworkSystem(),core=new ns.entities.Building('goblinGenerator',100,100),recycler=new ns.entities.Building('goblinRecycler',130,100),economy={gold:0};
  for(let i=0;i<42;i++)network.update(.05,[core,recycler],economy,false);assert.equal(recycler.supportVfxUntil,undefined);
  for(let i=0;i<42;i++)network.update(.05,[core,recycler],economy,true);assert.equal(economy.gold,12);assert.equal(recycler.supportVfxValue,12);
  const build=new ns.systems.BuildSystem(),supply=new ns.entities.Building('supply',200,300),target=new ns.entities.Building('arrow',270,300);build.items=[supply,target];build.selected=target;
  const wallet=new ns.systems.EconomySystem();wallet.gold=0;assert.equal(build.upgrade(wallet),false);assert.equal(supply.supportVfxUntil,undefined);
  wallet.gold=1000;const discount=build.upgradeCost().savedGold;assert.equal(build.upgrade(wallet),true);assert.equal(supply.supportVfxValue,discount);
});
test('custom splash is drawn once while legacy and summoned explosions retain feedback',()=>{
  const {ns}=load(),g=game(ns);for(const type of ['cannon','boulder','grove','plague']){const {tower,monsters,projectiles}=shot(ns,type),p=projectiles[0];tower.synergy=g.synergy;g.monsters=monsters;p.update(1,monsters,null,(m,d,c,s)=>g.onHit(m,d,c,s));assert.equal(g.feedback.items.filter(i=>i.type==='explosion').length,0);}
  const m=enemy(ns);g.synergy.hit(m,1,{splash:50,target:m,style:'explosion'});assert.equal(g.feedback.items.filter(i=>i.type==='explosion').length,1);
});
