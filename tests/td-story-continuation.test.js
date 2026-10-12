'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {validate}=require('../scripts/prepare-story-continuation.cjs');
const base=path.resolve(__dirname,'../assets/td/concepts/story-comic-v2/continuation'),read=f=>fs.readFileSync(path.join(base,f),'utf8');
const manifest=()=>JSON.parse(read('production-v3.json'));
test('continuation is an independent twenty-four-page draft with complete identity inputs and prompts',()=>{
  const m=validate(manifest());assert.equal(m.pages.length,24);
  for(const p of m.pages){assert(fs.existsSync(path.join(base,p.source)));assert(fs.existsSync(path.join(base,p.image)));for(const ref of p.refs)assert(fs.existsSync(path.resolve(__dirname,'..',ref)));assert(p.generatedSource);}
});
test('continuation rejects missing pages, path traversal, identity omissions and false publication claims',()=>{
  for(const change of [m=>m.pages.pop(),m=>m.pages[0].source='../main-45-v1.png',m=>m.pages[0].image='https://example.com/image.webp',m=>m.pages[0].refs=[],m=>m.pages[0].refs=[null],m=>m.pages[0].refs=['assets/td/../secret.png'],m=>m.pages[0].text=[],m=>m.pages[0].generatedSource=null,m=>m.pages[0]=null,m=>m.version='toString',m=>m.version='0.13.0',m=>m.published=true,m=>m.userApproved=true,m=>m.runtimeIntegrated=true]){const m=manifest();change(m);assert.throws(()=>validate(m));}
});
test('prior eight-page edition and every existing page identity remain unchanged',()=>{
  const previous=validate(JSON.parse(read('production-v1.json'))),current=validate(manifest());
  assert.equal(previous.version,'0.10.0');assert.equal(previous.endPage,52);
  assert.deepEqual(current.pages.slice(0,8),previous.pages);
});
test('sixteen-page edition remains a complete unchanged historical snapshot',()=>{
  const previous=validate(JSON.parse(read('production-v2.json'))),current=validate(manifest());
  assert.equal(previous.version,'0.11.0');assert.equal(previous.endPage,60);
  assert.deepEqual(current.pages.slice(0,16),previous.pages);
  assert.equal(current.previousManifest,'production-v2.json');
});
test('browser and preparation share the exact catalog contract',()=>{
  const vm=require('node:vm'),context={};vm.runInNewContext(read('review-catalog.js'),context);
  assert.equal(context.ContinuationReviewCatalog.validate(manifest()).endPage,68);
  const m=manifest();m.pages[15].image='review/main-52.webp';assert.throws(()=>context.ContinuationReviewCatalog.validate(m));
  assert.match(read('review.js'),/ContinuationReviewCatalog\.validate/);
  assert.match(read('review.html'),/review-catalog\.js.*review\.js/);
});
test('current reader, preparation and browser QA all use the current edition',()=>{
  assert.match(read('review.js'),/production-v3\.json/);
  assert.match(read('review.html'),/第 45–68 頁/);
  assert.match(read('review.html'),/review-catalog\.js\?v=0\.12\.0/);
  assert.match(read('review.html'),/review\.js\?v=0\.12\.0/);
  for(const name of ['prepare-story-continuation.cjs','qa-story-continuation.cjs'])assert.match(fs.readFileSync(path.resolve(__dirname,'../scripts',name),'utf8'),/production-v3\.json/);
});
test('continuation reader stays separate from player saves and exposes text, retry and fixed navigation',()=>{
  const html=read('review.html'),js=read('review.js');
  assert(!/ProfileStore|frontierApp|localStorage|sessionStorage|StoryManga/.test(js));
  assert(!/innerHTML/.test(js));assert.match(js,/current!==token/);assert.match(js,/img\.decode/);assert.match(js,/addEventListener\('hashchange'/);
  for(const id of ['prev','next','pages','transcript','retry','reload'])assert(html.includes('id="'+id+'"'));
  assert.match(html,/height:100dvh/);assert.match(html,/object-fit:contain/);assert.match(html,/min-height:44px/);
});
test('new drafts do not change the released runtime catalog',()=>{
  const vm=require('node:vm'),ns={systems:{}};vm.runInNewContext(fs.readFileSync(path.resolve(__dirname,'../src/td/app/StoryMangaCatalog.js'),'utf8'),{TowerFrontier:ns});
  assert.equal(ns.systems.StoryMangaCatalog.length,44);
  assert(!fs.readFileSync(path.resolve(__dirname,'../td.html'),'utf8').includes('continuation/'));
});
