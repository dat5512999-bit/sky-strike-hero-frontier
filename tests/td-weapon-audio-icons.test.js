'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {load,enemy}=require('./helpers/td-runtime.cjs');
const {rgba}=require('./png-pixels.cjs');
const root=path.resolve(__dirname,'..');
const heroes=['frostland','hunter','arcanist','rogue','chief','goblin','naga','dwarf','dragonkin','egypt','bull'];

test('十一名英雄三階武器商品均指向存在且逐階不同的圖片格',()=>{
  const {ns}=load();
  for(const type of heroes){
    const hero=new ns.entities.Hero(100,100);hero.chooseClass(type);
    const shop=new ns.systems.ShopSystem(hero);
    const styles=[];
    for(let level=0;level<3;level++){
      hero.equipment.spear=level;
      const item=shop.offer('spear'),style=ns.systems.EquipmentSystem.iconStyle(item.visual);
      assert.equal(item.visual.level,level+1,type+' upgrade level');
      assert.ok(fs.existsSync(path.join(root,item.visual.iconAtlas)),type+' '+item.visual.iconAtlas);
      assert.match(style.backgroundImage,/\.png"\)$/);
      styles.push(style.backgroundImage+' '+style.backgroundPosition);
    }
    assert.equal(new Set(styles).size,3,type+' stages must have separate art cells');
  }
});

test('新娜迦與戰神武器圖集每格非空，且外角透明',()=>{
  for(const file of ['assets/td/naga/tidebreaker-weapons-v1.png','assets/td/neutral/bull-wargod-weapons-v1.png']){
    const {width,height,pixels}=rgba(path.join(root,file));assert.equal(width,height);assert.ok(width>=1024);
    for(const [x,y] of [[0,0],[width-1,0],[0,height-1],[width-1,height-1]])assert.ok(pixels[(y*width+x)*4+3]<10,file+' transparent corner');
    for(let row=0;row<2;row++)for(let col=0;col<2;col++){
      let content=0;for(let y=Math.floor((row+.12)*height/2);y<Math.floor((row+.88)*height/2);y+=4)for(let x=Math.floor((col+.12)*width/2);x<Math.floor((col+.88)*width/2);x+=4)if(pixels[(y*width+x)*4+3]>70)content++;
      assert.ok(content>300,file+' '+row+','+col+' empty');
    }
  }
});

test('升級武器待機不再常駐畫圓，攻擊僅有短暫武器光痕',()=>{
  const {ns}=load(),hero=new ns.entities.Hero(100,100),calls=[];hero.chooseClass('egypt');hero.equipment.spear=3;
  const ctx=new Proxy({}, {get(target,key){return target[key]||((...args)=>calls.push([key,...args]));},set(target,key,value){target[key]=value;return true;}});
  ns.systems.EquipmentSystem.drawSignature(ctx,hero);assert.equal(calls.length,0);
  hero.state='attack';hero.attackTimer=.2;ns.systems.EquipmentSystem.drawSignature(ctx,hero);
  assert.ok(calls.some(call=>call[0]==='lineTo'));assert.ok(!calls.some(call=>call[0]==='arc'));
});

test('購買武器後展示該階實際圖格，不再畫通用升級圓圈',()=>{
  const {ns}=load(),hero=new ns.entities.Hero(100,100);hero.chooseClass('dwarf');hero.equipment.spear=2;
  const weapon=ns.systems.EquipmentSystem.weapon(hero),draws=[];
  const ctx=new Proxy({}, {get(target,key){return target[key]||((...args)=>draws.push([key,...args]));},set(target,key,value){target[key]=value;return true;}});
  const effect={type:'weaponReveal',x:100,y:100,time:1,max:1,weapon,image:{ready:true,width:1254,height:1254}};
  ns.TDGame.prototype.drawWeaponReveal(ctx,effect);
  const crop=draws.find(call=>call[0]==='drawImage');
  assert.ok(crop,'must draw weapon image');
  assert.equal(crop[2],weapon.iconColumn*1254/weapon.iconColumns);
  assert.equal(crop[3],weapon.iconRow*1254/weapon.iconRows);
  assert.ok(!draws.some(call=>call[0]==='arc'),'purchase effect must not draw a ring');
});

test('所有英雄真正開火時才播攻擊音，沒有目標不播',()=>{
  const {ns}=load(),audio=ns.systems.FrostlandAudio,cues=[];audio.playAttack=type=>{cues.push(type);return true;};
  for(const type of heroes){const hero=new ns.entities.Hero(100,100);hero.chooseClass(type);const shot=[],target=enemy(ns,120,100);hero.update(.01,[target],shot);hero.update(.2,[target],shot);assert.ok(shot.length>0,type+' should fire');}
  assert.deepEqual(cues,heroes);
  const hero=new ns.entities.Hero(100,100);hero.chooseClass('hunter');hero.update(.5,[],[]);assert.equal(cues.length,heroes.length);
});

test('音效可由玩家關閉，且十一種英雄攻擊聲有有界播放途徑',()=>{
  const {ns}=load(),audio=ns.systems.FrostlandAudio,waves=[];
  assert.equal(audio.enabled,false);assert.equal(audio.playAttack('hunter'),false);
  audio.enabled=true;audio.context={state:'running',currentTime:0,destination:{},createOscillator(){const voice={frequency:{setValueAtTime(){},exponentialRampToValueAtTime(){}},connect(){},disconnect(){},start(){},stop(){this.onended?.()}};waves.push(voice);return voice;},createGain(){return{gain:{setValueAtTime(){},exponentialRampToValueAtTime(){}},connect(){},disconnect(){}};}};
  for(const type of heroes){audio.context.currentTime+=.2;assert.equal(audio.playAttack(type),true,type);}
  assert.equal(waves.length,heroes.length);assert.equal(audio.voices,0);audio.enabled=false;assert.equal(audio.playAttack('hunter'),false);
});

test('瀏覽器音效 API 異常時不中斷戰鬥，也不佔住聲道',()=>{
  const {ns}=load(),audio=ns.systems.FrostlandAudio;
  audio.enabled=true;audio.context={state:'running',currentTime:1,createOscillator(){throw new Error('audio device unavailable');}};
  assert.equal(audio.playAttack('hunter'),false);assert.equal(audio.voices,0);
});

test('各英雄大絕沿用自己的圖集第四格，不再落到共用圖',()=>{
  const {ns}=load(),code=fs.readFileSync(path.join(root,'src/td/TDGame.js'),'utf8');
  assert.match(code,/\[this\.ui\.skill,this\.ui\.thunder,this\.ui\.summon,this\.ui\.ultimate\]/);
  assert.match(code,/\['0% 0%','100% 0%','0% 100%','100% 100%'\]/);
  for(const type of ['chief','naga','dwarf','dragonkin','egypt','bull'])assert.ok(fs.existsSync(path.join(root,ns.systems.HeroRoster.get(type).skillArt)),type);
  for(const file of ['assets/td/frostland/skill-icons-v1.png','assets/td/goblin/skill-icons-v2.png'])assert.ok(fs.existsSync(path.join(root,file)),file);
});
