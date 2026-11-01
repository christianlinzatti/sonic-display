/** V840 — Dynamic Performer Stage Blocking 2.0.
 * Reuses already validated V808 singer assignments and foot-safe stage depth
 * targets. Adds song-time continuity and small ensemble accents, never changes
 * X lanes, skinned mesh transforms, IK, GLB clips, vocals or authored cues.
 */
import type {PositionPlanV808} from './naturalPerformerPositioningV808';
export type StageBlockingSettingsV840=Readonly<{enabled:boolean;strength:number;style:'subtle'|'concert'}>;
export const STAGE_BLOCKING_KEY_V840='sonic-stage-blocking-v840';
export const STAGE_BLOCKING_EVENT_V840='sonic:stage-blocking-v840';
export const DEFAULT_STAGE_BLOCKING_V840:StageBlockingSettingsV840={enabled:true,strength:55,style:'subtle'};
const finite=(v:unknown):v is number=>typeof v==='number'&&Number.isFinite(v);
const clamp=(v:number,lo:number,hi:number)=>Math.max(lo,Math.min(hi,v));
export function normalizeStageBlockingV840(value:unknown):StageBlockingSettingsV840{
 const s=value&&typeof value==='object'&&!Array.isArray(value)?value as Partial<StageBlockingSettingsV840>:{};
 return {enabled:s.enabled!==false,strength:finite(s.strength)?Math.round(clamp(s.strength,0,100)):55,
  style:s.style==='concert'?'concert':'subtle'};
}
let cached:StageBlockingSettingsV840|null=null;
export function readStageBlockingV840():StageBlockingSettingsV840{
 if(cached)return cached;
 if(typeof window==='undefined')return {...DEFAULT_STAGE_BLOCKING_V840};
 try{cached=normalizeStageBlockingV840(JSON.parse(window.localStorage.getItem(STAGE_BLOCKING_KEY_V840)||'null'));}
 catch{cached={...DEFAULT_STAGE_BLOCKING_V840};}
 return cached;
}
export function refreshStageBlockingV840(){cached=null;return readStageBlockingV840();}
export function writeStageBlockingV840(value:unknown):boolean{
 if(typeof window==='undefined')return false;
 const next=normalizeStageBlockingV840(value);
 try{window.localStorage.setItem(STAGE_BLOCKING_KEY_V840,JSON.stringify(next));}catch{return false;}
 cached=next;
 try{window.dispatchEvent(new Event(STAGE_BLOCKING_EVENT_V840));}catch{/* persisted */}
 return true;
}
export type StageBlockingStateV840={trackId:string;lastSeconds:number;lineIndex:number;count:number;offsets:number[]};
export const createStageBlockingStateV840=():StageBlockingStateV840=>({trackId:'',lastSeconds:-1,lineIndex:-1,count:0,offsets:[]});
export type StageBlockingInputV840={settings:StageBlockingSettingsV840;trackId?:string|null;
 seconds:number;delta:number;count:number;lineIndex:number;playing:boolean;reducedMotion:boolean;
 manualPriority:boolean;quality:string;footReady:readonly boolean[];risks:readonly number[];
 positions:readonly (readonly number[])[];base:PositionPlanV808;
 /** Existing authored V326 lane spacing in meters; default 1.5 m. */
 minSpacing?:number;};
export type StageBlockingResultV840={state:StageBlockingStateV840;active:boolean;
 reason:'verified'|'existing-v808'|'off'|'unsafe';offsets:readonly number[]};
/** No independent singer detection or root travel. A valid V808 proposal
 * is the only authority for an automatic positioning adjustment.
 * When switched off, V808 works exactly as before. */
export function refineDynamicStageBlockingV840(state:StageBlockingStateV840,p:StageBlockingInputV840):StageBlockingResultV840{
 const count=Number.isInteger(p.count)&&p.count>=2&&p.count<=4?p.count:0;
 const zero=Array.from({length:count},()=>0);
 const off=(reason:'off'|'unsafe'='off'):StageBlockingResultV840=>({state:createStageBlockingStateV840(),active:false,reason,offsets:zero});
 if(!p.base?.active||p.base.reason!=='verified'||!Array.isArray(p.base.slots)||p.base.slots.length!==count||
  !p.trackId?.trim()||p.trackId.length>180||!p.playing||p.reducedMotion||p.manualPriority||
  p.quality==='low'||!Number.isInteger(p.lineIndex)||p.lineIndex<0||
  !finite(p.seconds)||p.seconds<0||!finite(p.delta)||p.delta<=0||p.delta>.15||
  !Array.isArray(p.positions)||p.positions.length<count||
  p.positions.slice(0,count).some(s=>s.length<3||![s[0],s[1],s[2]].every(finite))||
  p.footReady.length<count||p.risks.length<count||
  p.footReady.slice(0,count).some(x=>typeof x!=='boolean')||
  p.risks.slice(0,count).some(x=>!finite(x)||x<0||x>1)||
  !p.base.slots.every((s,i)=>s.slot===i&&finite(s.offsetZ)&&Math.abs(s.offsetZ)<=.15))return off();
 // This is an opt-in refinement. Switching it off preserves V808 exactly.
 if(!p.settings.enabled||p.settings.strength<=0)return {state:createStageBlockingStateV840(),active:true,
  reason:'existing-v808',offsets:p.base.slots.map(s=>s.offsetZ)};
 if(!finite(p.settings.strength)||p.settings.strength>100||
  (p.settings.style!=='subtle'&&p.settings.style!=='concert'))return off();
 const reset=state.trackId!==p.trackId||state.count!==count||state.lastSeconds<0||
  p.seconds<state.lastSeconds-.09||p.seconds-state.lastSeconds>1.4||
  state.offsets.length!==count||state.lineIndex!==p.lineIndex;
 const strength=p.settings.strength/100;
 const styleGain=p.settings.style==='concert'?1:.55;
 const proposed=p.base.slots.map((slot,i)=>{
  if(!p.footReady[i]||p.risks[i]>=.18)return 0;
  const accent=slot.role==='lead'?-.012:slot.role==='partner'?-.005:
    slot.role==='handoff'?.009:slot.role==='chorus'?
      (i-(count-1)/2)*.007:0;
  // No movement for an unsupported background dancer. A neutral V808 slot
  // gets no new root shift. Valid moves stay within 11 cm of V326 targets.
  if(!slot.offsetZ)return 0;
  return clamp(slot.offsetZ+accent*styleGain*strength,-.11,.085);
 });
 const alpha=1-Math.exp(-p.delta/(p.settings.style==='concert'?.24:.32));
 const values=proposed.map((target,i)=>!p.footReady[i]||p.risks[i]>=.18?0:
  clamp((reset?0:state.offsets[i])*(1-alpha)+target*alpha,-.11,.085));
 const spacing=finite(p.minSpacing)?clamp(p.minSpacing,1.5,2.3):1.5;
 // Protect both current real positions and the positions produced by this
 // additive displacement. Never infer a collision-free 3D mesh from this.
 for(let i=0;i<count;i++)for(let j=i+1;j<count;j++){
  const a=p.positions[i],b=p.positions[j];
  const dx=a[0]-b[0],dz=a[2]-b[2];
  const before=Math.hypot(dx,dz);
  const after=Math.hypot(dx,dz+values[i]-values[j]);
  if(!finite(before)||before<spacing||after<spacing||after+0.025<before)return off('unsafe');
 }
 // Never claim active auto-blocking if the grounded shift is completely zero.
 const active=values.some(v=>Math.abs(v)>.000001);
 return {state:{trackId:p.trackId,lastSeconds:p.seconds,count,lineIndex:p.lineIndex,offsets:values},
  active,reason:active?'verified':'off',offsets:values};
}
