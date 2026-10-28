'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs');
const {load}=require('./helpers/ts-loader-v404.cjs');
const {inspectConcertQualityV627:inspect,parseVisualAdviceV627:parse,
 exportConcertQualityV627:exportReport}=load('services/monitoring/automatedConcertQualityInspectorV627');
const {beginBenchmarkV522:begin,advanceBenchmarkV522:advance,benchmarkRecipeV522:recipe}=load('services/monitoring/concertBenchmarkValidationV522');
const SCENES=['deutschrap-feature','hardstyle-drop','long-concert'];
const T=1760000000000;
const features={lyrics:true,lipSync:true,reactiveLighting:true};
const base=(at,patch={})=>({at,fps:48,p95FrameMs:24,p99FrameMs:31,slowPercent:4,drawCalls:190,
 triangles:126000,avatarCount:4,tier:'balanced',dpr:1,piProfile:'balanced',piLevel:'medium',
 features,heapMb:160,geometries:80,textures:44,renderWidthPx:1280,renderHeightPx:800,...patch});
function run(scene,n,patch={}){
 const start=T+(SCENES.indexOf(scene)*100+n)*500000;
 let b=begin(`${scene}-${n}`,scene,30,base(start,patch),start+100);assert(b);
 for(let t=1;t<=recipe(scene).warmupSeconds+recipe(scene).measurementSeconds+2;t++){
  b=advance(b,base(start+t*1000,{...patch,heapMb:160+t*.1}));
  if(b.status!=='running')break;
 }
 assert.equal(b.status,'complete');return b;
}
const all=SCENES.flatMap(scene=>[0,1,2].map(n=>run(scene,n)));
const visualChecks={lyricsLegible:true,lipSyncPlausible:true,motionNatural:true,lightReadable:true};
const reviewed=Object.fromEntries(SCENES.map(s=>[s,visualChecks]));
let count=0;function test(label,fn){try{fn();count++;}catch(e){console.error('V627 FAILED:',label);throw e;}}
const hint=(changes={})=>({format:'sonic-v593-concert-advice',status:'advice-needs-human-review',
 source:'v592-live-report',sourceScreenshotCount:4,humanReviewRequired:true,autoApplied:false,
 recommendations:[{id:'camera-clipping',area:'Kamera',priority:'high',reason:'Wiederholtes Cropping',action:'Framing manuell prüfen',
  status:'suggested-not-applied',evidence:{capturedFrames:3,totalFrames:4,screenshotIndices:[1,2,3]}}],...changes});
test('No data yields missing and zero fabricated review progress',()=>{const r=inspect([],{},30);assert.equal(r.status,'measurements-missing');assert.equal(r.scenesMeasured,0);assert.equal(r.scenesManuallyReviewed,0);assert.equal(r.automaticApproval,false);});
test('Missing three repeat runs per scene is clearly flagged',()=>{const r=inspect(all.slice(0,2),{},30);assert.equal(r.scenesWithThreeMatchingRuns,0);assert(r.findings.some(f=>f.id==='missing-deutschrap-feature'));});
test('Three complete matching scenes have measured coverage, never full song',()=>{const r=inspect(all,{},30);assert.equal(r.scenesWithThreeMatchingRuns,3);assert.equal(r.status,'human-review-needed');assert.equal(r.inspectionScope,'selected-benchmark-scenes-not-full-song');assert(r.limitations.some(v=>v.includes('gesamten Songs')));});
test('All human checks must be explicitly given',()=>{const r=inspect(all,reviewed,30);assert.equal(r.scenesManuallyReviewed,3);assert.equal(r.status,'reviewed-locally');assert.equal(r.automaticApproval,false);assert(r.findings.some(f=>f.id==='missing-v593'));});
test('Partial human review cannot be converted to visual pass',()=>{const reviews={...reviewed,'long-concert':{...visualChecks,motionNatural:false}};const r=inspect(all,reviews,30);assert.equal(r.scenesManuallyReviewed,2);assert.equal(r.status,'human-review-needed');assert(r.findings.some(f=>f.id==='human-long-concert'));});
test('Other FPS target never receives previous pass',()=>{const r=inspect(all,reviewed,60);assert.equal(r.scenesWithThreeMatchingRuns,0);assert.equal(r.status,'measurements-missing');});
test('Slow repeated performance produces high severity and actionable text',()=>{const slow=run('deutschrap-feature',2,{fps:20,p95FrameMs:65,p99FrameMs:75,slowPercent:30});const r=inspect([...all.slice(0,2),slow,...all.slice(3)],reviewed,30);assert.equal(r.status,'attention-needed');assert(r.findings.some(f=>f.id==='slow-deutschrap-feature'&&f.severity==='high'));});
test('A newer invalid run cannot be disguised by three previously green runs',()=>{
 const invalid={...all[0],id:'broken-newer',startedAt:all[0].startedAt+9999999,
  status:'invalid',reason:'Konfiguration gewechselt'};
 const r=inspect([...all,invalid],reviewed,30);
 assert.equal(r.status,'attention-needed');
 assert(r.findings.some(f=>f.id==='invalid-deutschrap-feature'&&f.severity==='high'));
});
test('Only one matching profile is not mixed into provisional FPS',()=>{const altered=run('deutschrap-feature',2,{renderWidthPx:800,renderHeightPx:600});const r=inspect([...all.slice(0,2),altered,...all.slice(3)],reviewed,30);assert(r.findings.some(f=>f.id==='missing-deutschrap-feature'));assert.equal(r.sceneEvidence[0].repetitions,1);});
test('Missing P99 never silently passes as full evidence',()=>{const runs=all.map(r=>r.scene!=='long-concert'?r:{...r,p99Windows:0,worstP99Ms:null});const r=inspect(runs,reviewed,30);assert(r.findings.some(f=>f.id==='p99-long-concert'));});
test('Measured stutters are reported only with matching completed windows',()=>{const spike=run('hardstyle-drop',1,{fps:35,slowPercent:31});const runs=[...all.slice(0,4),spike,...all.slice(5)];const r=inspect(runs,reviewed,30);assert(r.findings.some(f=>f.id==='stutters-hardstyle-drop'));});
test('Strict V593 happy path',()=>{const value=parse(hint());assert(value);assert.equal(value.sourceScreenshotCount,4);assert.equal(value.recommendations[0].priority,'high');});
test('V593 image warnings appear with distinct evidence and no automatic fix',()=>{const r=inspect(all,reviewed,30,parse(hint()));assert.equal(r.visualFramesImported,4);assert.equal(r.status,'attention-needed');assert(r.findings.some(f=>f.id==='visual-camera-clipping'&&f.evidence==='imported-image-heuristic'));assert.equal(r.automaticApproval,false);});
test('V593 with no recommendations is not an automatic good visual rating',()=>{const r=inspect(all,{},30,parse(hint({recommendations:[]})));assert.equal(r.status,'human-review-needed');assert.equal(r.scenesManuallyReviewed,0);});
test('Reject synthetic / blocked / unauthenticated envelope',()=>{for(const x of [null,{},hint({status:'blocked'}),hint({source:'synthetic'}),hint({autoApplied:true}),hint({humanReviewRequired:false}),hint({format:'sonic-v592-live-concert-review'}),hint({sourceScreenshotCount:1}),hint({sourceScreenshotCount:999999}),hint({recommendations:null})])assert.equal(parse(x),null);});
test('Reject malformed, duplicate or injected finding identifiers',()=>{for(const item of [{id:'a'.repeat(65)},{id:'<script>alert(1)</script>'},{id:'__proto__'},{priority:'critical'},{reason:''},{action:'x'.repeat(701)},{evidence:{capturedFrames:0,totalFrames:4}},{evidence:{capturedFrames:6,totalFrames:4}},{status:'applied'}]){const v=hint();v.recommendations[0]={...v.recommendations[0],...item};assert.equal(parse(v),null);}const v=hint();v.recommendations.push({...v.recommendations[0]});assert.equal(parse(v),null);});
test('Reject guessed missing source frame evidence',()=>{for(const total of [3,5,-1,2.5]){const v=hint();v.recommendations[0].evidence.totalFrames=total;assert.equal(parse(v),null);}});
test('Only bounded number of findings from import',()=>{const v=hint();v.recommendations=Array.from({length:31},(_,i)=>({...v.recommendations[0],id:`warning-${i}`}));assert.equal(parse(v),null);});
test('Low priority images stay informational',()=>{const v=hint();v.recommendations[0].priority='low';const r=inspect(all,reviewed,30,parse(v));assert(r.findings.some(f=>f.id==='visual-camera-clipping'&&f.severity==='info'));});
test('High severity always precedes missing/manual evidence',()=>{const r=inspect([],{},30,parse(hint()));assert.equal(r.findings[0].severity,'high');});
test('Exports contain observed measurements and honest limitations',()=>{const r=inspect(all,reviewed,30);const exportObject=exportReport(r,'Windows Chrome 1280x800');assert.equal(exportObject.report.version,'V627');assert.equal(exportObject.report.automaticApproval,false);assert(exportObject.provenance.includes('V518/V522'));assert(!JSON.stringify(exportObject).includes('Raspberry Pi certified'));});
test('Exports bound operator notes to avoid oversized files',()=>{const e=exportReport(inspect([],{},30),'X'.repeat(10000));assert.equal(e.operatorNote.length,2000);});
test('V627 remains pure, adds no render/quality mutators',()=>{const s=fs.readFileSync('services/monitoring/automatedConcertQualityInspectorV627.ts','utf8');for(const token of ['requestAnimationFrame(', 'useFrame(', 'setInterval(', 'fetch(', 'new WebGLRenderer(', 'localStorage.', 'writeSettings('])assert(!s.includes(token));});
test('Wired into the existing real V522 run history and manual reviews',()=>{const s=fs.readFileSync('components/visualizer/PiConcertBenchmarkStudioV522.tsx','utf8');assert(s.includes('inspectConcertQualityV627(history,showReviewsV543,target,visualAdviceV627)'));assert(s.includes('parseVisualAdviceV627(JSON.parse(await file.text()))'));assert(s.includes('exportConcertQualityV627(inspectionV627'));assert(s.includes('V627 – Automated Concert Quality Inspector'));});
test('Synthetic stress remains read-only, bounded, never autoverifies visuals',()=>{for(let i=0;i<3000;i++){const subset=all.slice(0,i%10);const r=inspect(subset,{},30,i%2?null:parse(hint()));assert.equal(r.automaticApproval,false);assert(r.findings.length<=32);assert(r.scenesManuallyReviewed===0);}});
console.log(`PASS V627 Automated Concert Quality Inspector: ${count} groups / 3000 stress scenarios`);
