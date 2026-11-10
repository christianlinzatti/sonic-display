import type {AudioFeatures} from '../types/audio';
export type MusicalEvidence={source:'microphone';confidence:number;phase:number;energy:number;onset:number;anticipation:number};
/** Estimated Spotify metrics never become measured evidence. */
export function measuredMusic(active:boolean,metrics:AudioFeatures):MusicalEvidence|undefined{
 if(!active||!metrics.phaseLocked||metrics.beatPhase==null)return undefined;
 return {source:'microphone',confidence:Math.min(metrics.phaseConfidence??0,metrics.bpmConfidence??0),phase:metrics.beatPhase,
  energy:metrics.energyEnvelope,onset:metrics.kickAccentIntensity??0,anticipation:metrics.kickAnticipation??0};
}
export function musicalDirection(signal:MusicalEvidence|undefined){
 const neutral={measured:false,pulse:0,prepare:0,quiet:false};
 if(!signal||signal.source!=='microphone'||![signal.confidence,signal.phase,signal.energy,signal.onset,signal.anticipation].every(Number.isFinite)||
  signal.confidence<.7||signal.confidence>1||signal.phase<0||signal.phase>1||signal.energy<0||signal.energy>1)return neutral;
 const bound=(n:number)=>Math.max(0,Math.min(1,n));
 return {measured:true,pulse:bound(signal.onset)*(1-bound(signal.phase/.28))**2,
  prepare:bound(signal.anticipation),quiet:signal.energy<.045};
}
