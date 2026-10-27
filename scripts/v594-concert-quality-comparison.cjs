'use strict';
/** V594: deterministic, evidence-scoped comparison of two REAL V592 recordings.
 * No media seek, Spotify access, auto-optimisation or fabricated visual judgement.
 */
const {adviceForLiveReport,overlapInfo,formationOverlapInfo,boundsValid}=require('./v593-concert-quality-advisor.cjs');
const finite=x=>typeof x==='number'&&Number.isFinite(x);
const rounded=(n,places=2)=>Number(n.toFixed(places));
const blocked=reason=>({format:'sonic-v594-concert-comparison',status:'blocked',reason,autoApplied:false,humanReviewRequired:true});
const scoreWarnings=s=>{
 const warnings=s.warnings.map(x=>String(x).toLowerCase());
 const clipped=warnings.some(x=>x.includes('angeschnitten'))||s.actorBounds?.some(a=>boundsValid(a.bounds)&&(a.bounds.minX<-.97||a.bounds.maxX>.97||a.bounds.minY<-.97||a.bounds.maxY>.97));
 const lyrics=overlapInfo(s),formation=formationOverlapInfo(s);
 return {clipped:!!clipped,lyricsOverlap:lyrics.state==='measured'&&lyrics.fraction>=.08,
  formationOverlap:formation.state==='measured'&&formation.fraction>=.45,
  lowCoverage:finite(s.coverage?.nonBackgroundFraction)&&s.coverage.nonBackgroundFraction<.01,
  syncWarning:warnings.some(x=>x.includes('nicht als synchronisiert'))};
};
const metricsOf=report=>{
 const t=report.frameTiming,shots=report.screenshots,counts={clipped:0,lyricsOverlap:0,formationOverlap:0,lowCoverage:0,syncWarning:0};
 for(const shot of shots){const w=scoreWarnings(shot);for(const k of Object.keys(counts))if(w[k])counts[k]++;}
 return {averageFps:rounded(t.averageFps),p95FrameMs:rounded(t.p95FrameMs),p99FrameMs:rounded(t.p99FrameMs),
  frameCount:t.frames,shotCount:shots.length,modelCount:report.modelCount,drawCallsMedian:median(shots.map(s=>s.drawCalls)),
  trianglesMedian:median(shots.map(s=>s.triangles)),...counts};
};
const median=values=>{const v=values.filter(finite).sort((a,b)=>a-b);return v.length?rounded(v.length%2?v[(v.length-1)/2]:(v[v.length/2-1]+v[v.length/2])/2):null;};
function matches(before,after,tolerance=1800){
 const found=[];let j=0;
 for(let i=0;i<before.length;i++){
  let k=-1,best=Infinity;
  for(let index=j;index<after.length;index++){
   const gap=Math.abs(before[i].progressMs-after[index].progressMs);
   if(gap<best){k=index;best=gap;}
   if(after[index].progressMs>before[i].progressMs+tolerance)break;
  }
  if(k>=j&&best<=tolerance){found.push({beforeIndex:i,afterIndex:k,progressDeltaMs:rounded(after[k].progressMs-before[i].progressMs)});j=k+1;}
 }
 return found;
}
function valid(report){
 if(adviceForLiveReport(report).status!=='advice-needs-human-review')return false;
 const t=report.frameTiming;
 if(!finite(t.averageFps)||t.averageFps<=0||t.averageFps>300||
  !finite(t.p95FrameMs)||t.p95FrameMs<=0||!finite(t.p99FrameMs)||t.p99FrameMs<t.p95FrameMs||
  !Number.isInteger(t.frames)||t.frames<2||report.screenshots.length>8||
  !report.screen||![report.screen.width,report.screen.height].every(Number.isInteger))return false;
 if(report.screen.width<640||report.screen.width>3840||report.screen.height<480||report.screen.height>2160)return false;
 const names=new Set();let previous=-1;
 for(const s of report.screenshots){
  if(s.progressMs<=previous||names.has(s.file))return false;
  previous=s.progressMs;names.add(s.file);
 }
 return true;
}
function changeMetric(name,a,b,direction,unit){
 if(!finite(a)||!finite(b))return {name,before:a??null,after:b??null,delta:null,assessment:'not-measured',unit};
 const delta=rounded(b-a);const tolerance=name==='averageFps'?Math.max(1,a*.05):
  name==='p95FrameMs'||name==='p99FrameMs'?Math.max(2,a*.05):
  name==='drawCallsMedian'?Math.max(10,a*.05):name==='trianglesMedian'?Math.max(1000,a*.05):0;
 const significant=Math.abs(b-a)>tolerance;
 return {name,before:a,after:b,delta,relativePercent:a?rounded(100*(b-a)/a):null,
  assessment:!significant?'similar':direction*(b-a)>0?'improved':'regressed',unit,
  note:'Heuristische Änderung im beobachteten Browser, keine Kausalitäts- oder Sichtqualitätsaussage.'};
}
function compareConcertReports(before,after){
 if(!valid(before)||!valid(after))return blocked('Only two valid, measured real V592 live-stage reports are accepted.');
 if(before.sourceTrack!==after.sourceTrack)return blocked('Different Spotify track evidence: no cross-song before/after result.');
 const sameScreen=before.screen.width===after.screen.width&&before.screen.height===after.screen.height;
 const sameCount=before.modelCount===after.modelCount;
 const sameBrowser=Boolean(before.browser?.userAgent&&after.browser?.userAgent&&before.browser.userAgent===after.browser.userAgent&&
  before.browser.webglVersion&&before.browser.webglVersion===after.browser.webglVersion);
 const sameMode=before.mode===after.mode;
 const overlapMs=Math.max(0,Math.min(before.screenshots.at(-1).progressMs,after.screenshots.at(-1).progressMs)-
  Math.max(before.screenshots[0].progressMs,after.screenshots[0].progressMs));
 const aligned=matches(before.screenshots,after.screenshots);
 const reasons=[];
 if(!sameScreen)reasons.push('Display size differs; camera/lyrics coverage not directly comparable.');
 if(!sameBrowser)reasons.push('Chromium/WebGL configuration not identical or not evidenced.');
 if(!sameCount)reasons.push('GLB actor count differs.');
 if(!sameMode)reasons.push('Capture mode differs.');
 if(overlapMs<2500||aligned.length<2)reasons.push('Insufficient aligned playback positions (need 2 captures within ±1.8 s and at least 2.5 s shared interval).');
 const comparable=!reasons.length;
 const a=metricsOf(before),b=metricsOf(after);
 const definitions=[['averageFps',1,'rAF/s'],['p95FrameMs',-1,'ms'],['p99FrameMs',-1,'ms'],
  ['drawCallsMedian',-1,'draw calls'],['trianglesMedian',-1,'triangles']];
 const deltas=definitions.map(([key,dir,unit])=>changeMetric(key,a[key],b[key],dir,unit));
 const counts=['clipped','lyricsOverlap','formationOverlap','lowCoverage','syncWarning'].map(key=>({name:key,
  before:a[key],after:b[key],unit:'flagged screenshots',
  assessment:comparable&&a.shotCount===b.shotCount?(b[key]<a[key]?'fewer-heuristic-flags':b[key]>a[key]?'more-heuristic-flags':'same-count'):'not-comparable',
  caveat:'Bounding boxes and warning frequencies are heuristic and do not establish artistic quality.'}));
 return {format:'sonic-v594-concert-comparison',status:comparable?'comparable-needs-human-review':'limited-needs-human-review',
  source:'two-measured-v592-live-stage-reports',autoApplied:false,humanReviewRequired:true,
  prerequisites:{sameTrack:true,sameScreen,sameBrowser,sameCount,sameMode,overlapMs:rounded(overlapMs),alignedCaptureCount:aligned.length},
  limitations:[...reasons,'Changes in rAF/frame times are not proof of GPU gains, stable thermals or causation.',
   'Pixel differences reflect motion, lyrics and lighting as well as quality. Manual side-by-side inspection is mandatory.',
   'No automatic change to Spotify, choreography, GLB library, camera, lyrics or stage settings.'],
  observations:{before:a,after:b},metrics:deltas.map(x=>({...x,assessment:comparable?x.assessment:'not-comparable'})),
  warningCounts:counts,alignedCaptures:aligned,
  visualComparison:{status:'pending-local-png-analysis',alignedCount:aligned.length,
   interpretation:'Image deltas show different pixels only; no positive or negative visual judgement.'}};
}
module.exports={compareConcertReports,valid,metricsOf,matches,scoreWarnings};
