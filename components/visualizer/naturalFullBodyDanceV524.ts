/** V524 – Natural Full-Body Dance 3.0.
 * Temporal stabilizer for V486's OPTIONAL automatically generated group steps.
 * Never adjusts authored stage/root coordinates, source GLB clips, joint transforms,
 * actual foot-IK targets, vocalist timing or manually selected choreography.
 * Contact flags are supplied by the existing V486/V487 rig pipeline; unknown
 * feet are not represented as verified ground contacts.
 */
import type {AdvancedFootworkOutputV486,FootSupportV486,FootworkSlotV486} from './advancedDanceFootworkV486';
import {refineExpressiveFootworkV587} from './expressiveDanceFootworkV587';
import {stepGroupFootworkQualityV596,type GroupFootworkQualityStateV596} from './naturalFootworkQualityV596';

export type DanceStyleV524='rap-flow'|'hard-dance'|'neutral';
export type NaturalFullBodyStateV524={
  trackId:string; count:number; lastSeconds:number;
  slots:FootworkSlotV486[];
};
export type NaturalFullBodyInputV524={
  trackId?:string|null;seconds:number;delta:number;count:number;
  footwork:AdvancedFootworkOutputV486;support:readonly FootSupportV486[];
  genre?:string|null;playing:boolean;reducedMotion:boolean;manualPriority:boolean;
  footLocked:boolean;automaticGroup:boolean;tier:'low'|'balanced'|'high';
  expressiveV587?:{cueSeconds:number;bpm?:number|null;section?:string|null};
  qualityV596?:{state:GroupFootworkQualityStateV596};
};
const clamp=(n:number,lo:number,hi:number)=>Math.min(hi,Math.max(lo,n));
const valid=(n:number)=>Number.isFinite(n);
const initialSlot=():FootworkSlotV486=>({offsetX:0,offsetZ:0,liftLeft:0,liftRight:0,rootSpeed:1,weightShift:0});
export const newNaturalFullBodyStateV524=():NaturalFullBodyStateV524=>({trackId:'',count:0,lastSeconds:-1,slots:[]});
export function classifyDanceStyleV524(genre?:string|null):DanceStyleV524{
  if(/hardstyle|hardtekk|rawstyle|hardcore/i.test(genre??''))return 'hard-dance';
  if(/deutschrap|hip.?hop|trap|drill|\brap\b/i.test(genre??''))return 'rap-flow';
  return 'neutral';
}
/** Strict non-mutating step. A valid support observation forces a planted foot
 * to zero immediately; smoothing is exclusively an attenuation of swing.
 * The V494 contact solver remains sole owner of GLB root-foot damping.
 */
export function stepNaturalFullBodyV524(state:NaturalFullBodyStateV524,input:NaturalFullBodyInputV524):{
 state:NaturalFullBodyStateV524;footwork:AdvancedFootworkOutputV486;style:DanceStyleV524;active:boolean;
 qualityStateV596?:GroupFootworkQualityStateV596;
}{
 const style=classifyDanceStyleV524(input.genre);
 const base=input.footwork;
 const neutral=()=>({state:newNaturalFullBodyStateV524(),footwork:base,style,active:false});
 if(!input.trackId?.trim()||!input.playing||input.reducedMotion||input.manualPriority||input.footLocked||
  !input.automaticGroup||input.tier==='low'||!base.active||
  (input.count!==3&&input.count!==4)||base.slots.length!==input.count||input.support.length<input.count||
  !valid(input.seconds)||input.seconds<0||!valid(input.delta)||input.delta<=0||input.delta>.25||
  base.slots.some(s=>![s.offsetX,s.offsetZ,s.liftLeft,s.liftRight,s.rootSpeed,s.weightShift].every(valid))){
  return neutral();
 }
 const reset=state.trackId!==input.trackId||state.count!==input.count||state.lastSeconds<0||
  input.seconds<state.lastSeconds-.08||input.seconds-state.lastSeconds>.38||state.slots.length!==input.count;
 const tau=style==='rap-flow'?.112:style==='hard-dance'?.065:.092;
 const alpha=clamp(1-Math.exp(-input.delta/tau),0,1);
 const intensity=style==='rap-flow'?.90:style==='hard-dance'?.83:.92;
 const balanceGain=style==='rap-flow'?.87:style==='hard-dance'?.70:.85;
 const slots=base.slots.map((source,i):FootworkSlotV486=>{
  const sup=input.support[i];
  const plantL=sup.tracked&&sup.leftPlanted,plantR=sup.tracked&&sup.rightPlanted;
  const previous=reset?(state.slots[i]??initialSlot()):state.slots[i];
  const targetLeft=plantL?0:clamp(source.liftLeft,0,1)*intensity;
  const targetRight=plantR?0:clamp(source.liftRight,0,1)*intensity;
  // Never lag a newly planted foot and never create swing that was absent
  // from the single song-clock V486 planner.
  const liftLeft=reset?targetLeft:plantL?0:Math.min(Math.max(0,source.liftLeft),clamp(previous.liftLeft+(targetLeft-previous.liftLeft)*alpha,0,1));
  const liftRight=reset?targetRight:plantR?0:Math.min(Math.max(0,source.liftRight),clamp(previous.liftRight+(targetRight-previous.liftRight)*alpha,0,1));
  // Reduce the small visual pelvis sway if measured both feet are anchored.
  // Do not move either IK ankle or the authored stage root.
  const swayScale=plantL&&plantR?.32:balanceGain;
  const targetShift=clamp(source.weightShift*swayScale,-.014,.014);
  const weightShift=reset?targetShift:clamp(previous.weightShift+(targetShift-previous.weightShift)*alpha,-.014,.014);
  const rootTarget=clamp(source.rootSpeed,0,1);
  const interpolated=reset?rootTarget:clamp(previous.rootSpeed+(rootTarget-previous.rootSpeed)*alpha,0,1);
  // A stable double foot plant MUST NOT keep the previous (faster) travel
  // speed after support becomes known.
  const rootSpeed=plantL&&plantR?Math.min(rootTarget,interpolated):interpolated;
  return {offsetX:source.offsetX,offsetZ:source.offsetZ,liftLeft,liftRight,rootSpeed,weightShift};
 });
 const preliminary={state:{trackId:input.trackId,count:input.count,lastSeconds:input.seconds,slots},
  footwork:input.expressiveV587?refineExpressiveFootworkV587({active:base.active,slots},{
    seconds:input.seconds,cueSeconds:input.expressiveV587.cueSeconds,bpm:input.expressiveV587.bpm,
    section:input.expressiveV587.section,genre:input.genre,support:input.support,tier:input.tier,
  }):{active:base.active,slots},style,active:true};
 // Opt-in V596 release smoothing runs after V524/V587. The unmodified
 // V524 result is retained for callers without the new group state.
 if(!input.qualityV596)return preliminary;
 const quality=stepGroupFootworkQualityV596(input.qualityV596.state,preliminary.footwork,{
  trackId:input.trackId,seconds:input.seconds,delta:input.delta,playing:input.playing,genre:input.genre,
  support:input.support,reducedMotion:input.reducedMotion,manualPriority:input.manualPriority,
  footLocked:input.footLocked,automaticGroup:input.automaticGroup,tier:input.tier,
 });
 return {...preliminary,footwork:quality.footwork,qualityStateV596:quality.state};
}
