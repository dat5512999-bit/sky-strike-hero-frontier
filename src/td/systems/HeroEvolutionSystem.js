(function(ns){
  'use strict';
  const FORMS={
    hunter:[null,{name:'覺醒',passive:'王印：標記目標承受更多追獵傷害。',skills:['王印追獵','獵區封鎖','誓約處決','王誓裁決'],hints:['射出四發王印箭，優先標記菁英與首領。','建立封鎖獵區，使敵人緩速並削弱護甲。','處決被王印鎖定的高威脅目標。','箭雨追擊所有王印目標。']},{name:'超凡',passive:'獵王領域：王印可在擊殺後傳遞。',skills:['曙光連弩','獵王領域','王庭連射','曙光裁決'],hints:['穿透連弩標記前線敵群。','擴張獵區，讓王印在擊殺後傳遞。','以多段追箭壓制首領。','以王庭一矢終結被鎖定的敵軍。']}],
    arcanist:[null,{name:'覺醒',passive:'奧術共鳴：受控敵人會強化後續法術。',skills:['晶棱禁錮','符文迴流','星靈共鳴','星界墜落'],hints:['封住前線強敵並擊碎護盾。','符文在敵群間回流，形成連鎖傷害。','喚起星靈轟擊受控目標。','在最密集的敵群落下星界衝擊。']},{name:'超凡',passive:'折光迷宮：法術會在受控目標間折返。',skills:['折光迷宮','雷環回響','天穹墜星','星界終章'],hints:['封鎖前線並讓敵群反覆受擊。','雷環在受控敵人間額外彈跳。','指定區域降下高傷害星墜。','以全域星界脈衝收束敵群。']}],
    rogue:[null,{name:'覺醒',passive:'血影契印：受印目標會承受額外處決傷害。',skills:['無聲換位','血影契印','黑月處刑','夜幕獵殺'],hints:['換位至威脅最高的敵人身後。','為一群敵人刻下會擴散的血影契印。','處決低生命或滿層契印目標。','短暫進入夜幕，連斬前線高威脅。']},{name:'超凡',passive:'千影巡遊：處決後留下殘影持續追擊。',skills:['千影巡遊','時間竊取','夜幕封城','月蝕終獵'],hints:['多次換位並在路徑留下殘影。','奪取敵人速度，延長處決窗口。','以暗影封鎖一段戰線。','月蝕斬擊所有受契印的精英。']}],
    chief:[null,{name:'覺醒',passive:'荒野意志：附近沒有部隊時，自身仍獲完整戰域效果。',skills:['破陣衝鋒','戰旗裂土','祖靈投影','荒原裁決'],hints:['衝入敵群並震退前線。','展開戰域；可強化自己與附近戰士。','喚出祖靈重擊敵軍行進線。','以荒野怒火重擊最前方敵群。']},{name:'超凡',passive:'不屈戰域：低生命時戰域更強，不依賴部隊人數。',skills:['戰團裁決','不屈戰域','荒王降臨','萬獸終戰'],hints:['依敵人密度擴張斧擊範圍。','讓自身與附近戰團進入不屈戰域。','短暫化為首領克星的荒王姿態。','以萬獸衝擊粉碎前線。']}],
    goblin:[null,{name:'覺醒',passive:'工程核心：沒有機械網路時，技能也會以自身核心運作。',skills:['磁軌鉚釘','拆解無人機','鍊爐超載','核心爆發'],hints:['鉚釘在敵人之間彈射並穿甲。','拆解一群敵人的護甲與護盾。','啟動自身或附近機械的鍊爐超載。','釋放工程核心儲能，轟擊前線。']},{name:'超凡',passive:'連鎖節點：每次技能命中會累積可釋放的工程能量。',skills:['連鎖節點','重力扳手','全域熔爐','超載協議'],hints:['以節點電弧串連敵群。','拉回突破口敵人並打斷攻勢。','將累積能量轉成大範圍熔爐爆發。','全域超載：即使沒有裝置也可釋放核心。']}],
    frostland:[null,{name:'覺醒',passive:'霜原獵印：冰霜標記使碎冰傷害提高。',skills:['狼印獵步','冰層裂谷','霜魄誘餌','白霜狩獵'],hints:['追獵凍結或深寒目標並施加狼印。','劃出裂冰地帶，快速累積寒冷。','以冰狼幻影聚集敵群。','由獵群撕裂所有被狼印鎖定的敵人。']},{name:'超凡',passive:'白夜狩域：凍結目標死亡時會將寒冷傳給附近敵人。',skills:['白夜狩域','絕對零點','狼王追魂','永冬狩令'],hints:['展開白夜狩域，持續擴散深寒。','壓制最危險的精英與首領。','狼王殘影追獵所有凍結目標。','發動永冬狩令，讓全場寒冷爆發。']}],
    naga:[null,{name:'覺醒',passive:'潮壓印記：被破潮矛命中的目標承受更強潮擊。',skills:['裂潮突刺','回流渦場','潮衛集結','海門決斷'],hints:['突進至前線，以多段潮壓刺擊命中目標。','展開回流渦場，拖慢並傷害附近敵軍。','召集潮衛幻影守住英雄周圍。','在最密集的戰線開啟海門衝擊。']},{name:'超凡',passive:'深海盟約：潮壓印記會在擊殺時向附近敵人傳遞。',skills:['深淵裂潮','靜海禁域','戰神潮衛','萬潮終章'],hints:['連續穿刺多名高威脅敵人。','以靜海禁域壓制前線敵軍。','讓潮衛幻影以更高頻率反擊。','釋放橫掃全線的萬潮終章。']}]
  };
  const GATES=[null,{wave:20,emblems:3,trialHealth:{hunter:1250,arcanist:1320,rogue:1180,chief:1270,goblin:1160,frostland:1210,naga:1280}},{wave:50,emblems:5,trialHealth:{hunter:2900,arcanist:3000,rogue:2750,chief:2960,goblin:2700,frostland:2820,naga:2940}}];
  const cooldown=(hero,base)=>base*(1-(hero.equipment.rune||0)*.1);
  const alive=(monsters,hero,range)=>monsters.filter(m=>m.active&&ns.utils.distance(hero,m)<=range).sort((a,b)=>b.progress()-a.progress());
  const hit=(hero,target,ctx,options)=>{const shot=new ns.entities.Projectile(hero,target,Object.assign({damage:1,color:'#f4d484',attackType:'chaos'},options));shot.hit(ctx.monsters,ctx.onKill,ctx.onHit);return shot;};
  class HeroEvolutionSystem{
    static state(hero){
      if(!hero.evolution)hero.evolution={rank:0,stones:0,healthFloor:0,trialStage:0};
      return hero.evolution;
    }
    static rank(hero){return this.state(hero).rank||0;}
    static form(hero){return FORMS[hero.classType]?.[this.rank(hero)]||null;}
    static skillSet(hero,fallback){const form=this.form(hero);return form?form.skills:fallback;}
    static hintSet(hero,fallback){const form=this.form(hero);return form?form.hints:fallback;}
    static rankName(hero){return this.form(hero)?.name||'初始';}
    static powerMultiplier(hero){return [1,2.08,3.72][this.rank(hero)]||1;}
    static nextGate(hero){return GATES[this.rank(hero)+1]||null;}
    static progress(hero,wave){const gate=this.nextGate(hero);if(!gate)return{complete:true};const state=this.state(hero);return{gate,unlocked:(wave||0)>=gate.wave,hasStone:(state.stones||0)>0};}
    static canBuyStone(hero,economy,wave){const progress=this.progress(hero,wave);return Boolean(progress.gate&&progress.unlocked&&!progress.hasStone&&(economy.emblems||0)>=progress.gate.emblems);}
    static buyStone(hero,economy,wave){const progress=this.progress(hero,wave);if(!progress.gate||!progress.unlocked)return{ok:false,message:'需在第 '+(progress.gate?.wave||50)+' 波守成後才可購買下一階進化石'};if(progress.hasStone)return{ok:false,message:'已持有進化石，先完成試煉'};if((economy.emblems||0)<progress.gate.emblems)return{ok:false,message:'首領勳章不足，還需要 '+(progress.gate.emblems-(economy.emblems||0))+' 枚'};economy.emblems-=progress.gate.emblems;this.state(hero).stones=1;return{ok:true,message:'已購買'+(this.rank(hero)===0?'覺醒':'超凡')+'進化石'};}
    static canStartTrial(game){const hero=game.hero,progress=this.progress(hero,game.waves?.wave||0),state=this.state(hero);return Boolean(progress.gate&&progress.unlocked&&state.stones>0&&!state.trialStage&&!game.waves?.active&&!game.monsters?.some(m=>m.active));}
    static startTrial(game){
      if(!this.canStartTrial(game))return{ok:false,message:'請在波次間準備進化石後再發起試煉'};
      const hero=game.hero,stage=this.rank(hero)+1,gate=GATES[stage],path=[{x:Math.max(60,hero.x+96),y:hero.y},{x:Math.max(60,hero.x+96),y:hero.y}];
      const boss=new ns.entities.Monster('boss',gate.wave,path);Object.assign(boss,{evolutionTrial:true,trialOwner:hero,speed:0,baseDamage:0,reward:0,health:gate.trialHealth[hero.classType],maxHealth:gate.trialHealth[hero.classType],displayHealth:gate.trialHealth[hero.classType],barrier:0,maxBarrier:0,abilityCooldown:7});
      this.state(hero).trialStage=stage;game.monsters.push(boss);game.effects?.push({type:'ultimate',x:boss.x,y:boss.y,radius:72,time:1,max:1,color:ns.systems.HeroRoster.get(hero.classType).color});return{ok:true,message:(stage===1?'覺醒':'超凡')+'試煉開始 · 僅英雄傷害有效'};
    }
    static completeTrial(game,monster){
      const hero=game.hero,state=this.state(hero),stage=state.trialStage;if(!stage||!monster?.evolutionTrial)return false;
      state.rank=stage;state.stones=Math.max(0,(state.stones||0)-1);state.trialStage=0;state.healthFloor=Math.max(state.healthFloor||0,hero.maxHealth);hero.level=1;hero.xp=0;hero.maxHealth=Math.max(hero.maxHealth,ns.config.hero.maxHealth+(stage===1?8:28));hero.health=hero.maxHealth;hero.displayHealth=hero.health;hero.novaCooldown=0;hero.skillCooldowns={thunder:0,summon:0,ultimate:0};hero.fields=[];hero.huntTime=0;
      hero.evolutionReveal={rank:stage,time:1.2,max:1.2};
      game.flash?.(this.rankName(hero)+'完成 · Lv.1 已繼承原有戰力','#ffe08a');game.effects?.push({type:'ultimate',x:hero.x,y:hero.y,radius:110,time:1.2,max:1.2,color:ns.systems.HeroRoster.get(hero.classType).color});return true;
    }
    static cast(hero,slot,ctx){
      const stage=this.rank(hero);if(!stage||!hero.active)return null;
      const form=this.form(hero),type=hero.classType,power=hero.skillPower(),targets=alive(ctx.monsters,hero,stage===2?290:230),primary=targets[0];if(!primary)return false;
      const key=slot==='q'?'novaCooldown':slot==='w'?'thunder':slot==='e'?'summon':'ultimate';if(key==='novaCooldown'?hero.novaCooldown>0:hero.skillCooldowns[key]>0)return false;
      const factor=stage===1?1:1.45,colour=ns.systems.EquipmentSystem.effectColor(hero,ns.systems.HeroRoster.get(type).color),finish=(time)=>{if(key==='novaCooldown')hero.novaCooldown=cooldown(hero,time);else hero.skillCooldowns[key]=cooldown(hero,time);hero.beginCast();hero.evolutionCast={slot,rank:stage,time:slot==='f'?1:.62,max:slot==='f'?1:.62,targetX:primary.x,targetY:primary.y};ctx.game?.effects?.push({type:slot==='f'?'ultimate':'nova',x:primary.x,y:primary.y,radius:slot==='f'?135:72,time:.75,max:.75,color:colour});return true;};
      if(type==='hunter'){
        if(slot==='q'){targets.slice(0,stage===1?4:6).forEach(target=>{target.evolutionMark=Math.max(target.evolutionMark||0,stage===1?6:9);hit(hero,target,ctx,{damage:58*power*factor,color:colour,attackType:'pierce',armorPierce:2});});return finish(8);}
        if(slot==='w'){hero.fields.push({x:hero.x,y:hero.y,time:stage===1?7:9,tick:0,type:'evo-hunter',power:power*factor});return finish(13);}
        if(slot==='e'){const target=targets.find(m=>m.evolutionMark>0)||primary;hit(hero,target,ctx,{damage:190*power*factor,color:colour,attackType:'pierce',armorPierce:4,executeThreshold:.3,executeMultiplier:stage===1?1.7:2.1});return finish(23);}
        targets.filter(m=>m.evolutionMark>0).slice(0,stage===1?8:12).forEach(target=>hit(hero,target,ctx,{damage:115*power*factor,color:colour,attackType:'pierce',slow:.55,slowTime:2,armorPierce:3}));return finish(62);
      }
      if(type==='arcanist'){
        if(slot==='q'){targets.slice(0,stage===1?2:3).forEach(target=>{target.barrier=0;target.applySlow(stage===1?.16:.1,stage===1?2.2:3);hit(hero,target,ctx,{damage:82*power*factor,color:colour,attackType:'magic'});});return finish(9);}
        if(slot==='w'){hit(hero,primary,ctx,{damage:72*power*factor,color:colour,attackType:'magic',chain:stage===1?5:7,chainRange:125,style:'lightning'});return finish(12);}
        if(slot==='e'){const center=targets.reduce((best,target)=>targets.filter(other=>ns.utils.distance(target,other)<105).length>targets.filter(other=>ns.utils.distance(best,other)<105).length?target:best,primary);ctx.monsters.filter(m=>m.active&&ns.utils.distance(m,center)<110).forEach(target=>hit(hero,target,ctx,{damage:90*power*factor,color:colour,attackType:'magic',slow:.45,slowTime:2.4}));return finish(24);}
        ctx.monsters.filter(m=>m.active).slice(0,stage===1?10:16).forEach(target=>hit(hero,target,ctx,{damage:105*power*factor,color:colour,attackType:'magic',chain:stage===2?2:0,chainRange:95}));return finish(66);
      }
      if(type==='rogue'){
        if(slot==='q'){hero.x=Math.max(25,primary.x-28);hero.y=Math.min(ns.config.height-25,primary.y+20);primary.evolutionMark=stage===1?7:10;hit(hero,primary,ctx,{damage:130*power*factor,color:colour,attackType:'chaos',style:'claw'});return finish(8);}
        if(slot==='w'){targets.slice(0,stage===1?4:6).forEach(target=>{target.evolutionMark=Math.max(target.evolutionMark||0,stage===1?6:9);target.applySlow(stage===1?.64:.5,2);hit(hero,target,ctx,{damage:34*power*factor,color:colour,attackType:'chaos'});});return finish(13);}
        if(slot==='e'){const target=targets.find(m=>m.health/m.maxHealth<.42||m.evolutionMark>0)||primary;hit(hero,target,ctx,{damage:210*power*factor,color:colour,attackType:'chaos',executeThreshold:stage===1?.42:.52,executeMultiplier:2.1,style:'claw'});return finish(22);}
        targets.slice(0,stage===1?7:12).forEach(target=>hit(hero,target,ctx,{damage:105*power*factor,color:colour,attackType:'chaos',executeThreshold:.45,executeMultiplier:1.6,style:'claw'}));return finish(60);
      }
      if(type==='chief'){
        if(slot==='q'){ctx.monsters.filter(m=>m.active&&ns.utils.distance(m,hero)<105).forEach(target=>{target.applySlow(.45,1.5);hit(hero,target,ctx,{damage:105*power*factor,color:colour,attackType:'chaos',splash:72});});return finish(9);}
        if(slot==='w'){hero.evolutionAuraTime=stage===1?7:10;hero.evolutionAuraRate=stage===1?.28:.46;(ctx.game?.build?.combatUnits?.()||[]).filter(unit=>ns.utils.distance(unit,hero)<200).forEach(unit=>unit.tribalFrenzy=Math.max(unit.tribalFrenzy||0,hero.evolutionAuraTime));return finish(14);}
        if(slot==='e'){targets.slice(0,stage===1?4:7).forEach(target=>hit(hero,target,ctx,{damage:115*power*factor,color:colour,attackType:'chaos',slow:.5,slowTime:2.2,splash:stage===1?34:50}));return finish(24);}
        ctx.monsters.filter(m=>m.active&&ns.utils.distance(m,hero)<(stage===1?145:185)).forEach(target=>hit(hero,target,ctx,{damage:145*power*factor,color:colour,attackType:'chaos',slow:.55,slowTime:2.4}));return finish(64);
      }
      if(type==='goblin'){
        if(slot==='q'){hit(hero,primary,ctx,{damage:64*power*factor,color:colour,attackType:'pierce',chain:stage===1?4:7,chainRange:115,armorPierce:3,style:'goblin-rivet'});return finish(8);}
        if(slot==='w'){targets.slice(0,stage===1?4:6).forEach(target=>{target.barrier=0;target.temporaryArmor=Math.min(target.temporaryArmor||0,-2);target.applySlow(.5,2);hit(hero,target,ctx,{damage:42*power*factor,color:'#b5f8e9',attackType:'chaos',style:'goblin-shot'});});return finish(13);}
        if(slot==='e'){ctx.summons.push(new ns.entities.Summon(hero,{offsetX:28,duration:stage===1?15:19,damage:34*power*factor,level:Math.min(5,Math.ceil(hero.level/2)),color:'#f3bb6d',form:'goblin',range:165,leash:280,speed:110,tags:['summon','mechanical','goblin']}));hero.goblinOverclock=Math.max(hero.goblinOverclock||0,stage===1?6:9);return finish(25);}
        targets.slice(0,stage===1?8:14).forEach(target=>hit(hero,target,ctx,{damage:108*power*factor,color:'#ffbd68',attackType:'chaos',chain:stage===2?3:0,chainRange:100,style:'goblin-rocket'}));return finish(66);
      }
      if(type==='naga'){
        if(slot==='q'){hero.x=Math.max(25,primary.x-34);hero.y=Math.min(ns.config.height-25,primary.y+16);targets.slice(0,stage===1?3:5).forEach(target=>{target.evolutionMark=Math.max(target.evolutionMark||0,stage===1?6:9);hit(hero,target,ctx,{damage:118*power*factor,color:colour,attackType:'chaos',armorPierce:2,slow:.58,slowTime:1.25});});return finish(8);}
        if(slot==='w'){hero.fields.push({x:hero.x,y:hero.y,time:stage===1?7:9,tick:0,type:'evo-naga',power:power*factor});return finish(13);}
        if(slot==='e'){targets.slice(0,stage===1?4:7).forEach(target=>hit(hero,target,ctx,{damage:90*power*factor,color:colour,attackType:'chaos',splash:stage===1?42:62,slow:.5,slowTime:2}));return finish(24);}
        ctx.monsters.filter(m=>m.active).slice(0,stage===1?9:15).forEach(target=>hit(hero,target,ctx,{damage:118*power*factor,color:colour,attackType:'chaos',slow:.62,slowTime:2.6,splash:stage===2?58:42}));return finish(65);
      }
      if(slot==='q'){targets.slice(0,stage===1?3:5).forEach(target=>{target.evolutionMark=stage===1?6:9;hit(hero,target,ctx,{damage:52*power*factor,color:colour,attackType:'chaos',frost:stage===1?42:60,shatter:stage===2?1.4:0,shatterRadius:65});});return finish(8);}
      if(slot==='w'){ctx.monsters.filter(m=>m.active&&ns.utils.distance(m,hero)<115).forEach(target=>hit(hero,target,ctx,{damage:36*power*factor,color:colour,attackType:'chaos',frost:stage===1?50:75,slow:.48,slowTime:2.2}));return finish(13);}
      if(slot==='e'){hero.huntTime=stage===1?8:11;return finish(23);}
      ctx.monsters.filter(m=>m.active).forEach(target=>hit(hero,target,ctx,{damage:(stage===1?68:105)*power*factor,color:colour,attackType:'chaos',frost:stage===1?32:58,shatter:stage===2?1.5:1.1,shatterRadius:70}));return finish(65);
    }
    static update(hero,dt){
      const state=this.state(hero);if(state.trialStage&&(!hero.active))return;hero.evolutionAuraTime=Math.max(0,(hero.evolutionAuraTime||0)-dt);
      for(const key of ['evolutionCast','evolutionReveal'])if(hero[key]){hero[key].time=Math.max(0,hero[key].time-dt);if(hero[key].time<=0)hero[key]=null;}
    }
  }
  HeroEvolutionSystem.FORMS=FORMS;HeroEvolutionSystem.GATES=GATES;ns.systems.HeroEvolutionSystem=HeroEvolutionSystem;
})(globalThis.TowerFrontier);
