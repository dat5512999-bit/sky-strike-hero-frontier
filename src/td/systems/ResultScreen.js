(function(ns){
  'use strict';
  // Turn one completed battle into a small, readable result. Story unlocks are supplied
  // only after ProfileStore confirms the mission was saved.
  class ResultScreen{
    static view(result,options={}){
      const story=options.mode==='story',won=options.victory===true;
      const waves=Math.max(0,Number(result?.waves)||0),reached=Math.max(1,Number(options.wave)||waves);
      const rewardId=options.mission?.rewards?.maps?.[0];
      const rewardName=rewardId&&ns.maps?.definitions?.[rewardId]?.name;
      const showUnlock=Boolean(story&&won&&options.saved&&options.canContinue&&options.nextMission);
      const title=story?(won?options.mission?.name||'任務完成':'谷地失守'):won?'遠征完成':'遠征失敗';
      let intro=story
        ?won
          ?showUnlock
            ?options.newlyUnlocked
              ?'成功守住 '+waves+' 波攻勢。新戰場已開啟，可繼續下一個劇情任務。'
              :'再次守住 '+waves+' 波攻勢。可繼續下一個劇情任務。'
            :options.saved
              ?'成功守住 '+waves+' 波攻勢，任務進度已儲存。可返回章節地圖繼續探索。'
              :'成功守住 '+waves+' 波攻勢，但進度尚未儲存。請保留此頁並匯出備份。'
          :'敵軍突破城門，抵達第 '+reached+' 波。調整部署後再挑戰。'
        :won?'完成 '+waves+' 波遠征，防線守住了。':'敵軍突破城門，抵達第 '+reached+' 波。調整部署後再挑戰。';
      if(story&&won&&options.mission?.aftermath)intro+='\n\n線索推進：'+options.mission.aftermath;
      if(result?.persisted===false)intro+=' 戰報尚未儲存，請檢查儲存空間。';
      const highlight=!story&&result?.isNewBest?'刷新本地圖最佳紀錄！':!story&&result?.isNewDifficultyBest?'刷新本難度最佳紀錄！':'';
      return{
        story,won,title,intro,highlight,showUnlock,rewardId,rewardName,nextMissionName:options.nextMission?.name,
        chapter:story?'第一章 · '+(won?'任務完成':'挑戰失敗'):'自由遠征 · '+(won?'挑戰完成':'挑戰結束'),
        status:won?'守城成功':'城門失守',score:Math.max(0,Number(result?.score)||0).toLocaleString('zh-TW'),
        grade:result?.grade||'--',time:Math.max(0,Math.round(Number(result?.time)||0)).toLocaleString('zh-TW'),
        unlockLabel:options.newlyUnlocked?'新戰場解鎖':'已解鎖戰場',
        returnLabel:story?'返回章節地圖':'返回大廳',
        reportAvailable:waves>0
      };
    }
    static render(ui,result,options={}){
      const view=this.view(result,options);
      const set=(name,value)=>{if(ui[name])ui[name].textContent=value;};
      if(ui.overlay?.dataset){ui.overlay.dataset.resultOutcome=view.won?'victory':'failure';ui.overlay.dataset.resultPrimary=view.showUnlock?'next':'retry';}
      set('resultChapter',view.chapter);set('resultSeal',view.won?'✦':'×');
      set('overlayTitle',view.title);set('resultStatus',view.status);set('overlayMessage',view.intro);
      set('resultScore',view.score);set('resultGrade',view.grade);set('resultTime',view.time);
      set('resultGradeLabel',view.won?'通關評級':'本次評級');
      set('resultTimeLabel',view.won?'通關用時':'挑戰用時');
      set('resultHighlight',view.highlight);
      if(ui.resultHighlight)ui.resultHighlight.hidden=!view.highlight;
      if(ui.resultUnlock)ui.resultUnlock.hidden=!view.rewardName||!view.won||!options.saved;
      if(ui.resultNext){ui.resultNext.hidden=!view.showUnlock;ui.resultNext.textContent='前往'+(ns.maps?.definitions?.[options.nextMission?.map]?.name||view.nextMissionName||'下一個劇情')+' →';}
      set('resultUnlockLabel',view.unlockLabel);set('resultUnlockName',view.rewardName||'');
      set('resultChange',view.returnLabel);set('restart','再挑戰一次');
      if(ui.resultReport)ui.resultReport.hidden=!view.reportAvailable;
      return view;
    }
  }
  ns.systems.ResultScreen=ResultScreen;
})(globalThis.TowerFrontier);
