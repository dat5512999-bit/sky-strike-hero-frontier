'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
function surface(){
  const handlers={},captures=new Set();
  return {handlers,dataset:{},style:{setProperty(key,value){this[key]=value;}},hidden:false,
    addEventListener(type,handler){(handlers[type]||(handlers[type]=[])).push(handler);},
    fire(type,extra={}){const event=Object.assign({pointerId:1,pointerType:'touch',button:0,clientX:160,clientY:260,preventDefault(){this.prevented=true;},stopPropagation(){this.stopped=true;}},extra);for(const handler of handlers[type]||[])handler(event);return event;},
    getBoundingClientRect(){return{left:100,top:200,width:120,height:120};},
    setPointerCapture(id){captures.add(id);},hasPointerCapture(id){return captures.has(id);},releasePointerCapture(id){captures.delete(id);}
  };
}
function setup(){
  const window=surface(),document=surface();document.body={dataset:{layout:'mobile',combatOrientation:'landscape'}};document.hidden=false;
  const context=vm.createContext({console,document,addEventListener:window.addEventListener.bind(window)});context.globalThis=context;
  const files=['namespace','config','systems/HeroRoster','systems/EquipmentSystem','systems/ArmorySystem','entities/Hero','entities/Projectile','systems/NavigationSystem','systems/HeroJoystick'];
  for(const file of files)vm.runInContext(fs.readFileSync(path.join(__dirname,'../src/td/'+file+'.js'),'utf8'),context);
  const ns=context.TowerFrontier,element=surface(),hero=new ns.entities.Hero(350,305),game={hero,status:'playing',profession:{selected:'hunter'},paused:false,build:{items:[],pending:null},ui:{},navigation:new ns.systems.NavigationSystem()};
  hero.chooseClass('hunter');game.joystick=new ns.systems.HeroJoystick(game,element);
  const tick=(dt=.02,monsters=[],shots=[])=>{game.joystick.update(dt);hero.update(dt,monsters,shots);};
  return{ns,context,window,document,game,hero,element,tick,stick:game.joystick};
}

test('搖桿支援任意 360 度方向，對角線與直線保持相同既有移速',()=>{
  for(const angle of [0,.37,Math.PI/4,Math.PI/2,Math.PI,Math.PI*1.33,Math.PI*1.9]){
    const {hero,element,tick}=setup(),start={x:hero.x,y:hero.y};
    element.fire('pointerdown',{clientX:160+Math.cos(angle)*50,clientY:260+Math.sin(angle)*50});
    for(let i=0;i<10;i++)tick();
    assert.ok(Math.abs(hero.x-start.x-Math.cos(angle)*hero.combatConfig().speed*.2)<1e-8);
    assert.ok(Math.abs(hero.y-start.y-Math.sin(angle)*hero.combatConfig().speed*.2)<1e-8);
    assert.equal(hero.state,'walk');
  }
});
test('放開後立即取消目標並回中；中心死區不會漂移',()=>{
  const {hero,element,tick,stick}=setup();
  element.fire('pointerdown',{clientX:163});tick();assert.equal(hero.x,350);
  element.fire('pointermove',{clientX:210});tick();assert.ok(hero.x>350);
  element.fire('pointerup');const stopped=hero.x;for(let i=0;i<10;i++)tick();
  assert.equal(hero.x,stopped);assert.equal(hero.targetX,hero.x);assert.equal(stick.active,false);
  assert.equal(element.style['--stick-x'],'0px');assert.equal(element.hasPointerCapture(1),false);
});
test('只追蹤搖桿持有手指，越界拖曳仍捕捉；其他手指的 UI 操作不改方向',()=>{
  const {element,stick,hero,tick}=setup();const event=element.fire('pointerdown',{clientX:210});
  assert.equal(event.prevented,true);assert.equal(event.stopped,true);assert.equal(element.hasPointerCapture(1),true);
  element.fire('pointerdown',{pointerId:2,clientX:100});element.fire('pointermove',{pointerId:2,clientX:100});element.fire('pointerup',{pointerId:2});
  assert.equal(stick.pointerId,1);assert.equal(stick.direction.x,1);
  element.fire('pointermove',{clientX:900});tick();assert.ok(hero.x>350);assert.ok(parseFloat(element.style['--stick-x'])<=36);
  assert.equal(element.fire('click').stopped,true);
});
test('取消、捕捉遺失、旋轉、離開視窗與背景化均停止，回來不自動移動',()=>{
  for(const event of ['pointercancel','lostpointercapture','blur','pagehide','resize','orientationchange','visibilitychange']){
    const {element,window,document,stick,hero,tick}=setup();element.fire('pointerdown',{clientX:210});tick();
    if(event==='visibilitychange'){document.hidden=true;document.fire(event);}
    else if(event.startsWith('pointer')||event==='lostpointercapture')element.fire(event);
    else window.fire(event);
    assert.equal(stick.active,false,event);document.hidden=false;const x=hero.x;tick();assert.equal(hero.x,x,event);
  }
});
test('PC、直式、未開局、暫停、死亡、結算、建造及彈窗不接受搖桿輸入',()=>{
  const changes=[s=>s.document.body.dataset.layout='desktop',s=>s.document.body.dataset.combatOrientation='portrait',s=>s.game.profession.selected=null,s=>s.game.paused=true,s=>s.hero.active=false,s=>s.game.status='victory',s=>s.game.build.pending={type:'hunter'},...['menuScreen','shopScreen','armoryScreen','lootScreen','reportScreen','buildDrawer'].map(key=>s=>s.game.ui[key]={hidden:false})];
  for(const change of changes){const s=setup();s.element.fire('pointerdown',{clientX:210});change(s);s.stick.sync();assert.equal(s.stick.active,false);assert.equal(s.element.hidden,true);s.element.fire('pointerdown',{clientX:210});assert.equal(s.stick.active,false);}
});
test('只設定英雄目標，不改士兵、塔或召喚物位置，也不直接寫入英雄座標',()=>{
  const {game,hero,element,stick}=setup();game.build.items=[{kind:'unit',x:350,y:305},{kind:'building',x:80,y:80}];game.summons=[{x:350,y:305}];
  const units=JSON.stringify(game.build.items),summons=JSON.stringify(game.summons);
  element.fire('pointerdown',{clientX:210});stick.update(.02);
  assert.equal(hero.x,350);assert.ok(hero.targetX>350);assert.equal(JSON.stringify(game.build.items),units);assert.equal(JSON.stringify(game.summons),summons);
});
test('持續推向邊界不會出圖，建築阻擋沿用 NavigationSystem 且可轉向離開',()=>{
  const {game,hero,element,tick}=setup();element.fire('pointerdown',{clientX:210});
  for(let i=0;i<300;i++)tick();assert.ok(hero.x<=game.navigation.clampPoint({x:1e6,y:hero.y}).x);
  hero.x=350;hero.y=305;game.build.items=[{kind:'building',x:410,y:305}];
  for(let i=0;i<100;i++)tick();assert.ok(hero.x<=410-game.navigation.obstacleRadius);
  const x=hero.x;element.fire('pointermove',{clientX:100});for(let i=0;i<5;i++)tick();assert.ok(hero.x<x);
});
test('腳下剛建成塔時允許向外離開，但不允許繼續走入塔中央',()=>{
  const {game,hero,element,tick}=setup();game.build.items=[{kind:'building',x:360,y:305}];
  element.fire('pointerdown',{clientX:210});tick();assert.equal(hero.x,350);
  element.fire('pointermove',{clientX:100});tick();assert.ok(hero.x<350);
});
test('搖桿保留自動攻擊與施法鎖定，攻擊／施法完成後繼續既有移動',()=>{
  const {hero,element,tick}=setup(),shots=[],enemy={active:true,x:410,y:305,progress:()=>1};
  element.fire('pointerdown',{clientX:210});tick(.02,[enemy],shots);assert.equal(hero.state,'attack');
  for(let i=0;i<25;i++)tick(.02,[enemy],shots);assert.ok(shots.length>0);
  hero.beginCast();const x=hero.x;tick(.02,[],shots);assert.equal(hero.x,x);assert.equal(hero.state,'cast');
  for(let i=0;i<40;i++)tick(.02,[],shots);assert.ok(hero.x>x);assert.equal(hero.state,'walk');
});
test('重新開局更換英雄物件後，不會沿用前局搖桿手勢',()=>{
  const {game,ns,element,stick}=setup();element.fire('pointerdown',{clientX:210});game.hero=new ns.entities.Hero(100,100);stick.update(.02);
  assert.equal(stick.active,false);assert.equal(game.hero.targetX,100);
});
