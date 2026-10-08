'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const {load}=require('./helpers/td-runtime.cjs');
const {releaseFiles}=require('../scripts/verify-pages-release.cjs');

test('every story card keeps an illustrated fallback while a large scene downloads',()=>{
  const {ns}=load(),app=Object.create(ns.systems.FrontierApp.prototype);
  app.storyCardMission=ns.systems.StoryCatalog.getMission('chapter4-tidegate-outfall');app.storyCardIndex=2;
  ns.maps={definitions:{tidegateoutfall:{asset:'assets/td/chapter4-tidegate-outfall-v1.png'}}};
  const html=app.renderStoryCards();
  assert.match(html,/data-art-state="loading"/);
  assert.match(html,/background-image:url\(&quot;assets\/td\/chapter4-tidegate-outfall-v1\.png/);
  assert.match(html,/插圖載入中/);
  assert.match(html,/data-action="story-art-retry"/);
  assert.match(fs.readFileSync('td-lobby.css','utf8'),/\.story-card-stage\[data-art-state=ready\]>img\{opacity:1\}/);
});

test('scene load replaces fallback, preloads next beat and ignores stale callbacks',()=>{
  const {ns,context}=load(),mission=ns.systems.StoryCatalog.getMission('chapter4-tidegate-outfall');
  const app=Object.create(ns.systems.FrontierApp.prototype),img={complete:false,naturalWidth:0},stage={dataset:{artState:'loading'},isConnected:true,querySelector:()=>img};
  app.storyCardMission=mission;app.storyCardIndex=2;app.root={querySelector:()=>stage};
  const prefetched=[];context.Image=class{set src(value){prefetched.push(value);}};
  app.attachStoryCardArt();img.onload();
  assert.equal(stage.dataset.artState,'ready');assert.equal(app.storyCardLastImage,mission.storyCards[2].image);
  assert.deepEqual(prefetched,[mission.storyCards[3].image]);
  app.storyCardIndex=3;img.onerror();assert.equal(stage.dataset.artState,'ready');
  img.onload();assert.equal(app.storyCardLastImage,mission.storyCards[2].image,'old image callback must not replace the newer beat');
  app.attachStoryCardArt();img.onerror();assert.equal(stage.dataset.artState,'error');
  app.retryStoryCardArt();assert.equal(stage.dataset.artState,'loading');assert.match(img.src,/chapter4-tidegate-outfall-v2\.png\?retry=\d+/);
});

test('online release verification checks new story scenes and the pictured Naga portrait',()=>{
  const files=releaseFiles();
  for(const file of ['assets/td/story/chapter4-tidegate-readings-v1.png','assets/td/story/chapter3-nightwatch-defense-v1.png','assets/td/naga/tidebreaker-selection-v1.png'])assert.ok(files.includes(file),file);
});
