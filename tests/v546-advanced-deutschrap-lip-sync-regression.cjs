'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {load}=require('./helpers/ts-loader-v404.cjs');
const {refineAdvancedRapArticulationV546:refine}=load('components/visualizer/advancedDeutschrapArticulationV546');
const root=path.join(__dirname,'..');
const words=[
 {text:'Bam',startMs:1000,endMs:1240},
 {text:'oh',startMs:1260,endMs:1480},
 {text:'mir',startMs:1500,endMs:1740},
 {text:'egal',startMs:1760,endMs:2040},
 {text:'okay',startMs:2060,endMs:2290},
 {text:'los!',startMs:2310,endMs:2510},
 {text:'später',startMs:3000,endMs:3360},
];
const lyrics={provider:'spotify',synced:true,plainText:null,lines:[
 {text:words.slice(0,6).map(w=>w.text).join(' '),startMs:950,endMs:2700,words:words.slice(0,6)},
 {text:'später',startMs:2950,endMs:3500,words:words.slice(6)},
]};
const face={jaw:.55,wide:.32,round:.12,lipsClosed:0,smile:.06,brow:.10,blink:.08,cheek:.05,squint:.03};
const base={face,marker:{unchanged:true}};
const opts={lyrics,effectiveTimeMs:1004,activeWord:'Bam',playing:true,enabled:true,reducedMotion:false,
 rap:true,verifiedWord:true,roleAllowed:true,manualSilent:false,manualPriority:false,preserveAudioMouth:false,
 intensity:85,section:'verse',energy:.6};
const a=refine(base,opts);
assert.equal(a.kind,'bilabial-onset');
assert(a.active&&a.frame.face.lipsClosed>face.lipsClosed&&a.frame.face.jaw<face.jaw);
assert.deepEqual(a.frame.marker,base.marker);assert.deepEqual(base.face,face,'pure/no mutation');
assert.equal(a.frame.face.smile,face.smile);assert.equal(a.frame.face.blink,face.blink);
assert.deepEqual(refine(base,opts),a,'deterministic, seek-safe');
const late=refine(base,{...opts,effectiveTimeMs:1220});
assert.equal(late.active,false,'bilabial cue must end inside its word');
const guarded=refine({...base,face:{...face,lipsClosed:.96,jaw:.02}},opts);
assert.equal(guarded.active,false,'V384/V415 strong consonant seal must be retained');
const bridge=refine(base,{...opts,effectiveTimeMs:1990,activeWord:'egal'});
assert.equal(bridge.kind,'word-bridge');
assert(bridge.frame.face.wide>face.wide||bridge.frame.face.round!==face.round,'bridge refines existing visual face');
const beforeBridge=refine(base,{...opts,effectiveTimeMs:1800,activeWord:'egal'});
assert.equal(beforeBridge.active,false,'no cross-word look-ahead early in word');
const punct=refine(base,{...opts,effectiveTimeMs:2420,activeWord:'los!'});
assert.equal(punct.kind,'phrase-accent');
assert.equal(punct.frame.face.lipsClosed,face.lipsClosed);
const pause=refine(base,{...opts,effectiveTimeMs:2740,activeWord:'los!'});
assert.equal(pause.active,false);
const longGap=refine(base,{...opts,effectiveTimeMs:3330,activeWord:'später'});
assert.equal(longGap.active,false,'no invented following word');
const shield=[{playing:false},{enabled:false},{rap:false},{verifiedWord:false},{roleAllowed:false},
 {manualPriority:true},{manualSilent:true},{preserveAudioMouth:true},{reducedMotion:true},
 {intensity:0},{intensity:NaN},{effectiveTimeMs:NaN},{effectiveTimeMs:5000},
 {activeWord:'not-this-word'},{lyrics:{...lyrics,synced:false}},
 {editedWords:[{startMs:1000,text:'Bam'}]}];
for(const setting of shield){
 const value=refine(base,{...opts,...setting});
 assert.equal(value.active,false,`shield ${JSON.stringify(setting)}`);
 assert.strictEqual(value.frame,base,`no source modifications under shield`);
}
const low=refine(base,{...opts,intensity:10});
assert(low.frame.face.lipsClosed<a.frame.face.lipsClosed,'honor existing lip intensity');
let frames=0;
for(let i=0;i<25000;i++){
 const t=900+(i*31)%2900;
 const token=words.find(w=>t>=w.startMs&&t<w.endMs)?.text||null;
 const result=refine(base,{...opts,effectiveTimeMs:t,activeWord:token});
 for(const [key,amount] of Object.entries(result.frame.face))
  assert(Number.isFinite(amount)&&amount>=0&&amount<=1,`finite ${key}`);
 assert(result.frame.face.lipsClosed>=face.lipsClosed);
 assert(result.frame.face.jaw<=1-result.frame.face.lipsClosed*.985+1e-8);
 frames++;
}
const glb=fs.readFileSync(path.join(root,'components/visualizer/VocalRigV368.tsx'),'utf8');
const proc=fs.readFileSync(path.join(root,'components/visualizer/ProceduralDancerAvatarV492.tsx'),'utf8');
assert(glb.includes('const lipV546=refineAdvancedRapArticulationV546(lipV538.frame,optionsV538)'));
assert(glb.includes('const finalTargetV546=') && glb.includes('lipV546.active?lipV546.frame.face[c]:finalTargetV538'));
assert(glb.includes('demoV370!=="off"') && glb.includes('? target[c] :'), 'explicit GLB facial previews must not be overwritten by song refinements');
assert(proc.includes('const mouthFaceV546=lipV546.active?lipV546.frame.face:mouthFaceV538'));
assert(proc.includes('mouthFaceV546=lipV546.active?lipV546.frame.face:mouthFaceV538'));
assert(proc.indexOf('const mouthFaceV546=')<proc.indexOf('const mouthFaceV597='));
assert(proc.includes('mouthFaceV612.jaw')); // V612 follows verified V597/V546 shaping
for(const code of [glb,proc]){
 assert(code.includes('refineDeutschrapFaceV538(lipV510,optionsV538)'));
 assert(code.includes('roleAllowed:')&&code.includes('manualPriority:')&&code.includes('preserveAudioMouth:')&&code.includes('editedWords:'));
}
let models=0,clips=0;
for(const basename of ['sonic-performer-v3','sonic-pulsebot-v1','sonic-nova-v1','sonic-rae-v1','sonic-jax-v1']){
 const file=path.join('/mnt/data',basename+'.glb');if(!fs.existsSync(file))continue;
 const b=fs.readFileSync(file);assert.equal(b.toString('ascii',0,4),'glTF');
 const json=JSON.parse(b.toString('utf8',20,20+b.readUInt32LE(12)).trim());
 const targets=(json.meshes||[]).flatMap(m=>m.extras?.targetNames||[]);
 assert(targets.includes('jawOpen'));assert(targets.includes('mouthSmile'));
 models++;clips+=json.animations.length;
}
const p=require('../package.json');assert(Number(p.version.match(/^0\.1\.0-v(\d+)$/)?.[1])>=546);
// V645 preflight selects the newest verified release chain which includes V546.
assert(p.scripts['build:preflight'].includes('npm run verify:v646'));
assert(p.scripts['verify:v546'].includes('npm run test:v546 && npm run test:v546:types'));
console.log(`PASS V546: ${frames} sampled word-times, bilabial/bridge/punctuation safeguards, ${models} GLB fixtures (${clips} clips), GLB/procedural integration`);
