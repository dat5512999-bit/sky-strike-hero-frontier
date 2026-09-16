'use strict';
// Optional browser QA: requires Playwright and the local test server on port 4173.
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const output=path.resolve(__dirname,'../artifacts/qa-v063');
const overlap=(a,b)=>a.x<b.x+b.width&&a.x+a.width>b.x&&a.y<b.y+b.height&&a.y+a.height>b.y;
(async()=>{
  fs.mkdirSync(output,{recursive:true});
  const browser=await chromium.launch({channel:'msedge',headless:true});
  const errors=[],results=[];
  try{
    const context=await browser.newContext({viewport:{width:844,height:390},hasTouch:true,isMobile:true,deviceScaleFactor:1,serviceWorkers:'block'});
    const page=await context.newPage();page.on('pageerror',error=>errors.push(error.message));
    await page.goto('http://127.0.0.1:4173/td.html?v=0.64.0');
    await page.waitForFunction(()=>globalThis.towerFrontierGame?.art.coreStatus('hunter').ready,{},{timeout:120000});
    assert.deepEqual(await page.locator('[data-profession] b').allTextContents(),['守誓者・雷恩','森語者・希爾芙','影行者・維菈']);
    assert.deepEqual(await page.locator('[data-faction] b').allTextContents(),['王國遠征軍','月影守望者','暗影軍團']);
    await page.locator('[data-profession="hunter"]').click();await page.locator('[data-faction="arcanist"]').click();
    assert.match(await page.locator('#td-start-expedition').textContent(),/守誓者・雷恩 × 月影守望者/);
    await page.screenshot({path:path.join(output,'opening-mobile.png')});
    await page.locator('#td-start-expedition').click();await page.locator('#td-hero-joystick').waitFor({state:'visible'});
    // Keep input QA deterministic while the real game loop and Hero.update keep running.
    await page.evaluate(()=>{towerFrontierGame.waves.countdown=999;});
    const cdp=await context.newCDPSession(page),pad=page.locator('#td-hero-joystick');
    await page.evaluate(()=>{window.inputTrace=[];for(const type of ['pointerdown','pointerup','pointercancel','lostpointercapture'])document.addEventListener(type,event=>window.inputTrace.push({type,id:event.pointerId,target:event.target.id||event.target.className}),true);});
    const state=()=>page.evaluate(()=>{const g=towerFrontierGame;return{x:g.hero.x,y:g.hero.y,cx:g.camera.x,cy:g.camera.y,zoom:g.camera.zoom,active:g.joystick.active,pending:g.build.pending,summons:g.summons.length};});
    const touch=(type,touchPoints)=>cdp.send('Input.dispatchTouchEvent',{type,touchPoints});
    let rect=await pad.boundingBox(),finger={x:rect.x+rect.width*.8,y:rect.y+rect.height*.5,id:1};
    const before=await state();await touch('touchStart',[finger]);await page.waitForTimeout(220);
    const moving=await state();assert.ok(moving.x>before.x+5);assert.equal(moving.cy,before.cy);assert.equal(moving.cx,before.cx);assert.equal(moving.pending,null);
    const skill=await page.locator('#td-summon').boundingBox(),second={x:skill.x+skill.width/2,y:skill.y+skill.height/2,id:2};
    await touch('touchStart',[finger,second]);await touch('touchEnd',[second]);await page.waitForTimeout(100);
    if(!(await state()).active)console.log('Input trace:',await page.evaluate(()=>({events:inputTrace,paused:towerFrontierGame.paused,layout:document.body.dataset,hidden:document.hidden})));
    assert.equal((await state()).active,true);assert.ok((await state()).summons>0,'second finger must cast summon');
    await page.screenshot({path:path.join(output,'joystick-active-mobile.png')});
    await touch('touchEnd',[]);const released=await state();await page.waitForTimeout(250);
    assert.equal((await state()).active,false);assert.equal((await state()).x,released.x);assert.equal(await pad.getAttribute('data-active'),'false');
    results.push('real touch: move, stop, camera isolation, second-finger summon');

    const panBefore=await state();await touch('touchStart',[{x:460,y:240,id:3}]);await touch('touchMove',[{x:410,y:225,id:3}]);await touch('touchEnd',[]);
    const panAfter=await state();assert.equal(panAfter.x,panBefore.x);assert.ok(panAfter.cx!==panBefore.cx||panAfter.cy!==panBefore.cy);
    const pinchBefore=await state();await touch('touchStart',[{x:400,y:230,id:4},{x:500,y:230,id:5}]);await touch('touchMove',[{x:380,y:230,id:4},{x:520,y:230,id:5}]);await touch('touchEnd',[]);
    assert.notEqual((await state()).zoom,pinchBefore.zoom);assert.equal((await state()).x,pinchBefore.x);
    results.push('map pan/pinch remain independent from hero');

    rect=await pad.boundingBox();finger={x:rect.x+rect.width*.2,y:rect.y+rect.height*.5,id:6};await touch('touchStart',[finger]);
    await page.locator('#td-pause').click();assert.equal((await state()).active,false);await touch('touchEnd',[]);await page.locator('#td-pause').click();
    assert.equal((await state()).active,false);
    results.push('pause cancels held joystick; resume requires new press');
    for(const viewport of [{width:568,height:320},{width:667,height:375},{width:844,height:390},{width:932,height:430}]){
      await page.setViewportSize(viewport);await page.waitForTimeout(150);const box=await pad.boundingBox();assert.ok(box&&box.width>=104&&box.height>=104);
      const cards={hero:await page.locator('.hero-profile').boundingBox(),build:await page.locator('.command-tabs').boundingBox(),skills:await page.locator('.td-hero-dock').boundingBox()};
      for(const [label,other]of Object.entries(cards))assert.equal(overlap(box,other),false,label+' overlaps joystick at '+viewport.width);
      assert.ok(box.x>=0&&box.y>=0&&box.x+box.width<=viewport.width&&box.y+box.height<=viewport.height);
      await page.screenshot({path:path.join(output,'battle-'+viewport.width+'x'+viewport.height+'.png')});results.push({viewport,pad:box,cards});
    }
    await page.setViewportSize({width:390,height:844});assert.equal(await pad.isVisible(),false);
    await page.setViewportSize({width:844,height:390});await pad.waitFor({state:'visible'});assert.equal((await state()).active,false);
    results.push('rotate portrait/landscape resets joystick');
    await context.close();

    const desktop=await browser.newContext({viewport:{width:1440,height:900},serviceWorkers:'block'}),pc=await desktop.newPage();pc.on('pageerror',error=>errors.push(error.message));
    await pc.goto('http://127.0.0.1:4173/td.html?v=0.63.0');await pc.waitForFunction(()=>globalThis.towerFrontierGame?.art.coreStatus('hunter').ready,{},{timeout:120000});
    await pc.locator('[data-profession="hunter"]').click();await pc.locator('[data-faction="hunter"]').click();await pc.locator('#td-start-expedition').click();await pc.waitForFunction(()=>towerFrontierGame.profession.selected==='hunter');
    assert.equal(await pc.locator('#td-hero-joystick').isVisible(),false);
    const target=await pc.evaluate(()=>{const g=towerFrontierGame,p=g.camera.worldToScreen(g.hero.x+70,g.hero.y),r=g.canvas.getBoundingClientRect();return{x:r.left+p.x*r.width/g.camera.width,y:r.top+p.y*r.height/g.camera.height,start:g.hero.x};});
    await pc.mouse.click(target.x,target.y);await pc.waitForTimeout(200);assert.ok(await pc.evaluate(()=>towerFrontierGame.hero.x)>target.start);
    results.push('PC joystick hidden; original mouse movement works');
    await pc.screenshot({path:path.join(output,'battle-desktop.png')});await desktop.close();assert.deepEqual(errors,[]);
    console.log(JSON.stringify({ok:true,results,errors},null,2));
  }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
