'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {load}=require('./helpers/td-runtime.cjs');
const fs=require('node:fs');

test('自由遠征六張地圖保留三張可見並可向右滑動',()=>{
  const html=fs.readFileSync('td.html','utf8'),css=fs.readFileSync('td-expedition.css','utf8');
  for(const id of ['beginner','twinpass','autumn','silverleaf','shadowfall','frostborn'])assert.match(html,new RegExp('data-map-id="'+id+'"'));
  assert.match(css,/\.map-thumbnail-strip\{display:flex!important;overflow-x:auto!important/);
});

test('劇情首通才標示新戰場，重玩不重複宣告獎勵，儲存失敗不提供前往按鈕',()=>{
  const {ns}=load();ns.maps={definitions:{twinpass:{name:'雙隘口要塞'}}};
  const mission=ns.systems.StoryCatalog.mission,result={score:642,grade:'B',time:70.2,waves:3,persisted:true};
  const nextMission=ns.systems.StoryCatalog.missions[1];
  const first=ns.systems.ResultScreen.view(result,{mode:'story',victory:true,mission,nextMission,saved:true,canContinue:true,newlyUnlocked:true});
  assert.equal(first.title,'烽火初燃');assert.equal(first.showUnlock,true);assert.equal(first.rewardName,'雙隘口要塞');
  assert.equal(first.unlockLabel,'新戰場解鎖');assert.equal(first.score,'642');assert.equal(first.time,'70');
  const replay=ns.systems.ResultScreen.view(result,{mode:'story',victory:true,mission,nextMission,saved:true,canContinue:true,newlyUnlocked:false});
  assert.equal(replay.unlockLabel,'已解鎖戰場');assert.match(replay.intro,/再次守住/);
  const failedSave=ns.systems.ResultScreen.view(result,{mode:'story',victory:true,mission,saved:false,canContinue:false});
  assert.equal(failedSave.showUnlock,false);assert.match(failedSave.intro,/尚未儲存/);
});

test('失敗及自由遠征結算保留成績但不顯示劇情解鎖',()=>{
  const {ns}=load(),result={score:321,grade:'C',time:68,waves:2,persisted:true};
  const loss=ns.systems.ResultScreen.view(result,{mode:'story',victory:false,wave:3,mission:ns.systems.StoryCatalog.mission});
  assert.equal(loss.title,'谷地失守');assert.match(loss.intro,/第 3 波/);assert.equal(loss.showUnlock,false);
  const free=ns.systems.ResultScreen.view({...result,waves:30,isNewBest:true},{mode:'free',victory:true});
  assert.equal(free.title,'遠征完成');assert.equal(free.showUnlock,false);
  assert.match(free.highlight,/刷新本地圖最佳紀錄/);assert.equal(free.returnLabel,'返回大廳');
});

test('劇情結算按鈕選取下一個任務並返回章節地圖，不進自由遠征',()=>{
  const {ns}=load(),app=Object.create(ns.systems.FrontierApp.prototype),opened=[];
  const current=ns.systems.StoryCatalog.missions[1],next=ns.systems.StoryCatalog.missions[2];
  app.activeStoryMission=current;
  app.store={current:()=>({completed:[current.id]})};
  app.openStoryMap=()=>{opened.push('story');return true;};
  assert.equal(app.openNextStory(),true);
  assert.equal(app.selectedStoryMission,next.id);
  assert.deepEqual(opened,['story']);
});
