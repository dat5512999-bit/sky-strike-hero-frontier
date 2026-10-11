'use strict';
// Isolated browser profile: never reads or changes the player's saved game.
const {chromium}=require('playwright');
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const out=path.resolve(__dirname,'../artifacts/mobile-hud');
const base=process.env.MOBILE_HUD_QA_URL||'http://127.0.0.1:4186';
(async()=>{
  fs.mkdirSync(out,{recursive:true});
  const browser=await chromium.launch({channel:'msedge',headless:true});
  try{
    const results=[];
    for(const [name,width,height,inset] of [['phone',844,390,60],['small',667,375,44],['short',568,320,44],['portrait',390,844,60],['wide-touch',1024,600,0]]){
    const context=await browser.newContext({viewport:{width,height},hasTouch:true,isMobile:true,serviceWorkers:'block'});
    const page=await context.newPage();
    const errors=[];page.on('pageerror',error=>errors.push(error.message));
    await page.goto(base+'/td-mobile.html');
    const view=await (await page.waitForSelector('iframe')).contentFrame();
    await view.waitForFunction(()=>globalThis.frontierApp);
    await view.evaluate(()=>{frontierApp.openFree();towerFrontierGame.chooseMap('westernsignal');towerFrontierGame.chooseProfession('hunter','hunter');});
    await view.waitForFunction(()=>towerFrontierGame.camera.enabled);
    await view.waitForFunction(()=>towerFrontierGame.art.skillIcons.ready);
    await view.evaluate(inset=>{document.body.style.setProperty('--mobile-shell-system-inset',inset+'px');},inset);
    await view.evaluate(()=>{towerFrontierGame.paused=true;towerFrontierGame.updateUi();});
    await view.locator('[data-command-tab="build"]').click();
    const drawer=await view.evaluate(()=>{
      const rect=selector=>document.querySelector(selector).getBoundingClientRect().toJSON();
      return {stage:rect('.td-stage'),drawer:rect('#td-build-drawer'),close:rect('#td-build-drawer-close')};
    });
    const inside=(a,b)=>b.left>=a.left-1&&b.right<=a.right+1&&b.top>=a.top-1&&b.bottom<=a.bottom+1;
    assert(inside(drawer.stage,drawer.drawer),name+' drawer '+JSON.stringify(drawer));
    assert(inside(drawer.drawer,drawer.close),name+' close');assert(drawer.close.width>=44&&drawer.close.height>=44,name+' close touch target '+JSON.stringify(drawer));
    await view.locator('.build-drawer-grid').evaluate(e=>e.scrollLeft=e.scrollWidth);
    await page.screenshot({path:path.join(out,name+'-drawer.png')});
    await view.locator('#td-build-drawer-close').click();
    assert(await view.locator('#td-build-drawer').isHidden(),name+' closes after scroll');
    const result=await view.evaluate(()=>{
      const g=towerFrontierGame;g.paused=true;
      const toast=document.querySelector('#td-clarity-toast');toast.hidden=false;toast.textContent='敵軍接近城門，查看小地圖補漏';
      const measure=selector=>{const e=document.querySelector(selector),r=e.getBoundingClientRect(),s=getComputedStyle(e);return {selector,rect:r.toJSON(),display:s.display,width:s.width,left:s.left,grid:s.gridTemplateColumns,bg:s.backgroundImage,font:s.fontSize};};
      const item=new TowerFrontier.entities.CombatUnit('hunter',g.hero.x,g.hero.y);g.build.items.push(item);g.build.selected=item;g.updateUi();
      const positions=[];
      for(let n=0;n<20;n++){item.x+=7;g.lastSelectionActionLayout=0;g.positionSelectionActions();positions.push(measure('#td-selection-actions').rect);}
      toast.hidden=false;toast.textContent='敵軍接近城門，查看小地圖補漏';
      return {positions,panels:['.td-stage','.hero-profile','#td-clarity-toast','#td-skill-button b','#td-thunder b','#td-summon b','#td-ultimate b'].map(measure)};
    });
    const [stage,portrait,toast,...icons]=result.panels;
    assert(portrait.rect.right<=toast.rect.left,name+' portrait overlaps warning');
    assert(inside(stage.rect,toast.rect),name+' warning visible');
    assert(result.positions.every(p=>inside(stage.rect,p)),name+' toolbar visible');
    assert.equal(new Set(result.positions.map(p=>p.x+','+p.y+','+p.width)).size,1,name+' stable action toolbar');
    assert(icons.every(i=>i.font==='0px'&&i.bg.includes('hero-skill-icons-v1.png')),name+' painted skill icons');
    await page.screenshot({path:path.join(out,name+'-hud.png')});
    assert.deepEqual(errors,[]);results.push({name,drawer,...result});
    await context.close();
    }
    fs.writeFileSync(path.join(out,'results.json'),JSON.stringify(results,null,2));
    const slow=await browser.newContext({viewport:{width:844,height:390},hasTouch:true,serviceWorkers:'block'});
    let release;const held=new Promise(resolve=>release=resolve);
    await slow.route('**/hero-skill-icons-v1.png',async route=>{await held;await route.continue();});
    const slowPage=await slow.newPage();await slowPage.goto(base+'/td-mobile.html',{waitUntil:'domcontentloaded'});
    const slowView=await (await slowPage.waitForSelector('iframe')).contentFrame();
    await slowView.waitForFunction(()=>globalThis.frontierApp);
    await slowView.evaluate(()=>{frontierApp.openFree();towerFrontierGame.chooseProfession('hunter','hunter');});
    await slowView.waitForFunction(()=>towerFrontierGame.pendingProfession==='hunter');
    assert.equal(await slowView.evaluate(()=>!!towerFrontierGame.profession.selected),false,'slow atlas keeps launch pending');
    release();await slowView.waitForFunction(()=>towerFrontierGame.profession.selected==='hunter');
    assert.equal(await slowView.evaluate(()=>document.body.dataset.skillArt),'ready','atlas ready when battle starts');
    await slow.close();
    console.log('PASS: five touch/rotated configurations; safe-area close button, scroll/close, portrait warning, stable toolbar, four skill images and slow-atlas launch gate.');
  }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
