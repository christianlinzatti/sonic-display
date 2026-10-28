'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {load}=require('./helpers/ts-loader-v404.cjs');
const {refineVocalFacialRealismV617:refine,vocalFacialRateV617:rate}=load('components/visualizer/advancedVocalFacialRealismV617');
const {refineExpressiveVocalFaceV612:older}=load('components/visualizer/expressiveVocalFaceV612');
const words=[
 {text:'Bam',startMs:1000,endMs:1210},{text:'ja',startMs:1230,endMs:1470},
 {text:'Druck',startMs:1495,endMs:1760},{text:'oh',startMs:1780,endMs:2050},
 {text:'Ruhe',startMs:2500,endMs:2860},
];
const lyrics={synced:true,provider:'spotify',lines:[{text:words.map(w=>w.text).join(' '),startMs:950,endMs:2900,words}]};
const face={jaw:.48,wide:.24,round:.16,lipsClosed:0,smile:.08,brow:.13,blink:.21,cheek:.14,squint:.09};
const base={face,metadata:{source:'original'}};
const opts={lyrics,effectiveTimeMs:1350,activeWord:'ja',playing:true,enabled:true,rap:true,verifiedWord:true,
 roleAllowed:true,manualSilent:false,manualPriority:false,reducedMotion:false,preserveAudioMouth:false,intensity:80};
const coherent={active:true,wordStartMs:1230,headPitch:-.016,headYaw:.012,source:'verified-timed-word'};
const eye={mode:'partner',yaw:-.032,pitch:-.02,weight:.6};
const sample=(diff={},tier='high',f=base,h=coherent,e=eye)=>refine(f,{...opts,...diff},tier,h,e);
let count=0;const test=(name,fn)=>{try{fn();count++}catch(e){e.message='V617 '+name+': '+e.message;throw e;}};

test('verified phrase smoothly refines existing expression',()=>{const a=sample();assert(a.active);assert.equal(a.source,'verified-timed-word');assert.equal(a.wordStartMs,1230);for(const k of ['brow','cheek','squint'])assert(a.frame.face[k]>base.face[k]);});
test('no invented mouth pose, even for visually open words',()=>{const a=sample();for(const k of ['jaw','wide','round','lipsClosed','smile','blink'])assert.equal(a.frame.face[k],base.face[k]);});
test('rise/fall pacing is subtle and bounded',()=>{const a=sample();assert(a.jawAttackRate>1&&a.jawAttackRate<1.056);assert(a.jawReleaseRate>=1&&a.jawReleaseRate<1.041);assert(a.vowelAttackRate>1);assert(a.vowelReleaseRate>=1);});
test('rate planner owns jaw and existing vowels only',()=>{const a=sample();for(const c of ['jaw','wide','round'])assert(rate(a,c,true)>=1);for(const c of ['lipsClosed','blink','smile','brow','cheek','squint','eye'])assert.equal(rate(a,c,true),1);});
test('bilabial attack cannot open lips or accelerate jaws',()=>{const a=sample({effectiveTimeMs:1100,activeWord:'Bam'},'high',base,null,null);assert(a.active);for(const c of ['jaw','wide','round'])assert.equal(rate(a,c,true),1);assert.equal(a.frame.face.lipsClosed,base.face.lipsClosed);});
test('anticipate a next B/P/M seal by not modifying mouth speed',()=>{const w=[{text:'so',startMs:3200,endMs:3450},{text:'Bumm',startMs:3470,endMs:3670}];const l={...lyrics,lines:[{text:'so Bumm',startMs:3170,endMs:3710,words:w}]};const a=sample({lyrics:l,effectiveTimeMs:3340,activeWord:'so'},'high',base,null,null);assert(a.active);assert.equal(rate(a,'jaw',true),1);assert.equal(rate(a,'wide',false),1);});
test('partially sealed lips never gain accelerated motion',()=>{const f={...base,face:{...base.face,lipsClosed:.85}};const a=sample({},'high',f);assert(a.active);assert.equal(rate(a,'jaw',true),1);assert.equal(a.frame.face.lipsClosed,.85);});
test('authored gaze direction is preserved, with only tiny additions',()=>{const a=sample();assert(a.headPitch<0&&a.headPitch>=-.004);assert(a.headYaw>0&&a.headYaw<=.002);assert(a.eyeYaw<0&&a.eyeYaw>=-.003);assert(a.eyePitch<0&&a.eyePitch>=-.003);});
test('solo cannot invent partner eyes',()=>{const a=sample({},'high',base,coherent,{...eye,mode:'audience',yaw:0});assert.equal(a.eyeYaw,0);});
test('no gaze when eye cue is unverified',()=>{for(const e of [null,{...eye,mode:'off'},{...eye,weight:0},{...eye,weight:NaN},{...eye,weight:1.4},{...eye,yaw:NaN}]){const a=sample({},'high',base,coherent,e);assert.equal(a.eyeYaw,0);assert.equal(a.eyePitch,0);}});
test('head and eyes require the same singer-bound timed word',()=>{for(const h of [null,{...coherent,active:false},{...coherent,wordStartMs:999},{...coherent,source:'none'},{...coherent,headPitch:NaN}]){const a=sample({},'high',base,h);assert.equal(a.headPitch,0);assert.equal(a.headYaw,0);assert.equal(a.eyeYaw,0);}});
test('head directions reflect existing cue, never new look targets',()=>{const a=sample({},'high',base,{...coherent,headYaw:-.015});assert(a.headYaw<0);assert.equal(sample({},'high',base,{...coherent,headYaw:0}).headYaw,0);});
test('balanced does less than high; low leaves original frame',()=>{const hi=sample(),bal=sample({},'balanced'),lo=sample({},'low');assert(bal.active&&hi.active);assert(bal.frame.face.cheek-base.face.cheek<hi.frame.face.cheek-base.face.cheek);assert(!lo.active);assert.strictEqual(lo.frame,base);});
test('no state leaks after pause, gap, seek or singer change',()=>{const a=sample();assert(a.active);for(const diff of [{playing:false},{roleAllowed:false},{effectiveTimeMs:2350,activeWord:'oh'},{effectiveTimeMs:500,activeWord:'ja'},{effectiveTimeMs:2900,activeWord:'Ruhe'}]){const b=sample(diff);assert(!b.active);assert.strictEqual(b.frame,base);}});
test('start and end envelopes do not fire outside word',()=>{for(const t of [1230,1469,1470]){const a=sample({effectiveTimeMs:t});assert(!a.active||a.frame.face.cheek-face.cheek<.003);}});
test('sparse word has expression but no artificial dense mouth acceleration',()=>{const a=sample({effectiveTimeMs:2680,activeWord:'Ruhe'},'high',base,null,null);assert(a.active);assert.equal(rate(a,'jaw',true),1);assert(a.frame.face.brow>base.face.brow);});
test('no mismatch or edited lyric overrides',()=>{assert(!sample({activeWord:'ja!'}).active);assert(!sample({editedWords:[{startMs:1230,text:'new'}]}).active);});
test('other lyric edits do not affect this word',()=>assert(sample({editedWords:[{startMs:1000,text:'Bam'}]}).active));
for(const [name,override] of Object.entries({paused:{playing:false},disabled:{enabled:false},notRap:{rap:false},unverified:{verifiedWord:false},
 wrongSinger:{roleAllowed:false},silent:{manualSilent:true},manual:{manualPriority:true},reduced:{reducedMotion:true},
 audioMouth:{preserveAudioMouth:true},unsynced:{lyrics:{...lyrics,synced:false}},noLyrics:{lyrics:null},
 noWord:{activeWord:''},invalidTime:{effectiveTimeMs:Infinity},negativeTime:{effectiveTimeMs:-4},
 noIntensity:{intensity:0},invalidIntensity:{intensity:NaN}})){
 test(name+' bypass',()=>{const a=sample(override);assert(!a.active);assert.strictEqual(a.frame,base);assert.equal(rate(a,'jaw',true),1);});
}
test('invalid morph values reject rather than propagate NaN',()=>{for(const bad of [NaN,Infinity,-.01,1.01]){const f={...base,face:{...face,cheek:bad}};const a=sample({},'high',f);assert(!a.active);assert.strictEqual(a.frame,f);}});
test('pure planner leaves references and input unchanged',()=>{const before=JSON.stringify({base,opts,coherent,eye});assert.deepEqual(sample(),sample());assert.equal(before,JSON.stringify({base,opts,coherent,eye}));assert.strictEqual(sample().frame.metadata,base.metadata);});
test('composes V612 without changing its lip seal or authored blink',()=>{const olderFrame=older(base,opts,'high');const a=refine(olderFrame.frame,opts,'high',coherent,eye);assert(a.active);assert.equal(a.frame.face.lipsClosed,olderFrame.frame.face.lipsClosed);assert.equal(a.frame.face.blink,olderFrame.frame.face.blink);assert(a.frame.face.cheek>=olderFrame.frame.face.cheek);});
test('GLB pipeline uses one frame loop and preserves calibration after V617',()=>{const src=fs.readFileSync('components/visualizer/VocalRigV368.tsx','utf8');assert(src.includes('refineVocalFacialRealismV617('));assert(src.includes('facialRealismV617.eyeYaw'));assert(src.includes('facialRealismV617.headPitch'));assert(src.includes('vocalFacialRateV617(facialRealismV617,c,attackingV581)'));assert(src.indexOf('const facialRealismV617=')<src.indexOf('calibrateMouthPoseV562(current.current'));assert.equal((src.match(/useFrame\(/g)||[]).length,1);});
test('procedural path uses same V617 without extra render loop',()=>{const src=fs.readFileSync('components/visualizer/ProceduralDancerAvatarV492.tsx','utf8');assert(src.includes('refineVocalFacialRealismV617('));assert(src.includes('vocalFacialRateV617(facialRealismV617'));assert(src.includes('mouthFaceV617.brow'));assert.equal((src.match(/useFrame\(/g)||[]).length,1);});
test('no network, timers or guessed voice classification',()=>{const src=fs.readFileSync('components/visualizer/advancedVocalFacialRealismV617.ts','utf8');for(const forbidden of ['useFrame(', 'setInterval(', 'setTimeout(', 'requestAnimationFrame(', 'fetch(', 'Math.random(', 'Date.now(', 'new AnimationMixer'])assert(!src.includes(forbidden));});
let frames=0;
for(let i=0;i<16000;i++){
 const ms=930+(i*37)%2050;
 const word=words.find(w=>ms>=w.startMs&&ms<w.endMs)?.text??null;
 const a=refine(base,{...opts,effectiveTimeMs:ms,activeWord:word,intensity:i%101},i%6===0?'balanced':'high',coherent,eye);
 for(const [k,v] of Object.entries(a.frame.face))assert(Number.isFinite(v)&&v>=0&&v<=1,`${k}: ${v}`);
 for(const k of ['jaw','wide','round','lipsClosed','blink','smile'])assert.equal(a.frame.face[k],face[k]);
 assert(Math.abs(a.headPitch)<=.00401&&Math.abs(a.headYaw)<=.00201);
 assert(Math.abs(a.eyePitch)<=.00301&&Math.abs(a.eyeYaw)<=.00301);
 for(const k of ['jawAttackRate','jawReleaseRate','vowelAttackRate','vowelReleaseRate'])assert(a[k]>=1&&a[k]<=1.056,`${k}: ${a[k]}`);
 frames++;
}
test('16,000 frame-local facial samples have bounded changes',()=>assert.equal(frames,16000));
console.log(`PASS V617: ${count} test groups, ${frames} facial timing snapshots, GLB and procedural wiring`);
