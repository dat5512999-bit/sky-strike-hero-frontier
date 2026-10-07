(function(ns){
  'use strict';
  const ROOT='assets/td/adventure/';
  // Source bounds are measured once from alpha, not guessed at equal grid cuts.
  const SHEETS={
    mechanisms:{file:'mechanisms-v1.png',frames:[[49,67,580,520],[672,79,548,509],[56,626,573,549],[669,629,553,548]]},
    beacons:{file:'beacons-v1.png',frames:[[90,62,494,546],[721,7,449,604],[63,658,539,524],[696,659,537,522]]},
    support:{file:'support-v1.png',frames:[[98,85,555,471],[726,63,444,537],[113,621,572,572],[790,696,367,487]]},
    platforms:{file:'platforms-v1.png',frames:[[51,100,574,448],[643,100,575,449],[48,665,576,473],[646,665,563,479]]},
    water:{file:'water-action-v1.png',frames:[[35,56,595,538],[626,63,577,535],[43,623,575,540],[618,624,580,542]]}
  };
  class AdventureArt{
    static preload(art){if(!art?.load)return;art.adventureAssets||={};for(const [id,sheet] of Object.entries(SHEETS))art.adventureAssets[id]||=art.load(ROOT+sheet.file);}
    static status(art){const images=Object.values(art?.adventureAssets||{});return {ready:images.filter(i=>i.ready).length,failed:images.filter(i=>i.failed).length,total:Object.keys(SHEETS).length};}
    static retry(art){for(const image of Object.values(art?.adventureAssets||{}))if(image.failed){image.failed=false;image.attempts=0;art.request?.(image);}}
    static waterFrame(field){if(!field)return 0;const elapsed=field.duration-field.time;if(elapsed<.22||field.time<.18)return 0;if(elapsed<.6||field.time<.5)return 1;return 2+Math.floor(elapsed*6)%2;}
    static choice(system,node){const state=system.states[node.id];if(node.kind==='repair')return {sheet:'beacons',frame:(node.effect==='pulse'?2:0)+(state.status==='repaired'?1:0),width:90};if(node.kind==='rescue')return {sheet:'support',frame:system.mapId==='emberroad'||system.mapId==='brineway'?0:1,width:80};if(node.kind==='trade')return {sheet:'support',frame:2,width:98};if(node.effect==='water')return {sheet:'water',frame:AdventureArt.waterFrame(system.fields.find(f=>f.effect==='water')),width:104};if(node.effect==='smoke')return {sheet:'support',frame:3,width:68};return {sheet:'mechanisms',frame:{frost:1,rock:2,pulse:3}[node.effect]||0,width:92};}
    static cell(ctx,art,sheetId,frame,width,centered){const sheet=SHEETS[sheetId],image=art?.adventureAssets?.[sheetId];if(!sheet||!image?.ready)return false;const [x,y,w,h]=sheet.frames[frame],reference=Math.max(...sheet.frames.map(r=>r[2])),scale=width/reference,height=h*scale;ctx.drawImage(image,x,y,w,h,-w*scale/2,centered?-height/2:8-height,w*scale,height);return true;}
    static node(ctx,system,node,art){const choice=AdventureArt.choice(system,node);return AdventureArt.cell(ctx,art,choice.sheet,choice.frame,choice.width,false);}
    static platform(ctx,system,art){const cold=system.mapId==='frostborn',frame=(cold?0:2)+(system.platformOpen?1:0);return AdventureArt.cell(ctx,art,'platforms',frame,116,true);}
    static fields(ctx,system){
      const map=ns.maps?.definitions?.[system.mapId],routes=map?.routes||[map?.path||[]],mobile=system.game.feedback?.mobile;
      for(const field of system.fields.slice(0,3)){
        const elapsed=field.duration-field.time,fade=Math.min(1,Math.max(0,elapsed/.35),field.time/.45);ctx.save();
        if(field.effect==='water'||field.effect==='smoke'){
          ctx.beginPath();ctx.arc(field.x,field.y,field.radius,0,Math.PI*2);ctx.clip();ctx.lineCap='round';
          ctx.strokeStyle='rgba(44,155,168,'+(.35*fade)+')';ctx.lineWidth=25;
          for(const route of routes){ctx.beginPath();route.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.stroke();}
          let drawn=0,travel=system.clock*42%34;ctx.lineWidth=2;ctx.strokeStyle='rgba(215,252,250,'+(.75*fade)+')';
          for(const route of routes)for(let i=1;i<route.length;i++){const a=route[i-1],b=route[i],dx=b.x-a.x,dy=b.y-a.y,length=Math.hypot(dx,dy)||1;for(let d=travel;d<length&&drawn<(mobile?24:48);d+=34){const x=a.x+dx*d/length,y=a.y+dy*d/length;if(Math.hypot(x-field.x,y-field.y)>field.radius+10)continue;const side=Math.sin(d*.13+system.clock*5)*8;ctx.beginPath();ctx.moveTo(x-dy/length*side,y+dx/length*side);ctx.lineTo(x+dx/length*9-dy/length*side,y+dy/length*9+dx/length*side);ctx.stroke();drawn++;}}
        }else if(field.effect==='frost'){
          ctx.strokeStyle='#d7f3ff';ctx.fillStyle='#91cbeac0';ctx.globalAlpha=fade*.65;ctx.lineWidth=2;
          for(let i=0;i<(mobile?10:16);i++){const a=i*2.399,r=field.radius*Math.sqrt((i+1)/17),x=field.x+Math.cos(a)*r,y=field.y+Math.sin(a)*r,up=10+Math.sin(elapsed*7+i)*3;ctx.beginPath();ctx.moveTo(x-4,y);ctx.lineTo(x,y-up);ctx.lineTo(x+4,y-1);ctx.closePath();ctx.fill();ctx.stroke();}
        }else if(field.effect==='rock'){
          ctx.fillStyle='#8c7250';ctx.strokeStyle='#d5b580';ctx.lineWidth=2;ctx.globalAlpha=fade;
          for(let i=0;i<8;i++){const a=i*2.399,r=field.radius*Math.sqrt((i+1)/9)*.75,x=field.x+Math.cos(a)*r,y=field.y+Math.sin(a)*r-Math.max(0,.45-elapsed)*100;ctx.beginPath();ctx.moveTo(x-6,y);ctx.lineTo(x-4,y-8);ctx.lineTo(x+5,y-7);ctx.lineTo(x+8,y+2);ctx.closePath();ctx.fill();ctx.stroke();}
        }else if(field.effect==='pulse'){
          ctx.strokeStyle='#d3b9ff';ctx.lineWidth=2;ctx.globalAlpha=fade*.5;
          for(let i=0;i<2;i++){const radius=field.radius*((elapsed*.65+i*.5)%1);ctx.beginPath();ctx.ellipse(field.x,field.y,radius,radius*.5,0,0,Math.PI*2);ctx.stroke();}
        }else {ctx.globalAlpha=fade*.25;ctx.strokeStyle='#ead18a';ctx.lineWidth=3;ctx.setLineDash([9,7]);ctx.beginPath();ctx.arc(field.x,field.y,field.radius,0,Math.PI*2);ctx.stroke();}
        ctx.restore();
      }
    }
  }
  AdventureArt.SHEETS=SHEETS;AdventureArt.ROOT=ROOT;ns.systems.AdventureArt=AdventureArt;
})(globalThis.TowerFrontier);
