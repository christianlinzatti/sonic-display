'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs');
const {load}=require('./helpers/ts-loader-v404.cjs');
const {beginBenchmarkV522:begin,advanceBenchmarkV522:advance,benchmarkResultV522:result}=load('services/monitoring/concertBenchmarkValidationV522');
const {studioConfigurationV518:configuration,validStudioReadingV518:valid}=load('services/monitoring/piConcertPerformanceStudioV518');
const {planDeviceBaselineV626:plan,latestBaselineProfileV626:latest,deviceProfileV626:profile,
 renderSizeV626:size,exportDeviceReportV626:exportReport}=load('services/monitoring/hardwareSizingBenchmarkV626');
const T=1730000000000;
const base=(at=T,patch={})=>({at,fps:52,p95FrameMs:21,p99FrameMs:25,slowPercent:2,drawCalls:220,
 triangles:150000,avatarCount:2,tier:'balanced',dpr:1.25,piProfile:'balanced',piLevel:'medium',
 features:{lyrics:true,lipSync:true,reactiveLighting:true},heapMb:155,geometries:44,textures:38,
 renderWidthPx:1280,renderHeightPx:800,...patch});
let groups=0;function test(name,fn){try{fn();groups++}catch(e){console.error('FAILED '+name);throw e;}}
function run(avatars=2,number=0,patch={}){
 const start=T+number*60000+avatars*600000;
 const fps=avatars===2?52:avatars===3?47:40;
 const first=base(start,{avatarCount:avatars,fps,...patch});
 let state=begin(`${avatars}-${number}`, 'deutschrap-feature',30,first,start+100);
 assert(state);for(let n=1;n<=35;n++){
  state=advance(state,base(start+n*1000,{avatarCount:avatars,fps,heapMb:155+n*.3,...patch}));
  if(state.status!=='running')break;
 }
 assert.equal(state.status,'complete');return state;
}
const runs=([2,3,4]).flatMap(a=>[0,1,2].map(n=>run(a,n)));
const expectedProfile=profile(runs[0].configuration);
test('V626 captures actual WebGL buffer dimensions',()=>{assert.equal(configuration(base()),'2|balanced|1.25|balanced|medium|111|1280x800');assert.deepEqual(size(configuration(base())),{width:1280,height:800});});
test('Legacy V518 fixtures retain their old configuration',()=>{const {renderWidthPx,renderHeightPx,...legacy}=base();assert.equal(configuration(legacy),'2|balanced|1.25|balanced|medium|111');assert.equal(profile(configuration(legacy)),null);});
test('Malformed buffers rejected and no partial width accepted',()=>{for(const patch of [{renderWidthPx:0},{renderHeightPx:0},{renderHeightPx:undefined},{renderWidthPx:NaN},{renderWidthPx:20000},{renderWidthPx:450.2}])assert(!valid(base(T,patch)));});
test('All avatar counts share identical nonavatar profile',()=>{assert.equal(new Set(runs.map(r=>profile(r.configuration))).size,1);assert.equal(expectedProfile,'balanced|1.25|balanced|medium|111|1280x800');});
test('No fabricated report before any measurement',()=>{const p=plan([],'deutschrap-feature',30,null);assert(!p.ready&&!p.comparable);assert(p.rows.every(r=>r.status==='missing'));assert.equal(p.hardwareRecommendation,'unknown');});
test('Complete 2 3 4 x three real runs produces descriptive baseline',()=>{const b=plan(runs,'deutschrap-feature',30,expectedProfile);assert(b.ready&&b.comparable);assert.deepEqual(b.rows.map(r=>r.repetitions),[3,3,3]);assert.deepEqual(b.rows.map(r=>r.meanFps),[52,47,40]);assert.equal(b.fpsDrop2To4,12);assert.equal(b.renderWidthPx,1280);assert.equal(b.renderHeightPx,800);assert.equal(b.hardwareRecommendation,'unknown');});
test('Missing third repetition stays incomplete',()=>{const b=plan(runs.slice(0,8),'deutschrap-feature',30,expectedProfile);assert(!b.ready);assert.equal(b.rows[2].status,'incomplete');});
test('Missing a full avatar group keeps no inferred delta',()=>{const b=plan(runs.slice(3),'deutschrap-feature',30,expectedProfile);assert(!b.ready);assert.equal(b.rows[0].meanFps,null);assert.equal(b.fpsDrop2To4,null);});
test('Different resolution never mixes into baseline',()=>{const alt=run(2,20,{renderWidthPx:800,renderHeightPx:480});const b=plan([...runs.slice(0,2),alt,...runs.slice(3)],'deutschrap-feature',30,expectedProfile);assert(!b.ready);assert.equal(b.rows[0].repetitions,2);});
test('Changing drawing buffer during run invalidates old benchmark',()=>{const first=base();const s=begin('r','deutschrap-feature',30,first,T+100);assert(s);const changed=advance(s,base(T+1000,{renderWidthPx:900}));assert.equal(changed.status,'invalid');});
test('Manual lyrics or DPR switches remain isolated',()=>{for(const patch of [{dpr:1.1},{features:{lyrics:false,lipSync:true,reactiveLighting:true}},{tier:'high'},{renderHeightPx:768}]){const r=run(2,30,patch);const b=plan([...runs.slice(1),r],'deutschrap-feature',30,expectedProfile);assert.equal(b.rows[0].repetitions,2);}});
test('Wrong scene and FPS target do not contaminate comparisons',()=>{for(const scene of ['hardstyle-drop','long-concert']){const b=plan(runs,scene,30,expectedProfile);assert(!b.ready&&b.rows.every(r=>r.status==='missing'));}const b=plan(runs,'deutschrap-feature',45,expectedProfile);assert(!b.ready);});
test('Low FPS in one real run blocks 4-avatar pass',()=>{const slow=run(4,2,{fps:21,p95FrameMs:48,p99FrameMs:59,slowPercent:25});const b=plan([...runs.slice(0,8),slow],'deutschrap-feature',30,expectedProfile);assert(b.ready);assert.equal(b.rows[2].status,'below-target');});
test('Absent P99 is disclosed instead of certification',()=>{const missing=run(4,2,{p99FrameMs:undefined});const b=plan([...runs.slice(0,8),missing],'deutschrap-feature',30,expectedProfile);assert(!b.ready);assert.equal(b.rows[2].status,'limited');assert.equal(b.rows[2].worstWindowP99Ms,null);});
test('Device baseline selects latest completed measured profile',()=>{assert.equal(latest(runs,'deutschrap-feature',30),expectedProfile);assert.equal(latest(runs,'deutschrap-feature',60),null);assert.equal(latest([], 'deutschrap-feature',30),null);});
test('Only matching complete runs exported, no claim of Pi benchmark',()=>{const b=plan(runs,'deutschrap-feature',30,expectedProfile);const obj=exportReport([...runs,run(2,30,{renderWidthPx:800,renderHeightPx:480})],b,'Windows Chrome: same hook');assert.equal(obj.version,'V626');assert.equal(obj.completedRuns.length,9);assert(obj.provenance.includes('WebGL'));assert(obj.limitations.some(x=>x.includes('Raspberry Pi')));assert.equal(obj.baseline.hardwareRecommendation,'unknown');assert(!JSON.stringify(obj).includes('Pi 5 confirmed'));});
test('V626 is pure and does not start timers GPU queries or load extra meshes',()=>{const s=fs.readFileSync('services/monitoring/hardwareSizingBenchmarkV626.ts','utf8');for(const token of ['requestAnimationFrame(', 'useFrame(', 'new WebGLRenderer(', 'new SpotLight(', 'setInterval(', 'fetch('])assert(!s.includes(token));});
test('Wiring uses existing V522 history and actual V518 samples only',()=>{const v=fs.readFileSync('components/visualizer/PiConcertBenchmarkStudioV522.tsx','utf8');assert(v.includes('planDeviceBaselineV626(history'));assert(v.includes('exportDeviceReportV626(history'));assert(v.includes('V626 – Adaptive 3D Concert'));const s=fs.readFileSync('components/visualizer/adaptivePerformance.tsx','utf8');assert(s.includes('renderWidthPx:gl.domElement.width'));assert(s.includes('renderHeightPx:gl.domElement.height'));});
test('Stress reproducibility and bounded multi-profile grouping',()=>{let samples=0;for(let i=0;i<1500;i++){
 const subset=runs.filter(r=>r.avatarCount!==((i%3)+2)||i%5!==0);const p=plan(subset,'deutschrap-feature',30,expectedProfile);
 assert(p.rows.every(row=>row.repetitions<=3));assert.equal(p.hardwareRecommendation,'unknown');samples++;
 }console.log(`V626 deterministic ${samples} grouping samples`);});
console.log(`PASS V626 Adaptive 3D Concert Benchmarking: ${groups} groups`);
