(function(ns){
  'use strict';
  class PerformanceMonitor{
    constructor(panel,button){this.panel=panel;this.button=button;this.enabled=false;this.samples=[];this.lastDisplay=0;}
    toggle(){this.enabled=!this.enabled;this.samples=[];this.lastDisplay=0;if(this.panel)this.panel.hidden=!this.enabled;if(this.button){this.button.setAttribute('aria-pressed',String(this.enabled));this.button.textContent='顯示效能資訊：'+(this.enabled?'開':'關');}return this.enabled;}
    record(sample){
      if(!this.enabled||!this.panel)return;
      this.samples.push(sample);if(this.samples.length>120)this.samples.shift();
      if(sample.timestamp-this.lastDisplay<500)return;this.lastDisplay=sample.timestamp;
      const frames=this.samples.filter(item=>item.realMs>0),mean=frames.reduce((sum,item)=>sum+item.realMs,0)/(frames.length||1),peak=(key)=>{const values=this.samples.map(item=>item[key]).sort((a,b)=>a-b);return values[Math.floor((values.length-1)*.95)]||0;};
      const fps=mean?Math.round(1000/mean):0,update=peak('updateMs'),draw=peak('drawMs'),lag=Math.round(sample.backlogMs),discarded=Math.round(sample.discardedMs);
      this.panel.textContent='FPS '+fps+' · 影格 P95 '+peak('realMs').toFixed(1)+'ms\n更新 P95 '+update.toFixed(1)+'ms · 繪圖呼叫 P95 '+draw.toFixed(1)+'ms\n怪物 '+sample.monsters+' · 冰霜特效 '+sample.frostVfx+' · ×'+sample.speed+'\n追趕中 '+lag+'ms · 略過 '+discarded+'ms';
      this.panel.dataset.health=lag>33||fps<30?'slow':'normal';
    }
  }
  ns.systems.PerformanceMonitor=PerformanceMonitor;
})(globalThis.TowerFrontier);
