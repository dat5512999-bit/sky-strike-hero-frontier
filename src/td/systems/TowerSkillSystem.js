(function(ns){
  'use strict';
  const THRESHOLDS=[0,5,15,30,50];
  const NAMES={arrow:'穿雲齊射',frost:'冰霜新星',cannon:'熔火重砲',storm:'雷霆連鎖',totem:'祖靈震地',crypt:'幽骨召喚',soul:'靈魂收割',barracks:'軍團齊射',grove:'自然禁錮',graveyard:'亡者徵召',ballista:'獅翼貫射',moonwell:'月潮折射',plague:'瘟疫蔓延'};
  class TowerSkillSystem{
    static rank(kills){return 1+THRESHOLDS.slice(1).filter(function(value){return kills>=value;}).length;}
    static progress(tower){const rank=this.rank(tower.kills);return{rank:rank,next:THRESHOLDS[rank]||null,kills:tower.kills};}
    static describe(tower){
      const p=this.progress(tower),r=p.rank;
      const details={
        arrow:'每4次攻擊，齊射 '+(r+1)+' 個目標',
        frost:'每4次攻擊，冰爆半徑 '+(40+r*9)+'，緩速 '+(1.5+r*.25).toFixed(2)+' 秒',
        cannon:'每4次攻擊，重砲傷害 ×'+(1.3+r*.15).toFixed(2)+'，擴大爆炸',
        storm:'雷電跳躍 '+(r+1)+' 個目標，後續傷害 70%',
        totem:'每4次攻擊，震地傷害 ×'+(1.2+r*.2).toFixed(1)+'，範圍緩速',
        crypt:'每 '+Math.max(6,12-r)+' 秒召喚，最多 '+(r>=3?3:2)+' 名幽靈守衛',
        soul:'靈魂彈跳 '+(r+1)+' 個目標並附帶短暫遲緩',
        barracks:'每4次攻擊，額外齊射 '+(r+2)+' 個目標',
        grove:'每4次攻擊，自然爆發擴大並強化緩速',
        graveyard:'每 '+Math.max(6,12-r)+' 秒召喚，最多 '+(r>=3?3:2)+' 名墓園守衛',
        ballista:'每4次攻擊，弩砲齊射 '+(r+1)+' 個目標',
        moonwell:'月光跳躍 '+(r+1)+' 個目標，每4擊觸發月潮緩速',
        plague:'每4次攻擊，瘟疫爆發擴大並延長腐化'
      };
      return NAMES[tower.type]+' Lv.'+r+'｜'+details[tower.type]+'｜擊殺 '+p.kills+(p.next?' / '+p.next:' · 已精通');
    }
    static fire(tower,targets,projectiles,summons){
      const cfg=tower.config(),rank=this.rank(tower.kills),empowered=tower.shotsFired%4===0;
      let options={damage:cfg.damage,color:cfg.color,splash:cfg.splash,slow:cfg.slow,slowTime:cfg.slowTime,attackType:cfg.attackType,speed:tower.type==='cannon'?280:440};
      let count=cfg.shots||1;
      if(tower.type==='arrow'&&empowered)count=rank+1;
      if(tower.type==='barracks'&&empowered)count=Math.max(count,rank+2);
      if(tower.type==='ballista'&&empowered)count=Math.max(count,rank+1);
      if(tower.type==='frost'&&empowered)Object.assign(options,{splash:40+rank*9,slow:.45,slowTime:1.5+rank*.25});
      if(tower.type==='grove'&&empowered)Object.assign(options,{splash:46+rank*10,slow:.48,slowTime:1.4+rank*.25});
      if(tower.type==='moonwell'&&empowered)Object.assign(options,{splash:36+rank*8,slow:.58,slowTime:1.2+rank*.2});
      if(tower.type==='plague'&&empowered)Object.assign(options,{damage:cfg.damage*(1.15+rank*.15),splash:45+rank*9,slow:.68,slowTime:1.3+rank*.2,style:'spirit'});
      if(tower.type==='cannon'&&empowered)Object.assign(options,{damage:cfg.damage*(1.3+rank*.15),splash:cfg.splash+rank*8});
      if(tower.type==='storm'||tower.type==='soul'||tower.type==='moonwell'||cfg.chain)Object.assign(options,{chain:Math.max(cfg.chain||0,tower.type==='storm'||tower.type==='soul'||tower.type==='moonwell'?rank+1:0),chainRange:95,style:tower.type==='soul'?'spirit':'lightning'});
      if(tower.type==='totem'&&empowered)Object.assign(options,{damage:cfg.damage*(1.2+rank*.2),splash:55+rank*8,slow:.6,slowTime:1+rank*.2});
      if((tower.type==='crypt'||tower.type==='graveyard')&&summons&&tower.summonCooldown<=0){
        const cap=(rank>=3?3:2)+(cfg.summonCap||0);
        if(summons.filter(function(unit){return unit.active&&unit.owner===tower;}).length<cap){
          summons.push(new ns.entities.Summon(tower,{duration:14,damage:9*(1+.2*(tower.level-1)+.15*(rank-1)),range:120,leash:cfg.range+35,color:cfg.color,form:tower.type}));
          tower.summonCooldown=Math.max(6,12-rank);tower.skillPulse=.6;
        }
      }
      targets.slice(0,count).forEach(function(target){projectiles.push(new ns.entities.Projectile(tower,target,options));});
      if(empowered||tower.type==='storm')tower.skillPulse=.35;
    }
  }
  TowerSkillSystem.THRESHOLDS=THRESHOLDS;
  ns.systems.TowerSkillSystem=TowerSkillSystem;
})(globalThis.TowerFrontier);
