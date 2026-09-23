'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const {load,game,enemy}=require('./helpers/td-runtime.cjs'),{rgba}=require('./png-pixels.cjs');
function canvas(){const calls=[],gradient={addColorStop(){}},ctx=new Proxy({globalAlpha:1,createRadialGradient:()=>gradient},{get:(o,k)=>k in o?o[k]:(...a)=>calls.push([k,...a])});return {ctx,calls};}
function readyArt(ns){
 const art=Object.create(ns.systems.ArtSystem.prototype);
 art.load=path=>({assetSrc:path,ready:true,width:path.includes('buildings')?2172:1280,height:path.includes('buildings')?724:1280,addEventListener(){}});
 art.drawRank=()=>{};return art;
}
test('all seven painted building footprints fit the new card crops including siege rockets and legs',()=>{
 const {ns}=load(),Art=ns.systems.ArtSystem;
 const atlases={a:rgba('assets/td/combat-art/goblin-buildings-a-v1.png'),b:rgba('assets/td/combat-art/goblin-buildings-b-v1.png')};
 assert.equal(Object.keys(Art.GOBLIN_BUILDING_FRAMES).length,7);
 for(const [type,[set,cols,index,height]] of Object.entries(Art.GOBLIN_BUILDING_FRAMES)){
  const p=atlases[set],sw=p.width/cols,width=height*sw/p.height,b=Art.PREVIEW_BOUNDS['building:'+type];let count=0;
  for(let y=0;y<p.height;y+=2)for(let x=0;x<sw;x+=2){
   if(p.pixels[(y*p.width+Math.floor(index*sw+x))*4+3]<=100)continue;
   count++;const px=192-width/2+x/sw*width,py=270-height+8+y/p.height*height;
   assert.ok(px>=b.left&&px<=b.left+b.width&&py>=b.top&&py<=b.top+b.height,type+' crop contains opaque art');
  }assert.ok(count>100);
 }
});
test('construction/recoil reach the renderer; support and cooling buildings do not flash gunfire',()=>{
 const {ns}=load(),art=readyArt(ns),{ctx,calls}=canvas(),item={visualAge:0,fireFlash:1,aim:0};
 art.drawBuilding(ctx,'goblinTurret',100,100,1,null,item);
 assert.ok(calls.some(c=>c[0]==='scale'&&c[2]===.6));assert.ok(calls.some(c=>c[0]==='translate'&&c[1]===-7));
 assert.ok(calls.some(c=>c[0]==='drawImage'&&c[1]===art.goblinSpellAtlas&&c[2]===0&&c[3]===640));
 assert.deepEqual(item,{visualAge:0,fireFlash:1,aim:0});
 for(const [type,motion] of [['goblinGenerator',{visualAge:2,fireFlash:1}],['goblinTurret',{visualAge:2,fireFlash:1,networkCooling:true}]]){
  calls.length=0;art.drawBuilding(ctx,type,100,100,1,null,motion);
  assert.ok(!calls.some(c=>c[0]==='drawImage'&&c[1]===art.goblinSpellAtlas&&c[2]===0&&c[3]===640));
 }
 assert.equal(calls.filter(c=>c[0]==='save').length,calls.filter(c=>c[0]==='restore').length);
});
test('goblin shots and targeting anchors are unchanged by animation state',()=>{
 const {ns}=load(),b=new ns.entities.Building('goblinTurret',100,100),shots=[];b.cooldown=0;b.update(.01,[enemy(ns)],shots,[]);
 assert.equal(b.shotsFired,1);assert.equal(b.fireFlash,1);assert.equal(b.x,100);assert.equal(b.y,100);
 b.update(.05,[],shots,[]);assert.ok(b.fireFlash<1);assert.equal(b.shotsFired,1);
});
test('four skill renderers use painted layers, cap work and preserve combat state and Canvas save/restore',()=>{
 const {ns}=load(),g=game(ns);g.art=readyArt(ns);g.hero.synergy=g.synergy;
 const {ctx,calls}=canvas();g.build.items=Array.from({length:40},(_,i)=>({x:200+i,y:100,networkPowered:true}));
 for(const mobile of [false,true])for(const type of ['goblin-modify','goblin-cool','goblin-deploy','goblin-overload'])for(const age of [0,.3,.99]){
  calls.length=0;g.feedback.mobile=mobile;
  assert.equal(ns.systems.GoblinPresentation.draw(ctx,{type,x:100,y:100,target:{x:200,y:100},radius:112,age,duration:1},g.hero),true);
  assert.ok(calls.some(c=>c[0]==='drawImage'));
  assert.equal(calls.filter(c=>c[0]==='save').length,calls.filter(c=>c[0]==='restore').length);
  assert.ok(calls.filter(c=>c[0]==='drawImage').length<=(mobile?7:12));
 }
 assert.equal(g.projectiles.length,0);assert.equal(g.summons.length,0);
 assert.equal(ns.systems.GoblinPresentation.draw(ctx,{type:'frost'},g.hero),false);
 g.art.goblinSpellAtlas.ready=false;
 assert.equal(ns.systems.GoblinPresentation.draw(ctx,{type:'goblin-cool'},g.hero),false);
});
test('failed painted assets are tracked/retried and building reload invalidates preview cache',()=>{
 const {ns,context}=load();context.Image=class {addEventListener(k,cb){this[k+'Listener']=cb;}};
 const art=new ns.systems.ArtSystem(),requests=[];art.request=image=>requests.push(image);
 const image=art.goblinBuildingImage('a');art.previewCache=new Map([['building:goblinSiege',{}],['unit:hunter',{}]]);
 image.loadListener();assert.equal(art.previewCache.has('building:goblinSiege'),false);assert.equal(art.previewCache.has('unit:hunter'),true);
 ns.systems.GoblinPresentation.assets(art);image.failed=true;art.goblinSpellAtlas.failed=true;art.goblinSkillIcons.failed=true;
 assert.ok(art.failedAssets().includes(image));art.retryFailed();
 for(const asset of [image,art.goblinSpellAtlas,art.goblinSkillIcons]){assert.ok(requests.includes(asset));assert.equal(asset.failed,false);}
});
test('goblin FX has genuine alpha and all new assets are available offline with painted skill CSS',()=>{
 const p=rgba('assets/td/goblin/spell-effects-v1.png');let clear=0;for(let i=3;i<p.pixels.length;i+=4)if(!p.pixels[i])clear++;
 assert.ok(clear/(p.width*p.height)>.2);assert.equal(p.width,p.height);
 const sw=fs.readFileSync('sw.js','utf8'),css=fs.readFileSync('td-polish.css','utf8');
 for(const path of ['assets/td/goblin/spell-effects-v1.png','assets/td/goblin/skill-icons-v2.png','src/td/systems/GoblinPresentation.js','goblin-polish-preview.html','src/td/goblin-polish-preview.js']){assert.ok(fs.existsSync(path));assert.ok(sw.includes(path));}
 assert.match(css,/goblin\/skill-icons-v2\.png/);
 const html=fs.readFileSync('td.html','utf8');assert.ok(html.indexOf('GoblinPresentation.js')>html.indexOf('CosmeticArt.js'));
});
