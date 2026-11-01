/** V754: opt-in, read-only geometric assessment of the actual V466 WebGL probe.
 * No pixel reading, no GPU timers, no claims about visible faces, occlusion or light levels.
 */
import type {ScreenRectV466,ProjectedAvatarV466} from '../../services/show/concertQualityInspectorV466';

export interface VisualProbeSnapshotV754 {
 at:number;canvas:ScreenRectV466|null;lyrics:ScreenRectV466|null;
 avatars:readonly ProjectedAvatarV466[];bodyV754?:readonly ProjectedBodyV754[];
}
export type VisualAnchorV754={x:number;y:number;inFront:boolean};
/** Only actual bones can produce body-clipping findings; estimates are unavailable. */
export interface ProjectedBodyV754 {
 slot:number;
 headSource:'head-bone'|'estimated';
 hips:VisualAnchorV754|null;
 leftFoot:VisualAnchorV754|null;
 rightFoot:VisualAnchorV754|null;
}
export type VisualFindingKindV754='camera'|'body'|'lyrics'|'overlap';
export type VisualFindingSeverityV754='attention'|'critical';
export interface VisualFindingV754 {
 code:string;kind:VisualFindingKindV754;severity:VisualFindingSeverityV754;
 message:string;basis:'projected-bone'|'projected-head'|'dom-rectangle';
}
export interface VisualQualityReportV754 {
 at:number;
 status:'ok'|'attention'|'critical'|'unavailable';
 reason:string;
 examined:number;
 verifiedBodies:number;
 missingBodyEvidence:number;
 lyricsApplicable:boolean;
 findings:readonly VisualFindingV754[];
 /** No pixel sampling / luminance calculation is performed. */
 lighting:'not-measured';
 method:'projected-bones-and-dom-rectangles';
}
/** Exact anatomical names with optional FBX/GLB namespace prefixes.
 * Never mistake HeadTop_End, toes or a mesh named Head for a matching bone.
 * The caller must additionally verify node.isBone.
 */
export type AnatomicalBoneV754='head'|'hips'|'leftFoot'|'rightFoot'|null;
export function classifyAnatomicalBoneV754(input:string):AnatomicalBoneV754 {
 const part=input.toLowerCase().split(/[\\:|.\/_-]/).filter(Boolean).pop()??'';
 const all=input.toLowerCase().replace(/[^a-z0-9]/g,'');
 const match=(name:string)=>part===name||all===name||all===`mixamorig${name}`||all===`vrm${name}`;
 if(match('head')||all==='jbipchead')return 'head';
 if(match('hips')||all==='jbipchips')return 'hips';
 if(match('leftfoot')||all==='jbiplfoot')return 'leftFoot';
 if(match('rightfoot')||all==='jbiprfoot')return 'rightFoot';
 return null;
}
export const VISUAL_QUALITY_HISTORY_LIMIT_V754=30;
const valid=(n:number)=>Number.isFinite(n);
const rectangle=(r:ScreenRectV466|null):r is ScreenRectV466=>
 !!r&&valid(r.x)&&valid(r.y)&&valid(r.width)&&valid(r.height)&&r.width>0&&r.height>0;
const inside=(p:VisualAnchorV754,r:ScreenRectV466,margin=0)=>
 p.inFront&&valid(p.x)&&valid(p.y)&&p.x>=r.x+margin&&p.x<=r.x+r.width-margin&&
 p.y>=r.y+margin&&p.y<=r.y+r.height-margin;
const overlaps=(a:ScreenRectV466,b:ScreenRectV466)=>
 Math.min(a.x+a.width,b.x+b.width)>Math.max(a.x,b.x)&&
 Math.min(a.y+a.height,b.y+b.height)>Math.max(a.y,b.y);
const noSignal=(reason:string):VisualQualityReportV754=>({at:0,status:'unavailable',reason,
 examined:0,verifiedBodies:0,missingBodyEvidence:0,lyricsApplicable:false,findings:[],
 lighting:'not-measured',method:'projected-bones-and-dom-rectangles'});
/** 1Hz probe supplies head projections and optional bone positions; everything else is UNKNOWN. */
export function assessVisualQualityV754(snapshot:VisualProbeSnapshotV754,now:number):VisualQualityReportV754 {
 if(!Number.isSafeInteger(now)||now<=0||!Number.isSafeInteger(snapshot.at)||snapshot.at<=0||
    now<snapshot.at-500||now-snapshot.at>5000)return noSignal('Keine frische WebGL-Projektion');
 if(!rectangle(snapshot.canvas))return noSignal('Keine gültige WebGL-Zeichenfläche');
 const c=snapshot.canvas, avatars=snapshot.avatars;
 if(!Array.isArray(avatars)||avatars.length===0||avatars.length>4||
    new Set(avatars.map(a=>a.slot)).size!==avatars.length||
    avatars.some(a=>!Number.isInteger(a.slot)||a.slot<0||a.slot>3))return noSignal('Keine gültigen Avatar-Slots');
 const findings:VisualFindingV754[]=[];
 const add=(code:string,kind:VisualFindingKindV754,severity:VisualFindingSeverityV754,message:string,basis:VisualFindingV754['basis'])=>
  findings.push({code,kind,severity,message,basis});
 const bodyBySlot=new Map((snapshot.bodyV754??[]).map(b=>[b.slot,b]));
 let examined=0,verifiedBodies=0,missingBodyEvidence=0;
 const lx=snapshot.lyrics;
 const lyricsApplicable=rectangle(lx)&&overlaps(c,lx);
 for(const avatar of avatars){
  if(avatar.loaded===false){
   add(`avatar-unloaded-${avatar.slot}`,'body','attention',`Avatar ${avatar.slot+1}: GLB-Mesh noch nicht geladen`,'projected-bone');
   continue;
  }
  examined++;
  const head:VisualAnchorV754={x:avatar.x,y:avatar.y,inFront:avatar.inFront};
  if(!inside(head,c)){
   add(`head-outside-${avatar.slot}`,'camera',avatar.anchor==='head-bone'?'critical':'attention',
     `Avatar ${avatar.slot+1}: projizierter Kopf außerhalb des Bilds oder hinter der Kamera${avatar.anchor==='head-bone'?'':' (geschätzter Kopfanker)'}`,
     'projected-head');
  }else if(avatar.anchor==='head-bone'&&!inside(head,c,Math.min(c.width,c.height)*.055)){
   add(`head-edge-${avatar.slot}`,'camera','attention',`Avatar ${avatar.slot+1}: Kopf nahe am Bildrand`,'projected-head');
  }
  const body=bodyBySlot.get(avatar.slot);
  if(avatar.anchor!=='head-bone'||body?.headSource!=='head-bone'||
    !body.leftFoot||!body.rightFoot||
    ![body.leftFoot,body.rightFoot].every(p=>valid(p.x)&&valid(p.y))){
   missingBodyEvidence++;continue;
  }
  verifiedBodies++;
  if(!inside(body.leftFoot,c)||!inside(body.rightFoot,c)){
   add(`feet-outside-${avatar.slot}`,'body','critical',
     `Avatar ${avatar.slot+1}: mindestens ein projizierter Fuß liegt außerhalb des Bilds`,'projected-bone');
  } else if(!inside(body.leftFoot,c,Math.min(c.width,c.height)*.025)||
            !inside(body.rightFoot,c,Math.min(c.width,c.height)*.025)){
   add(`feet-edge-${avatar.slot}`,'body','attention',
     `Avatar ${avatar.slot+1}: projizierte Füße sehr nahe am Bildrand`,'projected-bone');
  }
  // Head overlap is assessed separately below (works without foot-bone evidence).
 }
 if(lyricsApplicable&&lx){
  const r=lx as ScreenRectV466;
  if(r.x<c.x-1||r.y<c.y-1||r.x+r.width>c.x+c.width+1||r.y+r.height>c.y+c.height+1){
   add('lyrics-clipped','lyrics','attention','Aktive Lyrics reichen über die WebGL-Zeichenfläche hinaus','dom-rectangle');
  }
  for(const avatar of avatars){
   if(avatar.loaded===false)continue;
   const head={x:avatar.x,y:avatar.y,inFront:avatar.inFront};
   if(inside(head,c)&&inside(head,r)){
    add(`lyrics-head-${avatar.slot}`,'overlap','attention',
     `Avatar ${avatar.slot+1}: Kopfprojektion liegt im Lyrics-Rechteck (mögliche Überdeckung)`,'dom-rectangle');
   }
   const hips=bodyBySlot.get(avatar.slot)?.hips;
   if(hips&&inside(hips,c)&&inside(hips,r)){
    add(`lyrics-hips-${avatar.slot}`,'overlap','attention',
     `Avatar ${avatar.slot+1}: Hüftprojektion liegt im Lyrics-Rechteck (mögliche Überdeckung)`,'projected-bone');
   }
  }
 }
 if(examined===0)return {...noSignal('Noch keine geladenen GLB-Meshes'),at:snapshot.at};
 const status=findings.some(f=>f.severity==='critical')?'critical':findings.length?'attention':'ok';
 return {at:snapshot.at,status,reason:status==='ok'?'Keine geometrischen Auffälligkeiten erkannt':
  `${findings.length} geometrische Auffälligkeit(en)`,examined,verifiedBodies,missingBodyEvidence,
  lyricsApplicable:!!lyricsApplicable,findings,lighting:'not-measured',
  method:'projected-bones-and-dom-rectangles'};
}
/** Only fresh, distinct WebGL frames; history stays in component memory. */
export function appendVisualQualityV754(history:readonly VisualQualityReportV754[],next:VisualQualityReportV754):readonly VisualQualityReportV754[]{
 if(next.status==='unavailable'||next.at<=0||!Number.isSafeInteger(next.at)||
    history.length>0&&next.at<=history[history.length-1].at)return history;
 const stable=history.length&&next.at-history[history.length-1].at>10000?[]:history;
 return [...stable,next].slice(-VISUAL_QUALITY_HISTORY_LIMIT_V754);
}
export function summarizeVisualQualityV754(history:readonly VisualQualityReportV754[]){
 const counts={ok:0,attention:0,critical:0};
 const kinds={camera:0,body:0,lyrics:0,overlap:0};
 for(const report of history){
  if(report.status==='unavailable')continue;
  counts[report.status]++;
  for(const f of report.findings)kinds[f.kind]++;
 }
 return {samples:counts.ok+counts.attention+counts.critical,counts,kinds};
}
