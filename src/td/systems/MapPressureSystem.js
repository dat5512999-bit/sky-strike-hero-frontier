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
    draw(ctx,game){
      const pressure=ns.config.mapPressure,active=Boolean(this.summary(game)),marker=pressure?.marker,ember=pressure?.visual==='ember';if(!pressure)return;
      if(marker){const flag=active?(ember?'#b84c2f':'#c77836'):(ember?'#754236':'#8d7044');ctx.save();ctx.translate(marker.x,marker.y);ctx.globalAlpha=active?1:.78;ctx.strokeStyle='#301d12';ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(-17,18);ctx.lineTo(-17,-58);ctx.stroke();ctx.fillStyle=flag;ctx.strokeStyle='#2c1a11';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(-16,-56);ctx.lineTo(42,-43);ctx.lineTo(19,-11);ctx.lineTo(-16,-22);ctx.closePath();ctx.fill();ctx.stroke();ctx.fillStyle='#fff0b7';ctx.font='900 14px Microsoft JhengHei, sans-serif';ctx.textAlign='center';ctx.fillText(ember?'♨':'≋',10,-29);ctx.fillStyle='#0b1615e8';ctx.fillRect(-57,25,114,38);ctx.strokeStyle=active?'#f6ca75':'#c6a76d';ctx.lineWidth=2;ctx.strokeRect(-57,25,114,38);ctx.fillStyle='#fff1bf';ctx.font='900 13px Microsoft JhengHei, sans-serif';ctx.fillText(pressure.name,0,41);ctx.fillStyle=active?'#ffd787':'#d7c49d';ctx.font='700 10px Microsoft JhengHei, sans-serif';ctx.fillText(active?(pressure.activeLabel||pressure.short):'第 '+pressure.startsAtWave+' 波起',0,56);ctx.restore();}
      if(active){const path=ns.config.path||[];for(const segment of pressure.segments||[]){for(let index=segment.startIndex;index<segment.endIndex;index+=1){const a=path[index],b=path[index+1];if(!a||!b)continue;const length=Math.hypot(b.x-a.x,b.y-a.y)||1,dx=(b.x-a.x)/length,dy=(b.y-a.y)/length,steps=Math.max(1,Math.ceil(length/54));for(let step=0;step<steps;step+=1){const t=(step+.45)/steps,x=a.x+(b.x-a.x)*t,y=a.y+(b.y-a.y)*t;ctx.save();ctx.globalAlpha=ember?.32:.42;ctx.strokeStyle=ember?'#ffab5b':'#f7d78b';ctx.lineWidth=ember?2.5:3;ctx.lineCap='round';ctx.beginPath();if(ember){ctx.arc(x-dy*7,y+dx*7,4+Math.sin(this.visualTime*5+step)*1.5,0,Math.PI*2);}else{ctx.moveTo(x-dx*14,y-dy*14);ctx.lineTo(x+dx*13,y+dy*13);ctx.lineTo(x+dx*5-dy*6,y+dy*5+dx*6);ctx.moveTo(x+dx*13,y+dy*13);ctx.lineTo(x+dx*5+dy*6,y+dy*5-dx*6);}ctx.stroke();ctx.restore();}}}}
      for(const gust of this.gusts){ctx.save();ctx.globalAlpha=Math.max(0,gust.time/gust.max)*.42;ctx.strokeStyle=gust.visual==='ember'?'#ffb35f':'#d7c38e';ctx.lineWidth=2.5;ctx.beginPath();ctx.arc(gust.x,gust.y,30*(1-gust.time/gust.max)+8,0,Math.PI*2);ctx.stroke();ctx.restore();}
    }
  }
  ns.systems.MapPressureSystem=MapPressureSystem;
})(globalThis.TowerFrontier);
