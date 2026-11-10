(function(ns){
  'use strict';
  // Presentation preferences are profile data, never equipment or progression.
  const KEY='hero-appearance';
  class HeroAppearanceSystem{
    static bind(game,storage){
      game.appearanceStorage=storage;let saved={};
      try{saved=JSON.parse(storage?.getItem(KEY)||'{}');}catch{ /* Old/invalid preferences use the purchased skin. */ }
      game.art.heroAppearance={};
      for(const type of Object.keys(ns.systems.HeroRoster.CLASSES))if(saved?.[type]==='evolution')game.art.heroAppearance[type]='evolution';
    }
    static mode(game){return game.art.heroAppearance?.[game.hero.classType]==='evolution'?'evolution':'skin';}
    static set(game,mode){
      if(!['skin','evolution'].includes(mode))return false;
      const next={...game.art.heroAppearance,[game.hero.classType]:mode};
      try{game.appearanceStorage?.setItem(KEY,JSON.stringify(next));}
      catch{game.flash?.('外觀設定未儲存，請檢查儲存空間；已購造型與進度未變更。','#ffb578');return false;}
      game.art.heroAppearance=next;game.updateUi();return true;
    }
    static attach(game){
      game.appearanceButtons=['td-hero-appearance','td-hero-appearance-settings'].map(id=>globalThis.document?.getElementById(id)).filter(Boolean);
      for(const button of game.appearanceButtons)button.onclick=()=>this.set(game,this.mode(game)==='skin'?'evolution':'skin');
    }
    static update(game){
      const rank=ns.systems.HeroEvolutionSystem.rank(game.hero),skin=game.art.cosmeticEquipped?.['hero:'+game.hero.classType],evolved=this.mode(game)==='evolution';
      for(const button of game.appearanceButtons||[]){
      button.hidden=!rank||!skin;
      button.textContent=evolved?'目前顯示進化外觀 · 切回商城造型':'目前顯示商城造型 · 改看進化外觀';
      button.setAttribute('aria-pressed',String(evolved));
      button.title='只切換外觀；已購造型、裝備與能力保留。設定依玩家、英雄儲存。';
      }
    }
  }
  ns.systems.HeroAppearanceSystem=HeroAppearanceSystem;
})(globalThis.TowerFrontier);
