'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const {releaseFiles,digest,verify}=require('../scripts/verify-pages-release.cjs');
test('online verification covers mobile, simulator, game styles/scripts, cache and new effects',()=>{
  const files=releaseFiles();
  for(const file of ['td-mobile.html','mobile-simulator.html','td-lobby.css','src/td/main.js','src/td/map-tools/published-maps.js','src/td/systems/CombatTextCache.js','sw.js','assets/td/soldier-effects-v1.png'])assert.ok(files.includes(file),file);
  for(const file of files)assert.ok(fs.existsSync(file),file);
  assert.equal(digest(Buffer.from('a\r\nb'),'td.html'),digest(Buffer.from('a\nb'),'td.html'));
  assert.notEqual(digest(Buffer.from('a\r\nb'),'image.png'),digest(Buffer.from('a\nb'),'image.png'));
});
test('online verification rejects stale regular URLs, missing assets and mixed releases',async()=>{
  const requested=[];
  const fetcher=async url=>{requested.push(url);const file=url.pathname.replace('/game/','');return new Response(fs.readFileSync(file));};
  const result=await verify('https://example.test/game/',fetcher,['td.html','sw.js']);assert.equal(result.requests,4);
  assert.ok(requested.some(url=>url.pathname.endsWith('td.html')&&!url.search));
  await assert.rejects(verify('https://example.test/game/',async url=>url.search?fetcher(url):new Response('old version'),['td.html']),/content differs/);
  await assert.rejects(verify('https://example.test/game/',async()=>new Response('not found',{status:404}),['sw.js']),/HTTP 404/);
});
