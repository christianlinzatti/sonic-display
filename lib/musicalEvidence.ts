import type {AudioFeatures} from '../types/audio';
export type MusicalEvidence={source:'microphone';confidence:number;phase:number;energy:number;onset:number;anticipation:number;bass?:number;snare?:number;highs?:number;attack?:number};
/** Estimated Spotify metrics never become measured evidence. */
export function measuredMusic(active:boolean,metrics:AudioFeatures):MusicalEvidence|undefined{
 if(!active||metrics.activity==='quiet'||!metrics.phaseLocked||metrics.beatPhase==null)return undefined;
 return {source:'microphone',confidence:Math.min(metrics.phaseConfidence??0,metrics.bpmConfidence??0),phase:metrics.beatPhase,
  energy:metrics.energyEnvelope,onset:metrics.kickAccentIntensity??0,anticipation:metrics.kickAnticipation??0,bass:metrics.bassOnset??metrics.bass,snare:metrics.snareOnset??metrics.snare,highs:metrics.highs,attack:metrics.attack};
}
export function musicalDirection(signal:MusicalEvidence|undefined){
 const neutral={measured:false,pulse:0,prepare:0,quiet:false,weight:0,snap:0,flow:0};
 if(!signal||signal.source!=='microphone'||![signal.confidence,signal.phase,signal.energy,signal.onset,signal.anticipation].every(Number.isFinite)||
  signal.confidence<.7||signal.confidence>1||signal.phase<0||signal.phase>1||signal.energy<0||signal.energy>1)return neutral;
 const bound=(n:number)=>Number.isFinite(n)?Math.max(0,Math.min(1,n)):0;
 return {measured:true,pulse:bound(signal.onset)*(1-bound(signal.phase/.28))**2,
  prepare:bound(signal.anticipation),quiet:signal.energy<.045,
  weight:bound(signal.bass??0)*bound(signal.onset),snap:bound(signal.snare??0)*bound(signal.attack??0),
  flow:bound(signal.highs??0)*(1-bound(signal.attack??0))};
}
