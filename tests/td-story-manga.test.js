'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const {load}=require('./helpers/td-runtime.cjs');
const plain=v=>JSON.parse(JSON.stringify(v));
function fixture(){
  const {ns}=load(),data=new Map(),store=new ns.systems.ProfileStore({getItem:k=>data.get(k)??null,setItem:(k,v)=>data.set(k,v)});
  const app=Object.create(ns.systems.FrontierApp.prototype);
  Object.assign(app,{store,game:{paused:false},root:{querySelector:()=>null},show(page){this.page=page;},render(){},launchStory(m){this.launched=m;return true;},storyMusic:{enabled:true,setEnabled(v){this.enabled=v;},stop(){}}});
  return {ns,app,store,data,reader:ns.systems.StoryManga,flow:ns.systems.StoryMangaFlow};
}
function synthetic(f){
  // Control-flow tests do not depend on production image-generation timing.
  f.ns.systems.StoryMangaCatalog=Array.from({length:44},(_,i)=>({id:'v2-'+(i+1),storyPage:i+1,era:i<10?'古代篇':i===10?'跨時篇':'當代篇',title:'第'+(i+1)+'頁',image:'assets/td/story/manga/v2-'+(i+1)+'.webp',summary:'測試',mood:'hope',text:['甲：等一下。','乙：我在這裡。']}));
  f.flow.configure({sections:[{id:'intro',title:'古代',pages:[1,2,3]},{id:'late',title:'同期',pages:[35,36],requires:'chapter1-border'}],missions:{'chapter1-border':{title:'測試護證',before:[31,32,33],after:[34],note:'測試映射，非正式正史'}}});return f;
}
test('production catalog uses unique existing art and complete, valid metadata',()=>{
  const{ns}=load(),pages=ns.systems.StoryManga.pages;
  assert.equal(pages.length,44);assert.equal(new Set(pages.map(p=>p.image)).size,pages.length);
  for(const p of pages){assert(fs.existsSync(p.image),p.image);assert(!p.image.includes('concepts'));assert(ns.systems.StoryMusic.THEMES[p.mood]);assert(p.text.length>0);}
  assert.equal(pages.filter(p=>p.era==='古代篇').length,10);assert.match(pages[10].era,/跨時|年代轉場/);assert.match(pages[11].era,/當代/);
});
test('story/cinematic/replay entry opens chapter selection, not an entire book',()=>{
  const {app}=fixture();for(const action of ['story','replay','manga-open']){app.act(action);assert.equal(app.page,'story');assert.equal(app.manga,undefined);}app.startCinematic();assert.equal(app.page,'story');assert.equal(app.launched,undefined);
});
test('reader only contains the selected section; end and keyboard cannot cross it',()=>{
  const f=synthetic(fixture()),{app,reader}=f;app.act('manga-section','intro');assert.equal(app.page,'story-manga');
  assert.deepEqual(plain(reader.currentPages(app).map(p=>p.storyPage)),[1,2,3]);
  app.handleStoryKey({key:'End',target:{tagName:'BUTTON'},preventDefault(){}});assert.equal(app.manga.index,2);
  reader.turn(app,999);assert.equal(app.manga.index,2);app.act('manga-next');assert.equal(app.page,'story');assert.equal(app.launched,undefined);
  assert.equal(reader.turn(app,NaN),false);
});
test('before and after require their own access checks; spoofed preview grants nothing',()=>{
  const f=synthetic(fixture()),{app,reader,store,ns}=f;
  assert.equal(app.act('manga-after','chapter1-border'),false);assert.equal(app.page,'story');
  assert.equal(app.act('manga-admin-after','chapter1-border'),false);
  assert.equal(reader.open(app,{missionId:'chapter1-border',phase:'after',preview:true}),false);
  assert.equal(app.act('manga-section','late'),false);
  app.act('manga-before','chapter1-border');assert.deepEqual(plain(reader.currentPages(app).map(p=>p.storyPage)),[31,32,33]);
  reader.turn(app,2);app.act('manga-next');assert.equal(app.page,'story');assert.equal(app.launched,undefined);
  app.act('story-battle','chapter1-border');reader.turn(app,2);
  assert.equal(store.current().completed.length,0);app.act('manga-fight');assert.equal(app.launched.id,'chapter1-border');assert.equal(store.current().completed.length,0);
  store.complete(ns.systems.StoryCatalog.mission);app.act('manga-after','chapter1-border');assert.deepEqual(plain(reader.currentPages(app).map(p=>p.storyPage)),[34]);
  app.act('manga-next');assert.equal(app.page,'story');app.act('manga-section','late');assert.equal(app.page,'story-manga');
});
test('admin previews never write bookmarks, progress, rewards or player state',()=>{
  const f=synthetic(fixture()),{app,store,reader}=f;store.switchTo('admin');const before=store.export();
  app.act('manga-admin-after','chapter1-border');assert.equal(app.page,'story-manga');assert(app.manga.selection.preview);
  reader.turn(app,99);app.act('manga-text');app.act('manga-exit');app.act('manga-section','late');app.act('manga-exit');
  assert.equal(store.export(),before);store.switchTo('test');assert.equal(store.current().completed.length,0);
});
test('bookmarks are per selection and per profile, included in backup, with old key preserved',()=>{
  const f=synthetic(fixture()),{app,store,reader}=f;store.adapter('manga').setItem('bookmark-v1','present-2');
  app.act('manga-section','intro');reader.turn(app,2);app.act('manga-exit');app.act('manga-before','chapter1-border');reader.turn(app,1);
  app.act('manga-section','intro');assert.equal(app.manga.index,2);assert.equal(store.adapter('manga').getItem('bookmark-v1'),'present-2');
  assert.equal(reader.lastSelection(store),'section:intro');assert.equal(app.storyMode,'timeline');
  assert.match(store.export(),/manga:bookmark-v2/);store.newRound();app.act('manga-section','intro');assert.equal(app.manga.index,0);
});
test('malformed bookmarks and storage failure remain readable without corrupting progress',()=>{
  const f=synthetic(fixture()),{app,store,reader}=f;store.adapter('manga').setItem(reader.KEY,'[malformed');
  app.act('manga-section','intro');assert.equal(app.manga.index,0);
  const current=store.current();app.store={current:()=>current,isAdmin:()=>false,adapter:()=>({getItem(){throw Error('quota');},setItem(){throw Error('quota');}})};
  assert.doesNotThrow(()=>reader.save(app));assert.match(app.manga.error,/未能儲存/);assert.match(reader.render(app),/未能儲存/);
});
test('unsafe titles and transcripts are escaped; tools remain accessible',()=>{
  const f=synthetic(fixture()),{app,reader}=f;app.act('manga-section','intro');reader.pages[0].title='<img onerror=bad>';reader.pages[0].text=['<script>bad</script>'];
  const html=reader.render(app);assert.match(html,/&lt;img onerror=bad&gt;/);assert.match(html,/&lt;script&gt;/);assert.doesNotMatch(html,/<script>/);
  for(const action of ['manga-retry','manga-zoom','manga-text'])assert(html.includes(action));assert.match(html,/古代篇/);
});
test('missing selected art never falls back to unrelated pages; unknown mission/section fail safely',()=>{
  const f=synthetic(fixture()),{app,reader}=f;reader.pages.splice(32,1);assert.equal(app.act('manga-before','chapter1-border'),false);assert.match(app.message,/尚未完整/);
  assert.equal(app.act('manga-section','not-real'),false);assert.equal(app.act('manga-before','not-real'),false);
});
test('flow configuration validates bounds, duplicates, overlap and saved mission identities',()=>{
  const {flow}=fixture();for(const pages of [[0],[45],[1,1],[],[1.5]])assert.throws(()=>flow.configure({sections:[{id:'s',title:'S',pages}],missions:{}}));
  assert.throws(()=>flow.configure({sections:[],missions:{'missing-id':{before:[1],after:[2]}}}));
  assert.throws(()=>flow.configure({sections:[],missions:{'chapter1-border':{before:[1],after:[1]}}}));
  assert.throws(()=>flow.configure({sections:[{id:'s',title:'S',pages:[1],requires:'missing-id'}],missions:{}}));
});
test('production mapping covers 44 pages exactly once without forcing unrelated battles into canon',()=>{
  const {flow,ns}=fixture(),info=flow.missionInfo('chapter1-border');assert.deepEqual(plain(info.before),[31,32,33]);assert.deepEqual(plain(info.after),[34]);
  const pages=[...flow.sections.flatMap(s=>s.pages),...info.before,...info.after].sort((a,b)=>a-b);assert.deepEqual(plain(pages),Array.from({length:44},(_,i)=>i+1));
  assert(flow.sections.every(s=>!s.pending));for(const s of flow.sections.filter(s=>s.pages[0]>=35))assert.equal(s.requires,'chapter1-border');
  assert.match(info.note,/抽象重現/);assert.match(info.note,/不代表案發當夜/);
  for(const m of ns.systems.StoryCatalog.missions.slice(1)){assert.equal(flow.missionInfo(m.id),null);const display=flow.missionPresentation(m.id);assert.equal(display.kind,'legacy-challenge');assert.match(display.note,/並非新版主線時序/);assert.doesNotMatch(display.objective,/叛亂|追兵|兇手|調查隊/);}
  for(let i=1;i<=4;i++)assert.doesNotMatch(flow.chapterPresentation(i).note,/叛亂|西行路線/);
  const nodes=flow.timeline({completed:[]});assert.equal(nodes.length,9);assert.deepEqual(plain(nodes.map(n=>n.firstPage)),[1,7,12,19,25,31,35,38,42]);assert.equal(nodes[5].kind,'battle');assert(nodes[5].afterLocked);assert(nodes.slice(6).every(n=>n.locked));
  assert(flow.timeline({completed:['chapter1-border']}).every(n=>!n.locked));assert(flow.timeline({completed:[]},true).every(n=>!n.locked));
});
test('reader exits return to its timeline node; legacy brief stays in the existing-challenge tab',()=>{
  const f=synthetic(fixture()),{app,reader,ns}=f;app.storyMode='legacy';app.act('manga-section','intro');reader.turn(app,2);app.act('manga-next');assert.equal(app.storyMode,'timeline');assert.equal(app.selectedStoryNode,'intro');
  reader.brief(app,ns.systems.StoryCatalog.getMission('chapter1-silverleaf'));app.act('manga-missions');assert.equal(app.storyMode,'legacy');
  app.act('story');assert.equal(app.storyMode,'timeline');
});
test('completed mapped battle continues to its after phase, never to an unrelated old chapter',()=>{
  const f=synthetic(fixture()),{app,store,ns,reader}=f;app.activeStoryMission=ns.systems.StoryCatalog.mission;
  app.openStoryMap=function(){this.storyMode='timeline';this.show('story');return true;};
  assert.equal(app.openNextStory(),false);store.complete(app.activeStoryMission);assert.equal(app.openNextStory(),true);
  assert.deepEqual(plain(reader.currentPages(app).map(p=>p.storyPage)),[34]);assert.equal(app.selectedStoryMission,undefined);
});
test('publisher includes runtime manga only and ships the phase router',()=>{
  const plan=require('../scripts/build-static-site.cjs').plan(),files=new Set(plan.files.map(f=>f.path)),{ns}=load();
  for(const p of ns.systems.StoryManga.pages)assert(files.has(p.image));
  for(const name of ['StoryManga.js','StoryMangaCatalog.js','StoryMangaFlow.js']){assert(fs.readFileSync('sw.js','utf8').includes(name));assert(fs.readFileSync('td.html','utf8').includes(name));}
  assert.match(fs.readFileSync('td-story-manga.css','utf8'),/object-fit:contain/);
});
