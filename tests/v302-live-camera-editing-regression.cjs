const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const ts=require('./typescript-loader.cjs');
const read=f=>fs.readFileSync(path.join(__dirname,'..',f),'utf8');
assert.ok(['0.1.0-v302','0.1.0-v303','0.1.0-v304','0.1.0-v305','0.1.0-v306','0.1.0-v307','0.1.0-v308','0.1.0-v309','0.1.0-v310','0.1.0-v311','0.1.0-v312','0.1.0-v313','0.1.0-v314','0.1.0-v315','0.1.0-v316','0.1.0-v317','0.1.0-v318','0.1.0-v319','0.1.0-v320','0.1.0-v321','0.1.0-v322','0.1.0-v324','0.1.0-v325','0.1.0-v326','0.1.0-v329','0.1.0-v330','0.1.0-v331','0.1.0-v332','0.1.0-v333','0.1.0-v334','0.1.0-v335','0.1.0-v336','0.1.0-v337','0.1.0-v338','0.1.0-v339','0.1.0-v340','0.1.0-v341','0.1.0-v342','0.1.0-v343','0.1.0-v346','0.1.0-v347','0.1.0-v349','0.1.0-v350','0.1.0-v351','0.1.0-v352','0.1.0-v353','0.1.0-v354','0.1.0-v355','0.1.0-v356','0.1.0-v357','0.1.0-v358','0.1.0-v359','0.1.0-v360','0.1.0-v361','0.1.0-v362','0.1.0-v363','0.1.0-v364','0.1.0-v365','0.1.0-v366','0.1.0-v367','0.1.0-v368','0.1.0-v369','0.1.0-v370','0.1.0-v371','0.1.0-v372','0.1.0-v373','0.1.0-v374','0.1.0-v375','0.1.0-v376','0.1.0-v377','0.1.0-v378','0.1.0-v379','0.1.0-v380','0.1.0-v381','0.1.0-v382','0.1.0-v383','0.1.0-v384','0.1.0-v385','0.1.0-v386','0.1.0-v387','0.1.0-v390','0.1.0-v391','0.1.0-v392','0.1.0-v393','0.1.0-v394','0.1.0-v395','0.1.0-v396','0.1.0-v397','0.1.0-v398','0.1.0-v399','0.1.0-v400','0.1.0-v401', '0.1.0-v402','0.1.0-v403','0.1.0-v404','0.1.0-v405','0.1.0-v406','0.1.0-v407','0.1.0-v408','0.1.0-v409','0.1.0-v411','0.1.0-v412','0.1.0-v413','0.1.0-v414','0.1.0-v415','0.1.0-v416','0.1.0-v417','0.1.0-v418','0.1.0-v419','0.1.0-v420','0.1.0-v422','0.1.0-v424','0.1.0-v425','0.1.0-v426'].includes(require('../package.json').version));
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
