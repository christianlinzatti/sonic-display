'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {load}=require('./helpers/ts-loader-v404.cjs');
const {refineNaturalConcertPerformanceV586:refine}=load('components/visualizer/naturalConcertPerformanceV586');
let passed=0;
function test(label,fn){try{fn();passed++;}catch(e){e.message=`V586 ${label}: ${e.message}`;throw e;}}
const lyrics={synced:true,lines:[
 {startMs:1000,endMs:4000,words:[{text:'Dieser',startMs:1100,endMs:1500},{text:'Rap',startMs:1600,endMs:2100},{text:'bleibt',startMs:2250,endMs:2700},{text:'natürlich',startMs:3000,endMs:3600}]},
 {startMs:4400,endMs:7200,words:[{text:'Dichte',startMs:4500,endMs:4800},{text:'schnelle',startMs:4900,endMs:5190},{text:'Wörter',startMs:5300,endMs:5600},{text:'jetzt',startMs:5900,endMs:6200}]},
]};
const base={active:true,source:'word',confidence:'lyrics-word',lineIndex:0,wordIndex:1,role:'lead',head:.028,chest:.045,arms:.064,side:1};
const oldPose=Object.freeze({active:true,headPitch:.008,headYaw:.006,torsoLean:.012,armSwing:.009});
const defaults={lyrics,timeMs:1750,trackId:'song-586',slot:0,count:2,playing:true,rap:true,
 reducedMotion:false,authored:false,enabled:true,tier:'high',mode:'verse'};
const run=(accent=base,patch={},pose=oldPose)=>refine(accent,pose,{...defaults,...patch});
test('adds verified word upper-body pose',()=>{const r=run();assert(r.active);assert(r.pose.active);assert.equal(r.reason,'verified-word');assert(r.phraseBlend>0);});
test('original input left unchanged',()=>{const before=JSON.stringify(base),pose=JSON.stringify(oldPose);run();assert.equal(JSON.stringify(base),before);assert.equal(JSON.stringify(oldPose),pose);});
test('returns new bounded output without casting changes',()=>{const r=run();assert.notStrictEqual(r.accent,base);for(const k of ['role','source','confidence','lineIndex','wordIndex','side'])assert.equal(r.accent[k],base[k]);assert(r.accent.arms<=.11&&r.accent.chest<=.09);});
test('counterpose preserves existing headPitch and does not touch lips',()=>{const r=run();assert.equal(r.pose.headPitch,oldPose.headPitch);assert(!('jaw' in r.pose));assert(!('mouth' in r.pose));});
test('gentle phrase and word onset',()=>{const b={...base,wordIndex:0};assert(!run(b,{timeMs:1000}).active);const r=run(b,{timeMs:1101});assert(r.active);assert(Math.abs(r.pose.armSwing-oldPose.armSwing)<.002);});
test('end gap never starts a new invented word',()=>{const r=run(base,{timeMs:2140});assert(!r.active);assert.strictEqual(r.accent,base);assert.strictEqual(r.pose,oldPose);});
test('paused no-op identity',()=>{const r=run(base,{playing:false});assert.strictEqual(r.accent,base);assert.strictEqual(r.pose,oldPose);});
for(const [name,patch] of [
 ['no rap',{rap:false}],['disabled',{enabled:false}],['manual choreography',{authored:true}],
 ['reduced motion',{reducedMotion:true}],['low tier',{tier:'low'}],['invalid song',{trackId:''}],
 ['no lyrics',{lyrics:null}],['unsynced',{lyrics:{...lyrics,synced:false}}],
 ['bad time',{timeMs:Infinity}],['missing time',{timeMs:NaN}],
 ['slot negative',{slot:-1}],['slot noninteger',{slot:.25}],['slot outside count',{slot:2}],
 ['count zero',{count:0}],['count exceeds support',{count:5}],
 ['no dynamics',{mode:'off'}],['text-only adlib',{mode:'adlib-text'}],
])test(`${name} no-op and identity`,()=>{const r=run(base,patch);assert(!r.active);assert.strictEqual(r.accent,base);assert.strictEqual(r.pose,oldPose);});
for(const [name,patch] of [
 ['silence',{active:false}],['background',{role:'background'}],
 ['not a verified word',{source:'line'}],['line-only confidence',{confidence:'lyrics-line'}],
 ['missing word index',{wordIndex:-1}],['missing line',{lineIndex:30}],
 ['missing word',{wordIndex:20}],['empty token',{wordIndex:0}],
])test(`${name} no-op`,()=>{const r=run(patch.wordIndex===0?{...base,...patch}:{...base,...patch});if(patch.wordIndex===0){const missing={synced:true,lines:[{...lyrics.lines[0],words:[{text:'',startMs:1100,endMs:1500},...lyrics.lines[0].words.slice(1)]},lyrics.lines[1]]};const x=run({...base,...patch},{lyrics:missing,timeMs:1200});assert(!x.active);return;}assert(!r.active);assert.deepEqual(r.accent,{...base,...patch});});
test('anonymous ensemble cannot masquerade as singer',()=>{for(let count=2;count<=4;count++){const r=run({...base,role:'general'},{count});assert(!r.active);}});
test('unassigned solo general is allowed, without singer inference',()=>{const r=run({...base,role:'general'},{count:1});assert(r.active);assert.equal(r.accent.role,'general');});
test('known lead, feature, duet, reply, hook all preserve original role',()=>{for(const role of ['lead','feature','duet','reply','hook']){const r=run({...base,role},{count:4,slot:2});assert(r.active);assert.equal(r.accent.role,role);}});
test('balanced tier quieter than high',()=>{const hi=run(),lo=run(base,{tier:'balanced'});assert(Math.abs(lo.counterMotion)<=Math.abs(hi.counterMotion)+1e-12);});
test('dense rap reduces arm flapping',()=>{const r=run(base,{mode:'dense'});assert(r.accent.arms<base.arms);});
test('hook accents gently increased',()=>{const r=run(base,{mode:'hook'});assert(r.accent.arms>base.arms);});
test('song seek is stateless',()=>{const before=run();run(base,{timeMs:3200});run(base,{timeMs:6000});assert.deepEqual(run(),before);});
test('role-specific counterpose depends on slot but not randomness',()=>{const a=run(base,{count:4,slot:0}),b=run(base,{count:4,slot:1});assert.notEqual(a.counterMotion,b.counterMotion);assert.deepEqual(a,run(base,{count:4,slot:0}));});
for(const mode of ['verse','relaxed','dense','flow-transition','hook'])test(`bounded samples ${mode}`,()=>{
 const r=run(base,{mode});assert(r.active);
 for(const k of ['headYaw','headPitch','torsoLean','armSwing'])assert(Number.isFinite(r.pose[k]));
 assert(Math.abs(r.pose.headYaw)<=.017&&Math.abs(r.pose.torsoLean)<=.024&&Math.abs(r.pose.armSwing)<=.019);
});
test('frame-by-frame continuous conservative envelope',()=>{
 let prev=null,maxStep=0,seen=0;
 for(let ms=1600;ms<2100;ms+=5){const r=run(base,{timeMs:ms});if(!r.active)continue;
  if(prev)maxStep=Math.max(maxStep,Math.abs(r.pose.torsoLean-prev.pose.torsoLean),Math.abs(r.pose.armSwing-prev.pose.armSwing));
  prev=r;seen++;
 }assert(seen>40);assert(maxStep<.003,`frame jump ${maxStep}`);
});
test('high volume bounded simulation 12,000 playback samples',()=>{
 let active=0;
 for(let i=0;i<12000;i++){
   const slot=i%4,ms=1600+(i%95)*5;
   const r=run({...base,role:i%3===0?'feature':'lead'}, {timeMs:ms,slot,count:4,mode:['verse','dense','hook'][i%3]});
   if(r.active){active++;assert(Math.abs(r.counterMotion)<=1.01);assert(r.pose.armSwing>=-.019&&r.pose.armSwing<=.019);}
 }assert(active>10000);
});
const gltf=fs.readFileSync('components/visualizer/useGltfVocalMotionV492.ts','utf8');
const procedural=fs.readFileSync('components/visualizer/ProceduralDancerAvatarV492.tsx','utf8');
test('GLB pipeline shares V586 without new renderer',()=>{
 assert.match(gltf,/const concertV586=refineNaturalConcertPerformanceV586\(naturalBodyV564\.accent,naturalBodyV564\.pose,/);
 assert.match(gltf,/coordinateWordDanceV567\(concertV586\.accent/);
 assert.match(gltf,/correctedVocalV515\.active\?concertV586\.pose:null/);
});
test('procedural renderer shares V586 but feet and pelvis untouched',()=>{
 assert.match(procedural,/const concertV586=refineNaturalConcertPerformanceV586\(vocalV472,null,/);
 assert.match(procedural,/coordinateWordDanceV567\(concertV586\.accent/);
 assert.match(procedural,/concertV586\.pose\?\.torsoLean/);
});
test('V583 direct hooks retained',()=>{
 assert.match(gltf,/synchronizeRapAccentV516\(dynamicRapV583\.accent/);
 assert.match(procedural,/coordinateRapDanceV526\(rapDynamicsV583\.accent/);
});
test('no scheduling, synth speech, GLB editing or external requests',()=>{
 const code=fs.readFileSync('components/visualizer/naturalConcertPerformanceV586.ts','utf8');
 for(const danger of ['requestAnimationFrame(','useFrame(','setInterval(','fetch(','new AnimationClip','new AnimationMixer','new AudioContext','localStorage'])assert(!code.includes(danger),danger);
});
console.log(`PASS V586: ${passed} natural dance/rap coordination, casting, regression and integration checks`);
