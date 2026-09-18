'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {load}=require('./helpers/td-runtime.cjs');

test('戰局統計記錄部署、升級、軍備快照與主力傷害',()=>{
  const {ns}=load(),report=new ns.systems.BattleReportSystem(),build=new ns.systems.BuildSystem(),economy=new ns.systems.EconomySystem();
  economy.gold=2000;economy.lumber=20;
  build.onTransaction=(action,subject,cost)=>report.recordInvestment(action,subject,cost);
  build.queue('arrow','building');build.stagePlacement(100,200);assert.equal(build.confirmPlacement(economy),true);
  const tower=build.selected,projectile={owner:tower};
  report.startWave(1,{baseHealth:20,gold:economy.gold,lumber:economy.lumber,totalSpent:economy.totalSpent,army:build.towers(),parTime:30});
  report.recordDamage(projectile,125.4);report.recordKill({type:'grunt'},{gold:8},projectile);
  assert.equal(build.upgrade(economy),true);
  const record=report.completeWave({baseHealth:20,gold:economy.gold,lumber:economy.lumber,totalSpent:economy.totalSpent,army:build.towers()},{gold:20,lumber:1});
  assert.equal(record.armyBefore.count,1);assert.equal(record.armyAfter.levels[2],1);
  const analysis=report.analysis();
  assert.equal(analysis.spending.deploy,100);assert.equal(analysis.spending.upgrade,280);
  assert.equal(analysis.topDamage[0].source,'塔：arrow');assert.equal(analysis.topDamage[0].damage,125);
  assert.match(report.analysisLine(),/部署 100G／升級 280G/);
});

test('未分類的經濟支出歸入商店且分析只提出訊號',()=>{
  const {ns}=load(),report=new ns.systems.BattleReportSystem();
  report.startWave(1,{baseHealth:20,gold:140,lumber:5,totalSpent:100,army:[]});
  report.completeWave({baseHealth:20,gold:60,lumber:5,totalSpent:180,army:[]},{gold:0,lumber:0});
  const analysis=report.analysis();
  assert.equal(analysis.spending.shop,180);assert.ok(analysis.signals.length>=1);
});
