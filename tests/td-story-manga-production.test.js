'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..'),authoring='assets/td/concepts/story-comic-v2/';
const read=relative=>fs.readFileSync(path.join(root,relative),'utf8');
const json=relative=>JSON.parse(read(relative));
const context={TowerFrontier:{systems:{}}};
for(const file of ['StoryMangaCatalog','StoryMusic'])vm.runInNewContext(read('src/td/app/'+file+'.js'),context);
const pages=context.TowerFrontier.systems.StoryMangaCatalog;
const review=json(authoring+'review-catalog.json');
const productions=['prologue-production-v1.json','main-production-13-18-v1.json','main-production-19-44-v1.json'].flatMap(file=>json(authoring+file).pages);
const hash=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');

test('formal V2 manga ships exactly 44 distinct ordered pages with explicit eras',()=>{
  assert.equal(pages.length,44);assert.equal(review.pages.length,44);assert.equal(productions.length,44);
  for(const key of ['id','image','sourcePath'])assert.equal(new Set(pages.map(page=>page[key])).size,44,key);
  pages.forEach((page,index)=>{
    assert.equal(page.storyPage,index+1);
    if(index<11)assert.equal(page.era,index<10?'古代篇':'年代轉場');
    else assert.match(page.era,/^當代(?:篇|主線)$/);
    assert.equal(page.image,'assets/td/story/manga-v2/page-'+String(index+1).padStart(2,'0')+'.webp');
    assert.equal(page.sourcePath,authoring+productions[index].source);
    assert.equal(productions[index].page,index+1);
  });
});

test('formal and authoring readers share page identity and accessible transcripts',()=>{
  pages.forEach((page,index)=>{
    for(const key of ['id','title','era','text'])assert.equal(JSON.stringify(page[key]),JSON.stringify(review.pages[index][key]),'page '+(index+1)+' '+key);
    assert(page.text.length>0);assert(page.text.every(line=>typeof line==='string'&&line.trim()));
    assert.equal(page.summary,page.title);
    assert(context.TowerFrontier.systems.StoryMusic.THEMES[page.mood],'page '+(index+1)+' has a playable music mood');
  });
  assert(['sorrow','tension','unease'].includes(pages[39].mood),'binding and consuming souls is not scored as a heroic victory');
});

test('every formal page is a real WebP from a full-size preserved PNG, matching its review copy',()=>{
  let totalBytes=0;
  pages.forEach((page,index)=>{
    const png=fs.readFileSync(path.join(root,page.sourcePath));
    assert.equal(png.subarray(0,8).toString('hex'),'89504e470d0a1a0a');
    assert.equal(png.readUInt32BE(16),1536);assert.equal(png.readUInt32BE(20),1024);
    const formal=fs.readFileSync(path.join(root,page.image));
    assert(formal.length>100000,'not an empty placeholder: '+page.image);
    assert.equal(formal.toString('ascii',0,4),'RIFF');assert.equal(formal.toString('ascii',8,12),'WEBP');
    const reviewBytes=fs.readFileSync(path.join(root,authoring+review.pages[index].image));
    assert.equal(hash(formal),hash(reviewBytes),'formal and reviewed art match for page '+(index+1));
    totalBytes+=formal.length;
  });
  assert(totalBytes<40*1024*1024,'44 readable pages retain a bounded download size');
});

test('final continuity repairs are the actual runtime sources, not discarded drafts',()=>{
  const sources={22:'main-22-v2.png',23:'main-23-v2.png',24:'main-24-v2.png',26:'main-26-v2.png',27:'main-27-v4.png',28:'main-28-v2.png',29:'main-29-v2.png',31:'main-31-v2.png',32:'main-32-v2.png',35:'main-35-v2.png',36:'main-36-v2.png',41:'main-41-v2.png',42:'main-42-v2.png',43:'main-43-v2.png',44:'main-44-v2.png'};
  for(const [number,source] of Object.entries(sources))assert.equal(pages[Number(number)-1].sourcePath,authoring+source);
  assert.match(pages[41].text.join(' '),/待核對時間/,'denied entry records were not magically obtained');
  assert.doesNotMatch(pages[40].text.join(' '),/三十七|37/,'do not invent a confirmed survivor count');
});

test('new art manifest distinguishes local integration from publication and user approval',()=>{
  const manifest=json(authoring+'main-production-19-44-v1.json');
  assert.equal(manifest.runtimeIntegrated,true);assert.equal(typeof manifest.published,'boolean');assert.equal(manifest.userApproved,false);
  assert.equal(manifest.remainingUndrawn,0);assert.equal(manifest.pages.length,26);
  manifest.pages.forEach(page=>{
    assert.match(page.prompt,/1536x1024/);assert(page.refs.length>0);assert(page.generatedSource);
    assert(fs.existsSync(path.join(root,authoring+page.source)));
  });
});

test('publisher includes every final WebP and flow module, never source PNGs or authoring records',()=>{
  const plan=require('../scripts/build-static-site.cjs').plan();
  const published=new Set(plan.files.map(file=>file.path));
  for(const page of pages){assert(published.has(page.image),page.image);assert(!published.has(page.sourcePath),page.sourcePath);}
  assert(published.has('src/td/app/StoryMangaFlow.js'));
  assert(!plan.files.some(file=>file.path.startsWith(authoring)));
  const html=read('td.html');
  assert(html.indexOf('StoryMangaCatalog.js')<html.indexOf('StoryMangaFlow.js'));
  assert(html.indexOf('StoryMangaFlow.js')<html.indexOf('StoryManga.js'));
  assert(read('sw.js').includes('src/td/app/StoryMangaFlow.js'));
});
