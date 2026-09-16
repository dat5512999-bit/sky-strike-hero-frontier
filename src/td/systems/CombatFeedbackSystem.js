(function(ns){
  'use strict';
  class CombatFeedbackSystem{
    constructor(){this.items=[];this.mobile=false;}
    reset(){this.items=[];}
    push(item){const cap=this.mobile?90:140;if(['damage','gold','mote'].includes(item.type)&&this.items.filter(i=>i.type===item.type).length>=(this.mobile?18:30))return;this.items.push(item);if(this.items.length>cap)this.items.splice(0,this.items.length-cap);}
    visualPosition(monster){return typeof monster.visualPosition==='function'?monster.visualPosition():{x:monster.x,y:monster.y};}
    hit(monster,damage,critical,color){
      const position=this.visualPosition(monster);
      monster.criticalFlash=critical?.16:0;this.push({type:'impact',x:position.x,y:position.y,time:critical?.3:.22,max:critical?.3:.22,heavy:critical,color:color||'#fff1b2'});
      this.push({type:'damage',x:position.x+(Math.random()-.5)*12,y:position.y-monster.radius-12,time:.78,max:.78,value:Math.max(1,Math.round(damage)),critical:Boolean(critical)});
    }
    gold(monster,value){const position=this.visualPosition(monster);this.push({type:'gold',x:position.x,y:position.y-8,time:1.05,max:1.05,value:Math.round(value)});}
    death(monster){
      const position=this.visualPosition(monster);
      this.push({type:'death',x:position.x,y:position.y,time:monster.type==='boss'?.9:.48,max:monster.type==='boss'?.9:.48,color:monster.color,variant:monster.type==='boss'?'boss':['revenant','treant','shaman'].includes(monster.type)?'magic':'body'});
      for(let i=0;i<(monster.type==='boss'?8:3);i++){const angle=Math.PI*2*i/5;this.push({type:'mote',x:position.x,y:position.y,vx:Math.cos(angle)*(28+i*3),vy:Math.sin(angle)*(22+i*2)-18,time:.55,max:.55,color:monster.color});}
    }
    explosion(position,radius,color,style){this.push({type:'explosion',x:position.x,y:position.y,radius:radius||40,color:color||'#ffbc6b',style:style||'fire',time:.6,max:.6});}
    soul(from,to){if(this.items.filter(i=>i.type==='soul').length>=(this.mobile?10:18))return;this.push({type:'soul',x:from.x,y:from.y,toX:to.x,toY:to.y-30,time:.65,max:.65,color:'#bea1ff'});}
    aura(unit,color){this.push({type:'aura',x:unit.x,y:unit.y,color,time:.6,max:.6});}
    allyHit(target,value){this.push({type:'allyDamage',x:target.x+(Math.random()-.5)*10,y:target.y-34,time:.72,max:.72,value:Math.round(value)});this.push({type:'impact',x:target.x,y:target.y-8,time:.2,max:.2,color:'#ff765c'});}
    warning(source,label,radius){this.push({type:'warning',x:source.x,y:source.y,time:1.05,max:1.05,label:label,radius:radius||24});}
    revive(hero){this.push({type:'revive',x:hero.x,y:hero.y,time:.8,max:.8,color:'#95ffe0'});}
    heal(target,value){this.push({type:'heal',x:target.x,y:target.y-target.radius-10,time:.75,max:.75,value:Math.round(value)});}
    update(dt){this.items.forEach(function(item){item.time-=dt;if(item.type==='mote'){item.x+=item.vx*dt;item.y+=item.vy*dt;item.vy+=55*dt;}});this.items=this.items.filter(function(item){return item.time>0;});}
    static drawStatus(ctx,m,clock){
      if(!m.active)return;ctx.save();ctx.translate(m.x,m.y);const pulse=.5+Math.sin((clock||0)*8)*.15;ctx.lineWidth=1.5;
      if(m.slowTimer>0){ctx.strokeStyle='#99e5ff';ctx.globalAlpha=.65;for(let i=0;i<3;i++){const x=(i-1)*13;ctx.beginPath();ctx.moveTo(x-3,5);ctx.lineTo(x, -8-i%2*5);ctx.lineTo(x+4,5);ctx.stroke();}}
      if(m.rootTime>0){ctx.strokeStyle='#8edf83';ctx.globalAlpha=.7;ctx.beginPath();ctx.ellipse(0,2,22,9,.2,0,Math.PI*2);ctx.stroke();ctx.beginPath();ctx.moveTo(-20,3);ctx.quadraticCurveTo(5,-30,18,0);ctx.stroke();}
      if(m.plagueDot){ctx.fillStyle='#708c47';ctx.globalAlpha=.18;for(let i=0;i<3;i++){ctx.beginPath();ctx.arc(Math.sin(clock*2+i*2)*13,-10-i*9,9,0,Math.PI*2);ctx.fill();}}
      if(m.vulnerability){ctx.strokeStyle='#c8a369';ctx.globalAlpha=pulse;ctx.beginPath();ctx.moveTo(-11,-32);ctx.lineTo(0,-46);ctx.lineTo(11,-32);ctx.lineTo(0,-18);ctx.closePath();ctx.stroke();}
      if(m.shockTime>0&&Math.sin(clock*23)>.1){ctx.strokeStyle='#b3dfff';ctx.globalAlpha=.85;ctx.beginPath();ctx.moveTo(-15,-8);ctx.lineTo(-8,-27);ctx.lineTo(3,-19);ctx.lineTo(13,-40);ctx.stroke();}
      if(m.natureMark){ctx.fillStyle='#91eaa1';ctx.globalAlpha=.65;ctx.beginPath();ctx.ellipse(16,-21,5,2,clock,0,Math.PI*2);ctx.fill();}
      if(m.arcaneMark>0){ctx.strokeStyle='#b9a0f5';ctx.globalAlpha=.5;ctx.beginPath();ctx.arc(0,3,18,clock,clock+Math.PI*1.4);ctx.stroke();}
      ctx.restore();
    }
    draw(ctx){
      this.items.forEach(function(item){const ratio=Math.max(0,item.time/item.max),age=1-ratio;ctx.save();ctx.globalAlpha=Math.min(1,ratio*2);
        if(item.type==='damage'||item.type==='gold'||item.type==='allyDamage'||item.type==='heal'){
          ctx.textAlign='center';ctx.lineWidth=3;ctx.strokeStyle='rgba(3,5,5,.9)';ctx.fillStyle=item.type==='gold'?'#f5c85b':item.type==='heal'?'#7df09b':item.type==='allyDamage'?'#ff7b69':item.critical?'#ff823d':'#fff1d2';ctx.font=(item.critical?'900 19px ':'800 14px ')+'Segoe UI';const label=item.type==='gold'?('+'+item.value+' Gold'):item.type==='heal'?('治療 +'+item.value):(item.critical?'暴擊 '+item.value:'-'+item.value);const y=item.y-age*(item.type==='gold'?30:22);ctx.strokeText(label,item.x,y);ctx.fillText(label,item.x,y);
        }else if(item.type==='impact'){
          ctx.translate(item.x,item.y);ctx.rotate(age*Math.PI);ctx.strokeStyle=item.color;ctx.shadowColor=item.color;ctx.shadowBlur=8;ctx.lineWidth=item.heavy?3:2;for(let i=0;i<(item.heavy?7:4);i++){ctx.rotate(Math.PI*2/(item.heavy?7:4));ctx.beginPath();ctx.moveTo(5,0);ctx.lineTo(8+age*(item.heavy?25:13),0);ctx.stroke();}
        }else if(item.type==='death'){
          ctx.strokeStyle=item.color;ctx.lineWidth=3;if(item.variant==='magic'){ctx.globalAlpha=ratio*.55;ctx.beginPath();ctx.moveTo(item.x-15*ratio,item.y);ctx.quadraticCurveTo(item.x+20,item.y-25-age*25,item.x,item.y-55*age);ctx.stroke();}ctx.beginPath();ctx.ellipse(item.x,item.y+4,10+age*(item.variant==='boss'?75:28),4+age*(item.variant==='boss'?28:12),0,0,Math.PI*2);ctx.stroke();
        }else if(item.type==='warning'){
          ctx.globalAlpha=.35+ratio*.45;ctx.strokeStyle='#ff4d5d';ctx.fillStyle='rgba(255,53,70,.1)';ctx.lineWidth=3;ctx.beginPath();ctx.arc(item.x,item.y,item.radius*(.82+age*.18),0,Math.PI*2);ctx.fill();ctx.stroke();ctx.fillStyle='#ffe0a8';ctx.font='900 12px Segoe UI';ctx.textAlign='center';ctx.fillText(item.label,item.x,item.y-item.radius-8);
        }else if(item.type==='revive'){
          ctx.strokeStyle=item.color;ctx.lineWidth=4;ctx.beginPath();ctx.arc(item.x,item.y,14+age*40,0,Math.PI*2);ctx.stroke();
        }else if(item.type==='explosion'){
          const radius=item.radius,expansion=Math.min(1,age*2.4);ctx.translate(item.x,item.y);ctx.strokeStyle=item.color;ctx.lineWidth=3*ratio;
          if(age<.65){const glow=ctx.createRadialGradient(0,0,0,0,0,radius*.8);if(glow&&glow.addColorStop){glow.addColorStop(0,item.style==='ice'?'#d8f9ff':item.style==='nature'?'#ceffc7':'#fff4c2');glow.addColorStop(.25,item.color);glow.addColorStop(1,'transparent');ctx.fillStyle=glow;ctx.globalAlpha=ratio*.6;ctx.fillRect(-radius,-radius,radius*2,radius*2);}}
          ctx.globalAlpha=ratio;
          ctx.beginPath();ctx.arc(0,0,radius*expansion,0,Math.PI*2);ctx.stroke();
          if(age<.5){ctx.globalAlpha=(1-age/.5)*.8;ctx.fillStyle=item.style==='ice'?'#c7f3ff':item.style==='nature'?'#adf6ba':'#ffda89';ctx.beginPath();ctx.arc(0,0,radius*(.18+age*.65),0,Math.PI*2);ctx.fill();if(item.style!=='ice'&&item.style!=='nature'){ctx.fillStyle='#fff3bb';ctx.globalAlpha=ratio*.7;for(let k=0;k<5;k++){const a=k*Math.PI*2/5;ctx.beginPath();ctx.arc(Math.cos(a)*radius*age*.55,Math.sin(a)*radius*age*.45,radius*.09*ratio,0,Math.PI*2);ctx.fill();}}}
          for(let i=0;i<8;i++){const a=i*Math.PI/4+.2,r=radius*expansion*.8;ctx.globalAlpha=ratio*.8;ctx.strokeStyle=item.style==='ice'?'#a1e7ff':item.color;ctx.beginPath();ctx.moveTo(Math.cos(a)*r*.7,Math.sin(a)*r*.7);ctx.lineTo(Math.cos(a)*r,Math.sin(a)*r);ctx.stroke();}
          if(age>.2&&item.style!=='ice'&&item.style!=='nature'){ctx.globalAlpha=ratio*.14;ctx.fillStyle='#96918b';for(let i=0;i<4;i++){const a=i*Math.PI/2;ctx.beginPath();ctx.arc(Math.cos(a)*radius*.4,Math.sin(a)*radius*.35-age*18,radius*.22,0,Math.PI*2);ctx.fill();}}
        }else if(item.type==='soul'){
          const x=item.x+(item.toX-item.x)*age,y=item.y+(item.toY-item.y)*age-Math.sin(age*Math.PI)*26;ctx.fillStyle=item.color;ctx.beginPath();ctx.ellipse(x,y,3.5,6,age,0,Math.PI*2);ctx.fill();ctx.globalAlpha=ratio*.3;ctx.beginPath();ctx.ellipse(x-5,y+9,2,7,.3,0,Math.PI*2);ctx.fill();
        }else if(item.type==='aura'){
          ctx.strokeStyle=item.color;ctx.globalAlpha=ratio*.35;ctx.lineWidth=1.5;ctx.beginPath();ctx.ellipse(item.x,item.y+5,18+age*8,6+age*3,0,0,Math.PI*2);ctx.stroke();
        }else if(item.type==='mote'){
          ctx.fillStyle=item.color;ctx.beginPath();ctx.arc(item.x,item.y,2+ratio*2,0,Math.PI*2);ctx.fill();
        }
        ctx.restore();
      });
    }
  }
  ns.systems.CombatFeedbackSystem=CombatFeedbackSystem;
})(globalThis.TowerFrontier);
