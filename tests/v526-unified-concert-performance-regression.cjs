'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {load}=require('./helpers/ts-loader-v404.cjs');
const {sampleUnifiedWordV526:sample,coordinateRapFaceV526:face,coordinateRapDanceV526:dance,coordinateConcertLyricsV526:lyric}=load('components/visualizer/unifiedConcertPerformanceV526');
const texts=['Ich','bin','wieder','da','und','rappe','schnell','mit','dir','im','Beat'];
const words=texts.map((text,i)=>({text,startMs:1000+i*183,endMs:1160+i*183}));
const line={text:texts.join(' '),startMs:1000,endMs:3100,words};
const lyrics={synced:true,provider:'test',lines:[line]};
const input={lyrics,effectiveTimeMs:1240,genre:'Deutschrap',playing:true,reducedMotion:false};
const cue=sample(input);
assert(cue.verified&&cue.rapid&&cue.pulse>0&&cue.pulse<=1);
assert.equal(cue.wordStartMs,1183);
for(const args of [{playing:false},{reducedMotion:true},{genre:'Hardstyle'},{effectiveTimeMs:4000},
                   {lyrics:{synced:false,lines:[line]}},{lyrics:null},{effectiveTimeMs:NaN}]){
 assert.equal(sample({...input,...args}).verified,false);
}
const original=JSON.stringify(input);assert.deepEqual(sample(input),sample(input));assert.equal(JSON.stringify(input),original);
const mouth={jaw:.42,wide:.25,round:.12,lipsClosed:.92,smile:.1,brow:.13,blink:0,cheek:.19,squint:0};
const baseFace={active:true,activeV476:true,activeV499:true,activeV523:true,cadenceV523:'fast-verse',face:mouth,headPitchExtra:.01,headYawExtra:.015};
const refined=face(baseFace,input);
assert(refined!==baseFace&&refined.face.brow>mouth.brow&&refined.face.cheek>mouth.cheek);
for(const k of ['jaw','wide','round','lipsClosed','smile','blink','squint'])assert.equal(refined.face[k],mouth[k],`lip safety ${k}`);
assert.equal(refined.headYawExtra,baseFace.headYawExtra);
assert.equal(refined.headPitchExtra,baseFace.headPitchExtra);
for(const args of [{manualPriority:true},{reducedMotion:true},{playing:false},{genre:'Hardtekk'}])assert.equal(face(baseFace,{...input,...args}),baseFace);
assert.equal(face({...baseFace,activeV523:false},input).activeV523,false);
const accent={active:true,source:'word',confidence:'lyrics-word',role:'lead',lineIndex:0,wordIndex:1,head:.025,chest:.035,arms:.082,side:.4};
const baseDance={...input,trackId:'song',slot:0,count:1,authored:false};
const moved=dance(accent,baseDance);
assert(moved!==accent&&moved.arms<accent.arms&&moved.head>=accent.head);
for(const k of ['source','role','lineIndex','wordIndex','confidence','side'])assert.equal(moved[k],accent[k]);
const casting={active:true,lineIndex:0,singingSlots:[0],handoffFrom:null,phase:1,role:'lead'};
assert(dance(accent,{...baseDance,count:3,casting}).arms<accent.arms);
for(const args of [{count:3},{count:3,casting:{...casting,singingSlots:[2]}},
                   {count:3,slot:1,casting},{authored:true},{trackId:''},{playing:false},
                   {reducedMotion:true},{genre:'Hardtekk'}])assert.deepEqual(dance(accent,{...baseDance,...args}),accent);
assert.equal(dance({...accent,source:'line'},baseDance).arms,accent.arms);
const plate={readingBoost:1.08,plateOpacity:.9,wordMotionGain:.27,max3DWidth:1.91,rapidRap:true,textClass:'rapid-rap'};
const cueLyric=lyric(plate,{...input,active:true});assert(cueLyric!==plate&&cueLyric.wordMotionGain<plate.wordMotionGain);
for(const key of ['readingBoost','plateOpacity','max3DWidth','rapidRap','textClass'])assert.equal(cueLyric[key],plate[key]);
for(const opts of [{active:false},{reducedMotion:true},{genre:'Pop'},{playing:false},
                   {effectiveTimeMs:5000}])assert.equal(lyric(plate,{...input,active:true,...opts}),plate);
assert.equal(lyric({...plate,wordMotionGain:0},{...input,active:true}).wordMotionGain,0);
assert.equal(JSON.stringify(plate),JSON.stringify({...plate}));
for(const [name,path,tokens] of [
  ['GLB gestures','components/visualizer/useGltfVocalMotionV492.ts',['coordinateRapDanceV526(synchronizedRapV516','refineDeutschrapGestureV538(unifiedRapV526','correctAutomaticAccentV515(wordDanceV567']],
  ['GLB facial','components/visualizer/VocalRigV368.tsx',['coordinateRapFaceV526(lipV523','composeConcertFaceV503(wordFaceV567']],
  ['procedural','components/visualizer/ProceduralDancerAvatarV492.tsx',['coordinateRapFaceV526(lipV523','coordinateRapDanceV526(rapDynamicsV583.accent']],
  ['DOM lyrics','components/KineticLyrics.tsx',['coordinateConcertLyricsV526(v525','v526.wordMotionGain','lyricPlaybackFractionV477']],
  ['3D lyrics','components/visualizer/Lyrics3DScene.tsx',['coordinateConcertLyricsV526(visualV525','visualV526.wordMotionGain','lyricPlaybackFractionV477']]]){
 const src=fs.readFileSync(path,'utf8');for(const t of tokens)assert(src.includes(t),`${name} missing ${t}`);
}
const pkg=require('../package.json');assert(Number(pkg.version.match(/-v(\d+)$/)?.[1]||0)>=526);
assert(pkg.scripts['build:preflight'].includes('npm run test:v526 && npm run test:v526:types')); 
const source=fs.readFileSync('components/visualizer/unifiedConcertPerformanceV526.ts','utf8');
for(const forbidden of ['setInterval(', 'requestAnimationFrame(', 'new Audio(', 'mixamo'])assert(!source.includes(forbidden));
let cases=0;
for(const genre of ['Deutschrap','Hip Hop','Trap','Hardstyle','Hardtekk','Pop']){
 for(let i=0;i<7000;i++){
  const tick=800+(i%900)*4;
  const frame={...input,genre,effectiveTimeMs:tick,playing:i%43!==0,reducedMotion:i%59===0};
  const q=sample(frame);assert(Number.isFinite(q.pulse)&&q.pulse>=0&&q.pulse<=1);
  assert(Number.isFinite(q.phrase)&&q.phrase>=0&&q.phrase<=1);
  const l=lyric(plate,{...frame,active:i%7!==0});assert(l.wordMotionGain>=0&&l.wordMotionGain<=plate.wordMotionGain);
  const f=face(baseFace,frame);assert.equal(f.face.jaw,mouth.jaw);assert.equal(f.face.lipsClosed,mouth.lipsClosed);
  const d=dance(accent,{...frame,trackId:'song',slot:0,count:1,authored:false});
  assert(d.arms>=0&&d.arms<=accent.arms);assert(d.head>=0&&d.head<=.055);
  cases++;
 }
}
console.log(`PASS V526 unified concert: ${cases} simulated word/face/dance/lyrics frames, performer authority, karaoke and lip safety, stage hooks`);
