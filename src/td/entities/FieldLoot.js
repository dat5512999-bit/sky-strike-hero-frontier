(function(ns){
  'use strict';
  const RARITY={
    '傳說':{light:'#ffc45d',core:'#fff1ad',edge:'#d77a22'},
    '史詩':{light:'#c98cff',core:'#f0d7ff',edge:'#7944bd'},
    '精良':{light:'#72e5b0',core:'#d8ffe9',edge:'#278d68'}
  };
  class FieldLoot{
    constructor(id,item,x,y){this.id=id;this.item=item;this.x=x;this.y=y;this.time=24;this.active=true;this.pulse=Math.random()*Math.PI*2;}
    update(dt,hero){this.time-=dt;this.pulse+=dt*4;if(hero&&hero.active&&Math.hypot(hero.x-this.x,hero.y-this.y)<=58)return true;return this.time<=0;}
    draw(ctx,art){
      const gear=this.item.gear&&ns.systems.ArmorySystem.item(this.item.gear),palette=RARITY[this.item.rarity]||RARITY['精良'],bob=Math.sin(this.pulse)*2,glow=.72+Math.sin(this.pulse)*.12,atlas=art&&art.equipmentAtlas;
      ctx.save();ctx.translate(this.x,this.y);
      const beam=ctx.createLinearGradient(0,-76,0,5);beam.addColorStop(0,'rgba(255,255,255,0)');beam.addColorStop(.45,palette.light+'28');beam.addColorStop(1,palette.light+'70');ctx.globalAlpha=glow;ctx.fillStyle=beam;ctx.beginPath();ctx.moveTo(-9,-70);ctx.lineTo(9,-70);ctx.lineTo(22,2);ctx.lineTo(-22,2);ctx.closePath();ctx.fill();ctx.globalAlpha=1;
      ctx.fillStyle='#06100db8';ctx.strokeStyle=palette.edge;ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(0,3,25,10,0,0,Math.PI*2);ctx.fill();ctx.stroke();ctx.globalAlpha=.42;ctx.strokeStyle=palette.core;ctx.lineWidth=1;ctx.beginPath();ctx.ellipse(0,3,17,6,0,0,Math.PI*2);ctx.stroke();ctx.globalAlpha=1;
      ctx.translate(0,-27+bob);ctx.shadowColor=palette.light;ctx.shadowBlur=18;ctx.fillStyle='#08110fe8';ctx.strokeStyle=palette.core;ctx.lineWidth=2;ctx.beginPath();ctx.roundRect(-22,-22,44,44,8);ctx.fill();ctx.stroke();ctx.shadowBlur=5;
      if(gear&&atlas&&atlas.complete&&atlas.naturalWidth){const sw=atlas.naturalWidth/3,sh=atlas.naturalHeight/3;ctx.drawImage(atlas,gear.column*sw,gear.row*sh,sw,sh,-19,-19,38,38);}else{ctx.fillStyle=palette.core;ctx.font='bold 18px "Microsoft JhengHei",sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(gear?({weapon:'弓',armor:'盾',relic:'寶'}[gear.slot]||'寶'):(this.item.icon||'寶'),0,1);}
      ctx.shadowBlur=0;ctx.fillStyle=palette.core;ctx.beginPath();ctx.moveTo(-5,-29);ctx.lineTo(5,-29);ctx.lineTo(0,-36-Math.sin(this.pulse)*2);ctx.closePath();ctx.fill();ctx.restore();
    }
  }
  ns.entities.FieldLoot=FieldLoot;
})(globalThis.TowerFrontier);
