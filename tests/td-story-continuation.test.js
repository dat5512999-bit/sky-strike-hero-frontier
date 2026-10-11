'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {validate}=require('../scripts/prepare-story-continuation.cjs');
const base=path.resolve(__dirname,'../assets/td/concepts/story-comic-v2/continuation'),read=f=>fs.readFileSync(path.join(base,f),'utf8');
const manifest=()=>JSON.parse(read('production-v1.json'));
test('continuation is an independent eight-page draft with complete identity inputs and prompts',()=>{
  const m=validate(manifest());assert.equal(m.pages.length,8);
  for(const p of m.pages){assert(fs.existsSync(path.join(base,p.source)));assert(fs.existsSync(path.join(base,p.image)));for(const ref of p.refs)assert(fs.existsSync(path.resolve(__dirname,'..',ref)));assert(p.generatedSource);}
});
test('continuation rejects missing pages, path traversal, identity omissions and false publication claims',()=>{
  for(const change of [m=>m.pages.pop(),m=>m.pages[0].source='../main-45-v1.png',m=>m.pages[0].image='https://example.com/image.webp',m=>m.pages[0].refs=[],m=>m.pages[0].text=[],m=>m.published=true,m=>m.userApproved=true,m=>m.runtimeIntegrated=true]){const m=manifest();change(m);assert.throws(()=>validate(m));}
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
