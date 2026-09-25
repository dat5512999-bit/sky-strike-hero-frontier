'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.resolve(__dirname,'..');
function load(){const context=vm.createContext({console});context.globalThis=context;for(const file of ['src/td/namespace.js','src/td/config.js','src/td/systems/FrameTimingSystem.js','src/td/systems/PerformanceMonitor.js','src/td/entities/Monster.js'])vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),context,{filename:file});return context.TowerFrontier;}

test('低於 30 FPS 時依實際經過時間補足模擬，不再每幀只算 33ms',()=>{
  const Frame=load().systems.FrameTimingSystem,clock=new Frame(1000);
  const plan=clock.next(1050,1);
  assert.ok(Math.abs(plan.steps*plan.step-.1)<1e-9);
  assert.ok(plan.step<=1/30+1e-9);
  assert.equal(plan.backlogMs,0);
});

test('三倍速追趕有步數上限，暫停與背景返回不累積突發更新',()=>{
  const Frame=load().systems.FrameTimingSystem,clock=new Frame(1000);
  const busy=clock.next(1050,3);assert.equal(busy.steps,9);assert.equal(busy.backlogMs,0);
  const paused=clock.next(6050,3,false);assert.equal(paused.steps,0);assert.equal(paused.backlogMs,0);
  const resumed=clock.next(6066,3);assert.ok(resumed.steps<=3);assert.ok(resumed.step<=1/30+1e-9);
  const hidden=clock.next(7066,1);assert.ok(hidden.steps<=12);assert.ok(hidden.discardedMs>0);
});

test('持續 15 與 20 FPS 時三倍速不會逐幀丟掉戰鬥時間',()=>{
  const Frame=load().systems.FrameTimingSystem;
  for(const fps of [15,20]){
    const clock=new Frame(1000);let advanced=0,last;
    for(let frame=1;frame<=fps*60;frame++){
      last=clock.next(1000+frame*1000/fps,3);
      advanced+=last.steps*last.step;
      assert.ok(last.steps<=12);
      assert.ok(last.step<=1/30+1e-9);
    }
    assert.ok(Math.abs(advanced-360)<.001,`${fps} FPS advanced ${advanced} instead of 360`);
    assert.ok(last.discardedMs<.001,`${fps} FPS discarded ${last.discardedMs}ms`);
  }
});

test('持續 10 FPS 時三倍速自動降至二倍速，恢復幀率後回到三倍速',()=>{
  const ns=load(),clock=new ns.systems.FrameTimingSystem(0),guard=new ns.systems.SpeedLoadGuard();
  let transitions=0,advanced=0,time=0;
  for(let i=0;i<300;i++){time+=100;const plan=clock.next(time,guard.speed(3));advanced+=plan.steps*plan.step;if(guard.observe(plan,3,true))transitions++;}
  assert.equal(guard.speed(3),2);assert.equal(transitions,1);
  assert.ok(clock.discarded*1000<10000,'保護後應限制持續時間流失');
  for(let i=0;i<500;i++){time+=1000/30;const plan=clock.next(time,guard.speed(3));if(guard.observe(plan,3,true))transitions++;}
  assert.equal(guard.speed(3),3);assert.equal(transitions,2);
  assert.ok(advanced>0);
});

test('暫停、單一卡頓與玩家改選二倍速不觸發保護',()=>{
  const ns=load(),clock=new ns.systems.FrameTimingSystem(0),guard=new ns.systems.SpeedLoadGuard();
  const spike=clock.next(900,3);assert.equal(guard.observe(spike,3,true),false);
  for(let t=1000;t<=3000;t+=100){const plan=clock.next(t,3,false);guard.observe(plan,3,false);}
  assert.equal(guard.speed(3),3);
  guard.reset();assert.equal(guard.speed(2),2);
});

test('效能資訊可開關，低更新頻率顯示實際影格與冰霜特效數',()=>{
  const Monitor=load().systems.PerformanceMonitor,panel={hidden:true,dataset:{}},button={setAttribute(name,value){this[name]=value;}},monitor=new Monitor(panel,button);
  assert.equal(monitor.toggle(),true);assert.equal(panel.hidden,false);
  for(let i=1;i<=40;i++)monitor.record({timestamp:i*17,realMs:17,updateMs:3,drawMs:6,backlogMs:0,discardedMs:0,monsters:20,frostVfx:12,speed:1});
  assert.match(panel.textContent,/FPS 59/);assert.match(panel.textContent,/怪物 20 · 冰霜特效 12/);
  assert.equal(monitor.toggle(),false);assert.equal(panel.hidden,true);
});

test('緩速腳步放慢但不中斷，轉彎方向漸進，完全停下不踏步',()=>{
  const ns=load(),route=[{x:0,y:0},{x:1000,y:0}],normal=new ns.entities.Monster('grunt',1,route),slowed=new ns.entities.Monster('grunt',1,route);
  slowed.applySlow(.6,1);normal.update(.2);slowed.update(.2);
  assert.ok(slowed.routeDistance<normal.routeDistance);
  assert.ok(slowed.walkPhase<normal.walkPhase&&slowed.walkPhase>slowed.walkDistance/64*8);
  const turn=new ns.entities.Monster('grunt',1,[{x:0,y:0},{x:20,y:0},{x:20,y:100}]);turn.setRouteDistance(19);
  turn.update(.02);assert.ok(turn.visualHeading>0&&turn.visualHeading<Math.PI/2);
  turn.update(.1);assert.ok(turn.visualHeading>1&&turn.visualHeading<=Math.PI/2);
  const phase=turn.walkPhase;turn.update(.1,null,null,0);assert.equal(turn.walkPhase,phase);assert.equal(turn.state,'idle');
});
