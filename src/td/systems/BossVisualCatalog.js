(function(ns){
  'use strict';
  // Presentation identities only. Combat type, progression and rewards stay unchanged.
  const entries=[
    [5,'frontline','前線戰將'],[10,'bulwark','鐵壁統領'],[15,'banner','邊境主將'],
    [20,'earthbreaker','裂地督軍'],[25,'redtusk','赤牙霸主'],[30,'doom','末日戰將'],
    [35,'saltguard','鹽甲首領'],[40,'siegebreaker','濁潮攻城首領'],[45,'frostcrown','霜潮首領'],
    [50,'demonlord','濁潮小魔王']
  ].map(([wave,id,name])=>Object.freeze({wave,id,name,type:wave===50?'nagaSiltwaterDemonlord':'boss',
    path:wave===30?'assets/td/enemy-boss-actions-v1.png':'assets/td/bosses/'+id+'-actions-v'+(wave===5||wave===45||wave===50?'2':'1')+'.png',
    height:wave===50?116:108,original:wave===30}));
  class BossVisualCatalog{
    static get(type,wave){return this.enabled?entries.find(e=>e.type===type&&e.wave===wave)||null:null;}
    static byId(id){return entries.find(e=>e.id===id)||null;}
    static apply(monster){
      if(monster.evolutionTrial||monster.evolutionTraining)return monster;
      const entry=this.get(monster.type,monster.wave);
      if(entry){monster.bossVisualId=entry.id;monster.name=entry.name;}
      return monster;
    }
    static frame(monster){
      const f=Math.max(0,Math.floor(monster.frame)||0)%4;
      return (monster.state==='death'?12:monster.state==='attack'||monster.state==='cast'?8:monster.state==='walk'?4:0)+f;
    }
  }
  BossVisualCatalog.entries=Object.freeze(entries);
  BossVisualCatalog.enabled=true; // Safe visual rollback: false restores the previous art on next reload.
  ns.systems.BossVisualCatalog=BossVisualCatalog;
  const art=ns.systems.ArtSystem.prototype,baseDraw=art.drawMonster,basePreload=art.preloadWave;
  art.bossImage=function(entry){
    if(!entry)return null;
    if(entry.original)return this.enemyActions[entry.type];
    const key='boss:'+entry.id;
    return this.enemyActions[key]||(this.enemyActions[key]=this.load(entry.path));
  };
  art.preloadWave=function(definition){
    basePreload.call(this,definition);
    if(definition)definition.groups.forEach(group=>{
      const entry=BossVisualCatalog.get(group.type,definition.wave);
      if(entry){const image=this.bossImage(entry);if(image)this.request(image);}
    });
  };
  art.drawMonster=function(ctx,monster){
    const entry=BossVisualCatalog.enabled&&!monster.evolutionTrial&&!monster.evolutionTraining&&BossVisualCatalog.byId(monster.bossVisualId);
    if(!entry||entry.original)return baseDraw.call(this,ctx,monster);
    const image=this.bossImage(entry),atlas=ns.systems.BossSpriteBounds?.[entry.id];
    // Missing/loading art never makes a boss invisible or stops the battle.
    if(!image?.ready||!atlas)return baseDraw.call(this,ctx,monster);
    const frame=atlas.frames[BossVisualCatalog.frame(monster)],scale=entry.height/atlas.visible;
    ctx.save();ctx.translate(monster.x,monster.y);
    ctx.fillStyle='rgba(0,0,0,.25)';ctx.beginPath();ctx.ellipse(0,2,monster.radius,monster.radius*.38,0,0,Math.PI*2);ctx.fill();
    if(Math.cos(monster.facing||0)<0)ctx.scale(-1,1);
    ctx.drawImage(image,frame[0],frame[1],frame[2],frame[3],(frame[0]-frame[4])*scale,(frame[1]-frame[5])*scale,frame[2]*scale,frame[3]*scale);
    ctx.restore();return true;
  };
})(globalThis.TowerFrontier);
