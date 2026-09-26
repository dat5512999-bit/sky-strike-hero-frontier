(function(ns){
  'use strict';
  const WAVES=[
    {name:'邊境斥候',hint:'基礎輕甲部隊',groups:[['grunt',10]],reward:[24,1],threat:1},
    {name:'疾風試探',hint:'獵犬與裂風狼群分兩速突進',groups:[['runner',9],['direwolf',3]],reward:[28,1],threat:2},
    {name:'秘法前鋒',hint:'術士後方混入會近身攻擊英雄的赤牙掠奪者',groups:[['grunt',6],['shaman',5],['raider',2]],reward:[34,1],threat:3},
    {name:'盾牆試煉',hint:'盾衛先消耗護盾再承受生命傷害',groups:[['warder',5],['brute',3],['grunt',5]],reward:[40,1],threat:4},
    {name:'戰將壓境',hint:'首領率岩獸與赤牙掠奪者踐踏前線',groups:[['boss',1],['brute',4],['healer',2],['grunt',2],['raider',1]],reward:[58,2],threat:5},
    {name:'旗手奔襲',hint:'先擊倒旗手，再攔截高速狼群',groups:[['runner',14],['direwolf',6],['commander',2],['grunt',5]],reward:[46,1],threat:6},
    {name:'血契儀式',hint:'蒼燄怨靈獵殺英雄，祭司治療前排',groups:[['healer',4],['grunt',10],['shaman',5],['revenant',3]],reward:[52,1],threat:7},
    {name:'鋼鐵方陣',hint:'叛軍長戟衛與腐化樹靈加入敵軍，混合傷害應對',groups:[['warder',7],['treant',3],['brute',3],['halberdier',3]],reward:[59,1],threat:8},
    {name:'軍團號令',hint:'旗手藏於步兵、獵犬與狼群之中',groups:[['commander',3],['grunt',15],['runner',9],['direwolf',6]],reward:[66,1],threat:9},
    {name:'鐵壁統領',hint:'首領配合盾衛、赤牙與治療祭司',groups:[['boss',1],['brute',5],['warder',6],['healer',3],['raider',2]],reward:[82,2],threat:10},
    {name:'虛空血潮',hint:'術士與怨靈同時壓制英雄',groups:[['shaman',13],['revenant',5],['healer',5],['runner',8]],reward:[74,1],threat:11},
    {name:'岩甲圍城',hint:'荒野翡翠龍與失誓騎士進攻；龍為秘法甲，沿道路前進',groups:[['brute',5],['wildDragon',2],['treant',3],['fallenKnight',4],['commander',4],['warder',6]],reward:[82,1],threat:12},
    {name:'疾風軍令',hint:'獵犬與狼群受旗手、祭司支援',groups:[['runner',26],['direwolf',8],['commander',4],['healer',4]],reward:[90,1],threat:13},
    {name:'三軍合圍',hint:'前排重甲、後排治療、怨靈獵殺英雄',groups:[['brute',9],['shaman',8],['warder',7],['healer',4],['commander',3],['revenant',4]],reward:[102,1],threat:14,spawnPace:1.2},
    {name:'邊境決戰',hint:'第一戰區決戰，重甲與狼群同時進場',groups:[['boss',1],['brute',10],['warder',8],['healer',5],['commander',4],['runner',9],['direwolf',4]],reward:[140,2],threat:15},
    {name:'暮色再編',hint:'步兵、赤牙與怨靈分散衝擊前線',groups:[['grunt',14],['runner',10],['shaman',6],['raider',3],['revenant',3]],reward:[108,1],threat:16},
    {name:'雙旗長驅',hint:'雙旗加速獵犬、狼群與步兵',groups:[['commander',4],['runner',17],['direwolf',7],['grunt',12]],reward:[116,1],threat:17},
    {name:'血契護送',hint:'祭司藏盾衛後，怨靈干擾英雄',groups:[['warder',8],['healer',6],['brute',6],['revenant',3]],reward:[124,2],threat:18},
    {name:'獵殺者之夜',hint:'術士與怨靈鎖定英雄，狼群直衝城門',groups:[['shaman',10],['revenant',4],['runner',12],['direwolf',6],['commander',3]],reward:[132,1],threat:19},
    {name:'裂地督軍',hint:'第二戰區 Boss 帶赤牙、旗手與重甲踐踏前線',groups:[['boss',1],['brute',8],['warder',8],['healer',4],['commander',3],['raider',3]],reward:[160,2],threat:20,spawnPace:1.2},
    {name:'蒼鋼盾潮',hint:'密集盾衛與赤牙重甲需要魔法救場',groups:[['warder',13],['grunt',15],['healer',5],['raider',4]],reward:[145,2],threat:21},
    {name:'雙翼突襲',hint:'狼群與獵犬掩護術士逼近英雄',groups:[['runner',27],['direwolf',9],['shaman',10],['commander',4]],reward:[155,1],threat:22},
    {name:'巨獸攻城列',hint:'荒野翡翠龍、巨獸與赤牙考驗混合火力',groups:[['brute',11],['wildDragon',3],['raider',4],['commander',4],['healer',4]],reward:[165,2],threat:23},
    {name:'三層戰線',hint:'盾衛、步兵、怨靈與後排治療同進',groups:[['warder',10],['grunt',16],['shaman',10],['revenant',5],['healer',5],['commander',4]],reward:[175,2],threat:24},
    {name:'赤牙霸主',hint:'第三戰區 Boss 帶赤牙與狼群混合援軍',groups:[['boss',1],['runner',14],['direwolf',5],['brute',10],['raider',4],['warder',6],['healer',5],['commander',4]],reward:[205,3],threat:25},
    {name:'秘法封鎖',hint:'術士與怨靈受盾衛保護，物理單一路線失效',groups:[['shaman',15],['revenant',5],['warder',10],['healer',6]],reward:[188,2],threat:26},
    {name:'軍團洪流',hint:'步兵、狼群與赤牙受旗手加速',groups:[['grunt',30],['runner',20],['direwolf',8],['raider',4],['commander',5]],reward:[200,2],threat:27},
    {name:'不朽方陣',hint:'巨獸、赤牙、護盾與治療形成重甲陣線',groups:[['brute',16],['raider',4],['warder',14],['healer',7]],reward:[215,3],threat:28,spawnPace:1.3},
    {name:'終戰先鋒',hint:'狼群、怨靈與各職責同時登場',groups:[['grunt',18],['runner',14],['direwolf',5],['brute',10],['shaman',12],['revenant',4],['warder',8],['healer',5],['commander',5]],reward:[230,3],threat:29},
    {name:'王城末日',hint:'最終戰將率領狼群、赤牙、怨靈與軍團壓境',groups:[['boss',1],['brute',14],['warder',12],['shaman',10],['revenant',4],['raider',4],['healer',7],['commander',6],['runner',16],['direwolf',5]],reward:[300,4],threat:30},
    {name:'齒輪餘燼',hint:'工兵與拾荒者以盾衛、戰旗掩護；先拆遠攻與支援，不能只靠單體火力。',groups:[['goblinScavenger',25],['goblinSapper',10],['warder',15],['orcBanner',10],['brute',10]],reward:[310,4],threat:31,spawnPace:.94},
    {name:'隱幕爆罐',hint:'隱幕地精未被揭露前無法鎖定；以隱形魔石守住英雄周圍視野，再處理後方爆罐工兵。',groups:[['goblinSapper',12],['goblinScavenger',22],['goblinVeilrunner',10],['warder',16],['orcBanner',10],['brute',4]],reward:[322,4],threat:32,spawnPace:.92},
    {name:'霜徑來客',hint:'霜痕掠行者切線，霜骨祭司遠程壓制；以控制與範圍火力保住防線。',groups:[['frostRimeStalker',30],['direwolf',15],['frostRimePriest',15],['warder',14],['nagaShellbreaker',8]],reward:[335,4],threat:33,spawnPace:.9},
    {name:'戰旗壓境',hint:'戰旗獸人帶碎顱重甲推進；優先切斷旗手支援，再處理前排。',groups:[['orcBanner',12],['orcSkullcrusher',12],['raider',12],['healer',10],['warder',10],['brute',8]],reward:[350,5],threat:34,spawnPace:.88},
    {name:'鹽甲試潮',hint:'戰將、鹽甲與盾衛同時壓線；保留爆發處理首領，並防止祭司拖長戰線。',groups:[['boss',1],['nagaSiltImp',30],['nagaShellbreaker',18],['healer',10],['commander',8],['warder',8]],reward:[365,5],threat:35,spawnPace:.86},
    {name:'碎顱強襲',hint:'碎顱獸人會鎖定英雄，戰旗與工兵則讓後撤路線也有壓力。',groups:[['orcSkullcrusher',16],['orcBanner',12],['raider',16],['goblinSapper',12],['brute',12],['warder',8]],reward:[380,5],threat:36,spawnPace:.88},
    {name:'霜翼咒潮',hint:'霜翼掠襲者只能由可對空單位處理；祭司同時為地面部隊提供抗控，需保留遠攻火力。',groups:[['frostRimePriest',18],['frostRimeStalker',22],['frostSkyraider',8],['warder',16],['shaman',12],['nagaShellbreaker',12]],reward:[395,5],threat:37,spawnPace:.86},
    {name:'地精回收線',hint:'高速地精、工兵與旗手壓縮出兵間距；錯過第一輪清場會快速堆積。',groups:[['goblinScavenger',30],['goblinSapper',18],['commander',14],['warder',16],['orcBanner',8],['brute',10]],reward:[412,5],threat:38,spawnPace:.84},
    {name:'凍原鐵壁',hint:'掠行者掩護重甲，祭司在後方持續壓制；不要讓單一慢塔承擔全部清場。',groups:[['frostRimeStalker',34],['brute',16],['frostRimePriest',16],['nagaShellbreaker',14],['warder',12]],reward:[430,5],threat:39,spawnPace:.82},
    {name:'濁潮前哨',hint:'首領前哨以濁潮小兵、鹽甲、工兵與護盾交錯壓線，測試完整隊伍的續航。',groups:[['boss',1],['nagaSiltImp',40],['nagaShellbreaker',18],['goblinSapper',14],['healer',12],['warder',10],['commander',10]],reward:[450,6],threat:40,spawnPace:.8},
    {name:'萬族裂線',hint:'戰旗、拾荒者、霜原切線與碎顱重甲同場；這不是休息波，需立刻調整目標優先序。',groups:[['orcBanner',16],['goblinScavenger',30],['frostRimeStalker',28],['healer',12],['orcSkullcrusher',8],['warder',10]],reward:[470,6],threat:41,spawnPace:.82},
    {name:'相位潮門',hint:'相位潮衛免疫穿刺；用魔法、混沌或範圍控制打開潮門，勿只依賴弓箭與火銃。',groups:[['nagaShellbreaker',18],['nagaPhasewarden',12],['nagaSiltImp',36],['frostRimePriest',18],['warder',14],['brute',10],['goblinSapper',12]],reward:[492,6],threat:42,spawnPace:.8},
    {name:'旗與冰',hint:'戰旗與霜骨祭司形成攻守搭配，碎顱獸人專門逼迫英雄離開輸出位置。',groups:[['orcBanner',18],['orcSkullcrusher',12],['frostRimePriest',18],['commander',12],['warder',12],['nagaShellbreaker',10]],reward:[515,6],threat:43,spawnPace:.78},
    {name:'熔壓地精',hint:'工兵遠攻與拾荒者高速突進，同時由盾衛、掠奪者與旗手穩住戰線。',groups:[['goblinSapper',22],['goblinScavenger',36],['warder',18],['raider',16],['orcBanner',12],['brute',10]],reward:[540,6],threat:44,spawnPace:.76},
    {name:'霜潮混戰',hint:'首領帶霜原游擊、鹽甲與祭司混戰；以範圍控制拆開密集護衛，才有首領輸出窗口。',groups:[['boss',1],['frostRimeStalker',35],['nagaShellbreaker',16],['frostRimePriest',16],['healer',12],['orcBanner',10],['warder',10]],reward:[565,7],threat:45,spawnPace:.74},
    {name:'鏡甲洪流',hint:'鏡甲裂牙衛受擊有機率讓士兵暈厥；用英雄、控制與分散火力避免整排守軍同時失手。',groups:[['orcSkullcrusher',16],['orcMirrorGuard',10],['orcBanner',16],['goblinSapper',18],['goblinScavenger',24],['warder',14]],reward:[590,7],threat:46,spawnPace:.76},
    {name:'深寒缺口',hint:'快速霜原兵群、祭司、狼群與盾衛同步逼近；僅靠單一控制鏈已不足以守住缺口。',groups:[['frostRimeStalker',42],['frostRimePriest',24],['direwolf',22],['warder',18],['nagaShellbreaker',12]],reward:[620,7],threat:47,spawnPace:.74},
    {name:'濁潮集結',hint:'小魔王現身前的混成編隊：鹽甲、碎顱與祭司先斷陣，再由濁潮兵補上密度。',groups:[['nagaSiltImp',50],['nagaShellbreaker',20],['goblinSapper',18],['orcBanner',16],['orcSkullcrusher',10],['warder',10]],reward:[650,7],threat:48,spawnPace:.72},
    {name:'四族合圍',hint:'地精、獸人、霜原與娜迦不留間隙連續逼近；為超凡前的最後編隊檢定。',groups:[['goblinScavenger',36],['orcSkullcrusher',18],['frostRimePriest',22],['nagaShellbreaker',18],['nagaSiltImp',30],['warder',12]],reward:[680,8],threat:49,spawnPace:.7},
    {name:'潮下霸主',hint:'濁潮小魔王率四族菁銳終局試煉；先破護衛與祭司，才能在首領狂暴前取得輸出窗口。',groups:[['nagaSiltwaterDemonlord',1],['nagaShellbreaker',15],['nagaSiltImp',25],['orcSkullcrusher',12],['frostRimePriest',18],['goblinSapper',14],['warder',10],['frostRimeStalker',15]],reward:[760,8],threat:50,spawnPace:.68}
  ];
  class WaveCatalog{
    total(){return WAVES.length;}
    get(wave){
      const source=WAVES[wave-1];
      if(!source)return null;
      return{wave:wave,name:source.name,hint:source.hint,threat:source.threat,spawnPace:source.spawnPace||1,groups:source.groups.map(function(group){return{type:group[0],count:group[1]};}),reward:{gold:source.reward[0],lumber:source.reward[1]}};
    }
  }
  WaveCatalog.WAVES=WAVES;
  ns.systems.WaveCatalog=WaveCatalog;
})(globalThis.TowerFrontier);
