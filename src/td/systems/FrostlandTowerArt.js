(function(ns){
  'use strict';
  // Shared painted atlas for construction cards and battlefield towers. Motion is
  // presentation-only: it never changes collision positions or attack timing.
  const Art=ns.systems.ArtSystem, proto=Art.prototype;
  const cells={frostCrystal:0,frostBlizzard:1,frostBallista:2,frostTotem:3,frostObelisk:4,frostAurora:5,frostGlacier:6};
  const path='assets/td/frostland/towers-atlas-v1.png';
  function atlas(art){
    if(!art.frostTowerAtlas){
      const image=art.frostTowerAtlas=art.load(path);
      image.addEventListener?.('load',()=>{
        for(const type of Object.keys(cells))art.previewCache?.delete('building:'+type);
        if(typeof document!=='undefined')document.querySelectorAll('[data-build-type]').forEach(button=>{if(button.dataset.buildType in cells)delete button.dataset.previewReady;});
        art.game?.refreshRosterPreviews?.();
      });
    }
    return art.frostTowerAtlas;
  }
  const previous=proto.drawBuilding;
  proto.drawBuilding=function(ctx,type,x,y,level,branch,motion){
    if(!(type in cells))return previous.call(this,ctx,type,x,y,level,branch,motion);
    const image=atlas(this);if(!image.ready)return false;
    const cell=cells[type],sw=image.width/4,sh=image.height/2;
    const age=motion?.visualAge??2,built=Math.min(1,age/.65),fire=motion?.fireFlash||0;
    const h=132*(1+Math.min(4,(level||1)-1)*.035),w=h*sw/sh;
    ctx.save();ctx.translate(x,y+18);
    ctx.globalAlpha*=.4+.6*built;ctx.scale(1, .55+.45*(1-Math.pow(1-built,3)));
    ctx.fillStyle='#061d2c55';ctx.beginPath();ctx.ellipse(0,-4,44,15,0,0,Math.PI*2);ctx.fill();
    if(fire){ctx.translate(-Math.cos(motion.aim||0)*fire*9,-Math.sin(motion.aim||0)*fire*5);}
    ctx.drawImage(image,(cell%4)*sw,Math.floor(cell/4)*sh,sw,sh,-w/2,-h,w,h);
    if(motion){
      const pulse=.5+.5*Math.sin(age*2.8+cell),glow=ctx.createRadialGradient(0,-h*.62,1,0,-h*.62,18+fire*35);
      glow.addColorStop(0,'rgba(218,255,255,'+(.16+pulse*.18+fire*.5)+')');glow.addColorStop(1,'rgba(70,220,255,0)');
      ctx.globalCompositeOperation='lighter';ctx.fillStyle=glow;ctx.fillRect(-60,-h,120,h);
      if(fire){ctx.strokeStyle='#d5ffff';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(0,-h*.65,10+(1-fire)*32,5+(1-fire)*14,0,0,Math.PI*2);ctx.stroke();}
      if(type==='frostTotem'){
        // The totem never fires. Its restrained, low-frequency rings make the
        // Frost-generation aura readable without pretending it is a damage tower.
        const aura=.5+.5*Math.sin(age*2.1);ctx.globalAlpha*=.3+.28*aura;ctx.globalCompositeOperation='lighter';ctx.strokeStyle='#b7f4ff';ctx.lineWidth=1.5;
        for(let ring=0;ring<2;ring++){ctx.beginPath();ctx.ellipse(0,-7,22+ring*13+aura*5,7+ring*4+aura*2,0,0,Math.PI*2);ctx.stroke();}
        for(let rune=0;rune<4;rune++){const a=age*1.1+rune*Math.PI/2;ctx.fillStyle='#dcffff';ctx.beginPath();ctx.arc(Math.cos(a)*(25+aura*4),-7+Math.sin(a)*(9+aura*2),1.8,0,Math.PI*2);ctx.fill();}
      }
      if(built<1){ctx.globalAlpha*=1-built;ctx.strokeStyle='#a4f4ff';ctx.lineWidth=3;ctx.beginPath();ctx.ellipse(0,-3,48*built,18*built,0,0,Math.PI*2);ctx.stroke();for(let i=0;i<8;i++){const a=i*Math.PI/4;ctx.fillStyle='#d6ffff';ctx.fillRect(Math.cos(a)*38,-built*100+(i%3)*10,2,9);}}
    }
    ctx.restore();return true;
  };
  for(const type of Object.keys(cells))Art.PREVIEW_BOUNDS['building:'+type]={left:124,top:152,width:136,height:136};
  const preload=proto.preloadFaction;
  proto.preloadFaction=function(type){if(type==='frostland')atlas(this);return preload.apply(this,arguments);};
  const core=proto.coreStatus;
  proto.coreStatus=function(type){const status=core.apply(this,arguments);if(type==='frostland'){const images=[atlas(this),this.frostSpellAtlas||(this.frostSpellAtlas=this.load('assets/td/frostland/spell-effects-v1.png'))];for(const image of images){status.total++;if(image.ready)status.loaded++;status.failed=status.failed||image.failed;status.ready=status.ready&&image.ready;}}return status;};
  const failed=proto.failedAssets;
  proto.failedAssets=function(){const list=failed.apply(this,arguments);for(const image of [this.frostTowerAtlas,this.frostSpellAtlas])if(image?.failed)list.push(image);return list;};
  const retry=proto.retryFailed;
  proto.retryFailed=function(){if(this.frostTowerAtlas?.failed)this.frostTowerAtlas=null;if(this.frostSpellAtlas?.failed)this.frostSpellAtlas=null;return retry.apply(this,arguments);};
  Art.FROST_TOWER_CELLS=cells;
})(globalThis.TowerFrontier);
