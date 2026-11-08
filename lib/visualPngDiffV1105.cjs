'use strict';
/** Small, dependency-free PNG comparison for *same-run* Chromium screenshots.
 * No cross-platform golden snapshots: font/driver variance is excluded by design.
 */
const zlib = require('node:zlib');
const SIGNATURE = Buffer.from([137,80,78,71,13,10,26,10]);
const MAX_PIXELS = 3000000;
function decodePngV1105(data) {
  if (!Buffer.isBuffer(data) || data.length < 45 || !data.subarray(0,8).equals(SIGNATURE)) throw Error('Invalid PNG signature');
  let offset=8,width=0,height=0,channels=0,started=false,ended=false;
  const idat=[];
  while(offset+12<=data.length){
    const length=data.readUInt32BE(offset),type=data.toString('ascii',offset+4,offset+8);
    if(length>16*1024*1024 || offset+12+length>data.length) throw Error('Invalid PNG chunk');
    const chunk=data.subarray(offset+8,offset+8+length);offset+=12+length;
    if(type==='IHDR'){
      if(started||length!==13)throw Error('Invalid PNG header');started=true;
      width=chunk.readUInt32BE(0);height=chunk.readUInt32BE(4);
      if(width<1||height<1||width*height>MAX_PIXELS||chunk[8]!==8||chunk[9]>6||![2,6].includes(chunk[9])||chunk[10]!==0||chunk[11]!==0||chunk[12]!==0)throw Error('Unsupported PNG format');
      channels=chunk[9]===6?4:3;
    }else if(type==='IDAT'){if(!started||ended)throw Error('Invalid PNG IDAT');idat.push(chunk)}
    else if(type==='IEND'){ended=true;break}
  }
  if(!started||!ended||!idat.length)throw Error('Incomplete PNG');
  const stride=width*channels,expected=(stride+1)*height;
  const raw=zlib.inflateSync(Buffer.concat(idat),{maxOutputLength:expected+1});
  if(raw.length!==expected)throw Error('Invalid PNG raster size');
  const pixels=Buffer.allocUnsafe(stride*height);
  let input=0;
  for(let y=0;y<height;y++){
    const filter=raw[input++],row=y*stride;
    if(filter>4)throw Error('Invalid PNG filter');
    for(let x=0;x<stride;x++){
      const value=raw[input++],left=x>=channels?pixels[row+x-channels]:0,
        up=y?pixels[row-stride+x]:0,upperLeft=y&&x>=channels?pixels[row-stride+x-channels]:0;
      let predictor=0;
      if(filter===1)predictor=left;
      if(filter===2)predictor=up;
      if(filter===3)predictor=Math.floor((left+up)/2);
      if(filter===4){const p=left+up-upperLeft,a=Math.abs(p-left),b=Math.abs(p-up),c=Math.abs(p-upperLeft);predictor=a<=b&&a<=c?left:b<=c?up:upperLeft;}
      pixels[row+x]=(value+predictor)&255;
    }
  }
  return {width,height,channels,pixels};
}
function comparePngV1105(before,after,{maxDifferentRatio=0.07,channelTolerance=14}={}){
  const a=decodePngV1105(before),b=decodePngV1105(after);
  if(a.width!==b.width||a.height!==b.height||a.channels!==b.channels)
    return {passed:false,reason:'Screenshot dimensions changed',widthBefore:a.width,widthAfter:b.width,differentRatio:1};
  const pixels=a.width*a.height;let different=0,maxDelta=0;
  for(let p=0;p<pixels;p++){
    let drift=false;for(let c=0;c<a.channels;c++){
      const delta=Math.abs(a.pixels[p*a.channels+c]-b.pixels[p*b.channels+c]);
      maxDelta=Math.max(maxDelta,delta);if(delta>channelTolerance)drift=true;
    }
    if(drift)different++;
  }
  const ratio=different/pixels;
  return {passed:ratio<=maxDifferentRatio,width:a.width,height:a.height,differentPixels:different,
    totalPixels:pixels,differentRatio:ratio,maxDelta,threshold:maxDifferentRatio};
}
module.exports={comparePngV1105,decodePngV1105};
