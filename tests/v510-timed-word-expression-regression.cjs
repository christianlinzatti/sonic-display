'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {load}=require('./helpers/ts-loader-v404.cjs');
const {planExpressiveRapV510:plan,composeExpressiveRapStageV510:stage,composeExpressiveRapFaceV510:face}=
  load('components/visualizer/expressiveRapPerformanceV510');
const lyrics={synced:true,lines:[{startMs:0,endMs:1780,text:'Wir gehen nach vorn',words:[
  {text:'Wir',startMs:0,endMs:280},
  {text:'gehen',startMs:290,endMs:630},
  {text:'nach',startMs:645,endMs:900},
  {text:'vorn',startMs:1110,endMs:1460},
]}]};
const base={trackId:'track-A',lyrics,progressMs:480,effectiveTimeMs:480,
 playing:true,enabled:true,reducedMotion:false,genre:'Deutschrap',section:'verse',slot:0,castCount:1,tier:'high',
 verifiedWord:true,rap:true,activeWord:'gehen',rapid:false,joinedWords:true,focus:.95,
 bodyEnabled:true,faceEnabled:true,gesturesEnabled:true,manualBodyPriority:false,manualFacePriority:false};
const sample=(o={})=>plan({...base,...o});
const good=sample(),off=sample({playing:false});
assert(good.active&&good.evidence==='timed-word'&&good.brow>0&&good.headPitch<0);
assert.deepEqual(sample(),sample(),'stateless seek/replay');
for(const o of [{trackId:''},{lyrics:null},{lyrics:{...lyrics,synced:false}},
  {playing:false},{enabled:false},{reducedMotion:true},{genre:'Hardstyle'},
  {section:'break'},{progressMs:NaN},{progressMs:-1},{effectiveTimeMs:NaN},
  {slot:-1},{slot:8},{castCount:0},{castCount:5},
  {slot:1,castCount:2,assignedSingers:[0]},
  {castCount:4},
  {verifiedWord:false},{rap:false},{activeWord:'wrong'},
  {effectiveTimeMs:1470},{effectiveTimeMs:1600},{effectiveTimeMs:-1},
  {bodyEnabled:false,faceEnabled:false},{manualBodyPriority:true,manualFacePriority:true},
  {authoredRoleAllowed:false}])assert.deepEqual(sample(o),off,`no evidence: ${JSON.stringify(o)}`);
assert(sample({rapid:true}).brow<good.brow*.5,'no machine-gun motion for quick rap');
assert(sample({tier:'low'}).brow<sample({tier:'balanced'}).brow);
assert(sample({tier:'balanced'}).brow<good.brow);
assert.equal(sample({gesturesEnabled:false}).leftArm,0);
assert.equal(sample({gesturesEnabled:false}).rightArm,0);
assert(sample({gesturesEnabled:false}).brow>0);
assert.equal(sample({manualBodyPriority:true}).headPitch,0);
assert(sample({manualBodyPriority:true}).brow>0);
assert.equal(sample({manualFacePriority:true}).brow,0);
assert.notEqual(sample({manualFacePriority:true}).headPitch,0);
assert(sample({assignedSingers:[0]}).active);
assert(!sample({castCount:4,authoredRoleAllowed:false}).active,
 'multi-avatar must not invent singer from unassigned synchronized words');
assert(sample({castCount:4,authoredRoleAllowed:true}).active,
 'V496 editor evidence authorizes the active avatar');
assert(sample({castCount:4,assignedSingers:[0]}).active,
 'V385 manual track evidence authorizes singer');
assert(sample({authoredRoleAllowed:true}).active);
assert(sample({section:'hook'}).brow>good.brow);
const pose={headPitch:-.07,headTilt:.03,headYaw:.085,eyeYaw:.18,chestLean:.02,
  leftArm:.1,rightArm:-.1,confidence:'word',mode:'rap',emphasis:.7};
const source={face:{jaw:.34,wide:.23,round:.17,lipsClosed:.82,smile:.1,
  brow:.21,blink:.52,cheek:.09,squint:.12},source:'original'};
const beforePose=JSON.stringify(pose),beforeFace=JSON.stringify(source);
const targetStage=stage(pose,good),targetFace=face(source,good);
for(const key of ['headYaw','eyeYaw','mode','confidence','emphasis'])assert.equal(targetStage[key],pose[key]);
for(const key of ['jaw','wide','round','lipsClosed','smile','blink'])assert.equal(targetFace.face[key],source.face[key]);
for(const key of ['brow','cheek','squint'])assert(targetFace.face[key]>source.face[key]);
assert.equal(JSON.stringify(pose),beforePose);assert.equal(JSON.stringify(source),beforeFace);
assert.strictEqual(stage(pose,off),pose);assert.strictEqual(face(source,off),source);
let live=0;
const words=['Wir','gehen','nach','vorn'];
for(let i=0;i<26000;i++){
 const clock=(i*37.3)%1800;
 const idx=clock<280?0:clock>=290&&clock<630?1:clock>=645&&clock<900?2:clock>=1110&&clock<1460?3:-1;
 const p=sample({progressMs:clock,effectiveTimeMs:clock,activeWord:idx>=0?words[idx]:'silence',
  slot:i%4,castCount:4,authoredRoleAllowed:i%7===0,assignedSingers:i%7===0?[0,1,2,3]:[i%4],
  rapid:i%3===0,joinedWords:i%2===0,focus:i%13===0?Infinity:(i%100)/99,
  tier:['high','balanced','low'][i%3],section:['hook','verse','drop','build','break'][i%5]});
 if(p.active)live++;
 for(const key of ['headPitch','headTilt','chestLean','leftArm','rightArm','brow','cheek','squint'])assert(Number.isFinite(p[key]));
 assert(Math.abs(p.headPitch)<=.018&&Math.abs(p.headTilt)<=.012);
 assert(Math.abs(p.leftArm)<=.020&&Math.abs(p.rightArm)<=.020);
 assert(p.brow>=0&&p.brow<=.038&&p.cheek>=0&&p.cheek<=.027&&p.squint>=0&&p.squint<=.013);
 const s=stage(pose,p),f=face(source,p);
 assert(Math.abs(s.headPitch)<=.18&&Math.abs(s.leftArm)<=.25);
 assert(f.face.brow<=1&&f.face.cheek<=1&&f.face.squint<=1);
}
assert(live>1000);
const glb=fs.readFileSync('components/visualizer/gltfVocalPerformanceV492.ts','utf8');
const procedural=fs.readFileSync('components/visualizer/ProceduralDancerAvatarV492.tsx','utf8');
const morph=fs.readFileSync('components/visualizer/VocalRigV368.tsx','utf8');
const pkg=JSON.parse(fs.readFileSync('package.json','utf8'));
assert(/^0\.1\.0-v5(?:1[0-9]|[2-9][0-9])$/.test(pkg.version),'V510+ package version');
assert(pkg.scripts['build:preflight'].includes('npm run test:v510 && npm run test:v510:types && npm run test:v509'));
assert(glb.includes('composeExpressiveRapStageV510(rapBodyV503,expressiveRapV510)'));
assert(procedural.includes('composeExpressiveRapFaceV510(lipV503,expressiveRapV510)'));
assert(procedural.includes('const mouthFaceV499=lipV510.face'));
assert(morph.includes('composeExpressiveRapFaceV510(lipV503,expressiveRapV510)'));
for(const file of [glb,procedural,morph]){
 assert(file.includes('authoredRoleAllowed:')&&file.includes('manualFacePriority:'));
 assert(file.includes('trackId===')||file.includes('track.id==='));
}
console.log(`PASS V510: 26,000 validated word playback frames (${live} active); lip-seal, manual roles, bounded motion, 3 rendering paths`);
