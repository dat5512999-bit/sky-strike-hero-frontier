(function(ns){
  'use strict';
  class ArtSystem{
    constructor(){this.background=this.load('assets/td/human-td-battlefield-v2.png');this.defenders=this.load('assets/td/human-defenders-atlas-v2.png');this.towers=this.load('assets/td/towers-atlas-v1.png');this.units=this.load('assets/td/units-atlas-v1.png');this.keep=this.load('assets/td/frontier-keep-v1.png');}
    load(src){const image=new Image();image.ready=false;image.onload=function(){image.ready=true;};image.src=src;return image;}
    drawBackground(ctx){if(!this.background.ready)return false;ctx.drawImage(this.background,0,0,ns.config.width,ns.config.height);return true;}
    drawTower(ctx,type,x,y){const columns={hunter:0,arcanist:1,rogue:2};const column=columns[type];if(column!==undefined&&this.defenders.ready){const sw=this.defenders.width/3;ctx.drawImage(this.defenders,column*sw,0,sw,this.defenders.height,x-44,y-69,88,88);return true;}if(!this.towers.ready)return false;const legacy={arrow:0,frost:1,cannon:2}[type];if(legacy===undefined)return false;const sw=this.towers.width/3;ctx.drawImage(this.towers,legacy*sw,0,sw,this.towers.height,x-53,y-73,106,106);return true;}
    drawUnit(ctx,type,x,y,size){if(!this.units.ready)return false;const cells={hero:[0,0],grunt:[1,0],runner:[2,0],brute:[0,1],shaman:[1,1],boss:[2,1]};const cell=cells[type];if(!cell)return false;const sw=this.units.width/3,sh=this.units.height/2;ctx.drawImage(this.units,cell[0]*sw,cell[1]*sh,sw,sh,x-size/2,y-size*.62,size,size);return true;}
    drawKeep(ctx,x,y,size){if(!this.keep.ready)return false;ctx.drawImage(this.keep,x-size/2,y-size*.58,size,size*.925);return true;}
  }
  ns.systems.ArtSystem=ArtSystem;
})(globalThis.TowerFrontier);
