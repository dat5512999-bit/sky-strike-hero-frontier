(function(ns){
  'use strict';
  function availableStorage(){try{return globalThis.localStorage;}catch(error){return null;}}
  function clone(value){return JSON.parse(JSON.stringify(value));}
  class ChapterCheckpointSystem{
    constructor(storage){this.storage=storage===undefined?availableStorage():storage;}
    read(){if(!this.storage)return null;try{const data=JSON.parse(this.storage.getItem(ChapterCheckpointSystem.STORAGE_KEY));return this.valid(data)?data:null;}catch(error){return null;}}
    valid(data){return Boolean(data&&data.schema===ChapterCheckpointSystem.SCHEMA&&ChapterCheckpointSystem.WAVES.includes(data.wave)&&data.run&&data.hero&&data.economy&&Array.isArray(data.buildings)&&data.report);}
    clear(){if(!this.storage)return false;try{this.storage.removeItem(ChapterCheckpointSystem.STORAGE_KEY);return true;}catch(error){return false;}}
    describe(data){data=data||this.read();if(!data)return null;return(data.run.mapName||data.run.map||'未知地圖')+' · '+(data.run.difficultyName||data.run.difficulty)+' · 第 '+data.wave+' 波後';}
    capture(game){
      if(!game||!ChapterCheckpointSystem.WAVES.includes(game.waves.wave)||game.waves.active||game.report.current)return null;
      const heroKeys=['classType','x','y','spawnX','spawnY','targetX','targetY','health','maxHealth','level','xp','gear','equipment','skillCooldowns','cooldown','novaCooldown','active','respawnTimer','invulnerable'];
      const unitKeys=['kind','type','x','y','guardX','guardY','targetStrategy','level','kills','strikes','gear','totalSpent','mercenary','unitId','health','maxHealth','active','cooldown','recycleTimer','engineerBoost'];
      const towerKeys=['kind','type','x','y','level','kills','shotsFired','branch','totalSpent','cooldown','retired','recycleTimer','engineerBoost'];
      const pick=(source,keys)=>keys.reduce((result,key)=>{if(source[key]!==undefined)result[key]=clone(source[key]);return result;},{});
      const data={schema:ChapterCheckpointSystem.SCHEMA,savedAt:new Date().toISOString(),wave:game.waves.wave,run:clone(game.report.run),baseHealth:game.baseHealth,maxBaseHealth:game.maxBaseHealth,economy:pick(game.economy,['gold','lumber','merit','totalEarned','totalSpent','rewardRate']),hero:pick(game.hero,heroKeys),buildings:game.build.items.map(item=>pick(item,item.kind==='unit'?unitKeys:towerKeys)),nextUnitId:game.build.nextUnitId,faction:{selected:game.factions.selected,units:Array.from(game.factions.unlockedUnits),buildings:Array.from(game.factions.unlockedBuildings)},loot:{claimed:Array.from(game.loot.claimed),history:clone(game.loot.history)},armory:{owned:clone(game.armory.owned)},report:{run:clone(game.report.run),waves:clone(game.report.waves),telemetry:clone(game.report.telemetry)}};
      if(game.goblinNetwork)data.goblinNetwork=game.goblinNetwork.snapshot();
      if(!this.storage)return data;try{this.storage.setItem(ChapterCheckpointSystem.STORAGE_KEY,JSON.stringify(data));return data;}catch(error){return null;}
    }
    restore(game,data){
      if(!game||!this.valid(data))return false;
      Object.assign(game.economy,clone(data.economy));game.baseHealth=data.baseHealth;game.maxBaseHealth=data.maxBaseHealth;
      Object.assign(game.hero,clone(data.hero),{displayHealth:data.hero.health,selected:true,pendingTarget:null,fields:[]});
      game.build.items=data.buildings.map(saved=>{const item=saved.kind==='unit'?new ns.entities.CombatUnit(saved.type,saved.x,saved.y):new ns.entities.Building(saved.type,saved.x,saved.y);Object.assign(item,clone(saved));if(item.kind==='unit'){item.displayHealth=item.health;item.lockedTarget=null;}return item;});
      game.build.nextUnitId=Math.max(data.nextUnitId||1,...game.build.items.filter(item=>item.kind==='unit').map(item=>(item.unitId||0)+1));
      game.goblinNetwork ||= new ns.systems.GoblinNetworkSystem();game.goblinNetwork.restore(data.goblinNetwork);
      game.factions.unlockedUnits=new Set(data.faction.units||[]);game.factions.unlockedBuildings=new Set(data.faction.buildings||[]);
      game.loot.claimed=new Set(data.loot.claimed||[]);game.loot.pending=[];game.loot.history=clone(data.loot.history||[]);
      game.armory.owned=clone(data.armory.owned||[]);game.armory.assignments=new Map();[game.hero].concat(game.build.combatUnits()).forEach(target=>Object.values(target.gear||{}).forEach(id=>game.armory.assignments.set(id,target)));
      game.report.run=clone(data.report.run);game.report.waves=clone(data.report.waves);game.report.current=null;game.report.finalResult=null;game.report.telemetry=clone(data.report.telemetry);
      game.waves.reset();game.waves.setModifiers(game.difficulty.modifiers());game.waves.wave=data.wave;game.waves.beginPreparation();
      if(game.synergy){game.synergy.winter=null;game.synergy.frostVisuals=[];}game.hero.huntTime=0;game.hero.frostEfficiency=0;
      game.monsters=[];game.corpses=[];game.projectiles=[];game.summons=[];game.shockwaves=[];game.fieldLoot=[];game.build.applyTowerSupport();return true;
    }
  }
  ChapterCheckpointSystem.STORAGE_KEY='heroFrontierChapterCheckpointV1';ChapterCheckpointSystem.SCHEMA=1;ChapterCheckpointSystem.WAVES=[10,20];ns.systems.ChapterCheckpointSystem=ChapterCheckpointSystem;
})(globalThis.TowerFrontier);
