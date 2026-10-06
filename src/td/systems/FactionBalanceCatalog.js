(function(ns){
  'use strict';
  // This is the single source of truth for the *intent* behind each roster.
  // It deliberately keeps the combat numbers in config.js: the catalog makes
  // a numeric change auditable without turning faction identity into another
  // hidden combat rule.
  const ROLE_TYPES=Object.freeze(['pack','precision','control','support','economy','summon','burst','execute','capstone']);
  const PROFILES=Object.freeze({
    frostland:{hero:'frostland',identity:'累積寒冷、凍結窗口與碎冰收尾',tradeoff:'需要先累積寒冷，直接爆發較慢',opening:[['unit','frostWolf',1],['building','frostBlizzard',2.4]],roles:{unit:{frostWolf:'control',frostBear:'burst',frostBird:'pack',frostHunter:'precision',frostShaman:'support',frostMammoth:'capstone'},building:{frostCrystal:'control',frostBlizzard:'pack',frostBallista:'precision',frostTotem:'support',frostObelisk:'burst',frostAurora:'control',frostGlacier:'capstone'}},required:['control','pack','precision','support','capstone']},
    hunter:{hero:'hunter',identity:'穩定齊射、遠距優先目標與陣地支援',tradeoff:'支援需佈置，分散戰線的效益較低',opening:[['unit','hunter',2],['building','cannon',2.5]],roles:{unit:{hunter:'pack',shield:'control',musketeer:'precision',knight:'burst',kingdomMage:'pack',alchemist:'support',royalCommander:'capstone'},building:{arrow:'pack',iceward:'control',cannon:'pack',barracks:'support',ballista:'precision',supply:'economy',battleflag:'support',armoryForge:'support'}},required:['pack','precision','control','support','economy','capstone']},
    arcanist:{hero:'arcanist',identity:'印記、連鎖與自然控制的連動',tradeoff:'需把敵人留在連鎖與印記覆蓋中',opening:[['unit','arcanist',1.8],['building','storm',3]],roles:{unit:{arcanist:'pack',dragon:'capstone',beastmaster:'summon',dryad:'control',moonblade:'pack'},building:{frost:'control',storm:'pack',grove:'support',moonwell:'support'}},required:['pack','control','support','summon','capstone']},
    rogue:{hero:'rogue',identity:'死亡資源、詛咒與殘血收割',tradeoff:'缺少可收割目標時，資源循環與爆發會下降',opening:[['unit','rogue',1],['building','plague',2.6]],roles:{unit:{rogue:'economy',skeleton:'pack',golem:'burst',banshee:'support',boneRider:'execute',soulsteel:'capstone'},building:{crypt:'summon',soul:'burst',graveyard:'support',plague:'pack'}},required:['pack','burst','support','summon','execute','capstone']},
    wild:{hero:'chief',identity:'近距震地、擊殺狂熱與短窗口爆發',tradeoff:'射程短、爆發後有空窗，分散或重甲目標要改用特化兵種',opening:[['unit','orc',1.8],['building','totem',2]],roles:{unit:{orc:'burst',centaur:'precision',boarRider:'burst',minotaur:'capstone',shaman:'support'},building:{warDrum:'support',boulder:'pack',thunderTotem:'pack',totem:'burst'}},required:['pack','precision','support','burst','capstone']},
    goblin:{hero:'goblin',identity:'供電網路、快速火器與可控超載',tradeoff:'要先鋪設供電，超載與斷網時火力會下降',opening:[['building','goblinGenerator',0],['building','goblinTurret',2]],roles:{unit:{goblinEngineer:'support',goblinGunner:'pack',goblinRiveter:'precision',goblinRecycler:'economy',goblinMech:'capstone'},building:{goblinGenerator:'support',goblinTurret:'pack',goblinMortar:'pack',goblinSnare:'control',goblinRecycler:'economy',goblinCooler:'support',goblinSiege:'capstone'}},required:['pack','precision','control','support','economy','capstone']},
    naga:{hero:'naga',identity:'潮壓標記、潮衛號令與線性控制',tradeoff:'近中距陣線需要正確覆蓋，缺乏無條件的大範圍爆發',opening:[['unit','nagaTideguard',1],['building','nagaTidegate',2]],roles:{unit:{nagaTideguard:'control',nagaShellbreaker:'burst',nagaDeepWargod:'capstone',nagaMantaRaider:'pack',nagaVenomStalker:'support'},building:{nagaTidegate:'support',nagaShellBastion:'precision',nagaAbyssShrine:'support',nagaMantaAerie:'pack'}},required:['pack','precision','control','support','burst','capstone']},
    dwarf:{hero:'dwarf',identity:'穿甲火銃、符文增幅與慢速範圍砲擊',tradeoff:'先用破盾者守狹口，再補穿甲火力；迫擊有空窗，增幅只覆蓋矮人',opening:[['unit','dwarfShield',2],['building','dwarfBoltTower',1]],roles:{unit:{dwarfRifle:'precision',dwarfShield:'control',dwarfRunesmith:'pack',dwarfMortar:'capstone'},building:{dwarfBoltTower:'precision',dwarfRuneForge:'support',dwarfMortarTower:'pack',dwarfCitadel:'capstone'}},required:['pack','precision','control','support','capstone']},
    dragonkin:{hero:'dragonkin',identity:'龍焰點殺、雷霆連鎖與龍脈共鳴',tradeoff:'昂貴單位比例高；連鎖與吐息要敵人集中才有效',opening:[['unit','dragonkinEmberwing',1],['building','dragonkinFlameSpire',1]],roles:{unit:{dragonkinEmberwing:'precision',dragonkinLancer:'burst',dragonkinOracle:'pack',dragonkinElder:'capstone'},building:{dragonkinFlameSpire:'precision',dragonkinStormObelisk:'pack',dragonkinRoost:'support',dragonkinWyrmNest:'capstone'}},required:['pack','precision','support','burst','capstone']},
    egypt:{hero:'egypt',identity:'盾衛守線、青金遠射與短暫沙幕控場',tradeoff:'沙幕不凍結、持續時間短；祭司與弓手脆弱，需盾衛掩護',opening:[['unit','egyptSunGuard',1.5],['building','egyptSunWatch',1]],roles:{unit:{egyptSunGuard:'control',egyptArcher:'precision',egyptPriest:'support',egyptScarab:'capstone'},building:{egyptSunWatch:'precision',egyptSunAltar:'support',egyptSandObelisk:'pack',egyptScarabBastion:'capstone'}},required:['pack','precision','control','support','capstone']}
  });
  const resource=cfg=>Number(cfg.cost||0)+Number(cfg.wood||0)*35;
  const dps=(cfg,coverage)=>cfg&&cfg.damage>0&&cfg.interval>0?(cfg.damage/cfg.interval)*coverage:0;
  class FactionBalanceCatalog{
    static get(id){return PROFILES[id]||null;}
    static profiles(){return PROFILES;}
    static audit(){
      const factions=ns.systems.FactionSystem.FACTIONS,heroes=ns.systems.HeroRoster&&ns.systems.HeroRoster.CLASSES||{};
      return Object.entries(PROFILES).map(([id,profile])=>{
        const faction=factions[id],opening=profile.opening.map(([kind,itemId,coverage])=>({kind,id:itemId,coverage,cfg:(kind==='unit'?ns.config.units:ns.config.buildings)[itemId]}));
        const openingResource=opening.reduce((sum,item)=>sum+resource(item.cfg),0),openingPower=opening.reduce((sum,item)=>sum+dps(item.cfg,item.coverage),0),hero=heroes[profile.hero];
        return {id,name:faction&&faction.name,identity:profile.identity,tradeoff:profile.tradeoff,hero:profile.hero,heroDps:hero&&hero.damage/hero.interval,openingResource,openingPower,opening};
      });
    }
    static roleTypes(){return ROLE_TYPES;}
  }
  FactionBalanceCatalog.PROFILES=PROFILES;
  FactionBalanceCatalog.resource=resource;
  FactionBalanceCatalog.dps=dps;
  ns.systems.FactionBalanceCatalog=FactionBalanceCatalog;
})(globalThis.TowerFrontier);
