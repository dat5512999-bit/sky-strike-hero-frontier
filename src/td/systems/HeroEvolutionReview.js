(function(ns){
  'use strict';
  class HeroEvolutionReview{
    static attach(game){
      const root=game.evolutionUi?.root;if(!root)return;
      const panel=document.createElement('div');panel.className='evolution-review';panel.hidden=true;
      panel.innerHTML='<div class="evolution-portraits"><figure><canvas width="360" height="300" aria-label="進化前原生外觀"></canvas><figcaption></figcaption></figure><figure><canvas width="360" height="300" aria-label="進化後原生外觀"></canvas><figcaption></figcaption></figure></div><p class="evolution-skill-change"></p><p class="evolution-skin-note"></p><button type="button" class="evolution-appearance-toggle" hidden></button><small>原生外觀放大比較；戰場暫停，按「繼續戰鬥」恢復。</small>';
      root.insertBefore(panel,game.evolutionUi.action);
      game.evolutionReview={panel,canvases:[...panel.querySelectorAll('canvas')],captions:[...panel.querySelectorAll('figcaption')],skill:panel.querySelector('.evolution-skill-change'),note:panel.querySelector('.evolution-skin-note'),toggle:panel.querySelector('button')};
      const progress=game.art.onProgress;
      game.art.onProgress=()=>{game.evolutionReview.key=null;progress?.call(game.art);};
      game.evolutionReview.toggle.onclick=()=>{const A=ns.systems.HeroAppearanceSystem;A.set(game,A.mode(game)==='skin'?'evolution':'skin');};
    }
    static portrait(game,canvas,rank){
      // A separate hero and an art view keep the live hero/ownership untouched.
      const hero=new ns.entities.Hero(0,0);hero.chooseClass(game.hero.classType);hero.evolution.rank=rank;
      hero.equipment={...game.hero.equipment};hero.gear={...game.hero.gear};hero.state='idle';hero.frame=0;
      const art=Object.create(game.art);art.cosmeticEquipped={};art.heroAppearance={};
      // Initialize optional image caches on the real art owner, so onProgress
      // redraws reuse the same requests rather than allocating new images.
      let image=null;if(rank)image=hero.classType==='bull'?game.art.preloadBullEvolution(rank):game.art.preloadHeroEvolution(hero.classType,rank);
      const ctx=canvas.getContext('2d');ctx.clearRect(0,0,canvas.width,canvas.height);ctx.save();
      let failed=false;
      try{ctx.translate(180,246);ctx.scale(2,2);art.drawHero(ctx,hero);}
      catch{failed=true; /* A preview error must not trap the player in the result. */ }
      finally{ctx.restore();}
      if(failed)return '（預覽暫時無法顯示）';
      return image?.failed?'（圖片未載入，暫用原貌）':image&&!image.ready?'（圖片載入中）':'';
    }
    static update(game,kind){
      const ui=game.evolutionReview;if(!ui)return;ui.panel.hidden=kind!=='success';if(ui.panel.hidden){ui.key=null;return;}
      const E=ns.systems.HeroEvolutionSystem,A=ns.systems.HeroAppearanceSystem,h=game.hero,rank=E.rank(h),form=E.form(h),skin=game.art.cosmeticEquipped?.['hero:'+h.classType],mode=A.mode(game);
      ui.skill.textContent=form?'新能力 · '+form.passive:'';
      ui.note.textContent=skin?(mode==='skin'?'你已進化；目前戰場仍顯示商城造型，可在下方切換。':'戰場顯示進化外觀；商城造型仍保留，可隨時切回。'):'戰場將顯示進化外觀；裝備與能力不因外觀切換而改變。';
      ui.toggle.hidden=!skin;ui.toggle.textContent=mode==='skin'?'戰場改用進化外觀':'戰場改用商城造型';ui.toggle.setAttribute('aria-pressed',String(mode==='evolution'));
      const images=[rank-1,rank].filter(r=>r>0).map(r=>h.classType==='bull'?game.art.preloadBullEvolution(r):game.art.preloadHeroEvolution(h.classType,r));
      const key=h.classType+':'+rank+':'+JSON.stringify(h.equipment)+':'+JSON.stringify(h.gear)+':'+images.map(i=>i?.ready?'ready':i?.failed?'failed':'loading').join(',');
      if(ui.key===key)return;ui.key=key;
      [Math.max(0,rank-1),rank].forEach((r,i)=>{const status=this.portrait(game,ui.canvases[i],r);ui.captions[i].textContent=(i?'進化後 · ':'進化前 · ')+['初始','覺醒','超凡'][r]+status;});
    }
  }
  ns.systems.HeroEvolutionReview=HeroEvolutionReview;
})(globalThis.TowerFrontier);
