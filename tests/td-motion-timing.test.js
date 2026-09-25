'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');

function load(){
  const root=path.resolve(__dirname,'..'),context=vm.createContext({console});
  context.globalThis=context;
  for(const file of ['src/td/namespace.js','src/td/config.js','src/td/systems/TargetSelector.js','src/td/entities/Monster.js','src/td/systems/EnemyCombatSystem.js','src/td/entities/Projectile.js','src/td/entities/CombatUnit.js'])
    vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),context,{filename:file});
  return context.TowerFrontier;
}

test('怪物停下時不踏步，受擊後迅速回到與移動距離同步的步態',()=>{
  const ns=load(),path=[{x:0,y:0},{x:1000,y:0}],monster=new ns.entities.Monster('grunt',1,path),control=new ns.entities.Monster('grunt',1,path);
  monster.update(.1,null,null,0);assert.equal(monster.state,'idle');assert.equal(monster.frame,0);
  monster.takeDamage(1);monster.update(.1);control.update(.1);assert.equal(monster.state,'hit');
  monster.update(.05);control.update(.05);assert.equal(monster.state,'walk');
  assert.equal(monster.routeDistance,control.routeDistance);
  assert.equal(monster.frame,control.frame);
});

test('怪物攻擊影格依預備、打擊與收勢前進，不受先前走路影格影響',()=>{
  const ns=load(),hero={x:40,y:0,active:true,takeDamage(){return 1;}},path=[{x:0,y:0},{x:1000,y:0}],monster=new ns.entities.Monster('brute',1,path),combat=new ns.systems.EnemyCombatSystem();
  monster.attackCooldown=0;monster.walkDistance=56;
  combat.update(.01,[monster],hero,[]);assert.ok(monster.attackWindup>0);
  const frames=[];
  for(const dt of [.1,.1,.17,.11]){monster.update(dt,hero,null,0);frames.push(monster.frame);combat.update(dt,[monster],hero,[]);}
  assert.deepEqual(frames,[0,1,2,3]);assert.equal(monster.state,'attack');
  monster.update(.2,hero,null,0);assert.equal(monster.state,'idle');assert.equal(monster.frame,0);
});

test('怪物攻擊蓄力與收勢時站穩面向目標，結束後沿原路前進',()=>{
  const ns=load(),hero={x:-20,y:0,active:true,takeDamage(){return 1;}},path=[{x:0,y:0},{x:1000,y:0}],monster=new ns.entities.Monster('brute',1,path),coarse=new ns.entities.Monster('brute',1,path),combat=new ns.systems.EnemyCombatSystem();
  monster.attackCooldown=0;combat.update(.01,[monster],hero,[]);
  coarse.attackCooldown=0;combat.update(.01,[coarse],hero,[]);
  assert.equal(monster.facing,Math.PI);
  for(let i=0;i<4;i++){
    monster.update(.12,hero);
    combat.update(.12,[monster],hero,[]);
    assert.equal(monster.routeDistance,0);
    assert.equal(monster.facing,Math.PI);
  }
  monster.update(.12,hero);
  combat.update(.12,[monster],hero,[]);
  coarse.update(.6,hero);
  assert.ok(monster.routeDistance>0);
  assert.equal(monster.facing,0);
  assert.ok(Math.abs(monster.routeDistance-coarse.routeDistance)<.0001);
});

test('守軍在冷卻末段預備，發射當格顯示打擊姿勢，收勢不重複發射',()=>{
  const ns=load(),unit=new ns.entities.CombatUnit('musketeer',100,100),target=new ns.entities.Monster('grunt',1),shots=[];
  target.x=170;target.y=100;unit.cooldown=.16;
  unit.update(.01,[target],shots);assert.equal(unit.state,'attack');assert.equal(unit.frame,0);assert.equal(shots.length,0);
  unit.update(.08,[target],shots);assert.equal(unit.frame,1);assert.equal(shots.length,0);
  unit.update(.08,[target],shots);assert.equal(unit.frame,2);assert.equal(shots.length,1);
  unit.update(.25,[target],shots);assert.equal(unit.frame,3);assert.equal(shots.length,1);
  unit.update(.2,[],shots);assert.equal(unit.state,'idle');assert.equal(shots.length,1);
});
