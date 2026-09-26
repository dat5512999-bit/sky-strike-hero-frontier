(function(ns){
  'use strict';
  const CLASSES={
    frostland:{"name":"霜牙・凜","faction":"冰原獵首 · CONCEPT","color":"#9bdbd5","selectionArt":"assets/td/frostland/hero-selection-v2.png","selectionFocus":"50% 16%","range":165,"damage":20,"interval":0.8,"attackType":"chaos","frost":16,"frozenBonus":1.4,"frostland":true,"skills":["霜痕獵令","破冰獵矛","獵群號令"],"shortSkills":["霜痕","破冰","獵群"],"icons":["❄","矛","狼"],"hints":["附近最多四名敵人 +45 Frost，冷卻 9 秒","優先追擊附近凍結敵人；60 基礎傷害與碎冰，冷卻 12 秒","附近冰原士兵與自身獵狩 5 秒，累寒 ×1.25、窗口倍率 +.25；冷卻 22 秒"],"passive":"普攻 +16 Frost，窗口傷害 ×1.4"},
    hunter:{name:'守誓者・雷恩',faction:'人族 · 王國獵手',color:'#e6c56c',selectionArt:'assets/td/opening/hero-hunter-selection-v1.png',selectionFocus:'50% 22%',range:195,damage:20,interval:.75,attackType:'pierce',skills:['穿雲多重箭','獵獸陷阱','召喚戰狼'],shortSkills:['穿雲箭','獵獸陷阱','召喚戰狼'],icons:['➶','⌾','♞'],hints:['射程內最多三個敵人，冷卻9秒','在腳下布置8秒陷阱，持續緩速，冷卻12秒','召喚近戰戰狼，冷卻22秒']},
    arcanist:{name:'森語者・希爾芙',faction:'精靈 · 奧術學院',color:'#70e7ff',selectionArt:'assets/td/opening/hero-arcanist-selection-v1.png',selectionFocus:'50% 20%',range:152,damage:18,interval:.58,attackType:'magic',skills:['霜環震擊','連鎖雷擊','召喚元素'],shortSkills:['霜環','連鎖雷擊','召喚元素'],icons:['❄','ϟ','✧'],hints:['周圍冰爆並緩速，冷卻9秒','雷電跳躍最多四個敵人，冷卻12秒','召喚遠程元素守衛，冷卻22秒']},
    rogue:{name:'影行者・維菈',faction:'暗影氏族 · 暗影行會',color:'#c884df',selectionArt:'assets/td/opening/hero-rogue-selection-v1.png',selectionFocus:'50% 19%',range:100,damage:15,interval:.38,attackType:'chaos',skills:['暗影閃擊','淬毒煙幕','暗影分身'],shortSkills:['閃擊','淬毒煙幕','暗影分身'],icons:['◆','☠','◐'],hints:['閃至附近目標旁並重擊，冷卻9秒','腳下生成6秒毒霧，持續傷害，冷卻12秒','召喚快速近戰分身，冷卻22秒']},
    chief:{name:'大酋長・戈爾',faction:'荒野部族 · 萬族戰團',color:'#df6548',selectionArt:'assets/td/opening/hero-chief-selection-v2.png',selectionFocus:'50% 18%',skillArt:'assets/td/opening/chief-skill-icons-v1.png',range:112,damage:24,interval:.66,attackType:'chaos',splash:26,skills:['萬族戰吼','先祖怒火','裂地衝擊波'],shortSkills:['萬族戰吼','先祖怒火','裂地波'],icons:['吼','雷','裂'],hints:['附近荒野士兵立刻進入4秒狂潮，冷卻9秒','腳下形成6秒祖靈怒火，冷卻12秒','向前發射穿透衝擊波，傷害並緩速直線敵人，冷卻22秒']},
    goblin:{name:'銅齒・奇克',faction:'地精工程團',color:'#d9ad65',selectionArt:'assets/td/goblin-chief-engineer-v1.png',selectionFocus:'50% 42%',range:145,damage:16,interval:.8,attackType:'pierce',skills:['臨場改裝','蒸汽洩壓','巡修機偶'],shortSkills:['改裝','洩壓','機偶'],icons:['⚙','◈','▣'],hints:['自身攻速 +30%，並改裝最近的供電攻擊機械：傷害 +42%、攻速 +20%，持續 5 秒；冷卻 9 秒','噴出蒸汽傷害並緩速近敵，額外縮短網路冷卻 3 秒；冷卻 12 秒','部署一台可移動的巡修機偶，發射穿刺鉚釘；冷卻 22 秒']}
    ,naga:{name:'破潮者・賽洛',faction:'娜迦潮衛 · 自由遠征',color:'#55d3d0',selectionArt:'assets/td/naga/tidebreaker-selection-v1.png',selectionFocus:'52% 48%',skillArt:'assets/td/naga/tidebreaker-skill-icons-v1.png',range:142,damage:23,interval:.68,attackType:'chaos',skills:['潮門突刺','旋潮領域','潮衛號令'],shortSkills:['潮門','旋潮','潮衛'],icons:['≋','◉','♜'],hints:['突入目標身旁，以破潮矛造成 108 混沌傷害、緩速並留下潮痕，冷卻 9 秒','腳下形成 6 秒旋潮領域，每 0.5 秒傷害、緩速附近敵軍，冷卻 12 秒','附近娜迦守軍進入 5 秒潮衛號令：傷害 +18%、攻速 +18%；需至少一名守軍，冷卻 22 秒']}
  };
  class HeroRoster{
    static get(type){return CLASSES[type]||CLASSES.arcanist;}
    // W is a ground aura, not twelve invisible projectiles.  Keeping its damage
    // path self-contained prevents an unusual monster callback from breaking the
    // requestAnimationFrame loop and freezing the entire battlefield.
    static nagaPulse(hero,field,monsters,onKill,onHit){
      const limit=Math.min(12,Math.max(1,Number(field.maxTargets)||12)),progress=monster=>typeof monster.progress==='function'&&Number.isFinite(monster.progress())?monster.progress():(Number(monster.routeDistance)||0),targets=[];
      for(const monster of monsters||[]){if(monster&&monster.active&&ns.utils.distance(field,monster)<=72)targets.push(monster);}
      targets.sort((a,b)=>progress(b)-progress(a));
      const source={owner:hero,x:hero.x,y:hero.y,damage:16*field.power,color:'#6df5ef',attackType:'magic',slow:.2,slowTime:.72,style:'maelstrom',fieldPulse:true};
      for(const monster of targets.slice(0,limit)){
        if(!monster.active)continue;if(typeof monster.applySlow==='function')monster.applySlow(source.slow,source.slowTime);
        const table=ns.config.damageMultipliers[source.attackType]||{},multiplier=table[monster.armorType]||1,before=typeof monster.effectiveHealth==='function'?monster.effectiveHealth():monster.health,damage=source.damage*multiplier,killed=typeof monster.takeDamage==='function'&&monster.takeDamage(damage,source),after=typeof monster.effectiveHealth==='function'?monster.effectiveHealth():monster.health;
        if(onHit)onHit(monster,Math.max(0,before-after),multiplier>=1.25,source);if(killed&&onKill)onKill(monster,source);
      }
    }
    static cast(hero,slot,monsters,onKill,onHit){
      if(hero.classType==='frostland')return ns.systems.FrostlandHero.cast(hero,slot,monsters,onKill,onHit);
      const cfg=this.get(hero.classType),cooldown=slot===0?'novaCooldown':null;
      if((cooldown?hero[cooldown]:hero.skillCooldowns.thunder)>0)return false;
      const targets=monsters.filter(m=>m.active&&ns.utils.distance(hero,m)<=cfg.range+35).sort((a,b)=>b.progress()-a.progress());
      const power=typeof hero.skillPower==='function'?hero.skillPower():1+hero.equipment.spear*.2,weaponColor=ns.systems.EquipmentSystem.effectColor(hero,cfg.color);
      if(slot===0){
        if(hero.classType==='naga'){
          if(!targets.length)return false;
          const target=targets[0],from={x:hero.x,y:hero.y};
          hero.x=ns.utils.clamp(target.x-34,25,695);hero.y=ns.utils.clamp(target.y+24,55,695);hero.setTarget(hero.x,hero.y);
          target.applySlow(.38,1.65);
          new ns.entities.Projectile(hero,target,{damage:108*power,color:weaponColor,attackType:'chaos',slow:.38,slowTime:1.65,style:'tidegate'}).hit(monsters,onKill,onHit);
          ns.systems.HeroSkillVFX.emit(hero,'naga-tidegate',{from:from,target:{x:target.x,y:target.y},duration:.54});
          hero.novaCooldown=9*(1-hero.equipment.rune*.1);hero.beginCast();return true;
        }
        if(hero.classType==='goblin'){
          const network=hero.synergy?.game?.goblinNetwork,items=hero.synergy?.game?.build?.items||[],powered=items.filter(item=>item.networkPowered&&ns.utils.distance(hero,item)<=210&&item.config().networkCost).sort((a,b)=>ns.utils.distance(hero,a)-ns.utils.distance(hero,b)),item=powered.find(candidate=>candidate.config().damage>0)||null;
          if(item){item.networkDamage=Math.max(item.networkDamage||0,.42);item.engineerBoost=5;item.engineerHaste=.2;}
          hero.goblinOverclock=5;ns.systems.HeroSkillVFX.emit(hero,'goblin-modify',{target:item?{x:item.x,y:item.y}:{x:hero.x,y:hero.y},duration:.75});
          hero.novaCooldown=9*(1-hero.equipment.rune*.1);hero.beginCast();return true;
        }
        if(hero.classType==='chief'){const allies=hero.synergy?hero.synergy.game.build.combatUnits().filter(unit=>['orc','centaur','boarRider','minotaur','shaman'].includes(unit.type)&&ns.utils.distance(hero,unit)<=210):[];allies.forEach(unit=>{unit.tribalFrenzy=Math.max(unit.tribalFrenzy||0,4);unit.commandPulse=4;});ns.systems.HeroSkillVFX.emit(hero,'chief-warcry',{radius:210,duration:.72});hero.novaCooldown=9*(1-hero.equipment.rune*.1);hero.beginCast();return true;}
        if(!targets.length)return false;
        hero.skillTrails=targets.slice(0,hero.classType==='hunter'?3:1).map(target=>({x:hero.x,y:hero.y,tx:target.x,ty:target.y,time:.3,color:weaponColor}));
        ns.systems.HeroSkillVFX.emit(hero,hero.classType==='hunter'?'arrows':'blink',{targets:targets.slice(0,3).map(m=>({x:m.x,y:m.y})),target:{x:targets[0].x,y:targets[0].y},duration:.45});
        if(hero.classType==='hunter')targets.slice(0,3).forEach(target=>new ns.entities.Projectile(hero,target,{damage:48*power,color:weaponColor,attackType:'pierce'}).hit(monsters,onKill,onHit));
        else{const target=targets[0];hero.x=ns.utils.clamp(target.x-28,25,695);hero.y=ns.utils.clamp(target.y+22,55,695);hero.setTarget(hero.x,hero.y);new ns.entities.Projectile(hero,target,{damage:95*power,color:weaponColor,attackType:'chaos'}).hit(monsters,onKill,onHit);}
        hero.novaCooldown=9*(1-hero.equipment.rune*.1);
      }else{
        if(hero.classType==='naga'){
          // A field is allowed one damage resolution per rendered update.  This
          // prevents a background-tab frame from replaying many half-second ticks
          // against every enemy when the browser resumes.
          // A second field is never useful, but could be queued by a rapid tap
          // before the button repaint.  Reject it so field work remains bounded.
          if(hero.fields.some(field=>field.type==='naga'&&field.time>0))return false;
          hero.fields.push({x:hero.x,y:hero.y,time:6,tick:0,type:'naga',power:power,maxTargets:12,pulses:0,maxPulses:12});
          ns.systems.HeroSkillVFX.emit(hero,'naga-maelstrom',{radius:76,duration:.82});
          hero.skillCooldowns.thunder=12*(1-hero.equipment.rune*.1);hero.beginCast();return true;
        }
        if(hero.classType==='goblin'){
          const network=hero.synergy?.game?.goblinNetwork,near=monsters.filter(m=>m.active&&ns.utils.distance(hero,m)<=112);
          if(!near.length&&!(network?.cooling>0))return false;
          if(network)network.cooling=Math.max(0,network.cooling-3);
          near.forEach(monster=>{monster.applySlow(.52,2);new ns.entities.Projectile(hero,monster,{damage:24*power,color:'#b1f4dc',attackType:'chaos',style:'goblin-shot'}).hit(monsters,onKill,onHit);});
          ns.systems.HeroSkillVFX.emit(hero,'goblin-cool',{radius:112,duration:.75});hero.skillCooldowns.thunder=12*(1-hero.equipment.rune*.1);hero.beginCast();return true;
        }
        hero.fields.push({x:hero.x,y:hero.y,time:hero.classType==='hunter'?8:6,tick:0,type:hero.classType,power:power});
        hero.skillCooldowns.thunder=12*(1-hero.equipment.rune*.1);
      }
      hero.beginCast();return true;
    }
    static updateFields(hero,dt,monsters,onKill,onHit){
      ns.systems.HeroSkillVFX.update(hero,dt);
      hero.skillTrails=(hero.skillTrails||[]).filter(trail=>{trail.time-=dt;return trail.time>0;});
      hero.fields.forEach(field=>{if(field.type.startsWith('evo-')){try{ns.systems.HeroEvolutionCombat.pulse(hero,field,dt,monsters,onKill,onHit);}catch(error){field.time=0;hero.evolutionFault=String(error?.message||error);}return;}const elapsed=Math.min(Math.max(0,Number(dt)||0),field.time);field.time-=elapsed;field.tick+=elapsed;
        const resolve=targets=>targets.forEach(monster=>{if(field.type==='hunter'){monster.applySlow(.35,.7);return;}new ns.entities.Projectile(hero,monster,{damage:9*field.power,color:'#c884df',attackType:'chaos'}).hit(monsters,onKill,onHit);});
        if(field.type==='naga'){
          if(field.tick<.5)return;
          // Do not catch up old pulses. A resumed tab receives at most one current
          // pulse, then discards its stale accumulator. Naga also prioritizes the
          // frontmost nearby enemies so a 50-wave swarm cannot fan out unbounded
          // projectile work in a single frame.
          field.tick=0;field.pulses=(field.pulses||0)+1;try{this.nagaPulse(hero,field,monsters,onKill,onHit);}catch(error){field.time=0;hero.nagaFieldFault=String(error&&error.message||error||'unknown');}if(field.pulses>=field.maxPulses)field.time=0;return;
        }
        while(field.tick>=.5){field.tick-=.5;resolve(monsters.filter(monster=>monster.active&&ns.utils.distance(field,monster)<=72));}
      });
      hero.fields=hero.fields.filter(field=>field.time>0);
    }
    static drawFields(ctx,hero){
      for(const field of hero.fields){
        try{ns.systems.HeroSkillVFX.drawField(ctx,field);}
        catch(error){
          if(field.type!=='naga'&&!field.type.startsWith('evo-'))throw error;
          hero.fields=hero.fields.filter(item=>item!==field);
          hero[field.type==='naga'?'nagaFieldFault':'evolutionFault']=String(error&&error.message||error||'draw failure');
        }
      }
    }
  }
  HeroRoster.CLASSES=CLASSES;ns.systems.HeroRoster=HeroRoster;
})(globalThis.TowerFrontier);
