'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {load,game,enemy}=require('./helpers/td-runtime.cjs');

test('大酋長 E 發射前進的裂地波，沿直線穿透並減速，每敵只命中一次',()=>{
  const {ns}=load(),g=game(ns);
  g.hero.chooseClass('chief');g.hero.facing=0;g.hero.pendingTarget=null;
  g.shockwaves=[];g.status='playing';g.paused=false;g.profession.selected=true;g.updateUi=()=>{};
  const first=enemy(ns,180,100,'brute',1000),second=enemy(ns,285,120,'brute',1000),outside=enemy(ns,220,220,'brute',1000),behind=enemy(ns,55,100,'brute',1000);
  g.monsters=[first,second,outside,behind];
  const hits=[];g.onHit=(monster,damage,critical,source)=>hits.push({monster,damage,source});g.onKill=()=>{};
  g.castHeroSkill('summon');
  assert.equal(g.shockwaves.length,1);assert.equal(g.summons.length,0);
  const wave=g.shockwaves[0];
  assert.equal(g.hero.skillCooldowns.summon,22);
  assert.ok(g.hero.skillVfx.some(v=>v.type==='chief-shockwave-cast'));
  for(let i=0;i<9;i++)wave.update(.1,g.monsters,g.onKill,g.onHit);
  assert.equal(hits.length,2);assert.ok(hits.every(hit=>hit.damage>0&&hit.source.owner===g.hero));
  assert.ok(first.slowTimer>0&&second.slowTimer>0);
  assert.equal(outside.health,outside.maxHealth);assert.equal(behind.health,behind.maxHealth);
  assert.equal(wave.active,false);
  g.castHeroSkill('summon');assert.equal(g.shockwaves.length,1);
});

test('裂地波優先追蹤已選目標，祖靈契約提升傷害與三級波幅',()=>{
  const {ns}=load(),hero=new ns.entities.Hero(100,100);hero.chooseClass('chief');
  hero.facing=0;const selected=enemy(ns,100,260,'brute',1000);
  hero.pendingTarget=selected;hero.equipment.charm=3;
  const wave=new ns.systems.ChiefShockwave(hero,[selected]);
  assert.ok(Math.abs(wave.dx)<.01&&wave.dy>.99);
  assert.equal(wave.halfWidth,42);
  hero.pendingTarget=null;hero.facing=Math.PI;
  const facingWave=new ns.systems.ChiefShockwave(hero);
  assert.ok(facingWave.dx<-.99&&Math.abs(facingWave.dy)<.01);
  const base=new ns.entities.Hero(100,100);base.chooseClass('chief');
  assert.ok(wave.damage>new ns.systems.ChiefShockwave(base,[]).damage);
  assert.equal(hero.castSummon([]),false);
  assert.match(new ns.systems.ShopSystem(hero).offer('charm').description,/衝擊波/);
});
