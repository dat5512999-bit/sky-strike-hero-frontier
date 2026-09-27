(function(ns){
  'use strict';
  // A readable balance contract for the enemy side.  Combat numbers stay in
  // Monster.js; this catalog makes every pressure mechanic and its intended
  // player answer explicit, so a new wave cannot quietly introduce an
  // unanswerable counter.
  const PROFILES=Object.freeze({
    wildDragon:{role:'elite',pressure:'秘法甲的高耐久前排',answer:'以混合傷害和持續輸出拆解'},
    halberdier:{role:'heavy',pressure:'重甲中速前排',answer:'用魔法、破甲或集中火力處理'},
    treant:{role:'elite',pressure:'低速秘法甲耐久目標',answer:'以範圍魔法與持續輸出處理'},
    fallenKnight:{role:'heavy',pressure:'重甲推進與中速漏怪',answer:'以控制後接爆發處理'},
    grunt:{role:'swarm',pressure:'低耐久基礎數量',answer:'用範圍與連鎖火力清場'},
    runner:{role:'runner',pressure:'高速、低耐久漏怪',answer:'用緩速、攔截與快速鎖定'},
    brute:{role:'siege',pressure:'重甲並會攻擊英雄的攻城單位',answer:'用破甲、控制並優先保護英雄'},
    shaman:{role:'hunter',pressure:'遠程壓制英雄',answer:'以遠程優先或突擊切入'},
    warder:{role:'shield',pressure:'護盾加重甲的前排緩衝',answer:'先打掉護盾，再用魔法或破甲'},
    healer:{role:'support',pressure:'持續治療受傷前排',answer:'優先擊殺或以範圍傷害壓過治療'},
    commander:{role:'support',pressure:'加速並加一層護甲的移動光環',answer:'先切旗手，保留減速覆蓋'},
    direwolf:{role:'runner',pressure:'最高速的低耐久漏怪',answer:'用緩速、攔截與快速鎖定'},
    raider:{role:'siege',pressure:'中速重甲、會攻擊英雄',answer:'用破甲並拉開英雄位置'},
    revenant:{role:'hunter',pressure:'秘法甲遠程獵殺英雄',answer:'以遠程優先或突擊切入'},
    boss:{role:'boss',pressure:'三階段首領、二階援軍與狂暴',answer:'留爆發窗口，先拆護衛與支援'},
    nagaSiltImp:{role:'swarm',pressure:'後期高速娜迦數量壓力',answer:'用範圍與連鎖火力清場'},
    nagaShellbreaker:{role:'siege',pressure:'鹽甲重裝、會攻擊英雄',answer:'用魔法、破甲和控制'},
    nagaSiltwaterDemonlord:{role:'boss',pressure:'終局三階首領與四族援軍',answer:'先拆護衛與祭司，再於狂暴前爆發'},
    goblinScavenger:{role:'runner',pressure:'高速地精數量',answer:'用緩速、攔截與範圍火力'},
    goblinSapper:{role:'hunter',pressure:'遠程工兵壓制英雄',answer:'以遠程優先或突擊切入'},
    goblinVeilrunner:{role:'trait',pressure:'未揭露前無法鎖定的高速單位',answer:'用隱形魔石或英雄視野揭露'},
    orcBanner:{role:'support',pressure:'範圍加兩層護甲的戰旗',answer:'優先擊殺戰旗，搭配魔法或破甲'},
    orcSkullcrusher:{role:'siege',pressure:'最高重甲並會攻擊英雄的重裝',answer:'用破甲、控制並保護英雄'},
    orcMirrorGuard:{role:'trait',pressure:'重甲且可使士兵短暫暈厥',answer:'以英雄、控制和分散火力處理'},
    frostRimeStalker:{role:'runner',pressure:'高速霜原切線',answer:'用緩速、攔截與快速鎖定'},
    frostRimePriest:{role:'hunter',pressure:'遠程壓制並提供範圍抗控',answer:'優先擊殺祭司，勿只靠單一控制鏈'},
    frostSkyraider:{role:'trait',pressure:'只能由可對空單位處理的飛行切線',answer:'保留可對空的遠程與魔法單位'},
    nagaPhasewarden:{role:'trait',pressure:'免疫穿刺的秘法甲潮衛',answer:'用魔法、混沌或範圍傷害處理'}
  });
  const SUPPORT_WEIGHT=Object.freeze({healer:.20,commander:.16,orcBanner:.24,frostRimePriest:.18});
  const BOSS_REINFORCEMENTS=Object.freeze({
    nagaSiltwaterDemonlord:['nagaSiltImp','frostRimeStalker','goblinSapper','orcBanner'],
    tide:['nagaSiltImp','nagaShellbreaker','healer','commander'],
    siege:['goblinSapper','goblinVeilrunner','orcBanner','warder'],
    frost:['frostRimeStalker','frostRimePriest','frostSkyraider','warder']
    ,war:['runner','runner']
  });
  const pressureOf=monster=>{
    const durability=monster.effectiveHealth(),speed=Math.max(0,monster.speed||0),leak=Math.max(1,monster.baseDamage||1),armor=Math.max(0,monster.armor||0);
    const role=PROFILES[monster.type]&&PROFILES[monster.type].role;
    const combat=monster.combatRole==='boss'?1.60:monster.combatRole==='siege'?1.26:monster.combatRole==='hunter'?1.18:1;
    const trait=monster.flying||monster.concealed||monster.immuneAttackTypes||monster.mirrorStagger?1.18:1;
    return durability*(1+speed/280+armor*.035+leak*.055)*combat*trait;
  };
  class EnemyBalanceCatalog{
    static get(type){return PROFILES[type]||null;}
    static profiles(){return PROFILES;}
    static roles(){return ['swarm','runner','heavy','elite','siege','hunter','shield','support','trait','boss'];}
    static pressureOf(monster){return pressureOf(monster);}
    static waveAudit(wave,modifiers){
      const waves=new ns.systems.WaveSystem();waves.setModifiers(modifiers||{});const source=waves.definition(wave);
      if(!source)return null;
      let effectiveHealth=0,pressure=0,leak=0,support=0,bossReinforcement=0;
      source.groups.forEach(group=>{
        for(let index=0;index<group.count;index+=1){
          const monster=new ns.entities.Monster(group.type,wave,ns.config.path,Object.assign({},modifiers||{},{bountyScale:group.type==='boss'?1:source.bountyScale}));
          effectiveHealth+=monster.effectiveHealth();pressure+=pressureOf(monster);leak+=monster.baseDamage;
          support+=pressureOf(monster)*(SUPPORT_WEIGHT[group.type]||0);
          if(monster.combatRole==='boss'){
            const reinforcement=BOSS_REINFORCEMENTS[monster.type]||BOSS_REINFORCEMENTS[monster.bossAspect]||BOSS_REINFORCEMENTS.war;
            reinforcement.forEach(type=>{const unit=new ns.entities.Monster(type,wave,ns.config.path,modifiers);bossReinforcement+=pressureOf(unit);});
          }
        }
      });
      return {wave,groups:source.groups,effectiveHealth,leak,pressure:pressure+support+bossReinforcement,support,bossReinforcement,count:source.groups.reduce((sum,group)=>sum+group.count,0)};
    }
    static audit(modifiers){return Array.from({length:new ns.systems.WaveCatalog().total()},(_,index)=>this.waveAudit(index+1,modifiers));}
  }
  EnemyBalanceCatalog.PROFILES=PROFILES;
  ns.systems.EnemyBalanceCatalog=EnemyBalanceCatalog;
})(globalThis.TowerFrontier);
