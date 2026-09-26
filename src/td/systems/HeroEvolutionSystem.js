(function(ns){
  'use strict';
  const FORMS={
    hunter:[null,{name:'覺醒',passive:'王印：標記目標承受更多追獵傷害。',skills:['王印追獵','獵區封鎖','誓約處決','王誓裁決'],hints:['射出四發王印箭，優先標記菁英與首領。','建立封鎖獵區，使敵人緩速並削弱護甲。','處決被王印鎖定的高威脅目標。','箭雨追擊所有王印目標。']},{name:'超凡',passive:'獵王領域：王印可在擊殺後傳遞。',skills:['曙光連弩','獵王領域','王庭連射','曙光裁決'],hints:['穿透連弩標記前線敵群。','擴張獵區，讓王印在擊殺後傳遞。','以多段追箭壓制首領。','以王庭一矢終結被鎖定的敵軍。']}],
    arcanist:[null,{name:'覺醒',passive:'奧術共鳴：受控敵人會強化後續法術。',skills:['晶棱禁錮','符文迴流','星靈共鳴','星界墜落'],hints:['封住前線強敵並擊碎護盾。','符文在敵群間回流，形成連鎖傷害。','喚起星靈轟擊受控目標。','向全線至多十名敵人釋放星界衝擊。']},{name:'超凡',passive:'折光迷宮：法術會在受控目標間折返。',skills:['折光迷宮','雷環回響','天穹墜星','星界終章'],hints:['封鎖前線並讓敵群反覆受擊。','雷環在受控敵人間額外彈跳。','指定區域降下高傷害星墜。','以全域星界脈衝收束敵群。']}],
    rogue:[null,{name:'覺醒',passive:'血影契印：受印目標會承受額外處決傷害。',skills:['無聲換位','血影契印','黑月處刑','夜幕獵殺'],hints:['換位至威脅最高的敵人身後。','為一群敵人刻下會擴散的血影契印。','優先處決低生命或帶有契印的目標。','短暫進入夜幕，連斬前線高威脅。']},{name:'超凡',passive:'千影巡遊：處決後留下殘影持續追擊。',skills:['千影巡遊','時間竊取','夜幕封城','月蝕終獵'],hints:['多次換位並在路徑留下殘影。','奪取敵人速度，延長處決窗口。','以暗影封鎖一段戰線。','月蝕斬擊所有受契印的精英。']}],
    chief:[null,{name:'覺醒',passive:'荒野意志：附近沒有部隊時，自身仍獲完整戰域效果。',skills:['破陣衝鋒','戰旗裂土','祖靈投影','荒原裁決'],hints:['衝入敵群並震退前線。','展開戰域；可強化自己與附近戰士。','喚出祖靈重擊敵軍行進線。','以荒野怒火重擊最前方敵群。']},{name:'超凡',passive:'不屈戰域：低生命時戰域更強，不依賴部隊人數。',skills:['戰團裁決','不屈戰域','荒王降臨','萬獸終戰'],hints:['依敵人密度擴張斧擊範圍。','讓自身與附近戰團進入不屈戰域。','短暫化為首領克星的荒王姿態。','以萬獸衝擊粉碎前線。']}],
    goblin:[null,{name:'覺醒',passive:'工程核心：沒有機械網路時，技能也會以自身核心運作。',skills:['磁軌鉚釘','拆解無人機','鍊爐超載','核心爆發'],hints:['鉚釘在敵人之間彈射並穿甲。','拆解一群敵人的護甲與護盾。','啟動自身超載，並部署強化機偶。','釋放工程核心儲能，轟擊前線。']},{name:'超凡',passive:'連鎖節點：每次技能命中會累積可釋放的工程能量。',skills:['連鎖節點','重力扳手','全域熔爐','超載協議'],hints:['以節點電弧串連敵群。','拉回突破口敵人並打斷攻勢。','將累積能量轉成大範圍熔爐爆發。','全域超載：即使沒有裝置也可釋放核心。']}],
    frostland:[null,{name:'覺醒',passive:'霜原獵印：冰霜標記使碎冰傷害提高。',skills:['狼印獵步','冰層裂谷','霜魄誘餌','白霜狩獵'],hints:['追獵凍結或深寒目標並施加狼印。','劃出裂冰地帶，快速累積寒冷。','以冰狼幻影聚集敵群。','由獵群撕裂所有被狼印鎖定的敵人。']},{name:'超凡',passive:'白夜狩域：凍結目標死亡時會將寒冷傳給附近敵人。',skills:['白夜狩域','絕對零點','狼王追魂','永冬狩令'],hints:['展開白夜狩域，持續擴散深寒。','壓制最危險的精英與首領。','狼王殘影追獵所有凍結目標。','發動永冬狩令，讓全場寒冷爆發。']}],
    naga:[null,{name:'覺醒',passive:'潮壓印記：被破潮矛命中的目標承受更強潮擊。',skills:['裂潮突刺','回流渦場','潮衛集結','海門決斷'],hints:['突進至前線，以多段潮壓刺擊命中目標。','展開回流渦場，拖慢並傷害附近敵軍。','召集潮衛幻影守住英雄周圍。','在最密集的戰線開啟海門衝擊。']},{name:'超凡',passive:'深海盟約：潮壓印記會在擊殺時向附近敵人傳遞。',skills:['深淵裂潮','靜海禁域','戰神潮衛','萬潮終章'],hints:['連續穿刺多名高威脅敵人。','以靜海禁域壓制前線敵軍。','讓潮衛幻影以更高頻率反擊。','釋放橫掃全線的萬潮終章。']}]
  };
  const GATES=[null,{wave:20,emblems:3,trialHealth:{hunter:1250,arcanist:1320,rogue:1180,chief:1270,goblin:1160,frostland:1210,naga:1280}},{wave:50,emblems:5,trialHealth:{hunter:2900,arcanist:3000,rogue:2750,chief:2960,goblin:2700,frostland:2820,naga:2940}}];

  const cooldown=(hero,base)=>base*(1-(hero.equipment.rune||0)*.1);
  const combat=()=>ns.systems.HeroEvolutionCombat;
  const alive=(monsters,hero,range)=>monsters.filter(m=>m.active&&ns.utils.distance(hero,m)<=range).sort((a,b)=>b.progress()-a.progress());
  const hit=(hero,target,ctx,options)=>{
    if(!target?.active)return null;
    const shot=new ns.entities.Projectile(hero,target,Object.assign({damage:1,color:ns.systems.HeroRoster.get(hero.classType).color,attackType:'chaos',canHitAir:true,evolutionSkill:true},options));
    shot.hit(ctx.monsters,ctx.onKill,ctx.onHit);return shot;
  };
  class HeroEvolutionSystem{
    static state(hero){return hero.evolution||(hero.evolution={rank:0,stones:0,healthFloor:0,trialStage:0});}
    static rank(hero){return this.state(hero).rank||0;}
    static form(hero){return FORMS[hero.classType]?.[this.rank(hero)]||null;}
    static skillSet(hero,fallback){return this.form(hero)?.skills||fallback;}
    static hintSet(hero,fallback){return this.form(hero)?.hints||fallback;}
    static rankName(hero){return this.form(hero)?.name||'初始';}
    static powerMultiplier(hero){return Math.max([1,2.08,3.72][this.rank(hero)]||1,this.state(hero).powerFloor||0);}
    static levelPower(hero){return this.powerMultiplier(hero)*(1+(hero.level-1)*.08);}
    static intervalScale(hero){return Math.min(Math.pow(.985,hero.level-1),this.state(hero).intervalFloor||1);}
    static nextGate(hero){return GATES[this.rank(hero)+1]||null;}
    static clearedWave(game){return Math.max(0,(game.waves?.wave||0)-(game.waves?.active?1:0));}
    static progress(hero,wave){const gate=this.nextGate(hero);if(!gate)return{complete:true};return{gate,unlocked:(wave||0)>=gate.wave,hasStone:(this.state(hero).stones||0)>0};}
    static canBuyStone(hero,economy,wave){const p=this.progress(hero,wave);return Boolean(p.gate&&p.unlocked&&!p.hasStone&&(economy.emblems||0)>=p.gate.emblems);}
    static buyStone(hero,economy,wave){
      const p=this.progress(hero,wave);if(!p.gate)return{ok:false,message:'英雄已達超凡'};
      if(!p.unlocked)return{ok:false,message:'需在第 '+p.gate.wave+' 波守成後才可購買進化石'};
      if(p.hasStone)return{ok:false,message:'已持有進化石，先完成試煉'};
      if((economy.emblems||0)<p.gate.emblems)return{ok:false,message:'首領勳章不足，還需要 '+(p.gate.emblems-(economy.emblems||0))+' 枚'};
      economy.emblems-=p.gate.emblems;this.state(hero).stones=1;return{ok:true,message:'已購買'+(this.rank(hero)===0?'覺醒':'超凡')+'進化石'};
    }
    static canStartTrial(game){const h=game.hero,s=this.state(h),p=this.progress(h,this.clearedWave(game));return Boolean(h.active&&(game.status===undefined||game.status==='playing')&&p.gate&&p.unlocked&&s.stones>0&&!s.trialStage&&!game.waves?.active&&!game.monsters?.some(m=>m.active));}
    static startTrial(game){
      if(!this.canStartTrial(game))return{ok:false,message:'請在波次間準備進化石，並等英雄復活後發起試煉'};
      const h=game.hero,stage=this.rank(h)+1,gate=GATES[stage],x=ns.utils.clamp(h.x+76,40,ns.config.width-40),y=ns.utils.clamp(h.y,60,ns.config.height-40),path=[{x,y},{x,y}];
      const boss=new ns.entities.Monster('boss',gate.wave,path);Object.assign(boss,{evolutionTrial:true,trialOwner:h,trialStage:stage,speed:0,baseDamage:0,reward:0,health:gate.trialHealth[h.classType],maxHealth:gate.trialHealth[h.classType],displayHealth:gate.trialHealth[h.classType],barrier:0,maxBarrier:0,abilityCooldown:7});
      this.state(h).trialStage=stage;game.evolutionPreparationHeld=Boolean(game.waves?.preparationHeld);game.waves?.holdPreparation?.(true);game.monsters.push(boss);
      return{ok:true,message:(stage===1?'覺醒':'超凡')+'試煉開始 · 僅英雄與其召喚有效；倒下可保留進化石重試'};
    }
    static releaseTrial(game){game.waves?.holdPreparation?.(Boolean(game.evolutionPreparationHeld));game.evolutionPreparationHeld=false;}
    static cancelTrial(game){
      if(!this.state(game.hero).trialStage)return false;
      for(const m of game.monsters)if(m.evolutionTrial){m.active=false;m.rewardHandled=true;}
      this.state(game.hero).trialStage=0;game.hero.evolutionPending=[];game.hero.fields=[];for(const s of game.summons||[])if(s.owner===game.hero)s.active=false;this.releaseTrial(game);game.flash?.('試煉未完成，進化石保留；復活後可再挑戰','#ffb36b');return true;
    }
    static completeTrial(game,monster){
      const h=game.hero,s=this.state(h),stage=s.trialStage;
      if(!h.active||!stage||monster?.trialOwner!==h||monster.trialStage!==stage||monster.health>0||monster.active)return false;
      const powerFloor=this.levelPower(h),intervalFloor=this.intervalScale(h);
      s.rank=stage;s.stones=Math.max(0,(s.stones||0)-1);s.trialStage=0;s.powerFloor=Math.max(powerFloor,this.powerMultiplier(h));s.intervalFloor=intervalFloor;s.healthFloor=Math.max(s.healthFloor||0,h.maxHealth);
      h.level=1;h.xp=0;h.maxHealth=Math.max(h.maxHealth,ns.config.hero.maxHealth+(stage===1?8:28));s.healthFloor=h.maxHealth;h.health=h.displayHealth=h.maxHealth;h.novaCooldown=0;h.skillCooldowns={thunder:0,summon:0,ultimate:0};h.fields=[];h.huntTime=0;h.evolutionPending=[];h.evolutionAuraTime=0;h.evolutionAvatarTime=0;
      for(const summon of game.summons||[])if(summon.owner===h&&summon.evolutionKind)summon.active=false;
      h.evolutionReveal={rank:stage,time:1.2,max:1.2};this.releaseTrial(game);game.flash?.(this.rankName(h)+'完成 · Lv.1 已繼承原有戰力','#ffe08a');if(game.checkpoints)game.saveChapterCheckpoint();return true;
    }
    static training(game){
      if(!game.evolutionCamp||this.rank(game.hero)!==2||!game.hero.active||game.monsters.some(m=>m.active))return false;
      const h=game.hero,x=ns.utils.clamp(h.x+70,40,ns.config.width-40),y=h.y,m=new ns.entities.Monster('boss',50,[{x,y},{x,y}]);
      Object.assign(m,{evolutionTraining:true,speed:0,combatRole:null,health:1000000,maxHealth:1000000,displayHealth:1000000,barrier:0,maxBarrier:0,baseDamage:0,reward:0});game.monsters.push(m);h.novaCooldown=0;h.skillCooldowns={thunder:0,summon:0,ultimate:0};return true;
    }
    static queue(hero,target,options,delay){hero.evolutionPending||=[];if(hero.evolutionPending.length<24)hero.evolutionPending.push({target,options,delay});}
    static cast(hero,slot,ctx){
      const stage=this.rank(hero);if(!stage)return null;if(!hero.active||!['q','w','e','f'].includes(slot))return false;
      const type=hero.classType,power=hero.skillPower(),factor=stage===1?1:1.45,C=combat(),targets=alive(ctx.monsters,hero,stage===2?290:230),primary=targets[0];
      const selfCast=(type==='chief'&&['w','e'].includes(slot))||(['naga','frostland','goblin'].includes(type)&&slot==='e')||(['hunter','naga'].includes(type)&&slot==='w');
      const globalUltimate=slot==='f'&&['arcanist','naga','frostland'].includes(type)&&ctx.monsters.some(m=>m.active);if(!primary&&!selfCast&&!globalUltimate)return false;
      const key=slot==='q'?'novaCooldown':slot==='w'?'thunder':slot==='e'?'summon':'ultimate';if(key==='novaCooldown'?hero.novaCooldown>0:hero.skillCooldowns[key]>0)return false;
      const attack=(target,damage,options={})=>hit(hero,target,ctx,Object.assign({damage:damage*power*factor},options));
      const finish=time=>{if(key==='novaCooldown')hero.novaCooldown=cooldown(hero,time);else hero.skillCooldowns[key]=cooldown(hero,time);hero.beginCast();hero.evolutionCast={slot,rank:stage,time:slot==='f'?1:.62,max:slot==='f'?1:.62,targetX:primary?.x??hero.x,targetY:primary?.y??hero.y};return true;};
      if(type==='hunter'){
        if(slot==='q'){const hunt=targets.slice().sort((a,b)=>Number(b.elite||b.combatRole==='boss')-Number(a.elite||a.combatRole==='boss'));for(const m of hunt.slice(0,stage===1?4:6)){C.mark(m,hero,stage===1?6:9);attack(m,58,{attackType:'pierce',armorPierce:2});}return finish(8);}
        if(slot==='w'){C.field(hero,'evo-hunter',power*factor,{time:stage===1?7:9,radius:stage===1?100:135});return finish(13);}
        if(slot==='e'){const m=targets.find(m=>C.marked(m,hero))||primary;attack(m,190,{attackType:'pierce',armorPierce:4,executeThreshold:.3,executeMultiplier:1.7});if(stage===2)for(const delay of [.18,.36])this.queue(hero,m,{damage:65*power*factor,attackType:'pierce',armorPierce:4},delay);return finish(23);}
        const marked=targets.filter(m=>C.marked(m,hero));for(const m of (marked.length?marked:targets).slice(0,stage===1?8:12)){C.mark(m,hero,6);attack(m,115,{attackType:'pierce',slow:.55,slowTime:2,armorPierce:3});}return finish(62);
      }
      if(type==='arcanist'){
        if(slot==='q'){for(const m of targets.slice(0,stage===1?2:3)){m.barrier=0;m.applySlow(stage===1?.16:.1,stage===1?2.2:3);attack(m,82,{attackType:'magic'});if(stage===2)this.queue(hero,m,{damage:36*power,attackType:'magic'},.3);}return finish(9);}
        if(slot==='w'){attack(primary,72,{attackType:'magic',chain:stage===1?5:7,chainRange:125,style:'lightning'});if(stage===2)for(const m of targets.filter(m=>C.controlled(m)).slice(0,4))this.queue(hero,m,{damage:35*power,attackType:'magic',style:'lightning'},.2);return finish(12);}
        if(slot==='e'){const controlled=targets.filter(m=>C.controlled(m)),pool=(controlled.length?controlled:targets).slice(0,18),center=pool.reduce((best,m)=>pool.filter(o=>ns.utils.distance(m,o)<105).length>pool.filter(o=>ns.utils.distance(best,o)<105).length?m:best,pool[0]);for(const m of ctx.monsters.filter(m=>m.active&&ns.utils.distance(m,center)<110).slice(0,16))attack(m,90,{attackType:'magic',slow:.45,slowTime:2.4});return finish(24);}
        for(const m of ctx.monsters.filter(m=>m.active).slice(0,stage===1?10:16)){attack(m,105,{attackType:'magic'});if(stage===2&&C.controlled(m))this.queue(hero,m,{damage:35*power,attackType:'magic'},.25);}return finish(66);
      }
      if(type==='rogue'){
        if(slot==='q'){for(const m of targets.slice(0,stage===1?1:3)){hero.x=ns.utils.clamp(m.x-28,25,ns.config.width-25);hero.y=ns.utils.clamp(m.y+20,55,ns.config.height-25);C.mark(m,hero,stage===1?7:10);attack(m,stage===1?130:85,{style:'claw'});}hero.setTarget(hero.x,hero.y);if(stage===2)C.summon(hero,ctx,'shadow',2);return finish(8);}
        if(slot==='w'){for(const m of targets.slice(0,stage===1?4:6)){C.mark(m,hero,stage===1?6:9);m.applySlow(stage===1?.64:.5,2);attack(m,34);}if(stage===2)hero.evolutionHasteTime=6;return finish(13);}
        if(slot==='e'){if(stage===2)C.field(hero,'evo-rogue',power,{time:6,radius:125});const m=targets.find(m=>m.health/m.maxHealth<.42||C.marked(m,hero))||primary;attack(m,210,{executeThreshold:stage===1?.42:.52,executeMultiplier:2.1,style:'claw'});if(stage===2&&!m.active)C.summon(hero,ctx,'shadow',2);return finish(22);}
        for(const m of targets.slice(0,stage===1?7:12))attack(m,105,{executeThreshold:.45,executeMultiplier:1.6,style:'claw'});hero.invulnerable=Math.max(hero.invulnerable||0,1);return finish(60);
      }
      if(type==='chief'){
        if(slot==='q'){if(stage===1){hero.x=ns.utils.clamp(primary.x-40,25,ns.config.width-25);hero.y=ns.utils.clamp(primary.y+20,55,ns.config.height-25);hero.setTarget(hero.x,hero.y);}const radius=stage===1?105:Math.min(180,110+targets.length*8);for(const m of alive(ctx.monsters,hero,radius).slice(0,16)){m.applySlow(.45,1.5);C.displace(m,35);attack(m,105);}return finish(9);}
        if(slot==='w'){hero.evolutionAuraTime=stage===1?7:10;hero.evolutionAuraRate=stage===1?.28:.46;for(const unit of ctx.game?.build?.combatUnits?.()||[])if(ns.utils.distance(unit,hero)<200)unit.tribalFrenzy=Math.max(unit.tribalFrenzy||0,hero.evolutionAuraTime);return finish(14);}
        if(slot==='e'){hero.evolutionAvatarTime=stage===1?5:8;for(const m of targets.slice(0,stage===1?4:7))attack(m,115,{slow:.5,slowTime:2.2});return finish(24);}
        for(const m of alive(ctx.monsters,hero,stage===1?145:185).slice(0,20))attack(m,145,{slow:.55,slowTime:2.4});return finish(64);
      }
      if(type==='goblin'){
        if(slot==='q'){attack(primary,64,{attackType:'pierce',chain:stage===1?4:7,chainRange:115,armorPierce:3,style:'goblin-rivet'});return finish(8);}
        if(slot==='w'){for(const m of targets.slice(0,stage===1?4:6)){m.barrier=0;C.weaken(m,2,6);m.applySlow(.5,2);if(stage===2)C.displace(m,60);attack(m,42,{style:'goblin-shot'});}return finish(13);}
        if(slot==='e'){
          if(stage===2&&!targets.length)return false;
          if(stage===2){const energy=this.state(hero).energy||0;this.state(hero).energy=0;for(const m of targets.slice(0,16))attack(m,75+energy,{evolutionDischarge:true,style:'goblin-shell'});}
          else{const old=ctx.summons.filter(s=>s.active&&s.owner===hero&&s.form==='goblin');for(const s of old)s.active=false;ctx.summons.push(new ns.entities.Summon(hero,{offsetX:28,duration:15,damage:34*power,form:'goblin',range:165,leash:280,speed:110}));}
          hero.goblinOverclock=Math.max(hero.goblinOverclock||0,stage===1?6:9);return finish(25);
        }
        const energy=this.state(hero).energy||0;this.state(hero).energy=0;for(const m of targets.slice(0,stage===1?8:14))attack(m,108+energy,{evolutionDischarge:true,style:'goblin-rocket'});return finish(66);
      }
      if(type==='naga'){
        if(slot==='q'){hero.x=ns.utils.clamp(primary.x-34,25,ns.config.width-25);hero.y=ns.utils.clamp(primary.y+16,55,ns.config.height-25);hero.setTarget(hero.x,hero.y);for(const m of targets.slice(0,stage===1?3:5)){C.mark(m,hero,stage===1?6:9);attack(m,78,{armorPierce:2,slow:.58,slowTime:1.25,style:'tide-spear'});this.queue(hero,m,{damage:40*power*factor,armorPierce:2,style:'tide-spear'},.2);}return finish(8);}
        if(slot==='w'){C.field(hero,'evo-naga',power*factor,{time:stage===1?7:9,radius:stage===1?100:130});return finish(13);}
        if(slot==='e'){C.summon(hero,ctx,'tideguard',stage===1?2:3,{duration:stage===1?8:11});return finish(24);}
        const tide=ctx.monsters.filter(m=>m.active),pool=tide.slice(0,24),center=pool.reduce((best,m)=>pool.filter(o=>ns.utils.distance(m,o)<130).length>pool.filter(o=>ns.utils.distance(best,o)<130).length?m:best,pool[0]),victims=stage===1?tide.filter(m=>ns.utils.distance(m,center)<130):tide;for(const m of victims.slice(0,stage===1?9:15))attack(m,118,{slow:.62,slowTime:2.6,style:'tide-judgement'});return finish(65);
      }
      if(type==='frostland'){
        if(slot==='q'){const hunt=targets.slice().sort((a,b)=>Number(C.controlled(b))-Number(C.controlled(a)));for(const m of hunt.slice(0,stage===1?3:5)){C.mark(m,hero,stage===1?6:9);attack(m,52,{frost:stage===1?42:60,shatter:stage===2?1.4:0,shatterRadius:65});}if(stage===2)C.field(hero,'evo-frostland',power,{time:7,radius:120});return finish(8);}
        if(slot==='w'){C.field(hero,'evo-frostland',power*factor,{time:5,radius:115});for(const m of targets.slice(0,8))attack(m,36,{frost:stage===1?50:75,slow:.48,slowTime:2.2});return finish(13);}
        if(slot==='e'){hero.huntTime=stage===1?8:11;C.summon(hero,ctx,'wolf',stage===1?2:3,{duration:hero.huntTime});return finish(23);}
        for(const m of ctx.monsters.filter(m=>m.active).sort((a,b)=>Number(C.marked(b,hero))-Number(C.marked(a,hero))).slice(0,24))attack(m,stage===1?68:105,{frost:stage===1?32:58,shatter:stage===2?1.5:1.1,shatterRadius:70});return finish(65);
      }
      return false;
    }
    static update(hero,dt){
      for(const key of ['evolutionAuraTime','evolutionAvatarTime','evolutionHasteTime'])hero[key]=Math.max(0,(hero[key]||0)-dt);
      for(const key of ['evolutionCast','evolutionReveal'])if(hero[key]){hero[key].time=Math.max(0,hero[key].time-dt);if(!hero[key].time)hero[key]=null;}
      if(!hero.active){hero.evolutionPending=[];return;}
      const game=hero.synergy?.game;if(!game)return;
      const ctx={game,monsters:game.monsters,summons:game.summons,onKill:(m,s)=>game.onKill(m,s),onHit:(m,d,c,s)=>game.onHit(m,d,c,s)};let processed=0;
      hero.evolutionPending=(hero.evolutionPending||[]).filter(item=>{item.delay-=dt;if(!item.target.active)return false;if(item.delay>0||processed>=6)return true;processed++;hit(hero,item.target,ctx,item.options);return false;});
    }
  }
  HeroEvolutionSystem.FORMS=FORMS;HeroEvolutionSystem.GATES=GATES;ns.systems.HeroEvolutionSystem=HeroEvolutionSystem;
})(globalThis.TowerFrontier);
