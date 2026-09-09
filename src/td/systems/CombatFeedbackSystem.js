(function(ns){
  'use strict';
  class CombatFeedbackSystem{
    constructor(){this.items=[];}
    reset(){this.items=[];}
    push(item){this.items.push(item);if(this.items.length>120)this.items.splice(0,this.items.length-120);}
    hit(monster,damage,critical,color){
      this.push({type:'impact',x:monster.x,y:monster.y,time:.22,max:.22,color:color||'#fff1b2'});
      this.push({type:'damage',x:monster.x+(Math.random()-.5)*12,y:monster.y-monster.radius-12,time:.78,max:.78,value:Math.max(1,Math.round(damage)),critical:Boolean(critical)});
    }
    gold(monster,value){this.push({type:'gold',x:monster.x,y:monster.y-8,time:1.05,max:1.05,value:Math.round(value)});}
    death(monster){
      this.push({type:'death',x:monster.x,y:monster.y,time:.48,max:.48,color:monster.color});
      for(let i=0;i<5;i++){const angle=Math.PI*2*i/5;this.push({type:'mote',x:monster.x,y:monster.y,vx:Math.cos(angle)*(28+i*3),vy:Math.sin(angle)*(22+i*2)-18,time:.55,max:.55,color:monster.color});}
    }
    allyHit(target,value){this.push({type:'allyDamage',x:target.x+(Math.random()-.5)*10,y:target.y-34,time:.72,max:.72,value:Math.round(value)});this.push({type:'impact',x:target.x,y:target.y-8,time:.2,max:.2,color:'#ff765c'});}
    warning(source,label,radius){this.push({type:'warning',x:source.x,y:source.y,time:1.05,max:1.05,label:label,radius:radius||24});}
    revive(hero){this.push({type:'revive',x:hero.x,y:hero.y,time:.8,max:.8,color:'#95ffe0'});}
    update(dt){this.items.forEach(function(item){item.time-=dt;if(item.type==='mote'){item.x+=item.vx*dt;item.y+=item.vy*dt;item.vy+=55*dt;}});this.items=this.items.filter(function(item){return item.time>0;});}
    draw(ctx){
      this.items.forEach(function(item){const ratio=Math.max(0,item.time/item.max),age=1-ratio;ctx.save();ctx.globalAlpha=Math.min(1,ratio*2);
        if(item.type==='damage'||item.type==='gold'||item.type==='allyDamage'){
          ctx.textAlign='center';ctx.lineWidth=3;ctx.strokeStyle='rgba(3,5,5,.9)';ctx.fillStyle=item.type==='gold'?'#f5c85b':item.type==='allyDamage'?'#ff7b69':item.critical?'#ff823d':'#fff1d2';ctx.font=(item.critical?'900 19px ':'800 14px ')+'Segoe UI';const label=item.type==='gold'?('+'+item.value+' Gold'):(item.critical?'暴擊 '+item.value:'-'+item.value);const y=item.y-age*(item.type==='gold'?30:22);ctx.strokeText(label,item.x,y);ctx.fillText(label,item.x,y);
        }else if(item.type==='impact'){
          ctx.translate(item.x,item.y);ctx.rotate(age*Math.PI);ctx.strokeStyle=item.color;ctx.shadowColor=item.color;ctx.shadowBlur=8;ctx.lineWidth=2;for(let i=0;i<4;i++){ctx.rotate(Math.PI/2);ctx.beginPath();ctx.moveTo(5,0);ctx.lineTo(8+age*13,0);ctx.stroke();}
        }else if(item.type==='death'){
          ctx.strokeStyle=item.color;ctx.lineWidth=3;ctx.beginPath();ctx.ellipse(item.x,item.y+4,10+age*28,4+age*12,0,0,Math.PI*2);ctx.stroke();
        }else if(item.type==='warning'){
          ctx.globalAlpha=.35+ratio*.45;ctx.strokeStyle='#ff4d5d';ctx.fillStyle='rgba(255,53,70,.1)';ctx.lineWidth=3;ctx.beginPath();ctx.arc(item.x,item.y,item.radius*(.82+age*.18),0,Math.PI*2);ctx.fill();ctx.stroke();ctx.fillStyle='#ffe0a8';ctx.font='900 12px Segoe UI';ctx.textAlign='center';ctx.fillText(item.label,item.x,item.y-item.radius-8);
        }else if(item.type==='revive'){
          ctx.strokeStyle=item.color;ctx.lineWidth=4;ctx.beginPath();ctx.arc(item.x,item.y,14+age*40,0,Math.PI*2);ctx.stroke();
        }else if(item.type==='mote'){
          ctx.fillStyle=item.color;ctx.beginPath();ctx.arc(item.x,item.y,2+ratio*2,0,Math.PI*2);ctx.fill();
        }
        ctx.restore();
      });
    }
  }
  ns.systems.CombatFeedbackSystem=CombatFeedbackSystem;
})(globalThis.TowerFrontier);
