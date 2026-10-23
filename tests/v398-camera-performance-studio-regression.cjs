'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const ts=require('./typescript-loader.cjs');
const root=path.resolve(__dirname,'..');
const read=f=>fs.readFileSync(path.join(root,f),'utf8');
function load(file){const code=ts.transpileModule(read(file),{fileName:file,compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
 const module={exports:{}};new Function('module','exports','require',code)(module,module.exports,require);return module.exports;}
const {DEFAULT_CAMERA_STUDIO_V398:d,normalizeCameraStudioV398:normalize,chooseCameraShotV398:choose,
 tuneCameraPoseV398:tune,previewCameraPoseV398:preview,profileFromPreviewPoseV398:fromPreview,cameraSceneV398:scene}=load('components/visualizer/cameraPerformanceStudioV398.ts');
assert.deepEqual(normalize(null),d);assert.deepEqual(normalize({enabled:true,holdMs:10000,scenes:{verse:{shot:'hacker',distance:-400,pan:Infinity}}}).scenes.verse,{shot:'auto',distance:0,pan:0});
const custom=normalize({enabled:true,holdMs:9999,scenes:{verse:{shot:'group',distance:1000,pan:-1000},hook:{shot:'lead',distance:75,pan:25},drop:{shot:'two-shot',distance:25,pan:10}}});
assert.equal(custom.holdMs,2400);assert.deepEqual(custom.scenes.verse,{shot:'group',distance:100,pan:-100});
assert.equal(scene('drop'),'drop');assert.equal(scene('break'),'verse');
const p={active:true,shot:'lead',leadSlot:1,partnerSlot:0,strength:.8,count:2,reason:'handoff',source:'manual-stage-cast'};
assert.deepEqual(choose(p,'verse',d,{timedLyrics:true,hasPartner:true}),p,'disabled studio does nothing');
assert.deepEqual(choose({...p,active:false},'verse',custom,{timedLyrics:true,hasPartner:true}),{...p,active:false});
assert.equal(choose(p,'verse',custom,{timedLyrics:false,hasPartner:true}).shot,'lead','no time aligned lyric => no forced verse-wide shot');
assert.equal(choose(p,'verse',custom,{timedLyrics:true,hasPartner:true}).shot,'group');
assert.equal(choose(p,'hook',custom,{timedLyrics:false,hasPartner:true}).shot,'lead','no false lead without time aligned lyric');
assert.equal(choose({...p,shot:'group'},'hook',custom,{timedLyrics:true,hasPartner:true}).shot,'lead');
assert.equal(choose({...p,partnerSlot:null},'drop',custom,{timedLyrics:true,hasPartner:true}).shot,'lead','no synthetic duet partner');
assert.equal(choose({...p,shot:'group'},'drop',custom,{timedLyrics:true,hasPartner:true}).shot,'two-shot');
const castShot=choose({...p,shot:'group',leadSlot:0,partnerSlot:null},'drop',custom,{timedLyrics:true,hasPartner:true,leadSlot:1,partnerSlot:0});
assert.equal(castShot.shot,'two-shot');assert.equal(castShot.leadSlot,1);assert.equal(castShot.partnerSlot,0);
const pose={x:0,y:.1,z:5,targetX:0,targetY:0,targetZ:0,fov:38};
assert.deepEqual(tune(pose,p,'verse',d,false),pose);
assert.deepEqual(tune(pose,{...p,active:false},'verse',custom,false),pose);
const closer=tune(pose,p,'verse',custom,false);assert.ok(closer.z<pose.z);assert.ok(closer.targetX<0);
const protectedTuned=tune(pose,p,'verse',custom,true);assert.ok(Math.abs(protectedTuned.z-pose.z)<Math.abs(closer.z-pose.z));
for(const data of [{distance:100,pan:100},{distance:0,pan:-100},{distance:50,pan:0}]){
 const x=normalize({enabled:true,scenes:{verse:{shot:'auto',...data}}});const shot=preview('verse',x);
 const adjusted=fromPreview(x,'verse',shot);assert.equal(adjusted.scenes.verse.distance,data.distance);assert.equal(adjusted.scenes.verse.pan,data.pan);
}
const orbitProfile=normalize({enabled:true,scenes:{verse:{shot:'lead',distance:40,pan:10}}});
const orbitPose=preview('verse',orbitProfile);
const orbitRadius=Math.hypot(orbitPose.z,orbitPose.y-orbitPose.targetY);
const tilted=fromPreview(orbitProfile,'verse',{...orbitPose,z:Math.sqrt(orbitRadius**2-.55**2),y:orbitPose.targetY+.55});
assert.equal(tilted.scenes.verse.distance,orbitProfile.scenes.verse.distance,'orbit rotation must not change saved zoom');
const malformed=fromPreview(custom,'drop',{...pose,z:NaN,targetX:NaN});assert.ok(Number.isFinite(malformed.scenes.drop.pan)&&Number.isFinite(malformed.scenes.drop.distance));
for(const [file,parts] of Object.entries({
 'types/music.ts':['avatarCameraStudioV398'],
 'context/UiPreferencesContext.tsx':['avatarCameraStudioV398:{enabled:false'],
 'components/visualizer/registry.tsx':['cameraStudioV398'],
 'components/visualizer/VisualizerStage.tsx':['cameraStudioV398:preferences.avatarCameraStudioV398'],
 'components/visualizer/StageCameraDirectorV289.tsx':['chooseCameraShotV398','tuneCameraPoseV398','normalizeCameraStudioV398','visuallyFramedV397!==duetFramedV377'],
 'components/visualizer/visualPerformanceDirectorV397.ts':['studioV398','customHold'],
 'components/SettingsPanel.tsx':['CameraPerformanceStudioV398','cameraStudioOpenV398'],
 'components/visualizer/CameraPerformanceStudioPanelV398.tsx':['CameraLivePreviewV291','profileFromPreviewPoseV398','showPreview&&'],
 'app/globals.css':['.camera-performance-studio-v398'],
 'V398-CAMERA-PERFORMANCE-STUDIO.md':['V398']
 }))for(const part of parts)assert.ok(read(file).includes(part),file+': '+part);
const pkg=JSON.parse(read('package.json'));assert.ok(['0.1.0-v398','0.1.0-v399','0.1.0-v400','0.1.0-v401', '0.1.0-v402','0.1.0-v403','0.1.0-v404','0.1.0-v405','0.1.0-v406','0.1.0-v407','0.1.0-v408','0.1.0-v409','0.1.0-v411','0.1.0-v412','0.1.0-v413','0.1.0-v414','0.1.0-v415','0.1.0-v416','0.1.0-v417','0.1.0-v418','0.1.0-v419','0.1.0-v420','0.1.0-v422','0.1.0-v424','0.1.0-v425','0.1.0-v426'].includes(pkg.version));assert.ok(pkg.scripts['verify:offline'].includes('test:v398'));
console.log('PASS V398 – validated section shots, no false speakers, orbit preview, bounded pose, lyrics protection and wiring');
