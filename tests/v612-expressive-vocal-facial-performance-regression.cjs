'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {load}=require('./helpers/ts-loader-v404.cjs');
const {refineExpressiveVocalFaceV612:refine,expressiveVocalRateV612:rate}=load('components/visualizer/expressiveVocalFaceV612');
const {refineDeutschrapLipFlowV597:v597}=load('components/visualizer/advancedDeutschrapLipFlowV597');
const {refineAdvancedRapArticulationV546:v546}=load('components/visualizer/advancedDeutschrapArticulationV546');
let groups=0;
const test=(name,run)=>{try{run();groups++}catch(e){e.message=`V612 ${name}: ${e.message}`;throw e;}};
const words=[
 {text:'Bam',startMs:1000,endMs:1210},{text:'oh',startMs:1235,endMs:1475},
 {text:'rage',startMs:1500,endMs:1730},{text:'gut',startMs:1750,endMs:1950},
 {text:'jetzt',startMs:1980,endMs:2180},{text:'Ruhe',startMs:2420,endMs:2700},
];
const lyrics={provider:'spotify',synced:true,lines:[{text:words.map(x=>x.text).join(' '),startMs:970,endMs:2720,words}]};
const face={jaw:.50,wide:.26,round:.14,lipsClosed:0,smile:.09,brow:.13,blink:.1,cheek:.12,squint:.07};
const source={face,origin:{id:'source'}};
const opt={lyrics,effectiveTimeMs:1660,activeWord:'rage',playing:true,enabled:true,rap:true,verifiedWord:true,
 roleAllowed:true,manualSilent:false,manualPriority:false,reducedMotion:false,preserveAudioMouth:false,intensity:90};
const coherent={active:true,wordStartMs:1500,source:'verified-timed-word',headPitch:-.015,headYaw:.01};
const sample=(time=1660,word='rage',extra={},base=source,tier='high',head=coherent)=>
 refine(base,{...opt,effectiveTimeMs:time,activeWord:word,...extra},tier,head);

test('Verified dense word expresses tiny cheeks, brows and vowel',()=>{const a=sample();assert(a.active);assert.equal(a.source,'verified-timed-word');assert(a.frame.face.cheek>face.cheek);assert(a.frame.face.brow>face.brow);assert(a.frame.face.wide>face.wide)});
test('No mutation and identity of metadata',()=>{const before=JSON.stringify(source);const a=sample();assert.deepEqual(sample(),a);assert.equal(JSON.stringify(source),before);assert.strictEqual(a.frame.origin,source.origin)});
test('Word-linked head pitch and yaw bounded',()=>{const a=sample();assert(a.headPitch<0&&a.headPitch>=-.009);assert(a.headYaw>0&&a.headYaw<=.003)});
test('Head cannot react without V581 verified matching timestamp',()=>{for(const head of [null,{...coherent,active:false},{...coherent,wordStartMs:1235},{...coherent,source:'none'},{...coherent,headPitch:NaN}]){const a=sample(1660,'rage',{},source,'high',head);assert.equal(a.headPitch,0);assert.equal(a.headYaw,0)}});
test('Head follows existing V581 direction only',()=>{assert(sample(1660,'rage',{},source,'high',{...coherent,headYaw:-.01}).headYaw<0);assert.equal(sample(1660,'rage',{},source,'high',{...coherent,headYaw:0}).headYaw,0)});
test('No extra B/P/M jaw movement',()=>{const a=sample(1130,'Bam');assert.equal(a.frame.face.jaw,face.jaw);assert.equal(a.frame.face.wide,face.wide);assert.equal(a.frame.face.round,face.round)});
test('Future bilabial word cannot be pre-opened',()=>{const w=[{text:'so',startMs:3000,endMs:3240},{text:'Bumm',startMs:3250,endMs:3450}];const l={...lyrics,lines:[{text:'so Bumm',startMs:3000,endMs:3480,words:w}]};const a=sample(3180,'so',{lyrics:l});assert(a.active);assert.equal(a.frame.face.jaw,face.jaw);assert.equal(a.frame.face.wide,face.wide)});
test('Exact lip seal, blink and smile ownership',()=>{const a=sample();for(const k of ['lipsClosed','blink','smile'])assert.equal(a.frame.face[k],face[k])});
test('Partial closure never weakens seal or overopens jaw',()=>{const f={...source,face:{...face,jaw:.38,lipsClosed:.14}};const a=sample(1660,'rage',{},f);assert.equal(a.frame.face.lipsClosed,.14);assert(a.frame.face.jaw<=1-.14*.985)});
test('Closed face does not create jaw motion',()=>{const f={...source,face:{...face,jaw:.02,lipsClosed:1}};const a=sample(1660,'rage',{},f);assert.equal(a.frame.face.jaw,.02);assert.equal(a.frame.face.wide,face.wide)});
test('Do not open previously closed jaw',()=>{const f={...source,face:{...face,jaw:0}};assert.equal(sample(1660,'rage',{},f).frame.face.jaw,0)});
test('Balanced tier attenuates high tier',()=>{const a=sample(),b=sample(1660,'rage',{},source,'balanced');assert(b.active);assert(b.frame.face.cheek-face.cheek<a.frame.face.cheek-face.cheek)});
test('Low tier is off with original frame',()=>{const a=sample(1660,'rage',{},source,'low');assert(!a.active);assert.strictEqual(a.frame,source)});
test('Word start/end fade and do not leak',()=>{for(const [time,w] of [[1500,'rage'],[1729,'rage'],[1730,'rage'],[2230,'jetzt'],[2400,'Ruhe']]){const a=sample(time,w);assert(!a.active||Math.abs(a.frame.face.cheek-face.cheek)<.011+1e-9)}});
test('Phrase after long gap is neutral',()=>{const a=sample(2600,'Ruhe');assert(!a.active);assert.strictEqual(a.frame,source)});
test('Missing real timed words are neutral',()=>{const a=sample(1650,'rage',{lyrics:{...lyrics,lines:[{text:'rage',startMs:1500,endMs:2000}]}});assert(!a.active)});
test('Mismatched current active word cannot override rig',()=>{assert(!sample(1660,'unknown').active)});
test('No phonetically guessed word with incorrect spelling',()=>{assert(!sample(1660,'Rage!').active)});
test('Edits own this written word even with changed spelling',()=>{assert(!sample(1660,'rage',{editedWords:[{startMs:1500,text:'edit'}]}).active)});
test('Edits elsewhere do not turn this word off',()=>{assert(sample(1660,'rage',{editedWords:[{startMs:1000,text:'Bam'}]}).active)});
test('Intensity monotonic and bounded',()=>{const a=sample(1660,'rage',{intensity:20}),b=sample();assert(a.active);assert(a.frame.face.cheek<b.frame.face.cheek)});
for(const [label,diff] of Object.entries({paused:{playing:false},disabled:{enabled:false},notRap:{rap:false},
 unverified:{verifiedWord:false},otherSinger:{roleAllowed:false},silencedSinger:{manualSilent:true},
 manualFacialPriority:{manualPriority:true},reducedMotion:{reducedMotion:true},
 audioDrivenMouth:{preserveAudioMouth:true},noSync:{lyrics:{...lyrics,synced:false}},
 missingLyrics:{lyrics:null},wrongTime:{effectiveTimeMs:NaN},negativeTime:{effectiveTimeMs:-20},
 expired:{effectiveTimeMs:7000},noActiveWord:{activeWord:''},zeroIntensity:{intensity:0},
 invalidIntensity:{intensity:Infinity}})){
 test(label+' exact bypass',()=>{const a=sample(1660,'rage',diff);assert(!a.active);assert.strictEqual(a.frame,source)});
}
test('Invalid rigs never modified',()=>{for(const v of [-.01,1.01,NaN,Infinity]){const f={...source,face:{...face,wide:v}};const a=sample(1660,'rage',{},f);assert(!a.active);assert.strictEqual(a.frame,f)}});
test('No closure rate or unrelated morph rates affected',()=>{const a=sample();for(const c of ['lipsClosed','blink','smile','brow','cheek','squint','eye'])assert.equal(rate(a,c,true),1);assert(rate(a,'jaw',true)>1);assert(rate(a,'wide',true)<1);assert(rate(a,'round',false)>1)});
test('Inactive rate neutral',()=>{const a=sample(1660,'rage',{},source,'low');for(const c of ['jaw','wide','round','lipsClosed'])assert.equal(rate(a,c,true),1)});
test('V546 → V597 → V612 maintains real bilabial seal',()=>{const a=v546(source,{...opt,effectiveTimeMs:1010,activeWord:'Bam'});assert(a.active);const b=v597(a.frame,{...opt,effectiveTimeMs:1010,activeWord:'Bam'},'high');const c=refine(b.frame,{...opt,effectiveTimeMs:1010,activeWord:'Bam'},'high');assert.equal(c.frame.face.lipsClosed,a.frame.face.lipsClosed);assert.equal(c.frame.face.jaw,a.frame.face.jaw)});
test('GLB has single frame loop and real scanned head bone',()=>{const s=fs.readFileSync('components/visualizer/VocalRigV368.tsx','utf8');assert(s.includes('refineExpressiveVocalFaceV612(\n      expressiveFrameV581,optionsV538'));assert(s.includes('expressiveVocalRateV612(expressiveVocalV612,c,attackingV581)'));assert(s.includes('expressivePitchV612'));assert(s.includes('headBoneV581'));assert.equal((s.match(/useFrame\(/g)||[]).length,1)});
test('GLB manual demo and V562 calibration remain higher priority',()=>{const s=fs.readFileSync('components/visualizer/VocalRigV368.tsx','utf8');assert(s.indexOf('const expressiveVocalV612=')<s.indexOf('calibrateMouthPoseV562(current.current'));assert(s.includes('manualPriority:authoredPriorityV499||demoV370'));assert(s.includes('!previewTargetV383 && profileV370?.mouthCalibrationV562?.enabled'))});
test('Procedural path uses same V612 without extra render loop',()=>{const s=fs.readFileSync('components/visualizer/ProceduralDancerAvatarV492.tsx','utf8');assert(s.includes('refineExpressiveVocalFaceV612(lipV597.frame,optionsV538'));assert(s.includes('mouthFaceV612.jaw'));assert(s.includes('mouthFaceV612.wide'));assert(s.includes('mouthFaceV612.brow'));assert.equal((s.match(/useFrame\(/g)||[]).length,1)});
test('No fake phoneme inference or network/inertial state',()=>{const s=fs.readFileSync('components/visualizer/expressiveVocalFaceV612.ts','utf8');for(const forbidden of ['useFrame(', 'setTimeout(', 'setInterval(', 'requestAnimationFrame(', 'fetch(', 'Date.now(', 'Math.random(', 'new AnimationMixer', 'new ShaderMaterial'])assert(!s.includes(forbidden))});
let frames=0;
for(let i=0;i<25000;i++){
 const ms=950+(i*47)%1850;
 const active=words.find(w=>ms>=w.startMs&&ms<w.endMs)?.text??null;
 const a=refine(source,{...opt,effectiveTimeMs:ms,activeWord:active,intensity:i%101},i%7===0?'balanced':'high',coherent);
 for(const [k,v] of Object.entries(a.frame.face))assert(Number.isFinite(v)&&v>=0&&v<=1,`${k}:${v}`);
 assert.equal(a.frame.face.lipsClosed,face.lipsClosed);assert.equal(a.frame.face.blink,face.blink);
 assert(Math.abs(a.headPitch)<=.00901&&Math.abs(a.headYaw)<=.00301);
 for(const c of ['jawAttackRate','jawReleaseRate','vowelAttackRate','vowelReleaseRate'])assert(a[c]>=.974&&a[c]<=1.046,`${c}: ${a[c]}`);
 frames++;
}
test('25,000 verified and unmatched word snapshots bounded',()=>assert.equal(frames,25000));
console.log(`PASS V612: ${groups} regression groups, ${frames} timed face snapshots, GLB and procedural wiring`);
