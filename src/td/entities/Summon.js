(function(ns){
  'use strict';
  class Summon{
    constructor(owner,options){Object.assign(this,{owner:owner,x:owner.x+(options.offsetX===undefined?16:options.offsetX),y:owner.y+10,active:true,time:options.duration||12,damage:options.damage||12,range:options.range||120,leash:options.leash||195,color:options.color||'#97ffe0',cooldown:.2,clock:0,offsetX:options.offsetX===undefined?16:options.offsetX,speed:options.speed||90,form:options.form||'spirit'});}
    update(dt,monsters,projectiles){
      this.time-=dt;this.clock+=dt;this.cooldown-=dt;
      if(this.time<=0||this.owner.retired){this.active=false;return;}
      const target=monsters.filter(function(m){return m.active&&ns.utils.distance(this.owner,m)<=this.leash;},this).sort(function(a,b){return b.progress()-a.progress();})[0];
      const destination=target||this.owner,dx=destination.x+this.offsetX-this.x,dy=destination.y-this.y,distance=Math.hypot(dx,dy);
      if(distance>(target?Math.max(2,Math.min(35,this.range-Math.abs(this.offsetX)-5)):25)){const move=Math.min(distance,this.speed*dt);this.x+=dx/distance*move;this.y+=dy/distance*move;}
      if(target&&this.cooldown<=0&&ns.utils.distance(this,target)<=this.range){projectiles.push(new ns.entities.Projectile(this.owner,target,{x:this.x,y:this.y,damage:this.damage,color:this.color,attackType:'magic',speed:360,style:'spirit'}));this.cooldown=.85;}
    }
    draw(ctx,art){if(this.form==='rogue'&&art){ctx.save();ctx.globalAlpha=.65;art.drawCombatUnit(ctx,{type:'rogue',x:this.x,y:this.y,level:1,state:this.cooldown>.5?'attack':'walk',frame:Math.floor(this.clock*8)%4,facing:0,config:function(){return{color:'#c884df'};}});ctx.restore();return;}if(this.form==='hunter'){ctx.save();ctx.translate(this.x,this.y);ctx.fillStyle='#a7b6c5';ctx.beginPath();ctx.ellipse(0,-5,19,10,0,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.moveTo(10,-9);ctx.lineTo(20,-23);ctx.lineTo(28,-5);ctx.lineTo(15,0);ctx.fill();ctx.strokeStyle='#cbd7df';ctx.lineWidth=4;for(let side=-1;side<=1;side+=2){const step=Math.sin(this.clock*10)*5*side;ctx.beginPath();ctx.moveTo(side*11,1);ctx.lineTo(side*11+step,13);ctx.stroke();}ctx.restore();return;}ctx.save();ctx.translate(this.x,this.y);ctx.globalAlpha=Math.min(.85,this.time/2);ctx.strokeStyle=this.color;ctx.fillStyle=this.color;ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(0,9,13,5,0,0,Math.PI*2);ctx.stroke();ctx.translate(0,Math.sin(this.clock*5)*3);ctx.beginPath();ctx.moveTo(0,-25);ctx.lineTo(12,3);ctx.lineTo(5,0);ctx.lineTo(0,10);ctx.lineTo(-5,0);ctx.lineTo(-12,3);ctx.closePath();ctx.fill();ctx.fillStyle='#142130';ctx.fillRect(-5,-15,3,3);ctx.fillRect(2,-15,3,3);ctx.strokeStyle='#e7eacb';ctx.beginPath();ctx.moveTo(15,-24);ctx.lineTo(15,9);ctx.stroke();ctx.restore();}
  }
  ns.entities.Summon=Summon;
})(globalThis.TowerFrontier);
