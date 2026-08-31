(function(ns){
  'use strict';
  function pointSegmentDistance(px,py,a,b){const dx=b.x-a.x,dy=b.y-a.y;const length=dx*dx+dy*dy;if(!length)return Math.hypot(px-a.x,py-a.y);const t=Math.max(0,Math.min(1,((px-a.x)*dx+(py-a.y)*dy)/length));return Math.hypot(px-(a.x+t*dx),py-(a.y+t*dy));}
  class BuildSystem{
    constructor(){this.reset();}
    reset(){this.units=[];this.selected=null;this.pendingType=null;this.pointer={x:360,y:360,valid:false};}
    queue(type){if(!ns.config.towers[type])return false;this.pendingType=type;this.selected=null;return true;}
    cancel(){this.pendingType=null;}
    canPlaceAt(x,y){if(x<42||x>678||y<62||y>674)return false;if(ns.config.path.some(function(point,index,path){return index&&pointSegmentDistance(x,y,path[index-1],point)<55;}))return false;return !this.units.some(function(tower){return ns.utils.distance(tower,{x:x,y:y})<58;});}
    updatePointer(x,y){this.pointer={x:x,y:y,valid:this.canPlaceAt(x,y)};}
    selectAt(x,y){this.selected=this.units.find(function(tower){return ns.utils.distance(tower,{x:x,y:y})<=30;})||null;return this.selected;}
    placeQueued(x,y,economy){const type=this.pendingType,cfg=ns.config.towers[type];if(!cfg||!this.canPlaceAt(x,y)||economy.gold<cfg.cost||economy.lumber<(cfg.wood||0))return false;economy.gold-=cfg.cost;economy.lumber-=cfg.wood||0;const tower=new ns.entities.Tower(type,x,y);this.units.push(tower);this.selected=tower;this.pendingType=null;return true;}
    upgrade(economy){if(!this.selected)return false;const cost=this.selected.upgradeCost();if(!cost||economy.gold<cost.gold||economy.merit<cost.merit)return false;economy.gold-=cost.gold;economy.merit-=cost.merit;this.selected.upgrade();return true;}
    sell(economy){if(!this.selected)return false;economy.gold+=this.selected.sellValue();this.units=this.units.filter(function(tower){return tower!==this.selected;},this);this.selected=null;return true;}
    towers(){return this.units.slice();}
    draw(ctx,art){this.units.forEach(function(tower){tower.draw(ctx,tower===this.selected,art);},this);if(this.pendingType){const cfg=ns.config.towers[this.pendingType];ctx.save();ctx.globalAlpha=this.pointer.valid ? .72 : .4;ctx.fillStyle=this.pointer.valid?'#65efb2':'#ff5c5c';ctx.strokeStyle=ctx.fillStyle;ctx.lineWidth=2;ctx.beginPath();ctx.arc(this.pointer.x,this.pointer.y,26,0,Math.PI*2);ctx.fill();ctx.globalAlpha=.28;ctx.beginPath();ctx.arc(this.pointer.x,this.pointer.y,cfg.range,0,Math.PI*2);ctx.stroke();ctx.restore();}}
  }
  ns.systems.BuildSystem=BuildSystem;
})(globalThis.TowerFrontier);
