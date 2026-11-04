'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {load}=require('./helpers/ts-loader-v404.cjs');
const r=load('components/visualizer/concertQualityReviewV903');
const t=load('components/visualizer/concertQualityTelemetryV826');
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
let n=0;
const check=(name,fn)=>{try{fn();n++}catch(e){e.message=`V903 ${name}: ${e.message}`;throw e}};
const context=(patch={})=>({trackKey:'nonpublic-playback-1',sceneIndex:2,mode:'active',playing:true,...patch});
const controls=(patch={})=>({ultimate:{enabled:true,intensity:65,protectLyrics:true},camera:{enabled:true,intensity:55,protectLyrics:true},
 dance:{enabled:true,intensity:55,protectFootwork:true},laser:{enabled:true,intensity:70},
 particles:{enabled:true,intensity:75},spotlights:{enabled:true,intensity:70},...patch});
const particle={target:'particles',field:'intensity',before:75,value:55};
const safe={target:'ultimate',field:'protectLyrics',before:false,value:true};
const sample=(patch={})=>({...t.EMPTY_QUALITY_SNAPSHOT_V826,available:true,playing:true,targetFps:60,
 performanceTier:'high',sampleCount:33,fps:48,frameMs:20.8,p95FrameMs:29,pressure:.84,...patch});
const frame=(ts=1_000,patch={})=>r.reviewFrameV903(sample(patch),context(),ts);
const historical=(patch={})=>Array.from({length:4},(_,i)=>frame(1000+i*600,patch));
const start=(p=particle,cfg=controls(),ctx=context(),history=historical())=>r.beginConcertReviewV903(history,ctx,p,cfg,3300,1);
const applied=()=>controls({particles:{enabled:true,intensity:55}});
const ready=(after=sample({fps:53,frameMs:18.9,p95FrameMs:24,pressure:.65}))=>{
 let session=start();session=r.syncConcertReviewV903(session,context(),applied());
 for(let i=0;i<5;i++)session=r.advanceConcertReviewV903(session,context(),applied(),r.reviewFrameV903(after,context(),3400+i*600));
 return session;
};
check('constants documented',()=>{assert.equal(r.MIN_REVIEW_FRAMES_V903,3);assert.equal(r.REVIEW_SETTLE_FRAMES_V903,2);assert(r.REVIEW_FRESH_MS_V903>=4000)});
check('valid patch',()=>assert(r.validReviewPatchV903(particle)));
check('protective patch',()=>assert(r.validReviewPatchV903(safe)));
check('tampered target rejected',()=>assert(!r.validReviewPatchV903({...particle,target:'power'})));
check('tampered field rejected',()=>assert(!r.validReviewPatchV903({...particle,field:'enabled'})));
check('manual intensity increase rejected',()=>assert(!r.validReviewPatchV903({...particle,value:88})));
check('dance intensity cannot be requested by V902',()=>assert(!r.validReviewPatchV903({...particle,target:'dance'})));
check('boolean off not regular advice',()=>assert(!r.validReviewPatchV903({...safe,value:false})));
check('footwork only for dance',()=>assert(!r.validReviewPatchV903({...safe,field:'protectFootwork'})));
check('before exactly current',()=>assert.equal(r.reviewControlValueV903(controls(),particle),75));
check('disabled yields unavailable value',()=>assert.equal(r.reviewControlValueV903(controls({particles:{enabled:false,intensity:75}}),particle),undefined));
check('valid frame accepted',()=>assert.equal(frame().fps,48));
check('baseline average exact',()=>{const w=r.reviewWindowV903(historical());assert.equal(w.samples,4);assert.equal(w.fps,48);assert.equal(w.frameMs,20.8)});
check('three windows sufficient',()=>assert.equal(r.reviewWindowV903(historical().slice(1)).samples,3));
check('two windows insufficient',()=>assert.equal(r.reviewWindowV903(historical().slice(2)),null));
check('duplicate timestamp cannot form baseline',()=>assert.equal(r.reviewWindowV903(historical().map(f=>({...f,capturedMs:1000}))),null));
check('mixed tier rejected',()=>assert.equal(r.reviewWindowV903(historical().map((f,i)=>i?f:{...f,tier:'balanced'})),null));
check('mixed song rejected',()=>assert.equal(r.reviewWindowV903(historical().map((f,i)=>i?f:{...f,trackKey:'other'})),null));
check('mixed scene rejected',()=>assert.equal(r.reviewWindowV903(historical().map((f,i)=>i?f:{...f,sceneIndex:3})),null));
check('mixed FPS target rejected',()=>assert.equal(r.reviewWindowV903(historical().map((f,i)=>i?f:{...f,targetFps:30})),null));
check('disabled performance rejected',()=>assert.equal(r.reviewFrameV903(sample({available:false}),context(),10),null));
check('paused performance rejected',()=>assert.equal(r.reviewFrameV903(sample({playing:false}),context(),10),null));
check('paused context rejected',()=>assert.equal(r.reviewFrameV903(sample(),context({playing:false}),10),null));
check('no verified scene rejected',()=>assert.equal(r.reviewFrameV903(sample(),context({mode:'no-evidence'}),10),null));
check('negative scene rejected',()=>assert.equal(r.reviewFrameV903(sample(),context({sceneIndex:-1}),10),null));
check('missing track rejected',()=>assert.equal(r.reviewFrameV903(sample(),context({trackKey:''}),10),null));
check('missing telemetry rejected',()=>assert.equal(r.reviewFrameV903(null,context(),10),null));
check('frame counter must exist',()=>assert.equal(r.reviewFrameV903(sample({sampleCount:0}),context(),10),null));
check('target FPS must be supported',()=>assert.equal(r.reviewFrameV903(sample({targetFps:120}),context(),10),null));
check('tier must be supported',()=>assert.equal(r.reviewFrameV903(sample({performanceTier:'rocket'}),context(),10),null));
check('invalid clock rejected',()=>assert.equal(r.reviewFrameV903(sample(),context(),NaN),null));
check('baseline captured before click',()=>assert.equal(start().before.samples,4));
check('no mutated config',()=>{const cfg=controls(),saved=JSON.stringify(cfg);start(particle,cfg);assert.equal(JSON.stringify(cfg),saved)});
check('no baseline warns not invent',()=>assert.equal(start(particle,controls(),context(),[]).before,null));
check('inactive context cannot start review',()=>assert.equal(start(particle,controls(),context({mode:'disabled'})),null));
check('paused context cannot start review',()=>assert.equal(start(particle,controls(),context({playing:false})),null));
check('stale settings cannot start review',()=>assert.equal(start(particle,applied()),null));
check('disabled cannot start review',()=>assert.equal(start(particle,controls({particles:{enabled:false,intensity:75}})),null));
check('old baseline excluded',()=>assert.equal(start(particle,controls(),context(),historical().map(f=>({...f,capturedMs:100}))).before,null));
check('wrong track baseline excluded',()=>assert.equal(start(particle,controls(),context(),historical().map(f=>({...f,trackKey:'other'}))).before,null));
check('awaiting until setting really changes',()=>assert.equal(r.syncConcertReviewV903(start(),context(),controls()).state,'awaiting-change'));
check('six frames without accepted setting invalidate',()=>{let s=start();for(let i=0;i<6;i++)s=r.advanceConcertReviewV903(s,context(),controls(),frame(3400+i*600));assert.equal(s.state,'invalid');assert.match(s.reason,/nicht bestätigt/)});
check('missing new frames invalidate after confirmation',()=>{let s=r.syncConcertReviewV903(start(),context(),applied());s=r.advanceConcertReviewV903(s,context(),applied(),null);assert.equal(s.state,'invalid')});
check('confirmed setting begins sampling',()=>assert.equal(r.syncConcertReviewV903(start(),context(),applied()).state,'sampling'));
check('can only undo after actual commit',()=>assert(!r.canRestoreConcertReviewV903(start(),controls())));
check('unknown change marks invalid',()=>assert.equal(r.syncConcertReviewV903(start(),context(),controls({particles:{enabled:true,intensity:57}})).state,'invalid'));
check('scene change marks invalid',()=>assert.equal(r.syncConcertReviewV903(start(),context({sceneIndex:4}),controls()).state,'invalid'));
check('song change marks invalid',()=>assert.equal(r.syncConcertReviewV903(start(),context({trackKey:'new'}),controls()).state,'invalid'));
check('paused invalidates comparison',()=>assert.equal(r.syncConcertReviewV903(start(),context({playing:false}),controls()).state,'invalid'));
check('no baseline -> unavailable after commit',()=>assert.equal(r.syncConcertReviewV903(start(particle,controls(),context(),[]),context(),applied()).state,'unavailable'));
check('no immediate post sample',()=>assert.equal(r.syncConcertReviewV903(start(),context(),applied()).after,null));
check('first two snapshots warm-up discarded',()=>{let x=r.syncConcertReviewV903(start(),context(),applied());for(let i=0;i<2;i++)x=r.advanceConcertReviewV903(x,context(),applied(),frame(3400+i*600));assert.equal(x.settled,2);assert.equal(x.collected.length,0);});
check('third sample begins real measurement',()=>{let x=r.syncConcertReviewV903(start(),context(),applied());for(let i=0;i<3;i++)x=r.advanceConcertReviewV903(x,context(),applied(),frame(3400+i*600));assert.equal(x.collected.length,1);assert.equal(x.after,null)});
check('after 3 new frames report ready',()=>{const x=ready();assert.equal(x.state,'ready');assert.equal(x.after.samples,3);assert.equal(x.before.samples,4)});
check('means reflect actual measurements',()=>{const x=ready();assert.equal(x.after.fps,53);assert.equal(x.after.frameMs,18.9);assert.equal(x.before.fps,48)});
check('delta reports observation not forecast',()=>assert.equal(r.reviewDeltaV903(ready()).fps,5));
check('undo available on exact value',()=>assert(r.canRestoreConcertReviewV903(ready(),applied())));
check('stale undo blocked',()=>assert(!r.canRestoreConcertReviewV903(ready(),controls({particles:{enabled:true,intensity:54}}))));
check('disabled undo blocked',()=>assert(!r.canRestoreConcertReviewV903(ready(),controls({particles:{enabled:false,intensity:55}}))));
check('undo patch inverse exact',()=>assert.deepEqual(r.restorePatchV903(ready(),applied()),{target:'particles',field:'intensity',before:55,value:75}));
check('undo first requires explicit request',()=>assert.equal(ready().state,'ready'));
check('user opens rollback confirmation',()=>assert.equal(r.markReviewRestoringV903(ready(),applied()).state,'restoring'));
check('restoration pending until state changed',()=>assert.equal(r.completeReviewRestoreV903(r.markReviewRestoringV903(ready(),applied()),applied()).state,'restoring'));
check('restored state confirmed by React value',()=>assert.equal(r.completeReviewRestoreV903(r.markReviewRestoringV903(ready(),applied()),controls()).state,'restored'));
check('restored cannot undo twice',()=>assert(!r.canRestoreConcertReviewV903(r.completeReviewRestoreV903(r.markReviewRestoringV903(ready(),applied()),controls()),controls())));
check('rollback conflict blocks',()=>assert.equal(r.completeReviewRestoreV903(r.markReviewRestoringV903(ready(),applied()),controls({particles:{enabled:true,intensity:64}})).state,'invalid'));
check('stale after during sampling invalidates',()=>assert.equal(r.advanceConcertReviewV903(r.syncConcertReviewV903(start(),context(),applied()),context(),controls({particles:{enabled:true,intensity:49}}),frame(3500)).state,'invalid'));
check('other tier invalidates',()=>assert.equal(r.advanceConcertReviewV903(r.syncConcertReviewV903(start(),context(),applied()),context(),applied(),frame(3500,{performanceTier:'low'})).state,'invalid'));
check('FPS target change invalidates',()=>assert.equal(r.advanceConcertReviewV903(r.syncConcertReviewV903(start(),context(),applied()),context(),applied(),frame(3500,{targetFps:30})).state,'invalid'));
check('song change invalidates on new frames',()=>assert.equal(r.advanceConcertReviewV903(r.syncConcertReviewV903(start(),context(),applied()),context({trackKey:'new'}),applied(),frame(3500)).state,'invalid'));
check('seek invalidates even inside the same scene',()=>assert.equal(r.invalidateConcertReviewV903(ready(),'Seek').state,'invalid'));
check('seek does not erase verified rollback option',()=>assert(r.canRestoreConcertReviewV903(r.invalidateConcertReviewV903(ready(),'Seek'),applied())));
check('seek detection is wired to playback position',()=>assert(read('components/visualizer/ConcertQualityIntelligencePanelV901.tsx').includes('previousPlayback.current')));
check('invalid comparison has no computed delta',()=>{const x=r.syncConcertReviewV903(ready(),context({sceneIndex:5}),applied());assert.equal(x.state,'invalid');assert.equal(r.reviewDeltaV903(x),null)});
check('JSON excludes playback identifier',()=>{const json=r.exportConcertReviewV903(ready());assert(!json.includes('nonpublic-playback-1'));assert(!json.includes('trackKey'))});
check('JSON schema and no guarantee',()=>{const o=JSON.parse(r.exportConcertReviewV903(ready()));assert.equal(o.schema,'sonic-concert-quality-review-v903');assert.match(o.caveat,/not proof|observational/);assert.equal(o.review.after.samples,3)});
check('no background timer',()=>{const src=read('components/visualizer/concertQualityReviewV903.ts');assert(!/setInterval|setTimeout|requestAnimationFrame|fetch\(/.test(src))});
check('UI uses exact existing V826 subscription',()=>{const src=read('components/visualizer/ConcertQualityIntelligencePanelV901.tsx');assert(src.includes('useSyncExternalStore(subscribeConcertQualityV826'));assert(src.includes('lastV826.current===renderer'));assert(src.includes('beginConcertReviewV903'));assert(src.includes('advanceConcertReviewV903'));assert(src.includes('onRestoreAdvice'))});
check('UI two click rollback',()=>{const src=read('components/visualizer/ConcertQualityReviewPanelV903.tsx');assert(src.includes('Rücksetzen prüfen'));assert(src.includes('Jetzt ausdrücklich zurücksetzen'));assert(src.includes('canRestoreConcertReviewV903'))});
check('React state owner validates restore exact equality',()=>{const src=read('components/visualizer/LiveFxDeckV881.tsx');assert(src.includes('restoreAdvisorV903'));assert(src.includes('validReviewPatchV903'));assert(src.includes('s.intensity===before'));assert(src.includes('s.enabled&&'))});
check('V902 confirmation still two-stage',()=>{const src=read('components/visualizer/ConcertQualityAdvisorPanelV902.tsx');assert(src.includes('Vorschau anzeigen'));assert(src.includes('Diese Änderung bestätigen'))});
check('no extra GPU resources',()=>{const src=read('components/visualizer/ConcertQualityReviewPanelV903.tsx');assert(!/useFrame|Canvas|instancedMesh|<mesh/.test(src))});
check('version match',()=>{const pkg=JSON.parse(read('package.json')),lock=JSON.parse(read('package-lock.json'));assert.match(pkg.version,/^0\.1\.0-v(?:903|904|905|906|907|908)$/);assert.equal(lock.version,pkg.version);assert.equal(lock.packages[''].version,pkg.version)});
check('version scripts registered',()=>{const p=JSON.parse(read('package.json'));assert(p.scripts['verify:v903:focused'].includes('verify:v902:focused'));assert(((p.scripts.prebuild.startsWith('npm run test:v908')||p.scripts.prebuild.startsWith('npm run test:v905'))||(p.scripts.prebuild.startsWith('npm run test:v908')||p.scripts.prebuild.startsWith('npm run test:v907'))||(p.scripts.prebuild.startsWith('npm run test:v908')||p.scripts.prebuild.startsWith('npm run test:v906')))||p.scripts.prebuild.startsWith('npm run test:v904')||p.scripts.prebuild.startsWith('npm run test:v903'))});
check('CI and Windows registered',()=>{assert(read('.github/workflows/v832-continuous-validation.yml').includes('test:v903'));assert(read('scripts/verify-v903-windows.ps1').includes('verify:v903:focused'))});
check('docs and architecture',()=>{assert(read('README.md').includes('V903'));assert(read('ARCHITECTURE.md').includes('Dokumentationsstand:** V908'));assert(read('V903-VERIFICATION.md').includes('zustand'))});
// Every legitimate V902 target has an independently reversible exact-value patch.
for(const [name,p,initial,changed] of [
 ['laser',{target:'laser',field:'intensity',before:70,value:55},controls(),controls({laser:{enabled:true,intensity:55}})],
 ['spotlights',{target:'spotlights',field:'intensity',before:70,value:60},controls(),controls({spotlights:{enabled:true,intensity:60}})],
 ['camera',{target:'camera',field:'intensity',before:55,value:45},controls(),controls({camera:{enabled:true,intensity:45,protectLyrics:true}})],
 ['ultimate',{target:'ultimate',field:'protectLyrics',before:false,value:true},controls({ultimate:{enabled:true,intensity:65,protectLyrics:false}}),controls()],
 ['dance',{target:'dance',field:'protectFootwork',before:false,value:true},controls({dance:{enabled:true,intensity:55,protectFootwork:false}}),controls()]
])check(`explicit rollback target ${name}`,()=>{
 const session=r.beginConcertReviewV903(historical(),context(),p,initial,3300,20);
 assert(session);const accepted=r.syncConcertReviewV903(session,context(),changed);
 assert.equal(accepted.state,'sampling');const undo=r.restorePatchV903(accepted,changed);
 assert.deepEqual(undo,{target:p.target,field:p.field,before:p.value,value:p.before});
 assert.equal(r.completeReviewRestoreV903(r.markReviewRestoringV903(accepted,changed),initial).state,'restored');
});
// Stress tests: unique windows and safe rollback with arbitrary but valid V902 values.
for(let intensity=1;intensity<=100;intensity++){
 check(`valid numeric rollback sweep ${intensity}`,()=>{
  const before=intensity,after=intensity-1,p={...particle,before,value:after};
  const original=controls({particles:{enabled:true,intensity:before}}),changed=controls({particles:{enabled:true,intensity:after}});
  const sess=r.beginConcertReviewV903(historical(),context(),p,original,3300,intensity);
  assert(sess);const running=r.syncConcertReviewV903(sess,context(),changed);
  assert.equal(running.state,'sampling');assert.deepEqual(r.restorePatchV903(running,changed),{target:'particles',field:'intensity',before:after,value:before});
 });
}
for(let i=0;i<900;i++){
 check(`measured-frame sweep ${i}`,()=>{
  const f=sample({fps:22+i/20,frameMs:12+i/100,p95FrameMs:24+i/40,pressure:(i%100)/100});
  const snap=r.reviewFrameV903(f,context(),i*600+4000);
  assert(snap);const w=r.reviewWindowV903([snap,{...snap,capturedMs:snap.capturedMs+500},{...snap,capturedMs:snap.capturedMs+1000}]);
  assert(w);assert(w.fps>0&&w.frameMs>0&&w.pressure>=0&&w.pressure<=1);
 });
}
console.log(`V903 Concert Quality Before/After Review: PASS ${n} checks, rollback and real-V826-window guards`);
