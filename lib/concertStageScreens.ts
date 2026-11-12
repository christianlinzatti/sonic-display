import type {Track} from '../types/playbackCore';
import type {ConcertTier} from './concertStageShow';
export type StageScreenTrack=Pick<Track,'id'|'title'|'artist'|'albumCoverUrl'>;
export function stageScreenImageUrl(raw:string|null|undefined,origin:string):string|null{
 if(!raw||raw.length>2048)return null;
 try{const url=new URL(raw,origin);if(url.username||url.password)return null;return url.protocol==='https:'||url.protocol==='http:'&&url.origin===new URL(origin).origin?url.href:null;}catch{return null;}
}
export function planStageScreens(input:{active:boolean;enabled:boolean;tier:ConcertTier;source:string;track?:StageScreenTrack|null;protectedText:boolean;lyric:string}){
 const valid=!!input.track&&input.source===`track:${input.track.id}`;
 const count=input.active&&input.enabled&&valid?(input.tier==='high'?2:input.tier==='balanced'?1:0):0;
 const lyric=!input.protectedText&&input.lyric.length<=140?input.lyric.trim():'';
 return {count,opacity:input.protectedText?.18:.88,lyric:count===2?lyric:'',source:input.source};
}
function wrap(ctx:CanvasRenderingContext2D,text:string,width:number,maxLines:number):string[]{
 const words=text.replace(/\s+/g,' ').trim().slice(0,180).split(' '),lines:string[]=[];let line='';
 for(const word of words){const next=line?line+' '+word:word;if(ctx.measureText(next).width>width&&line){lines.push(line);line=word;}else line=next;}
 if(line)lines.push(line);if(lines.length>maxLines){lines.length=maxLines;lines[maxLines-1]+='…';}
 return lines.map(value=>{while(value.length>1&&ctx.measureText(value).width>width)value=value.slice(0,-2)+'…';return value;});
}
/** Image stays contained, captions stay outside the original album artwork. */
export function paintStageScreen(ctx:CanvasRenderingContext2D,track:StageScreenTrack|null,image:HTMLImageElement|null,lyric:string,poster:boolean){
 ctx.clearRect(0,0,512,640);const gradient=ctx.createLinearGradient(0,0,512,640);gradient.addColorStop(0,'#152539');gradient.addColorStop(1,'#070d18');ctx.fillStyle=gradient;ctx.fillRect(0,0,512,640);
 ctx.strokeStyle='#81c9e9';ctx.lineWidth=4;ctx.strokeRect(8,8,496,624);ctx.textAlign='center';ctx.textBaseline='middle';
 const title=track?.title||'Sonic Display',artist=track?.artist||'Live Konzert';
 if(poster){
  ctx.fillStyle='#09111e';ctx.fillRect(24,24,464,464);
  if(image&&image.naturalWidth>0&&image.naturalHeight>0){const scale=Math.min(464/image.naturalWidth,464/image.naturalHeight),w=image.naturalWidth*scale,h=image.naturalHeight*scale;ctx.drawImage(image,24+(464-w)/2,24+(464-h)/2,w,h);}
  else{ctx.strokeStyle='#69b3cd';ctx.lineWidth=7;for(let i=0;i<3;i++){ctx.beginPath();ctx.arc(256,256,65+i*43,0,Math.PI*2);ctx.stroke();}}
  ctx.fillStyle='#f0f7ff';ctx.font='600 36px system-ui,sans-serif';wrap(ctx,title,456,2).forEach((line,i)=>ctx.fillText(line,256,532+i*42));
  ctx.fillStyle='#a2c1d8';ctx.font='26px system-ui,sans-serif';wrap(ctx,artist,456,1).forEach(line=>ctx.fillText(line,256,610));
 }else{
  ctx.fillStyle='#89d7e8';ctx.font='600 20px system-ui,sans-serif';ctx.fillText(lyric?'LIVE LYRICS':'JETZT AUF DER BÜHNE',256,65);
  ctx.fillStyle='#f0f7ff';ctx.font='600 44px system-ui,sans-serif';const lines=wrap(ctx,lyric||title,440,7);lines.forEach((line,i)=>ctx.fillText(line,256,310+(i-(lines.length-1)/2)*54));
  ctx.fillStyle='#a2c1d8';ctx.font='28px system-ui,sans-serif';wrap(ctx,artist,440,2).forEach((line,i)=>ctx.fillText(line,256,562+i*34));
 }
}
