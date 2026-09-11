(function(ns){
  'use strict';
  class Summon{
    constructor(owner,options){Object.assign(this,{owner:owner,x:owner.x+(options.offsetX===undefined?16:options.offsetX),y:owner.y+10,active:true,time:options.duration||12,damage:options.damage||12,range:options.range||120,leash:options.leash||195,color:options.color||'#97ffe0',cooldown:.2,clock:0,offsetX:options.offsetX===undefined?16:options.offsetX,speed:options.speed||90,form:options.form||'spirit',state:'idle',frame:0,frameClock:0,facing:0,level:options.level||Math.max(1,(owner.equipment&&owner.equipment.charm||0)+1),attackTimer:0});}
    setState(state){if(this.state===state)return;this.state=state;this.frame=0;this.frameClock=0;}
    animate(dt){const fps={idle:2.5,walk:8,attack:10,hit:7,death:5}[this.state]||4;this.frameClock+=dt*fps;this.frame=Math.floor(this.frameClock)%4;}
    update(dt,monsters,projectiles){
      this.time-=dt;this.clock+=dt;this.cooldown-=dt;this.attackTimer=Math.max(0,this.attackTimer-dt);
      if(this.time<=0||this.owner.retired){this.active=false;this.setState('death');return;}
      const target=monsters.filter(function(m){return m.active&&ns.utils.distance(this.owner,m)<=this.leash;},this).sort(function(a,b){return b.progress()-a.progress();})[0];
      const destination=target||this.owner,dx=destination.x+this.offsetX-this.x,dy=destination.y-this.y,distance=Math.hypot(dx,dy);
      let moved=false;if(distance>(target?Math.max(2,Math.min(35,this.range-Math.abs(this.offsetX)-5)):25)){const move=Math.min(distance,this.speed*dt);this.x+=dx/distance*move;this.y+=dy/distance*move;this.facing=Math.atan2(dy,dx);moved=true;}
      if(target&&this.cooldown<=0&&ns.utils.distance(this,target)<=this.range){const melee=this.form==='hunter';projectiles.push(new ns.entities.Projectile(this.owner,target,{x:this.x,y:this.y,damage:this.damage*(melee?(1+.12*(this.level-1)):1),color:this.color,attackType:melee?'pierce':'magic',speed:melee?950:360,style:melee?'bite':'spirit'}));this.cooldown=Math.max(.5,.85-(this.level-1)*.06);this.attackTimer=.34;this.setState('attack');}
      else if(this.attackTimer<=0)this.setState(moved?'walk':'idle');this.animate(dt);
    }
    draw(ctx,art){if(art&&art.drawSummon&&art.drawSummon(ctx,this))return;if(this.form==='rogue'&&art){ctx.save();ctx.globalAlpha=.65;art.drawCombatUnit(ctx,{type:'rogue',x:this.x,y:this.y,level:1,state:this.state,frame:this.frame,facing:this.facing,config:function(){return{color:'#c884df'};}});ctx.restore();return;}ctx.save();ctx.translate(this.x,this.y);ctx.globalAlpha=Math.min(.85,this.time/2);ctx.strokeStyle=this.color;ctx.fillStyle=this.color;ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(0,9,13,5,0,0,Math.PI*2);ctx.stroke();ctx.translate(0,Math.sin(this.clock*5)*3);ctx.beginPath();ctx.moveTo(0,-25);ctx.lineTo(12,3);ctx.lineTo(5,0);ctx.lineTo(0,10);ctx.lineTo(-5,0);ctx.lineTo(-12,3);ctx.closePath();ctx.fill();ctx.restore();}
  }
  ns.entities.Summon=Summon;
})(globalThis.TowerFrontier);
