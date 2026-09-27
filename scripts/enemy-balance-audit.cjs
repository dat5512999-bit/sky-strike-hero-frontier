'use strict';
const {load}=require('../tests/helpers/td-runtime.cjs');

function runAudit(difficulty='standard'){
  const {ns}=load(),mode=ns.systems.TDDifficultySystem.MODES[difficulty];
  if(!mode)throw new Error('Unknown difficulty: '+difficulty);
  const waves=ns.systems.EnemyBalanceCatalog.audit(mode);
  return {difficulty,waves:waves.map(row=>({wave:row.wave,count:row.count,effectiveHealth:Math.round(row.effectiveHealth),pressure:Math.round(row.pressure),leak:row.leak})),profiles:Object.keys(ns.entities.Monster.TYPES).map(type=>({type,role:ns.systems.EnemyBalanceCatalog.get(type)?.role,answer:ns.systems.EnemyBalanceCatalog.get(type)?.answer}))};
}

if(require.main===module){
  const report=runAudit();
  console.table(report.waves.filter(row=>row.wave===1||row.wave%5===0||row.wave>=30));
  console.log('Enemy profiles:',report.profiles.length,'| standard pressure uses durability, speed, armor, leak damage, support auras and Boss phase reinforcements.');
}
module.exports={runAudit};
