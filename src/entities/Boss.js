(function (ns) {
  'use strict';
  class Boss extends ns.entities.Enemy {
    constructor(wave,mode){
      const major=wave%10===0;const health=Math.round((major?92:62)+wave*3.6);
      super(ns.config.width/2,-80,{type:'boss',width:major?126:108,height:major?96:82,health:health,score:(major?5000:2600)+wave*80,speed:72});
      this.wave=wave;this.major=major;this.fireCooldown=1.2;this.phase=1;this.previousPhase=1;this.phaseChanged=false;this.entered=false;
    }
    update(dt,context){
      const speedScale=context&&context.enemySpeed?context.enemySpeed:1;this.time+=dt;this.hitFlash=Math.max(0,this.hitFlash-dt);
      if(this.y<112){this.y+=this.speed*dt;return;}
      this.entered=true;this.previousPhase=this.phase;this.phase=this.health<=this.maxHealth*.32?3:(this.health<=this.maxHealth*.66?2:1);this.phaseChanged=this.phase!==this.previousPhase;
      this.x=ns.config.width/2+Math.sin(this.time*(this.major?.7:.95))*135;
      this.fireCooldown-=dt*speedScale*(context&&context.enemyFireRate?context.enemyFireRate:1);
      if(this.fireCooldown<=0&&context&&context.enemyBullets){this.shootPattern(context.enemyBullets,context.player);this.fireCooldown=[0,1.15,.78,.48][this.phase];}
    }
    shootPattern(bullets,player){
      const speed=145+this.wave*1.5;const count=(this.phase===1?6:(this.phase===2?9:14))+(this.major?2:0);const spread=this.phase===3?Math.PI*1.72:(this.phase===2?1.55:1.05);
      const aimed=player?Math.atan2(player.y-this.y,player.x-this.x):Math.PI/2;
      for(let i=0;i<count;i+=1){const ratio=count===1?.5:i/(count-1);const center=this.phase===3?Math.PI/2+this.time*.28:aimed;const angle=center-spread/2+ratio*spread;bullets.push(new ns.entities.EnemyBullet(this.x,this.y+28,Math.cos(angle)*speed,Math.sin(angle)*speed));}
    }
    draw(ctx){
      const color=this.major?'#ffb23e':'#ff416d';ctx.save();ctx.translate(this.x,this.y);ctx.shadowColor=color;ctx.shadowBlur=20;
      const hull=ctx.createLinearGradient(-55,-35,55,40);hull.addColorStop(0,'#ffd1da');hull.addColorStop(.22,color);hull.addColorStop(1,'#3d0820');ctx.fillStyle=hull;
      ctx.beginPath();ctx.moveTo(0,44);ctx.lineTo(18,20);ctx.lineTo(58,31);ctx.lineTo(48,2);ctx.lineTo(25,-27);ctx.lineTo(9,-19);ctx.lineTo(0,-43);ctx.lineTo(-9,-19);ctx.lineTo(-25,-27);ctx.lineTo(-48,2);ctx.lineTo(-58,31);ctx.lineTo(-18,20);ctx.closePath();ctx.fill();
      ctx.strokeStyle='#fff';ctx.globalAlpha=.6;ctx.lineWidth=2;ctx.stroke();ctx.globalAlpha=1;ctx.fillStyle=this.phase===3?'#fff':'#ffd861';ctx.beginPath();ctx.arc(0,4,12+Math.sin(this.time*5)*2,0,Math.PI*2);ctx.fill();ctx.fillStyle='#3d0820';ctx.beginPath();ctx.arc(0,4,6,0,Math.PI*2);ctx.fill();
      if(this.hitFlash>0){ctx.globalCompositeOperation='screen';ctx.globalAlpha=this.hitFlash*7;ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(0,0,58,0,Math.PI*2);ctx.fill();}ctx.restore();
      ctx.save();const width=300;ctx.fillStyle='rgba(0,0,0,.78)';ctx.fillRect((ns.config.width-width)/2,48,width,11);ctx.fillStyle=color;ctx.shadowColor=color;ctx.shadowBlur=8;ctx.fillRect((ns.config.width-width)/2+2,50,(width-4)*(this.health/this.maxHealth),7);ctx.restore();
    }
  }
  ns.entities.Boss = Boss;
})(globalThis.SkyStrike);
