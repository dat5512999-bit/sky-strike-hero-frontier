'use strict';
const http=require('node:http'),fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'../native/ios/www'),out=path.resolve(__dirname,'../artifacts/ios-player-mode');
const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml','.json':'application/json'};
(async()=>{
  assert(fs.existsSync(path.join(root,'ios-build-manifest.json')),'Run npm run ios:prepare first');
  const server=http.createServer((req,res)=>{const file=path.resolve(root,'.'+new URL(req.url,'http://localhost').pathname);if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return;}fs.readFile(file,(error,bytes)=>{if(error){res.writeHead(404).end();return;}res.setHeader('Content-Type',mime[path.extname(file)]||'application/octet-stream');res.end(bytes);});});
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));let browser;
  try{
    browser=await chromium.launch({channel:'msedge',headless:true});const context=await browser.newContext(),page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
    await page.goto('http://127.0.0.1:'+server.address().port+'/index.html',{waitUntil:'domcontentloaded'});
    await page.waitForFunction(()=>globalThis.towerFrontierGame?.app?.store,{timeout:30000});
    const before=await page.evaluate(()=>{
      const app=towerFrontierGame.app,s=app.store;app.show('settings');
      if(s.isAdmin()||s.current().wallet.diamonds!==0)throw Error('Player received admin privilege');
      if(document.querySelector('[data-action="admin"], [data-action="new-round"], [data-action="restore"], a[href="update.html"]'))throw Error('Developer control remains visible');
      app.act('admin');if(s.isAdmin())throw Error('Administrative action bypass');
      let blocked=false;try{s.switchTo('admin');}catch{blocked=true;}if(!blocked)throw Error('Store switch bypass');
      s.change(n=>{n.profiles.test.wallet.diamonds=12;});const saved=s.export();s.change(n=>{n.profiles.test.wallet.diamonds=0;});s.import(saved);
      return {key:s.constructor.KEY,edition:JSON.parse(saved).edition,diamonds:s.current().wallet.diamonds,profiles:Object.keys(s.state.profiles)};
    });assert.equal(before.diamonds,12);assert.deepEqual(before.profiles,['test']);
    fs.mkdirSync(out,{recursive:true});
    for(const screen of ['ios-privacy','ios-support']){
      await page.evaluate(screen=>towerFrontierGame.app.act(screen),screen);
      const legalFrame=page.frameLocator('iframe[title]');await legalFrame.locator('h1').waitFor();assert(await legalFrame.locator('body').innerText());assert((await legalFrame.locator('body').innerText()).includes('開發版說明'));
      await page.screenshot({path:path.join(out,screen+'.png')});await page.evaluate(()=>towerFrontierGame.app.act('settings'));
      assert.equal(await page.evaluate(()=>towerFrontierGame.app.store.current().wallet.diamonds),12);
    }
    await page.evaluate(()=>{towerFrontierGame.app.message='';towerFrontierGame.app.render();});
    await page.setViewportSize({width:1280,height:800});await page.screenshot({path:path.join(out,'settings-1280x800.png')});
    // A narrow desktop viewport is not the mobile surface: use touch/coarse
    // input so the established landscape mobile shell actually runs.
    const mobile=await browser.newContext({viewport:{width:393,height:852},isMobile:true,hasTouch:true}),phone=await mobile.newPage();phone.on('pageerror',e=>errors.push(e.message));
    await phone.goto('http://127.0.0.1:'+server.address().port+'/index.html',{waitUntil:'domcontentloaded'});await phone.waitForURL('**/td-mobile.html');await phone.waitForSelector('iframe');
    const frame=phone.frames().find(f=>/\/td\.html/.test(f.url()));assert(frame,'mobile game frame');await frame.waitForFunction(()=>globalThis.towerFrontierGame?.app?.store,{timeout:30000});
    await frame.evaluate(()=>towerFrontierGame.app.show('settings'));
    assert.equal(await frame.locator('[data-action="admin"], [data-action="new-round"], a[href="update.html"]').count(),0);await phone.screenshot({path:path.join(out,'settings-touch-393x852.png')});await mobile.close();
    await page.reload({waitUntil:'domcontentloaded'});await page.waitForFunction(()=>globalThis.towerFrontierGame?.app?.store,{timeout:30000});
    const after=await page.evaluate(async()=>({diamonds:towerFrontierGame.app.store.current().wallet.diamonds,admin:towerFrontierGame.app.store.isAdmin(),workers:(await navigator.serviceWorker.getRegistrations()).length}));
    assert.deepEqual(after,{diamonds:12,admin:false,workers:0});assert.deepEqual(errors,[]);
    fs.writeFileSync(path.join(out,'report.json'),JSON.stringify({before,after,errors,scope:'Isolated desktop Edge profile, packaged iOS web assets; not WKWebView or iPhone certification'},null,2));console.log('PASS iOS player bundle: normal wallet, blocked admin UI/action/store, backup import, reload persistence, two viewports, no Worker or JS errors');
  }finally{if(browser)await browser.close();await new Promise(resolve=>server.close(resolve));}
})().catch(error=>{console.error(error);process.exitCode=1;});
