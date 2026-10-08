(function(){
  'use strict';
  const {GameAudio:A,AudioCatalog:C,HeroRoster:R}=TowerFrontier.systems;
  A.volume=.35;
  const status=document.getElementById('status');
  const play=async(cue,label)=>{A.stop();A.unlock();try{await A.context?.resume();status.textContent=A.play(cue)?'試聽：'+label:'無法播放，請確認瀏覽器音訊與音量設定';}catch(_){status.textContent='此裝置暫時無法播放音效';}};
  function button(parent,label,cue){const b=document.createElement('button');b.textContent=label;b.onclick=()=>play(cue,label);parent.append(b);}
  for(const [id,hero] of Object.entries(R.CLASSES)){const row=document.createElement('div'),name=document.createElement('strong');row.className='row';name.textContent=hero.name;row.append(name);['q','w','e','f'].forEach((slot,i)=>button(row,slot.toUpperCase()+' '+(hero.skills[i]||'大絕'),C.skill(id,slot)));document.getElementById('heroes').append(row);}
  const familyNames={blade:'刀刃',arrow:'弓弩',gun:'火銃／鉚釘',siege:'重砲',ice:'冰晶',fire:'烈焰',lightning:'雷電',tide:'潮水',shadow:'暗影',nature:'自然',stone:'巨石／重錘',arcane:'奧術',support:'支援'};
  for(const [id,layers] of Object.entries(C.families))button(document.getElementById('families'),familyNames[id],{key:'preview:'+id,layers,priority:2});
  const eventNames={click:'點擊',error:'條件不足',build:'建造',upgrade:'升級',purchase:'購買',sell:'出售',loot:'戰利品',wave:'開波',boss:'首領',clear:'守成',victory:'勝利',defeat:'戰敗',hurt:'英雄受擊',down:'英雄倒下',death:'敵人倒下',leak:'城門失守'};
  for(const id of Object.keys(C.events))button(document.getElementById('events'),eventNames[id],C.event(id));
  document.getElementById('volume').oninput=e=>A.setVolume(e.target.value/100);
  document.getElementById('stop').onclick=()=>{A.stop();status.textContent='已停止';};
  document.addEventListener('visibilitychange',()=>{if(document.hidden)A.stop();});addEventListener('pagehide',()=>A.stop());
})();
