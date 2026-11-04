/** V907 – conservative profile comparison from actual, completed V905 runs.
 * Avatar/FX labels are USER DECLARATIONS, never measured or applied by this
 * module. Only V826 renderer windows provide frame metrics. No side effects.
 */
import {summarizeGuidedBenchmarksV905,type BenchmarkRunV905,type BenchmarkPresetV905} from './guidedConcertBenchmarkV905';
import {createConcertBenchmarkReportsV906,type ReportEvidenceV906} from './concertBenchmarkReportV906';
import type {ReviewTierV903} from './concertQualityReviewV903';
export const PROFILE_COMPARISON_SCHEMA_V907='sonic-concert-profile-comparison-v907';
export const PROFILE_MAX_RUNS_V907=18;
export const PROFILE_MIN_RUNS_V907=3;
export type DeclaredAvatarsV907=2|3|4;
export type DeclaredEffectsV907='reduced'|'standard'|'full';
export interface ProfileTagV907 {avatars:DeclaredAvatarsV907;effects:DeclaredEffectsV907}
export interface ProfileRunV907 {run:BenchmarkRunV905;tag:ProfileTagV907}
export interface ProfileSummaryV907 {
 id:number;sceneIndex:number;preset:BenchmarkPresetV905;targetFps:30|60;tier:ReviewTierV903;
 avatars:DeclaredAvatarsV907;effects:DeclaredEffectsV907;count:number;
 evidence:ReportEvidenceV906;fpsMedian:number;fpsMin:number;fpsMax:number;
 fpsIqr:number;frameMsMedian:number;p95WindowMean:number;pressureMean:number;
 status:string;
}
export type ProfileComparisonStatusV907='insufficient'|'variable'|'similar'|'observed-higher'|'observed-lower';
export interface ProfilePairV907 {
 left:number;right:number;sceneIndex:number;preset:BenchmarkPresetV905;targetFps:30|60;
 status:ProfileComparisonStatusV907;deltaFps:number|null;deltaPercent:number|null;
 explanation:string;
}
const validTag=(t:ProfileTagV907|null|undefined):t is ProfileTagV907=>!!t&&
 (t.avatars===2||t.avatars===3||t.avatars===4)&&
 (t.effects==='reduced'||t.effects==='standard'||t.effects==='full');
const round=(n:number)=>Number(n.toFixed(2));
const sameGroup=(a:ProfileRunV907,b:ProfileRunV907)=>a.run.trackKey===b.run.trackKey&&
 a.run.sceneIndex===b.run.sceneIndex&&a.run.preset===b.run.preset&&
 a.run.targetFps===b.run.targetFps&&a.run.tier===b.run.tier&&
 a.tag.avatars===b.tag.avatars&&a.tag.effects===b.tag.effects;
const sameBaseline=(a:ProfileRunV907,b:ProfileRunV907)=>a.run.trackKey===b.run.trackKey&&
 a.run.sceneIndex===b.run.sceneIndex&&a.run.preset===b.run.preset&&a.run.targetFps===b.run.targetFps;
const validRun=(r:BenchmarkRunV905)=>!!r&&summarizeGuidedBenchmarksV905([r]).length===1;
/** Only register a real V905 run. Tag is frozen at the explicit Start click. */
export function recordProfileRunV907(history:readonly ProfileRunV907[],run:BenchmarkRunV905|null,
 tag:ProfileTagV907|null):ProfileRunV907[] {
 if(!run||!validTag(tag)||!validRun(run)||history.some(x=>x.run.id===run.id))return [...history];
 return [...history,{run:{...run},tag:{...tag}}].slice(-PROFILE_MAX_RUNS_V907);
}
/** A run is in the current V905 history only; no zombie result after Clear. */
export function activeProfileRunsV907(records:readonly ProfileRunV907[],
 completed:readonly BenchmarkRunV905[]):ProfileRunV907[]{
 const ids=new Map(completed.map(r=>[r.id,r]));
 return records.filter(r=>validTag(r.tag)&&validRun(r.run)&&ids.has(r.run.id)&&
 JSON.stringify(ids.get(r.run.id))===JSON.stringify(r.run));
}
export function buildProfileComparisonV907(records:readonly ProfileRunV907[]):{
 groups:ProfileSummaryV907[];pairs:ProfilePairV907[]}{
 const seen=new Set<number>();
 const accepted=records.filter(r=>validTag(r.tag)&&validRun(r.run)&&!seen.has(r.run.id)&&!!seen.add(r.run.id));
 const buckets:ProfileRunV907[][]=[];
 for(const r of accepted){const bucket=buckets.find(g=>sameGroup(g[0],r));if(bucket)bucket.push(r);else buckets.push([r]);}
 const groups:ProfileSummaryV907[]=[];
 for(const bucket of buckets){
  const report=createConcertBenchmarkReportsV906(bucket.map(x=>x.run))[0];
  if(!report||report.count!==bucket.length)continue;
  const first=bucket[0];
  groups.push({id:first.run.id,sceneIndex:report.sceneIndex,preset:report.preset,targetFps:report.targetFps,
   tier:report.tier,avatars:first.tag.avatars,effects:first.tag.effects,count:report.count,evidence:report.evidence,
   fpsMedian:report.fpsMedian,fpsMin:report.fpsMin,fpsMax:report.fpsMax,fpsIqr:report.fpsIqr,
   frameMsMedian:report.frameMsMedian,p95WindowMean:report.p95WindowMean,
   pressureMean:report.pressureMean,status:report.status});
 }
 const pairs:ProfilePairV907[]=[];
 for(let i=0;i<buckets.length;i++)for(let j=i+1;j<buckets.length;j++){
  if(!sameBaseline(buckets[i][0],buckets[j][0]))continue;
  const left=groups.find(g=>g.id===buckets[i][0].run.id),right=groups.find(g=>g.id===buckets[j][0].run.id);
  if(!left||!right)continue;
  let status:ProfileComparisonStatusV907='insufficient';
  let deltaFps:number|null=null,deltaPercent:number|null=null;
  let explanation='Mindestens drei vollständige, unabhängige V905-Durchläufe je Konfiguration erforderlich.';
  if(left.count>=PROFILE_MIN_RUNS_V907&&right.count>=PROFILE_MIN_RUNS_V907){
   if(left.evidence!=='repeatable'||right.evidence!=='repeatable'){
    status='variable';explanation='Mindestens eine Messgruppe schwankt zu stark. Keine belastbare Rangfolge.';
   }else{
    deltaFps=round(right.fpsMedian-left.fpsMedian);
    deltaPercent=round(deltaFps/left.fpsMedian*100);
    const meaningful=Math.abs(deltaFps)>=2&&Math.abs(deltaPercent)>=5;
    status=!meaningful?'similar':deltaFps>0?'observed-higher':'observed-lower';
    explanation=status==='similar'?'Kein ausreichend großer beobachteter FPS-Unterschied.':
     'Beobachteter FPS-Unterschied auf diesem Gerät; keine kausale Wirkung einzelner Parameter nachgewiesen.';
   }
  }
  pairs.push({left:left.id,right:right.id,sceneIndex:left.sceneIndex,preset:left.preset,
   targetFps:left.targetFps,status,deltaFps,deltaPercent,explanation});
 }
 return {groups,pairs};
}
/** Anonymous export. Never emit a private track key, hardware claim, timestamp or original run ID. */
export function exportProfileComparisonV907(records:readonly ProfileRunV907[]):string {
 const comparison=buildProfileComparisonV907(records);
 const ids=new Map(comparison.groups.map((g,i)=>[g.id,i+1]));
 return JSON.stringify({schema:PROFILE_COMPARISON_SCHEMA_V907,version:1,
  groups:comparison.groups.map(({id,...g},i)=>({profile:i+1,...g,tagSource:'user-declared'})),
  pairs:comparison.pairs.map(({left,right,...p})=>({left:ids.get(left),right:ids.get(right),...p})),
  caveats:[
   'FPS and frame intervals are measured by V826 and summarized by V905/V906.',
   'Avatar count and FX configuration are manually declared labels, NOT verified renderer configuration.',
   'This studio does not change the stage, avatar count, quality profile or any effects.',
   'Profiles are only compared for the same private song, scene, benchmark preset and FPS target on this session device.',
   'Observed differences are not causal evidence, GPU timing or optical quality ratings.',
   'Results on the current PC do not predict FPS on Raspberry Pi or a mini-PC.'
  ]},null,2);
}
