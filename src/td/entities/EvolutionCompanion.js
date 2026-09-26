(function(ns){
  'use strict';
  class EvolutionCompanion extends ns.entities.Summon{
    constructor(owner,options){
      super(owner,{form:options.kind==='wolf'?'hunter':'rogue',offsetX:options.offsetX,duration:options.duration||8,damage:options.damage||24*owner.skillPower(),range:options.kind==='tideguard'?110:65,leash:300,speed:180,color:ns.systems.HeroRoster.get(owner.classType).color});
      this.evolutionKind=options.kind;this.evolutionRank=options.rank;this.pullClock=0;this.tags=['summon','evolution'];
    }
    update(dt,monsters,projectiles){
      if(!this.active)return;if(!this.owner.active){this.active=false;return;}
      const first=projectiles.length;super.update(dt,monsters,projectiles);
      for(const p of projectiles.slice(first)){p.evolutionSkill=true;p.canHitAir=true;p.style=this.evolutionKind==='tideguard'?'tide-spear':this.evolutionKind==='wolf'?'ice':'claw';p.attackType='chaos';p.secondary=false;if(this.evolutionKind==='wolf'){p.frost=22;p.shatter=1.1;p.shatterRadius=60;}if(this.evolutionKind==='tideguard'&&this.evolutionRank===2)this.cooldown*=.65;}
      this.pullClock-=dt;
      if(this.active&&this.evolutionKind==='wolf'&&this.pullClock<=0){this.pullClock=.5;for(const m of monsters.filter(m=>m.active&&ns.utils.distance(m,this)<100).slice(0,8)){m.applySlow(.5,.7);ns.systems.HeroEvolutionCombat.displace(m,8);}}
    }
    draw(ctx,art){
      ctx.save();try{
        ctx.globalAlpha=Math.max(0,Math.min(.72,this.time/2,1-this.spawnTime/.55));
        if(this.evolutionKind==='shadow'&&art?.drawCombatUnit){art.drawCombatUnit(ctx,{type:'rogue',x:this.x,y:this.y,level:1,state:this.state,frame:this.frame,facing:this.facing,config:()=>({color:this.color})});return;}
        ctx.translate(this.x,this.y);ctx.strokeStyle=this.color;ctx.fillStyle=this.color;ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(0,8,19,7,0,0,Math.PI*2);ctx.stroke();
        if(this.evolutionKind==='tideguard'){
          ctx.beginPath();ctx.moveTo(-9,-28);ctx.quadraticCurveTo(15,-8,-4,7);ctx.quadraticCurveTo(-23,16,16,15);ctx.stroke();ctx.beginPath();ctx.arc(-3,-33,6,0,Math.PI*2);ctx.fill();
          ctx.beginPath();ctx.moveTo(14,2);ctx.lineTo(14,-45);ctx.moveTo(6,-43);ctx.lineTo(6,-34);ctx.lineTo(22,-34);ctx.lineTo(22,-43);ctx.stroke();
        }else{
          ctx.beginPath();ctx.moveTo(-22,-6);ctx.lineTo(-12,-20);ctx.lineTo(5,-20);ctx.lineTo(13,-32);ctx.lineTo(16,-23);ctx.lineTo(27,-15);ctx.lineTo(15,-10);ctx.lineTo(10,5);ctx.lineTo(4,-9);ctx.lineTo(-10,-8);ctx.lineTo(-18,6);ctx.closePath();ctx.fill();
        }
      }finally{ctx.restore();}
    }
  }
  ns.entities.EvolutionCompanion=EvolutionCompanion;
})(globalThis.TowerFrontier);
