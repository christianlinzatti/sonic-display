/** V1038 · Pure cinematic motion planner for decorative hovering satellites.
 * No performer is transported: stage floor, cast rigs and foot contacts remain on
 * the rotating V1031 deck. No artificial beat events, camera override or IO.
 */
import {normalizeArenaSectionV1034} from './arena360ShowV1034';
export type FloatingStageModeV1038 = 'auto'|'wave'|'orbit'|'rise';
export type FloatingStageCueV1038={lift:number;spread:number;orbitSpeed:number;wave:number;brightness:number};
export type FloatingStageStateV1038={lift:number;spread:number;angle:number;time:number};
export const INITIAL_FLOATING_STAGE_V1038:FloatingStageStateV1038={lift:.42,spread:0,angle:0,time:0};
const TAU=Math.PI*2;
const clamp=(value:number,min:number,max:number)=>Number.isFinite(value)?Math.max(min,Math.min(max,value)):min;
const SAFE_MODE:readonly FloatingStageModeV1038[]=['auto','wave','orbit','rise'];
export function floatingStagePlatformCountV1038(tier:'low'|'balanced'|'high'):number {
 return tier==='low'?2:tier==='balanced'?4:6;
}
/** Amplitude and spin are purposefully modest: a safe scenic envelope at radius
 * 3.35±.08, with minimum lift .42 and maximum 1.32 above the original floor.
 */
export function planFloatingStageV1038(opts:{enabled:boolean;playing:boolean;reducedMotion:boolean;reactive:boolean;
 section?:string|null;mode?:FloatingStageModeV1038;intensity?:number;energy?:number}):FloatingStageCueV1038 {
 if(!opts.enabled||opts.reducedMotion||!opts.reactive)
  return {lift:.42,spread:0,orbitSpeed:0,wave:0,brightness:.26};
 const section=normalizeArenaSectionV1034(opts.section);
 const mode=opts.mode&&SAFE_MODE.includes(opts.mode)?opts.mode:'auto';
 const amount=clamp(opts.intensity??70,0,100)/100;
 const energy=clamp(opts.energy??0,0,1);
 const sectionLift={verse:.34,hook:.82,drop:.9,build:.65,break:.13}[section];
 const lift=clamp(.42+sectionLift*amount*(.86+.14*energy),.42,1.32);
 const stageMode=mode==='auto'?(section==='build'?'wave':section==='drop'?'orbit':section==='break'?'rise':'wave'):mode;
 return {lift,spread:stageMode==='rise'?0:.08*amount,
  orbitSpeed:stageMode==='orbit'?.24*amount:stageMode==='wave'?.038*amount:0,
  wave:stageMode==='wave'?.14*amount:stageMode==='rise'?.055*amount:.03*amount,
  brightness:clamp(.24+amount*(.24+.23*energy),.22,.75)};
}
/** Smooth bounded movement independent of frame rate, no timer on pause. */
export function stepFloatingStageV1038(previous:FloatingStageStateV1038,dt:number,cue:FloatingStageCueV1038,
 opts:{enabled:boolean;playing:boolean;reducedMotion:boolean}):FloatingStageStateV1038 {
 if(!opts.enabled||opts.reducedMotion)return {...INITIAL_FLOATING_STAGE_V1038};
 const old={lift:clamp(previous.lift,.42,1.32),spread:clamp(previous.spread,0,.08),
  angle:Number.isFinite(previous.angle)?previous.angle%TAU:0,time:clamp(previous.time,0,1000000)};
 if(!opts.playing)return old;
 const delta=clamp(dt,0,.1),blend=1-Math.exp(-delta*1.6);
 return {lift:clamp(old.lift+(clamp(cue.lift,.42,1.32)-old.lift)*blend,.42,1.32),
  spread:clamp(old.spread+(clamp(cue.spread,0,.08)-old.spread)*blend,0,.08),
  angle:(old.angle+clamp(cue.orbitSpeed,-.25,.25)*delta)%TAU,
  time:Math.min(1000000,old.time+delta)};
}
export type FloatingStageSampleV1038={x:number;y:number;z:number;glow:number;outerRadius:number};
export function sampleFloatingPlatformV1038(index:number,count:number,state:FloatingStageStateV1038,cue:FloatingStageCueV1038):FloatingStageSampleV1038 {
 const n=Math.max(1,Math.min(6,Math.floor(Number.isFinite(count)?count:4)));
 const i=Math.max(0,Math.min(n-1,Math.floor(Number.isFinite(index)?index:0)));
 const angle=TAU*i/n+clamp(state.angle,-TAU,TAU);
 const r=3.35+clamp(state.spread,0,.08)*Math.sin(TAU*i/n+Math.PI/4);
 const wave=clamp(cue.wave,0,.14)*Math.sin(clamp(state.time,0,1000000)*1.12+TAU*i/n);
 const y=clamp(state.lift+wave,.28,1.46);
 return {x:Math.cos(angle)*r,y,z:Math.sin(angle)*r,
  glow:clamp(cue.brightness,0,.75),outerRadius:r+.31};
}
