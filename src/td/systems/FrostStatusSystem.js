(function(ns){
  'use strict';
  // Frost extends the existing enemy status/slow and Projectile damage pipeline.
  // It owns no damage, movement, rewards, collision or independent update loop.
  class FrostStatusSystem {
    static rules(){return ns.config.frostRules;}
    static state(enemy){return enemy.frostStatus||(enemy.frostStatus={amount:0,window:0,recovery:0,idle:0,extended:0,shattered:false,deep:false});}
    static resistance(enemy){const r=this.rules(),preset=enemy.type==='boss'?r.boss:enemy.elite?r.elite:r.normal;return {frost:Math.min(.95,Math.max(0,enemy.frostResistance??preset.frost)),freeze:Math.min(.95,Math.max(0,enemy.freezeResistance??preset.freeze))};}
    static isWindow(enemy){return Boolean(enemy.frostStatus?.window>0);}
    static apply(enemy,amount){
      if(!enemy.active||!Number.isFinite(amount)||amount<=0)return false;
      const s=this.state(enemy),r=this.rules(),res=this.resistance(enemy);s.idle=0;
      if(s.window>0||s.recovery>0)return false;
      s.amount=Math.min(r.threshold,s.amount+amount*(1-res.frost));
      if(s.amount<r.threshold)return false;
      s.deep=enemy.type==='boss';s.window=(s.deep?r.deepDuration:r.freezeDuration)*(1-res.freeze);
      s.extended=0;s.shattered=false;s.recovery=s.window+r.recovery;
      // Frozen shares rootTime. Bosses keep moving through the existing slow API.
      if(!s.deep)enemy.rootTime=Math.max(enemy.rootTime||0,s.window);
      return true;
    }
    static extend(enemy,seconds){
      const s=enemy.frostStatus;if(!s||s.window<=0||seconds<=0)return;
      const extra=Math.min(seconds*(1-this.resistance(enemy).freeze),Math.max(0,this.rules().extensionCap-s.extended));
      s.extended+=extra;s.window+=extra;s.recovery+=extra;
      if(!s.deep)enemy.rootTime=Math.max(enemy.rootTime||0,s.window);
    }
    static update(enemy,dt){
      const s=enemy.frostStatus;if(!s||!enemy.active)return;const r=this.rules();
      s.idle+=dt;s.recovery=Math.max(0,s.recovery-dt);
      if(s.window>0){s.window=Math.max(0,s.window-dt);if(!s.window){s.amount=0;s.shattered=false;}}
      else if(s.idle>r.decayDelay)s.amount=Math.max(0,s.amount-r.decayPerSecond*dt);
      if(s.window>0&&s.deep)enemy.applySlow(r.deepSlow,dt+.05);
      else if(s.amount>=r.slowStart)enemy.applySlow(1-r.maxSlow*Math.min(1,(s.amount-r.slowStart)/(r.threshold-r.slowStart)),dt+.05);
    }
    static prepare(owner,cfg,options){
      options.frost=(cfg.frost||0)*(1+(owner.frostEfficiency||0));
      options.frozenBonus=cfg.frozenBonus||1;options.shatter=cfg.shatter||0;
      options.shatterRadius=cfg.shatterRadius||this.rules().shatterRadius;options.freezeExtension=cfg.freezeExtension||0;
      if(cfg.frost||cfg.shatter)options.style=cfg.style||'ice';
      if(owner.huntTime>0&&cfg.frostland){options.frost*=1.25;options.frozenBonus+=.25;}
      return options;
    }
    static beforeHit(enemy,source){
      const window=this.isWindow(enemy),s=enemy.frostStatus;
      const shatter=window&&!s.shattered&&!source.secondary&&source.shatter>0;
      if(shatter)s.shattered=true; // Reserve once per enemy/window, before callbacks.
      return {rate:window?(source.frozenBonus||1):1,shatter,bonus:shatter?source.damage*source.shatter:0};
    }
    static afterHit(enemy,source,hit,monsters,onKill,onHit){
      if(!source.secondary&&enemy.active){this.extend(enemy,source.freezeExtension||0);if(this.apply(enemy,source.frost||0))ns.systems.FrostlandVFX?.emit(source.owner?.synergy,'freeze',enemy);}
      if(!hit.shatter)return;
      const game=source.owner?.synergy?.game;
      ns.systems.FrostlandVFX?.emit(game?.synergy,'shatter',enemy,{radius:source.shatterRadius,color:'#c8ffea'});
      game?.synergy?.pulse(enemy.x,enemy.y,'#b4fff1',source.shatterRadius);
      game?.feedback?.explosion(enemy,source.shatterRadius,'#b4fff1','ice');
      // Secondary shards use the same damage callbacks, but cannot recursively shatter.
      for(const other of monsters){if(other===enemy||!other.active||ns.utils.distance(other,enemy)>source.shatterRadius)continue;
        this.deal(other,hit.bonus*.5,{owner:source.owner,secondary:true,color:'#b4fff1',frostChainDepth:source.frostChainDepth||0},onKill,onHit);
      }
    }
    static deal(enemy,damage,source,onKill,onHit){
      if(!enemy.active)return;const before=enemy.effectiveHealth(),killed=enemy.takeDamage(damage,source);
      if(onHit)onHit(enemy,before-enemy.effectiveHealth(),false,source);if(killed&&onKill)onKill(enemy,source);
    }
    static updateBattle(synergy,dt){
      const game=synergy.game,hero=game.hero,items=game.build.items.filter(t=>!t.retired&&t.active!==false);
      for(const item of items){item.huntTime=Math.max(0,(item.huntTime||0)-dt);item.frostEfficiency=0;}
      hero.huntTime=Math.max(0,(hero.huntTime||0)-dt);hero.frostEfficiency=0;
      for(const support of items){const cfg=support.config();if(!cfg.frostAura)continue;
        for(const target of items.concat(hero)){if(ns.utils.distance(support,target)<=cfg.range)target.frostEfficiency=Math.max(target.frostEfficiency||0,cfg.frostAura);}
      }
      const winter=synergy.winter;
      if(winter){
        if(game.waves&&!game.waves.active){synergy.winter=null;return;}
        const elapsed=Math.min(dt,winter.time);winter.time-=elapsed;winter.tick+=elapsed;
        while(winter.tick>=.5){winter.tick-=.5;for(const enemy of game.monsters)if(this.apply(enemy,this.rules().winterFrost*.5))ns.systems.FrostlandVFX?.emit(synergy,'freeze',enemy);}
        for(const item of items)if(item.config().frostland)item.huntTime=Math.max(item.huntTime,winter.time);
        hero.huntTime=Math.max(hero.huntTime,winter.time);
        if(winter.time<=0)synergy.winter=null;
      }
    }
    static death(synergy,enemy,source){
      const winter=synergy.winter,r=this.rules(),depth=source?.frostChainDepth||0;
      if(!winter||enemy.leaked||!this.isWindow(enemy)||depth>=r.chainDepth||synergy.frostChainBudget<=0)return;
      synergy.frostChainBudget--;const game=synergy.game;
      ns.systems.FrostlandVFX?.emit(synergy,'chain',enemy,{radius:r.chainRadius,color:'#a3f5cd'});
      synergy.pulse(enemy.x,enemy.y,'#b4fff1',r.chainRadius);
      for(const other of game.monsters){if(!other.active||ns.utils.distance(other,enemy)>r.chainRadius)continue;
        this.apply(other,r.chainFrost);
        this.deal(other,r.chainDamage*winter.power,{owner:winter.owner,secondary:true,frostChainDepth:depth+1,color:'#b4fff1'},(m,s)=>game.onKill(m,s),(m,d,c,s)=>game.onHit(m,d,c,s));
      }
    }
    static draw(ctx,enemy){
      const s=enemy.frostStatus;if(!s||!enemy.active||(!s.amount&&!s.window))return;
      const x=enemy.x,y=enemy.y-45,r=this.rules();ctx.save();ctx.fillStyle='#122333';ctx.fillRect(x-22,y,44,5);
      ctx.fillStyle=s.window?'#b4fff1':'#80c7dc';ctx.fillRect(x-22,y,44*s.amount/r.threshold,5);
      ctx.font='bold 10px sans-serif';ctx.textAlign='center';ctx.strokeStyle='#08111c';ctx.lineWidth=3;
      const label=s.window?(s.deep?'深寒':'凍結')+(s.shattered?' · 已碎冰':' ◇'):'寒冷 '+Math.round(s.amount)+'%';
      ctx.strokeText(label,x,y-5);ctx.fillText(label,x,y-5);
      if(s.window){ctx.strokeStyle=s.deep?'#c8a875':'#91e7ee';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x-19,enemy.y+5);ctx.lineTo(x-25,enemy.y-22);ctx.lineTo(x,enemy.y-38);ctx.lineTo(x+25,enemy.y-22);ctx.lineTo(x+19,enemy.y+5);ctx.stroke();}ctx.restore();
    }
  }
  ns.systems.FrostStatusSystem=FrostStatusSystem;
})(globalThis.TowerFrontier);
