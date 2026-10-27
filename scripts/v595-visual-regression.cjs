'use strict';
/** V595: conservative regression analysis of two real, measured V592 live-stage runs.
 * Song-aligned comparisons; animation/lyrics motion is not counted as a defect.
 * No automatic baseline blessing, UI changes, Spotify control or synthetic evidence.
 */
const {compareConcertReports,scoreWarnings}=require('./v594-concert-quality-comparison.cjs');
const {decodePng}=require('./v590-visual-image.cjs');
const finite=n=>typeof n==='number'&&Number.isFinite(n);
const clamp=(n,lo,hi)=>Math.max(lo,Math.min(hi,n));
const categories=['solo','duet','hook','drop'];
const round=n=>Number(n.toFixed(5));
const blocked=reason=>({format:'sonic-v595-live-visual-regression',status:'blocked',reason,reviewRequired:true,approved:false,checkpoints:[]});
function classifyCue(evidence){
 const strings=Object.values(evidence??{}).filter(x=>typeof x==='string').join(' ').toLowerCase();
 if(!strings)return null;
 // Only explicit labels; no singer detection from audio, audience faces or beat guesses.
 if(/\b(drop|breakdown)\b/.test(strings))return 'drop';
 if(/\b(hook|chorus|refrain)\b/.test(strings))return 'hook';
 if(/\b(duet|duo|reply|feature)\b/.test(strings))return 'duet';
 if(/\b(solo|verse|strophe)\b/.test(strings))return 'solo';
 return null;
}
function validRect(r){return r&&[r.x,r.y,r.width,r.height].every(finite)&&r.width>0&&r.height>0;}
function boundsRect(bounds,stage,screen){
 if(!bounds||!validRect(stage)||![bounds.minX,bounds.maxX,bounds.minY,bounds.maxY].every(finite)||
  bounds.maxX<=bounds.minX||bounds.maxY<=bounds.minY)return null;
 return {x:stage.x+(bounds.minX+1)*stage.width/2,y:stage.y+(1-bounds.maxY)*stage.height/2,
  width:(bounds.maxX-bounds.minX)*stage.width/2,height:(bounds.maxY-bounds.minY)*stage.height/2};
}
function masksForShot(s,screen){
 const result=[];
 if(Array.isArray(s.actorBounds)&&validRect(s.stageRect))for(const actor of s.actorBounds){
  const r=boundsRect(actor.bounds,s.stageRect,screen);if(r)result.push({...r,kind:'actor'});
 }
 if(validRect(s.lyricRect)&&s.lyricRect.width* s.lyricRect.height<screen.width*screen.height*.45)
  result.push({...s.lyricRect,kind:'lyrics'});
 return result;
}
function motionMaskedDifference(beforeBytes,afterBytes,before,after,screen){
 const a=decodePng(beforeBytes),b=decodePng(afterBytes);
 if(a.width!==b.width||a.height!==b.height||a.width!==screen.width||a.height!==screen.height)
  return {status:'incompatible-image-dimensions'};
 const masks=[...masksForShot(before,screen),...masksForShot(after,screen)].map(r=>{
  const pad=r.kind==='actor'?Math.max(12,Math.min(r.width,r.height)*.14):12;
  return [clamp(Math.floor(r.x-pad),0,a.width),clamp(Math.floor(r.y-pad),0,a.height),
   clamp(Math.ceil(r.x+r.width+pad),0,a.width),clamp(Math.ceil(r.y+r.height+pad),0,a.height)];
 });
 // Count only background / unmoving screen regions. Camera movement, fog and projected
 // lighting can still legitimately change these regions: never auto-fail on pixel delta alone.
 let usable=0,changed=0,delta=0;
 for(let y=0;y<a.height;y+=3)for(let x=0;x<a.width;x+=3){
  if(masks.some(([x0,y0,x1,y1])=>x>=x0&&x<x1&&y>=y0&&y<y1))continue;
  const p=(y*a.width+x)*3;
  const d=Math.max(Math.abs(a.rgb[p]-b.rgb[p]),Math.abs(a.rgb[p+1]-b.rgb[p+1]),Math.abs(a.rgb[p+2]-b.rgb[p+2]));
  usable++;delta+=d;if(d>=22)changed++;
 }
 const possible=Math.ceil(a.width/3)*Math.ceil(a.height/3);
 if(usable<100||usable/possible<.22)return {status:'too-much-motion-masked',unmaskedFraction:round(usable/possible)};
 return {status:'motion-masked-heuristic-review',unmaskedFraction:round(usable/possible),
  changedFraction:round(changed/usable),meanChannelDelta:round(delta/usable),
  warning:changed/usable>.25?'Background/lighting/camera changed; manual visual review required':null};
}
function chooseScenario(before,after,mark){
 if(mark){if(!categories.includes(mark))return {kind:null,source:'invalid-manual-annotation'};
  return {kind:mark,source:'manual-review-annotation'};}
 const a=classifyCue(before.sceneEvidence),b=classifyCue(after.sceneEvidence);
 if(a&&b&&a===b)return {kind:a,source:'two-confirmed-stage-cues'};
 return {kind:null,source:a!==b?'missing-or-different-stage-cue':'no-explicit-stage-cue'};
}
function compareLiveRegression(baseline,candidate,annotation={},readImage=()=>null){
 const base=compareConcertReports(baseline,candidate);
 if(base.status==='blocked')return blocked(base.reason);
 if(base.status!=='comparable-needs-human-review')return blocked(`V594 prerequisites not satisfied: ${base.limitations.join(' ')}`);
 const shotsA=baseline.screenshots,shotsB=candidate.screenshots;
 const marks=annotation.checkpoints??[];
 if(!Array.isArray(marks)||marks.length>16||marks.some(m=>!m||!categories.includes(m.kind)||!finite(m.progressMs)||m.progressMs<0))
  return blocked('Only up to 16 explicit solo/duet/hook/drop annotations with valid song timestamps are accepted.');
 const checkpoints=[];
 for(const pair of base.alignedCaptures){
  const a=shotsA[pair.beforeIndex],b=shotsB[pair.afterIndex];
  // V594 matches within 1.8 seconds; stricter 1.2-second gate for visual regression.
  if(Math.abs(pair.progressDeltaMs)>1200)continue;
  const marksNear=marks.filter(m=>Math.abs(m.progressMs-a.progressMs)<=900&&Math.abs(m.progressMs-b.progressMs)<=900);
  if(marksNear.length>1)return blocked('Ambiguous manual checkpoints near same recording frame.');
  const scenario=chooseScenario(a,b,marksNear[0]?.kind);
  const wa=scoreWarnings(a),wb=scoreWarnings(b);
  const checks=[
   ['glb-count',a.actors,b.actors,b.actors<a.actors,'Measured rendered GLB actor count decreased'],
   ['lyrics-presence',a.lyricsMode,b.lyricsMode,a.lyricsMode==='dom-overlay'&&b.lyricsMode!=='dom-overlay','DOM lyrics mode changed; check 3D/external mode before calling this a defect'],
   ['clipped-avatar',wa.clipped,wb.clipped,!wa.clipped&&wb.clipped,'Possible new clipping warning'],
   ['lyrics-overlap',wa.lyricsOverlap,wb.lyricsOverlap,!wa.lyricsOverlap&&wb.lyricsOverlap,'Possible new text/actor overlap'],
   ['missing-sync-evidence',wa.syncWarning,wb.syncWarning,!wa.syncWarning&&wb.syncWarning,'New missing lyrics sync evidence'],
   ['low-coverage',wa.lowCoverage,wb.lowCoverage,!wa.lowCoverage&&wb.lowCoverage,'New mostly uniform screenshot warning']
  ];
  const issues=checks.filter(v=>v[3]).map(([id,before,after,,note])=>({id,before,after,note,severity:'manual-review'}));
  if(['act','shot','mode'].some(key=>typeof a.sceneEvidence?.[key]==='string'&&a.sceneEvidence[key]&&
    typeof b.sceneEvidence?.[key]==='string'&&b.sceneEvidence[key]&&a.sceneEvidence[key]!==b.sceneEvidence[key]))
   issues.push({id:'concert-cue-drift',severity:'manual-review',note:'Camera/stage director cue changed at same track position; validate intended edit.'});
  let pixels={status:'missing-original-PNG'};
  try{const imgA=readImage('baseline',a.file),imgB=readImage('candidate',b.file);
   if(Buffer.isBuffer(imgA)&&Buffer.isBuffer(imgB))pixels=motionMaskedDifference(imgA,imgB,a,b,baseline.screen);
  }catch(e){pixels={status:'invalid-PNG',reason:String(e.message).slice(0,180)};}
  if(pixels.warning)issues.push({id:'unmasked-scene-drift',severity:'manual-review',note:pixels.warning});
  const cameraCueStable=JSON.stringify(a.sceneEvidence??null)===JSON.stringify(b.sceneEvidence??null);
  checkpoints.push({kind:scenario.kind,source:scenario.source,baselineIndex:pair.beforeIndex,candidateIndex:pair.afterIndex,
   progressMs:a.progressMs,offsetMs:pair.progressDeltaMs,baselineImage:a.file,candidateImage:b.file,
   pixelEvidence:pixels,issues,stageCuesIdentical:cameraCueStable});
 }
 if(checkpoints.length<2)return blocked('Need at least two image pairs within 1.2 seconds of each other.');
 const groups=categories.map(kind=>{
  const xs=checkpoints.filter(c=>c.kind===kind);
  return {kind,observations:xs.length,flagged:xs.filter(c=>c.issues.length).length,
   status:xs.length?'observed-needs-human-review':'not-observed'};
 });
 const repeated={};for(const check of checkpoints)for(const issue of check.issues)
  (repeated[issue.id]??=[]).push(check.progressMs);
 const regressions=Object.entries(repeated).filter(([,points])=>points.length>=2)
  .map(([id,points])=>({id,observedFrames:points.length,progressMs:points,
   level:'repeated-warning-requires-human-review'}));
 const unclassified=checkpoints.filter(c=>!c.kind).length;
 const incomplete=groups.some(g=>!g.observations);
 const missingImages=checkpoints.some(c=>c.pixelEvidence.status==='missing-original-PNG'||c.pixelEvidence.status==='invalid-PNG');
 return {format:'sonic-v595-live-visual-regression',status:'review-required',reviewRequired:true,approved:false,
  source:'two-real-measured-v592-live-stage-reports',checkpoints,groups,unclassified,
  repeatedWarnings:regressions,baselineFps:base.observations.before.averageFps,
  candidateFps:base.observations.after.averageFps,
  coverage:{covered:4-groups.filter(g=>!g.observations).length,total:4,incomplete,missingImages},
  limitations:['Motion masks prevent normal performer/lyrics movement from being automatically flagged as a visual regression.',
   'A changed pixel, stage cue or background is not proof of a defect. No automatic visual approval.',
   'Only real V592 captures at close music positions are accepted; no synthetic playback or GLBs.',
   'Unobserved solo, duet, hook or drop scenarios cannot be marked passed.',
   'Manual scenario annotations are not detected singer roles.']};
}
module.exports={compareLiveRegression,chooseScenario,classifyCue,motionMaskedDifference,masksForShot};
