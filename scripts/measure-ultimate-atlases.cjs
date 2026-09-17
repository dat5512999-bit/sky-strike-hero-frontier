'use strict';
// Read alpha bounds only; PNG artwork is not modified.
const fs=require('node:fs'),{rgba}=require('../tests/png-pixels.cjs');
const specs={dragon:{file:'dragon',splitX:635,splitY:627},royalCommander:{file:'commander',splitX:644,bottomSplitX:610,splitY:630},soulsteel:{file:'soulsteel',splitX:645,splitY:600}},out={};
for(const [type,spec] of Object.entries(specs)){
 const {width,height,pixels}=rgba('assets/td/ultimate-'+spec.file+'-v1.png'),frames=[];
 for(let row=0;row<2;row++)for(let col=0;col<2;col++){
  const splitX=row?(spec.bottomSplitX||spec.splitX):spec.splitX,x0=col?splitX:0,x1=col?width:splitX,y0=row?spec.splitY:0,y1=row?height:spec.splitY;let l=x1,t=y1,r=x0,b=y0;
  for(let y=y0;y<y1;y++)for(let x=x0;x<x1;x++)if(pixels[(y*width+x)*4+3]>32){l=Math.min(l,x);r=Math.max(r,x);t=Math.min(t,y);b=Math.max(b,y);}
  frames.push([l,t,r-l+1,b-t+1]);
 }
 out[type]={width,height,frames,maxHeight:Math.max(...frames.map(f=>f[3]))};
}
const file='src/td/systems/ArtSystem.js';let s=fs.readFileSync(file,'utf8');s=s.replace(/  ArtSystem\.ULTIMATE_FRAMES=.*;\r?\n/,'');s=s.replace('  // Measured transparent sprite bounds,',`  ArtSystem.ULTIMATE_FRAMES=${JSON.stringify(out)};\n  // Measured transparent sprite bounds,`);fs.writeFileSync(file,s);console.log(JSON.stringify(out,null,2));
