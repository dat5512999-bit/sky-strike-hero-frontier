(function(ns){
  'use strict';
  const mission={id:'chapter1-border',chapter:1,name:'烽火初燃',map:'beginner',hero:'hunter',faction:'hunter',difficulty:'story',objective:'守住谷地城門，完成 5 波王國叛軍的新兵演練。',rewards:{maps:['twinpass','silverleaf']},discovered:['kingdom-rebellion'],tutorial:{startingGold:400,recommendedPositions:[{x:680,y:415,radius:34}]},cinematic:['邊境的烽火，比信使先抵達王城。','昔日守衛商路的長戟衛，如今將兵鋒指向谷地。雷恩奉命守住城門，查清叛亂的源頭。','部署王國士兵守住道路，使用陷阱拖慢重甲叛軍。城門還在，希望就還在。']};
  mission.storyCards=[
    {title:'烽火初燃',label:'谷地 · 戰前',line:'邊境烽火亮起。信使還沒抵達。',image:'assets/td/story/kingdom-border-at-dusk-v2.png',focus:'center'},
    {title:'同一面旗',label:'雷恩',line:'「對面也是王國士兵。為何刀要指向自己人？」',image:'assets/td/story/rhen-oathkeeper-v2.png',focus:'center'},
    {title:'守住城門',label:'此刻的選擇',line:'先守住谷地，才有機會查清命令從何而來。',image:'assets/td/story/kingdom-checkpoint-order-v2.png',focus:'center'}
  ];
  mission.aftermath='守住谷地後，殘缺的命令名冊留下更多空白。叛軍不是答案；有人正在利用王國的混亂。';
  const waves=[{name:'谷地斥候',hint:'首批輕裝斥候會讓你看見王國獵手確實能擊倒敵軍',groups:[{type:'grunt',count:4}],spawnPace:4},{name:'叛軍試探',hint:'快速斥候與重甲衛混編，確認守軍射程能覆蓋彎道',groups:[{type:'runner',count:5},{type:'halberdier',count:3}]},{name:'軍械補給',hint:'守成後會取得第一件可裝備軍械，選獵手查看相容裝備',groups:[{type:'halberdier',count:6},{type:'fallenKnight',count:2}]},{name:'彎道壓力',hint:'敵人數量增加；從選取資訊比較升級、增兵與防禦塔',groups:[{type:'runner',count:7},{type:'halberdier',count:5}]},{name:'谷地守望',hint:'最後一波綜合演練，先看預告再補足城門前火力',groups:[{type:'fallenKnight',count:4},{type:'halberdier',count:7}]}];
  const silverleaf={id:'chapter1-silverleaf',chapter:1,name:'溪谷餘音',map:'silverleaf',hero:'hunter',faction:'hunter',difficulty:'story',requires:mission.id,objective:'沿溪谷守住 6 波追兵，讓調查隊取得銀葉保留的舊日記錄。',rewards:{maps:['shadowfall']},discovered:['silverleaf-record'],cinematic:['溪水仍清澈，昔日盟約卻開始動搖。','王國調查隊進入銀葉溪谷，尋找能解釋衝突的記錄。這些線索尚不足以判定兇手。','守住橋樑，讓記錄安全離開溪谷。'],waves:[{name:'橋前斥候',hint:'先守第一座橋，讓基礎火力覆蓋入口',groups:[{type:'grunt',count:5}]},{name:'溪谷包抄',hint:'中央草地可照顧兩段道路',groups:[{type:'runner',count:5},{type:'halberdier',count:3}]},{name:'橋頭重隊',hint:'重甲衛增加，補上能處理重甲的火力',groups:[{type:'grunt',count:6},{type:'halberdier',count:4}]},{name:'疾行追兵',hint:'高速敵人會穿過空檔，別只守單一彎道',groups:[{type:'runner',count:6},{type:'fallenKnight',count:3}]},{name:'術士掩護',hint:'優先處理後排術士，避免前線被持續消耗',groups:[{type:'runner',count:4},{type:'halberdier',count:5},{type:'shaman',count:3}]},{name:'溪谷撤離',hint:'最後一波混編重甲騎士；在城門前留下補漏火力',groups:[{type:'fallenKnight',count:4},{type:'halberdier',count:6}]}]};
  silverleaf.storyCards=[
    {title:'溪谷餘音',label:'銀葉溪谷 · 抵達',line:'溪谷仍守著舊日的安靜，卻再也無法把戰火隔在外面。',image:'assets/td/story/silverleaf-valley-arrival-v2.png',focus:'center'},
    {title:'被保存的記憶',label:'調查記錄',line:'這份舊盟約證明曾有合作；它仍沒有告訴我們，誰毀了和平。',image:'assets/td/story/silverleaf-record-study-v2.png',focus:'center'},
    {title:'橋上的撤離',label:'護送',line:'記錄必須安全離開溪谷，調查才有下一步。',image:'assets/td/story/silverleaf-bridge-escort-v2.png',focus:'center'}
  ];
  silverleaf.aftermath='舊記錄提到銀葉與暮影曾共同封存危險的技術。那只是恐懼的歷史，仍不足以判定王子之死。';
  const shadowfall={id:'chapter1-shadowfall',chapter:1,name:'舊城疑雲',map:'shadowfall',hero:'hunter',faction:'hunter',difficulty:'story',requires:silverleaf.id,objective:'在暮影舊城守住 7 波撤離道路，尋找與禁忌歷史相關的證言。',rewards:{maps:['frostborn']},discovered:['shadowfall-ruins'],cinematic:['暮影舊城的廢墟，仍留著人們急於遺忘的聲音。','調查隊來到舊城尋找證言；現場痕跡不能直接證明任何族群有罪。','在中央廣場設防，守住唯一的撤離道路。'],waves:[{name:'舊城追兵',hint:'前段與中央廣場擇一先佈防',groups:[{type:'grunt',count:7},{type:'runner',count:4}]},{name:'暗巷威脅',hint:'中央廣場可覆蓋彎道，但別忘記後段',groups:[{type:'runner',count:6},{type:'shaman',count:2}]},{name:'失誓巡隊',hint:'騎士帶著步兵壓境，別讓重甲擠過彎道',groups:[{type:'grunt',count:5},{type:'fallenKnight',count:3}]},{name:'怨靈穿行',hint:'秘法敵人會逼近防線，留意輸出死角',groups:[{type:'revenant',count:4},{type:'runner',count:5}]},{name:'術士與巨獸',hint:'先處理術士，再用集中火力擊倒岩甲巨獸',groups:[{type:'halberdier',count:4},{type:'shaman',count:3},{type:'brute',count:2}]},{name:'舊城崩口',hint:'巨獸和騎士同時推進，城門前必須有第二層防線',groups:[{type:'fallenKnight',count:4},{type:'brute',count:3}]},{name:'證言撤離',hint:'最終混編會同時考驗群攻、單點與城門補漏',groups:[{type:'revenant',count:5},{type:'shaman',count:3},{type:'brute',count:2}]}]};
  shadowfall.storyCards=[
    {title:'舊城疑雲',label:'暮影舊城 · 證言',line:'被懷疑的人們也在等答案。調查不是審判。',image:'assets/td/story/shadowfall-testimony-v2.png',focus:'center'},
    {title:'封存的遺物',label:'禁忌歷史',line:'遺物來自被遺忘的年代；它的來源與用途，仍無法定論。',image:'assets/td/story/shadowfall-archive-reliquary-v2.png',focus:'center'},
    {title:'留住證人',label:'撤離道路',line:'先護送證言離開。真相不能再被下一場戰火吞沒。',image:'assets/td/story/shadowfall-evacuation-v2.png',focus:'center'}
  ];
  shadowfall.aftermath='證言與遺物都指向一段被封存的歷史，卻沒有證明現代暮影重啟了禁忌。有人希望調查停在這裡。';
  const frostborn={id:'chapter1-frostborn',chapter:1,name:'裂谷守望',map:'frostborn',hero:'hunter',faction:'hunter',difficulty:'story',requires:shadowfall.id,objective:'守住冰原雙入口匯合後的 8 波長橋，護送線索穿越裂谷。',rewards:{maps:[]},discovered:['frostborn-chasm'],cinematic:['冰原裂谷封住前路，兩處入口都可能出現追兵。','兩路敵軍交替抵達，最終都會走向同一段冰橋。','集中主力守住共用道路，把線索帶出裂谷。'],waves:[{name:'裂谷先鋒',hint:'先在匯流後佈塔，不需要兩邊各蓋一套',groups:[{type:'grunt',count:6},{type:'runner',count:3}]},{name:'雙路追兵',hint:'兩入口交替出兵，匯流後共用同一防線',groups:[{type:'runner',count:5},{type:'halberdier',count:4}]},{name:'冰橋夾擊',hint:'檢查匯流處與城門前的補漏位置',groups:[{type:'fallenKnight',count:3},{type:'grunt',count:7}]},{name:'匯流壓力',hint:'兩路怪會在橋前合流，群攻與減速要提前放好',groups:[{type:'runner',count:6},{type:'halberdier',count:4},{type:'shaman',count:3}]},{name:'裂谷巨獸',hint:'巨獸接近城門時傷害很高，保留技能處理關鍵目標',groups:[{type:'revenant',count:5},{type:'brute',count:3}]},{name:'長橋重隊',hint:'騎士與長戟衛的重甲隊伍，需要集中火力逐個擊破',groups:[{type:'fallenKnight',count:5},{type:'halberdier',count:6}]},{name:'寒風術團',hint:'術士、巨獸與疾行敵人混編，確認兩側入口都被照顧',groups:[{type:'runner',count:5},{type:'shaman',count:4},{type:'brute',count:4}]},{name:'裂谷守望',hint:'最後一波全線壓力；守住匯流後的長橋與城門前防線',groups:[{type:'revenant',count:6},{type:'fallenKnight',count:5},{type:'brute',count:3}]}]};
  frostborn.storyCards=[
    {title:'裂谷守望',label:'冰原裂谷 · 路線',line:'兩條雪路，最後都匯向同一座橋；線索沒有第二條退路。',image:'assets/td/story/frostborn-chasm-route-v2.png',focus:'center'},
    {title:'寒風中的訊號',label:'調查隊',line:'燈火亮起，護送隊跨過冰橋。每一步都在和時間競賽。',image:'assets/td/story/frostborn-bridge-signal-v2.png',focus:'center'},
    {title:'最後的橋頭',label:'守住線索',line:'讓證據先抵達安全處；剩下的人，守住這一段橋。',image:'assets/td/story/frostborn-last-bridge-v2.png',focus:'center'}
  ];
  frostborn.aftermath='線索被帶出裂谷。殘存的調度紀錄顯示，王城裡還有一套不受禁衛軍管轄的命令系統；調查才剛開始。';
  const westernsignal={id:'chapter2-western-signal',chapter:2,name:'西境風號',map:'westernsignal',hero:'hunter',faction:'hunter',difficulty:'story',requires:frostborn.id,objective:'守住 6 波西行古道，護送信使與辨識用的舊印穿過西境舊哨。',rewards:{maps:[]},discovered:['western-signal'],cinematic:['殘缺的調度碼越過了王國邊界，古老路名把調查帶往西方。','荒野斥候認出舊印，卻拒絕在武裝隊伍面前說明；先讓信使安全通過。','守住西境古道，讓對話能在下一段路上繼續。'],waves:[{name:'西境斥候',hint:'古道入口狹長；先讓火力覆蓋第一個彎道。第 2 波起中段會出現荒風隘道。',groups:[{type:'grunt',count:6}]},{name:'荒風追兵',hint:'中段隘道順風 +10%；冰緩、暈眩與陷阱可將其壓低，但不能完全取消。',groups:[{type:'runner',count:6},{type:'halberdier',count:3}]},{name:'舊哨重隊',hint:'古碑旁不能部署；利用兩側平地集中處理重甲',groups:[{type:'grunt',count:7},{type:'fallenKnight',count:3}]},{name:'轉角煙塵',hint:'術士會躲在步兵後方，保留技能處理關鍵窗口',groups:[{type:'runner',count:6},{type:'shaman',count:3},{type:'halberdier',count:4}]},{name:'訊號石壓力',hint:'巨獸進入最後長直道前，補足城門前的第二層火力',groups:[{type:'revenant',count:4},{type:'brute',count:3},{type:'fallenKnight',count:3}]},{name:'護送風號',hint:'最終混編會考驗群攻、單點與補漏；讓信使帶著舊印離開',groups:[{type:'runner',count:7},{type:'shaman',count:4},{type:'brute',count:3},{type:'fallenKnight',count:4}]}]};
  westernsignal.storyCards=[
    {title:'西境風號',label:'西境舊哨 · 線索',line:'殘缺的調度碼越過了王國的邊界。它要帶我們去哪裡？',image:'assets/td/story/chapter2-western-signal-v1.png',focus:'center'},
    {title:'不急著相信',label:'第一次對話',line:'戈爾認得這枚舊印，卻不欠我們答案。先聽完他的條件。',image:'assets/td/story/chapter2-western-parley-v1.png',focus:'center'},
    {title:'護送這條路',label:'西行選擇',line:'讓信使與記錄安全通過，對話才有下一步。',image:'assets/td/story/chapter2-western-passage-v1.png',focus:'center'}
  ];
  westernsignal.aftermath='舊印被辨識為一條更早的中繼路名。荒野斥候同意帶來一位見證者；這是對話的開始，不是對任何勢力的定罪。';
  const emberroad={id:'chapter2-ember-road',chapter:2,name:'燼道相逢',map:'emberroad',hero:'hunter',faction:'hunter',difficulty:'story',requires:westernsignal.id,objective:'守住 7 波燼火商道，救出被追兵截斷的荒野小隊與補給車。',rewards:{maps:[]},discovered:['ember-road'],cinematic:['燒毀的補給車堵在商道旁，倖存者的求救訊號穿過煙塵。','荒野小隊沒有要求被拯救；他們要求先讓受傷者與車隊安全離開。','守住燼火商道。以行動換取第一次能被信任的對話。'],waves:[{name:'煙前斥候',hint:'先守住商道第一個彎；不要把所有火力壓在補給車旁。',groups:[{type:'grunt',count:7}]},{name:'車隊追兵',hint:'快速敵人會趁護送隊整隊逼近，預留一個能照顧中段的防點。',groups:[{type:'runner',count:6},{type:'halberdier',count:4}]},{name:'燼火煙障',hint:'燒毀補給車旁的煙障啟動：敵軍 +2 護甲；緩速、冰凍或定身可壓至 +1。',groups:[{type:'grunt',count:5},{type:'shaman',count:4}]},{name:'高台壓迫',hint:'盾衛與疾行敵人會擠過煙障；以控制拉開處理窗口，別只靠單點輸出。',groups:[{type:'fallenKnight',count:5},{type:'runner',count:4},{type:'warder',count:2}]},{name:'補給車急救',hint:'術士在後方施壓，巨獸則會穿過中段；群攻與單體都要有位置。',groups:[{type:'shaman',count:5},{type:'brute',count:3},{type:'halberdier',count:4}]},{name:'灰燼封路',hint:'重甲、怨靈與巨獸混編；煙障過後仍要在城門前保留補漏。',groups:[{type:'revenant',count:4},{type:'fallenKnight',count:4},{type:'brute',count:4}]},{name:'燼道相逢',hint:'最終護送：高速、秘法與重甲同時抵達。先用控制壓低煙障，再守住最後關口。',groups:[{type:'runner',count:7},{type:'shaman',count:4},{type:'brute',count:4},{type:'fallenKnight',count:4}]}]};
  emberroad.storyCards=[
    {title:'燼道相逢',label:'燼火商道 · 求救',line:'煙塵裡傳來短促的求救訊號；先讓人活下來。',image:'assets/td/ember-road-encounter-v1.png',focus:'48% 38%'},
    {title:'先護送，再交談',label:'荒野小隊',line:'他們不需要被收編；他們需要一條能安全離開的路。',image:'assets/td/ember-road-encounter-v1.png',focus:'54% 48%'},
    {title:'守住商道',label:'此刻的選擇',line:'補給車與受傷者過關後，才有第一次不靠武器的對話。',image:'assets/td/ember-road-encounter-v1.png',focus:'79% 67%'}
  ];
  emberroad.aftermath='小隊同意交換一段被燒毀的路名：他們的祖輩來自南方，但那段遷徙的理由仍不願由陌生人替他們下結論。';
  const chapter2Preview={id:'chapter2-western-signal-preview',chapter:2,previewOnly:true,name:'荒野的回聲',storyCards:[
    {title:'西境風號',label:'西境舊哨 · 線索',line:'殘缺的調度碼越過了王國的邊界。它要帶我們去哪裡？',image:'assets/td/story/chapter2-western-signal-v1.png',focus:'center'},
    {title:'不急著相信',label:'第一次對話',line:'戈爾認得這枚舊印，卻不欠我們答案。先聽完他的條件。',image:'assets/td/story/chapter2-western-parley-v1.png',focus:'center'},
    {title:'護送這條路',label:'西行選擇',line:'讓信使與記錄安全通過，對話才有下一步。',image:'assets/td/story/chapter2-western-passage-v1.png',focus:'center'}
  ],aftermath:'西方的記憶不會替任何人定罪；它只證明，調查必須跨過舊有的疆界。'};
  const missions=[mission,silverleaf,shadowfall,frostborn,westernsignal,emberroad];
  mission.waves=waves;
  class StoryWaves{constructor(selected=mission){this.mission=selected;}total(){return this.mission.waves.length;}get(wave){const source=this.mission.waves[wave-1];return source?{wave,name:source.name,hint:source.hint,threat:wave,spawnPace:source.spawnPace||1,groups:source.groups.map(g=>({...g})),reward:{gold:65+wave*15,lumber:2}}:null;}}
  ns.systems.StoryCatalog={mission,missions,chapter2Preview,getMission:id=>[...missions,chapter2Preview].find(m=>m.id===id)||null,StoryWaves,chapters:[{id:1,cinematicOnChapterStart:'prologue_before_shattered_peace',name:'破碎的和平',note:'四個故事任務逐步開放三張戰場；不宣告第一章真相已揭曉。'},{id:2,name:'荒野的回聲',note:'2-1 西境風號與 2-2 燼道相逢已可遊玩；荒野部族的完整玩法與解鎖仍等待後續任務。'}]};
})(globalThis.TowerFrontier);
