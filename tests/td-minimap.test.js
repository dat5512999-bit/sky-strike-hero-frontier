'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const ns={systems:{},config:{mapId:'frontier',path:[{x:0,y:180},{x:1280,y:750}]}};
vm.runInNewContext(fs.readFileSync(path.join(root,'src/td/systems/MiniMapView.js'),'utf8'),{globalThis:{TowerFrontier:ns},Date});
const MiniMapView=ns.systems.MiniMapView;

test('小地圖依現有世界尺寸等比縮放，留白不能當作地圖點擊',()=>{
 const f=MiniMapView.fit(200,142,1280,900);
 assert.ok(Math.abs(f.scale-134/900)<1e-9);
 const rect={left:10,top:20,width:200,height:142};
 const p=MiniMapView.point(110,91,rect,200,142,1280,900);
 assert.ok(Math.abs(p.x-640)<1e-8&&Math.abs(p.y-450)<1e-8);
 assert.equal(MiniMapView.point(11,21,rect,200,142,1280,900),null);
 const classic=MiniMapView.fit(200,142,720,720);
 assert.ok(classic.x>30,'方形舊圖應保留左右留白，不被拉伸');
});

test('點小地圖只移動既有鏡頭，不改路徑或單位座標',()=>{
 let click,focus;
 const ctx={clearRect(){},fillRect(){},save(){},translate(){},scale(){},drawImage(){},beginPath(){},moveTo(){},lineTo(){},stroke(){},restore(){},arc(){},fill(){},strokeRect(){}};
 const canvas={width:200,height:142,getContext:()=>ctx,getBoundingClientRect:()=>({left:0,top:0,width:200,height:142})};
 const button={querySelector:()=>canvas,addEventListener(type,fn){if(type==='click')click=fn;}};
 const camera={enabled:true,worldWidth:1280,worldHeight:900,width:900,height:650,x:640,y:450,overview:true,follow:true,inspect:true,
  scale:()=>1,focus(x,y){focus={x,y};},sync(){}};
 const hero={x:520,y:250,active:true},game={camera,hero,status:'playing',profession:{selected:'hunter'},ui:{},monsters:[],build:{towers:()=>[]},art:{},frontierTerrain:{cache:{width:1280,height:900}}};
 const view=new MiniMapView(button);view.attach(game);click({detail:1,clientX:100,clientY:71});
 assert.ok(Math.abs(focus.x-640)<1e-8&&Math.abs(focus.y-450)<1e-8);
 assert.equal(camera.overview,false);assert.equal(camera.follow,false);assert.equal(camera.inspect,false);
 assert.deepEqual({x:hero.x,y:hero.y},{x:520,y:250});
 const pathBefore=ns.config.path.map(p=>({...p}));view.draw(game);assert.deepEqual(ns.config.path,pathBefore);
});

test('小地圖入口和離線資產沿用同一戰鬥頁',()=>{
 const html=fs.readFileSync(path.join(root,'td.html'),'utf8');
 for(const id of ['td-minimap','td-minimap-canvas','td-selection-shortcut','td-armory-shortcut'])assert.equal(html.split('id="'+id+'"').length-1,1);
 assert.match(html,/src="src\/td\/systems\/MiniMapView\.js"/);
 assert.match(fs.readFileSync(path.join(root,'sw.js'),'utf8'),/'\.\/src\/td\/systems\/MiniMapView\.js'/);
});
