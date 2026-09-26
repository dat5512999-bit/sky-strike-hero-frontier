'use strict';
// A Canvas contract double: unlike a no-op Proxy, reject invalid radii and
// track state restoration. The browser probe separately uses a real Canvas.
function strictCanvas(){
  const calls=[],stack=[],state={globalAlpha:1,lineWidth:1};
  const methods={
    save(){stack.push({...state});},
    restore(){if(!stack.length)throw new Error('unbalanced Canvas restore');for(const key of Object.keys(state))delete state[key];Object.assign(state,stack.pop());},
    arc(x,y,r,...rest){radius(r);calls.push(['arc',x,y,r,...rest]);},
    ellipse(x,y,rx,ry,...rest){radius(rx);radius(ry);calls.push(['ellipse',x,y,rx,ry,...rest]);},
    createRadialGradient(x,y,r0,tx,ty,r1){radius(r0);radius(r1);return {addColorStop(){}};},
    createLinearGradient(){return {addColorStop(){}};}
  };
  function radius(r){if(!Number.isFinite(r))throw new Error('nonfinite Canvas radius');if(r<0){const error=new Error('negative Canvas radius: '+r);error.name='IndexSizeError';throw error;}}
  const ctx=new Proxy(state,{get(t,key){return key in t?t[key]:methods[key]||((...args)=>calls.push([key,...args]));},set(t,key,value){t[key]=value;return true;}});
  return {ctx,calls,get depth(){return stack.length;}};
}
module.exports={strictCanvas};
