#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const load=require('./helpers/loader-v733.cjs')();
const {refineAdvancedRapGestureV1023,rapMouthResponseV1023}=load('components/visualizer/advancedRapPerformanceV1023');
const accent={active:true,source:'word',lineIndex:0,wordIndex:1,role:'lead',
 confidence:'lyrics-word',head:.021,chest:.031,arms:.065,side:1};
const lyrics={synced:true,lines:[{startMs:1000,endMs:3300,words:[
 {text:'Eins',startMs:1000,endMs:1420},{text:'zwei',startMs:1460,endMs:1880},
 {text:'drei',startMs:1920,endMs:2490}]}]};
const context={lyrics,trackId:'track-rap-01',effectiveTimeMs:1650,playing:true,rap:true,
 reducedMotion:false,authored:false,enabled:true,slot:0,count:1,section:'verse',tier:'high'};
const cue=refineAdvancedRapGestureV1023(accent,context);
assert.equal(cue.active,true);assert.equal(cue.evidence,'timed-word');
assert.equal(cue.accent.role,'lead');assert.equal(cue.accent.source,'word');
assert.equal(cue.accent.lineIndex,0);assert.equal(cue.accent.wordIndex,1);
assert.deepEqual(cue,refineAdvancedRapGestureV1023(accent,context),'deterministic output');
assert(cue.accent.head>=0&&cue.accent.head<=.055);
assert(cue.accent.chest>=0&&cue.accent.chest<=.09);
assert(cue.accent.arms>=0&&cue.accent.arms<=.11);
assert.equal(refineAdvancedRapGestureV1023(accent,{...context,effectiveTimeMs:1100}).active,false);
assert.equal(refineAdvancedRapGestureV1023(accent,{...context,effectiveTimeMs:1900}).active,false);
for(const changed of [
 {playing:false},{rap:false},{enabled:false},{reducedMotion:true},{authored:true},
 {tier:'low'},{trackId:''},{effectiveTimeMs:NaN},{effectiveTimeMs:-1},
 {section:'break'},{lyrics:null},{slot:4},{count:0},{count:2},
 {lyrics:{...lyrics,synced:false}},
 {lyrics:{synced:true,lines:[{...lyrics.lines[0],words:[]}]}}
]){
 const v=refineAdvancedRapGestureV1023(accent,{...context,...changed});
 assert.equal(v.active,false,JSON.stringify(changed));assert.strictEqual(v.accent,accent);
}
assert.equal(refineAdvancedRapGestureV1023({...accent,role:'background'},context).active,false);
assert.equal(refineAdvancedRapGestureV1023({...accent,source:'line'},context).active,false);
assert.equal(refineAdvancedRapGestureV1023({...accent,active:false},context).active,false);
const cast={active:true,lineIndex:0,singingSlots:[0],handoffFrom:null,phase:1};
assert.equal(refineAdvancedRapGestureV1023(accent,{...context,count:2,casting:cast}).active,true);
assert.equal(refineAdvancedRapGestureV1023(accent,{...context,count:2,slot:1,casting:cast}).active,false);
assert.equal(refineAdvancedRapGestureV1023(accent,{...context,count:2,casting:{...cast,lineIndex:1}}).active,false);
assert.equal(refineAdvancedRapGestureV1023(accent,{...context,tier:'balanced'}).active,true);
const evidence={active:true,source:'verified-timed-word',mode:'connected-flow',
 wordStartMs:1460,wordEndMs:1880,onset:.75,release:.4};
const mouth={playing:true,rap:true,verifiedSinger:true,manualPriority:false,protectedMouth:false,
 reducedMotion:false,tier:'high',effectiveTimeMs:1600};
const jaw=rapMouthResponseV1023(evidence,mouth,'jaw',.1,.55);
assert(jaw>1&&jaw<=1.085,'only existing jaw target is accelerated');
assert(rapMouthResponseV1023(evidence,mouth,'jaw',.8,.15)<1,'release should be calmer');
assert.equal(rapMouthResponseV1023(evidence,mouth,'lipsClosed',.1,.8),1,'do not modify bilabial seal');
for(const channel of ['brow','blink','smile','cheek','squint'])
 assert.equal(rapMouthResponseV1023(evidence,mouth,channel,.1,.8),1,'not a face owner');
for(const changes of [{playing:false},{rap:false},{verifiedSinger:false},{manualPriority:true},
 {protectedMouth:true},{reducedMotion:true},{tier:'low'},
 {effectiveTimeMs:1880},{effectiveTimeMs:1400},{effectiveTimeMs:NaN}])
 assert.equal(rapMouthResponseV1023(evidence,{...mouth,...changes},'jaw',.1,.8),1,JSON.stringify(changes));
assert.equal(rapMouthResponseV1023({...evidence,active:false},mouth,'jaw',.1,.8),1);
assert.equal(rapMouthResponseV1023(evidence,mouth,'jaw',.1,.1),1);
// The adapter must NOT take over the real lips, alter imported clips, or perform I/O.
const impl=read('components/visualizer/advancedRapPerformanceV1023.ts');
for(const blocked of ['fetch(','setInterval(','localStorage','sessionStorage','indexedDB','window.dispatchEvent',
 'Date.now(','morphTargetInfluences','AudioContext','goveeApi'])
 assert(!impl.includes(blocked),'unexpected side effect: '+blocked);
const body=read('components/visualizer/useGltfVocalMotionV492.ts');
const face=read('components/visualizer/VocalRigV368.tsx');
assert(body.includes('refineAdvancedRapGestureV1023(rawWordDanceV567'));
assert(body.includes('correctAutomaticAccentV515(wordDanceV567'));
assert(face.includes('rapMouthResponseV1023(articulationV837,mouthContextV1023'));
assert(face.includes("c==='lipsClosed'"),'existing seal preserved');
const pkg=JSON.parse(read('package.json')),lock=JSON.parse(read('package-lock.json'));
const version=/^0\.1\.0-v([1-9]\d*)$/.exec(pkg.version);
assert(version&&Number(version[1])>=1023);assert.equal(pkg.sonicRoadmapRelease,'v'+version[1]);
assert.equal(pkg.sonicFeatureRelease,'v'+version[1]);
assert.equal(lock.version,pkg.version);assert.equal(lock.packages[''].version,pkg.version);
assert(pkg.scripts.prebuild.startsWith('npm run test:v'+version[1]+' &&'));
for(const p of ['scripts/v931-production-gate.cjs','scripts/vercel-production-build.cjs'])
 assert(read(p).includes('tests/v1023-advanced-rap-performance-regression.cjs'),p);
assert(read('scripts/v959-source-preflight.cjs').includes('inspectReleaseV1023(root)'));
console.log('PASS V1023 rap motion + mouth timing: verified evidence, user authority, bounded gestures, CI');
