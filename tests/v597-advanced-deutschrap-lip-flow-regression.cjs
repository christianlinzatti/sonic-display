'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {load}=require('./helpers/ts-loader-v404.cjs');
const {refineDeutschrapLipFlowV597:refine,rapLipFlowRateV597:rate}=load('components/visualizer/advancedDeutschrapLipFlowV597');
const {refineAdvancedRapArticulationV546:old}=load('components/visualizer/advancedDeutschrapArticulationV546');
let groups=0;const test=(label,fn)=>{try{fn();groups++}catch(e){e.message=`V597 ${label}: ${e.message}`;throw e;}};
const words=[
 {text:'Bam',startMs:1000,endMs:1210},
 {text:'oh',startMs:1235,endMs:1475},
 {text:'rage',startMs:1500,endMs:1730},
 {text:'gut',startMs:1750,endMs:1950},
 {text:'jetzt',startMs:1980,endMs:2180},
 {text:'Ruhe',startMs:2400,endMs:2760},
];
const lyrics={provider:'spotify',synced:true,plainText:null,lines:[{text:words.map(w=>w.text).join(' '),startMs:980,endMs:2820,words}]};
const face={jaw:.51,wide:.35,round:.15,lipsClosed:0,smile:.03,brow:.17,blink:.08,cheek:.10,squint:.05};
const src={face,metadata:{preserve:true}};
const opts={lyrics,effectiveTimeMs:1660,activeWord:'rage',playing:true,enabled:true,rap:true,verifiedWord:true,
 reducedMotion:false,roleAllowed:true,manualSilent:false,manualPriority:false,preserveAudioMouth:false,intensity:90};
const sample=(at,word='rage',options={},frame=src,tier='high')=>refine(frame,{...opts,effectiveTimeMs:at,activeWord:word,...options},tier);

test('connected word changes only tiny face and legitimate smoothing rates',()=>{
 const a=sample(1680);assert.equal(a.kind,'connected-flow');assert(a.active);
 assert(a.frame.face.jaw>=face.jaw&&a.frame.face.jaw-face.jaw<.008);
 assert(a.frame.face.round!==face.round||a.frame.face.wide!==face.wide);
 for(const c of ['lipsClosed','smile','brow','blink','cheek','squint'])assert.equal(a.frame.face[c],face[c]);
 assert(a.jawAttackRate>1&&a.jawAttackRate<1.076);
 assert(a.vowelAttackRate<1&&a.vowelAttackRate>.96);
 assert.equal(a.source,'verified-written-word');assert.deepEqual(a.frame.metadata,src.metadata);
});
test('original source never mutated and sampling deterministic',()=>{
 const before=JSON.stringify(src),a=sample(1680);assert.deepEqual(a,sample(1680));assert.equal(JSON.stringify(src),before);
});
test('phrase ending relaxes existing open jaw but never changes lip closure',()=>{
 const a=sample(2650,'Ruhe');assert(a.active);assert.equal(a.kind,'phrase-release');
 assert(a.frame.face.jaw<face.jaw&&a.frame.face.jaw>face.jaw-.019);
 assert.equal(a.frame.face.lipsClosed,face.lipsClosed);
});
test('early onset is unchanged',()=>{assert(!sample(1520).active);});
test('late word boundary cannot leak into silence',()=>{const a=sample(2200,'jetzt');assert(!a.active);assert.strictEqual(a.frame,src);});
test('new line and genuine break cannot be bridged',()=>{const a=sample(2270,'jetzt');assert(!a.active);});
test('bilabial onset mouth owner is preserved',()=>{
 const a=sample(1150,'Bam');assert(!a.active||a.frame.face.lipsClosed===face.lipsClosed);
 assert.equal(a.frame.face.jaw,face.jaw);
});
test('a following B/P/M prevents coarticulation',()=>{
 const b=[{text:'so',startMs:1000,endMs:1250},{text:'Bam',startMs:1270,endMs:1490}];
 const l={...lyrics,lines:[{text:'so Bam',startMs:1000,endMs:1600,words:b}]};
 assert.equal(sample(1215,'so',{lyrics:l}).kind,'none');
});
test('closed lip guard never opens B/P/M closure',()=>{
 const f={...src,face:{...face,lipsClosed:.96,jaw:.03}};
 const a=sample(1680,'rage',{},f);assert(!a.active);assert.strictEqual(a.frame,f);
});
test('partial closure cannot be lowered',()=>{
 const f={...src,face:{...face,lipsClosed:.11,jaw:.37}};
 const a=sample(1680,'rage',{},f);assert.equal(a.frame.face.lipsClosed,.11);
 assert(a.frame.face.jaw<=1-.11*.985+1e-9);
});
test('invalid face returns reference unchanged',()=>{
 for(const val of [NaN,-1,1.1,Infinity]){
  const f={...src,face:{...face,jaw:val}};const a=sample(1680,'rage',{},f);
  assert.equal(a.active,false);assert.strictEqual(a.frame,f);
 }
});
test('word mismatch never guesses singer or text',()=>{assert(!sample(1680,'Mäga').active);});
for(const [title,optsDiff] of Object.entries({pause:{playing:false},disabled:{enabled:false},notRap:{rap:false},
 unverified:{verifiedWord:false},wrongSinger:{roleAllowed:false},manualSilent:{manualSilent:true},
 manualFace:{manualPriority:true},reduced:{reducedMotion:true},audioMouth:{preserveAudioMouth:true},
 noTrackTime:{effectiveTimeMs:NaN},negativeTime:{effectiveTimeMs:-1},zeroStrength:{intensity:0},
 invalidStrength:{intensity:Infinity},noWord:{activeWord:null},missingLyrics:{lyrics:null},
 unsynced:{lyrics:{...lyrics,synced:false}},edited:{editedWords:[{startMs:1500,text:'rage'}]},
 expired:{effectiveTimeMs:2900},wrongText:{activeWord:'bad'},lineOnly:{lyrics:{...lyrics,lines:[{text:'line',startMs:1000,endMs:3000}]}}})){
 test(title+' bypass',()=>{const a=sample(1680,'rage',optsDiff);assert(!a.active);assert.strictEqual(a.frame,src);});
}
test('low tier bypass, balanced attenuates high',()=>{
 assert(!sample(1680,'rage',{},src,'low').active);
 const bal=sample(1680,'rage',{},src,'balanced'),high=sample(1680);
 assert(bal.active);assert(bal.jawAttackRate<high.jawAttackRate);
});
test('strength monotonic on matched verse',()=>{
 const a=sample(1680,'rage',{intensity:30});const b=sample(1680);
 assert(a.active&&a.jawAttackRate<b.jawAttackRate);
});
test('rate helper never edits lip seals, blink, brows, emotion',()=>{
 const a=sample(1680);
 for(const c of ['lipsClosed','blink','smile','brow','squint','cheek'])assert.equal(rate(a,c,true),1);
 assert.equal(rate(a,'jaw',true),a.jawAttackRate);
 assert.equal(rate(a,'jaw',false),a.jawReleaseRate);
 assert.equal(rate(a,'round',false),a.vowelReleaseRate);
 assert.equal(rate(a,'wide',true),a.vowelAttackRate);
 assert.equal(rate(sample(1520),'jaw',true),1);
});
test('real V546 → V597 closure stays authoritative at B/M/P onset',()=>{
 const before=old(src,{...opts,effectiveTimeMs:1003,activeWord:'Bam'});
 assert(before.active&&before.frame.face.lipsClosed>0);
 const after=refine(before.frame,{...opts,effectiveTimeMs:1003,activeWord:'Bam'},'high');
 assert.equal(after.frame.face.lipsClosed,before.frame.face.lipsClosed);
 assert(after.frame.face.jaw<=before.frame.face.jaw+1e-9);
});
test('V546 → V597 connected shaping retains V546 effects',()=>{
 const before=old(src,{...opts,effectiveTimeMs:1690,activeWord:'rage'});
 const after=refine(before.frame,{...opts,effectiveTimeMs:1690,activeWord:'rage'},'high');
 for(const c of ['lipsClosed','smile','blink'])assert.equal(before.frame.face[c],after.frame.face[c]);
});
test('GLB live morph and procedural mouth integrated after V546; one callback each',()=>{
 const glb=fs.readFileSync('components/visualizer/VocalRigV368.tsx','utf8');
 const proc=fs.readFileSync('components/visualizer/ProceduralDancerAvatarV492.tsx','utf8');
 for(const code of [glb,proc]){
  assert(code.indexOf('refineAdvancedRapArticulationV546(lipV538.frame,optionsV538)')<code.indexOf('refineDeutschrapLipFlowV597(lipV546.frame,optionsV538'));
  assert(code.includes('preserveAudioMouth:')&&code.includes('manualPriority:')&&code.includes('editedWords:')&&code.includes('roleAllowed:'));
 }
 assert(glb.includes('finalTargetV597=lipV597.active?lipV597.frame.face[c]:finalTargetV546'));
 assert(glb.includes('rapLipFlowRateV597(lipV597,c,attackingV581)'));
 assert(glb.indexOf('const finalTargetV546=')<glb.indexOf('const finalTargetV597='));
 assert(glb.includes('? target[c] :'), 'manual GLB morph preview wins');
 assert(proc.includes('mouthFaceV612.jaw')&&proc.includes('mouthFaceV612.wide'));
 assert(proc.indexOf('const mouthFaceV597=')<proc.indexOf('const mouthFaceV612='));
 assert.equal((glb.match(/useFrame\(/g)||[]).length,1);
 assert.equal((proc.match(/useFrame\(/g)||[]).length,1);
});
test('no fake phonemes, additional render loops or animation edits',()=>{
 const s=fs.readFileSync('components/visualizer/advancedDeutschrapLipFlowV597.ts','utf8');
 for(const code of ['useFrame(','requestAnimationFrame(','Date.now(','Math.random(','new AnimationMixer','new AnimationClip','AudioContext(','fetch('])assert(!s.includes(code));
});
test('25,000 sampled rapid rap times remain finite and bounded',()=>{
 for(let i=0;i<25000;i++){
  const ms=980+(i*37)%1900;
  const word=words.find(w=>ms>=w.startMs&&ms<w.endMs)?.text||null;
  const a=refine(src,{...opts,effectiveTimeMs:ms,activeWord:word,intensity:(i%110)},i%7===0?'balanced':'high');
  for(const [k,v] of Object.entries(a.frame.face))assert(Number.isFinite(v)&&v>=0&&v<=1,k);
  assert.equal(a.frame.face.lipsClosed,face.lipsClosed);
  assert(a.frame.face.jaw<=1-a.frame.face.lipsClosed*.985+1e-9);
  for(const k of ['jawAttackRate','jawReleaseRate','vowelAttackRate','vowelReleaseRate'])assert(a[k]>=.95&&a[k]<=1.08);
 }
});
console.log(`PASS V597: ${groups} test groups, 25,000 timed Deutschrap samples, V546/GLB/procedural integration`);
