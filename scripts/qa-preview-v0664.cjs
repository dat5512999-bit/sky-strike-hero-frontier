'use strict';
const {chromium}=require('playwright'),fs=require('fs'),assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({channel:'msedge',headless:true});try{
 const page=await browser.newPage({viewport:{width:1680,height:900},serviceWorkers:'block'}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:4173/td.html');await page.waitForFunction(()=>globalThis.towerFrontierGame?.art.coreStatus('hunter').ready);
 await page.locator('[data-profession="hunter"]').click();await page.locator('[data-faction="hunter"]').click();await page.locator('#td-start-expedition').click();
 await page.evaluate(()=>{const g=towerFrontierGame;g.paused=true;g.showCommands('build');});
 await page.waitForFunction(()=>[...document.querySelectorAll('.build-drawer-grid [data-build-type]')].filter(b=>!b.hidden).every(b=>b.dataset.previewReady==='true'));
 fs.mkdirSync('artifacts/qa-preview-v0664',{recursive:true});
 for(const [name,width,height] of [['desktop',1680,900],['compact',1280,720],['mobile',844,390]]){
 await page.setViewportSize({width,height});await page.waitForTimeout(250);
 const data=await page.evaluate(()=>[...document.querySelectorAll('.build-drawer-grid [data-build-type]')].filter(b=>!b.hidden).map(b=>{const rect=b.getBoundingClientRect(),parts=['canvas','b','span','small'].map(s=>{const r=b.querySelector(s).getBoundingClientRect();return {y:r.y-rect.y,bottom:r.bottom-rect.y};});const c=b.querySelector('canvas'),p=c.getContext('2d').getImageData(0,0,128,128).data;let x1=128,y1=128,x2=0,y2=0;for(let y=0;y<128;y++)for(let x=0;x<128;x++)if(p[(y*128+x)*4+3]>32){x1=Math.min(x1,x);x2=Math.max(x2,x);y1=Math.min(y1,y);y2=Math.max(y2,y);}return {type:b.dataset.buildType,height:rect.height,parts,extent:Math.max(x2-x1+1,y2-y1+1)};}));
 assert.ok(data.length>5);for(const d of data){assert.ok(d.extent>=109&&d.extent<=114,JSON.stringify(d));assert.ok(d.parts[3].bottom<=d.height,JSON.stringify(d));for(let i=0;i<4;i++)assert.ok(Math.abs(d.parts[i].y-data[0].parts[i].y)<1,JSON.stringify(d));}
 await page.locator('#td-build-drawer').screenshot({path:'artifacts/qa-preview-v0664/'+name+'.png'});fs.writeFileSync('artifacts/qa-preview-v0664/'+name+'.json',JSON.stringify(data,null,2));
 }
 assert.deepEqual(errors,[]);console.log('Preview size, row alignment, price containment passed at three viewports.');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exit(1);});
