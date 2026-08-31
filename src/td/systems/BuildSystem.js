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
    draw(ctx,art){this.pads.forEach(function(pad){if(pad.tower){pad.tower.draw(ctx,pad===this.selected,art);return;}ctx.save();ctx.translate(pad.x,pad.y);ctx.shadowColor='rgba(0,0,0,.55)';ctx.shadowBlur=10;const stone=ctx.createRadialGradient(-7,-9,3,0,0,30);stone.addColorStop(0,pad===this.selected?'#ffe39a':'#9aa88b');stone.addColorStop(.55,pad===this.selected?'#a9803e':'#54695a');stone.addColorStop(1,'#26382f');ctx.fillStyle=stone;ctx.strokeStyle=pad===this.selected?'#ffd36a':'#c3d2b4';ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,0,28,0,Math.PI*2);ctx.fill();ctx.stroke();ctx.shadowBlur=0;ctx.globalAlpha=.85;ctx.beginPath();ctx.arc(0,0,19,0,Math.PI*2);ctx.stroke();ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(-8,0);ctx.lineTo(8,0);ctx.moveTo(0,-8);ctx.lineTo(0,8);ctx.stroke();ctx.restore();},this);}
  }
  ns.systems.BuildSystem=BuildSystem;
})(globalThis.TowerFrontier);
