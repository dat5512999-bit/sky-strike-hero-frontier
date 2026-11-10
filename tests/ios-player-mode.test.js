'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const {load}=require('./helpers/td-runtime.cjs');
const {playerStore,playerApp}=require('../scripts/ios-player-mode.cjs');
function fixture(){const {ns,context}=load(),development=ns.systems.ProfileStore,values=new Map();const storage={getItem:k=>values.get(k)??null,setItem:(k,v)=>values.set(k,v)};vm.runInContext(playerStore(fs.readFileSync('src/td/app/ProfileStore.js','utf8')),context);return{ns,development,values,storage,Store:ns.systems.ProfileStore};}
test('iOS first launch creates only a normal player, no admin diamonds, and preserves developer data',()=>{
  const {Store,storage,values}=fixture();values.set('heroFrontierProfilesV1','developer data');const s=new Store(storage);
  assert.equal(s.isAdmin(),false);assert.equal(s.current().wallet.diamonds,0);assert.deepEqual(Object.keys(s.state.profiles),['test']);assert.equal(s.allows('heroes','arcanist'),false);assert.equal(s.allows('heroes','hunter'),true);assert.equal(values.get('heroFrontierProfilesV1'),'developer data');assert.equal(Store.KEY,'heroFrontierPlayerV1');assert.equal(Store.ADMIN_DIAMONDS,0);
});
test('iOS admin switching and test rounds are rejected at the data layer',()=>{
  const {Store,storage}=fixture(),s=new Store(storage),before=s.export();
  for(const action of [()=>s.switchTo('admin'),()=>s.newRound(),()=>s.restoreRound(1),()=>s.change(n=>{n.profiles.admin={kind:'admin'};n.active='admin';})])assert.throws(action);
  assert.equal(s.export(),before);assert.equal(new Store(storage).isAdmin(),false);
});
test('ordinary campaign rewards, wallet writes and backup restore remain usable',()=>{
  const {Store,storage}=fixture(),s=new Store(storage);s.complete({id:'mission-1',rewards:{heroes:['arcanist']},discovered:['lore']});assert.equal(s.allows('heroes','arcanist'),true);s.change(n=>{n.profiles.test.wallet.diamonds=15;});s.adapter('presentation').setItem('hero-appearance','{"hunter":"evolution"}');const saved=s.export();s.change(n=>{n.profiles.test.wallet.diamonds=0;});s.import(saved);const restored=new Store(storage);assert.equal(restored.current().wallet.diamonds,15);assert.equal(restored.adapter('presentation').getItem('hero-appearance'),'{"hunter":"evolution"}');assert(restored.current().completed.includes('mission-1'));assert.equal(storage.getItem(Store.KEY+'.beforeImport')!==null,true);
});
test('developer backups and malformed player imports leave existing progress and backup untouched',()=>{
  const {Store,development,storage}=fixture(),s=new Store(storage),dev=new development({getItem:()=>null,setItem(){}}),before=s.export();
  assert.throws(()=>s.import(dev.export()),/iOS 玩家存檔/);assert.equal(s.export(),before);assert.equal(storage.getItem(Store.KEY+'.beforeImport'),null);
  for(const edit of [p=>p.wallet.diamonds=-1,p=>p.wallet.gold=Infinity,p=>p.kind='admin',p=>p.unlocks.heroes=[{}]]){const data=JSON.parse(before);edit(data.profiles.test);assert.throws(()=>s.import(JSON.stringify(data)));assert.equal(s.export(),before);}
});
test('invalid on-device player save is preserved and never silently reset',()=>{
  const {Store,storage}=fixture();storage.setItem(Store.KEY,'{"edition":"unknown"}');assert.throws(()=>new Store(storage));assert.equal(storage.getItem(Store.KEY),'{"edition":"unknown"}');
});
test('iOS UI source compiles, replaces developer settings and blocks administrative actions',()=>{
  const source=playerApp(fs.readFileSync('src/td/app/FrontierApp.js','utf8'));new vm.Script(source);assert(!source.includes("b('admin','切換管理者')"));assert(!source.includes('href="update.html"'));assert(source.includes('匯出玩家備份'));assert(source.includes("['admin','test','new-round','confirm-round','restore']"));
  assert.throws(()=>playerApp('changed source format'),/來源格式/);
});
