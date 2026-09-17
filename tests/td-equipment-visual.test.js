'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),{load}=require('./helpers/td-runtime.cjs');
test('所有士兵裝備不再將完整圖示疊到角色身上，英雄仍保留原繪製',()=>{
 const {ns}=load(),art=Object.create(ns.systems.ArtSystem.prototype);let draws=0;
 art.equipmentAtlas={ready:true,width:300,height:300};
 const ctx=new Proxy({drawImage(){draws++;}},{get:(o,k)=>o[k]||(()=>{})});
 for(const type of Object.keys(ns.config.units))for(const id of Object.keys(ns.systems.ArmorySystem.ITEMS||{}))art.drawGearPieces(ctx,{kind:'unit',type,gear:{weapon:id}},false);
 for(const id of ['lion-shield','dragon-heart','moon-staff','vine-crown','wolf-saddle'])art.drawGearPieces(ctx,{kind:'unit',gear:{armor:id}},true);
 assert.equal(draws,0);
 art.drawGearPieces(ctx,{gear:{weapon:'moon-staff'}},false);assert.equal(draws,1);
});
test('裝備標記在腳下等級旁，無裝備或退場士兵不顯示且不改戰鬥資料',()=>{
 const {ns}=load(),art=Object.create(ns.systems.ArtSystem.prototype),points=[];let fills=0,saves=0;
 const ctx=new Proxy({save(){saves++;},restore(){saves--;},moveTo(x,y){points.push([x,y]);},lineTo(x,y){points.push([x,y]);},fill(){fills++;}},{get:(o,k)=>o[k]||(()=>{})});
 const unit=new ns.entities.CombatUnit('dragon',100,200);unit.gear={relic:'dragon-heart'};const before=JSON.stringify(unit);
 art.drawSoldierEquipmentBadge(ctx,unit);assert.equal(fills,1);assert.equal(saves,0);assert.ok(points.every(([x,y])=>x>=138&&y>=225));assert.equal(JSON.stringify(unit),before);
 art.drawSoldierEquipmentBadge(ctx,{x:0,y:0,gear:{}});art.drawSoldierEquipmentBadge(ctx,{active:false,gear:unit.gear});assert.equal(fills,1);
});
