'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {load,game,enemy}=require('./helpers/td-runtime.cjs');
function setup(type,rank=2){
  const {ns}=load(),g=game(ns),h=g.hero;h.chooseClass(type);h.level=15;h.equipment.spear=3;h.evolution.rank=rank;h.synergy=g.synergy;
  g.onKill=()=>{};g.onHit=()=>{};
  g.monsters=Array.from({length:18},(_,i)=>{const m=enemy(ns,140+i*5,100,'brute',100000);m.setRouteDistance(m.x);return m;});
  const E=ns.systems.HeroEvolutionSystem,C=ns.systems.HeroEvolutionCombat;
  return{ns,g,h,E,C,cast:slot=>E.cast(h,slot,{game:g,monsters:g.monsters,summons:g.summons,onKill:g.onKill,onHit:g.onHit})};
}
for(const type of ['hunter','naga','rogue'])test(type+' actual skill marks enable follow-up and death spread, not just base-stat growth',()=>{
  for(const rank of [0,1,2]){
    const {ns,g,h,C,cast}=setup(type,rank),source={owner:h,evolutionSkill:true};
    assert.equal(C.damageRate(g.monsters[0],source),1);
    if(!rank){assert.equal(cast('q'),null);continue;}
    assert.equal(cast('q'),true);const marked=g.monsters.find(m=>C.marked(m,h));assert.ok(marked);assert.ok(C.damageRate(marked,source)>1);
    const untouched=enemy(ns,marked.x+10,100,'brute',100000);g.monsters=[marked,untouched];marked.active=false;C.onDeath(h,marked,g.monsters);
    assert.equal(C.marked(untouched,h),rank===2||type==='rogue');C.updateEnemy(untouched,13);assert.equal(C.marked(untouched,h),false);
    if(type==='rogue')assert.equal(g.summons.filter(s=>s.active).length,rank===2?2:0);
  }
});
test('arcanist control opens a follow-up damage window which closes on expiry',()=>{
  for(const rank of [1,2]){const {g,h,C,cast}=setup('arcanist',rank);assert.equal(cast('q'),true);const m=g.monsters.find(m=>C.controlled(m));assert.ok(m);assert.ok(C.damageRate(m,{owner:h})>1);m.slowTimer=0;assert.equal(C.damageRate(m,{owner:h}),1);}
});
test('chief awakening changes engage position while transcendence uses a local density attack; aura works solo',()=>{
  for(const rank of [1,2]){const {h,cast}=setup('chief',rank),x=h.x,y=h.y;assert.equal(cast('q'),true);assert.equal(h.x!==x||h.y!==y,rank===1);assert.equal(cast('w'),true);assert.ok(h.evolutionAuraTime>0&&h.evolutionAuraRate>0);}
});
test('goblin evolves from a deployed helper to actual hit-earned energy and a consuming discharge',()=>{
  const a=setup('goblin',1);assert.equal(a.cast('e'),true);assert.equal(a.g.summons.filter(s=>s.active&&s.form==='goblin').length,1);
  const b=setup('goblin',2);assert.equal(b.cast('q'),true);assert.ok(b.h.evolution.energy>0);const energy=b.h.evolution.energy;assert.equal(b.cast('q'),false);assert.equal(b.h.evolution.energy,energy,'cooldown retry cannot farm energy');assert.equal(b.cast('e'),true);assert.equal(b.h.evolution.energy,0,'discharge must not recharge itself');assert.equal(b.g.summons.length,0);
});
test('frostland transcendence adds a persistent frost zone and three autonomous wolves',()=>{
  for(const rank of [1,2]){const {h,g,cast}=setup('frostland',rank);assert.equal(cast('q'),true);assert.equal(h.fields.some(f=>f.type==='evo-frostland'),rank===2);assert.equal(cast('e'),true);assert.equal(g.summons.filter(s=>s.active&&s.evolutionKind==='wolf').length,rank===2?3:2);}
});
test('dwarf armor break and self-buff are conditional; a distant enemy is unaffected by the local field',()=>{
  for(const rank of [1,2]){const {ns,g,h,C,cast}=setup('dwarf',rank);assert.equal(cast('q'),true);const m=g.monsters.find(m=>m.evolutionArmorTime>0),rate=C.damageRate(m,{owner:h});assert.ok(rate>1);assert.equal(cast('e'),true);assert.ok(C.damageRate(m,{owner:h})>rate);assert.equal(cast('w'),true);const far=enemy(ns,1800,100,'brute',100000);g.monsters.push(far);ns.systems.HeroRoster.updateFields(h,.6,g.monsters,g.onKill,g.onHit);assert.equal(far.health,far.maxHealth);assert.equal(far.evolutionArmorTime||0,0);assert.equal(C.damageRate(m,{owner:{}}),1);}
});
test('dragonkin marks only enhance magic and a prepared transcendent ultimate schedules an extra strike',()=>{
  for(const rank of [1,2]){const {g,h,C,cast}=setup('dragonkin',rank);assert.equal(cast('q'),true);const m=g.monsters.find(m=>C.marked(m,h));assert.ok(C.damageRate(m,{owner:h,attackType:'magic'})>1);assert.equal(C.damageRate(m,{owner:h,attackType:'pierce'}),1);assert.equal(cast('f'),true);assert.equal((h.evolutionPending||[]).length>0,rank===2);}
});
test('egypt mark rewards low-health timing and its solo protection heals without exceeding max health',()=>{
  for(const rank of [1,2]){const {g,h,C,cast}=setup('egypt',rank);assert.equal(cast('q'),true);const m=g.monsters.find(m=>C.marked(m,h));assert.equal(C.damageRate(m,{owner:h}),1);m.health=m.maxHealth*.49;assert.ok(C.damageRate(m,{owner:h})>1);h.health=h.maxHealth*.5;const before=h.health;assert.equal(cast('e'),true);assert.ok(h.health>before&&h.health<=h.maxHealth);assert.ok(h.invulnerable>0);}
});
test('bull engages by relocation and leaves a bounded slow zone independent of an allied army',()=>{
  for(const rank of [1,2]){const {ns,g,h,cast}=setup('bull',rank),before=[h.x,h.y];assert.equal(cast('q'),true);assert.notDeepEqual([h.x,h.y],before);assert.equal(cast('w'),true);const f=h.fields.find(f=>f.type==='evo-bull');assert.ok(f);const near=enemy(ns,f.x+10,f.y,'brute',100000),far=enemy(ns,1800,100,'brute',100000);g.monsters=[near,far];ns.systems.HeroRoster.updateFields(h,.6,g.monsters,g.onKill,g.onHit);assert.ok(near.slowTimer>0&&near.slowFactor<1);assert.equal(far.health,far.maxHealth);}
});
test('all eleven heroes cast each evolved slot with no army, finite effects and cooldown protection',()=>{
  const {ns}=load();for(const type of Object.keys(ns.systems.HeroRoster.CLASSES))for(const rank of [1,2])for(const slot of ['q','w','e','f']){
    const {g,h,E,cast}=setup(type,rank);assert.equal(g.build.combatUnits().length,0);assert.equal(cast(slot),true,type+rank+slot);assert.equal(cast(slot),false,'cooldown '+type+rank+slot);
    for(let i=0;i<30;i++){E.update(h,.1);ns.systems.HeroRoster.updateFields(h,.1,g.monsters,g.onKill,g.onHit);}
    assert.ok(g.monsters.every(m=>Number.isFinite(m.health)));assert.ok(Number.isFinite(h.x)&&Number.isFinite(h.y));
  }
});
