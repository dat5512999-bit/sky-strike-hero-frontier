'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {load,game,enemy}=require('./helpers/td-runtime.cjs');
const {runAudit,denseOpening}=require('../scripts/faction-balance-audit.cjs');
const factions=['dwarf','dragonkin'];
const near=(actual,expected,label)=>assert.ok(Math.abs(actual-expected)<1e-8,label+': '+actual+' versus '+expected);

for(const faction of factions){
  test(faction+' all four soldiers have five real upgrade ranks and keep armory titles reversible',()=>{
    const {ns}=load(),armory=new ns.systems.ArmorySystem();
    for(const type of ns.systems.FactionSystem.FACTIONS[faction].units){
      const unit=new ns.entities.CombatUnit(type,100,100),base=unit.config(),names=[];
      assert.equal(ns.config.units[type].ranks.length,5);
      for(let level=1;level<=5;level++){
        assert.equal(unit.level,level);names.push(unit.evolutionName());
        assert.equal(unit.evolutionName(),ns.config.units[type].ranks[level-1]);
        assert.ok(Number.isFinite(unit.config().damage));
        if(level<5)assert.ok(unit.upgrade());
      }
      assert.equal(new Set(names).size,5);assert.equal(unit.upgrade(),null);
      assert.ok(unit.config().damage>base.damage);assert.ok(unit.config().interval<base.interval);
      const item=Object.entries(ns.systems.ArmorySystem.ITEMS).find(([,item])=>item.types.includes(type));
      assert.ok(item,type);armory.obtain(item[0]);assert.equal(armory.equip(item[0],unit).ok,true);
      assert.equal(unit.evolutionName(),item[1].title);armory.releaseTarget(unit);
      assert.equal(unit.evolutionName(),names[4]);
    }
  });

  test(faction+' all four towers expose two level-three branches with implemented config modifiers',()=>{
    const {ns}=load(),multipliers=['damage','range','interval','splash'];
    for(const type of ns.systems.FactionSystem.FACTIONS[faction].buildings){
      const branches=ns.systems.TowerEvolutionSystem.branches(type);
      assert.equal(branches.length,2,type);assert.equal(new Set(branches.map(b=>b.name)).size,2);
      for(const branch of branches){
        const tower=new ns.entities.Building(type,100,100),original=JSON.stringify(ns.config.buildings[type]);
        assert.equal(tower.chooseBranch(branch.id),false,'cannot evolve before Lv.3');
        tower.level=3;const before=tower.config();assert.equal(tower.chooseBranch('unknown'),false);
        assert.equal(tower.chooseBranch(branch.id),true);const cfg=tower.config();
        assert.equal(cfg.branchName,branch.name);
        assert.equal(cfg.role,branch.description,'selected tower must not retain the pre-branch role text');
        assert.ok(ns.systems.TowerSkillSystem.describe(tower).includes(branch.description));
        for(const [key,value] of Object.entries(branch.mods)){
          if(multipliers.includes(key))near(cfg[key],before[key]*value,type+'/'+branch.id+'/'+key);
          else assert.equal(cfg[key],value,type+'/'+branch.id+'/'+key);
        }
        assert.equal(JSON.stringify(ns.config.buildings[type]),original,'branch must not mutate shared config');
        tower.level=5;for(const key of ['damage','range','interval'])assert.ok(Number.isFinite(tower.config()[key]));
      }
    }
  });

  test(faction+' offensive branch damage, targets, armor-piercing and splash reach real projectiles',()=>{
    const {ns}=load();
    for(const type of ns.systems.FactionSystem.FACTIONS[faction].buildings){
      if(ns.config.buildings[type].supportOnly)continue;
      for(const branch of ns.systems.TowerEvolutionSystem.branches(type)){
        const tower=new ns.entities.Building(type,100,100);tower.level=3;tower.chooseBranch(branch.id);tower.cooldown=0;
        const monsters=Array.from({length:8},(_,i)=>enemy(ns,140+i*9,100,'brute',100000)),shots=[];
        tower.update(.01,monsters,shots,[]);const cfg=tower.config();
        assert.equal(shots.length,cfg.shots||1,type+'/'+branch.id);
        assert.equal(new Set(shots.map(p=>p.target)).size,shots.length,'shots must have distinct targets');
        for(const p of shots){
          near(p.damage,cfg.damage,'projectile damage');near(p.splash||0,cfg.splash||0,'projectile splash');
          assert.equal(p.chain||0,cfg.chain||0);assert.equal(p.armorPierce||0,cfg.armorPierce||0);
          assert.equal(p.attackType,cfg.attackType);p.hit(monsters);
        }
        const damaged=monsters.filter(m=>m.health<m.maxHealth);
        assert.equal(damaged.length,cfg.splash?8:cfg.chain||cfg.shots||1,'real target count for '+type+'/'+branch.id);
        assert.ok(damaged.every(m=>Number.isFinite(m.health)&&m.health>0));
      }
    }
  });
}

test('southern support branches affect only matching soldiers/heroes, honor range and never stack',()=>{
  const {ns}=load();
  for(const [faction,type,unitType,otherUnit,boost,relay] of [
    ['dwarf','dwarfRuneForge','dwarfRifle','dragonkinEmberwing','overdrive','relay'],
    ['dragonkin','dragonkinRoost','dragonkinEmberwing','dwarfRifle','resonance','beacon']
  ]){
    const g=game(ns);g.hero.chooseClass(faction);g.hero.x=110;g.hero.y=100;
    const enhanced=new ns.entities.Building(type,100,100),base=new ns.entities.Building(type,100,100);
    enhanced.level=3;enhanced.chooseBranch(boost);
    const own=new ns.entities.CombatUnit(unitType,110,100),foreign=new ns.entities.CombatUnit(otherUnit,110,100);
    const far=new ns.entities.CombatUnit(unitType,enhanced.config().range+140,100);
    g.build.items=[enhanced,base,own,foreign,far];g.synergy.update(.05);
    assert.equal(own.supportHaste,.28);assert.equal(g.hero.supportHaste,.28);assert.equal(foreign.supportHaste,0);assert.equal(far.supportHaste,0);
    assert.equal(own.supportHasteSource,enhanced);
    enhanced.chooseBranch(relay);g.synergy.update(.05);
    assert.equal(own.supportHaste,.18);assert.equal(far.supportHaste,.18);assert.equal(foreign.supportHaste,0);
    const shots=[];enhanced.cooldown=0;enhanced.update(.05,[enemy(ns)],shots,[]);assert.equal(shots.length,0,'support tower must not invent attacks');
  }
});

test('southern unit ranks and tower branches survive the existing chapter-save schema',()=>{
  const {ns}=load(),data=new Map(),store={getItem:k=>data.get(k)||null,setItem:(k,v)=>data.set(k,v),removeItem:k=>data.delete(k)};
  const checkpoints=new ns.systems.ChapterCheckpointSystem(store);
  function checkpointGame(){const g=game(ns);Object.assign(g,{waves:new ns.systems.WaveSystem(),difficulty:new ns.systems.TDDifficultySystem(),armory:new ns.systems.ArmorySystem(),report:new ns.systems.BattleReportSystem(null),baseHealth:20,maxBaseHealth:20});g.difficulty.choose('veteran');g.report.beginRun({map:'beginner',difficulty:'veteran',profession:'dwarf',faction:'dragonkin'});g.hero.chooseClass('dwarf');g.factions.choose('dragonkin');g.waves.wave=10;return g;}
  const source=checkpointGame();source.build.items=[];
  for(const faction of factions){
    for(const type of ns.systems.FactionSystem.FACTIONS[faction].units){const unit=new ns.entities.CombatUnit(type,100,100);unit.level=5;source.build.items.push(unit);}
    for(const type of ns.systems.FactionSystem.FACTIONS[faction].buildings){const tower=new ns.entities.Building(type,200,200);tower.level=5;tower.chooseBranch(ns.systems.TowerEvolutionSystem.branches(type)[1].id);source.build.items.push(tower);}
  }
  assert.ok(checkpoints.capture(source));const restored=checkpointGame();assert.equal(checkpoints.restore(restored,checkpoints.read()),true);
  assert.equal(restored.build.items.length,16);
  restored.build.items.forEach((item,i)=>{assert.equal(item.type,source.build.items[i].type);assert.equal(item.level,5);if(item.kind==='unit')assert.equal(item.evolutionName(),source.build.items[i].evolutionName());else{assert.equal(item.branch,source.build.items[i].branch);assert.equal(item.config().branchName,source.build.items[i].config().branchName);}});
});

test('nine faction openings pass unchanged real-combat thresholds; dwarf recommendation fixes double-single-target mismatch',()=>{
  const {ns}=load(),report=runAudit();assert.equal(report.rows.length,9);
  for(const row of report.rows){assert.ok(row.denseScore>=200&&row.denseScore<=650,row.id+': '+row.denseScore);assert.ok(row.openingResource<=415);assert.ok(row.openingPower>=55&&row.openingPower<=95);}
  const scores=report.rows.map(r=>r.denseScore);assert.ok(Math.max(...scores)/Math.min(...scores)<=3);
  const before=denseOpening(ns,'dwarf',[['unit','dwarfRifle'],['building','dwarfBoltTower']]);
  const after=denseOpening(ns,'dwarf',ns.systems.FactionBalanceCatalog.get('dwarf').opening);
  assert.ok(before.score<200);assert.ok(after.score>300);assert.ok(after.score>before.score*2);
  assert.equal(after.budget,375);assert.equal(ns.config.units.dwarfShield.damage,29,'do not inflate stats to mask a poor opening');
  assert.equal(ns.config.buildings.dwarfBoltTower.damage,27);assert.equal(ns.config.buildings.dwarfBoltTower.shots,undefined,'precision tower remains single-target');
});
