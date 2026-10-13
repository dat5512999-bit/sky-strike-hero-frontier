(function(ns){
  'use strict';
  const proto=ns.systems.ArtSystem.prototype;
  const prior={drawHero:proto.drawHero,coreStatus:proto.coreStatus,failedAssets:proto.failedAssets,retryFailed:proto.retryFailed};
  const rows={idle:0,walk:1,attack:2,cast:3,hit:0};
  proto.preloadHeroEvolution=function(type,rank){
    const form=ns.systems.HeroEvolutionSpriteAtlas[type]?.[rank];if(!form)return null;
    this.heroEvolutionImages ||= {};
    return this.heroEvolutionImages[form.path]||(this.heroEvolutionImages[form.path]=this.load(form.path));
  };
  proto.drawHeroEvolutionSprite=function(ctx,hero){
    const rank=ns.systems.HeroEvolutionSystem.rank(hero),form=ns.systems.HeroEvolutionSpriteAtlas[hero.classType]?.[rank];
    if(!form||this.cosmeticEquipped?.['hero:'+hero.classType]||hero.evolutionVisualDisabledRank===rank)return false;
    const atlas=this.preloadHeroEvolution(hero.classType,rank);if(!atlas?.ready)return false;
    const row=rows[hero.state]??0;
    let col=Number.isFinite(hero.frame)?Math.max(0,Math.min(3,Math.floor(hero.frame))):0;
    if(hero.state==='idle')col=Math.floor(Math.max(0,hero.animationTime||0)*3)%4;
    const [x,y,w,h,fx,fy]=form.frames[row*4+col],scale=form.worldHeight/form.visible;
    ctx.save();try{
      ctx.translate(hero.x,hero.y+12);if(Math.cos(hero.facing||0)<0)ctx.scale(-1,1);
      ctx.drawImage(atlas,x,y,w,h,(x-fx)*scale,(y-fy)*scale,w*scale,h*scale);
      // Keep existing equipped-item overlays in hero-local coordinates. Weapon
      // upgrades retain their combat signature through Hero.draw as before.
      ctx.translate(0,-12);this.drawGearPieces(ctx,hero,false);
    }finally{ctx.restore();}
    return true;
  };
  proto.drawHero=function(ctx,hero){return proto.drawHeroEvolutionSprite.call(this,ctx,hero)||prior.drawHero.call(this,ctx,hero);};
  proto.coreStatus=function(type){
    if(ns.systems.HeroEvolutionSpriteAtlas[type]){this.preloadHeroEvolution(type,1);this.preloadHeroEvolution(type,2);}
    return prior.coreStatus.call(this,type);
  };
  proto.failedAssets=function(){return [...new Set(prior.failedAssets.call(this).concat(Object.values(this.heroEvolutionImages||{}).filter(image=>image.failed)))];};
  proto.retryFailed=function(){prior.retryFailed.call(this);for(const image of Object.values(this.heroEvolutionImages||{}))if(image.failed){image.failed=false;image.attempts=0;this.request(image);}};
})(globalThis.TowerFrontier);
