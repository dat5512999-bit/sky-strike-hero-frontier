(function(ns){
  'use strict';
  const form={"path":"assets/td/wild-chief-actions-v2.png","width":1254,"height":1254,"visible":291,"worldHeight":92,"frames":[[68,12,214,291,164,299],[373,6,206,297,466,299],[673,13,209,287,770,296],[984,13,198,289,1076,298],[32,321,254,285,152,602],[347,321,248,284,449,601],[644,321,239,286,767,603],[982,326,195,278,1078,600],[20,660,256,266,177,922],[327,616,263,308,471,920],[675,679,257,244,804,919],[985,680,238,240,1109,916],[45,947,236,296,156,1239],[342,940,266,303,454,1239],[645,947,278,295,755,1238],[960,952,230,291,1064,1239]]};
  form.frames.forEach(Object.freeze);Object.freeze(form.frames);Object.freeze(form);
  ns.systems.ChiefBaseSpriteAtlas=form;
  ns.systems.ArtSystem.prototype.drawChiefBaseSprite=function(ctx,unit,image){
    if(!image?.ready)return false;
    const row=({idle:0,walk:1,attack:2,cast:3,hit:0,death:3})[unit.state]??0;
    const col=Number.isFinite(unit.frame)?Math.max(0,Math.min(3,Math.floor(unit.frame))):0;
    const [x,y,w,h,fx,fy]=form.frames[row*4+col],scale=form.worldHeight/form.visible;
    ctx.save();try{ctx.translate(unit.x,unit.y+12);if(Math.cos(unit.facing||0)<0)ctx.scale(-1,1);
      ctx.drawImage(image,x,y,w,h,(x-fx)*scale,(y-fy)*scale,w*scale,h*scale);
      ctx.translate(0,-12);this.drawGearPieces(ctx,unit,false);
    }finally{ctx.restore();}
    this.drawRank(ctx,unit.x,unit.y,unit.level||1,unit.config().color,false,unit.type);return true;
  };
})(globalThis.TowerFrontier);
