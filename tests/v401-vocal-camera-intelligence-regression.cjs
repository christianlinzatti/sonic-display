require('./helpers/threeAvatarSourcesV492.cjs').install();
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const ts=require('./typescript-loader.cjs'),root=path.resolve(__dirname,'..');
const cache={};
function load(relative){if(cache[relative])return cache[relative];
 const source=fs.readFileSync(path.join(root,'components/visualizer',relative+'.ts'),'utf8');
 const js=ts.transpileModule(source,{fileName:relative+'.ts',compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
 const module={exports:{}};new Function('module','exports','require',js)(module,module.exports,id=>id.startsWith('./')?load(path.posix.normalize(path.posix.join(path.posix.dirname(relative),id.slice(2)))):require(id));cache[relative]=module.exports;return module.exports;
}
const {initialVocalCameraStateV401:initial,normalizeVocalCameraV401:normal,advanceVocalCameraV401:advance,composeVocalCameraV401:compose}=load('vocalCameraIntelligenceV401');
assert.deepEqual(normal({mode:'other',strength:Infinity}),{mode:'off',strength:55});
assert.deepEqual(normal({mode:'subtle',strength:500}),{mode:'subtle',strength:100});
const lyrics={synced:true,lines:[{startMs:1000,endMs:2500,text:'Wir gehen laut! Jetzt',words:[{text:'Wir',startMs:1000,endMs:1190},{text:'gehen',startMs:1230,endMs:1480},{text:'laut!',startMs:1510,endMs:1840},{text:'Jetzt',startMs:1880,endMs:2400}]},{startMs:3000,endMs:4100,text:'Instrumental',words:[]}]};
const basic={trackId:'song-a',progressMs:1100,playing:true,reducedMotion:false,lyrics,lyricsEnabled:true,count:2,style:'rap',section:'verse',performanceTier:'high',settings:{mode:'musicvideo',strength:100}};
let state=initial();const sample=(data={})=>advance(state,{...basic,...data});
let plan=sample();assert.equal(plan.active,true);assert.equal(plan.leadSlot,0);assert.equal(plan.shot,'lead');assert.equal(plan.source,'timed-word');assert(plan.accent>0);
const soft=advance(initial(),{...basic,settings:{mode:'subtle',strength:100}});assert(soft.accent<plan.accent);
const low=advance(initial(),{...basic,performanceTier:'low'});assert(low.accent<plan.accent);
const singing=advance(initial(),{...basic,style:'singing'});assert(singing.accent<plan.accent);
assert.equal(sample({playing:false}).active,false);assert.equal(sample({playing:true,reducedMotion:true}).active,false);
assert.equal(sample({progressMs:-3}).active,false);assert.equal(sample({settings:{mode:'off',strength:100}}).active,false);
assert.equal(sample({settings:{mode:'musicvideo',strength:0}}).active,false);
assert.equal(sample({authoredPriority:true}).active,false);assert.equal(sample({existingShot:true}).active,false);
assert.equal(sample({lyricsEnabled:false}).active,false);assert.equal(sample({lyrics:{...lyrics,synced:false}}).active,false);
assert.equal(sample({lyrics:{synced:true,lines:[{startMs:1000,endMs:2100,text:'No words'}]}}).active,false);
assert.equal(sample({progressMs:2600}).active,false);assert.equal(sample({progressMs:3100}).active,false);
assert.equal(sample({section:'hook'}).active,false);assert.equal(sample({section:'drop'}).active,false);
const manual={active:true,role:'lead',lineIndex:0,count:2,leadSlot:1,handoffFrom:0};
plan=sample({manual,section:'verse',progressMs:1100});assert.equal(plan.active,true);assert.equal(plan.shot,'two-shot');assert.equal(plan.leadSlot,1);assert.equal(plan.partnerSlot,0);
assert.equal(sample({manual,progressMs:1100,trackId:'song-b'}).active,true);assert.equal(state.trackId,'song-b');
assert.equal(sample({manual,progressMs:1100,trackId:'song-a'}).active,true,'seek/track reset');
const pose={x:0,y:0,z:6,targetX:0,targetY:0,targetZ:0,fov:38};
const anchors=[{slot:0,x:-1,y:0,z:0,visible:true},{slot:1,x:1,y:0,z:0,visible:true}];
assert.notDeepEqual(compose(pose,plan,anchors,false,1),pose);
assert.deepEqual(compose(pose,plan,anchors.slice(1),false,1),pose,'invisible duet partner');
assert.deepEqual(compose(pose,plan,anchors.map(a=>({...a,visible:false})),false,1),pose);
const lead=advance(initial(),basic);
const framed=compose(pose,lead,anchors,false,1);assert.notDeepEqual(framed,pose);
const protectedFrame=compose(pose,lead,anchors,true,1);assert(Math.abs(protectedFrame.z-pose.z)<Math.abs(framed.z-pose.z)+.03,'lyrics protection');
const existingGroup={active:true,shot:'group',leadSlot:0};assert.deepEqual(compose(pose,lead,anchors,false,1,existingGroup),pose,'keep V397 group composition');
const existingSolo={active:true,shot:'lead',leadSlot:0};assert.notDeepEqual(compose(pose,lead,anchors,false,1,existingSolo),pose,'may accent V397 lead');
assert.deepEqual(compose(pose,lead,anchors.slice(1),false,1),pose,'no invented lead');
for(const [file,needles] of Object.entries({
 'types/music.ts':['avatarVocalCameraModeV401','avatarVocalCameraStrengthV401'],
 'context/UiPreferencesContext.tsx':['avatarVocalCameraModeV401:"off"'],
 'components/SettingsPanel.tsx':['v401-vocal-camera-settings','V401 · Vocal Camera Intelligence 4.0','avatarVocalCameraStrengthV401'],
 'components/visualizer/VisualizerStage.tsx':['vocalCameraModeV401:preferences.avatarVocalCameraModeV401'],
 'components/visualizer/registry.tsx':['vocalCameraModeV401?:'],
 'components/visualizer/ThreeAvatar.tsx':['props.lipSync?.vocalCameraModeV401!=="off"'],
 'components/visualizer/StageCameraDirectorV289.tsx':['advanceVocalCameraV401','composeVocalCameraV401','!authoredCueV400&&!shotV377.active','vocalFramedV401','vocalPlanV401.active'],
})){
 const contents=fs.readFileSync(path.join(root,file),'utf8');for(const needle of needles)assert(contents.includes(needle),`${file}: missing ${needle}`);
}
const pkg=require('../package.json');assert.ok((Number(String(pkg.version).match(/^0\.1\.0-v(\d+)$/)?.[1]) >= 401));assert(pkg.scripts['verify:offline'].includes('test:v401'));
console.log('PASS V401 Vocal Camera Intelligence: timed vocals, roles, safety, preservation and wiring');
