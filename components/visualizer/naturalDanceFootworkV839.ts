/** V839 – Natural Dance & Footwork 4.0.
 * Last-mile continuity of existing additive rig and V486 generated group targets.
 * The GLB source clip, V492 IK observations, foot locks and stage roots remain
 * authoritative. No new footsteps, bone/keyframe edits or timing inference.
 */
import type {AvatarRigMotion} from './avatarRigController';
import type {FootSupportV486, AdvancedFootworkOutputV486, FootworkSlotV486} from './advancedDanceFootworkV486';

export type NaturalFootworkSettingsV839={enabled:boolean;strength:number;style:'auto'|'rap'|'hardtekk'|'neutral'};
export const NATURAL_FOOTWORK_KEY_V839='sonic-natural-footwork-v839';
export const NATURAL_FOOTWORK_EVENT_V839='sonic:natural-footwork-v839';
export const DEFAULT_NATURAL_FOOTWORK_V839:NaturalFootworkSettingsV839={enabled:true,strength:55,style:'auto'};
const finite=(v:unknown):v is number=>typeof v==='number'&&Number.isFinite(v);
const clamp=(n:number,a:number,b:number)=>Math.max(a,Math.min(b,n));
const factor=(dt:number,tau:number)=>clamp(1-Math.exp(-dt/tau),0,1);
export function normalizeNaturalFootworkV839(v:unknown):NaturalFootworkSettingsV839{
 const s=v&&typeof v==='object'&&!Array.isArray(v)?v as Partial<NaturalFootworkSettingsV839>:{};
 return {enabled:s.enabled!==false,strength:finite(s.strength)?Math.round(clamp(s.strength,0,100)):55,
  style:s.style==='rap'||s.style==='hardtekk'||s.style==='neutral'?s.style:'auto'};
}
let cache:NaturalFootworkSettingsV839|null=null;
export function readNaturalFootworkV839():NaturalFootworkSettingsV839{
 if(cache)return cache;
 if(typeof window==='undefined')return {...DEFAULT_NATURAL_FOOTWORK_V839};
 try{cache=normalizeNaturalFootworkV839(JSON.parse(window.localStorage.getItem(NATURAL_FOOTWORK_KEY_V839)||'null'));}
 catch{cache={...DEFAULT_NATURAL_FOOTWORK_V839};}
 return cache;
}
export function refreshNaturalFootworkV839(){cache=null;return readNaturalFootworkV839();}
export function writeNaturalFootworkV839(value:unknown):boolean{
 const next=normalizeNaturalFootworkV839(value);
 if(typeof window==='undefined')return false;
 try{window.localStorage.setItem(NATURAL_FOOTWORK_KEY_V839,JSON.stringify(next));}
 catch{return false;}
 cache=next;
 try{window.dispatchEvent(new Event(NATURAL_FOOTWORK_EVENT_V839));}catch{/* Persisted already */}
 return true;
}
export type NaturalFootworkClockV839={trackId:string;modelId:string;lastSeconds:number;gains:number[]};
export const createNaturalFootworkClockV839=():NaturalFootworkClockV839=>({trackId:'',modelId:'',lastSeconds:-1,gains:[]});
export type NaturalFootworkInputV839={settings:NaturalFootworkSettingsV839;trackId?:string|null;modelId:string;
 seconds:number;delta:number;playing:boolean;reducedMotion:boolean;manualPriority:boolean;
 quality:string;footIKEnabled:boolean;contactKnown:boolean;plantedLeft:boolean;plantedRight:boolean;
 genre?:string|null;section?:string|null;};
function danceStyle(style:NaturalFootworkSettingsV839['style'],genre?:string|null){
 if(style!=='auto')return style;
 if(/hardtekk|hardtek|hardstyle|rawstyle|hardcore/i.test(genre||''))return 'hardtekk';
 if(/deutschrap|hip.?hop|trap|drill|\brap\b/i.test(genre||''))return 'rap';
 return 'neutral';
}
const RIG=['footStep','legGroove','weightShift','hipSway','hipCounter'] as const;
/** After all other dance directors. Only scales existing nonzero additive motion.
 * Observed planted feet damp immediately; release recovers smoothly. Unknown
 * contacts, seeks and authored clips bypass and reset state. */
export function refineNaturalFootworkRigV839<T extends AvatarRigMotion>(state:NaturalFootworkClockV839,base:T,p:NaturalFootworkInputV839):{
 state:NaturalFootworkClockV839;motion:T;active:boolean;style:string}{
 const neutral=()=>({state:createNaturalFootworkClockV839(),motion:base,active:false,style:'bypass'});
 if(!p.settings.enabled||!finite(p.settings.strength)||p.settings.strength<=0||
  !p.trackId?.trim()||!p.modelId.trim()||!p.playing||p.reducedMotion||p.manualPriority||p.quality==='low'||
  !p.footIKEnabled||!p.contactKnown||!finite(p.seconds)||p.seconds<0||!finite(p.delta)||p.delta<=0||p.delta>.15||
  RIG.some(k=>base[k]!==undefined&&!finite(base[k])))return neutral();
 const reset=state.trackId!==p.trackId||state.modelId!==p.modelId||state.lastSeconds<0||
  p.seconds<state.lastSeconds-.08||p.seconds-state.lastSeconds>.4||state.gains.length!==RIG.length;
 const style=danceStyle(p.settings.style,p.genre),power=clamp(p.settings.strength/100,0,1);
 // The musical color is modulation of the EXISTING signal, not a generated beat.
 // A deterministic song-time LFO guarantees no frame-rate dependent phase drift.
 const rate=style==='hardtekk'?1.9:style==='rap'?.67:.92;
 const phrase=(1-Math.cos(p.seconds*rate*2*Math.PI))/2;
 const peak=/hook|drop|final/i.test(p.section||'');
 const variation=1-power*(peak?.055:.11)*(1-phrase);
 const single=p.plantedLeft!==p.plantedRight,both=p.plantedLeft&&p.plantedRight;
 const contacts=[both?1:single?.70:0,both?.90:single?.52:0,both?.78:single?.42:0,
  both?.52:single?.23:0,both?.50:single?.20:0];
 const damp=[.47,.30,.25,.18,.20];
 const tau=style==='hardtekk'?.10:style==='rap'?.21:.16;
 const gains=RIG.map((_,i)=>{
  const target=clamp((1-power*contacts[i]*damp[i])*variation,.50,1);
  // Instant protection on landing; slower release on take-off.
  return reset?target:Math.min(state.gains[i],target)+(target>state.gains[i]?
   (target-state.gains[i])*factor(p.delta,tau):0);
 });
 const motion={...base} as T;
 for(let i=0;i<RIG.length;i++){
  const key=RIG[i];const value=base[key];
  if(value!==undefined)(motion as AvatarRigMotion)[key]=value*gains[i];
 }
 return {state:{trackId:p.trackId,modelId:p.modelId,lastSeconds:p.seconds,gains},motion,active:true,style};
}

export type GroupFootworkClockV839={trackId:string;lastSeconds:number;count:number;gains:number[][]};
export const createGroupFootworkClockV839=():GroupFootworkClockV839=>({trackId:'',lastSeconds:-1,count:0,gains:[]});
export type GroupFootworkInputV839={settings:NaturalFootworkSettingsV839;trackId?:string|null;seconds:number;delta:number;
 playing:boolean;reducedMotion:boolean;manualPriority:boolean;automaticGroup:boolean;footLocked:boolean;
 quality:string;genre?:string|null;section?:string|null;support:readonly FootSupportV486[]};
/** Per-slot group-foot lift/shift finishing pass, without changing any root
 * offset, root speed or contact. Never raises an observed planted foot. */
export function refineGroupFootworkV839(state:GroupFootworkClockV839,base:AdvancedFootworkOutputV486,p:GroupFootworkInputV839):{
 state:GroupFootworkClockV839;footwork:AdvancedFootworkOutputV486;active:boolean}{
 const neutral=()=>({state:createGroupFootworkClockV839(),footwork:base,active:false});
 const count=base.slots.length;
 if(!p.settings.enabled||!finite(p.settings.strength)||p.settings.strength<=0||!base.active||
  (count!==3&&count!==4)||p.support.length<count||!p.trackId?.trim()||!p.playing||p.reducedMotion||
  p.manualPriority||!p.automaticGroup||p.footLocked||p.quality==='low'||
  !finite(p.seconds)||p.seconds<0||!finite(p.delta)||p.delta<=0||p.delta>.15||
  p.support.some((s,i)=>i<count&&!s.tracked)||
  base.slots.some(s=>![s.offsetX,s.offsetZ,s.liftLeft,s.liftRight,s.rootSpeed,s.weightShift].every(finite)))return neutral();
 const reset=state.trackId!==p.trackId||state.lastSeconds<0||state.count!==count||state.gains.length!==count||
  p.seconds<state.lastSeconds-.08||p.seconds-state.lastSeconds>.4;
 const power=clamp(p.settings.strength/100,0,1),style=danceStyle(p.settings.style,p.genre);
 const beatSpeed=style==='hardtekk'?1.65:style==='rap'?.6:.9;
 const phrase=.5+.5*Math.sin(p.seconds*beatSpeed*Math.PI*2);
 const variation=1-power*(/hook|drop|final/i.test(p.section||'')?.025:.08)*(1-phrase);
 const gains:number[][]=[];
 const slots=base.slots.map((slot,i):FootworkSlotV486=>{
  const s=p.support[i],previous=reset?[1,1,1]:state.gains[i];
  const targets=[s.leftPlanted?0:variation,s.rightPlanted?0:variation,
   (s.leftPlanted&&s.rightPlanted?1-power*.32:1)*variation];
  const next=targets.map((target,k)=>{
   // Existing V596 already zeroed planted lifts; ensure no new contact lift.
   if(target===0)return 0;
   const from=previous?.[k]??1;
   return Math.min(from,target)+(target>from?(target-from)*factor(p.delta,style==='hardtekk'?.08:.16):0);
  });
  gains.push(next);
  return {...slot,liftLeft:s.leftPlanted?0:slot.liftLeft*next[0],
   liftRight:s.rightPlanted?0:slot.liftRight*next[1],weightShift:slot.weightShift*next[2]};
 });
 return {state:{trackId:p.trackId,lastSeconds:p.seconds,count,gains},footwork:{...base,slots},active:true};
}
