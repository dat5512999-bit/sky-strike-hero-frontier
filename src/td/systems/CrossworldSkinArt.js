(function(ns){
  'use strict';
  // These atlases deliberately remain separate from the base faction renderers:
  // purchasing a skin never changes a hero's stats, skill timings, or equipment.
  const Art=ns.systems.ArtSystem,proto=Art.prototype,previous=proto.drawHero;
  const skins={
    arcanist:{id:'starshield-patrol',path:'assets/td/shop/starshield-patrol-actions-v1.png',height:112,foot:.8,y:12},
    hunter:{id:'tigerstripe-vanguard',path:'assets/td/shop/tigerstripe-vanguard-actions-v1.png',height:112,foot:.8,y:12},
    rogue:{id:'neon-webrunner',path:'assets/td/shop/neon-webrunner-actions-v1.png',height:112,foot:.8,y:12},
    frostland:{id:'north-rescue',path:'assets/td/shop/north-rescue-actions-v1.png',height:108,foot:.8,y:12},
    naga:{id:'abyss-response',path:'assets/td/shop/abyss-response-actions-v1.png',height:108,foot:.8,y:12},
    goblin:{id:'special-maintenance',path:'assets/td/shop/special-maintenance-actions-v1.png',height:96,foot:.84,y:10},
    chief:{id:'night-owl-warden',path:'assets/td/shop/night-owl-warden-actions-v1.png',height:112,foot:.82,y:12}
  };
  function asset(art,path){
    art.crossworldSkinImages ||= {};
    return art.crossworldSkinImages[path]||(art.crossworldSkinImages[path]=art.load(path));
  }
  function rowFor(hero){return {idle:0,walk:1,attack:2,cast:3,hit:3,death:3}[hero.state]??0;}
  proto.drawHero=function(ctx,hero){
    const skin=skins[hero.classType];
    if(!skin||this.cosmeticEquipped?.['hero:'+hero.classType]!==skin.id)return previous.call(this,ctx,hero);
    const atlas=asset(this,skin.path);
    if(!atlas?.ready)return previous.call(this,ctx,hero);
    const cellW=atlas.width/4,cellH=atlas.height/4,height=skin.height,width=height*cellW/cellH;
    const frame=Math.max(0,Math.min(3,hero.frame||0));
    ctx.save();
    ctx.translate(hero.x,hero.y+skin.y);
    if(Math.cos(hero.facing||0)<0)ctx.scale(-1,1);
    ctx.drawImage(atlas,frame*cellW,rowFor(hero)*cellH,cellW,cellH,-width/2,-height*skin.foot,width,height);
    ctx.restore();
    return true;
  };
  ns.systems.CrossworldSkinArt={skins};
})(globalThis.TowerFrontier);
