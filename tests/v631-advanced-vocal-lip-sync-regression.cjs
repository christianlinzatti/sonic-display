'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {load}=require('./helpers/ts-loader-v404.cjs');
const {planAdvancedVocalLipSyncV631:plan,vocalMouthRateV631:rate}=load('components/visualizer/advancedVocalLipSyncV631');
const words=[
 {text:'Bam',startMs:1000,endMs:1190},
 {text:'ja',startMs:1210,endMs:1450},
 {text:'Druck',startMs:1470,endMs:1720},
 {text:'oh',startMs:1740,endMs:1970},
 {text:'Ruhe',startMs:2540,endMs:2880},
 {text:'aber',startMs:3000,endMs:3240},
 {text:'schnell',startMs:3270,endMs:3500},
 {text:'weich',startMs:3900,endMs:4140},
];
const lyrics={synced:true,provider:'spotify',lines:[{text:words.map(w=>w.text).join(' '),startMs:950,endMs:4500,words}]};
const face={jaw:.48,wide:.36,round:.16,lipsClosed:0,smile:.10,brow:.14,blink:.12,cheek:.08,squint:.04};
const base={face,reference:'untouched'};
const opts={lyrics,effectiveTimeMs:1320,activeWord:'ja',playing:true,enabled:true,rap:true,verifiedWord:true,
 roleAllowed:true,manualSilent:false,manualPriority:false,reducedMotion:false,preserveAudioMouth:false,intensity:85};
const sample=(change={},tier='high',frame=base)=>plan(frame,{...opts,...change},tier);
const test=(name,fn)=>{try{fn();count++;}catch(e){e.message=`V631 ${name}: ${e.message}`;throw e;}};
let count=0;
test('connected rap words have a verified response cue',()=>{const p=sample();assert(p.active);assert.equal(p.mode,'connected-flow');assert.equal(p.wordStartMs,1210);assert.equal(p.source,'verified-timed-word');});
test('no invented phonemes/syllables or morph targets',()=>{const p=sample();assert.strictEqual(p.frame,base);assert.strictEqual(p.frame.face,face);assert(!('phoneme' in p));assert(!('viseme' in p));});
test('small in-word jaw movement responds slightly sooner',()=>{const p=sample();assert(rate(p,'jaw',true,.3,.4)>1);});
test('small in-word release has a bounded rate',()=>{const p=sample();assert(rate(p,'jaw',false,.5,.42)>1);});
test('large boundary movement slows instead of snapping',()=>{const p=sample({effectiveTimeMs:1220});const a=rate(p,'wide',true,0,.90),b=rate(p,'wide',true,.4,.45);assert(a<b);});
test('word-edge rate remains continuous and bounded',()=>{for(let t=1210;t<1450;t+=5){const p=sample({effectiveTimeMs:t});const r=rate(p,'jaw',true,.1,.92);assert(r>=.85&&r<=1.15);}});
test('wide/round share same rate semantics',()=>{const p=sample();assert.equal(rate(p,'wide',true,.3,.42),rate(p,'round',true,.3,.42));});
test('lip seal is never retimed',()=>assert.equal(rate(sample(),'lipsClosed',true,0,1),1));
test('blink is never retimed',()=>assert.equal(rate(sample(),'blink',true,0,1),1));
test('non-mouth expressions always unchanged',()=>{for(const c of ['smile','brow','cheek','squint','head'])assert.equal(rate(sample(),c,true,.1,.8),1);});
test('B/P/M word onset stays owned by the original engine',()=>assert(!sample({effectiveTimeMs:1040,activeWord:'Bam'}).active));
test('next B/P/M onset blocks anticipation',()=>{const special={...lyrics,lines:[{...lyrics.lines[0],words:[{text:'ja',startMs:1000,endMs:1200},{text:'Boom',startMs:1220,endMs:1430}]}]};assert(!sample({lyrics:special,effectiveTimeMs:1100,activeWord:'ja'}).active);});
test('bilabial B with punctuation stays protected',()=>assert(!sample({effectiveTimeMs:1040,activeWord:'Bam'}).active));
test('sealed lips disable refinements',()=>assert(!sample({},'high',{face:{...face,lipsClosed:.25}}).active));
test('non-finite jaw disables policy',()=>assert(!sample({},'high',{face:{...face,jaw:NaN}}).active));
test('out of range face disables policy',()=>assert(!sample({},'high',{face:{...face,round:1.5}}).active));
test('low tier is neutral',()=>assert(!sample({},'low').active));
test('balanced tier has softer weighting',()=>assert(sample({},'balanced').weight<sample().weight));
test('pause is neutral',()=>assert(!sample({playing:false}).active));
test('lip-sync disabled is neutral',()=>assert(!sample({enabled:false}).active));
test('non rap is neutral',()=>assert(!sample({rap:false}).active));
test('not verified word is neutral',()=>assert(!sample({verifiedWord:false}).active));
test('wrong singer is neutral',()=>assert(!sample({roleAllowed:false}).active));
test('manual singer silence is neutral',()=>assert(!sample({manualSilent:true}).active));
test('manual animation priority is neutral',()=>assert(!sample({manualPriority:true}).active));
test('reduced motion is neutral',()=>assert(!sample({reducedMotion:true}).active));
test('audio driven mouth wins',()=>assert(!sample({preserveAudioMouth:true}).active));
test('unsynced line has no implied words',()=>assert(!sample({lyrics:{...lyrics,synced:false}}).active));
test('null lyrics are ignored',()=>assert(!sample({lyrics:null}).active));
test('missing active word is neutral',()=>assert(!sample({activeWord:''}).active));
test('word text mismatch is neutral',()=>assert(!sample({activeWord:'wrong'}).active));
test('word edits take precedence',()=>assert(!sample({editedWords:[{startMs:1210,text:'ja'}]}).active));
test('word edits protect even when text changed',()=>assert(!sample({editedWords:[{startMs:1210,text:'modified'}]}).active));
test('negative, NaN and infinite times neutral',()=>{for(const t of [-1,NaN,Infinity])assert(!sample({effectiveTimeMs:t}).active);});
test('seeking into gap is neutral',()=>assert(!sample({effectiveTimeMs:2300,activeWord:'ja'}).active));
test('track changes have no remembered rate state',()=>{const a=sample();sample({lyrics:{...lyrics,synced:false}});assert.deepEqual(a,sample());});
test('intensity zero/invalid neutral',()=>{for(const i of [0,NaN,-5])assert(!sample({intensity:i}).active);});
test('phrase-final connected word gets settling mode',()=>{const p=sample({effectiveTimeMs:1820,activeWord:'oh'});assert(p.active);assert.equal(p.mode,'phrase-settle');assert(rate(p,'jaw',false,.75,.17)<=1.15);});
test('isolated long word has no rapid cue',()=>{const p=sample({effectiveTimeMs:2710,activeWord:'Ruhe'});assert(!p.active);});
test('word gap cannot create fake following word',()=>assert(!sample({effectiveTimeMs:3650,activeWord:'schnell'}).active));
test('tiny differences do not create response changes',()=>assert.equal(rate(sample(),'jaw',true,.5,.5),1));
test('invalid render target is neutral',()=>{for(const v of [NaN,Infinity,-1,2])assert.equal(rate(sample(),'jaw',true,.2,v),1);});
test('invalid render current value is neutral',()=>{for(const v of [NaN,Infinity,-1,2])assert.equal(rate(sample(),'jaw',true,v,.2),1);});
test('inactive rate is exactly neutral',()=>assert.equal(rate(sample({playing:false}),'jaw',true,.3,.75),1));
test('rate does not mutate input face, options or lyrics',()=>{const original=JSON.stringify([face,opts,lyrics]);const p=sample();rate(p,'jaw',true,.1,.9);assert.equal(JSON.stringify([face,opts,lyrics]),original);});
test('GLB rig owns same rate on actual final morph response path',()=>{const s=fs.readFileSync('components/visualizer/VocalRigV368.tsx','utf8');assert(s.includes('planAdvancedVocalLipSyncV631('));assert(s.includes('vocalMouthRateV631(mouthContinuityV631,c,attackingV581,current.current[c],finalMouthTargetV644)'));assert(s.includes('alignedMouthV644??directedTargetV632'));assert(s.includes('const directedTargetV632=multiArtistMouthTargetV632('));assert(s.indexOf('const facialRealismV617=')<s.indexOf('const mouthContinuityV631=')&&s.indexOf('const mouthContinuityV631=')<s.indexOf('const cadenceSpeedV572='));});
test('procedural avatar also applies rates to mouth mesh',()=>{const s=fs.readFileSync('components/visualizer/ProceduralDancerAvatarV492.tsx','utf8');assert(s.includes('planAdvancedVocalLipSyncV631('));assert(s.includes("vocalMouthRateV631(mouthContinuityV631,'jaw'"));assert(s.includes("vocalMouthRateV631(mouthContinuityV631,'wide'"));});
test('manual GLB audition and V562 calibration remain on final path',()=>{const s=fs.readFileSync('components/visualizer/VocalRigV368.tsx','utf8');assert(s.includes('previewTargetV383 ? ZERO'));assert(s.includes('calibrateMouthPoseV562(current.current'));assert(s.includes('current.current.jaw=Math.min(current.current.jaw,1-current.current.lipsClosed*.985)'));});
test('no extra renderer, new morphs, random cues or clock',()=>{const s=fs.readFileSync('components/visualizer/advancedVocalLipSyncV631.ts','utf8');assert(!/requestAnimationFrame\s*\(|useFrame\s*\(|setTimeout\s*\(|Math.random\s*\(|performance.now\s*\(|\.morphTargetInfluences\s*\[/.test(s));});
let steps=0;
for(let j=0;j<3000;j++)for(const tier of ['high','balanced'])for(const attacking of [false,true]){
 const t=1210+j%240;const p=sample({effectiveTimeMs:t,intensity:1+j%100},tier);
 const c=(j%101)/100,tar=(j*13%101)/100;
 for(const channel of ['jaw','wide','round','lipsClosed']){
  const r=rate(p,channel,attacking,c,tar);assert(Number.isFinite(r)&&r>=.85&&r<=1.15);
  assert.equal(r,rate(p,channel,attacking,c,tar));
 }
 steps++;
}
test('12k deterministic densely-sampled real word rates',()=>assert.equal(steps,12000));
console.log(`PASS V631: ${count} regression groups, ${steps} deterministic rapid-vocal rates`);
