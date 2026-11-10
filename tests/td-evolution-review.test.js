'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const {load,game}=require('./helpers/td-runtime.cjs'),{strictCanvas}=require('./helpers/strict-canvas.cjs');
const memory=()=>{const values=new Map();return{getItem:key=>values.get(key)??null,setItem:(key,value)=>values.set(key,value)};};
test('appearance is isolated by profile, hero and round; purchase state and stats are unchanged',()=>{
  const {ns}=load(),g=game(ns),A=ns.systems.HeroAppearanceSystem,storage=memory(),store=new ns.systems.ProfileStore(storage);
  g.art={cosmeticEquipped:{'hero:hunter':'tigerstripe-vanguard'}};g.updateUi=()=>{};
  const snapshot=()=>JSON.stringify(g.hero,(key,value)=>key==='synergy'?undefined:value);
  store.change(s=>{s.profiles.test.data['shop:state']='owned skin sentinel';});const before=snapshot();
  A.bind(g,store.adapter('presentation'));assert.equal(A.mode(g),'skin');assert(A.set(g,'evolution'));assert.equal(snapshot(),before);
  assert.equal(store.current().data['shop:state'],'owned skin sentinel');assert.equal(g.art.cosmeticEquipped['hero:hunter'],'tigerstripe-vanguard');
  g.hero.chooseClass('naga');assert.equal(A.mode(g),'skin');g.hero.chooseClass('hunter');
  store.switchTo('admin');A.bind(g,store.adapter('presentation'));assert.equal(A.mode(g),'skin');
  store.switchTo('test');A.bind(g,store.adapter('presentation'));assert.equal(A.mode(g),'evolution');
  const reloaded=new ns.systems.ProfileStore(storage);A.bind(g,reloaded.adapter('presentation'));assert.equal(A.mode(g),'evolution');
  reloaded.newRound();A.bind(g,reloaded.adapter('presentation'));assert.equal(A.mode(g),'skin');
});
test('bad preferences and failed writes safely retain the current appearance',()=>{
  const {ns}=load(),g=game(ns),A=ns.systems.HeroAppearanceSystem;g.art={};g.updateUi=()=>{};let message='';g.flash=text=>message=text;
  for(const raw of ['oops','null','[]','{"hunter":"invalid"}']){A.bind(g,{getItem:()=>raw});assert.equal(A.mode(g),'skin');}
  A.bind(g,{getItem:()=>'{"hunter":"evolution"}',setItem(){throw Error('full');}});
  assert.equal(A.set(g,'skin'),false);assert.equal(A.mode(g),'evolution');assert.match(message,/未儲存/);assert.equal(A.set(g,'unknown'),false);
});
test('all eleven heroes can choose an evolved sprite over a skin without mutating ownership',()=>{
  const {ns}=load();
  for(const type of Object.keys(ns.systems.HeroRoster.CLASSES)){
    const art=Object.create(ns.systems.ArtSystem.prototype);art.load=path=>({assetSrc:path,ready:true,width:1024,height:1536});art.drawGearPieces=()=>{};
    art.cosmeticEquipped={['hero:'+type]:'owned-skin'};const h=new ns.entities.Hero(0,0);h.chooseClass(type);
    const draw=type==='bull'?art.drawBullEvolution:art.drawHeroEvolutionSprite;
    for(const rank of [1,2]){h.evolution.rank=rank;art.heroAppearance={};assert.equal(draw.call(art,strictCanvas().ctx,h),false);
      art.heroAppearance={[type]:'evolution'};assert.equal(draw.call(art,strictCanvas().ctx,h),true);
      const image=type==='bull'?art.preloadBullEvolution(rank):art.preloadHeroEvolution(type,rank);image.ready=false;image.failed=true;
      assert.equal(draw.call(art,strictCanvas().ctx,h),false);image.ready=true;
      assert.equal(art.cosmeticEquipped['hero:'+type],'owned-skin');
    }h.evolution.rank=0;assert.equal(draw.call(art,strictCanvas().ctx,h),false);
  }
});
test('checking entry readiness no longer eagerly preloads evolution atlases',()=>{
  for(const path of ['src/td/systems/HeroEvolutionSpriteArt.js','src/td/systems/BullWargodArt.js']){
    const code=fs.readFileSync(path,'utf8'),status=code.match(/proto.coreStatus=function[\s\S]*?\n  };/)?.[0]||'';
    assert(!status.includes('preloadHeroEvolution'));assert(!status.includes('evolutionImage'));
  }
});
test('result review freezes simulation and rejects manual wave start without changing pause state',()=>{
  const {ns}=load(),g=game(ns);g.evolutionNotice={kind:'success'};g.paused=false;g.updateUi=()=>{};
  assert.doesNotThrow(()=>ns.TDGame.prototype.update.call(g,30,false));assert.equal(g.paused,false);
  assert.equal(ns.TDGame.prototype.startWave.call(g),false);
});
test('review and appearance modules ship in HTML and the offline shell',()=>{
  for(const file of ['HeroEvolutionReview','HeroAppearanceSystem'])for(const source of ['td.html','sw.js'])assert(fs.readFileSync(source,'utf8').includes('src/td/systems/'+file+'.js'));
});
test('portrait uses a separate hero, preserves purchased skins and tolerates renderer faults',()=>{
  const {ns}=load(),g=game(ns),c=strictCanvas(),canvas={width:360,height:300,getContext:()=>c.ctx};
  const image={ready:true};g.art={cosmeticEquipped:{'hero:hunter':'paid'},preloadHeroEvolution:()=>image,drawHero(ctx,hero){assert.notEqual(hero,g.hero);assert.equal(Object.keys(this.cosmeticEquipped).length,0);assert.equal(hero.evolution.rank,1);throw Error('preview fault');}};
  const original=g.hero.evolution.rank;assert.match(ns.systems.HeroEvolutionReview.portrait(g,canvas,1),/暫時/);assert.equal(c.depth,0);assert.equal(g.hero.evolution.rank,original);assert.equal(g.art.cosmeticEquipped['hero:hunter'],'paid');
});
