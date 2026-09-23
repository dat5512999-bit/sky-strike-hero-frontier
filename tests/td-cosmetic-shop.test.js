'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const schema=require('../src/td/shop/SkinSchema.js'),catalog=require('../src/td/shop/SkinCatalog.js');
const {SkinStore,MemorySkinAdapter}=require('../src/td/shop/SkinStore.js');
const clone=value=>JSON.parse(JSON.stringify(value));
const previewStore=async()=>new SkinStore(catalog,new MemorySkinAdapter()).init();

test('shop releases four hero skins and the kingdom colorway while holding unfinished effects',async()=>{
  assert.deepEqual(['astral-oath','solar-lion','crimson-fox','bone-emperor'].map(id=>catalog.find(s=>s.id===id)?.category),['hero','hero','hero','hero']);
  assert.equal(catalog.find(s=>s.id==='eclipse-court').targetId,'hunter');
  assert.equal(catalog.find(s=>s.id==='arcane-echo').availability.status,'locked');
  const store=await previewStore();for(const skin of catalog)assert.equal(store.status(skin.id),['astral-oath','solar-lion','crimson-fox','bone-emperor','thunder-king','eclipse-court'].includes(skin.id)?'available':'locked');
  assert.equal(catalog.find(s=>s.id==='bone-emperor').cover.src,'assets/td/shop/bone-chief-portrait-v1.png');
});
test('all referenced preview assets exist and cosmetic schema rejects gameplay fields',()=>{
  for(const skin of catalog){schema.validate(skin);for(const asset of [skin.cover,...Object.values(skin.slots)].filter(Boolean))assert.ok(fs.existsSync(path.join(__dirname,'..',asset.src)),asset.src);}
  const item=clone(catalog[0]);item.damage=999;assert.throws(()=>schema.validate(item));
  assert.throws(()=>schema.catalog([catalog[0],catalog[0]]));
});
test('generic mock store still handles purchase, equip and atomic failures when item is actually released',async()=>{
  const released=clone(catalog[0]);released.availability={status:'available',reason:''};
  const adapter=new MemorySkinAdapter(),store=await new SkinStore([released],adapter).init();
  await store.buy(released.id);assert.equal(store.snapshot().balance,5230-released.price.amount);
  await store.equip(released.id);assert.equal(store.status(released.id),'equipped');
  await assert.rejects(store.buy(released.id),/已擁有/);
  await store.unequip(released.id);assert.equal(store.status(released.id),'owned');
});
test('corrupt store state is rejected without overwriting adapter data',async()=>{
  const adapter=new MemorySkinAdapter();adapter.state.ownedSkins.push('missing');
  await assert.rejects(new SkinStore(catalog,adapter).init(),/存檔/);
  assert.deepEqual(adapter.state.ownedSkins,['missing']);
});
test('shop domain modules do not access battle logic or payment services',()=>{
  const dir=path.join(__dirname,'../src/td/shop');
  for(const file of fs.readdirSync(dir).filter(name=>name!=='main.js'))assert.doesNotMatch(fs.readFileSync(path.join(dir,file),'utf8'),/localStorage|sessionStorage|fetch\(|XMLHttpRequest|TDGame|ProfileStore|NavigationSystem|EconomySystem|eval\(/,file);
});
test('purchases and equipment persist by player profile and reject stale commits',async()=>{
  globalThis.TowerFrontier={systems:{}};
  require('../src/td/app/ProfileStore.js');
  const {ProfileSkinAdapter}=require('../src/td/app/ProfileSkinAdapter.js');
  const memory=new Map(),storage={getItem:key=>memory.get(key)??null,setItem:(key,value)=>memory.set(key,value)};
  const profiles=new globalThis.TowerFrontier.systems.ProfileStore(storage);
  const first=await new SkinStore(catalog,new ProfileSkinAdapter(profiles)).init();
  await first.buy('bone-emperor');await first.equip('bone-emperor');
  const reopened=await new SkinStore(catalog,new ProfileSkinAdapter(new globalThis.TowerFrontier.systems.ProfileStore(storage))).init();
  assert.equal(reopened.status('bone-emperor'),'equipped');assert.equal(reopened.snapshot().balance,8720);
  await reopened.buy('solar-lion');
  await assert.rejects(first.buy('solar-lion'),/另一個分頁|資料已更新/);
  assert.equal(first.snapshot().balance,8720);
  const latestProfiles=new globalThis.TowerFrontier.systems.ProfileStore(storage);latestProfiles.newRound();
  const fresh=await new SkinStore(catalog,new ProfileSkinAdapter(latestProfiles)).init();
  assert.equal(fresh.status('bone-emperor'),'available');assert.equal(fresh.snapshot().balance,10000);
  for(const id of ['astral-oath','solar-lion','crimson-fox','bone-emperor','eclipse-court']){await fresh.buy(id);await fresh.equip(id);}
  assert.equal(fresh.snapshot().balance,3200);
  assert.equal(Object.keys(fresh.snapshot().equippedSkins).length,5);
});
