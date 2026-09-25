'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs');
const {rgba}=require('./png-pixels.cjs');
const {load}=require('./helpers/td-runtime.cjs');

const atlases=[
  ['assets/td/combat-art/eclipse-units-a-actions-v2.png',4,4],
  ['assets/td/combat-art/eclipse-units-b-actions-v2.png',3,4],
  ['assets/td/goblin/hero-actions-v2.png',4,4],
  ['assets/td/goblin/soldier-actions-v2.png',4,5]
];

test('new action atlases have independent transparent 320px cells',()=>{
  const cache=fs.readFileSync('sw.js','utf8');
  for(const [file,columns,rows] of atlases){
    assert.ok(cache.includes('./'+file),`${file} is missing from offline cache list`);
    const {width,height,pixels}=rgba(file);
    assert.equal(width,columns*320,file);assert.equal(height,rows*320,file);
    for(let row=0;row<rows;row++)for(let column=0;column<columns;column++){
      let filled=0;
      for(let y=0;y<320;y++)for(let x=0;x<320;x++){
        const alpha=pixels[((row*320+y)*width+column*320+x)*4+3];
        if(alpha>80)filled++;
        if(x<8||x>=312||y<8||y>=312)assert.equal(alpha,0,`${file} cell ${column},${row} touches edge`);
      }
      assert.ok(filled>1000,`${file} cell ${column},${row} is empty`);
    }
  }
});

test('Eclipse Court plays distinct idle, walk and attack rows for every soldier',()=>{
  const {ns}=load(),art=Object.create(ns.systems.ArtSystem.prototype),calls=[];
  art.cosmeticFaction='eclipse-court';
  art.load=src=>({assetSrc:src,ready:true,width:src.includes('units-b')?960:1280,height:1280});
  art.drawGearPieces=()=>{};art.drawRank=()=>{};
  const ctx=new Proxy({}, {get:(_,key)=>key==='drawImage'?(...args)=>calls.push(args):()=>{}});
  for(const [type,expectedColumn] of Object.entries({hunter:0,shield:1,musketeer:2,knight:3,kingdomMage:0,alchemist:1,royalCommander:2})){
    const unit={type,x:100,y:100,level:1,facing:0,state:'idle',frameClock:0};
    for(const [state,clock,row] of [['idle',0,0],['idle',2,1],['walk',0,1],['walk',1,2],['attack',0,3]]){
      unit.state=state;unit.frameClock=clock;
      assert.equal(art.drawCombatUnitSprite(ctx,unit),true,type+' '+state);
      const imageCall=calls.at(-1);
      assert.ok(imageCall[0].assetSrc.includes('eclipse-units-'));
      assert.equal(imageCall[1],expectedColumn*320);
      assert.equal(imageCall[2],row*320);
      assert.equal(imageCall[3],320);assert.equal(imageCall[4],320);
    }
  }
});

test('goblin hero and five soldiers load corrected atlas and hero is slightly smaller',()=>{
  const {ns}=load(),art=Object.create(ns.systems.ArtSystem.prototype),calls=[];
  art.load=src=>({assetSrc:src,ready:true,width:1280,height:src.includes('soldier-actions')?1600:1280,addEventListener(){}});
  const ctx=new Proxy({}, {get:(_,key)=>key==='drawImage'?(...args)=>calls.push(args):()=>{}});
  const hero={classType:'goblin',state:'cast',frame:2,x:100,y:100,facing:0,equipment:{spear:0}};
  assert.equal(art.drawHero(ctx,hero),true);
  assert.equal(calls.at(-1)[0].assetSrc,'assets/td/goblin/hero-actions-v2.png');
  assert.equal(calls.at(-1)[2],960);assert.equal(calls.at(-1)[8],94);
  for(const [index,type] of ['goblinEngineer','goblinGunner','goblinRiveter','goblinRecycler','goblinMech'].entries()){
    const unit={type,x:100,y:100,state:'idle',facing:0,frameClock:0};
    assert.equal(art.drawCombatUnit(ctx,unit),true);
    const call=calls.at(-1);
    assert.equal(call[0].assetSrc,'assets/td/goblin/soldier-actions-v2.png');
    assert.equal(call[2],index*320);
  }
});
