'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {load}=require('./helpers/ts-loader-v404.cjs');
const v=load('components/visualizer/liveStageBenchmarkProofV908');
const read=f=>fs.readFileSync(path.join(__dirname,'..',f),'utf8');
let checks=0;const test=(name,fn)=>{try{fn();checks++}catch(e){e.message=`V908 ${name}: ${e.message}`;throw e;}};
const snap=(over={})=>({available:true,playing:true,verified:true,sampleCount:31,targetFps:60,
 performanceTier:'balanced',fxActive:true,fxCost:3,counts:{crowd:3,sparks:5,shards:0,confetti:0,energyRings:0,
 foamBubbles:0,foamMist:0,kineticColumns:2,spectralWaves:0,spectralRings:0,spectralPrisms:0},
 fps:55.2,frameMs:18.1,p95FrameMs:20,pressure:.2,...over});
const cast=(n=2,over={})=>({expected:n,riggedSlots:n,skinnedMeshes:n,vertices:200*n,verified:true,missingSlots:[],...over});
const all=(n=2)=>({...cast(4),riggedSlots:n,skinnedMeshes:n,verified:n===4});
const proof=(s=snap(),c=cast())=>v.makeStageWindowProofV908(s,c,'PRIVATE_TRACK_ID_V908',2000,all(c.riggedSlots));
const run=(over={})=>({id:1,trackKey:'PRIVATE_TRACK_ID_V908',sceneIndex:2,preset:'quick',targetFps:60,tier:'balanced',samples:5,
 fpsMedian:55.2,fpsMean:55.2,frameMsMedian:18.1,p95WindowMean:20,pressureMean:.2,fpsLow:54,fpsHigh:57,sampleSpread:3,belowTargetShare:0,...over});
const session=(index=1,over={})=>({id:1,trackKey:'PRIVATE_TRACK_ID_V908',sceneIndex:2,preset:'quick',targetFps:60,tier:'balanced',
 state:'measuring',reason:'',warmup:2,frames:Array.from({length:index},(_,i)=>({trackKey:'PRIVATE_TRACK_ID_V908',sceneIndex:2,
 targetFps:60,tier:'balanced',fps:55.2,frameMs:18.1,capturedMs:1600+i*500})),lastCaptureMs:1600+index*500,result:null,...over});
const collected=(n=5,opt={})=>{let out=[];for(let i=1;i<=n;i++){
 const s=snap(opt.snapshot??{}),pr=v.makeStageWindowProofV908(s,cast(opt.castCount??2),run().trackKey,2000+i*500,all(opt.castCount??2));
 out=v.recordRunProofV908(out,session(i,{state:i===n?'ready':'measuring'}),s,pr);
 }return out;};
test('empty live proof',()=>{v.clearLiveStageProofV908();assert.equal(v.readLiveStageProofV908(snap(),'PRIVATE_TRACK_ID_V908'),null)});
test('one actual cast verified',()=>assert.equal(v.makeStageWindowProofV908(snap(),cast(1),'x',100,all(1)).verified,true));
test('two actual cast verified',()=>assert.equal(proof().verified,true));
test('three actual cast verified',()=>assert.equal(v.makeStageWindowProofV908(snap(),cast(3),'x',100,all(3)).verified,true));
test('four actual cast verified',()=>assert.equal(v.makeStageWindowProofV908(snap(),cast(4),'x',100,all(4)).verified,true));
test('extra actor fails closed',()=>assert.equal(v.makeStageWindowProofV908(snap(),cast(2),'x',100,all(3)).verified,false));
test('invisible rigged slot fails closed',()=>assert.equal(proof(snap(),cast(2,{riggedSlots:1,verified:false})).verified,false));
test('missing skinned mesh fails closed',()=>assert.equal(proof(snap(),cast(2,{skinnedMeshes:1})).verified,false));
test('missing mesh vertex fails closed',()=>assert.equal(proof(snap(),cast(2,{vertices:0})).verified,false));
test('all-slots proof required',()=>assert.equal(v.makeStageWindowProofV908(snap(),cast(2),'x',100).verified,false));
test('paused screenshot not accepted',()=>assert.equal(proof(snap({playing:false})),null));
test('unverified V826 not accepted',()=>assert.equal(proof(snap({verified:false})),null));
test('V826 unavailable not accepted',()=>assert.equal(proof(snap({available:false})),null));
test('not enough renderer frames',()=>assert.equal(proof(snap({sampleCount:1})),null));
test('empty private track fails',()=>assert.equal(v.makeStageWindowProofV908(snap(),cast(),'',100,all(2)),null));
test('invalid playback progress fails',()=>assert.equal(v.makeStageWindowProofV908(snap(),cast(),'x',NaN,all(2)),null));
test('negative playback progress fails',()=>assert.equal(v.makeStageWindowProofV908(snap(),cast(),'x',-1,all(2)),null));
test('unknown performer count fails',()=>assert.equal(v.makeStageWindowProofV908(snap(),cast(5),'x',100,all(4)),null));
test('non-finite FX cost fails',()=>assert.equal(proof(snap({fxCost:Infinity})),null));
test('FX lanes observed from nonzero counts',()=>assert.deepEqual(proof().observedFx,['crowd','particles','kinetic']));
test('FX lane not inferred from budget active alone',()=>assert.deepEqual(proof(snap({counts:{crowd:0,sparks:0,shards:0,confetti:0,energyRings:0,foamBubbles:0,foamMist:0,kineticColumns:0,spectralWaves:0,spectralRings:0,spectralPrisms:0}})).observedFx,[]));
test('multiple foam and spectral proof',()=>assert.deepEqual(proof(snap({counts:{crowd:0,sparks:0,shards:0,confetti:0,energyRings:0,foamBubbles:3,foamMist:0,kineticColumns:0,spectralWaves:2,spectralRings:0,spectralPrisms:0}})).observedFx,['foam','spectral']));
test('live store exact identity',()=>{const s=snap(),p=proof(s);v.publishLiveStageProofV908(p);assert.equal(v.readLiveStageProofV908(s,'PRIVATE_TRACK_ID_V908'),p);assert.equal(v.readLiveStageProofV908(snap(),'PRIVATE_TRACK_ID_V908'),null)});
test('live store track boundary',()=>{const s=snap();v.publishLiveStageProofV908(proof(s));assert.equal(v.readLiveStageProofV908(s,'WRONG'),null)});
test('clear resets proof',()=>{const s=snap();v.publishLiveStageProofV908(proof(s));v.clearLiveStageProofV908();assert.equal(v.readLiveStageProofV908(s,'PRIVATE_TRACK_ID_V908'),null)});
test('accepted measurement increments exactly once',()=>{const s=snap();assert.equal(v.recordRunProofV908([],session(1),s,proof(s)).length,1)});
test('warmup never counted',()=>{const s=snap();assert.equal(v.recordRunProofV908([],session(0,{state:'warmup'}),s,proof(s)).length,0)});
test('invalidated session never counted',()=>{const s=snap();assert.equal(v.recordRunProofV908([],session(1,{state:'invalid'}),s,proof(s)).length,0)});
test('missing proof recorded as invalid',()=>{const s=snap();assert.equal(v.recordRunProofV908([],session(1),s,null)[0].valid,false)});
test('stale object recorded as invalid',()=>{const s=snap();assert.equal(v.recordRunProofV908([],session(1),s,proof(snap()))[0].valid,false)});
test('other track recorded as invalid',()=>{const s=snap();assert.equal(v.recordRunProofV908([],session(1),s,proof(snap()))[0].valid,false)});
test('higher FPS mismatch fails closed',()=>{const s=snap({fps:59});assert.equal(v.recordRunProofV908([],session(1),s,proof(s))[0].valid,false)});
test('duplicate renderer notification ignored',()=>{const s=snap(),a=v.recordRunProofV908([],session(1),s,proof(s));assert.equal(v.recordRunProofV908(a,session(1),s,proof(s)).length,1)});
test('skipped frame index refuses false continuity',()=>{const s=snap();assert.equal(v.recordRunProofV908([],session(2),s,proof(s)).length,0)});
test('complete 5 windows',()=>{const a=collected();assert.equal(a.length,5);assert(a.every(w=>w.valid));assert.equal(v.finalizeRunProofV908(run(),a).verdict,'verified-visible-rigs')});
test('complete cast count',()=>assert.equal(v.finalizeRunProofV908(run(),collected()).castCount,2));
test('missing one proof is incomplete',()=>{const w=collected();w[3].valid=false;assert.equal(v.finalizeRunProofV908(run(),w).verdict,'incomplete-visibility')});
test('missing one measurement is incomplete',()=>assert.equal(v.finalizeRunProofV908(run(),collected(4)).castCount,null));
test('FX summary tracks observed lanes',()=>assert.deepEqual(v.finalizeRunProofV908(run(),collected()).fxLanes,['crowd','particles','kinetic']));
test('FX budget observations count',()=>assert.equal(v.finalizeRunProofV908(run(),collected()).fxActiveWindows,5));
test('FX cost real mean',()=>assert.equal(v.finalizeRunProofV908(run(),collected()).fxCostMean,3));
test('mixed cast count prevents verified',()=>{const w=collected();w[4].expected=3;assert.equal(v.finalizeRunProofV908(run(),w).verdict,'incomplete-visibility')});
test('no proof gives unavailable',()=>assert.equal(v.finalizeRunProofV908(run(),[]).verdict,'not-observed'));
test('duplicate history guarded',()=>{const a=v.finalizeRunProofV908(run(),collected());assert.equal(v.recordVerifiedRunV908([a],a).length,1)});
test('history bounded',()=>{let a=[];for(let i=1;i<27;i++)a=v.recordVerifiedRunV908(a,{...v.finalizeRunProofV908(run(),collected()),runId:i});assert.equal(a.length,18)});
test('only V905 completed run retained',()=>{const p=v.finalizeRunProofV908(run(),collected());assert.equal(v.getVerifiedRunsV908([p],[run()]).length,1);assert.equal(v.getVerifiedRunsV908([p],[]).length,0)});
test('changed private track filtered',()=>{const p=v.finalizeRunProofV908(run(),collected());assert.equal(v.getVerifiedRunsV908([p],[run({trackKey:'other'})]).length,0)});
test('changed target filtered',()=>{const p=v.finalizeRunProofV908(run(),collected());assert.equal(v.getVerifiedRunsV908([p],[run({targetFps:30})]).length,0)});
test('JSON strips private track',()=>{const j=v.exportVerifiedRunsV908([v.finalizeRunProofV908(run(),collected())]);assert(!j.includes('PRIVATE_TRACK_ID_V908'));assert(!j.includes('trackKey'))});
test('JSON strips original run ID and position',()=>{const j=v.exportVerifiedRunsV908([v.finalizeRunProofV908(run({id:83741}),collected())]);assert(!j.includes('83741'));assert(!j.includes('progressMs'));assert(!j.includes('capturedMs'))});
test('JSON disclaimer glb provenance',()=>assert(v.exportVerifiedRunsV908([]).includes('GLB file origin')));
test('JSON no GPU claim',()=>assert(v.exportVerifiedRunsV908([]).includes('GPU timer')));
test('no fake FX preset classification',()=>assert(!/DeclaredEffectsV907|effects:'full'|effects:'standard'/.test(read('components/visualizer/liveStageBenchmarkProofV908.ts'))));
test('single V826 store subscription kept',()=>assert(!read('components/visualizer/LiveStageBenchmarkVerificationPanelV908.tsx').includes('subscribeConcertQualityV826')));
test('no new RAF or Three mesh',()=>assert(!/useFrame|requestAnimationFrame|setInterval|<mesh|<Canvas/.test(read('components/visualizer/LiveStageBenchmarkVerificationPanelV908.tsx'))));
test('same V826 source published before UI telemetry',()=>{const t=read('components/visualizer/DynamicStage.tsx');assert(t.indexOf('publishLiveStageProofV908(makeStageWindowProofV908')<t.indexOf('publishConcertQualityV826(snapshot)'))});
test('actual scene cast used',()=>assert(read('components/visualizer/DynamicStage.tsx').includes('inspectVisibleCastV830(state.scene,groupCountV542)')));
test('extra actor proof covered',()=>assert(read('components/visualizer/DynamicStage.tsx').includes('inspectVisibleCastV830(state.scene,4)')));
test('renderer unmount drops proof',()=>assert(read('components/visualizer/DynamicStage.tsx').includes('clearLiveStageProofV908()')));
test('benchmarks record only accepted frames',()=>assert(read('components/visualizer/GuidedConcertBenchmarkPanelV905.tsx').includes('recordRunProofV908(measuredProofV908.current,session,renderer')));
test('no double V826 subscriber',()=>assert(!read('components/visualizer/GuidedConcertBenchmarkPanelV905.tsx').includes('subscribeConcertQualityV826')));
test('clear all session evidence',()=>assert(read('components/visualizer/GuidedConcertBenchmarkPanelV905.tsx').includes('setVerifiedHistoryV908([])')));
test('V908 view wired',()=>assert(read('components/visualizer/GuidedConcertBenchmarkPanelV905.tsx').includes('<LiveStageBenchmarkVerificationPanelV908 history={history} proofs={verifiedHistoryV908}/>')));
test('package + lock consistent',()=>{const p=JSON.parse(read('package.json')),l=JSON.parse(read('package-lock.json'));assert.ok(/^0\.1\.0-v\d+$/.test(p.version) && Number(p.version.split('-v')[1]) >= 908);assert.equal(l.version,p.version);assert.equal(l.packages[''].version,p.version)});
test('CI and windows wired',()=>{const p=JSON.parse(read('package.json'));assert(p.scripts['verify:v908:focused'].includes('verify:v907:focused'));assert(p.scripts.prebuild.startsWith('npm run test:v908'));assert(read('.github/workflows/v832-continuous-validation.yml').includes('test:v908'));assert(read('scripts/verify-v908-windows.ps1').includes('verify:v908:focused'))});
test('architecture and docs',()=>{assert(read('README.md').startsWith('## V908'));assert(read('ARCHITECTURE.md').includes('Dokumentationsstand:** V908'));assert(read('V908-LIVE-AVATAR-FX-VERIFICATION-README.md').includes('SkinnedMesh'))});
for(let i=0;i<500;i++)test(`real scene rigged proof sweep ${i}`,()=>{
 const n=[1,2,3,4][i%4],s=snap({fxCost:i%50}),p=v.makeStageWindowProofV908(s,cast(n),'LOCAL_'+i,1000+i,all(n));
 assert.equal(p.verified,true);assert.equal(p.riggedSlots,n);assert.equal(v.readLiveStageProofV908(s,'DIFFERENT'),null);
});
for(let i=0;i<400;i++)test(`unknown scene evidence fail-closed sweep ${i}`,()=>{
 const n=[2,3,4][i%3],s=snap(),c=cast(n),allCount=i%2?n-1:n+1;
 const p=v.makeStageWindowProofV908(s,c,'PRIVATE_'+i,2000,all(allCount));
 assert.equal(p.verified,false);assert.equal(v.recordRunProofV908([],session(1,{trackKey:'PRIVATE_'+i}),s,p)[0].valid,false);
});
console.log(`V908 Live Avatar & FX Benchmark Verification: PASS ${checks} checks (scene cast, exact V826 window, FX observation, privacy, coverage)`);
