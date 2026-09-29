(function(ns){
  'use strict';
  // Measured from the visible alpha body (alpha > 50) of each 1254px 4x4 sheet.
  // Generated PNGs contain alpha=1 transparency residue; a 4px source inset removes
  // seam dust only. All character/weapon pixels have independently tested gutters.
  const PROFILES=Object.freeze({
    bountyHunter:{height:60,maxHeight:199,feet:[286,287,286,287,277,279,276,276,259,259,259,259,236,236,236,236]},
    powderThrower:{height:60,maxHeight:185,feet:[280,280,280,280,277,278,278,275,267,266,265,266,237,237,237,237]},
    fireDemon:{height:104,maxHeight:185,feet:[265,265,264,265,264,263,262,264,254,250,251,252,215,220,224,222]},
    frostWyrm:{height:105,maxHeight:201,feet:[278,278,278,277,271,271,270,270,263,264,264,264,249,251,252,251]}
  });
  class NeutralMercenaryArt{
    static has(type){return Object.hasOwn(PROFILES,type);}
    static pose(unit,cfg){
      let row={idle:0,walk:1,attack:2,hit:3,death:3}[unit.state]||0;
      let frame=Math.max(0,Math.min(3,Math.floor(unit.frame||0)));
      // Reload/channel has its own four frames after a real attack. No new timer,
      // projectile, canvas or pixel readback is allocated by the renderer.
      if(row===0&&unit.strikes>0&&unit.cooldown>cfg.interval-.85){row=3;frame=Math.min(3,Math.floor(Math.max(0,cfg.interval-unit.cooldown-.38)*9));}
      return row*4+frame;
    }
    static draw(art,ctx,unit,image){
      const p=PROFILES[unit.type];if(!p||!image?.ready)return false;
      const cfg=unit.config(),index=this.pose(unit,cfg),col=index%4,row=Math.floor(index/4);
      const x0=Math.floor(col*image.width/4),y0=Math.floor(row*image.height/4),x1=Math.floor((col+1)*image.width/4),y1=Math.floor((row+1)*image.height/4);
      const scale=p.height/p.maxHeight*1254/image.height,sw=x1-x0-8,sh=y1-y0-8;
      ctx.save();try{
        ctx.translate(unit.x,unit.y);if(Math.cos(unit.facing||0)<0)ctx.scale(-1,1);
        ctx.drawImage(image,x0+4,y0+4,sw,sh,(-(x1-x0)/2+4)*scale,12-(p.feet[index]*image.height/1254-4)*scale,sw*scale,sh*scale);
        art.drawGearPieces(ctx,unit,false);
      }finally{ctx.restore();}
      art.drawRank(ctx,unit.x,unit.y,unit.level||1,cfg.color,false,unit.type);return true;
    }
  }
  NeutralMercenaryArt.PROFILES=PROFILES;
  ns.systems.NeutralMercenaryArt=NeutralMercenaryArt;
  ns.systems.ArtSystem.UNIT_HEIGHTS=Object.freeze({...ns.systems.ArtSystem.UNIT_HEIGHTS,...Object.fromEntries(Object.entries(PROFILES).map(([id,p])=>[id,p.height]))});
  const idleBodies={bountyHunter:[73,101,264,286],powderThrower:[120,100,221,280],fireDemon:[97,93,237,265],frostWyrm:[57,90,266,278]};
  for(const [type,p]of Object.entries(PROFILES)){
    const [x0,y0,x1,y1]=idleBodies[type],scale=p.height/p.maxHeight;
    ns.systems.ArtSystem.PREVIEW_BOUNDS['unit:'+type]={left:Math.floor(192+(x0-156.5)*scale)-3,top:Math.floor(282-(y1-y0)*scale)-3,width:Math.ceil((x1-x0)*scale)+6,height:Math.ceil((y1-y0)*scale)+6};
  }
})(globalThis.TowerFrontier);
