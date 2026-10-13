'use strict';
// Read-only atlas inspection. Finds isolated poses without assuming equal cells.
// Run: node scripts/measure-evolution-art.cjs path/to.png
const {rgba}=require('../tests/png-pixels.cjs');
function measure(file,rows=5){
  const {width,height,pixels}=rgba(file),seen=new Uint8Array(width*height),queue=new Int32Array(width*height),parts=[];
  for(let seed=0;seed<seen.length;seed++){
    if(seen[seed]||pixels[seed*4+3]<48)continue;
    let head=0,tail=1,left=width,top=height,right=0,bottom=0;queue[0]=seed;seen[seed]=1;
    while(head<tail){const i=queue[head++],x=i%width,y=Math.floor(i/width);left=Math.min(left,x);right=Math.max(right,x);top=Math.min(top,y);bottom=Math.max(bottom,y);
      for(const next of [x?i-1:-1,x<width-1?i+1:-1,y?i-width:-1,y<height-1?i+width:-1])if(next>=0&&!seen[next]&&pixels[next*4+3]>=48){seen[next]=1;queue[tail++]=next;}
    }
    if(tail>2000)parts.push({left,top,right,bottom,pixels:tail});
  }
  parts.sort((a,b)=>Math.round(a.bottom/(height/rows)-.85)-Math.round(b.bottom/(height/rows)-.85)||a.left-b.left);
  return{file,width,height,parts};
}
if(require.main===module)console.log(JSON.stringify(measure(process.argv[2]),null,2));
module.exports={measure};
