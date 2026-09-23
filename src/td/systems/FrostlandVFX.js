(function(ns){
  'use strict';
  class FrostlandVFX {
    static emit(synergy,type,point,options={}){
      if(!synergy)return;ns.systems.FrostlandAudio?.play(type);synergy.frostVisuals||=[];
      synergy.frostVisuals.push({type,x:point.x,y:point.y,age:0,duration:type==='winter'?1.4:type==='freeze'?.65:['mark','spear','hunt'].includes(type)?1.05:.7,color:'#b5e5e8',...options});
      const cap=synergy.game.feedback?.mobile?36:72;if(synergy.frostVisuals.length>cap)synergy.frostVisuals.splice(0,synergy.frostVisuals.length-cap);
    }
    static update(synergy,dt){synergy.frostVisuals=(synergy.frostVisuals||[]).filter(v=>{v.age+=dt;return v.age<v.duration;});}
    static shard(ctx,x,y,size,angle,color){ctx.save();ctx.translate(x,y);ctx.rotate(angle);ctx.fillStyle=color;ctx.beginPath();ctx.moveTo(0,-size);ctx.lineTo(size*.3,0);ctx.lineTo(0,size*.45);ctx.lineTo(-size*.3,0);ctx.closePath();ctx.fill();ctx.restore();}
    static draw(ctx,synergy){
      const mobile=synergy.game.feedback?.mobile;ctx.save();
      for(const v of synergy.frostVisuals||[]){const t=v.age/v.duration,fade=1-t;ctx.globalAlpha=fade;ctx.strokeStyle=v.color;ctx.fillStyle=v.color;ctx.lineWidth=2.5*fade;
        if(ns.systems.FrostlandSpellArt?.draw(ctx,v,synergy))continue;
        if(v.type==='attack'){
          const target=v.target||v,dx=target.x-v.x,dy=target.y-v.y;
          if(['frostBear','frostMammoth'].includes(v.unitType)){
            const r=(v.unitType==='frostMammoth'?56:34)*(.2+t);ctx.strokeStyle='#c1aa8c';ctx.beginPath();ctx.ellipse(v.x,v.y,r,r*.4,0,0,Math.PI*2);ctx.stroke();
            for(let i=0;i<6;i++){const a=i*Math.PI/3;this.shard(ctx,v.x+Math.cos(a)*r,v.y+Math.sin(a)*r*.4-12*Math.sin(t*Math.PI),5+4*fade,a,'#bedee2');}
          }else if(v.unitType==='frostWolf'){
            for(let i=0;i<3;i++){ctx.beginPath();ctx.ellipse(v.x+dx*.5+i*5,v.y+dy*.5-22,25+15*t,8,Math.atan2(dy,dx)-.5,-1.6,.6);ctx.stroke();}
          }else if(v.unitType==='frostBird'){
            for(let i=0;i<5;i++)this.shard(ctx,v.x+dx*t+Math.sin(i*3)*14,v.y+dy*t-24,12*fade,i*.6,'#c9edf3');
          }else {ctx.beginPath();ctx.moveTo(v.x,v.y-32);ctx.lineTo(v.x+dx*Math.min(1,t*3),v.y+dy*Math.min(1,t*3)-24);ctx.stroke();}
        }else if(v.type==='hunt'){
          const r=230*t;ctx.strokeStyle='#cfdfae';ctx.beginPath();ctx.ellipse(v.x,v.y,r,r*.55,0,0,Math.PI*2);ctx.stroke();
          for(let i=0;i<8;i++){const a=i*Math.PI/4;this.shard(ctx,v.x+Math.cos(a)*r,v.y+Math.sin(a)*r*.55,12*fade,a,'#d6e9bc');}
        }else if(v.type==='mark'){
          const p=v.target;ctx.setLineDash([5,5]);ctx.beginPath();ctx.moveTo(v.x,v.y-35);ctx.lineTo(p.x,p.y-26);ctx.stroke();ctx.setLineDash([]);ctx.beginPath();ctx.ellipse(p.x,p.y,25+20*t,12+9*t,0,0,Math.PI*2);ctx.stroke();
          for(let i=0;i<4;i++)this.shard(ctx,p.x+Math.cos(i*Math.PI/2)*24,p.y-20+Math.sin(i*Math.PI/2)*16,14*fade,i*Math.PI/2,v.color);
        }else if(v.type==='spear'){
          const p=v.target,travel=Math.min(1,t*3);ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(v.x+(p.x-v.x)*Math.max(0,travel-.45),v.y-30+(p.y-v.y)*Math.max(0,travel-.45));ctx.lineTo(v.x+(p.x-v.x)*travel,v.y-30+(p.y-v.y)*travel);ctx.stroke();this.shard(ctx,p.x,p.y-22,22*fade,.7,v.color);
        }else if(v.type==='winter'){
          const r=100+650*t;ctx.beginPath();ctx.ellipse(v.x,v.y,r,r*.6,0,0,Math.PI*2);ctx.stroke();
        }else{
          const r=(v.radius||50)*(.2+t),count=mobile?8:14;
          ctx.beginPath();ctx.ellipse(v.x,v.y,r,r*.48,0,0,Math.PI*2);ctx.stroke();
          for(let i=0;i<count;i++){const a=i*Math.PI*2/count;this.shard(ctx,v.x+Math.cos(a)*r,v.y+Math.sin(a)*r*.45-22*Math.sin(t*Math.PI),v.type==='freeze'?18*fade:11*fade,a+t*2,v.color);}
        }
      }
      if(synergy.winter){
        const time=synergy.clock||0;ctx.globalAlpha=.22;ctx.strokeStyle='#8be0bf';ctx.lineWidth=14;
        for(let row=0;row<3;row++){ctx.beginPath();for(let x=0;x<=ns.config.width;x+=30){const y=40+row*27+Math.sin(x/135+time*.7+row)*22;if(x)ctx.lineTo(x,y);else ctx.moveTo(x,y);}ctx.stroke();}
        ctx.fillStyle='#e8f8f8';ctx.globalAlpha=.6;for(let i=0;i<(mobile?22:46);i++){const x=(i*137+time*32)%ns.config.width,y=(i*73+time*100)%ns.config.height;ctx.fillRect(x,y,i%3+1,3);}
      }
      ctx.restore();
    }
  }
  ns.systems.FrostlandVFX=FrostlandVFX;
})(globalThis.TowerFrontier);
