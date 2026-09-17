(function(ns){
  'use strict';
  // A small view of the existing world. It never changes path, targeting or placement.
  class MiniMapView{
    constructor(button){
      this.button=button;
      this.canvas=button&&button.querySelector('canvas');
      this.ctx=this.canvas&&this.canvas.getContext('2d');
      this.lastPaint=0;
    }
    static fit(width,height,worldWidth,worldHeight){
      const scale=Math.min((width-8)/worldWidth,(height-8)/worldHeight);
      return{scale,x:(width-worldWidth*scale)/2,y:(height-worldHeight*scale)/2};
    }
    static point(clientX,clientY,rect,canvasWidth,canvasHeight,worldWidth,worldHeight){
      const fit=MiniMapView.fit(canvasWidth,canvasHeight,worldWidth,worldHeight);
      const x=((clientX-rect.left)/rect.width*canvasWidth-fit.x)/fit.scale;
      const y=((clientY-rect.top)/rect.height*canvasHeight-fit.y)/fit.scale;
      return x>=0&&x<=worldWidth&&y>=0&&y<=worldHeight?{x,y}:null;
    }
    attach(game){
      if(!this.button)return;
      this.button.addEventListener('click',event=>{
        const camera=game.camera;
        if(!camera||!camera.enabled||!game.profession.selected||game.status!=='playing')return;
        if(['menuScreen','shopScreen','lootScreen','armoryScreen','reportScreen'].some(key=>game.ui[key]&&!game.ui[key].hidden))return;
        const point=event.detail===0?{x:game.hero.x,y:game.hero.y}:
          MiniMapView.point(event.clientX,event.clientY,this.canvas.getBoundingClientRect(),this.canvas.width,this.canvas.height,camera.worldWidth,camera.worldHeight);
        if(!point)return;
        camera.overview=false;camera.follow=false;camera.inspect=false;camera.focus(point.x,point.y);
        if(camera.sync)camera.sync();
        this.lastPaint=0;
      });
    }
    draw(game){
      if(!this.ctx||!game.profession.selected||!game.camera||!game.camera.enabled)return;
      const now=Date.now();if(now-this.lastPaint<100)return;this.lastPaint=now;
      const ctx=this.ctx,canvas=this.canvas,camera=game.camera,w=camera.worldWidth,h=camera.worldHeight;
      const fit=MiniMapView.fit(canvas.width,canvas.height,w,h);
      ctx.clearRect(0,0,canvas.width,canvas.height);
      ctx.fillStyle='#071310';ctx.fillRect(0,0,canvas.width,canvas.height);
      ctx.save();ctx.translate(fit.x,fit.y);ctx.scale(fit.scale,fit.scale);
      const map=ns.maps&&ns.maps.definitions[ns.config.mapId],terrain=game.frontierTerrain&&game.frontierTerrain.cache;
      const art=map&&map.asset?game.art.mapAssets&&game.art.mapAssets[map.id]:ns.config.mapId==='frontier'?terrain:game.art.background;
      if(art&&(art.width||art.naturalWidth)&&(art.ready!==false))ctx.drawImage(art,0,0,w,h);
      else{ctx.fillStyle='#354a32';ctx.fillRect(0,0,w,h);}
      ctx.fillStyle='#07110b66';ctx.fillRect(0,0,w,h);
      ctx.strokeStyle='#e2c27fc0';ctx.lineWidth=4/fit.scale;ctx.lineJoin='round';ctx.lineCap='round';ctx.beginPath();
      (ns.config.routes||[ns.config.path]).forEach(route=>route.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y)));ctx.stroke();
      ctx.restore();
      const dot=(x,y,color,r)=>{ctx.fillStyle=color;ctx.beginPath();ctx.arc(fit.x+x*fit.scale,fit.y+y*fit.scale,r,0,Math.PI*2);ctx.fill();};
      for(const enemy of game.monsters)if(enemy.active)dot(enemy.x,enemy.y,enemy.boss?'#ffca69':'#f35e5e',enemy.boss?4:2);
      if(game.build&&game.build.towers)for(const ally of game.build.towers())dot(ally.x,ally.y,ally.kind==='building'?'#70cde6':'#8ee59e',2.2);
      if(game.hero.active)dot(game.hero.x,game.hero.y,'#fff0a4',3.4);
      const s=camera.scale(),left=Math.max(0,camera.x-camera.width/(2*s)),top=Math.max(0,camera.y-camera.height/(2*s));
      const right=Math.min(w,camera.x+camera.width/(2*s)),bottom=Math.min(h,camera.y+camera.height/(2*s));
      ctx.strokeStyle='#f5e4a5';ctx.lineWidth=1.5;ctx.strokeRect(fit.x+left*fit.scale,fit.y+top*fit.scale,Math.max(0,right-left)*fit.scale,Math.max(0,bottom-top)*fit.scale);
      ctx.strokeStyle='#ac8d50';ctx.lineWidth=1;ctx.strokeRect(fit.x+.5,fit.y+.5,w*fit.scale-1,h*fit.scale-1);
    }
  }
  ns.systems.MiniMapView=MiniMapView;
})(globalThis.TowerFrontier);
