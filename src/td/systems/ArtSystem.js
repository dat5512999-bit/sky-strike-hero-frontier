(function(ns){
  'use strict';
  class ArtSystem{
    constructor(){this.hero=this.load('assets/td/hero-actions-v1.png');this.background=this.load('assets/td/human-td-battlefield-v2.png');this.combatUnits={hunter:this.load('assets/td/ranger-actions-v1.png'),arcanist:this.load('assets/td/arcanist-actions-v1.png'),rogue:this.load('assets/td/rogue-actions-v1.png')};this.towers=this.load('assets/td/towers-atlas-v1.png');this.units=this.load('assets/td/units-atlas-v1.png');this.keep=this.load('assets/td/frontier-keep-v1.png');}
    load(src){const image=new Image();image.ready=false;image.onload=function(){image.ready=true;};image.src=src;return image;}
    drawBackground(ctx){if(!this.background.ready)return false;ctx.drawImage(this.background,0,0,ns.config.width,ns.config.height);return true;}
    drawCombatUnit(ctx,unit){const image=this.combatUnits[unit.type];if(!image||!image.ready)return false;const sw=image.width/4,sh=image.height/4;const rows={idle:0,walk:1,attack:2,hit:3,death:3};const row=rows[unit.state]||0;const frame=Math.max(0,Math.min(3,unit.frame||0));const movingLift=unit.state==='walk'?Math.sin((unit.frameClock||0)*Math.PI)*2:0;const height=92,width=height*(sw/sh);ctx.save();ctx.translate(unit.x,unit.y);if(Math.cos(unit.facing)<0)ctx.scale(-1,1);ctx.drawImage(image,frame*sw,row*sh,sw,sh,-width/2,-72-movingLift,width,height);ctx.restore();this.drawRank(ctx,unit.x,unit.y,unit.level,unit.config().color,false,unit.type);return true;}
    drawHero(ctx,hero){const image=this.hero;if(!image.ready)return false;const sw=image.width/4,sh=image.height/4,row={idle:0,walk:1,attack:2,cast:3}[hero.state]||0,height=112,width=height*sw/sh;ctx.save();ctx.translate(hero.x,hero.y);if(Math.cos(hero.facing)<0)ctx.scale(-1,1);ctx.drawImage(image,hero.frame*sw,row*sh,sw,sh,-width/2,-height*.8,width,height);ctx.restore();return true;}
    drawRank(ctx,x,y,level,color,building,type){
      if(level<2)return;ctx.save();ctx.translate(x,y);ctx.strokeStyle='#dfc67c';ctx.fillStyle=color;ctx.lineWidth=2;
      if(building){for(let side=-1;side<=1;side+=2){if(side===1&&level<3)continue;ctx.beginPath();ctx.moveTo(side*34,12);ctx.lineTo(side*34,-47-level*2);ctx.stroke();ctx.beginPath();ctx.moveTo(side*34,-47-level*2);ctx.lineTo(side*34+side*15,-40-level*2);ctx.lineTo(side*34,-27-level*2);ctx.closePath();ctx.fill();ctx.stroke();}}
      if(!building){ctx.fillStyle='#cfb875';for(let side=-1;side<=1;side+=2){ctx.beginPath();ctx.moveTo(side*12,-43);ctx.lineTo(side*(18+level),-36);ctx.lineTo(side*13,-30);ctx.closePath();ctx.fill();}ctx.fillStyle=color;}
      if(level>=3){ctx.globalAlpha=.65;ctx.beginPath();ctx.ellipse(0,16,building?42:27,building?15:10,0,0,Math.PI*2);ctx.stroke();ctx.globalAlpha=1;}
      if(level>=4){ctx.shadowColor=color;ctx.shadowBlur=9;const count=level===5?5:3;for(let i=0;i<count;i++){const px=(i-(count-1)/2)*9,py=building?-76:-67;ctx.beginPath();ctx.moveTo(px,py-5);ctx.lineTo(px+3,py);ctx.lineTo(px,py+5);ctx.lineTo(px-3,py);ctx.closePath();ctx.fill();}ctx.shadowBlur=0;}
      for(let i=0;i<level-1;i++){const px=(i-(level-2)/2)*8;ctx.fillStyle='#f4d67d';ctx.fillRect(px-2,building?24:22,4,3);}
      ctx.restore();
    }
    drawBuilding(ctx,type,x,y,level){if(!this.towers.ready)return false;const column={arrow:0,frost:1,cannon:2}[type];if(column===undefined)return false;const sw=this.towers.width/3;const scale=1+Math.min(4,(level||1)-1)*.035;ctx.drawImage(this.towers,column*sw,0,sw,this.towers.height,x-53*scale,y-79*scale,106*scale,106*scale);this.drawRank(ctx,x,y,level,ns.config.buildings[type].color,true,type);return true;}
    drawUnit(ctx,type,x,y,size){if(!this.units.ready)return false;const cells={hero:[0,0],grunt:[1,0],runner:[2,0],brute:[0,1],shaman:[1,1],boss:[2,1]};const cell=cells[type];if(!cell)return false;const sw=this.units.width/3,sh=this.units.height/2;ctx.drawImage(this.units,cell[0]*sw,cell[1]*sh,sw,sh,x-size/2,y-size*.62,size,size);return true;}
    drawKeep(ctx,x,y,size){if(!this.keep.ready)return false;ctx.drawImage(this.keep,x-size/2,y-size*.58,size,size*.925);return true;}
  }
  ns.systems.ArtSystem=ArtSystem;
})(globalThis.TowerFrontier);
