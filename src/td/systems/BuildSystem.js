(function(ns){
  'use strict';
  class BuildSystem{
    constructor(){this.reset();}
    reset(){this.pads=ns.config.pads.map(function(p,index){return{x:p.x,y:p.y,index:index,tower:null};});this.selected=null;}
    selectAt(x,y){this.selected=this.pads.find(function(pad){return Math.hypot(pad.x-x,pad.y-y)<=34;})||null;return this.selected;}
    build(type,economy){const pad=this.selected,cfg=ns.config.towers[type];if(!pad||pad.tower||!cfg||economy.gold<cfg.cost)return false;economy.gold-=cfg.cost;pad.tower=new ns.entities.Tower(type,pad.x,pad.y);return true;}
    upgrade(economy){if(!this.selected||!this.selected.tower)return false;const cost=this.selected.tower.upgradeCost();if(!cost||economy.gold<cost)return false;economy.gold-=this.selected.tower.upgrade();return true;}
    sell(economy){if(!this.selected||!this.selected.tower)return false;economy.gold+=this.selected.tower.sellValue();this.selected.tower=null;return true;}
    towers(){return this.pads.filter(function(p){return p.tower;}).map(function(p){return p.tower;});}
    draw(ctx){this.pads.forEach(function(pad){if(pad.tower){pad.tower.draw(ctx,pad===this.selected);return;}ctx.save();ctx.translate(pad.x,pad.y);ctx.fillStyle=pad===this.selected?'rgba(255,211,106,.28)':'rgba(16,40,36,.42)';ctx.strokeStyle=pad===this.selected?'#ffd36a':'#7ca68f';ctx.lineWidth=3;ctx.beginPath();ctx.arc(0,0,27,0,Math.PI*2);ctx.fill();ctx.stroke();ctx.globalAlpha=.8;ctx.beginPath();ctx.moveTo(-10,0);ctx.lineTo(10,0);ctx.moveTo(0,-10);ctx.lineTo(0,10);ctx.stroke();ctx.restore();},this);}
  }
  ns.systems.BuildSystem=BuildSystem;
})(globalThis.TowerFrontier);
