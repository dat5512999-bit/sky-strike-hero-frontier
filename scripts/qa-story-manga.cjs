'use strict';
// Isolated Edge profiles only. Never read or modify the player's browser profile.
const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const base=process.env.MANGA_QA_URL||'http://127.0.0.1:4189',out=path.resolve(__dirname,'../artifacts/story-manga');
const ready=frame=>frame.waitForSelector('.manga-stage[data-state=ready]',{timeout:20000});
(async()=>{
  fs.mkdirSync(out,{recursive:true});const browser=await chromium.launch({channel:'msedge',headless:true}),results=[];
  try{for(const [name,width,height,mobile] of [['desktop',1365,900,false],['phone',844,390,true],['small-phone',667,375,true]]){
    const context=await browser.newContext({viewport:{width,height},serviceWorkers:'block',hasTouch:mobile});
    const page=await context.newPage(),errors=[],consoleErrors=[];let expectedAbort=false;
    page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error'&&!(expectedAbort&&/Failed to load resource/.test(m.text())))consoleErrors.push(m.text());});
    await page.goto(base+(mobile?'/td-mobile.html':'/td.html'),{waitUntil:'domcontentloaded'});
    const frame=mobile?await(await page.waitForSelector('iframe')).contentFrame():page;
    await frame.waitForFunction(()=>globalThis.frontierApp,{},{timeout:60000});
    await frame.evaluate(()=>frontierApp.act('story'));assert.equal(await frame.evaluate(()=>frontierApp.page),'story');
    const catalog=await frame.evaluate(()=>TowerFrontier.systems.StoryManga.pages.map(p=>({id:p.id,storyPage:p.storyPage,image:p.image})));
    assert.equal(catalog.length,44,'production reader must ship all 44 requested pages');
    const config=await frame.evaluate(()=>({sections:TowerFrontier.systems.StoryMangaFlow.sections,missions:TowerFrontier.systems.StoryCatalog.missions.map(m=>({id:m.id,info:TowerFrontier.systems.StoryMangaFlow.missionInfo(m.id)})).filter(m=>m.info)}));
    const first=config.sections.find(s=>!s.pending&&!s.requires);assert(first,'unlocked world introduction');
    await frame.evaluate(id=>frontierApp.act('manga-section',id),first.id);await ready(frame);
    await frame.locator('[data-manga-index]').selectOption(String(first.pages.length-1));await ready(frame);
    await frame.locator('[data-action=manga-next]').click();assert.equal(await frame.evaluate(()=>frontierApp.page),'story');
    await frame.evaluate(id=>frontierApp.act('manga-section',id),first.id);await ready(frame);assert.equal(await frame.evaluate(()=>frontierApp.manga.index),first.pages.length-1);
    await frame.locator('[data-action=manga-exit]').click();
    // The player's gated routes cannot be unlocked by a forged preview parameter.
    for(const mission of config.missions){
      assert.equal(await frame.evaluate(id=>frontierApp.act('manga-after',id),mission.id),false);
      assert.equal(await frame.evaluate(id=>frontierApp.act('manga-admin-after',id),mission.id),false);
    }
    // Integration fixture: feed a successful battle result into the real save/result
    // boundary. This verifies routing, not simulated combat or balance correctness.
    const resultRoute=await frame.evaluate(()=>{
      const app=frontierApp,m=TowerFrontier.systems.StoryCatalog.mission;
      app.mode='story';app.activeStoryMission=m;
      const result=app.onBattleEnd(true);
      TowerFrontier.systems.ResultScreen.render(app.game.ui,{waves:5,score:0,persisted:true},{victory:true,...result});
      return {saved:result.saved,label:app.game.ui.resultNext.textContent,completed:app.store.current().completed.includes(m.id)};
    });
    assert(resultRoute.saved&&resultRoute.completed);assert.equal(resultRoute.label,'繼續主線・戰後劇情 →');
    await frame.evaluate(()=>frontierApp.game.ui.resultNext.onclick());await ready(frame);
    assert.deepEqual(await frame.evaluate(()=>TowerFrontier.systems.StoryManga.currentPages(frontierApp).map(p=>p.storyPage)),[34]);
    await frame.locator('[data-action=manga-next]').click();assert.equal(await frame.evaluate(()=>frontierApp.storyMode),'timeline');
    await frame.evaluate(()=>{frontierApp.store.switchTo('admin');frontierApp.show('story');});
    const before=await frame.evaluate(()=>frontierApp.store.export());
    const routes=[...config.sections.map(s=>({sectionId:s.id})),...config.missions.flatMap(m=>['before','after'].map(phase=>({missionId:m.id,phase,preview:true})))];
    const loaded=new Set();
    for(const request of routes){
      assert.equal(await frame.evaluate(request=>TowerFrontier.systems.StoryManga.openSelection(frontierApp,request),request),true);
      await ready(frame);
      const count=await frame.locator('[data-manga-index] option').count();
      for(let i=0;i<count;i++){
        await frame.locator('[data-manga-index]').selectOption(String(i));await ready(frame);
        const art=await frame.locator('.manga-image').evaluate(async e=>{await e.decode();return {src:e.getAttribute('src'),width:e.naturalWidth};});assert(art.width>0);loaded.add(art.src);
        const storyPage=catalog.find(p=>p.image===art.src)?.storyPage;
        if([31,34,40,44].includes(storyPage))await page.screenshot({path:path.join(out,name+'-page-'+storyPage+'.png')});
      }
      // End returns to the mission brief or chapter selection, never the next unrelated route.
      await frame.locator('[data-action=manga-next]').click();assert(['story','mission-brief'].includes(await frame.evaluate(()=>frontierApp.page)));
    }
    assert.equal(loaded.size,catalog.length,'every published page has a reachable assigned segment');
    assert.equal(await frame.evaluate(()=>frontierApp.store.export()),before,'admin reading must be zero-write');
    // Visual/keyboard/zoom checks on a short contemporary selection.
    const modern=config.sections.find(s=>s.pages.includes(15))||first;
    await frame.evaluate(id=>frontierApp.act('manga-section',id),modern.id);await ready(frame);
    const fit=await frame.evaluate(()=>{const stage=document.querySelector('.manga-stage').getBoundingClientRect(),buttons=[...document.querySelectorAll('.manga-reader header button,.manga-reader footer button')].map(e=>e.getBoundingClientRect().toJSON());return{width:innerWidth,height:innerHeight,stage:stage.toJSON(),buttons,fit:getComputedStyle(document.querySelector('.manga-image')).objectFit};});
    assert.equal(fit.fit,'contain');assert(fit.stage.height>100);assert(fit.buttons.every(b=>b.height>=44&&b.x>=-1&&b.right<=fit.width+1&&b.y>=-1&&b.bottom<=fit.height+1));
    await page.screenshot({path:path.join(out,name+'.png')});
    await frame.locator('[data-action=manga-zoom]').click();assert(await frame.locator('.manga-stage').evaluate(e=>e.scrollWidth>e.clientWidth));
    const box=await frame.locator('.manga-stage').boundingBox();await page.mouse.move(box.x+box.width*.8,box.y+box.height*.6);await page.mouse.down();await page.mouse.move(box.x+box.width*.3,box.y+box.height*.3,{steps:8});await page.mouse.up();
    assert(await frame.locator('.manga-stage').evaluate(e=>e.scrollLeft>20));
    await page.screenshot({path:path.join(out,name+'-zoom.png')});
    await frame.locator('[data-action=manga-text]').click();assert(await frame.locator('.manga-transcript').isVisible());
    await page.screenshot({path:path.join(out,name+'-text.png')});
    await frame.locator('[data-action=manga-music]').click();
    await frame.locator('[data-action=manga-exit]').click();assert.equal(await frame.evaluate(()=>frontierApp.storyMusic.current),null);
    // Real image failure and retry. This is intentionally induced, not a console regression.
    expectedAbort=true;const imagePath=catalog.find(p=>p.storyPage===first.pages[0]).image,pattern='**/'+imagePath+'*';
    await context.route(pattern,route=>route.abort());await frame.evaluate(id=>frontierApp.act('manga-section',id),first.id);await frame.waitForSelector('.manga-stage[data-state=error]');
    await context.unroute(pattern);await frame.locator('[data-action=manga-retry]').click();await ready(frame);expectedAbort=false;
    assert.equal(await frame.evaluate(()=>frontierApp.store.export()),before);
    assert.deepEqual(errors,[]);assert.deepEqual(consoleErrors,[]);
    results.push({name,...fit,totalPages:catalog.length,allPagesLoaded:loaded.size,missionMappings:config.missions.length,adminReadOnly:true,phaseGuards:true,resultToAfter:true,resultFixture:'synthetic victory at real save/result boundary; not a combat playtest',bookmarkPassed:true,zoomDrag:true,retryPassed:true,errors,consoleErrors});
    fs.writeFileSync(path.join(out,'results.json'),JSON.stringify(results,null,2));console.log(name+': 44-page phase-reader QA passed');await context.close();
  }}finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
