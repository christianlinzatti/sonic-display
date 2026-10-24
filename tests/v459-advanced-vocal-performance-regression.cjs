require('./helpers/threeAvatarSourcesV492.cjs').install();
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {load}=require('./helpers/ts-loader-v404.cjs');
const {enhanceExpressiveLipV453}=load('components/visualizer/expressiveLipSyncV453');
const {refineAdvancedVocalV459:refine,addAdvancedVocalHeadV459:addHead}=load('components/visualizer/advancedVocalPerformanceV459');
const words=[
  {text:'Bam',startMs:1000,endMs:1240},
  {text:'alle',startMs:1270,endMs:1500},
  {text:'gehen',startMs:1550,endMs:1780},
  {text:'weiter',startMs:2300,endMs:2750},
  {text:'so',startMs:2800,endMs:3330},
];
const lyrics={provider:'spotify',synced:true,plainText:null,lines:[
 {startMs:1000,endMs:3350,text:'Bam alle gehen weiter so',words},
 {startMs:4500,endMs:5200,text:'allein',words:[{text:'allein',startMs:4600,endMs:5100}]},
]};
const face={jaw:.30,wide:.3,round:.16,lipsClosed:.05,smile:.05,brow:.04,blink:.01,cheek:.05,squint:.02};
const cue=(time,word,patch={})=>({face:{...face},effectiveTimeMs:time,confidence:'word',vocal:{style:'rap',activeWord:word},...patch});
const ctx={playing:true,enabled:true,reducedMotion:false,intensity:90};
const sample=(time,word,context=ctx,source=cue(time,word))=>{
 const old=enhanceExpressiveLipV453(lyrics,source,context);
 return {old,result:refine(lyrics,old,source,context)};
};
const joined=sample(1140,'Bam');
assert(joined.result.active&&joined.result.joinedWords,'joined word marks');
assert(joined.result.attackHz>joined.old.attackHz);
assert(joined.result.releaseHz<joined.old.releaseHz);
assert(joined.result.face.jaw>=joined.old.face.jaw);
assert(joined.result.face.cheek>joined.old.face.cheek);
assert(joined.result.face.brow>joined.old.face.brow);
assert(Math.abs(joined.result.headYawExtra)<=.009);
assert(Math.abs(joined.result.headPitchExtra)<=.006);
assert.deepEqual(refine(lyrics,joined.old,cue(1140,'Bam'),ctx),joined.result,'pure and seek-safe');
const separated=sample(4770,'allein');
assert(!separated.result.joinedWords,'no false join across a long word gap unless next adjacent');
assert(separated.result.releaseHz>=separated.old.releaseHz,'isolated words release promptly');
const next=sample(1450,'alle');
assert(next.result.face.wide>=next.old.face.wide,'coarticulation only follows real next-word text');
assert.equal(next.result.face.lipsClosed,next.old.face.lipsClosed,'never override original lip contact');
const roundNext=sample(2650,'weiter');
assert(roundNext.result.face.round>roundNext.old.face.round,'verified o-vowel in following word can inform the very end of the previous word');
const closed=sample(1090,'Bam',ctx,cue(1090,'Bam',{face:{...face,jaw:.04,lipsClosed:.96}}));
assert(closed.result.face.jaw<=1-closed.result.face.lipsClosed*.985+1e-8);
assert.equal(closed.result.face.lipsClosed,.96);
for (const context of [
 {...ctx,editedWords:[{startMs:1000,text:'Bam'}]},
 {...ctx,preserveAudioMouth:true},
]){
 const {old,result}=sample(1140,'Bam',context);
 for(const k of ['jaw','wide','round','lipsClosed'])assert.equal(result.face[k],old.face[k],`authored ${k} unchanged`);
}
const nextEdited=sample(1450,'alle',{...ctx,editedWords:[{startMs:1550,text:'gehen'}]});
assert.equal(nextEdited.result.face.round,nextEdited.old.face.round,'do not blend into next edited word');
for(const context of [
 {...ctx,playing:false},{...ctx,enabled:false},{...ctx,reducedMotion:true},
 {...ctx,manualSilent:true},{...ctx,intensity:0},{...ctx,intensity:Infinity},
]){
 const {old,result}=sample(1140,'Bam',context);
 assert.deepEqual(result.face,old.face,'no visual accent if disabled');
 assert.equal(result.headYawExtra,0);
 assert.equal(result.headPitchExtra,0);
}
for(const pair of [
 [null,cue(1140,'Bam')],[{...lyrics,synced:false},cue(1140,'Bam')],
 [lyrics,cue(900,'Bam')],[lyrics,cue(1140,'other')],
 [lyrics,cue(NaN,'Bam')],[lyrics,cue(1140,'Bam',{confidence:'line'})],
]){
 const old=enhanceExpressiveLipV453(pair[0],pair[1],ctx);
 const result=refine(pair[0],old,pair[1],ctx);
 assert.deepEqual(result.face,old.face);
 assert.equal(result.headYawExtra,0);
}
const authored=sample(1140,'Bam',{...ctx,authoredBody:true}).result;
assert.equal(authored.headPitchExtra,0);
assert.equal(authored.headYawExtra,0);
const body={headPitch:.01,headYaw:-.02,leftArm:.3,eyeYaw:0};
const altered=addHead(body,joined.result);
assert.equal(altered.leftArm,body.leftArm);
assert.equal(altered.eyeYaw,body.eyeYaw);
assert.notDeepEqual(altered,body);
assert.deepEqual(body,{headPitch:.01,headYaw:-.02,leftArm:.3,eyeYaw:0},'no mutation');
assert.deepEqual(addHead(body,authored),body);
for (const sec of [1095,1150,1230,1320,1420,1610,1710,2440,2700,2900]){
 const mark=words.find((w)=>w.startMs<=sec&&w.endMs>sec);
 const {result}=sample(sec,mark.text);
 for(const [k,v] of Object.entries(result.face))assert(Number.isFinite(v)&&v>=0&&v<=1,`${k}: ${v}`);
 assert(result.headPitchExtra>=-.006&&result.headPitchExtra<=0);
 assert(Math.abs(result.headYawExtra)<=.009);
}
// Lightweight seek and long-play regression of the pure solver (not a browser/GPU test).
for(let t=0;t<1800000;t+=113){
  const now=1000+(t%2500),mark=words.find(w=>now>=w.startMs&&now<w.endMs);
  if(!mark)continue;
  const got=sample(now,mark.text).result;
  for(const val of Object.values(got.face))assert(Number.isFinite(val)&&val>=0&&val<=1);
}
const rig=fs.readFileSync('components/visualizer/VocalRigV368.tsx','utf8');
const avatar=fs.readFileSync('components/visualizer/ThreeAvatar.tsx','utf8');
assert(rig.includes('refineAdvancedVocalV459('));
assert(rig.includes('lipV459.face[c]'));
assert(rig.includes('morph.delta=overlay'),'GLB source animation still preserved');
assert(avatar.match(/refineAdvancedVocalV459\(/g)?.length>=2,'both 3D head paths');
assert(avatar.match(/addAdvancedVocalHeadV459\(/g)?.length>=2,'both 3D head paths');
assert(avatar.includes('addExpressiveHeadV453('),'V453 overlay preserved');
assert(!fs.readFileSync('components/visualizer/advancedVocalPerformanceV459.ts','utf8').includes('localStorage'));
assert(Number(require('../package.json').version.match(/v(\d+)$/)?.[1])>=459);
console.log('PASS V459: V453 continuity, verified next-word transitions, closure and edit priority, 3D/GLB, silence and reduced motion, bounded head motion');
