/** V904 – observational regression guard for repeated, completed V903 reviews.
 * Pure and read-only: no automatic setting changes, external requests, storage,
 * additional renderer sampling, GPU timers or inferred song/audio properties.
 * Repeats only match inside the SAME actual song, confirmed scene, exact patch,
 * performance tier and FPS target. The private track key never enters exports.
 */
import type {AdvisorPatchV902} from './concertQualityAdvisorV902';
import {validReviewPatchV903,type ConcertReviewV903,type ReviewWindowV903} from './concertQualityReviewV903';

export const MIN_REPEAT_REVIEWS_V904=3;
export const MAX_REPEAT_REVIEWS_V904=24;
export const MAX_REPEAT_GROUPS_V904=8;
export type RegressionStatusV904='insufficient'|'unstable'|'no-benefit'|'possible-benefit'|'regression';
export interface RegressionRecordV904 {
 reviewId:number;
 /** Private, session-only matching key; NEVER serialize to user-facing JSON. */
 trackKey:string;
 sceneIndex:number;
 patch:AdvisorPatchV902;
 before:ReviewWindowV903;
 after:ReviewWindowV903;
}
export interface RegressionGroupV904 {
 groupId:number;sceneIndex:number;patch:AdvisorPatchV902;targetFps:30|60;tier:ReviewWindowV903['tier'];
 repeats:number;positive:number;negative:number;fpsMedian:number;fpsMean:number;
 frameMsMedian:number;p95Median:number;pressureMedian:number;fpsSpread:number;
 status:RegressionStatusV904;reason:string;
}
const finite=(n:unknown):n is number=>typeof n==='number'&&Number.isFinite(n);
const validWindow=(w:ReviewWindowV903|null):w is ReviewWindowV903=>!!w&&Number.isInteger(w.samples)&&w.samples>=3&&
 (w.targetFps===30||w.targetFps===60)&&(['low','balanced','high'] as string[]).includes(w.tier)&&
 finite(w.fps)&&w.fps>0&&w.fps<=500&&finite(w.frameMs)&&w.frameMs>0&&w.frameMs<=250&&
 finite(w.p95FrameMs)&&w.p95FrameMs>=0&&w.p95FrameMs<=250&&
 finite(w.pressure)&&w.pressure>=0&&w.pressure<=1;
const validReview=(s:ConcertReviewV903|null):s is ConcertReviewV903=>!!s&&s.state==='ready'&&
 Number.isSafeInteger(s.id)&&s.id>0&&!!s.trackKey&&Number.isInteger(s.sceneIndex)&&s.sceneIndex>=0&&
 validReviewPatchV903(s.patch)&&validWindow(s.before)&&validWindow(s.after)&&
 s.before.targetFps===s.after.targetFps&&s.before.tier===s.after.tier;
/** Capture exactly once, only on a completed, evidence-backed V903 comparison. */
export function recordConcertRegressionV904(existing:readonly RegressionRecordV904[],review:ConcertReviewV903|null):RegressionRecordV904[] {
 if(!validReview(review)||existing.some(r=>r.reviewId===review.id))return [...existing];
 const entry:RegressionRecordV904={reviewId:review.id,trackKey:review.trackKey,sceneIndex:review.sceneIndex,
  patch:{...review.patch},before:{...review.before!},after:{...review.after!}};
 return [...existing,entry].slice(-MAX_REPEAT_REVIEWS_V904);
}
const patchKey=(p:AdvisorPatchV902)=>`${p.target}|${p.field}|${String(p.before)}|${String(p.value)}`;
const sameGroup=(a:RegressionRecordV904,b:RegressionRecordV904)=>a.trackKey===b.trackKey&&
 a.sceneIndex===b.sceneIndex&&patchKey(a.patch)===patchKey(b.patch)&&
 a.before.targetFps===b.before.targetFps&&a.before.tier===b.before.tier;
const median=(values:readonly number[])=>{const v=[...values].sort((a,b)=>a-b);const mid=Math.floor(v.length/2);
 return v.length%2?v[mid]:(v[mid-1]+v[mid])/2;};
const average=(values:readonly number[])=>values.reduce((sum,v)=>sum+v,0)/values.length;

/** Treat three distinct V903 apply/measure cycles as a MINIMUM, not statistical proof.
 * A mixed-sign trend or large FPS spread is unstable. A possible benefit requires
 * concordant FPS + frame-time changes without a P95 regression.
 */
export function evaluateRegressionGroupV904(items:readonly RegressionRecordV904[]):RegressionGroupV904|null {
 if(!items.length||items.some(x=>!sameGroup(x,items[0]))||new Set(items.map(x=>x.reviewId)).size!==items.length||
  items.some(x=>!validReviewPatchV903(x.patch)||!validWindow(x.before)||!validWindow(x.after)||
   x.before.targetFps!==x.after.targetFps||x.before.tier!==x.after.tier))return null;
 const fps=items.map(x=>x.after.fps-x.before.fps);
 const frame=items.map(x=>x.after.frameMs-x.before.frameMs);
 const p95=items.map(x=>x.after.p95FrameMs-x.before.p95FrameMs);
 const pressure=items.map(x=>x.after.pressure-x.before.pressure);
 const repeats=items.length,positive=fps.filter(d=>d>0.5).length,negative=fps.filter(d=>d< -0.5).length;
 const fpsMedian=median(fps),fpsMean=average(fps),frameMsMedian=median(frame),p95Median=median(p95),
  pressureMedian=median(pressure),fpsSpread=Math.max(...fps)-Math.min(...fps);
 let status:RegressionStatusV904='insufficient';
 let reason=`Erst ${repeats}/${MIN_REPEAT_REVIEWS_V904} unabhängige V903-Vergleiche dieser Einstellung und Songszene. Keine verlässliche Tendenz.`;
 if(repeats>=MIN_REPEAT_REVIEWS_V904){
  const swing=(positive>0&&negative>0)||fpsSpread>Math.max(4,Math.abs(fpsMedian)*1.6);
  if(swing){status='unstable';reason='FPS-Differenzen schwanken deutlich oder wechseln das Vorzeichen. Kein robuster Vorteil nachweisbar.';}
  else if(negative>=Math.ceil(repeats*.7)&&fpsMedian<=-1.5&&frameMsMedian>=.4){
   status='regression';reason='Wiederholt niedrigere FPS und längere Framezeiten beobachtet. Einstellung und Szene im Browser erneut prüfen.';
  }else if(positive>=Math.ceil(repeats*.75)&&fpsMedian>=1.5&&frameMsMedian<=-.45&&p95Median<=1.5){
   status='possible-benefit';reason='Wiederholt günstigere Renderer-Werte beobachtet; kein Beweis, dass die Einstellung ursächlich ist.';
  }else{status='no-benefit';reason='Wiederholte Messungen zeigen keinen ausreichend konsistenten Vorteil bei FPS und Framezeit.';}
 }
 const first=items[0],last=items[items.length-1];
 return {groupId:last.reviewId,sceneIndex:first.sceneIndex,patch:{...first.patch},
  targetFps:first.before.targetFps,tier:first.before.tier,repeats,positive,negative,
  fpsMedian,fpsMean,frameMsMedian,p95Median,pressureMedian,fpsSpread,status,reason};
}
export function summarizeConcertRegressionsV904(history:readonly RegressionRecordV904[]):RegressionGroupV904[] {
 const groups:RegressionRecordV904[][]=[];
 for(const record of history){
  if(!record.trackKey||!validWindow(record.before)||!validWindow(record.after)||
    !validReviewPatchV903(record.patch)||record.before.targetFps!==record.after.targetFps||
    record.before.tier!==record.after.tier)continue;
  const g=groups.find(g=>sameGroup(g[0],record));
  if(g){if(!g.some(r=>r.reviewId===record.reviewId))g.push(record);}
  else groups.push([record]);
 }
 return groups.map(evaluateRegressionGroupV904).filter((g):g is RegressionGroupV904=>!!g)
  .sort((a,b)=>b.groupId-a.groupId).slice(0,MAX_REPEAT_GROUPS_V904);
}
/** Opt-in export: no track identifiers, per-frame timestamps, Spotify metadata or raw samples. */
export function exportConcertRegressionsV904(history:readonly RegressionRecordV904[]):string {
 const groups=summarizeConcertRegressionsV904(history).map(({groupId,...summary},i)=>({comparison:i+1,...summary}));
 return JSON.stringify({schema:'sonic-concert-quality-regression-v904',version:1,
  source:'separate complete V903 before-after comparisons (V826 renderer intervals)',
  repeatMinimum:MIN_REPEAT_REVIEWS_V904,totalReviews:history.length,groups,
  caveat:'Repeated observations are not independent controlled experiments or proof of causality. Repeats are grouped only within the same private song and scene, exact setting change, FPS target and tier. Song IDs, raw frames and timestamps are omitted.'},null,2);
}
