'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const {rgba}=require('./png-pixels.cjs');
const {load}=require('./helpers/td-runtime.cjs');

const actionSheets=[
  ['starshield-patrol','assets/td/shop/starshield-patrol-actions-v1.png',4],
  ['tigerstripe-vanguard','assets/td/shop/tigerstripe-vanguard-actions-v1.png',4],
  ['neon-webrunner','assets/td/shop/neon-webrunner-actions-v1.png',4],
  ['night-owl-warden','assets/td/shop/night-owl-warden-actions-v1.png',4],
  ['north-rescue','assets/td/shop/north-rescue-actions-v1.png',4],
  ['abyss-response','assets/td/shop/abyss-response-actions-v1.png',4],
  ['steel-foreman','assets/td/shop/steel-foreman-actions-v1.png',5],
  ['special-maintenance','assets/td/shop/special-maintenance-actions-v1.png',4]
];

test('跨界造型兩季都是真實透明動作圖，且列格數與戰場渲染一致',()=>{
  const catalog=require('../src/td/shop/SkinCatalog.js');
  for(const [id,file,cells] of actionSheets){
    const skin=catalog.find(item=>item.id===id),sheet=rgba(file);
    assert.equal(skin.slots.battlefieldSprite.columns,cells,id);
    assert.equal(skin.slots.battlefieldSprite.rows,cells,id);
    assert.equal(sheet.width,sheet.height,id+' must be square');
    assert.equal(sheet.width/cells,sheet.height/cells,id+' must have equal cells');
    assert.equal(sheet.pixels[3],0,id+' needs transparent atlas padding');
    assert.ok(fs.statSync(file).size>1_500_000,id+' must not be a placeholder');
    assert.ok(fs.statSync(skin.cover.src).size>2_000_000,id+' requires shop portrait');
  }
});

test('第一季軍團英雄與第二季大酋長購買後替換戰場圖集，未裝備時仍保留既有渲染器',()=>{
  const {ns}=load(),draws=[],ctx=new Proxy({}, {get:(_,key)=>key==='drawImage'?(...args)=>draws.push(args):()=>{}});
  for(const [type,skinId,path] of [
    ['arcanist','starshield-patrol','assets/td/shop/starshield-patrol-actions-v1.png'],
    ['hunter','tigerstripe-vanguard','assets/td/shop/tigerstripe-vanguard-actions-v1.png'],
    ['rogue','neon-webrunner','assets/td/shop/neon-webrunner-actions-v1.png'],
    ['frostland','north-rescue','assets/td/shop/north-rescue-actions-v1.png'],
    ['naga','abyss-response','assets/td/shop/abyss-response-actions-v1.png'],
    ['goblin','special-maintenance','assets/td/shop/special-maintenance-actions-v1.png'],
    ['chief','night-owl-warden','assets/td/shop/night-owl-warden-actions-v1.png']
  ]){
    const atlas={ready:true,width:1600,height:1600,path};
    const art={cosmeticEquipped:{['hero:'+type]:skinId},load:source=>{assert.equal(source,path);return atlas;}};
    const hero={classType:type,x:120,y:90,state:'attack',frame:2,facing:0};
    assert.equal(ns.systems.ArtSystem.prototype.drawHero.call(art,ctx,hero),true,type);
    assert.equal(draws.at(-1)[0],atlas,type);
  }
  const source=fs.readFileSync('src/td/systems/CrossworldSkinArt.js','utf8');
  assert.match(source,/return previous\.call\(this,ctx,hero\)/,'base renderer must remain the fallback');
});

test('戰牛的鋼鐵工頭套用五乘五圖集且離線快取含所有兩季素材',()=>{
  const source=fs.readFileSync('src/td/systems/BullWargodArt.js','utf8'),cache=fs.readFileSync('sw.js','utf8'),html=fs.readFileSync('td.html','utf8');
  assert.match(source,/steel-foreman-actions-v1\.png/);assert.match(source,/atlas\.width\/5/);
  assert.match(html,/CrossworldSkinArt\.js/);
  for(const [,file] of actionSheets)assert.ok(cache.includes(file.slice(1)),file);
  for(const id of ['starshield-patrol','tigerstripe-vanguard','neon-webrunner','night-owl-warden','north-rescue','abyss-response','steel-foreman','special-maintenance'])assert.match(cache,new RegExp(id+'-portrait-v1\\.png'));
});
