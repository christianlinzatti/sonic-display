/** V494 — optional GLB stage-footwork damping, never a second IK solver.
 * Uses ONLY previously published V487 ankle-anchor measurements; all bounds
 * are conservative heuristic estimates, not physical ground collision.
 * Calls run inside the existing V326 group-frame loop with no GPU/readback.
 */
import type {GroundObservationV487} from './groundContactStudioV487';
import type {FootworkSlotV486} from './advancedDanceFootworkV486';
import type {LowPoseSlotV481} from './intelligentLowPoseV481';

export const GLB_GROUND_CALIBRATIONS_KEY_V494='sonic-glb-ground-calibrations-v494';
export const GLB_GROUND_CALIBRATION_EVENT_V494='sonic:glb-ground-calibration-v494';
export const GLB_GROUND_REPORT_EVENT_V494='sonic:glb-ground-report-v494';
export type GlbGroundCalibrationV494={enabled:boolean;stanceDamping:number;transitionHoldMs:number;driftThresholdCm:number};
export type GlbGroundCalibrationsV494=Record<string,GlbGroundCalibrationV494>;
export const DEFAULT_GLB_GROUND_CALIBRATION_V494:GlbGroundCalibrationV494={
 enabled:true,stanceDamping:.55,transitionHoldMs:320,driftThresholdCm:4,
};
const clamp=(n:number,min:number,max:number)=>Math.min(max,Math.max(min,n));
const finite=(value:unknown):value is number=>typeof value==='number'&&Number.isFinite(value);
const numeric=(value:unknown,fallback:number,min:number,max:number)=>finite(value)?clamp(value,min,max):fallback;
/** Keys are stable model-library IDs, not URLs or arbitrary file paths. */
export function normalizeGlbGroundModelIdV494(value:unknown):string{
 return typeof value==='string'&&/^[a-zA-Z0-9_:.\-]{1,90}$/.test(value)?value:'';
}
export function normalizeGlbGroundCalibrationV494(value:unknown):GlbGroundCalibrationV494{
 const raw=value&&typeof value==='object'&&!Array.isArray(value)?value as Partial<GlbGroundCalibrationV494>:{};
 return {enabled:raw.enabled!==false,
  stanceDamping:numeric(raw.stanceDamping,.55,.10,1),
  transitionHoldMs:numeric(raw.transitionHoldMs,320,0,800),
  driftThresholdCm:numeric(raw.driftThresholdCm,4,1.5,12)};
}
export function normalizeGlbGroundCalibrationsV494(value:unknown):GlbGroundCalibrationsV494{
 const input=value&&typeof value==='object'&&!Array.isArray(value)?value as Record<string,unknown>:{};
 const result:GlbGroundCalibrationsV494=Object.create(null);
 for(const [key,item] of Object.entries(input).slice(0,32)){
  if(normalizeGlbGroundModelIdV494(key))result[key]=normalizeGlbGroundCalibrationV494(item);
 }
 return result;
}
export function readGlbGroundCalibrationsV494():GlbGroundCalibrationsV494{
 if(typeof window==='undefined')return Object.create(null);
 try{return normalizeGlbGroundCalibrationsV494(JSON.parse(window.localStorage.getItem(GLB_GROUND_CALIBRATIONS_KEY_V494)||'null'));}
 catch{return Object.create(null);}
}
export function writeGlbGroundCalibrationV494(modelId:string,value:unknown):GlbGroundCalibrationV494|null{
 const id=normalizeGlbGroundModelIdV494(modelId);
 if(!id||typeof window==='undefined')return null;
 const settings=normalizeGlbGroundCalibrationV494(value);
 try{
  const data=readGlbGroundCalibrationsV494();data[id]=settings;
  window.localStorage.setItem(GLB_GROUND_CALIBRATIONS_KEY_V494,JSON.stringify(data));
  window.dispatchEvent(new Event(GLB_GROUND_CALIBRATION_EVENT_V494));
  return settings;
 }catch{return null;}
}
export type GlbGroundPhaseV494='unavailable'|'dance'|'side-step'|'lowering'|'low'|'rising';
export type GlbGroundStateV494={modelId:string;trackId:string;lastSeconds:number;lastDepth:number;
 gain:number;holdUntil:number;transition:'lowering'|'rising'|null;};
export type GlbGroundDecisionV494={modelId:string;active:boolean;phase:GlbGroundPhaseV494;
 gain:number;offsetX:number;offsetZ:number;driftCm:number;support:'none'|'left'|'right'|'both';};
export type GlbGroundInputV494={state:GlbGroundStateV494;modelId:string;trackId:string;
 seconds:number;delta:number;footwork:FootworkSlotV486;observation:GroundObservationV487;
 pose:LowPoseSlotV481;playing:boolean;reducedMotion:boolean;manualPriority:boolean;
 automaticGroup:boolean;footLocked:boolean;quality:string;calibration?:GlbGroundCalibrationV494;};
export const newGlbGroundStateV494=():GlbGroundStateV494=>({modelId:'',trackId:'',lastSeconds:-1,lastDepth:0,gain:1,holdUntil:0,transition:null});
function neutral(input:GlbGroundInputV494):{state:GlbGroundStateV494;decision:GlbGroundDecisionV494}{
 return {state:{...newGlbGroundStateV494(),modelId:input.modelId,trackId:input.trackId},
  decision:{modelId:input.modelId,active:false,phase:'unavailable',gain:1,
   offsetX:finite(input.footwork.offsetX)?input.footwork.offsetX:0,
   offsetZ:finite(input.footwork.offsetZ)?input.footwork.offsetZ:0,driftCm:0,support:'none'}};
}
/** Stateful pure frame step. A manual formation always receives its *original*
 * target coordinates; V494 scales ONLY V486 optional offsets. Missing IK data,
 * paused playback, seek, model swap and low performance disable the feature.
 */
export function stepGlbGroundingV494(input:GlbGroundInputV494):{state:GlbGroundStateV494;decision:GlbGroundDecisionV494}{
 const {observation:o,footwork:f,pose,seconds,delta}=input;
 const cal=normalizeGlbGroundCalibrationV494(input.calibration);
 const permitted=cal.enabled&&input.automaticGroup&&!input.manualPriority&&!input.footLocked&&
  input.playing&&!input.reducedMotion&&input.quality!=='low'&&!!input.trackId&&
  o.tracked&&finite(seconds)&&seconds>=0&&finite(delta)&&delta>0&&delta<=.25&&
  finite(f.offsetX)&&finite(f.offsetZ)&&finite(pose.depth);
 if(!permitted)return neutral(input);
 const reset=input.state.modelId!==input.modelId||input.state.trackId!==input.trackId||
  input.state.lastSeconds<0||seconds<input.state.lastSeconds-.12||seconds-input.state.lastSeconds>.7;
 const previous=reset?newGlbGroundStateV494():input.state;
 const depth=clamp(pose.depth,0,.65);
 const change=depth-previous.lastDepth;
 let transition=previous.transition,holdUntil=previous.holdUntil;
 if(!reset&&change>.012){transition='lowering';holdUntil=seconds+cal.transitionHoldMs/1000;}
 else if(!reset&&change<-.012){transition='rising';holdUntil=seconds+cal.transitionHoldMs/1000;}
 else if(seconds>=holdUntil)transition=null;
 const left=o.leftPlanted&&finite(o.leftConfidence)&&o.leftConfidence>=.45;
 const right=o.rightPlanted&&finite(o.rightConfidence)&&o.rightConfidence>=.45;
 const support=left&&right?'both':left?'left':right?'right':'none';
 const driftCm=clamp(Math.max(left&&finite(o.leftDriftCm)?o.leftDriftCm:0,
   right&&finite(o.rightDriftCm)?o.rightDriftCm:0),0,99);
 const sideStep=Math.abs(f.offsetX)>.012||Math.abs(f.offsetZ)>.012;
 const phase:GlbGroundPhaseV494=transition??(depth>.08?'low':sideStep?'side-step':'dance');
 let target=1;
 if(support==='both')target=cal.stanceDamping;
 else if(support!=='none')target=.75+.25*cal.stanceDamping;
 if(support!=='none'&&driftCm>=cal.driftThresholdCm)target*=.55;
 else if(support!=='none'&&driftCm>=cal.driftThresholdCm*.4)target*=.84;
 if(support!=='none'&&phase==='lowering')target*=.65;
 if(support!=='none'&&phase==='rising')target*=.72;
 // Clamp to 12–100% so a planted dancer can still eventually return to a cue.
 target=clamp(target,.12,1);
 // This lags only optional automatic offsets; on a disable we return them at
 // once, instead of secretly dampening manually authored root positions.
 const alpha=clamp(delta/.18,0,1);
 const gain=clamp(previous.gain+(target-previous.gain)*alpha,.12,1);
 const state:GlbGroundStateV494={modelId:input.modelId,trackId:input.trackId,
  lastSeconds:seconds,lastDepth:depth,gain,holdUntil,transition};
 return {state,decision:{modelId:input.modelId,active:true,phase,gain,
  offsetX:f.offsetX*gain,offsetZ:f.offsetZ*gain,driftCm,support}};
}
export type GlbGroundReportV494={count:number;slots:GlbGroundDecisionV494[]};
