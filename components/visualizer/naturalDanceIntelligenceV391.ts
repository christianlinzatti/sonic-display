/**
 * V391 – Natural Dance Intelligence 3.0.
 * Deterministic, music-aware ADDITIVE rig refinement. It never touches source
 * animation clips, the root transform, foot IK targets or the beat transport.
 * V320 supplies contact protection; this stage attenuates its own extra groove
 * when feet are planted, and V323 balances the result downstream.
 */
import type { AvatarRigMotion } from './avatarRigController';

export type DanceFlowSettingsV391 = { enabled:boolean; strength:number };
export const DANCE_FLOW_KEY_V391 = 'sonic-dance-flow-v391';
export const DANCE_FLOW_EVENT_V391 = 'sonic:dance-flow-v391';
export const DEFAULT_DANCE_FLOW_V391:DanceFlowSettingsV391 = {enabled:false,strength:55};

const clamp=(n:number,min:number,max:number)=>Math.min(max,Math.max(min,Number.isFinite(n)?n:min));
const finite=(n:number | undefined,otherwise=0)=>typeof n==='number'&&Number.isFinite(n)?n:otherwise;
export function normalizeDanceFlowV391(value:unknown):DanceFlowSettingsV391 {
  const v=value&&typeof value==='object'?value as Partial<DanceFlowSettingsV391>:{};
  return {enabled:v.enabled===true,strength:Math.round(clamp(finite(v.strength,55),0,100))};
}

let cached:DanceFlowSettingsV391|null=null;
export function readDanceFlowV391():DanceFlowSettingsV391 {
  if(cached)return cached;
  if(typeof window==='undefined')return {...DEFAULT_DANCE_FLOW_V391};
  try{cached=normalizeDanceFlowV391(JSON.parse(window.localStorage.getItem(DANCE_FLOW_KEY_V391)??'null'));}
  catch{cached={...DEFAULT_DANCE_FLOW_V391};}
  return cached;
}
export function refreshDanceFlowV391(){cached=null;return readDanceFlowV391();}
export function writeDanceFlowV391(value:DanceFlowSettingsV391){
  cached=normalizeDanceFlowV391(value);
  if(typeof window==='undefined')return;
  try{window.localStorage.setItem(DANCE_FLOW_KEY_V391,JSON.stringify(cached));}catch{/* restricted/private mode */}
  window.dispatchEvent(new Event(DANCE_FLOW_EVENT_V391));
}

export type DanceFlowStateV391={songId:string;lastTime:number|null;weight:number;tail:number;flow:number};
export const createDanceFlowStateV391=():DanceFlowStateV391=>({songId:'',lastTime:null,weight:0,tail:0,flow:0});
export interface DanceFlowInputV391 {
  settings:DanceFlowSettingsV391;
  playing:boolean;reducedMotion:boolean;delta:number;time:number;trackId?:string;
  genre?:string|null;section?:string;slot?:number;bpm?:number|null;
  energy?:number;beat?:number;snare?:number;kick?:number;
  plantedLeft?:boolean;plantedRight?:boolean;authoredClipPriority?:boolean;
}
/** One small optional expression pass per avatar/frame, without allocations if disabled. */
export function refineDanceFlowV391<T extends AvatarRigMotion>(state:DanceFlowStateV391,motion:T,input:DanceFlowInputV391):T {
  const time=Math.max(0,finite(input.time));
  const dt=clamp(input.delta,0,.1);
  const songId=input.trackId??'';
  const discontinuity=state.lastTime!==null&&(time<state.lastTime-.1||time-state.lastTime>3.5);
  const newSong=state.songId!==songId;
  state.songId=songId;state.lastTime=time;
  if(newSong||discontinuity||!input.settings.enabled||!input.playing||input.reducedMotion||dt===0){
    state.weight=0;state.tail=0;state.flow=0;
    return motion;
  }
  const strength=clamp(input.settings.strength,0,100)/100;
  if(strength===0){state.weight=0;state.tail=0;state.flow=0;return motion;}
  const genre=(input.genre??'').toLowerCase();
  const rave=/hardtekk|hardstyle|techno|rave/.test(genre);
  const rap=/rap|hip.?hop|trap/.test(genre);
  const bpm=clamp(finite(input.bpm??undefined,120),55,240);
  const beatPosition=time*bpm/60;
  const energy=clamp(finite(input.energy,.5),0,1);
  const beat=clamp(finite(input.beat),0,1);
  const snare=clamp(finite(input.snare),0,1);
  const kick=clamp(finite(input.kick),0,1);
  const sections=input.section??'';
  const sectionGain=/break|intro|outro/i.test(sections)?.48:/hook|drop|chorus/i.test(sections)?1:.78;
  const sourceGain=input.authoredClipPriority?.18:1;
  const gain=strength*sourceGain*sectionGain*(.5+.5*energy);
  const plantedBoth=!!(input.plantedLeft&&input.plantedRight);
  const contactGain=plantedBoth?.24:input.plantedLeft||input.plantedRight?.58:1;
  // Independent slot offsets break uniform repetition without desynchronizing BPM.
  const slot=Math.floor(clamp(finite(input.slot),0,16));
  const offset=slot*.31;
  // An evolving 16-beat phrase and two-beat accent, rather than one fixed sine.
  const phrase=Math.sin(beatPosition*Math.PI/8+Math.sin(beatPosition*Math.PI/17+offset)*.38+offset);
  const accent=Math.sin(beatPosition*Math.PI/2+(rap?.3:rave?.8:.5)+offset*.45);
  const target=(phrase*.72+accent*.28)*gain*contactGain;
  const rate=rave?14:rap?8:6;
  state.weight+=(target-state.weight)*(1-Math.exp(-rate*dt));

  // Follow-through delays arm/shoulder responses but leaves beat impulses intact.
  const arm=clamp(finite(motion.armSwing)*.65+finite(motion.shoulderRoll)*.35,-1,1);
  state.tail+=(arm-state.tail)*(1-Math.exp(-(rave?13:rap?9:7)*dt));
  const lag=clamp(arm-state.tail,-.8,.8)*gain;
  const musicalAccent=(rap?snare:kick)*(.4+.6*beat)*gain;
  const nextFlow=(rave?.55:rap?.9:.7)*musicalAccent;
  state.flow+=(nextFlow-state.flow)*(1-Math.exp(-(rave?15:9)*dt));
  const lateral=state.weight;
  const out={...motion} as T;
  out.weightShift=clamp(finite(motion.weightShift)+lateral*.065,-1.2,1.2);
  out.hipSway=clamp(finite(motion.hipSway)+lateral*.030,-1.2,1.2);
  out.spineSway=clamp(finite(motion.spineSway)-lateral*.035,-1.2,1.2);
  out.shoulderRoll=clamp(finite(motion.shoulderRoll)+lag*.022+state.flow*.018,-1.2,1.2);
  out.armSwing=clamp(finite(motion.armSwing)+lag*.048,-1.2,1.2);
  out.followThrough=clamp(finite(motion.followThrough)+lag*.055,-1.2,1.2);
  out.headLag=clamp(finite(motion.headLag)+lag*.020,-1.2,1.2);
  out.counterArm=clamp(finite(motion.counterArm)-lateral*.028,-.8,.8);
  out.torsoTwist=clamp(finite(motion.torsoTwist)+lateral*.016,-.8,.8);
  // Only refine airborne ankle/leg rotations when BOTH foot contacts are known.
  // Never drive a planted foot or infer lift from a missing contact signal. The
  // existing V322 foot lock and V323 full-body balance remain authoritative.
  if(input.plantedLeft===false && input.plantedRight===false && !input.authoredClipPriority){
    const airAccent=(rave?kick:rap?snare:beat)*gain;
    const smallStep=Math.sin(beatPosition*Math.PI*.5+offset)*airAccent;
    out.footStep=clamp(finite(motion.footStep)+smallStep*.018,-1.2,1.2);
    out.legGroove=clamp(finite(motion.legGroove)+smallStep*.014,-1.2,1.2);
  }
  // Foot placement, root translation, source clips and IK targets are untouched.
  return out;
}
