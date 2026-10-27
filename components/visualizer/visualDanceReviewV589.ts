/** V589 — read-only review of poses sampled from the ACTUAL GLB by V534.
 * Timeline flags and review status are evidence pointers, not optical verdicts.
 * No rendering, inferred ground contact, animation editing or invented test data.
 */
import type {MotionSampleReportV534} from './advancedMotionInspectorV534';
/** Minimal structural view; importing the browser GLTF loader here would force
 * browser-only Three.js modules into the offline pure-logic typecheck. */
export type AdvancedMotionReviewInputV589={
 clipName:string;pose:MotionSampleReportV534;
 curveEvents:readonly {atSeconds:number;severity:'warning'|'hint';detail:string;track:string}[];
 transition:{status:'smooth-candidate'|'inspect'|'high-contrast'|'unavailable';recommendedCrossfadeSeconds:number;note:string}|null;
 transitionTo:string|null;
};

export type DanceReviewFlagV589={
  atSeconds:number;endSeconds:number;kind:'possible-foot-slide'|'root-jump'|'sampling-gap'|'joint-curve'|'clip-transition';
  importance:'check'|'notice';title:string;explanation:string;side?:'left'|'right';
};
export type DanceReviewV589={
  clipName:string;durationSeconds:number;sampleCount:number;
  validFootSamples:boolean;flags:readonly DanceReviewFlagV589[];
  counts:{slides:number;jumps:number;curveWarnings:number;transitionChecks:number};
  needsVisualReview:boolean;coverage:'sampled-rig'|'keyframes-only';
  crossfadeSeconds:number|null;disclaimer:string;
};
const clamp=(v:number,a:number,b:number)=>Math.max(a,Math.min(b,v));
const round=(n:number)=>Math.round(n*100)/100;
/** Keyframes can extend beyond clip duration if the source GLB is malformed. Clamp
 * markers to the actual playable range and cap DOM work on very long clips. */
export function buildVisualDanceReviewV589(
 report:AdvancedMotionReviewInputV589,durationSeconds:number,maxMarkers=72,
):DanceReviewV589{
 const duration=Number.isFinite(durationSeconds)?clamp(durationSeconds,0,3600):0;
 const cap=Number.isFinite(maxMarkers)?Math.floor(clamp(maxMarkers,1,120)):72;
 const result:DanceReviewFlagV589[]=[];
 function append(at:number,kind:DanceReviewFlagV589['kind'],importance:DanceReviewFlagV589['importance'],title:string,explanation:string,side?:'left'|'right'){
  if(!Number.isFinite(at)||at<0||result.length>=cap)return;
  const timestamp=round(clamp(at,0,duration));
  result.push({atSeconds:timestamp,endSeconds:round(Math.min(duration,timestamp+0.12)),kind,importance,title,explanation,side});
 }
 for(const f of report.pose.findings){
  append(f.atSeconds,f.kind==='potential-foot-slide'?'possible-foot-slide':f.kind==='sudden-root-motion'?'root-jump':'sampling-gap',
   f.severity==='warning'?'check':'notice',f.label,f.explanation,f.side);
 }
 for(const f of report.curveEvents){
  append(f.atSeconds,'joint-curve',f.severity==='warning'?'check':'notice',f.detail,`Animationskanal: ${f.track}`);
 }
 if(report.transition&&report.transition.status!=='smooth-candidate'){
  append(duration,'clip-transition',report.transition.status==='high-contrast'?'check':'notice',
   `Übergang zu ${report.transitionTo??'Folgeclip'}`,report.transition.note);
 }
 result.sort((a,b)=>a.atSeconds-b.atSeconds||(a.importance==='check'?-1:1));
 const flags=result.slice(0,cap);
 const curveWarnings=report.curveEvents.filter(e=>e.severity==='warning').length;
 const transitionChecks=report.transition&&report.transition.status!=='smooth-candidate'?1:0;
 return {
  clipName:report.clipName||'Unbenannter Clip',durationSeconds:duration,sampleCount:report.pose.samples,
  validFootSamples:report.pose.contactAssumption!=='unavailable'&&report.pose.footSamples>0,
  flags,counts:{slides:report.pose.potentialSlideIntervals,jumps:report.pose.rootJumps,curveWarnings,transitionChecks},
  needsVisualReview:true,coverage:report.pose.samples>=2?'sampled-rig':'keyframes-only',
  crossfadeSeconds:report.transition?.recommendedCrossfadeSeconds??null,
  disclaimer:'Nur Skelett-/Keyframe-Stichproben aus der Original-GLB. Bodenkontakt wird aus der niedrigsten Fußposition geschätzt. Kein automatischer Beweis für Fußrutschen, gute Hautdeformation, ästhetische Qualität oder ein erfolgreiches visuelles Review.',
 };
}
export type VisualDanceChecklistV589={motionSeen:boolean;footContactSeen:boolean;transitionSeen:boolean;fullSongSeen:boolean};
export const emptyVisualDanceChecklistV589=():VisualDanceChecklistV589=>({motionSeen:false,footContactSeen:false,transitionSeen:false,fullSongSeen:false});
/** Only the human can mark a visual review complete. A clean heuristic cannot. */
export function visualDanceReviewStatusV589(checks:VisualDanceChecklistV589,hasFollowingClip:boolean):{
 completed:boolean;stepsDone:number;stepsTotal:number;label:string;
}{
 const steps=[checks.motionSeen,checks.footContactSeen,hasFollowingClip?checks.transitionSeen:true,checks.fullSongSeen];
 const total=hasFollowingClip?4:3;
 const done=steps.filter(Boolean).length-(hasFollowingClip?0:1);
 const completed=done===total;
 return {completed,stepsDone:done,stepsTotal:total,label:completed?'Manuelle Sichtprüfung bestätigt':'Manuelle Sichtprüfung noch offen'};
}
/** Session-only preview data; no automatic pass or image capture is implied. */
export function exportDanceReviewV589(report:DanceReviewV589,checks:VisualDanceChecklistV589,hasFollowingClip:boolean){
 return {format:'sonic-v589-visual-dance-review',version:1,originalGlbUntouched:true,
  visualReview:visualDanceReviewStatusV589(checks,hasFollowingClip),checks,
  evidence:report,limitations:report.disclaimer};
}
