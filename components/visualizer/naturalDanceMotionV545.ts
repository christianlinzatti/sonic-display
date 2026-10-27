import {protectFootworkV576} from './footworkSafetyV576';
/** V545 Natural Dance Motion 6.0 – contact-aware finishing pass on additive GLB rig
 * channels. Never changes GLB clips, AnimationActions, authored root positions,
 * IK ankle targets, singer timing, or stage/camera transforms. Foot contact is
 * supplied from the PREVIOUS frame by V492, avoiding a solver feedback loop.
 */
import type {AvatarRigMotion} from './avatarRigController';

export type NaturalDanceMotionSettingsV545={enabled:boolean;strength:number};
export const NATURAL_DANCE_MOTION_KEY_V545='sonic-natural-dance-motion-v545';
export const NATURAL_DANCE_MOTION_EVENT_V545='sonic:natural-dance-motion-v545';
export const DEFAULT_NATURAL_DANCE_MOTION_V545:NaturalDanceMotionSettingsV545={enabled:true,strength:65};
const clamp=(n:number,min:number,max:number)=>Math.max(min,Math.min(max,n));
const finite=(n:unknown):n is number=>typeof n==='number'&&Number.isFinite(n);
export function normalizeNaturalDanceMotionV545(value:unknown):NaturalDanceMotionSettingsV545{
 const s=value&&typeof value==='object'&&!Array.isArray(value)?value as Partial<NaturalDanceMotionSettingsV545>:{};
 return {enabled:s.enabled!==false,strength:finite(s.strength)?Math.round(clamp(s.strength,0,100)):65};
}
let cached:NaturalDanceMotionSettingsV545|null=null;
export function readNaturalDanceMotionV545():NaturalDanceMotionSettingsV545{
 if(cached)return cached;
 if(typeof window==='undefined')return {...DEFAULT_NATURAL_DANCE_MOTION_V545};
 try{cached=normalizeNaturalDanceMotionV545(JSON.parse(window.localStorage.getItem(NATURAL_DANCE_MOTION_KEY_V545)??'null'));}
 catch{cached={...DEFAULT_NATURAL_DANCE_MOTION_V545};}
 return cached;
}
export function refreshNaturalDanceMotionV545(){cached=null;return readNaturalDanceMotionV545();}
export function writeNaturalDanceMotionV545(settings:NaturalDanceMotionSettingsV545){
 cached=normalizeNaturalDanceMotionV545(settings);
 if(typeof window==='undefined')return;
 try{window.localStorage.setItem(NATURAL_DANCE_MOTION_KEY_V545,JSON.stringify(cached));}catch{/* private or full storage */}
 window.dispatchEvent(new Event(NATURAL_DANCE_MOTION_EVENT_V545));
}
export type DanceMotionStateV545={trackId:string;modelKey:string;lastSeconds:number;lastSupport:number;
 hipSway:number;hipCounter:number;weightShift:number;legGroove:number;footStep:number};
export function createDanceMotionStateV545():DanceMotionStateV545{
 return {trackId:'',modelKey:'',lastSeconds:-1,lastSupport:0,hipSway:0,hipCounter:0,weightShift:0,legGroove:0,footStep:0};
}
export type DanceMotionInputV545={trackId?:string|null;modelKey:string;seconds:number;delta:number;
 playing:boolean;reducedMotion:boolean;manualPriority:boolean;footIKEnabled:boolean;
 quality:'low'|'balanced'|'high'|string;genre?:string|null;plantedLeft:boolean;plantedRight:boolean;
 contactKnown:boolean;settings:NaturalDanceMotionSettingsV545};
const CHANNELS=['hipSway','hipCounter','weightShift','legGroove','footStep'] as const;
type Channel=typeof CHANNELS[number];
/** Deliberately conservative; never treat an unknown foot as grounded. Smooth only
 * existing additive values; no new rhythm generator and no planted-foot offsets.
 * Previously grounded footStep is attenuated IMMEDIATELY on new contact (no lag).
 */
export function refineNaturalDanceMotionV545<T extends AvatarRigMotion>(state:DanceMotionStateV545,motion:T,input:DanceMotionInputV545):T{
 const enabled=input.settings.enabled&&input.settings.strength>0&&input.playing&&!input.reducedMotion&&
  !input.manualPriority&&input.footIKEnabled&&input.contactKnown&&input.quality!=='low'&&
  !!input.trackId?.trim()&&!!input.modelKey&&finite(input.seconds)&&input.seconds>=0&&
  finite(input.delta)&&input.delta>0&&input.delta<=.15&&
  CHANNELS.every(k=>motion[k]===undefined||finite(motion[k]));
 if(!enabled){Object.assign(state,createDanceMotionStateV545());return motion;}
 const support=(input.plantedLeft?1:0)|(input.plantedRight?2:0);
 const reset=state.trackId!==input.trackId||state.modelKey!==input.modelKey||state.lastSeconds<0||
  input.seconds<state.lastSeconds-.08||input.seconds-state.lastSeconds>.45;
 const hard=/hardstyle|hardtekk|hardtek|rawstyle|hardcore/i.test(input.genre??'');
 const rap=/deutschrap|hip.?hop|trap|drill|\brap\b/i.test(input.genre??'');
 const strength=clamp(input.settings.strength,0,100)/100;
 const stance=support===3?1:support?0.65:0;
 const channels:Record<Channel,number>={
  hipSway:finite(motion.hipSway)?motion.hipSway:0,
  hipCounter:finite(motion.hipCounter)?motion.hipCounter:0,
  weightShift:finite(motion.weightShift)?motion.weightShift:0,
  legGroove:finite(motion.legGroove)?motion.legGroove:0,
  footStep:finite(motion.footStep)?motion.footStep:0,
 };
 // Smaller roots/feet at contact; high-tempo foot swings remain fast when airborne.
 const gains:Record<Channel,number>={
  hipSway:1-strength*stance*(rap?.36:.29),
  hipCounter:1-strength*stance*.28,
  weightShift:1-strength*stance*.56,
  legGroove:1-strength*stance*.65,
  footStep:1-strength*(support===3?.95:support?.86:0),
 };
 const limits:Record<Channel,number>={hipSway:.19,hipCounter:.16,weightShift:.34,legGroove:.22,footStep:.19};
 const tau=hard?.042:rap?.105:.082;
 const alpha=clamp(1-Math.exp(-input.delta/tau),0,1);
 const out:Record<Channel,number>={...channels};
 for(const key of CHANNELS){
  const target=clamp(channels[key]*gains[key],-limits[key],limits[key]);
  // On seek or model swap, initialize from the safe target and never use stale
  // support. Grounded feet must never retain the previous airborne foot motion.
  const old=reset?target:state[key];
  const next=reset?target:old+(target-old)*alpha;
  const bounded=clamp(next,-limits[key],limits[key]);
  out[key]=support&&key==='footStep'
    ?Math.sign(target)*Math.min(Math.abs(target),Math.max(0,Math.sign(target)*bounded))
    :bounded;
  state[key]=out[key];
 }
 state.trackId=input.trackId??'';state.modelKey=input.modelKey;state.lastSeconds=input.seconds;state.lastSupport=support;
 // Only the five bounded additive channels are returned; expressions and all
 // audio/vocal/arm channels pass through unchanged.
 return protectFootworkV576({...motion,...out},{contactKnown:input.contactKnown,
   plantedLeft:input.plantedLeft,plantedRight:input.plantedRight,enabled:true,
   manualPriority:input.manualPriority,reducedMotion:input.reducedMotion});
}
