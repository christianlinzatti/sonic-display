'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {load}=require('./helpers/ts-loader-v404.cjs');
const {resolveVocalPerformanceQualityV374}=load('components/visualizer/vocalPerformanceQualityV374');
const words=[
 {text:'Bam',startMs:1000,endMs:1270},
 {text:'flieg',startMs:1330,endMs:1620},
 {text:'Schuss',startMs:1680,endMs:1990},
 {text:'SIE',startMs:2050,endMs:2330},
 {text:'Boom',startMs:2390,endMs:2710},
];
const lyrics={synced:true,provider:'test',lines:[{startMs:1000,endMs:2750,text:'Bam flieg Schuss SIE Boom',words},
 {startMs:3000,endMs:3550,text:'[Instrumental]'},
 {startMs:4000,endMs:4900,text:'Line only'}]};
const opt={style:'rap',genre:'Deutschrap',naturalArticulationEnabledV384:true,
 qualityEnabledV374:true,articulationStrengthV384:90,lipSealV384:90,lipStrength:95,
 rapArticulationEnabledV405:true,rapClarityV405:85,ensembleCountV374:1};
const run=(ms,extra={},playing=true,source=lyrics)=>resolveVocalPerformanceQualityV374(source,ms,playing,{...opt,...extra});
const legacy=ms=>run(ms,{rapArticulationEnabledV405:false});
// Existing bilabial onset still wins over all decorative wide/round shapes.
const boom=run(1008);
assert.equal(boom.articulationV384.bilabial,'initial');
assert(boom.face.jaw+boom.face.lipsClosed*.985<=1+1e-9);
assert(boom.face.lipsClosed>=legacy(1008).face.lipsClosed);
// No fake full B/P/M contact at F/V/W; keep word onset clear.
const f=run(1340),fOff=legacy(1340);
assert.equal(f.articulationV405.class,'labiodental');
assert(f.face.jaw<=fOff.face.jaw+1e-9);
assert(f.face.lipsClosed<.6,'F must not be treated like bilabial P');
// S/Z/ß gets a narrower air-flow attack, without adding non-vocal sounds.
const sch=run(1690),schOff=legacy(1690);
assert.equal(sch.articulationV405.class,'sibilant');
assert(sch.face.wide>=schOff.face.wide);
assert.equal(run(1970).articulationV405.class,'sibilant','word-final sibilant');
const ie=run(2210),ieOff=legacy(2210);
assert.equal(ie.articulationV405.class,'wide-vowel');
assert(ie.face.wide>=ieOff.face.wide-1e-9);
const oo=run(2570),ooOff=legacy(2570);
assert.equal(oo.articulationV405.class,'round-vowel');
assert(oo.face.round>=ooOff.face.round-1e-9);
// Fallbacks must never invent activity, including malformed timings and pauses.
for(const ms of [0,1300,1630,2750,3250,3800,4100,5100]){
 assert.equal(run(ms).articulationV405.active,false,`inactive at ${ms}`);
}
for(const [extra,playing,source] of [
 [{rapArticulationEnabledV405:false},true,lyrics],
 [{rapClarityV405:0},true,lyrics],
 [{reducedMotion:true},true,lyrics],
 [{naturalArticulationEnabledV384:false},true,lyrics],
 [{qualityEnabledV374:false},true,lyrics],
 [{},false,lyrics],
 [{},true,{...lyrics,synced:false}],
]){
 assert.equal(run(2570,extra,playing,source).articulationV405.active,false);
}
for(const ms of [1000,1008,1050,1270,1340,1440,1600,1680,1690,1830,1970,2050,2210,2570,2750,4000]){
 const a=run(ms),b=run(ms);
 assert.deepEqual(a,b,`seek-safe / deterministic at ${ms}`);
 for(const key of ['jaw','wide','round','lipsClosed','smile','brow','blink','cheek','squint']){
  assert(Number.isFinite(a.face[key])&&a.face[key]>=0&&a.face[key]<=1,`${key} out of bounds at ${ms}`);
 }
 assert(a.face.jaw+a.face.lipsClosed*.985<=1+1e-9,`jaw-closure conflict at ${ms}`);
}
const basic=run(1440,{rapClarityV405:0});
assert.deepEqual(basic.face,legacy(1440).face,'disabled V405 must preserve V404 pose');
assert.equal(run(2570,{style:'singing'}).articulationV405.active,false,'rap-only refinement');
assert.equal(run(2570,{rapClarityV405:NaN}).articulationV405.active,false,'bad strength ignored');
assert.equal(run(2570,{rapClarityV405:Infinity}).articulationV405.active,false,'infinite strength ignored');
assert.equal(run(2570,{manualSingingSlotsV385:[0],avatarSlot:1}).face.jaw<=run(2570).face.jaw*.051+1e-9,true,'manual backing avatar stays muted');
const moduleSrc=fs.readFileSync(path.resolve(__dirname,'../components/visualizer/vocalPerformanceQualityV374.ts'),'utf8');
assert(moduleSrc.includes('vocal.activeWord===base.vocal.activeWord'),'mouth smoothing must not bleed across word boundaries');
const inspector=fs.readFileSync(path.resolve(__dirname,'../components/visualizer/VocalSyncInspectorV373.tsx'),'utf8');
assert(inspector.includes('v405-rap-articulation-diagnostic'),'V405 inspector visibility');
console.log('PASS V405: German rap mouth accents, protected B/P/M closure, silence and missing word timing, deterministic seeks, disabled fallbacks, singer roles, bounded face and inspector');
