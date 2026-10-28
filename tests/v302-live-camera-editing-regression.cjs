const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const ts=require('./typescript-loader.cjs');
const read=f=>fs.readFileSync(path.join(__dirname,'..',f),'utf8');
require('./helpers/project-version-v651.cjs').assertProjectVersionAtLeast(302);
const logic=read('components/visualizer/liveCameraEditingV302.ts');
const studio=read('components/visualizer/LiveCameraEditingStudioV302.tsx');
const stage=read('components/visualizer/StageCameraDirectorV289.tsx');
const dash=read('components/visualizer/CameraDirectorDashboardV300.tsx');
const css=read('app/globals.css');
for(const s of ['LIVE_CAMERA_EDIT_COMMAND_EVENT','normalizeLiveCameraEditCommand','cameraPoseFromLiveStatus','addLiveCameraPreset','upsertLiveCameraKeyframe'])assert.ok(logic.includes(s),s);
for(const s of ['Kamera live bearbeiten','Neues Kamera-Preset speichern und zuordnen','Keyframe bei dieser Zeit speichern','publishLiveCameraEdit({kind:"stop"})','writeCameraPresets','writeCameraKeyframes','Position innerhalb der Kamerafahrt','setDraft(next)'])assert.ok(studio.includes(s),s);
for(const s of ['liveEditPose.current','normalizeLiveCameraEditCommand','LIVE_CAMERA_EDIT_COMMAND_EVENT','editingPose||cutToCameraCueV400 ? 1','source = editingPose?"Live-Editor"','window.removeEventListener'])assert.ok(stage.includes(s),s);
assert.ok(stage.includes('if (!editingPose && playing && !reducedMotion && trackingEnabled.current)'));
assert.ok(stage.includes('if(!editingPose && playing && !reducedMotion && manual!=="auto")'));
assert.ok(dash.includes('<LiveCameraEditingStudioV302 status={status} connected={connected}/>'));
assert.ok(css.includes('.live-camera-editor-v302'));
assert.ok(!studio.includes('<Canvas'));
const wrappedModule={exports:{}};
const mocks={
  './cameraPresetLibraryV290':{
    normalizeCameraPresets:(v)=>v,
    sanitizeCameraPose:(v)=>Object.fromEntries(Object.entries({x:[-8,8],y:[-5,8],z:[1.2,15],targetY:[-4,6],fov:[18,85]}).map(([k,limits])=>[k,Math.max(limits[0],Math.min(limits[1],v[k]))]))
  },
  './cameraKeyframesV295':{normalizeCameraKeyframes:a=>[...a].sort((a,b)=>a.time-b.time)}
};
const compiled=ts.transpileModule(logic,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
new Function('module','exports','require',compiled)(wrappedModule,wrappedModule.exports,k=>{if(!mocks[k])throw Error('Unknown '+k);return mocks[k];});
const m=wrappedModule.exports;
assert.equal(m.normalizeLiveCameraEditCommand({kind:'oops'}),null);
assert.equal(m.normalizeLiveCameraEditCommand({kind:'pose',pose:{x:NaN}}),null);
assert.deepEqual(m.normalizeLiveCameraEditCommand({kind:'stop'}),{kind:'stop'});
const pose=m.cameraPoseFromLiveStatus({camera:{x:2,y:1,z:7,fov:42,targetY:.5}});
assert.equal(pose.targetY,.5);
assert.equal(m.normalizeLiveCameraEditCommand({kind:'pose',pose:{...pose,x:99}}).pose.x,8);
const initial={enabled:false,presets:[],assignments:{}};
const updated=m.addLiveCameraPreset(initial,'test123',' Test camera ',pose,'drop');
assert.equal(updated.enabled,true);
assert.equal(updated.assignments.drop,'test123');
assert.equal(updated.presets[0].name,'Test camera');
assert.equal(m.addLiveCameraPreset(updated,'test123','Duplicate',pose,'hook'),null);
assert.equal(m.addLiveCameraPreset({...updated,presets:Array(80).fill(updated.presets[0])},'unique','Full',pose,'hook'),null);
const first=m.upsertLiveCameraKeyframe([],'kf_1',3,pose);
assert.equal(first.length,1);
const replaced=m.upsertLiveCameraKeyframe(first,'kf_2',3.01,{...pose,z:9});
assert.equal(replaced.length,1);
assert.equal(replaced[0].id,'kf_1');
assert.equal(replaced[0].pose.z,9);
assert.equal(m.upsertLiveCameraKeyframe(first,'fail',3601,pose),null);
assert.equal(m.upsertLiveCameraKeyframe(Array(120).fill(first[0]).map((f,i)=>({...f,id:'kf_'+i,time:i})),'overflow',120,pose),null);
console.log('V302 live camera editor, temporary control and persistence regression passed');
