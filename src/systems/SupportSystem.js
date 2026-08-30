(function (ns) {
  'use strict';
  class SupportSystem {
    constructor(){this.reset();}
    reset(){this.cloneLevel=0;this.familiarLevel=0;this.cloneCooldown=0;this.familiarCooldown=0;this.time=0;}
    isSupport(type){return type==='mirror'||type==='familiar';}
    collect(type){
      if(type==='mirror'){this.cloneLevel=Math.min(3,this.cloneLevel+1);return{label:'◈ 鏡像僚機 Lv.'+this.cloneLevel,color:'#72e9ff'};}
      if(type==='familiar'){this.familiarLevel=Math.min(3,this.familiarLevel+1);return{label:'✦ 星靈戰寵 Lv.'+this.familiarLevel,color:'#ffe178'};}
      return{label:'',color:'#fff'};
    }
    clonePositions(player){
      if(!this.cloneLevel)return[];
      const count=this.cloneLevel>=2?2:1;
      if(count===1)return[{x:player.x-42,y:player.y+18}];
      return[{x:player.x-42,y:player.y+18},{x:player.x+42,y:player.y+18}];
    }
    familiarPosition(player){return{x:player.x+Math.cos(this.time*2.4)*54,y:player.y-8+Math.sin(this.time*2.4)*24};}
    update(dt,player,enemies,bullets){
      this.time+=dt;this.cloneCooldown-=dt;this.familiarCooldown-=dt;
      if(this.cloneLevel&&this.cloneCooldown<=0){
        this.clonePositions(player).forEach(function(pos){bullets.push(new ns.entities.Bullet(pos.x,pos.y-12,{damage:.42+this.cloneLevel*.11,variant:0}));},this);
        this.cloneCooldown=.36-this.cloneLevel*.055;
      }
      if(this.familiarLevel&&this.familiarCooldown<=0){
        const targets=enemies.filter(function(enemy){return enemy.active;}).sort(function(a,b){return a.y-b.y;});
        if(targets.length){
          const pos=this.familiarPosition(player);const target=targets[0];const angle=Math.atan2(target.y-pos.y,target.x-pos.x);const speed=520;
          bullets.push(new ns.entities.Bullet(pos.x,pos.y,{vx:Math.cos(angle)*speed,vy:Math.sin(angle)*speed,damage:.55+this.familiarLevel*.18,variant:1}));
          this.familiarCooldown=.78-this.familiarLevel*.1;
        }
      }
    }
    draw(ctx,player){
      this.clonePositions(player).forEach(function(pos,index){ctx.save();ctx.translate(pos.x,pos.y);ctx.globalAlpha=.62;ctx.shadowColor='#72e9ff';ctx.shadowBlur=13;ctx.fillStyle='#bff7ff';ctx.beginPath();ctx.moveTo(0,-15);ctx.lineTo(13,11);ctx.lineTo(3,7);ctx.lineTo(0,15);ctx.lineTo(-3,7);ctx.lineTo(-13,11);ctx.closePath();ctx.fill();ctx.strokeStyle='#72e9ff';ctx.stroke();ctx.globalAlpha=.35;ctx.fillStyle='#72e9ff';ctx.fillRect(index?5:-7,13,2,13);ctx.restore();});
      if(this.familiarLevel){const pos=this.familiarPosition(player);ctx.save();ctx.translate(pos.x,pos.y);ctx.rotate(this.time*2);ctx.globalCompositeOperation='lighter';ctx.shadowColor='#ffe178';ctx.shadowBlur=18;ctx.fillStyle='#fff6bf';ctx.beginPath();ctx.arc(0,0,7,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#ffe178';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(0,-15);ctx.lineTo(5,-7);ctx.lineTo(15,0);ctx.lineTo(5,7);ctx.lineTo(0,15);ctx.lineTo(-5,7);ctx.lineTo(-15,0);ctx.lineTo(-5,-7);ctx.closePath();ctx.stroke();ctx.restore();}
    }
    status(){const labels=[];if(this.cloneLevel)labels.push('◈分身 L'+this.cloneLevel);if(this.familiarLevel)labels.push('✦戰寵 L'+this.familiarLevel);return labels.length?labels.join(' · '):'支援：等待核心';}
  }
  ns.systems.SupportSystem=SupportSystem;
})(globalThis.SkyStrike);
