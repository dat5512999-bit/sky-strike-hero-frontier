'use strict';
// Run against serve:test (default port 4177). Isolated profile, no player save changes.
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const out=path.resolve(__dirname,'../artifacts/hero-skill-layout');
const sizes=[{width:1440,height:900},{width:1280,height:720},{width:925,height:908},{width:844,height:390},{width:667,height:375}];
(async()=>{
  fs.mkdirSync(out,{recursive:true});
  const browser=await chromium.launch({channel:'msedge',headless:true});
  try{
    const page=await browser.newPage({serviceWorkers:'block'}),errors=[],results=[];
    page.on('pageerror',error=>errors.push(error.message));
    await page.goto(process.env.HERO_SKILL_QA_URL||'http://127.0.0.1:4177/td.html',{waitUntil:'domcontentloaded'});
    await page.waitForFunction(()=>globalThis.towerFrontierGame?.app);
    await page.evaluate(()=>{towerFrontierGame.app.openFree();towerFrontierGame.showOpeningPage('party');});
    const assets=await page.evaluate(async()=>Promise.all(Object.entries(TowerFrontier.systems.HeroRoster.CLASSES).filter(([,hero])=>hero.skillArt).map(async([id,hero])=>{
      const image=new Image();image.src=hero.skillArt;await image.decode();return {id,width:image.naturalWidth,height:image.naturalHeight};
    })));
    assert(assets.every(asset=>asset.width>0&&asset.height>0),'all dedicated atlases load');
    for(const viewport of sizes){
      await page.setViewportSize(viewport);
      const cases=await page.evaluate(()=>{
        const g=towerFrontierGame,roster=TowerFrontier.systems.HeroRoster.CLASSES;
        const variants=[...Object.keys(roster).map(hero=>({hero,skin:null})),...FrontierShop.catalog.filter(s=>s.category==='hero').map(s=>({hero:s.targetId,skin:s.id}))];
        const inside=(outer,inner)=>inner.left>=outer.left-1&&inner.right<=outer.right+1&&inner.top>=outer.top-1&&inner.bottom<=outer.bottom+1;
        return variants.map(variant=>{
          g.art.cosmeticEquipped=variant.skin?{['hero:'+variant.hero]:variant.skin}:{};
          g.selectedProfession=variant.hero;g.updateOpeningPresentation();
          const list=g.ui.heroSkills,cards=[...list.children];
          return {...variant,explicit:list.dataset.iconArt==='true',cards:cards.map((card,index)=>{
            const r=card.getBoundingClientRect(),icon=card.querySelector('i'),label=card.querySelector('em');
            const range=document.createRange();range.selectNodeContents(label||card);
            const lr=range.getBoundingClientRect(),ir=icon?.getBoundingClientRect(),style=getComputedStyle(card,'::before');
            return {index,width:r.width,height:r.height,labelInside:inside(r,lr),iconInside:ir?inside(r,ir):parseFloat(style.top)+parseFloat(style.height)<=r.height,
              iconSize:ir?.width||parseFloat(style.width),labelBelow:!ir||lr.top>=ir.bottom-1,
              noDuplicate:!icon||style.display==='none',named:card.textContent===roster[variant.hero].skills[index],
              tooltip:card.title===roster[variant.hero].hints[index],atlas:!icon||icon.style.backgroundImage.includes(roster[variant.hero].skillArt)};
          })};
        });
      });
      for(const item of cases){
        assert.equal(item.cards.length,3);
        for(const card of item.cards){
          const context=JSON.stringify({viewport,...item,card});
          assert(card.width>0&&card.height>0,context);
          for(const field of ['labelInside','iconInside','labelBelow','noDuplicate','named','tooltip','atlas'])assert(card[field],field+': '+context);
          assert.equal(card.iconSize,viewport.width<=1000||viewport.height<=600?23:42,context);
        }
      }
      results.push({viewport,cases});
      await page.evaluate(()=>{const g=towerFrontierGame;g.selectedProfession='chief';g.art.cosmeticEquipped={'hero:chief':'bone-emperor'};g.updateOpeningPresentation();});
      await page.screenshot({path:path.join(out,`chief-${viewport.width}x${viewport.height}.png`)});
    }
    assert.deepEqual(errors,[]);
    fs.writeFileSync(path.join(out,'results.json'),JSON.stringify({assets,results,errors},null,2));
    console.log(`PASS: ${results.reduce((n,r)=>n+r.cases.length,0)} hero/skin/viewport cases; all labels and icons contained; ${assets.length} atlases decoded; no page errors.`);
  }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
