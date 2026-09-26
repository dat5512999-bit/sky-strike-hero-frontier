'use strict';
// Browser QA uses an isolated project copy: never publishes sample data to the real maps.
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),assert=require('node:assert/strict');
const {createStudio}=require('./developer-server.cjs');
(async()=>{
  const source=path.resolve(__dirname,'..'),root=fs.mkdtempSync(path.join(os.tmpdir(),'frontier-publish-ui-')),out=path.join(source,'artifacts/map-publishing');
  fs.mkdirSync(out,{recursive:true});fs.cpSync(path.join(source,'src/td'),path.join(root,'src/td'),{recursive:true});
  fs.writeFileSync(path.join(root,'src/td/map-tools/published-maps.js'),'globalThis.HeroFrontierPublishedMaps = {"schemaVersion":1,"revision":0,"maps":{}};\n');
  for(const file of ['developer-studio.html','emberroad-grid-editor.html','map-grid-editor.html','route-editor.html'])fs.copyFileSync(path.join(source,file),path.join(root,file));
  fs.mkdirSync(path.join(root,'assets/td'),{recursive:true});fs.copyFileSync(path.join(source,'assets/td/ember-road-encounter-v1.png'),path.join(root,'assets/td/ember-road-encounter-v1.png'));
  const server=createStudio(root);await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  if(process.argv.includes('--serve')){
    console.log('Isolated map QA: http://127.0.0.1:'+server.address().port+'/route-editor.html?map=emberroad');
    await new Promise(resolve=>process.once('SIGINT',resolve));
    await new Promise(resolve=>{server.close(resolve);server.closeAllConnections();});fs.rmSync(root,{recursive:true,force:true});return;
  }
  const {chromium}=require('playwright');
  let browser;
  try{
    browser=await chromium.launch({channel:'msedge',headless:true});const context=await browser.newContext({viewport:{width:1440,height:1000},serviceWorkers:'block'}),page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
    const base='http://127.0.0.1:'+server.address().port;
    await page.goto(base+'/emberroad-grid-editor.html?map=emberroad');await page.waitForFunction(()=>TowerFrontier.mapTools.Publisher.connected);
    // Simulate old saved content, then exercise the actual export/import buttons.
    await page.evaluate(()=>localStorage.setItem('heroFrontierMapLayoutOverridesV1',JSON.stringify({version:1,maps:{emberroad:{cellSize:64,buildable:[{column:3,row:3}]}}})));
    const download=page.waitForEvent('download');await page.locator('[data-pub-export]').click();const transfer=await download;const exported=path.join(root,'old-saved-maps.json');await transfer.saveAs(exported);
    await page.goto(base+'/developer-studio.html');await page.locator('[data-pub-import]').setInputFiles(exported);await page.locator('[data-pub-approve]').click();await page.waitForFunction(()=>document.querySelector('[data-pub-status]').textContent.includes('已寫入正式地圖 r1'));
    await page.goto(base+'/emberroad-grid-editor.html?map=emberroad');await page.waitForSelector('[data-grid-board] button');assert.equal(await page.locator('.grid-cell.selected').count(),1);
    await page.locator('[data-grid-clear]').click();await page.locator('[data-grid-save]').click();await page.waitForFunction(()=>document.querySelector('[data-grid-notice]').textContent.includes('到遊戲 · r2'));
    await page.goto(base+'/route-editor.html?map=emberroad');await page.waitForSelector('circle.route-node');const node=page.locator('circle.route-node').nth(4);await node.scrollIntoViewIfNeeded();const box=await node.boundingBox();const before=await node.getAttribute('cy');await page.mouse.move(box.x+box.width/2,box.y+box.height/2);await page.mouse.down();await page.mouse.move(box.x+box.width/2+10,box.y+box.height/2+15,{steps:8});await page.mouse.up();assert.notEqual(await page.locator('circle.route-node').nth(4).getAttribute('cy'),before,'路點拖曳必須真的改動座標');
    await page.locator('[data-route-save]').click();await page.waitForFunction(()=>document.querySelector('[data-route-notice]').textContent.includes('到遊戲 · r3'));
    await page.screenshot({path:path.join(out,'route-published.png'),fullPage:true});
    const second=await browser.newContext({serviceWorkers:'block'}),fresh=await second.newPage();await fresh.goto(base+'/route-editor.html?map=emberroad');await fresh.waitForSelector('circle.route-node');assert.notEqual(await fresh.locator('circle.route-node').nth(4).getAttribute('cy'),before,'全新瀏覽器也應讀到正式路線');
    await page.goto(base+'/developer-studio.html');await page.locator('[data-pub-history]').selectOption('1');await page.locator('[data-pub-rollback]').click();await page.locator('[data-pub-approve]').click();await page.waitForFunction(()=>document.querySelector('[data-pub-status]').textContent.includes('已寫入正式地圖 r4'));
    await page.screenshot({path:path.join(out,'studio-restored.png'),fullPage:true});
    await fresh.goto(base+'/emberroad-grid-editor.html?map=emberroad');await fresh.waitForSelector('[data-grid-board] button');assert.equal(await fresh.locator('.grid-cell.selected').count(),1,'還原 r1 的綠格');
    await page.locator('[data-pub-history]').selectOption('0');await page.locator('[data-pub-rollback]').click();await page.locator('[data-pub-approve]').click();await page.waitForFunction(()=>document.querySelector('[data-pub-status]').textContent.includes('已寫入正式地圖 r5'));
    await page.goto(base+'/route-editor.html?map=emberroad');await page.waitForSelector('circle.route-node');assert.equal(await page.locator('circle.route-node').nth(4).getAttribute('cy'),before,'還原原始路線不能被舊草稿蓋回編輯器');
    const count=await page.locator('circle.route-node').count();await page.locator('[data-route-add]').click();
    await page.locator('svg').click({position:{x:235,y:205}});await page.locator('svg').click({position:{x:350,y:224}});
    assert.equal(await page.locator('circle.route-node').count(),count+2);assert.equal(await page.locator('[data-route-add]').getAttribute('aria-pressed'),'true');
    await page.locator('circle.route-node').nth(4).click();assert.equal(await page.locator('circle.route-node').count(),count+2,'選取既有點不可另插入新點');
    await page.locator('[data-route-save]').click();await page.waitForFunction(()=>document.querySelector('[data-route-notice]').textContent.includes('到遊戲 · r6'));
    await page.locator('[data-route-map]').selectOption('westernsignal');assert.equal(await page.locator('[data-route-add]').getAttribute('aria-pressed'),'true');
    await page.locator('[data-route-add]').click();assert.equal(await page.locator('[data-route-add]').getAttribute('aria-pressed'),'false');
    assert.deepEqual(errors,[]);console.log('PASS: 舊存檔匯出／匯入、格線與路線一鍵儲存、連續加點與手動關閉、路點拖曳、全新瀏覽器載入、整版還原。');
  }finally{if(browser)await browser.close();await new Promise(resolve=>{server.close(resolve);server.closeAllConnections();});fs.rmSync(root,{recursive:true,force:true});}
})().catch(error=>{console.error(error);process.exitCode=1;});
