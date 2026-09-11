(function(ns){
  'use strict';
  const RARITIES={base:{name:'制式',color:'#aeb7b5'},common:{name:'精良',color:'#d9e3e8'},epic:{name:'史詩',color:'#c96cff'},legendary:{name:'傳說',color:'#ffb347'}};
  const WEAPONS={
    hunter:[
      {id:'ranger-bow',name:'王國巡林弓',rarity:'base',color:'#e6c56c',description:'英雄原本的制式長弓。'},
      {id:'steel-longbow',name:'精鋼長弓',rarity:'common',color:'#dce8ef',column:0,row:0,description:'普攻與傷害技能提高 20%，箭矢留下銀白軌跡。'},
      {id:'frostwood-longbow',name:'霜木水晶弓',rarity:'epic',color:'#62dfff',column:1,row:0,description:'累計提高 40% 傷害，攻擊轉為寒霜藍色回饋。'},
      {id:'dragonfire-longbow',name:'炎龍天弓',rarity:'legendary',color:'#ff6c32',column:2,row:0,description:'累計提高 60% 傷害，獲得龍焰光環與強烈命中色。'}
    ],
    arcanist:[
      {id:'silverleaf-staff',name:'銀葉法杖',rarity:'base',color:'#70e7ff',description:'銀葉學院的制式法杖。'},
      {id:'crystal-staff',name:'澄藍晶杖',rarity:'common',color:'#78cfff',column:0,row:1,description:'普攻與傷害技能提高 20%，法球更加明亮。'},
      {id:'storm-staff',name:'雷霆風暴杖',rarity:'epic',color:'#55bfff',column:1,row:1,description:'累計提高 40% 傷害，施法時環繞雷光。'},
      {id:'holy-star-staff',name:'聖星權杖',rarity:'legendary',color:'#ffd869',column:2,row:1,description:'累計提高 60% 傷害，獲得聖星光環與金色法術回饋。'}
    ],
    rogue:[
      {id:'guild-daggers',name:'行會匕首',rarity:'base',color:'#c884df',description:'暗影行會的制式雙刃。'},
      {id:'steel-daggers',name:'精鋼雙匕',rarity:'common',color:'#e2e8ee',column:0,row:2,description:'普攻與傷害技能提高 20%，雙刃泛起冷鋼光。'},
      {id:'shadow-crescents',name:'影魔月刃',rarity:'epic',color:'#ca62ff',column:1,row:2,description:'累計提高 40% 傷害，攻擊留下紫色雙重殘影。'},
      {id:'demonfang-blades',name:'魔王獠牙',rarity:'legendary',color:'#ff3e4f',column:2,row:2,description:'累計提高 60% 傷害，獲得魔焰光環與赤紅斬擊。'}
    ]
  };
  class EquipmentSystem{
    static weapon(hero,level){const list=WEAPONS[hero&&hero.classType]||WEAPONS.arcanist,index=Math.max(0,Math.min(3,level===undefined?(hero.equipment.spear||0):level));return Object.assign({},list[index],{level:index,rarityInfo:RARITIES[list[index].rarity]});}
    static nextWeapon(hero){const level=hero.equipment.spear||0;return level>=3?null:this.weapon(hero,level+1);}
    static effectColor(hero,fallback){const weapon=this.weapon(hero);return weapon.level?weapon.color:fallback;}
    static drawSignature(ctx,hero){const weapon=this.weapon(hero);if(!weapon.level||!hero.active)return;const pulse=.65+Math.sin(hero.animationTime*5)*.15,attack=hero.state==='attack';ctx.save();ctx.translate(hero.x,hero.y-17);ctx.rotate(hero.facing);ctx.globalCompositeOperation='screen';ctx.strokeStyle=weapon.color;ctx.fillStyle=weapon.color;ctx.shadowColor=weapon.color;ctx.shadowBlur=weapon.level>=3?15:8;ctx.globalAlpha=.35+.13*weapon.level;ctx.lineWidth=1.5+weapon.level*.65;
      if(hero.classType==='rogue'){if(!attack){ctx.restore();return;}ctx.globalAlpha=.1+.08*weapon.level;ctx.lineWidth=1+weapon.level*.45;const reach=12+weapon.level*2;for(let side=-1;side<=1;side+=2){ctx.beginPath();ctx.arc(13,side*4,reach,-.48,.48);ctx.stroke();}}
      else if(hero.classType==='hunter'){ctx.beginPath();ctx.arc(11,0,17+weapon.level*3,-1.05,1.05);ctx.stroke();ctx.beginPath();ctx.moveTo(19,-14);ctx.lineTo(19,14);ctx.stroke();}
      else{ctx.beginPath();ctx.arc(21,-7,5+weapon.level*2,0,Math.PI*2);ctx.stroke();ctx.globalAlpha*=pulse;ctx.beginPath();ctx.arc(21,-7,11+weapon.level*2,0,Math.PI*2);ctx.stroke();}
      if(weapon.level>=3){for(let i=0;i<3;i++){const angle=hero.animationTime*2+i*Math.PI*2/3;ctx.globalAlpha=.65;ctx.beginPath();ctx.arc(Math.cos(angle)*31,Math.sin(angle)*13,2.2,0,Math.PI*2);ctx.fill();}}
      ctx.restore();
    }
  }
  EquipmentSystem.WEAPONS=WEAPONS;EquipmentSystem.RARITIES=RARITIES;ns.systems.EquipmentSystem=EquipmentSystem;
})(globalThis.TowerFrontier);
