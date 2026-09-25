'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const {load}=require('./helpers/td-runtime.cjs');
const plain=v=>JSON.parse(JSON.stringify(v));
test('thunder purchases preserve old cosmetics and remain isolated to the active profile',async()=>{
  const {ns,context}=load(),shop=context.FrontierShop,mem=new Map(),storage={getItem:k=>mem.get(k)??null,setItem:(k,v)=>mem.set(k,v)};
  const profiles=new ns.systems.ProfileStore(storage);
  profiles.change(s=>{s.profiles.admin.data['shop:state']=JSON.stringify({version:1,revision:8,balance:2000,ownedSkins:['bone-emperor','astral-oath','eclipse-court'],equippedSkins:{'hero:chief':'bone-emperor','hero:arcanist':'astral-oath','faction:hunter':'eclipse-court'}});});
  profiles.switchTo('admin');
  const store=await new shop.SkinStore(shop.catalog,new shop.ProfileSkinAdapter(profiles)).init();
  await store.buy('thunder-king');await store.equip('thunder-king');await assert.rejects(store.buy('thunder-king'),/已擁有/);
  const reloaded=new ns.systems.ProfileStore(storage),again=await new shop.SkinStore(shop.catalog,new shop.ProfileSkinAdapter(reloaded)).init();
  assert.equal(again.snapshot().balance,720);assert.equal(again.status('thunder-king'),'equipped');
  assert.deepEqual(plain(again.snapshot().equippedSkins),{'hero:chief':'thunder-king','hero:arcanist':'astral-oath','faction:hunter':'eclipse-court'});
  assert.equal(again.status('bone-emperor'),'owned');
  const before=reloaded.export();reloaded.newRound();
  await assert.rejects(again.equip('bone-emperor'),/玩家檔案已切換/);
  const other=await new shop.SkinStore(shop.catalog,new shop.ProfileSkinAdapter(reloaded)).init();
  assert.equal(other.status('thunder-king'),'available');
  reloaded.switchTo('admin');assert.deepEqual(plain(reloaded.current()),JSON.parse(before).profiles.admin);
});
test('thunder and bone render independently across all frames and missing assets fall back',()=>{
  const seen=[],unavailable=new Set();
  class ArtSystem{
    load(src){return {assetSrc:src,ready:!unavailable.has(src),width:src.includes('motion')?1773:1254,height:1254};}
    drawHero(){return 'original';}drawCombatUnitSprite(){}drawBuilding(){}
  }
  ArtSystem.SPRITE_METRICS={};class TDGame{updateOpeningPresentation(){}}
  const ctx=vm.createContext({TowerFrontier:{systems:{ArtSystem,SpriteFrameBounds:{},FactionSystem:{FACTIONS:{hunter:{units:[],buildings:[]}}}},TDGame}});
  for(const f of ['src/td/shop/ThunderKing.js','src/td/skin-lab/ChiefPreview.js','src/td/systems/CosmeticArt.js'])vm.runInContext(fs.readFileSync(f,'utf8'),ctx);
  const art=new ArtSystem(),paint={save(){},restore(){},translate(){},scale(){},drawImage(image){seen.push(image.assetSrc);}};
  for(const skin of ['bone-emperor','thunder-king','bone-emperor','thunder-king']){
    art.cosmeticEquipped={'hero:chief':skin};
    for(const state of ['idle','walk','attack','cast'])for(let frame=0;frame<4;frame++){
      const hero=Object.freeze({classType:'chief',state,frame,facing:Math.PI,x:150,y:220,health:100,damage:24});
      assert.equal(art.drawHero(paint,hero),true);
      assert.match(seen.at(-1),new RegExp((skin==='thunder-king'?'thunder':'bone')+'-chief-'+(['idle','walk'].includes(state)?'motion':state)));
      assert.equal(hero.damage,24);assert.equal(hero.health,100);
    }
  }
  unavailable.add(ctx.FrontierShop.thunderKing.look.cast);
  const broken=new ArtSystem();broken.cosmeticEquipped={'hero:chief':'thunder-king'};
  assert.equal(broken.drawHero(paint,{classType:'chief'}),'original');
  art.cosmeticEquipped={};assert.equal(art.drawHero(paint,{classType:'chief'}),'original');
});
test('td is the only shop page and preloads thunder before the catalog',()=>{
  assert.equal(fs.existsSync('shop.html'),false);assert.equal(fs.existsSync('src/td/shop/main.js'),false);
  for(const file of ['td.html','skin-lab.html']){
    const html=fs.readFileSync(file,'utf8');assert.ok(html.indexOf('shop/ThunderKing.js')<html.indexOf('shop/SkinCatalog.js'));
  }
  const sw=fs.readFileSync('sw.js','utf8');assert.ok(!sw.includes("'./shop.html'"));assert.ok(!sw.includes("'./src/td/shop/main.js'"));
  for(const name of ['motion','attack','cast'])assert.ok(sw.includes('thunder-chief-'+name+'-v3.png'));
  assert.match(fs.readFileSync('skin-lab.html','utf8'),/href="td.html\?panel=shop"/);
});
