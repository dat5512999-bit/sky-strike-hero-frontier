'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const {refresh,activated}=require('../src/td/update-client.js');
const version=require('../package.json').version;
function workerRuntime(overrides={}){
  const events={},cache={addAll:async()=>{},match:async()=>null,put:async()=>{}},opened=[];
  const sandbox={URL,Request:class{constructor(url,options){this.url=url;this.cache=options.cache;}},self:{addEventListener:(name,fn)=>events[name]=fn,skipWaiting:async()=>{},clients:{claim:async()=>{}}},caches:{open:async name=>{opened.push(name);return cache;},keys:async()=>[],delete:async()=>{}},fetch:async()=>({ok:true,status:200,type:'basic',clone(){return this;}})};
  Object.assign(sandbox,overrides);vm.runInNewContext(fs.readFileSync('sw.js','utf8'),sandbox);
  return {events,cache,opened,sandbox};
}
test('worker install bypasses stale HTTP cache and only activates after complete precache',async()=>{
  const {events,cache,sandbox}=workerRuntime(),sequence=[];let pending;
  cache.addAll=async requests=>{assert.ok(requests.length>100);assert.ok(requests.every(r=>r.cache==='reload'));assert.ok(requests.some(r=>r.url==='./td.html'));sequence.push('complete');};
  sandbox.self.skipWaiting=async()=>sequence.push('activate');events.install({waitUntil:p=>pending=p});await pending;
  assert.deepEqual(sequence,['complete','activate']);
  cache.addAll=async()=>{throw Error('offline');};sequence.length=0;events.install({waitUntil:p=>pending=p});await assert.rejects(pending,/offline/);assert.deepEqual(sequence,[]);
});
test('HTML and scripts revalidate HTTP cache; offline fallback uses only current release',async()=>{
  const {events,cache,opened,sandbox}=workerRuntime();let result,mode;
  const request={method:'GET',url:'https://example.test/game/td.html?release='+version,headers:{has:()=>false}};
  sandbox.fetch=async(_,options)=>{mode=options.cache;throw Error('offline');};
  cache.match=async(req,options)=>{assert.equal(req,request);assert.equal(options.ignoreSearch,true);return 'current-release-html';};
  events.fetch({request,respondWith:p=>result=p});assert.equal(await result,'current-release-html');assert.equal(mode,'no-cache');assert.deepEqual(opened,['sky-strike-v'+version]);
});
test('images cannot pick an obsolete cache recreated by an older open tab',async()=>{
  const {events,cache,opened,sandbox}=workerRuntime();let result;
  sandbox.caches.match=()=>{throw Error('global cache lookup mixes releases');};
  cache.match=async()=> 'current-image';
  events.fetch({request:{method:'GET',url:'https://example.test/game/assets/td/hero.png',headers:{has:()=>false}},respondWith:p=>result=p});
  assert.equal(await result,'current-image');assert.deepEqual(opened,['sky-strike-v'+version]);
});
test('version handshake reports actual worker release',()=>{
  const {events}=workerRuntime();let reply;
  events.message({data:{type:'GAME_VERSION'},ports:[{postMessage:v=>reply=v}]});assert.equal(reply,'sky-strike-v'+version);
});
function activeWorker(release){return {state:'activated',addEventListener(){},removeEventListener(){},postMessage(data,ports){assert.equal(data.type,'GAME_VERSION');ports[0].peer.onmessage({data:release});}};}
class Channel{constructor(){this.port1={close(){}};this.port2={peer:this.port1,close(){}};}}
test('recovery waits for update and verifies matching active version before returning',async()=>{
  const worker=activeWorker('sky-strike-v'+version),calls=[];
  const sw={register:async(url,options)=>{assert.equal(url,'./sw.js');assert.equal(options.updateViaCache,'none');calls.push('register');return {active:worker,update:async()=>calls.push('update')};}};
  assert.equal(await refresh(sw,version,Channel),worker);assert.deepEqual(calls,['register','update']);
  worker.postMessage=(_,ports)=>ports[0].peer.onmessage({data:'sky-strike-v0.71.4'});await assert.rejects(refresh(sw,version,Channel),/新版檔案/);
});
test('installation state must activate; redundant updates fail without navigating',async()=>{
  let listener,finished=false;const worker={state:'installing',addEventListener:(_,fn)=>listener=fn,removeEventListener(){}};
  const waiting=activated(worker).then(()=>finished=true);await Promise.resolve();assert.equal(finished,false);
  worker.state='activated';listener();await waiting;assert.equal(finished,true);
  worker.state='redundant';await assert.rejects(activated(worker),/未完成/);
});
test('failed recovery shows retry, keeps the page open, and never accesses player storage',async()=>{
  const status={},retry={hidden:true,addEventListener(){}},context={document:{getElementById:id=>id==='update-status'?status:retry,documentElement:{dataset:{release:version}}},navigator:{serviceWorker:{register:async()=>{throw Error('offline');}}},location:{protocol:'https:',replace(){throw Error('must not navigate');}},MessageChannel:Channel,setTimeout,clearTimeout,URL};
  Object.defineProperty(context,'localStorage',{get(){throw Error('must preserve storage');}});Object.defineProperty(context,'indexedDB',{get(){throw Error('must preserve storage');}});
  vm.runInNewContext(fs.readFileSync('src/td/update-client.js','utf8'),context);await new Promise(resolve=>setImmediate(resolve));
  assert.equal(retry.hidden,false);assert.match(status.textContent,/原有存檔仍保留/);
});
test('recovery entry is versioned, deployable and accessible from settings outside mobile iframe',()=>{
  const html=fs.readFileSync('update.html','utf8'),app=fs.readFileSync('src/td/app/FrontierApp.js','utf8');
  assert.ok(html.includes('data-release="'+version+'"'));assert.match(html,/role="status"/);assert.match(app,/href="update.html" target="_top"/);
  for(const file of ['src/td/main.js','src/td/mobile-pwa.js'])assert.match(fs.readFileSync(file,'utf8'),/updateViaCache:\s*'none'/);
});
