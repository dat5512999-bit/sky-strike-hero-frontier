(function(ns){
  'use strict';
  class FrostlandHero {
    static cast(hero,slot,monsters,onKill,onHit){
      if(!hero.active)return false;
      const cooldown=slot===0?hero.novaCooldown:hero.skillCooldowns.thunder;if(cooldown>0)return false;
      const targets=monsters.filter(m=>m.active&&ns.utils.distance(hero,m)<=210).sort((a,b)=>Number(ns.systems.FrostStatusSystem.isWindow(b))-Number(ns.systems.FrostStatusSystem.isWindow(a))||b.progress()-a.progress());
      if(!targets.length)return false;
      const cfg=ns.systems.HeroRoster.get('frostland'),color=ns.systems.EquipmentSystem.effectColor(hero,cfg.color),power=hero.skillPower();
      for(const target of targets.slice(0,slot===0?4:1)){
        new ns.entities.Projectile(hero,target,{damage:(slot===0?26:60)*power,frost:slot===0?45:12,shatter:slot===0?0:1.8,shatterRadius:65,frozenBonus:1.2,attackType:'chaos',color,style:'ice'}).hit(monsters,onKill,onHit);
        ns.systems.FrostlandVFX?.emit(hero.synergy,slot===0?'mark':'spear',hero,{target:{x:target.x,y:target.y},color});
        hero.synergy?.pulse(target.x,target.y,color,slot===0?32:65);
      }
      if(slot===0)hero.novaCooldown=9*(1-hero.equipment.rune*.1);else hero.skillCooldowns.thunder=12*(1-hero.equipment.rune*.1);
      hero.beginCast();return true;
    }
    static hunt(hero){
      if(!hero.active||hero.skillCooldowns.summon>0)return false;
      const duration=5+(hero.equipment.charm||0);hero.huntTime=duration;
      for(const unit of hero.synergy?.game?.build?.items||[]){if(unit.kind==='unit'&&unit.active&&!unit.retired&&unit.config().frostland&&ns.utils.distance(hero,unit)<=230)unit.huntTime=duration;}
      ns.systems.FrostlandVFX?.emit(hero.synergy,'hunt',hero);
      hero.synergy?.pulse(hero.x,hero.y,'#c6e5bb',230);hero.skillCooldowns.summon=22*(1-hero.equipment.rune*.1);hero.beginCast();return true;
    }
    static ultimate(hero,monsters){
      const synergy=hero.synergy,game=synergy?.game;if(!hero.active||hero.skillCooldowns.ultimate>0||!game?.waves?.active||!monsters.some(m=>m.active))return null;
      const cfg=ns.systems.HeroUltimateSystem.get('frostland'),r=ns.config.frostRules;
      synergy.winter={time:r.winterDuration,tick:0,owner:hero,power:hero.skillPower()};synergy.frostChainBudget=r.chainBudget;
      hero.huntTime=r.winterDuration;hero.skillCooldowns.ultimate=cfg.cooldown*(1-hero.equipment.rune*.1);hero.beginCast();
      ns.systems.FrostlandVFX?.emit(synergy,'winter',hero);
      synergy.pulse(hero.x,hero.y,cfg.color,240);
      return {name:cfg.name,x:hero.x,y:hero.y,radius:cfg.radius,color:cfg.color,count:monsters.filter(m=>m.active).length};
    }
  }
  ns.systems.FrostlandHero=FrostlandHero;
})(globalThis.TowerFrontier);
