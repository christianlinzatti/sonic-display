/** V992 Cinematic Camera Director 3.0 – ONE existing R3F camera, no cuts.
 * Sources: confirmed V604/V895 scene boundaries, song playback clock, optional
 * measured V433 kick transient. Never infer timing, vocalist or bass from metadata.
 * The V848/V897 frame enters here, V898 dance composition and V351 safety follow.
 */
import type {CameraPlanV897,CameraPoseV897} from './cinematicCameraDirectorV897';

export type CinemaModeV992='story'|'performer'|'festival';
export interface CinemaSettingsV992 {
 enabled:boolean;mode:CinemaModeV992;intensity:number;
 accents:boolean;protectLyrics:boolean;protectDuets:boolean;
}
export const CINEMA_KEY_V992='sonic-cinematic-camera-director-v992';
export const DEFAULT_CINEMA_V992:Readonly<CinemaSettingsV992>={
 enabled:false,mode:'story',intensity:55,accents:true,protectLyrics:true,protectDuets:true,
};
const finite=(x:unknown):x is number=>typeof x==='number'&&Number.isFinite(x);
const clamp=(x:number,min:number,max:number)=>Math.max(min,Math.min(max,x));
const smooth=(x:number)=>{const t=clamp(x,0,1);return t*t*(3-2*t);};
export function normalizeCinemaV992(raw:unknown):CinemaSettingsV992 {
 const r=raw&&typeof raw==='object'&&!Array.isArray(raw)?raw as Partial<CinemaSettingsV992>:{};
 const flag=(k:'enabled'|'accents'|'protectLyrics'|'protectDuets')=>
  typeof r[k]==='boolean'?r[k] as boolean:DEFAULT_CINEMA_V992[k];
 return {enabled:flag('enabled'),mode:r.mode==='performer'||r.mode==='festival'?r.mode:'story',
  intensity:finite(r.intensity)?Math.round(clamp(r.intensity,0,100)):55,
  accents:flag('accents'),protectLyrics:flag('protectLyrics'),protectDuets:flag('protectDuets')};
}
export interface CinemaStateV992 {
 trackId:string;durationMs:number;positionMs:number;armed:boolean;onsetMs:number;
}
export const createCinemaStateV992=():CinemaStateV992=>({
 trackId:'',durationMs:0,positionMs:-1,armed:false,onsetMs:-1,
});
export interface CinemaInputV992 {
 pose:CameraPoseV897;plan?:CameraPlanV897|null;settings:CinemaSettingsV992;
 trackId:string;durationMs:number;positionMs:number;playing:boolean;
 autoEnabled:boolean;directorEnabled:boolean;directorCameraEnabled:boolean;
 reducedMotion:boolean;tier:'low'|'balanced'|'high';aspect:number;
 authored?:boolean;manualFx?:boolean;seekBlocked?:boolean;blackout?:boolean;
 lyricsProtected?:boolean;lyricsVisible?:boolean;vocalCloseup?:boolean;
 duo?:boolean;measuredKick?:number;
}
export interface CinemaCueV992 {
 active:boolean;pose:CameraPoseV897;sceneIndex:number;kind:'off'|'story'|'performer'|'festival';
 cameraRate:number;accent:number;reason:string;
}
/** Advance state only with the real song clock. Rewind/seek/track change arms no delayed accent. */
export function sampleCinemaV992(i:CinemaInputV992,state:CinemaStateV992):CinemaCueV992 {
 const off=(reason:string):CinemaCueV992=>({active:false,pose:i.pose,sceneIndex:-1,
  kind:'off',cameraRate:1,accent:0,reason});
 const reset=()=>{state.trackId=i.trackId;state.durationMs=i.durationMs;
  state.positionMs=i.positionMs;state.armed=false;state.onsetMs=-1;};
 const pose=i.pose,p=i.plan,s=i.settings;
 const discontinuity=state.trackId!==i.trackId||state.durationMs!==i.durationMs||
  !finite(state.positionMs)||i.positionMs<state.positionMs-220||i.positionMs-state.positionMs>1100;
 if(discontinuity)reset();
 const blocked=!s.enabled||s.intensity<=0||!i.playing||!i.autoEnabled||!i.directorEnabled||
  !i.directorCameraEnabled||i.authored||i.manualFx||i.seekBlocked||i.blackout||
  i.reducedMotion||i.tier==='low'||
  (s.protectLyrics&&(i.lyricsProtected||i.lyricsVisible||i.vocalCloseup))||
  !p||p.source!=='verified-v604'||p.trackId!==i.trackId||p.durationMs!==i.durationMs||
  !i.trackId||!finite(i.durationMs)||i.durationMs<10000||i.durationMs>1800000||
  !finite(i.positionMs)||i.positionMs<0||i.positionMs>=i.durationMs||
  !finite(i.aspect)||i.aspect<.6||i.aspect>3.5||
  ![pose.x,pose.y,pose.z,pose.targetX??0,pose.targetY,pose.targetZ??0,pose.fov].every(finite)||
  pose.fov<28||pose.fov>76;
 if(blocked){reset();return off('protected-or-unverified');}
 const scene=p.scenes.find(x=>i.positionMs>=x.startMs&&i.positionMs<x.endMs);
 if(!scene||!Number.isInteger(scene.index)||scene.index<0||!finite(scene.startMs)||
   !finite(scene.endMs)||scene.startMs<0||scene.endMs>i.durationMs||
   scene.endMs-scene.startMs<2400){reset();return off('no-confirmed-scene');}
 const age=i.positionMs-scene.startMs,remaining=scene.endMs-i.positionMs;
 const blend=smooth(age/1800)*smooth(remaining/1800);
 const tier=i.tier==='balanced'?.6:1;
 const duet=i.duo&&s.protectDuets?.5:1;
 const gain=clamp(s.intensity/100,0,1)*blend*tier*duet;
 if(gain<.00001){state.positionMs=i.positionMs;state.onsetMs=-1;return off('scene-transition');}
 const t=age/(scene.endMs-scene.startMs);
 // Only small, deterministic micro-composition: established framing stays primary.
 const motion=Math.sin(Math.PI*2*t+scene.index*.43);
 const arc=Math.sin(Math.PI*t);
 const energetic=['hook','drop','finale'].includes(scene.section);
 const lyricScene=scene.section==='verse'||scene.section==='break';
 let dx=0,dy=0,dz=0,tx=0,ty=0,df=0;
 if(s.mode==='performer'||(s.mode==='story'&&lyricScene)){
  // Quiet performance-oriented dolly, no forced face tracking.
  dz=-.11*arc;tx=.012*motion;ty=.015*arc;df=-.40*arc;
 }else if(s.mode==='festival'||(s.mode==='story'&&energetic)){
  // Wide arena perspective for confirmed high-energy scenes.
  dx=.12*motion;dy=.055*arc;dz=.13*arc;tx=.015*motion;df=.50*arc;
 }else {
  dx=.075*motion;dy=.04*arc;dz=-.06*arc;tx=.012*motion;
 }
 // V433's live-normalized kick metric is evidence, not an invented drop boundary.
 const k=i.measuredKick;
 let accent=0;
 if(!finite(k)||k<0||k>1){state.armed=false;state.onsetMs=-1;}
 else if(k<=.32)state.armed=true;
 else if(s.accents&&energetic&&age>1100&&remaining>1000&&k>=.82&&state.armed&&
   (state.onsetMs<0||i.positionMs-state.onsetMs>850)){
  state.onsetMs=i.positionMs;state.armed=false;
 }
 if(s.accents&&energetic&&state.onsetMs>=0){
  const dt=i.positionMs-state.onsetMs;
  if(dt>=0&&dt<460)accent=Math.pow(1-dt/460,2)*.07*gain;
  else if(dt>=460)state.onsetMs=-1;
 }
 state.positionMs=i.positionMs;
 const next:CameraPoseV897={...pose,
  x:pose.x+dx*gain,y:pose.y+dy*gain,z:pose.z+dz*gain-accent,
  targetX:(pose.targetX??0)+tx*gain,targetY:pose.targetY+ty*gain,
  fov:clamp(pose.fov+df*gain-accent*2,28,76)};
 if(![next.x,next.y,next.z,next.targetX,next.targetY,next.fov].every(finite)||
  Math.hypot(next.x-(next.targetX??0),next.y-next.targetY,next.z-(next.targetZ??0))<1.8){
  reset();return off('framing-guard');}
 return {active:true,pose:next,sceneIndex:scene.index,kind:s.mode,
  cameraRate:clamp(1-.075*gain-(accent>0?.03:0),.92,1),accent,reason:'verified-scene'};
}
export function previewCinemaV992(plan:CameraPlanV897|null|undefined,settings:CinemaSettingsV992):
 {index:number;startMs:number;section:string;style:string}[]{
 if(!plan||plan.source!=='verified-v604'||!plan.trackId||!finite(plan.durationMs))return [];
 return plan.scenes.filter(x=>Number.isInteger(x.index)&&finite(x.startMs)&&finite(x.endMs)&&
  x.startMs>=0&&x.endMs<=plan.durationMs&&x.endMs-x.startMs>=2400).slice(0,12).map(x=>({
  index:x.index,startMs:x.startMs,section:x.section,
  style:settings.mode==='performer'||(settings.mode==='story'&&['verse','break'].includes(x.section))
   ?'Künstler-Nähe':settings.mode==='festival'||['hook','drop','finale'].includes(x.section)
   ?'Weite Arena':'Filmische Bewegung',
 }));
}
