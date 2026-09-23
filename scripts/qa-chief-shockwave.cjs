'use strict';
const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs');
(async()=>{
  const out='artifacts/qa-chief-shockwave-v0841';fs.mkdirSync(out,{recursive:true});
  const browser=await chromium.launch({channel:'chrome',headless:true});
  try{
    const page=await browser.newPage({viewport:{width:1440,height:900},serviceWorkers:'block'}),errors=[];
    page.on('pageerror',error=>errors.push(error.message));
    await page.goto('http://127.0.0.1:4175/td.html?v=0.84.3');
    await page.waitForFunction(()=>globalThis.frontierApp&&globalThis.towerFrontierGame);
    await page.evaluate(()=>{frontierApp.openFree();towerFrontierGame.chooseMap('autumn');towerFrontierGame.chooseProfession('chief','wild');});
    await page.waitForFunction(()=>towerFrontierGame.profession.selected==='chief'&&!towerFrontierGame.paused);
    const result=await page.evaluate(()=>{
      const g=towerFrontierGame,ns=TowerFrontier,x=g.hero.x,y=g.hero.y;
      g.monsters=[];
      for(const [dx,dy] of [[130,0],[210,17],[200,135]]){
        const monster=new ns.entities.Monster('brute',1,[{x:0,y},{x:2000,y}]);
        monster.x=x+dx;monster.y=y+dy;monster.health=monster.maxHealth=1000;g.monsters.push(monster);
      }
      g.hero.pendingTarget=g.monsters[0];
      g.castHeroSkill('summon');
      const wave=g.shockwaves[0],before=g.monsters.map(m=>m.health);
      wave.update(.37,g.monsters,(m,s)=>g.onKill(m,s),(m,d,c,s)=>g.onHit(m,d,c,s));
      g.paused=true;g.draw();
      return {before,after:g.monsters.map(m=>m.health),slow:g.monsters.map(m=>m.slowTimer),travel:wave.travel,summons:g.summons.length,icon:getComputedStyle(document.querySelector('#td-summon b')).backgroundImage};
    });
    await page.screenshot({path:out+'/desktop-wave.png'});
    assert.equal(result.summons,0);assert.ok(result.travel>100);
    assert.ok(result.after[0]<result.before[0]&&result.after[1]>=result.before[1]);
    assert.ok(result.slow[0]>0);assert.match(result.icon,/chief-shockwave-icon/);
    assert.deepEqual(errors,[]);
    fs.writeFileSync(out+'/result.json',JSON.stringify({result,errors},null,2));
    console.log('Chrome shockwave gameplay and VFX passed:',JSON.stringify(result));
    const mobileContext=await browser.newContext({viewport:{width:844,height:390},hasTouch:true,isMobile:true,serviceWorkers:'block'});
    const mobilePage=await mobileContext.newPage(),mobileErrors=[];
    mobilePage.on('pageerror',error=>mobileErrors.push(error.message));
    await mobilePage.goto('http://127.0.0.1:4175/td.html?v=0.84.3');
    await mobilePage.waitForTimeout(600);
    const frame=mobilePage.url().includes('td-mobile.html')?
      await (await mobilePage.waitForSelector('iframe')).contentFrame():mobilePage;
    await frame.waitForFunction(()=>globalThis.frontierApp);
    await frame.evaluate(()=>{frontierApp.openFree();towerFrontierGame.chooseProfession('chief','wild');});
    await frame.waitForFunction(()=>towerFrontierGame.profession.selected==='chief'&&!towerFrontierGame.paused);
    await frame.locator('#td-summon').click({force:true});
    const mobile=await frame.evaluate(()=>{
      const g=towerFrontierGame;
      g.shockwaves[0].update(.24,g.monsters,(m,s)=>g.onKill(m,s),(m,d,c,s)=>g.onHit(m,d,c,s));
      g.paused=true;g.draw();
      return {waves:g.shockwaves.length,summons:g.summons.length,icon:getComputedStyle(document.querySelector('#td-summon b')).backgroundImage};
    });
    await mobilePage.screenshot({path:out+'/mobile-wave.png'});
    assert.equal(mobile.waves,1);assert.equal(mobile.summons,0);
    assert.match(mobile.icon,/chief-shockwave-icon/);assert.deepEqual(mobileErrors,[]);
    fs.writeFileSync(out+'/mobile-result.json',JSON.stringify({mobile,mobileErrors},null,2));
    console.log('Mobile touch E button and icon passed:',JSON.stringify(mobile));
    await mobileContext.close();
  }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
