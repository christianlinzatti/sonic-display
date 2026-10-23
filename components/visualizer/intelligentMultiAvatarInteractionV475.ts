/** V475 – bounded, deterministic interaction refinements for the automatic 3/4-artist stage.
 * Sources are stage positions, existing V444 interactions and V460 visual scene cues.
 * Credits and lyric heuristics DO NOT identify the person singing in the recording.
 * No GLB clip edits, root motion, timers, additional audio sampling or persisted state.
 */
import type {ArtistInteractionPlanV444,InteractionSlotV444} from './multiArtistInteractionV444';
import type {GroupPoseV326} from './multiAvatarStageDirectorV326';
import type {FeatureDirectionV460} from './intelligentFeaturePerformanceV460';

export type InteractionTierV475='high'|'balanced'|'low';
export interface InteractionInputV475 {
  trackId:string|null|undefined;
  base:ArtistInteractionPlanV444;
  pose:GroupPoseV326|null;
  feature:FeatureDirectionV460|null|undefined;
  count:number;
  seconds:number;
  cueSeconds:number;
  beat:number;
  strength:number;
  playing:boolean;
  reducedMotion:boolean;
  manualPriority:boolean;
  tier:InteractionTierV475;
}
const clamp=(v:number,lo:number,hi:number)=>Number.isFinite(v)?Math.max(lo,Math.min(hi,v)):lo;
const smooth=(v:number)=>{const x=clamp(v,0,1);return x*x*(3-2*x);};
const pulse=(phase:number,center:number,width:number)=>smooth(1-Math.abs(phase-center)/width);
const finitePosition=(v:unknown):v is readonly number[]=>Array.isArray(v)&&v.length>=3&&
  [v[0],v[1],v[2]].every((x)=>typeof x==='number'&&Number.isFinite(x));

/** Selects a visual attention target; never reassigns a singer. */
export function refineMultiAvatarInteractionV475(input:InteractionInputV475):ArtistInteractionPlanV444 {
  const {base,pose,feature}=input;
  const count=input.count;
  // Existing authored singer cues and explicit manual stage direction are sacred.
  if(!base.enabled||base.source!=='visual-stage'||input.manualPriority||!input.playing||
    input.reducedMotion||!input.trackId?.trim()||!pose||!Number.isInteger(count)||
    count<3||count>4||base.slots.length!==count||pose.positions.length<count||
    !pose.positions.slice(0,count).every(finitePosition)||
    !Number.isFinite(input.seconds)||input.seconds<0||!Number.isFinite(input.cueSeconds)||
    input.seconds<input.cueSeconds||!Number.isFinite(input.beat)||
    !Number.isFinite(input.strength)||input.strength<=0)return base;
  const tier=input.tier==='low'?.24:input.tier==='balanced'?.65:1;
  const amount=tier*clamp(input.strength,0,100)/100*
    smooth((input.seconds-input.cueSeconds)/.46);
  if(amount<=0)return base;
  const elapsed=Math.max(0,input.seconds-input.cueSeconds);
  // Deterministic phrase phase: seeks/replays produce identical results.
  const phase=((elapsed/2.4)%1+1)%1;
  const energy=.25+.75*clamp(input.beat,0,1);
  const hook=base.group===true||feature?.active===true&&feature.moment==='hook';
  const visualReply=!hook&&feature?.active===true&&feature.moment==='reply'&&
    feature.responseGain>0&&feature.lead>=0&&feature.lead<count&&
    feature.partner>=0&&feature.partner<count&&feature.lead!==feature.partner;
  const lead=visualReply?feature!.lead:base.lead;
  const partner=visualReply?feature!.partner:lead===null?null:(lead+1)%count;
  const main=pulse(phase,.23,.21),response=pulse(phase,.61,.22);
  const featureReply=visualReply?clamp(feature!.responseGain,0,1):0;
  const slots=base.slots.map((old):InteractionSlotV444=>{
    const slot=old.slot;
    if(!Number.isInteger(slot)||slot<0||slot>=count)return old;
    const self=pose.positions[slot];
    const isLead=lead!==null&&slot===lead;
    const isPartner=partner!==null&&slot===partner;
    const event=hook?main:isLead?main:isPartner?response:response*.2;
    const reaction=amount*energy*event*(visualReply&&isPartner?.4+.6*featureReply:1);
    // Leads briefly acknowledge the reply, responders turn toward the lead.
    // Hooks remain audience-facing, with the same nod rhythm across the cast.
    const target=hook||lead===null?null:isLead&&visualReply?pose.positions[partner!]:
      !isLead?pose.positions[lead]:null;
    const dx=target?target[0]-self[0]:0;
    const dz=target?target[2]-self[2]:0;
    const desiredYaw=target?clamp(Math.atan2(dx,Math.max(1.2,2.6+dz)),-.38,.38):0;
    const lookGain=isLead?featureReply*response: isPartner?response:response*.45;
    const extraYaw=desiredYaw*amount*.24*lookGain;
    const look={...old.look,
      yaw:clamp(old.look.yaw+extraYaw,-.38,.38),
      pitch:clamp(old.look.pitch-.014*reaction,-.075,.075),
      eyeYaw:clamp(old.look.eyeYaw+extraYaw*.23,-.105,.105),
      weight:clamp(old.look.weight+(.15*lookGain*amount),0,.72),
    };
    // Alternating left/right accents in verses, shared bounce on hooks.
    const left=hook?.023:slot%2===0?.018:.009;
    const right=hook?.023:slot%2===1?.018:.009;
    const gesture={...old.gesture,
      leftLift:clamp(old.gesture.leftLift+left*reaction,0,.21),
      rightLift:clamp(old.gesture.rightLift+right*reaction,0,.24),
      shoulder:clamp(old.gesture.shoulder+.017*reaction,-.085,.085),
      lean:clamp(old.gesture.lean+(isLead?-.009:isPartner?.007:0)*reaction,-.035,.035),
      intensity:clamp(old.gesture.intensity+.05*reaction,0,.9),
    };
    return {...old,look,gesture};
  });
  return {...base,slots};
}
