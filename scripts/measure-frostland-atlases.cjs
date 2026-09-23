'use strict';
const fs=require('node:fs'),crypto=require('node:crypto'),{rgba}=require('../tests/png-pixels.cjs');
const specs={hero:{path:'assets/td/frostland/hero-actions-v1.png',columns:4,rows:4},soldiers:{path:'assets/td/frostland/soldier-actions-v1.png',columns:4,rows:6},weapons:{path:'assets/td/items/frostland-spears-v1.png',columns:4,rows:1}};
for(const spec of Object.values(specs)){
 const {width,height,pixels}=rgba(spec.path);Object.assign(spec,{width,height,frames:[]});let transparent=0;
 for(let i=3;i<pixels.length;i+=4)if(pixels[i]===0)transparent++;spec.transparentFraction=transparent/(width*height);
 if(spec.transparentFraction<.25)throw Error('Insufficient alpha: '+spec.path);
 for(let row=0;row<spec.rows;row++)for(let col=0;col<spec.columns;col++){
  const x0=Math.round(col*width/spec.columns),x1=Math.round((col+1)*width/spec.columns),y0=Math.round(row*height/spec.rows),y1=Math.round((row+1)*height/spec.rows);let left=x1,right=x0,top=y1,bottom=y0;
  const hash=crypto.createHash('sha256');
  for(let y=y0;y<y1;y++){hash.update(pixels.subarray((y*width+x0)*4,(y*width+x1)*4));for(let x=x0;x<x1;x++)if(pixels[(y*width+x)*4+3]>120){left=Math.min(left,x);right=Math.max(right,x);top=Math.min(top,y);bottom=Math.max(bottom,y);}}
  if(right<=left||bottom<=top)throw Error('Empty frame');spec.frames.push({rect:[left,top,right-left+1,bottom-top+1],anchorX:(x0+x1)/2,foot:bottom+1,hash:hash.digest('hex')});
 }
 if(spec.rows>1){
  // Find complete bodies across nominal cell boundaries (raised bows / wings).
  // Keep source pixels unchanged; store rectangles and foreign-fragment clip cuts.
  const labels=new Int32Array(width*height),components=[];
  for(let start=0;start<labels.length;start++){
   if(labels[start]||pixels[start*4+3]<120)continue;
   const id=components.length+1,queue=[start];labels[start]=id;let i=0,left=width,top=height,right=0,bottom=0;
   while(i<queue.length){const at=queue[i++],x=at%width,y=Math.floor(at/width);left=Math.min(left,x);right=Math.max(right,x);top=Math.min(top,y);bottom=Math.max(bottom,y);
    for(const next of [x>0?at-1:-1,x<width-1?at+1:-1,y>0?at-width:-1,y<height-1?at+width:-1])if(next>=0&&!labels[next]&&pixels[next*4+3]>=120){labels[next]=id;queue.push(next);}
   }
   components.push({id,count:queue.length,left,top,right,bottom});
  }
  for(const body of components.filter(c=>c.count>2000)){
   const col=Math.min(3,Math.floor((body.left+body.right)/2/width*4)),row=Math.min(spec.rows-1,Math.floor((body.top+body.bottom)/2/height*spec.rows));
   const f=spec.frames[row*4+col],left=Math.max(0,body.left-2),top=Math.max(0,body.top-2),right=Math.min(width-1,body.right+2),bottom=Math.min(height-1,body.bottom+2);
   f.rect=[left,top,right-left+1,bottom-top+1];f.foot=body.bottom+1;f.cuts=[];const foreign=new Map();
   for(let y=top;y<=bottom;y++)for(let x=left;x<=right;x++){const id=labels[y*width+x];if(id&&id!==body.id&&components[id-1].count>2000){const b=foreign.get(id)||[x,y,x,y];b[0]=Math.min(b[0],x);b[1]=Math.min(b[1],y);b[2]=Math.max(b[2],x);b[3]=Math.max(b[3],y);foreign.set(id,b);}}
   for(const b of foreign.values())f.cuts.push([b[0]-2,b[1]-2,b[2]-b[0]+5,b[3]-b[1]+5]);
  }
 }
 spec.maxHeight=Math.max(...spec.frames.map(f=>f.rect[3]));
}
fs.writeFileSync('src/td/systems/FrostlandAtlas.js','(function(ns){ns.systems.FrostlandAtlas='+JSON.stringify(specs)+';})(globalThis.TowerFrontier);\n');
fs.mkdirSync('artifacts/frostland',{recursive:true});fs.writeFileSync('artifacts/frostland/atlas-audit.json',JSON.stringify(specs,null,2)+'\n');
console.log(Object.fromEntries(Object.entries(specs).map(([key,s])=>[key,{size:[s.width,s.height],frames:s.frames.length,transparent:s.transparentFraction}])));
