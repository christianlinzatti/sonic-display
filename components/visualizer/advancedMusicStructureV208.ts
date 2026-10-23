/** V208: causal, bounded four-phase estimate from available live audio features.
 * Not a waveform decoder or an official Spotify song structure API. */
import type {DropPhase, DropPredictionState} from "./advancedDropPredictor";
import type {TimelineEvidence, TimelinePhase} from "./musicStructureTimeline";
export type StructureInput={energy:number;bass:number;kick:number;attack:number;anticipation:number;playing:boolean};
export type StructureState={phase:TimelinePhase;phaseSince:number;lastAt:number;lowFor:number;highFor:number;smoothedEnergy:number;smoothedBass:number;smoothedKick:number;confidence:number;reason:string;transitions:number};
const unit=(x:number)=>Number.isFinite(x)?Math.max(0,Math.min(1,x)):0;
export function initialStructureState():StructureState {return {phase:"verse",phaseSince:0,lastAt:-1,lowFor:0,highFor:0,smoothedEnergy:0,smoothedBass:0,smoothedKick:0,confidence:0,reason:"Startphase ohne verlässliche Beobachtungen",transitions:0};}
export function advanceStructureState(s:StructureState,input:StructureInput,prediction:Pick<DropPredictionState,"phase"|"buildScore"|"confidence">,now:number):StructureState {
 if(!Number.isFinite(now)||now<0||now<s.lastAt)return s;
 if(!input.playing)return {...initialStructureState(),lastAt:now,phaseSince:now,reason:"Wiedergabe pausiert"};
 const dt=s.lastAt<0?0:Math.min(0.5,Math.max(0,now-s.lastAt));
 const mix=dt===0?1:1-Math.exp(-dt/0.48);
 const smoothedEnergy=s.smoothedEnergy+(unit(input.energy)-s.smoothedEnergy)*mix;
 const smoothedBass=s.smoothedBass+(unit(input.bass)-s.smoothedBass)*mix;
 const smoothedKick=s.smoothedKick+(unit(input.kick)-s.smoothedKick)*mix;
 const quiet=smoothedEnergy<0.19 && smoothedBass<0.22 && smoothedKick<0.20;
 const loud=smoothedEnergy>0.28 || smoothedBass>0.32 || smoothedKick>0.38;
 const lowFor=quiet?Math.min(10,s.lowFor+dt):0;
 const highFor=loud?Math.min(10,s.highFor+dt):0;
 let phase=s.phase,phaseSince=s.phaseSince;
 // V194 maintains the guarded kick/drop-onset; a confirmed drop overrides quiet and build.
 if(prediction.phase==="drop" && phase!=="drop")phase="drop";
 else if(phase==="drop" && prediction.phase!=="drop" && now-phaseSince>=0.9)phase=lowFor>=0.9?"break":"verse";
 else if(phase!=="drop" && prediction.phase==="build" && lowFor<0.7)phase="build";
 else if(phase==="build" && prediction.phase!=="build" && now-phaseSince>=0.6)phase=lowFor>=0.9?"break":"verse";
 else if(phase!=="drop" && phase!=="build" && lowFor>=1.2 && now-phaseSince>=0.8)phase="break";
 else if(phase==="break" && highFor>=0.65 && now-phaseSince>=0.65)phase="verse";
 if(phase!==s.phase)phaseSince=now;
 const confidence=phase==="drop"?unit(prediction.confidence):phase==="build"?unit(prediction.buildScore):phase==="break"?unit(0.5+lowFor/4):unit(0.25+highFor/5);
 const reason=phase==="drop"?`Drop erkannt: Kick ${Math.round(unit(input.kick)*100)}%, Attack ${Math.round(unit(input.attack)*100)}%, Bass ${Math.round(unit(input.bass)*100)}%`:
  phase==="build"?`Build-up: Trend ${Math.round(unit(prediction.buildScore)*100)}%, Antizipation ${Math.round(unit(input.anticipation)*100)}%`:
  phase==="break"?`Break: ${lowFor.toFixed(1)}s anhaltend geringe Kick-, Bass- und Energiepegel`:
  `Verse/Grundphase: Energie ${Math.round(smoothedEnergy*100)}%, Bass ${Math.round(smoothedBass*100)}%`;
 return {phase,phaseSince,lastAt:now,lowFor,highFor,smoothedEnergy,smoothedBass,smoothedKick,confidence,reason,transitions:s.transitions+(phase!==s.phase?1:0)};
}
export function structureEvidence(s:StructureState,p:Pick<DropPredictionState,"buildScore">,anticipation:number):TimelineEvidence {
 return {energy:unit(s.smoothedEnergy),kick:unit(s.smoothedKick),bass:unit(s.smoothedBass),anticipation:unit(anticipation),buildScore:unit(p.buildScore),confidence:unit(s.confidence)};
}
export function choreographyPhase(phase:TimelinePhase):DropPhase{return phase==="break"?"verse":phase;}
