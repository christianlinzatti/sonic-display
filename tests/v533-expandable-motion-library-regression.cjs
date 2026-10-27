'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {load}=require('./helpers/ts-loader-v404.cjs');
const {planAdditionalMotionClipsV533,validateMotionAssignmentV533,explainAdditionalMotionQualityV533,MAX_MOTION_CLIPS_PER_GLB_V533}=load('components/visualizer/expandableMotionLibraryV533');
assert.deepEqual(planAdditionalMotionClipsV533(['Idle','Dance','Hook'],1,false),[1]);
assert.deepEqual(planAdditionalMotionClipsV533(['Idle','Dance','Hook'],1,true),[0,1,2]);
assert.deepEqual(planAdditionalMotionClipsV533(Array.from({length:50},(_,i)=>`Dance ${i}`),49,true),Array.from({length:50},(_,i)=>i));
assert.throws(()=>planAdditionalMotionClipsV533([],0,true),/Ungültige/);
assert.throws(()=>planAdditionalMotionClipsV533(['Idle'],2,false),/Ungültige/);
assert.throws(()=>planAdditionalMotionClipsV533(['Idle',''],0,true),/ohne Namen/);
assert.throws(()=>planAdditionalMotionClipsV533(Array.from({length:MAX_MOTION_CLIPS_PER_GLB_V533+1},(_,i)=>`C${i}`),0,true),/Maximal/);
assert.equal(validateMotionAssignmentV533(true,true,true,false),null,'append mode never overrides current active motion');
assert.match(validateMotionAssignmentV533(false,false,true,false),/Ersetzen/);
assert.match(validateMotionAssignmentV533(false,true,false,false),/nur eine/);
assert.equal(validateMotionAssignmentV533(false,false,true,true),null);
assert.match(explainAdditionalMotionQualityV533(0,5),/Sichtprüfung/);
assert.match(explainAdditionalMotionQualityV533(3,10),/3 technische/);
const {analyzeGLBMotionClip}=load('components/visualizer/glbMotionQualityAnalyzer');
const synthetic=(name,times,values,size)=>({name,times,values,getValueSize:()=>size});
const normal=analyzeGLBMotionClip({name:'Idle',duration:1,tracks:[synthetic('Hips.position',[0,.5,1],[0,0,0,0,.1,0,0,0,0],3)]});
assert.equal(normal.issues.filter(x=>x.severity==='warning').length,0,'steady motion must not produce a false warning');
const jump=analyzeGLBMotionClip({name:'Bad Motion',duration:.1,tracks:[synthetic('Hips.position',[0,.05,.1],[0,0,0,100,0,0,101,0,0],3)]});
assert(jump.issues.some(x=>x.code==='fast-translation'),'unrealistic jump must be flagged');
assert(!normal.issues.some(x=>x.code==='possible-foot-slide'),'do not invent unsupported contact errors');
const root=path.join(__dirname,'..');
const installer=fs.readFileSync(path.join(root,'components/CharacterMotionBatchInstaller.tsx'),'utf8');
const inspector=fs.readFileSync(path.join(root,'components/visualizer/motionClipInspector.ts'),'utf8');
for(const flag of ['appendMotionsV533','importAllClipsV533','planAdditionalMotionClipsV533','validateMotionAssignmentV533','inspectSelectedMotionQualityV533','explainAdditionalMotionQualityV533','addCharacterMotion','onClick={()=>void inspectQualityV533(current)}','if(!appendMotionsV533&&index===selectedIndex)']){
 assert(installer.includes(flag),`V533 missing code: ${flag}`);
}
assert(inspector.includes('analyzeGLBMotionClip(clip)'),'inspector must check actual GLTF animation tracks, not clip name alone');
assert(installer.includes('checked={shareMotionsV531}'),'V531 optional dedupe retained');
const glbFiles=['sonic-performer-v3.glb','sonic-pulsebot-v1.glb','sonic-nova-v1.glb','sonic-rae-v1.glb','sonic-jax-v1.glb'];
for (const name of glbFiles){
 const filepath=path.join(process.env.SONIC_V529_SAMPLES||'/mnt/data',name);
 if(!fs.existsSync(filepath))continue;
 const data=fs.readFileSync(filepath);
 const jsonSize=data.readUInt32LE(12);
 const json=JSON.parse(data.subarray(20,20+jsonSize).toString('utf8').trim());
 const names=json.animations.map(a=>a.name);
 assert.equal(names.length,20);
 assert.equal(planAdditionalMotionClipsV533(names,19,true).length,20,'20-clip fixture must import all motions');
 console.log('V533',name,'20 / 20 clips selectable for later library import');
}
console.log('PASS V533 expandable, opt-in motion additions; no active override; bounded all-clip GLB import; technical quality warnings');
