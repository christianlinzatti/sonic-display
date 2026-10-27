'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs');
const {load}=require('./helpers/ts-loader-v404.cjs');
const {refineDeutschrapLipV523:refine}=load('components/visualizer/advancedDeutschrapLipSyncV523');
const {enhanceExpressiveLipV453:enhance}=load('components/visualizer/expressiveLipSyncV453');
const {refineAdvancedVocalV459:advanced}=load('components/visualizer/advancedVocalPerformanceV459');
const {refineExpressiveLipV476:polish}=load('components/visualizer/expressiveLipSyncV476');
const {refineNaturalVocalExpressionV499:roles}=load('components/visualizer/naturalVocalExpressionV499');
const words=[
 {text:'Ich',startMs:1000,endMs:1220},
 {text:'bin',startMs:1240,endMs:1440},
 {text:'mit',startMs:1470,endMs:1690},
 {text:'Bam',startMs:1720,endMs:1930},
 {text:'dabei',startMs:1970,endMs:2220},
 {text:'Pause',startMs:3100,endMs:3450},
 {text:'Boom',startMs:3470,endMs:3730},
 {text:'Ende',startMs:3760,endMs:4160}
];
const lyrics={provider:'spotify',synced:true,plainText:null,lines:[
  {text:words.map(w=>w.text).join(' '),startMs:900,endMs:4300,words}]};
const p={jaw:.31,wide:.15,round:.12,lipsClosed:.02,smile:.05,brow:.08,blink:.23,cheek:.04,squint:.04};
const context={playing:true,enabled:true,reducedMotion:false,intensity:90,roleAllowed:true};
const evalFrame=(time,overrides={},cueOverrides={},frameOverrides={})=>{
  const mark=words.find(w=>time>=w.startMs&&time<w.endMs);
  const cue={face:{...p},effectiveTimeMs:time,confidence:'word',vocal:{style:'rap',activeWord:mark?.text??''},...cueOverrides};
  const options={...context,...overrides};
  const v453=enhance(lyrics,cue,options);
  const v459=advanced(lyrics,v453,cue,options);
  const v476=polish(lyrics,v459,cue,options);
  const v499=roles(v459,v476,options,{trackId:'none',cueTrackId:'none',progressMs:time,playing:true,enabled:false,reducedMotion:false,castCount:1,avatarSlot:0,segments:[]});
  const input={...v499,...frameOverrides};
  return {cue,input,out:refine(lyrics,input,cue,options)};
};
const fast=evalFrame(1340);assert(fast.out.activeV523&&fast.out.cadenceV523==='fast-verse');
assert(fast.out.face.jaw>=fast.input.face.jaw);
assert(fast.out.face.jaw-fast.input.face.jaw<=.018);
assert.equal(fast.out.face.lipsClosed,fast.input.face.lipsClosed);
assert.equal(fast.out.face.blink,fast.input.face.blink);
assert.equal(fast.out.face.smile,fast.input.face.smile);
assert(fast.out.headPitchExtra<fast.input.headPitchExtra);

assert.deepEqual(evalFrame(1340).out,fast.out,'seek-safe deterministic');
// Late word blends to next word only for a verified adjacent timing with NO bilabial onset.
const blend=evalFrame(1645);assert(blend.out.activeV523);
assert.equal(blend.out.face.round,blend.input.face.round,'never anticipate a B/P/M onset');
const preB=evalFrame(1900);assert(preB.out.activeV523);
const pause=evalFrame(2800);assert(!pause.out.activeV523);
const away=evalFrame(500);assert(!away.out.activeV523);
for(const opts of [{playing:false},{reducedMotion:true},{enabled:false},{manualSilent:true},{roleAllowed:false},{intensity:0},{preserveAudioMouth:true},{editedWords:[{startMs:1240,text:'bin'}]}]){
 const {out,input}=evalFrame(1340,opts);
 assert.equal(out.activeV523,false,JSON.stringify(opts));assert.deepEqual(out.face,input.face);
}
const line=evalFrame(1340,{}, {confidence:'line'});assert(!line.out.activeV523);
const singing=evalFrame(1340,{}, {vocal:{style:'singing',activeWord:'bin'}});assert(!singing.out.activeV523);
const wrong=evalFrame(1340,{}, {vocal:{style:'rap',activeWord:'other'}});assert(!wrong.out.activeV523);
const closed=evalFrame(1340,{}, {},{face:{...fast.input.face,lipsClosed:.89,jaw:.09}});
assert.equal(closed.out.face.lipsClosed,.89);assert.equal(closed.out.face.jaw,.09);

const authored=evalFrame(1340,{authoredBody:true});
assert.equal(authored.out.headPitchExtra,authored.input.headPitchExtra);
assert.equal(authored.out.headYawExtra,authored.input.headYawExtra);

let count=0;
for(let i=0;i<36000;i++){
 const at=1000+(i*37)%3200;
 const o=i%17===0?{playing:false}:i%23===0?{manualSilent:true}:{};
 const {out,input}=evalFrame(at,o);
 assert(Number.isFinite(out.face.jaw)&&Number.isFinite(out.headPitchExtra));
 assert(out.face.jaw>=0&&out.face.jaw<=1);
 assert(out.face.lipsClosed===input.face.lipsClosed);
 if(o.playing===false||o.manualSilent===true)assert.deepEqual(out.face,input.face);
 count++;
}
const proc=fs.readFileSync('components/visualizer/ProceduralDancerAvatarV492.tsx','utf8');
const glb=fs.readFileSync('components/visualizer/gltfVocalPerformanceV492.ts','utf8');
assert(proc.includes('const lipV523=refineDeutschrapLipV523')&&proc.includes('coordinateRapFaceV526(lipV523')&&proc.includes('composeConcertFaceV503(wordFaceV567,concertV503)'));
const morph=fs.readFileSync('components/visualizer/VocalRigV368.tsx','utf8');
assert(glb.includes('const lipHeadV523=refineDeutschrapLipV523'));
assert(morph.includes('const lipV523=refineDeutschrapLipV523')&&morph.includes('coordinateRapFaceV526(lipV523')&&morph.includes('composeConcertFaceV503(wordFaceV567,concertFaceV503)'));
assert(morph.includes('wordFaceV567.activeV523?wordFaceV567.face[c]:lipV499.activeV499?lipV499.face[c]:mouthTargetV476'));
assert(morph.includes('const authored=Math.max(0,Math.min(1,inf[morph.index]-morph.delta))'),'GLB authored morphs preserved');
assert(!fs.readFileSync('components/visualizer/advancedDeutschrapLipSyncV523.ts','utf8').includes('requestAnimationFrame('));
const pkg=require('../package.json');
assert(Number(pkg.version.match(/-v(\d+)$/)?.[1]??0)>=523);
assert(pkg.scripts['build:preflight'].includes('npm run test:v523 && npm run test:v523:types && npm run test:v522'));
console.log(`PASS V523: ${count} timed-verse simulations + bilabial/edit/audio/singer priority + GLB/procedural wiring`);
