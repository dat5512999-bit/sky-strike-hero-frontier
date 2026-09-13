'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');

function load(){
  const root=path.resolve(__dirname,'..'),context=vm.createContext({console});
  context.globalThis=context;
  for(const file of ['src/td/namespace.js','src/td/config.js','src/td/systems/TargetSelector.js','src/td/systems/CombatFeedbackSystem.js','src/td/entities/Monster.js','src/td/entities/Projectile.js']){
    vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),context,{filename:file});
  }
  return context.TowerFrontier;
}

function formation(ns,count,pathPoints){
  const path=pathPoints||[{x:0,y:100},{x:700,y:100}];
  return Array.from({length:count},(_,index)=>{
    const monster=new ns.entities.Monster('grunt',1,path);
    monster.x=560-index*27;monster.y=100;monster.index=1;
    return monster;
  });
}

test('12／20／30 隻小怪呈三個穩定視覺錯位，邏輯路徑座標不變',()=>{
  for(const count of [12,20,30]){
    const ns=load(),monsters=formation(ns,count),before=monsters.map(m=>({x:m.x,y:m.y,index:m.index}));
    assert.equal(new Set(monsters.map(m=>m.visualLane)).size,3);
    const visible=monsters.map(m=>m.visualPosition());
    assert.ok(visible.some(point=>point.y<100));
    assert.ok(visible.some(point=>point.y>100));
    assert.ok(visible.every((point,index)=>Math.abs(point.y-monsters[index].y)<=24));
    const logicalSpacing=27,averageVisualSpacing=visible.slice(1).reduce((sum,point,index)=>sum+Math.hypot(point.x-visible[index].x,point.y-visible[index].y),0)/(count-1);
    assert.ok(averageVisualSpacing>logicalSpacing*1.15);
    assert.deepEqual(monsters.map(m=>({x:m.x,y:m.y,index:m.index})),before);
  }
});

test('彎道路的視覺法線平滑轉向，轉角前後不瞬移',()=>{
  const ns=load(),path=[{x:100,y:100},{x:300,y:100},{x:300,y:300}],monster=new ns.entities.Monster('grunt',1,path);
  monster.visualLane=1;monster.visualStagger=0;monster.x=299.9;monster.y=100;monster.index=1;
  const before=monster.visualPosition();monster.x=300;monster.y=100.1;monster.index=2;
  const after=monster.visualPosition();assert.ok(Math.hypot(after.x-before.x,after.y-before.y)<2);
});

test('×1／×2／×3 步進保持原本行進時間與邏輯路徑',()=>{
  for(const speed of [1,2,3]){
    const ns=load(),path=[{x:0,y:100},{x:300,y:100},{x:300,y:500}],left=new ns.entities.Monster('runner',1,path),right=new ns.entities.Monster('runner',1,path);
    left.visualLane=-1;right.visualLane=1;
    for(let step=0;step<80;step++){left.update(.016*speed);right.update(.016*speed);assert.equal(left.x,right.x);assert.equal(left.y,right.y);assert.equal(left.index,right.index);assert.equal(left.leaked,right.leaked);}
  }
});

test('索敵、濺射與連鎖仍用邏輯座標，視覺錯位不改命中',()=>{
  const ns=load(),path=[{x:0,y:100},{x:700,y:100}],make=()=>[100,135,170,205].map((x,index)=>{const m=new ns.entities.Monster('grunt',1,path);m.x=x;m.y=100;m.index=1;m.visualLane=index%2?1:-1;return m;});
  const monsters=make(),choice=ns.systems.TargetSelector.select({x:80,y:100},monsters,'nearest');assert.equal(choice,monsters[0]);
  const base=make(),shifted=make();shifted.forEach((m,index)=>{m.visualLane=index%2?-1:1;});
  for(const [group,options] of [[base,{damage:12,splash:45,attackType:'pierce'}],[shifted,{damage:12,splash:45,attackType:'pierce'}]])new ns.entities.Projectile({x:80,y:100},group[0],options).hit(group);
  assert.deepEqual(base.map(m=>m.health),shifted.map(m=>m.health));
  const chainA=make(),chainB=make();chainB.forEach((m,index)=>{m.visualLane=index%2?-1:1;});
  for(const group of [chainA,chainB])new ns.entities.Projectile({x:80,y:100},group[0],{damage:12,chain:4,chainRange:40,attackType:'magic'}).hit(group);
  assert.deepEqual(chainA.map(m=>m.health),chainB.map(m=>m.health));
  assert.ok(chainA[0].visualPosition().y!==chainA[0].y);
});

test('連鎖線與傷害跳字落在模型視覺位置，不改傷害結果',()=>{
  const ns=load(),path=[{x:0,y:100},{x:700,y:100}],monsters=[100,135].map(x=>{const m=new ns.entities.Monster('grunt',1,path);m.x=x;m.y=100;m.visualLane=1;return m;});
  const projectile=new ns.entities.Projectile({x:80,y:100},monsters[0],{damage:12,chain:2,chainRange:40,attackType:'magic'});
  projectile.hit(monsters);
  assert.equal(projectile.chainPoints[1].y,monsters[0].visualPosition().y);
  assert.ok(monsters.every(monster=>monster.health<monster.maxHealth));
  const feedback=new ns.systems.CombatFeedbackSystem();feedback.hit(monsters[0],12,false,'#fff');
  assert.equal(feedback.items[0].y,monsters[0].visualPosition().y);
});

test('滿血普通怪不畫血條；受傷、Hover、精英與 Boss 會顯示',()=>{
  const ns=load(),draws=[],ctx={save(){},restore(){},fillRect(...args){draws.push(args);},strokeRect(){}};
  const grunt=new ns.entities.Monster('grunt',1);grunt.drawHealthBar(ctx);assert.equal(draws.length,0);
  grunt.takeDamage(5);grunt.drawHealthBar(ctx);assert.ok(draws.length>0);
  draws.length=0;grunt.health=grunt.maxHealth;grunt.hitFlash=0;grunt.hovered=true;grunt.drawHealthBar(ctx);assert.ok(draws.length>0);
  draws.length=0;grunt.hovered=false;grunt.elite=true;grunt.drawHealthBar(ctx);assert.ok(draws.length>0);
  draws.length=0;new ns.entities.Monster('boss',5).drawHealthBar(ctx);assert.ok(draws.length>0);
});

test('Boss 在怪群之上繪製，大小怪的視覺錯位不改本體碰撞半徑',()=>{
  const ns=load(),monsters=[new ns.entities.Monster('boss',5),new ns.entities.Monster('grunt',5),new ns.entities.Monster('brute',5)];
  monsters.forEach(m=>{m.x=200;m.y=200;});
  assert.equal(monsters.slice().sort(ns.entities.Monster.compareForDraw).at(-1).type,'boss');
  assert.deepEqual(monsters.map(m=>m.radius),[30,16,22]);
});
