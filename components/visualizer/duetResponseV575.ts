/** V575: optional finish for the already verified V500 call/response cast.
 * Modifies only V144/V145 look/gesture overlays, no vocal identity or timing.
 */
import type {RapDuetInputV500,RapDuetPlanV500} from './intelligentRapDuetPerformanceV500';
import {refineNaturalDuetStageV584} from './naturalDuetStageInteractionV584';
import {refineCinematicDuetFaceV585} from './cinematicDuetInteractionV585';
import {refineFeatureDuetPerformanceV599} from './featureDuetPerformanceV599';
import {refineNaturalMultiArtistV607} from './naturalMultiArtistInteractionV607';
const clamp=(n:number,min:number,max:number)=>Math.max(min,Math.min(max,n));
const smooth=(n:number)=>{const t=clamp(n,0,1);return t*t*(3-2*t);};
const finishV585=(base:RapDuetPlanV500,input:RapDuetInputV500)=>
  refineNaturalMultiArtistV607(refineFeatureDuetPerformanceV599(refineCinematicDuetFaceV585(refineNaturalDuetStageV584(base,input),input),input),input);
export function refineDuetResponseV575(base:RapDuetPlanV500,input:RapDuetInputV500):RapDuetPlanV500{
 const {cue}=input;
 if(!base.active||input.manualPriority||input.reducedMotion||input.tier==='low'||
    cue.handoffFrom===null||cue.handoffFrom===cue.leadSlot||
    !Number.isFinite(input.progressMs)||!Number.isFinite(cue.startMs)||
    input.progressMs<cue.startMs||input.progressMs>=cue.endMs||
    base.slots.length!==input.count)return finishV585(base,input);
 // Smooth acknowledgement AFTER an authored switch, decays as the new solo settles.
 const moment=input.progressMs-cue.startMs;
 const amount=smooth(moment/140)*(1-smooth((moment-170)/450))*(input.tier==='balanced'?.55:1);
 if(amount<=.0001)return finishV585(base,input);
 return finishV585({...base,slots:base.slots.map((slot,index)=>{
   if(index!==cue.handoffFrom)return slot;
   return {...slot,
     look:{...slot.look,weight:clamp(slot.look.weight+amount*.025,0,.46)},
     gesture:{...slot.gesture,shoulder:clamp(slot.gesture.shoulder+amount*.004,0,.065),
       intensity:clamp(slot.gesture.intensity+amount*.009,0,.28)}};
 })},input);
}
