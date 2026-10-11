(function(){
  'use strict';
  const {GameAudio:A,AudioCatalog:C,HeroRoster:R}=TowerFrontier.systems;
  A.volume=.35;
  const status=document.getElementById('status');
  const play=async(cue,label)=>{A.stop();A.unlock();try{await A.context?.resume();status.textContent=A.play(cue)?'試聽：'+label:'無法播放，請確認瀏覽器音訊與音量設定';}catch(_){status.textContent='此裝置暫時無法播放音效';}};
  function button(parent,label,cue){const b=document.createElement('button');b.textContent=label;b.onclick=()=>play(cue,label);parent.append(b);}
  const bull=document.createElement('section');bull.id='bull-audition';
  bull.innerHTML='<h2>戰牛專屬音效 · 新舊比較</h2><p>新版以揮槌、鐵器共鳴、撞地、碎石組成；人物配音採已確認的粗獷聲線（AI 生成及後製，非真人錄音）。</p>';
  document.getElementById('heroes').closest('section').before(bull);
  button(bull,'新版：揮槌',C.bull('attack'));button(bull,'新版：命中',C.bull('hit'));
  for(const slot of ['q','w','e','f']){const row=document.createElement('div');row.className='row';button(row,'舊版 '+slot.toUpperCase(),C.skill('bull',slot,true));button(row,'新版 '+slot.toUpperCase(),C.skill('bull',slot));bull.append(row);}
  const voices=document.createElement('div');voices.innerHTML='<h3>配音台詞與素材狀態</h3>';
  const V=TowerFrontier.systems.HeroVoice;V.volume=A.volume;
  for(const [slot,cue] of Object.entries(V.catalog.bull)){const row=document.createElement('p');row.textContent=(slot==='select'?'選角':slot.toUpperCase())+'：'+cue.text+'（'+(V.available('bull',slot)?'已有素材':'待配音')+'）';voices.append(row);if(V.available('bull',slot)){const b=document.createElement('button');b.textContent='試聽 '+(slot==='select'?'選角':slot.toUpperCase())+' 語音';b.onclick=async()=>{A.stop();A.unlock();try{await A.context?.resume();status.textContent=await V.play('bull',slot,{preview:true})?'正在播放人物語音：'+cue.text:'語音暫時無法播放，請檢查音量與檔案';}catch(_){status.textContent='語音暫時無法播放';}};voices.append(b);}}
  bull.append(voices);
  const characters=[['goblin','地精','鉚釘發射、齒輪卡榫、蒸汽洩壓與機械啟動'],['naga','娜迦','破水突刺、旋流、海螺號令與浪潮衝擊'],
    ['hunter','王國獵手','弓弦、木質命中、連射與集結號角'],['arcanist','精靈','奧術共鳴、晶體碎裂、冰霜與雷光'],['rogue','暗影','短促刀刃、低沉影霧與連續斬擊'],
    ['chief','大酋長','木槌、部族戰鼓、號角與烈火'],['frostland','霜原','冰刃、冰晶碎裂、寒風與北境號角'],['dwarf','矮人','鍛鐵重擊、火爐、符文與金屬共鳴'],
    ['dragonkin','龍脈','雷裂、烈焰、刀刃與低沉號角'],['egypt','埃及島','沙粒摩擦、彎刃、古老金屬與秘術共鳴']];
  const jumpLabel=document.createElement('label'),jump=document.createElement('select');jump.id='character-jump';jumpLabel.htmlFor=jump.id;jumpLabel.textContent='快速前往角色：';
  for(const [id,label] of [['bull','戰牛'],...characters]){const option=document.createElement('option');option.value=id;option.textContent=label;jump.append(option);}
  jump.onchange=()=>document.getElementById(jump.value+'-audition')?.scrollIntoView({block:'start'});jumpLabel.append(jump);bull.before(jumpLabel);
  for(const [hero,label,description] of characters){
    const section=document.createElement('section');section.id=hero+'-audition';
    const heading=document.createElement('h2');heading.textContent=label+'專屬戰鬥音效 · 新舊比較';
    const note=document.createElement('p');note.textContent=description+'。原創合成材質音效；此批沒有新增人物配音。';section.append(heading,note);
    button(section,label+'：普攻',C.character(hero,'attack'));button(section,label+'：命中',C.character(hero,'hit'));
    for(const slot of ['q','w','e','f']){const row=document.createElement('div');row.className='row';button(row,label+' 舊版 '+slot.toUpperCase(),C.skill(hero,slot,true));button(row,label+' 新版 '+slot.toUpperCase(),C.skill(hero,slot));section.append(row);}
    document.getElementById('heroes').closest('section').before(section);
  }
  for(const [id,hero] of Object.entries(R.CLASSES)){const row=document.createElement('div'),name=document.createElement('strong');row.className='row';name.textContent=hero.name;row.append(name);['q','w','e','f'].forEach((slot,i)=>button(row,slot.toUpperCase()+' '+(hero.skills[i]||'大絕'),C.skill(id,slot)));document.getElementById('heroes').append(row);}
  const familyNames={blade:'刀刃',arrow:'弓弩',gun:'火銃／鉚釘',siege:'重砲',ice:'冰晶',fire:'烈焰',lightning:'雷電',tide:'潮水',shadow:'暗影',nature:'自然',stone:'巨石／重錘',arcane:'奧術',support:'支援'};
  for(const [id,layers] of Object.entries(C.families))button(document.getElementById('families'),familyNames[id],{key:'preview:'+id,layers,priority:2});
  const eventNames={click:'點擊',error:'條件不足',build:'建造',upgrade:'升級',purchase:'購買',sell:'出售',loot:'戰利品',wave:'開波',boss:'首領',clear:'守成',victory:'勝利',defeat:'戰敗',hurt:'英雄受擊',down:'英雄倒下',death:'敵人倒下',leak:'城門失守'};
  for(const id of Object.keys(C.events))button(document.getElementById('events'),eventNames[id],C.event(id));
  document.getElementById('volume').oninput=e=>{A.setVolume(e.target.value/100);V.setVolume(e.target.value/100);};
  document.getElementById('stop').onclick=()=>{A.stop();status.textContent='已停止';};
  document.addEventListener('visibilitychange',()=>{if(document.hidden)A.stop();});addEventListener('pagehide',()=>A.stop());
})();
