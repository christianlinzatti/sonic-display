'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {load}=require('./helpers/ts-loader-v404.cjs');
const {planIntelligentVocalDuetV838:plan,refineVocalSpotlightV838:light,
 composeIntelligentVocalDuetCameraV838:camera,refineIntelligentDuetLooksV838:looks,
 VOCAL_DUET_OFF_V838:OFF}=load('components/visualizer/intelligentVocalDuetDirectorV838');
const {planMultiVocalSpotlightV797:spotlight}=load('components/visualizer/multiVocalSpotlightDirectorV797');
const dir=path.resolve(__dirname,'..');
const read=f=>fs.readFileSync(path.join(dir,f),'utf8');
let total=0;
const test=(name,fn)=>{try{fn();total++}catch(e){e.message=`V838 ${name}: ${e.message}`;throw e}};
const scene={active:true,trackId:'track-838',cueStartMs:1000,cueEndMs:4300,count:2,focus:'handoff',leadSlot:1,
 singingSlots:[1],handoffFrom:0,strength:.7,lyricMotionGain:.8,readingBoost:1,plateBoost:0};
const options={trackId:'track-838',progressMs:1630,playing:true,reducedMotion:false,tier:'high',manualVocal:false};
const spotlightAt=(s=scene,t=1630,extra={})=>spotlight({scene:s,trackId:'track-838',progressMs:t,playing:true,enabled:true,
 count:s.count,reducedMotion:false,tier:'high',lyricsProtected:false,manualCamera:false,manualLighting:false,...extra});
const base=spotlightAt();
const run=(s=scene,t=1630,extra={})=>plan({scene:s,spotlight:spotlightAt(s,t),...options,progressMs:t,...extra});
const cue=run();
test('verified handoff active',()=>assert(cue.active));
test('handoff mode',()=>assert.equal(cue.mode,'handoff'));
test('correct lead',()=>assert.equal(cue.leadSlot,1));
test('outgoing singer from verified cast',()=>assert.equal(cue.respondingSlot,0));
test('participating singers only',()=>assert.deepEqual(cue.participants,[0,1]));
test('bounded handoff progress',()=>assert(cue.handoffBlend>0&&cue.handoffBlend<1));
test('bounded camera',()=>assert(cue.cameraStrength>0&&cue.cameraStrength<.25));
test('bounded glance',()=>assert(cue.glanceStrength>0&&cue.glanceStrength<.25));
test('bounded lighting',()=>assert(cue.lightingStrength>0&&cue.lightingStrength<.05));
test('deterministic seek',()=>assert.deepEqual(run(),run()));
test('scene at cue start fails closed',()=>assert(!run(scene,1000).active));
test('cue end excluded',()=>assert(!run(scene,4300).active));
test('one ms prior excluded',()=>assert(!run(scene,999).active));
test('later in handoff blend advances',()=>assert(run(scene,1890).handoffBlend>cue.handoffBlend));
const duo={...scene,focus:'lead',leadSlot:0,handoffFrom:null,singingSlots:[0,1]};
test('duet mode verified',()=>assert.equal(run(duo).mode,'duet'));
test('duet partner',()=>assert.equal(run(duo).respondingSlot,1));
test('duet cast',()=>assert.deepEqual(run(duo).participants,[0,1]));
const ens={...scene,focus:'ensemble',count:3,singingSlots:[0,1,2],handoffFrom:null,leadSlot:0};
test('ensemble mode verified',()=>assert.equal(run(ens).mode,'ensemble'));
test('ensemble no accidental glances',()=>assert.equal(run(ens).glanceStrength,0));
test('ensemble no false respondent',()=>assert.equal(run(ens).respondingSlot,null));
test('ensemble cast',()=>assert.deepEqual(run(ens).participants,[0,1,2]));
for(const [name,patch] of Object.entries({paused:{playing:false},reduced:{reducedMotion:true},manual:{manualVocal:true},low:{tier:'low'},track:{trackId:'unrelated'},
 nullTime:{progressMs:NaN},late:{progressMs:Infinity},negative:{progressMs:-1},disabled:{scene:null},noSpotlight:{spotlight:null},
 fakeSpotlight:{spotlight:{...base,trackId:'other'}},invalidWeight:{spotlight:{...base,cameraWeight:.9}},inactiveSpotlight:{spotlight:{...base,active:false}},
 differentLead:{spotlight:{...base,leadSlot:0}},extraCast:{spotlight:{...base,activeSlots:[0,1,1]}},emptyCast:{spotlight:{...base,activeSlots:[]}},
 fakeScene:{scene:{...scene,trackId:'other'}},badStrength:{scene:{...scene,strength:10}},badCount:{scene:{...scene,count:5}},
 badLead:{scene:{...scene,leadSlot:9}},duplicateSingers:{scene:{...scene,singingSlots:[1,1]}},
 ghostPrevious:{scene:{...scene,handoffFrom:9}},selfHandoff:{scene:{...scene,handoffFrom:1}},
 badInterval:{scene:{...scene,cueEndMs:1000}},noSingers:{scene:{...scene,singingSlots:[]}},
 nonEvidenceSolo:{scene:{...scene,focus:'lead'}},unknownFocus:{scene:{...scene,focus:'drop'}}})){
 test('guard '+name,()=>assert(!plan({scene,spotlight:base,...options,...patch}).active));
}
test('spotlight small light increase',()=>{const x=light(base,cue);assert(x.keyGain>=base.keyGain&&x.keyGain<=1.025);assert(x.fillGain>=base.fillGain&&x.fillGain<=1.045)});
test('spotlight retains full provenance',()=>{const x=light(base,cue);assert.equal(x.trackId,base.trackId);assert.equal(x.leadSlot,base.leadSlot);assert.equal(x.cameraActive,base.cameraActive)});
test('light inactive cue unchanged',()=>assert.strictEqual(light(base,OFF),base));
test('light manual unchanged',()=>{const b={...base,lightingActive:false};assert.strictEqual(light(b,cue),b)});
test('light other track unchanged',()=>{const b={...base,trackId:'different'};assert.strictEqual(light(b,cue),b)});
const pose={x:0,y:1,z:6.1,targetX:0,targetY:1.2,targetZ:0,fov:42};
const anchors=[{slot:0,visible:true,x:-1.2,y:1.3,z:0},{slot:1,visible:true,x:1.0,y:1.3,z:0}];
const camOpt={automatic:true,authored:false,lyricsProtected:false,reducedMotion:false,aspect:1.8,faceY:1.6};
test('camera always bounded',()=>{const p=camera(pose,cue,anchors,camOpt);assert(Math.abs(p.x-pose.x)<=.100001);assert(Math.abs((p.targetX??0)-(pose.targetX??0))<=.100001)});
test('camera does not change FOV or depth',()=>{const p=camera(pose,cue,anchors,camOpt);assert.equal(p.z,pose.z);assert.equal(p.fov,pose.fov)});
for(const [name,opts,points] of [
 ['manual camera',{authored:true},anchors],['no automatic',{automatic:false},anchors],
 ['lyrics protected',{lyricsProtected:true},anchors],['reduced motion',{reducedMotion:true},anchors],
 ['invalid aspect',{aspect:0},anchors],['missing anchor',{},anchors.slice(1)],
 ['invisible anchor',{},anchors.map(a=>({...a,visible:false}))],
 ['duplicate anchor',{},[...anchors,anchors[0]]],['nan anchor',{},anchors.map(a=>({...a,x:NaN}))]]){
 test('camera '+name+' stays unchanged',()=>assert.strictEqual(camera(pose,cue,points,{...camOpt,...opts}),pose));
}
test('camera OFF is identical',()=>assert.strictEqual(camera(pose,OFF,anchors,camOpt),pose));
const native={active:true,reason:'verified-vocal',mode:'reply',leadSlot:1,slots:[0,1].map(slot=>({slot,role:slot?'lead':'handoff',look:{yaw:0,pitch:0,eyeYaw:0,weight:0},gesture:{leftLift:0,rightLift:0,shoulder:0,lean:0,intensity:0}}))};
const positions=[[-1,0,0],[1,0,0]];
test('verified handoff adjusts only looks',()=>{const x=looks(native,cue,positions,false);assert(x.slots[0].look.yaw!==0);assert(x.slots[1].look.yaw!==0);assert.deepEqual(x.slots[0].gesture,native.slots[0].gesture)});
test('original stage untouched',()=>assert.equal(native.slots[0].look.yaw,0));
test('manual choreography untouched',()=>assert.strictEqual(looks(native,cue,positions,true),native));
test('missing group roots untouched',()=>assert.strictEqual(looks(native,cue,positions.slice(0,1),false),native));
test('too-close group roots untouched',()=>assert.strictEqual(looks(native,cue,[[0,0,0],[.2,0,0]],false),native));
test('too-distant group roots untouched',()=>assert.strictEqual(looks(native,cue,[[-10,0,0],[10,0,0]],false),native));
test('nan group roots untouched',()=>assert.strictEqual(looks(native,cue,[[NaN,0,0],[1,0,0]],false),native));
test('no verified V807 plan untouched',()=>{const inactive={...native,active:false};assert.strictEqual(looks(inactive,cue,positions,false),inactive)});
test('V838 ensemble no false gaze',()=>assert.strictEqual(looks(native,run(ens),positions,false),native));
test('V838 absent no gaze',()=>assert.strictEqual(looks(native,OFF,positions,false),native));
test('V838 no new gesture channels',()=>assert.deepEqual(looks(native,cue,positions,false).slots.map(x=>x.gesture),native.slots.map(x=>x.gesture)));
test('V838 no new singer roles',()=>assert.deepEqual(looks(native,cue,positions,false).slots.map(x=>x.role),native.slots.map(x=>x.role)));
test('V838 bounded eye motion',()=>{const o=looks(native,cue,positions,false);assert(o.slots.every(x=>Math.abs(x.look.eyeYaw)<=.11&&Math.abs(x.look.yaw)<=.42&&x.look.weight<=.46))});
const adlib={active:true,scene:'adlib',trackId:'track-838',count:2,leadSlot:1,singingSlots:[0,1],role:['backing','lead']};
test('explicit V632 adlib response is smaller than handoff',()=>{
 const regular=looks(native,cue,positions,false),responsive=looks(native,cue,positions,false,adlib);
 assert(Math.abs(responsive.slots[0].look.yaw)<Math.abs(regular.slots[0].look.yaw));
});
test('adlib from other song blocked',()=>assert.strictEqual(looks(native,cue,positions,false,{...adlib,trackId:'other'}),native));
test('inactive adlib blocked',()=>assert.strictEqual(looks(native,cue,positions,false,{...adlib,active:false}),native));
test('unassigned adlib singer blocked',()=>assert.strictEqual(looks(native,cue,positions,false,{...adlib,role:['listener','lead']}),native));
test('wrong lead adlib blocked',()=>assert.strictEqual(looks(native,cue,positions,false,{...adlib,leadSlot:0}),native));
test('adlib cannot touch gestures',()=>assert.deepEqual(looks(native,cue,positions,false,adlib).slots.map(s=>s.gesture),native.slots.map(s=>s.gesture)));

const three=read('components/visualizer/ThreeAvatar.tsx'),group=read('components/visualizer/GroupDancersV326SceneV492.tsx'),stage=read('components/visualizer/StageCameraDirectorV289.tsx');
test('one plan in ThreeAvatar',()=>assert(three.includes('planIntelligentVocalDuetV838({')));
test('camera receives plan',()=>assert(three.includes('vocalDuetV838={vocalDuetV838}')));
test('group receives plan',()=>assert(three.includes('settings={effectiveGroupSettingsV442} vocalDuetV838={vocalDuetV838}')));
test('lighting uses V797 budget',()=>assert(three.includes('vocalSpotlightV797={directedSpotlightV838}')));
test('camera uses V838 after V809',()=>assert(stage.includes('const framedV838=vocalDuetV838?composeIntelligentVocalDuetCameraV838(')&&stage.includes('guardAutomaticCameraV351(framedV848,composition)')&&stage.includes('const framedV848=composeCinematicCameraDirectorV848(')));
test('group uses V838 AFTER V807',()=>assert(group.includes('const directedInteractionV838=vocalDuetV838?refineIntelligentDuetLooksV838(')));
test('no resource allocation in planner',()=>{const src=read('components/visualizer/intelligentVocalDuetDirectorV838.ts');for(const forbidden of ['new WebGL','new THREE.','setInterval(','setTimeout(','dispatchEvent(','fetch(','localStorage'])assert(!src.includes(forbidden),forbidden)});
test('git automation preserved',()=>assert(fs.existsSync(path.join(dir,'.github/workflows/v832-continuous-validation.yml'))));
test('new release mandatory gates',()=>{const p=require('../package.json');assert(/^0\.1\.0-v(?:850|849|848|847|846|845|844(?:\.1)?|843|842|841|840|83[89])$/.test(p.version));for(const k of ['check:fast','check:release','build:preflight'])assert(p.scripts[k].includes('npm run test:v840 && npm run test:v840:types && npm run test:v839 && npm run test:v839:types && npm run test:v838 && npm run test:v838:types &&'),k)});
console.log(`PASS: V838 Intelligent Vocal & Duet Director 3.0 – ${total} Testgruppen.`);
