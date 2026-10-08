'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const {load}=require('./helpers/td-runtime.cjs');
function appFor(ns,admin=false,completed=[]){
  const app=Object.create(ns.systems.FrontierApp.prototype);
  Object.assign(app,{store:{isAdmin:()=>admin,current:()=>({completed})},root:{querySelector:()=>null},render(){},show(page){this.page=page;},launchStory(){this.launched=true;}});return app;
}
test('all four chapters and preview offer eight illustrated pages with valid speakers and concise prose',()=>{
  const {ns}=load(),book=ns.systems.StoryComicBook;let count=0;
  for(const mission of [...ns.systems.StoryCatalog.missions,ns.systems.StoryCatalog.chapter2Preview]){
    const pages=book.pages(mission);assert.equal(pages.length,8,mission.id);count+=pages.length;
    assert.equal(new Set(pages.map(p=>p.title)).size,8);
    for(const page of pages){assert.ok(fs.existsSync(page.image),page.image);assert.ok(ns.systems.HeroRoster.CLASSES[page.speaker]);assert.ok(page.narration.length>=20&&page.narration.length<100);assert.ok(page.dialogue.length>5&&page.dialogue.length<75);assert.equal(page.phase,'before');}
  }
  assert.equal(count,136);
});
test('back, jump and keyboard navigation cannot accidentally launch battle or move out of range',()=>{
  const {ns}=load(),app=appFor(ns);app.startStoryCards(ns.systems.StoryCatalog.mission);
  app.act('story-card-prev');assert.equal(app.storyCardIndex,0);
  app.act('story-book-page','6');assert.equal(app.storyCardIndex,6);
  app.act('story-card-prev');assert.equal(app.storyCardIndex,5);
  app.act('story-book-page','bad');assert.equal(app.storyCardIndex,5);
  const key=value=>({key:value,target:{tagName:'BUTTON'},preventDefault(){}});
  app.handleStoryKey(key('End'));assert.equal(app.storyCardIndex,7);
  app.handleStoryKey(key('ArrowRight'));assert.equal(app.storyCardIndex,7);assert.ok(!app.launched);
  app.handleStoryKey(key('Home'));assert.equal(app.storyCardIndex,0);
  app.act('story-book-exit');assert.equal(app.page,'story');assert.ok(!app.launched);
});
test('aftermath and continuous reading obey completion state and never grant progress',()=>{
  const {ns}=load(),mission=ns.systems.StoryCatalog.mission,completed=[],app=appFor(ns,false,completed);
  app.startStoryCards(mission,true);assert.equal(app.storyPages().length,8);assert.equal(app.nextStoryReading(),null);
  app.act('story-book-continue');assert.equal(app.storyCardMission,mission);
  completed.push(mission.id);assert.equal(app.storyPages().length,9);assert.equal(app.storyPages().at(-1).phase,'after');
  app.act('story-book-continue');assert.equal(app.storyCardMission.id,'chapter1-silverleaf');assert.equal(app.storyCardReplay,true);assert.equal(completed.length,1);
  const admin=appFor(ns,true);admin.startStoryCards(mission,true);assert.equal(admin.storyPages().length,9);assert.ok(admin.nextStoryReading());
});
test('reader preserves the complete image, escapes copy and ships offline styles and data',()=>{
  const {ns}=load(),app=appFor(ns,true),mission=ns.systems.StoryCatalog.getMission('chapter3-white-trace');
  app.startStoryCards(mission,true);app.storyCardIndex=1;
  const html=app.renderStoryCards();assert.match(html,/風往那邊吹/);assert.match(html,/hero-selection-v2.png/);assert.match(html,/story-book-speech/);
  const old=ns.systems.StoryComicBook.stories[mission.id][1].title;ns.systems.StoryComicBook.stories[mission.id][1].title='<script>bad</script>';
  assert.match(app.renderStoryCards(),/&lt;script&gt;bad/);ns.systems.StoryComicBook.stories[mission.id][1].title=old;
  const css=fs.readFileSync('td-story-book.css','utf8');assert.match(css,/story-book-art>img\{[^}]*object-fit:contain[^}]*transform:none;animation:none/);
  const sw=fs.readFileSync('sw.js','utf8');assert.match(sw,/td-story-book.css/);assert.match(sw,/StoryComicBook.js/);
});
