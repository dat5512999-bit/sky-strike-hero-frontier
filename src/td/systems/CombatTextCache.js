(function(ns){
  'use strict';
  // Bounded presentation cache. Values/rewards still come from combat; only
  // rasterization of an unchanged floating label is reused between frames.
  class CombatTextCache{
    constructor(){this.entries=new Map();this.pixels=0;}
    static surface(width,height){
      let canvas;if(typeof OffscreenCanvas!=='undefined')canvas=new OffscreenCanvas(width,height);
      else if(typeof document!=='undefined'&&typeof document.createElement==='function'){canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;}
      return canvas;
    }
    draw(ctx,label,x,y){
      if(!ctx.measureText||ctx.shadowBlur>0)return false;
      const matrix=ctx.getTransform?.(),actualScale=matrix?Math.max(Math.hypot(matrix.a,matrix.b),Math.hypot(matrix.c,matrix.d)):1;
      if(!Number.isFinite(actualScale)||actualScale>3)return false;
      const scale=Math.max(1,Math.ceil(actualScale*2)/2);
      const key=[label,ctx.font,ctx.fillStyle,ctx.strokeStyle,ctx.lineWidth,scale].join('|');let entry=this.entries.get(key);
      if(!entry){
        const metrics=ctx.measureText(label);if(!metrics||!Number.isFinite(metrics.width))return false;
        const size=Number(/(\d+(?:\.\d+)?)px/.exec(ctx.font)?.[1])||19,pad=Math.ceil((ctx.lineWidth||3)+3);
        const ascent=Math.ceil(metrics.actualBoundingBoxAscent||size),descent=Math.ceil(metrics.actualBoundingBoxDescent||size*.3);
        const half=Math.ceil(Math.max(metrics.width/2,Math.abs(metrics.actualBoundingBoxLeft||0),Math.abs(metrics.actualBoundingBoxRight||0)))+pad;
        const width=half*2,height=ascent+descent+pad*2,pixelWidth=Math.ceil(width*scale),pixelHeight=Math.ceil(height*scale),pixels=pixelWidth*pixelHeight;if(!Number.isFinite(width)||width<=0||pixels>131072)return false;
        let image,surface;
        try{image=CombatTextCache.surface(pixelWidth,pixelHeight);surface=image?.getContext('2d');}catch(_){return false;}if(!surface)return false;
        surface.scale?.(scale,scale);
        surface.font=ctx.font;surface.textAlign='center';surface.textBaseline='alphabetic';surface.lineWidth=ctx.lineWidth;surface.strokeStyle=ctx.strokeStyle;surface.fillStyle=ctx.fillStyle;
        surface.strokeText(label,half,ascent+pad);surface.fillText(label,half,ascent+pad);
        entry={image,width,height,pixels,baseline:ascent+pad};
        while(this.entries.size>=128||this.pixels+pixels>524288){const first=this.entries.keys().next().value;if(first===undefined)break;const old=this.entries.get(first);this.pixels-=old.pixels;this.entries.delete(first);}
        this.entries.set(key,entry);this.pixels+=pixels;
      }else{this.entries.delete(key);this.entries.set(key,entry);}
      ctx.drawImage(entry.image,x-entry.width/2,y-entry.baseline,entry.width,entry.height);return true;
    }
    clear(){this.entries.clear();this.pixels=0;}
  }
  CombatTextCache.VERSION='1.0.0';ns.systems.CombatTextCache=CombatTextCache;
})(globalThis.TowerFrontier);
