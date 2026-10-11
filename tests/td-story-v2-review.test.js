'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');

const repo=path.resolve(__dirname,'..');
const directory=path.join(repo,'assets/td/concepts/story-comic-v2');
const html=fs.readFileSync(path.join(directory,'review.html'),'utf8');
const dataSource=html.match(/<script id="review-data">([\s\S]*?)<\/script>/)?.[1];
assert(dataSource,'review-data script is present');
const sandbox={};vm.runInNewContext(dataSource,sandbox);
const data=sandbox.StoryV2ReviewData;
function fixture(count=18){return {version:'0.8.0',title:'漫畫主線審閱',status:'待審閱，非正式更新',plannedPages:44,pages:Array.from({length:count},(_,index)=>{const number=String(index+1).padStart(2,'0'),part=index<12?'prologue':'main';return{id:'v2-'+part+'-'+number,title:'頁面 '+(index+1),era:index<10?'古代篇':index===10?'年代轉場':'當代篇',image:'review/'+part+'-'+number+'.webp',text:['這是角色的一句對白。'],reviewStatus:'待審閱'};})};}

test('review reader is authoring-only and never imports or writes formal game state',()=>{
  assert.equal(data.BOOKMARK_KEY,'hf-story-v2-review-bookmark');
  assert.match(html,/本地漫畫審閱合集；非正式更新/);
  assert.match(html,/圖稿仍待審閱，不代表已核准/);
  assert.doesNotMatch(html,/\.innerHTML\s*=|insertAdjacentHTML|document\.write\s*\(/);
  assert.doesNotMatch(html,/FrontierApp|ProfileStore|StoryMangaCatalog|serviceWorker\.register/);
  assert.doesNotMatch(html,/<script[^>]+src=/);
  assert.match(html,/localStorage\.setItem\(BOOKMARK_KEY/);
  assert.match(html,/catch\(_\)\{byId\('save-note'\)/);
});

test('review reader keeps whole pages and accessible navigation with image error recovery',()=>{
  for(const id of ['page-select','previous-page','next-page','zoom-button','text-button','fullscreen-button','retry-image','retry-catalog','transcript-lines'])assert(html.includes('id="'+id+'"'),id);
  assert.match(html,/object-fit:contain/);assert.match(html,/min-height:44px/);
  assert.match(html,/img\.decode\(\)/);assert.match(html,/img\.onerror=failed/);
  assert.match(html,/state\.catalog\.pages\[state\.index\+1\]/);
  assert.equal((html.match(/new Image\(\)/g)||[]).length,1,'only next-page preloader exists');
  assert.match(html,/state\.preloadPath===next\.image/);
  assert.match(html,/requestFullscreen==='function'/);assert.match(html,/此瀏覽器未允許全螢幕/);
  assert.match(html,/setPointerCapture/);assert.match(html,/pointerType==='touch'/);
  assert.match(html,/ArrowLeft/);assert.match(html,/ArrowRight/);assert.match(html,/Home:0/);assert.match(html,/End:/);
  assert.match(html,/由左至右、由上至下閱讀/);
  assert.match(html,/location\.protocol==='file:'/);
  assert.match(html,/fetch\('review-catalog\.json',\{cache:'no-store'/);
});

test('catalog validation rejects bad shapes, duplicate pages and remote or escaping image paths',()=>{
  assert.equal(data.validateCatalog(fixture()).pages.length,18);
  for(const value of [null,[],{}, {...fixture(),pages:[]}, {...fixture(),version:5}, {...fixture(),plannedPages:45}, {...fixture(),plannedPages:undefined},fixture(45)])assert.throws(()=>data.validateCatalog(value));
  for(const image of ['../prologue-01.webp','https://example.com/page.webp','javascript:alert(1)','review/prologue-13.webp','review/main-12.webp','review/main-45.webp','review/prologue-01.webp?next=https://example.com']){
    const catalog=fixture();catalog.pages[0].image=image;assert.throws(()=>data.validateCatalog(catalog));
  }
  const duplicate=fixture();duplicate.pages[1].id=duplicate.pages[0].id;assert.throws(()=>data.validateCatalog(duplicate));
  const duplicateImage=fixture();duplicateImage.pages[1].image=duplicateImage.pages[0].image;assert.throws(()=>data.validateCatalog(duplicateImage));
  const skippedPage=fixture();skippedPage.pages.splice(11,1);assert.throws(()=>data.validateCatalog(skippedPage));
  const reordered=fixture();[reordered.pages[11],reordered.pages[12]]=[reordered.pages[12],reordered.pages[11]];assert.throws(()=>data.validateCatalog(reordered));
  const emptyText=fixture();emptyText.pages[0].text=[];assert.throws(()=>data.validateCatalog(emptyText));
  const objectText=fixture();objectText.pages[0].text=[{html:'unsafe'}];assert.throws(()=>data.validateCatalog(objectText));
  const unsafeLooking=fixture();unsafeLooking.pages[0].title='<img onerror="bad">';
  assert.equal(data.validateCatalog(unsafeLooking).pages[0].title,'<img onerror="bad">','data stays text; DOM uses textContent');
  assert.match(html,/item\.textContent=line/);assert.match(html,/option\.textContent=/);
});

test('catalog supports a contiguous 1 to 44 page plan, optional storyPage and safe metadata groups',()=>{
  for(const count of [1,12,18,44]){
    const catalog=data.validateCatalog(fixture(count));assert.equal(catalog.pages.length,count);
    assert.equal(catalog.pages.at(-1).storyPage,count);assert.equal(data.remainingPages(catalog),44-count);
  }
  const explicit=fixture();explicit.pages.forEach((page,index)=>{page.storyPage=index+1;page.group=index<12?'前導篇':'當代主線';});
  const accepted=data.validateCatalog(explicit);assert.equal(accepted.pages[12].storyPage,13);assert.equal(accepted.pages[12].group,'當代主線');
  for(const invalid of [0,'13',14,NaN]){const catalog=fixture();catalog.pages[12].storyPage=invalid;assert.throws(()=>data.validateCatalog(catalog));}
  assert.match(data.scopeNote(data.validateCatalog(fixture())),/已有 18 頁審閱圖稿；尚有 26 頁未繪製/);
  assert.match(data.scopeNote(data.validateCatalog(fixture(44))),/全部圖稿仍待作者驗收/);
  assert.doesNotMatch(data.scopeNote(data.validateCatalog(fixture(44))),/全篇完成|已核准完成|未繪製/);
});

test('review bookmark and page boundaries never interpret old runtime bookmarks as a new index',()=>{
  const pages=fixture().pages;
  assert.equal(data.bookmarkIndex('v2-prologue-08',pages),7);
  assert.equal(data.bookmarkIndex('v2-main-13',pages),12);
  for(const invalid of [null,undefined,'ancient-6','present-2','999','{"index":7}'])assert.equal(data.bookmarkIndex(invalid,pages),0);
  assert.equal(data.clampIndex(-10,12),0);assert.equal(data.clampIndex(99,12),11);
  for(const invalid of [NaN,Infinity,1.2,'7',null])assert.equal(data.clampIndex(invalid,12),0);
});

test('page deep links accept only an existing id and never write the URL or rename the bookmark key',()=>{
  const pages=data.validateCatalog(fixture()).pages;
  assert.equal(data.hashPageIndex('#page=v2-main-13',pages),12);
  assert.equal(data.hashPageIndex('#page=v2-prologue-08',pages),7);
  assert.equal(data.hashPageIndex('#page=%76%32-main-13',pages),12);
  for(const invalid of ['',null,'#unknown','#page=%E0%A4%A','#page=v2-main-44','#page=javascript:alert(1)','#page=v2-main-13&other=1','#page=<img onerror=bad>'])assert.equal(data.hashPageIndex(invalid,pages),-1);
  assert.doesNotMatch(html,/location\.hash\s*=(?!=)|history\.(?:replaceState|pushState)/);
  assert.equal(data.BOOKMARK_KEY,'hf-story-v2-review-bookmark');
});

test('review manifest has ordered local WebP pages and preserves all original prologue bookmark ids and copy',()=>{
  const manifestPath=path.join(directory,'review-catalog.json');
  assert(fs.existsSync(manifestPath),'Main authoring task must generate review-catalog.json before running this suite');
  const catalog=data.validateCatalog(JSON.parse(fs.readFileSync(manifestPath,'utf8')));
  const prologue=JSON.parse(fs.readFileSync(path.join(directory,'prologue-catalog.json'),'utf8'));
  assert.equal(prologue.pages.length,12);assert(catalog.pages.length>=13,'main arc follows the original prologue');
  prologue.pages.forEach((page,index)=>{
    for(const key of ['id','title','era','image','text','reviewStatus'])assert.deepEqual(JSON.parse(JSON.stringify(catalog.pages[index][key])),page[key],'original prologue '+(index+1)+' '+key);
  });
  catalog.pages.forEach((page,index)=>{
    assert.equal(page.image,'review/'+(index<12?'prologue':'main')+'-'+String(index+1).padStart(2,'0')+'.webp');
    if(index>=12)assert.equal(page.id,'v2-main-'+String(index+1).padStart(2,'0'));
    assert(page.text.length>=1,'Page '+(index+1)+' retains a transcript');
    assert(page.text.every(line=>line.trim().length>0));
    const bytes=fs.readFileSync(path.join(directory,page.image));
    assert(bytes.length>1000,'page '+(index+1)+' has a real image asset');
    assert.equal(bytes.toString('ascii',0,4),'RIFF');assert.equal(bytes.toString('ascii',8,12),'WEBP');
  });
});

test('static publisher excludes the entire V2 review collection',()=>{
  const plan=require('../scripts/build-static-site.cjs').plan();
  assert(!plan.files.some(file=>file.path.startsWith('assets/td/concepts/story-comic-v2/')));
});
