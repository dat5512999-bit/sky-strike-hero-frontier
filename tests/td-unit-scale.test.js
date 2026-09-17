'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),{load}=require('./helpers/td-runtime.cjs');
test('所有士兵與怪物都有集中比例設定，普通兵、英雄與首領層級清楚',()=>{
 const {ns}=load(),A=ns.systems.ArtSystem;
 for(const type of Object.keys(ns.config.units))assert.ok(A.UNIT_HEIGHTS[type]>0,type);
 assert.equal(A.UNIT_HEIGHTS.hunter,60);assert.ok(A.UNIT_HEIGHTS.kingdomMage/60<1.1);
 assert.ok(A.MONSTER_HEIGHTS.boss>78);assert.equal(A.UNIT_HEIGHTS.orc,A.MONSTER_HEIGHTS.raider);
 for(const metric of Object.values(A.SPRITE_METRICS)){assert.ok(metric.visible>0&&metric.visible<=1);assert.ok(metric.foot>0&&metric.foot<=1);}
});
test('不同透明留白素材換算後的可見高度一致，缺少量測資料仍可繪製',()=>{
 const {ns}=load(),A=ns.systems.ArtSystem;
 for(const [assetSrc,m] of Object.entries(A.SPRITE_METRICS)){const p=A.size({assetSrc},60,.8);assert.ok(Math.abs(p.height*m.visible-60)<1e-8);assert.equal(p.foot,m.foot);}
 assert.equal(A.size({},60,.8).height,60);
});
test('士兵動畫與升級不改變顯示比例，腳底定位不修改遊戲座標',()=>{
 const {ns}=load(),A=ns.systems.ArtSystem,a=Object.create(A.prototype),draws=[];
 a.combatUnits={hunter:{ready:true,width:1254,height:1254,assetSrc:'assets/td/ranger-actions-v1.png'}};
 a.drawGearPieces=()=>{};a.drawRank=()=>{};
 const ctx=new Proxy({drawImage(...v){draws.push(v);}},{get:(o,k)=>o[k]||(()=>{})}),u=new ns.entities.CombatUnit('hunter',100,200);
 for(const state of ['idle','walk','attack','hit'])for(let frame=0;frame<4;frame++)for(const level of [1,5]){Object.assign(u,{state,frame,level});a.drawCombatUnit(ctx,u);}
 assert.equal(new Set(draws.map(v=>(v[8]/v[4]).toFixed(8))).size,1);assert.equal(u.x,100);assert.equal(u.y,200);
});

test('放大士兵仍固定腳底，並在繪製後還原座標變換',()=>{
 const {ns}=load(),A=ns.systems.ArtSystem,a=Object.create(A.prototype),unit={x:100,y:200};
 let scale=1,tx=0,ty=0,saved;
 const ctx={save(){saved=[scale,tx,ty];},translate(x,y){tx+=x*scale;ty+=y*scale;},scale(x){scale*=x;},restore(){[scale,tx,ty]=saved;}};
 a.drawCombatUnitSprite=()=>{assert.equal(scale,1.12);assert.ok(Math.abs(unit.x*scale+tx-unit.x)<1e-8);assert.ok(Math.abs((unit.y+12)*scale+ty-unit.y-12)<1e-8);return true;};
 assert.equal(a.drawCombatUnit(ctx,unit),true);assert.equal(scale,1);assert.equal(tx,0);assert.equal(ty,0);
});
