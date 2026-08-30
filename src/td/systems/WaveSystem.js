(function(ns){
  'use strict';
  class WaveSystem{
    constructor(){this.reset();}
    reset(){this.wave=0;this.queue=[];this.spawnTimer=0;this.active=false;this.complete=false;this.countdown=0;}
    composition(wave){
      if(wave%5===0)return[{type:'boss',count:1},{type:'brute',count:2+Math.floor(wave/5)}];
      const primary=['grunt','runner','shaman','brute'][(wave-1)%4];const result=[{type:primary,count:6+wave}];if(wave>=3)result.push({type:wave%2?'runner':'grunt',count:Math.ceil(wave/3)});return result;
    }
    start(){if(this.active||this.complete||this.wave>=ns.config.totalWaves)return false;this.wave+=1;this.queue=[];this.composition(this.wave).forEach(function(group){for(let i=0;i<group.count;i+=1)this.queue.push(group.type);},this);this.spawnTimer=.15;this.active=true;return true;}
    update(dt,monsters){if(!this.active)return;this.spawnTimer-=dt;if(this.queue.length&&this.spawnTimer<=0){monsters.push(new ns.entities.Monster(this.queue.shift(),this.wave,ns.config.path));this.spawnTimer=this.wave%5===0?1.05:.58;}if(!this.queue.length&&!monsters.some(function(m){return m.active;})){this.active=false;if(this.wave>=ns.config.totalWaves)this.complete=true;}}
    label(){if(this.complete)return'遠征守成';if(this.active)return'第 '+this.wave+' 波 · '+(this.queue.length?'進軍中':'清除殘敵');return this.wave?'第 '+this.wave+' 波完成':'等待第一波';}
  }
  ns.systems.WaveSystem=WaveSystem;
})(globalThis.TowerFrontier);
