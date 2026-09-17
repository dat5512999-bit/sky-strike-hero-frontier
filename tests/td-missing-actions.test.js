'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),{rgba}=require('./png-pixels.cjs');

function art(){
  const c=vm.createContext({Image:class{}});c.globalThis=c;
  for(const f of ['namespace','config','systems/SpriteFrameBounds','systems/ArtSystem'])vm.runInContext(fs.readFileSync('src/td/'+f+'.js','utf8'),c);
  const A=c.TowerFrontier.systems.ArtSystem;return {A,a:new A()};
}

test('previously static units, support units, robots and ultimates have complete action sheets',()=>{
  const {A}=art(),types=['kingdomMage','alchemist','bountyHunter','pirate','blacksmith','timeMage','bomb','heavyBomb','dragon','royalCommander','soulsteel'];
  assert.deepEqual(Array.from(Object.keys(A.ACTION_PATHS)),types);
  const source=fs.readFileSync('src/td/systems/SpriteFrameBounds.js','utf8');
  for(const type of types){
    const file=A.ACTION_PATHS[type],image=rgba(file);
    assert.equal(image.pixels[3],0,file+' should keep a transparent background');
    if(!type.startsWith('dragon')&&!['royalCommander','soulsteel'].includes(type))assert.match(source,new RegExp(file.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')));
  }
});

test('combat and support states select four-row action animation',()=>{
  const {A,a}=art(),rows=[],original=A.drawFrame,ctx=new Proxy({}, {get(){return ()=>{};}});
  A.drawFrame=(context,image,column,row)=>rows.push([column,row]);
  try{
    const mage=a.actionImage('kingdomMage');mage.ready=true;mage.width=mage.height=1254;
    const unit={type:'kingdomMage',x:0,y:0,level:1,state:'attack',frame:3,frameClock:0,facing:0,config:()=>({color:'#fff'})};
    a.drawActionUnit(ctx,unit,mage);
    const smith=a.actionImage('blacksmith');smith.ready=true;smith.width=smith.height=1254;
    a.drawActionUnit(ctx,{...unit,type:'blacksmith',state:'idle',frame:0,frameClock:6,config:()=>({supportOnly:true,color:'#fff'})},smith);
    assert.deepEqual(rows,[[3,2],[1,2]]);
  }finally{A.drawFrame=original;}
});

test('bomb robot advances its arming animation before exploding',()=>{
  const {load,enemy}=require('./helpers/td-runtime.cjs'),{ns}=load(),owner={x:100,y:100,retired:false,equipment:{charm:0}},bomb=new ns.entities.Summon(owner,{form:'heavyBomb',damage:48,range:60,offsetX:0}),target=enemy(ns,120,100),shots=[];
  bomb.spawnTime=0;bomb.update(.2,[target],shots);
  assert.equal(bomb.state,'attack');assert.ok(bomb.frameClock>0);assert.equal(bomb.active,true);
  bomb.update(.5,[target],shots);assert.equal(bomb.active,false);assert.equal(shots.length,1);
});

test('dragon pixels stay inside their own cells so wings and breath are not clipped',()=>{
  const image=rgba('assets/td/ultimate-dragon-actions-v3.png'),cellW=image.width/4,cellH=image.height/4;
  for(let row=0;row<4;row++)for(let col=0;col<4;col++)for(let y=Math.floor(row*cellH);y<Math.floor((row+1)*cellH);y++)for(let x=Math.floor(col*cellW);x<Math.floor((col+1)*cellW);x++)if(image.pixels[(y*image.width+x)*4+3]>20){const edge=Math.min(x-col*cellW,(col+1)*cellW-x,y-row*cellH,(row+1)*cellH-y);assert.ok(edge>5,'frame '+row+','+col+' touches its clipping edge');}
});
