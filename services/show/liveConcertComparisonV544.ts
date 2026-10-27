/** V544 – opt-in A/B comparison derived from REAL WebGL projections and DOM
 * bounds. No pixel images or skinned-motion quality are inferred here.
 * Pure functions: no background sampling, no persistence, no uploads.
 */
import type {ScreenRectV466,ProjectedAvatarV466} from './concertQualityInspectorV466';

export type SceneGradeV544='good'|'watch'|'issue'|'unknown';
export type ManualMarkV544='unchecked'|'good'|'issue';
export type VisualReviewV544={footwork:ManualMarkV544;faces:ManualMarkV544;lyrics:ManualMarkV544};
export const EMPTY_REVIEW_V544:VisualReviewV544={footwork:'unchecked',faces:'unchecked',lyrics:'unchecked'};
export interface HeadMarkV544 {slot:number;x:number;y:number;visible:boolean;estimated:boolean;loaded:boolean;}
export interface LyricMarkV544 {x:number;y:number;width:number;height:number;}
export interface SceneCaptureV544 {
 version:544; at:number; source:'live-webgl-head-projection';
 viewport:{width:number;height:number}; heads:readonly HeadMarkV544[];
 lyrics:LyricMarkV544|null; fps:number|null; p95FrameMs:number|null;
 samples:number; qualityTier:string; review:VisualReviewV544;
}
export interface QualityReadingV544 {
 at:number;canvas:ScreenRectV466|null;lyrics:ScreenRectV466|null;
 avatars:readonly ProjectedAvatarV466[];fps:number|null;p95FrameMs:number|null;
 samples:number;qualityTier:string;
}
const okNum=(n:number)=>Number.isFinite(n);
const clamp=(n:number)=>Math.min(1,Math.max(0,n));
const normalize=(n:number,min:number,size:number)=>clamp((n-min)/size);
export function captureLiveConcertV544(reading:QualityReadingV544,now:number):SceneCaptureV544|null {
 const box=reading.canvas;
 // Never store stale, partial or untrustworthy measurement sessions as real captures.
 if(!box||!okNum(box.width)||!okNum(box.height)||box.width<80||box.height<80||
  !okNum(now)||!okNum(reading.at)||reading.at<=0||now-reading.at<0||now-reading.at>3500||
  !reading.avatars.length||reading.avatars.length>4||!reading.avatars.every(a=>okNum(a.slot)&&okNum(a.x)&&okNum(a.y)))return null;
 const heads=reading.avatars.map(a=>({slot:a.slot,
  x:normalize(a.x,box.x,box.width),y:normalize(a.y,box.y,box.height),
  visible:a.inFront&&a.loaded!==false&&a.x>=box.x&&a.x<=box.x+box.width&&a.y>=box.y&&a.y<=box.y+box.height,
  estimated:a.anchor==='estimated',loaded:a.loaded!==false}));
 const l=reading.lyrics;
 const hasLyrics=!!l&&[l.x,l.y,l.width,l.height].every(okNum)&&l.width>0&&l.height>0&&
  l.x<box.x+box.width&&l.x+l.width>box.x&&l.y<box.y+box.height&&l.y+l.height>box.y;
 const lyrics=hasLyrics&&l?{x:normalize(l.x,box.x,box.width),y:normalize(l.y,box.y,box.height),
  width:clamp((Math.min(box.x+box.width,l.x+l.width)-Math.max(box.x,l.x))/box.width),
  height:clamp((Math.min(box.y+box.height,l.y+l.height)-Math.max(box.y,l.y))/box.height)}:null;
 // Rect origin must be the clipped region origin, not the original unclipped edge.
 if(lyrics&&l){lyrics.x=normalize(Math.max(l.x,box.x),box.x,box.width);lyrics.y=normalize(Math.max(l.y,box.y),box.y,box.height);}
 return {version:544,at:reading.at,source:'live-webgl-head-projection',
  viewport:{width:box.width,height:box.height},heads,lyrics,
  fps:reading.fps!==null&&okNum(reading.fps)&&reading.fps>0?reading.fps:null,
  p95FrameMs:reading.p95FrameMs!==null&&okNum(reading.p95FrameMs)&&reading.p95FrameMs>0?reading.p95FrameMs:null,
  samples:Math.max(0,Math.floor(reading.samples||0)),qualityTier:reading.qualityTier,
  review:{...EMPTY_REVIEW_V544}};
}
export interface CaptureAnalysisV544{
 grade:SceneGradeV544; visible:number; nearEdge:number; nearLyrics:number;
 estimated:number; fps:number|null; warnings:readonly string[]; reviewed:boolean;
}
export function analyzeCaptureV544(sample:SceneCaptureV544|null):CaptureAnalysisV544{
 if(!sample)return {grade:'unknown',visible:0,nearEdge:0,nearLyrics:0,estimated:0,fps:null,warnings:['Noch keine echte WebGL-Probe gespeichert'],reviewed:false};
 const heads=sample.heads;
 const visible=heads.filter(h=>h.loaded&&h.visible);
 const nearEdge=visible.filter(h=>h.x<.075||h.x>.925||h.y<.09||h.y>.91).length;
 const l=sample.lyrics;
 const nearLyrics=l?visible.filter(h=>h.x>=l.x-.045&&h.x<=l.x+l.width+.045&&h.y>=l.y-.055&&h.y<=l.y+l.height+.055).length:0;
 const estimated=heads.filter(h=>h.estimated&&h.loaded).length;
 const warnings:string[]=[];
 if(visible.length<heads.length)warnings.push(`${heads.length-visible.length} Kopfposition(en) außerhalb des Bildes oder noch nicht geladen`);
 if(nearEdge)warnings.push(`${nearEdge} Kopfposition(en) nahe am Bildrand`);
 if(nearLyrics)warnings.push(`${nearLyrics} mögliche Überschneidung(en) mit aktivem Lyrics-Bereich`);
 if(estimated)warnings.push(`${estimated} geschätzte Kopfposition(en) – kein sicherer Gesichtscheck`);
 if(sample.fps===null)warnings.push('Keine frische FPS-Messung erfasst');
 else if(sample.fps<30)warnings.push(`Niedrige FPS: ${sample.fps.toFixed(1)}`);
 const reviewed=Object.values(sample.review).every(x=>x!=='unchecked');
 if(Object.values(sample.review).includes('issue'))warnings.push('Mindestens eine manuelle Sichtprüfung ist auffällig');
 if(!reviewed)warnings.push('Tanz, Gesicht und Lyrics noch nicht vollständig visuell geprüft');
 const issue=visible.length===0||Object.values(sample.review).includes('issue')||(sample.fps!==null&&sample.fps<25);
 const watch=!issue&&(visible.length<heads.length||nearEdge>0||nearLyrics>0||estimated>0||!reviewed||sample.fps===null||sample.fps<45);
 return {grade:issue?'issue':watch?'watch':'good',visible:visible.length,nearEdge,nearLyrics,estimated,fps:sample.fps,warnings,reviewed};
}
export interface ContrastV544{
 status:'waiting'|'not-comparable'|'comparable';
 message:string; fpsDifference:number|null; edgeDifference:number|null; lyricsDifference:number|null;
}
export function compareConcertCapturesV544(a:SceneCaptureV544|null,b:SceneCaptureV544|null):ContrastV544{
 if(!a||!b)return {status:'waiting',message:'Für A/B zwei Live-Proben erfassen',fpsDifference:null,edgeDifference:null,lyricsDifference:null};
 if(a.heads.length!==b.heads.length||a.viewport.height<=0||b.viewport.height<=0||
  Math.abs(a.viewport.width/a.viewport.height-b.viewport.width/b.viewport.height)>.1)
  return {status:'not-comparable',message:'Andere Avatar-Anzahl oder deutlich anderes Seitenverhältnis – keine vergleichbare Szene',fpsDifference:null,edgeDifference:null,lyricsDifference:null};
 const x=analyzeCaptureV544(a),y=analyzeCaptureV544(b);
 return {status:'comparable',message:'B gegenüber A: negative Werte bedeuten weniger Auffälligkeiten',
  fpsDifference:a.fps===null||b.fps===null?null:Math.round((b.fps-a.fps)*10)/10,
  edgeDifference:y.nearEdge-x.nearEdge,lyricsDifference:y.nearLyrics-x.nearLyrics};
}
export function createComparisonReportV544(a:SceneCaptureV544|null,b:SceneCaptureV544|null){
 return {schema:'sonic-display.concert-visual-comparison.v544',exportedFrom:'local-browser',
  limitations:['Projection and DOM rectangles only; no screenshot or pixel-level face/occlusion verification',
   'Manual reviews are subjective; FPS samples are not a device benchmark'],
  captureA:a,captureB:b,assessmentA:analyzeCaptureV544(a),assessmentB:analyzeCaptureV544(b),comparison:compareConcertCapturesV544(a,b)};
}
