'use strict';
const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs');
(async()=>{
  const browser=await chromium.launch({channel:'msedge',headless:true}),out='artifacts/qa-cosmetic-v0847',results=[];
  fs.mkdirSync(out,{recursive:true});
  try{
    for(const [name,width,height,url] of [['desktop',1440,900,'td.html?panel=shop'],['mobile',844,390,'td.html?panel=shop']]){
      const context=await browser.newContext({viewport:{width,height},deviceScaleFactor:1,serviceWorkers:'block'}),page=await context.newPage(),errors=[];
      page.on('pageerror',error=>errors.push(error.message));
      await page.goto('http://127.0.0.1:4173/'+url);
      await page.locator('.hf-shop').waitFor();
      await page.locator('[data-shop-action="select"][data-value="bone-emperor"]').click();
      await page.locator('.hf-detail').waitFor({state:'visible'});
      assert.match(await page.locator('.hf-detail').innerText(),/冥骨帝王/);
      await page.screenshot({path:out+'/'+name+'-detail.png'});
      await page.locator('[data-shop-action="buy"][data-value="bone-emperor"]').click();
      await page.locator('dialog [data-shop-action="confirm"]').click();
      await page.locator('[data-shop-action="equip"][data-value="bone-emperor"]').click();
      assert.match(await page.locator('.hf-detail').innerText(),/已裝備/);
      const balance=await page.locator('.hf-wallet').innerText();assert.match(balance,/8,720/);
      await page.reload();await page.locator('.hf-shop').waitFor();
      await page.locator('[data-shop-action="select"][data-value="bone-emperor"]').click();
      assert.match(await page.locator('.hf-detail').innerText(),/已裝備/);
      if(name==='desktop'){
        await page.locator('[data-shop-action="select"][data-value="eclipse-court"]').click();
        await page.locator('[data-shop-action="buy"][data-value="eclipse-court"]').click();
        await page.locator('dialog [data-shop-action="confirm"]').click();
        await page.locator('[data-shop-action="equip"][data-value="eclipse-court"]').click();
        assert.match(await page.locator('.hf-detail').innerText(),/已裝備/);
        await page.locator('[data-shop-action="exit"]').click();
        await page.locator('[data-action="free"]').first().click();
        const art=await page.locator('[data-profession="chief"]').evaluate(el=>el.style.getPropertyValue('--selection-art'));
        assert.match(art,/bone-chief-portrait-v1/);
        assert.equal(await page.evaluate(()=>globalThis.towerFrontierGame.art.cosmeticFaction),'eclipse-court');
        await page.evaluate(()=>{const game=globalThis.towerFrontierGame,canvas=document.createElement('canvas');canvas.width=300;canvas.height=300;game.art.drawHero(canvas.getContext('2d'),{classType:'chief',state:'idle',frame:0,facing:0,x:150,y:215});});
        await page.waitForFunction(()=>globalThis.towerFrontierGame.art.cosmeticImages?.['assets/td/shop/bone-chief-motion-v1.png']?.ready);
        const frame=await page.evaluate(()=>{const canvas=document.createElement('canvas');canvas.width=300;canvas.height=300;const ctx=canvas.getContext('2d');const ok=globalThis.towerFrontierGame.art.drawHero(ctx,{classType:'chief',state:'idle',frame:0,facing:0,x:150,y:215});const pixels=ctx.getImageData(0,0,300,300).data;let colored=0;for(let i=3;i<pixels.length;i+=4)if(pixels[i])colored++;return {ok,colored,png:canvas.toDataURL('image/png')};});
        assert.equal(frame.ok,true);assert.ok(frame.colored>500);
        fs.writeFileSync(out+'/bone-chief-battle.png',Buffer.from(frame.png.split(',')[1],'base64'));
      }
      assert.deepEqual(errors,[]);
      results.push({name,balance,boneEquippedAfterReload:true,factionEquipped:name==='desktop',errors});await context.close();
    }
    fs.writeFileSync(out+'/results.json',JSON.stringify(results,null,2));
    process.stdout.write(JSON.stringify(results));
  }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
