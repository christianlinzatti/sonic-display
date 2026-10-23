/** V457: deterministic scene-boundary smoothing and *automatic-only* performance budgeting.
 * Reuses V446/V456 plans and the existing adaptive renderer tier; no extra ticker,
 * persistent edits, device sniffing, audio permissions or plugin dependencies.
 */
import type {SmartShowPlanV446,ShowBeatV446} from '../../components/visualizer/smartAutomaticRapShowV446';
import type {MotionSceneV438} from '../../components/visualizer/automaticMotionIntelligenceV438';
import {energyForUltimateShowV456, type UltimateShowDirectionV456} from './ultimateAutomaticShowV456';

export type ShowQualityTierV457='high'|'balanced'|'low';
export interface ShowContinuityV457 {
  direction:UltimateShowDirectionV456;
  /** 0 = previous phrase, 1 = current phrase; only for an actual section/lead change. */
  blend:number;
  previous:UltimateShowDirectionV456|null;
  lowCost:boolean;
  quality:ShowQualityTierV457;
}
const clamp=(v:number,lo:number,hi:number)=>Number.isFinite(v)?Math.max(lo,Math.min(hi,v)):lo;
const ease=(t:number)=>{const x=clamp(t,0,1);return x*x*(3-2*x);};
const momentFor=(beat:ShowBeatV446):UltimateShowDirectionV456['moment']=>
  beat.section==='hook'?'crew':beat.section==='intro'||beat.section==='outro'?'interlude':'solo';
const lerp=(a:number,b:number,t:number)=>a+(b-a)*t;
/** Derive preceding show moment from the already validated V446 timeline.
 * Do not try to smooth across track changes, seeks, pause, or manual overrides.
 */
export function planShowContinuityV457(input:{
  direction:UltimateShowDirectionV456;plan:SmartShowPlanV446|null|undefined;
  progressMs:number;trackId:string;quality:ShowQualityTierV457;
}):ShowContinuityV457{
  const {direction,plan,progressMs,trackId}=input;
  const quality=input.quality==='low'||input.quality==='balanced'?input.quality:'high';
  const inactive:ShowContinuityV457={direction,blend:1,previous:null,quality,lowCost:false};
  if(!direction.active||!plan||plan.trackId!==trackId||!Number.isFinite(progressMs)||
    progressMs<0||plan.beats.length===0)return inactive;
  let lo=0,hi=plan.beats.length-1,index=-1;
  while(lo<=hi){const mid=(lo+hi)>>1;if(plan.beats[mid].atMs<=progressMs){index=mid;lo=mid+1;}else hi=mid-1;}
  if(index<0)return inactive;
  const beat=plan.beats[index];
  // Keep this short and deterministic: all renders at the same timestamp agree.
  // Larger groups / lower render quality get a slightly longer, calmer envelope.
  const smoothingMs=quality==='low'?1900:quality==='balanced'?1600:1250;
  const prior=index>0?plan.beats[index-1]:null;
  const currentMoment=momentFor(beat),previousMoment=prior?momentFor(prior):null;
  const changed=!!prior&&(previousMoment!==currentMoment||
    (currentMoment==='solo'&&prior.focus!==beat.focus));
  const elapsed=progressMs-beat.atMs;
  const blend=changed&&elapsed>=0&&elapsed<smoothingMs?ease(elapsed/smoothingMs):1;
  // Model only the *automatic* multiplier effects, not the actual animation rig.
  const prevLight=previousMoment==='crew'?1.13:previousMoment==='interlude'?.94:1.02;
  const prevInteraction=previousMoment==='crew'?1.1:previousMoment==='interlude'?.92:1;
  const previous=changed&&blend<1?{...direction,moment:previousMoment!,leadSlot:Math.trunc(clamp(prior!.focus,0,direction.count-1)),
    scene:(prior!.section==='hook'?'hook':prior!.section==='intro'||prior!.section==='outro'?'break':'verse') as MotionSceneV438,
    lightMultiplier:prevLight,interactionMultiplier:prevInteraction}:null;
  let lightMultiplier=previous?lerp(previous.lightMultiplier,direction.lightMultiplier,blend):direction.lightMultiplier;
  let interactionMultiplier=previous?lerp(previous.interactionMultiplier,direction.interactionMultiplier,blend):direction.interactionMultiplier;
  // GPU/load guard: scale *additional automatic accents* only; never lower the
  // user's base lighting level, stop dancers, change camera settings, or edit motions.
  const factor=quality==='low'?.20:quality==='balanced'?.64:1;
  lightMultiplier=1+(lightMultiplier-1)*factor;
  interactionMultiplier=1+(interactionMultiplier-1)*factor;
  const activeDirection={...direction,lightMultiplier:clamp(lightMultiplier,.9,1.15),
    interactionMultiplier:clamp(interactionMultiplier,.9,1.1)};
  return {direction:activeDirection,blend,previous,quality,lowCost:quality==='low'};
}

/** Smooth the *automatic* motion energy, not GLB clip timing or authored poses. */
export function motionEnergyForContinuityV457(plan:ShowContinuityV457,slot:number,energy:number):number{
  const current=energyForUltimateShowV456(plan.direction,slot,energy);
  if(!plan.direction.active)return current;
  const previous=plan.previous?energyForUltimateShowV456(plan.previous,slot,energy):current;
  const eased=lerp(previous,current,plan.blend);
  // On low-tier hardware cap the additional *automatic hook boost*, but keep
  // real live energy untouched. The lead/background scene arbitration from V456
  // is never overridden, nor are authored motion timings affected.
  if(plan.lowCost&&plan.direction.moment==='crew')
    return clamp(Math.max(clamp(energy,0,1),Math.min(eased,.78)),0,1);
  return clamp(eased,0,1);
}
