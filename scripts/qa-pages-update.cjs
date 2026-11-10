'use strict';
// Disposable browser context: never attach to or clear a player's profile.
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const version=require('../package.json').version;
const base=(process.env.PAGES_UPDATE_QA_URL||'https://dat5512999-bit.github.io/sky-strike-hero-frontier').replace(/\/$/,'');
const delay=ms=>new Promise(resolve=>setTimeout(resolve,ms));
(async()=>{
  const browser=await chromium.launch({channel:'msedge',headless:true});
  try{
    const context=await browser.newContext({viewport:{width:1365,height:900}}),page=await context.newPage();
    await page.goto(base+'/td.html',{waitUntil:'domcontentloaded'});
    await page.waitForFunction(()=>globalThis.frontierApp,{},{timeout:60000});
    await page.waitForFunction(()=>navigator.serviceWorker.controller,{},{timeout:60000});
    const initialVersion=await page.evaluate(()=>TowerFrontier.systems.ProfileStore.VERSION);
    const profileBefore=await page.evaluate(()=>localStorage.getItem(TowerFrontier.systems.ProfileStore.KEY));
    await page.evaluate(async()=>{
      localStorage.setItem('hf-release-qa-preserve','existing-local-data');
      const cache=await caches.open('sky-strike-vQA-previous');
      await cache.put(new URL('assets/td/story/manga-v2/page-01.webp',location.href),new Response('old-test-image'));
    });
    console.log('Initial online runtime: '+initialVersion+'; waiting for release '+version);
    const started=Date.now();let available=false;
    while(Date.now()-started<10*60*1000){
      const response=await fetch(base+'/update.html?release='+version,{cache:'no-store',signal:AbortSignal.timeout(20000)});
      if(response.ok&&(await response.text()).includes('data-release="'+version+'"')){available=true;break;}
      await delay(10000);
    }
    assert(available,'release must become available within ten minutes');
    await page.goto(base+'/update.html?release='+version,{waitUntil:'domcontentloaded'});
    await page.waitForURL(url=>url.pathname.endsWith('/td.html')&&url.searchParams.get('release')===version,{timeout:90000,waitUntil:'domcontentloaded'});
    await page.waitForFunction(()=>globalThis.frontierApp&&navigator.serviceWorker.controller,{},{timeout:60000});
    // Play readiness is not the window load event: optional image downloads may
    // still be running after the app and essential battlefield art are ready.
    await page.waitForFunction(()=>towerFrontierGame.art.coreStatus('hunter').ready,{},{timeout:60000});
    const readiness=await page.evaluate(()=>({playReadyMs:Math.round(performance.now()),domReadyMs:Math.round(performance.getEntriesByType('navigation')[0].domContentLoadedEventEnd),loadEventMs:Math.round(performance.getEntriesByType('navigation')[0].loadEventEnd),imageRequests:performance.getEntriesByType('resource').filter(r=>r.initiatorType==='img').length}));
    assert.equal(await page.evaluate(()=>localStorage.getItem(TowerFrontier.systems.ProfileStore.KEY)),profileBefore,'actual player profile survives update');
    const result=await page.evaluate(async()=>{
      const workerVersion=await new Promise((resolve,reject)=>{
        const channel=new MessageChannel(),timer=setTimeout(()=>reject(Error('Worker response timeout')),5000);
        channel.port1.onmessage=e=>{clearTimeout(timer);channel.port1.close();channel.port2.close();resolve(e.data);};
        navigator.serviceWorker.controller.postMessage({type:'GAME_VERSION'},[channel.port2]);
      });
      return {runtime:TowerFrontier.systems.ProfileStore.VERSION,workerVersion,caches:await caches.keys(),preserved:localStorage.getItem('hf-release-qa-preserve'),pages:TowerFrontier.systems.StoryManga.pages.length};
    });
    assert.equal(result.runtime,version);assert.equal(result.workerVersion,'sky-strike-v'+version);
    assert.equal(result.preserved,'existing-local-data');assert.equal(result.pages,44);
    if(initialVersion!==version)assert(!result.caches.includes('sky-strike-vQA-previous'),'stale game cache removed by new worker activation');
    await page.evaluate(()=>frontierApp.act('story'));
    const out=path.resolve(__dirname,'../artifacts/pages-update');fs.mkdirSync(out,{recursive:true});
    await page.screenshot({path:path.join(out,'online-story.png')});
    await context.setOffline(true);await page.goto(base+'/td.html',{waitUntil:'domcontentloaded'});
    await page.waitForFunction(()=>globalThis.frontierApp);
    assert.equal(await page.evaluate(()=>localStorage.getItem(TowerFrontier.systems.ProfileStore.KEY)),profileBefore,'offline reopening retains profile');
    const offlineRuntime=await page.evaluate(()=>TowerFrontier.systems.ProfileStore.VERSION);assert.equal(offlineRuntime,version);
    fs.writeFileSync(path.join(out,'report.json'),JSON.stringify({initialVersion,site:base,result,readiness,offlineRuntime,limitations:'Desktop Edge isolated profile; not physical iOS background/resume validation. Same-version refresh unless served an actual previous worker.'},null,2));
    console.log('PASS online update '+JSON.stringify({initialVersion,...result}));
  }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
