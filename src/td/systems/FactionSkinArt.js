(function(ns){
  'use strict';
  // A faction skin is allowed to ship only when every listed unit and building
  // has an explicit atlas cell.  Rendering happens after faction-specific art
  // modules, so a purchased skin cannot silently fall back to a mixed roster.
  const Art=ns.systems.ArtSystem,proto=Art.prototype,prior={unit:proto.drawCombatUnit,building:proto.drawBuilding};
  const goblin={id:'goblin-contractors',units:['goblinEngineer','goblinGunner','goblinRiveter','goblinRecycler','goblinMech'],buildings:['goblinGenerator','goblinTurret','goblinMortar','goblinSnare','goblinRecycler','goblinCooler','goblinSiege']};
  const buildingIndex={goblinGenerator:['a',0,93],goblinTurret:['a',1,92],goblinMortar:['a',2,98],goblinSnare:['a',3,94],goblinRecycler:['b',0,96],goblinCooler:['b',1,96],goblinSiege:['b',2,116]};
  function asset(art,path){art.factionSkinImages ||= {};return art.factionSkinImages[path]||(art.factionSkinImages[path]=art.load(path));}
  function equipped(art){return art.cosmeticEquipped?.['faction:goblin']===goblin.id;}
  function unitFrame(unit){return Math.max(0,Math.min(3,unit.state==='attack'||unit.attackTimer>0?2:unit.state==='walk'?1:unit.frame||0));}
  proto.drawCombatUnit=function(ctx,unit){
    if(!equipped(this)||!goblin.units.includes(unit.type))return prior.unit.call(this,ctx,unit);
    const atlas=asset(this,'assets/td/shop/goblin-contractors-units-v1.png');if(!atlas?.ready)return prior.unit.call(this,ctx,unit);
    const col=unitFrame(unit),row=goblin.units.indexOf(unit.type),sw=atlas.width/4,sh=atlas.height/5,height=(Art.UNIT_HEIGHTS[unit.type]||82)*(1+.05*Math.min(4,(unit.level||1)-1)),width=height*sw/sh;
    ctx.save();ctx.translate(unit.x,unit.y+8);if(Math.cos(unit.facing||0)<0)ctx.scale(-1,1);
    ctx.fillStyle='rgba(7,13,15,.25)';ctx.beginPath();ctx.ellipse(0,3,Math.max(15,width*.3),7,0,0,Math.PI*2);ctx.fill();
    ctx.drawImage(atlas,col*sw,row*sh,sw,sh,-width/2,-height,width,height);ctx.restore();this.drawRank?.(ctx,unit.x,unit.y,unit.level||1,'#f0bf4d',false,unit.type);return true;
  };
  proto.drawBuilding=function(ctx,type,x,y,level,branch){
    if(!equipped(this)||!goblin.buildings.includes(type))return prior.building.apply(this,arguments);
    const [set,index,baseHeight]=buildingIndex[type],atlas=asset(this,'assets/td/shop/goblin-contractors-buildings-'+set+'-v1.png');if(!atlas?.ready)return prior.building.apply(this,arguments);
    const columns=set==='a'?4:3,sw=atlas.width/columns,sh=atlas.height,height=baseHeight*(1+.05*Math.min(4,(level||1)-1)),width=height*sw/sh;
    ctx.save();ctx.fillStyle='rgba(7,13,15,.27)';ctx.beginPath();ctx.ellipse(x,y+5,Math.min(38,width*.4),8,0,0,Math.PI*2);ctx.fill();
    ctx.drawImage(atlas,index*sw,0,sw,sh,x-width/2,y-height+8,width,height);ctx.globalCompositeOperation='screen';ctx.globalAlpha=.32;ctx.strokeStyle='#ffb837';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(x,y-42,Math.min(28,width*.28),8,0,0,Math.PI*2);ctx.stroke();ctx.restore();this.drawRank?.(ctx,x,y,level||1,'#f0bf4d',true,type);return true;
  };
  const opening=ns.TDGame.prototype.updateOpeningPresentation;
  ns.TDGame.prototype.updateOpeningPresentation=function(){
    const result=opening.call(this),skin=(globalThis.FrontierShop?.catalog||[]).find(item=>item.id===(equipped(this.art||{})?goblin.id:''));
    if(!skin)return result;
    const faction=ns.systems.FactionSystem.FACTIONS.goblin,button=(this.ui.factionButtons||[]).find(item=>item.dataset.faction==='goblin');
    if(button)button.style.setProperty('--selection-art','url("'+skin.cover.src+'")');
    if(this.selectedFaction==='goblin'&&this.ui.factionDetailArt){this.ui.factionDetailArt.style.backgroundImage='url("'+skin.cover.src+'")';this.ui.factionDetailArt.style.backgroundPosition=faction.selectionFocus;}
    return result;
  };
  ns.systems.FactionSkinArt={goblin};
})(globalThis.TowerFrontier);
