'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');const path=require('node:path');
const ts=require('./typescript-loader.cjs');
const root=path.resolve(__dirname,'..');
const read=f=>fs.readFileSync(path.join(root,f),'utf8');
const rel='components/visualizer/naturalDanceMotionV758.ts';
const transpiled=ts.transpileModule(read(rel),{fileName:rel,compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS},reportDiagnostics:true});
assert.equal(transpiled.diagnostics.filter(d=>d.category===ts.DiagnosticCategory.Error).length,0);
const m={exports:{}};new Function('module','exports','require',transpiled.outputText)(m,m.exports,()=>{throw Error('runtime import not allowed');});
const v=m.exports;
const pose={hipRoll:.06,hipPitch:.04,hipLateral:.01,hipVertical:-.012,spineCounter:-.038,kneeCounter:-.014,ankleCounter:0};
const body={chestRoll:-.018,chestTwist:.012,leftArm:.017,rightArm:-.014,leftForearm:.005,rightForearm:-.005,leftLeg:.012,rightLeg:-.011,leftAnkle:.006,rightAnkle:-.006,headTilt:0};
const base={settings:v.DEFAULT_NATURAL_DANCE_V758,hip:pose,body,mode:'Hip_Circle',trackId:'track-A',seconds:1,delta:1/60,playing:true,reducedMotion:false,manualPriority:false,footIKEnabled:true,contactKnown:true,plantedLeft:true,plantedRight:false,qualityGain:1};
let count=0;function check(cond,label){assert.ok(cond,label);count++};function equal(a,b,label){assert.deepEqual(a,b,label);count++};
equal(v.normalizeNaturalDanceV758(),v.DEFAULT_NATURAL_DANCE_V758);
equal(v.normalizeNaturalDanceV758({enabled:false,strength:-80,balance:150,followThrough:NaN,transition:Infinity}),{enabled:false,strength:0,balance:100,followThrough:65,transition:70});
const run=(patch={},state=v.createNaturalDanceStateV758())=>v.directNaturalDanceV758(state,{...base,...patch});
for(const patch of [{settings:{enabled:false}},{settings:{strength:0}},{playing:false},{reducedMotion:true},{manualPriority:true},{mode:'off'},{seconds:-1},{seconds:NaN},{delta:0},{delta:NaN},{qualityGain:0}]){
 const state=v.createNaturalDanceStateV758();const result=run(patch,state);
 check(!result.active,'disabled must be inactive: '+JSON.stringify(patch));equal(result.hip,pose);equal(result.body,body);
}
for(const patch of [{hip:{...pose,hipRoll:NaN}},{body:{...body,rightLeg:Infinity}},{hip:{...pose,hipPitch:Infinity}}])check(!run(patch).active,'invalid channels do nothing');
for(const support of [
 {footIKEnabled:false,contactKnown:true,plantedLeft:true,plantedRight:false,kind:'unknown'},
 {footIKEnabled:true,contactKnown:false,plantedLeft:true,plantedRight:false,kind:'unknown'},
 {footIKEnabled:true,contactKnown:true,plantedLeft:true,plantedRight:true,kind:'double'},
 {footIKEnabled:true,contactKnown:true,plantedLeft:true,plantedRight:false,kind:'left'},
 {footIKEnabled:true,contactKnown:true,plantedLeft:false,plantedRight:true,kind:'right'},
 {footIKEnabled:true,contactKnown:true,plantedLeft:false,plantedRight:false,kind:'flight'},
]){
 const state=v.createNaturalDanceStateV758();let result;
 for(let i=0;i<300;i++){
  result=run({...support,seconds:1+i/60},state);
  check(result.support===support.kind,'support classification');
  check(result.active,'active valid pose');
  equal(result.hip.hipVertical,pose.hipVertical,'hip height untouched');
  equal(result.hip.hipLateral,pose.hipLateral,'root travel untouched');
  check(Math.abs(result.hip.hipRoll)<=.12,'bounded pelvic rotation');
  check(Math.abs(result.body.leftArm)<=.05&&Math.abs(result.body.rightArm)<=.05,'arms bounded');
  check(Math.abs(result.body.leftLeg)<=.032&&Math.abs(result.body.rightLeg)<=.032,'legs bounded');
  check(!(support.footIKEnabled&&support.contactKnown&&support.plantedLeft)||result.body.leftLeg===0,'left planted leg protected');
  check(!(support.footIKEnabled&&support.contactKnown&&support.plantedRight)||result.body.rightLeg===0,'right planted leg protected');
  check(!(support.footIKEnabled&&support.contactKnown&&support.plantedLeft)||result.body.leftAnkle===0,'left ankle planted');
  check(!(support.footIKEnabled&&support.contactKnown&&support.plantedRight)||result.body.rightAnkle===0,'right ankle planted');
  check(Number.isFinite(result.level)&&result.level>=0&&result.level<=1,'intensity valid');
 }
 if(support.kind==='unknown'||support.kind==='double'||support.kind==='flight')check(Math.abs(result.hip.hipRoll-pose.hipRoll)<1e-8,'no inferred support shift');
 if(support.kind==='left'||support.kind==='right')check(Math.abs(result.hip.hipRoll-pose.hipRoll)>1e-4,'single support subtle response');
}
// Stance transitions are bounded and seek resets discard previous-support state.
const moving=v.createNaturalDanceStateV758();
for(let i=0;i<80;i++)run({seconds:2+i/60},moving);
const before=moving.left;check(before<0,'left contact stored');
const switched=run({seconds:2+80/60,plantedLeft:false,plantedRight:true},moving);
check(switched.body.leftLeg!==0,'left swing leg now free');
check(switched.body.rightLeg===0,'new right support leg protected immediately');
check(Math.abs(moving.left-before)<.05,'contact change smooth');
const seek=run({seconds:1000,plantedLeft:false,plantedRight:true},moving);
check(seek.active&&moving.left===0,'seek clears old supporting foot');
run({playing:false},moving);equal(moving,v.createNaturalDanceStateV758(),'pause clears history');
const noPose=Object.fromEntries(Object.keys(pose).map(k=>[k,0]));check(!run({hip:noPose}).active,'cannot dance with zero source');
const originalHip=JSON.stringify(pose),originalBody=JSON.stringify(body);
let seed=73;function rand(){seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;}
for(let i=0;i<20000;i++){
 const state=v.createNaturalDanceStateV758();const s=1+rand()*100;
 const support=Math.floor(rand()*4),strength=Math.floor(rand()*101),quality=rand();
 const out=run({seconds:s,qualityGain:quality,settings:{enabled:true,strength,balance:Math.floor(rand()*101),followThrough:Math.floor(rand()*101),transition:Math.floor(rand()*101)},plantedLeft:support===1||support===3,plantedRight:support===2||support===3},state);
 check(out.active===!(strength===0||quality===0),'conditional activation');
 check(out.hip.hipVertical===pose.hipVertical&&out.hip.hipLateral===pose.hipLateral,'no root translation');
 for(const value of [...Object.values(out.hip),...Object.values(out.body)])check(Number.isFinite(value),'never NaN');
 check(!out.active||out.body.leftLeg===0||!(support===1||support===3),'planted left protected random');
 check(!out.active||out.body.rightLeg===0||!(support===2||support===3),'planted right protected random');
}
equal(JSON.stringify(pose),originalHip,'hip input immutable');equal(JSON.stringify(body),originalBody,'body input immutable');
const gltf=read('components/visualizer/GltfDancerAvatarV492.tsx'),preview=read('components/visualizer/AvatarEditor.tsx'),prefs=read('context/UiPreferencesContext.tsx'),types=read('types/music.ts'),settings=read('components/SettingsPanel.tsx');
check(gltf.includes('directNaturalDanceV758(danceNaturalStateV758.current'),'live wired');
check(preview.includes('directNaturalDanceV758(danceStateV758.current'),'GLB preview wired');
check(gltf.includes('qualityGain:propsLipSyncV367?.qualityDanceGainV750??1'),'quality budget wired');
check(gltf.indexOf('naturalDanceV758.hip')<gltf.indexOf('applyAvatarRigMotion('),'rig goes through V758');
check(gltf.indexOf('directNaturalDanceV758(')<gltf.indexOf('updateFootGrounding('),'IK remains later');
check(settings.includes('Natural Dance Motion 4.0')&&prefs.includes('avatarNaturalDanceV758')&&types.includes('avatarNaturalDanceV758'),'settings wired');
console.log(`PASS V758 Natural Dance Motion: ${count.toLocaleString('en-US')} checks`);
