(function(ns){
  'use strict';
  // One moving ground wave. Combat and drawing share the same world-space front.
  class ChiefShockwave{
    constructor(hero){
      const target=hero.pendingTarget?.active&&ns.utils.distance(hero,hero.pendingTarget)<=340
        ?hero.pendingTarget:null;
      const angle=target?Math.atan2(target.y-hero.y,target.x-hero.x):hero.facing||0;
      this.owner=hero;this.x=hero.x;this.y=hero.y;this.dx=Math.cos(angle);this.dy=Math.sin(angle);
      this.travel=0;this.range=340;this.speed=450;this.halfWidth=34+(hero.equipment.charm>=3?8:0);
      this.damage=70*hero.skillPower()*(1+hero.equipment.charm*.2);
      this.age=0;this.active=true;this.hit=new Set();
    }
    update(dt,monsters,onKill,onHit){
      if(!this.active||dt<=0)return;
      const previous=this.travel;
      this.travel=Math.min(this.range,this.travel+this.speed*dt);this.age+=dt;
      for(const enemy of monsters){
        if(!enemy.active||this.hit.has(enemy))continue;
        const rx=enemy.x-this.x,ry=enemy.y-this.y,along=rx*this.dx+ry*this.dy;
        const lateral=Math.abs(rx*this.dy-ry*this.dx),radius=enemy.radius||0;
        if(along<Math.max(0,previous-24)-radius||along>this.travel+radius||lateral>this.halfWidth+radius)continue;
        this.hit.add(enemy);
        // Use the normal damage pipeline for armor, reward, battle report and kill credit.
        new ns.entities.Projectile(this.owner,enemy,{damage:this.damage,color:'#ff9b49',attackType:'chaos',slow:.65,slowTime:1.5}).hit(monsters,onKill,onHit);
      }
      if(this.travel>=this.range)this.active=false;
    }
    draw(ctx){
      const head=this.travel,tail=Math.max(0,head-122),fade=Math.min(1,(this.range-head)/58,.35+this.age*7);
      if(fade<=0)return;
      ctx.save();ctx.translate(this.x,this.y);ctx.rotate(Math.atan2(this.dy,this.dx));ctx.lineCap='round';ctx.lineJoin='round';
      const glow=ctx.createLinearGradient(tail,0,head+18,0);
      glow.addColorStop(0,'rgba(255,127,38,0)');glow.addColorStop(.6,'rgba(236,91,24,.28)');glow.addColorStop(1,'rgba(255,191,84,.54)');
      ctx.globalAlpha=fade;ctx.fillStyle=glow;ctx.beginPath();ctx.moveTo(tail,0);
      ctx.lineTo(head-60,-15);ctx.lineTo(head-25,-this.halfWidth);ctx.lineTo(head+10,-this.halfWidth-15);
      ctx.lineTo(head+24,0);ctx.lineTo(head+10,this.halfWidth+15);ctx.lineTo(head-25,this.halfWidth);
      ctx.lineTo(head-60,15);ctx.closePath();ctx.fill();
      // A wide broken seam with hot edges stays locked to the moving hit front.
      for(const side of [-1,1]){
        const points=[];for(let i=0;i<=9;i++){const p=tail+(head-tail)*i/9;points.push([p,side*(5+i*2.2+(i%3===1?7:i%3===2?-3:0))]);}
        for(const [width,color,alpha] of [[11,'#301c17',.86],[5,'#a8421f',.92],[2,'#ffd889',1]]){
          ctx.globalAlpha=fade*alpha;ctx.strokeStyle=color;ctx.lineWidth=width;ctx.beginPath();
          points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.stroke();
        }
        ctx.strokeStyle='#d47838';ctx.lineWidth=3;ctx.globalAlpha=fade*.8;
        for(let i=2;i<8;i+=2){const [px,py]=points[i];ctx.beginPath();ctx.moveTo(px,py);ctx.lineTo(px-11,py+side*12);ctx.lineTo(px-5,py+side*21);ctx.stroke();}
      }
      ctx.globalAlpha=fade*.42;ctx.fillStyle='#3c241c';ctx.beginPath();ctx.ellipse(head-3,0,28,this.halfWidth+17,0,0,Math.PI*2);ctx.fill();
      for(const [width,color,alpha] of [[15,'#71391f',.65],[8,'#ff8531',.92],[3,'#ffe4a1',1]]){
        ctx.globalAlpha=fade*alpha;ctx.strokeStyle=color;ctx.lineWidth=width;ctx.beginPath();
        ctx.ellipse(head,0,17,this.halfWidth+17,0,-Math.PI*.49,Math.PI*.49);ctx.stroke();
      }
      // Faceted rocks lift at the front, then fall through the amber dust.
      for(let i=0;i<12;i++){
        const side=i%2?1:-1,lag=(i*29+this.age*42)%94,px=head-lag,py=side*(9+(i%4)*11),size=5+(i%3)*3;
        ctx.save();ctx.translate(px,py-8-(i%4)*3);ctx.rotate(i*1.4+this.age*2);
        ctx.globalAlpha=fade*(.52+(i%3)*.13);ctx.fillStyle=i%2?'#544036':'#7d5c47';ctx.strokeStyle='#e6a566';ctx.lineWidth=1;
        ctx.beginPath();ctx.moveTo(-size,-size*.4);ctx.lineTo(-size*.3,-size);ctx.lineTo(size*.8,-size*.7);ctx.lineTo(size,size*.5);ctx.lineTo(-size*.5,size);ctx.closePath();ctx.fill();ctx.stroke();
        ctx.fillStyle='#c49363';ctx.beginPath();ctx.moveTo(-size*.3,-size);ctx.lineTo(size*.8,-size*.7);ctx.lineTo(0,0);ctx.closePath();ctx.fill();ctx.restore();
      }
      ctx.restore();
    }
  }
  ns.systems.ChiefShockwave=ChiefShockwave;
})(globalThis.TowerFrontier);
