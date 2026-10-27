'use strict';
require('./helpers/threeAvatarSourcesV492.cjs').install();
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {load}=require('./helpers/ts-loader-v404.cjs');
const {enhanceExpressiveLipV453:enhance}=load('components/visualizer/expressiveLipSyncV453');
const {refineAdvancedVocalV459:advanced}=load('components/visualizer/advancedVocalPerformanceV459');
const {refineExpressiveLipV476:extra}=load('components/visualizer/expressiveLipSyncV476');
const {refineNaturalVocalExpressionV499:refine}=load('components/visualizer/naturalVocalExpressionV499');
const segments=[
 {startMs:1000,endMs:4000,leadSlot:0,partnerSlot:1,style:'solo',strength:90},
 {startMs:4000,endMs:8000,leadSlot:1,partnerSlot:0,style:'solo',strength:92},
 {startMs:8000,endMs:10000,leadSlot:1,partnerSlot:0,style:'solo',strength:95},
 {startMs:10000,endMs:12000,leadSlot:0,partnerSlot:1,style:'duet',strength:90},
 {startMs:12000,endMs:14000,leadSlot:2,partnerSlot:3,style:'hook',strength:95},
];
const words=[
 {text:'Bam',startMs:4000,endMs:4330},
 {text:'alle',startMs:4800,endMs:5220},
 {text:'oh',startMs:7650,endMs:8000},
 {text:'Mama',startMs:8000,endMs:8420},
 {text:'mit',startMs:10100,endMs:10450},
 {text:'uns',startMs:12000,endMs:12450},
 {text:'noch',startMs:13700,endMs:14000},
];
const lyrics={provider:'spotify',synced:true,plainText:null,lines:[{startMs:3900,endMs:14100,text:'Bam alle oh Mama mit uns noch',words}]};
const pose={jaw:.25,wide:.13,round:.07,lipsClosed:.02,smile:.05,brow:.07,blink:.01,cheek:.04,squint:.03};
const ctx={playing:true,enabled:true,reducedMotion:false,intensity:92};
const input={trackId:'song',cueTrackId:'song',playing:true,enabled:true,reducedMotion:false,
 avatarSlot:1,castCount:4,segments};
const sample=(time,slot=1,patch={},context=ctx,word)=>{
 const mark=words.find(w=>time>=w.startMs&&time<w.endMs);
 const source={face:{...pose},confidence:'word',effectiveTimeMs:time,vocal:{style:'rap',activeWord:word??mark?.text??''}};
 const baseline=advanced(lyrics,enhance(lyrics,source,context),source,context);
 const frame=extra(lyrics,baseline,source,context);
 const out=refine(baseline,frame,context,{...input,avatarSlot:slot,progressMs:time,...patch});
 return {baseline,frame,out};
};
const start=sample(4001),early=sample(4050),late=sample(4160),middle=sample(4950);
for(const item of [start,early,late,middle])assert(item.out.activeV499);
assert(start.out.roleEnvelopeV499>0&&start.out.roleEnvelopeV499<early.out.roleEnvelopeV499);
assert(early.out.roleEnvelopeV499<late.out.roleEnvelopeV499);
assert.equal(middle.out.roleEnvelopeV499,1);
assert.equal(start.out.transitionV499,'enter');
assert.equal(middle.out.transitionV499,'sustain');
assert(middle.frame.face.jaw>middle.baseline.face.jaw);
for(const channel of ['jaw','wide','round','cheek','brow','squint']){
 assert(Math.abs(start.out.face[channel]-start.baseline.face[channel])<=
   Math.abs(start.frame.face[channel]-start.baseline.face[channel])+1e-12,
   `${channel} additive V476 contribution never amplified`);
}
assert(start.out.face.jaw>=start.baseline.face.jaw);
assert(start.out.face.jaw<=start.frame.face.jaw);
assert.equal(start.out.face.lipsClosed,start.frame.face.lipsClosed);
assert.equal(start.out.face.blink,start.frame.face.blink);
assert.equal(start.out.face.smile,start.frame.face.smile);
assert.equal(start.out.attackHz,start.frame.attackHz,'rap attack untouched');
assert.equal(start.out.closureHz,start.frame.closureHz,'bilabial closure remains authoritative');
assert(start.out.headPitchExtra===start.baseline.headPitchExtra*start.out.roleEnvelopeV499);
assert.deepEqual(sample(4050).out,early.out,'timestamp evaluation is deterministic');
const end=sample(7950);
assert(end.out.activeV499&&end.out.transitionV499==='exit');
assert(end.out.roleEnvelopeV499<1);
// The same singer's continuous performance does not fade between authored segments.
const continued=sample(8050);
assert(continued.out.activeV499&&continued.out.roleEnvelopeV499===1,
  'same singer continuing across a segment boundary does not restart');
const duet=sample(10150,0),duetPartner=sample(10150,1);
assert(duet.out.activeV499&&duetPartner.out.activeV499,'both confirmed duet singers are supported');
const silent=sample(10150,2);
assert(!silent.out.activeV499,'unassigned singers do not receive a new expression');
const group=sample(12100,3);
assert(group.out.activeV499,'authored hook supports all four cast slots');
const nextEnd=sample(13950,2);
assert(nextEnd.out.activeV499&&nextEnd.out.roleEnvelopeV499<1);
const protectedClosure={...ctx,editedWords:[{startMs:4000,text:'Bam'}]};
const edited=sample(4050,1,{},protectedClosure);
assert.equal(edited.out.face.jaw,edited.frame.face.jaw);
assert.equal(edited.out.face.lipsClosed,edited.frame.face.lipsClosed);
const audio=sample(4050,1,{}, {...ctx,preserveAudioMouth:true});
assert(!audio.out.activeV499);
assert.deepEqual(audio.out.face,audio.frame.face);
for (const patch of [
 {trackId:'old'},{cueTrackId:'wrong'},{playing:false},{enabled:false},
 {reducedMotion:true},{manualPriority:true},{castCount:1},{avatarSlot:9},
 {segments:[]},{progressMs:Infinity},
]){
 const {out,frame}=sample(4050,1,patch);
 assert.equal(out.activeV499,false,JSON.stringify(patch));
 assert.deepEqual(out.face,frame.face);
}
for (const patch of [{playing:false},{reducedMotion:true},{manualSilent:true},{enabled:false}]){
 const {out,frame}=sample(4050,1,{}, {...ctx,...patch});
 assert.equal(out.activeV499,false,JSON.stringify(patch));
 assert.deepEqual(out.face,frame.face);
}
const noWord=sample(5500);
assert(!noWord.out.activeV499,'never fabricate word timing');
const noSinger=sample(4050,0);
assert(!noSinger.out.activeV499,'non-lead solo avatar remains unaffected');
// Overlaps and short gaps use the same editor-last-wins singer contract.
const overlapping=[{...segments[0],endMs:4100},segments[1]];
assert(sample(4050,1,{segments:overlapping}).out.activeV499);
const sameGap=[{...segments[0],leadSlot:1,endMs:3730},segments[1]];
assert.equal(sample(4050,1,{segments:sameGap}).out.roleEnvelopeV499,1);
const otherGap=[{...segments[0],endMs:3730},segments[1]];
assert(sample(4050,1,{segments:otherGap}).out.roleEnvelopeV499<1);
const longerGap=[{...segments[0],leadSlot:1,endMs:3000},segments[1]];
assert(sample(4050,1,{segments:longerGap}).out.roleEnvelopeV499<1);
const invalid=[{...segments[0],leadSlot:30},segments[1]];
assert(sample(4050,1,{segments:invalid}).out.activeV499);
// 30-minute deterministic synthetic playback; no state accumulation.
for(let clock=0;clock<1800000;clock+=103){
 const time=4000+(clock%330);
 const {out}=sample(time);
 for(const [k,v] of Object.entries(out.face))assert(Number.isFinite(v)&&v>=0&&v<=1,`${k} ${time}`);
 assert(out.roleEnvelopeV499>=0&&out.roleEnvelopeV499<=1);
 assert(out.face.jaw<=1-out.face.lipsClosed*.985+1e-10);
}
const rig=fs.readFileSync('components/visualizer/VocalRigV368.tsx','utf8');
const proc=fs.readFileSync('components/visualizer/ProceduralDancerAvatarV492.tsx','utf8');
const gltf=fs.readFileSync('components/visualizer/gltfVocalPerformanceV492.ts','utf8');
const parent=fs.readFileSync('components/visualizer/GltfDancerAvatarV492.tsx','utf8');
assert(rig.includes('refineNaturalVocalExpressionV499(lipV459,lipV476'));
assert(rig.includes('lipV499.activeV499?lipV499.face[c]:mouthTargetV476'), 'V499 fallback stays present after optional V523');
assert(rig.includes('const lipV523=refineDeutschrapLipV523')&&rig.includes('coordinateRapFaceV526(lipV523')&&rig.includes('composeConcertFaceV503(wordFaceV567,concertFaceV503)'), 'V523 only builds on V499 before V503');
assert(proc.includes('refineNaturalVocalExpressionV499(lipV459,lipV476'));
assert((proc.includes('const lipV503=composeConcertFaceV503(lipV499,concertV503)')||proc.includes('coordinateRapFaceV526(lipV523')&&proc.includes('const lipV503=composeConcertFaceV503(wordFaceV567,concertV503)')&&proc.includes('refineDeutschrapLipV523(argumentsLipSync.lyrics,lipV499')) && proc.includes('const lipV510=composeExpressiveRapFaceV510(lipV503,expressiveRapV510)') && proc.includes('const mouthFaceV499=lipV510.face'),'V503 must layer over V499 rather than discard it');
assert(gltf.includes('refineNaturalVocalExpressionV499(lipHeadV459,lipHeadV476'));
assert((gltf.includes('addExpressiveHeadV453(rapBodyV510,lipHeadV453),lipHeadV499')||gltf.includes('addExpressiveHeadV453(rapBodyV510,lipHeadV453),lipHeadV523')&&gltf.includes('refineDeutschrapLipV523(propsLipSyncV367?.lyrics??null,lipHeadV499')) && gltf.includes('composeExpressiveRapStageV510(rapBodyV503,expressiveRapV510)'),'V503 keeps V499 vocal head animation');
assert(parent.includes('trackId:track?.id??""'));
assert(parent.includes('trackId={track?.id??""}'));
assert(parent.includes('authoredPriorityV499={avatarMotionMode==="choreography"||!!stableLibraryClip}'));
assert(rig.includes('manualPriority:authoredPriorityV499'));
const src=fs.readFileSync('components/visualizer/naturalVocalExpressionV499.ts','utf8');
assert(!/Math\.random|Date\.now|localStorage|AudioContext|useFrame|AnimationMixer/.test(src));
const pkg=require('../package.json');
assert(Number(pkg.version.match(/^0\.1\.0-v(\d+)$/)?.[1])>=499,'V499 regression must remain valid in later releases');
assert(pkg.scripts['build:preflight'].includes('npm run test:v499 && npm run test:v499:types && npm run test:v498'));
console.log('PASS V499: deterministic manual-timeline vocal micro-expression, continuity, rap articulation, synced word bounds, priority/fallback, GLB and procedural wiring');
