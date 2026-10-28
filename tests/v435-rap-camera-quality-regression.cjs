'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {load}=require('./helpers/ts-loader-v404.cjs');
const {inspectRapCameraTransitionV435:inspect,proposeRapCameraQualitySettingsV435:propose}=
  load('components/visualizer/rapCameraQualityOptimizerV435');
const line=(idx,start,end,shot,lead=0)=>({lineIndex:idx,startMs:start,endMs:end,
  text:'Lyrics '+idx,shot,authoredShot:shot,override:null,strength:100,
  leadSlot:lead,durationMs:end-start,eligible:true});
const prev=line(0,0,1000,'solo-close');
const current=line(1,1000,1600,'reply-side',1);
const seq=[prev,current];
const input={trackId:'track',previous:prev,current,history:seq,strength:100,bpm:120,
  duo:true,lyricsProtected:true};
const baseline={smoothness:100,beatSync:false};
const snapshot=JSON.stringify(input);
const broken=inspect(input,baseline);
assert(broken.available&&broken.changed);
assert(broken.score<100);
assert(broken.issues.some(issue=>issue.code==='incomplete'),'short lyric cannot finish transition');
assert(broken.metrics.remainingHoldMs<180);
const optimized=propose(input,baseline);
assert(optimized.improved,'should find shorter duration to improve a short line');
assert(optimized.after.score>optimized.before.score);
assert(optimized.settings.smoothness<baseline.smoothness);
assert.equal(JSON.stringify(input),snapshot,'analysis must not mutate inputs');
assert.equal(baseline.smoothness,100,'proposal must not mutate preference inputs');
assert.deepEqual(optimized.after,inspect(input,optimized.settings));
const repeat=inspect({...input,previous:{...prev,shot:current.shot,leadSlot:current.leadSlot}},baseline);
assert(!repeat.changed);
const missing=inspect({...input,trackId:''},baseline);
assert(!missing.available&&missing.score===null);
const frequent=[
  line(0,100,800,'solo-close'),line(1,800,1450,'reply-side',1),
  line(2,1450,2000,'hook-push'),line(3,2000,2600,'duet-wide'),
  line(4,2600,3300,'solo-close')];
const report=inspect({...input,current:frequent[4],previous:frequent[3],history:frequent},baseline);
assert(report.issues.some(issue=>issue.code==='rapid-changes'&&!issue.parameterFixable));
assert.equal(report.metrics.changesInFourSeconds,4);
const sane=inspect({...input,current:line(1,1000,9000,'reply-side',1)},
  {smoothness:70,beatSync:false});
assert(sane.score!==null&&sane.score>=70);
const panel=fs.readFileSync('components/visualizer/RapCameraTransitionPreviewPanelV434.tsx','utf8');
const stage=fs.readFileSync('components/visualizer/StageCameraDirectorV289.tsx','utf8');
for(const value of ['inspectRapCameraTransitionV435','proposeRapCameraQualitySettingsV435',
  'Optimierungsvorschlag in Variante B übernehmen','setCandidate(suggestion.settings)',
  'Variante B übernehmen','Qualitätsindikator','CameraLivePreviewV291']){
    assert(panel.includes(value),`missing UI element: ${value}`);
}
assert(!panel.includes('seekTo(')&&!panel.includes('setProgressMs('));
assert(!stage.includes('V435'),'V435 must not introduce a second live camera');
const pkg=require('../package.json');
assert(Number(pkg.version.match(/v(\d+)$/)?.[1])>=435);
require('./helpers/release-coverage-v651.cjs').assertIncluded('test:v435');
assert(pkg.scripts['verify:offline:fast'].includes('test:v435'));
console.log('PASS V435: deterministic bounded inspection, short-line remediation, manual-only draft and camera isolation');
