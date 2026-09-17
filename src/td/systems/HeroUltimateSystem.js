(function(ns){
  'use strict';
  const ULTIMATES={
    hunter:{name:'王城箭雨',icon:'➶',cooldown:65,range:290,radius:145,color:'#ffd77d',hint:'鎖定前線敵群，箭雨攻擊最多十二名敵人並緩速；冷卻 65 秒'},
    arcanist:{name:'星墜寒潮',icon:'✦',cooldown:68,range:270,radius:155,color:'#8eeaff',hint:'轟擊最密集的敵群，造成高額魔法傷害與強力緩速；冷卻 68 秒'},
    rogue:{name:'血月獵殺',icon:'◆',cooldown:62,range:245,radius:90,color:'#e797e8',hint:'突入最高威脅目標旁，重創主目標並斬擊周圍敵人；冷卻 62 秒'}
  };
  class HeroUltimateSystem{
    static get(type){return ULTIMATES[type]||ULTIMATES.arcanist;}
    static cast(hero,monsters,onKill,onHit){
      if(!hero||!hero.active||hero.skillCooldowns.ultimate>0)return null;
      const cfg=this.get(hero.classType),candidates=monsters.filter(monster=>monster.active&&ns.utils.distance(hero,monster)<=cfg.range);
      if(!candidates.length)return null;
      let target;
      if(hero.classType==='arcanist'){
        target=candidates.slice().sort((a,b)=>{
          const density=m=>monsters.filter(other=>other.active&&ns.utils.distance(m,other)<=cfg.radius).length;
          return density(b)-density(a)||b.progress()-a.progress();
        })[0];
      }else if(hero.classType==='rogue'){
        target=candidates.slice().sort((a,b)=>(b.effectiveHealth?b.effectiveHealth():b.health)-(a.effectiveHealth?a.effectiveHealth():a.health)||b.progress()-a.progress())[0];
      }else target=candidates.slice().sort((a,b)=>b.progress()-a.progress())[0];
      const center={x:target.x,y:target.y},power=hero.skillPower(),color=ns.systems.EquipmentSystem.effectColor(hero,cfg.color);
      const victims=monsters.filter(monster=>monster.active&&ns.utils.distance(center,monster)<=cfg.radius).sort((a,b)=>a===target?-1:b===target?1:b.progress()-a.progress()).slice(0,hero.classType==='rogue'?7:12);
      if(hero.classType==='rogue'){
        hero.x=ns.utils.clamp(target.x-30,25,ns.config.width-25);
        hero.y=ns.utils.clamp(target.y+20,55,ns.config.height-25);
        hero.setTarget(hero.x,hero.y);
      }
      victims.forEach((monster,index)=>{
        if(!monster.active)return;
        const damage=hero.classType==='hunter'?100*power:hero.classType==='arcanist'?115*power:(index===0?190:80)*power;
        const slow=hero.classType==='arcanist'?.2:hero.classType==='hunter'?.5:.6;
        const slowTime=hero.classType==='arcanist'?3.2:hero.classType==='hunter'?2:1.2;
        new ns.entities.Projectile(hero,monster,{damage:damage,color:color,attackType:hero.classType==='hunter'?'pierce':hero.classType==='arcanist'?'magic':'chaos',slow:slow,slowTime:slowTime}).hit(monsters,onKill,onHit);
      });
      ns.systems.HeroSkillVFX.emit(hero,'ultimate-'+hero.classType,{x:center.x,y:center.y,radius:cfg.radius,targets:victims.map(m=>({x:m.x,y:m.y})),duration:.8});
      hero.skillCooldowns.ultimate=cfg.cooldown*(1-hero.equipment.rune*.1);
      hero.beginCast();
      return{name:cfg.name,x:center.x,y:center.y,radius:cfg.radius,color:color,count:victims.length};
    }
  }
  ns.systems.HeroUltimateSystem=HeroUltimateSystem;
})(globalThis.TowerFrontier);
