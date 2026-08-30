(function(ns){
  'use strict';
  class PathSystem{
    constructor(points){this.points=points||ns.config.path;}
    draw(ctx){
      ctx.save();ctx.lineCap='round';ctx.lineJoin='round';
      ctx.strokeStyle='#463524';ctx.lineWidth=86;ctx.beginPath();this.points.forEach(function(p,i){if(i)ctx.lineTo(p.x,p.y);else ctx.moveTo(p.x,p.y);});ctx.stroke();
      ctx.strokeStyle='#c4a66f';ctx.lineWidth=72;ctx.stroke();ctx.strokeStyle='rgba(255,239,190,.35)';ctx.lineWidth=3;ctx.setLineDash([7,13]);ctx.stroke();ctx.setLineDash([]);
      this.points.forEach(function(p,i){if(i===0||i===this.points.length-1)return;ctx.fillStyle='rgba(70,45,25,.28)';ctx.beginPath();ctx.arc(p.x,p.y,34,0,Math.PI*2);ctx.fill();},this);
      ctx.restore();
    }
  }
  ns.systems.PathSystem=PathSystem;
})(globalThis.TowerFrontier);
