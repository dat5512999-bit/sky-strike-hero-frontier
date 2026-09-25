(function(ns){
  'use strict';
  const isTideStyle=style=>String(style||'').startsWith('tide')||style==='maelstrom';
  class Projectile{
    constructor(source,target,options){this.owner=source;this.x=source.x;this.y=source.y;this.target=target;Object.assign(this,options);this.style=this.style||((this.attackType==='pierce')?'arrow':this.attackType==='chaos'?'shadow':'energy');if(source?.type?.startsWith('goblin')&&(this.style==='bullet'||this.style==='cannon'))this.style=source.type==='goblinMech'?'goblin-rocket':source.type==='goblinRiveter'?'goblin-rivet':source.type==='goblinGunner'?'goblin-burst':this.style==='cannon'?'goblin-shell':'goblin-shot';this.startX=this.x;this.startY=this.y;this.speed=this.speed||420;this.flightAge=0;this.active=true;}
    update(dt,monsters,onKill,onHit){
      if(!this.active)return;this.flightAge+=dt;if(this.hitResolved){this.trail-=dt;if(this.trail<=0)this.active=false;return;}const target=this.target;if(!target||!target.active){this.active=false;return;}const distance=ns.utils.distance(this,target);const move=this.speed*dt;
      if(distance<=move+target.radius){this.hit(monsters,onKill,onHit);this.active=Boolean(this.chain||this.splash||this.style==='claw'||this.style.startsWith('goblin-')||isTideStyle(this.style));return;}this.x+=(target.x-this.x)/distance*move;this.y+=(target.y-this.y)/distance*move;
    }
    hit(monsters,onKill,onHit){const self=this;let victims=this.splash?monsters.filter(function(m){return m.active&&ns.utils.distance(m,self.target)<=self.splash;}):[this.target];if(this.lineEnd)victims=monsters.filter(m=>m.active&&ns.systems.BattleSynergySystem.lineDistance(m,this.lineStart,this.lineEnd)<30);if(this.chain){victims=[this.target];let bonus=!!(this.arcaneBounce&&this.target.arcaneMark>0),chainLimit=this.chain+(bonus?1:0);let last=this.target;while(victims.length<chainLimit){const candidates=monsters.filter(function(m){return m.active&&!victims.includes(m)&&ns.utils.distance(last,m)<=self.chainRange;}).sort(function(a,b){return ns.utils.distance(last,a)-ns.utils.distance(last,b);});if(!candidates.length)break;last=candidates[0];victims.push(last);if(this.arcaneBounce&&!bonus&&last.arcaneMark>0){bonus=true;chainLimit++;}}}this.hitResolved=true;this.trail=.32;this.chainPoints=[{x:this.startX,y:this.startY-30}].concat(victims.map(function(m){const v=typeof m.visualPosition==='function'?m.visualPosition():{x:m.x,y:m.y};return{x:v.x,y:v.y-30};}));victims.forEach(function(monster,index){if(!monster.active)return;const frostHit=ns.systems.FrostStatusSystem?ns.systems.FrostStatusSystem.beforeHit(monster,self):{rate:1,bonus:0};const wasStronglySlowed=monster.slowTimer>0&&monster.slowFactor<=.8;if(self.slow)monster.applySlow(self.slow,self.slowTime);const table=ns.config.damageMultipliers[self.attackType]||{},heavy=monster.armorType==='heavy'?(self.bonusVsHeavy||1):1,execute=self.executeThreshold&&monster.health/monster.maxHealth<=self.executeThreshold?(self.executeMultiplier||1):1,multiplier=(table[monster.armorType]||1)*(self.chain&&index>0?.7:1)*(wasStronglySlowed?(self.bonusVsSlowed||1):1)*heavy*execute,damage=(self.damage*frostHit.rate+frostHit.bonus)*multiplier,before=typeof monster.effectiveHealth==='function'?monster.effectiveHealth():monster.health,killed=monster.takeDamage(damage,self),after=typeof monster.effectiveHealth==='function'?monster.effectiveHealth():monster.health;if(onHit)onHit(monster,before-after,multiplier>=1.25,self);if(killed&&onKill)onKill(monster,self);if(ns.systems.FrostStatusSystem)ns.systems.FrostStatusSystem.afterHit(monster,self,frostHit,monsters,onKill,onHit);});}
    draw(ctx){
      if(this.style==='claw'){
        if(!this.hitResolved)return;
        const point=(this.chainPoints||[])[1];if(!point)return;
        ctx.save();ctx.translate(point.x,point.y);ctx.globalAlpha=Math.max(0,this.trail/.32);ctx.strokeStyle='#eaffd5';ctx.lineWidth=2;
        for(let i=0;i<3;i++){ctx.beginPath();ctx.moveTo(-10+i*6,-10);ctx.quadraticCurveTo(-2+i*6,0,4+i*6,10);ctx.stroke();}ctx.restore();return;
      }
      if(this.hitResolved&&(this.style.startsWith('goblin-')||isTideStyle(this.style))){
        if(!this.visualChecked){this.visualChecked=true;this.visualSuppressed=!Projectile.claimEffect();}if(this.visualSuppressed)return;
        ctx.save();const x=this.target?.x??this.x,y=this.target?.y??this.y-16,t=1-this.trail/.32;
        if(isTideStyle(this.style)){
          ctx.globalAlpha=Math.max(0,1-t);ctx.strokeStyle='#89fff5';ctx.shadowColor='#46d9df';ctx.shadowBlur=7;ctx.lineWidth=2.4;
          for(let ring=0;ring<2;ring++){ctx.beginPath();ctx.ellipse(x,y-13,10+(30+ring*9)*t,4+(13+ring*5)*t,0,0,Math.PI*2);ctx.stroke();}
          ctx.fillStyle='#c4fffb';for(let i=0;i<5;i++){const a=i*Math.PI*2/5+t*4;ctx.beginPath();ctx.ellipse(x+Math.cos(a)*(12+21*t),y-13+Math.sin(a)*(5+10*t),2.5,1.5,a,0,Math.PI*2);ctx.fill();}
        }else{const explosive=this.style==='goblin-shell'||this.style==='goblin-rocket';ctx.globalAlpha=Math.max(0,1-t);ctx.strokeStyle=explosive?'#ffbd6d':'#b5f8e9';ctx.lineWidth=explosive?4:2;ctx.beginPath();ctx.ellipse(x,y-15,9+(explosive?42:27)*t,5+(explosive?21:13)*t,0,0,Math.PI*2);ctx.stroke();if(this.style==='goblin-rocket'){ctx.strokeStyle='#ff7048';for(let i=0;i<6;i++){const a=i*Math.PI/3;ctx.beginPath();ctx.moveTo(x+Math.cos(a)*12*t,y-15+Math.sin(a)*12*t);ctx.lineTo(x+Math.cos(a)*40*t,y-15+Math.sin(a)*40*t);ctx.stroke();}}}
        ctx.restore();return;
      }
      if(this.hitResolved&&!this.chain)return;
      ctx.save();ctx.strokeStyle=this.color||'#d9f3ff';ctx.fillStyle=this.color||'#d9f3ff';
      if(this.chain&&this.hitResolved){
        const age=1-this.trail/.32,points=this.chainPoints||[],visible=Math.min(points.length-1,Math.ceil(age*points.length*2)+1);
        if(!this.visualChecked){this.visualChecked=true;this.visualSuppressed=!Projectile.claimEffect();}if(this.visualSuppressed){ctx.restore();return;}
        ctx.globalAlpha=Math.min(1,this.trail/.12);ctx.lineWidth=this.weaponProc==='chain'?3.5:2.5;
        for(let i=1;i<=visible;i++){const a=points[i-1],b=points[i],dx=b.x-a.x,dy=b.y-a.y;
          ctx.beginPath();ctx.moveTo(a.x,a.y);if(this.style==='moon'||this.style==='spirit'||this.style==='tide-chain'||this.style==='tide-glaive'){const wave=isTideStyle(this.style)?.22:.15;ctx.quadraticCurveTo((a.x+b.x)/2-dy*wave,(a.y+b.y)/2+dx*wave,b.x,b.y);}
          else{for(let j=1;j<5;j++){const t=j/5,z=j%2?7:-7;ctx.lineTo(a.x+dx*t-dy/(Math.hypot(dx,dy)||1)*z,a.y+dy*t+dx/(Math.hypot(dx,dy)||1)*z);}ctx.lineTo(b.x,b.y);}ctx.stroke();const stroke=ctx.strokeStyle;ctx.strokeStyle='#e6f7ff';ctx.lineWidth=1;ctx.stroke();ctx.strokeStyle=stroke;ctx.lineWidth=2.5;
          ctx.fillStyle=this.style==='tide-chain'||this.style==='tide-glaive'?'#b8fff6':'#f1fdff';ctx.beginPath();ctx.arc(b.x,b.y,3.5,0,Math.PI*2);ctx.fill();
        }ctx.restore();return;
      }
      const dx=(this.target?this.target.x:this.x)-this.startX,dy=(this.target?this.target.y:this.y)-this.startY,angle=Math.atan2(dy,dx),length=Math.hypot(dx,dy)||1,progress=Math.min(1,Math.hypot(this.x-this.startX,this.y-this.startY)/length);
      if(this.style==='bullet'&&this.flightAge<.1){ctx.save();ctx.translate(this.startX,this.startY-10);ctx.rotate(angle);ctx.fillStyle='#fff0a3';ctx.beginPath();ctx.moveTo(0,-5);ctx.lineTo(22,0);ctx.lineTo(0,5);ctx.fill();ctx.restore();}
      const lift=this.style==='cannon'?Math.sin(progress*Math.PI)*Math.min(65,length*.25):0;
      ctx.translate(this.x,this.y-lift);ctx.rotate(angle);ctx.lineWidth=2;
      if(this.style==='goblin-shot'||this.style==='goblin-burst'||this.style==='goblin-rivet'){const heavy=this.style==='goblin-rivet';ctx.strokeStyle=heavy?'#a8f7ff':'#78d9c6';ctx.lineWidth=heavy?4:3;ctx.globalAlpha=.6;ctx.beginPath();ctx.moveTo(heavy?-42:-28,0);ctx.lineTo(0,0);ctx.stroke();ctx.globalAlpha=1;ctx.fillStyle=heavy?'#c8f8ff':'#ffe2a1';ctx.fillRect(-1,heavy?-3:-2,heavy?18:12,heavy?6:4);ctx.fillStyle='#77e8d5';ctx.fillRect(-5,-3,5,6);if(this.style==='goblin-burst'){ctx.fillStyle='#ffb45f';ctx.fillRect(-13,-7,7,3);ctx.fillRect(-15,5,7,3);}
      }else if(this.style==='goblin-shell'||this.style==='goblin-rocket'){ctx.globalAlpha=.35;ctx.fillStyle=this.style==='goblin-rocket'?'#ff8b51':'#8caca8';ctx.beginPath();ctx.ellipse(-17,0,16,8,0,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;ctx.fillStyle='#b6814e';ctx.fillRect(-10,-6,18,12);ctx.fillStyle='#ffe0a1';ctx.beginPath();ctx.moveTo(15,0);ctx.lineTo(7,-6);ctx.lineTo(7,6);ctx.fill();
      }else if(this.style==='arrow'||this.style==='bullet'){
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
      }else if(isTideStyle(this.style)){
        const spear=this.style==='tide-spear'||this.style==='tide-glaive',ripple=this.style==='maelstrom'||this.style==='tide-splash';ctx.shadowColor='#42d9de';ctx.shadowBlur=8;ctx.strokeStyle='#91fff3';ctx.fillStyle='#bffdf7';ctx.lineWidth=spear?3:2;
        if(spear){ctx.beginPath();ctx.moveTo(-13,0);ctx.lineTo(9,0);ctx.stroke();ctx.beginPath();ctx.moveTo(11,0);ctx.lineTo(2,-6);ctx.lineTo(2,6);ctx.closePath();ctx.fill();}
        else{ctx.beginPath();ctx.ellipse(0,0,ripple?10:7,ripple?4:3,0,0,Math.PI*2);ctx.fill();ctx.globalAlpha=.45;ctx.beginPath();ctx.ellipse(-9,0,15,5,0,0,Math.PI*2);ctx.stroke();}
      }else if(this.style==='lightning'){
        ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(-14,-3);ctx.lineTo(-5,4);ctx.lineTo(0,-4);ctx.lineTo(12,1);ctx.stroke();
      }else{
        ctx.globalAlpha=.3;ctx.beginPath();ctx.ellipse(-9,0,17,6,0,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;ctx.beginPath();ctx.arc(0,0,this.style==='flame'?7:5,0,Math.PI*2);ctx.fill();ctx.fillStyle=this.style==='plague'?'#c0ed69':'#ecf9ff';ctx.beginPath();ctx.arc(2,0,2.5,0,Math.PI*2);ctx.fill();
      }ctx.restore();
    }
  }
  Projectile.beginFrame=function(limit){Projectile.effectBudget=Math.max(0,limit||0);};
  Projectile.claimEffect=function(){if(Projectile.effectBudget===undefined)return true;if(Projectile.effectBudget<=0)return false;Projectile.effectBudget-=1;return true;};
  ns.entities.Projectile=Projectile;
})(globalThis.TowerFrontier);
