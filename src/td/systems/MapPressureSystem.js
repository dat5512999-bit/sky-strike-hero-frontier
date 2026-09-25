(function(ns){
  'use strict';
  class MapPressureSystem{
    constructor(){this.visualTime=0;this.gusts=[];}
    distances(){
      const pressure=ns.config.mapPressure,path=ns.config.path||[];
      if(!pressure?.segments?.length||path.length<2)return [];
      const cumulative=[0];for(let index=1;index<path.length;index++)cumulative[index]=cumulative[index-1]+Math.hypot(path[index].x-path[index-1].x,path[index].y-path[index-1].y);
      return pressure.segments.map(segment=>({start:cumulative[segment.startIndex]||0,end:cumulative[segment.endIndex]||0}));
    }
    update(game,dt){
      const pressure=ns.config.mapPressure,active=Boolean(pressure&&(game.waves?.wave||0)>=pressure.startsAtWave),segments=active?this.distances():[],reduced=Boolean(game.feedback?.reducedFx),cap=game.feedback?.mobile?8:16;
      this.visualTime+=Number(dt)||0;
      for(const monster of game.monsters||[]){
        const inside=segments.some(segment=>(monster.routeDistance||0)>=segment.start&&(monster.routeDistance||0)<=segment.end),controlled=monster.slowTimer>0||monster.rootTime>0||monster.frostStatus?.window>0;
        if(inside){
          monster.mapPressure={id:pressure.id,status:pressure.status||'壓',speedMultiplier:pressure.speedMultiplier||1,controlFloor:pressure.controlFloor||1,armorBonus:controlled?(pressure.controlArmorBonus||0):(pressure.armorBonus||0)};
          if(!monster.pressureEntered&&!reduced&&this.gusts.length<cap){this.gusts.push({x:monster.x,y:monster.y,time:.54,max:.54,visual:pressure.visual||'wind'});}monster.pressureEntered=true;
        }else {monster.mapPressure=null;monster.pressureEntered=false;}
      }
      this.gusts.forEach(gust=>{gust.time-=dt;});this.gusts=this.gusts.filter(gust=>gust.time>0);
    }
    summary(game,wave){const pressure=ns.config.mapPressure,target=wave||game?.waves?.wave||0;if(!pressure||target<pressure.startsAtWave)return null;return{id:pressure.id,name:pressure.name,short:pressure.short,detail:pressure.detail,startsNow:target===pressure.startsAtWave};}
    drawMarker(ctx,pressure,active){
      const marker=pressure.marker;if(!marker)return;
      const ember=pressure.visual==='ember',pulse=active?(.78+Math.sin(this.visualTime*2.4)*.12):.34;
      // The modifier is communicated in Wave HUD.  On the map it is a weathered
      // road seal, not a flag or a second piece of HUD that obscures the playfield.
      ctx.save();ctx.translate(marker.x,marker.y);ctx.globalAlpha=pulse;ctx.strokeStyle=ember?'#9a5637':'#b89159';ctx.lineWidth=1.5;ctx.beginPath();ctx.ellipse(0,4,18,7,0,0,Math.PI*2);ctx.stroke();
      if(ember){ctx.strokeStyle='#d58448';ctx.lineWidth=1.15;for(let index=0;index<3;index++){ctx.beginPath();ctx.arc((index-1)*6,4,5,index*.8,index*.8+1.9);ctx.stroke();}}
      else {ctx.strokeStyle='#e2c78c';ctx.lineWidth=1.2;for(let index=-1;index<=1;index++){ctx.beginPath();ctx.moveTo(-13,4+index*3);ctx.quadraticCurveTo(0,-2+index*3,13,4+index*3);ctx.stroke();}}
      ctx.restore();
    }
    drawCorridor(ctx,pressure,game){
      const path=ns.config.path||[],ember=pressure.visual==='ember',stride=game.feedback?.mobile||game.feedback?.reducedFx?2:1;
      for(const segment of pressure.segments||[]){for(let index=segment.startIndex;index<segment.endIndex;index+=stride){const a=path[index],b=path[Math.min(segment.endIndex,index+stride)];if(!a||!b)continue;const dx=b.x-a.x,dy=b.y-a.y,length=Math.hypot(dx,dy)||1,nx=-dy/length,ny=dx/length,midX=(a.x+b.x)/2,midY=(a.y+b.y)/2;
        ctx.save();ctx.lineCap='round';
        if(ember){
          ctx.globalAlpha=.14;ctx.fillStyle='#3d2a24';ctx.beginPath();ctx.ellipse(midX,midY,Math.min(38,length*.46),10,Math.atan2(dy,dx),0,Math.PI*2);ctx.fill();
          ctx.globalAlpha=.28;ctx.strokeStyle='#bc7042';ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(midX+nx*5,midY+ny*5,4+Math.sin(this.visualTime*3+index)*1.2,0,Math.PI*2);ctx.stroke();
        }else{
          ctx.globalAlpha=.20;ctx.strokeStyle='#ead29a';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(a.x+nx*7,a.y+ny*7);ctx.quadraticCurveTo(midX-nx*(7+Math.sin(index)*3),midY-ny*(7+Math.sin(index)*3),b.x+nx*7,b.y+ny*7);ctx.stroke();
          ctx.globalAlpha=.12;ctx.strokeStyle='#a77746';ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(a.x-nx*10,a.y-ny*10);ctx.quadraticCurveTo(midX+nx*9,midY+ny*9,b.x-nx*10,b.y-ny*10);ctx.stroke();
        }
        ctx.restore();
      }}
    }
    draw(ctx,game){
      const pressure=ns.config.mapPressure,active=Boolean(this.summary(game));if(!pressure)return;
      this.drawMarker(ctx,pressure,active);if(active)this.drawCorridor(ctx,pressure,game);
      for(const gust of this.gusts){const progress=Math.max(0,gust.time/gust.max),ember=gust.visual==='ember';ctx.save();ctx.globalAlpha=progress*(ember?.22:.28);ctx.strokeStyle=ember?'#d7824d':'#ddc48f';ctx.lineWidth=ember?1.6:2;ctx.lineCap='round';ctx.beginPath();if(ember){ctx.arc(gust.x,gust.y,13+(1-progress)*12,0,Math.PI*2);}else{ctx.moveTo(gust.x-16,gust.y+4);ctx.quadraticCurveTo(gust.x,gust.y-8,gust.x+18,gust.y-2);}ctx.stroke();ctx.restore();}
    }
  }
  ns.systems.MapPressureSystem=MapPressureSystem;
})(globalThis.TowerFrontier);
