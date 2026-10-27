require('./helpers/threeAvatarSourcesV492.cjs').install();
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {load}=require('./helpers/ts-loader-v404.cjs');
const {enhanceExpressiveLipV453:enhance}=load('components/visualizer/expressiveLipSyncV453');
const {refineAdvancedVocalV459:advanced}=load('components/visualizer/advancedVocalPerformanceV459');
const {refineExpressiveLipV476:refine}=load('components/visualizer/expressiveLipSyncV476');
const words=[
 {text:'Bam',startMs:1000,endMs:1250},
 {text:'alle',startMs:1280,endMs:1520},
 {text:'oh',startMs:1550,endMs:1800},
 {text:'Mama',startMs:2050,endMs:2440},
 {text:'langsam',startMs:2590,endMs:3240},
];
const lyrics={provider:'spotify',synced:true,plainText:null,lines:[
 {startMs:1000,endMs:3300,text:'Bam alle oh Mama langsam',words},
 {startMs:5000,endMs:5800,text:'oh',words:[{text:'oh',startMs:5050,endMs:5700}]},
]};
const face={jaw:.31,wide:.19,round:.08,lipsClosed:.035,smile:.04,brow:.02,blink:.01,cheek:.02,squint:.03};
const ctx={playing:true,enabled:true,reducedMotion:false,intensity:88};
const cue=(at,word='Bam',extra={})=>({face:{...face},confidence:'word',effectiveTimeMs:at,vocal:{style:'rap',activeWord:word},...extra});
const sample=(at,word,context=ctx,source=cue(at,word))=>{
 const b453=enhance(lyrics,source,context);
 const b459=advanced(lyrics,b453,source,context);
 return {base:b459,out:refine(lyrics,b459,source,context)};
};
const r=sample(1110,'Bam');
assert(r.out.activeV476&&r.out.sourceV476==='timed-word'&&r.out.emphasisV476==='rapid');
assert(r.out.face.jaw>r.base.face.jaw&&r.out.face.wide>r.base.face.wide);
assert.equal(r.out.face.lipsClosed,r.base.face.lipsClosed,'never rewrite the closure channel');
assert(r.out.attackHz>r.base.attackHz&&r.out.attackHz<=48);
assert(r.out.face.cheek>r.base.face.cheek&&r.out.face.brow>r.base.face.brow);
assert.deepEqual(sample(1110,'Bam').out,r.out,'same clock = same result');
const round=sample(1640,'oh');
assert(round.out.face.round>round.base.face.round,'written o supports a restrained round shape');
const normal=sample(2830,'langsam');
assert(normal.out.activeV476&&!normal.out.rapid&&normal.out.emphasisV476==='sustained');
assert(normal.out.face.jaw<=normal.base.face.jaw+.01,'long word is subtle');
const protectedClosed=cue(1110,'Bam',{face:{...face,lipsClosed:.99,jaw:.008}});
const sealed=sample(1110,'Bam',ctx,protectedClosed);
assert.equal(sealed.out.face.lipsClosed,.99);
assert(sealed.out.face.jaw<=1-sealed.out.face.lipsClosed*.985+1e-10,'bilabial close still wins');
const edited=sample(1110,'Bam',{...ctx,editedWords:[{startMs:1000,text:'Bam'}]});
const audio=sample(1110,'Bam',{...ctx,preserveAudioMouth:true});
for (const {base,out} of [edited,audio]) {
 for (const c of ['jaw','wide','round','lipsClosed'])assert.equal(out.face[c],base.face[c],`${c}: protect authored or measured mouth`);
 assert.equal(out.attackHz,base.attackHz);
 assert.equal(out.releaseHz,base.releaseHz);
}
for(const patch of [
 {playing:false},{enabled:false},{reducedMotion:true},{manualSilent:true},
 {intensity:0},{intensity:Infinity},
]){
 const {base,out}=sample(1110,'Bam',{...ctx,...patch});
 assert.equal(out.activeV476,false,JSON.stringify(patch));
 assert.deepEqual(out.face,base.face);
}
for(const [ly,source] of [
 [null,cue(1110)],[{...lyrics,synced:false},cue(1110)],
 [lyrics,cue(800)],[lyrics,cue(1500,'other')],
 [lyrics,cue(1110,'Bam',{confidence:'line'})],
 [lyrics,cue(NaN)],[lyrics,cue(3450,'langsam')],
]){
 const base=advanced(ly,enhance(ly,source,ctx),source,ctx),out=refine(ly,base,source,ctx);
 assert(!out.activeV476);
 assert.deepEqual(out.face,base.face,'never fabricate timing or mouth shape');
}
const singerSilent=sample(1110,'Bam',{...ctx,manualSilent:true});
assert(!singerSilent.out.activeV476,'no simulated vocals for manually excluded singer');
for(let t=0;t<1800000;t+=137){
 const at=1000+(t%2300);
 const word=words.find(w=>at>=w.startMs&&at<w.endMs);
 if(!word)continue;
 const {base,out}=sample(at,word.text);
 for(const [c,n] of Object.entries(out.face))assert(Number.isFinite(n)&&n>=0&&n<=1,`${c} ${at} ${n}`);
 assert(out.face.jaw<=1-out.face.lipsClosed*.985+1e-10);
 assert.equal(out.headPitchExtra,base.headPitchExtra,'V459 body cues preserved');
 assert.equal(out.headYawExtra,base.headYawExtra,'V459 body cues preserved');
}
const rig=fs.readFileSync('components/visualizer/VocalRigV368.tsx','utf8');
const avatar=fs.readFileSync('components/visualizer/ThreeAvatar.tsx','utf8');
assert(rig.includes('const lipV476=refineExpressiveLipV476('));
assert(rig.includes('lipV476.activeV476?lipV476.face[c]:lipV459.face[c]'));
assert(rig.includes('morph.delta=overlay'),'GLB authored motion preserved');
assert(avatar.includes('const lipV476=refineExpressiveLipV476('));
assert(avatar.includes('lipV476.face.jaw')||avatar.includes('lipV499.activeV499?lipV499.face:lipV476.face')||avatar.includes('const lipV503=composeConcertFaceV503(lipV499,concertV503)')||avatar.includes('const lipV503=composeConcertFaceV503(wordFaceV567,concertV503)')&&avatar.includes('coordinateRapFaceV526(lipV523') && avatar.includes('refineDeutschrapLipV523(argumentsLipSync.lyrics,lipV499'),'procedural avatar must preserve V476 through V499/V503 mouth pipeline');
assert(avatar.includes('addAdvancedVocalHeadV459('),'V459 head cues stay authoritative');
const src=fs.readFileSync('components/visualizer/expressiveLipSyncV476.ts','utf8');
assert(!/Math\.random|Date\.now|localStorage|AudioContext/.test(src),'no nondeterministic or invasive timing');
const pkg=require('../package.json');
assert(Number(pkg.version.match(/^0\.1\.0-v(\d+)$/)?.[1])>=476, 'V476 regression remains valid in newer releases');
assert(pkg.scripts['build:preflight'].includes('npm run test:v476 && npm run test:v476:types'));
console.log('PASS V476: verified word-bounded shaping, fast rap coarticulation, closures/audio/manual author priority, pause/seeks, deterministic 30-minute playback, GLB and procedural render paths');
