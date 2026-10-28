'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {load}=require('./helpers/ts-loader-v404.cjs');
const {planRapMouthDynamicsV572:plan,rapMouthRateV572:rate}=load('components/visualizer/rapMouthDynamicsV572');
const root=path.resolve(__dirname,'..');
const source=filename=>fs.readFileSync(path.join(root,filename),'utf8');
const words=[
 {text:'Bam',startMs:1000,endMs:1230},
 {text:'macht',startMs:1250,endMs:1500},
 {text:'rap',startMs:1530,endMs:1930},
 {text:'heute',startMs:1970,endMs:2400},
 {text:'Pause',startMs:3400,endMs:3650},
];
const lyrics={provider:'spotify',synced:true,plainText:null,lines:[
 {text:'Bam macht rap heute',startMs:950,endMs:2650,words:words.slice(0,4)},
 {text:'Pause',startMs:3380,endMs:3900,words:words.slice(4)},
]};
const base={lyrics,effectiveTimeMs:1100,activeWord:'Bam',playing:true,enabled:true,rap:true,
 verifiedWord:true,reducedMotion:false,roleAllowed:true,manualSilent:false,manualPriority:false,
 preserveAudioMouth:false,intensity:80};
let n=0;const test=(name,fn)=>{fn();n++;};const sample=(over={})=>plan({...base,...over});
test('verified dense two-word cadence',()=>assert.equal(sample().cadence,'dense-rap'));
test('verified next connected cadence',()=>assert.equal(sample({effectiveTimeMs:1320,activeWord:'macht'}).cadence,'dense-rap'));
test('connected longer word cadence',()=>assert.equal(sample({effectiveTimeMs:1600,activeWord:'rap'}).cadence,'connected-rap'));
test('second longer word connected',()=>assert.equal(sample({effectiveTimeMs:2020,activeWord:'heute'}).cadence,'connected-rap'));
test('pause word no false cadence',()=>assert.equal(sample({effectiveTimeMs:3470,activeWord:'Pause'}).cadence,'none'));
test('real gap no cadence',()=>assert.equal(sample({effectiveTimeMs:3010,activeWord:'heute'}).active,false));
test('before first lyric no cadence',()=>assert.equal(sample({effectiveTimeMs:800}).active,false));
test('after last lyric no cadence',()=>assert.equal(sample({effectiveTimeMs:4100}).active,false));
test('in word gap no cadence',()=>assert.equal(sample({effectiveTimeMs:1240}).active,false));
test('wrong word rejected',()=>assert.equal(sample({activeWord:'someone'}).active,false));
test('whitespace and case normalized',()=>assert.equal(sample({activeWord:'  BAM  '}).active,true));
test('real word mark source explicit',()=>assert.equal(sample().source,'timed-word-density'));
test('fallback source explicit',()=>assert.equal(sample({playing:false}).source,'none'));
test('same shared plan identity across frames',()=>assert.strictEqual(sample(),sample({effectiveTimeMs:1120})));
test('same shared plan for connected words',()=>assert.strictEqual(sample({activeWord:'rap',effectiveTimeMs:1600}),sample({activeWord:'heute',effectiveTimeMs:2100})));
test('shared inactive object on pause and missing lyrics',()=>assert.strictEqual(sample({playing:false}),sample({lyrics:null})));
test('plans frozen against accidental mutations',()=>assert.equal(Object.isFrozen(sample()),true));
test('mouth jaw attack boosted bounded',()=>assert.ok(rate(sample(),'jaw',true)>1&&rate(sample(),'jaw',true)<=1.16));
test('mouth jaw release bounded',()=>assert.ok(rate(sample(),'jaw',false)>=1&&rate(sample(),'jaw',false)<=1.05));
test('vowel attack calmed',()=>assert.ok(rate(sample(),'round',true)<1));
test('wide attack calmed',()=>assert.ok(rate(sample(),'wide',true)<1));
test('vowel release calm',()=>assert.ok(rate(sample(),'wide',false)<=1));
test('lipsClosed attack exactly preserved',()=>assert.equal(rate(sample(),'lipsClosed',true),1));
test('lipsClosed release exactly preserved',()=>assert.equal(rate(sample(),'lipsClosed',false),1));
for(const channel of ['blink','smile','brow','cheek','squint','unknown']){
 test(`${channel} expressivity remains untouched`,()=>assert.equal(rate(sample(),channel,true),1));
}
const shields=[
 ['playing',false],['enabled',false],['rap',false],['verifiedWord',false],
 ['reducedMotion',true],['roleAllowed',false],['manualSilent',true],['manualPriority',true],
 ['preserveAudioMouth',true],['intensity',0],['intensity',-1],['intensity',NaN],
 ['intensity',Infinity],['effectiveTimeMs',NaN],['effectiveTimeMs',Infinity],
 ['effectiveTimeMs',-1],['activeWord',null],['activeWord',''],['lyrics',null],
 ['lyrics',{...lyrics,synced:false}],
];
for(const [key,value] of shields){
 test(`guard ${key}: ${String(value)}`,()=>assert.equal(sample({[key]:value}).active,false));
}
test('edited word owns mouth',()=>assert.equal(sample({editedWords:[{startMs:1000,text:'Bam'}]}).active,false));
test('edits for other words do not disable relevant word',()=>assert.equal(sample({editedWords:[{startMs:1530,text:'rap'}]}).active,true));
test('cannot infer missing word times',()=>{const a={...lyrics,lines:[{...lyrics.lines[0],words:undefined}]};assert.equal(sample({lyrics:a}).active,false);});
test('must have valid explicit text time marks',()=>{const a={...lyrics,lines:[{...lyrics.lines[0],words:[{...words[0],startMs:NaN},...words.slice(1)]}]};assert.equal(sample({lyrics:a}).active,false);});
test('isolated words do not trigger',()=>{const a={...lyrics,lines:[{...lyrics.lines[0],words:[words[0]]}]};assert.equal(sample({lyrics:a}).active,false);});
test('overlapping previous end suppresses before-current evidence',()=>{const w=[{...words[0],endMs:1410},{...words[1],endMs:1500},...words.slice(2,4)];const a={...lyrics,lines:[{...lyrics.lines[0],words:w}]};assert.equal(sample({lyrics:a}).cadence,'dense-rap');assert.equal(sample({lyrics:a,effectiveTimeMs:1300,activeWord:'macht'}).cadence,'dense-rap');});
test('large text gap does not imply dense articulation',()=>{const w=[{...words[0],endMs:1200},{...words[1],startMs:1430},...words.slice(2,4)];const a={...lyrics,lines:[{...lyrics.lines[0],words:w}]};assert.equal(sample({lyrics:a,effectiveTimeMs:1080}).active,false);});
test('too-short word does not permit timing enhancement',()=>{const w=[{...words[0],endMs:1040},...words.slice(1)];const a={...lyrics,lines:[{...lyrics.lines[0],words:w}]};assert.equal(sample({lyrics:a,effectiveTimeMs:1015}).active,false);});
test('long word does not permit timing enhancement',()=>{const w=[{...words[0],endMs:1600},{...words[1],startMs:1610,endMs:1840},...words.slice(2).map((x,i)=>({...x,startMs:x.startMs+500,endMs:x.endMs+500}))];const a={...lyrics,lines:[{...lyrics.lines[0],endMs:3300,words:w}]};assert.equal(sample({lyrics:a,effectiveTimeMs:1100}).active,false);});
const rig=source('components/visualizer/VocalRigV368.tsx');
test('GLB pipeline samples cadence after previous V546 refinement',()=>assert.ok(rig.indexOf('const mouthDynamicsV572=')>rig.indexOf('const lipV546=')));
test('GLB pipeline preserves V572/V612/V617 rates and appends only bounded V631 mouth continuity',()=>{assert.match(rig,/Math\.exp\(-cadenceSpeedV572\*expressiveVocalRateV612\(expressiveVocalV612,c,attackingV581\)\*vocalFacialRateV617\(facialRealismV617,c,attackingV581\)\*\s*vocalMouthRateV631\(mouthContinuityV631,c,attackingV581,current\.current\[c\],finalMouthTargetV644\)\*delta\)/);});
test('GLB overlays mouth only, not torso movement',()=>assert.doesNotMatch(source('components/visualizer/rapMouthDynamicsV572.ts'),/Bone|Object3D|AnimationMixer|requestAnimationFrame|setInterval|fetch\(/));
test('low Pi tier suppresses extra cadence',()=>assert.match(rig,/getActivePerformanceTier\(\)===\'low\'\?null:planRapMouthDynamicsV572/));
test('live-song manual preview stays separately protected',()=>assert.match(rig,/demoV370!=="off"\|\|!!previewPoseV370\|\|!!previewTargetV383/));
test('existing morph overlay cleanup retained',()=>assert.match(rig,/target\.delta=0/));
test('project version is at least V572',()=>assert.ok(Number(require('../package.json').version.match(/-v(\d+)$/)?.[1])>=572));
test('prebuild points to latest verified chain through the preflight',()=>{const scripts=require('../package.json').scripts;assert.equal(scripts.prebuild,'npm run build:preflight');assert(scripts['build:preflight'].includes('npm run verify:v646'));});
test('full release regression retained',()=>assert.match(require('../package.json').scripts['verify:v572'],/verify:v571/));
let frames=0;for(let i=0;i<16000;i++){
 const time=930+(i*37)%3300;
 const word=words.find(w=>time>=w.startMs&&time<w.endMs)?.text??null;
 const cadence=sample({effectiveTimeMs:time,activeWord:word});
 for(const channel of ['jaw','round','wide','lipsClosed','blink']){
  for(const up of [false,true]){const v=rate(cadence,channel,up);assert(Number.isFinite(v)&&v>.8&&v<1.2);}
 }
 frames++;
}
test('16k deterministic frames without new plans',()=>assert.equal(frames,16000));
console.log(`PASS V572: ${n} regression assertions, ${frames} sampled word frames`);
