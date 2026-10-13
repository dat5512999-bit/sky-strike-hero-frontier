(function(ns){
  'use strict';
  // Campaign navigation is separate from read-only chapter review and battle rewards.
  const KEY='campaign-v1',reader=()=>ns.systems.StoryManga,flow=()=>ns.systems.StoryMangaFlow;
  const profile=app=>app.store.current();
  const identity=app=>{const p=profile(app);return p.id+':'+p.round;};
  const steps=()=>flow().timeline({completed:[]},false).flatMap(node=>node.kind==='battle'
    ?[{key:node.missionId+':before',missionId:node.missionId,phase:'before'},{key:node.missionId+':after',missionId:node.missionId,phase:'after'}]
    :[{key:'section:'+node.sectionId,sectionId:node.sectionId}]);
  const campaign={
    KEY,identity,steps,
    saved(app){try{const value=JSON.parse(app.store.adapter('manga').getItem(KEY)||'null');return value&&typeof value.key==='string'?value:null;}catch(_){return null;}},
    save(app,request,pageId){
      if(app.store.isAdmin())return true;
      try{app.store.adapter('manga').setItem(KEY,JSON.stringify({key:request.key,pageId}));return true;}
      catch(_){if(app.manga)app.manga.error='主線續玩位置未能儲存；仍可繼續。請先匯出備份，勿清除瀏覽器資料。';return false;}
    },
    open(app,step,pageId){return reader().open(app,{...step,campaign:true,pageId});},
    start(app,nodeId){
      const route=steps(),saved=nodeId?null:campaign.saved(app);
      const node=nodeId&&flow().timeline(profile(app),false).find(n=>n.id===nodeId);
      if(nodeId&&(!node||node.locked))return false;
      const key=node?(node.kind==='battle'?node.missionId+':before':'section:'+node.sectionId):saved?.key;
      const selected=route.find(s=>s.key===key)||route[0];
      if(!selected)return false;
      // Imported/stale checkpoints must not bypass actual battle completion.
      if(!flow().resolve(selected,profile(app),false)){
        const prerequisite=selected.missionId||flow().getSection(selected.sectionId)?.requires;
        const before=route.find(s=>s.missionId===prerequisite&&s.phase==='before');
        return before?campaign.open(app,before):false;
      }
      return campaign.open(app,selected,saved?.pageId);
    },
    next(app){
      const state=app.manga;if(!state?.campaign||!reader().authorized(app))return false;
      if(state.selection.phase==='before')return campaign.fight(app);
      const route=steps(),index=route.findIndex(s=>s.key===state.selection.key),next=route[index+1];
      if(next)return campaign.open(app,next);
      reader().returnToChapters(app);app.message='本篇主線已讀完。後續故事尚未開放；可以回顧章節，或到「既有挑戰」繼續遊玩。';app.render();return true;
    },
    fight(app){
      const state=app.manga,mission=app.mangaMission;
      if(!state?.campaign||state.selection.phase!=='before'||!reader().authorized(app)||state.selection.missionId!==mission?.id||mission.previewOnly)return false;
      if(state.index!==reader().currentPages(app).length-1)return false;
      if(mission.requires&&!profile(app).completed.includes(mission.requires))return false;
      if(app.page!=='story-manga'&&app.page!=='mission-brief')return false;
      // The same final-page click cannot launch twice after the reader becomes hidden.
      if(app.root.hidden||app.campaignLaunching)return false;
      app.campaignLaunching=true;
      try{reader().save(app);reader().cancelPreload(app);return app.launchStory(mission);}finally{app.campaignLaunching=false;}
    },
    afterBattle(app,mission){
      if(!profile(app).completed.includes(mission.id)||app.lastStoryOutcome?.saved===false||app.lastStoryOutcome?.victory===false)return false;
      if(app.lastStoryOutcome&&app.lastStoryOutcome.owner!==identity(app))return false;
      if(app.lastStoryOutcome&&app.lastStoryOutcome.missionId!==mission.id)return false;
      if(app.openStoryMap()===false)return false;
      return campaign.open(app,{key:mission.id+':after',missionId:mission.id,phase:'after'});
    },
    recordOutcome(app,victory,result){
      if(result?.mode!=='story')return;
      app.lastStoryOutcome={victory,saved:result.saved,missionId:result.mission.id,owner:identity(app)};
      if(victory&&result.saved&&flow().missionInfo(result.mission.id))campaign.save(app,{key:result.mission.id+':after'});
    }
  };
  ns.systems.StoryCampaign=campaign;
})(globalThis.TowerFrontier);
