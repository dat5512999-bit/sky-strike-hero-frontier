'use strict';
const fs=require('node:fs'),vm=require('node:vm'),{rgba}=require('../tests/png-pixels.cjs');
const c=vm.createContext({Image:class{}});c.globalThis=c;for(const p of ['src/td/namespace.js','src/td/systems/ArtSystem.js'])vm.runInContext(fs.readFileSync(p,'utf8'),c);
const ArtSystem=c.TowerFrontier.systems.ArtSystem,a=new ArtSystem();for(const type of Object.keys(ArtSystem.ACTION_PATHS||{}))a.actionImage(type);
const paths=[...new Set([...Object.values(a.combatUnits),...Object.values(a.enemyActions),a.hero,a.heroHunter,a.heroRogue,a.heroHunterUnarmed,a.heroArcanistUnarmed,a.rogueUnarmed,a.wolf,a.arcaneElemental,a.cryptWraith,a.graveyardRevenant].map(i=>i.assetSrc))].filter(p=>p&&!p.includes('ultimate-')&&!p.includes('beastmaster'));
const data={},report=[];
for(const path of paths){const {width:w,height:h,pixels:p}=rgba(path),seen=new Uint8Array(w*h),queue=new Int32Array(w*h),parts=[];
 for(let i=0;i<w*h;i++){if(seen[i]||p[i*4+3]<160)continue;let head=0,tail=1;queue[0]=i;seen[i]=1;let x0=w,y0=h,x1=0,y1=0;
 while(head<tail){const k=queue[head++],x=k%w,y=(k/w)|0;x0=Math.min(x0,x);x1=Math.max(x1,x);y0=Math.min(y0,y);y1=Math.max(y1,y);for(const n of [x>0?k-1:-1,x<w-1?k+1:-1,k-w,k+w])if(n>=0&&n<w*h&&!seen[n]&&p[n*4+3]>=160){seen[n]=1;queue[tail++]=n;}}
 if(tail>=24)parts.push({x0,y0,x1,y1,count:tail,pixels:queue.slice(0,tail),owner:Math.min(3,Math.floor((y0+y1)/2/h*4))*4+Math.min(3,Math.floor((x0+x1)/2/w*4))});
 }
 const seeds=Array.from({length:16},(_,i)=>parts.filter(p=>p.owner===i).sort((a,b)=>b.count-a.count)[0]);if(seeds.some(s=>!s||s.count<500))throw Error('Missing frame '+path);
 for(const part of parts){if(seeds.includes(part))continue;const x=(part.x0+part.x1)/2,y=(part.y0+part.y1)/2;let best=Infinity;for(let i=0;i<16;i++){const b=seeds[i],dx=Math.max(b.x0-x,0,x-b.x1),dy=Math.max(b.y0-y,0,y-b.y1),distance=dx*dx+dy*dy+.001*((x-(b.x0+b.x1)/2)**2+(y-(b.y0+b.y1)/2)**2);if(distance<best){best=distance;part.owner=i;}}}
 const owners=new Uint8Array(w*h);for(const part of parts)for(const k of part.pixels)owners[k]=part.owner+1;
 const frames=[],cuts=[];
 for(let index=0;index<16;index++){const group=parts.filter(p=>p.owner===index),x0=Math.max(0,Math.min(...group.map(p=>p.x0))-3),y0=Math.max(0,Math.min(...group.map(p=>p.y0))-3),x1=Math.min(w,Math.max(...group.map(p=>p.x1))+4),y1=Math.min(h,Math.max(...group.map(p=>p.y1))+4),rect=[x0,y0,x1-x0,y1-y0];frames.push(rect);
 const rows=[];let previous=new Map();for(let y=y0;y<y1;y++){let run=-1;const current=new Map();for(let x=x0;x<=x1;x++){let foreign=false;if(x<x1){for(let dy=-1;dy<=1&&!foreign;dy++)for(let dx=-1;dx<=1;dx++){const xx=x+dx,yy=y+dy;if(xx<0||xx>=w||yy<0||yy>=h)continue;const label=owners[yy*w+xx];if(label&&label!==index+1){foreign=true;break;}}}if(foreign&&run<0)run=x;if(!foreign&&run>=0){const key=run+':'+(x-run),old=previous.get(key);if(old){old[3]++;current.set(key,old);}else{const r=[run,y,x-run,1];rows.push(r);current.set(key,r);}run=-1;}}previous=current;}cuts.push(rows);
 const row=Math.floor(index/4),col=index%4;if(x0<col*w/4||x1>(col+1)*w/4||y0<row*h/4||y1>(row+1)*h/4)report.push({path,frame:index,rect});
 }
 data[path]={width:w,height:h,frames,cuts};
}
fs.writeFileSync('src/td/systems/SpriteFrameBounds.js',"(function(ns){'use strict';ns.systems.SpriteFrameBounds="+JSON.stringify(data)+";})(globalThis.TowerFrontier);\n");fs.mkdirSync('artifacts/qa-hero-v0690',{recursive:true});fs.writeFileSync('artifacts/qa-hero-v0690/frame-audit.json',JSON.stringify({atlases:paths.length,frames:paths.length*16,crossing:report},null,2));console.log(paths.length+' atlases; '+report.length+' extended frames; masks exclude foreign alpha components.');
