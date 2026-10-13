(function(ns){
  'use strict';
  // Presentation and battle progress are separate; never migrate saved mission IDs.
  const range=(first,last)=>Array.from({length:last-first+1},(_,i)=>first+i);
  let sections=[
    {id:'ancient-trade',title:'古代・各自的家與商路',era:'古代',pages:range(1,6)},
    {id:'ancient-city',title:'古代至當代・商鎮成為共同城市',era:'跨時',pages:range(7,11)},
    {id:'present-people',title:'當代・共同城市與各自的責任',era:'當代',pages:range(12,18)},
    {id:'present-incident',title:'當代・被中斷的日常',era:'當代',pages:range(19,24)},
    {id:'present-investigation',title:'當代・不能草率下結論',era:'當代',pages:range(25,30)},
    {id:'present-attack',title:'同期另一處・銀葉出兵',era:'當代',pages:range(35,37),requires:'chapter1-border'},
    {id:'present-cost',title:'同期另一處・維菈的代價',era:'當代',pages:range(38,41),requires:'chapter1-border'},
    {id:'present-records',title:'階段收束・仍能查證的事',era:'當代',pages:range(42,44),requires:'chapter1-border'}
  ];
  let missions={
    'chapter1-border':{title:'護證撤離・戰術重現',kind:'tactical-retelling',before:range(31,33),after:[34],note:'以既有戰場抽象重現雷恩保護證人與案卷撤離的防守目標；怪物、波次、地圖與地理不代表案發當夜的實際情況。'}
  };
  function configure(config){
    if(!config||!Array.isArray(config.sections)||!config.missions||typeof config.missions!=='object')throw Error('漫畫章節設定不完整');
    const ids=new Set(),validPages=list=>Array.isArray(list)&&list.length>0&&list.every(p=>Number.isInteger(p)&&p>=1&&p<=44)&&new Set(list).size===list.length;
    for(const section of config.sections){
      if(!section||typeof section.id!=='string'||!section.id||ids.has(section.id)||typeof section.title!=='string'||!validPages(section.pages))throw Error('漫畫選段頁碼或識別碼錯誤');
      if(section.requires&&!ns.systems.StoryCatalog.getMission(section.requires))throw Error('漫畫選段依賴不存在的任務');
      ids.add(section.id);
    }
    for(const [id,mission] of Object.entries(config.missions)){
      if(!ns.systems.StoryCatalog.getMission(id)||!mission||!validPages(mission.before)||!validPages(mission.after)||mission.before.some(p=>mission.after.includes(p)))throw Error('漫畫任務階段設定錯誤');
    }
    sections=config.sections.map(s=>({...s,pages:s.pages.slice()}));
    missions=Object.fromEntries(Object.entries(config.missions).map(([id,m])=>[id,{...m,before:m.before.slice(),after:m.after.slice()}]));
  }
  const getSection=id=>sections.find(item=>item.id===id)||null;
  const missionInfo=id=>missions[id]||null;
  function missionPresentation(id){
    const mission=ns.systems.StoryCatalog.getMission(id);if(!mission)return null;
    const info=missionInfo(id);
    return info?{...info,objective:'防守通道，保護證人與案卷撤離。',label:'新版主線・戰術重現'}:{
      title:mission.name,kind:'legacy-challenge',label:'既有戰術挑戰',
      objective:mission.previewOnly?'既有預覽項目，沒有可開始的戰鬥。':'在既有戰場抵擋 '+(mission.waves?.length||0)+' 波敵人，完成防守目標。',
      note:'保留原關卡、玩法、獎勵與進度；這是既有戰術挑戰，並非新版主線時序，也沒有對應本弧漫畫。'
    };
  }
  function chapterPresentation(chapter){
    return {title:chapter===1?'護證撤離與既有挑戰':'既有戰術挑戰・第 '+chapter+' 組',label:chapter===1?'主線重現／既有挑戰':'既有挑戰分組',note:chapter===1?'世界前情分段閱讀；護證撤離有獨立戰前與戰後，其餘關卡保留既有玩法。':'此分組只保留既有戰鬥與解鎖順序，不代表新版主線已經進行至此。'};
  }
  function resolve(request,profile,admin){
    if(!request||typeof request!=='object')return null;
    const preview=Boolean(request.preview&&admin),completed=Array.isArray(profile?.completed)?profile.completed:[];
    if(request.preview&&!admin)return null;
    if(request.sectionId){
      const section=getSection(request.sectionId);
      if(!section||!preview&&(section.pending||section.requires&&!completed.includes(section.requires)))return null;
      return {...section,key:'section:'+section.id,phase:'section',preview};
    }
    const mission=ns.systems.StoryCatalog.getMission(request.missionId),info=missionInfo(request.missionId);
    if(!mission||!info||!['before','after'].includes(request.phase))return null;
    if(request.phase==='after'&&!completed.includes(mission.id)&&!preview)return null;
    if(request.phase==='before'&&mission.requires&&!completed.includes(mission.requires)&&!preview)return null;
    return {key:mission.id+':'+request.phase,title:info.title+'・'+(request.phase==='before'?'戰前':'戰後'),era:'當代',pages:info[request.phase].slice(),phase:request.phase,missionId:mission.id,preview,note:info.note};
  }
  function pagesFor(selection,catalog=ns.systems.StoryMangaCatalog){
    if(!selection||!Array.isArray(catalog))return [];
    const result=selection.pages.map(number=>catalog.find((page,index)=>(page.storyPage??index+1)===number));
    return result.every(Boolean)?result:[];
  }
  function timeline(profile,admin=false){
    const nodes=sections.map(section=>({
      id:section.id,kind:'section',sectionId:section.id,title:section.title,era:section.era,
      pages:section.pages.slice(),firstPage:section.pages[0],note:section.requires?'完成護證撤離後開放；這是同期另一處的事件。':'主線會依序銜接；「只回顧本段」讀完返回目錄。',
      locked:!resolve({sectionId:section.id,preview:admin},profile,admin),selectionKeys:['section:'+section.id]
    }));
    for(const [id,info] of Object.entries(missions))nodes.push({
      id:'battle:'+id,kind:'battle',missionId:id,title:info.title,era:'當代',
      pages:[...info.before,...info.after],firstPage:info.before[0],note:info.note,
      before:info.before.slice(),after:info.after.slice(),
      locked:!resolve({missionId:id,phase:'before',preview:admin},profile,admin),
      afterLocked:!resolve({missionId:id,phase:'after',preview:admin},profile,admin),
      selectionKeys:[id+':before',id+':after']
    });
    return nodes.sort((a,b)=>a.firstPage-b.firstPage);
  }
  ns.systems.StoryMangaFlow={version:'2.0.0',get sections(){return sections;},configure,missionInfo,missionPresentation,chapterPresentation,getSection,resolve,pagesFor,timeline};
})(globalThis.TowerFrontier);
