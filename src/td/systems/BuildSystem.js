(function(ns){
  'use strict';
  function pointSegmentDistance(px,py,a,b){const dx=b.x-a.x,dy=b.y-a.y;const length=dx*dx+dy*dy;if(!length)return Math.hypot(px-a.x,py-a.y);const t=Math.max(0,Math.min(1,((px-a.x)*dx+(py-a.y)*dy)/length));return Math.hypot(px-(a.x+t*dx),py-(a.y+t*dy));}
  function pointInPolygon(x,y,polygon){let inside=false;for(let i=0,j=polygon.length-1;i<polygon.length;j=i++){const a=polygon[i],b=polygon[j],cross=(a.y>y)!==(b.y>y)&&x<(b.x-a.x)*(y-a.y)/(b.y-a.y)+a.x;if(cross)inside=!inside;}return inside;}
  function canAfford(economy,cost){return typeof economy.canAfford==='function'?economy.canAfford(cost):economy.gold>=(cost.gold||0)&&economy.lumber>=(cost.wood||0)&&economy.merit>=(cost.merit||0);}
  function spend(economy,cost){if(typeof economy.spend==='function')return economy.spend(cost);if(!canAfford(economy,cost))return false;economy.gold-=cost.gold||0;economy.lumber-=cost.wood||0;economy.merit-=cost.merit||0;return true;}
  function refund(economy,gold){if(typeof economy.refundGold==='function')return economy.refundGold(gold);economy.gold+=gold;return gold;}
  class BuildSystem{
    constructor(){this.reset();}
    reset(){this.items=[];this.selected=null;this.pending=null;this.placement=null;this.nextUnitId=1;this.pointer={x:360,y:360,valid:false};}
    queue(type,kind){kind=kind||'unit';const catalog=kind==='building'?ns.config.buildings:ns.config.units;if(!catalog[type])return false;this.pending={type:type,kind:kind};this.placement=null;this.pointer.valid=false;this.selected=null;return true;}
    queueMercenary(type){if(!this.queue(type,'unit'))return false;this.pending.mercenary=true;return true;}
    pendingCost(){if(!this.pending)return null;const p=this.pending,cfg=(p.kind==='building'?ns.config.buildings:ns.config.units)[p.type];return{gold:p.mercenary?Math.ceil(cfg.cost*1.5):cfg.cost,wood:p.mercenary?0:cfg.wood};}
    cancel(){this.pending=null;this.placement=null;}
    placementIssue(x,y,kind,ignored){kind=kind||'building';if(x<42||x>ns.config.width-42||y<62||y>ns.config.height-46)return 'boundary';if((kind==='building'||ns.config.roadUnits)&&ns.config.path.some(function(point,index,path){return index&&pointSegmentDistance(x,y,path[index-1],point)<(ns.config.roadClearance||55);}))return 'road';if(ns.config.buildAreas&&!ns.config.buildAreas.some(area=>pointInPolygon(x,y,area)))return 'terrain';return this.items.some(function(item){return item!==ignored&&ns.utils.distance(item,{x:x,y:y})<(kind==='building'||item.kind==='building'?58:34);})?'occupied':null;}
    canPlaceAt(x,y,kind){return this.placementIssue(x,y,kind)===null;}
    placementMessage(x,y,kind){return {boundary:'地圖邊界不可部署',terrain:'森林、山壁與水域不可部署，請移到草地',road:'道路禁建，請移到路旁',occupied:'太靠近既有單位，請留出空間'}[this.placementIssue(x,y,kind)]||'位置可用 · 點擊部署';}
    updatePointer(x,y){this.pointer={x:x,y:y,valid:this.pending?this.canPlaceAt(x,y,this.pending.kind):false};}
    stagePlacement(x,y){if(!this.pending)return false;this.updatePointer(x,y);this.placement={x:x,y:y,valid:this.pointer.valid};return this.placement.valid;}
    canConfirm(economy){return Boolean(this.pending&&this.placement&&this.canPlaceAt(this.placement.x,this.placement.y,this.pending.kind)&&canAfford(economy,this.pendingCost()));}
    confirmPlacement(economy){if(!this.canConfirm(economy))return false;return this.placeQueued(this.placement.x,this.placement.y,economy);}
    selectAt(x,y){const hit=this.items.slice().reverse().find(function(item){return item.active!==false&&ns.utils.distance(item,{x:x,y:y})<=(item.kind==='building'?34:27);})||null;if(hit)this.selected=hit;return hit;}
    placeQueued(x,y,economy){const pending=this.pending;if(!pending)return false;const catalog=pending.kind==='building'?ns.config.buildings:ns.config.units;const cfg=catalog[pending.type];const cost=this.pendingCost();if(!cfg||!this.canPlaceAt(x,y,pending.kind)||!canAfford(economy,cost)||!spend(economy,cost))return false;const item=pending.kind==='building'?new ns.entities.Building(pending.type,x,y):new ns.entities.CombatUnit(pending.type,x,y);if(item.kind==='unit')item.unitId=this.nextUnitId++;item.mercenary=Boolean(pending.mercenary);item.totalSpent=cost.gold;this.items.push(item);this.selected=item;this.pending=null;this.placement=null;this.applyTowerSupport();return true;}
    upgrade(economy){if(!this.selected||this.selected.active===false)return false;const cost=this.selected.upgradeCost();if(!cost||!spend(economy,cost))return false;this.selected.upgrade();this.applyTowerSupport();return true;}
    sell(economy){if(!this.selected||this.selected.active===false)return false;const removed=this.selected;removed.retired=true;refund(economy,removed.sellValue());if(typeof this.onRemove==='function')this.onRemove(removed);this.items=this.items.filter(function(item){return item!==removed;});this.selected=null;this.applyTowerSupport();return true;}
    towers(){return this.items.slice();}
    combatUnits(){return this.items.filter(function(item){return item.kind==='unit'&&item.active;});}
    buildings(){return this.items.filter(function(item){return item.kind==='building';});}
    applyTowerSupport(){
      const supports=[];
      this.buildings().forEach(function(tower){if(tower.retired)return;const cfg=tower.config();if(cfg.allyHaste>0)supports.push({x:tower.x,y:tower.y,haste:cfg.allyHaste,radiusSquared:cfg.allyHasteRadius*cfg.allyHasteRadius});});
      this.items.forEach(function(unit){if(unit.kind!=='unit')return;unit.supportHaste=0;if(!unit.active)return;supports.forEach(function(source){const dx=unit.x-source.x,dy=unit.y-source.y;if(dx*dx+dy*dy<=source.radiusSquared)unit.supportHaste=Math.max(unit.supportHaste,source.haste);});});
    }
    draw(ctx,art){this.items.slice().sort(function(a,b){return a.y-b.y;}).forEach(function(item){item.draw(ctx,item===this.selected,art);},this);if(this.pending){const catalog=this.pending.kind==='building'?ns.config.buildings:ns.config.units;const cfg=catalog[this.pending.type],point=this.pointer,valid=this.canPlaceAt(point.x,point.y,this.pending.kind);ctx.save();ctx.globalAlpha=valid?.13:.16;ctx.fillStyle=valid?'#65efb2':'#ff5c5c';ctx.beginPath();ctx.arc(point.x,point.y,cfg.range,0,Math.PI*2);ctx.fill();ctx.globalAlpha=.8;ctx.strokeStyle=valid?'#65efb2':'#ff5c5c';ctx.lineWidth=2;ctx.beginPath();ctx.arc(point.x,point.y,cfg.range,0,Math.PI*2);ctx.stroke();ctx.setLineDash([5,4]);ctx.beginPath();ctx.ellipse(point.x,point.y+10,this.pending.kind==='building'?32:23,13,0,0,Math.PI*2);ctx.stroke();ctx.setLineDash([]);ctx.globalAlpha=valid?.65:.36;let painted=false;if(art){if(this.pending.kind==='building')painted=art.drawBuilding(ctx,this.pending.type,point.x,point.y,1,null);else painted=art.drawCombatUnit(ctx,{type:this.pending.type,x:point.x,y:point.y,level:1,state:'idle',frame:0,frameClock:0,facing:-Math.PI/2,gear:{},config:function(){return cfg;}});}if(!painted){ctx.fillStyle=cfg.color;ctx.beginPath();ctx.arc(point.x,point.y-15,this.pending.kind==='building'?24:14,0,Math.PI*2);ctx.fill();}ctx.restore();}}
  }
  ns.systems.BuildSystem=BuildSystem;
})(globalThis.TowerFrontier);
