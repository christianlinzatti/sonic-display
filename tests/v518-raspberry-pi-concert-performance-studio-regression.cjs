'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {load}=require('./helpers/ts-loader-v404.cjs');
const {appendPiStudioReadingV518:append,capturePiStudioV518:capture,comparePiStudioV518:compare,piStudioAdviceV518:advice,
  PI_STUDIO_HISTORY_LIMIT_V518:limit}=load('services/monitoring/piConcertPerformanceStudioV518');
let at=1710000000000;
const sample=(i,overrides={})=>({at:at+i*1000,avatarCount:2,tier:'balanced',dpr:1.15,
  fps:51+i%4,p95FrameMs:22+(i%4),slowPercent:3+(i%3),drawCalls:140+i%6,
  triangles:140000+i*10,piProfile:'balanced',piLevel:'balanced',
  features:{lyrics:true,lipSync:true,reactiveLighting:true},heapMb:i%3===0?128+i:null,...overrides});
let readings=[];let verified=0;
for(let i=0;i<35000;i++){
 const r=sample(i);const before=readings;readings=append(readings,r);
 assert(readings.length<=limit);assert.notStrictEqual(readings,before);
 if(i>10&&i%257===0){
  const c=capture(readings,r.at+250);assert.equal(c.status,'ready');
  assert.equal(c.capture.avatarCount,2);assert.equal(c.capture.count,20);
  assert(c.capture.avgFps>50&&c.capture.avgFps<55);
  assert(c.capture.worstWindowP95Ms>=22&&c.capture.worstWindowP95Ms<=25);
  assert(c.capture.peakHeapMb!==null&&c.capture.peakHeapMb>0);
  assert.equal(c.capture.configuration,'2|balanced|1.15|balanced|balanced|111');
  verified++;
 }
}
const base=capture(readings,readings[readings.length-1].at+100).capture;
assert(base&&verified>100);
assert.strictEqual(append(readings,sample(34999)),readings,'duplicate window ignored');
assert.strictEqual(append(readings,sample(35001,{fps:NaN})),readings,'bad FPS ignored');
assert.strictEqual(append(readings,sample(35001,{fps:Infinity})),readings,'infinity ignored');
assert.strictEqual(append(readings,sample(35001,{heapMb:-10})),readings,'invalid heap rejected');
assert.strictEqual(append(readings,sample(35001,{avatarCount:5})),readings,'non-2–4 group excluded');
assert.equal(capture(readings,readings[readings.length-1].at+5500).status,'stale');
let switched=readings;
for(let i=35000;i<35005;i++) switched=append(switched,sample(i,{avatarCount:4}));
assert.notEqual(capture(switched,switched.at(-1).at+300).status,'ready','5 windows after avatar switch insufficient');
switched=append(switched,sample(35005,{avatarCount:4}));
let changed=capture(switched,switched.at(-1).at+300);
assert.equal(changed.status,'ready');assert.equal(changed.capture.avatarCount,4);
assert.equal(changed.capture.count,6);
const comparison=compare(base,changed.capture);
assert(comparison.comparable&&comparison.reasons.length===0,'same quality and options, different group counts');
assert(!compare(base,{...changed.capture,features:{...changed.capture.features,lyrics:false}}).comparable);
assert(!compare(base,{...changed.capture,tier:'high'}).comparable);
assert(!compare(base,{...changed.capture,piLevel:'eco'}).comparable);
assert(!compare(base,{...changed.capture,dpr:1.3}).comparable);
assert(!compare(base,{...changed.capture,avatarCount:2}).comparable);
const noHeap=[];for(let i=0;i<7;i++)noHeap.push(sample(i,{heapMb:null}));
assert.equal(capture(noHeap,noHeap.at(-1).at+100).capture.peakHeapMb,null,'not available != 0 MB');
assert(advice({...base,avgFps:22}).includes('Hohe Frame-Last'));
assert(advice({...base,avgFps:34,worstWindowP95Ms:34}).includes('Teilweise'));
assert(advice({...base,avgFps:60,worstWindowP95Ms:16,avgSlowPercent:0}).includes('Keine deutliche'));
// Time reversal, stale readings, broken feature state, missing data: fail closed.
assert.equal(capture([],at).status,'insufficient');
assert.strictEqual(append(readings,sample(35001,{features:{lyrics:'yes',lipSync:true,reactiveLighting:true}})),readings);
assert.strictEqual(append(readings,sample(35001,{fps:0})),readings);
assert.strictEqual(append(readings,sample(35001,{dpr:0})),readings);
assert.strictEqual(append(readings,sample(35001,{at:NaN})),readings);
assert.notEqual(capture(readings,readings[readings.length-1].at-9000).status,'ready');
let unstable=[];for(let i=0;i<7;i++)unstable=append(unstable,sample(i,{tier:i%2?'high':'balanced'}));
assert.notEqual(capture(unstable,unstable.at(-1).at+100).status,'ready');
let missing=[];for(let i=0;i<7;i++)missing=append(missing,sample(i,{at:at+i*4000}));
assert.notEqual(capture(missing,missing.at(-1).at+100).status,'ready');
const stage=fs.readFileSync('components/visualizer/ThreeAvatar.tsx','utf8');
const sampler=fs.readFileSync('components/visualizer/adaptivePerformance.tsx','utf8');
const panel=fs.readFileSync('components/visualizer/RenderDiagnosticsPanel.tsx','utf8');
const runtime=fs.readFileSync('components/visualizer/piConcertPerformanceRuntimeV518.tsx','utf8');
const studio=fs.readFileSync('components/visualizer/PiConcertPerformanceStudioV518.tsx','utf8');
assert(stage.includes('setPiStudioFeaturesV518({lyrics:lyricsActiveV356')&&stage.includes('lipSync:props.lipSync?.enabled===true'));
assert(sampler.includes('samplePiConcertV479({at:nowV518')&&sampler.includes('recordPiStudioV518({at:nowV518'));
assert(sampler.indexOf('recordPiStudioV518({at:nowV518')>sampler.indexOf('samplePiConcertV479({at:nowV518'));
assert(runtime.includes('if(!playing||!visible||!features)return;'),'no paused/hidden scene recording');
assert(panel.includes('<PiConcertPerformanceStudioV518 />')&&studio.includes('capturePiStudioV518(samples,Date.now())'));
assert(!studio.includes('setPerformanceMode(')&&!runtime.includes('requestAnimationFrame')&&!runtime.includes('setInterval'));
const pkg=require('../package.json');assert(Number(pkg.version.match(/-v(\d+)$/)?.[1]??0)>=518);
assert(pkg.scripts['build:preflight'].includes('npm run test:v518 && npm run test:v518:types && npm run test:v517'));
console.log(`PASS V518 Raspberry Pi Concert Performance Studio: 35000 observed-frame simulations, ${verified} capture windows, 2–4 avatar comparisons, quality/lyrics/lip-sync/lighting guards, optional JS heap, read-only rendering integration`);
