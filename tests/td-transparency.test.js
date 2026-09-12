'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),path=require('node:path');
const {rgba}=require('./png-pixels.cjs');
test('巡林者武器底圖每一格的背景皆為真透明，不能烘焙棋盤格',()=>{
  const {width,height,pixels}=rgba(path.join(__dirname,'../assets/td/hero-hunter-actions-unarmed-v4.png'));
  assert.equal(width%4,0);assert.equal(height%4,0);
  const cw=width/4,ch=height/4;
  for(let row=0;row<4;row++)for(let col=0;col<4;col++){
    let clear=0,solid=0;
    for(let y=row*ch;y<(row+1)*ch;y++)for(let x=col*cw;x<(col+1)*cw;x++){const a=pixels[(y*width+x)*4+3];if(a===0)clear++;if(a>220)solid++;}
    assert.ok(clear/(cw*ch)>.35,`frame ${row},${col}: background must be transparent`);
    assert.ok(solid/(cw*ch)>.08,`frame ${row},${col}: character must remain visible`);
    // Corners are safely outside all sixteen character silhouettes.
    for(const dx of [2,cw-3])for(const dy of [2,ch-3])assert.equal(pixels[((row*ch+dy)*width+col*cw+dx)*4+3],0,`frame ${row},${col}: corner alpha`);
  }
});
