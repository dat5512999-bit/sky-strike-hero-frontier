'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
function setup(){
 const listeners=new Map(),classes=new Set(),body={dataset:{},classList:{contains:k=>classes.has(k)}};
 const document={body,addEventListener:(t,f)=>listeners.set('doc:'+t,f)};
 const c=vm.createContext({console,document,devicePixelRatio:3,addEventListener:(t,f)=>listeners.set('win:'+t,f)});
 c.globalThis=c;c.TowerFrontier={systems:{},config:{width:720,height:720}};
 vm.runInContext(fs.readFileSync(path.join(__dirname,'../src/td/systems/BattlefieldCamera.js'),'utf8'),c);
 return {camera:new c.TowerFrontier.systems.BattlefieldCamera(720,720),listeners,classes,body};
}
test('鏡頭在桌面／橫直視窗縮放後螢幕與世界座標可逆',()=>{
 for(const [w,h]of [[1920,1080],[1366,768],[845,390],[390,845]]){
  const {camera:c}=setup();c.resize(w,h);c.changeZoom(1.8);c.focus(450,420);
  for(const p of [{x:0,y:0},{x:350,y:305},{x:719,y:719}]){
   const s=c.worldToScreen(p.x,p.y),v=c.screenToWorld(s.x,s.y);
   assert.ok(Math.abs(v.x-p.x)<1e-8&&Math.abs(v.y-p.y)<1e-8);
  }
 }
});
test('鏡頭邊界限制不會改寫英雄或怪物世界位置',()=>{
 const {camera:c}=setup();c.resize(1280,720);c.pan(0,1e6);assert.ok(c.y>0);assert.ok(Math.abs(c.screenToWorld(0,0).y)<1e-8);
 c.pan(0,-1e6);assert.ok(Math.abs(c.screenToWorld(1280,720).y-720)<1e-8);
 c.changeZoom(2);c.pan(1e6,0);assert.ok(Math.abs(c.screenToWorld(0,0).x)<1e-8);
});
test('全圖模式的留白不可下令，縮放有限制且 reset 恢復',()=>{
 const {camera:c}=setup();c.resize(1920,1080);c.showAll();
 assert.equal(c.contains(c.screenToWorld(0,540)),false);
 assert.equal(c.contains(c.screenToWorld(960,540)),true);
 c.changeZoom(999);assert.equal(c.zoom,2.2);c.changeZoom(.001);assert.equal(c.zoom,1);
 c.inspect=true;c.follow=true;c.reset();assert.equal(c.inspect,false);assert.equal(c.follow,false);assert.equal(c.overview,false);
});
test('CSS 縮放或 DPR 不影響建造指標換算',()=>{
 const {camera:c}=setup();c.resize(1000,500);c.changeZoom(1.5);c.focus(400,400);
 const point={x:350,y:300},screen=c.worldToScreen(point.x,point.y);
 const canvas={getBoundingClientRect:()=>({left:40,top:60,width:500,height:250})};
 const actual=c.point({clientX:40+screen.x/2,clientY:60+screen.y/2},canvas);
 assert.ok(Math.abs(actual.x-point.x)<1e-8);assert.ok(Math.abs(actual.y-point.y)<1e-8);
});
test('鏡頭畫布解析度有 DPR 上限，直式退回原 720 世界画布',()=>{
 const {camera:c,classes}=setup();classes.add('edge-combat');
 const calls=[],ctx=new Proxy({}, {get:(o,k)=>o[k]||((...args)=>calls.push([k,...args])),set:(o,k,v)=>(o[k]=v,true)});
 const canvas={width:720,height:720,getBoundingClientRect:()=>({width:1000,height:500})};
 const game={canvas,ctx,profession:{selected:'hunter'},hero:{active:true,x:350,y:305},effects:[]};
 assert.equal(c.begin(game),true);c.end(game);assert.equal(canvas.width,1500);assert.equal(canvas.height,750);
 c.follow=true;c.begin(game);c.end(game);assert.equal(c.y,305);
 classes.clear();assert.equal(c.begin(game),false);assert.equal(canvas.width,720);assert.equal(canvas.height,720);
});
test('鏡頭拖曳攔截放置／移動，取消與第二指觸碰不發出指令',()=>{
 const {camera:c,listeners}=setup();c.enabled=true;c.resize(1280,720);
 const events=new Map();let captured=null;
 const canvas={classList:{toggle(){}},addEventListener:(t,f)=>events.set(t,f),setPointerCapture:id=>captured=id,hasPointerCapture:id=>captured===id,releasePointerCapture:()=>captured=null};
 const button=()=>({setAttribute(){}}),ui={inspect:button(),follow:button(),home:button(),all:button(),plus:button(),minus:button(),status:{}};
 const game={canvas,dragHero:true,status:'playing',profession:{selected:'hunter'},hero:{x:350,y:305},ui:{buildButtons:[]},selectHero(){}};
 c.attach(game,ui);ui.inspect.onclick();
 let stopped=0,prevented=0;
 const e=(id,x,y)=>({pointerId:id,button:0,clientX:x,clientY:y,preventDefault(){prevented++;},stopImmediatePropagation(){stopped++;}});
 events.get('pointerdown')(e(1,100,100));assert.equal(game.dragHero,false);assert.equal(captured,1);
 events.get('pointerdown')(e(2,200,200));assert.equal(c.gesture.id,1);assert.equal(stopped,2);
 events.get('pointermove')(e(1,100,70));assert.ok(c.y>360);
 events.get('pointercancel')(e(1,100,70));assert.equal(c.gesture,null);assert.equal(captured,null);
 c.space=true;listeners.get('win:blur')();assert.equal(c.space,false);assert.ok(prevented>=3);
 c.showAll();ui.inspect.onclick();assert.equal(c.overview,false);assert.equal(c.inspect,true);
 c.showAll();ui.follow.onclick();assert.equal(c.overview,false);assert.equal(c.follow,true);
 c.showAll();ui.home.onclick();assert.equal(c.overview,false);assert.equal(c.follow,false);
});

test('正式新手地圖依可讀尺寸自動 Fit，不用為最後一小塊拖曳',()=>{
 const map={width:1536,height:1024,openingFocus:{x:768,y:490},safeArea:{x:40,y:125,width:1460,height:650},camera:{minUnitPixels:42,referenceUnitSize:112,maxZoom:2.2,mobileInitialZoom:1.5}};
 for(const [label,w,h] of [['2560×1440',2560,1440],['1920×1080',1920,1080],['Laptop',1366,768],['Mobile 16:9',844,390],['Mobile Wide',932,430]]){
  const {camera}=setup();camera.configure(map);camera.resize(w,h);assert.equal(camera.initialView(),true,label);assert.equal(camera.overview,true,label);assert.ok(Math.abs(camera.visibleFraction()-1)<1e-9,label);assert.equal(camera.safeAreaVisible(),true,label);assert.ok(camera.scale()*112>=42,label);
 }
 const {camera:tiny}=setup();tiny.configure(map);tiny.resize(740,320);assert.equal(tiny.initialView(),false);assert.ok(tiny.visibleFraction()<1);assert.equal(tiny.safeAreaVisible(),true,'極窄視窗只裁外圍裝飾，核心安全區仍完整');
});

test('手機橫向初始鏡頭聚焦玩法區而非強制全圖',()=>{const {camera}=setup();camera.configure({width:1536,height:1024,openingFocus:{x:768,y:490},camera:{minUnitPixels:42,referenceUnitSize:112,maxZoom:2.2,mobileInitialZoom:1.5}});camera.resize(844,390);assert.equal(camera.initialView({preferFocus:true}),false);assert.equal(camera.overview,false);assert.equal(camera.zoom,1.5);assert.ok(camera.visibleFraction()<1);});

test('手機空地單指平移、雙指縮放，從英雄或建造模式起手不攔截',()=>{const {camera}=setup();camera.configure({width:1536,height:1024,openingFocus:{x:768,y:490},camera:{minUnitPixels:42,referenceUnitSize:112,maxZoom:2.2,mobileInitialZoom:1.5}});camera.resize(844,390);camera.initialView({preferFocus:true});camera.enabled=true;const events=new Map(),captured=new Set(),canvas={classList:{toggle(){}},getBoundingClientRect:()=>({left:0,top:0,width:844,height:390}),addEventListener:(type,fn)=>events.set(type,fn),setPointerCapture:id=>captured.add(id),hasPointerCapture:id=>captured.has(id),releasePointerCapture:id=>captured.delete(id)};const button=()=>({setAttribute(){}}),ui={inspect:button(),follow:button(),home:button(),all:button(),plus:button(),minus:button(),status:{}},game={canvas,status:'playing',profession:{selected:'hunter'},hero:{active:true,x:768,y:490},build:{pending:null},ui:{buildButtons:[]},selectHero(){}};camera.attach(game,ui);const fire=(id,x,y)=>({pointerId:id,pointerType:'touch',button:0,clientX:x,clientY:y,preventDefault(){},stopImmediatePropagation(){}});const beforeX=camera.x;events.get('pointerdown')(fire(1,80,80));events.get('pointermove')(fire(1,130,80));assert.ok(camera.x<beforeX);events.get('pointerdown')(fire(2,300,80));const beforeZoom=camera.zoom;events.get('pointermove')(fire(2,360,80));assert.ok(camera.zoom>beforeZoom);events.get('pointerup')(fire(2,360,80));events.get('pointerup')(fire(1,130,80));const heroScreen=camera.worldToScreen(game.hero.x,game.hero.y);events.get('pointerdown')(fire(3,heroScreen.x,heroScreen.y));assert.equal(camera.touches.has(3),false);game.build.pending={kind:'building'};events.get('pointerdown')(fire(4,420,200));assert.equal(camera.touches.has(4),false);});

test('滑鼠滾輪縮放以游標世界位置為錨點',()=>{
 const {camera,listeners}=setup();camera.configure({width:1536,height:1024,openingFocus:{x:768,y:490},camera:{minUnitPixels:42,referenceUnitSize:112}});camera.resize(1000,600);camera.enabled=true;camera.initialView();
 const events=new Map(),canvas={classList:{toggle(){}},getBoundingClientRect:()=>({left:0,top:0,width:1000,height:600}),addEventListener:(t,f)=>events.set(t,f),hasPointerCapture:()=>false};
 const button=()=>({setAttribute(){}}),ui={inspect:button(),follow:button(),home:button(),all:button(),plus:button(),minus:button(),status:{}};
 const game={canvas,status:'playing',profession:{selected:'hunter'},hero:{active:true,x:525,y:470},ui:{buildButtons:[]},selectHero(){}};camera.attach(game,ui);
 const before=camera.screenToWorld(500,260);let prevented=false;events.get('wheel')({clientX:500,clientY:260,deltaY:-1,preventDefault(){prevented=true;}});const after=camera.screenToWorld(500,260);
 assert.equal(prevented,true);assert.ok(Math.abs(before.x-after.x)<1e-7&&Math.abs(before.y-after.y)<1e-7);
});
