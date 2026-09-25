'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const {load}=require('./helpers/td-runtime.cjs');

function setup(map='westernsignal'){const {ns,context}=load();vm.runInContext(fs.readFileSync('src/td/maps.js','utf8'),context);ns.maps.apply(map);return ns;}
function state(ns,wave,monster){return{waves:{wave},monsters:[monster]};}

test('荒風隘道僅在第二波起的指定中段加速，且不改道路資料',()=>{
  const ns=setup(),pressure=new ns.systems.MapPressureSystem(),path=ns.config.path,monster=new ns.entities.Monster('grunt',2,path),segments=pressure.distances();
  assert.equal(segments.length,1);assert.equal(ns.config.mapPressure.speedMultiplier,1.10);assert.equal(ns.config.mapPressure.controlFloor,1.035);assert.deepEqual(JSON.parse(JSON.stringify(ns.config.mapPressure.marker)),{x:696,y:292});
  monster.setRouteDistance(segments[0].start+4);pressure.update(state(ns,1,monster),.1);assert.equal(monster.mapPressure,null,'第一波不可有壓力');
  pressure.update(state(ns,2,monster),.1);assert.equal(monster.mapPressure.id,'western-wind-pass');
  const before=monster.routeDistance;monster.update(1,null,null);assert.ok(Math.abs(monster.routeDistance-before-monster.speed*1.1)<.001,'隘道內必須為 +10%');
  monster.setRouteDistance(segments[0].end+4);pressure.update(state(ns,2,monster),.1);assert.equal(monster.mapPressure,null,'離開隘道立刻回到正常路段');
});

test('荒風受緩速時只壓低至 +3.5%，定身仍維持既有短暫停止',()=>{
  const ns=setup(),pressure=new ns.systems.MapPressureSystem(),monster=new ns.entities.Monster('grunt',2,ns.config.path),segment=pressure.distances()[0];
  monster.setRouteDistance(segment.start+4);monster.applySlow(.5,3);pressure.update(state(ns,2,monster),.1);
  const before=monster.routeDistance;monster.update(1,null,null);assert.ok(Math.abs(monster.routeDistance-before-monster.speed*1.035)<.001,'緩速不可完全取消順風推進');
  monster.rootTime=1;const rooted=monster.routeDistance;monster.update(.2,null,null);assert.equal(monster.routeDistance,rooted,'既有定身仍可短暫停住敵軍');
});

test('地圖壓力情報在第二波預告與啟動時可讀',()=>{
  const ns=setup(),pressure=new ns.systems.MapPressureSystem(),game={waves:{wave:1},monsters:[]};
  assert.equal(pressure.summary(game,1),null);const info=pressure.summary(game,2);assert.equal(info.name,'荒風隘道');assert.equal(info.startsNow,true);assert.match(info.detail,/\+10%/);assert.match(info.detail,/\+3.5%/);
});

test('敵軍首次進入荒風隘道只產生有限且可隨減少特效關閉的沙塵衝刺',()=>{
  const ns=setup(),pressure=new ns.systems.MapPressureSystem(),monster=new ns.entities.Monster('runner',2,ns.config.path),segment=pressure.distances()[0],game=state(ns,2,monster);game.feedback={mobile:false,reducedFx:false};
  monster.setRouteDistance(segment.start+2);pressure.update(game,.1);assert.equal(pressure.gusts.length,1);pressure.update(game,.1);assert.equal(pressure.gusts.length,1,'留在隘道不應重複噴發');
  monster.setRouteDistance(segment.end+4);pressure.update(game,.1);monster.setRouteDistance(segment.start+2);game.feedback.reducedFx=true;pressure.update(game,.1);assert.equal(pressure.gusts.length,1,'減少特效不得新增沙塵');
  pressure.update(game,1);assert.equal(pressure.gusts.length,0,'短暫沙塵必須自行過期');
});

test('燼火煙障第三波起只增加局部護甲，控制能削弱但不能完全移除',()=>{
  const ns=setup('emberroad'),pressure=new ns.systems.MapPressureSystem(),monster=new ns.entities.Monster('grunt',3,ns.config.path),segment=pressure.distances()[0],game=state(ns,3,monster);
  assert.deepEqual(JSON.parse(JSON.stringify(ns.config.mapPressure.marker)),{x:625,y:455});assert.equal(ns.config.mapPressure.armorBonus,2);assert.equal(ns.config.mapPressure.controlArmorBonus,1);
  monster.setRouteDistance(segment.start+4);pressure.update(game,.1);assert.equal(monster.mapPressure.status,'煙');assert.equal(monster.mapPressure.armorBonus,2);
  const untouched=monster.health;monster.takeDamage(10);assert.equal(monster.health,untouched-8,'煙障內應只多 2 點護甲');
  monster.applySlow(.5,2);pressure.update(game,.1);assert.equal(monster.mapPressure.armorBonus,1);const controlled=monster.health;monster.takeDamage(10);assert.equal(monster.health,controlled-9,'控制後仍保留 1 點護甲');
  monster.setRouteDistance(segment.end+4);pressure.update(game,.1);assert.equal(monster.mapPressure,null,'離開煙障必須立即清除地圖護甲');
});
