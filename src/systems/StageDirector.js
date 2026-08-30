(function (ns) {
  'use strict';
  const AFFIXES=[
    {id:'frenzy',icon:'ᚱ',name:'狂戰號角',short:'狂戰',color:'#ff765c',speed:1.2,score:1.12},
    {id:'fortified',icon:'ᛉ',name:'鐵壁符文',short:'鐵壁',color:'#b99cff',health:1.55,score:1.2},
    {id:'rapid',icon:'ᛇ',name:'秘法疾射',short:'疾射',color:'#55dfff',fireRate:1.4,score:1.15},
    {id:'twin',icon:'ᛞ',name:'雙生軍陣',short:'雙生',color:'#ffd35c',twinChance:.48,score:1.18}
  ];
  class StageDirector {
    constructor() { this.totalWaves=100; this.reset(); }
    reset() { this.wave=1; this.phase='combat'; this.timer=this.waveDuration(); this.bossSpawned=false; this.bossDefeated=false; this.completed=false;this.failed=false;this.maxIntegrity=ns.difficulty.current().defenseIntegrity||5;this.integrity=this.maxIntegrity; }
    chapter() { return Math.ceil(this.wave/10); }
    sector() { return Math.ceil(this.wave/5); }
    isBossWave(wave) { return (wave||this.wave)%5===0; }
    isMajorBoss() { return this.wave%10===0; }
    waveDuration() { return Math.min(18,12+Math.ceil(this.wave/10)*.5); }
    shouldSpawn() { return !this.completed&&!this.failed&&!this.isBossWave()&&this.phase==='combat'&&this.timer>0; }
    canRunChallenge() { return !this.completed&&!this.failed&&!this.isBossWave()&&this.phase==='combat'; }
    affix(){
      if(this.isBossWave())return{id:'boss',icon:'♜',name:'霸主威壓',short:'威壓',color:'#ff5f88',speed:1.08,fireRate:1.18,score:1.2};
      if(this.wave===1)return{id:'none',icon:'◇',name:'整備航道',short:'整備',color:ns.skins.current().accent};
      return AFFIXES[(this.wave-2-Math.floor((this.wave-1)/5))%AFFIXES.length];
    }
    modifiers(){const affix=this.affix();return{speed:affix.speed||1,health:affix.health||1,fireRate:affix.fireRate||1,twinChance:affix.twinChance||0,score:affix.score||1};}
    update(dt, context) {
      if(this.completed||this.failed)return;
      if(this.isBossWave()){
        if(!this.bossSpawned){
          context.enemies.push(new ns.entities.Boss(this.wave,ns.difficulty.current()));
          this.bossSpawned=true;this.phase='boss';
          context.effects.announce((this.isMajorBoss()?'章節霸主':'戰區 Boss')+' · 第 '+this.wave+' 波','#ff5f88');
        } else if(this.bossDefeated&&!context.enemies.some(function(enemy){return enemy.active&&enemy.type==='boss';})) this.advance(context);
        return;
      }
      if(this.phase==='combat'){
        this.timer=Math.max(0,this.timer-dt);
        if(this.timer<=0)this.phase='clear';
      }
      if(this.phase==='clear'&&!context.enemies.some(function(enemy){return enemy.active;}))this.advance(context);
    }
    onEnemyDestroyed(enemy){if(enemy&&enemy.type==='boss')this.bossDefeated=true;}
    onEnemyEscaped(enemy,context){
      if(this.failed||!enemy||enemy.type==='boss')return 0;
      const damage=enemy.type==='elite'?2:1;this.integrity=Math.max(0,this.integrity-damage);
      if(context&&context.effects)context.effects.announce('⚠ 防線受損 '+this.integrity+' / '+this.maxIntegrity,'#ff5f66');
      if(this.integrity<=0){this.failed=true;this.phase='failed';}
      return damage;
    }
    rewardFor(clearedWave){if(clearedWave===1)return'mirror';if(clearedWave===3)return'familiar';if(clearedWave>5&&clearedWave%5===0)return clearedWave%10===0?'familiar':'mirror';return'';}
    advance(context){
      const cleared=this.wave; const reward=this.rewardFor(cleared);
      if(reward){const item=new ns.entities.PowerUp(context.player.x,Math.max(90,context.player.y-170),reward);item.speed=58;context.powerUps.push(item);}
      context.enemyBullets.forEach(function(bullet){bullet.active=false;});
      if(cleared>=this.totalWaves){this.completed=true;this.phase='complete';context.effects.announce('遠征完成 · 100 波制霸','#ffe178');return;}
      this.wave+=1;this.phase='combat';this.timer=this.waveDuration();this.bossSpawned=false;this.bossDefeated=false;
      const affix=this.affix();context.effects.announce('WAVE '+this.wave+' · '+affix.icon+' '+affix.name,affix.color);
    }
    status(){
      if(this.completed)return'遠征完成 100/100';
      if(this.isBossWave())return'WAVE '+this.wave+'/100 · ♜'+(this.isMajorBoss()?'章節霸主':'威壓 BOSS');
      const suffix=this.phase==='clear'?' · 清除殘敵':' · '+Math.ceil(this.timer)+'s';
      const affix=this.affix();return'WAVE '+this.wave+'/100 · '+affix.icon+affix.short+suffix;
    }
    defenseStatus(){return'防線 '+this.integrity+' / '+this.maxIntegrity;}
  }
  ns.systems.StageDirector=StageDirector;
})(globalThis.SkyStrike);
