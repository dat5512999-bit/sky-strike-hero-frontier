const {chromium}=require('playwright'),fs=require('node:fs'),assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({channel:process.env.BROWSER_CHANNEL||'chrome',headless:true});
 try{
  const page=await browser.newPage({viewport:{width:1911,height:900},serviceWorkers:'block'}),errors=[];
  page.on('pageerror',e=>{errors.push(e.message);console.log('PAGE ERROR: '+e.stack);});
  await page.goto('http://127.0.0.1:4175/td.html');await page.waitForFunction(()=>globalThis.frontierApp);
  await page.evaluate(()=>{frontierApp.openFree();const g=towerFrontierGame;g.chooseMap('autumn');g.chooseProfession('chief','wild');});
  await page.waitForFunction(()=>towerFrontierGame.profession.selected==='chief'&&!towerFrontierGame.paused);
  const cases=[];
  for(const hero of ['chief','hunter','arcanist','rogue']){
   await page.evaluate(hero=>{const g=towerFrontierGame;g.hero.chooseClass(hero);g.profession.choose(hero);},hero);
   for(const cancel of ['right','escape','button']){
    await page.evaluate(()=>{const g=towerFrontierGame;g.build.queue('minotaur','unit');g.hero.selected=false;g.updateUi();});
    if(cancel==='right')await page.locator('#td-game').click({button:'right',position:{x:650,y:320}});
    else if(cancel==='escape')await page.keyboard.press('Escape');
    else await page.locator('#td-placement-cancel').click();
    const before=await page.evaluate(()=>({last:towerFrontierGame.lastTime,pending:towerFrontierGame.build.pending,layout:document.body.dataset.layout}));
    await page.waitForFunction(last=>towerFrontierGame.lastTime>last+200,before.last);
    assert.equal(before.pending,null);cases.push({hero,cancel});
   }
  }
  await page.evaluate(()=>{const g=towerFrontierGame;g.selectHero();});
  await page.locator('#td-game').click({button:'right',position:{x:1000,y:380}});
  const move=await page.evaluate(()=>({x:towerFrontierGame.hero.x,y:towerFrontierGame.hero.y}));
  await page.waitForFunction(p=>Math.hypot(towerFrontierGame.hero.x-p.x,towerFrontierGame.hero.y-p.y)>2,move);
  fs.mkdirSync('artifacts/qa-battle-v0836',{recursive:true});await page.screenshot({path:'artifacts/qa-battle-v0836/desktop.png'});
  assert.deepEqual(errors,[]);fs.writeFileSync('artifacts/qa-battle-v0836/input-results.json',JSON.stringify({errors,cases,rightClickMovement:true},null,2));console.log('Passed four heroes, three cancellation methods, live animation and right-click movement.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
