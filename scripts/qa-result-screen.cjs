'use strict';
const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs');
const out='artifacts/qa-result-screen-v0846';fs.mkdirSync(out,{recursive:true});
const url='http://127.0.0.1:4175/td.html';

async function testViewport(browser,name,width,height,touch){
  const context=await browser.newContext({viewport:{width,height},hasTouch:touch,isMobile:touch,serviceWorkers:'block'});
  const page=await context.newPage(),errors=[];page.on('pageerror',error=>errors.push(error.message));
  try{
    await page.goto(url);
    await page.waitForTimeout(500);
    const view=page.url().includes('td-mobile.html')?await (await page.waitForSelector('iframe')).contentFrame():page;
    await view.waitForFunction(()=>globalThis.frontierApp&&globalThis.towerFrontierGame);
    await view.evaluate(()=>{
      const app=frontierApp;app.store.newRound();app.launchStory();
      const g=towerFrontierGame;
      g.report.finalize=()=>({score:642,grade:'B',waves:3,time:70,persisted:true,isNewBest:false,isNewDifficultyBest:false});
      g.report.finalLine=()=> '第 3 波完成｜積分 642';
      g.end(true);
    });
    const state=await view.evaluate(()=>{
      const g=towerFrontierGame;
      const report=g.ui.resultReport.getBoundingClientRect();
      return {title:g.ui.overlayTitle.textContent,status:g.ui.resultStatus.textContent,score:g.ui.resultScore.textContent,grade:g.ui.resultGrade.textContent,time:g.ui.resultTime.textContent,unlock:g.ui.resultUnlockName.textContent,nextVisible:!g.ui.resultNext.hidden,layout:document.body.dataset.layout,overflow:document.querySelector('.result-card').scrollHeight-document.querySelector('.result-card').clientHeight,reportWithinViewport:report.bottom<=innerHeight};
    });
    assert.equal(state.title,'烽火初燃');assert.equal(state.status,'守城成功');
    assert.equal(state.score,'642');assert.equal(state.grade,'B');assert.equal(state.time,'70');
    assert.equal(state.unlock,'雙隘口要塞');assert.equal(state.nextVisible,true);assert.equal(state.reportWithinViewport,true);
    assert.deepEqual(errors,[]);
    await page.screenshot({path:out+'/'+name+'-story-win.png'});
    await view.evaluate(()=>{towerFrontierGame.report.waves=[{wave:1,rank:'B',score:200,time:20,timeBonus:0,kills:5,leaks:0,heroDowns:0,totalGold:50}];});
    await view.locator('#td-result-report').click();
    assert.equal(await view.locator('#td-report-screen').isVisible(),true);
    await view.locator('#td-report-close').click();
    assert.equal(await view.locator('#td-overlay').isVisible(),true);
    await view.locator('#td-result-next').click();
    const next=await view.evaluate(()=>({mode:frontierApp.mode,map:TowerFrontier.config.mapId,screen:document.body.dataset.gameScreen,unlocked:frontierApp.allows('maps','twinpass')}));
    assert.equal(next.mode,'free');assert.equal(next.map,'twinpass');assert.equal(next.unlocked,true);assert.equal(next.screen,'opening');
    await view.evaluate(()=>{
      const app=frontierApp;app.launchStory();const g=towerFrontierGame;
      g.report.finalize=()=>({score:480,grade:'C',waves:3,time:92,persisted:true});
      g.report.finalLine=()=> '第 3 波完成｜積分 480';g.end(true);
    });
    const replay=await view.evaluate(()=>({label:towerFrontierGame.ui.resultUnlockLabel.textContent,nextVisible:!towerFrontierGame.ui.resultNext.hidden}));
    assert.equal(replay.label,'已解鎖戰場');assert.equal(replay.nextVisible,true);
    await view.locator('#td-result-change').click();
    assert.equal(await view.evaluate(()=>frontierApp.page),'story');
    await view.evaluate(()=>{
      const app=frontierApp;app.launchStory();const g=towerFrontierGame;
      g.report.finalize=()=>({score:210,grade:'D',waves:1,time:46,persisted:true});
      g.report.finalLine=()=> '第 1 波失守｜積分 210';g.end(false);
    });
    const loss=await view.evaluate(()=>({title:towerFrontierGame.ui.overlayTitle.textContent,timeLabel:towerFrontierGame.ui.resultTimeLabel.textContent,nextVisible:!towerFrontierGame.ui.resultNext.hidden}));
    assert.equal(loss.title,'谷地失守');assert.equal(loss.timeLabel,'挑戰用時');assert.equal(loss.nextVisible,false);
    assert.deepEqual(errors,[]);
    return {state,next,replay,loss,errors};
  }finally{await context.close();}
}

(async()=>{
  const browser=await chromium.launch({channel:'chrome',headless:true});
  try{
    const desktop=await testViewport(browser,'desktop',1440,900,false);
    const mobile=await testViewport(browser,'mobile-landscape',844,390,true);
    fs.writeFileSync(out+'/result.json',JSON.stringify({desktop,mobile},null,2));
    console.log('Result screen passed on desktop and touch landscape: first win, report, replay, loss, and twinpass route.');
  }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
