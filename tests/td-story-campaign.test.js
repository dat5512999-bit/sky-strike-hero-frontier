'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {load}=require('./helpers/td-runtime.cjs');
function fixture(){
  const {ns,context}=load(),data=new Map(),store=new ns.systems.ProfileStore({getItem:k=>data.get(k)??null,setItem:(k,v)=>data.set(k,v)});
  const app=Object.create(ns.systems.FrontierApp.prototype);
  Object.assign(app,{store,game:{paused:false},root:{hidden:false,querySelector:()=>null},render(){},show(page){this.page=page;this.root.hidden=false;},launchStory(m){this.launched=m;this.launches=(this.launches||0)+1;this.root.hidden=true;this.mode='story';return true;},openStoryMap(){this.show('story');return true;}});
  return {ns,context,app,store,reader:ns.systems.StoryManga,campaign:ns.systems.StoryCampaign};
}
const finish=f=>{f.reader.turn(f.app,999);return f.app.act('manga-next');};
test('main story follows all prelude sections into before-battle; only the final explicit action starts combat',()=>{
  const f=fixture(),{app,reader,store}=f;app.act('story-continue');assert.equal(app.page,'story-manga');assert(app.manga.campaign);
  const seen=[];while(app.manga.selection.phase==='section'){seen.push(...reader.currentPages(app).map(p=>p.storyPage));finish(f);assert.equal(app.page,'story-manga');assert.equal(app.launches,undefined);}
  assert.deepEqual(seen,Array.from({length:30},(_,i)=>i+1));assert.equal(app.manga.selection.phase,'before');
  app.handleStoryKey({key:'End',target:{tagName:'BUTTON'},preventDefault(){}});assert.equal(app.launches,undefined);
  assert.match(reader.render(app),/劇情讀完・開始戰鬥/);finish(f);assert.equal(app.launches,1);assert.equal(app.launched.id,'chapter1-border');
  app.act('manga-next');assert.equal(app.launches,1);assert.equal(store.current().completed.length,0);
});
test('chapter review never starts battles and cannot overwrite the independent campaign checkpoint',()=>{
  const f=fixture(),{app,campaign,reader}=f;app.act('story-continue');reader.turn(app,2);const saved=campaign.saved(app);
  app.act('manga-before','chapter1-border');finish(f);assert.equal(app.page,'story');assert.equal(app.launches,undefined);
  assert.equal(app.act('manga-fight'),false);assert.deepEqual(campaign.saved(app),saved);
  app.act('story-continue');assert.equal(reader.currentPages(app)[app.manga.index].id,saved.pageId);
});
test('selected playable mission starts at its first pre-battle page, ignoring review bookmark',()=>{
  const f=fixture(),{app,reader}=f;app.act('manga-before','chapter1-border');reader.turn(app,2);
  app.act('story-battle','chapter1-border');assert.equal(app.manga.index,0);assert(app.manga.campaign);assert.equal(reader.currentPages(app)[0].storyPage,31);
  assert.equal(app.act('manga-fight'),false);assert.equal(app.launches,undefined);
});
test('saved victory resumes after-battle and continues through remaining story, never an unrelated legacy battle',()=>{
  const f=fixture(),{app,store,ns,campaign,reader}=f,m=ns.systems.StoryCatalog.mission;
  app.activeStoryMission=m;store.complete(m);campaign.recordOutcome(app,true,{mode:'story',mission:m,saved:true});
  assert.equal(campaign.saved(app).key,m.id+':after');app.act('story-continue');assert.equal(reader.currentPages(app)[0].storyPage,34);
  assert.equal(app.openNextStory(),true);finish(f);assert.equal(reader.currentPages(app)[0].storyPage,35);
  finish(f);finish(f);finish(f);assert.equal(app.page,'story');assert.match(app.message,/後續故事尚未開放/);assert.equal(app.launches,undefined);
});
test('loss or failed save cannot advance even when the mission was completed in an older run',()=>{
  for(const [victory,saved] of [[false,undefined],[true,false]]){
    const f=fixture(),{app,store,ns,campaign}=f,m=ns.systems.StoryCatalog.mission;store.complete(m);app.activeStoryMission=m;
    app.act('story-battle',m.id);const checkpoint=campaign.saved(app);campaign.recordOutcome(app,victory,{mode:'story',mission:m,saved});
    assert.equal(app.openNextStory(),false);assert.deepEqual(campaign.saved(app),checkpoint);
  }
});
test('checkpoint corruption, missing pages, locked sections and profile switches fail safely',()=>{
  const f=fixture(),{app,campaign,store,reader}=f;
  store.adapter('manga').setItem(campaign.KEY,'broken');assert.equal(app.act('story-continue'),true);
  store.adapter('manga').setItem(campaign.KEY,JSON.stringify({key:'section:present-attack'}));app.act('story-continue');assert.equal(app.manga.selection.phase,'before');
  assert.equal(app.act('manga-campaign','present-attack'),false);assert.equal(app.act('manga-campaign','unknown'),false);
  store.newRound();assert.equal(reader.turn(app,999),false);assert.equal(app.act('manga-next'),false);
  app.act('story-continue');assert.equal(app.manga.index,0);assert.equal(app.manga.selection.key,'section:ancient-trade');
  reader.pages.splice(31,1);assert.equal(app.act('story-battle','chapter1-border'),false);assert.equal(app.launches,undefined);
});
test('administrator preview remains read-only and campaign does not grant battle clears by reading',()=>{
  const f=fixture(),{app,store,reader}=f;store.switchTo('admin');const before=store.export();
  app.act('manga-admin-after','chapter1-border');finish(f);assert.equal(app.page,'story');assert.equal(store.export(),before);
  app.act('story-continue');reader.turn(app,1);assert.equal(store.export(),before);
});
test('retry passes the active story mission instead of silently restarting the first mission',()=>{
  const {ns}=load(),game=Object.create(ns.TDGame.prototype),mission=ns.systems.StoryCatalog.missions[3];
  game.app={mode:'story',activeStoryMission:mission,launchStory(m){assert.equal(m,mission);return true;}};
  assert.equal(game.retrySameSetup(),true);
});
test('actual battle completion hook records campaign aftermath only after successful mission persistence',()=>{
  const f=fixture(),{app,store,ns,campaign}=f;app.mode='story';app.activeStoryMission=ns.systems.StoryCatalog.mission;
  let result=app.onBattleEnd(true);assert.equal(result.saved,true);assert.equal(campaign.saved(app).key,'chapter1-border:after');
  app.act('story-battle','chapter1-border');const before=campaign.saved(app);
  store.storage.setItem=()=>{throw Error('quota');};result=app.onBattleEnd(true);
  assert.equal(result.saved,false);assert.deepEqual(campaign.saved(app),before);assert.equal(app.openNextStory(),false);
});
test('campaign storage failure is immediately visible while reading remains usable',()=>{
  const f=fixture(),{app,store,reader}=f,note={textContent:''};app.act('story-continue');
  app.root.querySelector=selector=>selector==='.manga-save-note'?note:null;store.storage.setItem=()=>{throw Error('quota');};
  assert.equal(reader.save(app),false);assert.match(note.textContent,/主線續玩位置未能儲存/);assert.equal(reader.turn(app,1),true);
  assert.match(note.textContent,/仍可繼續/);assert.equal(store.current().completed.length,0);
});
