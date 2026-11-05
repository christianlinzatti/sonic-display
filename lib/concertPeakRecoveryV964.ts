/** V964 – verified post-peak breathing room for a coherent concert arc.
 * Pure song-position computation. Never sends commands, guesses sections, uses
 * wall time, reads storage, mutates a show, or creates GPU objects.
 */
import type {GoveeLookV909} from '@/lib/goveeLanV909';
import type {TrackAnalysisV318} from '@/services/musicAnalysis/trackAnalysisV318';
import type {ConcertSceneV958} from '@/lib/ultimateConcertRoadmapV958';

export type PeakRecoveryOptionsV964={enabled:boolean;playing:boolean;
 savedShowActive?:boolean;authoredStageActive?:boolean;recovering?:boolean;reducedMotion?:boolean};
export type PeakRecoveryPlanV964={active:boolean;factor:number;elapsedMs:number;
 windowMs:number;previousPeak:'hook'|'drop'|null;reason:string};
const inactive=(reason:string):PeakRecoveryPlanV964=>({active:false,factor:1,elapsedMs:0,
 windowMs:0,previousPeak:null,reason});
const clamp=(value:number,lo:number,hi:number)=>Math.max(lo,Math.min(hi,value));
const smooth=(x:number)=>{const y=clamp(x,0,1);return y*y*(3-2*y);};

/** Only immediately adjacent, high-confidence V318 sections can shape recovery.
 * The original Govee look is the strict brightness ceiling (factor <=1).
 */
export function planConcertPeakRecoveryV964(scene:ConcertSceneV958|null|undefined,
 analysis:TrackAnalysisV318|null|undefined,trackId:string,sectionIndex:number,
 progressMs:number,options:PeakRecoveryOptionsV964):PeakRecoveryPlanV964{
 if(!options?.enabled||!options.playing)return inactive('V964 deaktiviert oder Musik pausiert');
 if(options.savedShowActive||options.authoredStageActive||options.recovering||scene?.timelineOverride)
  return inactive('Manuelle oder gespeicherte Lichtshow und Recovery haben Vorrang');
 if(!scene?.verified||!analysis||!trackId||analysis.trackId!==trackId||
  !Number.isFinite(progressMs)||!Number.isFinite(analysis.durationMs)||analysis.durationMs<=0||
  !Number.isInteger(sectionIndex)||sectionIndex<1||sectionIndex>=analysis.sections.length)
  return inactive('Keine zugehörige, bestätigte Songanalyse');
 const previous=analysis.sections[sectionIndex-1],current=analysis.sections[sectionIndex];
 const valid=(s:typeof current)=>Number.isFinite(s?.startMs)&&s.startMs>=0&&
  Number.isFinite(s.durationMs)&&s.durationMs>0&&Number.isFinite(s.confidence)&&
  s.startMs+s.durationMs<=analysis.durationMs+1000;
 if(!valid(previous)||!valid(current)||previous.confidence<.70||current.confidence<.65||
  (previous.label!=='hook'&&previous.label!=='drop')||
  !['verse','break','outro'].includes(current.label??'')||scene.phase!==current.label||
  Math.abs(previous.startMs+previous.durationMs-current.startMs)>500||
  progressMs<current.startMs||progressMs>=current.startMs+current.durationMs)
  return inactive('Kein verifizierter direkter Wechsel nach einer Hook/Drop-Spitze');
 const elapsedMs=progressMs-current.startMs;
 const windowMs=previous.label==='drop'?2500:1800;
 if(elapsedMs>=windowMs)return inactive('Erholung nach dem Peak abgeschlossen');
 const hard=/hardtekk|hardstyle|rawstyle/i.test(scene.genre);
 const rap=/deutschrap|hip.?hop|rap/i.test(scene.genre);
 const depth=(previous.label==='drop'?(hard?.18:rap?.12:.15):hard?.10:.08)*
  (options.reducedMotion?.6:1);
 const factor=1-depth*(1-smooth(elapsedMs/windowMs));
 return {active:true,factor,elapsedMs,windowMs,previousPeak:previous.label,
  reason:'Bestätigter Songwechsel: kontrollierte Erholung nach '+previous.label};
}

/** Apply to already-planned light, before V961 light governor. Never brighten,
 * modify RGB, issue power/strobe commands or change rate of LAN sending.
 */
export function dimConcertPeakRecoveryLookV964(look:GoveeLookV909,
 plan:PeakRecoveryPlanV964):GoveeLookV909{
 if(!plan.active||!Number.isFinite(plan.factor)||plan.factor<0||plan.factor>1||
  !Number.isFinite(look.brightness)||look.brightness<0||look.brightness>100)return look;
 const next=Math.min(look.brightness,Math.round(look.brightness*plan.factor));
 return next===look.brightness?look:{...look,brightness:next};
}
