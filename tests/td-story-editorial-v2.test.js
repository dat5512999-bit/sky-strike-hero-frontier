'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const {load}=require('./helpers/td-runtime.cjs');
const {plan}=require('../scripts/build-static-site.cjs');
const reviewPath='assets/td/concepts/story-comic-v2/production-review.json';
const read=p=>fs.readFileSync(p,'utf8');

test('editorial correction preserves every mission gameplay field and wave payload',()=>{
  const previous={TowerFrontier:{systems:{}}};
  vm.runInNewContext(read('assets/td/concepts/story-comic-v2/StoryCatalog-before-0.85.95.js'),previous);
  const {ns}=load(),current=ns.systems.StoryCatalog;
  const gameplay=mission=>{
    const {objective,cinematic,storyCards,aftermath,...rest}=mission;
    return {...rest,waves:rest.waves?.map(({hint,...wave})=>wave)};
  };
  assert.equal(JSON.stringify(current.missions.map(gameplay)),JSON.stringify(previous.TowerFrontier.systems.StoryCatalog.missions.map(gameplay)));
  assert.equal(JSON.stringify(gameplay(current.chapter2Preview)),JSON.stringify(gameplay(previous.TowerFrontier.systems.StoryCatalog.chapter2Preview)));
});

test('runtime wording uses Rhen and distinguishes real assault from tutorial instructions',()=>{
  const {ns}=load(),catalog=ns.systems.StoryCatalog;
  assert.doesNotMatch(JSON.stringify(catalog.missions),/蘭恩|新兵演練|綜合演練/);
  assert.match(catalog.mission.objective,/抵擋 5 波來襲敵軍/);
  const frost=catalog.getMission('chapter1-frostborn');
  assert.doesNotMatch(frost.aftermath+JSON.stringify(frost.storyCards),/另有命令系統|還有一套|必須離開既有疆界/);
  assert.match(frost.storyCards.at(-1).line,/核對命令來源/);
});

test('unapproved V2 samples remain outside runtime catalog and publication package',()=>{
  const review=JSON.parse(read(reviewPath)),{ns}=load(),published=new Set(plan().files.map(f=>f.path));
  assert.equal(review.runtimeIntegrated,false);
  assert.equal(review.pages.length,2);
  for(const page of review.pages){
    assert(fs.existsSync(page.path));
    assert.equal(page.userApproved,false);
    assert.equal(published.has(page.path),false);
    assert(!ns.systems.StoryManga.pages.some(p=>p.image===page.path));
  }
  assert.equal(published.has('assets/td/concepts/story-comic-v2/StoryCatalog-before-0.85.95.js'),false);
});

test('full first-arc screenplay has 44 ordered pages and four panels per page',()=>{
  const text=read('docs/STORY_SCREENPLAY_V2_PROLOGUE.md')+'\n'+read('docs/STORY_SCREENPLAY_V2_MAIN_ARC.md');
  const pages=[...text.matchAll(/^## 第 (\d+) 頁[^\n]*\n([\s\S]*?)(?=^## |$(?![\s\S]))/gm)];
  assert.equal(pages.length,44);
  assert.deepEqual(pages.map(p=>Number(p[1])),Array.from({length:44},(_,i)=>i+1));
  for(const page of pages)assert.equal((page[2].match(/^[1-4]\. /gm)||[]).length,4,'page '+page[1]);
});

test('runtime version and editorial version are distinct from unfinished comic content',()=>{
  const pkg=JSON.parse(read('package.json')),{ns}=load();
  assert.equal(pkg.version,'0.85.96');
  assert.equal(pkg.storyEditorialVersion,'0.6.0');
  assert.equal(pkg.storyMangaVersion,'2.0.0');
  assert.equal(pkg.storyReviewVersion,'0.9.0');
  assert.equal(ns.systems.ProfileStore.VERSION,pkg.version);
  assert.equal(ns.systems.BattleReportSystem.APP_VERSION,pkg.version);
  for(const path of ['sw.js','update.html','td.html','src/td/app/FrontierApp.js'])assert(read(path).includes(pkg.version),path);
});
