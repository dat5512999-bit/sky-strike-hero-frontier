'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const read=file=>fs.readFileSync(require('node:path').join(__dirname,'..',file),'utf8');
test('equipped hero art uses its actual atlas and keeps the hero unchanged',()=>{
  const drawn=[];
  class ArtSystem{
    load(src){return {assetSrc:src,ready:true,width:1254,height:1254};}
    drawHero(){return 'original';}
    drawCombatUnitSprite(){return true;}
    drawBuilding(){return true;}
    static size(){return {height:78,foot:.8};}
    static drawFrame(_ctx,image){drawn.push(image.assetSrc);}
  }
  ArtSystem.SPRITE_METRICS={};
  class TDGame{updateOpeningPresentation(){return true;}}
  const ns={systems:{ArtSystem,SpriteFrameBounds:{},FactionSystem:{FACTIONS:{hunter:{units:['hunter'],buildings:['arrow'],selectionArt:'base.png'}}},HeroRoster:{get:()=>({selectionArt:'base.png'})}},TDGame};
  const c=vm.createContext({TowerFrontier:ns,FrontierShop:{catalog:[]}});c.globalThis=c;
  vm.runInContext(read('src/td/skin-lab/ChiefPreview.js'),c);
  vm.runInContext(read('src/td/systems/CosmeticArt.js'),c);
  const art=new ArtSystem(),ctx={save(){},restore(){},translate(){},scale(){},beginPath(){},ellipse(){},fill(){},drawImage(image){drawn.push(image.assetSrc);}};
  const hero={classType:'hunter',state:'idle',frame:0,facing:0,x:5,y:7},before=JSON.stringify(hero);
  art.cosmeticEquipped={'hero:hunter':'solar-lion'};
  assert.equal(art.drawHero(ctx,hero),true);assert.equal(drawn.at(-1),'assets/td/shop/sun-actions-v1.png');assert.equal(JSON.stringify(hero),before);
  art.cosmeticEquipped={'hero:chief':'bone-emperor'};
  assert.equal(art.drawHero(ctx,{...hero,classType:'chief'}),true);assert.equal(drawn.at(-1),'assets/td/shop/bone-chief-motion-v1.png');
  art.cosmeticEquipped={};assert.equal(art.drawHero(ctx,hero),'original');
  art.cosmeticFaction='eclipse-court';
  assert.equal(art.drawCombatUnitSprite(ctx,{type:'hunter'}),true);
  assert.equal(drawn.at(-1),'assets/td/combat-art/eclipse-units-a-actions-v2.png');
  assert.equal(art.drawBuilding(ctx,'arrow',0,0,1,null),true);
  assert.equal(drawn.at(-1),'assets/td/combat-art/eclipse-buildings-v1.png');
});
