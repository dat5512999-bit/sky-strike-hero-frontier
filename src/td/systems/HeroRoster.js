(function(ns){
  'use strict';
  const CLASSES={
    hunter:{name:'守誓者・雷恩',faction:'人族 · 王國獵手',color:'#e6c56c',selectionArt:'assets/td/opening/hero-hunter-selection-v1.png',selectionFocus:'50% 22%',range:195,damage:20,interval:.75,attackType:'pierce',skills:['穿雲多重箭','獵獸陷阱','召喚戰狼'],shortSkills:['穿雲箭','獵獸陷阱','召喚戰狼'],icons:['➶','⌾','♞'],hints:['射程內最多三個敵人，冷卻9秒','在腳下布置8秒陷阱，持續緩速，冷卻12秒','召喚近戰戰狼，冷卻22秒']},
    arcanist:{name:'森語者・希爾芙',faction:'精靈 · 奧術學院',color:'#70e7ff',selectionArt:'assets/td/opening/hero-arcanist-selection-v1.png',selectionFocus:'50% 20%',range:152,damage:18,interval:.58,attackType:'magic',skills:['霜環震擊','連鎖雷擊','召喚元素'],shortSkills:['霜環','連鎖雷擊','召喚元素'],icons:['❄','ϟ','✧'],hints:['周圍冰爆並緩速，冷卻9秒','雷電跳躍最多四個敵人，冷卻12秒','召喚遠程元素守衛，冷卻22秒']},
    rogue:{name:'影行者・維菈',faction:'暗影氏族 · 暗影行會',color:'#c884df',selectionArt:'assets/td/opening/hero-rogue-selection-v1.png',selectionFocus:'50% 19%',range:100,damage:15,interval:.38,attackType:'chaos',skills:['暗影閃擊','淬毒煙幕','暗影分身'],shortSkills:['閃擊','淬毒煙幕','暗影分身'],icons:['◆','☠','◐'],hints:['閃至附近目標旁並重擊，冷卻9秒','腳下生成6秒毒霧，持續傷害，冷卻12秒','召喚快速近戰分身，冷卻22秒']}
  };
  class HeroRoster{
    static get(type){return CLASSES[type]||CLASSES.arcanist;}
    static cast(hero,slot,monsters,onKill,onHit){
      const cfg=this.get(hero.classType),cooldown=slot===0?'novaCooldown':null;
      if((cooldown?hero[cooldown]:hero.skillCooldowns.thunder)>0)return false;
      const targets=monsters.filter(m=>m.active&&ns.utils.distance(hero,m)<=cfg.range+35).sort((a,b)=>b.progress()-a.progress());
      const power=typeof hero.skillPower==='function'?hero.skillPower():1+hero.equipment.spear*.2,weaponColor=ns.systems.EquipmentSystem.effectColor(hero,cfg.color);
      if(slot===0){
        if(!targets.length)return false;
        hero.skillTrails=targets.slice(0,hero.classType==='hunter'?3:1).map(target=>({x:hero.x,y:hero.y,tx:target.x,ty:target.y,time:.3,color:weaponColor}));
        if(hero.classType==='hunter')targets.slice(0,3).forEach(target=>new ns.entities.Projectile(hero,target,{damage:48*power,color:weaponColor,attackType:'pierce'}).hit(monsters,onKill,onHit));
        else{const target=targets[0];hero.x=ns.utils.clamp(target.x-28,25,695);hero.y=ns.utils.clamp(target.y+22,55,695);hero.setTarget(hero.x,hero.y);new ns.entities.Projectile(hero,target,{damage:95*power,color:weaponColor,attackType:'chaos'}).hit(monsters,onKill,onHit);}
        hero.novaCooldown=9*(1-hero.equipment.rune*.1);
      }else{
        hero.fields.push({x:hero.x,y:hero.y,time:hero.classType==='hunter'?8:6,tick:0,type:hero.classType,power:power});
        hero.skillCooldowns.thunder=12*(1-hero.equipment.rune*.1);
      }
      hero.beginCast();return true;
    }
    static updateFields(hero,dt,monsters,onKill,onHit){
      hero.skillTrails=(hero.skillTrails||[]).filter(trail=>{trail.time-=dt;return trail.time>0;});
      hero.fields.forEach(field=>{const elapsed=Math.min(dt,field.time);field.time-=elapsed;field.tick+=elapsed;while(field.tick>=.5){field.tick-=.5;monsters.forEach(monster=>{if(!monster.active||ns.utils.distance(field,monster)>72)return;if(field.type==='hunter')monster.applySlow(.35,.7);else new ns.entities.Projectile(hero,monster,{damage:9*field.power,color:'#c884df',attackType:'chaos'}).hit(monsters,onKill,onHit);});}});
      hero.fields=hero.fields.filter(field=>field.time>0);
    }
    static drawFields(ctx,hero){(hero.skillTrails||[]).forEach(trail=>{ctx.save();ctx.globalAlpha=trail.time/.3;ctx.strokeStyle=trail.color||this.get(hero.classType).color;ctx.lineWidth=4+hero.equipment.spear*.6;ctx.beginPath();ctx.moveTo(trail.x,trail.y);ctx.lineTo(trail.tx,trail.ty);ctx.stroke();ctx.restore();});hero.fields.forEach(field=>{ctx.save();ctx.fillStyle=field.type==='hunter'?'#d6b66b':'#b37ddb';ctx.strokeStyle=ctx.fillStyle;ctx.globalAlpha=.18;ctx.beginPath();ctx.arc(field.x,field.y,72,0,Math.PI*2);ctx.fill();ctx.globalAlpha=.7;ctx.lineWidth=2;ctx.stroke();ctx.font='bold 14px Segoe UI';ctx.textAlign='center';ctx.fillText(field.type==='hunter'?'獵獸陷阱':'淬毒煙幕',field.x,field.y);ctx.restore();});}
  }
  HeroRoster.CLASSES=CLASSES;ns.systems.HeroRoster=HeroRoster;
})(globalThis.TowerFrontier);
