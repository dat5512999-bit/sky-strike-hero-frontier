(function(ns){
  'use strict';
  // A presentation transform, not a second world or navigation system.
  class BattlefieldCamera {
    constructor(width,height){
      this.worldWidth=width;this.worldHeight=height;this.x=width/2;this.y=height/2;
      this.width=width;this.height=height;this.zoom=1;this.overview=false;this.enabled=false;this.map=null;
      this.inspect=false;this.follow=false;this.space=false;this.gesture=null;
    }
    fitScale(){return Math.min(this.width/this.worldWidth,this.height/this.worldHeight);}
    minimumReadableScale(){const camera=this.map&&this.map.camera;return camera?(camera.minUnitPixels||42)/(camera.referenceUnitSize||112):0;}
    canAutoFit(){return this.fitScale()+1e-8>=this.minimumReadableScale();}
    scale(){const fit=this.fitScale(),base=this.overview?fit:this.map&&this.map.camera?Math.max(fit,this.minimumReadableScale()):Math.max(this.width/this.worldWidth,this.height/this.worldHeight);return base*this.zoom;}
    configure(map){this.map=map||null;this.worldWidth=map.width;this.worldHeight=map.height;this.reset();return this;}
    initialView(){const focus=this.map&&this.map.openingFocus||{x:this.worldWidth/2,y:this.worldHeight/2};if(this.canAutoFit())this.showAll();else{this.overview=false;this.zoom=1;this.follow=false;this.inspect=false;this.focus(focus.x,focus.y);}this.started=true;return this.overview;}
    visibleFraction(){const s=this.scale(),visibleWidth=Math.min(this.worldWidth,this.width/s),visibleHeight=Math.min(this.worldHeight,this.height/s);return visibleWidth*visibleHeight/(this.worldWidth*this.worldHeight);}
    safeAreaVisible(){const area=this.map&&this.map.safeArea;if(!area)return true;const topLeft=this.worldToScreen(area.x,area.y),bottomRight=this.worldToScreen(area.x+area.width,area.y+area.height);return topLeft.x>=-1&&topLeft.y>=-1&&bottomRight.x<=this.width+1&&bottomRight.y<=this.height+1;}
    clamp(){
      const s=this.scale(),halfX=this.width/(2*s),halfY=this.height/(2*s);
      this.x=halfX>=this.worldWidth/2?this.worldWidth/2:Math.max(halfX,Math.min(this.worldWidth-halfX,this.x));
      this.y=halfY>=this.worldHeight/2?this.worldHeight/2:Math.max(halfY,Math.min(this.worldHeight-halfY,this.y));
    }
    resize(width,height){this.width=Math.max(1,width);this.height=Math.max(1,height);this.clamp();}
    worldToScreen(x,y){const s=this.scale();return{x:(x-this.x)*s+this.width/2,y:(y-this.y)*s+this.height/2};}
    screenToWorld(x,y){const s=this.scale();return{x:(x-this.width/2)/s+this.x,y:(y-this.height/2)/s+this.y};}
    contains(point){return point.x>=0&&point.x<=this.worldWidth&&point.y>=0&&point.y<=this.worldHeight;}
    pan(dx,dy){this.follow=false;this.x-=dx/this.scale();this.y-=dy/this.scale();this.clamp();}
    focus(x,y){this.x=x;this.y=y;this.clamp();}
    changeZoom(factor){if(factor<1&&(this.overview||this.zoom<=1)){this.showAll();return;}this.overview=false;this.zoom=Math.max(1,Math.min(this.map&&this.map.camera&&this.map.camera.maxZoom||2.2,this.zoom*factor));this.clamp();}
    showAll(){this.overview=true;this.zoom=1;this.follow=false;this.inspect=false;this.focus(this.worldWidth/2,this.worldHeight/2);}
    reset(){this.zoom=1;this.overview=false;this.follow=false;this.inspect=false;this.space=false;this.gesture=null;this.started=false;this.focus(this.worldWidth/2,this.worldHeight/2);}
    point(event,canvas){const r=canvas.getBoundingClientRect();return this.screenToWorld((event.clientX-r.left)*this.width/r.width,(event.clientY-r.top)*this.height/r.height);}
    begin(game){
      const body=document.body,edge=body.classList.contains('edge-combat'),map=ns.maps&&ns.maps.definitions[ns.config.mapId],enabled=(edge||Boolean(map&&map.camera))&&Boolean(game.profession.selected);
      this.enabled=enabled;
      if(body.dataset.camera!==(enabled?'on':'off'))body.dataset.camera=enabled?'on':'off';
      const canvas=game.canvas,ctx=game.ctx;
      if(!enabled){if(canvas.width!==ns.config.width||canvas.height!==ns.config.height){canvas.width=ns.config.width;canvas.height=ns.config.height;}return false;}
      const r=canvas.getBoundingClientRect();this.resize(r.width,r.height);
      if(!this.started){const requestedFollow=this.follow;this.initialView();if(requestedFollow)this.follow=true;}
      if(this.follow&&game.hero.active){this.overview=false;this.focus(game.hero.x,game.hero.y);}
      // Limit fill rate on high-DPI phones. Only resize the backing store when needed.
      const dpr=Math.min(1.5,globalThis.devicePixelRatio||1),w=Math.max(1,Math.round(r.width*dpr)),h=Math.max(1,Math.round(r.height*dpr));
      if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;}
      ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,w,h);
      ctx.save();ctx.scale(w/this.width,h/this.height);
      ctx.fillStyle='#07100e';ctx.fillRect(0,0,this.width,this.height);
      ctx.translate(this.width/2,this.height/2);ctx.scale(this.scale(),this.scale());ctx.translate(-this.x,-this.y);
      ctx.beginPath();ctx.rect(0,0,this.worldWidth,this.worldHeight);ctx.clip();
      return true;
    }
    end(game){
      const ctx=game.ctx;ctx.restore();
      const message=game.effects.find(effect=>effect.type==='text');
      if(!message)return;
      ctx.save();ctx.scale(game.canvas.width/this.width,game.canvas.height/this.height);
      ctx.globalAlpha=Math.min(1,message.time/message.max*2);ctx.fillStyle=message.color;
      ctx.shadowColor='#000';ctx.shadowBlur=6;ctx.textAlign='center';ctx.font='700 17px Microsoft JhengHei, sans-serif';
      ctx.fillText(message.text,this.width/2,Math.min(100,this.height*.24),Math.max(100,this.width-40));ctx.restore();
    }
    attach(game,ui){
      const canvas=game.canvas,camera=this;
      const blocked=()=>!camera.enabled||game.status!=='playing'||!game.profession.selected||
        ['menuScreen','shopScreen','lootScreen','armoryScreen','reportScreen'].some(key=>game.ui[key]&&!game.ui[key].hidden);
      const sync=()=>{
        ui.inspect.setAttribute('aria-pressed',String(camera.inspect));ui.follow.setAttribute('aria-pressed',String(camera.follow));
        ui.inspect.textContent=camera.inspect?'✓ 查看中':'✥ 拖曳查看';
        ui.status.textContent=camera.overview?'全圖 · 周邊不可部署':camera.inspect?'拖曳只移鏡頭，不下令':camera.follow?'跟隨英雄':'中鍵／空白＋拖曳查看';
        canvas.classList.toggle('camera-inspect',camera.inspect||camera.space);
      };
      const finish=event=>{
        if(camera.gesture&&(!event||event.pointerId===camera.gesture.id)){
          const id=camera.gesture.id;camera.gesture=null;game.dragHero=false;
          if(canvas.hasPointerCapture(id))canvas.releasePointerCapture(id);
        }
      };
      ui.inspect.onclick=()=>{camera.inspect=!camera.inspect;if(camera.inspect)camera.overview=false;camera.clamp();camera.follow=false;game.dragHero=false;sync();};
      ui.home.onclick=()=>{camera.overview=false;game.selectHero();camera.inspect=false;camera.follow=false;camera.focus(game.hero.x,game.hero.y);sync();};
      ui.follow.onclick=()=>{camera.follow=!camera.follow;camera.inspect=false;if(camera.follow){camera.overview=false;camera.focus(game.hero.x,game.hero.y);}sync();};
      ui.all.onclick=()=>{camera.showAll();sync();};
      ui.plus.onclick=()=>{camera.changeZoom(1.2);sync();};
      ui.minus.onclick=()=>{camera.changeZoom(1/1.2);sync();};
      canvas.addEventListener('wheel',event=>{
        if(blocked())return;event.preventDefault();const rect=canvas.getBoundingClientRect(),sx=(event.clientX-rect.left)*camera.width/rect.width,sy=(event.clientY-rect.top)*camera.height/rect.height,before=camera.screenToWorld(sx,sy);
        camera.changeZoom(event.deltaY<0?1.12:1/1.12);const after=camera.screenToWorld(sx,sy);camera.x+=before.x-after.x;camera.y+=before.y-after.y;camera.clamp();sync();
      },{passive:false});
      canvas.addEventListener('pointerdown',event=>{
        if(blocked())return;
        if(camera.gesture){event.preventDefault();event.stopImmediatePropagation();return;}
        if(event.button!==1&&!(event.button===0&&(camera.inspect||camera.space)))return;
        // One pointer owns the gesture; a second finger cannot deploy or move units.
        event.preventDefault();event.stopImmediatePropagation();game.dragHero=false;
        if(camera.gesture)return;
        camera.overview=false;camera.clamp();
        camera.follow=false;camera.gesture={id:event.pointerId,x:event.clientX,y:event.clientY};
        canvas.setPointerCapture(event.pointerId);sync();
      },true);
      canvas.addEventListener('pointermove',event=>{
        if(!camera.gesture)return;
        event.preventDefault();event.stopImmediatePropagation();
        if(event.pointerId!==camera.gesture.id)return;
        if(blocked()){finish(event);return;}
        camera.pan(event.clientX-camera.gesture.x,event.clientY-camera.gesture.y);
        camera.gesture.x=event.clientX;camera.gesture.y=event.clientY;
      },true);
      ['pointerup','pointercancel','lostpointercapture'].forEach(type=>canvas.addEventListener(type,event=>{
        if(!camera.gesture)return;event.stopImmediatePropagation();finish(event);
      },true));
      canvas.addEventListener('contextmenu',event=>{if(camera.inspect||camera.space||camera.gesture){event.preventDefault();event.stopImmediatePropagation();}},true);
      document.addEventListener('keydown',event=>{
        if(event.code!=='Space'||blocked()||/INPUT|TEXTAREA|SELECT|BUTTON|SUMMARY/.test(event.target.tagName)||event.target.isContentEditable)return;
        event.preventDefault();camera.space=true;game.dragHero=false;sync();
      });
      document.addEventListener('keyup',event=>{if(event.code==='Space'){camera.space=false;finish();sync();}});
      globalThis.addEventListener('blur',()=>{camera.space=false;finish();sync();});
      globalThis.addEventListener('resize',()=>{camera.space=false;finish();sync();});
      // Choosing a build card explicitly returns to issuing placement commands.
      game.ui.buildButtons.forEach(button=>button.addEventListener('click',()=>{camera.inspect=false;camera.space=false;finish();sync();}));
      ui.home.title='回到英雄並選取（F1 同樣可用）';
      this.sync=sync;sync();
    }
  }
  ns.systems.BattlefieldCamera=BattlefieldCamera;
})(globalThis.TowerFrontier);
