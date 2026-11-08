/** V1089 · Beat & Drop Intelligence 4.0.
 * Opt-in, measured beat-edge qualification for existing V1087 virtual effects.
 * NEVER discovers or authorizes a musical drop: V1087's observed-section and
 * show/quality/manual controls remain the only authorization layer.
 * Pure, deterministic and song-scoped. No wall-clock, hardware, timers or IO.
 */
import type {AudioFeatures} from '../types/audio';

export type BeatPrecisionV1089='balanced'|'strict';
export type BeatDecisionV1089='disabled'|'invalid'|'priming'|'held'|'weak'|'refractory'|'qualified'|'no-beat';
export type BeatStateV1089={
 trackId:string;lastProgressMs:number;lastRawBeat:boolean;
 energyBaseline:number;bassBaseline:number;refractorySeconds:number;events:number;
};
export type BeatResultV1089={state:BeatStateV1089;qualifiedBeat:boolean;confidence:number;decision:BeatDecisionV1089};
export const INITIAL_BEAT_STATE_V1089:Readonly<BeatStateV1089>=Object.freeze({
 trackId:'',lastProgressMs:-1,lastRawBeat:false,energyBaseline:0,bassBaseline:0,refractorySeconds:0,events:0,
});
const valid=(v:unknown):v is number=>typeof v==='number'&&Number.isFinite(v)&&v>=0&&v<=1;
const clamp=(n:number)=>Math.max(0,Math.min(1,n));
const off=(decision:BeatDecisionV1089):BeatResultV1089=>({
 state:{...INITIAL_BEAT_STATE_V1089},qualifiedBeat:false,confidence:0,decision,
});
export function stepBeatDropIntelligenceV1089(previous:BeatStateV1089,input:{
 enabled:boolean;playing:boolean;reducedMotion:boolean;reactive:boolean;
 precision:BeatPrecisionV1089;trackId?:string|null;progressMs:number;deltaSeconds:number;
 audio:Pick<AudioFeatures,'beat'|'beatStrength'|'bass'|'energyEnvelope'|'attack'|'kickAccentIntensity'>;
}):BeatResultV1089{
 if(!input.enabled||!input.playing||input.reducedMotion||!input.reactive)return off('disabled');
 const {audio}=input;
 if(!audio||!valid(audio.beatStrength)||!valid(audio.bass)||!valid(audio.energyEnvelope)||
  !valid(audio.attack)||(audio.kickAccentIntensity!==undefined&&!valid(audio.kickAccentIntensity))||
  typeof audio.beat!=='boolean'||input.precision!=='balanced'&&input.precision!=='strict'||
  typeof input.trackId!=='string'||input.trackId.length<1||input.trackId.length>160||
  !Number.isFinite(input.progressMs)||input.progressMs<0||
  !Number.isFinite(input.deltaSeconds)||input.deltaSeconds<0||input.deltaSeconds>.2)
  return off('invalid');
 const trackId=input.trackId,position=input.progressMs,dt=input.deltaSeconds;
 const primer=()=>({trackId,lastProgressMs:position,lastRawBeat:audio.beat,
  energyBaseline:audio.energyEnvelope,bassBaseline:audio.bass,refractorySeconds:0,events:0});
 const reset=previous.lastProgressMs<0||previous.trackId!==trackId||
  position+250<previous.lastProgressMs||position-previous.lastProgressMs>12000;
 if(reset)return {state:primer(),qualifiedBeat:false,confidence:0,decision:'priming'};
 const rise=clamp((audio.energyEnvelope-previous.energyBaseline)*3.5);
 const kick=audio.kickAccentIntensity??0;
 // Confidence is only an onset-quality score, NOT a claimed song/drop probability.
 const confidence=clamp(audio.beatStrength*.42+audio.bass*.18+audio.attack*.20+rise*.12+kick*.08);
 const refractorySeconds=Math.max(0,previous.refractorySeconds-dt);
 const edge=audio.beat&&!previous.lastRawBeat;
 const qualified=edge&&refractorySeconds<=0&&audio.beatStrength>=.77&&
  audio.bass>=.55&&audio.energyEnvelope>=.62&&
  confidence>=(input.precision==='strict'?.75:.64);
 // Scale smoothing by elapsed render time; never infer an audio beat from the mean.
 const alpha=Math.min(.22,dt*2.5);
 const state:BeatStateV1089={
  trackId,lastProgressMs:position,lastRawBeat:audio.beat,
  energyBaseline:previous.energyBaseline+(audio.energyEnvelope-previous.energyBaseline)*alpha,
  bassBaseline:previous.bassBaseline+(audio.bass-previous.bassBaseline)*alpha,
  refractorySeconds:qualified?(input.precision==='strict'?.32:.22):refractorySeconds,
  events:Math.min(1000000,previous.events+(qualified?1:0)),
 };
 const decision:BeatDecisionV1089=qualified?'qualified':!audio.beat?'no-beat':
  !edge?'held':refractorySeconds>0?'refractory':'weak';
 return {state,qualifiedBeat:qualified,confidence:edge?confidence:0,decision};
}
