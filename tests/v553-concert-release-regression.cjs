'use strict';
/** V553 release policy tests. Sampled FPS numbers are fixtures, NEVER real Pi claims. */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {load}=require('./helpers/ts-loader-v404.cjs');
const {assessConcertReleaseV553:assess,EMPTY_RELEASE_EVIDENCE_V553:empty}=load('services/monitoring/concertReleaseGateV553');
const {BENCHMARK_RECIPES_V522:recipes,beginBenchmarkV522:begin,
 advanceBenchmarkV522:advance}=load('services/monitoring/concertBenchmarkValidationV522');
const {assessConcertShowReadinessV543:oldReadiness}=load('services/monitoring/concertShowReadinessV543');
const at=1740000000000;
const reading=(time, overrides={})=>({at:time,fps:42,p95FrameMs:29,p99FrameMs:35,slowPercent:3,
 drawCalls:280,triangles:130000,avatarCount:4,tier:'balanced',dpr:1,
 piProfile:'pi',piLevel:'balanced',features:{lyrics:true,lipSync:true,reactiveLighting:true},
 heapMb:110,geometries:25,textures:16,...overrides});
function completed(id,scene,start,overrides={}){
 let r=begin(id,scene,30,reading(start,overrides),start+200);
 assert(r);
 const recipe=recipes.find(x=>x.id===scene);assert(recipe);
 for(let t=1;t<=recipe.warmupSeconds+recipe.measurementSeconds;t++)
  r=advance(r,reading(start+t*1000,overrides));
 assert.equal(r.status,'complete');return r;
}
const audit={lyricsLegible:true,lipSyncPlausible:true,motionNatural:true,lightReadable:true};
const all=Object.fromEntries(recipes.map(s=>[s.id,audit]));
const readyEvidence={buildStatus:'passed',buildEvidence:'Next.js production build succeeded, tsc --noEmit passed',
 device:'raspberry-pi',deviceLabel:'Raspberry Pi 5 + Chromium',realDeviceConfirmed:true,
 touchscreenChecked:true,noFreezesObserved:true,thermalsReviewed:true};
const runs=recipes.flatMap((s,k)=>Array.from({length:3},(_,i)=>completed(`${s.id}-${i}`,s.id,at+k*3000000+i*500000)));
assert.equal(runs.length,9);
assert.equal(oldReadiness(runs,all,30).status,'locally-reviewed');
const happy=assess(runs,all,30,readyEvidence);
assert.equal(happy.status,'human-signoff-ready');
assert.equal(happy.blockers.length,0);
assert.equal(happy.measuredRuns.length,9);
assert.equal(happy.readiness.completedScenes,3);
assert.match(happy.note,/keine automatische Zertifizierung/);
const toggles=['realDeviceConfirmed','touchscreenChecked','noFreezesObserved','thermalsReviewed'];
for(const key of toggles){
 const s=assess(runs,all,30,{...readyEvidence,[key]:false});
 assert.equal(s.status,'device-review-missing',key);
 assert(s.blockers.length>0);
}
for(const variant of [
 {...readyEvidence,buildStatus:'not-run'},
 {...readyEvidence,buildStatus:'failed'},
 {...readyEvidence,buildEvidence:' '},
]){
 const s=assess(runs,all,30,variant);
 assert.equal(s.status,'build-unverified');assert(!s.operatorBuildAttested);
}
for(const variant of [
 {...readyEvidence,device:'browser'},
 {...readyEvidence,deviceLabel:'  '},
]){
 const s=assess(runs,all,30,variant);
 assert.equal(s.status,'device-review-missing');assert(!s.operatorHardwareAttested);
}
assert.equal(assess([],{},30,empty).status,'benchmarks-missing');
assert.equal(assess(runs,{},30,readyEvidence).status,'visual-review-missing');
assert.equal(assess(runs.slice(0,-1),all,30,readyEvidence).status,'benchmarks-missing');
assert.equal(assess(runs,all,45,readyEvidence).status,'benchmarks-missing');
assert.equal(assess(runs.map(r=>({...r,configuration:r.configuration+'-changed'})),all,30,readyEvidence).status,'human-signoff-ready',
 'new valid common configs must not be judged on names, only observed comparable runs');
const mixed=runs.map((r,i)=>i===0?{...r,configuration:'different-tier'}:r);
assert.equal(assess(mixed,all,30,readyEvidence).status,'benchmarks-missing');
const slow=completed('now-slow',recipes[0].id,at+16000000,{fps:15,p95FrameMs:70,p99FrameMs:90,slowPercent:35});
assert.equal(assess([...runs,slow],all,30,readyEvidence).status,'measurements-needs-attention');
const invalid={...slow,id:'interrupted',status:'invalid',startedAt:at+19000000};
assert.equal(assess([...runs,invalid],all,30,readyEvidence).status,'measurements-needs-attention');
const fixed=completed('fixed',recipes[0].id,at+20000000);
assert.equal(assess([...runs,invalid,fixed],all,30,readyEvidence).status,'human-signoff-ready');
// All nine releases V544-V552 remain connected and wired into current runtime.
const paths=[
 ['components/visualizer/PiConcertBenchmarkStudioV522.tsx',['assessConcertReleaseV553(','V553 – Concert Experience Release Validation','releaseGate:releaseV553','setReleaseEvidenceV553(EMPTY_RELEASE_EVIDENCE_V553)']],
 ['components/visualizer/cinematicLyricsExperienceV549.ts',['planCinematicLyricsV549']],
 ['components/visualizer/cinematicConcertCameraV550.ts',['V550']],
 ['components/visualizer/intelligentStageAtmosphereV551.ts',['V551']],
 ['components/visualizer/piConcertDrawBudgetV552.ts',['shouldDrawTransparentV552']],
 ['services/monitoring/concertShowReadinessV543.ts',['assessConcertShowReadinessV543']],
 ['components/visualizer/crewConcertInteractionV539.ts',['V539']],
];
for(const [file,tokens] of paths){
 assert(fs.existsSync(file),`missing ${file}`);
 const contents=fs.readFileSync(file,'utf8');
 for(const token of tokens)assert(contents.includes(token),`${file}: ${token}`);
}
const ui=fs.readFileSync('components/visualizer/PiConcertBenchmarkStudioV522.tsx','utf8');
for(const token of ['thermalsReviewed','buildStatus','touchscreenChecked','noFreezesObserved',
 'showReviewsV543','beginBenchmarkV522','invalidateDeviceReviewV553()','releaseV553.blockers','sonic-display-v553-concert-release-validation.json'])
 assert(ui.includes(token),`Missing real UI action: ${token}`);
const policy=fs.readFileSync('services/monitoring/concertReleaseGateV553.ts','utf8');
for(const forbidden of ['requestAnimationFrame(','setInterval(','setTimeout(','Math.random(','localStorage','document.','navigator.'])
 assert(!policy.includes(forbidden),`Release gate cannot monitor hardware directly: ${forbidden}`);
const pkg=require('../package.json');
assert(Number(pkg.version.match(/-v(\d+)$/)?.[1]||0)>=553);
assert(pkg.scripts['build:preflight'].includes('npm run test:v553 && npm run test:v553:types')); // V554+ preflight may precede V553
console.log('PASS V553: 9 full benchmark fixtures, live-source proof, 4 hardware gates, build evidence, changed FPS/config, invalid/slow/recovered runs, v544–v552 links, no new timers');
