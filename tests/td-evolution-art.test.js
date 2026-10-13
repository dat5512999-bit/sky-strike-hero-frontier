'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const {load,game}=require('./helpers/td-runtime.cjs'),{strictCanvas}=require('./helpers/strict-canvas.cjs'),{rgba}=require('./png-pixels.cjs');

test('both bull evolution atlases have 20 complete transparent poses with measured safe rectangles',()=>{
  const {ns}=load();
  for(const form of Object.values(ns.systems.BullEvolutionAtlas)){
    const {width,height,pixels}=rgba(form.path);assert.equal(width,form.width);assert.equal(height,form.height);assert.equal(form.frames.length,20);
    assert.equal(pixels[3],0);const covered=new Uint8Array(width*height);
    for(const [x,y,w,h,fx,fy]of form.frames){
      assert(x>=0&&y>=0&&x+w<=width&&y+h<=height);assert(fx>x&&fx<x+w&&fy>y&&fy<y+h);
      let content=0,clear=0;
      for(let cy=y;cy<y+h;cy++)for(let cx=x;cx<x+w;cx++){
        const a=pixels[(cy*width+cx)*4+3];covered[cy*width+cx]=1;
        if(a>=48)content++;if(a===0)clear++;
        if(cx===x||cx===x+w-1||cy===y||cy===y+h-1)assert(a<48,form.path+' clipped edge '+cx+','+cy);
      }
      assert(content>10000);assert(clear>300,'real transparent gutters, not painted scenery');
    }
    let outside=0;for(let i=0;i<covered.length;i++)if(!covered[i]&&pixels[i*4+3]>=48)outside++;
    assert(outside<200,'no omitted weapon/limb components: '+outside);
    assert(form.worldHeight<=110,'hero must not grow to boss size');
  }
});
function renderer(ns){const art=Object.create(ns.systems.ArtSystem.prototype);art.load=path=>({assetSrc:path,ready:true,width:path.includes('transcendent')?1122:1024,height:path.includes('transcendent')?1402:1536});return art;}
test('bull renders distinct real sprites for both ranks, every state/frame and both directions without gear mutation',()=>{
  const {ns}=load(),art=renderer(ns),h=new ns.entities.Hero(100,100);h.chooseClass('bull');h.equipment.spear=3;h.equipment.core='fire';h.gear={weapon:'test'};
  const equipment=JSON.stringify(h.equipment),gear=JSON.stringify(h.gear);
  for(const rank of [1,2])for(const state of ['idle','walk','attack','cast','hit','death'])for(let frame=0;frame<4;frame++)for(const facing of [0,Math.PI]){
    Object.assign(h,{state,frame,facing,animationTime:frame/3});h.evolution.rank=rank;const c=strictCanvas();
    assert.equal(art.drawBullEvolution(c.ctx,h),true);assert.equal(c.depth,0);const imageCall=c.calls.find(a=>a[0]==='drawImage');assert.equal(imageCall[1].assetSrc,ns.systems.BullEvolutionAtlas[rank].path);
    assert.equal(ns.systems.HeroEvolutionPresentation.drawRegalia(c.ctx,h),false);
  }
  assert.equal(JSON.stringify(h.equipment),equipment);assert.equal(JSON.stringify(h.gear),gear);
});
test('original bull and purchased steel-foreman skin remain intact and loading/failed evolution art falls back',()=>{
  const {ns}=load(),art=renderer(ns),h=new ns.entities.Hero(100,100);h.chooseClass('bull');
  assert.equal(art.drawBullEvolution(strictCanvas().ctx,h),false);
  h.evolution.rank=2;art.cosmeticEquipped={'hero:bull':'steel-foreman'};assert.equal(art.drawBullEvolution(strictCanvas().ctx,h),false);
  let c=strictCanvas();assert.equal(art.drawBullWargod(c.ctx,h),true);assert(c.calls.some(a=>a[0]==='drawImage'&&a[1].assetSrc.includes('steel-foreman')));
  art.cosmeticEquipped={};const image=art.preloadBullEvolution(2);image.ready=false;image.failed=true;c=strictCanvas();assert.equal(art.drawBullWargod(c.ctx,h),true);assert(c.calls.some(a=>a[0]==='drawImage'&&a[1].assetSrc.includes('bull-wargod-actions-5x5')));
  image.ready=true;c=strictCanvas();assert.equal(art.drawBullEvolution(c.ctx,h),true);assert.equal(c.depth,0);
});
test('bull no longer receives a floating crown/badge while evolution skill effects still draw',()=>{
  const {ns}=load(),h=new ns.entities.Hero(100,100);h.chooseClass('bull');h.evolution.rank=2;let c=strictCanvas();
  ns.systems.HeroEvolutionPresentation.draw(c.ctx,null,h);assert.equal(c.calls.length,0);
  h.evolutionCast={slot:'q',rank:2,time:.5,max:1,targetX:150,targetY:100};c=strictCanvas();ns.systems.HeroEvolutionPresentation.draw(c.ctx,null,h);assert(c.calls.length>0);assert.equal(c.depth,0);
});
test('evolution fire-demon identity is isolated from ordinary bosses and mercenaries for both trials',()=>{
  const {ns}=load(),E=ns.systems.HeroEvolutionSystem;
  for(const rank of [0,1]){
    const g=game(ns);g.status='playing';g.waves=new ns.systems.WaveSystem();g.waves.wave=rank?50:20;g.waves.beginPreparation();g.hero.evolution.rank=rank;g.hero.evolution.stones=1;
    assert.equal(E.startTrial(g).ok,true);const boss=g.monsters[0];assert.equal(boss.trialAppearance,'fire-demon');assert.equal(boss.name,rank?'火焰惡魔・煉獄魔王':'火焰惡魔・熔火魔將');assert.equal(boss.maxHealth,E.GATES[rank+1].trialHealth.hunter);assert.equal(boss.reward,0);assert.equal(boss.baseDamage,0);
    ns.systems.BossVisualCatalog.apply(boss);assert.equal(boss.trialAppearance,'fire-demon');assert.match(boss.name,/火焰惡魔/);
    assert.equal(new ns.systems.EnemyCombatSystem().phase(boss,g.monsters,{}),undefined);assert.equal(g.monsters.length,1);
  }
  const regular=new ns.entities.Monster('boss',20,[{x:0,y:0},{x:100,y:0}]);assert.equal(regular.trialAppearance,undefined);assert.equal(ns.systems.EvolutionTrialArt.draw({},strictCanvas().ctx,regular),false);
  assert.equal(ns.config.units.fireDemon.name,'火焰惡魔');
});
test('fire demon renders actual attack/channel frames without a friendly badge and safely falls back when art is unavailable',()=>{
  const {ns}=load(),art={actionImage:()=>({ready:true,width:1254,height:1254})};
  for(const trialStage of [1,2])for(const state of ['idle','walk','attack','cast','hit','death'])for(let frame=0;frame<4;frame++)for(const facing of [0,Math.PI]){
    const c=strictCanvas(),m={evolutionTrial:true,trialAppearance:'fire-demon',trialStage,state,frame,facing,x:100,y:100};assert.equal(ns.systems.EvolutionTrialArt.draw(art,c.ctx,m),true);assert.equal(c.depth,0);assert.equal(c.calls.filter(a=>a[0]==='drawImage').length,1);assert(!c.calls.some(a=>a[0]==='fillText'));
  }
  assert.equal(ns.systems.EvolutionTrialArt.draw({actionImage:()=>({ready:false})},strictCanvas().ctx,{evolutionTrial:true,trialAppearance:'fire-demon'}),false);
});
test('fire eruption keeps the existing dodgeable 1.1-second telegraph and does not gain unavoidable damage',()=>{
  const {ns}=load(),g=game(ns);g.waves=new ns.systems.WaveSystem();g.waves.wave=20;g.waves.beginPreparation();g.hero.evolution.stones=1;ns.systems.HeroEvolutionSystem.startTrial(g);const m=g.monsters[0],combat=new ns.systems.EnemyCombatSystem(),warnings=[];
  m.abilityCooldown=0;combat.bossAbility(.01,m,g.hero,[],{onWarning:(m,label)=>warnings.push(label)});assert.equal(m.abilityWindup,1.1);assert.deepEqual(warnings,['熔火爆發']);const health=g.hero.health;
  g.hero.x=m.x+m.abilityRadius+5;combat.bossAbility(1.1,m,g.hero,[],{});assert.equal(g.hero.health,health);
});
test('new evolution art and scripts are shipped with the game and included in offline cache',()=>{
  const {ns}=load(),html=fs.readFileSync('td.html','utf8'),sw=fs.readFileSync('sw.js','utf8');
  for(const path of ['src/td/systems/BullEvolutionAtlas.js','src/td/systems/EvolutionTrialArt.js']){assert(html.includes(path));assert(sw.includes(path));}
  for(const form of Object.values(ns.systems.BullEvolutionAtlas))assert(sw.includes(form.path));
  assert(sw.includes('assets/td/neutral/fire-demon-actions-v1.png'));
});
