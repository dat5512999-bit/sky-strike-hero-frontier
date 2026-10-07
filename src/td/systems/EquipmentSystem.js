(function(ns){
  'use strict';
  const RARITIES={base:{name:'制式',color:'#aeb7b5'},common:{name:'精良',color:'#d9e3e8'},epic:{name:'史詩',color:'#c96cff'},legendary:{name:'傳說',color:'#ffb347'}};
  const WEAPONS={
    frostland:[
      {"id":"frostland-spear-0","name":"骨柄獵矛","rarity":"base","color":"#bca887","column":0,"row":0,"atlas":"frostland-spears-v1.png","atlasColumns":4,"description":"獵首初始骨柄矛；普攻累積寒冷。"},
      {"id":"frostland-spear-1","name":"霜鋼獵矛","rarity":"common","color":"#b1d4df","column":1,"row":0,"atlas":"frostland-spears-v1.png","atlasColumns":4,"description":"普攻與傷害技能累計提高 20%；獵矛換為霜鋼與淡藍冰晶，保留寒冷與碎冰互動。"},
      {"id":"frostland-spear-2","name":"極光牙矛","rarity":"epic","color":"#ad9ae5","column":2,"row":0,"atlas":"frostland-spears-v1.png","atlasColumns":4,"description":"普攻與傷害技能累計提高 40%；獵矛換為紫色極光牙刃，保留寒冷與碎冰互動。"},
      {"id":"frostland-spear-3","name":"寒冬王牙","rarity":"legendary","color":"#a7f4cd","column":3,"row":0,"atlas":"frostland-spears-v1.png","atlasColumns":4,"description":"普攻與傷害技能累計提高 60%；獵矛換為綠色寒冬王牙，保留寒冷與碎冰互動。"}
    ],
    chief:[
      {id:'chief-axe',name:'酋長戰斧',rarity:'base',color:'#c5a27a',description:'大酋長原本的戰斧。'},
      {id:'wildfang-axe',name:'荒牙戰斧',rarity:'common',color:'#d5c5a8',column:0,row:0,atlas:'chief-axes-v1.png',description:'普攻與傷害技能提高 20%；斧刃換上荒牙鍛鋼。'},
      {id:'blood-oath-axe',name:'血誓戰斧',rarity:'epic',color:'#e77a58',column:1,row:0,atlas:'chief-axes-v1.png',description:'累計提高 40% 傷害；戰斧加入血誓紋與獠牙鉤。'},
      {id:'earthsplitter-axe',name:'裂地王斧',rarity:'legendary',color:'#ff9b4a',column:2,row:0,atlas:'chief-axes-v1.png',description:'累計提高 60% 傷害；裂地熔光隨揮擊閃現。'}
    ],
    hunter:[
      {id:'ranger-bow',name:'王國巡林弓',rarity:'base',color:'#e6c56c',description:'英雄原本的制式長弓。'},
      {id:'steel-longbow',name:'精鋼長弓',rarity:'common',color:'#dce8ef',column:0,row:0,description:'普攻與傷害技能提高 20%，箭矢留下銀白軌跡。'},
      {id:'frostwood-longbow',name:'雷霜水晶弓',rarity:'epic',color:'#62dfff',column:1,row:0,description:'累計提高 40% 傷害；普攻有 35% 機率觸發三段連鎖雷擊。',chainChance:.35,chain:3,chainRange:108},
      {id:'dragonfire-longbow',name:'炎龍天弓',rarity:'legendary',color:'#ff6c32',column:2,row:0,description:'累計提高 60% 傷害；保留 35% 三段連鎖，並改為龍焰軌跡。',chainChance:.35,chain:3,chainRange:108,chainStyle:'flame'}
    ],
    arcanist:[
      {id:'silverleaf-staff',name:'銀葉法杖',rarity:'base',color:'#70e7ff',description:'銀葉學院的制式法杖。'},
      {id:'crystal-staff',name:'澄藍晶杖',rarity:'common',color:'#78cfff',column:0,row:1,description:'普攻與傷害技能提高 20%，法球更加明亮。'},
      {id:'storm-staff',name:'雷霆風暴杖',rarity:'epic',color:'#55bfff',column:1,row:1,description:'累計提高 40% 傷害，施法時環繞雷光。'},
      {id:'holy-star-staff',name:'聖星權杖',rarity:'legendary',color:'#ffd869',column:2,row:1,description:'累計提高 60% 傷害，獲得聖星光環與金色法術回饋。'}
    ],
    goblin:[
      {id:'engineer-tool',name:'工程扳手',rarity:'base',color:'#d9ad65',description:'測試型工程工具。'},
      {id:'calibrated-tool',name:'校準扳手',rarity:'common',color:'#c8dcce',column:0,row:0,atlas:'goblin-tools-v1.png',description:'普攻與傷害技能提高 20%；裝上精密儀表。'},
      {id:'pressure-tool',name:'蒸汽脈衝扳手',rarity:'epic',color:'#79daca',column:1,row:0,atlas:'goblin-tools-v1.png',description:'累計提高 40% 傷害；加入活塞與壓力導管。'},
      {id:'master-tool',name:'首席超載機具',rarity:'legendary',color:'#f3bb6d',column:2,row:0,atlas:'goblin-tools-v1.png',description:'累計提高 60% 傷害；武器顯示超載能源核心。'}
    ],
    rogue:[
      {id:'guild-daggers',name:'行會匕首',rarity:'base',color:'#c884df',description:'暗影行會的制式雙刃。'},
      {id:'steel-daggers',name:'精鋼雙匕',rarity:'common',color:'#e2e8ee',column:0,row:2,description:'普攻與傷害技能提高 20%，雙刃泛起冷鋼光。'},
      {id:'shadow-crescents',name:'影魔月刃',rarity:'epic',color:'#ca62ff',column:1,row:2,description:'累計提高 40% 傷害，攻擊留下紫色雙重殘影。'},
      {id:'demonfang-blades',name:'魔王獠牙',rarity:'legendary',color:'#ff3e4f',column:2,row:2,description:'累計提高 60% 傷害；普攻化為半徑 38 的魔焰斬擊。',splash:38,style:'flame'}
    ],
    naga:[
      {id:'tidebreaker-spear-0',name:'破潮三叉戟',rarity:'base',color:'#55d3d0',visual:'trident',description:'破潮者的初始潮門三叉戟。'},
      {id:'tidebreaker-spear-1',name:'珊瑚潮鋼戟',rarity:'common',color:'#9ce6df',visual:'trident',description:'普攻與傷害技能累計提高 20%；潮鋼刃留下青白水痕。'},
      {id:'tidebreaker-spear-2',name:'深淵潮印戟',rarity:'epic',color:'#4aaedb',visual:'trident',description:'普攻與傷害技能累計提高 40%；35% 機率觸發兩段潮線連鎖。',chainChance:.35,chain:2,chainRange:98,chainStyle:'tide-chain'},
      {id:'tidebreaker-spear-3',name:'萬潮王戟',rarity:'legendary',color:'#b7fff0',visual:'trident',description:'普攻與傷害技能累計提高 60%；保留潮線連鎖，並造成半徑 30 的破潮濺射。',chainChance:.35,chain:2,chainRange:98,chainStyle:'tide-chain',splash:30,style:'tide-splash'}
    ],
    dwarf:[
      {id:'dwarf-hammer-0',name:'符石重槌',rarity:'base',color:'#61d6d0',visual:'dwarf-hammer',atlas:'assets/td/dwarf/weapons-v1.png',description:'符石監軍的初始重槌。'},
      {id:'dwarf-hammer-1',name:'淬銀符錘',rarity:'common',color:'#b9e5df',visual:'dwarf-hammer',atlas:'assets/td/dwarf/weapons-v1.png',description:'普攻與傷害技能提高 20%；重槌改為淬銀符文。'},
      {id:'dwarf-hammer-2',name:'蒼紋震錘',rarity:'epic',color:'#58e2d8',visual:'dwarf-hammer',atlas:'assets/td/dwarf/weapons-v1.png',description:'累計提高 40% 傷害；重槌綻放蒼藍符光。'},
      {id:'dwarf-hammer-3',name:'山心王錘',rarity:'legendary',color:'#f0d17a',visual:'dwarf-hammer',atlas:'assets/td/dwarf/weapons-v1.png',description:'累計提高 60% 傷害；保留符文震盪。'}
    ],
    dragonkin:[
      {id:'dragonkin-spear-0',name:'蒼穹雷槍',rarity:'base',color:'#73c9ea',visual:'dragon-spear',atlas:'assets/td/dragonkin/weapons-v1.png',description:'蒼穹使者的初始雷槍。'},
      {id:'dragonkin-spear-1',name:'藍鋼雲槍',rarity:'common',color:'#c7e8f6',visual:'dragon-spear',atlas:'assets/td/dragonkin/weapons-v1.png',description:'普攻與傷害技能提高 20%；雷槍留下雲藍光痕。'},
      {id:'dragonkin-spear-2',name:'風暴龍脈槍',rarity:'epic',color:'#63bbff',visual:'dragon-spear',atlas:'assets/td/dragonkin/weapons-v1.png',description:'累計提高 40% 傷害；35% 機率觸發兩段雷鏈。',chainChance:.35,chain:2,chainRange:96,chainStyle:'lightning'},
      {id:'dragonkin-spear-3',name:'天穹王槍',rarity:'legendary',color:'#f0d27b',visual:'dragon-spear',atlas:'assets/td/dragonkin/weapons-v1.png',description:'累計提高 60% 傷害；保留雷鏈並追加半徑 28 的震擊。',chainChance:.35,chain:2,chainRange:96,chainStyle:'lightning',splash:28}
    ],
    egypt:[
      {id:'egypt-khopesh-0',name:'曦陽彎刀',rarity:'base',color:'#e7be62',visual:'egypt-khopesh',atlas:'assets/td/egypt/weapons-v1.png',description:'埃及島守衛的初始曦陽彎刀。'},
      {id:'egypt-khopesh-1',name:'鎏金日輪刃',rarity:'common',color:'#f4d882',visual:'egypt-khopesh',atlas:'assets/td/egypt/weapons-v1.png',description:'普攻與傷害技能提高 20%。'},
      {id:'egypt-khopesh-2',name:'青金日耀刃',rarity:'epic',color:'#69bfe6',visual:'egypt-khopesh',atlas:'assets/td/egypt/weapons-v1.png',description:'累計提高 40% 傷害。'},
      {id:'egypt-khopesh-3',name:'永晝王刃',rarity:'legendary',color:'#ffe28b',visual:'egypt-khopesh',atlas:'assets/td/egypt/weapons-v1.png',description:'累計提高 60% 傷害。'}
    ],
    bull:[
      {id:'bull-hammer-0',name:'不屈戰鎚',rarity:'base',color:'#c98b45',visual:'warhammer',description:'戰神・奧魯姆的中立重槌。可在商城裝配一種元素核心。'},
      {id:'bull-hammer-1',name:'燼紋巨槌',rarity:'common',color:'#e6b05e',visual:'warhammer',description:'普攻與傷害技能提高 20%；重槌的銘文開始發亮。'},
      {id:'bull-hammer-2',name:'天鑄戰神槌',rarity:'epic',color:'#e5764a',visual:'warhammer',description:'普攻與傷害技能累計提高 40%；槌面展現熾金戰紋。'},
      {id:'bull-hammer-3',name:'萬鈞裁決',rarity:'legendary',color:'#fff0a6',visual:'warhammer',description:'普攻與傷害技能累計提高 60%；揮擊會留下獨立的戰神金光。'}
    ]
  };
  const CORES={fire:{name:'火焰球',color:'#ff7148',description:'重槌命中引爆半徑 32 的灼擊。',splash:32,style:'bull-fire'},frost:{name:'冷凍球',color:'#8de9ff',description:'重槌命中額外強緩速 1.8 秒。',slow:.42,slowTime:1.8,style:'bull-frost'},lightning:{name:'雷球',color:'#d9c4ff',description:'重槌命中會連鎖至另外兩名近敵。',chain:3,chainRange:92,style:'bull-lightning'},shadow:{name:'暗影球',color:'#d07aee',description:'重槌可處決低於 32% 生命的敵軍。',executeThreshold:.32,executeMultiplier:1.65,style:'bull-shadow'}};
  const ICON_ATLASES={
    hunter:['assets/td/items/class-weapons-atlas-v1.png',3,3],arcanist:['assets/td/items/class-weapons-atlas-v1.png',3,3],rogue:['assets/td/items/class-weapons-atlas-v1.png',3,3],
    chief:['assets/td/items/chief-axes-v1.png',3,1],goblin:['assets/td/items/goblin-tools-v1.png',3,1],
    frostland:['assets/td/items/frostland-spears-v1.png',4,1],naga:['assets/td/naga/tidebreaker-weapons-v1.png',2,2],bull:['assets/td/neutral/bull-wargod-weapons-v1.png',2,2],
    dwarf:['assets/td/dwarf/weapons-v1.png',4,4],dragonkin:['assets/td/dragonkin/weapons-v1.png',4,4],egypt:['assets/td/egypt/weapons-v1.png',4,4]
  };
  class EquipmentSystem{
    static weapon(hero,level){const type=hero?.classType||'arcanist',list=WEAPONS[type]||WEAPONS.arcanist,index=Math.max(0,Math.min(3,level===undefined?(hero.equipment.spear||0):level)),item=list[index],atlas=ICON_ATLASES[type]||ICON_ATLASES.arcanist,offset=['hunter','arcanist','rogue','chief','goblin'].includes(type)?-1:0,cell=Math.max(0,index+offset),column=atlas[1]===2?cell%2:cell,row=atlas[1]===2?Math.floor(cell/2):type==='arcanist'?1:type==='rogue'?2:0;return Object.assign({},item,{level:index,rarityInfo:RARITIES[item.rarity],iconAtlas:atlas[0],iconColumns:atlas[1],iconRows:atlas[2],iconColumn:column,iconRow:row});}
    static iconStyle(weapon){const columns=weapon.iconColumns||3,rows=weapon.iconRows||3,column=Math.max(0,Math.min(columns-1,weapon.iconColumn||0)),row=Math.max(0,Math.min(rows-1,weapon.iconRow||0));return {backgroundImage:'url("'+weapon.iconAtlas+'")',backgroundSize:columns*100+'% '+rows*100+'%',backgroundPosition:(columns===1?0:column/(columns-1)*100)+'% '+(rows===1?0:row/(rows-1)*100)+'%'};}
    static nextWeapon(hero){const level=hero.equipment.spear||0;return level>=3?null:this.weapon(hero,level+1);}
    static core(hero){return hero?.classType==='bull'?CORES[hero.equipment?.core]||null:null;}
    static effectColor(hero,fallback){const core=this.core(hero),weapon=this.weapon(hero);return core?core.color:weapon.level?weapon.color:fallback;}
    static applyCore(hero,base){const core=this.core(hero);if(!core||base?.coreEligible===false)return Object.assign({},base);const options=Object.assign({},base,{color:core.color,style:core.style,weaponCore:hero.equipment.core});if(core.splash)options.splash=Math.max(options.splash||0,core.splash);if(core.slow){options.slow=Math.max(options.slow||0,core.slow);options.slowTime=Math.max(options.slowTime||0,core.slowTime);}if(core.chain){options.chain=Math.max(options.chain||0,core.chain);options.chainRange=Math.max(options.chainRange||0,core.chainRange);}if(core.executeThreshold){options.executeThreshold=core.executeThreshold;options.executeMultiplier=core.executeMultiplier;}return options;}
    static projectileOptions(hero,base,random){const options=this.applyCore(hero,base),weapon=this.weapon(hero),roll=typeof random==='function'?random:Math.random;if(weapon.chainChance&&roll()<weapon.chainChance){options.chain=weapon.chain;options.chainRange=weapon.chainRange;options.style=weapon.chainStyle||'lightning';options.weaponProc='chain';}if(weapon.splash){options.splash=Math.max(options.splash||0,weapon.splash);options.style=weapon.style||options.style;options.weaponProc='splash';}return options;}
    static drawSignature(ctx,hero){const weapon=this.weapon(hero);if(!weapon.level||!hero.active||hero.state!=='attack'||hero.attackTimer<=0)return;const fade=Math.max(0,Math.min(1,hero.attackTimer/.36));ctx.save();try{ctx.translate(hero.x,hero.y-19);ctx.rotate(hero.facing||0);ctx.globalCompositeOperation='screen';ctx.strokeStyle=this.core(hero)?.color||weapon.color;ctx.shadowColor=ctx.strokeStyle;ctx.shadowBlur=weapon.level>=3?7:3;ctx.globalAlpha=.18+.3*fade;ctx.lineWidth=1+weapon.level*.35;ctx.beginPath();ctx.moveTo(22,-5);ctx.lineTo(36+weapon.level*2,-8);ctx.stroke();}finally{ctx.restore();}}
  }
  EquipmentSystem.WEAPONS=WEAPONS;EquipmentSystem.CORES=CORES;EquipmentSystem.RARITIES=RARITIES;ns.systems.EquipmentSystem=EquipmentSystem;
})(globalThis.TowerFrontier);
