'use strict';
// Decode 8-bit RGBA PNG pixels so tests verify transparency, not only the file header.
const fs = require('node:fs');
const zlib = require('node:zlib');
function rgba(file) {
  const data=fs.readFileSync(file),width=data.readUInt32BE(16),height=data.readUInt32BE(20),chunks=[];
  if(data[24]!==8||data[25]!==6||data[28]!==0)throw new Error('Expected non-interlaced 8-bit RGBA PNG: '+file);
  for(let offset=8;offset<data.length;){const length=data.readUInt32BE(offset);if(data.toString('ascii',offset+4,offset+8)==='IDAT')chunks.push(data.subarray(offset+8,offset+8+length));offset+=length+12;}
  const raw=zlib.inflateSync(Buffer.concat(chunks)),stride=width*4,pixels=Buffer.alloc(stride*height);
  function paeth(a,b,c){const p=a+b-c,pa=Math.abs(p-a),pb=Math.abs(p-b),pc=Math.abs(p-c);return pa<=pb&&pa<=pc?a:pb<=pc?b:c;}
  for(let y=0;y<height;y++){const filter=raw[y*(stride+1)];if(filter>4)throw new Error('Unknown PNG filter');for(let x=0;x<stride;x++){const i=y*stride+x,a=x>=4?pixels[i-4]:0,b=y?pixels[i-stride]:0,c=y&&x>=4?pixels[i-stride-4]:0;pixels[i]=(raw[y*(stride+1)+1+x]+[0,a,b,Math.floor((a+b)/2),paeth(a,b,c)][filter])&255;}}
  return {width,height,pixels};
}
module.exports={rgba};
