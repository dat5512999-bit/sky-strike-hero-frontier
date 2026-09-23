(function(ns){
  'use strict';
  const ULTIMATES={
    frostland:{name:'寒冬合獵',icon:'❄',cooldown:70,range:99999,radius:720,color:'#9bdbd5',hint:'6 秒全場每秒 +26 Frost；冰原獵群狩獵，窗口擊殺最多二層連鎖碎冰；冷卻 70 秒'},
    hunter:{name:'王城箭雨',icon:'➶',cooldown:65,range:290,radius:145,color:'#ffd77d',hint:'鎖定前線敵群，箭雨攻擊最多十二名敵人並緩速；冷卻 65 秒'},
    arcanist:{name:'星墜寒潮',icon:'✦',cooldown:68,range:270,radius:155,color:'#8eeaff',hint:'轟擊最密集的敵群，造成高額魔法傷害與強力緩速；冷卻 68 秒'},
    rogue:{name:'血月獵殺',icon:'◆',cooldown:62,range:245,radius:90,color:'#e797e8',hint:'突入最高威脅目標旁，重創主目標並斬擊周圍敵人；冷卻 62 秒'},
    chief:{name:'萬獸戰吼',icon:'✹',cooldown:66,range:270,radius:125,color:'#ff764d',hint:'重擊前線敵群並引爆部族士氣，使附近荒野士兵進入狂潮；冷卻 66 秒'},
    goblin:{name:'全網超載',icon:'⚙',cooldown:68,range:720,radius:175,color:'#ffbd68',hint:'所有供電機械爆發 5 秒，隨後冷卻停機 7 秒；冷卻 68 秒'}
  };
  class HeroUltimateSystem{
    static get(type){return ULTIMATES[type]||ULTIMATES.arcanist;}
    static cast(hero,monsters,onKill,onHit){
      if(!hero||!hero.active||hero.skillCooldowns.ultimate>0)return null;
      if(hero.classType==='frostland')return ns.systems.FrostlandHero.ultimate(hero,monsters);
      if(hero.classType==='goblin'){
        const game=hero.synergy?.game,network=game?.goblinNetwork;
        if(!game?.waves?.active||!network||!network.activate(game.build.items))return null;
        const cfg=this.get('goblin');hero.skillCooldowns.ultimate=cfg.cooldown*(1-hero.equipment.rune*.1);hero.beginCast();ns.systems.HeroSkillVFX.emit(hero,'goblin-overload',{radius:125,duration:.85});
        return{name:cfg.name,x:hero.x,y:hero.y,radius:cfg.radius,color:cfg.color,count:network.links.length};
      }
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
        const damage=hero.classType==='hunter'?100*power:hero.classType==='arcanist'?115*power:hero.classType==='chief'?(index===0?165:105)*power:(index===0?190:80)*power;
        const slow=hero.classType==='arcanist'?.2:hero.classType==='hunter'?.5:.6;
        const slowTime=hero.classType==='arcanist'?3.2:hero.classType==='hunter'?2:1.2;
        new ns.entities.Projectile(hero,monster,{damage:damage,color:color,attackType:hero.classType==='hunter'?'pierce':hero.classType==='arcanist'?'magic':'chaos',slow:slow,slowTime:slowTime}).hit(monsters,onKill,onHit);
      });
      if(hero.classType==='chief'&&hero.synergy)hero.synergy.game.build.combatUnits().filter(unit=>['orc','centaur','boarRider','minotaur','shaman'].includes(unit.type)&&ns.utils.distance(hero,unit)<=245).forEach(unit=>{unit.tribalFrenzy=Math.max(unit.tribalFrenzy||0,5);unit.drumEmpowered=true;});
      ns.systems.HeroSkillVFX.emit(hero,'ultimate-'+hero.classType,{x:center.x,y:center.y,radius:cfg.radius,targets:victims.map(m=>({x:m.x,y:m.y})),duration:.8});
      hero.skillCooldowns.ultimate=cfg.cooldown*(1-hero.equipment.rune*.1);
      hero.beginCast();
      return{name:cfg.name,x:center.x,y:center.y,radius:cfg.radius,color:color,count:victims.length};
    }
  }
  ns.systems.HeroUltimateSystem=HeroUltimateSystem;
})(globalThis.TowerFrontier);
