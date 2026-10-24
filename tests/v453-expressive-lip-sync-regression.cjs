require('./helpers/threeAvatarSourcesV492.cjs').install();
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {load}=require('./helpers/ts-loader-v404.cjs');
const {enhanceExpressiveLipV453:enhance,addExpressiveHeadV453:addHead}=load('components/visualizer/expressiveLipSyncV453');
const lyrics={provider:'spotify',synced:true,plainText:null,lines:[
 {startMs:1000,endMs:1850,text:'Bam mal oh',words:[
  {text:'Bam',startMs:1000,endMs:1250},{text:'mal',startMs:1280,endMs:1510},
  {text:'oh',startMs:1570,endMs:1810}]},
 {startMs:2450,endMs:2950,text:'Lange',words:[{text:'Lange',startMs:2450,endMs:2930}]},
]};
const face={jaw:.38,wide:.22,round:.12,lipsClosed:.05,smile:.02,brow:.03,blink:0,cheek:.03,squint:.01};
const source=(time,style='rap',word='Bam',overrides={})=>({face:{...face},confidence:'word',effectiveTimeMs:time,vocal:{style,activeWord:word},...overrides});
const ctx={playing:true,enabled:true,reducedMotion:false,intensity:85};
const rapid=enhance(lyrics,source(1100),ctx);
assert(rapid.active&&rapid.rapid&&rapid.source==='timed-word');
assert(rapid.face.jaw>=face.jaw&&rapid.face.jaw<=.50);
assert(rapid.attackHz>25&&rapid.releaseHz>17);
assert(rapid.headPitch<0&&rapid.headPitch>=-.015);
assert.deepEqual(enhance(lyrics,source(1100),ctx),rapid,'pure and seek-safe');
assert.equal(rapid.face.lipsClosed,face.lipsClosed,'bilabial seal source intact');
for (const patch of [{playing:false},{enabled:false},{reducedMotion:true},{manualSilent:true},{intensity:0}]){
 const got=enhance(lyrics,source(1100),{...ctx,...patch});
 assert(!got.active,JSON.stringify(patch));assert.deepEqual(got.face,face);
 assert.equal(got.headPitch,0);
}
for(const pair of [[null,source(1100)],[{...lyrics,synced:false},source(1100)],[lyrics,source(900)],
 [lyrics,source(1600,'rap','Bam')],[lyrics,source(1350,'rap','Bam')],
 [lyrics,source(1100,'silent')],[lyrics,source(NaN)],
 [lyrics,source(1100,'rap','Bam',{confidence:'line'})]]){
 const got=enhance(pair[0],pair[1],ctx);assert.equal(got.active,false,JSON.stringify(pair));
}
const long=enhance(lyrics,source(2600,'singing','Lange'),ctx);
assert(long.active&&!long.rapid&&long.headPitch<=0);
const closed=enhance(lyrics,source(1100,'rap','Bam',{face:{...face,jaw:.07,lipsClosed:.94}}),ctx);
assert(closed.face.jaw<=1-closed.face.lipsClosed*.985+1e-9,'closure overrides jaw attack');
assert(closed.face.wide<=face.wide&&closed.face.round<=face.round);
const edited=enhance(lyrics,source(1100),{...ctx,editedWords:[{startMs:1000,text:'Bam'}]});
for(const c of ['jaw','wide','round','lipsClosed'])assert.equal(edited.face[c],face[c],`authored ${c} not rewritten`);
assert(rapid.face.jaw>edited.face.jaw);
const audioPriority=enhance(lyrics,source(1100),{...ctx,preserveAudioMouth:true});
for(const c of ['jaw','wide','round','lipsClosed'])assert.equal(audioPriority.face[c],face[c],`V423 ${c} preserved`);
const body={headPitch:-.08,headYaw:.04,eyeYaw:.03,leftArm:.2};
const enhanced=addHead(body,rapid);
assert(enhanced.headPitch<body.headPitch && enhanced.headPitch>=-.18);
assert.equal(enhanced.eyeYaw,body.eyeYaw);
assert.deepEqual(body,{headPitch:-.08,headYaw:.04,eyeYaw:.03,leftArm:.2},'no mutation');
assert.deepEqual(addHead(body,enhance(lyrics,source(1100),{...ctx,authoredBody:true})),body);
assert.deepEqual(addHead(body,enhance(lyrics,source(1100),{...ctx,reducedMotion:true})),body);
for (const got of [rapid,long,closed,edited]){
 for(const val of Object.values(got.face))assert(Number.isFinite(val)&&val>=0&&val<=1);
 assert(Math.abs(got.headPitch)<=.015);
}
const rig=fs.readFileSync('components/visualizer/VocalRigV368.tsx','utf8');
const avatar=fs.readFileSync('components/visualizer/ThreeAvatar.tsx','utf8');
assert(rig.includes('enhanceExpressiveLipV453('));
assert(rig.includes('lastClockV453.current'),'reset across song/seek');
assert(rig.includes('morph.delta=overlay'),'morphs still preserve authored clips');
assert(avatar.match(/enhanceExpressiveLipV453\(/g)?.length>=2,'procedural and GLTF head overlay');
assert(avatar.includes('addExpressiveHeadV453('));
assert(avatar.includes('authoredBody:avatarMotionMode==="choreography"||!!stableLibraryClip'));
assert(!fs.readFileSync('components/visualizer/expressiveLipSyncV453.ts','utf8').includes('localStorage'));
assert(Number(require('../package.json').version.match(/v(\d+)$/)?.[1])>=453);
console.log('PASS V453: verified timed-word-only lip dynamics, bilabial closures, silence/seek guards, authorship, GLB/procedural sharing, reduced motion');
