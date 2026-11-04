/** V908 – independent scene/FX evidence for V905 renderer windows.
 * V830 proves visible SkinnedMeshes in named performer roots, not GLB file provenance.
 * V826 counts prove actually scheduled effect elements, not optical quality or GPU time.
 * Snapshots are ephemeral and matched BY OBJECT IDENTITY to the exact V826 window.
 * Never infer a user-selected FX intensity preset from effect element counts.
 */
import type {CastProofV830} from './concertProductionEvidenceV830';
import type {ConcertQualitySnapshotV826,ConcertQualityCountsV826} from './concertQualityTelemetryV826';
import type {BenchmarkRunV905,BenchmarkSessionV905} from './guidedConcertBenchmarkV905';
export const PROOF_SCHEMA_V908='sonic-live-stage-benchmark-verification-v908';
export const PROOF_MAX_RUNS_V908=18;
export type FxObservedLaneV908='crowd'|'particles'|'foam'|'kinetic'|'spectral';
export type ProofVerdictV908='verified-visible-rigs'|'incomplete-visibility'|'not-observed';
export interface StageWindowProofV908 {
 snapshot:ConcertQualitySnapshotV826;trackKey:string;progressMs:number;
 expected:number;riggedSlots:number;skinnedMeshes:number;vertices:number;verified:boolean;
 observedFx:readonly FxObservedLaneV908[];fxBudgetActive:boolean;fxCost:number;
}
export interface RunWindowProofV908 {runId:number;index:number;valid:boolean;expected:number;
 riggedSlots:number;skinnedMeshes:number;observedFx:readonly FxObservedLaneV908[];
 fxBudgetActive:boolean;fxCost:number;}
export interface VerifiedRunV908 {runId:number;trackKey:string;sceneIndex:number;targetFps:30|60;
 tier:'low'|'balanced'|'high';preset:BenchmarkRunV905['preset'];requested:number;
 seen:number;confirmed:number;castCount:number|null;verdict:ProofVerdictV908;
 fxLanes:readonly FxObservedLaneV908[];fxActiveWindows:number;fxCostMean:number|null;
 changedCast:boolean;note:string;}
const OBSERVED_FX_V908:readonly FxObservedLaneV908[]=['crowd','particles','foam','kinetic','spectral'];
const fxRows=(c:ConcertQualityCountsV826):readonly FxObservedLaneV908[]=>{
 const r:FxObservedLaneV908[]=[];
 if(c.crowd>0)r.push('crowd');
 if(c.sparks+c.shards+c.confetti+c.energyRings>0)r.push('particles');
 if(c.foamBubbles+c.foamMist>0)r.push('foam');
 if(c.kineticColumns>0)r.push('kinetic');
 if(c.spectralWaves+c.spectralRings+c.spectralPrisms>0)r.push('spectral');
 return r;
};
const positive=(v:number)=>Number.isFinite(v)&&v>=0;
/** Same renderer publication as the actual V826 FPS window, called INSIDE its frame callback. */
export function makeStageWindowProofV908(snapshot:ConcertQualitySnapshotV826,
 cast:CastProofV830,trackKey:string,progressMs:number,allSlots?:CastProofV830):StageWindowProofV908|null {
 if(!snapshot.available||!snapshot.playing||!snapshot.verified||!Number.isInteger(snapshot.sampleCount)||
  snapshot.sampleCount<3||!trackKey||!positive(progressMs)||!cast||
  !Number.isInteger(cast.expected)||cast.expected<1||cast.expected>4||
  !Number.isInteger(cast.riggedSlots)||cast.riggedSlots<0||cast.riggedSlots>cast.expected||
  !Number.isInteger(cast.skinnedMeshes)||cast.skinnedMeshes<0||
  !Number.isInteger(cast.vertices)||cast.vertices<0||!positive(snapshot.fxCost))return null;
 const verified=cast.verified===true&&cast.riggedSlots===cast.expected&&
  (!!allSlots&&allSlots.expected===4&&allSlots.riggedSlots===cast.expected)&&
  cast.skinnedMeshes>=cast.expected&&cast.vertices>0;
 return {snapshot,trackKey,progressMs,expected:cast.expected,riggedSlots:cast.riggedSlots,
  skinnedMeshes:cast.skinnedMeshes,vertices:cast.vertices,verified,
  observedFx:fxRows(snapshot.counts),fxBudgetActive:snapshot.fxActive===true,fxCost:snapshot.fxCost};
}
let live:StageWindowProofV908|null=null;
/** Publication has NO additional React subscription; the preexisting V826 subscriber reads this. */
export function publishLiveStageProofV908(proof:StageWindowProofV908|null):void{live=proof;}
export function readLiveStageProofV908(snapshot:ConcertQualitySnapshotV826,trackKey:string):StageWindowProofV908|null {
 return live&&live.snapshot===snapshot&&live.trackKey===trackKey?live:null;
}
export function clearLiveStageProofV908():void{live=null;}
/** Exactly one observation per newly recorded V905 measurement frame (not warmups). */
export function recordRunProofV908(previous:readonly RunWindowProofV908[],session:BenchmarkSessionV905,
 snapshot:ConcertQualitySnapshotV826,proof:StageWindowProofV908|null):RunWindowProofV908[]{
 if(session.state!=='measuring'&&session.state!=='ready')return [...previous];
 const count=session.frames.length;
 if(count<1||count<=previous.length||count>12||previous.length!==count-1)return [...previous];
 // Frame capture must come from this snapshot and same live context, never stale scene.
 const f=session.frames[count-1];
 const context=!!proof&&proof.snapshot===snapshot&&proof.trackKey===session.trackKey&&
  proof.progressMs>=0&&snapshot.targetFps===session.targetFps&&snapshot.performanceTier===session.tier&&
  f.targetFps===snapshot.targetFps&&f.tier===snapshot.performanceTier&&
  Math.abs(f.fps-snapshot.fps)<.0001&&Math.abs(f.frameMs-snapshot.frameMs)<.0001;
 const ok=context&&proof!.verified;
 return [...previous,{runId:session.id,index:count,valid:!!ok,
  expected:context?proof!.expected:0,riggedSlots:context?proof!.riggedSlots:0,
  skinnedMeshes:context?proof!.skinnedMeshes:0,
  observedFx:context?[...proof!.observedFx]:[],fxBudgetActive:context?proof!.fxBudgetActive:false,
  fxCost:context?proof!.fxCost:0}];
}
/** A single missing proof or performer causes an incomplete verdict. */
export function finalizeRunProofV908(run:BenchmarkRunV905,windows:readonly RunWindowProofV908[]):VerifiedRunV908{
 const accepted=windows.filter(w=>w.runId===run.id&&w.index>=1&&w.index<=run.samples);
 const complete=accepted.length===run.samples&&new Set(accepted.map(w=>w.index)).size===run.samples;
 const castValues=accepted.map(w=>w.expected);
 const same=complete&&castValues.every(n=>n===castValues[0]&&n>=1&&n<=4);
 const confirmed=accepted.filter(w=>w.valid&&w.riggedSlots===w.expected&&w.skinnedMeshes>=w.expected).length;
 const verdict:ProofVerdictV908=complete&&same&&confirmed===run.samples?'verified-visible-rigs':
  accepted.some(w=>w.expected>0)?'incomplete-visibility':'not-observed';
 const seen=new Set<FxObservedLaneV908>();
 for(const w of accepted)if(w.expected>0)for(const lane of w.observedFx)if(OBSERVED_FX_V908.includes(lane))seen.add(lane);
 const costs=accepted.filter(w=>w.expected>0).map(w=>w.fxCost);
 const castCount=verdict==='verified-visible-rigs'?castValues[0]:null;
 return {runId:run.id,trackKey:run.trackKey,sceneIndex:run.sceneIndex,
  targetFps:run.targetFps,tier:run.tier,preset:run.preset,requested:run.samples,
  seen:accepted.length,confirmed,castCount,verdict,
  fxLanes:[...seen],fxActiveWindows:accepted.filter(w=>w.expected>0&&w.fxBudgetActive).length,
  fxCostMean:costs.length?Number((costs.reduce((a,b)=>a+b,0)/costs.length).toFixed(2)):null,
  changedCast:castValues.some(n=>n>0&&n!==castValues[0]),
  note:verdict==='verified-visible-rigs'?'Sichtbare, geriggte Darsteller in jedem Messfenster bestätigt. GLB-Dateiherkunft unbekannt.':
   'Keine lückenlose Sichtbarkeit der geriggten Darsteller während der V905-Messung nachgewiesen.'};
}
export function recordVerifiedRunV908(history:readonly VerifiedRunV908[],item:VerifiedRunV908):VerifiedRunV908[]{
 if(history.some(x=>x.runId===item.runId))return [...history];
 return [...history,item].slice(-PROOF_MAX_RUNS_V908);
}
export function getVerifiedRunsV908(history:readonly VerifiedRunV908[],completed:readonly BenchmarkRunV905[]):VerifiedRunV908[]{
 return history.filter(a=>completed.some(b=>b.id===a.runId&&b.trackKey===a.trackKey&&
 b.sceneIndex===a.sceneIndex&&b.samples===a.requested&&b.preset===a.preset&&
 b.tier===a.tier&&b.targetFps===a.targetFps));
}
/** Not automatically conflated with V907 self-reported FX strength. */
export function exportVerifiedRunsV908(history:readonly VerifiedRunV908[]):string {
 return JSON.stringify({schema:PROOF_SCHEMA_V908,version:1,records:history.map((r,i)=>({
  run:i+1,sceneIndex:r.sceneIndex,preset:r.preset,targetFps:r.targetFps,tier:r.tier,
  requested:r.requested,seen:r.seen,confirmed:r.confirmed,castCount:r.castCount,
  verdict:r.verdict,fxLanes:r.fxLanes,fxActiveWindows:r.fxActiveWindows,
  fxCostMean:r.fxCostMean,changedCast:r.changedCast,note:r.note})),caveats:[
  'Count is proven only for visible rigged performer stage slots, not GLB file origin.',
  'FX lanes describe nonzero V826 effect element counts, not every light/laser/LED state or intensity preset.',
  'The V907 reduced/standard/full FX tag remains a manual declaration and is NOT automatically validated.',
  'No private song ID, timestamp, raw renderer frame, GPU timer, or Raspberry Pi estimate is exported.'
 ]},null,2);
}
