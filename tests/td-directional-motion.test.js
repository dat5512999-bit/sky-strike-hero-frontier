'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const {rgba}=require('./png-pixels.cjs');

const root=path.resolve(__dirname,'..');
function load(){
  const context=vm.createContext({console});context.globalThis=context;
  for(const file of ['src/td/namespace.js','src/td/config.js','src/td/entities/Monster.js','src/td/systems/ArtSystem.js'])
    vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),context,{filename:file});
  return context.TowerFrontier;
}

test('步兵與巨獸上下方向圖的十六格都有透明邊界，武器與腳不會被裁掉',()=>{
  for(const name of ['enemy-grunt-directions-v1.png','enemy-brute-directions-v1.png']){
    const {width,height,pixels}=rgba(path.join(root,'assets/td',name));
    assert.equal(width,1254);assert.equal(height,1254);
    for(let row=0;row<4;row++)for(let col=0;col<4;col++){
      const x0=Math.round(col*width/4),x1=Math.round((col+1)*width/4),y0=Math.round(row*height/4),y1=Math.round((row+1)*height/4);
      let left=x1,top=y1,right=x0-1,bottom=y0-1;
      for(let y=y0;y<y1;y++)for(let x=x0;x<x1;x++)if(pixels[(y*width+x)*4+3]>8){left=Math.min(left,x);top=Math.min(top,y);right=Math.max(right,x);bottom=Math.max(bottom,y);}
      const label=`${name} row ${row} col ${col}`;
      assert.ok(right>=left&&bottom>=top,label+' must contain a pose');
      assert.ok(Math.min(left-x0,top-y0,x1-right-1,y1-bottom-1)>=10,label+' needs transparent padding on all sides');
    }
  }
});

test('上下行進及巨獸攻擊使用對應方向影格，腳底仍落在道路座標',()=>{
  const ns=load(),Art=ns.systems.ArtSystem,art=Object.create(Art.prototype),calls=[],ctx={drawImage(...args){calls.push(args);}};
  art.enemyDirections={grunt:{ready:true,width:1254,height:1254,assetSrc:Art.DIRECTIONAL_MONSTERS.grunt.path},brute:{ready:true,width:1254,height:1254,assetSrc:Art.DIRECTIONAL_MONSTERS.brute.path}};
  const down=new ns.entities.Monster('grunt',1,[{x:0,y:0},{x:0,y:1000}]);down.update(.1);
  assert.equal(art.drawDirectionalMonster(ctx,down,'grunt'),true);
  assert.equal(calls.at(-1)[2],0);
  const up=new ns.entities.Monster('grunt',1,[{x:0,y:0},{x:0,y:-1000}]);up.update(.1);
  art.drawDirectionalMonster(ctx,up,'grunt');assert.equal(calls.at(-1)[2],313.5);
  const brute=new ns.entities.Monster('brute',1,[{x:0,y:0},{x:0,y:1000}]);brute.visualHeading=Math.PI/2;brute.state='attack';brute.frame=2;
  art.drawDirectionalMonster(ctx,brute,'brute');assert.equal(calls.at(-1)[1],627);assert.equal(calls.at(-1)[2],627);
  const [,,,,sourceHeight,,drawY,,drawHeight]=calls.at(-1),spec=Art.DIRECTIONAL_MONSTERS.brute;
  assert.equal(sourceHeight,313.5);
  assert.ok(Math.abs(drawY+drawHeight*spec.feet[2]/sourceHeight)<.001);
  brute.visualHeading=0;assert.equal(art.drawDirectionalMonster(ctx,brute,'brute'),false);
});

test('緩速縮短視覺步距，走路影格不會因速度恢復而跳回',()=>{
  const ns=load(),route=[{x:0,y:0},{x:1000,y:0}],normal=new ns.entities.Monster('grunt',1,route),slowed=new ns.entities.Monster('grunt',1,route);
  slowed.applySlow(.25,1);normal.update(.6);slowed.update(.6);
  assert.ok(slowed.routeDistance<normal.routeDistance);
  assert.ok(slowed.walkPhase>slowed.walkDistance/64*8);
  assert.ok(slowed.walkPhase<normal.walkPhase,'slowed feet should step more slowly than normal movement instead of running in place');
  assert.equal(slowed.frame,Math.floor(slowed.walkPhase)%8);
  const previous=slowed.walkPhase;slowed.update(.5);
  assert.ok(slowed.walkPhase>previous);
  assert.ok(slowed.routeDistance>0);
});
