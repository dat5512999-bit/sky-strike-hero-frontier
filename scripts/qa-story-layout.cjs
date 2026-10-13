'use strict';
// Disposable contexts only; never attach to a player's browser/profile.
const {chromium}=require('playwright');
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const base=process.env.STORY_LAYOUT_QA_URL||'http://127.0.0.1:4189';
const out=path.resolve(__dirname,'../artifacts/story-layout');
const inspect=()=>{
  const rect=e=>e.getBoundingClientRect().toJSON(),content=document.querySelector('.lobby-content'),details=document.querySelector('.mission-details');
  return {width:innerWidth,height:innerHeight,content:rect(content),contentScroll:{height:content.clientHeight,total:content.scrollHeight,top:content.scrollTop},details:{...rect(details),clientHeight:details.clientHeight,scrollHeight:details.scrollHeight,top:details.scrollTop},actions:[...document.querySelectorAll('.mission-actions button')].map(e=>{const r=rect(e),hit=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);return {text:e.textContent,action:e.dataset.action,disabled:e.disabled,rect:r,hit:hit===e||e.contains(hit)};})};
};
function check(result,label){
  assert(result.actions.length>=1,label+' must show relevant actions');
  assert(result.contentScroll.total<=result.contentScroll.height+2,label+' outer page must not scroll');
  assert(result.details.height>20,label+' details stay usable');
  for(const action of result.actions){const r=action.rect;assert(r.width>=44&&r.height>=44,label+' 44px '+JSON.stringify(action));assert(r.left>=0&&r.top>=0&&r.right<=result.width+1&&r.bottom<=result.height+1,label+' visible '+JSON.stringify(action));assert(action.hit,label+' center unobstructed '+action.text);}
}
async function cover(view){
  await view.waitForFunction(()=>{const img=document.querySelector('.story-comic-cover');return img&&img.complete&&img.naturalWidth>0;},{},{timeout:30000});
  return view.locator('.story-comic-cover').evaluate(async img=>{await img.decode();return {src:img.getAttribute('src'),width:img.naturalWidth,height:img.naturalHeight};});
}
(async()=>{
  fs.mkdirSync(out,{recursive:true});const browser=await chromium.launch({channel:'msedge',headless:true}),results=[];
  try{for(const [name,width,height,mobile] of [['wide',1920,900,false],['desktop',1365,768,false],['phone',844,390,true],['small-phone',667,375,true]]){
    const context=await browser.newContext({viewport:{width,height},hasTouch:mobile,isMobile:mobile,serviceWorkers:'block'}),page=await context.newPage(),errors=[];
    page.on('pageerror',e=>errors.push(e.message));
    await page.goto(base+(mobile?'/td-mobile.html':'/td.html'),{waitUntil:'domcontentloaded'});
    const view=mobile?await(await page.waitForSelector('iframe')).contentFrame():page;
    await view.waitForFunction(()=>globalThis.frontierApp,{},{timeout:60000});
    await view.evaluate(()=>frontierApp.show('story'));
    await view.waitForSelector('.campaign-fit .mission-actions');
    const timeline=await view.evaluate(inspect);check(timeline,name+' timeline');assert.equal(timeline.contentScroll.top,0);
    assert.equal(await view.locator('[data-action=story-node]').count(),9);assert.equal(await view.locator('[data-action=story-battle]').count(),0);
    assert.equal(await view.locator('[data-action=story-tutorial]').count(),0);
    await cover(view);
    await page.screenshot({path:path.join(out,name+'-timeline.png')});
    const covers=[],storyNodes=await view.evaluate(()=>TowerFrontier.systems.StoryMangaFlow.timeline(frontierApp.store.current(),false));
    for(const node of storyNodes){
      await view.evaluate(id=>frontierApp.act('story-node',id),node.id);
      const image=await cover(view),state=await view.evaluate(inspect);check(state,name+' node '+node.id);
      assert(image.src.endsWith('/page-'+String(node.firstPage).padStart(2,'0')+'.webp'),name+' correct segment cover '+node.id);
      covers.push({id:node.id,image,state});
    }
    assert.equal(new Set(covers.map(c=>c.image.src)).size,9,name+' distinct covers for all nine nodes');
    await view.locator('[data-action=story-node][data-value="present-investigation"]').click();
    const investigation=await view.evaluate(inspect);check(investigation,name+' investigation');assert.deepEqual(investigation.actions.map(a=>a.action),['manga-campaign','manga-section']);
    await view.locator('[data-action=story-node][data-value="battle:chapter1-border"]').click();
    const battle=await view.evaluate(inspect);check(battle,name+' timeline battle');assert(battle.actions.some(a=>a.action==='story-battle'));
    await cover(view);
    await page.screenshot({path:path.join(out,name+'-timeline-battle.png')});
    await view.locator('[data-action=story-node][data-value="present-attack"]').click();
    const timelineLocked=await view.evaluate(inspect);check(timelineLocked,name+' timeline locked');assert(timelineLocked.actions.some(a=>a.disabled));
    await view.locator('[data-action=story-mode][data-value=legacy]').click();
    const initial=await view.evaluate(inspect);check(initial,name+' legacy initial');assert.equal(initial.contentScroll.top,0);
    await page.screenshot({path:path.join(out,name+'-legacy-initial.png')});
    const legacyIds=await view.evaluate(()=>TowerFrontier.systems.StoryCatalog.missions.map(m=>m.id));assert.equal(legacyIds.length,16);
    for(const id of legacyIds){await view.evaluate(id=>frontierApp.act('story-select',id),id);check(await view.evaluate(inspect),name+' legacy '+id);}
    await view.evaluate(id=>frontierApp.act('story-select',id),legacyIds[0]);
    await view.locator('.mission-details').evaluate(e=>{for(let i=0;i<35;i++){const p=document.createElement('p');p.textContent='驗收用長篇任務詳情：內容可捲動，主要操作必須持續可见。';e.append(p);}e.scrollTop=e.scrollHeight;});
    const long=await view.evaluate(inspect);check(long,name+' long details');assert(long.details.top>0);assert.deepEqual(long.actions.map(a=>a.rect),initial.actions.map(a=>a.rect),name+' CTAs stay fixed');
    await view.locator('[data-action=story-select]').nth(1).click();
    const locked=await view.evaluate(inspect);check(locked,name+' locked');assert(locked.actions.some(a=>a.disabled),name+' locked remains disabled');
    await view.evaluate(()=>{frontierApp.store.switchTo('admin');frontierApp.show('story');});
    const admin=await view.evaluate(inspect);check(admin,name+' admin');
    await page.screenshot({path:path.join(out,name+'-admin.png')});
    await view.locator('[data-action=story-select]').first().click();
    const adminFirst=await view.evaluate(inspect);check(adminFirst,name+' admin with after-story');assert(adminFirst.actions.some(a=>a.action==='manga-admin-after'));
    await page.screenshot({path:path.join(out,name+'-admin-first.png')});
    await view.locator('[data-action=story-mode][data-value=timeline]').click();
    await view.locator('[data-action=story-node][data-value="battle:chapter1-border"]').click();
    const timelineAdmin=await view.evaluate(inspect);check(timelineAdmin,name+' timeline admin battle');assert(timelineAdmin.actions.some(a=>a.action==='manga-admin-after'));
    await cover(view);
    await page.screenshot({path:path.join(out,name+'-timeline-admin-battle.png')});
    assert.deepEqual(errors,[],name+' runtime errors');results.push({name,covers,legacyIds,timeline,investigation,battle,timelineLocked,initial,long,locked,admin,adminFirst,timelineAdmin,errors});await context.close();
  }
  fs.writeFileSync(path.join(out,'results.json'),JSON.stringify(results,null,2));console.log('PASS: 1920×900, 1365×768, 844×390, 667×375; new timeline/read-only/battle/locked/admin and legacy initial/long/locked/admin CTAs visible, unobstructed, >=44px; outer scroll absent.');
  }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
