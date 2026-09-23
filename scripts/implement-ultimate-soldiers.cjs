'use strict';
// One-shot migration. Snapshot each touched file before editing; never reset the working tree.
const fs=require('node:fs'),path=require('node:path');
const backup='artifacts/ultimate-soldiers-backup';
function edit(file,fn){if(process.argv.includes('--resume')&&fs.existsSync(path.join(backup,file)))return;const original=fs.readFileSync(file,'utf8'),next=fn(original);if(next===original)throw Error('No change: '+file);const dest=path.join(backup,file);fs.mkdirSync(path.dirname(dest),{recursive:true});if(!fs.existsSync(dest))fs.writeFileSync(dest,original);fs.writeFileSync(file,next);}
function replace(s,a,b){if(!s.includes(a))throw Error('Missing anchor: '+a.slice(0,90));return s.replace(a,b);}
edit('src/td/config.js',s=>{
 s=replace(s,"    units:{","    units:{\n      royalCommander:{name:'皇家重裝統領',faction:'王國',icon:'冠',cost:750,wood:5,health:260,damage:100,range:165,interval:1.5,splash:38,color:'#f3ce75',attackType:'chaos',style:'lightning',ultimate:true,commandAura:.18,role:'終極士兵｜重鎚濺射｜165 範圍其他士兵傷害 +18%（同類取最高）'},\n      soulsteel:{name:'深淵魂鋼魔像',faction:'暗影',icon:'魂',cost:850,wood:6,health:350,damage:120,range:145,interval:1.8,splash:48,color:'#b78aff',attackType:'chaos',style:'spirit',ultimate:true,soulSlam:true,role:'終極士兵｜每次攻擊有 3 魂則消耗，傷害 ×1.5、震地範圍 +20；無魂仍攻擊'},");
 return s.replace(/dragon:\{name:'翡翠幼龍'[^\n]+/,"dragon:{name:'翡翠古龍',faction:'月影',icon:'龍',cost:800,wood:6,health:300,armor:2,damage:110,range:195,interval:1.65,speed:136,color:'#70d89c',attackType:'magic',splash:62,natureExplosion:true,style:'nature',ultimate:true,role:'終極士兵｜大範圍翡翠吐息｜引爆自然印記'},");
});
edit('src/td/systems/FactionSystem.js',s=>replace(replace(s,"'kingdomMage','alchemist']","'kingdomMage','alchemist','royalCommander']"),"'banshee','boneRider']","'banshee','boneRider','soulsteel']"));
edit('src/td/entities/CombatUnit.js',s=>{
 s=replace(s,"dragon:['翡翠幼龍','巡空幼龍','符甲飛龍','風暴翼龍','翡翠龍王']","dragon:['翡翠古龍','月紋古龍','銀翼古龍','月蝕龍王','翡翠龍皇']");
 return replace(s,"return{gold:45+this.level*40,merit:this.level>=3?this.level-2:0};","const cfg=ns.config.units[this.type];return{gold:cfg.ultimate?Math.round(cfg.cost*(.3+this.level*.15)/5)*5:45+this.level*40,merit:this.level>=3?this.level-2:0};");
});
edit('src/td/systems/BattleSynergySystem.js',s=>{
 s=replace(s,'      return options;',"      if(cfg.soulSlam&&owner.synergy&&owner.synergy.souls>=3){owner.synergy.souls-=3;options.damage*=1.5;options.splash=(options.splash||0)+20;options.soulCharged=true;}\n      return options;");
 return replace(s,'        if(cfg.forgeAura)',"        if(cfg.commandAura)near.filter(t=>t.kind==='unit').forEach(t=>{t.supportDamage=Math.max(t.supportDamage,cfg.commandAura);});\n        if(cfg.forgeAura)");
});
edit('src/td/entities/Monster.js',s=>replace(s,'  const TYPES={',"  const TYPES={\n    wildDragon:{name:'荒野翡翠龍',color:'#70b975',speed:55,health:260,reward:32,radius:24,baseDamage:2,armor:2,armorType:'arcane'},"));
edit('src/td/systems/WaveCatalog.js',s=>{
 s=replace(s,"['brute',7],['treant',3]","['brute',5],['wildDragon',2],['treant',3]");
 s=replace(s,'失誓騎士、腐化樹靈與巨獸進攻，旗手加速','荒野翡翠龍與失誓騎士進攻；龍為秘法甲，沿道路前進');
 s=replace(s,"['brute',14],['raider',4]","['brute',11],['wildDragon',3],['raider',4]");
 return replace(s,'巨獸與赤牙考驗定點火力配置','荒野翡翠龍、巨獸與赤牙考驗混合火力');
});
edit('src/td/systems/ArtSystem.js',s=>{
 s=replace(s,"dragon:this.load('assets/td/faction-dragon-v1.png')","dragon:this.load('assets/td/ultimate-dragon-v1.png'),royalCommander:this.load('assets/td/ultimate-commander-v1.png'),soulsteel:this.load('assets/td/ultimate-soulsteel-v1.png')");
 s=replace(s,'this.enemyActions.halberdier=',"this.enemyActions.wildDragon=this.load('assets/td/faction-dragon-v1.png');this.enemyActions.halberdier=");
 s=replace(s,'      const sw=image.width/4,sh=image.height/4,rows=',"      const ultimate=ns.config.units[unit.type]?.ultimate,grid=ultimate?2:4;\n      const sw=image.width/grid,sh=image.height/grid,rows=");
 s=replace(s,'const row=rows[unit.state]||0,frame=Math.max(0,Math.min(3,unit.frame||0));',"const row=ultimate?(unit.state==='attack'?1:0):(rows[unit.state]||0),frame=ultimate?Math.floor(Math.max(0,Math.min(3,unit.frame||0))/2):Math.max(0,Math.min(3,unit.frame||0));");
 s=replace(s,'dragon:82,','dragon:96,royalCommander:82,soulsteel:94,');
 s=replace(s,'grunt:60,runner:54,','wildDragon:76,grunt:60,runner:54,');
 return s;
});
edit('src/td/systems/ArmorySystem.js',s=>replace(replace(s,"types:['skeleton','golem']","types:['skeleton','golem','soulsteel']"),"types:['shield','knight'","types:['royalCommander','shield','knight'"));
edit('td.html',s=>{
 s=replace(s,'<span>部署幼龍</span>','<span>終極古龍</span>');
 s=replace(s,'data-build-type="dragon" hidden>', 'data-build-type="dragon" hidden>');
 const cards=['royalCommander','soulsteel'].map(type=>`        <button type="button" data-build-kind="unit" data-build-type="${type}" hidden><b></b><span>終極士兵</span><small></small></button>`).join('\n');
 s=replace(s,'        <button type="button" data-build-kind="unit" data-build-type="dragon"',cards+'\n        <button type="button" data-build-kind="unit" data-build-type="dragon"');
 return replace(s,'      <button type="button" data-mercenary="kingdomMage">',['royalCommander','soulsteel'].map(type=>`      <button type="button" data-mercenary="${type}"><b></b><small></small><span></span></button>`).join('\n')+'\n      <button type="button" data-mercenary="kingdomMage">');
});
edit('src/td/TDGame.js',s=>replace(s,"['crypt','soul','graveyard'].includes(selected.type)","['crypt','soul','graveyard','soulsteel'].includes(selected.type)"));
console.log('Ultimate soldiers integrated; originals saved to '+backup);
