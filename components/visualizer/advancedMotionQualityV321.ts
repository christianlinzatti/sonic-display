/** V321: bounded, non-destructive keyframe diagnostics and conservative polish.
 * Detect isolated quaternion spikes using neighbouring keyframes; never infer
 * world-space ground contact from a bone-local position curve. */
import type {QualityClip,QualityTrack} from './glbMotionQualityAnalyzer';

export type MotionQualitySettingsV321={enabled:boolean;strength:number;protectAuthored:boolean};
export const MOTION_QUALITY_KEY_V321='sonic-motion-quality-v321';
export const MOTION_QUALITY_EVENT_V321='sonic:motion-quality-v321';
export const DEFAULT_MOTION_QUALITY_V321:MotionQualitySettingsV321={enabled:false,strength:65,protectAuthored:true};
const clamp=(n:number,lo:number,hi:number)=>Math.max(lo,Math.min(hi,Number.isFinite(n)?n:lo));
export function normalizeMotionQualityV321(raw:unknown):MotionQualitySettingsV321{
 const s=(raw&&typeof raw==='object'?raw:{} ) as Partial<MotionQualitySettingsV321>;
 return {enabled:typeof s.enabled==='boolean'?s.enabled:false,strength:Math.round(clamp(typeof s.strength==='number'&&Number.isFinite(s.strength)?s.strength:65,0,100)),protectAuthored:typeof s.protectAuthored==='boolean'?s.protectAuthored:true};
}
let cached:MotionQualitySettingsV321|null=null;
export function readMotionQualityV321(){
 if(cached)return cached;
 if(typeof window==='undefined')return {...DEFAULT_MOTION_QUALITY_V321};
 try{cached=normalizeMotionQualityV321(JSON.parse(window.localStorage.getItem(MOTION_QUALITY_KEY_V321)??'null'));}
 catch{cached={...DEFAULT_MOTION_QUALITY_V321};}
 return cached;
}
export function refreshMotionQualityV321(){cached=null;return readMotionQualityV321();}
export function writeMotionQualityV321(input:MotionQualitySettingsV321){
 cached=normalizeMotionQualityV321(input);
 if(typeof window==='undefined')return;
 try{window.localStorage.setItem(MOTION_QUALITY_KEY_V321,JSON.stringify(cached));}catch{/* storage optional */}
 window.dispatchEvent(new Event(MOTION_QUALITY_EVENT_V321));
}
export type MotionQualityEventV321={kind:'isolated-rotation'|'rotation-step'|'fast-translation'|'possible-foot-slide'|'time-gap'|'invalid-time';track:string;atSeconds:number;severity:'warning'|'hint';detail:string;autoFixable:boolean};
export type TransitionQualityV321={angleRad:number|null;matchedJoints:number;recommendFadeSeconds:number;note:string};
const isFoot=(name:string)=>/(foot|ankle|toe|heel)/i.test(name);
const rot=(t:QualityTrack)=>/\.quaternion$/i.test(t.name)&&t.getValueSize()===4;
const pos=(t:QualityTrack)=>/\.position$/i.test(t.name)&&t.getValueSize()>=3;
function values4(t:QualityTrack,i:number){return Array.from({length:4},(_,j)=>Number(t.values[i*4+j]));}
function dot(a:number[],b:number[]){return a.reduce((n,x,i)=>n+x*b[i],0);}
function normal(a:number[]):number[]{const len=Math.hypot(...a);return len>1e-8?a.map(x=>x/len):[0,0,0,1];}
function angle(a:number[],b:number[]){return 2*Math.acos(clamp(Math.abs(dot(normal(a),normal(b))),0,1));}
function slerp(a:number[],b:number[],t:number){
 const n=normal(a),end=normal(b);
 let d=dot(n,end);const signed=d<0?end.map(x=>-x):end;d=Math.abs(d);
 if(d>.9995)return normal(n.map((x,i)=>x*(1-t)+signed[i]*t));
 const theta=Math.acos(clamp(d,0,1)),sin=Math.sin(theta);
 return n.map((x,i)=>(x*Math.sin((1-t)*theta)+signed[i]*Math.sin(t*theta))/sin);
}
function time(t:QualityTrack,i:number){return Number(t.times[i]);}
function validQuat(t:QualityTrack,i:number){const a=values4(t,i);return a.every(Number.isFinite)&&Math.hypot(...a)>.001;}
/** At most `maxEvents` samples per report; inputs are never modified. */
export function inspectMotionQualityV321(clip:QualityClip,maxEvents=120):MotionQualityEventV321[]{
 const issues:MotionQualityEventV321[]=[];
 const add=(issue:MotionQualityEventV321)=>{if(issues.length<maxEvents)issues.push(issue);};
 for(const track of (clip.tracks??[]).slice(0,240)){
  const size=track.getValueSize(),length=track.times.length;
  if(!Number.isInteger(size)||size<=0||length*size!==track.values.length)continue;
  for(let i=1;i<Math.min(length,4096)&&issues.length<maxEvents;i++){
   const dt=time(track,i)-time(track,i-1),at=time(track,i);
   if(!Number.isFinite(dt)||dt<=0){add({kind:'invalid-time',track:track.name,atSeconds:Number.isFinite(at)?at:0,severity:'warning',detail:'Ungültiger oder nicht steigender Keyframe-Zeitstempel',autoFixable:false});continue;}
   if(dt>.45)add({kind:'time-gap',track:track.name,atSeconds:at,severity:'hint',detail:`Abstand ${dt.toFixed(2)} s – Interpolation visuell überprüfen`,autoFixable:false});
   if(rot(track)&&validQuat(track,i)&&validQuat(track,i-1)){
    const current=values4(track,i),previous=values4(track,i-1);
    const jump=angle(previous,current);
    if(jump>1.25&&dt<.12){
     const next=i+1<length&&validQuat(track,i+1)?values4(track,i+1):null;
     const nextDt=i+1<length?time(track,i+1)-at:0;
     const isolated=!!next&&nextDt>0&&nextDt<.12&&angle(previous,next)<.42;
     add({kind:isolated?'isolated-rotation':'rotation-step',track:track.name,atSeconds:at,severity:'warning',detail:`Rotation um ${(jump*180/Math.PI).toFixed(0)}° in ${(dt*1000).toFixed(0)} ms`,autoFixable:isolated});
    }
   }else if(pos(track)){
    const a=[0,1,2].map(j=>Number(track.values[(i-1)*size+j]));
    const b=[0,1,2].map(j=>Number(track.values[i*size+j]));
    if(!a.every(Number.isFinite)||!b.every(Number.isFinite))continue;
    const horizontal=Math.hypot(b[0]-a[0],b[2]-a[2]);
    const total=Math.hypot(horizontal,b[1]-a[1]);
    if(total/dt>5)add({kind:'fast-translation',track:track.name,atSeconds:at,severity:'warning',detail:`Lokale Translation ${(total/dt).toFixed(1)} Modell-Einheiten/s`,autoFixable:false});
    if(isFoot(track.name)&&horizontal/dt>1.3&&Math.abs(b[1]-a[1])<.035&&dt<.15)
     add({kind:'possible-foot-slide',track:track.name,atSeconds:at,severity:'hint',detail:'Schnelle horizontale Fußbewegung bei kaum veränderter lokaler Höhe – kein gesicherter Bodenkontakt',autoFixable:false});
   }
  }
 }
 return issues.sort((a,b)=>a.atSeconds-b.atSeconds);
}
/** Only repair isolated one-frame quaternion spikes. Authored poses, all
 * timestamps, root translations, foot tracks and animation sources are retained. */
export function polishMotionClipV321<T extends QualityClip & {clone():T}>(clip:T,settings:MotionQualitySettingsV321):T{
 if(!settings.enabled||settings.strength<=0)return clip;
 const fixed=clip.clone();const strength=clamp(settings.strength,0,100)/100;
 for(const t of (fixed.tracks??[]).slice(0,240)){
  if(!rot(t)||isFoot(t.name))continue;
  const count=t.times.length;
  if(count<3||t.values.length!==count*4)continue;
  const mutable=t.values as unknown as {[index:number]:number};
  const original=Array.from(t.values as ArrayLike<number>,Number);
  const source={...t,values:original} as QualityTrack;
  for(let i=1;i<Math.min(count-1,4095);i++){
   const before=time(t,i)-time(t,i-1),after=time(t,i+1)-time(t,i);
   if(before<=0||after<=0||before>=.12||after>=.12)continue;
   if(!validQuat(source,i-1)||!validQuat(source,i)||!validQuat(source,i+1))continue;
   const a=values4(source,i-1),b=values4(source,i),c=values4(source,i+1);
   if(angle(a,b)<=1.25||angle(a,c)>=.42)continue;
   const proposal=slerp(a,c,before/(before+after));
   const candidate=slerp(b,proposal,strength);
   for(let j=0;j<4;j++)mutable[i*4+j]=candidate[j];
  }
 }
 return fixed;
}
/** Heuristic transition comparison: bone-local endpoints, never an IK proof. */
export function transitionQualityV321(a:QualityClip,b:QualityClip):TransitionQualityV321{
 const lookup=new Map(b.tracks.filter(rot).map(t=>[t.name,t]));let sum=0,matches=0;
 for(const t of a.tracks.filter(rot).slice(0,240)){
  const next=lookup.get(t.name);if(!next||!t.times.length||!next.times.length)continue;
  const end=values4(t,t.times.length-1),start=values4(next,0);
  if(!end.every(Number.isFinite)||!start.every(Number.isFinite))continue;
  sum+=angle(end,start);matches++;
 }
 const mean=matches?sum/matches:null;
 return {angleRad:mean,matchedJoints:matches,recommendFadeSeconds:mean===null?.35:clamp(.16+mean*.42,.16,.85),
  note:matches?'Heuristischer Vergleich lokaler Bone-Rotationen, keine Aussage über Weltpositionen oder Gelenksicherheit.':'Keine übereinstimmenden Quaternion-Tracks – Übergang nur in 3D beurteilen.'};
}
