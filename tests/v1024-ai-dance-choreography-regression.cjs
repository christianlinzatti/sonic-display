#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const load=require('./helpers/loader-v733.cjs')();
const dance=load('components/visualizer/aiDanceChoreographyV1024');
const motion={headNod:.08,shoulderRoll:.09,chestPulse:.06,armSwing:.12,
 spineSway:.07,torsoTwist:.05,followThrough:.09,leftArmAccent:.04,rightArmAccent:.04,
 footStep:.14,legGroove:.12,hipSway:.10,weightShift:.07,hipPitch:.04,hipVertical:.01,
 expressionJaw:.3,expressionBrow:.1,expressionHeadTilt:.07,naturalLeftAnkle:.04};
const input={trackId:'artist-song',modelId:'avatar-1',seconds:10,delta:1/60,bpm:120,
 section:'verse',genre:'Deutschrap',playing:true,reducedMotion:false,manualPriority:false,
 quality:'high',footIKEnabled:true,contactKnown:true,plantedLeft:false,plantedRight:false,
 slot:0,count:1};
const step=(state=dance.createDanceStateV1024(),overrides={},base=motion)=>
 dance.stepDanceChoreographyV1024(state,base,{...input,...overrides});
const initial=dance.createDanceStateV1024();
const a=step(initial);
assert(a.active&&a.motif&&a.phrase>=0&&a.ensembleRole==='solo');
assert.deepEqual(step(dance.createDanceStateV1024()),a,'deterministic first frame');
assert.deepEqual(initial,dance.createDanceStateV1024(),'state is immutable');
assert.notEqual(a.motion.armSwing,motion.armSwing,'additive existing channel is modulated');
for(const k of ['footStep','legGroove','hipSway','weightShift','hipPitch','hipVertical','expressionJaw','expressionBrow','expressionHeadTilt','naturalLeftAnkle'])
 assert.equal(a.motion[k],motion[k],`original feet, hips, root or facial field ${k} must not change`);
assert.deepEqual(motion,{headNod:.08,shoulderRoll:.09,chestPulse:.06,armSwing:.12,spineSway:.07,
 torsoTwist:.05,followThrough:.09,leftArmAccent:.04,rightArmAccent:.04,footStep:.14,
 legGroove:.12,hipSway:.10,weightShift:.07,hipPitch:.04,hipVertical:.01,
 expressionJaw:.3,expressionBrow:.1,expressionHeadTilt:.07,naturalLeftAnkle:.04},'original is not mutated');
for(const k of ['headNod','shoulderRoll','chestPulse','armSwing','spineSway','torsoTwist','followThrough','leftArmAccent','rightArmAccent']){
 assert(Number.isFinite(a.motion[k]));assert(Math.abs(a.motion[k]/motion[k]-1)<=.10+1e-10,k);
}
assert.equal(step(dance.createDanceStateV1024(),{}, {...motion,headNod:0,armSwing:0}).motion.armSwing,0,'cannot synthesize arm animation');
assert.equal(step(dance.createDanceStateV1024(),{}, {...motion,headNod:0,armSwing:0}).motion.headNod,0,'cannot synthesize head motion');
// Musical phrase progression does not repeat one motif immediately.
let st=dance.createDanceStateV1024(),last=null,seen=new Set();
for(let phrase=0;phrase<8;phrase++){
 const current=step(st,{seconds:phrase*8+.12,delta:1/60});
 assert(current.active);
 assert.notEqual(current.motif,last,'immediately repeated phrase motif');
 last=current.motif;seen.add(current.motif);st=current.state;
}
assert(seen.size>=3,'non-trivial phrase variety');
// Ensemble shares the song-clock motif while the non-leading slot counterbalances arms.
const lead=step(dance.createDanceStateV1024(),{count:3,slot:0,section:'hook'});
const partner=step(dance.createDanceStateV1024(),{count:3,slot:1,section:'hook'});
assert.equal(lead.motif,partner.motif,'ensemble shares motif and phrase boundaries');
assert.equal(lead.phrase,partner.phrase);assert.equal(lead.ensembleRole,'lead');
assert.equal(partner.ensembleRole,'counter');
// Contact can only reduce extra energy, and both planted caps any prior accent.
const free=step(dance.createDanceStateV1024());
const planted=step(dance.createDanceStateV1024(),{plantedLeft:true,plantedRight:true});
assert.equal(planted.contactScale,.30);assert.equal(free.contactScale,1);
for(const k of ['headNod','shoulderRoll','chestPulse','armSwing','spineSway'])
 assert(Math.abs(planted.motion[k]-motion[k])<=Math.abs(free.motion[k]-motion[k])+1e-9);
let energetic=dance.createDanceStateV1024();
for(let i=0;i<120;i++)energetic=step(energetic,{seconds:10+i/60}).state;
const plantedAfter=step(energetic,{seconds:12,plantedLeft:true,plantedRight:true});
for(const k of ['headNod','shoulderRoll','chestPulse','armSwing'])
 assert(plantedAfter.motion[k]/motion[k]<=1.025+1e-9,'stale high accents cannot survive double plant');
// Reset and bypass are hard boundaries: no stale performance or track identity.
for(const patch of [
 {playing:false},{reducedMotion:true},{manualPriority:true},{quality:'low'},
 {trackId:''},{modelId:''},{bpm:NaN},{bpm:10},{bpm:500},{seconds:NaN},
 {seconds:-1},{delta:0},{delta:.3},{section:'unknown'},
 {footIKEnabled:false},{contactKnown:false},{slot:4},{slot:-1},
 {count:0},{count:5},{qualityGain:NaN},{qualityGain:2},
 {settings:{enabled:false}},{settings:{strength:0}},
]){
 const result=step(energetic,patch);
 assert.equal(result.active,false,JSON.stringify(patch));
 assert.strictEqual(result.motion,motion,'manual or unsafe paths must keep original object');
 assert.deepEqual(result.state,dance.createDanceStateV1024());
}
for(const patch of [{seconds:2},{seconds:12.5},{trackId:'new-track'},{modelId:'new-avatar'},{bpm:150}]){
 const result=step(energetic,patch);
 assert(result.active&&result.state.trackId=== (patch.trackId??input.trackId));
 assert(result.state.recent.length===1,'seek/track/model/tempo discontinuity clears old motif history');
}
assert.equal(step(dance.createDanceStateV1024(),{}, {...motion,armSwing:Infinity}).active,false);
// Soft transitions should be near frame-rate independent; no frame-count-based growth.
function traverse(dt){let state=dance.createDanceStateV1024(),out;
 for(let t=0;t<.4-dt/2;t+=dt){out=step(state,{seconds:10+t,delta:dt});state=out.state;}
 return out;
}
assert(Math.abs(traverse(1/120).motion.armSwing-traverse(1/30).motion.armSwing)<.004,'30/120fps smoothing must agree');
assert.equal(dance.danceCharacterV1024('Hardtekk'),'hardtekk');
assert.equal(dance.danceCharacterV1024('Hardstyle'),'hardstyle');
assert.equal(dance.danceCharacterV1024('NDH Industrial'),'rock');
assert.equal(dance.danceCharacterV1024('Deutschrap'),'rap');
assert.equal(dance.danceCharacterV1024('Ambient'),'other');
assert.equal(dance.danceSectionV1024('Hook'),'hook');
assert.equal(dance.danceSectionV1024('intro'),'quiet');
assert.equal(dance.danceSectionV1024('drop'),'drop');
assert.equal(dance.danceSectionV1024('unknown'),null);
assert.deepEqual(JSON.parse(JSON.stringify(dance.normalizeDanceV1024({strength:200,transitionMs:4,phraseBeats:9}))),
 {enabled:true,strength:100,phraseBeats:16,transitionMs:80});
// Integration: one existing frame loop; downstream V839 still owns contact + IK.
const avatar=read('components/visualizer/GltfDancerAvatarV492.tsx');
for(const needle of ['const danceStateV1024=useRef(createDanceStateV1024());',
 'refineNaturalDanceV1078(baseDebugMotionV1024,',
 'stepDanceChoreographyV1024(danceStateV1024.current,naturalDanceV1078.motion',
 'const debugMotion = overlayNaturalMotionV1061(danceV1024.motion,naturalCueV1061);',
 'refineNaturalFootworkRigV839(naturalFootworkV839.current,debugMotion',
 'applyAvatarRigMotion(rigTargets.current, footworkV839.motion',
 'updateFootGrounding({delta'])assert(avatar.includes(needle),needle);
const refs=['stepDanceChoreographyV1024(danceStateV1024.current',
 'refineNaturalFootworkRigV839(naturalFootworkV839.current,debugMotion',
 'applyAvatarRigMotion(rigTargets.current, footworkV839.motion','updateFootGrounding({delta'];
for(let i=0;i<refs.length-1;i++)assert(avatar.indexOf(refs[i])<avatar.indexOf(refs[i+1]));
assert.equal((avatar.match(/updateFootGrounding\(\{delta/g)||[]).length,1);
const impl=read('components/visualizer/aiDanceChoreographyV1024.ts');
for(const unsafe of ['fetch(','localStorage','sessionStorage','indexedDB','setInterval(',
 'setTimeout(','new AudioContext','morphTargetInfluences','window.','goveeApi'])
 assert(!impl.includes(unsafe),'no timer, storage, network, morph or hardware operations');
const pkg=JSON.parse(read('package.json')),lock=JSON.parse(read('package-lock.json'));
const v=/^0\.1\.0-v([1-9]\d*)$/.exec(pkg.version);assert(v&&Number(v[1])>=1024);
assert.equal(pkg.sonicFeatureRelease,'v'+v[1]);assert.equal(pkg.sonicRoadmapRelease,'v'+v[1]);
assert.equal(pkg.version,lock.version);assert.equal(pkg.version,lock.packages[''].version);
assert(pkg.scripts.prebuild.startsWith(`npm run test:v${v[1]} &&`));
for(const p of ['scripts/v931-production-gate.cjs','scripts/vercel-production-build.cjs'])
 assert(read(p).includes('tests/v1024-ai-dance-choreography-regression.cjs'),p);
assert(read('scripts/v959-source-preflight.cjs').includes('inspectReleaseV1024(root)'));
console.log('PASS V1024: phrase variety, smoothing, ensemble sync, contact/IK, manual authority, CI');
