(function(ns){
  'use strict';
  const Game=ns.TDGame;
  if(!Game||Game.prototype.heroSkillPresentationPatched)return;
  const previous=Game.prototype.updateOpeningPresentation;
  const positions=['0% 0%','100% 0%','0% 100%','100% 100%'];
  Game.prototype.updateOpeningPresentation=function(){
    const result=previous.apply(this,arguments),hero=this.selectedProfession&&ns.systems.HeroRoster.get(this.selectedProfession),list=this.ui&&this.ui.heroSkills;
    if(!hero||!list)return result;
    if(!hero.skillArt){delete list.dataset.iconArt;return result;}
    // Image elements are explicit DOM content. This survives compact-card CSS
    // changes where a pseudo-element can be suppressed or clipped.
    list.dataset.iconArt='true';
    list.innerHTML=hero.skills.map((skill,index)=>'<span data-skill-index="'+index+'" title="'+hero.hints[index]+'"><i class="hero-skill-icon" aria-hidden="true" style="background-image:url(\''+hero.skillArt+'\');background-position:'+positions[index]+'"></i><em>'+skill+'</em></span>').join('');
    return result;
  };
  Game.prototype.heroSkillPresentationPatched=true;
})(globalThis.TowerFrontier);
