/** V665 - contact-aware overlay stability for existing GLB animation rigs.
 * The previous-frame V492 IK sample owns real contacts and foot positions.
 * This pass never modifies animated clips, joints, root translation, or IK.
 */
import type {AvatarRigMotion} from './avatarRigController';

export type RealisticGroundingSettingsV665={enabled:boolean;strength:number;transitionMs:number};
export const GROUNDING_SETTINGS_KEY_V665='sonic-realistic-dance-grounding-v665';
export const GROUNDING_SETTINGS_EVENT_V665='sonic:realistic-dance-grounding-v665';
export const DEFAULT_GROUNDING_SETTINGS_V665:RealisticGroundingSettingsV665={enabled:false,strength:70,transitionMs:320};
const clamp=(v:number,min:number,max:number)=>Math.max(min,Math.min(max,v));
const finite=(v:unknown):v is number=>typeof v==='number'&&Number.isFinite(v);
export function normalizeGroundingSettingsV665(value:unknown):RealisticGroundingSettingsV665{
 const v=value&&typeof value==='object'&&!Array.isArray(value)?value as Partial<RealisticGroundingSettingsV665>:{};
 return {enabled:v.enabled===true,strength:finite(v.strength)?Math.round(clamp(v.strength,0,100)):70,
 transitionMs:finite(v.transitionMs)?Math.round(clamp(v.transitionMs,120,800)):320};
}
let cached:RealisticGroundingSettingsV665|null=null;
export function readGroundingSettingsV665():RealisticGroundingSettingsV665{
 if(cached)return cached;
 if(typeof window==='undefined')return {...DEFAULT_GROUNDING_SETTINGS_V665};
 try{cached=normalizeGroundingSettingsV665(JSON.parse(window.localStorage.getItem(GROUNDING_SETTINGS_KEY_V665)||'null'));}
 catch{cached={...DEFAULT_GROUNDING_SETTINGS_V665};}
 return cached;
}
export function refreshGroundingSettingsV665(){cached=null;return readGroundingSettingsV665();}
export function writeGroundingSettingsV665(value:unknown):boolean{
 const next=normalizeGroundingSettingsV665(value);
 if(typeof window==='undefined'){cached=next;return false;}
 try{window.localStorage.setItem(GROUNDING_SETTINGS_KEY_V665,JSON.stringify(next));}
 catch{return false;}
 cached=next;
 try{window.dispatchEvent(new Event(GROUNDING_SETTINGS_EVENT_V665));}catch{/* the value is already stored */}
 return true;
}

export type GroundingStateV665={trackId:string;modelId:string;lastSeconds:number;depth:number;lastTargetDepth:number;support:number};
export const newGroundingStateV665=():GroundingStateV665=>({trackId:'',modelId:'',lastSeconds:-1,depth:0,lastTargetDepth:0,support:0});
export type GroundingInputV665={settings:RealisticGroundingSettingsV665;trackId?:string|null;modelId:string;
 seconds:number;delta:number;playing:boolean;reducedMotion:boolean;manualPriority:boolean;
 quality:string;footIKEnabled:boolean;contactKnown:boolean;plantedLeft:boolean;plantedRight:boolean;
 /** V481 is a SHOW cue only, never proof that an actual animation is playing. */
 poseDepth?:number;poseClipActive:boolean};
const CHANNELS=['footStep','legGroove','weightShift','hipSway','spineSway','hipCounter'] as const;
/** Fail closed when there is no actual contact or pose clip evidence. No new
 * additive channel is generated. The active clip and other motion fields pass through. */
export function stepRealisticGroundingV665<T extends AvatarRigMotion>(state:GroundingStateV665,base:T,input:GroundingInputV665):{
 state:GroundingStateV665;motion:T;active:boolean;depth:number}{
 const bypass=()=>({state:newGroundingStateV665(),motion:base,active:false,depth:0});
 const p=input;
 if(!p.settings.enabled||!finite(p.settings.strength)||p.settings.strength<=0||
  !finite(p.settings.transitionMs)||!p.trackId?.trim()||!p.modelId?.trim()||!p.playing||p.reducedMotion||
  p.manualPriority||p.quality==='low'||!p.footIKEnabled||!p.contactKnown||!finite(p.seconds)||p.seconds<0||
  !finite(p.delta)||p.delta<=0||p.delta>.15||!finite(p.poseDepth??0)||
  !CHANNELS.every(key=>base[key]===undefined||finite(base[key])))return bypass();
 const reset=state.trackId!==p.trackId||state.modelId!==p.modelId||state.lastSeconds<0||
  p.seconds<state.lastSeconds-.08||p.seconds-state.lastSeconds>.4;
 const prev=reset?newGroundingStateV665():state;
 // The cue depth is ignored unless an ACTUAL compatible low-pose clip is selected.
 const targetDepth=p.poseClipActive?clamp(p.poseDepth??0,0,.65):0;
 const alpha=clamp(1-Math.exp(-p.delta/(clamp(p.settings.transitionMs,120,800)/1000)),0,1);
 const depth=clamp(prev.depth+(targetDepth-prev.depth)*alpha,0,.65);
 // Plant immediately, but smoothly recover full additive movement on release.
 // Only observed V492 contact may start a stance; stale contacts never carry
 // across track/model changes, seeks, disabled IK or an unknown contact.
 const observedSupport=p.plantedLeft&&p.plantedRight?1:(p.plantedLeft || p.plantedRight ? 0.6 : 0);
 const support=observedSupport>=prev.support?observedSupport:
  observedSupport+(prev.support-observedSupport)*Math.exp(-p.delta/.18);
 const strength=clamp(p.settings.strength/100,0,1);
 // Only dampen generated rig overlays. Never produce displacement or synthetic crouches.
 const contactGain=1-strength*(support*.30);
 const crouchGain=1-strength*(depth/.65)*.24;
 const footGain=1-strength*(support*.36+(depth/.65)*.16);
 const weightGain=clamp(contactGain*crouchGain,.38,1);
 const nextState={trackId:p.trackId,modelId:p.modelId,lastSeconds:p.seconds,depth,lastTargetDepth:targetDepth,support};
 if(support===0&&depth===0)return {state:nextState,motion:base,active:true,depth};
 const motion={...base,
  footStep:base.footStep===undefined?undefined:base.footStep*clamp(footGain,.38,1),
  legGroove:base.legGroove===undefined?undefined:base.legGroove*clamp(1-strength*(support*.13+depth/.65*.17),.55,1),
  weightShift:base.weightShift*weightGain,
  hipSway:base.hipSway*clamp(1-strength*(support*.1+depth/.65*.18),.5,1),
  spineSway:base.spineSway*clamp(1-strength*depth/.65*.16,.7,1),
  hipCounter:base.hipCounter===undefined?undefined:base.hipCounter*clamp(1-strength*(support*.12+depth/.65*.12),.6,1),
 } as T;
 return {state:nextState,motion,active:true,depth};
}
