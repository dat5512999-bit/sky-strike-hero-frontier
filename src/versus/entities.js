(function(ns){
  'use strict';const C=ns.config;
  class Unit{
    constructor(side,type,lane){const cfg=C.unitTypes[type];Object.assign(this,{side,type,lane,x:side==='player'?145:1135,y:C.lanes[lane],hp:cfg.hp,maxHp:cfg.hp,cooldown:0,active:true});}
    cfg(){return C.unitTypes[this.type];}
    update(dt,match){if(!this.active)return;this.cooldown=Math.max(0,this.cooldown-dt);const enemies=match.units.filter(u=>u.active&&u.side!==this.side&&u.lane===this.lane),target=enemies.sort((a,b)=>Math.abs(this.x-a.x)-Math.abs(this.x-b.x))[0],cfg=this.cfg();if(target&&Math.abs(this.x-target.x)<=cfg.range+20){this.attack(target,cfg.damage,dt);return;}const structures=match.structures.filter(s=>s.active&&s.side!==this.side&&s.lane===this.lane&&Math.abs(this.x-s.x)<=cfg.range+30).sort((a,b)=>Math.abs(this.x-a.x)-Math.abs(this.x-b.x));if(structures[0]){this.attack(structures[0],cfg.structureDamage,dt);return;}const base=match.bases[this.side==='player'?'enemy':'player'];if(Math.abs(this.x-base.x)<=cfg.range+35){this.attack(base,cfg.structureDamage,dt);return;}this.x+=(this.side==='player'?1:-1)*cfg.speed*dt;}
    attack(target,damage){if(this.cooldown>0)return;target.hp=Math.max(0,target.hp-damage);this.cooldown=this.cfg().interval;if(target.hp<=0)target.active=false;}
  }
  class Structure{
    constructor(side,type,x,lane){const cfg=C.structures[type];Object.assign(this,{side,type,x,y:C.lanes[lane]+(side==='player'?58:-58),lane,hp:cfg.hp,maxHp:cfg.hp,cooldown:.3,production:cfg.unit?C.unitTypes[cfg.unit].buildTime:0,active:true});}
    update(dt,match){if(!this.active)return;const cfg=C.structures[this.type];if(cfg.unit){this.production-=dt;if(this.production<=0){match.units.push(new Unit(this.side,cfg.unit,this.lane));this.production+=C.unitTypes[cfg.unit].buildTime;}return;}this.cooldown=Math.max(0,this.cooldown-dt);if(this.cooldown>0)return;const target=match.units.filter(u=>u.active&&u.side!==this.side&&Math.hypot(u.x-this.x,u.y-this.y)<=cfg.range).sort((a,b)=>Math.abs(a.x-(this.side==='player'?C.width:0))-Math.abs(b.x-(this.side==='player'?C.width:0)))[0];if(target){target.hp=Math.max(0,target.hp-cfg.damage);if(target.hp<=0)target.active=false;this.cooldown=cfg.interval;}}
  }
  ns.entities.Unit=Unit;ns.entities.Structure=Structure;
})(globalThis.FrontierVersus);
