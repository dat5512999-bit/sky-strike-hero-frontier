(function(ns){
  'use strict';
  function pointSegmentDistance(px,py,a,b){const dx=b.x-a.x,dy=b.y-a.y;const length=dx*dx+dy*dy;if(!length)return Math.hypot(px-a.x,py-a.y);const t=Math.max(0,Math.min(1,((px-a.x)*dx+(py-a.y)*dy)/length));return Math.hypot(px-(a.x+t*dx),py-(a.y+t*dy));}
  class BuildSystem{
    constructor(){this.reset();}
    reset(){this.items=[];this.selected=null;this.pending=null;this.pointer={x:360,y:360,valid:false};}
    queue(type,kind){kind=kind||'unit';const catalog=kind==='building'?ns.config.buildings:ns.config.units;if(!catalog[type])return false;this.pending={type:type,kind:kind};this.selected=null;return true;}
    cancel(){this.pending=null;}
    canPlaceAt(x,y,kind){kind=kind||'building';if(x<42||x>678||y<62||y>674)return false;if(kind==='building'&&ns.config.path.some(function(point,index,path){return index&&pointSegmentDistance(x,y,path[index-1],point)<55;}))return false;return !this.items.some(function(item){return ns.utils.distance(item,{x:x,y:y})<(kind==='building'||item.kind==='building'?58:34);});}
    updatePointer(x,y){this.pointer={x:x,y:y,valid:this.pending?this.canPlaceAt(x,y,this.pending.kind):false};}
    selectAt(x,y){const hit=this.items.slice().reverse().find(function(item){return ns.utils.distance(item,{x:x,y:y})<=(item.kind==='building'?34:27);})||null;if(hit)this.selected=hit;return hit;}
    placeQueued(x,y,economy){const pending=this.pending;if(!pending)return false;const catalog=pending.kind==='building'?ns.config.buildings:ns.config.units;const cfg=catalog[pending.type];if(!cfg||!this.canPlaceAt(x,y,pending.kind)||economy.gold<cfg.cost||economy.lumber<(cfg.wood||0))return false;economy.gold-=cfg.cost;economy.lumber-=cfg.wood||0;const item=pending.kind==='building'?new ns.entities.Building(pending.type,x,y):new ns.entities.CombatUnit(pending.type,x,y);this.items.push(item);this.selected=item;this.pending=null;return true;}
    upgrade(economy){if(!this.selected)return false;const cost=this.selected.upgradeCost();if(!cost||economy.gold<cost.gold||economy.merit<cost.merit)return false;economy.gold-=cost.gold;economy.merit-=cost.merit;this.selected.upgrade();return true;}
    sell(economy){if(!this.selected)return false;economy.gold+=this.selected.sellValue();this.items=this.items.filter(function(item){return item!==this.selected;},this);this.selected=null;return true;}
    towers(){return this.items.slice();}
    combatUnits(){return this.items.filter(function(item){return item.kind==='unit';});}
    buildings(){return this.items.filter(function(item){return item.kind==='building';});}
    draw(ctx,art){this.items.slice().sort(function(a,b){return a.y-b.y;}).forEach(function(item){item.draw(ctx,item===this.selected,art);},this);if(this.pending){const catalog=this.pending.kind==='building'?ns.config.buildings:ns.config.units;const cfg=catalog[this.pending.type];ctx.save();ctx.globalAlpha=this.pointer.valid ? .72 : .4;ctx.fillStyle=this.pointer.valid?'#65efb2':'#ff5c5c';ctx.strokeStyle=ctx.fillStyle;ctx.lineWidth=2;ctx.beginPath();ctx.arc(this.pointer.x,this.pointer.y,this.pending.kind==='building'?30:20,0,Math.PI*2);ctx.fill();ctx.globalAlpha=.28;ctx.beginPath();ctx.arc(this.pointer.x,this.pointer.y,cfg.range,0,Math.PI*2);ctx.stroke();ctx.restore();}}
  }
  ns.systems.BuildSystem=BuildSystem;
})(globalThis.TowerFrontier);
