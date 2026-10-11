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
  assert.equal(first.title,'護證撤離・戰術重現');assert.equal(first.showUnlock,true);assert.equal(first.rewardName,'雙隘口要塞');
  assert.equal(first.nextLabel,'閱讀戰後劇情 →');assert.doesNotMatch(first.intro,/殘缺的命令名冊|叛軍|下一個劇情/);assert.match(first.intro,/抽象重現/);
  assert.equal(first.unlockLabel,'新戰場解鎖');assert.equal(first.score,'642');assert.equal(first.time,'70');
  const replay=ns.systems.ResultScreen.view(result,{mode:'story',victory:true,mission,nextMission,saved:true,canContinue:true,newlyUnlocked:false});
  assert.equal(replay.unlockLabel,'已解鎖戰場');assert.match(replay.intro,/再次守住/);
  const failedSave=ns.systems.ResultScreen.view(result,{mode:'story',victory:true,mission,saved:false,canContinue:false});
  assert.equal(failedSave.showUnlock,false);assert.match(failedSave.intro,/尚未儲存/);
});

test('失敗及自由遠征結算保留成績但不顯示劇情解鎖',()=>{
  const {ns}=load(),result={score:321,grade:'C',time:68,waves:2,persisted:true};
  const loss=ns.systems.ResultScreen.view(result,{mode:'story',victory:false,wave:3,mission:ns.systems.StoryCatalog.mission});
  assert.equal(loss.title,'護證撤離・挑戰未完成');assert.match(loss.intro,/第 3 波/);assert.equal(loss.showUnlock,false);
  const free=ns.systems.ResultScreen.view({...result,waves:30,isNewBest:true},{mode:'free',victory:true});
  assert.equal(free.title,'遠征完成');assert.equal(free.showUnlock,false);
  assert.match(free.highlight,/刷新本地圖最佳紀錄/);assert.equal(free.returnLabel,'返回大廳');
});

test('首關戰後CTA只依勝利與已儲存，不需要舊nextMission，未儲存與敗北均隱藏',()=>{
  const {ns}=load(),mission=ns.systems.StoryCatalog.mission,result={waves:5,persisted:true};
  const ui={resultNext:{},overlay:{dataset:{}},resultUnlock:{},overlayMessage:{},overlayTitle:{}};
  const success=ns.systems.ResultScreen.render(ui,result,{mode:'story',victory:true,mission,saved:true});
  assert(success.showUnlock);assert.equal(ui.resultNext.hidden,false);assert.equal(ui.resultNext.textContent,'閱讀戰後劇情 →');assert.equal(ui.overlay.dataset.resultPrimary,'next');
  for(const options of [{victory:true,saved:false},{victory:false,saved:true}]){
    const view=ns.systems.ResultScreen.render(ui,result,{mode:'story',mission,...options});assert.equal(ui.resultNext.hidden,true);assert.equal(view.showUnlock,false);
  }
  assert.match(ns.systems.ResultScreen.view(result,{mode:'story',mission,victory:true,saved:false}).intro,/匯出備份/);
});

test('其餘十五關標既有戰術挑戰，不把旧aftermath冒充新版主線且保留下一關',()=>{
  const {ns}=load(),all=ns.systems.StoryCatalog.missions;
  for(let i=1;i<all.length;i++){
    const mission=all[i],nextMission=all[i+1],view=ns.systems.ResultScreen.view({waves:mission.waves.length},{mode:'story',victory:true,saved:true,mission,nextMission,canContinue:Boolean(nextMission)});
    assert.match(view.chapter,/既有戰術挑戰/);assert.match(view.intro,/並非新版主線時序/);assert.equal(view.returnLabel,'返回既有挑戰');assert.equal(view.showUnlock,Boolean(nextMission));assert.doesNotMatch(view.intro,/線索推進：/);assert(!view.intro.includes(mission.aftermath));
  }
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
