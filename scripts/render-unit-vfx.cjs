'use strict';
// Offline production-renderer QA. No browser/player state is accessed.
const {createCanvas,loadImage}=require('@napi-rs/canvas'),fs=require('node:fs'),path=require('node:path');
const {load,game,enemy}=require('../tests/helpers/td-runtime.cjs');
(async()=>{
 const {ns}=load(),g=game(ns);g.art={};
 for(const [slot,file]of Object.entries({soldierAtlas:ns.systems.UnitVFX.PATH,towerPaintedAtlas:ns.systems.PaintedTowerVFX.PATH,towerMagicAtlas:ns.systems.PaintedTowerVFX.MAGIC_PATH})){const image=await loadImage(path.resolve(file));image.ready=true;g.art[slot]=image;}
 const kinds=[['orc','Axe slash'],['halberdier','Spear thrust'],['shield','Shield contact'],['royalCommander','Royal hammer'],['frostBear','Ice shatter slam'],['soulsteel','Soulsteel slam'],['dragon','Emerald breath'],['nagaDeepWargod','Tidal blades'],['musketeer','Musket'],['alchemist','Poison'],['moonblade','Moonblade'],['kingdomMage','Lightning']];
 const canvas=createCanvas(1440,1020),ctx=canvas.getContext('2d');ctx.fillStyle='#15222b';ctx.fillRect(0,0,1440,1020);ctx.fillStyle='#f2ead9';ctx.font='bold 24px sans-serif';ctx.fillText('Soldier VFX 1.0 | production renderer / native Canvas',24,34);ctx.font='15px sans-serif';ctx.fillText('Release / contact / 100 ms / 230 ms. Material study, not a gameplay screenshot.',24,62);
 for(let i=0;i<kinds.length;i++){
  const [type,label]=kinds[i],x=i%3*480,y=84+Math.floor(i/3)*230;ctx.fillStyle='#89765b';ctx.fillRect(x+8,y,464,215);ctx.fillStyle='#a18b68';for(let row=0;row<6;row++)ctx.fillRect(x+12+row%2*12,y+30+row*27,440,22);ctx.fillStyle='#fff2d5';ctx.font='bold 17px sans-serif';ctx.fillText(label,x+19,y+25);
  const u=new ns.entities.CombatUnit(type,0,0);u.synergy=g.synergy;u.cooldown=0;const targets=[enemy(ns,70,0)],shots=[];u.attack(targets[0],u.config(),shots,targets);ns.systems.FrostlandAnimation.update(u,1,targets,shots);const p=shots[0];p.x=42;p.flightAge=.035;
  ns.entities.Projectile.beginFrame(96);ctx.save();ctx.translate(x+36,y+116);p.draw(ctx);ctx.restore();p.update(1,targets);p.chain=0;p.startX=-70;p.startY=22;p.chainPoints=[{x:-70,y:0},{x:0,y:0}];
  for(let j=0;j<3;j++){p.trail=.32-[0,.1,.23][j];ns.entities.Projectile.beginFrame(96);ctx.save();ctx.translate(x+174+j*104,y+98);p.draw(ctx);ctx.restore();}
  ctx.fillStyle='#fff2d5';ctx.font='12px sans-serif';for(const [label,lx]of [['release',46],['contact',150],['100 ms',258],['230 ms',362]])ctx.fillText(label,x+lx,y+192);
 }
 const out=path.resolve('artifacts/unit-vfx-v1');fs.mkdirSync(out,{recursive:true});fs.writeFileSync(path.join(out,'native-contact-sheet.png'),canvas.toBuffer('image/png'));console.log(path.join(out,'native-contact-sheet.png'));
})();
