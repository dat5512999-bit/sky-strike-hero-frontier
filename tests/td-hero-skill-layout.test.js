'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');

test('explicit skill cards preserve names, tooltips and atlas cells for every hero, including switching back to legacy icons',()=>{
  const ns={systems:{},TDGame:function(){}},list={dataset:{},innerHTML:''};
  ns.TDGame.prototype.updateOpeningPresentation=function(){list.innerHTML='legacy';};
  const context=vm.createContext({TowerFrontier:ns});
  for(const file of ['HeroRoster','HeroSkillPresentation'])vm.runInContext(fs.readFileSync(`src/td/systems/${file}.js`,'utf8'),context);
  const game=new ns.TDGame();game.ui={heroSkills:list};
  for(const id of [...Object.keys(ns.systems.HeroRoster.CLASSES),'hunter','chief','rogue']){
    game.selectedProfession=id;game.updateOpeningPresentation();const hero=ns.systems.HeroRoster.get(id);
    if(!hero.skillArt){assert.equal(list.dataset.iconArt,undefined);assert.equal(list.innerHTML,'legacy');continue;}
    assert.equal(list.dataset.iconArt,'true');
    assert.equal((list.innerHTML.match(/class="hero-skill-icon"/g)||[]).length,3);
    hero.skills.forEach((name,index)=>{assert(list.innerHTML.includes(`<em>${name}</em>`));assert(list.innerHTML.includes(`title="${hero.hints[index]}"`));});
    assert(list.innerHTML.includes(hero.skillArt));
    for(const position of ['0% 0%','100% 0%','0% 100%'])assert(list.innerHTML.includes('background-position:'+position));
  }
});

test('expedition atlas cards override legacy padding and can grow for wrapped labels',()=>{
  const css=fs.readFileSync('td-expedition.css','utf8'),selector='#td-profession-screen #td-hero-skills[data-icon-art="true"]>span';
  const rule=css.slice(css.indexOf(selector+'{')).split('}')[0];
  for(const declaration of ['display:grid!important','height:auto!important','padding:4px!important','grid-template-rows:var(--preview-icon-size) auto!important'])assert(rule.includes(declaration));
  for(const declaration of ['--preview-icon-size:42px','--preview-icon-size:23px','--preview-card-height:48px','overflow-wrap:anywhere'])assert(css.includes(declaration));
});
