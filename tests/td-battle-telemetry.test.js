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

test('策略標籤、投資效率、支援貢獻與升級里程碑可比較',()=>{
  const {ns}=load(),report=new ns.systems.BattleReportSystem(),tower={kind:'building',type:'arrow',level:1,totalSpent:100,active:true},support={kind:'building',type:'battleflag'};
  assert.equal(report.setStrategy('core'),true);assert.equal(report.setStrategy('invalid'),false);
  report.recordInvestment('deploy',tower,{gold:100,wood:2});
  report.recordDamage({owner:tower},500);report.recordKill({type:'grunt'},{gold:8},{owner:tower});
  tower.level=3;report.recordInvestment('upgrade',tower,{gold:420,merit:0});
  report.recordSupport(support,'bonusDamage',80);report.recordSupport(support,'coverageSeconds',12.4);
  const analysis=report.analysis();
  assert.equal(analysis.strategy,'core');assert.equal(analysis.milestones.level3.type,'arrow');
  assert.equal(analysis.efficiency[0].source,'塔：arrow');assert.equal(analysis.efficiency[0].damagePer100,96);
  assert.equal(analysis.support[0].bonusDamage,80);assert.equal(analysis.support[0].coverageSeconds,12);
});

test('壓力斷層只在有前期基準後標記，歷史比較限制相同配置',()=>{
  const {ns}=load(),data=new Map(),storage={getItem:key=>data.get(key)||null,setItem:(key,value)=>data.set(key,value)},report=new ns.systems.BattleReportSystem(storage);
  report.beginRun({map:'beginner',difficulty:'standard',profession:'hunter',faction:'hunter',strategy:'expand'});
  [20,20,20,60].forEach((time,index)=>{report.startWave(index+1,{baseHealth:20,gold:100,lumber:5,parTime:20,army:[]});report.update(time);report.completeWave({baseHealth:index===3?16:20,gold:100,lumber:5,army:[]},{gold:0,lumber:0});});
  assert.equal(report.latest().pressureSpike,true);const result=report.finalize(false);assert.deepEqual(Array.from(result.analysis.pressureSpikes),[4]);
  const restored=new ns.systems.BattleReportSystem(storage);restored.beginRun({map:'beginner',difficulty:'standard',profession:'hunter',faction:'hunter'});
  const rows=restored.historyComparison();assert.equal(rows.length,1);assert.equal(rows[0].strategy,'expand');assert.deepEqual(Array.from(rows[0].spikes),[4]);
  restored.beginRun({map:'autumn'});assert.equal(restored.historyComparison().length,0);
});

test('第三階段需三種策略各三局才會提出平衡判定',()=>{
  const {ns}=load(),report=new ns.systems.BattleReportSystem(),base={map:'beginner',difficulty:'standard',profession:'hunter',faction:'hunter',balanceVersion:ns.systems.BattleReportSystem.BALANCE_VERSION};
  report.beginRun(base);
  ['expand','core','mixed'].forEach(strategy=>{for(let i=0;i<3;i+=1)report.records.push(Object.assign({},base,{strategy,victory:i>0,waves:strategy==='expand'?24:22,score:1000,time:300,remainingGold:80,analysis:{totalSpent:1000}}));});
  const ready=report.balanceReadiness();
  assert.equal(ready.ready,true);assert.equal(ready.total,9);assert.equal(ready.groups.expand.count,3);assert.equal(ready.groups.core.winRate,2/3);assert.ok(ready.recommendations.length);
});

test('第三階段樣本不足時不建議直接調整經濟',()=>{
  const {ns}=load(),report=new ns.systems.BattleReportSystem();report.beginRun({map:'beginner',difficulty:'standard',profession:'hunter',faction:'hunter'});
  report.records.push({map:'beginner',difficulty:'standard',profession:'hunter',faction:'hunter',strategy:'expand',waves:10,score:100});
  const state=report.balanceReadiness();assert.equal(state.ready,false);assert.equal(state.missing.length,3);assert.match(state.recommendations[0],/不建議修改塔價/);
});

test('邊境補給不再產出功勳，Boss 與固定兌換仍保留',()=>{
  const {ns}=load(),loot=new ns.systems.LootSystem(),economy=new ns.systems.EconomySystem(),item=loot.get('frontier-supplies');
  assert.deepEqual(Object.assign({},item.resources),{gold:120,lumber:2});assert.equal(item.description.includes('功勳'),false);
  assert.equal(economy.addKill({reward:100,type:'boss'},0).merit,1);economy.gold=1000;assert.equal(economy.exchangeGoldForMerit(),true);assert.equal(economy.merit,2);
});

test('戰報分開記錄功勳來源、兌換、升級消耗與實際策略',()=>{
  const {ns}=load(),report=new ns.systems.BattleReportSystem(),tower={kind:'building',type:'arrow',level:4};report.beginRun({strategy:'mixed'});
  report.recordMerit('boss',3);report.recordMerit('loot',1);report.recordExchange('gold-to-merit',1000);report.recordExchange('merit-to-gold',1000);report.recordInvestment('deploy',{kind:'building',type:'arrow'},{gold:100});report.recordInvestment('upgrade',tower,{gold:700,merit:2});
  const analysis=report.analysis();assert.equal(analysis.actualStrategy,'core');assert.equal(analysis.spending.exchange,1000);assert.deepEqual(Object.assign({},analysis.merit),{bossEarned:3,lootEarned:1,exchangeIn:1,exchangeOut:1,upgradeSpent:2});assert.match(report.analysisLine(),/實際 核心升級/);
});

test('不同平衡版本的舊戰績不會混入比較樣本',()=>{
  const {ns}=load(),report=new ns.systems.BattleReportSystem();report.beginRun({map:'beginner',difficulty:'standard',profession:'hunter',faction:'hunter'});report.records.push({map:'beginner',difficulty:'standard',profession:'hunter',faction:'hunter',balanceVersion:'old-economy',strategy:'mixed',waves:30,score:999});assert.equal(report.historyComparison().length,0);assert.equal(report.balanceReadiness().total,0);
});
