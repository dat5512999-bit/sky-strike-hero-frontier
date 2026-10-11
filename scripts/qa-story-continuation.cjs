'use strict';
const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const base=process.env.STORY_CONTINUATION_QA_URL||'http://127.0.0.1:4189/assets/td/concepts/story-comic-v2/continuation/review.html';
const out=path.resolve(__dirname,'../artifacts/story-continuation');
const ready=page=>page.waitForSelector('#stage[data-state=ready]',{timeout:20000});
async function layout(page){
  const state=await page.evaluate(()=>({outer:document.documentElement.scrollHeight-innerHeight,buttons:['prev','next','zoom','text','pages'].map(id=>{const e=document.getElementById(id),r=e.getBoundingClientRect(),hit=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);return {id,w:r.width,h:r.height,visible:r.top>=0&&r.bottom<=innerHeight+1&&r.left>=0&&r.right<=innerWidth+1,hit:hit===e||e.contains(hit)};})}));
  assert(state.outer<=2,'outer scrolling '+JSON.stringify(state));for(const b of state.buttons)assert(b.w>=44&&b.h>=44&&b.visible&&b.hit,JSON.stringify(b));return state;
}
(async()=>{
  fs.mkdirSync(out,{recursive:true});const browser=await chromium.launch({channel:'msedge',headless:true}),reports=[];
  try{for(const [name,width,height] of [['desktop',1365,900],['phone',844,390],['small-phone',667,375]]){
    const context=await browser.newContext({viewport:{width,height},hasTouch:name!=='desktop',serviceWorkers:'block'}),page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
    await page.goto(base);await ready(page);assert.equal(await page.locator('#pages option').count(),8);
    const visited=[];for(let i=0;i<8;i++){
      await page.selectOption('#pages',String(i));await ready(page);await layout(page);
      const info=await page.locator('#stage img').evaluate(img=>({w:img.naturalWidth,h:img.naturalHeight,src:img.getAttribute('src')}));assert.equal(info.w,1536);assert.equal(info.h,1024);assert.equal(info.src,'review/main-'+(45+i)+'.webp');visited.push(info.src);
    }
    assert(await page.locator('#next').isDisabled());await page.screenshot({path:path.join(out,name+'-page52.png')});
    await page.locator('#text').click();assert(await page.locator('#transcript').isVisible());await layout(page);assert((await page.locator('#lines li').count())>=4);await page.locator('#text').click();
    await page.locator('#zoom').click();assert.equal(await page.locator('#zoom').getAttribute('aria-pressed'),'true');await layout(page);
    if(name==='desktop'){const r=await page.locator('#stage').boundingBox();await page.mouse.move(r.x+r.width*.8,r.y+r.height*.7);await page.mouse.down();await page.mouse.move(r.x+r.width*.3,r.y+r.height*.3,{steps:5});await page.mouse.up();assert(await page.locator('#stage').evaluate(e=>e.scrollLeft>0||e.scrollTop>0));}
    await page.locator('#zoom').click();await page.locator('#next').focus();await page.keyboard.press('Home');await ready(page);assert(await page.locator('#prev').isDisabled());
    let rejectImage=true;await page.route('**/review/main-47.webp*',route=>rejectImage?route.abort():route.continue());
    await page.selectOption('#pages','2');await page.waitForSelector('#stage[data-state=error]');assert(await page.locator('#retry').isVisible());await page.locator('#text').click();assert(await page.locator('#transcript').isVisible());rejectImage=false;await page.locator('#retry').click();await ready(page);await page.locator('#text').click();
    const storage=await page.evaluate(()=>({local:Object.keys(localStorage),session:Object.keys(sessionStorage)}));assert.deepEqual(storage,{local:[],session:[]});assert.deepEqual(errors,[]);
    await page.goto(base+'#page=51');await ready(page);assert.equal(await page.locator('#pages').inputValue(),'6');
    await page.route('**/production-v1.json',route=>route.fulfill({contentType:'application/json',body:'{"pages":[]}'}));await page.reload();await page.waitForSelector('#load-error:not([hidden])');assert(await page.locator('#reload').isVisible());await page.unroute('**/production-v1.json');await page.locator('#reload').click();await ready(page);await layout(page);
    reports.push({name,width,height,pages:visited.length,storage,errors});await context.close();console.log('PASS continuation '+name);
  }}finally{await browser.close();}
  fs.writeFileSync(path.join(out,'report.json'),JSON.stringify({base,reports},null,2));
})().catch(e=>{console.error(e);process.exitCode=1;});
