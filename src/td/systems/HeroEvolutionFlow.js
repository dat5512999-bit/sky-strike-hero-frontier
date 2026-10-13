(function(ns){
  'use strict';
  // UI only. Currency, trial ownership, rewards and progression live in HeroEvolutionSystem.
  class HeroEvolutionFlow{
    static attach(game){
      const root=globalThis.document?.getElementById('td-evolution-notice');if(!root)return;
      game.canvas?.closest('.td-shell')?.append(root);
      game.evolutionUi={root,title:root.querySelector('strong'),detail:root.querySelector('p'),action:root.querySelector('button')};
      game.evolutionUi.action.onclick=()=>{
        const s=ns.systems.HeroEvolutionSystem.state(game.hero);
        if(s.stones&&!s.trialStage&&!s.autoTrial){game.attemptEvolution();return;}
        game.evolutionNotice=null;root.hidden=true;game.canvas?.focus?.();
      };
      for(const button of game.ui.shopItems||[])if(button.dataset.shopItem==='evolution-stone'){
        const buy=button.onclick;
        button.onclick=event=>{
          const E=ns.systems.HeroEvolutionSystem,state=E.state(game.hero);
          if(state.stones&&!state.trialStage&&!state.autoTrial){game.closeShop();game.attemptEvolution();return;}
          const before=state.stones;buy.call(button,event);
          if(!before&&state.stones){game.closeShop();this.update(game);}
        };
      }
    }
    static update(game){
      const ui=game.evolutionUi;if(!ui)return;
      const E=ns.systems.HeroEvolutionSystem,s=E.state(game.hero),boss=game.monsters.find(m=>m.active&&m.evolutionTrial),notice=game.evolutionNotice;
      if(s.trialStage||s.autoTrial){game.evolutionWaveOwned=true;game.ui.wave.textContent=s.trialStage?'試煉進行中':'等待進化試煉';game.ui.wave.disabled=true;}
      else if(game.evolutionWaveOwned){game.evolutionWaveOwned=false;game.waveHUD?.update();}
      // Legacy saved stones are actionable even though they have no new autoTrial flag.
      const kind=boss?'trial':s.stones?(s.autoTrial?'pending':'retry'):notice?.kind==='success'?'success':null;
      ui.root.hidden=!kind||game.status!=='playing';if(ui.root.hidden)return;
      ui.root.dataset.kind=kind;ui.action.hidden=kind==='trial'||kind==='pending';ui.action.disabled=false;
      let title='',detail='';
      if(kind==='trial'){title=boss.name+' · '+Math.max(0,Math.ceil(boss.health))+' / '+boss.maxHealth;detail='紅圈蓄力時離開範圍，躲避熔火爆發。只有英雄與英雄召喚能傷害 BOSS；打贏才進化為 Lv.0。';}
      if(kind==='pending'){title='進化石已備妥';detail=game.hero.active?'本波清場後自動召喚試煉 BOSS。':'等待英雄復活後召喚 BOSS；整備倒數暫停。';}
      if(kind==='retry'){title='進化石仍在 · 尚未進化';detail='可免費挑戰 BOSS，勝利後才消耗石頭。';ui.action.textContent=game.hero.active?'免費挑戰 BOSS':'英雄復活後可重試';ui.action.disabled=game.paused||!E.canStartTrial(game);}
      if(kind==='success'){
        title=E.rankName(game.hero)+'進化完成 · Lv.0';const result=s.lastResult;
        detail=result?'等級 '+result.before.level+' → 0；攻擊 '+Math.round(result.before.damage)+' → '+Math.round(result.after.damage)+'；生命 '+Math.round(result.before.health)+' → '+Math.round(result.after.health)+'。裝備保留，四技能與外觀已強化。':'基礎能力、四技能與外觀已強化；裝備保留。';
        ui.action.textContent='知道了';
      }
      if(ui.title.textContent!==title)ui.title.textContent=title;
      if(ui.detail.textContent!==detail)ui.detail.textContent=detail;
    }
  }
  ns.systems.HeroEvolutionFlow=HeroEvolutionFlow;
})(globalThis.TowerFrontier);
