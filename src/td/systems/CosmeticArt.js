(function(ns){
  'use strict';
  const Art=ns.systems.ArtSystem,art=Art.prototype;
  const oldHero=art.drawHero,oldUnitSprite=art.drawCombatUnitSprite,oldBuilding=art.drawBuilding;
  const heroPaths={arcanist:'assets/td/shop/frost-actions-prototype-v1.png',hunter:'assets/td/shop/sun-actions-v1.png',rogue:'assets/td/shop/moon-actions-v1.png'};
  const basePaths={arcanist:'assets/td/hero-actions-v1.png',hunter:'assets/td/hero-hunter-actions-v2.png',rogue:'assets/td/hero-rogue-actions-v2.png'};
  const idleWalk={hunter:[[40,0,268,311],[350,0,267,313],[660,0,275,313],[970,0,284,313],[40,313,268,306],[340,313,280,309],[654,313,284,308],[971,320,283,303]],rogue:[[25,0,297,324],[334,0,291,323],[660,0,304,324],[973,0,281,325],[25,328,290,290],[332,328,295,292],[651,328,294,293],[973,327,281,295]]};
  const attacks={hunter:{src:'assets/td/shop/sun-attack-v1.png',size:1254,height:455,frames:[[76,105,459,506,320,589],[672,41,515,575,920,593],[55,645,667,550,292,1168],[710,641,458,557,947,1174]]},rogue:{src:'assets/td/shop/moon-attack-v1.png',size:1254,height:420,frames:[[125,58,440,563,290,600],[734,82,480,555,1000,615],[38,737,626,458,235,1175],[703,839,545,379,955,1154]]}};
  const kingdomUnits=new Set(ns.systems.FactionSystem.FACTIONS.hunter.units);
  const kingdomBuildings=new Set(ns.systems.FactionSystem.FACTIONS.hunter.buildings);
  const eclipseUnits={
    hunter:['eclipse-units-a-actions-v2.png',4,0,78],shield:['eclipse-units-a-actions-v2.png',4,1,83],
    musketeer:['eclipse-units-a-actions-v2.png',4,2,80],knight:['eclipse-units-a-actions-v2.png',4,3,88],
    kingdomMage:['eclipse-units-b-actions-v2.png',3,0,84],alchemist:['eclipse-units-b-actions-v2.png',3,1,80],
    royalCommander:['eclipse-units-b-actions-v2.png',3,2,101]
  };
  const eclipseBuildings={arrow:0,iceward:3,cannon:1,barracks:2,ballista:0,supply:3,battleflag:3,armoryForge:2};
  const combatArtPath=name=>'assets/td/combat-art/'+name;
  function combatImage(system,name){
    system.cosmeticImages ||= {};
    const path=combatArtPath(name);
    return system.cosmeticImages[path]||(system.cosmeticImages[path]=system.load(path));
  }
  function prepare(path,base){
    if(ns.systems.SpriteFrameBounds[base]&&!ns.systems.SpriteFrameBounds[path]){
      const frames=JSON.parse(JSON.stringify(ns.systems.SpriteFrameBounds[base]));
      const kind=Object.keys(heroPaths).find(id=>heroPaths[id]===path);
      if(idleWalk[kind])idleWalk[kind].forEach((rect,index)=>{frames.frames[index]=rect.slice();});
      ns.systems.SpriteFrameBounds[path]=frames;
    }
    if(Art.SPRITE_METRICS[base]&&!Art.SPRITE_METRICS[path])Art.SPRITE_METRICS[path]={...Art.SPRITE_METRICS[base]};
  }
  art.drawHero=function(ctx,hero){
    const id=this.cosmeticEquipped?.['hero:'+hero.classType],path=heroPaths[hero.classType];
    if(hero.classType==='chief'&&['bone-emperor','thunder-king'].includes(id)){
      const thunder=id==='thunder-king'?globalThis.FrontierShop.thunderKing:null;
      const paths=thunder?[thunder.look.sprite,thunder.look.attack,thunder.look.cast]:['assets/td/shop/bone-chief-motion-v1.png','assets/td/shop/bone-chief-attack-v1.png','assets/td/shop/bone-chief-cast-v1.png'];
      this.cosmeticImages ||= {};
      const images=paths.map(src=>this.cosmeticImages[src]||(this.cosmeticImages[src]=this.load(src)));
      if(images.every(image=>image.ready)){
        this.chiefCosmeticRenderers ||= {};
        this.chiefCosmeticRenderers[id] ||= globalThis.FrontierSkinLab.createChiefRenderer(...images,thunder?.layouts);
        return this.chiefCosmeticRenderers[id].drawHero(ctx,hero);
      }
      return oldHero.call(this,ctx,hero);
    }
    if(!id||!path)return oldHero.call(this,ctx,hero);
    const image=this.cosmeticImages?.[path]||(this.cosmeticImages={...this.cosmeticImages,[path]:this.load(path)})[path];
    if(!image.ready)return oldHero.call(this,ctx,hero);
    prepare(path,basePaths[hero.classType]);
    const attack=attacks[hero.classType];
    if(attack&&['attack','cast'].includes(hero.state)){
      const sprite=this.cosmeticImages[attack.src]||(this.cosmeticImages[attack.src]=this.load(attack.src));
      if(sprite.ready){
        const [x,y,w,h,ax,ay]=attack.frames[Math.max(0,Math.min(3,hero.frame||0))],ratio=sprite.width/attack.size,scale=78/attack.height;
        ctx.save();ctx.translate(hero.x,hero.y+12);if(Math.cos(hero.facing)<0)ctx.scale(-1,1);
        ctx.drawImage(sprite,x*ratio,y*ratio,w*ratio,h*ratio,(x-ax)*scale,(y-ay)*scale,w*scale,h*scale);ctx.restore();return true;
      }
    }
    const sw=image.width/4,sh=image.height/4,row={idle:0,walk:1,attack:2,cast:hero.classType==='arcanist'?3:2}[hero.state]||0;
    const height=112,width=height*sw/sh,profile=Art.size(image,78,.8),scale=profile.height/height;
    ctx.save();ctx.translate(hero.x,hero.y+12+scale*height*(.8-profile.foot));ctx.scale(scale,scale);
    if(Math.cos(hero.facing)<0)ctx.scale(-1,1);
    Art.drawFrame(ctx,image,hero.frame,row,-width/2,-height*.8,width,height);
    ctx.restore();return true;
  };
  art.drawCombatUnitSprite=function(ctx,unit){
    if(this.cosmeticFaction==='eclipse-court'&&kingdomUnits.has(unit.type)){
      const [name,columns,index,height]=eclipseUnits[unit.type]||[],image=name&&combatImage(this,name);
      if(image?.ready){
        const cellW=image.width/columns,cellH=image.height/4,width=height*cellW/cellH;
        const clock=unit.frameClock||0,walking=unit.state==='walk',attacking=unit.state==='attack'||unit.attackTimer>0;
        const row=attacking?3:walking?1+Math.floor(clock)%2:Math.floor(clock/2)%2;
        ctx.save();ctx.translate(unit.x,unit.y+12);if(Math.cos(unit.facing||0)<0)ctx.scale(-1,1);
        if(unit.level>=2){ctx.shadowColor='#f5cf81';ctx.shadowBlur=Math.min(14,unit.level*2);}
        ctx.drawImage(image,index*cellW,row*cellH,cellW,cellH,-width/2,-height,width,height);
        this.drawGearPieces?.(ctx,unit,false);ctx.restore();
        this.drawRank?.(ctx,unit.x,unit.y,unit.level||1,'#e5c884',false,unit.type);
        return true;
      }
    }
    return oldUnitSprite.call(this,ctx,unit);
  };
  art.drawBuilding=function(ctx,type,x,y,level,branch){
    if(this.cosmeticFaction==='eclipse-court'&&kingdomBuildings.has(type)){
      const image=combatImage(this,'eclipse-buildings-v1.png');
      if(image.ready){
        const index=eclipseBuildings[type],cell=image.width/4,height=112*(1+.025*Math.min(4,(level||1)-1)),width=height*cell/image.height;
        ctx.save();ctx.fillStyle='rgba(0,0,0,.2)';ctx.beginPath();ctx.ellipse(x,y+4,Math.min(39,width*.35),9,0,0,Math.PI*2);ctx.fill();
        ctx.drawImage(image,index*cell,0,cell,image.height,x-width/2,y-height+12,width,height);ctx.restore();
        this.drawRank?.(ctx,x,y,level||1,'#e5c884',true,type);return true;
      }
    }
    return oldBuilding.apply(this,arguments);
  };
  const opening=ns.TDGame.prototype.updateOpeningPresentation;
  ns.TDGame.prototype.updateOpeningPresentation=function(){
    const result=opening.call(this),equipped=this.art.cosmeticEquipped||{},catalog=globalThis.FrontierShop?.catalog||[];
    for(const button of this.ui.professionButtons||[]){
      const item=catalog.find(s=>s.id===equipped['hero:'+button.dataset.profession]);
      const base=ns.systems.HeroRoster.get(button.dataset.profession);
      button.style.setProperty('--selection-art','url("'+(item?.slots.selectionArt.src||base.selectionArt)+'")');
    }
    const heroSkin=catalog.find(s=>s.id===equipped['hero:'+this.selectedProfession]);
    if(heroSkin&&this.ui.heroDetailArt)this.ui.heroDetailArt.style.backgroundImage='url("'+heroSkin.slots.selectionArt.src+'")';
    const factionSkin=catalog.find(s=>s.id===equipped['faction:'+this.selectedFaction]);
    const factionButton=(this.ui.factionButtons||[]).find(b=>b.dataset.faction==='hunter');
    if(factionButton)factionButton.style.setProperty('--selection-art','url("'+(equipped['faction:hunter']==='eclipse-court'?factionSkin?.cover.src:ns.systems.FactionSystem.FACTIONS.hunter.selectionArt)+'")');
    if(factionSkin&&this.ui.factionDetailArt)this.ui.factionDetailArt.style.backgroundImage='url("'+factionSkin.cover.src+'")';
    return result;
  };
  ns.systems.CosmeticArt={heroPaths,eclipseUnits,eclipseBuildings};
})(globalThis.TowerFrontier);
