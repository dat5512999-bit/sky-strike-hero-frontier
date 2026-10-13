(function(ns){
  'use strict';
  // Dedicated enemy presentation using the approved neutral fire-demon atlas.
  // This does not call the mercenary renderer: no friendly rank badge or gear.
  const prior=ns.systems.ArtSystem.prototype.drawMonster;
  class EvolutionTrialArt{
    static draw(art,ctx,monster){
      if(!monster.evolutionTrial||monster.trialAppearance!=='fire-demon')return false;
      const image=art.actionImage('fireDemon'),profile=ns.systems.NeutralMercenaryArt.PROFILES.fireDemon;
      if(!image?.ready)return false;
      let frame=Math.max(0,Math.floor(monster.frame||0))%4;
      const row=monster.state==='cast'?3:monster.state==='attack'||monster.state==='hit'?2:monster.state==='walk'?1:0;
      if(monster.state==='death')frame=0; // Normal corpse fade; never use a channel pose as death.
      const index=row*4+frame,x0=Math.floor(frame*image.width/4),x1=Math.floor((frame+1)*image.width/4),y0=Math.floor(row*image.height/4),y1=Math.floor((row+1)*image.height/4);
      const height=monster.trialStage===2?122:114,scale=height/profile.maxHeight*1254/image.height;
      ctx.save();try{
        ctx.translate(monster.x,monster.y);
        if(monster.state!=='death'){
          ctx.fillStyle='rgba(40,10,3,.3)';ctx.beginPath();ctx.ellipse(0,5,32,10,0,0,Math.PI*2);ctx.fill();
          ctx.strokeStyle=monster.trialStage===2?'#ffd278':'#ef763d';ctx.lineWidth=monster.trialStage===2?2:1.3;
          ctx.beginPath();ctx.ellipse(0,5,34,11,0,0,Math.PI*2);ctx.stroke();
        }
        if(Math.cos(monster.facing||0)<0)ctx.scale(-1,1);
        ctx.drawImage(image,x0+4,y0+4,x1-x0-8,y1-y0-8,(-(x1-x0)/2+4)*scale,12-(profile.feet[index]*image.height/1254-4)*scale,(x1-x0-8)*scale,(y1-y0-8)*scale);
      }finally{ctx.restore();}return true;
    }
  }
  ns.systems.EvolutionTrialArt=EvolutionTrialArt;
  ns.systems.ArtSystem.prototype.drawMonster=function(ctx,monster){return EvolutionTrialArt.draw(this,ctx,monster)||prior.call(this,ctx,monster);};
})(globalThis.TowerFrontier);
