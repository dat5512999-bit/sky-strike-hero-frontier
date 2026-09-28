(function(ns){
  'use strict';
  // The generated atlas is deliberately 5×5.  It has unused reserve poses in
  // each row, rather than packing effects into a hero cell.  Ground effects are
  // drawn by HeroSkillVFX in world space, so no bright rectangle can frame him.
  const proto=ns.systems.ArtSystem.prototype,prior={drawHero:proto.drawHero,coreStatus:proto.coreStatus,failedAssets:proto.failedAssets,retryFailed:proto.retryFailed};
  const image=art=>art.bullWargod||(art.bullWargod=art.load('assets/td/neutral/bull-wargod-actions-5x5-v1.png'));
  const skillIcons=art=>art.bullWargodSkillIcons||(art.bullWargodSkillIcons=art.load('assets/td/neutral/bull-wargod-skill-icons-v2.png'));
  proto.drawBullWargod=function(ctx,hero){
    const atlas=image(this);skillIcons(this);if(!atlas?.ready)return false;
    const rows={idle:0,walk:1,attack:2,cast:3,hit:4,death:4},row=rows[hero.state]??0,col=Math.max(0,Math.min(4,hero.frame||0)),sw=atlas.width/5,sh=atlas.height/5,height=112,width=height*sw/sh;
    ctx.save();ctx.translate(hero.x,hero.y+12);if(Math.cos(hero.facing)<0)ctx.scale(-1,1);
    // No clip path: the validated per-cell alpha padding is allowed to breathe.
    ctx.drawImage(atlas,col*sw,row*sh,sw,sh,-width/2,12-height,width,height);
    ctx.restore();return true;
  };
  proto.drawHero=function(ctx,hero){return hero.classType==='bull'?this.drawBullWargod(ctx,hero):prior.drawHero.call(this,ctx,hero);};
  proto.coreStatus=function(type){
    if(type!=='bull')return prior.coreStatus.call(this,type);
    const hero=image(this),icons=skillIcons(this),map=this.mapAssets[ns.config.mapId]||this.background,needed=[map,this.enemyActions.grunt,hero,icons],loaded=needed.filter(asset=>asset?.ready).length;
    return {loaded:loaded,total:needed.length,failed:needed.some(asset=>asset?.failed),ready:loaded===needed.length};
  };
  proto.failedAssets=function(){const assets=[image(this),skillIcons(this)];return prior.failedAssets.call(this).concat(assets.filter(asset=>asset.failed));};
  proto.retryFailed=function(){prior.retryFailed.call(this);for(const asset of [image(this),skillIcons(this)])if(asset.failed){asset.failed=false;asset.attempts=0;this.request(asset);}};
})(globalThis.TowerFrontier);
