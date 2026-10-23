/**
 * V311 Advanced Dance Performance: conservative, song-clock-driven refinement of
 * the existing additive motion layer. Does not modify authored clips, root
 * translation, IK targets, or source skeletons.
 */
import type { AvatarRigMotion } from './avatarRigController';
import type { DanceTransitionPlan } from './smartDanceTransition';
import { resolveDanceQualityStyle, type DanceQualityStyle } from './danceQualityV307';

export interface AdvancedDanceSettingsV311 {
  enabled: boolean;
  style: DanceQualityStyle;
  fluidity: number;       // 0..100, damp rapid changes in additive channels
  balance: number;        // 0..100, small torso/hip counterbalances
  footProtection: number; // 0..100, restrain additive foot impulses under planted feet
  transitionPolish: number; // 0..100, bounded tuning of *automatic* clip crossfades
}
export const DANCE_PERFORMANCE_KEY_V311 = 'sonic-advanced-dance-v311';
export const DANCE_PERFORMANCE_EVENT_V311 = 'sonic:advanced-dance-v311';
export const DEFAULT_DANCE_PERFORMANCE_V311: AdvancedDanceSettingsV311 = {
  enabled:true, style:'auto', fluidity:62, balance:55, footProtection:85, transitionPolish:65,
};
const clamp=(x:number,min=0,max=1)=>Number.isFinite(x)?Math.min(max,Math.max(min,x)):min;
const finite=(v:unknown,fallback:number)=>typeof v==='number' && Number.isFinite(v)?v:fallback;
const styles: DanceQualityStyle[]=['auto','rave','rap','cinematic'];
let cached:AdvancedDanceSettingsV311|null=null;
export function normalizeDancePerformanceV311(raw:unknown):AdvancedDanceSettingsV311 {
  if(!raw||typeof raw!=='object')return {...DEFAULT_DANCE_PERFORMANCE_V311};
  const v=raw as Partial<AdvancedDanceSettingsV311>;
  return {
    enabled:typeof v.enabled==='boolean'?v.enabled:true,
    style:styles.includes(v.style as DanceQualityStyle)?v.style as DanceQualityStyle:'auto',
    fluidity:Math.round(clamp(finite(v.fluidity,62),0,100)),
    balance:Math.round(clamp(finite(v.balance,55),0,100)),
    footProtection:Math.round(clamp(finite(v.footProtection,85),0,100)),
    transitionPolish:Math.round(clamp(finite(v.transitionPolish,65),0,100)),
  };
}
export function readDancePerformanceV311():AdvancedDanceSettingsV311 {
  if(cached)return cached;
  if(typeof window==='undefined')return {...DEFAULT_DANCE_PERFORMANCE_V311};
  try{cached=normalizeDancePerformanceV311(JSON.parse(window.localStorage.getItem(DANCE_PERFORMANCE_KEY_V311)??'null'));}
  catch{cached={...DEFAULT_DANCE_PERFORMANCE_V311};}
  return cached;
}
export function refreshDancePerformanceV311(){cached=null;return readDancePerformanceV311();}
export function writeDancePerformanceV311(settings:AdvancedDanceSettingsV311) {
  cached=normalizeDancePerformanceV311(settings);
  if(typeof window==='undefined')return;
  try{window.localStorage.setItem(DANCE_PERFORMANCE_KEY_V311,JSON.stringify(cached));}catch{/* optional */}
  window.dispatchEvent(new Event(DANCE_PERFORMANCE_EVENT_V311));
}

const DAMPED_CHANNELS=['armSwing','leftArmAccent','rightArmAccent','shoulderRoll','spineSway','weightShift','legGroove','footStep'] as const;
type SmoothedChannel=typeof DAMPED_CHANNELS[number];
export type AdvancedDanceStateV311 = {lastTime:number|null;trackId:string;values:Partial<Record<SmoothedChannel,number>>;};
export const createAdvancedDanceStateV311=():AdvancedDanceStateV311=>({lastTime:null,trackId:'',values:{}});
export type DancePerformanceInputV311={
  settings:AdvancedDanceSettingsV311; playing:boolean; reducedMotion:boolean;
  time:number; delta:number; trackId?:string; genre?:string|null; section?:string;
  bpm?:number|null; kick?:number; snare?:number; beat?:number;
  plantedLeft?:boolean; plantedRight?:boolean;
  authoredClipPriority?:boolean;
};

/**
 * A small energy-conserving post-filter. It operates on reactive rig motion,
 * not on animation tracks. Under foot contact it only reduces additive leg
 * motion and never moves/rotates the actual planted foot's IK target.
 */
export function refineDancePerformanceV311<T extends AvatarRigMotion>(state:AdvancedDanceStateV311,motion:T,input:DancePerformanceInputV311):T {
  const time=finite(input.time,0),dt=clamp(finite(input.delta,0),0,.1);
  const id=input.trackId??'';
  const discontinuity=state.lastTime!==null && (time<state.lastTime-.12 || time-state.lastTime>Math.max(3.5,dt*12));
  const trackChanged=state.trackId!==id;
  state.lastTime=time;state.trackId=id;
  const enabled=input.settings.enabled && input.playing && !input.reducedMotion && (input.settings.fluidity>0 || input.settings.balance>0 || input.settings.footProtection>0);
  if(discontinuity||trackChanged||!enabled){state.values={};return motion;}
  const style=resolveDanceQualityStyle(input.settings.style,input.genre);
  const calm=/break|intro|outro/i.test(input.section??'');
  const emphasis=calm?.28:/drop|hook|chorus/i.test(input.section??'')?1:.68;
  const authored=input.authoredClipPriority?.35:1;
  const intensity=emphasis*authored;
  const smoothness=input.settings.fluidity/100;
  // Keep the original motion as input. Output allocation only when enabled.
  const result={...motion} as T & Record<string,number>;
  const hasFootContact=!!(input.plantedLeft||input.plantedRight);
  // A scalar footStep rotates both feet in opposite directions, so both must
  // be protected when *either* foot is planted; IK still owns actual grounding.
  const protection=(input.settings.footProtection/100)*(calm ? .7 : 1);
  if(hasFootContact){
    const attenuation=1-protection*(input.plantedLeft&&input.plantedRight?1:.85);
    result.footStep=finite(result.footStep,0)*attenuation;
    result.legGroove=finite(result.legGroove,0)*(1-protection*.62);
  }
  // Frame-rate independent bounded smoothing; only source additive channels.
  for(const key of DAMPED_CHANNELS){
    const target=clamp(finite(result[key],0),-1.5,1.5);
    const prev=state.values[key];
    if(prev===undefined){state.values[key]=target;result[key]=target;continue;}
    const speed=key==='footStep'||key==='legGroove'?(style==='rave'?19:12):style==='rap'?13:style==='cinematic'?10:17;
    const alpha=1-Math.exp(-dt*(speed*(1-.55*smoothness)));
    const softened=prev+(target-prev)*alpha;
    // Do not over-filter the source motion; retain attack for high-energy kicks.
    const blended=target*(1-.55*smoothness)+softened*(.55*smoothness);
    result[key]=clamp(blended,-1.5,1.5);
    state.values[key]=blended;
  }
  if(input.settings.balance>0){
    const balance=(input.settings.balance/100)*intensity;
    const lateral=clamp(finite(result.weightShift,0),-.8,.8);
    const upper=clamp(finite(result.spineSway,0),-.8,.8);
    const beat=clamp(finite(input.beat,0)),kick=clamp(finite(input.kick,0));
    const response=(style==='rave' ? .7+.3*kick : style==='rap' ? .55+.25*beat : .45);
    // Existing V134/V158 motion stays dominant; complementary micro-rotations
    // improve perceived balance without translating the pelvis or touching IK.
    result.torsoTwist=clamp(finite(result.torsoTwist,0)-lateral*.052*balance*response,-.8,.8);
    result.hipCounter=clamp(finite(result.hipCounter,0)-upper*.065*balance*response,-.8,.8);
    result.counterArm=clamp(finite(result.counterArm,0)-lateral*.055*balance*response,-.8,.8);
    result.kneeFollow=clamp(finite(result.kneeFollow,0)+(hasFootContact?0:Math.max(0,finite(result.legGroove,0))*.06*balance),-.8,.8);
  }
  return result;
}

/** Preserve manual clip timing and existing beat-synchronized plan. */
export function polishAutomaticCrossfadeV311(plan:DanceTransitionPlan,opts:{
  settings:AdvancedDanceSettingsV311; bpm?:number|null; genre?:string|null; planted?:boolean;
  manual?:boolean; reducedMotion?:boolean; playing?:boolean; matchScore?:number|null;
}):number {
  if(!opts.settings.enabled || opts.settings.transitionPolish<=0 || opts.manual || opts.reducedMotion || opts.playing===false)return plan.duration;
  const polish=opts.settings.transitionPolish/100;
  const bpm=clamp(finite(opts.bpm,120),55,240);
  const style=resolveDanceQualityStyle(opts.settings.style,opts.genre);
  const poorMatch=opts.matchScore===undefined||opts.matchScore===null ? 0 : clamp(finite(opts.matchScore,0),0,1.5)/1.5;
  // Match confidence and stance can relax a switch by a few frames. At high
  // tempo avoid blending two unrelated footfalls over more than ~one beat.
  const factor=1+polish*(.16*poorMatch+(opts.planted ? .12 : 0));
  const beat=60/bpm;
  const ceiling=style==='rave'?Math.max(.16,beat*1.15):style==='rap'?Math.max(.25,beat*1.75):1.5;
  return clamp(plan.duration*factor,.08,Math.min(1.5,ceiling));
}
