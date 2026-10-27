'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {load}=require('./helpers/ts-loader-v404.cjs');
const {planIntelligentConcertPerformanceV503:plan,
 composeConcertStageV503:stage,composeConcertFaceV503:face}=load('components/visualizer/intelligentConcertPerformanceV503');
const base={trackId:'t',progressMs:1540,playing:true,reducedMotion:false,enabled:true,
 bodyEnabled:true,gesturesEnabled:true,faceEnabled:true,manualBodyPriority:false,manualFacePriority:false,
 genre:'Deutschrap',section:'verse',slot:0,tier:'high',wordVerified:true,rap:true,focus:.85,
 rapidWord:false,assignedSingers:[0],beat:.7,energy:.8};
const get=(changes={})=>plan({...base,...changes});
const ok=get();
assert(ok.active&&ok.evidence==='aligned-word');
assert(ok.brow>0&&ok.cheek>0);
for(const changes of [
 {playing:false},{reducedMotion:true},{enabled:false},{wordVerified:false},{rap:false},
 {genre:'hardstyle'},{genre:'Hardtekk'},{trackId:''},{progressMs:-1},{progressMs:NaN},
 {section:'break'},{slot:9},{assignedSingers:[1]},{bodyEnabled:false,faceEnabled:false},
 {manualBodyPriority:true,manualFacePriority:true},
 ]){
 const output=get(changes);
 assert.deepEqual(output,{active:false,evidence:'none',headPitch:0,headTilt:0,chestLean:0,leftArm:0,rightArm:0,brow:0,cheek:0},`must stay inactive: ${JSON.stringify(changes)}`);
}
assert(get({section:'hook'}).brow>get({section:'verse'}).brow,'hook emphasis should increase smoothly');
assert(get({rapidWord:true}).brow<get().brow*.5,'rapid passages must not machine-gun gestures');
assert(get({tier:'low'}).brow<get({tier:'balanced'}).brow);
assert(get({tier:'balanced'}).brow<get({tier:'high'}).brow);
assert.equal(get({manualBodyPriority:true}).headPitch,0);
assert(get({manualBodyPriority:true}).brow>0,'body and face priorities independent');
assert.equal(get({manualFacePriority:true}).brow,0);
assert.notEqual(get({manualFacePriority:true}).headPitch,0);
assert.equal(get({gesturesEnabled:false}).leftArm,0);
assert.equal(get({gesturesEnabled:false}).rightArm,0);
assert(get({gesturesEnabled:false}).brow>0);
assert(get({assignedSingers:[]}).active,'no authored singers must not assert singer identity');
assert.equal(JSON.stringify(get()),JSON.stringify(get()),'deterministic');
const pose={headPitch:-.08,headTilt:.09,headYaw:0,eyeYaw:0,chestLean:0,leftArm:0,rightArm:0,confidence:'word',mode:'rap',emphasis:.85};
const facePose={face:{jaw:.33,wide:.19,round:.24,lipsClosed:.8,smile:.02,brow:.40,blink:.6,cheek:.1,squint:.03}, source:'existing'};
const poseSnapshot=JSON.stringify(pose), faceSnapshot=JSON.stringify(facePose);
const applied=stage(pose,ok), expressive=face(facePose,ok);
assert.equal(applied.headYaw,pose.headYaw,'duet partner gaze preserved');
assert.equal(applied.eyeYaw,pose.eyeYaw,'eye tracking preserved');
assert.equal(applied.mode,'rap','source modes retained');
assert.equal(expressive.face.lipsClosed,facePose.face.lipsClosed,'B/P/M closure untouched');
assert.equal(expressive.face.jaw,facePose.face.jaw,'jaw untouched');
assert.equal(expressive.face.wide,facePose.face.wide,'lip width untouched');
assert.equal(expressive.face.blink,facePose.face.blink,'blink untouched');
assert(expressive.face.brow>facePose.face.brow,'only additive face expression');
assert.equal(JSON.stringify(pose),poseSnapshot,'stage inputs immutable');
assert.equal(JSON.stringify(facePose),faceSnapshot,'face inputs immutable');
assert.strictEqual(stage(pose,plan({...base,playing:false})),pose,'inactive stage identity');
assert.strictEqual(face(facePose,plan({...base,playing:false})),facePose,'inactive face identity');
for(let i=0;i<20000;i++){
 const slot=i%4,focus=i%3?((i%97)/96):Infinity;
 const c=get({progressMs:i*47.1,slot,focus,beat:i%9?1:NaN,energy:((i%110)-10)/100,
   section:['verse','hook','build','drop','break'][i%5],
   tier:['high','balanced','low'][i%3],assignedSingers:undefined,rapidWord:!!(i%2)});
 for(const name of ['headPitch','headTilt','chestLean','leftArm','rightArm','brow','cheek'])assert(Number.isFinite(c[name]),name);
 assert(Math.abs(c.headPitch)<=.015&&Math.abs(c.headTilt)<=.011);
 assert(Math.abs(c.leftArm)<=.028&&Math.abs(c.rightArm)<=.028);
 assert(c.brow>=0&&c.brow<=.045&&c.cheek>=0&&c.cheek<=.032);
 const b=stage(pose,c);assert(Math.abs(b.headPitch)<=.18&&Math.abs(b.leftArm)<=.25);
 const f=face(facePose,c);assert(f.face.brow<=1&&f.face.cheek<=1);
}
const glb=fs.readFileSync('components/visualizer/gltfVocalPerformanceV492.ts','utf8');
const procedural=fs.readFileSync('components/visualizer/ProceduralDancerAvatarV492.tsx','utf8');
const morph=fs.readFileSync('components/visualizer/VocalRigV368.tsx','utf8');
const pkg=JSON.parse(fs.readFileSync('package.json','utf8'));
assert(Number(pkg.version.match(/^0\.1\.0-v(\d+)$/)?.[1])>=503);
assert(pkg.scripts['build:preflight'].includes('npm run test:v503 && npm run test:v503:types && npm run test:v502'), 'V503 preflight remains in release chain');
assert.match(glb,/composeConcertStageV503\(rapBodyV407,concertV503\)/);
assert.match(procedural,/composeConcertFaceV503\((?:lipV499|lipV523|unifiedLipV526),concertV503\)/);assert(procedural.includes('coordinateRapFaceV526(lipV523'));
assert(procedural.includes('refineDeutschrapLipV523(argumentsLipSync.lyrics,lipV499')||procedural.includes('composeConcertFaceV503(lipV499,concertV503)'));
assert.match(procedural,/rapBodyV510\.chestLean/);
assert.match(procedural,/rapBodyV510=composeExpressiveRapStageV510\(rapBodyV503,expressiveRapV510\)/);
assert.match(morph,/composeConcertFaceV503\((?:lipV499|lipV523|unifiedLipV526),concertFaceV503\)/);assert(morph.includes('coordinateRapFaceV526(lipV523'));
assert(morph.includes('refineDeutschrapLipV523(lipSync?.lyrics??null,lipV499')||morph.includes('composeConcertFaceV503(lipV499,concertFaceV503)'));
assert.match(morph,/manualFacePriority:authoredPriorityV499/);
console.log('PASS V503 gesture and facial safeguards; GLB/procedural wiring, 20,000 bounded playback frames');
