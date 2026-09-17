'use strict';
// Offline measurement: never read Canvas pixels during gameplay.
const fs=require('node:fs'),vm=require('node:vm'),{rgba}=require('../tests/png-pixels.cjs');
const context=vm.createContext({Image:class{},console});context.globalThis=context;
for(const file of ['src/td/namespace.js','src/td/systems/ArtSystem.js'])vm.runInContext(fs.readFileSync(file,'utf8'),context);
const Art=context.TowerFrontier.systems.ArtSystem,art=new Art(),metrics={};
function measure(image,rect){
 const {width,height,pixels}=rgba(image.assetSrc),r=rect||[0,0,width/4,height/4],sx=Math.round(r[0]),sy=Math.round(r[1]),sw=Math.floor(r[2]),sh=Math.floor(r[3]);
 const rows=[];for(let y=0;y<sh;y++){let count=0;for(let x=0;x<sw;x++)if(pixels[((sy+y)*width+sx+x)*4+3]>=180)count++;if(count>=Math.max(4,sw*.025))rows.push(y);}
 if(!rows.length)throw Error('Empty sprite '+image.assetSrc);
 return {visible:(rows.at(-1)-rows[0]+1)/sh,foot:(rows.at(-1)+1)/sh};
}
for(const image of new Set([...Object.values(art.combatUnits),...Object.values(art.enemyActions),art.hero,art.heroHunter,art.heroRogue,art.heroHunterUnarmed,art.heroArcanistUnarmed,art.rogueUnarmed,art.wolf,art.arcaneElemental,art.cryptWraith,art.graveyardRevenant]))metrics[image.assetSrc]=measure(image);
for(const [type,r] of Object.entries(Art.BUILD_RECTS))metrics[type]=measure(art.buildAtlas,r);
const file='src/td/systems/ArtSystem.js';let source=fs.readFileSync(file,'utf8');
const block='  ArtSystem.SPRITE_METRICS='+JSON.stringify(metrics)+';';
source=source.replace(/  ArtSystem.SPRITE_METRICS=.*;\r?\n/,'');source=source.replace('  ns.systems.ArtSystem=ArtSystem;',block+'\n  ns.systems.ArtSystem=ArtSystem;');fs.writeFileSync(file,source);
console.log('Measured '+Object.keys(metrics).length+' sprite profiles.');
