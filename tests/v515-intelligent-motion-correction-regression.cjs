'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {load}=require('./helpers/ts-loader-v404.cjs');
const {createMotionCorrectionStateV515:state,correctAutomaticAccentV515:correct,resetMotionCorrectionV515:reset,correctionAdviceV515:advice}=load('components/visualizer/intelligentMotionCorrectionV515');
const neutral={active:false,source:'none',lineIndex:-1,wordIndex:-1,role:'general',head:0,chest:0,arms:0,side:0,confidence:'none'};
const cue=(n=.1,side=1)=>({...neutral,active:true,source:'word',confidence:'lyrics-word',lineIndex:1,wordIndex:5,role:'lead',head:n*.7,chest:n*.5,arms:n,side});
const auto={playing:true,reducedMotion:false,authored:false,enabled:true};
let s=state();let c=cue();let out=correct(c,s,1/60,auto);assert(out.active);assert(out.arms>0&&out.arms<c.arms);assert.notEqual(out,c);
let prev=out;let processed=0;
for(let i=0;i<30000;i++){
 const delta=i%2===0?1/60:1/100;
 const t=cue(i%120<60?.105:.008,i%200<100?1:-1);
 out=correct(t,s,delta,auto);
 assert(Number.isFinite(out.head)&&Number.isFinite(out.chest)&&Number.isFinite(out.arms)&&Number.isFinite(out.side));
 assert(out.arms>=0&&out.arms<=.12&&Math.abs(out.side)<=1);
 assert(Math.abs(out.arms-prev.arms)<=.35*delta+1e-8);
 assert(Math.abs(out.head-prev.head)<=.26*delta+1e-8);
 assert.equal(out.role,t.role);assert.equal(out.confidence,t.confidence);assert.equal(out.source,t.source);
 prev=out;processed++;
}
assert(Math.abs(out.arms-cue(.008).arms)<.11);
const original=cue(.1);out=correct(original,s,.016,{...auto,authored:true});assert.strictEqual(out,original,'authored cue wins exactly');assert.equal(s.value.arms,0);
correct(c,s,.016,auto);assert(s.value.arms>0);
for(const context of [{...auto,playing:false},{...auto,reducedMotion:true},{...auto,enabled:false}]){
 const same=correct(c,s,.016,context);assert.equal(s.value.arms,0);assert.strictEqual(same,c);
 correct(c,s,.016,auto);
}
assert.strictEqual(correct(neutral,s,.016,auto),neutral);assert.equal(s.value.arms,0);
for(const dt of [NaN,Infinity,-.01,0,.3]){
 correct(c,s,.016,auto);assert.strictEqual(correct(c,s,dt,auto),c);assert.equal(s.value.arms,0);
}
for(const raw of [NaN,Infinity,-Infinity,1e8]){
 const bad=correct({...c,arms:raw,side:raw},s,.016,auto);
 assert(Number.isFinite(bad.arms)&&Number.isFinite(bad.side));
}
reset(s);assert(Object.values(s.value).every(x=>x===0));
for(const kind of ['joint-angle','motion-jump','foot-slide','body-lean']){
 const result=advice({kind,slot:1,at:.45,severity:.92,label:'',location:[0,1,0]});
 assert(result&&!result.automatic&&result.priority==='high'&&result.explanation.length>10);
 if(kind==='foot-slide')assert(result.explanation.includes('Standfuß'));
}
assert.equal(advice({kind:'foot-slide',slot:7,at:1,severity:1,label:'',location:[0,0,0]}),null);
assert.equal(advice({kind:'foot-slide',slot:0,at:1,severity:NaN,label:'',location:[0,0,0]}),null);
const hook=fs.readFileSync('components/visualizer/useGltfVocalMotionV492.ts','utf8');
const canvas=fs.readFileSync('components/visualizer/RealConcertPreviewCanvasV513.tsx','utf8');
const motion=fs.readFileSync('hooks/useAudioMotionEngine.ts','utf8');
assert(hook.includes('coordinateRapDanceV526(synchronizedRapV516')&&hook.includes('correctAutomaticAccentV515(wordDanceV567,motionCorrectionV515.current,delta')&&hook.includes('synchronizeRapAccentV516(dynamicRapV583.accent,'));
assert(hook.includes("authored:avatarMotionMode==='choreography'")&&hook.includes('correctionTrackV515.current'));
assert(hook.includes('musicMotionV468.updateMotion(audio,delta,isPlaying&&!reducedMotion&&(audioMotionEnabledV468??true),genreCue,correctedVocalV515,'));
assert(motion.includes('protectFootIK')&&motion.includes('genreMotion?:GenreMotionCueV471|null,vocalCue?:VocalDanceAccentV472|null'));
assert(canvas.includes('correctionAdviceV515(e)')&&canvas.includes('(nur Hinweis)'));
const pkg=require('../package.json');assert(Number(pkg.version.match(/-v(\d+)$/)?.[1]??0)>=515,'V515 preserved in later releases');
assert(pkg.scripts['build:preflight'].includes('npm run test:v515 && npm run test:v515:types && npm run test:v514'));
console.log(`PASS V515 Intelligent Motion Correction: ${processed} variable-FPS auto-accent frames, authored priority, safe reset, role integrity, advisory-only foot-sliding, V514 integration`);
