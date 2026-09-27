'use strict';
const {load}=require('../tests/helpers/td-runtime.cjs');

function runAudit(){
  const {ns}=load();
  const rows=ns.systems.FactionBalanceCatalog.audit().map(row=>({
    faction:row.name,
    hero:row.hero,
    heroDps:Number(row.heroDps.toFixed(2)),
    openingResource:row.openingResource,
    openingPower:Number(row.openingPower.toFixed(2)),
    identity:row.identity,
    tradeoff:row.tradeoff
  }));
  return {rows,heroBand:[27,32],openingPowerBand:[55,95]};
}

if(require.main===module){
  const report=runAudit();
  console.table(report.rows);
  console.log('Hero DPS target:',report.heroBand.join('–'),'| opening pressure target:',report.openingPowerBand.join('–'));
}
module.exports={runAudit};
