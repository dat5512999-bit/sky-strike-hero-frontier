const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs');
(async()=>{
 const browser=await chromium.launch({channel:'msedge',headless:true}),errors=[],missing=[];
 try{
  const page=await browser.newPage({viewport:{width:1440,height:900},serviceWorkers:'block'});
  page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)missing.push(r.url());});
  await page.goto('http://127.0.0.1:4175/skin-lab.html');
  await page.waitForFunction(()=>document.body.dataset.ready==='true');
  for(const hero of ['hunter','arcanist','rogue']){
   await page.locator('[data-hero="'+hero+'"]').click();
   await page.waitForFunction(id=>document.body.dataset.ready==='true'&&document.body.dataset.hero===id,hero);
   await page.locator('button[data-motion="cast"]').click();
   await page.waitForFunction(()=>document.querySelector('#after-stage').dataset.motion==='attack'||document.querySelector('#after-stage').dataset.motion==='cast');
  }
  await page.screenshot({path:'artifacts/qa-integration-v0835/skin-lab.png',fullPage:true});
  assert.deepEqual(errors,[]);assert.deepEqual(missing,[]);
  fs.writeFileSync('artifacts/qa-integration-v0835/skin-lab-results.json',JSON.stringify({heroes:['hunter','arcanist','rogue'],errors,missing},null,2));
  console.log('Integrated Skin Lab: all three heroes load and animate with current Core.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
