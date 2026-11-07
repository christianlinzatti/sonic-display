/** V1072 · Concert Camera Director 4.0.
 * A pure, opt-in camera-score layer for the TWO existing camera owners.
 * Musical chapters are authored V1040 templates, NOT detected Spotify sections.
 * The V1053 word-timestamp helper is the only source of phrase accents; it does
 * not determine which singer is active. Existing camera tracking retains that role.
 * No new cameras, render passes, timers, subscriptions, hardware or network calls.
 */
import type {ArenaShowCueV1040,ArenaShowPlanV1040} from './arena360ShowDesignerV1040';
import {normalizeArenaShowPlanV1040} from './arena360ShowDesignerV1040';
import {hasTimedVocalAccentV1053} from './arena360CinematicCameraV1053';
import type {Lyrics} from '../types/playbackCore';
import type {ArenaTierV1036} from './arena360AtmosphereV1036';

export type CameraShotV1072='wide'|'crane'|'orbit'|'dolly'|'vocal'|'ensemble';
export type CameraCueV1072={active:boolean;reason:'disabled'|'paused'|'motion'|'manual'|'clock'|'planned';
 shot:CameraShotV1072;previous:CameraShotV1072;blend:number;weight:number;
 seconds:number;lyricAccent:boolean;chapter:number;shotNumber:number;};
export const OFF_CAMERA_V1072:CameraCueV1072=Object.freeze({active:false,reason:'disabled',
 shot:'wide',previous:'wide',blend:0,weight:0,seconds:0,lyricAccent:false,chapter:-1,shotNumber:-1});
const clamp=(n:number,lo:number,hi:number)=>Number.isFinite(n)?Math.min(hi,Math.max(lo,n)):lo;
const smooth=(n:number)=>{const t=clamp(n,0,1);return t*t*(3-2*t);};
const CHAPTER_SHOTS:readonly (readonly CameraShotV1072[])[]=[
 ['wide','crane','orbit'],         // intro: establishing arc
 ['vocal','dolly','vocal','wide'], // verse 1: lyrics-friendly central framing
 ['dolly','orbit','crane'],       // build: rising energy
 ['ensemble','orbit','crane'],    // hook: show the whole cast
 ['wide','crane'],               // interlude: breathing room
 ['dolly','vocal','orbit','vocal'],// verse 2: contrast against verse 1
 ['ensemble','crane','wide'],    // finale: hand back to V1070
];
const finite=(n:unknown):n is number=>typeof n==='number'&&Number.isFinite(n);
const stableHash=(s:string)=>{let x=2166136261;for(let k=0;k<s.length;k++)x=Math.imul(x^s.charCodeAt(k),16777619);return x>>>0;};
const chooseShot=(chapter:number,slot:number,seed:number,vocal:boolean,multi:boolean):CameraShotV1072=>{
 const shots=CHAPTER_SHOTS[chapter]??CHAPTER_SHOTS[0];
 let shot=shots[(Math.max(0,slot)+seed%shots.length)%shots.length];
 // A close framing never claims an artist identity. For projects without
 // word-level synced lyrics, keep a gentle dolly shot instead of fake lip focus.
 if(shot==='vocal'&&!vocal)shot='dolly';
 if(shot==='ensemble'&&!multi)shot='wide';
 return shot;
};
/** Score changes no more frequently than every 10-16 seconds; two-second
 * crossfades remain continuous at both timed cuts and chapter boundaries. */
export function planConcertCameraDirectorV1072(i:{
 enabled:boolean;stageIsArena:boolean;cameraEnabled:boolean;playing:boolean;
 reducedMotion:boolean;reactive?:boolean;manualPriority?:boolean;
 showDesignerEnabled:boolean;showDirectorEnabled:boolean;
 show?:ArenaShowCueV1040|null;plan?:ArenaShowPlanV1040|null;
 trackId?:string|null;progressMs?:number|null;durationMs?:number|null;
 performanceTier?:ArenaTierV1036|null;strength?:number|null;
 lyrics?:Lyrics|null;lyricsPlaying?:boolean;castCount?:number|null;
}):CameraCueV1072{
 if(!i.enabled||!i.stageIsArena||!i.cameraEnabled||i.reactive===false||
  !i.showDesignerEnabled||!i.showDirectorEnabled)return OFF_CAMERA_V1072;
 if(!i.playing)return {...OFF_CAMERA_V1072,reason:'paused'};
 if(i.reducedMotion||i.performanceTier==='low')return {...OFF_CAMERA_V1072,reason:'motion'};
 if(i.manualPriority)return {...OFF_CAMERA_V1072,reason:'manual'};
 const ms=i.progressMs,dur=i.durationMs,str=i.strength;
 if(typeof i.trackId!=='string'||!i.trackId.trim()||!finite(ms)||!finite(dur)||
  !finite(str)||dur<30000||dur>900000||ms<0||ms>dur||str<=0||str>80)
  return {...OFF_CAMERA_V1072,reason:'clock'};
 const score=normalizeArenaShowPlanV1040(i.plan),show=i.show;
 if(!score||!show?.active||!finite(show.segmentIndex)||!Number.isInteger(show.segmentIndex)||
  show.segmentIndex<0||show.segmentIndex>=7||!finite(show.fade)||show.fade<0||show.fade>1||
  !finite(show.intensity)||show.intensity<0||show.intensity>100)
  return {...OFF_CAMERA_V1072,reason:'clock'};
 const p=ms/dur,chapter=score.segments.findIndex(s=>p<s.end);
 const idx=chapter===-1?6:chapter,segment=score.segments[idx];
 if(!segment||segment.scene!==show.scene||idx!==show.segmentIndex)
  return {...OFF_CAMERA_V1072,reason:'clock'};
 const seconds=ms/1000,local=Math.max(0,seconds-segment.start*dur/1000);
 // Hardtekk gets more dynamic (still >=10 s); quiet genres hold longer.
 const pacing=score.genre==='hard'?10:score.genre==='rap'?12:score.genre==='rock'?13:16;
 const cut=Math.floor(local/pacing),timeSinceCut=local-cut*pacing;
 const seed=stableHash(i.trackId),timedWords=i.lyricsPlaying===true&&!!i.lyrics?.synced&&
  i.lyrics.lines?.some(line=>line.words?.some(word=>finite(word.startMs)&&word.startMs>=0));
 const vocal=Boolean(timedWords),multi=finite(i.castCount)&&i.castCount>=2&&i.castCount<=8;
 const shot=chooseShot(idx,cut,seed,vocal,multi);
 let previous:CameraShotV1072;
 if(cut>0)previous=chooseShot(idx,cut-1,seed,vocal,multi);
 else if(idx===0)previous='wide';
 else{
  const preceding=score.segments[idx-1],length=(preceding.end-preceding.start)*dur/1000;
  const lastSlot=Math.max(0,Math.floor(Math.max(0,length-.001)/pacing));
  previous=chooseShot(idx-1,lastSlot,seed,vocal,multi);
 }
 const fadeSeconds=Math.min(2.4,pacing*.2),blend=smooth(timeSinceCut/fadeSeconds);
 const tier=i.performanceTier==='balanced'?.7:1;
 const weight=clamp(str/100,0,.8)*clamp(show.intensity/100,0,1)*clamp(show.fade,0,1)*tier;
 if(weight<=.0001)return OFF_CAMERA_V1072;
 return {active:true,reason:'planned',shot,previous,blend,weight,
  seconds,lyricAccent:!!(timedWords&&hasTimedVocalAccentV1053(i.lyrics,ms)),
  chapter:idx,shotNumber:cut};
}
/** Add only small, bounded offsets to a preexisting automatic camera pose.
 * No camera re-parenting or singer selection; retain the upstream target center.
 */
export function composeConcertCameraDirectorV1072<T extends {x:number;y:number;z:number;fov:number;
 targetX?:number;targetY:number;targetZ?:number}>(pose:T,cue?:CameraCueV1072|null,protectedShot=false):T{
 if(!cue?.active||protectedShot||!finite(cue.seconds)||!finite(cue.weight)||
  !finite(cue.blend)||![pose.x,pose.y,pose.z,pose.fov,pose.targetY].every(Number.isFinite)||
  (pose.targetX!==undefined&&!finite(pose.targetX))||
  (pose.targetZ!==undefined&&!finite(pose.targetZ)))return pose;
 const cx=pose.targetX??0,cz=pose.targetZ??0,dx=pose.x-cx,dz=pose.z-cz;
 const dist=Math.hypot(dx,dz),g=clamp(cue.weight,0,.8);
 if(dist<3.5||dist>28||g<=0)return pose;
 const score=(shot:CameraShotV1072)=>{
  const s=cue.seconds,slow=Math.sin(s*.12),breathe=Math.sin(s*.07);
  switch(shot){
   case 'vocal':return {radial:-.065,angle:0,height:.04,target:.09,zoom:-2.5};
   case 'ensemble':return {radial:.065,angle:0,height:.12,target:0,zoom:1.7};
   case 'orbit':return {radial:.018,angle:slow*.085,height:.08,target:0,zoom:.5};
   case 'crane':return {radial:.018,angle:slow*.065,height:.28+.07*breathe,target:.04,zoom:1};
   case 'dolly':return {radial:-.045+.015*slow,angle:slow*.045,height:.07,target:.025,zoom:-1};
   default:return {radial:.075,angle:0,height:.05,target:0,zoom:2.2};
  }
 };
 const a=score(cue.previous),b=score(cue.shot),blend=clamp(cue.blend,0,1);
 const interpolate=(key:keyof typeof a)=>a[key]*(1-blend)+b[key]*blend;
 const scale=1+g*interpolate('radial');
 const angle=g*interpolate('angle'),c=Math.cos(angle),s=Math.sin(angle);
 const lyricLift=cue.shot==='vocal'&&cue.lyricAccent ? .016*g : 0;
 return {...pose,x:cx+(dx*c-dz*s)*scale,z:cz+(dx*s+dz*c)*scale,
  y:pose.y+g*interpolate('height'),targetY:pose.targetY+g*interpolate('target')+lyricLift,
  fov:clamp(pose.fov+g*interpolate('zoom'),28,65)};
}
