'use strict';
const {chromium}=require('playwright'),fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
(async()=>{
  const out=path.resolve(__dirname,'../artifacts/boss-visuals');fs.mkdirSync(out,{recursive:true});
  const browser=await chromium.launch({channel:'msedge',headless:true});
  try{
    const context=await browser.newContext({viewport:{width:1580,height:920},serviceWorkers:'block'}),page=await context.newPage(),errors=[];
    page.on('pageerror',e=>errors.push(e.message));
    await page.goto((process.env.BOSS_QA_URL||'http://127.0.0.1:4181')+'/boss-preview.html');
    await page.waitForFunction(()=>globalThis.bossPreviewReady,{},{timeout:60000});
    for(const state of ['idle','walk','attack','cast','death']){
      for(const facing of [0,Math.PI])for(let f=0;f<4;f++){
        await page.evaluate(({state,f,facing})=>bossPreview.set(state,f,facing),{state,f,facing});
        await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
      }
      await page.evaluate(state=>bossPreview.set(state,state==='death'?3:2),state);
      await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
      await page.screenshot({path:path.join(out,state+'.png'),fullPage:true});
    }
    await page.evaluate(()=>bossPreview.set('idle',0));
    await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
    await page.locator('#boss-identity').screenshot({path:path.join(out,'hero-vs-demonlord.png')});
    const alpha=await page.evaluate(()=>bossPreview.pairs.filter(p=>!p.entry.original).map(p=>{
      const image=bossPreview.art.bossImage(p.entry),c=document.createElement('canvas');c.width=image.width;c.height=image.height;const ctx=c.getContext('2d');ctx.drawImage(image,0,0);const d=ctx.getImageData(0,0,c.width,c.height).data;let clear=0,solid=0;for(let i=3;i<d.length;i+=4){if(d[i]===0)clear++;if(d[i]>128)solid++;}return {id:p.entry.id,clear:clear/(d.length/4),solid:solid/(d.length/4)};
    }));
    alpha.forEach(a=>{assert.ok(a.clear>.25,a.id+' must have real transparency');assert.ok(a.solid>.08,a.id+' must not be blank');});
    await page.goto((process.env.BOSS_QA_URL||'http://127.0.0.1:4181')+'/td.html');
    await page.waitForFunction(()=>globalThis.towerFrontierGame?.waveHUD);
    const identities=await page.evaluate(()=>{
      const ns=TowerFrontier,g=towerFrontierGame;g.paused=true;const results=[];
      for(const e of ns.systems.BossVisualCatalog.entries){
        g.waves.reset();g.waves.wave=e.wave-1;g.waves.beginPreparation();g.waveHUD.update(0);
        const button=document.querySelector('#td-wave-groups button');results.push({name:e.name,label:button.getAttribute('aria-label')});
        g.waves.start();const spawned=[];g.waves.update(.2,spawned);results.at(-1).spawn=spawned[0].bossVisualId;
      }return results;
    });
    identities.forEach((v,i)=>{assert.ok(v.label.includes(v.name));assert.ok(v.spawn);});
    assert.deepEqual(errors,[]);
    console.log(JSON.stringify({passed:true,renderCases:400,alpha,identities,scope:'Production renderer all 10 bosses, 5 states, 4 frames, 2 directions; real HUD and spawning. Not a full 50-wave playthrough.'},null,2));
  }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
