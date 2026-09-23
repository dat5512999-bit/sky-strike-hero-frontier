(function (root) {
  'use strict';
  const path = name => 'assets/td/shop/thunder-chief-' + name + '.png';
  const look = { heroId:'chief', skinId:'thunder-king', name:'雷霆戰王', theme:'雷霆王庭', accent:'#a8cfff',
    originalDescription:'赤紅部族甲 ／ 白狼毛皮 ／ 戰斧酋長', description:'銀鋼雷紋甲 ／ 深藍披風 ／ 雷光戰斧',
    portrait:path('portrait-v1'), baseSprite:'assets/td/shop/chief-original-actions-v1.png', sprite:path('motion-v3'), spriteRows:2,
    attack:path('attack-v3'), cast:path('cast-v3') };
  // Independent frame rectangles and foot anchors; visual geometry never enters combat.
  const layouts = {
    motion:{src:look.sprite,referenceWidth:1773,bodyHeight:237,frames:[
      [84,143,263,251,220,384],[529,141,268,253,665,384],[974,140,267,254,1110,384],[1417,142,265,252,1554,384],
      [78,581,281,202,205,773],[523,574,284,210,650,774],[967,579,285,198,1092,767],[1415,570,286,214,1536,774]]},
    attack:{src:look.attack,referenceWidth:1254,bodyHeight:295,frames:[
      [152,283,358,311,350,583],[750,165,345,435,946,587],[129,788,471,373,307,1055],[739,827,411,322,891,1073]]},
    cast:{src:look.cast,referenceWidth:1254,bodyHeight:310,frames:[
      [151,202,369,345,342,515],[759,110,362,418,949,518],[145,722,414,411,358,1123],[736,822,398,304,938,1115]]}
  };
  const image = {type:'image',src:look.portrait}, sprite={type:'sprite',src:look.sprite,columns:4,rows:2,frames:4};
  const skin = {schemaVersion:1,id:look.skinId,name:look.name,subtitle:'大酋長・戈爾 · 雷霆王庭',category:'hero',targetId:'chief',rarity:'legendary',cosmeticOnly:true,
    description:'銀鋼雷紋甲、深藍披風與雷光戰斧。已提供立繪及待機、移動、攻擊、施法動作試看；雷光與狼靈是動作圖中的外觀演出，不增加能力。語音、召喚物與獨立技能特效沿用原版。',
    price:{currency:'mock-crystal',amount:1280},availability:{status:'available',reason:''},cover:image,
    slots:{portrait:image,selectionArt:image,battlefieldSprite:sprite,skillVfx:null,summonAppearance:null,animation:{...sprite,type:'animation'},voice:null}};
  const freeze = value => {if(value && typeof value==='object'){Object.values(value).forEach(freeze);Object.freeze(value);}return value;};
  const api=freeze({look,layouts,skin});root.FrontierShop=Object.assign(root.FrontierShop||{},{thunderKing:api});
  if(typeof module!=='undefined')module.exports=api;
})(globalThis);
