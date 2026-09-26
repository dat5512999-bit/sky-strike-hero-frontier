'use strict';
// Read-only alpha analysis. Does not repaint, trim or modify the source artwork.
const fs=require('node:fs'),path=require('node:path'),{PNG}=require('pngjs');
const root=path.resolve(__dirname,'..'),folder=path.join(root,'assets/td/bosses');
const result={};
for(const file of fs.readdirSync(folder).filter(n=>n.endsWith('.png')&&!['frontline-actions-v1.png','frostcrown-actions-v1.png','demonlord-actions-v1.png'].includes(n))){
  const p=PNG.sync.read(fs.readFileSync(path.join(folder,file))),{width:w,height:h,data}=p,seen=new Uint8Array(w*h),parts=[];
  for(let seed=0;seed<w*h;seed++){
    if(seen[seed]||data[seed*4+3]<16)continue;
    const stack=[seed];seen[seed]=1;let minX=w,minY=h,maxX=0,maxY=0,n=0;
    while(stack.length){const k=stack.pop(),x=k%w,y=Math.floor(k/w);n++;minX=Math.min(minX,x);minY=Math.min(minY,y);maxX=Math.max(maxX,x);maxY=Math.max(maxY,y);
      for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const xx=x+dx,yy=y+dy;if(xx<0||xx>=w||yy<0||yy>=h)continue;const j=yy*w+xx;if(!seen[j]&&data[j*4+3]>=16){seen[j]=1;stack.push(j);}}
    }
    if(n>500)parts.push({x:minX,y:minY,w:maxX-minX+1,h:maxY-minY+1,n});
  }
  parts.sort((a,b)=>(Math.floor((a.y+a.h/2)/(h/4))-Math.floor((b.y+b.h/2)/(h/4)))||a.x-b.x);
  result[file.replace(/-actions-v\d+.png$/,'')]={width:w,height:h,parts};
}
console.log(JSON.stringify(result,null,2));
