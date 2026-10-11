'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const {load}=require('./helpers/td-runtime.cjs');
function fixture(){const {ns}=load(),data=new Map(),store=new ns.systems.ProfileStore({getItem:k=>data.get(k)??null,setItem:(k,v)=>data.set(k,v)});ns.maps={definitions:Object.fromEntries(ns.systems.StoryCatalog.missions.map(m=>[m.map,{name:'測試地圖',asset:'map.png'}]))};const app=Object.create(ns.systems.FrontierApp.prototype);Object.assign(app,{store,root:{querySelector:()=>null}});return{ns,app,store};}
test('story details are separated from fixed mission controls without mutating progress',()=>{
  const {app,store}=fixture();app.storyMode='legacy';const before=store.export(),html=app.renderStory(store.current());
  assert.match(html,/campaign-fit/);assert.match(html,/class="mission-details" tabindex="0"/);assert.match(html,/<\/div><div class="mission-actions" aria-label="本關操作">/);
  assert.match(html,/data-action="manga-before"/);assert.match(html,/data-action="story-battle"/);assert.equal(store.export(),before);
});
test('locked mission controls do not claim playable access and admin uses preview actions',()=>{
  const {ns,app,store}=fixture();app.storyMode='legacy';app.selectedStoryMission=ns.systems.StoryCatalog.missions[1].id;
  const locked=app.renderStory(store.current());assert.match(locked,/<button type="button" disabled>先完成前一個任務/);
  store.switchTo('admin');const before=store.export(),admin=app.renderStory(store.current());assert.match(admin,/data-action="manga-admin-before"/);assert.equal(store.export(),before);
});
test('story viewport CSS scopes internal scrolling and preserves 44px action targets',()=>{
  const css=fs.readFileSync('td-lobby.css','utf8');
  assert.match(css,/#frontier-app\[data-page=story\] \.mission-intel\{[^}]*grid-template-rows:auto minmax\(0,1fr\) auto/);
  assert.match(css,/#frontier-app\[data-page=story\] \.mission-details\{[^}]*overflow:auto/);
  assert.match(css,/#frontier-app\[data-page=story\] \.mission-actions>button\{[^}]*min-height:44px!important/);
});
test('home and all mission groups use the new presentation without rewriting legacy gameplay',()=>{
  const {ns,app,store}=fixture(),before=store.export(),missionsBefore=JSON.stringify(ns.systems.StoryCatalog.missions);
  app.game={checkpoints:{read:()=>null}};
  const home=app.renderHome(store.current());
  assert.match(home,/古代到當代・共同城市的故事/);assert.match(home,/戰術關卡/);assert.match(home,/data-action="story-continue"/);
  assert.doesNotMatch(home,/破碎的和平|邊境烽火燃起|調查從谷地/);
  for(const mission of ns.systems.StoryCatalog.missions){
    app.storyMode='legacy';
    app.selectedStoryMission=mission.id;
    const html=app.renderStory(store.current()),view=ns.systems.StoryMangaFlow.missionPresentation(mission.id);
    assert(html.includes(view.title));assert(html.includes(view.objective));assert(html.includes(view.note));
    assert.doesNotMatch(html,/西行路線|士兵反叛|每次勝利只推進|推進故事線索|突然叛亂/);
    if(mission.id!=='chapter1-border')assert.match(html,/既有戰術挑戰/);
  }
  assert.equal(store.export(),before);assert.equal(JSON.stringify(ns.systems.StoryCatalog.missions),missionsBefore);
});
test('default story entry is nine chronological nodes with direct reading and a separate legacy tab',()=>{
  const {ns,app,store}=fixture(),before=store.export(),html=app.renderStory(store.current());
  assert.match(html,/story-timeline/);assert.equal((html.match(/data-action="story-node"/g)||[]).length,9);
  assert.match(html,/data-action="story-mode" data-value="legacy"/);assert.match(html,/data-action="manga-section"/);
  assert.doesNotMatch(html,/data-action="story-battle"|data-action="story-select"|map\.png/);
  const nodes=ns.systems.StoryMangaFlow.timeline(store.current(),false);
  assert.equal(nodes.filter(n=>n.kind==='battle').length,1);
  for(const node of nodes){app.selectedStoryNode=node.id;const view=app.renderStory(store.current());assert(view.includes(node.title));if(node.kind==='section'&&!node.locked)assert.doesNotMatch(view,/data-action="story-battle"/);}
  app.selectedStoryNode=nodes.find(n=>n.kind==='battle').id;
  assert.match(app.renderStory(store.current()),/data-action="story-battle"/);
  assert.equal(store.export(),before);
});
test('home continue locates the most recently read section without mutating legacy progress',()=>{
  const {ns,app,store}=fixture(),section=ns.systems.StoryMangaFlow.sections[3];
  store.adapter('manga').setItem('bookmark-v2',JSON.stringify({$lastSelection:'section:'+section.id}));
  const before=store.export(),html=app.renderStory(store.current());
  assert.equal(app.activeStoryNode.sectionId,section.id);assert(html.includes(section.title));assert.equal(store.export(),before);
});
