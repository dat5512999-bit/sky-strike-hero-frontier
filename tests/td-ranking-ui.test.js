'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs');
const {load}=require('./helpers/td-runtime.cjs');
const storage=()=>{const data=new Map();return {getItem:key=>data.get(key)??null,setItem:(key,value)=>data.set(key,value),removeItem:key=>data.delete(key)};};
const record=(id,score,outcome='success',map='beginner')=>({runId:id,score,scoreVersion:'BATTLE_V1',mode:'free',outcome,victory:outcome==='success',map,difficulty:'standard',profession:'hunter',faction:'hunter',time:130,waves:outcome==='retreated'?17:30,completedAt:'2026-09-22T00:00:00.000Z'});
const save=(store,rows)=>store.adapter('free').setItem('heroFrontierScoreRecordsV1',JSON.stringify({version:3,runs:rows}));

test('empty ranking contains no invented players or preview records',()=>{
  const {ns}=load(),store=new ns.systems.ProfileStore(storage()),view=new ns.ranking.RankingView(store);
  assert.match(view.render(),/還沒有遠征積分紀錄/);
  assert.doesNotMatch(view.render(),/258,420|ranking-preview|preview-/);
});
test('real wins, failures and retreats share one score order with visible outcomes',()=>{
  const {ns}=load(),store=new ns.systems.ProfileStore(storage());
  save(store,[record('win',1200),record('retreat',1800,'retreated'),record('failure',900,'failure'),record('story',9999,'success')]);
  const raw=JSON.parse(store.adapter('free').getItem('heroFrontierScoreRecordsV1'));raw.runs[3].mode='story';save(store,raw.runs);
  const view=new ns.ranking.RankingView(store),rows=view.rows().records;
  assert.equal(rows.map(r=>r.finalScore).join(','),'1800,1200,900');
  assert.equal(rows.map(r=>r.outcome).join(','),'retreated,success,failure');
  assert.match(view.render(),/撤退/);assert.match(view.render(),/1,800/);
});
test('records remain isolated by player profile and map filters',()=>{
  const {ns}=load(),store=new ns.systems.ProfileStore(storage());
  save(store,[record('a',1200),record('b',1500,'failure','twinpass')]);
  const view=new ns.ranking.RankingView(store);view.action('ranking-tab','map');view.action('ranking-map','twinpass');assert.equal(view.rows().records.length,1);
  store.newRound();assert.equal(new ns.ranking.RankingView(store).rows().records.length,0);
  save(store,[record('test',300)]);store.switchTo('admin');assert.equal(new ns.ranking.RankingView(store).rows().records.length,2);
});
test('broken records are reported without replacing original data',()=>{
  const {ns}=load(),store=new ns.systems.ProfileStore(storage()),adapter=store.adapter('free');adapter.setItem('heroFrontierScoreRecordsV1','{broken');
  assert.match(new ns.ranking.RankingView(store).render(),/積分紀錄無法讀取/);
  assert.equal(adapter.getItem('heroFrontierScoreRecordsV1'),'{broken');
});
test('retreat stores the visible live score once with its result and current wave',()=>{
  const {ns}=load(),store=new ns.systems.ProfileStore(storage()),report=new ns.systems.BattleReportSystem(store.adapter('free'));
  report.beginRun({map:'beginner',difficulty:'standard',profession:'hunter',faction:'hunter',mode:'free'});
  report.startWave(1,{baseHealth:20,gold:100,lumber:0,merit:0});report.current.killScore=75;report.current.time=14;
  const visible=report.scoreState().score,result=report.finalize('retreated',{baseHealth:18});
  assert.equal(result.score,visible);assert.equal(result.outcome,'retreated');assert.equal(result.waves,1);assert.equal(result.remainingBaseHP,18);
  assert.equal(report.finalize('retreated'),result);
  assert.equal(result.clearedWaves,0);assert.equal(result.rankingEligible,false);
  assert.equal(report.records.length,1,'keep the report history');
  assert.equal(new ns.ranking.RankingDataSource(store).read().records.length,0);
});
test('profile art follows the active player and the expedition screen starts hidden',()=>{
  const {ns}=load(),store=new ns.systems.ProfileStore(storage());
  store.setProfileArt('goblin');assert.equal(store.current().profileArt,'goblin');
  store.newRound();assert.equal(store.current().profileArt,undefined);
  store.setProfileArt('snow');store.switchTo('admin');assert.equal(store.current().profileArt,'goblin');
  assert.throws(()=>store.setProfileArt('unknown'),/找不到/);
  const html=fs.readFileSync(require('node:path').join(__dirname,'../td.html'),'utf8');
  assert.match(html,/<div id="td-profession-screen"[^>]*hidden>/);
  assert.match(html,/組建隊伍/);assert.doesNotMatch(html,/id="td-step-party-summary"/);
});
