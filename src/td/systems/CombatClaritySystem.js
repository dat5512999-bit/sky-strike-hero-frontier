(function(ns){
  'use strict';
  // Presentation-only diagnostics. Never changes damage, targeting or wave timing.
  class CombatClaritySystem{
    static upgradePreview(item){
      if(!item||item.level>=5)return'';
      const before=item.config(),next=Object.create(item);next.level=item.level+1;
      const after=next.config(),parts=[];
      if(!before.supportOnly&&Number.isFinite(before.damage)&&Number.isFinite(after.damage))parts.push('攻擊 '+Math.round(before.damage)+' → '+Math.round(after.damage));
      if(Number.isFinite(before.range)&&Number.isFinite(after.range))parts.push('射程 '+Math.round(before.range)+' → '+Math.round(after.range));
      if(!before.supportOnly&&Number.isFinite(before.interval)&&Number.isFinite(after.interval))parts.push('間隔 '+before.interval.toFixed(2)+' → '+after.interval.toFixed(2)+' 秒');
      for(const key of ['allyHasteRadius','damageAura','discount'])if(Number.isFinite(before[key])&&Number.isFinite(after[key]))parts.push(({allyHasteRadius:'支援範圍',damageAura:'傷害光環',discount:'折扣'})[key]+' '+(key==='allyHasteRadius'?Math.round(before[key])+' → '+Math.round(after[key]):Math.round(before[key]*100)+'% → '+Math.round(after[key]*100)+'%'));
      return parts.join('｜');
    }
    static selectionStatus(item,monsters){
      if(!item||item.active===false)return'';
      const cfg=item.config();if(cfg.supportOnly)return'支援建築 · 不直接攻擊';
      if(item.staggerTimer>0)return'暈眩中 · 暫時無法攻擊';
      if(item.networkCooling)return'網路冷卻中 · 暫時無法攻擊';
      if(cfg.networkCost>=2&&!item.networkPowered)return'供能不足 · 無法攻擊';
      const target=item.kind==='unit'?item.lockedTarget:item.currentTarget;
      if(target?.active&&(!target.isTargetableBy||target.isTargetableBy(item))&&ns.utils.distance(item,target)<=cfg.range){
        if(target.immuneAttackTypes?.includes(cfg.attackType))return'目前目標：'+(target.name||ns.entities.Monster.TYPES[target.type]?.name||'敵軍')+' · 免疫此攻擊類型';
        return'目前目標：'+(target.name||ns.entities.Monster.TYPES[target.type]?.name||'敵軍')+(item.cooldown>0?' · 攻擊間隔 '+item.cooldown.toFixed(1)+' 秒':' · 可攻擊');
      }
      const active=(monsters||[]).filter(m=>m.active&&!m.leaked);
      if(!active.length)return'目前沒有敵軍';
      const inRange=active.filter(m=>ns.utils.distance(item,m)<=cfg.range);
      if(!inRange.length)return'敵軍尚未進入射程';
      if(inRange.every(m=>m.concealed&&!m.revealed))return'射程內敵軍未揭露';
      if(inRange.every(m=>m.flying&&!item.canHitAir))return'射程內皆為飛行敵軍，無法對空';
      if(inRange.every(m=>m.immuneAttackTypes?.includes(cfg.attackType)))return'射程內敵軍免疫此攻擊類型';
      return'正在尋找可攻擊目標';
    }
    static gateThreat(monsters){
      let closest=null,remaining=Infinity;
      for(const monster of monsters||[]){if(!monster.active||monster.leaked||typeof monster.remainingDistance!=='function')continue;
        const distance=monster.remainingDistance(),speed=Math.max(1,(monster.speed||0)*(monster.slowFactor??1)*(monster.moveAura??1));
        if(distance>Math.min(180,speed*3)||distance>=remaining)continue;
        closest=monster;remaining=distance;
      }
      return closest;
    }
    static waveAdvice(record){
      if(!record)return'';
      if(record.leaks>0){const entries=Object.entries(record.leakTypes||{}).sort((a,b)=>b[1]-a[1]);const type=entries[0]?.[0],name=ns.entities.Monster.TYPES[type]?.name||'敵軍';return'本波漏怪 '+record.leaks+' 隻（最多：'+name+'）· 下一波優先補強出口前火力或緩速';}
      if(record.heroDowns>0)return'本波沒有漏怪，但英雄倒下 '+record.heroDowns+' 次 · 下波保留撤退空間';
      if(record.time>record.parTime*1.25)return'本波守成但清場較慢 · 可檢查火力是否覆蓋主要彎道';
      return'本波零漏怪 · 防線穩定，可依下一波情報整備';
    }
    static skillFailure(hero,slot,fallback){
      const seconds=slot==='q'?hero.novaCooldown:hero.skillCooldowns?.[{w:'thunder',e:'summon',f:'ultimate'}[slot]];
      return seconds>0?'技能冷卻中，剩餘 '+seconds.toFixed(1)+' 秒':fallback;
    }
  }
  ns.systems.CombatClaritySystem=CombatClaritySystem;
})(globalThis.TowerFrontier);
