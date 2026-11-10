(function (root) {
  'use strict';
  const path = name => 'assets/td/shop/thunder-chief-' + name + '.png';
  const look = { heroId:'chief', skinId:'thunder-king', name:'雷霆戰王', theme:'雷霆王庭', accent:'#a8cfff',
    originalDescription:'灰黑野髮 ／ 拼補破甲 ／ 深青披風', description:'銀鋼雷紋甲 ／ 深藍披風 ／ 雷光戰斧',
    portrait:path('portrait-v2'), baseSprite:'assets/td/wild-chief-actions-v2.png', sprite:path('actions-v4'), spriteRows:4,
    attack:path('actions-v4'), cast:path('actions-v4') };
  // Independent frame rectangles and foot anchors; visual geometry never enters combat.
  const layouts = (root.FrontierChiefSkinAtlas || require('./ChiefSkinAtlas.js'))['thunder-king'].layouts;
  const image = {type:'image',src:look.portrait}, sprite={type:'sprite',src:look.sprite,columns:4,rows:4,frames:4};
  const skin = {schemaVersion:1,id:look.skinId,name:look.name,subtitle:'大酋長・戈爾 · 雷霆王庭',category:'hero',targetId:'chief',rarity:'legendary',cosmeticOnly:true,
    description:'野人長髮、破損銀鋼甲、深藍披風與雷光重斧。待機、移動、攻擊及戰吼皆為同一角色；雷光只改變外觀，不增加能力。語音、召喚物與獨立技能特效沿用原版。',
    price:{currency:'mock-crystal',amount:1280},availability:{status:'available',reason:''},cover:image,
    slots:{portrait:image,selectionArt:image,battlefieldSprite:sprite,skillVfx:null,summonAppearance:null,animation:{...sprite,type:'animation'},voice:null}};
  const freeze = value => {if(value && typeof value==='object'){Object.values(value).forEach(freeze);Object.freeze(value);}return value;};
  const api=freeze({look,layouts,skin});root.FrontierShop=Object.assign(root.FrontierShop||{},{thunderKing:api});
  if(typeof module!=='undefined')module.exports=api;
})(globalThis);
