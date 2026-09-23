(function(ns){
  'use strict';
  const TAU=Math.PI*2;
  class FrostlandSpellArt{
    static texture(synergy){const art=synergy.game.art;if(!art)return null;return art.frostSpellAtlas||(art.frostSpellAtlas=art.load('assets/td/frostland/spell-effects-v1.png'));}
    static sprite(ctx,image,cell,x,y,w,h,alpha=1){if(!image?.ready)return false;const sw=image.width/2,sh=image.height/2;ctx.save();ctx.globalAlpha*=alpha;ctx.drawImage(image,(cell%2)*sw,Math.floor(cell/2)*sh,sw,sh,x-w/2,y-h/2,w,h);ctx.restore();return true;}
    static glow(ctx,x,y,r,color,alpha=1){
      ctx.save();ctx.globalAlpha*=alpha;ctx.globalCompositeOperation='lighter';
      const g=ctx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,'#eeffff');g.addColorStop(.12,color);g.addColorStop(1,'rgba(26,146,196,0)');
      ctx.fillStyle=g;ctx.fillRect(x-r,y-r,r*2,r*2);ctx.restore();
    }
    static crystal(ctx,x,y,h,tilt=0,image=null){
      if(h<=0)return;
      if(image?.ready){ctx.save();ctx.translate(x,y);ctx.rotate(tilt);this.sprite(ctx,image,0,0,-h*.38,h*1.12,h*1.12);ctx.restore();return;}
      ctx.save();ctx.translate(x,y);ctx.rotate(tilt);
      const g=ctx.createLinearGradient(-h*.16,0,h*.2,-h);g.addColorStop(0,'#123d6e');g.addColorStop(.4,'#20aed2');g.addColorStop(1,'#e5ffff');ctx.fillStyle=g;
      ctx.beginPath();ctx.moveTo(-h*.18,0);ctx.lineTo(-h*.12,-h*.68);ctx.lineTo(0,-h);ctx.lineTo(h*.2,-h*.3);ctx.lineTo(h*.12,0);ctx.closePath();ctx.fill();
      ctx.fillStyle='#b8ffff';ctx.beginPath();ctx.moveTo(0,-h);ctx.lineTo(h*.05,-h*.14);ctx.lineTo(h*.2,-h*.3);ctx.closePath();ctx.fill();ctx.restore();
    }
    static seal(ctx,x,y,r,time,color){
      ctx.save();ctx.translate(x,y);ctx.scale(1,.48);ctx.rotate(time*.3);ctx.strokeStyle=color;ctx.lineWidth=1.5;
      for(const size of [r,r*.83]){ctx.beginPath();ctx.arc(0,0,size,0,TAU);ctx.stroke();}
      for(let i=0;i<8;i++){const a=i*TAU/8;ctx.save();ctx.rotate(a);ctx.beginPath();ctx.moveTo(r*.67,0);ctx.lineTo(r*.83,-5);ctx.lineTo(r*.95,0);ctx.lineTo(r*.83,5);ctx.closePath();ctx.stroke();ctx.restore();}ctx.restore();
    }
    static burst(ctx,x,y,t,r,count,image=null){
      const spread=1-Math.pow(1-t,3);
      this.sprite(ctx,image,1,x,y-24,r*(.8+spread),r*(.8+spread),Math.pow(1-t,1.5)*.85);
      ctx.save();ctx.strokeStyle='#9bedff';ctx.lineWidth=1.4;ctx.globalAlpha*=1-t;
      for(let i=0;i<count;i++){const a=i*2.39996,dist=r*(.45+(i%4)*.15)*spread;
        ctx.beginPath();ctx.moveTo(x+Math.cos(a)*dist*.45,y+Math.sin(a)*dist*.35);ctx.lineTo(x+Math.cos(a+.12)*dist*.75,y+Math.sin(a+.12)*dist*.48);ctx.lineTo(x+Math.cos(a)*dist,y+Math.sin(a)*dist*.48);ctx.stroke();
        this.crystal(ctx,x+Math.cos(a)*dist,y+Math.sin(a)*dist*.48-28*Math.sin(t*Math.PI),6+(i%3)*5,a+t,image);
      }ctx.restore();
    }
    static draw(ctx,v,synergy){
      if(!['mark','spear','hunt','winter'].includes(v.type))return false;
      const t=Math.min(1,v.age/v.duration),fade=1-t,impact=Math.exp(-t*9),mobile=synergy.game.feedback?.mobile,p=v.target||v,image=this.texture(synergy);
      ctx.save();ctx.globalAlpha=Math.min(1,fade*2);
      if(v.type==='mark'){
        this.seal(ctx,p.x,p.y,30+8*Math.sin(t*Math.PI),t,'#98ebff');this.glow(ctx,p.x,p.y-28,48,'#37bde6',.3+impact*.5);
        // The target takes damage immediately: the contact flash starts at t=0.
        for(let i=0;i<6;i++){const a=i*TAU/6+t*.5;this.crystal(ctx,p.x+Math.cos(a)*25,p.y-28+Math.sin(a)*14,12+fade*10,a+Math.PI/2,image);}
        this.burst(ctx,p.x,p.y,t,55,mobile?6:10,image);
      }else if(v.type==='spear'){
        const angle=Math.atan2(p.y-v.y,p.x-v.x),distance=Math.hypot(p.x-v.x,p.y-v.y);
        ctx.save();ctx.translate((p.x+v.x)/2,(p.y+v.y)/2-28);ctx.rotate(angle+Math.PI/4);this.sprite(ctx,image,2,0,0,distance*.85,distance*.85,Math.max(0,1-t*2.5));ctx.restore();
        ctx.save();ctx.translate(v.x,v.y-28);ctx.rotate(angle);ctx.globalCompositeOperation='lighter';
        const g=ctx.createLinearGradient(0,0,distance,0);g.addColorStop(0,'rgba(58,181,233,0)');g.addColorStop(.7,'#339cd6');g.addColorStop(1,'#e8ffff');ctx.fillStyle=g;ctx.globalAlpha*=Math.max(0,1-t*2.2);
        ctx.beginPath();ctx.moveTo(0,-3);ctx.lineTo(distance-22,-9);ctx.lineTo(distance+18,0);ctx.lineTo(distance-22,9);ctx.lineTo(0,3);ctx.closePath();ctx.fill();ctx.restore();
        this.glow(ctx,p.x,p.y-26,65+30*t,'#3cd9ff',.15+impact*.8);this.burst(ctx,p.x,p.y,t,85,mobile?10:18,image);
        for(let i=0;i<5;i++)this.crystal(ctx,p.x+(i-2)*15,p.y+8,Math.sin(Math.PI*Math.min(1,t*1.5))*(28+(i%2)*22),(i-2)*.17,image);
      }else if(v.type==='hunt'){
        const r=230*(1-Math.pow(1-t,3));this.seal(ctx,v.x,v.y,r,t,'#a0e4c7');this.glow(ctx,v.x,v.y-35,90,'#57dbbd',.2+impact*.4);
        // Use the actual painted wolf sprite for spectral pack silhouettes.
        const art=synergy.game.art;
        for(let i=0;i<(mobile?3:5);i++){const a=-Math.PI*.85+i*Math.PI*.43,x=v.x+Math.cos(a)*r*.6,y=v.y+Math.sin(a)*r*.32;
          ctx.save();ctx.globalAlpha*=fade*.62;
          if(art)art.drawCombatUnit(ctx,{type:'frostWolf',x,y,level:1,state:'move',frame:Math.floor(t*12)%4,facing:a,frostAction:{age:v.age%.42,duration:.42},animationTime:v.age,config:()=>ns.config.units.frostWolf});
          this.glow(ctx,x,y-20,34,'#88efcb',.3);ctx.restore();
        }
        this.burst(ctx,v.x,v.y,t,120,mobile?8:14,image);
      }else{
        const r=60+520*(1-Math.pow(1-t,2));this.seal(ctx,v.x,v.y,r,t,'#b4f7ff');this.glow(ctx,v.x,v.y-35,160,'#49d5d3',impact*.6);
        this.sprite(ctx,image,3,v.x,v.y-60,r*2,r*.85,fade*.65);
        const count=mobile?10:18;
        for(let i=0;i<count;i++){const a=i*TAU/count,local=Math.max(0,Math.min(1,(t-(i%3)*.06)*1.7)),h=Math.sin(local*Math.PI)*(42+(i%4)*15);
          this.crystal(ctx,v.x+Math.cos(a)*r*.63,v.y+Math.sin(a)*r*.36,h,Math.cos(a)*.25,image);
        }
        this.burst(ctx,v.x,v.y,t,r*.8,mobile?12:24,image);
      }
      ctx.restore();return true;
    }
  }
  ns.systems.FrostlandSpellArt=FrostlandSpellArt;
})(globalThis.TowerFrontier);
