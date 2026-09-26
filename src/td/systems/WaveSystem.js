(function(ns){
  'use strict';
  class WaveSystem{
    constructor(catalog){this.catalog=catalog||new ns.systems.WaveCatalog();this.reset();}
    reset(){this.wave=0;this.spawnIndex=0;this.queue=[];this.spawnTimer=0;this.phase='waiting';this.active=false;this.complete=false;this.countdown=0;this.pendingClear=null;this.bountyScale=1;this.modifiers={};this.preparationHeld=false;}
    setModifiers(modifiers){this.modifiers=Object.assign({},modifiers||{});return this.modifiers;}
    holdPreparation(held){this.preparationHeld=Boolean(held);return this.preparationHeld;}
    spawnInterval(){const base=this.wave%5===0?Math.max(.78,.98-Math.max(0,this.wave-15)*.01):Math.max(.72,.96-this.wave*.008),pace=this.catalog.get(this.wave)?.spawnPace||1;return Math.max(.66,base*(this.modifiers.spawnRate||1))*pace;}
    definition(wave){const source=this.catalog.get(wave);if(!source)return null;const factor=Math.max(.5,Number(this.modifiers.enemyCount)||1),groups=source.groups.map(group=>({type:group.type,count:group.type==='boss'?group.count:Math.max(1,Math.round(group.count*factor))})),original=source.groups.reduce((sum,group)=>sum+(group.type==='boss'?0:group.count),0);let expanded=groups.reduce((sum,group)=>sum+(group.type==='boss'?0:group.count),0);if(factor>1&&expanded===original&&original){const largest=groups.filter(group=>group.type!=='boss').sort((a,b)=>b.count-a.count)[0];largest.count+=1;expanded+=1;}return Object.assign({},source,{groups:groups,bountyScale:original&&expanded?original/expanded:1});}
    composition(wave){const definition=this.definition(wave);return definition?definition.groups:[];}
    preview(){return this.complete?null:this.definition(this.wave+1);}
    beginPreparation(){
      if(this.complete||this.active||this.wave>=this.catalog.total())return false;
      this.phase='preparing';this.countdown=(this.wave===0?ns.config.wave.firstPreparation:ns.config.wave.preparation)*(this.modifiers.preparation||1);return true;
    }
    canStart(){return !this.complete&&!this.active&&this.wave<this.catalog.total()&&(this.phase==='waiting'||this.phase==='preparing');}
    start(){
      if(!this.canStart())return false;
      const definition=this.definition(this.wave+1);if(!definition)return false;
      this.wave=definition.wave;this.bountyScale=definition.bountyScale;this.queue=[];definition.groups.forEach(function(group){for(let i=0;i<group.count;i+=1)this.queue.push(group.type);},this);this.spawnTimer=.15;this.countdown=0;this.phase='spawning';this.active=true;if(typeof this.onStart==='function')this.onStart(this.wave,definition);return true;
    }
    update(dt,monsters){
      if(this.phase==='preparing'&&!this.preparationHeld){this.countdown=Math.max(0,this.countdown-dt);if(this.countdown<=0)this.start();}
      if(this.phase==='spawning'){this.spawnTimer-=dt;if(this.queue.length&&this.spawnTimer<=0){const type=this.queue.shift(),modifiers=Object.assign({},this.modifiers,{bountyScale:type==='boss'?1:this.bountyScale});const routes=ns.config.routes||[ns.config.path],route=routes[this.spawnIndex++%routes.length],monster=new ns.entities.Monster(type,this.wave,route,modifiers);ns.systems.BossVisualCatalog?.apply(monster);monsters.push(monster);this.spawnTimer=this.spawnInterval();}if(!this.queue.length)this.phase='clearing';}
      if(this.phase==='clearing'&&!monsters.some(function(monster){return monster.active;})){this.active=false;this.phase='reward';this.pendingClear=this.catalog.get(this.wave);}
      if(this.phase==='reward'&&this.pendingClear){const event=this.pendingClear;this.pendingClear=null;return event;}
      return null;
    }
    acknowledgeReward(){if(this.phase!=='reward'||this.pendingClear)return false;if(this.wave>=this.catalog.total()){this.complete=true;this.phase='complete';}else this.beginPreparation();return true;}
    label(){if(this.complete)return'遠征守成';if(this.phase==='preparing')return this.preparationHeld?'第 '+(this.wave+1)+' 波 · 等待指揮':'第 '+(this.wave+1)+' 波準備 · '+Math.ceil(this.countdown)+' 秒';if(this.phase==='spawning')return'第 '+this.wave+' 波 · 進軍中';if(this.phase==='clearing')return'第 '+this.wave+' 波 · 清除殘敵';if(this.phase==='reward')return'第 '+this.wave+' 波結算';return'等待第一波';}
  }
  ns.systems.WaveSystem=WaveSystem;
})(globalThis.TowerFrontier);
