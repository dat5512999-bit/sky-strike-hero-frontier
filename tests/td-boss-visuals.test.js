'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {load}=require('./helpers/td-runtime.cjs');
test('第 50 波採原概念魚人王圖集；不動娜迦英雄素材',()=>{
  const {ns}=load(),e=ns.systems.BossVisualCatalog.get('nagaSiltwaterDemonlord',50);
  assert.equal(e.path,'assets/td/bosses/demonlord-actions-v2.png');assert.equal(e.original,false);assert.equal(e.height,116);
  const source=fs.readFileSync(path.resolve(__dirname,'../assets/td/naga/tidebreaker-hero-actions-v1.png'));
  assert.equal(require('node:crypto').createHash('sha256').update(source).digest('hex'),'c0a2e3ec1fa0873eb7afdb2a7aa4a464df5610f88d2fb6b12a03a044c4147c03');
});
test('十個固定首領都有唯一外觀與名稱，素材存在且保持舊首領類型',()=>{
  const {ns}=load(),entries=ns.systems.BossVisualCatalog.entries;
  assert.equal(entries.length,10);assert.equal(new Set(entries.map(e=>e.path)).size,10);
  assert.equal(new Set(entries.map(e=>e.name)).size,10);
  entries.forEach((e,i)=>{assert.equal(e.wave,(i+1)*5);assert.equal(e.type,i===9?'nagaSiltwaterDemonlord':'boss');assert.ok(fs.existsSync(path.resolve(__dirname,'..',e.path)));});
});
test('實際出兵流程帶入外觀，不改生命、傷害、速度、碰撞與賞金',()=>{
  const {ns}=load();
  for(const mode of Object.values(ns.systems.TDDifficultySystem.MODES))for(const e of ns.systems.BossVisualCatalog.entries){
    const waves=new ns.systems.WaveSystem();waves.setModifiers(mode);waves.wave=e.wave-1;waves.start();const monsters=[];waves.update(.2,monsters);
    const boss=monsters[0],original=new ns.entities.Monster(e.type,e.wave,ns.config.path,Object.assign({},mode,{bountyScale:boss.modifiers.bountyScale}));
    assert.equal(boss.bossVisualId,e.id);assert.equal(boss.name,e.name);
    for(const key of ['health','maxHealth','armor','speed','radius','reward','attackDamage','attackRange','baseDamage','bossAspect'])assert.equal(boss[key],original[key],e.id+' '+key);
  }
});
test('普通怪、非里程碑、進化試煉及練習對象不套用波次外觀',()=>{
  const {ns}=load(),catalog=ns.systems.BossVisualCatalog;
  for(const m of [new ns.entities.Monster('grunt',5),new ns.entities.Monster('boss',6),Object.assign(new ns.entities.Monster('boss',20),{evolutionTrial:true}),Object.assign(new ns.entities.Monster('boss',50),{evolutionTraining:true})]){
    const name=m.name;catalog.apply(m);assert.equal(m.bossVisualId,undefined);assert.equal(m.name,name);
  }
  catalog.enabled=false;const old=new ns.entities.Monster('boss',5);catalog.apply(old);assert.equal(old.bossVisualId,undefined);assert.equal(catalog.get('boss',5),null);
  catalog.enabled=true;catalog.apply(old);assert.equal(old.bossVisualId,'frontline');
});
test('九套新圖集皆有十六格有效裁切與固定顯示高度',()=>{
  const {ns}=load();for(const e of ns.systems.BossVisualCatalog.entries.filter(e=>!e.original)){
    const b=ns.systems.BossSpriteBounds[e.id],png=fs.readFileSync(path.resolve(__dirname,'..',e.path));
    assert.equal(b.width,png.readUInt32BE(16));assert.equal(b.height,png.readUInt32BE(20));assert.equal(b.frames.length,16);assert.ok(b.visible>0);
    b.frames.forEach(f=>{assert.equal(f.length,6);assert.ok(f.every(Number.isFinite));assert.ok(f[0]>=0&&f[1]>=0&&f[2]>0&&f[3]>0&&f[0]+f[2]<=b.width&&f[1]+f[3]<=b.height);});
  }
});
test('動作列正確，受擊不錯播攻擊；走路八步循環不切入攻擊或死亡',()=>{
  const {ns}=load(),frame=ns.systems.BossVisualCatalog.frame;
  for(const [state,start] of [['idle',0],['hit',0],['walk',4],['attack',8],['cast',8],['death',12]])for(let f=0;f<8;f++)assert.equal(frame({state,frame:f}),start+f%4);
});
test('首領圖片延遲載入且快取共用；失敗圖片納入原有重試清單',()=>{
  const {ns}=load(),art=Object.create(ns.systems.ArtSystem.prototype);let loads=0;
  art.enemyActions={boss:{ready:true},nagaSiltwaterDemonlord:{ready:true}};art.load=src=>{loads++;return {assetSrc:src,failed:true};};
  const e=ns.systems.BossVisualCatalog.get('boss',10),first=art.bossImage(e);
  assert.equal(loads,1);assert.equal(art.bossImage(e),first);assert.equal(loads,1);assert.equal(art.enemyActions['boss:bulwark'],first);
  assert.equal(art.bossImage(ns.systems.BossVisualCatalog.get('boss',30)),art.enemyActions.boss);
});
test('新首領可畫左右方向與所有動作；載入失敗仍畫舊首領',()=>{
  const {ns}=load(),art=Object.create(ns.systems.ArtSystem.prototype),calls=[];let depth=0;
  const ctx=new Proxy({save(){depth++;},restore(){assert.ok(depth>0);depth--;},drawImage(...args){calls.push(args);}},{get(o,k){return k in o?o[k]:()=>{};},set(o,k,v){o[k]=v;return true;}});
  const old={ready:true,width:1254,height:1254,assetSrc:'assets/td/enemy-boss-actions-v1.png'};art.enemyActions={boss:old,nagaSiltwaterDemonlord:old};
  for(const e of ns.systems.BossVisualCatalog.entries.filter(e=>!e.original)){
    const image=art.enemyActions['boss:'+e.id]={ready:true,width:1254,height:1254,assetSrc:e.path},m=ns.systems.BossVisualCatalog.apply(new ns.entities.Monster(e.type,e.wave));
    for(const state of ['idle','hit','walk','attack','cast','death'])for(const facing of [0,Math.PI])for(let f=0;f<4;f++){
      Object.assign(m,{state,facing,frame:f});assert.equal(art.drawMonster(ctx,m),true);assert.equal(calls.at(-1)[0],image);assert.ok(calls.at(-1).slice(1).every(Number.isFinite));assert.equal(depth,0);
    }
    image.ready=false;image.failed=true;assert.equal(art.drawMonster(ctx,m),true);assert.equal(calls.at(-1)[0],old);
  }
});
