'use strict';
// Read-only authoring helper. Never edits images. Printed metadata is reviewed
// before being copied into the runtime catalog; no pixel scans at runtime.
const {measure}=require('./measure-evolution-art.cjs'),{rgba}=require('../tests/png-pixels.cjs');
function inspect(file,worldHeight=90){
  const {width,height,parts}=measure(file,4),{pixels}=rgba(file),covered=new Uint8Array(width*height);
  const frames=parts.map(b=>{let left=width,right=0;for(let y=Math.round(b.bottom-(b.bottom-b.top)*.22);y<=b.bottom;y++)for(let x=b.left;x<=b.right;x++)if(pixels[(y*width+x)*4+3]>=48){left=Math.min(left,x);right=Math.max(right,x);}return[b.left-3,b.top-3,b.right-b.left+7,b.bottom-b.top+7,Math.round((left+right)/2),b.bottom];});
  const errors=[];frames.forEach(([x,y,w,h],index)=>{let edges=0;
    if(x<0||y<0||x+w>width||y+h>height){errors.push({index,reason:'outside canvas'});return;}
    for(let cy=y;cy<y+h;cy++)for(let cx=x;cx<x+w;cx++){covered[cy*width+cx]=1;if((cx===x||cx===x+w-1||cy===y||cy===y+h-1)&&pixels[(cy*width+cx)*4+3]>=48)edges++;}
    if(edges)errors.push({index,reason:'rectangle touches solid pixels',edges});
  });
  let outside=0;for(let i=0;i<covered.length;i++)if(!covered[i]&&pixels[i*4+3]>=48)outside++;
  return{form:{path:file.replaceAll('\\','/'),width,height,visible:Math.max(...parts.slice(0,4).map(b=>b.bottom-b.top+1)),worldHeight,frames},errors,outside,count:frames.length};
}
if(require.main===module)console.log(JSON.stringify(inspect(process.argv[2],Number(process.argv[3])||90)));
module.exports={inspect};
