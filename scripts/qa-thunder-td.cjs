'use strict';
const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs');
const base=process.env.TD_QA_URL||'http://127.0.0.1:4173',out='artifacts/qa-thunder-td-v061';
(async()=>{
 fs.mkdirSync(out,{recursive:true});const browser=await chromium.launch({channel:'msedge',headless:true}),results=[];
 try{for(const [name,width,height] of [['pc',1920,1080],['iphone',844,390]]){
  const context=await browser.newContext({viewport:{width,height},deviceScaleFactor:1,hasTouch:name==='iphone',serviceWorkers:'block'}),host=await context.newPage(),errors=[],missing=[];
  host.on('pageerror',e=>errors.push(e.message));host.on('console',m=>{if(m.type()==='error')errors.push(m.text());});host.on('response',r=>{if(r.status()>=400)missing.push(r.url());});
  await host.goto(base+'/td.html');
  let page=host;if(name==='iphone'){await host.waitForURL('**/td-mobile.html');page=await (await host.waitForSelector('iframe')).contentFrame();}
  await page.waitForFunction(()=>document.body.dataset.appReady==='true');
  await page.evaluate(()=>frontierApp.store.change(s=>{s.profiles.admin.data['shop:state']=JSON.stringify({version:1,revision:7,balance:10000,ownedSkins:['astral-oath','bone-emperor','eclipse-court'],equippedSkins:{'hero:arcanist':'astral-oath','hero:chief':'bone-emperor','faction:hunter':'eclipse-court'}});}));
  await page.locator('[data-action="shop"]').first().click();await page.locator('#frontier-shop').waitFor();
  assert.equal(await page.locator('.hf-shop').count(),1);
  await page.locator('[data-shop-action="select"][data-value="thunder-king"]').click();
  await host.screenshot({path:out+'/'+name+'-detail.png'});
  await page.locator('[data-shop-action="buy"][data-value="thunder-king"]').click();
  await page.locator('dialog [data-shop-action="cancel"]').click();
  assert.match(await page.locator('.hf-wallet').innerText(),/10,000/);
  await page.locator('[data-shop-action="buy"][data-value="thunder-king"]').click();
  await page.locator('dialog [data-shop-action="confirm"]').click();
  await page.locator('[data-shop-action="equip"][data-value="thunder-king"]').click();
  assert.match(await page.locator('.hf-wallet').innerText(),/8,720/);
  const saved=await page.evaluate(()=>JSON.parse(frontierApp.store.current().data['shop:state']));
  assert.deepEqual(saved.equippedSkins,{'hero:arcanist':'astral-oath','hero:chief':'thunder-king','faction:hunter':'eclipse-court'});
  await host.screenshot({path:out+'/'+name+'-equipped.png'});
  // Comparison must return to the same integrated storefront with the saved equipment.
  await page.locator('.hf-compare-link').click();
  await page.waitForFunction(()=>document.body.dataset.ready==='true'&&document.body.dataset.hero==='chief');
  for(const motion of ['idle','walk','attack','cast']){
   await page.locator('button[data-motion="'+motion+'"]').click();await page.waitForFunction(m=>document.querySelector('#after-stage').dataset.motion===m,motion);
  }
  assert.equal(await page.locator('.lab-stage-section').isVisible(),true);
  await host.screenshot({path:out+'/'+name+'-lab.png',fullPage:true});
  await page.locator('.lab-header a').click();await page.locator('#frontier-shop').waitFor();
  await page.locator('[data-shop-action="select"][data-value="thunder-king"]').click();
  assert.match(await page.locator('.hf-detail').innerText(),/已裝備/);
  if(name==='iphone')await page.locator('[data-shop-action="close-detail"]').click();
  await page.locator('[data-shop-action="exit"]').click();
  await page.locator('[data-action="free"]').first().click();
  assert.match(await page.locator('[data-profession="chief"]').evaluate(el=>el.style.getPropertyValue('--selection-art')),/thunder-chief-portrait-v1/);
  await page.evaluate(()=>towerFrontierGame.chooseProfession('chief','hunter'));
  await page.waitForFunction(()=>towerFrontierGame.profession.selected==='chief');
  await page.waitForFunction(()=>['motion','attack','cast'].every(n=>towerFrontierGame.art.cosmeticImages?.['assets/td/shop/thunder-chief-'+n+'-v3.png']?.ready));
  await host.screenshot({path:out+'/'+name+'-battle.png'});
  const frames=await page.evaluate(()=>{
   const game=towerFrontierGame,before=JSON.stringify({hero:game.hero,economy:game.economy},(k,v)=>k==='game'?undefined:v);
   const canvas=document.createElement('canvas');canvas.width=420;canvas.height=360;const ctx=canvas.getContext('2d'),data=[];
   for(const state of ['idle','walk','attack','cast'])for(let frame=0;frame<4;frame++){
    ctx.clearRect(0,0,420,360);const hero=Object.freeze({...game.hero,state,frame,x:210,y:260});
    const ok=game.art.drawHero(ctx,hero),pixels=ctx.getImageData(0,0,420,360).data;let colored=0,edge=0;
    for(let i=3;i<pixels.length;i+=4)if(pixels[i]){colored++;const p=(i-3)/4,x=p%420,y=Math.floor(p/420);if(x===0||x===419||y===0||y===359)edge++;}
    data.push({state,frame,ok,colored,edge});
   }
   return {data,unchanged:before===JSON.stringify({hero:game.hero,economy:game.economy},(k,v)=>k==='game'?undefined:v)};
  });
  assert.equal(frames.unchanged,true);frames.data.forEach(f=>{assert.equal(f.ok,true);assert.ok(f.colored>500);assert.equal(f.edge,0);});
  // Reopen the real page: no standalone entry or mock store is involved.
  await page.goto(base+'/td.html?panel=shop');await page.locator('#frontier-shop').waitFor();
  await page.locator('[data-shop-action="select"][data-value="bone-emperor"]').click();
  await page.locator('[data-shop-action="equip"][data-value="bone-emperor"]').click();
  if(name==='iphone')await page.locator('[data-shop-action="close-detail"]').click();
  await page.locator('[data-shop-action="select"][data-value="thunder-king"]').click();assert.match(await page.locator('.hf-detail').innerText(),/已擁有/);
  await page.locator('[data-shop-action="equip"][data-value="thunder-king"]').click();
  await page.locator('[data-shop-action="unequip"][data-value="thunder-king"]').click();
  assert.equal(await page.evaluate(()=>JSON.parse(frontierApp.store.current().data['shop:state']).equippedSkins['hero:chief']),undefined);
  await page.locator('[data-shop-action="equip"][data-value="thunder-king"]').click();
  await page.goto(page.url());await page.locator('#frontier-shop').waitFor();
  assert.equal(await page.evaluate(()=>JSON.parse(frontierApp.store.current().data['shop:state']).equippedSkins['hero:chief']),'thunder-king');
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  assert.deepEqual(errors,[]);assert.deepEqual(missing,[]);
  results.push({name,viewport:{width,height},singleShop:true,persisted:true,originalPurchasesPreserved:true,frames,errors,missing});await context.close();
 }
 // Request through the API client to avoid treating the intentional 404 as a page error.
 assert.equal((await fetch(base+'/shop.html')).status,404);
 fs.writeFileSync(out+'/results.json',JSON.stringify(results,null,2));console.log(JSON.stringify(results));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
