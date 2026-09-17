'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {load,game,enemy}=require('./helpers/td-runtime.cjs');
test('shield fourth strike controls a group while earlier hits stay single-target',()=>{
 const {ns}=load(),shield=new ns.entities.CombatUnit('shield',100,100),targets=[enemy(ns,140),enemy(ns,160),enemy(ns,230)];
 for(let strike=1;strike<=4;strike++){shield.cooldown=0;const shots=[];shield.update(.01,targets,shots);assert.equal(shots.length,1);if(strike<4){assert.equal(shots[0].splash,0);assert.equal(shots[0].slow,undefined);}else{assert.equal(shots[0].splash,44);shots[0].hit(targets);assert.ok(targets[0].slowFactor<1);assert.ok(targets[1].slowFactor<1);assert.equal(targets[2].slowFactor,1);}}
});
test('regular soulsteel golem specializes against heavy armor',()=>{
 const {ns}=load(),golem=new ns.entities.CombatUnit('golem',100,100),heavy=enemy(ns,140,100,'brute'),light=enemy(ns,140,100,'grunt');
 for(const m of [heavy,light]){m.armor=0;m.health=m.maxHealth=1000;}const cfg=golem.config(),make=target=>{golem.cooldown=0;const shots=[];golem.update(.01,[target],shots);const before=target.health;shots[0].hit([target]);return before-target.health;};
 const heavyDamage=make(heavy),lightDamage=make(light);assert.ok(heavyDamage>lightDamage);assert.equal(cfg.bonusVsHeavy,1.3);assert.ok(cfg.range>=94&&cfg.splash>=36);
});
test('banshee curses for allies but not itself; bone rider executes low-health enemies',()=>{
 const {ns}=load(),g=game(ns),banshee=new ns.entities.CombatUnit('banshee',100,100),rider=new ns.entities.CombatUnit('boneRider',100,100),m=enemy(ns);g.monsters=[m];
 g.synergy.hit(m,5,{owner:banshee,vulnerability:.12});let before=m.health;m.takeDamage(100,{owner:banshee});assert.equal(before-m.health,98);before=m.health;m.takeDamage(100,{owner:rider});assert.equal(before-m.health,110);
 const high=enemy(ns),low=enemy(ns);high.armor=low.armor=0;high.armorType=low.armorType='light';low.health=low.maxHealth*.3;const damage=target=>{rider.cooldown=0;const shots=[];rider.update(.01,[target],shots);const start=target.health;shots[0].hit([target]);return start-target.health;};assert.ok(damage(low)>damage(high)*1.4);
});
test('support building upgrades improve effect as well as range without exceeding discount cap',()=>{
 const {ns}=load(),cases=[['battleflag','damageAura',.12,.2],['armoryForge','forgeAura',.15,.23],['grove','natureAura',.15,.23],['graveyard','summonAura',.25,.37],['supply','discount',.15,.2]];
 for(const [type,key,level1,level5] of cases){const b=new ns.entities.Building(type,100,100);assert.equal(b.config()[key],level1,type);b.level=5;assert.ok(Math.abs(b.config()[key]-level5)<1e-9,type);assert.ok(b.config().range>ns.config.buildings[type].range);}
});
test('moonshadow midgame has affordable area damage before ancient dragon',()=>{const {ns}=load(),a=ns.config.units.arcanist,d=ns.config.units.dragon;assert.ok(a.cost<=100);assert.ok(a.damage>=15&&a.splash>=48&&a.range>=140);assert.ok(d.cost>=a.cost*8);});
