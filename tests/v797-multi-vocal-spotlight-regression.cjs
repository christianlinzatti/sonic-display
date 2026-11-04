'use strict';
require('./helpers/project-version-v651.cjs').assertProjectVersionAtLeast(797);
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const Module=require('node:module');
const ts=require('./typescript-loader.cjs');
const root=path.resolve(__dirname,'..');
function load(filename){
 const file=path.join(root,filename);
 const js=ts.transpileModule(fs.readFileSync(file,'utf8'),{fileName:file,
  compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS}}).outputText;
 const m=new Module(file,module);m.filename=file;m.paths=Module._nodeModulePaths(path.dirname(file));
 m._compile(js,file);return m.exports;
}
const {planMultiVocalSpotlightV797:plan,composeMultiVocalSpotlightCameraV797:compose,
 VOCAL_SPOTLIGHT_OFF_V797:OFF}=load('components/visualizer/multiVocalSpotlightDirectorV797.ts');
const scene={active:true,trackId:'song-A',cueStartMs:1000,cueEndMs:8000,
 count:3,focus:'lead',leadSlot:1,singingSlots:[1],handoffFrom:null,strength:.65};
const base={scene,trackId:'song-A',progressMs:2500,playing:true,enabled:true,count:3,
 reducedMotion:false,tier:'high',lyricsProtected:false,manualCamera:false,manualLighting:false};
const cue=(patch={})=>plan({...base,...patch});
const solo=cue();
assert(solo.active&&solo.mode==='solo'&&solo.leadSlot===1);
assert.equal(solo.keyGain>1,true);assert.equal(solo.cameraActive,true);
assert.deepEqual(cue(),solo,'deterministic for the same verified scene');
const duet=cue({scene:{...scene,singingSlots:[1,2]}});
assert.equal(duet.mode,'duet');assert.equal(duet.partnerSlot,2);
assert(duet.fillGain>solo.fillGain);
const handoff=cue({scene:{...scene,focus:'handoff',handoffFrom:0}});
assert.equal(handoff.mode,'handoff');assert.deepEqual(handoff.activeSlots,[1,0]);
const ensemble=cue({scene:{...scene,focus:'ensemble',singingSlots:[0,1,2]}});
assert.equal(ensemble.mode,'ensemble');assert.deepEqual(ensemble.activeSlots,[0,1,2]);
assert.equal(cue({manualCamera:true}).cameraActive,false,'manual camera wins');
assert.equal(cue({manualCamera:true}).cameraWeight,0);
assert.equal(cue({manualLighting:true}).lightingActive,false,'manual light wins');
assert.equal(cue({manualLighting:true}).keyGain,1);
assert.equal(cue({manualLighting:true}).fillGain,1);
assert.equal(cue({lyricsProtected:true}).cameraActive,false,'lyrics framing wins');
assert.equal(cue({lyricsProtected:true}).lightingActive,true,'existing portrait fill may remain');
assert(cue({tier:'balanced'}).intensity<solo.intensity,'balanced tier attenuates accents');
for(const patch of [
 {trackId:'song-B'}, {scene:{...scene,trackId:'song-B'}}, {count:2},
 {progressMs:NaN},{progressMs:-1},{progressMs:999},{progressMs:8000},
 {progressMs:Infinity},{playing:false},{enabled:false},{reducedMotion:true},{tier:'low'},
 {scene:{...scene,active:false}},{scene:{...scene,count:5}},
 {scene:{...scene,focus:'none'}},{scene:{...scene,strength:Infinity}},
 {scene:{...scene,strength:.9}},{scene:{...scene,singingSlots:[1,1]}},
 {scene:{...scene,singingSlots:[3]}},{scene:{...scene,singingSlots:[]}},
 {scene:{...scene,singingSlots:[0]}},{scene:{...scene,leadSlot:-1}},
 {scene:{...scene,handoffFrom:1}},{scene:{...scene,handoffFrom:4}},
 {scene:{...scene, cueEndMs:1000}},
 ])assert.deepEqual(cue(patch),OFF,'invalid/stale/disabled cue must fail closed: '+JSON.stringify(patch));
const pose={z:5.1,fov:39,x:0,targetX:0};
const anchors=[0,1,2].map(slot=>({slot,visible:true,x:slot-1,y:1.5,z:0}));
const opts={automatic:true,authored:false,lyricsProtected:false,reducedMotion:false};
assert.notDeepEqual(compose(pose,duet,anchors,opts),pose);
assert(compose(pose,duet,anchors,opts).fov>pose.fov);
for(const overrides of [
 {automatic:false},{authored:true},{lyricsProtected:true},{reducedMotion:true}]){
 assert.deepEqual(compose(pose,duet,anchors,{...opts,...overrides}),pose);
}
assert.deepEqual(compose(pose,duet,anchors.filter(a=>a.slot!==2),opts),pose,'missing singer anchor');
assert.deepEqual(compose(pose,duet,anchors.map(a=>a.slot===2?{...a,visible:false}:a),opts),pose,'hidden singer anchor');
assert.deepEqual(compose(pose,duet,anchors.map(a=>a.slot===1?{...a,x:NaN}:a),opts),pose);
assert.deepEqual(compose(pose,duet,[...anchors],{...opts,lyricsProtected:true}),pose);
assert.deepEqual(compose(pose,solo,anchors,opts).x,pose.x,'do not move aim or invent world anchors');
const stage=fs.readFileSync(path.join(root,'components/visualizer/ThreeAvatar.tsx'),'utf8');
const cam=fs.readFileSync(path.join(root,'components/visualizer/StageCameraDirectorV289.tsx'),'utf8');
const light=fs.readFileSync(path.join(root,'components/visualizer/DynamicStage.tsx'),'utf8');
for(const v of ['planMultiVocalSpotlightV797','scene:props.lipSync?.cinematicSceneV528','vocalSpotlightV797={directedSpotlightV838}'])
 assert(stage.includes(v),'ThreeAvatar missing '+v);
for(const v of ['composeMultiVocalSpotlightCameraV797','guardAutomaticCameraV351(danceCameraV898.pose,composition)','authored:authoredCameraV528'])
 assert(cam.includes(v),'camera missing '+v);
for(const v of ['vocalSafeV797','!authoredLightsV386','timelineCue.blackout<=0','vocalKeyV797','vocalFillV797',
 'followPerformerLightV557(state.scene,(vocalSafeV797?'])
 assert(light.includes(v),'light missing '+v);
const pkg=require('../package.json');
assert(/^0\.1\.0-v\d+$/.test(pkg.version));
for(const name of ['build:preflight','check:fast','check:release'])
 assert(pkg.scripts[name].includes('npm run test:v797 && npm run test:v797:types && npm run test:v796'),name);
console.log('PASS V797: verified editorial singer cast, solo/duet/handoff/ensemble, stale seeks, lyric/manual/tier/blackout guards, camera anchors and shared stage integration');
