'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {load,game,enemy,tick}=require('./helpers/td-runtime.cjs');
const {runAudit}=require('../scripts/faction-balance-audit.cjs');

test('every selectable faction has a complete, distinct balance profile for all heroes, soldiers and towers',()=>{
  const {ns}=load(),profiles=ns.systems.FactionBalanceCatalog.profiles(),factions=ns.systems.FactionSystem.FACTIONS,roles=ns.systems.FactionBalanceCatalog.roleTypes();
  assert.deepEqual(Object.keys(profiles).sort(),Object.keys(factions).sort());
  for(const [id,faction] of Object.entries(factions)){
    const profile=profiles[id];
    assert.ok(ns.systems.HeroRoster.CLASSES[profile.hero],id+' must map to a playable hero');
    for(const kind of ['unit','building']){
      assert.deepEqual(Object.keys(profile.roles[kind]).sort(),Array.from(new Set(faction[kind+'s'])).sort(),id+' '+kind+' roster must be fully classified');
      for(const [itemId,role] of Object.entries(profile.roles[kind])){
        assert.ok(roles.includes(role),itemId+' needs a recognised combat role');
        assert.ok((kind==='unit'?ns.config.units:ns.config.buildings)[itemId],itemId+' must resolve in combat data');
      }
    }
    for(const role of profile.required)assert.ok(Object.values(profile.roles.unit).concat(Object.values(profile.roles.building)).includes(role),id+' needs '+role);
  }
  assert.equal(new Set(Object.values(profiles).map(profile=>profile.identity)).size,Object.keys(profiles).length,'factions must not share the same identity');
});

test('hero power and affordable opening pressure stay inside the shared balance budget',()=>{
  const report=runAudit(),hero=[27,32],opening=[55,95];
  for(const row of report.rows){
    assert.ok(row.heroDps>=hero[0]&&row.heroDps<=hero[1],row.faction+' hero DPS '+row.heroDps);
    assert.ok(row.openingResource<=415,row.faction+' opening must be reachable before midgame');
    assert.ok(row.openingPower>=opening[0]&&row.openingPower<=opening[1],row.faction+' opening pressure '+row.openingPower);
  }
  const powers=report.rows.map(row=>row.openingPower);
  assert.ok(Math.max(...powers)/Math.min(...powers)<=1.75,'no faction opening may exceed the weakest opening by more than 75%');
});

test('stationary soldiers are balanced by real combat roles, never by their inert health, armor, or move speed',()=>{
  const {ns}=load();
  for(const faction of Object.values(ns.systems.FactionSystem.FACTIONS))for(const unitId of faction.units){
    const cfg=ns.config.units[unitId],role=ns.systems.FactionBalanceCatalog.get(faction.id).roles.unit[unitId];
    assert.ok(role!=='support'||cfg.supportOnly||cfg.damage>0,unitId+' support role must expose a real support or combat effect');
    if(!cfg.supportOnly)assert.ok(cfg.damage>0&&cfg.range>0&&cfg.interval>0,unitId+' must contribute through the active combat path');
  }
});

test('seven documented openings stay viable in the shared dense-wave combat loop',()=>{
  const {ns}=load(),scores=[];
  for(const [faction,profile] of Object.entries(ns.systems.FactionBalanceCatalog.profiles())){
    const g=game(ns);g.hero.active=false;g.waves={active:true};g.factions.choose(faction);g.goblinNetwork=new ns.systems.GoblinNetworkSystem();
    const opening=profile.opening.map(([kind,id])=>({kind,id,cfg:(kind==='unit'?ns.config.units:ns.config.buildings)[id]}));
    g.monsters=Array.from({length:6},(_,index)=>enemy(ns,140+index*9,100,'brute',1000000));
    g.build.items=opening.map((item,index)=>new ns.entities[item.kind==='unit'?'CombatUnit':'Building'](item.id,100,100+index*4));
    for(let frame=0;frame<240;frame++){g.goblinNetwork.update(.05,g.build.items,g.economy,true);tick(g,.05);}
    const damage=g.monsters.reduce((sum,monster)=>sum+1000000-monster.health,0),budget=opening.reduce((sum,item)=>sum+item.cfg.cost+(item.cfg.wood||0)*35,0),score=damage/budget*100;
    assert.ok(score>=200&&score<=650,faction+' dense-wave score '+score.toFixed(1));
    scores.push(score);
  }
  assert.ok(Math.max(...scores)/Math.min(...scores)<=3,'dense-wave faction gap must remain at or below 3×');
});

test('new opening multi-target fire uses the ordinary projectile path instead of hidden damage',()=>{
  const {ns}=load();
  for(const id of ['goblinTurret','nagaTidegate']){
    const tower=new ns.entities.Building(id,100,100),targets=[enemy(ns,140,100),enemy(ns,150,100)],shots=[];
    tower.cooldown=0;tower.update(.01,targets,shots,[]);
    assert.equal(shots.length,2,id+' should visibly fire at two different targets');
    assert.notEqual(shots[0].target,shots[1].target,id+' must not double-hit one target');
  }
});
