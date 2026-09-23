(function(ns){
  'use strict';
  // Gameplay-only prototype. No story facts are inferred from these names.
  const RULES=Object.freeze({
    radius:175,capacity:3,boost:.22,overloadSeconds:5,coolingSeconds:7,
    overloadHaste:.65,overloadDamage:.35,recyclerGold:12,recyclerWaveCap:72
  });
  class GoblinNetworkSystem{
    constructor(){this.reset();}
    reset(){this.overload=0;this.cooling=0;this.waveGold=0;this.links=[];}
    startWave(){this.waveGold=0;}
    activate(items){
      if(this.overload>0||this.cooling>0||!this.links.length||!items.some(item=>item.type==='goblinGenerator'))return false;
      this.overload=RULES.overloadSeconds;return true;
    }
    update(dt,items,economy,activeWave){
      dt=Math.max(0,Math.min(.05,Number(dt)||0));
      if(this.overload>0){this.overload=Math.max(0,this.overload-dt);if(!this.overload)this.cooling=RULES.coolingSeconds;}
      else this.cooling=Math.max(0,this.cooling-dt);
      const generators=items.filter(item=>item.type==='goblinGenerator'&&!item.retired);
      this.links=[];
      const consumers=items.filter(item=>item.config&&item.config().networkCost&&!item.retired);
      consumers.forEach(item=>{item.networkSource=null;item.engineerBoost=Math.max(0,(item.engineerBoost||0)-dt);});
      generators.forEach(core=>{
        let remaining=RULES.capacity+(core.level||1)-1;
        consumers.filter(item=>Math.hypot(item.x-core.x,item.y-core.y)<=RULES.radius)
          .sort((a,b)=>Math.hypot(a.x-core.x,a.y-core.y)-Math.hypot(b.x-core.x,b.y-core.y))
          .forEach(item=>{
            if(item.networkSource||remaining<item.config().networkCost)return;
            remaining-=item.config().networkCost;item.networkSource=core;this.links.push([core,item]);
          });
      });
      consumers.forEach(item=>{
        const powered=Boolean(item.networkSource);
        item.networkPowered=powered;
        item.networkOverloaded=powered&&this.overload>0;
        item.networkCooling=powered&&this.cooling>0;
        item.networkDamage=powered?Math.max(item.engineerBoost>0?.42:0,item.networkOverloaded?RULES.overloadDamage:RULES.boost):0;
        item.networkHaste=powered&&item.networkOverloaded?RULES.overloadHaste:0;
        if(item.type==='goblinRecycler'&&item.kind==='building'&&powered&&activeWave&&this.cooling<=0&&this.waveGold<RULES.recyclerWaveCap){
          item.recycleTimer=(item.recycleTimer||0)+dt;
          while(item.recycleTimer>=2&&this.waveGold<RULES.recyclerWaveCap){
            item.recycleTimer-=2;const gold=Math.min(RULES.recyclerGold,RULES.recyclerWaveCap-this.waveGold);
            if(typeof economy.addGold==='function')economy.addGold(gold);else economy.gold+=gold;
            this.waveGold+=gold;
          }
        }
      });
      consumers.filter(item=>item.type==='goblinRecycler'&&item.kind==='unit'&&item.networkPowered)
        .forEach(technician=>{
          const target=consumers.find(item=>item.kind==='building'&&item.config().damage>0&&item.networkPowered&&Math.hypot(item.x-technician.x,item.y-technician.y)<=155);
          if(target)target.networkDamage=Math.max(target.networkDamage,.08+(target.networkOverloaded?RULES.overloadDamage:RULES.boost));
        });
      if(activeWave&&this.cooling>0&&consumers.some(item=>item.type==='goblinCooler'&&item.networkPowered))this.cooling=Math.max(0,this.cooling-dt*.5);
      // Do not serialize object references to generator instances in checkpoints.
      consumers.forEach(item=>{item.networkSource=null;});
    }
    draw(ctx){
      ctx.save();ctx.lineWidth=2;
      const t=performance.now()/1000;
      this.links.forEach(([core,item])=>{const a={x:core.x,y:core.y-35},b={x:item.x,y:item.y-35},p=(t*(this.overload>0?1.9:.65))%1;
        ctx.strokeStyle=this.cooling>0?'#a1bbc6':this.overload>0?'#ffae43':'#86e4d5';ctx.globalAlpha=this.cooling>0?.38:.62;ctx.setLineDash(this.cooling>0?[3,7]:[8,5]);ctx.lineDashOffset=-t*18;ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();ctx.setLineDash([]);
        if(this.cooling<=0){ctx.globalAlpha=.9;ctx.fillStyle=this.overload>0?'#ffe0a1':'#c0fff2';ctx.shadowColor=ctx.fillStyle;ctx.shadowBlur=this.overload>0?15:9;ctx.beginPath();ctx.arc(a.x+(b.x-a.x)*p,a.y+(b.y-a.y)*p,this.overload>0?4:3,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;}
      });
      ctx.restore();
    }
    snapshot(){return {overload:this.overload,cooling:this.cooling,waveGold:this.waveGold};}
    restore(data){this.overload=Math.max(0,Number(data?.overload)||0);this.cooling=Math.max(0,Number(data?.cooling)||0);this.waveGold=Math.max(0,Math.min(RULES.recyclerWaveCap,Number(data?.waveGold)||0));this.links=[];}
  }
  GoblinNetworkSystem.RULES=RULES;ns.systems.GoblinNetworkSystem=GoblinNetworkSystem;
})(globalThis.TowerFrontier);
