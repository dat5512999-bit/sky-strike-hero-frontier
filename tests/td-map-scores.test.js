'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),{load}=require('./helpers/td-runtime.cjs');
function setup(saved){const {ns}=load(),B=ns.systems.BattleReportSystem;let data=saved?JSON.stringify(saved):null;const storage={getItem:()=>data,setItem:(key,value)=>{data=value;}};return {B,storage,read:()=>JSON.parse(data)};}
function finish(report,map,score,difficulty='standard'){report.reset();report.beginRun({map,mapName:map,difficulty,difficultyName:difficulty});report.totals=()=>({score,time:0,timeBonus:0});return report.finalize(true);}
test('不同地圖各自比較最高分，切換及重新載入都不串分',()=>{
 const {B,storage,read}=setup(),r=new B(storage);
 assert.equal(finish(r,'beginner',900).isNewBest,true);
 assert.equal(finish(r,'twinpass',100).isNewBest,true);
 assert.equal(r.bestScore,100);assert.equal(r.bestForMap('beginner'),900);
 assert.equal(finish(r,'twinpass',90).isNewBest,false);
 const restored=new B(storage);restored.beginRun({map:'twinpass'});assert.equal(restored.scoreState().bestScore,100);
 restored.beginRun({map:'beginner'});assert.equal(restored.bestScore,900);
 restored.beginRun({map:'future-map'});assert.equal(restored.bestScore,0);assert.equal(read().version,3);
});
test('每張地圖的四種難度各自保存最佳分，同時保留全難度最高分',()=>{
 const {B,storage,read}=setup(),r=new B(storage);
 finish(r,'beginner',500,'story');finish(r,'beginner',900,'veteran');finish(r,'beginner',700,'calamity');
 assert.equal(r.bestForDifficulty('beginner','story'),500);assert.equal(r.bestForDifficulty('beginner','veteran'),900);assert.equal(r.bestForDifficulty('beginner','calamity'),700);assert.equal(r.bestForMap('beginner'),900);
 const restored=new B(storage);restored.beginRun({map:'beginner',difficulty:'calamity',difficultyName:'災厄遠征'});const state=restored.scoreState();assert.equal(state.difficultyBestScore,700);assert.equal(state.bestScore,900);assert.equal(read().version,3);
});
test('V2 地圖紀錄依紀錄中的明確難度安全升級，不猜測缺少難度的舊資料',()=>{
 const {B,storage,read}=setup({version:2,bestByMap:{beginner:1200},legacyBestScore:0,runs:[{map:'beginner',difficulty:'story',score:400},{map:'beginner',difficulty:'veteran',score:800},{map:'beginner',score:1200}]});
 const r=new B(storage);assert.equal(r.bestForMap('beginner'),1200);assert.equal(r.bestForDifficulty('beginner','story'),400);assert.equal(r.bestForDifficulty('beginner','veteran'),800);assert.equal(r.bestForDifficulty('beginner','calamity'),0);r.saveRecords();assert.equal(read().version,3);
});
test('每張地圖保留每場實際紀錄且最高分不會丟失',()=>{
 const {B,storage}=setup(),r=new B(storage);finish(r,'beginner',1000);finish(r,'twinpass',2000);
 for(let i=0;i<25;i++)finish(r,'beginner',i);
 assert.equal(r.recordsForMap('beginner').length,26);assert.equal(r.recordsForMap('twinpass').length,1);
 assert.equal(new B(storage).bestForMap('beginner'),1000);
});
test('舊版只依實際地圖分數歸類，混合最高分不灌入任一地圖',()=>{
 const {B,storage,read}=setup({version:1,bestScore:9999,runs:[{map:'beginner',score:400,bestScore:9999},{map:'twinpass',score:200,bestScore:9999},{score:800}]});
 const r=new B(storage);assert.equal(r.bestForMap('beginner'),400);assert.equal(r.bestForMap('twinpass'),200);assert.equal(r.legacyBestScore,9999);assert.equal(r.recordsForMap('legacy').length,1);
 r.saveRecords();assert.equal(read().legacyBestScore,9999);assert.equal(new B(storage).bestForMap('twinpass'),200);
});
test('儲存不可用或損毀仍可結算，重複結算不重複存入',()=>{
 const {B}=setup(),r=new B({getItem(){return '{broken';},setItem(){throw Error('quota');}});
 const result=finish(r,'twinpass',80);assert.equal(result.bestScore,80);assert.equal(r.finalize(true),result);assert.equal(r.records.length,1);
});
