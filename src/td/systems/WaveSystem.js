(function(ns){
  'use strict';
  class WaveSystem{
    constructor(catalog){this.catalog=catalog||new ns.systems.WaveCatalog();this.reset();}
    reset(){this.wave=0;this.queue=[];this.spawnTimer=0;this.phase='waiting';this.active=false;this.complete=false;this.countdown=0;this.pendingClear=null;}
    composition(wave){const definition=this.catalog.get(wave);return definition?definition.groups:[];}
    preview(){return this.complete?null:this.catalog.get(this.wave+1);}
    beginPreparation(){
      if(this.complete||this.active||this.wave>=this.catalog.total())return false;
      this.phase='preparing';this.countdown=this.wave===0?ns.config.wave.firstPreparation:ns.config.wave.preparation;return true;
    }
    canStart(){return !this.complete&&!this.active&&this.wave<this.catalog.total()&&(this.phase==='waiting'||this.phase==='preparing');}
    start(){
      if(!this.canStart())return false;
      const definition=this.catalog.get(this.wave+1);if(!definition)return false;
      this.wave=definition.wave;this.queue=[];definition.groups.forEach(function(group){for(let i=0;i<group.count;i+=1)this.queue.push(group.type);},this);this.spawnTimer=.15;this.countdown=0;this.phase='spawning';this.active=true;return true;
    }
    update(dt,monsters){
      if(this.phase==='preparing'){this.countdown=Math.max(0,this.countdown-dt);if(this.countdown<=0)this.start();}
      if(this.phase==='spawning'){this.spawnTimer-=dt;if(this.queue.length&&this.spawnTimer<=0){monsters.push(new ns.entities.Monster(this.queue.shift(),this.wave,ns.config.path));this.spawnTimer=this.wave%5===0?.72:Math.max(.26,.5-this.wave*.012);}if(!this.queue.length)this.phase='clearing';}
      if(this.phase==='clearing'&&!monsters.some(function(monster){return monster.active;})){this.active=false;this.phase='reward';this.pendingClear=this.catalog.get(this.wave);}
      if(this.phase==='reward'&&this.pendingClear){const event=this.pendingClear;this.pendingClear=null;return event;}
      return null;
    }
    acknowledgeReward(){if(this.phase!=='reward'||this.pendingClear)return false;if(this.wave>=this.catalog.total()){this.complete=true;this.phase='complete';}else this.beginPreparation();return true;}
    label(){if(this.complete)return'遠征守成';if(this.phase==='preparing')return'第 '+(this.wave+1)+' 波準備 · '+Math.ceil(this.countdown)+' 秒';if(this.phase==='spawning')return'第 '+this.wave+' 波 · 進軍中';if(this.phase==='clearing')return'第 '+this.wave+' 波 · 清除殘敵';if(this.phase==='reward')return'第 '+this.wave+' 波結算';return'等待第一波';}
  }
  ns.systems.WaveSystem=WaveSystem;
})(globalThis.TowerFrontier);
