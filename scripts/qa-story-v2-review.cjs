'use strict';
// Authoring-only QA. Fresh Edge contexts never touch the player's browser profile.
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const repo=path.resolve(__dirname,'..');
const directory=path.join(repo,'assets/td/concepts/story-comic-v2');
const base=process.env.STORY_V2_REVIEW_QA_URL||'http://127.0.0.1:4189';
const reviewUrl=base.replace(/\/$/,'')+'/assets/td/concepts/story-comic-v2/review.html';
const output=path.join(repo,'artifacts/story-v2-review');
const manifest=JSON.parse(fs.readFileSync(path.join(directory,'review-catalog.json'),'utf8'));
const total=manifest.pages.length,remaining=manifest.plannedPages-total,sampleIndex=Math.min(total-2,12);
assert(total>=13&&total<=manifest.plannedPages,'This QA includes the prologue-to-main transition');
assert.equal(manifest.plannedPages,44);
for(const item of manifest.pages)assert(fs.existsSync(path.join(directory,item.image)),item.image+' must exist before visual QA');
const results=[];

async function ready(page){
  await page.waitForSelector('#stage[data-state="ready"]',{timeout:30000});
  const image=page.locator('#stage img');
  assert(await image.evaluate(async img=>{await img.decode();return img.naturalWidth>0&&img.naturalHeight>0;}),'image decoded');
}
async function selectPage(page,index){await page.locator('#page-select').selectOption(String(index));await ready(page);}
async function screenshot(page,name){await page.screenshot({path:path.join(output,name+'.png')});}
function deniedFullscreen(){Object.defineProperty(Element.prototype,'requestFullscreen',{configurable:true,value(){return Promise.reject(new DOMException('Deliberately denied by QA','NotAllowedError'));}});}
function deniedStorage(){for(const method of ['getItem','setItem'])Object.defineProperty(Storage.prototype,method,{configurable:true,value(){throw new DOMException('Deliberately denied by QA','SecurityError');}});}

(async()=>{
  fs.mkdirSync(output,{recursive:true});
  const browser=await chromium.launch({channel:'msedge',headless:true});
  let activePage=null,activeName='startup';
  try{
    for(const [name,width,height,mobile] of [['desktop',1365,900,false],['phone',844,390,true],['small-phone',667,375,true]]){
      activeName=name;
      const options={viewport:{width,height},serviceWorkers:'block',hasTouch:mobile,isMobile:mobile};
      const context=await browser.newContext(options),page=await context.newPage(),errors=[],requests=[],consoleErrors=[],expectedNetworkErrors=[];
      let expectedNetworkFailure=null;
      activePage=page;
      await context.addInitScript(deniedFullscreen);
      page.on('pageerror',error=>errors.push(error.message));
      page.on('console',message=>{
        if(message.type()!=='error')return;
        const entry={text:message.text(),url:message.location().url};
        if(expectedNetworkFailure&&/Failed to load resource/.test(entry.text)&&expectedNetworkFailure.test(entry.url))expectedNetworkErrors.push(entry);
        else consoleErrors.push(entry);
      });
      page.on('request',request=>{if(/\/review\/(prologue|main)-\d+\.webp/.test(request.url()))requests.push(request.url().split('?')[0]);});
      const nextLoaded=page.waitForResponse(response=>response.url().endsWith('/'+manifest.pages[1].image)&&response.ok(),{timeout:30000});
      await page.goto(reviewUrl,{waitUntil:'domcontentloaded'});await ready(page);await nextLoaded;
      assert.equal(await page.locator('#page-select').inputValue(),'0');
      assert.equal(new Set(requests).size,2,'initial view requests only current page and the next page');
      assert.equal(await page.locator('#previous-page').isDisabled(),true);

      assert.match(await page.locator('#scope-note').textContent(),new RegExp('已有 '+total+' 頁'));
      if(remaining)assert.match(await page.locator('#scope-note').textContent(),new RegExp('尚有 '+remaining+' 頁未繪製'));
      for(let index=0;index<total;index++){
        await selectPage(page,index);
        assert.equal(await page.locator('#transcript-lines li').count(),manifest.pages[index].text.length);
        assert.deepEqual(await page.locator('#transcript-lines li').allTextContents(),manifest.pages[index].text);
        assert.match(await page.locator('#page-status').textContent(),new RegExp('^'+(index+1)+' / '+total));
      }
      assert.equal(await page.locator('#next-page').isDisabled(),true);
      assert.match(await page.locator('#page-status').textContent(),remaining?new RegExp('尚有'+remaining+'頁未繪製'):/圖稿仍待作者驗收/);
      await page.locator('#zoom-button').focus();await page.keyboard.press('Home');await ready(page);
      assert.equal(await page.locator('#page-select').inputValue(),'0');
      await page.keyboard.press('ArrowRight');await ready(page);assert.equal(await page.locator('#page-select').inputValue(),'1');
      await page.keyboard.press('ArrowLeft');await ready(page);assert.equal(await page.locator('#page-select').inputValue(),'0');
      await page.keyboard.press('End');await ready(page);assert.equal(await page.locator('#page-select').inputValue(),String(total-1));

      // The end of the prologue is no longer the end of this growing collection.
      await selectPage(page,11);assert.equal(await page.locator('#next-page').isDisabled(),false);
      await page.locator('#next-page').click();await ready(page);
      assert.equal(await page.locator('#page-select').inputValue(),'12');
      assert((await page.locator('#stage img').getAttribute('src')).startsWith('review/main-13.webp'));
      assert.deepEqual(await page.locator('#transcript-lines li').allTextContents(),manifest.pages[12].text);
      await screenshot(page,name+'-main-13');
      await page.locator('#previous-page').click();await ready(page);assert.equal(await page.locator('#page-select').inputValue(),'11');
      for(const storyPage of [15,18]){
        const index=manifest.pages.findIndex((item,position)=>(item.storyPage??position+1)===storyPage);
        if(index<0)continue;
        await selectPage(page,index);
        const complete=await page.locator('#stage img').evaluate(img=>{const style=getComputedStyle(img),box=img.getBoundingClientRect(),stage=img.parentElement.getBoundingClientRect();return style.objectFit==='contain'&&box.left>=stage.left-1&&box.top>=stage.top-1&&box.right<=stage.right+1&&box.bottom<=stage.bottom+1;});
        assert(complete,name+' page '+storyPage+' remains fully contained');
        await screenshot(page,name+'-main-'+storyPage);
      }

      await selectPage(page,sampleIndex);
      const layout=await page.evaluate(()=>({width:innerWidth,height:innerHeight,documentWidth:document.documentElement.scrollWidth,documentHeight:document.documentElement.scrollHeight,stage:document.querySelector('#stage').getBoundingClientRect().toJSON(),fit:getComputedStyle(document.querySelector('#stage img')).objectFit,buttons:[...document.querySelectorAll('.tools button,.tools select,footer button')].map(button=>({id:button.id,...button.getBoundingClientRect().toJSON()}))}));
      assert.equal(layout.fit,'contain');assert(layout.stage.height>=120,name+' has a usable image stage');
      assert(layout.documentWidth<=width+1,name+' has no horizontal page overflow');
      assert(layout.documentHeight<=height+1,name+' has no vertical page overflow');
      assert(layout.buttons.every(button=>button.height>=44&&button.width>=44),name+' has 44px control targets');
      assert(layout.buttons.every(button=>button.x>=-1&&button.right<=layout.width+1&&button.y>=-1&&button.bottom<=layout.height+1),name+' controls stay onscreen');
      await screenshot(page,name);

      // Click-to-zoom, then a real mouse drag across the enlarged page.
      await page.locator('#stage img').click();
      assert.equal(await page.locator('#zoom-button').getAttribute('aria-pressed'),'true');
      assert(await page.locator('#stage').evaluate(stage=>stage.scrollWidth>stage.clientWidth));
      const stageBox=await page.locator('#stage').boundingBox();
      const dragStart={x:stageBox.x+stageBox.width*.8,y:stageBox.y+stageBox.height*.65};
      await page.mouse.move(dragStart.x,dragStart.y);await page.mouse.down();
      await page.mouse.move(dragStart.x-Math.min(180,stageBox.width*.45),dragStart.y-Math.min(70,stageBox.height*.2),{steps:10});await page.mouse.up();
      assert((await page.locator('#stage').evaluate(stage=>stage.scrollLeft))>30,name+' drag scrolls enlarged image');
      assert.equal(await page.locator('#zoom-button').getAttribute('aria-pressed'),'true','drag must not toggle zoom off');
      await screenshot(page,name+'-zoom');
      await page.mouse.click(stageBox.x+stageBox.width*.3,stageBox.y+stageBox.height*.5);
      assert.equal(await page.locator('#zoom-button').getAttribute('aria-pressed'),'false','a click after dragging restores the full page');
      await page.locator('#zoom-button').click();assert.equal(await page.locator('#zoom-button').getAttribute('aria-pressed'),'true');
      await page.keyboard.press('Escape');assert.equal(await page.locator('#zoom-button').getAttribute('aria-pressed'),'false');

      await page.locator('#text-button').click();assert.equal(await page.locator('#transcript').isVisible(),true);
      await screenshot(page,name+'-text');
      await page.locator('#next-page').click();await ready(page);
      assert.deepEqual(await page.locator('#transcript-lines li').allTextContents(),manifest.pages[sampleIndex+1].text);
      await page.locator('#text-button').click();
      await selectPage(page,7);
      assert.equal(await page.evaluate(()=>localStorage.getItem('hf-story-v2-review-bookmark')),manifest.pages[7].id);
      await page.reload({waitUntil:'domcontentloaded'});await ready(page);
      assert.equal(await page.locator('#page-select').inputValue(),'7','bookmark restores by stable page id');

      // An explicit link wins over an old prologue bookmark, without changing the URL on a page turn.
      await page.goto(reviewUrl+'#page=v2-main-13',{waitUntil:'domcontentloaded'});
      await page.waitForFunction(()=>document.querySelector('#page-select').value==='12');await ready(page);
      if(total>13){await selectPage(page,13);assert.equal(new URL(page.url()).hash,'#page=v2-main-13','deep link is read-only');}
      await page.evaluate(id=>localStorage.setItem('hf-story-v2-review-bookmark',id),manifest.pages[7].id);
      await page.goto(reviewUrl+'#page=%3Cimg%20onerror%3Dbad%3E',{waitUntil:'domcontentloaded'});
      await page.reload({waitUntil:'domcontentloaded'});await ready(page);
      assert.equal(await page.locator('#page-select').inputValue(),'7','unknown hash falls back to the old prologue bookmark');
      assert.match(await page.locator('#interaction-note').textContent(),/未對應/);
      assert.equal(await page.locator('#stage img').count(),1,'hash is never inserted as markup');
      await page.goto(reviewUrl+'#page=%E0%A4%A',{waitUntil:'domcontentloaded'});
      await page.reload({waitUntil:'domcontentloaded'});await ready(page);
      assert.equal(await page.locator('#page-select').inputValue(),'7','malformed encoding also falls back safely');
      await page.goto(reviewUrl,{waitUntil:'domcontentloaded'});await page.reload({waitUntil:'domcontentloaded'});await ready(page);
      await page.locator('#fullscreen-button').click();await page.waitForFunction(()=>document.querySelector('#interaction-note').textContent.includes('未允許全螢幕'));
      assert.equal(await page.locator('#stage').getAttribute('data-state'),'ready');

      const imagePattern='**/review/prologue-01.webp*';
      expectedNetworkFailure=/\/review\/prologue-01\.webp(?:\?|$)/;
      await context.route(imagePattern,route=>route.abort());
      await page.locator('#page-select').selectOption('0');await page.waitForSelector('#stage[data-state="error"]');
      assert.match(await page.locator('#image-status-text').textContent(),/逐句文字/);
      await page.locator('#text-button').click();assert.equal(await page.locator('#transcript').isVisible(),true);
      await screenshot(page,name+'-image-error');
      await context.unroute(imagePattern);await page.locator('#retry-image').click();await ready(page);
      expectedNetworkFailure=null;
      await page.locator('#text-button').click();

      const catalogPattern='**/review-catalog.json';
      expectedNetworkFailure=/\/review-catalog\.json(?:\?|$)/;
      await context.route(catalogPattern,route=>route.abort());
      await page.reload({waitUntil:'domcontentloaded'});await page.waitForSelector('#catalog-error:not([hidden])');
      assert.equal(await page.locator('#reader-content').isVisible(),false);
      assert.match(await page.locator('#catalog-error-message').textContent(),/重新讀取/);
      await screenshot(page,name+'-catalog-error');
      await context.unroute(catalogPattern);await page.locator('#retry-catalog').click();await ready(page);
      expectedNetworkFailure=null;
      assert.equal(await page.locator('#page-select').inputValue(),'0');
      assert.deepEqual(errors,[],name+' has no uncaught browser exceptions');
      assert.deepEqual(consoleErrors,[],name+' has no unexpected console errors');
      await context.close();

      // Storage denial runs in another fresh context, not by clearing any user data.
      const deniedContext=await browser.newContext(options),deniedPage=await deniedContext.newPage(),deniedErrors=[],deniedConsoleErrors=[];
      activePage=deniedPage;await deniedContext.addInitScript(deniedStorage);
      deniedPage.on('pageerror',error=>deniedErrors.push(error.message));
      deniedPage.on('console',message=>{if(message.type()==='error')deniedConsoleErrors.push(message.text());});
      await deniedPage.goto(reviewUrl+'#page=v2-main-13',{waitUntil:'domcontentloaded'});await ready(deniedPage);
      assert.equal(await deniedPage.locator('#page-select').inputValue(),'12','first open deep link works when storage is denied');
      assert.match(await deniedPage.locator('#save-note').textContent(),/未允許保存/);
      await selectPage(deniedPage,2);assert.equal(await deniedPage.locator('#page-select').inputValue(),'2');
      await screenshot(deniedPage,name+'-storage-denied');assert.deepEqual(deniedErrors,[]);assert.deepEqual(deniedConsoleErrors,[]);
      await deniedContext.close();activePage=null;
      results.push({name,viewport:{width,height},layout,loadedPages:total,remainingPages:remaining,transition12to13:true,deepLink:true,unknownHashSafe:true,oldBookmarkCompatible:true,keyboard:true,zoomDrag:true,transcript:true,bookmark:true,imageRetry:true,catalogRetry:true,storageDenied:true,fullscreenDenied:true,errors,consoleErrors,expectedNetworkErrors});
      fs.writeFileSync(path.join(output,'results.json'),JSON.stringify({url:reviewUrl,totalPages:total,plannedPages:manifest.plannedPages,results},null,2));
      console.log(name+': all review checks passed');
    }
  }catch(error){
    if(activePage&&!activePage.isClosed())await screenshot(activePage,activeName+'-failure').catch(()=>{});
    fs.writeFileSync(path.join(output,'failure.json'),JSON.stringify({name:activeName,message:error.message,stack:error.stack,completed:results},null,2));
    throw error;
  }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
