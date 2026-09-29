'use strict';
const {load,game,enemy,tick}=require('../tests/helpers/td-runtime.cjs');

// Deterministic combat evidence, kept separate from the catalog's rough DPS
// estimate. Real projectiles, armor, chains, cold and supply networks all run.
function denseOpening(ns,faction,opening){
  const g=game(ns);g.hero.active=false;g.waves={active:true};g.factions.choose(faction);
  g.goblinNetwork=new ns.systems.GoblinNetworkSystem();
  g.monsters=Array.from({length:6},(_,index)=>enemy(ns,140+index*9,100,'brute',1000000));
  g.build.items=opening.map(([kind,id],index)=>new ns.entities[kind==='unit'?'CombatUnit':'Building'](id,100,100+index*4));
  for(let frame=0;frame<240;frame++){g.goblinNetwork.update(.05,g.build.items,g.economy,true);tick(g,.05);}
  const damage=g.monsters.reduce((sum,monster)=>sum+1000000-monster.health,0);
  const budget=opening.reduce((sum,[kind,id])=>sum+ns.systems.FactionBalanceCatalog.resource((kind==='unit'?ns.config.units:ns.config.buildings)[id]),0);
  return {damage,budget,score:damage/budget*100};
}

function runAudit(){
  const {ns}=load();
  const rows=ns.systems.FactionBalanceCatalog.audit().map(row=>{
    const dense=denseOpening(ns,row.id,ns.systems.FactionBalanceCatalog.get(row.id).opening);
    return {
    id:row.id,
    faction:row.name,
    hero:row.hero,
    heroDps:Number(row.heroDps.toFixed(2)),
    openingResource:row.openingResource,
    openingPower:Number(row.openingPower.toFixed(2)),
    denseDamage:Number(dense.damage.toFixed(2)),
    denseScore:Number(dense.score.toFixed(2)),
    identity:row.identity,
    tradeoff:row.tradeoff
    };
  });
  return {rows,heroBand:[27,32],openingPowerBand:[55,95],denseBand:[200,650],denseScenario:'12 seconds, six stationary heavy enemies, Lv.1 opening, no hero attacks, no gear'};
}

if(require.main===module){
  const report=runAudit();
  console.table(report.rows);
  console.log('Hero DPS target:',report.heroBand.join('–'),'| opening pressure target:',report.openingPowerBand.join('–'));
  console.log('Dense-wave score target:',report.denseBand.join('–'),'|',report.denseScenario);
}
module.exports={runAudit,denseOpening};
