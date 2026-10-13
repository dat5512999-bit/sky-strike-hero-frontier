'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const {load}=require('./helpers/td-runtime.cjs'),{strictCanvas}=require('./helpers/strict-canvas.cjs'),{rgba}=require('./png-pixels.cjs');
test('all ten shared-atlas heroes have 320 complete transparent poses and no cropped or omitted body pixels',()=>{
  const {ns}=load();
  for(const ranks of Object.values(ns.systems.HeroEvolutionSpriteAtlas))for(const form of Object.values(ranks)){
    const {width,height,pixels}=rgba(form.path),covered=new Uint8Array(width*height);
    assert.equal(width,form.width);assert.equal(height,form.height);assert.equal(form.frames.length,16);assert(pixels[3]<=1,'background must be transparent (allow 1/255 alpha residue)');
    for(const [x,y,w,h,fx,fy]of form.frames){
      assert(x>=0&&y>=0&&x+w<=width&&y+h<=height);assert(fx>x&&fx<x+w&&fy>y&&fy<y+h);
      let solid=0,clear=0;
      for(let cy=y;cy<y+h;cy++)for(let cx=x;cx<x+w;cx++){
        const i=cy*width+cx,a=pixels[i*4+3];covered[i]=1;if(a>=48)solid++;if(a===0)clear++;
        if(cx===x||cx===x+w-1||cy===y||cy===y+h-1)assert(a<48,form.path+' clipped at '+cx+','+cy);
      }
      assert(solid>2000,form.path+' has an empty or undersized pose');assert(clear>500);assert(form.worldHeight<=106);
    }
    for(let i=0;i<covered.length;i++)assert(covered[i]||pixels[i*4+3]<48,form.path+' omitted pixel '+i);
  }
});
function fixture(){const {ns}=load(),art=Object.create(ns.systems.ArtSystem.prototype);art.load=path=>({assetSrc:path,ready:true,width:1254,height:1254});return {ns,art};}
test('the complete playable roster has two distinct painted forms without missing heroes',()=>{
  const {ns}=load(),roster=Object.keys(ns.systems.HeroRoster.CLASSES);
  assert.equal(roster.length,11);
  for(const type of roster){const ranks=type==='bull'?ns.systems.BullEvolutionAtlas:ns.systems.HeroEvolutionSpriteAtlas[type];assert(ranks,type);assert(ranks[1]&&ranks[2],type);assert.notEqual(ranks[1].path,ranks[2].path,type);}
});
test('evolution status labels stay below the health bar and hero caption',()=>{
  const {ns}=load();for(const type of ['goblin','dwarf','dragonkin','egypt','chief']){
    const h=new ns.entities.Hero(100,100);h.chooseClass(type);h.evolution.rank=2;h.evolutionAvatarTime=3;
    const c=strictCanvas();ns.systems.HeroEvolutionPresentation.drawStatus(c.ctx,h,2);
    const text=c.calls.find(call=>call[0]==='fillText');assert(text,type);assert.equal(text[3],h.y+60);assert.equal(c.depth,0);
  }
});
test('all shared-atlas heroes render each rank/state/frame and mirror without changing stats, gear or equipment',()=>{
  const {ns,art}=fixture();let overlays=0;art.drawGearPieces=()=>overlays++;
  for(const type of Object.keys(ns.systems.HeroEvolutionSpriteAtlas))for(const rank of [1,2]){
    const h=new ns.entities.Hero(100,100);h.chooseClass(type);h.evolution.rank=rank;h.equipment.spear=3;h.equipment.core='fire';h.gear={weapon:'test'};
    const before=JSON.stringify([h.equipment,h.gear,h.combatConfig().damage,h.healthAtLevel(),h.evolution]);
    for(const state of ['idle','walk','attack','cast','hit'])for(let frame=0;frame<4;frame++)for(const facing of [0,Math.PI]){
      Object.assign(h,{state,frame,facing,animationTime:frame/3});const c=strictCanvas();assert.equal(art.drawHeroEvolutionSprite(c.ctx,h),true);assert.equal(c.depth,0);
      const call=c.calls.find(a=>a[0]==='drawImage');assert.equal(call[1].assetSrc,ns.systems.HeroEvolutionSpriteAtlas[type][rank].path);
      assert.equal(ns.systems.HeroEvolutionPresentation.drawRegalia(c.ctx,h),false);
      assert.equal(c.calls.some(a=>a[0]==='scale'&&a[1]===-1),facing===Math.PI);
    }
    assert.equal(JSON.stringify([h.equipment,h.gear,h.combatConfig().damage,h.healthAtLevel(),h.evolution]),before);
  }assert.equal(overlays,800);
});
test('un-evolved, paid skins, disabled preview and unavailable atlases defer to existing renderer',()=>{
  const {ns,art}=fixture();
  for(const type of Object.keys(ns.systems.HeroEvolutionSpriteAtlas)){
    const h=new ns.entities.Hero(100,100);h.chooseClass(type);const c=strictCanvas();assert.equal(art.drawHeroEvolutionSprite(c.ctx,h),false);
    h.evolution.rank=2;art.cosmeticEquipped={['hero:'+type]:type==='hunter'?'tigerstripe-vanguard':'abyss-response'};assert.equal(art.drawHeroEvolutionSprite(c.ctx,h),false);
    art.cosmeticEquipped={};h.evolutionVisualDisabledRank=2;assert.equal(art.drawHeroEvolutionSprite(c.ctx,h),false);delete h.evolutionVisualDisabledRank;
    const image=art.preloadHeroEvolution(type,2);image.ready=false;assert.equal(art.drawHeroEvolutionSprite(c.ctx,h),false);image.failed=true;assert.equal(art.drawHeroEvolutionSprite(c.ctx,h),false);
    image.ready=true;assert.equal(art.drawHeroEvolutionSprite(c.ctx,h),true);
  }
  assert.equal(art.preloadHeroEvolution('unknown-hero',1),null);
});
test('context is restored on draw failure, and bad frame values are clamped',()=>{
  const {ns,art}=fixture(),h=new ns.entities.Hero(0,0);h.chooseClass('naga');h.evolution.rank=1;h.state='attack';
  for(const frame of [-9,99,NaN,undefined]){h.frame=frame;assert.equal(art.drawHeroEvolutionSprite(strictCanvas().ctx,h),true);}
  const c=strictCanvas();c.ctx.drawImage=()=>{throw new Error('draw failed');};assert.throws(()=>art.drawHeroEvolutionSprite(c.ctx,h),/draw failed/);assert.equal(c.depth,0);
});
test('painted forms suppress obsolete crests but preserve cast and evolution effects',()=>{
  const {ns}=fixture();for(const type of Object.keys(ns.systems.HeroEvolutionSpriteAtlas)){const h=new ns.entities.Hero(0,0);h.chooseClass(type);h.evolution.rank=2;let c=strictCanvas();ns.systems.HeroEvolutionPresentation.draw(c.ctx,null,h);assert(c.calls.every(call=>['fillText','strokeText'].includes(call[0])),'only gameplay status labels may remain');
    h.evolutionCast={slot:'q',rank:2,time:.5,max:1,targetX:150,targetY:100};c=strictCanvas();ns.systems.HeroEvolutionPresentation.draw(c.ctx,null,h);assert(c.calls.length>0);assert.equal(c.depth,0);
  }
});
test('shared sprite renderer is loaded once after paid skins and all assets are cached offline',()=>{
  const {ns}=load(),html=fs.readFileSync('td.html','utf8'),sw=fs.readFileSync('sw.js','utf8');
  for(const name of ['HeroEvolutionSpriteAtlas','HeroEvolutionSpriteArt']){const p='src/td/systems/'+name+'.js';assert.equal(html.split(p).length,2);assert(sw.includes(p));}
  assert(html.indexOf('HeroEvolutionSpriteArt.js')>html.indexOf('CrossworldSkinArt.js'));
  for(const ranks of Object.values(ns.systems.HeroEvolutionSpriteAtlas))for(const form of Object.values(ranks))assert(sw.includes(form.path));
});
