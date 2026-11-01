/** V785: local benchmark only; projected 3D glyph bounds + performer-position proxies.
 * No browser/React imports. A projected proxy is NOT a detected facial bounding box. */
export type LyricsModeV785='on'|'off';
export type NdcRectV785={left:number;right:number;bottom:number;top:number};
export type LyricsSampleV785={frame:number;expectedLine:number;displayedLine:number;rect:NdcRectV785|null;proxyOverlap:boolean};
export type LyricsSceneV785={id:string;pass:number;avatars:2|4;frames:number;clipPct:number;proxyOverlapPct:number;lineLagPct:number;maxConsecutiveLag:number;largePositionJumps:number;notes:string[]};
export type LyricsReportV785={format:'sonic-lyrics-protection-v785';version:1;mode:LyricsModeV785;environment:{renderer:string;viewport:string;dpr:number;userAgent:string;antialias:boolean;softwareRenderer:boolean};assets:{hashes:string[];mode:'reference'|'user-glb'};config:{passes:number;sampleFrames:number;warmupFrames:number;timeline:'scripted-shots-240f-v784';sampling:'projected-3d-glyph-bounds-v785'};scenes:LyricsSceneV785[]};
export type AnchorV785={x:number;y:number};
const round=(n:number)=>Math.round(n*1000)/1000;
export const LYRICS_ANCHORS_V785:readonly AnchorV785[]=[{x:0,y:-.66},{x:-.43,y:-.68},{x:.43,y:-.68},{x:0,y:-.79},{x:-.43,y:-.80},{x:.43,y:-.80}];
const overlapping=(a:NdcRectV785,b:NdcRectV785)=>a.left<b.right&&a.right>b.left&&a.bottom<b.top&&a.top>b.bottom;
export function selectLyricsAnchorV785(proxies:readonly [number,number][],preferred?:AnchorV785):AnchorV785{
  let selected=LYRICS_ANCHORS_V785[0],best=Infinity;
  for(const c of LYRICS_ANCHORS_V785){
    const box={left:c.x-.35,right:c.x+.35,bottom:c.y-.09,top:c.y+.14};
    let score=0;
    for(const [x,y] of proxies){if(!Number.isFinite(x)||!Number.isFinite(y))continue;
      const face={left:x-.11,right:x+.11,bottom:y-.19,top:y+.13};
      if(overlapping(box,face))score+=10;
      score+=Math.max(0,.23-Math.hypot(x-c.x,y-c.y));
    }
    // Hysteresis: keep the last safe anchor unless the alternative is meaningfully better.
    score+=Math.abs(c.x)*.04+(c.y<-.75?.03:0);
    if(preferred?.x===c.x&&preferred.y===c.y)score-=.22;
    if(score<best){best=score;selected=c;}
  }
  return selected;
}
export function lyricsProxyOverlapV785(rect:NdcRectV785,points:readonly [number,number][]):boolean{
  return points.some(([x,y])=>Number.isFinite(x)&&Number.isFinite(y)&&overlapping(rect,{left:x-.11,right:x+.11,bottom:y-.19,top:y+.13}));
}
export function summarizeLyricsSceneV785(id:string,pass:number,avatars:2|4,samples:readonly LyricsSampleV785[]):LyricsSceneV785{
  if(!id||!Number.isInteger(pass)||pass<0||![2,4].includes(avatars)||samples.length<90)throw Error('V785 Lyrics-Reihe unvollständig');
  let clips=0,overlaps=0,lags=0,streak=0,maxStreak=0,jumps=0;let previous:NdcRectV785|null=null;
  for(let i=0;i<samples.length;i++){
    const s=samples[i],r=s.rect;
    if(!Number.isInteger(s.frame)||s.frame<0||(i>0&&s.frame!==samples[i-1].frame+1)||
      !Number.isInteger(s.expectedLine)||s.expectedLine<0||s.expectedLine>3||!Number.isInteger(s.displayedLine)||s.displayedLine<0||s.displayedLine>3||
      typeof s.proxyOverlap!=='boolean'||!r||![r.left,r.right,r.bottom,r.top].every(Number.isFinite)||r.left>=r.right||r.bottom>=r.top||
      Math.max(Math.abs(r.left),Math.abs(r.right),Math.abs(r.bottom),Math.abs(r.top))>200)
      throw Error('V785: fehlende/ungültige projizierte Lyrics-Glyphen oder Frames');
    if(r.left<-.90||r.right>.90||r.bottom<-.90||r.top>.90)clips++;
    if(s.proxyOverlap)overlaps++;
    if(s.expectedLine!==s.displayedLine){lags++;maxStreak=Math.max(maxStreak,++streak)}else streak=0;
    if(previous){const x=(r.left+r.right)/2-(previous.left+previous.right)/2,y=(r.top+r.bottom)/2-(previous.top+previous.bottom)/2;
      if(Math.hypot(x,y)>.22)jumps++;}
    previous=r;
  }
  const pct=(x:number)=>round(100*x/samples.length);
  return {id,pass,avatars,frames:samples.length,clipPct:pct(clips),proxyOverlapPct:pct(overlaps),lineLagPct:pct(lags),maxConsecutiveLag:maxStreak,largePositionJumps:jumps,
    notes:['Projected Drei glyph geometry; performer overlaps use estimated lane/height proxies, not actual face boxes.',
      'Synthetic word/line cues; no Spotify, phoneme or actual vocal timing evidence.']};
}
