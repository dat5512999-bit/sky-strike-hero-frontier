(function(ns){
  'use strict';
  class Projectile{
    constructor(source,target,options){this.owner=source;this.x=source.x;this.y=source.y;this.target=target;Object.assign(this,options);this.style=this.style||((this.attackType==='pierce')?'arrow':this.attackType==='chaos'?'shadow':'energy');this.startX=this.x;this.startY=this.y;this.speed=this.speed||420;this.flightAge=0;this.active=true;}
    update(dt,monsters,onKill,onHit){
      if(!this.active)return;this.flightAge+=dt;if(this.hitResolved){this.trail-=dt;if(this.trail<=0)this.active=false;return;}const target=this.target;if(!target||!target.active){this.active=false;return;}const distance=ns.utils.distance(this,target);const move=this.speed*dt;
      if(distance<=move+target.radius){this.hit(monsters,onKill,onHit);this.active=Boolean(this.chain||this.splash);return;}this.x+=(target.x-this.x)/distance*move;this.y+=(target.y-this.y)/distance*move;
    }
    hit(monsters,onKill,onHit){const self=this;let victims=this.splash?monsters.filter(function(m){return m.active&&ns.utils.distance(m,self.target)<=self.splash;}):[this.target];if(this.lineEnd)victims=monsters.filter(m=>m.active&&ns.systems.BattleSynergySystem.lineDistance(m,this.lineStart,this.lineEnd)<30);if(this.chain){victims=[this.target];let bonus=!!(this.arcaneBounce&&this.target.arcaneMark>0),chainLimit=this.chain+(bonus?1:0);let last=this.target;while(victims.length<chainLimit){const candidates=monsters.filter(function(m){return m.active&&!victims.includes(m)&&ns.utils.distance(last,m)<=self.chainRange;}).sort(function(a,b){return ns.utils.distance(last,a)-ns.utils.distance(last,b);});if(!candidates.length)break;last=candidates[0];victims.push(last);if(this.arcaneBounce&&!bonus&&last.arcaneMark>0){bonus=true;chainLimit++;}}}this.hitResolved=true;this.trail=.32;this.chainPoints=[{x:this.startX,y:this.startY-30}].concat(victims.map(function(m){const v=typeof m.visualPosition==='function'?m.visualPosition():{x:m.x,y:m.y};return{x:v.x,y:v.y-30};}));victims.forEach(function(monster,index){if(!monster.active)return;const wasStronglySlowed=monster.slowTimer>0&&monster.slowFactor<=.8;if(self.slow)monster.applySlow(self.slow,self.slowTime);const table=ns.config.damageMultipliers[self.attackType]||{},multiplier=(table[monster.armorType]||1)*(self.chain&&index>0?.7:1)*(wasStronglySlowed?(self.bonusVsSlowed||1):1),damage=self.damage*multiplier,before=typeof monster.effectiveHealth==='function'?monster.effectiveHealth():monster.health,killed=monster.takeDamage(damage,self),after=typeof monster.effectiveHealth==='function'?monster.effectiveHealth():monster.health;if(onHit)onHit(monster,before-after,multiplier>=1.25,self);if(killed&&onKill)onKill(monster,self);});}
    draw(ctx){
      if(this.hitResolved&&!this.chain)return;
      ctx.save();ctx.strokeStyle=this.color||'#d9f3ff';ctx.fillStyle=this.color||'#d9f3ff';
      if(this.chain&&this.hitResolved){
        const age=1-this.trail/.32,points=this.chainPoints||[],visible=Math.min(points.length-1,Math.ceil(age*points.length*2)+1);
        ctx.globalAlpha=Math.min(1,this.trail/.12);ctx.lineWidth=this.weaponProc==='chain'?3.5:2.5;
        for(let i=1;i<=visible;i++){const a=points[i-1],b=points[i],dx=b.x-a.x,dy=b.y-a.y;
          ctx.beginPath();ctx.moveTo(a.x,a.y);if(this.style==='moon'||this.style==='spirit'){ctx.quadraticCurveTo((a.x+b.x)/2-dy*.15,(a.y+b.y)/2+dx*.15,b.x,b.y);}
          else{for(let j=1;j<5;j++){const t=j/5,z=j%2?7:-7;ctx.lineTo(a.x+dx*t-dy/(Math.hypot(dx,dy)||1)*z,a.y+dy*t+dx/(Math.hypot(dx,dy)||1)*z);}ctx.lineTo(b.x,b.y);}ctx.stroke();const stroke=ctx.strokeStyle;ctx.strokeStyle='#e6f7ff';ctx.lineWidth=1;ctx.stroke();ctx.strokeStyle=stroke;ctx.lineWidth=2.5;
          ctx.fillStyle='#f1fdff';ctx.beginPath();ctx.arc(b.x,b.y,3.5,0,Math.PI*2);ctx.fill();
        }ctx.restore();return;
      }
      const dx=(this.target?this.target.x:this.x)-this.startX,dy=(this.target?this.target.y:this.y)-this.startY,angle=Math.atan2(dy,dx),length=Math.hypot(dx,dy)||1,progress=Math.min(1,Math.hypot(this.x-this.startX,this.y-this.startY)/length);
      if(this.style==='bullet'&&this.flightAge<.1){ctx.save();ctx.translate(this.startX,this.startY-10);ctx.rotate(angle);ctx.fillStyle='#fff0a3';ctx.beginPath();ctx.moveTo(0,-5);ctx.lineTo(22,0);ctx.lineTo(0,5);ctx.fill();ctx.restore();}
      const lift=this.style==='cannon'?Math.sin(progress*Math.PI)*Math.min(65,length*.25):0;
      ctx.translate(this.x,this.y-lift);ctx.rotate(angle);ctx.lineWidth=2;
      if(this.style==='arrow'||this.style==='bullet'){
        ctx.globalAlpha=.7;ctx.beginPath();ctx.moveTo(this.style==='bullet'?-30:-16,0);ctx.lineTo(5,0);ctx.stroke();
        ctx.globalAlpha=1;ctx.fillStyle=this.style==='bullet'?'#fff5c6':'#e9d69f';ctx.beginPath();ctx.moveTo(7,0);ctx.lineTo(-1,-3);ctx.lineTo(-1,3);ctx.fill();
      }else if(this.style==='cannon'||this.style==='explosion'){
        ctx.fillStyle='#36343b';ctx.beginPath();ctx.arc(0,0,6,0,Math.PI*2);ctx.fill();ctx.fillStyle='#ffb44b';ctx.beginPath();ctx.arc(-5,0,3,0,Math.PI*2);ctx.fill();ctx.globalAlpha=.3;ctx.fillStyle='#8b837a';ctx.beginPath();ctx.arc(-14,0,5,0,Math.PI*2);ctx.fill();
      }else if(this.style==='ice'){
        ctx.fillStyle='#bcefff';ctx.beginPath();ctx.moveTo(12,0);ctx.lineTo(-5,-5);ctx.lineTo(-10,0);ctx.lineTo(-5,5);ctx.closePath();ctx.fill();
      }else if(this.style==='nature'){
        ctx.fillStyle='#b1f39b';ctx.beginPath();ctx.ellipse(0,0,10,4,-.3,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#418d61';ctx.beginPath();ctx.moveTo(-8,2);ctx.lineTo(8,-2);ctx.stroke();
      }else if(this.style==='moon'){
        ctx.strokeStyle='#dce8ff';ctx.lineWidth=3;ctx.beginPath();ctx.arc(0,0,10,-1.7,1.7);ctx.stroke();
      }else if(this.style==='lightning'){
        ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(-14,-3);ctx.lineTo(-5,4);ctx.lineTo(0,-4);ctx.lineTo(12,1);ctx.stroke();
      }else{
        ctx.globalAlpha=.3;ctx.beginPath();ctx.ellipse(-9,0,17,6,0,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;ctx.beginPath();ctx.arc(0,0,this.style==='flame'?7:5,0,Math.PI*2);ctx.fill();ctx.fillStyle=this.style==='plague'?'#c0ed69':'#ecf9ff';ctx.beginPath();ctx.arc(2,0,2.5,0,Math.PI*2);ctx.fill();
      }ctx.restore();
    }
  }
  ns.entities.Projectile=Projectile;
})(globalThis.TowerFrontier);
