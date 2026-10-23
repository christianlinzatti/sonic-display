/** V320: restrained, genre-aware continuation and weight transfer of ADDITIVE rig
 * channels only. Authored GLB curves, hips/root translation and IK targets are
 * never edited.  Existing V307/V311 quality refinement runs before this layer.
 */
import type { AvatarRigMotion } from './avatarRigController';
import { resolveDanceQualityStyle, type DanceQualityStyle } from './danceQualityV307';

export interface NaturalDanceSettingsV320 {
  enabled:boolean;
  style:DanceQualityStyle;
  weightTransfer:number; // 0..100
  followThrough:number;  // 0..100
  groove:number;         // 0..100
  footSafety:number;     // 0..100
}
export const NATURAL_DANCE_KEY_V320='sonic-natural-dance-v320';
export const NATURAL_DANCE_EVENT_V320='sonic:natural-dance-v320';
export const DEFAULT_NATURAL_DANCE_V320:NaturalDanceSettingsV320={
  enabled:true,style:'auto',weightTransfer:64,followThrough:65,groove:62,footSafety:90,
};
const styles:DanceQualityStyle[]=['auto','rave','rap','cinematic'];
const safe=(n:unknown,fallback=0):number=>typeof n==='number'&&Number.isFinite(n)?n:fallback;
const clamp=(v:number,lo=0,hi=1)=>Math.max(lo,Math.min(hi,safe(v,lo)));
export function normalizeNaturalDanceV320(raw:unknown):NaturalDanceSettingsV320{
  if(!raw || typeof raw!=='object')return {...DEFAULT_NATURAL_DANCE_V320};
  const p=raw as Partial<NaturalDanceSettingsV320>;
  return {
    enabled:typeof p.enabled==='boolean'?p.enabled:true,
    style:styles.includes(p.style as DanceQualityStyle)?p.style as DanceQualityStyle:'auto',
    weightTransfer:Math.round(clamp(safe(p.weightTransfer,64),0,100)),
    followThrough:Math.round(clamp(safe(p.followThrough,65),0,100)),
    groove:Math.round(clamp(safe(p.groove,62),0,100)),
    footSafety:Math.round(clamp(safe(p.footSafety,90),0,100)),
  };
}
let cached:NaturalDanceSettingsV320|null=null;
export function readNaturalDanceV320():NaturalDanceSettingsV320{
  if(cached)return cached;
  if(typeof window==='undefined')return {...DEFAULT_NATURAL_DANCE_V320};
  try{cached=normalizeNaturalDanceV320(JSON.parse(window.localStorage.getItem(NATURAL_DANCE_KEY_V320)??'null'));}
  catch{cached={...DEFAULT_NATURAL_DANCE_V320};}
  return cached;
}
export function refreshNaturalDanceV320(){cached=null;return readNaturalDanceV320();}
export function writeNaturalDanceV320(settings:NaturalDanceSettingsV320){
  cached=normalizeNaturalDanceV320(settings);
  if(typeof window==='undefined')return;
  try{window.localStorage.setItem(NATURAL_DANCE_KEY_V320,JSON.stringify(cached));}catch{/* localStorage is optional */}
  window.dispatchEvent(new Event(NATURAL_DANCE_EVENT_V320));
}

export type NaturalDanceStateV320={lastTime:number|null; trackId:string; trailing:number; lateral:number;};
export const createNaturalDanceStateV320=():NaturalDanceStateV320=>({lastTime:null,trackId:'',trailing:0,lateral:0});
export interface NaturalDanceInputV320 {
  settings:NaturalDanceSettingsV320;
  time:number; delta:number; trackId?:string;
  playing:boolean; reducedMotion:boolean; genre?:string|null;
  section?:string; bpm?:number|null; beatPhase?:number|null; phaseConfidence?:number|null;
  kick?:number; snare?:number; beat?:number; energy?:number;
  plantedLeft?:boolean; plantedRight?:boolean;
  authoredClipPriority?:boolean;
}
/** A finite-width attack envelope preserves high-BPM rhythmic accents. */
export function naturalBeatWaveV320(seconds:number,bpm:number,beatPhase?:number|null,confidence?:number|null){
  const phase=typeof beatPhase==='number'&&Number.isFinite(beatPhase)&&safe(confidence)>=.8
    ? ((beatPhase%1)+1)%1
    : ((Math.max(0,safe(seconds))*clamp(bpm,55,240)/60)%1+1)%1;
  return Math.cos(2*Math.PI*phase);
}
/** Applies a small, recoverable procedural overlay with bounded energy. */
export function refineNaturalDanceV320<T extends AvatarRigMotion>(state:NaturalDanceStateV320,motion:T,input:NaturalDanceInputV320):T {
  const time=Math.max(0,safe(input.time));
  const dt=clamp(safe(input.delta),0,.1);
  const trackId=input.trackId??'';
  const discontinuity=state.lastTime!==null&&(time<state.lastTime-.12||time-state.lastTime>Math.max(3.5,dt*12));
  const newTrack=state.trackId!==trackId;
  state.trackId=trackId;state.lastTime=time;
  const setting=input.settings;
  if(newTrack||discontinuity||!input.playing||input.reducedMotion||!setting.enabled||dt===0){
    state.trailing=0;state.lateral=0;return motion;
  }
  const style=resolveDanceQualityStyle(setting.style,input.genre);
  const bpm=clamp(safe(input.bpm,120),55,240);
  const beatWave=naturalBeatWaveV320(time,bpm,input.beatPhase,input.phaseConfidence);
  const beat=clamp(safe(input.beat));
  const kick=clamp(safe(input.kick));
  const snare=clamp(safe(input.snare));
  const energy=clamp(safe(input.energy,.5));
  const section=input.section??'';
  const sectionGain=/intro|break|outro/i.test(section)?.42:/hook|drop|chorus/i.test(section)?1:.75;
  const sourceGain=input.authoredClipPriority?.3:1;
  const gain=sectionGain*sourceGain*(.55+.45*energy);
  const transfer=(setting.weightTransfer/100)*gain;
  const follow=(setting.followThrough/100)*gain;
  const groove=(setting.groove/100)*gain;
  if(transfer<=0&&follow<=0&&groove<=0&&setting.footSafety<=0)return motion;
  // A planted foot is never moved: this small weight-transfer signal only
  // changes upper-body counter-rotation and already-existing hip sway.
  const planted=!!(input.plantedLeft||input.plantedRight);
  const lateralTarget=(style==='rap'?.7:.5)*(Math.sin(time*2*Math.PI*bpm/240)*.5+.5*beatWave)*transfer;
  const rate=style==='rave'?17:style==='rap'?9:7;
  state.lateral+=(lateralTarget-state.lateral)*(1-Math.exp(-rate*dt));
  // Follow-through lags arm/shoulder input slightly without suppressing the kick.
  const source=clamp(safe(motion.armSwing)*.55+safe(motion.shoulderRoll)*.35+safe(motion.followThrough)*.1,-1,1);
  state.trailing+=(source-state.trailing)*(1-Math.exp(-dt*(style==='rave'?16:style==='rap'?10:8)));
  const delayed=clamp(source-state.trailing,-.7,.7);
  const out={...motion} as T & Record<string,number>;
  const weight=clamp(state.lateral,-1,1);
  const movement=style==='rap'?.075:style==='rave'?.047:.04;
  // Micro rotations are intentionally capped; never translate or keyframe bones.
  out.spineSway=clamp(safe(out.spineSway)-weight*.065,-1.2,1.2);
  out.hipSway=clamp(safe(out.hipSway)+weight*.04,-1.2,1.2);
  out.torsoTwist=clamp(safe(out.torsoTwist)-weight*.038,-.8,.8);
  out.counterArm=clamp(safe(out.counterArm)-weight*.038,-.8,.8);
  out.followThrough=clamp(safe(out.followThrough)+delayed*.11*follow,-1.2,1.2);
  out.headLag=clamp(safe(out.headLag)+delayed*.06*follow,-1.2,1.2);
  // Rap follows the snare; high-BPM genres follow kicks, not every sub-beat.
  const accent=(style==='rap'?snare:kick)*groove;
  const wiggle=movement*accent*(.65+.35*beatWave);
  out.shoulderRoll=clamp(safe(out.shoulderRoll)+wiggle,-1.2,1.2);
  out.leftArmAccent=clamp(safe(out.leftArmAccent)+wiggle*.5,-.35,.35);
  out.rightArmAccent=clamp(safe(out.rightArmAccent)-wiggle*.5,-.35,.35);
  if(planted&&setting.footSafety>0){
    const protection=setting.footSafety/100;
    const attenuation=1-protection*((input.plantedLeft&&input.plantedRight ? .94 : .56));
    out.footStep=clamp(safe(out.footStep)*attenuation,-1.2,1.2);
    out.legGroove=clamp(safe(out.legGroove)*(1-protection*.3),-1.2,1.2);
  }
  return out;
}
