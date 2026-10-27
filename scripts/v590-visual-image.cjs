'use strict';
/** Dependency-free PNG decoding of Chromium PNG screenshots and pixel comparison. */
const zlib=require('node:zlib');
function decodePng(buffer){
 if(!Buffer.isBuffer(buffer)||buffer.subarray(0,8).toString('hex')!=='89504e470d0a1a0a')throw Error('Not a PNG');
 let offset=8,width=0,height=0,bitDepth=0,colorType=-1,interlace=1;const chunks=[];
 while(offset+12<=buffer.length){const size=buffer.readUInt32BE(offset),type=buffer.toString('ascii',offset+4,offset+8);
  if(size>100*1024*1024||offset+12+size>buffer.length)throw Error('Invalid PNG chunk');
  const data=buffer.subarray(offset+8,offset+8+size);offset+=12+size;
  if(type==='IHDR'){width=data.readUInt32BE(0);height=data.readUInt32BE(4);bitDepth=data[8];colorType=data[9];interlace=data[12];}
  if(type==='IDAT')chunks.push(data);if(type==='IEND')break;}
 if(width<1||height<1||width*height>8000000||bitDepth!==8||![2,6].includes(colorType)||interlace!==0||!chunks.length)
  throw Error('Unsupported PNG: require 8-bit noninterlaced RGB/RGBA chromium capture');
 const channels=colorType===6?4:3,stride=width*channels,uncompressed=zlib.inflateSync(Buffer.concat(chunks));
 if(uncompressed.length<(stride+1)*height)throw Error('Truncated PNG pixels');
 const rgb=Buffer.alloc(width*height*3),prev=Buffer.alloc(stride),row=Buffer.alloc(stride);
 let pos=0;
 for(let y=0;y<height;y++){
  const filter=uncompressed[pos++];if(filter>4)throw Error('Unsupported PNG filter');
  for(let x=0;x<stride;x++){
   const a=x>=channels?row[x-channels]:0,b=prev[x],c=x>=channels?prev[x-channels]:0;
   let predictor=0;
   if(filter===1)predictor=a;else if(filter===2)predictor=b;else if(filter===3)predictor=Math.floor((a+b)/2);
   else if(filter===4){const p=a+b-c,pa=Math.abs(p-a),pb=Math.abs(p-b),pc=Math.abs(p-c);predictor=pa<=pb&&pa<=pc?a:pb<=pc?b:c;}
   row[x]=(uncompressed[pos++]+predictor)&255;
  }
  for(let x=0;x<width;x++)for(let c=0;c<3;c++)rgb[(y*width+x)*3+c]=row[x*channels+c];
  row.copy(prev);
 }
 return {width,height,rgb};
}
function analyzePngs(a,b){
 const one=decodePng(a),two=decodePng(b);if(one.width!==two.width||one.height!==two.height)throw Error('Screenshot dimensions differ');
 let changed=0,total=one.width*one.height,sum=0;
 for(let i=0;i<total;i++){
  const o=i*3,d=Math.max(Math.abs(one.rgb[o]-two.rgb[o]),Math.abs(one.rgb[o+1]-two.rgb[o+1]),Math.abs(one.rgb[o+2]-two.rgb[o+2]));
  if(d>=22)changed++;sum+=d;
 }
 return {width:one.width,height:one.height,changedPixelFraction:Number((changed/total).toFixed(6)),averageMaxChannelDelta:Number((sum/total).toFixed(3)),threshold:22};
}
function contentCoverage(image){
 const {width,height,rgb}=decodePng(image),pixel=(y,x)=>{const i=(y*width+x)*3;return [rgb[i],rgb[i+1],rgb[i+2]];};
 const reference=pixel(Math.min(height-1,3),Math.min(width-1,3));let different=0,checked=0;
 for(let y=0;y<height;y+=3)for(let x=0;x<width;x+=3){const p=pixel(y,x);checked++;
  if(Math.max(...p.map((v,i)=>Math.abs(v-reference[i])))>24)different++;}
 return {nonBackgroundFraction:Number((different/checked).toFixed(5)),method:'relative-to-top-left-corner',note:'Heuristic only: backgrounds, floor grid and lights may be counted as foreground.'};
}
module.exports={decodePng,analyzePngs,contentCoverage};
