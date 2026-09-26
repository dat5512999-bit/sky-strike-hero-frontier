'use strict';
// Native Canvas QA: invokes production renderers without opening a browser or
// reading player state. Requires @napi-rs/canvas (available in the bundled runtime).
const {createCanvas,loadImage}=require('@napi-rs/canvas'),fs=require('node:fs'),path=require('node:path');
const {load,game,enemy}=require('../tests/helpers/td-runtime.cjs');
(async()=>{
  const {ns}=load(),g=game(ns),painted=await loadImage(path.resolve(ns.systems.PaintedTowerVFX.PATH)),frost=await loadImage(path.resolve('assets/td/frostland/spell-effects-v1.png'));
  const magic=await loadImage(path.resolve(ns.systems.PaintedTowerVFX.MAGIC_PATH));magic.ready=true;painted.ready=true;frost.ready=true;g.art={towerPaintedAtlas:painted,towerMagicAtlas:magic,frostSpellAtlas:frost};
  const kinds=[['arrow','Royal bolt'],['cannon','Cannon'],['grove','Living roots'],['crypt','Wraith'],['soul','Soul scythe'],['boulder','Boulder'],['plague','Poison spore'],['goblinSnare','Cable snare'],['goblinSiege','Rocket','rocket'],['frostGlacier','Glacier'],['nagaTidegate','Tidegate'],['storm','Thunder lance','surge']];
  const canvas=createCanvas(1440,1080),ctx=canvas.getContext('2d');ctx.fillStyle='#15222b';ctx.fillRect(0,0,1440,1080);ctx.fillStyle='#f1e5cd';ctx.font='bold 23px sans-serif';ctx.fillText('Painted tower VFX 2.0 | production renderer, native Canvas',24,34);ctx.font='14px sans-serif';ctx.fillStyle='#c0cbd1';ctx.fillText('Flight and impact at 0 ms / 100 ms / 230 ms. Native render study, not a gameplay screenshot.',24,60);
  const background=(x,y,w,h)=>{ctx.fillStyle='#8a785c';ctx.fillRect(x,y,w,h);ctx.fillStyle='#9c8867';for(let i=0;i<5;i++)ctx.fillRect(x+(i%2)*16,y+i*29,w-20,24);};
  for(let index=0;index<kinds.length;index++){
    const [type,label,branch]=kinds[index],x=index%3*480,y=88+Math.floor(index/3)*218;
    background(x+8,y+4,464,204);ctx.fillStyle='#f9efd7';ctx.font='bold 16px sans-serif';ctx.fillText(label,x+18,y+27);
    const tower=new ns.entities.Building(type,0,0);tower.synergy=g.synergy;tower.level=branch?3:1;if(branch)tower.chooseBranch(branch);tower.networkPowered=true;tower.cooldown=0;
    const targets=[enemy(ns,90,0),enemy(ns,140,10)],shots=[];tower.update(.01,targets,shots,[]);const p=shots[0];p.x=50;p.flightAge=.16;
    ctx.save();ctx.translate(x+22,y+110);p.draw(ctx);ctx.restore();p.update(.5,targets);
    for(let j=0;j<3;j++){p.trail=.32-[0,.1,.23][j];p.towerContact={x:0,y:0};p.chain=0;ns.entities.Projectile.beginFrame(96);ctx.save();ctx.translate(x+175+j*104,y+107);p.draw(ctx);ctx.restore();}
    ctx.fillStyle='#e9e1cc';ctx.font='12px sans-serif';for(const [label,lx]of [['flight',50],['0 ms',156],['100 ms',258],['230 ms',362]])ctx.fillText(label,x+lx,y+183);
  }
  background(8,970,1424,100);ctx.fillStyle='#f9efd7';ctx.font='14px sans-serif';ctx.fillText('Reference: Frostland hero mark | same scale',22,995);
  for(let i=0;i<3;i++){const age=[.025,.2,.5][i];ns.systems.FrostlandSpellArt.draw(ctx,{type:'mark',x:450+i*260,y:1040,target:{x:450+i*260,y:1040},age,duration:1.05},g.synergy);}
  const out=path.resolve('artifacts/tower-vfx-v2');fs.mkdirSync(out,{recursive:true});fs.writeFileSync(path.join(out,'native-contact-sheet.png'),canvas.toBuffer('image/png'));console.log(path.join(out,'native-contact-sheet.png'));
})();
