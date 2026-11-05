/** V963: verified next-section anticipation on the EXISTING Govee auto-sync tick.
 * No inferred song phases, timers, network calls, device discovery or storage writes.
 * Authored V354 stages, V948 timeline overrides and saved V912 shows always win.
 */
import type {GoveeLookV909} from '@/lib/goveeLanV909';
import type {TrackAnalysisV318} from '@/services/musicAnalysis/trackAnalysisV318';
import type {ConcertSceneV958} from '@/lib/ultimateConcertRoadmapV958';

export type ConcertBridgeOptionsV963={enabled:boolean;playing:boolean;
 savedShowActive?:boolean;authoredStageActive?:boolean;recovering?:boolean;reducedMotion?:boolean};
export type ConcertBridgePlanV963={active:boolean;nextPhase:'hook'|'drop'|null;
 remainingMs:number;windowMs:number;factor:number;reason:string};
const inactive=(reason:string):ConcertBridgePlanV963=>({active:false,nextPhase:null,
 remainingMs:0,windowMs:0,factor:1,reason});
const smooth=(t:number)=>{const x=Math.min(1,Math.max(0,t));return x*x*(3-2*x);};

/** Only a high-confidence adjacent section from the same V318 track can be anticipated.
 * Return strictly <=1 brightness multipliers; V961 still caps upward jumps afterwards.
 */
export function planVerifiedConcertBridgeV963(scene:ConcertSceneV958|null|undefined,
 analysis:TrackAnalysisV318|null|undefined,trackId:string,sectionIndex:number,
 progressMs:number,policy:ConcertBridgeOptionsV963):ConcertBridgePlanV963{
 if(!policy.enabled||!policy.playing)return inactive('V963 deaktiviert oder Song pausiert');
 if(policy.savedShowActive||policy.authoredStageActive||policy.recovering||scene?.timelineOverride)
  return inactive('Gespeicherte Show, manueller Cue oder Recovery hat Vorrang');
 if(!scene?.verified||!analysis||analysis.trackId!==trackId||!trackId||
  !Number.isFinite(progressMs)||!Number.isFinite(analysis.durationMs)||analysis.durationMs<=0||
  !Number.isInteger(sectionIndex)||sectionIndex<0||sectionIndex+1>=analysis.sections.length)
  return inactive('Keine passende bestätigte Trackanalyse');
 const current=analysis.sections[sectionIndex],next=analysis.sections[sectionIndex+1];
 const valid=(s:typeof current)=>Number.isFinite(s.startMs)&&s.startMs>=0&&
  Number.isFinite(s.durationMs)&&s.durationMs>0&&Number.isFinite(s.confidence)&&
  s.startMs+s.durationMs<=analysis.durationMs+1000;
 if(!valid(current)||!valid(next)||current.label!==scene.phase||current.confidence<.5||
  (next.label!=='hook'&&next.label!=='drop')||next.label===current.label||next.confidence<.65||
  Math.abs(next.startMs-(current.startMs+current.durationMs))>1000||
  progressMs<current.startMs||progressMs>=current.startMs+current.durationMs||
  progressMs>=next.startMs)return inactive('Nächster Abschnitt nicht ausreichend bestätigt');
 const windowMs=next.label==='drop'?1800:1400;
 const remainingMs=next.startMs-progressMs;
 if(remainingMs>windowMs||remainingMs<0)return inactive('Noch außerhalb des bestätigten Übergangs');
 const genre=scene.genre;
 const depth=next.label==='drop'
  ?(/hardtekk|hardstyle/i.test(genre)?.22:.16)
  :(/deutschrap/i.test(genre)?.10:.12);
 const factor=1-depth*(policy.reducedMotion?.45:1)*smooth((windowMs-remainingMs)/windowMs);
 return {active:true,nextPhase:next.label,remainingMs,windowMs,factor,
  reason:'Bestätigter '+(next.label==='drop'?'Drop':'Hook')+' – kontrollierte Spannungsphase'};
}

/** Dim only; never change RGB, lamp power, target role or the sender's dispatch rate. */
export function dimConcertBridgeLookV963(look:GoveeLookV909,
 plan:ConcertBridgePlanV963):GoveeLookV909{
 if(!plan.active||!Number.isFinite(plan.factor)||plan.factor<0||plan.factor>1||
  !Number.isFinite(look.brightness)||look.brightness<0||look.brightness>100)return look;
 const next=Math.min(look.brightness,Math.round(look.brightness*plan.factor));
 return next===look.brightness?look:{...look,brightness:next};
}
