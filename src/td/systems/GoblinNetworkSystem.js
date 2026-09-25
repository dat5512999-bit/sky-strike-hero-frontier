(function(ns){
  'use strict';
  // Gameplay-only prototype. No story facts are inferred from these names.
  const RULES=Object.freeze({
    radius:175,capacity:3,boost:.22,overloadSeconds:5,coolingSeconds:7,
    overloadHaste:.65,overloadDamage:.35,recyclerGold:12,recyclerWaveCap:72
  });
  class GoblinNetworkSystem{
    constructor(){this.reset();}
    reset(){this.overload=0;this.cooling=0;this.waveGold=0;this.links=[];this.consumers=[];}
    startWave(){this.waveGold=0;}
    activate(items){
      if(this.overload>0||this.cooling>0||!this.links.length||!items.some(item=>item.type==='goblinGenerator'))return false;
      this.overload=RULES.overloadSeconds;return true;
    }
    effectLabel(item,powered){
      const cfg=item.config();
      if(cfg.damage>0)return powered?'+'+Math.round((item.networkDamage||RULES.boost)*100)+'%傷害':'未獲 +22%傷害';
      if(item.type==='goblinRecycler'&&item.kind==='building')return powered?'作戰回收啟動':'回收未啟動';
      if(item.type==='goblinRecycler')return powered?'機械支援啟動':'支援未啟動';
      if(item.type==='goblinCooler')return powered?'冷卻支援啟動':'冷卻未啟動';
      return powered?'機械效果啟動':'效果未啟動';
    }
    stateLabel(item){
      const cfg=item.config();
      if(item.networkCooling)return '過熱停機';
      if(item.networkOverloaded)return '超載 +35%／+65%';
      if(item.networkPowered)return '供電 '+this.effectLabel(item,true);
      if(cfg.networkCost>=2&&cfg.damage>0)return '缺電＝停機';
      return '缺電 '+this.effectLabel(item,false);
    }
    capacity(core){return RULES.capacity+(core.level||1)-1+(core.config().networkCapacity||0);}
    radius(core){return core.config().range||RULES.radius;}
    preview(items,candidate){
      const consumers=items.filter(item=>item.config&&item.config().networkCost&&!item.retired),generators=items.filter(item=>item.type==='goblinGenerator'&&!item.retired),source=new Map(),used=new Map();
      if(!candidate||!candidate.config||!candidate.config().networkCost)return {powered:false,source:null,used:0,capacity:0};
      consumers.push(candidate);
      generators.forEach(core=>{
        let remaining=this.capacity(core);
        consumers.filter(item=>Math.hypot(item.x-core.x,item.y-core.y)<=this.radius(core))
          .sort((a,b)=>Math.hypot(a.x-core.x,a.y-core.y)-Math.hypot(b.x-core.x,b.y-core.y))
          .forEach(item=>{
            const cost=item.config().networkCost;
            if(source.has(item)||remaining<cost)return;
            remaining-=cost;source.set(item,core);used.set(core,(used.get(core)||0)+cost);
          });
      });
      const core=source.get(candidate)||null;
      return {powered:Boolean(core),source:core,used:core?used.get(core)||0:0,capacity:core?this.capacity(core):0};
    }
    update(dt,items,economy,activeWave){
      dt=Math.max(0,Math.min(.05,Number(dt)||0));
      if(this.overload>0){this.overload=Math.max(0,this.overload-dt);if(!this.overload)this.cooling=RULES.coolingSeconds;}
      else this.cooling=Math.max(0,this.cooling-dt);
      const generators=items.filter(item=>item.type==='goblinGenerator'&&!item.retired);
      this.links=[];
      const consumers=items.filter(item=>item.config&&item.config().networkCost&&!item.retired);
      this.consumers=consumers;
      consumers.forEach(item=>{item.networkSource=null;item.engineerBoost=Math.max(0,(item.engineerBoost||0)-dt);item.engineerHaste=Math.max(0,(item.engineerHaste||0)-dt);item.engineerSupportTarget=null;});
      generators.forEach(core=>{
        let remaining=this.capacity(core);
        consumers.filter(item=>Math.hypot(item.x-core.x,item.y-core.y)<=this.radius(core))
          .sort((a,b)=>Math.hypot(a.x-core.x,a.y-core.y)-Math.hypot(b.x-core.x,b.y-core.y))
          .forEach(item=>{
            if(item.networkSource||remaining<item.config().networkCost)return;
            remaining-=item.config().networkCost;item.networkSource=core;this.links.push([core,item]);
          });
      });
      consumers.forEach(item=>{
        const cfg=item.config(),powered=Boolean(item.networkSource);
        item.networkPowered=powered;
        item.networkOverloaded=powered&&this.overload>0;
        item.networkCooling=powered&&this.cooling>0;
        item.networkDamage=powered?Math.max(item.engineerBoost>0?.42:0,item.networkOverloaded?RULES.overloadDamage:RULES.boost):0;
        item.networkHaste=powered&&item.networkOverloaded?RULES.overloadHaste:0;
        if(item.type==='goblinRecycler'&&item.kind==='building'&&powered&&activeWave&&this.cooling<=0&&this.waveGold<(cfg.recyclerCap||RULES.recyclerWaveCap)){
          item.recycleTimer=(item.recycleTimer||0)+dt;
          while(item.recycleTimer>=2&&this.waveGold<(cfg.recyclerCap||RULES.recyclerWaveCap)){
            item.recycleTimer-=2;const cap=cfg.recyclerCap||RULES.recyclerWaveCap,gold=Math.min(cfg.recyclerGold||RULES.recyclerGold,cap-this.waveGold);
            if(typeof economy.addGold==='function')economy.addGold(gold);else economy.gold+=gold;
            this.waveGold+=gold;
          }
        }
      });
      consumers.filter(item=>item.type==='goblinRecycler'&&item.kind==='unit'&&item.networkPowered)
        .forEach(technician=>{
          const target=consumers.filter(item=>item.kind==='building'&&item.config().damage>0&&item.networkPowered&&Math.hypot(item.x-technician.x,item.y-technician.y)<=155)
            .sort((a,b)=>Math.hypot(a.x-technician.x,a.y-technician.y)-Math.hypot(b.x-technician.x,b.y-technician.y))[0];
          technician.engineerSupportTarget=target||null;
          if(target)target.networkDamage=Math.max(target.networkDamage,.08+(target.networkOverloaded?RULES.overloadDamage:RULES.boost));
        });
      if(activeWave&&this.cooling>0){const cooling=Math.max(0,...consumers.filter(item=>item.type==='goblinCooler'&&item.networkPowered).map(item=>item.config().coolingBonus??.5));if(cooling)this.cooling=Math.max(0,this.cooling-dt*cooling);}
      // Do not serialize object references to generator instances in checkpoints.
      consumers.forEach(item=>{item.networkSource=null;});
    }
    draw(ctx){
      ctx.save();ctx.lineWidth=2;
      const t=(globalThis.performance?.now?.()||0)/1000;
      const usage=new Map();
      this.links.forEach(([core,item])=>usage.set(core,(usage.get(core)||0)+item.config().networkCost));
      this.links.forEach(([core,item])=>{const a={x:core.x,y:core.y-35},b={x:item.x,y:item.y-35},p=(t*(this.overload>0?1.9:.65))%1;
        ctx.strokeStyle=this.cooling>0?'#a1bbc6':this.overload>0?'#ffae43':'#86e4d5';ctx.globalAlpha=this.cooling>0?.38:.62;ctx.setLineDash(this.cooling>0?[3,7]:[8,5]);ctx.lineDashOffset=-t*18;ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();ctx.setLineDash([]);
        if(this.cooling<=0){ctx.globalAlpha=.9;ctx.fillStyle=this.overload>0?'#ffe0a1':'#c0fff2';ctx.shadowColor=ctx.fillStyle;ctx.shadowBlur=this.overload>0?15:9;ctx.beginPath();ctx.arc(a.x+(b.x-a.x)*p,a.y+(b.y-a.y)*p,this.overload>0?4:3,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;}
      });
      // Persistent results tell players what power changes without dictating a build order.
      this.consumers.forEach(item=>{
        const powered=Boolean(item.networkPowered),cooling=Boolean(item.networkCooling),overloaded=Boolean(item.networkOverloaded),label=this.stateLabel(item),color=cooling?'#a1bbc6':overloaded?'#ffbe63':powered?'#75f2cf':'#ff806f',x=item.x,y=item.y-62,width=Math.max(48,label.length*10+12);
        ctx.save();ctx.globalAlpha=.94;ctx.fillStyle='rgba(9,25,26,.82)';ctx.strokeStyle=color;ctx.lineWidth=1.5;ctx.beginPath();ctx.roundRect(x-width/2,y-10,width,17,7);ctx.fill();ctx.stroke();ctx.fillStyle=color;ctx.font='800 10px Segoe UI';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(label,x,y-.5);ctx.restore();
      });
      usage.forEach((used,core)=>{
        const capacity=this.capacity(core),x=core.x,y=core.y-75;
        ctx.save();ctx.globalAlpha=.96;ctx.fillStyle='rgba(9,25,26,.86)';ctx.strokeStyle='#75f2cf';ctx.lineWidth=1.5;ctx.beginPath();ctx.roundRect(x-27,y-10,54,17,7);ctx.fill();ctx.stroke();ctx.fillStyle='#c8fff0';ctx.font='800 10px Segoe UI';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('供能 '+used+'/'+capacity,x,y-.5);ctx.restore();
      });
      this.links.map(([,item])=>item).filter(item=>item.engineerSupportTarget).forEach(technician=>{
        const target=technician.engineerSupportTarget;
        ctx.save();ctx.globalAlpha=.78;ctx.strokeStyle='#d7f59b';ctx.lineWidth=2;ctx.setLineDash([3,4]);ctx.lineDashOffset=-t*14;ctx.beginPath();ctx.moveTo(technician.x,technician.y-34);ctx.lineTo(target.x,target.y-38);ctx.stroke();ctx.setLineDash([]);ctx.fillStyle='#ecffd0';ctx.beginPath();ctx.arc(target.x,target.y-38,3,0,Math.PI*2);ctx.fill();ctx.restore();
      });
      ctx.restore();
    }
    snapshot(){return {overload:this.overload,cooling:this.cooling,waveGold:this.waveGold};}
    restore(data){this.overload=Math.max(0,Number(data?.overload)||0);this.cooling=Math.max(0,Number(data?.cooling)||0);this.waveGold=Math.max(0,Math.min(RULES.recyclerWaveCap,Number(data?.waveGold)||0));this.links=[];}
  }
  GoblinNetworkSystem.RULES=RULES;ns.systems.GoblinNetworkSystem=GoblinNetworkSystem;
})(globalThis.TowerFrontier);
