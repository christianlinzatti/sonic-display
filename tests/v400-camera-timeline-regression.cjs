'use strict';
const assert=require('node:assert/strict');const fs=require('node:fs'),path=require('node:path');
const ts=require('./typescript-loader.cjs');const root=path.resolve(__dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const cache={};
function load(relative){if(cache[relative])return cache[relative];
 const js=ts.transpileModule(read('components/visualizer/'+relative+'.ts'),{fileName:relative+'.ts',compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
 const module={exports:{}};
 new Function('module','exports','require',js)(module,module.exports,id=>{
  if(id.startsWith('./'))return load(path.posix.normalize(path.posix.join(path.posix.dirname(relative),id.slice(2))));
  return require(id);
 });cache[relative]=module.exports;return module.exports;
}
const {normalizeCameraTimelineV400:normal,editCameraCuesV400:edit,newCameraCueV400:newCue,
 activeCameraCueV400:active,composeCameraTimelineV400:compose,formatCameraTimeV400:time}=load('cinematicCameraTimelineV400');
const first={...newCue(0,1),shot:'lead',leadSlot:0,transition:'cut',distance:60};
const second={...newCue(1500,2),shot:'two-shot',leadSlot:0,partnerSlot:1,transition:'smooth',transitionMs:1000};
const last={...newCue(4000,3),shot:'group',leadSlot:1,transitionMs:500};
let x=edit({enabled:true,tracks:{}},'spotify-track',12000,[last,second,first]);
assert.deepEqual(x.tracks['spotify-track'].cues.map(c=>c.atMs),[0,1500,4000]);
assert.equal(active(x,'spotify-track',0,true,false,2)?.cue.id,first.id);
assert.equal(active(x,'spotify-track',1499,true,false,2)?.cue.id,first.id);
assert.equal(active(x,'spotify-track',1500,true,false,2)?.cue.id,second.id);
assert.equal(active(x,'spotify-track',4100,true,false,2)?.cue.id,last.id);
for(const [id,progress,playing,motion] of [['wrong-track',2000,true,false],['spotify-track',-1,true,false],['spotify-track',500,false,false],['spotify-track',1200,true,true],['spotify-track',14000,true,false]]){
 assert.equal(active(x,id,progress,playing,motion,2),null,'timeline must be scoped to the playing song and motion setting');
}
assert.equal(active({...x,enabled:false},'spotify-track',1000,true,false,2),null);
assert.equal(active(x,'constructor',1500,true,false,2),null,'special object keys are never tracks');
assert.equal(active(x,'spotify-track',1500,true,false,1),null,'duet requires two performers');
assert.equal(active(x,'spotify-track',4000,true,false,1),null,'group requires two performers');
let y=normal({enabled:true,tracks:{'song':{durationMs:8000,cues:[
 {id:'a',atMs:-99,shot:'banana',leadSlot:99,partnerSlot:-1,pan:999,distance:Infinity,transition:'cut',transitionMs:99000},
 {id:'a',atMs:2000,shot:'group'},null]}}});
const scrub=y.tracks.song.cues[0];assert.equal(y.tracks.song.cues.length,1);
assert.equal(scrub.shot,'lead');assert.equal(scrub.leadSlot,3);assert.equal(scrub.partnerSlot,0);
assert.equal(scrub.pan,100);assert.equal(scrub.distance,50);assert.equal(scrub.atMs,0);assert.equal(scrub.transitionMs,3000);
assert.equal(normal({enabled:true,tracks:{'__proto__':{durationMs:5000}}}).tracks.__proto__,Object.prototype);
const long=Array.from({length:70},(_,i)=>({...newCue(i*100,i),id:'cue-'+i}));
y=edit(x,'limit',10000,long);assert.equal(y.tracks.limit.cues.length,48);
assert.equal(time(125030),'02:05.0');
const pose={x:0,y:0,z:6,targetX:0,targetY:0,targetZ:0,fov:38};
const anchors=[{slot:0,x:-1,y:0,z:0,visible:true},{slot:1,x:1,y:0,z:0,visible:true}];
const leadResult=active(x,'spotify-track',600,true,false,2);
assert.notDeepEqual(compose(pose,leadResult,anchors,false),pose);
assert.deepEqual(compose(pose,leadResult,anchors.slice(1),false),pose,'no invisible lead');
const duoResult=active(x,'spotify-track',2000,true,false,2);
assert.notDeepEqual(compose(pose,duoResult,anchors,false),pose);
assert.deepEqual(compose(pose,duoResult,anchors.slice(0,1),false),pose,'no phantom duet partner');
const groupResult=active(x,'spotify-track',5000,true,false,2);
assert.deepEqual(compose(pose,groupResult,anchors.slice(0,1),false),pose,'no phantom group');
const protectedPose=compose(pose,leadResult,anchors,true);
const unprotected=compose(pose,leadResult,anchors,false);
assert.ok(Math.abs(protectedPose.fov-pose.fov)<Math.abs(unprotected.fov-pose.fov));
const p=x.tracks['spotify-track'].cues[0];assert.equal(p.transition,'cut');
for(const [file,needles] of Object.entries({
 'types/music.ts':['avatarCameraTimelineV400'],
 'context/UiPreferencesContext.tsx':['avatarCameraTimelineV400:{enabled:false'],
 'components/visualizer/VisualizerStage.tsx':['cameraTimelineV400:preferences.avatarCameraTimelineV400'],
 'components/visualizer/StageCameraDirectorV289.tsx':['activeCameraCueV400','composeCameraTimelineV400','authoredCueV400','cameraTimelineFramedV400!==festivalFramedV394','!timelineCue?.active'],
 'components/visualizer/registry.tsx':['cameraTimelineV400?:'],
 'components/visualizer/CinematicCameraTimelinePanelV400.tsx':['useMusic','MultiAvatarCameraCanvasV399','v400-timeline-track','setPlayingPreview','editCameraCuesV400','Aktuelle Songposition'],
 'components/SettingsPanel.tsx':['CinematicCameraTimelineV400','cameraTimelineOpenV400'],
 'app/globals.css':['.v400-camera-timeline'],
 'V400-CINEMATIC-CAMERA-TIMELINE.md':['V400']
}))for(const needle of needles)assert.ok(read(file).includes(needle),file+': missing '+needle);
const pkg=JSON.parse(read('package.json'));assert.ok((Number(String(pkg.version).match(/^0\.1\.0-v(\d+)$/)?.[1]) >= 400));assert.ok(pkg.scripts['verify:offline'].includes('test:v400'));
console.log('PASS V400 – bounded per-track cues, ordering, seek/track guards, visible cast, lyric protection, editor and live camera wiring');
