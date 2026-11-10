'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const {load}=require('./helpers/td-runtime.cjs'),{strictCanvas}=require('./helpers/strict-canvas.cjs'),{inspect}=require('../scripts/inspect-evolution-atlas.cjs');
const IDS=['thunder-king','bone-emperor','night-owl-warden'];
test('three chief cosmetics use 48 complete transparent poses and the same measured rectangles for all four states',()=>{
  const {context}=load();for(const id of IDS){const {form,layouts}=context.FrontierChiefSkinAtlas[id],r=inspect(form.path,92);assert.equal(r.count,16,id);assert.deepEqual(r.errors,[]);assert.equal(r.outside,0);assert.deepEqual(JSON.parse(JSON.stringify(form.frames)),r.form.frames);assert.equal(layouts.motion.frames.length,8);assert.equal(layouts.attack.frames.length,4);assert.equal(layouts.cast.frames.length,4);}
});
test('all three equipped skins keep native progression and render each rank/state/frame/mirror with gear',()=>{
  const {ns,context}=load(),art=Object.create(ns.systems.ArtSystem.prototype);art.load=src=>{const spec=Object.values(context.FrontierChiefSkinAtlas).find(s=>s.form.path===src);return{assetSrc:src,ready:true,width:spec?.form.width||1254,height:spec?.form.height||1254};};let gear=0;art.drawGearPieces=()=>gear++;
  const h=new ns.entities.Hero(100,100);h.chooseClass('chief');h.equipment.spear=3;h.gear={weapon:'test'};
  for(const id of IDS)for(const rank of [0,1,2]){art.cosmeticEquipped={'hero:chief':id};h.evolution.rank=rank;const before=JSON.stringify([h.equipment,h.gear,h.evolution,h.combatConfig()]);
    for(const [state,row]of [['idle',0],['walk',1],['attack',2],['cast',3]])for(let frame=0;frame<4;frame++)for(const facing of [0,Math.PI]){Object.assign(h,{state,frame,facing});const c=strictCanvas();assert.equal(art.drawHero(c.ctx,h),true,id);assert.equal(c.depth,0);const d=c.calls.find(a=>a[0]==='drawImage'),form=context.FrontierChiefSkinAtlas[id].form;assert.equal(d[1].assetSrc,form.path);assert.deepEqual(d.slice(2,6),Array.from(form.frames[row*4+frame].slice(0,4)));}
    assert.equal(JSON.stringify([h.equipment,h.gear,h.evolution,h.combatConfig()]),before);
  }assert.equal(gear,288);
});
test('existing saved purchases retain IDs/prices, equipped state and never need to be repurchased',async()=>{
  const {ns,context}=load(),mem=new Map(),storage={getItem:k=>mem.get(k)??null,setItem:(k,v)=>mem.set(k,v)},p=new ns.systems.ProfileStore(storage);p.switchTo('admin');
  p.change(s=>{s.profiles.admin.data['shop:state']=JSON.stringify({version:1,revision:2,balance:500,ownedSkins:IDS,equippedSkins:{'hero:chief':'night-owl-warden'}});});
  const Store=context.FrontierShop.SkinStore,Adapter=context.FrontierShop.ProfileSkinAdapter,catalog=context.FrontierShop.catalog,shop=await new Store(catalog,new Adapter(p)).init();
  for(const id of IDS){assert.equal(catalog.find(s=>s.id===id).price.amount,id==='night-owl-warden'?1680:1280);await assert.rejects(shop.buy(id),/已擁有/);await shop.equip(id);assert.equal(shop.status(id),'equipped');}
  const again=await new Store(catalog,new Adapter(new ns.systems.ProfileStore(storage))).init();assert.equal(again.status('night-owl-warden'),'equipped');assert.deepEqual(Array.from(again.snapshot().ownedSkins).sort(),IDS.slice().sort());
});
test('old skin files remain recoverable but are omitted from both website and iOS source plan',()=>{
  const p=require('../scripts/build-static-site.cjs').plan(),files=p.files.map(f=>f.path),{context}=load();for(const id of IDS)assert(files.includes(context.FrontierChiefSkinAtlas[id].form.path));for(const f of ['bone-chief-motion-v1.png','bone-chief-portrait-v1.png','thunder-chief-portrait-v1.png','thunder-chief-motion-v3.png','night-owl-warden-actions-v1.png']){assert(fs.existsSync('assets/td/shop/'+f));assert(!files.includes('assets/td/shop/'+f));}
});
