(function(ns){
  'use strict';
  // Pointer input only. Hero.setTarget/update remain the sole movement implementation.
  class HeroJoystick{
    constructor(game,element){
      this.game=game;this.element=element;this.pointerId=null;this.hero=null;this.direction={x:0,y:0};
      this.attach();this.sync();
    }
    get active(){return this.pointerId!==null;}
    available(){
      const game=this.game,view=document.body.dataset;
      return view.layout==='mobile'&&view.combatOrientation==='landscape'&&game.status==='playing'&&Boolean(game.profession.selected)&&game.hero.active&&!game.paused&&!document.hidden&&!game.build.pending&&
        !['menuScreen','shopScreen','armoryScreen','lootScreen','reportScreen','buildDrawer'].some(key=>game.ui[key]&&!game.ui[key].hidden);
    }
    consume(event){event.preventDefault();event.stopPropagation();}
    attach(){
      const element=this.element;
      element.addEventListener('pointerdown',event=>{
        this.consume(event);
        if(this.active||event.button!==0||!this.available())return;
        this.pointerId=event.pointerId;this.hero=this.game.hero;
        this.game.dragHero=false;this.game.heroDragPointer=null;
        this.hero.setTarget(this.hero.x,this.hero.y);
        const rect=element.getBoundingClientRect();
        this.center={x:rect.left+rect.width/2,y:rect.top+rect.height/2};this.radius=rect.width*.3;
        element.setPointerCapture(event.pointerId);element.dataset.active='true';
        this.readPointer(event);
      });
      element.addEventListener('pointermove',event=>{
        this.consume(event);if(event.pointerId!==this.pointerId)return;
        if(!this.available()){this.reset();return;}this.readPointer(event);
      });
      ['pointerup','pointercancel','lostpointercapture'].forEach(type=>element.addEventListener(type,event=>{
        this.consume(event);if(event.pointerId===this.pointerId)this.reset();
      }));
      ['click','contextmenu','dragstart'].forEach(type=>element.addEventListener(type,event=>this.consume(event)));
      ['blur','pagehide','resize','orientationchange'].forEach(type=>globalThis.addEventListener(type,()=>this.reset()));
      document.addEventListener('visibilitychange',()=>{if(document.hidden)this.reset();});
      // Secondary touch pointers do not consistently synthesize a click on mobile.
      // Forward an intentional right-thumb tap to the existing skill handler once.
      ['skill','thunder','summon','ultimate'].forEach(key=>{
        const button=this.game.ui[key];if(!button)return;let press=null,handledPointer=null;
        button.addEventListener('pointerdown',event=>{
          handledPointer=null;
          if(event.pointerType!=='touch'||event.isPrimary||!this.active||button.disabled)return;
          event.preventDefault();press={id:event.pointerId,x:event.clientX,y:event.clientY};button.setPointerCapture(event.pointerId);
        });
        button.addEventListener('pointerup',event=>{
          if(!press||press.id!==event.pointerId)return;
          const start=press;press=null;handledPointer=event.pointerId;event.preventDefault();
          if(button.hasPointerCapture(event.pointerId))button.releasePointerCapture(event.pointerId);
          if(Math.hypot(event.clientX-start.x,event.clientY-start.y)<14&&!button.disabled&&this.available())button.click();
        });
        ['pointercancel','lostpointercapture'].forEach(type=>button.addEventListener(type,()=>{press=null;}));
        button.addEventListener('click',event=>{if(event.isTrusted&&event.pointerId===handledPointer){event.preventDefault();event.stopImmediatePropagation();}},true);
      });
    }
    readPointer(event){
      const dx=event.clientX-this.center.x,dy=event.clientY-this.center.y,length=Math.hypot(dx,dy),travel=Math.min(length,this.radius);
      this.direction=length>this.radius*.16?{x:dx/length,y:dy/length}:{x:0,y:0};
      this.element.style.setProperty('--stick-x',(length?dx/length*travel:0)+'px');
      this.element.style.setProperty('--stick-y',(length?dy/length*travel:0)+'px');
      this.element.style.setProperty('--stick-angle',Math.atan2(dy,dx)+'rad');
      this.element.dataset.moving=String(Boolean(this.direction.x||this.direction.y));
      if(!this.direction.x&&!this.direction.y)this.hero.setTarget(this.hero.x,this.hero.y);
    }
    reset(){
      const id=this.pointerId,hero=this.hero;this.pointerId=null;this.hero=null;this.direction={x:0,y:0};
      if(hero)hero.setTarget(hero.x,hero.y);
      this.element.dataset.active='false';this.element.dataset.moving='false';
      this.element.style.setProperty('--stick-x','0px');this.element.style.setProperty('--stick-y','0px');
      if(id!==null&&this.element.hasPointerCapture(id))this.element.releasePointerCapture(id);
    }
    sync(){const enabled=this.available();if(!enabled&&this.active)this.reset();this.element.hidden=!enabled;return enabled;}
    update(dt){
      if(!this.sync()||!this.active)return;
      const game=this.game,hero=this.hero;
      if(hero!==game.hero){this.reset();return;}
      if(!this.direction.x&&!this.direction.y){hero.setTarget(hero.x,hero.y);return;}
      const distance=Math.max(4,hero.combatConfig().speed*dt+2),navigation=game.navigation;
      const target=navigation.clampPoint({x:hero.x+this.direction.x*distance,y:hero.y+this.direction.y*distance});
      // Reuse navigation clearance, but allow exiting a tower built over the hero.
      const obstacles=game.build.items.filter(item=>item.kind==='building'&&!(ns.utils.distance(hero,item)<navigation.obstacleRadius&&ns.utils.distance(target,item)>ns.utils.distance(hero,item)));
      if(navigation.segmentClear(hero,target,obstacles))hero.setTarget(target.x,target.y);
      else hero.setTarget(hero.x,hero.y);
    }
  }
  ns.systems.HeroJoystick=HeroJoystick;
})(globalThis.TowerFrontier);
