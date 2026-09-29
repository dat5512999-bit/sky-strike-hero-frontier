'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {load,game,enemy}=require('./helpers/td-runtime.cjs');
const {strictCanvas}=require('./helpers/strict-canvas.cjs');
const TYPES=['dwarf','dragonkin','egypt'],SLOTS=['q','w','e','f'];
function setup(type='dwarf',rank=1){
  const {ns}=load(),g=game(ns);g.hero.chooseClass(type);g.hero.evolution.rank=rank;g.hero.synergy=g.synergy;g.status='playing';g.waves=new ns.systems.WaveSystem();g.onHit=()=>{};g.onKill=()=>{};g.updateUi=()=>{};
  g.monsters=Array.from({length:24},(_,i)=>{const m=enemy(ns,140+i%6*5,100+Math.floor(i/6)*5,'brute',100000);m.setRouteDistance(m.x);return m;});
  return{ns,g,E:ns.systems.HeroEvolutionSystem,C:ns.systems.HeroEvolutionCombat};
}
function cast(ns,g,slot){return ns.systems.HeroEvolutionSystem.cast(g.hero,slot,{game:g,monsters:g.monsters,summons:g.summons,onKill:g.onKill,onHit:g.onHit});}
function health(g){return g.monsters.reduce((n,m)=>n+m.health,0);}
function cooldown(hero,slot){return slot==='q'?hero.novaCooldown:hero.skillCooldowns[{w:'thunder',e:'summon',f:'ultimate'}[slot]];}

for(const type of TYPES)for(const rank of [1,2]){
  test(type+' rank '+rank+' has four actual evolved skills, hints, passive and finite trial health',()=>{
    const {ns,g,E}=setup(type,rank),form=E.form(g.hero);
    assert.equal(form.skills.length,4);assert.equal(new Set(form.skills).size,4);assert.equal(form.hints.length,4);assert.ok(form.hints.every(h=>h.includes('冷卻')));assert.ok(form.passive.length>8);
    assert.ok(form.skills.every(name=>!ns.systems.HeroRoster.get(type).skills.includes(name)));
    const hp=E.GATES[rank].trialHealth[type];assert.ok(Number.isFinite(hp)&&hp>1000);
    assert.notDeepEqual(Array.from(E.FORMS[type][1].skills),Array.from(E.FORMS[type][2].skills));
  });
  test(type+' rank '+rank+' Q/W/E/F work without same-faction troops, enforce cooldowns and render every phase',()=>{
    for(const slot of SLOTS){
      const {ns,g,E,C}=setup(type,rank),before=health(g),canvas=strictCanvas(),baseRate=C.damageRate(g.monsters[0],{owner:g.hero,attackType:'magic'});
      g.factions.choose('hunter');assert.equal(g.build.combatUnits().length,0);assert.equal(cast(ns,g,slot),true,slot);assert.equal(cast(ns,g,slot),false,'cooldown '+slot);assert.ok(cooldown(g.hero,slot)>0);
      if(slot==='e')assert.ok(C.damageRate(g.monsters[0],{owner:g.hero,attackType:'magic'})>baseRate,'self-buff actually increases output');
      for(let frame=0;frame<=60;frame++){
        if(g.hero.evolutionCast)g.hero.evolutionCast.time=g.hero.evolutionCast.max*(1-frame/60);
        assert.equal(ns.systems.HeroEvolutionPresentation.draw(canvas.ctx,null,g.hero),true);
        ns.systems.HeroRoster.drawFields(canvas.ctx,g.hero);assert.equal(canvas.depth,0);assert.equal(g.hero.evolutionFault,undefined);
      }
      assert.ok(canvas.calls.some(call=>call[0]==='lineTo'||call[0]==='arc'));
      for(let i=0;i<160;i++){E.update(g.hero,.1);ns.systems.HeroRoster.updateFields(g.hero,.1,g.monsters,g.onKill,g.onHit);}
      if(slot!=='e')assert.ok(health(g)<before,'actual damage '+slot);
      assert.equal(g.hero.fields.length,0);assert.equal(g.hero.evolutionAvatarTime,0);assert.ok(!g.hero.evolutionPending?.length);assert.equal(g.hero.evolutionFault,undefined);
    }
  });
  test(type+' rank '+rank+' empty offensive casts are free while self-buffs remain usable',()=>{
    const {ns,g}=setup(type,rank);g.monsters=[];
    for(const slot of ['q','f']){assert.equal(cast(ns,g,slot),false);assert.equal(cooldown(g.hero,slot),0);}
    assert.equal(cast(ns,g,'w'),type!=='dragonkin');assert.equal(cast(ns,g,'e'),true);
    if(type==='dragonkin')assert.equal(g.hero.skillCooldowns.thunder,0);
  });
  test(type+' rank '+rank+' attacks cannot damage out-of-range enemies or overflow their target cap',()=>{
    for(const slot of ['q','f']){
      const {ns,g}=setup(type,rank),far=enemy(ns,1800,100,'brute',100000);far.setRouteDistance(1800);g.monsters.push(far);assert.equal(cast(ns,g,slot),true);
      assert.equal(far.health,100000);const cap={dwarf:{q:[0,6,9],f:[0,12,16]},dragonkin:{q:[0,4,6],f:[0,10,14]},egypt:{q:[0,3,5],f:[0,10,14]}}[type][slot][rank];
      assert.ok(g.monsters.filter(m=>m.health<100000).length<=cap);
      const fresh=setup(type,rank);fresh.g.monsters=[enemy(fresh.ns,1800,100,'brute',100000)];assert.equal(cast(fresh.ns,fresh.g,slot),false);assert.equal(cooldown(fresh.g.hero,slot),0);
    }
  });
  test(type+' rank '+rank+' field caps one present-time pulse and cancels on death',()=>{
    const {ns,g,E}=setup(type,rank);assert.equal(cast(ns,g,'w'),true);const field=g.hero.fields[0],cap=field.maxTargets,far=enemy(ns,field.x+field.radius+1,field.y,'brute',100000);g.monsters.push(far);
    let hits=0;ns.systems.HeroRoster.updateFields(g.hero,3600,g.monsters,()=>{},()=>hits++);
    assert.ok(hits>0&&hits<=cap);assert.equal(far.health,100000);assert.equal(g.hero.fields.length,0,'no catch-up backlog survives');
    g.hero.skillCooldowns.thunder=0;cast(ns,g,'w');cast(ns,g,'e');const before=health(g);g.hero.active=false;E.update(g.hero,.1);ns.systems.HeroRoster.updateFields(g.hero,.5,g.monsters);
    assert.equal(health(g),before);assert.equal(g.hero.fields.length,0);assert.equal(g.hero.evolutionAvatarTime,0);assert.equal(g.hero.evolutionCast,null);assert.equal(cast(ns,g,'q'),false);
  });
  test(type+' rank '+rank+' real weapon attacks finish trial without army and preserve progression',()=>{
    const {ns,g,E}=setup(type,rank-1);g.monsters=[];g.hero.level=15;g.hero.equipment.spear=3;g.hero.maxHealth=g.hero.health=320;g.hero.evolution.stones=1;g.waves.wave=rank===1?20:50;g.waves.beginPreparation();
    const beforePower=g.hero.skillPower(),beforeInterval=g.hero.combatConfig().interval;assert.equal(E.startTrial(g).ok,true);const boss=g.monsters[0],startHp=boss.health;
    boss.takeDamage(100000,{owner:{kind:'unit'}});assert.equal(boss.health,startHp,'only hero-owned hits count');assert.equal(E.completeTrial(g,boss),false);
    let elapsed=0;while(boss.active&&elapsed<90){
      g.hero.update(.1,g.monsters,g.projectiles);for(const p of g.projectiles)p.update(.1,g.monsters,()=>{},()=>{});g.projectiles=g.projectiles.filter(p=>p.active);elapsed+=.1;
    }
    assert.equal(boss.active,false,'ordinary hero attacks complete a finite trial');assert.ok(elapsed<90);
    assert.equal(E.completeTrial(g,boss),true);assert.equal(g.hero.evolution.rank,rank);assert.equal(g.hero.level,1);assert.equal(g.hero.evolution.stones,0);assert.equal(g.hero.equipment.spear,3);assert.ok(g.hero.skillPower()>=beforePower);assert.ok(g.hero.combatConfig().interval<=beforeInterval);assert.ok(g.hero.maxHealth>=320);assert.equal(E.completeTrial(g,boss),false);
  });
}

test('southern passive identities apply real owner-specific conditional damage and expire',()=>{
  const dwarf=setup('dwarf',2),dm=dwarf.g.monsters[0];assert.equal(dwarf.C.damageRate(dm,{owner:dwarf.g.hero}),1);dwarf.C.weaken(dm,6,2);assert.equal(dwarf.C.damageRate(dm,{owner:dwarf.g.hero}),1.25);assert.equal(dwarf.C.damageRate(dm,{owner:{}}),1);dwarf.C.updateEnemy(dm,3);assert.equal(dwarf.C.damageRate(dm,{owner:dwarf.g.hero}),1);
  const dragon=setup('dragonkin',2),[a,b]=dragon.g.monsters;dragon.C.mark(a,dragon.g.hero,1);assert.equal(dragon.C.damageRate(a,{owner:dragon.g.hero,attackType:'magic'}),1.28);assert.equal(dragon.C.damageRate(a,{owner:dragon.g.hero,attackType:'pierce'}),1);a.active=false;dragon.C.onDeath(dragon.g.hero,a,dragon.g.monsters);const spread=dragon.g.monsters.filter(m=>m.active&&dragon.C.marked(m,dragon.g.hero));assert.equal(spread.length,2);assert.ok(spread.every(m=>dragon.ns.utils.distance(m,a)<=130));assert.ok(dragon.C.marked(b,dragon.g.hero));dragon.C.updateEnemy(b,7);assert.equal(dragon.C.marked(b,dragon.g.hero),false);
  const egypt=setup('egypt',2),em=egypt.g.monsters[0];egypt.C.mark(em,egypt.g.hero);assert.equal(egypt.C.damageRate(em,{owner:egypt.g.hero}),1);em.health=em.maxHealth*.49;assert.equal(egypt.C.damageRate(em,{owner:egypt.g.hero}),1.28);assert.equal(egypt.C.damageRate(em,{owner:{}}),1);
});
test('Egypt healing is bounded and solo guard truly reduces incoming damage temporarily',()=>{
  const {ns,g}=setup('egypt',2);g.monsters=[];g.hero.health=20;const max=g.hero.maxHealth;
  assert.equal(cast(ns,g,'e'),true);assert.equal(g.hero.health,Math.min(max,20+max*.22));const hp=g.hero.health;assert.equal(g.hero.takeDamage(10),0);g.hero.update(1,[],[]);assert.equal(g.hero.takeDamage(10),10);assert.equal(g.hero.health,hp-10);
  g.hero.health=max;g.hero.skillCooldowns.summon=0;cast(ns,g,'e');assert.equal(g.hero.health,max);
});
test('dragon chain stays in cast radius and delayed thunder neither pursues distant targets nor survives death',()=>{
  const {ns,g,E,C}=setup('dragonkin',2);g.monsters=[enemy(ns,395,100,'brute',100000),enemy(ns,405,100,'brute',100000)];g.monsters.forEach(m=>m.setRouteDistance(m.x));
  assert.equal(cast(ns,g,'q'),true);assert.ok(g.monsters[0].health<100000);assert.equal(g.monsters[1].health,100000,'chain cannot jump to 305 distance');
  const target=g.monsters[0];C.mark(target,g.hero);assert.equal(cast(ns,g,'f'),true);assert.ok(g.hero.evolutionPending.length>0);const hp=target.health;target.x=1800;E.update(g.hero,.5);assert.equal(target.health,hp);assert.equal(g.hero.evolutionPending.length,0);
  target.x=200;g.hero.skillCooldowns.ultimate=0;cast(ns,g,'f');const after=target.health;g.hero.active=false;E.update(g.hero,1);assert.equal(target.health,after);assert.equal(g.hero.evolutionPending.length,0);
});
test('failed southern trials preserve the stone and previous preparation hold, rejecting nonfinite completion',()=>{
  for(const type of TYPES){const {g,E}=setup(type,0);g.monsters=[];g.waves.wave=20;g.waves.beginPreparation();g.waves.holdPreparation(true);g.hero.evolution.stones=1;assert.equal(E.startTrial(g).ok,true);const boss=g.monsters[0];boss.active=false;boss.health=NaN;assert.equal(E.completeTrial(g,boss),false);g.hero.active=false;assert.equal(E.cancelTrial(g),true);assert.equal(g.hero.evolution.stones,1);assert.equal(g.hero.evolution.trialStage,0);assert.equal(g.waves.preparationHeld,true);g.hero.active=true;assert.equal(E.startTrial(g).ok,true);}
});
test('nonfinite cast data and damaged pending effects never corrupt health or produce infinite work',()=>{
  for(const type of TYPES){
    const {ns,g,E,C}=setup(type,2);g.hero.equipment.spear=Infinity;const before=health(g);assert.equal(cast(ns,g,'q'),false);assert.equal(health(g),before);assert.equal(g.hero.novaCooldown,0);g.hero.equipment.spear=0;
    for(const dt of [NaN,Infinity,-Infinity,-1]){cast(ns,g,'w');const field=g.hero.fields[0];E.update(g.hero,dt);C.pulse(g.hero,field,dt,g.monsters);assert.ok(Number.isFinite(field.time)&&Number.isFinite(field.tick));assert.equal(health(g),before);}
    g.hero.evolutionPending=[{target:g.monsters[0],delay:NaN,options:{damage:100}},{target:null,delay:0,options:{damage:100}},{target:g.monsters[0],delay:0,options:{damage:Infinity}}];E.update(g.hero,1);assert.equal(g.hero.evolutionPending.length,0);assert.equal(health(g),before);
    C.weaken(g.monsters[0],Infinity,NaN);assert.ok(Number.isFinite(g.monsters[0].evolutionArmorBreak));g.hero.equipment.rune=Infinity;cast(ns,g,'q');assert.ok(Number.isFinite(g.hero.novaCooldown)&&g.hero.novaCooldown>0);
    g.hero.evolution={rank:NaN,stones:Infinity,healthFloor:NaN,trialStage:Infinity,powerFloor:Infinity,intervalFloor:NaN};assert.equal(E.rank(g.hero),0);assert.ok(Number.isFinite(E.levelPower(g.hero)));assert.ok(Number.isFinite(E.intervalScale(g.hero)));
  }
});
test('legacy and current southern checkpoint data restore rank, equipment and floors without transient effects',()=>{
  for(const type of TYPES){
    const {ns,g,E}=setup(type,2);g.monsters=[];g.waves.wave=20;g.armory=new ns.systems.ArmorySystem();g.difficulty=new ns.systems.TDDifficultySystem();g.report=new ns.systems.BattleReportSystem(null);g.report.beginRun({profession:type,faction:'hunter',map:'beginner'});g.hero.equipment.spear=3;g.hero.evolution.powerFloor=4.5;g.hero.evolution.healthFloor=320;g.hero.evolutionAvatarTime=10;
    const system=new ns.systems.ChapterCheckpointSystem(null),saved=system.capture(g);assert.ok(saved);assert.equal(saved.schema,1);assert.equal(saved.hero.evolutionAvatarTime,undefined);
    const target=setup('hunter',0).g;target.armory=new ns.systems.ArmorySystem();target.difficulty=new ns.systems.TDDifficultySystem();target.report=new ns.systems.BattleReportSystem(null);target.hero.evolutionAvatarTime=99;assert.equal(system.restore(target,saved),true);assert.equal(target.hero.classType,type);assert.equal(E.rank(target.hero),2);assert.equal(target.hero.equipment.spear,3);assert.equal(target.hero.evolution.powerFloor,4.5);assert.equal(target.hero.evolution.healthFloor,320);assert.equal(target.hero.evolutionAvatarTime,0);
    saved.hero.evolution={rank:1};assert.equal(system.restore(target,saved),true);assert.equal(E.rank(target.hero),1);assert.equal(E.state(target.hero).stones,0);assert.equal(E.state(target.hero).trialStage,0);assert.ok(E.form(target.hero));
  }
});
test('southern evolution Canvas faults isolate one renderer and malformed visual values stay finite',()=>{
  for(const type of TYPES){const {ns,g}=setup(type,2),c=strictCanvas();g.hero.evolutionCast={slot:'f',time:Infinity,max:1,targetX:NaN,targetY:Infinity};g.hero.evolutionReveal={time:1,max:NaN};assert.equal(ns.systems.HeroEvolutionPresentation.draw(c.ctx,null,g.hero),true);assert.equal(g.hero.evolutionFault,undefined);assert.equal(c.depth,0);c.ctx.arc=()=>{throw Error('injected evolution crest');};assert.equal(ns.systems.HeroEvolutionPresentation.draw(c.ctx,null,g.hero),false);assert.equal(c.depth,0);assert.match(g.hero.evolutionFault,/injected/);g.hero.evolutionFault=null;assert.equal(ns.systems.HeroEvolutionPresentation.draw(c.ctx,null,g.hero),false);assert.equal(g.hero.evolutionFault,null);}
});

test('cooldown key-repeat returns before scanning or sorting a 150-enemy battlefield',()=>{
  for(const type of TYPES){
    const {ns,g}=setup(type,2);let scans=0;
    g.monsters=Array.from({length:150},()=>({get active(){scans++;return true;},x:130,y:100,health:1000,progress:()=>1}));
    g.hero.novaCooldown=1;g.hero.skillCooldowns={thunder:1,summon:1,ultimate:1};
    for(let repeat=0;repeat<60;repeat++)for(const slot of SLOTS)assert.equal(cast(ns,g,slot),false);
    assert.equal(scans,0,type+' cooling skills must not scan enemies');
  }
});

test('neutral mercenaries neither inherit southern evolution passives nor replace faction-only base commands',()=>{
  for(const type of TYPES){
    const {ns,g,C}=setup(type,2),neutrals=['bountyHunter','powderThrower','fireDemon','frostWyrm'].map(id=>new ns.entities.CombatUnit(id,120,100)),target=g.monsters[0];
    g.build.items=neutrals.slice();target.health=target.maxHealth*.2;C.mark(target,g.hero);C.weaken(target,6,4);assert.equal(cast(ns,g,'e'),true);
    for(const unit of neutrals)assert.equal(C.damageRate(target,{owner:unit,attackType:unit.config().attackType}),1,unit.type+' keeps its independent damage contract');
    if(type==='egypt')continue;
    g.hero.evolution.rank=0;g.hero.skillCooldowns.summon=0;assert.equal(g.hero.castSummon(g.summons),false,'neutral troops do not qualify as '+type+' allies');
    const ally=new ns.entities.CombatUnit(type==='dwarf'?'dwarfRifle':'dragonkinLancer',120,100);g.build.items.push(ally);assert.equal(g.hero.castSummon(g.summons),true);assert.equal(ally.nagaCommand,5);assert.ok(neutrals.every(unit=>!unit.nagaCommand));
  }
});
